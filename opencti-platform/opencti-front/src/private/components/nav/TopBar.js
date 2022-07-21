import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import { withTheme, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import {
  AccountCircleOutlined,
  ExploreOutlined,
  InsertChartOutlined,
} from '@material-ui/icons';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import DashboardIcon from '@material-ui/icons/Dashboard';
import Menu from '@material-ui/core/Menu';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import graphql from 'babel-plugin-relay/macro';
import inject18n from '../../../components/i18n';
import SearchInput from '../../../components/SearchInput';
import TopMenuDashboard from './TopMenuDashboard';
import TopMenuSearch from './TopMenuSearch';
import TopMenuAnalysis from './TopMenuAnalysis';
import TopMenuReport from './TopMenuReport';
import TopMenuNote from './TopMenuNote';
import TopMenuOpinion from './TopMenuOpinion';
import TopMenuExternalReference from './TopMenuExternalReference';
import TopMenuEvents from './TopMenuEvents';
import TopMenuIncident from './TopMenuIncident';
import TopMenuObservedData from './TopMenuObservedData';
import TopMenuObservations from './TopMenuObservations';
import TopMenuIndicator from './TopMenuIndicator';
import TopMenuInfrastructure from './TopMenuInfrastructure';
import TopMenuStixCyberObservable from './TopMenuStixCyberObservable';
import TopMenuArtifact from './TopMenuArtifact';
import TopMenuThreats from './TopMenuThreats';
import TopMenuThreatActor from './TopMenuThreatActor';
import TopMenuIntrusionSet from './TopMenuIntrusionSet';
import TopMenuCampaign from './TopMenuCampaign';
import TopMenuArsenal from './TopMenuArsenal';
import TopMenuMalware from './TopMenuMalware';
import TopMenuTool from './TopMenuTool';
import TopMenuAttackPattern from './TopMenuAttackPattern';
import TopMenuVulnerability from './TopMenuVulnerability';
import TopMenuEntities from './TopMenuEntities';
import TopMenuSector from './TopMenuSector';
import TopMenuSystem from './TopMenuSystem';
import TopMenuOrganization from './TopMenuOrganization';
import TopMenuIndividual from './TopMenuIndividual';
import TopMenuRegion from './TopMenuRegion';
import TopMenuCountry from './TopMenuCountry';
import TopMenuCity from './TopMenuCity';
import TopMenuPosition from './TopMenuPosition';
import TopMenuData from './TopMenuData';
import TopMenuSettings from './TopMenuSettings';
import TopMenuProfile from './TopMenuProfile';
import { commitMutation } from '../../../relay/environment';
import Security, {
  KNOWLEDGE,
  EXPLORE,
} from '../../../utils/Security';
import TopMenuCourseOfAction from './TopMenuCourseOfAction';
import TopMenuWorkspacesDashboards from './TopMenuWorkspacesDashboards';
import TopMenuWorkspacesInvestigations from './TopMenuWorkspacesInvestigations';
import Filters from '../common/lists/Filters';
import Export from '../../../components/Export';
import ExportPoam from '../../../components/ExportPoam';

const styles = (theme) => ({
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.header.background,
    color: theme.palette.header.text,
  },
  flex: {
    flexGrow: 1,
  },
  logoContainer: {

    height: 64,
    width: 255,
    marginLeft: -24,
    paddingTop: 15,
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: theme.palette.background.nav,

  },
  logo: {
    cursor: 'pointer',
    height: 20,
    marginTop: 10,
    marginLeft: 10,

  },
  menuContainer: {
    float: 'left',
    marginLeft: 40,
  },
  barRight: {
    position: 'absolute',
    right: 5,
    verticalAlign: 'middle',
    height: '100%',
  },
  barContainer: {
    display: 'table-cell',
    float: 'left',
    paddingTop: 10,
  },
  divider: {
    display: 'table-cell',
    float: 'left',
    height: '100%',
    margin: '0 5px 0 5px',
  },
  searchContainer: {
    display: 'table-cell',
    float: 'left',
    marginRight: 5,
    paddingTop: 9,
  },
  button: {
    display: 'table-cell',
    float: 'left',
  },
});

const logoutMutation = graphql`
  mutation TopBarLogoutMutation {
    logout
  }
`;

