/* eslint-disable */
/* refactor */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import graphql from 'babel-plugin-relay/macro';
import { commitMutation as CM, createFragmentContainer } from 'react-relay';
import { Formik, Field, Form } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import {
  assoc,
  compose,
  map,
  pathOr,
  pipe,
  pick,
  difference,
  head,
} from 'ramda';
import * as Yup from 'yup';
import Button from '@material-ui/core/Button';
import environmentDarkLight from '../../../../relay/environmentDarkLight';
import { commitMutation } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import MarkDownField from '../../../../components/MarkDownField';
import StixCoreObjectLabelsView from '../../common/stix_core_objects/StixCoreObjectLabelsView';
import { SubscriptionFocus } from '../../../../components/Subscription';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import ConfidenceField from '../../common/form/ConfidenceField';
import DatePickerField from '../../../../components/DatePickerField';
import TextField from '../../../../components/TextField';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'hidden',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: '30px 30px 30px 30px',
  },
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  importButton: {
    position: 'absolute',
    top: 30,
    right: 30,
  },
  buttonPopover: {
    textTransform: 'capitalize',
  },
});

export const noteMutationFieldPatch = graphql`
  mutation NoteEditionOverviewFieldPatchMutation(
    $id: ID!
    $input: [EditInput]!
  ) {
    noteEdit(id: $id) {
      fieldPatch(input: $input) {
        ...NoteEditionOverview_note
        ...Note_note
      }
    }
  }
`;

export const noteEditionOverviewFocus = graphql`
  mutation NoteEditionOverviewFocusMutation($id: ID!, $input: EditContext!) {
    noteEdit(id: $id) {
      contextPatch(input: $input) {
        id
      }
    }
  }
`;

const noteMutationRelationAdd = graphql`
  mutation NoteEditionOverviewRelationAddMutation(
    $id: ID!
    $input: StixMetaRelationshipAddInput
  ) {
    noteEdit(id: $id) {
      relationAdd(input: $input) {
        from {
          ...NoteEditionOverview_note
        }
      }
    }
  }
`;

const noteMutationRelationDelete = graphql`
  mutation NoteEditionOverviewRelationDeleteMutation(
    $id: ID!
    $toId: String!
    $relationship_type: String!
  ) {
    noteEdit(id: $id) {
      relationDelete(toId: $toId, relationship_type: $relationship_type) {
        ...NoteEditionOverview_note
      }
    }
  }
`;

const noteValidation = (t) => Yup.object().shape({
  attribute_abstract: Yup.string(),
  content: Yup.string().required(t('This field is required')),
  // created: Yup.date()
  //   .typeError(t('The value must be a date (YYYY-MM-DD)'))
  //   .required(t('This field is required')),
  // confidence: Yup.number(),
});

class NoteEditionOverviewComponent extends Component {
  handleChangeFocus(name) {
    commitMutation({
      mutation: noteEditionOverviewFocus,
      variables: {
        id: this.props.note.id,
        input: {
          focusOn: name,
        },
      },
    });
  }

  handleSubmitField(name, value) {
    noteValidation(this.props.t)
      .validateAt(name, { [name]: value })
      .then(() => {
        commitMutation({
          mutation: noteMutationFieldPatch,
          variables: { id: this.props.note.id, input: { key: name, value } },
        });
      })
      .catch(() => false);
  }

  onSubmit(values, { setSubmitting, resetForm }) {
    CM(environmentDarkLight, {
      mutation: noteMutationFieldPatch,
      variables: {
        id: this.props.note.id,
        input: [
          { key: 'content', value: values.content },
          // { key: 'description', value: values.description },
        ],
      },
      setSubmitting,
      onCompleted: (response) => {
        setSubmitting(false);
        resetForm();
        this.props.handleClose();
      },
      onError: (err) => console.log('NoteEditionDarkLightMutationError', err),
    });
  }

  onReset() {
    this.props.handleClose();
  }

  // handleChangeCreatedBy(name, value) {
  //   commitMutation({
  //     mutation: noteMutationFieldPatch,
  //     variables: {
  //       id: this.props.note.id,
  //       input: { key: 'createdBy', value: value.value || '' },
  //     },
  //   });
  // }

  // handleChangeObjectMarking(name, values) {
  //   const { note } = this.props;
  //   const currentMarkingDefinitions = pipe(
  //     pathOr([], ['objectMarking', 'edges']),
  //     map((n) => ({
  //       label: n.node.definition,
  //       value: n.node.id,
  //     })),
  //   )(note);

  //   const added = difference(values, currentMarkingDefinitions);
  //   const removed = difference(currentMarkingDefinitions, values);

  //   if (added.length > 0) {
  //     commitMutation({
  //       mutation: noteMutationRelationAdd,
  //       variables: {
  //         id: this.props.note.id,
  //         input: {
  //           toId: head(added).value,
  //           relationship_type: 'object-marking',
  //         },
  //       },
  //     });
  //   }

