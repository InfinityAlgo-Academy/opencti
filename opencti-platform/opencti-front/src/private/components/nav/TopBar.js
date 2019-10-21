import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { AccountCircle } from '@material-ui/icons';
import { UploadNetworkOutline } from 'mdi-material-ui';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import logo from '../../../resources/images/logo.png';
import inject18n from '../../../components/i18n';
import SearchInput from '../../../components/SearchInput';
import TopMenuDashboard from './TopMenuDashboard';
import TopMenuSearch from './TopMenuSearch';
import TopMenuExplore from './TopMenuExplore';
import TopMenuExploreWorkspace from './TopMenuExploreWorkspace';
import TopMenuInvestigate from './TopMenuInvestigate';
import TopMenuInvestigateWorkspace from './TopMenuInvestigateWorkspace';
import TopMenuKnowledge from './TopMenuThreats';
import TopMenuThreatActor from './TopMenuThreatActor';
import TopMenuSector from './TopMenuSector';
import TopMenuIntrusionSet from './TopMenuIntrusionSet';
import TopMenuCampaign from './TopMenuCampaign';
import TopMenuIncident from './TopMenuIncident';
import TopMenuMalware from './TopMenuMalware';
import TopMenuTechniques from './TopMenuTechniques';
import TopMenuAttackPattern from './TopMenuAttackPattern';
import TopMenuCourseOfAction from './TopMenuCourseOfAction';
import TopMenuTool from './TopMenuTool';
import TopMenuVulnerability from './TopMenuVulnerability';
import TopMenuRegion from './TopMenuRegion';
import TopMenuObservables from './TopMenuObservables';
import TopMenuObservable from './TopMenuObservable';
import TopMenuReports from './TopMenuReports';
import TopMenuReport from './TopMenuReport';
import TopMenuEntities from './TopMenuEntities';
import TopMenuCountry from './TopMenuCountry';
import TopMenuCity from './TopMenuCity';
import TopMenuOrganization from './TopMenuOrganization';
import TopMenuPerson from './TopMenuPerson';
import TopMenuConnectors from './TopMenuConnectors';
import TopMenuSettings from './TopMenuSettings';
import TopMenuProfile from './TopMenuProfile';
import { commitMutation } from '../../../relay/environment';

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
  logoButton: {
    marginLeft: -20,
    marginRight: 20,
  },
  logo: {
    cursor: 'pointer',
    height: 35,
  },
  progressBar: {
    height: 2,
  },
  menuContainer: {
    float: 'left',
  },
  searchContainer: {
    position: 'absolute',
    right: 125,
    top: 15,
  },
  button: {
    position: 'absolute',
    right: 55,
    top: 2,
  },
  menuButton: {
    position: 'absolute',
    right: 5,
    top: 2,
  },
});

const logoutMutation = graphql`
  mutation TopBarLogoutMutation {
    logout
  }
`;

class TopBar extends Component {
  constructor(props) {
    super(props);
    this.state = { menuOpen: false };
  }

  handleOpenMenu(event) {
    event.preventDefault();
    this.setState({ menuOpen: true, anchorEl: event.currentTarget });
  }

  handleCloseMenu() {
    this.setState({ menuOpen: false });
  }

  handleLogout() {
    commitMutation({
      mutation: logoutMutation,
      variables: {},
      onCompleted: () => {
        this.props.history.push('/login');
      },
    });
  }

  handleSearch(keyword) {
    if (keyword.length > 0) {
      this.props.history.push(`/dashboard/search/${keyword}`);
    }
  }

