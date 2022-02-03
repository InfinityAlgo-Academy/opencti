import * as R from 'ramda';
import SpriteText from 'three-spritetext';
import { truncate } from './String';
import KillChainPhase from '../resources/images/entities/kill-chain-phase_dark.svg';
import MarkingDefinition from '../resources/images/entities/marking-definition_dark.svg';
import Label from '../resources/images/entities/label_dark.svg';
import ExternalReference from '../resources/images/entities/external-reference_dark.svg';
import AttackPattern from '../resources/images/entities/attack-pattern_dark.svg';
import Campaign from '../resources/images/entities/campaign_dark.svg';
import Note from '../resources/images/entities/note_dark.svg';
import ObservedData from '../resources/images/entities/observed-data_dark.svg';
import Opinion from '../resources/images/entities/opinion_dark.svg';
import Report from '../resources/images/entities/report_dark.svg';
import CourseOfAction from '../resources/images/entities/course-of-action_dark.svg';
import Individual from '../resources/images/entities/individual_dark.svg';
import Organization from '../resources/images/entities/organization_dark.svg';
import Sector from '../resources/images/entities/sector_dark.svg';
import System from '../resources/images/entities/system_dark.svg';
import Indicator from '../resources/images/entities/indicator_dark.svg';
import Infrastructure from '../resources/images/entities/infrastructure_dark.svg';
import IntrusionSet from '../resources/images/entities/intrusion-set_dark.svg';
import City from '../resources/images/entities/city_dark.svg';
import Country from '../resources/images/entities/country_dark.svg';
import Region from '../resources/images/entities/region_dark.svg';
import Position from '../resources/images/entities/position_dark.svg';
import Malware from '../resources/images/entities/malware_dark.svg';
import ThreatActor from '../resources/images/entities/threat-actor_dark.svg';
import Tool from '../resources/images/entities/tool_dark.svg';
import Vulnerability from '../resources/images/entities/vulnerability_dark.svg';
import Incident from '../resources/images/entities/incident_dark.svg';
import StixCyberObservable from '../resources/images/entities/stix-cyber-observable_dark.svg';
import relationship from '../resources/images/entities/relationship_dark.svg';
import { itemColor } from './Colors';
import themeDark from '../components/ThemeDark';
import {
  dateFormat,
  dayEndDate,
  daysAfter,
  daysAgo,
  jsDate,
  minutesBefore,
  minutesBetweenDates,
  timestamp,
} from './Time';
import { isNone } from '../components/i18n';

const genImage = (src) => {
  const img = new Image();
  img.src = src;
  return img;
};

export const graphImages = {
  'Kill-Chain-Phase': genImage(KillChainPhase),
  'Marking-Definition': genImage(MarkingDefinition),
  'External-Reference': genImage(ExternalReference),
  Label: genImage(Label),
  'Attack-Pattern': genImage(AttackPattern),
  Campaign: genImage(Campaign),
  Note: genImage(Note),
  'Observed-Data': genImage(ObservedData),
  Opinion: genImage(Opinion),
  Report: genImage(Report),
  'Course-Of-Action': genImage(CourseOfAction),
  Individual: genImage(Individual),
  Organization: genImage(Organization),
  Sector: genImage(Sector),
  System: genImage(System),
  Indicator: genImage(Indicator),
  Infrastructure: genImage(Infrastructure),
  'Intrusion-Set': genImage(IntrusionSet),
  City: genImage(City),
  Country: genImage(Country),
  Region: genImage(Region),
  Position: genImage(Position),
  Malware: genImage(Malware),
  'Threat-Actor': genImage(ThreatActor),
  Tool: genImage(Tool),
  Vulnerability: genImage(Vulnerability),
  Incident: genImage(Incident),
  'Autonomous-System': genImage(StixCyberObservable),
  Directory: genImage(StixCyberObservable),
  'Domain-Name': genImage(StixCyberObservable),
  'Email-Addr': genImage(StixCyberObservable),
  'Email-Message': genImage(StixCyberObservable),
  'Email-Mime-Part-Type': genImage(StixCyberObservable),
  Artifact: genImage(StixCyberObservable),
  StixFile: genImage(StixCyberObservable),
  'X509-Certificate': genImage(StixCyberObservable),
  'IPv4-Addr': genImage(StixCyberObservable),
  'IPv6-Addr': genImage(StixCyberObservable),
  'Mac-Addr': genImage(StixCyberObservable),
  Mutex: genImage(StixCyberObservable),
  'Network-Traffic': genImage(StixCyberObservable),
  Process: genImage(StixCyberObservable),
  Software: genImage(StixCyberObservable),
  'User-Account': genImage(StixCyberObservable),
  Url: genImage(StixCyberObservable),
  'Windows-Registry-Key': genImage(StixCyberObservable),
  'Windows-Registry-Value-Type': genImage(StixCyberObservable),
  'X509-V3-Extensions-Type': genImage(StixCyberObservable),
  'X-OpenCTI-Cryptographic-Key': genImage(StixCyberObservable),
  'X-OpenCTI-Cryptocurrency-Wallet': genImage(StixCyberObservable),
  'X-OpenCTI-Hostname': genImage(StixCyberObservable),
  'X-OpenCTI-User-Agent': genImage(StixCyberObservable),
  'X-OpenCTI-Text': genImage(StixCyberObservable),
  relationship: genImage(relationship),
};

