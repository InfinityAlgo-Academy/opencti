import React, { FunctionComponent } from 'react';
import { graphql, useFragment, usePreloadedQuery, PreloadedQuery, useMutation } from 'react-relay';
import { Field, Form, Formik } from 'formik';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { FormikConfig } from 'formik/dist/types';
import TextField from '../../../../../components/TextField';
import { useFormatter } from '../../../../../components/i18n';
import { Option } from '../../../common/form/ReferenceField';
import { AlertDigestEdition_trigger$key } from './__generated__/AlertDigestEdition_trigger.graphql';
import { Theme } from '../../../../../components/Theme';
import { alertEditionQuery } from './AlertEditionQuery';
import { AlertEditionQuery } from './__generated__/AlertEditionQuery.graphql';
import MarkdownField from '../../../../../components/MarkdownField';
import AutocompleteField from '../../../../../components/AutocompleteField';
import { fieldSpacingContainerStyle } from '../../../../../utils/field';
import { digestTriggerValidation } from './AlertDigestCreation';
import ObjectMembersField from '../../../common/form/ObjectMembersField';
import SelectField from '../../../../../components/SelectField';
import TimePickerField from '../../../../../components/TimePickerField';
import { dayStartDate, parse } from '../../../../../utils/Time';
import { convertOutcomes, convertTriggers } from '../../../../../utils/edition';
import { AlertingPaginationQuery$variables } from './__generated__/AlertingPaginationQuery.graphql';
import AlertsField from './AlertsField';

interface AlertDigestEditionProps {
  handleClose: () => void
  paginationOptions?: AlertingPaginationQuery$variables
  queryRef: PreloadedQuery<AlertEditionQuery>
}

interface AlertDigestFormValues {
  name?: string
  outcomes: { value: string, label: string }[];
  recipients: { value: string, label: string }[];
  trigger_ids: { value: string }[];
  period: string;
}

const alertDigestEditionFragment = graphql`
  fragment AlertDigestEdition_trigger on Trigger {
    id
    name
    trigger_type
    event_types
    description
    filters
    outcomes
    trigger_time
    period
    recipients {
      id
      name
    }
    triggers {
      id
      name
    }
  }
`;

const alertDigestEditionFieldPatch = graphql`
  mutation AlertDigestEditionFieldPatchMutation(
    $id: ID!
    $input: [EditInput!]!
  ) {
    triggerActivityFieldPatch(id: $id, input: $input) {
      ...AlertDigestEdition_trigger
    }
  }
`;

const useStyles = makeStyles<Theme>((theme) => ({
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
  },
  importButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    borderBottom: '1px solid #5c5c5c',
  },
  title: {
    float: 'left',
  },
}));