  //   if (removed.length > 0) {
  //     commitMutation({
  //       mutation: noteMutationRelationDelete,
  //       variables: {
  //         id: this.props.note.id,
  //         toId: head(removed).value,
  //         relationship_type: 'object-marking',
  //       },
  //     });
  //   }
  // }

  render() {
    const {
      t,
      note,
      classes,
      context,
    } = this.props;
    const createdBy = pathOr(null, ['createdBy', 'name'], note) === null
      ? ''
      : {
        label: pathOr(null, ['createdBy', 'name'], note),
        value: pathOr(null, ['createdBy', 'id'], note),
      };
    const objectMarking = pipe(
      pathOr([], ['objectMarking', 'edges']),
      map((n) => ({
        label: n.node.definition,
        value: n.node.id,
      })),
    )(note);
    const initialValues = pipe(
      assoc('createdBy', createdBy),
      assoc('objectMarking', objectMarking),
      pick([
        'attribute_abstract',
        'created',
        'content',
        'confidence',
        'createdBy',
        'objectMarking',
      ]),
    )(note);
    return (
      <Formik
        // enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={noteValidation(t)}
        onSubmit={this.onSubmit.bind(this)}
        onReset={this.onReset.bind(this)}
      >
        {({
          submitForm,
          handleReset,
          setFieldValue,
          isSubmitting,
        }) => (
          <div>
            <Form style={{ margin: '20px 0 20px 0' }}>
              {/* <Field
                component={DatePickerField}
                name="created"
                label={t('Date')}
                invalidDateMessage={t('The value must be a date (YYYY-MM-DD)')}
                fullWidth={true}
                onFocus={this.handleChangeFocus.bind(this)}
                onSubmit={this.handleSubmitField.bind(this)}
                helperText={
                  <SubscriptionFocus context={context} fieldName="created" />
                }
              />
              <Field
                component={TextField}
                name="attribute_abstract"
                label={t('Abstract')}
                fullWidth={true}
                style={{ marginTop: 20 }}
                onFocus={this.handleChangeFocus.bind(this)}
                onSubmit={this.handleSubmitField.bind(this)}
                helperText={
                  <SubscriptionFocus
                    context={context}
                    fieldName="attribute_abstract"
                  />
                }
              /> */}
              <Field
                component={MarkDownField}
                name="content"
                // label={t('Content')}
                fullWidth={true}
                multiline={true}
                rows="4"
                style={{ marginTop: 20 }}
                // onFocus={this.handleChangeFocus.bind(this)}
                // onSubmit={this.handleSubmitField.bind(this)}
                // helperText={
                //   <SubscriptionFocus context={context} fieldName="content" />
                // }
              />
              <StixCoreObjectLabelsView
                labels={note.objectLabel}
                id={note.id}
                marginTop={20}
              />
              <div style={{
                float: 'right',
                margin: '10px 0 30px 0',
              }}>
                <Button
                  onClick={handleReset}
                  disabled={isSubmitting}
                  variant="outlined"
                  size="small"
                  classes={{ root: classes.buttonPopover }}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  onClick={submitForm}
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  size="small"
                  style={{ marginLeft: '15px' }}
                  classes={{ root: classes.buttonPopover }}
                >
                  {t('Update')}
                </Button>
              </div>
              {/* <ConfidenceField
                name="confidence"
                onFocus={this.handleChangeFocus.bind(this)}
                onChange={this.handleSubmitField.bind(this)}
                label={t('Confidence')}
                fullWidth={true}
                containerstyle={{ width: '100%', marginTop: 20 }}
                editContext={context}
                variant="edit"
              />
              <CreatedByField
                name="createdBy"
                style={{ marginTop: 20, width: '100%' }}
                setFieldValue={setFieldValue}
                helpertext={
                  <SubscriptionFocus context={context} fieldName="createdBy" />
                }
                onChange={this.handleChangeCreatedBy.bind(this)}
              />
              <ObjectMarkingField
                name="objectMarking"
                style={{ marginTop: 20, width: '100%' }}
                helpertext={
                  <SubscriptionFocus
                    context={context}
                    fieldname="objectMarking"
                  />
                }
                onChange={this.handleChangeObjectMarking.bind(this)}
              /> */}
            </Form>
          </div>
        )}
      </Formik>
    );
  }
}

NoteEditionOverviewComponent.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  note: PropTypes.object,
  context: PropTypes.array,
};

const NoteEditionOverview = createFragmentContainer(
  NoteEditionOverviewComponent,
  {
    note: graphql`
      fragment NoteEditionOverview_note on Note {
        id
        attribute_abstract
        content
        confidence
        createdBy {
          ... on Identity {
            id
            name
            entity_type
          }
        }
        objectLabel {
          edges {
            node {
              id
              value
              color
            }
          }
        }
        objectMarking {
          edges {
            node {
              id
              definition
              definition_type
            }
          }
        }
      }
    `,
  },
);

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(NoteEditionOverview);
