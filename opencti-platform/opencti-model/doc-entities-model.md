# Overview


Description text of the page


## Entities


### Domains


#### Attack-Pattern


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| x_mitre_platforms | Platforms | — |string | ✔ | ✅ |
| x_mitre_permissions_required | Permissions required | — |string | ✔ | ✅ |
| x_mitre_detection | Detection | — |string | — | ✅ |
| x_mitre_id | External ID | — |string | — | 🛑 |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| killChainPhases | Kill chain phase | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Campaign


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| objective | Objective | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Note


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Publication date | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| attribute_abstract | Abstract | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| authors | Authors | — |string | ✔ | ✅ |
| note_types | Note types | — |string | ✔ | ✅ |
| likelihood | Likelihood | — |numeric | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Observed-Data


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| first_observed | First observed | — |date | — | ✅ |
| last_observed | Last observed | — |date | — | ✅ |
| number_observed | Number observed | — |numeric | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Opinion


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| explanation | Explanation | — |string | — | ✅ |
| authors | Authors | — |string | ✔ | ✅ |
| opinion | Opinion | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Report


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| report_types | Report types | — |string | ✔ | ✅ |
| x_opencti_reliability | Reliability | — |string | — | ✅ |
| published | Publication date | — |date | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Course-Of-Action


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| x_mitre_id | External ID | — |string | — | ✅ |
| x_opencti_threat_hunting | Threat hunting | — |string | — | ✅ |
| x_opencti_log_sources | Log sources | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Individual


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| contact_information | Contact information | — |string | — | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| identity_class | Identity class | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| x_opencti_reliability | Reliability | — |string | — | ✅ |
| x_opencti_firstname | Firstname | — |string | — | ✅ |
| x_opencti_lastname | Lastname | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Sector


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| contact_information | Contact information | — |string | — | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| identity_class | Identity class | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### System


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| contact_information | Contact information | — |string | — | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| identity_class | Identity class | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| x_opencti_reliability | Reliability | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Infrastructure


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| infrastructure_types | Infrastructure types | — |string | ✔ | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| killChainPhases | Kill chain phase | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Intrusion-Set


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| goals | Goals | — |string | ✔ | ✅ |
| resource_level | Resource level | — |string | — | ✅ |
| primary_motivation | Primary motivation | — |string | — | ✅ |
| secondary_motivations | Secondary motivation | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### City


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| latitude | Latitude | — |numeric | — | ✅ |
| longitude | Longitude | — |numeric | — | ✅ |
| precision | Precision | — |numeric | — | ✅ |
| x_opencti_location_type | Location type | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Country


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| latitude | Latitude | — |numeric | — | ✅ |
| longitude | Longitude | — |numeric | — | ✅ |
| precision | Precision | — |numeric | — | ✅ |
| x_opencti_location_type | Location type | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Region


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| latitude | Latitude | — |numeric | — | ✅ |
| longitude | Longitude | — |numeric | — | ✅ |
| precision | Precision | — |numeric | — | ✅ |
| x_opencti_location_type | Location type | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Position


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| latitude | Latitude | — |numeric | — | ✅ |
| longitude | Longitude | — |numeric | — | ✅ |
| precision | Precision | — |numeric | — | ✅ |
| x_opencti_location_type | Location type | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| postal_code | Postal code | — |string | — | ✅ |
| street_address | Street address | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Malware


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| malware_types | Malware types | — |string | ✔ | ✅ |
| is_family | Is family | — |boolean | — | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| architecture_execution_envs | Architecture execution env. | — |string | ✔ | ✅ |
| implementation_languages | Implementation languages | — |string | ✔ | ✅ |
| capabilities | Capabilities | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| samples | Sample | — | Reference | ✔ | ✅ |
| operatingSystems | Operating System | — | Reference | ✔ | ✅ |
| killChainPhases | Kill chain phase | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Threat-Actor-Group


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| threat_actor_types | Threat actor types | — |string | ✔ | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| goals | Goals | — |string | ✔ | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| sophistication | Sophistication | — |string | — | ✅ |
| resource_level | Resource level | — |string | — | ✅ |
| primary_motivation | Primary motivation | — |string | — | ✅ |
| secondary_motivations | Secondary motivation | — |string | ✔ | ✅ |
| personal_motivations | Personal motivation | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Tool


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| tool_types | Tool types | — |string | ✔ | ✅ |
| tool_version | Tool version | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| killChainPhases | Kill chain phase | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Vulnerability


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| x_opencti_cvss_base_score | Base score | — |numeric | — | ✅ |
| x_opencti_cvss_base_severity | Base severity | — |string | — | ✅ |
| x_opencti_cvss_attack_vector | Attack vector | — |string | — | ✅ |
| x_opencti_cvss_integrity_impact | Integrity impact | — |string | — | ✅ |
| x_opencti_cvss_availability_impact | Availability impact | — |string | — | ✅ |
| x_opencti_cvss_confidentiality_impact | Confidentiality impact | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Incident


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| incident_type | Incident type | — |string | — | ✅ |
| severity | Severity | — |string | — | ✅ |
| source | Source | — |string | — | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| objective | Objective | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Channel


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| channel_types | Channel types | — |string | ✔ | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Language


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Event


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| event_types | Event types | — |string | ✔ | ✅ |
| start_time | Start date | — |date | — | ✅ |
| stop_time | End date | — |date | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Grouping


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| context | Content | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Narrative


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| narrative_types | Narrative types | — |string | ✔ | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Data-Component


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| dataSource | Data source | — | Reference | — | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Data-Source


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| x_mitre_platforms | Platforms | — |string | ✔ | ✅ |
| collection_layers | Layers | — |string | ✔ | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Administrative-Area


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| latitude | Latitude | — |numeric | — | ✅ |
| longitude | Longitude | — |numeric | — | ✅ |
| precision | Precision | — |numeric | — | ✅ |
| x_opencti_location_type | Location type | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Task


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| due_date | Due date | — |date | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Case


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| caseTemplate | Case template | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Case-Incident


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| caseTemplate | Case template | — |string | — | ✅ |
| severity | Severity | — |string | — | ✅ |
| priority | Priority | — |string | — | ✅ |
| response_types | Incident type | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Case-Rfi


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| caseTemplate | Case template | — |string | — | ✅ |
| information_types | Information types | — |string | ✔ | ✅ |
| severity | Severity | — |string | — | ✅ |
| priority | Priority | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Case-Rft


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| caseTemplate | Case template | — |string | — | ✅ |
| takedown_types | Takedown types | — |string | ✔ | ✅ |
| severity | Severity | — |string | — | ✅ |
| priority | Priority | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Feedback


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| caseTemplate | Case template | — |string | — | ✅ |
| rating | Rating | — |numeric | — | ✅ |
| authorized_members | Authorized members | — |object | ✔ | 🛑 |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |


