import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import {
  compose,
  pipe,
  pathOr,
  toPairs,
  assoc,
  dissoc,
  map,
} from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { Information } from 'mdi-material-ui';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import { commitMutation as CM } from 'react-relay';
import inject18n from './i18n';
import SwitchField from './SwitchField';
import SelectField from './SelectField';
import TextField from './TextField';
import ItemIcon from './ItemIcon';
import { adaptFieldValue } from '../utils/String';
import environmentDarkLight, { fetchDarklightQuery } from '../relay/environmentDarkLight';

const styles = (theme) => ({
  dialogRoot: {
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
  button: {
    display: 'table-cell',
    float: 'left',
  },
  buttonPopover: {
    marginRight: '5px',
    textTransform: 'capitalize',
  },
  dialogContent: {
    overflowY: 'hidden',
  },
  popoverDialog: {
    fontSize: '18px',
    lineHeight: '24px',
    color: theme.palette.header.text,
  },
  dialogActions: {
    justifyContent: 'flex-start',
    padding: '0px 0 20px 22px',
  },
  scrollBg: {
    background: theme.palette.header.background,
    width: '100%',
    color: 'white',
    padding: '10px 5px 10px 15px',
    borderRadius: '5px',
    lineHeight: '20px',
  },
  scrollDiv: {
    width: '100%',
    background: theme.palette.header.background,
    height: '78px',
    overflow: 'hidden',
    overflowY: 'scroll',
  },
  scrollObj: {
    color: theme.palette.header.text,
    fontFamily: 'sans-serif',
    padding: '0px',
    textAlign: 'left',
  },
  spanLink: {
    color: '#00bcd4',
  },
});

const exportTypeQuery = graphql`
  query ExportTypeQuery{
    __type(name: "RiskReportType") {
      name
      description
      enumValues {
        name
        description
      }
    }
  }
`;

const exportMutation = graphql`
  mutation ExportMutation($report: RiskReportType!, $options: [RiskReportOption]) {
    generateRiskReport(report: $report, options: $options)
  }
`;

class Export extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      close: false,
      menuOpen: { open: false, anchorEl: null },
      exportTypeList: [],
      reportType: '',
    };
  }

  componentDidMount() {
    fetchDarklightQuery(exportTypeQuery)
      .toPromise()
      .then((data) => {
        const ExportTypeEntities = pipe(
          pathOr([], ['__type', 'enumValues']),
          map((n) => ({
            label: n.description,
            value: n.name,
          })),
        )(data);
        this.setState({
          exportTypeList: {
            ...this.state.entities,
            ExportTypeEntities,
          },
        });
      });
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClickMenuOpen = (event) => {
    this.setState({ menuOpen: { open: true, anchorEl: event.currentTarget } });
  };

  handleClickMenuClose = () => {
    this.setState({ menuOpen: { open: false } });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleCancelClick() {
    this.setState({
      open: false,
      close: true,
    });
  }

  handleCancelCloseClick() {
    this.setState({ close: false });
  }

  handleMenuItem(value) {
    if (value === 'sar') {
      this.handleClickOpen();
    }
    this.setState({ reportType: value });
    this.handleClickMenuClose();
  }

  onSubmit(values, { setSubmitting, resetForm }) {
    const appendices = [
      values.db_scan && 'db_scan',
      values.web_scan && 'web_scan',
      values.pen_test && 'pen_test',
      values.manual_test && 'manual_test',
      values.scanned_inventory && 'scanned_inventory',
      values.mitigating_factors && 'mitigating_factors',
    ];
    const finalValues = pipe(
      assoc('appendices', appendices.filter((value) => value !== false)),
      dissoc('db_scan'),
      dissoc('pen_test'),
      dissoc('web_scan'),
      dissoc('manual_test'),
      dissoc('scanned_inventory'),
      dissoc('mitigating_factors'),
      dissoc('collected_during_assessment'),
      dissoc('include_risk_tracking_details'),
      toPairs,
      map((n) => ({
        name: n[0],
        values: Array.isArray(adaptFieldValue(n[1]))
          ? adaptFieldValue(n[1])
          : [adaptFieldValue(n[1])],
      })),
    )(values);
    CM(environmentDarkLight, {
      mutation: exportMutation,
      variables: {
        report: this.state.reportType,
        options: finalValues,
      },
      setSubmitting,
      onCompleted: (response) => {
        setSubmitting(false);
        resetForm();
        this.handleClose();
      },
      onError: (err) => {
        console.error(err);
      },
    });
  }

  onResetContextual() {
    this.handleCancelClick();
  }

  render() {
    const {
      t, classes, location, history, keyword, theme,
    } = this.props;
    const exportTypeListData = pathOr(
      [],
      ['ExportTypeEntities'],
      this.state.exportTypeList,
    );
    return (
      <>
        <IconButton
          classes={{ root: classes.button }}
          onClick={this.handleClickMenuOpen.bind(this)}
        >
          <NoteAddIcon fontSize="default" />
        </IconButton>
        <Menu
          id="menu-appbar"
          open={this.state.menuOpen.open}
          style={{ marginTop: 40, zIndex: 2100 }}
          anchorEl={this.state.menuOpen.anchorEl}
          onClose={this.handleClickMenuClose.bind(this)}
        >
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 13px' }}>
            <NoteAddIcon fontSize="default" />
            <Typography style={{ marginLeft: '10px' }}>
              {t('Generate Report')}
            </Typography>
          </div>
          {
            exportTypeListData.map((exportListItem, i) => (
              <MenuItem
                key={i}
                value={exportListItem.value}
                onClick={this.handleMenuItem.bind(this, exportListItem.value)}
              >
                {exportListItem.label && t(exportListItem.label)}
              </MenuItem>
            ))
          }
        </Menu>
        <Dialog
          maxWidth='sm'
          fullWidth={true}
          open={this.state.open}
          classes={{ paper: classes.dialogRoot }}
          onClose={this.handleClose.bind(this)}
        >
          <Formik
            enableReinitialize={true}
            initialValues={{
              purpose: '',
              max_items: 0,
              db_scan: false,
              description: '',
              web_scan: false,
              pen_test: false,
              manual_test: false,
              scanned_inventory: false,
              mitigating_factors: false,
              collected_during_assessment: false,
              include_risk_tracking_details: false,
            }}
            // validationSchema={RelatedTaskValidation(t)}
            onSubmit={this.onSubmit.bind(this)}
            onReset={this.onResetContextual.bind(this)}
          >
            {({ submitForm, handleReset, isSubmitting }) => (
              <Form>
                <DialogTitle classes={{ root: classes.dialogTitle }}>
                  {t('SAR Report Generation')}
                  <Typography>
                    {t('This feature will generate a report in Markdown (a lightweight text markup language) that can be further edited and then transformed into the output of your choice (Word, PDF, etc.). For more about Markdown and useful conversion tools, see ')}
                    <span className={classes.spanLink}>https://www.markdownguide.org</span>
                  </Typography>
                </DialogTitle>
                <DialogContent classes={{ root: classes.dialogContent }}>
                  <Grid container={true} spacing={3}>
                    <Grid item={true} xs={12} style={{ padding: '12px 0 0 12px' }}>
                      <Typography
                        variant="h3"
                        color="textSecondary"
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <ItemIcon variant='inline' type='collected' />
                        {t('COLLECT')}
                      </Typography>
                    </Grid>
                    <Grid item={true} xs={12}>
                      <Typography
                        variant="h3"
                        color="textSecondary"
                        gutterBottom={true}
                        style={{ float: 'left' }}
                      >
                        {t('System Description')}
                      </Typography>
                      <div style={{ float: 'left', margin: '1px 0 0 5px' }}>
                        <Tooltip title={t('System Description')}>
                          <Information fontSize="inherit" color="disabled" />
                        </Tooltip>
                      </div>
                      <div className="clearfix" />
                      <Field
                        component={TextField}
                        name="description"
                        fullWidth={true}
                        multiline={true}
                        rows="3"
                        variant='outlined'
                      />
                    </Grid>
                    <Grid item={true} xs={12}>
                      <Typography
                        variant="h3"
                        color="textSecondary"
                        gutterBottom={true}
                        style={{ float: 'left' }}
                      >
                        {t('Purpose')}
                      </Typography>
                      <div style={{ float: 'left', margin: '1px 0 0 5px' }}>
                        <Tooltip title={t('Purpose')}>
                          <Information fontSize="inherit" color="disabled" />
                        </Tooltip>
                      </div>
                      <div className="clearfix" />
                      <Field
                        component={TextField}
                        name="purpose"
                        fullWidth={true}
                        multiline={true}
                        rows="3"
                        variant='outlined'
                      />
                    </Grid>
                    <Grid item={true} xs={12}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Field
                          component={SwitchField}
                          type="checkbox"
                          name="collected_during_assessment"
                          containerstyle={{ marginLeft: 10, marginRight: '-15px' }}
                          inputProps={{ 'aria-label': 'ant design' }}
                        />
                        <Typography>
                          {t('Collected during assessment')}
                        </Typography>
                        <div style={{ float: 'left', margin: '3px 0 0 5px' }}>
                          <Tooltip title={t('Publicly Accessible')} >
                            <Information fontSize="inherit" color="disabled" />
                          </Tooltip>
                        </div>
                      </div>
                      <Divider light={true} />
                    </Grid>
                    <Grid item={true} xs={12} style={{ padding: '0 0 0 12px' }}>
                      <Typography
                        variant="h3"
                        gutterBottom={true}
                        color="textSecondary"
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <ItemIcon variant='inline' type='poam' />
                        {t('PLAN OF ACTION AND MILESTONES')}
                      </Typography>
                    </Grid>
                    <Grid item={true} xs={12}>
                      <div style={{ display: 'flex', alignItems: 'end' }}>
                        <Field
                          component={SelectField}
                          name='max_items'
                          fullWidth={true}
                          style={{ height: '18.09px' }}
                          containerstyle={{ width: '8%', marginRight: '12px' }}
                        >
                          <MenuItem value='5'>{t('5')}</MenuItem>
                          <MenuItem value='10'>{t('10')}</MenuItem>
                          <MenuItem value='15'>{t('15')}</MenuItem>
                          <MenuItem value='20'>{t('20')}</MenuItem>
                          <MenuItem value='25'>{t('25')}</MenuItem>
                          <MenuItem value='all'>{t('all')}</MenuItem>
                        </Field>
                        <Typography>
                          {t('Number of risk items do you to include')}
                        </Typography>
                        <div style={{ float: 'left', margin: '3px 0 0 5px' }}>
                          <Tooltip title={t('Total Number')} >
                            <Information fontSize="inherit" color="disabled" />
                          </Tooltip>
                        </div>
                      </div>
                    </Grid>
                    <Grid item={true} xs={12}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Field
                          component={SwitchField}
                          type="checkbox"
                          name="include_risk_tracking_details"
                          containerstyle={{ marginLeft: 10, marginRight: '-15px' }}
                          inputProps={{ 'aria-label': 'ant design' }}
                        />
                        <Typography>
                          {t('Include Risk Tracking Details')}
                        </Typography>
                        <div style={{ float: 'left', margin: '3px 0 0 5px' }}>
                          <Tooltip title={t('Include Risk Tracking Details')} >
                            <Information fontSize="inherit" color="disabled" />
                          </Tooltip>
                        </div>
                      </div>
                      <Divider light={true} />
                    </Grid>
                  </Grid>
                  <Grid container={true} spacing={3}>
                    <Grid item={true} xs={12} style={{ padding: '12px 0 0 12px' }}>
                      <Typography
                        variant="h3"
                        color="textSecondary"
                        gutterBottom={true}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <ItemIcon variant='inline' type='appendecies' />
                        {t('APPENDICES')}
                      </Typography>
                    </Grid>
                    <Grid item={true} xs={6}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Field
                          component={SwitchField}
                          type="checkbox"
                          name="scanned_inventory"
                          containerstyle={{ marginLeft: 10, marginRight: '-15px' }}
                          inputProps={{ 'aria-label': 'ant design' }}
                        />
                        <Typography>
                          {t('Scanned Items Inventory')}
                        </Typography>
                        <div style={{ float: 'left', margin: '3px 0 0 5px' }}>
                          <Tooltip title={t('Scanned Items Inventory')} >
                            <Information fontSize="inherit" color="disabled" />
                          </Tooltip>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Field
                          component={SwitchField}
                          type="checkbox"
                          name="db_scan"
                          containerstyle={{ marginLeft: 10, marginRight: '-15px' }}
                          inputProps={{ 'aria-label': 'ant design' }}
                        />
                        <Typography>
                          {t('Database Scan')}
                        </Typography>
                        <div style={{ float: 'left', margin: '3px 0 0 5px' }}>
                          <Tooltip title={t('Data Scan')} >
                            <Information fontSize="inherit" color="disabled" />
                          </Tooltip>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Field
                          component={SwitchField}
                          type="checkbox"
                          name="web_scan"
                          containerstyle={{ marginLeft: 10, marginRight: '-15px' }}
                          inputProps={{ 'aria-label': 'ant design' }}
                        />
                        <Typography>
                          {t('Web Scan')}
                        </Typography>
                        <div style={{ float: 'left', margin: '3px 0 0 5px' }}>
                          <Tooltip title={t('Web Scan')} >
                            <Information fontSize="inherit" color="disabled" />
                          </Tooltip>
                        </div>
                      </div>
                    </Grid>
                    <Grid item={true} xs={6}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Field
                          component={SwitchField}
                          type="checkbox"
                          name="manual_test"
                          containerstyle={{ marginLeft: 10, marginRight: '-15px' }}
                          inputProps={{ 'aria-label': 'ant design' }}
                        />
                        <Typography>
                          {t('Manual Test')}
                        </Typography>
                        <div style={{ float: 'left', margin: '3px 0 0 5px' }}>
                          <Tooltip title={t('Manual Test')} >
                            <Information fontSize="inherit" color="disabled" />
                          </Tooltip>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Field
                          component={SwitchField}
                          type="checkbox"
                          name="pen_test"
                          containerstyle={{ marginLeft: 10, marginRight: '-15px' }}
                          inputProps={{ 'aria-label': 'ant design' }}
                        />
                        <Typography>
                          {t('Penetration Test')}
                        </Typography>
                        <div style={{ float: 'left', margin: '3px 0 0 5px' }}>
                          <Tooltip title={t('Penetration Test')} >
                            <Information fontSize="inherit" color="disabled" />
                          </Tooltip>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Field
                          component={SwitchField}
                          type="checkbox"
                          name="mitigating_factors"
                          containerstyle={{ marginLeft: 10, marginRight: '-15px' }}
                          inputProps={{ 'aria-label': 'ant design' }}
                        />
                        <Typography>
                          {t('Migrating Factors')}
                        </Typography>
                        <div style={{ float: 'left', margin: '3px 0 0 5px' }}>
                          <Tooltip title={t('Migrating Factors')} >
                            <Information fontSize="inherit" color="disabled" />
                          </Tooltip>
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions classes={{ root: classes.dialogActions }}>
                  <Grid container={true} spacing={3}>
                    <Grid item={true} xs={8}>
                      <Typography style={{ marginTop: '15px' }}>
                        {t('An email with a download link will be sent to your email')}
                      </Typography>
                    </Grid>
                    <Grid
                      item={true}
                      xs={4}
                    >
                      <Button
                        variant="outlined"
                        onClick={handleReset}
                        classes={{ root: classes.buttonPopover }}
                      >
                        {t('Cancel')}
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={submitForm}
                        disabled={isSubmitting}
                        classes={{ root: classes.buttonPopover }}
                      >
                        {t('Submit')}
                      </Button>
                    </Grid>
                  </Grid>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>
      </>
    );
  }
}

Export.propTypes = {
  keyword: PropTypes.string,
  theme: PropTypes.object,
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withStyles(styles),
)(Export);
