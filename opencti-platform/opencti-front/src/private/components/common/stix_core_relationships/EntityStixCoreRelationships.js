import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import { withRouter } from 'react-router-dom';
import { QueryRenderer } from '../../../../relay/environment';
import ListLines from '../../../../components/list_lines/ListLines';
import inject18n from '../../../../components/i18n';
import StixCoreRelationshipCreationFromEntity from './StixCoreRelationshipCreationFromEntity';
import Security from '../../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../../utils/hooks/useGranted';
import EntityStixCoreRelationshipsLinesFrom, {
  entityStixCoreRelationshipsLinesFromQuery,
} from './EntityStixCoreRelationshipsLinesFrom';
import EntityStixCoreRelationshipsLinesTo, {
  entityStixCoreRelationshipsLinesToQuery,
} from './EntityStixCoreRelationshipsLinesTo';
import {
  buildViewParamsFromUrlAndStorage,
  convertFilters,
  saveViewParameters,
} from '../../../../utils/ListParameters';
import EntityStixCoreRelationshipsLinesAll, {
  entityStixCoreRelationshipsLinesAllQuery,
} from './EntityStixCoreRelationshipsLinesAll';
import { isUniqFilter } from '../../../../utils/filters/filtersUtils';
import { UserContext } from '../../../../utils/hooks/useAuth';
import ToolBar from '../../data/ToolBar';
import EntityStixCoreRelationshipsEntities from './EntityStixCoreRelationshipsEntities';

const styles = (theme) => ({
  bottomNav: {
    zIndex: 1000,
    padding: '10px 200px 10px 205px',
    display: 'flex',
  },
  container: {
    marginTop: 15,
    paddingBottom: 70,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing(1) / 4,
  },
});

class EntityStixCoreRelationships extends Component {
  constructor(props) {
    super(props);
    let params = {};
    if (!props.noState) {
      params = buildViewParamsFromUrlAndStorage(
        props.history,
        props.location,
        `view-relationships-${
          props.entityId
        }-${props.targetStixDomainObjectTypes?.join(
          '-',
        )}-${props.relationshipTypes?.join('-')}`,
      );
    }
    this.state = {
      sortBy: R.propOr('entity_type', 'sortBy', params),
      orderAsc: R.propOr(false, 'orderAsc', params),
      searchTerm: R.propOr('', 'searchTerm', params),
      view: R.propOr('entities', 'view', params),
      filters: R.propOr({}, 'filters', params),
      numberOfElements: { number: 0, symbol: '' },
      openExports: false,
    };
  }

  saveView() {
    if (!this.props.noState) {
      saveViewParameters(
        this.props.history,
        this.props.location,
        `view-relationships-${
          this.props.entityId
        }-${this.props.targetStixDomainObjectTypes?.join(
          '-',
        )}-${this.props.relationshipTypes?.join('-')}`,
        this.state,
      );
    }
  }

  handleSort(field, orderAsc) {
    this.setState({ sortBy: field, orderAsc }, () => this.saveView());
  }

  handleSearch(value) {
    this.setState({ searchTerm: value }, () => this.saveView());
  }

