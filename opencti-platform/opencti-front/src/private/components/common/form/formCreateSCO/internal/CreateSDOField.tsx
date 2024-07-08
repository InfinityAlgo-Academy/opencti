import React from 'react';
import { Field, FormikValues } from 'formik';
import ArtifactField from '@components/common/form/ArtifactField';
import { FormikHelpers } from 'formik/dist/types';
import CreatedByField from '@components/common/form/CreatedByField';
import ObjectLabelField from '@components/common/form/ObjectLabelField';
import ObjectMarkingField from '@components/common/form/ObjectMarkingField';
import { ExternalReferencesField } from '@components/common/form/ExternalReferencesField';
import KillChainPhasesField from '@components/common/form/KillChainPhasesField';
import ConfidenceField from '@components/common/form/ConfidenceField';
import OpenVocabField from '@components/common/form/OpenVocabField';
import CustomFileUploader from '@components/common/files/CustomFileUploader';
import DateTimePickerField from '../../../../../../components/DateTimePickerField';
import TextField from '../../../../../../components/TextField';
import SwitchField from '../../../../../../components/fields/SwitchField';
import { fieldSpacingContainerStyle } from '../../../../../../utils/field';
import MarkdownField from '../../../../../../components/fields/MarkdownField';
import { useFormatter } from '../../../../../../components/i18n';

interface CreateSDOFieldProps<Values extends FormikValues> {
  attribute: {
    name: string
    type?: string
    label?: string
  }
  setFieldValue: FormikHelpers<Values>['setFieldValue']
  values: Values
  sdoType: string
}

function CreateSDOField<Values extends FormikValues>({
  attribute,
  setFieldValue,
  values,
  sdoType,
}: CreateSDOFieldProps<Values>) {
  const { t_i18n } = useFormatter();
  const { name, type, label } = attribute;

  if (name === 'file') {
    return (
      <CustomFileUploader setFieldValue={setFieldValue} />
    );
  }
  if (name === 'obsContent') {
    return (
      <ArtifactField
        attributeName={name}
        onChange={setFieldValue}
      />
    );
  }
  if (name === 'malware_types') {
    return (
      <OpenVocabField
        label={t_i18n('Malware types')}
        type="malware-type-ov"
        name={name}
        multiple
        containerStyle={fieldSpacingContainerStyle}
        onChange={setFieldValue}
      />
    );
  }
  if (name === 'architecture_execution_envs') {
    return (
      <OpenVocabField
        label={t_i18n('Architecture execution env.')}
        type="processor-architecture-ov"
        name={name}
        containerStyle={fieldSpacingContainerStyle}
        onChange={setFieldValue}
        multiple
      />
    );
  }
  if (name === 'implementation_languages') {
    return (
      <OpenVocabField
        label={t_i18n('Implementation languages')}
        type="implementation-language-ov"
        name={name}
        containerStyle={fieldSpacingContainerStyle}
        onChange={setFieldValue}
        multiple
      />
    );
  }
  if (name === 'createdBy') {
    return (
      <CreatedByField
        name={name}
        style={fieldSpacingContainerStyle}
        setFieldValue={setFieldValue}
      />
    );
  }
  if (name === 'killChainPhases') {
    return (
      <KillChainPhasesField
        name={name}
        style={fieldSpacingContainerStyle}
      />
    );
  }
  if (name === 'confidence') {
    return (
      <ConfidenceField
        entityType={sdoType}
        containerStyle={fieldSpacingContainerStyle}
      />
    );
  }
  if (name === 'description') {
    return (
      <Field
        component={MarkdownField}
        name={name}
        label={t_i18n('Description')}
        fullWidth={true}
        multiline={true}
        rows="4"
        style={fieldSpacingContainerStyle}
        askAi={true}
      />
    );
  }
  if (name === 'objectLabel') {
    return (
      <ObjectLabelField
        name={name}
        style={fieldSpacingContainerStyle}
        setFieldValue={setFieldValue}
        values={values.objectLabel}
      />
    );
  }
  if (name === 'objectMarking') {
    return (
      <ObjectMarkingField
        name={name}
        style={fieldSpacingContainerStyle}
      />
    );
  }
  if (name === 'externalReferences') {
    return (
      <ExternalReferencesField
        name={name}
        style={fieldSpacingContainerStyle}
        setFieldValue={setFieldValue}
        values={values.externalReferences}
      />
    );
  }
  if (type === 'date') {
    return (
      <Field
        component={DateTimePickerField}
        name={name}
        withSeconds={true}
        textFieldProps={{
          label,
          variant: 'standard',
          fullWidth: true,
          style: fieldSpacingContainerStyle,
        }}
      />
    );
  }
  if (type === 'numeric') {
    return (
      <Field
        component={TextField}
        variant="standard"
        name={name}
        label={label}
        fullWidth={true}
        type="number"
        style={fieldSpacingContainerStyle}
      />
    );
  }
  if (type === 'boolean') {
    return (
      <Field
        component={SwitchField}
        type="checkbox"
        name={name}
        label={label}
        fullWidth={true}
        containerstyle={fieldSpacingContainerStyle}
      />
    );
  }
  if (type === 'string') {
    return (
      <Field
        component={TextField}
        variant="standard"
        name={name}
        label={label}
        fullWidth={true}
        style={fieldSpacingContainerStyle}
        askAi={name === 'name'}
        // TODO not always
        detectDuplicate={name === 'name' ? [
          'Threat-Actor',
          'Intrusion-Set',
          'Campaign',
          'Malware',
          'Tool',
        ] : []}
      />
    );
  }
  return <div style={fieldSpacingContainerStyle}>{name} - Unknown field</div>;
}

export default CreateSDOField;
