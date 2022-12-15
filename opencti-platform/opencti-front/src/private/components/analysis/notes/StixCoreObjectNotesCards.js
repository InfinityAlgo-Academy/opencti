import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import { graphql, createPaginationContainer } from 'react-relay';
import Typography from '@mui/material/Typography';
import { Field, Form, Formik } from 'formik';
import Button from '@mui/material/Button';
import {
  EditOutlined,
  ExpandMoreOutlined,
  RateReviewOutlined,
} from '@mui/icons-material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import * as Yup from 'yup';
import { ConnectionHandler } from 'relay-runtime';
import IconButton from '@mui/material/IconButton';
import inject18n from '../../../../components/i18n';
import StixCoreObjectOrStixCoreRelationshipNoteCard from './StixCoreObjectOrStixCoreRelationshipNoteCard';
import Security from '../../../../utils/Security';
import { KNOWLEDGE_KNPARTICIPATE } from '../../../../utils/hooks/useGranted';
import AddNotes from './AddNotes';
import MarkDownField from '../../../../components/MarkDownField';
import { commitMutation } from '../../../../relay/environment';
import { noteCreationUserMutation } from './NoteCreation';
import TextField from '../../../../components/TextField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';

const styles = (theme) => ({
  paper: {
    margin: 0,
    padding: '20px 20px 20px 20px',
    borderRadius: 6,
  },
  heading: {
    display: 'flex',
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  createButton: {
    float: 'left',
    marginTop: -15,
  },
});

const noteValidation = (t) => Yup.object().shape({
  attribute_abstract: Yup.string().nullable(),
  content: Yup.string().required(t('This field is required')),
});

const sharedUpdater = (store, entityId, newEdge) => {
  const entity = store.get(entityId);
  const conn = ConnectionHandler.getConnection(entity, 'Pagination_notes');
  ConnectionHandler.insertEdgeBefore(conn, newEdge);
};

class StixCoreObjectNotesCardsContainer extends Component {
  constructor(props) {
    super(props);
    this.bottomRef = React.createRef();
    this.state = { open: false };
  }

  scrollToBottom() {
    setTimeout(() => {
      this.bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  }

  handleToggleWrite() {
    const expanded = !this.state.open;
    this.setState({ open: expanded }, () => {
      if (expanded) {
        this.scrollToBottom();
      }
    });
  }

  onSubmit(values, { setSubmitting, resetForm }) {
    const { stixCoreObjectId, data } = this.props;
    const defaultMarking = R.pathOr(
      [],
      ['stixCoreObject', 'objectMarking', 'edges'],
      data,
    ).map((n) => n.node.id);
    const adaptedValues = R.pipe(
      R.assoc('objectMarking', [
        ...defaultMarking,
        ...R.pluck('value', values.objectMarking),
      ]),
      R.assoc('objects', [stixCoreObjectId]),
      R.assoc('objectLabel', R.pluck('value', values.objectLabel)),
    )(values);
    commitMutation({
      mutation: noteCreationUserMutation,
      variables: {
        input: adaptedValues,
      },
      setSubmitting,
      updater: (store) => {
        const payload = store.getRootField('userNoteAdd');
        const newEdge = payload.setLinkedRecord(payload, 'node');
        sharedUpdater(store, stixCoreObjectId, newEdge);
      },
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
      },
    });
  }

  onReset() {
    this.handleToggleWrite();
  }

  render() {
    const { t, classes, stixCoreObjectId, marginTop, data } = this.props;
    const { open } = this.state;
    const notes = R.pathOr([], ['stixCoreObject', 'notes', 'edges'], data);
    return (
      <div style={{ marginTop: marginTop || 50 }}>
        <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
          {t('Notes about this entity')}
        </Typography>
        <Security needs={[KNOWLEDGE_KNPARTICIPATE]} placeholder={<div style={{ height: 29 }} />}>
          <IconButton color="secondary"
            onClick={this.handleToggleWrite.bind(this)}
            classes={{ root: classes.createButton }}
            size="large">
            <EditOutlined fontSize="small" />
          </IconButton>
          <AddNotes
            stixCoreObjectOrStixCoreRelationshipId={stixCoreObjectId}
            stixCoreObjectOrStixCoreRelationshipNotes={notes}
          />
        </Security>
        <div className="clearfix" />
        {notes.map((noteEdge) => {
          const note = noteEdge.node;
          return (
            <StixCoreObjectOrStixCoreRelationshipNoteCard
              key={note.id}
              node={note}
              stixCoreObjectOrStixCoreRelationshipId={stixCoreObjectId}
            />
          );
        })}
        <Security needs={[KNOWLEDGE_KNPARTICIPATE]}>
          <Accordion
            style={{ margin: `${notes.length > 0 ? '30' : '0'}px 0 30px 0` }}
            expanded={open}
            onChange={this.handleToggleWrite.bind(this)}
            variant="outlined"
          >
            <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
              <Typography className={classes.heading}>
                <RateReviewOutlined />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span style={{ fontWeight: 500 }}>{t('Write a note')}</span>
              </Typography>
            </AccordionSummary>
            <AccordionDetails style={{ width: '100%' }}>
              <Formik
                initialValues={{
                  attribute_abstract: '',
                  content: '',
                  objectMarking: [],
                  objectLabel: [],
                }}
                validationSchema={noteValidation(t)}
                onSubmit={this.onSubmit.bind(this)}
                onReset={this.onReset.bind(this)}
              >
                {({
                  submitForm,
                  handleReset,
                  setFieldValue,
                  values,
                  isSubmitting,
                }) => (
                  <Form style={{ width: '100%' }}>
                    <Field
                      component={TextField}
                      variant="standard"
                      name="attribute_abstract"
                      label={t('Abstract')}
                      fullWidth={true}
                    />
                    <Field
                      component={MarkDownField}
                      name="content"
                      label={t('Content')}
                      fullWidth={true}
                      multiline={true}
                      rows="4"
                      style={{ marginTop: 20 }}
                    />
                    <ObjectLabelField
                      name="objectLabel"
                      style={{ marginTop: 20, width: '100%' }}
                      setFieldValue={setFieldValue}
                      values={values.objectLabel}
                    />
                    <ObjectMarkingField
                      name="objectMarking"
                      style={{ marginTop: 20, width: '100%' }}
                    />
                    <div className={classes.buttons}>
                      <Button
                        variant="contained"
                        onClick={handleReset}
                        disabled={isSubmitting}
                        classes={{ root: classes.button }}
                      >
                        {t('Cancel')}
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={submitForm}
                        disabled={isSubmitting}
                        classes={{ root: classes.button }}
                      >
                        {t('Create')}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </AccordionDetails>
          </Accordion>
        </Security>
        <div style={{ marginTop: 100 }} />
        <div ref={this.bottomRef} />
      </div>
    );
  }
}

StixCoreObjectNotesCardsContainer.propTypes = {
  stixCoreObjectId: PropTypes.string,
  marginTop: PropTypes.number,
  data: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export const stixCoreObjectNotesCardsQuery = graphql`
  query StixCoreObjectNotesCardsQuery($count: Int!, $id: String!) {
    ...StixCoreObjectNotesCards_data @arguments(count: $count, id: $id)
  }
`;

const StixCoreObjectNotesCards = createPaginationContainer(
  StixCoreObjectNotesCardsContainer,
  {
    data: graphql`
      fragment StixCoreObjectNotesCards_data on Query
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 25 }
        id: { type: "String!" }
      ) {
        stixCoreObject(id: $id) {
          id
          objectMarking {
            edges {
              node {
                id
                definition
              }
            }
          }
          notes(first: $count) @connection(key: "Pagination_notes") {
            edges {
              node {
                id
                ...StixCoreObjectOrStixCoreRelationshipNoteCard_node
              }
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.stixCoreObjectObject.notes;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count }, fragmentVariables) {
      return {
        count,
        id: fragmentVariables.id,
      };
    },
    query: stixCoreObjectNotesCardsQuery,
  },
);

export default R.compose(
  inject18n,
  withStyles(styles),
)(StixCoreObjectNotesCards);
