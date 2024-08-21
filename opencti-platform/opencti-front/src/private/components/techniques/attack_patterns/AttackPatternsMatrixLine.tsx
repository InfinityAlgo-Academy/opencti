import React, { FunctionComponent } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import StixCoreObjectLabels from '@components/common/stix_core_objects/StixCoreObjectLabels';
import {
  StixDomainObjectAttackPatternsKillChainContainer_data$data,
} from '@components/common/stix_domain_objects/__generated__/StixDomainObjectAttackPatternsKillChainContainer_data.graphql';
import { KeyboardArrowRightOutlined } from '@mui/icons-material';
import { AttackPatternsMatrixLine_node$data, AttackPatternsMatrixLine_node$key } from '@components/techniques/attack_patterns/__generated__/AttackPatternsMatrixLine_node.graphql';
import Skeleton from '@mui/material/Skeleton';
import { emptyFilled, truncate } from '../../../../utils/String';
import { DataColumns } from '../../../../components/list_lines';
import ItemIcon from '../../../../components/ItemIcon';
import { HandleAddFilter } from '../../../../utils/hooks/useLocalStorage';
import ItemMarkings from '../../../../components/ItemMarkings';

export type AttackPatternNode = NonNullable<NonNullable<StixDomainObjectAttackPatternsKillChainContainer_data$data>['attackPatterns']>['edges'][0]['node'];

interface AttackPatternsMatrixLineProps {
  node: AttackPatternsMatrixLine_node$key
  dataColumns: DataColumns;
  attackPatterns: NonNullable<NonNullable<StixDomainObjectAttackPatternsKillChainContainer_data$data>['attackPatterns']>['edges'][0]['node'][];
  onLabelClick: HandleAddFilter;
  onToggleEntity: (
    entity: AttackPatternsMatrixLine_node$data,
    event?: React.SyntheticEvent
  ) => void;
  onToggleShiftEntity: (
    index: number,
    entity: AttackPatternsMatrixLine_node$data,
    event?: React.SyntheticEvent
  ) => void;
  selectedElements: Record<string, AttackPatternsMatrixLine_node$data>;
  deSelectedElements: Record<string, AttackPatternsMatrixLine_node$data>;
  selectAll: boolean;
  index: number;
}

const attackPatternsMatrixLineFragment = graphql`
fragment AttackPatternsMatrixLine_node on AttackPattern {
  id
  entity_type
  parent_types
  name
  description
  isSubAttackPattern
  x_mitre_id
  objectMarking {
    id
    definition_type
    definition
    x_opencti_order
    x_opencti_color
  }
  created
  modified
  objectLabel {
    id
    value
    color
  }
  subAttackPatterns {
    edges {
      node {
        id
        name
        description
        x_mitre_id
      }
    }
  }
  killChainPhases {
    id
    kill_chain_name
    phase_name
    x_opencti_order
  }
  creators {
    id
    name
  }
}
`;

const AttackPatternsMatrixLine: FunctionComponent<AttackPatternsMatrixLineProps> = ({
  dataColumns,
  node,
  attackPatterns,
  onLabelClick,
  onToggleEntity,
  onToggleShiftEntity,
  selectedElements,
  deSelectedElements,
  selectAll,
  index,
}) => {
  const theme = useTheme();
  const data = useFragment(attackPatternsMatrixLineFragment, node);
  const killChainNames = (data.killChainPhases || []).map((phase) => phase.kill_chain_name).join(', ');
  const phaseName = (data.killChainPhases && data.killChainPhases.length > 0) ? data.killChainPhases[0].phase_name : '';

  console.log('data in line', data);
  console.log('attackPatterns in line', attackPatterns);

  return (
    <div
      style={{
        height: 'calc(100vh - 310px)',
        margin: '10px 0 -24px 0',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        paddingBottom: 20,
      }}
    >
      <ListItem
        key={data.id}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '0 10px',
        }}
        divider={true}
        button={true}
        component={Link}
        to={`/dashboard/techniques/attack_patterns/${data.id}`}
      >
        <ListItemIcon
          style={{ color: theme.palette.primary.main, minWidth: 40 }}
          onClick={(event) => (event.shiftKey
            ? onToggleShiftEntity(index, data, event)
            : onToggleEntity(data, event))
                  }
        >
          <Checkbox
            edge="start"
            checked={
                        (selectAll && !(data.id in (deSelectedElements || {})))
                        || data.id in (selectedElements || {})
                    }
            disableRipple={true}
          />
        </ListItemIcon>
        <ListItemIcon style={{ color: theme.palette.primary.main }}>
          <ItemIcon type="Attack-Pattern" />
        </ListItemIcon>
        <ListItemText
          primary={
            <div
              key={data.id}
              style={{
                display: 'flex',
                flexDirection: 'row',
                borderBottom: theme.palette.divider,
                marginBottom: 10,
              }}
            >
              <Tooltip title={`[${killChainNames}] ${phaseName}`}>
                <div style={{ width: dataColumns.killChainPhase.width as string | number }}>
                  [{truncate(killChainNames, 15)}] {truncate(phaseName, 15)}
                </div>
              </Tooltip>
              <div style={{ width: dataColumns.x_mitre_id.width as string | number }}>
                {emptyFilled(data.x_mitre_id)}
              </div>
              <div style={{ width: dataColumns.name.width as string | number }}>
                {data.name}
              </div>
              <div style={{ width: dataColumns.objectLabel.width as string | number }}>
                <StixCoreObjectLabels
                  variant="inList"
                  labels={data.objectLabel}
                  onClick={onLabelClick}
                />
              </div>
              <div style={{ width: dataColumns.created.width as string | number }}>
                {data.created}
              </div>
              <div>
                <ItemMarkings
                  variant="inList"
                  markingDefinitions={data.objectMarking ?? []}
                  limit={1}
                />
              </div>
            </div>
                  }
        />
        <ListItemIcon style={{ position: 'absolute', right: -10 }}>
          <KeyboardArrowRightOutlined />
        </ListItemIcon>
      </ListItem>
    </div>
  );
};

export const AttackPatternsMatrixLineDummy = ({
  dataColumns,
}: {
  dataColumns: DataColumns;
}) => {
  const theme = useTheme();

  return (
    <ListItem style={{ paddingLeft: 10, height: 50 }} divider={true}>
      <ListItemIcon style={{ color: theme.palette.primary.main }}>
        <Skeleton
          animation="wave"
          variant="circular"
          width={30}
          height={30}
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            <div style={{ width: dataColumns.killChainPhase.width }}>
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
            <div style={{ width: dataColumns.x_mitre_id.width }}>
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
            <div style={{ width: dataColumns.name.width }}>
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
            <div style={{ width: dataColumns.objectLabel.width }}>
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
            <div style={{ width: dataColumns.created.width }}>
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
            <div style={{ width: dataColumns.objectMarking.width }}>
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
          </>
              }
      />
      <ListItemIcon style={{ position: 'absolute', right: -10 }}>
        <KeyboardArrowRightOutlined color="disabled" />
      </ListItemIcon>
    </ListItem>
  );
};

export default AttackPatternsMatrixLine;
