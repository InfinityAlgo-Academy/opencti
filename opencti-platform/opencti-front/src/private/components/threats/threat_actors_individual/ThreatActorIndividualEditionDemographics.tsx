import { Field, Form, Formik } from 'formik';
import { graphql, useFragment } from 'react-relay';
import * as Yup from 'yup';
import CountryField from '@components/common/form/CountryField';
import { Option } from '@components/common/form/ReferenceField';
import { useFormatter } from '../../../../components/i18n';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import { commitMutation, defaultCommitMutation } from '../../../../relay/environment';
import DatePickerField from '../../../../components/DatePickerField';
import { SubscriptionFocus } from '../../../../components/Subscription';
import MarkdownField from '../../../../components/MarkdownField';
import CommitMessage from '../../common/form/CommitMessage';
import { buildDate } from '../../../../utils/Time';
import { ThreatActorIndividualEditionDemographics_ThreatActorIndividual$key } from './__generated__/ThreatActorIndividualEditionDemographics_ThreatActorIndividual.graphql';
import { EditOperation } from './__generated__/ThreatActorIndividualEditionDetailsFieldPatchMutation.graphql';
import OpenVocabField from '../../common/form/OpenVocabField';
import { isEmptyField } from '../../../../utils/utils';

const threatActorIndividualEditionDemographicsFocus = graphql`
  mutation ThreatActorIndividualEditionDemographicsFocusMutation(
    $id: ID!
    $input: EditContext!
  ) {
    threatActorIndividualContextPatch(id: $id, input: $input) {
      id
    }
  }
`;

const threatActorIndividualMutationFieldPatch = graphql`
  mutation ThreatActorIndividualEditionDemographicsFieldPatchMutation(
    $id: ID!
    $input: [EditInput]!
  ) {
    threatActorIndividualFieldPatch(id: $id, input: $input) {
      ...ThreatActorIndividualEditionDemographics_ThreatActorIndividual
      ...ThreatActorIndividual_ThreatActorIndividual
    }
  }
`;

const threatActorIndividualEditionDemographicsFragment = graphql`
  fragment ThreatActorIndividualEditionDemographics_ThreatActorIndividual on ThreatActorIndividual {
    id
    date_of_birth
    gender
    marital_status
    job_title
    bornIn {
      id
      name
    }
    ethnicity {
      id
      name
    }
  }
`;

const threatActorIndividualValidation = (t: (s: string) => string) => Yup.object().shape({
  date_of_birth: Yup.date()
    .nullable()
    .typeError(t('The value must be a date (yyyy-MM-dd)')),
  gender: Yup.string()
    .nullable()
    .typeError(t('The value must be a string')),
  marital_status: Yup.string()
    .nullable()
    .typeError(t('The value must be a string')),
  job_title: Yup.string()
    .nullable()
    .max(250, t('The value is too long')),
  bornIn: Yup.object().nullable(),
  ethnicity: Yup.object().nullable(),
});

interface ThreatActorIndividualEditionDemographicsComponentProps {
  threatActorIndividualRef: ThreatActorIndividualEditionDemographics_ThreatActorIndividual$key,
  enableReferences: boolean,
  context: ReadonlyArray<{
    readonly focusOn: string | null
    readonly name: string
  }> | null,
}

