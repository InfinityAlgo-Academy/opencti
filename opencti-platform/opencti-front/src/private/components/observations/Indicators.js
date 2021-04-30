import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core';
import * as R from 'ramda';
import { QueryRenderer } from '../../../relay/environment';
import {
  buildViewParamsFromUrlAndStorage,
  convertFilters,
  saveViewParameters,
} from '../../../utils/ListParameters';
import inject18n from '../../../components/i18n';
import ListLines from '../../../components/list_lines/ListLines';
import IndicatorsLines, {
  indicatorsLinesQuery,
} from './indicators/IndicatorsLines';
import IndicatorCreation from './indicators/IndicatorCreation';
import IndicatorsRightBar from './indicators/IndicatorsRightBar';
import Security, { KNOWLEDGE_KNUPDATE } from '../../../utils/Security';
import ToolBar from '../data/ToolBar';

const styles = () => ({
  container: {
    paddingRight: 250,
  },
});

class Indicators extends Component {
  constructor(props) {
    super(props);
    const params = buildViewParamsFromUrlAndStorage(
      props.history,
      props.location,
      'view-indicators',
    );
    this.state = {
      sortBy: R.propOr('created', 'sortBy', params),
      orderAsc: R.propOr(false, 'orderAsc', params),
      searchTerm: R.propOr('', 'searchTerm', params),
      view: R.propOr('lines', 'view', params),
      indicatorTypes: R.propOr([], 'indicatorTypes', params),
      observableTypes: R.propOr([], 'observableTypes', params),
      filters: R.propOr({}, 'filters', params),
      openExports: false,
      numberOfElements: { number: 0, symbol: '' },
      selectedElements: null,
      selectAll: false,
    };
  }

