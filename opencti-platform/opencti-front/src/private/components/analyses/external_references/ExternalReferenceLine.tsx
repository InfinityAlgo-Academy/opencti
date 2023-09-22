import React, { FunctionComponent } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { KeyboardArrowRightOutlined } from '@mui/icons-material';
import Skeleton from '@mui/material/Skeleton';
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import makeStyles from '@mui/styles/makeStyles';
import Checkbox from '@mui/material/Checkbox';
import { Theme } from '../../../../components/Theme';
import { useFormatter } from '../../../../components/i18n';
import { ExternalReferenceLine_node$data } from './__generated__/ExternalReferenceLine_node.graphql';
import ItemIcon from '../../../../components/ItemIcon';

const useStyles = makeStyles<Theme>((theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
    cursor: 'pointer',
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
  itemIconDisabled: {
    color: theme.palette.grey?.[700],
  },
}));

interface ExternalReferenceLineComponentProps {
  dataColumns?: {
    source_name: {
      label: string;
      width: string;
      isSortable: boolean;
    };
    external_id: {
      label: string;
      width: string;
      isSortable: boolean;
    };
    url: {
      label: string;
      width: string;
      isSortable: boolean;
    };
    creator: {
      label: string;
      width: string;
      isSortable: boolean;
    };
    created: {
      label: string;
      width: string;
      isSortable: boolean;
    };
  };
  node: ExternalReferenceLine_node$data;
  selectedElements: Record<string, ExternalReferenceLine_node$data>;
  deSelectedElements: Record<string, ExternalReferenceLine_node$data>;
  onToggleEntity: (
    entity: ExternalReferenceLine_node$data,
    event: React.SyntheticEvent
  ) => void;
  selectAll: boolean;
  onToggleShiftEntity: (
    index: number,
    entity: ExternalReferenceLine_node$data,
    event: React.SyntheticEvent
  ) => void;
  index: number;
}

const ExternalReferenceLineComponent: FunctionComponent<
ExternalReferenceLineComponentProps
> = ({
  dataColumns,
  node,
  selectedElements,
  deSelectedElements,
  onToggleEntity,
  selectAll,
  onToggleShiftEntity,
  index,
}) => {
  const classes = useStyles();
  const { fd } = useFormatter();
  return (
    <ListItem
      classes={{ root: classes.item }}
      divider={true}
      button={true}
      component={Link}
      to={`/dashboard/analyses/external_references/${node?.id}`}
    >
      <ListItemIcon
        classes={{ root: classes.itemIcon }}
        style={{ minWidth: 40 }}
        onClick={(event) => (event.shiftKey
          ? onToggleShiftEntity(index, node, event)
          : onToggleEntity(node, event))
        }
      >
        <Checkbox
          edge="start"
          checked={
            (selectAll
              && !((node?.id || 'id') in (deSelectedElements || {})))
            || (node?.id || 'id') in (selectedElements || {})
          }
          disableRipple={true}
        />
      </ListItemIcon>
      <ListItemIcon classes={{ root: classes.itemIcon }}>
        <ItemIcon type="External-Reference" />
      </ListItemIcon>
      <ListItemText
        primary={
          <div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns?.source_name.width }}
            >
              {node?.source_name}
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns?.external_id.width }}
            >
              {node?.external_id}
            </div>
            <Tooltip title={node?.url}>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns?.url.width }}
              >
                {node?.url}
              </div>
            </Tooltip>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns?.creator.width }}
            >
              {(node?.creators ?? []).map((c) => c?.name).join(', ')}
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns?.created.width }}
            >
              {fd(node?.created)}
            </div>
          </div>
        }
      />
      <ListItemSecondaryAction>
        <KeyboardArrowRightOutlined />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const ExternalReferenceLineFragment = createFragmentContainer(
  ExternalReferenceLineComponent,
  {
    node: graphql`
      fragment ExternalReferenceLine_node on ExternalReference {
        id
        entity_type
        source_name
        external_id
        url
        created
        creators {
          id
          name
        }
      }
    `,
  },
);

export const ExternalReferenceLine = ExternalReferenceLineFragment;

interface ExternalReferenceLineDummyComponentProps {
  dataColumns?: {
    source_name: {
      label: string;
      width: string;
      isSortable: boolean;
    };
    external_id: {
      label: string;
      width: string;
      isSortable: boolean;
    };
    url: {
      label: string;
      width: string;
      isSortable: boolean;
    };
    creator: {
      label: string;
      width: string;
      isSortable: boolean;
    };
    created: {
      label: string;
      width: string;
      isSortable: boolean;
    };
  };
}

const ExternalReferenceLineDummyComponent: FunctionComponent<
ExternalReferenceLineDummyComponentProps
> = ({ dataColumns }) => {
  const classes = useStyles();
  return (
    <ListItem classes={{ root: classes.item }} divider={true}>
      <ListItemIcon
        classes={{ root: classes.itemIconDisabled }}
        style={{ minWidth: 40 }}
      >
        <Checkbox edge="start" disabled={true} disableRipple={true} />
      </ListItemIcon>
      <ListItemIcon classes={{ root: classes.itemIcon }}>
        <Skeleton animation="wave" variant="circular" width={30} height={30} />
      </ListItemIcon>
      <ListItemText
        primary={
          <div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns?.source_name.width }}
            >
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns?.external_id.width }}
            >
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns?.url.width }}
            >
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="90%"
                height="100%"
              />
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns?.creator.width }}
            >
              <Skeleton
                animation="wave"
                variant="rectangular"
                width={140}
                height="100%"
              />
            </div>
            <div
              className={classes.bodyItem}
              style={{ width: dataColumns?.created.width }}
            >
              <Skeleton
                animation="wave"
                variant="rectangular"
                width={140}
                height="100%"
              />
            </div>
          </div>
        }
      />
      <ListItemSecondaryAction classes={{ root: classes.itemIconDisabled }}>
        <KeyboardArrowRightOutlined />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export const ExternalReferenceLineDummy = ExternalReferenceLineDummyComponent;
