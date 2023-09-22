import React, { FunctionComponent } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { SubscriptionAvatars } from '../../../../components/Subscription';
import { Theme } from '../../../../components/Theme';
import { useFormatter } from '../../../../components/i18n';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import FeedbackEditionOverview from './FeedbackEditionOverview';
import { FeedbackEditionContainerQuery } from './__generated__/FeedbackEditionContainerQuery.graphql';
import { useIsEnforceReference } from '../../../../utils/hooks/useEntitySettings';

const useStyles = makeStyles<Theme>((theme) => ({
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
  title: {
    float: 'left',
  },
}));

interface FeedbackEditionContainerProps {
  queryRef: PreloadedQuery<FeedbackEditionContainerQuery>;
  handleClose: () => void;
}

export const feedbackEditionQuery = graphql`
  query FeedbackEditionContainerQuery($id: String!) {
    feedback(id: $id) {
      ...FeedbackEditionOverview_case
      editContext {
        name
        focusOn
      }
    }
  }
`;

const FeedbackEditionContainer: FunctionComponent<
FeedbackEditionContainerProps
> = ({ queryRef, handleClose }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const queryData = usePreloadedQuery(feedbackEditionQuery, queryRef);
  if (queryData.feedback === null) {
    return <ErrorNotFound />;
  }
  return (
    <div>
      <div className={classes.header}>
        <IconButton
          aria-label="Close"
          className={classes.closeButton}
          onClick={handleClose}
          size="large"
          color="primary"
        >
          <Close fontSize="small" color="primary" />
        </IconButton>
        <Typography variant="h6" classes={{ root: classes.title }}>
          {t('Update a feedback')}
        </Typography>
        <SubscriptionAvatars context={queryData.feedback.editContext} />
        <div className="clearfix" />
      </div>
      <div className={classes.container}>
        <FeedbackEditionOverview
          feedbackRef={queryData.feedback}
          context={queryData.feedback.editContext}
          handleClose={handleClose}
          enableReferences={useIsEnforceReference('Feedback')}
        />
      </div>
    </div>
  );
};

export default FeedbackEditionContainer;
