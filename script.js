// ========== 数据与常量 ==========
const symbols = ['💕', '⭐', '🎁', '🌟', '💖', '✨'];
const gifts = [
    { name: '早餐券', message: '明天开始，每天为你做早餐', weight: 1 },
    { name: '按摩券', message: '疲惫的时候，有我在', weight: 2 },
    { name: '电影券', message: '每周一部电影约会', weight: 3 },
    { name: '甜品券', message: '随时想吃甜品都满足', weight: 4 },
    { name: '旅行基金', message: '一起去看更大的世界', weight: 5 },
    { name: '任选礼物', message: '这次你说了算！', weight: 6 }
];
let currentGift = null;
let isSpinning = false;
let slotIntervals = [];
let flippedCards = 0;
const TOTAL_CARDS = 3;
let canFlip = true;
let isFirstDraw = true; // 标记是否是本次游戏第一次抽奖

// ========== 初始化开场页文字 ==========
document.querySelector('.title').textContent = '💕 521 Love 💕';
document.querySelector('.subtitle').textContent = '亲爱的，节日快乐！';
document.querySelector('.description').textContent = '选择一张卡片，开启你的专属礼物~';
document.getElementById('btn-start').textContent = '开始抽取礼物';

// 初始化翻牌页
document.querySelector('#page-cards .page-title').textContent = '选择一张卡片';
// 每张卡片正面显示不同的符号
var cardFrontSymbols = ['💖高', '💝美', '💕美'];
document.querySelectorAll('.card-front').forEach(function(el, index) {
    el.textContent = cardFrontSymbols[index] || '💌';
});
// 每张卡片的背面显示不同的神秘符号
var cardBackSymbols = ['高', '美', '美'];
document.querySelectorAll('.card-back').forEach(function(el, index) {
    el.textContent = cardBackSymbols[index] || '?';
});

// 初始化老虎机页
document.querySelector('#page-slot .page-title').textContent = '抽奖时间~';
document.getElementById('btn-spin').textContent = '点击抽奖';

// 初始化结果页
document.querySelector('.gift-label').textContent = '恭喜获得';
document.getElementById('btn-replay').textContent = '再抽一次';

// ========== 工具函数 ==========
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
    }
}

// ========== 老虎机辅助函数 ==========
function getSpinDuration(giftWeight) {
    // 基础时间2秒，每增加1权重增加0.5秒
    // 范围: 2秒(权重1) ~ 4.5秒(权重6)
    return 2000 + giftWeight * 500;
}

function getEffectIntensity(giftWeight) {
    // 范围: 0.5(权重1) ~ 1.5(权重6)
    return 0.5 + (giftWeight / 6) * 1;
}

function selectRandomGift() {
    // 如果是本次游戏第一次抽奖，直接返回"任选礼物"
    if (isFirstDraw) {
        isFirstDraw = false;
        return gifts.find(function(g) { return g.name === '任选礼物'; });
    }

    // 根据权重随机选择
    var totalWeight = gifts.reduce(function(sum, g) { return sum + g.weight; }, 0);
    var random = Math.random() * totalWeight;
    var cumulative = 0;
    for (var i = 0; i < gifts.length; i++) {
        cumulative += gifts[i].weight;
        if (random < cumulative) {
            return gifts[i];
        }
    }
    return gifts[gifts.length - 1];
}

// ========== 开场页逻辑 ==========
document.getElementById('btn-start').addEventListener('click', function() {
    showPage('page-cards');
    createParticles(30);
});

// ========== 翻牌逻辑 ==========
document.querySelectorAll('.card').forEach(function(card) {
    card.addEventListener('click', function() {
        if (this.classList.contains('flipped') || !canFlip) {
            return;
        }
        this.classList.add('flipped');
        flippedCards++;

        // 翻牌时触发更多粒子效果
        createParticles(30, 1.2);
        triggerFlash(0.3);

        // 每张牌翻过后都可以进入老虎机抽奖环节
        canFlip = false;
        setTimeout(function() {
            showPage('page-slot');
            initSlotMachine();
        }, 2000);
    });
});

// ========== 老虎机逻辑 ==========
function initSlotMachine() {
    const reels = document.querySelectorAll('.reel');
    reels.forEach(reel => {
        reel.textContent = '';
        for (var i = 0; i < 6; i++) {
            var symbolEl = document.createElement('div');
            symbolEl.className = 'slot-symbol';
            symbolEl.textContent = symbols[i % symbols.length];
            reel.appendChild(symbolEl);
        }
    });
}

