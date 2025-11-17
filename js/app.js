// ===================================
// DOMContentLoaded
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // KaTeX数式のレンダリング
    renderMathInElement(document.body, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ],
        throwOnError: false
    });

    initializeTabs();
    initializeTopicSections();
    initializeQuizzes();
    initializeTransportVisualization();
    initializeEntropySimulation();
});

// ===================================
// タブ切り替え機能
// ===================================

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // すべてのタブとコンテンツから active クラスを削除
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // クリックされたタブとそのコンテンツに active クラスを追加
            this.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            // 数式を再レンダリング
            renderMathInElement(document.getElementById(`${targetTab}-tab`), {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ],
                throwOnError: false
            });
        });
    });
}

// ===================================
// トピックセクションの展開/折りたたみ
// ===================================

function initializeTopicSections() {
    const topicHeaders = document.querySelectorAll('.topic-header');

    topicHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const topicId = this.getAttribute('data-topic');
            const content = this.nextElementSibling;

            // 展開/折りたたみのトグル
            this.classList.toggle('expanded');
            content.classList.toggle('expanded');

            // 展開時に数式を再レンダリング
            if (content.classList.contains('expanded')) {
                renderMathInElement(content, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false}
                    ],
                    throwOnError: false
                });
            }
        });
    });
}

// ===================================
// クイズ機能
// ===================================

function initializeQuizzes() {
    const quizOptions = document.querySelectorAll('.quiz-option');

    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            const isCorrect = this.getAttribute('data-correct') === 'true';
            const quizBox = this.closest('.quiz-box');
            const feedback = quizBox.querySelector('.quiz-feedback');
            const allOptions = quizBox.querySelectorAll('.quiz-option');

            // すべてのオプションを無効化
            allOptions.forEach(opt => {
                opt.style.pointerEvents = 'none';
                if (opt.getAttribute('data-correct') === 'true') {
                    opt.classList.add('correct');
                }
            });

            // クリックされたオプションの処理
            if (isCorrect) {
                this.classList.add('correct');
                feedback.textContent = '正解です！よくできました。';
                feedback.className = 'quiz-feedback correct';
            } else {
                this.classList.add('incorrect');
                feedback.textContent = '残念！もう一度考えてみましょう。';
                feedback.className = 'quiz-feedback incorrect';
            }

            feedback.style.display = 'block';
        });
    });
}

// ===================================
// 最適輸送の視覚化
// ===================================

function initializeTransportVisualization() {
    const canvas = document.getElementById('transportCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrame;
    let t = 0; // アニメーションの時間パラメータ

    // 初期分布と最終分布の点群
    const sourcePoints = generateGaussianPoints(30, 150, 150, 40);
    const targetPoints = generateGaussianPoints(30, 450, 150, 40);

    // 初期描画
    drawDistributions(ctx, sourcePoints, targetPoints, 0);

    // アニメーションボタン
    const animateBtn = document.getElementById('animateTransport');
    const resetBtn = document.getElementById('resetTransport');

    if (animateBtn) {
        animateBtn.addEventListener('click', function() {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            animateTransport();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            t = 0;
            drawDistributions(ctx, sourcePoints, targetPoints, 0);
        });
    }

    function animateTransport() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        t += 0.01;
        if (t > 1) t = 0;

        drawDistributions(ctx, sourcePoints, targetPoints, t);

        animationFrame = requestAnimationFrame(animateTransport);
    }

    function drawDistributions(ctx, source, target, progress) {
        // 背景
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 輸送の軌跡を描画
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < source.length; i++) {
            ctx.beginPath();
            ctx.moveTo(source[i].x, source[i].y);
            ctx.lineTo(target[i].x, target[i].y);
            ctx.stroke();
        }

        // 現在の点を描画
        for (let i = 0; i < source.length; i++) {
            const x = source[i].x + (target[i].x - source[i].x) * easeInOutCubic(progress);
            const y = source[i].y + (target[i].y - source[i].y) * easeInOutCubic(progress);

            ctx.fillStyle = `rgba(231, 76, 60, ${0.7})`;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
        }

        // ラベル
        ctx.fillStyle = '#2c3e50';
        ctx.font = '16px Arial';
        ctx.fillText('初期分布', 100, 30);
        ctx.fillText('最終分布', 400, 30);

        // 進行度
        ctx.fillText(`進行度: ${Math.round(progress * 100)}%`, 250, 280);
    }

    function generateGaussianPoints(n, centerX, centerY, spread) {
        const points = [];
        for (let i = 0; i < n; i++) {
            const x = centerX + (Math.random() - 0.5) * 2 * spread;
            const y = centerY + (Math.random() - 0.5) * 2 * spread;
            points.push({x, y});
        }
        return points;
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}

// ===================================
// エントロピー減衰のシミュレーション
// ===================================