const TopBar = ({
  t, classes, location, history, keyword, theme,
}) => {
  const [menuOpen, setMenuOpen] = useState({ open: false, anchorEl: null });
  const handleOpenMenu = (event) => {
    event.preventDefault();
    setMenuOpen({ open: true, anchorEl: event.currentTarget });
  };
  const handleCloseMenu = () => {
    setMenuOpen({ open: false, anchorEl: null });
  };
  const handleLogout = () => {
    commitMutation({
      mutation: logoutMutation,
      variables: {},
      onCompleted: () => {
        history.push('/');
        localStorage.removeItem('token');
      },
    });
  };
  const handleSearch = (searchKeyword) => {
    if (searchKeyword.length > 0) {
      // With need to double encode because of react router.
      // Waiting for history 5.0 integrated to react router.
      const encodeKey = encodeURIComponent(encodeURIComponent(searchKeyword));
      history.push(`/dashboard/search/${encodeKey}`);
    }
  };
  return (
    <AppBar
      position="fixed"
      className={classes.appBar}
      elevation={1}
      style={{ backgroundColor: theme.palette.header.background }}
    >
      <Toolbar>
        <div className={classes.logoContainer}>
          <Link to="/dashboard">
            <img src={theme.logo} alt="logo" className={classes.logo} />
          </Link>
        </div>
        <div className={classes.menuContainer}>
          {(location.pathname === '/dashboard'
            || location.pathname === '/dashboard/import') && <TopMenuDashboard />}
          {location.pathname.includes('/dashboard/search') && <TopMenuSearch />}
          {(location.pathname === '/dashboard/analysis'
            || location.pathname.match('/dashboard/analysis/[a-z_]+$')) && (
              <TopMenuAnalysis />
          )}
          {location.pathname.includes('/dashboard/analysis/reports/') && (
            <TopMenuReport />
          )}
          {location.pathname.includes('/dashboard/analysis/notes/') && (
            <TopMenuNote />
          )}
          {location.pathname.includes('/dashboard/analysis/opinions/') && (
            <TopMenuOpinion />
          )}
          {location.pathname.includes(
            '/dashboard/analysis/external_references/',
          ) && <TopMenuExternalReference />}
          {(location.pathname === '/dashboard/events'
            || location.pathname.match('/dashboard/events/[a-z_]+$')) && (
              <TopMenuEvents />
          )}
          {location.pathname.includes('/dashboard/events/incidents/') && (
            <TopMenuIncident />
          )}
          {location.pathname.includes('/dashboard/events/observed_data/') && (
            <TopMenuObservedData />
          )}
          {location.pathname.includes('/dashboard/events/sightings/') && (
            <TopMenuEvents />
          )}
          {(location.pathname === '/dashboard/observations'
            || location.pathname.match('/dashboard/observations/[a-z_]+$')) && (
              <TopMenuObservations />
          )}
          {location.pathname.includes(
            '/dashboard/observations/indicators/',
          ) && <TopMenuIndicator />}
          {location.pathname.includes(
            '/dashboard/observations/infrastructures/',
          ) && <TopMenuInfrastructure />}
          {location.pathname.includes(
            '/dashboard/observations/observables/',
          ) && <TopMenuStixCyberObservable />}
          {location.pathname.includes('/dashboard/observations/artifacts/') && (
            <TopMenuArtifact />
          )}
          {(location.pathname === '/dashboard/threats'
            || location.pathname.match('/dashboard/threats/[a-z_]+$')) && (
              <TopMenuThreats />
          )}
          {location.pathname.includes('/dashboard/threats/threat_actors/') && (
            <TopMenuThreatActor />
          )}
          {location.pathname.includes('/dashboard/threats/intrusion_sets/') && (
            <TopMenuIntrusionSet />
          )}
          {location.pathname.includes('/dashboard/threats/campaigns/') && (
            <TopMenuCampaign />
          )}
          {(location.pathname === '/dashboard/arsenal'
            || location.pathname.match('/dashboard/arsenal/[a-z_]+$')) && (
              <TopMenuArsenal />
          )}
          {location.pathname.includes('/dashboard/arsenal/malwares/') && (
            <TopMenuMalware />
          )}
          {location.pathname.includes('/dashboard/arsenal/tools/') && (
            <TopMenuTool />
          )}
          {location.pathname.includes(
            '/dashboard/arsenal/attack_patterns/',
          ) && <TopMenuAttackPattern />}
          {location.pathname.includes(
            '/dashboard/arsenal/courses_of_action/',
          ) && <TopMenuCourseOfAction />}
          {location.pathname.includes(
            '/dashboard/arsenal/vulnerabilities/',
          ) && <TopMenuVulnerability />}
          {(location.pathname === '/dashboard/entities'
            || location.pathname.match('/dashboard/entities/[a-z_]+$')) && (
              <TopMenuEntities />
          )}
          {location.pathname.includes('/dashboard/entities/sectors/') && (
            <TopMenuSector />
          )}
          {location.pathname.includes('/dashboard/entities/systems/') && (
            <TopMenuSystem />
          )}
          {location.pathname.includes('/dashboard/entities/organizations/') && (
            <TopMenuOrganization />
          )}
          {location.pathname.includes('/dashboard/entities/individuals/') && (
            <TopMenuIndividual />
          )}
          {location.pathname.includes('/dashboard/entities/regions/') && (
            <TopMenuRegion />
          )}
          {location.pathname.includes('/dashboard/entities/countries/') && (
            <TopMenuCountry />
          )}
          {location.pathname.includes('/dashboard/entities/cities/') && (
            <TopMenuCity />
          )}
          {location.pathname.includes('/dashboard/entities/positions/') && (
            <TopMenuPosition />
          )}
          {location.pathname.includes('/dashboard/data') ? <TopMenuData /> : ''}
          {location.pathname.includes('/dashboard/settings') && (
            <TopMenuSettings />
          )}
          {location.pathname.includes('/dashboard/workspaces/dashboards') && (
            <TopMenuWorkspacesDashboards />
          )}
          {location.pathname.includes(
            '/dashboard/workspaces/investigations',
          ) && <TopMenuWorkspacesInvestigations />}
          {location.pathname === '/dashboard/profile' ? <TopMenuProfile /> : ''}
        </div>
        <div className={classes.barRight}>
          <div className={classes.barContainer}>
            <Security needs={[KNOWLEDGE]}>
              {/* <div className={classes.searchContainer}>
                <SearchInput disabled={true} onSubmit={handleSearch} keyword={keyword} />
              </div> */}
              <Filters
                variant="dialog"
                availableFilterKeys={[
                  'entity_type',
                  'markedBy',
                  'labelledBy',
                  'createdBy',
                  'confidence_gt',
                  'x_opencti_organization_type',
                  'created_start_date',
                  'created_end_date',
                  'created_at_start_date',
                  'created_at_end_date',
                ]}
                currentFilters={{}}
                // disabled={location.pathname.includes('/dashboard/search')}
                disabled={true}
              />
            </Security>
          </div>
          <Divider className={classes.divider} orientation="vertical" />
          <div className={classes.barContainer}>
            <Security needs={[EXPLORE]}>
              <Tooltip title={t('Custom dashboards')}>
                <IconButton
                  component={Link}
                  to="/dashboard/workspaces/dashboards"
                  variant={
                    location.pathname.includes(
                      '/dashboard/workspaces/dashboards',
                    )
                      ? 'contained'
                      : 'text'
                  }
                  color={
                    location.pathname.includes(
                      '/dashboard/workspaces/dashboards',
                    )
                      ? 'secondary'
                      : 'inherit'
                  }
                  classes={{ root: classes.button }}
                >
                  <InsertChartOutlined fontSize="default" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('Investigations')}>
                <IconButton
                  component={Link}
                  to="/dashboard/workspaces/investigations"
                  variant={
                    location.pathname.includes(
                      '/dashboard/workspaces/investigations',
                    )
                      ? 'contained'
                      : 'text'
                  }
                  color={
                    location.pathname.includes(
                      '/dashboard/workspaces/investigations',
                    )
                      ? 'secondary'
                      : 'inherit'
                  }
                  classes={{ root: classes.button }}
                >
                  <ExploreOutlined fontSize="default" />
                </IconButton>
              </Tooltip>
            </Security>
            <Tooltip title={t('Dashboard')}>
              <IconButton
                component={Link}
                to='/dashboard'
                classes={{ root: classes.button }}
              >
                <DashboardIcon fontSize="default" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('Find in Page')}>
              <IconButton
                component={Link}
                disabled={true}
                classes={{ root: classes.button }}
              >
                <FindInPageIcon fontSize="default" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('Data Import')}>
              <ExportPoam />
            </Tooltip>
            <Tooltip title={t('Add Note')}>
              <Export />
            </Tooltip>
            <IconButton
              size="medium"
              classes={{ root: classes.button }}
              aria-owns={menuOpen.open ? 'menu-appbar' : null}
              aria-haspopup="true"
              onClick={handleOpenMenu}
              color="inherit"
            >
              <AccountCircleOutlined fontSize="default" />
            </IconButton>
            <Menu
              id="menu-appbar"
              style={{ marginTop: 40, zIndex: 2100 }}
              anchorEl={menuOpen.anchorEl}
              open={menuOpen.open}
              onClose={handleCloseMenu}
            >
              <MenuItem
                disabled={true}
                component={Link}
                to="/dashboard/profile"
                onClick={handleCloseMenu}
              >
                {t('Profile')}
              </MenuItem>
              <MenuItem onClick={handleLogout} data-cy='logout'>{t('Logout')}</MenuItem>
            </Menu>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
};

TopBar.propTypes = {
  keyword: PropTypes.string,
  theme: PropTypes.object,
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withTheme,
  withStyles(styles),
)(TopBar);
