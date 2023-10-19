import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import { Field, Form, Formik } from 'formik';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import * as Yup from 'yup';
import { graphql } from 'react-relay';
import * as R from 'ramda';
import Tooltip from '@mui/material/Tooltip';
import { InformationOutline } from 'mdi-material-ui';
import Drawer, { DrawerVariant } from '../../common/drawer/Drawer';
import inject18n from '../../../../components/i18n';
import { commitMutation, MESSAGING$ } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import Filters from '../../common/lists/Filters';
import { isUniqFilter } from '../../../../utils/filters/filtersUtils';
import FilterIconButton from '../../../../components/FilterIconButton';
import { insertNode } from '../../../../utils/store';

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
    right: 230,
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
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
});

const RetentionCreationMutation = graphql`
  mutation RetentionCreationMutation($input: RetentionRuleAddInput!) {
    retentionRuleAdd(input: $input) {
      ...RetentionLine_node
    }
  }
`;

const RetentionCheckMutation = graphql`
  mutation RetentionCreationCheckMutation($input: RetentionRuleAddInput!) {
    retentionRuleCheck(input: $input)
  }
`;

const RetentionCreationValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  max_retention: Yup.number().min(1, t('This field must be >= 1')),
});

const RetentionCreation = (props) => {
  const { t, classes } = props;
  const [filters, setFilters] = useState({});
  const [verified, setVerified] = useState(false);

  const onSubmit = (values, { setSubmitting, resetForm }) => {
    const finalValues = R.pipe(
      R.assoc('max_retention', Number(values.max_retention)),
    )(values);
    const jsonFilters = JSON.stringify(filters);
    commitMutation({
      mutation: RetentionCreationMutation,
      variables: {
        input: { ...finalValues, filters: jsonFilters },
      },
      updater: (store) => {
        insertNode(
          store,
          'Pagination_retentionRules',
          props.paginationOptions,
          'retentionRuleAdd',
        );
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
      },
    });
  };

  const handleVerify = (values) => {
    const finalValues = R.pipe(
      R.assoc('max_retention', Number(values.max_retention)),
    )(values);
    const jsonFilters = JSON.stringify(filters);
    commitMutation({
      mutation: RetentionCheckMutation,
      variables: {
        input: { ...finalValues, filters: jsonFilters },
      },
      onCompleted: (data) => {
        setVerified(true);
        MESSAGING$.notifySuccess(
          t(`Retention policy will delete ${data.retentionRuleCheck} elements`),
        );
      },
      onError: () => {
        setVerified(false);
      },
    });
  };

  const handleAddFilter = (key, id, value) => {
    setVerified(false);
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
    setVerified(false);
    setFilters(R.dissoc(key, filters));
  };

  return (
    <Drawer
      title={t('Create a retention policy')}
      variant={DrawerVariant.createWithPanel}
      onClose={() => setFilters({})}
    >
      {({ onClose }) => (
        <Formik
          initialValues={{ name: '', max_retention: '31' }}
          validationSchema={RetentionCreationValidation(t)}
          onSubmit={onSubmit}
          onReset={onClose}
        >
          {({ submitForm, handleReset, isSubmitting, values: formValues }) => (
            <Form style={{ margin: '20px 0 20px 0' }}>
              <Field
                component={TextField}
                variant="standard"
                name="name"
                label={t('Name')}
                fullWidth={true}
              />
              <Field
                component={TextField}
                variant="standard"
                name="max_retention"
                label={t('Maximum retention days')}
                fullWidth={true}
                onChange={() => setVerified(false)}
                style={{ marginTop: 20 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        title={t(
                          'All objects matching the filters that have not been updated since this amount of days will be deleted',
                        )}
                      >
                        <InformationOutline
                          fontSize="small"
                          color="primary"
                          style={{ cursor: 'default' }}
                        />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              <div style={{ paddingTop: 35 }}>
                <Filters
                  variant="text"
                  availableFilterKeys={[
                    'entity_type',
                    'x_opencti_workflow_id',
                    'assigneeTo',
                    'objectContains',
                    'markedBy',
                    'labelledBy',
                    'creator',
                    'createdBy',
                    'priority',
                    'severity',
                    'x_opencti_score',
                    'x_opencti_detection',
                    'x_opencti_main_observable_type',
                    'revoked',
                    'confidence',
                    'indicator_types',
                    'pattern_type',
                    'fromId',
                    'toId',
                    'fromTypes',
                    'toTypes',
                  ]}
                  currentFilters={[]}
                  handleAddFilter={handleAddFilter}
                  noDirectFilters={true}
                />
              </div>
              <div className="clearfix" />
              <FilterIconButton
                filters={filters}
                handleRemoveFilter={handleRemoveFilter}
                classNameNumber={2}
                styleNumber={2}
                redirection
              />
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
                  color="secondary"
                  onClick={() => handleVerify(formValues)}
                  disabled={isSubmitting}
                  classes={{ root: classes.button }}
                >
                  {t('Verify')}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={submitForm}
                  disabled={!verified || isSubmitting}
                  classes={{ root: classes.button }}
                >
                  {t('Create')}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </Drawer>
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
