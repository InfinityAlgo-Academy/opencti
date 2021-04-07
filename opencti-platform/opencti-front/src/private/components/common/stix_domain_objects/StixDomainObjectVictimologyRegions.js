import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import { MapOutlined, TableChartOutlined } from '@material-ui/icons';
import { createRefetchContainer } from 'react-relay';
import Tooltip from '@material-ui/core/Tooltip';
import inject18n from '../../../../components/i18n';
import StixCoreRelationshipCreationFromEntity from '../stix_core_relationships/StixCoreRelationshipCreationFromEntity';
import SearchInput from '../../../../components/SearchInput';
import Security, { KNOWLEDGE_KNUPDATE } from '../../../../utils/Security';
import StixDomainObjectVictimologyRegionsList from './StixDomainObjectVictimologyRegionsList';
import StixDomainObjectVictimologyRegionsMap from './StixDomainObjectVictimologyRegionsMap';

const styles = (theme) => ({
  container: {
    paddingBottom: 70,
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  subnested: {
    paddingLeft: theme.spacing(8),
  },
});

class StixDomainObjectVictimologyRegionsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { expandedLines: {}, searchTerm: '' };
  }

  handleSearch(value) {
    this.setState({ searchTerm: value });
  }

  render() {
    const { searchTerm } = this.state;
    const {
      t,
      classes,
      data,
      entityLink,
      paginationOptions,
      stixDomainObjectId,
      handleChangeView,
      currentView,
    } = this.props;
    return (
      <div style={{ marginTop: -10 }}>
        <SearchInput variant="small" onSubmit={this.handleSearch.bind(this)} />
        <div style={{ float: 'right', marginTop: -5 }}>
          <Tooltip title={t('Map view')}>
            <IconButton
              color={currentView === 'map' ? 'secondary' : 'primary'}
              onClick={handleChangeView.bind(this, 'map')}
            >
              <MapOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('Lines view')}>
            <IconButton
              color={currentView === 'list' ? 'secondary' : 'primary'}
              onClick={handleChangeView.bind(this, 'list')}
            >
              <TableChartOutlined />
            </IconButton>
          </Tooltip>
        </div>
        <div className={classes.container} id="container">
          {currentView === 'list' && (
            <StixDomainObjectVictimologyRegionsList
              data={data}
              entityLink={entityLink}
              paginationOptions={paginationOptions}
              handleDelete={this.props.relay.refetch.bind(this)}
              searchTerm={searchTerm}
            />
          )}
          {currentView === 'map' && (
            <StixDomainObjectVictimologyRegionsMap
              data={data}
              entityLink={entityLink}
              paginationOptions={paginationOptions}
              handleDelete={this.props.relay.refetch.bind(this)}
              searchTerm={searchTerm}
            />
          )}
        </div>
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <StixCoreRelationshipCreationFromEntity
            entityId={stixDomainObjectId}
            isRelationReversed={false}
            paddingRight={220}
            onCreate={this.props.relay.refetch.bind(this)}
            targetStixDomainObjectTypes={['Region', 'Country', 'City']}
            allowedRelationshipTypes={['targets']}
            paginationOptions={paginationOptions}
          />
        </Security>
      </div>
    );
  }
}

StixDomainObjectVictimologyRegionsComponent.propTypes = {
  stixDomainObjectId: PropTypes.string,
  currentView: PropTypes.string,
  handleChangeView: PropTypes.func,
  data: PropTypes.object,
  entityLink: PropTypes.string,
  paginationOptions: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export const stixDomainObjectVictimologyRegionsStixCoreRelationshipsQuery = graphql`
  query StixDomainObjectVictimologyRegionsStixCoreRelationshipsQuery(
    $fromId: String
    $toTypes: [String]
    $relationship_type: String
    $first: Int
    $startDate: DateTime
    $endDate: DateTime
  ) {
    ...StixDomainObjectVictimologyRegions_data
  }
`;

const StixDomainObjectVictimologyRegionsSectorLines = createRefetchContainer(
  StixDomainObjectVictimologyRegionsComponent,
  {
    data: graphql`
      fragment StixDomainObjectVictimologyRegions_data on Query {
        stixCoreRelationships(
          fromId: $fromId
          toTypes: $toTypes
          relationship_type: $relationship_type
          first: $first
          startDate: $startDate
          endDate: $endDate
        ) {
          edges {
            node {
              id
              description
              start_time
              stop_time
              to {
                ... on BasicObject {
                  id
                  entity_type
                }
                ... on City {
                  name
                  latitude
                  longitude
                  country {
                    id
                    name
                    x_opencti_aliases
                    region {
                      id
                      name
                    }
                  }
                }
                ... on Country {
                  id
                  name
                  x_opencti_aliases
                  region {
                    id
                    name
                  }
                }
                ... on Region {
                  name
                  x_opencti_aliases
                  countries {
                    edges {
                      node {
                        name
                        x_opencti_aliases
                      }
                    }
                  }
                }
              }
              objectMarking {
                edges {
                  node {
                    id
                    definition
                    x_opencti_color
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
  stixDomainObjectVictimologyRegionsStixCoreRelationshipsQuery,
);

export default compose(
  inject18n,
  withStyles(styles),
)(StixDomainObjectVictimologyRegionsSectorLines);
