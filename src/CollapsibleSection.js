import ChevronDownIcon from '../icons/chevron_left.svg';
import CloseIcon from '../icons/close.svg';

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
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
        <i className="icon close" dangerouslySetInnerHTML={{ __html: CloseIcon }} />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
        <i className="icon open" dangerouslySetInnerHTML={{ __html: ChevronDownIcon }} />
      </button>

      <Collapse isOpened={isOpened}>{children}</Collapse>
    </div>
  );
}

export default CollapsibleSection;