const AlertDigestEdition: FunctionComponent<AlertDigestEditionProps> = ({ queryRef, paginationOptions, handleClose }) => {
  const { t } = useFormatter();
  const outcomesOptions = [
    {
      value: 'f4ee7b33-006a-4b0d-b57d-411ad288653d',
      label: t('User interface'),
    },
    {
      value: '44fcf1f4-8e31-4b31-8dbc-cd6993e1b822',
      label: t('Email'),
    },
  ];
  const outcomesOptionsMap: Record<string, string> = {
    'f4ee7b33-006a-4b0d-b57d-411ad288653d': t('User interface'),
    '44fcf1f4-8e31-4b31-8dbc-cd6993e1b822': t('Email'),
  };
  const classes = useStyles();
  const data = usePreloadedQuery<AlertEditionQuery>(alertEditionQuery, queryRef);
  const trigger = useFragment<AlertDigestEdition_trigger$key>(alertDigestEditionFragment, data.triggerKnowledge);
  const [commitFieldPatch] = useMutation(alertDigestEditionFieldPatch);
  const onSubmit: FormikConfig<AlertDigestFormValues>['onSubmit'] = (values, { setSubmitting }) => {
    commitFieldPatch({
      variables: {
        id: trigger?.id,
        input: values,
      },
      onCompleted: () => {
        setSubmitting(false);
        handleClose();
      },
    });
  };
  const handleSubmitField = (name: string, value: Option | string | string[]) => {
    return digestTriggerValidation(t).validateAt(name, { [name]: value }).then(() => {
      commitFieldPatch({
        variables: {
          id: trigger?.id,
          input: { key: name, value: value || '' },
        },
      });
    }).catch(() => false);
  };
  const handleSubmitFieldOptions = (name: string, value: { value: string }[]) => digestTriggerValidation(t)
    .validateAt(name, { [name]: value })
    .then(() => {
      commitFieldPatch({
        variables: {
          id: trigger?.id,
          input: { key: name, value: value?.map(({ value: v }) => v) ?? '' },
        },
      });
    })
    .catch(() => false);
  const handleSubmitDay = (_: string, value: string) => {
    const day = value && value.length > 0 ? value : '1';
    const currentTime = trigger?.trigger_time?.split('-') ?? [
      `${parse(dayStartDate()).utc().format('HH:mm:00.000')}Z`,
    ];
    const newTime = currentTime.length > 1
      ? `${day}-${currentTime[1]}`
      : `${day}-${currentTime[0]}`;
    return commitFieldPatch({
      variables: {
        id: trigger?.id,
        input: { key: 'trigger_time', value: newTime },
      },
    });
  };
  const handleSubmitTime = (_: string, value: string) => {
    const time = value && value.length > 0
      ? `${parse(value).utc().format('HH:mm:00.000')}Z`
      : `${parse(dayStartDate()).utc().format('HH:mm:00.000')}Z`;
    const currentTime = trigger?.trigger_time?.split('-') ?? [
      `${parse(dayStartDate()).utc().format('HH:mm:00.000')}Z`,
    ];
    const newTime = currentTime.length > 1 && trigger?.period !== 'hour'
      ? `${currentTime[0]}-${time}`
      : time;
    return commitFieldPatch({
      variables: {
        id: trigger?.id,
        input: { key: 'trigger_time', value: newTime },
      },
    });
  };

  const currentTime = trigger?.trigger_time?.split('-') ?? [dayStartDate().toISOString()];
  const initialValues = {
    name: trigger?.name,
    description: trigger?.description,
    outcomes: convertOutcomes(trigger, outcomesOptionsMap),
    trigger_ids: convertTriggers(trigger),
    recipients: (trigger?.recipients ?? []).map((n) => ({ label: n?.name, value: n?.id })),
    period: trigger?.period,
    day: currentTime.length > 1 ? currentTime[0] : '1',
    time: currentTime.length > 1 ? `2000-01-01T${currentTime[1]}` : `2000-01-01T${currentTime[0]}`,
  };

  return (
      <div>
        <div className={classes.header}>
          <IconButton aria-label="Close"
              className={classes.closeButton}
              onClick={handleClose}
              size="large"
              color="primary">
            <Close fontSize="small" color="primary" />
          </IconButton>
          <Typography variant="h6" classes={{ root: classes.title }}>
            {t('Update an activity digest trigger')}
          </Typography>
          <div className="clearfix" />
        </div>
        <div className={classes.container}>
          <Formik enableReinitialize={true} initialValues={initialValues as never} onSubmit={onSubmit}>
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
                  <AlertsField
                      name="trigger_ids"
                      setFieldValue={setFieldValue}
                      values={values.trigger_ids}
                      style={fieldSpacingContainerStyle}
                      onChange={handleSubmitFieldOptions}
                      paginationOptions={paginationOptions}
                  />
                  <Field component={SelectField}
                      variant="standard"
                      name="period"
                      label={t('Period')}
                      fullWidth={true}
                      containerstyle={fieldSpacingContainerStyle}
                      onChange={handleSubmitField}>
                    <MenuItem value="hour">{t('hour')}</MenuItem>
                    <MenuItem value="day">{t('day')}</MenuItem>
                    <MenuItem value="week">{t('week')}</MenuItem>
                    <MenuItem value="month">{t('month')}</MenuItem>
                  </Field>
                  {values.period === 'week' && (
                      <Field component={SelectField}
                          variant="standard"
                          name="day"
                          label={t('Week day')}
                          fullWidth={true}
                          containerstyle={fieldSpacingContainerStyle}
                          onChange={handleSubmitDay}>
                        <MenuItem value="1">{t('Monday')}</MenuItem>
                        <MenuItem value="2">{t('Tuesday')}</MenuItem>
                        <MenuItem value="3">{t('Wednesday')}</MenuItem>
                        <MenuItem value="4">{t('Thursday')}</MenuItem>
                        <MenuItem value="5">{t('Friday')}</MenuItem>
                        <MenuItem value="6">{t('Saturday')}</MenuItem>
                        <MenuItem value="7">{t('Sunday')}</MenuItem>
                      </Field>
                  )}
                  {values.period === 'month' && (
                      <Field component={SelectField}
                          variant="standard"
                          name="day"
                          label={t('Month day')}
                          fullWidth={true}
                          containerstyle={fieldSpacingContainerStyle}
                          onChange={handleSubmitDay}>
                        {Array.from(Array(31).keys()).map((idx) => (
                            <MenuItem key={idx} value={(idx + 1).toString()}>
                              {(idx + 1).toString()}
                            </MenuItem>
                        ))}
                      </Field>
                  )}
                  {values.period !== 'hour' && (
                      <Field component={TimePickerField}
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
                  <Field component={AutocompleteField}
                      name="outcomes"
                      style={fieldSpacingContainerStyle}
                      multiple={true}
                      textfieldprops={{
                        variant: 'standard',
                        label: t('Notification'),
                      }}
                      options={outcomesOptions}
                      onChange={(name: string, value: { value: string, label: string }[]) => handleSubmitField(name, value.map((n) => n.value))}
                      renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: { value: string, label: string }) => (
                          <MenuItem value={option.value} {...props}>
                            <Checkbox checked={values.outcomes.map((n) => n.value).includes(option.value)}/>
                            <ListItemText primary={option.label}/>
                          </MenuItem>
                      )}
                  />
                  <ObjectMembersField label={'Recipients'} style={fieldSpacingContainerStyle}
                                      onChange={handleSubmitFieldOptions}
                                      multiple={true} name={'recipients'} />
                </Form>
            )}
          </Formik>
        </div>
      </div>

  );
};

export default AlertDigestEdition;
