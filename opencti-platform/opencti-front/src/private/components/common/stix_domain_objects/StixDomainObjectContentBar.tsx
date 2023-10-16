import React, { FunctionComponent } from 'react';
import IconButton from '@mui/material/IconButton';
import {
  CloudDownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  SaveOutlined,
} from '@mui/icons-material';
import Drawer from '@mui/material/Drawer';
import Slide, { SlideProps } from '@mui/material/Slide';
import { Link } from 'react-router-dom';
import { FilePdfBox } from 'mdi-material-ui';
import Tooltip from '@mui/material/Tooltip';
import makeStyles from '@mui/styles/makeStyles';
import { createStyles } from '@mui/styles';
import { Theme } from '../../../../components/Theme';
import useAuth from '../../../../utils/hooks/useAuth';

const useStyles = makeStyles<Theme, { bannerHeightNumber: number }>(() => createStyles({
  bottomNav: {
    zIndex: 1000,
    display: 'flex',
    overflow: 'hidden',
    paddingBottom: ({ bannerHeightNumber }) => `${bannerHeightNumber}px`,
  },
}));

const Transition = React.forwardRef((props: SlideProps, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

interface StixDomainObjectContentBarProps {
  handleZoomIn?: () => void;
  handleZoomOut?: () => void;
  currentZoom?: number;
  handleDownload?: () => void;
  directDownload: string;
  handleDownloadPdf?: () => void;
  handleSave?: () => void;
  changed?: boolean;
  navOpen: boolean;
}

const StixDomainObjectContentBar: FunctionComponent<
StixDomainObjectContentBarProps
> = ({
  handleZoomIn,
  handleZoomOut,
  currentZoom,
  handleDownload,
  directDownload,
  handleDownloadPdf,
  handleSave,
  changed,
  navOpen,
}) => {
  const {
    bannerSettings: { bannerHeightNumber },
  } = useAuth();
  const classes = useStyles({ bannerHeightNumber });
  const enableZoom = handleZoomIn && handleZoomOut && currentZoom;
  return (
    <Drawer
      anchor="bottom"
      variant="permanent"
      classes={{ paper: classes.bottomNav }}
      PaperProps={{ variant: 'elevation', elevation: 1 }}
    >
      <div
        style={{
          verticalAlign: 'top',
          width: '100%',
          height: 54,
          paddingTop: 3,
        }}
      >
        <div
          style={{
            float: 'left',
            marginLeft: navOpen ? 195 : 70,
            height: '100%',
            display: 'flex',
          }}
        >
          {handleSave && (
            <IconButton
              color="primary"
              onClick={handleSave}
              size="large"
              disabled={!changed}
            >
              <SaveOutlined />
            </IconButton>
          )}
          {enableZoom && (
            <IconButton
              color="primary"
              onClick={handleZoomOut}
              disabled={currentZoom <= 0.6}
              size="large"
            >
              <ZoomOutOutlined />
            </IconButton>
          )}
          {enableZoom && (
            <IconButton
              color="primary"
              onClick={handleZoomIn}
              disabled={currentZoom >= 2}
              size="large"
            >
              <ZoomInOutlined />
            </IconButton>
          )}
        </div>
        <div
          style={{
            float: 'right',
            display: 'flex',
            height: '100%',
            marginRight: 380,
          }}
        >
          {handleDownloadPdf && (
            <Tooltip title={'Download in pdf'}>
              <IconButton
                color="primary"
                onClick={handleDownloadPdf}
                size="large"
              >
                <FilePdfBox />
              </IconButton>
            </Tooltip>
          )}
          {directDownload ? (
            <Tooltip title={'Download this file'}>
              <IconButton
                color="primary"
                component={Link}
                to={directDownload}
                target="_blank"
                rel="noopener noreferrer"
                size="large"
              >
                <CloudDownloadOutlined />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={'Download this file'}>
              <IconButton color="primary" onClick={handleDownload}>
                <CloudDownloadOutlined />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default StixDomainObjectContentBar;
