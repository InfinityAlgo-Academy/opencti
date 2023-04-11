import { executionContext, SYSTEM_USER } from '../utils/access';
import { addVocabulary } from '../modules/vocabulary/vocabulary-domain';
import { VocabularyCategory } from '../generated/graphql';
import { builtInOv, openVocabularies } from '../modules/vocabulary/vocabulary-utils';

export const up = async (next) => {
  const context = executionContext('migration');
  const categories = ['case_types_ov', VocabularyCategory.CaseSeverityOv, VocabularyCategory.CasePriorityOv];
  for (let indexCategory = 0; indexCategory < categories.length; indexCategory += 1) {
    const category = categories[indexCategory];
    const vocabularies = openVocabularies[category] ?? [];
    for (let i = 0; i < vocabularies.length; i += 1) {
      const { key, description, aliases } = vocabularies[i];
      const data = { name: key,
        description: description ?? '',
        aliases: aliases ?? [],
        category,
        builtIn: builtInOv.includes(category) };
      await addVocabulary(context, SYSTEM_USER, data);
    }
  }
  next();
};

export const down = async (next) => {
  next();
};
