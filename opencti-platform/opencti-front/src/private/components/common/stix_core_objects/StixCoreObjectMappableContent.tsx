import React, { FunctionComponent, useState } from 'react';
import Paper from '@mui/material/Paper';
import { Field, Form, Formik } from 'formik';
import CommitMessage from '@components/common/form/CommitMessage';
import { StixCoreObjectContent_stixCoreObject$data } from '@components/common/stix_core_objects/__generated__/StixCoreObjectContent_stixCoreObject.graphql';
import * as Yup from 'yup';
import { graphql } from 'react-relay';
import { FormikConfig } from 'formik/dist/types';
import { ExternalReferencesValues } from '@components/common/form/ExternalReferencesField';
import { StixCoreObjectMappableContentFieldPatchMutation } from '@components/common/stix_core_objects/__generated__/StixCoreObjectMappableContentFieldPatchMutation.graphql';
import MarkdownField from '../../../../components/fields/MarkdownField';
import { SubscriptionFocus } from '../../../../components/Subscription';
import RichTextField from '../../../../components/fields/RichTextField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import { useFormatter } from '../../../../components/i18n';
import { useIsEnforceReference, useSchemaEditionValidation } from '../../../../utils/hooks/useEntitySettings';
import useApiMutation from '../../../../utils/hooks/useApiMutation';

export const stixCoreObjectMappableContentFieldPatchMutation = graphql`
  mutation StixCoreObjectMappableContentFieldPatchMutation(
    $id: ID!
    $input: [EditInput]!
    $commitMessage: String
    $references: [String]
  ) {
    stixDomainObjectEdit(id: $id) {
      fieldPatch(input: $input, commitMessage: $commitMessage, references: $references) {
        ...StixCoreObjectContent_stixCoreObject
      }
    }
  }
`;

interface StixCoreObjectMappableContentProps {
  containerData: StixCoreObjectContent_stixCoreObject$data;
  handleDownloadPdf?: () => void;
  handleTextSelection?: (t: string) => void;
  askAi: boolean;
  editionMode: boolean;
  mappedStrings?: string[];
}

interface StixCoreObjectMappableContentValues {
  content: string
  description: string
  message?: string | null
  references?: ExternalReferencesValues
}

