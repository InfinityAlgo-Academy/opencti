import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import { Add, Close } from '@material-ui/icons';
import * as Yup from 'yup';
import graphql from 'babel-plugin-relay/macro';
import { ConnectionHandler } from 'relay-runtime';
import Chip from '@material-ui/core/Chip';
import * as R from 'ramda';
import { assoc, pipe } from 'ramda';
import inject18n from '../../../../components/i18n';
import { commitMutation } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import Filters, { isUniqFilter } from '../../common/lists/Filters';
import { truncate } from '../../../../utils/String';

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
    color: theme.palette.navAlt.backgroundHeaderText,
    padding: '20px 20px 20px 60px',
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

const RetentionCreationMutation = graphql`
  mutation RetentionCreationMutation($input: RetentionRuleAddInput!) {
    retentionRuleAdd(input: $input) {
      ...RetentionLine_node
    }
  }
`;

const RetentionCreationValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  max_retention: Yup.number().min(1, t('This field must be >= 1')),
});

const sharedUpdater = (store, userId, paginationOptions, newEdge) => {
  const userProxy = store.get(userId);
  const conn = ConnectionHandler.getConnection(
    userProxy,
    'Pagination_retentionRules',
    paginationOptions,
  );
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

const RetentionCreation = (props) => {
  const { t, classes } = props;
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = (values, { setSubmitting, resetForm }) => {
    const finalValues = pipe(
      assoc('max_retention', Number(values.max_retention)),
    )(values);
    const jsonFilters = JSON.stringify(filters);
    commitMutation({
      mutation: RetentionCreationMutation,
      variables: {
        input: { ...finalValues, filters: jsonFilters },
      },
      updater: (store) => {
        const payload = store.getRootField('retentionRuleAdd');
        const newEdge = payload.setLinkedRecord(payload, 'node');
        const container = store.getRoot();
        sharedUpdater(
          store,
          container.getDataID(),
          props.paginationOptions,
          newEdge,
        );
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        handleClose();
      },
    });
  };

  const onReset = () => {
    handleClose();
  };

  const handleAddFilter = (key, id, value) => {
    if (filters[key] && filters[key].length > 0) {
      setFilters(
        R.assoc(
          key,
          isUniqFilter(key)
            ? [{ id, value }]
            : R.uniqBy(R.prop('id'), [{ id, value }, ...filters[key]]),
          filters,
        ),
      );
    } else {
      setFilters(R.assoc(key, [{ id, value }], filters));
    }
  };

  const handleRemoveFilter = (key) => {
    setFilters(R.dissoc(key, filters));
  };

  return (
    <div>
      <Fab
        onClick={handleOpen}
        color="secondary"
        aria-label="Add"
        className={classes.createButton}
      >
        <Add />
      </Fab>
      <Drawer
        open={open}
        anchor="right"
        classes={{ paper: classes.drawerPaper }}
        onClose={handleClose}
      >
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose}
          >
            <Close fontSize="small" />
          </IconButton>
          <Typography variant="h6">{t('Create a retention policy')}</Typography>
        </div>
        <div className={classes.container}>
          <Formik
            initialValues={{
              name: '',
              max_retention: '31',
            }}
            validationSchema={RetentionCreationValidation(t)}
            onSubmit={onSubmit}
            onReset={onReset}
          >
            {({ submitForm, handleReset, isSubmitting }) => (
              <Form style={{ margin: '20px 0 20px 0' }}>
                <Field
                  component={TextField}
                  name="name"
                  label={t('Name')}
                  fullWidth={true}
                />
                <Field
                  component={TextField}
                  name="max_retention"
                  label={t('Maximum retention days')}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                />
                <div style={{ marginTop: 35 }}>
                  <Filters
                    variant="text"
                    availableFilterKeys={[
                      'entity_type',
                      'markedBy',
                      'labelledBy',
                      'createdBy',
                      'x_opencti_score_gt',
                      'x_opencti_detection',
                      'revoked',
                      'confidence_gt',
                      'pattern_type',
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
                <div className="clearfix" />
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
            )}
          </Formik>
        </div>
      </Drawer>
    </div>
  );
};

RetentionCreation.propTypes = {
  paginationOptions: PropTypes.object,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default R.compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(RetentionCreation);
