import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import {
  compose, propOr, filter, append, take,
} from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import {
  Add, Close, Delete, More,
} from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { DialogTitle } from '@material-ui/core';
import { commitMutation, MESSAGING$ } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import inject18n from '../../../../components/i18n';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  title: {
    float: 'left',
    textTransform: 'uppercase',
  },
  popover: {
    float: 'left',
    marginTop: '-13px',
  },
  aliases: {
    float: 'right',
    overflowX: 'hidden',
    marginTop: '-5px',
  },
  alias: {
    marginRight: 7,
  },
  aliasInput: {
    margin: '4px 0 0 10px',
    float: 'right',
  },
});

const stixDomainEntityMutation = graphql`
  mutation StixDomainEntityHeaderFieldMutation($id: ID!, $input: EditInput!) {
    stixDomainEntityEdit(id: $id) {
      fieldPatch(input: $input) {
        alias
      }
    }
  }
`;

class StixDomainEntityHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openAlias: false,
      openAliases: false,
      openAliasesCreate: false,
    };
  }

  handleToggleOpenAliases() {
    this.setState({ openAliases: !this.state.openAliases });
  }

  handleToggleCreateAlias() {
    this.setState({ openAlias: !this.state.openAlias });
  }

  onSubmitCreateAlias(element, data, { resetForm }) {
    if (
      (this.props.stixDomainEntity.alias === null
        || !this.props.stixDomainEntity.alias.includes(data.new_alias))
      && data.new_alias !== ''
    ) {
      commitMutation({
        mutation: stixDomainEntityMutation,
        variables: {
          id: this.props.stixDomainEntity.id,
          input: {
            key: 'alias',
            value: append(data.new_alias, this.props.stixDomainEntity.alias),
          },
        },
        onCompleted: () => MESSAGING$.notifySuccess(this.props.t('The alias has been added')),
      });
    }
    this.setState({ openAlias: false });
    resetForm();
  }

  deleteAlias(alias) {
    const aliases = filter(a => a !== alias, this.props.stixDomainEntity.alias);
    commitMutation({
      mutation: stixDomainEntityMutation,
      variables: {
        id: this.props.stixDomainEntity.id,
        input: { key: 'alias', value: aliases },
      },
    });
  }

  render() {
    const {
      t,
      classes,
      variant,
      stixDomainEntity,
      PopoverComponent,
    } = this.props;
    const alias = propOr([], 'alias', stixDomainEntity);
    return (
      <div>
        <Typography
          variant="h1"
          gutterBottom={true}
          classes={{ root: classes.title }}
        >
          {stixDomainEntity.name}
        </Typography>
        <div className={classes.popover}>
          {React.cloneElement(PopoverComponent, {
            id: stixDomainEntity.id,
          })}
        </div>
        {variant !== 'noalias' ? (
          <div className={classes.aliases}>
            {take(5, alias).map(label => (label.length > 0 ? (
                <Chip
                  key={label}
                  classes={{ root: classes.alias }}
                  label={label}
                  onDelete={this.deleteAlias.bind(this, label)}
                />
            ) : (
              ''
            )))}
            {alias.length > 5 ? (
              <IconButton
                color="primary"
                aria-label="More"
                onClick={this.handleToggleOpenAliases.bind(this)}
              >
                <More fontSize="small" />
              </IconButton>
            ) : (
              <IconButton
                color="secondary"
                aria-label="Alias"
                onClick={this.handleToggleCreateAlias.bind(this)}
              >
                {this.state.openAlias ? (
                  <Close fontSize="small" />
                ) : (
                  <Add fontSize="small" />
                )}
              </IconButton>
            )}
            <Slide
              direction="left"
              in={this.state.openAlias}
              mountOnEnter={true}
              unmountOnExit={true}
            >
              <Formik
                initialValues={{ new_alias: '' }}
                onSubmit={this.onSubmitCreateAlias.bind(this, 'main')}
                render={() => (
                  <Form style={{ float: 'right' }}>
                    <Field
                      name="new_alias"
                      component={TextField}
                      autoFocus={true}
                      placeholder={t('New alias')}
                      className={classes.aliasInput}
                    />
                  </Form>
                )}
              />
            </Slide>
          </div>
        ) : (
          ''
        )}
        <div className="clearfix" />
        <Dialog
          open={this.state.openAliases}
          TransitionComponent={Transition}
          onClose={this.handleToggleOpenAliases.bind(this)}
          fullWidth={true}
        >
          <DialogTitle>
            {t('Entity aliases')}
            <Formik
              initialValues={{ new_alias: '' }}
              onSubmit={this.onSubmitCreateAlias.bind(this, 'dialog')}
              render={() => (
                <Form style={{ float: 'right' }}>
                  <Field
                    name="new_alias"
                    component={TextField}
                    autoFocus={true}
                    placeholder={t('New alias')}
                    className={classes.aliasInput}
                  />
                </Form>
              )}
            />
          </DialogTitle>
          <DialogContent dividers={true}>
            <List>
              {propOr([], 'alias', stixDomainEntity).map(label => (label.length > 0 ? (
                  <ListItem key={label} disableGutters={true} dense={true}>
                    <ListItemText primary={label} />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={this.deleteAlias.bind(this, label)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
              ) : (
                ''
              )))}
            </List>
            <div
              style={{
                display: this.state.openAliasesCreate ? 'block' : 'none',
              }}
            >
              <Formik
                initialValues={{ new_alias: '' }}
                onSubmit={this.onSubmitCreateAlias.bind(this, 'dialog')}
                render={() => (
                  <Form>
                    <Field
                      name="new_alias"
                      component={TextField}
                      autoFocus={true}
                      fullWidth={true}
                      placeholder={t('New alias')}
                      className={classes.aliasInput}
                    />
                  </Form>
                )}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleToggleOpenAliases.bind(this)}
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

StixDomainEntityHeader.propTypes = {
  stixDomainEntity: PropTypes.object,
  PopoverComponent: PropTypes.object,
  variant: PropTypes.string,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixDomainEntityHeader);
