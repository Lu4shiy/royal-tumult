console.log('🏰 Королевская Смута — прототип загружен');

const statusEl = document.getElementById('socket-status');

if (typeof io !== 'undefined') {
  const socket = io();

  socket.on('connect', () => {
    console.log('✅ Socket.io подключён. ID:', socket.id);
    statusEl.textContent = '✅ Сервер на связи. Можно начинать разработку.';
    statusEl.classList.add('connected');
  });

  socket.on('disconnect', () => {
    statusEl.textContent = '⚠️ Потеряна связь с сервером';
    statusEl.classList.remove('connected');
  });
} else {
  statusEl.textContent = '⚠️ Socket.io не загружен (проверь сервер)';
}

document.getElementById('test-btn').addEventListener('click', () => {
  alert('Всё работает! Готовы строить игровое поле.');
});