function startSpinning() {
    if (isSpinning) return;
    isSpinning = true;
    var spinBtn = document.getElementById('btn-spin');
    spinBtn.classList.add('spinning');
    spinBtn.textContent = '抽奖中...';
    spinBtn.disabled = true;

    var reels = document.querySelectorAll('.reel');
    slotIntervals = [];

    // 随机选择一个礼物
    currentGift = selectRandomGift();

    reels.forEach(function(reel) {
        var interval = setInterval(function() {
            var currentSymbol = reel.querySelector('.slot-symbol:last-child');
            if (currentSymbol) {
                reel.removeChild(currentSymbol);
            }
            var newSymbol = document.createElement('div');
            newSymbol.className = 'slot-symbol';
            newSymbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            reel.insertBefore(newSymbol, reel.firstChild);
        }, 80 + Math.random() * 40);
        slotIntervals.push(interval);
    });

    // 根据礼物权重决定旋转时长
    var spinDuration = getSpinDuration(currentGift.weight);

    // 自动停止
    var giftWeight = currentGift.weight;
    setTimeout(function() {
        stopSpinning(giftWeight);
    }, spinDuration);
}

function stopSpinning(giftWeight) {
    if (!isSpinning) return;
    isSpinning = false;
    var spinBtn = document.getElementById('btn-spin');
    spinBtn.classList.remove('spinning');
    spinBtn.disabled = true; // 保持禁用，直到显示结果

    slotIntervals.forEach(function(interval) {
        clearInterval(interval);
    });
    slotIntervals = [];

    // 根据权重决定减速动画时长
    var slowDownDelay = 100 + giftWeight * 50;

    var reels = document.querySelectorAll('.reel');
    reels.forEach(function(reel, index) {
        setTimeout(function() {
            var finalSymbol = document.createElement('div');
            finalSymbol.className = 'slot-symbol';
            finalSymbol.textContent = '🎁';
            reel.textContent = '';
            reel.appendChild(finalSymbol);
        }, index * slowDownDelay);
    });

    setTimeout(function() {
        revealGift(giftWeight);
    }, reels.length * slowDownDelay + 200);
}

var spinBtn = document.getElementById('btn-spin');
spinBtn.addEventListener('click', function() {
    if (isSpinning) return;
    startSpinning();
});

// ========== 礼物揭晓 ==========
function revealGift(giftWeight) {
    var giftNameEl = document.getElementById('gift-name');
    var giftMessageEl = document.getElementById('gift-message');

    if (giftNameEl) giftNameEl.textContent = currentGift.name;
    if (giftMessageEl) giftMessageEl.textContent = currentGift.message;

    // 根据权重调整特效强度
    var intensity = getEffectIntensity(giftWeight);

    triggerShake(intensity);
    var particleCount = Math.floor(50 + giftWeight * 30);
    createParticles(particleCount, intensity);
    triggerLightBurst(intensity);
    triggerFlash(intensity);

    setTimeout(function() {
        showPage('page-result');
        // 重置按钮状态
        var spinBtn = document.getElementById('btn-spin');
        spinBtn.textContent = '点击抽奖';
        spinBtn.disabled = false;
    }, 300);
}

// ========== 重玩逻辑 ==========
document.getElementById('btn-replay').addEventListener('click', function() {
    document.querySelectorAll('.card').forEach(function(card) {
        card.classList.remove('flipped');
    });
    flippedCards = 0;
    canFlip = true;
    isFirstDraw = true; // 重置第一次抽奖标记
    createParticles(30);
    showPage('page-cards');
});

// ========== Canvas粒子系统 ==========
var canvas = document.getElementById('particles');
var ctx = canvas.getContext('2d');
var particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ========== 豪华粒子系统 ==========

// 粒子类型配置
const PARTICLE_TYPES = {
    HEART: { symbols: ['💕', '💖', '💗', '💓', '💝', '❤️'], weight: 4 },
    STAR: { symbols: ['⭐', '🌟', '✨', '💫'], weight: 3 },
    GOLD: { symbols: ['🪙', '💛', '🥇', '✨', '🌟'], weight: 2 },
    BURST: { symbols: ['💥', '🔥', '⚡', '🌈', '💫'], weight: 1 }
};

function Particle(x, y, type, intensity) {
    this.x = x;
    this.y = y;

    // 根据类型选择符号
    var typeData = PARTICLE_TYPES[type] || PARTICLE_TYPES.HEART;
    var symbols = typeData.symbols;
    this.symbol = symbols[Math.floor(Math.random() * symbols.length)];

    // 速度 - 根据强度调整
    var baseSpeed = 6 + Math.random() * 10;
    var angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * baseSpeed * intensity;
    this.vy = Math.sin(angle) * baseSpeed * intensity - 4; // 向上偏移

    this.life = 1;
    this.decay = 0.01 + Math.random() * 0.015;
    this.size = (12 + Math.random() * 16) * intensity;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.25;

    // 拖尾效果
    this.trail = [];
    this.maxTrail = 4 + Math.floor(Math.random() * 4);
}

