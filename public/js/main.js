console.log('🏰 Игровое поле загружено');

// Проверка сокета
if (typeof io !== 'undefined') {
  const socket = io();
  socket.on('connect', () => console.log('✅ Связь с сервером есть'));
}

// Логика кнопки кубика (пока просто визуальный тест)
const rollBtn = document.getElementById('roll-dice-btn');
const diceResult = document.getElementById('dice-result');
const logEl = document.getElementById('game-log');

rollBtn.addEventListener('click', () => {
  // Генерируем число от 1 до 6
  const roll = Math.floor(Math.random() * 6) + 1;
  
  // Анимация кубика (подпрыгивает)
  diceResult.style.transform = 'scale(1.2) rotate(10deg)';
  setTimeout(() => {
    diceResult.textContent = roll;
    diceResult.style.transform = 'scale(1) rotate(0)';
  }, 150);

  logEl.textContent = `Вы бросили кубик и выбросили ${roll}`;
});
