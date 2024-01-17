import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose, propOr } from 'ramda';
import { withRouter } from 'react-router-dom';
import withStyles from '@mui/styles/withStyles';
import { QueryRenderer } from '../../../relay/environment';
import { buildViewParamsFromUrlAndStorage, saveViewParameters } from '../../../utils/ListParameters';
import inject18n from '../../../components/i18n';
import NarrativesLines, { narrativesLinesQuery } from './narratives/NarrativesLines';
import NarrativeCreation from './narratives/NarrativeCreation';
import SearchInput from '../../../components/SearchInput';
import Security from '../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../utils/hooks/useGranted';
import BreadcrumbHeader from '../../../components/BreadcrumbHeader';

const LOCAL_STORAGE_KEY = 'narratives';

const styles = (theme) => ({
  parameters: {
    float: 'left',
    marginTop: -10,
  },
  header: {
    paddingBottom: 25,
    color: theme.palette.mode === 'light'
      ? theme.palette.common.black
      : theme.palette.primary.main,
    fontSize: '24px',
    fontWeight: 'bold',
  },
});

class Narratives extends Component {
  constructor(props) {
    super(props);
    const params = buildViewParamsFromUrlAndStorage(
      props.history,
      props.location,
      LOCAL_STORAGE_KEY,
    );
    this.state = {
      searchTerm: propOr('', 'searchTerm', params),
      openExports: false,
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

  handleToggleExports() {
    this.setState({ openExports: !this.state.openExports });
  }

  render() {
    const { searchTerm } = this.state;
    const { classes, t } = this.props;
    return (
      <div>
        <BreadcrumbHeader
          path={[
            { text: t('Techniques') },
            { text: t('Narratives') },
          ]}
        >
          <div className={ classes.header }>{t('Narratives')}</div>
        </BreadcrumbHeader>
        <div className={classes.parameters}>
          <div style={{ float: 'left', marginRight: 20 }}>
            <SearchInput
              variant="small"
              onSubmit={this.handleSearch.bind(this)}
              keyword={searchTerm}
            />
          </div>
        </div>
        <div className="clearfix" />
        <QueryRenderer
          query={narrativesLinesQuery}
          variables={{ count: 500 }}
          render={({ props }) => (
            <NarrativesLines data={props} keyword={searchTerm} />
          )}
        />
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <NarrativeCreation />
        </Security>
      </div>
    );
  }
}

Narratives.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.object,
  classes: PropTypes.object,
};

export default compose(inject18n, withRouter, withStyles(styles))(Narratives);
