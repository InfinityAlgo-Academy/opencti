import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import * as R from 'ramda';
import { QueryRenderer } from '../../../relay/environment';
import {
  buildViewParamsFromUrlAndStorage,
  convertFilters,
  saveViewParameters,
} from '../../../utils/ListParameters';
import ListLines from '../../../components/list_lines/ListLines';
import NotesLines, { notesLinesQuery } from './notes/NotesLines';
import inject18n from '../../../components/i18n';
import NoteCreation from './notes/NoteCreation';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNPARTICIPATE, KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import { UserContext } from '../../../utils/hooks/useAuth';
import { isUniqFilter } from '../../../utils/filters/filtersUtils';

class Notes extends Component {
  constructor(props) {
    super(props);
    const params = buildViewParamsFromUrlAndStorage(
      props.history,
      props.location,
      `view-notes${props.objectId ? `-${props.objectId}` : ''}`,
    );
    this.state = {
      sortBy: R.propOr('created', 'sortBy', params),
      orderAsc: R.propOr(false, 'orderAsc', params),
      searchTerm: R.propOr('', 'searchTerm', params),
      view: R.propOr('lines', 'view', params),
      filters: R.propOr({}, 'filters', params),
      openExports: false,
      numberOfElements: { number: 0, symbol: '' },
    };
  }

  saveView() {
    saveViewParameters(
      this.props.history,
      this.props.location,
      `view-notes${this.props.objectId ? `-${this.props.objectId}` : ''}`,
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
    this.setState({ openExports: !this.state.openExports }, () => {
      if (typeof this.props.onChangeOpenExports === 'function') {
        this.props.onChangeOpenExports(this.state.openExports);
      }
    });
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

  renderLines(paginationOptions, helper) {
    const {
      sortBy,
      orderAsc,
      searchTerm,
      filters,
      openExports,
      numberOfElements,
    } = this.state;
    const { objectId, authorId } = this.props;
    let exportContext = null;
    if (objectId) {
      exportContext = `of-entity-${objectId}`;
    } else if (authorId) {
      exportContext = `of-entity-${authorId}`;
    }
    const isRuntimeSort = helper.isRuntimeFieldEnable();
    const dataColumns = {
      attribute_abstract: {
        label: 'Abstract',
        width: '40%',
        isSortable: true,
      },
      createdBy: {
        label: 'Author',
        width: '15%',
        isSortable: isRuntimeSort,
      },
      objectLabel: {
        label: 'Labels',
        width: '20%',
        isSortable: false,
      },
      created: {
        label: 'Date',
        width: '10%',
        isSortable: true,
      },
      objectMarking: {
        label: 'Marking',
        width: '15%',
        isSortable: isRuntimeSort,
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
        handleToggleExports={this.handleToggleExports.bind(this)}
        openExports={openExports}
        noPadding={typeof this.props.onChangeOpenExports === 'function'}
        exportEntityType="Note"
        exportContext={exportContext}
        keyword={searchTerm}
        filters={filters}
        paginationOptions={paginationOptions}
        numberOfElements={numberOfElements}
        availableFilterKeys={[
          'labelledBy',
          'createdBy',
          'markedBy',
          'created_start_date',
          'created_end_date',
        ]}
      >
        <QueryRenderer
          query={notesLinesQuery}
          variables={{ count: 25, ...paginationOptions }}
          render={({ props }) => (
            <NotesLines
              data={props}
              paginationOptions={paginationOptions}
              dataColumns={dataColumns}
              initialLoading={props === null}
              onLabelClick={this.handleAddFilter.bind(this)}
              setNumberOfElements={this.setNumberOfElements.bind(this)}
            />
          )}
        />
      </ListLines>
    );
  }

  render() {
    const {
      match: {
        params: { noteType },
      },
      objectId,
      authorId,
    } = this.props;
    const { view, sortBy, orderAsc, searchTerm, filters } = this.state;
    const noteFilterClass = noteType !== 'all' && noteType !== undefined
      ? noteType.replace(/_/g, ' ')
      : '';
    const finalFilters = convertFilters(filters);
    if (noteFilterClass) {
      finalFilters.push({
        key: 'note_types',
        values: [noteFilterClass],
      });
    }
    if (authorId) finalFilters.push({ key: 'createdBy', values: [authorId] });
    if (objectId) finalFilters.push({ key: 'objectContains', values: [objectId] });
    const paginationOptions = {
      filters: finalFilters,
      search: searchTerm,
      orderBy: sortBy,
      orderMode: orderAsc ? 'asc' : 'desc',
    };
    return (
      <UserContext.Consumer>
        {({ helper }) => (
          <div>
            {view === 'lines' ? this.renderLines(paginationOptions, helper) : ''}
            <Security needs={[KNOWLEDGE_KNUPDATE, KNOWLEDGE_KNPARTICIPATE]}>
              <NoteCreation paginationOptions={paginationOptions} />
            </Security>
          </div>
        )}
      </UserContext.Consumer>
    );
  }
}

Notes.propTypes = {
  objectId: PropTypes.string,
  authorId: PropTypes.string,
  t: PropTypes.func,
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  onChangeOpenExports: PropTypes.func,
};

export default R.compose(inject18n, withRouter)(Notes);
