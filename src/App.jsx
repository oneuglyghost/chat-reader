import React, { useState } from 'react';
import { startChatSimulation, stopChatSimulation } from './utils/twitchChatReader';

const App = () => {
  const [channelInput, setChannelInput] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleStart = () => {
    if (!channelInput.trim()) {
      alert("Enter a Twitch channel name or URL");
      return;
    }
    startChatSimulation(channelInput, null, null, null, setGeneratedMessage);
    setIsRunning(true);
  };

  const handleStop = () => {
    stopChatSimulation();
    setIsRunning(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Twitch Chat Speaker 🎙️</h1>
      <p>Enter a Twitch channel name or URL (example: <code>twitch.tv/xqc</code> or <code>xqc</code>)</p>

      <input
        type="text"
        placeholder="twitch.tv/someChannel"
        value={channelInput}
        onChange={(e) => setChannelInput(e.target.value)}
        style={{ width: '80%', padding: '0.5rem', marginBottom: '1rem' }}
      />

      <div>
        {!isRunning ? (
          <button onClick={handleStart} style={{ padding: '0.5rem 1rem' }}>
            Start Reading Chat
          </button>
        ) : (
          <button onClick={handleStop} style={{ padding: '0.5rem 1rem', backgroundColor: 'red', color: 'white' }}>
            Stop
          </button>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Latest Message:</h3>
        <p>{generatedMessage}</p>
      </div>
    </div>
  );
};

export default App;

