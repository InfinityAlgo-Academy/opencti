/* eslint-disable camelcase */
import * as R from 'ramda';
import { authenticateUserFromRequest, TAXIIAPI } from '../domain/user';
import { basePath, getBaseUrl } from '../config/conf';
import { AuthRequired, ForbiddenAccess, UnsupportedError } from '../config/errors';
import { STIX_EXT_OCTI } from '../types/stix-extensions';
import { findById, restAllCollections, restBuildCollection, restCollectionManifest, restCollectionStix, getCollectionById } from '../domain/taxii';
import { BYPASS, executionContext, SYSTEM_USER } from '../utils/access';

const TAXII_VERSION = 'application/taxii+json;version=2.1';

const sendJsonResponse = (res, data) => {
  res.setHeader('content-type', TAXII_VERSION);
  res.json(data);
};

const errorConverter = (e) => {
  const details = R.pipe(R.dissoc('reason'), R.dissoc('http_status'))(e.data);
  return {
    title: e.message,
    error_code: e.name,
    description: e.data?.reason,
    http_status: e.data?.http_status || 500,
    details,
  };
};
const userHaveAccess = (user) => {
  const capabilities = user.capabilities.map((c) => c.name);
  return capabilities.includes(BYPASS) || capabilities.includes(TAXIIAPI);
};
const extractUserFromRequest = async (context, req, res) => {
  // noinspection UnnecessaryLocalVariableJS
  const user = await authenticateUserFromRequest(context, req, res);
  if (!user) {
    res.setHeader('WWW-Authenticate', 'Basic, Bearer');
    throw AuthRequired();
  }
  if (!userHaveAccess(user)) throw ForbiddenAccess();
  return user;
};
const rebuildParamsForObject = (id, req) => {
  // Rebuild options
  const { added_after, limit, next, match = {} } = req.query;
  const { spec_version, version } = match;
  const argsMatch = { id, spec_version, version };
  return { added_after, limit, next, match: argsMatch };
};
const getUpdatedAt = (obj) => {
  return obj?.extensions?.[STIX_EXT_OCTI]?.updated_at;
};

const extractUserAndCollection = async (context, req, res, id) => {
  const findCollection = await findById(context, SYSTEM_USER, id);
  if (!findCollection) {
    throw ForbiddenAccess();
  }
  if (findCollection.taxii_public) {
    return { user: SYSTEM_USER, collection: findCollection };
  }
  const authUser = await extractUserFromRequest(context, req, res);
  const userCollection = await getCollectionById(context, authUser, id);
  return { user: authUser, collection: userCollection };
};

