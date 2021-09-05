import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExpandMore, ExpandLess } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import { compose } from 'ramda';
import { withTheme } from '@material-ui/core/styles';
import { truncate } from '../utils/String';

export const MarkDownComponents = (theme) => ({
  // eslint-disable-next-line react/display-name
  table: ({ node, ...tableProps }) => (
    <table
      style={{
        border: `1px solid ${theme.palette.divider}`,
        borderCollapse: 'collapse',
      }}
      {...tableProps}
    />
  ),
  // eslint-disable-next-line react/display-name
  tr: ({ node, ...trProps }) => (
    <tr style={{ border: `1px solid ${theme.palette.divider}` }} {...trProps} />
  ),
  // eslint-disable-next-line react/display-name
  td: ({ node, ...tdProps }) => (
    <td
      style={{
        border: `1px solid ${theme.palette.divider}`,
        padding: 5,
      }}
      {...tdProps}
    />
  ),
  // eslint-disable-next-line react/display-name
  th: ({ node, ...tdProps }) => (
    <th
      style={{
        border: `1px solid ${theme.palette.divider}`,
        padding: 5,
      }}
      {...tdProps}
    />
  ),
});

const ExpandableMarkdown = (props) => {
  const [expand, setExpand] = useState(false);

  const onClick = () => setExpand(!expand);

  const { source, limit, theme } = props;
  const shouldBeTruncated = (source || '').length > limit;

  return (
    <div style={{ position: 'relative' }}>
      {shouldBeTruncated && (
        <div style={{ position: 'absolute', top: -32, right: 0 }}>
          <IconButton onClick={onClick}>
            {expand ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
      )}
      <div style={{ marginTop: -5 }}>
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={MarkDownComponents(theme)}
          {...props}
        >
          {expand ? source : truncate(source, limit)}
        </Markdown>
      </div>
      <div className="clearfix" />
    </div>
  );
};

ExpandableMarkdown.propTypes = {
  source: PropTypes.string.isRequired,
  limit: PropTypes.number.isRequired,
};

export default compose(withTheme)(ExpandableMarkdown);