#### Malware-Analysis


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| product | Product | — |string | — | ✅ |
| version | Version | — |string | — | ✅ |
| configuration_version | Configuration version | — |string | — | ✅ |
| modules | Modules | — |string | ✔ | ✅ |
| analysis_engine_version | Analysis engine version | — |string | — | ✅ |
| analysis_definition_version | Analysis definition version | — |string | — | ✅ |
| submitted | Submission date | — |date | — | ✅ |
| analysis_started | Analysis started | — |date | — | ✅ |
| analysis_ended | Analysis ended | — |date | — | ✅ |
| result_name | Result name | — |string | — | ✅ |
| result | Result | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| hostVm | VM Host | — | Reference | — | ✅ |
| operatingSystem | Operating System | — | Reference | — | ✅ |
| installedSoftware | Installed software | — | Reference | ✔ | ✅ |
| analysisSco | Analysis SCO | — | Reference | ✔ | ✅ |
| sample | Sample | — | Reference | — | ✅ |


#### Threat-Actor-Individual


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| threat_actor_types | Threat actor types | — |string | ✔ | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| goals | Goals | — |string | ✔ | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| sophistication | Sophistication | — |string | — | ✅ |
| resource_level | Resource level | — |string | — | ✅ |
| primary_motivation | Primary motivation | — |string | — | ✅ |
| secondary_motivations | Secondary motivation | — |string | ✔ | ✅ |
| personal_motivations | Personal motivations | — |string | ✔ | ✅ |
| date_of_birth | Date of birth | — |date | — | ✅ |
| gender | Gender | — |string | — | ✅ |
| job_title | Job title | — |string | — | ✅ |
| marital_status | Marital status | — |string | — | ✅ |
| eye_color | Eye color | — |string | — | ✅ |
| hair_color | Hair color | — |string | — | ✅ |
| height | Height | — |object | ✔ | ✅ |
| weight | Weight | — |object | ✔ | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| bornIn | Born In | — | Reference | — | ✅ |
| ethnicity | Ethnicity | — | Reference | — | ✅ |


