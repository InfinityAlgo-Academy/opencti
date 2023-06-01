import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { SimpleFileUpload } from 'formik-mui';
import withStyles from '@mui/styles/withStyles';
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
import inject18n from '../../../../components/i18n';
import {
  commitMutation,
  handleErrorInForm,
} from '../../../../relay/environment';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import MarkDownField from '../../../../components/MarkDownField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';

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
    transition: theme.transitions.create('right', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
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
});

const artifactMutation = graphql`
  mutation ArtifactCreationMutation(
    $file: Upload!
    $x_opencti_description: String
    $createdBy: String
    $objectMarking: [String]
    $objectLabel: [String]
  ) {
    artifactImport(
      file: $file
      x_opencti_description: $x_opencti_description
      createdBy: $createdBy
      objectMarking: $objectMarking
      objectLabel: $objectLabel
    ) {
      ...ArtifactLine_node
    }
  }
`;

const artifactValidation = (t) => Yup.object().shape({
  file: Yup.mixed().required(t('This field is required')),
  x_opencti_description: Yup.string().nullable(),
});

const sharedUpdater = (store, userId, paginationOptions, newEdge) => {
  const userProxy = store.get(userId);
  const conn = ConnectionHandler.getConnection(
    userProxy,
    'Pagination_stixCyberObservables',
    paginationOptions,
  );
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

class ArtifactCreation extends Component {
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

  onSubmit(values, { setSubmitting, setErrors, resetForm }) {
    const adaptedValues = R.evolve(
      {
        createdBy: R.path(['value']),
        objectMarking: R.pluck('value'),
        objectLabel: R.pluck('value'),
      },
      values,
    );
    commitMutation({
      mutation: artifactMutation,
      variables: {
        file: values.file,
        ...adaptedValues,
      },
      updater: (store) => {
        const payload = store.getRootField('artifactImport');
        const newEdge = payload.setLinkedRecord(payload, 'node'); // Creation of the pagination container.
        const container = store.getRoot();
        sharedUpdater(
          store,
          container.getDataID(),
          this.props.paginationOptions,
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
        this.handleClose();
      },
    });
  }

  onReset() {
    this.handleClose();
  }

  render() {
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
          sx={{ zIndex: 1202 }}
          elevation={1}
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleClose.bind(this)}
        >
          <div className={classes.header}>
            <IconButton
              aria-label="Close"
              className={classes.closeButton}
              onClick={this.handleClose.bind(this)}
              size="large"
              color="primary"
            >
              <Close fontSize="small" color="primary" />
            </IconButton>
            <Typography variant="h6">{t('Create an artifact')}</Typography>
          </div>
          <div className={classes.container}>
            <Formik
              initialValues={{
                x_opencti_description: '',
                file: '',
                createdBy: '',
                objectMarking: [],
                objectLabel: [],
              }}
              validationSchema={artifactValidation(t)}
              onSubmit={this.onSubmit.bind(this)}
              onReset={this.onReset.bind(this)}
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
                    component={SimpleFileUpload}
                    name="file"
                    label={t('File')}
                    FormControlProps={{ style: { width: '100%' } }}
                    InputLabelProps={{ fullWidth: true, variant: 'standard' }}
                    InputProps={{
                      fullWidth: true,
                      variant: 'standard',
                    }}
                    fullWidth={true}
                  />
                  <Field
                    component={MarkDownField}
                    name="x_opencti_description"
                    label={t('Description')}
                    fullWidth={true}
                    multiline={true}
                    rows="4"
                    style={{ marginTop: 20 }}
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
  }
}

ArtifactCreation.propTypes = {
  paginationOptions: PropTypes.object,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  openExports: PropTypes.bool,
};

export default R.compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(ArtifactCreation);
