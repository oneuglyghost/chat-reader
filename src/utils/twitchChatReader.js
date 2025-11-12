import tmi from 'tmi.js';

let client;
let intervalId;
let messages = [];
let messageCount = 0; // count how many messages have been read

/**
 * Log to console and React state
 */
function log(msg, setLog) {
  console.log(msg);
  if (setLog) setLog(prev => [...prev, msg]);
}

/**
 * Speak text using browser TTS
 */
function speak(text) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

/**
 * Start reading Twitch chat
 */
export function startChatSimulation(
  channel,
  _1,
  _2,
  _3,
  setGeneratedMessage,
  messageLimit = 10,
  intervalMs = 30000,
  setLog,
  readEveryMessage = false
) {
  stopChatSimulation(setLog);
  messages = [];
  messageCount = 0;

  const cleanChannel = channel.replace(/^https?:\/\/(www\.)?twitch\.tv\//, '').trim();

  // Setup tmi.js client
  client = new tmi.Client({
    connection: { reconnect: true },
    channels: [cleanChannel],
  });

  client.connect()
    .then(() => log(`✅ Connected to Twitch chat: ${cleanChannel}`, setLog))
    .catch(err => log(`❌ Error connecting to Twitch: ${err}`, setLog));

  client.on('message', (channel, tags, message, self) => {
    if (self) return;

    const username = tags['display-name'] || 'Viewer';
    const fullMsg = `${username}: ${message}`;
    messages.push({ username, message });

    if (messages.length > 1000) messages.shift();

    if (readEveryMessage) {
      messageCount++;

      // Clear log if 6th or more message
      if (messageCount > 10) {
        if (setLog) setLog([]);
        messageCount = 1; // reset counter for current message
      }

      setGeneratedMessage(fullMsg);
      speak(message);
      log(`🗣️ Speaking message: ${fullMsg}`, setLog);
    }
  });

  // Interval mode
  if (!readEveryMessage) {
    intervalId = setInterval(() => {
      if (messages.length === 0) return;

      const available = Math.min(messages.length, messageLimit);
      const randomIndex = Math.floor(Math.random() * available);
      const selectedObj = messages[randomIndex];

      if (selectedObj) {
        messageCount++;

        if (messageCount > 10) {
          if (setLog) setLog([]);
          messageCount = 1;
        }

        const fullText = `${selectedObj.username}: ${selectedObj.message}`;
        setGeneratedMessage(fullText);
        speak(selectedObj.message);
        log(`🗣️ Speaking message: ${fullText}`, setLog);
      }

      messages = [];
    }, intervalMs);
  }

  log(`📢 Ready to read messages from ${cleanChannel}`, setLog);
}

/**
 * Stop reading chat and cleanup
 */
export function stopChatSimulation(setLog) {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;

  if (client) {
    try {
      client.disconnect();
      log('🔌 Disconnected from Twitch chat', setLog);
    } catch (e) {
      log(`⚠️ Error disconnecting Twitch client: ${e}`, setLog);
    }
    client = null;
  }

  messages = [];
  messageCount = 0;
}
 