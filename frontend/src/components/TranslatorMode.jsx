import React, { useState } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { callTranslateApi, API_BASE_URL } from '../api/apiService';
import micIconUrl from '../assets/microphone.svg';

const LANGUAGE_MAP = {
  spanish: { voice: "es-ES-AlvaroNeural" },
  french: { voice: "fr-FR-DeniseNeural" },
  german: { voice: "de-DE-ConradNeural" },
  hindi: { voice: "hi-IN-MadhurNeural" },
  japanese: { voice: "ja-JP-KeitaNeural" },
};

const TranslatorMode = ({ addHistoryEntry }) => {
    const [langName, setLangName] = useState('spanish');
    const [status, setStatus] = useState('idle');
    const [originalText, setOriginalText] = useState('');
    const [translatedText, setTranslatedText] = useState('');

    const { text, isListening, startListening, stopListening, hasSupport } = useVoiceRecognition();

    const handleRecord = async () => {
        if (isListening) {
            stopListening();
            setStatus('translating');
            
            // Use a slight delay to ensure the final text is captured
            setTimeout(async () => {
                try {
                    const finalRecognizedText = text;
                    if (!finalRecognizedText) {
                        setStatus('error');
                        console.error("No text was recognized.");
                        return;
                    }

                    const result = await callTranslateApi(finalRecognizedText, langName, LANGUAGE_MAP[langName].voice);
                    
                    setOriginalText(finalRecognizedText);
                    setTranslatedText(result.text);

                    // Save the successful translation to history
                    addHistoryEntry({
                      original: finalRecognizedText,
                      translated: result.text,
                      timestamp: new Date().toISOString()
                    });
                    
                    // Add timestamp to prevent browser caching
                    const audioUrl = `${API_BASE_URL}${result.audio_url}?t=${new Date().getTime()}`;
                    const audio = new Audio(audioUrl);
                    audio.play();
                    setStatus('idle');
                } catch (error) {
                    console.error(error);
                    setStatus('error');
                }
            }, 500);

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
                {status === 'error' && 'An error occurred. Please try again.'}
            </div>
            <textarea 
                className="text-display" 
                readOnly 
                value={isListening ? text : originalText} 
                placeholder="Your speech will appear here..."
            />
            <textarea 
                className="text-display" 
                readOnly 
                value={translatedText} 
                placeholder="Translation will appear here..."
            />
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