const initTaxiiApi = (app) => {
  // Discovery api
  app.get(`${basePath}/taxii2`, async (req, res) => {
    try {
      const context = executionContext('taxii');
      await extractUserFromRequest(context, req, res);
      const discovery = {
        title: 'OpenCTI TAXII Server',
        description: 'This TAXII Server exposes OpenCTI data through taxii protocol',
        default: `${getBaseUrl(req)}/taxii2/root`,
        api_roots: [`${getBaseUrl(req)}/taxii2/root`],
      };
      sendJsonResponse(res, discovery);
    } catch (e) {
      const errorDetail = errorConverter(e);
      res.status(errorDetail.http_status).send(errorDetail);
    }
  });
  // Root api
  app.get(`${basePath}/taxii2/root`, async (req, res) => {
    try {
      const context = executionContext('taxii');
      await extractUserFromRequest(context, req, res);
      const rootContent = {
        title: 'OpenCTI TAXII Server',
        description: 'A global and natively segregate taxii root',
        max_content_length: 100 * 1024 * 1024, // '100mb'
        versions: [TAXII_VERSION],
      };
      sendJsonResponse(res, rootContent);
    } catch (e) {
      const errorDetail = errorConverter(e);
      res.status(errorDetail.http_status).send(errorDetail);
    }
  });
  // Collection api
  app.get(`${basePath}/taxii2/root/collections`, async (req, res) => {
    try {
      const context = executionContext('taxii');
      const user = await extractUserFromRequest(context, req, res);
      const collections = await restAllCollections(context, user);
      sendJsonResponse(res, { collections });
    } catch (e) {
      const errorDetail = errorConverter(e);
      res.status(errorDetail.http_status).send(errorDetail);
    }
  });
  app.get(`${basePath}/taxii2/root/collections/:id`, async (req, res) => {
    const { id } = req.params;
    try {
      const context = executionContext('taxii');
      const { collection } = await extractUserAndCollection(context, req, res, id);
      sendJsonResponse(res, restBuildCollection(collection));
    } catch (e) {
      const errorDetail = errorConverter(e);
      res.status(errorDetail.http_status).send(errorDetail);
    }
  });
  app.get(`${basePath}/taxii2/root/collections/:id/manifest`, async (req, res) => {
    const { id } = req.params;
    try {
      const context = executionContext('taxii');
      const { user, collection } = await extractUserAndCollection(context, req, res, id);
      const manifest = await restCollectionManifest(context, user, collection, req.query);
      res.set('X-TAXII-Date-Added-First', R.head(manifest.objects)?.version);
      res.set('X-TAXII-Date-Added-Last', R.last(manifest.objects)?.version);
      sendJsonResponse(res, manifest);
    } catch (e) {
      const errorDetail = errorConverter(e);
      res.status(errorDetail.http_status).send(errorDetail);
    }
  });
  app.get(`${basePath}/taxii2/root/collections/:id/objects`, async (req, res) => {
    const { id } = req.params;
    try {
      const context = executionContext('taxii');
      const { user, collection } = await extractUserAndCollection(context, req, res, id);
      const stix = await restCollectionStix(context, user, collection, req.query);
      res.set('X-TAXII-Date-Added-First', getUpdatedAt(R.head(stix.objects)));
      res.set('X-TAXII-Date-Added-Last', getUpdatedAt(R.last(stix.objects)));
      sendJsonResponse(res, stix);
    } catch (e) {
      const errorDetail = errorConverter(e);
      res.status(errorDetail.http_status).send(errorDetail);
    }
  });
  app.get(`${basePath}/taxii2/root/collections/:id/objects/:object_id`, async (req, res) => {
    const { id, object_id } = req.params;
    try {
      const context = executionContext('taxii');
      const { user, collection } = await extractUserAndCollection(context, req, res, id);
      const args = rebuildParamsForObject(object_id, req);
      const stix = await restCollectionStix(context, user, collection, args);
      res.set('X-TAXII-Date-Added-First', getUpdatedAt(R.head(stix.objects)));
      res.set('X-TAXII-Date-Added-Last', getUpdatedAt(R.last(stix.objects)));
      sendJsonResponse(res, stix);
    } catch (e) {
      const errorDetail = errorConverter(e);
      res.status(errorDetail.http_status).send(errorDetail);
    }
  });
  app.get(`${basePath}/taxii2/root/collections/:id/objects/:object_id/versions`, async (req, res) => {
    const { id, object_id } = req.params;
    try {
      const context = executionContext('taxii');
      const { user, collection } = await extractUserAndCollection(context, req, res, id);
      const args = rebuildParamsForObject(object_id, req);
      const stix = await restCollectionStix(context, user, collection, args);
      const data = R.head(stix.objects);
      const updatedAt = getUpdatedAt(data);
      res.set('X-TAXII-Date-Added-First', updatedAt);
      res.set('X-TAXII-Date-Added-Last', updatedAt);
      const versions = data ? [updatedAt] : [];
      sendJsonResponse(res, { versions });
    } catch (e) {
      const errorDetail = errorConverter(e);
      res.status(errorDetail.http_status).send(errorDetail);
    }
  });
  // Unsupported api
  app.get(`${basePath}/taxii2/root/status/:status_id`, async (req, res) => {
    const e = UnsupportedError('Unsupported operation');
    const errorDetail = errorConverter(e);
    res.status(errorDetail.http_status).send(errorDetail);
  });
  app.post(`${basePath}/taxii2/root/collections/:id/objects`, async (req, res) => {
    const e = UnsupportedError('Unsupported operation');
    const errorDetail = errorConverter(e);
    res.status(errorDetail.http_status).send(errorDetail);
  });
  app.delete(`${basePath}/taxii2/root/collections/:id/objects/:object_id`, async (req, res) => {
    const e = UnsupportedError('Unsupported operation');
    const errorDetail = errorConverter(e);
    res.status(errorDetail.http_status).send(errorDetail);
  });
};

export default initTaxiiApi;
