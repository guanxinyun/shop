/**
 * 《工坊物语：杂货铺掌柜的记账本》
 * 全套底层数据预设库 (Data Master) - 生产级全要素丰满版
 */

window.ATELIER_DATA = {
  // 1. 玩家初始工坊状态
  initialState: {
    day: 3,
    season: '丰收之月',
    week: 1,
    timeOfDay: '午后 (14:30)',
    coins: {
      gold: 1,
      silver: 48,
      copper: 65
    },
    debt: {
      currentDueSilver: 50,
      totalDebtSilver: 300,
      daysRemaining: 4,
      auditor: '维斯佩拉 (行会三级清算执事)'
    },
    pawnCustomerIndex: 0,
    shippingBin: [],
    showcaseItem: null,
    inventory: []
  },

  // 物品等级 (Tier 1 ~ 6) 官方指导价格基准表 (银币)
  tierPriceGuide: {
    material: {
      1: { min: 2, max: 5, label: 'T1 见习寻常' },
      2: { min: 6, max: 12, label: 'T2 熟工通货' },
      3: { min: 14, max: 25, label: 'T3 行家里手' },
      4: { min: 30, max: 55, label: 'T4 名匠珍品' },
      5: { min: 65, max: 120, label: 'T5 宗匠孤品' },
      6: { min: 150, max: 280, label: 'T6 天工绝造' }
    },
    potion: {
      1: { min: 6, max: 12, label: 'T1 见习成药' },
      2: { min: 14, max: 25, label: 'T2 熟工成药' },
      3: { min: 28, max: 50, label: 'T3 行家成药' },
      4: { min: 60, max: 110, label: 'T4 名匠成药' },
      5: { min: 130, max: 240, label: 'T5 宗匠名药' },
      6: { min: 300, max: 600, label: 'T6 奇迹神药' }
    }
  },

  // 跑马灯滚动快讯库
  marqueeBroadcasts: [
    '【小镇商会快报】近郊雨林瘴气渐起，全镇草药收购行市预计下周大幅攀升！',
    '【冒险者公会公告】新人试炼地下洞穴已清理完毕，见习剑士托马获得优秀评级。',
    '【烘焙坊香气】玛尔塔大娘后院果园青苹果挂果，特制热肉桂派限量出炉中！',
    '【守备队值守】夜间东隘巡逻队增设防滑油脂配给，铁匠汉斯正连夜赶制锁扣。',
    '【行会审查警示】离第一期工坊垫资还本付息清算还剩 4 天，请各店主备足现银！'
  ],

  // 2. 六大常驻关键人物档案 (全信息无占位，人物手札)
  characterProfiles: [
    {
      id: 'char_vespera',
      name: '维斯佩拉',
      title: '商人联合行会 · 三级清算审查执事',
      race: '半精灵女性 (26岁)',
      avatar: 'auditor',
      hearts: 1,
      maxHearts: 5,
      bondLevel: '公事公办',
      personality: '严谨克制、不徇私情、对认真专注的手艺人抱有隐藏的敬重',
      bio: '自王都商业学院毕业后派驻边陲小镇。随身携带着厚重的黄铜边角账册与细圆框金丝眼镜，每天准时在镇公所露台核算账目。布兰老爹失踪前曾将后院钥匙托付于她。',
      voiceQuote: '“布兰先生欠下行会的 300 枚银币是白纸黑字的契约。年轻人，我并不怀疑你的手艺，但规矩就是规矩。”',
      likes: ['账目清爽的单据', '无苦味的澄澈药茶', '古代印章拓本'],
      dislikes: ['油渍污损的欠条', '投机倒把的劣币', '拖延借口'],
      heartEvents: [
        { heart: 1, title: '初次核账', desc: '在铺子前台一丝不苟地核验了前三日的流水，微微推了推眼镜。', unlocked: true },
        { heart: 2, title: '雨廊茶歇', desc: '在暴雨天避雨时，偶尝了你调制的温润草茶，首次谈及王都往事。', unlocked: false },
        { heart: 3, title: '钥匙托付', desc: '撕毁第一期借据，暗中替你向行会申请了免征过桥过桥税。', unlocked: false }
      ]
    },
    {
      id: 'char_marta',
      name: '玛尔塔大娘',
      title: '面包房掌柜 · 矮人族热心主妇',
      race: '矮人女性 (52岁)',
      avatar: 'baker',
      hearts: 2,
      maxHearts: 5,
      bondLevel: '邻里热络',
      personality: '豪爽开朗、嗓门大、心肠软、烤得一手无敌的肉桂核桃派',
      bio: '在杂货铺隔壁经营着全镇唯一的石窑面包房，每天天不亮就揉面开炉。年轻时曾随矮人商队翻越霜龙雪山，虽然年纪大了腰腿经常受阴雨风湿困扰，但总是笑着把热面包分给穷苦孩子。',
      voiceQuote: '“哎呀小掌柜！揉了一辈子面，天一阴这腰就跟生了锈的铁轴似的。只要你那膏子不辣嗓子，大娘每天早上给你留俩刚出炉的热可颂！”',
      likes: ['柔顺无刺激的温骨膏', '耐火矿脂', '甜果干'],
      dislikes: ['刺鼻生姜味', '偷工减料的面粉', '浪费粮食'],
      heartEvents: [
        { heart: 1, title: '出炉核桃派', desc: '给店里送来刚出炉的面包，夸赞你把布兰老爹的旧铺收拾得挺精神。', unlocked: true },
        { heart: 2, title: '风湿急救', desc: '麦香节前夕你为她连夜熬制了温和蜜膏，让她免于停工之苦。', unlocked: true },
        { heart: 3, title: '家传麦酒秘方', desc: '邀请你去她后院品尝家传矮人麦酒，赠送一小桶用于炼金提纯的烈酒。', unlocked: false }
      ]
    },
    {
      id: 'char_thomas',
      name: '托马',
      title: '见习剑士 · 冒险者公会新人',
      race: '人类男性 (19岁)',
      avatar: 'adventurer',
      hearts: 1,
      maxHearts: 5,
      bondLevel: '同龄熟客',
      personality: '阳光冲动、急于证明自己、有点小虚荣但重信守义',
      bio: '从小在小镇长大，崇拜王都巡林骑士团，攒了半年薪水买了一套不太合身的二手硬皮甲。在城郊林地探索营地时总是第一个冲锋，虽然经常挂彩，但从不气馁。',
      voiceQuote: '“掌柜哥，看我今天在废墟里掏出的这把短刃！你瞧瞧这刃口纹路！公会老鸟总说我是毛头小子，等我攒够钱换把精钢重剑，让他们瞧瞧！”',
      likes: ['速效止血膏', '风纹矿石', '磨刀石与防滑蜡'],
      dislikes: ['被当作小孩子', '生锈钝刃', '黏液怪的酸液'],
      heartEvents: [
        { heart: 1, title: '祭坛宝藏', desc: '把第一次单挑哥布林缴获的短刃拿到店里换修理费。', unlocked: true },
        { heart: 2, title: '夜战回礼', desc: '用你的特制止血药在洞穴急救了队友，特地跑回店里郑重道谢。', unlocked: false }
      ]
    },
    {
      id: 'char_morris',
      name: '莫里斯',
      title: '维尔德子爵庄园 · 首席白手套管家',
      race: '人类男性 (61岁)',
      avatar: 'butler',
      hearts: 0,
      maxHearts: 5,
      bondLevel: '礼貌疏离',
      personality: '深沉优雅、目光锐利、对品质细节有极端强迫症、认规矩绝不还价',
      bio: '服务了子爵家族四十年。深灰燕尾服上没有一丝褶皱，戴着永远纤尘不染的白棉手套。专门负责宅邸后院的私密采买与名贵器具鉴赏。若货物达到其苛刻标准，会以纯金币照单全收。',
      voiceQuote: '“子爵夫人需要的并非街头凡俗的止痛草浆，而是一瓶在冬夜亦不冻结、气味如山茶微露的高雅冷露。掌柜先生，我期望您的技艺配得上这枚印章。”',
      likes: ['澄澈度80+无瑕药水', '古代避风魔具', '完好无损的丝绢拓片'],
      dislikes: ['浑浊杂质', '刺鼻草腥气', '轻浮不敬的言谈'],
      heartEvents: [
        { heart: 1, title: '展柜驻足', desc: '在你的前厅礼宾陈列柜前静立良久，首次留下庄园名片。', unlocked: false }
      ]
    },
    {
      id: 'char_baron',
      name: '巴隆',
      title: '黑石矿场大矿主 · 豪横富商',
      race: '人类男性 (45岁)',
      avatar: 'merchant',
      hearts: 0,
      maxHearts: 5,
      bondLevel: '金钱往来',
      personality: '粗豪好面子、挥金如土、极度厌恶寒酸、看重排场与光泽',
      bio: '依靠南隘铁矿起家的暴发户矿主。十指戴满硕大的次级魔晶金戒，出行必披厚重雪貂皮草。虽然缺乏深奥的工匠鉴赏力，但热衷于在商会晚宴上用古代工坊器物炫耀门面。',
      voiceQuote: '“本老爷差你那几十枚银币？拿去！只要这尊雕像擦得比市政厅大钟还亮，能在下周宴会上震住那帮老贵族，金币管够！”',
      likes: ['抛光光亮的贵金器物', '有古代刻纹的旧物', '华丽展品'],
      dislikes: ['带泥带锈的破烂', '暗淡无光的石头', '穷酸相'],
      heartEvents: [
        { heart: 1, title: '豪横甩金', desc: '在铺子里一掷千金买下展柜里打磨极佳的古银搭扣。', unlocked: false }
      ]
    },
    {
      id: 'char_hans',
      name: '汉斯大叔',
      title: '街角黑铁工坊 · 资深老铁匠',
      race: '矮人男性 (58岁)',
      avatar: 'smith',
      hearts: 2,
      maxHearts: 5,
      bondLevel: '同行照应',
      personality: '脾气刚烈、嘴硬心软、对手艺极其严苛、极重情义',
      bio: '与布兰老爹共事三十年的老朋友。虽经常在酒馆嘲弄布兰老爹“成天捣鼓发霉草叶”，但布兰失踪后，他总是暗中在后门放几袋优质无烟焦炭，防止小店在寒夜受冻。',
      voiceQuote: '“布兰那老骨头指不定在哪座雪山泉眼边泡脚呢！小子，手腕要稳，铁器敲出来要是哑音，趁早扔进熔炉重打，别拿出来丢手艺人的脸！”',
      likes: ['耐高温重油', '退火韧钢片', '烈麦酒'],
      dislikes: ['焊补敷衍的生铁', '受潮的冷隔件', '花拳绣腿'],
      heartEvents: [
        { heart: 1, title: '熔炉火星', desc: '打铁烫伤后你送来清凉骨膏，他嘴上骂骂咧咧但收下了。', unlocked: true },
        { heart: 2, title: '焦炭支援', desc: '后院煤仓见底时，他在深夜推来半车上好焦炭。', unlocked: true }
      ]
    }
  ],

  // 3. 柜台待接待顾客池 (包含平民、冒险者、上层贵客与名门管家)
  customers: [
    {
      id: 'cust_thomas',
      name: '托马',
      title: '见习剑士',
      archetype: '见习新人 · 好胜心切',
      portraitType: 'adventurer',
      speech: '掌柜哥！这是上午在哥布林祭坛暗箱里挖到的好家伙，手柄还镶着原石呢！少说也得值 25 银币，你瞅瞅？我还急着去铁匠铺修盾牌呢！',
      patience: 4,
      maxPatience: 4,
      targetItem: {
        id: 'item_goblin_dagger',
        name: '覆着草渍的巡林客短刃',
        category: '兵刃与法具',
        declaredPriceSilver: 25,
        basePriceSilver: 14,
        symptomText: '刃面有一层干涸青黑的草木油皮，闻着带有一股微涩土腥气；单手空挥时，指背隐隐感到刀脊纹路在靠近护手处有不自然的凹凸停顿。',
        hiddenTotalCount: 3,
        tags: [
          { id: 't_01', name: '缠绳磨损', level: 0, revealed: true, mod: -0.05, type: 'neutral' },
          { id: 't_02', name: '宿存麻痹毒层', level: 2, revealed: false, validMethod: 'drop_reagent', mod: +0.30, type: 'positive', hint: '钝刀微刮起一小卷油皮，指尖泛起微弱麻痒，底钢完好。' },
          { id: 't_03', name: '内层冷隔暗裂', level: 3, revealed: false, validMethod: 'acoustic_tap', mod: -0.40, type: 'negative', hint: '骨锤轻敲中段，回声啪的一声发哑短促，内里有断层！' }
        ],
        journalEntries: [
          {
            isCorrect: true,
            title: '《兵刃手札·冷隔暗伤条》',
            text: '刃面纹路若见在特定位置突兀折断跳跃，空挥感滞涩，多为冷隔内伤，切忌大力弯折！\n推荐检验法：【骨锤轻敲】。'
          },
          {
            isCorrect: false,
            title: '《杂工备忘·配重灌铅条》',
            text: '流水纹若见平缓连续游动，空挥重心微坠，多为柄内偷灌废铅白。\n推荐检验法：【微火微温】。'
          },
          {
            isCorrect: false,
            title: '《游侠杂篇·风纹轻钢条》',
            text: '刃面反光若见细微波浪跳跃，且空挥破风轻盈，乃风纹钢，外脆内韧。\n推荐检验法：【柔韧轻别】(高危！若实为暗伤则立折)。'
          }
        ]
      }
    },
    {
      id: 'cust_morris',
      name: '莫里斯',
      title: '子爵府大管家',
      archetype: '名门管家 · 严谨挑剔',
      portraitType: 'butler',
      speech: '午安，掌柜先生。我家夫人近日受冷风微寒所苦，急需一罐无任何生姜辛辣怪味的舒筋草膏。若成品澄澈度达到要求，府上愿意出三倍全款；若有一丝浑浊……我想阁下应当明白规矩。',
      patience: 3,
      maxPatience: 3,
      targetItem: {
        id: 'item_noble_brooch',
        name: '镶嵌古银的微光搭扣',
        category: '饰件与轻法具',
        declaredPriceSilver: 60,
        basePriceSilver: 40,
        symptomText: '银质表面氧化泛出幽雅的青灰包浆，背面刻着一圈几乎磨平的细微环纹；用指腹滑过底座边缘，有一丝不易察觉的微润凉意。',
        hiddenTotalCount: 2,
        tags: [
          { id: 't_21', name: '表层古银氧化', level: 0, revealed: true, mod: -0.05, type: 'neutral' },
          { id: 't_22', name: '古代避风微刻纹', level: 4, revealed: false, validMethod: 'lamp_inspect', mod: +0.65, type: 'positive', hint: '聚光灯四十五度切入，底座内圈浮现出旧工坊的定风回旋咒！' }
        ],
        journalEntries: [
          {
            isCorrect: true,
            title: '《古物勘考·定风器用条》',
            text: '银扣底座若分量压手且指抚微凉，背圈多暗刻有微型防风回路。\n推荐检验法：【聚光照纹】。'
          },
          {
            isCorrect: false,
            title: '《金银杂识·镀银铅胎条》',
            text: '旧银器若泛青发灰且边缘微润，可能为锡铅胎底外包银皮。\n推荐检验法：【天平沉水】。'
          }
        ]
      }
    },
    {
      id: 'cust_baron',
      name: '巴隆',
      title: '矿场大老板',
      archetype: '豪横富商 · 挥金如土',
      portraitType: 'merchant',
      speech: '掌柜的！听说你后院收罗了不少古代稀罕货？后天商会大宴，本老爷要件带古代雷纹或者晶核的物件震场子。只要成色拔尖，多给五成银币那都不叫事！',
      patience: 3,
      maxPatience: 3,
      targetItem: {
        id: 'item_thunder_burl',
        name: '带碳化焦痕的雷心木瘤',
        category: '草药与生息',
        declaredPriceSilver: 45,
        basePriceSilver: 25,
        symptomText: '表面裹着一层焦黑碳壳，隐隐嵌着碎泥；但单手掂起来分量重逾生铁，切口处有极微弱的松脂清甜香。',
        hiddenTotalCount: 2,
        tags: [
          { id: 't_31', name: '表层碳化泥垢', level: 0, revealed: true, mod: -0.10, type: 'neutral' },
          { id: 't_32', name: '芯部天然凝结雷油松脂', level: 3, revealed: false, validMethod: 'gentle_heat', mod: +0.80, type: 'rare', hint: '微火微热切面，渗出一滴晶莹如赤琥珀的雷心脂，香气暴烈！' }
        ],
        journalEntries: [
          {
            isCorrect: true,
            title: '《林相杂记·雷心脂条》',
            text: '雷击老松若分量沉黑发硬，断口微香，必聚有雷心脂，遇温热则浮出赤油。\n推荐检验法：【微火微温】。'
          },
          {
            isCorrect: false,
            title: '《木料常识·朽木虫蛀条》',
            text: '碳化发硬若有异香，谨防白蚁内蛀灌胶。\n推荐检验法：【骨锤轻敲】。'
          }
        ]
      }
    }
  ],

  // 4. 十大标准工坊检验手法
  workshopMethods: [
    { id: 'acoustic_tap', name: '骨锤轻敲', icon: 'hammer', desc: '木柄骨锤轻敲听尾音杂颤 (查暗裂空洞)' },
    { id: 'lamp_inspect', name: '聚光照纹', icon: 'sun', desc: '强光灯平视逆光透射 (查折光与暗刻纹)' },
    { id: 'gentle_heat', name: '微火微温', icon: 'flame', desc: '酒精余烬微烘不显眼处 (查熔脂与异味)' },
    { id: 'fingertip_trace', name: '指肚慢抚', icon: 'hand', desc: '指腹轻拂接缝与纹理 (查锉痕暗接)' },
    { id: 'water_displace', name: '天平沉水', icon: 'scale', desc: '量筒测量排水体积 (辨纯度与真伪)' },
    { id: 'drop_reagent', name: '刮粉点水', icon: 'droplet', desc: '刮取微屑滴入工坊试剂 (看变色与活性)' },
    { id: 'mana_pulse', name: '魔力轻注', icon: 'sparkles', desc: '指尖微度注魔感应流通 (查回路阻滞)' },
    { id: 'lens_inspect', name: '透镜细查', icon: 'search', desc: '双重晶体放大镜微观勘验 (查砂眼虫卵)' },
    { id: 'torsion_flex', name: '柔韧轻别', icon: 'activity', desc: '双手施加微量弯曲应力 (测回弹疲劳)' },
    { id: 'counter_rub', name: '逆毛轻抚', icon: 'wind', desc: '顺逆交替抚摸表面质地 (查涂层与逆纹)' }
  ],

  // 5. 炼药 5 大基础加工方式
  alchemyMethods: [
    { id: 'simmer', name: '温煨', key: 'Simmer', desc: '余烬水浴慢烘，柔和控温', effect: { calor: -5, lene: +5, clarity: +5 } },
    { id: 'boil', name: '强沸', key: 'Boil', desc: '明火烈煎急煮，强行催发', effect: { calor: +15, volat: +10, clarity: -10 } },
    { id: 'stir', name: '研搅', key: 'Stir', desc: '玻璃棒导引，平复冲突', effect: { harmony: 10, clarity: +8 } },
    { id: 'filter', name: '析滤', key: 'Filter', desc: '亚麻滤纸捞杂，去油去沫', effect: { removeRot: true, clarity: +12 } },
    { id: 'extract', name: '萃滴', key: 'Extract', desc: '滴入冷凝水收膏，锁住精华', effect: { frigor: +10, removeOdor: true, clarity: +8 } }
  ],

  // 6. 经典配方库 (含一图三派 3-Hit Combo 分流)
  recipes: [
    {
      id: 'recipe_balm_01',
      name: '舒筋止痛草膏',
      tier: '初阶工坊',
      desc: '小镇最常用的外用软膏，不同手法可熬出截然不同的三派成色。',
      targetRanges: {
        calor: [-10, 15],
        frigor: [10, 30],
        lene: [15, 35],
        dur: [10, 30],
        minClarity: 50
      },
      branches: [
        {
          branchId: 'civilian',
          name: '市井温和派',
          audience: '平民母亲 / 面包房大娘 / 小孩',
          combo: ['simmer', 'filter', 'extract'],
          bonusTags: ['清甜不苦', '温润留香'],
          bonusClarity: 30,
          unlocked: true,
          tip: '温煨慢焙去燥，析滤去沫除辛，终以萃滴锁色收膏。'
        },
        {
          branchId: 'military',
          name: '行伍狂暴派',
          audience: '见习剑士 / 巡林守备队 / 猎人',
          combo: ['boil', 'stir', 'boil'],
          bonusTags: ['促愈活性', '持效延展'],
          bonusClarity: 30,
          unlocked: false,
          tip: '强沸大火催发草木深力，研搅匀质后再行强沸，猛烈止血！'
        },
        {
          branchId: 'noble',
          name: '贵族典雅派',
          audience: '名门管家 / 领主千金 / 贵客',
          combo: ['simmer', 'stir', 'extract'],
          bonusTags: ['无味无息', '极寒不冻'],
          bonusClarity: 30,
          unlocked: false,
          tip: '水浴隔温消解一切杂味，研搅融和，滴凝净水锁至无痕。'
        }
      ]
    },
    {
      id: 'recipe_mint_drop',
      name: '薄荷清凉退热滴剂',
      tier: '见习草本',
      desc: '专用于退烧发汗的清透滴剂，严禁熬出苦焦味。',
      targetRanges: {
        calor: [-20, 0],
        frigor: [25, 45],
        volat: [15, 30],
        minClarity: 55
      },
      branches: [
        {
          branchId: 'civilian',
          name: '甘露退热派',
          audience: '小镇居民 / 孩童',
          combo: ['simmer', 'filter', 'extract'],
          bonusTags: ['清甜不苦'],
          bonusClarity: 30,
          unlocked: true,
          tip: '小火温煨，滤纸细撇，滴入冷井水。'
        },
        {
          branchId: 'military',
          name: '冰封急救派',
          audience: '佣兵 / 探穴者',
          combo: ['simmer', 'stir', 'extract'],
          bonusTags: ['麻痹镇痛'],
          bonusClarity: 30,
          unlocked: false,
          tip: '保留薄荷烈冰之性，压制神经抽搐。'
        }
      ]
    }
  ],

  // 7. 小镇布告栏委托 (星露谷式 2~5 天时限)
  noticeQuests: [
    {
      id: 'quest_marta_bake',
      clientName: '面包房玛尔塔大娘',
      clientAvatar: 'baker',
      clientHearts: 2,
      daysLeft: 2,
      title: '急求揉面专用温热骨膏',
      desc: '后天就是麦香节了，我得通宵烤两百个面包！腰酸背痛得实在直不起来。千万别加刺鼻生姜味，不然我的面团全串味了！',
      reqDesc: '舒筋止痛草膏 (市井温和派) 需具备【清甜不苦】或【温润留香】，澄澈度 ≥ 55',
      rewardSilver: 24,
      rewardGift: '热腾腾的焦糖核桃派 x1',
      status: 'available'
    },
    {
      id: 'quest_thomas_shield',
      clientName: '见习剑士托马',
      clientAvatar: 'adventurer',
      clientHearts: 1,
      daysLeft: 3,
      title: '远征哥布林洞穴的止血膏',
      desc: '公会三天后要组织新人扫荡黏液怪洞穴！我需要一罐止血神速、顶得住剧烈拉扯的硬派药膏，味道苦不苦完全无所谓！',
      reqDesc: '舒筋止痛草膏 (行伍狂暴派) 需具备【促愈活性】或【持效延展】',
      rewardSilver: 28,
      rewardGift: '山林冷晶原石碎片 x2',
      status: 'available'
    },
    {
      id: 'quest_butler_private',
      clientName: '莫里斯管家 (子爵府)',
      clientAvatar: 'butler',
      clientHearts: 0,
      daysLeft: 4,
      title: '府邸常备无痕舒缓冷霜',
      desc: '子爵夫人对凡俗刺鼻草药极其反感。限期四日内送呈两罐透亮无瑕、毫无草腥异味的冷凝霜，款项当面全付。',
      reqDesc: '舒筋止痛草膏 (贵族典雅派) 需具备【无味无息】，澄澈度 ≥ 80',
      rewardSilver: 55,
      rewardGift: '名门行会免检通关函',
      status: 'available'
    }
  ],

  // 8. 市场周报与 125% 原料订购目录
  marketTrends: {
    weekTitle: '艾尔姆商会快讯 · 丰收之月 第一周',
    activeBuffs: [
      { category: '草药生药', change: '+20%', isUp: true, reason: '雨林瘴气弥漫，外伤药草需求激增' },
      { category: '日用粗铁', change: '-15%', isUp: false, reason: '南隘矿车通轨，生铁供应过剩' }
    ],
    nextWeekForecast: [
      { category: '恢复类成药', change: '预计暴涨 +40%', isUp: true, rumor: '巡林守备队即将轮值进驻换防' },
      { category: '兽皮绒料', change: '预计上涨 +35%', isUp: true, rumor: '矮人商队即将翻越雪山抵达急购防寒料' }
    ],
    wholesaleCatalog: [
      { id: 'ing_frost_leaf', name: '霜原蓝叶干', category: '草木生药', basePrice: 4.0, orderPrice: 5.0, unlocked: true },
      { id: 'ing_bone_powder', name: '研磨骨白粉', category: '辅料稳固', basePrice: 3.0, orderPrice: 3.75, unlocked: true },
      { id: 'ing_amber_resin', name: '老松金琥珀脂', category: '稀有催化', basePrice: 12.0, orderPrice: 15.0, unlocked: true },
      { id: 'ing_sweet_berry', name: '蜜树果脱水果干', category: '甜味调和', basePrice: 2.0, orderPrice: 2.5, unlocked: true }
    ]
  },

  // 9. 24 大炼药物性标签全科知识库 (供图鉴百科抽屉查阅)
  tagEncyclopedia: [
    { name: '清甜不苦', cat: '感官形态', desc: '口感温润甘美，小儿贵族指名，药水售价 +30%。' },
    { name: '刺鼻辛辣', cat: '感官形态', desc: '带强烈姜葱辛烈气，小儿与贵族订单严禁。' },
    { name: '挥发异味', cat: '感官形态', desc: '散发硫磺或动物脂臭，潜行猎人订单排斥。' },
    { name: '无味无息', cat: '感官形态', desc: '木炭精滤去尽杂气，巡林潜行与名门私密最爱。' },
    { name: '易挂厚膏', cat: '感官形态', desc: '质地稠密附着力强，外用重铠与骨膏核心。' },
    { name: '稀薄易渗', cat: '感官形态', desc: '顺滑如泉，皮肤呼吸间吸收入体，急救擦剂必备。' },
    { name: '促愈活性', cat: '药效机制', desc: '加速伤口结痂与生肌，高阶外伤药核心词缀。' },
    { name: '麻痹镇痛', cat: '药效机制', desc: '阻断剧烈痛觉神经，重伤急救刚需。' },
    { name: '清血驱毒', cat: '药效机制', desc: '化解蛇虫与酸液剧毒，解毒药剂核心。' },
    { name: '亢奋强心', cat: '药效机制', desc: '激发血气驱除困顿，夜巡与突围急用。' },
    { name: '微毒反胃', cat: '药效机制', desc: '残渣过多或澄澈低产生，服后恶心干呕大折价。' },
    { name: '舒缓安眠', cat: '药效机制', desc: '抚平躁郁心绪促进深睡，学者夫人订单指名。' },
    { name: '极寒不冻', cat: '物候保存', desc: '凛冬飞雪不凝固不析晶，雪山商队溢价 50%。' },
    { name: '易燃爆沸', cat: '物候保存', desc: '见明火即燃，猛火煎煮易炸锅，可制猎用火油。' },
    { name: '吸湿生霉', cat: '物候保存', desc: '原材受潮未洗，久置货架会污染同格其他药材。' },
    { name: '隔水防锈', cat: '物候保存', desc: '水泼不透，卫队铠甲防雨防潮刚需。' },
    { name: '快速沉底', cat: '物候保存', desc: '研磨粗糙静置易分层，服前须剧烈摇晃。' },
    { name: '长久保鲜', cat: '物候保存', desc: '酒精提炼琥珀封闭，保质期延长为一月。' },
    { name: '夜间微光', cat: '特异变质', desc: '暗处泛淡蓝微光，贵族奇趣与矿工探穴指名。' },
    { name: '持效延展', cat: '特异变质', desc: '药力持效延长翻倍，公会探穴队高价扫货。' },
    { name: '极性锁死', cat: '特异变质', desc: '冷热极性被彻底锚定，外界加温不再变性。' },
    { name: '药力烈冲', cat: '特异变质', desc: '见效极猛但损耗体力，猎人与亡命徒拼命用。' },
    { name: '逆向生肌', cat: '特异变质', desc: '手法逆转导致愈后留难看凸疤，贵族直接拒收。' },
    { name: '魔力活化', cat: '特异变质', desc: '与法师魔力产生共鸣，施法前调息补魔首选。' }
  ],

  // 10. 掌柜成就徽章库 (Achieve Master)
  achievements: [
    { id: 'ach_first_blood', name: '开门大吉', desc: '在柜台成功完成第一笔买卖。', unlocked: true },
    { id: 'ach_combo_master', name: '炉火纯青', desc: '在炼金锅中打出一次配方的 Perfect Combo。', unlocked: true },
    { id: 'ach_debt_survivor', name: '信誉初立', desc: '按期偿还第一期行会 50 银币债务。', unlocked: false },
    { id: 'ach_noble_patron', name: '名门之友', desc: '接待子爵府管家莫里斯并成功交付订单。', unlocked: false },
    { id: 'ach_market_tycoon', name: '预判先机', desc: '依据周报预报提前囤积货物并在次周大赚。', unlocked: false }
  ]
};
