import React, { useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { createStyles, makeStyles, styled, useTheme } from '@mui/styles';
import Toolbar from '@mui/material/Toolbar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import {
  AccountBalanceOutlined,
  AssignmentOutlined,
  BiotechOutlined,
  BugReportOutlined,
  CasesOutlined,
  ChevronLeft,
  ChevronRight,
  ConstructionOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  DiamondOutlined,
  DomainOutlined,
  EventOutlined,
  ExpandLessOutlined,
  ExpandMoreOutlined,
  ExploreOutlined,
  FlagOutlined,
  InsertChartOutlinedOutlined,
  LayersOutlined,
  LocalOfferOutlined,
  MapOutlined,
  PersonOutlined,
  PlaceOutlined,
  PublicOutlined,
  SourceOutlined,
  SpeakerNotesOutlined,
  StorageOutlined,
  StreamOutlined,
  SubjectOutlined,
  SurroundSoundOutlined,
  TaskAltOutlined,
  VisibilityOutlined,
  WebAssetOutlined,
  WifiTetheringOutlined,
  WorkspacesOutlined,
} from '@mui/icons-material';
import {
  AccountMultipleOutline,
  ArchiveOutline,
  Binoculars,
  Biohazard,
  BriefcaseEditOutline,
  BriefcaseEyeOutline,
  BriefcaseRemoveOutline,
  BriefcaseSearchOutline,
  ChessKnight,
  CityVariantOutline,
  CogOutline,
  Database,
  Fire,
  FlaskOutline,
  FolderTableOutline,
  GlobeModel,
  HexagonOutline,
  LaptopAccount,
  LockPattern,
  ProgressWrench,
  ServerNetwork,
  ShieldSearch,
  Timetable,
} from 'mdi-material-ui';
import Popover from '@mui/material/Popover';
import Collapse from '@mui/material/Collapse';
import { useFormatter } from '../../../components/i18n';
import Security from '../../../utils/Security';
import useGranted, {
  EXPLORE,
  KNOWLEDGE,
  KNOWLEDGE_KNASKIMPORT,
  KNOWLEDGE_KNUPDATE,
  MODULES,
  SETTINGS,
  SETTINGS_SETACCESSES,
  SETTINGS_SETLABELS,
  SETTINGS_SETMARKINGS,
  TAXIIAPI_SETCOLLECTIONS,
  TAXIIAPI_SETCSVMAPPERS,
  VIRTUAL_ORGANIZATION_ADMIN,
} from '../../../utils/hooks/useGranted';
import { fileUri, MESSAGING$ } from '../../../relay/environment';
import { useHiddenEntities, useIsHiddenEntities } from '../../../utils/hooks/useEntitySettings';
import useAuth from '../../../utils/hooks/useAuth';
import { useSettingsMessagesBannerHeight } from '../settings/settings_messages/SettingsMessagesBanner';
import logoFiligranDark from '../../../static/images/logo_filigran_dark.png';
import logoFiligranLight from '../../../static/images/logo_filigran_light.png';
import logoFiligranTextDark from '../../../static/images/logo_filigran_text_dark.png';
import logoFiligranTextLight from '../../../static/images/logo_filigran_text_light.png';
import useEnterpriseEdition from '../../../utils/hooks/useEnterpriseEdition';
import useDimensions from '../../../utils/hooks/useDimensions';

