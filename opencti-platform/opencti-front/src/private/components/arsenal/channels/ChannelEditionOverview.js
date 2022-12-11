import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay';
import { Field, Form, Formik } from 'formik';
import * as R from 'ramda';
import { assoc, compose, difference, head, map, pathOr, pick, pipe } from 'ramda';
import * as Yup from 'yup';
import inject18n from '../../../../components/i18n';
import TextField from '../../../../components/TextField';
import { SubscriptionFocus } from '../../../../components/Subscription';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import MarkDownField from '../../../../components/MarkDownField';
import CommitMessage from '../../common/form/CommitMessage';
import { adaptFieldValue } from '../../../../utils/String';
import StatusField from '../../common/form/StatusField';
import { convertCreatedBy, convertMarkings, convertStatus } from '../../../../utils/edition';
import { commitMutation, QueryRenderer } from '../../../../relay/environment';
import Loader from '../../../../components/Loader';
import { vocabulariesQuery } from '../../settings/attributes/VocabulariesLines';
import OpenVocabField from '../../common/form/OpenVocabField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';

const channelMutationFieldPatch = graphql`
  mutation ChannelEditionOverviewFieldPatchMutation(
    $id: ID!
    $input: [EditInput]!
    $commitMessage: String
    $references: [String]
  ) {
    channelFieldPatch(
      id: $id
      input: $input
      commitMessage: $commitMessage
      references: $references
    ) {
      ...ChannelEditionOverview_channel
      ...Channel_channel
    }
  }
`;

export const channelEditionOverviewFocus = graphql`
  mutation ChannelEditionOverviewFocusMutation($id: ID!, $input: EditContext!) {
    channelContextPatch(id: $id, input: $input) {
      id
    }
  }
`;

const channelMutationRelationAdd = graphql`
  mutation ChannelEditionOverviewRelationAddMutation(
    $id: ID!
    $input: StixMetaRelationshipAddInput!
  ) {
    channelRelationAdd(id: $id, input: $input) {
      from {
        ...ChannelEditionOverview_channel
      }
    }
  }
`;

const channelMutationRelationDelete = graphql`
  mutation ChannelEditionOverviewRelationDeleteMutation(
    $id: ID!
    $toId: StixRef!
    $relationship_type: String!
  ) {
    channelRelationDelete(
      id: $id
      toId: $toId
      relationship_type: $relationship_type
    ) {
      ...ChannelEditionOverview_channel
    }
  }
`;

const channelValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  description: Yup.string().nullable(),
  channel_types: Yup.array().required(t('This field is required')),
  references: Yup.array().required(t('This field is required')),
  x_opencti_workflow_id: Yup.object(),
});

class ChannelEditionOverviewComponent extends Component {
  handleChangeFocus(name) {
    commitMutation({
      mutation: channelEditionOverviewFocus,
      variables: {
        id: this.props.channel.id,
        input: {
          focusOn: name,
        },
      },
    });
  }

  onSubmit(values, { setSubmitting }) {
    const commitMessage = values.message;
    const references = R.pluck('value', values.references || []);
    const inputValues = R.pipe(
      R.dissoc('message'),
      R.dissoc('references'),
      R.assoc('createdBy', values.createdBy?.value),
      R.assoc('objectMarking', R.pluck('value', values.objectMarking)),
      R.assoc('channel_types', R.pluck('value', values.channel_types)),
      R.toPairs,
      R.map((n) => ({
        key: n[0],
        value: adaptFieldValue(n[1]),
      })),
    )(values);
    commitMutation({
      mutation: channelMutationFieldPatch,
      variables: {
        id: this.props.channel.id,
        input: inputValues,
        commitMessage:
          commitMessage && commitMessage.length > 0 ? commitMessage : null,
        references,
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        this.props.handleClose();
      },
    });
  }

  handleSubmitField(name, value) {
    let finalValue = value;
    if (name === 'x_opencti_workflow_id') {
      finalValue = value.value;
    }
    channelValidation(this.props.t)
      .validateAt(name, { [name]: value })
      .then(() => {
        commitMutation({
          mutation: channelMutationFieldPatch,
          variables: {
            id: this.props.channel.id,
            input: { key: name, value: finalValue },
          },
        });
      })
      .catch(() => false);
  }

  handleChangeCreatedBy(name, value) {
    if (!this.props.enableReferences) {
      commitMutation({
        mutation: channelMutationFieldPatch,
        variables: {
          id: this.props.channel.id,
          input: { key: 'createdBy', value: value.value || '' },
        },
      });
    }
  }