export const graphLevel = {
  'Kill-Chain-Phase': 1,
  'Attack-Pattern': 1,
  Campaign: 1,
  Note: 1,
  'Observed-Data': 1,
  Opinion: 1,
  Report: 1,
  'Course-Of-Action': 1,
  Individual: 1,
  Organization: 1,
  Sector: 1,
  System: 1,
  Indicator: 1,
  Infrastructure: 1,
  'Intrusion-Set': 1,
  City: 1,
  Country: 1,
  Region: 1,
  Position: 1,
  Malware: 1,
  'Threat-Actor': 1,
  Tool: 1,
  Vulnerability: 1,
  Incident: 1,
  'Autonomous-System': 1,
  Directory: 1,
  'Domain-Name': 1,
  'Email-Addr': 1,
  'Email-Message': 1,
  'Email-Mime-Part-Type': 1,
  Artifact: 1,
  StixFile: 1,
  'X509-Certificate': 1,
  'IPv4-Addr': 1,
  'IPv6-Addr': 1,
  'Mac-Addr': 1,
  Mutex: 1,
  'Network-Traffic': 1,
  Process: 1,
  Software: 1,
  'User-Account': 1,
  Url: 1,
  'Windows-Registry-Key': 1,
  'Windows-Registry-Value-Type': 1,
  'X509-V3-Extensions-Type': 1,
  'X-OpenCTI-Cryptographic-Key': 1,
  'X-OpenCTI-Cryptocurrency-Wallet': 1,
  'X-OpenCTI-Hostname': 1,
  'X-OpenCTI-User-Agent': 1,
  'X-OpenCTI-Text': 1,
  relationship: 1,
};

export const graphRawImages = {
  'Kill-Chain-Phase': KillChainPhase,
  'Marking-Definition': MarkingDefinition,
  'External-Reference': ExternalReference,
  Label,
  'Attack-Pattern': AttackPattern,
  Campaign,
  Note,
  'Observed-Data': ObservedData,
  Opinion,
  Report,
  'Course-Of-Action': CourseOfAction,
  Individual,
  Organization,
  Sector,
  System,
  Indicator,
  Infrastructure,
  'Intrusion-Set': IntrusionSet,
  City,
  Country,
  Region,
  Position,
  Malware,
  'Threat-Actor': ThreatActor,
  Tool,
  Vulnerability,
  Incident,
  'Autonomous-System': StixCyberObservable,
  Directory: StixCyberObservable,
  'Domain-Name': StixCyberObservable,
  'Email-Addr': StixCyberObservable,
  'Email-Message': StixCyberObservable,
  'Email-Mime-Part-Type': StixCyberObservable,
  Artifact: StixCyberObservable,
  StixFile: StixCyberObservable,
  'X509-Certificate': StixCyberObservable,
  'IPv4-Addr': StixCyberObservable,
  'IPv6-Addr': StixCyberObservable,
  'Mac-Addr': StixCyberObservable,
  Mutex: StixCyberObservable,
  'Network-Traffic': StixCyberObservable,
  Process: StixCyberObservable,
  Software: StixCyberObservable,
  'User-Account': StixCyberObservable,
  Url: StixCyberObservable,
  'Windows-Registry-Key': StixCyberObservable,
  'Windows-Registry-Value-Type': StixCyberObservable,
  'X509-V3-Extensions-Type': StixCyberObservable,
  'X-OpenCTI-Cryptographic-Key': StixCyberObservable,
  'X-OpenCTI-Cryptocurrency-Wallet': StixCyberObservable,
  'X-OpenCTI-Hostname': StixCyberObservable,
  'X-OpenCTI-User-Agent': StixCyberObservable,
  'X-OpenCTI-Text': StixCyberObservable,
};

