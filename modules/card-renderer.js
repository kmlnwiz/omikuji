// カードUIレンダリング

import { toKanjiNumber } from './utils.js';

/**
 * カードをレンダリング
 * @param {Array} cards - カード配列
 * @param {Function} onCardClick - カードクリック時のコールバック
 */
export function renderCards(cards, onCardClick) {
    const grid = document.getElementById('cardGrid');
    grid.innerHTML = '';

    cards.forEach(card => {
        const cardElement = createCardElement(card, onCardClick);
        grid.appendChild(cardElement);
    });
}

/**
 * カード要素を作成
 * @param {Object} card - カードオブジェクト
 * @param {Function} onCardClick - カードクリック時のコールバック
 * @returns {HTMLElement}
 */
export function createCardElement(card, onCardClick) {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = `card-container aspect-[3/4] ${card.isSelected ? 'opacity-15 pointer-events-none' : ''}`;
    cardWrapper.dataset.id = card.id;

    const cardInner = document.createElement('div');
    cardInner.className = `card ${card.isFlipped ? 'flipped' : ''}`;

    // 裏面
    const cardBack = document.createElement('div');
    cardBack.className = `card-back flex flex-col items-center justify-center rounded bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-950 ${card.isSelected ? '' : 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300'}`;
    cardBack.innerHTML = `
        <div class="w-4/5 h-4/5 border-2 border-white/30 rounded-full flex items-center justify-center">
            <div class="text-amber-100 font-extrabold text-3xl" style="writing-mode: vertical-rl;">${toKanjiNumber(card.id + 1)}</div>
        </div>
    `;

    // 表面
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front flex flex-col items-center justify-center rounded border-3';
    cardFront.style.backgroundColor = card.bgColor;
    cardFront.style.borderColor = card.borderColor;
    cardFront.innerHTML = `
        <div class="font-black tracking-widest text-3xl mb-2" style="color: ${card.textColor}">${card.label}</div>
        <div class="text-gray-700 text-xs text-center px-3 leading-relaxed">${card.message}</div>
    `;

    cardInner.appendChild(cardBack);
    cardInner.appendChild(cardFront);
    cardWrapper.appendChild(cardInner);

    // クリックイベント
    if (!card.isSelected && onCardClick) {
        cardBack.addEventListener('click', () => onCardClick(card.id, cardWrapper));
    }

    return cardWrapper;
}

/**
 * 拡大カードを作成
 * @param {Object} card - カードオブジェクト
 * @returns {HTMLElement}
 */
export function createEnlargedCard(card) {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'card-container card-enlarge';

    const cardInner = document.createElement('div');
    cardInner.className = 'card';

    // 裏面
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back flex flex-col items-center justify-center rounded bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-950 cursor-pointer';
    cardBack.innerHTML = `
        <div class="w-3/5 h-3/5 border-2 border-white/30 rounded-full flex items-center justify-center">
            <div class="text-amber-100 text-8xl font-bold" style="writing-mode: vertical-rl;">${toKanjiNumber(card.id + 1)}</div>
        </div>
    `;

    // 表面
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front flex flex-col items-center justify-center rounded border-3 cursor-pointer';
    cardFront.style.backgroundColor = card.bgColor;
    cardFront.style.borderColor = card.borderColor;
    cardFront.innerHTML = `
        <div class="font-bold mb-4 text-5xl" style="color: ${card.textColor}">第 ${toKanjiNumber(card.id + 1)} 番</div>
        <div class="w-72 h-72 rounded-full flex items-center justify-center relative shadow-xl mb-6 border-4 border-white/40" style="background-color: ${card.sealColor}">
            <div class="absolute w-[256px] h-[256px] border-2 border-white/30 rounded-full"></div>
            <div class="font-black tracking-widest text-white text-8xl flex items-center justify-center" style="writing-mode: vertical-rl; white-space: nowrap;">${card.label}</div>
        </div>
        <div class="text-5xl text-center px-10 leading-loose font-bold">${card.message}</div>
    `;

    cardInner.appendChild(cardBack);
    cardInner.appendChild(cardFront);
    cardWrapper.appendChild(cardInner);

    return cardWrapper;
}
