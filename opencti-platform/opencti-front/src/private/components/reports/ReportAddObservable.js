import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Fab from '@material-ui/core/Fab';
import { Add, Close } from '@material-ui/icons';
import {
  compose,
  pathOr,
  map,
  union,
  pipe,
  pluck,
  head,
  forEach,
  assoc,
} from 'ramda';
import * as Yup from 'yup';
import graphql from 'babel-plugin-relay/macro';
import { dateMonthsAgo, dateMonthsAfter, parse } from '../../../utils/Time';
import inject18n from '../../../components/i18n';
import { fetchQuery, commitMutation } from '../../../relay/environment';
import Autocomplete from '../../../components/Autocomplete';
import TextField from '../../../components/TextField';
import DatePickerField from '../../../components/DatePickerField';
import Select from '../../../components/Select';
import { markingDefinitionsSearchQuery } from '../settings/MarkingDefinitions';

const styles = theme => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
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
});

const reportAddObservableThreatsSearchQuery = graphql`
  query ReportAddObservableThreatsSearchQuery($search: String, $first: Int) {
    threatActors(search: $search, first: $first) {
      edges {
        node {
          id
          name
          entity_type
        }
      }
    }
    intrusionSets(search: $search, first: $first) {
      edges {
        node {
          id
          name
          entity_type
        }
      }
    }
    campaigns(search: $search, first: $first) {
      edges {
        node {
          id
          name
          entity_type
        }
      }
    }
    incidents(search: $search, first: $first) {
      edges {
        node {
          id
          name
          entity_type
        }
      }
    }
    malwares(search: $search, first: $first) {
      edges {
        node {
          id
          name
          entity_type
        }
      }
    }
  }
`;

const reportAddObservableObservableSearchQuery = graphql`
  query ReportAddObservableObservableSearchQuery($observableValue: String) {
    stixObservables(observableValue: $observableValue) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const stixObservableMutation = graphql`
  mutation ReportAddObservableMutation($input: StixObservableAddInput!) {
    stixObservableAdd(input: $input) {
      id
    }
  }
`;

const reportAddObservableStixRelationSearchQuery = graphql`
  query ReportAddObservableStixRelationSearchQuery(
    $fromId: String
    $toId: String
    $relationType: String
    $lastSeenStart: DateTime
    $lastSeenStop: DateTime
  ) {
    stixRelations(
      fromId: $fromId
      toId: $toId
      relationType: $relationType
      lastSeenStart: $lastSeenStart
      lastSeenStop: $lastSeenStop
    ) {
      edges {
        node {
          id
          from {
            id
          }
          to {
            id
          }
        }
      }
    }
  }
`;

const reportMutationRelationCreate = graphql`
  mutation ReportAddObservableRelationCreateMutation(
    $input: StixRelationAddInput!
  ) {
    stixRelationAdd(input: $input) {
      id
      relationship_type
      weight
      first_seen
      last_seen
    }
  }
`;

const reportMutationRelationAddSimple = graphql`
  mutation ReportAddObservableRelationAddSimpleMutation(
    $id: ID!
    $input: RelationAddInput!
  ) {
    reportEdit(id: $id) {
      relationAdd(input: $input) {
        node {
          id
        }
        relation {
          id
        }
      }
    }
  }
`;

const reportMutationRelationAdd = graphql`
  mutation ReportAddObservableRelationAddMutation(
    $id: ID!
    $input: RelationAddInput!
    $relationType: String
  ) {
    reportEdit(id: $id) {
      relationAdd(input: $input) {
        node {
          ...ReportObservables_report @arguments(relationType: $relationType)
        }
        relation {
          id
        }
      }
    }
  }
