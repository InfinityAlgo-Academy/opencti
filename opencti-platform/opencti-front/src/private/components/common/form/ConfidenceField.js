import React, { Component } from 'react';
import { Field } from 'formik';
import MenuItem from '@material-ui/core/MenuItem';
import inject18n from '../../../../components/i18n';
import SelectField from '../../../../components/SelectField';
import { SubscriptionFocus } from '../../../../components/Subscription';

class ConfidenceField extends Component {
  render() {
    const {
      t,
      name,
      label,
      variant,
      onChange,
      onFocus,
      containerstyle,
      editContext,
    } = this.props;
    if (variant === 'edit') {
      return (
        <Field
          component={SelectField}
          name={name}
          onFocus={onFocus}
          onChange={onChange}
          label={label}
          fullWidth={true}
          containerstyle={containerstyle}
          helpertext={
            <SubscriptionFocus context={editContext} fieldName={name} />
          }
        >
          <MenuItem value="0">{t('None')}</MenuItem>
          <MenuItem value="15">{t('Low')}</MenuItem>
          <MenuItem value="50">{t('Moderate')}</MenuItem>
          <MenuItem value="75">{t('Good')}</MenuItem>
          <MenuItem value="85">{t('Strong')}</MenuItem>
        </Field>
      );
    }
    return (
      <Field
        component={SelectField}
        name={name}
        label={label}
        fullWidth={true}
        containerstyle={containerstyle}
      >
        <MenuItem value={0}>{t('None')}</MenuItem>
        <MenuItem value={15}>{t('Low')}</MenuItem>
        <MenuItem value={50}>{t('Moderate')}</MenuItem>
        <MenuItem value={75}>{t('Good')}</MenuItem>
        <MenuItem value={85}>{t('Strong')}</MenuItem>
      </Field>
    );
  }
}

export default inject18n(ConfidenceField);
