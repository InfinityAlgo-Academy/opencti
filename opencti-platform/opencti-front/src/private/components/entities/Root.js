import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Switch, Redirect } from 'react-router-dom';
import { BoundaryRoute } from '../Error';
import Sectors from './Sectors';
import RootSector from './sectors/Root';
import Countries from './Countries';
import RootRegion from './regions/Root';
import RootCountry from './countries/Root';
import Cities from './Cities';
import RootCity from './cities/Root';
import Positions from './Positions';
import RootPosition from './positions/Root';
import Organizations from './Organizations';
import RootOrganization from './organizations/Root';
import Systems from './Systems';
import RootSystem from './systems/Root';
import Individuals from './Individuals';
import RootIndividual from './individuals/Root';

class Root extends Component {
  render() {
    const { me } = this.props;
    return (
      <Switch>
        <BoundaryRoute
          exact
          path="/dashboard/entities"
          render={() => <Redirect to="/dashboard/entities/sectors" />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/entities/sectors"
          component={Sectors}
        />
        <BoundaryRoute
          path="/dashboard/entities/sectors/:sectorId"
          render={(routeProps) => <RootSector {...routeProps} me={me} />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/entities/countries"
          component={Countries}
        />
        <BoundaryRoute
          path="/dashboard/entities/regions/:regionId"
          render={(routeProps) => <RootRegion {...routeProps} me={me} />}
        />
        <BoundaryRoute
          path="/dashboard/entities/countries/:countryId"
          render={(routeProps) => <RootCountry {...routeProps} me={me} />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/entities/cities"
          component={Cities}
        />
        <BoundaryRoute
          path="/dashboard/entities/cities/:cityId"
          render={(routeProps) => <RootCity {...routeProps} me={me} />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/entities/positions"
          component={Positions}
        />
        <BoundaryRoute
          path="/dashboard/entities/positions/:positionId"
          render={(routeProps) => <RootPosition {...routeProps} me={me} />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/entities/organizations"
          component={Organizations}
        />
        <BoundaryRoute
          path="/dashboard/entities/organizations/:organizationId"
          render={(routeProps) => <RootOrganization {...routeProps} me={me} />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/entities/systems"
          component={Systems}
        />
        <BoundaryRoute
          path="/dashboard/entities/systems/:systemId"
          render={(routeProps) => <RootSystem {...routeProps} me={me} />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/entities/individuals"
          component={Individuals}
        />
        <BoundaryRoute
          path="/dashboard/entities/individuals/:individualId"
          render={(routeProps) => <RootIndividual {...routeProps} me={me} />}
        />
      </Switch>
    );
  }
}

Root.propTypes = {
  me: PropTypes.object,
};

export default Root;
