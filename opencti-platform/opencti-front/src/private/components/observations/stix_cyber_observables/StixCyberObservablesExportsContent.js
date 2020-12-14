import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose, pathOr } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import { createRefetchContainer } from 'react-relay';
import List from '@material-ui/core/List';
import { interval } from 'rxjs';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import { Close } from '@material-ui/icons';
import StixCyberObservablesExportCreation from './StixCyberObservablesExportCreation';
import { FIVE_SECONDS } from '../../../../utils/Time';
import FileLine from '../../common/files/FileLine';
import inject18n from '../../../../components/i18n';
import Security, {
  KNOWLEDGE_KNGETEXPORT_KNASKEXPORT,
} from '../../../../utils/Security';

const interval$ = interval(FIVE_SECONDS);

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: 310,
    padding: '0 0 20px 0',
    overflowX: 'hidden',
    zIndex: 0,
    backgroundColor: theme.palette.navAlt.background,
  },
  buttonClose: {
    float: 'right',
    margin: '2px -16px 0 0',
  },
  listIcon: {
    marginRight: 0,
  },
  item: {
    padding: '0 0 0 10px',
  },
  itemField: {
    padding: '0 15px 0 15px',
  },
  toolbar: theme.mixins.toolbar,
});

class StixCyberObservablesExportsContentComponent extends Component {
  componentDidMount() {
    this.subscription = interval$.subscribe(() => {
      if (this.props.isOpen) {
        this.props.relay.refetch({
          count: 25,
        });
      }
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const {
      classes,
      t,
      data,
      paginationOptions,
      handleToggle,
      context,
    } = this.props;
    const stixCyberObservablesExportFiles = pathOr(
      [],
      ['stixCyberObservablesExportFiles', 'edges'],
      data,
    );
    return (
      <List
        subheader={
          <ListSubheader component="div">
            <div style={{ float: 'left' }}>{t('Exports list')}</div>
            <Security needs={[KNOWLEDGE_KNGETEXPORT_KNASKEXPORT]}>
              <StixCyberObservablesExportCreation
                data={data}
                paginationOptions={paginationOptions}
                context={context}
                onExportAsk={() => this.props.relay.refetch({
                  count: 25,
                })
                }
              />
            </Security>
            <IconButton
              color="inherit"
              classes={{ root: classes.buttonClose }}
              onClick={handleToggle.bind(this)}
            >
              <Close />
            </IconButton>
            <div className="clearfix" />
          </ListSubheader>
        }
      >
        {stixCyberObservablesExportFiles.length > 0 ? (
          stixCyberObservablesExportFiles.map((file) => (
            <FileLine
              key={file.node.id}
              file={file.node}
              dense={true}
              disableImport={true}
              directDownload={true}
            />
          ))
        ) : (
          <div style={{ paddingLeft: 16 }}>{t('No file for the moment')}</div>
        )}
      </List>
    );
  }
}

export const stixCyberObservablesExportsContentQuery = graphql`
  query StixCyberObservablesExportsContentRefetchQuery(
    $count: Int!
    $context: String
  ) {
    ...StixCyberObservablesExportsContent_data
      @arguments(count: $count, context: $context)
  }
`;

const StixCyberObservablesExportsContent = createRefetchContainer(
  StixCyberObservablesExportsContentComponent,
  {
    data: graphql`
      fragment StixCyberObservablesExportsContent_data on Query
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 25 }
        context: { type: "String!" }
      ) {
        stixCyberObservablesExportFiles(first: $count, context: $context)
          @connection(key: "Pagination_stixCyberObservablesExportFiles") {
          edges {
            node {
              id
              ...FileLine_file
            }
          }
        }
        ...StixCyberObservablesExportCreation_data
      }
    `,
  },
  stixCyberObservablesExportsContentQuery,
);

StixCyberObservablesExportsContent.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func,
  handleToggle: PropTypes.func,
  data: PropTypes.object,
  paginationOptions: PropTypes.object,
  handleApplyListArgs: PropTypes.func,
  isOpen: PropTypes.bool,
  context: PropTypes.string,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixCyberObservablesExportsContent);
