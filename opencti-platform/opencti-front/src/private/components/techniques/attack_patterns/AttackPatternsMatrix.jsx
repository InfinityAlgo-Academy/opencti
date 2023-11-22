import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withRouter } from 'react-router-dom';
import withStyles from '@mui/styles/withStyles';
import { QueryRenderer } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import AttackPatternsMatrixColumns, { attackPatternsMatrixColumnsQuery } from './AttackPatternsMatrixColumns';

const styles = () => ({
  container: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
  },
});

class AttackPatternsMatrix extends Component {
  render() {
    const {
      classes,
      attackPatterns,
      marginRight,
      searchTerm,
      handleChangeKillChain,
      handleToggleModeOnlyActive,
      handleToggleColorsReversed,
      currentKillChain,
      currentColorsReversed,
      currentModeOnlyActive,
      hideBar,
      handleAdd,
      tabMode,
    } = this.props;
    return (
      <div className={classes.container}>
        <QueryRenderer
          query={attackPatternsMatrixColumnsQuery}
          variables={{
            count: 5000,
            filters: {
              mode: 'and',
              filters: [{ key: 'revoked', values: ['false'] }],
              filterGroups: [],
            },
          }}
          render={({ props }) => {
            if (props) {
              return (
                <AttackPatternsMatrixColumns
                  data={props}
                  attackPatterns={attackPatterns}
                  marginRight={marginRight}
                  searchTerm={searchTerm ?? ''}
                  handleChangeKillChain={handleChangeKillChain}
                  handleToggleModeOnlyActive={handleToggleModeOnlyActive}
                  handleToggleColorsReversed={handleToggleColorsReversed}
                  currentKillChain={currentKillChain}
                  currentColorsReversed={currentColorsReversed}
                  currentModeOnlyActive={currentModeOnlyActive}
                  hideBar={hideBar}
                  handleAdd={handleAdd}
                  tabMode={tabMode}
                />
              );
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

AttackPatternsMatrix.propTypes = {
  t: PropTypes.func,
  marginRight: PropTypes.bool,
  history: PropTypes.object,
  location: PropTypes.object,
  classes: PropTypes.object,
  attackPatterns: PropTypes.array,
  searchTerm: PropTypes.string,
  handleChangeKillChain: PropTypes.func,
  handleToggleModeOnlyActive: PropTypes.func,
  handleToggleColorsReversed: PropTypes.func,
  currentKillChain: PropTypes.bool,
  currentColorsReversed: PropTypes.bool,
  currentModeOnlyActive: PropTypes.bool,
  hideBar: PropTypes.bool,
  handleAdd: PropTypes.func,
  tabMode: PropTypes.bool,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(AttackPatternsMatrix);
