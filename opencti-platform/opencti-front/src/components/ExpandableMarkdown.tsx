import React, { FunctionComponent, useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { emptyFilled, truncate } from '../utils/String';
import MarkdownDisplay from './MarkdownDisplay';

interface ExpandableMarkdownProps {
  source?: string | null;
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
      <div style={{ position: 'relative', overflowX: 'auto' }}>
        {shouldBeTruncated && (
          <div style={{ position: 'absolute', top: -32, right: 0 }}>
            <IconButton onClick={onClick} size="large">
              {expand ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </div>
        )}
        <div>
          <MarkdownDisplay
            content={expand ? emptyFilled(source) : truncate(source, limit)}
            remarkGfmPlugin={true}
            commonmark={true}
          />
        </div>
        <div className="clearfix" />
      </div>
    </span>
  );
};

export default ExpandableMarkdown;
