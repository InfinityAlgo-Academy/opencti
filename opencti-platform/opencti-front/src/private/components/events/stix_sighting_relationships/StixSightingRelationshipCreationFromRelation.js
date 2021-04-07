import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form, Formik, Field } from 'formik';
import graphql from 'babel-plugin-relay/macro';
import {
  assoc, compose, includes, pipe, pluck, filter,
} from 'ramda';
import * as Yup from 'yup';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { Add, ArrowRightAlt, Close } from '@material-ui/icons';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import Fab from '@material-ui/core/Fab';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ConnectionHandler } from 'relay-runtime';
import { commitMutation, QueryRenderer } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import { itemColor } from '../../../../utils/Colors';
import { dayStartDate, parse } from '../../../../utils/Time';
import ItemIcon from '../../../../components/ItemIcon';
import TextField from '../../../../components/TextField';
import DatePickerField from '../../../../components/DatePickerField';
import StixSightingRelationshipCreationFromRelationStixDomainObjectsLines, {
  stixSightingRelationshipCreationFromRelationStixDomainObjectsLinesQuery,
} from './StixSightingRelationshipCreationFromRelationStixDomainObjectsLines';
import StixSightingRelationshipCreationFromRelationStixCyberObservablesLines, {
  stixSightingRelationshipCreationFromRelationStixCyberObservablesLinesQuery,
} from './StixSightingRelationshipCreationFromRelationStixCyberObservablesLines';
import StixDomainObjectCreation from '../../common/stix_domain_objects/StixDomainObjectCreation';
import SearchInput from '../../../../components/SearchInput';
import { truncate } from '../../../../utils/String';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import ConfidenceField from '../../common/form/ConfidenceField';
import SwitchField from '../../../../components/SwitchField';
import MarkDownField from '../../../../components/MarkDownField';

const styles = (theme) => ({
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
    zIndex: 1001,
  },
  createButtonWithPadding: {
    position: 'fixed',
    bottom: 30,
    right: 240,
    zIndex: 1001,
  },
  title: {
    float: 'left',
  },
  search: {
    float: 'right',
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
  container: {
    padding: 0,
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
  avatar: {
    width: 24,
    height: 24,
  },
  containerRelation: {
    padding: '10px 20px 20px 20px',
  },
  item: {
    position: 'absolute',
    width: 180,
    height: 80,
    borderRadius: 10,
  },
  itemHeader: {
    padding: '10px 0 10px 0',
  },
  icon: {
    position: 'absolute',
    top: 8,
    left: 5,
    fontSize: 8,
  },
  type: {
    width: '100%',
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 11,
  },
  content: {
    width: '100%',
    height: 40,
    maxHeight: 40,
    lineHeight: '40px',
    color: '#ffffff',
    textAlign: 'center',
  },
  name: {
    display: 'inline-block',
    lineHeight: 1,
    fontSize: 12,
    verticalAlign: 'middle',
  },
  relation: {
    position: 'relative',
    height: 100,
    transition: 'background-color 0.1s ease',
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.1)',
    },
    padding: 10,
    marginBottom: 10,
  },
  relationCreation: {
    position: 'relative',
    height: 100,
    transition: 'background-color 0.1s ease',
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.1)',
    },
    padding: 10,
  },
  relationCreate: {
    position: 'relative',
    height: 100,
  },
  middle: {
    margin: '0 auto',
    width: 200,
    textAlign: 'center',
    padding: 0,
    color: '#ffffff',
  },
  buttonBack: {
    marginTop: 20,
    textAlign: 'left',
    float: 'left',
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
    float: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
});

const stixSightingRelationshipCreationFromRelationQuery = graphql`
  query StixSightingRelationshipCreationFromRelationQuery($id: String!) {
    stixCoreRelationship(id: $id) {
      id
      entity_type
      parent_types
      relationship_type
      description
      from {
        ... on BasicObject {
          id
          entity_type
        }
        ... on BasicRelationship {
          id
          entity_type
        }
        ... on AttackPattern {
          name
        }
        ... on Campaign {
          name
        }
        ... on CourseOfAction {
          name
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
        ... on Indicator {
          name
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
        }
        ... on ThreatActor {
          name
        }
        ... on Tool {
          name
        }
        ... on Vulnerability {
          name
        }
        ... on XOpenCTIIncident {
          name
        }
        ... on StixCyberObservable {
          observable_value
        }
      }
      to {
        ... on BasicObject {
          id
          entity_type
        }
        ... on BasicRelationship {
          id
          entity_type
        }
        ... on AttackPattern {
          name
        }
        ... on Campaign {
          name
        }
        ... on CourseOfAction {
          name
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
        ... on Indicator {
          name
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
        }
        ... on ThreatActor {
          name
        }
        ... on Tool {
          name
        }
        ... on Vulnerability {
          name
        }
        ... on XOpenCTIIncident {
          name
        }
        ... on StixCyberObservable {
          observable_value
        }
      }
    }
  }
`;

