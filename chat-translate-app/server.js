const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const speech = require('@google-cloud/speech');
const {Translate} = require('@google-cloud/translate').v2;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const speechClient = new speech.SpeechClient();
const translate = new Translate();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('שרת הצאט פועל');
});

io.on('connection', (socket) => {
  console.log('משתמש חדש התחבר');

  socket.on('chat message', async (msg) => {
    console.log('התקבלה הודעה:', msg);
    const translatedMsg = await translateText(msg, 'en'); // תרגום לאנגלית
    io.emit('chat message', `מקור: ${msg}\nתרגום: ${translatedMsg}`);
  });

  socket.on('audio message', async (audioData) => {
    const text = await transcribeAudio(audioData);
    const translatedText = await translateText(text, 'en'); // תרגום לאנגלית
    io.emit('chat message', `מקור (מוקלט): ${text}\nתרגום: ${translatedText}`);
  });

  socket.on('disconnect', () => {
    console.log('משתמש התנתק');
  });
});

async function transcribeAudio(audioData) {
  const audio = {
    content: audioData,
  };
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'he-IL',
  };
  const request = {
    audio: audio,
    config: config,
  };

  const [response] = await speechClient.recognize(request);
  return response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
}

async function translateText(text, targetLanguage) {
  const [translation] = await translate.translate(text, targetLanguage);
  return translation;
}

server.listen(PORT, () => {
  console.log(`השרת פועל על פורט ${PORT}`);
});