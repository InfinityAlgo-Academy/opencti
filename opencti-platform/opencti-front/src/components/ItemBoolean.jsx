import React from 'react';
import * as PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import Chip from '@mui/material/Chip';
import { compose } from 'ramda';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/styles';
import inject18n from './i18n';

const styles = () => ({
  chip: {
    fontSize: 12,
    lineHeight: '12px',
    height: 25,
    marginRight: 7,
    textTransform: 'uppercase',
    borderRadius: '0',
    width: 120,
  },
  chipInList: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: '0',
    width: 100,
  },
});

const computeInlineStyles = (theme) => ({
  green: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    color: '#4caf50',
  },
  red: {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    color: '#f44336',
  },
  blue: {
    backgroundColor: 'rgba(92, 123, 245, 0.08)',
    color: '#5c7bf5',
  },
  ee: {
    backgroundColor: theme.palette.ee.background,
    color: theme.palette.ee.main,
  },
});

const ItemBoolean = (props) => {
  const { classes, label, neutralLabel, status, variant, t, reverse } = props;
  const theme = useTheme();
  const style = variant === 'inList' ? classes.chipInList : classes.chip;
  const inlineStyles = computeInlineStyles(theme);
  if (status === true) {
    return (
      <Chip
        classes={{ root: style }}
        style={reverse ? inlineStyles.red : inlineStyles.green}
        label={label}
      />
    );
  }
  if (status === null) {
    return (
      <Chip
        classes={{ root: style }}
        style={inlineStyles.blue}
        label={neutralLabel || t('Not applicable')}
      />
    );
  }
  if (status === 'ee') {
    return (
      <Chip
        classes={{ root: style }}
        style={inlineStyles.ee}
        label={neutralLabel || t('EE')}
      />
    );
  }
  if (status === undefined) {
    return (
      <Chip
        classes={{ root: style }}
        style={inlineStyles.blue}
        label={<CircularProgress size={10} color="primary" />}
      />
    );
  }
  return (
    <Chip
      classes={{ root: style }}
      style={reverse ? inlineStyles.green : inlineStyles.red}
      label={label}
    />
  );
};

ItemBoolean.propTypes = {
  classes: PropTypes.object.isRequired,
  status: PropTypes.oneOf([PropTypes.bool, PropTypes.string]),
  label: PropTypes.string,
  neutralLabel: PropTypes.string,
  variant: PropTypes.string,
  reverse: PropTypes.bool,
};

export default compose(inject18n, withStyles(styles))(ItemBoolean);
