import React from 'react';
import * as R from 'ramda';
import { graphql } from 'react-relay';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import { Link } from 'react-router-dom';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import makeStyles from '@mui/styles/makeStyles';
import ItemIcon from '../../../../components/ItemIcon';
import { useFormatter } from '../../../../components/i18n';
import { QueryRenderer } from '../../../../relay/environment';
import { computeLink } from '../../../../utils/Entity';
import { defaultValue } from '../../../../utils/Graph';
import ItemMarkings from '../../../../components/ItemMarkings';
import { buildFiltersAndOptionsForWidgets } from '../../../../utils/filters/filtersUtils';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    paddingBottom: 10,
    marginBottom: 10,
  },
  paper: {
    height: '100%',
    margin: '10px 0 0 0',
    padding: 0,
    borderRadius: 4,
  },
  item: {
    height: 50,
    minHeight: 50,
    maxHeight: 50,
    paddingRight: 0,
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
  itemIcon: {
    marginRight: 0,
    color: theme.palette.primary.main,
  },
}));

export const stixRelationshipsListSearchQuery = graphql`
  query StixRelationshipsListSearchQuery(
    $search: String
    $fromId: [String]
    $toId: [String]
    $relationship_type: [String]
    $count: Int!
    $filters: FilterGroup
    $dynamicFrom: FilterGroup
    $dynamicTo: FilterGroup
  ) {
    stixRelationships(
      search: $search
      fromId: $fromId
      toId: $toId
      relationship_type: $relationship_type
      first: $count
      filters: $filters
      dynamicFrom: $dynamicFrom
      dynamicTo: $dynamicTo
    ) {
      edges {
        node {
          id
          standard_id
          entity_type
          parent_types
          relationship_type
        }
      }
    }
  }
`;

