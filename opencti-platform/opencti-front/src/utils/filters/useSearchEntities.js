import * as R from 'ramda';
import { useTheme } from '@mui/styles';
import { useState } from 'react';
import { graphql } from 'react-relay';
import { fetchQuery } from '../../relay/environment';
import {
  identitySearchCreatorsSearchQuery,
  identitySearchIdentitiesSearchQuery,
} from '../../private/components/common/identities/IdentitySearch';
import { stixDomainObjectsLinesSearchQuery } from '../../private/components/common/stix_domain_objects/StixDomainObjectsLines';
import { defaultValue } from '../Graph';
import { markingDefinitionsLinesSearchQuery } from '../../private/components/settings/marking_definitions/MarkingDefinitionsLines';
import { killChainPhasesLinesSearchQuery } from '../../private/components/settings/kill_chain_phases/KillChainPhasesLines';
import { labelsSearchQuery } from '../../private/components/settings/LabelsQuery';
import { attributesSearchQuery } from '../../private/components/settings/AttributesQuery';
import { statusFieldStatusesSearchQuery } from '../../private/components/common/form/StatusField';
import { useFormatter } from '../../components/i18n';
import { vocabCategoriesQuery } from '../hooks/useVocabularyCategory';
import { vocabularySearchQuery } from '../../private/components/settings/VocabularyQuery';

const filtersAllTypesQuery = graphql`
  query useSearchEntitiesAllTypesQuery {
    scoTypes: subTypes(type: "Stix-Cyber-Observable") {
      edges {
        node {
          id
          label
        }
      }
    }
    sdoTypes: subTypes(type: "Stix-Domain-Object") {
      edges {
        node {
          id
          label
        }
      }
    }
    sroTypes: subTypes(type: "stix-core-relationship") {
      edges {
        node {
          id
          label
        }
      }
    }
  }
`;

const filtersStixCoreObjectsSearchQuery = graphql`
  query useSearchEntitiesStixCoreObjectsSearchQuery(
    $search: String
    $types: [String]
    $count: Int
    $filters: [StixCoreObjectsFiltering]
  ) {
    stixCoreObjects(
      search: $search
      types: $types
      first: $count
      filters: $filters
    ) {
      edges {
        node {
          id
          entity_type
          ... on AttackPattern {
            name
            description
            x_mitre_id
          }
          ... on Note {
            attribute_abstract
            content
          }
          ... on ObservedData {
            first_observed
            last_observed
          }
          ... on Opinion {
            opinion
          }
          ... on Report {
            name
          }
          ... on Grouping {
            name
          }
          ... on Campaign {
            name
            description
          }
          ... on CourseOfAction {
            name
            description
          }
          ... on Individual {
            name
            description
          }
          ... on Organization {
            name
            description
          }
          ... on Sector {
            name
            description
          }
          ... on System {
            name
            description
          }
          ... on Indicator {
            name
            description
          }
          ... on Infrastructure {
            name
            description
          }
          ... on IntrusionSet {
            name
            description
          }
          ... on Position {
            name
            description
          }
          ... on City {
            name
            description
          }
          ... on Country {
            name
            description
          }
          ... on Region {
            name
            description
          }
          ... on Malware {
            name
            description
          }
          ... on ThreatActor {
            name
            description
          }
          ... on Tool {
            name
            description
          }
          ... on Vulnerability {
            name
            description
          }
          ... on Incident {
            name
            description
          }
          ... on Event {
            name
            description
          }
          ... on Channel {
            name
            description
          }
          ... on Narrative {
            name
            description
          }
          ... on DataComponent {
            name
          }
          ... on DataSource {
            name
          }
          ... on Language {
            name
          }
          ... on StixCyberObservable {
            observable_value
          }
          createdBy {
            ... on Identity {
              id
              name
              entity_type
            }
          }
          objectMarking {
            edges {
              node {
                definition
              }
            }
          }
        }
      }
    }
  }
`;

