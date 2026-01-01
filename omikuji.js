// おみくじアプリケーション
let OMIKUJI_TYPES = [];
let MESSAGES = {};

class OmikujiApp {
    constructor() {
        this.cards = [];
        this.selectedCard = null;
        this.isAnimating = false;
        this.currentEnlargedCard = null;
        this.overlayClickHandler = null;
        this.history = []; // 引いたおみくじの履歴
    }

    async init() {
        await this.loadData();
        this.generateCards();
        this.renderCards();
        this.attachEventListeners();
    }

    // JSONデータを読み込む
    async loadData() {
        try {
            const response = await fetch('omikuji-data.json');
            const data = await response.json();
            OMIKUJI_TYPES = data.types;
            MESSAGES = data.messages;
        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);
            // フォールバック用のデフォルトデータ
            OMIKUJI_TYPES = [
                { type: 'kichi', label: '吉', probability: 1.0, bgColor: '#f0fdf4', borderColor: '#2d8b57', sealColor: '#2d8b57', textColor: '#006400' }
            ];
            MESSAGES = { kichi: ['良い一日を'] };
        }
    }

    // 確率に基づいておみくじタイプを決定
    getRandomOmikujiType() {
        const rand = Math.random();
        let cumulative = 0;

        for (const omikuji of OMIKUJI_TYPES) {
            cumulative += omikuji.probability;
            if (rand < cumulative) {
                return omikuji;
            }
        }
        return OMIKUJI_TYPES[OMIKUJI_TYPES.length - 1];
    }

    // ランダムメッセージを取得
    getRandomMessage(type) {
        const messages = MESSAGES[type];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // 30枚のカードを生成
    generateCards() {
        this.cards = Array.from({ length: 30 }, (_, i) => {
            const omikujiType = this.getRandomOmikujiType();
            return {
                id: i,
                type: omikujiType.type,
                label: omikujiType.label,
                message: this.getRandomMessage(omikujiType.type),
                bgColor: omikujiType.bgColor,
                borderColor: omikujiType.borderColor,
                sealColor: omikujiType.sealColor,
                textColor: omikujiType.textColor,
                isFlipped: false,
                isSelected: false
            };
        });
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
        cardWrapper.className = `card-container aspect-[3/4] ${card.isSelected ? 'hidden-card' : ''}`;
        cardWrapper.dataset.id = card.id;

        const cardInner = document.createElement('div');
        cardInner.className = `card ${card.isFlipped ? 'flipped' : ''}`;

        // 裏面
        const cardBack = document.createElement('div');
        cardBack.className = `card-back ${
            card.isSelected ? '' : 'cursor-pointer transition-all duration-300'
        }`;
        cardBack.innerHTML = `
            <div class="card-stamp">
                <div class="card-number">${card.id + 1}</div>
            </div>
        `;

        // 表面
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front washi-texture';
        cardFront.style.backgroundColor = card.bgColor;
        cardFront.style.borderColor = card.borderColor;
        cardFront.innerHTML = `
            <div class="brush-title text-5xl mb-4" style="color: ${card.textColor}">${card.label}</div>
            <div class="text-gray-700 text-sm text-center px-6 leading-relaxed">${card.message}</div>
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
                el.classList.add('hidden-card');
            }
        });

        // カードを複製して中央に移動
        const enlargedCard = this.createEnlargedCard(card);
        this.currentEnlargedCard = enlargedCard;
        document.getElementById('enlargedCardContainer').appendChild(enlargedCard);

        // 少し待ってから裏返す
        await this.sleep(600);
        enlargedCard.querySelector('.card').classList.add('flipped');

        // 結果を表示後、クリックで閉じる
        await this.sleep(1000);

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
        cardBack.className = 'card-back cursor-pointer';
        cardBack.innerHTML = `
            <div class="card-stamp">
                <div class="text-amber-100 text-4xl font-bold tracking-widest" style="writing-mode: vertical-rl;">御籤</div>
            </div>
        `;

        // 表面
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front cursor-pointer washi-texture';
        cardFront.style.backgroundColor = card.bgColor;
        cardFront.style.borderColor = card.borderColor;
        cardFront.innerHTML = `
            <div class="text-base font-bold mb-6" style="color: ${card.textColor}">第 ${card.id + 1} 番</div>
            <div class="result-seal mb-10" style="background-color: ${card.sealColor}">
                <div class="brush-title text-white text-5xl">${card.label}</div>
            </div>
            <div class="text-gray-700 text-xl text-center px-12 leading-loose">${card.message}</div>
        `;

        cardInner.appendChild(cardBack);
        cardInner.appendChild(cardFront);
        cardWrapper.appendChild(cardInner);

        return cardWrapper;
    }

    // 結果を閉じる
    closeResult() {
        if (!this.isAnimating) return;

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

        // 履歴を更新
        this.renderHistory();

        this.isAnimating = false;
    }

    // 待機
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        this.renderHistory();
    }

    // イベントリスナーを設定
    attachEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }

    // 履歴をレンダリング
    renderHistory() {
        const historySection = document.getElementById('historySection');
        const historyGrid = document.getElementById('historyGrid');

        if (this.history.length === 0) {
            historySection.classList.add('hidden');
            return;
        }

        historySection.classList.remove('hidden');
        historyGrid.innerHTML = '';

        this.history.forEach((card, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item p-4 rounded-lg border-2 washi-texture';
            historyItem.style.backgroundColor = card.bgColor;
            historyItem.style.borderColor = card.borderColor;
            historyItem.innerHTML = `
                <div class="text-xs text-gray-600 mb-1">第 ${card.id + 1} 番</div>
                <div class="brush-title text-2xl mb-2" style="color: ${card.textColor}">${card.label}</div>
                <div class="text-gray-600 text-xs leading-relaxed">${card.message}</div>
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
