const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const callTranslateApi = async (text, lang_name, voice) => {
    const response = await fetch(`${API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang_name, voice }),
    });
    if (!response.ok) {
        throw new Error('Failed to translate');
    }
    return response.json();
};

export const callConverseApi = async (text, lang_name, proficiency, voice, history) => {
    const response = await fetch(`${API_BASE_URL}/api/converse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang_name, proficiency, voice, history }),
    });
    if (!response.ok) {
        throw new Error('Failed to get conversation response');
    }
    return response.json();
};