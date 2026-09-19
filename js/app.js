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

  // 辅助函数：更新顶部 HUD (货币/债务/时间)
  function updateHUD() {
    const goldEl = document.getElementById('hud-gold');
    const silverEl = document.getElementById('hud-silver');
    const copperEl = document.getElementById('hud-copper');
    const debtEl = document.getElementById('hud-debt-days');

    if (goldEl) goldEl.textContent = state.coins.gold;
    if (silverEl) silverEl.textContent = state.coins.silver;
    if (copperEl) copperEl.textContent = state.coins.copper;
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

    // 封面解印点击事件
    const overlay = document.getElementById('cover-entrance-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        AudioEngine.playOrb();
        overlay.classList.add('unsealed');
        setTimeout(() => {
          showToast('工坊开门营业', '晨曦微透，老铺柜台的油灯已点亮。', 'normal');
        }, 600);
      });
    }
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

    if (titleEl) titleEl.textContent = item.name;
    if (catEl) catEl.textContent = item.category;
    if (priceEl) priceEl.textContent = `${item.declaredPriceSilver} 银币`;
    if (descEl) descEl.textContent = item.symptomText;

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
    const bargainBtn = document.getElementById('btn-submit-offer');
    const offerInput = document.getElementById('input-offer-silver');
    const passBtn = document.getElementById('btn-pass-customer');
    const readBookBtn = document.getElementById('btn-read-journal-action');
    const viewCustBtn = document.getElementById('btn-view-customer-profile');

    if (bargainBtn && offerInput) {
      bargainBtn.addEventListener('click', () => {
        const val = parseFloat(offerInput.value);
        if (isNaN(val) || val <= 0) {
          showToast('出价无效', '请输入合乎常理的银币数额。', 'warning');
          return;
        }
        submitBargainOffer(val);
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
  }

  function submitBargainOffer(offeredSilver) {
    const cust = state.currentCustomer;
    if (!cust) return;
    const item = cust.targetItem;

    let calculatedFair = item.basePriceSilver;
    item.tags.forEach(t => {
      if (t.revealed) {
        calculatedFair += item.basePriceSilver * t.mod;
      }
    });

    const minAcceptable = Math.max(4, Math.round(calculatedFair * 0.82));

    if (offeredSilver >= minAcceptable) {
      if (state.coins.silver < offeredSilver) {
        showToast('现钱不足', '钱箱里的现银不够支付这笔收购款！', 'error');
        return;
      }

      state.coins.silver -= Math.round(offeredSilver);
      AudioEngine.playCoin();
      updateHUD();

      state.inventoryItems.push({
        id: `purchased_${Date.now()}`,
        name: item.name,
        type: 'material',
        price: Math.round(calculatedFair * 1.3),
        tags: item.tags.filter(t => t.revealed).map(t => t.name),
        clarity: 70
      });

      showLLMSensoryModal(
        '交易达成！货款两讫',
        `你从抽屉里数出 ${offeredSilver} 枚银币推了过去。顾客仔细验过硬币成色，脸上的防备化作一抹笑意：“掌柜的爽快人，这东西归你了，回见！”`,
        `货物已收入库房。落子无悔，现在这件物品的所有隐藏底牌都已锁定。`
      );
      showToast('买入成功', `以 ${offeredSilver} 银币收下【${item.name}】！`, 'success');
      cycleNextCustomer();
    } else {
      cust.patience -= 2;
      renderCustomerPanel();
      if (cust.patience <= 0) {
        showLLMSensoryModal(
          '议价破裂！顾客拂袖而去',
          `听到这个报价，对方眉头拧紧，一把夺回桌上的物件：“掌柜的，你这砍得太离谱了！我宁可拿到街角汉斯铁匠铺当废铁砸，也不卖你！”`,
          `顾客头也不回地推门离去，门上的铜铃急促地响了一声。`
        );
        showToast('交易吹单', '出价过低，彻底耗尽了顾客的信任与耐心！', 'error');
        cycleNextCustomer();
      } else {
        showToast('压价太狠', `对方强烈不满，声称最低也得 ${minAcceptable} 银币才肯松口！`, 'warning');
      }
    }
  }

  function cycleNextCustomer() {
    state.pawnCustomerIndex = (state.pawnCustomerIndex + 1) % window.ATELIER_DATA.customers.length;
    state.currentCustomer = JSON.parse(JSON.stringify(window.ATELIER_DATA.customers[state.pawnCustomerIndex]));
    renderCustomerPanel();
    renderItemExamCard();
    renderJournalClues();
  }

  // ==========================================================================
  // 二、后院炼金工坊：5 种加工方式打 3-Hit Combo
  // ==========================================================================
  function initAlchemyView() {
    renderRecipeCardsList();
    renderFiveMethodsButtons();
    renderComboSlots();
    renderCurrentRecipeBranchDetails();
    setupAlchemyEvents();
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

      const potionName = `${recipe.name} (${matchedBranch.name})`;
      state.inventoryItems.push({
        id: `potion_${Date.now()}`,
        name: potionName,
        type: 'potion',
        price: 24,
        tags: [...matchedBranch.bonusTags],
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
          <button class="btn-gold" style="width:auto;padding:7px 12px;font-size:0.78rem;" id="btn-deliver-quest-${quest.id}">
            送货交付
          </button>
        </div>
      `;

      const deliverBtn = card.querySelector(`#btn-deliver-quest-${quest.id}`);
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
    const grid = document.getElementById('shipping-crate-slots-grid');
    const totalEl = document.getElementById('shipping-estimated-total');
    if (!grid) return;
    grid.innerHTML = '';

    let totalEst = 0;
    state.inventoryItems.forEach(item => {
      totalEst += item.price;
      const slot = document.createElement('div');
      slot.className = 'crate-slot occupied';
      slot.innerHTML = `
        <strong style="font-size:0.76rem;color:#ffd875;text-align:center;">${item.name}</strong>
        <span style="font-size:0.68rem;color:#a89785;margin-top:3px;">${item.price} 银币</span>
      `;
      slot.addEventListener('click', () => {
        AudioEngine.playTap();
        showToast('货柜操作', `【${item.name}】已放入每日集运箱，傍晚 17:00 马车统购。`, 'normal');
      });
      grid.appendChild(slot);
    });

    if (totalEl) totalEl.textContent = `${totalEst} 银币`;
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
          showToast('商会订购单已下达', `成功按 125% 基准价订购【${item.name}】，次日清晨邮差直送后院仓库！`, 'success');
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
    const debtBadge = document.getElementById('hud-debt-badge');
    const moneyDisplay = document.getElementById('player-money-display');

    if (charBtn) charBtn.addEventListener('click', () => openModal('modal-characters-dossier'));
    if (encyBtn) encyBtn.addEventListener('click', () => openModal('modal-tag-encyclopedia'));
    if (debtBadge) debtBadge.addEventListener('click', () => switchView('audit-view'));
    if (moneyDisplay) moneyDisplay.addEventListener('click', () => openModal('modal-achievements-vault'));

    // 全局关闭按钮绑定
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        closeModal(modalId);
      });
    });

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
  // 八、LLM 唯象感官叙事模态框系统 (Sensory Modal)
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
  });

})();
