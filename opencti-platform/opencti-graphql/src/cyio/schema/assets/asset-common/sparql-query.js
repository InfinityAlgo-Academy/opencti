import {byIdClause, optionalizePredicate, parameterizePredicate, buildSelectVariables, generateId, OASIS_NS} from "../../utils.js";


const selectClause = `
SELECT DISTINCT ?iri ?id ?object_type 
  ?asset_id ?name ?description ?locations ?responsible_party 
  ?asset_type ?asset_tag ?serial_number ?vendor_name ?version ?release_date ?implementation_point ?operational_status
  ?function ?cpe_identifier ?model ?motherboard_id ?installation_id ?installed_hardware ?installed_operating_system ?baseline_configuration_name
  ?is_publicly_accessible ?is_scanned ?is_virtual ?bios_id ?fqdn ?hostname ?network_id ?default_gateway ?vlan_id ?uri ?installed_software ?ip_address ?mac_address ?ports
  ?network_id
  ?network_address_range ?network_name ?service_software
  ?software_identifier ?patch ?license_key
  ?system_name
FROM <tag:stardog:api:context:named>
WHERE {
`;

const bindIRIClause = `\tBIND(<{iri}> AS ?iri)\n`;
const typeConstraint = `?iri a <http://scap.nist.gov/ns/asset-identification#{assetType}> .`;

const predicateBody = `
  ?iri <http://darklight.ai/ns/common#id> ?id .
	OPTIONAL { ?iri <http://darklight.ai/ns/common#object_type> ?object_type } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#asset_id> ?asset_id } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#name> ?name } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#description> ?description } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#locations> ?locations } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#responsible_parties> ?responsible_party } .
	# ItAsset
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#asset_type> ?asset_type } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#asset_tag> ?asset_tag } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#serial_number> ?serial_number } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#vendor_name> ?vendor_name }.
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#version> ?version } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#release_date> ?release_date } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#implementation_point> ?implementation_point } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#operational_status> ?operational_status } .
	# Hardware - ComputingDevice - NetworkDevice
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#function> ?function } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#cpe_identifier> ?cpe_identifier } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#model> ?model } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#motherboard_id> ?motherboard_id }
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#installation_id> ?installation_id }
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#installed_hardware> ?installed_hardware } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#installed_operating_system> ?installed_operating_system } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#baseline_configuration_name> ?baseline_configuration_name } .
	# ComputingDevice - Server - Workstation
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#is_publicly_accessible> ?is_publicly_accessible } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#is_scanned> ?is_scanned } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#is_virtual> ?is_virtual } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#bios_id> ?bios_id }.
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#fqdn> ?fqdn } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#hostname> ?hostname } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#netbios_name> ?netbios_name } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#network_id> ?network_id } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#default_gateway> ?default_gateway } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#vlan_id> ?vlan_id } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#uri> ?uri } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#installed_software> ?installed_software } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#ip_address> ?ip_address } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#mac_address> ?mac_address } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#ports> ?ports } .
	# Network Device - Appliance - Firewall - Router - StorageArray - Switch - VoIPHandset - VoIPRouter
	# Network
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#network_address_range> ?network_address_range } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#network_name> ?network_name } .
	# Service
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#function> ?function } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#service_software> ?service_software } .
	# Software - OperatingSystem - ApplicationSoftware
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#software_identifier> ?software_identifier } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#patch_level> ?patch } .
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#license_key> ?license_key } .
	# System - DirectoryServer - DnsServer - EmailServer - WebServer
	OPTIONAL { ?iri <http://scap.nist.gov/ns/asset-identification#system_name> ?system_name } .
`;

const inventoryConstraint = `
	{
		SELECT DISTINCT ?iri
		WHERE {
				?inventory a <http://csrc.nist.gov/ns/oscal/common#AssetInventory> ;
							<http://csrc.nist.gov/ns/oscal/common#assets> ?iri .
		}
	}
` ;


export function getSelectSparqlQuery( type, select, id, filter, ) {
  var filterStr = ''
  var byId = '';
  let sparqlQuery;
  // const { selectionClause, predicates } = buildSelectVariables(predicateMap, select)

  switch( type ) {
    case 'ASSET':
      if (id !== undefined) {
        byId = byIdClause(id);
      }

      sparqlQuery = selectClause + 
          typeConstraint.replace('{assetType}', 'Asset') + 
          byId + 
          predicateBody + 
          inventoryConstraint + 
          filterStr + '}';
      break;
    case 'IT-ASSET':
      if (id !== undefined) {
        byId = byIdClause(id);
      }

      sparqlQuery = selectClause + 
          typeConstraint.replace('{assetType}', 'ItAsset') + 
          byId + 
          predicateBody + 
          inventoryConstraint + 
          filterStr + '}';
      break;
    default:
      throw new Error(`Unsupported query type ' ${type}'`)
  }

  return sparqlQuery ;
}

export function getReducer( type ) {
  switch( type ) {
    case 'ASSET':
    case 'IT-ASSET':
      return itAssetReducer;
    case 'ASSET-LOCATION':
      return assetLocationReducer;
    default:
      throw new Error(`Unsupported reducer type ' ${type}'`)
  }
}

export const removeMultipleAssetsFromInventoryQuery = (ids) => {
  const values = ids ? (ids.map((id) => `"${id}"`).join(' ')) : "";
  return `
    DELETE {
      GRAPH ?g {
        ?inv <http://csrc.nist.gov/ns/oscal/common#assets> ?iri .
      }
    } WHERE {
      GRAPH ?g {
        ?inv a <http://csrc.nist.gov/ns/oscal/common#AssetInventory> .
        ?inv <http://csrc.nist.gov/ns/oscal/common#assets> ?iri .
        {
          SELECT DISTINCT ?iri WHERE {
            ?iri a <http://scap.nist.gov/ns/asset-identification#ItAsset> .
            ?iri <http://darklight.ai/ns/common#id> ?id .
            VALUES ?id {${values}}
          }
        }
      }
    }
    `
}

export const removeAssetFromInventoryQuery = (id) => {
  return `
    DELETE {
      GRAPH ?g {
        ?inv <http://csrc.nist.gov/ns/oscal/common#assets> ?iri .
      }
    } WHERE {
      GRAPH ?g {
        ?inv a <http://csrc.nist.gov/ns/oscal/common#AssetInventory> .
        ?inv <http://csrc.nist.gov/ns/oscal/common#assets> ?iri .
        {
          SELECT DISTINCT ?iri WHERE {
            ?iri a <http://scap.nist.gov/ns/asset-identification#ItAsset> .
            ?iri <http://darklight.ai/ns/common#id> "${id}" .
          }
        }
      }
    }
    `
}

export const deleteMultipleAssetsQuery = (ids) =>{
  const values = ids ? (ids.map((id) => `"${id}"`).join(' ')) : "";
  return `
  DELETE {
    GRAPH ?g {
      ?iri ?p ?o
    }
  } WHERE {
    GRAPH ?g {
      ?iri a <http://scap.nist.gov/ns/asset-identification#ItAsset> .
      ?iri <http://darklight.ai/ns/common#id> ?id .
      ?iri ?p ?o .
      VALUES ?id {${values}}
    }
  }
  `
}

export const deleteAssetQuery = (id) => {
  return `
  DELETE {
    GRAPH ?g {
      ?iri ?p ?o
    }
  } WHERE {
    GRAPH ?g {
      ?iri a <http://scap.nist.gov/ns/asset-identification#ItAsset> .
      ?iri <http://darklight.ai/ns/common#id> "${id}" .
      ?iri ?p ?o .
    }
  }
  `
}

