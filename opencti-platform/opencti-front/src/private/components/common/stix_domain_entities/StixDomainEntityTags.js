import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  compose,
  map,
  pathOr,
  pipe,
  union,
  append,
  filter,
  sortWith,
  ascend,
  prop,
} from 'ramda';
import { Form, Formik } from 'formik';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import { Add } from '@material-ui/icons';
import { Tag } from 'mdi-material-ui';
import { commitMutation, fetchQuery } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import { tagsSearchQuery } from '../../settings/Tags';
import Autocomplete from '../../../../components/Autocomplete';
import TagCreation from '../../settings/tags/TagCreation';
import Security, { KNOWLEDGE_KNUPDATE } from '../../../../utils/Security';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  tags: {
    margin: 0,
    padding: 0,
  },
  tag: {
    margin: '0 7px 7px 0',
  },
  tagInput: {
    margin: '4px 0 0 10px',
    float: 'right',
  },
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  autoCompleteIndicator: {
    display: 'none',
  },
});

const stixDomainEntityMutationRelationsAdd = graphql`
  mutation StixDomainEntityTagsRelationsAddMutation(
    $id: ID!
    $input: RelationsAddInput!
  ) {
    stixDomainEntityEdit(id: $id) {
      relationsAdd(input: $input) {
        tags {
          edges {
            node {
              id
              tag_type
              value
              color
            }
          }
        }
      }
    }
  }
`;

const stixDomainEntityMutationRelationDelete = graphql`
  mutation StixDomainEntityTagsRelationDeleteMutation(
    $id: ID!
    $toId: String
    $relationType: String
  ) {
    stixDomainEntityEdit(id: $id) {
      relationDelete(toId: $toId, relationType: $relationType) {
        ... on StixEntity {
          tags {
            edges {
              node {
                id
                tag_type
                value
                color
              }
            }
          }
        }
      }
    }
  }
`;

class StixDomainEntityTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openAdd: false,
      openCreate: false,
      tags: [],
      tagInput: '',
    };
  }

  handleOpenAdd() {
    this.setState({ openAdd: true });
  }

  handleCloseAdd() {
    this.setState({ openAdd: false });
  }

  handleOpenCreate() {
    this.setState({ openCreate: true });
  }

  handleCloseCreate() {
    this.setState({ openCreate: false });
  }

  searchTags(event) {
    this.setState({
      tagInput: event && event.target.value !== 0 ? event.target.value : '',
    });
    fetchQuery(tagsSearchQuery, {
      search: event && event.target.value !== 0 ? event.target.value : '',
    }).then((data) => {
      const tags = pipe(
        pathOr([], ['tags', 'edges']),
        map((n) => ({
          label: n.node.value,
          value: n.node.id,
          color: n.node.color,
        })),
      )(data);
      this.setState({
        tags: union(this.state.tags, tags),
      });
    });
  }

  onSubmit(values, { setSubmitting, resetForm }) {
    const currentTagsIds = map((tag) => tag.node.id, this.props.tags.edges);
    const tagsIds = pipe(
      map((value) => value.value),
      filter((value) => !currentTagsIds.includes(value)),
    )(values.new_tags);
    commitMutation({
      mutation: stixDomainEntityMutationRelationsAdd,
      variables: {
        id: this.props.id,
        input: {
          fromRole: 'so',
          toIds: tagsIds,
          toRole: 'tagging',
          through: 'tagged',
        },
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        this.handleCloseAdd();
      },
    });
  }

  handleRemoveTag(tagId) {
    commitMutation({
      mutation: stixDomainEntityMutationRelationDelete,
      variables: {
        id: this.props.id,
        toId: tagId,
        relationType: 'tagged',
      },
    });
  }

  onReset() {
    this.handleCloseAdd();
  }

  render() {
    const { classes, tags, t } = this.props;
    const tagsNodes = pipe(
      map((n) => n.node),
      sortWith([ascend(prop('value'))]),
    )(tags.edges);
    return (
      <div>
        <Typography variant="h3" gutterBottom={true} style={{ float: 'left' }}>
          {t('Tags')}
        </Typography>
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <IconButton
            color="secondary"
            aria-label="Tag"
            onClick={this.handleOpenAdd.bind(this)}
            style={{ float: 'left', margin: '-15px 0 0 -2px' }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Security>
        <div className="clearfix" />
        <div className={classes.tags}>
          {map(
            (tag) => (
              <Chip
                key={tag.id}
                classes={{ root: classes.tag }}
                label={tag.value}
                style={{ backgroundColor: tag.color }}
                onDelete={this.handleRemoveTag.bind(this, tag.id)}
              />
            ),
            tagsNodes,
          )}
        </div>
        <Formik
          initialValues={{ new_tags: [] }}
          onSubmit={this.onSubmit.bind(this)}
          onReset={this.onReset.bind(this)}
        >
          {({
            submitForm,
            handleReset,
            isSubmitting,
            setFieldValue,
            values,
          }) => (
            <Dialog
              open={this.state.openAdd}
              TransitionComponent={Transition}
              onClose={this.handleCloseAdd.bind(this)}
              fullWidth={true}
            >
              <DialogTitle>{t('Add new tags')}</DialogTitle>
              <DialogContent style={{ overflowY: 'hidden' }}>
                <Form>
                  <Autocomplete
                    name="new_tags"
                    multiple={true}
                    textfieldprops={{
                      label: t('Tags'),
                      onFocus: this.searchTags.bind(this),
                    }}
                    noOptionsText={t('No available options')}
                    options={this.state.tags}
                    onInputChange={this.searchTags.bind(this)}
                    openCreate={this.handleOpenCreate.bind(this)}
                    renderOption={(option) => (
                      <React.Fragment>
                        <div
                          className={classes.icon}
                          style={{ color: option.color }}
                        >
                          <Tag />
                        </div>
                        <div className={classes.text}>{option.label}</div>
                      </React.Fragment>
                    )}
                    classes={{ clearIndicator: classes.autoCompleteIndicator }}
                  />
                </Form>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleReset}
                  disabled={isSubmitting}
                  color="primary"
                >
                  {t('Close')}
                </Button>
                <Button
                  onClick={submitForm}
                  disabled={isSubmitting}
                  color="primary"
                >
                  {t('Add')}
                </Button>
              </DialogActions>
              <TagCreation
                contextual={true}
                open={this.state.openCreate}
                inputValue={this.state.tagInput}
                handleClose={this.handleCloseCreate.bind(this)}
                creationCallback={(data) => {
                  setFieldValue(
                    'new_tags',
                    append(
                      {
                        label: data.tagAdd.value,
                        value: data.tagAdd.id,
                      },
                      values.new_tags,
                    ),
                  );
                }}
              />
            </Dialog>
          )}
        </Formik>
      </div>
    );
  }
}

StixDomainEntityTags.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func,
  id: PropTypes.string,
  tags: PropTypes.object,
};

export default compose(inject18n, withStyles(styles))(StixDomainEntityTags);
