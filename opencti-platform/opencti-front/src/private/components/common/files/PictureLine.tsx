import { useFragment } from 'react-relay';
import { FunctionComponent, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import ListItem from '@mui/material/ListItem';
import { React } from 'mdi-material-ui';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { NorthEastOutlined } from '@mui/icons-material';
import Drawer from '@mui/material/Drawer';
import { Theme } from '../../../../components/Theme';
import { getFileUri } from '../../../../utils/utils';
import { DataColumns } from '../../../../components/list_lines';
import PictureManagementEdition from './PictureManagementEdition';
import { pictureManagementUtilsFragment } from './PictureManagementUtils';
import { PictureManagementUtils_node$key } from './__generated__/PictureManagementUtils_node.graphql';
import ItemBoolean from '../../../../components/ItemBoolean';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles<Theme>((theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  bodyItem: {
    display: 'flex',
    alignItems: 'center',
    height: 40,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'auto',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
}));

interface PictureLineComponentProps {
  picture: PictureManagementUtils_node$key;
  dataColumns: DataColumns;
  entityId: string;
}

const PictureLine: FunctionComponent<PictureLineComponentProps> = ({
  picture,
  dataColumns,
  entityId,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const data = useFragment(pictureManagementUtilsFragment, picture);
  const [displayUpdate, setDisplayUpdate] = useState<boolean>(false);
  const handleOpenUpdate = () => setDisplayUpdate(true);
  const handleCloseUpdate = () => setDisplayUpdate(false);
  return (
    <div>
      <ListItem
        classes={{ root: classes.item }}
        divider={true}
        button={true}
        onClick={handleOpenUpdate}
      >
        <ListItemIcon classes={{ root: classes.itemIcon }}>
          <img
            style={{ height: 33, width: 33 }}
            src={getFileUri(data.id)}
            alt={data.name}
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.description.width }}
              >
                {data.metaData?.description}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.order.width }}
              >
                {data.metaData?.order}
              </div>
              <div
                className={classes.bodyItem}
                style={{ width: dataColumns.inCarousel.width }}
              >
                <ItemBoolean
                  status={data.metaData?.inCarousel}
                  label={data.metaData?.inCarousel ? t('Yes') : t('No')}
                />
              </div>
            </>
          }
        />
        <ListItemIcon classes={{ root: classes.goIcon }}>
          <NorthEastOutlined />
        </ListItemIcon>
      </ListItem>
      <Drawer
        open={displayUpdate}
        anchor="right"
        sx={{ zIndex: 1202 }}
        elevation={1}
        classes={{ paper: classes.drawerPaper }}
        onClose={handleCloseUpdate}
      >
        <PictureManagementEdition
          entityId={entityId}
          handleClose={handleCloseUpdate}
          picture={data}
        />
      </Drawer>
    </div>
  );
};

export default PictureLine;
