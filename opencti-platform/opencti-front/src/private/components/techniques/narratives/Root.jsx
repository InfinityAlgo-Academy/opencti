import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Routes, Link, Navigate } from 'react-router-dom';
import { graphql } from 'react-relay';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import * as R from 'ramda';
import withRouter from '../../../../utils/compat-router/withRouter';
import { QueryRenderer, requestSubscription } from '../../../../relay/environment';
import Narrative from './Narrative';
import NarrativeKnowledge from './NarrativeKnowledge';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import FileManager from '../../common/files/FileManager';
import NarrativePopover from './NarrativePopover';
import Loader from '../../../../components/Loader';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import StixCoreObjectOrStixCoreRelationshipContainers from '../../common/containers/StixCoreObjectOrStixCoreRelationshipContainers';
import StixCoreObjectKnowledgeBar from '../../common/stix_core_objects/StixCoreObjectKnowledgeBar';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import inject18n from '../../../../components/i18n';
import Breadcrumbs from '../../../../components/Breadcrumbs';

const subscription = graphql`
  subscription RootNarrativeSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Narrative {
        ...Narrative_narrative
        ...NarrativeEditionContainer_narrative
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
      ...FileExternalReferencesViewer_entity
      ...WorkbenchFileViewer_entity
    }
  }
`;

const narrativeQuery = graphql`
  query RootNarrativeQuery($id: String!) {
    narrative(id: $id) {
      id
      standard_id
      entity_type
      name
      aliases
      x_opencti_graph_data
      ...Narrative_narrative
      ...NarrativeKnowledge_narrative
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

class RootNarrative extends Component {
  constructor(props) {
    super(props);
    const {
      params: { narrativeId },
    } = props;
    this.sub = requestSubscription({
      subscription,
      variables: { id: narrativeId },
    });
  }

  componentWillUnmount() {
    this.sub.dispose();
  }

  render() {
    const {
      t,
      location,
      params: { narrativeId },
    } = this.props;
    const link = `/dashboard/techniques/narratives/${narrativeId}/knowledge`;
    return (
      <>
        <Routes>
          <Route
            path="/knowledge/*"
            element={
              <StixCoreObjectKnowledgeBar
                stixCoreObjectLink={link}
                availableSections={[
                  'threat_actors',
                  'intrusion_sets',
                  'campaigns',
                  'incidents',
                  'channels',
                  'observables',
                  'sightings',
                ]}
              />
            }
          />
        </Routes>
        <QueryRenderer
          query={narrativeQuery}
          variables={{ id: narrativeId }}
          render={({ props }) => {
            if (props) {
              if (props.narrative) {
                const { narrative } = props;
                return (
                  <div
                    style={{
                      paddingRight: location.pathname.includes(
                        `/dashboard/techniques/narratives/${narrative.id}/knowledge`,
                      )
                        ? 200
                        : 0,
                    }}
                  >
                    <Breadcrumbs variant="object" elements={[
                      { label: t('Techniques') },
                      { label: t('Narratives'), link: '/dashboard/techniques/narratives' },
                      { label: narrative.name, current: true },
                    ]}
                    />
                    <StixDomainObjectHeader
                      entityType="Narrative"
                      disableSharing={true}
                      stixDomainObject={props.narrative}
                      PopoverComponent={<NarrativePopover />}
                    />
                    <Box
                      sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        marginBottom: 4,
                      }}
                    >
                      <Tabs
                        value={
                          location.pathname.includes(
                            `/dashboard/techniques/narratives/${narrative.id}/knowledge`,
                          )
                            ? `/dashboard/techniques/narratives/${narrative.id}/knowledge`
                            : location.pathname
                        }
                      >
                        <Tab
                          component={Link}
                          to={`/dashboard/techniques/narratives/${narrative.id}`}
                          value={`/dashboard/techniques/narratives/${narrative.id}`}
                          label={t('Overview')}
                        />
                        <Tab
                          component={Link}
                          to={`/dashboard/techniques/narratives/${narrative.id}/knowledge/overview`}
                          value={`/dashboard/techniques/narratives/${narrative.id}/knowledge`}
                          label={t('Knowledge')}
                        />
                        <Tab
                          component={Link}
                          to={`/dashboard/techniques/narratives/${narrative.id}/analyses`}
                          value={`/dashboard/techniques/narratives/${narrative.id}/analyses`}
                          label={t('Analyses')}
                        />
                        <Tab
                          component={Link}
                          to={`/dashboard/techniques/narratives/${narrative.id}/files`}
                          value={`/dashboard/techniques/narratives/${narrative.id}/files`}
                          label={t('Data')}
                        />
                        <Tab
                          component={Link}
                          to={`/dashboard/techniques/narratives/${narrative.id}/history`}
                          value={`/dashboard/techniques/narratives/${narrative.id}/history`}
                          label={t('History')}
                        />
                      </Tabs>
                    </Box>
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <Narrative narrative={props.narrative} />
                        }
                      />
                      <Route
                        path="/knowledge"
                        element={
                          <Navigate to={`/dashboard/techniques/narratives/${narrativeId}/knowledge/overview`} />
                        }
                      />
                      <Route
                        path="/knowledge/*"
                        element={
                          <NarrativeKnowledge narrative={props.narrative} />
                        }
                      />
                      <Route
                        path="/analyses"
                        element={
                          <StixCoreObjectOrStixCoreRelationshipContainers stixDomainObjectOrStixCoreRelationship={props.narrative} />
                        }
                      />
                      <Route
                        path="/files"
                        element={
                          <FileManager
                            id={narrativeId}
                            connectorsImport={props.connectorsForImport}
                            connectorsExport={props.connectorsForExport}
                            entity={props.narrative}
                          />
                        }
                      />
                      <Route
                        path="/history"
                        element={
                          <StixCoreObjectHistory stixCoreObjectId={narrativeId} />
                        }
                      />
                    </Routes>
                  </div>
                );
              }
              return <ErrorNotFound />;
            }
            return <Loader />;
          }}
        />
      </>
    );
  }
}

RootNarrative.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
};

export default R.compose(inject18n, withRouter)(RootNarrative);
