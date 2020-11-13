import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { AccountCircleOutlined, ExploreOutlined } from '@material-ui/icons';
import { UploadOutline } from 'mdi-material-ui';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import graphql from 'babel-plugin-relay/macro';
import logo from '../../../resources/images/logo_text.png';
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
import TopMenuXOpenCTIIncident from './TopMenuXOpenCTIIncident';
import TopMenuObservedData from './TopMenuObservedData';
import TopMenuStixRelationshipSighting from './TopMenuStixRelationshipSighting';
import TopMenuObservations from './TopMenuObservations';
import TopMenuIndicator from './TopMenuIndicator';
import TopMenuInfrastructure from './TopMenuInfrastructure';
import TopMenuStixCyberObservable from './TopMenuStixCyberObservable';
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
import TopMenuOrganization from './TopMenuOrganization';
import TopMenuIndividual from './TopMenuIndividual';
import TopMenuRegion from './TopMenuRegion';
import TopMenuCountry from './TopMenuCountry';
import TopMenuCity from './TopMenuCity';
import TopMenuData from './TopMenuData';
import TopMenuSettings from './TopMenuSettings';
import TopMenuProfile from './TopMenuProfile';
import { commitMutation } from '../../../relay/environment';
import Security, {
  KNOWLEDGE,
  KNOWLEDGE_KNASKIMPORT,
  EXPLORE,
} from '../../../utils/Security';
import TopMenuCourseOfAction from './TopMenuCourseOfAction';

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
    marginLeft: -10,
  },
  logo: {
    cursor: 'pointer',
    height: 35,
  },
  menuContainer: {
    float: 'left',
    marginLeft: 40,
  },
  barRight: {
    position: 'absolute',
    right: 5,
  },
  searchContainer: {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: 20,
  },
  button: {
    display: 'inline-block',
  },
});

const logoutMutation = graphql`
  mutation TopBarLogoutMutation {
    logout
  }
`;

