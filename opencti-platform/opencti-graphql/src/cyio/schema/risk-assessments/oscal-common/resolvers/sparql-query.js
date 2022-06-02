import {
  optionalizePredicate, 
  parameterizePredicate, 
  buildSelectVariables, 
  generateId, 
  OSCAL_NS
} from "../../../utils.js";

import {
  componentReducer
} from "../../component/resolvers/sparql-query.js";

import {
  inventoryItemReducer
} from "../../inventory-item/resolvers/sparql-query.js"

// TODO: Update to use objectMap capability
export const selectObjectByIriQuery = (iri, type, select) => {
  if (!iri.startsWith('<')) iri = `<${iri}>`;
  let predicateMap, className;
  switch(type) {
    case 'component':
      predicateMap = componentPredicateMap;
      className = 'Component';
      break;
    case 'inventory-item':
      predicateMap = inventoryItemPredicateMap;
      className = 'InventoryItem';
      break;
    case 'location':
      predicateMap = locationPredicateMap;
      className = 'Location';
      break;
    case 'party':
      predicateMap = partyPredicateMap;
      className = 'Party';
      break;
    case 'user':
      predicateMap = userPredicateMap;
      className = 'SystemUser';
      break;
    case 'resource':
      predicateMap = resourcePredicateMap;
      className = 'Resource';
      break;
    default:
      break;
  }

  if (select === undefined || select === null) select = Object.keys(predicateMap);
  const { selectionClause, predicates } = buildSelectVariables(predicateMap, select);
  return `
  SELECT ${selectionClause}
  FROM <tag:stardog:api:context:local>
  WHERE {
    BIND(${iri} AS ?iri)
    ?iri a <http://csrc.nist.gov/ns/oscal/common#${className}> .
    ${predicates}
  }
  `
}

// Reducers
export function getReducer(type) {
  switch (type) {
    case 'EXTERNAL-IDENTIFIER':
      return externalIdentifierReducer;
    case 'LOCATION':
      return oscalLocationReducer;
    case 'PARTY':
      return oscalPartyReducer;
    case 'ROLE':
      return oscalRoleReducer;
    case 'RESPONSIBLE-PARTY':
      return oscalResponsiblePartyReducer;
    case 'COMPONENT':
      return componentReducer;
    case 'INVENTORY-ITEM':
      return inventoryItemReducer;
    case 'RESOURCE':
    case 'USER':
    default:
      throw new Error(`Unsupported reducer type ' ${type}'`)
  }
}
export const externalIdentifierReducer = (item) => {
  // if no object type was returned, compute the type from the IRI
  if ( item.object_type === undefined ) {
    item.object_type = 'external-identifier';
  }
  return {
    id: item.id,
    standard_id: item.id,
    ...(item.object_type && {entity_type: item.object_type}),
    ...(item.scheme && {scheme: item.scheme}),
    ...(item.identifier && {identifier: item.identifier}),
  }
}
export const oscalLocationReducer = (item) => {
  // if no object type was returned, compute the type from the IRI
  if ( item.object_type === undefined ) {
    item.object_type = 'oscal-location';
  }

  return {
    id: item.id,
    standard_id: item.id,
    ...(item.object_type && {entity_type: item.object_type}),
    ...(item.created && {created: item.created}),
    ...(item.modified && {modified: item.modified}),
    ...(item.labels && {labels_iri: item.labels}),
    ...(item.links && {links_iri: item.links}),
    ...(item.remarks && {remarks_iri: item.remarks}),
    ...(item.relationships && {relationship_iri: item.relationships}),
    // Oscal Location
    ...(item.name && {name: item.name}),
    ...(item.description &&  {description: item.description}),
    ...(item.location_type && {location_type: item.location_type}),
    ...(item.location_class && {location_class: item.location_class}),
    ...(item.address && {address_iri: item.address}),
    ...(item.email_addresses && {email_addresses: item.email_addresses}),
    ...(item.telephone_numbers && {telephone_numbers_iri: item.telephone_numbers}),
    ...(item.urls && {urls: item.urls}),
  }

}
export const oscalPartyReducer = (item) => {
  // if no object type was returned, compute the type from the IRI
  if ( item.object_type === undefined ) {
    item.object_type = 'oscal-party';
  }

  return {
    id: item.id,
    standard_id: item.id,
    ...(item.object_type && {entity_type: item.object_type}),
    ...(item.created && {created: item.created}),
    ...(item.modified && {modified: item.modified}),
    ...(item.labels && {labels_iri: item.labels}),
    ...(item.links && {links_iri: item.links}),
    ...(item.remarks && {remarks_iri: item.remarks}),
    ...(item.relationships && {relationship_iri: item.relationships}),
    ...(item.party_type && {party_type: item.party_type}),
    ...(item.name && {name: item.name}),
    ...(item.short_name && {short_name: item.short_name}),
    ...(item.description &&  {description: item.description}),
    ...(item.external_identifiers && {external_identifiers_iri: item.external_identifiers}),
    ...(item.addresses && {addresses_iri: item.addresses}),
    ...(item.email_addresses && {email_addresses: item.email_addresses}),
    ...(item.telephone_numbers && {telephone_numbers_iri: item.telephone_numbers}),
    ...(item.locations && {locations_iri: item.locations}),
    ...(item.mail_stop && {mail_stop: item.mail_stop}),
    ...(item.office && {office: item.office}),
    ...(item.member_of_organizations && {member_of_organizations_iri: item.member_of_organizations}),
    ...(item.job_title && {job_title: item.job_title}),
  }
}
export const oscalResponsiblePartyReducer = (item) => {
  // if no object type was returned, compute the type from the IRI
  if ( item.object_type === undefined ) {
    item.object_type = 'oscal-responsible-party';
  }

  return {
    id: item.id,
    standard_id: item.id,
    ...(item.object_type && {entity_type: item.object_type}),
    ...(item.labels && {labels_iri: item.labels}),
    ...(item.links && {links_iri: item.links}),
    ...(item.remarks && {remarks_iri: item.remarks}),
    ...(item.relationships && {relationship_iri: item.relationships}),
    // Oscal Responsible Party
    ...(item.role &&  {role_iri: item.role}),
    ...(item.parties && {parties_iri: item.parties}),
    // DarkLight extensions
    ...(item.name && {name: item.name}),
    ...(item.description &&  {description: item.description}),
  }
}
export const oscalRoleReducer = (item) => {
  // if no object type was returned, compute the type from the IRI
  if ( item.object_type === undefined ) {
    item.object_type = 'oscal-role';
  }

  return {
    id: item.id,
    standard_id: item.id,
    ...(item.object_type && {entity_type: item.object_type}),
    ...(item.created && {created: item.created}),
    ...(item.modified && {modified: item.modified}),
    ...(item.labels && {labels_iri: item.labels}),
    ...(item.links && {links_iri: item.links}),
    ...(item.remarks && {remarks_iri: item.remarks}),
    ...(item.relationships && {relationship_iri: item.relationships}),
    // Oscal hasRole
    ...(item.role_identifier &&  {role_identifier: item.role_identifier}),
    ...(item.name && {name: item.name}),
    ...(item.short_name && {short_name: item.short_name}),
    ...(item.description &&  {description: item.description}),
  }
}

