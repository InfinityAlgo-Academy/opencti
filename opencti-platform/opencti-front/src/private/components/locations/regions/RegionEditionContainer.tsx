import React, { FunctionComponent } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { useFormatter } from '../../../../components/i18n';
import { SubscriptionAvatars } from '../../../../components/Subscription';
import RegionEditionOverview from './RegionEditionOverview';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import { RegionEditionContainerQuery } from './__generated__/RegionEditionContainerQuery.graphql';
import { Theme } from '../../../../components/Theme';

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
  importButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    borderBottom: '1px solid #5c5c5c',
  },
  title: {
    float: 'left',
  },
}));

interface RegionEditionContainerProps {
  handleClose: () => void
  queryRef: PreloadedQuery<RegionEditionContainerQuery>
}

export const regionEditionQuery = graphql`
  query RegionEditionContainerQuery($id: String!) {
    region(id: $id) {
      ...RegionEditionOverview_region
      editContext {
        name
        focusOn
      }
    }
    settings {
      platform_enable_reference
    }
  }
`;

const RegionEditionContainer: FunctionComponent<RegionEditionContainerProps> = ({ handleClose, queryRef }) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const queryData = usePreloadedQuery(regionEditionQuery, queryRef);

  if (queryData.region) {
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
            {t('Update a region')}
          </Typography>
          <SubscriptionAvatars context={queryData.region.editContext} />
          <div className="clearfix" />
        </div>
        <div className={classes.container}>
          <RegionEditionOverview
            regionRef={queryData.region}
            enableReferences={queryData.settings.platform_enable_reference?.includes('Region')}
            context={queryData.region.editContext}
            handleClose={handleClose}
          />
        </div>
      </div>
    );
  }

  return <Loader variant={LoaderVariant.inElement} />;
};

export default RegionEditionContainer;
