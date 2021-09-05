import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import * as Yup from 'yup';
import * as R from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { createFragmentContainer } from 'react-relay';
import { Field, Form, Formik } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { Close } from '@material-ui/icons';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import inject18n from '../../../components/i18n';
import { commitMutation } from '../../../relay/environment';
import TextField from '../../../components/TextField';
import Filters, { isUniqFilter } from '../common/lists/Filters';
import { truncate } from '../../../utils/String';
import SelectField from '../../../components/SelectField';
import StixDomainObjectsField from '../common/form/StixDomainObjectsField';
import { defaultValue } from '../../../utils/Graph';

const styles = (theme) => ({
  header: {
    backgroundColor: theme.palette.navAlt.backgroundHeader,
    color: theme.palette.navAlt.backgroundHeaderText,
    padding: '20px 0px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
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
  filters: {
    marginTop: 20,
  },
  filter: {
    margin: '0 10px 10px 0',
  },
  operator: {
    fontFamily: 'Consolas, monaco, monospace',
    backgroundColor: theme.palette.background.chip,
    margin: '0 10px 10px 0',
  },
});

const userSubscriptionMutationFieldPatch = graphql`
  mutation UserSubscriptionEditionFieldPatchMutation(
    $id: ID!
    $input: [EditInput]!
  ) {
    userSubscriptionEdit(id: $id) {
      fieldPatch(input: $input) {
        ...UserSubscriptionEdition_userSubscription
      }
    }
  }
`;

const userSubscriptionValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  cron: Yup.string().required(t('This field is required')),
  entities_ids: Yup.array(),
});

