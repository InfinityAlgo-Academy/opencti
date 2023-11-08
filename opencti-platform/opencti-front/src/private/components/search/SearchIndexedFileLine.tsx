import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { createFragmentContainer, graphql } from 'react-relay';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import makeStyles from '@mui/styles/makeStyles';
import { SearchIndexedFileLine_node$data } from '@components/search/__generated__/SearchIndexedFileLine_node.graphql';
import ListItemIcon from '@mui/material/ListItemIcon';
import { OpenInNewOutlined } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Tooltip from '@mui/material/Tooltip';
import { DataColumns } from '../../../components/list_lines';
import { Theme } from '../../../components/Theme';
import { useFormatter } from '../../../components/i18n';
import ItemIcon from '../../../components/ItemIcon';
import { getFileUri } from '../../../utils/utils';
import { resolveLink } from '../../../utils/Entity';
import useGranted, { KNOWLEDGE_KNGETEXPORT, KNOWLEDGE_KNUPLOAD } from '../../../utils/hooks/useGranted';

const useStyles = makeStyles<Theme>((theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
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
}));

interface SearchIndexedFileLineComponentProps {
  node: SearchIndexedFileLine_node$data;
  dataColumns: DataColumns;
}

const SearchIndexedFileLineComponent: FunctionComponent<SearchIndexedFileLineComponentProps> = ({
  node,
  dataColumns,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  let entityLink = node.entity ? `${resolveLink(node.entity.entity_type)}/${node.entity.id}` : '';
  const isGrantedToFiles = useGranted([KNOWLEDGE_KNUPLOAD, KNOWLEDGE_KNGETEXPORT]);
  if (entityLink && isGrantedToFiles) {
    entityLink = entityLink.concat('/files');
  }
  return (
    <ListItem
      classes={{ root: classes.item }}
      divider={true}
      button={true}
      component="a"
      href={getFileUri(node.file_id)}
      target="_blank"
    >
      <ListItemIcon classes={{ root: classes.itemIcon }}>
        <ItemIcon type="File" />
      </ListItemIcon>
      <ListItemText
        primary={
          <div>
            {Object.values(dataColumns).map((value) => (
              <div
                key={value.label}
                className={classes.bodyItem}
                style={{ width: value.width }}
              >
                {value.render?.(node)}
              </div>
            ))}
          </div>
        }
      />
      <ListItemSecondaryAction>
        {node.entity && entityLink && (
          <Tooltip title={t('Open the entity overview in a separated tab')}>
            <IconButton
              component={Link}
              target="_blank"
              to={entityLink}
              size="medium"
            >
              <OpenInNewOutlined fontSize="medium" />
            </IconButton>
          </Tooltip>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const SearchIndexedFileLine = createFragmentContainer(SearchIndexedFileLineComponent, {
  node: graphql`
      fragment SearchIndexedFileLine_node on IndexedFile {
        id
        name
        uploaded_at
        file_id
        searchOccurrences
        entity {
          ...on StixObject {
            id
            entity_type
            representative {
              main
            }
          }
          ...on StixCoreObject {
            objectMarking {
              edges {
                node {
                  id
                  definition_type
                  definition
                  x_opencti_order
                  x_opencti_color
                }
              }
            }
          }
        }
      }
  `,
});

export default SearchIndexedFileLine;
