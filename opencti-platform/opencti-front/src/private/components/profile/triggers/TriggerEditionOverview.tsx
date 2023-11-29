import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import { Field, Form, Formik } from 'formik';
import { FormikConfig } from 'formik/dist/types';
import React, { FunctionComponent, useState } from 'react';
import { graphql, useFragment, useMutation } from 'react-relay';
import * as Yup from 'yup';
import AutocompleteField from '../../../../components/AutocompleteField';
import FilterIconButton from '../../../../components/FilterIconButton';
import { useFormatter } from '../../../../components/i18n';
import MarkdownField from '../../../../components/MarkdownField';
import SelectField from '../../../../components/SelectField';
import TextField from '../../../../components/TextField';
import TimePickerField from '../../../../components/TimePickerField';
import {
  convertEventTypes,
  convertNotifiers,
  convertTriggers,
  filterEventTypesOptions,
  instanceEventTypesOptions,
} from '../../../../utils/edition';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import {
  constructHandleAddFilter,
  constructHandleRemoveFilter,
  deserializeFilterGroupForFrontend,
  Filter,
  filtersAfterSwitchLocalMode,
  initialFilterGroup, isFilterGroupNotEmpty,
  serializeFilterGroupForBackend,
} from '../../../../utils/filters/filtersUtils';
import { dayStartDate, formatTimeForToday, parse } from '../../../../utils/Time';
import NotifierField from '../../common/form/NotifierField';
import { Option } from '../../common/form/ReferenceField';
import FilterAutocomplete, { FilterAutocompleteInputValue } from '../../common/lists/FilterAutocomplete';
import Filters from '../../common/lists/Filters';
import { TriggerEditionOverview_trigger$key } from './__generated__/TriggerEditionOverview_trigger.graphql';
import { TriggerEventType } from './__generated__/TriggerLiveCreationKnowledgeMutation.graphql';
import { TriggersLinesPaginationQuery$variables } from './__generated__/TriggersLinesPaginationQuery.graphql';
import TriggersField from './TriggersField';

export const triggerMutationFieldPatch = graphql`
  mutation TriggerEditionOverviewFieldPatchMutation(
    $id: ID!
    $input: [EditInput!]!
  ) {
    triggerKnowledgeFieldPatch(id: $id, input: $input) {
      ...TriggerEditionOverview_trigger
    }
  }
`;

const triggerEditionOverviewFragment = graphql`
  fragment TriggerEditionOverview_trigger on Trigger {
    id
    name
    trigger_type
    event_types
    description
    filters
    created
    modified
    notifiers{
      id
      name
    }
    period
    trigger_time
    instance_trigger
    triggers {
      id
      name
    }
  }
`;

interface TriggerEditionOverviewProps {
  data: TriggerEditionOverview_trigger$key;
  handleClose: () => void;
  paginationOptions?: TriggersLinesPaginationQuery$variables;
}

interface TriggerEditionFormValues {
  name: string;
  description: string | null;
  event_types: {
    value: TriggerEventType,
    label: string,
  }[];
  notifiers: {
    value: string,
    label: string,
  }[];
  trigger_ids: { value: string }[];
  period: string;
}

