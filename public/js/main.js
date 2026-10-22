console.log('🏰 Игровое поле загружено');

// Проверка сокета
if (typeof io !== 'undefined') {
  const socket = io();
  socket.on('connect', () => console.log('✅ Связь с сервером есть'));
}

// ==========================================
// 1. БАЗА ДАННЫХ КАРТ (наша колода)
// ==========================================
// Пока это просто объекты. Позже мы добавим туда картинки.
const ALL_CARDS = [
  // Богатство
  { id: 'm1', type: 'wealth', name: '1 Монета', emoji: '🪙', cost: 1, desc: '+1 ресурс' },
  { id: 'm5', type: 'wealth', name: '5 Монет', emoji: '💰', cost: 1, desc: '+5 ресурсов' },
  { id: 'm10', type: 'wealth', name: '10 Монет', emoji: '💰', cost: 1, desc: '+10 ресурсов' },
  { id: 'c1', type: 'wealth', name: 'Кристалл', emoji: '💎', cost: 1, desc: '+1 премиум-ресурс' },
  
  // Множители
  { id: 'x2', type: 'mult', name: 'Умножить х2', emoji: '✖️', cost: 1, desc: 'Удваивает очки' },
  { id: 'x3', type: 'mult', name: 'Умножить х3', emoji: '✖️', cost: 1, desc: 'Утраивает очки' },
  
  // Персонажи
  { id: 'king', type: 'char', name: 'Король', emoji: '👑', cost: 2, desc: '+5 очков, затем +5 в конце хода' },
  { id: 'knight', type: 'char', name: 'Рыцарь', emoji: '🛡️', cost: 2, desc: 'Защищает от 1 атаки' },
  { id: 'rogue', type: 'char', name: 'Разбойник', emoji: '🗡️', cost: 2, desc: 'Крадет 1 карту' },
  
  // Артефакты
  { id: 'bomb', type: 'art', name: 'Бомба', emoji: '💣', cost: 2, desc: 'Уничтожает карту врага' },
  { id: 'staff', type: 'art', name: 'Посох', emoji: '🪄', cost: 2, desc: 'Взять 3 карты' },
  
  // Эффекты
  { id: 'taboo', type: 'eff', name: 'Табу', emoji: '🚫', cost: 1, desc: 'Враг не может играть богатство' },
  { id: 'spider', type: 'eff', name: 'Паутина', emoji: '🕸️', cost: 1, desc: 'Враг не может играть множители' }
];

// ==========================================
// 2. ИГРОВОЕ СОСТОЯНИЕ (пока только твоя рука)
// ==========================================
let myHand = [];

// ==========================================
// 3. ЛОГИКА РЕНДЕРА (отрисовка карт на экране)
// ==========================================
const handContainer = document.getElementById('my-hand');

function renderHand() {
  // Очищаем контейнер перед новой отрисовкой
  handContainer.innerHTML = '';

  myHand.forEach(card => {
    // Создаем DOM-элемент для карты
    const cardEl = document.createElement('div');
    cardEl.className = 'card-placeholder';
    
    // Добавляем цветовые классы в зависимости от типа
    cardEl.classList.add(`card-type-${card.type}`);

    // Наполняем карту содержимым
    cardEl.innerHTML = `
      <div class="card-cost">${card.cost}</div>
      <div class="card-emoji">${card.emoji}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>
    `;

    handContainer.appendChild(cardEl);
  });
}

// ==========================================
// 4. СТАРТ ИГРЫ
// ==========================================
function startGame() {
  // Раздаем 7 случайных карт из базы
  myHand = [];
  for (let i = 0; i < 7; i++) {
    const randomCard = ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)];
    myHand.push(randomCard);
  }
  renderHand();
}

// Запускаем игру при загрузке
startGame();


// ==========================================
// 5. КУБИК (оставили с прошлого шага)
// ==========================================
const rollBtn = document.getElementById('roll-dice-btn');
const diceResult = document.getElementById('dice-result');
const logEl = document.getElementById('game-log');

rollBtn.addEventListener('click', () => {
  const roll = Math.floor(Math.random() * 6) + 1;
  rollBtn.disabled = true;
  diceResult.style.transform = 'rotateX(360deg) rotateY(360deg) scale(1.2)';
  diceResult.textContent = '...';
  
  setTimeout(() => {
    diceResult.textContent = roll;
    diceResult.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    rollBtn.disabled = false;
    logEl.textContent = `Вы бросили кубик. Выпало: ${roll}`;
  }, 500);
});