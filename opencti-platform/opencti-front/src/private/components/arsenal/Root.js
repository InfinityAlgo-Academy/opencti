import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Switch, Redirect } from 'react-router-dom';
import { BoundaryRoute } from '../Error';
import Malwares from './Malwares';
import RootMalware from './malwares/Root';
import AttackPatterns from './AttackPatterns';
import RootAttackPattern from './attack_patterns/Root';
import RootCourseOfAction from './courses_of_action/Root';
import Tools from './Tools';
import RootTool from './tools/Root';
import Vulnerabilities from './Vulnerabilities';
import RootVulnerabilities from './vulnerabilities/Root';
import CoursesOfAction from './CoursesOfAction';

class Root extends Component {
  render() {
    const { me } = this.props;
    return (
      <Switch>
        <BoundaryRoute
          exact
          path="/dashboard/arsenal"
          render={() => <Redirect to="/dashboard/arsenal/malwares" />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/arsenal/malwares"
          component={Malwares}
        />
        <BoundaryRoute
          path="/dashboard/arsenal/malwares/:malwareId"
          render={(routeProps) => <RootMalware {...routeProps} me={me} />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/arsenal/attack_patterns"
          component={AttackPatterns}
        />
        <BoundaryRoute
          path="/dashboard/arsenal/attack_patterns/:attackPatternId"
          render={(routeProps) => <RootAttackPattern {...routeProps} me={me} />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/arsenal/courses_of_action"
          component={CoursesOfAction}
        />
        <BoundaryRoute
          path="/dashboard/arsenal/courses_of_action/:courseOfActionId"
          render={(routeProps) => (
            <RootCourseOfAction {...routeProps} me={me} />
          )}
        />
        <BoundaryRoute
          exact
          path="/dashboard/arsenal/tools"
          component={Tools}
        />
        <BoundaryRoute
          path="/dashboard/arsenal/tools/:toolId"
          render={(routeProps) => <RootTool {...routeProps} me={me} />}
        />
        <BoundaryRoute
          exact
          path="/dashboard/arsenal/vulnerabilities"
          component={Vulnerabilities}
        />
        <BoundaryRoute
          path="/dashboard/arsenal/vulnerabilities/:vulnerabilityId"
          render={(routeProps) => (
            <RootVulnerabilities {...routeProps} me={me} />
          )}
        />
      </Switch>
    );
  }
}

Root.propTypes = {
  me: PropTypes.object,
};

export default Root;
