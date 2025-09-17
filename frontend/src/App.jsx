import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import ModeSelector from './components/ModeSelector';
import TranslatorMode from './components/TranslatorMode';
import ConversationMode from './components/ConversationMode';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="app-container">
        <div className="content-card">
          <Routes>
            <Route path="/" element={<ModeSelector />} />
            <Route path="/translator" element={<TranslatorMode />} />
            <Route path="/conversation" element={<ConversationMode />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;