#### Indicator


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| pattern_type | Pattern type | — |string | — | ✅ |
| pattern_version | Pattern version | — |string | — | ✅ |
| pattern | Pattern | — |string | — | ✅ |
| indicator_types | Indicator types | — |string | ✔ | ✅ |
| valid_from | Valid from | — |date | — | ✅ |
| valid_until | Valid until | — |date | — | ✅ |
| x_opencti_score | Score | — |numeric | — | ✅ |
| x_opencti_detection | Detection | — |boolean | — | ✅ |
| x_opencti_main_observable_type | Main observable type | — |string | — | ✅ |
| x_mitre_platforms | Platforms | — |string | ✔ | ✅ |
| decay_next_reaction_date | Decay next reaction date | — |date | — | 🛑 |
| decay_base_score | Decay base score | — |numeric | — | ✅ |
| decay_base_score_date | Decay base score date | — |date | — | 🛑 |
| decay_history | Decay history | — |object | ✔ | 🛑 |
| decay_applied_rule | Decay applied rule | — |object | — | 🛑 |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| killChainPhases | Kill chain phase | — | Reference | ✔ | ✅ |


#### Organization


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| contact_information | Contact information | — |string | — | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| identity_class | Identity class | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| x_opencti_reliability | Reliability | — |string | — | ✅ |
| default_dashboard | Default dashboard | — |string | — | ✅ |
| x_opencti_organization_type | Organization type | — |string | — | ✅ |
| default_hidden_types | Default hidden types | — |string | ✔ | ✅ |
| authorized_authorities | Authorized authorities | — |string | ✔ | 🛑 |
| grantable_groups | Grantable groups | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


### Observables


