import React from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import Security from '../utils/Security';
import { SETTINGS_SETACCESSES } from '../utils/hooks/useGranted';

const ItemCreator = (props) => {
  const { creator } = props;
  return (
    <div>
      <Security
        needs={[SETTINGS_SETACCESSES]}
        placeholder={
          <Button variant="outlined" size="small" style={{ cursor: 'default' }}>
            {creator.name}
          </Button>
        }
      >
        {creator.id === '6a4b11e1-90ca-4e42-ba42-db7bc7f7d505' ? (
          <Button variant="outlined" size="small" style={{ cursor: 'default' }}>
            {creator.name}
          </Button>
        ) : (
          <Button
            variant="outlined"
            size="small"
            component={Link}
            to={`/dashboard/settings/accesses/users/${creator.id}`}
          >
            {creator.name}
          </Button>
        )}
      </Security>
    </div>
  );
};

export default ItemCreator;
