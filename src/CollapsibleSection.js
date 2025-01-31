import ChevronDownIcon from '../lib/Icons/chevron-down-solid.svg';
import CloseIcon from '../lib/Icons/xmark-solid.svg';

import React from 'react';
import { Collapse } from 'react-collapse';

import './CollapsibleSection.css';

function CollapsibleSection({ title, children }) {
  const [isOpened, setIsOpened] = React.useState(false);

  return (
    <div className={`CollapsibleSection ${isOpened ? 'opened' : ''}`}>
      <button
        type="button"
        onClick={() => {
          setIsOpened(!isOpened);
        }}
        className="button-collapse"
      >
        {title}
        <i className="icon close" dangerouslySetInnerHTML={{ __html: CloseIcon }} />
        <i className="icon open" dangerouslySetInnerHTML={{ __html: ChevronDownIcon }} />
      </button>

      <Collapse isOpened={isOpened}>{children}</Collapse>
    </div>
  );
}

export default CollapsibleSection;
