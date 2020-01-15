import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { ConnectionHandler } from 'relay-runtime';
import {
  assoc, compose, map, pathOr, pipe, pluck, split,
} from 'ramda';
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
import MenuItem from '@material-ui/core/MenuItem';
import Fab from '@material-ui/core/Fab';
import { Add, Close } from '@material-ui/icons';
import { commitMutation, fetchQuery } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import TextField from '../../../../components/TextField';
import Select from '../../../../components/Select';
import Autocomplete from '../../../../components/Autocomplete';
import { markingDefinitionsSearchQuery } from '../../settings/MarkingDefinitions';

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

const stixDomainEntityCreationMutation = graphql`
  mutation StixDomainEntityCreationMutation($input: StixDomainEntityAddInput!) {
    stixDomainEntityAdd(input: $input) {
      id
      entity_type
      parent_types
      name
      description
    }
  }
`;

const stixDomainEntityValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  description: Yup.string(),
  type: Yup.string().required(t('This field is required')),
});

const sharedUpdater = (store, userId, paginationOptions, newEdge) => {
  const userProxy = store.get(userId);
  const conn = ConnectionHandler.getConnection(
    userProxy,
    'Pagination_stixDomainEntities',
    paginationOptions,
  );
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

class StixDomainEntityCreation extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, markingDefinitions: [] };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  searchMarkingDefinitions(event) {
    fetchQuery(markingDefinitionsSearchQuery, {
      search: event.target.value,
    }).then((data) => {
      const markingDefinitions = pipe(
        pathOr([], ['markingDefinitions', 'edges']),
        map((n) => ({ label: n.node.definition, value: n.node.id })),
      )(data);
      this.setState({ markingDefinitions });
    });
  }

  onSubmit(values, { setSubmitting, resetForm }) {
    const finalValues = pipe(
      assoc('alias', split(',', values.alias)),
      assoc('markingDefinitions', pluck('value', values.markingDefinitions)),
    )(values);
    commitMutation({
      mutation: stixDomainEntityCreationMutation,
      variables: {
        input: finalValues,
      },
      updater: (store) => {
        const payload = store.getRootField('stixDomainEntityAdd');
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

  onResetClassic() {
    this.handleClose();
  }

  onResetContextual() {
    this.handleClose();
  }

  renderEntityTypesList() {
    const { t, targetEntityTypes } = this.props;
    return (
      <Field
        name="type"
        component={Select}
        label={t('Entity type')}
        fullWidth={true}
        inputProps={{
          name: 'type',
          id: 'type',
        }}
        containerstyle={{ width: '100%' }}
      >
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Organization') ? (
          <MenuItem value="Organization">{t('Organization')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Sector') ? (
          <MenuItem value="Sector">{t('Sector')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('User') ? (
          <MenuItem value="User">{t('Person')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Threat-Actor') ? (
          <MenuItem value="Threat-Actor">{t('Threat actor')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Intrusion-Set') ? (
          <MenuItem value="Intrusion-Set">{t('Intrusion set')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Campaign') ? (
          <MenuItem value="Campaign">{t('Campaign')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Incident') ? (
          <MenuItem value="Incident">{t('Incident')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Malware') ? (
          <MenuItem value="Malware">{t('Malware')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Tool') ? (
          <MenuItem value="Tool">{t('Tool')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Vulnerability') ? (
          <MenuItem value="Vulnerability">{t('Vulnerability')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Attack-Pattern') ? (
          <MenuItem value="Attack-Pattern">{t('Attack pattern')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Indicator') ? (
          <MenuItem value="Indicator">{t('Indicator')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('City') ? (
          <MenuItem value="City">{t('City')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Country') ? (
          <MenuItem value="Country">{t('Country')}</MenuItem>
          ) : (
            ''
          )}
        {targetEntityTypes === undefined
        || targetEntityTypes.includes('Region') ? (
          <MenuItem value="Region">{t('Region')}</MenuItem>
          ) : (
            ''
          )}
      </Field>
    );
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
            <Typography variant="h6">{t('Create an entity')}</Typography>
          </div>
          <div className={classes.container}>
            <Formik
              initialValues={{
                type: '',
                name: '',
                description: '',
                alias: '',
                markingDefinitions: [],
              }}
              validationSchema={stixDomainEntityValidation(t)}
              onSubmit={this.onSubmit.bind(this)}
              onReset={this.onResetClassic.bind(this)}
              render={({ submitForm, handleReset, isSubmitting }) => (
                <Form style={{ margin: '20px 0 20px 0' }}>
                  {this.renderEntityTypesList()}
                  <Field
                    name="name"
                    component={TextField}
                    label={t('Name')}
                    fullWidth={true}
                    style={{ marginTop: 20 }}
                  />
                  <Field
                    name="alias"
                    component={TextField}
                    label={t('Aliases separated by commas')}
                    fullWidth={true}
                    style={{ marginTop: 20 }}
                  />
                  <Field
                    name="markingDefinitions"
                    component={Autocomplete}
                    multiple={true}
                    label={t('Marking')}
                    options={this.state.markingDefinitions}
                    onInputChange={this.searchMarkingDefinitions.bind(this)}
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
            />
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
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="secondary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Formik
          enableReinitialize={true}
          initialValues={{
            type: '',
            name: inputValue,
            description: '',
            alias: '',
            markingDefinitions: [],
          }}
          validationSchema={stixDomainEntityValidation(t)}
          onSubmit={this.onSubmit.bind(this)}
          onReset={this.onResetContextual.bind(this)}
          render={({ submitForm, handleReset, isSubmitting }) => (
            <Form>
              <Dialog
                open={this.state.open}
                onClose={this.handleClose.bind(this)}
                fullWidth={true}
              >
                <DialogTitle>{t('Create an entity')}</DialogTitle>
                <DialogContent>
                  {this.renderEntityTypesList()}
                  <Field
                    name="name"
                    component={TextField}
                    label={t('Name')}
                    fullWidth={true}
                    style={{ marginTop: 20 }}
                  />
                  <Field
                    name="alias"
                    component={TextField}
                    label={t('Aliases separated by commas')}
                    fullWidth={true}
                    style={{ marginTop: 20 }}
                  />
                  <Field
                    name="markingDefinitions"
                    component={Autocomplete}
                    multiple={true}
                    label={t('Marking')}
                    options={this.state.markingDefinitions}
                    onInputChange={this.searchMarkingDefinitions.bind(this)}
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
        />
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

StixDomainEntityCreation.propTypes = {
  paginationOptions: PropTypes.object,
  targetEntityTypes: PropTypes.array,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  contextual: PropTypes.bool,
  display: PropTypes.bool,
  inputValue: PropTypes.string,
};

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(StixDomainEntityCreation);
