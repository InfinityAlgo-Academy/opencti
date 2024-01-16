import React, { FunctionComponent } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import EntitySettingHiddenTypesList, { Entity } from '../sub_types/entity_setting/EntitySettingHiddenTypesList';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import { useFormatter } from '../../../../components/i18n';
import { SettingsOrganizationEntitySettingHiddenTypesListQuery } from './__generated__/SettingsOrganizationEntitySettingHiddenTypesListQuery.graphql';

const settingsOrganizationEntitySettingHiddenTypesListQuery = graphql`
  query SettingsOrganizationEntitySettingHiddenTypesListQuery {
    organizations {
      edges {
        node {
          id
          name
          default_hidden_types
        }
      }
    }
  }
`;

const SettingsOrganizationEntitySettingHiddenTypesListComponent: FunctionComponent<{
  targetType: string
  queryRef: PreloadedQuery<SettingsOrganizationEntitySettingHiddenTypesListQuery>
}> = ({
  targetType,
  queryRef,
}) => {
  const { t_i18n } = useFormatter();
  const data = usePreloadedQuery<SettingsOrganizationEntitySettingHiddenTypesListQuery>(settingsOrganizationEntitySettingHiddenTypesListQuery, queryRef);
  const organizations: Entity[] = data.organizations?.edges?.map((e) => e?.node) ?? [];

  return (
    <EntitySettingHiddenTypesList
      targetType={targetType}
      nodes={organizations}
      label={t_i18n('Hidden in organizations')}
      link={'/dashboard/settings/accesses/organizations/'}
      entityType={'Organization'}
    />
  );
};
const SettingsOrganizationEntitySettingHiddenTypesList: FunctionComponent<{ targetType: string }> = ({ targetType }) => {
  const queryRef = useQueryLoading<SettingsOrganizationEntitySettingHiddenTypesListQuery>(settingsOrganizationEntitySettingHiddenTypesListQuery, {});
  return <>
    {queryRef && (
      <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
        <SettingsOrganizationEntitySettingHiddenTypesListComponent queryRef={queryRef} targetType={targetType} />
      </React.Suspense>
    )}
  </>;
};

export default SettingsOrganizationEntitySettingHiddenTypesList;
