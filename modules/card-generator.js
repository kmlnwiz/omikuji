// カード生成

import { shuffleArray } from './utils.js';
import { getOmikujiData, getRandomMessage } from './data-loader.js';

/**
 * 比率に基づいてカードを生成（枚数固定）
 * @returns {Array} カードオブジェクトの配列
 */
export function generateCards() {
    const data = getOmikujiData();
    const totalCards = data.totalCards || 30;
    const ranks = data.ranks;
    const cardAssignments = [];

    // 比率の合計を計算
    const totalRatio = ranks.reduce((sum, rank) => sum + (rank.ratio || 1), 0);

    // 各ランクの枚数を比率に基づいて計算
    let assignedCount = 0;
    const cardCounts = ranks.map((rank, index) => {
        if (index === ranks.length - 1) {
            // 最後のランクは残り全部
            return totalCards - assignedCount;
        }
        const count = Math.round((rank.ratio || 1) / totalRatio * totalCards);
        assignedCount += count;
        return count;
    });

    // カードを割り当て
    ranks.forEach((rank, index) => {
        for (let i = 0; i < cardCounts[index]; i++) {
            cardAssignments.push(rank);
        }
    });

    // シャッフル
    shuffleArray(cardAssignments);

    // カードオブジェクトを生成
    return cardAssignments.map((rank, i) => ({
        id: i,
        rank: rank.rank,
        type: rank.type,
        label: rank.label,
        message: getRandomMessage(rank.type),
        bgColor: rank.bgColor,
        borderColor: rank.borderColor,
        sealColor: rank.sealColor,
        textColor: rank.textColor,
        isFlipped: false,
        isSelected: false
    }));
}
