// おみくじデータの読み込み

let omikujiData = null;

/**
 * おみくじデータを取得
 * @returns {Object|null}
 */
export function getOmikujiData() {
    return omikujiData;
}

/**
 * JSONデータを読み込む
 * @returns {Promise<Object>}
 */
export async function loadData() {
    try {
        const response = await fetch('omikuji-data.json');
        omikujiData = await response.json();
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        // フォールバック用のデフォルトデータ
        omikujiData = {
            totalCards: 30,
            ranks: [
                {
                    rank: 1,
                    type: 'kichi',
                    label: '吉',
                    probability: 1.0,
                    minCount: 1,
                    bgColor: '#f0fdf4',
                    borderColor: '#2d8b57',
                    sealColor: '#2d8b57',
                    textColor: '#006400',
                    variants: [{ subLabel: '', weight: 1 }]
                }
            ],
            messages: { kichi: ['正解+2pt、1問休'] }
        };
    }
    return omikujiData;
}

/**
 * ランダムメッセージを取得
 * @param {string} type - おみくじタイプ
 * @returns {string}
 */
export function getRandomMessage(type) {
    const messages = omikujiData.messages[type];
    return messages[Math.floor(Math.random() * messages.length)];
}
