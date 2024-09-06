import React, { FunctionComponent } from 'react';
import {
  StixDomainObjectAttackPatternsKillChainContainer_data$data,
} from '@components/common/stix_domain_objects/__generated__/StixDomainObjectAttackPatternsKillChainContainer_data.graphql';
import Tooltip from '@mui/material/Tooltip';
import DataTableWithoutFragment from '../../../../components/dataGrid/DataTableWithoutFragment';
import { FilterGroup } from '../../../../utils/filters/filtersHelpers-types';
import { truncate } from '../../../../utils/String';

const LOCAL_STORAGE_KEY = 'stixDomainObjectAttackPatternsKillChainMatrixInline';

interface StixDomainObjectAttackPatternsKillChainMatrixProps {
  data: StixDomainObjectAttackPatternsKillChainContainer_data$data;
  filters?: FilterGroup;
}

const StixDomainObjectAttackPatternsKillChainMatrixInline: FunctionComponent<StixDomainObjectAttackPatternsKillChainMatrixProps> = (
  {
    data,
    filters,
  },
) => {
  const attackPatterns = (data.attackPatterns?.edges ?? []).map((n) => n.node);

  return (
    <DataTableWithoutFragment
      dataColumns={{
        entity_type: { percentWidth: 11, isSortable: false },
        killChainPhase: { percentWidth: 22, isSortable: false },
        x_mitre_id: { percentWidth: 10, isSortable: false },
        name: {
          percentWidth: 20,
          isSortable: true,
          render: ({ name }, { column: { size } }) => (<Tooltip title={name}>{truncate(name, size * 0.113)}</Tooltip>),
        },
        objectLabel: { percentWidth: 15, isSortable: false },
        created: { percentWidth: 12, isSortable: true },
        objectMarking: { percentWidth: 10, isSortable: true },
      }}
      storageKey={LOCAL_STORAGE_KEY}
      data={attackPatterns}
      globalCount={attackPatterns.length}
      allowBackgroundtasks={true}
      taskScope={'KNOWLEDGE'}
      toolbarFilters={filters}
    />
  );
};

export default StixDomainObjectAttackPatternsKillChainMatrixInline;
