import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import { Add, Close } from '@material-ui/icons';
import {
  compose, pathOr, pipe, map, pluck, union, assoc,
} from 'ramda';
import * as Yup from 'yup';
import graphql from 'babel-plugin-relay/macro';
import { ConnectionHandler } from 'relay-runtime';
import MenuItem from '@material-ui/core/MenuItem';
import inject18n from '../../../../components/i18n';
import { commitMutation, fetchQuery } from '../../../../relay/environment';
import Autocomplete from '../../../../components/Autocomplete';
import AutocompleteCreate from '../../../../components/AutocompleteCreate';
import TextField from '../../../../components/TextField';
import { markingDefinitionsSearchQuery } from '../../settings/MarkingDefinitions';
import IdentityCreation, {
  identityCreationIdentitiesSearchQuery,
} from '../../common/identities/IdentityCreation';
import DatePickerField from '../../../../components/DatePickerField';
import Select from '../../../../components/Select';

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
    right: 280,
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
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
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

const indicatorMutation = graphql`
  mutation IndicatorCreationMutation($input: IndicatorAddInput!) {
    indicatorAdd(input: $input) {
      ...IndicatorLine_node
    }
  }
`;

const indicatorValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  indicator_pattern: Yup.string().required(t('This field is required')),
  pattern_type: Yup.string().required(t('This field is required')),
  main_observable_type: Yup.string().required(t('This field is required')),
  valid_from: Yup.date()
    .typeError(t('The value must be a date (YYYY-MM-DD)'))
    .required(t('This field is required')),
  description: Yup.string(),
});

