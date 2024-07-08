import React, { Fragment } from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { CreateSDOSchemaAttributesQuery } from '@components/common/form/formCreateSCO/__generated__/CreateSDOSchemaAttributesQuery.graphql';
import { schemaAttributesQuery } from '@components/common/form/formCreateSCO/CreateSDO';
import { ATTRIBUTES_TO_IGNORE, FORM_SHAPES } from '@components/common/form/formCreateSCO/internal/createSDO.utils';
import { Formik, FormikValues, FormikConfig, Form } from 'formik';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles/createTheme';
import CreateSDOField from '@components/common/form/formCreateSCO/internal/CreateSDOField';
import useYupValidation from '../../../../../../utils/hooks/useYupValidation';
import useDefaultValues from '../../../../../../utils/hooks/useDefaultValues';
import { useFormatter } from '../../../../../../components/i18n';

interface CreateSDOFormProps<Values extends FormikValues> {
  sdoType: string
  queryRef: PreloadedQuery<CreateSDOSchemaAttributesQuery>
  onSubmit: FormikConfig<Values>['onSubmit']
  onReset?: FormikConfig<Values>['onReset']
}

function CreateSDOForm<Values extends FormikValues>({
  sdoType,
  queryRef,
  onSubmit,
  onReset,
}: CreateSDOFormProps<Values>) {
  const theme = useTheme<Theme>();
  const { t_i18n } = useFormatter();
  const { buildValidationFromSchema } = useYupValidation();
  const { csvMapperSchemaAttributes } = usePreloadedQuery(schemaAttributesQuery, queryRef);
  const schema = csvMapperSchemaAttributes.find((s) => s.name === sdoType);
  if (!schema) return null;

  const attributes = schema.attributes.filter((a) => !ATTRIBUTES_TO_IGNORE.includes(a.name));
  console.log(attributes);
  const yupSchema = buildValidationFromSchema(attributes);

  const formShape = FORM_SHAPES[sdoType];
  if (!formShape) return null;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const initValues = useDefaultValues<Values>(...formShape.initialValues);

  return (
    <Formik<Values>
      initialValues={initValues}
      validationSchema={yupSchema}
      onSubmit={onSubmit}
      onReset={onReset}
    >
      {({ submitForm, handleReset, isSubmitting, setFieldValue, values }) => (
        <Form>
          {formShape.layout.map((attributeName) => {
            const attribute = attributes.find((a) => a.name === attributeName);

            return (
              <Fragment key={attributeName}>
                <CreateSDOField
                  attribute={attribute || { name: attributeName }}
                  setFieldValue={setFieldValue}
                  values={values}
                  sdoType={sdoType}
                />
              </Fragment>
            );
          })}

          <div style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'end',
            gap: theme.spacing(2),
          }}
          >
            <Button
              variant='contained'
              onClick={handleReset}
              disabled={isSubmitting}
            >
              {t_i18n('Cancel')}
            </Button>
            <Button
              variant='contained'
              color="secondary"
              onClick={submitForm}
              disabled={isSubmitting}
            >
              {t_i18n('Create')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default CreateSDOForm;
