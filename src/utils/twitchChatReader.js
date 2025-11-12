import tmi from 'tmi.js';

let client = null;
let isRunning = false;
let setGeneratedMessage;
let voices = [];

// Load browser voices once they become available
window.speechSynthesis.onvoiceschanged = () => {
  voices = window.speechSynthesis.getVoices();
};

// Simple TTS function
const speak = (text) => {
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.voice = voices.find(v => v.name.includes('Google')) || voices[0];
  window.speechSynthesis.speak(utterance);
};

// Extract Twitch channel name from a prompt or URL
function extractChannelName(input) {
  if (!input) return null;
  const match = input.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
  return match ? match[1] : input.trim();
}

// Start reading chat aloud
export const startChatSimulation = (streamPrompt, _character, _players, _sampleChats, setMessageCallback) => {
  if (isRunning) return;
  const channel = extractChannelName(streamPrompt);
  if (!channel) {
    alert("Please enter a Twitch channel name or URL (e.g. twitch.tv/xqc)");
    return;
  }

  setGeneratedMessage = setMessageCallback;
  isRunning = true;

  client = new tmi.Client({
    connection: { reconnect: true, secure: true },
    channels: [channel],
  });

  client.connect();

  client.on('message', (chan, tags, message, self) => {
    if (self || !isRunning) return;
    const username = tags['display-name'] || 'Viewer';
    const fullMessage = `${username}: ${message}`;

    setGeneratedMessage(fullMessage);
    speak(fullMessage);
  });

  client.on('connected', () => {
    console.log(`✅ Connected to Twitch chat: ${channel}`);
    setGeneratedMessage(`Connected to ${channel}'s chat!`);
  });

  client.on('disconnected', () => {
    console.log('❌ Disconnected from Twitch chat');
  });
};

// Stop reading chat
export const stopChatSimulation = () => {
  if (client) {
    client.disconnect();
    client = null;
  }
  isRunning = false;
  window.speechSynthesis.cancel();
};
