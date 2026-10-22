console.log('🏰 Механики подключены');

const socket = typeof io !== 'undefined' ? io() : null;

// ==========================================
// 1. БАЗА ДАННЫХ КАРТ (теперь с цифрами)
// ==========================================
const ALL_CARDS = [
  // Богатство (даёт ресурсы, не очки)
  { id: 'm1', type: 'wealth', name: '1 Монета', emoji: '🪙', cost: 1, coins: 1, desc: '+1 монета' },
  { id: 'm5', type: 'wealth', name: '5 Монет', emoji: '💰', cost: 1, coins: 5, desc: '+5 монет' },
  { id: 'm10', type: 'wealth', name: '10 Монет', emoji: '💰', cost: 1, coins: 10, desc: '+10 монет' },
  { id: 'c1', type: 'wealth', name: 'Кристалл', emoji: '💎', cost: 1, crystals: 1, desc: '+1 кристалл' },
  
  // Множители (влияют на очки от следующего персонажа в этот ход)
  { id: 'x2', type: 'mult', name: 'Умножить х2', emoji: '✖️', cost: 1, mult: 2, desc: 'x2 к очкам' },
  { id: 'x3', type: 'mult', name: 'Умножить х3', emoji: '✖️', cost: 1, mult: 3, desc: 'x3 к очкам' },
  
  // Персонажи (дают очки)
  { id: 'king', type: 'char', name: 'Король', emoji: '👑', cost: 2, points: 5, desc: '+5 очков' },
  { id: 'knight', type: 'char', name: 'Рыцарь', emoji: '🛡️', cost: 2, points: 3, desc: '+3 очка' },
  { id: 'rogue', type: 'char', name: 'Разбойник', emoji: '🗡️', cost: 2, points: 2, desc: '+2 очка' },
  
  // Артефакты и Эффекты (пока для теста просто дадим им ОД и текст)
  { id: 'bomb', type: 'art', name: 'Бомба', emoji: '💣', cost: 2, desc: 'Взрыв' },
  { id: 'taboo', type: 'eff', name: 'Табу', emoji: '🚫', cost: 1, desc: 'Запрет' }
];

// ==========================================
// 2. СОСТОЯНИЕ ИГРЫ (Твой ход)
// ==========================================
let state = {
  ap: 0,               // Очки действия
  score: 0,            // Твои очки
  coins: 0,            // Монеты
  crystals: 0,         // Кристаллы
  hand: [],            // Карты в руке
  activeCards: [],     // Карты на столе (персонажи)
  currentMultiplier: 1,// Активный множитель
  hasRolled: false     // Бросал ли ты кубик в этом ходу
};

// ==========================================
// 3. DOM ЭЛЕМЕНТЫ
// ==========================================
const ui = {
  ap: document.getElementById('ap-value'),
  score: document.getElementById('my-score'),
  coins: document.getElementById('my-coins'),
  crystals: document.getElementById('my-crystals'),
  hand: document.getElementById('my-hand'),
  activeSlots: document.getElementById('my-active-slots'),
  rollBtn: document.getElementById('roll-dice-btn'),
  endTurnBtn: document.getElementById('end-turn-btn'),
  dice: document.getElementById('dice-result'),
  log: document.getElementById('game-log')
};

// ==========================================
// 4. ОТРИСОВКА (Обновление экрана)
// ==========================================
function updateUI() {
  ui.ap.textContent = state.ap;
  ui.score.textContent = state.score;
  ui.coins.textContent = state.coins;
  ui.crystals.textContent = state.crystals;

  // Отрисовка руки
  ui.hand.innerHTML = '';
  state.hand.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = `card-placeholder card-type-${card.type}`;
    
    // Если не хватает ОД, карта становится серой (disabled)
    if (state.ap < card.cost) cardEl.classList.add('disabled');

    cardEl.innerHTML = `
      <div class="card-cost">${card.cost}</div>
      <div class="card-emoji">${card.emoji}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>
    `;

    // Клик по карте
    cardEl.addEventListener('click', () => playCard(index));
    ui.hand.appendChild(cardEl);
  });

  // Отрисовка стола (персонажи)
  ui.activeSlots.innerHTML = '';
  state.activeCards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = `card-placeholder card-type-${card.type}`;
    cardEl.innerHTML = `
      <div class="card-emoji">${card.emoji}</div>
      <div class="card-name">${card.name}</div>
    `;
    ui.activeSlots.appendChild(cardEl);
  });
}

