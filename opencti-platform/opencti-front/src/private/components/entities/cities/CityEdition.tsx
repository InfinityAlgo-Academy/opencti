import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import { Edit } from '@mui/icons-material';
import { useMutation } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import CityEditionContainer, { cityEditionQuery } from './CityEditionContainer';
import { cityEditionOverviewFocus } from './CityEditionOverview';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import { Theme } from '../../../../components/Theme';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import { CityEditionContainerQuery } from './__generated__/CityEditionContainerQuery.graphql';

const useStyles = makeStyles<Theme>((theme) => ({
  editButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
    zIndex: 400,
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
}));

const CityEdition = ({ cityId }: { cityId: string }) => {
  const classes = useStyles();

  const [open, setOpen] = useState<boolean>(false);
  const [commit] = useMutation(cityEditionOverviewFocus);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    commit({
      variables: {
        id: cityId,
        input: { focusOn: '' },
      },
    });
    setOpen(false);
  };

  const queryRef = useQueryLoading<CityEditionContainerQuery>(cityEditionQuery, { id: cityId });

  return (
    <div>
      <Fab
        onClick={handleOpen}
        color="secondary"
        aria-label="Edit"
        className={classes.editButton}
      >
        <Edit />
      </Fab>
      <Drawer
        open={open}
        anchor="right"
        elevation={1}
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
        onClose={handleClose}
      >
        {queryRef && (
          <React.Suspense fallback={<Loader variant={LoaderVariant.inElement} />}>
            <CityEditionContainer
              queryRef={queryRef}
              handleClose={handleClose}
            />
          </React.Suspense>
        )}
      </Drawer>
    </div>
  );
};

export default CityEdition;
