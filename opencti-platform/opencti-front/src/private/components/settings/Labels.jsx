import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose, propOr } from 'ramda';
import { withRouter } from 'react-router-dom';
import withStyles from '@mui/styles/withStyles';
import * as R from 'ramda';
import { QueryRenderer } from '../../../relay/environment';
import {
  buildViewParamsFromUrlAndStorage,
  saveViewParameters,
} from '../../../utils/ListParameters';
import inject18n from '../../../components/i18n';
import ListLines from '../../../components/list_lines/ListLines';
import LabelsLines, { labelsLinesQuery } from './labels/LabelsLines';
import LabelCreation from './labels/LabelCreation';
import LabelsVocabulariesMenu from './LabelsVocabulariesMenu';
import ToolBar from '../data/ToolBar';
import { filtersWithEntityType } from '../../../utils/filters/filtersUtils';

const styles = () => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
  },
});

const LOCAL_STORAGE_KEY = 'Labels';

class Labels extends Component {
  constructor(props) {
    super(props);
    const params = buildViewParamsFromUrlAndStorage(
      props.history,
      props.location,
      LOCAL_STORAGE_KEY,
    );
    this.state = {
      sortBy: propOr('value', 'sortBy', params),
      orderAsc: propOr(true, 'orderAsc', params),
      searchTerm: propOr('', 'searchTerm', params),
      view: propOr('lines', 'view', params),
      numberOfElements: { number: 0, symbol: '' },
      selectedElements: null,
      deSelectedElements: null,
      selectAll: false,
    };
  }

  saveView() {
    saveViewParameters(
      this.props.history,
      this.props.location,
      LOCAL_STORAGE_KEY,
      this.state,
    );
  }

  handleSearch(value) {
    this.setState({ searchTerm: value }, () => this.saveView());
  }

  handleSort(field, orderAsc) {
    this.setState({ sortBy: field, orderAsc }, () => this.saveView());
  }

  handleToggleSelectEntity(entity, _, forceRemove = []) {
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

  setNumberOfElements(numberOfElements) {
    this.setState({ numberOfElements });
  }

  renderLines(paginationOptions) {
    const {
      sortBy,
      orderAsc,
      searchTerm,
      numberOfElements,
      selectedElements,
      deSelectedElements,
      selectAll,
    } = this.state;
    let numberOfSelectedElements = Object.keys(selectedElements || {}).length;
    if (selectAll) {
      numberOfSelectedElements = numberOfElements.original
        - Object.keys(deSelectedElements || {}).length;
    }
    const finalFilters = filtersWithEntityType(undefined, 'Label');
    const dataColumns = {
      value: {
        label: 'Value',
        width: '50%',
        isSortable: true,
      },
      color: {
        label: 'Color',
        width: '15%',
        isSortable: true,
      },
      created_at: {
        label: 'Creation date',
        width: '15%',
        isSortable: true,
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
          handleToggleSelectAll={this.handleToggleSelectAll.bind(this)}
          selectAll={selectAll}
          numberOfElements={numberOfElements}
          iconExtension={true}
          displayImport={false}
          secondaryAction={true}
          keyword={searchTerm}
        >
          <QueryRenderer
            query={labelsLinesQuery}
            variables={{ count: 25, ...paginationOptions }}
            render={({ props }) => (
              <LabelsLines
                data={props}
                paginationOptions={paginationOptions}
                dataColumns={dataColumns}
                initialLoading={props === null}
                selectedElements={selectedElements}
                deSelectedElements={deSelectedElements}
                onToggleEntity={this.handleToggleSelectEntity.bind(this)}
                selectAll={selectAll}
                setNumberOfElements={this.setNumberOfElements.bind(this)}
              />
            )}
          />
        </ListLines>
        <ToolBar
          selectedElements={selectedElements}
          deSelectedElements={deSelectedElements}
          numberOfSelectedElements={numberOfSelectedElements}
          selectAll={selectAll}
          filters={finalFilters}
          search={searchTerm}
          handleClearSelectedElements={this.handleClearSelectedElements.bind(
            this,
          )}
          type="Label"
          variant="medium"
        />
      </div>
    );
  }

  render() {
    const { classes } = this.props;
    const { view, sortBy, orderAsc, searchTerm } = this.state;
    const paginationOptions = {
      search: searchTerm,
      orderBy: sortBy,
      orderMode: orderAsc ? 'asc' : 'desc',
    };
    return (
      <div className={classes.container}>
        <LabelsVocabulariesMenu />
        {view === 'lines' ? this.renderLines(paginationOptions) : ''}
        <LabelCreation paginationOptions={paginationOptions} />
      </div>
    );
  }
}

Labels.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default compose(inject18n, withRouter, withStyles(styles))(Labels);
