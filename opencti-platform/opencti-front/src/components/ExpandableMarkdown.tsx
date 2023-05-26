import React, { FunctionComponent, useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/styles';
import { emptyFilled, truncate } from '../utils/String';
import { Theme } from './Theme';

export const MarkDownComponents = (
  theme: Theme,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, FunctionComponent<any>> => ({
  table: ({ tableProps }) => (
    <table
      style={{
        border: `1px solid ${theme.palette.divider}`,
        borderCollapse: 'collapse',
      }}
      {...tableProps}
    />
  ),
  tr: ({ trProps }) => (
    <tr style={{ border: `1px solid ${theme.palette.divider}` }} {...trProps} />
  ),
  td: ({ tdProps }) => (
    <td
      style={{
        border: `1px solid ${theme.palette.divider}`,
        padding: 5,
      }}
      {...tdProps}
    />
  ),
  th: ({ tdProps }) => (
    <th
      style={{
        border: `1px solid ${theme.palette.divider}`,
        padding: 5,
      }}
      {...tdProps}
    />
  ),
});

interface ExpandableMarkdownProps {
  source: string | null;
  limit: number;
}

const ExpandableMarkdown: FunctionComponent<ExpandableMarkdownProps> = ({
  source,
  limit,
}) => {
  const [expand, setExpand] = useState(false);
  const onClick = () => setExpand(!expand);
  const shouldBeTruncated = (source || '').length > limit;
  return (
    <span>
      <div style={{ position: 'relative' }}>
        {shouldBeTruncated && (
          <div style={{ position: 'absolute', top: -32, right: 0 }}>
            <IconButton onClick={onClick} size="large">
              {expand ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </div>
        )}
        <div style={{ marginTop: 10 }}>
          <Markdown
            remarkPlugins={[remarkGfm, remarkParse]}
            components={MarkDownComponents(theme)}
            className="markdown"
          >
            {expand ? emptyFilled(source) : truncate(source, limit)}
          </Markdown>
        </div>
        <div className="clearfix" />
      </div>
    </span>
  );
};

export default ExpandableMarkdown;