export const encodeGraphData = (graphData) => Buffer.from(JSON.stringify(graphData), 'ascii').toString('base64');

export const decodeGraphData = (encodedGraphData) => {
  if (encodedGraphData) {
    const decodedGraphData = JSON.parse(
      Buffer.from(encodedGraphData, 'base64').toString('ascii'),
    );
    if (typeof decodedGraphData === 'object') {
      return decodedGraphData;
    }
  }
  return {};
};

export const defaultDate = (n) => {
  if (!n) return '';
  if (!isNone(n.start_time)) {
    return n.start_time;
  }
  if (!isNone(n.first_seen)) {
    return n.first_seen;
  }
  if (!isNone(n.first_observed)) {
    return n.first_observed;
  }
  if (!isNone(n.valid_from)) {
    return n.valid_from;
  }
  if (!isNone(n.published)) {
    return n.published;
  }
  if (!isNone(n.created)) {
    return n.created;
  }
  if (!isNone(n.created_at)) {
    return n.created_at;
  }
  return null;
};

export const defaultValue = (n, tooltip = false) => {
  if (!n) return '';
  if (tooltip) {
    return `${n.x_mitre_id ? `[${n.x_mitre_id}] ` : ''}${
      n.name
      || n.label
      || n.observable_value
      || n.attribute_abstract
      || n.opinion
      || n.value
      || n.definition
      || n.source_name
      || n.phase_name
      || (n.hashes
        && (n.hashes.MD5 || n.hashes['SHA-1'] || n.hashes['SHA-256']))
      || (n.source_ref_name
        && n.target_ref_name
        && `${truncate(n.source_ref_name, 20)} ➡️ ${truncate(
          n.target_ref_name,
          20,
        )}`)
      || n.id
      || defaultValue(R.head(R.pathOr([], ['objects', 'edges'], n))?.node)
      || 'Unknown'
    }`;
  }
  return `${n.x_mitre_id ? `[${n.x_mitre_id}] ` : ''}${
    n.name
    || n.label
    || n.observableName
    || n.observable_value
    || n.attribute_abstract
    || n.opinion
    || n.value
    || n.definition
    || n.source_name
    || n.phase_name
    || (n.hashes && (n.hashes.MD5 || n.hashes['SHA-1'] || n.hashes['SHA-256']))
    || (n.source_ref_name
      && n.target_ref_name
      && `${truncate(n.source_ref_name, 20)} ➡️ ${truncate(
        n.target_ref_name,
        20,
      )}`)
    || defaultValue(R.head(R.pathOr([], ['objects', 'edges'], n))?.node)
    || 'Unknown'
  }`;
};

export const defaultSecondaryValue = (n) => {
  if (!n) return '';
  return (
    n.description
    || n.x_opencti_description
    || n.content
    || n.entity_type
    || dateFormat(n.created_at)
  );
};

export const computeTimeRangeInterval = (objects) => {
  const elementsDates = R.map((n) => defaultDate(n), objects);
  const orderedElementsDate = R.sort(
    (a, b) => timestamp(a) - timestamp(b),
    R.filter((n) => !R.isNil(n) && !isNone(n), elementsDates),
  );
  let startDate = jsDate(daysAgo(1));
  let endDate = jsDate(dayEndDate());
  if (orderedElementsDate.length >= 1) {
    startDate = jsDate(daysAgo(1, orderedElementsDate[0]));
    endDate = jsDate(daysAfter(1, orderedElementsDate[0]));
  }
  if (orderedElementsDate.length >= 2) {
    endDate = jsDate(daysAfter(1, orderedElementsDate.slice(-1)[0]));
  }
  return [startDate, endDate];
};

