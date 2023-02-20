import React, { FunctionComponent, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { Facebook, Github, Google, KeyOutline } from 'mdi-material-ui';
import Markdown from 'react-markdown';
import Paper from '@mui/material/Paper';
import makeStyles from '@mui/styles/makeStyles';
import { APP_BASE_PATH, fileUri } from '../../relay/environment';
import logo from '../../static/images/logo.png';
import LoginForm from './LoginForm';
import OTPForm from './OTPForm';
import OtpActivationComponent from './OtpActivation';
import { Theme } from '../../components/Theme';
import { LoginRootPublicQuery$data } from '../__generated__/LoginRootPublicQuery.graphql';

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    textAlign: 'center',
    margin: '0 auto',
    width: 450,
  },
  appBar: {
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
  },
  logo: {
    width: 200,
    margin: '0px 0px 50px 0px',
  },
  button: {
    margin: theme.spacing(1),
    color: '#009688',
    borderColor: '#009688',
    '&:hover': {
      backgroundColor: 'rgba(0, 121, 107, .1)',
      borderColor: '#00796b',
      color: '#00796b',
    },
  },
  buttonGoogle: {
    margin: theme.spacing(1),
    color: '#f44336',
    borderColor: '#f44336',
    '&:hover': {
      backgroundColor: 'rgba(189, 51, 46, .1)',
      borderColor: '#bd332e',
      color: '#bd332e',
    },
  },
  buttonFacebook: {
    margin: theme.spacing(1),
    color: '#4267b2',
    borderColor: '#4267b2',
    '&:hover': {
      backgroundColor: 'rgba(55, 74, 136, .1)',
      borderColor: '#374a88',
      color: '#374a88',
    },
  },
  buttonGithub: {
    margin: theme.spacing(1),
    color: '#5b5b5b',
    borderColor: '#5b5b5b',
    '&:hover': {
      backgroundColor: 'rgba(54, 54, 54, .1)',
      borderColor: '#363636',
      color: '#363636',
    },
  },
  iconSmall: {
    marginRight: theme.spacing(1),
    fontSize: 20,
  },
  paper: {
    marginBottom: 20,
    padding: 5,
    textAlign: 'center',
  },
  loginLogo: {
    mode: theme.palette.mode,
  },
}));

interface LoginProps {
  type: string
  settings: LoginRootPublicQuery$data['settings']
}

const Login: FunctionComponent<LoginProps> = ({ type, settings }) => {
  const classes = useStyles();

  // eslint-disable-next-line max-len
  const [dimension, setDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const updateWindowDimensions = () => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  };
  useEffect(() => {
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  });
  const renderExternalAuthButton = (provider: string | null) => {
    switch (provider) {
      case 'facebook':
        return <Facebook className={classes.iconSmall} />;
      case 'google':
        return <Google className={classes.iconSmall} />;
      case 'github':
        return <Github className={classes.iconSmall} />;
      default:
        return <KeyOutline className={classes.iconSmall} />;
    }
  };

  const renderExternalAuthClassName = (provider: string | null) => {
    switch (provider) {
      case 'facebook':
        return classes.buttonFacebook;
      case 'google':
        return classes.buttonGoogle;
      case 'github':
        return classes.buttonGithub;
      default:
        return classes.button;
    }
  };

  const renderExternalAuth = (authButtons: Array<{ provider: string | null, name: string, type: string | null }>) => (
    <div style={{ marginTop: 10 }}>
      {authButtons.map((value, index) => (
        <Button
          key={`${value.provider}_${index}`}
          type="submit"
          variant="outlined"
          size="small"
          component="a"
          href={`${APP_BASE_PATH}/auth/${value.provider}`}
          className={renderExternalAuthClassName(value.provider)}>
          {renderExternalAuthButton(value.provider)}
          {value.name}
        </Button>
      ))}
    </div>
  );
  const loginMessage = settings.platform_login_message;
  const loginLogo = classes.loginLogo === 'dark'
    ? settings.platform_theme_dark_logo_login
    : settings.platform_theme_light_logo_login;
  const providers = settings.platform_providers;
  const isAuthForm = providers.filter((p) => p?.type === 'FORM').length > 0;
  const authSSOs = providers.filter((p) => p.type === 'SSO');
  const isAuthButtons = authSSOs.length > 0;
  const isLoginMessage = loginMessage && loginMessage.length > 0;
  let loginHeight = 280;
  if (type === '2FA_ACTIVATION') {
    loginHeight = 80;
  } else if (type === '2FA_VALIDATION') {
    loginHeight = 200;
  } else if (isAuthButtons && isAuthForm && isLoginMessage) {
    loginHeight = 400;
  } else if (isAuthButtons && isAuthForm) {
    loginHeight = 350;
  } else if (isAuthButtons && isLoginMessage) {
    loginHeight = 250;
  } else if (isAuthForm && isLoginMessage) {
    loginHeight = 400;
  } else if (isAuthButtons) {
    loginHeight = 150;
  }
  const marginTop = dimension.height / 2 - loginHeight / 2 - 200;

  const loginScreen = () => (
    <div>
      <img src={loginLogo && loginLogo.length > 0 ? loginLogo : fileUri(logo)} alt="logo" className={classes.logo}/>
      {loginMessage && loginMessage.length > 0 && (
        <Paper classes={{ root: classes.paper }} variant="outlined">
          <Markdown>{loginMessage}</Markdown>
        </Paper>
      )}
      {isAuthForm && (
        <Paper variant="outlined">
          <LoginForm />
        </Paper>
      )}
      {isAuthButtons && renderExternalAuth(authSSOs)}
      {providers?.length === 0 && (
        <div>No authentication provider available</div>
      )}
    </div>
  );

  const authScreen = () => {
    if (type === '2FA_VALIDATION') {
      return (
        <div>
          <img src={loginLogo && loginLogo.length > 0 ? loginLogo : fileUri(logo)} alt="logo" className={classes.logo}/>
          <Paper variant="outlined">
            <OTPForm />
          </Paper>
        </div>
      );
    } if (type === '2FA_ACTIVATION') {
      return <OtpActivationComponent />;
    }
    return loginScreen();
  };

  return (
    <div className={classes.container} style={{ marginTop }}>
      {authScreen()}
    </div>
  );
};

export default Login;