const stixSightingRelationshipCreationFromRelationMutation = graphql`
  mutation StixSightingRelationshipCreationFromRelationMutation(
    $input: StixSightingRelationshipAddInput!
  ) {
    stixSightingRelationshipAdd(input: $input) {
      ...EntityStixSightingRelationshipLine_node
    }
  }
`;

const stixSightingRelationshipValidation = (t) => Yup.object().shape({
  number: Yup.number()
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
  negative: Yup.boolean(),
});

const sharedUpdater = (store, userId, paginationOptions, newEdge) => {
  const userProxy = store.get(userId);
  const conn = ConnectionHandler.getConnection(
    userProxy,
    'Pagination_stixSightingRelationships',
    paginationOptions,
  );
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

class StixSightingRelationshipCreationFromRelation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      step: 0,
      targetEntity: null,
      search: '',
    };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ step: 0, targetEntity: null, open: false });
  }

  onSubmit(values, { setSubmitting, resetForm }) {
    const { isFrom, entityId } = this.props;
    const { targetEntity } = this.state;
    const fromEntityId = isFrom ? entityId : targetEntity.id;
    const toEntityId = isFrom ? targetEntity.id : entityId;
    const finalValues = pipe(
      assoc('number', parseInt(values.number, 10)),
      assoc('fromId', fromEntityId),
      assoc('toId', toEntityId),
      assoc('first_seen', parse(values.first_seen).format()),
      assoc('last_seen', parse(values.last_seen).format()),
      assoc('createdBy', values.createdBy.value),
      assoc('objectMarking', pluck('value', values.objectMarking)),
    )(values);
    commitMutation({
      mutation: stixSightingRelationshipCreationFromRelationMutation,
      variables: { input: finalValues },
      updater: (store) => {
        if (typeof this.props.onCreate !== 'function') {
          const payload = store.getRootField('stixSightingRelationshipAdd');
          const newEdge = payload.setLinkedRecord(payload, 'node');
          const container = store.getRoot();
          sharedUpdater(
            store,
            container.getDataID(),
            this.props.paginationOptions,
            newEdge,
          );
        }
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        this.handleClose();
        if (typeof this.props.onCreate === 'function') {
          this.props.onCreate();
        }
      },
    });
  }

  handleResetSelection() {
    this.setState({ step: 0, targetEntity: null });
  }

  handleSearch(keyword) {
    this.setState({ search: keyword });
  }

  handleSelectEntity(stixDomainObject) {
    this.setState({ step: 1, targetEntity: stixDomainObject });
  }

  renderFakeList() {
    return (
      <List>
        {Array.from(Array(20), (e, i) => (
          <ListItem key={i} divider={true} button={false}>
            <ListItemIcon>
              <Avatar classes={{ root: this.props.classes.avatar }}>{i}</Avatar>
            </ListItemIcon>
            <ListItemText
              primary={<span className="fakeItem" style={{ width: '80%' }} />}
              secondary={<span className="fakeItem" style={{ width: '90%' }} />}
            />
          </ListItem>
        ))}
      </List>
    );
  }

  renderSelectEntity() {
    const {
      classes,
      t,
      targetStixDomainObjectTypes,
      onlyObservables,
    } = this.props;
    const stixDomainObjectsPaginationOptions = {
      search: this.state.search,
      types: targetStixDomainObjectTypes
        ? filter(
          (n) => n !== 'Stix-Cyber-Observable',
          targetStixDomainObjectTypes,
        )
        : null,
      orderBy: 'created_at',
      orderMode: 'desc',
    };
    return (
      <div>
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={this.handleClose.bind(this)}
          >
            <Close fontSize="small" />
          </IconButton>
          <Typography variant="h6" classes={{ root: classes.title }}>
            {t('Create a sighting')}
          </Typography>
          <div className={classes.search}>
            <SearchInput
              variant="inDrawer"
              placeholder={`${t('Search')}...`}
              onSubmit={this.handleSearch.bind(this)}
            />
          </div>
          <div className="clearfix" />
        </div>
        <div className={classes.containerList}>
          {!onlyObservables ? (
            <QueryRenderer
              query={
                stixSightingRelationshipCreationFromRelationStixDomainObjectsLinesQuery
              }
              variables={{ count: 25, ...stixDomainObjectsPaginationOptions }}
              render={({ props }) => {
                if (props) {
                  return (
                    <StixSightingRelationshipCreationFromRelationStixDomainObjectsLines
                      handleSelect={this.handleSelectEntity.bind(this)}
                      data={props}
                    />
                  );
                }
                return this.renderFakeList();
              }}
            />
          ) : (
            ''
          )}
          <QueryRenderer
            query={
              stixSightingRelationshipCreationFromRelationStixCyberObservablesLinesQuery
            }
            variables={{
              search: this.state.search,
              types: targetStixDomainObjectTypes,
              count: 50,
              orderBy: 'created_at',
              orderMode: 'desc',
            }}
            render={({ props }) => {
              if (props) {
                return (
                  <StixSightingRelationshipCreationFromRelationStixCyberObservablesLines
                    handleSelect={this.handleSelectEntity.bind(this)}
                    data={props}
                  />
                );
              }
              return onlyObservables ? (
                this.renderFakeList()
              ) : (
                <div> &nbsp; </div>
              );
            }}
          />
          <StixDomainObjectCreation
            display={this.state.open}
            contextual={true}
            inputValue={this.state.search}
            paginationOptions={stixDomainObjectsPaginationOptions}
            targetStixDomainObjectTypes={targetStixDomainObjectTypes}
          />
        </div>
      </div>
    );
  }

  renderForm(sourceEntity) {
    const { t, classes, isFrom } = this.props;
    const { targetEntity } = this.state;
    let fromEntity = sourceEntity;
    let toEntity = targetEntity;
    if (!isFrom) {
      fromEntity = targetEntity;
      toEntity = sourceEntity;
    }
    const initialValues = {
      confidence: 15,
      number: 1,
      first_seen: dayStartDate(),
      last_seen: dayStartDate(),
      description: '',
      objectMarking: [],
      createdBy: '',
      negative: false,
    };
    return (
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={stixSightingRelationshipValidation(t)}
        onSubmit={this.onSubmit.bind(this)}
        onReset={this.handleClose.bind(this)}
      >
        {({
          submitForm, handleReset, isSubmitting, setFieldValue,
        }) => (
          <Form>
            <div className={classes.header}>
              <IconButton
                aria-label="Close"
                className={classes.closeButton}
                onClick={this.handleClose.bind(this)}
              >
                <Close fontSize="small" />
              </IconButton>
              <Typography variant="h6">{t('Create a sighting')}</Typography>
            </div>
            <div className={classes.containerRelation}>
              <div className={classes.relationCreate}>
                <div
                  className={classes.item}
                  style={{
                    border: `2px solid ${itemColor(fromEntity.entity_type)}`,
                    top: 10,
                    left: 0,
                  }}
                >
                  <div
                    className={classes.itemHeader}
                    style={{
                      borderBottom: `1px solid ${itemColor(
                        fromEntity.entity_type,
                      )}`,
                    }}
                  >
                    <div className={classes.icon}>
                      <ItemIcon
                        type={fromEntity.entity_type}
                        color={itemColor(fromEntity.entity_type)}
                        size="small"
                      />
                    </div>
                    <div className={classes.type}>
                      {includes(
                        'Stix-Cyber-Observable',
                        fromEntity.parent_types,
                      )
                        ? t(`observable_${fromEntity.entity_type}`)
                        : t(
                          `entity_${
                            fromEntity.entity_type === 'stix_relation'
                              || fromEntity.entity_type === 'stix-relation'
                              ? fromEntity.parent_types[0]
                              : fromEntity.entity_type
                          }`,
                        )}
                    </div>
                  </div>
                  <div className={classes.content}>
                    <span className={classes.name}>
                      {truncate(
                        /* eslint-disable-next-line no-nested-ternary */
                        includes(
                          'Stix-Cyber-Observable',
                          fromEntity.parent_types,
                        )
                          ? fromEntity.observable_value
                          : fromEntity.entity_type === 'stix_relation'
                            || fromEntity.entity_type === 'stix-relation'
                            ? `${fromEntity.from.name} ${String.fromCharCode(
                              8594,
                            )} ${fromEntity.to.name}`
                            : fromEntity.name,
                        20,
                      )}
                    </span>
                  </div>
                </div>
                <div className={classes.middle} style={{ paddingTop: 25 }}>
                  <ArrowRightAlt fontSize="large" />
                </div>
                <div
                  className={classes.item}
                  style={{
                    border: `2px solid ${itemColor(toEntity.entity_type)}`,
                    top: 10,
                    right: 0,
                  }}
                >
                  <div
                    className={classes.itemHeader}
                    style={{
                      borderBottom: `1px solid ${itemColor(
                        toEntity.entity_type,
                      )}`,
                    }}
                  >
                    <div className={classes.icon}>
                      <ItemIcon
                        type={toEntity.entity_type}
                        color={itemColor(toEntity.entity_type)}
                        size="small"
                      />
                    </div>
                    <div className={classes.type}>
                      {includes('Stix-Cyber-Observable', toEntity.parent_types)
                        ? t(`observable_${toEntity.entity_type}`)
                        : t(
                          `entity_${
                            toEntity.entity_type === 'stix_relation'
                              || toEntity.entity_type === 'stix-relation'
                              ? toEntity.parent_types[0]
                              : toEntity.entity_type
                          }`,
                        )}
                    </div>
                  </div>
                  <div className={classes.content}>
                    <span className={classes.name}>
                      {truncate(
                        /* eslint-disable-next-line no-nested-ternary */
                        includes('Stix-Cyber-Observable', toEntity.parent_types)
                          ? toEntity.observable_value
                          : toEntity.entity_type === 'stix_relation'
                            || toEntity.entity_type === 'stix-relation'
                            ? `${toEntity.from.name} ${String.fromCharCode(
                              8594,
                            )} ${toEntity.to.name}`
                            : toEntity.name,
                        20,
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <Field
                component={TextField}
                name="number"
                label={t('Count')}
                fullWidth={true}
                type="number"
                style={{ marginTop: 20 }}
              />
              <ConfidenceField
                name="confidence"
                label={t('Confidence level')}
                fullWidth={true}
                containerstyle={{ marginTop: 20, width: '100%' }}
              />
              <Field
                component={DatePickerField}
                name="first_seen"
                label={t('First seen')}
                invalidDateMessage={t('The value must be a date (YYYY-MM-DD)')}
                fullWidth={true}
                style={{ marginTop: 20 }}
              />
              <Field
                component={DatePickerField}
                name="last_seen"
                label={t('Last seen')}
                invalidDateMessage={t('The value must be a date (YYYY-MM-DD)')}
                fullWidth={true}
                style={{ marginTop: 20 }}
              />
              <Field
                component={MarkDownField}
                name="description"
                label={t('Description')}
                fullWidth={true}
                multiline={true}
                rows="4"
                style={{ marginTop: 20 }}
              />
              <CreatedByField
                name="createdBy"
                style={{ marginTop: 20, width: '100%' }}
                setFieldValue={setFieldValue}
              />
              <ObjectMarkingField
                name="objectMarking"
                style={{ marginTop: 20, width: '100%' }}
              />
              <Field
                component={SwitchField}
                type="checkbox"
                name="negative"
                label={t('False positive')}
                containerstyle={{ marginTop: 20 }}
              />
              <div className={classes.buttonBack}>
                <Button
                  variant="contained"
                  onClick={this.handleResetSelection.bind(this)}
                  disabled={isSubmitting}
                >
                  {t('Back')}
                </Button>
              </div>
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
            </div>
          </Form>
        )}
      </Formik>
    );
  }

  // eslint-disable-next-line
  renderLoader() {
    return (
      <div style={{ display: 'table', height: '100%', width: '100%' }}>
        <span
          style={{
            display: 'table-cell',
            verticalAlign: 'middle',
            textAlign: 'center',
          }}
        >
          <CircularProgress size={80} thickness={2} />
        </span>
      </div>
    );
  }

  render() {
    const {
      classes, entityId, variant, paddingRight,
    } = this.props;
    const { open, step } = this.state;
    return (
      <div>
        {variant === 'inLine' ? (
          <IconButton
            color="secondary"
            aria-label="Label"
            onClick={this.handleOpen.bind(this)}
            style={{ float: 'left', margin: '-15px 0 0 -2px' }}
          >
            <Add fontSize="small" />
          </IconButton>
        ) : (
          <Fab
            onClick={this.handleOpen.bind(this)}
            color="secondary"
            aria-label="Add"
            className={
              paddingRight
                ? classes.createButtonWithPadding
                : classes.createButton
            }
          >
            <Add />
          </Fab>
        )}
        <Drawer
          open={open}
          anchor="right"
          classes={{ paper: this.props.classes.drawerPaper }}
          onClose={this.handleClose.bind(this)}
        >
          <QueryRenderer
            query={stixSightingRelationshipCreationFromRelationQuery}
            variables={{ id: entityId }}
            render={({ props }) => {
              if (props && props.stixEntity) {
                return (
                  <div style={{ height: '100%' }}>
                    {step === 0 ? this.renderSelectEntity() : ''}
                    {step === 1 ? this.renderForm(props.stixEntity) : ''}
                  </div>
                );
              }
              return this.renderLoader();
            }}
          />
        </Drawer>
      </div>
    );
  }
}

StixSightingRelationshipCreationFromRelation.propTypes = {
  entityId: PropTypes.string,
  isFrom: PropTypes.bool,
  targetStixDomainObjectTypes: PropTypes.array,
  paginationOptions: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  nsd: PropTypes.func,
  variant: PropTypes.string,
  onCreate: PropTypes.func,
  paddingRight: PropTypes.bool,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixSightingRelationshipCreationFromRelation);
