import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { graphql, createFragmentContainer } from 'react-relay';
import {
  green,
  pink,
  deepOrange,
  yellow,
  teal,
  deepPurple,
  indigo,
  red,
  lightGreen,
  orange,
} from '@mui/material/colors';
import withStyles from '@mui/styles/withStyles';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import {
  AddOutlined,
  EditOutlined,
  HelpOutlined,
  LinkOutlined,
  LinkOffOutlined,
  DeleteOutlined,
  VisibilityOutlined,
  DownloadOutlined,
} from '@mui/icons-material';
import { LinkVariantPlus, LinkVariantRemove, Merge } from 'mdi-material-ui';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import inject18n from '../../../../components/i18n';
import MarkdownDisplay from '../../../../components/MarkdownDisplay';

const styles = (theme) => ({
  container: {
    marginBottom: 20,
  },
  line: {
    content: ' ',
    display: 'block',
    position: 'absolute',
    top: 50,
    left: 20,
    width: 1,
    height: 18,
  },
  avatar: {
    float: 'left',
    width: 40,
    height: 40,
    margin: '5px 10px 0 0',
  },
  content: {
    width: 'auto',
    overflow: 'hidden',
  },
  tooltip: {
    maxWidth: '80%',
    lineHeight: 2,
    padding: 10,
  },
  paper: {
    width: '100%',
    height: '100%',
    padding: '8px 15px 0 15px',
    backgroundColor: theme.palette.background.shadow,
  },
  description: {
    height: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  date: {
    float: 'right',
    textAlign: 'right',
    width: 180,
    paddingTop: 4,
    fontSize: 11,
  },
});

class UserHistoryLineComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  renderIcon(eventScope, isRelation, eventMessage, commit) {
    if (isRelation) {
      if (eventScope === 'create') {
        return (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: pink[500],
              color: '#ffffff',
              cursor: commit ? 'pointer' : 'auto',
            }}
            onClick={() => commit && this.handleOpen()}
          >
            <LinkOutlined fontSize="small" />
          </Avatar>
        );
      }
      if (eventScope === 'delete') {
        return (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: deepPurple[500],
              color: '#ffffff',
              cursor: commit ? 'pointer' : 'auto',
            }}
            onClick={() => commit && this.handleOpen()}
          >
            <LinkOffOutlined fontSize="small" />
          </Avatar>
        );
      }
    } else {
      if (eventScope === 'create') {
        return (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: pink[500],
              color: '#ffffff',
              cursor: commit ? 'pointer' : 'auto',
            }}
            onClick={() => commit && this.handleOpen()}
          >
            <AddOutlined fontSize="small" />
          </Avatar>
        );
      }
      if (eventScope === 'merge') {
        return (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: teal[500],
              color: '#ffffff',
              cursor: commit ? 'pointer' : 'auto',
            }}
            onClick={() => commit && this.handleOpen()}
          >
            <Merge fontSize="small" />
          </Avatar>
        );
      }
      if (
        eventScope === 'update'
        && (eventMessage.includes('replaces') || eventMessage.includes('updates'))
      ) {
        return (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: green[500],
              color: '#ffffff',
              cursor: commit ? 'pointer' : 'auto',
            }}
            onClick={() => commit && this.handleOpen()}
          >
            <EditOutlined fontSize="small" />
          </Avatar>
        );
      }
      if (eventScope === 'update' && eventMessage.includes('changes')) {
        return (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: green[500],
              color: '#ffffff',
              cursor: commit ? 'pointer' : 'auto',
            }}
            onClick={() => commit && this.handleOpen()}
          >
            <EditOutlined fontSize="small" />
          </Avatar>
        );
      }
      if (eventScope === 'update' && eventMessage.includes('adds')) {
        return (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: indigo[500],
              color: '#ffffff',
              cursor: commit ? 'pointer' : 'auto',
            }}
            onClick={() => commit && this.handleOpen()}
          >
            <LinkVariantPlus fontSize="small" />
          </Avatar>
        );
      }
      if (eventScope === 'update' && eventMessage.includes('removes')) {
        return (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: deepOrange[500],
              color: '#ffffff',
              cursor: commit ? 'pointer' : 'auto',
            }}
            onClick={() => commit && this.handleOpen()}
          >
            <LinkVariantRemove fontSize="small" />
          </Avatar>
        );
      }
      if (eventScope === 'delete') {
        return (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: red[500],
              color: '#ffffff',
            }}
          >
            <DeleteOutlined fontSize="small" />
          </Avatar>
        );
      }
      if (eventScope === 'read') {
        return (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: lightGreen[700],
              color: '#ffffff',
            }}
          >
            <VisibilityOutlined fontSize="small" />
          </Avatar>
        );
      }
      if (eventScope === 'download') {
        return (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              backgroundColor: orange[800],
              color: '#ffffff',
            }}
          >
            <DownloadOutlined fontSize="small" />
          </Avatar>
        );
      }
    }
    return (
      <Avatar
        sx={{
          width: 30,
          height: 30,
          backgroundColor: yellow[500],
          color: '#ffffff',
        }}
        onClick={() => commit && this.handleOpen()}
      >
        <HelpOutlined fontSize="small" />
      </Avatar>
    );
  }

  render() {
    const { nsdt, classes, node, t } = this.props;
    return (
      <div className={classes.container}>
        <div className={classes.avatar}>
          {this.renderIcon(node.event_scope, false, node.context_data?.message)}
        </div>
        <div
          className={classes.content}
          style={{
            height:
              node.context_data
              && node.context_data.external_references
              && node.context_data.external_references.length > 0
                ? 'auto'
                : 40,
          }}
        >
          <Paper classes={{ root: classes.paper }}>
            <div className={classes.date}>{nsdt(node.timestamp)}</div>
            <Tooltip
              classes={{ tooltip: classes.tooltip }}
              title={
                <MarkdownDisplay
                  content={`\`${node.user.name}\` ${node.context_data?.message}`}
                  remarkGfmPlugin={true}
                  commonmark={true}
                />
              }
            >
              <div className={classes.description}>
                <MarkdownDisplay
                  content={`\`${node.user.name}\` ${node.context_data?.message}`}
                  remarkGfmPlugin={true}
                  commonmark={true}
                />
              </div>
            </Tooltip>
          </Paper>
        </div>
        <div className={classes.line} />
        <Dialog
          open={this.state.open}
          PaperProps={{ elevation: 1 }}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
        >
          <DialogTitle>{t('Commit message')}</DialogTitle>
          <DialogContent>
            <MarkdownDisplay
              content={node.context_data?.commit}
              remarkGfmPlugin={true}
              commonmark={true}
            />
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleClose.bind(this)}>
              {t('Close')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

UserHistoryLineComponent.propTypes = {
  node: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  nsdt: PropTypes.func,
};

const UserHistoryLine = createFragmentContainer(UserHistoryLineComponent, {
  node: graphql`
    fragment UserHistoryLine_node on Log {
      id
      event_type
      event_scope
      timestamp
      user {
        name
      }
      context_data {
        message
        commit
        external_references {
          id
          source_name
          external_id
          url
          description
        }
      }
    }
  `,
});

export default compose(inject18n, withStyles(styles))(UserHistoryLine);