export const computeTimeRangeValues = (interval, objects) => {
  const elementsDates = R.map(
    (n) => timestamp(defaultDate(n)),
    R.filter(
      (n) => n.parent_types && !n.parent_types.includes('basic-relationship'),
      objects,
    ),
  );
  const minutes = minutesBetweenDates(interval[0], interval[1]);
  const intervalInMinutes = Math.ceil(minutes / 100);
  const intervalInSecondes = intervalInMinutes * 60;
  const intervals = Array(100)
    .fill()
    .map((_, i) => timestamp(minutesBefore(minutes - i * intervalInMinutes, interval[1])));
  return R.map(
    (n) => ({
      time: n,
      index: 1,
      value: R.filter(
        (o) => o >= n && o <= n + intervalInSecondes,
        elementsDates,
      ).length,
    }),
    intervals,
  );
};

export const applyNodeFilters = (
  nodesData,
  stixCoreObjectsTypes = [],
  markedBy = [],
  createdBy = [],
  excludedStixCoreObjectsTypes = [],
  interval = [],
) => {
  const nodes = R.pipe(
    R.filter((n) => !R.includes(n.entity_type, excludedStixCoreObjectsTypes)),
    R.filter((n) => R.includes(n.entity_type, stixCoreObjectsTypes)),
    R.filter((n) => R.any((m) => R.includes(m.id, markedBy), n.markedBy)),
    R.filter((n) => R.includes(n.createdBy.id, createdBy)),
    R.filter(
      (n) => interval.length === 0
        || isNone(n.defaultDate)
        || (n.defaultDate >= interval[0] && n.defaultDate <= interval[1]),
    ),
  )(nodesData);
  return nodes;
};

export const applyLinkFilters = (
  linksData,
  markedBy = [],
  createdBy = [],
  interval = [],
) => {
  const links = R.pipe(
    R.filter((n) => R.any((m) => R.includes(m.id, markedBy), n.markedBy)),
    R.filter((n) => R.includes(n.createdBy.id, createdBy)),
    R.filter(
      (n) => interval.length === 0
        || isNone(n.defaultDate)
        || (n.defaultDate >= interval[0] && n.defaultDate <= interval[1]),
    ),
  )(linksData);
  return links;
};

export const applyFilters = (
  graphData,
  stixCoreObjectsTypes = [],
  markedBy = [],
  createdBy = [],
  excludedStixCoreObjectsTypes = [],
  interval = [],
) => {
  const nodes = applyNodeFilters(
    graphData.nodes,
    stixCoreObjectsTypes,
    markedBy,
    createdBy,
    excludedStixCoreObjectsTypes,
    interval,
  );
  const filteredLinks = applyLinkFilters(
    graphData.links,
    markedBy,
    createdBy,
    interval,
  );
  const nodeIds = R.map((n) => n.id, nodes);
  const links = R.pipe(
    R.filter(
      (n) => R.includes(n.source_id, nodeIds) && R.includes(n.target_id, nodeIds),
    ),
  )(filteredLinks);
  return {
    nodes,
    links,
  };
};

