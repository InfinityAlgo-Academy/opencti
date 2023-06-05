import React, { useEffect, useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import 'ckeditor5-custom-build/build/translations/fr';
import 'ckeditor5-custom-build/build/translations/zh-cn';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Subject, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { useFormatter } from '../../../../components/i18n';
import {
  useIsEnforceReference,
  useSchemaEditionValidation,
} from '../../../../utils/hooks/useEntitySettings';
import { SubscriptionFocus } from '../../../../components/Subscription';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import MarkDownField from '../../../../components/MarkDownField';
import CommitMessage from '../form/CommitMessage';
import RichTextField from '../../../../components/RichTextField';
import useFormEditor from '../../../../utils/hooks/useFormEditor';
import ContainerStixCoreObjectsMapping from './ContainerStixCoreObjectsMapping';
import { decodeMappingData, encodeMappingData } from '../../../../utils/Graph';

const OPEN$ = new Subject().pipe(debounce(() => timer(1500)));

export const contentMutationFieldPatch = graphql`
  mutation ContainerContentFieldPatchMutation(
    $id: ID!
    $input: [EditInput]!
    $commitMessage: String
    $references: [String]
  ) {
    stixDomainObjectEdit(id: $id) {
      fieldPatch(
        input: $input
        commitMessage: $commitMessage
        references: $references
      ) {
        ...ContainerContent_container
      }
    }
  }
`;

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
  },
  gridContainer: {
    marginBottom: 20,
  },
  editorContainer: {
    height: '100%',
    minHeight: '100%',
    margin: 0,
    padding: 0,
  },
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '15px',
    borderRadius: 6,
  },
}));

const ContainerContentComponent = ({ containerData }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const [open, setOpen] = useState(false);
  const [selectedText, setSelectedText] = useState(null);
  useEffect(() => {
    const subscription = OPEN$.subscribe({
      next: () => {
        setOpen(true);
      },
    });
    return function cleanup() {
      subscription.unsubscribe();
    };
  }, []);
  const enableReferences = useIsEnforceReference(containerData.entity_type);
  const { innerHeight } = window;
  const enrichedEditorHeight = innerHeight - 540;
  const listHeight = innerHeight - 340;
  const queries = {
    fieldPatch: contentMutationFieldPatch,
  };
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
  const editor = useFormEditor(
    containerData,
    enableReferences,
    queries,
    validator,
  );
  const onSubmit = (values) => {
    const { message, references, ...otherValues } = values;
    const commitMessage = message ?? '';
    const commitReferences = (references ?? []).map(({ value }) => value);
    editor.fieldPatch({
      variables: {
        id: containerData.id,
        input: otherValues,
        commitMessage:
          commitMessage && commitMessage.length > 0 ? commitMessage : null,
        references: commitReferences,
      },
    });
  };
  const handleSubmitField = (name, value) => {
    if (!enableReferences) {
      validator
        .validateAt(name, { [name]: value })
        .then(() => {
          editor.fieldPatch({
            variables: {
              id: containerData.id,
              input: { key: name, value: value || '' },
            },
          });
        })
        .catch(() => false);
    }
  };
  const handleTextSelection = (text) => {
    if (selectedText === 'CLOSED') {
      setSelectedText(text);
    } else {
      OPEN$.next({ action: 'OpenMapping' });
      setSelectedText(text);
    }
  };
  const onAdd = (stixCoreObject) => {
    const { content_mapping } = containerData;
    const contentMappingData = decodeMappingData(content_mapping);
    const newMappingData = {
      ...contentMappingData,
      [selectedText]: stixCoreObject.id,
    };
    editor.fieldPatch({
      variables: {
        id: containerData.id,
        input: {
          key: 'content_mapping',
          value: encodeMappingData(newMappingData),
        },
      },
      onCompleted: () => {
        setOpen(false);
        setSelectedText('CLOSED');
      },
    });
  };
  const { content_mapping } = containerData;
  const contentMappingData = decodeMappingData(content_mapping);
  const mappedStrings = Object.keys(contentMappingData);
  let { description, content } = containerData;
  for (const mappedString of mappedStrings) {
    description = description.replaceAll(mappedString, `==${mappedString}==`);
    content = content.replaceAll(mappedString, `<mark class="marker-yellow">${mappedString}</mark>`);
  }
  const initialValues = {
    description,
    content,
  };
  return (
    <div className={classes.container}>
      <Grid
        container={true}
        spacing={3}
        classes={{ container: classes.gridContainer }}
      >
        <Grid item={true} xs={6} style={{ marginTop: -15 }}>
          <Typography variant="h4" gutterBottom={true}>
            {t('Content')}
          </Typography>
          <Paper classes={{ root: classes.paper }} variant="outlined">
            <Formik
              enableReinitialize={true}
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
                <Form styke={{ margin: 0 }}>
                  <Field
                    component={MarkDownField}
                    name="description"
                    label={t('Description')}
                    fullWidth={true}
                    multiline={true}
                    rows="4"
                    onSubmit={handleSubmitField}
                    onSelect={handleTextSelection}
                    helperText={
                      <SubscriptionFocus
                        context={containerData.editContext}
                        fieldName="description"
                      />
                    }
                    disabled={true}
                  />
                  <Field
                    component={RichTextField}
                    name="content"
                    label={t('Content')}
                    fullWidth={true}
                    onSubmit={handleSubmitField}
                    onSelect={handleTextSelection}
                    style={{
                      ...fieldSpacingContainerStyle,
                      minHeight: enrichedEditorHeight,
                      height: enrichedEditorHeight,
                    }}
                    helperText={
                      <SubscriptionFocus
                        context={containerData.editContext}
                        fieldName="content"
                      />
                    }
                    disabled={true}
                  />
                  {enableReferences && (
                    <CommitMessage
                      submitForm={submitForm}
                      disabled={isSubmitting || !isValid || !dirty}
                      setFieldValue={setFieldValue}
                      open={false}
                      values={values.references}
                      id={containerData.id}
                    />
                  )}
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>
        <Grid item={true} xs={6} style={{ marginTop: -15 }}>
          <Typography variant="h4" gutterBottom={true}>
            {t('Mapping')}
          </Typography>
          <Paper classes={{ root: classes.paper }} variant="outlined">
            <ContainerStixCoreObjectsMapping
              container={containerData}
              height={listHeight}
              selectedText={selectedText}
              openDrawer={open}
              handleClose={() => {
                setOpen(false);
                setSelectedText('CLOSED');
              }}
              onAdd={onAdd}
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export const containerContentQuery = graphql`
  query ContainerContentQuery($id: String!) {
    container(id: $id) {
      ...ContainerContent_container
    }
  }
`;

const ContainerContent = createFragmentContainer(
  ContainerContentComponent,
  {
    containerData: graphql`
      fragment ContainerContent_container on Container {
        id
        entity_type
        confidence
        createdBy {
          ... on Identity {
            id
            name
            entity_type
          }
        }
        objectMarking {
          edges {
            node {
              id
              definition_type
              definition
              x_opencti_order
              x_opencti_color
            }
          }
        }
        ... on Report {
          description
          content
          content_mapping
          editContext {
            name
            focusOn
          }
        }
        ... on Case {
          description
          content
          content_mapping
          editContext {
            name
            focusOn
          }
        }
        ... on Grouping {
          description
          content
          content_mapping
          editContext {
            name
            focusOn
          }
        }
      }
    `,
  },
  containerContentQuery,
);

export default ContainerContent;
