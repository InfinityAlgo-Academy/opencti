/* eslint-disable */
/* refactor */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  compose,
  pipe,
  map,
  pathOr,
  mergeAll,
} from 'ramda';
import { Link } from 'react-router-dom';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { MoreVert } from '@material-ui/icons';
import Skeleton from '@material-ui/lab/Skeleton';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import GroupIcon from '@material-ui/icons/Group';
import Tooltip from '@material-ui/core/Tooltip';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import Button from '@material-ui/core/Button';
import * as R from 'ramda';
import { AutoFix, Information } from 'mdi-material-ui';
import inject18n from '../../../../../components/i18n';
import ItemConfidence from '../../../../../components/ItemConfidence';
import RemediationPopover from './RemediationPopover';
import { resolveLink } from '../../../../../utils/Entity';
import ItemIcon from '../../../../../components/ItemIcon';
import RequiredResourcePopover from './RequiredResourcePopover';
import { defaultValue } from '../../../../../utils/Graph';
import Security, { KNOWLEDGE_KNUPDATE } from '../../../../../utils/Security';
import CyioCoreobjectExternalReferences from '../../../analysis/external_references/CyioCoreObjectExternalReferences';
import CyioCoreObjectOrCyioCoreRelationshipNotes from '../../../analysis/notes/CyioCoreObjectOrCyioCoreRelationshipNotes';

