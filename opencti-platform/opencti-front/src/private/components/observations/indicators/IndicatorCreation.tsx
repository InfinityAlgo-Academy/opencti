import React, { FunctionComponent, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import { Add } from '@mui/icons-material';
import * as Yup from 'yup';
import { graphql, useMutation } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import { FormikConfig } from 'formik/dist/types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Drawer, { DrawerVariant } from '@components/common/drawer/Drawer';
import { useFormatter } from '../../../../components/i18n';
import { handleErrorInForm } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import TypesField from '../TypesField';
import SwitchField from '../../../../components/SwitchField';
import MarkdownField from '../../../../components/MarkdownField';
import KillChainPhasesField from '../../common/form/KillChainPhasesField';
import ConfidenceField from '../../common/form/ConfidenceField';
import { ExternalReferencesField } from '../../common/form/ExternalReferencesField';
import DateTimePickerField from '../../../../components/DateTimePickerField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import OpenVocabField from '../../common/form/OpenVocabField';
import { insertNode } from '../../../../utils/store';
import { Theme } from '../../../../components/Theme';
import { Option } from '../../common/form/ReferenceField';
import { IndicatorCreationMutation, IndicatorCreationMutation$variables } from './__generated__/IndicatorCreationMutation.graphql';
import { parse } from '../../../../utils/Time';
import { IndicatorsLinesPaginationQuery$variables } from './__generated__/IndicatorsLinesPaginationQuery.graphql';
import useDefaultValues from '../../../../utils/hooks/useDefaultValues';
import { useSchemaCreationValidation } from '../../../../utils/hooks/useEntitySettings';
import CustomFileUploader from '../../common/files/CustomFileUploader';

const useStyles = makeStyles<Theme>((theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 280,
    transition: theme.transitions.create('right', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  createButtonContextual: {
    position: 'fixed',
    bottom: 30,
    right: 30,
    transition: theme.transitions.create('right', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

const indicatorMutation = graphql`
  mutation IndicatorCreationMutation($input: IndicatorAddInput!) {
    indicatorAdd(input: $input) {
      id
      standard_id
      name
      description
      entity_type
      parent_types
      ...IndicatorLine_node
    }
  }
`;

const INDICATOR_TYPE = 'Indicator';

interface IndicatorAddInput {
  name: string
  confidence: number | undefined
  indicator_types: string[]
  pattern: string
  pattern_type: string
  x_opencti_main_observable_type: string
  createObservables: boolean
  x_mitre_platforms: string[];
  valid_from: Date | null
  valid_until: Date | null
  description: string
  createdBy: Option | undefined
  objectMarking: Option[]
  killChainPhases: Option[]
  objectLabel: Option[]
  externalReferences: { value: string }[]
  x_opencti_detection: boolean
  x_opencti_score: number
  file: File | undefined
}

interface IndicatorFormProps {
  updater: (store: RecordSourceSelectorProxy, key: string) => void
  onReset?: () => void;
  onCompleted?: () => void;
  defaultCreatedBy?: { value: string, label: string }
  defaultMarkingDefinitions?: { value: string, label: string }[]
  defaultConfidence?: number;
  inputValue?: string;
}

export const IndicatorCreationForm: FunctionComponent<IndicatorFormProps> = ({
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
    indicator_types: Yup.array().nullable(),
    confidence: Yup.number().nullable(),
    pattern: Yup.string().required(t('This field is required')),
    pattern_type: Yup.string().required(t('This field is required')),
    x_opencti_main_observable_type: Yup.string().required(
      t('This field is required'),
    ),
    valid_from: Yup.date()
      .nullable()
      .typeError(t('The value must be a datetime (yyyy-MM-dd hh:mm (a|p)m)')),
    valid_until: Yup.date()
      .nullable()
      .min(
        Yup.ref('valid_from'),
        'The valid until date can\'t be before valid from date',
      )
      .typeError(t('The value must be a datetime (yyyy-MM-dd hh:mm (a|p)m)')),
    x_mitre_platforms: Yup.array().nullable(),
    x_opencti_score: Yup.number().nullable(),
    description: Yup.string().nullable(),
    x_opencti_detection: Yup.boolean().nullable(),
    createObservables: Yup.boolean().nullable(),
  };
  const indicatorValidator = useSchemaCreationValidation(
    INDICATOR_TYPE,
    basicShape,
  );

  const [commit] = useMutation<IndicatorCreationMutation>(indicatorMutation);

  const onSubmit: FormikConfig<IndicatorAddInput>['onSubmit'] = (values, { setSubmitting, setErrors, resetForm }) => {
    const input: IndicatorCreationMutation$variables['input'] = {
      name: values.name,
      description: values.description,
      indicator_types: values.indicator_types,
      pattern: values.pattern,
      pattern_type: values.pattern_type,
      createObservables: values.createObservables,
      x_opencti_main_observable_type: values.x_opencti_main_observable_type,
      x_mitre_platforms: values.x_mitre_platforms,
      confidence: parseInt(String(values.confidence), 10),
      x_opencti_score: parseInt(String(values.x_opencti_score), 10),
      x_opencti_detection: values.x_opencti_detection,
      valid_from: values.valid_from ? parse(values.valid_from).format() : null,
      valid_until: values.valid_until ? parse(values.valid_until).format() : null,
      killChainPhases: (values.killChainPhases ?? []).map(({ value }) => value),
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
          updater(store, 'indicatorAdd');
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
    INDICATOR_TYPE,
    {
      name: '',
      confidence: defaultConfidence,
      indicator_types: [],
      pattern: '',
      pattern_type: '',
      x_opencti_main_observable_type: '',
      x_mitre_platforms: [],
      valid_from: null,
      valid_until: null,
      description: '',
      createdBy: defaultCreatedBy,
      objectMarking: defaultMarkingDefinitions ?? [],
      killChainPhases: [],
      objectLabel: [],
      externalReferences: [],
      x_opencti_detection: false,
      createObservables: false,
      x_opencti_score: 50,
      file: undefined,
    },
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={indicatorValidator}
      onSubmit={onSubmit}
      onReset={onReset}
    >
      {({ submitForm, handleReset, isSubmitting, setFieldValue, values }) => (
        <Form style={{ margin: '20px 0 20px 0' }}>
          <Field
            component={TextField}
            variant="standard"
            name="name"
            label={t('Name')}
            fullWidth={true}
          />
          <OpenVocabField
            label={t('Indicator types')}
            type="indicator-type-ov"
            name="indicator_types"
            multiple={true}
            containerStyle={fieldSpacingContainerStyle}
            onChange={(n, v) => setFieldValue(n, v)}
          />
          <ConfidenceField
            entityType="Indicator"
            containerStyle={fieldSpacingContainerStyle}
          />
          <OpenVocabField
            label={t('Pattern type')}
            type="pattern_type_ov"
            name="pattern_type"
            onChange={(name, value) => setFieldValue(name, value)}
            containerStyle={fieldSpacingContainerStyle}
            multiple={false}
          />
          <Field
            component={TextField}
            variant="standard"
            name="pattern"
            label={t('Pattern')}
            fullWidth={true}
            multiline={true}
            rows="4"
            style={{ marginTop: 20 }}
            detectDuplicate={['Indicator']}
          />
          <TypesField
            name="x_opencti_main_observable_type"
            label={t('Main observable type')}
            containerstyle={fieldSpacingContainerStyle}
          />
          <Field
            component={DateTimePickerField}
            name="valid_from"
            TextFieldProps={{
              label: t('Valid from'),
              variant: 'standard',
              fullWidth: true,
              style: { marginTop: 20 },
            }}
          />
          <Field
            component={DateTimePickerField}
            name="valid_until"
            TextFieldProps={{
              label: t('Valid until'),
              variant: 'standard',
              fullWidth: true,
              style: { marginTop: 20 },
            }}
          />
          <OpenVocabField
            label={t('Platforms')}
            type="platforms_ov"
            name="x_mitre_platforms"
            onChange={(name, value) => setFieldValue(name, value)}
            containerStyle={fieldSpacingContainerStyle}
            multiple={true}
          />
          <Field
            component={TextField}
            variant="standard"
            name="x_opencti_score"
            label={t('Score')}
            type="number"
            fullWidth={true}
            style={{ marginTop: 20 }}
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
          <KillChainPhasesField
            name="killChainPhases"
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
          <CustomFileUploader setFieldValue={setFieldValue} />
          <Field
            component={SwitchField}
            type="checkbox"
            name="x_opencti_detection"
            label={t('Detection')}
            fullWidth={true}
            containerstyle={{ marginTop: 20 }}
          />
          <Field
            component={SwitchField}
            type="checkbox"
            name="createObservables"
            label={t('Create observables from this indicator')}
            fullWidth={true}
            containerstyle={{ marginTop: 10 }}
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
    </Formik>
  );
};

interface IndicatorCreationProps {
  paginationOptions: IndicatorsLinesPaginationQuery$variables,
  contextual?: boolean,
  display?: boolean
}

const IndicatorCreation: FunctionComponent<IndicatorCreationProps> = ({ paginationOptions, contextual, display }) => {
  const { t } = useFormatter();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const onReset = () => handleClose();

  const updater = (store: RecordSourceSelectorProxy) => insertNode(
    store,
    'Pagination_indicators',
    paginationOptions,
    'indicatorAdd',
  );

  if (contextual) {
    return (
      <div style={{ visibility: !display ? 'hidden' : 'visible' }}>
        <Fab
          onClick={handleOpen}
          color="secondary"
          aria-label="Add"
          className={classes.createButtonContextual}
          sx={{ zIndex: 1203 }}
        >
          <Add />
        </Fab>
        <Dialog
          open={open}
          onClose={handleClose}
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Create an indicator')}</DialogTitle>
          <DialogContent>
            <IndicatorCreationForm
              updater={updater}
              onCompleted={handleClose}
              onReset={onReset}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Drawer
      title={t('Create an indicator')}
      variant={DrawerVariant.createWithLargePanel}
    >
      {({ onClose }) => (
        <IndicatorCreationForm
          updater={updater}
          onCompleted={onClose}
          onReset={onClose}
        />
      )}
    </Drawer>
  );
};

export default IndicatorCreation;