// External Identifier resolve support functions
export const insertExternalIdentifierQuery = (propValues) => {
  const id_material = {
    ...(propValues.scheme && {"scheme": propValues.scheme}),
    ...(propValues.identifier && {"identifier": propValues.identifier}),
  } ;
  const id = generateId( id_material, OSCAL_NS );
  const iri = `<http://csrc.nist.gov/ns/oscal/common#ExternalIdentifier-${id}>`;
  const insertPredicates = Object.entries(propValues)
      .filter((propPair) => externalIdentifierPredicateMap.hasOwnProperty(propPair[0]))
      .map((propPair) => externalIdentifierPredicateMap[propPair[0]].binding(iri, propPair[1]))
      .join('. \n      ');
  const query = `
  INSERT DATA {
    GRAPH ${iri} {
      ${iri} a <http://csrc.nist.gov/ns/oscal/common#ExternalIdentifier .
      ${iri} a <http://csrc.nist.gov/ns/oscal/common#ComplexDatatype> .
      ${iri} a <http://darklight.ai/ns/common#ComplexDatatype> .
      ${iri} <http://darklight.ai/ns/common#id> "${id}" .
      ${iri} <http://darklight.ai/ns/common#object_type> "external-identifier" . 
      ${insertPredicates}
    }
  }
  `;
  return {iri, id, query}  
}
export const insertExternalIdentifiersQuery = (externalIdentifiers) => {
  const graphs = [], extIdIris = [];
  externalIdentifiers.forEach((extId) => {
    const id_material = {
      ...(extId.scheme && {"scheme": extId.scheme}),
      ...(extId.identifier && {"identifier": extId.identifier}),
    } ;
    const id = generateId( id_material, OSCAL_NS );
    const insertPredicates = [];
    const iri = `<http://csrc.nist.gov/ns/oscal/common#ExternalIdentifier-${id}>`;
    extIdIris.push(iri);
    insertPredicates.push(`${iri} a <http://csrc.nist.gov/ns/oscal/common#ExternalIdentifier>`);
    insertPredicates.push(`${iri} a <http://csrc.nist.gov/ns/oscal/common#ComplexDatatype>`);
    insertPredicates.push(`${iri} a <http://darklight.ai/ns/common#ComplexDatatype>`);
    insertPredicates.push(`${iri} <http://darklight.ai/ns/common#id> "${id}"`);
    insertPredicates.push(`${iri} <http://darklight.ai/ns/common#object_type> "external-identifier"`); 
    insertPredicates.push(`${iri} <http://csrc.nist.gov/ns/oscal/common#scheme> "${extId.scheme}"^^xsd:anyURI`);
    insertPredicates.push(`${iri} <http://csrc.nist.gov/ns/oscal/common#identifier> "${extId.identifier}"`);

    graphs.push(`
  GRAPH ${iri} {
    ${insertPredicates.join(".\n        ")}
  }
    `)
  })
  const query = `
  INSERT DATA {
    ${graphs.join("\n")}
  }`;
  return {extIdIris, query};
}
export const selectExternalIdentifierQuery = (id, select) => {
  return selectExternalIdentifierByIriQuery(`http://csrc.nist.gov/ns/oscal/common#ExternalIdentifier-${id}`, select);
}
export const selectExternalIdentifierByIriQuery = (iri, select) => {
  if (!iri.startsWith('<')) iri = `<${iri}>`;
  if (select === undefined || select === null) select = Object.keys(externalIdentifierPredicateMap);
  const { selectionClause, predicates } = buildSelectVariables(externalIdentifierPredicateMap, select);
  return `
  SELECT ${selectionClause}
  FROM <tag:stardog:api:context:local>
  WHERE {
    BIND(${iri} AS ?iri)
    ?iri a <http://csrc.nist.gov/ns/oscal/common#ExternalIdentifier> .
    ${predicates}
  }
  `
}
export const selectAllExternalIdentifiers = (select, args) => {
  if (select === undefined || select === null) select = Object.keys(externalIdentifierPredicateMap);
  if (!select.includes('id')) select.push('id');

  if (args !== undefined ) {
    if ( args.filters !== undefined ) {
      for( const filter of args.filters) {
        if (!select.hasOwnProperty(filter.key)) select.push( filter.key );
      }
    }
    
    // add value of orderedBy's key to cause special predicates to be included
    if ( args.orderedBy !== undefined ) {
      if (!select.hasOwnProperty(args.orderedBy)) select.push(args.orderedBy);
    }
  }

  const { selectionClause, predicates } = buildSelectVariables(externalIdentifierPredicateMap, select);
  return `
  SELECT DISTINCT ?iri ${selectionClause} 
  FROM <tag:stardog:api:context:local>
  WHERE {
    ?iri a <http://csrc.nist.gov/ns/oscal/common#ExternalIdentifier> . 
    ${predicates}
  }
  `
}
export const deleteExternalIdentifierQuery = (id) => {
  const iri = `http://csrc.nist.gov/ns/oscal/common#ExternalIdentifier-${id}`;
  return deleteExternalIdentifierByIriQuery(iri);
}
export const deleteExternalIdentifierByIriQuery = (iri) => {
  return `
  DELETE {
    GRAPH <${iri}> {
      ?iri ?p ?o
    }
  } WHERE {
    GRAPH <${iri}> {
      ?iri a <http://csrc.nist.gov/ns/oscal/common#ExternalIdentifier> .
      ?iri ?p ?o
    }
  }
  `
}
export const attachToExternalIdentifierQuery = (id, field, itemIris) => {
  const iri = `<http://csrc.nist.gov/ns/oscal/common#ExternalIdentifier-${id}>`;
  if (!externalIdentifierPredicateMap.hasOwnProperty(field)) return null;
  const predicate = externalIdentifierPredicateMap[field].predicate;
  let statements;
  if (Array.isArray(itemIris)) {
    statements = itemIris
      .map((itemIri) => `${iri} ${predicate} ${itemIri}`)
      .join(".\n        ")
    }
  else {
    statements = `${iri} ${predicate} ${itemIris}`;
  }
  return `
  INSERT DATA {
    GRAPH ${iri} {
      ${statements}
    }
  }
  `
}
export const detachFromExternalIdentifierQuery = (id, field, itemIris) => {
  const iri = `<http://csrc.nist.gov/ns/oscal/common#ExternalIdentifier-${id}>`;
  if (!externalIdentifierPredicateMap.hasOwnProperty(field)) return null;
  const predicate = externalIdentifierPredicateMap[field].predicate;
  let statements;
  if (Array.isArray(itemIris)) {
    statements = itemIris
      .map((itemIri) => `${iri} ${predicate} ${itemIri}`)
      .join(".\n        ")
    }
  else {
    statements = `${iri} ${predicate} ${itemIris}`;
  }
  return `
  DELETE DATA {
    GRAPH ${iri} {
      ${statements}
    }
  }
  `
}

