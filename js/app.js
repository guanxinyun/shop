/**
 * 《工坊物语：杂货铺掌柜的记账本》
 * 全套交互状态机、Combo 引擎、Canvas 魔法阵入场动画、抽屉模态框与原生音效合成 (App Core)
 */

(function() {
  'use strict';

  // 全局响应状态
  const state = {
    ...window.ATELIER_DATA.initialState,
    currentRecipeId: 'recipe_balm_01',
    activeBranchId: 'civilian',
    activeComboHits: [],
    alchemyClarity: 58,
    currentCustomer: null,
    activeView: 'hub-view',
    inventoryItems: [
      { id: 'inv_1', name: '舒筋止痛草膏 (市井温和派)', type: 'potion', price: 18, tags: ['清甜不苦', '温润留香'], clarity: 84 },
      { id: 'inv_2', name: '轻伤药水 (标准)', type: 'potion', price: 8, tags: ['促愈活性'], clarity: 62 },
      { id: 'inv_3', name: '打磨光亮的古银扣', type: 'relic', price: 55, tags: ['古代避风微刻纹'], clarity: 90 }
    ],
    shippingBin: [], // 专属商会出货箱待售队列，与背包彻底物理分离！
    shelfSlots: [
      { id: 'shelf_1', item: { id: 'shelf_sample_1', name: '舒筋止痛草膏 (市井温和派)', type: 'potion', price: 20, perfectPrice: 22, minPrice: 15, maxPrice: 28 }, listedPrice: 20, lastReaction: 'perfect' },
      { id: 'shelf_2', item: null, listedPrice: 0, lastReaction: null },
      { id: 'shelf_3', item: null, listedPrice: 0, lastReaction: null }
    ],
    priceHistoryBook: {
      '舒筋止痛草膏 (市井温和派)': { perfect: 22, low: 15, high: 28 }
    },
    showcaseItem: null
  };

  // SVG 图标字典 (严禁 Emoji)
  const ICONS = {
    hammer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.5 6.5"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>',
    scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
    droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  };

  // ==========================================================================
  // 原生 Web Audio API 合成音效引擎
  // ==========================================================================
  const AudioEngine = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
    },
    playCoin() {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [1800, 2400].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.15, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    },
    playTap() {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    },
    playOrb() {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    },
    playComboHit(step = 1) {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freqs = [350, 480, 640];
      const f = freqs[Math.min(step - 1, 2)];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    },
    playPerfectCombo() {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.18, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.8);
      });
    },
    playBreak() {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  };

  // 辅助函数：弹出内置通知 (Toast)
  function showToast(title, message, type = 'normal') {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    let iconSvg = ICONS.check;
    if (type === 'error') iconSvg = ICONS.cross;
    if (type === 'warning') iconSvg = ICONS.alert;
    if (type === 'perfect-combo') iconSvg = ICONS.sparkles;

    toast.innerHTML = `
      <div style="width:18px;height:18px;flex-shrink:0;color:currentColor;">${iconSvg}</div>
      <div style="display:flex;flex-direction:column;gap:2px;">
        <strong style="font-size:0.84rem;letter-spacing:0.02em;">${title}</strong>
        <span style="font-size:0.75rem;opacity:0.9;">${message}</span>
      </div>
    `;
    stack.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // 辅助函数：根据总铜币自动严格换算为 铂、金、银、铜 (1铂 = 100金 = 10,000银 = 1,000,000铜)
  function getCoinsFromCopper(totalCopper) {
    const c = Math.max(0, Math.floor(totalCopper));
    const plat = Math.floor(c / 1000000);
    let rem = c % 1000000;
    const gold = Math.floor(rem / 10000);
    rem = rem % 10000;
    const silver = Math.floor(rem / 100);
    const copper = rem % 100;
    return { plat, gold, silver, copper };
  }

  // 辅助函数：更新顶部 HUD (根据总铜币自动计算并显示四级货币，或读取分字段)
  function updateHUD() {
    const platEl = document.getElementById('hud-plat');
    const goldEl = document.getElementById('hud-gold');
    const silverEl = document.getElementById('hud-silver');
    const copperEl = document.getElementById('hud-copper');
    const debtEl = document.getElementById('hud-debt-days');

    // 若存在 totalCopper 则脚本自动全量计算，保证绝对精准自洽
    if (state.totalCopper !== undefined) {
      const parsed = getCoinsFromCopper(state.totalCopper);
      state.coins = parsed;
    }

    if (platEl) platEl.textContent = state.coins.plat !== undefined ? state.coins.plat : 0;
    if (goldEl) goldEl.textContent = state.coins.gold !== undefined ? state.coins.gold : 0;
    if (silverEl) silverEl.textContent = state.coins.silver !== undefined ? state.coins.silver : 0;
    if (copperEl) copperEl.textContent = state.coins.copper !== undefined ? state.coins.copper : 0;
    if (debtEl) debtEl.textContent = `审查：剩 ${state.debt.daysRemaining} 天 (需 ${state.debt.currentDueSilver} 银)`;
  }

  // ==========================================================================
  // 零、Canvas 魔法阵星盘粒子动画 (Cover Entrance Canvas)
  // ==========================================================================
  function initCoverCanvas() {
    const canvas = document.getElementById('magic-circle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    let angle = 0;
    function render() {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // 绘制粒子
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.fill();
      });

      // 绘制旋转多芒星魔法阵轮廓
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      angle += 0.003;

      const radius = Math.min(width, height) * 0.38;

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(198, 156, 88, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.stroke();

      // 8 角星芒连线
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? radius : radius * 0.5;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
      ctx.stroke();

      ctx.restore();

      requestAnimationFrame(render);
    }
    render();

    // 封面解印点击事件：直接无缝切入经典开局负债正式剧情演出！
    const overlay = document.getElementById('cover-entrance-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        AudioEngine.playOrb();
        overlay.classList.add('unsealed');
        setTimeout(() => {
          showOpeningDebtPrologue();
        }, 700);
      });
    }
  }

  // 经典开场剧情：行会执事维斯佩拉登门宣读 300 银币负债契约
  function showOpeningDebtPrologue() {
    AudioEngine.playTap();
    showLLMSensoryModal(
      '【序章：晨雾中的脚步声与 300 银币债务通告】',
      `晨曦初现，细雨微湿了门前石板。铺子门廊上的黄铜风铃发出清脆的急促脆响。\n半精灵女性维斯佩拉身着笔挺深黑行会制服，推开吱呀作响的木门。她推了推金丝圆眼镜，将一份盖有商人行会红火漆印戳的契据啪地按在老橡木柜台上。`,
      `“布兰老爹失踪了，但他留下了 300 枚银币的巨额工坊垫资。第一期 50 银币利息将在 7 天后到期。掌柜先生，清点好你的钱箱（当前仅剩 1铂1金1银1铜）。倘若逾期，铺面钥匙行会必将收回！”\n\n（主线任务已激活：7天内筹集 50 银币保全房契！）`
    );
  }

  // ==========================================================================
  // 跑马灯滚动快讯填充
  // ==========================================================================
  function initMarqueeBar() {
    const track = document.getElementById('marquee-track-content');
    if (!track) return;
    const items = window.ATELIER_DATA.marqueeBroadcasts;
    track.innerHTML = [...items, ...items].map(text => `<span class="marquee-item">${text}</span>`).join('');
  }

  // ==========================================================================
  // 一、柜台前厅逻辑：顾客接见、回声宝珠(免费)、手法检验、出价判定
  // ==========================================================================
  function initCounterView() {
    state.currentCustomer = window.ATELIER_DATA.customers[state.pawnCustomerIndex || 0];
    renderCustomerPanel();
    renderItemExamCard();
    renderMethodsGrid();
    renderJournalClues();
    setupCounterEvents();
  }

  function renderCustomerPanel() {
    const cust = state.currentCustomer;
    if (!cust) return;

    const nameEl = document.getElementById('customer-name');
    const titleEl = document.getElementById('customer-title');
    const tagEl = document.getElementById('customer-archetype-tag');
    const speechEl = document.getElementById('customer-speech-text');
    const pipsEl = document.getElementById('patience-pips-container');
    const countEl = document.getElementById('patience-count-text');

    if (nameEl) nameEl.textContent = cust.name;
    if (titleEl) titleEl.textContent = cust.title;
    if (tagEl) tagEl.textContent = cust.archetype;
    if (speechEl) speechEl.textContent = `“${cust.speech}”`;
    if (countEl) countEl.textContent = `${cust.patience} / ${cust.maxPatience}`;

    if (pipsEl) {
      pipsEl.innerHTML = '';
      for (let i = 0; i < cust.maxPatience; i++) {
        const pip = document.createElement('div');
        pip.className = `patience-pip ${i < cust.patience ? 'filled' : ''}`;
        pipsEl.appendChild(pip);
      }
    }
  }

  function renderItemExamCard() {
    const cust = state.currentCustomer;
    if (!cust) return;
    const item = cust.targetItem;

    const titleEl = document.getElementById('item-name-heading');
    const catEl = document.getElementById('item-category-label');
    const priceEl = document.getElementById('item-declared-price-val');
    const descEl = document.getElementById('item-symptom-desc');
    const echoEl = document.getElementById('echo-hidden-count');
    const tagsContainer = document.getElementById('item-tags-flow');
    const buyPriceVal = document.getElementById('btn-buy-price-val');

    if (titleEl) titleEl.textContent = item.name;
    if (catEl) {
      catEl.textContent = item.tierLabel ? `${item.tierLabel} · ${item.category}` : item.category;
    }
    if (priceEl) priceEl.textContent = `${item.declaredPriceSilver} 银币`;
    if (descEl) descEl.textContent = item.symptomText;

    // 计算当前公道收购价
    let calculatedFair = item.basePriceSilver;
    item.tags.forEach(t => {
      if (t.revealed) calculatedFair += item.basePriceSilver * t.mod;
    });
    const fairBuyPrice = Math.max(2, Math.round(calculatedFair * 0.85));
    if (buyPriceVal) buyPriceVal.textContent = fairBuyPrice;

    const unrevealed = item.tags.filter(t => !t.revealed).length;
    if (echoEl) echoEl.textContent = unrevealed;

    if (tagsContainer) {
      tagsContainer.innerHTML = '';
      item.tags.forEach(tag => {
        const span = document.createElement('span');
        if (tag.revealed) {
          span.className = `tag-badge revealed ${tag.type || ''}`;
          span.innerHTML = `${ICONS.check} ${tag.name} (${tag.mod > 0 ? '+' : ''}${Math.round(tag.mod * 100)}%)`;
        } else {
          span.className = 'tag-badge hidden-slot';
          span.textContent = '［??? 隐实质地 需检验］';
        }
        tagsContainer.appendChild(span);
      });
    }
  }

  function renderMethodsGrid() {
    const container = document.getElementById('methods-button-grid');
    if (!container) return;
    container.innerHTML = '';

    window.ATELIER_DATA.workshopMethods.forEach(method => {
      const btn = document.createElement('button');
      btn.className = 'method-btn';
      btn.id = `btn-method-${method.id}`;
      btn.title = method.desc;
      btn.innerHTML = `
        ${ICONS[method.icon] || ICONS.search}
        <span>${method.name}</span>
      `;
      btn.addEventListener('click', () => executeInspection(method));
      container.appendChild(btn);
    });
  }

  function renderJournalClues() {
    const list = document.getElementById('journal-clues-list');
    if (!list) return;
    list.innerHTML = '';

    const cust = state.currentCustomer;
    if (!cust || !cust.targetItem.journalEntries) return;

    cust.targetItem.journalEntries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'journal-clue-item';
      card.innerHTML = `
        <strong style="color:#7d5939;font-size:0.8rem;">${entry.title}</strong>
        <p style="margin-top:3px;white-space:pre-line;">${entry.text}</p>
      `;
      card.addEventListener('click', () => {
        AudioEngine.playTap();
        showToast('记事簿翻阅', '比对当前表征，留意修饰词的微妙出入！', 'normal');
      });
      list.appendChild(card);
    });
  }

  function executeInspection(method) {
    const cust = state.currentCustomer;
    if (!cust || cust.patience <= 0) {
      showToast('顾客已离店', '顾客的耐心已耗尽，不愿再配合检验！', 'error');
      return;
    }

    cust.patience--;
    renderCustomerPanel();
    AudioEngine.playTap();

    const item = cust.targetItem;
    const matchedTag = item.tags.find(t => !t.revealed && t.validMethod === method.id);

    if (matchedTag) {
      matchedTag.revealed = true;
      renderItemExamCard();
      AudioEngine.playOrb();
      showLLMSensoryModal(
        `手法实操：【${method.name}】命中破绽！`,
        matchedTag.hint || `你稳稳施展了${method.name}，微观表征浮出水面。`,
        `发现特质：【${matchedTag.name}】！顾客的眼神游移了一下，把放在柜台边的手指往后缩了半寸。`
      );
      showToast('检验突破', `成功看破特性：【${matchedTag.name}】！`, 'success');
    } else {
      showLLMSensoryModal(
        `手法实操：【${method.name}】未见明显异常`,
        `你取来工具对着货物施展了${method.name}，器物表面纹丝不动，并未显现出该项物理手法的对应反响。`,
        `顾客有些不耐烦地敲了敲木柜台：“掌柜的，看好了没？我的货还能有假不成？”`
      );
      showToast('未获线索', `未能通过【${method.name}】探得深层特质，消耗了1点耐心。`, 'warning');
    }
  }

  function setupCounterEvents() {
    const quickBuyBtn = document.getElementById('btn-quick-buy-item');
    const passBtn = document.getElementById('btn-pass-customer');
    const readBookBtn = document.getElementById('btn-read-journal-action');
    const viewCustBtn = document.getElementById('btn-view-customer-profile');
    const openStockBtn = document.getElementById('btn-open-shelf-stock');

    if (quickBuyBtn) {
      quickBuyBtn.addEventListener('click', () => {
        executeQuickBuy();
      });
    }

    if (openStockBtn) {
      openStockBtn.addEventListener('click', () => {
        openShelfStockPicker();
      });
    }

    if (passBtn) {
      passBtn.addEventListener('click', () => {
        showToast('婉拒来客', '您客气地送别了这位顾客，整理了一下凌乱的柜台。', 'normal');
        cycleNextCustomer();
      });
    }

    if (readBookBtn) {
      readBookBtn.addEventListener('click', () => {
        if (state.currentCustomer && state.currentCustomer.patience > 0) {
          state.currentCustomer.patience--;
          renderCustomerPanel();
          AudioEngine.playTap();
          showToast('翻阅老手札', '消耗 1 点耐心，工坊记事簿中有关此物表征的条目已高亮！', 'normal');
        } else {
          showToast('耐心不足', '顾客催促着你，已经容不得你慢吞吞翻书了！', 'warning');
        }
      });
    }

    if (viewCustBtn) {
      viewCustBtn.addEventListener('click', () => {
        openModal('modal-characters-dossier');
      });
    }

    renderMoonlighterShelf();
  }

  function executeQuickBuy() {
    const cust = state.currentCustomer;
    if (!cust) return;
    const item = cust.targetItem;

    let calculatedFair = item.basePriceSilver;
    item.tags.forEach(t => {
      if (t.revealed) calculatedFair += item.basePriceSilver * t.mod;
    });
    const fairBuyPrice = Math.max(2, Math.round(calculatedFair * 0.85));

    if (state.coins.silver < fairBuyPrice) {
      showToast('现钱不足', `钱箱现银不够支付 ${fairBuyPrice} 银币收购款！`, 'error');
      return;
    }

    state.coins.silver -= fairBuyPrice;
    AudioEngine.playCoin();
    updateHUD();

    state.inventoryItems.push({
      id: `purchased_${Date.now()}`,
      name: item.name,
      type: 'material',
      price: Math.round(calculatedFair * 1.3),
      tier: item.tier || 2,
      tierLabel: item.tierLabel || 'T2 熟工通货',
      tags: item.tags.filter(t => t.revealed).map(t => t.name),
      clarity: 70
    });
    renderCauldronMaterialsPicker();
    renderShippingBinView();
    renderMoonlighterShelf();

    showLLMSensoryModal(
      '典当成交！货款两讫',
      `你递过 ${fairBuyPrice} 枚银币。对方查验过成色，利落收起钱袋：“痛快！掌柜是个懂行的实诚人，这件货归你了，回见！”`,
      `【${item.name}】已收入背包仓库。您可随时将其摆上货架自定标价展售，或投入后院坩埚炼药！`
    );
    showToast('收购成功', `以公道价 ${fairBuyPrice} 银币收下【${item.name}】！`, 'success');
    cycleNextCustomer();
  }

  // ==========================================================================
  // 夜勤人式货架自由标价与 4 级表情反馈系统 (Moonlighter Shelf Engine)
  // ==========================================================================
  function renderMoonlighterShelf() {
    const container = document.getElementById('moonlighter-shelf-slots');
    if (!container) return;
    container.innerHTML = '';

    state.shelfSlots.forEach((slot, index) => {
      const row = document.createElement('div');
      row.style.cssText = 'background:#1a130e;border:1px solid rgba(198,156,88,0.3);border-radius:6px;padding:8px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;';

      if (slot.item) {
        let emotionBadge = '';
        if (slot.lastReaction === 'angry') {
          emotionBadge = '<span style="font-size:1.15rem;" title="嫌太贵了！顾客大怒走人">😱 嫌贵</span>';
        } else if (slot.lastReaction === 'reluctant') {
          emotionBadge = '<span style="font-size:1.15rem;" title="稍微偏贵，勉强接受">😕 偏贵</span>';
        } else if (slot.lastReaction === 'perfect') {
          emotionBadge = '<span style="font-size:1.15rem;" title="完美公道价！顾客极其满意">😊 完美</span>';
        } else if (slot.lastReaction === 'cheap') {
          emotionBadge = '<span style="font-size:1.15rem;" title="太便宜了！像白捡一样">🤩 捡漏</span>';
        }

        row.innerHTML = `
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:6px;">
              <strong style="font-size:0.8rem;color:#ffd875;">${slot.item.name}</strong>
              ${emotionBadge}
            </div>
            <div style="font-size:0.68rem;color:var(--text-dim);margin-top:2px;">
              基准成本：${slot.item.price} 银 · 当前标价：<span style="color:#ffd875;font-weight:700;">${slot.listedPrice}</span> 银
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <input type="number" min="1" max="999" value="${slot.listedPrice}" id="shelf-input-price-${slot.id}" style="width:50px;background:#130d09;border:1px solid var(--border-gold-dark);color:#ffd875;font-family:var(--font-sans);font-weight:700;font-size:0.85rem;padding:3px;border-radius:4px;text-align:right;">
            <button class="btn-gold" style="width:auto;padding:3px 8px;font-size:0.72rem;" id="btn-shelf-adjust-${slot.id}">
              调价
            </button>
            <button class="btn-secondary" style="width:auto;padding:3px 6px;font-size:0.72rem;margin:0;" id="btn-shelf-remove-${slot.id}">
              下架
            </button>
          </div>
        `;

        const adjustBtn = row.querySelector(`#btn-shelf-adjust-${slot.id}`);
        const removeBtn = row.querySelector(`#btn-shelf-remove-${slot.id}`);
        const priceInput = row.querySelector(`#shelf-input-price-${slot.id}`);

        if (adjustBtn && priceInput) {
          adjustBtn.addEventListener('click', () => {
            const newP = parseInt(priceInput.value, 10);
            if (isNaN(newP) || newP <= 0) return;
            slot.listedPrice = newP;
            // 顾客看货测试反应
            testCustomerReaction(slot);
          });
        }

        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            state.inventoryItems.push(slot.item);
            slot.item = null;
            slot.listedPrice = 0;
            slot.lastReaction = null;
            AudioEngine.playTap();
            showToast('已撤下货架', '商品已取回背包仓库。', 'normal');
            renderMoonlighterShelf();
            renderCauldronMaterialsPicker();
          });
        }
      } else {
        row.innerHTML = `
          <div style="color:var(--text-dim);font-size:0.75rem;">
            展架位 #${index + 1} · ［空位待上架］
          </div>
          <button class="btn-secondary" style="width:auto;padding:3px 10px;font-size:0.72rem;margin:0;" id="btn-shelf-add-${slot.id}">
            + 放置
          </button>
        `;
        const addBtn = row.querySelector(`#btn-shelf-add-${slot.id}`);
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            openShelfStockPicker(slot);
          });
        }
      }
      container.appendChild(row);
    });
  }

  function testCustomerReaction(slot) {
    if (!slot.item) return;
    const p = slot.listedPrice;
    const perfect = slot.item.perfectPrice || Math.round(slot.item.price * 1.25);
    const min = slot.item.minPrice || Math.round(perfect * 0.7);
    const max = slot.item.maxPrice || Math.round(perfect * 1.35);

    if (p < min) {
      slot.lastReaction = 'cheap';
      AudioEngine.playCoin();
      showToast('🤩 顾客狂喜捡漏！', `顾客像白捡一样飞速掏钱买走了【${slot.item.name}】！你标价太低，亏大了！`, 'warning');
      sellShelfItem(slot);
    } else if (p > max) {
      slot.lastReaction = 'angry';
      AudioEngine.playBreak();
      showToast('😱 顾客大怒嫌贵！', `顾客看了一眼标价 ${p} 银币，骂骂咧咧摔下商品走人！`, 'error');
      renderMoonlighterShelf();
    } else if (p >= perfect - 2 && p <= perfect + 2) {
      slot.lastReaction = 'perfect';
      AudioEngine.playPerfectCombo();
      showToast('😊 完美公道价达成！', `顾客极其满意地以 ${p} 银币全款买下【${slot.item.name}】！最佳物价带已记录！`, 'perfect-combo');
      sellShelfItem(slot);
    } else {
      slot.lastReaction = 'reluctant';
      AudioEngine.playCoin();
      showToast('😕 顾客犹豫买下', `价格微高，顾客犹豫片刻后勉强付款 ${p} 银币带走了商品。`, 'normal');
      sellShelfItem(slot);
    }
  }

  function sellShelfItem(slot) {
    state.coins.silver += slot.listedPrice;
    updateHUD();
    slot.item = null;
    slot.listedPrice = 0;
    setTimeout(() => {
      renderMoonlighterShelf();
    }, 600);
  }

  function openShelfStockPicker(targetSlot = null) {
    if (state.inventoryItems.length === 0) {
      showToast('背包空空', '仓库中暂无成药或宝物可上架，快去后院熬药或柜台收购吧！', 'warning');
      return;
    }

    const availableSlot = targetSlot || state.shelfSlots.find(s => !s.item);
    if (!availableSlot) {
      showToast('展位已满', '柜台货架位已放满，请调价促成交易或撤下商品！', 'warning');
      return;
    }

    // 从背包挑选一件上架
    const item = state.inventoryItems.shift();
    availableSlot.item = item;
    availableSlot.listedPrice = Math.round(item.price * 1.25);
    availableSlot.lastReaction = null;

    AudioEngine.playTap();
    showToast('商品已上架', `【${item.name}】已摆上展台，初始建议标价 ${availableSlot.listedPrice} 银币！`, 'success');
    renderMoonlighterShelf();
    renderCauldronMaterialsPicker();
  }

  // ==========================================================================
  // 程序化无限货物与顾客动态生成引擎 (Procedural Generator)
  // ==========================================================================
  function generateRandomCustomerAndItem() {
    const archetypes = [
      { name: '布莱克', title: '巡林猎兵', archetype: '退伍老兵 · 务实干练', speech: '打猎换下来的旧家伙，掌柜给个实在数，够买两瓶烈酒和防冻油就行。', patience: 4 },
      { name: '艾莉亚', title: '学者学徒', archetype: '魔法学徒 · 窘迫青涩', speech: '导、导师让我出来变卖一些试做构件换取羊皮纸经费，请您千万别压价太狠呀……', patience: 3 },
      { name: '加文', title: '商队护卫长', archetype: '远行客商 · 眼神老辣', speech: '刚翻过黑石隘口，路上捡着件硬货。掌柜的你要是识货，以后商队的货优先送你店里。', patience: 4 },
      { name: '西比尔', title: '庄园女仆长', archetype: '名门女仆 · 严苛细致', speech: '夫人吩咐清理库房旧器，这件饰物虽然有些岁月，但绝非市井破烂，掌柜请过目。', patience: 3 },
      { name: '洛克', title: '矿山石匠', archetype: '粗豪矮人 · 直来直去', speech: '矿道深处挖出的怪矿石，沉得跟铅块似的，老汉斯说他不要，你这里收不收？', patience: 4 }
    ];

    const itemBases = [
      { name: '附带温热的伴生矿石', cat: '矿石与贵金', tier: 2, itemType: 'material', methods: ['acoustic_tap', 'gentle_heat'] },
      { name: '风干多年的异兽韧角', cat: '兽骨与毛羽', tier: 3, itemType: 'material', methods: ['torsion_flex', 'lamp_inspect'] },
      { name: '褪色的古代学徒抄本', cat: '纸帛与古卷', tier: 3, itemType: 'relic', methods: ['lamp_inspect', 'fingertip_trace'] },
      { name: '雕有飞鸟纹的黄铜怀表', cat: '器皿与用具', tier: 4, itemType: 'gear', methods: ['lens_inspect', 'acoustic_tap'] },
      { name: '生有淡蓝绒毛的阴生块茎', cat: '草药与生息', tier: 1, itemType: 'material', methods: ['drop_reagent', 'gentle_heat'] },
      { name: '深渊黑曜微晶晶簇', cat: '矿石与贵金', tier: 5, itemType: 'material', methods: ['lamp_inspect', 'mana_pulse'] }
    ];

    const traitsPool = [
      { name: '内部冷隔暗伤', mod: -0.35, type: 'negative', validMethod: 'acoustic_tap', hint: '骨锤轻敲中段，回声啪的一声发哑短促，内里有断层！' },
      { name: '深层宿存温热', mod: +0.40, type: 'positive', validMethod: 'gentle_heat', hint: '微火烘烤边缘，隐隐透出一股微香热气，纯度极高！' },
      { name: '古代隐性避尘回路', mod: +0.60, type: 'rare', validMethod: 'lamp_inspect', hint: '聚光灯切入反光，底座内圈浮现出旧工坊避尘刻印！' },
      { name: '内部细微磨损滑牙', mod: -0.25, type: 'negative', validMethod: 'lens_inspect', hint: '双重放大镜细查，齿轮咬合间已磨损大半，受力易滑！' },
      { name: '活性草露未褪', mod: +0.30, type: 'positive', validMethod: 'drop_reagent', hint: '刮粉滴入工坊试剂，试剂呈澄澈翡翠色，药性鲜活！' }
    ];

    const chosenArch = archetypes[Math.floor(Math.random() * archetypes.length)];
    const chosenBase = itemBases[Math.floor(Math.random() * itemBases.length)];
    const chosenTrait = traitsPool[Math.floor(Math.random() * traitsPool.length)];

    // 核心重构：AI/生成器只出等级(tier)与类型，价格全由前端脚本根据官方区间计算！
    const tierConfig = window.ATELIER_DATA.tierPriceGuide[chosenBase.itemType === 'potion' ? 'potion' : 'material'][chosenBase.tier];
    const scriptBasePrice = Math.floor(Math.random() * (tierConfig.max - tierConfig.min + 1)) + tierConfig.min;
    const finalFairPrice = Math.max(1, Math.round(scriptBasePrice * (1 + chosenTrait.mod - 0.05)));
    const declaredPrice = Math.round(finalFairPrice * (1.3 + Math.random() * 0.3));

    return {
      id: `dynamic_cust_${Date.now()}`,
      name: chosenArch.name,
      title: chosenArch.title,
      archetype: chosenArch.archetype,
      speech: chosenArch.speech,
      patience: chosenArch.patience,
      maxPatience: chosenArch.patience,
      targetItem: {
        id: `dynamic_item_${Date.now()}`,
        name: chosenBase.name,
        category: chosenBase.cat,
        tier: chosenBase.tier,
        tierLabel: tierConfig.label,
        declaredPriceSilver: declaredPrice,
        basePriceSilver: finalFairPrice,
        scriptBasePrice: scriptBasePrice,
        symptomText: `物件表面带有风尘沉淀的包浆，光泽微暗；在油灯逆光平视时，纹理起伏间偶见细微的断续光斑，手感略有些沉滞。`,
        hiddenTotalCount: 2,
        tags: [
          { id: 'dt_0', name: '岁月风尘留痕', level: 0, revealed: true, mod: -0.05, type: 'neutral' },
          { id: 'dt_1', name: chosenTrait.name, level: chosenBase.tier >= 4 ? 4 : 3, revealed: false, validMethod: chosenTrait.validMethod, mod: chosenTrait.mod, type: chosenTrait.type, hint: chosenTrait.hint }
        ],
        journalEntries: [
          {
            isCorrect: true,
            title: `《物性杂篇·${chosenTrait.name}辨识》`,
            text: `此物若见光泽断续跳跃，重心略滞，多对应【${chosenTrait.name}】之相。\n推荐手法：【${window.ATELIER_DATA.workshopMethods.find(m => m.id === chosenTrait.validMethod).name}】。`
          },
          {
            isCorrect: false,
            title: `《伪记杂抄·表面受潮条》`,
            text: `若表面暗淡，多为库房受潮生霉，切莫误判为内伤。\n推荐手法：【微火微温】。`
          }
        ]
      }
    };
  }

  function cycleNextCustomer() {
    // 优先从预设池轮转，结束后无缝衔接程序化无限生成
    state.pawnCustomerIndex = (state.pawnCustomerIndex + 1);
    if (state.pawnCustomerIndex < window.ATELIER_DATA.customers.length) {
      state.currentCustomer = JSON.parse(JSON.stringify(window.ATELIER_DATA.customers[state.pawnCustomerIndex]));
    } else {
      state.currentCustomer = generateRandomCustomerAndItem();
    }
    renderCustomerPanel();
    renderItemExamCard();
    renderJournalClues();
  }

  // ==========================================================================
  // 二、后院炼金工坊：5 种加工方式打 3-Hit Combo 与真实选料消耗
  // ==========================================================================
  function initAlchemyView() {
    renderRecipeCardsList();
    renderCauldronMaterialsPicker();
    renderFiveMethodsButtons();
    renderComboSlots();
    renderCurrentRecipeBranchDetails();
    setupAlchemyEvents();
  }

  function renderCauldronMaterialsPicker() {
    const picker = document.getElementById('cauldron-materials-picker');
    const countLabel = document.getElementById('cauldron-loaded-mats-count');
    if (!picker) return;
    picker.innerHTML = '';

    // 筛选背包中可用于投入坩埚的素材或草药
    const materials = state.inventoryItems.filter(item => item.type === 'material' || item.type === 'herb');

    if (materials.length === 0) {
      picker.innerHTML = `
        <div style="font-size:0.75rem;color:var(--text-dim);padding:4px 8px;">
          暂无可用原料。可从柜台向猎户收购，或前往【商会订购】预定原料！
        </div>
      `;
      if (countLabel) countLabel.textContent = '使用工坊常备底水';
      return;
    }

    if (countLabel) countLabel.textContent = `背包可用素材：${materials.length} 份 (点击投入)`;

    materials.forEach((mat, idx) => {
      const chip = document.createElement('div');
      chip.style.cssText = 'background:#241a12;border:1px solid var(--border-gold);border-radius:6px;padding:4px 10px;font-size:0.75rem;color:#f3e5d0;white-space:nowrap;cursor:pointer;display:flex;align-items:center;gap:6px;';
      chip.innerHTML = `
        <span>🍃 ${mat.name}</span>
        <span style="color:#ffd875;font-size:0.7rem;">(投入)</span>
      `;
      chip.addEventListener('click', () => {
        // 记录原料携带的高阶标签（Lv4+ 绝造词缀）
        const highTierTags = (mat.tags || []).filter(t => {
          return t.includes('古代') || t.includes('雷') || t.includes('极寒') || t.includes('自锁') || t.includes('神髓') || t.includes('绝');
        });
        if (highTierTags.length > 0) {
          state.cauldronInheritedTags = state.cauldronInheritedTags || [];
          state.cauldronInheritedTags.push(...highTierTags);
          showToast('绝造特性融入', `原料的 Lv.4+ 珍奇特性【${highTierTags.join('、')}】已融入药汤底质！`, 'perfect-combo');
        }

        // 从背包中消耗该材料
        state.inventoryItems.splice(idx, 1);
        AudioEngine.playOrb();
        state.alchemyClarity = Math.min(100, state.alchemyClarity + 10);
        updateClarityGauge(state.alchemyClarity);
        showToast('原料已入鼎', `将【${mat.name}】投入坩埚，药汤泛起醇厚香气！`, 'success');
        renderCauldronMaterialsPicker();
        renderShippingBinView();
      });
      picker.appendChild(chip);
    });
  }

  function renderRecipeCardsList() {
    const list = document.getElementById('recipe-catalog-list');
    if (!list) return;
    list.innerHTML = '';

    window.ATELIER_DATA.recipes.forEach(recipe => {
      const card = document.createElement('div');
      card.className = `recipe-card-item ${recipe.id === state.currentRecipeId ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="recipe-card-title">
          <span>${recipe.name}</span>
          <span class="recipe-card-tier">${recipe.tier}</span>
        </div>
        <p style="font-size:0.75rem;color:var(--text-dim);margin:3px 0;">${recipe.desc}</p>
        <div class="recipe-branches-pillbox">
          ${recipe.branches.map(b => `<span class="branch-chip ${b.unlocked ? 'unlocked' : ''}">${b.name}</span>`).join('')}
        </div>
      `;
      card.addEventListener('click', () => {
        state.currentRecipeId = recipe.id;
        state.activeComboHits = [];
        state.alchemyClarity = 55;
        renderRecipeCardsList();
        renderCurrentRecipeBranchDetails();
        renderComboSlots();
        updateClarityGauge(state.alchemyClarity);
      });
      list.appendChild(card);
    });
  }

  function renderFiveMethodsButtons() {
    const container = document.getElementById('five-methods-container');
    if (!container) return;
    container.innerHTML = '';

    window.ATELIER_DATA.alchemyMethods.forEach(method => {
      const btn = document.createElement('button');
      btn.className = 'combo-method-btn';
      btn.id = `btn-alchemy-action-${method.id}`;
      btn.innerHTML = `
        <span class="combo-method-name">【${method.name}】</span>
        <span class="combo-method-desc">${method.desc}</span>
      `;
      btn.addEventListener('click', () => pushComboHit(method));
      container.appendChild(btn);
    });
  }

  function renderComboSlots() {
    const slot1 = document.getElementById('combo-slot-1');
    const slot2 = document.getElementById('combo-slot-2');
    const slot3 = document.getElementById('combo-slot-3');
    const statusText = document.getElementById('combo-flow-status');

    const slots = [slot1, slot2, slot3];
    slots.forEach((el, index) => {
      if (!el) return;
      const hit = state.activeComboHits[index];
      if (hit) {
        el.className = 'combo-slot-card filled';
        el.innerHTML = `
          <span class="combo-slot-number">#${index + 1}</span>
          <strong style="font-size:0.88rem;color:#ffd875;">【${hit.name}】</strong>
          <span style="font-size:0.65rem;color:#ded1c1;">${hit.desc.split('，')[0]}</span>
        `;
      } else {
        el.className = 'combo-slot-card';
        el.innerHTML = `
          <span class="combo-slot-number">#${index + 1}</span>
          <span>待出招...</span>
        `;
      }
    });

    if (statusText) {
      if (state.activeComboHits.length === 0) {
        statusText.textContent = '开锅待命 · 投料已就绪';
      } else if (state.activeComboHits.length === 3) {
        statusText.textContent = '3 连击连招已闭环！可揭盖收瓶';
      } else {
        statusText.textContent = `连携节拍中：第 ${state.activeComboHits.length + 1} 拍...`;
      }
    }
  }

  function pushComboHit(method) {
    if (state.activeComboHits.length >= 3) {
      showToast('连招已满', '已打满 3 拍工序，请点击【揭盖收瓶判定】！', 'warning');
      return;
    }

    state.activeComboHits.push(method);
    renderComboSlots();
    AudioEngine.playComboHit(state.activeComboHits.length);

    if (method.effect.clarity) {
      state.alchemyClarity = Math.min(100, Math.max(10, state.alchemyClarity + method.effect.clarity));
      updateClarityGauge(state.alchemyClarity);
    }

    if (state.activeComboHits.length >= 2) {
      const prev = state.activeComboHits[state.activeComboHits.length - 2];
      if (prev.id === 'boil' && method.id === 'filter') {
        state.alchemyClarity = Math.max(10, state.alchemyClarity - 25);
        updateClarityGauge(state.alchemyClarity);
        AudioEngine.playBreak();
        showToast('COMBO BREAK！', '猛火急沸后立刻粗暴析滤，滚水冲破了滤网，残渣激荡！', 'error');
        return;
      }
    }

    showToast('工法注入', `施展【${method.name}】，药汤泛起动态回响！`, 'normal');
  }

  function renderCurrentRecipeBranchDetails() {
    const recipe = window.ATELIER_DATA.recipes.find(r => r.id === state.currentRecipeId);
    if (!recipe) return;

    const navContainer = document.getElementById('branch-nav-tabs-bar');
    const descContainer = document.getElementById('branch-detail-display');
    if (!navContainer || !descContainer) return;

    navContainer.innerHTML = '';
    recipe.branches.forEach(branch => {
      const btn = document.createElement('button');
      btn.className = `branch-tab-btn ${branch.branchId === state.activeBranchId ? 'active' : ''}`;
      btn.textContent = branch.name;
      btn.addEventListener('click', () => {
        state.activeBranchId = branch.branchId;
        renderCurrentRecipeBranchDetails();
      });
      navContainer.appendChild(btn);
    });

    const activeBranch = recipe.branches.find(b => b.branchId === state.activeBranchId) || recipe.branches[0];
    descContainer.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <strong style="color:#ffd875;font-size:0.88rem;">${activeBranch.name}</strong>
        <span style="font-size:0.7rem;color:${activeBranch.unlocked ? '#9fe2bf' : '#feb2b2'};">
          ${activeBranch.unlocked ? '手札已永久记录' : '工艺残缺 · 需摸索'}
        </span>
      </div>
      <p style="color:#ded0be;font-size:0.78rem;line-height:1.5;">${activeBranch.tip}</p>
      <div class="branch-target-buyer">
        🎯 核心买家：${activeBranch.audience}
      </div>
      <div style="margin-top:6px;display:flex;gap:5px;flex-wrap:wrap;">
        ${activeBranch.bonusTags.map(t => `<span class="tag-badge revealed rare" style="font-size:0.7rem;padding:2px 6px;">★ ${t}</span>`).join('')}
      </div>
      ${activeBranch.unlocked ? `
        <button id="btn-quick-auto-combo" class="btn-secondary" style="margin-top:8px;font-size:0.75rem;">
          依手札一键录入 3 连招
        </button>
      ` : ''}
    `;

    const quickBtn = document.getElementById('btn-quick-auto-combo');
    if (quickBtn) {
      quickBtn.addEventListener('click', () => {
        state.activeComboHits = activeBranch.combo.map(id => window.ATELIER_DATA.alchemyMethods.find(m => m.id === id));
        renderComboSlots();
        AudioEngine.playOrb();
        showToast('依方施术', `已将【${activeBranch.name}】的三连连招载入工序槽！`, 'normal');
      });
    }
  }

  function updateClarityGauge(val) {
    const fill = document.getElementById('clarity-progress-bar');
    const text = document.getElementById('clarity-numeric-value');
    if (fill) fill.style.width = `${val}%`;
    if (text) text.textContent = `${val} / 100`;
  }

  function setupAlchemyEvents() {
    const finishBtn = document.getElementById('btn-finish-cauldron');
    const resetBtn = document.getElementById('btn-reset-cauldron');

    if (finishBtn) finishBtn.addEventListener('click', finalizeBrewing);
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.activeComboHits = [];
        state.alchemyClarity = 50 + Math.floor(Math.random() * 20);
        renderComboSlots();
        updateClarityGauge(state.alchemyClarity);
        AudioEngine.playTap();
        showToast('重置工序', '已清空当前坩埚反应，重新投料。', 'normal');
      });
    }
  }

  function finalizeBrewing() {
    if (state.activeComboHits.length < 3) {
      showToast('工序未满', '必须打满 3 拍连招才能揭盖收瓶！', 'warning');
      return;
    }

    const recipe = window.ATELIER_DATA.recipes.find(r => r.id === state.currentRecipeId);
    if (!recipe) return;

    const currentSequence = state.activeComboHits.map(h => h.id).join(',');
    const matchedBranch = recipe.branches.find(b => b.combo.join(',') === currentSequence);

    if (matchedBranch) {
      state.alchemyClarity = Math.min(100, state.alchemyClarity + 30);
      updateClarityGauge(state.alchemyClarity);
      AudioEngine.playPerfectCombo();

      if (!matchedBranch.unlocked) {
        matchedBranch.unlocked = true;
        renderRecipeCardsList();
        renderCurrentRecipeBranchDetails();
        showToast('手札神髓补全！', `你在配方空白处用炭铅笔写下连招，永久解锁【${matchedBranch.name}】！`, 'perfect-combo');
      }

      const inherited = state.cauldronInheritedTags || [];
      state.cauldronInheritedTags = []; // 消费清空

      // 根据配方阶位(Tier)动态由脚本计算成药价格，绝不死板写死！
      const tierIndex = recipe.tier.includes('见习') ? 1 : 2;
      const potionTierCfg = window.ATELIER_DATA.tierPriceGuide.potion[tierIndex];
      const scriptBase = Math.floor(Math.random() * (potionTierCfg.max - potionTierCfg.min + 1)) + potionTierCfg.min;
      const finalPrice = scriptBase + 12 + (inherited.length * 15);

      const potionName = `${recipe.name} (${matchedBranch.name})`;
      state.inventoryItems.push({
        id: `potion_${Date.now()}`,
        name: potionName,
        type: 'potion',
        price: finalPrice,
        tier: tierIndex,
        tags: [...new Set([...matchedBranch.bonusTags, ...inherited])],
        clarity: state.alchemyClarity
      });

      showLLMSensoryModal(
        'PERFECT COMBO！名匠成药',
        `三道工序丝丝入扣！药汤泛起宝石般的通透光泽，水汽如兰似蜜，彻底消融了草木的辛涩恶相。`,
        `成药评级：【完美无瑕】！成功赋予专属词缀：【${matchedBranch.bonusTags.join('】与【')}】！此药已被送入货柜，深受【${matchedBranch.audience}】追捧。`
      );
    } else {
      state.alchemyClarity = Math.min(100, state.alchemyClarity + 12);
      updateClarityGauge(state.alchemyClarity);
      AudioEngine.playTap();

      const potionName = `${recipe.name} (标准良品)`;
      state.inventoryItems.push({
        id: `potion_${Date.now()}`,
        name: potionName,
        type: 'potion',
        price: 12,
        tags: ['清血驱毒'],
        clarity: state.alchemyClarity
      });

      showLLMSensoryModal(
        '调和完成：标准良药出炉',
        `三拍连击虽未完全暗合古法绝学，但气韵平顺。成药色泽温润，药香纯正，已具备标准市井功效。`,
        `成药评级：【良品】。已入库备售或供商会统购出货。`
      );
      showToast('调和完成', '熬制出一瓶标准品质药剂。', 'success');
    }

    state.activeComboHits = [];
    state.alchemyClarity = 50 + Math.floor(Math.random() * 20);
    renderComboSlots();
    updateClarityGauge(state.alchemyClarity);
    renderCauldronMaterialsPicker();
    renderShippingBinView();
  }

  // ==========================================================================
  // 三、小镇布告栏逻辑：星露谷式便条接单与交付
  // ==========================================================================
  function initNoticeBoardView() {
    const container = document.getElementById('notice-board-pins-list');
    if (!container) return;
    container.innerHTML = '';

    window.ATELIER_DATA.noticeQuests.forEach(quest => {
      const card = document.createElement('div');
      card.className = 'quest-note-card';
      card.id = `quest-card-${quest.id}`;

      let heartStr = '';
      for (let i = 0; i < 5; i++) {
        heartStr += i < quest.clientHearts ? '♥ ' : '♡ ';
      }

      card.innerHTML = `
        <div class="brass-pushpin"></div>
        <div class="quest-client-row">
          <strong style="color:#2a1c12;font-size:0.86rem;">${quest.clientName}</strong>
          <span class="client-hearts" title="好感度">${heartStr}</span>
        </div>
        <div class="quest-title">${quest.title}</div>
        <p class="quest-desc">“${quest.desc}”</p>
        <div class="quest-req-box">
          <strong>📋 委托标准：</strong><br>${quest.reqDesc}
        </div>
        <div class="quest-footer">
          <div>
            <span style="font-size:0.72rem;color:#7c5f46;">时限：剩余 ${quest.daysLeft} 天</span>
            <div class="quest-reward-pill">赏金 ${quest.rewardSilver} 银币</div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn-gold" style="width:auto;padding:6px 10px;font-size:0.76rem;" id="btn-deliver-minigame-${quest.id}">
              🚴 骑车快送 (小游戏)
            </button>
            <button class="btn-secondary" style="width:auto;padding:6px 8px;font-size:0.74rem;margin:0;" id="btn-deliver-quest-${quest.id}">
              直接交货
            </button>
          </div>
        </div>
      `;

      const minigameBtn = card.querySelector(`#btn-deliver-minigame-${quest.id}`);
      const deliverBtn = card.querySelector(`#btn-deliver-quest-${quest.id}`);

      if (minigameBtn) {
        minigameBtn.addEventListener('click', () => {
          startDeliveryMinigame(quest);
        });
      }

      if (deliverBtn) {
        deliverBtn.addEventListener('click', () => {
          AudioEngine.playCoin();
          showToast('委托交付达成', `向【${quest.clientName}】交付了药剂！赚得 ${quest.rewardSilver} 银币与【${quest.rewardGift}】！`, 'success');
          state.coins.silver += quest.rewardSilver;
          quest.clientHearts = Math.min(5, quest.clientHearts + 1);
          updateHUD();
          initNoticeBoardView();
        });
      }

      container.appendChild(card);
    });
  }

  // ==========================================================================
  // 四、商会统购出货与行情周报
  // ==========================================================================
  function initShippingMarketView() {
    renderShippingBinView();
    renderMarketNewsletter();
    renderWholesaleTable();
  }

  function renderShippingBinView() {
    const shippingGrid = document.getElementById('shipping-crate-slots-grid');
    const warehouseGrid = document.getElementById('inventory-warehouse-slots-grid');
    const totalEl = document.getElementById('shipping-estimated-total');
    const shippingCountEl = document.getElementById('shipping-bin-count');
    const warehouseCountEl = document.getElementById('inventory-warehouse-count');

    state.shippingBin = state.shippingBin || [];

    // 1. 渲染出货箱待售区 (点击取回背包)
    if (shippingGrid) {
      shippingGrid.innerHTML = '';
      let totalEst = 0;

      if (state.shippingBin.length === 0) {
        shippingGrid.innerHTML = `
          <div style="grid-column: 1 / -1; font-size:0.75rem; color:var(--text-dim); text-align:center; padding:18px;">
            出货箱当前为空。成药与材料默认囤在下方背包仓库中，点击下方物品即可放入出货箱。
          </div>
        `;
      } else {
        state.shippingBin.forEach((item, idx) => {
          totalEst += item.price;
          const slot = document.createElement('div');
          slot.className = 'crate-slot occupied';
          slot.style.border = '1px solid #ffd875';
          slot.innerHTML = `
            <strong style="font-size:0.75rem;color:#ffd875;text-align:center;">${item.name}</strong>
            <span style="font-size:0.68rem;color:#a89785;margin-top:2px;">${item.price} 银 (待卖)</span>
            <span style="font-size:0.62rem;color:#9ae6b4;margin-top:2px;">点击取回</span>
          `;
          slot.addEventListener('click', () => {
            // 从出货箱取回背包
            state.shippingBin.splice(idx, 1);
            state.inventoryItems.push(item);
            AudioEngine.playTap();
            showToast('已取回背包', `【${item.name}】已从出货箱撤回工坊仓库，打烊时不会被卖出！`, 'normal');
            renderShippingBinView();
          });
          shippingGrid.appendChild(slot);
        });
      }

      if (totalEl) totalEl.textContent = `${totalEst} 银币`;
      if (shippingCountEl) shippingCountEl.textContent = `箱内：${state.shippingBin.length} 件`;
    }

    // 2. 渲染背包仓库囤货区 (点击放入出货箱)
    if (warehouseGrid) {
      warehouseGrid.innerHTML = '';
      if (state.inventoryItems.length === 0) {
        warehouseGrid.innerHTML = `
          <div style="grid-column: 1 / -1; font-size:0.75rem; color:var(--text-dim); text-align:center; padding:18px;">
            背包仓库空空如也。可在柜台收货、订购原料或在后院熬制成药！
          </div>
        `;
      } else {
        state.inventoryItems.forEach((item, idx) => {
          const hasRareTag = (item.tags || []).some(t => t.includes('古代') || t.includes('雷') || t.includes('极寒') || t.includes('自锁') || t.includes('神髓') || t.includes('绝') || t.includes('清甜') || t.includes('促愈'));
          const slot = document.createElement('div');
          slot.className = 'crate-slot occupied';
          if (hasRareTag) slot.style.border = '1px solid #ffd700';
          slot.innerHTML = `
            <strong style="font-size:0.75rem;color:${hasRareTag ? '#ffd700' : '#f0e6d6'};text-align:center;">${item.name}</strong>
            <span style="font-size:0.66rem;color:#c0ab92;margin-top:2px;">${item.price} 银</span>
            ${hasRareTag ? '<span style="font-size:0.62rem;color:#ffd700;">★ Lv.4+ 珍奇</span>' : ''}
            <span style="font-size:0.62rem;color:#ffd875;margin-top:2px;">点击入箱出售</span>
          `;
          slot.addEventListener('click', () => {
            // 从背包移入出货箱
            state.inventoryItems.splice(idx, 1);
            state.shippingBin.push(item);
            AudioEngine.playCoin();
            showToast('放入出货箱', `【${item.name}】已放入商会集运箱，将在今日打烊时由马车结算！`, 'normal');
            renderShippingBinView();
          });
          warehouseGrid.appendChild(slot);
        });
      }
      if (warehouseCountEl) warehouseCountEl.textContent = `存货：${state.inventoryItems.length} 件 (永久囤存)`;
    }
  }

  function renderMarketNewsletter() {
    const header = document.getElementById('newsletter-header-title');
    const buffsList = document.getElementById('newsletter-active-buffs');
    const forecastList = document.getElementById('newsletter-forecast-list');

    if (header) header.textContent = window.ATELIER_DATA.marketTrends.weekTitle;

    if (buffsList) {
      buffsList.innerHTML = window.ATELIER_DATA.marketTrends.activeBuffs.map(b => `
        <div class="trend-item-row">
          <span class="trend-badge ${b.isUp ? 'up' : 'down'}">${b.change}</span>
          <div style="font-size:0.8rem;">
            <strong>【${b.category}】</strong> - ${b.reason}
          </div>
        </div>
      `).join('');
    }

    if (forecastList) {
      forecastList.innerHTML = window.ATELIER_DATA.marketTrends.nextWeekForecast.map(f => `
        <div class="trend-item-row">
          <span class="trend-badge ${f.isUp ? 'up' : 'down'}">${f.change}</span>
          <div style="font-size:0.8rem;">
            <strong>【${f.category}】</strong> - 传闻：${f.rumor}
          </div>
        </div>
      `).join('');
    }
  }

  function renderWholesaleTable() {
    const tbody = document.getElementById('wholesale-catalog-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    window.ATELIER_DATA.marketTrends.wholesaleCatalog.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.name}</strong></td>
        <td>${item.category}</td>
        <td>${item.basePrice} 银</td>
        <td style="color:#ffd875;font-weight:700;">${item.orderPrice} 银</td>
        <td>
          <button class="btn-secondary" style="margin:0;padding:3px 8px;font-size:0.72rem;" id="btn-order-${item.id}">
            订购加急
          </button>
        </td>
      `;
      const btn = tr.querySelector(`#btn-order-${item.id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (state.coins.silver < item.orderPrice) {
            showToast('现银不足', '钱箱中的银币不够支付这笔代采费！', 'error');
            return;
          }
          state.coins.silver -= Math.round(item.orderPrice);
          AudioEngine.playCoin();
          updateHUD();

          // 订购直接备入背包原料仓
          state.inventoryItems.push({
            id: `ordered_${Date.now()}`,
            name: item.name,
            type: 'material',
            price: item.basePrice,
            tags: ['商会优质验标'],
            clarity: 80
          });
          renderCauldronMaterialsPicker();
          renderShippingBinView();

          showToast('商会订购单已下达', `成功按 125% 基准价订购【${item.name}】，已直达后院仓库可供投鼎！`, 'success');
        });
      }
      tbody.appendChild(tr);
    });
  }

  // ==========================================================================
  // 五、礼宾玻璃陈列柜逻辑 (Showcase)
  // ==========================================================================
  function initShowcaseView() {
    const btnPlace = document.getElementById('btn-place-in-showcase');
    const nameEl = document.getElementById('showcase-item-name');
    const tagsEl = document.getElementById('showcase-item-tags');
    const allureEl = document.getElementById('showcase-allure-rate');

    if (btnPlace) {
      btnPlace.addEventListener('click', () => {
        const bestItem = state.inventoryItems.find(i => i.clarity >= 80) || state.inventoryItems[0];
        if (!bestItem) {
          showToast('货架空空', '工坊内尚无可陈列的高阶药水或抛光宝物！', 'warning');
          return;
        }

        if (nameEl) nameEl.textContent = bestItem.name;
        if (tagsEl) tagsEl.textContent = `★ ${bestItem.tags.join(' ★ ')}`;
        if (allureEl) allureEl.textContent = `名门大管家与富商进店吸引率：+65% (极高)`;

        AudioEngine.playPerfectCombo();
        showToast('展柜入驻', `已将【${bestItem.name}】摆入礼宾陈列柜，散发温润微光！`, 'perfect-combo');
      });
    }
  }

  // ==========================================================================
  // 六、主线债务与行会审查逻辑
  // ==========================================================================
  function initAuditView() {
    const payBtn = document.getElementById('btn-pay-audit-silver');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        if (state.coins.silver < state.debt.currentDueSilver) {
          showToast('金额不足', `尚缺 ${state.debt.currentDueSilver - state.coins.silver} 银币，无法结清当期审查款！`, 'error');
          return;
        }
        state.coins.silver -= state.debt.currentDueSilver;
        AudioEngine.playCoin();
        updateHUD();
        showLLMSensoryModal(
          '行会审查通关！第一期欠据撕毁',
          `半精灵审查官维斯佩拉推了推细圆框眼镜，核对完钱箱数目，破天荒地露出了一丝极浅的赞许笑意：“做得不错。按照约定，这是布兰老爹在行会保险箱里留下的后院铁门钥匙。”`,
          `主线推进至第二幕：【地下室的黄铜密锁】！后院温室与深层工坊已彻底为您解锁！`
        );
        showToast('主线突破', '第一期借据已全款清偿！解锁深层工坊钥匙！', 'perfect-combo');
      });
    }
  }

  // ==========================================================================
  // 七、全功能抽屉与模态框系统 (人物档案/24标签图鉴/成就)
  // ==========================================================================
  function initDrawersAndModals() {
    // 渲染人物手札档案
    const charContainer = document.getElementById('characters-dossier-content');
    if (charContainer) {
      charContainer.innerHTML = `
        <div class="characters-grid">
          ${window.ATELIER_DATA.characterProfiles.map(c => `
            <div class="char-profile-card">
              <div style="display:flex;justify-content:space-between;align-items:baseline;">
                <strong style="color:#ffd875;font-size:0.95rem;">${c.name}</strong>
                <span style="font-size:0.75rem;color:var(--text-dim);">${c.race}</span>
              </div>
              <div style="font-size:0.76rem;color:var(--border-gold-glow);">${c.title}</div>
              <div style="font-size:0.78rem;color:#c0392b;">
                羁绊等级：${'♥ '.repeat(c.hearts)}${'♡ '.repeat(c.maxHearts - c.hearts)} (${c.bondLevel})
              </div>
              <p style="font-size:0.78rem;color:#dfd2c0;line-height:1.5;">${c.bio}</p>
              <div style="background:#150f0c;padding:6px 10px;border-radius:4px;border-left:2px solid var(--border-gold);font-size:0.75rem;color:#f0e4d2;font-style:italic;">
                ${c.voiceQuote}
              </div>
              <div style="font-size:0.72rem;color:var(--text-dim);margin-top:2px;">
                喜好：${c.likes.join('、')}<br>
                厌恶：${c.dislikes.join('、')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 渲染 24 种标签全科图鉴
    const tagContainer = document.getElementById('tag-encyclopedia-content');
    if (tagContainer) {
      tagContainer.innerHTML = `
        <div class="encyclopedia-grid">
          ${window.ATELIER_DATA.tagEncyclopedia.map(t => `
            <div class="encyclopedia-tag-card">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <strong style="color:#ffd875;font-size:0.84rem;">★ ${t.name}</strong>
                <span style="font-size:0.68rem;color:var(--border-gold);background:rgba(198,156,88,0.15);padding:1px 5px;border-radius:3px;">${t.cat}</span>
              </div>
              <p style="font-size:0.76rem;color:#ded1c1;line-height:1.45;">${t.desc}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 渲染成就室
    const achContainer = document.getElementById('achievements-vault-content');
    if (achContainer) {
      achContainer.innerHTML = `
        <div class="achieve-grid">
          ${window.ATELIER_DATA.achievements.map(a => `
            <div class="achieve-badge-card ${a.unlocked ? 'unlocked' : ''}">
              <div style="width:36px;height:36px;border-radius:50%;background:#2a1f16;border:1px solid var(--border-gold);display:flex;align-items:center;justify-content:center;color:${a.unlocked ? '#ffd700' : 'var(--text-dim)'};flex-shrink:0;">
                ${ICONS.sparkles}
              </div>
              <div>
                <strong style="color:${a.unlocked ? '#ffd875' : 'var(--text-dim)'};font-size:0.86rem;">${a.name}</strong>
                <div style="font-size:0.74rem;color:#a89785;margin-top:2px;">${a.desc}</div>
                <span style="font-size:0.68rem;color:${a.unlocked ? '#9ae6b4' : '#feb2b2'};">${a.unlocked ? '已达成解锁' : '未解锁'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 绑定模态框打开与关闭触发
    const charBtn = document.getElementById('nav-btn-characters-modal');
    const encyBtn = document.getElementById('nav-btn-encyclopedia-modal');
    const saveBtn = document.getElementById('nav-btn-save-modal');
    const upgradesBtn = document.getElementById('nav-btn-upgrades-modal');
    const closeShopBtn = document.getElementById('nav-btn-close-shop-modal');
    const debtBadge = document.getElementById('hud-debt-badge');
    const moneyDisplay = document.getElementById('player-money-display');

    if (charBtn) charBtn.addEventListener('click', () => openModal('modal-characters-dossier'));
    if (encyBtn) encyBtn.addEventListener('click', () => openModal('modal-tag-encyclopedia'));
    if (upgradesBtn) upgradesBtn.addEventListener('click', () => {
      renderUpgradesTreeUI();
      openModal('modal-workshop-upgrades');
    });
    if (saveBtn) saveBtn.addEventListener('click', () => {
      renderSaveSlotsUI();
      openModal('modal-save-ledger');
    });
    if (closeShopBtn) closeShopBtn.addEventListener('click', openDailySettlementModal);
    if (debtBadge) debtBadge.addEventListener('click', () => switchView('audit-view'));
    if (moneyDisplay) moneyDisplay.addEventListener('click', () => openModal('modal-achievements-vault'));

    // 全局关闭按钮绑定
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        closeModal(modalId);
      });
    });

    // 绑定存档导出与导入
    setupSaveImportExport();

    // 主页卡片快捷跳转
    document.querySelectorAll('.hub-card').forEach(card => {
      card.addEventListener('click', () => {
        const targetView = card.getAttribute('data-jump');
        if (targetView) switchView(targetView);
      });
    });

    const homeTrigger = document.getElementById('brand-home-trigger');
    if (homeTrigger) homeTrigger.addEventListener('click', () => switchView('hub-view'));
  }

  // ==========================================================================
  // 掌柜手账存读档引擎 (LocalStorage + File Export/Import)
  // ==========================================================================
  function renderSaveSlotsUI() {
    const container = document.getElementById('save-slots-container');
    if (!container) return;
    container.innerHTML = '';

    const slots = ['slot_1', 'slot_2', 'slot_3'];
    slots.forEach((slotKey, idx) => {
      const raw = localStorage.getItem(`atelier_save_${slotKey}`);
      let slotData = null;
      if (raw) {
        try { slotData = JSON.parse(raw); } catch (e) {}
      }

      const card = document.createElement('div');
      card.style.cssText = 'background:#1c1510;border:1px solid rgba(198,156,88,0.3);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;';

      if (slotData) {
        card.innerHTML = `
          <div>
            <strong style="color:#ffd875;font-size:0.9rem;">【手账档案 0${idx + 1}】</strong>
            <span style="font-size:0.72rem;color:var(--text-dim);margin-left:6px;">${slotData.saveTime || '旧日记录'}</span>
            <div style="font-size:0.76rem;color:#dfd2c0;margin-top:3px;">
              ${slotData.season} · 资金：${slotData.coins.silver} 银币 · 负债剩 ${slotData.debt.daysRemaining} 天
            </div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn-gold" style="width:auto;padding:5px 12px;font-size:0.75rem;" id="btn-save-${slotKey}">
              覆盖存档
            </button>
            <button class="btn-secondary" style="width:auto;padding:5px 12px;font-size:0.75rem;margin:0;" id="btn-load-${slotKey}">
              读取手账
            </button>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div>
            <strong style="color:var(--text-dim);font-size:0.9rem;">【手账档案 0${idx + 1}】空白羊皮纸</strong>
            <div style="font-size:0.74rem;color:#7c6958;margin-top:2px;">尚无记录</div>
          </div>
          <div>
            <button class="btn-gold" style="width:auto;padding:5px 14px;font-size:0.75rem;" id="btn-save-${slotKey}">
              记录手账
            </button>
          </div>
        `;
      }

      const saveBtn = card.querySelector(`#btn-save-${slotKey}`);
      const loadBtn = card.querySelector(`#btn-load-${slotKey}`);

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          saveToSlot(slotKey, idx + 1);
        });
      }
      if (loadBtn) {
        loadBtn.addEventListener('click', () => {
          loadFromSlot(slotKey, idx + 1);
        });
      }

      container.appendChild(card);
    });
  }

  function saveToSlot(slotKey, num) {
    const saveData = {
      ...state,
      saveTime: new Date().toLocaleString()
    };
    localStorage.setItem(`atelier_save_${slotKey}`, JSON.stringify(saveData));
    AudioEngine.playCoin();
    showToast('手账已封印保存', `工坊进度已成功录入手账档案 0${num}！`, 'success');
    renderSaveSlotsUI();
  }

  function loadFromSlot(slotKey, num) {
    const raw = localStorage.getItem(`atelier_save_${slotKey}`);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      Object.assign(state, data);
      updateHUD();
      renderCustomerPanel();
      renderItemExamCard();
      renderRecipeCardsList();
      renderCurrentRecipeBranchDetails();
      renderShippingBinView();
      AudioEngine.playOrb();
      showToast('手账读取成功', `已恢复手账档案 0${num} 的工坊记录！`, 'perfect-combo');
      closeModal('modal-save-ledger');
    } catch (e) {
      showToast('读取失败', '存档数据解析异常！', 'error');
    }
  }

  function setupSaveImportExport() {
    const exportBtn = document.getElementById('btn-export-savefile');
    const importInput = document.getElementById('input-import-savefile');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const saveData = {
          ...state,
          saveTime: new Date().toLocaleString(),
          gameSignature: 'Atelier_Pawnshop_Savefile_v1'
        };
        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `工坊物语_掌柜手账_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        AudioEngine.playCoin();
        showToast('档案导出成功', '已生成独立 .json 掌柜手账文件！', 'success');
      });
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = JSON.parse(evt.target.result);
            Object.assign(state, data);
            updateHUD();
            renderCustomerPanel();
            renderItemExamCard();
            renderRecipeCardsList();
            renderCurrentRecipeBranchDetails();
            renderShippingBinView();
            AudioEngine.playOrb();
            showToast('外部手账导入成功', '已无缝继承该档案的所有资产与配方进度！', 'perfect-combo');
            closeModal('modal-save-ledger');
          } catch (err) {
            showToast('导入失败', '所选文件并非合法的工坊手账档案！', 'error');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  // ==========================================================================
  // 工坊金币设施升级树系统 (Workshop Upgrades Engine)
  // ==========================================================================
  function renderUpgradesTreeUI() {
    const container = document.getElementById('upgrades-tree-list');
    if (!container) return;
    container.innerHTML = '';

    state.upgrades = state.upgrades || { scale: 1, cauldron: 1, bicycle: 1, shelfSlots: 3, reputation: 1 };

    window.ATELIER_DATA.workshopUpgrades.forEach(up => {
      const currentLvl = state.upgrades[up.key] || 1;
      const nextLvlConfig = up.levels.find(l => l.level === currentLvl + 1);
      const currentLvlConfig = up.levels.find(l => l.level === currentLvl) || up.levels[0];
      const isMax = !nextLvlConfig;

      const card = document.createElement('div');
      card.style.cssText = 'background:#1a130e;border:1px solid rgba(198,156,88,0.3);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;';

      card.innerHTML = `
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:8px;">
            <strong style="color:#ffd875;font-size:0.92rem;">${up.name}</strong>
            <span style="font-size:0.72rem;background:rgba(212,175,55,0.15);color:#ffd875;border:1px solid rgba(212,175,55,0.4);padding:1px 6px;border-radius:4px;">
              Lv.${currentLvl} / ${up.maxLevel} (${up.category})
            </span>
          </div>
          <div style="font-size:0.78rem;color:#dfd2c0;margin-top:4px;">
            当前成效：${currentLvlConfig.desc}
          </div>
          ${!isMax ? `
            <div style="font-size:0.72rem;color:#9ae6b4;margin-top:2px;">
              下一阶：${nextLvlConfig.desc} (需 ${nextLvlConfig.costSilver} 银币)
            </div>
          ` : '<div style="font-size:0.72rem;color:#d4af37;margin-top:2px;">★ 已升至名匠终极阶位！</div>'}
        </div>
        <div>
          ${!isMax ? `
            <button class="btn-gold" style="width:auto;padding:6px 14px;font-size:0.78rem;white-space:nowrap;" id="btn-upgrade-${up.id}">
              升级 (支付 ${nextLvlConfig.costSilver} 银)
            </button>
          ` : `
            <button class="btn-secondary" style="width:auto;padding:6px 12px;font-size:0.74rem;opacity:0.6;margin:0;" disabled>
              已封顶
            </button>
          `}
        </div>
      `;

      if (!isMax) {
        const upBtn = card.querySelector(`#btn-upgrade-${up.id}`);
        if (upBtn) {
          upBtn.addEventListener('click', () => {
            if (state.coins.silver < nextLvlConfig.costSilver) {
              showToast('银币不足', `钱箱现银不够支付 ${nextLvlConfig.costSilver} 银币升级费用！`, 'error');
              return;
            }
            state.coins.silver -= nextLvlConfig.costSilver;
            state.upgrades[up.key] = currentLvl + 1;
            AudioEngine.playCoin();
            updateHUD();
            showToast('工坊设施升级成功！', `【${up.name}】已晋升为 Lv.${currentLvl + 1}，工坊实力大涨！`, 'perfect-combo');
            renderUpgradesTreeUI();
          });
        }
      }

      container.appendChild(card);
    });
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
      AudioEngine.playOrb();
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
      AudioEngine.playTap();
    }
  }

  // ==========================================================================
  // 八、每日打烊清算与昼夜轮转系统 (Nightly Settlement & Day Progression)
  // ==========================================================================
  function openDailySettlementModal() {
    const titleEl = document.getElementById('settle-day-title');
    const shippingEl = document.getElementById('settle-shipping-gain');
    const debtCountEl = document.getElementById('settle-debt-countdown-text');
    const confirmBtn = document.getElementById('btn-confirm-next-day');

    state.shippingBin = state.shippingBin || [];

    // 计算商会集运箱结算款 (只卖主动移入出货箱的物品，背包成药永久囤留！)
    let shippingSum = 0;
    state.shippingBin.forEach(i => { shippingSum += i.price; });

    if (titleEl) titleEl.textContent = `第 ${state.day} 日 · ${state.season} 营业盘点`;
    if (shippingEl) shippingEl.textContent = `+ ${shippingSum} 银币 (${state.shippingBin.length} 件待售)`;
    if (debtCountEl) {
      debtCountEl.textContent = `距离维斯佩拉执事登门清算还剩 ${state.debt.daysRemaining} 天 (当期需偿还 ${state.debt.currentDueSilver} 银币)`;
    }

    const netProfitEl = document.getElementById('settle-net-profit');
    if (netProfitEl) netProfitEl.textContent = `+ ${shippingSum} 银币 (背包另囤有 ${state.inventoryItems.length} 件珍藏)`;

    openModal('modal-nightly-settlement');

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        progressToNextDay(shippingSum);
      };
    }
  }

  function progressToNextDay(shippingSum) {
    // 结款入账
    state.coins.silver += shippingSum;
    state.shippingBin = []; // 仅清空出货箱，背包仓库(inventoryItems)里的成药与高阶素材永久保留！

    // 天数推进
    state.day++;
    state.debt.daysRemaining--;

    // 检查第 7 天还债审查结果
    if (state.debt.daysRemaining <= 0) {
      closeModal('modal-nightly-settlement');
      if (state.coins.silver >= state.debt.currentDueSilver) {
        state.coins.silver -= state.debt.currentDueSilver;
        updateHUD();
        AudioEngine.playPerfectCombo();
        showLLMSensoryModal(
          '【主线第一幕通关】执事的赞许与铁门钥匙',
          `第七天清晨，薄雾散去。行会审查官维斯佩拉准时迈入铺门。核对完账本里整整齐齐的 50 枚现银，她推了推金丝眼镜，嘴角泛起一抹罕见的笑意：“布兰先生没有看错人。工坊正式解封，这是后院铁门钥匙。”`,
          `恭喜达成第一阶段！解锁深层工坊与第二幕【地下室黄铜密锁】！`
        );
        state.debt.daysRemaining = 14;
        state.debt.currentDueSilver = 120;
      } else {
        AudioEngine.playBreak();
        showLLMSensoryModal(
          '【审查危机】资产不足以清偿利息',
          `维斯佩拉合上厚重的公文夹，语气冰冷而遗憾：“抱歉，掌柜先生。契约就是契约。你尚缺 ${state.debt.currentDueSilver - state.coins.silver} 银币。按照行会律法，本铺的经营特许将被扣押。”`,
          `执事念在老掌柜情分上，宽限了您最后 2 天筹钱缓冲期，请尽快抛售库存或交付布告栏大单！`
        );
        state.debt.daysRemaining = 2;
      }
      return;
    }

    // 轮转新的一天
    closeModal('modal-nightly-settlement');
    updateHUD();
    renderShippingBinView();
    AudioEngine.playOrb();

    // 刷新顾客与货物 (生成新客人)
    cycleNextCustomer();

    showToast('次日清晨来临', `第 ${state.day} 天阳光洒在柜台上，商会马车送来昨夜出货结款 ${shippingSum} 银币！`, 'perfect-combo');
  }

  // ==========================================================================
  // 小镇石板路急件送货平衡小游戏引擎 (Delivery Balance Minigame Engine)
  // ==========================================================================
  let deliveryGame = {
    active: false,
    quest: null,
    distance: 0, // 0 ~ 100
    speed: 0,    // 0 ~ 3
    stability: 100, // 0 ~ 100
    timeLeft: 15,
    isPedaling: false,
    obstacles: [],
    timerId: null,
    animFrameId: null
  };

  function startDeliveryMinigame(quest) {
    deliveryGame.active = true;
    deliveryGame.quest = quest;
    deliveryGame.distance = 0;
    deliveryGame.speed = 0;
    deliveryGame.stability = 100;
    deliveryGame.timeLeft = 15;
    deliveryGame.isPedaling = false;
    deliveryGame.obstacles = [
      { x: 30, type: 'rock', label: '石子' },
      { x: 60, type: 'puddle', label: '泥坑' },
      { x: 85, type: 'cat', label: '小黑猫' }
    ];

    const targetName = document.getElementById('delivery-quest-target-name');
    if (targetName) targetName.textContent = `${quest.clientName}的委托 · ${quest.title}`;

    openModal('modal-delivery-minigame');
    initDeliveryCanvas();

    // 绑定踏板事件 (支持鼠标按住与手机触摸按住)
    const pedalBtn = document.getElementById('btn-pedal-accelerate');
    const restartBtn = document.getElementById('btn-restart-delivery');

    const pressStart = (e) => {
      e.preventDefault();
      deliveryGame.isPedaling = true;
      pedalBtn.style.transform = 'scale(0.96)';
      pedalBtn.style.background = '#ffd875';
    };
    const pressEnd = (e) => {
      e.preventDefault();
      deliveryGame.isPedaling = false;
      pedalBtn.style.transform = 'scale(1)';
      pedalBtn.style.background = '';
    };

    pedalBtn.onmousedown = pressStart;
    pedalBtn.onmouseup = pressEnd;
    pedalBtn.ontouchstart = pressStart;
    pedalBtn.ontouchend = pressEnd;

    if (restartBtn) {
      restartBtn.onclick = () => startDeliveryMinigame(quest);
    }

    if (deliveryGame.timerId) clearInterval(deliveryGame.timerId);
    deliveryGame.timerId = setInterval(() => {
      if (!deliveryGame.active) return;
      deliveryGame.timeLeft--;
      const timerEl = document.getElementById('delivery-timer-val');
      if (timerEl) timerEl.textContent = `${deliveryGame.timeLeft} 秒`;

      if (deliveryGame.timeLeft <= 0) {
        endDeliveryGame(false, '超时未达');
      }
    }, 1000);
  }

  function initDeliveryCanvas() {
    const canvas = document.getElementById('delivery-road-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 580;
    canvas.height = 140;

    function loop() {
      if (!deliveryGame.active) return;

      // 物理速度更新
      if (deliveryGame.isPedaling) {
        deliveryGame.speed = Math.min(2.5, deliveryGame.speed + 0.08);
      } else {
        deliveryGame.speed = Math.max(0, deliveryGame.speed - 0.05);
      }

      deliveryGame.distance += deliveryGame.speed * 0.45;

      // 速度过快导致药水颠簸
      if (deliveryGame.speed > 1.8) {
        deliveryGame.stability = Math.max(0, deliveryGame.stability - (deliveryGame.speed - 1.8) * 0.8);
      }

      // 遇到障碍物判定
      deliveryGame.obstacles.forEach(obs => {
        if (Math.abs(deliveryGame.distance - obs.x) < 1.5 && deliveryGame.speed > 0.8) {
          deliveryGame.stability = Math.max(0, deliveryGame.stability - 8);
          AudioEngine.playBreak();
          showToast('单车颠簸！', `撞上${obs.label}，药箱猛烈晃动！`, 'warning');
        }
      });

      // 更新界面指示
      const distEl = document.getElementById('delivery-distance-val');
      const stabVal = document.getElementById('delivery-stability-val');
      const stabBar = document.getElementById('delivery-stability-bar');

      if (distEl) distEl.textContent = `${Math.min(100, Math.round(deliveryGame.distance))} / 100 米`;
      if (stabVal) {
        stabVal.textContent = `${Math.round(deliveryGame.stability)}% (${deliveryGame.stability > 70 ? '完好' : deliveryGame.stability > 30 ? '部分泼洒' : '严重受损'})`;
      }
      if (stabBar) {
        stabBar.style.width = `${deliveryGame.stability}%`;
        stabBar.style.background = deliveryGame.stability > 60 ? '#2f855a' : deliveryGame.stability > 30 ? '#d4af37' : '#b93c3c';
      }

      // 绘制石板路跑道
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 石板路地面
      ctx.fillStyle = '#1c1510';
      ctx.fillRect(0, 90, canvas.width, 50);
      ctx.strokeStyle = '#422f20';
      ctx.lineWidth = 2;
      for (let x = (100 - (deliveryGame.distance * 10)) % 40; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 90);
        ctx.lineTo(x, 140);
        ctx.stroke();
      }

      // 终点线
      const finishX = (100 - deliveryGame.distance) * (canvas.width / 100) + 60;
      if (finishX < canvas.width && finishX > 0) {
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(finishX, 40, 8, 100);
      }

      // 障碍物
      deliveryGame.obstacles.forEach(obs => {
        const obsScreenX = (obs.x - deliveryGame.distance) * (canvas.width / 100) + 60;
        if (obsScreenX > 0 && obsScreenX < canvas.width) {
          ctx.fillStyle = obs.type === 'cat' ? '#d4af37' : '#6e522b';
          ctx.fillRect(obsScreenX, 82, 14, 10);
        }
      });

      // 掌柜单车
      const bikeX = 60;
      const bikeY = 70 + (Math.sin(deliveryGame.distance * 0.8) * deliveryGame.speed * 1.5);
      ctx.fillStyle = '#ffd875';
      ctx.beginPath();
      ctx.arc(bikeX - 10, bikeY + 18, 8, 0, Math.PI * 2);
      ctx.arc(bikeX + 12, bikeY + 18, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f0e6d6';
      ctx.fillRect(bikeX - 6, bikeY, 14, 16);

      // 达到终点
      if (deliveryGame.distance >= 100) {
        endDeliveryGame(true);
        return;
      }

      deliveryGame.animFrameId = requestAnimationFrame(loop);
    }

    cancelAnimationFrame(deliveryGame.animFrameId);
    deliveryGame.animFrameId = requestAnimationFrame(loop);
  }

  function endDeliveryGame(isSuccess, reason = '') {
    deliveryGame.active = false;
    clearInterval(deliveryGame.timerId);
    cancelAnimationFrame(deliveryGame.animFrameId);

    const quest = deliveryGame.quest;
    closeModal('modal-delivery-minigame');

    if (isSuccess) {
      let finalReward = quest.rewardSilver;
      let tip = 0;
      if (deliveryGame.stability >= 80) {
        tip = Math.round(quest.rewardSilver * 0.35); // 完好送达高额小费 +35%
        finalReward += tip;
        AudioEngine.playPerfectCombo();
        showToast('神速完好送达！', `药水平稳无瑕！【${quest.clientName}】喜出望外，额外打赏跑腿小费 ${tip} 银币！`, 'perfect-combo');
      } else {
        AudioEngine.playCoin();
        showToast('送货抵达', `药水略有颠簸泼洒，扣除少许后顺利结算赏金 ${finalReward} 银币！`, 'normal');
      }

      state.coins.silver += finalReward;
      quest.clientHearts = Math.min(5, quest.clientHearts + (tip > 0 ? 2 : 1));
      updateHUD();
      initNoticeBoardView();
    } else {
      AudioEngine.playBreak();
      showToast('快送失败', `送货途中因${reason}，未能按时交付！`, 'error');
    }
  }

  // ==========================================================================
  // 九、LLM 唯象感官叙事模态框系统 (Sensory Modal)
  // ==========================================================================
  function showLLMSensoryModal(headline, sensoryParagraph, reactionParagraph) {
    const modal = document.getElementById('llm-sensory-modal');
    const headEl = document.getElementById('llm-modal-headline');
    const textEl = document.getElementById('llm-modal-content');
    const closeBtn = document.getElementById('btn-close-llm-modal');
    const ackBtn = document.getElementById('btn-ack-llm-modal');

    if (!modal || !headEl || !textEl) return;

    headEl.textContent = headline;
    textEl.innerHTML = `
      <p style="margin-bottom:10px;">${sensoryParagraph}</p>
      <p style="color:#ffd875;border-top:1px dashed rgba(198,156,88,0.3);padding-top:8px;">${reactionParagraph}</p>
    `;
    modal.classList.add('active');

    const handleClose = () => {
      modal.classList.remove('active');
      AudioEngine.playTap();
      if (closeBtn) closeBtn.removeEventListener('click', handleClose);
      if (ackBtn) ackBtn.removeEventListener('click', handleClose);
    };
    if (closeBtn) closeBtn.addEventListener('click', handleClose);
    if (ackBtn) ackBtn.addEventListener('click', handleClose);
  }

  // ==========================================================================
  // 九、全局视图路由切换系统
  // ==========================================================================
  function switchView(targetViewId) {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    const viewSections = document.querySelectorAll('.view-section');

    navButtons.forEach(b => {
      if (b.getAttribute('data-view') === targetViewId) b.classList.add('active');
      else b.classList.remove('active');
    });

    viewSections.forEach(s => {
      if (s.id === targetViewId) s.classList.add('active');
      else s.classList.remove('active');
    });

    state.activeView = targetViewId;
    AudioEngine.playTap();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab-btn[data-view]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetViewId = btn.getAttribute('data-view');
        if (targetViewId) switchView(targetViewId);
      });
    });
  }

  // ==========================================================================
  // 十、创作者工坊 / 编辑器模式引擎 (Atelier Studio Editor Engine)
  // ==========================================================================
  function initEditorStudioView() {
    // 1. 子选项卡切换 (物品 / 配方 / 委托 / 角色 / 剧情)
    const tabItem = document.getElementById('editor-tab-item');
    const tabRecipe = document.getElementById('editor-tab-recipe');
    const tabQuest = document.getElementById('editor-tab-quest');
    const tabChar = document.getElementById('editor-tab-char');
    const tabStory = document.getElementById('editor-tab-story');

    const panelItem = document.getElementById('editor-panel-item');
    const panelRecipe = document.getElementById('editor-panel-recipe');
    const panelQuest = document.getElementById('editor-panel-quest');
    const panelChar = document.getElementById('editor-panel-char');
    const panelStory = document.getElementById('editor-panel-story');

    const allTabs = [tabItem, tabRecipe, tabQuest, tabChar, tabStory].filter(Boolean);
    const allPanels = [panelItem, panelRecipe, panelQuest, panelChar, panelStory].filter(Boolean);

    const switchEditorTab = (activeTab, activePanel) => {
      allTabs.forEach(t => t.classList.remove('active'));
      allPanels.forEach(p => p.style.display = 'none');
      activeTab.classList.add('active');
      activePanel.style.display = 'block';
      AudioEngine.playTap();
    };

    if (tabItem && panelItem) tabItem.addEventListener('click', () => switchEditorTab(tabItem, panelItem));
    if (tabRecipe && panelRecipe) tabRecipe.addEventListener('click', () => switchEditorTab(tabRecipe, panelRecipe));
    if (tabQuest && panelQuest) tabQuest.addEventListener('click', () => switchEditorTab(tabQuest, panelQuest));
    if (tabChar && panelChar) tabChar.addEventListener('click', () => {
      renderCharacterToggleManager();
      switchEditorTab(tabChar, panelChar);
    });
    if (tabStory && panelStory) tabStory.addEventListener('click', () => switchEditorTab(tabStory, panelStory));

    // 2. 物品编辑器即时预览与保存
    const nameInput = document.getElementById('edit-item-name');
    const catSelect = document.getElementById('edit-item-category');
    const tierSelect = document.getElementById('edit-item-tier');
    const symptomInput = document.getElementById('edit-item-symptom');
    const saveItemBtn = document.getElementById('btn-save-custom-item');

    const updateItemPreview = () => {
      const pName = document.getElementById('preview-item-name');
      const pCat = document.getElementById('preview-item-cat');
      const pSym = document.getElementById('preview-item-symptom');
      const pPrice = document.getElementById('preview-item-price');

      const tVal = parseInt(tierSelect.value, 10);
      const tierGuide = window.ATELIER_DATA.tierPriceGuide.material[tVal];
      const avgPrice = Math.round((tierGuide.min + tierGuide.max) / 2);

      if (pName) pName.textContent = nameInput.value || '未命名藏品';
      if (pCat) pCat.textContent = `${tierGuide.label} · ${catSelect.value}`;
      if (pSym) pSym.textContent = symptomInput.value || '暂无外观表征描写。';
      if (pPrice) pPrice.textContent = `脚本计算区间：${tierGuide.min}~${tierGuide.max} 银 (均价约 ${avgPrice} 银)`;
    };

    [nameInput, catSelect, tierSelect, symptomInput].forEach(el => {
      if (el) el.addEventListener('input', updateItemPreview);
    });

    if (saveItemBtn) {
      saveItemBtn.addEventListener('click', () => {
        const tVal = parseInt(tierSelect.value, 10);
        const tierGuide = window.ATELIER_DATA.tierPriceGuide.material[tVal];
        const baseP = Math.floor(Math.random() * (tierGuide.max - tierGuide.min + 1)) + tierGuide.min;
        const tagSelect = document.getElementById('edit-item-tag-select');
        const methodSelect = document.getElementById('edit-item-method-select');

        const newItem = {
          id: `custom_item_${Date.now()}`,
          name: nameInput.value || '自定义奇巧藏品',
          category: catSelect.value,
          tier: tVal,
          tierLabel: tierGuide.label,
          basePriceSilver: baseP,
          declaredPriceSilver: Math.round(baseP * 1.35),
          symptomText: symptomInput.value,
          hiddenTotalCount: 1,
          tags: [
            { id: 'custom_t1', name: tagSelect.value, level: tVal >= 4 ? 4 : 2, revealed: false, validMethod: methodSelect.value, mod: +0.40, type: tVal >= 4 ? 'rare' : 'positive' }
          ],
          journalEntries: [
            { isCorrect: true, title: `《工匠私撰·${tagSelect.value}》`, text: `以此法检验：【${window.ATELIER_DATA.workshopMethods.find(m => m.id === methodSelect.value).name}】必见其真章。` }
          ]
        };

        // 存入玩家背包仓库
        state.inventoryItems.push({
          id: newItem.id,
          name: newItem.name,
          type: 'material',
          price: baseP,
          tier: tVal,
          tierLabel: tierGuide.label,
          tags: [tagSelect.value],
          clarity: 85
        });

        renderCauldronMaterialsPicker();
        renderShippingBinView();
        renderMoonlighterShelf();
        AudioEngine.playPerfectCombo();
        showToast('自定义物品注入成功！', `【${newItem.name}】已成功写入游戏全局数据库并送达背包仓库！`, 'perfect-combo');
      });
    }

    // 3. 配方编辑器保存
    const saveRecipeBtn = document.getElementById('btn-save-custom-recipe');
    if (saveRecipeBtn) {
      saveRecipeBtn.addEventListener('click', () => {
        const rName = document.getElementById('edit-recipe-name').value || '自创新方';
        const rDesc = document.getElementById('edit-recipe-desc').value || '工坊私传秘制。';
        const h1 = document.getElementById('edit-branch-a-hit1').value;
        const h2 = document.getElementById('edit-branch-a-hit2').value;
        const h3 = document.getElementById('edit-branch-a-hit3').value;

        const newRecipe = {
          id: `custom_rec_${Date.now()}`,
          name: rName,
          tier: '掌柜私传',
          desc: rDesc,
          targetRanges: { calor: [-15, 15], frigor: [10, 35], lene: [10, 30], minClarity: 50 },
          branches: [
            {
              branchId: 'civilian',
              name: '市井自创派',
              audience: '全镇居民',
              combo: [h1, h2, h3],
              bonusTags: ['清甜不苦', '长久保鲜'],
              bonusClarity: 30,
              unlocked: true,
              tip: `自创工法连携：【${h1}】➜【${h2}】➜【${h3}】。`
            }
          ]
        };

        window.ATELIER_DATA.recipes.push(newRecipe);
        state.currentRecipeId = newRecipe.id;
        renderRecipeCardsList();
        renderCurrentRecipeBranchDetails();
        AudioEngine.playPerfectCombo();
        showToast('自定义配方注入成功！', `【${rName}】已正式收录进后院炼金秘药谱册，可直接开炉！`, 'perfect-combo');
      });
    }

    // 4. 布告栏委托保存
    const saveQuestBtn = document.getElementById('btn-save-custom-quest');
    if (saveQuestBtn) {
      saveQuestBtn.addEventListener('click', () => {
        const qClient = document.getElementById('edit-quest-client').value || '小镇旅人';
        const qTitle = document.getElementById('edit-quest-title').value || '紧急搜求';
        const qDesc = document.getElementById('edit-quest-desc').value || '请尽快送达！';
        const qDays = parseInt(document.getElementById('edit-quest-days').value, 10) || 3;
        const qBounty = parseInt(document.getElementById('edit-quest-bounty').value, 10) || 30;

        const newQuest = {
          id: `custom_q_${Date.now()}`,
          clientName: qClient,
          clientHearts: 1,
          daysLeft: qDays,
          title: qTitle,
          desc: qDesc,
          reqDesc: '自创特制品需求：澄澈度 ≥ 60，具备优良物性',
          rewardSilver: qBounty,
          rewardGift: '精致手信礼盒 x1',
          status: 'available'
        };

        window.ATELIER_DATA.noticeQuests.unshift(newQuest);
        initNoticeBoardView();
        AudioEngine.playCoin();
        showToast('新委托钉上布告栏！', `【${qClient}】的字条已钉在喷泉广场布告牌上，赏金 ${qBounty} 银！`, 'success');
      });
    }

    // 4. 角色自定义创建与选开管理
    function renderCharacterToggleManager() {
      const toggleList = document.getElementById('character-toggle-manager-list');
      if (!toggleList) return;
      toggleList.innerHTML = '';

      window.ATELIER_DATA.characterProfiles.forEach(char => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#1e150f;padding:6px 10px;border-radius:4px;border:1px solid rgba(198,156,88,0.2);';
        item.innerHTML = `
          <div>
            <strong style="color:#ffd875;font-size:0.8rem;">${char.name}</strong>
            <span style="font-size:0.7rem;color:var(--text-dim);margin-left:4px;">(${char.title.split('·')[0]})</span>
          </div>
          <label style="display:flex;align-items:center;gap:4px;font-size:0.74rem;color:#9ae6b4;cursor:pointer;">
            <input type="checkbox" id="char-toggle-${char.id}" ${char.disabled ? '' : 'checked'}>
            <span>${char.disabled ? '已屏蔽' : '启用登场'}</span>
          </label>
        `;
        const box = item.querySelector(`#char-toggle-${char.id}`);
        if (box) {
          box.addEventListener('change', () => {
            char.disabled = !box.checked;
            AudioEngine.playTap();
            showToast('人物登场状态变更', `【${char.name}】已${char.disabled ? '从登场名单屏蔽' : '重新激活登场'}！`, 'normal');
            renderCharacterToggleManager();
          });
        }
        toggleList.appendChild(item);
      });
    }

    const saveCharBtn = document.getElementById('btn-save-custom-char');
    if (saveCharBtn) {
      saveCharBtn.addEventListener('click', () => {
        const cName = document.getElementById('edit-char-name').value || '异邦旅人';
        const cTitle = document.getElementById('edit-char-title').value || '漫游学者';
        const cRace = document.getElementById('edit-char-race').value || '精灵族';
        const cBio = document.getElementById('edit-char-bio').value || '远道而来的神秘客人。';
        const cQuote = document.getElementById('edit-char-quote').value || '“掌柜先生，安好。”';
        const isEnabled = document.getElementById('edit-char-enabled').value === 'true';

        const newChar = {
          id: `custom_char_${Date.now()}`,
          name: cName,
          title: cTitle,
          race: cRace,
          avatar: 'adventurer',
          hearts: 1,
          maxHearts: 5,
          bondLevel: '初次相逢',
          personality: '自由优雅、富有探索欲',
          bio: cBio,
          voiceQuote: cQuote,
          likes: ['星光原石', '清透精油'],
          dislikes: ['刺鼻辛辣'],
          disabled: !isEnabled,
          heartEvents: [
            { heart: 1, title: '初次进店', desc: '被柜台的古旧微光吸引，留下了珍贵的印象。', unlocked: true }
          ]
        };

        window.ATELIER_DATA.characterProfiles.push(newChar);
        renderCharacterToggleManager();
        initDrawersAndModals();
        AudioEngine.playPerfectCombo();
        showToast('新角色注入成功！', `【${cName}】已正式写入小镇名册，可随时在人物手札查看！`, 'perfect-combo');
      });
    }

    // 5. 剧情章节与剧本包保存及试运行
    const saveStoryBtn = document.getElementById('btn-save-custom-story');
    const playStoryBtn = document.getElementById('btn-play-story-preview');

    const getCurrentStoryData = () => ({
      id: `custom_story_${Date.now()}`,
      title: document.getElementById('edit-story-title').value || '自创章节',
      character: document.getElementById('edit-story-character').value,
      condition: document.getElementById('edit-story-condition-val').value,
      sceneText: document.getElementById('edit-story-scene').value,
      dialogueText: document.getElementById('edit-story-dialogue').value,
      choices: [
        { label: document.getElementById('edit-story-choice-a').value, outcomeText: '你做出了果断的选择，赢得了客人的由衷赞许与丰厚回馈！' },
        { label: document.getElementById('edit-story-choice-b').value, outcomeText: '谨慎的处理平息了眼前的困境，工坊保留了宝贵的药材底仓。' }
      ]
    });

    if (saveStoryBtn) {
      saveStoryBtn.addEventListener('click', () => {
        const storyData = getCurrentStoryData();
        window.ATELIER_DATA.storyChapters.push(storyData);
        AudioEngine.playPerfectCombo();
        showToast('剧情剧本已保存！', `【${storyData.title}】已成功注入主线剧情章节包！`, 'perfect-combo');
      });
    }

    if (playStoryBtn) {
      playStoryBtn.addEventListener('click', () => {
        const storyData = getCurrentStoryData();
        showLLMSensoryModal(
          `🎬 剧情演绎：${storyData.title}`,
          `【场景】：${storyData.sceneText}\n\n【${storyData.character}】：${storyData.dialogueText}`,
          `👉 分支 A：${storyData.choices[0].label}\n👉 分支 B：${storyData.choices[1].label}`
        );
      });
    }

    // 6. DLC 模组导入导出 (支持包含角色与剧情包)
    const exportModBtn = document.getElementById('btn-export-mod-pack');
    const importModInput = document.getElementById('input-import-mod-pack');

    if (exportModBtn) {
      exportModBtn.addEventListener('click', () => {
        const modPack = {
          modName: '我的工坊全套扩展DLC',
          exportTime: new Date().toLocaleString(),
          customRecipes: window.ATELIER_DATA.recipes.filter(r => r.id.startsWith('custom_')),
          customQuests: window.ATELIER_DATA.noticeQuests.filter(q => q.id.startsWith('custom_')),
          customItems: state.inventoryItems.filter(i => i.id.startsWith('custom_')),
          customCharacters: window.ATELIER_DATA.characterProfiles.filter(c => c.id.startsWith('custom_')),
          customStories: window.ATELIER_DATA.storyChapters.filter(s => s.id.startsWith('custom_'))
        };
        const blob = new Blob([JSON.stringify(modPack, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `工坊物语_全功能DLC模组_${Date.now()}.atelier-mod.json`;
        a.click();
        URL.revokeObjectURL(url);
        AudioEngine.playCoin();
        showToast('全套 DLC 模组包已导出', '已生成包含物品、配方、委托、角色与剧情包的独立模组！', 'perfect-combo');
      });
    }

    if (importModInput) {
      importModInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const mod = JSON.parse(evt.target.result);
            if (mod.customRecipes) window.ATELIER_DATA.recipes.push(...mod.customRecipes);
            if (mod.customQuests) window.ATELIER_DATA.noticeQuests.unshift(...mod.customQuests);
            if (mod.customItems) state.inventoryItems.push(...mod.customItems);
            if (mod.customCharacters) window.ATELIER_DATA.characterProfiles.push(...mod.customCharacters);
            if (mod.customStories) window.ATELIER_DATA.storyChapters.push(...mod.customStories);

            renderRecipeCardsList();
            initNoticeBoardView();
            renderCauldronMaterialsPicker();
            renderShippingBinView();
            initDrawersAndModals();
            AudioEngine.playPerfectCombo();
            showToast('DLC 全模组载入成功！', `成功挂载外部创作者扩展模组，所有角色、剧情与新配方已实时就绪！`, 'perfect-combo');
          } catch (err) {
            showToast('模组格式无效', '解析模组 JSON 数据失败！', 'error');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  // 页面加载入口
  document.addEventListener('DOMContentLoaded', () => {
    initCoverCanvas();
    initMarqueeBar();
    updateHUD();
    setupNavigation();
    initCounterView();
    initAlchemyView();
    initNoticeBoardView();
    initShippingMarketView();
    initShowcaseView();
    initAuditView();
    initDrawersAndModals();
    initEditorStudioView();
  });

})();
