// エフェクト処理

let effectContainer = null;
let effectLoopInterval = null;
let currentEffectCard = null;

/**
 * エフェクトコンテナを初期化
 */
export function initEffects() {
    effectContainer = document.getElementById('effectContainer');
}

/**
 * レアリティに応じたエフェクトを再生（ループ対応）
 * @param {Object} card - カードオブジェクト
 */
export function playRarityEffect(card) {
    if (!effectContainer) return;

    // 既存のループを停止
    stopEffectLoop();

    // カードを保存
    currentEffectCard = card;

    // 初回エフェクト再生
    playEffectOnce(card);

    // ループ間隔をランクに応じて設定（上位ほど短い間隔で豪華に）
    const loopIntervals = {
        1: 2000,  // 大吉：2秒
        2: 2500,  // 中吉：2.5秒
        3: 3000,  // 吉：3秒
        4: 3500   // 小吉：3.5秒
    };

    const interval = loopIntervals[card.rank] || 3000;

    // エフェクトをループ
    effectLoopInterval = setInterval(() => {
        if (currentEffectCard) {
            playEffectOnce(currentEffectCard);
        }
    }, interval);
}

/**
 * エフェクトを1回再生
 * @param {Object} card - カードオブジェクト
 */
function playEffectOnce(card) {
    switch (card.rank) {
        case 1: // 大吉
            playDaikichiEffect();
            break;
        case 2: // 中吉
            playChukichiEffect();
            break;
        case 3: // 吉
            playKichiEffect();
            break;
        case 4: // 小吉
            playShokichiEffect();
            break;
    }
}

/**
 * エフェクトループを停止
 */
export function stopEffectLoop() {
    if (effectLoopInterval) {
        clearInterval(effectLoopInterval);
        effectLoopInterval = null;
    }
    currentEffectCard = null;
}

/**
 * エフェクトをクリア
 */
export function clearEffects() {
    stopEffectLoop();
    if (effectContainer) {
        effectContainer.innerHTML = '';
    }
}

/**
 * 大吉エフェクト：最も豪華な金色の光とパーティクル
 */
function playDaikichiEffect() {
    // 光の放射（2重）
    const burst = document.createElement('div');
    burst.className = 'radial-burst';
    effectContainer.appendChild(burst);
    requestAnimationFrame(() => burst.classList.add('active'));

    // 2つ目の光の放射（遅延）
    setTimeout(() => {
        const burst2 = document.createElement('div');
        burst2.className = 'radial-burst';
        effectContainer.appendChild(burst2);
        requestAnimationFrame(() => burst2.classList.add('active'));
    }, 300);

    // 光線（多め）
    const rays = document.createElement('div');
    rays.className = 'light-rays';
    for (let i = 0; i < 16; i++) {
        const ray = document.createElement('div');
        ray.className = 'light-ray';
        ray.style.transform = `rotate(${i * 22.5}deg)`;
        rays.appendChild(ray);
    }
    effectContainer.appendChild(rays);
    requestAnimationFrame(() => rays.classList.add('active'));

    // 金色のキラキラパーティクル（大量）
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createSparkle('#FFD700', i, 25);
        }, i * 40);
    }

    // 紙吹雪（大量）
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            createConfetti();
        }, i * 25);
    }

    // 金色パーティクル（大量・大きめ）
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            createParticle('#FFD700', 20);
        }, i * 35);
    }

    // 追加の白キラキラ
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createSparkle('#FFFFFF', i, 20);
        }, 200 + i * 60);
    }
}

/**
 * 中吉エフェクト：豪華なオレンジ色のキラキラ
 */
function playChukichiEffect() {
    // 柔らかい光（大きめ・濃いめ）
    const glow = document.createElement('div');
    glow.className = 'soft-glow';
    glow.style.background = 'radial-gradient(circle, rgba(255,165,0,0.9) 0%, rgba(255,140,0,0.5) 40%, rgba(255,165,0,0) 70%)';
    glow.style.width = '600px';
    glow.style.height = '600px';
    effectContainer.appendChild(glow);
    requestAnimationFrame(() => glow.classList.add('active'));

    // 2つ目の光（遅延）
    setTimeout(() => {
        const glow2 = document.createElement('div');
        glow2.className = 'soft-glow';
        glow2.style.background = 'radial-gradient(circle, rgba(255,200,0,0.7) 0%, rgba(255,165,0,0) 60%)';
        effectContainer.appendChild(glow2);
        requestAnimationFrame(() => glow2.classList.add('active'));
    }, 200);

    // オレンジのキラキラ（多め）
    for (let i = 0; i < 35; i++) {
        setTimeout(() => {
            createSparkle('#FFA500', i, 22);
        }, i * 45);
    }

    // パーティクル（多め・大きめ）
    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            createParticle('#FFB347', 15);
        }, i * 40);
    }

    // 金色のアクセント
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            createSparkle('#FFD700', i, 18);
        }, 300 + i * 80);
    }
}

