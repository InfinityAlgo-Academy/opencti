import { graphql } from 'react-relay';
import React, { FunctionComponent, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CodeBlock from '@components/common/CodeBlock';
import { IngestionCsvMapperTestDialogQuery$data } from '@components/data/ingestionCsv/__generated__/IngestionCsvMapperTestDialogQuery.graphql';
import { Option } from '@components/common/form/ReferenceField';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import { useFormatter } from '../../../../components/i18n';
import { fetchQuery, handleError } from '../../../../relay/environment';

const ingestionCsvMapperTestQuery = graphql`
  query IngestionCsvMapperTestDialogQuery($uri: String!, $csv_mapper_id: String!) {
    test_mapper(uri: $uri, csv_mapper_id: $csv_mapper_id) {
      nbEntities
      nbRelationships
      objects
    }
  }
`;

interface IngestionCsvMapperTestDialogProps {
  open: boolean
  onClose: () => void
  uri: string
  csvMapperId: string | Option
  setIsCreateDisabled?: React.Dispatch<React.SetStateAction<boolean>>
}

const IngestionCsvMapperTestDialog: FunctionComponent<IngestionCsvMapperTestDialogProps> = ({
  open,
  onClose,
  uri,
  csvMapperId,
  setIsCreateDisabled,
}) => {
  const { t_i18n } = useFormatter();
  const [result, setResult] = useState<IngestionCsvMapperTestDialogQuery$data | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const handleClose = () => {
    setResult(undefined);
    onClose();
  };

  const onTest = (url: string, csv_mapper_id: string) => {
    setLoading(true);
    fetchQuery(ingestionCsvMapperTestQuery, { uri: url, csv_mapper_id })
      .toPromise()
      .then((data) => {
        const resultTest = (data as IngestionCsvMapperTestDialogQuery$data)
          .test_mapper;
        if (resultTest) {
          setResult({
            test_mapper: {
              ...resultTest,
            },
          });
          if (setIsCreateDisabled) {
            setIsCreateDisabled(resultTest.nbEntities === 0);
          }
        }
        setLoading(false);
      }).catch((error) => {
        handleError(error);
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ elevation: 1 }}>
      <DialogTitle>{t_i18n('Testing csv mapper')}</DialogTitle>
      <DialogContent>
        <Box
          sx={{ marginBottom: '12px' }}
        >
          <TextField
            label="CSV feed URL"
            defaultValue={uri}
            InputProps={{
              readOnly: true,
            }}
            fullWidth
            sx={{ marginBottom: '12px' }}
          />
          <TextField
            label="CSV mapper"
            defaultValue={typeof csvMapperId === 'string' ? csvMapperId : csvMapperId.label}
            InputProps={{
              readOnly: true,
            }}
            fullWidth
          />
        </Box>
        <Box>
          <div style={{ width: '100%', marginTop: 10 }}>
            <Alert
              severity="info"
              variant="outlined"
              style={{ padding: '0px 10px 0px 10px' }}
            >
              {t_i18n('Please, note that the test will be run on the 50 first lines')}
            </Alert>
          </div>
        </Box>
        <Box
          sx={{ display: 'inline-flex', textAlign: 'center', marginTop: '8px', alignItems: 'baseline' }}
        >
          <Button
            variant="contained"
            color={result?.test_mapper?.nbEntities ? 'primary' : 'secondary'}
            onClick={() => onTest(uri, typeof csvMapperId === 'string' ? csvMapperId : csvMapperId.value)}
          >
            {t_i18n('Test')}
          </Button>
          {loading && (
            <Box sx={{ marginLeft: '8px' }}>
              <Loader variant={LoaderVariant.inElement}/>
            </Box>
          )}
          {result
            && <Box
              sx={{
                paddingTop: '8px',
                marginLeft: '12px',
                fontSize: '1rem',
                gap: '8px',
                justifyContent: 'center',
                display: 'flex',
              }}
               >
              <span>{t_i18n('Objects found')} : </span>
              <span><strong>{result?.test_mapper?.nbEntities} </strong> {t_i18n('Entities')}</span>
              <span><strong>{result?.test_mapper?.nbRelationships}</strong> {t_i18n('Relationships')}</span>
            </Box>
          }
        </Box>
        <Box sx={{ marginTop: '8px' }}>
          <CodeBlock
            code={result?.test_mapper?.objects || t_i18n('You will find here the result in JSON format.')}
            language={'json'}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default IngestionCsvMapperTestDialog;