// Location support functions
export const insertLocationQuery = (propValues) => {
  const id_material = {
    ...(propValues.name && {"name": propValues.name}),
    ...(propValues.location_type && {"location_type": propValues.location_type}),
    ...(propValues.location_class && {"location_class": propValues.location_class}),
  } ;
  const id = generateId( id_material, OSCAL_NS );
  const timestamp = new Date().toISOString()

  // determine the appropriate ontology class type
  const iri = `<http://csrc.nist.gov/ns/oscal/common#Location-${id}>`;
  const insertPredicates = [];
  Object.entries(propValues).forEach((propPair) => {
    if (locationPredicateMap.hasOwnProperty(propPair[0])) {
      if (Array.isArray(propPair[1])) {
        for (let value of propPair[1]) {
          insertPredicates.push(locationPredicateMap[propPair[0]].binding(iri, value));
        }  
      } else {
        insertPredicates.push(locationPredicateMap[propPair[0]].binding(iri, propPair[1]));
      }
    }
  });

  const query = `
  INSERT DATA {
    GRAPH ${iri} {
      ${iri} a <http://csrc.nist.gov/ns/oscal/common#Location> .
      ${iri} a <http://csrc.nist.gov/ns/oscal/common#Object> .
      ${iri} a <http://darklight.ai/ns/common#Object> .
      ${iri} <http://darklight.ai/ns/common#id> "${id}".
      ${iri} <http://darklight.ai/ns/common#object_type> "oscal-location" . 
      ${iri} <http://darklight.ai/ns/common#created> "${timestamp}"^^xsd:dateTime . 
      ${iri} <http://darklight.ai/ns/common#modified> "${timestamp}"^^xsd:dateTime . 
      ${insertPredicates.join(". \n")}
    }
  }
  `;
  return {iri, id, query}
}
export const selectLocationQuery = (id, select) => {
  return selectLocationByIriQuery(`http://csrc.nist.gov/ns/oscal/common#Location-${id}`, select);
}
export const selectLocationByIriQuery = (iri, select) => {
  if (!iri.startsWith('<')) iri = `<${iri}>`;
  if (select === undefined || select === null) select = Object.keys(locationPredicateMap);
  const { selectionClause, predicates } = buildSelectVariables(locationPredicateMap, select);
  return `
  SELECT ${selectionClause}
  FROM <tag:stardog:api:context:local>
  WHERE {
    BIND(${iri} AS ?iri)
    ?iri a <http://csrc.nist.gov/ns/oscal/common#Location> .
    ${predicates}
  }
  `
}
export const selectAllLocations = (select, args, parent) => {
  let constraintClause = '';
  if (select === undefined || select === null) select = Object.keys(locationPredicateMap);
  if (!select.includes('id')) select.push('id');

  if (args !== undefined ) {
    if ( args.filters !== undefined ) {
      for( const filter of args.filters) {
        if (!select.hasOwnProperty(filter.key)) select.push( filter.key );
      }
    }
    
    // add value of orderedBy's key to cause special predicates to be included
    if ( args.orderedBy !== undefined ) {
      if (!select.hasOwnProperty(args.orderedBy)) select.push(args.orderedBy);
    }
  }

  const { selectionClause, predicates } = buildSelectVariables(locationPredicateMap, select);
  // add constraint clause to limit to those that are referenced by the specified POAM
  if (parent !== undefined && parent.iri !== undefined) {
    let classTypeIri, predicate;
    if (parent.entity_type === 'poam') {
      classTypeIri = '<http://csrc.nist.gov/ns/oscal/common#POAM>';
      predicate = '<http://csrc.nist.gov/ns/oscal/common#locations>';
    }
    // define a constraint to limit retrieval to only those referenced by the parent
    constraintClause = `
    {
      SELECT DISTINCT ?iri
      WHERE {
          <${parent.iri}> a ${classTypeIri} ;
            ${predicate} ?iri .
      }
    }
    `;
  }

  return `
  SELECT DISTINCT ?iri ${selectionClause} 
  FROM <tag:stardog:api:context:local>
  WHERE {
    ?iri a <http://csrc.nist.gov/ns/oscal/common#Location> . 
    ${predicates}
    ${constraintClause}
  }
  `
}
export const deleteLocationQuery = (id) => {
  const iri = `http://csrc.nist.gov/ns/oscal/common#Location-${id}`;
  return deleteLocationByIriQuery(iri);
}
export const deleteLocationByIriQuery = (iri) => {
  return `
  DELETE {
    GRAPH <${iri}> {
      ?iri ?p ?o
    }
  } WHERE {
    GRAPH <${iri}> {
      ?iri a <http://csrc.nist.gov/ns/oscal/common#Location> .
      ?iri ?p ?o
    }
  }
  `
}
export const attachToLocationQuery = (id, field, itemIris) => {
  const iri = `<http://csrc.nist.gov/ns/oscal/common#Location-${id}>`;
  if (!locationPredicateMap.hasOwnProperty(field)) return null;
  const predicate = locationPredicateMap[field].predicate;
  let statements;
  if (Array.isArray(itemIris)) {
    statements = itemIris
      .map((itemIri) => `${iri} ${predicate} ${itemIri}`)
      .join(".\n        ")
    }
  else {
    statements = `${iri} ${predicate} ${itemIris}`;
  }
  return `
  INSERT DATA {
    GRAPH ${iri} {
      ${statements}
    }
  }
  `
}
export const detachFromLocationQuery = (id, field, itemIris) => {
  const iri = `<http://csrc.nist.gov/ns/oscal/common#Location-${id}>`;
  if (!locationPredicateMap.hasOwnProperty(field)) return null;
  const predicate = locationPredicateMap[field].predicate;
  let statements;
  if (Array.isArray(itemIris)) {
    statements = itemIris
      .map((itemIri) => `${iri} ${predicate} ${itemIri}`)
      .join(".\n        ")
    }
  else {
    statements = `${iri} ${predicate} ${itemIris}`;
  }
  return `
  DELETE DATA {
    GRAPH ${iri} {
      ${statements}
    }
  }
  `
}

