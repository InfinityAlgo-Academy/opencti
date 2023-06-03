import React from 'react';
import ReactMde from 'react-mde';
import { useField } from 'formik';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import * as R from 'ramda';
import inject18n from './i18n';
import RemarkGfmMarkdown from './RemarkGfmMarkdown';

const MarkDownField = (props) => {
  const {
    form: { setFieldValue, setTouched },
    field: { name },
    onFocus,
    onSubmit,
    label,
    style,
    disabled,
    t,
  } = props;
  const [selectedTab, setSelectedTab] = React.useState('write');
  const [field, meta] = useField(name);
  const internalOnFocus = (event) => {
    const { nodeName } = event.relatedTarget || {};
    if (nodeName === 'INPUT' || nodeName === undefined) {
      if (typeof onFocus === 'function') {
        onFocus(name);
      }
    }
  };
  const internalOnBlur = (event) => {
    const { nodeName } = event.relatedTarget || {};
    if (nodeName === 'INPUT' || nodeName === 'DIV' || nodeName === undefined) {
      setTouched(true);
      if (typeof onSubmit === 'function') {
        onSubmit(name, field.value || '');
      }
    }
  };
  return (
    <div
      style={style}
      className={!R.isNil(meta.error) ? 'error' : 'main'}
      onBlur={internalOnBlur}
      onFocus={internalOnFocus}
    >
      <InputLabel shrink={true} variant="standard">
        {label}
      </InputLabel>
      <ReactMde
        value={field.value}
        readOnly={disabled}
        onChange={(value) => setFieldValue(name, value)}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) => Promise.resolve(
          <RemarkGfmMarkdown
            content={markdown}
            commonmark={true}
          ></RemarkGfmMarkdown>,
        )
        }
        l18n={{
          write: t('Write'),
          preview: t('Preview'),
          uploadingImage: t('Uploading image'),
          pasteDropSelect: t('Paste'),
        }}
      />
      {!R.isNil(meta.error) && (
        <FormHelperText error={true}>{meta.error}</FormHelperText>
      )}
    </div>
  );
};

export default inject18n(MarkDownField);