export const buildCorrelationData = (
  originalObjects,
  graphData,
  t,
  filterAdjust,
) => {
  const objects = R.map((n) => {
    let { objectMarking } = n;
    if (R.isNil(objectMarking) || R.isEmpty(objectMarking.edges)) {
      objectMarking = [
        {
          node: {
            id: 'abb8eb18-a02c-48e9-adae-08c92275c87e',
            definition: t('None'),
            definition_type: t('None'),
          },
        },
      ];
    } else {
      objectMarking = R.map((m) => m.node, objectMarking.edges);
    }
    let { createdBy } = n;
    if (R.isNil(createdBy) || R.isEmpty(createdBy)) {
      createdBy = {
        id: '0533fcc9-b9e8-4010-877c-174343cb24cd',
        name: t('None'),
      };
    }
    return {
      ...n,
      objectMarking,
      createdBy,
      markedBy: objectMarking,
    };
  }, originalObjects);
  const filteredObjects = applyNodeFilters(
    R.filter((o) => o && o.id && o.entity_type && o.reports, objects),
    [...filterAdjust.stixCoreObjectsTypes, ...['Report', 'reported-in']],
    filterAdjust.markedBy,
    filterAdjust.createdBy,
    [],
    filterAdjust.selectedTimeRangeInterval,
  );
  const thisReportLinkNodes = R.filter(
    (n) => n.reports && n.parent_types && n.reports.edges.length > 0,
    filteredObjects,
  );
  const relatedReportNodes = applyNodeFilters(
    R.pipe(
      R.map((n) => n.reports.edges),
      R.flatten,
      R.map((n) => {
        let { objectMarking } = n.node;
        if (R.isNil(objectMarking) || R.isEmpty(objectMarking.edges)) {
          objectMarking = [
            {
              node: {
                id: 'abb8eb18-a02c-48e9-adae-08c92275c87e',
                definition: t('None'),
                definition_type: t('None'),
              },
            },
          ];
        } else {
          objectMarking = R.map((m) => m.node, objectMarking.edges);
        }
        let { createdBy } = n.node;
        if (R.isNil(createdBy) || R.isEmpty(createdBy)) {
          createdBy = {
            id: '0533fcc9-b9e8-4010-877c-174343cb24cd',
            name: t('None'),
          };
        }
        return {
          ...n.node,
          objectMarking,
          createdBy,
          markedBy: objectMarking,
        };
      }),
      R.uniqBy(R.prop('id')),
      R.map((n) => (n.defaultDate ? { ...n } : { ...n, defaultDate: jsDate(defaultDate(n)) })),
    )(thisReportLinkNodes),
    [...filterAdjust.stixCoreObjectsTypes, ...['Report', 'reported-in']],
    filterAdjust.markedBy,
    filterAdjust.createdBy,
    [],
    filterAdjust.selectedTimeRangeInterval,
  );
  const links = R.pipe(
    R.map((n) => R.map(
      (e) => ({
        id: R.concat(n.id, '-', e.id),
        parent_types: ['basic-relationship', 'stix-meta-relationship'],
        entity_type: 'basic-relationship',
        relationship_type: 'reported-in',
        source: n.id,
        target: e.id,
        label: '',
        name: '',
        source_id: n.id,
        target_id: e.id,
        from: n.id,
        to: n.id,
        start_time: '',
        stop_time: '',
        defaultDate: jsDate(defaultDate(n)),
        markedBy: n.markedBy,
        createdBy: n.createdBy,
      }),
      R.filter((m) => m
        && R.includes(m.id, R.map((o) => o.node.id, n.reports.edges)))(relatedReportNodes),
    )),
    R.flatten,
  )(thisReportLinkNodes);
  const combinedNodes = R.concat(thisReportLinkNodes, relatedReportNodes);
  const nodes = R.pipe(
    R.map((n) => ({
      id: n.id,
      val: graphLevel[n.entity_type],
      name: defaultValue(n, true),
      defaultDate: jsDate(defaultDate(n)),
      label: truncate(
        defaultValue(n),
        n.entity_type === 'Attack-Pattern' ? 30 : 20,
      ),
      img: graphImages[n.entity_type],
      entity_type: n.entity_type,
      rawImg: graphRawImages[n.entity_type],
      color: n.x_opencti_color || n.color || itemColor(n.entity_type, false),
      parent_types: n.parent_types,
      isObservable: !!n.observable_value,
      markedBy: n.markedBy,
      createdBy: n.createdBy,
      fx: graphData[n.id] && graphData[n.id].x ? graphData[n.id].x : null,
      fy: graphData[n.id] && graphData[n.id].y ? graphData[n.id].y : null,
    })),
  )(combinedNodes);
  return {
    nodes,
    links,
  };
};