Particle.prototype.update = function() {
    // 保存拖尾位置
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) {
        this.trail.shift();
    }

    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.12; // 重力
    this.vx *= 0.98; // 阻力
    this.life -= this.decay;
    this.rotation += this.rotationSpeed;
};

Particle.prototype.draw = function() {
    var self = this;
    // 绘制拖尾
    this.trail.forEach(function(pos, i) {
        var alpha = (i / self.trail.length) * 0.25 * self.life;
        var size = self.size * (i / self.trail.length) * 0.5;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = size + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(self.symbol, pos.x, pos.y);
        ctx.restore();
    });

    // 绘制主粒子
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.life;
    ctx.font = self.size + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, 0, 0);
    ctx.restore();
};

function createParticles(count, intensity) {
    intensity = intensity || 1;
    var centerX = window.innerWidth / 2;
    var centerY = window.innerHeight / 2;

    for (var i = 0; i < count; i++) {
        // 混合粒子类型 - 50% 爱心, 30% 星星, 15% 金色, 5% 爆发
        var rand = Math.random();
        var type;
        if (rand < 0.5) type = 'HEART';
        else if (rand < 0.8) type = 'STAR';
        else if (rand < 0.95) type = 'GOLD';
        else type = 'BURST';

        // 从中心点发射，带随机偏移
        var offsetX = (Math.random() - 0.5) * 100;
        var offsetY = (Math.random() - 0.5) * 100;
        particles.push(new Particle(centerX + offsetX, centerY + offsetY, type, intensity));
    }
}

function triggerShake(intensity) {
    document.body.classList.add('shake');
    setTimeout(function() {
        document.body.classList.remove('shake');
    }, 500 * intensity);
}

function triggerLightBurst(intensity) {
    intensity = intensity || 1;
    var burstCount = Math.floor(3 + intensity * 4);

    for (var i = 0; i < burstCount; i++) {
        setTimeout(function() {
            createBurstRing(intensity);
            createLightRay(intensity);
        }, i * 60);
    }
}

function createBurstRing(intensity) {
    var ring = document.createElement('div');
    var borderWidth = 3 + intensity * 2;
    var opacity = 0.8 * intensity;
    ring.style.cssText = [
        'position: fixed;',
        'top: 50%;',
        'left: 50%;',
        'width: 30px;',
        'height: 30px;',
        'border: ' + borderWidth + 'px solid rgba(255, 215, 0, ' + opacity + ');',
        'border-radius: 50%;',
        'transform: translate(-50%, -50%) scale(0);',
        'animation: burstRing 0.8s ease-out forwards;',
        'pointer-events: none;',
        'z-index: 1001;'
    ].join('');
    document.body.appendChild(ring);
    setTimeout(function() { ring.remove(); }, 800);
}

function createLightRay(intensity) {
    var ray = document.createElement('div');
    var angle = Math.random() * 360;
    var rayHeight = 2 + intensity * 2;
    var rayOpacity = 0.5 * intensity;
    ray.style.cssText = [
        'position: fixed;',
        'top: 50%;',
        'left: 50%;',
        'width: 150vw;',
        'height: ' + rayHeight + 'px;',
        'background: linear-gradient(90deg, rgba(255, 215, 0, ' + rayOpacity + '), transparent);',
        'transform-origin: 0 50%;',
        'transform: translate(0, -50%) rotate(' + angle + 'deg);',
        'animation: rayFade 0.5s ease-out forwards;',
        'pointer-events: none;',
        'z-index: 1000;'
    ].join('');
    document.body.appendChild(ray);
    setTimeout(function() { ray.remove(); }, 500);
}

function triggerFlash(intensity) {
    var flash = document.querySelector('.flash-overlay');
    if (!flash) {
        flash = document.createElement('div');
        flash.className = 'flash-overlay';
        flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10000;background:white;opacity:0;';
        document.body.appendChild(flash);
    }
    flash.style.opacity = (0.5 * intensity).toString();
    setTimeout(function() {
        flash.style.transition = 'opacity 0.3s';
        flash.style.opacity = '0';
    }, 50);
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(function(p) { return p.life > 0; });
    particles.forEach(function(p) {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();
