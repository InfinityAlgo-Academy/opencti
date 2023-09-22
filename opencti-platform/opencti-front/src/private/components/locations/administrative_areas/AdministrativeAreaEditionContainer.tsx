import React, { FunctionComponent } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { SubscriptionAvatars } from '../../../../components/Subscription';
import AdministrativeAreaEditionOverview from './AdministrativeAreaEditionOverview';
import { Theme } from '../../../../components/Theme';
import { useFormatter } from '../../../../components/i18n';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import { AdministrativeAreaEditionContainerQuery } from './__generated__/AdministrativeAreaEditionContainerQuery.graphql';
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

interface AdministrativeAreaEditionContainerProps {
  queryRef: PreloadedQuery<AdministrativeAreaEditionContainerQuery>;
  handleClose: () => void;
}

export const administrativeAreaEditionQuery = graphql`
  query AdministrativeAreaEditionContainerQuery($id: String!) {
    administrativeArea(id: $id) {
      ...AdministrativeAreaEditionOverview_administrativeArea
      editContext {
        name
        focusOn
      }
    }
  }
`;
const AdministrativeAreaEditionContainer: FunctionComponent<
AdministrativeAreaEditionContainerProps
> = ({ queryRef, handleClose }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const queryData = usePreloadedQuery(administrativeAreaEditionQuery, queryRef);
  if (queryData.administrativeArea === null) {
    return <ErrorNotFound />;
  }
  return (
    <>
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
          {t('Update an area')}
        </Typography>
        <SubscriptionAvatars
          context={queryData.administrativeArea.editContext}
        />
        <div className="clearfix" />
      </div>
      <div className={classes.container}>
        <AdministrativeAreaEditionOverview
          administrativeAreaRef={queryData.administrativeArea}
          context={queryData.administrativeArea.editContext}
          handleClose={handleClose}
          enableReferences={useIsEnforceReference('Administrative-Area')}
        />
      </div>
    </>
  );
};

export default AdministrativeAreaEditionContainer;
