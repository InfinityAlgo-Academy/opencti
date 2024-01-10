/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Dispatch, MutableRefObject, ReactNode, SetStateAction } from 'react';
import React from 'react';
import { GraphQLTaggedNode } from 'react-relay';
import { PopoverProps } from '@mui/material/Popover/Popover';
import type { LocalStorage } from '../../utils/hooks/useLocalStorageModel';
import { FilterGroup } from '../../utils/filters/filtersUtils';
import type { UsePreloadedPaginationFragment } from '../../utils/hooks/usePreloadedPaginationFragment';
import { UseLocalStorageHelpers } from '../../utils/hooks/useLocalStorage';

export type ColumnSizeVars = Record<string, number>;

export type LocalStorageColumn = { size: number, visible?: boolean, index?: number };
export type LocalStorageColumns = Record<string, LocalStorageColumn>;

export enum DataTableVariant {
  default = 'default',
  inline = 'inline',
}

export interface UseDataTable<T = any> {
  data: T[]
  hasMore: () => boolean
  loadMore: (count: number, options?: Record<string, any>) => void
  isLoading: boolean
  isLoadingMore: () => boolean
}

export interface DataTableColumn {
  id: string
  isSortable?: boolean
  label?: string
  size?: number
  flexSize: number
  render?: (v: any, helpers?: any) => ReactNode
  visible?: boolean
  order?: number
  lastX?: number
}

export type DataTableColumns = DataTableColumn[];

export interface DataTableContextProps {
  storageKey: string
  columns: DataTableColumns
  availableFilterKeys?: string[] | undefined;
  effectiveColumns: DataTableColumns
  initialValues: LocalStorage
  setColumns: Dispatch<SetStateAction<DataTableColumns>>
  resolvePath: (data: any) => any
  parametersWithPadding: boolean
  redirectionModeEnabled?: boolean
  toolbarFilters?: FilterGroup
  useLineData?: (row: any) => any
  useDataTable?: (args: any) => any
  useDataCellHelpers?: (cell: DataTableColumn) => any
  useDataTableToggle?: (key: string) => {
    selectedElements: Record<string, any>
    deSelectedElements: Record<string, any>
    selectAll: boolean
    numberOfSelectedElements: number
    onToggleEntity: (
      entity: any,
      _?: React.SyntheticEvent,
      forceRemove?: any[],
    ) => void
    handleClearSelectedElements: () => void
    handleToggleSelectAll: () => void
    setSelectedElements: (selectedElements: Record<string, any>) => void
  }
  useComputeLink?: (entity: any) => string | null
  useDataTableLocalStorage?: <T extends LocalStorage = LocalStorage>(key: string, initialValues?: T, ignoreUri?: boolean) => [T, Dispatch<SetStateAction<T>>]
  onAddFilter?: (key: string) => void
  onSort?: (sortBy: string, orderAsc: boolean) => void
  formatter?: Record<string, (args: any) => any>
  variant: DataTableVariant
}

export interface DataTableProps {
  dataColumns: Record<string, Partial<DataTableColumn>>
  resolvePath: (data: any) => any
  storageKey: string
  initialValues: LocalStorage
  parametersWithPadding?: boolean
  toolbarFilters: FilterGroup
  lineFragment: GraphQLTaggedNode
  dataQueryArgs: UsePreloadedPaginationFragment<any>
  availableFilterKeys?: string[] | undefined;
  redirectionModeEnabled?: boolean
  additionalFilterKeys?: string[]
  entityTypes?: string[]
  settingsMessagesBannerHeight?: number
  storageHelpers: UseLocalStorageHelpers
  redirectionMode?: string | undefined
  filtersComponent?: ReactNode
  dataTableToolBarComponent?: ReactNode
  numberOfElements: { number: number, symbol: string } | undefined
  onAddFilter: DataTableContextProps['onAddFilter']
  onSort: (sortBy: string, orderAsc: boolean) => void
  formatter: DataTableContextProps['formatter']
  useDataTableLocalStorage: DataTableContextProps['useDataTableLocalStorage']
  useComputeLink: DataTableContextProps['useComputeLink']
  useDataTableToggle: DataTableContextProps['useDataTableToggle']
  useLineData: DataTableContextProps['useLineData']
  useDataTable: DataTableContextProps['useDataTable']
  useDataCellHelpers: DataTableContextProps['useDataCellHelpers']
  sortBy: string | undefined
  orderAsc: boolean | undefined
  variant?: DataTableVariant
}

export interface DataTableBodyProps {
  columns: DataTableColumns
  redirectionMode: DataTableProps['redirectionMode']
  storageHelpers: UseLocalStorageHelpers
  dataQueryArgs: DataTableProps['dataQueryArgs']
  hasFilterComponent: boolean
  dataTableToolBarComponent?: ReactNode
  sortBy: DataTableProps['sortBy']
  orderAsc: DataTableProps['orderAsc']
  settingsMessagesBannerHeight?: DataTableProps['settingsMessagesBannerHeight']
}

export interface DataTableDisplayFiltersProps {
  entityTypes?: string[]
  additionalFilterKeys?: string[]
  availableRelationFilterTypes?: Record<string, string[]> | undefined
  availableFilterKeys?: string[] | undefined;
  paginationOptions: any
}

export interface DataTableFiltersProps {
  availableFilterKeys?: string[] | undefined;
  availableRelationFilterTypes?: Record<string, string[]> | undefined
  availableEntityTypes?: string[]
  availableRelationshipTypes?: string[]
  searchContextFinal?: { entityTypes: string[]; elementId?: string[] | undefined; } | undefined
  filterExportContext?: { entity_type?: string, entity_id?: string }
  paginationOptions: any
  currentView?: string
  additionalHeaderButtons?: ReactNode
}

export interface DataTableHeadersProps {
  containerRef?: MutableRefObject<HTMLDivElement | null>
  effectiveColumns: DataTableColumns
  sortBy: DataTableProps['sortBy']
  orderAsc: DataTableProps['orderAsc']
  dataTableToolBarComponent: ReactNode
}

export interface DataTableHeaderProps {
  column: DataTableColumn
  anchorEl: PopoverProps['anchorEl']
  setAnchorEl: Dispatch<SetStateAction<PopoverProps['anchorEl']>>
  handleClose: () => void
  setLocalStorageColumns: Dispatch<SetStateAction<LocalStorageColumns>>
  containerRef?: MutableRefObject<HTMLDivElement | null>
  sortBy: boolean
  orderAsc: boolean
}

export interface DataTableLineProps {
  row: any
  redirectionMode?: string | undefined
  effectiveColumns: DataTableColumns
  storageHelpers: UseLocalStorageHelpers
}

export interface DataTableCellProps {
  cell: DataTableColumn
  data: any
  storageHelpers: UseLocalStorageHelpers
}
