import { useState, useEffect, useRef } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const hasSupport = !!SpeechRecognition;

export const useVoiceRecognition = (options = { lang: 'en-US' }) => {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!hasSupport) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = options.lang;
        recognitionRef.current = recognition;

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setText(transcript);
        };

        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => console.error("Speech recognition error:", event.error);
        
        return () => recognition.stop();
    }, [options.lang]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setText('');
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            setIsListening(false);
            recognitionRef.current.stop();
        }
    };

    return { text, isListening, startListening, stopListening, hasSupport };
};