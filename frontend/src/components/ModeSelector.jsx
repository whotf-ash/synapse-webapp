import React from 'react';
import { Link } from 'react-router-dom';

const ModeSelector = () => {
  return (
    <div className="mode-selector" style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center' }}>
        <h2>Welcome to Synapse</h2>
        <p>Choose an experience to get started.</p>
        <Link to="/translator">
            <button>Translator Mode</button>
        </Link>
        <Link to="/conversation">
            <button>Conversation Partner Mode</button>
        </Link>
    </div>
  );
};

export default ModeSelector;