function initializeEntropySimulation() {
    const canvas = document.getElementById('entropyPlot');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrame;
    let timeData = [];
    let entropyData = [];
    let maxTime = 10;
    let collisionRate = 1.0;

    // 初期描画
    drawEntropyPlot(ctx, timeData, entropyData);

    // コントロール
    const collisionSlider = document.getElementById('collisionRate');
    const startBtn = document.getElementById('startEntropy');
    const resetBtn = document.getElementById('resetEntropy');

    if (collisionSlider) {
        collisionSlider.addEventListener('input', function() {
            collisionRate = parseFloat(this.value);
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            timeData = [];
            entropyData = [];
            simulateEntropy();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            timeData = [];
            entropyData = [];
            drawEntropyPlot(ctx, timeData, entropyData);
        });
    }

    function simulateEntropy() {
        const dt = 0.1;
        const currentTime = timeData.length > 0 ? timeData[timeData.length - 1] + dt : 0;

        if (currentTime <= maxTime) {
            timeData.push(currentTime);

            // エントロピーの減衰（指数関数的）
            const entropy = Math.exp(-collisionRate * currentTime);
            entropyData.push(entropy);

            drawEntropyPlot(ctx, timeData, entropyData);

            animationFrame = requestAnimationFrame(simulateEntropy);
        }
    }

    function drawEntropyPlot(ctx, times, entropies) {
        // 背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 軸を描画
        const padding = 60;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;

        // 軸
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        // ラベル
        ctx.fillStyle = '#2c3e50';
        ctx.font = '14px Arial';
        ctx.fillText('時間', canvas.width / 2, canvas.height - 20);

        ctx.save();
        ctx.translate(20, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('エントロピー H(t)', 0, 0);
        ctx.restore();

        // タイトル
        ctx.font = '16px Arial';
        ctx.fillText('エントロピーの時間発展', canvas.width / 2 - 80, 30);

        // データがある場合はプロット
        if (times.length > 1) {
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 3;
            ctx.beginPath();

            for (let i = 0; i < times.length; i++) {
                const x = padding + (times[i] / maxTime) * plotWidth;
                const y = canvas.height - padding - entropies[i] * plotHeight;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();

            // 点を描画
            for (let i = 0; i < times.length; i++) {
                const x = padding + (times[i] / maxTime) * plotWidth;
                const y = canvas.height - padding - entropies[i] * plotHeight;

                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        // 目盛り
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '12px Arial';

        // X軸の目盛り
        for (let i = 0; i <= 5; i++) {
            const x = padding + (i / 5) * plotWidth;
            const value = (i / 5) * maxTime;
            ctx.fillText(value.toFixed(1), x - 10, canvas.height - padding + 20);
        }

        // Y軸の目盛り
        for (let i = 0; i <= 5; i++) {
            const y = canvas.height - padding - (i / 5) * plotHeight;
            const value = (i / 5);
            ctx.fillText(value.toFixed(1), padding - 30, y + 5);
        }

        // 現在の衝突率を表示
        ctx.fillStyle = '#2c3e50';
        ctx.font = '14px Arial';
        ctx.fillText(`衝突率: ${collisionRate.toFixed(1)}`, canvas.width - 150, 30);
    }
}

// ===================================
// ユーティリティ関数
// ===================================

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ページトップに戻るボタン（オプション）
window.addEventListener('scroll', function() {
    // 必要に応じて実装
});

// ローカルストレージにプログレスを保存（オプション）
function saveProgress(tabId, topicId) {
    const progress = JSON.parse(localStorage.getItem('villaniProgress') || '{}');
    if (!progress[tabId]) {
        progress[tabId] = [];
    }
    if (!progress[tabId].includes(topicId)) {
        progress[tabId].push(topicId);
    }
    localStorage.setItem('villaniProgress', JSON.stringify(progress));
}

function loadProgress() {
    const progress = JSON.parse(localStorage.getItem('villaniProgress') || '{}');
    // 必要に応じて進行状況を復元
    return progress;
}

// 印刷時の最適化
window.addEventListener('beforeprint', function() {
    // すべてのトピックを展開
    document.querySelectorAll('.topic-content').forEach(content => {
        content.classList.add('expanded');
    });
});

window.addEventListener('afterprint', function() {
    // 印刷後は元に戻す（オプション）
});

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('アプリケーションエラー:', e.error);
});

// パフォーマンス最適化：Intersection Observer でコンテンツの遅延レンダリング
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // ビューポートに入ったときに数式をレンダリング
                if (entry.target.classList.contains('topic-content')) {
                    renderMathInElement(entry.target, {
                        delimiters: [
                            {left: '$$', right: '$$', display: true},
                            {left: '$', right: '$', display: false}
                        ],
                        throwOnError: false
                    });
                }
            }
        });
    }, {
        rootMargin: '50px'
    });

    // すべてのトピックコンテンツを監視
    document.querySelectorAll('.topic-content').forEach(content => {
        observer.observe(content);
    });
}
