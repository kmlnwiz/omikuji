// おみくじアプリケーション（メインモジュール）

import { sleep } from './modules/utils.js';
import { loadData } from './modules/data-loader.js';
import { generateCards } from './modules/card-generator.js';
import { renderCards, createEnlargedCard } from './modules/card-renderer.js';
import { initEffects, playRarityEffect, clearEffects } from './modules/effects.js';
import { renderStats } from './modules/stats.js';

class OmikujiApp {
    constructor() {
        this.cards = [];
        this.isAnimating = false;
        this.currentEnlargedCard = null;
        this.overlayClickHandler = null;
    }

    async init() {
        await loadData();
        this.cards = generateCards();
        this.render();
        this.attachEventListeners();
        initEffects();
    }

    render() {
        renderCards(
            this.cards,
            (cardId, cardElement) => this.handleCardClick(cardId, cardElement),
            (card) => this.showSelectedCard(card)
        );
        renderStats(this.cards);
    }

    async handleCardClick(cardId, cardElement) {
        if (this.isAnimating) return;

        const card = this.cards.find(c => c.id === cardId);
        if (!card || card.isSelected) return;

        this.isAnimating = true;
        card.isSelected = true;

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
        const enlargedCard = createEnlargedCard(card);
        this.currentEnlargedCard = enlargedCard;
        document.getElementById('enlargedCardContainer').appendChild(enlargedCard);

        // 拡大アニメーション完了を待つ
        await sleep(400);
        // ランダムな静止時間を設けてから裏返す（1500ms〜4500ms）
        const randomDelay = 1500 + Math.random() * 3000;
        await sleep(randomDelay);
        enlargedCard.querySelector('.card').classList.add('flipped');

        // カードが完全に裏返るのを待つ（カードフリップアニメーション: 0.8s）
        await sleep(600);

        // レアリティに応じたエフェクトを表示
        playRarityEffect(card);

        // 結果を表示後、クリックで閉じる
        await sleep(500);

        // 古いイベントリスナーを削除
        if (this.overlayClickHandler) {
            overlay.removeEventListener('click', this.overlayClickHandler);
        }

        // 新しいイベントリスナーを設定
        this.overlayClickHandler = () => this.closeResult();
        overlay.addEventListener('click', this.overlayClickHandler);
        enlargedCard.addEventListener('click', () => this.closeResult());
    }

    closeResult() {
        if (!this.isAnimating) return;

        // エフェクトをクリア
        clearEffects();

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

        // 再レンダリング
        this.render();

        this.isAnimating = false;
    }

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

        // 状態をリセット
        this.isAnimating = false;
        this.currentEnlargedCard = null;

        // カードを再生成
        this.cards = generateCards();
        this.render();
    }

    openAll() {
        if (this.isAnimating) return;

        // 未選択のカードをすべて開く
        this.cards.forEach(card => {
            if (!card.isSelected) {
                card.isSelected = true;
            }
        });

        // 再レンダリング
        this.render();
    }

    attachEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('openAllBtn').addEventListener('click', () => this.openAll());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());

        // ヘルプモーダル
        const helpBtn = document.getElementById('helpBtn');
        const helpModal = document.getElementById('helpModal');
        const helpCloseBtn = document.getElementById('helpCloseBtn');
        const helpModalOverlay = document.getElementById('helpModalOverlay');

        helpBtn.addEventListener('click', () => {
            helpModal.classList.remove('hidden');
        });

        helpCloseBtn.addEventListener('click', () => {
            helpModal.classList.add('hidden');
        });

        helpModalOverlay.addEventListener('click', () => {
            helpModal.classList.add('hidden');
        });
    }

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

    async showSelectedCard(card) {
        if (this.isAnimating) return;

        this.isAnimating = true;

        // オーバーレイ表示
        const overlay = document.getElementById('overlay');
        overlay.classList.remove('hidden');

        // 拡大カードを作成（既に裏返し済みの状態）
        const enlargedCard = createEnlargedCard(card);
        enlargedCard.querySelector('.card').classList.add('flipped');
        this.currentEnlargedCard = enlargedCard;
        document.getElementById('enlargedCardContainer').appendChild(enlargedCard);

        // クリックで閉じる
        await sleep(100);

        if (this.overlayClickHandler) {
            overlay.removeEventListener('click', this.overlayClickHandler);
        }

        this.overlayClickHandler = () => this.closeSelectedView();
        overlay.addEventListener('click', this.overlayClickHandler);
        enlargedCard.addEventListener('click', () => this.closeSelectedView());
    }

    closeSelectedView() {
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
