import React from 'react';
import MuiTextField from '@mui/material/TextField';
import { SketchPicker } from 'react-color';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import InputAdornment from '@mui/material/InputAdornment';
import { useField } from 'formik';
import { fieldToTextField } from 'formik-mui';
import { ColorLens } from '@mui/icons-material';
import { isNil } from 'ramda';

const ColorPickerField = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const id = open ? 'color-popover' : undefined;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const {
    form: { setFieldValue, setTouched },
    field: { name },
    onChange,
    onFocus,
    onSubmit,
  } = props;
  const [, meta] = useField(name);
  const internalOnChange = React.useCallback(
    (event) => {
      const { value } = event.target;
      setFieldValue(name, value);
      if (typeof onChange === 'function') {
        onChange(name, value);
      }
    },
    [setFieldValue, onChange, name],
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
    [setTouched, onSubmit, name],
  );
  const handleChange = () => {
    setTouched(true);
    setAnchorEl(null);
    if (typeof onChange === 'function') {
      onChange(name, meta.value || '');
    }
    if (typeof onSubmit === 'function') {
      onSubmit(name, meta.value || '');
    }
  };

  return (
    <>
      <MuiTextField
        {...fieldToTextField(props)}
        error={!isNil(meta.error)}
        helperText={!isNil(meta.error) ? meta.error : props.helperText}
        ref={anchorEl}
        onChange={internalOnChange}
        onFocus={internalOnFocus}
        onBlur={internalOnBlur}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton aria-label="open" onClick={handleClick} size="large">
                <ColorLens />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleChange}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <SketchPicker
          color={meta.value || ''}
          onChangeComplete={(color) => setFieldValue(name, color.hex)}
        />
      </Popover>
    </>
  );
};

export default ColorPickerField;