const stixRelationshipsListQuery = graphql`
  query StixRelationshipsListQuery(
    $relationship_type: [String]
    $fromId: [String]
    $toId: [String]
    $fromTypes: [String]
    $toTypes: [String]
    $first: Int!
    $orderBy: StixRelationshipsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
    $dynamicFrom: FilterGroup
    $dynamicTo: FilterGroup
    $search: String
  ) {
    stixRelationships(
      relationship_type: $relationship_type
      fromId: $fromId
      toId: $toId
      fromTypes: $fromTypes
      toTypes: $toTypes
      first: $first
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
      dynamicFrom: $dynamicFrom
      dynamicTo: $dynamicTo
      search: $search
    ) {
      edges {
        node {
          id
          entity_type
          parent_types
          relationship_type
          confidence
          ... on StixCoreRelationship {
            start_time
            stop_time
            description
            objectLabel {
              id
              value
              color
            }
          }
          ... on StixSightingRelationship {
            first_seen
            last_seen
          }
          fromRole
          toRole
          created_at
          updated_at
          is_inferred
          createdBy {
            ... on Identity {
              name
            }
          }
          objectMarking {
            id
            definition
            x_opencti_order
            x_opencti_color
          }
          x_opencti_inferences {
            rule {
              id
              name
              description
            }
            explanation {
              ... on BasicObject {
                id
                entity_type
                parent_types
              }
              ... on BasicRelationship {
                id
                entity_type
                parent_types
              }
              ... on StixCoreObject {
                created_at
              }
              ... on AttackPattern {
                name
              }
              ... on Campaign {
                name
              }
              ... on CourseOfAction {
                name
              }
              ... on Individual {
                name
              }
              ... on Organization {
                name
              }
              ... on Sector {
                name
              }
              ... on System {
                name
              }
              ... on Indicator {
                name
              }
              ... on Infrastructure {
                name
              }
              ... on IntrusionSet {
                name
              }
              ... on Position {
                name
              }
              ... on City {
                name
              }
              ... on AdministrativeArea {
                name
              }
              ... on Country {
                name
              }
              ... on Region {
                name
              }
              ... on Malware {
                name
              }
              ... on ThreatActor {
                name
              }
              ... on Tool {
                name
              }
              ... on Vulnerability {
                name
              }
              ... on Incident {
                name
              }
              ... on Event {
                name
              }
              ... on Channel {
                name
              }
              ... on Narrative {
                name
              }
              ... on Language {
                name
              }
              ... on DataComponent {
                name
              }
              ... on DataSource {
                name
              }
              ... on Case {
                name
              }
              ... on Report {
                name
              }
              ... on StixRelationship {
                id
                relationship_type
                created_at
                ... on StixCoreRelationship {
                  start_time
                  stop_time
                  description
                }
                ... on StixSightingRelationship {
                  first_seen
                  last_seen
                }
                created
                from {
                  ... on BasicObject {
                    id
                    entity_type
                    parent_types
                  }
                  ... on BasicRelationship {
                    id
                    entity_type
                    parent_types
                  }
                  ... on StixCoreObject {
                    created_at
                  }
                  ... on StixRelationship {
                    relationship_type
                    created_at
                    ... on StixCoreRelationship {
                      start_time
                      stop_time
                      description
                    }
                    ... on StixSightingRelationship {
                      first_seen
                      last_seen
                    }
                    created
                  }
                  ... on AttackPattern {
                    name
                  }
                  ... on Campaign {
                    name
                  }
                  ... on CourseOfAction {
                    name
                  }
                  ... on Individual {
                    name
                  }
                  ... on Organization {
                    name
                  }
                  ... on Sector {
                    name
                  }
                  ... on System {
                    name
                  }
                  ... on Indicator {
                    name
                  }
                  ... on Infrastructure {
                    name
                  }
                  ... on IntrusionSet {
                    name
                  }
                  ... on Position {
                    name
                  }
                  ... on City {
                    name
                  }
                  ... on AdministrativeArea {
                    name
                  }
                  ... on Country {
                    name
                  }
                  ... on Region {
                    name
                  }
                  ... on Malware {
                    name
                  }
                  ... on ThreatActor {
                    name
                  }
                  ... on Tool {
                    name
                  }
                  ... on Vulnerability {
                    name
                  }
                  ... on Incident {
                    name
                  }
                  ... on Event {
                    name
                  }
                  ... on Channel {
                    name
                  }
                  ... on Narrative {
                    name
                  }
                  ... on Language {
                    name
                  }
                  ... on DataComponent {
                    name
                  }
                  ... on DataSource {
                    name
                  }
                  ... on Case {
                    name
                  }
                  ... on Report {
                    name
                  }
                  ... on ExternalReference {
                    source_name
                    url
                    external_id
                  }
                  ... on StixCyberObservable {
                    observable_value
                  }
                  ... on ObservedData {
                    name
                    objects(first: 1) {
                      edges {
                        node {
                          ... on StixCoreObject {
                            id
                            entity_type
                            parent_types
                            created_at
                            createdBy {
                              ... on Identity {
                                id
                                name
                                entity_type
                              }
                            }
                            objectMarking {
                              id
                              definition
                              x_opencti_order
                              x_opencti_color
                            }
                          }
                          ... on AttackPattern {
                            name
                            description
                            x_mitre_id
                          }
                          ... on Campaign {
                            name
                            description
                            first_seen
                            last_seen
                          }
                          ... on Note {
                            attribute_abstract
                          }
                          ... on ObservedData {
                            name
                            first_observed
                            last_observed
                          }
                          ... on Opinion {
                            opinion
                          }
                          ... on Report {
                            name
                            description
                            published
                          }
                          ... on Grouping {
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
                            valid_from
                          }
                          ... on Infrastructure {
                            name
                            description
                          }
                          ... on IntrusionSet {
                            name
                            description
                            first_seen
                            last_seen
                          }
                          ... on Position {
                            name
                            description
                          }
                          ... on City {
                            name
                            description
                          }
                          ... on AdministrativeArea {
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
                            first_seen
                            last_seen
                          }
                          ... on ThreatActor {
                            name
                            description
                            first_seen
                            last_seen
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
                            first_seen
                            last_seen
                          }
                          ... on Event {
                            name
                          }
                          ... on Channel {
                            name
                          }
                          ... on Narrative {
                            name
                          }
                          ... on Language {
                            name
                          }
                          ... on DataComponent {
                            name
                          }
                          ... on DataSource {
                            name
                          }
                          ... on Case {
                            name
                          }
                          ... on Report {
                            name
                          }
                          ... on ExternalReference {
                            source_name
                            url
                            external_id
                          }
                          ... on StixCyberObservable {
                            observable_value
                            x_opencti_description
                          }
                        }
                      }
                    }
                  }
                  ... on StixRelationship {
                    id
                    entity_type
                    relationship_type
                    ... on StixCoreRelationship {
                      start_time
                      stop_time
                      description
                    }
                    ... on StixSightingRelationship {
                      first_seen
                      last_seen
                    }
                    created
                    from {
                      ... on BasicObject {
                        id
                        entity_type
                      }
                      ... on BasicRelationship {
                        id
                        entity_type
                      }
                      ... on StixCoreObject {
                        created_at
                      }
                      ... on StixRelationship {
                        created_at
                        ... on StixCoreRelationship {
                          start_time
                          stop_time
                          description
                        }
                        ... on StixSightingRelationship {
                          first_seen
                          last_seen
                        }
                        created
                      }
                      ... on AttackPattern {
                        name
                      }
                      ... on Campaign {
                        name
                      }
                      ... on CourseOfAction {
                        name
                      }
                      ... on Individual {
                        name
                      }
                      ... on Organization {
                        name
                      }
                      ... on Sector {
                        name
                      }
                      ... on System {
                        name
                      }
                      ... on Indicator {
                        name
                      }
                      ... on Infrastructure {
                        name
                      }
                      ... on IntrusionSet {
                        name
                      }
                      ... on Position {
                        name
                      }
                      ... on City {
                        name
                      }
                      ... on AdministrativeArea {
                        name
                      }
                      ... on Country {
                        name
                      }
                      ... on Region {
                        name
                      }
                      ... on Malware {
                        name
                      }
                      ... on ThreatActor {
                        name
                      }
                      ... on Tool {
                        name
                      }
                      ... on Vulnerability {
                        name
                      }
                      ... on Incident {
                        name
                      }
                      ... on Event {
                        name
                      }
                      ... on Channel {
                        name
                      }
                      ... on Narrative {
                        name
                      }
                      ... on Language {
                        name
                      }
                      ... on DataComponent {
                        name
                      }
                      ... on DataSource {
                        name
                      }
                      ... on Case {
                        name
                      }
                      ... on Report {
                        name
                      }
                      ... on ExternalReference {
                        source_name
                        url
                        external_id
                      }
                    }
                    to {
                      ... on BasicObject {
                        id
                        entity_type
                      }
                      ... on BasicRelationship {
                        id
                        entity_type
                      }
                      ... on StixCoreObject {
                        created_at
                      }
                      ... on StixRelationship {
                        created_at
                        ... on StixCoreRelationship {
                          start_time
                          stop_time
                          description
                        }
                        ... on StixSightingRelationship {
                          first_seen
                          last_seen
                        }
                        created
                      }
                      ... on AttackPattern {
                        name
                      }
                      ... on Campaign {
                        name
                      }
                      ... on CourseOfAction {
                        name
                      }
                      ... on Individual {
                        name
                      }
                      ... on Organization {
                        name
                      }
                      ... on Sector {
                        name
                      }
                      ... on System {
                        name
                      }
                      ... on Indicator {
                        name
                      }
                      ... on Infrastructure {
                        name
                      }
                      ... on IntrusionSet {
                        name
                      }
                      ... on Position {
                        name
                      }
                      ... on City {
                        name
                      }
                      ... on Country {
                        name
                      }
                      ... on Region {
                        name
                      }
                      ... on Malware {
                        name
                      }
                      ... on ThreatActor {
                        name
                      }
                      ... on Tool {
                        name
                      }
                      ... on Vulnerability {
                        name
                      }
                      ... on Incident {
                        name
                      }
                      ... on Event {
                        name
                      }
                      ... on Channel {
                        name
                      }
                      ... on Narrative {
                        name
                      }
                      ... on Language {
                        name
                      }
                      ... on DataComponent {
                        name
                      }
                      ... on DataSource {
                        name
                      }
                      ... on Case {
                        name
                      }
                      ... on Report {
                        name
                      }
                      ... on ExternalReference {
                        source_name
                        url
                        external_id
                      }
                      ... on ObservedData {
                        name
                        objects(first: 1) {
                          edges {
                            node {
                              ... on StixCoreObject {
                                id
                                entity_type
                                parent_types
                                created_at
                                createdBy {
                                  ... on Identity {
                                    id
                                    name
                                    entity_type
                                  }
                                }
                                objectMarking {
                                  id
                                  definition
                                  x_opencti_order
                                  x_opencti_color
                                }
                              }
                              ... on AttackPattern {
                                name
                                description
                                x_mitre_id
                              }
                              ... on Campaign {
                                name
                                description
                                first_seen
                                last_seen
                              }
                              ... on Note {
                                attribute_abstract
                              }
                              ... on ObservedData {
                                name
                                first_observed
                                last_observed
                              }
                              ... on Opinion {
                                opinion
                              }
                              ... on Report {
                                name
                                description
                                published
                              }
                              ... on Grouping {
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
                                valid_from
                              }
                              ... on Infrastructure {
                                name
                                description
                              }
                              ... on IntrusionSet {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on ThreatActor {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on Event {
                                name
                              }
                              ... on Channel {
                                name
                              }
                              ... on Narrative {
                                name
                              }
                              ... on Language {
                                name
                              }
                              ... on DataComponent {
                                name
                              }
                              ... on DataSource {
                                name
                              }
                              ... on Case {
                                name
                              }
                              ... on ExternalReference {
                                source_name
                                url
                                external_id
                              }
                              ... on StixCyberObservable {
                                observable_value
                                x_opencti_description
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                to {
                  ... on BasicObject {
                    id
                    entity_type
                    parent_types
                  }
                  ... on BasicRelationship {
                    id
                    entity_type
                    parent_types
                  }
                  ... on StixCoreObject {
                    created_at
                  }
                  ... on StixRelationship {
                    created_at
                    relationship_type
                    ... on StixCoreRelationship {
                      start_time
                      stop_time
                      description
                    }
                    ... on StixSightingRelationship {
                      first_seen
                      last_seen
                    }
                    created
                  }
                  ... on AttackPattern {
                    name
                  }
                  ... on Campaign {
                    name
                  }
                  ... on CourseOfAction {
                    name
                  }
                  ... on Individual {
                    name
                  }
                  ... on Organization {
                    name
                  }
                  ... on Sector {
                    name
                  }
                  ... on System {
                    name
                  }
                  ... on Indicator {
                    name
                  }
                  ... on Infrastructure {
                    name
                  }
                  ... on IntrusionSet {
                    name
                  }
                  ... on Position {
                    name
                  }
                  ... on City {
                    name
                  }
                  ... on Country {
                    name
                  }
                  ... on Region {
                    name
                  }
                  ... on Malware {
                    name
                  }
                  ... on ThreatActor {
                    name
                  }
                  ... on Tool {
                    name
                  }
                  ... on Vulnerability {
                    name
                  }
                  ... on Incident {
                    name
                  }
                  ... on Event {
                    name
                  }
                  ... on Channel {
                    name
                  }
                  ... on Narrative {
                    name
                  }
                  ... on Language {
                    name
                  }
                  ... on DataComponent {
                    name
                  }
                  ... on DataSource {
                    name
                  }
                  ... on Case {
                    name
                  }
                  ... on StixCyberObservable {
                    observable_value
                  }
                  ... on ObservedData {
                    name
                    objects(first: 1) {
                      edges {
                        node {
                          ... on StixCoreObject {
                            id
                            entity_type
                            parent_types
                            created_at
                            createdBy {
                              ... on Identity {
                                id
                                name
                                entity_type
                              }
                            }
                            objectMarking {
                              id
                              definition
                              x_opencti_order
                              x_opencti_color
                            }
                          }
                          ... on AttackPattern {
                            name
                            description
                            x_mitre_id
                          }
                          ... on Campaign {
                            name
                            description
                            first_seen
                            last_seen
                          }
                          ... on Note {
                            attribute_abstract
                          }
                          ... on ObservedData {
                            name
                            first_observed
                            last_observed
                          }
                          ... on Opinion {
                            opinion
                          }
                          ... on Report {
                            name
                            description
                            published
                          }
                          ... on Grouping {
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
                            valid_from
                          }
                          ... on Infrastructure {
                            name
                            description
                          }
                          ... on IntrusionSet {
                            name
                            description
                            first_seen
                            last_seen
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
                            first_seen
                            last_seen
                          }
                          ... on ThreatActor {
                            name
                            description
                            first_seen
                            last_seen
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
                            first_seen
                            last_seen
                          }
                          ... on Event {
                            name
                          }
                          ... on Channel {
                            name
                          }
                          ... on Narrative {
                            name
                          }
                          ... on Language {
                            name
                          }
                          ... on DataComponent {
                            name
                          }
                          ... on DataSource {
                            name
                          }
                          ... on Case {
                            name
                          }
                          ... on StixCyberObservable {
                            observable_value
                            x_opencti_description
                          }
                        }
                      }
                    }
                  }
                  ... on StixRelationship {
                    id
                    entity_type
                    relationship_type
                    ... on StixCoreRelationship {
                      start_time
                      stop_time
                      description
                    }
                    ... on StixSightingRelationship {
                      first_seen
                      last_seen
                    }
                    created
                    from {
                      ... on BasicObject {
                        id
                        entity_type
                        parent_types
                      }
                      ... on BasicRelationship {
                        id
                        entity_type
                        parent_types
                      }
                      ... on StixCoreObject {
                        created_at
                      }
                      ... on StixRelationship {
                        created_at
                        ... on StixCoreRelationship {
                          start_time
                          stop_time
                          description
                        }
                        ... on StixSightingRelationship {
                          first_seen
                          last_seen
                        }
                        created
                      }
                      ... on AttackPattern {
                        name
                      }
                      ... on Campaign {
                        name
                      }
                      ... on CourseOfAction {
                        name
                      }
                      ... on Individual {
                        name
                      }
                      ... on Organization {
                        name
                      }
                      ... on Sector {
                        name
                      }
                      ... on System {
                        name
                      }
                      ... on Indicator {
                        name
                      }
                      ... on Infrastructure {
                        name
                      }
                      ... on IntrusionSet {
                        name
                      }
                      ... on Position {
                        name
                      }
                      ... on City {
                        name
                      }
                      ... on Country {
                        name
                      }
                      ... on Region {
                        name
                      }
                      ... on Malware {
                        name
                      }
                      ... on ThreatActor {
                        name
                      }
                      ... on Tool {
                        name
                      }
                      ... on Vulnerability {
                        name
                      }
                      ... on Incident {
                        name
                      }
                      ... on Event {
                        name
                      }
                      ... on Channel {
                        name
                      }
                      ... on Narrative {
                        name
                      }
                      ... on Language {
                        name
                      }
                      ... on DataComponent {
                        name
                      }
                      ... on DataSource {
                        name
                      }
                      ... on Case {
                        name
                      }
                      ... on Report {
                        name
                      }
                      ... on ExternalReference {
                        source_name
                        url
                        external_id
                      }
                      ... on MarkingDefinition {
                        definition_type
                        definition
                      }
                      ... on StixCyberObservable {
                        observable_value
                      }
                      ... on ObservedData {
                        name
                        objects(first: 1) {
                          edges {
                            node {
                              ... on StixCoreObject {
                                id
                                entity_type
                                parent_types
                                created_at
                                createdBy {
                                  ... on Identity {
                                    id
                                    name
                                    entity_type
                                  }
                                }
                                objectMarking {
                                  id
                                  definition
                                  x_opencti_order
                                  x_opencti_color
                                }
                              }
                              ... on AttackPattern {
                                name
                                description
                                x_mitre_id
                              }
                              ... on Campaign {
                                name
                                description
                                first_seen
                                last_seen
                              }
                              ... on Note {
                                attribute_abstract
                              }
                              ... on ObservedData {
                                name
                                first_observed
                                last_observed
                              }
                              ... on Opinion {
                                opinion
                              }
                              ... on Report {
                                name
                                description
                                published
                              }
                              ... on Grouping {
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
                                valid_from
                              }
                              ... on Infrastructure {
                                name
                                description
                              }
                              ... on IntrusionSet {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on ThreatActor {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on Event {
                                name
                              }
                              ... on Channel {
                                name
                              }
                              ... on Narrative {
                                name
                              }
                              ... on Language {
                                name
                              }
                              ... on DataComponent {
                                name
                              }
                              ... on DataSource {
                                name
                              }
                              ... on Case {
                                name
                              }
                              ... on ExternalReference {
                                source_name
                                url
                                external_id
                              }
                              ... on MarkingDefinition {
                                definition_type
                                definition
                              }
                              ... on StixCyberObservable {
                                observable_value
                                x_opencti_description
                              }
                            }
                          }
                        }
                      }
                    }
                    to {
                      ... on BasicObject {
                        id
                        entity_type
                        parent_types
                      }
                      ... on BasicRelationship {
                        id
                        entity_type
                        parent_types
                      }
                      ... on StixCoreObject {
                        created_at
                      }
                      ... on StixRelationship {
                        created_at
                        ... on StixCoreRelationship {
                          start_time
                          stop_time
                          description
                        }
                        ... on StixSightingRelationship {
                          first_seen
                          last_seen
                        }
                        created
                      }
                      ... on AttackPattern {
                        name
                      }
                      ... on Campaign {
                        name
                      }
                      ... on CourseOfAction {
                        name
                      }
                      ... on Individual {
                        name
                      }
                      ... on Organization {
                        name
                      }
                      ... on Sector {
                        name
                      }
                      ... on System {
                        name
                      }
                      ... on Indicator {
                        name
                      }
                      ... on Infrastructure {
                        name
                      }
                      ... on IntrusionSet {
                        name
                      }
                      ... on Position {
                        name
                      }
                      ... on City {
                        name
                      }
                      ... on Country {
                        name
                      }
                      ... on Region {
                        name
                      }
                      ... on Malware {
                        name
                      }
                      ... on ThreatActor {
                        name
                      }
                      ... on Tool {
                        name
                      }
                      ... on Vulnerability {
                        name
                      }
                      ... on Incident {
                        name
                      }
                      ... on Event {
                        name
                      }
                      ... on Channel {
                        name
                      }
                      ... on Narrative {
                        name
                      }
                      ... on Language {
                        name
                      }
                      ... on DataComponent {
                        name
                      }
                      ... on DataSource {
                        name
                      }
                      ... on Case {
                        name
                      }
                      ... on StixCyberObservable {
                        observable_value
                      }
                      ... on ObservedData {
                        name
                        objects(first: 1) {
                          edges {
                            node {
                              ... on StixCoreObject {
                                id
                                entity_type
                                parent_types
                                created_at
                                createdBy {
                                  ... on Identity {
                                    id
                                    name
                                    entity_type
                                  }
                                }
                                objectMarking {
                                  id
                                  definition
                                  x_opencti_order
                                  x_opencti_color
                                }
                              }
                              ... on AttackPattern {
                                name
                                description
                                x_mitre_id
                              }
                              ... on Campaign {
                                name
                                description
                                first_seen
                                last_seen
                              }
                              ... on Note {
                                attribute_abstract
                              }
                              ... on ObservedData {
                                name
                                first_observed
                                last_observed
                              }
                              ... on Opinion {
                                opinion
                              }
                              ... on Report {
                                name
                                description
                                published
                              }
                              ... on Grouping {
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
                                valid_from
                              }
                              ... on Infrastructure {
                                name
                                description
                              }
                              ... on IntrusionSet {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on ThreatActor {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on Event {
                                name
                              }
                              ... on Channel {
                                name
                              }
                              ... on Narrative {
                                name
                              }
                              ... on Language {
                                name
                              }
                              ... on DataComponent {
                                name
                              }
                              ... on DataSource {
                                name
                              }
                              ... on Case {
                                name
                              }
                              ... on ExternalReference {
                                source_name
                                url
                                external_id
                              }
                              ... on MarkingDefinition {
                                definition_type
                                definition
                              }
                              ... on StixCyberObservable {
                                observable_value
                                x_opencti_description
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              ... on StixSightingRelationship {
                id
                created_at
                from {
                  ... on BasicObject {
                    id
                    entity_type
                    parent_types
                  }
                  ... on BasicRelationship {
                    id
                    entity_type
                    parent_types
                  }
                  ... on StixCoreObject {
                    created_at
                  }
                  ... on StixRelationship {
                    relationship_type
                    created_at
                    ... on StixCoreRelationship {
                      start_time
                      stop_time
                      description
                    }
                    ... on StixSightingRelationship {
                      first_seen
                      last_seen
                    }
                    created
                  }
                  ... on AttackPattern {
                    name
                  }
                  ... on Campaign {
                    name
                  }
                  ... on CourseOfAction {
                    name
                  }
                  ... on Individual {
                    name
                  }
                  ... on Organization {
                    name
                  }
                  ... on Sector {
                    name
                  }
                  ... on System {
                    name
                  }
                  ... on Indicator {
                    name
                  }
                  ... on Infrastructure {
                    name
                  }
                  ... on IntrusionSet {
                    name
                  }
                  ... on Position {
                    name
                  }
                  ... on City {
                    name
                  }
                  ... on Country {
                    name
                  }
                  ... on Region {
                    name
                  }
                  ... on Malware {
                    name
                  }
                  ... on ThreatActor {
                    name
                  }
                  ... on Tool {
                    name
                  }
                  ... on Vulnerability {
                    name
                  }
                  ... on Incident {
                    name
                  }
                  ... on Event {
                    name
                  }
                  ... on Channel {
                    name
                  }
                  ... on Narrative {
                    name
                  }
                  ... on Language {
                    name
                  }
                  ... on DataComponent {
                    name
                  }
                  ... on DataSource {
                    name
                  }
                  ... on Case {
                    name
                  }
                  ... on StixCyberObservable {
                    observable_value
                  }
                  ... on ObservedData {
                    name
                    objects(first: 1) {
                      edges {
                        node {
                          ... on StixCoreObject {
                            id
                            entity_type
                            parent_types
                            created_at
                            createdBy {
                              ... on Identity {
                                id
                                name
                                entity_type
                              }
                            }
                            objectMarking {
                              id
                              definition
                              x_opencti_order
                              x_opencti_color
                            }
                          }
                          ... on AttackPattern {
                            name
                            description
                            x_mitre_id
                          }
                          ... on Campaign {
                            name
                            description
                            first_seen
                            last_seen
                          }
                          ... on Note {
                            attribute_abstract
                          }
                          ... on ObservedData {
                            name
                            first_observed
                            last_observed
                          }
                          ... on Opinion {
                            opinion
                          }
                          ... on Report {
                            name
                            description
                            published
                          }
                          ... on Grouping {
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
                            valid_from
                          }
                          ... on Infrastructure {
                            name
                            description
                          }
                          ... on IntrusionSet {
                            name
                            description
                            first_seen
                            last_seen
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
                            first_seen
                            last_seen
                          }
                          ... on ThreatActor {
                            name
                            description
                            first_seen
                            last_seen
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
                            first_seen
                            last_seen
                          }
                          ... on Event {
                            name
                          }
                          ... on Channel {
                            name
                          }
                          ... on Narrative {
                            name
                          }
                          ... on Language {
                            name
                          }
                          ... on DataComponent {
                            name
                          }
                          ... on DataSource {
                            name
                          }
                          ... on Case {
                            name
                          }
                          ... on ExternalReference {
                            source_name
                            url
                            external_id
                          }
                          ... on MarkingDefinition {
                            definition_type
                            definition
                          }
                          ... on StixCyberObservable {
                            observable_value
                            x_opencti_description
                          }
                        }
                      }
                    }
                  }
                  ... on StixRelationship {
                    id
                    entity_type
                    relationship_type
                    ... on StixCoreRelationship {
                      start_time
                      stop_time
                      description
                    }
                    ... on StixSightingRelationship {
                      first_seen
                      last_seen
                    }
                    created
                    from {
                      ... on BasicObject {
                        id
                        entity_type
                      }
                      ... on BasicRelationship {
                        id
                        entity_type
                      }
                      ... on StixCoreObject {
                        created_at
                      }
                      ... on StixRelationship {
                        created_at
                        ... on StixCoreRelationship {
                          start_time
                          stop_time
                          description
                        }
                        ... on StixSightingRelationship {
                          first_seen
                          last_seen
                        }
                        created
                      }
                      ... on AttackPattern {
                        name
                      }
                      ... on Campaign {
                        name
                      }
                      ... on CourseOfAction {
                        name
                      }
                      ... on Individual {
                        name
                      }
                      ... on Organization {
                        name
                      }
                      ... on Sector {
                        name
                      }
                      ... on System {
                        name
                      }
                      ... on Indicator {
                        name
                      }
                      ... on Infrastructure {
                        name
                      }
                      ... on IntrusionSet {
                        name
                      }
                      ... on Position {
                        name
                      }
                      ... on City {
                        name
                      }
                      ... on Country {
                        name
                      }
                      ... on Region {
                        name
                      }
                      ... on Malware {
                        name
                      }
                      ... on ThreatActor {
                        name
                      }
                      ... on Tool {
                        name
                      }
                      ... on Vulnerability {
                        name
                      }
                      ... on Incident {
                        name
                      }
                      ... on Event {
                        name
                      }
                      ... on Channel {
                        name
                      }
                      ... on Narrative {
                        name
                      }
                      ... on Language {
                        name
                      }
                      ... on DataComponent {
                        name
                      }
                      ... on DataSource {
                        name
                      }
                      ... on Case {
                        name
                      }
                    }
                    to {
                      ... on BasicObject {
                        id
                        entity_type
                      }
                      ... on BasicRelationship {
                        id
                        entity_type
                      }
                      ... on StixCoreObject {
                        created_at
                      }
                      ... on StixRelationship {
                        created_at
                        ... on StixCoreRelationship {
                          start_time
                          stop_time
                          description
                        }
                        ... on StixSightingRelationship {
                          first_seen
                          last_seen
                        }
                        created
                      }
                      ... on AttackPattern {
                        name
                      }
                      ... on Campaign {
                        name
                      }
                      ... on CourseOfAction {
                        name
                      }
                      ... on Individual {
                        name
                      }
                      ... on Organization {
                        name
                      }
                      ... on Sector {
                        name
                      }
                      ... on System {
                        name
                      }
                      ... on Indicator {
                        name
                      }
                      ... on Infrastructure {
                        name
                      }
                      ... on IntrusionSet {
                        name
                      }
                      ... on Position {
                        name
                      }
                      ... on City {
                        name
                      }
                      ... on Country {
                        name
                      }
                      ... on Region {
                        name
                      }
                      ... on Malware {
                        name
                      }
                      ... on ThreatActor {
                        name
                      }
                      ... on Tool {
                        name
                      }
                      ... on Vulnerability {
                        name
                      }
                      ... on Incident {
                        name
                      }
                      ... on Event {
                        name
                      }
                      ... on Channel {
                        name
                      }
                      ... on Narrative {
                        name
                      }
                      ... on Language {
                        name
                      }
                      ... on DataComponent {
                        name
                      }
                      ... on DataSource {
                        name
                      }
                      ... on Case {
                        name
                      }
                      ... on ObservedData {
                        name
                        objects(first: 1) {
                          edges {
                            node {
                              ... on StixCoreObject {
                                id
                                entity_type
                                parent_types
                                created_at
                                createdBy {
                                  ... on Identity {
                                    id
                                    name
                                    entity_type
                                  }
                                }
                                objectMarking {
                                  id
                                  definition
                                  x_opencti_order
                                  x_opencti_color
                                }
                              }
                              ... on AttackPattern {
                                name
                                description
                                x_mitre_id
                              }
                              ... on Campaign {
                                name
                                description
                                first_seen
                                last_seen
                              }
                              ... on Note {
                                attribute_abstract
                              }
                              ... on ObservedData {
                                name
                                first_observed
                                last_observed
                              }
                              ... on Opinion {
                                opinion
                              }
                              ... on Report {
                                name
                                description
                                published
                              }
                              ... on Grouping {
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
                                valid_from
                              }
                              ... on Infrastructure {
                                name
                                description
                              }
                              ... on IntrusionSet {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on ThreatActor {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on Event {
                                name
                              }
                              ... on Channel {
                                name
                              }
                              ... on Narrative {
                                name
                              }
                              ... on Language {
                                name
                              }
                              ... on DataComponent {
                                name
                              }
                              ... on DataSource {
                                name
                              }
                              ... on Case {
                                name
                              }
                              ... on StixCyberObservable {
                                observable_value
                                x_opencti_description
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                to {
                  ... on BasicObject {
                    id
                    entity_type
                    parent_types
                  }
                  ... on BasicRelationship {
                    id
                    entity_type
                    parent_types
                  }
                  ... on StixCoreObject {
                    created_at
                  }
                  ... on StixRelationship {
                    created_at
                    relationship_type
                    ... on StixCoreRelationship {
                      start_time
                      stop_time
                      description
                    }
                    ... on StixSightingRelationship {
                      first_seen
                      last_seen
                    }
                    created
                  }
                  ... on AttackPattern {
                    name
                  }
                  ... on Campaign {
                    name
                  }
                  ... on CourseOfAction {
                    name
                  }
                  ... on Individual {
                    name
                  }
                  ... on Organization {
                    name
                  }
                  ... on Sector {
                    name
                  }
                  ... on System {
                    name
                  }
                  ... on Indicator {
                    name
                  }
                  ... on Infrastructure {
                    name
                  }
                  ... on IntrusionSet {
                    name
                  }
                  ... on Position {
                    name
                  }
                  ... on City {
                    name
                  }
                  ... on Country {
                    name
                  }
                  ... on Region {
                    name
                  }
                  ... on Malware {
                    name
                  }
                  ... on ThreatActor {
                    name
                  }
                  ... on Tool {
                    name
                  }
                  ... on Vulnerability {
                    name
                  }
                  ... on Incident {
                    name
                  }
                  ... on Event {
                    name
                  }
                  ... on Channel {
                    name
                  }
                  ... on Narrative {
                    name
                  }
                  ... on Language {
                    name
                  }
                  ... on DataComponent {
                    name
                  }
                  ... on DataSource {
                    name
                  }
                  ... on Case {
                    name
                  }
                  ... on StixCyberObservable {
                    observable_value
                  }
                  ... on ObservedData {
                    name
                    objects(first: 1) {
                      edges {
                        node {
                          ... on StixCoreObject {
                            id
                            entity_type
                            parent_types
                            created_at
                            createdBy {
                              ... on Identity {
                                id
                                name
                                entity_type
                              }
                            }
                            objectMarking {
                              id
                              definition
                              x_opencti_order
                              x_opencti_color
                            }
                          }
                          ... on AttackPattern {
                            name
                            description
                            x_mitre_id
                          }
                          ... on Campaign {
                            name
                            description
                            first_seen
                            last_seen
                          }
                          ... on Note {
                            attribute_abstract
                          }
                          ... on ObservedData {
                            name
                            first_observed
                            last_observed
                          }
                          ... on Opinion {
                            opinion
                          }
                          ... on Report {
                            name
                            description
                            published
                          }
                          ... on Grouping {
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
                            valid_from
                          }
                          ... on Infrastructure {
                            name
                            description
                          }
                          ... on IntrusionSet {
                            name
                            description
                            first_seen
                            last_seen
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
                            first_seen
                            last_seen
                          }
                          ... on ThreatActor {
                            name
                            description
                            first_seen
                            last_seen
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
                            first_seen
                            last_seen
                          }
                          ... on Event {
                            name
                          }
                          ... on Channel {
                            name
                          }
                          ... on Narrative {
                            name
                          }
                          ... on Language {
                            name
                          }
                          ... on DataComponent {
                            name
                          }
                          ... on DataSource {
                            name
                          }
                          ... on Case {
                            name
                          }
                          ... on StixCyberObservable {
                            observable_value
                            x_opencti_description
                          }
                        }
                      }
                    }
                  }
                  ... on StixRelationship {
                    id
                    entity_type
                    relationship_type
                    ... on StixCoreRelationship {
                      start_time
                      stop_time
                      description
                    }
                    ... on StixSightingRelationship {
                      first_seen
                      last_seen
                    }
                    created
                    from {
                      ... on BasicObject {
                        id
                        entity_type
                        parent_types
                      }
                      ... on BasicRelationship {
                        id
                        entity_type
                        parent_types
                      }
                      ... on StixCoreObject {
                        created_at
                      }
                      ... on StixRelationship {
                        created_at
                        ... on StixCoreRelationship {
                          start_time
                          stop_time
                          description
                        }
                        ... on StixSightingRelationship {
                          first_seen
                          last_seen
                        }
                        created
                      }
                      ... on AttackPattern {
                        name
                      }
                      ... on Campaign {
                        name
                      }
                      ... on CourseOfAction {
                        name
                      }
                      ... on Individual {
                        name
                      }
                      ... on Organization {
                        name
                      }
                      ... on Sector {
                        name
                      }
                      ... on System {
                        name
                      }
                      ... on Indicator {
                        name
                      }
                      ... on Infrastructure {
                        name
                      }
                      ... on IntrusionSet {
                        name
                      }
                      ... on Position {
                        name
                      }
                      ... on City {
                        name
                      }
                      ... on Country {
                        name
                      }
                      ... on Region {
                        name
                      }
                      ... on Malware {
                        name
                      }
                      ... on ThreatActor {
                        name
                      }
                      ... on Tool {
                        name
                      }
                      ... on Vulnerability {
                        name
                      }
                      ... on Incident {
                        name
                      }
                      ... on Event {
                        name
                      }
                      ... on Channel {
                        name
                      }
                      ... on Narrative {
                        name
                      }
                      ... on Language {
                        name
                      }
                      ... on DataComponent {
                        name
                      }
                      ... on DataSource {
                        name
                      }
                      ... on Case {
                        name
                      }
                      ... on Report {
                        name
                      }
                      ... on ExternalReference {
                        source_name
                        url
                        external_id
                      }
                      ... on MarkingDefinition {
                        definition_type
                        definition
                      }
                      ... on StixCyberObservable {
                        observable_value
                      }
                      ... on ObservedData {
                        name
                        objects(first: 1) {
                          edges {
                            node {
                              ... on StixCoreObject {
                                id
                                entity_type
                                parent_types
                                created_at
                                createdBy {
                                  ... on Identity {
                                    id
                                    name
                                    entity_type
                                  }
                                }
                                objectMarking {
                                  id
                                  definition
                                  x_opencti_order
                                  x_opencti_color
                                }
                              }
                              ... on AttackPattern {
                                name
                                description
                                x_mitre_id
                              }
                              ... on Campaign {
                                name
                                description
                                first_seen
                                last_seen
                              }
                              ... on Note {
                                attribute_abstract
                              }
                              ... on ObservedData {
                                name
                                first_observed
                                last_observed
                              }
                              ... on Opinion {
                                opinion
                              }
                              ... on Report {
                                name
                                description
                                published
                              }
                              ... on Grouping {
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
                                valid_from
                              }
                              ... on Infrastructure {
                                name
                                description
                              }
                              ... on IntrusionSet {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on ThreatActor {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on Event {
                                name
                              }
                              ... on Channel {
                                name
                              }
                              ... on Narrative {
                                name
                              }
                              ... on Language {
                                name
                              }
                              ... on DataComponent {
                                name
                              }
                              ... on DataSource {
                                name
                              }
                              ... on Case {
                                name
                              }
                              ... on StixCyberObservable {
                                observable_value
                                x_opencti_description
                              }
                            }
                          }
                        }
                      }
                    }
                    to {
                      ... on BasicObject {
                        id
                        entity_type
                        parent_types
                      }
                      ... on BasicRelationship {
                        id
                        entity_type
                        parent_types
                      }
                      ... on StixCoreObject {
                        created_at
                      }
                      ... on StixRelationship {
                        created_at
                        ... on StixCoreRelationship {
                          start_time
                          stop_time
                          description
                        }
                        ... on StixSightingRelationship {
                          first_seen
                          last_seen
                        }
                        created
                      }
                      ... on AttackPattern {
                        name
                      }
                      ... on Campaign {
                        name
                      }
                      ... on CourseOfAction {
                        name
                      }
                      ... on Individual {
                        name
                      }
                      ... on Organization {
                        name
                      }
                      ... on Sector {
                        name
                      }
                      ... on System {
                        name
                      }
                      ... on Indicator {
                        name
                      }
                      ... on Infrastructure {
                        name
                      }
                      ... on IntrusionSet {
                        name
                      }
                      ... on Position {
                        name
                      }
                      ... on City {
                        name
                      }
                      ... on Country {
                        name
                      }
                      ... on Region {
                        name
                      }
                      ... on Malware {
                        name
                      }
                      ... on ThreatActor {
                        name
                      }
                      ... on Tool {
                        name
                      }
                      ... on Vulnerability {
                        name
                      }
                      ... on Incident {
                        name
                      }
                      ... on Event {
                        name
                      }
                      ... on Channel {
                        name
                      }
                      ... on Narrative {
                        name
                      }
                      ... on Language {
                        name
                      }
                      ... on DataComponent {
                        name
                      }
                      ... on DataSource {
                        name
                      }
                      ... on Case {
                        name
                      }
                      ... on Report {
                        name
                      }
                      ... on ExternalReference {
                        source_name
                        url
                        external_id
                      }
                      ... on MarkingDefinition {
                        definition_type
                        definition
                      }
                      ... on StixCyberObservable {
                        observable_value
                      }
                      ... on ObservedData {
                        name
                        objects(first: 1) {
                          edges {
                            node {
                              ... on StixCoreObject {
                                id
                                entity_type
                                parent_types
                                created_at
                                createdBy {
                                  ... on Identity {
                                    id
                                    name
                                    entity_type
                                  }
                                }
                                objectMarking {
                                  id
                                  definition
                                  x_opencti_order
                                  x_opencti_color
                                }
                              }
                              ... on AttackPattern {
                                name
                                description
                                x_mitre_id
                              }
                              ... on Campaign {
                                name
                                description
                                first_seen
                                last_seen
                              }
                              ... on Note {
                                attribute_abstract
                              }
                              ... on ObservedData {
                                name
                                first_observed
                                last_observed
                              }
                              ... on Opinion {
                                opinion
                              }
                              ... on Report {
                                name
                                description
                                published
                              }
                              ... on Grouping {
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
                                valid_from
                              }
                              ... on Infrastructure {
                                name
                                description
                              }
                              ... on IntrusionSet {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on ThreatActor {
                                name
                                description
                                first_seen
                                last_seen
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
                                first_seen
                                last_seen
                              }
                              ... on Event {
                                name
                              }
                              ... on Channel {
                                name
                              }
                              ... on Narrative {
                                name
                              }
                              ... on Language {
                                name
                              }
                              ... on DataComponent {
                                name
                              }
                              ... on DataSource {
                                name
                              }
                              ... on Case {
                                name
                              }
                              ... on StixCyberObservable {
                                observable_value
                                x_opencti_description
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          createdBy {
            ... on Identity {
              id
              name
              entity_type
            }
          }
          objectMarking {
            id
            definition
            x_opencti_order
            x_opencti_color
          }
          from {
            ... on BasicObject {
              id
              entity_type
              parent_types
            }
            ... on BasicRelationship {
              id
              entity_type
              parent_types
            }
            ... on StixCoreObject {
              created_at
            }
            ... on StixRelationship {
              created_at
              ... on StixCoreRelationship {
                start_time
                stop_time
                description
              }
              ... on StixSightingRelationship {
                first_seen
                last_seen
              }
              created
            }
            ... on AttackPattern {
              name
            }
            ... on Campaign {
              name
            }
            ... on CourseOfAction {
              name
            }
            ... on Individual {
              name
            }
            ... on Organization {
              name
            }
            ... on Sector {
              name
            }
            ... on System {
              name
            }
            ... on Indicator {
              name
            }
            ... on Infrastructure {
              name
            }
            ... on IntrusionSet {
              name
            }
            ... on Position {
              name
            }
            ... on City {
              name
            }
            ... on Country {
              name
            }
            ... on Region {
              name
            }
            ... on Malware {
              name
            }
            ... on ThreatActor {
              name
            }
            ... on Tool {
              name
            }
            ... on Vulnerability {
              name
            }
            ... on Incident {
              name
            }
            ... on Event {
              name
            }
            ... on Channel {
              name
            }
            ... on Narrative {
              name
            }
            ... on Language {
              name
            }
            ... on DataComponent {
              name
            }
            ... on DataSource {
              name
            }
            ... on Case {
              name
            }
            ... on Report {
              name
            }
            ... on Note {
              attribute_abstract
              content
            }
            ... on ExternalReference {
              source_name
              url
              external_id
            }
            ... on MarkingDefinition {
              definition_type
              definition
            }
            ... on StixCyberObservable {
              observable_value
            }
            ... on ObservedData {
              name
              objects(first: 1) {
                edges {
                  node {
                    ... on StixCoreObject {
                      id
                      entity_type
                      parent_types
                      created_at
                      createdBy {
                        ... on Identity {
                          id
                          name
                          entity_type
                        }
                      }
                      objectMarking {
                        id
                        definition
                        x_opencti_order
                        x_opencti_color
                      }
                    }
                    ... on AttackPattern {
                      name
                      description
                      x_mitre_id
                    }
                    ... on Campaign {
                      name
                      description
                      first_seen
                      last_seen
                    }
                    ... on Note {
                      attribute_abstract
                    }
                    ... on ObservedData {
                      name
                      first_observed
                      last_observed
                    }
                    ... on Opinion {
                      opinion
                    }
                    ... on Report {
                      name
                      description
                      published
                    }
                    ... on Grouping {
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
                      valid_from
                    }
                    ... on Infrastructure {
                      name
                      description
                    }
                    ... on IntrusionSet {
                      name
                      description
                      first_seen
                      last_seen
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
                      first_seen
                      last_seen
                    }
                    ... on ThreatActor {
                      name
                      description
                      first_seen
                      last_seen
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
                      first_seen
                      last_seen
                    }
                    ... on Event {
                      name
                    }
                    ... on Channel {
                      name
                    }
                    ... on Narrative {
                      name
                    }
                    ... on Language {
                      name
                    }
                    ... on DataComponent {
                      name
                    }
                    ... on DataSource {
                      name
                    }
                    ... on Case {
                      name
                    }
                    ... on Report {
                      name
                    }
                    ... on ExternalReference {
                      source_name
                      url
                      external_id
                    }
                    ... on MarkingDefinition {
                      definition_type
                      definition
                    }
                    ... on StixCyberObservable {
                      observable_value
                      x_opencti_description
                    }
                  }
                }
              }
            }
            ... on StixRelationship {
              id
              entity_type
              relationship_type
              ... on StixCoreRelationship {
                start_time
                stop_time
                description
              }
              ... on StixSightingRelationship {
                first_seen
                last_seen
              }
              created
              from {
                ... on BasicObject {
                  id
                  entity_type
                }
                ... on BasicRelationship {
                  id
                  entity_type
                }
                ... on StixCoreObject {
                  created_at
                }
                ... on StixRelationship {
                  created_at
                  ... on StixCoreRelationship {
                    start_time
                    stop_time
                    description
                  }
                  ... on StixSightingRelationship {
                    first_seen
                    last_seen
                  }
                  created
                }
                ... on AttackPattern {
                  name
                }
                ... on Campaign {
                  name
                }
                ... on CourseOfAction {
                  name
                }
                ... on Individual {
                  name
                }
                ... on Organization {
                  name
                }
                ... on Sector {
                  name
                }
                ... on System {
                  name
                }
                ... on Indicator {
                  name
                }
                ... on Infrastructure {
                  name
                }
                ... on IntrusionSet {
                  name
                }
                ... on Position {
                  name
                }
                ... on City {
                  name
                }
                ... on Country {
                  name
                }
                ... on Region {
                  name
                }
                ... on Malware {
                  name
                }
                ... on ThreatActor {
                  name
                }
                ... on Tool {
                  name
                }
                ... on Vulnerability {
                  name
                }
                ... on Incident {
                  name
                }
                ... on Event {
                  name
                }
                ... on Channel {
                  name
                }
                ... on Narrative {
                  name
                }
                ... on Language {
                  name
                }
                ... on DataComponent {
                  name
                }
                ... on DataSource {
                  name
                }
                ... on Case {
                  name
                }
                ... on Report {
                  name
                }
                ... on ExternalReference {
                  source_name
                  url
                  external_id
                }
                ... on MarkingDefinition {
                  definition_type
                  definition
                }
              }
              to {
                ... on BasicObject {
                  id
                  entity_type
                }
                ... on BasicRelationship {
                  id
                  entity_type
                }
                ... on StixCoreObject {
                  created_at
                }
                ... on StixRelationship {
                  created_at
                  ... on StixCoreRelationship {
                    start_time
                    stop_time
                    description
                  }
                  ... on StixSightingRelationship {
                    first_seen
                    last_seen
                  }
                  created
                }
                ... on AttackPattern {
                  name
                }
                ... on Campaign {
                  name
                }
                ... on CourseOfAction {
                  name
                }
                ... on Individual {
                  name
                }
                ... on Organization {
                  name
                }
                ... on Sector {
                  name
                }
                ... on System {
                  name
                }
                ... on Indicator {
                  name
                }
                ... on Infrastructure {
                  name
                }
                ... on IntrusionSet {
                  name
                }
                ... on Position {
                  name
                }
                ... on City {
                  name
                }
                ... on Country {
                  name
                }
                ... on Region {
                  name
                }
                ... on Malware {
                  name
                }
                ... on ThreatActor {
                  name
                }
                ... on Tool {
                  name
                }
                ... on Vulnerability {
                  name
                }
                ... on Incident {
                  name
                }
                ... on Event {
                  name
                }
                ... on Channel {
                  name
                }
                ... on Narrative {
                  name
                }
                ... on Language {
                  name
                }
                ... on DataComponent {
                  name
                }
                ... on DataSource {
                  name
                }
                ... on Case {
                  name
                }
                ... on Report {
                  name
                }
                ... on ExternalReference {
                  source_name
                  url
                  external_id
                }
                ... on MarkingDefinition {
                  definition_type
                  definition
                }
              }
            }
          }
          to {
            ... on BasicObject {
              id
              entity_type
              parent_types
            }
            ... on BasicRelationship {
              id
              entity_type
              parent_types
            }
            ... on StixCoreObject {
              created_at
            }
            ... on StixRelationship {
              created_at
              ... on StixCoreRelationship {
                start_time
                stop_time
                description
              }
              ... on StixSightingRelationship {
                first_seen
                last_seen
              }
              created
            }
            ... on AttackPattern {
              name
            }
            ... on Campaign {
              name
            }
            ... on CourseOfAction {
              name
            }
            ... on Individual {
              name
            }
            ... on Organization {
              name
            }
            ... on Sector {
              name
            }
            ... on System {
              name
            }
            ... on Indicator {
              name
            }
            ... on Infrastructure {
              name
            }
            ... on IntrusionSet {
              name
            }
            ... on Position {
              name
            }
            ... on City {
              name
            }
            ... on Country {
              name
            }
            ... on Region {
              name
            }
            ... on Malware {
              name
            }
            ... on ThreatActor {
              name
            }
            ... on Tool {
              name
            }
            ... on Vulnerability {
              name
            }
            ... on Incident {
              name
            }
            ... on Event {
              name
            }
            ... on Channel {
              name
            }
            ... on Narrative {
              name
            }
            ... on Language {
              name
            }
            ... on DataComponent {
              name
            }
            ... on DataSource {
              name
            }
            ... on Case {
              name
            }
            ... on Report {
              name
            }
            ... on Note {
              attribute_abstract
              content
            }
            ... on ExternalReference {
              source_name
              url
              external_id
            }
            ... on MarkingDefinition {
              definition_type
              definition
            }
            ... on StixCyberObservable {
              observable_value
            }
            ... on ObservedData {
              name
              objects(first: 1) {
                edges {
                  node {
                    ... on StixCoreObject {
                      id
                      entity_type
                      parent_types
                      created_at
                      createdBy {
                        ... on Identity {
                          id
                          name
                          entity_type
                        }
                      }
                      objectMarking {
                        id
                        definition
                        x_opencti_order
                        x_opencti_color
                      }
                    }
                    ... on AttackPattern {
                      name
                      description
                      x_mitre_id
                    }
                    ... on Campaign {
                      name
                      description
                      first_seen
                      last_seen
                    }
                    ... on Note {
                      attribute_abstract
                    }
                    ... on ObservedData {
                      name
                      first_observed
                      last_observed
                    }
                    ... on Opinion {
                      opinion
                    }
                    ... on Report {
                      name
                      description
                      published
                    }
                    ... on Grouping {
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
                      valid_from
                    }
                    ... on Infrastructure {
                      name
                      description
                    }
                    ... on IntrusionSet {
                      name
                      description
                      first_seen
                      last_seen
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
                      first_seen
                      last_seen
                    }
                    ... on ThreatActor {
                      name
                      description
                      first_seen
                      last_seen
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
                      first_seen
                      last_seen
                    }
                    ... on Event {
                      name
                    }
                    ... on Channel {
                      name
                    }
                    ... on Narrative {
                      name
                    }
                    ... on Language {
                      name
                    }
                    ... on DataComponent {
                      name
                    }
                    ... on DataSource {
                      name
                    }
                    ... on Case {
                      name
                    }
                    ... on Report {
                      name
                    }
                    ... on ExternalReference {
                      source_name
                      url
                      external_id
                    }
                    ... on MarkingDefinition {
                      definition_type
                      definition
                    }
                    ... on StixCyberObservable {
                      observable_value
                      x_opencti_description
                    }
                  }
                }
              }
            }
            ... on StixRelationship {
              id
              entity_type
              relationship_type
              ... on StixCoreRelationship {
                start_time
                stop_time
                description
              }
              ... on StixSightingRelationship {
                first_seen
                last_seen
              }
              created
              from {
                ... on BasicObject {
                  id
                  entity_type
                  parent_types
                }
                ... on BasicRelationship {
                  id
                  entity_type
                  parent_types
                }
                ... on AttackPattern {
                  name
                }
                ... on Campaign {
                  name
                }
                ... on CourseOfAction {
                  name
                }
                ... on Individual {
                  name
                }
                ... on Organization {
                  name
                }
                ... on Sector {
                  name
                }
                ... on System {
                  name
                }
                ... on Indicator {
                  name
                }
                ... on Infrastructure {
                  name
                }
                ... on IntrusionSet {
                  name
                }
                ... on Position {
                  name
                }
                ... on City {
                  name
                }
                ... on Country {
                  name
                }
                ... on Region {
                  name
                }
                ... on Malware {
                  name
                }
                ... on ThreatActor {
                  name
                }
                ... on Tool {
                  name
                }
                ... on Vulnerability {
                  name
                }
                ... on Incident {
                  name
                }
                ... on Event {
                  name
                }
                ... on Channel {
                  name
                }
                ... on Narrative {
                  name
                }
                ... on Language {
                  name
                }
                ... on DataComponent {
                  name
                }
                ... on DataSource {
                  name
                }
                ... on Case {
                  name
                }
                ... on Report {
                  name
                }
                ... on ExternalReference {
                  source_name
                  url
                  external_id
                }
                ... on MarkingDefinition {
                  definition_type
                  definition
                }
                ... on StixCyberObservable {
                  observable_value
                }
              }
              to {
                ... on BasicObject {
                  id
                  entity_type
                  parent_types
                }
                ... on BasicRelationship {
                  id
                  entity_type
                  parent_types
                }
                ... on AttackPattern {
                  name
                }
                ... on Campaign {
                  name
                }
                ... on CourseOfAction {
                  name
                }
                ... on Individual {
                  name
                }
                ... on Organization {
                  name
                }
                ... on Sector {
                  name
                }
                ... on System {
                  name
                }
                ... on Indicator {
                  name
                }
                ... on Infrastructure {
                  name
                }
                ... on IntrusionSet {
                  name
                }
                ... on Position {
                  name
                }
                ... on City {
                  name
                }
                ... on Country {
                  name
                }
                ... on Region {
                  name
                }
                ... on Malware {
                  name
                }
                ... on ThreatActor {
                  name
                }
                ... on Tool {
                  name
                }
                ... on Vulnerability {
                  name
                }
                ... on Incident {
                  name
                }
                ... on Event {
                  name
                }
                ... on Channel {
                  name
                }
                ... on Narrative {
                  name
                }
                ... on Language {
                  name
                }
                ... on DataComponent {
                  name
                }
                ... on DataSource {
                  name
                }
                ... on Case {
                  name
                }
                ... on Report {
                  name
                }
                ... on ExternalReference {
                  source_name
                  url
                  external_id
                }
                ... on MarkingDefinition {
                  definition_type
                  definition
                }
                ... on StixCyberObservable {
                  observable_value
                }
              }
            }
          }
        }
      }
    }
  }
`;

