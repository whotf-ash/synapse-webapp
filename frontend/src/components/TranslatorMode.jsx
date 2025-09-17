import React, { useState } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { callTranslateApi } from '../api/apiService';
import micIconUrl from '../assets/microphone.svg';

const LANGUAGE_MAP = {
  spanish: { voice: "es-ES-AlvaroNeural" },
  french: { voice: "fr-FR-DeniseNeural" },
  german: { voice: "de-DE-ConradNeural" },
  hindi: { voice: "hi-IN-MadhurNeural" },
  japanese: { voice: "ja-JP-KeitaNeural" },
};

const TranslatorMode = () => {
    const [langName, setLangName] = useState('spanish');
    const [status, setStatus] = useState('idle');
    const [originalText, setOriginalText] = useState('');
    const [translatedText, setTranslatedText] = useState('');

    const { text, isListening, startListening, stopListening, hasSupport } = useVoiceRecognition();

    const handleRecord = async () => {
        if (isListening) {
            stopListening();
            setStatus('translating');
            try {
                const finalRecognizedText = text;
                const result = await callTranslateApi(finalRecognizedText, langName, LANGUAGE_MAP[langName].voice);
                setOriginalText(finalRecognizedText);
                setTranslatedText(result.text);
                
                // Add timestamp to prevent browser caching
                const audioUrl = `http://localhost:8000${result.audio_url}?t=${new Date().getTime()}`;
                const audio = new Audio(audioUrl);
                audio.play();
                setStatus('idle');
            } catch (error) {
                console.error(error);
                setStatus('error');
            }
        } else {
            setOriginalText('');
            setTranslatedText('');
            startListening();
            setStatus('listening');
        }
    };

    return (
        <>
            <h3>Translator Mode</h3>
            <select value={langName} onChange={(e) => setLangName(e.target.value)}>
                {Object.keys(LANGUAGE_MAP).map(lang => (
                    <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                ))}
            </select>
            <div className="status-display">
                {status === 'listening' && 'Listening...'}
                {status === 'translating' && 'Translating...'}
                {status === 'error' && 'An error occurred.'}
            </div>
            <textarea className="text-display" readOnly value={isListening ? text : originalText} placeholder="Your speech will appear here..."/>
            <textarea className="text-display" readOnly value={translatedText} placeholder="Translation will appear here..."/>
            <button 
              onClick={handleRecord} 
              disabled={!hasSupport} 
              className={`record-button ${isListening ? 'recording' : ''}`}
            >
                <img src={micIconUrl} alt="Record" />
            </button>
        </>
    );
};

export default TranslatorMode;