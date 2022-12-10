import React, { FunctionComponent } from 'react';
import { useFragment } from 'react-relay';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { MoreVertOutlined, ShortTextOutlined } from '@mui/icons-material';
import Skeleton from '@mui/material/Skeleton';
import makeStyles from '@mui/styles/makeStyles';
import VocabularyPopover from './VocabularyPopover';
import { DataColumns } from '../../../../components/list_lines';
import { LocalStorage } from '../../../../utils/hooks/useLocalStorage';
import { Theme } from '../../../../components/Theme';
import { vocabFragment } from '../../../../utils/hooks/useVocabularyCategory';
import {
  useVocabularyCategory_Vocabularynode$key,
} from '../../../../utils/hooks/__generated__/useVocabularyCategory_Vocabularynode.graphql';

const useStyles = makeStyles<Theme>((theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
    cursor: 'default',
  },
  itemIcon: {
    color: theme.palette.primary?.main,
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 5,
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
  itemIconDisabled: {
    color: theme.palette.grey?.[700],
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey?.[700],
  },
}));

interface VocabularyLineProps {
  node: useVocabularyCategory_Vocabularynode$key,
  dataColumns: DataColumns,
  paginationOptions: LocalStorage,
  refetch: () => void,
}

export const VocabularyLine: FunctionComponent<VocabularyLineProps> = ({
  node,
  dataColumns,
  paginationOptions,
  refetch,
}) => {
  const classes = useStyles();

  const vocab = useFragment(vocabFragment, node);

  return (
    <ListItem classes={{ root: classes.item }} divider={true} button={true}>
      <ListItemIcon classes={{ root: classes.itemIcon }}>
        <ShortTextOutlined />
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
                {value.render?.(vocab)}
              </div>
            ))}
          </div>
        }
      />
      <ListItemSecondaryAction>
        <VocabularyPopover
          vocab={vocab}
          refetch={refetch}
          paginationOptions={paginationOptions}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export const VocabularyLineDummy = ({ dataColumns }: { dataColumns: DataColumns }) => {
  const classes = useStyles();
  return (
    <ListItem classes={{ root: classes.item }} divider={true}>
      <ListItemIcon classes={{ root: classes.itemIconDisabled }}>
        <Skeleton
          animation="wave"
          variant="circular"
          width={30}
          height={30}
        />
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
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={value.width}
                  height={20}
                />
              </div>
            ))}
          </div>
        }
      />
      <ListItemSecondaryAction classes={{ root: classes.itemIconDisabled }}>
        <MoreVertOutlined />
      </ListItemSecondaryAction>
    </ListItem>
  );
};