// ==========================================
// 5. ЛОГИКА КАРТ
// ==========================================
function playCard(index) {
  const card = state.hand[index];

  // Проверка: хватает ли ОД?
  if (state.ap < card.cost) {
    ui.log.textContent = "Недостаточно Очков Действия!";
    return;
  }

  // Тратим ОД
  state.ap -= card.cost;
  
  // Удаляем карту из руки
  state.hand.splice(index, 1);

  // Применяем эффект
  if (card.type === 'wealth') {
    state.coins += card.coins || 0;
    state.crystals += card.crystals || 0;
    ui.log.textContent = `Вы получили ${card.desc}`;
  } 
  else if (card.type === 'char') {
    // Очки от персонажа умножаются на текущий множитель
    const pointsGained = card.points * state.currentMultiplier;
    state.score += pointsGained;
    state.activeCards.push(card); // Оставляем на столе
    
    ui.log.textContent = `Вы разыграли ${card.name} и получили ${pointsGained} очков!`;
    
    // Множитель сгорает после использования
    if (state.currentMultiplier > 1) {
      state.currentMultiplier = 1;
      ui.log.textContent += ' (Множитель сгорел)';
    }
  }
  else if (card.type === 'mult') {
    state.currentMultiplier = card.mult;
    ui.log.textContent = `Вы активировали множитель ${card.name}. Следующий персонаж даст больше очков!`;
  }
  else {
    ui.log.textContent = `Вы сыграли ${card.name}. (Эффект в разработке)`;
  }

  // Добираем карту до 7 в руке (если колода не пуста)
  if (state.hand.length < 7) {
    const randomCard = ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)];
    state.hand.push(randomCard);
  }

  updateUI();
}

// ==========================================
// 6. КУБИК И ХОДЫ
// ==========================================
ui.rollBtn.addEventListener('click', () => {
  if (state.hasRolled) return; // Защита от двойного клика

  const roll = Math.floor(Math.random() * 6) + 1;
  ui.rollBtn.disabled = true;

  ui.dice.style.transform = 'rotateX(360deg) rotateY(360deg) scale(1.2)';
  ui.dice.textContent = '...';
  
  setTimeout(() => {
    ui.dice.textContent = roll;
    ui.dice.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    
    // Минимум 2 ОД (как договаривались)
    state.ap = roll < 2 ? 2 : roll;
    state.hasRolled = true;
    
    ui.log.textContent = `Вы бросили кубик. Выпало: ${roll}. У вас ${state.ap} ОД.`;
    ui.endTurnBtn.disabled = false;
    
    updateUI();
  }, 500);
});

ui.endTurnBtn.addEventListener('click', () => {
  // Сброс хода
  state.ap = 0;
  state.hasRolled = false;
  state.currentMultiplier = 1;
  state.activeCards = []; // В реальной игре персонажи остаются, но для песочницы пока сбрасываем
  
  ui.rollBtn.disabled = false;
  ui.endTurnBtn.disabled = true;
  ui.dice.textContent = '?';
  ui.log.textContent = 'Ход завершен. Бросайте кубик заново!';
  
  updateUI();
});

// ==========================================
// 7. СТАРТ ИГРЫ
// ==========================================
function startGame() {
  state = { ap: 0, score: 0, coins: 0, crystals: 0, hand: [], activeCards: [], currentMultiplier: 1, hasRolled: false };
  for (let i = 0; i < 7; i++) {
    state.hand.push(ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)]);
  }
  updateUI();
}

startGame();