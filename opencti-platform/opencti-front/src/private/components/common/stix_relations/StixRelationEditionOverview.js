import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import { createFragmentContainer } from 'react-relay';
import { Formik, Field, Form } from 'formik';
import {
  compose,
  insert,
  find,
  propEq,
  pick,
  assoc,
  pipe,
  map,
  pathOr,
  difference,
  head,
} from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import { Close } from '@material-ui/icons';
import * as Yup from 'yup';
import { dateFormat } from '../../../../utils/Time';
import { resolveLink } from '../../../../utils/Entity';
import inject18n from '../../../../components/i18n';
import {
  QueryRenderer,
  commitMutation,
  fetchQuery,
  requestSubscription,
} from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import {
  SubscriptionAvatars,
  SubscriptionFocus,
} from '../../../../components/Subscription';
import Select from '../../../../components/Select';
import Autocomplete from '../../../../components/Autocomplete';
import { stixDomainEntitiesLinesSearchQuery } from '../stix_domain_entities/StixDomainEntitiesLines';
import DatePickerField from '../../../../components/DatePickerField';
import { attributesQuery } from '../../settings/attributes/AttributesList';

const styles = theme => ({
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
  subscription StixRelationEditionOverviewSubscription($id: ID!) {
    stixRelation(id: $id) {
      ...StixRelationEditionOverview_stixRelation
    }
  }
`;

const stixRelationMutationFieldPatch = graphql`
  mutation StixRelationEditionOverviewFieldPatchMutation(
    $id: ID!
    $input: EditInput!
  ) {
    stixRelationEdit(id: $id) {
      fieldPatch(input: $input) {
        ...StixRelationEditionOverview_stixRelation
      }
    }
  }
`;

export const stixRelationEditionFocus = graphql`
  mutation StixRelationEditionOverviewFocusMutation(
    $id: ID!
    $input: EditContext!
  ) {
    stixRelationEdit(id: $id) {
      contextPatch(input: $input) {
        id
      }
    }
  }
`;

const stixRelationMutationRelationAdd = graphql`
  mutation StixRelationEditionOverviewRelationAddMutation(
    $id: ID!
    $input: RelationAddInput!
  ) {
    stixRelationEdit(id: $id) {
      relationAdd(input: $input) {
        node {
          ...StixRelationEditionOverview_stixRelation
        }
      }
    }
  }
`;

const stixRelationMutationRelationDelete = graphql`
  mutation StixRelationEditionOverviewRelationDeleteMutation(
    $id: ID!
    $relationId: ID!
  ) {
    stixRelationEdit(id: $id) {
      relationDelete(relationId: $relationId) {
        node {
          ...StixRelationEditionOverview_stixRelation
        }
      }
    }
  }
`;

const stixRelationValidation = t => Yup.object().shape({
  weight: Yup.number()
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
  role_played: Yup.string(),
  score: Yup.string(),
  expiration: Yup.date().typeError(t('The value must be a date (YYYY-MM-DD)')),
});

class StixRelationEditionContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { locations: [] };
  }

  componentDidMount() {
    const sub = requestSubscription({
      subscription,
      variables: {
        // eslint-disable-next-line
        id: this.props.stixRelation.id
      },
    });
    this.setState({ sub });
  }

  componentWillUnmount() {
    this.state.sub.dispose();
  }

  searchLocations(event) {
    fetchQuery(stixDomainEntitiesLinesSearchQuery, {
      search: event.target.value,
      types: ['region', 'country', 'city'],
    }).then((data) => {
      const locations = pipe(
        pathOr([], ['stixDomainEntities', 'edges']),
        map(n => ({ label: n.node.name, value: n.node.id })),
      )(data);
      this.setState({ locations });
    });
  }

  handleChangeLocation(name, values) {
    const { stixRelation } = this.props;
    const currentLocations = pipe(
      pathOr([], ['locations', 'edges']),
      map(n => ({
        label: n.node.name,
        value: n.node.id,
        relationId: n.relation.id,
      })),
    )(stixRelation);

    const added = difference(values, currentLocations);
    const removed = difference(currentLocations, values);

    if (added.length > 0) {
      commitMutation({
        mutation: stixRelationMutationRelationAdd,
        variables: {
          id: head(added).value,
          input: {
            fromRole: 'location',
            toId: this.props.stixRelation.id,
            toRole: 'localized',
            through: 'localization',
            first_seen: stixRelation.last_seen,
            last_seen: stixRelation.last_seen,
            description: stixRelation.description,
            weight: stixRelation.weight,
          },
        },
      });
    }

    if (removed.length > 0) {
      commitMutation({
        mutation: stixRelationMutationRelationDelete,
        variables: {
          id: this.props.stixRelation.id,
          relationId: head(removed).relationId,
        },
      });
    }
  }

  handleChangeFocus(name) {
    commitMutation({
      mutation: stixRelationEditionFocus,
      variables: {
        id: this.props.stixRelation.id,
        input: {
          focusOn: name,
        },
      },
    });
  }

  handleSubmitField(name, value) {
    stixRelationValidation(this.props.t)
      .validateAt(name, { [name]: value })
      .then(() => {
        commitMutation({
          mutation: stixRelationMutationFieldPatch,
          variables: {
            id: this.props.stixRelation.id,
            input: { key: name, value },
          },
        });
      })
      .catch(() => false);
  }

  render() {
    const {
      t,
      classes,
      handleClose,
      handleDelete,
      stixRelation,
      me,
      variant,
      stixDomainEntity,
    } = this.props;
    const { editContext } = stixRelation;
    const missingMe = find(propEq('name', me.email))(editContext) === undefined;
    const editUsers = missingMe
      ? insert(0, { name: me.email }, editContext)
      : editContext;
    const locations = pipe(
      pathOr([], ['locations', 'edges']),
      map(n => ({
        label: n.node.name,
        value: n.node.id,
        relationId: n.relation.id,
      })),
    )(stixRelation);
    const initialValues = pipe(
      assoc('first_seen', dateFormat(stixRelation.first_seen)),
      assoc('last_seen', dateFormat(stixRelation.last_seen)),
      assoc('locations', locations),
      pick([
        'weight',
        'first_seen',
        'last_seen',
        'description',
        'locations',
        'role_played',
        'score',
        'expiration',
      ]),
    )(stixRelation);
    const link = stixDomainEntity
      ? resolveLink(stixDomainEntity.entity_type)
      : '';
    return (
      <div>
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose.bind(this)}
          >
            <Close fontSize="small" />
          </IconButton>
          <Typography variant="h6" classes={{ root: classes.title }}>
            {t('Update a relationship')}
          </Typography>
          <SubscriptionAvatars users={editUsers} />
          <div className="clearfix" />
        </div>
        <div className={classes.container}>
          <QueryRenderer
            query={attributesQuery}
            variables={{ type: 'role_played' }}
            render={({ props }) => {
              if (props && props.attributes) {
                const rolesPlayedEdges = props.attributes.edges;
                return (
                  <Formik
                    enableReinitialize={true}
                    initialValues={initialValues}
                    validationSchema={stixRelationValidation(t)}
                    render={() => (
                      <Form style={{ margin: '20px 0 20px 0' }}>
                        {stixRelation.relationship_type === 'indicates' ? (
                          <Field
                            name="role_played"
                            component={Select}
                            onFocus={this.handleChangeFocus.bind(this)}
                            onChange={this.handleSubmitField.bind(this)}
                            label={t('Played role')}
                            fullWidth={true}
                            inputProps={{
                              name: 'role_played',
                              id: 'role_played',
                            }}
                            containerstyle={{ marginTop: 10, width: '100%' }}
                            helpertext={
                              <SubscriptionFocus
                                me={me}
                                users={editUsers}
                                fieldName="role_played"
                              />
                            }
                          >
                            {rolesPlayedEdges.map(rolePlayedEdge => (
                              <MenuItem
                                key={rolePlayedEdge.node.value}
                                value={rolePlayedEdge.node.value}
                              >
                                {rolePlayedEdge.node.value}
                              </MenuItem>
                            ))}
                          </Field>
                        ) : (
                          ''
                        )}
                        <Field
                          name="weight"
                          component={Select}
                          onFocus={this.handleChangeFocus.bind(this)}
                          onChange={this.handleSubmitField.bind(this)}
                          label={t('Confidence level')}
                          fullWidth={true}
                          inputProps={{
                            name: 'weight',
                            id: 'weight',
                          }}
                          containerstyle={{ marginTop: 10, width: '100%' }}
                          helpertext={
                            <SubscriptionFocus
                              me={me}
                              users={editUsers}
                              fieldName="weight"
                            />
                          }
                        >
                          <MenuItem value="1">{t('Very low')}</MenuItem>
                          <MenuItem value="2">{t('Low')}</MenuItem>
                          <MenuItem value="3">{t('Medium')}</MenuItem>
                          <MenuItem value="4">{t('High')}</MenuItem>
                          <MenuItem value="5">{t('Very high')}</MenuItem>
                        </Field>
                        {stixRelation.relationship_type === 'indicates' ? (
                          <Field
                            name="score"
                            component={TextField}
                            label={t('Score')}
                            fullWidth={true}
                            style={{ marginTop: 10 }}
                            onFocus={this.handleChangeFocus.bind(this)}
                            onSubmit={this.handleSubmitField.bind(this)}
                            helperText={
                              <SubscriptionFocus
                                me={me}
                                users={editUsers}
                                fieldName="score"
                              />
                            }
                          />
                        ) : (
                          ''
                        )}
                        <Field
                          name="first_seen"
                          component={DatePickerField}
                          label={t('First seen')}
                          fullWidth={true}
                          style={{ marginTop: 10 }}
                          onFocus={this.handleChangeFocus.bind(this)}
                          onSubmit={this.handleSubmitField.bind(this)}
                          helperText={
                            <SubscriptionFocus
                              me={me}
                              users={editUsers}
                              fieldName="first_seen"
                            />
                          }
                        />
                        <Field
                          name="last_seen"
                          component={DatePickerField}
                          label={t('Last seen')}
                          fullWidth={true}
                          style={{ marginTop: 10 }}
                          onFocus={this.handleChangeFocus.bind(this)}
                          onSubmit={this.handleSubmitField.bind(this)}
                          helperText={
                            <SubscriptionFocus
                              me={me}
                              users={editUsers}
                              fieldName="last_seen"
                            />
                          }
                        />
                        {stixRelation.relationship_type === 'targets' ? (
                          <Field
                            name="locations"
                            component={Autocomplete}
                            multiple={true}
                            label={t('Locations')}
                            options={this.state.locations}
                            onInputChange={this.searchLocations.bind(this)}
                            onChange={this.handleChangeLocation.bind(this)}
                            onFocus={this.handleChangeFocus.bind(this)}
                            helperText={
                              <SubscriptionFocus
                                me={me}
                                users={editUsers}
                                fieldName="locations"
                              />
                            }
                          />
                        ) : (
                          ''
                        )}
                        {stixRelation.relationship_type === 'indicates' ? (
                          <Field
                            name="expiration"
                            component={DatePickerField}
                            label={t('Expiration')}
                            fullWidth={true}
                            style={{ marginTop: 10 }}
                            onFocus={this.handleChangeFocus.bind(this)}
                            onSubmit={this.handleSubmitField.bind(this)}
                            helperText={
                              <SubscriptionFocus
                                me={me}
                                users={editUsers}
                                fieldName="expiration"
                              />
                            }
                          />
                        ) : (
                          ''
                        )}
                        <Field
                          name="description"
                          component={TextField}
                          label={t('Description')}
                          fullWidth={true}
                          multiline={true}
                          rows={4}
                          style={{ marginTop: 10 }}
                          onFocus={this.handleChangeFocus.bind(this)}
                          onSubmit={this.handleSubmitField.bind(this)}
                          helperText={
                            <SubscriptionFocus
                              me={me}
                              users={editUsers}
                              fieldName="description"
                            />
                          }
                        />
                      </Form>
                    )}
                  />
                );
              }
              return <div> &nbsp; </div>;
            }}
          />
          {stixDomainEntity ? (
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to={`${link}/${stixDomainEntity.id}/knowledge/relations/${stixRelation.id}`}
              classes={{ root: classes.buttonLeft }}
            >
              {t('Details')}
            </Button>
          ) : (
            ''
          )}
          {variant !== 'noGraph' ? (
            <Button
              variant="contained"
              onClick={handleDelete.bind(this)}
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
  }
}

StixRelationEditionContainer.propTypes = {
  variant: PropTypes.string,
  handleClose: PropTypes.func,
  handleDelete: PropTypes.func,
  classes: PropTypes.object,
  stixDomainEntity: PropTypes.object,
  stixRelation: PropTypes.object,
  me: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

const StixRelationEditionFragment = createFragmentContainer(
  StixRelationEditionContainer,
  {
    stixRelation: graphql`
      fragment StixRelationEditionOverview_stixRelation on StixRelation {
        id
        weight
        first_seen
        last_seen
        description
        relationship_type
        role_played
        score
        expiration
        locations {
          edges {
            node {
              id
              name
            }
            relation {
              id
            }
          }
        }
        editContext {
          name
          focusOn
        }
      }
    `,
    me: graphql`
      fragment StixRelationEditionOverview_me on User {
        email
      }
    `,
  },
);

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(StixRelationEditionFragment);
