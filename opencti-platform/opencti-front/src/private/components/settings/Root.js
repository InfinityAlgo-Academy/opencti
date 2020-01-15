import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import Settings from './Settings';
import Inferences from './Inferences';
import About from './About';
import Users from './Users';
import Groups from './Groups';
import MarkingDefinitions from './MarkingDefinitions';
import KillChainPhases from './KillChainPhases';
import Attributes from './Attributes';
import Tags from './Tags';
import { BoundaryRoute } from '../Error';

const Root = () => (
  <Switch>
    <BoundaryRoute exact path="/dashboard/settings" component={Settings} />
      <BoundaryRoute exact path="/dashboard/settings/inferences" component={Inferences} />
    <BoundaryRoute exact path="/dashboard/settings/about" component={About} />
    <BoundaryRoute
      exact
      path="/dashboard/settings/accesses"
      render={() => <Redirect to="/dashboard/settings/accesses/users" />}
    />
    <BoundaryRoute
      exact
      path="/dashboard/settings/accesses/users"
      component={Users}
    />
    <BoundaryRoute
      exact
      path="/dashboard/settings/accesses/groups"
      component={Groups}
    />
    <BoundaryRoute
      exact
      path="/dashboard/settings/marking"
      component={MarkingDefinitions}
    />
    <BoundaryRoute
      exact
      path="/dashboard/settings/killchains"
      component={KillChainPhases}
    />
    <BoundaryRoute
      exact
      path="/dashboard/settings/attributes"
      render={() => <Redirect to="/dashboard/settings/attributes/tags" />}
    />
    <BoundaryRoute
      exact
      path="/dashboard/settings/attributes/tags"
      component={Tags}
    />
    <BoundaryRoute
      exact
      path="/dashboard/settings/attributes/:attributeLabel"
      component={Attributes}
    />
  </Switch>
);

export default Root;
