import { Dispatch, SetStateAction } from 'react';
import { Filter, FilterGroup } from './filtersUtils';
import { LocalStorage } from '../hooks/useLocalStorageModel';

type FiltersLocalStorageUtilProps<U> = {
  viewStorage: LocalStorage,
  setValue: Dispatch<SetStateAction<LocalStorage>>
} & U;

const setFiltersValue = (setValue: Dispatch<SetStateAction<LocalStorage>>, filters: FilterGroup) => {
  setValue((c) => ({
    ...c,
    filters,
  }));
};

const updateFilters = (viewStorage: LocalStorage, setValue: Dispatch<SetStateAction<LocalStorage>>, updateFn: (filter: Filter) => Filter) => {
  if (viewStorage.filters) {
    const newBaseFilters: FilterGroup = {
      ...viewStorage.filters,
      filters: viewStorage.filters.filters.map(updateFn),
    };
    setFiltersValue(setValue, newBaseFilters);
  }
};
export const handleAddFilterWithEmptyValueUtil = ({ viewStorage, setValue, filter }: FiltersLocalStorageUtilProps<{
  filter: Filter
}>) => {
  if (viewStorage.filters) {
    const newBaseFilters = {
      ...viewStorage.filters,
      filters: [
        ...viewStorage.filters.filters,
        filter,
      ],
    };
    setFiltersValue(setValue, newBaseFilters);
  }
};

export const handleChangeOperatorFiltersUtil = ({ viewStorage, setValue, id, operator }: FiltersLocalStorageUtilProps<{
  id: string,
  operator: string
}>) => {
  updateFilters(viewStorage, setValue, (f) => (f.id === id
    ? {
      ...f,
      operator,
      values: ['nil', 'not_nil'].includes(operator) ? [] : f.values,
    }
    : f));
};

export const handleSwitchLocalModeUtil = ({ viewStorage, setValue, filter }: FiltersLocalStorageUtilProps<{
  filter: Filter
}>) => {
  updateFilters(viewStorage, setValue, (f) => (f.id === filter.id
    ? { ...f, mode: filter.mode === 'and' ? 'or' : 'and' }
    : f));
};

export const handleAddRepresentationFilterUtil = ({ viewStorage, setValue, id, valueId }: FiltersLocalStorageUtilProps<{
  id: string,
  valueId: string
}>) => {
  updateFilters(viewStorage, setValue, (f) => (f.id === id ? { ...f, values: [...f.values, valueId] } : f));
};

export const handleAddSingleValueFilterUtil = ({ viewStorage, setValue, id, valueId }: FiltersLocalStorageUtilProps<{
  id: string,
  valueId?: string
}>) => {
  if (valueId) {
    updateFilters(viewStorage, setValue, (f) => (f.id === id ? { ...f, values: [valueId] } : f));
  } else {
    updateFilters(viewStorage, setValue, (f) => (f.id === id ? { ...f, values: [] } : f));
  }
};

export const handleRemoveRepresentationFilterUtil = ({ viewStorage, setValue, id, valueId }: FiltersLocalStorageUtilProps<{
  id: string,
  valueId: string
}>) => {
  updateFilters(viewStorage, setValue, (f) => (f.id === id
    ? {
      ...f,
      values: f.values.filter((value) => value !== valueId),
    }
    : f));
};

export const handleRemoveFilterUtil = ({ viewStorage, setValue, id }: FiltersLocalStorageUtilProps<{ id?: string }>) => {
  if (viewStorage.filters) {
    const newBaseFilters: FilterGroup = {
      ...viewStorage.filters,
      filters: viewStorage.filters.filters.filter((f) => f.id !== id),
    };
    setFiltersValue(setValue, newBaseFilters);
  }
};
