import React, { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import { Add, Close } from '@mui/icons-material';
import * as Yup from 'yup';
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import * as R from 'ramda';
import makeStyles from '@mui/styles/makeStyles';
import { useFormatter } from '../../../../components/i18n';
import { commitMutation, handleErrorInForm } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import MarkDownField from '../../../../components/MarkDownField';
import { ExternalReferencesField } from '../../common/form/ExternalReferencesField';
import { parse } from '../../../../utils/Time';
import DateTimePickerField from '../../../../components/DateTimePickerField';
import OpenVocabField from '../../common/form/OpenVocabField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import ObjectLabelField from '../../common/form/ObjectLabelField';

const useStyles = makeStyles((theme) => ({
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
}));

const eventMutation = graphql`
  mutation EventCreationMutation($input: EventAddInput!) {
    eventAdd(input: $input) {
      ...EventLine_node
    }
  }
`;

const eventValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  description: Yup.string().nullable(),
  event_types: Yup.array().nullable(),
  start_time: Yup.date()
    .typeError(t('The value must be a datetime (yyyy-MM-dd hh:mm (a|p)m)'))
    .nullable(),
  stop_time: Yup.date()
    .typeError(t('The value must be a datetime (yyyy-MM-dd hh:mm (a|p)m)'))
    .nullable(),
});

const sharedUpdater = (store, userId, paginationOptions, newEdge) => {
  const userProxy = store.get(userId);
  const conn = ConnectionHandler.getConnection(
    userProxy,
    'Pagination_events',
    paginationOptions,
  );
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

const EventCreation = ({ paginationOptions }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const onReset = () => handleClose();

  const onSubmit = (values, { setSubmitting, setErrors, resetForm }) => {
    const finalValues = R.pipe(
      R.assoc(
        'start_time',
        values.start_time ? parse(values.start_time).format() : null,
      ),
      R.assoc(
        'stop_time',
        values.stop_time ? parse(values.stop_time).format() : null,
      ),
      R.assoc('createdBy', values.createdBy?.value),
      R.assoc('objectMarking', R.pluck('value', values.objectMarking)),
      R.assoc('objectLabel', R.pluck('value', values.objectLabel)),
      R.assoc('externalReferences', R.pluck('value', values.externalReferences)),
    )(values);
    commitMutation({
      mutation: eventMutation,
      variables: {
        input: finalValues,
      },
      updater: (store) => {
        const payload = store.getRootField('eventAdd');
        const newEdge = payload.setLinkedRecord(payload, 'node'); // Creation of the pagination container.
        const container = store.getRoot();
        sharedUpdater(
          store,
          container.getDataID(),
          paginationOptions,
          newEdge,
        );
      },
      onError: (error) => {
        handleErrorInForm(error, setErrors);
        setSubmitting(false);
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        handleClose();
      },
    });
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
        elevation={1}
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
        onClose={handleClose}
      >
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose}
            size="large"
            color="primary"
          >
            <Close fontSize="small" color="primary" />
          </IconButton>
          <Typography variant="h6">{t('Create an event')}</Typography>
        </div>
        <div className={classes.container}>
          <Formik
            initialValues={{
              name: '',
              description: '',
              event_types: [],
              start_time: null,
              stop_time: null,
              createdBy: '',
              objectMarking: [],
              objectLabel: [],
              externalReferences: [],
            }}
            validationSchema={eventValidation(t)}
            onSubmit={onSubmit}
            onReset={onReset}
          >
            {({
              submitForm,
              handleReset,
              isSubmitting,
              setFieldValue,
              values,
            }) => (
              <Form style={{ margin: '20px 0 20px 0' }}>
                <Field
                  component={TextField}
                  variant="standard"
                  name="name"
                  label={t('Name')}
                  fullWidth={true}
                  detectDuplicate={['Event']}
                />
                <OpenVocabField
                  label={t('Event types')}
                  type="event-type-ov"
                  name="event_types"
                  containerStyle={fieldSpacingContainerStyle}
                  multiple={true}
                  onChange={(name, value) => setFieldValue(name, value)}
                />
                <Field
                  component={MarkDownField}
                  name="description"
                  label={t('Description')}
                  fullWidth={true}
                  multiline={true}
                  rows={4}
                  style={{ marginTop: 20 }}
                />
                <Field
                  component={DateTimePickerField}
                  name="start_time"
                  TextFieldProps={{
                    label: t('Start date'),
                    variant: 'standard',
                    fullWidth: true,
                    style: { marginTop: 20 },
                  }}
                />
                <Field
                  component={DateTimePickerField}
                  name="stop_time"
                  TextFieldProps={{
                    label: t('End date'),
                    variant: 'standard',
                    fullWidth: true,
                    style: { marginTop: 20 },
                  }}
                />
                <CreatedByField
                  name="createdBy"
                  style={fieldSpacingContainerStyle}
                  setFieldValue={setFieldValue}
                />
                <ObjectLabelField
                  name="objectLabel"
                  style={fieldSpacingContainerStyle}
                  setFieldValue={setFieldValue}
                  values={values.objectLabel}
                />
                <ObjectMarkingField
                  name="objectMarking"
                  style={fieldSpacingContainerStyle}
                />
                <ExternalReferencesField
                  name="externalReferences"
                  style={fieldSpacingContainerStyle}
                  setFieldValue={setFieldValue}
                  values={values.externalReferences}
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
                    color="secondary"
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

export default EventCreation;
