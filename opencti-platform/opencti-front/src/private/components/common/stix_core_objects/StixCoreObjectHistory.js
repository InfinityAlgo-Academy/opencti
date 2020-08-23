import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core';
import inject18n from '../../../../components/i18n';
import StixCoreObjectHistoryLines, {
  stixCoreObjectHistoryLinesQuery,
} from './StixCoreObjectHistoryLines';
import { QueryRenderer } from '../../../../relay/environment';
import SearchInput from '../../../../components/SearchInput';

const styles = () => ({
  container: {
    margin: 0,
  },
  gridContainer: {
    marginBottom: 20,
  },
});

class StixCoreObjectHistory extends Component {
  constructor(props) {
    super(props);
    this.state = { entitySearchTerm: '', relationsSearchTerm: '' };
  }

  handleSearchEntity(value) {
    this.setState({ entitySearchTerm: value });
  }

  handleSearchRelations(value) {
    this.setState({ relationsSearchTerm: value });
  }

  render() {
    const { classes, t, entityStandardId } = this.props;
    const { entitySearchTerm, relationsSearchTerm } = this.state;
    return (
      <Grid
        container={true}
        spacing={3}
        classes={{ container: classes.gridContainer }}
      >
        <Grid item={true} xs={6}>
          <Typography
            variant="h4"
            gutterBottom={true}
            style={{ float: 'left', marginTop: 12 }}
          >
            {t('Entity')}
          </Typography>
          <div style={{ float: 'right' }}>
            <SearchInput
              variant="small"
              onSubmit={this.handleSearchEntity.bind(this)}
              keyword={entitySearchTerm}
            />
          </div>
          <div className="clearfix" />
          <QueryRenderer
            query={stixCoreObjectHistoryLinesQuery}
            variables={{
              filters: [
                { key: 'entity_id', values: [entityStandardId] },
                {
                  key: 'event_type',
                  values: ['create', 'update', 'update_add', 'update_remove'],
                },
              ],
              first: 200,
              orderBy: 'event_date',
              orderMode: 'desc',
              search: entitySearchTerm,
            }}
            render={({ props }) => {
              if (props) {
                return (
                  <StixCoreObjectHistoryLines
                    entityStandardId={entityStandardId}
                    data={props}
                    isRelationLog={false}
                  />
                );
              }
              return <div />;
            }}
          />
        </Grid>
        <Grid item={true} xs={6}>
          <Typography
            variant="h4"
            gutterBottom={true}
            style={{ float: 'left', marginTop: 10 }}
          >
            {t('Relations of the entity')}
          </Typography>
          <div style={{ float: 'right' }}>
            <SearchInput
              variant="small"
              onSubmit={this.handleSearchRelations.bind(this)}
              keyword={entitySearchTerm}
            />
          </div>
          <div className="clearfix" />
          <QueryRenderer
            query={stixCoreObjectHistoryLinesQuery}
            variables={{
              filters: [
                {
                  key: 'connection_id',
                  values: [entityStandardId],
                  operator: 'wildcard',
                },
                {
                  key: 'event_type',
                  values: ['create', 'delete'],
                },
              ],
              first: 200,
              orderBy: 'event_date',
              orderMode: 'desc',
              search: relationsSearchTerm,
            }}
            render={({ props }) => {
              if (props) {
                return (
                  <StixCoreObjectHistoryLines
                    entityStandardId={entityStandardId}
                    data={props}
                    isRelationLog={true}
                  />
                );
              }
              return <div />;
            }}
          />
        </Grid>
      </Grid>
    );
  }
}

StixCoreObjectHistory.propTypes = {
  t: PropTypes.func,
  entityStandardId: PropTypes.string,
};

export default compose(inject18n, withStyles(styles))(StixCoreObjectHistory);