const sharedUpdater = (store, userId, paginationOptions, newEdge) => {
  const userProxy = store.get(userId);
  const conn = ConnectionHandler.getConnection(
    userProxy,
    'Pagination_indicators',
    paginationOptions,
  );
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

class IndicatorCreation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      identities: [],
      identityCreation: false,
      identityInput: '',
      markingDefinitions: [],
    };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  searchIdentities(event) {
    fetchQuery(identityCreationIdentitiesSearchQuery, {
      search: event.target.value,
      first: 10,
    }).then((data) => {
      const identities = pipe(
        pathOr([], ['identities', 'edges']),
        map((n) => ({ label: n.node.name, value: n.node.id })),
      )(data);
      this.setState({ identities: union(this.state.identities, identities) });
    });
  }

  handleOpenIdentityCreation(inputValue) {
    this.setState({ identityCreation: true, identityInput: inputValue });
  }

  handleCloseIdentityCreation() {
    this.setState({ identityCreation: false });
  }

  searchMarkingDefinitions(event) {
    fetchQuery(markingDefinitionsSearchQuery, {
      search: event.target.value,
    }).then((data) => {
      const markingDefinitions = pipe(
        pathOr([], ['markingDefinitions', 'edges']),
        map((n) => ({ label: n.node.definition, value: n.node.id })),
      )(data);
      this.setState({
        markingDefinitions: union(
          this.state.markingDefinitions,
          markingDefinitions,
        ),
      });
    });
  }

  onSubmit(values, { setSubmitting, resetForm }) {
    const finalValues = pipe(
      assoc('createdByRef', values.createdByRef.value),
      assoc('markingDefinitions', pluck('value', values.markingDefinitions)),
    )(values);
    commitMutation({
      mutation: indicatorMutation,
      variables: {
        input: finalValues,
      },
      updater: (store) => {
        const payload = store.getRootField('indicatorAdd');
        const newEdge = payload.setLinkedRecord(payload, 'node'); // Creation of the pagination container.
        const container = store.getRoot();
        sharedUpdater(
          store,
          container.getDataID(),
          this.props.paginationOptions,
          newEdge,
        );
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
            <Typography variant="h6">{t('Create an indicator')}</Typography>
          </div>
          <div className={classes.container}>
            <Formik
              initialValues={{
                name: '',
                indicator_pattern: '',
                pattern_type: '',
                main_observable_type: '',
                valid_from: null,
                valid_until: null,
                description: '',
                createdByRef: '',
                markingDefinitions: [],
              }}
              validationSchema={indicatorValidation(t)}
              onSubmit={this.onSubmit.bind(this)}
              onReset={this.onReset.bind(this)}
              render={({
                submitForm,
                handleReset,
                isSubmitting,
                setFieldValue,
              }) => (
                <div>
                  <Form style={{ margin: '20px 0 20px 0' }}>
                    <Field
                      name="name"
                      component={TextField}
                      label={t('Name')}
                      fullWidth={true}
                    />
                    <Field
                      name="pattern_type"
                      component={Select}
                      label={t('Pattern type')}
                      fullWidth={true}
                      inputProps={{
                        name: 'pattern_type',
                        id: 'pattern_type',
                      }}
                      containerstyle={{ marginTop: 20, width: '100%' }}
                    >
                      <MenuItem value="stix">stix</MenuItem>
                      <MenuItem value="pcre">pcre</MenuItem>
                      <MenuItem value="sigma">sigma</MenuItem>
                      <MenuItem value="snort">snort</MenuItem>
                      <MenuItem value="suricata">suricata</MenuItem>
                      <MenuItem value="yara">yara</MenuItem>
                    </Field>
                    <Field
                      name="indicator_pattern"
                      component={TextField}
                      label={t('Pattern')}
                      fullWidth={true}
                      multiline={true}
                      rows="4"
                      style={{ marginTop: 20 }}
                    />
                    <Field
                      name="main_observable_type"
                      component={Select}
                      label={t('Main observable type')}
                      fullWidth={true}
                      inputProps={{
                        name: 'main_observable_type',
                        id: 'main_observable_type',
                      }}
                      containerstyle={{ marginTop: 20, width: '100%' }}
                    >
                      <MenuItem value="Autonomous-System">
                        {t('Autonomous system')}
                      </MenuItem>
                      <MenuItem value="Domain">{t('Domain')}</MenuItem>
                      <MenuItem value="Email-Address">
                        {t('Email address')}
                      </MenuItem>
                      <MenuItem value="Email-Subject">
                        {t('Email subject')}
                      </MenuItem>
                      <MenuItem value="File-Name">{t('File name')}</MenuItem>
                      <MenuItem value="File-Path">{t('File path')}</MenuItem>
                      <MenuItem value="File-MD5">{t('File MD5 hash')}</MenuItem>
                      <MenuItem value="File-SHA1">
                        {t('File SHA1 hash')}
                      </MenuItem>
                      <MenuItem value="File-SHA256">
                        {t('File SHA256 hash')}
                      </MenuItem>
                      <MenuItem value="IPv4-Addr">{t('IPv4 address')}</MenuItem>
                      <MenuItem value="IPv6-Addr">{t('IPv6 address')}</MenuItem>
                      <MenuItem value="PDB-Path">{t('PDB Path')}</MenuItem>
                      <MenuItem value="Registry-Key">
                        {t('Registry key')}
                      </MenuItem>
                      <MenuItem value="Registry-Key-Value">
                        {t('Registry key value')}
                      </MenuItem>
                      <MenuItem value="Mutex">{t('Mutex')}</MenuItem>
                      <MenuItem value="URL">{t('URL')}</MenuItem>
                      <MenuItem value="Windows-Service-Name">
                        {t('Windows Service Name')}
                      </MenuItem>
                      <MenuItem value="Windows-Service-Display-Name">
                        {t('Windows Service Display Name')}
                      </MenuItem>
                      <MenuItem value="Windows-Scheduled-Task">
                        {t('Windows Scheduled Task')}
                      </MenuItem>
                      <MenuItem value="X509-Certificate-Issuer">
                        {t('X509 Certificate Issuer')}
                      </MenuItem>
                      <MenuItem value="X509-Certificate-Serial-Number">
                        {t('X509 Certificate Serial number')}
                      </MenuItem>
                    </Field>
                    <Field
                      name="valid_from"
                      component={DatePickerField}
                      label={t('Valid from')}
                      fullWidth={true}
                      style={{ marginTop: 20 }}
                    />
                    <Field
                      name="valid_until"
                      component={DatePickerField}
                      label={t('Valid until')}
                      fullWidth={true}
                      style={{ marginTop: 20 }}
                    />
                    <Field
                      name="description"
                      component={TextField}
                      label={t('Description')}
                      fullWidth={true}
                      multiline={true}
                      rows="4"
                      style={{ marginTop: 20 }}
                    />
                    <Field
                      name="createdByRef"
                      component={AutocompleteCreate}
                      multiple={false}
                      handleCreate={this.handleOpenIdentityCreation.bind(this)}
                      label={t('Author')}
                      options={this.state.identities}
                      onInputChange={this.searchIdentities.bind(this)}
                    />
                    <Field
                      name="markingDefinitions"
                      component={Autocomplete}
                      multiple={true}
                      label={t('Marking')}
                      options={this.state.markingDefinitions}
                      onInputChange={this.searchMarkingDefinitions.bind(this)}
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
                  <IdentityCreation
                    contextual={true}
                    inputValue={this.state.identityInput}
                    open={this.state.identityCreation}
                    handleClose={this.handleCloseIdentityCreation.bind(this)}
                    creationCallback={(data) => {
                      setFieldValue('createdByRef', {
                        label: data.identityAdd.name,
                        value: data.identityAdd.id,
                      });
                    }}
                  />
                </div>
              )}
            />
          </div>
        </Drawer>
      </div>
    );
  }
}

IndicatorCreation.propTypes = {
  paginationOptions: PropTypes.object,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(IndicatorCreation);
