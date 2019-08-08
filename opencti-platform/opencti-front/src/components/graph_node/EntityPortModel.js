import { PortModel } from 'storm-react-diagrams';
import { mergeRight } from 'ramda';
import EntityLinkModel from './EntityLinkModel';

export default class EntityPortModel extends PortModel {
  constructor(pos = 'top') {
    super(pos, 'entity');
    this.position = pos;
  }

  serialize() {
    return mergeRight(super.serialize(), {
      position: this.position,
    });
  }

  deSerialize(data, engine) {
    super.deSerialize(data, engine);
    this.position = data.position;
  }

  static createLinkModel() {
    return new EntityLinkModel();
  }
}
