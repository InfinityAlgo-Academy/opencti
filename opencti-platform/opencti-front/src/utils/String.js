import * as R from 'ramda';
import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import { APP_BASE_PATH } from '../relay/environment';

export const truncate = (str, limit) => {
  if (str === undefined || str === null || str.length <= limit) {
    return str;
  }
  const trimmedStr = str.substr(0, limit);
  if (!trimmedStr.includes(' ')) {
    return `${trimmedStr}...`;
  }
  return `${trimmedStr.substr(
    0,
    Math.min(trimmedStr.length, trimmedStr.lastIndexOf(' ')),
  )}...`;
};

export const adaptFieldValue = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (R.isNil(value)) {
    return '';
  }
  return value.toString();
};

export const pascalize = (s) => s.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase());

export const convertFromStixType = (s) => {
  if (!s) {
    return s;
  }
  let type = pascalize(s);
  if (type.includes('Opencti')) {
    type = type.replaceAll('Opencti', 'OpenCTI');
  }
  if (type.includes('Ipv')) {
    type = type.replaceAll('Ipv', 'IPv');
  }
  if (type === 'File' || type === 'Stixfile') {
    return 'StixFile';
  }
  return type;
};

export const convertToStixType = (type) => {
  if (!type) {
    return type;
  }
  if (type === 'Stixfile') {
    return 'file';
  }
  if (['Sector', 'Organization', 'Individual', 'System'].includes(type)) {
    return 'identity';
  }
  if (['Region', 'Country', 'City', 'Position'].includes(type)) {
    return 'location';
  }
  return type.toLowerCase();
};

export const isValidStixBundle = (bundle) => {
  try {
    const data = JSON.parse(bundle);
    return !!(data.objects && data.objects.length > 0);
  } catch (e) {
    return false;
  }
};

export const toB64 = (str) => window.btoa(unescape(encodeURIComponent(str)));

export const fromB64 = (str) => decodeURIComponent(escape(window.atob(str)));

export const uniqWithByFields = R.curry((fields, data) => R.uniqWith(R.allPass(R.map(R.eqProps)(fields)))(data));

export const renderObservableValue = (observable) => {
  switch (observable.entity_type) {
    case 'IPv4-Addr':
    case 'IPv6-Addr':
      if ((observable.countries?.edges ?? []).length > 0) {
        const country = R.head(observable.countries.edges).node;
        return (
          <div>
            <div style={{ float: 'left', paddingTop: 2 }}>
              <Tooltip title={country.name}>
                <img
                  style={{ width: 20 }}
                  src={`${APP_BASE_PATH}/static/flags/4x3/${R.head(
                    country.x_opencti_aliases.filter((n) => n.length === 2),
                  )}.svg`}
                  alt={country.name}
                />
              </Tooltip>
            </div>
            <div style={{ float: 'left', marginLeft: 10 }}>
              {observable.observable_value}
            </div>
          </div>
        );
      }
      return observable.observable_value;
    default:
      return observable.observable_value;
  }
};
