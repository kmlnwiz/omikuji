// 統計表示

import { getOmikujiData } from './data-loader.js';

/**
 * 統計情報を計算
 * @param {Array} cards - カード配列
 * @returns {Object}
 */
export function getStats(cards) {
    const data = getOmikujiData();
    const stats = {};

    data.ranks.forEach(rank => {
        stats[rank.type] = {
            label: rank.label,
            total: 0,
            remaining: 0,
            drawn: 0,
            textColor: rank.textColor,
            bgColor: rank.bgColor
        };
    });

    cards.forEach(card => {
        stats[card.type].total++;
        if (card.isSelected) {
            stats[card.type].drawn++;
        } else {
            stats[card.type].remaining++;
        }
    });

    return stats;
}

/**
 * 統計情報をレンダリング
 * @param {Array} cards - カード配列
 */
export function renderStats(cards) {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;

    const stats = getStats(cards);
    const totalRemaining = cards.filter(c => !c.isSelected).length;

    let html = `<div class="text-center mb-1 text-amber-900 font-bold text-xl">残り ${totalRemaining} 枚</div>`;
    html += '<div class="flex justify-center gap-2">';

    Object.values(stats).forEach(stat => {
        html += `
            <div class="w-32 px-2 py-2 rounded-lg border-2 text-center"
                 style="background-color: ${stat.bgColor}; border-color: ${stat.textColor}20;">
                <div class="text-2xl font-bold" style="color: ${stat.textColor}">${stat.label}</div>
                <div class="text-lg font-bold">${stat.remaining} / ${stat.total}</div>
            </div>
        `;
    });

    html += '</div>';
    statsContainer.innerHTML = html;
}
