import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose, filter } from 'ramda';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Link } from 'react-router-dom';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import { Domain, LinkOff } from '@material-ui/icons';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import AddSubSector from './AddSubSector';
import { addSubSectorsMutationRelationDelete } from './AddSubSectorsLines';
import { commitMutation } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import Security, { KNOWLEDGE_KNUPDATE } from '../../../../utils/Security';

class SectorSubSectorsComponent extends Component {
  removeSubSector(subSectorEdge) {
    commitMutation({
      mutation: addSubSectorsMutationRelationDelete,
      variables: {
        fromId: subSectorEdge.node.id,
        toId: this.props.sector.id,
        relationship_type: 'part-of',
      },
      updater: (store) => {
        const node = store.get(this.props.sector.id);
        const subSectors = node.getLinkedRecord('subSectors');
        const edges = subSectors.getLinkedRecords('edges');
        const newEdges = filter(
          (n) => n.getLinkedRecord('node').getValue('id') !== subSectorEdge.node.id,
          edges,
        );
        subSectors.setLinkedRecords(newEdges, 'edges');
      },
    });
  }

  render() {
    const { t, sector } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <Typography variant="h3" gutterBottom={true} style={{ float: 'left' }}>
          {t('Subsectors')}
        </Typography>
        <Security needs={[KNOWLEDGE_KNUPDATE]}>
          <AddSubSector
            sectorId={sector.id}
            sectorSubSectors={sector.subSectors.edges}
          />
        </Security>
        <div className="clearfix" />
        <List style={{ marginTop: -10 }}>
          {sector.subSectors.edges.map((subSectorEdge) => {
            const subSector = subSectorEdge.node;
            return (
              <ListItem
                key={subSector.id}
                dense={true}
                divider={true}
                button={true}
                component={Link}
                to={`/dashboard/entities/sectors/${subSector.id}`}
              >
                <ListItemIcon>
                  <Domain color="primary" />
                </ListItemIcon>
                <ListItemText primary={subSector.name} />
                <ListItemSecondaryAction>
                  <IconButton
                    aria-label="Remove"
                    onClick={this.removeSubSector.bind(this, subSectorEdge)}
                  >
                    <LinkOff />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </div>
    );
  }
}

SectorSubSectorsComponent.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
  sector: PropTypes.object,
};

const SectorSubSectors = createFragmentContainer(SectorSubSectorsComponent, {
  sector: graphql`
    fragment SectorSubSectors_sector on Sector {
      id
      subSectors {
        edges {
          node {
            id
            name
            description
          }
        }
      }
    }
  `,
});

export default compose(inject18n)(SectorSubSectors);
