import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  compose,
  filter,
  flatten,
  fromPairs,
  includes,
  map,
  propOr,
  uniq,
  zip,
} from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import { Add } from '@mui/icons-material';
import { graphql, createFragmentContainer } from 'react-relay';
import { Form, Formik, Field } from 'formik';
import MenuItem from '@mui/material/MenuItem';
import * as Yup from 'yup';
import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';
import inject18n from '../../../../components/i18n';
import {
  commitMutation,
  MESSAGING$,
  QueryRenderer,
} from '../../../../relay/environment';
import { markingDefinitionsLinesSearchQuery } from '../../settings/marking_definitions/MarkingDefinitionsLines';
import SelectField from '../../../../components/SelectField';
import Loader from '../../../../components/Loader';
import { ExportContext } from '../../../../utils/ExportContextProvider';
import { fieldSpacingContainerStyle } from '../../../../utils/field';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
    zIndex: 2000,
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
});

export const StixCyberObservablesExportCreationMutation = graphql`
  mutation StixCyberObservablesExportCreationMutation(
    $format: String!
    $exportType: String!
    $maxMarkingDefinition: String
    $context: String
    $types: [String]
    $search: String
    $orderBy: StixCyberObservablesOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
    $relationship_type: [String]
    $elementId: String
    $selectedIds: [String]
  ) {
    stixCyberObservablesExportAsk(
      format: $format
      exportType: $exportType
      maxMarkingDefinition: $maxMarkingDefinition
      context: $context
      types: $types
      search: $search
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
      relationship_type: $relationship_type
      elementId: $elementId
      selectedIds: $selectedIds
    ) {
      id
    }
  }
`;

const exportValidation = (t) => Yup.object().shape({
  format: Yup.string().required(t('This field is required')),
});

export const scopesConn = (exportConnectors) => {
  const scopes = uniq(flatten(map((c) => c.connector_scope, exportConnectors)));
  const connectors = map((s) => {
    const filteredConnectors = filter(
      (e) => includes(s, e.connector_scope),
      exportConnectors,
    );
    return map(
      (x) => ({ data: { name: x.name, active: x.active } }),
      filteredConnectors,
    );
  }, scopes);
  const zipped = zip(scopes, connectors);
  return fromPairs(zipped);
};

class StixCyberObservablesExportCreationComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  onSubmit(selectedIds, values, { setSubmitting, resetForm }) {
    const { paginationOptions, context } = this.props;
    const maxMarkingDefinition = values.maxMarkingDefinition === 'none'
      ? null
      : values.maxMarkingDefinition;
    commitMutation({
      mutation: StixCyberObservablesExportCreationMutation,
      variables: {
        format: values.format,
        exportType: values.type,
        maxMarkingDefinition,
        context,
        ...paginationOptions,
        selectedIds,
      },
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        if (this.props.onExportAsk) this.props.onExportAsk();
        this.handleClose();
        MESSAGING$.notifySuccess('Export successfully started');
      },
    });
  }

  render() {
    const { classes, t, data } = this.props;
    const connectorsExport = propOr([], 'connectorsForExport', data);
    const exportScopes = uniq(
      flatten(map((c) => c.connector_scope, connectorsExport)),
    );
    const exportConnsPerFormat = scopesConn(connectorsExport);
    const isExportActive = (format) => filter((x) => x.data.active, exportConnsPerFormat[format]).length > 0;
    const isExportPossible = filter((x) => isExportActive(x), exportScopes).length > 0;
    return (
      <ExportContext.Consumer>
        {({ selectedIds }) => {
          return (
            <div>
              <Tooltip
                title={
                  isExportPossible
                    ? t('Generate an export')
                    : t('No export connector available to generate an export')
                }
                aria-label="generate-export"
              >
                <Fab
                  onClick={this.handleOpen.bind(this)}
                  color="secondary"
                  aria-label="Add"
                  className={classes.createButton}
                  disabled={!isExportPossible}
                >
                  <Add />
                </Fab>
              </Tooltip>
              <Formik
                enableReinitialize={true}
                initialValues={{
                  format: '',
                  type: 'simple',
                  maxMarkingDefinition: 'none',
                }}
                validationSchema={exportValidation(t)}
                onSubmit={this.onSubmit.bind(this, selectedIds)}
                onReset={this.handleClose.bind(this)}
              >
                {({ submitForm, handleReset, isSubmitting }) => (
                  <Form>
                    <Dialog
                      open={this.state.open}
                      PaperProps={{ elevation: 1 }}
                      onClose={this.handleClose.bind(this)}
                      fullWidth={true}
                    >
                      <DialogTitle>{t('Generate an export')}</DialogTitle>
                      <QueryRenderer
                        query={markingDefinitionsLinesSearchQuery}
                        variables={{ first: 200 }}
                        render={({ props }) => {
                          if (props && props.markingDefinitions) {
                            return (
                              <DialogContent>
                                <Field
                                  component={SelectField}
                                  variant="standard"
                                  name="format"
                                  label={t('Export format')}
                                  fullWidth={true}
                                  containerstyle={{ width: '100%' }}
                                >
                                  {exportScopes.map((value, i) => (
                                    <MenuItem
                                      key={i}
                                      value={value}
                                      disabled={!isExportActive(value)}
                                    >
                                      {value}
                                    </MenuItem>
                                  ))}
                                </Field>
                                <Field
                                  component={SelectField}
                                  variant="standard"
                                  name="type"
                                  label={t('Export type')}
                                  fullWidth={true}
                                  containerstyle={fieldSpacingContainerStyle}
                                >
                                  <MenuItem value="simple">
                                    {t('Simple export (just the entity)')}
                                  </MenuItem>
                                  <MenuItem value="full">
                                    {t(
                                      'Full export (entity and first neighbours)',
                                    )}
                                  </MenuItem>
                                </Field>
                                <Field
                                  component={SelectField}
                                  variant="standard"
                                  name="maxMarkingDefinition"
                                  label={t('Max marking definition level')}
                                  fullWidth={true}
                                  containerstyle={{
                                    marginTop: 20,
                                    width: '100%',
                                  }}
                                >
                                  <MenuItem value="none">{t('None')}</MenuItem>
                                  {map(
                                    (markingDefinition) => (
                                      <MenuItem
                                        key={markingDefinition.node.id}
                                        value={markingDefinition.node.id}
                                      >
                                        {markingDefinition.node.definition}
                                      </MenuItem>
                                    ),
                                    props.markingDefinitions.edges,
                                  )}
                                </Field>
                              </DialogContent>
                            );
                          }
                          return <Loader variant="inElement" />;
                        }}
                      />
                      <DialogActions>
                        <Button onClick={handleReset} disabled={isSubmitting}>
                          {t('Cancel')}
                        </Button>
                        <Button
                          color="secondary"
                          onClick={submitForm}
                          disabled={isSubmitting}
                        >
                          {t('Create')}
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Form>
                )}
              </Formik>
            </div>
          );
        }}
      </ExportContext.Consumer>
    );
  }
}

const StixCyberObservablesExportCreations = createFragmentContainer(
  StixCyberObservablesExportCreationComponent,
  {
    data: graphql`
      fragment StixCyberObservablesExportCreation_data on Query {
        connectorsForExport {
          id
          name
          active
          connector_scope
          updated_at
        }
      }
    `,
  },
);

StixCyberObservablesExportCreations.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func,
  data: PropTypes.object,
  paginationOptions: PropTypes.object,
  context: PropTypes.string,
  onExportAsk: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixCyberObservablesExportCreations);
