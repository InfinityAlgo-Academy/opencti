import { Environment, RecordSource, Store } from 'relay-runtime';
// eslint-disable-next-line import/no-extraneous-dependencies
import { installRelayDevTools } from 'relay-devtools';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { execute } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { Subject, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import React, { Component } from 'react';
import {
  commitMutation as CM,
  QueryRenderer as QR,
  requestSubscription as RS,
  fetchQuery as FQ,
} from 'react-relay';
import * as PropTypes from 'prop-types';
import {
  map, isEmpty, difference, filter, split, pathOr,
} from 'ramda';
import { urlMiddleware, RelayNetworkLayer } from 'react-relay-network-modern';
import uploadMiddleware from './uploadMiddleware';

// Dev tools
export const IN_DEV_MODE = process.env.NODE_ENV === 'development';
console.log('IN_DEV_MODE', IN_DEV_MODE);
if (IN_DEV_MODE) installRelayDevTools();

// Service bus
const MESSENGER$ = new Subject().pipe(debounce(() => timer(500)));
export const MESSAGING$ = {
  messages: MESSENGER$,
  notifyError: (text) => MESSENGER$.next([{ type: 'error', text }]),
  notifySuccess: (text) => MESSENGER$.next([{ type: 'message', text }]),
  redirect: new Subject(),
};

// Default application exception.
export class ApplicationError extends Error {
  constructor(errors) {
    super();
    this.data = errors;
  }
}

// Get access providers from backend.
export const ACCESS_PROVIDERS = split(
  ',',
  IN_DEV_MODE ? process.env.REACT_APP_ACCESS_PROVIDERS : window.ACCESS_PROVIDERS,
);

// Network
const envBasePath = isEmpty(window.BASE_PATH) || window.BASE_PATH.startsWith('/')
  ? window.BASE_PATH
  : `/${window.BASE_PATH}`;
export const APP_BASE_PATH = IN_DEV_MODE ? '' : envBasePath;

// Subscription
let networkSubscriptions = null;
export const WS_ACTIVATED = IN_DEV_MODE
  ? process.env.REACT_APP_WS_ACTIVATED === 'true'
  : window.WS_ACTIVATED === 'true';
if (WS_ACTIVATED) {
  const loc = window.location;
  const isSecure = loc.protocol === 'https:' ? 's' : '';
  const subscriptionClient = new SubscriptionClient(
    `ws${isSecure}://${loc.host}${APP_BASE_PATH}/graphql`,
    {
      reconnect: true,
    },
  );
  const subscriptionLink = new WebSocketLink(subscriptionClient);
  networkSubscriptions = (operation, variables) => execute(subscriptionLink, {
    query: operation.text,
    variables,
  });
}

const network = new RelayNetworkLayer(
  [
    urlMiddleware({
      url: `${APP_BASE_PATH}/graphql`,
      credentials: 'same-origin',
    }),
    uploadMiddleware(),
  ],
  { subscribeFn: networkSubscriptions },
);

const store = new Store(new RecordSource());
// Activate the read from store then network
// store.holdGC();
export const environment = new Environment({
  network,
  store,
});

// Components
export class QueryRenderer extends Component {
  render() {
    const {
      variables, query, render, managedErrorTypes,
    } = this.props;
    return (
      <QR
        environment={environment}
        query={query}
        variables={variables}
        fetchPolicy="network-only"
        render={(data) => {
          const { error } = data;
          const types = error ? map((e) => e.name, error) : [];
          const unmanagedErrors = difference(types, managedErrorTypes || []);
          if (!isEmpty(unmanagedErrors)) throw new ApplicationError(error);
          return render(data);
        }}
      />
    );
  }
}
QueryRenderer.propTypes = {
  managedErrorTypes: PropTypes.array,
  variables: PropTypes.object,
  render: PropTypes.func,
  query: PropTypes.func,
};

// Relay functions
export const commitMutation = ({
  mutation,
  variables,
  updater,
  optimisticUpdater,
  optimisticResponse,
  onCompleted,
  onError,
  setSubmitting,
}) => CM(environment, {
  mutation,
  variables,
  updater,
  optimisticUpdater,
  optimisticResponse,
  onCompleted,
  onError: (error) => {
    if (setSubmitting) setSubmitting(false);
    if (error && error.res && error.res.errors) {
      const authRequired = filter(
        (e) => e.data.type === 'authentication',
        error.res.errors,
      );
      if (!isEmpty(authRequired)) {
        MESSAGING$.redirect.next('/login');
      } else {
        const messages = map(
          (e) => ({
            type: 'error',
            text: pathOr(e.message, ['data', 'details'], e),
          }),
          error.res.errors,
        );
        MESSAGING$.messages.next(messages);
        if (onError) onError(error);
      }
    }
  },
});

const deactivateSubscription = { dispose: () => undefined };
// eslint-disable-next-line max-len
export const requestSubscription = (args) => (WS_ACTIVATED ? RS(environment, args) : deactivateSubscription);

export const fetchQuery = (query, args) => FQ(environment, query, args);