  handleChangeObjectMarking(name, values) {
    const { channel } = this.props;
    const currentMarkingDefinitions = pipe(
      pathOr([], ['objectMarking', 'edges']),
      map((n) => ({
        label: n.node.definition,
        value: n.node.id,
      })),
    )(channel);

    const added = difference(values, currentMarkingDefinitions);
    const removed = difference(currentMarkingDefinitions, values);

    if (added.length > 0) {
      commitMutation({
        mutation: channelMutationRelationAdd,
        variables: {
          id: this.props.channel.id,
          input: {
            toId: head(added).value,
            relationship_type: 'object-marking',
          },
        },
      });
    }

    if (removed.length > 0) {
      commitMutation({
        mutation: channelMutationRelationDelete,
        variables: {
          id: this.props.channel.id,
          toId: head(removed).value,
          relationship_type: 'object-marking',
        },
      });
    }
  }

  render() {
    const { t, channel, context, enableReferences } = this.props;
    const createdBy = convertCreatedBy(channel);
    const objectMarking = convertMarkings(channel);
    const status = convertStatus(t, channel);
    const initialValues = pipe(
      assoc('createdBy', createdBy),
      assoc('objectMarking', objectMarking),
      assoc('x_opencti_workflow_id', status),
      R.assoc(
        'channel_types',
        (channel.channel_types || []),
      ),
      pick([
        'name',
        'channel_types',
        'description',
        'createdBy',
        'objectMarking',
        'x_opencti_workflow_id',
      ]),
    )(channel);
    return (
      <QueryRenderer
        query={vocabulariesQuery}
        variables={{ category: 'channel_types_ov' }}
        render={({ props }) => {
          if (props && props.vocabularies) {
            return (
              <Formik
                enableReinitialize={true}
                initialValues={initialValues}
                validationSchema={channelValidation(t)}
                onSubmit={this.onSubmit.bind(this)}
              >
                {({
                  submitForm,
                  isSubmitting,
                  validateForm,
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
                      onFocus={this.handleChangeFocus.bind(this)}
                      onSubmit={this.handleSubmitField.bind(this)}
                      helperText={
                        <SubscriptionFocus context={context} fieldName="name" />
                      }
                    />
                    <OpenVocabField
                      type="channel_types_ov"
                      name="channel_types"
                      label="Channel types"
                      variant="edit"
                      multiple={true}
                      containerStyle={fieldSpacingContainerStyle}
                      onSubmit={this.handleSubmitField.bind(this)}
                      onChange={(name, value) => setFieldValue(name, value)}
                    />
                    <Field
                      component={MarkDownField}
                      name="description"
                      label={t('Description')}
                      fullWidth={true}
                      multiline={true}
                      rows="4"
                      style={{ marginTop: 20 }}
                      onFocus={this.handleChangeFocus.bind(this)}
                      onSubmit={this.handleSubmitField.bind(this)}
                      helperText={
                        <SubscriptionFocus
                          context={context}
                          fieldName="description"
                        />
                      }
                    />
                    {channel.workflowEnabled && (
                      <StatusField
                        name="x_opencti_workflow_id"
                        type="Channel"
                        onFocus={this.handleChangeFocus.bind(this)}
                        onChange={this.handleSubmitField.bind(this)}
                        setFieldValue={setFieldValue}
                        style={{ marginTop: 20 }}
                        helpertext={
                          <SubscriptionFocus
                            context={context}
                            fieldName="x_opencti_workflow_id"
                          />
                        }
                      />
                    )}
                    <CreatedByField
                      name="createdBy"
                      style={{ marginTop: 20, width: '100%' }}
                      setFieldValue={setFieldValue}
                      helpertext={
                        <SubscriptionFocus
                          context={context}
                          fieldName="createdBy"
                        />
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
                    />
                    {enableReferences && (
                      <CommitMessage
                        submitForm={submitForm}
                        disabled={isSubmitting}
                        validateForm={validateForm}
                        setFieldValue={setFieldValue}
                        values={values}
                        id={channel.id}
                      />
                    )}
                  </Form>
                )}
              </Formik>
            );
          }
          return <Loader variant="inElement" />;
        }}
      />
    );
  }
}

ChannelEditionOverviewComponent.propTypes = {
  t: PropTypes.func,
  channel: PropTypes.object,
  context: PropTypes.array,
  enableReferences: PropTypes.bool,
};

const ChannelEditionOverview = createFragmentContainer(
  ChannelEditionOverviewComponent,
  {
    channel: graphql`
      fragment ChannelEditionOverview_channel on Channel {
        id
        name
        channel_types
        description
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
              definition
              definition_type
            }
          }
        }
        status {
          id
          order
          template {
            name
            color
          }
        }
        workflowEnabled
      }
    `,
  },
);

export default compose(
  inject18n,
)(ChannelEditionOverview);
