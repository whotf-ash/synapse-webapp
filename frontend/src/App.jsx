import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import ModeSelector from './components/ModeSelector';
import TranslatorMode from './components/TranslatorMode';
import ConversationMode from './components/ConversationMode';
import HistoryPage from './components/HistoryPage/HistoryPage';

function App() {
  const [history, setHistory] = useState([]);

  // Load history from localStorage when the app starts
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('synapseHistory')) || [];
    setHistory(savedHistory);
  }, []);

  // Function to add a new entry and save to localStorage
  const addHistoryEntry = (entry) => {
    setHistory(prevHistory => {
      const newHistory = [entry, ...prevHistory];
      localStorage.setItem('synapseHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Function to clear history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('synapseHistory');
  };

  return (
    <BrowserRouter>
      <Navbar />
      <div className="app-container">
        <div className="content-card">
          <Routes>
            <Route path="/" element={<ModeSelector />} />
            <Route 
              path="/translator" 
              element={<TranslatorMode addHistoryEntry={addHistoryEntry} />} 
            />
            <Route path="/conversation" element={<ConversationMode />} />
            <Route 
              path="/history" 
              element={<HistoryPage history={history} clearHistory={clearHistory} />} 
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;