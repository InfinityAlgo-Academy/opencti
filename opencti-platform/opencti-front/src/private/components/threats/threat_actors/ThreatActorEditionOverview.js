import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { createFragmentContainer } from 'react-relay';
import { Formik, Form, Field } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import * as Yup from 'yup';
import MenuItem from '@material-ui/core/MenuItem';
import inject18n from '../../../../components/i18n';
import TextField from '../../../../components/TextField';
import { SubscriptionFocus } from '../../../../components/Subscription';
import { commitMutation } from '../../../../relay/environment';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import MarkDownField from '../../../../components/MarkDownField';
import SelectField from '../../../../components/SelectField';
import ConfidenceField from '../../common/form/ConfidenceField';
import CommitMessage from '../../common/form/CommitMessage';
import { adaptFieldValue } from '../../../../utils/String';

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
});

const threatActorMutationFieldPatch = graphql`
  mutation ThreatActorEditionOverviewFieldPatchMutation(
    $id: ID!
    $input: [EditInput]!
    $commitMessage: String
  ) {
    threatActorEdit(id: $id) {
      fieldPatch(input: $input, commitMessage: $commitMessage) {
        ...ThreatActorEditionOverview_threatActor
        ...ThreatActor_threatActor
      }
    }
  }
`;

export const threatActorEditionOverviewFocus = graphql`
  mutation ThreatActorEditionOverviewFocusMutation(
    $id: ID!
    $input: EditContext!
  ) {
    threatActorEdit(id: $id) {
      contextPatch(input: $input) {
        id
      }
    }
  }
`;

const threatActorMutationRelationAdd = graphql`
  mutation ThreatActorEditionOverviewRelationAddMutation(
    $id: ID!
    $input: StixMetaRelationshipAddInput
  ) {
    threatActorEdit(id: $id) {
      relationAdd(input: $input) {
        from {
          ...ThreatActorEditionOverview_threatActor
        }
      }
    }
  }
`;

const threatActorMutationRelationDelete = graphql`
  mutation ThreatActorEditionOverviewRelationDeleteMutation(
    $id: ID!
    $toId: String!
    $relationship_type: String!
  ) {
    threatActorEdit(id: $id) {
      relationDelete(toId: $toId, relationship_type: $relationship_type) {
        ...ThreatActorEditionOverview_threatActor
      }
    }
  }
`;

const threatActorValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  threat_actor_types: Yup.array(),
  confidence: Yup.number().required(t('This field is required')),
  description: Yup.string()
    .min(3, t('The value is too short'))
    .max(5000, t('The value is too long'))
    .required(t('This field is required')),
});

class ThreatActorEditionOverviewComponent extends Component {
  handleChangeFocus(name) {
    commitMutation({
      mutation: threatActorEditionOverviewFocus,
      variables: {
        id: this.props.threatActor.id,
        input: {
          focusOn: name,
        },
      },
    });
  }

  onSubmit(values, { setSubmitting }) {
    const commitMessage = values.message;
    const inputValues = R.pipe(
      R.dissoc('message'),
      R.assoc('createdBy', values.createdBy?.value),
      R.assoc('objectMarking', R.pluck('value', values.objectMarking)),
      R.toPairs,
      R.map((n) => ({
        key: n[0],
        value: adaptFieldValue(n[1]),
      })),
    )(values);
    commitMutation({
      mutation: threatActorMutationFieldPatch,
      variables: {
        id: this.props.threatActor.id,
        input: inputValues,
        commitMessage:
          commitMessage && commitMessage.length > 0 ? commitMessage : null,
      },
      onCompleted: () => {
        setSubmitting(false);
        this.props.handleClose();
      },
    });
  }

  handleSubmitField(name, value) {
    if (!this.props.enableReferences) {
      threatActorValidation(this.props.t)
        .validateAt(name, { [name]: value })
        .then(() => {
          commitMutation({
            mutation: threatActorMutationFieldPatch,
            variables: {
              id: this.props.threatActor.id,
              input: { key: name, value },
            },
          });
        })
        .catch(() => false);
    }
  }

  handleChangeCreatedBy(name, value) {
    if (!this.props.enableReferences) {
      commitMutation({
        mutation: threatActorMutationFieldPatch,
        variables: {
          id: this.props.threatActor.id,
          input: { key: 'createdBy', value: value.value },
        },
      });
    }
  }

  handleChangeObjectMarking(name, values) {
    if (!this.props.enableReferences) {
      const { threatActor } = this.props;
      const currentMarkingDefinitions = R.pipe(
        R.pathOr([], ['objectMarking', 'edges']),
        R.map((n) => ({
          label: n.node.definition,
          value: n.node.id,
        })),
      )(threatActor);

      const added = R.difference(values, currentMarkingDefinitions);
      const removed = R.difference(currentMarkingDefinitions, values);

      if (added.length > 0) {
        commitMutation({
          mutation: threatActorMutationRelationAdd,
          variables: {
            id: this.props.threatActor.id,
            input: {
              toId: R.head(added).value,
              relationship_type: 'object-marking',
            },
          },
        });
      }

      if (removed.length > 0) {
        commitMutation({
          mutation: threatActorMutationRelationDelete,
          variables: {
            id: this.props.threatActor.id,
            toId: R.head(removed).value,
            relationship_type: 'object-marking',
          },
        });
      }
    }
  }

