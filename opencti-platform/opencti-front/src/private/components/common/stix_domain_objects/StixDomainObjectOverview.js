import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { InformationOutline } from 'mdi-material-ui';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import { DialogTitle } from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import { Delete, BrushOutlined } from '@material-ui/icons';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import StixCoreObjectOpinions from '../../analysis/opinions/StixCoreObjectOpinions';
import ItemMarkings from '../../../../components/ItemMarkings';
import ItemPatternType from '../../../../components/ItemPatternType';
import StixCoreObjectLabelsView from '../stix_core_objects/StixCoreObjectLabelsView';
import ItemBoolean from '../../../../components/ItemBoolean';
import ItemCreator from '../../../../components/ItemCreator';
import ItemConfidence from '../../../../components/ItemConfidence';
import ItemAuthor from '../../../../components/ItemAuthor';
import inject18n from '../../../../components/i18n';
import { commitMutation, MESSAGING$ } from '../../../../relay/environment';
import { stixDomainObjectMutation } from './StixDomainObjectHeader';
import ItemStatus from '../../../../components/ItemStatus';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = (theme) => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '15px',
    borderRadius: 6,
  },
  chip: {
    fontSize: 12,
    lineHeight: '12px',
    backgroundColor: theme.palette.background.chip,
    color: '#ffffff',
    textTransform: 'uppercase',
    borderRadius: '0',
  },
});

class StixDomainObjectOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openStixIds: false,
    };
  }

  handleToggleOpenStixIds() {
    this.setState({ openStixIds: !this.state.openStixIds });
  }

  deleteStixId(stixId) {
    const { stixDomainObject } = this.props;
    const otherStixIds = stixDomainObject.x_opencti_stix_ids || [];
    const stixIds = R.filter(
      (n) => n !== stixDomainObject.standard_id && n !== stixId,
      otherStixIds,
    );
    commitMutation({
      mutation: stixDomainObjectMutation,
      variables: {
        id: this.props.stixDomainObject.id,
        input: {
          key: 'x_opencti_stix_ids',
          value: stixIds,
        },
      },
      onCompleted: () => MESSAGING$.notifySuccess(this.props.t('The STIX ID has been removed')),
    });
  }

  render() {
    const {
      t, fldt, classes, stixDomainObject, withoutMarking, withPattern,
    } = this.props;
    const otherStixIds = stixDomainObject.x_opencti_stix_ids || [];
    const stixIds = R.filter(
      (n) => n !== stixDomainObject.standard_id,
      otherStixIds,
    );
    return (
      <div style={{ height: '100%' }} className="break">
        <Typography variant="h4" gutterBottom={true}>
          {t('Basic information')}
        </Typography>
        <Paper classes={{ root: classes.paper }} elevation={2}>
          <Grid container={true} spacing={3}>
            <Grid item={true} xs={12}>
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{ float: 'left' }}
              >
                {t('Standard STIX ID')}
              </Typography>
              <div style={{ float: 'left', margin: '-3px 0 0 8px' }}>
                <Tooltip
                  title={t(
                    'In OpenCTI, a predictable STIX ID is generated based on one or multiple attributes of the entity.',
                  )}
                >
                  <InformationOutline fontSize="small" color="primary" />
                </Tooltip>
              </div>
              <div className="clearfix" />
              <pre style={{ margin: 0 }}>{stixDomainObject.standard_id}</pre>
            </Grid>
            <Grid item={true} xs={12}>
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{ float: 'left' }}
              >
                {t('Other STIX IDs')}
              </Typography>
              <div style={{ float: 'left', margin: '-3px 0 0 8px' }}>
                <Tooltip title={t('Other known STIX IDs for this entity.')}>
                  <InformationOutline fontSize="small" color="primary" />
                </Tooltip>
              </div>
              <div style={{ float: 'right', margin: '-5px 0 0 8px' }}>
                <IconButton
                  aria-label="Close"
                  disableRipple={true}
                  size="small"
                  disabled={stixIds.length === 0}
                  onClick={this.handleToggleOpenStixIds.bind(this)}
                >
                  <BrushOutlined
                    fontSize="small"
                    color={stixIds.length === 0 ? 'inherit' : 'secondary'}
                  />
                </IconButton>
              </div>
              <div className="clearfix" />
              <pre style={{ margin: 0 }}>
                {stixIds.length > 0
                  ? stixIds.map((stixId) => `${stixId}\n`)
                  : '-'}
              </pre>
            </Grid>
            <Grid item={true} xs={6}>
              {withPattern && (
                <div>
                  <Typography variant="h3" gutterBottom={true}>
                    {t('Pattern type')}
                  </Typography>
                  <ItemPatternType label={stixDomainObject.pattern_type} />
                </div>
              )}
              {!withoutMarking && stixDomainObject.objectMarking && (
                <div>
                  <Typography
                    variant="h3"
                    gutterBottom={true}
                    style={{ marginTop: withPattern ? 20 : 0 }}
                  >
                    {t('Marking')}
                  </Typography>
                  <ItemMarkings
                    markingDefinitions={R.pathOr(
                      [],
                      ['objectMarking', 'edges'],
                      stixDomainObject,
                    )}
                    limit={10}
                  />
                </div>
              )}
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{
                  marginTop:
                    withPattern
                    || (!withoutMarking && stixDomainObject.objectMarking)
                      ? 20
                      : 0,
                }}
              >
                {t('Author')}
              </Typography>
              <ItemAuthor
                createdBy={R.propOr(null, 'createdBy', stixDomainObject)}
              />
              <StixCoreObjectOpinions
                stixCoreObjectId={stixDomainObject.id}
                variant="inEntity"
                height={160}
                marginTop={20}
              />
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{ marginTop: 20 }}
              >
                {t('Creation date')}
              </Typography>
              {fldt(stixDomainObject.created)}
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{ marginTop: 20 }}
              >
                {t('Modification date')}
              </Typography>
              {fldt(stixDomainObject.modified)}
            </Grid>
            <Grid item={true} xs={6}>
              <Typography variant="h3" gutterBottom={true}>
                {t('Revoked')}
              </Typography>
              <ItemBoolean
                status={stixDomainObject.revoked}
                label={stixDomainObject.revoked ? t('Yes') : t('No')}
                reverse={true}
              />
              <StixCoreObjectLabelsView
                labels={stixDomainObject.objectLabel}
                id={stixDomainObject.id}
                marginTop={20}
              />
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{ marginTop: 20 }}
              >
                {t('Confidence level')}
              </Typography>
              <ItemConfidence confidence={stixDomainObject.confidence} />
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{ marginTop: 20 }}
              >
                {t('Creation date (in this platform)')}
              </Typography>
              {fldt(stixDomainObject.created_at)}
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{ marginTop: 20 }}
              >
                {t('Creator')}
              </Typography>
              <ItemCreator creator={stixDomainObject.creator} />
              <Typography
                variant="h3"
                gutterBottom={true}
                style={{ marginTop: 20 }}
              >
                {t('Processing status')}
              </Typography>
              <ItemStatus
                status={stixDomainObject.status}
                disabled={!stixDomainObject.workflowEnabled}
              />
            </Grid>
          </Grid>
        </Paper>
        <Dialog
          open={this.state.openStixIds}
          TransitionComponent={Transition}
          onClose={this.handleToggleOpenStixIds.bind(this)}
          fullWidth={true}
        >
          <DialogTitle>{t('Other STIX IDs')}</DialogTitle>
          <DialogContent dividers={true}>
            <List>
              {stixIds.map(
                (stixId) => stixId.length > 0 && (
                    <ListItem key={stixId} disableGutters={true} dense={true}>
                      <ListItemText primary={stixId} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={this.deleteStixId.bind(this, stixId)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                ),
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleToggleOpenStixIds.bind(this)}
              color="primary"
            >
              {t('Close')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

StixDomainObjectOverview.propTypes = {
  stixDomainObject: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  fldt: PropTypes.func,
  withoutMarking: PropTypes.bool,
};

export default R.compose(
  inject18n,
  withStyles(styles),
)(StixDomainObjectOverview);
