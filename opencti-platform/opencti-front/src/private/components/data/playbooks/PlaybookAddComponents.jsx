import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { AddOutlined, CancelOutlined } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import * as R from 'ramda';
import { Field, Form, Formik } from 'formik';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import ListItemIcon from '@mui/material/ListItemIcon';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Drawer from '../../common/drawer/Drawer';
import ObjectMembersField from '../../common/form/ObjectMembersField';
import CreatedByField from '../../common/form/CreatedByField';
import Filters from '../../common/lists/Filters';
import FilterIconButton from '../../../../components/FilterIconButton';
import TextField from '../../../../components/TextField';
import { useFormatter } from '../../../../components/i18n';
import { deserializeFilterGroupForFrontend, emptyFilterGroup, serializeFilterGroupForBackend } from '../../../../utils/filters/filtersUtils';
import ItemIcon from '../../../../components/ItemIcon';
import { isEmptyField, isNotEmptyField } from '../../../../utils/utils';
import SwitchField from '../../../../components/SwitchField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import StatusField from '../../common/form/StatusField';
import { capitalizeFirstLetter } from '../../../../utils/String';
import AutocompleteField from '../../../../components/AutocompleteField';
import useAttributes from '../../../../utils/hooks/useAttributes';
import useFiltersState from '../../../../utils/filters/useFiltersState';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles((theme) => ({
  lines: {
    padding: 0,
    height: '100%',
    width: '100%',
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  config: {
    padding: '0px 0px 20px 0px',
  },
  container: {
    marginTop: 40,
  },
  step: {
    position: 'relative',
    width: '100%',
    margin: '0 0 20px 0',
    padding: 15,
    verticalAlign: 'middle',
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 4,
    display: 'flex',
  },
  formControl: {
    width: '100%',
  },
  buttonAdd: {
    width: '100%',
    height: 20,
  },
  stepCloseButton: {
    position: 'absolute',
    top: -18,
    right: -18,
  },
}));

const addComponentValidation = (t) => Yup.object().shape({
  name: Yup.string().trim().required(t('This field is required')),
});

const PlaybookAddComponentsContent = ({
  searchTerm,
  action,
  selectedNode,
  playbookComponents,
  onConfigAdd,
  onConfigReplace,
  handleClose,
}) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const { numberAttributes } = useAttributes();
  const currentConfig = action === 'config' ? selectedNode?.data?.configuration : null;
  const initialFilters = currentConfig?.filters ? deserializeFilterGroupForFrontend(currentConfig?.filters) : emptyFilterGroup;
  const [filters, helpers] = useFiltersState(initialFilters);

  const [actionsInputs, setActionsInputs] = useState(
    currentConfig?.actions ? currentConfig.actions : [],
  );
  const [componentId, setComponentId] = useState(
    action === 'config' ? selectedNode?.data?.component?.id ?? null : null,
  );

  const handleAddStep = () => {
    setActionsInputs(R.append({}, actionsInputs));
  };
  const handleRemoveStep = (i) => {
    setActionsInputs(R.remove(i, 1, actionsInputs));
  };
  const handleChangeActionInput = (i, key, value) => {
    // extract currentValue value
    const currentValue = R.head(actionsInputs.map((v, k) => (k === i && v[key] ? v[key] : null)).filter((n) => n !== null));
    // Change operation
    if (key === 'op' && currentValue !== value) {
      setActionsInputs(
        actionsInputs.map((v, k) => {
          if (k === i) {
            return { ...v, [key]: value, attribute: null, value: null };
          }
          return v;
        }),
      );
    } else if (key === 'attribute' && currentValue !== value) {
      setActionsInputs(
        actionsInputs.map((v, k) => {
          if (k === i) {
            return { ...v, [key]: value, value: null };
          }
          return v;
        }),
      );
    } else {
      setActionsInputs(
        actionsInputs.map((v, k) => {
          if (k === i) {
            return { ...v, [key]: value };
          }
          return v;
        }),
      );
    }
  };
  const areStepsValid = () => {
    for (const n of actionsInputs) {
      if (!n || !n.op || !n.attribute || !n.value || n.value.length === 0) {
        return false;
      }
    }
    return true;
  };
  const renderFieldOptions = (i, values, setValues) => {
    const disabled = isEmptyField(actionsInputs[i]?.op);
    let options = [];
    if (actionsInputs[i]?.op === 'add') {
      options = [
        {
          label: t_i18n('Marking definitions'),
          value: 'objectMarking',
          isMultiple: true,
        },
        { label: t_i18n('Labels'), value: 'objectLabel', isMultiple: true },
      ];
    } else if (actionsInputs[i]?.op === 'replace') {
      options = [
        {
          label: t_i18n('Marking definitions'),
          value: 'objectMarking',
          isMultiple: true,
        },
        { label: t_i18n('Labels'), value: 'objectLabel', isMultiple: true },
        { label: t_i18n('Author'), value: 'createdBy', isMultiple: false },
        { label: t_i18n('Confidence'), value: 'confidence', isMultiple: false },
        { label: t_i18n('Score'), value: 'x_opencti_score', isMultiple: false },
        {
          label: t_i18n('Detection'),
          value: 'x_opencti_detection',
          isMultiple: false,
        },
        {
          label: t_i18n('Status'),
          value: 'x_opencti_workflow_id',
          isMultiple: false,
        },
      ];
    } else if (actionsInputs[i]?.op === 'remove') {
      options = [
        {
          label: t_i18n('Marking definitions'),
          value: 'objectMarking',
          isMultiple: true,
        },
        { label: t_i18n('Labels'), value: 'objectLabel', isMultiple: true },
      ];
    }
    return (
      <Select
        variant="standard"
        disabled={disabled}
        value={actionsInputs[i]?.attribute}
        onChange={(event) => {
          handleChangeActionInput(i, 'attribute', event.target.value);
          setValues(R.omit([`actions-${i}-value`], values));
        }}
      >
        {options.length > 0 ? (
          R.map(
            (n) => (
              <MenuItem key={n.value} value={n.value}>
                {n.label}
              </MenuItem>
            ),
            options,
          )
        ) : (
          <MenuItem value="none">{t_i18n('None')}</MenuItem>
        )}
      </Select>
    );
  };
  const renderValuesOptions = (i) => {
    const disabled = isEmptyField(actionsInputs[i]?.attribute);
    switch (actionsInputs[i]?.attribute) {
      case 'objectMarking':
        return (
          <ObjectMarkingField
            name={`actions-${i}-value`}
            disabled={disabled}
            onChange={(_, value) => handleChangeActionInput(
              i,
              'value',
              value.map((n) => ({
                label: n.label,
                value: n.value,
                patch_value: n.value,
              })),
            )}
          />
        );
      case 'objectLabel':
        return (
          <ObjectLabelField
            name={`actions-${i}-value`}
            disabled={disabled}
            onChange={(_, value) => handleChangeActionInput(
              i,
              'value',
              value.map((n) => ({
                label: n.label,
                value: n.value,
                patch_value: n.label,
              })),
            )}
          />
        );
      case 'createdBy':
        return (
          <CreatedByField
            name={`actions-${i}-value`}
            disabled={disabled}
            onChange={(_, value) => handleChangeActionInput(i, 'value', [
              {
                label: value.label,
                value: value.value,
                patch_value: value.value,
              },
            ])}
          />
        );
      case 'x_opencti_workflow_id':
        return (
          <StatusField
            name={`actions-${i}-value`}
            disabled={disabled}
            onChange={(_, value) => handleChangeActionInput(i, 'value', [
              {
                label: value.label,
                value: value.value,
                patch_value: value.value,
              },
            ])}
          />
        );
      case 'x_opencti_detection':
        return (
          <Field
            component={SwitchField}
            type="checkbox"
            name={`actions-${i}-value`}
            label={t_i18n('Value')}
            onChange={(_, value) => handleChangeActionInput(i, 'value', [
              { label: value, value, patch_value: value },
            ])
                        }
          />
        );
      default:
        return (
          <Field
            component={TextField}
            disabled={disabled}
            type={numberAttributes.includes(actionsInputs[i]?.attribute) ? 'number' : 'text'}
            variant="standard"
            name={`actions-${i}-value`}
            label={t_i18n('Value')}
            fullWidth={true}
            onChange={(_, value) => handleChangeActionInput(i, 'value', [
              { label: value, value, patch_value: value },
            ])}
          />
        );
    }
  };
  const onSubmit = (values, { resetForm }) => {
    const selectedComponent = playbookComponents
      .filter((n) => n.id === componentId)
      .at(0);
    const configurationSchema = JSON.parse(
      selectedComponent.configuration_schema,
    );
    const { name, ...config } = values;
    let finalConfig = config;
    if (configurationSchema?.properties?.filters) {
      const jsonFilters = serializeFilterGroupForBackend(filters);
      finalConfig = { ...config, filters: jsonFilters };
    }
    if (configurationSchema?.properties?.actions) {
      finalConfig = { ...config, actions: actionsInputs };
    }
    resetForm();
    if (
      selectedNode?.data?.component?.id
            && (action === 'config' || action === 'replace')
    ) {
      onConfigReplace(selectedComponent, name, finalConfig);
    } else {
      onConfigAdd(selectedComponent, name, finalConfig);
    }
  };
  const renderLines = () => {
    const filterByKeyword = (n) => searchTerm === ''
            || n.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
            || n.description.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
    const components = R.pipe(
      R.filter(
        (n) => n.is_entry_point
                    === (selectedNode?.data?.component?.is_entry_point ?? false),
      ),
      R.filter(filterByKeyword),
    )(playbookComponents);
    return (
      <div className={classes.lines}>
        <List>
          {components.map((component) => {
            return (
              <ListItem
                key={component.id}
                divider={true}
                button={true}
                onClick={() => setComponentId(component.id)}
              >
                <ListItemIcon>
                  <ItemIcon type={component.icon}/>
                </ListItemIcon>
                <ListItemText
                  primary={component.name}
                  secondary={component.description}
                />
              </ListItem>
            );
          })}
        </List>
      </div>
    );
  };
  const renderConfig = () => {
    const selectedComponent = playbookComponents
      .filter((n) => n.id === componentId)
      .at(0);
    const configurationSchema = JSON.parse(
      selectedComponent.configuration_schema ?? '{}',
    );
    const defaultConfig = {};
    Object.entries(configurationSchema?.properties ?? {}).forEach(([k, v]) => {
      defaultConfig[k] = v.default;
    });
    const initialValues = currentConfig
      ? {
        name: selectedNode?.data?.component?.id === selectedComponent.id ? selectedNode?.data?.name : selectedComponent.name,
        ...currentConfig,
      }
      : {
        name: selectedComponent.name,
        ...defaultConfig,
      };
    return (
      <div className={classes.config}>
        <Formik
          initialValues={initialValues}
          validationSchema={addComponentValidation(t_i18n)}
          onSubmit={onSubmit}
          onReset={handleClose}
        >
          {({
            submitForm,
            handleReset,
            isSubmitting,
            setValues,
            values,
            setFieldValue,
          }) => (
            <Form style={{ margin: '20px 0 20px 0' }}>
              <Field
                component={TextField}
                variant="standard"
                name="name"
                label={t_i18n('Name')}
                fullWidth={true}
              />
              {Object.entries(configurationSchema?.properties ?? {}).map(
                ([k, v]) => {
                  if (k === 'authorized_members') {
                    return (
                      <ObjectMembersField
                        key={k}
                        label={'Targets'}
                        style={{ marginTop: 20 }}
                        multiple={true}
                        name="authorized_members"
                      />
                    );
                  }
                  if (k === 'filters') {
                    return (
                      <div key={k}>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            marginTop: '35px',
                          }}
                        >
                          <Filters
                            helpers={helpers}
                            availableFilterKeys={[
                              'entity_type',
                              'workflow_id',
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
                              'x_opencti_main_observable_type',
                              'fromId',
                              'toId',
                              'fromTypes',
                              'toTypes',
                            ]}
                            searchContext={{ entityTypes: ['Stix-Core-Object', 'stix-core-relationship'] }}
                          />
                        </Box>
                        <div className="clearfix" />
                        <FilterIconButton
                          filters={filters}
                          helpers={helpers}
                          entityTypes={['Stix-Core-Object', 'stix-core-relationship']}
                          styleNumber={2}
                          redirection
                        />
                        <div className="clearfix" />
                      </div>
                    );
                  }
                  if (k === 'actions') {
                    return (
                      <div
                        key={k}
                        className={classes.container}
                        style={{ marginTop: 20 }}
                      >
                        {Array(actionsInputs.length)
                          .fill(0)
                          .map((_, i) => (
                            <React.Fragment key={i}>
                              {(actionsInputs[i]?.op === 'remove' || (actionsInputs[i]?.op === 'replace' && ['objectMarking', 'objectLabel'].includes(actionsInputs[i]?.attribute))) && (
                                <Alert severity="warning" style={{ marginBottom: 20 }}>
                                  {t_i18n('This operations will only apply on labels or markings added in the context of this playbook such as enrichment or other knowledge manipulations but not if the labels or markings are already written in the platform.')}
                                </Alert>
                              )}
                              <div key={i} className={classes.step}>
                                <IconButton
                                  disabled={actionsInputs.length === 1}
                                  aria-label="Delete"
                                  className={classes.stepCloseButton}
                                  onClick={() => {
                                    handleRemoveStep(i);
                                    setValues(
                                      R.omit([`actions-${i}-value`], values),
                                    );
                                  }}
                                  size="small"
                                >
                                  <CancelOutlined fontSize="small" />
                                </IconButton>
                                <Grid container={true} spacing={3}>
                                  <Grid item={true} xs={3}>
                                    <FormControl className={classes.formControl}>
                                      <InputLabel>{t_i18n('Action type')}</InputLabel>
                                      <Select
                                        variant="standard"
                                        value={actionsInputs[i]?.op}
                                        onChange={(event) => handleChangeActionInput(i, 'op', event.target.value)}
                                      >
                                        {(v.items?.properties?.op?.enum ?? ['add, replace, remove']).map((op) => (
                                          <MenuItem key={op} value={op}>
                                            {t_i18n(capitalizeFirstLetter(op))}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                  <Grid item={true} xs={3}>
                                    <FormControl className={classes.formControl}>
                                      <InputLabel>{t_i18n('Field')}</InputLabel>
                                      {renderFieldOptions(i, values, setValues)}
                                    </FormControl>
                                  </Grid>
                                  <Grid item={true} xs={6}>
                                    {renderValuesOptions(i)}
                                  </Grid>
                                </Grid>
                              </div>
                            </React.Fragment>
                          ))}
                        <div className={classes.add}>
                          <Button
                            disabled={!areStepsValid()}
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={handleAddStep}
                            classes={{ root: classes.buttonAdd }}
                          >
                            <AddOutlined fontSize="small" />
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  if (v.type === 'number') {
                    return (
                      <Field
                        key={k}
                        component={TextField}
                        variant="standard"
                        type="number"
                        name={k}
                        label={t_i18n(v.$ref ?? k)}
                        fullWidth={true}
                        style={{ marginTop: 20, width: '100%' }}
                      />
                    );
                  }
                  if (v.type === 'boolean') {
                    return (
                      <Field
                        key={k}
                        component={SwitchField}
                        type="checkbox"
                        name={k}
                        label={t_i18n(v.$ref ?? k)}
                        containerstyle={{ marginTop: 20 }}
                      />
                    );
                  }
                  if (v.type === 'string' && isNotEmptyField(v.oneOf)) {
                    return (
                      <Field
                        key={k}
                        component={AutocompleteField}
                        name={k}
                        fullWidth={true}
                        multiple={false}
                        style={{ marginTop: 20, width: '100%' }}
                        renderOption={(optionProps, value) => (
                          <Tooltip
                            {...optionProps}
                            key={value.const}
                            title={value.title}
                            placement="bottom-start"
                          >
                            <MenuItem value={value.const}>
                              {value.title}
                            </MenuItem>
                          </Tooltip>
                        )}
                        isOptionEqualToValue={(option, value) => option.const === value
                        }
                        onInternalChange={(name, value) => setFieldValue(name, value.const ? value.const : value)
                        }
                        options={v.oneOf}
                        textfieldprops={{
                          variant: 'standard',
                          label: t_i18n(v.$ref ?? k),
                        }}
                        getOptionLabel={(option) => (option.title
                          ? option.title
                          : v.oneOf?.filter((n) => n.const === option)?.at(0)
                            ?.title ?? option)
                        }
                      />
                    );
                  }
                  if (v.type === 'array') {
                    return (
                      <Field
                        key={k}
                        component={AutocompleteField}
                        name={k}
                        fullWidth={true}
                        multiple={true}
                        style={{ marginTop: 20, width: '100%' }}
                        renderOption={(optionProps, value) => (
                          <Tooltip
                            {...optionProps}
                            key={value.const}
                            title={value.title}
                            placement="bottom-start"
                          >
                            <MenuItem value={value.const}>
                              {value.title}
                            </MenuItem>
                          </Tooltip>
                        )}
                        isOptionEqualToValue={(option, value) => option.const === value
                        }
                        onInternalChange={(name, value) => setFieldValue(
                          name,
                          value.map((n) => (n.const ? n.const : n)),
                        )
                        }
                        noFieldUpdate={true}
                        options={v.items.oneOf}
                        textfieldprops={{
                          variant: 'standard',
                          label: t_i18n(v.$ref ?? k),
                        }}
                        getOptionLabel={(option) => (option.title
                          ? option.title
                          : v.items.oneOf
                            ?.filter((n) => n.const === option)
                            ?.at(0)?.title ?? option)
                        }
                      />
                    );
                  }
                  return (
                    <Field
                      key={k}
                      component={TextField}
                      style={{ marginTop: 20, width: '100%' }}
                      variant="standard"
                      name={k}
                      label={t_i18n(v.$ref ?? k)}
                      fullWidth={true}
                    />
                  );
                },
              )}
              <div className="clearfix" />
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
                  disabled={
                    (actionsInputs.length > 0 && !areStepsValid())
                    || isSubmitting
                  }
                  classes={{ root: classes.button }}
                >
                  {selectedNode?.data?.component?.id
                    ? t_i18n('Update')
                    : t_i18n('Create')}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    );
  };
  return (
    <>
      {isEmptyField(componentId) && renderLines()}
      {isNotEmptyField(componentId) && renderConfig()}
    </>
  );
};

const PlaybookAddComponents = ({
  action,
  setSelectedNode,
  setSelectedEdge,
  selectedNode,
  selectedEdge,
  playbookComponents,
  onConfigAdd,
  onConfigReplace,
}) => {
  const { t_i18n } = useFormatter();
  const [searchTerm, setSearchTerm] = useState('');
  const handleClose = () => {
    setSearchTerm('');
    setSelectedNode(null);
    setSelectedEdge(null);
  };
  const open = !!(
    (action === 'config' || action === 'add' || action === 'replace')
        && (selectedNode !== null || selectedEdge || null)
  );
  return (
    <Drawer
      open={open}
      title={t_i18n('Add components')}
      onClose={handleClose}
    >
      {({ onClose }) => (
        <>
          {(selectedNode || selectedEdge) && (
          <PlaybookAddComponentsContent
            searchTerm={searchTerm}
            playbookComponents={playbookComponents}
            action={action}
            selectedNode={selectedNode}
            onConfigAdd={onConfigAdd}
            onConfigReplace={onConfigReplace}
            handleClose={onClose}
          />
          )}
        </>
      )}
    </Drawer>
  );
};

export default PlaybookAddComponents;
