import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay';
import withStyles from '@mui/styles/withStyles';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import {
  CheckCircleOutlined,
  DoNotDisturbOnOutlined,
  GroupOutlined,
  KeyboardArrowRightOutlined,
} from '@mui/icons-material';
import { compose } from 'ramda';
import Skeleton from '@mui/material/Skeleton';
import { Link } from 'react-router-dom';
import inject18n from '../../../../components/i18n';

const styles = (theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 5,
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
  itemIconDisabled: {
    color: theme.palette.grey[700],
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
});

class GroupLineComponent extends Component {
  render() {
    const { fd, classes, dataColumns, node } = this.props;
    return (
      <ListItem
        classes={{ root: classes.item }}
        divider={true}
        button={true}
        component={Link}
        to={`/dashboard/settings/accesses/groups/${node.id}`}
      >
        <ListItemIcon classes={{ root: classes.itemIcon }}>
          <GroupOutlined />
        </ListItemIcon>
        <ListItemText
          primary={
            <div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.name.width }}
              >
                {node.name}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.default_assignation.width }}
              >
                {node.default_assignation ? (
                  <CheckCircleOutlined fontSize="small" color="success" />
                ) : (
                  <DoNotDisturbOnOutlined fontSize="small" color="primary" />
                )}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.auto_new_marking.width }}
              >
                {node.auto_new_marking ? (
                  <CheckCircleOutlined fontSize="small" color="success" />
                ) : (
                  <DoNotDisturbOnOutlined fontSize="small" color="primary" />
                )}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.created_at.width }}
              >
                {fd(node.created_at)}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.updated_at.width }}
              >
                {fd(node.updated_at)}
              </div>
            </div>
          }
        />
        <ListItemIcon classes={{ root: classes.goIcon }}>
          <KeyboardArrowRightOutlined />
        </ListItemIcon>
      </ListItem>
    );
  }
}

GroupLineComponent.propTypes = {
  dataColumns: PropTypes.object,
  node: PropTypes.object,
  paginationOptions: PropTypes.object,
  me: PropTypes.object,
  classes: PropTypes.object,
  fd: PropTypes.func,
};

const GroupLineFragment = createFragmentContainer(GroupLineComponent, {
  node: graphql`
    fragment GroupLine_node on Group {
      id
      name
      default_assignation
      auto_new_marking
      created_at
      updated_at
    }
  `,
});

export const GroupLine = compose(
  inject18n,
  withStyles(styles),
)(GroupLineFragment);

class GroupLineDummyComponent extends Component {
  render() {
    const { classes, dataColumns } = this.props;
    return (
      <ListItem classes={{ root: classes.item }} divider={true}>
        <ListItemIcon classes={{ root: classes.itemIconDisabled }}>
          <Skeleton
            animation="wave"
            variant="circular"
            width={30}
            height={30}
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.name.width }}
              >
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width="90%"
                  height="100%"
                />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.default_assignation.width }}
              >
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={80}
                  height="100%"
                />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.auto_new_marking.width }}
              >
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={80}
                  height="100%"
                />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.created_at.width }}
              >
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={80}
                  height="100%"
                />
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.updated_at.width }}
              >
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={80}
                  height="100%"
                />
              </div>
            </div>
          }
        />
        <ListItemSecondaryAction classes={{ root: classes.itemIconDisabled }}>
          <KeyboardArrowRightOutlined />
        </ListItemSecondaryAction>
      </ListItem>
    );
  }
}

GroupLineDummyComponent.propTypes = {
  dataColumns: PropTypes.object,
  classes: PropTypes.object,
};

export const GroupLineDummy = compose(
  inject18n,
  withStyles(styles),
)(GroupLineDummyComponent);
