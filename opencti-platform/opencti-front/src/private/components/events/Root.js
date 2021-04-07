import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Switch, Redirect } from 'react-router-dom';
import { BoundaryRoute } from '../Error';
import XOpenCTIIncidents from './XOpenCTIIncidents';
import RootXOpenCTIIncident from './x_opencti_incidents/Root';
import ObservedDatas from './ObservedDatas';
import RootObservedData from './observed_data/Root';
import StixSightingRelationships from './StixSightingRelationships';

class Root extends Component {
  render() {
    const { me } = this.props;
    return (
      <Switch>
        <BoundaryRoute
          exact
          path="/dashboard/events"
          render={() => <Redirect to="/dashboard/events/incidents" />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/events/incidents"
          component={XOpenCTIIncidents}
        />
        <BoundaryRoute
          path="/dashboard/events/incidents/:incidentId"
          render={(routeProps) => (
            <RootXOpenCTIIncident {...routeProps} me={me} />
          )}
        />
        <BoundaryRoute
          exact
          path="/dashboard/events/observed_data"
          component={ObservedDatas}
        />
        <BoundaryRoute
          path="/dashboard/events/observed_data/:observedDataId"
          render={(routeProps) => <RootObservedData {...routeProps} me={me} />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/events/sightings"
          component={StixSightingRelationships}
        />
      </Switch>
    );
  }
}

Root.propTypes = {
  me: PropTypes.object,
};

export default Root;
