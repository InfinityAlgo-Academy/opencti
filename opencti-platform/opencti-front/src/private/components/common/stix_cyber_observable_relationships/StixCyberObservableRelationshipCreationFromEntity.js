import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { graphql } from 'react-relay';
import * as R from 'ramda';
import * as Yup from 'yup';
import withStyles from '@mui/styles/withStyles';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { Close, ArrowRightAlt, Add } from '@mui/icons-material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import { ConnectionHandler } from 'relay-runtime';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { commitMutation, QueryRenderer } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import { itemColor } from '../../../../utils/Colors';
import { dayStartDate, parse } from '../../../../utils/Time';
import {
  resolveStixCyberObservableRelationshipsTargetTypes,
  resolveStixCyberObservableRelationshipsTypes,
} from '../../../../utils/Relation';
import ItemIcon from '../../../../components/ItemIcon';
import SelectField from '../../../../components/SelectField';
import DatePickerField from '../../../../components/DatePickerField';
import StixCyberObservableRelationCreationFromEntityLines, {
  stixCyberObservableRelationshipCreationFromEntityLinesQuery,
} from './StixCyberObservableRelationshipCreationFromEntityLines';
import StixCyberObservableCreation from '../../observations/stix_cyber_observables/StixCyberObservableCreation';
import SearchInput from '../../../../components/SearchInput';
import { truncate } from '../../../../utils/String';
import { defaultValue } from '../../../../utils/Graph';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
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
  title: {
    float: 'left',
  },
  search: {
    float: 'right',
  },
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
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
    color: theme.palette.text.primary,
    fontSize: 11,
  },
  content: {
    width: '100%',
    height: 40,
    maxHeight: 40,
    lineHeight: '40px',
    color: theme.palette.text.primary,
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
    color: theme.palette.text.primary,
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

const stixCyberObservableRelationshipCreationFromEntityQuery = graphql`
  query StixCyberObservableRelationshipCreationFromEntityQuery($id: String!) {
    stixObjectOrStixRelationship(id: $id) {
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
        description
      }
      ... on Campaign {
        name
        description
      }
      ... on CourseOfAction {
        name
        description
      }
      ... on Individual {
        name
        description
      }
      ... on Organization {
        name
        description
      }
      ... on Sector {
        name
        description
      }
      ... on System {
        name
        description
      }
      ... on Indicator {
        name
        description
      }
      ... on Infrastructure {
        name
        description
      }
      ... on IntrusionSet {
        name
        description
      }
      ... on Position {
        name
        description
      }
      ... on City {
        name
        description
      }
      ... on Country {
        name
        description
      }
      ... on Region {
        name
        description
      }
      ... on Malware {
        name
        description
      }
      ... on ThreatActor {
        name
        description
      }
      ... on Tool {
        name
        description
      }
      ... on Vulnerability {
        name
        description
      }
      ... on Incident {
        name
        description
      }
      ... on StixCyberObservable {
        observable_value
      }
    }
  }
`;

const stixCyberObservableRelationshipCreationFromEntityMutation = graphql`
  mutation StixCyberObservableRelationshipCreationFromEntityMutation(
    $input: StixCyberObservableRelationshipAddInput!
  ) {
    stixCyberObservableRelationshipAdd(input: $input) {
      id
      relationship_type
      start_time
      stop_time
      from {
        ... on StixCyberObservable {
          id
          entity_type
          observable_value
          created_at
          updated_at
        }
      }
      to {
        ... on StixCyberObservable {
          id
          entity_type
          observable_value
          created_at
          updated_at
        }
      }
    }
  }
`;

const stixCyberObservableRelationshipValidation = (t) => Yup.object().shape({
  relationship_type: Yup.string().required(t('This field is required')),
  start_time: Yup.date()
    .typeError(t('The value must be a date (YYYY-MM-DD)'))
    .required(t('This field is required')),
  stop_time: Yup.date()
    .typeError(t('The value must be a date (YYYY-MM-DD)'))
    .required(t('This field is required')),
});

const sharedUpdater = (store, userId, paginationOptions, newEdge) => {
  const userProxy = store.get(userId);
  const conn = ConnectionHandler.getConnection(
    userProxy,
    'Pagination_stixCyberObservableRelationships',
    paginationOptions,
  );
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

class StixCyberObservableRelationshipCreationFromEntity extends Component {
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
    this.setState({
      search: '',
      step: 0,
      targetEntity: null,
      open: false,
    });
  }

  onSubmit(isRelationReversed, values, { setSubmitting, resetForm }) {
    const fromEntityId = isRelationReversed
      ? this.state.targetEntity.id
      : this.props.entityId;
    const toEntityId = isRelationReversed
      ? this.props.entityId
      : this.state.targetEntity.id;
    const finalValues = R.pipe(
      R.assoc('fromId', fromEntityId),
      R.assoc('toId', toEntityId),
      R.assoc('start_time', parse(values.start_time).format()),
      R.assoc('stop_time', parse(values.stop_time).format()),
    )(values);
    commitMutation({
      mutation: stixCyberObservableRelationshipCreationFromEntityMutation,
      variables: {
        input: finalValues,
      },
      updater: (store) => {
        const payload = store.getRootField(
          'stixCyberObservableRelationshipAdd',
        );
        const newEdge = payload.setLinkedRecord(payload, 'node');
        const container = store.getRoot();
        sharedUpdater(
          store,
          container.getDataID(),
          this.props.paginationOptions,
          newEdge,
        );
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        this.handleClose();
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

  renderSelectEntity() {
    const { search } = this.state;
    const { classes, t, entityType } = this.props;
    const paginationOptions = {
      search,
      orderBy: search.length > 0 ? null : 'created_at',
      orderMode: search.length > 0 ? null : 'desc',
    };
    return (
      <div>
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={this.handleClose.bind(this)}
            size="large"
          >
            <Close fontSize="small" color="primary" />
          </IconButton>
          <Typography variant="h6" classes={{ root: classes.title }}>
            {t('Create a relationship')}
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
          {search.length === 0 && (
            <Alert
              severity="info"
              variant="outlined"
              style={{ margin: '15px 15px 0 15px' }}
              classes={{ message: classes.info }}
            >
              {t(
                'This panel shows by default the latest created entities, use the search to find more.',
              )}
            </Alert>
          )}
          <QueryRenderer
            query={stixCyberObservableRelationshipCreationFromEntityLinesQuery}
            variables={{ count: 25, ...paginationOptions }}
            render={({ props }) => {
              if (props) {
                return (
                  <StixCyberObservableRelationCreationFromEntityLines
                    entityType={entityType}
                    handleSelect={this.handleSelectEntity.bind(this)}
                    data={props}
                  />
                );
              }
              return (
                <List>
                  {Array.from(Array(20), (e, i) => (
                    <ListItem key={i} divider={true} button={false}>
                      <ListItemIcon>
                        <Skeleton
                          animation="wave"
                          variant="circular"
                          width={30}
                          height={30}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Skeleton
                            animation="wave"
                            variant="rectangular"
                            width="90%"
                            height={15}
                            style={{ marginBottom: 10 }}
                          />
                        }
                        secondary={
                          <Skeleton
                            animation="wave"
                            variant="rectangular"
                            width="90%"
                            height={15}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              );
            }}
          />
          <StixCyberObservableCreation
            display={this.state.open}
            contextual={true}
            inputValue={this.state.search}
            paginationKey="Pagination_stixCyberObservables"
            paginationOptions={paginationOptions}
          />
        </div>
      </div>
    );
  }

  renderForm(sourceEntity) {
    const { t, classes, entityType } = this.props;
    const { targetEntity } = this.state;
    const { fromTypes, toTypes } = resolveStixCyberObservableRelationshipsTargetTypes(entityType);
    let fromEntity = sourceEntity;
    let toEntity = targetEntity;
    let isRelationReversed = false;
    if (
      !toTypes.includes(toEntity.entity_type)
      && fromTypes.includes(toEntity.entity_type)
    ) {
      fromEntity = targetEntity;
      toEntity = sourceEntity;
      isRelationReversed = true;
    }
    const relationshipTypes = resolveStixCyberObservableRelationshipsTypes(
      fromEntity.entity_type,
      toEntity.entity_type,
    );
    const defaultRelationshipType = R.head(relationshipTypes)
      ? R.head(relationshipTypes)
      : 'linked-to';
    const initialValues = {
      relationship_type: defaultRelationshipType,
      start_time: dayStartDate(),
      stop_time: dayStartDate(),
    };
    return (
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={stixCyberObservableRelationshipValidation(t)}
        onSubmit={this.onSubmit.bind(this, isRelationReversed)}
        onReset={this.handleClose.bind(this)}
      >
        {({ submitForm, handleReset, isSubmitting }) => (
          <Form>
            <div className={classes.header}>
              <IconButton
                aria-label="Close"
                className={classes.closeButton}
                onClick={this.handleClose.bind(this)}
                size="large"
              >
                <Close fontSize="small" color="primary" />
              </IconButton>
              <Typography variant="h6">{t('Create a relationship')}</Typography>
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
                      {t(`entity_${fromEntity.entity_type}`)}
                    </div>
                  </div>
                  <div className={classes.content}>
                    <span className={classes.name}>
                      {truncate(defaultValue(fromEntity), 20)}
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
                      {t(`entity_${toEntity.entity_type}`)}
                    </div>
                  </div>
                  <div className={classes.content}>
                    <span className={classes.name}>
                      {truncate(defaultValue(toEntity), 20)}
                    </span>
                  </div>
                </div>
              </div>
              <Field
                component={SelectField}
                variant="standard"
                name="relationship_type"
                label={t('Relationship type')}
                fullWidth={true}
                containerstyle={{ marginTop: 20, width: '100%' }}
              >
                {R.map(
                  (type) => (
                    <MenuItem key={type} value={type}>
                      {t(`relationship_${type}`)}
                    </MenuItem>
                  ),
                  relationshipTypes,
                )}
              </Field>
              <Field
                component={DatePickerField}
                name="start_time"
                invalidDateMessage={t('The value must be a date (mm/dd/yyyy)')}
                TextFieldProps={{
                  label: t('Start time'),
                  variant: 'standard',
                  fullWidth: true,
                  style: { marginTop: 20 },
                }}
              />
              <Field
                component={DatePickerField}
                name="stop_time"
                invalidDateMessage={t('The value must be a date (mm/dd/yyyy)')}
                TextFieldProps={{
                  label: t('Stop time'),
                  variant: 'standard',
                  fullWidth: true,
                  style: { marginTop: 20 },
                }}
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
                  color="secondary"
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
    const { classes, entityId, variant } = this.props;
    const { open, step } = this.state;
    return (
      <div>
        {variant === 'inLine' ? (
          <IconButton
            color="secondary"
            aria-label="Label"
            onClick={this.handleOpen.bind(this)}
            style={{ float: 'left', margin: '-15px 0 0 -2px' }}
            size="large"
          >
            <Add fontSize="small" />
          </IconButton>
        ) : (
          <Fab
            onClick={this.handleOpen.bind(this)}
            color="secondary"
            aria-label="Add"
            className={classes.createButton}
          >
            <Add />
          </Fab>
        )}
        <Drawer
          open={open}
          anchor="right"
          elevation={1}
          sx={{ zIndex: 1202 }}
          classes={{ paper: this.props.classes.drawerPaper }}
          onClose={this.handleClose.bind(this)}
        >
          <QueryRenderer
            query={stixCyberObservableRelationshipCreationFromEntityQuery}
            variables={{ id: entityId }}
            render={({ props }) => {
              if (props && props.stixObjectOrStixRelationship) {
                return (
                  <div>
                    {step === 0 ? this.renderSelectEntity() : ''}
                    {step === 1
                      ? this.renderForm(props.stixObjectOrStixRelationship)
                      : ''}
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

StixCyberObservableRelationshipCreationFromEntity.propTypes = {
  entityId: PropTypes.string,
  entityType: PropTypes.string,
  paginationOptions: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  fsd: PropTypes.func,
  variant: PropTypes.string,
};

export default R.compose(
  inject18n,
  withStyles(styles),
)(StixCyberObservableRelationshipCreationFromEntity);
