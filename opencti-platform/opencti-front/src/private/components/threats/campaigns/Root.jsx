import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Redirect, withRouter, Switch } from 'react-router-dom';
import { graphql } from 'react-relay';
import {
  QueryRenderer,
  requestSubscription,
} from '../../../../relay/environment';
import Campaign from './Campaign';
import CampaignKnowledge from './CampaignKnowledge';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import FileManager from '../../common/files/FileManager';
import CampaignPopover from './CampaignPopover';
import Loader from '../../../../components/Loader';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import StixCoreObjectOrStixCoreRelationshipContainers from '../../common/containers/StixCoreObjectOrStixCoreRelationshipContainers';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import StixCoreObjectKnowledgeBar from '../../common/stix_core_objects/StixCoreObjectKnowledgeBar';

const subscription = graphql`
  subscription RootCampaignSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Campaign {
        ...Campaign_campaign
        ...CampaignEditionContainer_campaign
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
  }
`;

const campaignQuery = graphql`
  query RootCampaignQuery($id: String!) {
    campaign(id: $id) {
      id
      standard_id
      entity_type
      name
      aliases
      x_opencti_graph_data
      ...Campaign_campaign
      ...CampaignKnowledge_campaign
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
    connectorsForImport {
      ...FileManager_connectorsImport
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
  }
`;

class RootCampaign extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { campaignId },
      },
    } = props;
    this.sub = requestSubscription({
      subscription,
      variables: { id: campaignId },
    });
  }

  componentWillUnmount() {
    this.sub.dispose();
  }

  render() {
    const {
      match: {
        params: { campaignId },
      },
    } = this.props;
    const link = `/dashboard/threats/campaigns/${campaignId}/knowledge`;
    return (
      <div>
        <Route path="/dashboard/threats/campaigns/:campaignId/knowledge">
          <StixCoreObjectKnowledgeBar
            stixCoreObjectLink={link}
            availableSections={[
              'attribution',
              'victimology',
              'incidents',
              'malwares',
              'tools',
              'channels',
              'narratives',
              'attack_patterns',
              'vulnerabilities',
              'indicators',
              'observables',
              'infrastructures',
              'sightings',
            ]}
          />
        </Route>
        <QueryRenderer
          query={campaignQuery}
          variables={{ id: campaignId }}
          render={({ props }) => {
            if (props) {
              if (props.campaign) {
                return (
                  <Switch>
                    <Route
                      exact
                      path="/dashboard/threats/campaigns/:campaignId"
                      render={(routeProps) => (
                        <Campaign {...routeProps} campaign={props.campaign} />
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/threats/campaigns/:campaignId/knowledge"
                      render={() => (
                        <Redirect
                          to={`/dashboard/threats/campaigns/${campaignId}/knowledge/overview`}
                        />
                      )}
                    />
                    <Route
                      path="/dashboard/threats/campaigns/:campaignId/knowledge"
                      render={(routeProps) => (
                        <CampaignKnowledge
                          {...routeProps}
                          campaign={props.campaign}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/threats/campaigns/:campaignId/analyses"
                      render={(routeProps) => (
                        <React.Fragment>
                          <StixDomainObjectHeader
                            entityType={'Campaign'}
                            stixDomainObject={props.campaign}
                            PopoverComponent={<CampaignPopover />}
                          />
                          <StixCoreObjectOrStixCoreRelationshipContainers
                            {...routeProps}
                            stixDomainObjectOrStixCoreRelationship={
                              props.campaign
                            }
                          />
                        </React.Fragment>
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/threats/campaigns/:campaignId/files"
                      render={(routeProps) => (
                        <React.Fragment>
                          <StixDomainObjectHeader
                            entityType={'Campaign'}
                            stixDomainObject={props.campaign}
                            PopoverComponent={<CampaignPopover />}
                          />
                          <FileManager
                            {...routeProps}
                            id={campaignId}
                            connectorsImport={props.connectorsForImport}
                            connectorsExport={props.connectorsForExport}
                            entity={props.campaign}
                          />
                        </React.Fragment>
                      )}
                    />
                    <Route
                      exact
                      path="/dashboard/threats/campaigns/:campaignId/history"
                      render={(routeProps) => (
                        <React.Fragment>
                          <StixDomainObjectHeader
                            entityType={'Campaign'}
                            stixDomainObject={props.campaign}
                            PopoverComponent={<CampaignPopover />}
                          />
                          <StixCoreObjectHistory
                            {...routeProps}
                            stixCoreObjectId={campaignId}
                          />
                        </React.Fragment>
                      )}
                    />
                  </Switch>
                );
              }
              return <ErrorNotFound />;
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

RootCampaign.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
};

export default withRouter(RootCampaign);