const UserSubscriptionEditionContainer = (props) => {
  const {
    t, classes, handleClose, userSubscription,
  } = props;
  const entities = R.pipe(
    R.propOr([], 'entities'),
    R.map((n) => ({
      label: defaultValue(n),
      value: n.id,
      type: n.entity_type,
    })),
  )(userSubscription);
  const initialValues = R.pipe(
    R.assoc('entities_ids', entities),
    R.pickAll(['name', 'cron', 'options', 'entities_ids']),
  )(userSubscription);
  const [filters, setFilters] = useState(
    JSON.parse(props.userSubscription.filters),
  );
  const [options, setOptions] = useState(initialValues.options);
  const handleSubmitField = (name, value) => {
    let finalValue = value;
    if (name === 'entities_ids') {
      finalValue = R.pluck('value', value);
    }
    userSubscriptionValidation(props.t)
      .validateAt(name, { [name]: value })
      .then(() => {
        commitMutation({
          mutation: userSubscriptionMutationFieldPatch,
          variables: {
            id: props.userSubscription.id,
            input: { key: name, value: finalValue || '' },
          },
        });
      })
      .catch(() => false);
  };
  const handleAddFilter = (key, id, value) => {
    let newFilters;
    if (filters[key] && filters[key].length > 0) {
      newFilters = R.assoc(
        key,
        isUniqFilter(key)
          ? [{ id, value }]
          : R.uniqBy(R.prop('id'), [{ id, value }, ...filters[key]]),
        filters,
      );
    } else {
      newFilters = R.assoc(key, [{ id, value }], filters);
    }
    const jsonFilters = JSON.stringify(newFilters);
    commitMutation({
      mutation: userSubscriptionMutationFieldPatch,
      variables: {
        id: props.userSubscription.id,
        input: { key: 'filters', value: jsonFilters },
      },
      onCompleted: () => {
        setFilters(newFilters);
      },
    });
  };
  const handleRemoveFilter = (key) => {
    const newFilters = R.dissoc(key, filters);
    const jsonFilters = JSON.stringify(newFilters);
    const variables = {
      id: props.userSubscription.id,
      input: { key: 'filters', value: jsonFilters },
    };
    commitMutation({
      mutation: userSubscriptionMutationFieldPatch,
      variables,
      onCompleted: () => {
        setFilters(newFilters);
      },
    });
  };

  const handleChangeOption = (currentOption) => {
    const newOptions = options.includes(currentOption)
      ? R.filter((n) => n !== currentOption, options)
      : [...options, currentOption];
    const variables = {
      id: props.userSubscription.id,
      input: { key: 'options', value: newOptions },
    };
    commitMutation({
      mutation: userSubscriptionMutationFieldPatch,
      variables,
      onCompleted: () => {
        setOptions(newOptions);
      },
    });
  };

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
        <Typography variant="h6">{t('Update a subscription')}</Typography>
      </div>
      <div className={classes.container}>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={userSubscriptionValidation(t)}
        >
          {() => (
            <Form style={{ margin: '20px 0 20px 0' }}>
              <Field
                component={TextField}
                name="name"
                label={t('Name')}
                fullWidth={true}
                onSubmit={handleSubmitField}
              />
              <Field
                component={SelectField}
                name="cron"
                label={t('Periodicity')}
                fullWidth={true}
                containerstyle={{ width: '100%', marginTop: 20 }}
                onChange={handleSubmitField}
              >
                <MenuItem value="5-minutes">{t('As it happens')}</MenuItem>
                <MenuItem value="1-hours">{t('Every 1 hour')}</MenuItem>
                <MenuItem value="24-hours">{t('Every 24 hours')}</MenuItem>
                <MenuItem value="1-week">{t('Every week')}</MenuItem>
              </Field>
              <FormControl component="fieldset" style={{ marginTop: 20 }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={initialValues.options.includes('KNOWLEDGE')}
                        onChange={() => handleChangeOption('KNOWLEDGE')}
                        name="KNOWLEDGE"
                      />
                    }
                    label={t(
                      'Knowledge update (except indicators & observables)',
                    )}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={initialValues.options.includes('CONTAINERS')}
                        onChange={() => handleChangeOption('CONTAINERS')}
                        name="CONTAINERS"
                      />
                    }
                    label={t('Containers (reports, notes & opinions)')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={initialValues.options.includes('TECHNICAL')}
                        onChange={() => handleChangeOption('TECHNICAL')}
                        name="TECHNICAL"
                      />
                    }
                    label={t('Technical elements (indicators & observables)')}
                  />
                </FormGroup>
              </FormControl>
              <StixDomainObjectsField
                name="entities_ids"
                types={[
                  'Threat-Actor',
                  'Intrusion-Set',
                  'Campaign',
                  'Incident',
                  'Malware',
                  'Vulnerability',
                  'Tool',
                ]}
                multiple={true}
                fullWidth={true}
                style={{ width: '100%', marginTop: 20 }}
                helpertext={t(
                  'Optional, you may want to subscribe to specific entities.',
                )}
                onChange={handleSubmitField}
              />
              <div style={{ marginTop: 35 }}>
                <Filters
                  variant="text"
                  availableFilterKeys={[
                    'markedBy',
                    'labelledBy',
                    'createdBy',
                    'confidence_gt',
                  ]}
                  currentFilters={[]}
                  handleAddFilter={handleAddFilter}
                  noDirectFilters={true}
                />
              </div>
              <div className="clearfix" />
              <div className={classes.filters}>
                {R.map((currentFilter) => {
                  const label = `${truncate(
                    t(`filter_${currentFilter[0]}`),
                    20,
                  )}`;
                  const values = (
                    <span>
                      {R.map(
                        (n) => (
                          <span key={n.value}>
                            {n.value && n.value.length > 0
                              ? truncate(n.value, 15)
                              : t('No label')}{' '}
                            {R.last(currentFilter[1]).value !== n.value && (
                              <code>OR</code>
                            )}{' '}
                          </span>
                        ),
                        currentFilter[1],
                      )}
                    </span>
                  );
                  return (
                    <span key={currentFilter[0]}>
                      <Chip
                        classes={{ root: classes.filter }}
                        label={
                          <div>
                            <strong>{label}</strong>: {values}
                          </div>
                        }
                        onDelete={() => handleRemoveFilter(currentFilter[0])}
                      />
                      {R.last(R.toPairs(filters))[0] !== currentFilter[0] && (
                        <Chip
                          classes={{ root: classes.operator }}
                          label={t('AND')}
                        />
                      )}
                    </span>
                  );
                }, R.toPairs(filters))}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

UserSubscriptionEditionContainer.propTypes = {
  handleClose: PropTypes.func,
  classes: PropTypes.object,
  userSubscription: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

const UserSubscriptionEditionFragment = createFragmentContainer(
  UserSubscriptionEditionContainer,
  {
    userSubscription: graphql`
      fragment UserSubscriptionEdition_userSubscription on UserSubscription {
        id
        name
        cron
        options
        filters
        entities_ids
        entities {
          ... on BasicObject {
            id
            entity_type
            parent_types
          }
          ... on StixCoreObject {
            created_at
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
                }
              }
            }
          }
          ... on StixDomainObject {
            created
          }
          ... on AttackPattern {
            name
            x_mitre_id
          }
          ... on Campaign {
            name
            first_seen
          }
          ... on CourseOfAction {
            name
          }
          ... on Note {
            attribute_abstract
            content
          }
          ... on ObservedData {
            first_observed
            last_observed
          }
          ... on Opinion {
            opinion
          }
          ... on Report {
            name
            published
          }
          ... on Individual {
            name
          }
          ... on Organization {
            name
          }
          ... on Sector {
            name
          }
          ... on System {
            name
          }
          ... on Indicator {
            name
            valid_from
          }
          ... on Infrastructure {
            name
          }
          ... on IntrusionSet {
            name
          }
          ... on Position {
            name
          }
          ... on City {
            name
          }
          ... on Country {
            name
          }
          ... on Region {
            name
          }
          ... on Malware {
            name
            first_seen
            last_seen
          }
          ... on ThreatActor {
            name
            first_seen
            last_seen
          }
          ... on Tool {
            name
          }
          ... on Vulnerability {
            name
          }
          ... on Incident {
            name
            first_seen
            last_seen
          }
        }
      }
    `,
  },
);

export default R.compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(UserSubscriptionEditionFragment);
