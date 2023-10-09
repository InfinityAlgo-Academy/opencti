import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import * as R from 'ramda';
import { useNavigate } from 'react-router-dom-v5-compat';
import { FiltersVariant, isUniqFilter } from '../../../../utils/filters/filtersUtils';
import FiltersElement from './FiltersElement';
import ListFilters from './ListFilters';
import DialogFilters from './DialogFilters';
import { HandleAddFilter } from '../../../../utils/hooks/useLocalStorage';
import type { Filters as FiltersType } from '../../../../components/list_lines';

interface FiltersProps {
  variant?: string;
  disabled?: boolean;
  size?: number;
  fontSize?: number;
  availableFilterKeys: string[];
  noDirectFilters?: boolean;
  availableEntityTypes?: string[];
  availableRelationshipTypes?: string[],
  availableRelationFilterTypes?: Record<string, string[]>,
  allEntityTypes?: boolean;
  handleAddFilter?: HandleAddFilter,
  handleRemoveFilter?: (key: string, id?: string) => void,
  handleSwitchFilter?: HandleAddFilter,
  searchContext?: { entityTypes: string[], elementId?: string[] };
  type?: string;
}
const Filters: FunctionComponent<FiltersProps> = ({
  variant,
  disabled,
  size,
  fontSize,
  availableFilterKeys,
  noDirectFilters,
  availableEntityTypes,
  availableRelationshipTypes,
  availableRelationFilterTypes,
  allEntityTypes,
  handleAddFilter,
  handleRemoveFilter,
  handleSwitchFilter,
  searchContext,
  type,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [filters, setFilters] = useState<FiltersType>({});
  const [inputValues, setInputValues] = useState({});
  const [keyword, setKeyword] = useState('');

  const handleOpenFilters = (event: React.SyntheticEvent) => {
    setOpen(true);
    setAnchorEl(event.currentTarget);
  };
  const handleCloseFilters = () => {
    setOpen(false);
    setAnchorEl(null);
  };
  const defaultHandleAddFilter = handleAddFilter
    || ((key, id, value, event = undefined) => {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      if ((filters[key] ?? []).length > 0) {
        setFilters((c) => ({
          ...c,
          [key]: isUniqFilter(key)
            ? [{ id, value }]
            : R.uniqBy(R.prop('id'), [{ id, value }, ...c[key]]),
        }));
      } else {
        setFilters((c) => ({ ...c, [key]: [{ id, value }] }));
      }
    });
  const defaultHandleRemoveFilter = handleRemoveFilter || ((key) => setFilters((c) => R.dissoc(key, c)));
  const handleSearch = () => {
    handleCloseFilters();
    const urlParams = { filters: JSON.stringify(filters) };
    navigate(
      `/dashboard/search${
        keyword.length > 0 ? `/${keyword}` : ''
      }?${new URLSearchParams(urlParams).toString()}`,
    );
  };
  const handleChangeKeyword = (event: ChangeEvent) => setKeyword((event.target as HTMLInputElement).value);

  const filterElement = (
    <FiltersElement
      variant={variant}
      keyword={keyword}
      availableFilterKeys={availableFilterKeys}
      searchContext={searchContext ?? { entityTypes: [] }}
      handleChangeKeyword={handleChangeKeyword}
      noDirectFilters={noDirectFilters}
      inputValues={inputValues}
      setInputValues={setInputValues}
      defaultHandleAddFilter={defaultHandleAddFilter}
      availableEntityTypes={availableEntityTypes}
      availableRelationshipTypes={availableRelationshipTypes}
      availableRelationFilterTypes={availableRelationFilterTypes}
      allEntityTypes={allEntityTypes}
    />
  );
  if (variant === FiltersVariant.dialog) {
    return (
      <DialogFilters
        handleOpenFilters={handleOpenFilters}
        disabled={disabled}
        size={size}
        fontSize={fontSize}
        open={open}
        filters={filters}
        handleCloseFilters={handleCloseFilters}
        defaultHandleRemoveFilter={defaultHandleRemoveFilter}
        handleSearch={handleSearch}
        filterElement={filterElement}
      />
    );
  }
  return (
    <ListFilters
      size={size}
      fontSize={fontSize}
      handleOpenFilters={handleOpenFilters}
      handleCloseFilters={handleCloseFilters}
      open={open}
      anchorEl={anchorEl}
      noDirectFilters={noDirectFilters}
      availableFilterKeys={availableFilterKeys}
      filterElement={filterElement}
      searchContext={searchContext}
      variant={variant}
      type={type}
      inputValues={inputValues}
      setInputValues={setInputValues}
      defaultHandleAddFilter={defaultHandleAddFilter}
      defaultHandleRemoveFilter={defaultHandleRemoveFilter}
      handleSwitchFilter={handleSwitchFilter}
      availableEntityTypes={availableEntityTypes}
      availableRelationshipTypes={availableRelationshipTypes}
      availableRelationFilterTypes={availableRelationFilterTypes}
      allEntityTypes={allEntityTypes}
    />
  );
};

export default Filters;
