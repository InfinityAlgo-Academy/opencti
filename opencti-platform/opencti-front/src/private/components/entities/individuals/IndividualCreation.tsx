import React, { FunctionComponent, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import { Add, Close } from '@mui/icons-material';
import * as Yup from 'yup';
import { graphql, useMutation } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import { SimpleFileUpload } from 'formik-mui';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import { FormikConfig } from 'formik/dist/types';
import { useFormatter } from '../../../../components/i18n';
import { handleErrorInForm } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import MarkdownField from '../../../../components/MarkdownField';
import { ExternalReferencesField } from '../../common/form/ExternalReferencesField';
import { useSchemaCreationValidation } from '../../../../utils/hooks/useEntitySettings';
import { insertNode } from '../../../../utils/store';
import { Theme } from '../../../../components/Theme';
import { Option } from '../../common/form/ReferenceField';
import OpenVocabField from '../../common/form/OpenVocabField';
import {
  IndividualCreationMutation,
  IndividualCreationMutation$variables,
} from './__generated__/IndividualCreationMutation.graphql';
import { IndividualsLinesPaginationQuery$variables } from './__generated__/IndividualsLinesPaginationQuery.graphql';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import useDefaultValues from '../../../../utils/hooks/useDefaultValues';

const useStyles = makeStyles<Theme>((theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
  },
  importButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
}));

const individualMutation = graphql`
  mutation IndividualCreationMutation($input: IndividualAddInput!) {
    individualAdd(input: $input) {
      id
      standard_id
      name
      description
      entity_type
      parent_types
      ...IndividualLine_node
    }
  }
`;

const INDIVIDUAL_TYPE = 'Individual';

interface IndividualAddInput {
  name: string
  description: string
  x_opencti_reliability: undefined | null
  createdBy: Option | undefined
  objectMarking: Option[]
  objectLabel: Option[]
  externalReferences: { value: string }[]
  file: File | undefined
}

interface IndividualFormProps {
  updater: (store: RecordSourceSelectorProxy, key: string) => void
  onReset?: () => void;
  onCompleted?: () => void;
  defaultCreatedBy?: { value: string, label: string }
  defaultMarkingDefinitions?: { value: string, label: string }[]
  inputValue?: string;
}

export const IndividualCreationForm: FunctionComponent<IndividualFormProps> = ({
  updater,
  onReset,
  onCompleted,
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
    x_opencti_reliability: Yup.string()
      .nullable(),
  };
  const individualValidator = useSchemaCreationValidation(INDIVIDUAL_TYPE, basicShape);

  const [commit] = useMutation<IndividualCreationMutation>(individualMutation);

  const onSubmit: FormikConfig<IndividualAddInput>['onSubmit'] = (values, {
    setSubmitting,
    setErrors,
    resetForm,
  }) => {
    const input: IndividualCreationMutation$variables['input'] = {
      name: values.name,
      description: values.description,
      x_opencti_reliability: values.x_opencti_reliability,
      createdBy: values.createdBy?.value,
      objectMarking: values.objectMarking.map((v) => v.value),
      objectLabel: values.objectLabel.map((v) => v.value),
      externalReferences: values.externalReferences.map(({ value }) => value),
      file: values.file,
    };
    commit({
      variables: {
        input,
      },
      updater: (store) => {
        if (updater) {
          updater(store, 'individualAdd');
        }
      },
      onError: (error) => {
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

  const initialValues = useDefaultValues(
    INDIVIDUAL_TYPE,
    {
      name: '',
      description: '',
      x_opencti_reliability: undefined,
      createdBy: defaultCreatedBy,
      objectMarking: defaultMarkingDefinitions ?? [],
      objectLabel: [],
      externalReferences: [],
      file: undefined,
    },
  );

  return <Formik
    initialValues={initialValues}
    validationSchema={individualValidator}
    onSubmit={onSubmit}
    onReset={onReset}>
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
          variant="standard"
          name="name"
          label={t('Name')}
          fullWidth={true}
          detectDuplicate={['User']}
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
        <OpenVocabField
            label={t('Reliability')}
            type="reliability_ov"
            name="x_opencti_reliability"
            containerStyle={fieldSpacingContainerStyle}
            multiple={false}
            onChange={setFieldValue}
        />
        <CreatedByField
          name="createdBy"
          style={fieldSpacingContainerStyle}
          setFieldValue={setFieldValue}
        />
        <ObjectLabelField
          name="objectLabel"
          style={fieldSpacingContainerStyle}
          setFieldValue={setFieldValue}
          values={values.objectLabel}
        />
        <ObjectMarkingField
          name="objectMarking"
          style={fieldSpacingContainerStyle}
        />
        <ExternalReferencesField
          name="externalReferences"
          style={fieldSpacingContainerStyle}
          setFieldValue={setFieldValue}
          values={values.externalReferences}
        />
        <Field
          component={SimpleFileUpload}
          name="file"
          label={t('Associated file')}
          FormControlProps={{
            style: {
              marginTop: 20,
              width: '100%',
            },
          }}
          InputLabelProps={{
            fullWidth: true,
            variant: 'standard',
          }}
          InputProps={{
            fullWidth: true,
            variant: 'standard',
          }}
          fullWidth={true}
        />
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
  </Formik>;
};

const IndividualCreation = ({ paginationOptions }: {
  paginationOptions: IndividualsLinesPaginationQuery$variables
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const onReset = () => handleClose();

  const updater = (store: RecordSourceSelectorProxy) => insertNode(
    store,
    'Pagination_individuals',
    paginationOptions,
    'individualAdd',
  );

  return (
    <div>
      <Fab onClick={handleOpen}
           color="secondary"
           aria-label="Add"
           className={classes.createButton}>
        <Add />
      </Fab>
      <Drawer open={open}
              anchor="right"
              elevation={1}
              sx={{ zIndex: 1202 }}
              classes={{ paper: classes.drawerPaper }}
              onClose={handleClose}>
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose}
            size="large"
            color="primary">
            <Close fontSize="small" color="primary" />
          </IconButton>
          <Typography variant="h6">{t('Create a individual')}</Typography>
        </div>
        <div className={classes.container}>
          <IndividualCreationForm
            updater={updater}
            onCompleted={() => handleClose()}
            onReset={onReset}
          />
        </div>
      </Drawer>
    </div>
  );
};

export default IndividualCreation;
