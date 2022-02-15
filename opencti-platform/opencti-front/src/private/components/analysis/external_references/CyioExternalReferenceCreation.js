import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { compose } from 'ramda';
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
import { commitMutation as CM } from 'react-relay';
import environmentDarkLight from '../../../../relay/environmentDarkLight';
// import { commitMutation } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import TextField from '../../../../components/TextField';
import MarkDownField from '../../../../components/MarkDownField';
// import { insertNode } from '../../../../utils/Store';

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
  dialogRoot: {
    padding: '24px',
  },
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  createButtonContextual: {
    // position: 'fixed',
    // bottom: 30,
    // right: 30,
    zIndex: 3000,
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

const cyioExternalReferenceCreationMutation = graphql`
  mutation CyioExternalReferenceCreationMutation(
    $input: CyioExternalReferenceAddInput!
  ) {
    createCyioExternalReference(input: $input) {
      id
      source_name
      description
      url
      external_id
      created
    }
  }
`;

const cyioExternalReferenceValidation = (t) => Yup.object().shape({
  source_name: Yup.string().required(t('This field is required')),
  external_id: Yup.string(),
  url: Yup.string().url(t('The value must be an URL')),
  description: Yup.string(),
});

class CyioExternalReferenceCreation extends Component {
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
    CM(environmentDarkLight, {
      mutation: cyioExternalReferenceCreationMutation,
      variables: {
        input: values,
      },
      // updater: (store) => insertNode(
      //   store,
      //   'Pagination_externalReferences',
      //   this.props.paginationOptions,
      //   'externalReferenceAdd',
      // ),
      setSubmitting,
      onCompleted: (response) => {
        setSubmitting(false);
        resetForm();
        this.handleClose();
        if (this.props.onCreate) {
          this.props.onCreate(response.createCyioExternalReference, true);
        }
      },
      // onError: (err) => console.log('ExternalReferenceCreationMutationError', err),
    });
    // commitMutation({
    //   mutation: cyioExternalReferenceCreationMutation,
    //   variables: {
    //     input: values,
    //   },
    //   updater: (store) => insertNode(
    //     store,
    //     'Pagination_externalReferences',
    //     this.props.paginationOptions,
    //     'externalReferenceAdd',
    //   ),
    //   setSubmitting,
    //   onCompleted: (response) => {
    //     setSubmitting(false);
    //     resetForm();
    //     this.handleClose();
    //     if (this.props.onCreate) {
    //       this.props.onCreate(response.externalReferenceAdd, true);
    //     }
    //   },
    // });
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
            <Typography variant="h6">
              {t('Create an external reference')}
            </Typography>
          </div>
          <div className={classes.container}>
            <Formik
              initialValues={{
                source_name: '',
                external_id: '',
                url: '',
                description: '',
              }}
              validationSchema={cyioExternalReferenceValidation(t)}
              onSubmit={this.onSubmit.bind(this)}
              onReset={this.onResetClassic.bind(this)}
            >
              {({ submitForm, handleReset, isSubmitting }) => (
                <Form style={{ margin: '20px 0 20px 0' }}>
                  <Field
                    component={TextField}
                    name="source_name"
                    label={t('Source name')}
                    fullWidth={true}
                  />
                  <Field
                    component={TextField}
                    name="external_id"
                    label={t('External ID')}
                    fullWidth={true}
                    style={{ marginTop: 20 }}
                  />
                  <Field
                    component={TextField}
                    name="url"
                    label={t('URL')}
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
        <IconButton
          color="inherit"
          aria-label="Add"
          edge="end"
          onClick={this.handleOpen.bind(this)}
        >
          <Add fontSize="small" />
        </IconButton>
        <Dialog
          open={this.state.open}
          classes={{ root: classes.dialogRoot }}
          onClose={this.handleClose.bind(this)}
        >
          <Formik
            enableReinitialize={true}
            initialValues={{
              source_name: inputValue,
              external_id: '',
              url: '',
              description: '',
            }}
            validationSchema={cyioExternalReferenceValidation(t)}
            onSubmit={this.onSubmit.bind(this)}
            onReset={this.onResetContextual.bind(this)}
          >
            {({ submitForm, handleReset, isSubmitting }) => (
              <Form>
                <DialogTitle>{t('Create an external reference')}</DialogTitle>
                <DialogContent>
                  <Field
                    component={TextField}
                    name="source_name"
                    label={t('Source name')}
                    fullWidth={true}
                  />
                  <Field
                    component={TextField}
                    name="external_id"
                    label={t('External ID')}
                    fullWidth={true}
                    style={{ marginTop: 20 }}
                  />
                  <Field
                    component={TextField}
                    name="url"
                    label={t('URL')}
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
                </DialogContent>
                <DialogActions style={{ float: 'left', marginLeft: '15px' }}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    {t('Cancel')}
                  </Button>
                  <Button
                    variant="contained"
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

CyioExternalReferenceCreation.propTypes = {
  paginationOptions: PropTypes.object,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  contextual: PropTypes.bool,
  display: PropTypes.bool,
  inputValue: PropTypes.string,
  onCreate: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(CyioExternalReferenceCreation);