`;

const reportValidation = t => Yup.object().shape({
  type: Yup.string().required(t('This field is required')),
  role_played: Yup.string().required(t('This field is required')),
  observable_value: Yup.string().required(t('This field is required')),
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
  threats: Yup.array().required(t('This field is required')),
  markingDefinitions: Yup.array(),
});

class ReportAddObservable extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, threats: [], markingDefinitions: [] };
  }

  searchThreats(event) {
    fetchQuery(reportAddObservableThreatsSearchQuery, {
      search: event.target.value,
      first: 10,
    }).then((data) => {
      const result = pathOr([], ['threatActors', 'edges'], data)
        .concat(pathOr([], ['intrusionSets', 'edges'], data))
        .concat(pathOr([], ['campaigns', 'edges'], data))
        .concat(pathOr([], ['incidents', 'edges'], data))
        .concat(pathOr([], ['malwares', 'edges'], data));
      const threats = map(
        n => ({
          label: n.node.name,
          value: n.node.id,
          type: n.node.entity_type,
        }),
        result,
      );
      this.setState({ threats: union(this.state.threats, threats) });
    });
  }

  searchMarkingDefinitions(event) {
    fetchQuery(markingDefinitionsSearchQuery, {
      search: event.target.value,
    }).then((data) => {
      const markingDefinitions = pipe(
        pathOr([], ['markingDefinitions', 'edges']),
        map(n => ({ label: n.node.definition, value: n.node.id })),
      )(data);
      this.setState({
        markingDefinitions: union(
          this.state.markingDefinitions,
          markingDefinitions,
        ),
      });
    });
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  onSubmit(values, { setSubmitting, resetForm }) {
    const finalValues = pipe(
      assoc('first_seen', parse(values.first_seen).format()),
      assoc('last_seen', parse(values.first_seen).format()),
      assoc('markingDefinitions', pluck('value', values.markingDefinitions)),
      assoc('threats', pluck('value', values.threats)),
    )(values);
    setSubmitting(true);
    fetchQuery(reportAddObservableObservableSearchQuery, {
      observableValue: finalValues.observable_value,
    }).then((data) => {
      if (data.stixObservables.edges.length === 0) {
        commitMutation({
          mutation: stixObservableMutation,
          variables: {
            input: {
              type: finalValues.type,
              observable_value: finalValues.observable_value,
              markingDefinitions: finalValues.markingDefinitions,
            },
          },
          onCompleted: (result) => {
            const observableId = result.stixObservableAdd.id;
            this.createRelations(
              finalValues,
              observableId,
              setSubmitting,
              resetForm,
            );
          },
        });
      } else {
        const observableId = head(data.stixObservables.edges).node.id;
        this.createRelations(
          finalValues,
          observableId,
          setSubmitting,
          resetForm,
        );
      }
    });
  }

  createRelations(values, observableId, setSubmitting, resetForm) {
    const { objectRefsIds } = this.props;
    forEach((threat) => {
      fetchQuery(reportAddObservableStixRelationSearchQuery, {
        fromId: threat,
        toId: observableId,
        relationType: 'indicates',
        lastSeenStart: dateMonthsAgo(values.last_seen, 1),
        lastSeenStop: dateMonthsAfter(values.last_seen, 1),
      }).then((result) => {
        if (result.stixRelations.edges.length === 0) {
          commitMutation({
            mutation: reportMutationRelationCreate,
            variables: {
              input: {
                fromId: observableId,
                fromRole: 'indicator',
                toId: threat,
                toRole: 'characterize',
                relationship_type: 'indicates',
                role_played: values.role_played,
                first_seen: values.first_seen,
                last_seen: values.last_seen,
                weight: values.weight,
              },
            },
            onCompleted: (data) => {
              const relationId = data.stixRelationAdd.id;
              const inputRelation = {
                fromRole: 'so',
                toId: this.props.reportId,
                toRole: 'knowledge_aggregation',
                through: 'object_refs',
              };
              const inputFrom = {
                fromRole: 'so',
                toId: this.props.reportId,
                toRole: 'knowledge_aggregation',
                through: 'object_refs',
              };
              const inputTo = {
                fromRole: 'so',
                toId: this.props.reportId,
                toRole: 'knowledge_aggregation',
                through: 'object_refs',
              };
              if (!objectRefsIds.includes(threat)) {
                commitMutation({
                  mutation: reportMutationRelationAddSimple,
                  variables: {
                    id: threat,
                    input: inputFrom,
                  },
                });
              }
              if (!objectRefsIds.includes(observableId)) {
                commitMutation({
                  mutation: reportMutationRelationAddSimple,
                  variables: {
                    id: observableId,
                    input: inputTo,
                  },
                });
              }
              commitMutation({
                mutation: reportMutationRelationAdd,
                variables: {
                  id: relationId,
                  relationType: 'indicates',
                  input: inputRelation,
                },
                onCompleted: () => {
                  setSubmitting(false);
                  resetForm();
                  this.handleClose();
                },
              });
            },
          });
        } else {
          const relationId = head(result.stixRelations.edges).node.id;
          const relationFromId = head(result.stixRelations.edges).node.from.id;
          const relationToId = head(result.stixRelations.edges).node.to.id;
          const inputRelation = {
            fromRole: 'so',
            toId: this.props.reportId,
            toRole: 'knowledge_aggregation',
            through: 'object_refs',
          };
          const inputFrom = {
            fromRole: 'so',
            toId: this.props.reportId,
            toRole: 'knowledge_aggregation',
            through: 'object_refs',
          };
          const inputTo = {
            fromRole: 'so',
            toId: this.props.reportId,
            toRole: 'knowledge_aggregation',
            through: 'object_refs',
          };
          if (!objectRefsIds.includes(relationFromId)) {
            commitMutation({
              mutation: reportMutationRelationAddSimple,
              variables: {
                id: relationFromId,
                input: inputFrom,
              },
            });
          }
          if (!objectRefsIds.includes(relationToId)) {
            commitMutation({
              mutation: reportMutationRelationAddSimple,
              variables: {
                id: relationToId,
                input: inputTo,
              },
            });
          }
          commitMutation({
            mutation: reportMutationRelationAdd,
            variables: {
              id: relationId,
              relationType: 'indicates',
              input: inputRelation,
            },
            onCompleted: () => {
              setSubmitting(false);
              resetForm();
              this.handleClose();
            },
          });
        }
      });
    }, values.threats);
  }

  onReset() {
    this.handleClose();
  }

  render() {
    const {
      t, classes, firstSeen, lastSeen, weight,
    } = this.props;
    const defaultWeight = weight || 3;
    const defaultFirstSeen = firstSeen || null;
    const defaultLastSeen = lastSeen || null;
    return (
      <div>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="secondary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Drawer
          open={this.state.open}
          anchor="right"
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleClose.bind(this)}
        >
          <div className={classes.header}>
            <IconButton
              aria-label="Close"
              className={classes.closeButton}
              onClick={this.handleClose.bind(this)}
            >
              <Close fontSize="small" />
            </IconButton>
            <Typography variant="h6">{t('Add observable')}</Typography>
          </div>
          <div className={classes.container}>
            <Formik
              initialValues={{
                type: '',
                role_played: '',
                observable_value: '',
                weight: defaultWeight,
                first_seen: defaultFirstSeen,
                last_seen: defaultLastSeen,
                description: '',
                threats: [],
                markingDefinitions: [],
              }}
              validationSchema={reportValidation(t)}
              onSubmit={this.onSubmit.bind(this)}
              onReset={this.onReset.bind(this)}
              render={({ submitForm, handleReset, isSubmitting }) => (
                <div>
                  <Form style={{ margin: '20px 0 20px 0' }}>
                    <Field
                      name="type"
                      component={Select}
                      label={t('Observable type')}
                      fullWidth={true}
                      inputProps={{
                        name: 'type',
                        id: 'type',
                      }}
                      containerstyle={{ width: '100%' }}
                    >
                      <MenuItem value="Domain">{t('Domain')}</MenuItem>
                      <MenuItem value="Email-Address">
                        {t('Email address')}
                      </MenuItem>
                      <MenuItem value="Email-Subject">
                        {t('Email subject')}
                      </MenuItem>
                      <MenuItem value="File-Name">{t('File name')}</MenuItem>
                      <MenuItem value="File-Path">{t('File path')}</MenuItem>
                      <MenuItem value="File-MD5">{t('File MD5 hash')}</MenuItem>
                      <MenuItem value="File-SHA1">
                        {t('File SHA1 hash')}
                      </MenuItem>
                      <MenuItem value="File-SHA256">
                        {t('File SHA256 hash')}
                      </MenuItem>
                      <MenuItem value="IPv4-Addr">{t('IPv4 address')}</MenuItem>
                      <MenuItem value="IPv6-Addr">{t('IPv6 address')}</MenuItem>
                      <MenuItem value="Mutex">{t('Mutex')}</MenuItem>
                      <MenuItem value="PDB-Path">{t('PDB Path')}</MenuItem>
                      <MenuItem value="Registry-Key">
                        {t('Registry key')}
                      </MenuItem>
                      <MenuItem value="Registry-Key-Value">
                        {t('Registry key value')}
                      </MenuItem>
                      <MenuItem value="Mutex">{t('Mutex')}</MenuItem>
                      <MenuItem value="URL">{t('URL')}</MenuItem>
                      <MenuItem value="Windows-Service-Name">
                        {t('Windows Service Name')}
                      </MenuItem>
                      <MenuItem value="Windows-Service-Display-Name">
                        {t('Windows Service Display Name')}
                      </MenuItem>
                      <MenuItem value="Windows-Scheduled-Task">
                        {t('Windows Scheduled Task')}
                      </MenuItem>
                      <MenuItem value="X509-Certificate-Issuer">
                        {t('X509 Certificate Issuer')}
                      </MenuItem>
                      <MenuItem value="X509-Certificate-Serial-Number">
                        {t('X509 Certificate Serial number')}
                      </MenuItem>
                    </Field>
                    <Field
                      name="role_played"
                      component={Select}
                      label={t('Played role')}
                      fullWidth={true}
                      inputProps={{
                        name: 'role_played',
                        id: 'role_played',
                      }}
                      containerstyle={{ marginTop: 20, width: '100%' }}
                    >
                      <MenuItem value="C2 server">{t('C2 server')}</MenuItem>
                      <MenuItem value="Relay node">{t('Relay node')}</MenuItem>
                      <MenuItem value="Proxy">{t('Proxy')}</MenuItem>
                      <MenuItem value="Sender">{t('Sender')}</MenuItem>
                      <MenuItem value="Implant">{t('Implant')}</MenuItem>
                    </Field>
                    <Field
                      name="observable_value"
                      component={TextField}
                      label={t('Observable value')}
                      fullWidth={true}
                      multiline={true}
                      rows="4"
                      style={{ marginTop: 20 }}
                    />
                    <Field
                      name="weight"
                      component={Select}
                      label={t('Confidence level')}
                      fullWidth={true}
                      inputProps={{
                        name: 'weight',
                        id: 'weight',
                      }}
                      containerstyle={{ marginTop: 20, width: '100%' }}
                    >
                      <MenuItem value={1}>{t('Very low')}</MenuItem>
                      <MenuItem value={2}>{t('Low')}</MenuItem>
                      <MenuItem value={3}>{t('Medium')}</MenuItem>
                      <MenuItem value={4}>{t('High')}</MenuItem>
                      <MenuItem value={5}>{t('Very high')}</MenuItem>
                    </Field>
                    <Field
                      name="first_seen"
                      component={DatePickerField}
                      label={t('First seen')}
                      fullWidth={true}
                      style={{ marginTop: 20 }}
                    />
                    <Field
                      name="last_seen"
                      component={DatePickerField}
                      label={t('Last seen')}
                      fullWidth={true}
                      style={{ marginTop: 20 }}
                    />
                    <Field
                      name="description"
                      component={TextField}
                      label={t('Description')}
                      fullWidth={true}
                      multiline={true}
                      rows="4"
                      style={{ marginTop: 20 }}
                    />
                    <Field
                      name="threats"
                      component={Autocomplete}
                      multiple={true}
                      label={t('Linked threat(s)')}
                      options={this.state.threats}
                      onInputChange={this.searchThreats.bind(this)}
                    />
                    <Field
                      name="markingDefinitions"
                      component={Autocomplete}
                      multiple={true}
                      label={t('Marking')}
                      options={this.state.markingDefinitions}
                      onInputChange={this.searchMarkingDefinitions.bind(this)}
                    />
                    <div className={classes.buttons}>
                      <Button
                        variant="contained"
                        onClick={handleReset}
                        disabled={isSubmitting}
                        classes={{ root: classes.button }}
                      >
                        {t('Cancel')}
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={submitForm}
                        disabled={isSubmitting}
                        classes={{ root: classes.button }}
                      >
                        {t('Create')}
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
            />
          </div>
        </Drawer>
      </div>
    );
  }
}

ReportAddObservable.propTypes = {
  reportId: PropTypes.string,
  objectRefsIds: PropTypes.array,
  firstSeen: PropTypes.string,
  lastSeen: PropTypes.string,
  weight: PropTypes.number,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles),
)(ReportAddObservable);
