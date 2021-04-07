import React from 'react';
import * as PropTypes from 'prop-types';
import { propOr, compose } from 'ramda';
import { v4 as uuid } from 'uuid';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  WarningOutlined,
} from '@material-ui/icons';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import inject18n from '../../../../components/i18n';
import { commitMutation } from '../../../../relay/environment';

const styles = (theme) => ({
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

const fileWorkDeleteMutation = graphql`
  mutation FileWorkDeleteMutation($workId: ID!) {
    workEdit(id: $workId) {
      delete
    }
  }
`;

const FileWorkComponent = (props) => {
  const deleteWork = (workId) => {
    commitMutation({
      mutation: fileWorkDeleteMutation,
      variables: { workId },
    });
  };
  const {
    t,
    nsdt,
    classes,
    file: { works },
  } = props;
  return (
    <List component="div" disablePadding={true}>
      {works
        && works.map((work) => {
          const message = work.messages.map((s) => s.message).join('\r\n');
          const numberOfError = work.errors.length;
          const secondaryLabel = `${nsdt(work.timestamp)} `;
          const { tracking } = work;
          const computeLabel = () => {
            let statusText = '';
            if (!work.received_time) {
              statusText = ' (Pending)';
            } else if (tracking.import_expected_number > 0) {
              statusText = ` (${tracking.import_processed_number}/${tracking.import_expected_number})`;
            }
            if (numberOfError > 0) {
              statusText += ` - [ ${numberOfError} error${
                numberOfError > 1 ? 's' : ''
              } ]`;
            }
            return `${propOr(
              t('Deleted'),
              'name',
              work.connector,
            )}${statusText}`;
          };
          return (
            <Tooltip title={message} key={uuid()}>
              <ListItem
                dense={true}
                button={true}
                divider={true}
                classes={{ root: classes.nested }}
              >
                <ListItemIcon>
                  {work.status === 'complete' && numberOfError === 0 && (
                    <CheckCircleOutlined
                      style={{ fontSize: 15, color: '#4caf50' }}
                    />
                  )}
                  {work.status === 'complete' && numberOfError > 0 && (
                    <WarningOutlined
                      style={{ fontSize: 15, color: '#f44336' }}
                    />
                  )}
                  {(work.status === 'progress' || work.status === 'wait') && (
                    <CircularProgress
                      size={20}
                      thickness={2}
                      style={{ marginRight: 10 }}
                    />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={computeLabel()}
                  secondary={secondaryLabel}
                />
                <ListItemSecondaryAction style={{ right: 0 }}>
                  <IconButton
                    color="primary"
                    onClick={() => deleteWork(work.id)}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Tooltip>
          );
        })}
    </List>
  );
};

FileWorkComponent.propTypes = {
  classes: PropTypes.object,
  file: PropTypes.object.isRequired,
  nsdt: PropTypes.func,
};

const FileWork = createFragmentContainer(FileWorkComponent, {
  file: graphql`
    fragment FileWork_file on File {
      id
      works {
        id
        connector {
          name
        }
        user {
          name
        }
        received_time
        tracking {
          import_expected_number
          import_processed_number
        }
        messages {
          timestamp
          message
        }
        errors {
          timestamp
          message
        }
        status
        timestamp
      }
    }
  `,
});

export default compose(inject18n, withStyles(styles))(FileWork);
