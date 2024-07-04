const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('שרת הצאט פועל');
});

io.on('connection', (socket) => {
  console.log('משתמש חדש התחבר');

  socket.on('chat message', (msg) => {
    // כאן נטפל בהודעות הצ'אט
    console.log('התקבלה הודעה:', msg);
    // בהמשך נוסיף כאן את הלוגיקה של התרגום
  });

  socket.on('disconnect', () => {
    console.log('משתמש התנתק');
  });
});

server.listen(PORT, () => {
  console.log(`השרת פועל על פורט ${PORT}`);
});