export const buildGraphData = (objects, graphData, t) => {
  const relationshipsIdsInNestedRelationship = R.pipe(
    R.filter(
      (n) => n.from && n.to && (n.from.relationship_type || n.to.relationship_type),
    ),
    R.map((n) => (n.from?.relationship_type ? n.from.id : n.to.id)),
  )(objects);
  const nodes = R.pipe(
    R.filter(
      (n) => !n.parent_types.includes('basic-relationship')
        || R.includes(n.id, relationshipsIdsInNestedRelationship),
    ),
    R.map((n) => R.assoc('number_keys', R.keys(n).length, n)),
    R.sortWith([R.descend(R.prop('number_keys'))]),
    R.uniqBy(R.prop('id')),
    R.map((n) => ({
      id: n.id,
      val: graphLevel[
        n.parent_types.includes('basic-relationship')
          ? 'relationship'
          : n.entity_type
      ],
      name: `${
        n.relationship_type
          ? `<strong>${t(`relationship_${n.relationship_type}`)}</strong>\n${t(
            'Created the',
          )} ${dateFormat(n.created)}\n${t('Start time')} ${
            isNone(n.start_time) ? '-' : dateFormat(n.start_time)
          }\n${t('Stop time')} ${
            isNone(n.stop_time) ? '-' : dateFormat(n.stop_time)
          }`
          : defaultValue(n, true)
      }\n${dateFormat(defaultDate(n))}`,
      defaultDate: jsDate(defaultDate(n)),
      label: n.parent_types.includes('basic-relationship')
        ? t(`relationship_${n.relationship_type}`)
        : truncate(
          defaultValue(n),
          n.entity_type === 'Attack-Pattern' ? 30 : 20,
        ),
      img: graphImages[
        n.parent_types.includes('basic-relationship')
          ? 'relationship'
          : n.entity_type
      ],
      rawImg:
        graphRawImages[
          n.parent_types.includes('basic-relationship')
            ? 'relationship'
            : n.entity_type
        ],
      color: n.x_opencti_color || n.color || itemColor(n.entity_type, false),
      parent_types: n.parent_types,
      entity_type: n.entity_type,
      relationship_type: n.relationship_type,
      fromId: n.from?.id,
      fromType: n.from?.entity_type,
      toId: n.to?.id,
      toType: n.to?.entity_type,
      isObservable: !!n.observable_value,
      markedBy:
        !R.isNil(n.objectMarking) && !R.isEmpty(n.objectMarking.edges)
          ? R.map(
            (m) => ({ id: m.node.id, definition: m.node.definition }),
            n.objectMarking.edges,
          )
          : [
            {
              id: 'abb8eb18-a02c-48e9-adae-08c92275c87e',
              definition: t('None'),
              definition_type: t('None'),
            },
          ],
      createdBy:
        !R.isNil(n.createdBy) && !R.isEmpty(n.createdBy)
          ? n.createdBy
          : { id: '0533fcc9-b9e8-4010-877c-174343cb24cd', name: t('None') },
      fx: graphData[n.id] && graphData[n.id].x ? graphData[n.id].x : null,
      fy: graphData[n.id] && graphData[n.id].y ? graphData[n.id].y : null,
    })),
  )(objects);
  const normalLinks = R.pipe(
    R.filter(
      (n) => n.parent_types.includes('basic-relationship')
        && !R.includes(n.id, relationshipsIdsInNestedRelationship)
        && n.from
        && n.to,
    ),
    R.uniqBy(R.prop('id')),
    R.map((n) => ({
      id: n.id,
      parent_types: n.parent_types,
      entity_type: n.entity_type,
      relationship_type: n.relationship_type,
      source: n.from.id,
      target: n.to.id,
      label: t(`relationship_${n.entity_type}`),
      name: `<strong>${t(`relationship_${n.entity_type}`)}</strong>\n${t(
        'Created the',
      )} ${dateFormat(n.created)}\n${t('Start time')} ${
        isNone(n.start_time) ? '-' : dateFormat(n.start_time)
      }\n${t('Stop time')} ${
        isNone(n.stop_time) ? '-' : dateFormat(n.stop_time)
      }`,
      source_id: n.from.id,
      target_id: n.to.id,
      inferred: n.is_inferred,
      defaultDate: jsDate(defaultDate(n)),
      markedBy:
        !R.isNil(n.objectMarking) && !R.isEmpty(n.objectMarking.edges)
          ? R.map(
            (m) => ({ id: m.node.id, definition: m.node.definition }),
            n.objectMarking.edges,
          )
          : [
            {
              id: 'abb8eb18-a02c-48e9-adae-08c92275c87e',
              definition: t('None'),
              definition_type: t('None'),
            },
          ],
      createdBy:
        !R.isNil(n.createdBy) && !R.isEmpty(n.createdBy)
          ? n.createdBy
          : { id: '0533fcc9-b9e8-4010-877c-174343cb24cd', name: t('None') },
    })),
  )(objects);
  const nestedLinks = R.pipe(
    R.filter((n) => R.includes(n.id, relationshipsIdsInNestedRelationship)),
    R.uniqBy(R.prop('id')),
    R.map((n) => [
      {
        id: n.id,
        parent_types: n.parent_types,
        entity_type: n.entity_type,
        relationship_type: n.relationship_type,
        inferred: n.is_inferred,
        source: n.from.id,
        target: n.id,
        label: '',
        name: '',
        source_id: n.from.id,
        target_id: n.id,
        start_time: '',
        stop_time: '',
        defaultDate: jsDate(defaultDate(n)),
        markedBy:
          !R.isNil(n.objectMarking) && !R.isEmpty(n.objectMarking.edges)
            ? R.map(
              (m) => ({ id: m.node.id, definition: m.node.definition }),
              n.objectMarking.edges,
            )
            : [
              {
                id: 'abb8eb18-a02c-48e9-adae-08c92275c87e',
                definition: t('None'),
                definition_type: t('None'),
              },
            ],
        createdBy:
          !R.isNil(n.createdBy) && !R.isEmpty(n.createdBy)
            ? n.createdBy
            : { id: '0533fcc9-b9e8-4010-877c-174343cb24cd', name: t('None') },
      },
      {
        id: n.id,
        parent_types: n.parent_types,
        entity_type: n.entity_type,
        relationship_type: n.relationship_type,
        source: n.id,
        target: n.to.id,
        label: '',
        name: '',
        source_id: n.id,
        target_id: n.to.id,
        start_time: '',
        stop_time: '',
        defaultDate: jsDate(defaultDate(n)),
        markedBy:
          !R.isNil(n.objectMarking) && !R.isEmpty(n.objectMarking.edges)
            ? R.map(
              (m) => ({ id: m.node.id, definition: m.node.definition }),
              n.objectMarking.edges,
            )
            : [
              {
                id: 'abb8eb18-a02c-48e9-adae-08c92275c87e',
                definition: t('None'),
                definition_type: t('None'),
              },
            ],
        createdBy:
          !R.isNil(n.createdBy) && !R.isEmpty(n.createdBy)
            ? n.createdBy
            : { id: '0533fcc9-b9e8-4010-877c-174343cb24cd', name: t('None') },
      },
    ]),
    R.flatten,
  )(objects);
  const links = R.concat(normalLinks, nestedLinks);
  return {
    nodes,
    links,
  };
};

