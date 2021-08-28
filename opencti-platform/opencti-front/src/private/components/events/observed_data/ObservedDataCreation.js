import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import {
  compose, evolve, path, pluck,
} from 'ramda';
import * as Yup from 'yup';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import { Add, Close } from '@material-ui/icons';
import MenuItem from '@material-ui/core/MenuItem';
import { commitMutation } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import TextField from '../../../../components/TextField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import SelectField from '../../../../components/SelectField';
import { dayStartDate, parse } from '../../../../utils/Time';
import DatePickerField from '../../../../components/DatePickerField';
import ConfidenceField from '../../common/form/ConfidenceField';
import StixCoreObjectsField from '../../common/form/StixCoreObjectsField';
import { insertNode } from '../../../../utils/Store';

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
});

const observedDataCreationMutation = graphql`
  mutation ObservedDataCreationMutation($input: ObservedDataAddInput!) {
    observedDataAdd(input: $input) {
      ...ObservedDataLine_node
    }
  }
`;

const observedDataValidation = (t) => Yup.object().shape({
  objects: Yup.array().required(t('This field is required')),
  first_observed: Yup.date()
    .typeError(t('The value must be a date (YYYY-MM-DD)'))
    .required(t('This field is required')),
  last_observed: Yup.date()
    .typeError(t('The value must be a date (YYYY-MM-DD)'))
    .required(t('This field is required')),
  number_observed: Yup.number().required(t('This field is required')),
  confidence: Yup.number(),
});

class ObservedDataCreation extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  onSubmit(values, { setSubmitting, resetForm }) {
    const adaptedValues = evolve(
      {
        first_observed: parse(values.first_observed).format(),
        last_observed: parse(values.last_observed).format(),
        number_observed: parseInt(values.number_observed, 10),
        createdBy: path(['value']),
        objectMarking: pluck('value'),
        objectLabel: pluck('value'),
        objects: pluck('value'),
      },
      values,
    );
    commitMutation({
      mutation: observedDataCreationMutation,
      variables: {
        input: adaptedValues,
      },
      updater: (store) => insertNode(
        store,
        'Pagination_observedDatas',
        this.props.paginationOptions,
        'observedDataAdd',
      ),
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        this.handleClose();
      },
    });
  }

  onResetClassic() {
    this.handleClose();
  }

  onResetContextual() {
    this.handleClose();
  }

  renderClassic() {
    const { t, classes } = this.props;
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
            <Typography variant="h6">{t('Create an observed data')}</Typography>
          </div>
          <div className={classes.container}>
            <Formik
              initialValues={{
                objects: [],
                first_observed: dayStartDate(),
                last_observed: dayStartDate(),
                number_observed: 1,
                confidence: 15,
                createdBy: '',
                objectMarking: [],
                objectLabel: [],
              }}
              validationSchema={observedDataValidation(t)}
              onSubmit={this.onSubmit.bind(this)}
              onReset={this.onResetClassic.bind(this)}
            >
              {({
                submitForm,
                handleReset,
                isSubmitting,
                setFieldValue,
                values,
              }) => (
                <Form style={{ margin: '20px 0 20px 0' }}>
                  <StixCoreObjectsField
                    name="objects"
                    style={{ width: '100%' }}
                    setFieldValue={setFieldValue}
                    values={values.objects}
                  />
                  <Field
                    component={DatePickerField}
                    name="first_observed"
                    label={t('First observed')}
                    invalidDateMessage={t(
                      'The value must be a date (YYYY-MM-DD)',
                    )}
                    fullWidth={true}
                    style={{ marginTop: 20 }}
                  />
                  <Field
                    component={DatePickerField}
                    name="last_observed"
                    label={t('Last observed')}
                    invalidDateMessage={t(
                      'The value must be a date (YYYY-MM-DD)',
                    )}
                    fullWidth={true}
                    style={{ marginTop: 20 }}
                  />
                  <Field
                    component={TextField}
                    name="number_observed"
                    type="number"
                    label={t('Number observed')}
                    fullWidth={true}
                    style={{ marginTop: 20 }}
                  />
                  <ConfidenceField
                    name="confidence"
                    label={t('Confidence')}
                    fullWidth={true}
                    containerstyle={{ width: '100%', marginTop: 20 }}
                  />
                  <CreatedByField
                    name="createdBy"
                    style={{ marginTop: 20, width: '100%' }}
                    setFieldValue={setFieldValue}
                  />
                  <ObjectLabelField
                    name="objectLabel"
                    style={{ marginTop: 20, width: '100%' }}
                    setFieldValue={setFieldValue}
                    values={values.objectLabel}
                  />
                  <ObjectMarkingField
                    name="objectMarking"
                    style={{ marginTop: 20, width: '100%' }}
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
              )}
            </Formik>
          </div>
        </Drawer>
      </div>
    );
  }

  renderContextual() {
    const {
      t, classes, inputValue, display,
    } = this.props;
    return (
      <div style={{ display: display ? 'block' : 'none' }}>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="secondary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Dialog open={this.state.open} onClose={this.handleClose.bind(this)}>
          <Formik
            enableReinitialize={true}
            initialValues={{
              observedData: inputValue,
              explanation: '',
              createdBy: '',
              objectMarking: [],
              objectLabel: [],
            }}
            validationSchema={observedDataValidation(t)}
            onSubmit={this.onSubmit.bind(this)}
            onReset={this.onResetContextual.bind(this)}
          >
            {({
              submitForm,
              handleReset,
              isSubmitting,
              setFieldValue,
              values,
            }) => (
              <Form>
                <DialogTitle>{t('Create a ObservedData')}</DialogTitle>
                <DialogContent>
                  <Field
                    component={SelectField}
                    name="observedData"
                    label={t('ObservedData')}
                    fullWidth={true}
                    containerstyle={{ width: '100%' }}
                  >
                    <MenuItem value="strongly-disagree">
                      {t('strongly-disagree')}
                    </MenuItem>
                    <MenuItem value="disagree">{t('disagree')}</MenuItem>
                    <MenuItem value="neutral">{t('neutral')}</MenuItem>
                    <MenuItem value="agree">{t('agree')}</MenuItem>
                    <MenuItem value="strongly-agree">
                      {t('strongly-agree')}
                    </MenuItem>
                  </Field>
                  <Field
                    component={TextField}
                    name="explanation"
                    label={t('Explanation')}
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
                  <ObjectLabelField
                    name="objectLabel"
                    style={{ marginTop: 20, width: '100%' }}
                    setFieldValue={setFieldValue}
                    values={values.objectLabel}
                  />
                  <ObjectMarkingField
                    name="objectMarking"
                    style={{ marginTop: 20, width: '100%' }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleReset} disabled={isSubmitting}>
                    {t('Cancel')}
                  </Button>
                  <Button
                    color="primary"
                    onClick={submitForm}
                    disabled={isSubmitting}
                  >
                    {t('Create')}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>
      </div>
    );
  }

  render() {
    const { contextual } = this.props;
    if (contextual) {
      return this.renderContextual();
    }
    return this.renderClassic();
  }
}

ObservedDataCreation.propTypes = {
  paginationOptions: PropTypes.object,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  contextual: PropTypes.bool,
  display: PropTypes.bool,
  inputValue: PropTypes.string,
};

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(ObservedDataCreation);
