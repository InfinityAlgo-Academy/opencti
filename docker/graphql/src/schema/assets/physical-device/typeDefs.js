import gql from 'graphql-tag' ;

const typeDefs = gql`
  # Query Extensions
  extend type Query {
    physicalDeviceList(
        first: Int
        offset: Int
        orderedBy: PhysicalDeviceAssetOrdering
        orderMode: OrderingMode
        filters: [PhysicalDeviceAssetFiltering]
        filterMode: FilterMode
        search: String
      ): [PhysicalDeviceAsset]
    physicalDevice(id: ID!): PhysicalDeviceAsset
  }

  extend type Mutation {
    physicalDeviceAdd(input: PhysicalDeviceAssetAddInput): PhysicalDeviceAsset
    physicalDeviceDelete(id: ID!): String!
    physicalDeviceEdit(id: ID!, input: [EditInput]!, commitMessage: String): PhysicalDeviceAsset
  }

  # Query Types
  "Defines identifying information about a network."
  type Physical implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset & HardwareAsset {
    # BasicObject
    "Uniquely identifies this object."
    id: ID!
    "Identifies the identifier defined by the standard."
    standard_id: String!
    "Identifies the type of the Object."
    entity_type: String!
    "Identifies the parent types of this object."
    parent_types: [String]!
    # CoreObject
    created: DateTime!
    modified: DateTime!
    labels: [String]
    # Asset
    asset_id: String
    name: String!
    description: String
    locations: [AssetLocation]
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # ItAsset
    asset_tag: String
    asset_type: AssetType!
    serial_number: String
    vendor_name: String
    version: String
    release_date: DateTime
    implementation_point: ImplementationPoint!
    operational_status: OperationalStatus!
    # responsible_parties: [ResponsibleParty]
    # HardwareAsset
    cpe_identifier: String
    installation_id: String
    installed_hardware: [ComputingDeviceAsset!]!
    installed_operating_system: OperatingSystemAsset!
    model: String
    motherboard_id: String
    baseline_configuration_name: String
    function: String
    # PhysicalDeviceAsset
  }

  # Mutation Types
  input PhysicalDeviceAssetAddInput {
    labels: [String]
    # Asset
    asset_id: String
    name: String!
    description: String
    # ItAsset
    asset_tag: String
    asset_type: AssetType!
    serial_number: String
    vendor_name: String
    version: String
    release_date: DateTime
    implementation_point: ImplementationPoint!
    operational_status: OperationalStatus!
    # HardwareAsset
    cpe_identifier: String
    installation_id: String
    model: String
    motherboard_id: String
    baseline_configuration_name: String
    function: String
    # PhysicalDeviceAsset
  }

  input PhysicalDeviceAssetFiltering {
    key: PhysicalDeviceAssetFilter!
    values: [String]
    operator: String
    filterMode: FilterMode 
  }

  enum PhysicalDeviceAssetOrdering {
    name
    asset_type
    asset_id
    ip_address
    installed_operating_system
    network_id
    labels
  }

  enum PhysicalDeviceAssetFilter {
    name
    asset_type
    asset_id
    ip_address
    installed_operating_system
    network_id
    labels
  }

  # Pagination Types
  type PhysicalDeviceAssetConnection {
    pageInfo: PageInfo!
    edges: [PhysicalDeviceAssetEdge]
  }

  type PhysicalDeviceAssetEdge {
    cursor: String!
    node: PhysicalDeviceAsset!
  }

`;

export default typeDefs ;