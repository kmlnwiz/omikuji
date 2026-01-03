// 履歴管理

import { toKanjiNumber } from './utils.js';

let history = [];
let onHistoryCardClick = null;

/**
 * 履歴を初期化
 * @param {Function} clickHandler - 履歴カードクリック時のコールバック
 */
export function initHistory(clickHandler) {
    onHistoryCardClick = clickHandler;
}

/**
 * 履歴を取得
 * @returns {Array}
 */
export function getHistory() {
    return history;
}

/**
 * 履歴に追加
 * @param {Object} card - カードオブジェクト
 */
export function addToHistory(card) {
    history.push({ ...card });
}

/**
 * 履歴をクリア
 */
export function clearHistory() {
    history = [];
}

/**
 * 履歴をレンダリング
 */
export function renderHistory() {
    const historyGrid = document.getElementById('historyGrid');

    if (history.length === 0) {
        historyGrid.innerHTML = '<div class="col-span-full text-center text-gray-500 text-sm py-4">まだ結果がありません</div>';
        return;
    }

    historyGrid.innerHTML = '';

    // 新しいものが先頭になるよう逆順で表示
    [...history].reverse().forEach((card) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'p-1 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg';
        historyItem.style.backgroundColor = card.bgColor;
        historyItem.style.borderColor = card.borderColor;
        historyItem.innerHTML = `
            <div class="text-xs font-bold">第 ${toKanjiNumber(card.id + 1)} 番</div>
            <div class="font-black tracking-widest text-xl" style="color: ${card.textColor}">${card.label}</div>
            <div class="text-xs leading-relaxed font-bold truncate">${card.message.replace(/<br>/g, '')}</div>
        `;

        // クリックで拡大表示
        if (onHistoryCardClick) {
            historyItem.addEventListener('click', () => onHistoryCardClick(card));
        }

        historyGrid.appendChild(historyItem);
    });
}
