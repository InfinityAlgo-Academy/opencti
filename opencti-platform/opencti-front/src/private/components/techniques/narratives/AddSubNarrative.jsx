import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import IconButton from '@mui/material/IconButton';
import { Add } from '@mui/icons-material';
import Drawer from '../../common/drawer/Drawer';
import inject18n from '../../../../components/i18n';
import SearchInput from '../../../../components/SearchInput';
import { QueryRenderer } from '../../../../relay/environment';
import AddSubNarrativesLines, { addSubNarrativesLinesQuery } from './AddSubNarrativesLines';
import NarrativeCreation from './NarrativeCreation';

const styles = () => ({
  createButton: {
    float: 'left',
    marginTop: -15,
  },
  search: {
    marginLeft: 'auto',
    marginRight: ' 20px',
  },
});

class AddSubNarrative extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, search: '' };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false, search: '' });
  }

  handleSearch(keyword) {
    this.setState({ search: keyword });
  }

  render() {
    const { t, classes, narrative, narrativeSubNarratives } = this.props;
    const paginationOptions = {
      search: this.state.search,
    };
    return (
      <div>
        <IconButton
          color="secondary"
          aria-label="Add"
          onClick={this.handleOpen.bind(this)}
          classes={{ root: classes.createButton }}
          size="large"
        >
          <Add fontSize="small" />
        </IconButton>
        <Drawer
          open={this.state.open}
          onClose={this.handleClose.bind(this)}
          title={t('Add subnarratives')}
          header={(
            <div className={classes.search}>
              <SearchInput
                variant="inDrawer"
                placeholder={`${t('Search')}...`}
                onSubmit={this.handleSearch.bind(this)}
              />
            </div>
          )}
        >
          <>
            <QueryRenderer
              query={addSubNarrativesLinesQuery}
              variables={{
                search: this.state.search,
                count: 20,
              }}
              render={({ props }) => {
                return (
                  <AddSubNarrativesLines
                    narrative={narrative}
                    narrativeSubNarratives={narrativeSubNarratives}
                    data={props}
                  />
                );
              }}
            />
            <NarrativeCreation
              display={this.state.open}
              contextual={true}
              inputValue={this.state.search}
              paginationOptions={paginationOptions}
            />
          </>
        </Drawer>
      </div>
    );
  }
}

AddSubNarrative.propTypes = {
  narrative: PropTypes.object,
  narrativeSubNarratives: PropTypes.array,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export default compose(inject18n, withStyles(styles))(AddSubNarrative);
