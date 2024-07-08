import * as Yup from 'yup';
import { StringSchema, Schema } from 'yup';
import { useFormatter } from '../../components/i18n';

interface SchemaAttribute {
  readonly mandatory: boolean,
  readonly multiple: boolean,
  readonly name: string,
  readonly type: string,
}

interface ExtraYupValidations {
  [key:string]: <T extends Schema>(validator: T) => T
}

const useYupValidation = () => {
  const { t_i18n } = useFormatter();

  const yupArray = (schema: Schema, multiple: boolean) => {
    if (multiple) return Yup.array().of(schema).nullable();
    return schema.nullable();
  };

  /**
   * Build the Yup shape used in form validation from the schema
   * attributes definition of an entity type.
   *
   * @param schemaAttributes Attributes definitions of the entity to create.
   * @param extraValidations Custom validations to also add in the Yup schema.
   */
  const buildValidationFromSchema = (
    schemaAttributes: SchemaAttribute[],
    extraValidations?: ExtraYupValidations,
  ) => {
    return Yup.object().shape(
      Object.fromEntries(schemaAttributes.map(({ name, multiple, mandatory, type }) => {
        // 1. Determine the type of schema to use.
        let validator = yupArray(
          Yup.mixed(),
          multiple,
        );
        if (type === 'string') {
          validator = yupArray(
            Yup.string().nullable().trim().typeError(t_i18n('This field must be a string')),
            multiple,
          );
        }
        if (type === 'numeric') {
          validator = yupArray(
            Yup.number().typeError(t_i18n('This field must be a number')),
            multiple,
          );
        }
        if (type === 'boolean') {
          validator = yupArray(
            Yup.boolean().typeError(t_i18n('This field must be a boolean')),
            multiple,
          );
        }
        if (type === 'date') {
          validator = yupArray(
            Yup.date().typeError(t_i18n('The value must be a datetime (yyyy-MM-dd hh:mm (a|p)m)')),
            multiple,
          );
        }
        // 2. If name, it should be at least 2 characters length.
        if (name === 'name' && validator instanceof StringSchema) {
          validator = validator.min(2);
        }
        // 3. Is the field required.
        if (mandatory) {
          validator = validator.required(t_i18n('This field is required'));
        }
        // 4. Add extra validation if any.
        if (extraValidations?.[name]) {
          validator = extraValidations[name](validator);
        }
        return [name, validator];
      })),
    );
  };

  return { buildValidationFromSchema };
};

export default useYupValidation;
