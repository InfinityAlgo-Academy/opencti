import List from '@mui/material/List';
import { ListItemButton } from '@mui/material';
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Extension } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Paper from '@mui/material/Paper';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { graphql, useFragment } from 'react-relay';
import ImportMenu from '@components/data/ImportMenu';
import { truncate } from '../../../../utils/String';
import { useFormatter } from '../../../../components/i18n';
import { ImportContent_connectorsImport$key } from './__generated__/ImportContent_connectorsImport.graphql';

const useStyles = makeStyles(() => ({
  container: {
    padding: '0 200px 50px 0',
  },
  paper: {
    padding: '10px 15px 10px 15px',
    borderRadius: 4,
    marginTop: 2,
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
}));

const importConnectorsFragment = graphql`
    fragment ImportContent_connectorsImport on Connector
    @relay(plural: true) {
        id
        name
        active
        only_contextual
        connector_scope
        updated_at
        configurations {
            id
            name,
            configuration
        }
    }
`;

const ImportConnectors = ({ connectorsImport }: { connectorsImport: ImportContent_connectorsImport$key }) => {
  const data = useFragment<ImportContent_connectorsImport$key>(importConnectorsFragment, connectorsImport);
  const classes = useStyles();
  const { nsdt, t_i18n } = useFormatter();
  const connectors = data.filter((n) => !n.only_contextual); // Can be null but not empty
  return (
    <div className={classes.container}>
      <ImportMenu />
      <Paper
        classes={{ root: classes.paper }}
        variant="outlined"
        style={{ marginTop: 12 }}
        className={'paper-for-grid'}
      >
        {connectors.length ? (
          <List>
            {connectors.map((connector) => {
              const connectorScope = connector.connector_scope?.join(',');
              return (
                <ListItemButton
                  component={Link}
                  to={`/dashboard/data/ingestion/connectors/${connector.id}`}
                  key={connector.id}
                  dense={true}
                  divider={true}
                  classes={{ root: classes.item }}
                >
                  <Tooltip
                    title={
                      connector.active
                        ? t_i18n('This connector is active')
                        : t_i18n('This connector is disconnected')
                    }
                  >
                    <ListItemIcon
                      style={{
                        color: connector.active ? '#4caf50' : '#f44336',
                      }}
                    >
                      <Extension/>
                    </ListItemIcon>
                  </Tooltip>
                  <Tooltip title={connectorScope}>
                    <ListItemText
                      primary={connector.name}
                      secondary={truncate(connectorScope, 300)}
                    />
                  </Tooltip>
                  {connector.updated_at && (<ListItemSecondaryAction>
                    <ListItemText primary={nsdt(connector.updated_at)}/>
                  </ListItemSecondaryAction>)}
                </ListItemButton>
              );
            })}
          </List>
        ) : (
          <div
            style={{ display: 'table', height: '100%', width: '100%' }}
          >
            <span
              style={{
                display: 'table-cell',
                verticalAlign: 'middle',
                textAlign: 'center',
              }}
            >
              {t_i18n('No enrichment connectors on this platform')}
            </span>
          </div>
        )}
      </Paper>
    </div>
  );
};

export default ImportConnectors;
