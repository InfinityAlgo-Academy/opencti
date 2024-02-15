/* eslint-disable */
// noinspection ES6UnusedImports,ES6CheckImport

import fs from 'node:fs';
import { exec } from 'node:child_process';
import _ from '../src/modules/index';
import {schemaAttributesDefinition} from "../src/schema/schema-attributes";
import {isAbstract} from "../src/schema/general";
import {isStixCoreObject} from "../src/schema/stixCoreObject";
import {isStixCoreRelationship} from "../src/schema/stixCoreRelationship";
import {isEmptyField} from "../src/database/utils";
import {schemaRelationsRefDefinition} from "../src/schema/schema-relationsRef";
import {isStixDomainObject} from "../src/schema/stixDomainObject";

// region model.md
const modelDoc = ['# Overview'];
modelDoc.push('\r\n');
modelDoc.push('Description text of the page');
modelDoc.push('\r\n');
const elements = Object.keys(schemaAttributesDefinition.attributes);
modelDoc.push('## Entities');
modelDoc.push('\r\n');
// region entities
const attributesGenerator = (entities) => {
    for (let indexEntity = 0; indexEntity < entities.length; indexEntity += 1) {
        const entity = entities[indexEntity];
        modelDoc.push('#### ' + entity);
        modelDoc.push('\r\n');
        const allAttributes = Array.from(schemaAttributesDefinition.getAttributes(entity).values());
        const attributes = allAttributes.filter((a) => a.name !== 'id' && !a.name.startsWith('i_'))
        modelDoc.push('|   Input name   |  Label  |  Description  |  Type  |  Multiple?  |  filterable?  |')
        modelDoc.push('| -------------- | ------- | ------------- | ------ | ----------- | ------------- |')
        // region attributes
        for (let attrIndex = 0; attrIndex < attributes.length; attrIndex += 1) {
            const filterAttribute = attributes[attrIndex];
            modelDoc.push('| '
                + filterAttribute.name +  ' | '
                + filterAttribute.label + ' |'
                + (isEmptyField(filterAttribute.description) ? ' — |' : (filterAttribute.description + ' |'))
                + filterAttribute.type + ' |'
                + (filterAttribute.multiple ? ' ✔ |' : ' — |')
                + (filterAttribute.isFilterable ? ' ✅ |' : ' 🛑 |')
            )
        }
        // endregion
        // region references
        const refAttributes = schemaRelationsRefDefinition.getRelationsRef(entity);
        for (let refIndex = 0; refIndex < refAttributes.length; refIndex += 1) {
            const refAttribute = refAttributes[refIndex];
            modelDoc.push('| '
                + refAttribute.name +  ' | '
                + refAttribute.label + ' |'
                + (isEmptyField(refAttribute.description) ? ' — |' : (refAttribute.description + ' |'))
                + ' Reference |'
                + (refAttribute.multiple ? ' ✔ |' : ' — |')
                + ' ✅ |'
            )
        }
        // endregion
        modelDoc.push('\r\n');
    }
}
const domainEntities = elements.filter((e) => !isAbstract(e) && isStixDomainObject(e));
modelDoc.push('### Domains');
modelDoc.push('\r\n');
attributesGenerator(domainEntities);
const observableEntities = elements.filter((e) => !isAbstract(e) && isStixDomainObject(e));
modelDoc.push('### Observables');
modelDoc.push('\r\n');
attributesGenerator(observableEntities);

// endregion
// region relationships
modelDoc.push('### Stix Relationships');
modelDoc.push('\r\n');
const relationships = elements.filter((e) => !isAbstract(e) && isStixCoreRelationship(e));
for (let indexRelationship = 0; indexRelationship < relationships.length; indexRelationship += 1) {
    const relationship = relationships[indexRelationship];
    modelDoc.push('#### ' + relationship);
    modelDoc.push('\r\n');
}
// endregion
const modelMarkdown = modelDoc.join('\r\n');
fs.writeFileSync('../opencti-model/doc-entities-model.md', modelMarkdown);
// endregion

