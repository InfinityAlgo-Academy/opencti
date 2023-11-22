/*
Copyright (c) 2021-2023 Filigran SAS

This file is part of the OpenCTI Enterprise Edition ("EE") and is
licensed under the OpenCTI Non-Commercial License (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://github.com/OpenCTI-Platform/opencti/blob/master/LICENSE

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

import React, { FunctionComponent } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import useQueryLoading from '../../../../../utils/hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../../../../components/Loader';
import { isEmptyField } from '../../../../../utils/utils';
import EnterpriseEdition from '../../../common/entreprise_edition/EnterpriseEdition';
import { RootAlertingQuery } from './__generated__/RootAlertingQuery.graphql';
import Alerting from './Alerting';
import { useFormatter } from '../../../../../components/i18n';

export const rootQuery = graphql`
  query RootAlertingQuery {
    settings {
      id
      enterprise_edition
    }
  }
`;

interface ConfigurationComponentProps {
  queryRef: PreloadedQuery<RootAlertingQuery>;
}

const AlertingComponent: FunctionComponent<ConfigurationComponentProps> = ({
  queryRef,
}) => {
  const { settings } = usePreloadedQuery<RootAlertingQuery>(
    rootQuery,
    queryRef,
  );
  const { t } = useFormatter();
  if (isEmptyField(settings.enterprise_edition)) {
    return <EnterpriseEdition feature={t('Activity')} />;
  }
  return <Alerting />;
};

const Root = () => {
  const queryRef = useQueryLoading<RootAlertingQuery>(rootQuery, {});
  return (
    queryRef && (
      <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
        <AlertingComponent queryRef={queryRef} />
      </React.Suspense>
    )
  );
};

export default Root;
