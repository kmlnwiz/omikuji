// ユーティリティ関数

/**
 * 数字を漢数字に変換
 * @param {number} num - 変換する数字（0〜999）
 * @returns {string} 漢数字
 */
export function toKanjiNumber(num) {
    const kanjiDigits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const kanjiUnits = ['', '十', '百'];

    if (num === 0) return '〇';
    if (num < 0 || num > 999) return String(num);

    let result = '';
    const str = String(num);
    const len = str.length;

    for (let i = 0; i < len; i++) {
        const digit = parseInt(str[i]);
        const unitIndex = len - i - 1;

        if (digit === 0) continue;

        if (unitIndex > 0) {
            if (digit === 1 && unitIndex === 1) {
                result += kanjiUnits[unitIndex];
            } else {
                result += kanjiDigits[digit] + kanjiUnits[unitIndex];
            }
        } else {
            result += kanjiDigits[digit];
        }
    }

    return result;
}

/**
 * 配列をシャッフル（Fisher-Yates）
 * @param {Array} array - シャッフルする配列
 */
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * 指定ミリ秒待機
 * @param {number} ms - 待機時間（ミリ秒）
 * @returns {Promise}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