const StixCoreObjectMappableContent: FunctionComponent<StixCoreObjectMappableContentProps> = ({
  containerData,
  handleDownloadPdf,
  handleTextSelection,
  askAi,
  editionMode,
  mappedStrings = [],
}) => {
  const { t_i18n } = useFormatter();
  let { description, contentField } = containerData;
  const [selectedTab, setSelectedTab] = useState(editionMode ? 'write' : 'preview');
  const basicShape = {
    content: Yup.string().nullable(),
    description: Yup.string().nullable(),
  };
  let validator = null;
  if (containerData.entity_type === 'Report') {
    validator = useSchemaEditionValidation('Report', basicShape);
  } else if (containerData.entity_type === 'Grouping') {
    validator = useSchemaEditionValidation('Grouping', basicShape);
  } else if (containerData.entity_type === 'Case-Incident') {
    validator = useSchemaEditionValidation('Case-Incident', basicShape);
  } else if (containerData.entity_type === 'Case-Rfi') {
    validator = useSchemaEditionValidation('Case-Rfi', basicShape);
  } else if (containerData.entity_type === 'Case-Rft') {
    validator = useSchemaEditionValidation('Case-Rft', basicShape);
  }

  const enableReferences = useIsEnforceReference(containerData.entity_type);
  const { innerHeight } = window;
  const editorAdjustedHeight = editionMode ? 580 : 620;
  const enrichedEditorHeight = innerHeight - editorAdjustedHeight;

  const [commit] = useApiMutation<StixCoreObjectMappableContentFieldPatchMutation>(stixCoreObjectMappableContentFieldPatchMutation);

  const handleChangeSelectedTab = (mode: string) => {
    if (editionMode) {
      setSelectedTab(mode);
    }
  };

  // onSubmit will be called when a submit button is called, thus only
  // when enforced references option is set (i.e enableReferences==true)
  const onSubmit: FormikConfig<StixCoreObjectMappableContentValues>['onSubmit'] = (values, { setSubmitting }) => {
    const commitReferences = (values.references ?? []).map(({ value }) => value);
    const { id } = containerData;
    const inputValues = [{ key: 'content', value: [values.content] }, { key: 'description', value: [values.description] }];
    // Currently, only containers have a content available, so this mutation targets SDOs only. If content is added to all Stix Core Objects,
    // this mutation will need to be updated to a stixCoreObjectEdit instead of a stixDomainObjectEdit

    commit({
      variables: {
        id,
        input: inputValues,
        commitMessage: values.message,
        references: commitReferences,
      },
      onCompleted: () => {
        setSubmitting(false);
      },
    });
  };

  const handleSubmitField = (
    name: string,
    value: string,
  ) => {
    if (!editionMode) return;

    const { id } = containerData;
    // we try to update every time a field is changed (e.g. lose focus)
    // with enforced references option for this entity, submit is done at the
    // end with a button in <CommitMessage />
    if (!enableReferences) {
      validator?.validateAt(name, { [name]: value })
        .then(() => {
          commit({
            variables: {
              id,
              input: [{ key: name, value: [value || ''] }],
              commitMessage: '',
              references: [],
            },
          });
        })
        .catch(() => false);
    }
  };

  const matchCase = (text: string, pattern: string) => {
    let result = '';
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < text.length; i++) {
      const c = text.charAt(i);
      const p = pattern.charCodeAt(i);
      if (p >= 65 && p < 65 + 26) {
        result += c.toUpperCase();
      } else {
        result += c.toLowerCase();
      }
    }
    return result;
  };

  for (const mappedString of mappedStrings) {
    const escapedMappedString = mappedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const descriptionRegex = new RegExp(escapedMappedString, 'ig');
    description = (description || '').replace(
      descriptionRegex,
      (match) => `==${matchCase(escapedMappedString, match)}==`,
    );
    const contentRegex = new RegExp(escapedMappedString, 'ig');
    contentField = (contentField || '').replace(
      contentRegex,
      (match) => `<mark class="marker-yellow">${matchCase(escapedMappedString, match)}</mark>`,
    );
  }

  const initialValues = {
    description: description || '',
    content: contentField || '',
  };

  return (
    <Paper
      sx={{
        height: '100%',
        minHeight: '100%',
        padding: '15px',
        borderRadius: 4 }}
      variant="outlined"
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validator}
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
          <Form style={{ margin: 0 }}>
            <Field
              component={MarkdownField}
              name="description"
              label={t_i18n('Description')}
              fullWidth
              multiline
              rows="4"
              onSubmit={handleSubmitField}
              onSelect={handleTextSelection}
              disabled={!editionMode}
              helperText={
                <SubscriptionFocus
                  context={containerData.editContext}
                  fieldName="description"
                />
              }
              controlledSelectedTab={selectedTab}
              controlledSetSelectTab={handleChangeSelectedTab}
            />
            <Field
              component={RichTextField}
              name="content"
              label={t_i18n('Content')}
              fullWidth
              onSubmit={handleSubmitField}
              onSelect={handleTextSelection}
              askAi={askAi}
              disabled={!editionMode}
              handleDownloadPdf={handleDownloadPdf}
              style={{
                ...fieldSpacingContainerStyle,
                minHeight: enrichedEditorHeight,
                height: enrichedEditorHeight }}
              helperText={
                <SubscriptionFocus
                  context={containerData.editContext}
                  fieldName="content"
                />
              }
            />
            {enableReferences && (
            <CommitMessage
              submitForm={submitForm}
              disabled={isSubmitting || !isValid || !dirty}
              setFieldValue={setFieldValue}
              values={values.references}
              id={containerData.id}
              open={false}
            />
            )}
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default StixCoreObjectMappableContent;