function itAssetReducer( item ) {
  // if no object type was returned, compute the type from the IRI
  if (item.object_type === undefined || item.object_type == null) {
    if (item.asset_type !== undefined ) {
      item.object_type = item.asset_type
    } else {
      item.object_type = 'it-asset';
    }
  }

  return {
	  id: item.id,
	  ...(item.object_type && {entity_type: item.object_type}),
	  ...(item.created && {created: item.created}),
	  ...(item.modified && {modified: item.modified}),
	  ...(item.labels && {labels: item.labels}),
	  ...(item.name && { name: item.name} ),
	  ...(item.description && { description: item.description}),
	  ...(item.asset_id && { asset_id: item.asset_id}),
    // ItAsset
	  ...(item.asset_type && {asset_type: item.asset_type}),
	  ...(item.asset_tag && {asset_tag: item.asset_tag}) ,
	  ...(item.serial_number && {serial_number: item.serial_number}),
	  ...(item.vendor_name && {vendor_name: item.vendor_name}),
	  ...(item.version && {version: item.version}),
	  ...(item.release_date && {release_date: item.release_date}),
    // Hardware - ComputingDevice - NetworkDevice
    ...(item.function && {function: item.function}),
    ...(item.cpe_identifier && {cpe_identifier: item.cpe_identifier}),
    ...(item.installation_id && {installation_id: item.installation_id}),
    ...(item.model && {model: item.model}),
    ...(item.motherboard_id && {motherboard_id: item.motherboard_id}),
    ...(item.baseline_configuration_name && {baseline_configuration_name: item.baseline_configuration_name}),
    // ComputingDevice - Server - Workstation
    ...(item.bios_id && {bios_id: item.bios_id}),
    ...(item.vlan_id && {vlan_id: item.vlan_id}),
    ...(item.default_gateway && {default_gateway: item.default_gateway}),
    ...(item.fqdn && {fqdn: item.fqdn}),
    ...(item.hostname && {hostname: item.hostname}),
    ...(item.netbios_name && {netbios_name: item.netbios_name}),
    ...(item.uri && {uri: item.uri}),
    ...(item.is_publicly_accessible !== undefined & {is_publicly_accessible: item.is_publicly_accessible}),
    ...(item.is_scanned !== undefined && {is_scanned: item.is_scanned}),
    ...(item.is_virtual !== undefined && {is_virtual: item.is_virtual}),
    // Network Device - Appliance - Firewall - Router - StorageArray - Switch - VoIPHandset - VoIPRouter
    // Network
    ...(item.network_id && {network_id: item.network_id}),
    ...(item.network_name && {network_name: item.network_name}),
    // Service
    // Software - OperatingSystem - ApplicationSoftware
    ...(item.software_identifier && {software_identifier: item.software_identifier}),
    ...(item.patch_level && {patch_level: item.patch_level}),
    ...(item.installation_id && {installation_id: item.installation_id}),
    ...(item.license_key && {license_key: item.license_key}),
    // System - DirectoryServer - DnsServer - EmailServer - WebServer
    ...(item.system_name && {system_name: item.system_name}),
	  // Hints
	  ...(item.iri && {parent_iri: item.iri}),
	  ...(item.locations && {locations_iri: item.locations}),
	  ...(item.external_references && {ext_ref_iri: item.external_references}),
	  ...(item.notes && {notes_iri: item.notes}),
    ...(item.installed_hardware && {installed_hw_iri: item.installed_hardware}),
    ...(item.installed_operating_system && {installed_os_iri: item.installed_operating_system}),
    ...(item.installed_software && {installed_sw_iri: item.installed_software}),
    ...(item.ip_address && {ip_addr_iri: item.ip_address}),
    ...(item.mac_address && {mac_addr_iri: item.mac_address}),
    ...(item.ports && {ports_iri: item.ports}),
    ...(item.connected_to_network && {conn_network_iri: item.connected_to_network}),
    ...(item.network_address_range && {netaddr_range_iri: item.network_address_range}),
    ...(item.service_software && {svc_sw_iri: item.service_software}),
  }
}

