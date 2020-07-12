import { addSector, findAll, findById, isSubSector, subSectors, parentSectors } from '../domain/sector';
import {
  stixDomainEntityAddRelation,
  stixDomainEntityCleanContext,
  stixDomainEntityDelete,
  stixDomainEntityDeleteRelation,
  stixDomainEntityEditContext,
  stixDomainEntityEditField,
} from '../domain/stixDomainEntity';
import { REL_INDEX_PREFIX } from '../database/elasticSearch';
import { RELATION_CREATED_BY, RELATION_OBJECT_LABEL, RELATION_OBJECT_MARKING } from '../utils/idGenerator';

const sectorResolvers = {
  Query: {
    sector: (_, { id }) => findById(id),
    sectors: (_, args) => findAll(args),
  },
  Sector: {
    parentSectors: (sector) => parentSectors(sector.id),
    subSectors: (sector) => subSectors(sector.id),
    isSubSector: (sector, args) => isSubSector(sector.id, args),
  },
  SectorsFilter: {
    createdBy: `${REL_INDEX_PREFIX}${RELATION_CREATED_BY}.internal_id_key`,
    markingDefinitions: `${REL_INDEX_PREFIX}${RELATION_OBJECT_MARKING}.internal_id_key`,
    labels: `${REL_INDEX_PREFIX}${RELATION_OBJECT_LABEL}.internal_id_key`,
    gatheredBy: `${REL_INDEX_PREFIX}gathering.internal_id_key`,
  },
  Mutation: {
    sectorEdit: (_, { id }, { user }) => ({
      delete: () => stixDomainEntityDelete(user, id),
      fieldPatch: ({ input }) => stixDomainEntityEditField(user, id, input),
      contextPatch: ({ input }) => stixDomainEntityEditContext(user, id, input),
      contextClean: () => stixDomainEntityCleanContext(user, id),
      relationAdd: ({ input }) => stixDomainEntityAddRelation(user, id, input),
      relationDelete: ({ relationId }) => stixDomainEntityDeleteRelation(user, id, relationId),
    }),
    sectorAdd: (_, { input }, { user }) => addSector(user, input),
  },
};

export default sectorResolvers;
