import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Redirect, withRouter } from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import {
  QueryRenderer,
  requestSubscription,
} from '../../../../relay/environment';
import TopBar from '../../nav/TopBar';
import Country from './Country';
import CountryReports from './CountryReports';
import CountryKnowledge from './CountryKnowledge';
import CountryObservables from './CountryObservables';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import FileManager from '../../common/files/FileManager';
import CountryPopover from './CountryPopover';
import Loader from '../../../../components/Loader';
import StixCoreObjectHistory from '../../common/stix_core_object/StixCoreObjectHistory';

const subscription = graphql`
  subscription RootCountriesSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on Country {
        ...Country_country
        ...CountryEditionContainer_country
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
  }
`;

const countryQuery = graphql`
  query RootCountryQuery($id: String!) {
    country(id: $id) {
      id
      name
      aliases
      ...Country_country
      ...CountryReports_country
      ...CountryKnowledge_country
      ...CountryObservables_country
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
  }
`;

class RootCountry extends Component {
  componentDidMount() {
    const {
      match: {
        params: { countryId },
      },
    } = this.props;
    const sub = requestSubscription({
      subscription,
      variables: { id: countryId },
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
        params: { countryId },
      },
    } = this.props;
    return (
      <div>
        <TopBar me={me || null} />
        <QueryRenderer
          query={countryQuery}
          variables={{ id: countryId }}
          render={({ props }) => {
            if (props && props.country) {
              return (
                <div>
                  <Route
                    exact
                    path="/dashboard/entities/countries/:countryId"
                    render={(routeProps) => (
                      <Country {...routeProps} country={props.country} />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/entities/countries/:countryId/reports"
                    render={(routeProps) => (
                      <CountryReports {...routeProps} country={props.country} />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/entities/countries/:countryId/knowledge"
                    render={() => (
                      <Redirect
                        to={`/dashboard/entities/countries/${countryId}/knowledge/overview`}
                      />
                    )}
                  />
                  <Route
                    path="/dashboard/entities/countries/:countryId/knowledge"
                    render={(routeProps) => (
                      <CountryKnowledge
                        {...routeProps}
                        country={props.country}
                      />
                    )}
                  />
                  <Route
                    path="/dashboard/entities/countries/:countryId/observables"
                    render={(routeProps) => (
                      <CountryObservables
                        {...routeProps}
                        country={props.country}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/entities/countries/:countryId/files"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.country}
                          PopoverComponent={<CountryPopover />}
                        />
                        <FileManager
                          {...routeProps}
                          id={countryId}
                          connectorsExport={props.connectorsForExport}
                          entity={props.country}
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/entities/countries/:countryId/history"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.country}
                          PopoverComponent={<CountryPopover />}
                        />
                        <StixCoreObjectHistory
                          {...routeProps}
                          entityId={countryId}
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

RootCountry.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
  me: PropTypes.object,
};

export default withRouter(RootCountry);
