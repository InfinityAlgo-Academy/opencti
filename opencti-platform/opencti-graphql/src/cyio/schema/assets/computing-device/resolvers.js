import { assetSingularizeSchema as singularizeSchema, objectTypeMapping } from '../asset-mappings.js';
import { UserInputError } from "apollo-server-express";
import { compareValues, filterValues, updateQuery } from '../../utils.js';
import { addToInventoryQuery, deleteQuery, removeFromInventoryQuery } from "../assetUtil.js";
import { 
  getSelectSparqlQuery, 
  getReducer, 
  insertQuery, 
  selectComputingDeviceQuery,
  computingDevicePredicateMap, 
  attachToComputingDeviceQuery
} from './sparql-query.js';
import {
  getSelectSparqlQuery as getSoftwareQuery,
  getReducer as getSoftwareReducer
} from '../software/sparql-query.js';
import {
  getSelectSparqlQuery as getNetworkQuery,
  getReducer as getNetworkReducer
} from '../network/sparql-query.js';
import {
  deleteIpQuery,
  deleteMacQuery,
  deletePortQuery,
  insertIPQuery,
  insertIPRelationship,
  insertMACQuery,
  insertMACRelationship,
  insertPortRelationships,
  insertPortsQuery
} from "../assetQueries.js";
import {
  selectLabelByIriQuery,
  selectExternalReferenceByIriQuery,
  selectNoteByIriQuery,
  getReducer as getGlobalReducer,
} from '../../global/resolvers/sparql-query.js';
import { selectObjectIriByIdQuery } from '../../global/global-utils.js';

