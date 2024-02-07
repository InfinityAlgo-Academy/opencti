import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import { Field, Form, Formik } from 'formik';
import { FormikConfig } from 'formik/dist/types';
import React, { FunctionComponent, useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import Drawer, { DrawerVariant } from '@components/common/drawer/Drawer';
import DateTimePickerField from '../../../../components/DateTimePickerField';
import { useFormatter } from '../../../../components/i18n';
import MarkdownField from '../../../../components/MarkdownField';
import TextField from '../../../../components/TextField';
import type { Theme } from '../../../../components/Theme';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import { useSchemaCreationValidation } from '../../../../utils/hooks/useEntitySettings';
import { insertNode } from '../../../../utils/store';
import CaseTemplateField from '../../common/form/CaseTemplateField';
import ConfidenceField from '../../common/form/ConfidenceField';
import CreatedByField from '../../common/form/CreatedByField';
import { ExternalReferencesField } from '../../common/form/ExternalReferencesField';
import ObjectAssigneeField from '../../common/form/ObjectAssigneeField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import OpenVocabField from '../../common/form/OpenVocabField';
import { Option } from '../../common/form/ReferenceField';
import { CaseRfiAddInput, CaseRfiCreationCaseMutation } from './__generated__/CaseRfiCreationCaseMutation.graphql';
import { CaseRfiLinesCasesPaginationQuery$variables } from './__generated__/CaseRfiLinesCasesPaginationQuery.graphql';
import useDefaultValues from '../../../../utils/hooks/useDefaultValues';
import RichTextField from '../../../../components/RichTextField';
import ObjectParticipantField from '../../common/form/ObjectParticipantField';
import CustomFileUploader from '../../common/files/CustomFileUploader';

const useStyles = makeStyles<Theme>((theme) => ({
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

const caseRfiMutation = graphql`
  mutation CaseRfiCreationCaseMutation($input: CaseRfiAddInput!) {
    caseRfiAdd(input: $input) {
      id
      standard_id
      entity_type
      parent_types
      name
      description
      ...CaseRfiLineCase_node
    }
  }
`;

interface FormikCaseRfiAddInput {
  name: string;
  confidence: number | undefined;
  description: string;
  content: string;
  file: File | undefined;
  createdBy: Option | undefined;
  objectMarking: Option[];
  objectAssignee: Option[];
  objectParticipant: Option[];
  objectLabel: Option[];
  externalReferences: Option[];
  created: Date | null;
  information_types: string[];
  severity: string;
  priority: string;
  caseTemplates?: Option[];
}

interface CaseRfiFormProps {
  updater: (
    store: RecordSourceSelectorProxy,
    key: string,
    response: { id: string; name: string } | null | undefined
  ) => void;
  onClose?: () => void;
  defaultConfidence?: number;
  defaultCreatedBy?: { value: string; label: string };
  defaultMarkingDefinitions?: { value: string; label: string }[];
}

const CASE_RFI_TYPE = 'Case-Rfi';

export const CaseRfiCreationForm: FunctionComponent<CaseRfiFormProps> = ({
  updater,
  onClose,
  defaultConfidence,
  defaultCreatedBy,
  defaultMarkingDefinitions,
}) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const history = useHistory();
  const [mapAfter, setMapAfter] = useState<boolean>(false);
  const basicShape = {
    name: Yup.string().min(2).required(t_i18n('This field is required')),
    description: Yup.string().nullable(),
  };
  const caseRfiValidator = useSchemaCreationValidation(
    CASE_RFI_TYPE,
    basicShape,
  );
  const [commit] = useMutation<CaseRfiCreationCaseMutation>(caseRfiMutation);
  const onSubmit: FormikConfig<FormikCaseRfiAddInput>['onSubmit'] = (
    values,
    { setSubmitting, resetForm },
  ) => {
    const input: CaseRfiAddInput = {
      name: values.name,
      description: values.description,
      content: values.content,
      created: values.created,
      information_types: values.information_types,
      severity: values.severity,
      priority: values.priority,
      caseTemplates: values.caseTemplates?.map(({ value }) => value),
      confidence: parseInt(String(values.confidence), 10),
      objectAssignee: values.objectAssignee.map(({ value }) => value),
      objectParticipant: values.objectParticipant.map(({ value }) => value),
      objectMarking: values.objectMarking.map(({ value }) => value),
      objectLabel: values.objectLabel.map(({ value }) => value),
      externalReferences: values.externalReferences.map(({ value }) => value),
      createdBy: values.createdBy?.value,
      file: values.file,
    };
    commit({
      variables: {
        input,
      },
      updater: (store, response) => {
        if (updater && response) {
          updater(store, 'caseRfiAdd', response.caseRfiAdd);
        }
      },
      onCompleted: (response) => {
        setSubmitting(false);
        resetForm();
        if (onClose) {
          onClose();
        }
        if (mapAfter) {
          history.push(
            `/dashboard/cases/rfis/${response.caseRfiAdd?.id}/knowledge/content`,
          );
        }
      },
    });
  };

  const initialValues = useDefaultValues<FormikCaseRfiAddInput>(CASE_RFI_TYPE, {
    name: '',
    confidence: defaultConfidence,
    description: '',
    content: '',
    severity: '',
    priority: '',
    caseTemplates: [],
    created: null,
    information_types: [],
    createdBy: defaultCreatedBy,
    objectMarking: defaultMarkingDefinitions ?? [],
    objectAssignee: [],
    objectParticipant: [],
    objectLabel: [],
    externalReferences: [],
    file: undefined,
  });

  return (
    <Formik<FormikCaseRfiAddInput>
      initialValues={initialValues}
      validationSchema={caseRfiValidator}
      onSubmit={onSubmit}
      onReset={onClose}
    >
      {({ submitForm, handleReset, isSubmitting, setFieldValue, values }) => (
        <Form style={{ margin: '20px 0 20px 0' }}>
          <Field
            component={TextField}
            variant="standard"
            name="name"
            label={t_i18n('Name')}
            fullWidth={true}
            detectDuplicate={['Case-Rfi']}
            askAi={true}
          />
          <Field
            component={DateTimePickerField}
            name="created"
            textFieldProps={{
              label: t_i18n('Request For Information Date'),
              variant: 'standard',
              fullWidth: true,
              style: { marginTop: 20 },
            }}
          />
          <OpenVocabField
            label={t_i18n('Request for information type')}
            type="request_for_information_types_ov"
            name="information_types"
            multiple
            onChange={setFieldValue}
            containerStyle={fieldSpacingContainerStyle}
          />
          <OpenVocabField
            label={t_i18n('Severity')}
            type="case_severity_ov"
            name="severity"
            onChange={(name, value) => setFieldValue(name, value)}
            containerStyle={fieldSpacingContainerStyle}
          />
          <OpenVocabField
            label={t_i18n('Priority')}
            type="case_priority_ov"
            name="priority"
            onChange={(name, value) => setFieldValue(name, value)}
            containerStyle={fieldSpacingContainerStyle}
          />
          <CaseTemplateField
            onChange={setFieldValue}
            containerStyle={fieldSpacingContainerStyle}
          />
          <ConfidenceField
            entityType="Case-Rfi"
            containerStyle={fieldSpacingContainerStyle}
          />
          <Field
            component={MarkdownField}
            name="description"
            label={t_i18n('Description')}
            fullWidth={true}
            multiline={true}
            rows="4"
            style={fieldSpacingContainerStyle}
            askAi={true}
          />
          <Field
            component={RichTextField}
            name="content"
            label={t_i18n('Content')}
            fullWidth={true}
            askAi={true}
            style={{
              ...fieldSpacingContainerStyle,
              minHeight: 200,
              height: 200,
            }}
          />
          <ObjectAssigneeField
            name="objectAssignee"
            style={fieldSpacingContainerStyle}
          />
          <ObjectParticipantField
            name="objectParticipant"
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
          <div className={classes.buttons}>
            <Button
              variant="contained"
              onClick={handleReset}
              disabled={isSubmitting}
              classes={{ root: classes.button }}
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
            {values.content.length > 0 && (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setMapAfter(true);
                  submitForm();
                }}
                disabled={isSubmitting}
                classes={{ root: classes.button }}
              >
                {t_i18n('Create and map')}
              </Button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

const CaseRfiCreation = ({
  paginationOptions,
}: {
  paginationOptions: CaseRfiLinesCasesPaginationQuery$variables;
}) => {
  const { t_i18n } = useFormatter();
  const updater = (store: RecordSourceSelectorProxy) => insertNode(
    store,
    'Pagination_case_caseRfis',
    paginationOptions,
    'caseRfiAdd',
  );

  return (
    <Drawer
      title={t_i18n('Create a request for information')}
      variant={DrawerVariant.create}
    >
      <CaseRfiCreationForm updater={updater} />
    </Drawer>
  );
};

export default CaseRfiCreation;