const StixRelationshipsList = ({
  variant,
  height,
  startDate,
  endDate,
  dataSelection,
  parameters = {},
}) => {
  const classes = useStyles();
  const { t_i18n, fsd } = useFormatter();
  const renderContent = () => {
    if (!dataSelection) {
      return 'No data selection';
    }
    const selection = dataSelection[0];
    const dateAttribute = selection.date_attribute && selection.date_attribute.length > 0
      ? selection.date_attribute
      : 'created_at';
    const { filters } = buildFiltersAndOptionsForWidgets(selection.filters, { startDate, endDate, dateAttribute });
    return (
      <QueryRenderer
        query={stixRelationshipsListQuery}
        variables={{
          first: 50,
          orderBy: dateAttribute,
          orderMode: 'desc',
          filters,
          dynamicFrom: selection.dynamicFrom,
          dynamicTo: selection.dynamicTo,
        }}
        render={({ props }) => {
          if (
            props
            && props.stixRelationships
            && props.stixRelationships.edges.length > 0
          ) {
            const data = props.stixRelationships.edges;
            return (
              <div id="container" className={classes.container}>
                <List style={{ minWidth: 800, marginTop: -10 }}>
                  {data.map((stixRelationshipEdge) => {
                    const stixRelationship = stixRelationshipEdge.node;
                    const remoteNode = stixRelationship.from
                      ? stixRelationship.from
                      : stixRelationship.to;
                    let link = null;
                    if (remoteNode) {
                      link = computeLink(remoteNode);
                    }
                    return (
                      <ListItem
                        key={stixRelationship.id}
                        dense={true}
                        button={true}
                        className="noDrag"
                        classes={{ root: classes.item }}
                        divider={true}
                        component={Link}
                        to={link}
                      >
                        <ListItemIcon classes={{ root: classes.itemIcon }}>
                          <ItemIcon
                            type={stixRelationship.entity_type}
                            color="primary"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <div>
                              <div
                                className={classes.bodyItem}
                                style={{
                                  width: '10%',
                                  display: 'flex',
                                  paddingRight: 2,
                                }}
                              >
                                <ItemIcon
                                  type={
                                    stixRelationship.from
                                    && stixRelationship.from.entity_type
                                  }
                                  variant="inline"
                                />
                                {/* eslint-disable-next-line no-nested-ternary */}
                                {stixRelationship.from
                                  ? stixRelationship.from.relationship_type
                                    ? t_i18n(
                                      `relationship_${stixRelationship.from.entity_type}`,
                                    )
                                    : t_i18n(
                                      `entity_${stixRelationship.from.entity_type}`,
                                    )
                                  : t_i18n('Restricted')}
                              </div>
                              <div
                                className={classes.bodyItem}
                                style={{ width: '18%', paddingRight: 2 }}
                              >
                                <code>
                                  {stixRelationship.from
                                    ? defaultValue(stixRelationship.from)
                                    : t_i18n('Restricted')}
                                </code>
                              </div>
                              <div
                                className={classes.bodyItem}
                                style={{
                                  width: '10%',
                                  paddingRight: 2,
                                }}
                              >
                                <i>
                                  {t_i18n(
                                    `relationship_${stixRelationship.relationship_type}`,
                                  )}
                                </i>
                              </div>
                              <div
                                className={classes.bodyItem}
                                style={{
                                  width: '10%',
                                  display: 'flex',
                                  paddingRight: 2,
                                }}
                              >
                                <ItemIcon
                                  type={
                                    stixRelationship.to
                                    && stixRelationship.to.entity_type
                                  }
                                  variant="inline"
                                />
                                {/* eslint-disable-next-line no-nested-ternary */}
                                {stixRelationship.to
                                  ? stixRelationship.to.relationship_type
                                    ? t_i18n(
                                      `relationship_${stixRelationship.to.entity_type}`,
                                    )
                                    : t_i18n(
                                      `entity_${stixRelationship.to.entity_type}`,
                                    )
                                  : t_i18n('Restricted')}
                              </div>
                              <div
                                className={classes.bodyItem}
                                style={{ width: '18%', paddingRight: 2 }}
                              >
                                <code>
                                  {stixRelationship.to
                                    ? defaultValue(stixRelationship.to)
                                    : t_i18n('Restricted')}
                                </code>
                              </div>
                              <div
                                className={classes.bodyItem}
                                style={{ width: '10%', paddingRight: 2 }}
                              >
                                {fsd(stixRelationship[dateAttribute])}
                              </div>
                              <div
                                className={classes.bodyItem}
                                style={{ width: '12%', paddingRight: 2 }}
                              >
                                {R.pathOr(
                                  '',
                                  ['createdBy', 'name'],
                                  stixRelationship,
                                )}
                              </div>
                              <div
                                className={classes.bodyItem}
                                style={{ width: '10%', paddingRight: 2 }}
                              >
                                <ItemMarkings
                                  variant="inList"
                                  markingDefinitions={
                                    stixRelationship.objectMarking ?? []
                                  }
                                  limit={1}
                                />
                              </div>
                            </div>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </div>
            );
          }
          if (props) {
            return (
              <div style={{ display: 'table', height: '100%', width: '100%' }}>
                <span
                  style={{
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                  }}
                >
                  {t_i18n('No entities of this type has been found.')}
                </span>
              </div>
            );
          }
          return (
            <div style={{ display: 'table', height: '100%', width: '100%' }}>
              <span
                style={{
                  display: 'table-cell',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                }}
              >
                <CircularProgress size={40} thickness={2} />
              </span>
            </div>
          );
        }}
      />
    );
  };
  return (
    <div style={{ height: height || '100%' }}>
      <Typography
        variant="h4"
        gutterBottom={true}
        style={{
          margin: variant !== 'inLine' ? '0 0 10px 0' : '-10px 0 10px -7px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {parameters.title ?? t_i18n('Relationships list')}
      </Typography>
      {variant !== 'inLine' ? (
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {renderContent()}
        </Paper>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default StixRelationshipsList;
