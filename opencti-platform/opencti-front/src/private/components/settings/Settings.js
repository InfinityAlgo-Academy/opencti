import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { graphql } from 'react-relay';
import withStyles from '@mui/styles/withStyles';
import { Form, Formik, Field } from 'formik';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import * as Yup from 'yup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { ListItemAvatar } from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import { SubscriptionFocus } from '../../../components/Subscription';
import { commitMutation, QueryRenderer } from '../../../relay/environment';
import inject18n from '../../../components/i18n';
import TextField from '../../../components/TextField';
import SelectField from '../../../components/SelectField';
import Loader from '../../../components/Loader';
import MarkDownField from '../../../components/MarkDownField';
import ColorPickerField from '../../../components/ColorPickerField';

const styles = (theme) => ({
  container: {
    margin: 0,
  },
  paper: {
    width: '100%',
    height: '100%',
    padding: '20px 20px 30px 20px',
    textAlign: 'left',
    borderRadius: 6,
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
  button: {
    float: 'right',
    margin: '20px 0 0 0',
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

const settingsQuery = graphql`
  query SettingsQuery {
    settings {
      id
      platform_title
      platform_favicon
      platform_email
      platform_theme
      platform_language
      platform_login_message
      platform_theme_dark_background
      platform_theme_dark_paper
      platform_theme_dark_nav
      platform_theme_dark_primary
      platform_theme_dark_secondary
      platform_theme_dark_accent
      platform_theme_dark_logo
      platform_theme_dark_logo_login
      platform_theme_light_background
      platform_theme_light_paper
      platform_theme_light_nav
      platform_theme_light_primary
      platform_theme_light_secondary
      platform_theme_light_accent
      platform_theme_light_logo
      platform_theme_light_logo_login
      platform_enable_reference
      platform_providers {
        name
        strategy
      }
      platform_modules {
        id
        enable
      }
      editContext {
        name
        focusOn
      }
    }
  }
`;

const settingsMutationFieldPatch = graphql`
  mutation SettingsFieldPatchMutation($id: ID!, $input: [EditInput]!) {
    settingsEdit(id: $id) {
      fieldPatch(input: $input) {
        id
        platform_title
        platform_favicon
        platform_email
        platform_theme
        platform_theme_dark_background
        platform_theme_dark_paper
        platform_theme_dark_nav
        platform_theme_dark_primary
        platform_theme_dark_secondary
        platform_theme_dark_accent
        platform_theme_dark_logo
        platform_theme_dark_logo_login
        platform_theme_light_background
        platform_theme_light_paper
        platform_theme_light_nav
        platform_theme_light_primary
        platform_theme_light_secondary
        platform_theme_light_accent
        platform_theme_light_logo
        platform_theme_light_logo_login
        platform_language
        platform_login_message
      }
    }
  }
`;

const settingsFocus = graphql`
  mutation SettingsFocusMutation($id: ID!, $input: EditContext!) {
    settingsEdit(id: $id) {
      contextPatch(input: $input) {
        id
      }
    }
  }
`;

const settingsAboutQuery = graphql`
  query SettingsAboutQuery {
    about {
      version
      dependencies {
        name
        version
      }
    }
  }
`;

const settingsValidation = (t) => Yup.object().shape({
  platform_title: Yup.string().required(t('This field is required')),
  platform_favicon: Yup.string().nullable(),
  platform_email: Yup.string()
    .required(t('This field is required'))
    .email(t('The value must be an email address')),
  platform_theme: Yup.string().nullable(),
  platform_theme_dark_background: Yup.string().nullable(),
  platform_theme_dark_paper: Yup.string().nullable(),
  platform_theme_dark_nav: Yup.string().nullable(),
  platform_theme_dark_primary: Yup.string().nullable(),
  platform_theme_dark_secondary: Yup.string().nullable(),
  platform_theme_dark_accent: Yup.string().nullable(),
  platform_theme_dark_logo: Yup.string().nullable(),
  platform_theme_dark_logo_login: Yup.string().nullable(),
  platform_theme_light_background: Yup.string().nullable(),
  platform_theme_light_paper: Yup.string().nullable(),
  platform_theme_light_nav: Yup.string().nullable(),
  platform_theme_light_primary: Yup.string().nullable(),
  platform_theme_light_secondary: Yup.string().nullable(),
  platform_theme_light_accent: Yup.string().nullable(),
  platform_theme_light_logo: Yup.string().nullable(),
  platform_theme_light_logo_login: Yup.string().nullable(),
  platform_language: Yup.string().nullable(),
  platform_login_message: Yup.string().nullable(),
});

class Settings extends Component {
  // eslint-disable-next-line class-methods-use-this
  handleChangeFocus(id, name) {
    commitMutation({
      mutation: settingsFocus,
      variables: {
        id,
        input: {
          focusOn: name,
        },
      },
    });
  }

  handleSubmitField(id, name, value) {
    let finalValue = value;
    if (
      [
        'platform_theme_dark_background',
        'platform_theme_dark_paper',
        'platform_theme_dark_nav',
        'platform_theme_dark_primary',
        'platform_theme_dark_secondary',
        'platform_theme_dark_accent',
        'platform_theme_light_background',
        'platform_theme_light_paper',
        'platform_theme_light_nav',
        'platform_theme_light_primary',
        'platform_theme_light_secondary',
        'platform_theme_light_accent',
      ].includes(name)
      && finalValue.length > 0
    ) {
      if (!finalValue.startsWith('#')) {
        finalValue = `#${finalValue}`;
      }
      finalValue = finalValue.substring(0, 7);
      if (finalValue.length < 7) {
        finalValue = '#000000';
      }
    }
    settingsValidation(this.props.t)
      .validateAt(name, { [name]: finalValue })
      .then(() => {
        commitMutation({
          mutation: settingsMutationFieldPatch,
          variables: { id, input: { key: name, value: finalValue || '' } },
        });
      })
      .catch(() => false);
  }

  render() {
    const { t, classes } = this.props;
    return (
      <div className={classes.container}>
        <QueryRenderer
          query={settingsQuery}
          render={({ props }) => {
            if (props && props.settings) {
              const { settings } = props;
              const { id, editContext } = settings;
              const initialValues = R.pick(
                [
                  'platform_title',
                  'platform_favicon',
                  'platform_email',
                  'platform_theme',
                  'platform_language',
                  'platform_login_message',
                  'platform_theme_dark_background',
                  'platform_theme_dark_paper',
                  'platform_theme_dark_nav',
                  'platform_theme_dark_primary',
                  'platform_theme_dark_secondary',
                  'platform_theme_dark_accent',
                  'platform_theme_dark_logo',
                  'platform_theme_dark_logo_login',
                  'platform_theme_light_background',
                  'platform_theme_light_paper',
                  'platform_theme_light_nav',
                  'platform_theme_light_primary',
                  'platform_theme_light_secondary',
                  'platform_theme_light_accent',
                  'platform_theme_light_logo',
                  'platform_theme_light_logo_login',
                  'platform_map_tile_server_dark',
                  'platform_map_tile_server_light',
                ],
                settings,
              );
              const authProviders = settings.platform_providers;
              const modules = settings.platform_modules;
              let i = 0;
              return (
                <div>
                  <Grid container={true} spacing={3}>
                    <Grid item={true} xs={6}>
                      <Paper
                        classes={{ root: classes.paper }}
                        variant="outlined"
                      >
                        <Typography variant="h1" gutterBottom={true}>
                          {t('Configuration')}
                        </Typography>
                        <Formik
                          enableReinitialize={true}
                          initialValues={initialValues}
                          validationSchema={settingsValidation(t)}
                        >
                          {() => (
                            <Form style={{ marginTop: 20 }}>
                              <Field
                                component={TextField}
                                variant="standard"
                                name="platform_title"
                                label={t('Platform title')}
                                fullWidth={true}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_title"
                                  />
                                }
                              />
                              <Field
                                component={TextField}
                                variant="standard"
                                name="platform_favicon"
                                label={t('Platform favicon URL')}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_favicon"
                                  />
                                }
                              />
                              <Field
                                component={TextField}
                                variant="standard"
                                name="platform_email"
                                label={t('Sender email address')}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_email"
                                  />
                                }
                              />
                              <Field
                                component={SelectField}
                                variant="standard"
                                name="platform_theme"
                                label={t('Theme')}
                                fullWidth={true}
                                containerstyle={{
                                  marginTop: 20,
                                  width: '100%',
                                }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onChange={this.handleSubmitField.bind(this, id)}
                                helpertext={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme"
                                  />
                                }
                              >
                                <MenuItem value="dark">{t('Dark')}</MenuItem>
                                <MenuItem value="light">{t('Light')}</MenuItem>
                              </Field>
                              <Field
                                component={SelectField}
                                variant="standard"
                                name="platform_language"
                                label={t('Language')}
                                fullWidth={true}
                                containerstyle={{
                                  marginTop: 20,
                                  width: '100%',
                                }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onChange={this.handleSubmitField.bind(this, id)}
                                helpertext={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_language"
                                  />
                                }
                              >
                                <MenuItem value="auto">
                                  <em>{t('Automatic')}</em>
                                </MenuItem>
                                <MenuItem value="en-us">English</MenuItem>
                                <MenuItem value="fr-fr">Français</MenuItem>
                                <MenuItem value="zh-cn">简化字</MenuItem>
                              </Field>
                            </Form>
                          )}
                        </Formik>
                      </Paper>
                    </Grid>
                    <Grid item={true} xs={6}>
                      <Paper
                        classes={{ root: classes.paper }}
                        variant="outlined"
                      >
                        <Typography variant="h1" gutterBottom={true}>
                          {t('Authentication strategies')}
                        </Typography>
                        <List>
                          {authProviders.map((provider) => {
                            i += 1;
                            return (
                              <ListItem key={provider.strategy} divider={true}>
                                <ListItemAvatar>
                                  <Avatar className={classes.purple}>
                                    {i}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={provider.name}
                                  secondary={provider.strategy}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                        <Formik
                          enableReinitialize={true}
                          initialValues={initialValues}
                          validationSchema={settingsValidation(t)}
                        >
                          {() => (
                            <Form style={{ marginTop: 20 }}>
                              <Field
                                component={MarkDownField}
                                name="platform_login_message"
                                label={t('Platform login message')}
                                fullWidth={true}
                                multiline={true}
                                rows="3"
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_login_message"
                                  />
                                }
                              />
                            </Form>
                          )}
                        </Formik>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Grid container={true} spacing={3} style={{ marginTop: 0 }}>
                    <Grid item={true} xs={4}>
                      <Paper
                        classes={{ root: classes.paper }}
                        variant="outlined"
                      >
                        <Typography variant="h1" gutterBottom={true}>
                          {t('Dark theme')}
                        </Typography>
                        <Formik
                          enableReinitialize={true}
                          initialValues={initialValues}
                          validationSchema={settingsValidation(t)}
                        >
                          {() => (
                            <Form style={{ marginTop: 20 }}>
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_dark_background"
                                label={t('Background color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_dark_background"
                                  />
                                }
                              />
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_dark_paper"
                                label={t('Paper color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_dark_paper"
                                  />
                                }
                              />
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_dark_nav"
                                label={t('Navigation color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_dark_nav"
                                  />
                                }
                              />
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_dark_primary"
                                label={t('Primary color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_dark_primary"
                                  />
                                }
                              />
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_dark_secondary"
                                label={t('Secondary color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_dark_secondary"
                                  />
                                }
                              />
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_dark_accent"
                                label={t('Accent color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_dark_accent"
                                  />
                                }
                              />
                              <Field
                                component={TextField}
                                variant="standard"
                                name="platform_theme_dark_logo"
                                label={t('Logo URL')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_dark_logo"
                                  />
                                }
                              />
                              <Field
                                component={TextField}
                                variant="standard"
                                name="platform_theme_dark_logo_login"
                                label={t('Logo URL for login page')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_dark_logo_login"
                                  />
                                }
                              />
                            </Form>
                          )}
                        </Formik>
                      </Paper>
                    </Grid>
                    <Grid item={true} xs={4}>
                      <Paper
                        classes={{ root: classes.paper }}
                        variant="outlined"
                      >
                        <Typography variant="h1" gutterBottom={true}>
                          {t('Light theme')}
                        </Typography>
                        <Formik
                          enableReinitialize={true}
                          initialValues={initialValues}
                          validationSchema={settingsValidation(t)}
                        >
                          {() => (
                            <Form style={{ marginTop: 20 }}>
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_light_background"
                                label={t('Background color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_light_background"
                                  />
                                }
                              />
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_light_paper"
                                label={t('Paper color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_light_paper"
                                  />
                                }
                              />
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_light_nav"
                                label={t('Navigation color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_light_nav"
                                  />
                                }
                              />
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_light_primary"
                                label={t('Primary color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_light_primary"
                                  />
                                }
                              />
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_light_secondary"
                                label={t('Secondary color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_light_secondary"
                                  />
                                }
                              />
                              <Field
                                component={ColorPickerField}
                                name="platform_theme_light_accent"
                                label={t('Accent color')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                variant="standard"
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_light_accent"
                                  />
                                }
                              />
                              <Field
                                component={TextField}
                                variant="standard"
                                name="platform_theme_light_logo"
                                label={t('Logo URL')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_light_logo"
                                  />
                                }
                              />
                              <Field
                                component={TextField}
                                variant="standard"
                                name="platform_theme_light_logo_login"
                                label={t('Logo URL for login page')}
                                placeholder={t('Default')}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                                onFocus={this.handleChangeFocus.bind(this, id)}
                                onSubmit={this.handleSubmitField.bind(this, id)}
                                helperText={
                                  <SubscriptionFocus
                                    context={editContext}
                                    fieldName="platform_theme_light_logo_login"
                                  />
                                }
                              />
                            </Form>
                          )}
                        </Formik>
                      </Paper>
                    </Grid>
                    <Grid item={true} xs={4}>
                      <Paper
                        classes={{ root: classes.paper }}
                        variant="outlined"
                      >
                        <QueryRenderer
                          query={settingsAboutQuery}
                          render={({ props: aboutProps }) => {
                            if (aboutProps) {
                              const { version, dependencies } = aboutProps.about;
                              return (
                                <div>
                                  <Typography variant="h1" gutterBottom={true}>
                                    {t('Tools')}
                                  </Typography>
                                  <List>
                                    <ListItem divider={true}>
                                      <ListItemText primary={'OpenCTI'} />
                                      <Chip label={version} color="primary" />
                                    </ListItem>
                                    <List component="div" disablePadding>
                                      {modules.map((module) => (
                                        <ListItem
                                          key={module.id}
                                          divider={true}
                                          className={classes.nested}
                                        >
                                          <ListItemText
                                            primary={t(module.id)}
                                          />
                                          <Chip
                                            label={
                                              module.enable
                                                ? t('Enabled')
                                                : t('Disabled')
                                            }
                                            color={
                                              module.enable
                                                ? 'success'
                                                : 'error'
                                            }
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                    {dependencies.map((dep) => (
                                      <ListItem key={dep.name} divider={true}>
                                        <ListItemText primary={t(dep.name)} />
                                        <Chip
                                          label={dep.version}
                                          color="primary"
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                </div>
                              );
                            }
                            return <Loader variant="inElement" />;
                          }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </div>
              );
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

Settings.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  fsd: PropTypes.func,
};

export default R.compose(inject18n, withStyles(styles))(Settings);
