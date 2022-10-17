import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { graphql, createRefetchContainer } from 'react-relay';
import { interval } from 'rxjs';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { AddOutlined, Extension } from '@mui/icons-material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { Field, Form, Formik } from 'formik';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import { v4 as uuid } from 'uuid';
import IconButton from '@mui/material/IconButton';
import SelectField from '../../../components/SelectField';
import { FIVE_SECONDS } from '../../../utils/Time';
import {
  fileManagerAskJobImportMutation,
  scopesConn,
} from '../common/files/FileManager';
import FileLine from '../common/files/FileLine';
import inject18n from '../../../components/i18n';
import FileUploader from '../common/files/FileUploader';
import { commitMutation, MESSAGING$ } from '../../../relay/environment';
import WorkbenchFileLine from '../common/files/workbench/WorkbenchFileLine';
import FreeTextUploader from '../common/files/FreeTextUploader';
import TextField from '../../../components/TextField';

const interval$ = interval(FIVE_SECONDS);

const styles = (theme) => ({
  container: {
    margin: 0,
  },
  title: {
    float: 'left',
    textTransform: 'uppercase',
  },
  gridContainer: {
    marginBottom: 20,
  },
  paper: {
    height: '100%',
    minHeight: '100%',
    padding: '10px 15px 10px 15px',
    borderRadius: 6,
    marginTop: 2,
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
});

export const importContentQuery = graphql`
  query ImportContentQuery {
    connectorsForImport {
      ...ImportContent_connectorsImport
    }
    importFiles(first: 1000) @connection(key: "Pagination_global_importFiles") {
      edges {
        node {
          id
          ...FileLine_file
          metaData {
            mimetype
          }
        }
      }
    }
    pendingFiles(first: 1000)
      @connection(key: "Pagination_global_pendingFiles") {
      edges {
        node {
          id
          ...WorkbenchFileLine_file
          metaData {
            mimetype
          }
        }
      }
    }
  }
`;

const importContentMutation = graphql`
  mutation ImportContentMutation($file: Upload!) {
    uploadPending(file: $file) {
      id
      ...FileLine_file
    }
  }
`;

const importValidation = (t) => Yup.object().shape({
  connector_id: Yup.string().required(t('This field is required')),
});

const fileValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
});

class ImportContentComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileToImport: null,
      fileToValidate: null,
      displayCreate: false,
    };
  }

  componentDidMount() {
    this.subscription = interval$.subscribe(() => {
      this.props.relay.refetch();
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  handleOpenImport(file) {
    this.setState({ fileToImport: file });
  }

  handleCloseImport() {
    this.setState({ fileToImport: null });
  }

  handleOpenValidate(file) {
    this.setState({ fileToValidate: file });
  }

  handleCloseValidate() {
    this.setState({ fileToValidate: null });
  }

  handleOpenCreate() {
    this.setState({ displayCreate: true });
  }

  handleCloseCreate() {
    this.setState({ displayCreate: false });
  }

  onSubmitImport(values, { setSubmitting, resetForm }) {
    commitMutation({
      mutation: fileManagerAskJobImportMutation,
      variables: {
        fileName: this.state.fileToImport.id,
        connectorId: values.connector_id,
      },
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        this.handleCloseImport();
        MESSAGING$.notifySuccess('Import successfully asked');
      },
    });
  }

  onSubmitValidate(values, { setSubmitting, resetForm }) {
    commitMutation({
      mutation: fileManagerAskJobImportMutation,
      variables: {
        fileName: this.state.fileToValidate.id,
        connectorId: values.connector_id,
        bypassValidation: true,
      },
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        this.handleCloseValidate();
        MESSAGING$.notifySuccess('Import successfully asked');
      },
    });
  }

  onSubmitCreate(values, { setSubmitting, resetForm }) {
    let { name } = values;
    if (!name.endsWith('.json')) {
      name += '.json';
    }
    const data = { id: `bundle--${uuid()}`, type: 'bundle', objects: [] };
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'text/json' });
    const file = new File([blob], name, {
      type: 'application/json',
    });
    commitMutation({
      mutation: importContentMutation,
      variables: { file },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        this.handleCloseCreate();
        this.props.relay.refetch();
      },
    });
  }

  onResetCreate() {
    this.handleCloseCreate();
  }

  render() {
    const {
      classes,
      t,
      importFiles,
      pendingFiles,
      nsdt,
      connectorsImport,
      relay,
    } = this.props;
    const { edges: importFilesEdges } = importFiles;
    const { edges: pendingFilesEdges } = pendingFiles;
    const { fileToImport, fileToValidate, displayCreate } = this.state;
    const connectors = R.filter((n) => !n.only_contextual, connectorsImport);
    const importConnsPerFormat = scopesConn(connectors);
    return (
      <div className={classes.container}>
        <Typography
          variant="h1"
          gutterBottom={true}
          classes={{ root: classes.title }}
        >
          {t('Data import')}
        </Typography>
        <div className="clearfix" />
        <Grid
          container={true}
          spacing={3}
          classes={{ container: classes.gridContainer }}
          style={{ marginTop: 0 }}
        >
          <Grid item={true} xs={8}>
            <div style={{ height: '100%' }} className="break">
              <Typography
                variant="h4"
                gutterBottom={true}
                style={{ float: 'left' }}
              >
                {t('Uploaded files')}
              </Typography>
              <div style={{ float: 'left', marginTop: -15 }}>
                <FileUploader
                  onUploadSuccess={() => relay.refetch()}
                  size="medium"
                />
                <FreeTextUploader
                  onUploadSuccess={() => relay.refetch()}
                  size="medium"
                />
              </div>
              <div className="clearfix" />
              <Paper classes={{ root: classes.paper }} variant="outlined">
                {importFilesEdges.length ? (
                  <List>
                    {importFilesEdges.map((file) => (
                      <FileLine
                        key={file.node.id}
                        file={file.node}
                        connectors={
                          importConnsPerFormat[file.node.metaData.mimetype]
                        }
                        handleOpenImport={this.handleOpenImport.bind(this)}
                      />
                    ))}
                  </List>
                ) : (
                  <div
                    style={{ display: 'table', height: '100%', width: '100%' }}
                  >
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
              </Paper>
            </div>
          </Grid>
          <Grid item={true} xs={4}>
            <Typography variant="h4" gutterBottom={true}>
              {t('Enabled import connectors')}
            </Typography>
            <Paper
              classes={{ root: classes.paper }}
              variant="outlined"
              style={{ marginTop: 12 }}
            >
              {connectors.length ? (
                <List>
                  {connectors.map((connector) => (
                    <ListItem
                      key={connector.id}
                      dense={true}
                      divider={true}
                      classes={{ root: classes.item }}
                      button={true}
                    >
                      <Tooltip
                        title={
                          connector.active
                            ? t('This connector is active')
                            : t('This connector is disconnected')
                        }
                      >
                        <ListItemIcon
                          style={{
                            color: connector.active ? '#4caf50' : '#f44336',
                          }}
                        >
                          <Extension />
                        </ListItemIcon>
                      </Tooltip>
                      <ListItemText
                        primary={connector.name}
                        secondary={R.join(',', connector.connector_scope)}
                      />
                      <ListItemSecondaryAction>
                        <ListItemText primary={nsdt(connector.updated_at)} />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <div
                  style={{ display: 'table', height: '100%', width: '100%' }}
                >
                  <span
                    style={{
                      display: 'table-cell',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                    }}
                  >
                    {t('No enrichment connectors on this platform')}
                  </span>
                </div>
              )}
            </Paper>
          </Grid>
          <Grid item={true} xs={12} style={{ marginTop: 40 }}>
            <div style={{ height: '100%' }} className="break">
              <Typography
                variant="h4"
                gutterBottom={true}
                style={{ float: 'left' }}
              >
                {t('Analyst workbenches')}
              </Typography>
              <div style={{ float: 'left', marginTop: -15 }}>
                <IconButton
                  onClick={this.handleOpenCreate.bind(this)}
                  color="primary"
                >
                  <AddOutlined />
                </IconButton>
              </div>
              <div className="clearfix" />
              <Paper classes={{ root: classes.paper }} variant="outlined">
                {pendingFilesEdges.length ? (
                  <List>
                    {pendingFilesEdges.map((file) => (
                      <WorkbenchFileLine
                        key={file.node.id}
                        file={file.node}
                        connectors={
                          importConnsPerFormat[file.node.metaData.mimetype]
                        }
                        handleOpenImport={this.handleOpenValidate.bind(this)}
                      />
                    ))}
                  </List>
                ) : (
                  <div
                    style={{ display: 'table', height: '100%', width: '100%' }}
                  >
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
              </Paper>
            </div>
          </Grid>
        </Grid>
        <div>
          <Formik
            enableReinitialize={true}
            initialValues={{ connector_id: '' }}
            validationSchema={importValidation(t)}
            onSubmit={this.onSubmitImport.bind(this)}
            onReset={this.handleCloseImport.bind(this)}
          >
            {({ submitForm, handleReset, isSubmitting }) => (
              <Form style={{ margin: '0 0 20px 0' }}>
                <Dialog
                  open={fileToImport}
                  PaperProps={{ elevation: 1 }}
                  keepMounted={true}
                  onClose={this.handleCloseImport.bind(this)}
                  fullWidth={true}
                >
                  <DialogTitle>{t('Launch an import')}</DialogTitle>
                  <DialogContent>
                    <Field
                      component={SelectField}
                      variant="standard"
                      name="connector_id"
                      label={t('Connector')}
                      fullWidth={true}
                      containerstyle={{ width: '100%' }}
                    >
                      {connectors.map((connector, i) => {
                        const disabled = !fileToImport
                          || (connector.connector_scope.length > 0
                            && !R.includes(
                              fileToImport.metaData.mimetype,
                              connector.connector_scope,
                            ));
                        return (
                          <MenuItem
                            key={i}
                            value={connector.id}
                            disabled={disabled || !connector.active}
                          >
                            {connector.name}
                          </MenuItem>
                        );
                      })}
                    </Field>
                  </DialogContent>
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
          <Formik
            enableReinitialize={true}
            initialValues={{ connector_id: '' }}
            validationSchema={importValidation(t)}
            onSubmit={this.onSubmitValidate.bind(this)}
            onReset={this.handleCloseValidate.bind(this)}
          >
            {({ submitForm, handleReset, isSubmitting }) => (
              <Form style={{ margin: '0 0 20px 0' }}>
                <Dialog
                  open={fileToValidate}
                  PaperProps={{ elevation: 1 }}
                  keepMounted={true}
                  onClose={this.handleCloseValidate.bind(this)}
                  fullWidth={true}
                >
                  <DialogTitle>{t('Validate and send for import')}</DialogTitle>
                  <DialogContent>
                    <Field
                      component={SelectField}
                      variant="standard"
                      name="connector_id"
                      label={t('Connector')}
                      fullWidth={true}
                      containerstyle={{ width: '100%' }}
                    >
                      {connectors.map((connector, i) => {
                        const disabled = !fileToValidate
                          || (connector.connector_scope.length > 0
                            && !R.includes(
                              fileToValidate.metaData.mimetype,
                              connector.connector_scope,
                            ));
                        return (
                          <MenuItem
                            key={i}
                            value={connector.id}
                            disabled={disabled || !connector.active}
                          >
                            {connector.name}
                          </MenuItem>
                        );
                      })}
                    </Field>
                  </DialogContent>
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
          <Formik
            enableReinitialize={true}
            initialValues={{ name: '' }}
            validationSchema={fileValidation(t)}
            onSubmit={this.onSubmitCreate.bind(this)}
            onReset={this.onResetCreate.bind(this)}
          >
            {({ submitForm, handleReset, isSubmitting }) => (
              <Form>
                <Dialog
                  PaperProps={{ elevation: 1 }}
                  open={displayCreate}
                  onClose={this.handleCloseCreate.bind(this)}
                  fullWidth={true}
                >
                  <DialogTitle>{t('Create a workbench')}</DialogTitle>
                  <DialogContent>
                    <Field
                      component={TextField}
                      variant="standard"
                      name="name"
                      label={t('Name')}
                      fullWidth={true}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleReset} disabled={isSubmitting}>
                      {t('Cancel')}
                    </Button>
                    <Button
                      type="submit"
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
      </div>
    );
  }
}

ImportContentComponent.propTypes = {
  connectorsImport: PropTypes.array,
  importFiles: PropTypes.object,
  pendingFiles: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  nsdt: PropTypes.func,
};

const ImportContent = createRefetchContainer(
  ImportContentComponent,
  {
    connectorsImport: graphql`
      fragment ImportContent_connectorsImport on Connector
      @relay(plural: true) {
        id
        name
        active
        only_contextual
        connector_scope
        updated_at
      }
    `,
  },
  importContentQuery,
);

export default R.compose(inject18n, withStyles(styles))(ImportContent);