const TriggerEditionOverview: FunctionComponent<
TriggerEditionOverviewProps
> = ({ data, handleClose, paginationOptions }) => {
  const { t } = useFormatter();
  const trigger = useFragment(triggerEditionOverviewFragment, data);
  const filters = deserializeFilterGroupForFrontend(trigger.filters) ?? undefined;
  const [commitFieldPatch] = useMutation(triggerMutationFieldPatch);
  const [instanceFilters, setInstanceFilters] = useState< FilterAutocompleteInputValue[]>([]);
  const handleAddFilter = (
    k: string,
    id: string,
    op = 'eq',
  ) => {
    const newBaseFilters = constructHandleAddFilter(filters, k, id, op);
    commitFieldPatch({
      variables: {
        id: trigger.id,
        input: { key: 'filters', value: serializeFilterGroupForBackend(newBaseFilters) },
      },
    });
  };
  const handleRemoveFilter = (k: string, op = 'eq') => {
    const newBaseFilters = constructHandleRemoveFilter(filters, k, op);
    commitFieldPatch({
      variables: {
        id: trigger.id,
        input: { key: 'filters', value: serializeFilterGroupForBackend(newBaseFilters) },
      },
    });
  };

  const handleSwitchLocalMode = (localFilter: Filter) => {
    const newBaseFilters = filtersAfterSwitchLocalMode(filters, localFilter);
    if (newBaseFilters) {
      commitFieldPatch({
        variables: {
          id: trigger.id,
          input: { key: 'filters', value: serializeFilterGroupForBackend(newBaseFilters) },
        },
      });
    }
  };

  const handleSwitchGlobalMode = () => {
    const newBaseFilters = filters
      ? {
        ...filters,
        mode: filters.mode === 'and' ? 'or' : 'and',
      }
      : initialFilterGroup;
    commitFieldPatch({
      variables: {
        id: trigger.id,
        input: { key: 'filters', value: serializeFilterGroupForBackend(newBaseFilters) },
      },
    });
  };
  const onSubmit: FormikConfig<TriggerEditionFormValues>['onSubmit'] = (
    values,
    { setSubmitting },
  ) => {
    commitFieldPatch({
      variables: {
        id: trigger.id,
        input: values,
      },
      onCompleted: () => {
        setSubmitting(false);
        handleClose();
      },
    });
  };
  const triggerValidation = () => Yup.object().shape({
    name: Yup.string().required(t('This field is required')),
    description: Yup.string().nullable(),
    event_types:
        trigger.trigger_type === 'live'
          ? Yup.array().min(1, t('Minimum one event type')).required(t('This field is required'))
          : Yup.array().nullable(),
    notifiers:
        trigger.trigger_type === 'digest'
          ? Yup.array().min(1, t('Minimum one notifier')).required(t('This field is required'))
          : Yup.array().nullable(),
    period:
        trigger.trigger_type === 'digest'
          ? Yup.string().required(t('This field is required'))
          : Yup.string().nullable(),
    day: Yup.string().nullable(),
    time: Yup.string().nullable(),
    trigger_ids:
        trigger.trigger_type === 'digest'
          ? Yup.array()
            .min(1, t('Minimum one trigger'))
            .required(t('This field is required'))
          : Yup.array().nullable(),
  });
  const handleSubmitTriggers = (name: string, value: { value: string }[]) => triggerValidation()
    .validateAt(name, { [name]: value })
    .then(() => {
      commitFieldPatch({
        variables: {
          id: trigger.id,
          input: { key: name, value: value?.map(({ value: v }) => v) ?? '' },
        },
      });
    })
    .catch(() => false);
  const handleSubmitDay = (_: string, value: string) => {
    const day = value && value.length > 0 ? value : '1';
    const currentTime = trigger.trigger_time?.split('-') ?? [
      `${parse(dayStartDate()).utc().format('HH:mm:00.000')}Z`,
    ];
    const newTime = currentTime.length > 1
      ? `${day}-${currentTime[1]}`
      : `${day}-${currentTime[0]}`;
    return commitFieldPatch({
      variables: {
        id: trigger.id,
        input: { key: 'trigger_time', value: newTime },
      },
    });
  };
  const handleSubmitTime = (_: string, value: string) => {
    const time = value && value.length > 0
      ? `${parse(value).utc().format('HH:mm:00.000')}Z`
      : `${parse(dayStartDate()).utc().format('HH:mm:00.000')}Z`;
    const currentTime = trigger.trigger_time?.split('-') ?? [
      `${parse(dayStartDate()).utc().format('HH:mm:00.000')}Z`,
    ];
    const newTime = currentTime.length > 1 && trigger.period !== 'hour'
      ? `${currentTime[0]}-${time}`
      : time;
    return commitFieldPatch({
      variables: {
        id: trigger.id,
        input: { key: 'trigger_time', value: newTime },
      },
    });
  };
  const handleClearTime = () => {
    return commitFieldPatch({
      variables: {
        id: trigger.id,
        input: { key: 'trigger_time', value: '' },
      },
    });
  };
  const handleRemoveDay = () => {
    const currentTime = trigger.trigger_time?.split('-') ?? [
      `${parse(dayStartDate()).utc().format('HH:mm:00.000')}Z`,
    ];
    const newTime = currentTime.length > 1 ? currentTime[1] : currentTime[0];
    return commitFieldPatch({
      variables: {
        id: trigger.id,
        input: { key: 'trigger_time', value: newTime },
      },
    });
  };
  const handleAddDay = () => {
    const currentTime = trigger.trigger_time?.split('-') ?? [
      `${parse(dayStartDate()).utc().format('HH:mm:00.000')}Z`,
    ];
    const newTime = currentTime.length > 1 ? currentTime.join('-') : `1-${currentTime[0]}`;
    return commitFieldPatch({
      variables: {
        id: trigger.id,
        input: { key: 'trigger_time', value: newTime },
      },
    });
  };
  const handleSubmitField = (name: string, value: Option | string | string[]) => {
    return triggerValidation().validateAt(name, { [name]: value })
      .then(() => {
        commitFieldPatch({
          variables: {
            id: trigger.id,
            input: { key: name, value: value || '' },
          },
          onCompleted: () => {
            if (name === 'period') {
              if (value === 'hour') {
                handleClearTime();
              } else if (value === 'day') {
                handleRemoveDay();
              } else {
                handleAddDay();
              }
            }
          },
        });
      })
      .catch(() => false);
  };
  const currentTime = trigger.trigger_time?.split('-') ?? [
    dayStartDate().toISOString(),
  ];
  const initialValues = {
    name: trigger.name,
    description: trigger.description,
    event_types: convertEventTypes(trigger),
    notifiers: convertNotifiers(trigger),
    trigger_ids: convertTriggers(trigger),
    period: trigger.period,
    day: currentTime.length > 1 ? currentTime[0] : '1',
    time: currentTime.length > 1 ? formatTimeForToday(currentTime[1]) : formatTimeForToday(currentTime[0]),
  };
  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues as never}
      validationSchema={triggerValidation()}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form style={{ margin: '20px 0 20px 0' }}>
          <Field
            component={TextField}
            variant="standard"
            name="name"
            label={t('Name')}
            fullWidth={true}
            onSubmit={handleSubmitField}
          />
          <Field
            component={MarkdownField}
            name="description"
            label={t('Description')}
            fullWidth={true}
            multiline={true}
            rows="4"
            onSubmit={handleSubmitField}
            style={{ marginTop: 20 }}
          />
          {trigger.trigger_type === 'live' && (
            <Field
              component={AutocompleteField}
              name="event_types"
              style={fieldSpacingContainerStyle}
              multiple={true}
              textfieldprops={{
                variant: 'standard',
                label: t('Triggering on'),
              }}
              options={trigger.instance_trigger ? instanceEventTypesOptions : filterEventTypesOptions}
              onChange={(name: string, value: { value: string, label: string }[]) => handleSubmitField(name, value.map((n) => n.value))}
              renderOption={(
                props: React.HTMLAttributes<HTMLLIElement>,
                option: { value: TriggerEventType, label: string },
              ) => (
                <MenuItem value={option.value} {...props}>
                  <Checkbox checked={values.event_types.map((n) => n.value).includes(option.value)} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              )}
            />
          )}
          {trigger.trigger_type === 'digest' && (
            <TriggersField
              name="trigger_ids"
              setFieldValue={setFieldValue}
              values={values.trigger_ids}
              style={fieldSpacingContainerStyle}
              onChange={handleSubmitTriggers}
              paginationOptions={paginationOptions}
            />
          )}
          {trigger.trigger_type === 'digest' && (
            <Field
              component={SelectField}
              variant="standard"
              name="period"
              label={t('Period')}
              fullWidth={true}
              containerstyle={fieldSpacingContainerStyle}
              onChange={handleSubmitField}
            >
              <MenuItem value="hour">{t('hour')}</MenuItem>
              <MenuItem value="day">{t('day')}</MenuItem>
              <MenuItem value="week">{t('week')}</MenuItem>
              <MenuItem value="month">{t('month')}</MenuItem>
            </Field>
          )}
          {trigger.trigger_type === 'digest' && values.period === 'week' && (
            <Field
              component={SelectField}
              variant="standard"
              name="day"
              label={t('Week day')}
              fullWidth={true}
              containerstyle={fieldSpacingContainerStyle}
              onChange={handleSubmitDay}
            >
              <MenuItem value="1">{t('Monday')}</MenuItem>
              <MenuItem value="2">{t('Tuesday')}</MenuItem>
              <MenuItem value="3">{t('Wednesday')}</MenuItem>
              <MenuItem value="4">{t('Thursday')}</MenuItem>
              <MenuItem value="5">{t('Friday')}</MenuItem>
              <MenuItem value="6">{t('Saturday')}</MenuItem>
              <MenuItem value="7">{t('Sunday')}</MenuItem>
            </Field>
          )}
          {trigger.trigger_type === 'digest' && values.period === 'month' && (
            <Field
              component={SelectField}
              variant="standard"
              name="day"
              label={t('Month day')}
              fullWidth={true}
              containerstyle={fieldSpacingContainerStyle}
              onChange={handleSubmitDay}
            >
              {Array.from(Array(31).keys()).map((idx) => (
                <MenuItem key={idx} value={(idx + 1).toString()}>
                  {(idx + 1).toString()}
                </MenuItem>
              ))}
            </Field>
          )}
          {trigger.trigger_type === 'digest' && values.period !== 'hour' && (
            <Field
              component={TimePickerField}
              name="time"
              withMinutes={true}
              onSubmit={handleSubmitTime}
              TextFieldProps={{
                label: t('Time'),
                variant: 'standard',
                fullWidth: true,
                style: { marginTop: 20 },
              }}
            />
          )}
          <NotifierField
            name="notifiers"
            onChange={(name, options) => handleSubmitField(name, options.map(({ value }) => value))}
          />
          {trigger.trigger_type === 'live'
            && <span>
              {trigger.instance_trigger
                ? (<div style={fieldSpacingContainerStyle}>
                  <FilterAutocomplete
                    filterKey={'connectedToId'}
                    searchContext={{ entityTypes: ['Stix-Core-Object'] }}
                    defaultHandleAddFilter={handleAddFilter}
                    inputValues={instanceFilters}
                    setInputValues={setInstanceFilters}
                    openOnFocus={true}
                  />
                </div>)
                : <div>
                  <div style={{ marginTop: 35 }}>
                    <Filters
                      variant="text"
                      availableFilterKeys={[
                        'entity_type',
                        'x_opencti_workflow_id',
                        'objectAssignee',
                        'objects',
                        'objectMarking',
                        'objectLabel',
                        'creator_id',
                        'createdBy',
                        'priority',
                        'severity',
                        'x_opencti_score',
                        'x_opencti_detection',
                        'revoked',
                        'confidence',
                        'indicator_types',
                        'pattern_type',
                        'fromId',
                        'toId',
                        'fromTypes',
                        'toTypes',
                      ]}
                      handleAddFilter={handleAddFilter}
                      handleRemoveFilter={undefined}
                      handleSwitchFilter={undefined}
                      noDirectFilters={true}
                      disabled={undefined}
                      size={undefined}
                      fontSize={undefined}
                      availableEntityTypes={undefined}
                      availableRelationshipTypes={undefined}
                      allEntityTypes={undefined}
                      type={undefined}
                      availableRelationFilterTypes={undefined}
                    />
                  </div>
                  <div className="clearfix"/>
                </div>
              }
              {isFilterGroupNotEmpty(filters)
                && <FilterIconButton
                  filters={filters}
                  handleRemoveFilter={handleRemoveFilter}
                  handleSwitchGlobalMode={handleSwitchGlobalMode}
                  handleSwitchLocalMode={handleSwitchLocalMode}
                  classNameNumber={2}
                  redirection
              />}
            </span>
          }
        </Form>
      )}
    </Formik>
  );
};

export default TriggerEditionOverview;
