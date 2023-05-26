import { Add, Close } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Field, Form, Formik } from 'formik';
import { SimpleFileUpload } from 'formik-mui';
import { FormikConfig } from 'formik/dist/types';
import React, { FunctionComponent, useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import * as Yup from 'yup';
import DateTimePickerField from '../../../../components/DateTimePickerField';
import { useFormatter } from '../../../../components/i18n';
import MarkDownField from '../../../../components/MarkDownField';
import TextField from '../../../../components/TextField';
import { Theme } from '../../../../components/Theme';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import { useSchemaCreationValidation } from '../../../../utils/hooks/useEntitySettings';
import { insertNode } from '../../../../utils/store';
import { dayStartDate } from '../../../../utils/Time';
import CaseTemplateField from '../../common/form/CaseTemplateField';
import ConfidenceField from '../../common/form/ConfidenceField';
import CreatedByField from '../../common/form/CreatedByField';
import { ExternalReferencesField } from '../../common/form/ExternalReferencesField';
import ObjectAssigneeField from '../../common/form/ObjectAssigneeField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import OpenVocabField from '../../common/form/OpenVocabField';
import { Option } from '../../common/form/ReferenceField';
import { CaseIncidentAddInput, CaseIncidentCreationCaseMutation } from './__generated__/CaseIncidentCreationCaseMutation.graphql';
import { CaseIncidentsLinesCasesPaginationQuery$variables } from './__generated__/CaseIncidentsLinesCasesPaginationQuery.graphql';

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

const caseIncidentMutation = graphql`
  mutation CaseIncidentCreationCaseMutation($input: CaseIncidentAddInput!) {
    caseIncidentAdd(input: $input) {
      id
      entity_type
      parent_types
      name
      description
      response_types
      ...CaseIncidentLineCase_node
    }
  }
`;

interface FormikCaseIncidentAddInput {
  name: string
  confidence: number
  severity: string
  priority: string
  description: string
  file: File | undefined
  createdBy: Option | undefined
  objectMarking: Option[]
  objectAssignee: Option[]
  objectLabel: Option[]
  externalReferences: Option[]
  created: Date;
  response_types: string[]
  caseTemplates?: Option[]
}

interface IncidentFormProps {
  updater: (store: RecordSourceSelectorProxy, key: string, response: { id: string, name: string } | null) => void
  onReset?: () => void
  onCompleted?: () => void
  defaultConfidence?: number,
  defaultCreatedBy?: { value: string, label: string }
  defaultMarkingDefinitions?: { value: string, label: string }[]
}

export const CaseIncidentCreationForm: FunctionComponent<IncidentFormProps> = ({
  updater,
  onReset,
  onCompleted,
  defaultConfidence,
  defaultCreatedBy,
  defaultMarkingDefinitions,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const basicShape = {
    name: Yup.string().min(2).required(t('This field is required')),
    description: Yup.string().nullable(),
  };
  const caseIncidentValidator = useSchemaCreationValidation('Case-Incident', basicShape);
  const [commit] = useMutation<CaseIncidentCreationCaseMutation>(caseIncidentMutation);

  const onSubmit: FormikConfig<FormikCaseIncidentAddInput>['onSubmit'] = (
    values,
    { setSubmitting, resetForm },
  ) => {
    const finalValues: CaseIncidentAddInput = {
      name: values.name,
      description: values.description,
      created: values.created,
      severity: values.severity,
      priority: values.priority,
      response_types: values.response_types,
      caseTemplates: values.caseTemplates?.map(({ value }) => value),
      confidence: parseInt(String(values.confidence), 10),
      objectAssignee: values.objectAssignee.map(({ value }) => value),
      objectMarking: values.objectMarking.map(({ value }) => value),
      objectLabel: values.objectLabel.map(({ value }) => value),
      externalReferences: values.externalReferences.map(({ value }) => value),
      createdBy: values.createdBy?.value,
    };
    if (values.file) {
      finalValues.file = values.file;
    }
    commit({
      variables: {
        input: finalValues,
      },
      updater: (store, response) => {
        if (updater) {
          updater(store, 'caseIncidentAdd', response.caseIncidentAdd);
        }
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

  return <Formik<FormikCaseIncidentAddInput>
    initialValues={{
      name: '',
      confidence: defaultConfidence ?? 75,
      description: '',
      severity: '',
      caseTemplates: [],
      response_types: [],
      created: dayStartDate(),
      priority: '',
      createdBy: defaultCreatedBy ?? undefined,
      objectMarking: defaultMarkingDefinitions ?? [],
      objectAssignee: [],
      objectLabel: [],
      externalReferences: [],
      file: undefined,
    }}
    validationSchema={caseIncidentValidator}
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
          detectDuplicate={['CaseIncident']}
          style={{ marginBottom: '20px' }}
        />
        <Field
          component={DateTimePickerField}
          name="created"
          TextFieldProps={{
            label: t('Incident date'),
            variant: 'standard',
            fullWidth: true,
          }}
        />
        <OpenVocabField
          label={t('Severity')}
          type="case_severity_ov"
          name="severity"
          onChange={setFieldValue}
          containerStyle={fieldSpacingContainerStyle}
        />
        <OpenVocabField
          label={t('Priority')}
          type="case_priority_ov"
          name="priority"
          onChange={setFieldValue}
          containerStyle={fieldSpacingContainerStyle}
        />
        <OpenVocabField
          label={t('Incident type')}
          type="incident_response_types_ov"
          name="response_types"
          multiple
          onChange={setFieldValue}
          containerStyle={fieldSpacingContainerStyle}
        />
        <CaseTemplateField
          onChange={setFieldValue}
          containerStyle={fieldSpacingContainerStyle}
        />
        <ConfidenceField
          entityType="Case-Incident"
          containerStyle={fieldSpacingContainerStyle}
        />
        <Field
          component={MarkDownField}
          name="description"
          label={t('Description')}
          fullWidth={true}
          multiline={true}
          rows="4"
          style={fieldSpacingContainerStyle}
        />
        <ObjectAssigneeField
          name="objectAssignee"
          style={fieldSpacingContainerStyle}
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
          FormControlProps={{ style: fieldSpacingContainerStyle }}
          InputLabelProps={{ fullWidth: true, variant: 'standard' }}
          InputProps={{ fullWidth: true, variant: 'standard' }}
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

const CaseIncidentCreation = ({ paginationOptions }: { paginationOptions: CaseIncidentsLinesCasesPaginationQuery$variables }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const onReset = () => handleClose();
  const updater = (store: RecordSourceSelectorProxy) => insertNode(
    store,
    'Pagination_incidents_caseIncidents',
    paginationOptions,
    'caseIncidentAdd',
  );

  return (
    <div>
      <Fab
        onClick={handleOpen}
        color="secondary"
        aria-label="Add"
        className={classes.createButton}
      >
        <Add />
      </Fab>
      <Drawer
        open={open}
        anchor="right"
        elevation={1}
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
        onClose={handleClose}
      >
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose}
            size="large"
            color="primary"
          >
            <Close fontSize="small" color="primary" />
          </IconButton>
          <Typography variant="h6">{t('Create a case incident')}</Typography>
        </div>
        <div className={classes.container}>
          <CaseIncidentCreationForm
            updater={updater}
            onCompleted={() => handleClose()}
            onReset={onReset}
          />
        </div>
      </Drawer>
    </div>
  );
};

export default CaseIncidentCreation;
