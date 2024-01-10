import { AddOutlined, ContentPasteGoOutlined } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Form, Formik } from 'formik';
import React, { FunctionComponent, useState } from 'react';
import { graphql } from 'react-relay';
import Drawer from '@components/common/drawer/Drawer';
import { TasksLine_node$data } from '@components/cases/tasks/__generated__/TasksLine_node.graphql';
import { CaseTasksLines_data$data } from '@components/cases/tasks/__generated__/CaseTasksLines_data.graphql';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import { handleErrorInForm } from '../../../../relay/environment';
import { UsePreloadedPaginationFragment } from '../../../../utils/hooks/usePreloadedPaginationFragment';
import CaseTemplateField from '../../common/form/CaseTemplateField';
import { Option } from '../../common/form/ReferenceField';
import CaseTaskCreation from './CaseTaskCreation';
import { caseSetTemplateQuery, generateConnectionId } from '../CaseUtils';
import { CaseTaskFragment } from './CaseTasksLine';
import { CaseTasksLinesQuery, CaseTasksLinesQuery$variables } from './__generated__/CaseTasksLinesQuery.graphql';
import DataTable from '../../../../components/dataGrid/DataTable';
import { usePaginationLocalStorage } from '../../../../utils/hooks/useLocalStorage';
import { FilterGroup, isFilterGroupNotEmpty, useRemoveIdAndIncorrectKeysFromFilterGroupObject } from '../../../../utils/filters/filtersUtils';
import { DataTableProps, DataTableVariant } from '../../../../components/dataGrid/dataTableTypes';
import ItemDueDate from '../../../../components/ItemDueDate';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import useApiMutation from '../../../../utils/hooks/useApiMutation';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles<Theme>((theme) => ({
  paper: {
    margin: '-5px 0 0 0',
    padding: 0,
    borderRadius: 4,
    overflowY: 'inherit',
  },
  createButton: {
    float: 'left',
    marginTop: -15,
  },
  applyButton: {
    float: 'right',
    marginTop: -15,
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

export const caseTasksLinesQuery = graphql`
  query CaseTasksLinesQuery(
    $count: Int
    $filters: FilterGroup
    $cursor: ID
    $orderBy: TasksOrdering
    $orderMode: OrderingMode
    $search: String
  ) {
    ...CaseTasksLines_data
    @arguments(
      count: $count
      filters: $filters
      cursor: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      search: $search
    )
  }
`;

const caseTasksLinesFragment = graphql`
  fragment CaseTasksLines_data on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 25 }
    filters: { type: "FilterGroup" }
    cursor: { type: "ID" }
    orderBy: { type: "TasksOrdering" }
    orderMode: { type: "OrderingMode", defaultValue: desc }
    search: { type: "String" }
  )
  @refetchable(queryName: "TasksRefetch") {
    tasks(
      first: $count
      filters: $filters
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      search: $search
    ) @connection(key: "Pagination_tasks") {
      edges {
        node {
          ...CaseTasksLine_data
        }
      }
      pageInfo {
        globalCount
      }
    }
  }
`;

interface CaseTasksLinesProps {
  caseId: string
  defaultMarkings?: Option[]
}

const CaseTasksLines: FunctionComponent<CaseTasksLinesProps> = ({
  caseId,
  defaultMarkings,
}) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const [open, setOpen] = useState(false);
  const [openCaseTemplate, setOpenCaseTemplate] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [commit] = useApiMutation(caseSetTemplateQuery);

  const LOCAL_STORAGE_KEY_CASE_TASKS = `cases-${caseId}-caseTask`;
  const initialValues = {
    searchTerm: '',
    sortBy: 'created',
    orderAsc: false,
  };
  // TASKS
  const { viewStorage: { filters }, helpers, paginationOptions: { count, ...paginationOptions } } = usePaginationLocalStorage<CaseTasksLinesQuery$variables>(
    LOCAL_STORAGE_KEY_CASE_TASKS,
    initialValues,
    true,
  );
  const userFilters = useRemoveIdAndIncorrectKeysFromFilterGroupObject(filters, ['Case']);
  const contextTaskFilters: FilterGroup = {
    mode: 'and',
    filters: [
      { key: 'entity_type', operator: 'eq', mode: 'or', values: ['Task'] },
      { key: 'objects', operator: 'eq', mode: 'or', values: [caseId] },
    ],
    filterGroups: userFilters && isFilterGroupNotEmpty(userFilters) ? [userFilters] : [],
  };

  const queryTaskPaginationOptions = {
    ...paginationOptions,
    filters: contextTaskFilters,
  } as unknown as CaseTasksLinesQuery$variables;

  const queryRef = useQueryLoading<CaseTasksLinesQuery>(
    caseTasksLinesQuery,
    {
      count,
      ...queryTaskPaginationOptions,
    },
  );

  const preloadedPaginationProps = {
    linesQuery: caseTasksLinesQuery,
    linesFragment: caseTasksLinesFragment,
    queryRef,
    nodePath: ['tasks', 'pageInfo', 'globalCount'],
    setNumberOfElements: helpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<CaseTasksLinesQuery>;

  const dataColumns: DataTableProps['dataColumns'] = {
    name: { flexSize: 35 },
    due_date: {
      label: 'Due Date',
      flexSize: 15,
      isSortable: true,
      render: (task: TasksLine_node$data) => (
        <ItemDueDate due_date={task.due_date} variant={'inList'} />
      ),
    },
    objectAssignee: { flexSize: 20 },
    objectLabel: { flexSize: 20 },
    x_opencti_workflow_id: { flexSize: 10 },
  };

  return (
    <div style={{ height: '100%' }}>
      <Typography
        variant="h4"
        gutterBottom={true}
        style={{ float: 'left', paddingBottom: 11 }}
      >
        {t_i18n('Tasks')}
      </Typography>
      <Tooltip title={t_i18n('Add a task to this container')}>
        <IconButton
          color="primary"
          aria-label="Add"
          onClick={handleOpen}
          classes={{ root: classes.createButton }}
          size="large"
        >
          <AddOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t_i18n('Apply a new case template')}>
        <IconButton
          color="primary"
          aria-label="Apply"
          onClick={() => setOpenCaseTemplate(true)}
          classes={{ root: classes.applyButton }}
          size="large"
        >
          <ContentPasteGoOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog
        PaperProps={{ elevation: 1 }}
        open={openCaseTemplate}
        onClose={() => setOpenCaseTemplate(false)}
        fullWidth={true}
        maxWidth="md"
      >
        <DialogTitle>{t_i18n('Apply case templates')}</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{ caseTemplates: [] }}
            onSubmit={(values, { setSubmitting, setErrors }) => {
              commit({
                variables: {
                  id: caseId,
                  caseTemplatesId: values.caseTemplates.map(
                    ({ value }) => value,
                  ),
                  connections: [
                    generateConnectionId({
                      key: 'Pagination_tasks',
                      params: queryTaskPaginationOptions,
                    }),
                  ],
                },
                onCompleted: () => {
                  setSubmitting(false);
                  setOpenCaseTemplate(false);
                },
                onError: (error: Error) => {
                  handleErrorInForm(error, setErrors);
                  setSubmitting(false);
                },
              });
            }}
          >
            {({ setFieldValue, submitForm, handleReset, isSubmitting }) => (
              <Form style={{ minWidth: 400 }}>
                <CaseTemplateField
                  onChange={setFieldValue}
                  label="Case templates"
                />
                <div className={classes.buttons}>
                  <Button
                    onClick={() => {
                      handleReset();
                      setOpenCaseTemplate(false);
                    }}
                    disabled={isSubmitting}
                    classes={{ root: classes.button }}
                  >
                    {t_i18n('Cancel')}
                  </Button>
                  <Button
                    color="secondary"
                    onClick={submitForm}
                    disabled={isSubmitting}
                    classes={{ root: classes.button }}
                  >
                    {t_i18n('Apply')}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
      <Drawer
        open={open}
        title={t_i18n('Create a task')}
        onClose={handleClose}
      >
        <CaseTaskCreation
          caseId={caseId}
          onClose={handleClose}
          paginationOptions={paginationOptions}
          defaultMarkings={defaultMarkings}
        />
      </Drawer>
      <div className="clearfix" />
      <Paper classes={{ root: classes.paper }} variant="outlined">
        {queryRef && (
          <DataTable
            dataColumns={dataColumns}
            resolvePath={(data: CaseTasksLines_data$data) => data.tasks?.edges?.map((n) => n?.node)}
            storageKey={LOCAL_STORAGE_KEY_CASE_TASKS}
            initialValues={initialValues}
            toolbarFilters={contextTaskFilters}
            preloadedPaginationProps={preloadedPaginationProps}
            lineFragment={CaseTaskFragment}
            variant={DataTableVariant.inline}
          />
        )}
      </Paper>
    </div>
  );
};

export default CaseTasksLines;