/**
 * 吉エフェクト：緑色の穏やかな光
 */
function playKichiEffect() {
    // 柔らかい光（濃いめ）
    const glow = document.createElement('div');
    glow.className = 'soft-glow';
    glow.style.background = 'radial-gradient(circle, rgba(45,139,87,0.8) 0%, rgba(60,179,113,0.4) 40%, rgba(45,139,87,0) 70%)';
    glow.style.width = '550px';
    glow.style.height = '550px';
    effectContainer.appendChild(glow);
    requestAnimationFrame(() => glow.classList.add('active'));

    // 緑のキラキラ（やや多め）
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createSparkle('#2E8B57', i, 18);
        }, i * 60);
    }

    // パーティクル（やや多め）
    for (let i = 0; i < 18; i++) {
        setTimeout(() => {
            createParticle('#3CB371', 12);
        }, i * 50);
    }
}

/**
 * 小吉エフェクト：青色の控えめな光
 */
function playShokichiEffect() {
    // 柔らかい光（やや濃いめ）
    const glow = document.createElement('div');
    glow.className = 'soft-glow';
    glow.style.background = 'radial-gradient(circle, rgba(70,130,180,0.7) 0%, rgba(100,149,237,0.3) 40%, rgba(70,130,180,0) 70%)';
    effectContainer.appendChild(glow);
    requestAnimationFrame(() => glow.classList.add('active'));

    // 青のキラキラ
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            createSparkle('#4682B4', i, 15);
        }, i * 80);
    }

    // パーティクル（少なめ）
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createParticle('#6495ED', 10);
        }, i * 70);
    }
}

/**
 * キラキラエフェクトを作成
 * @param {string} color - 色
 * @param {number} index - インデックス
 * @param {number} baseSize - 基本サイズ
 */
function createSparkle(color, index, baseSize = 15) {
    if (!effectContainer) return;
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.color = color;
    // より外側に配置（カードを避ける）
    const angle = Math.random() * Math.PI * 2;
    const radius = 35 + Math.random() * 15; // 35%〜50%の距離
    sparkle.style.left = `${50 + Math.cos(angle) * radius}%`;
    sparkle.style.top = `${50 + Math.sin(angle) * radius}%`;
    sparkle.style.animationDelay = `${index * 0.05}s`;
    const size = baseSize + Math.random() * baseSize;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    effectContainer.appendChild(sparkle);
    requestAnimationFrame(() => sparkle.classList.add('active'));

    // アニメーション終了後に削除
    setTimeout(() => sparkle.remove(), 1500);
}

/**
 * パーティクルを作成
 * @param {string} color - 色
 * @param {number} size - サイズ
 */
function createParticle(color, size) {
    if (!effectContainer) return;
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.backgroundColor = color;
    particle.style.color = color;
    const particleSize = size + Math.random() * size;
    particle.style.width = `${particleSize}px`;
    particle.style.height = `${particleSize}px`;

    // カードの外側から開始
    const startAngle = Math.random() * Math.PI * 2;
    const startRadius = 280 + Math.random() * 50;
    particle.style.left = `calc(50% + ${Math.cos(startAngle) * startRadius}px)`;
    particle.style.top = `calc(50% + ${Math.sin(startAngle) * startRadius}px)`;

    // さらに外側へ飛ぶ
    const distance = 200 + Math.random() * 300;
    particle.style.setProperty('--tx', `${Math.cos(startAngle) * distance}px`);
    particle.style.setProperty('--ty', `${Math.sin(startAngle) * distance}px`);

    effectContainer.appendChild(particle);
    requestAnimationFrame(() => particle.classList.add('active'));

    setTimeout(() => particle.remove(), 3000);
}

/**
 * 紙吹雪を作成
 */
function createConfetti() {
    if (!effectContainer) return;
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    // ランダムな色
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FF69B4', '#00CED1'];
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    // カードの外側（上部）から開始
    confetti.style.left = `${50 + (Math.random() - 0.5) * 80}%`;
    confetti.style.top = '15%';
    confetti.style.width = `${10 + Math.random() * 10}px`;
    confetti.style.height = `${10 + Math.random() * 10}px`;

    const tx = (Math.random() - 0.5) * 600;
    const ty = 400 + Math.random() * 400;
    confetti.style.setProperty('--tx', `${tx}px`);
    confetti.style.setProperty('--ty', `${ty}px`);

    effectContainer.appendChild(confetti);
    requestAnimationFrame(() => confetti.classList.add('active'));

    setTimeout(() => confetti.remove(), 4000);
}
