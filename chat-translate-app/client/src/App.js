import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage) {
      socket.emit('chat message', inputMessage);
      setInputMessage('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const audioBlob = new Blob([event.data], { type: 'audio/wav' });
          sendAudioToServer(audioBlob);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('שגיאה בהקלטה:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToServer = (audioBlob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result.split(',')[1];
      socket.emit('audio message', base64Audio);
    };
    reader.readAsDataURL(audioBlob);
  };

  return (
    <div className="App">
      <h1>אפליקציית צ'אט עם תרגום</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button type="submit">שלח</button>
      </form>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'עצור הקלטה' : 'התחל הקלטה'}
      </button>
    </div>
  );
}

export default App;