const TopBar = ({
  t, classes, location, history, keyword,
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
      onCompleted: () => history.push('/'),
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
      style={{ backgroundColor: '#1b2226' }}
    >
      <Toolbar>
        <div className={classes.logoContainer}>
          <Link to="/dashboard">
            <img src={logo} alt="logo" className={classes.logo} />
          </Link>
        </div>
        <div className={classes.menuContainer}>
          {location.pathname === '/dashboard'
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
          {location.pathname === '/dashboard/analysis'
          || location.pathname.match('/dashboard/analysis/[a-z_]+$') ? (
            <TopMenuAnalysis />
            ) : (
              ''
            )}
          {location.pathname.includes('/dashboard/analysis/reports/') ? (
            <TopMenuReport />
          ) : (
            ''
          )}
          {location.pathname.includes('/dashboard/analysis/notes/') ? (
            <TopMenuNote />
          ) : (
            ''
          )}
          {location.pathname.includes('/dashboard/analysis/opinions/') ? (
            <TopMenuOpinion />
          ) : (
            ''
          )}
          {location.pathname.includes(
            '/dashboard/analysis/external_references/',
          ) ? (
            <TopMenuExternalReference />
            ) : (
              ''
            )}
          {location.pathname === '/dashboard/events'
          || location.pathname.match('/dashboard/events/[a-z_]+$') ? (
            <TopMenuEvents />
            ) : (
              ''
            )}
          {location.pathname.includes('/dashboard/events/incidents/') ? (
            <TopMenuXOpenCTIIncident />
          ) : (
            ''
          )}
          {location.pathname.includes('/dashboard/events/observed_data/') ? (
            <TopMenuObservedData />
          ) : (
            ''
          )}
          {location.pathname.includes('/dashboard/events/sightings/') ? (
            <TopMenuStixRelationshipSighting />
          ) : (
            ''
          )}
          {location.pathname === '/dashboard/observations'
          || location.pathname.match('/dashboard/observations/[a-z_]+$') ? (
            <TopMenuObservations />
            ) : (
              ''
            )}
          {location.pathname.includes('/dashboard/observations/indicators/') ? (
            <TopMenuIndicator />
          ) : (
            ''
          )}
          {location.pathname.includes(
            '/dashboard/observations/infrastructures/',
          ) ? (
            <TopMenuInfrastructure />
            ) : (
              ''
            )}
          {location.pathname.includes(
            '/dashboard/observations/observables/',
          ) ? (
            <TopMenuStixCyberObservable />
            ) : (
              ''
            )}
          {location.pathname === '/dashboard/threats'
          || location.pathname.match('/dashboard/threats/[a-z_]+$') ? (
            <TopMenuThreats />
            ) : (
              ''
            )}
          {location.pathname.includes('/dashboard/threats/threat_actors/') ? (
            <TopMenuThreatActor />
          ) : (
            ''
          )}
          {location.pathname.includes('/dashboard/threats/intrusion_sets/') ? (
            <TopMenuIntrusionSet />
          ) : (
            ''
          )}
          {location.pathname.includes('/dashboard/threats/campaigns/') ? (
            <TopMenuCampaign />
          ) : (
            ''
          )}
          {location.pathname === '/dashboard/arsenal'
          || location.pathname.match('/dashboard/arsenal/[a-z_]+$') ? (
            <TopMenuArsenal />
            ) : (
              ''
            )}
          {location.pathname.includes('/dashboard/arsenal/malwares/') ? (
            <TopMenuMalware />
          ) : (
            ''
          )}
          {location.pathname.includes('/dashboard/arsenal/tools/') ? (
            <TopMenuTool />
          ) : (
            ''
          )}
          {location.pathname.includes('/dashboard/arsenal/attack_patterns/') ? (
            <TopMenuAttackPattern />
          ) : (
            ''
          )}
          {location.pathname.includes(
            '/dashboard/arsenal/courses_of_action/',
          ) ? (
            <TopMenuCourseOfAction />
            ) : (
              ''
            )}
          {location.pathname.includes('/dashboard/arsenal/vulnerabilities/') ? (
            <TopMenuVulnerability />
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
          {location.pathname.includes('/dashboard/entities/organizations/') ? (
            <TopMenuOrganization />
          ) : (
            ''
          )}
          {location.pathname.includes('/dashboard/entities/individuals/') ? (
            <TopMenuIndividual />
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
          {location.pathname.includes('/dashboard/data') ? <TopMenuData /> : ''}
          {location.pathname.includes('/dashboard/settings') ? (
            <TopMenuSettings />
          ) : (
            ''
          )}
          {location.pathname === '/dashboard/profile' ? <TopMenuProfile /> : ''}
        </div>
        <div className={classes.barRight}>
          <Security needs={[KNOWLEDGE]}>
            <div className={classes.searchContainer}>
              <SearchInput onSubmit={handleSearch} keyword={keyword} />
            </div>
          </Security>
          <Security needs={[EXPLORE]}>
            <Tooltip title={t('Investigate')}>
              <IconButton
                disabled={true}
                component={Link}
                to="/dashboard/investigate"
                variant={
                  location.pathname === '/dashboard/investigate'
                    ? 'contained'
                    : 'text'
                }
                color={
                  location.pathname === '/dashboard/investigate'
                    ? 'primary'
                    : 'inherit'
                }
                classes={{ root: classes.button }}
              >
                <ExploreOutlined fontSize="default" />
              </IconButton>
            </Tooltip>
          </Security>
          <Security needs={[KNOWLEDGE_KNASKIMPORT]}>
            <Tooltip title={t('Data import')}>
              <IconButton
                component={Link}
                to="/dashboard/import"
                variant={
                  location.pathname === '/dashboard/import'
                    ? 'contained'
                    : 'text'
                }
                color={
                  location.pathname === '/dashboard/import'
                    ? 'primary'
                    : 'inherit'
                }
                classes={{ root: classes.button }}
              >
                <UploadOutline fontSize="default" />
              </IconButton>
            </Tooltip>
          </Security>
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
              component={Link}
              to="/dashboard/profile"
              onClick={handleCloseMenu}
            >
              {t('Profile')}
            </MenuItem>
            <MenuItem onClick={handleLogout}>{t('Logout')}</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

TopBar.propTypes = {
  keyword: PropTypes.string,
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(inject18n, withRouter, withStyles(styles))(TopBar);
