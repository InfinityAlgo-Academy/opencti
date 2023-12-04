import React, { FunctionComponent, useRef } from 'react';
import { ChipOwnProps } from '@mui/material/Chip/Chip';
import { DataColumns } from './list_lines';
import {
  Filter,
  FilterGroup,
  GqlFilterGroup,
  initialFilterGroup,
  removeIdFromFilterObject,
} from '../utils/filters/filtersUtils';
import { filterIconButtonContentQuery } from './FilterIconButtonContent';
import useQueryLoading from '../utils/hooks/useQueryLoading';
import { FilterIconButtonContentQuery } from './__generated__/FilterIconButtonContentQuery.graphql';
import FilterIconButtonContainer from './FilterIconButtonContainer';
import { UseLocalStorageHelpers } from '../utils/hooks/useLocalStorage';

interface FilterIconButtonProps {
  availableFilterKeys?: string[];
  filters?: FilterGroup;
  handleRemoveFilter?: (key: string, op?: string) => void;
  handleSwitchGlobalMode?: () => void;
  handleSwitchLocalMode?: (filter: Filter) => void;
  classNameNumber?: number;
  styleNumber?: number;
  chipColor?: ChipOwnProps['color'];
  dataColumns?: DataColumns;
  disabledPossible?: boolean;
  redirection?: boolean;
  helpers?: UseLocalStorageHelpers;
}

const FilterIconButton: FunctionComponent<FilterIconButtonProps> = ({
  availableFilterKeys,
  filters = initialFilterGroup,
  handleRemoveFilter,
  handleSwitchGlobalMode,
  handleSwitchLocalMode,
  styleNumber,
  disabledPossible,
  redirection,
  chipColor,
  helpers,
}) => {
  const hasRenderedRef = useRef(false);
  const setHasRenderedRef = () => {
    hasRenderedRef.current = true;
  };
  const displayedFilters = {
    ...filters,
    filters:
      filters.filters.filter(
        (f) => !availableFilterKeys || availableFilterKeys?.some((k) => f.key === k),
      ) || [],
  };
  const filtersRepresentativesQueryRef = useQueryLoading<FilterIconButtonContentQuery>(
    filterIconButtonContentQuery,
    {
      filters: removeIdFromFilterObject(
        displayedFilters,
      ) as unknown as GqlFilterGroup,
    },
  );
  return (
    <>
      {filtersRepresentativesQueryRef && (
        <React.Suspense fallback={<span />}>
          <FilterIconButtonContainer
            handleRemoveFilter={handleRemoveFilter}
            handleSwitchGlobalMode={handleSwitchGlobalMode}
            handleSwitchLocalMode={handleSwitchLocalMode}
            styleNumber={styleNumber}
            chipColor={chipColor}
            disabledPossible={disabledPossible}
            redirection={redirection}
            filters={displayedFilters}
            filtersRepresentativesQueryRef={filtersRepresentativesQueryRef}
            helpers={helpers}
            hasRenderedRef={hasRenderedRef.current}
            setHasRenderedRef={setHasRenderedRef}
          />
        </React.Suspense>
      )}
    </>
  );
};

export default FilterIconButton;
