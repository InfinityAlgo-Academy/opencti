import React, { FunctionComponent, useState } from 'react';
import { Field } from 'formik';
import { Label } from 'mdi-material-ui';
import makeStyles from '@mui/styles/makeStyles';
import { graphql } from 'react-relay';
import { fetchQuery } from '../../../../relay/environment';
import AutocompleteField from '../../../../components/AutocompleteField';
import { useFormatter } from '../../../../components/i18n';
import { NotifierConnectorFieldSearchQuery$data } from './__generated__/NotifierConnectorFieldSearchQuery.graphql';

const useStyles = makeStyles(() => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  autoCompleteIndicator: {
    display: 'none',
  },
}));

interface NotifierConnectorFieldProps {
  name: string
  style?: { marginTop: number }
  helpertext?: string
  disabled?: boolean
  onChange?: (name: string, value: { label: string, value: string, schema: string }) => void
}

const NotifierConnectorFieldQuery = graphql`
  query NotifierConnectorFieldSearchQuery {
    connectorsForNotification {
      id
      name
      connector_schema
      connector_schema_ui
    }
  }
`;

const NotifierConnectorField: FunctionComponent<NotifierConnectorFieldProps> = ({ name, style, onChange, disabled, helpertext }) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const [connectors, setConnectors] = useState<{ label: string | undefined; value: string | undefined; }[]>([]);

  const searchNotifierConnectors = (event: React.ChangeEvent<HTMLInputElement>) => {
    fetchQuery(NotifierConnectorFieldQuery, { search: event && event.target.value ? event.target.value : '' }).toPromise().then((data) => {
      const notifierConnectors = ((data as NotifierConnectorFieldSearchQuery$data)?.connectorsForNotification ?? []).map((n) => ({
        label: n?.name,
        value: n?.id,
        schema: n?.connector_schema,
        ui_schema: n?.connector_schema_ui,
      }));
      setConnectors(notifierConnectors);
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <Field
        component={AutocompleteField}
        name={name}
        multiple={false}
        style={style}
        disabled={disabled}
        onChange={onChange}
        textfieldprops={{ variant: 'standard', label: t('Notification connector'), helperText: helpertext, onFocus: searchNotifierConnectors }}
        noOptionsText={t('No available options')}
        options={connectors}
        onInputChange={searchNotifierConnectors}
        renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: { color: string; label: string }) => (
          <li {...props}>
            <div className={classes.icon} style={{ color: option.color }}>
              <Label />
            </div>
            <div className={classes.text}>{option.label}</div>
          </li>
        )}
        classes={{ clearIndicator: classes.autoCompleteIndicator }}
      />
    </div>
  );
};

export default NotifierConnectorField;
