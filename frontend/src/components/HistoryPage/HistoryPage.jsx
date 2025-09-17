import React from 'react';
import './HistoryPage.css';

const HistoryPage = ({ history, clearHistory }) => {
  return (
    <div className="history-container">
      <div className="history-header">
        <h3>Translation History</h3>
        <button onClick={clearHistory} className="clear-button">
          Clear History
        </button>
      </div>
      <div className="history-list">
        {history.length === 0 ? (
          <p className="empty-message">Your translation history will appear here.</p>
        ) : (
          [...history].reverse().map((item, index) => (
            <div key={index} className="history-item">
              <div className="history-text">
                <p className="original-text">{item.original}</p>
                <p className="translated-text">{item.translated}</p>
              </div>
              <span className="timestamp">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;