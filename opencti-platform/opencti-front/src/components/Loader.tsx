import React, { FunctionComponent } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import makeStyles from '@mui/styles/makeStyles';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  container: {
    width: '100vh',
    minWidth: '100vh',
    height: 'calc(100vh-180px)',
    minHeight: 'calc(100vh-180px)',
    padding: '0 0 0 180px',
  },
  containerInElement: {
    width: '100%',
    height: '100%',
    display: 'table',
  },
  loader: {
    width: '100%',
    margin: 0,
    padding: 0,
    position: 'absolute',
    top: '46%',
    left: 0,
    textAlign: 'center',
    zIndex: 20,
  },
  loaderInElement: {
    width: '100%',
    margin: 0,
    padding: 0,
    display: 'table-cell',
    verticalAlign: 'middle',
    textAlign: 'center',
  },
  loaderCircle: {
    display: 'inline-block',
  },
}));

export enum LoaderVariant {
  container = 'container',
  inElement = 'inElement',
}

interface LoaderProps {
  variant?: LoaderVariant;
  withRightPadding?: boolean;
  withTopMargin?: boolean;
}

const Loader: FunctionComponent<LoaderProps> = ({
  variant = LoaderVariant.container,
  withRightPadding = false,
  withTopMargin = false,
}) => {
  const classes = useStyles();
  return (
    <div
      className={
        variant === 'inElement' ? classes.containerInElement : classes.container
      }
      style={
        variant === 'inElement'
          ? {
            paddingRight: withRightPadding ? 200 : 0,
            marginTop: withTopMargin ? 200 : 0,
          }
          : {}
      }
    >
      <div
        className={
          variant === 'inElement' ? classes.loaderInElement : classes.loader
        }
        style={
          variant !== 'inElement'
            ? { paddingRight: withRightPadding ? 100 : 0 }
            : {}
        }
      >
        <CircularProgress
          size={variant === 'inElement' ? 40 : 80}
          thickness={1}
          className={classes.loaderCircle}
        />
      </div>
    </div>
  );
};

export default Loader;
