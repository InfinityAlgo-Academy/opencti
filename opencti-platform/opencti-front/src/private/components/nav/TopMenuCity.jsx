import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import { ArrowForwardIosOutlined } from '@mui/icons-material';
import { CityVariantOutline } from 'mdi-material-ui';
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

class TopMenuCity extends Component {
  render() {
    const {
      t,
      location,
      id: cityId,
      classes,
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/dashboard/locations/cities"
          variant="contained"
          size="small"
          color="primary"
          classes={{ root: classes.buttonHome }}
        >
          <CityVariantOutline className={classes.icon} fontSize="small" />
          {t('Cities')}
        </Button>
        <ArrowForwardIosOutlined
          color="primary"
          classes={{ root: classes.arrow }}
        />
        <Button
          component={Link}
          to={`/dashboard/locations/cities/${cityId}`}
          variant={
            location.pathname === `/dashboard/locations/cities/${cityId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/dashboard/locations/cities/${cityId}`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!cityId}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/locations/cities/${cityId}/knowledge`}
          variant={
            location.pathname.includes(
              `/dashboard/locations/cities/${cityId}/knowledge`,
            )
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(
              `/dashboard/locations/cities/${cityId}/knowledge`,
            )
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!cityId}
        >
          {t('Knowledge')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/locations/cities/${cityId}/analyses`}
          variant={
            location.pathname
            === `/dashboard/locations/cities/${cityId}/analyses`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/locations/cities/${cityId}/analyses`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!cityId}
        >
          {t('Analyses')}
        </Button>
        <Button
          component={Link}
          to={`/dashboard/locations/cities/${cityId}/sightings`}
          variant={
            location.pathname
            === `/dashboard/locations/cities/${cityId}/sightings`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/locations/cities/${cityId}/sightings`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!cityId}
        >
          {t('Sightings')}
        </Button>
        <Security needs={[KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]}>
          <Button
            component={Link}
            to={`/dashboard/locations/cities/${cityId}/files`}
            variant={
              location.pathname
              === `/dashboard/locations/cities/${cityId}/files`
                ? 'contained'
                : 'text'
            }
            size="small"
            color={
              location.pathname
              === `/dashboard/locations/cities/${cityId}/files`
                ? 'secondary'
                : 'primary'
            }
            classes={{ root: classes.button }}
            disabled={!cityId}
          >
            {t('Data')}
          </Button>
        </Security>
        <Button
          component={Link}
          to={`/dashboard/locations/cities/${cityId}/history`}
          variant={
            location.pathname
            === `/dashboard/locations/cities/${cityId}/history`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname
            === `/dashboard/locations/cities/${cityId}/history`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
          disabled={!cityId}
        >
          {t('History')}
        </Button>
      </div>
    );
  }
}

TopMenuCity.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  id: PropTypes.string,
};

export default compose(inject18n, withRouter, withStyles(styles))(TopMenuCity);