// Party support functions
export const insertPartyQuery = (propValues) => {
  const id_material = {
    ...(propValues.name && {"name": propValues.name}),
    ...(propValues.party_type && {"party_type": propValues.party_type}),
    ...(propValues.short_name && {"short_name": propValues.short_name}),
  } ;
  const id = generateId( id_material, OSCAL_NS );
  const timestamp = new Date().toISOString()

  // determine the appropriate ontology class type
  const iriType = propValues.party_type.charAt(0).toUpperCase() + propValues.party_type.slice(1);
  const iri = `<http://csrc.nist.gov/ns/oscal/common#Party-${id}>`;
  const insertPredicates = Object.entries(propValues)
      .filter((propPair) => partyPredicateMap.hasOwnProperty(propPair[0]))
      .map((propPair) => partyPredicateMap[propPair[0]].binding(iri, propPair[1]))
      .join('. \n      ');
  const query = `
  INSERT DATA {
    GRAPH ${iri} {
      ${iri} a <http://csrc.nist.gov/ns/oscal/common#${iriType}> .
      ${iri} a <http://csrc.nist.gov/ns/oscal/common#Party> .
      ${iri} a <http://csrc.nist.gov/ns/oscal/common#Object> .
      ${iri} a <http://darklight.ai/ns/common#Object> .
      ${iri} <http://darklight.ai/ns/common#id> "${id}".
      ${iri} <http://darklight.ai/ns/common#object_type> "oscal-party" . 
      ${iri} <http://darklight.ai/ns/common#created> "${timestamp}"^^xsd:dateTime . 
      ${iri} <http://darklight.ai/ns/common#modified> "${timestamp}"^^xsd:dateTime . 
      ${insertPredicates}
    }
  }
  `;
  return {iri, id, query}
}
export const selectPartyQuery = (id, select) => {
  return selectPartyByIriQuery(`http://csrc.nist.gov/ns/oscal/common#Party-${id}`, select);
}
export const selectPartyByIriQuery = (iri, select) => {
  if (!iri.startsWith('<')) iri = `<${iri}>`;
  if (select === undefined || select === null) select = Object.keys(partyPredicateMap);
  const { selectionClause, predicates } = buildSelectVariables(partyPredicateMap, select);
  return `
  SELECT ${selectionClause}
  FROM <tag:stardog:api:context:local>
  WHERE {
    BIND(${iri} AS ?iri)
    ?iri a <http://csrc.nist.gov/ns/oscal/common#Party> .
    ${predicates}
  }
  `
}
export const selectAllParties = (select, args, parent) => {
  let constraintClause = '';
  if (select === undefined || select === null) select = Object.keys(partyPredicateMap);
  if (!select.includes('id')) select.push('id');

  if (args !== undefined ) {
    if ( args.filters !== undefined ) {
      for( const filter of args.filters) {
        if (!select.hasOwnProperty(filter.key)) select.push( filter.key );
      }
    }
    
    // add value of orderedBy's key to cause special predicates to be included
    if ( args.orderedBy !== undefined ) {
      if (!select.hasOwnProperty(args.orderedBy)) select.push(args.orderedBy);
    }
  }

  const { selectionClause, predicates } = buildSelectVariables(partyPredicateMap, select);
  // add constraint clause to limit to those that are referenced by the specified POAM
  if (parent !== undefined && parent.iri !== undefined) {
    let classTypeIri, predicate;
    if (parent.entity_type === 'poam') {
      classTypeIri = '<http://csrc.nist.gov/ns/oscal/common#POAM>';
      predicate = '<http://csrc.nist.gov/ns/oscal/common#parties>';
    }
    // define a constraint to limit retrieval to only those referenced by the parent
    constraintClause = `
    {
      SELECT DISTINCT ?iri
      WHERE {
          <${parent.iri}> a ${classTypeIri} ;
            ${predicate} ?iri .
      }
    }
    `;
  }
  
  return `
  SELECT DISTINCT ?iri ${selectionClause} 
  FROM <tag:stardog:api:context:local>
  WHERE {
    ?iri a <http://csrc.nist.gov/ns/oscal/common#Party> . 
    ${predicates}
    ${constraintClause}
  }
  `
}
export const deletePartyQuery = (id) => {
  const iri = `http://csrc.nist.gov/ns/oscal/common#Party-${id}`;
  return deletePartyByIriQuery(iri);
}
export const deletePartyByIriQuery = (iri) => {
  return `
  DELETE {
    GRAPH <${iri}> {
      ?iri ?p ?o
    }
  } WHERE {
    GRAPH <${iri}> {
      ?iri a <http://csrc.nist.gov/ns/oscal/common#Party> .
      ?iri ?p ?o
    }
  }
  `
}
export const attachToPartyQuery = (id, field, itemIris) => {
  const iri = `<http://csrc.nist.gov/ns/oscal/common#Party-${id}>`;
  if (!partyPredicateMap.hasOwnProperty(field)) return null;
  const predicate = partyPredicateMap[field].predicate;
  let statements;
  if (Array.isArray(itemIris)) {
    statements = itemIris
      .map((itemIri) => `${iri} ${predicate} ${itemIri}`)
      .join(".\n        ")
    }
  else {
    statements = `${iri} ${predicate} ${itemIris}`;
  }
  return `
  INSERT DATA {
    GRAPH ${iri} {
      ${statements}
    }
  }
  `
}
export const detachFromPartyQuery = (id, field, itemIris) => {
  const iri = `<http://csrc.nist.gov/ns/oscal/common#Party-${id}>`;
  if (!partyPredicateMap.hasOwnProperty(field)) return null;
  const predicate = partyPredicateMap[field].predicate;
  let statements;
  if (Array.isArray(itemIris)) {
    statements = itemIris
      .map((itemIri) => `${iri} ${predicate} ${itemIri}`)
      .join(".\n        ")
    }
  else {
    statements = `${iri} ${predicate} ${itemIris}`;
  }
  return `
  DELETE DATA {
    GRAPH ${iri} {
      ${statements}
    }
  }
  `
}

