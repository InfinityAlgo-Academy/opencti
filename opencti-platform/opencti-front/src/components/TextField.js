import React from 'react';
import MuiTextField from '@material-ui/core/TextField';
import { fieldToTextField } from 'formik-material-ui';
import { useField } from 'formik';
import { isNil } from 'ramda';
import StixDomainObjectDetectDuplicate from '../private/components/common/stix_domain_objects/StixDomainObjectDetectDuplicate';

const TextField = (props) => {
  const {
    form: { setFieldValue, setTouched },
    field: { name },
    onChange,
    onFocus,
    onSubmit,
    detectDuplicate,
  } = props;
  const internalOnChange = React.useCallback(
    (event) => {
      const { value } = event.target;
      setFieldValue(name, value);
      if (typeof onChange === 'function') {
        onChange(name, value);
      }
    },
    [onChange, setFieldValue, name],
  );
  const internalOnFocus = React.useCallback(() => {
    if (typeof onFocus === 'function') {
      onFocus(name);
    }
  }, [onFocus, name]);
  const internalOnBlur = React.useCallback(
    (event) => {
      const { value } = event.target;
      setTouched(true);
      if (typeof onSubmit === 'function') {
        onSubmit(name, value || '');
      }
    },
    [onSubmit, setTouched, name],
  );
  const [, meta] = useField(name);
  return (
    <MuiTextField
      {...fieldToTextField(props)}
      onChange={internalOnChange}
      onFocus={internalOnFocus}
      onBlur={internalOnBlur}
      helperText={
        // eslint-disable-next-line no-nested-ternary
        detectDuplicate && (isNil(meta.error) || !meta.touched) ? (
          <StixDomainObjectDetectDuplicate
            types={detectDuplicate}
            value={meta.value}
          />
        ) : meta.touched ? (
          meta.error
        ) : (
          ''
        )
      }
    />
  );
};

export default TextField;
