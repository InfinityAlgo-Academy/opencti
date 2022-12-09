import React, { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import Fab from '@mui/material/Fab';
import { Add, Close } from '@mui/icons-material';
import * as Yup from 'yup';
import { graphql, useMutation } from 'react-relay';
import { FormikConfig } from 'formik/dist/types';
import * as R from 'ramda';
import { useFormatter } from '../../../../components/i18n';
import TextField from '../../../../components/TextField';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import MarkDownField from '../../../../components/MarkDownField';
import { Theme } from '../../../../components/Theme';
import { insertNode } from '../../../../utils/store';
import { RegionsLinesPaginationQuery$variables } from './__generated__/RegionsLinesPaginationQuery.graphql';

const styles = makeStyles<Theme>((theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
  dialogActions: {
    padding: '0 17px 20px 0',
  },
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
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
  },
  importButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
}));

const regionMutation = graphql`
  mutation RegionCreationMutation($input: RegionAddInput!) {
    regionAdd(input: $input) {
      ...RegionLine_node
    }
  }
`;

const regionValidation = (t: (message: string) => string) => Yup.object()
  .shape({
    name: Yup.string()
      .required(t('This field is required')),
    description: Yup.string()
      .min(3, t('The value is too short'))
      .max(5000, t('The value is too long'))
      .required(t('This field is required')),
  });

interface RegionAddInput {
  name: string,
  description: string,
  createdBy?: { value: string, label?: string },
  objectMarking: { value: string }[],
}

const RegionCreation = ({ paginationOptions }: { paginationOptions: RegionsLinesPaginationQuery$variables }) => {
  const { t } = useFormatter();
  const classes = styles();

  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [commit] = useMutation(regionMutation);

  const onSubmit: FormikConfig<RegionAddInput>['onSubmit'] = (values, { setSubmitting, resetForm }) => {
    const finalValues = R.pipe(
      R.assoc('createdBy', values.createdBy?.value),
      R.assoc('objectMarking', R.pluck('value', values.objectMarking)),
    )(values);
    commit({
      variables: {
        input: finalValues,
      },
      updater: (store) => {
        insertNode(store, 'Pagination_regions', paginationOptions, 'regionAdd');
      },
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        handleClose();
      },
    });
  };

  return (
    <div>
      <Fab
        onClick={handleOpen}
        color="secondary"
        aria-label="Add"
        className={classes.createButton}
      >
        <Add />
      </Fab>
      <Drawer
        open={open}
        anchor="right"
        elevation={1}
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
        onClose={handleClose}
      >
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose}
            size="large"
            color="primary"
          >
            <Close fontSize="small" color="primary" />
          </IconButton>
          <Typography variant="h6">{t('Create a Region')}</Typography>
        </div>
        <div className={classes.container}>
          <Formik<RegionAddInput>
            initialValues={{
              name: '',
              description: '',
              createdBy: { value: '', label: '' },
              objectMarking: [],
            }}
            validationSchema={regionValidation(t)}
            onSubmit={onSubmit}
            onReset={handleClose}
          >
            {({
              submitForm,
              handleReset,
              isSubmitting,
              setFieldValue,
            }) => (
              <Form style={{ margin: '20px 0 20px 0' }}>
                <Field
                  component={TextField}
                  variant="standard"
                  name="name"
                  label={t('Name')}
                  fullWidth={true}
                  detectDuplicate={['Region']}
                />
                <Field
                  component={MarkDownField}
                  name="description"
                  label={t('Description')}
                  fullWidth={true}
                  multiline={true}
                  rows="4"
                  style={{ marginTop: 20 }}
                />
                <CreatedByField
                  name="createdBy"
                  style={{
                    marginTop: 20,
                    width: '100%',
                  }}
                  setFieldValue={setFieldValue}
                />
                <ObjectMarkingField
                  name="objectMarking"
                  style={{
                    marginTop: 20,
                    width: '100%',
                  }}
                />
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
        </div>
      </Drawer>
    </div>
  );
};

export default RegionCreation;
