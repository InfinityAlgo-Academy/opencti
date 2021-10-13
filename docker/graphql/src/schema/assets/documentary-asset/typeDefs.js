import gql from 'graphql-tag' ;

const typeDefs = gql`
  "Defines identifying information about any guideline or recommendation."
  type GuidanceAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset & DocumentaryAsset {
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
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # Asset
    name: String!
    description: String
    locations: [AssetLocation]!
    asset_id: String
  }

  "Defines identifying information about an applicable plan."
  type PlanAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset & DocumentaryAsset {
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
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # Asset
    name: String!
    description: String
    locations: [AssetLocation]!
    asset_id: String
  }

  "Defines identifying information about an enforceable policy."
  type PolicyAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset & DocumentaryAsset {
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
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # Asset
    name: String!
    description: String
    locations: [AssetLocation]!
    asset_id: String
  }

  "Defines identifying information about a list of steps or actions to take to achieve some end result."
  type ProcedureAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset & DocumentaryAsset {
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
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # Asset
    name: String!
    description: String
    locations: [AssetLocation]!
    asset_id: String
  }

  "Defines identifying information about any organizational or industry standard."
  type StandardAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset & DocumentaryAsset {
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
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # Asset
    name: String!
    description: String
    locations: [AssetLocation]!
    asset_id: String
  }

  "Defines identifying information about an external assessment performed on some other component, that has been validated by a third-party."
  type ValidationAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset & DocumentaryAsset {
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
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # Asset
    name: String!
    description: String
    locations: [AssetLocation]!
    asset_id: String
  }

`;

export default typeDefs ;