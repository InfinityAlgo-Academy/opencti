import React, { FunctionComponent } from 'react';
import { graphql, useMutation } from 'react-relay';
import { Field, FieldArray, Form, Formik, FormikConfig } from 'formik';
import Drawer, { DrawerVariant } from '@components/common/drawer/Drawer';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import * as R from 'ramda';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import makeStyles from '@mui/styles/makeStyles';
import { AddOutlined, Delete } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import { InformationOutline } from 'mdi-material-ui';
import ListItemText from '@mui/material/ListItemText';
import AutocompleteField from '../../../../components/AutocompleteField';
import { useFormatter } from '../../../../components/i18n';
import ItemIcon from '../../../../components/ItemIcon';
import MarkdownField from '../../../../components/MarkdownField';
import TextField from '../../../../components/TextField';
import type { Theme } from '../../../../components/Theme';
import SwitchField from '../../../../components/SwitchField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import { insertNode } from '../../../../utils/store';
import useAuth from '../../../../utils/hooks/useAuth';
import { handleErrorInForm } from '../../../../relay/environment';
import { DecayRulesLinesPaginationQuery$variables } from './__generated__/DecayRulesLinesPaginationQuery.graphql';

const useStyles = makeStyles<Theme>((theme) => ({
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  icon: {
    paddingTop: 4,
    paddingRight: 4,
    display: 'inline-block',
    color: theme.palette.primary.main,
  },
}));

const decayRuleCreationMutation = graphql`
  mutation DecayRuleCreationMutation($input: DecayRuleAddInput!) {
    decayRuleAdd(input: $input) {
      id
      name
      description
      created_at
      updated_at
      active
      order
      built_in
      appliedIndicatorsCount
    }
  }
`;

interface DecayRuleCreationFormData {
  name: string
  description: string
  order: number
  active: boolean
  decay_lifetime: number
  decay_pound: number
  decay_points: number[]
  decay_revoke_score: number
  decay_observable_types: string[]
}

