import { FunctionComponent } from 'react';
import { AttributeConfiguration } from '@components/data/csvMapper/representations/attributes/Attribute';
import makeStyles from '@mui/styles/makeStyles';
import { SubdirectoryArrowRight } from 'mdi-material-ui';
import { useFormatter } from '../../../../../../components/i18n';

interface CsvMapperRepresentionAttributSeelectedConfigurationsProps {
  configuration?: AttributeConfiguration
}

const useStyles = makeStyles(() => ({
  attributeOptionsContainer: {
    gridColumnStart: 2,
    gridColumnEnd: 4,
    display: 'flex',
    alignItems: 'center',
  },
  selectedOption: {
    border: '1px solid currentColor',
    padding: '0 8px',
    marginLeft: '4px',
  },
}));
const CsvMapperRepresentionAttributeSelectedConfigurations: FunctionComponent<CsvMapperRepresentionAttributSeelectedConfigurationsProps> = ({ configuration }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  if (!configuration?.pattern_date && !configuration?.separator) {
    return null;
  }

  return <div className={classes.attributeOptionsContainer}>
    {
      configuration.pattern_date
      && <>
        <SubdirectoryArrowRight/>{t('Date pattern')}:
        <span className={classes.selectedOption}>{configuration.pattern_date}</span>
      </>
    }
    {
      configuration.separator
      && <>
        <SubdirectoryArrowRight/> {t('List separator')}:
        <span className={classes.selectedOption}>{configuration.separator}</span>
      </>
    }
  </div>;
};

export default CsvMapperRepresentionAttributeSelectedConfigurations;
