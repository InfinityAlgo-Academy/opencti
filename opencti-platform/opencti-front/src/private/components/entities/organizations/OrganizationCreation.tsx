import React, { FunctionComponent } from 'react';
import { Field, Form, Formik } from 'formik';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import { graphql, useMutation } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import { FormikConfig } from 'formik/dist/types';
import Drawer, { DrawerVariant } from '@components/common/drawer/Drawer';
import ConfidenceField from '@components/common/form/ConfidenceField';
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
import type { Theme } from '../../../../components/Theme';
import { Option } from '../../common/form/ReferenceField';
import { OrganizationCreationMutation, OrganizationCreationMutation$variables } from './__generated__/OrganizationCreationMutation.graphql';
import { OrganizationsLinesPaginationQuery$variables } from './__generated__/OrganizationsLinesPaginationQuery.graphql';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import useDefaultValues from '../../../../utils/hooks/useDefaultValues';
import OpenVocabField from '../../common/form/OpenVocabField';
import CustomFileUploader from '../../common/files/CustomFileUploader';

const useStyles = makeStyles<Theme>((theme) => ({
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  formContainer: {
    margin: '20px 0 20px 0',
  },
}));

const organizationMutation = graphql`
  mutation OrganizationCreationMutation($input: OrganizationAddInput!) {
    organizationAdd(input: $input) {
      id
      standard_id
      name
      confidence
      description
      entity_type
      parent_types
      ...OrganizationLine_node
    }
  }
`;

const ORGANIZATION_TYPE = 'Organization';

interface OrganizationAddInput {
  name: string
  description: string
  confidence: number | undefined
  x_opencti_reliability: string | undefined
  x_opencti_organization_type: string | undefined
  createdBy: Option | undefined
  objectMarking: Option[]
  objectLabel: Option[]
  externalReferences: { value: string }[]
  file: File | undefined
}

interface OrganizationFormProps {
  updater: (store: RecordSourceSelectorProxy, key: string) => void
  onReset?: () => void;
  onCompleted?: () => void;
  defaultCreatedBy?: { value: string, label: string }
  defaultMarkingDefinitions?: { value: string, label: string }[]
  inputValue?: string;
}

export const OrganizationCreationForm: FunctionComponent<OrganizationFormProps> = ({
  updater,
  onReset,
  onCompleted,
  defaultCreatedBy,
  defaultMarkingDefinitions,
}) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const basicShape = {
    name: Yup.string()
      .min(2)
      .required(t_i18n('This field is required')),
    description: Yup.string()
      .nullable(),
    confidence: Yup.number().nullable(),
    x_opencti_organization_type: Yup.string()
      .nullable(),
    x_opencti_reliability: Yup.string()
      .nullable(),
  };
  const organizationValidator = useSchemaCreationValidation(ORGANIZATION_TYPE, basicShape);

  const [commit] = useMutation<OrganizationCreationMutation>(organizationMutation);

  const onSubmit: FormikConfig<OrganizationAddInput>['onSubmit'] = (values, {
    setSubmitting,
    setErrors,
    resetForm,
  }) => {
    const input: OrganizationCreationMutation$variables['input'] = {
      name: values.name,
      description: values.description,
      x_opencti_reliability: values.x_opencti_reliability,
      x_opencti_organization_type: values.x_opencti_organization_type,
      createdBy: values.createdBy?.value,
      confidence: parseInt(String(values.confidence), 10),
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
          updater(store, 'organizationAdd');
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
    ORGANIZATION_TYPE,
    {
      name: '',
      description: '',
      x_opencti_reliability: undefined,
      x_opencti_organization_type: undefined,
      createdBy: defaultCreatedBy,
      confidence: undefined,
      objectMarking: defaultMarkingDefinitions ?? [],
      objectLabel: [],
      externalReferences: [],
      file: undefined,
    },
  );

  return <Formik
    initialValues={initialValues}
    validationSchema={organizationValidator}
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
      <Form className={classes.formContainer}>
        <Field
          component={TextField}
          variant="standard"
          name="name"
          label={t_i18n('Name')}
          fullWidth={true}
          detectDuplicate={['Organization']}
        />
        <Field
          component={MarkdownField}
          name="description"
          label={t_i18n('Description')}
          fullWidth={true}
          multiline={true}
          rows="4"
          style={fieldSpacingContainerStyle}
        />
        <ConfidenceField
          entityType="Organization"
          containerStyle={fieldSpacingContainerStyle}
        />
        { /* TODO Improve customization (vocab with letter range) 2662 */}
        <OpenVocabField
          label={t_i18n('Organization type')}
          type="organization_type_ov"
          name="x_opencti_organization_type"
          containerStyle={fieldSpacingContainerStyle}
          multiple={false}
          onChange={setFieldValue}
        />
        <OpenVocabField
          label={t_i18n('Reliability')}
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
        <CustomFileUploader setFieldValue={setFieldValue} />
        <div className={classes.buttons}>
          <Button
            variant="contained"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            {t_i18n('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={submitForm}
            disabled={isSubmitting}
            classes={{ root: classes.button }}
          >
            {t_i18n('Create')}
          </Button>
        </div>
      </Form>
    )}
  </Formik>;
};

const OrganizationCreation = ({ paginationOptions }: {
  paginationOptions: OrganizationsLinesPaginationQuery$variables
}) => {
  const { t_i18n } = useFormatter();

  const updater = (store: RecordSourceSelectorProxy) => insertNode(
    store,
    'Pagination_organizations',
    paginationOptions,
    'organizationAdd',
  );

  return (
    <Drawer
      title={t_i18n('Create an organization')}
      variant={DrawerVariant.create}
    >
      {({ onClose }) => (
        <OrganizationCreationForm
          updater={updater}
          onCompleted={onClose}
          onReset={onClose}
        />
      )}
    </Drawer>
  );
};

export default OrganizationCreation;