export const locationPredicateMap = {
  id: {
    predicate: "<http://darklight.ai/ns/common#id>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"`: null, this.predicate, "id")},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value))}
  },
  object_type: {
    predicate: "<http://scap.nist.gov/ns/asset-identification#object_type>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "object_type");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  administrative_area: {
    predicate: "<http://darklight.ai/ns/common#administrative_area>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "administrative_area");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  city: {
    predicate: "<http://darklight.ai/ns/common#city>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "city");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  country: {
    predicate: "<http://darklight.ai/ns/common#country_code>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "country");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  description: {
    predicate: "<http://darklight.ai/ns/common#description>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "description");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  name: {
    predicate: "<http://darklight.ai/ns/common#name>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "name");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  postal_code: {
    predicate: "<http://darklight.ai/ns/common#postal_code>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "postal_code");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  street_address: {
    predicate: "<http://darklight.ai/ns/common#street_address>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}"` : null,  this.predicate, "street_address");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  created: {
    predicate: "<http://darklight.ai/ns/common#created>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}^^xsd:dateTime"` : null,  this.predicate, "created");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  },
  modified: {
    predicate: "<http://darklight.ai/ns/common#modified>",
    binding: function (iri, value) { return parameterizePredicate(iri, value ? `"${value}^^xsd:dateTime"` : null,  this.predicate, "modified");},
    optional: function (iri, value) { return optionalizePredicate(this.binding(iri, value));},
  }
}

const assetLocationReducer = (item) => {
  // if no object type was returned, compute the type from the IRI
  if ( item.object_type === undefined && item.asset_type !== undefined ) {
    item.object_type = item.asset_type
  } else {
    item.object_type = 'asset-location';
  }

  return {
    id: item.id,
    ...(item.object_type && {"entity_type": item.object_type}),
    ...(item.created && {"created": item.created}),
    ...(item.modified && {"modified": item.modified}),
    ...(item.labels && {"labels": item.labels}),
    ...(item.name && {"name": item.name} ),
    ...(item.description && {"description": item.description}),
    // Location
    ...(item.administrative_area && {"administrative_area": item.administrative_area}),
    ...(item.city && {"city": item.city}),
    ...(item.country_code && {"country": item.country_code}),
    ...(item.postal_code && {"postal_code": item.postal_code}),
    ...(item.street_address && {"street_address": item.street_address})
  }
}

export const insertLocationQuery = (propValues) => {
  const id_material = {
    ...(propValues.administrative_area && {"administrative_area": propValues.administrative_area}),
    ...(propValues.city && {"city": propValues.city}),
    ...(propValues.country_code && {"country": propValues.country_code}),
    ...(propValues.postal_code && {"postal_code": propValues.postal_code}),
    ...(propValues.street_address && {"street_address": propValues.street_address})
  } ;
  const id = generateId( id_material, OASIS_NS );
  const timestamp = new Date().toISOString()
  const iri = `<http://darklight.ai/ns/common#CivicLocation-${id}>`;
  const insertPredicates = Object.entries(propValues)
      .filter((propPair) => locationPredicateMap.hasOwnProperty(propPair[0]))
      .map((propPair) => locationPredicateMap[propPair[0]].binding(iri, propPair[1]))
      .join('. \n      ');
  const query = `
  INSERT DATA {
    GRAPH ${iri} {
      ${iri} a <http://darklight.ai/ns/common#CivicLocation> .
      ${iri} a <http://darklight.ai/ns/common#Location> .
      ${iri} a <http://darklight.ai/ns/common#Object> .
      ${iri} <http://darklight.ai/ns/common#id> "${id}".
      ${iri} <http://darklight.ai/ns/common#object_type> "location" . 
      ${iri} <http://darklight.ai/ns/common#created> "${timestamp}"^^xsd:dateTime . 
      ${iri} <http://darklight.ai/ns/common#modified> "${timestamp}"^^xsd:dateTime . 
      ${insertPredicates}
    }
  }
  `;
  return {iri, id, query}
}

export const selectLocationQuery = (id, select) => {
  return selectLocationByIriQuery(`http://darklight.ai/ns/common#CivicLocation-${id}`, select);
}

// IRI is expected to not include < or >
export const selectLocationByIriQuery = (iri, select) => {
  if(select === null) select = Object.keys(locationPredicateMap);
  const { selectionClause, predicates } = buildSelectVariables(locationPredicateMap, select);
  return `
  SELECT ${selectionClause}
  FROM <tag:stardog:api:context:named>
  WHERE {
    ?iri a <http://darklight.ai/ns/common#CivicLocation> .
    ${predicates}
  }
  `
//   SELECT ${selectionClause}
//   WHERE {
//     GRAPH <${iri}> {
//         ?iri a <http://darklight.ai/ns/common#CivicLocation> .
//         ${predicates}
//     }
//   }
//   `
}

export const selectAllLocations = (select) => {
  if(select === null) select =Object.keys(locationPredicateMap);
  const { selectionClause, predicates } = buildSelectVariables(locationPredicateMap, select);
  return `
  SELECT ${selectionClause} 
  FROM <tag:stardog:api:context:named>
  WHERE {
    ?iri a <http://darklight.ai/ns/common#CivicLocation> . 
    ${predicates}
  }
  `
  // SELECT ${selectionClause} 
  // WHERE {
  // #  GRAPH ?iri {
  //     ?iri a <http://darklight.ai/ns/common#CivicLocation> . 
  //     ${predicates}
  // #  }
  // }
  // `
}

export const deleteLocationQuery = (id) => {
  const iri = `<http://darklight.ai/ns/common#CivicLocation-${id}>`;
  return `
  DELETE {
    GRAPH ${iri}{
      ?iri ?p ?o
    }
  } WHERE {
    GRAPH ${iri}{
      ?iri a <http://darklight.ai/ns/common#CivicLocation> .
      ?iri ?p ?o
    }
  }
  `
}