#### Attack-Pattern


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| x_mitre_platforms | Platforms | — |string | ✔ | ✅ |
| x_mitre_permissions_required | Permissions required | — |string | ✔ | ✅ |
| x_mitre_detection | Detection | — |string | — | ✅ |
| x_mitre_id | External ID | — |string | — | 🛑 |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| killChainPhases | Kill chain phase | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Campaign


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| objective | Objective | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Note


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Publication date | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| attribute_abstract | Abstract | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| authors | Authors | — |string | ✔ | ✅ |
| note_types | Note types | — |string | ✔ | ✅ |
| likelihood | Likelihood | — |numeric | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Observed-Data


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| first_observed | First observed | — |date | — | ✅ |
| last_observed | Last observed | — |date | — | ✅ |
| number_observed | Number observed | — |numeric | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Opinion


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| explanation | Explanation | — |string | — | ✅ |
| authors | Authors | — |string | ✔ | ✅ |
| opinion | Opinion | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Report


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| report_types | Report types | — |string | ✔ | ✅ |
| x_opencti_reliability | Reliability | — |string | — | ✅ |
| published | Publication date | — |date | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Course-Of-Action


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| x_mitre_id | External ID | — |string | — | ✅ |
| x_opencti_threat_hunting | Threat hunting | — |string | — | ✅ |
| x_opencti_log_sources | Log sources | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Individual


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| contact_information | Contact information | — |string | — | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| identity_class | Identity class | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| x_opencti_reliability | Reliability | — |string | — | ✅ |
| x_opencti_firstname | Firstname | — |string | — | ✅ |
| x_opencti_lastname | Lastname | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Sector


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| contact_information | Contact information | — |string | — | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| identity_class | Identity class | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### System


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| contact_information | Contact information | — |string | — | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| identity_class | Identity class | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| x_opencti_reliability | Reliability | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Infrastructure


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| infrastructure_types | Infrastructure types | — |string | ✔ | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| killChainPhases | Kill chain phase | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Intrusion-Set


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| goals | Goals | — |string | ✔ | ✅ |
| resource_level | Resource level | — |string | — | ✅ |
| primary_motivation | Primary motivation | — |string | — | ✅ |
| secondary_motivations | Secondary motivation | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### City


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| latitude | Latitude | — |numeric | — | ✅ |
| longitude | Longitude | — |numeric | — | ✅ |
| precision | Precision | — |numeric | — | ✅ |
| x_opencti_location_type | Location type | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Country


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| latitude | Latitude | — |numeric | — | ✅ |
| longitude | Longitude | — |numeric | — | ✅ |
| precision | Precision | — |numeric | — | ✅ |
| x_opencti_location_type | Location type | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Region


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| latitude | Latitude | — |numeric | — | ✅ |
| longitude | Longitude | — |numeric | — | ✅ |
| precision | Precision | — |numeric | — | ✅ |
| x_opencti_location_type | Location type | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Position


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| latitude | Latitude | — |numeric | — | ✅ |
| longitude | Longitude | — |numeric | — | ✅ |
| precision | Precision | — |numeric | — | ✅ |
| x_opencti_location_type | Location type | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| postal_code | Postal code | — |string | — | ✅ |
| street_address | Street address | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Malware


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| malware_types | Malware types | — |string | ✔ | ✅ |
| is_family | Is family | — |boolean | — | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| architecture_execution_envs | Architecture execution env. | — |string | ✔ | ✅ |
| implementation_languages | Implementation languages | — |string | ✔ | ✅ |
| capabilities | Capabilities | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| samples | Sample | — | Reference | ✔ | ✅ |
| operatingSystems | Operating System | — | Reference | ✔ | ✅ |
| killChainPhases | Kill chain phase | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Threat-Actor-Group


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| threat_actor_types | Threat actor types | — |string | ✔ | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| goals | Goals | — |string | ✔ | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| sophistication | Sophistication | — |string | — | ✅ |
| resource_level | Resource level | — |string | — | ✅ |
| primary_motivation | Primary motivation | — |string | — | ✅ |
| secondary_motivations | Secondary motivation | — |string | ✔ | ✅ |
| personal_motivations | Personal motivation | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Tool


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| tool_types | Tool types | — |string | ✔ | ✅ |
| tool_version | Tool version | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| killChainPhases | Kill chain phase | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Vulnerability


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| x_opencti_cvss_base_score | Base score | — |numeric | — | ✅ |
| x_opencti_cvss_base_severity | Base severity | — |string | — | ✅ |
| x_opencti_cvss_attack_vector | Attack vector | — |string | — | ✅ |
| x_opencti_cvss_integrity_impact | Integrity impact | — |string | — | ✅ |
| x_opencti_cvss_availability_impact | Availability impact | — |string | — | ✅ |
| x_opencti_cvss_confidentiality_impact | Confidentiality impact | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Incident


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| incident_type | Incident type | — |string | — | ✅ |
| severity | Severity | — |string | — | ✅ |
| source | Source | — |string | — | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| objective | Objective | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Channel


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| channel_types | Channel types | — |string | ✔ | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Language


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Event


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| event_types | Event types | — |string | ✔ | ✅ |
| start_time | Start date | — |date | — | ✅ |
| stop_time | End date | — |date | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Grouping


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| context | Content | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Narrative


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| narrative_types | Narrative types | — |string | ✔ | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Data-Component


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| dataSource | Data source | — | Reference | — | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Data-Source


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| x_mitre_platforms | Platforms | — |string | ✔ | ✅ |
| collection_layers | Layers | — |string | ✔ | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Administrative-Area


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| latitude | Latitude | — |numeric | — | ✅ |
| longitude | Longitude | — |numeric | — | ✅ |
| precision | Precision | — |numeric | — | ✅ |
| x_opencti_location_type | Location type | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


