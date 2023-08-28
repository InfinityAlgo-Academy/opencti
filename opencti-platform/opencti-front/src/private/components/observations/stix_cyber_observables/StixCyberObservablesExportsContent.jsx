import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose, pathOr } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Slide from '@mui/material/Slide';
import { graphql, createRefetchContainer } from 'react-relay';
import List from '@mui/material/List';
import { interval } from 'rxjs';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import StixCyberObservablesExportCreation from './StixCyberObservablesExportCreation';
import { FIVE_SECONDS } from '../../../../utils/Time';
import FileLine from '../../common/files/FileLine';
import inject18n from '../../../../components/i18n';
import Security from '../../../../utils/Security';
import { KNOWLEDGE_KNGETEXPORT_KNASKEXPORT } from '../../../../utils/hooks/useGranted';

const interval$ = interval(FIVE_SECONDS);

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = (theme) => ({
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
  },
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
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
    const { classes, t, data, paginationOptions, handleToggle, context } = this.props;
    const stixCyberObservablesExportFiles = pathOr(
      [],
      ['stixCyberObservablesExportFiles', 'edges'],
      data,
    );
    return (
      <div>
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleToggle.bind(this)}
            size="large"
            color="primary"
          >
            <Close fontSize="small" color="primary" />
          </IconButton>
          <Typography variant="h6">{t('Exports list')}</Typography>
        </div>
        <List>
          {stixCyberObservablesExportFiles.length > 0 ? (
            stixCyberObservablesExportFiles.map((file) => file?.node && (
              <FileLine
                key={file.node.id}
                file={file.node}
                dense={true}
                disableImport={true}
                directDownload={true}
              />
            ))
          ) : (
            <div style={{ display: 'table', height: '100%', width: '100%' }}>
              <span
                style={{
                  display: 'table-cell',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                }}
              >
                {t('No file for the moment')}
              </span>
            </div>
          )}
        </List>
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
      </div>
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
        context: { type: "String" }
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
