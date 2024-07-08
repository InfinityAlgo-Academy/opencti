import { Option } from '@components/common/form/ReferenceField';

export interface MalwareAddInput {
  name: string
  malware_types: Option[]
  confidence: number | undefined
  description: string
  createdBy: Option | undefined
  is_family: boolean | undefined
  objectMarking: Option[]
  killChainPhases: Option[],
  objectLabel: Option[]
  externalReferences: { value: string }[]
  architecture_execution_envs: string[],
  implementation_languages: string[],
  file: File | undefined
}