// region attributes.md
const attrDoc = ['# Overview'];
attrDoc.push('\r\n');
attrDoc.push('Description text of the page');
attrDoc.push('\r\n');
const coreEntities = elements.filter((e) => !isAbstract(e) && isStixCoreObject(e));
// const attributesModel = Array.from(schemaAttributesDefinition.allAttributes.keys());
const attributesModel = {};
for (let attrIndex = 0; attrIndex < coreEntities.length; attrIndex++) {
    const coreEntity = coreEntities[attrIndex];
    const rawAttributes = Array.from(schemaAttributesDefinition.getAttributes(coreEntity).values());
    const attributes = rawAttributes.filter((a) => a.name !== 'id' && !a.name.startsWith('i_'))
    for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attributesModel[attr.name]) {
            const current = attributesModel[attr.name];
            attributesModel[attr.name] = { ...current, entities: [...current.entities, coreEntity], rank: current.rank + 1 };
        } else {
            attributesModel[attr.name] = { ...attr, entities: [coreEntity], rank: 1 };
        }
    }
}
const entries = Object.values(attributesModel).sort((a, b) => b.rank - a.rank);
for (let entryIndex = 0; entryIndex < entries.length; entryIndex += 1) {
    const entry = entries[entryIndex];
    attrDoc.push('#### ' + entry.name + ' (' + entry.label + ')');
    attrDoc.push('\r\n');
    attrDoc.push('Used by **' + entry.rank + '** types: ' + entry.entities.join(', '));
}

const attrDocMarkdown = attrDoc.join('\r\n');
fs.writeFileSync('../opencti-model/doc-attributes-model.md', attrDocMarkdown);
// endregion

// region entities viz
const dot2 = `digraph UML_Class_diagram {
    graph [
        label="OpenCTI Entities model"
        labelloc="t"
        fontname="Helvetica,Arial,sans-serif"
    ]
    node [
        fontname="Helvetica,Arial,sans-serif"
        shape=record
        style=filled
        fillcolor=gray95
    ]
    edge [fontname="Helvetica,Arial,sans-serif"]
    edge [arrowhead=vee style=dashed]
    
    Stix-Object [
        shape=plain
        label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="4">
            <tr> 
                <td> <b>Stix-Object</b> </td> 
            </tr>
            <tr> 
                <td>
                    <table border="0" cellborder="0" cellspacing="0" >
                        <tr> <td align="left">+ property</td> </tr>
                        <tr> <td align="left" port="r1">- resource</td> </tr>
                        <tr> <td align="left">...</td> </tr>
                    </table>
                </td> 
            </tr>
            <tr>
                <td align="left">
                    + method<br/>
                    ...<br align="left"/>
                </td>
            </tr>
        </table>>
    ]
`;