// Responsible Party support functions
export const insertResponsiblePartyQuery = (propValues) => {
  const id_material = {
    ...(propValues.role && {"role": propValues.role}),
  } ;
  const id = generateId( id_material, OSCAL_NS );
  const iri = `<http://csrc.nist.gov/ns/oscal/common#ResponsibleParty-${id}>`;

  // remove role and parties so predicates don't get generated
  if ('role' in propValues) delete propValues.role;
  if ('parties' in propValues) delete propValues.parties;

  const insertPredicates = Object.entries(propValues)
      .filter((propPair) => responsiblePartyPredicateMap.hasOwnProperty(propPair[0]))
      .map((propPair) => responsiblePartyPredicateMap[propPair[0]].binding(iri, propPair[1]))
      .join('. \n      ');
  const query = `
  INSERT DATA {
    GRAPH ${iri} {
      ${iri} a <http://csrc.nist.gov/ns/oscal/common#ResponsibleParty> .
      ${iri} a <http://csrc.nist.gov/ns/oscal/common#ComplexDatatype> .
      ${iri} a <http://darklight.ai/ns/common#ComplexDatatype> .
      ${iri} <http://darklight.ai/ns/common#id> "${id}".
      ${iri} <http://darklight.ai/ns/common#object_type> "oscal-responsible-party" . 
      ${insertPredicates}
    }
  }
  `;
  return {iri, id, query}
}
export const selectResponsiblePartyQuery = (id, select) => {
  return selectResponsiblePartyByIriQuery(`http://csrc.nist.gov/ns/oscal/common#ResponsibleParty-${id}`, select);
}
export const selectResponsiblePartyByIriQuery = (iri, select) => {
  if (!iri.startsWith('<')) iri = `<${iri}>`;
  if (select === undefined || select === null) select = Object.keys(responsiblePartyPredicateMap);
  const { selectionClause, predicates } = buildSelectVariables(responsiblePartyPredicateMap, select);
  return `
  SELECT ${selectionClause}
  FROM <tag:stardog:api:context:local>
  WHERE {
    BIND(${iri} AS ?iri)
    ?iri a <http://csrc.nist.gov/ns/oscal/common#ResponsibleParty> .
    ${predicates}
  }
  `
}
export const selectAllResponsibleParties = (select, args, parent) => {
  let constraintClause = '';
  if (select === undefined || select === null) select = Object.keys(responsiblePartyPredicateMap);
  if (!select.includes('id')) select.push('id');

  if (args !== undefined ) {
    if ( args.filters !== undefined ) {
      for( const filter of args.filters) {
        if (!select.hasOwnProperty(filter.key)) select.push( filter.key );
      }
    }
    
    // add value of orderedBy's key to cause special predicates to be included
    if ( args.orderedBy !== undefined ) {
      if (!select.hasOwnProperty(args.orderedBy)) select.push(args.orderedBy);
    }
  }

  const { selectionClause, predicates } = buildSelectVariables(responsiblePartyPredicateMap, select);
  // add constraint clause to limit to those that are referenced by the specified POAM
  if (parent !== undefined && parent.iri !== undefined) {
    let classTypeIri, predicate;
    if (parent.entity_type === 'poam') {
      classTypeIri = '<http://csrc.nist.gov/ns/oscal/common#POAM>';
      predicate = '<http://csrc.nist.gov/ns/oscal/common#responsible_parties>';
    }
    // define a constraint to limit retrieval to only those referenced by the parent
    constraintClause = `
    {
      SELECT DISTINCT ?iri
      WHERE {
          <${parent.iri}> a ${classTypeIri} ;
            ${predicate} ?iri .
      }
    }
    `;
  }

  return `
  SELECT DISTINCT ?iri ${selectionClause} 
  FROM <tag:stardog:api:context:local>
  WHERE {
    ?iri a <http://csrc.nist.gov/ns/oscal/common#ResponsibleParty> . 
    ${predicates}
    ${constraintClause}
  }
  `
}
export const deleteResponsiblePartyQuery = (id) => {
  const iri = `http://csrc.nist.gov/ns/oscal/common#ResponsibleParty-${id}`;
  return deleteResponsiblePartyByIriQuery(iri);
}
export const deleteResponsiblePartyByIriQuery = (iri) => {
  return `
  DELETE {
    GRAPH <${iri}> {
      ?iri ?p ?o
    }
  } WHERE {
    GRAPH <${iri}> {
      ?iri a <http://csrc.nist.gov/ns/oscal/common#ResponsibleParty> .
      ?iri ?p ?o
    }
  }
  `
}
export const attachToResponsiblePartyQuery = (id, field, itemIris) => {
  const iri = `<http://csrc.nist.gov/ns/oscal/common#ResponsibleParty-${id}>`;
  if (!responsiblePartyPredicateMap.hasOwnProperty(field)) return null;
  const predicate = responsiblePartyPredicateMap[field].predicate;
  let statements;
  if (Array.isArray(itemIris)) {
    statements = itemIris
      .map((itemIri) => `${iri} ${predicate} ${itemIri}`)
      .join(".\n        ")
    }
  else {
    statements = `${iri} ${predicate} ${itemIris}`;
  }
  return `
  INSERT DATA {
    GRAPH ${iri} {
      ${statements}
    }
  }
  `
}
export const detachFromResponsiblePartyQuery = (id, field, itemIris) => {
  const iri = `<http://csrc.nist.gov/ns/oscal/common#ResponsibleParty-${id}>`;
  if (!responsiblePartyPredicateMap.hasOwnProperty(field)) return null;
  const predicate = responsiblePartyPredicateMap[field].predicate;
  let statements;
  if (Array.isArray(itemIris)) {
    statements = itemIris
      .map((itemIri) => `${iri} ${predicate} ${itemIri}`)
      .join(".\n        ")
    }
  else {
    statements = `${iri} ${predicate} ${itemIris}`;
  }
  return `
  DELETE DATA {
    GRAPH ${iri} {
      ${statements}
    }
  }
  `
}

