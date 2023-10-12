import React, { FunctionComponent, useEffect, useState } from 'react';
import * as PropTypes from 'prop-types';
import { compose, includes } from 'ramda';
import { createRefetchContainer, graphql, RelayRefetchProp } from 'react-relay';
import { interval } from 'rxjs';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import { Field, Form, Formik } from 'formik';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import makeStyles from '@mui/styles/makeStyles';
import { FormikConfig } from 'formik/dist/types';
import { FragmentRefs } from 'relay-runtime';
import * as R from 'ramda';
import FileLine from '../../common/files/FileLine';
import { TEN_SECONDS } from '../../../../utils/Time';
import FileUploader from '../../common/files/FileUploader';
import inject18n, { useFormatter } from '../../../../components/i18n';
import { commitMutation, MESSAGING$ } from '../../../../relay/environment';
import { fileManagerAskJobImportMutation } from '../../common/files/FileManager';
import SelectField from '../../../../components/SelectField';
import { ExternalReferenceFileImportViewer_entity$data } from './__generated__/ExternalReferenceFileImportViewer_entity.graphql';
import { FileLine_file$data } from '../../common/files/__generated__/FileLine_file.graphql';
import { scopesConn } from '../../common/stix_core_objects/StixCoreObjectFilesAndHistory';

const interval$ = interval(TEN_SECONDS);

const useStyles = makeStyles(() => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    marginTop: -7,
    padding: '10px 15px 10px 15px',
    borderRadius: 6,
  },
}));

interface ConnectorConfiguration {
  configuration: string;
  id: string;
  name: string;
}
interface Connector {
  id: string;
  name: string;
  active: boolean;
  connector_scope: string[];
  updated_at: string;
  configurations: ConnectorConfiguration[];
}

const importValidation = (t: (value: string) => string, configurations: boolean) => {
  const shape = {
    connector_id: Yup.string().required(t('This field is required')),
  };
  if (configurations) {
    return Yup.object().shape({
      ...shape,
      configuration: Yup.string().required(t('This field is required')),
    });
  }
  return Yup.object().shape(shape);
};