const styles = (theme) => ({
  item: {
    paddingLeft: 10,
  },
  ListItem: {
    display: 'grid',
    gridTemplateColumns: '20% 15% 15% 15% 1fr 1fr',
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  bodyItem: {
    float: 'left',
    height: '48px',
    display: 'flex',
    overflow: 'hidden',
    fontSize: '13px',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    justifyContent: 'left',
  },
  avatar: {
    width: 24,
    height: 24,
    backgroundColor: theme.palette.primary.main,
  },
  avatarDisabled: {
    width: 24,
    height: 24,
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
  buttonExpand: {
    position: 'absolute',
    bottom: 2,
    width: '100%',
    height: 25,
    backgroundColor: 'rgba(255, 255, 255, .2)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, .5)',
    },
  },
  accordionDetails: {
    display: 'block',
  },
  dialogActions: {
    justifyContent: 'flex-start',
    padding: '10px 0 20px 22px',
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
  itemIconDisabled: {
    color: theme.palette.grey[700],
  },
});

class RequiredResourceLineComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      removing: false,
      expanded: false,
      value: false,
    };
  }

  handleClick() {
    this.setState({
      value: !this.state.value,
    });
  }

  handleOpenDialog(requiredResourcesEdge) {
    const openedState = {
      displayDialog: true,
      removeExternalReference: requiredResourcesEdge,
    };
    this.setState(openedState);
  }

  handleCloseDialog() {
    const closedState = {
      displayDialog: false,
      removeExternalReference: null,
    };
    this.setState(closedState);
  }

  handleRemoval() {
    this.setState({ removing: true });
    this.removeExternalReference(this.state.removeExternalReference);
  }

  render() {
    const {
      fsd,
      t,
      fldt,
      classes,
      refreshQuery,
      data,
      remediationId,
      displayRelation,
      entityId,
      requiredResourceId,
    } = this.props;
    const { expanded } = this.state;
    const requiredResourceNode = pipe(
      pathOr([], ['subjects']),
      map((value) => ({
        name: value.subject_ref.name,
        description: value.subject_ref.description,
        resource_type: value.subject_ref.party_type,
        resource: value.subject_ref.asset_type,
      })),
      mergeAll,
    )(data);
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '90% 10%',
        borderBottom: '1px solid grey',
        margin: '0 20px',
      }}>
        <Accordion style={{ borderBottom: '0', boxShadow: 'none' }}>
          <AccordionSummary
            onClick={() => this.handleClick()}
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            classes={{ root: classes.summary }}
          >
            {this.state.value ? '' : (
              <CardContent style={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon fontSize='large' color="disabled" />
                <div style={{ marginLeft: '10px' }}>
                  <Typography align="left" variant="h2" style={{ textTransform: 'capitalize' }}>
                    {data.name && t(data.name)}
                  </Typography>
                  <Typography align="left" variant="subtitle1">
                    <Markdown
                      remarkPlugins={[remarkGfm, remarkParse]}
                      parserOptions={{ commonmark: true }}
                      className="markdown"
                    >
                      {data.description && t(data.description)}
                    </Markdown>
                  </Typography>
                </div>
              </CardContent>
            )
            }
          </AccordionSummary>
          <AccordionDetails classes={{ root: classes.accordionDetails }}>
            <Grid container={true} spacing={3} >
              <Grid item={true} xs={6}>
                <Grid style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ marginLeft: '10px' }}>
                    <Typography align="left" color="textSecondary" variant="h3">{t('Name')}</Typography>
                    <Typography align="left" variant="subtitle1">
                      {data.name && t(data.name)}
                    </Typography>
                  </div>
                </Grid>
                <Grid style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ marginLeft: '10px' }}>
                    <Typography align="left" color="textSecondary" variant="h3">{t('Resource Type')}</Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <GroupIcon fontSize='large' color="textSecondary" />
                      <Typography style={{ marginLeft: '10px' }} align="center" variant="subtitle1">
                        {requiredResourceNode.resource_type
                          && t(requiredResourceNode.resource_type)}
                      </Typography>
                    </div>
                  </div>
                </Grid>
              </Grid>
              <Grid item={true} xs={6}>
                <Grid style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ marginLeft: '10px' }}>
                    <Typography align="left" color="textSecondary" variant="h3">{t('ID')}</Typography>
                    <Typography align="left" variant="subtitle1">
                      {/* {t('Lorem Ipsum')} */}
                      {data.id && t(data.id)}
                    </Typography>
                  </div>
                </Grid>
                <Grid style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ marginLeft: '10px' }}>
                    <Typography align="left" color="textSecondary" variant="h3">{t('Resource')}</Typography>
                    <Typography align="left" variant="subtitle1">
                      {requiredResourceNode.resource && t(requiredResourceNode.resource)}
                    </Typography>
                  </div>
                </Grid>
              </Grid>

            </Grid>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={12}>
                <Typography
                  color="textSecondary"
                  gutterBottom={true}
                  style={{ float: 'left', marginTop: 20 }}
                >
                  {t('Description')}
                </Typography>
                <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                  <Tooltip
                    title='Description'
                  >
                    <Information fontSize="inherit" color="disabled" />
                  </Tooltip>
                </div>
                <div className="clearfix" />
                <div className={classes.scrollBg}>
                  <div className={classes.scrollDiv}>
                    <div className={classes.scrollObj}>
                      <Markdown
                        remarkPlugins={[remarkGfm, remarkParse]}
                        parserOptions={{ commonmark: true }}
                        className="markdown"
                      >
                        {data.description && t(data.description)}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid style={{ marginTop: '10px' }} xs={12} item={true}>
                <CyioCoreobjectExternalReferences
                  typename={data.__typename}
                  fieldName='links'
                  externalReferences={data.links}
                  cyioCoreObjectId={data.id}
                  refreshQuery={refreshQuery}
                />
              </Grid>
              <Grid style={{ margin: '30px 0 20px 0' }} xs={12} item={true}>
                <CyioCoreObjectOrCyioCoreRelationshipNotes
                  typename={data.__typename}
                  notes={data.remarks}
                  fieldName='remarks'
                  cyioCoreObjectOrCyioCoreRelationshipId={data.id}
                  marginTop='0px'
                  refreshQuery={refreshQuery}
                // data={props}
                // marginTop={marginTop}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <div style={{ marginTop: '30px' }}>
          <RequiredResourcePopover
            handleRemove={this.handleOpenDialog.bind(this)}
            remediationId={remediationId}
            data={data}
            refreshQuery={refreshQuery}
            requiredResourceId={requiredResourceId}
          />
        </div>
      </div>
    );
  }
}

RequiredResourceLineComponent.propTypes = {
  paginationOptions: PropTypes.object,
  remediationId: PropTypes.string,
  dataColumns: PropTypes.object,
  node: PropTypes.object,
  data: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  fldt: PropTypes.func,
  refreshQuery: PropTypes.func,
  fsd: PropTypes.func,
  displayRelation: PropTypes.bool,
  entityId: PropTypes.string,
  requiredResourceId: PropTypes.string,
};

export default compose(
  inject18n,
  withStyles(styles),
)(RequiredResourceLineComponent);
