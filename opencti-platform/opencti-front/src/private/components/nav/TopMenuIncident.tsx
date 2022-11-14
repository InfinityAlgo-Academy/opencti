import React, { useContext } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material/styles/createTheme';
import { Link, useLocation, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import { ArrowForwardIosOutlined } from '@mui/icons-material';
import { Fire } from 'mdi-material-ui';
import { useFormatter } from '../../../components/i18n';
import { granted, KNOWLEDGE_KNGETEXPORT, KNOWLEDGE_KNUPLOAD, UserContext } from '../../../utils/Security';

const useStyles = makeStyles<Theme>((theme) => ({
  buttonHome: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    textTransform: 'none',
  },
  button: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  arrow: {
    verticalAlign: 'middle',
    marginRight: 10,
  },
}));

const TopMenuIncident = () => {
  const location = useLocation();
  const { t } = useFormatter();
  const { incidentId } = useParams() as { incidentId: string };
  const classes = useStyles();
  const { me } = useContext(UserContext);
  const isUploaderOrExporter = granted(me, [KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]);
  const computePath = (path?: string) => `/dashboard/events/incidents/${incidentId}${path ?? ''}`;
  const computeVariant = (path?: string) => (location.pathname === computePath(path) ? 'contained' : 'text');
  const computeColor = (path?: string) => (location.pathname === computePath(path) ? 'secondary' : 'primary');
  const computeLocatedButton = (title: string, basePath?: string) => {
    return <Button component={Link} size="small" to={computePath(basePath)}
                   variant={computeVariant(basePath)} color={computeColor(basePath)}
                   classes={{ root: classes.button }}>
      {t(title)}
    </Button>;
  };
  return (
    <div>
      <Button component={Link} to="/dashboard/events/incidents"
              variant="contained" size="small" color="primary"
              classes={{ root: classes.buttonHome }}>
        <Fire className={classes.icon} fontSize="small" />
        {t('Incidents')}
      </Button>
      <ArrowForwardIosOutlined color="primary" classes={{ root: classes.arrow }} />
      {computeLocatedButton('Overview')}
      {computeLocatedButton('Knowledge', '/knowledge')}
      {computeLocatedButton('Content', '/content')}
      {computeLocatedButton('Analysis', '/analysis')}
      {isUploaderOrExporter && computeLocatedButton('Data', '/files')}
      {computeLocatedButton('History', '/history')}
    </div>
  );
};

export default TopMenuIncident;
