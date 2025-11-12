import axios from 'axios';

const openAiKey = process.env.REACT_APP_OPENAI_API_KEY;

let isRunning = false;
let timeoutId;
let setGeneratedMessage;
let voices;

window.speechSynthesis.onvoiceschanged = function() {
    voices = window.speechSynthesis.getVoices();
};

const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    try {
        utterance.voice = voices[1] || voices[0];
    } catch (error) {
        console.error(error);
    }
    window.speechSynthesis.speak(utterance);
};

const abbreviateName = (name) => name.split(' ')[0] || name;

const generateMessage = async (streamPrompt, character, players, sampleChats) => {
    if (!isRunning) return;

    const playersText = players
        .filter(p => p.name.trim() !== "")
        .map(p => `${abbreviateName(p.name)} (${p.desc || 'no description'})`)
        .join(', ') || 'none';

    // Build prompt dynamically only from user inputs
    const userContent = `
The streamer is playing as: ${character || 'unknown'}.
Stream description: ${streamPrompt || 'none'}.
Current players: ${playersText}.
Example Twitch chats (for style inspiration): ${sampleChats || 'none'}.

Generate ONE short, realistic Twitch chat message that fits this context.
Make it natural and human-like, as if from a live chat viewer.
`;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You simulate Twitch chat messages.' },
                    { role: 'user', content: userContent }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${openAiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const message = response.data.choices[0].message.content.trim();
        setGeneratedMessage(message);
        speak(message);

        // Schedule next message (30s–2min)
        const nextInterval = Math.floor(Math.random() * 90000);
        timeoutId = setTimeout(() => generateMessage(streamPrompt, character, players, sampleChats), nextInterval);

    } catch (error) {
        console.error('Chat generation failed:', error);
        // Retry after 1 minute
        timeoutId = setTimeout(() => generateMessage(streamPrompt, character, players, sampleChats), 60000);
    }
};

export const startChatSimulation = (streamPrompt, character, players, sampleChats, setMessageCallback) => {
    if (isRunning) return;
    setGeneratedMessage = setMessageCallback;
    isRunning = true;
    generateMessage(streamPrompt, character, players, sampleChats);
};

export const stopChatSimulation = () => {
    isRunning = false;
    clearTimeout(timeoutId);
};
