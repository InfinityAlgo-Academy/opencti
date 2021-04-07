/* eslint-disable camelcase */
import express from 'express';
import * as R from 'ramda';
// noinspection NodeCoreCodingAssistance
import { readFileSync } from 'fs';
// noinspection NodeCoreCodingAssistance
import path from 'path';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import nconf from 'nconf';
import RateLimit from 'express-rate-limit';
import sanitize from 'sanitize-filename';
import contentDisposition from 'content-disposition';
import { basePath, DEV_MODE, logger } from './config/conf';
import passport from './config/providers';
import { authenticateUser } from './domain/user';
import { downloadFile, loadFile } from './database/minio';
import { checkSystemDependencies } from './initialization';
import { getSettings } from './domain/settings';
import createSeeMiddleware from './graphql/sseMiddleware';
import initTaxiiApi from './taxiiApi';
import { initializeSession } from './database/session';

const onHealthCheck = () => checkSystemDependencies().then(() => getSettings());

const createApp = async (apolloServer, broadcaster) => {
  const appSessionHandler = initializeSession();
  const limiter = new RateLimit({
    windowMs: nconf.get('app:rate_protection:time_window') * 1000, // seconds
    max: nconf.get('app:rate_protection:max_requests'),
    handler: (req, res /* , next */) => {
      res.status(429).send({ message: 'Too many requests, please try again later.' });
    },
  });
  const scriptSrc = ["'self'", "'unsafe-inline'", 'http://cdn.jsdelivr.net/npm/@apollographql/'];
  if (DEV_MODE) {
    scriptSrc.push("'unsafe-eval'");
  }
  const securityMiddleware = helmet({
    expectCt: { enforce: true, maxAge: 30 },
    referrerPolicy: { policy: 'unsafe-url' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc,
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'http://cdn.jsdelivr.net/npm/@apollographql/',
          'https://fonts.googleapis.com/',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com/'],
        imgSrc: ["'self'", 'data:', 'https://*', 'http://*'],
        connectSrc: ["'self'", 'wss://*', 'ws://*'],
        objectSrc: ["'none'"],
      },
    },
  });
  // Init the http server
  const app = express();
  app.use(limiter);
  if (DEV_MODE) {
    app.set('json spaces', 2);
  }
  app.use(securityMiddleware);
  app.use(compression({}));

  // -- Generated CSS with correct base path
  app.get(`${basePath}/static/css/*`, (req, res) => {
    const cssFileName = R.last(req.url.split('/'));
    const data = readFileSync(path.join(__dirname, `../public/static/css/${sanitize(cssFileName)}`), 'utf8');
    const withBasePath = data.replace(/%BASE_PATH%/g, basePath);
    res.header('Content-Type', 'text/css');
    res.send(withBasePath);
  });
  app.use(`${basePath}/static`, express.static(path.join(__dirname, '../public/static')));

  app.use(appSessionHandler.session);
  // app.use(refreshSessionMiddleware);
  apolloServer.applyMiddleware({ app, cors: false, onHealthCheck, path: `${basePath}/graphql` });
  app.use(bodyParser.json({ limit: '100mb' }));

  let seeMiddleware;
  if (broadcaster) {
    seeMiddleware = createSeeMiddleware(broadcaster);
    seeMiddleware.applyMiddleware({ app });
  }

  // -- Init Taxii rest api
  initTaxiiApi(app);

  // -- File download
  app.get(`${basePath}/storage/get/:file(*)`, async (req, res) => {
    const auth = await authenticateUser(req);
    if (!auth) res.sendStatus(403);
    const { file } = req.params;
    const stream = await downloadFile(file);
    res.attachment(file);
    stream.pipe(res);
  });

  // -- File view
  app.get(`${basePath}/storage/view/:file(*)`, async (req, res) => {
    const auth = await authenticateUser(req);
    if (!auth) res.sendStatus(403);
    const { file } = req.params;
    const data = await loadFile(file);
    res.setHeader('Content-disposition', contentDisposition(data.name, { type: 'inline' }));
    res.setHeader('Content-type', data.metaData.mimetype);
    const stream = await downloadFile(file);
    stream.pipe(res);
  });

  // -- Passport login
  app.get(`${basePath}/auth/:provider`, (req, res, next) => {
    const { provider } = req.params;
    req.session.referer = req.headers.referer;
    passport.authenticate(provider, {}, () => {})(req, res, next);
  });

  // -- Passport callback
  const urlencodedParser = bodyParser.urlencoded({ extended: true });
  app.get(`${basePath}/auth/:provider/callback`, urlencodedParser, passport.initialize({}), (req, res, next) => {
    const { provider } = req.params;
    passport.authenticate(provider, {}, async (err, token) => {
      if (err || !token) {
        return res.redirect(`/dashboard?message=${err?.message}`);
      }
      // noinspection UnnecessaryLocalVariableJS
      await authenticateUser(req, token.uuid);
      const { referer } = req.session;
      req.session.referer = null;
      return res.redirect(referer);
    })(req, res, next);
  });

  // Other routes - Render index.html
  app.get('*', (req, res) => {
    const data = readFileSync(`${__dirname}/../public/index.html`, 'utf8');
    const withOptionValued = data.replace(/%BASE_PATH%/g, basePath);
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    return res.send(withOptionValued);
  });

  // Error handling
  app.use((err, req, res, next) => {
    logger.error(`[EXPRESS] Error http call`, { error: err });
    res.redirect('/');
    next();
  });
  return { app, seeMiddleware };
};

export default createApp;