  handleAddFilter(key, id, value, event = null) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.state.filters[key] && this.state.filters[key].length > 0) {
      this.setState(
        {
          filters: R.assoc(
            key,
            isUniqFilter(key)
              ? [{ id, value }]
              : R.uniqBy(R.prop('id'), [
                { id, value },
                ...this.state.filters[key],
              ]),
            this.state.filters,
          ),
        },
        () => this.saveView(),
      );
    } else {
      this.setState(
        {
          filters: R.assoc(key, [{ id, value }], this.state.filters),
        },
        () => this.saveView(),
      );
    }
  }

  handleRemoveFilter(key) {
    this.setState({ filters: R.dissoc(key, this.state.filters) }, () => this.saveView());
  }

  setNumberOfElements(numberOfElements) {
    this.setState({ numberOfElements });
  }

  handleToggleExports() {
    this.setState({ openExports: !this.state.openExports });
  }

  handleChangeView(mode) {
    this.setState({ view: mode, sortBy: 'entity_type' }, () => this.saveView());
  }

  renderRelationships(paginationOptions) {
    const { sortBy, orderAsc, numberOfElements, filters, openExports } = this.state;
    const {
      entityLink,
      entityId,
      isRelationReversed,
      allDirections,
      targetStixDomainObjectTypes,
      relationshipTypes,
      disableExport,
      enableNestedView,
    } = this.props;
    const dataColumns = {
      relationship_type: {
        label: 'Relationship type',
        width: '12%',
        isSortable: true,
      },
      name: {
        label: 'Name',
        width: '25%',
        isSortable: false,
      },
      entity_type: {
        label: 'Entity type',
        width: '15%',
        isSortable: false,
      },
      start_time: {
        label: 'Start time',
        width: '13%',
        isSortable: true,
      },
      stop_time: {
        label: 'Stop time',
        width: '13%',
        isSortable: true,
      },
      created: {
        label: 'Creation date',
        width: '13%',
        isSortable: true,
      },
      confidence: {
        label: 'Confidence',
        isSortable: true,
      },
    };
    return (
      <ListLines
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataColumns={dataColumns}
        handleSort={this.handleSort.bind(this)}
        handleSearch={this.handleSearch.bind(this)}
        handleAddFilter={this.handleAddFilter.bind(this)}
        handleRemoveFilter={this.handleRemoveFilter.bind(this)}
        displayImport={true}
        secondaryAction={true}
        numberOfElements={numberOfElements}
        filters={filters}
        availableFilterKeys={[
          'relationship_type',
          'entity_type',
          'markedBy',
          'createdBy',
          'created_start_date',
          'created_end_date',
        ]}
        availableEntityTypes={targetStixDomainObjectTypes}
        availableRelationshipTypes={relationshipTypes}
        handleToggleExports={
          disableExport ? null : this.handleToggleExports.bind(this)
        }
        openExports={openExports}
        exportEntityType="stix-core-relationship"
        noPadding={true}
        handleChangeView={
          this.props.handleChangeView ?? this.handleChangeView.bind(this)
        }
        enableNestedView={enableNestedView}
        disableCards={true}
        paginationOptions={paginationOptions}
        enableEntitiesView={true}
      >
        <QueryRenderer
          query={
            // eslint-disable-next-line no-nested-ternary
            allDirections
              ? entityStixCoreRelationshipsLinesAllQuery
              : isRelationReversed
                ? entityStixCoreRelationshipsLinesToQuery
                : entityStixCoreRelationshipsLinesFromQuery
          }
          variables={{ count: 25, ...paginationOptions }}
          render={({ props }) =>
            /* eslint-disable-next-line no-nested-ternary,implicit-arrow-linebreak */
            (allDirections ? (
              <EntityStixCoreRelationshipsLinesAll
                data={props}
                paginationOptions={paginationOptions}
                entityLink={entityLink}
                entityId={entityId}
                dataColumns={dataColumns}
                initialLoading={props === null}
                setNumberOfElements={this.setNumberOfElements.bind(this)}
              />
            ) : isRelationReversed ? (
              <EntityStixCoreRelationshipsLinesTo
                data={props}
                paginationOptions={paginationOptions}
                entityLink={entityLink}
                dataColumns={dataColumns}
                initialLoading={props === null}
                setNumberOfElements={this.setNumberOfElements.bind(this)}
              />
            ) : (
              <EntityStixCoreRelationshipsLinesFrom
                data={props}
                paginationOptions={paginationOptions}
                entityLink={entityLink}
                dataColumns={dataColumns}
                initialLoading={props === null}
                setNumberOfElements={this.setNumberOfElements.bind(this)}
              />
            ))
          }
        />
      </ListLines>
    );
  }

  handleToggleSelectEntity(entity, event, forceRemove = []) {
    event.stopPropagation();
    event.preventDefault();
    const { selectedElements, deSelectedElements, selectAll } = this.state;
    if (Array.isArray(entity)) {
      const currentIds = R.values(selectedElements).map((n) => n.id);
      const givenIds = entity.map((n) => n.id);
      const addedIds = givenIds.filter((n) => !currentIds.includes(n));
      let newSelectedElements = {
        ...selectedElements,
        ...R.indexBy(
          R.prop('id'),
          entity.filter((n) => addedIds.includes(n.id)),
        ),
      };
      if (forceRemove.length > 0) {
        newSelectedElements = R.omit(
          forceRemove.map((n) => n.id),
          newSelectedElements,
        );
      }
      this.setState({
        selectAll: false,
        selectedElements: newSelectedElements,
        deSelectedElements: null,
      });
    } else if (entity.id in (selectedElements || {})) {
      const newSelectedElements = R.omit([entity.id], selectedElements);
      this.setState({
        selectAll: false,
        selectedElements: newSelectedElements,
      });
    } else if (selectAll && entity.id in (deSelectedElements || {})) {
      const newDeSelectedElements = R.omit([entity.id], deSelectedElements);
      this.setState({
        deSelectedElements: newDeSelectedElements,
      });
    } else if (selectAll) {
      const newDeSelectedElements = R.assoc(
        entity.id,
        entity,
        deSelectedElements || {},
      );
      this.setState({
        deSelectedElements: newDeSelectedElements,
      });
    } else {
      const newSelectedElements = R.assoc(
        entity.id,
        entity,
        selectedElements || {},
      );
      this.setState({
        selectAll: false,
        selectedElements: newSelectedElements,
      });
    }
  }

  handleToggleSelectAll() {
    this.setState({
      selectAll: !this.state.selectAll,
      selectedElements: null,
      deSelectedElements: null,
    });
  }

  handleClearSelectedElements() {
    this.setState({
      selectAll: false,
      selectedElements: null,
      deSelectedElements: null,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  buildColumnsEntities(helper) {
    const isRuntimeSort = helper.isRuntimeFieldEnable();
    return {
      entity_type: {
        label: 'Type',
        width: '15%',
        isSortable: true,
      },
      name: {
        label: 'Name',
        width: '30%',
        isSortable: isRuntimeSort,
      },
      objectLabel: {
        label: 'Labels',
        width: '20%',
        isSortable: false,
      },
      created_at: {
        label: 'Creation date',
        width: '18%',
        isSortable: true,
      },
      objectMarking: {
        label: 'Marking',
        isSortable: isRuntimeSort,
      },
    };
  }

  renderEntities(paginationOptions) {
    const {
      sortBy,
      orderAsc,
      numberOfElements,
      openExports,
      selectAll,
      selectedElements,
      deSelectedElements,
      view,
      filters,
      searchTerm,
    } = this.state;
    const {
      entityLink,
      isRelationReversed,
      disableExport,
      targetStixDomainObjectTypes,
    } = this.props;
    let numberOfSelectedElements = Object.keys(selectedElements || {}).length;
    if (selectAll) {
      numberOfSelectedElements = numberOfElements.original
        - Object.keys(deSelectedElements || {}).length;
    }
    return (
      <UserContext.Consumer>
        {({ helper }) => (
          <div>
            <ListLines
              sortBy={sortBy}
              orderAsc={orderAsc}
              dataColumns={this.buildColumnsEntities(helper)}
              handleSort={this.handleSort.bind(this)}
              handleSearch={this.handleSearch.bind(this)}
              handleAddFilter={this.handleAddFilter.bind(this)}
              handleRemoveFilter={this.handleRemoveFilter.bind(this)}
              handleChangeView={this.handleChangeView.bind(this)}
              onToggleEntity={this.handleToggleSelectEntity.bind(this)}
              handleToggleSelectAll={this.handleToggleSelectAll.bind(this)}
              paginationOptions={paginationOptions}
              selectAll={selectAll}
              displayImport={true}
              handleToggleExports={
                disableExport ? null : this.handleToggleExports.bind(this)
              }
              openExports={openExports}
              exportEntityType="stix-core-relationship"
              iconExtension={true}
              filters={filters}
              availableFilterKeys={[
                'entity_type',
                'markedBy',
                'createdBy',
                'created_start_date',
                'created_end_date',
                'labelledBy',
              ]}
              availableEntityTypes={targetStixDomainObjectTypes}
              numberOfElements={numberOfElements}
              noPadding={true}
              disableCards={true}
              enableEntitiesView={true}
              currentView={view}
            >
              <EntityStixCoreRelationshipsEntities
                paginationOptions={paginationOptions}
                entityLink={entityLink}
                dataColumns={this.buildColumnsEntities(helper)}
                onToggleEntity={this.handleToggleSelectEntity.bind(this)}
                setNumberOfElements={this.setNumberOfElements.bind(this)}
                isRelationReversed={isRelationReversed}
                onLabelClick={this.handleAddFilter.bind(this)}
                selectedElements={selectedElements}
                deSelectedElements={deSelectedElements}
                selectAll={selectAll}
              />
            </ListLines>
            <ToolBar
              selectedElements={selectedElements}
              deSelectedElements={deSelectedElements}
              numberOfSelectedElements={numberOfSelectedElements}
              selectAll={selectAll}
              filters={filters}
              search={searchTerm}
              handleClearSelectedElements={this.handleClearSelectedElements.bind(
                this,
              )}
              variant="medium"
            />
          </div>
        )}
      </UserContext.Consumer>
    );
  }

  render() {
    const {
      classes,
      targetStixDomainObjectTypes,
      entityId,
      role,
      relationshipTypes,
      isRelationReversed,
      allDirections,
      defaultStartTime,
      defaultStopTime,
    } = this.props;
    const { view, searchTerm, sortBy, orderAsc, filters } = this.state;
    let selectedTypes;
    if (filters.entity_type && filters.entity_type.length > 0) {
      if (R.filter((o) => o.id === 'all', filters.entity_type).length > 0) {
        selectedTypes = [];
      } else {
        selectedTypes = filters.entity_type.map((o) => o.id);
      }
    } else {
      selectedTypes = Array.isArray(targetStixDomainObjectTypes)
        && targetStixDomainObjectTypes.length > 0
        ? targetStixDomainObjectTypes
        : [];
    }
    let selectedRelationshipTypes;
    if (filters.relationship_type && filters.relationship_type.length > 0) {
      if (
        R.filter((o) => o.id === 'all', filters.relationship_type).length > 0
      ) {
        selectedRelationshipTypes = [];
      } else {
        selectedRelationshipTypes = filters.relationship_type.map((o) => o.id);
      }
    } else {
      selectedRelationshipTypes = Array.isArray(relationshipTypes) && relationshipTypes.length > 0
        ? relationshipTypes
        : [];
    }
    const finalFilters = convertFilters(
      R.omit(['relationship_type', 'entity_type'], filters),
    );
    let paginationOptions;
    if (view === 'entities') {
      paginationOptions = {
        types: selectedTypes,
        relationship_type: selectedRelationshipTypes,
        elementId: entityId,
        search: searchTerm,
        orderBy: sortBy,
        orderMode: orderAsc ? 'asc' : 'desc',
        filters: finalFilters,
      };
    } else {
      paginationOptions = {
        relationship_type: selectedRelationshipTypes,
        search: searchTerm,
        orderBy: sortBy,
        orderMode: orderAsc ? 'asc' : 'desc',
        filters: finalFilters,
      };
      if (allDirections) {
        paginationOptions = {
          ...paginationOptions,
          elementId: entityId,
          elementWithTargetTypes: selectedTypes,
        };
      } else if (isRelationReversed) {
        paginationOptions = {
          ...paginationOptions,
          toId: entityId,
          toRole: role || null,
          fromTypes: selectedTypes,
        };
      } else {
        paginationOptions = {
          ...paginationOptions,
          fromId: entityId,
          fromRole: role || null,
          toTypes: selectedTypes,
        };
      }
    }
    return (
      <div className={classes.container}>
        {view === 'relationships'
          && this.renderRelationships(paginationOptions)}
        {view === 'entities' && this.renderEntities(paginationOptions)}
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <StixCoreRelationshipCreationFromEntity
            entityId={entityId}
            isRelationReversed={isRelationReversed}
            paddingRight={220}
            targetStixDomainObjectTypes={targetStixDomainObjectTypes}
            allowedRelationshipTypes={relationshipTypes}
            paginationOptions={paginationOptions}
            defaultStartTime={defaultStartTime}
            defaultStopTime={defaultStopTime}
            connectionKey={
              view === 'entities' ? 'Pagination_stixCoreObjects' : undefined
            }
          />
        </Security>
      </div>
    );
  }
}

EntityStixCoreRelationships.propTypes = {
  entityId: PropTypes.string,
  role: PropTypes.string,
  targetStixDomainObjectTypes: PropTypes.array,
  relationshipTypes: PropTypes.array,
  entityLink: PropTypes.string,
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.object,
  exploreLink: PropTypes.string,
  isRelationReversed: PropTypes.bool,
  allDirections: PropTypes.bool,
  noState: PropTypes.bool,
  disableExport: PropTypes.bool,
  handleChangeView: PropTypes.func,
  enableNestedView: PropTypes.func,
  defaultStartTime: PropTypes.string,
  defaultStopTime: PropTypes.string,
};

export default R.compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(EntityStixCoreRelationships);