  saveView() {
    saveViewParameters(
      this.props.history,
      this.props.location,
      'view-indicators',
      this.state,
    );
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

  handleToggleIndicatorType(type) {
    if (this.state.indicatorTypes.includes(type)) {
      this.setState(
        {
          indicatorTypes: R.filter(
            (t) => t !== type,
            this.state.indicatorTypes,
          ),
        },
        () => this.saveView(),
      );
    } else {
      this.setState(
        {
          indicatorTypes: R.append(type, this.state.indicatorTypes),
        },
        () => this.saveView(),
      );
    }
  }

  handleToggleObservableType(type) {
    if (this.state.observableTypes.includes(type)) {
      this.setState(
        {
          observableTypes: R.filter(
            (t) => t !== type,
            this.state.observableTypes,
          ),
        },
        () => this.saveView(),
      );
    } else {
      this.setState(
        {
          observableTypes: R.append(type, this.state.observableTypes),
        },
        () => this.saveView(),
      );
    }
  }

  handleClearObservableTypes() {
    this.setState({ observableTypes: [] }, () => this.saveView());
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

  handleToggleSelectAll() {
    this.setState({ selectAll: !this.state.selectAll, selectedElements: null });
  }

  handleClearSelectedElements() {
    this.setState({ selectAll: false, selectedElements: null });
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
            R.uniqBy(R.prop('id'), [{ id, value }, ...this.state.filters[key]]),
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

  renderLines(paginationOptions) {
    const {
      sortBy,
      orderAsc,
      searchTerm,
      filters,
      openExports,
      numberOfElements,
      selectedElements,
      selectAll,
      indicatorTypes,
      observableTypes,
    } = this.state;
    let numberOfSelectedElements = Object.keys(selectedElements || {}).length;
    if (selectAll) {
      numberOfSelectedElements = numberOfElements.original;
    }
    let finalFilters = filters;
    finalFilters = R.assoc(
      'entity_type',
      [{ id: 'Indicator', value: 'Indicator' }],
      finalFilters,
    );
    if (indicatorTypes.length) {
      finalFilters = R.assoc(
        'pattern_type',
        R.map((n) => ({ id: n, value: n }), indicatorTypes),
        finalFilters,
      );
    }
    if (observableTypes.length) {
      finalFilters = R.assoc(
        'x_opencti_main_observable_type',
        R.map((n) => ({ id: n, value: n }), observableTypes),
        finalFilters,
      );
    }
    const dataColumns = {
      pattern_type: {
        label: 'Pattern type',
        width: '10%',
        isSortable: true,
      },
      name: {
        label: 'Name',
        width: '25%',
        isSortable: true,
      },
      objectLabel: {
        label: 'Labels',
        width: '20%',
        isSortable: false,
      },
      created: {
        label: 'Creation date',
        width: '18%',
        isSortable: true,
      },
      valid_until: {
        label: 'Valid until',
        width: '13%',
        isSortable: true,
      },
      objectMarking: {
        label: 'Marking',
        isSortable: false,
      },
    };
    return (
      <div>
        <ListLines
          sortBy={sortBy}
          orderAsc={orderAsc}
          dataColumns={dataColumns}
          handleSort={this.handleSort.bind(this)}
          handleSearch={this.handleSearch.bind(this)}
          handleAddFilter={this.handleAddFilter.bind(this)}
          handleRemoveFilter={this.handleRemoveFilter.bind(this)}
          handleToggleExports={this.handleToggleExports.bind(this)}
          openExports={openExports}
          handleToggleSelectAll={this.handleToggleSelectAll.bind(this)}
          selectAll={selectAll}
          exportEntityType="Indicator"
          exportContext={null}
          iconExtension={true}
          keyword={searchTerm}
          filters={filters}
          paginationOptions={paginationOptions}
          numberOfElements={numberOfElements}
          availableFilterKeys={[
            'labelledBy',
            'markedBy',
            'created_start_date',
            'created_end_date',
            'valid_from_start_date',
            'valid_until_end_date',
            'x_opencti_score_gt',
            'x_opencti_score_lte',
            'createdBy',
            'x_opencti_detection',
          ]}
        >
          <QueryRenderer
            query={indicatorsLinesQuery}
            variables={{ count: 25, ...paginationOptions }}
            render={({ props }) => (
              <IndicatorsLines
                data={props}
                paginationOptions={paginationOptions}
                dataColumns={dataColumns}
                initialLoading={props === null}
                onLabelClick={this.handleAddFilter.bind(this)}
                selectedElements={selectedElements}
                onToggleEntity={this.handleToggleSelectEntity.bind(this)}
                selectAll={selectAll}
                setNumberOfElements={this.setNumberOfElements.bind(this)}
              />
            )}
          />
        </ListLines>
        <ToolBar
          selectedElements={selectedElements}
          numberOfSelectedElements={numberOfSelectedElements}
          selectAll={selectAll}
          filters={finalFilters}
          handleClearSelectedElements={this.handleClearSelectedElements.bind(
            this,
          )}
          withPaddingRight={true}
        />
      </div>
    );
  }

  render() {
    const { classes } = this.props;
    const {
      view,
      sortBy,
      orderAsc,
      searchTerm,
      filters,
      indicatorTypes,
      observableTypes,
      openExports,
    } = this.state;
    let finalFilters = convertFilters(filters);
    if (indicatorTypes.length > 0) {
      finalFilters = R.append(
        { key: 'pattern_type', values: indicatorTypes, operator: 'match' },
        finalFilters,
      );
    }
    if (observableTypes.length > 0) {
      finalFilters = R.append(
        {
          key: 'x_opencti_main_observable_type',
          values: observableTypes,
          operator: 'match',
        },
        finalFilters,
      );
    }
    const paginationOptions = {
      filters: finalFilters,
      search: searchTerm,
      orderBy: sortBy,
      orderMode: orderAsc ? 'asc' : 'desc',
    };
    return (
      <div className={classes.container}>
        {view === 'lines' ? this.renderLines(paginationOptions) : ''}
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <IndicatorCreation
            paginationOptions={paginationOptions}
            openExports={openExports}
          />
        </Security>
        <IndicatorsRightBar
          indicatorTypes={indicatorTypes}
          observableTypes={observableTypes}
          handleToggleIndicatorType={this.handleToggleIndicatorType.bind(this)}
          handleToggleObservableType={this.handleToggleObservableType.bind(
            this,
          )}
          handleClearObservableTypes={this.handleClearObservableTypes.bind(
            this,
          )}
          openExports={openExports}
        />
      </div>
    );
  }
}

Indicators.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default R.compose(inject18n, withRouter, withStyles(styles))(Indicators);