const dot = `digraph UML_Class_diagram {
\tgraph [
\t\tlabel="UML Class diagram demo"
\t\tlabelloc="t"
\t\tfontname="Helvetica,Arial,sans-serif"
\t]
\tnode [
\t\tfontname="Helvetica,Arial,sans-serif"
\t\tshape=record
\t\tstyle=filled
\t\tfillcolor=gray95
\t]
\tedge [fontname="Helvetica,Arial,sans-serif"]
\tedge [arrowhead=vee style=dashed]
\tClient -> Interface1 [label=dependency]
\tClient -> Interface2

\tedge [dir=back arrowtail=empty style=""]
\tInterface1 -> Class1 [xlabel=inheritance]
\tInterface2 -> Class1 [dir=none]
\tInterface2 [label="" xlabel="Simple\\ninterface" shape=circle]

\tInterface1[label = <{<b>«interface» I/O</b> | + property<br align="left"/>...<br align="left"/>|+ method<br align="left"/>...<br align="left"/>}>]
\tClass1[label = <{<b>I/O class</b> | + property<br align="left"/>...<br align="left"/>|+ method<br align="left"/>...<br align="left"/>}>]
\tedge [dir=back arrowtail=empty style=dashed]
\tClass1 -> System_1 [label=implementation]
\tSystem_1 [
\t\tshape=plain
\t\tlabel=<<table border="0" cellborder="1" cellspacing="0" cellpadding="4">
\t\t\t<tr> <td> <b>System</b> </td> </tr>
\t\t\t<tr> <td>
\t\t\t\t<table border="0" cellborder="0" cellspacing="0" >
\t\t\t\t\t<tr> <td align="left" >+ property</td> </tr>
\t\t\t\t\t<tr> <td port="ss1" align="left" >- Subsystem 1</td> </tr>
\t\t\t\t\t<tr> <td port="ss2" align="left" >- Subsystem 2</td> </tr>
\t\t\t\t\t<tr> <td port="ss3" align="left" >- Subsystem 3</td> </tr>
\t\t\t\t\t<tr> <td align="left">...</td> </tr>
\t\t\t\t</table>
\t\t\t</td> </tr>
\t\t\t<tr> <td align="left">+ method<br/>...<br align="left"/></td> </tr>
\t\t</table>>
\t]

\tedge [dir=back arrowtail=diamond]
\tSystem_1 -> Subsystem_1 [xlabel="composition"]

\tSubsystem_1 [
\t\tshape=plain
\t\tlabel=<<table border="0" cellborder="1" cellspacing="0" cellpadding="4">
\t\t\t<tr> <td> <b>Subsystem 1</b> </td> </tr>
\t\t\t<tr> <td>
\t\t\t\t<table border="0" cellborder="0" cellspacing="0" >
\t\t\t\t\t<tr> <td align="left">+ property</td> </tr>
\t\t\t\t\t<tr> <td align="left" port="r1">- resource</td> </tr>
\t\t\t\t\t<tr> <td align="left">...</td> </tr>
\t\t\t\t</table>
\t\t\t\t</td> </tr>
\t\t\t<tr> <td align="left">
\t\t\t\t+ method<br/>
\t\t\t\t...<br align="left"/>
\t\t\t</td> </tr>
\t\t</table>>
\t]
\tSubsystem_2 [
\t\tshape=plain
\t\tlabel=<<table border="0" cellborder="1" cellspacing="0" cellpadding="4">
\t\t\t<tr> <td> <b>Subsystem 2</b> </td> </tr>
\t\t\t<tr> <td>
\t\t\t\t<table align="left" border="0" cellborder="0" cellspacing="0" >
\t\t\t\t\t<tr> <td align="left">+ property</td> </tr>
\t\t\t\t\t<tr> <td align="left" port="r1">- resource</td> </tr>
\t\t\t\t\t<tr> <td align="left">...</td> </tr>
\t\t\t\t</table>
\t\t\t\t</td> </tr>
\t\t\t<tr> <td align="left">
\t\t\t\t+ method<br/>
\t\t\t\t...<br align="left"/>
\t\t\t</td> </tr>
\t\t</table>>
\t]
\tSubsystem_3 [
\t\tshape=plain
\t\tlabel=<<table border="0" cellborder="1" cellspacing="0" cellpadding="4">
\t\t\t<tr> <td> <b>Subsystem 3</b> </td> </tr>
\t\t\t<tr> <td>
\t\t\t\t<table border="0" cellborder="0" cellspacing="0" >
\t\t\t\t\t<tr> <td align="left">+ property</td> </tr>
\t\t\t\t\t<tr> <td align="left" port="r1">- resource</td> </tr>
\t\t\t\t\t<tr> <td align="left">...</td> </tr>
\t\t\t\t</table>
\t\t\t\t</td> </tr>
\t\t\t<tr> <td align="left">
\t\t\t\t+ method<br/>
\t\t\t\t...<br align="left"/>
\t\t\t</td> </tr>
\t\t</table>>
\t]
\tSystem_1 -> Subsystem_2;
\tSystem_1 -> Subsystem_3;

\tedge [xdir=back arrowtail=odiamond]
\tSubsystem_1:r1 -> "Shared resource" [label=aggregation]
\tSubsystem_2:r1 -> "Shared resource"
\tSubsystem_3:r1 -> "Shared resource"
\t"Shared resource" [
\t\tlabel = <{
\t\t\t<b>Shared resource</b>
\t\t\t|
\t\t\t\t+ property<br align="left"/>
\t\t\t\t...<br align="left"/>
\t\t\t|
\t\t\t\t+ method<br align="left"/>
\t\t\t\t...<br align="left"/>
\t\t\t}>
\t]
}`
fs.writeFileSync('../opencti-model/doc-graph-model.dot', dot2);

exec('dot -Tsvg -O ../opencti-model/doc-graph-model.dot');

// graphviz.parse(dot, (g) => {
//     console.log(g);
//     g.output('svg', `../doc-graph-model.svg`);
// }, (err) => {
//     console.log(err);
// });
// graphviz.circo(dot, 'svg').then((svg) => {
//     // Write the SVG to file
//     fs.writeFileSync('../doc-graph-model.svg', svg);
// });
// endregion