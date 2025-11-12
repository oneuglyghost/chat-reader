import React, { useState, useEffect } from 'react';
import { startChatSimulation, stopChatSimulation } from './utils/twitchChatReader';

const App = () => {
  const [channelInput, setChannelInput] = useState(localStorage.getItem('channelInput') || '');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [messageLimit, setMessageLimit] = useState(parseInt(localStorage.getItem('messageLimit')) || 10);
  const [intervalMs, setIntervalMs] = useState(parseInt(localStorage.getItem('intervalMs')) || 30000);
  const [logs, setLogs] = useState([]);
  const [readEveryMessage, setReadEveryMessage] = useState(false);

  useEffect(() => localStorage.setItem('channelInput', channelInput), [channelInput]);
  useEffect(() => localStorage.setItem('messageLimit', messageLimit), [messageLimit]);
  useEffect(() => localStorage.setItem('intervalMs', intervalMs), [intervalMs]);

  const handleStart = () => {
    if (!channelInput.trim()) {
      alert('Enter a Twitch channel name or URL');
      return;
    }
    startChatSimulation(channelInput, null, null, null, setGeneratedMessage, messageLimit, intervalMs, setLogs, readEveryMessage);
    setIsRunning(true);
  };

  const handleStop = () => {
    stopChatSimulation(setLogs);
    setIsRunning(false);
  };

  const formatInterval = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial' }}>
      
      {/* Left side: controls */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <h1>Twitch Chat Speaker 🎙️</h1>

        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            checked={readEveryMessage}
            onChange={(e) => setReadEveryMessage(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Read every message immediately (disable timer)
        </label>

        <input
          type="text"
          placeholder="twitch.tv/channel"
          value={channelInput}
          onChange={(e) => setChannelInput(e.target.value)}
          style={{ width: '80%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        <p>Read 1 message out of every N received</p>
        <input
          type="number"
          min="1"
          value={messageLimit}
          onChange={(e) => setMessageLimit(e.target.value)}
          style={{ width: '80%', padding: '0.5rem', marginBottom: '1rem' }}
          disabled={readEveryMessage}
        />

        <p>How often to read a message ({formatInterval(intervalMs)})</p>
        <input
          type="range"
          min="30000"
          max="600000"
          step="5000"
          value={intervalMs}
          onChange={(e) => setIntervalMs(parseInt(e.target.value))}
          style={{ width: '80%', marginBottom: '1rem' }}
          disabled={readEveryMessage}
        />

        <div>
          {!isRunning ? (
            <button onClick={handleStart} style={{ padding: '0.5rem 1rem' }}>Start Reading Chat</button>
          ) : (
            <button onClick={handleStop} style={{ padding: '0.5rem 1rem', backgroundColor: 'red', color: 'white' }}>Stop</button>
          )}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>Latest Chosen Message:</h3>
          <p>{generatedMessage}</p>
        </div>
      </div>

      {/* Right side: log box */}
      <div style={{
        width: '300px',
        padding: '1rem',
        borderLeft: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{ marginTop: 0 }}>Logs</h3>
        <div style={{ flex: 1 }}>
          {logs.map((log, i) => (
            <div key={i} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
