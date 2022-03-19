import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { QueryRenderer } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import ListLines from '../../../../components/list_lines/ListLines';
import StixCyberObservableEntitiesLines, {
  stixCyberObservableEntitiesLinesQuery,
} from './StixCyberObservableEntitiesLines';
import StixCoreRelationshipCreationFromEntity from '../../common/stix_core_relationships/StixCoreRelationshipCreationFromEntity';
import Security, { KNOWLEDGE_KNUPDATE } from '../../../../utils/Security';
import SearchInput from '../../../../components/SearchInput';

const styles = () => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: 0,
    padding: '25px 15px 15px 15px',
    borderRadius: 6,
  },
});

class StixCyberObservableKnowledgeEntities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: null,
      orderAsc: false,
      searchTerm: '',
      view: 'lines',
      relationReversed: false,
    };
  }

  handleReverseRelation() {
    this.setState({ relationReversed: !this.state.relationReversed });
  }

  handleSort(field, orderAsc) {
    this.setState({ sortBy: field, orderAsc });
  }

  handleSearch(value) {
    this.setState({ searchTerm: value });
  }

  renderLines(paginationOptions) {
    const { sortBy, orderAsc } = this.state;
    const { entityId } = this.props;
    const dataColumns = {
      relationship_type: {
        label: 'Relation',
        width: '15%',
        isSortable: true,
      },
      entity_type: {
        label: 'Entity type',
        width: '15%',
        isSortable: false,
      },
      name: {
        label: 'Name',
        width: '22%',
        isSortable: false,
      },
      start_time: {
        label: 'First obs.',
        width: '15%',
        isSortable: true,
      },
      stop_time: {
        label: 'Last obs.',
        width: '15%',
        isSortable: true,
      },
      confidence: {
        label: 'Confidence',
        width: '12%',
        isSortable: true,
      },
    };
    return (
      <ListLines
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataColumns={dataColumns}
        handleSort={this.handleSort.bind(this)}
        displayImport={true}
        secondaryAction={true}
      >
        <QueryRenderer
          query={stixCyberObservableEntitiesLinesQuery}
          variables={{ count: 25, ...paginationOptions }}
          render={({ props }) => (
            <StixCyberObservableEntitiesLines
              data={props}
              paginationOptions={paginationOptions}
              dataColumns={dataColumns}
              initialLoading={props === null}
              displayRelation={true}
              entityId={entityId}
            />
          )}
        />
      </ListLines>
    );
  }

  render() {
    const { view, sortBy, orderAsc, searchTerm, relationReversed } = this.state;
    const { classes, t, entityId } = this.props;
    const paginationOptions = {
      elementId: entityId,
      search: searchTerm,
      orderBy: sortBy,
      orderMode: orderAsc ? 'asc' : 'desc',
    };
    return (
      <div style={{ height: '100%' }}>
        <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
          {t('Relations')}
        </Typography>
        <Security
          needs={[KNOWLEDGE_KNUPDATE]}
          placeholder={<div style={{ height: 29 }} />}
        >
          <StixCoreRelationshipCreationFromEntity
            paginationOptions={paginationOptions}
            handleReverseRelation={this.handleReverseRelation.bind(this)}
            entityId={entityId}
            variant="inLine"
            isRelationReversed={relationReversed}
            targetStixDomainObjectTypes={[
              'Threat-Actor',
              'Intrusion-Set',
              'Campaign',
              'Incident',
              'Malware',
              'Tool',
              'Vulnerability',
              'Individual',
              'Organization',
              'Sector',
              'Region',
              'Country',
              'City',
              'Position',
            ]}
            targetStixCyberObservableTypes={['Stix-Cyber-Observable']}
          />
        </Security>
        <div style={{ float: 'right', marginTop: -10 }}>
          <SearchInput
            variant="thin"
            onSubmit={this.handleSearch.bind(this)}
            keyword={searchTerm}
          />
        </div>
        <div className="clearfix" />
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {view === 'lines' ? this.renderLines(paginationOptions) : ''}
        </Paper>
      </div>
    );
  }
}

StixCyberObservableKnowledgeEntities.propTypes = {
  entityId: PropTypes.string,
  relationship_type: PropTypes.string,
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixCyberObservableKnowledgeEntities);
