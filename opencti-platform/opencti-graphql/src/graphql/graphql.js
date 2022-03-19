import { ApolloServer, UserInputError } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { formatError as apolloFormatError } from 'apollo-errors';
import { dissocPath } from 'ramda';
import ConstraintDirectiveError from 'graphql-constraint-directive/lib/error';
import createSchema from './schema';
import { DEV_MODE } from '../config/conf';
import { authenticateUserFromRequest, userWithOrigin } from '../domain/user';
import { ValidationError } from '../config/errors';
import loggerPlugin from './loggerPlugin';
import httpResponsePlugin from './httpResponsePlugin';

const buildContext = (user, req, res) => {
  const workId = req.headers['opencti-work-id'];
  if (user) {
    return { req, res, user: userWithOrigin(req, user), workId };
  }
  return { req, res, user, workId };
};
const createApolloServer = () => {
  const schema = createSchema();
  const playgroundPlugin = ApolloServerPluginLandingPageGraphQLPlayground();
  const apolloServer = new ApolloServer({
    schema,
    introspection: true,
    async context({ req, res, connection }) {
      // For websocket connection.
      if (connection) {
        return { req, res, user: connection.context.user };
      }
      // Get user session from request
      const user = await authenticateUserFromRequest(req, res);
      // Return the context
      return buildContext(user, req, res);
    },
    tracing: DEV_MODE,
    plugins: [playgroundPlugin, loggerPlugin, httpResponsePlugin],
    formatError: (error) => {
      let e = apolloFormatError(error);
      if (e instanceof UserInputError) {
        if (e.originalError instanceof ConstraintDirectiveError) {
          const { originalError } = e.originalError;
          const { fieldName } = originalError;
          const ConstraintError = ValidationError(fieldName, originalError);
          e = apolloFormatError(ConstraintError);
        }
      }
      // Remove the exception stack in production.
      return DEV_MODE ? e : dissocPath(['extensions', 'exception'], e);
    },
  });
  return { schema, apolloServer };
};

export default createApolloServer;
