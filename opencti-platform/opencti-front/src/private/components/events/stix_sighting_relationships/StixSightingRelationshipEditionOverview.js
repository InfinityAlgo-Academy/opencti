import React, { useEffect } from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import { createFragmentContainer } from 'react-relay';
import { Form, Formik, Field } from 'formik';
import {
  assoc,
  compose,
  difference,
  head,
  map,
  pathOr,
  pick,
  pipe,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import { Close } from '@material-ui/icons';
import * as Yup from 'yup';
import { dateFormat } from '../../../../utils/Time';
import { resolveLink } from '../../../../utils/Entity';
import inject18n from '../../../../components/i18n';
import {
  commitMutation,
  requestSubscription,
} from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import {
  SubscriptionAvatars,
  SubscriptionFocus,
} from '../../../../components/Subscription';
import DatePickerField from '../../../../components/DatePickerField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import CreatedByField from '../../common/form/CreatedByField';
import ConfidenceField from '../../common/form/ConfidenceField';
import SwitchField from '../../../../components/SwitchField';
import MarkDownField from '../../../../components/MarkDownField';

const styles = (theme) => ({
  header: {
    backgroundColor: theme.palette.navAlt.backgroundHeader,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
  },
  importButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.navAlt.background,
    color: theme.palette.header.text,
    borderBottom: '1px solid #5c5c5c',
  },
  title: {
    float: 'left',
  },
  button: {
    float: 'right',
    backgroundColor: '#f44336',
    borderColor: '#f44336',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#c62828',
      borderColor: '#c62828',
    },
  },
  buttonLeft: {
    float: 'left',
  },
});

const subscription = graphql`
  subscription StixSightingRelationshipEditionOverviewSubscription($id: ID!) {
    stixSightingRelationship(id: $id) {
      ...StixSightingRelationshipEditionOverview_stixSightingRelationship
    }
  }
`;

const stixSightingRelationshipMutationFieldPatch = graphql`
  mutation StixSightingRelationshipEditionOverviewFieldPatchMutation(
    $id: ID!
    $input: EditInput!
  ) {
    stixSightingRelationshipEdit(id: $id) {
      fieldPatch(input: $input) {
        ...StixSightingRelationshipEditionOverview_stixSightingRelationship
      }
    }
  }
`;

export const stixSightingRelationshipEditionFocus = graphql`
  mutation StixSightingRelationshipEditionOverviewFocusMutation(
    $id: ID!
    $input: EditContext!
  ) {
    stixSightingRelationshipEdit(id: $id) {
      contextPatch(input: $input) {
        id
      }
    }
  }
`;

const stixSightingRelationshipMutationRelationAdd = graphql`
  mutation StixSightingRelationshipEditionOverviewRelationAddMutation(
    $id: ID!
    $input: StixMetaRelationshipAddInput!
  ) {
    stixSightingRelationshipEdit(id: $id) {
      relationAdd(input: $input) {
        from {
          ...StixSightingRelationshipEditionOverview_stixSightingRelationship
        }
      }
    }
  }
`;

const stixSightingRelationshipMutationRelationDelete = graphql`
  mutation StixSightingRelationshipEditionOverviewRelationDeleteMutation(
    $id: ID!
    $toId: String!
    $relationship_type: String!
  ) {
    stixSightingRelationshipEdit(id: $id) {
      relationDelete(toId: $toId, relationship_type: $relationship_type) {
        ...StixSightingRelationshipEditionOverview_stixSightingRelationship
      }
    }
  }
`;

const stixSightingRelationshipValidation = (t) => Yup.object().shape({
  attribute_count: Yup.number()
    .typeError(t('The value must be a number'))
    .integer(t('The value must be a number'))
    .required(t('This field is required')),
  confidence: Yup.number()
    .typeError(t('The value must be a number'))
    .integer(t('The value must be a number'))
    .required(t('This field is required')),
  first_seen: Yup.date()
    .typeError(t('The value must be a date (YYYY-MM-DD)'))
    .required(t('This field is required')),
  last_seen: Yup.date()
    .typeError(t('The value must be a date (YYYY-MM-DD)'))
    .required(t('This field is required')),
  description: Yup.string(),
  x_opencti_negative: Yup.boolean(),
});

