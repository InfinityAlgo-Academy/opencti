import React, { FunctionComponent, useState } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { useFormatter } from '../../../../components/i18n';
import { SubscriptionAvatars } from '../../../../components/Subscription';
import { useIsEnforceReference } from '../../../../utils/hooks/useEntitySettings';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import { Theme } from '../../../../components/Theme';
import ThreatActorIndividualEditionOverview from './ThreatActorIndividualEditionOverview';
import ThreatActorIndividualEditionDemographics from './ThreatActorIndividualEditionDemographics';
import ThreatActorIndividualEditionBiographics from './ThreatActorIndividualEditionBiographics';
import {
  ThreatActorIndividualEditionContainerQuery,
} from './__generated__/ThreatActorIndividualEditionContainerQuery.graphql';
import ThreatActorIndividualEditionDetails from './ThreatActorIndividualEditionDetails';

const THREAT_ACTOR_TYPE = 'Threat-Actor-Individual';

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

interface ThreatActorIndividualEditionContainerProps {
  queryRef: PreloadedQuery<ThreatActorIndividualEditionContainerQuery>
  handleClose: () => void;
}

export const ThreatActorIndividualEditionQuery = graphql`
  query ThreatActorIndividualEditionContainerQuery($id: String!) {
    threatActorIndividual(id: $id) {
      ...ThreatActorIndividualEditionOverview_ThreatActorIndividual
      ...ThreatActorIndividualEditionDetails_ThreatActorIndividual
      ...ThreatActorIndividualEditionBiographics_ThreatActorIndividual
      ...ThreatActorIndividualEditionDemographics_ThreatActorIndividual
      ...ThreatActorIndividualDetails_ThreatActorIndividual
      editContext {
        name
        focusOn
      }
    }
  }
`;

const ThreatActorIndividualEditionContainer: FunctionComponent<ThreatActorIndividualEditionContainerProps> = ({ handleClose, queryRef }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const queryData = usePreloadedQuery(ThreatActorIndividualEditionQuery, queryRef);

  const [currentTab, setCurrentTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, value: number) => setCurrentTab(value);

  if (queryData.threatActorIndividual === null) {
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
          {t('Update a threat actor individual')}
        </Typography>
        <SubscriptionAvatars context={queryData.threatActorIndividual.editContext} />
        <div className="clearfix" />
      </div>
      <div className={classes.container}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleChangeTab}>
            <Tab label={t('Overview')} />
            <Tab label={t('Details')} />
            <Tab label={t('Demographics')} />
            <Tab label={t('Biographics')} />
          </Tabs>
        </Box>
        {currentTab === 0 && (
          <ThreatActorIndividualEditionOverview
            threatActorIndividualRef={queryData.threatActorIndividual}
            enableReferences={useIsEnforceReference(THREAT_ACTOR_TYPE)}
            context={queryData.threatActorIndividual.editContext}
            handleClose={handleClose}
          />
        )}
        {currentTab === 1 && (
          <ThreatActorIndividualEditionDetails
            threatActorIndividualRef={queryData.threatActorIndividual}
            enableReferences={useIsEnforceReference(THREAT_ACTOR_TYPE)}
            context={queryData.threatActorIndividual.editContext}
            handleClose={handleClose}
          />
        )}
        {currentTab === 2 && (
          <ThreatActorIndividualEditionDemographics
            threatActorIndividualRef={queryData.threatActorIndividual}
            enableReferences={useIsEnforceReference(THREAT_ACTOR_TYPE)}
            context={queryData.threatActorIndividual.editContext}
          />
        )}
        {currentTab === 3 && (
          <ThreatActorIndividualEditionBiographics
            threatActorIndividualRef={queryData.threatActorIndividual}
            enableReferences={useIsEnforceReference(THREAT_ACTOR_TYPE)}
            context={queryData.threatActorIndividual.editContext}
          />
        )}
      </div>
    </div>
  );
};

export default ThreatActorIndividualEditionContainer;
