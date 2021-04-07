import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import {
  QueryRenderer,
  requestSubscription,
} from '../../../../relay/environment';
import TopBar from '../../nav/TopBar';
import Note from './Note';
import FileManager from '../../common/files/FileManager';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';
import ContainerHeader from '../../common/containers/ContainerHeader';
import Loader from '../../../../components/Loader';
import ReportPopover from '../reports/ReportPopover';

const subscription = graphql`
  subscription RootNoteSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Note {
        ...Note_note
        ...NoteEditionContainer_note
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
  }
`;

const noteQuery = graphql`
  query RootNoteQuery($id: String!) {
    note(id: $id) {
      standard_id
      ...Note_note
      ...NoteDetails_note
      ...ContainerHeader_container
      ...ContainerStixDomainObjects_container
      ...ContainerStixObjectsOrStixRelationships_container
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
    connectorsForImport {
      ...FileManager_connectorsImport
    }
  }
`;

class RootNote extends Component {
  componentDidMount() {
    const {
      match: {
        params: { noteId },
      },
    } = this.props;
    const sub = requestSubscription({
      subscription,
      variables: { id: noteId },
    });
    this.setState({ sub });
  }

  componentWillUnmount() {
    this.state.sub.dispose();
  }

  render() {
    const {
      me,
      match: {
        params: { noteId },
      },
    } = this.props;
    return (
      <div>
        <TopBar me={me || null} />
        <QueryRenderer
          query={noteQuery}
          variables={{ id: noteId }}
          render={({ props }) => {
            if (props && props.note) {
              return (
                <div>
                  <Route
                    exact
                    path="/dashboard/analysis/notes/:noteId"
                    render={(routeProps) => (
                      <Note {...routeProps} note={props.note} />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/analysis/notes/:noteId/files"
                    render={(routeProps) => (
                      <React.Fragment>
                        <ContainerHeader
                          container={props.note}
                          PopoverComponent={<ReportPopover />}
                        />
                        <FileManager
                          {...routeProps}
                          id={noteId}
                          connectorsExport={props.connectorsForExport}
                          connectorsImport={props.connectorsForImport}
                          entity={props.note}
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/analysis/notes/:noteId/history"
                    render={(routeProps) => (
                      <React.Fragment>
                        <ContainerHeader
                          container={props.note}
                          PopoverComponent={<ReportPopover />}
                        />
                        <StixCoreObjectHistory
                          {...routeProps}
                          stixCoreObjectId={noteId}
                          withoutRelations={true}
                        />
                      </React.Fragment>
                    )}
                  />
                </div>
              );
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

RootNote.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
  me: PropTypes.object,
};

export default withRouter(RootNote);
