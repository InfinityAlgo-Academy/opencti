import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Add } from '@mui/icons-material';
import Skeleton from '@mui/material/Skeleton';
import makeStyles from '@mui/styles/makeStyles';
import Drawer from '../../common/drawer/Drawer';
import SearchInput from '../../../../components/SearchInput';
import { QueryRenderer } from '../../../../relay/environment';
import AddExternalReferencesLines, { addExternalReferencesLinesQuery } from './AddExternalReferencesLines';

const useStyles = makeStyles({
  createButton: {
    float: 'left',
    marginTop: -15,
  },
  search: {
    marginLeft: 'auto',
    marginRight: ' 20px',
  },
  container: {
    padding: 0,
  },
});

const AddExternalReferences = ({
  stixCoreObjectOrStixCoreRelationshipId,
  stixCoreObjectOrStixCoreRelationshipReferences,
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSearch('');
  };

  const handleSearch = (keyword) => {
    setSearch(keyword);
  };

  const paginationOptions = { search };
  return (
    <div>
      <IconButton
        color="secondary"
        aria-label="Add"
        onClick={handleOpen}
        classes={{ root: classes.createButton }}
        size="large"
      >
        <Add fontSize="small" />
      </IconButton>
      <Drawer
        title="Add external references"
        open={open}
        onClose={handleClose}
        header={(
          <div className={classes.search}>
            <SearchInput
              variant="inDrawer"
              onSubmit={handleSearch}
            />
          </div>
        )}
      >
        <div className={classes.container}>
          <QueryRenderer
            query={addExternalReferencesLinesQuery}
            variables={{
              search,
              count: 20,
            }}
            render={({ props }) => {
              if (props) {
                return (
                  <AddExternalReferencesLines
                    stixCoreObjectOrStixCoreRelationshipId={
                      stixCoreObjectOrStixCoreRelationshipId
                    }
                    stixCoreObjectOrStixCoreRelationshipReferences={
                      stixCoreObjectOrStixCoreRelationshipReferences
                    }
                    data={props}
                    paginationOptions={paginationOptions}
                    open={open}
                    search={search}
                  />
                );
              }
              return (
                <List>
                  {Array.from(Array(20), (e, i) => (
                    <ListItem key={i} divider={true} button={false}>
                      <ListItemIcon>
                        <Skeleton
                          animation="wave"
                          variant="circular"
                          width={30}
                          height={30}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Skeleton
                            animation="wave"
                            variant="rectangular"
                            width="90%"
                            height={15}
                            style={{ marginBottom: 10 }}
                          />
                        }
                        secondary={
                          <Skeleton
                            animation="wave"
                            variant="rectangular"
                            width="90%"
                            height={15}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              );
            }}
          />
        </div>
      </Drawer>
    </div>
  );
};

export default AddExternalReferences;