interface ExternalReferenceFileImportViewerBaseProps {
  externalReference: ExternalReferenceFileImportViewer_entity$data;
  disableImport: boolean;
  connectors: Record<
  string,
  {
    id: string;
    name: string;
    active: boolean;
    connector_scope: string[];
    updated_at: string;
  }
  >;
  relay: RelayRefetchProp;
  connectorsImport: Connector[];
}
const ExternalReferenceFileImportViewerBase: FunctionComponent<
ExternalReferenceFileImportViewerBaseProps
> = ({ externalReference, disableImport, relay, connectorsImport }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const [fileToImport, setFileToImport] = useState<
  FileLine_file$data | null | undefined
  >(null);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const { id, importFiles } = externalReference;
  const importConnsPerFormat = scopesConn(connectorsImport);
  const handleOpenImport = (file: FileLine_file$data | null | undefined) => setFileToImport(file);
  const handleCloseImport = () => setFileToImport(null);
  const onSubmitImport: FormikConfig<{ connector_id: string, configuration: string }>['onSubmit'] = (
    values,
    { setSubmitting, resetForm },
  ) => {
    commitMutation({
      mutation: fileManagerAskJobImportMutation,
      variables: {
        fileName: fileToImport?.id,
        connectorId: values.connector_id,
        configuration: values.configuration,
      },
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        handleCloseImport();
        MESSAGING$.notifySuccess('Import successfully asked');
      },
      updater: undefined,
      optimisticUpdater: undefined,
      optimisticResponse: undefined,
      onError: undefined,
      setSubmitting: undefined,
    });
  };
  useEffect(() => {
    // Refresh the export viewer every interval
    const subscription = interval$.subscribe(() => {
      if (relay.refetch) {
        relay.refetch({ id });
      }
    });
    return function cleanup() {
      subscription.unsubscribe();
    };
  }, []);
  const fileToImportBoolean = () => {
    return !!fileToImport;
  };
  const connectors = connectorsImport.filter((n) => !R.isEmpty(n.configurations));

  const handleSelectConnector = (_: string, value: string) => {
    setSelectedConnector(connectors?.find((c) => c.id === value) ?? null);
  };
  return (
    <React.Fragment>
      <div style={{ height: '100%' }} className="break">
        <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
          {t('Uploaded files')}
        </Typography>
        <div style={{ float: 'left', marginTop: -17 }}>
          <FileUploader
            entityId={id}
            onUploadSuccess={() => {
              if (relay.refetch) {
                relay.refetch({ id });
              }
            }}
            color={undefined}
            size={undefined}
          />
        </div>
        <div className="clearfix" />
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {importFiles?.edges?.length ? (
            <List>
              {importFiles?.edges?.map(
                (
                  file: {
                    node: {
                      id: string;
                      metaData: {
                        mimetype: string | null;
                      } | null;
                      ' $fragmentSpreads': FragmentRefs<'FileLine_file'>;
                    };
                  } | null,
                ) => file?.node && (
                  <FileLine
                    key={file.node.id}
                    dense={true}
                    disableImport={disableImport}
                    file={file.node}
                    connectors={
                      importConnsPerFormat[file.node.metaData?.mimetype ?? 0]
                    }
                    handleOpenImport={handleOpenImport}
                  />
                ),
              )}
            </List>
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
        </Paper>
      </div>
      <div>
        <Formik
          enableReinitialize={true}
          initialValues={{ connector_id: '', configuration: '' }}
          validationSchema={importValidation(t, (selectedConnector?.configurations?.length ?? 0) > 0)}
          onSubmit={onSubmitImport}
          onReset={handleCloseImport}
        >
          {({ submitForm, handleReset, isSubmitting }) => (
            <Form style={{ margin: '0 0 20px 0' }}>
              <Dialog
                PaperProps={{ elevation: 1 }}
                open={fileToImportBoolean()}
                keepMounted={true}
                onClose={handleCloseImport}
                fullWidth={true}
              >
                <DialogTitle>{t('Launch an import')}</DialogTitle>
                <DialogContent>
                  <Field
                    component={SelectField}
                    name="connector_id"
                    label={t('Connector')}
                    fullWidth={true}
                    containerstyle={{ width: '100%' }}
                    onChange={handleSelectConnector}
                  >
                    {connectorsImport.map((connector, i: number) => {
                      const disabled = !fileToImport
                        || (connector.connector_scope.length > 0
                          && !includes(
                            fileToImport.metaData?.mimetype,
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
                    {(selectedConnector?.configurations?.length ?? 0) > 0
                        && <Field
                            component={SelectField}
                            variant="standard"
                            name="configuration"
                            label={t('Configuration')}
                            fullWidth={true}
                            containerstyle={{ marginTop: 20, width: '100%' }}
                        >
                            {selectedConnector?.configurations.map((config) => {
                              return (
                                    <MenuItem
                                        key={config.id}
                                        value={config.configuration}
                                    >
                                        {config.name}
                                    </MenuItem>
                              );
                            })}
                        </Field>
                    }
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
      </div>
    </React.Fragment>
  );
};

const ExternalReferenceFileImportViewerComponent = compose(inject18n)(
  ExternalReferenceFileImportViewerBase,
);

const ExternalReferenceFileImportViewerRefetchQuery = graphql`
  query ExternalReferenceFileImportViewerRefetchQuery($id: String!) {
    externalReference(id: $id) {
      ...ExternalReferenceFileImportViewer_entity
    }
  }
`;

const ExternalReferenceFileImportViewer = createRefetchContainer(
  ExternalReferenceFileImportViewerComponent,
  {
    externalReference: graphql`
      fragment ExternalReferenceFileImportViewer_entity on ExternalReference {
        id
        entity_type
        importFiles(first: 1000) @connection(key: "Pagination_importFiles") {
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
      }
    `,
    connectorsImport: graphql`
      fragment ExternalReferenceFileImportViewer_connectorsImport on Connector
      @relay(plural: true) {
        id
        name
        active
        connector_scope
        updated_at
        configurations {
            id
            name,
            configuration
        }
      }
    `,
  },
  ExternalReferenceFileImportViewerRefetchQuery,
);

ExternalReferenceFileImportViewer.propTypes = {
  entity: PropTypes.object,
  disableImport: PropTypes.bool,
  connectors: PropTypes.object,
};

export default ExternalReferenceFileImportViewer;
