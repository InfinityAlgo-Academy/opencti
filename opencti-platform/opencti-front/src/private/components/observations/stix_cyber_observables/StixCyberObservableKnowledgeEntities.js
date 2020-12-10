import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { QueryRenderer } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import ListLines from '../../../../components/list_lines/ListLines';
import StixCyberObservableEntitiesLines, {
  stixCyberObservableEntitiesLinesQuery,
} from './StixCyberObservableEntitiesLines';
import StixCoreRelationshipCreationFromEntity from '../../common/stix_core_relationships/StixCoreRelationshipCreationFromEntity';

const styles = (theme) => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: 0,
    padding: '25px 15px 15px 15px',
    borderRadius: 6,
  },
  bottomNav: {
    zIndex: 1000,
    padding: '10px 200px 10px 205px',
    backgroundColor: theme.palette.navBottom.background,
    display: 'flex',
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
    };
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
        handleSearch={this.handleSearch.bind(this)}
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
    const {
      view, sortBy, orderAsc, searchTerm,
    } = this.state;
    const {
      classes,
      t,
      entityId,
      relationship_type: relationshipType,
    } = this.props;
    const paginationOptions = {
      fromId: entityId,
      relationship_type: relationshipType,
      search: searchTerm,
      orderBy: sortBy,
      orderMode: orderAsc ? 'asc' : 'desc',
    };
    return (
      <div style={{ height: '100%' }}>
        <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
          {t('Relations')}
        </Typography>
        <StixCoreRelationshipCreationFromEntity
          paginationOptions={paginationOptions}
          entityId={entityId}
          variant="inLine"
          isRelationReversed={false}
          paddingRight={true}
          targetStixDomainObjectTypes={[
            'Region',
            'Country',
            'City',
            'Position',
            'Organization',
            'Individual',
          ]}
        />
        <div className="clearfix" />
        <Paper classes={{ root: classes.paper }} elevation={2}>
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
