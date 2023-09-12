import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import { MapOutlined, ArrowForwardIosOutlined } from '@mui/icons-material';
import inject18n from '../../../components/i18n';
import Security from '../../../utils/Security';
import {
  KNOWLEDGE_KNGETEXPORT,
  KNOWLEDGE_KNUPLOAD,
} from '../../../utils/hooks/useGranted';

const styles = (theme) => ({
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
});

class TopMenuAdministrativeArea extends Component {
  render() {
    const {
      t,
      location,
      id: administrativeAreaId,
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/locations/administrative_areas"
          variant="contained"
          size="small"
          color="primary"
          classes={{ root: classes.buttonHome }}
        >
          <MapOutlined className={classes.icon} fontSize="small" />
          {t('Areas')}
        </Button>
        <ArrowForwardIosOutlined
          color="primary"
          classes={{ root: classes.arrow }}
        />
        <Button
          component={Link}
          to={`/dashboard/locations/administrative_areas/${administrativeAreaId}`}
          variant={
            location.pathname
            === `/dashboard/locations/administrative_areas/${administrativeAreaId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/locations/administrative_areas/${administrativeAreaId}`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!administrativeAreaId}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/locations/administrative_areas/${administrativeAreaId}/knowledge`}
          variant={
            location.pathname.includes(
              `/dashboard/locations/administrative_areas/${administrativeAreaId}/knowledge`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/locations/administrative_areas/${administrativeAreaId}/knowledge`,
            )
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!administrativeAreaId}
        >
          {t('Knowledge')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/locations/administrative_areas/${administrativeAreaId}/analyses`}
          variant={
            location.pathname
            === `/dashboard/locations/administrative_areas/${administrativeAreaId}/analyses`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/locations/administrative_areas/${administrativeAreaId}/analyses`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!administrativeAreaId}
        >
          {t('Analyses')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/locations/administrative_areas/${administrativeAreaId}/sightings`}
          variant={
            location.pathname
            === `/dashboard/locations/administrative_areas/${administrativeAreaId}/sightings`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/locations/administrative_areas/${administrativeAreaId}/sightings`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!administrativeAreaId}
        >
          {t('Sightings')}
        </Button>
        <Security needs={[KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]}>
          <Button
            component={Link}
            to={`/dashboard/locations/administrative_areas/${administrativeAreaId}/files`}
            variant={
              location.pathname
              === `/dashboard/locations/administrative_areas/${administrativeAreaId}/files`
                ? 'contained'
                : 'text'
            }
            size="small"
            color={
              location.pathname
              === `/dashboard/locations/administrative_areas/${administrativeAreaId}/files`
                ? 'secondary'
                : 'primary'
            }
            classes={{ root: classes.button }}
            disabled={!administrativeAreaId}
          >
            {t('Data')}
          </Button>
        </Security>
        <Button
          component={Link}
          to={`/dashboard/locations/administrative_areas/${administrativeAreaId}/history`}
          variant={
            location.pathname
            === `/dashboard/locations/administrative_areas/${administrativeAreaId}/history`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/locations/administrative_areas/${administrativeAreaId}/history`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!administrativeAreaId}
        >
          {t('History')}
        </Button>
      </div>
    );
  }
}

TopMenuAdministrativeArea.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  id: PropTypes.string,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuAdministrativeArea);
