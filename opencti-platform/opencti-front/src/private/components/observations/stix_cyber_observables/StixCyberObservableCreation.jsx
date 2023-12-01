import React, { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import { Add, Close } from '@mui/icons-material';
import {
  assoc,
  compose,
  dissoc,
  filter,
  fromPairs,
  includes,
  map,
  pipe,
  pluck,
  prop,
  propOr,
  sortBy,
  toLower,
  toPairs,
} from 'ramda';
import * as Yup from 'yup';
import { graphql } from 'react-relay';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import makeStyles from '@mui/styles/makeStyles';
import { ListItemButton } from '@mui/material';
import {
  commitMutation,
  handleErrorInForm,
  QueryRenderer,
} from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import SwitchField from '../../../../components/SwitchField';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import {
  stixCyberObservablesLinesAttributesQuery,
  stixCyberObservablesLinesSubTypesQuery,
} from './StixCyberObservablesLines';
import { parse } from '../../../../utils/Time';
import MarkdownField from '../../../../components/MarkdownField';
import { ExternalReferencesField } from '../../common/form/ExternalReferencesField';
import DateTimePickerField from '../../../../components/DateTimePickerField';
import {
  booleanAttributes,
  dateAttributes,
  ignoredAttributes,
  multipleAttributes,
  numberAttributes,
} from '../../../../utils/hooks/useAttributes';
import ArtifactField from '../../common/form/ArtifactField';
import OpenVocabField from '../../common/form/OpenVocabField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import { insertNode } from '../../../../utils/store';
import { useFormatter } from '../../../../components/i18n';
import useVocabularyCategory from '../../../../utils/hooks/useVocabularyCategory';
import { convertMarking } from '../../../../utils/edition';
import CustomFileUploader from '../../common/files/CustomFileUploader';

const useStyles = makeStyles((theme) => ({
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
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
    transition: theme.transitions.create('right', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
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
  container: {
    padding: '10px 20px 20px 20px',
  },
}));

const stixCyberObservableMutation = graphql`
  mutation StixCyberObservableCreationMutation(
    $type: String!
    $x_opencti_score: Int
    $x_opencti_description: String
    $createIndicator: Boolean
    $createdBy: String
    $objectMarking: [String]
    $objectLabel: [String]
    $externalReferences: [String]
    $AutonomousSystem: AutonomousSystemAddInput
    $Directory: DirectoryAddInput
    $DomainName: DomainNameAddInput
    $EmailAddr: EmailAddrAddInput
    $EmailMessage: EmailMessageAddInput
    $EmailMimePartType: EmailMimePartTypeAddInput
    $Artifact: ArtifactAddInput
    $StixFile: StixFileAddInput
    $X509Certificate: X509CertificateAddInput
    $IPv4Addr: IPv4AddrAddInput
    $IPv6Addr: IPv6AddrAddInput
    $MacAddr: MacAddrAddInput
    $Mutex: MutexAddInput
    $NetworkTraffic: NetworkTrafficAddInput
    $Process: ProcessAddInput
    $Software: SoftwareAddInput
    $Url: UrlAddInput
    $UserAccount: UserAccountAddInput
    $WindowsRegistryKey: WindowsRegistryKeyAddInput
    $WindowsRegistryValueType: WindowsRegistryValueTypeAddInput
    $Hostname: HostnameAddInput
    $CryptographicKey: CryptographicKeyAddInput
    $CryptocurrencyWallet: CryptocurrencyWalletAddInput
    $Text: TextAddInput
    $UserAgent: UserAgentAddInput
    $BankAccount: BankAccountAddInput
    $PhoneNumber: PhoneNumberAddInput
    $PaymentCard: PaymentCardAddInput
    $MediaContent: MediaContentAddInput
  ) {
    stixCyberObservableAdd(
      type: $type
      x_opencti_score: $x_opencti_score
      x_opencti_description: $x_opencti_description
      createIndicator: $createIndicator
      createdBy: $createdBy
      objectMarking: $objectMarking
      objectLabel: $objectLabel
      externalReferences: $externalReferences
      AutonomousSystem: $AutonomousSystem
      Directory: $Directory
      DomainName: $DomainName
      EmailAddr: $EmailAddr
      EmailMessage: $EmailMessage
      EmailMimePartType: $EmailMimePartType
      Artifact: $Artifact
      StixFile: $StixFile
      X509Certificate: $X509Certificate
      IPv4Addr: $IPv4Addr
      IPv6Addr: $IPv6Addr
      MacAddr: $MacAddr
      Mutex: $Mutex
      NetworkTraffic: $NetworkTraffic
      Process: $Process
      Software: $Software
      Url: $Url
      UserAccount: $UserAccount
      WindowsRegistryKey: $WindowsRegistryKey
      WindowsRegistryValueType: $WindowsRegistryValueType
      Hostname: $Hostname
      CryptographicKey: $CryptographicKey
      CryptocurrencyWallet: $CryptocurrencyWallet
      Text: $Text
      UserAgent: $UserAgent
      BankAccount: $BankAccount
      PhoneNumber: $PhoneNumber
      PaymentCard: $PaymentCard
      MediaContent: $MediaContent
    ) {
      id
      standard_id
      entity_type
      parent_types
      observable_value
      x_opencti_description
      created_at
      createdBy {
        ... on Identity {
          id
          name
          entity_type
        }
      }
      objectMarking {
        edges {
          node {
            id
            definition_type
            definition
            x_opencti_order
            x_opencti_color
          }
        }
      }
      objectLabel {
        edges {
          node {
            id
            value
            color
          }
        }
      }
    }
  }
`;

const stixCyberObservableValidation = () => Yup.object().shape({
  x_opencti_score: Yup.number().nullable(),
  x_opencti_description: Yup.string().nullable(),
  createIndicator: Yup.boolean(),
});

const StixCyberObservableCreation = ({
  contextual,
  open,
  handleClose,
  type,
  display,
  speeddial,
  inputValue,
  paginationKey,
  paginationOptions,
  defaultCreatedBy = null,
  defaultMarkingDefinitions = null,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const { isVocabularyField, fieldToCategory } = useVocabularyCategory();
  const [status, setStatus] = useState({ open: false, type: type ?? null });

  const handleOpen = () => setStatus({ open: true, type: status.type });
  const localHandleClose = () => setStatus({ open: false, type: null });
  const selectType = (selected) => setStatus({ open: status.open, type: selected });

  const onSubmit = (values, { setSubmitting, setErrors, resetForm }) => {
    let adaptedValues = values;
    // Potential dicts
    if (
      adaptedValues['hashes.MD5']
      || adaptedValues['hashes_SHA-1']
      || adaptedValues['hashes_SHA-256']
      || adaptedValues['hashes_SHA-512']
    ) {
      adaptedValues.hashes = [];
      if (adaptedValues['hashes.MD5'].length > 0) {
        adaptedValues.hashes.push({
          algorithm: 'MD5',
          hash: adaptedValues['hashes.MD5'],
        });
      }
      if (adaptedValues['hashes_SHA-1'].length > 0) {
        adaptedValues.hashes.push({
          algorithm: 'SHA-1',
          hash: adaptedValues['hashes_SHA-1'],
        });
      }
      if (adaptedValues['hashes_SHA-256'].length > 0) {
        adaptedValues.hashes.push({
          algorithm: 'SHA-256',
          hash: adaptedValues['hashes_SHA-256'],
        });
      }
      if (adaptedValues['hashes_SHA-512'].length > 0) {
        adaptedValues.hashes.push({
          algorithm: 'SHA-512',
          hash: adaptedValues['hashes_SHA-512'],
        });
      }
    }
    adaptedValues = pipe(
      dissoc('x_opencti_description'),
      dissoc('x_opencti_score'),
      dissoc('createdBy'),
      dissoc('objectMarking'),
      dissoc('objectLabel'),
      dissoc('externalReferences'),
      dissoc('createIndicator'),
      dissoc('hashes.MD5'),
      dissoc('hashes_SHA-1'),
      dissoc('hashes_SHA-256'),
      dissoc('hashes_SHA-512'),
      toPairs,
      map((n) => (includes(n[0], dateAttributes)
        ? [n[0], n[1] ? parse(n[1]).format() : null]
        : n)),
      map((n) => (includes(n[0], numberAttributes)
        ? [n[0], n[1] ? parseInt(n[1], 10) : null]
        : n)),
      map((n) => (includes(n[0], multipleAttributes)
        ? [n[0], n[1] ? n[1].split(',') : null]
        : n)),
      fromPairs,
    )(adaptedValues);
    const finalValues = {
      type: status.type,
      x_opencti_description:
        values.x_opencti_description.length > 0
          ? values.x_opencti_description
          : null,
      x_opencti_score: parseInt(values.x_opencti_score, 10),
      createdBy: propOr(null, 'value', values.createdBy),
      objectMarking: pluck('value', values.objectMarking),
      objectLabel: pluck('value', values.objectLabel),
      externalReferences: pluck('value', values.externalReferences),
      createIndicator: values.createIndicator,
      [status.type.replace(/(?:^|-|_)(\w)/g, (matches, letter) => letter.toUpperCase())]: {
        ...adaptedValues,
        obsContent: values.obsContent?.value,
      },
    };
    if (values.file) {
      finalValues.file = values.file;
    }
    commitMutation({
      mutation: stixCyberObservableMutation,
      variables: finalValues,
      updater: (store) => insertNode(
        store,
        paginationKey,
        paginationOptions,
        'stixCyberObservableAdd',
      ),
      onError: (error) => {
        handleErrorInForm(error, setErrors);
        setSubmitting(false);
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        localHandleClose();
      },
    });
  };

  const onReset = () => {
    if (speeddial) {
      handleClose();
    } else {
      localHandleClose();
    }
  };

  const renderList = () => {
    return (
      <QueryRenderer
        query={stixCyberObservablesLinesSubTypesQuery}
        variables={{ type: 'Stix-Cyber-Observable' }}
        render={({ props }) => {
          if (props && props.subTypes) {
            const subTypesEdges = props.subTypes.edges;
            const sortByLabel = sortBy(compose(toLower, prop('tlabel')));
            const translatedOrderedList = pipe(
              map((n) => n.node),
              map((n) => assoc('tlabel', t(`entity_${n.label}`), n)),
              sortByLabel,
            )(subTypesEdges);
            return (
              <List>
                {translatedOrderedList.map((subType) => (
                  <ListItemButton
                    key={subType.label}
                    divider={true}
                    dense={true}
                    onClick={() => selectType(subType.label)}
                  >
                    <ListItemText primary={subType.tlabel}/>
                  </ListItemButton>
                ))}
              </List>
            );
          }
          return <div/>;
        }}
      />
    );
  };

  const renderForm = () => {
    return (
      <QueryRenderer
        query={stixCyberObservablesLinesAttributesQuery}
        variables={{ elementType: [status.type] }}
        render={({ props }) => {
          if (props && props.schemaAttributeNames) {
            const baseCreatedBy = defaultCreatedBy
              ? { value: defaultCreatedBy.id, label: defaultCreatedBy.name }
              : undefined;
            const baseMarkingDefinitions = (
              defaultMarkingDefinitions ?? []
            ).map((n) => convertMarking(n));
            const initialValues = {
              x_opencti_description: '',
              x_opencti_score: 50,
              createdBy: baseCreatedBy,
              objectMarking: baseMarkingDefinitions,
              objectLabel: [],
              externalReferences: [],
              createIndicator: false,
              file: undefined,
            };
            const attributes = pipe(
              map((n) => n.node),
              filter(
                (n) => !includes(n.value, ignoredAttributes)
                  && !n.value.startsWith('i_'),
              ),
            )(props.schemaAttributeNames.edges);
            for (const attribute of attributes) {
              if (isVocabularyField(status.type, attribute.value)) {
                initialValues[attribute.value] = null;
              } else if (includes(attribute.value, dateAttributes)) {
                initialValues[attribute.value] = null;
              } else if (includes(attribute.value, booleanAttributes)) {
                initialValues[attribute.value] = false;
              } else if (attribute.value === 'hashes') {
                initialValues['hashes.MD5'] = '';
                initialValues['hashes_SHA-1'] = '';
                initialValues['hashes_SHA-256'] = '';
                initialValues['hashes_SHA-512'] = '';
              } else if (attribute.value === 'value') {
                initialValues[attribute.value] = inputValue || '';
              } else {
                initialValues[attribute.value] = '';
              }
            }
            return (
              <Formik
                initialValues={initialValues}
                validationSchema={stixCyberObservableValidation()}
                onSubmit={onSubmit}
                onReset={onReset}
              >
                {({
                  submitForm,
                  handleReset,
                  isSubmitting,
                  setFieldValue,
                  values,
                }) => (
                  <Form
                    style={{
                      margin: contextual ? '10px 0 0 0' : '20px 0 20px 0',
                    }}
                  >
                    <div>
                      <Field
                        component={TextField}
                        variant="standard"
                        name="x_opencti_score"
                        label={t('Score')}
                        fullWidth={true}
                        type="number"
                      />
                      <Field
                        component={MarkdownField}
                        name="x_opencti_description"
                        label={t('Description')}
                        fullWidth={true}
                        multiline={true}
                        rows="4"
                        style={{ marginTop: 20 }}
                      />
                      {attributes.map((attribute) => {
                        if (attribute.value === 'hashes') {
                          return (
                            <div key={attribute.value}>
                              <Field
                                component={TextField}
                                variant="standard"
                                name="hashes.MD5"
                                label={t('hash_md5')}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                              />
                              <Field
                                component={TextField}
                                variant="standard"
                                name="hashes_SHA-1"
                                label={t('hash_sha-1')}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                              />
                              <Field
                                component={TextField}
                                variant="standard"
                                name="hashes_SHA-256"
                                label={t('hash_sha-256')}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                              />
                              <Field
                                component={TextField}
                                variant="standard"
                                name="hashes_SHA-512"
                                label={t('hash_sha-512')}
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                              />
                            </div>
                          );
                        }
                        if (isVocabularyField(status.type, attribute.value)) {
                          return (
                            <OpenVocabField
                              key={attribute.value}
                              label={t(attribute.value)}
                              type={fieldToCategory(
                                status.type,
                                attribute.value,
                              )}
                              name={attribute.value}
                              onChange={(name, value) => setFieldValue(name, value)
                              }
                              containerStyle={fieldSpacingContainerStyle}
                              multiple={false}
                            />
                          );
                        }
                        if (includes(attribute.value, dateAttributes)) {
                          return (
                            <Field
                              component={DateTimePickerField}
                              key={attribute.value}
                              name={attribute.value}
                              withSeconds={true}
                              TextFieldProps={{
                                label: attribute.value,
                                variant: 'standard',
                                fullWidth: true,
                                style: { marginTop: 20 },
                              }}
                            />
                          );
                        }
                        if (includes(attribute.value, numberAttributes)) {
                          return (
                            <Field
                              component={TextField}
                              variant="standard"
                              key={attribute.value}
                              name={attribute.value}
                              label={attribute.value}
                              fullWidth={true}
                              type="number"
                              style={{ marginTop: 20 }}
                            />
                          );
                        }
                        if (includes(attribute.value, booleanAttributes)) {
                          return (
                            <Field
                              component={SwitchField}
                              type="checkbox"
                              key={attribute.value}
                              name={attribute.value}
                              label={attribute.value}
                              fullWidth={true}
                              containerstyle={{ marginTop: 20 }}
                            />
                          );
                        }
                        if (attribute.value === 'obsContent') {
                          return (
                            <ArtifactField
                              key={attribute.value}
                              attributeName={attribute.value}
                              onChange={setFieldValue}
                            />
                          );
                        }
                        return (
                          <Field
                            component={TextField}
                            variant="standard"
                            key={attribute.value}
                            name={attribute.value}
                            label={attribute.value}
                            fullWidth={true}
                            style={{ marginTop: 20 }}
                          />
                        );
                      })}
                    </div>
                    <CreatedByField
                      name="createdBy"
                      style={fieldSpacingContainerStyle}
                      setFieldValue={setFieldValue}
                    />
                    <ObjectLabelField
                      name="objectLabel"
                      style={fieldSpacingContainerStyle}
                      setFieldValue={setFieldValue}
                      values={values.objectLabel}
                    />
                    <ObjectMarkingField
                      name="objectMarking"
                      style={fieldSpacingContainerStyle}
                    />
                    <ExternalReferencesField
                      name="externalReferences"
                      style={fieldSpacingContainerStyle}
                      setFieldValue={setFieldValue}
                      values={values.externalReferences}
                    />
                    <CustomFileUploader setFieldValue={setFieldValue}/>
                    <Field
                      component={SwitchField}
                      type="checkbox"
                      name="createIndicator"
                      label={t('Create an indicator from this observable')}
                      containerstyle={{ marginTop: 20 }}
                    />
                    <div className={classes.buttons}>
                      <Button
                        variant={contextual ? 'text' : 'contained'}
                        onClick={handleReset}
                        disabled={isSubmitting}
                        classes={{ root: classes.button }}
                      >
                        {t('Cancel')}
                      </Button>
                      <Button
                        variant={contextual ? 'text' : 'contained'}
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
          }
          return <div/>;
        }}
      />
    );
  };

  const renderClassic = () => {
    return (
      <div>
        <Fab
          onClick={handleOpen}
          color="secondary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add/>
        </Fab>
        <Drawer
          open={status.open}
          anchor="right"
          sx={{ zIndex: 1202 }}
          elevation={1}
          classes={{ paper: classes.drawerPaper }}
          onClose={localHandleClose}
        >
          <div className={classes.header}>
            <IconButton
              aria-label="Close"
              className={classes.closeButton}
              onClick={localHandleClose}
              size="large"
              color="primary"
            >
              <Close fontSize="small" color="primary"/>
            </IconButton>
            <Typography variant="h6">{t('Create an observable')}</Typography>
          </div>
          <div className={classes.container}>
            {!status.type ? renderList() : renderForm()}
          </div>
        </Drawer>
      </div>
    );
  };

  const renderContextual = () => {
    return (
      <div style={{ display: display ? 'block' : 'none' }}>
        {!speeddial && (
          <Fab
            onClick={handleOpen}
            color="secondary"
            aria-label="Add"
            className={classes.createButtonContextual}
          >
            <Add/>
          </Fab>
        )}
        <Dialog
          open={speeddial ? open : status.open}
          PaperProps={{ elevation: 1 }}
          onClose={speeddial ? handleClose : localHandleClose}
          fullWidth={true}
        >
          <DialogTitle>{t('Create an observable')}</DialogTitle>
          <DialogContent style={{ paddingTop: 0 }}>
            {!status.type ? renderList() : renderForm()}
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

export default StixCyberObservableCreation;