const computingDeviceResolvers = {
  Query: {
    computingDeviceAssetList: async (_, args, {dbName, dataSources, selectMap}) => {
      const selectList = selectMap.getNode("node")
      const sparqlQuery = getSelectSparqlQuery('COMPUTING-DEVICE', selectList, undefined, args);
      const reducer = getReducer('COMPUTING-DEVICE');
      let response;
      try {
        response = await dataSources.Stardog.queryAll({
          dbName,
          sparqlQuery,
          queryId: "Select Computing Device Asset List",
          singularizeSchema
        });
      } catch(e){
        console.log(e)
        throw e
      }
      if (response === undefined) return null;
      if (Array.isArray(response) && response.length > 0) {
        // build array of edges
        const edges = [];
        let filterCount, resultCount, limit, offset, limitSize, offsetSize;
        limitSize = limit = (args.first === undefined ? response.length : args.first) ;
        offsetSize = offset = (args.offset === undefined ? 0 : args.offset) ;
        filterCount = 0;
        const assetList = (args.orderedBy !== undefined) ? response.sort(compareValues(args.orderedBy, args.orderMode)) : response;

        if (offset > assetList.length) return null;

        // for each asset in the result set
        for (let asset of assetList) {
          // skip down past the offset
          if (offset) {
            offset--
            continue
          }

          if (asset.id === undefined) {
            console.log(`[CYIO] CONSTRAINT-VIOLATION: (${dbName}) ${asset.iri} missing field 'id'; skipping`);
            continue;
          }

          // filter out non-matching entries if a filter is to be applied
          if ('filters' in args && args.filters != null && args.filters.length > 0) {
            if (!filterValues(asset, args.filters, args.filterMode)) {
              continue
            }
            filterCount++;
          }

          // check to make sure not to return more than requested
          if (limit) {
            let edge = {
              cursor: asset.iri,
              node: reducer(asset),
            }
            edges.push(edge)
            limit--;
          }
        }

        // check if there is data to be returned
        if (edges.length === 0 ) return null;
        let hasNextPage = false, hasPreviousPage = false;
        resultCount = assetList.length;
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
        }
      }
    },
    computingDeviceAsset: async (_, args, {dbName, dataSources, selectMap}) => {
      var sparqlQuery = getSelectSparqlQuery('COMPUTING-DEVICE',selectMap.getNode('computingDeviceAsset'), args.id);
      var reducer = getReducer('COMPUTING-DEVICE');
      let response;
      try {
        response = await dataSources.Stardog.queryById({
          dbName,
          sparqlQuery,
          queryId: "Select Computing Device Asset",
          singularizeSchema
        })
      } catch (e) {
        console.log(e)
        throw e
      }
      if (response === undefined || response.length === 0) return null;
      if (Array.isArray(response) && response.length > 0) {
        const first = response[0];
        if (first === undefined) return null;
        return (reducer(first));
      } else {
        // Handle reporting Stardog Error
        if (typeof (response) === 'object' && 'body' in response) {
          throw new UserInputError(response.statusText, {
            error_details: (response.body.message ? response.body.message : response.body),
            error_code: (response.body.code ? response.body.code : 'N/A')
          });
        }
      }
    },
  },
  Mutation: {
    createComputingDeviceAsset: async (_, {input}, {dbName, selectMap, dataSources}) => {
      let ports, ipv4, ipv6, mac, connectedNetwork, installedOS, installedSoftware;
      
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

      if (input.ports !== undefined) {
        ports = input.ports
        delete input.ports;
      }
      if (input.ipv4_address !== undefined) {
        ipv4 = input.ipv4_address;
        delete input.ipv4_address;
      }
      if (input.ipv6_address !== undefined) {
        ipv6 = input.ipv6_address;
        delete input.ipv6_address;
      }
      if (input.mac_address !== undefined) {
        mac = input.mac_address;
        delete input.mac_address;
      }
      // obtain the IRIs for the referenced objects so that if one doesn't exists we have created anything yet.
      if (input.connected_to_network !== undefined && input.connected_to_network !== null) {
        let query = selectObjectIriByIdQuery( input.connected_to_network, 'network');
        let result = await dataSources.Stardog.queryById({
          dbName,
          sparqlQuery: query,
          queryId: "Obtaining IRI for Network object with id",
          singularizeSchema
        });
        if (result === undefined || result.length === 0) throw new UserInputError(`Entity does not exist with ID ${input.connected_to_network}`);
        connectedNetwork = `<${result[0].iri}>`;
        delete input.connected_to_network;
      }
      if (input.installed_operating_system !== undefined && input.installed_operating_system !== null) {
        let query = selectObjectIriByIdQuery( input.installed_operating_system, 'operating-system');
        let result = await dataSources.Stardog.queryById({
          dbName,
          sparqlQuery: query,
          queryId: "Obtaining IRI for Operating System object with id",
          singularizeSchema
        });
        if (result === undefined || result.length === 0) throw new UserInputError(`Entity does not exist with ID ${input.installed_operating_system}`);
        installedOS = `<${result[0].iri}>`;
        delete input.installed_operating_system;
      }
      if (input.installed_software !== undefined && input.installed_software !== null) {
        let softwareList = []
        for (let softwareId of input.installed_software) {
          let query = selectObjectIriByIdQuery( softwareId, 'software');
          let result = await dataSources.Stardog.queryById({
            dbName,
            sparqlQuery: query,
            queryId: "Obtaining IRI for Software object with id",
            singularizeSchema
          });
          if (result === undefined || result.length === 0) throw new UserInputError(`Entity does not exist with ID ${softwareId}`);
          softwareList.push(`<${result[0].iri}>`);
        }
        installedSoftware = softwareList;
        delete input.installed_software;
      }

      const { iri, id, query } = insertQuery(input);
      await dataSources.Stardog.create({
        dbName,
        sparqlQuery: query,
        queryId: "Create Computing Device Asset"
      });
      const connectQuery = addToInventoryQuery(iri);
      await dataSources.Stardog.create({
        dbName,
        sparqlQuery: connectQuery,
        queryId: "Add Computing Device Asset to Inventory"
      });

      if (ports !== undefined && ports !== null) {
        const { iris: portIris, query: portsQuery } = insertPortsQuery(ports);
        await dataSources.Stardog.create({
          dbName,
          sparqlQuery: portsQuery,
          queryId: "Create Computing Device Asset Ports"
        });
        const relationshipQuery = insertPortRelationships(iri, portIris);
        await dataSources.Stardog.create({
          dbName,
          queryId: "Add Ports to Computing Device Asset",
          sparqlQuery: relationshipQuery
        });
      }
      if (ipv4 !== undefined && ipv4 !== null) {
        const { ipIris, query } = insertIPQuery(ipv4, 4);
        await dataSources.Stardog.create({
          dbName,
          sparqlQuery: query,
          queryId: "Creat Computing Device Asset IPv4"
        });
        const relationshipQuery = insertIPRelationship(iri, ipIris);
        await dataSources.Stardog.create({
          dbName,
          sparqlQuery: relationshipQuery,
          queryId: "Add IPv4 to Computing Device Asset"
        });
      }
      if (ipv6 !== undefined && ipv6!== null) {
        const { ipIris, query } = insertIPQuery(ipv6, 6);
        await dataSources.Stardog.create({
          dbName,
          sparqlQuery: query,
          queryId: "Create Computing Device Asset IPv6"
        });
        const relationshipQuery = insertIPRelationship(iri, ipIris);
        await dataSources.Stardog.create({
          dbName,
          sparqlQuery: relationshipQuery,
          queryId: "Add IPv6 to Computing Device Asset"
        });
      }
      if (mac !== undefined && mac!== null) {
        const { macIris, query } = insertMACQuery(mac);
        await dataSources.Stardog.create({
          dbName,
          sparqlQuery: query,
          queryId: "Create Computing Device Asset MAC"
        });
        const relationshipQuery = insertMACRelationship(iri, macIris);
        await dataSources.Stardog.create({
          dbName,
          sparqlQuery: relationshipQuery,
          queryId: "Add MAC to Computing Device Asset"
        });
      }
        // attach any Network(s) to Computing Device
        if (connectedNetwork !== undefined && connectedNetwork !== null) {
          let networkAttachQuery = attachToComputingDeviceQuery(id, 'connected_to_network', connectedNetwork);
          await dataSources.Stardog.create({
            dbName,
            sparqlQuery: networkAttachQuery,
            queryId: "Attaching connected network to the Computing Device Asset"
          });
        }
        // attach Operating System to Computing Device
        if (installedOS !== undefined && installedOS !== null) {
          let osAttachQuery = attachToComputingDeviceQuery(id, 'installed_operating_system', installedOS);
          await dataSources.Stardog.create({
            dbName,
            sparqlQuery: osAttachQuery,
            queryId: "Attaching Operating System to the Computing Device Asset"
          });
        }
        // attach Software to Computing Device
        if (installedSoftware !== undefined && installedSoftware !== null) {
          let softwareAttachQuery = attachToComputingDeviceQuery(id, 'installed_software', installedSoftware);
          await dataSources.Stardog.create({
            dbName,
            sparqlQuery: softwareAttachQuery,
            queryId: "Attaching Installed Software to the Computing Device Asset"
          });
        }

      // retrieve information about the newly created ComputingDevice to return to the user
      const select = selectComputingDeviceQuery(id, selectMap.getNode("computingDeviceAsset"));
      let response;
      try {
        response = await dataSources.Stardog.queryById({
          dbName,
          sparqlQuery: select,
          queryId: "Select Computing Device",
          singularizeSchema
        });
      } catch (e) {
        console.log(e)
        throw e
      }
      const reducer = getReducer("COMPUTING-DEVICE");
      return reducer(response[0]);
    },
    deleteComputingDeviceAsset: async (_, {id}, {dbName, dataSources} ) => {
      // check that the ComputingDevice exists
      const sparqlQuery = selectComputingDeviceQuery(id, null );
      const response = await dataSources.Stardog.queryById({
        dbName,
        sparqlQuery,
        queryId: "Select Computing Device",
        singularizeSchema
      })
      if (response.length === 0) throw new UserInputError(`Entity does not exist with ID ${id}`);
      const reducer = getReducer('COMPUTING-DEVICE');
      const asset = (reducer(response[0]));

      if (asset.hasOwnProperty('ports_iri')) {
        for (const portIri in asset.ports_iri) {
          const portQuery = deletePortQuery(portIri);
          await dataSources.Stardog.delete({
            dbName,
            sparqlQuery: portQuery,
            queryId: "Delete Port from Computing Device Asset"
          });
        }
      }
      if (asset.hasOwnProperty('ip_addr_iri')) {
        for (const ipId in asset.ip_addr_iri) {
          const ipQuery = deleteIpQuery(ipId);
          await dataSources.Stardog.delete({
            dbName,
            sparqlQuery: ipQuery,
            queryId: "Delete IP from Computing Asset"
          });
        }
      }
      if (asset.hasOwnProperty('mac_addr_iri')) {
        for (const macId in asset.mac_addr_iri) {
          const macQuery = deleteMacQuery(macId);
          await dataSources.Stardog.delete({
            dbName,
            sparqlQuery: macQuery,
            queryId: "Delete MAC from Computing Device Asset"
          });
        }
      }

      const relationshipQuery = removeFromInventoryQuery(id);
      await dataSources.Stardog.delete({
        dbName,
        sparqlQuery: relationshipQuery,
        queryId: "Delete Computing Device Asset from Inventory"
      })
      const query = deleteQuery(id)
      await dataSources.Stardog.delete({
        dbName,
        sparqlQuery: query,
        queryId: "Delete Computing Device Asset"
      })
      return id;
    },
    editComputingDeviceAsset: async (_, { id, input }, {dbName, dataSources, selectMap}) => {
      // check that the ComputingDevice exists
      const sparqlQuery = selectComputingDeviceQuery(id, null );
      let response = await dataSources.Stardog.queryById({
        dbName,
        sparqlQuery,
        queryId: "Select Computing Device",
        singularizeSchema
      })
      if (response.length === 0) throw new UserInputError(`Entity does not exist with ID ${id}`);
      const query = updateQuery(
        `http://scap.nist.gov/ns/asset-identification#ComputingDevice-${id}`,
        "http://scap.nist.gov/ns/asset-identification#ComputingDevice",
        input,
        computingDevicePredicateMap
      )
      await dataSources.Stardog.edit({
        dbName,
        sparqlQuery: query,
        queryId: "Update Computing Device Asset"
      });
      const select = selectComputingDeviceQuery(id, selectMap.getNode("editComputingDeviceAsset"));
      let result;
      try {
        result = await dataSources.Stardog.queryById({
          dbName,
          sparqlQuery: select,
          queryId: "Select Computing Device",
          singularizeSchema
        });
      } catch (e) {
        console.log(e)
        throw e
      }
      const reducer = getReducer("COMPUTING-DEVICE");
      return reducer(result[0]);
    },
  },
  // Map enum GraphQL values to data model required values

  // field-level query
  ComputingDeviceAsset: {
    installed_software: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.installed_sw_iri === undefined) return [];
      let iriArray = parent.installed_sw_iri;
      const results = [];
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        var reducer = getSoftwareReducer('SOFTWARE-IRI');
        let selectList = selectMap.getNode('installed_software');
        for (let iri of iriArray) {
          // check if this is an Software object
          if (iri === undefined || !iri.includes('Software')) {
            continue;
          }

          // query for the Software based on its IRI
          var sparqlQuery = getSoftwareQuery('SOFTWARE-IRI', selectList, iri);
          const response = await dataSources.Stardog.queryById({
            dbName,
            sparqlQuery,
            queryId: "Select Installed Software for Computing Device Asset",
            singularizeSchema
          })
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
    installed_operating_system: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.installed_os_iri === undefined) return null;
      var iri = parent.installed_os_iri
      if (Array.isArray(iri) && iri.length > 0) {
        if (iri.length > 1) {
          console.log(`[CYIO] (${dbName}) CONSTRAINT-VIOLATION: ${parent.iri} 'installed_operating_system' violates maxCount constraint`);
          iri = parent.installed_os_iri[0]
        }
      } else {
        iri = parent.installed_os_iri;
      }

      var sparqlQuery = getSoftwareQuery('OS-IRI', selectMap.getNode('installed_operating_system'), iri);
      var reducer = getSoftwareReducer('OS-IRI');
      let response;
      try {
        response = await dataSources.Stardog.queryById({
          dbName,
          sparqlQuery,
          queryId: "Select Installed Operating System for Computing Device Asset",
          singularizeSchema
        })
      } catch (e) {
        console.log(e)
        throw e
      }
      if (response === undefined) return null;
      if (Array.isArray(response) && response.length > 0) {
        return reducer(response[0])
      } else {
        // Handle reporting Stardog Error
        if (typeof (response) === 'object' && 'body' in response) {
          throw new UserInputError(response.statusText, {
            error_details: (response.body.message ? response.body.message : response.body),
            error_code: (response.body.code ? response.body.code : 'N/A')
          });
        }
      }
    },
    ipv4_address: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.ip_addr_iri === undefined) return [];
      let iriArray = parent.ip_addr_iri;
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const results = [];
        var reducer = getReducer('IPV4-ADDR');
        let selectList = selectMap.getNode('ipv4_address');
        for (let iri of iriArray) {
          // check if this is an IPv4 object
          if (!iri.includes('IpV4Address')) {
            continue;
          }

          // query for the IP address based on its IRI
          var sparqlQuery = getSelectSparqlQuery('IPV4-ADDR', selectList, iri);
          const response = await dataSources.Stardog.queryById({
            dbName,
            sparqlQuery,
            queryId: "Select IPv4 for Computing Device Asset",
            singularizeSchema
          })
          if (response === undefined) return [];
          if (Array.isArray(response) && response.length > 0) {
            results.push(reducer(response[0]))
          } else {
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
    ipv6_address: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.ip_addr_iri === undefined) return [];
      let iriArray = parent.ip_addr_iri;
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const results = [];
        var reducer = getReducer('IPV6-ADDR');
        let selectList = selectMap.getNode('ipv6_address');
        for (let iri of iriArray) {
          // check if this is an IPv6 object
          if (!iri.includes('IpV6Address')) {
            continue;
          }

          // query for the IP address based on its IRI
          var sparqlQuery = getSelectSparqlQuery('IPV6-ADDR', selectList, iri);
          const response = await dataSources.Stardog.queryById({
            dbName,
            sparqlQuery,
            queryId: "Select IPv6 for Computing Device Asset",
            singularizeSchema
          })
          if (response === undefined) return [];
          if (Array.isArray(response) && response.length > 0) {
            results.push(reducer(response[0]))
          } else {
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
    mac_address: async (parent, _, {dbName, dataSources, }) => {
      if (parent.mac_addr_iri === undefined) return [];
      let iriArray = parent.mac_addr_iri;
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const results = [];
        var reducer = getReducer('MAC-ADDR');
        // the hardwired selectList is because graphQL modeled MAC address as a string array, not object array
        let selectList = ["id", "created", "modified", "mac_address_value", "is_virtual"];
        for (let addr of iriArray) {
          // check if this is an MAC address object
          if (!addr.includes('MACAddress')) {
            continue;
          }

          // query for the MAC address based on its IRI
          var sparqlQuery = getSelectSparqlQuery('MAC-ADDR', selectList, addr);
          const response = await dataSources.Stardog.queryById({
            dbName,
            sparqlQuery,
            queryId: "Select MAC for Computing Device Asset",
            singularizeSchema
          })
          if (response === undefined) return [];
          if (Array.isArray(response) && response.length > 0) {
            for (let item of response ) {
              let macAddr = reducer(item);
              // disallow duplicates since we're storing only the value of the mac value
              if ( results.includes(macAddr.mac_address_value)) { continue; }
              results.push(macAddr.mac_address_value);  // TODO: revert back when data is returned as objects, not strings
            }
          } else {
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
    ports: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.ports_iri === undefined) return [];
      let iriArray = parent.ports_iri;
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const results = [];
        var reducer = getReducer('PORT-INFO');
        let selectList = selectMap.getNode('ports');
        for (let iri of iriArray) {
          // check if this is an Port object
          if (!iri.includes('Port')) {
            continue;
          }

          // query for the IP address based on its IRI
          var sparqlQuery = getSelectSparqlQuery('PORT-INFO', selectList, iri);
          const response = await dataSources.Stardog.queryById({
            dbName,
            sparqlQuery,
            queryId: "Select Ports for Computing Device Asset",
            singularizeSchema
          });
          if (Array.isArray(response) && response.length > 0) {
            results.push(reducer(response[0]))
          } else {
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
    connected_to_network: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.conn_network_iri === undefined) return null;
      let iri = parent.conn_network_iri;
      if (Array.isArray(iri) && iri.length > 0) {
        if (iri.length > 1) {
          console.log(`[CYIO] (${dbName}) CONSTRAINT-VIOLATION: ${parent.iri} 'connected_to_network' violates maxCount constraint`);
          iri = parent.conn_network_iri[0]
        }
      } else {
        iri = parent.conn_network_iri;
      }

      let selectList = selectMap.getNode('connected_to_network');
      var sparqlQuery = getNetworkQuery('CONN-NET-IRI', selectList, iri);
      var reducer = getNetworkReducer('NETWORK');
      const response = await dataSources.Stardog.queryById({
        dbName,
        sparqlQuery,
        queryId: "Select Network for Computing Device Asset",
        singularizeSchema
      });
      if (response === undefined) return null;
      if (Array.isArray(response) && response.length > 0) {
        return reducer(response[0])
      } else {
        // Handle reporting Stardog Error
        if (typeof (response) === 'object' && 'body' in response) {
          throw new UserInputError(response.statusText, {
            error_details: (response.body.message ? response.body.message : response.body),
            error_code: (response.body.code ? response.body.code : 'N/A')
          });
        }
      }
    },
    labels: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.labels_iri === undefined) return [];
      let iriArray = parent.labels_iri;
      const results = [];
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const reducer = getGlobalReducer("LABEL");
        for (let iri of iriArray) {
          if (iri === undefined || !iri.includes('Label')) continue;
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
    external_references: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.ext_ref_iri === undefined) return [];
      let iriArray = parent.ext_ref_iri;
      const results = [];
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const reducer = getGlobalReducer("EXTERNAL-REFERENCE");
        for (let iri of iriArray) {
          if (iri === undefined || !iri.includes('ExternalReference')) continue;
          const sparqlQuery = selectExternalReferenceByIriQuery(iri, selectMap.getNode("external_references"));
          let response;
          try {
            response = await dataSources.Stardog.queryById({
              dbName,
              sparqlQuery,
              queryId: "Select External Reference",
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
    notes: async (parent, _, {dbName, dataSources, selectMap}) => {
      if (parent.notes_iri === undefined) return [];
      let iriArray = parent.notes_iri;
      const results = [];
      if (Array.isArray(iriArray) && iriArray.length > 0) {
        const reducer = getGlobalReducer("NOTE");
        for (let iri of iriArray) {
          if (iri === undefined || !iri.includes('Note')) continue;
          const sparqlQuery = selectNoteByIriQuery(iri, selectMap.getNode("notes"));
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
  },
  ComputingDeviceKind: {
    __resolveType: (item) => {
      return objectTypeMapping[item.entity_type];
    }
  }
};


export default computingDeviceResolvers;
