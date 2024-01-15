import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { any, includes } from 'ramda';
import Drawer from '@mui/material/Drawer';
import makeStyles from '@mui/styles/makeStyles';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { useFormatter } from '../../../../components/i18n';
import useAuth from '../../../../utils/hooks/useAuth';
import { useSettingsMessagesBannerHeight } from '../../settings/settings_messages/SettingsMessagesBanner';
import ItemIcon from '../../../../components/ItemIcon';

const useStyles = makeStyles((theme) => ({
  drawer: {
    minHeight: '100vh',
    width: 200,
    position: 'fixed',
    overflow: 'auto',
    padding: 0,
    backgroundColor: theme.palette.background.navLight,
  },
  item: {
    height: 38,
  },
  toolbar: theme.mixins.toolbar,
}));

const StixCoreObjectKnowledgeBar = ({
  stixCoreObjectLink,
  availableSections,
}) => {
  const { t_i18n } = useFormatter();
  const classes = useStyles();
  const location = useLocation();
  const { bannerSettings } = useAuth();
  const isInAvailableSection = (sections) => any((filter) => includes(filter, sections), availableSections);
  const settingsMessagesBannerHeight = useSettingsMessagesBannerHeight();
  return (
    <Drawer
      variant="permanent"
      anchor="right"
      classes={{ paper: classes.drawer }}
    >
      <div className={classes.toolbar} />
      <MenuList
        style={{
          paddingBottom: 0,
          marginTop:
            bannerSettings.bannerHeightNumber + settingsMessagesBannerHeight,
        }}
        component="nav"
      >
        <MenuItem
          component={Link}
          to={`${stixCoreObjectLink}/overview`}
          selected={location.pathname === `${stixCoreObjectLink}/overview`}
          dense={false}
          classes={{ root: classes.item }}
        >
          <ListItemIcon style={{ minWidth: 35 }}>
            <ItemIcon type="overview" />
          </ListItemIcon>
          <ListItemText primary={t_i18n('Overview')} />
        </MenuItem>
        {isInAvailableSection(['sectors', 'organizations', 'individuals']) ? (
          <MenuList
            style={{ paddingBottom: 0 }}
            component="nav"
            subheader={
              <ListSubheader style={{ height: 35 }}>
                {t_i18n('Entities')}
              </ListSubheader>
            }
          >
            {includes('sectors', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/sectors`}
                selected={location.pathname === `${stixCoreObjectLink}/sectors`}
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Sector" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Sectors')} />
              </MenuItem>
            )}
            {includes('regions', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/regions`}
                selected={location.pathname === `${stixCoreObjectLink}/regions`}
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Region" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Regions')} />
              </MenuItem>
            )}
            {includes('countries', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/countries`}
                selected={
                  location.pathname === `${stixCoreObjectLink}/countries`
                }
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Country" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Countries')} />
              </MenuItem>
            )}
            {includes('areas', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/areas`}
                selected={location.pathname === `${stixCoreObjectLink}/areas`}
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Administrative-Area" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Areas')} />
              </MenuItem>
            )}
            {includes('cities', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/cities`}
                selected={location.pathname === `${stixCoreObjectLink}/cities`}
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="City" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Cities')} />
              </MenuItem>
            )}
            {includes('organizations', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/organizations`}
                selected={
                  location.pathname === `${stixCoreObjectLink}/organizations`
                }
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Organization" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Organizations')} />
              </MenuItem>
            )}
            {includes('individuals', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/individuals`}
                selected={
                  location.pathname === `${stixCoreObjectLink}/individuals`
                }
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Individual" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Individuals')} />
              </MenuItem>
            )}
            {includes('locations', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/locations`}
                selected={
                  location.pathname === `${stixCoreObjectLink}/locations`
                }
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="location" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Locations')} />
              </MenuItem>
            )}
            {includes('used_tools', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/used_tools`}
                selected={
                  location.pathname === `${stixCoreObjectLink}/used_tools`
                }
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Tool" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Used tools')} />
              </MenuItem>
            )}
          </MenuList>
        ) : (
          <div>
            {includes('sectors', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/sectors`}
                selected={location.pathname === `${stixCoreObjectLink}/sectors`}
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Sector" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Sectors')} />
              </MenuItem>
            )}
            {includes('regions', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/regions`}
                selected={location.pathname === `${stixCoreObjectLink}/regions`}
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Region" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Regions')} />
              </MenuItem>
            )}
            {includes('countries', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/countries`}
                selected={
                  location.pathname === `${stixCoreObjectLink}/countries`
                }
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Country" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Countries')} />
              </MenuItem>
            )}
            {includes('areas', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/areas`}
                selected={location.pathname === `${stixCoreObjectLink}/areas`}
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Administrative-Area" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Areas')} />
              </MenuItem>
            )}
            {includes('cities', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/cities`}
                selected={location.pathname === `${stixCoreObjectLink}/cities`}
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="City" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Cities')} />
              </MenuItem>
            )}
            {includes('locations', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/locations`}
                selected={
                  location.pathname === `${stixCoreObjectLink}/locations`
                }
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Location" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Locations')} />
              </MenuItem>
            )}
            {includes('organizations', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/organizations`}
                selected={
                  location.pathname === `${stixCoreObjectLink}/organizations`
                }
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Identity" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Organizations')} />
              </MenuItem>
            )}
            {includes('individuals', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/individuals`}
                selected={
                  location.pathname === `${stixCoreObjectLink}/individuals`
                }
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Individual" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Individuals')} />
              </MenuItem>
            )}
            {includes('used_tools', availableSections) && (
              <MenuItem
                component={Link}
                to={`${stixCoreObjectLink}/used_tools`}
                selected={
                  location.pathname === `${stixCoreObjectLink}/used_tools`
                }
                dense={false}
                classes={{ root: classes.item }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <ItemIcon type="Tool" />
                </ListItemIcon>
                <ListItemText primary={t_i18n('Used tools')} />
              </MenuItem>
            )}
          </div>
        )}
      </MenuList>
      {isInAvailableSection([
        'targets',
        'attribution',
        'victimology',
        'intrusion_sets',
        'campaigns',
      ]) ? (
        <MenuList
          style={{ paddingBottom: 0 }}
          component="nav"
          subheader={
            <ListSubheader style={{ height: 35 }}>{t_i18n('Threats')}</ListSubheader>
          }
        >
          {includes('threats', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/threats`}
              selected={location.pathname === `${stixCoreObjectLink}/threats`}
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="threats" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('All threats')} />
            </MenuItem>
          )}
          {includes('attribution', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/attribution`}
              selected={
                location.pathname === `${stixCoreObjectLink}/attribution`
              }
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="attribution" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Attribution')} />
            </MenuItem>
          )}
          {includes('victimology', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/victimology`}
              selected={
                location.pathname === `${stixCoreObjectLink}/victimology`
              }
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="victimology" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Victimology')} />
            </MenuItem>
          )}
          {includes('threat_actors', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/threat_actors`}
              selected={
                location.pathname === `${stixCoreObjectLink}/threat_actors`
              }
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Threat-Actor-Individual" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Threat actors')} />
            </MenuItem>
          )}
          {includes('intrusion_sets', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/intrusion_sets`}
              selected={
                location.pathname === `${stixCoreObjectLink}/intrusion_sets`
              }
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Intrusion-Set" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Intrusion sets')} />
            </MenuItem>
          )}
          {includes('campaigns', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/campaigns`}
              selected={location.pathname === `${stixCoreObjectLink}/campaigns`}
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Campaign" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Campaigns')} />
            </MenuItem>
          )}
        </MenuList>
        ) : (
          ''
        )}
      {isInAvailableSection([
        'variants',
        'malwares',
        'tools',
        'vulnerabilities',
        'channels',
      ]) && (
        <MenuList
          style={{ paddingBottom: 0 }}
          component="nav"
          subheader={
            <ListSubheader style={{ height: 35 }}>{t_i18n('Arsenal')}</ListSubheader>
          }
        >
          {includes('variants', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/variants`}
              selected={location.pathname === `${stixCoreObjectLink}/variants`}
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="variant" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Variants')} />
            </MenuItem>
          )}
          {includes('malwares', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/malwares`}
              selected={location.pathname === `${stixCoreObjectLink}/malwares`}
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Malware" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Malwares')} />
            </MenuItem>
          )}
          {includes('channels', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/channels`}
              selected={location.pathname === `${stixCoreObjectLink}/channels`}
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Channel" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Channels')} />
            </MenuItem>
          )}
          {includes('tools', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/tools`}
              selected={location.pathname === `${stixCoreObjectLink}/tools`}
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="tool" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Tools')} />
            </MenuItem>
          )}
          {includes('vulnerabilities', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/vulnerabilities`}
              selected={
                location.pathname === `${stixCoreObjectLink}/vulnerabilities`
              }
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Vulnerability" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Vulnerabilities')} />
            </MenuItem>
          )}
        </MenuList>
      )}
      {isInAvailableSection(['attack_patterns', 'narratives']) && (
        <MenuList
          style={{ paddingBottom: 0 }}
          component="nav"
          subheader={
            <ListSubheader style={{ height: 35 }}>
              {t_i18n('Techniques')}
            </ListSubheader>
          }
        >
          {includes('attack_patterns', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/attack_patterns`}
              selected={
                location.pathname === `${stixCoreObjectLink}/attack_patterns`
              }
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Attack-Pattern" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Attack patterns')} />
            </MenuItem>
          )}
          {includes('narratives', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/narratives`}
              selected={
                location.pathname === `${stixCoreObjectLink}/narratives`
              }
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Narrative" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Narratives')} />
            </MenuItem>
          )}
        </MenuList>
      )}
      {isInAvailableSection([
        'observables',
        'indicators',
        'observables',
        'infrastructures',
      ]) && (
        <MenuList
          style={{ paddingBottom: 0 }}
          component="nav"
          subheader={
            <ListSubheader style={{ height: 35 }}>
              {t_i18n('Observations')}
            </ListSubheader>
          }
        >
          {includes('indicators', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/indicators`}
              selected={
                location.pathname === `${stixCoreObjectLink}/indicators`
              }
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Indicator" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Indicators')} />
            </MenuItem>
          )}
          {includes('observables', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/observables`}
              selected={
                location.pathname === `${stixCoreObjectLink}/observables`
              }
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Stix-Cyber-Observable" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Observables')} />
            </MenuItem>
          )}
          {includes('infrastructures', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/infrastructures`}
              selected={
                location.pathname === `${stixCoreObjectLink}/infrastructures`
              }
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Infrastructure" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Infrastructures')} />
            </MenuItem>
          )}
        </MenuList>
      )}
      {isInAvailableSection(['incidents', 'observed_data', 'sightings']) && (
        <MenuList
          style={{ paddingBottom: 0 }}
          component="nav"
          subheader={
            <ListSubheader style={{ height: 35 }}>{t_i18n('Events')}</ListSubheader>
          }
        >
          {includes('incidents', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/incidents`}
              selected={location.pathname === `${stixCoreObjectLink}/incidents`}
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Incident" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Incidents')} />
            </MenuItem>
          )}
          {includes('observed_data', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/observed_data`}
              selected={
                location.pathname === `${stixCoreObjectLink}/observed_data`
              }
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="Observed-Data" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Observed data')} />
            </MenuItem>
          )}
          {includes('sightings', availableSections) && (
            <MenuItem
              component={Link}
              to={`${stixCoreObjectLink}/sightings`}
              selected={location.pathname === `${stixCoreObjectLink}/sightings`}
              dense={false}
              classes={{ root: classes.item }}
            >
              <ListItemIcon style={{ minWidth: 35 }}>
                <ItemIcon type="sighting" />
              </ListItemIcon>
              <ListItemText primary={t_i18n('Sightings')} />
            </MenuItem>
          )}
        </MenuList>
      )}
      <MenuList
        style={{ paddingBottom: 0 }}
        sx={{ marginBottom: bannerSettings.bannerHeight }}
        component="nav"
        subheader={
          <ListSubheader style={{ height: 35 }}>{t_i18n('Other')}</ListSubheader>
        }
      >
        <MenuItem
          component={Link}
          to={`${stixCoreObjectLink}/related`}
          selected={location.pathname === `${stixCoreObjectLink}/related`}
          dense={false}
          classes={{ root: classes.item }}
        >
          <ListItemIcon style={{ minWidth: 35 }}>
            <ItemIcon type="related" />
          </ListItemIcon>
          <ListItemText primary={t_i18n('Related entities')} />
        </MenuItem>
      </MenuList>
    </Drawer>
  );
};

StixCoreObjectKnowledgeBar.propTypes = {
  id: PropTypes.string,
  stixCoreObjectLink: PropTypes.string,
  availableSections: PropTypes.array,
};

export default StixCoreObjectKnowledgeBar;
