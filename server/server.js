const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, '..', 'public')));

io.on('connection', (socket) => {
  console.log('🟢 Подключился игрок:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔴 Отключился игрок:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log('🏰 Королевская Смута запущена на порту ' + PORT);
});