const ThreatActorIndividualEditionDemographicsComponent = ({
  threatActorIndividualRef,
  enableReferences,
  context,
}: ThreatActorIndividualEditionDemographicsComponentProps) => {
  const { t } = useFormatter();
  const threatActorIndividual = useFragment(threatActorIndividualEditionDemographicsFragment, threatActorIndividualRef);

  const handleChangeFocus = (name: string) => commitMutation({
    ...defaultCommitMutation,
    mutation: threatActorIndividualEditionDemographicsFocus,
    variables: {
      id: threatActorIndividual.id,
      input: {
        focusOn: name,
      },
    },
  });

  const handleSubmitField = (
    name: string,
    value: string | string[] | Option | null,
    operation: EditOperation = 'replace',
  ) => {
    threatActorIndividualValidation(t)
      .validateAt(name, { [name]: value })
      .then(() => {
        let finalValue = value;
        if (name === 'bornIn' || name === 'ethnicity') {
          finalValue = (value as Option)?.value ?? '';
        }
        commitMutation({
          ...defaultCommitMutation,
          mutation: threatActorIndividualMutationFieldPatch,
          variables: {
            id: threatActorIndividual.id,
            input: {
              key: name,
              value: Array.isArray(finalValue) ? finalValue : [finalValue],
              operation,
            },
          },
        });
      })
      .catch(() => false);
  };

  const initialValues = {
    date_of_birth: buildDate(threatActorIndividual.date_of_birth),
    gender: threatActorIndividual.gender,
    marital_status: threatActorIndividual.marital_status,
    job_title: threatActorIndividual.job_title,
    bornIn: { label: threatActorIndividual.bornIn?.name ?? '', value: threatActorIndividual.bornIn?.id ?? '' },
    ethnicity: { label: threatActorIndividual.ethnicity?.name ?? '', value: threatActorIndividual.ethnicity?.id ?? '' },
  };

  return (
    <div>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={threatActorIndividualValidation(t)}
        onSubmit={() => {}}
      >
        {({
          submitForm,
          isSubmitting,
          setFieldValue,
          isValid,
          dirty,
        }) => (
          <div>
            <Form style={{ margin: '20px 0 20px 0' }}>
              <CountryField
                id="PlaceOfBirth"
                name="bornIn"
                label={t('Place of Birth')}
                containerStyle={fieldSpacingContainerStyle}
                onChange={(name, value) => {
                  setFieldValue(name, value);
                  handleSubmitField(name, isEmptyField(value) ? null : value);
                }}
              />
              <CountryField
                id="Ethnicity"
                name="ethnicity"
                label={t('Ethnicity')}
                containerStyle={fieldSpacingContainerStyle}
                onChange={(name, value) => {
                  setFieldValue(name, value);
                  handleSubmitField(name, isEmptyField(value) ? null : value);
                }}
              />
              <Field
                component={DatePickerField}
                name="date_of_birth"
                id="DateOfBirth"
                onFocus={handleChangeFocus}
                onSubmit={handleSubmitField}
                TextFieldProps={{
                  label: t('Date of Birth'),
                  variant: 'standard',
                  fullWidth: true,
                  style: { marginTop: 20 },
                  helperText: (
                    <SubscriptionFocus
                      context={context}
                      fieldName="date_of_birth"
                    />
                  ),
                }}
              />
              <OpenVocabField
                name="marital_status"
                label={t('Marital Status')}
                type="marital_status_ov"
                variant="edit"
                onChange={(name, value) => setFieldValue(name, value)}
                onFocus={handleChangeFocus}
                onSubmit={handleSubmitField}
                containerStyle={fieldSpacingContainerStyle}
                multiple={false}
                editContext={context}
              />
              <OpenVocabField
                name="gender"
                label={t('Gender')}
                type="gender_ov"
                variant="edit"
                onChange={(name, value) => setFieldValue(name, value)}
                onFocus={handleChangeFocus}
                onSubmit={handleSubmitField}
                containerStyle={fieldSpacingContainerStyle}
                multiple={false}
                editContext={context}
              />
              <Field
                component={MarkdownField}
                name="job_title"
                id="job_title"
                label={t('Job Title')}
                fullWidth={true}
                multiline={false}
                rows="1"
                style={{ marginTop: 20 }}
                onFocus={handleChangeFocus}
                onSubmit={handleSubmitField}
                helperText={
                  <SubscriptionFocus context={context} fieldName="Job Title" />
                }
              />
              {enableReferences && (
                <CommitMessage
                  submitForm={submitForm}
                  disabled={isSubmitting || !isValid || !dirty}
                  setFieldValue={setFieldValue}
                  open={false}
                  values={[]}
                  id={threatActorIndividual.id}
                />
              )}
            </Form>
          </div>
        )}
      </Formik>
    </div>
  );
};

export default ThreatActorIndividualEditionDemographicsComponent;
