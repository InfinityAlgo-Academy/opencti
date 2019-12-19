import moment from 'moment/moment';
import { head, last, map, mapObjIndexed, pipe, values } from 'ramda';
import { offsetToCursor } from 'graphql-relay';
import { PythonShell } from 'python-shell';
import { logger } from '../config/conf';
import { connectorsForEnrichment } from '../domain/connector';
import { createWork } from '../domain/work';
import { pushToConnector } from './rabbitmq';

export const fillTimeSeries = (startDate, endDate, interval, data) => {
  const startDateParsed = moment(startDate);
  const endDateParsed = moment(endDate);
  let dateFormat = null;

  switch (interval) {
    case 'year':
      dateFormat = 'YYYY';
      break;
    case 'month':
      dateFormat = 'YYYY-MM';
      break;
    default:
      dateFormat = 'YYYY-MM-DD';
  }

  const elementsOfInterval = endDateParsed.diff(startDateParsed, `${interval}s`, false);

  const newData = [];
  for (let i = 0; i <= elementsOfInterval; i += 1) {
    let dataValue = 0;
    for (let j = 0; j < data.length; j += 1) {
      if (data[j].date === startDateParsed.format(dateFormat)) {
        dataValue = data[j].value;
      }
    }
    newData[i] = {
      date: startDateParsed.startOf(interval).format(),
      value: dataValue
    };
    startDateParsed.add(1, `${interval}s`);
  }
  return newData;
};

export const randomKey = number => {
  let key = '';
  for (let i = 0; i < number; i += 1) {
    key += Math.floor(Math.random() * 10).toString();
  }
  return key;
};

/**
 * Pure building of pagination expected format.
 * @param first
 * @param offset
 * @param instances
 * @param globalCount
 * @returns {{edges: *, pageInfo: *}}
 */
export const buildPagination = (first, offset, instances, globalCount) => {
  const edges = pipe(
    mapObjIndexed((record, key) => {
      const { node } = record;
      const { relation } = record;
      const nodeOffset = offset + parseInt(key, 10) + 1;
      return { node, relation, cursor: offsetToCursor(nodeOffset) };
    }),
    values
  )(instances);
  const hasNextPage = first + offset < globalCount;
  const hasPreviousPage = offset > 0;
  const startCursor = edges.length > 0 ? head(edges).cursor : '';
  const endCursor = edges.length > 0 ? last(edges).cursor : '';
  const pageInfo = {
    startCursor,
    endCursor,
    hasNextPage,
    hasPreviousPage,
    globalCount
  };
  return { edges, pageInfo };
};

export const execPython3 = async (scriptPath, scriptName, args) => {
  return new Promise(async (resolve, reject) => {
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      scriptPath,
      args
    };
    await PythonShell.run(scriptName, options, (err, results) => {
      if (err) {
        reject(new Error(`Python3 is missing or script not found: ${err}`));
      }
      resolve(JSON.parse(results[0]));
    });
  });
};

export const checkPythonStix2 = async () => {
  try {
    const result = await execPython3('./src/utils/stix2', 'stix2_create_pattern.py', ['check', 'health']);
    if (result.status !== 'success') {
      throw new Error('Python3 with STIX2 module is missing');
    }
  } catch (err) {
    throw new Error('Python3 with STIX2 module is missing');
  }
};

export const createStixPattern = async (observableType, observableValue) => {
  try {
    const result = await execPython3('./src/utils/stix2', 'stix2_create_pattern.py', [observableType, observableValue]);
    if (result.status === 'success') {
      return result.data;
    }
    return null;
  } catch (err) {
    logger.error('[Python3] createStixPattern error > ', err);
    return null;
  }
};

export const extractObservables = async pattern => {
  try {
    const result = await execPython3('./src/utils/stix2', 'stix2_extract_observables.py', [pattern]);
    if (result.status === 'success') {
      return result.data;
    }
    return null;
  } catch (err) {
    logger.error('[Python3] extractObservables error > ', err);
    return null;
  }
};

export const askEnrich = async (observableId, scope) => {
  const targetConnectors = await connectorsForEnrichment(scope, true);
  // Create job for
  const workList = await Promise.all(
    map(
      connector =>
        createWork(connector, observableId).then(({ job, work }) => ({
          connector,
          job,
          work
        })),
      targetConnectors
    )
  );
  // Send message to all correct connectors queues
  await Promise.all(
    map(data => {
      const { connector, work, job } = data;
      const message = {
        work_id: work.internal_id_key,
        job_id: job.internal_id_key,
        entity_id: observableId
      };
      return pushToConnector(connector, message);
    }, workList)
  );
  return workList;
};