const useStyles = makeStyles((theme) => createStyles({
  drawerPaper: {
    width: 55,
    minHeight: '100vh',
    background: 0,
    backgroundColor: theme.palette.background.nav,
    overflowX: 'hidden',
  },
  drawerPaperOpen: {
    width: 180,
    minHeight: '100vh',
    background: 0,
    backgroundColor: theme.palette.background.nav,
    overflowX: 'hidden',
  },
  menuItemIcon: {
    color: theme.palette.text.primary,
  },
  menuItem: {
    paddingRight: 2,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuHoverItem: {
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuSubItem: {
    paddingLeft: 20,
    height: 25,
    fontWeight: 500,
    fontSize: 12,
  },
  menuItemText: {
    padding: '1px 0 0 15px',
    fontWeight: 500,
    fontSize: 14,
  },
  menuSubItemText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: '1px 0 0 10px',
    fontWeight: 500,
    fontSize: 12,
  },
  menuCollapseOpen: {
    width: 180,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuCollapse: {
    width: 55,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuLogoOpen: {
    width: 180,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuLogo: {
    width: 55,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuItemSmallText: {
    padding: '1px 0 0 20px',
  },
}));

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

const LeftBar = () => {
  const theme = useTheme();
  const location = useLocation();
  const ref = useRef();
  const { t_i18n } = useFormatter();
  const { settings: { platform_whitemark } } = useAuth();
  const history = useHistory();
  const isEnterpriseEdition = useEnterpriseEdition();
  const isGrantedToKnowledge = useGranted([KNOWLEDGE]);
  const isGrantedToImport = useGranted([KNOWLEDGE_KNASKIMPORT]);
  const isGrantedToProcessing = useGranted([KNOWLEDGE_KNUPDATE, SETTINGS_SETACCESSES, TAXIIAPI_SETCSVMAPPERS]);
  const isGrantedToSharing = useGranted([TAXIIAPI_SETCOLLECTIONS]);
  const isGrantedToSettings = useGranted([SETTINGS]);
  const isOrganizationAdmin = useGranted([VIRTUAL_ORGANIZATION_ADMIN]);
  const isGrantedToLabels = useGranted([SETTINGS_SETLABELS]);
  const isGrantedToSecurity = useGranted([SETTINGS_SETMARKINGS, SETTINGS_SETACCESSES, VIRTUAL_ORGANIZATION_ADMIN]);
  const anchors = {
    analyses: useRef(null),
    cases: useRef(null),
    events: useRef(null),
    observations: useRef(null),
    threats: useRef(null),
    arsenal: useRef(null),
    techniques: useRef(null),
    entities: useRef(null),
    locations: useRef(null),
    dashboards: useRef(null),
    investigations: useRef(null),
    data: useRef(null),
    settings: useRef(null),
  };
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [navOpen, setNavOpen] = useState(
    localStorage.getItem('navOpen') === 'true',
  );
  const classes = useStyles({ navOpen });
  const handleToggle = () => {
    setSelectedMenu(null);
    localStorage.setItem('navOpen', String(!navOpen));
    setNavOpen(!navOpen);
    MESSAGING$.toggleNav.next('toggle');
  };
  const handleSelectedMenuOpen = (menu) => {
    setSelectedMenu(menu);
  };
  const handleSelectedMenuClose = () => {
    setSelectedMenu(null);
  };
  const handleSelectedMenuToggle = (menu) => {
    setSelectedMenu(selectedMenu === menu ? null : menu);
  };
  const handleGoToPage = (link) => {
    history.push(link);
  };
  const hiddenEntities = useHiddenEntities();
  const hideAnalyses = useIsHiddenEntities(
    'Report',
    'Grouping',
    'Note',
    'Malware-Analysis',
  );
  const hideEvents = useIsHiddenEntities(
    'stix-sighting-relationship',
    'Incident',
    'Observed-Data',
  );
  const hideObservations = useIsHiddenEntities(
    'Stix-Cyber-Observable',
    'Artifact',
    'Indicator',
    'Infrastructure',
  );
  const hideThreats = useIsHiddenEntities(
    'Threat-Actor',
    'Intrusion-Set',
    'Campaign',
  );
  const hideEntities = useIsHiddenEntities(
    'Sector',
    'Event',
    'Organization',
    'System',
    'Individual',
  );
  const hideCases = useIsHiddenEntities(
    'Case-Incident',
    'Feedback',
    'Case-Rfi',
    'Case-Rft',
    'Task',
  );
  const hideArsenal = useIsHiddenEntities(
    'Malware',
    'Channel',
    'Tool',
    'Vulnerability',
  );
  const hideTechniques = useIsHiddenEntities(
    'Attack-Pattern',
    'Narrative',
    'Course-Of-Action',
    'Data-Component',
    'Data-Source',
  );
  const hideLocations = useIsHiddenEntities(
    'Region',
    'Administrative-Area',
    'Country',
    'City',
    'Position',
  );
  const {
    bannerSettings: { bannerHeightNumber },
  } = useAuth();
  const settingsMessagesBannerHeight = useSettingsMessagesBannerHeight();
  const { dimension } = useDimensions();
  const isMobile = dimension.width < 768;
  const generateSubMenu = (menu, entries) => {
    return navOpen ? (
      <Collapse in={selectedMenu === menu} timeout="auto" unmountOnExit={true}>
        <MenuList component="nav" disablePadding={true}>
          {entries.filter((entry) => entry.granted !== false && !hiddenEntities.includes(entry.type)).map((entry) => {
            return (
              <StyledTooltip key={entry.label} title={t_i18n(entry.label)} placement="right">
                <MenuItem
                  component={Link}
                  to={entry.link}
                  selected={entry.exact ? location.pathname === entry.link : location.pathname.includes(entry.link)}
                  dense={true}
                  classes={{ root: classes.menuSubItem }}
                >
                  {entry.icon && <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                    {entry.icon}
                  </ListItemIcon>}
                  <ListItemText
                    classes={{ primary: classes.menuSubItemText }}
                    primary={t_i18n(entry.label)}
                  />
                </MenuItem>
              </StyledTooltip>
            );
          })}
        </MenuList>
      </Collapse>
    ) : (
      <Popover
        sx={{ pointerEvents: 'none' }}
        open={selectedMenu === menu}
        anchorEl={anchors[menu]?.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handleSelectedMenuClose}
        disableRestoreFocus={true}
        disableScrollLock={true}
        slotProps={{ paper: {
          elevation: 1,
          onMouseEnter: () => handleSelectedMenuOpen(menu),
          onMouseLeave: handleSelectedMenuClose,
          sx: {
            pointerEvents: 'auto',
          },
        } }}
      >
        <MenuList component="nav">
          {entries.filter((entry) => entry.granted !== false && !hiddenEntities.includes(entry.type)).map((entry) => {
            return (
              <MenuItem
                key={entry.label}
                component={Link}
                to={entry.link}
                selected={entry.exact ? location.pathname === entry.link : location.pathname.includes(entry.link)}
                dense={true}
                classes={{ root: classes.menuHoverItem }}
                onClick={handleSelectedMenuClose}
              >
                {entry.icon && <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {entry.icon}
                </ListItemIcon>}
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n(entry.label)}
                />
              </MenuItem>
            );
          })}
        </MenuList>
      </Popover>
    );
  };
  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: navOpen ? classes.drawerPaperOpen : classes.drawerPaper,
      }}
      sx={{
        width: navOpen ? 180 : 55,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Toolbar />
      <div ref={ref}>
        <MenuList
          component="nav"
          style={{ marginTop: bannerHeightNumber + settingsMessagesBannerHeight }}
        >
          <StyledTooltip title={!navOpen && t_i18n('Home')} placement="right">
            <MenuItem
              component={Link}
              to="/dashboard"
              selected={location.pathname === '/dashboard'}
              dense={true}
              classes={{ root: classes.menuItem }}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <DashboardOutlined />
              </ListItemIcon>
              {navOpen && (
              <ListItemText
                classes={{ primary: classes.menuItemText }}
                primary={t_i18n('Home')}
              />
              )}
            </MenuItem>
          </StyledTooltip>
        </MenuList>
        <Divider />
        <Security needs={[KNOWLEDGE]}>
          <MenuList component="nav">
            {!hideAnalyses && (
            <MenuItem
              ref={anchors.analyses}
              selected={!navOpen && location.pathname.includes('/dashboard/analyses')}
              dense={true}
              classes={{ root: classes.menuItem }}
              onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('analyses') : handleGoToPage('/dashboard/analyses'))}
              onMouseEnter={() => !navOpen && handleSelectedMenuOpen('analyses')}
              onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <AssignmentOutlined />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n('Analyses')}
                />
              )}
              {navOpen && (selectedMenu === 'analyses' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
            </MenuItem>
            )}
            {!hideAnalyses && generateSubMenu(
              'analyses',
              [
                { type: 'Report', link: '/dashboard/analyses/reports', label: 'Reports', icon: <DescriptionOutlined fontSize="small" /> },
                { type: 'Grouping', link: '/dashboard/analyses/groupings', label: 'Groupings', icon: <WorkspacesOutlined fontSize="small" /> },
                { type: 'Malware-Analysis', link: '/dashboard/analyses/malware_analyses', label: 'Malware analyses', icon: <BiotechOutlined fontSize="small" /> },
                { type: 'Note', link: '/dashboard/analyses/notes', label: 'Notes', icon: <SubjectOutlined fontSize="inherit" /> },
                { type: 'External-Reference', link: '/dashboard/analyses/external_references', label: 'External references', icon: <LocalOfferOutlined fontSize="small" /> },
              ],
            )}
            {!hideCases && (
            <MenuItem
              ref={anchors.cases}
              selected={!navOpen && location.pathname.includes('/dashboard/cases')}
              dense={true}
              classes={{ root: classes.menuItem }}
              onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('cases') : handleGoToPage('/dashboard/cases'))}
              onMouseEnter={() => !navOpen && handleSelectedMenuOpen('cases')}
              onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <CasesOutlined />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n('Cases')}
                />
              )}
              {navOpen && (selectedMenu === 'cases' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
            </MenuItem>
            )}
            {!hideCases && generateSubMenu(
              'cases',
              [
                { type: 'Case-Incident', link: '/dashboard/cases/incidents', label: 'Incident responses', icon: <BriefcaseEyeOutline fontSize="small" /> },
                { type: 'Case-Rfi', link: '/dashboard/cases/rfis', label: 'Requests for information', icon: <BriefcaseSearchOutline fontSize="small" /> },
                { type: 'Case-Rft', link: '/dashboard/cases/rfts', label: 'Requests for takedown', icon: <BriefcaseRemoveOutline fontSize="small" /> },
                { type: 'Task', link: '/dashboard/cases/tasks', label: 'Tasks', icon: <TaskAltOutlined fontSize="small" /> },
                { type: 'Feedback', link: '/dashboard/cases/feedbacks', label: 'Feedbacks', icon: <BriefcaseEditOutline fontSize="small" /> },
              ],
            )}
            {!hideEvents && (
            <MenuItem
              ref={anchors.events}
              selected={!navOpen && location.pathname.includes('/dashboard/events')}
              dense={true}
              classes={{ root: classes.menuItem }}
              onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('events') : handleGoToPage('/dashboard/events'))}
              onMouseEnter={() => !navOpen && handleSelectedMenuOpen('events')}
              onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <Timetable />
              </ListItemIcon>
              {navOpen && (
              <ListItemText
                classes={{ primary: classes.menuItemText }}
                primary={t_i18n('Events')}
              />
              )}
              {navOpen && (selectedMenu === 'events' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
            </MenuItem>
            )}
            {!hideEvents && generateSubMenu(
              'events',
              [
                { type: 'Incident', link: '/dashboard/events/incidents', label: 'Incidents', icon: <Fire fontSize="small" /> },
                { type: 'stix-sighting-relationship', link: '/dashboard/events/sightings', label: 'Sightings', icon: <VisibilityOutlined fontSize="small" /> },
                { type: 'Observed-Data', link: '/dashboard/events/observed_data', label: 'Observed datas', icon: <WifiTetheringOutlined fontSize="small" /> },
              ],
            )}
            {!hideObservations && (
            <MenuItem
              ref={anchors.observations}
              selected={!navOpen && location.pathname.includes('/dashboard/observations')}
              dense={true}
              classes={{ root: classes.menuItem }}
              onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('observations') : handleGoToPage('/dashboard/observations'))}
              onMouseEnter={() => !navOpen && handleSelectedMenuOpen('observations')}
              onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <Binoculars />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n('Observations')}
                />
              )}
              {navOpen && (selectedMenu === 'observations' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
            </MenuItem>
            )}
            {!hideObservations && generateSubMenu(
              'observations',
              [
                { type: 'Stix-Cyber-Observable', link: '/dashboard/observations/observables', label: 'Observables', icon: <HexagonOutline fontSize="small" /> },
                { type: 'Artifact', link: '/dashboard/observations/artifacts', label: 'Artifacts', icon: <ArchiveOutline fontSize="small" /> },
                { type: 'Indicator', link: '/dashboard/observations/indicators', label: 'Indicators', icon: <ShieldSearch fontSize="small" /> },
                { type: 'Infrastructure', link: '/dashboard/observations/infrastructures', label: 'Infrastructures', icon: <ServerNetwork fontSize="small" /> },
              ],
            )}
          </MenuList>
          <Divider />
          <MenuList component="nav">
            {!hideThreats && (
            <MenuItem
              ref={anchors.threats}
              selected={!navOpen && location.pathname.includes('/dashboard/threats')}
              dense={true}
              classes={{ root: classes.menuItem }}
              onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('threats') : handleGoToPage('/dashboard/threats'))}
              onMouseEnter={() => !navOpen && handleSelectedMenuOpen('threats')}
              onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <FlaskOutline />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n('Threats')}
                />
              )}
              {navOpen && (selectedMenu === 'threats' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
            </MenuItem>
            )}
            {!hideThreats && generateSubMenu(
              'threats',
              [
                { type: 'Threat-Actor-Group', link: '/dashboard/threats/threat_actors_group', label: 'Threat actors (group)', icon: <AccountMultipleOutline fontSize="small" /> },
                { type: 'Threat-Actor-Individual', link: '/dashboard/threats/threat_actors_individual', label: 'Threat actors (individual)', icon: <LaptopAccount fontSize="small" /> },
                { type: 'Intrusion-Set', link: '/dashboard/threats/intrusion_sets', label: 'Intrusion sets', icon: <DiamondOutlined fontSize="small" /> },
                { type: 'Campaign', link: '/dashboard/threats/campaigns', label: 'Campaigns', icon: <ChessKnight fontSize="small" /> },
              ],
            )}
            {!hideArsenal && (
            <MenuItem
              ref={anchors.arsenal}
              selected={!navOpen && location.pathname.includes('/dashboard/arsenal')}
              dense={true}
              classes={{ root: classes.menuItem }}
              onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('arsenal') : handleGoToPage('/dashboard/arsenal'))}
              onMouseEnter={() => !navOpen && handleSelectedMenuOpen('arsenal')}
              onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <LayersOutlined />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n('Arsenal')}
                />
              )}
              {navOpen && (selectedMenu === 'arsenal' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
            </MenuItem>
            )}
            {!hideArsenal && generateSubMenu(
              'arsenal',
              [
                { type: 'Malware', link: '/dashboard/arsenal/malwares', label: 'Malwares', icon: <Biohazard fontSize="small" /> },
                { type: 'Channel', link: '/dashboard/arsenal/channels', label: 'Channels', icon: <SurroundSoundOutlined fontSize="small" /> },
                { type: 'Tool', link: '/dashboard/arsenal/tools', label: 'Tools', icon: <WebAssetOutlined fontSize="small" /> },
                { type: 'Vulnerability', link: '/dashboard/arsenal/vulnerabilities', label: 'Vulnerabilities', icon: <BugReportOutlined fontSize="small" /> },
              ],
            )}
            {!hideTechniques && (
            <MenuItem
              ref={anchors.techniques}
              selected={!navOpen && location.pathname.includes('/dashboard/techniques')}
              dense={true}
              classes={{ root: classes.menuItem }}
              onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('techniques') : handleGoToPage('/dashboard/techniques'))}
              onMouseEnter={() => !navOpen && handleSelectedMenuOpen('techniques')}
              onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <ConstructionOutlined />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n('Techniques')}
                />
              )}
              {navOpen && (selectedMenu === 'techniques' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
            </MenuItem>
            )}
            {!hideTechniques && generateSubMenu(
              'techniques',
              [
                { type: 'Attack-Pattern', link: '/dashboard/techniques/attack_patterns', label: 'Attack patterns', icon: <LockPattern fontSize="small" /> },
                { type: 'Narrative', link: '/dashboard/techniques/narratives', label: 'Narratives', icon: <SpeakerNotesOutlined fontSize="small" /> },
                { type: 'Course-Of-Action', link: '/dashboard/techniques/courses_of_action', label: 'Courses of action', icon: <ProgressWrench fontSize="small" /> },
                { type: 'Data-Component', link: '/dashboard/techniques/data_components', label: 'Data components', icon: <SourceOutlined fontSize="small" /> },
                { type: 'Data-Source', link: '/dashboard/techniques/data_sources', label: 'Data sources', icon: <StreamOutlined fontSize="small" /> },
              ],
            )}
            {!hideEntities && (
            <MenuItem
              ref={anchors.entities}
              selected={!navOpen && location.pathname.includes('/dashboard/entities')}
              dense={true}
              classes={{ root: classes.menuItem }}
              onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('entities') : handleGoToPage('/dashboard/entities'))}
              onMouseEnter={() => !navOpen && handleSelectedMenuOpen('entities')}
              onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <FolderTableOutline />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n('Entities')}
                />
              )}
              {navOpen && (selectedMenu === 'entities' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
            </MenuItem>
            )}
            {!hideEntities && generateSubMenu(
              'entities',
              [
                { type: 'Sector', link: '/dashboard/entities/sectors', label: 'Sectors', icon: <DomainOutlined fontSize="small" /> },
                { type: 'Event', link: '/dashboard/entities/events', label: 'Events', icon: <EventOutlined fontSize="small" /> },
                { type: 'Organization', link: '/dashboard/entities/organizations', label: 'Organizations', icon: <AccountBalanceOutlined fontSize="small" /> },
                { type: 'System', link: '/dashboard/entities/systems', label: 'Systems', icon: <StorageOutlined fontSize="small" /> },
                { type: 'Individual', link: '/dashboard/entities/individuals', label: 'Individuals', icon: <PersonOutlined fontSize="small" /> },
              ],
            )}
            {!hideLocations && (
            <MenuItem
              ref={anchors.locations}
              selected={!navOpen && location.pathname.includes('/dashboard/locations')}
              dense={true}
              classes={{ root: classes.menuItem }}
              onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('locations') : handleGoToPage('/dashboard/locations'))}
              onMouseEnter={() => !navOpen && handleSelectedMenuOpen('locations')}
              onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <GlobeModel />
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n('Locations')}
                />
              )}
              {navOpen && (selectedMenu === 'locations' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
            </MenuItem>
            )}
            {!hideLocations && generateSubMenu(
              'locations',
              [
                { type: 'Region', link: '/dashboard/locations/regions', label: 'Regions', icon: <PublicOutlined fontSize="small" /> },
                { type: 'Country', link: '/dashboard/locations/countries', label: 'Countries', icon: <FlagOutlined fontSize="small" /> },
                { type: 'Administrative-Area', link: '/dashboard/locations/administrative_areas', label: 'Administrative areas', icon: <MapOutlined fontSize="small" /> },
                { type: 'City', link: '/dashboard/locations/cities', label: 'Cities', icon: <CityVariantOutline fontSize="small" /> },
                { type: 'Position', link: '/dashboard/locations/positions', label: 'Positions', icon: <PlaceOutlined fontSize="small" /> },
              ],
            )}
          </MenuList>
        </Security>
        <Security needs={[EXPLORE, MODULES, KNOWLEDGE, TAXIIAPI_SETCOLLECTIONS, TAXIIAPI_SETCSVMAPPERS]}>
          <Divider />
          <MenuList component="nav">
            <Security needs={[EXPLORE]}>
              <StyledTooltip title={!navOpen && t_i18n('Dashboards')} placement="right">
                <MenuItem
                  component={Link}
                  to="/dashboard/workspaces/dashboards"
                  selected={!navOpen && location.pathname.includes('/dashboard/workspaces/dashboards')}
                  dense={true}
                  classes={{ root: classes.menuItem }}
                >
                  <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                    <InsertChartOutlinedOutlined />
                  </ListItemIcon>
                  {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Dashboards')}
                  />
                  )}
                </MenuItem>
              </StyledTooltip>
              <StyledTooltip title={!navOpen && t_i18n('Investigations')} placement="right">
                <MenuItem
                  component={Link}
                  to="/dashboard/workspaces/investigations"
                  selected={!navOpen && location.pathname.includes('/dashboard/workspaces/investigations')}
                  dense={true}
                  classes={{ root: classes.menuItem }}
                >
                  <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                    <ExploreOutlined />
                  </ListItemIcon>
                  {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Investigations')}
                  />
                  )}
                </MenuItem>
              </StyledTooltip>
            </Security>
            <Security needs={[MODULES, KNOWLEDGE, TAXIIAPI_SETCOLLECTIONS, TAXIIAPI_SETCSVMAPPERS]}>
              <MenuItem
                ref={anchors.data}
                selected={!navOpen && location.pathname.includes('/dashboard/data')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('data') : handleGoToPage('/dashboard/data'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('data')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  <Database />
                </ListItemIcon>
                {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n('Data')}
                />
                )}
                {navOpen && (selectedMenu === 'data' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
              </MenuItem>
              {generateSubMenu(
                'data',
                [
                  { granted: isGrantedToKnowledge, link: '/dashboard/data/entities', label: 'Entities' },
                  { granted: isGrantedToKnowledge, link: '/dashboard/data/relationships', label: 'Relationships' },
                  { granted: isGrantedToSettings, link: '/dashboard/data/ingestion', label: 'Ingestion' },
                  { granted: isGrantedToImport, link: '/dashboard/data/import', label: 'Import' },
                  { granted: isGrantedToProcessing, link: '/dashboard/data/processing', label: 'Processing' },
                  { granted: isGrantedToSharing, link: '/dashboard/data/sharing', label: 'Data sharing' },
                ],
              )}
            </Security>
          </MenuList>
        </Security>
        <Security needs={[SETTINGS, MODULES, KNOWLEDGE, TAXIIAPI_SETCOLLECTIONS]}>
          <Divider />
          <MenuList component="nav">
            <Security needs={[SETTINGS, VIRTUAL_ORGANIZATION_ADMIN]}>
              {isOrganizationAdmin && !isGrantedToSettings ? (
                <StyledTooltip
                  title={!navOpen && t_i18n('Settings')}
                  placement="right"
                >
                  <MenuItem
                    component={Link}
                    to="/dashboard/settings/accesses/organizations"
                    selected={!navOpen && location.pathname.includes('/dashboard/settings')}
                    dense={true}
                    classes={{ root: classes.menuItem }}
                  >
                    <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                      <CogOutline />
                    </ListItemIcon>
                    {navOpen && (
                    <ListItemText
                      classes={{ primary: classes.menuItemText }}
                      primary={t_i18n('Settings')}
                    />
                    )}
                  </MenuItem>
                </StyledTooltip>
              ) : (
                <MenuItem
                  ref={anchors.settings}
                  selected={!navOpen && location.pathname.includes('/dashboard/settings')}
                  dense={true}
                  classes={{ root: classes.menuItem }}
                  onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('settings') : handleGoToPage('/dashboard/settings'))}
                  onMouseEnter={() => !navOpen && handleSelectedMenuOpen('settings')}
                  onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
                >
                  <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                    <CogOutline />
                  </ListItemIcon>
                  {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Settings')}
                  />
                  )}
                  {navOpen && (selectedMenu === 'settings' ? <ExpandLessOutlined /> : <ExpandMoreOutlined />)}
                </MenuItem>
              )}
              {isGrantedToSettings && generateSubMenu(
                'settings',
                [
                  { granted: isGrantedToSettings, link: '/dashboard/settings', label: 'Parameters', exact: true },
                  { granted: isGrantedToSecurity, link: '/dashboard/settings/accesses', label: 'Security' },
                  { granted: isGrantedToSettings, link: '/dashboard/settings/customization', label: 'Customization' },
                  { granted: isGrantedToLabels, link: '/dashboard/settings/vocabularies', label: 'Taxonomies' },
                  { granted: isGrantedToSettings, link: '/dashboard/settings/activity', label: 'Activity' },
                  { granted: isGrantedToSettings, link: '/dashboard/settings/file_indexing', label: 'File indexing' },
                ],
              )}
            </Security>
          </MenuList>
        </Security>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <MenuList component="nav">
          {(!platform_whitemark || !isEnterpriseEdition) && (
          <MenuItem
            dense={true}
            classes={{
              root: navOpen ? classes.menuLogoOpen : classes.menuLogo,
            }}
            onClick={() => window.open('https://filigran.io/', '_blank')}
          >
            <Tooltip title={'By Filigran'}>
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                <img
                  src={fileUri(theme.palette.mode === 'dark' ? logoFiligranDark : logoFiligranLight)}
                  alt="logo"
                  width={20}
                />
              </ListItemIcon>
            </Tooltip>
            {navOpen && (
            <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20, padding: '4px 0 0 15px' }}>
              <img
                src={fileUri(theme.palette.mode === 'dark' ? logoFiligranTextDark : logoFiligranTextLight)}
                alt="logo"
                width={50}
              />
            </ListItemIcon>
            )}
          </MenuItem>
          )}
          <MenuItem
            dense={true}
            style={{ marginBottom: bannerHeightNumber ? 6 : undefined }}
            classes={{
              root: navOpen ? classes.menuCollapseOpen : classes.menuCollapse,
            }}
            onClick={() => handleToggle()}
          >
            <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
              {navOpen ? <ChevronLeft /> : <ChevronRight />}
            </ListItemIcon>
            {navOpen && (
            <ListItemText
              classes={{ primary: classes.menuItemText }}
              primary={t_i18n('Collapse')}
            />
            )}
          </MenuItem>
        </MenuList>
      </div>
    </Drawer>
  );
};

export default LeftBar;
