import { FormikValues } from 'formik';
import { MalwareAddInput } from '../createSDO.inputs';

export const ATTRIBUTES_TO_IGNORE = [
  'i_attributes',
  'first_seen',
  'last_seen',
];

type FormShape<Values extends FormikValues> = {
  layout: string[],
  initialValues: [string, Values, Partial<Values>]
};

const malwareShape: FormShape<MalwareAddInput> = {
  layout: [
    'name',
    'malware_types',
    'is_family',
    'confidence',
    'description',
    'architecture_execution_envs',
    'implementation_languages',
    'killChainPhases',
    'createdBy',
    'objectLabel',
    'objectMarking',
    'externalReferences',
    'file',
  ],
  initialValues: [
    'Malware',
    {
      name: '',
      malware_types: [],
      confidence: undefined, // TODO LTR
      description: '',
      createdBy: undefined, // TODO LTR
      is_family: undefined, // TODO LTR
      objectMarking: [],
      killChainPhases: [],
      objectLabel: [],
      externalReferences: [],
      architecture_execution_envs: [],
      implementation_languages: [],
      file: undefined,
    },
    { is_family: false },
  ],
};

export const FORM_SHAPES: { [key:string]: FormShape<FormikValues> } = {
  Malware: malwareShape,
};