#### Task


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| due_date | Due date | — |date | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Case


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| caseTemplate | Case template | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |


#### Case-Incident


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| caseTemplate | Case template | — |string | — | ✅ |
| severity | Severity | — |string | — | ✅ |
| priority | Priority | — |string | — | ✅ |
| response_types | Incident type | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Case-Rfi


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| caseTemplate | Case template | — |string | — | ✅ |
| information_types | Information types | — |string | ✔ | ✅ |
| severity | Severity | — |string | — | ✅ |
| priority | Priority | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Case-Rft


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| caseTemplate | Case template | — |string | — | ✅ |
| takedown_types | Takedown types | — |string | ✔ | ✅ |
| severity | Severity | — |string | — | ✅ |
| priority | Priority | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| objectParticipant | Participants | — | Reference | ✔ | ✅ |


#### Feedback


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| content | Content | — |string | — | ✅ |
| content_mapping | Content mapping | — |string | — | ✅ |
| caseTemplate | Case template | — |string | — | ✅ |
| rating | Rating | — |numeric | — | ✅ |
| authorized_members | Authorized members | — |object | ✔ | 🛑 |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objects | Contains | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |


#### Malware-Analysis


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| product | Product | — |string | — | ✅ |
| version | Version | — |string | — | ✅ |
| configuration_version | Configuration version | — |string | — | ✅ |
| modules | Modules | — |string | ✔ | ✅ |
| analysis_engine_version | Analysis engine version | — |string | — | ✅ |
| analysis_definition_version | Analysis definition version | — |string | — | ✅ |
| submitted | Submission date | — |date | — | ✅ |
| analysis_started | Analysis started | — |date | — | ✅ |
| analysis_ended | Analysis ended | — |date | — | ✅ |
| result_name | Result name | — |string | — | ✅ |
| result | Result | — |string | — | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| objectAssignee | Assignees | — | Reference | ✔ | ✅ |
| hostVm | VM Host | — | Reference | — | ✅ |
| operatingSystem | Operating System | — | Reference | — | ✅ |
| installedSoftware | Installed software | — | Reference | ✔ | ✅ |
| analysisSco | Analysis SCO | — | Reference | ✔ | ✅ |
| sample | Sample | — | Reference | — | ✅ |


#### Threat-Actor-Individual


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| threat_actor_types | Threat actor types | — |string | ✔ | ✅ |
| first_seen | First seen | — |date | — | ✅ |
| last_seen | Last seen | — |date | — | ✅ |
| goals | Goals | — |string | ✔ | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| sophistication | Sophistication | — |string | — | ✅ |
| resource_level | Resource level | — |string | — | ✅ |
| primary_motivation | Primary motivation | — |string | — | ✅ |
| secondary_motivations | Secondary motivation | — |string | ✔ | ✅ |
| personal_motivations | Personal motivations | — |string | ✔ | ✅ |
| date_of_birth | Date of birth | — |date | — | ✅ |
| gender | Gender | — |string | — | ✅ |
| job_title | Job title | — |string | — | ✅ |
| marital_status | Marital status | — |string | — | ✅ |
| eye_color | Eye color | — |string | — | ✅ |
| hair_color | Hair color | — |string | — | ✅ |
| height | Height | — |object | ✔ | ✅ |
| weight | Weight | — |object | ✔ | ✅ |
| aliases | Aliases | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| bornIn | Born In | — | Reference | — | ✅ |
| ethnicity | Ethnicity | — | Reference | — | ✅ |


