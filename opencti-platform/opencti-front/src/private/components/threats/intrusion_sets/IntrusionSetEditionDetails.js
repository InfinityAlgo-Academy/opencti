import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Field, Form, Formik } from 'formik';
import * as R from 'ramda';
import * as Yup from 'yup';
import { useFormatter } from '../../../../components/i18n';
import { SubscriptionFocus } from '../../../../components/Subscription';
import { commitMutation } from '../../../../relay/environment';
import { buildDate, parse } from '../../../../utils/Time';
import OpenVocabField from '../../common/form/OpenVocabField';
import TextField from '../../../../components/TextField';
import CommitMessage from '../../common/form/CommitMessage';
import { adaptFieldValue } from '../../../../utils/String';
import DateTimePickerField from '../../../../components/DateTimePickerField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';

const intrusionSetMutationFieldPatch = graphql`
  mutation IntrusionSetEditionDetailsFieldPatchMutation(
    $id: ID!
    $input: [EditInput]!
    $commitMessage: String
    $references: [String]
  ) {
    intrusionSetEdit(id: $id) {
      fieldPatch(
        input: $input
        commitMessage: $commitMessage
        references: $references
      ) {
        ...IntrusionSetEditionDetails_intrusionSet
        ...IntrusionSet_intrusionSet
      }
    }
  }
`;

const intrusionSetEditionDetailsFocus = graphql`
  mutation IntrusionSetEditionDetailsFocusMutation(
    $id: ID!
    $input: EditContext!
  ) {
    intrusionSetEdit(id: $id) {
      contextPatch(input: $input) {
        id
      }
    }
  }
`;

const intrusionSetValidation = (t) => Yup.object().shape({
  first_seen: Yup.date()
    .nullable()
    .typeError(t('The value must be a datetime (yyyy-MM-dd hh:mm (a|p)m)')),
  last_seen: Yup.date()
    .nullable()
    .typeError(t('The value must be a datetime (yyyy-MM-dd hh:mm (a|p)m)')),
  resource_level: Yup.string().nullable(),
  primary_motivation: Yup.string().nullable(),
  secondary_motivations: Yup.array().nullable(),
  goals: Yup.string().nullable(),
  references: Yup.array(),
});

