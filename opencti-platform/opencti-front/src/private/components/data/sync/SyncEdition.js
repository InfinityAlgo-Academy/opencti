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
import inject18n from '../../../../components/i18n';
import { commitMutation, environment, MESSAGING$ } from '../../../../relay/environment';
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
    users {
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

  const { users } = usePreloadedQuery(syncEditionUserQuery, queryRef);

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

  const handleGetStreams = async (uri) => {
    const res = await fetch(`${uri}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: syncStreamCollectionQuery }),
    });
    if (!res.ok) {
      MESSAGING$.notifyError('Error getting the streams from distant OpenCTI');
      return;
    }
    const result = await res.json();
    setStreams([
      { value: 'live', label: 'live' },
      ...result.data.streamCollections.edges.map(({ node }) => ({ value: node.id, label: node.name })),
    ]);
  };

  useEffect(() => {
    if (initialValues.uri) {
      handleGetStreams(initialValues.uri);
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
          color="primary"
        >
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
              <Field
                component={TextField}
                variant="standard"
                name="uri"
                label={t('Remote OpenCTI URL')}
                fullWidth={true}
                style={{ marginTop: 20 }}
                onSubmit={handleSubmitField}
              />
              <Field
                component={TextField}
                variant="standard"
                name="token"
                label={t('Remote OpenCTI token')}
                fullWidth={true}
                style={{ marginTop: 20 }}
                onSubmit={handleSubmitField}
              />
              <Field
                component={SelectField}
                variant="standard"
                name="stream_id"
                label={t('Remote OpenCTI stream ID')}
                containerstyle={{ width: '100%' }}
                style={{ marginTop: 20 }}
                onOpen={() => (values.uri ? handleGetStreams(values.uri) : {})}
                onSubmit={handleSubmitField}
              >
                {streams.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Field>
              <Field
                component={SelectField}
                variant="standard"
                name="user_id"
                label={t('User applied for this synchronizer')}
                containerstyle={{ width: '100%' }}
                style={{ marginTop: 20 }}
                onSubmit={handleSubmitField}
              >
                {users.edges.map(({ node }) => (
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
