import React, { Suspense, useState } from 'react';
import CreateSDODialog from '@components/common/form/formCreateSCO/internal/CreateSDODialog';
import CreateSDODrawer from '@components/common/form/formCreateSCO/internal/CreateSDODrawer';
import CreateSDOTypeChooser from '@components/common/form/formCreateSCO/internal/CreateSDOTypeChooser';
import CreateSDOForm from '@components/common/form/formCreateSCO/internal/CreateSDOForm';
import { graphql } from 'react-relay';
import { CreateSDOSchemaAttributesQuery } from '@components/common/form/formCreateSCO/__generated__/CreateSDOSchemaAttributesQuery.graphql';
import { FormikConfig, FormikValues } from 'formik';
import useQueryLoading from '../../../../../utils/hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../../../../components/Loader';

export const schemaAttributesQuery = graphql`
  query CreateSDOSchemaAttributesQuery {
    csvMapperSchemaAttributes {
      name
      attributes {
        name
        label
        mandatory
        multiple
        type
        defaultValues {
          name
          id
        }
      }
    }
  }
`;

export interface CreateSDOProps<Values extends FormikValues> {
  sdoType?: string
  variant?: 'dialog' | 'drawer'
  onSubmit: FormikConfig<Values>['onSubmit']
  onReset?: FormikConfig<Values>['onReset']
}

function CreateSDO<Values extends FormikValues>({
  sdoType,
  variant = 'drawer',
  onSubmit,
  onReset,
}: CreateSDOProps<Values>) {
  const Container = variant === 'dialog' ? CreateSDODialog : CreateSDODrawer;
  const [type, setType] = useState(sdoType);

  const schemaAttributesQueryRef = useQueryLoading<CreateSDOSchemaAttributesQuery>(schemaAttributesQuery);

  return (
    <Container type={type}>
      {schemaAttributesQueryRef && (
        <Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
          {!type
            ? <CreateSDOTypeChooser onChange={setType} />
            : <CreateSDOForm
                sdoType={type}
                queryRef={schemaAttributesQueryRef}
                onSubmit={onSubmit}
                onReset={onReset}
              />
          }
        </Suspense>
      )}
    </Container>
  );
}

export default CreateSDO;