  render() {
    const {
      t, classes, location, keyword,
    } = this.props;
    return (
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            classes={{ root: classes.logoButton }}
            color="inherit"
            aria-label="Menu"
            component={Link}
            to="/dashboard"
          >
            <img src={logo} alt="logo" className={classes.logo} />
          </IconButton>
          <div className={classes.menuContainer}>
            {location.pathname === '/dashboard'
            || location.pathname === '/dashboard/entities'
            || location.pathname === '/dashboard/import' ? (
              <TopMenuDashboard />
              ) : (
                ''
              )}
            {location.pathname.includes('/dashboard/search/') ? (
              <TopMenuSearch />
            ) : (
              ''
            )}
            {location.pathname === '/dashboard/explore' ? (
              <TopMenuExplore />
            ) : (
              ''
            )}
            {location.pathname.includes('/dashboard/explore/') ? (
              <TopMenuExploreWorkspace />
            ) : (
              ''
            )}
            {location.pathname === '/dashboard/investigate' ? (
              <TopMenuInvestigate />
            ) : (
              ''
            )}
            {location.pathname.includes('/dashboard/investigate/') ? (
              <TopMenuInvestigateWorkspace />
            ) : (
              ''
            )}
            {location.pathname === '/dashboard/threats'
            || location.pathname.match('/dashboard/threats/[a-z_]+$') ? (
              <TopMenuKnowledge />
              ) : (
                ''
              )}
            {location.pathname.includes('/dashboard/threats/threat_actors/') ? (
              <TopMenuThreatActor />
            ) : (
              ''
            )}
            {location.pathname.includes(
              '/dashboard/threats/intrusion_sets/',
            ) ? (
              <TopMenuIntrusionSet />
              ) : (
                ''
              )}
            {location.pathname.includes('/dashboard/threats/campaigns/') ? (
              <TopMenuCampaign />
            ) : (
              ''
            )}
            {location.pathname.includes('/dashboard/threats/incidents/') ? (
              <TopMenuIncident />
            ) : (
              ''
            )}
            {location.pathname.includes('/dashboard/threats/malwares/') ? (
              <TopMenuMalware />
            ) : (
              ''
            )}
            {location.pathname === '/dashboard/techniques'
            || location.pathname.match('/dashboard/techniques/[a-z_]+$') ? (
              <TopMenuTechniques />
              ) : (
                ''
              )}
            {location.pathname.includes(
              '/dashboard/techniques/attack_patterns/',
            ) ? (
              <TopMenuAttackPattern />
              ) : (
                ''
              )}
            {location.pathname.includes(
              '/dashboard/techniques/courses_of_action/',
            ) ? (
              <TopMenuCourseOfAction />
              ) : (
                ''
              )}
            {location.pathname.includes('/dashboard/techniques/tools/') ? (
              <TopMenuTool />
            ) : (
              ''
            )}
            {location.pathname.includes(
              '/dashboard/techniques/vulnerabilities/',
            ) ? (
              <TopMenuVulnerability />
              ) : (
                ''
              )}
            {location.pathname === '/dashboard/observables'
            || location.pathname.match('/dashboard/observables/[a-z1-9_]+$') ? (
              <TopMenuObservables />
              ) : (
                ''
              )}
            {location.pathname.includes('/dashboard/observables/all/') ? (
              <TopMenuObservable />
            ) : (
              ''
            )}
            {location.pathname === '/dashboard/reports'
            || location.pathname.match('/dashboard/reports/[a-zA-Z1-9_-]+$') ? (
              <TopMenuReports />
              ) : (
                ''
              )}
            {location.pathname.includes('/dashboard/reports/all/') ? (
              <TopMenuReport />
            ) : (
              ''
            )}
            {location.pathname === '/dashboard/entities'
            || location.pathname.match('/dashboard/entities/[a-z_]+$') ? (
              <TopMenuEntities />
              ) : (
                ''
              )}
            {location.pathname.includes('/dashboard/entities/sectors/') ? (
              <TopMenuSector />
            ) : (
              ''
            )}
            {location.pathname.includes('/dashboard/entities/regions/') ? (
              <TopMenuRegion />
            ) : (
              ''
            )}
            {location.pathname.includes('/dashboard/entities/countries/') ? (
              <TopMenuCountry />
            ) : (
              ''
            )}
            {location.pathname.includes('/dashboard/entities/cities/') ? (
              <TopMenuCity />
            ) : (
              ''
            )}
            {location.pathname.includes(
              '/dashboard/entities/organizations/',
            ) ? (
              <TopMenuOrganization />
              ) : (
                ''
              )}
            {location.pathname.includes('/dashboard/entities/persons/') ? (
              <TopMenuPerson />
            ) : (
              ''
            )}
            {location.pathname === '/dashboard/connectors'
            || location.pathname.match('/dashboard/connectors/[a-z_]+$') ? (
              <TopMenuConnectors />
              ) : (
                ''
              )}
            {location.pathname.includes('/dashboard/settings') ? (
              <TopMenuSettings />
            ) : (
              ''
            )}
            {location.pathname === '/dashboard/profile' ? (
              <TopMenuProfile />
            ) : (
              ''
            )}
          </div>
          <div className={classes.searchContainer}>
            <SearchInput
              onSubmit={this.handleSearch.bind(this)}
              keyword={keyword}
            />
          </div>
          <Tooltip title={t('Data import')}>
            <IconButton
              component={Link}
              to="/dashboard/import"
              variant={
                location.pathname === '/dashboard/import' ? 'contained' : 'text'
              }
              color={
                location.pathname === '/dashboard/import'
                  ? 'primary'
                  : 'inherit'
              }
              classes={{ root: classes.button }}
            >
              <UploadNetworkOutline fontSize="large" />
            </IconButton>
          </Tooltip>
          <IconButton
            size="medium"
            classes={{ root: classes.menuButton }}
            aria-owns={this.state.open ? 'menu-appbar' : null}
            aria-haspopup="true"
            onClick={this.handleOpenMenu.bind(this)}
            color="inherit"
          >
            <AccountCircle fontSize="large" />
          </IconButton>
          <Menu
            id="menu-appbar"
            style={{ marginTop: 40, zIndex: 2100 }}
            anchorEl={this.state.anchorEl}
            open={this.state.menuOpen}
            onClose={this.handleCloseMenu.bind(this)}
          >
            <MenuItem
              component={Link}
              to="/dashboard/profile"
              onClick={this.handleCloseMenu.bind(this)}
            >
              {t('Profile')}
            </MenuItem>
            <MenuItem onClick={this.handleLogout.bind(this)}>
              {t('Logout')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    );
  }
}

TopBar.propTypes = {
  keyword: PropTypes.string,
  me: PropTypes.object,
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

const TopBarFragment = createFragmentContainer(TopBar, {
  me: graphql`
    fragment TopBar_me on User {
      email
    }
  `,
});

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopBarFragment);
