import React, { useEffect } from 'react';
import { startChatSimulation, stopChatSimulation } from './utils/fakeChatGenerator';

const App = () => {
    const [streamPrompt, setStreamPrompt] = React.useState(localStorage.getItem('streamPrompt') || '');
    const [character, setCharacter] = React.useState(localStorage.getItem('character') || '');
    const [sampleChats, setSampleChats] = React.useState(localStorage.getItem('sampleChats') || '');
    const [players, setPlayers] = React.useState(
        JSON.parse(localStorage.getItem('players')) || [
            { name: '', desc: '' },
            { name: '', desc: '' },
            { name: '', desc: '' },
            { name: '', desc: '' }
        ]
    );
    const [generatedMessage, setGeneratedMessage] = React.useState('');
    const [isRunning, setIsRunning] = React.useState(false);

    useEffect(() => { localStorage.setItem('streamPrompt', streamPrompt); }, [streamPrompt]);
    useEffect(() => { localStorage.setItem('character', character); }, [character]);
    useEffect(() => { localStorage.setItem('sampleChats', sampleChats); }, [sampleChats]);
    useEffect(() => { localStorage.setItem('players', JSON.stringify(players)); }, [players]);

    const handlePlayerChange = (index, field, value) => {
        const newPlayers = [...players];
        newPlayers[index][field] = value;
        setPlayers(newPlayers);
    };

    const handleStart = () => {
        if (!streamPrompt.trim()) return alert("Please enter your stream description!");
        startChatSimulation(streamPrompt, character, players, sampleChats, setGeneratedMessage);
        setIsRunning(true);
    };

    const handleStop = () => {
        stopChatSimulation();
        setIsRunning(false);
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
            <h1>Fake Twitch Chat Simulator</h1>

            <textarea
                placeholder="Describe what your stream is doing..."
                value={streamPrompt}
                onChange={(e) => setStreamPrompt(e.target.value)}
                style={{ width: '80%', height: '120px', padding: '0.5rem', marginBottom: '1rem', resize: 'vertical' }}
            />

            <input
                type="text"
                placeholder="Character you are playing"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                style={{ width: '80%', padding: '0.5rem', marginBottom: '1rem' }}
            />

            <textarea
                placeholder="Sample Twitch chats (one per line)"
                value={sampleChats}
                onChange={(e) => setSampleChats(e.target.value)}
                style={{ width: '80%', height: '100px', padding: '0.5rem', marginBottom: '1rem', resize: 'vertical' }}
            />

            {players.map((player, i) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder={`Player ${i + 1} name`}
                        value={player.name}
                        onChange={(e) => handlePlayerChange(i, 'name', e.target.value)}
                        style={{ width: '35%', padding: '0.5rem', marginRight: '0.5rem' }}
                    />
                    <input
                        type="text"
                        placeholder={`Player ${i + 1} description`}
                        value={player.desc}
                        onChange={(e) => handlePlayerChange(i, 'desc', e.target.value)}
                        style={{ width: '40%', padding: '0.5rem' }}
                    />
                </div>
            ))}

            <div style={{ margin: '1rem 0' }}>
                {!isRunning ? (
                    <button onClick={handleStart} style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}>
                        Start Chat
                    </button>
                ) : (
                    <button onClick={handleStop} style={{ padding: '0.5rem 1rem', backgroundColor: 'red', color: 'white' }}>
                        Stop Chat
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