  render() {
    const {
      t, threatActor, context, enableReferences,
    } = this.props;
    const createdBy = R.pathOr(null, ['createdBy', 'name'], threatActor) === null
      ? ''
      : {
        label: R.pathOr(null, ['createdBy', 'name'], threatActor),
        value: R.pathOr(null, ['createdBy', 'id'], threatActor),
      };
    const killChainPhases = R.pipe(
      R.pathOr([], ['killChainPhases', 'edges']),
      R.map((n) => ({
        label: `[${n.node.kill_chain_name}] ${n.node.phase_name}`,
        value: n.node.id,
      })),
    )(threatActor);
    const objectMarking = R.pipe(
      R.pathOr([], ['objectMarking', 'edges']),
      R.map((n) => ({
        label: n.node.definition,
        value: n.node.id,
      })),
    )(threatActor);
    const initialValues = R.pipe(
      R.assoc('createdBy', createdBy),
      R.assoc('killChainPhases', killChainPhases),
      R.assoc('objectMarking', objectMarking),
      R.assoc(
        'threat_actor_types',
        threatActor.threat_actor_types ? threatActor.threat_actor_types : [],
      ),
      R.pick([
        'name',
        'threat_actor_types',
        'confidence',
        'description',
        'createdBy',
        'killChainPhases',
        'objectMarking',
      ]),
    )(threatActor);
    return (
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={threatActorValidation(t)}
        onSubmit={this.onSubmit.bind(this)}
      >
        {({
          submitForm, isSubmitting, validateForm, setFieldValue,
        }) => (
          <Form style={{ margin: '20px 0 20px 0' }}>
            <Field
              component={TextField}
              name="name"
              label={t('Name')}
              fullWidth={true}
              onFocus={this.handleChangeFocus.bind(this)}
              onSubmit={this.handleSubmitField.bind(this)}
              helperText={
                <SubscriptionFocus context={context} fieldName="name" />
              }
            />
            <Field
              component={SelectField}
              name="threat_actor_types"
              onFocus={this.handleChangeFocus.bind(this)}
              onChange={this.handleSubmitField.bind(this)}
              label={t('Threat actor types')}
              fullWidth={true}
              multiple={true}
              containerstyle={{ width: '100%', marginTop: 20 }}
              helpertext={
                <SubscriptionFocus
                  context={context}
                  fieldName="threat_actor_types"
                />
              }
            >
              <MenuItem key="activist" value="activist">
                {t('activist')}
              </MenuItem>
              <MenuItem key="competitor" value="competitor">
                {t('competitor')}
              </MenuItem>
              <MenuItem key="crime-syndicate" value="crime-syndicate">
                {t('crime-syndicate')}
              </MenuItem>
              <MenuItem key="criminal'" value="criminal'">
                {t('criminal')}
              </MenuItem>
              <MenuItem key="hacker" value="hacker">
                {t('hacker')}
              </MenuItem>
              <MenuItem key="insider-accidental" value="insider-accidental">
                {t('insider-accidental')}
              </MenuItem>
              <MenuItem key="insider-disgruntled" value="insider-disgruntled">
                {t('insider-disgruntled')}
              </MenuItem>
              <MenuItem key="nation-state" value="nation-state">
                {t('nation-state')}
              </MenuItem>
              <MenuItem key="sensationalist" value="sensationalist">
                {t('sensationalist')}
              </MenuItem>
              <MenuItem key="spy" value="spy">
                {t('spy')}
              </MenuItem>
              <MenuItem key="terrorist" value="terrorist">
                {t('terrorist')}
              </MenuItem>
              <MenuItem key="unknown" value="unknown">
                {t('unknown')}
              </MenuItem>
            </Field>
            <ConfidenceField
              name="confidence"
              onFocus={this.handleChangeFocus.bind(this)}
              onChange={this.handleSubmitField.bind(this)}
              label={t('Confidence')}
              fullWidth={true}
              containerstyle={{ width: '100%', marginTop: 20 }}
              editContext={context}
              variant="edit"
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
                <SubscriptionFocus context={context} fieldName="description" />
              }
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
            />
            {enableReferences && (
              <CommitMessage
                submitForm={submitForm}
                disabled={isSubmitting}
                validateForm={validateForm}
              />
            )}
          </Form>
        )}
      </Formik>
    );
  }
}

ThreatActorEditionOverviewComponent.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  threatActor: PropTypes.object,
  enableReferences: PropTypes.bool,
  context: PropTypes.array,
  handleClose: PropTypes.func,
};

const ThreatActorEditionOverview = createFragmentContainer(
  ThreatActorEditionOverviewComponent,
  {
    threatActor: graphql`
      fragment ThreatActorEditionOverview_threatActor on ThreatActor {
        id
        name
        threat_actor_types
        confidence
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
      }
    `,
  },
);

export default R.compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(ThreatActorEditionOverview);