interface DecayRuleCreationFormProps {
  updater: (store: RecordSourceSelectorProxy) => void;
  onReset?: () => void;
  onCompleted?: () => void;
}
const DecayRuleCreationForm: FunctionComponent<DecayRuleCreationFormProps> = ({
  updater,
  onReset,
  onCompleted,
}) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const [commit] = useMutation(decayRuleCreationMutation);
  const { schema } = useAuth();
  const { scos } = schema;
  const allObservableTypes = scos.map((sco) => sco.id);

  const decayRuleValidator = Yup.object().shape({
    name: Yup.string().min(2).required(t_i18n('This field is required')),
    description: Yup.string().nullable(),
    active: Yup.boolean(),
    order: Yup.number().min(1),
    decay_lifetime: Yup.number().min(1),
    decay_pound: Yup.number().min(0),
    decay_revoke_score: Yup.number().min(0),
    decay_observable_types: Yup.array().of(Yup.string()),
    decay_points: Yup.array().of(Yup.number().min(0)),
  });

  const onSubmit: FormikConfig<DecayRuleCreationFormData>['onSubmit'] = (
    values,
    { setSubmitting, resetForm, setErrors },
  ) => {
    const decayPoints = R.uniq(values.decay_points ?? []);
    const input = { // TODO type
      name: values.name,
      description: values.description,
      order: parseInt(String(values.order), 10),
      active: values.active,
      decay_lifetime: parseInt(String(values.decay_lifetime), 10),
      decay_pound: parseFloat(String(values.decay_pound)),
      decay_points: decayPoints.map((p) => parseInt(String(p), 10)),
      decay_revoke_score: parseInt(String(values.decay_revoke_score), 10),
      decay_observable_types: values.decay_observable_types ?? [],
    };
    commit({
      variables: {
        input,
      },
      updater: (store) => {
        if (updater) {
          updater(store);
        }
      },
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        if (onCompleted) {
          onCompleted();
        }
      },
      onError: (error: Error) => {
        handleErrorInForm(error, setErrors);
        setSubmitting(false);
      },
    });
  };

  const initialValues: DecayRuleCreationFormData = {
    name: '',
    description: '',
    order: 1,
    active: false,
    decay_lifetime: 365,
    decay_pound: 1.0,
    decay_points: [],
    decay_revoke_score: 0,
    decay_observable_types: [],
  };

  return (
    <Formik<DecayRuleCreationFormData>
      initialValues={initialValues}
      validationSchema={decayRuleValidator}
      onSubmit={onSubmit}
      onReset={onReset}
    >
      {({ submitForm, handleReset, isSubmitting, values }) => (
        <Form style={{ margin: '20px 0 20px 0' }}>
          <Field
            component={TextField}
            name="name"
            label={t_i18n('Name')}
            fullWidth={true}
          />
          <Field
            component={MarkdownField}
            name="description"
            label={t_i18n('Description')}
            fullWidth={true}
            multiline={true}
            rows={2}
            style={{ marginTop: 20 }}
          />
          <Field
            component={AutocompleteField}
            name="decay_observable_types"
            multiple={true}
            fullWidth={true}
            textfieldprops={{
              variant: 'standard',
              label: t_i18n('Apply on indicator observable types'),
            }}
            options={allObservableTypes}
            isOptionEqualToValue={(option: string, value: string) => option === value}
            style={{ marginTop: 20 }}
            renderOption={(
              props: React.HTMLAttributes<HTMLLIElement>,
              option: string,
            ) => (
              <li {...props}>
                <div className={classes.icon}>
                  <ItemIcon type={option} />
                </div>
                <ListItemText primary={t_i18n(`entity_${option}`)} />
              </li>
            )}
          />
          <Field
            component={TextField}
            variant="standard"
            name="decay_lifetime"
            label={t_i18n('Lifetime (in days)')}
            fullWidth={true}
            type="number"
            style={{ marginTop: 20 }}
          />
          <Field
            component={TextField}
            variant="standard"
            name="decay_pound"
            label={t_i18n('Decay factor')}
            fullWidth={true}
            type="number"
            style={{ marginTop: 20 }}
          />
          <FieldArray
            name="decay_points"
            render={(arrayHelpers) => (
              <div>
                <Typography variant="h3" gutterBottom={true} style={{ marginTop: 20 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <span>{t_i18n('Reaction points')}</span>
                    <Tooltip title={t_i18n('Define at which score thresholds the indicator is updated.')}>
                      <InformationOutline fontSize="small" color="primary" />
                    </Tooltip>
                    <Tooltip title={t_i18n('Add a reaction point')}>
                      <IconButton
                        color="primary"
                        aria-label="add"
                        onClick={() => arrayHelpers.push(0)}
                      >
                        <AddOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Typography>

                {values.decay_points && values.decay_points.length > 0 && (
                  values.decay_points.map((decay_point, index) => (
                    <div key={index} style={{ display: 'flex' }}>
                      <div style={{ flex: 1 }}>
                        <Field
                          component={TextField}
                          variant="standard"
                          name={`decay_points.${index}`}
                          type="number"
                          fullWidth={true}
                        />
                      </div>
                      <div style={{ marginLeft: 10 }}>
                        <Tooltip title={t_i18n('Remove this reaction point')}>
                          <IconButton
                            color="primary"
                            aria-label="delete"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          />
          <Field
            component={TextField}
            variant="standard"
            name="decay_revoke_score"
            label={t_i18n('Revoke score')}
            fullWidth={true}
            type="number"
            style={{ marginTop: 20 }}
          />
          <Field
            component={TextField}
            variant="standard"
            name="order"
            label={t_i18n('Order')}
            fullWidth={true}
            type="number"
            style={{ marginTop: 20 }}
          />
          <Field
            component={SwitchField}
            type="checkbox"
            name="active"
            label={t_i18n('Active')}
            containerstyle={fieldSpacingContainerStyle}
          />
          <div className={classes.buttons}>
            <Button
              variant="contained"
              onClick={handleReset}
              disabled={isSubmitting}
              classes={{ root: classes.button }}
            >
              {t_i18n('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={submitForm}
              disabled={isSubmitting}
              classes={{ root: classes.button }}
            >
              {t_i18n('Create')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
interface DecayRuleCreationProps {
  paginationOptions: DecayRulesLinesPaginationQuery$variables;
}

const DecayRuleCreation: FunctionComponent<DecayRuleCreationProps> = ({
  paginationOptions,
}) => {
  const { t_i18n } = useFormatter();
  const updater = (store: RecordSourceSelectorProxy) => {
    insertNode(
      store,
      'Pagination_decayRules',
      paginationOptions,
      'decayRuleAdd',
    );
  };

  return (
    <Drawer
      title={t_i18n('Create a decay rule')}
      variant={DrawerVariant.createWithPanel}
    >
      {({ onClose }) => (
        <DecayRuleCreationForm
          updater={updater}
          onCompleted={onClose}
          onReset={onClose}
        />
      )}
    </Drawer>
  );
};

export default DecayRuleCreation;