const IntrusionSetEditionDetailsComponent = (props) => {
  const { intrusionSet, enableReferences, context, handleClose } = props;
  const { t } = useFormatter();

  const handleChangeFocus = (name) => commitMutation({
    mutation: intrusionSetEditionDetailsFocus,
    variables: {
      id: intrusionSet.id,
      input: {
        focusOn: name,
      },
    },
  });

  const onSubmit = (values, { setSubmitting }) => {
    const commitMessage = values.message;
    const references = R.pluck('value', values.references || []);
    const inputValues = R.pipe(
      R.dissoc('message'),
      R.dissoc('references'),
      R.assoc(
        'first_seen',
        values.first_seen ? parse(values.first_seen).format() : null,
      ),
      R.assoc(
        'last_seen',
        values.last_seen ? parse(values.last_seen).format() : null,
      ),
      R.assoc(
        'goals',
        values.goals && values.goals.length ? R.split('\n', values.goals) : [],
      ),
      R.toPairs,
      R.map((n) => ({
        key: n[0],
        value: adaptFieldValue(n[1]),
      })),
    )(values);
    commitMutation({
      mutation: intrusionSetMutationFieldPatch,
      variables: {
        id: intrusionSet.id,
        input: inputValues,
        commitMessage:
          commitMessage && commitMessage.length > 0 ? commitMessage : null,
        references,
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        handleClose();
      },
    });
  };

  const handleSubmitField = (name, value) => {
    if (!enableReferences) {
      let finalValue = value;
      if (name === 'goals') {
        finalValue = value && value.length > 0 ? R.split('\n', value) : [];
      }
      intrusionSetValidation(t)
        .validateAt(name, { [name]: value })
        .then(() => {
          commitMutation({
            mutation: intrusionSetMutationFieldPatch,
            variables: {
              id: intrusionSet.id,
              input: { key: name, value: finalValue || '' },
            },
          });
        })
        .catch(() => false);
    }
  };

  const initialValues = R.pipe(
    R.assoc('first_seen', buildDate(intrusionSet.first_seen)),
    R.assoc('last_seen', buildDate(intrusionSet.last_seen)),
    R.assoc(
      'secondary_motivations',
      intrusionSet.secondary_motivations
        ? intrusionSet.secondary_motivations
        : [],
    ),
    R.assoc('goals', R.join('\n', intrusionSet.goals ? intrusionSet.goals : [])),
    R.pick([
      'first_seen',
      'last_seen',
      'resource_level',
      'primary_motivation',
      'secondary_motivations',
      'goals',
    ]),
  )(intrusionSet);
  return (
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={intrusionSetValidation(t)}
        onSubmit={onSubmit}
      >
        {({
          submitForm,
          isSubmitting,
          setFieldValue,
          values,
          isValid,
          dirty,
        }) => (
          <Form style={{ margin: '20px 0 20px 0' }}>
            <Field
              component={DateTimePickerField}
              name="first_seen"
              onFocus={handleChangeFocus}
              onSubmit={handleSubmitField}
              TextFieldProps={{
                label: t('First seen'),
                variant: 'standard',
                fullWidth: true,
                helperText: (
                  <SubscriptionFocus context={context} fieldName="first_seen" />
                ),
              }}
            />
            <Field
              component={DateTimePickerField}
              name="last_seen"
              onFocus={handleChangeFocus}
              onSubmit={handleSubmitField}
              TextFieldProps={{
                label: t('Last seen'),
                variant: 'standard',
                fullWidth: true,
                style: { marginTop: 20 },
                helperText: (
                  <SubscriptionFocus context={context} fieldName="last_seen" />
                ),
              }}
            />
            <OpenVocabField
              label={t('Resource level')}
              type="attack-resource-level-ov"
              name="resource_level"
              onFocus={handleChangeFocus}
              onChange={(name, value) => setFieldValue(name, value)}
              onSubmit={handleSubmitField}
              containerStyle={fieldSpacingContainerStyle}
              variant="edit"
              multiple={false}
              editContext={context}
            />
            <OpenVocabField
              label={t('Primary motivation')}
              type="attack-motivation-ov"
              name="primary_motivation"
              onFocus={handleChangeFocus}
              onChange={(name, value) => setFieldValue(name, value)}
              onSubmit={handleSubmitField}
              containerStyle={fieldSpacingContainerStyle}
              variant="edit"
              multiple={false}
              editContext={context}
            />
            <OpenVocabField
              label={t('Secondary motivations')}
              type="attack-motivation-ov"
              name="secondary_motivations"
              onFocus={handleChangeFocus}
              onSubmit={handleSubmitField}
              onChange={(name, value) => setFieldValue(name, value)}
              containerStyle={fieldSpacingContainerStyle}
              variant="edit"
              multiple={true}
              editContext={context}
            />
            <Field
              component={TextField}
              variant="standard"
              name="goals"
              label={t('Goals (1 / line)')}
              fullWidth={true}
              multiline={true}
              rows="4"
              style={{ marginTop: 20 }}
              onFocus={handleChangeFocus}
              onSubmit={handleSubmitField}
              helperText={
                <SubscriptionFocus context={context} fieldName="goals" />
              }
            />
            {enableReferences && isValid && dirty && (
              <CommitMessage
                submitForm={submitForm}
                disabled={isSubmitting}
                setFieldValue={setFieldValue}open={false}
                values={values.references}
                id={intrusionSet.id}
              />
            )}
          </Form>
        )}
      </Formik>
  );
};

export default createFragmentContainer(IntrusionSetEditionDetailsComponent, {
  intrusionSet: graphql`
      fragment IntrusionSetEditionDetails_intrusionSet on IntrusionSet {
        id
        first_seen
        last_seen
        resource_level
        primary_motivation
        secondary_motivations
        goals
      }
    `,
});
