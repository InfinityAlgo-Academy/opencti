import React, { FunctionComponent } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import {
  ArrowForwardIosOutlined,
  TipsAndUpdatesOutlined,
} from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { useFormatter } from '../../../components/i18n';
import { Theme } from '../../../components/Theme';

const styles = makeStyles<Theme>((theme) => ({
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

const TopMenuFeedback: FunctionComponent = () => {
  const location = useLocation();
  const { t } = useFormatter();
  const classes = styles();
  const { caseId } = useParams() as { caseId: string };
  return (
    <div>
      <Button
        component={Link}
        to="/dashboard/cases/feedbacks"
        variant="contained"
        size="small"
        color="primary"
        classes={{ root: classes.buttonHome }}
      >
        <TipsAndUpdatesOutlined className={classes.icon} fontSize="small" />
        {t('Feedbacks')}
      </Button>
      <ArrowForwardIosOutlined
        color="primary"
        classes={{ root: classes.arrow }}
      />
      <Button
        component={Link}
        to={`/dashboard/cases/feedbacks/${caseId}`}
        variant={
          location.pathname === `/dashboard/cases/feedbacks/${caseId}`
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname === `/dashboard/cases/feedbacks/${caseId}`
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Overview')}
      </Button>
      <Button
        component={Link}
        to={`/dashboard/cases/feedbacks/${caseId}/content`}
        variant={
          location.pathname === `/dashboard/cases/feedbacks/${caseId}/content`
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname === `/dashboard/cases/feedbacks/${caseId}/content`
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Content')}
      </Button>
      <Button
        component={Link}
        to={`/dashboard/cases/feedbacks/${caseId}/files`}
        variant={
          location.pathname === `/dashboard/cases/feedbacks/${caseId}/files`
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname === `/dashboard/cases/feedbacks/${caseId}/files`
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Data')}
      </Button>
      <Button
        component={Link}
        to={`/dashboard/cases/feedbacks/${caseId}/history`}
        variant={
          location.pathname === `/dashboard/cases/feedbacks/${caseId}/history`
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname === `/dashboard/cases/feedbacks/${caseId}/history`
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('History')}
      </Button>
    </div>
  );
};

export default TopMenuFeedback;
