import React, { FunctionComponent, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { graphql, useMutation } from 'react-relay';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Fab from '@mui/material/Fab';
import { Add } from '@mui/icons-material';
import Drawer, { DrawerVariant } from '@components/common/drawer/Drawer';
import makeStyles from '@mui/styles/makeStyles';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import {
  LocationCreationMutation, LocationCreationMutation$data,
  LocationCreationMutation$variables,
} from '@components/common/location/__generated__/LocationCreationMutation.graphql';
import { FormikConfig } from 'formik/dist/types';
import { useFormatter } from '../../../../components/i18n';
import { handleErrorInForm } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import SelectField from '../../../../components/SelectField';
import MarkdownField from '../../../../components/MarkdownField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import { Theme } from '../../../../components/Theme';

const useStyles = makeStyles<Theme>((theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  createButtonContextual: {
    position: 'fixed',
    bottom: 30,
    right: 30,
    zIndex: 2000,
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

const locationMutation = graphql`
  mutation LocationCreationMutation($input: LocationAddInput!) {
    locationAdd(input: $input) {
      id
      standard_id
      name
      entity_type
      parent_types
    }
  }
`;

interface LocationAddInput {
  name: string
  description: string
  type: string
}

interface LocationCreationFormProps {
  updater: (store: RecordSourceSelectorProxy) => void;
  onReset?: () => void;
  display?: boolean
  contextual?: boolean
  onCompleted?: () => void;
  inputValue: string
  creationCallback?: (data:LocationCreationMutation$data) => void;
  onlyAuthors?: boolean
}

const locations = [
  'Administrative-Area',
  'Region',
  'Country',
  'City',
  'Position',
];

const locationValidation = (t: (name: string | object) => string) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
  description: Yup.string().nullable(),
  type: Yup.string().required(t('This field is required')),
});

const LocationCreationForm: FunctionComponent<LocationCreationFormProps> = ({
  inputValue,
  onlyAuthors,
  onReset,
  onCompleted,
  contextual,
  creationCallback,
  updater,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const [commit] = useMutation<LocationCreationMutation>(locationMutation);

  const onSubmit: FormikConfig<LocationAddInput>['onSubmit'] = (
    values,
    {
      setSubmitting,
      resetForm,
      setErrors,
    },
  ) => {
    const input: LocationCreationMutation$variables['input'] = {
      name: values.name,
      description: values.description,
      type: values.type,
    };
    commit({
      variables: {
        input,
      },
      updater: (store) => updater(store),
      onError: (error: Error) => {
        handleErrorInForm(error, setErrors);
        setSubmitting(false);
      },
      onCompleted: (response) => {
        setSubmitting(false);
        resetForm();
        if (contextual && creationCallback) {
          creationCallback(response);
        }
        if (onCompleted) {
          onCompleted();
        }
      },
    });
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        name: inputValue,
        description: '',
        type: '',
      }}
      validationSchema={locationValidation(t)}
      onSubmit={onSubmit}
      onReset={onReset}
    >
      {({
        submitForm,
        handleReset,
        isSubmitting,
      }) => (
        <Form style={{ margin: '20px 0 20px 0' }}>
          <Field
            component={TextField}
            variant="standard"
            name="name"
            label={t('Name')}
            fullWidth={true}
            detectDuplicate={['Organization', 'Individual']}
          />
          <Field
            component={MarkdownField}
            name="description"
            label={t('Description')}
            fullWidth={true}
            multiline={true}
            rows="4"
            style={{ marginTop: 20 }}
          />
          <Field
            component={SelectField}
            variant="standard"
            name="type"
            label={t('Entity type')}
            fullWidth={true}
            containerstyle={fieldSpacingContainerStyle}
          >
            {!onlyAuthors && locations.map((location, idx) => (
            <MenuItem key={idx} value={location}>{t(location)}</MenuItem>
            ))}
          </Field>
          <div className={classes.buttons}>
            <Button
              variant="contained"
              onClick={handleReset}
              disabled={isSubmitting}
              classes={{ root: classes.button }}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={submitForm}
              disabled={isSubmitting}
              classes={{ root: classes.button }}
            >
              {t('Create')}
            </Button>
          </div>
      </Form>
      )}
    </Formik>
  );
};

const LocationCreation: FunctionComponent<LocationCreationFormProps> = ({
  contextual,
  display,
  inputValue,
  updater,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const renderClassic = () => {
    return (
      <Drawer
        title={t('Add a location')}
        variant={DrawerVariant.create}
      >
        {({ onClose }) => (
          <LocationCreationForm
            inputValue={inputValue}
            updater={updater}
            onCompleted={onClose}
            onReset={onClose}
          />
        )}
      </Drawer>
    );
  };

  const renderContextual = () => {
    return (
      <div style={{ display: display ? 'block' : 'none' }}>
        <Fab
          onClick={handleOpen}
          color="secondary"
          aria-label="Add"
          className={classes.createButtonContextual}
        >
          <Add />
        </Fab>
        <Dialog open={open} onClose={handleClose} PaperProps={{ elevation: 1 }}>
          <DialogTitle>{t('Add a location')}</DialogTitle>
          <DialogContent>
            <LocationCreationForm
              inputValue={inputValue}
              updater={updater}
              onCompleted={handleClose}
              onReset={handleClose}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  if (contextual) {
    return renderContextual();
  }
  return renderClassic();
};

export default LocationCreation;
