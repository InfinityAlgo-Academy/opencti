import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import { Add } from '@material-ui/icons';
import * as R from 'ramda';
import * as Yup from 'yup';
import graphql from 'babel-plugin-relay/macro';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import MenuItem from '@material-ui/core/MenuItem';
import inject18n from '../../../../components/i18n';
import { commitMutation, QueryRenderer } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import SelectField from '../../../../components/SelectField';

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
    zIndex: 2000,
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

export const statusCreationStatusTemplatesQuery = graphql`
  query StatusCreationStatusTemplatesQuery {
    statusTemplates {
      edges {
        node {
          id
          name
          color
        }
      }
    }
  }
`;

const statusCreationMutation = graphql`
  mutation StatusCreationMutation($id: ID!, $input: StatusAddInput!) {
    subTypeEdit(id: $id) {
      statusAdd(input: $input) {
        ...SubTypeEdition_subType
      }
    }
  }
`;

const statusValidation = (t) => Yup.object().shape({
  template_id: Yup.string().required(t('This field is required')),
  order: Yup.number()
    .typeError(t('The value must be a number'))
    .integer(t('The value must be a number'))
    .required(t('This field is required')),
});

class StatusCreation extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, statuses: [] };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  onSubmit(values, { setSubmitting, resetForm }) {
    const finalValues = R.pipe(R.assoc('order', parseInt(values.order, 10)))(
      values,
    );
    commitMutation({
      mutation: statusCreationMutation,
      variables: {
        id: this.props.subTypeId,
        input: finalValues,
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
    const { t, classes, display } = this.props;
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
        <Formik
          initialValues={{
            template_id: '',
            order: '',
          }}
          validationSchema={statusValidation(t)}
          onSubmit={this.onSubmit.bind(this)}
          onReset={this.onReset.bind(this)}
        >
          {({ submitForm, handleReset, isSubmitting }) => (
            <Form>
              <Dialog
                open={this.state.open}
                onClose={this.handleClose.bind(this)}
                fullWidth={true}
              >
                <DialogTitle>{t('Create a status')}</DialogTitle>
                <DialogContent>
                  <QueryRenderer
                    query={statusCreationStatusTemplatesQuery}
                    render={({ props }) => {
                      if (props && props.statusTemplates) {
                        const statusTemplatesEdges = props.statusTemplates.edges;
                        const statusTemplates = R.map(
                          (n) => n.node,
                          statusTemplatesEdges,
                        );
                        return (
                          <Field
                            component={SelectField}
                            name="template_id"
                            label={t('Name')}
                            fullWidth={true}
                            containerstyle={{ width: '100%' }}
                          >
                            {statusTemplates.map((statusTemplate) => (
                              <MenuItem
                                key={statusTemplate.id}
                                value={statusTemplate.id}
                              >
                                {t(`status_${statusTemplate.name}`)}
                              </MenuItem>
                            ))}
                          </Field>
                        );
                      }
                      return <div />;
                    }}
                  />
                  <Field
                    component={TextField}
                    name="order"
                    label={t('Order')}
                    fullWidth={true}
                    type="number"
                    style={{ marginTop: 20 }}
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
              </Dialog>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}

StatusCreation.propTypes = {
  display: PropTypes.bool,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default R.compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(StatusCreation);
