import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import { Edit } from '@mui/icons-material';
import { graphql } from 'react-relay';
import { commitMutation, QueryRenderer } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import CourseOfActionEditionContainer from './CourseOfActionEditionContainer';
import { courseOfActionEditionOverviewFocus } from './CourseOfActionEditionOverview';
import Loader from '../../../../components/Loader';

const styles = (theme) => ({
  editButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'auto',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
});

export const courseOfActionEditionQuery = graphql`
  query CourseOfActionEditionContainerQuery($id: String!) {
    courseOfAction(id: $id) {
      ...CourseOfActionEditionContainer_courseOfAction
    }
    settings {
      platform_enable_reference
    }
  }
`;

class CourseOfActionEdition extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    commitMutation({
      mutation: courseOfActionEditionOverviewFocus,
      variables: {
        id: this.props.courseOfActionId,
        input: { focusOn: '' },
      },
    });
    this.setState({ open: false });
  }

  render() {
    const { classes, courseOfActionId } = this.props;
    return (
      <div>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="secondary"
          aria-label="Edit"
          className={classes.editButton}
        >
          <Edit />
        </Fab>
        <Drawer
          open={this.state.open}
          anchor="right"
          elevation={1}
          sx={{ zIndex: 1202 }}
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleClose.bind(this)}
        >
          <QueryRenderer
            query={courseOfActionEditionQuery}
            variables={{ id: courseOfActionId }}
            render={({ props }) => {
              if (props) {
                return (
                  <CourseOfActionEditionContainer
                    courseOfAction={props.courseOfAction}
                    enableReferences={props.settings.platform_enable_reference?.includes(
                      'Course-Of-Action',
                    )}
                    handleClose={this.handleClose.bind(this)}
                  />
                );
              }
              return <Loader variant="inElement" />;
            }}
          />
        </Drawer>
      </div>
    );
  }
}

CourseOfActionEdition.propTypes = {
  courseOfActionId: PropTypes.string,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(CourseOfActionEdition);