const StixSightingRelationshipEditionContainer = ({
  t,
  classes,
  handleClose,
  handleDelete,
  stixSightingRelationship,
  stixDomainObject,
}) => {
  const { editContext } = stixSightingRelationship;
  useEffect(() => {
    const sub = requestSubscription({
      subscription,
      variables: {
        id: stixSightingRelationship.id,
      },
    });
    return () => {
      sub.dispose();
    };
  });
  const handleChangeObjectMarking = (name, values) => {
    const currentMarkingDefinitions = pipe(
      pathOr([], ['objectMarking', 'edges']),
      map((n) => ({
        label: n.node.definition,
        value: n.node.id,
      })),
    )(stixSightingRelationship);

    const added = difference(values, currentMarkingDefinitions);
    const removed = difference(currentMarkingDefinitions, values);

    if (added.length > 0) {
      commitMutation({
        mutation: stixSightingRelationshipMutationRelationAdd,
        variables: {
          id: stixSightingRelationship.id,
          input: {
            toId: head(added).value,
            relationship_type: 'object-marking',
          },
        },
      });
    }

    if (removed.length > 0) {
      commitMutation({
        mutation: stixSightingRelationshipMutationRelationDelete,
        variables: {
          id: stixSightingRelationship.id,
          toId: head(removed).value,
          relationship_type: 'object-marking',
        },
      });
    }
  };
  const handleChangeCreatedBy = (name, value) => {
    const currentCreatedBy = {
      label: pathOr(null, ['createdBy', 'name'], stixSightingRelationship),
      value: pathOr(null, ['createdBy', 'id'], stixSightingRelationship),
    };
    if (currentCreatedBy.value === null) {
      commitMutation({
        mutation: stixSightingRelationshipMutationRelationAdd,
        variables: {
          id: stixSightingRelationship.id,
          input: {
            toId: value.value,
            relationship_type: 'created-by',
          },
        },
      });
    } else if (currentCreatedBy.value !== value.value) {
      commitMutation({
        mutation: stixSightingRelationshipMutationRelationDelete,
        variables: {
          id: stixSightingRelationship.id,
          toId: currentCreatedBy.value,
          relationship_type: 'created-by',
        },
      });
      if (value.value) {
        commitMutation({
          mutation: stixSightingRelationshipMutationRelationAdd,
          variables: {
            id: stixSightingRelationship.id,
            input: {
              toId: value.value,
              relationship_type: 'created-by',
            },
          },
        });
      }
    }
  };
  const handleChangeFocus = (name) => {
    commitMutation({
      mutation: stixSightingRelationshipEditionFocus,
      variables: {
        id: stixSightingRelationship.id,
        input: {
          focusOn: name,
        },
      },
    });
  };
  const handleSubmitField = (name, value) => {
    stixSightingRelationshipValidation(t)
      .validateAt(name, { [name]: value })
      .then(() => {
        commitMutation({
          mutation: stixSightingRelationshipMutationFieldPatch,
          variables: {
            id: stixSightingRelationship.id,
            input: { key: name, value },
          },
        });
      })
      .catch(() => false);
  };
  const createdBy = pathOr(null, ['createdBy', 'name'], stixSightingRelationship) === null
    ? ''
    : {
      label: pathOr(null, ['createdBy', 'name'], stixSightingRelationship),
      value: pathOr(null, ['createdBy', 'id'], stixSightingRelationship),
    };
  const objectMarking = pipe(
    pathOr([], ['objectMarking', 'edges']),
    map((n) => ({
      label: n.node.definition,
      value: n.node.id,
    })),
  )(stixSightingRelationship);
  const initialValues = pipe(
    assoc('first_seen', dateFormat(stixSightingRelationship.first_seen)),
    assoc('last_seen', dateFormat(stixSightingRelationship.last_seen)),
    assoc('createdBy', createdBy),
    assoc('objectMarking', objectMarking),
    pick([
      'attribute_count',
      'confidence',
      'first_seen',
      'last_seen',
      'description',
      'x_opencti_negative',
      'createdBy',
      'objectMarking',
    ]),
  )(stixSightingRelationship);
  const link = stixDomainObject
    ? resolveLink(stixDomainObject.entity_type)
    : '';
  return (
    <div>
      <div className={classes.header}>
        <IconButton
          aria-label="Close"
          className={classes.closeButton}
          onClick={handleClose}
        >
          <Close fontSize="small" />
        </IconButton>
        <Typography variant="h6" classes={{ root: classes.title }}>
          {t('Update a sighting')}
        </Typography>
        <SubscriptionAvatars context={editContext} />
        <div className="clearfix" />
      </div>
      <div className={classes.container}>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={stixSightingRelationshipValidation(t)}
        >
          {(setFieldValue) => (
            <Form style={{ margin: '20px 0 20px 0' }}>
              <Field
                component={TextField}
                name="attribute_count"
                label={t('Count')}
                fullWidth={true}
                onFocus={handleChangeFocus}
                onSubmit={handleSubmitField}
                helperText={
                  <SubscriptionFocus
                    context={editContext}
                    fieldName="attribute_count"
                  />
                }
              />
              <ConfidenceField
                variant="edit"
                name="confidence"
                label={t('Confidence level')}
                onFocus={handleChangeFocus}
                onChange={handleSubmitField}
                editContext={editContext}
                containerstyle={{ marginTop: 20, width: '100%' }}
              />
              <Field
                component={DatePickerField}
                name="first_seen"
                label={t('First seen')}
                invalidDateMessage={t('The value must be a date (YYYY-MM-DD)')}
                fullWidth={true}
                style={{ marginTop: 20 }}
                onFocus={handleChangeFocus}
                onSubmit={handleSubmitField}
                helperText={
                  <SubscriptionFocus
                    context={editContext}
                    fieldName="first_seen"
                  />
                }
              />
              <Field
                component={DatePickerField}
                name="last_seen"
                label={t('Last seen')}
                invalidDateMessage={t('The value must be a date (YYYY-MM-DD)')}
                fullWidth={true}
                style={{ marginTop: 20 }}
                onFocus={handleChangeFocus}
                onSubmit={handleSubmitField}
                helperText={
                  <SubscriptionFocus
                    context={editContext}
                    fieldName="last_seen"
                  />
                }
              />
              <Field
                component={MarkDownField}
                name="description"
                label={t('Description')}
                fullWidth={true}
                multiline={true}
                rows={4}
                style={{ marginTop: 20 }}
                onFocus={handleChangeFocus}
                onSubmit={handleSubmitField}
                helperText={
                  <SubscriptionFocus
                    context={editContext}
                    fieldName="description"
                  />
                }
              />
              <CreatedByField
                name="createdBy"
                style={{ marginTop: 20, width: '100%' }}
                setFieldValue={setFieldValue}
                helpertext={
                  <SubscriptionFocus
                    context={editContext}
                    fieldName="createdBy"
                  />
                }
                onChange={handleChangeCreatedBy}
              />
              <ObjectMarkingField
                name="objectMarking"
                style={{ marginTop: 20, width: '100%' }}
                helpertext={
                  <SubscriptionFocus
                    context={editContext}
                    fieldname="objectMarking"
                  />
                }
                onChange={handleChangeObjectMarking}
              />
              <Field
                component={SwitchField}
                type="checkbox"
                name="x_opencti_negative"
                label={t('False positive')}
                containerstyle={{ marginTop: 20 }}
                onChange={handleSubmitField}
                helperText={
                  <SubscriptionFocus
                    context={editContext}
                    fieldName="x_opencti_negative"
                  />
                }
              />
            </Form>
          )}
        </Formik>
        {stixDomainObject ? (
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`${link}/${stixDomainObject.id}/knowledge/relations/${stixSightingRelationship.id}`}
            classes={{ root: classes.buttonLeft }}
          >
            {t('Details')}
          </Button>
        ) : (
          ''
        )}
        {typeof handleDelete === 'function' ? (
          <Button
            variant="contained"
            onClick={() => handleDelete()}
            classes={{ root: classes.button }}
          >
            {t('Delete')}
          </Button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

StixSightingRelationshipEditionContainer.propTypes = {
  handleClose: PropTypes.func,
  handleDelete: PropTypes.func,
  classes: PropTypes.object,
  stixDomainObject: PropTypes.object,
  stixSightingRelationship: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

const StixSightingRelationshipEditionFragment = createFragmentContainer(
  StixSightingRelationshipEditionContainer,
  {
    stixSightingRelationship: graphql`
      fragment StixSightingRelationshipEditionOverview_stixSightingRelationship on StixSightingRelationship {
        id
        attribute_count
        x_opencti_negative
        confidence
        first_seen
        last_seen
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
        editContext {
          name
          focusOn
        }
      }
    `,
  },
);

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(StixSightingRelationshipEditionFragment);