// Role support functions
export const insertRoleQuery = (propValues) => {
  const id_material = {
    ...(propValues.role_identifier && {"role_identifier": propValues.role_identifier}),
  } ;
  const id = generateId( id_material, OSCAL_NS );
  const timestamp = new Date().toISOString();

  // escape any special characters (e.g., newline)
  if (propValues.description !== undefined) {
    if (propValues.description.includes('\n')) propValues.description = propValues.description.replace(/\n/g, '\\n');
    if (propValues.description.includes('\"')) propValues.description = propValues.description.replace(/\"/g, '\\"');
    if (propValues.description.includes("\'")) propValues.description = propValues.description.replace(/\'/g, "\\'");
  }

  const iri = `<http://csrc.nist.gov/ns/oscal/common#Role-${id}>`;
  const insertPredicates = Object.entries(propValues)
      .filter((propPair) => rolePredicateMap.hasOwnProperty(propPair[0]))
      .map((propPair) => rolePredicateMap[propPair[0]].binding(iri, propPair[1]))
      .join('. \n      ');
  const query = `
  INSERT DATA {
    GRAPH ${iri} {
      ${iri} a <http://csrc.nist.gov/ns/oscal/common#Role> .
      ${iri} a <http://csrc.nist.gov/ns/oscal/common#Object> .
      ${iri} a <http://darklight.ai/ns/common#Object> .
      ${iri} <http://darklight.ai/ns/common#id> "${id}".
      ${iri} <http://darklight.ai/ns/common#object_type> "oscal-role" . 
      ${iri} <http://darklight.ai/ns/common#created> "${timestamp}"^^xsd:dateTime . 
      ${iri} <http://darklight.ai/ns/common#modified> "${timestamp}"^^xsd:dateTime . 
      ${insertPredicates}
    }
  }
  `;
  return {iri, id, query}
}
export const insertRolesQuery = (roles) => {
  const graphs = [], roleIris = [];
  roles.forEach((role) => {
    const id_material = {
      ...(role.role_identifier && {"role_identifier": role.role_identifier}),
    } ;
    const id = generateId( id_material, OSCAL_NS );
    const timestamp = new Date().toISOString();

    // escape any special characters (e.g., newline)
    if (role.description !== undefined) {
      if (role.description.includes('\n')) role.description = role.description.replace(/\n/g, '\\n');
      if (role.description.includes('\"')) role.description = role.description.replace(/\"/g, '\\"');
      if (role.description.includes("\'")) role.description = role.description.replace(/\'/g, "\\'");
    }
  
    const insertPredicates = [];
    const iri = `<http://csrc.nist.gov/ns/oscal/common#Role-${id}>`;
    roleIris.push(iri);
    insertPredicates.push(`${iri} a <http://csrc.nist.gov/ns/oscal/common#Role>`);
    insertPredicates.push(`${iri} a <http://csrc.nist.gov/ns/oscal/common#Object>`);
    insertPredicates.push(`${iri} a <http://darklight.ai/ns/common#Object>`);
    insertPredicates.push(`${iri} <http://darklight.ai/ns/common#id> "${id}"`);
    insertPredicates.push(`${iri} <http://darklight.ai/ns/common#object_type> "oscal-role"`); 
    insertPredicates.push(`${iri} <http://darklight.ai/ns/common#created> "${timestamp}"^^xsd:dateTime`);
    insertPredicates.push(`${iri} <http://darklight.ai/ns/common#modified> "${timestamp}"^^xsd:dateTime`);
    insertPredicates.push(`${iri} <http://csrc.nist.gov/ns/oscal/common#role_identifier> "${role.role_identifier}"`);
    insertPredicates.push(`${iri} <http://csrc.nist.gov/ns/oscal/common#name> "${role.name}"`);
    insertPredicates.push(`${iri} <http://csrc.nist.gov/ns/oscal/common#short_name> "${role.short_name}"`);
    insertPredicates.push(`${iri} <http://csrc.nist.gov/ns/oscal/common#description> "${role.description}"`);

    graphs.push(`
  GRAPH ${iri} {
    ${insertPredicates.join(".\n        ")}
  }
    `)
  })
  const query = `
  INSERT DATA {
    ${graphs.join("\n")}
  }`;
  return {roleIris, query};
}
export const selectRoleQuery = (id, select) => {
  return selectRoleByIriQuery(`http://csrc.nist.gov/ns/oscal/common#Role-${id}`, select);
}
export const selectRoleByIriQuery = (iri, select) => {
  if (!iri.startsWith('<')) iri = `<${iri}>`;
  if (select === undefined || select === null) select = Object.keys(rolePredicateMap);
  const { selectionClause, predicates } = buildSelectVariables(rolePredicateMap, select);
  return `
  SELECT ${selectionClause}
  FROM <tag:stardog:api:context:local>
  WHERE {
    BIND(${iri} AS ?iri)
    ?iri a <http://csrc.nist.gov/ns/oscal/common#Role> .
    ${predicates}
  }
  `
}
export const selectAllRoles = (select, args, parent) => {
  let constraintClause = '';
  if (select === undefined || select === null) select = Object.keys(rolePredicateMap);
  if (!select.includes('id')) select.push('id');

  if (args !== undefined ) {
    if ( args.filters !== undefined ) {
      for( const filter of args.filters) {
        if (!select.hasOwnProperty(filter.key)) select.push( filter.key );
      }
    }
    
    // add value of orderedBy's key to cause special predicates to be included
    if ( args.orderedBy !== undefined ) {
      if (!select.hasOwnProperty(args.orderedBy)) select.push(args.orderedBy);
    }
  }

  const { selectionClause, predicates } = buildSelectVariables(rolePredicateMap, select);
  // add constraint clause to limit to those that are referenced by the specified POAM
  if (parent !== undefined && parent.iri !== undefined) {
    let classTypeIri, predicate;
    if (parent.entity_type === 'poam') {
      classTypeIri = '<http://csrc.nist.gov/ns/oscal/common#POAM>';
      predicate = '<http://csrc.nist.gov/ns/oscal/common#roles>';
    }
    // define a constraint to limit retrieval to only those referenced by the parent
    constraintClause = `
    {
      SELECT DISTINCT ?iri
      WHERE {
          <${parent.iri}> a ${classTypeIri} ;
            ${predicate} ?iri .
      }
    }
    `;
  }

  return `
  SELECT DISTINCT ?iri ${selectionClause} 
  FROM <tag:stardog:api:context:local>
  WHERE {
    ?iri a <http://csrc.nist.gov/ns/oscal/common#Role> . 
    ${predicates}
    ${constraintClause}
  }
  `
}
export const deleteRoleQuery = (id) => {
  const iri = `http://csrc.nist.gov/ns/oscal/common#Role-${id}`;
  return deleteRoleByIriQuery(iri);
}
export const deleteRoleByIriQuery = (iri) => {
  return `
  DELETE {
    GRAPH <${iri}> {
      ?iri ?p ?o
    }
  } WHERE {
    GRAPH <${iri}> {
      ?iri a <http://csrc.nist.gov/ns/oscal/common#Role> .
      ?iri ?p ?o
    }
  }
  `
}
export const attachToRoleQuery = (id, field, itemIris) => {
  const iri = `<http://csrc.nist.gov/ns/oscal/common#Role-${id}>`;
  if (!rolePredicateMap.hasOwnProperty(field)) return null;
  const predicate = rolePredicateMap[field].predicate;
  let statements;
  if (Array.isArray(itemIris)) {
    statements = itemIris
      .map((itemIri) => `${iri} ${predicate} ${itemIri}`)
      .join(".\n        ")
    }
  else {
    statements = `${iri} ${predicate} ${itemIris}`;
  }
  return `
  INSERT DATA {
    GRAPH ${iri} {
      ${statements}
    }
  }
  `
}
export const detachFromRoleQuery = (id, field, itemIris) => {
  const iri = `<http://csrc.nist.gov/ns/oscal/common#Role-${id}>`;
  if (!rolePredicateMap.hasOwnProperty(field)) return null;
  const predicate = rolePredicateMap[field].predicate;
  let statements;
  if (Array.isArray(itemIris)) {
    statements = itemIris
      .map((itemIri) => `${iri} ${predicate} ${itemIri}`)
      .join(".\n        ")
    }
  else {
    statements = `${iri} ${predicate} ${itemIris}`;
  }
  return `
  DELETE DATA {
    GRAPH ${iri} {
      ${statements}
    }
  }
  `
}


// Predicate Maps
export const externalIdentifierPredicateMap = {
  id: {
    predicate: "<http://darklight.ai/ns/common#id>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "id")},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value))}
  },
  object_type: {
    predicate: "<http://darklight.ai/ns/common#object_type>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "object_type");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  scheme: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#scheme>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"^^xsd:anyURI` : null,  this.predicate, "scheme");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  identifier: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#identifier>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "identifier");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
}
export const locationPredicateMap = {
  id: {
    predicate: "<http://darklight.ai/ns/common#id>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "id");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  object_type: {
    predicate: "<http://darklight.ai/ns/common#object_type>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "object_type");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  created: {
    predicate: "<http://darklight.ai/ns/common#created>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"^^xsd:dateTime` : null,  this.predicate, "created");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  modified: {
    predicate: "<http://darklight.ai/ns/common#modified>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"^^xsd:dateTime` : null,  this.predicate, "modified");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  labels: {
    predicate: "<http://darklight.ai/ns/common#labels>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "labels");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  label_name: {
    predicate: "<http://darklight.ai/ns/common#labels>/<http://darklight.ai/ns/common#name>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "label_name");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  links: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#links>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "links");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  remarks: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#remarks>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "remarks");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  // relationships: {
  //   predicate: "<http://darklight.ai/ns/common#relationships>",
  //   binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "relationships");},
  //   optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  // },
  name: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#name>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "name");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  description: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#description>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "description");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  location_type: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#location_type>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "location_type");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  location_class: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#location_class>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "location_class");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  address: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#address>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "address");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  email_addresses: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#email_addresses>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "email_addresses");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  telephone_numbers: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#telephone_numbers>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "telephone_numbers");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  urls: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#url>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"^^xsd:anyURI` : null,  this.predicate, "urls");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
}
export const partyPredicateMap = {
  id: {
    predicate: "<http://darklight.ai/ns/common#id>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "id");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  object_type: {
    predicate: "<http://darklight.ai/ns/common#object_type>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "object_type");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  created: {
    predicate: "<http://darklight.ai/ns/common#created>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"^^xsd:dateTime` : null,  this.predicate, "created");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  modified: {
    predicate: "<http://darklight.ai/ns/common#modified>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"^^xsd:dateTime` : null,  this.predicate, "modified");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  labels: {
    predicate: "<http://darklight.ai/ns/common#labels>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "labels");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  label_name: {
    predicate: "<http://darklight.ai/ns/common#labels>/<http://darklight.ai/ns/common#name>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "label_name");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  links: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#links>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "links");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  remarks: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#remarks>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "remarks");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  // relationships: {
  //   predicate: "<http://darklight.ai/ns/common#relationships>",
  //   binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "relationships");},
  //   optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  // },
  name: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#name>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "name");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  short_name: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#short_name>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "short_name");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  description: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#description>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "description");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  party_type: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#party_type>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "party_type");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  external_identifiers: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#external_identifiers>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "external_identifiers");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  email_addresses: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#email_addresses>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "email_addresses");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  telephone_numbers: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#telephone_numbers>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "telephone_numbers");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  locations: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#locations>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "locations");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  addresses: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#addresses>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "addresses");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  member_of_organizations: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#member_of_organizations>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "member_of_organizations");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  mail_stop: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#mail_stop>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "mail_stop");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  office: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#office>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "office");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  job_title: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#job_title>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "job_title");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
}
export const responsiblePartyPredicateMap = {
  id: {
    predicate: "<http://darklight.ai/ns/common#id>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "id");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  object_type: {
    predicate: "<http://darklight.ai/ns/common#object_type>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "object_type");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  labels: {
    predicate: "<http://darklight.ai/ns/common#labels>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "labels");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  label_name: {
    predicate: "<http://darklight.ai/ns/common#labels>/<http://darklight.ai/ns/common#name>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "label_name");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  links: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#links>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "links");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  remarks: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#remarks>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "remarks");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  parties: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#parties>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "parties");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  role: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#role>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "role");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  role_identifier: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#role>/<http://csrc.nist.gov/ns/oscal/common#role_identifier>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "role_identifier");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  name: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#name>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "name");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  description: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#description>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "description");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
}
export const rolePredicateMap = {
  id: {
    predicate: "<http://darklight.ai/ns/common#id>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "id");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  object_type: {
    predicate: "<http://darklight.ai/ns/common#object_type>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "object_type");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  created: {
    predicate: "<http://darklight.ai/ns/common#created>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"^^xsd:dateTime` : null,  this.predicate, "created");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  modified: {
    predicate: "<http://darklight.ai/ns/common#modified>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"^^xsd:dateTime` : null,  this.predicate, "modified");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  labels: {
    predicate: "<http://darklight.ai/ns/common#labels>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "labels");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  label_name: {
    predicate: "<http://darklight.ai/ns/common#labels>/<http://darklight.ai/ns/common#name>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "label_name");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  links: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#links>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "links");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  remarks: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#remarks>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "remarks");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  // relationships: {
  //   predicate: "<http://darklight.ai/ns/common#relationships>",
  //   binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "relationships");},
  //   optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  // },
  name: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#name>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "name");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  description: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#description>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "description");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  short_name: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#short_name>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "short_name");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  role_identifier: {
    predicate: "<http://csrc.nist.gov/ns/oscal/common#role_identifier>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "role_identifier");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
}

