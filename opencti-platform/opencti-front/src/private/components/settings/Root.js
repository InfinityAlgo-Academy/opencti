import React from 'react';
import { Redirect, Switch } from 'react-router-dom';
import Settings from './Settings';
import Users from './Users';
import RootUser from './users/Root';
import Groups from './Groups';
import Roles from './Roles';
import Sessions from './Sessions';
import MarkingDefinitions from './MarkingDefinitions';
import Rules from './Rules';
import KillChainPhases from './KillChainPhases';
import Labels from './Labels';
import Retention from './Retention';
import { BoundaryRoute } from '../Error';
import Security from '../../../utils/Security';
import { SETTINGS } from '../../../utils/hooks/useGranted';
import StatusTemplates from './status_templates/StatusTemplates';
import Vocabularies from './Vocabularies';
import VocabularyCategories from './VocabularyCategories';
import SubTypes from './sub_types/SubTypes';
import RootSubType from './sub_types/Root';

const Root = () => (
  <Switch>
    <Security needs={[SETTINGS]} placeholder={<Redirect to="/dashboard" />}>
      <BoundaryRoute exact path="/dashboard/settings" component={Settings} />
      <BoundaryRoute
        exact
        path="/dashboard/settings/accesses"
        render={() => <Redirect to="/dashboard/settings/accesses/roles" />}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/accesses/users"
        component={Users}
      />
      <BoundaryRoute
        path="/dashboard/settings/accesses/users/:userId"
        component={RootUser}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/accesses/roles"
        component={Roles}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/accesses/groups"
        component={Groups}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/accesses/sessions"
        component={Sessions}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/accesses/marking"
        component={MarkingDefinitions}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/entity_types"
        component={SubTypes}
      />
      <BoundaryRoute
        path="/dashboard/settings/entity_types/:subTypeId"
        render={() => (
          <RootSubType />
        )}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/vocabularies/statusTemplates"
        component={StatusTemplates}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/retention"
        component={Retention}
      />
      <BoundaryRoute exact path="/dashboard/settings/rules" component={Rules} />
      <BoundaryRoute
        exact
        path="/dashboard/settings/vocabularies"
        render={() => <Redirect to="/dashboard/settings/vocabularies/labels" />}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/vocabularies/labels"
        component={Labels}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/vocabularies/kill_chain_phases"
        component={KillChainPhases}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/vocabularies/fields"
        component={VocabularyCategories}
      />
      <BoundaryRoute
        exact
        path="/dashboard/settings/vocabularies/fields/:category"
        component={Vocabularies}
      />
    </Security>
  </Switch>
);

export default Root;
