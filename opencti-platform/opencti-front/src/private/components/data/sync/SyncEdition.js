import React, { useEffect, useState } from 'react';
import * as PropTypes from 'prop-types';
import { createFragmentContainer, graphql, loadQuery, usePreloadedQuery } from 'react-relay';
import { Field, Form, Formik } from 'formik';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';
import * as Yup from 'yup';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Tooltip from '@mui/material/Tooltip';
import { InformationOutline } from 'mdi-material-ui';
import inject18n from '../../../../components/i18n';
import { commitMutation, environment, fetchQuery, MESSAGING$ } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import SwitchField from '../../../../components/SwitchField';
import { syncCheckMutation, syncStreamCollectionQuery } from './SyncCreation';
import DateTimePickerField from '../../../../components/DateTimePickerField';
import { buildDate } from '../../../../utils/Time';
import SelectField from '../../../../components/SelectField';

const styles = (theme) => ({
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 0px 20px 60px',
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
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    borderBottom: '1px solid #5c5c5c',
  },
  title: {
    float: 'left',
  },
  alert: {
    width: '100%',
    marginTop: 20,
  },
  message: {
    width: '100%',
    overflow: 'hidden',
  },
});

const syncMutationFieldPatch = graphql`
  mutation SyncEditionFieldPatchMutation($id: ID!, $input: [EditInput]!) {
    synchronizerEdit(id: $id) {
      fieldPatch(input: $input) {
        ...SyncEdition_synchronizer
      }
    }
  }
`;

const syncEditionUserQuery = graphql`
  query SyncEditionUserQuery {
    creators {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const syncValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  uri: Yup.string().required(t('This field is required')),
  token: Yup.string(),
  stream_id: Yup.string().required(t('This field is required')),
  current_state: Yup.date()
    .nullable()
    .typeError(t('The value must be a datetime (yyyy-MM-dd hh:mm (a|p)m)')),
  listen_deletion: Yup.bool(),
  no_dependencies: Yup.bool(),
  ssl_verify: Yup.bool(),
  user_id: Yup.string(),
});

const queryRef = loadQuery(environment, syncEditionUserQuery);

const SyncEditionContainer = (props) => {
  const { t, classes, handleClose, synchronizer } = props;

  const [streams, setStreams] = useState([]);

  const { creators } = usePreloadedQuery(syncEditionUserQuery, queryRef);

  const initialValues = R.pipe(
    R.assoc('current_state', buildDate(synchronizer.current_state)),
    R.pick([
      'name',
      'uri',
      'token',
      'stream_id',
      'listen_deletion',
      'no_dependencies',
      'current_state',
      'ssl_verify',
    ]),
  )(synchronizer);
  const handleVerify = (values) => {
    commitMutation({
      mutation: syncCheckMutation,
      variables: {
        input: values,
      },
      onCompleted: (data) => {
        if (data && data.synchronizerTest === 'Connection success') {
          MESSAGING$.notifySuccess(t('Connection successfully verified'));
        }
      },
    });
  };
  const handleSubmitField = (name, value) => {
    syncValidation(props.t)
      .validateAt(name, { [name]: value })
      .then(() => {
        commitMutation({
          mutation: syncMutationFieldPatch,
          variables: {
            id: props.synchronizer.id,
            input: { key: name, value: value || '' },
          },
        });
      })
      .catch(() => false);
  };

  const handleGetStreams = ({ uri, token, ssl_verify }) => {
    const args = { uri, token, ssl_verify: ssl_verify ?? false };
    fetchQuery(syncStreamCollectionQuery, args).toPromise().then((result) => {
      const resultStreams = [...result.synchronizerFetch.map((s) => ({ value: s.id, label: s.name }))];
      setStreams(resultStreams);
    }).catch(() => {
      setStreams([]);
    });
  };

  useEffect(() => {
    if (initialValues) {
      handleGetStreams(initialValues);
    }
  }, []);

  return (
    <div>
      <div className={classes.header}>
        <IconButton
          aria-label="Close"
          className={classes.closeButton}
          onClick={handleClose}
          size="large"
          color="primary">
          <Close fontSize="small" color="primary" />
        </IconButton>
        <Typography variant="h6">{t('Update a synchronizer')}</Typography>
      </div>
      <div className={classes.container}>
        <Formik
          enableReinitialize={true}
          initialValues={{ ...initialValues, user_id: synchronizer.user?.id }}
          validationSchema={syncValidation(t)}
        >
          {({ values }) => (
            <Form style={{ margin: '20px 0 20px 0' }}>
              <Field
                component={TextField}
                variant="standard"
                name="name"
                label={t('Name')}
                fullWidth={true}
                onSubmit={handleSubmitField}
              />
              <Alert icon={false} classes={{ root: classes.alert, message: classes.message }}
                     severity="warning"
                     variant="outlined"
                     style={{ position: 'relative' }}>
                <AlertTitle>
                  {t('Remote OpenCTI configuration')}
                </AlertTitle>
                <Tooltip title={t('You need to configure a valid remote OpenCTI. Token is optional to consume public streams')}>
                  <InformationOutline fontSize="small" color="primary" style={{ position: 'absolute', top: 10, right: 18 }}/>
                </Tooltip>
                <Field
                  component={TextField}
                  variant="standard"
                  name="uri"
                  label={t('Remote OpenCTI URL')}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                  disabled={true}
                />
                <Field
                  component={TextField}
                  variant="standard"
                  name="token"
                  label={t('Remote OpenCTI token')}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                  disabled={true}
                />
              </Alert>
              <Field
                component={SelectField}
                variant="standard"
                name="stream_id"
                label={t('Remote OpenCTI stream ID')}
                containerstyle={{ marginTop: 20, width: '100%' }}
                disabled={true}>
                {streams.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Field>
              <Field
                component={SelectField}
                variant="standard"
                name="user_id"
                label={t('User responsible for data creation')}
                containerstyle={{ marginTop: 20, width: '100%' }}
                onSubmit={handleSubmitField}>
                {creators.edges.map(({ node }) => (
                  <MenuItem key={node.id} value={node.id}>{node.name}</MenuItem>
                ))}
              </Field>
              <Field
                component={DateTimePickerField}
                name="current_state"
                onSubmit={handleSubmitField}
                TextFieldProps={{
                  label: t('Starting synchronization (empty = from start)'),
                  variant: 'standard',
                  fullWidth: true,
                  style: { marginTop: 20 },
                }}
              />
              <Field
                component={SwitchField}
                type="checkbox"
                name="listen_deletion"
                containerstyle={{ marginTop: 20 }}
                label={t('Take deletions into account')}
                onChange={handleSubmitField}
              />
              <Field
                component={SwitchField}
                type="checkbox"
                name="no_dependencies"
                label={t('Avoid dependencies resolution')}
                onChange={handleSubmitField}
              />
              <Field
                component={SwitchField}
                type="checkbox"
                name="ssl_verify"
                label={t('Verify SSL certificate')}
                onChange={handleSubmitField}
              />
              <div className={classes.buttons}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleVerify(values)}
                  classes={{ root: classes.button }}
                >
                  {t('Verify')}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

SyncEditionContainer.propTypes = {
  handleClose: PropTypes.func,
  classes: PropTypes.object,
  synchronizer: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

const SyncEditionFragment = createFragmentContainer(SyncEditionContainer, {
  synchronizer: graphql`
    fragment SyncEdition_synchronizer on Synchronizer {
      id
      name
      uri
      token
      stream_id
      listen_deletion
      no_dependencies
      current_state
      ssl_verify
      user {
        id
      }
    }
  `,
});

export default R.compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(SyncEditionFragment);
