import React from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { Add } from '@mui/icons-material';
import MUIAutocomplete from '@mui/material/Autocomplete';
import { fieldToTextField } from 'formik-mui';
import { useField } from 'formik';
import { isNil } from 'ramda';
import { truncate } from '../utils/String';

const AutocompleteField = (props) => {
  const {
    form: { setFieldValue, setTouched },
    field: { name },
    onChange,
    onFocus,
    noOptionsText,
    renderOption,
    isOptionEqualToValue,
    textfieldprops,
    openCreate,
    getOptionLabel,
    onInternalChange,
  } = props;
  const [, meta] = useField(name);
  const internalOnChange = React.useCallback(
    (_, value) => {
      if (typeof onInternalChange === 'function') {
        onInternalChange(name, value || '');
      } else {
        setFieldValue(name, value);
        if (typeof onChange === 'function') {
          onChange(name, value || '');
        }
      }
    },
    [setFieldValue, name, onChange],
  );
  const internalOnFocus = React.useCallback(() => {
    if (typeof onFocus === 'function') {
      onFocus(name);
    }
  }, [onFocus, name]);
  const internalOnBlur = React.useCallback(() => {
    setTouched(true);
  }, [setTouched]);
  const fieldProps = fieldToTextField(props);
  delete fieldProps.helperText;
  delete fieldProps.openCreate;
  const defaultOptionToValue = (option, value) => option.value === value.value;
  return (
    <div style={{ position: 'relative' }}>
      <MUIAutocomplete
        size="small"
        selectOnFocus={true}
        autoHighlight={true}
        handleHomeEndKeys={true}
        getOptionLabel={
          getOptionLabel || ((option) => (typeof option === 'object'
            ? truncate(option.label, 40)
            : truncate(option, 40)))
        }
        noOptionsText={noOptionsText}
        {...fieldProps}
        renderOption={renderOption}
        renderInput={({ inputProps: { value, ...inputProps }, ...params }) => (
          <TextField
            {...{ ...params, inputProps }}
            {...textfieldprops}
            value={value}
            name={name}
            fullWidth={true}
            error={!isNil(meta.error)}
            helperText={meta.error || textfieldprops.helperText}
          />
        )}
        onChange={internalOnChange}
        onFocus={internalOnFocus}
        onBlur={internalOnBlur}
        isOptionEqualToValue={isOptionEqualToValue ?? defaultOptionToValue}
      />
      {typeof openCreate === 'function' && (
        <IconButton
          onClick={() => openCreate()}
          edge="end"
          style={{ position: 'absolute', top: 5, right: 35 }}
          size="large"
        >
          <Add />
        </IconButton>
      )}
    </div>
  );
};

export default AutocompleteField;
