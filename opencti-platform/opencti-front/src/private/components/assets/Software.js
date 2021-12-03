/* eslint-disable */
/* refactor */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import * as R from 'ramda';
import { QueryRenderer as QR } from 'react-relay';
import QueryRendererDarkLight from '../../../relay/environmentDarkLight';
import { QueryRenderer } from '../../../relay/environment';
import {
  buildViewParamsFromUrlAndStorage,
  convertFilters,
  saveViewParameters,
} from '../../../utils/ListParameters';
import inject18n from '../../../components/i18n';
import CyioListCards from '../../../components/list_cards/CyioListCards';
import CyioListLines from '../../../components/list_lines/CyioListLines';
import SoftwareCards, {
  softwareCardsQuery,
} from './software/SoftwareCards';
import SoftwareLines, {
  softwareLinesQuery,
} from './software/SoftwareLines';
import SoftwareCreation from './software/SoftwareCreation';
import SoftwareDeletion from './software/SoftwareDeletion';
import Security, { KNOWLEDGE_KNUPDATE } from '../../../utils/Security';
import { isUniqFilter } from '../common/lists/Filters';

class Software extends Component {
  constructor(props) {
    super(props);
    const params = buildViewParamsFromUrlAndStorage(
      props.history,
      props.location,
      'view-software',
    );
    this.state = {
      sortBy: R.propOr('name', 'sortBy', params),
      orderAsc: R.propOr(true, 'orderAsc', params),
      searchTerm: R.propOr('', 'searchTerm', params),
      view: R.propOr('cards', 'view', params),
      filters: R.propOr({}, 'filters', params),
      openExports: false,
      numberOfElements: { number: 0, symbol: '' },
      selectedElements: null,
      selectAll: false,
      openSoftwareCreation: false,
    };
  }

  saveView() {
    saveViewParameters(
      this.props.history,
      this.props.location,
      'view-software',
      this.state,
    );
  }

  handleChangeView(mode) {
    this.setState({ view: mode }, () => this.saveView());
  }

  handleSearch(value) {
    this.setState({ searchTerm: value }, () => this.saveView());
  }

  handleSort(field, orderAsc) {
    this.setState({ sortBy: field, orderAsc }, () => this.saveView());
  }

  handleToggleExports() {
    this.setState({ openExports: !this.state.openExports });
  }

  handleToggleSelectAll() {
    this.setState({ selectAll: !this.state.selectAll, selectedElements: null });
  }

  handleSoftwareCreation() {
    this.setState({ openSoftwareCreation: true });
  }

  handleDisplayEdit(selectedElements) {
    const softwareId = Object.entries(selectedElements)[0][1].id;
    this.props.history.push({
      pathname: `/dashboard/assets/software/${softwareId}`,
      openEdit: true,
    });
  }