export const nodePaint = (
  {
    // eslint-disable-next-line camelcase
    label,
    img,
    x,
    y,
  },
  color,
  ctx,
  selected = false,
) => {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
  ctx.fill();
  if (selected) {
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = themeDark().palette.secondary.main;
    ctx.stroke();
  }
  const size = 8;
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  ctx.font = '4px Roboto';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y + 10);
};

export const nodeAreaPaint = ({ name, x, y }, color, ctx) => {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.font = '4px Roboto';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, x, y + 10);
};

export const linkPaint = (link, ctx, color) => {
  const start = link.source;
  const end = link.target;
  if (typeof start !== 'object' || typeof end !== 'object') return;
  const textPos = Object.assign(
    ...['x', 'y'].map((c) => ({
      [c]: start[c] + (end[c] - start[c]) / 2,
    })),
  );
  const relLink = { x: end.x - start.x, y: end.y - start.y };
  let textAngle = Math.atan2(relLink.y, relLink.x);
  if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
  if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);
  const fontSize = 3;
  ctx.font = `${fontSize}px Roboto`;
  ctx.save();
  ctx.translate(textPos.x, textPos.y);
  ctx.rotate(textAngle);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(link.label, 0, 0);
  ctx.restore();
};

export const nodeThreePaint = (node, color) => {
  const sprite = new SpriteText(node.label);
  sprite.color = color;
  sprite.textHeight = 1.5;
  return sprite;
};

export const parseDomain = (data) => [
  0,
  Math.max.apply(
    null,
    data.map((entry) => entry.value),
  ),
];
