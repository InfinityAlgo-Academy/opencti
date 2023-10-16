import React from 'react';
import { Field, Form, Formik } from 'formik';
import Button from '@mui/material/Button';
import * as R from 'ramda';
import { omit } from 'ramda';
import * as Yup from 'yup';
import { makeStyles } from '@mui/styles';
import { graphql } from 'react-relay';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Drawer, { DrawerVariant } from '../../common/drawer/Drawer';
import { useFormatter } from '../../../../components/i18n';
import { commitMutation } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import MarkdownField from '../../../../components/MarkdownField';
import ObjectOrganizationField from '../../common/form/ObjectOrganizationField';
import PasswordPolicies from '../../common/form/PasswordPolicies';
import SelectField from '../../../../components/SelectField';
import DateTimePickerField from '../../../../components/DateTimePickerField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import useAuth from '../../../../utils/hooks/useAuth';
import { insertNode } from '../../../../utils/store';

const useStyles = makeStyles((theme) => ({
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

const userMutation = graphql`
  mutation UserCreationMutation($input: UserAddInput!) {
    userAdd(input: $input) {
      ...UserLine_node
    }
  }
`;

const userValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  user_email: Yup.string()
    .required(t('This field is required'))
    .email(t('The value must be an email address')),
  firstname: Yup.string().nullable(),
  lastname: Yup.string().nullable(),
  description: Yup.string().nullable(),
  password: Yup.string().required(t('This field is required')),
  confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], t('The values do not match'))
    .required(t('This field is required')),
});

const UserCreation = ({ paginationOptions }) => {
  const { settings } = useAuth();
  const { t } = useFormatter();
  const classes = useStyles();
  const onSubmit = (values, { setSubmitting, resetForm }) => {
    const finalValues = R.pipe(
      omit(['confirmation']),
      R.assoc(
        'objectOrganization',
        R.pluck('value', values.objectOrganization),
      ),
    )(values);
    commitMutation({
      mutation: userMutation,
      variables: {
        input: finalValues,
      },
      updater: (store) => insertNode(store, 'Pagination_users', paginationOptions, 'userAdd'),
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
      },
    });
  };

  return (
    <Drawer
      title={t('Create a user')}
      variant={DrawerVariant.createWithPanel}
    >
      {({ onClose }) => (
        <>
          <Alert severity="info">
            {t('User will be created with default groups.')}
          </Alert>
          <br />
          <Formik
            initialValues={{
              name: '',
              user_email: '',
              firstname: '',
              lastname: '',
              description: '',
              password: '',
              confirmation: '',
              objectOrganization: [],
              account_status: 'Active',
              account_lock_after_date: null,
            }}
            validationSchema={userValidation(t)}
            onSubmit={onSubmit}
            onReset={onClose}
          >
            {({ submitForm, handleReset, isSubmitting }) => (
              <Form>
                <Field
                  component={TextField}
                  name="name"
                  label={t('Name')}
                  fullWidth={true}
                />
                <Field
                  component={TextField}
                  variant="standard"
                  name="user_email"
                  label={t('Email address')}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                />
                <Field
                  component={TextField}
                  variant="standard"
                  name="firstname"
                  label={t('Firstname')}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                />
                <Field
                  component={TextField}
                  variant="standard"
                  name="lastname"
                  label={t('Lastname')}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                />
                <Field
                  component={MarkdownField}
                  name="description"
                  label={t('Description')}
                  fullWidth={true}
                  multiline={true}
                  rows={4}
                  style={{ marginTop: 20 }}
                />
                <PasswordPolicies />
                <Field
                  component={TextField}
                  variant="standard"
                  name="password"
                  label={t('Password')}
                  type="password"
                  style={{ marginTop: 20 }}
                  fullWidth={true}
                />
                <Field
                  component={TextField}
                  variant="standard"
                  name="confirmation"
                  label={t('Confirmation')}
                  type="password"
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                />
                <ObjectOrganizationField
                  outlined={false}
                  name="objectOrganization"
                  label="Organizations"
                  style={fieldSpacingContainerStyle}
                />
                <Field
                  component={SelectField}
                  variant="standard"
                  name="account_status"
                  label={t('Account Status')}
                  fullWidth={true}
                  containerstyle={fieldSpacingContainerStyle}
                >
                  {settings.platform_user_statuses.map((s) => {
                    return (
                      <MenuItem key={s.status} value={s.status}>
                        {t(s.status)}
                      </MenuItem>
                    );
                  })}
                </Field>
                <Field
                  component={DateTimePickerField}
                  name="account_lock_after_date"
                  TextFieldProps={{
                    label: t('Account Expire Date'),
                    style: fieldSpacingContainerStyle,
                    variant: 'standard',
                    fullWidth: true,
                  }}
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
        </>
      )}
    </Drawer>
  );
};

export default UserCreation;