  handleToggleSelectEntity(entity, event) {
    event.stopPropagation();
    event.preventDefault();
    const { selectedElements } = this.state;
    if (entity.id in (selectedElements || {})) {
      const newSelectedElements = R.omit([entity.id], selectedElements);
      this.setState({
        selectAll: false,
        selectedElements: newSelectedElements,
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

  renderCards(paginationOptions) {
    const {
      sortBy,
      orderAsc,
      selectAll,
      searchTerm,
      filters,
      openExports,
      selectedElements,
      numberOfElements,
    } = this.state;
    let numberOfSelectedElements = Object.keys(selectedElements || {}).length;
    if (selectAll) {
      numberOfSelectedElements = numberOfElements.original;
    }
    const dataColumns = {
      name: {
        label: 'Name',
      },
      created: {
        label: 'Creation date',
      },
      modified: {
        label: 'Modification date',
      },
    };
    return (
      <CyioListCards
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataColumns={dataColumns}
        handleSort={this.handleSort.bind(this)}
        handleSearch={this.handleSearch.bind(this)}
        handleChangeView={this.handleChangeView.bind(this)}
        handleAddFilter={this.handleAddFilter.bind(this)}
        handleRemoveFilter={this.handleRemoveFilter.bind(this)}
        handleToggleExports={this.handleToggleExports.bind(this)}
        handleToggleSelectAll={this.handleToggleSelectAll.bind(this)}
        handleNewCreation={this.handleSoftwareCreation.bind(this)}
        handleDisplayEdit={this.handleDisplayEdit.bind(this)}
        selectedElements={selectedElements}
        selectAll={selectAll}
        OperationsComponent={<SoftwareDeletion />}
        openExports={openExports}
        exportEntityType="Software"
        keyword={searchTerm}
        filters={filters}
        paginationOptions={paginationOptions}
        numberOfElements={numberOfElements}
        availableFilterKeys={[
          'name_m',
          'asset_type_or',
          'created_start_date',
          'created_end_date',
          'vendor_name_or',
          'labelledBy',
        ]}
      >
        {/* <QueryRenderer */}
        <QR
          environment={QueryRendererDarkLight}
          query={softwareCardsQuery}
          variables={{ count: 25, ...paginationOptions }}
          render={({ props }) => (
            <SoftwareCards
              data={props}
              selectAll={selectAll}
              paginationOptions={paginationOptions}
              initialLoading={props === null}
              selectedElements={selectedElements}
              onLabelClick={this.handleAddFilter.bind(this)}
              onToggleEntity={this.handleToggleSelectEntity.bind(this)}
              setNumberOfElements={this.setNumberOfElements.bind(this)}
            />
          )}
        />
      </CyioListCards>
    );
  }

  renderLines(paginationOptions) {
    const {
      sortBy,
      filters,
      orderAsc,
      selectAll,
      searchTerm,
      openExports,
      selectedElements,
      numberOfElements,
      openSoftwareCreation,
    } = this.state;
    let numberOfSelectedElements = Object.keys(selectedElements || {}).length;
    if (selectAll) {
      numberOfSelectedElements = numberOfElements.original;
    }
    const dataColumns = {
      name: {
        label: 'Name',
        width: '10%',
        isSortable: true,
      },
      type: {
        label: 'Type',
        width: '5%',
        isSortable: true,
      },
      assetId: {
        label: 'Asset ID',
        width: '10%',
        isSortable: true,
      },
      vendorName: {
        label: 'Vendor',
        width: '10%',
        isSortable: true,
      },
      version: {
        label: 'Version',
        width: '10%',
        isSortable: true,
      },
      patchLevel: {
        label: 'Patch Level',
        width: '10%',
        isSortable: true,
      },
      cpeId: {
        label: 'CPE ID',
        width: '10%',
        isSortable: true,
      },
      swId: {
        label: 'SWID',
        width: '10%',
        isSortable: true,
      },
      objectLabel: {
        label: 'Labels',
        width: '25%',
        isSortable: false,
      },
    };
    return (
      <CyioListLines
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataColumns={dataColumns}
        handleSort={this.handleSort.bind(this)}
        handleSearch={this.handleSearch.bind(this)}
        handleChangeView={this.handleChangeView.bind(this)}
        handleAddFilter={this.handleAddFilter.bind(this)}
        handleRemoveFilter={this.handleRemoveFilter.bind(this)}
        handleToggleExports={this.handleToggleExports.bind(this)}
        handleToggleSelectAll={this.handleToggleSelectAll.bind(this)}
        handleNewCreation={this.handleSoftwareCreation.bind(this)}
        handleDisplayEdit={this.handleDisplayEdit.bind(this)}
        selectedElements={selectedElements}
        selectAll={selectAll}
        OperationsComponent={<SoftwareDeletion />}
        openExports={openExports}
        exportEntityType="Software"
        keyword={searchTerm}
        filters={filters}
        paginationOptions={paginationOptions}
        numberOfElements={numberOfElements}
        availableFilterKeys={[
          'name_m',
          'asset_type_or',
          'created_start_date',
          'created_end_date',
          'vendor_name_or',
          'labelledBy',
        ]}
      >
        {/* <QueryRenderer */}
        <QR
          environment={QueryRendererDarkLight}
          query={softwareLinesQuery}
          variables={{ count: 25, ...paginationOptions }}
          render={({ props }) => (
            <SoftwareLines
              data={props}
              selectAll={selectAll}
              dataColumns={dataColumns}
              initialLoading={props === null}
              selectedElements={selectedElements}
              paginationOptions={paginationOptions}
              onLabelClick={this.handleAddFilter.bind(this)}
              onToggleEntity={this.handleToggleSelectEntity.bind(this)}
              setNumberOfElements={this.setNumberOfElements.bind(this)}
            />
          )}
        />
      </CyioListLines>
    );
  }

  render() {
    const {
      view,
      sortBy,
      orderAsc,
      searchTerm,
      filters,
      openSoftwareCreation,
    } = this.state;
    const finalFilters = convertFilters(filters);
    const paginationOptions = {
      search: searchTerm,
      orderBy: sortBy,
      orderMode: orderAsc ? 'asc' : 'desc',
      filters: finalFilters,
    };
    const { location } = this.props;
    return (
      <div>
        {view === 'cards' && (!openSoftwareCreation && !location.openNewCreation) ? this.renderCards(paginationOptions) : ''}
        {view === 'lines' && (!openSoftwareCreation && !location.openNewCreation) ? this.renderLines(paginationOptions) : ''}
        {(openSoftwareCreation || location.openNewCreation) && (
          // <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <SoftwareCreation paginationOptions={paginationOptions} history={this.props.history} />
          // </Security>
        )}
      </div>
    );
  }
}

Software.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default R.compose(inject18n, withRouter)(Software);