#### Indicator


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| pattern_type | Pattern type | — |string | — | ✅ |
| pattern_version | Pattern version | — |string | — | ✅ |
| pattern | Pattern | — |string | — | ✅ |
| indicator_types | Indicator types | — |string | ✔ | ✅ |
| valid_from | Valid from | — |date | — | ✅ |
| valid_until | Valid until | — |date | — | ✅ |
| x_opencti_score | Score | — |numeric | — | ✅ |
| x_opencti_detection | Detection | — |boolean | — | ✅ |
| x_opencti_main_observable_type | Main observable type | — |string | — | ✅ |
| x_mitre_platforms | Platforms | — |string | ✔ | ✅ |
| decay_next_reaction_date | Decay next reaction date | — |date | — | 🛑 |
| decay_base_score | Decay base score | — |numeric | — | ✅ |
| decay_base_score_date | Decay base score date | — |date | — | 🛑 |
| decay_history | Decay history | — |object | ✔ | 🛑 |
| decay_applied_rule | Decay applied rule | — |object | — | 🛑 |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |
| objectOrganization | Granted by | — | Reference | ✔ | ✅ |
| killChainPhases | Kill chain phase | — | Reference | ✔ | ✅ |


#### Organization


|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |
| -------------- | ------- | ------------- | ------ | ----------- | ------------- |
| internal_id | Internal id | — |string | — | 🛑 |
| standard_id | Id | — |string | — | 🛑 |
| parent_types | Parent types | — |string | ✔ | ✅ |
| base_type | Base type | — |string | — | ✅ |
| entity_type | Entity type | — |string | — | ✅ |
| created_at | Created at | — |date | — | ✅ |
| updated_at | Updated at | — |date | — | ✅ |
| creator_id | Creators | — |string | ✔ | ✅ |
| x_opencti_stix_ids | STIX IDs | — |string | ✔ | 🛑 |
| created | Created | — |date | — | ✅ |
| modified | Modified | — |date | — | ✅ |
| x_opencti_files | Files | — |object | ✔ | ✅ |
| lang | Lang | — |string | — | ✅ |
| confidence | Confidence | — |numeric | — | ✅ |
| revoked | Revoked | — |boolean | — | ✅ |
| x_opencti_graph_data | Graph data | — |string | — | ✅ |
| x_opencti_workflow_id | Workflow status | — |string | — | ✅ |
| name | Name | — |string | — | ✅ |
| description | Description | — |string | — | ✅ |
| contact_information | Contact information | — |string | — | ✅ |
| roles | Roles | — |string | ✔ | ✅ |
| identity_class | Identity class | — |string | — | ✅ |
| x_opencti_aliases | Aliases | — |string | ✔ | ✅ |
| x_opencti_reliability | Reliability | — |string | — | ✅ |
| default_dashboard | Default dashboard | — |string | — | ✅ |
| x_opencti_organization_type | Organization type | — |string | — | ✅ |
| default_hidden_types | Default hidden types | — |string | ✔ | ✅ |
| authorized_authorities | Authorized authorities | — |string | ✔ | 🛑 |
| grantable_groups | Grantable groups | — |string | ✔ | ✅ |
| createdBy | Author | — | Reference | — | ✅ |
| objectMarking | Markings | — | Reference | ✔ | ✅ |
| objectLabel | Label | — | Reference | ✔ | ✅ |
| externalReferences | External reference | — | Reference | ✔ | ✅ |
| xOpenctiLinkedTo | Linked to | — | Reference | ✔ | ✅ |


### Stix Relationships


#### delivers


#### targets


#### uses


#### beacons-to


#### attributed-to


#### exfiltrates-to


#### compromises


#### downloads


#### exploits


#### characterizes


#### analysis-of


#### static-analysis-of


#### dynamic-analysis-of


#### derived-from


#### duplicate-of


#### originates-from


#### investigates


#### located-at


#### based-on


#### hosts


#### owns


#### authored-by


#### communicates-with


#### mitigates


#### controls


#### has


#### consists-of


#### indicates


#### variant-of


#### impersonates


#### remediates


#### related-to


#### drops


#### part-of


#### cooperates-with


#### participates-in


#### subtechnique-of


#### revoked-by


#### belongs-to


#### resolves-to


#### detects


#### publishes


#### amplifies


#### subnarrative-of


#### employed-by


#### resides-in


#### citizen-of


#### national-of

