import React from 'react';
import * as PropTypes from 'prop-types';
import graphql from 'babel-plugin-relay/macro';
import { createFragmentContainer } from 'react-relay';
import { Formik, Form, Field } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import { compose, pick } from 'ramda';
import * as Yup from 'yup';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import inject18n from '../../../components/i18n';
import TextField from '../../../components/TextField';
import SelectField from '../../../components/SelectField';
import { commitMutation, MESSAGING$ } from '../../../relay/environment';
import { OPENCTI_ADMIN_UUID } from '../../../utils/Security';

const styles = () => ({
  panel: {
    width: '50%',
    margin: '0 auto',
    marginBottom: 30,
    padding: '20px 20px 20px 20px',
    textAlign: 'left',
    borderRadius: 6,
  },
});

const profileOverviewFieldPatch = graphql`
  mutation ProfileOverviewFieldPatchMutation($input: EditInput!) {
    meEdit(input: $input) {
      ...UserEditionOverview_user
    }
  }
`;

const renewTokenPatch = graphql`
  mutation ProfileOverviewTokenRenewMutation {
    meTokenRenew {
      ...UserEditionOverview_user
    }
  }
`;

const userValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  user_email: Yup.string()
    .required(t('This field is required'))
    .email(t('The value must be an email address')),
  firstname: Yup.string(),
  lastname: Yup.string(),
  theme: Yup.string(),
  language: Yup.string(),
  description: Yup.string(),
});

const passwordValidation = (t) => Yup.object().shape({
  password: Yup.string().required(t('This field is required')),
  confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], t('The values do not match'))
    .required(t('This field is required')),
});

const ProfileOverviewComponent = (props) => {
  const { t, me, classes } = props;
  const external = me.external === true;
  const initialValues = pick(
    [
      'name',
      'description',
      'user_email',
      'firstname',
      'lastname',
      'theme',
      'language',
    ],
    me,
  );

  const renewToken = () => {
    commitMutation({
      mutation: renewTokenPatch,
    });
  };

  const handleSubmitField = (name, value) => {
    userValidation(t)
      .validateAt(name, { [name]: value })
      .then(() => {
        commitMutation({
          mutation: profileOverviewFieldPatch,
          variables: { input: { key: name, value } },
        });
      })
      .catch(() => false);
  };

  const handleSubmitPasswords = (values, { setSubmitting, resetForm }) => {
    const field = { key: 'password', value: values.password };
    commitMutation({
      mutation: profileOverviewFieldPatch,
      variables: {
        input: field,
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        MESSAGING$.notifySuccess('The password has been updated');
        resetForm();
      },
    });
  };

  return (
      <div>
        <Paper classes={{ root: classes.panel }} elevation={2}>
          <Typography variant="h1" gutterBottom={true}>
            {t('Profile')} {external && `(${t('external')})`}
          </Typography>
          <Formik enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={userValidation(t)}>
            {() => (
              <Form style={{ margin: '20px 0 20px 0' }}>
                <Field
                  component={TextField}
                  name="name"
                  disabled={external}
                  label={t('Name')}
                  fullWidth={true}
                  onSubmit={handleSubmitField}
                />
                <Field
                  component={TextField}
                  name="user_email"
                  disabled={true}
                  label={t('Email address')}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                  onSubmit={handleSubmitField}
                />
                <Field
                  component={TextField}
                  name="firstname"
                  label={t('Firstname')}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                  onSubmit={handleSubmitField}
                />
                <Field
                  component={TextField}
                  name="lastname"
                  label={t('Lastname')}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                  onSubmit={handleSubmitField}
                />
                <Field
                  component={SelectField}
                  name="theme"
                  label={t('Theme')}
                  fullWidth={true}
                  inputProps={{
                    name: 'theme',
                    id: 'theme',
                  }}
                  containerstyle={{ marginTop: 20, width: '100%' }}
                  onChange={handleSubmitField}
                >
                  <MenuItem value="default">{t('Default')}</MenuItem>
                  <MenuItem value="dark">{t('Dark')}</MenuItem>
                  <MenuItem value="light">{t('Light')}</MenuItem>
                </Field>
                <Field
                  component={SelectField}
                  name="language"
                  label={t('Language')}
                  fullWidth={true}
                  inputProps={{
                    name: 'language',
                    id: 'language',
                  }}
                  containerstyle={{ marginTop: 20, width: '100%' }}
                  onChange={handleSubmitField}
                >
                  <MenuItem value="auto">
                    <em>{t('Automatic')}</em>
                  </MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                </Field>
                <Field
                  component={TextField}
                  name="description"
                  label={t('Description')}
                  fullWidth={true}
                  multiline={true}
                  rows={4}
                  style={{ marginTop: 20 }}
                  onSubmit={handleSubmitField}
                />
              </Form>
            )}
          </Formik>
        </Paper>
        <Paper classes={{ root: classes.panel }} elevation={2}>
          <Typography variant="h1" gutterBottom={true}>
            {t('API access')}
          </Typography>
          <div style={{ marginTop: 20 }}>
            <Typography variant="h4" gutterBottom={true}>
              {t('API key')}
            </Typography>
            <pre>{me.api_token}</pre>
            { me.id !== OPENCTI_ADMIN_UUID
            && <Button
                variant="contained"
                color="primary"
                onClick={renewToken}
                style={{ marginBottom: 20 }}>
              {t('Renew')}
            </Button>
            }
            <Typography variant="h4" gutterBottom={true}>
              {t('Required headers')}
            </Typography>
            <pre>
              Content-Type: application/json
              <br />
              Authorization: Bearer {me.api_token}
            </pre>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/graphql"
              target="_blank"
            >
              {t('Playground')}
            </Button>
          </div>
        </Paper>
        {!external && (
          <Paper classes={{ root: classes.panel }} elevation={2}>
            <Typography variant="h1" gutterBottom={true}>
              {t('Password')}
            </Typography>
            <Formik
              enableReinitialize={true}
              initialValues={{ password: '', confirmation: '' }}
              validationSchema={passwordValidation(t)}
              onSubmit={handleSubmitPasswords}
            >
              {({ submitForm, isSubmitting }) => (
                <Form style={{ margin: '20px 0 20px 0' }}>
                  <Field
                    component={TextField}
                    name="password"
                    label={t('Password')}
                    type="password"
                    fullWidth={true}
                  />
                  <Field
                    component={TextField}
                    name="confirmation"
                    label={t('Confirmation')}
                    type="password"
                    fullWidth={true}
                    style={{ marginTop: 20 }}
                  />
                  <div style={{ marginTop: 20 }}>
                    <Button
                      variant="contained"
                      type="button"
                      color="primary"
                      onClick={submitForm}
                      disabled={isSubmitting}
                      classes={{ root: classes.button }}
                    >
                      {t('Update')}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Paper>
        )}
      </div>
  );
};

ProfileOverviewComponent.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  me: PropTypes.object,
};

const ProfileOverview = createFragmentContainer(ProfileOverviewComponent, {
  me: graphql`
    fragment ProfileOverview_me on User {
      id
      name
      user_email
      external
      firstname
      lastname
      language
      theme
      api_token
      description
    }
  `,
});

export default compose(inject18n, withStyles(styles))(ProfileOverview);
