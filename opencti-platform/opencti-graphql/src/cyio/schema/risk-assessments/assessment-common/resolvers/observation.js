import { riskSingularizeSchema as singularizeSchema } from '../../risk-mappings.js';
import {compareValues, updateQuery, filterValues} from '../../../utils.js';
import {UserInputError} from "apollo-server-express";
import {
  selectLabelByIriQuery,
  selectExternalReferenceByIriQuery,
  selectNoteByIriQuery,
  getReducer as getGlobalReducer,
} from '../../../global/resolvers/sparql-query.js';
import {
  attachToPOAMQuery,
  detachFromPOAMQuery,
} from '../../poam/resolvers/sparql-query.js';
import {
  getReducer, 
  insertObservationQuery,
  selectObservationQuery,
  selectAllObservations,
  deleteObservationQuery,
  attachToObservationQuery,
  selectEvidenceByIriQuery,
  insertEvidencesQuery,
  deleteEvidenceByIriQuery,
  selectOriginByIriQuery,
  selectSubjectByIriQuery,
  deleteSubjectByIriQuery,
  observationPredicateMap,
} from './sparql-query.js';


const observationResolvers = {
  Query: {
    observations: async (_, args, { dbName, dataSources, selectMap }) => {
      const sparqlQuery = selectAllObservations(selectMap.getNode("node"), args);
      let response;
      try {
        response = await dataSources.Stardog.queryAll({
          dbName,
          sparqlQuery,
          queryId: "Select Observation List",
          singularizeSchema
        });
      } catch (e) {
        console.log(e)
        throw e
      }

      if (response === undefined) return null;
      if (Array.isArray(response) && response.length > 0) {
        const edges = [];
        const reducer = getReducer("OBSERVATION");
        let filterCount, resultCount, limit, offset, limitSize, offsetSize;
        limitSize = limit = (args.first === undefined ? response.length : args.first) ;
        offsetSize = offset = (args.offset === undefined ? 0 : args.offset) ;
        filterCount = 0;
        let observationList ;
        if (args.orderedBy !== undefined ) {
          observationList = response.sort(compareValues(args.orderedBy, args.orderMode ));
        } else {
          observationList = response;
        }

        if (offset > observationList.length) return null;

        // for each Risk in the result set
        for (let observation of observationList) {
          // skip down past the offset
          if (offset) {
            offset--
            continue
          }

          if (observation.id === undefined || observation.id == null ) {
            console.log(`[CYIO] CONSTRAINT-VIOLATION: (${dbName}) ${observation.iri} missing field 'id'; skipping`);
            continue;
          }

          // filter out non-matching entries if a filter is to be applied
          if ('filters' in args && args.filters != null && args.filters.length > 0) {
            if (!filterValues(observation, args.filters, args.filterMode) ) {
              continue
            }
            filterCount++;
          }

          // if haven't reached limit to be returned
          if (limit) {
            let edge = {
              cursor: observation.iri,
              node: reducer(observation),
            }
            edges.push(edge)
            limit--;
          }
        }
        // check if there is data to be returned
        if (edges.length === 0 ) return null;
        let hasNextPage = false, hasPreviousPage = false;
        resultCount = observationList.length;
        if (edges.length < resultCount) {
          if (edges.length === limitSize && filterCount <= limitSize ) {
            hasNextPage = true;
            if (offsetSize > 0) hasPreviousPage = true;
          }
          if (edges.length <= limitSize) {
            if (filterCount !== edges.length) hasNextPage = true;
            if (filterCount > 0 && offsetSize > 0) hasPreviousPage = true;
          }
        }
        return {
          pageInfo: {
            startCursor: edges[0].cursor,
            endCursor: edges[edges.length-1].cursor,
            hasNextPage: (hasNextPage ),
            hasPreviousPage: (hasPreviousPage),
            globalCount: resultCount,
          },
          edges: edges,
        }
      } else {
        // Handle reporting Stardog Error
        if (typeof (response) === 'object' && 'body' in response) {
          throw new UserInputError(response.statusText, {
            error_details: (response.body.message ? response.body.message : response.body),
            error_code: (response.body.code ? response.body.code : 'N/A')
          });
        } else {
          return null;
        }
      }
    },
    observation: async (_, {id}, { dbName, dataSources, selectMap }) => {
      const sparqlQuery = selectObservationQuery(id, selectMap.getNode("observation"));
      let response;
      try {
        response = await dataSources.Stardog.queryById({
          dbName,
          sparqlQuery,
          queryId: "Select Observation",
          singularizeSchema
        });
      } catch (e) {
        console.log(e)
        throw e
      }

      if (response === undefined) return null;
      if (Array.isArray(response) && response.length > 0) {
        const reducer = getReducer("OBSERVATION");
        return reducer(response[0]);  
      } else {
        // Handle reporting Stardog Error
        if (typeof (response) === 'object' && 'body' in response) {
          throw new UserInputError(response.statusText, {
            error_details: (response.body.message ? response.body.message : response.body),
            error_code: (response.body.code ? response.body.code : 'N/A')
          });
        } else {
          return null;
        }
      }
    }
  },
  Mutation: {
    createObservation: async ( _, {poamId, resultId, input}, {dbName, selectMap, dataSources} ) => {
      // TODO: WORKAROUND to remove input fields with null or empty values so creation will work
      for (const [key, value] of Object.entries(input)) {
        if (Array.isArray(input[key]) && input[key].length === 0) {
          delete input[key];
          continue;
        }
        if (value === null || value.length === 0) {
          delete input[key];
        }
      }
      // END WORKAROUND

      // Ensure either the ID of either a POAM or a Assessment Result is supplied
      if (poamId === undefined && resultId === undefined) {
        // Default to the POAM
        poamId = '22f2ad37-4f07-5182-bf4e-59ea197a73dc';
      }

      // Setup to handle embedded objects to be created
      let evidence, origins, subjects;
      if (input.relevant_evidence !== undefined) {
        evidence = input.relevant_evidence;
        delete input.relevant_evidence;
      }
      if (input.origins !== undefined) {
        origins = input.origins;
        delete input.origins;
      }
      if (input.subjects !== undefined) {
        subjects = input.subjects;
        delete input.subjects;
      }

      // create the Observation
      const {iri, id, query} = insertObservationQuery(input);
      await dataSources.Stardog.create({
        dbName,
        sparqlQuery: query,
        queryId: "Create Observation"
      });

      // attach the Observation to the supplied POAM
      if (poamId !== undefined && poamId !== null) {
        const attachQuery = attachToPOAMQuery(poamId, 'observations', iri );
        try {
          await dataSources.Stardog.create({
            dbName,
            queryId: "Add Observation to POAM",
            sparqlQuery: attachQuery
          });
        } catch (e) {
          console.log(e)
          throw e
        }
      }

      // create any evidence supplied and attach them to the Observation
      if (evidence !== undefined && evidence !== null){
        // create the Evidence
        const { evidenceIris, query } = insertEvidencesQuery( evidence );
        try {
          await dataSources.Stardog.create({
            dbName,
            sparqlQuery: query,
            queryId: "Create Evidence of Observation"
          });
        } catch (e) {
          console.log(e)
          throw e
        }

        // attach Evidence to the Observation
        const evidenceAttachQuery = attachToObservationQuery(id, 'relevant_evidence', evidenceIris );
        try {
          await dataSources.Stardog.create({
            dbName,
            queryId: "Add Evidence to Observation",
            sparqlQuery: evidenceAttachQuery
          });
        } catch (e) {
          console.log(e)
          throw e
        }
      }

      // create any origins supplied and attach them to the Characterization
      if (origins !== undefined && origins !== null ) {
        // create the origin
        // attach origin ot the Characterization
      }

      // create any Subjects supplied and attach them to the Characterization
      if (subjects !== undefined && subjects !== null ) {
        // create the subject
        // attach subject ot the Characterization
      }

      // retrieve information about the newly created Observation to return to the user
      const select = selectObservationQuery(id, selectMap.getNode("createObservation"));
      let response;
      try {
        response = await dataSources.Stardog.queryById({
          dbName,
          sparqlQuery: select,
          queryId: "Select Observation",
          singularizeSchema
        });
      } catch (e) {
        console.log(e)
        throw e
      }
      const reducer = getReducer("OBSERVATION");
      return reducer(response[0]);
    },
    deleteObservation: async ( _, {poamId, _resultId, id}, {dbName, dataSources} ) => {
      // Ensure either the ID of either a POAM or a Assessment Result is supplied
      if (poamId === undefined && resultId === undefined) {
        // Default to the POAM
        poamId = '22f2ad37-4f07-5182-bf4e-59ea197a73dc';
      }

      // check that the observation exists
      const sparqlQuery = selectObservationQuery(id, null);
      let response;
      try {
        response = await dataSources.Stardog.queryById({
          dbName,
          sparqlQuery,
          queryId: "Select Observation",
          singularizeSchema
        });
      } catch (e) {
        console.log(e)
        throw e
      }

      if (response.length === 0) throw new UserInputError(`Entity does not exist with ID ${id}`);
      let reducer = getReducer("OBSERVATION");
      const observation = (reducer(response[0]));

      // Delete any attached evidence
      if (observation.hasOwnProperty('relevant_evidence_iri')) {
        for (const evidenceIri of observation.relevant_evidence_iri) {
          const evidenceQuery = deleteEvidenceByIriQuery(evidenceIri);
          try {
            await dataSources.Stardog.delete({
              dbName,
              sparqlQuery: evidenceQuery,
              queryId: "Delete the Evidence from the Observation"
            });
          } catch (e) {
            console.log(e)
            throw e
          }
        }
      }
      // Delete any attached origins
      if (observation.hasOwnProperty('origins_iri')) {
        for (const originIri of observation.origins_iri) {
          const originQuery = deleteOriginByIriQuery(originIri);
          try {
            await dataSources.Stardog.delete({
              dbName,
              sparqlQuery: originQuery,
              queryId: "Delete Origin from Observation"
            });
          } catch (e) {
            console.log(e)
            throw e
          }    
        }
      }

      // Delete any attached subjects
      if (observation.hasOwnProperty('subjects_iri')) {
        for (const subjectIri of observation.subjects_iri) {
          const subjectQuery = deleteSubjectByIriQuery(subjectIri);
          try {
            await dataSources.Stardog.delete({
              dbName,
              sparqlQuery: subjectQuery,
              queryId: "Delete Subject from Observation"
            });
          } catch (e) {
            console.log(e)
            throw e
          }    
        }
      }

      // Detach the Observation from the supplied POAM
      if (poamId !== undefined && poamId !== null) {
        const attachQuery = detachFromPOAMQuery(poamId, 'observations', observation.iri );
        try {
          await dataSources.Stardog.create({
            dbName,
            queryId: "Detaching Observation from POAM",
            sparqlQuery: attachQuery
          });
        } catch (e) {
          console.log(e)
          throw e
        }
      }

      // Delete the Observation itself
      const query = deleteObservationQuery(id);
      try {
        await dataSources.Stardog.delete({
          dbName,
          sparqlQuery: query,
          queryId: "Delete Observation"
        });
      } catch (e) {
        console.log(e)
        throw e
      }
      return id;
    },
    editObservation: async (_, {id, input}, {dbName, dataSources, selectMap}) => {
      // check that the object to be edited exists with the predicates - only get the minimum of data
      let editSelect = ['id'];
      for (let editItem of input) {
        editSelect.push(editItem.key);
      }
      const sparqlQuery = selectObservationQuery(id, editSelect );
      let response = await dataSources.Stardog.queryById({
        dbName,
        sparqlQuery,
        queryId: "Select Observation",
        singularizeSchema
      })
      if (response.length === 0) throw new UserInputError(`Entity does not exist with ID ${id}`);

      // TODO: WORKAROUND to handle UI where it DOES NOT provide an explicit operation
      for (let editItem of input) {
        if (!response[0].hasOwnProperty(editItem.key)) editItem.operation = 'add';
      }
      // END WORKAROUND

      const query = updateQuery(
        `http://csrc.nist.gov/ns/oscal/assessment/common#Observation-${id}`,
        "http://csrc.nist.gov/ns/oscal/assessment/common#Observation",
        input,
        observationPredicateMap
      )
      await dataSources.Stardog.edit({
        dbName,
        sparqlQuery: query,
        queryId: "Update Observation"
      });
      const select = selectObservationQuery(id, selectMap.getNode("editObservation"));
      const result = await dataSources.Stardog.queryById({
        dbName,
        sparqlQuery: select,
        queryId: "Select Observation",
        singularizeSchema
      });
      const reducer = getReducer("OBSERVATION");
      return reducer(result[0]);
    },
  },
  // field-level resolvers
  Observation: {
    labels: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.labels_iri === undefined) return [];
      let iriArray = parent.labels_iri;
      const results = [];
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const reducer = getGlobalReducer("LABEL");
        for (let iri of iriArray) {
          if (iri === undefined || !iri.includes('Label')) {
            continue;
          }
          const sparqlQuery = selectLabelByIriQuery(iri, selectMap.getNode("labels"));
          let response;
          try {
            response = await dataSources.Stardog.queryById({
              dbName,
              sparqlQuery,
              queryId: "Select Label",
              singularizeSchema
            });
          } catch (e) {
            console.log(e)
            throw e
          }
          if (response === undefined) return [];
          if (Array.isArray(response) && response.length > 0) {
            results.push(reducer(response[0]))
          }
          else {
            // Handle reporting Stardog Error
            if (typeof (response) === 'object' && 'body' in response) {
              throw new UserInputError(response.statusText, {
                error_details: (response.body.message ? response.body.message : response.body),
                error_code: (response.body.code ? response.body.code : 'N/A')
              });
            }
          }  
        }
        return results;
      } else {
        return [];
      }
    },
    links: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.links_iri === undefined) return [];
      let iriArray = parent.links_iri;
      const results = [];
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const reducer = getGlobalReducer("EXTERNAL-REFERENCE");
        for (let iri of iriArray) {
          if (iri === undefined || !iri.includes('ExternalReference')) {
            continue;
          }
          const sparqlQuery = selectExternalReferenceByIriQuery(iri, selectMap.getNode("links"));
          let response;
          try {
            response = await dataSources.Stardog.queryById({
              dbName,
              sparqlQuery,
              queryId: "Select Link",
              singularizeSchema
            });
          } catch (e) {
            console.log(e)
            throw e
          }
          if (response === undefined) return [];
          if (Array.isArray(response) && response.length > 0) {
            results.push(reducer(response[0]))
          }
          else {
            // Handle reporting Stardog Error
            if (typeof (response) === 'object' && 'body' in response) {
              throw new UserInputError(response.statusText, {
                error_details: (response.body.message ? response.body.message : response.body),
                error_code: (response.body.code ? response.body.code : 'N/A')
              });
            }
          }  
        }
        return results;
      } else {
        return [];
      }
    },
    remarks: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.remarks_iri === undefined) return [];
      let iriArray = parent.remarks_iri;
      const results = [];
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const reducer = getGlobalReducer("NOTE");
        for (let iri of iriArray) {
          if (iri === undefined || !iri.includes('Note')) {
            continue;
          }
          const sparqlQuery = selectNoteByIriQuery(iri, selectMap.getNode("remarks"));
          let response;
          try {
            response = await dataSources.Stardog.queryById({
              dbName,
              sparqlQuery,
              queryId: "Select Note",
              singularizeSchema
            });
          } catch (e) {
            console.log(e)
            throw e
          }
          if (response === undefined) return [];
          if (Array.isArray(response) && response.length > 0) {
            results.push(reducer(response[0]))
          }
          else {
            // Handle reporting Stardog Error
            if (typeof (response) === 'object' && 'body' in response) {
              throw new UserInputError(response.statusText, {
                error_details: (response.body.message ? response.body.message : response.body),
                error_code: (response.body.code ? response.body.code : 'N/A')
              });
            }
          }  
        }
        return results;
      } else {
        return [];
      }
    },
    origins:async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.origins_iri === undefined) return [];
      let iriArray = parent.origins_iri;
      const results = [];
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const reducer = getReducer("ORIGIN");
        for (let iri of iriArray) {
          if (iri === undefined || !iri.includes('Origin')) {
            continue;
          }
          const sparqlQuery = selectOriginByIriQuery(iri, selectMap.getNode("origins"));
          let response;
          try {
            response = await dataSources.Stardog.queryById({
              dbName,
              sparqlQuery,
              queryId: "Select Origin",
              singularizeSchema
            });
          } catch (e) {
            console.log(e)
            throw e
          }
          if (response === undefined) return [];
          if (Array.isArray(response) && response.length > 0) {
            results.push(reducer(response[0]))
          }
          else {
            // Handle reporting Stardog Error
            if (typeof (response) === 'object' && 'body' in response) {
              throw new UserInputError(response.statusText, {
                error_details: (response.body.message ? response.body.message : response.body),
                error_code: (response.body.code ? response.body.code : 'N/A')
              });
            }
          }  
        }
        return results;
      } else {
        return [];
      }
    },
    subjects: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.subjects_iri === undefined) return [];
      let iriArray = parent.subjects_iri;
      const results = [];
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const reducer = getReducer("SUBJECT");
        for (let iri of iriArray) {
          if (iri === undefined || !iri.includes('Subject')) {
            continue;
          }
          const sparqlQuery = selectSubjectByIriQuery(iri, selectMap.getNode("subjects"));
          let response;
          try {
            response = await dataSources.Stardog.queryById({
              dbName,
              sparqlQuery,
              queryId: "Select Subject",
              singularizeSchema
            });
          } catch (e) {
            console.log(e)
            throw e
          }
          if (response === undefined) return [];
          if (Array.isArray(response) && response.length > 0) {
            if (response[0].subject_ref[0].includes('OperatingSystem')) {
              console.error(`[CYIO] INVALID-IRI: ${response[0].iri} 'subject_ref' contains an IRI ${response[0].subject_ref[0]} which is invalid; skipping`);
              continue;
            }

            results.push(reducer(response[0]))
          }
          else {
            // Handle reporting Stardog Error
            if (typeof (response) === 'object' && 'body' in response) {
              throw new UserInputError(response.statusText, {
                error_details: (response.body.message ? response.body.message : response.body),
                error_code: (response.body.code ? response.body.code : 'N/A')
              });
            }
          }  
        }
        return results;
      } else {
        return [];
      }
    },
    relevant_evidence: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.relevant_evidence_iri === undefined) return [];
      let iriArray = parent.relevant_evidence_iri;
      const results = [];
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const reducer = getReducer("EVIDENCE");
        for (let iri of iriArray) {
          if (iri === undefined || !iri.includes('Evidence')) {
            continue;
          }
          const sparqlQuery = selectEvidenceByIriQuery(iri, selectMap.getNode("relevant_evidence"));
          let response;
          try {
            response = await dataSources.Stardog.queryById({
              dbName,
              sparqlQuery,
              queryId: "Select Evidence",
              singularizeSchema
            });
          } catch (e) {
            console.log(e)
            throw e
          }
          if (response === undefined) return [];
          if (Array.isArray(response) && response.length > 0) {
            results.push(reducer(response[0]))
          }
          else {
            // Handle reporting Stardog Error
            if (typeof (response) === 'object' && 'body' in response) {
              throw new UserInputError(response.statusText, {
                error_details: (response.body.message ? response.body.message : response.body),
                error_code: (response.body.code ? response.body.code : 'N/A')
              });
            }
          }  
        }
        return results;
      } else {
        return [];
      }
    },
  }
}

export default observationResolvers;
