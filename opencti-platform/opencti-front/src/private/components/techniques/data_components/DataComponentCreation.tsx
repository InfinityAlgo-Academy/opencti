import React, { FunctionComponent, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import Fab from '@mui/material/Fab';
import { Add } from '@mui/icons-material';
import * as Yup from 'yup';
import { graphql, useMutation } from 'react-relay';
import { FormikConfig, FormikHelpers } from 'formik/dist/types';
import { Dialog, DialogContent } from '@mui/material';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer, { DrawerVariant } from '@components/common/drawer/Drawer';
import { useFormatter } from '../../../../components/i18n';
import { handleErrorInForm } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import MarkdownField from '../../../../components/MarkdownField';
import { Theme } from '../../../../components/Theme';
import { ExternalReferencesField } from '../../common/form/ExternalReferencesField';
import { insertNode } from '../../../../utils/store';
import { DataComponentsLinesPaginationQuery$variables } from './__generated__/DataComponentsLinesPaginationQuery.graphql';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import ConfidenceField from '../../common/form/ConfidenceField';
import { Option } from '../../common/form/ReferenceField';
import { useSchemaCreationValidation } from '../../../../utils/hooks/useEntitySettings';
import useDefaultValues from '../../../../utils/hooks/useDefaultValues';
import { DataComponentCreationMutation$variables } from './__generated__/DataComponentCreationMutation.graphql';
import CustomFileUploader from '../../common/files/CustomFileUploader';

const useStyles = makeStyles<Theme>((theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  createButtonContextual: {
    position: 'fixed',
    bottom: 30,
    right: 30,
    zIndex: 2000,
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

const dataComponentMutation = graphql`
  mutation DataComponentCreationMutation($input: DataComponentAddInput!) {
    dataComponentAdd(input: $input) {
      id
      standard_id
      name
      description
      entity_type
      parent_types
      ...DataComponentLine_node
    }
  }
`;

interface DataComponentAddInput {
  name: string
  description: string
  createdBy: Option | undefined
  objectMarking: Option[]
  objectLabel: Option[]
  externalReferences: Option[]
  confidence: number | undefined
  file: File | undefined
}

interface DataComponentFormProps {
  updater: (store: RecordSourceSelectorProxy, key: string) => void;
  onReset?: () => void;
  onCompleted?: () => void;
  inputValue?: string;
  defaultCreatedBy?: { value: string; label: string };
  defaultMarkingDefinitions?: { value: string; label: string }[];
  defaultConfidence?: number;
}

const DATA_COMPONENT_TYPE = 'Data-Component';

export const DataComponentCreationForm: FunctionComponent<DataComponentFormProps> = ({
  updater,
  onReset,
  inputValue,
  onCompleted,
  defaultConfidence,
  defaultCreatedBy,
  defaultMarkingDefinitions,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const basicShape = {
    name: Yup.string()
      .min(2)
      .required(t('This field is required')),
    description: Yup.string()
      .nullable(),
    confidence: Yup.number()
      .nullable(),
  };
  const dataComponentValidator = useSchemaCreationValidation(
    DATA_COMPONENT_TYPE,
    basicShape,
  );

  const [commit] = useMutation(dataComponentMutation);
  const onSubmit: FormikConfig<DataComponentAddInput>['onSubmit'] = (
    values: DataComponentAddInput,
    {
      setSubmitting,
      setErrors,
      resetForm,
    }: FormikHelpers<DataComponentAddInput>,
  ) => {
    const input: DataComponentCreationMutation$variables['input'] = {
      name: values.name,
      description: values.description,
      createdBy: values.createdBy?.value,
      objectMarking: values.objectMarking.map((v) => v.value),
      objectLabel: values.objectLabel.map((v) => v.value),
      externalReferences: values.externalReferences.map((v) => v.value),
      confidence: parseInt(String(values.confidence), 10),
      file: values.file,
    };
    commit({
      variables: {
        input,
      },
      updater: (store) => {
        if (updater) {
          updater(store, 'dataComponentAdd');
        }
      },
      onError: (error: Error) => {
        handleErrorInForm(error, setErrors);
        setSubmitting(false);
      },
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        if (onCompleted) {
          onCompleted();
        }
      },
    });
  };

  const initialValues = useDefaultValues<DataComponentAddInput>(
    DATA_COMPONENT_TYPE,
    {
      name: inputValue || '',
      description: '',
      createdBy: defaultCreatedBy,
      objectMarking: defaultMarkingDefinitions ?? [],
      objectLabel: [],
      externalReferences: [],
      confidence: defaultConfidence,
      file: undefined,
    },
  );

  return (
    <Formik<DataComponentAddInput>
      initialValues={initialValues}
      validationSchema={dataComponentValidator}
      onSubmit={onSubmit}
      onReset={onReset}
    >
      {({
        submitForm,
        handleReset,
        isSubmitting,
        setFieldValue,
        values,
      }) => (
        <Form style={{ margin: '20px 0 20px 0' }}>
          <Field
            component={TextField}
            name="name"
            label={t('Name')}
            fullWidth={true}
            detectDuplicate={['Data-Component']}
          />
          <ConfidenceField
            entityType="Data-Component"
            containerStyle={fieldSpacingContainerStyle}
          />
          <Field
            component={MarkdownField}
            name="description"
            label={t('Description')}
            fullWidth={true}
            multiline={true}
            rows="4"
            style={{ marginTop: 20 }}
          />
          <CreatedByField
            name="createdBy"
            style={{
              marginTop: 20,
              width: '100%',
            }}
            setFieldValue={setFieldValue}
          />
          <ObjectLabelField
            name="objectLabel"
            style={{
              marginTop: 20,
              width: '100%',
            }}
            setFieldValue={setFieldValue}
            values={values.objectLabel}
          />
          <ObjectMarkingField
            name="objectMarking"
            style={{
              marginTop: 20,
              width: '100%',
            }}
          />
          <ExternalReferencesField
            name="externalReferences"
            style={{
              marginTop: 20,
              width: '100%',
            }}
            setFieldValue={setFieldValue}
            values={values.externalReferences}
          />
          <CustomFileUploader setFieldValue={setFieldValue} />
          <div className={classes.buttons}>
            <Button
              variant="contained"
              onClick={handleReset}
              disabled={isSubmitting}
              classes={{ root: classes.button }}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={submitForm}
              disabled={isSubmitting}
              classes={{ root: classes.button }}
            >
              {t('Create')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

const DataComponentCreation: FunctionComponent<{
  contextual?: boolean,
  display?: boolean,
  inputValue?: string,
  paginationOptions: DataComponentsLinesPaginationQuery$variables
}> = ({
  contextual,
  display,
  inputValue,
  paginationOptions,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const updater = (store: RecordSourceSelectorProxy) => insertNode(
    store,
    'Pagination_dataComponents',
    paginationOptions,
    'dataComponentAdd',
  );

  const renderClassic = () => (
    <Drawer
      title={t('Create a data component')}
      variant={DrawerVariant.create}
    >
      {({ onClose }) => (
        <DataComponentCreationForm
          inputValue={inputValue}
          updater={updater}
          onCompleted={onClose}
          onReset={onClose}
        />
      )}
    </Drawer>
  );

  const renderContextual = () => (
    <div style={{ display: display ? 'block' : 'none' }}>
      <Fab
        onClick={handleOpen}
        color="secondary"
        aria-label="Add"
        className={classes.createButtonContextual}
      >
        <Add />
      </Fab>
      <Dialog open={open} onClose={handleClose} PaperProps={{ elevation: 1 }}>
        <DialogTitle>{t('Create a data component')}</DialogTitle>
        <DialogContent>
          <DataComponentCreationForm
            inputValue={inputValue}
            updater={updater}
            onCompleted={handleClose}
            onReset={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );

  if (contextual) {
    return renderContextual();
  }
  return renderClassic();
};

export default DataComponentCreation;
