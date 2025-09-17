import React, { useState, useEffect, useRef } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
// ✅ CHANGED: Import API_BASE_URL
import { callConverseApi, API_BASE_URL } from '../api/apiService';
import micIconUrl from '../assets/microphone.svg';

const LANGUAGE_MAP = {
    spanish: { voice: "es-ES-AlvaroNeural", recog_lang: "es-ES" },
    french: { voice: "fr-FR-DeniseNeural", recog_lang: "fr-FR" },
    german: { voice: "de-DE-ConradNeural", recog_lang: "de-DE" },
    hindi: { voice: "hi-IN-MadhurNeural", recog_lang: "hi-IN" },
    japanese: { voice: "ja-JP-KeitaNeural", recog_lang: "ja-JP" },
};
const PROFICIENCIES = ["beginner", "intermediate", "advanced"];

const ConversationMode = () => {
    const [langName, setLangName] = useState('spanish');
    const [proficiency, setProficiency] = useState('beginner');
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState('idle');
    const chatBoxRef = useRef(null);

    const { text, isListening, startListening, stopListening, hasSupport } = useVoiceRecognition({ lang: LANGUAGE_MAP[langName].recog_lang });

    useEffect(() => {
        const startConversation = async () => {
            setStatus('thinking');
            try {
                const result = await callConverseApi('', langName, proficiency, LANGUAGE_MAP[langName].voice, []);
                setHistory(result.history);

                // ✅ CHANGED: Use the imported API_BASE_URL
                const audioUrl = `${API_BASE_URL}${result.audio_url}?t=${new Date().getTime()}`;
                const audio = new Audio(audioUrl);
                audio.play();
                setStatus('idle');
            } catch (error) {
                console.error(error);
                setStatus('error');
            }
        };
        startConversation();
    }, [langName, proficiency]);

    useEffect(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, [history]);

    const handleRecord = async () => {
        if (isListening) {
            stopListening();
            setStatus('thinking');
            setTimeout(async () => {
                try {
                    const finalRecognizedText = text;
                    const result = await callConverseApi(finalRecognizedText, langName, proficiency, LANGUAGE_MAP[langName].voice, history);
                    setHistory(result.history);
                    
                    // ✅ CHANGED: Use the imported API_BASE_URL
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
            startListening();
            setStatus('listening');
        }
    };

    return (
        <>
            <h3>Conversation Partner</h3>
            <div style={{display: 'flex', gap: '10px'}}>
                <select value={langName} onChange={(e) => setLangName(e.target.value)}>
                    {Object.keys(LANGUAGE_MAP).map(lang => (
                        <option key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                    ))}
                </select>
                <select value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
                    {PROFICIENCIES.map(p => (
                        <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <div className="conversation-history" ref={chatBoxRef}>
                {history.slice(1).map((msg, index) => (
                    <div key={index} className={`chat-bubble ${msg.role}`}>
                        {msg.parts}
                    </div>
                ))}
            </div>
             <div className="status-display">
                {status === 'listening' && 'Listening...'}
                {status === 'thinking' && 'AI is thinking...'}
                {status === 'error' && 'An error occurred.'}
            </div>
            <button 
                onClick={handleRecord} 
                disabled={!hasSupport || status === 'thinking'} 
                className={`record-button ${isListening ? 'recording' : ''}`}
            >
                <img src={micIconUrl} alt="Record" />
            </button>
        </>
    );
};

export default ConversationMode;