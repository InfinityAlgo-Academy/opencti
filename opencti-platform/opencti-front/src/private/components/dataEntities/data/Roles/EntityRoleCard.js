import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { compose } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import Markdown from 'react-markdown';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import {
  Card,
  Typography,
  Grid,
  Checkbox,
} from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import { StarBorderOutlined } from '@material-ui/icons';
import ComputerIcon from '@material-ui/icons/Devices';
import Skeleton from '@material-ui/lab/Skeleton';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import inject18n from '../../../../../components/i18n';
import StixCoreObjectLabels from '../../../common/stix_core_objects/StixCoreObjectLabels';
import {
  addBookmark,
  deleteBookMark,
} from '../../../common/stix_domain_objects/StixDomainObjectBookmark';
import { truncate } from '../../../../../utils/String';
import CyioCoreObjectLabels from '../../../common/stix_core_objects/CyioCoreObjectLabels';
import EntitiesRolesPopover from './EntitiesRolesPopover';

const styles = (theme) => ({
  card: {
    width: '100%',
    height: '319px',
    borderRadius: 9,
    // background: theme.palette.navAlt.background,

  },
  cardDummy: {
    width: '100%',
    height: '319px',
    color: theme.palette.grey[700],
    borderRadius: 9,
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  avatarDisabled: {
    backgroundColor: theme.palette.grey[600],
  },
  area: {
    width: '100%',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '13px',
  },
  body: {
    marginBottom: '13px',
  },
  content: {
    width: '100%',
    padding: '24px',
  },
  description: {
    height: 170,
    overflow: 'hidden',
  },
  objectLabel: {
    height: 45,
    paddingTop: 7,
  },
  contentDummy: {
    width: '100%',
    height: 120,
    overflow: 'hidden',
    marginTop: 15,
  },
  placeholderHeader: {
    display: 'inline-block',
    height: '.8em',
    backgroundColor: theme.palette.grey[700],
  },
  placeholderHeaderDark: {
    display: 'inline-block',
    height: '.8em',
    backgroundColor: theme.palette.grey[800],
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
  buttonRipple: {
    opacity: 0,
  },
  headerDummy: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

class EntityRoleCardComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openMenu: false,
    };
  }

  handleOpenMenu(isOpen) {
    this.setState({ openMenu: isOpen });
  }

  render() {
    const {
      t,
      fsd,
      classes,
      node,
      selectAll,
      history,
      onToggleEntity,
      bookmarksIds,
      onLabelClick,
      selectedElements,
    } = this.props;

    return (
      <Card classes={{ root: classes.card }} raised={true} elevation={3}>
        <CardActionArea
          classes={{ root: classes.area }}
          component={Link}
          style={{ background: (selectAll || node.id in (selectedElements || {})) && '#075AD3' }}
          TouchRippleProps={this.state.openMenu && { classes: { root: classes.buttonRipple } }}
          to={`/data/entities/roles/${node?.id}`}
        >
          <CardContent className={classes.content}>
            <Grid
              item={true}
              className={classes.header}
            >
              <div>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  gutterBottom={true}
                >
                  {t('Type')}
                </Typography>
                {node.entity_type && node.entity_type}
              </div>
              <Grid
                item={true}
                onClick={(event) => event.preventDefault()}
                style={{ display: 'flex' }}
              >
                <EntitiesRolesPopover
                  handleOpenMenu={this.handleOpenMenu.bind(this)}
                  history={history}
                  node={node}
                />
                <Checkbox
                  disableRipple={true}
                  onClick={onToggleEntity.bind(this, node)}
                  checked={selectAll || node.id in (selectedElements || {})}
                  color='primary'
                />
              </Grid>
            </Grid>
            <Grid container={true} >
              <Grid item={true} xs={6} className={classes.body}>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  gutterBottom={true}>
                  {t('Name')}
                </Typography>
                <Typography>
                  {node?.name && node?.name}
                </Typography>
              </Grid>
              <Grid item={true} xs={6} className={classes.body}>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  style={{ marginTop: '13px' }}
                  gutterBottom={true}
                >
                  {t('Creation Date')}
                </Typography>
                <Typography>
                  {node.created && fsd(node.created)}
                </Typography>
              </Grid>
            </Grid>
            <Grid container={true} >
              <Grid item={true} xs={6} className={classes.body}>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  style={{ marginTop: '13px' }}
                  gutterBottom={true}
                >
                  {t('Marking')}
                </Typography>
                <Typography>
                  {node?.parent_types
                    && (node?.parent_types)}
                </Typography>
              </Grid>
              <Grid item={true} xs={6} className={classes.body}>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  style={{ marginTop: '13px' }}
                  gutterBottom={true}
                >
                  {t('Author')}
                </Typography>
                {/* TODO: Get Author Name for Display */}
                {/* <Typography>
                  {t(node?.name)}
                </Typography> */}
              </Grid>
            </Grid>
            <Grid container={true} >
              <Grid item={true} xs={12} className={classes.body}>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  style={{ marginTop: '13px' }}
                  gutterBottom={true}
                >
                  {t('Labels')}
                </Typography>
                <CyioCoreObjectLabels
                  labels={node.labels}
                  onClick={onLabelClick.bind(this)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
}

EntityRoleCardComponent.propTypes = {
  node: PropTypes.object,
  bookmarksIds: PropTypes.array,
  classes: PropTypes.object,
  t: PropTypes.func,
  fsd: PropTypes.func,
  onLabelClick: PropTypes.func,
  onBookmarkClick: PropTypes.func,
};

const EntityRoleCardFragment = createFragmentContainer(
  EntityRoleCardComponent,
  {
    node: graphql`
      fragment EntityRoleCard_node on OscalRole {
        __typename
        id
        description
        short_name
        name
        role_identifier
        entity_type
        created
        modified
        labels {
          __typename
          id
          name
          color
          entity_type
          description
        }
        links {
          __typename
          id
          source_name
          description
          entity_type
          url
          hashes {
            value
          }
          external_id
        }
        remarks {
          __typename
          id
          entity_type
          abstract
          content
          authors
        }
      }
    `,
  },
);

export const EntityRoleCard = compose(
  inject18n,
  withStyles(styles),
)(EntityRoleCardFragment);

class EntityRoleCardDummyComponent extends Component {
  render() {
    const { classes } = this.props;
    return (
      <Card classes={{ root: classes.cardDummy }} raised={true} elevation={3}>
        <CardActionArea classes={{ root: classes.area }}>
          <CardHeader
            classes={{ root: classes.header }}
            title={
              <div className={classes.headerDummy}>
                <Skeleton
                  animation="wave"
                  variant="circle"
                  width={30}
                  height={30}
                />
                <div style={{ width: '100%', padding: '0px 20px' }}>
                  <Skeleton
                    animation="wave"
                    variant="rect"
                    width="100%"
                    style={{ marginBottom: 10 }}
                  />
                  <Skeleton
                    animation="wave"
                    variant="rect"
                    width="100%"
                  />
                </div>
                <Skeleton
                  animation="wave"
                  variant="circle"
                  width={30}
                  height={30}
                />
              </div>
            }
            titleTypographyProps={{ color: 'inherit' }}
          />
          <CardContent classes={{ root: classes.contentDummy }}>
            <Skeleton
              animation="wave"
              variant="rect"
              width="90%"
              style={{ marginBottom: 10 }}
            />
            <Skeleton
              animation="wave"
              variant="rect"
              width="95%"
              style={{ marginBottom: 10 }}
            />
            <Skeleton
              animation="wave"
              variant="rect"
              width="90%"
              style={{ marginBottom: 10 }}
            />
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
}

EntityRoleCardDummyComponent.propTypes = {
  classes: PropTypes.object,
};

export const EntityRoleCardDummy = compose(
  inject18n,
  withStyles(styles),
)(EntityRoleCardDummyComponent);
