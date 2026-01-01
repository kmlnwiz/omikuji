// おみくじアプリケーション
let OMIKUJI_DATA = null;

// 数字を漢数字に変換
function toKanjiNumber(num) {
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

class OmikujiApp {
    constructor() {
        this.cards = [];
        this.selectedCard = null;
        this.isAnimating = false;
        this.currentEnlargedCard = null;
        this.overlayClickHandler = null;
        this.history = [];
        this.effectContainer = null;
        this.effectLoopInterval = null;
        this.currentEffectCard = null;
    }

    async init() {
        await this.loadData();
        this.generateCards();
        this.renderCards();
        this.renderStats();
        this.attachEventListeners();
        this.effectContainer = document.getElementById('effectContainer');
    }

    // JSONデータを読み込む
    async loadData() {
        try {
            const response = await fetch('omikuji-data.json');
            OMIKUJI_DATA = await response.json();
        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);
            // フォールバック用のデフォルトデータ
            OMIKUJI_DATA = {
                totalCards: 30,
                ranks: [
                    { rank: 1, type: 'kichi', label: '吉', probability: 1.0, minCount: 1, bgColor: '#f0fdf4', borderColor: '#2d8b57', sealColor: '#2d8b57', textColor: '#006400', variants: [{ subLabel: '', weight: 1 }] }
                ],
                messages: { kichi: ['良い一日を'] }
            };
        }
    }

    // ランダムメッセージを取得
    getRandomMessage(type) {
        const messages = OMIKUJI_DATA.messages[type];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // 比率に基づいてカードを生成（枚数固定）
    generateCards() {
        const totalCards = OMIKUJI_DATA.totalCards || 30;
        const ranks = OMIKUJI_DATA.ranks;
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
        this.shuffleArray(cardAssignments);

        // カードオブジェクトを生成
        this.cards = cardAssignments.map((rank, i) => ({
            id: i,
            rank: rank.rank,
            type: rank.type,
            label: rank.label,
            message: this.getRandomMessage(rank.type),
            bgColor: rank.bgColor,
            borderColor: rank.borderColor,
            sealColor: rank.sealColor,
            textColor: rank.textColor,
            isFlipped: false,
            isSelected: false
        }));
    }

    // 配列をシャッフル
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 統計情報を計算
    getStats() {
        const stats = {};
        OMIKUJI_DATA.ranks.forEach(rank => {
            stats[rank.type] = {
                label: rank.label,
                total: 0,
                remaining: 0,
                drawn: 0,
                textColor: rank.textColor,
                bgColor: rank.bgColor
            };
        });

        this.cards.forEach(card => {
            stats[card.type].total++;
            if (card.isSelected) {
                stats[card.type].drawn++;
            } else {
                stats[card.type].remaining++;
            }
        });

        return stats;
    }

    // 統計情報をレンダリング
    renderStats() {
        const statsContainer = document.getElementById('statsContainer');
        if (!statsContainer) return;

        const stats = this.getStats();
        const totalRemaining = this.cards.filter(c => !c.isSelected).length;

        let html = `<div class="text-center mb-4 text-amber-900 font-bold text-3xl">残り ${totalRemaining} 枚</div>`;
        html += '<div class="flex justify-center gap-4">';

        Object.values(stats).forEach(stat => {
            html += `
                <div class="w-48 px-3 py-4 rounded-lg border-2 text-center"
                     style="background-color: ${stat.bgColor}; border-color: ${stat.textColor}20;">
                    <div class="text-4xl font-bold" style="color: ${stat.textColor}">${stat.label}</div>
                    <div class="text-2xl font-bold">${stat.remaining} / ${stat.total}</div>
                </div>
            `;
        });

        html += '</div>';
        statsContainer.innerHTML = html;
    }

    // カードをレンダリング
    renderCards() {
        const grid = document.getElementById('cardGrid');
        grid.innerHTML = '';

        this.cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            grid.appendChild(cardElement);
        });
    }

    // カード要素を作成
    createCardElement(card) {
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
                <div class="text-amber-100 font-extrabold text-5xl" style="writing-mode: vertical-rl;">${toKanjiNumber(card.id + 1)}</div>
            </div>
        `;

        // 表面
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front flex flex-col items-center justify-center rounded border-3';
        cardFront.style.backgroundColor = card.bgColor;
        cardFront.style.borderColor = card.borderColor;
        cardFront.innerHTML = `
            <div class="font-black tracking-widest text-5xl mb-4" style="color: ${card.textColor}">${card.label}</div>
            <div class="text-gray-700 text-base text-center px-6 leading-relaxed">${card.message}</div>
        `;

        cardInner.appendChild(cardBack);
        cardInner.appendChild(cardFront);
        cardWrapper.appendChild(cardInner);

        // クリックイベント
        if (!card.isSelected) {
            cardBack.addEventListener('click', () => this.handleCardClick(card.id, cardWrapper));
        }

        return cardWrapper;
    }

    // カードクリック処理
    async handleCardClick(cardId, cardElement) {
        if (this.isAnimating) return;

        const card = this.cards.find(c => c.id === cardId);
        if (!card || card.isSelected) return;

        this.isAnimating = true;
        card.isSelected = true;

        // 履歴に追加
        this.history.push({ ...card });

        // オーバーレイ表示
        const overlay = document.getElementById('overlay');
        overlay.classList.remove('hidden');

        // 他のカードを薄くする
        document.querySelectorAll('.card-container').forEach(el => {
            if (el.dataset.id !== String(cardId)) {
                el.classList.add('opacity-15', 'pointer-events-none');
            }
        });

        // カードを複製して中央に移動
        const enlargedCard = this.createEnlargedCard(card);
        this.currentEnlargedCard = enlargedCard;
        document.getElementById('enlargedCardContainer').appendChild(enlargedCard);

        // 拡大アニメーション完了を待つ
        await this.sleep(400);
        // ランダムな静止時間を設けてから裏返す（1000ms〜3500ms）
        const randomDelay = 1000 + Math.random() * 2500;
        await this.sleep(randomDelay);
        enlargedCard.querySelector('.card').classList.add('flipped');

        // カードが完全に裏返るのを待つ（カードフリップアニメーション: 0.8s）
        await this.sleep(600);

        // レアリティに応じたエフェクトを表示
        this.playRarityEffect(card);

        // 結果を表示後、クリックで閉じる
        await this.sleep(500);

        // 古いイベントリスナーを削除
        if (this.overlayClickHandler) {
            overlay.removeEventListener('click', this.overlayClickHandler);
        }

        // 新しいイベントリスナーを設定
        this.overlayClickHandler = () => this.closeResult();
        overlay.addEventListener('click', this.overlayClickHandler);
        enlargedCard.addEventListener('click', () => this.closeResult());
    }

    // 拡大カードを作成
    createEnlargedCard(card) {
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

    // 結果を閉じる
    closeResult() {
        if (!this.isAnimating) return;

        // エフェクトをクリア
        this.clearEffects();

        // 拡大カードを削除
        if (this.currentEnlargedCard) {
            this.currentEnlargedCard.remove();
            this.currentEnlargedCard = null;
        }

        // オーバーレイを非表示
        const overlay = document.getElementById('overlay');
        overlay.classList.add('hidden');

        // イベントリスナーを削除
        if (this.overlayClickHandler) {
            overlay.removeEventListener('click', this.overlayClickHandler);
            this.overlayClickHandler = null;
        }

        // カードを再レンダリング
        this.renderCards();

        // 統計を更新
        this.renderStats();

        // 履歴を更新
        this.renderHistory();

        this.isAnimating = false;
    }

    // 待機
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // レアリティに応じたエフェクトを再生（ループ対応）
    playRarityEffect(card) {
        if (!this.effectContainer) return;

        // 既存のループを停止
        this.stopEffectLoop();

        // カードを保存
        this.currentEffectCard = card;

        // 初回エフェクト再生
        this.playEffectOnce(card);

        // ループ間隔をランクに応じて設定（上位ほど短い間隔で豪華に）
        const loopIntervals = {
            1: 2000,  // 大吉：2秒
            2: 2500,  // 中吉：2.5秒
            3: 3000,  // 吉：3秒
            4: 3500   // 小吉：3.5秒
        };

        const interval = loopIntervals[card.rank] || 3000;

        // エフェクトをループ
        this.effectLoopInterval = setInterval(() => {
            if (this.currentEffectCard) {
                this.playEffectOnce(this.currentEffectCard);
            }
        }, interval);
    }

    // エフェクトを1回再生
    playEffectOnce(card) {
        switch (card.rank) {
            case 1: // 大吉
                this.playDaikichiEffect();
                break;
            case 2: // 中吉
                this.playChukichiEffect();
                break;
            case 3: // 吉
                this.playKichiEffect();
                break;
            case 4: // 小吉
                this.playShokichiEffect();
                break;
        }
    }

    // エフェクトループを停止
    stopEffectLoop() {
        if (this.effectLoopInterval) {
            clearInterval(this.effectLoopInterval);
            this.effectLoopInterval = null;
        }
        this.currentEffectCard = null;
    }

    // 大吉エフェクト：最も豪華な金色の光とパーティクル
    playDaikichiEffect() {
        // 光の放射（2重）
        const burst = document.createElement('div');
        burst.className = 'radial-burst';
        this.effectContainer.appendChild(burst);
        requestAnimationFrame(() => burst.classList.add('active'));

        // 2つ目の光の放射（遅延）
        setTimeout(() => {
            const burst2 = document.createElement('div');
            burst2.className = 'radial-burst';
            this.effectContainer.appendChild(burst2);
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
        this.effectContainer.appendChild(rays);
        requestAnimationFrame(() => rays.classList.add('active'));

        // 金色のキラキラパーティクル（大量）
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createSparkle('#FFD700', i, 25);
            }, i * 40);
        }

        // 紙吹雪（大量）
        for (let i = 0; i < 60; i++) {
            setTimeout(() => {
                this.createConfetti();
            }, i * 25);
        }

        // 金色パーティクル（大量・大きめ）
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                this.createParticle('#FFD700', 20);
            }, i * 35);
        }

        // 追加の白キラキラ
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createSparkle('#FFFFFF', i, 20);
            }, 200 + i * 60);
        }
    }

    // 中吉エフェクト：豪華なオレンジ色のキラキラ
    playChukichiEffect() {
        // 柔らかい光（大きめ・濃いめ）
        const glow = document.createElement('div');
        glow.className = 'soft-glow';
        glow.style.background = 'radial-gradient(circle, rgba(255,165,0,0.9) 0%, rgba(255,140,0,0.5) 40%, rgba(255,165,0,0) 70%)';
        glow.style.width = '600px';
        glow.style.height = '600px';
        this.effectContainer.appendChild(glow);
        requestAnimationFrame(() => glow.classList.add('active'));

        // 2つ目の光（遅延）
        setTimeout(() => {
            const glow2 = document.createElement('div');
            glow2.className = 'soft-glow';
            glow2.style.background = 'radial-gradient(circle, rgba(255,200,0,0.7) 0%, rgba(255,165,0,0) 60%)';
            this.effectContainer.appendChild(glow2);
            requestAnimationFrame(() => glow2.classList.add('active'));
        }, 200);

        // オレンジのキラキラ（多め）
        for (let i = 0; i < 35; i++) {
            setTimeout(() => {
                this.createSparkle('#FFA500', i, 22);
            }, i * 45);
        }

        // パーティクル（多め・大きめ）
        for (let i = 0; i < 25; i++) {
            setTimeout(() => {
                this.createParticle('#FFB347', 15);
            }, i * 40);
        }

        // 金色のアクセント
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createSparkle('#FFD700', i, 18);
            }, 300 + i * 80);
        }
    }

    // 吉エフェクト：緑色の穏やかな光
    playKichiEffect() {
        // 柔らかい光（濃いめ）
        const glow = document.createElement('div');
        glow.className = 'soft-glow';
        glow.style.background = 'radial-gradient(circle, rgba(45,139,87,0.8) 0%, rgba(60,179,113,0.4) 40%, rgba(45,139,87,0) 70%)';
        glow.style.width = '550px';
        glow.style.height = '550px';
        this.effectContainer.appendChild(glow);
        requestAnimationFrame(() => glow.classList.add('active'));

        // 緑のキラキラ（やや多め）
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createSparkle('#2E8B57', i, 18);
            }, i * 60);
        }

        // パーティクル（やや多め）
        for (let i = 0; i < 18; i++) {
            setTimeout(() => {
                this.createParticle('#3CB371', 12);
            }, i * 50);
        }
    }

    // 小吉エフェクト：青色の控えめな光
    playShokichiEffect() {
        // 柔らかい光（やや濃いめ）
        const glow = document.createElement('div');
        glow.className = 'soft-glow';
        glow.style.background = 'radial-gradient(circle, rgba(70,130,180,0.7) 0%, rgba(100,149,237,0.3) 40%, rgba(70,130,180,0) 70%)';
        this.effectContainer.appendChild(glow);
        requestAnimationFrame(() => glow.classList.add('active'));

        // 青のキラキラ
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                this.createSparkle('#4682B4', i, 15);
            }, i * 80);
        }

        // パーティクル（少なめ）
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createParticle('#6495ED', 10);
            }, i * 70);
        }
    }

    // キラキラエフェクトを作成
    createSparkle(color, index, baseSize = 15) {
        if (!this.effectContainer) return;
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
        this.effectContainer.appendChild(sparkle);
        requestAnimationFrame(() => sparkle.classList.add('active'));

        // アニメーション終了後に削除
        setTimeout(() => sparkle.remove(), 1500);
    }

    // パーティクルを作成
    createParticle(color, size) {
        if (!this.effectContainer) return;
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

        this.effectContainer.appendChild(particle);
        requestAnimationFrame(() => particle.classList.add('active'));

        setTimeout(() => particle.remove(), 3000);
    }

    // 紙吹雪を作成
    createConfetti() {
        if (!this.effectContainer) return;
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

        this.effectContainer.appendChild(confetti);
        requestAnimationFrame(() => confetti.classList.add('active'));

        setTimeout(() => confetti.remove(), 4000);
    }

    // エフェクトをクリア
    clearEffects() {
        // ループを停止
        this.stopEffectLoop();

        if (this.effectContainer) {
            this.effectContainer.innerHTML = '';
        }
    }

    // リセット
    reset() {
        // 拡大カードとオーバーレイをクリア
        const enlargedContainer = document.getElementById('enlargedCardContainer');
        enlargedContainer.innerHTML = '';

        const overlay = document.getElementById('overlay');
        overlay.classList.add('hidden');

        // イベントリスナーを削除
        if (this.overlayClickHandler) {
            overlay.removeEventListener('click', this.overlayClickHandler);
            this.overlayClickHandler = null;
        }

        this.cards = [];
        this.selectedCard = null;
        this.isAnimating = false;
        this.currentEnlargedCard = null;
        this.history = [];
        this.generateCards();
        this.renderCards();
        this.renderStats();
        this.renderHistory();
    }

    // イベントリスナーを設定
    attachEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
    }

    // 全画面表示を切り替え
    toggleFullscreen() {
        const btn = document.getElementById('fullscreenBtn');
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                btn.textContent = '全画面解除';
            }).catch(err => {
                console.error('全画面表示に失敗しました:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                btn.textContent = '全画面';
            });
        }
    }

    // 履歴をレンダリング
    renderHistory() {
        const historyGrid = document.getElementById('historyGrid');

        if (this.history.length === 0) {
            historyGrid.innerHTML = '<div class="col-span-full text-center text-gray-500 text-lg py-8">まだ結果がありません</div>';
            return;
        }

        historyGrid.innerHTML = '';

        this.history.forEach((card, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg';
            historyItem.style.backgroundColor = card.bgColor;
            historyItem.style.borderColor = card.borderColor;
            historyItem.innerHTML = `
                <div class="text-lg mb-1 font-bold">第 ${toKanjiNumber(card.id + 1)} 番</div>
                <div class="font-black tracking-widest text-3xl mb-2" style="color: ${card.textColor}">${card.label}</div>
                <div class="text-lg leading-relaxed font-bold">${card.message}</div>
            `;

            // クリックで拡大表示
            historyItem.addEventListener('click', () => this.showHistoryCard(card));

            historyGrid.appendChild(historyItem);
        });
    }

    // 履歴カードを拡大表示
    async showHistoryCard(card) {
        if (this.isAnimating) return;

        this.isAnimating = true;

        // オーバーレイ表示
        const overlay = document.getElementById('overlay');
        overlay.classList.remove('hidden');

        // 拡大カードを作成（既に裏返し済みの状態）
        const enlargedCard = this.createEnlargedCard(card);
        enlargedCard.querySelector('.card').classList.add('flipped');
        this.currentEnlargedCard = enlargedCard;
        document.getElementById('enlargedCardContainer').appendChild(enlargedCard);

        // クリックで閉じる
        await this.sleep(100);

        if (this.overlayClickHandler) {
            overlay.removeEventListener('click', this.overlayClickHandler);
        }

        this.overlayClickHandler = () => this.closeHistoryView();
        overlay.addEventListener('click', this.overlayClickHandler);
        enlargedCard.addEventListener('click', () => this.closeHistoryView());
    }

    // 履歴表示を閉じる
    closeHistoryView() {
        if (!this.isAnimating) return;

        if (this.currentEnlargedCard) {
            this.currentEnlargedCard.remove();
            this.currentEnlargedCard = null;
        }

        const overlay = document.getElementById('overlay');
        overlay.classList.add('hidden');

        if (this.overlayClickHandler) {
            overlay.removeEventListener('click', this.overlayClickHandler);
            this.overlayClickHandler = null;
        }

        this.isAnimating = false;
    }
}

// アプリ起動
document.addEventListener('DOMContentLoaded', () => {
    const app = new OmikujiApp();
    app.init();
});