const useSearchEntities = ({
  availableEntityTypes,
  availableRelationshipTypes,
  searchScope,
  setInputValues,
  allEntityTypes,
}) => {
  const [entities, setEntities] = useState({});
  const { t } = useFormatter();
  const theme = useTheme();
  const unionSetEntities = (key, newEntities) => setEntities((c) => ({
    ...c,
    [key]: [...newEntities, ...(c[key] ?? [])].filter(
      ({ value, group }, index, arr) => arr.findIndex((v) => v.value === value && v.group === group) === index,
    ),
  }));
  let entitiesTypes = [];
  const searchEntities = (filterKey, event) => {
    const baseScores = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const scores = [
      '0',
      '10',
      '20',
      '30',
      '40',
      '50',
      '60',
      '70',
      '80',
      '90',
      '100',
    ];
    const confidences = ['0', '15', '50', '75', '85'];
    const likelihoods = ['0', '15', '50', '75', '85'];
    if (!event) {
      return;
    }
    if (event.target.value !== 0) {
      setInputValues((c) => ({
        ...c,
        [filterKey]: event.target.value,
      }));
    }
    switch (filterKey) {
      case 'toSightingId':
        fetchQuery(identitySearchIdentitiesSearchQuery, {
          types: ['Identity'],
          search: event.target.value !== 0 ? event.target.value : '',
          first: 10,
        })
          .toPromise()
          .then((data) => {
            const createdByEntities = R.pipe(
              R.pathOr([], ['identities', 'edges']),
              R.map((n) => ({
                label: n.node.name,
                value: n.node.id,
                type: n.node.entity_type,
              })),
            )(data);
            unionSetEntities('toSightingId', createdByEntities);
          });
        break;
      case 'creator':
        fetchQuery(identitySearchCreatorsSearchQuery, {
          search: event.target.value !== 0 ? event.target.value : '',
          first: 10,
        })
          .toPromise()
          .then((data) => {
            const creators = R.pipe(
              R.pathOr([], ['creators', 'edges']),
              R.map((n) => ({
                label: n.node.name,
                value: n.node.id,
                type: 'Individual',
              })),
            )(data);
            unionSetEntities('creator', creators);
          });
        break;
      case 'createdBy':
        fetchQuery(identitySearchIdentitiesSearchQuery, {
          types: ['Organization', 'Individual', 'System'],
          search: event.target.value !== 0 ? event.target.value : '',
          first: 10,
        })
          .toPromise()
          .then((data) => {
            const createdByEntities = R.pipe(
              R.pathOr([], ['identities', 'edges']),
              R.map((n) => ({
                label: n.node.name,
                value: n.node.id,
                type: n.node.entity_type,
              })),
            )(data);
            unionSetEntities('createdBy', createdByEntities);
          });
        break;
      case 'sightedBy':
        fetchQuery(stixDomainObjectsLinesSearchQuery, {
          types: [
            'Sector',
            'Organization',
            'Individual',
            'Region',
            'Country',
            'City',
          ],
          search: event.target.value !== 0 ? event.target.value : '',
          count: 10,
        })
          .toPromise()
          .then((data) => {
            const sightedByEntities = R.pipe(
              R.pathOr([], ['stixDomainObjects', 'edges']),
              R.map((n) => ({
                label: n.node.name,
                value: n.node.id,
                type: n.node.entity_type,
              })),
            )(data);
            unionSetEntities('sightedBy', sightedByEntities);
          });
        break;
      case 'elementId':
        fetchQuery(filtersStixCoreObjectsSearchQuery, {
          types: (searchScope && searchScope.fromId) || ['Stix-Core-Object'],
          search: event.target.value !== 0 ? event.target.value : '',
          count: 50,
        })
          .toPromise()
          .then((data) => {
            const elementIdEntities = R.pipe(
              R.pathOr([], ['stixCoreObjects', 'edges']),
              R.map((n) => ({
                label: defaultValue(n.node),
                value: n.node.id,
                type: n.node.entity_type,
              })),
            )(data);
            unionSetEntities('elementId', elementIdEntities);
          });
        break;
      case 'fromId':
        fetchQuery(filtersStixCoreObjectsSearchQuery, {
          types: (searchScope && searchScope.fromId) || ['Stix-Core-Object'],
          search: event.target.value !== 0 ? event.target.value : '',
          count: 50,
        })
          .toPromise()
          .then((data) => {
            const fromIdEntities = R.pipe(
              R.pathOr([], ['stixCoreObjects', 'edges']),
              R.map((n) => ({
                label: defaultValue(n.node),
                value: n.node.id,
                type: n.node.entity_type,
              })),
            )(data);
            unionSetEntities('fromId', fromIdEntities);
          });
        break;
      case 'toId':
        fetchQuery(filtersStixCoreObjectsSearchQuery, {
          types: (searchScope && searchScope.toId) || ['Stix-Core-Object'],
          search: event.target.value !== 0 ? event.target.value : '',
          count: 100,
        })
          .toPromise()
          .then((data) => {
            const toIdEntities = R.pipe(
              R.pathOr([], ['stixCoreObjects', 'edges']),
              R.map((n) => ({
                label: defaultValue(n.node),
                value: n.node.id,
                type: n.node.entity_type,
              })),
            )(data);
            unionSetEntities('toId', toIdEntities);
          });
        break;
      case 'objectContains':
        fetchQuery(filtersStixCoreObjectsSearchQuery, {
          types: (searchScope && searchScope.objectContains) || [
            'Stix-Core-Object',
          ],
          search: event.target.value !== 0 ? event.target.value : '',
          count: 50,
        })
          .toPromise()
          .then((data) => {
            const objectContainsEntities = R.pipe(
              R.pathOr([], ['stixCoreObjects', 'edges']),
              R.map((n) => ({
                label: defaultValue(n.node),
                value: n.node.id,
                type: n.node.entity_type,
              })),
            )(data);
            unionSetEntities('objectContains', objectContainsEntities);
          });
        break;
      case 'markedBy':
        fetchQuery(markingDefinitionsLinesSearchQuery, {
          search: event.target.value !== 0 ? event.target.value : '',
          first: 10,
        })
          .toPromise()
          .then((data) => {
            const markedByEntities = R.pipe(
              R.pathOr([], ['markingDefinitions', 'edges']),
              R.map((n) => ({
                label: n.node.definition,
                value: n.node.id,
                type: 'Marking-Definition',
                color: n.node.x_opencti_color,
              })),
            )(data);
            unionSetEntities('markedBy', markedByEntities);
          });
        break;
      case 'killChainPhase':
        fetchQuery(killChainPhasesLinesSearchQuery, {
          search: event.target.value !== 0 ? event.target.value : '',
          first: 10,
        })
          .toPromise()
          .then((data) => {
            const killChainPhaseEntities = R.pipe(
              R.pathOr([], ['killChainPhases', 'edges']),
              R.map((n) => ({
                label: `[${n.node.kill_chain_name}] ${n.node.phase_name}`,
                value: n.node.id,
                type: 'Kill-Chain-Phase',
              })),
            )(data);
            unionSetEntities('killChainPhase', killChainPhaseEntities);
          });
        break;
      case 'labelledBy':
        fetchQuery(labelsSearchQuery, {
          search: event.target.value !== 0 ? event.target.value : '',
          first: 10,
        })
          .toPromise()
          .then((data) => {
            const labelledByEntities = R.pipe(
              R.pathOr([], ['labels', 'edges']),
              R.map((n) => ({
                label: n.node.value,
                value: n.node.id,
                type: 'Label',
                color: n.node.color,
              })),
            )(data);
            unionSetEntities('labelledBy', [
              {
                label: t('No label'),
                value: null,
                type: 'Label',
                color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
              },
              ...labelledByEntities,
            ]);
          });
        break;
      case 'x_opencti_base_score':
        // eslint-disable-next-line no-case-declarations
        const baseScoreEntities = ['lte', 'gt'].flatMap((group) => baseScores.map((n) => ({
          label: n,
          value: n,
          type: 'Vocabulary',
          group,
        })));
        unionSetEntities('x_opencti_base_score', baseScoreEntities);
        break;
      // region confidence
      case 'confidence':
        // eslint-disable-next-line no-case-declarations
        const confidenceEntities = ['lte', 'gt'].flatMap((group) => confidences.map((n) => ({
          label: n,
          value: n,
          type: 'Vocabulary',
          group,
        })));
        unionSetEntities('confidence', confidenceEntities);
        break;
      case 'confidence_gt':
        // eslint-disable-next-line no-case-declarations
        const confidenceEntitiesGt = R.pipe(
          R.map((n) => ({
            label: t(`confidence_${n.toString()}`),
            value: n,
            type: 'Vocabulary',
          })),
        )(confidences);
        unionSetEntities('confidence_gt', confidenceEntitiesGt);
        break;
      case 'confidence_lte':
        // eslint-disable-next-line no-case-declarations
        const confidenceLteEntities = confidences.map((n) => ({
          label: n,
          value: n,
          type: 'Vocabulary',
        }));
        unionSetEntities('confidence_lte', confidenceLteEntities);
        break;
      // endregion
      // region likelihood
      case 'likelihood':
        // eslint-disable-next-line no-case-declarations
        const likelihoodEntities = ['lte', 'gt'].flatMap((group) => likelihoods.map((n) => ({
          label: n,
          value: n,
          type: 'Vocabulary',
          group,
        })));
        unionSetEntities('likelihood', likelihoodEntities);
        break;
      case 'likelihood_gt':
        // eslint-disable-next-line no-case-declarations
        const likelihoodEntitiesGt = R.pipe(
          R.map((n) => ({
            label: t(`likelihood_${n.toString()}`),
            value: n,
            type: 'Vocabulary',
          })),
        )(likelihoods);
        unionSetEntities('likelihood_gt', likelihoodEntitiesGt);
        break;
      case 'likelihood_lte':
        // eslint-disable-next-line no-case-declarations
        const likelihoodLteEntities = likelihoods.map((n) => ({
          label: n,
          value: n,
          type: 'Vocabulary',
        }));
        unionSetEntities('likelihood_lte', likelihoodLteEntities);
        break;
      // endregion
      // region x_opencti_score
      case 'x_opencti_score':
        // eslint-disable-next-line no-case-declarations
        const scoreEntities = ['lte', 'gt'].flatMap((group) => scores.map((n) => ({
          label: n,
          value: n,
          type: 'Vocabulary',
          group,
        })));
        unionSetEntities('x_opencti_score', scoreEntities);
        break;
      case 'x_opencti_score_gt':
        // eslint-disable-next-line no-case-declarations
        const scoreGtEntities = scores.map((n) => ({
          label: n,
          value: n,
          type: 'Vocabulary',
        }));
        unionSetEntities('x_opencti_score_gt', scoreGtEntities);
        break;
      case 'x_opencti_score_lte':
        // eslint-disable-next-line no-case-declarations
        const scoreLteEntities = scores.map((n) => ({
          label: n,
          value: n,
          type: 'Vocabulary',
        }));
        unionSetEntities('x_opencti_score_lte', scoreLteEntities);
        break;
      // endregion
      case 'x_opencti_detection':
        // eslint-disable-next-line no-case-declarations
        const detectionEntities = R.pipe(
          R.map((n) => ({
            label: t(n),
            value: n,
            type: 'Vocabulary',
          })),
        )(['true', 'false']);
        unionSetEntities('x_opencti_detection', detectionEntities);
        break;
      case 'basedOn':
        // eslint-disable-next-line no-case-declarations
        const basedOnEntities = R.pipe(
          R.map((n) => ({
            label: n === 'EXISTS' ? t('Yes') : t('No'),
            value: n,
            type: 'Vocabulary',
          })),
        )(['EXISTS', null]);
        unionSetEntities('basedOn', basedOnEntities);
        break;
      case 'revoked':
        // eslint-disable-next-line no-case-declarations
        const revokedEntities = R.pipe(
          R.map((n) => ({
            label: t(n),
            value: n,
            type: 'Vocabulary',
          })),
        )(['true', 'false']);
        unionSetEntities('revoked', revokedEntities);
        break;
      case 'pattern_type':
        // eslint-disable-next-line no-case-declarations
        const patternTypesEntities = R.pipe(
          R.map((n) => ({
            label: t(n),
            value: n,
            type: 'Vocabulary',
          })),
        )([
          'stix',
          'pcre',
          'sigma',
          'snort',
          'suricata',
          'yara',
          'tanium-signal',
          'spl',
          'eql',
        ]);
        unionSetEntities('pattern_type', patternTypesEntities);
        break;
      case 'x_opencti_base_severity':
        fetchQuery(attributesSearchQuery, {
          attributeName: 'x_opencti_base_severity',
          search: event.target.value !== 0 ? event.target.value : '',
          first: 10,
        })
          .toPromise()
          .then((data) => {
            const severityEntities = R.pipe(
              R.pathOr([], ['runtimeAttributes', 'edges']),
              R.map((n) => ({
                label: n.node.value,
                value: n.node.value,
                type: 'Vocabulary',
              })),
            )(data);
            unionSetEntities('x_opencti_base_severity', severityEntities);
          });
        break;
      case 'x_opencti_attack_vector':
        fetchQuery(attributesSearchQuery, {
          attributeName: 'x_opencti_attack_vector',
          search: event.target.value !== 0 ? event.target.value : '',
          first: 10,
        })
          .toPromise()
          .then((data) => {
            const attackVectorEntities = R.pipe(
              R.pathOr([], ['runtimeAttributes', 'edges']),
              R.map((n) => ({
                label: n.node.value,
                value: n.node.value,
                type: 'Vocabulary',
              })),
            )(data);
            unionSetEntities('x_opencti_attack_vector', attackVectorEntities);
          });
        break;
      case 'malware_types':
        fetchQuery(attributesSearchQuery, {
          attributeName: 'malware_types',
          search: event.target.value !== 0 ? event.target.value : '',
          first: 10,
        })
          .toPromise()
          .then((data) => {
            const attackVectorEntities = R.pipe(
              R.pathOr([], ['runtimeAttributes', 'edges']),
              R.map((n) => ({
                label: n.node.value,
                value: n.node.value,
                type: 'Vocabulary',
              })),
            )(data);
            unionSetEntities('malware_types', attackVectorEntities);
          });
        break;
      case 'x_opencti_workflow_id':
        fetchQuery(statusFieldStatusesSearchQuery, {
          search: event.target.value !== 0 ? event.target.value : '',
          first: 50,
        })
          .toPromise()
          .then((data) => {
            const statusEntities = R.pipe(
              R.pathOr([], ['statuses', 'edges']),
              R.filter((n) => !R.isNil(n.node.template)),
              R.map((n) => ({
                label: n.node.template.name,
                color: n.node.template.color,
                value: n.node.id,
                order: n.node.order,
                group: n.node.type,
                type: 'Vocabulary',
              })),
            )(data);
            unionSetEntities('x_opencti_workflow_id', statusEntities);
          });
        break;
      case 'x_opencti_organization_type':
        fetchQuery(attributesSearchQuery, {
          attributeName: 'x_opencti_organization_type',
          search: event.target.value !== 0 ? event.target.value : '',
          first: 10,
        })
          .toPromise()
          .then((data) => {
            const organizationTypeEntities = R.pipe(
              R.pathOr([], ['runtimeAttributes', 'edges']),
              R.map((n) => ({
                label: n.node.value,
                value: n.node.value,
                type: 'Vocabulary',
              })),
            )(data);
            unionSetEntities(
              'x_opencti_organization_type',
              organizationTypeEntities,
            );
          });
        break;
      case 'indicator_types':
        fetchQuery(vocabularySearchQuery, {
          category: 'indicator_type_ov',
        })
          .toPromise()
          .then((data) => {
            unionSetEntities(
              'indicator_types',
              (data?.vocabularies?.edges ?? []).map(({ node }) => ({
                label: t(node.name),
                value: node.name,
                type: 'Vocabulary',
              })),
            );
          });
        break;
      case 'incident_type':
        fetchQuery(vocabularySearchQuery, {
          category: 'incident_type_ov',
        })
          .toPromise()
          .then((data) => {
            unionSetEntities(
              'indicator_types',
              (data?.vocabularies?.edges ?? []).map(({ node }) => ({
                label: t(node.name),
                value: node.name,
                type: 'Vocabulary',
              })),
            );
          });
        break;
      case 'report_types':
        fetchQuery(vocabularySearchQuery, {
          category: 'report_types_ov',
        })
          .toPromise()
          .then((data) => {
            unionSetEntities(
              'report_types',
              (data?.vocabularies?.edges ?? []).map(({ node }) => ({
                label: t(node.name),
                value: node.name,
                type: 'Vocabulary',
              })),
            );
          });
        break;
      case 'channel_types':
        fetchQuery(vocabularySearchQuery, {
          category: 'channel_types_ov',
        })
          .toPromise()
          .then((data) => {
            unionSetEntities(
              'channel_types',
              (data?.vocabularies?.edges ?? []).map(({ node }) => ({
                label: t(node.name),
                value: node.name,
                type: 'Vocabulary',
              })),
            );
          });
        break;
      case 'context':
        fetchQuery(vocabularySearchQuery, {
          category: 'grouping_context_ov',
        })
          .toPromise()
          .then((data) => {
            unionSetEntities('context', (data?.vocabularies?.edges ?? []).map(({ node }) => ({ label: t(node.name), value: node.name, type: 'Vocabulary' })));
          });
        break;
      case 'entity_type':
        if (
          availableEntityTypes
          && !availableEntityTypes.includes('Stix-Cyber-Observable')
          && !availableEntityTypes.includes('Stix-Domain-Object')
        ) {
          entitiesTypes = R.pipe(
            R.map((n) => ({
              label: t(
                n.toString()[0] === n.toString()[0].toUpperCase()
                  ? `entity_${n.toString()}`
                  : `relationship_${n.toString()}`,
              ),
              value: n,
              type: n,
            })),
            R.sortWith([R.ascend(R.prop('label'))]),
          )(availableEntityTypes);
          if (allEntityTypes) {
            entitiesTypes = R.prepend(
              { label: t('entity_All'), value: 'all', type: 'entity' },
              entitiesTypes,
            );
          }
          unionSetEntities('entity_type', entitiesTypes);
        } else {
          fetchQuery(filtersAllTypesQuery)
            .toPromise()
            .then((data) => {
              let result = [];
              if (
                !availableEntityTypes
                || availableEntityTypes.includes('Stix-Cyber-Observable')
              ) {
                result = [
                  ...R.pipe(
                    R.pathOr([], ['scoTypes', 'edges']),
                    R.map((n) => ({
                      label: t(`entity_${n.node.label}`),
                      value: n.node.label,
                      type: n.node.label,
                    })),
                  )(data),
                  ...result,
                ];
              }
              if (
                !availableEntityTypes
                || availableEntityTypes.includes('Stix-Domain-Object')
              ) {
                result = [
                  ...R.pipe(
                    R.pathOr([], ['sdoTypes', 'edges']),
                    R.map((n) => ({
                      label: t(`entity_${n.node.label}`),
                      value: n.node.label,
                      type: n.node.label,
                    })),
                  )(data),
                  ...result,
                ];
              }
              if (
                !availableEntityTypes
                || availableEntityTypes.includes('stix-core-relationship')
              ) {
                result = [
                  ...R.pipe(
                    R.pathOr([], ['sroTypes', 'edges']),
                    R.map((n) => ({
                      label: t(`relationship_${n.node.label}`),
                      value: n.node.label,
                      type: n.node.label,
                    })),
                  )(data),
                  ...result,
                ];
              }
              entitiesTypes = R.sortWith([R.ascend(R.prop('label'))], result);
              if (allEntityTypes) {
                entitiesTypes = R.prepend(
                  { label: t('entity_All'), value: 'all', type: 'entity' },
                  entitiesTypes,
                );
              }
              unionSetEntities('entity_type', entitiesTypes);
            });
        }
        break;
      case 'entity_types':
        if (
          availableEntityTypes
          && !availableEntityTypes.includes('Stix-Cyber-Observable')
          && !availableEntityTypes.includes('Stix-Domain-Object')
        ) {
          entitiesTypes = R.pipe(
            R.map((n) => ({
              label: t(
                n.toString()[0] === n.toString()[0].toUpperCase()
                  ? `entity_${n.toString()}`
                  : `relationship_${n.toString()}`,
              ),
              value: n,
              type: n,
            })),
            R.sortWith([R.ascend(R.prop('label'))]),
          )(availableEntityTypes);
          if (allEntityTypes) {
            entitiesTypes = R.prepend(
              { label: t('entity_All'), value: 'all', type: 'entity' },
              entitiesTypes,
            );
          }
          unionSetEntities('entity_types', entitiesTypes);
        } else {
          fetchQuery(filtersAllTypesQuery)
            .toPromise()
            .then((data) => {
              let result = [];
              if (
                !availableEntityTypes
                || availableEntityTypes.includes('Stix-Cyber-Observable')
              ) {
                result = [
                  ...R.pipe(
                    R.pathOr([], ['scoTypes', 'edges']),
                    R.map((n) => ({
                      label: t(`entity_${n.node.label}`),
                      value: n.node.label,
                      type: n.node.label,
                    })),
                  )(data),
                  ...result,
                ];
              }
              if (
                !availableEntityTypes
                || availableEntityTypes.includes('Stix-Domain-Object')
              ) {
                result = [
                  ...R.pipe(
                    R.pathOr([], ['sdoTypes', 'edges']),
                    R.map((n) => ({
                      label: t(`entity_${n.node.label}`),
                      value: n.node.label,
                      type: n.node.label,
                    })),
                  )(data),
                  ...result,
                ];
              }
              if (
                !availableEntityTypes
                || availableEntityTypes.includes('stix-core-relationship')
              ) {
                result = [
                  ...R.pipe(
                    R.pathOr([], ['sroTypes', 'edges']),
                    R.map((n) => ({
                      label: t(`relationship_${n.node.label}`),
                      value: n.node.label,
                      type: n.node.label,
                    })),
                  )(data),
                  ...result,
                ];
              }
              entitiesTypes = R.sortWith([R.ascend(R.prop('label'))], result);
              if (allEntityTypes) {
                entitiesTypes = R.prepend(
                  { label: t('entity_All'), value: 'all', type: 'entity' },
                  entitiesTypes,
                );
              }
              unionSetEntities('entity_types', entitiesTypes);
            });
        }
        break;
      case 'category':
        fetchQuery(vocabCategoriesQuery)
          .toPromise()
          .then((data) => {
            unionSetEntities(
              'category',
              data.vocabularyCategories.map(({ key }) => ({
                label: key,
                value: key,
                type: 'Vocabulary',
              })),
            );
          });
        break;
      case 'fromTypes':
        // eslint-disable-next-line no-case-declarations
        let fromTypesTypes = [];
        if (
          availableEntityTypes
          && !availableEntityTypes.includes('Stix-Cyber-Observable')
          && !availableEntityTypes.includes('Stix-Domain-Object')
        ) {
          fromTypesTypes = R.pipe(
            R.map((n) => ({
              label: t(
                n.toString()[0] === n.toString()[0].toUpperCase()
                  ? `entity_${n.toString()}`
                  : `relationship_${n.toString()}`,
              ),
              value: n,
              type: n,
            })),
            R.sortWith([R.ascend(R.prop('label'))]),
          )(availableEntityTypes);
          if (allEntityTypes) {
            fromTypesTypes = R.prepend(
              { label: t('entity_All'), value: 'all', type: 'entity' },
              fromTypesTypes,
            );
          }
          unionSetEntities('fromTypes', fromTypesTypes);
        } else {
          fetchQuery(filtersAllTypesQuery)
            .toPromise()
            .then((data) => {
              let result = [];
              if (
                !availableEntityTypes
                || availableEntityTypes.includes('Stix-Cyber-Observable')
              ) {
                result = [
                  ...R.pipe(
                    R.pathOr([], ['scoTypes', 'edges']),
                    R.map((n) => ({
                      label: t(`entity_${n.node.label}`),
                      value: n.node.label,
                      type: n.node.label,
                    })),
                  )(data),
                  ...result,
                ];
              }
              if (
                !availableEntityTypes
                || availableEntityTypes.includes('Stix-Domain-Object')
              ) {
                result = [
                  ...R.pipe(
                    R.pathOr([], ['sdoTypes', 'edges']),
                    R.map((n) => ({
                      label: t(`entity_${n.node.label}`),
                      value: n.node.label,
                      type: n.node.label,
                    })),
                  )(data),
                  ...result,
                ];
              }
              fromTypesTypes = R.sortWith([R.ascend(R.prop('label'))], result);
              if (allEntityTypes) {
                fromTypesTypes = R.prepend(
                  { label: t('entity_All'), value: 'all', type: 'entity' },
                  fromTypesTypes,
                );
              }
              unionSetEntities('fromTypes', fromTypesTypes);
            });
        }
        break;
      case 'toTypes':
        // eslint-disable-next-line no-case-declarations
        let toTypesTypes = [];
        if (
          availableEntityTypes
          && !availableEntityTypes.includes('Stix-Cyber-Observable')
          && !availableEntityTypes.includes('Stix-Domain-Object')
        ) {
          toTypesTypes = R.pipe(
            R.map((n) => ({
              label: t(
                n.toString()[0] === n.toString()[0].toUpperCase()
                  ? `entity_${n.toString()}`
                  : `relationship_${n.toString()}`,
              ),
              value: n,
              type: n,
            })),
            R.sortWith([R.ascend(R.prop('label'))]),
          )(availableEntityTypes);
          if (allEntityTypes) {
            toTypesTypes = R.prepend(
              { label: t('entity_All'), value: 'all', type: 'entity' },
              toTypesTypes,
            );
          }
          unionSetEntities('toTypes', toTypesTypes);
        } else {
          fetchQuery(filtersAllTypesQuery)
            .toPromise()
            .then((data) => {
              let result = [];
              if (
                !availableEntityTypes
                || availableEntityTypes.includes('Stix-Cyber-Observable')
              ) {
                result = [
                  ...R.pipe(
                    R.pathOr([], ['scoTypes', 'edges']),
                    R.map((n) => ({
                      label: t(`entity_${n.node.label}`),
                      value: n.node.label,
                      type: n.node.label,
                    })),
                  )(data),
                  ...result,
                ];
              }
              if (
                !availableEntityTypes
                || availableEntityTypes.includes('Stix-Domain-Object')
              ) {
                result = [
                  ...R.pipe(
                    R.pathOr([], ['sdoTypes', 'edges']),
                    R.map((n) => ({
                      label: t(`entity_${n.node.label}`),
                      value: n.node.label,
                      type: n.node.label,
                    })),
                  )(data),
                  ...result,
                ];
              }
              toTypesTypes = R.sortWith([R.ascend(R.prop('label'))], result);
              if (allEntityTypes) {
                toTypesTypes = R.prepend(
                  { label: t('entity_All'), value: 'all', type: 'entity' },
                  toTypesTypes,
                );
              }
              unionSetEntities('toTypes', toTypesTypes);
            });
        }
        break;
      case 'relationship_type':
        // eslint-disable-next-line no-case-declarations
        let relationshipsTypes = [];
        if (availableRelationshipTypes) {
          relationshipsTypes = R.pipe(
            R.map((n) => ({
              label: t(`relationship_${n.toString()}`),
              value: n,
              type: n,
            })),
            R.sortWith([R.ascend(R.prop('label'))]),
          )(availableRelationshipTypes);
          unionSetEntities('relationship_type', relationshipsTypes);
        } else {
          fetchQuery(filtersAllTypesQuery)
            .toPromise()
            .then((data) => {
              relationshipsTypes = R.pipe(
                R.pathOr([], ['sroTypes', 'edges']),
                R.map((n) => ({
                  label: t(`relationship_${n.node.label}`),
                  value: n.node.label,
                  type: n.node.label,
                })),
                R.append({
                  label: t('relationship_stix-sighting-relationship'),
                  value: 'stix-sighting-relationship',
                  type: 'stix-sighting-relationship',
                }),
                R.sortWith([R.ascend(R.prop('label'))]),
              )(data);
              unionSetEntities('relationship_type', relationshipsTypes);
            });
        }
        break;
      case 'container_type':
        // eslint-disable-next-line no-case-declarations
        const containersTypes = R.pipe(
          R.map((n) => ({
            label: t(
              n.toString()[0] === n.toString()[0].toUpperCase()
                ? `entity_${n.toString()}`
                : `relationship_${n.toString()}`,
            ),
            value: n,
            type: n,
          })),
          R.sortWith([R.ascend(R.prop('label'))]),
        )(['Note', 'Observed-Data', 'Opinion', 'Report', 'Grouping']);
        unionSetEntities('container_type', containersTypes);
        break;
      case 'x_opencti_negative':
        // eslint-disable-next-line no-case-declarations
        const negativeValue = [true, false].map((n) => ({
          label: t(n ? 'False positive' : 'Malicious'),
          value: n.toString(),
          type: 'Vocabulary',
        }));
        unionSetEntities('x_opencti_negative', negativeValue);
        break;
      case 'note_types':
        fetchQuery(vocabularySearchQuery, {
          category: 'note_types_ov',
        })
          .toPromise()
          .then((data) => {
            unionSetEntities('note_types', (data?.vocabularies?.edges ?? []).map(({ node }) => ({ label: t(node.name), value: node.name, type: 'Vocabulary' })));
          });
        break;
      default:
        break;
    }
  };
  return [entities, searchEntities];
};

export default useSearchEntities;
