'use strict';
// 版本号统一由 js/versionManager.js 的 versionInfo 管理
const VERSION = (typeof versionInfo !== 'undefined' && versionInfo && versionInfo.abyss) ? versionInfo.abyss : 'RC 1.0.0';
// abyss.js — 深渊回响 主脚本
/* ============================================================
   深渊回响 · Echoes of the Abyss
   单文件回合制 Roguelike
   ============================================================ */

/* ---------------- 工具 ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmt = n => Math.round(n).toLocaleString('zh-CN');
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = rnd(0, i);[b[i], b[j]] = [b[j], b[i]]; } return b; }
function wpick(pairs) { // [[val,weight],...]
  const total = pairs.reduce((s, p) => s + p[1], 0);
  let r = Math.random() * total;
  for (const [v, w] of pairs) { if ((r -= w) <= 0) return v; }
  return pairs[pairs.length - 1][0];
}

/* ---------------- 存档键 ---------------- */
const SAVE_KEY = 'echoes_of_abyss_v1';

/* ---------------- 稀有度 ---------------- */
const RARITY = {
  common: { key: 'common', n: '普通', cls: 'r-common', color: '#9aa7b8', mult: 1.0, weight: 58, affix: 0 },
  rare:   { key: 'rare',   n: '精良', cls: 'r-rare',   color: '#4fa8ff', mult: 1.35, weight: 27, affix: 1 },
  epic:   { key: 'epic',   n: '史诗', cls: 'r-epic',   color: '#b06bff', mult: 1.8, weight: 12, affix: 2 },
  legend: { key: 'legend', n: '传说', cls: 'r-legend', color: '#ffb545', mult: 2.45, weight: 3, affix: 3 },
};

/* ---------------- 装备基底 ---------------- */
const ITEM_BASES = [
  { n: '长剑',   slot: 'weapon',  ico: '⚔️', s: { atk: 5 } },
  { n: '战斧',   slot: 'weapon',  ico: '⚒️', s: { atk: 7, crit: 2 } },
  { n: '匕首',   slot: 'weapon',  ico: '🗡️', s: { atk: 3, crit: 8 } },
  { n: '法杖',   slot: 'weapon',  ico: '🔮', s: { atk: 4, critDmg: 14 } },
  { n: '长枪',   slot: 'weapon',  ico: '🔱', s: { atk: 6, def: 1 } },
  { n: '皮甲',   slot: 'armor',   ico: '🥋', s: { hp: 16, def: 2 } },
  { n: '锁子甲', slot: 'armor',   ico: '🛡️', s: { def: 4, hp: 8 } },
  { n: '法袍',   slot: 'armor',   ico: '👘', s: { hp: 12, def: 2, critDmg: 10 } },
  { n: '板甲',   slot: 'armor',   ico: '🦺', s: { def: 6, hp: 18 } },
  { n: '护符',   slot: 'trinket', ico: '📿', s: { hp: 10, crit: 3 } },
  { n: '戒指',   slot: 'trinket', ico: '💍', s: { atk: 2, crit: 4 } },
  { n: '披风',   slot: 'trinket', ico: '🧣', s: { def: 2, lifesteal: 3 } },
  { n: '宝石',   slot: 'trinket', ico: '💎', s: { hp: 8, gold: 10 } },
];
const SLOT_NAME = { weapon: '武器', armor: '护甲', trinket: '饰品' };
const SLOT_ICON = { weapon: '⚔️', armor: '🛡️', trinket: '🔮' };

const AFFIXES = [
  { k: 'atk',       n: '力量',   r: [2, 5] },
  { k: 'def',       n: '守护',   r: [1, 3] },
  { k: 'hp',        n: '生命',   r: [8, 22] },
  { k: 'crit',      n: '致命',   r: [3, 8] },
  { k: 'critDmg',   n: '锋锐',   r: [8, 22] },
  { k: 'lifesteal', n: '汲取',   r: [2, 6] },
  { k: 'gold',      n: '贪婪',   r: [5, 16] },
];
const STAT_NAME = {
  atk: '攻击', def: '防御', hp: '生命', crit: '暴击率', critDmg: '暴击伤害',
  lifesteal: '吸血', gold: '金币加成',
};
const PREFIXES = ['狂暴的', '古老的', '灼热的', '幽影', '龙鳞', '星辰', '血染的', '虚空的', '寂静的', '雷霆'];
const SUFFIXES = ['· 屠戮', '· 壁垒', '· 低语', '· 黎明', '· 深渊', '· 回响'];

/* ---------------- 技能 ---------------- */
const SKILLS = {
  fireSlash: {
    n: '烈焰斩', i: '🔥', cd: 3, rar: 'common',
    d: '造成 160% 攻击伤害，并附加 3 回合灼烧',
    cast() {
      const s = effStats();
      hitEnemy(1.6);
      addBuff(B.eBuffs, 'burn', 3, Math.max(2, Math.round(s.atk * 0.3)));
      logMsg('🔥 烈焰斩撕裂敌躯，火焰缠身灼烧。', 'player');
    }
  },
  iceShard: {
    n: '寒冰刺', i: '❄️', cd: 2, rar: 'common',
    d: '造成 115% 伤害，敌人攻击 -25%（2 回合）',
    cast() {
      hitEnemy(1.15);
      addBuff(B.eBuffs, 'weak', 2, 0.25);
      logMsg('❄️ 寒霜侵蚀血脉，敌人动作迟缓。', 'player');
    }
  },
  healLight: {
    n: '治愈之光', i: '✨', cd: 4, rar: 'rare',
    d: '恢复 28% 最大生命',
    cast() {
      const s = effStats();
      healPlayer(Math.round(s.maxHp * 0.28));
      logMsg('✨ 温暖的光辉笼罩全身。', 'heal');
    }
  },
  ironWall: {
    n: '铁壁', i: '🛡️', cd: 4, rar: 'rare',
    d: '获得 30% 最大生命护盾，防御 +50%（2 回合）',
    cast() {
      const s = effStats();
      addBuff(B.pBuffs, 'shield', 99, Math.round(s.maxHp * 0.3));
      addBuff(B.pBuffs, 'defUp', 2, 0.5);
      logMsg('🛡️ 铁壁展开，刀锋难入。', 'player');
    }
  },
  shadowStrike: {
    n: '影袭', i: '🌪️', cd: 3, rar: 'rare',
    d: '两次 80% 伤害，暴击率 +25%',
    cast() {
      hitEnemy(0.8, { critBonus: 25 });
      if (B.enemy.hp > 0) hitEnemy(0.8, { critBonus: 25 });
      logMsg('🌪️ 残影掠过，双重斩击。', 'player');
    }
  },
  poisonBlade: {
    n: '毒刃', i: '🧪', cd: 3, rar: 'common',
    d: '造成 80% 伤害，附加 4 回合剧毒',
    cast() {
      const s = effStats();
      hitEnemy(0.8);
      addBuff(B.eBuffs, 'poison', 4, Math.max(2, Math.round(s.atk * 0.22)));
      logMsg('🧪 毒液顺着伤口渗入。', 'player');
    }
  },
  thunder: {
    n: '雷霆震击', i: '⚡', cd: 4, rar: 'epic',
    d: '造成 140% 伤害，50% 概率眩晕 1 回合',
    cast() {
      hitEnemy(1.4);
      if (Math.random() < 0.5) {
        addBuff(B.eBuffs, 'stun', 1, 1);
        logMsg('⚡ 雷霆贯穿，敌人被震得无法动弹！', 'player');
      } else {
        logMsg('⚡ 雷霆落下，敌人稳住了身形。', 'player');
      }
    }
  },
  drainStrike: {
    n: '吸血打击', i: '🩸', cd: 3, rar: 'epic',
    d: '造成 130% 伤害，回复伤害量 60% 的生命',
    cast() {
      const d = hitEnemy(1.3);
      const h = Math.max(1, Math.round(d * 0.6));
      healPlayer(h);
      logMsg(`🩸 汲取了 ${h} 点生命。`, 'heal');
    }
  },
  rage: {
    n: '狂怒', i: '💥', cd: 5, rar: 'epic',
    d: '攻击 +40%（3 回合）',
    cast() {
      addBuff(B.pBuffs, 'atkUp', 3, 0.4);
      logMsg('💥 怒火在血脉中沸腾！', 'player');
    }
  },
  cleanse: {
    n: '净化', i: '💧', cd: 5, rar: 'rare',
    d: '清除所有负面状态，回复 15% 生命',
    cast() {
      const s = effStats();
      ['poison', 'burn', 'weak', 'vuln', 'stun'].forEach(k => delete B.pBuffs[k]);
      healPlayer(Math.max(1, Math.round(s.maxHp * 0.15)));
      logMsg('💧 污秽被洗净，伤势稍缓。', 'heal');
    }
  },
  holySmite: {
    n: '圣裁', i: '☀️', cd: 4, rar: 'epic',
    d: '造成 180% 伤害，对亡灵与恶魔 +50%',
    cast() {
      const tags = B.enemy.tags || [];
      const bonus = (tags.includes('undead') || tags.includes('demon')) ? 1.5 : 1;
      hitEnemy(1.8 * bonus);
      logMsg('☀️ 圣光自天顶降下审判。', 'player');
    }
  },
  execute: {
    n: '终结审判', i: '💀', cd: 6, rar: 'legend',
    d: '造成 260% 真实伤害（无视防御与护盾）',
    cast() {
      hitEnemy(2.6, { trueDmg: true });
      logMsg('💀 审判之刃落下，无从抵挡。', 'player');
    }
  },
};
const SKILL_POOL = Object.keys(SKILLS);
const STARTER_SKILLS = ['fireSlash', 'iceShard', 'poisonBlade'];

/* ---------------- 敌人 ---------------- */
const ENEMIES = {
  /* 第一层：腐化地窟 */
  rat: { n: '腐鼠', i: '🐀', hp: 26, atk: 7, def: 1, gold: [5, 11], tags: ['beast'],
    lore: '地窟最卑微的居民，却也是尸潮的先遣队。它们啃食一切，包括记忆。',
    intents: [{ t: 'atk', m: 1 }, { t: 'atk', m: 1 }, { t: 'debuff', b: 'weak', v: 0.2, d: 2 }] },
  bat: { n: '洞穴蝠', i: '🦇', hp: 21, atk: 8, def: 0, gold: [5, 10], tags: ['beast'],
    lore: '它们的回声能让人听见自己心跳的裂缝。',
    intents: [{ t: 'multi', m: 0.55, hits: 2 }, { t: 'atk', m: 1 }, { t: 'atk', m: 1.3 }] },
  spider: { n: '剧毒蛛', i: '🕷️', hp: 30, atk: 6, def: 2, gold: [6, 12], tags: ['beast'],
    lore: '织网于阴影之间，毒液能让最坚硬的骑士跪地。',
    intents: [{ t: 'atk', m: 0.9 }, { t: 'dot', b: 'poison', v: 0.04, d: 3 }, { t: 'atk', m: 1 }] },
  skeleton: { n: '骸骨卫兵', i: '💀', hp: 38, atk: 9, def: 4, gold: [8, 15], tags: ['undead'],
    lore: '生前守卫这座地窟，死后依然恪守职责——尽管王国早已不存在。',
    intents: [{ t: 'atk', m: 1 }, { t: 'heavy', m: 1.7 }, { t: 'buff', b: 'defUp', v: 0.5, d: 2 }] },

  /* 第二层：幽影回廊 */
  wraith: { n: '游魂', i: '👻', hp: 46, atk: 12, def: 2, gold: [10, 18], tags: ['undead'],
    lore: '回廊里的低语，多数由它们发出。它们在寻找自己遗失的名字。',
    intents: [{ t: 'atk', m: 1 }, { t: 'drain', m: 0.85 }, { t: 'debuff', b: 'weak', v: 0.25, d: 2 }] },
  assassin: { n: '暗影刺客', i: '👤', hp: 40, atk: 16, def: 1, gold: [12, 20], tags: ['human'],
    lore: '曾经是人类。如今只剩下执行契约的本能。',
    intents: [{ t: 'multi', m: 0.6, hits: 2 }, { t: 'heavy', m: 1.8 }, { t: 'buff', b: 'atkUp', v: 0.3, d: 2 }] },
  gargoyle: { n: '石化守卫', i: '🗿', hp: 78, atk: 11, def: 11, gold: [14, 22], tags: ['construct'],
    lore: '石头的耐心总是比血肉更长久。',
    intents: [{ t: 'atk', m: 1 }, { t: 'buff', b: 'defUp', v: 0.7, d: 2 }, { t: 'heavy', m: 1.6 }] },
  priest: { n: '诅咒祭司', i: '🕯️', hp: 50, atk: 10, def: 3, gold: [13, 22], tags: ['human'],
    lore: '他向虚空献祭了声音，换来了让万物腐坏的力量。',
    intents: [{ t: 'debuff', b: 'vuln', v: 0.4, d: 2 }, { t: 'atk', m: 1 }, { t: 'heal', v: 0.18 }, { t: 'dot', b: 'burn', v: 0.035, d: 3 }] },

  /* 第三层：熔火深渊 */
  worm: { n: '熔岩虫', i: '🐛', hp: 86, atk: 17, def: 6, gold: [16, 26], tags: ['beast'],
    lore: '在岩浆中游弋的巨虫，体内的血就是火。',
    intents: [{ t: 'atk', m: 1 }, { t: 'dot', b: 'burn', v: 0.045, d: 3 }, { t: 'heavy', m: 1.6 }] },
  elemental: { n: '烈焰元素', i: '🔥', hp: 74, atk: 23, def: 3, gold: [18, 28], tags: ['elemental'],
    lore: '被撕裂的火焰意志，永远愤怒。',
    intents: [{ t: 'atk', m: 1.1 }, { t: 'multi', m: 0.6, hits: 3 }, { t: 'buff', b: 'atkUp', v: 0.35, d: 2 }] },
  hound: { n: '硫磺猎犬', i: '🐺', hp: 100, atk: 21, def: 8, gold: [18, 30], tags: ['beast', 'demon'],
    lore: '它的吠声能让石头流血。',
    intents: [{ t: 'atk', m: 1 }, { t: 'heavy', m: 1.75 }, { t: 'debuff', b: 'vuln', v: 0.35, d: 2 }] },
  colossus: { n: '火山巨像', i: '🌋', hp: 148, atk: 19, def: 17, gold: [22, 34], tags: ['construct'],
    lore: '整座火山的重量，凝结成一具缓慢的身躯。',
    intents: [{ t: 'heavy', m: 1.9 }, { t: 'buff', b: 'defUp', v: 0.8, d: 3 }, { t: 'atk', m: 1 }] },

  /* 第四层：虚空王座 */
  crawler: { n: '虚空爬行者', i: '🕸️', hp: 155, atk: 24, def: 12, gold: [24, 38], tags: ['void'],
    lore: '它们从现实的裂缝里爬出，用不存在的手指行走。',
    intents: [{ t: 'multi', m: 0.55, hits: 3 }, { t: 'atk', m: 1.1 }, { t: 'dot', b: 'poison', v: 0.05, d: 3 }] },
  devourer: { n: '星界吞噬者', i: '👁️', hp: 175, atk: 26, def: 10, gold: [26, 40], tags: ['void', 'demon'],
    lore: '它吃掉了自己所在的星辰，然后开始吃星辰之间的黑暗。',
    intents: [{ t: 'atk', m: 1.2 }, { t: 'drain', m: 1 }, { t: 'debuff', b: 'weak', v: 0.3, d: 2 }, { t: 'buff', b: 'atkUp', v: 0.4, d: 2 }] },
  whisper: { n: '疯狂低语', i: '🌀', hp: 135, atk: 30, def: 6, gold: [26, 42], tags: ['void', 'undead'],
    lore: '它们不是一个生物，而是一段无法被遗忘的话。',
    intents: [{ t: 'heavy', m: 1.7 }, { t: 'dot', b: 'burn', v: 0.05, d: 3 }, { t: 'debuff', b: 'vuln', v: 0.4, d: 2 }] },

  /* 极限模式：深红深渊（第 13-20 层） */
  voidReaper: { n: '虚渊收割者', i: '🪓', hp: 320, atk: 46, def: 20, gold: [42, 62], tags: ['void', 'undead'],
    lore: '它以碎裂的层数为镰，收割所有试图越界的灵魂。',
    intents: [{ t: 'heavy', m: 1.9 }, { t: 'atk', m: 1.2 }, { t: 'drain', m: 1.1 }, { t: 'debuff', b: 'vuln', v: 0.45, d: 2 }] },
  flameWarden: { n: '焚魂守卫', i: '🔥', hp: 360, atk: 42, def: 28, gold: [44, 66], tags: ['elemental', 'construct'],
    lore: '深红的火不焚肉身，只烧灼那些尚存的希望。',
    intents: [{ t: 'atk', m: 1.1 }, { t: 'dot', b: 'burn', v: 0.06, d: 3 }, { t: 'buff', b: 'defUp', v: 0.8, d: 3 }, { t: 'heavy', m: 1.8 }] },
  mirrorShade: { n: '镜影傀儡', i: '🪞', hp: 300, atk: 48, def: 16, gold: [46, 68], tags: ['void', 'human'],
    lore: '它是你自己，只是选择了另一条更深的道路。',
    intents: [{ t: 'multi', m: 0.6, hits: 3 }, { t: 'debuff', b: 'weak', v: 0.35, d: 2 }, { t: 'atk', m: 1.3 }, { t: 'buff', b: 'atkUp', v: 0.45, d: 2 }] },
};

/* ---------------- BOSS ---------------- */
const BOSSES = {
  boss1: { n: '地窟领主 · 格拉姆', i: '🐗', hp: 145, atk: 11, def: 6, gold: [70, 90], tags: ['beast', 'boss'], boss: true,
    lore: '曾是一位掘金者，如今把整座地窟当成自己的胃。',
    intents: [{ t: 'atk', m: 1 }, { t: 'heavy', m: 1.9 }, { t: 'buff', b: 'atkUp', v: 0.3, d: 2 }, { t: 'debuff', b: 'weak', v: 0.25, d: 2 }] },
  boss2: { n: '幽影君主 · 维尔', i: '🧛', hp: 300, atk: 17, def: 8, gold: [120, 150], tags: ['undead', 'boss'], boss: true,
    lore: '回廊的主人，用一千个灵魂的叹息织成王座。',
    intents: [{ t: 'atk', m: 1.1 }, { t: 'drain', m: 1.1 }, { t: 'multi', m: 0.6, hits: 3 }, { t: 'buff', b: 'defUp', v: 0.5, d: 2 }] },
  boss3: { n: '熔火巨兽 · 伊格尼斯', i: '🐉', hp: 430, atk: 24, def: 12, gold: [180, 220], tags: ['elemental', 'demon', 'boss'], boss: true,
    lore: '它每一次呼吸都在重塑这座深渊的地形。',
    intents: [{ t: 'heavy', m: 1.8 }, { t: 'dot', b: 'burn', v: 0.06, d: 3 }, { t: 'multi', m: 0.55, hits: 3 }, { t: 'buff', b: 'atkUp', v: 0.35, d: 2 }] },
  boss4: { n: '深渊之主 · 涅赫', i: '😈', hp: 560, atk: 29, def: 15, gold: [320, 380], tags: ['void', 'demon', 'boss'], boss: true,
    lore: '它不是深渊的统治者，它就是深渊本身。',
    intents: [{ t: 'atk', m: 1.15 }, { t: 'heavy', m: 2 }, { t: 'drain', m: 1.2 }, { t: 'debuff', b: 'vuln', v: 0.4, d: 2 }, { t: 'buff', b: 'atkUp', v: 0.4, d: 2 }, { t: 'multi', m: 0.6, hits: 3 }] },

  /* 极限模式首领 */
  xboss1: { n: '深渊裂痕 · 卡俄斯', i: '🌀', hp: 880, atk: 52, def: 24, gold: [420, 500], tags: ['void', 'boss'], boss: true,
    lore: '它本是深渊的边界。你越过了它，它便长成了你的形状。',
    intents: [{ t: 'atk', m: 1.2 }, { t: 'multi', m: 0.6, hits: 4 }, { t: 'debuff', b: 'vuln', v: 0.5, d: 2 }, { t: 'buff', b: 'atkUp', v: 0.5, d: 2 }, { t: 'heavy', m: 2.1 }] },
  xboss2: { n: '无光之祖 · 乌尔', i: '🕳️', hp: 1150, atk: 62, def: 30, gold: [540, 640], tags: ['void', 'undead', 'boss'], boss: true,
    lore: '在光诞生之前，它就已经在这里等待。',
    intents: [{ t: 'drain', m: 1.4 }, { t: 'heavy', m: 2.2 }, { t: 'dot', b: 'burn', v: 0.07, d: 3 }, { t: 'buff', b: 'defUp', v: 0.9, d: 3 }, { t: 'multi', m: 0.55, hits: 4 }] },
  xboss3: { n: '极限之主 · 绝', i: '👑', hp: 1520, atk: 76, def: 36, gold: [720, 880], tags: ['void', 'demon', 'boss'], boss: true,
    lore: '它是所有走到尽头的人留下的最后一道回声。',
    intents: [{ t: 'heavy', m: 2.4 }, { t: 'multi', m: 0.55, hits: 5 }, { t: 'drain', m: 1.5 }, { t: 'debuff', b: 'weak', v: 0.4, d: 2 }, { t: 'buff', b: 'atkUp', v: 0.55, d: 2 }, { t: 'atk', m: 1.3 }] },
};

/* ---------------- 区域 ---------------- */
const BIOMES = [
  { id: 1, name: '腐化地窟', sub: '前 3 层 · 湿冷、腐臭与低语',
    enemies: ['rat', 'bat', 'spider', 'skeleton'], boss: 'boss1' },
  { id: 2, name: '幽影回廊', sub: '第 4-6 层 · 无尽的长廊与被遗忘的名字',
    enemies: ['wraith', 'assassin', 'gargoyle', 'priest'], boss: 'boss2' },
  { id: 3, name: '熔火深渊', sub: '第 7-9 层 · 岩浆、硫磺与咆哮',
    enemies: ['worm', 'elemental', 'hound', 'colossus'], boss: 'boss3' },
  { id: 4, name: '虚空王座', sub: '第 10-12 层 · 现实的边缘',
    enemies: ['crawler', 'devourer', 'whisper'], boss: 'boss4' },
  { id: 5, name: '深红极限', sub: '第 13-20 层 · 越界之后的深渊',
    enemies: ['voidReaper', 'flameWarden', 'mirrorShade'], boss: 'xboss1' },
];
const MAX_DEPTH = 12;
const EXTREME_MAX_DEPTH = 20;
const EXTREME_UNLOCK_NG = 10;   // 轮回难度 10 及以上才可开启极限模式
const EXTREME_BOSS_FLOORS = { 15: 'xboss1', 18: 'xboss2', 20: 'xboss3' };
function biomeOf(d) {
  if (d <= 3) return BIOMES[0];
  if (d <= 6) return BIOMES[1];
  if (d <= 9) return BIOMES[2];
  if (d <= 12) return BIOMES[3];
  return BIOMES[4];
}
const BOSS_FLOORS = [3, 6, 9, 12];
function bossFloorsOf() {
  return (R && R.extreme) ? [15, 18, 20] : BOSS_FLOORS;
}
function isBossFloor(d) {
  const list = bossFloorsOf();
  return list.indexOf(d) >= 0;
}
function depthCapOf() {
  return (R && R.extreme) ? EXTREME_MAX_DEPTH : MAX_DEPTH;
}
function bossKeyOf(d) {
  if (R && R.extreme && EXTREME_BOSS_FLOORS[d]) return EXTREME_BOSS_FLOORS[d];
  const idx = BOSS_FLOORS.indexOf(d);
  return idx >= 0 ? BIOMES[idx].boss : BIOMES[3].boss;
}
function extremeMul() { return (R && R.extreme) ? 1.6 : 1; }

/* ---------------- 事件 ---------------- */
const EVENTS = [
  {
    id: 'altar', n: '血色祭坛', i: '🕯️',
    d: '回廊深处立着一座祭坛，中央悬浮着一颗仍在跳动的心脏。四周刻满了献祭的文字。',
    choices: [
      { label: '献出生命力（-18% 最大生命，获得一件装备）', fn() {
          const loss = Math.round(effStats().maxHp * 0.18);
          R.bonusHp -= loss; R.hp = Math.min(R.hp, effStats().maxHp);
          if (R.hp <= 0) R.hp = 1;
          const it = genItem(R.depth, rollRarity(R.depth + 2));
          addItem(it);
          return `心脏吞下了你的血。你失去了 ${loss} 点生命上限，祭坛回赠了 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>。`;
        } },
      { label: '把手按上去，倾听（获得随机技能）', fn() {
          const s = grantRandomSkill();
          return s ? `古老的记忆涌入脑海：你掌握了 <b>${s.n}</b>。` : '心脏停止了跳动，什么也没有发生。（你已掌握所有技能）';
        } },
      { label: '砸碎它（获得金币，但受到诅咒）', fn() {
          const g = rnd(50, 110) + R.depth * 12;
          addGold(g);
          R.hp = Math.max(1, R.hp - Math.round(effStats().maxHp * 0.1));
          return `心脏爆裂，金币洒落一地（+${g} 金币），但你被诅咒灼伤，损失了一些生命。`;
        } },
    ]
  },
  {
    id: 'fountain', n: '静谧泉眼', i: '⛲',
    d: '一汪清泉在废土中泛着微光，水面倒映的不是你的脸，而是一个更年轻的你。',
    choices: [
      { label: '饮下泉水（回复 45% 生命）', fn() {
          const h = Math.round(effStats().maxHp * 0.45);
          healPlayer(h);
          return `泉水甘甜，伤口以肉眼可见的速度愈合（+${h} 生命）。`;
        } },
      { label: '投入金币许愿（消耗 40 金币，获得永久属性）', fn() {
          if (R.gold < 40) return '你囊中羞涩，倒影露出了一丝嘲讽的笑意。';
          R.gold -= 40;
          const k = pick(['bonusAtk', 'bonusDef', 'bonusHp', 'bonusCrit']);
          if (k === 'bonusAtk') R.bonusAtk += 3;
          if (k === 'bonusDef') R.bonusDef += 2;
          if (k === 'bonusHp') { R.bonusHp += 22; healPlayer(22); }
          if (k === 'bonusCrit') R.bonusCrit += 5;
          const map = { bonusAtk: '攻击 +3', bonusDef: '防御 +2', bonusHp: '最大生命 +22', bonusCrit: '暴击率 +5%' };
          return `水面泛起涟漪，你感到力量增长：<b>${map[k]}</b>。`;
        } },
      { label: '装满瓶子（药水 +2）', fn() {
          const add = Math.min(2, R.potionCap - R.potions);
          R.potions += add;
          return add > 0 ? `你装满了 ${add} 瓶泉水（药水 +${add}）。` : '瓶子已经满了。';
        } },
    ]
  },
  {
    id: 'gambler', n: '赌徒的骸骨', i: '🎲',
    d: '一具骸骨仍保持着掷骰的姿势，桌上散落着金币和一张契约。',
    choices: [
      { label: '赌一把（50% 金币翻倍，50% 失去一半）', fn() {
          if (Math.random() < 0.5) { const g = R.gold; addGold(g); return `骰子停在六点！你的金币翻倍（+${g} 金币）。`; }
          const l = Math.round(R.gold * 0.5); R.gold -= l; return `骰子停在一点，骸骨发出了笑声（-${l} 金币）。`;
        } },
      { label: '拿走契约（获得一件随机物品，但受到伤害）', fn() {
          const it = genItem(R.depth, rollRarity(R.depth + 1));
          addItem(it);
          const d = Math.round(effStats().maxHp * 0.12);
          R.hp = Math.max(1, R.hp - d);
          return `契约灼烧着你的手掌，你获得了 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>，但损失了 ${d} 生命。`;
        } },
      { label: '安静地离开', fn() { return '你带着敬畏退开。骸骨的骰子仍在缓慢转动。'; } },
    ]
  },
  {
    id: 'smith', n: '无名的铁匠', i: '🔨',
    d: '一个没有脸的铁匠正捶打着什么。他指了指你身上的装备，又指了指炉火。',
    choices: [
      { label: '强化武器（消耗 60 金币，攻击 +4）', fn() {
          if (R.gold < 60) return '铁匠摇了摇头，继续捶打空气。';
          R.gold -= 60; R.bonusAtk += 4;
          return '锤声停了，你的武器泛出新的寒光（攻击 +4）。';
        } },
      { label: '强化护甲（消耗 60 金币，防御 +3）', fn() {
          if (R.gold < 60) return '铁匠摇了摇头，继续捶打空气。';
          R.gold -= 60; R.bonusDef += 3;
          return '护甲被敲得更厚实了一些（防御 +3）。';
        } },
      { label: '索取他的锤子（获得随机装备）', fn() {
          const it = genItem(R.depth, 'rare');
          addItem(it);
          return `他把锤子递给你——那不是锤子，而是 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>。`;
        } },
    ]
  },
  {
    id: 'mirror', n: '裂纹之镜', i: '🪞',
    d: '一面高及穹顶的镜子，裂纹中映出无数个你，每一个都在做不同的选择。',
    choices: [
      { label: '触碰镜面（复制一件装备）', fn() {
          const eq = Object.values(R.equip).flat().filter(Boolean);
          if (!eq.length) return '镜中的你一无所有，镜子黯淡下去。';
          const src = pick(eq);
          const copy = JSON.parse(JSON.stringify(src));
          copy.name = '镜像 · ' + src.name;
          addItem(copy);
          return `镜面泛起波纹，一件复制品落进你的怀中：<b style="color:${RARITY[copy.rarity].color}">${copy.name}</b>。`;
        } },
      { label: '问它“我会死吗”（获得暴击 +8%，最大生命 -10）', fn() {
          R.bonusCrit += 8; R.bonusHp -= 10; R.hp = Math.min(R.hp, effStats().maxHp);
          return '镜中的你笑了。你懂得了如何更快地杀死别人，也更容易死去（暴击率 +8%，最大生命 -10）。';
        } },
      { label: '打碎它（获得魂尘）', fn() {
          const dust = 12 + R.depth * 3;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          return `镜子碎裂，无数碎片化作魂尘（+${dust} 魂尘）。`;
        } },
    ]
  },
  {
    id: 'prisoner', n: '铁笼中的囚徒', i: '⛓️',
    d: '一个瘦骨嶙峋的人被锁在笼中，他恳求你放他出来，说他知道这层的秘密。',
    choices: [
      { label: '放他出来（他给你一条捷径：直接 +1 层）', fn() {
          const g = rnd(30, 70); addGold(g);
          R.skipFloor = true;
          return `他吻了你的手背，然后消失在阴影里。你发现了一条向下的裂隙（额外深入一层，+${g} 金币）。`;
        } },
      { label: '抢走他的东西（获得金币与物品）', fn() {
          const g = rnd(60, 120); addGold(g);
          const it = genItem(R.depth, 'rare');
          addItem(it);
          S.stats.evil = (S.stats.evil || 0) + 1;
          return `他在笼中尖叫。你拿走了 ${g} 金币与 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>。`;
        } },
      { label: '什么也不做', fn() { return '你继续向下走，身后的哀求声渐渐变成诅咒。'; } },
    ]
  },
  {
    id: 'shrine', n: '古老的石龛', i: '🗿',
    d: '石龛中供着一枚黑色的鳞片，触碰它的人据说能听见深渊的心跳。',
    choices: [
      { label: '献上血（-15% 当前生命，全属性小幅提升）', fn() {
          const d = Math.round(R.hp * 0.15);
          R.hp = Math.max(1, R.hp - d);
          R.bonusAtk += 2; R.bonusDef += 2; R.bonusHp += 12; R.bonusCrit += 3;
          return `鳞片吸走了你的血（-${d} 生命），你的身体变得更加强韧（攻击/防御/生命/暴击全面提升）。`;
        } },
      { label: '取走鳞片（获得一件传说物品，但被标记）', fn() {
          const it = genItem(R.depth, 'legend');
          addItem(it);
          R.marked = true;
          return `你获得了 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>……但同时，深渊也记住了你的气味。`;
        } },
      { label: '祈祷（回复少量生命，获得魂尘）', fn() {
          healPlayer(Math.round(effStats().maxHp * 0.2));
          const dust = 10 + R.depth * 2;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          return `你安静地祈祷，感到一丝平静（回血，+${dust} 魂尘）。`;
        } },
    ]
  },
  {
    id: 'caravan', n: '幽灵商队', i: '🐫',
    d: '一支半透明的商队缓缓经过，驼铃没有声音。他们愿意与你交易，只收金币。',
    choices: [
      { label: '购买一瓶神秘药剂（30 金币，随机效果）', fn() {
          if (R.gold < 30) return '商队的领队摇了摇头，继续前行。';
          R.gold -= 30;
          const roll = rnd(1, 3);
          if (roll === 1) { R.bonusAtk += 3; return '药剂灼烧喉咙，你感到力量上涌（攻击 +3）。'; }
          if (roll === 2) { R.bonusHp += 25; healPlayer(25); return '暖流扩散全身（最大生命 +25 并回复）。'; }
          R.potions = Math.min(R.potionCap, R.potions + 2); return '药剂化作两瓶普通药水（药水 +2）。';
        } },
      { label: '用一件装备交换金币', fn() {
          const eq = Object.values(R.equip).flat().filter(Boolean).sort((a, b) => a.price - b.price);
          if (!eq.length) return '你身上没有可以交换的东西。';
          const it = eq[0];
          const g = Math.round(it.price * 0.8);
          removeEquip(it);
          addGold(g);
          return `你卖掉了 <b>${it.name}</b>，换来 ${g} 金币。`;
        } },
      { label: '目送他们远去', fn() { return '驼铃声始终没有响起，商队消失在地平线下。'; } },
    ]
  },
  {
    id: 'fire', n: '不灭的篝火', i: '🔥',
    d: '一堆没有柴薪的篝火在燃烧。火焰里有面孔在对你微笑。',
    choices: [
      { label: '取暖（回复 30% 生命）', fn() {
          healPlayer(Math.round(effStats().maxHp * 0.3));
          return '火焰温柔地包裹着你，伤口结痂（回复生命）。';
        } },
      { label: '把手伸进火中（攻 +5，受到火焰伤害）', fn() {
          R.bonusAtk += 5;
          const d = Math.round(effStats().maxHp * 0.15);
          R.hp = Math.max(1, R.hp - d);
          return `火焰咬住你的手臂（-${d} 生命），但你的力量被点燃了（攻击 +5）。`;
        } },
      { label: '熄灭它（获得魂尘，失去治疗机会）', fn() {
          const dust = 15 + R.depth * 3;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          return `火焰熄灭时发出叹息（+${dust} 魂尘）。`;
        } },
    ]
  },
  {
    id: 'library', n: '沉没的图书馆', i: '📚',
    d: '书架浸泡在黑水中，只有几卷书还完好。书页上的字迹在蠕动。',
    choices: [
      { label: '研读战争之卷（攻击 +3，暴击 +3%）', fn() {
          R.bonusAtk += 3; R.bonusCrit += 3;
          return '你读完了三章，眼睛渗血，但出刀更快了（攻击 +3，暴击 +3%）。';
        } },
      { label: '研读守护之卷（防御 +3，最大生命 +15）', fn() {
          R.bonusDef += 3; R.bonusHp += 15; healPlayer(15);
          return '你学会了如何让骨骼承受更多（防御 +3，最大生命 +15）。';
        } },
      { label: '把书全部烧掉（获得大量魂尘，但失去成长）', fn() {
          const dust = 25 + R.depth * 4;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          return `书页在火中尖叫（+${dust} 魂尘）。知识的重量化作尘埃。`;
        } },
    ]
  },
  {
    id: 'demon', n: '契约之魔', i: '👺',
    d: '一个由烟雾构成的轮廓向你伸出手：“我可以给你力量，只要一点点代价。”',
    choices: [
      { label: '签下契约（攻击 +8，最大生命 -20）', fn() {
          R.bonusAtk += 8; R.bonusHp -= 20; R.hp = Math.min(R.hp, effStats().maxHp);
          if (R.hp <= 0) R.hp = 1;
          return '契约以血签署（攻击 +8，最大生命 -20）。';
        } },
      { label: '签下契约（获得 200 金币，扣除 15% 生命上限）', fn() {
          addGold(200);
          const loss = Math.round(effStats().maxHp * 0.15);
          R.bonusHp -= loss; R.hp = Math.min(R.hp, effStats().maxHp);
          if (R.hp <= 0) R.hp = 1;
          return `金币凭空出现（+200），代价是 ${loss} 点生命上限。`;
        } },
      { label: '拒绝（获得魂尘，因为它尊敬你的意志）', fn() {
          const dust = 20 + R.depth * 3;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          return `它笑了，然后散去（+${dust} 魂尘）。`;
        } },
    ]
  },
];

/* ---------------- 成就 ---------------- */
const ACHIEVEMENTS = [
  { id: 'first_run',  n: '初次坠落', d: '完成第一次冒险（无论成败）', i: '🌱', r: 8, c: s => s.stats.runs >= 1 },
  { id: 'depth5',     n: '深潜者', d: '抵达第 5 层', i: '⛏️', r: 15, c: s => s.stats.maxDepth >= 5 },
  { id: 'depth10',    n: '无光之处', d: '抵达第 10 层', i: '🌑', r: 30, c: s => s.stats.maxDepth >= 10 },
  { id: 'boss1',      n: '地窟征服者', d: '击败地窟领主 · 格拉姆', i: '🐗', r: 20, c: s => s.stats.bosses.boss1 >= 1 },
  { id: 'boss2',      n: '影之猎手', d: '击败幽影君主 · 维尔', i: '🧛', r: 30, c: s => s.stats.bosses.boss2 >= 1 },
  { id: 'boss3',      n: '熔火克星', d: '击败熔火巨兽 · 伊格尼斯', i: '🐉', r: 40, c: s => s.stats.bosses.boss3 >= 1 },
  { id: 'boss4',      n: '深渊之主', d: '击败深渊之主 · 涅赫', i: '😈', r: 80, c: s => s.stats.bosses.boss4 >= 1 },
  { id: 'win',        n: '破晓者', d: '首次完整通关深渊', i: '🌅', r: 100, c: s => s.stats.wins >= 1 },
  { id: 'kill50',     n: '击溃者', d: '累计击杀 50 个敌人', i: '⚔️', r: 18, c: s => s.stats.kills >= 50 },
  { id: 'kill200',    n: '屠戮者', d: '累计击杀 200 个敌人', i: '💀', r: 35, c: s => s.stats.kills >= 200 },
  { id: 'kill500',    n: '深渊收割者', d: '累计击杀 500 个敌人', i: '☠️', r: 70, c: s => s.stats.kills >= 500 },
  { id: 'rich',       n: '富甲一方', d: '单局持有 800 金币', i: '💰', r: 25, c: s => s.stats.maxGold >= 800 },
  { id: 'collector',  n: '收藏家', d: '累计购买 30 件商品', i: '🛒', r: 25, c: s => s.stats.buys >= 30 },
  { id: 'legendary',  n: '神话装备', d: '装备一件传说品质物品', i: '🌟', r: 30, c: s => s.stats.legendEquipped >= 1 },
  { id: 'fullset',    n: '全身武装', d: '同时装备三件装备', i: '🎽', r: 15, c: s => s.stats.fullSet >= 1 },
  { id: 'crit100',    n: '百步穿杨', d: '累计暴击 100 次', i: '🎯', r: 22, c: s => s.stats.crits >= 100 },
  { id: 'flawless',   n: '毫发无伤', d: '无伤击败一个精英敌人', i: '🛡️', r: 30, c: s => s.stats.flawlessElite >= 1 },
  { id: 'potions',    n: '药罐子', d: '累计使用 40 瓶药水', i: '🧪', r: 20, c: s => s.stats.potionsUsed >= 40 },
  { id: 'skills',     n: '技能大师', d: '累计释放 150 次技能', i: '📖', r: 25, c: s => s.stats.skillUses >= 150 },
  { id: 'bigHit',     n: '一击必杀', d: '单次造成 250 点伤害', i: '💥', r: 28, c: s => s.stats.bestHit >= 250 },
  { id: 'healer',     n: '生命之泉', d: '累计治疗 1500 点生命', i: '💚', r: 20, c: s => s.stats.healed >= 1500 },
  { id: 'explorer',   n: '探索者', d: '累计经历 20 个事件', i: '🧭', r: 22, c: s => s.stats.events >= 20 },
  { id: 'death10',    n: '与死共舞', d: '累计死亡 10 次', i: '⚰️', r: 18, c: s => s.stats.deaths >= 10 },
  { id: 'allboss',    n: '深渊终结', d: '击败全部四位首领', i: '👑', r: 90, c: s => s.stats.bosses.boss1 && s.stats.bosses.boss2 && s.stats.bosses.boss3 && s.stats.bosses.boss4 },
  { id: 'dust500',    n: '灵魂富翁', d: '累计获得 500 魂尘', i: '✨', r: 40, c: s => s.stats.dustEarned >= 500 },
  { id: 'nopotion',   n: '纯粹主义者', d: '通关一局且从未使用药水', i: '🚫', r: 45, c: s => s.stats.winsNoPotion >= 1 },
  { id: 'ng1',        n: '轮回者', d: '开启轮回难度 1', i: '🔄', r: 45, c: s => s.meta.ngPlus >= 1 },
  { id: 'elite20',    n: '精英猎手', d: '累计击杀 20 个精英敌人', i: '🔱', r: 30, c: s => s.stats.eliteKills >= 20 },
  { id: 'items30',    n: '拾荒之王', d: '累计拾取 30 件装备', i: '🎁', r: 25, c: s => s.stats.itemsFound >= 30 },
  /* —— 极限模式（深红深渊） —— */
  { id: 'depth14',    n: '触界者', d: '抵达第 14 层', i: '🔥', r: 45, c: s => s.stats.maxDepth >= 14 },
  { id: 'depth20',    n: '极限之地', d: '抵达第 20 层', i: '🌋', r: 80, c: s => s.stats.maxDepth >= 20 },
  { id: 'extreme_clear', n: '极限征服者', d: '完整通过一次极限模式', i: '💥', r: 150, c: s => s.stats.extremeWins >= 1 },
  { id: 'xelite10',   n: '极限猎人', d: '在极限模式中击杀 10 个精英敌人', i: '🔺', r: 50, c: s => s.stats.extremeEliteKills >= 10 },
  { id: 'xboss1',     n: '裂痕终结', d: '击败深渊裂痕 · 卡俄斯', i: '🌀', r: 90, c: s => s.stats.bosses.xboss1 >= 1 },
  { id: 'xboss2',     n: '无光终焉', d: '击败无光之祖 · 乌尔', i: '🕳️', r: 110, c: s => s.stats.bosses.xboss2 >= 1 },
  { id: 'xboss3',     n: '极限主宰', d: '击败极限之主 · 绝', i: '👑', r: 160, c: s => s.stats.bosses.xboss3 >= 1 },
  /* —— 数值与轮回极限 —— */
  { id: 'ng10',        n: '轮回十重', d: '通关轮回难度 10', i: '🔟', r: 80,  c: s => (s.stats.maxNgClear || 0) >= 10 },
  { id: 'ng15',        n: '轮回终焉', d: '通关轮回难度 15（最高）', i: '♾️', r: 160, c: s => (s.stats.maxNgClear || 0) >= 15 },
  { id: 'items15',     n: '行囊初满', d: '单局持有 15 件装备并通关', i: '🎒', r: 50,  c: s => (s.stats.maxItemsRun || 0) >= 15 },
  { id: 'items30',     n: '装备收藏家', d: '单局持有 30 件装备并通关', i: '📦', r: 80,  c: s => (s.stats.maxItemsRun || 0) >= 30 },
  { id: 'items50',     n: '囤积狂魔', d: '单局持有 50 件装备并通关', i: '🗃️', r: 120, c: s => (s.stats.maxItemsRun || 0) >= 50 },
  { id: 'atk500',      n: '千钧之力', d: '单局攻击力 ≥ 500 并通关', i: '💪', r: 50,  c: s => (s.stats.maxAtkRun || 0) >= 500 },
  { id: 'atk1000',     n: '毁灭之力', d: '单局攻击力 ≥ 1000 并通关', i: '⚡', r: 90,  c: s => (s.stats.maxAtkRun || 0) >= 1000 },
  { id: 'def200',      n: '铜墙铁壁', d: '单局防御力 ≥ 200 并通关', i: '🛡️', r: 50,  c: s => (s.stats.maxDefRun || 0) >= 200 },
  { id: 'def500',      n: '不动如山', d: '单局防御力 ≥ 500 并通关', i: '🏰', r: 90,  c: s => (s.stats.maxDefRun || 0) >= 500 },
  { id: 'critdmg200',  n: '暴击精通', d: '单局暴伤率 ≥ 200% 并通关', i: '🎯', r: 50,  c: s => (s.stats.maxCritDmgRun || 0) >= 200 },
  { id: 'critdmg500',  n: '致命一击', d: '单局暴伤率 ≥ 500% 并通关', i: '💥', r: 90,  c: s => (s.stats.maxCritDmgRun || 0) >= 500 },
  { id: 'critdmg1000', n: '湮灭暴击', d: '单局暴伤率 ≥ 1000% 并通关', i: '🌟', r: 130, c: s => (s.stats.maxCritDmgRun || 0) >= 1000 },
  { id: 'hp1000',      n: '生命强化', d: '单局生命值 ≥ 1000 并通关', i: '❤️', r: 50,  c: s => (s.stats.maxHpRun || 0) >= 1000 },
  { id: 'hp2000',      n: '生命不息', d: '单局生命值 ≥ 2000 并通关', i: '💖', r: 90,  c: s => (s.stats.maxHpRun || 0) >= 2000 },
  { id: 'hp3000',      n: '不朽之躯', d: '单局生命值 ≥ 3000 并通关', i: '💗', r: 130, c: s => (s.stats.maxHpRun || 0) >= 3000 },
];

/* ---------------- 永久升级 ---------------- */
const UPGRADES = [
  { id: 'hp',     n: '坚韧之魂', d: '最大生命 +9',       max: 25, i: '❤️', cost: l => 8 + l * 6 },
  { id: 'atk',    n: '力量之魂', d: '攻击 +1.5',         max: 25, i: '⚔️', cost: l => 10 + l * 8 },
  { id: 'def',    n: '守护之魂', d: '防御 +1',           max: 25, i: '🛡️', cost: l => 10 + l * 8 },
  { id: 'crit',   n: '敏锐之魂', d: '暴击率 +3%',        max: 12, i: '🎯', cost: l => 16 + l * 12 },
  { id: 'gold',   n: '财富之魂', d: '金币获取 +12%',     max: 10, i: '💰', cost: l => 14 + l * 10 },
  { id: 'dust',   n: '共鸣之魂', d: '魂尘获取 +10%',     max: 10, i: '✨', cost: l => 18 + l * 14 },
  { id: 'potion', n: '行囊扩容', d: '药水携带上限 +1',   max: 4,  i: '🧪', cost: l => 30 + l * 25 },
  { id: 'memory', n: '远古记忆', d: '开局多一个随机技能', max: 3,  i: '📜', cost: l => 45 + l * 45 },
  { id: 'revive', n: '不灭之魂', d: '每局可复活一次',     max: 1,  i: '🕯️', cost: l => 150 },
];

/* ---------------- 开局增益（全部魂尘强化满级后解锁） ---------------- */
const BOON_SKILL_MAX = 3;   // 最多选择 3 个技能
const BOON_BUFF_MAX = 2;    // 最多选择 2 项属性增益
// 技能价格按强度（稀有度）递增
const BOON_SKILL_COST = { common: 50, rare: 110, epic: 220, legend: 400 };
// 属性增益：vals 对应 基础 / + / ++ 三档数值，costs 对应三档魂尘消耗
const BOON_BUFFS = [
  { id: 'hp',   n: '生命增幅', i: '❤️', key: '生命',   unit: '',  vals: [100, 140, 200], costs: [40, 90, 220] },
  { id: 'atk',  n: '力量增幅', i: '⚔️', key: '攻击',   unit: '',  vals: [15, 20, 30],    costs: [60, 150, 380] },
  { id: 'def',  n: '守御增幅', i: '🛡️', key: '防御',   unit: '',  vals: [15, 20, 30],    costs: [60, 150, 380] },
  { id: 'crit', n: '锐意增幅', i: '🎯', key: '暴击率', unit: '%', vals: [15, 20, 30],    costs: [80, 190, 460] },
];
function allUpgradesMaxed() {
  const u = S.meta.upgrades || {};
  return UPGRADES.every(up => (u[up.id] || 0) >= up.max);
}
function boonBuffCount(sel) {
  return BOON_BUFFS.filter(b => (sel.buffs[b.id] || 0) > 0).length;
}
function preRunCalc(sel) {
  let cost = 0;
  sel.skills.forEach(id => { cost += BOON_SKILL_COST[SKILLS[id].rar] || 100; });
  BOON_BUFFS.forEach(b => {
    const t = sel.buffs[b.id] || 0;
    if (t > 0) cost += b.costs[t - 1];
  });
  return cost;
}

/* ---------------- 轮回难度 ---------------- */
const MAX_NG = 15;
const NG_NAMES = {
  0: '初临深渊',
  1: '轮回 I', 2: '轮回 II', 3: '轮回 III', 4: '轮回 IV', 5: '轮回 V',
  6: '轮回 VI', 7: '轮回 VII', 8: '轮回 VIII', 9: '轮回 IX', 10: '轮回 X',
  11: '轮回 XI', 12: '轮回 XII', 13: '轮回 XIII', 14: '轮回 XIV', 15: '轮回 XV',
};
function ngInfo(lv) {
  lv = Math.max(0, Math.min(MAX_NG, lv | 0));
  const hp = lv * 0.35;
  const atk = lv * 0.25;
  const score = 1 + lv * 0.2;
  const dust = 1 + lv * 0.25;
  const effects = [];
  if (lv === 0) {
    effects.push('敌人为基础数值');
    effects.push('魂尘奖励 ×1.00');
    effects.push('得分倍率 ×1.0');
  } else {
    effects.push(`敌人生命 +${Math.round(hp * 100)}%`);
    effects.push(`敌人攻击 +${Math.round(atk * 100)}%`);
    effects.push(`魂尘奖励 ×${dust.toFixed(2)}`);
    effects.push(`得分倍率 ×${score.toFixed(1)}`);
  }
  return { lv, name: NG_NAMES[lv] || `轮回 ${lv}`, effects, hp, atk, score, dust };
}

/* ---------------- 元成就（深渊统治者） ---------------- */
const META_ACHIEVEMENTS = [
  {
    id: 'abyss_ruler', n: '深渊统治者', d: `解锁全部 ${ACHIEVEMENTS.length} 项成就，加冕为深渊之主。`,
    i: '👑', r: 200,
    buff: { atkPct: 0.10, defPct: 0.10, critAdd: 10, regen: 30 },
  },
];

/* ---------------- 战斗日志缓存 ---------------- */
const MAX_LOG = 60;

/* =============== NEXT SCRIPT BLOCK =============== */

/* ============================================================
   引擎层：存档 / 属性 / 装备 / 战斗
   ============================================================ */

let S = null;   // 全局档案
let R = null;   // 当前局
let B = null;   // 当前战斗
let hubTab = 'sanctum';

/* ---------------- 档案 ---------------- */
function defaultState() {
  return {
    meta: {
      soulDust: 0, ngPlus: 0,
      upgrades: { hp: 0, atk: 0, def: 0, crit: 0, gold: 0, dust: 0, potion: 0, memory: 0, revive: 0 },
      extreme: false, passWeekly: null,
    },
    stats: {
      runs: 0, wins: 0, deaths: 0, kills: 0, eliteKills: 0,
      bosses: { boss1: 0, boss2: 0, boss3: 0, boss4: 0, xboss1: 0, xboss2: 0, xboss3: 0 },
      goldEarned: 0, maxGold: 0, buys: 0, potionsUsed: 0, skillUses: 0, crits: 0,
      bestHit: 0, healed: 0, events: 0, itemsFound: 0, legendEquipped: 0, fullSet: 0,
      flawlessElite: 0, dustEarned: 0, winsNoPotion: 0, maxDepth: 0, rooms: 0, evil: 0,
      damageDealt: 0, battles: 0, extremeWins: 0, extremeEliteKills: 0,
      maxNgClear: 0, maxItemsRun: 0, maxAtkRun: 0, maxDefRun: 0, maxCritDmgRun: 0, maxHpRun: 0,
    },
    ach: {},
    codex: {},
    settings: { sound: true, fps: 'auto', motion: 'all' },
  };
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState();
    const d = JSON.parse(raw);
    const base = defaultState();
    // 深合并，避免版本升级缺字段
    const merged = Object.assign(base, d);
    merged.meta = Object.assign(base.meta, d.meta || {});
    merged.meta.upgrades = Object.assign(base.meta.upgrades, (d.meta && d.meta.upgrades) || {});
    merged.stats = Object.assign(base.stats, d.stats || {});
    merged.stats.bosses = Object.assign(base.stats.bosses, (d.stats && d.stats.bosses) || {});
    merged.settings = Object.assign(base.settings, d.settings || {});
    merged.ach = d.ach || {};
    merged.codex = d.codex || {};
    merged.meta.ngPlus = Math.min(MAX_NG, merged.meta.ngPlus || 0);
    return merged;
  } catch (e) { console.warn('存档读取失败', e); return defaultState(); }
}

function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { console.warn('存档失败', e); }
  syncLauncherData();
}

/* ---------------- 启动器联动：成就 / 统计同步（仅在变化时写入） ---------------- */
let lastSyncSig = '';
function syncLauncherData(force) {
  try {
    const ids = Object.keys(S.ach || {}).filter(k => S.ach[k]).sort();
    const sig = ids.join(',') + '|' + (S.stats.runs || 0) + '|' + (S.stats.maxDepth || 0);
    if (!force && sig === lastSyncSig) return;
    lastSyncSig = sig;

    const cur = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!cur.username) return;
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const idx = users.findIndex(u => u.username === cur.username);
    if (idx < 0) return;
    const u = users[idx];
    if (!u.gameData) u.gameData = {};
    // 与启动器侧已有列表取并集，避免覆盖启动器（开发者模式）手动启用的成就
    const prevIds = Array.isArray(u.gameData.abyssAchievements) ? u.gameData.abyssAchievements : [];
    u.gameData.abyssAchievements = Array.from(new Set(prevIds.concat(ids)));
    u.gameData.abyssGamesPlayed = S.stats.runs || 0;
    u.gameData.abyssMaxDepth = S.stats.maxDepth || 0;
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  } catch (e) { console.warn('启动器数据同步失败', e); }
}

/* ---------------- 动效设置 ---------------- */
const MOTION_OPTIONS = [['all', '显示所有动效'], ['partial', '显示部分动效'], ['none', '关闭动效']];
function applyMotion() {
  const m = (S && S.settings && S.settings.motion) || 'all';
  document.body.dataset.motion = (m === 'partial' || m === 'none') ? m : 'all';
}
function setMotion(v) {
  S.settings.motion = (v === 'partial' || v === 'none') ? v : 'all';
  saveGame();
  sfx('click');
  applyMotion();
  renderHub();
  const label = (MOTION_OPTIONS.find(o => o[0] === S.settings.motion) || MOTION_OPTIONS[0])[1];
  toast('动效设置已切换为「' + label + '」', '', 'jade');
}

/* ---------------- 开发者模式（与启动器 devModeData 同源） ---------------- */
function isDevModeEnabled() {
  try {
    const cur = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const data = JSON.parse(localStorage.getItem('devModeData') || '{}');
    if (cur.username && data[cur.username] && data[cur.username].enabled) return true;
    if (data['__global__'] && data['__global__'].enabled) return true;
  } catch (e) {}
  return false;
}

function devUnlockAllAch() {
  ACHIEVEMENTS.forEach(a => { if (!S.ach[a.id]) S.ach[a.id] = Date.now(); });
  checkAch();
  saveGame();
  renderHub();
  toast('已解锁全部成就（含「深渊统治者」）', '', 'jade');
}

function devUnlockAllCodex() {
  const all = Object.assign({}, ENEMIES, BOSSES);
  Object.keys(all).forEach(k => { S.codex[k] = Math.max(S.codex[k] || 0, 1); });
  saveGame();
  renderHub();
  toast('已解锁全部图鉴条目', '', 'jade');
}

function devUnlockAllNg() {
  S.meta.ngPlus = MAX_NG;
  saveGame();
  renderHub();
  toast('已解锁全部轮回难度（1 - ' + MAX_NG + '）', '', 'jade');
}

let devInputValue = '';
function devAskNumber(title, desc, placeholder, onConfirm) {
  devInputValue = '';
  modal({
    title, sub: 'DEVELOPER TOOL', size: 'dev-modal',
    body: `<div class="small dim" style="margin-bottom:10px;line-height:1.8">${desc}</div>
      <input id="dev-num" class="cx-select" type="number" step="any" placeholder="${placeholder}" style="width:100%;padding:11px 14px">
      <div class="small dim" style="margin-top:10px">输入后点击「应用」，仅对当前浏览器存档生效。</div>`,
    buttons: [
      { label: '取消', cls: 'btn-ghost' },
      { label: '应用', cls: 'btn-primary', fn: () => {
          const v = parseFloat(devInputValue);
          if (!isFinite(v)) { toast('请输入有效的数值', '', 'warning'); return; }
          onConfirm(v);
        } },
    ],
  });
  const inp = $('#dev-num');
  if (inp) {
    inp.oninput = () => { devInputValue = inp.value; };
    setTimeout(() => inp.focus(), 60);
  }
}

function devSetDust() {
  devAskNumber('设置自定义魂尘', '当前魂尘：' + fmt(S.meta.soulDust) + '。输入新的魂尘数量。', '例如 9999', v => {
    S.meta.soulDust = Math.max(0, Math.round(v));
    saveGame();
    renderHub();
    renderTopbar();
    toast('魂尘已设置为 ' + fmt(S.meta.soulDust), '', 'jade');
  });
}

const DEV_RUN_STATS = {
  hp:    { label: '自定义血量',  tip: '新一局开始时的最大生命值（留空恢复默认）', min: 1,   max: 999999 },
  atk:   { label: '自定义伤害',  tip: '新一局开始时的攻击力（留空恢复默认）',     min: 0,   max: 99999 },
  def:   { label: '自定义防御',  tip: '新一局开始时的防御力（留空恢复默认）',     min: 0,   max: 99999 },
  crit:  { label: '自定义暴击率', tip: '新一局开始时的暴击率百分比（0 - 100，留空恢复默认）', min: 0, max: 100 },
};

function devSetRunStat(key) {
  const conf = DEV_RUN_STATS[key];
  if (!conf) return;
  const cur = S.meta.dev && S.meta.dev[key] != null ? S.meta.dev[key] : '';
  devAskNumber('设置' + conf.label, conf.tip + '（将在新一局中启用）', String(cur || ''), v => {
    if (!S.meta.dev) S.meta.dev = {};
    S.meta.dev[key] = clamp(v, conf.min, conf.max);
    saveGame();
    renderHub();
    toast(conf.label + '已设置为 ' + S.meta.dev[key] + '（新一局生效）', '', 'jade');
  });
}

function devClearRunStats() {
  if (S.meta) delete S.meta.dev;
  saveGame();
  renderHub();
  toast('已清除自定义数值，恢复默认属性', '', 'jade');
}

/* ---------------- 音效 ---------------- */
let AC = null;
function audioCtx() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  return AC;
}
function sfx(type) {
  if (!S || !S.settings.sound) return;
  const ac = audioCtx(); if (!ac) return;
  if (ac.state === 'suspended') ac.resume();
  const now = ac.currentTime;
  const conf = {
    click: { f: 420, f2: 620, d: 0.06, g: 0.035, w: 'triangle' },
    hit:   { f: 180, f2: 70, d: 0.13, g: 0.06, w: 'square' },
    crit:  { f: 320, f2: 90, d: 0.22, g: 0.075, w: 'sawtooth' },
    heal:  { f: 520, f2: 880, d: 0.24, g: 0.045, w: 'sine' },
    buy:   { f: 660, f2: 990, d: 0.14, g: 0.05, w: 'triangle' },
    hurt:  { f: 120, f2: 48, d: 0.2, g: 0.06, w: 'sawtooth' },
    win:   { f: 523, f2: 784, d: 0.34, g: 0.06, w: 'sine' },
    lose:  { f: 300, f2: 80, d: 0.6, g: 0.06, w: 'sine' },
    ach:   { f: 880, f2: 1320, d: 0.3, g: 0.05, w: 'triangle' },
  }[type];
  if (!conf) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = conf.w;
  o.frequency.setValueAtTime(conf.f, now);
  o.frequency.exponentialRampToValueAtTime(Math.max(30, conf.f2), now + conf.d);
  g.gain.setValueAtTime(conf.g, now);
  g.gain.exponentialRampToValueAtTime(0.0008, now + conf.d);
  o.connect(g).connect(ac.destination);
  o.start(now); o.stop(now + conf.d + 0.02);
}

/* ---------------- 属性 ---------------- */
function hasRulerBuff() { return !!(S && S.ach && S.ach['abyss_ruler']); }
function rulerBuff() { return hasRulerBuff() ? META_ACHIEVEMENTS[0].buff : null; }

function equipTotals() {
  const t = { atk: 0, def: 0, hp: 0, crit: 0, critDmg: 0, lifesteal: 0, gold: 0 };
  if (!R) return t;
  for (const k in R.equip) {
    const arr = R.equip[k];
    if (Array.isArray(arr)) for (const it of arr) {
      if (it && it.stats) for (const s in it.stats) t[s] = (t[s] || 0) + it.stats[s];
    }
  }
  return t;
}

function effStats() {
  const u = S.meta.upgrades, eq = equipTotals();
  const bonusHp = R ? R.bonusHp : 0, bonusAtk = R ? R.bonusAtk : 0;
  const bonusDef = R ? R.bonusDef : 0, bonusCrit = R ? R.bonusCrit : 0;
  const dv = (R && R.dev) ? R.dev : null;
  const rb = rulerBuff();
  const atkMul = rb ? (1 + rb.atkPct) : 1;
  const defMul = rb ? (1 + rb.defPct) : 1;
  const critAdd = rb ? rb.critAdd : 0;
  const hasHp = dv && dv.hp != null, hasAtk = dv && dv.atk != null;
  const hasDef = dv && dv.def != null, hasCrit = dv && dv.crit != null;
  return {
    maxHp: Math.max(1, Math.round(hasHp ? dv.hp : (100 + u.hp * 10 + eq.hp + bonusHp))),
    atk: (hasAtk ? dv.atk : (14 + u.atk * 1.5 + eq.atk + bonusAtk)) * atkMul,
    def: (hasDef ? dv.def : (3 + u.def * 1 + eq.def + bonusDef)) * defMul,
    crit: clamp((hasCrit ? dv.crit : (5 + u.crit * 3 + eq.crit + bonusCrit)) + critAdd, 0, 100),
    critDmg: 150 + eq.critDmg,
    lifesteal: eq.lifesteal,
    goldFind: u.gold * 12 + eq.gold,
  };
}

/* ---------------- 单局峰值追踪（用于数值成就） ---------------- */
function trackRunPeaks() {
  if (!R) return;
  const itemCount = (R.equip.weapon.length || 0) + (R.equip.armor.length || 0) + (R.equip.trinket.length || 0);
  if (itemCount > R.maxItems) R.maxItems = itemCount;
  const s = effStats();
  const atk = Math.round(s.atk), def = Math.round(s.def), critDmg = Math.round(s.critDmg);
  if (atk > R.maxAtk) R.maxAtk = atk;
  if (def > R.maxDef) R.maxDef = def;
  if (critDmg > R.maxCritDmg) R.maxCritDmg = critDmg;
  if (s.maxHp > R.maxHp) R.maxHp = s.maxHp;
}

/* ---------------- 装备生成 ---------------- */
function rollRarity(depth, boost = 0) {
  const w = [
    ['common', RARITY.common.weight],
    ['rare', RARITY.rare.weight + depth * 1.6 + boost * 6],
    ['epic', RARITY.epic.weight + depth * 0.7 + boost * 3],
    ['legend', RARITY.legend.weight + depth * 0.22 + boost * 1.2],
  ];
  return wpick(w);
}

function genItem(depth, forceRarity) {
  const base = pick(ITEM_BASES);
  const rarity = forceRarity || rollRarity(depth);
  const rr = RARITY[rarity];
  const scale = rr.mult * (1 + (depth - 1) * 0.16);
  const stats = {};
  for (const k in base.s) stats[k] = Math.round(base.s[k] * scale * 10) / 10;

  const affixCount = rr.affix;
  const pool = shuffle(AFFIXES);
  const used = new Set();
  let prefix = '', suffix = '';
  for (let i = 0; i < affixCount && i < pool.length; i++) {
    const a = pool[i];
    if (used.has(a.k)) continue;
    used.add(a.k);
    const v = Math.round((rnd(a.r[0], a.r[1]) * (0.85 + (depth - 1) * 0.06)) * 10) / 10;
    stats[a.k] = (stats[a.k] || 0) + v;
    if (!suffix) suffix = SUFFIXES[a.n.length % SUFFIXES.length];
  }
  if (rarity === 'epic' || rarity === 'legend') prefix = pick(PREFIXES);
  const name = (prefix ? prefix : '') + base.n + (suffix || '');
  const score = (stats.atk || 0) * 3 + (stats.def || 0) * 2.5 + (stats.hp || 0) * 0.5 +
    (stats.crit || 0) * 1.2 + (stats.critDmg || 0) * 0.4 + (stats.lifesteal || 0) * 2 + (stats.gold || 0) * 0.2;
  const price = Math.round((16 + score * 0.62) * rr.mult * (1 + (depth - 1) * 0.06));

  return {
    uid: 'it' + Date.now() + Math.floor(Math.random() * 9999),
    name, ico: base.ico, slot: base.slot, rarity, stats, price,
    score: Math.round(score),
  };
}

function statLines(stats) {
  return Object.keys(stats).map(k => {
    const v = stats[k];
    const isPct = (k === 'crit' || k === 'critDmg' || k === 'lifesteal' || k === 'gold');
    return `${STAT_NAME[k] || k} +${Math.round(v * 10) / 10}${isPct ? '%' : ''}`;
  });
}

function addItem(it) {
  S.stats.itemsFound++;
  offerItem(it);
}

/* ---------------- 金币 / 生命 ---------------- */
function addGold(n) {
  n = Math.round(n);
  if (n > 0 && R && R.extreme) n = Math.round(n * 1.6);
  R.gold += n;
  if (n > 0) { S.stats.goldEarned += n; S.stats.maxGold = Math.max(S.stats.maxGold, R.gold); }
}

function healPlayer(n) {
  const s = effStats();
  const before = R.hp;
  R.hp = Math.min(s.maxHp, R.hp + Math.round(n));
  const real = R.hp - before;
  if (real > 0) { S.stats.healed += real; floatDmg(real, false, 'player', '#7ef0bb', '+'); sfx('heal'); }
  return real;
}

/* ---------------- Buff ---------------- */
const BUFF_INFO = {
  atkUp:  { n: '攻击强化', good: 1 },
  defUp:  { n: '防御强化', good: 1 },
  shield: { n: '护盾',     good: 1 },
  regen:  { n: '再生',     good: 1 },
  weak:   { n: '虚弱',     good: 0 },
  vuln:   { n: '易伤',     good: 0 },
  poison: { n: '中毒',     good: 0 },
  burn:   { n: '灼烧',     good: 0 },
  stun:   { n: '眩晕',     good: 0 },
};
function addBuff(store, key, turns, value) {
  if (!store) return;
  if (store[key]) {
    store[key].t = Math.max(store[key].t, turns);
    store[key].v = Math.max(store[key].v, value);
  } else {
    store[key] = { t: turns, v: value };
  }
}
function buffVal(store, key) { return store && store[key] ? store[key].v : 0; }

function chipHtml(store) {
  if (!store) return '';
  const out = [];
  for (const k in store) {
    const info = BUFF_INFO[k] || { n: k, good: 1 };
    const b = store[k];
    let txt = info.n;
    if (k === 'shield') txt += ' ' + Math.round(b.v);
    else if (k === 'poison' || k === 'burn') txt += ' ' + Math.round(b.v);
    else if (k === 'weak' || k === 'vuln' || k === 'atkUp' || k === 'defUp') txt += ' ' + Math.round(b.v * 100) + '%';
    if (k !== 'shield') txt += ' · ' + b.t;
    out.push(`<span class="chip ${info.good ? 'good' : 'bad'}">${txt}</span>`);
  }
  return out.join('');
}

/* ---------------- 伤害结算 ---------------- */
function mitigation(def) { return def / (def + 55); }

function dmgFormula(atk, def, crit, critDmg, mult) {
  let base = atk * mult * (0.9 + Math.random() * 0.2) * (1 - mitigation(def));
  base = Math.max(1, base);
  const isCrit = Math.random() * 100 < crit;
  if (isCrit) base *= critDmg / 100;
  return { dmg: Math.max(1, Math.round(base)), isCrit };
}

function hitEnemy(mult = 1, opt = {}) {
  if (!B || B.over) return 0;
  const s = effStats();
  const atk = s.atk * (1 + buffVal(B.pBuffs, 'atkUp')) * (1 - buffVal(B.pBuffs, 'weak'));
  let def = B.enemy.def * (1 + buffVal(B.eBuffs, 'defUp'));
  if (opt.trueDmg) def = 0;
  const res = dmgFormula(atk, def, s.crit + (opt.critBonus || 0), s.critDmg, mult);
  let dmg = res.dmg;
  if (B.eBuffs.vuln) dmg = Math.round(dmg * 1.35);

  // 敌方护盾吸收
  const sh = B.eBuffs.shield;
  if (sh && sh.v > 0 && !opt.trueDmg) {
    const absorb = Math.min(sh.v, dmg);
    sh.v -= absorb; dmg -= absorb;
    if (sh.v <= 0) delete B.eBuffs.shield;
    if (absorb > 0) logMsg(`护盾吸收了 ${Math.round(absorb)} 点伤害。`, 'sys');
  }
  dmg = Math.max(0, Math.round(dmg));
  B.enemy.hp -= dmg;
  B.totalDealt = (B.totalDealt || 0) + dmg;
  S.stats.damageDealt += dmg;
  if (dmg > S.stats.bestHit) S.stats.bestHit = dmg;
  if (res.isCrit) { S.stats.crits++; sfx('crit'); } else sfx('hit');
  floatDmg(dmg || '格挡', res.isCrit, 'enemy');
  if (res.isCrit) logMsg(`暴击！造成 ${dmg} 点伤害。`, 'player');

  // 吸血
  if (s.lifesteal > 0 && dmg > 0) {
    const h = Math.round(dmg * s.lifesteal / 100);
    if (h > 0) { R.hp = Math.min(s.maxHp, R.hp + h); floatDmg(h, false, 'player', '#7ef0bb', '+'); }
  }
  if (B.enemy.hp <= 0) { B.enemy.hp = 0; }
  return dmg;
}

function damagePlayer(raw, mult, label) {
  if (!B) return 0;
  const s = effStats();
  const def = s.def * (1 + buffVal(B.pBuffs, 'defUp'));
  const res = dmgFormula(raw, def, 4, 150, mult);
  let dmg = res.dmg;
  if (B.pBuffs.vuln) dmg = Math.round(dmg * 1.35);

  const sh = B.pBuffs.shield;
  if (sh && sh.v > 0) {
    const absorb = Math.min(sh.v, dmg);
    sh.v -= absorb; dmg -= absorb;
    if (sh.v <= 0) delete B.pBuffs.shield;
    if (absorb > 0) logMsg(`护盾替你挡下了 ${Math.round(absorb)} 点伤害。`, 'sys');
  }
  dmg = Math.max(0, Math.round(dmg));
  R.hp -= dmg;
  if (dmg > 0) { sfx('hurt'); shakeStage(); }
  floatDmg(dmg || '格挡', false, 'player', '#ff9a9a');
  if (label) logMsg(`${label} 对你造成 ${dmg} 点伤害。`, 'enemy');
  B.dmgTaken = (B.dmgTaken || 0) + dmg;
  return dmg;
}

/* ---------------- 战斗日志 / 特效 ---------------- */
function logMsg(text, cls = 'sys') {
  if (!B) return;
  B.log.push({ t: text, c: cls });
  if (B.log.length > MAX_LOG) B.log.shift();
  const el = $('#battle-log');
  if (el) {
    el.insertAdjacentHTML('beforeend', `<div class="log-line ${cls}">${text}</div>`);
    el.scrollTop = el.scrollHeight;
  }
}

function floatDmg(val, isCrit, target, color, prefix = '') {
  const layer = $('#float-layer');
  if (!layer) return;
  const el = document.createElement('div');
  el.className = 'dmg-float' + (isCrit ? ' crit' : '') + (target === 'player' ? ' on-player' : '');
  if (color) el.style.color = color;
  el.style.left = (38 + Math.random() * 26) + '%';
  el.style.top = (target === 'player' ? 52 : 30 + Math.random() * 14) + '%';
  if (typeof val === 'number' && val > 0) val = (prefix || '-') + val;
  el.textContent = val;
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

function shakeStage() {
  const st = $('#battle-stage');
  if (!st) return;
  st.classList.add('shake');
  setTimeout(() => st.classList.remove('shake'), 420);
}

/* ---------------- 敌人意图 ---------------- */
function rollIntent() {
  const e = B.enemy;
  const pool = e.intents || [{ t: 'atk', m: 1 }];
  let it;
  for (let i = 0; i < 8; i++) {
    it = pick(pool);
    if (it.t !== 'atk' && B.lastIntent && B.lastIntent.t === it.t && Math.random() < 0.7) continue;
    break;
  }
  B.lastIntent = it;
  B.intent = it;
  return it;
}

function intentInfo(it) {
  const e = B.enemy;
  const atk = e.atk * (1 + buffVal(B.eBuffs, 'atkUp'));
  const def = effStats().def * (1 + buffVal(B.pBuffs, 'defUp'));
  const est = m => Math.max(1, Math.round(atk * m * (1 - mitigation(def))));
  switch (it.t) {
    case 'atk':    return { txt: `攻击 · 约 ${est(it.m)} 伤害`, cls: '' };
    case 'heavy':  return { txt: `重击 · 约 ${est(it.m)} 伤害`, cls: '' };
    case 'multi':  return { txt: `连击 ×${it.hits} · 约 ${est(it.m)} 伤害`, cls: '' };
    case 'drain':  return { txt: `吸取生命 · 约 ${est(it.m)} 伤害`, cls: '' };
    case 'buff':   return { txt: `${it.b === 'atkUp' ? '攻击' : '防御'}强化`, cls: 'buff' };
    case 'debuff': return { txt: `诅咒 · 施加${BUFF_INFO[it.b].n}`, cls: 'debuff' };
    case 'dot':    return { txt: `毒焰 · 施加${BUFF_INFO[it.b].n}`, cls: 'debuff' };
    case 'heal':   return { txt: `恢复 ${Math.round(it.v * 100)}% 生命`, cls: 'buff' };
    default:       return { txt: '未知动作', cls: '' };
  }
}

async function enemyTurn() {
  if (!B || !R || B.over) return;
  if (B.eBuffs.stun) {
    logMsg('敌人被震晕，无法行动。', 'sys');
    return;
  }
  const it = B.intent || rollIntent();
  const e = B.enemy;
  switch (it.t) {
    case 'atk':
      damagePlayer(e.atk, it.m, `${e.name} 的攻击`);
      break;
    case 'heavy':
      damagePlayer(e.atk, it.m, `${e.name} 的重击`);
      break;
    case 'multi':
      for (let i = 0; i < (it.hits || 2); i++) {
        if (!B || !R || R.hp <= 0) break;
        damagePlayer(e.atk, it.m, `${e.name} 的连击 (${i + 1})`);
        await sleep(170);
      }
      break;
    case 'drain': {
      const d = damagePlayer(e.atk, it.m, `${e.name} 的吸命之触`);
      if (d > 0) {
        const h = Math.round(d * 0.6);
        e.hp = Math.min(e.maxHp, e.hp + h);
        logMsg(`${e.name} 吸取了 ${h} 点生命。`, 'enemy');
      }
      break;
    }
    case 'buff':
      addBuff(B.eBuffs, it.b, it.d || 2, it.v || 0.3);
      logMsg(`${e.name} 使用了${it.b === 'atkUp' ? '攻击' : '防御'}强化。`, 'enemy');
      break;
    case 'debuff':
      if (Math.random() < 0.75) {
        addBuff(B.pBuffs, it.b, it.d || 2, it.v || 0.25);
        logMsg(`你被施加了【${BUFF_INFO[it.b].n}】。`, 'enemy');
      } else {
        logMsg(`${e.name} 的诅咒没有生效。`, 'sys');
      }
      break;
    case 'dot':
      if (Math.random() < 0.8) {
        const s = effStats();
        const dv = Math.min(0.09, Math.max(0.01, it.v || 0.02));
        addBuff(B.pBuffs, it.b, it.d || 3, Math.max(2, Math.round(s.maxHp * dv)));
        logMsg(`你被施加了【${BUFF_INFO[it.b].n}】。`, 'enemy');
      } else {
        logMsg('毒焰被躲开了。', 'sys');
      }
      break;
    case 'heal': {
      const h = Math.round(e.maxHp * (it.v || 0.15));
      e.hp = Math.min(e.maxHp, e.hp + h);
      floatDmg(h, false, 'enemy', '#7ef0bb', '+');
      logMsg(`${e.name} 恢复了 ${h} 点生命。`, 'enemy');
      break;
    }
  }
  rollIntent();
}

function endRound() {
  // 玩家 DoT
  for (const k in B.pBuffs) {
    const b = B.pBuffs[k];
    if (k === 'poison' || k === 'burn') {
      const d = Math.max(1, Math.round(b.v));
      R.hp -= d;
      logMsg(`你受到【${BUFF_INFO[k].n}】${d} 点伤害。`, 'enemy');
      floatDmg(d, false, 'player', k === 'poison' ? '#8de06a' : '#ff9a5c');
    }
    if (k === 'regen') healPlayer(b.v);
    if (k !== 'shield') b.t--;
    if (b.t <= 0) delete B.pBuffs[k];
  }
  // 敌人 DoT
  for (const k in B.eBuffs) {
    const b = B.eBuffs[k];
    if (k === 'poison' || k === 'burn') {
      const d = Math.max(1, Math.round(b.v));
      B.enemy.hp -= d;
      logMsg(`${B.enemy.name} 受到【${BUFF_INFO[k].n}】${d} 点伤害。`, 'sys');
      floatDmg(d, false, 'enemy', k === 'poison' ? '#8de06a' : '#ff9a5c');
    }
    if (k !== 'shield') b.t--;
    if (b.t <= 0) delete B.eBuffs[k];
  }
  // 技能冷却
  for (const k in B.cds) { B.cds[k]--; if (B.cds[k] <= 0) delete B.cds[k]; }
  if (B.enemy.hp <= 0) { B.enemy.hp = 0; }
  // 深渊统治者：回合结束固定回血
  if (hasRulerBuff()) {
    const h = healPlayer(META_ACHIEVEMENTS[0].buff.regen);
    if (h > 0) logMsg(`👑 深渊之力涌动，回复 ${h} 点生命。`, 'heal');
  }
}

/* ---------------- 技能 ---------------- */
function skillReady(id) { return !B.cds[id]; }

function useSkill(id) {
  if (!B || B.busy || B.over) return;
  if (!skillReady(id)) return;
  const sk = SKILLS[id];
  S.stats.skillUses++;
  B.cds[id] = sk.cd;
  sfx('click');
  logMsg(`你施放了【${sk.n}】。`, 'player');
  sk.cast();
  afterPlayerAction();
}

/* ---------------- 玩家行动 ---------------- */
function playerAttack() {
  if (!B || B.busy || B.over) return;
  logMsg('你挥出武器。', 'player');
  hitEnemy(1);
  afterPlayerAction();
}

function playerDefend() {
  if (!B || B.busy || B.over) return;
  const s = effStats();
  addBuff(B.pBuffs, 'shield', 99, Math.round(s.maxHp * 0.18));
  logMsg('你采取防御姿态（获得护盾）。', 'player');
  sfx('click');
  afterPlayerAction();
}

function playerPotion() {
  if (!B || B.busy || B.over) return;
  if (R.potions <= 0) { toast('没有药水了', '🧪'); return; }
  R.potions--;
  S.stats.potionsUsed++;
  R.usedPotion = true;
  const s = effStats();
  const h = Math.round(s.maxHp * 0.42);
  healPlayer(h);
  logMsg(`你喝下治疗药水（+${h} 生命）。`, 'heal');
  afterPlayerAction();
}

function tryFlee() {
  if (!B || B.busy || B.over) return;
  if (!B.canFlee) { logMsg('首领的威压让你无法逃离！', 'sys'); return; }
  if (Math.random() < 0.62) {
    logMsg('你成功逃离了战斗。', 'sys');
    B.over = true; B.fled = true;
    setTimeout(() => { closeBattleAndContinue(); }, 520);
  } else {
    logMsg('逃跑失败！', 'enemy');
    afterPlayerAction();
  }
}

/* =============== NEXT SCRIPT BLOCK =============== */

/* ============================================================
   界面层：渲染 / 流程 / 交互
   ============================================================ */

let runView = 'choices';
let pendingItems = [];

/* ---------------- 屏幕切换 ---------------- */
function showScreen(name) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  const el = $('#screen-' + name);
  if (el) el.classList.add('active');
  const inRun = (name === 'run' || name === 'battle') && R;
  document.body.dataset.biome = inRun ? String(biomeOf(R.depth).id) : '0';
  $('#res-gold').classList.toggle('hidden', !inRun);
  $('#res-depth').classList.toggle('hidden', !inRun);
  $('#btn-home').classList.toggle('hidden', !inRun);
  renderTopbar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderTopbar() {
  $('#res-dust b').textContent = fmt(S.meta.soulDust);
  const vEl = $('#game-version');
  if (vEl) vEl.textContent = VERSION;
  if (R) {
    $('#res-gold b').textContent = fmt(R.gold);
    $('#res-depth b').textContent = R.depth;
  }
}

/* ---------------- Toast（启动器统一提示横条样式） ---------------- */
const TOAST_TITLES = { success: '成功', info: '提示', warning: '警告', error: '错误' };
const TOAST_GLYPHS = { success: '✓', info: 'i', warning: '!', error: '✕' };

function toast(msg, icon = '', kind = '') {
  let box = $('#systemToastContainer');
  if (!box) {
    box = document.createElement('div');
    box.id = 'systemToastContainer';
    box.className = 'system-toast-container';
    document.body.appendChild(box);
  }
  let type = 'info';
  if (kind === 'jade' || kind === 'success') type = 'success';
  else if (kind === 'warning') type = 'warning';
  else if (kind === 'error') type = 'error';

  const el = document.createElement('div');
  el.className = 'system-toast ' + type;
  el.innerHTML =
    `<div class="system-toast-icon">${TOAST_GLYPHS[type]}</div>` +
    `<div class="system-toast-content">` +
      `<div class="system-toast-title">${TOAST_TITLES[type]}</div>` +
      `<div class="system-toast-message">${msg}</div>` +
    `</div>` +
    `<button class="system-toast-close" title="关闭">✕</button>`;
  box.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));

  const destroy = () => {
    if (!el.parentNode) return;
    el.classList.remove('show');
    el.classList.add('hide');
    setTimeout(() => el.remove(), 420);
  };
  el.querySelector('.system-toast-close').onclick = destroy;
  el._hideTimer = setTimeout(destroy, 2600);
}

const modalStack = [];
function modal({ title, sub = '', body = '', buttons = [], size = '' }) {
  const root = $('#modal-root');
  root.classList.add('on');
  root.innerHTML = `<div class="modal-bg"></div><div class="modal-card ${size}">
    <h3>${title}</h3>
    ${sub ? `<div class="m-sub">${sub}</div>` : ''}
    <div class="modal-body">${body}</div>
    ${buttons.length ? `<div class="modal-foot">${buttons.map((b, i) => `<button class="btn ${b.cls || 'btn-ghost'}" data-mi="${i}">${b.label}</button>`).join('')}</div>` : ''}
  </div>`;
  $$('[data-mi]', root).forEach(btn => {
    btn.onclick = () => {
      const b = buttons[+btn.dataset.mi];
      closeModal();
      if (b && b.fn) b.fn();
    };
  });
}
function closeModal() {
  const root = $('#modal-root');
  root.classList.remove('on');
  root.innerHTML = '';
}

/* ---------------- 成就检测 ---------------- */
function checkAch() {
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (!S.ach[a.id] && a.c(S)) {
      S.ach[a.id] = Date.now();
      S.meta.soulDust += a.r;
      S.stats.dustEarned += a.r;
      newly.push(a);
    }
  }
  // 元成就：深渊统治者 —— 全部基础成就解锁后获得
  const allDone = ACHIEVEMENTS.every(a => S.ach[a.id]);
  for (const ma of META_ACHIEVEMENTS) {
    if (!S.ach[ma.id] && allDone) {
      S.ach[ma.id] = Date.now();
      S.meta.soulDust += ma.r;
      S.stats.dustEarned += ma.r;
      newly.push(ma);
    }
  }
  if (newly.length) {
    saveGame();
    newly.forEach((a, i) => setTimeout(() => {
      toast(`成就 · ${a.n}　+${a.r} 魂尘`, a.i, 'jade');
      sfx('ach');
      renderTopbar();
    }, i * 420));
  }
  return newly;
}
function achCount() { return Object.keys(S.ach).filter(k => ACHIEVEMENTS.some(a => a.id === k)).length; }
function metaAchCount() { return META_ACHIEVEMENTS.filter(m => S.ach[m.id]).length; }

/* ---------------- 标题屏 ---------------- */
function renderTitle() {
  const hasRun = !!S.runSave;
  const pending = !!S.pendingSettlement;
  const played = S.stats.runs > 0 || S.meta.soulDust > 0 || S.stats.maxDepth > 0;
  const settleBtn = `<button class="btn btn-danger btn-lg" onclick="showSettlementModal(S.pendingSettlement)">⏳ 待结算</button>`;
  $('#screen-title').innerHTML = `
  <div class="title-wrap">
    <div>
      <div class="logo-ring"></div>
      <div class="game-logo">深渊回响</div>
      <div class="game-sub">Echoes of the Abyss</div>
      <div class="game-tag">
        深渊没有尽头，只有更深的回音。<br>
        十二层血与火的阶梯之下，深渊之主仍在王座上等待。<br>
        <span class="dim">每一次坠落，都会留下不会消散的魂尘。</span>
      </div>
      <div class="title-btns">
        ${pending ? settleBtn : hasRun ? `<button class="btn btn-primary btn-lg" onclick="continueRun()">继续冒险</button>` : ''}
        ${pending ? '' : `<button class="btn ${hasRun ? 'btn-ghost' : 'btn-primary'} btn-lg" onclick="startNewRun()">${played ? '开始新的冒险' : '踏入深渊'}</button>`}
        ${played ? `<button class="btn btn-ghost btn-lg" onclick="goHub()">灵魂圣所</button>` : ''}
      </div>
      <div class="title-foot">
        魂尘 ${fmt(S.meta.soulDust)} · 最深 ${S.stats.maxDepth} 层 · 成就 ${achCount()}/${ACHIEVEMENTS.length}
      </div>
    </div>
  </div>`;
}

/* ---------------- 圣所 ---------------- */
function goHub() {
  hubTab = 'sanctum';
  renderHub();
  showScreen('hub');
}

function renderHub() {
  const u = S.meta.upgrades;
  const tabs = [
    ['sanctum', '⚒️ 圣所'], ['ach', '🏆 成就'], ['codex', '📖 图鉴'],
    ['weapon', '⚔️ 武器'], ['skill', '✨ 技能'], ['stats', '📊 统计'], ['settings', '⚙️ 设置'],
  ];
  let content = '';

  if (hubTab === 'sanctum') {
    const upgHtml = UPGRADES.map(up => {
      const lv = u[up.id] || 0;
      const maxed = lv >= up.max;
      const cost = up.cost(lv);
      const can = !maxed && S.meta.soulDust >= cost;
      const pct = Math.round(lv / up.max * 100);
      return `<div class="upg">
        <div class="upg-ico">${up.i}</div>
        <div style="min-width:0;flex:1">
          <div class="upg-name">${up.n} <span class="upg-lv">Lv.${lv}/${up.max}</span></div>
          <div class="upg-desc">${up.d}</div>
          <div class="bar slim" style="margin-top:8px"><div class="bar-fill" style="width:${pct}%;background:linear-gradient(90deg,#ffcb5c,#ff8a3d)"></div></div>
        </div>
        <div class="col" style="align-items:flex-end;gap:4px">
          ${maxed ? `<span class="pill tag-gold">已满级</span>`
            : `<span class="cost">✨ ${fmt(cost)}</span>
               <button class="btn btn-sm ${can ? 'btn-arcane' : 'btn-ghost'}" ${can ? '' : 'disabled'} onclick="buyUpgrade('${up.id}')">升级</button>`}
        </div>
      </div>`;
    }).join('');

    const boonUnlocked = allUpgradesMaxed();
    const boonMaxedCnt = UPGRADES.filter(up => (u[up.id] || 0) >= up.max).length;
    const boonCard = `<div class="card" style="margin-top:16px">
      <div class="card-h"><span>🌠</span><div><div class="card-t">开局增益</div><div class="card-sub">PRE-RUN BOONS · ${boonUnlocked ? '已解锁' : '完成全部魂尘强化后解锁'}</div></div>
        <div style="margin-left:auto" class="pill ${boonUnlocked ? 'tag-jade' : ''}">${boonUnlocked ? '已解锁' : boonMaxedCnt + ' / ' + UPGRADES.length + ' 项满级'}</div>
      </div>
      <div class="small dim" style="line-height:1.9">
        ${boonUnlocked
          ? '踏入深渊前可配置开局增益：最多选择 <b>3</b> 个技能与 <b>2</b> 项属性增益，并使用魂尘购买。属性增益可点击「+ / ++」突破，消耗魂尘大幅提升，两者互斥。<br>若本局选择「放弃冒险」，开局增益消耗的魂尘将<b style="color:var(--jade)">全额退还</b>。'
          : '将全部魂尘强化升至满级后解锁：进入游戏前可用魂尘购买技能与属性增益（最多 3 个技能 + 2 项属性增益，可突破）。'}
      </div>
    </div>`;

    // 极限模式开关卡片
    const extremeUnlocked = (S.meta.ngPlus || 0) >= EXTREME_UNLOCK_NG;
    const runActive = !!S.runSave;
    const extremeOn = !!S.meta.extreme;
    const extremeSwitchLocked = !extremeUnlocked || runActive;
    const extremeCard = `<div class="card sanctum-card xmode-card ${extremeOn ? 'on' : ''} ${extremeUnlocked ? '' : 'locked'}">
      <div class="card-h"><span>🩸</span><div><div class="card-t">极限模式</div><div class="card-sub">EXTREME MODE · 深红深渊 · 20 层</div></div>
        <div style="margin-left:auto" class="pill ${runActive ? 'tag-gold' : extremeOn ? 'tag-rose' : ''}">${runActive ? '冒险中 · 锁定' : extremeOn ? '已启用' : extremeUnlocked ? '已解锁' : '未解锁'}</div>
      </div>
      <div class="small dim" style="line-height:1.9">
        ${extremeUnlocked
          ? '开启后，通关第 13 层时将弹出提示，可选择进入极限模式并把探索层数提高到 <b style="color:#ff8b9a">20</b> 层。<br>敌人的生命与攻击大幅提高，全新的精英与首领登场；我方的增益与事件馈赠同样被深渊放大，通关后的魂尘奖励大幅增加。'
          : `轮回难度达到 <b>${EXTREME_UNLOCK_NG}</b> 后解锁（当前 ${S.meta.ngPlus}/${MAX_NG}）。关闭状态下通关第 13 层将直接结算本局。`}
      </div>
      <div class="xmode-row">
        <div class="xmode-switch ${extremeOn ? 'on' : ''} ${extremeSwitchLocked ? 'locked' : ''}" onclick="toggleExtremeMode()"><span></span></div>
        <div class="small ${(extremeOn && !runActive) ? '' : 'dim'}">${runActive
          ? (extremeOn ? '冒险进行中 · 本局已锁定为开启，结束前无法关闭' : '冒险进行中 · 本局已锁定为关闭，结束前无法开启')
          : extremeUnlocked ? (extremeOn ? '开启 · 通关 13 层后可进入极限模式' : '关闭 · 通关 13 层后直接结算') : '锁定中 · 无法开启'}</div>
      </div>
    </div>`;

    // 每周加成卡片
    const pw = ensurePassWeekly();
    const pwUnlocked = (S.meta.ngPlus || 0) >= 6;
    const xpPct = Math.round(Math.max(0, pw.xpLeft) / PASS_WEEK_XP * 100);
    const segHtml = [0, 1, 2].map(i => `<div class="pw-seg ${i < pw.bonusLeft ? 'on' : ''}"></div>`).join('');
    const weeklyCard = `<div class="card sanctum-card pw-card ${pwUnlocked ? '' : 'locked'}">
      <div class="card-h"><span>📅</span><div><div class="card-t">每周加成</div><div class="card-sub">WEEKLY BONUS · ${pw.week}</div></div>
        <div style="margin-left:auto" class="pill ${pwUnlocked ? 'tag-jade' : ''}">${pwUnlocked ? `本周 ${pw.bonusLeft} / ${PASS_BONUS_MAX} 次` : '未解锁'}</div>
      </div>
      <div class="pw-refresh-row"><span class="pw-refresh" id="pwRefreshLabel">🕒 ${pwRefreshText()}</span></div>
      ${pwUnlocked ? `
      <div class="pw-label"><span>本周剩余可获取通行证经验</span><span style="color:#8fc4ff">${pw.xpLeft} / ${PASS_WEEK_XP}</span></div>
      <div class="pw-bar"><div class="pw-bar-fill" style="width:${xpPct}%"></div></div>
      <div class="pw-label" style="margin-top:14px"><span>本周可用加成次数</span><span style="color:var(--rose)">${pw.bonusLeft} / ${PASS_BONUS_MAX}</span></div>
      <div class="pw-segs">${segHtml}</div>
      <div class="small dim sanctum-foot" style="margin-top:auto;line-height:1.9">
        每周可获得 <b>${PASS_WEEK_XP}</b> 点通行证经验（${PASS_WEEK_XP / 10} 级）。<br>
        难度 6-15 中每次通关可领取 <b>${PASS_XP_CLEAR}</b> 经验；难度 0-5 不提供经验。<br>
        完整通过极限模式后可消耗 1 次加成，一次性获得 <b>${PASS_XP_BONUS}</b> 经验（4 级）；中途放弃或未结算极限模式时不可使用。
      </div>` : `<div class="small dim sanctum-foot" style="line-height:1.9">轮回难度达到 <b>6</b> 后解锁（当前 ${S.meta.ngPlus}/${MAX_NG}）。<br>解锁后难度 6-15 中每次通关可领取 ${PASS_XP_CLEAR} 点通行证经验，难度 0-5 不提供经验。</div>`}
    </div>`;

    content = `
    <div class="sanctum-grid">
      <div class="card sanctum-card">
        <div class="hero-panel">
          <div class="hero-avatar">🧝</div>
          <div>
            <div style="font-family:var(--serif);font-size:19px;letter-spacing:2px">无名者</div>
            <div class="small muted" style="margin-top:4px">轮回难度 ${ngInfo(S.meta.ngPlus).name}（0-${MAX_NG}） · 最深 ${S.stats.maxDepth} 层</div>
            <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">
              <span class="pill tag-gold">✨ 魂尘 ${fmt(S.meta.soulDust)}</span>
              <span class="pill tag-jade">🏆 ${achCount()}/${ACHIEVEMENTS.length}</span>
              ${hasRulerBuff() ? '<span class="pill tag-jade">👑 深渊统治者</span>' : ''}
            </div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="grid2" style="gap:8px">
          ${S.pendingSettlement
            ? `<button class="btn btn-danger btn-block btn-lg" style="grid-column:1/-1" onclick="showSettlementModal(S.pendingSettlement)">⏳ 待结算</button>`
            : `<button class="btn btn-primary btn-block btn-lg" onclick="startNewRun()">踏入深渊</button>
               <button class="btn btn-ghost btn-block btn-lg" ${S.runSave ? '' : 'disabled'} onclick="continueRun()">继续未完成的冒险</button>`}
        </div>
        <div class="small dim center sanctum-foot" style="line-height:1.8">
          生命 ${effStats().maxHp} · 攻击 ${Math.round(effStats().atk)} · 防御 ${Math.round(effStats().def)} · 暴击 ${Math.round(effStats().crit)}%
        </div>
      </div>
      <div class="card sanctum-card">
        <div class="card-h"><span>🕯️</span><div><div class="card-t">深渊的馈赠</div><div class="card-sub">击败首领 · 深入层数 · 完成成就，均可获得魂尘</div></div></div>
        <div class="col" style="gap:8px">
          ${[['🌱 初次坠落', '完成一次冒险'], ['🐗 地窟征服者', '击败第一位首领'], ['👑 深渊终结', '击败全部四位首领'], ['🔄 轮回者', '开启更高难度']]
            .map(([a, b]) => `<div class="stat"><span class="stat-k">${a}</span><span class="small dim">${b}</span></div>`).join('')}
        </div>
        <div class="sanctum-foot">
          <div class="divider" style="margin-top:0"></div>
          <div class="small dim" style="line-height:1.9">
            魂尘在死亡后依然保留，用于永久强化。每次冒险的装备与成长都会重置——这正是深渊的规则。
          </div>
        </div>
      </div>
      ${extremeCard}
      ${weeklyCard}
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-h"><span>⚒️</span><div><div class="card-t">魂尘强化</div><div class="card-sub">PERMANENT UPGRADES · 永久生效</div></div>
        <div style="margin-left:auto" class="pill tag-gold">✨ ${fmt(S.meta.soulDust)} 可用</div>
      </div>
      <div class="col" style="gap:9px">${upgHtml}</div>
    </div>
    ${boonCard}`;
    startPwRefreshTimer();
  }

  if (hubTab === 'ach') {
    const list = ACHIEVEMENTS.map(a => {
      const done = !!S.ach[a.id];
      return `<div class="ach ${done ? 'done' : 'locked'}">
        <div class="ach-icon">${done ? a.i : '🔒'}</div>
        <div>
          <div class="ach-name">${a.n}</div>
          <div class="ach-desc">${a.d}</div>
          <div class="ach-reward">${done ? '✦ 已达成' : `奖励 ✨ ${a.r} 魂尘`}</div>
        </div>
      </div>`;
    }).join('');
    const pct = Math.round(achCount() / ACHIEVEMENTS.length * 100);
    const rulerDone = metaAchCount() > 0;
    const rb = META_ACHIEVEMENTS[0].buff;
    const metaCard = `<div class="ach ${rulerDone ? 'done' : 'locked'}" style="${rulerDone ? '' : 'opacity:.55'}">
      <div class="ach-icon" style="font-size:28px">${rulerDone ? '👑' : '🔒'}</div>
      <div style="flex:1">
        <div class="ach-name">${META_ACHIEVEMENTS[0].n} <span class="pill tag-gold" style="margin-left:6px">总成就</span></div>
        <div class="ach-desc">${META_ACHIEVEMENTS[0].d}</div>
        <div class="ach-reward" style="color:${rulerDone ? 'var(--jade)' : 'var(--gold)'}">
          全局 buff：攻击 +${Math.round(rb.atkPct * 100)}% · 防御 +${Math.round(rb.defPct * 100)}% · 暴击率 +${rb.critAdd}% · 回合末回血 ${rb.regen}
          ${rulerDone ? '　✦ 已激活' : `　（奖励 ✨ ${META_ACHIEVEMENTS[0].r} 魂尘）`}
        </div>
      </div>
    </div>`;
    content = `<div class="card">
      <div class="card-h"><span>🏆</span><div><div class="card-t">成就殿堂</div><div class="card-sub">ACHIEVEMENTS · 解锁全部基础成就以加冕深渊统治者</div></div>
        <div style="margin-left:auto" class="pill tag-gold">${achCount()} / ${ACHIEVEMENTS.length} · ${pct}%</div></div>
      <div class="bar xp" style="margin-bottom:16px"><div class="bar-fill" style="width:${pct}%"></div></div>
      ${metaCard}
      <div class="divider" style="margin:16px 0"></div>
      <div class="grid-auto">${list}</div>
    </div>`;
  }

  if (hubTab === 'codex') {
    const all = Object.assign({}, ENEMIES, BOSSES);
    const list = Object.keys(all).map(k => {
      const e = all[k];
      const seen = S.codex[k] || 0;
      return `<div class="cx ${seen ? '' : 'locked'} ${seen ? 'clickable' : ''}" ${seen ? `onclick="openCodexEntry('${k}')"` : ''}>
        <div class="cx-top">
          <div class="cx-emoji">${seen ? e.i : '❔'}</div>
          <div>
            <div class="cx-n">${seen ? e.n : '未知存在'}</div>
            <div class="small dim">${seen ? `遭遇 ${seen} 次` : '尚未遭遇'}</div>
          </div>
        </div>
        <div class="cx-l">${seen ? e.lore : '？？？'}</div>
        ${seen ? `<div class="row small dim" style="margin-top:8px;gap:10px"><span>❤ ${e.hp}</span><span>⚔ ${e.atk}</span><span>🛡 ${e.def}</span></div>` : ''}
        ${seen ? '<div class="cx-more">查看详情 ›</div>' : ''}
      </div>`;
    }).join('');
    const seenN = Object.keys(all).filter(k => S.codex[k]).length;
    content = `<div class="card">
      <div class="card-h"><span>📖</span><div><div class="card-t">深渊图鉴</div><div class="card-sub">BESTIARY · 点击已收录的敌人查看详情与难度对比</div></div>
        <div style="margin-left:auto" class="pill tag-jade">${seenN} / ${Object.keys(all).length}</div></div>
      <div class="grid-auto">${list}</div>
    </div>`;
  }

  if (hubTab === 'weapon') {
    const slotOrder = ['weapon', 'armor', 'trinket'];
    const groups = slotOrder.map(slot => {
      const list = ITEM_BASES
        .map((b, idx) => ({ b, idx }))
        .filter(({ b }) => b.slot === slot)
        .map(({ b, idx }) => `
          <div class="cx clickable" onclick="openWeaponEntry(${idx})">
            <div class="cx-top">
              <div class="cx-emoji" style="border-color:${RARITY.legend.color}">${b.ico}</div>
              <div>
                <div class="cx-n">${b.n}</div>
                <div class="small dim">${SLOT_NAME[b.slot]} · ${Object.keys(b.s).length} 项属性</div>
              </div>
            </div>
            <div class="row small" style="margin-top:8px;gap:10px;flex-wrap:wrap">
              ${Object.entries(b.s).map(([k, v]) => `<span style="color:${RARITY.rare.color}">${STAT_NAME[k] || k} +${v}</span>`).join('')}
            </div>
            <div class="cx-more">查看详情 ›</div>
          </div>`).join('');
      return `<div class="cx-sec" style="margin:0 0 10px"><span>${SLOT_ICON[slot]} ${SLOT_NAME[slot]}</span></div>
              <div class="grid-auto" style="margin-bottom:18px">${list || '<div class="small dim">暂无</div>'}</div>`;
    }).join('');
    content = `<div class="card">
      <div class="card-h"><span>⚔️</span><div><div class="card-t">武器与装备图鉴</div><div class="card-sub">ARMORY · 点击装备查看基底属性与稀有度加成</div></div>
        <div style="margin-left:auto" class="pill tag-jade">共 ${ITEM_BASES.length} 种</div></div>
      ${groups}
    </div>`;
  }

  if (hubTab === 'skill') {
    const rarOrder = ['common', 'rare', 'epic', 'legend'];
    const groups = rarOrder.map(rar => {
      const list = Object.entries(SKILLS)
        .filter(([, sk]) => sk.rar === rar)
        .map(([key, sk]) => `
          <div class="cx clickable" onclick="openSkillEntry('${key}')">
            <div class="cx-top">
              <div class="cx-emoji" style="border-color:${RARITY[rar].color}">${sk.i}</div>
              <div>
                <div class="cx-n">${sk.n}</div>
                <div class="small dim">冷却 ${sk.cd} 回合</div>
              </div>
            </div>
            <div class="cx-l">${sk.d}</div>
            <div class="cx-more">查看详情 ›</div>
          </div>`).join('');
      return `<div class="cx-sec" style="margin:0 0 10px"><span style="color:${RARITY[rar].color}">${RARITY[rar].n}技能</span></div>
              <div class="grid-auto" style="margin-bottom:18px">${list || '<div class="small dim">暂无</div>'}</div>`;
    }).join('');
    content = `<div class="card">
      <div class="card-h"><span>✨</span><div><div class="card-t">技能图鉴</div><div class="card-sub">SKILLS · 点击技能查看详细效果</div></div>
        <div style="margin-left:auto" class="pill tag-jade">共 ${Object.keys(SKILLS).length} 个</div></div>
      ${groups}
    </div>`;
  }

  if (hubTab === 'stats') {
    const st = S.stats;
    const rows = [
      ['冒险次数', st.runs], ['通关次数', st.wins], ['死亡次数', st.deaths],
      ['最深到达', st.maxDepth + ' 层'], ['累计击杀', st.kills], ['精英击杀', st.eliteKills],
      ['首领击杀', Object.values(st.bosses).reduce((a, b) => a + b, 0)],
      ['累计金币', fmt(st.goldEarned)], ['单局最高金币', fmt(st.maxGold)],
      ['累计伤害', fmt(st.damageDealt)], ['最高单次伤害', fmt(st.bestHit)],
      ['暴击次数', st.crits], ['累计治疗', fmt(st.healed)], ['技能释放', st.skillUses],
      ['药水使用', st.potionsUsed], ['购买次数', st.buys], ['拾取装备', st.itemsFound],
      ['经历事件', st.events], ['累计魂尘', fmt(st.dustEarned)],
    ];
    content = `<div class="card">
      <div class="card-h"><span>📊</span><div><div class="card-t">冒险记录</div><div class="card-sub">STATISTICS</div></div></div>
      <div class="grid2" style="gap:6px 18px">${rows.map(([k, v]) => `<div class="stat"><span class="stat-k">${k}</span><span class="stat-v">${v}</span></div>`).join('')}</div>
    </div>`;
  }

  if (hubTab === 'settings') {
    const fpsOpts = [['auto', 'Auto'], ['60', '60'], ['30', '30']];
    const fpsCur = String(S.settings.fps || 'auto');
    const motionCur = (S.settings.motion === 'partial' || S.settings.motion === 'none') ? S.settings.motion : 'all';
    const isFs = !!document.fullscreenElement;
    const devOn = isDevModeEnabled();
    const devVal = k => (S.meta.dev && S.meta.dev[k] != null) ? S.meta.dev[k] : '默认';

    const devCard = !devOn ? '' : `<div class="card">
        <div class="card-h"><span>🧪</span><div><div class="card-t">开发者选项</div><div class="card-sub">DEVELOPER · 仅开发者模式可见</div></div></div>
        <div class="col" style="gap:10px">
          <div class="grid2" style="gap:8px">
            <button class="btn btn-ghost" onclick="devUnlockAllAch()">🏆 解锁所有成就</button>
            <button class="btn btn-ghost" onclick="devUnlockAllCodex()">📖 解锁所有图鉴</button>
            <button class="btn btn-ghost" onclick="devUnlockAllNg()">🔄 解锁全部轮回难度</button>
            <button class="btn btn-ghost" onclick="devSetDust()">✨ 设置自定义魂尘</button>
          </div>
          <div class="divider"></div>
          <div class="small dim">以下数值将在<b style="color:var(--gold)">新一局</b>开始时生效</div>
          <div class="grid2" style="gap:8px">
            <button class="btn btn-ghost" onclick="devSetRunStat('hp')">❤ 自定义血量 · ${devVal('hp')}</button>
            <button class="btn btn-ghost" onclick="devSetRunStat('atk')">⚔ 自定义伤害 · ${devVal('atk')}</button>
            <button class="btn btn-ghost" onclick="devSetRunStat('def')">🛡 自定义防御 · ${devVal('def')}</button>
            <button class="btn btn-ghost" onclick="devSetRunStat('crit')">🎯 自定义暴击率 · ${devVal('crit')}</button>
          </div>
          <button class="btn btn-danger btn-block" onclick="devClearRunStats()">清除自定义数值</button>
        </div>
      </div>`;

    content = `<div class="grid2" style="align-items:start">
      <div class="card">
        <div class="card-h"><span>⚙️</span><div><div class="card-t">设置</div><div class="card-sub">SETTINGS · 显示与体验</div></div></div>
        <div class="col" style="gap:14px">
          <div>
            <div class="set-label">帧率上限</div>
            <div class="set-desc">Auto 自动使用显示器最高支持的刷新率</div>
            <div class="seg">${fpsOpts.map(([v, n]) => `<button class="seg-btn ${fpsCur === v ? 'active' : ''}" onclick="setFpsLimit('${v}')">${n}</button>`).join('')}</div>
          </div>
          <div>
            <div class="set-label">动效设置</div>
            <div class="set-desc">控制界面与战斗的动画表现</div>
            <div class="seg">${MOTION_OPTIONS.map(([v, n]) => `<button class="seg-btn ${motionCur === v ? 'active' : ''}" onclick="setMotion('${v}')">${n}</button>`).join('')}</div>
          </div>
          <div>
            <div class="set-label">全屏显示</div>
            <div class="set-desc">${isFs ? '当前已是全屏模式' : '将游戏画面铺满整个显示器'}</div>
            <button class="btn btn-ghost btn-block" onclick="toggleFullscreen()">${isFs ? '🔳 退出全屏' : '⛶ 进入全屏'}</button>
          </div>
          <div>
            <div class="set-label">音效</div>
            <div class="set-desc">战斗与界面音效开关</div>
            <button class="btn btn-ghost btn-block" onclick="toggleSound()">🔊 音效：${S.settings.sound ? '开启' : '关闭'}</button>
          </div>
        </div>
      </div>
      <div class="col" style="gap:14px;min-width:0">
        <div class="card">
          <div class="card-h"><span>🛠️</span><div><div class="card-t">存档与数据</div><div class="card-sub">DATA</div></div></div>
          <div class="col" style="gap:10px">
            <button class="btn btn-ghost btn-block" onclick="renderAchieveDebug()">🔄 重新检测成就</button>
            <div class="divider"></div>
            <button class="btn btn-danger btn-block" onclick="confirmReset()">⚠️ 清空所有存档</button>
            <div class="small dim" style="line-height:1.9">
              清空操作不可撤销。游戏进度保存在浏览器本地（localStorage），清除浏览器数据同样会丢失进度。
            </div>
          </div>
        </div>
        ${devCard}
      </div>
    </div>`;
  }

  $('#screen-hub').innerHTML = `
    <div class="hub-head">
      <div class="hub-title">灵魂圣所<small>SANCTUM OF SOULS</small></div>
      <div class="tabs">${tabs.map(([k, n]) => `<button class="tab ${hubTab === k ? 'active' : ''}" onclick="switchTab('${k}')">${n}</button>`).join('')}</div>
    </div>
    ${content}`;
}

function switchTab(k) { hubTab = k; sfx('click'); renderHub(); }

function buyUpgrade(id) {
  const up = UPGRADES.find(x => x.id === id);
  const lv = S.meta.upgrades[id] || 0;
  if (lv >= up.max) return;
  const cost = up.cost(lv);
  if (S.meta.soulDust < cost) { toast('魂尘不足', '✨'); return; }
  S.meta.soulDust -= cost;
  S.meta.upgrades[id] = lv + 1;
  sfx('buy');
  saveGame();
  checkAch();
  renderHub();
  renderTopbar();
}

function confirmReset() {
  modal({
    title: '确认清空存档？', sub: 'THIS CANNOT BE UNDONE',
    body: '所有魂尘、成就、图鉴与记录都会被抹去，深渊将再次对你完全陌生。',
    buttons: [
      { label: '再想想', cls: 'btn-ghost' },
      { label: '确认清空', cls: 'btn-danger', fn: () => {
          localStorage.removeItem(SAVE_KEY);
          S = defaultState(); R = null; B = null;
          saveGame(); renderTitle(); showScreen('title');
          toast('存档已清空', '🗑️');
        } },
    ]
  });
}

function toggleSound() {
  S.settings.sound = !S.settings.sound;
  $('#btn-sound').classList.toggle('off', !S.settings.sound);
  $('#btn-sound').textContent = S.settings.sound ? '🔊' : '🔇';
  saveGame();
  if (hubTab === 'stats' || hubTab === 'settings') renderHub();
  if (S.settings.sound) sfx('click');
}

/* ---------------- 设置项：帧率 / 全屏 ---------------- */
function setFpsLimit(v) {
  S.settings.fps = String(v);
  saveGame();
  sfx('click');
  renderHub();
  toast(v === 'auto' ? '帧率：Auto（跟随显示器刷新率）' : `帧率上限：${v} FPS`, '🎚️');
}

function toggleFullscreen() {
  const doc = document;
  if (!doc.fullscreenElement) {
    const el = doc.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!req) { toast('当前浏览器不支持全屏', '⚠️'); return; }
    Promise.resolve(req.call(el)).then(() => {
      renderHub();
      toast('已进入全屏', '⛶');
    }).catch(() => toast('进入全屏失败（可能被浏览器拦截）', '⚠️'));
  } else {
    const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    if (!exit) return;
    Promise.resolve(exit.call(doc)).then(() => {
      renderHub();
      toast('已退出全屏', '🔳');
    }).catch(() => {});
  }
}

/* ---------------- 图鉴详情 ---------------- */
const CODEX_TAG_NAMES = {
  beast: '野兽', undead: '亡灵', human: '人类', construct: '构造', elemental: '元素', demon: '恶魔', void: '虚空', boss: '首领',
};
const CODEX_BUFF_NAMES = {
  atkUp: '攻击强化', defUp: '防御强化', weak: '虚弱', vuln: '易伤', poison: '中毒', burn: '灼烧',
};

function codexDepthOf(key) {
  const fixed = { boss1: 3, boss2: 6, boss3: 9, boss4: 12, xboss1: 15, xboss2: 18, xboss3: 20 };
  if (fixed[key]) return fixed[key];
  const idx = BIOMES.findIndex(b => b.enemies.indexOf(key) >= 0);
  if (idx === 4) return 14 + Math.max(0, BIOMES[4].enemies.indexOf(key)) * 2;
  return (idx >= 0 ? idx : 0) * 3 + 1;
}

function enemyStatsAt(base, isBoss, ng, depth) {
  let hpMul = 1 + (depth - 1) * 0.075 + ng * 0.35;
  let atkMul = 1 + (depth - 1) * 0.042 + ng * 0.25;
  if (isBoss) { hpMul = 1 + ng * 0.45; atkMul = 1 + ng * 0.3; }
  return { hp: Math.round(base.hp * hpMul), atk: base.atk * atkMul, def: base.def };
}

function codexIntentText(it, atk, playerDef) {
  const est = m => Math.max(1, Math.round(atk * m * (1 - mitigation(playerDef))));
  switch (it.t) {
    case 'atk': return `攻击 · 约 ${est(it.m)} 伤害`;
    case 'heavy': return `重击 · 约 ${est(it.m)} 伤害`;
    case 'multi': return `连击 ×${it.hits} · 单次约 ${est(it.m)} 伤害`;
    case 'drain': return `吸取生命 · 约 ${est(it.m)} 伤害`;
    case 'buff': return `${it.b === 'atkUp' ? '攻击' : '防御'}强化 +${Math.round(it.v * 100)}% · ${it.d} 回合`;
    case 'debuff': return `诅咒 · ${CODEX_BUFF_NAMES[it.b] || it.b} · ${it.d} 回合`;
    case 'dot': return `毒焰 · ${CODEX_BUFF_NAMES[it.b] || it.b} · ${it.d} 回合`;
    case 'heal': return `回复 ${Math.round(it.v * 100)}% 最大生命`;
    default: return '未知动作';
  }
}

function openCodexEntry(key) {
  const base = ENEMIES[key] || BOSSES[key];
  if (!base) return;
  const isBoss = !!base.boss;
  const depth = codexDepthOf(key);
  const maxNg = Math.min(S.meta.ngPlus || 0, MAX_NG);
  const tags = (base.tags || []).map(t => CODEX_TAG_NAMES[t] || t).join(' · ');
  const goldTxt = base.gold ? `${base.gold[0]} ~ ${base.gold[1]}` : '—';
  const intents = (base.intents || []).map(it => `<div class="intent-line">▸ ${codexIntentText(it, base.atk, effStats().def)}</div>`).join('');
  const ngOpts = [];
  for (let lv = 0; lv <= maxNg; lv++) ngOpts.push(`<option value="${lv}">${ngInfo(lv).name}</option>`);

  modal({
    title: `${base.i} ${base.n}`,
    sub: `${isBoss ? 'BOSS' : 'BESTIARY'} · ${base.tags && base.tags.indexOf('boss') >= 0 ? '深渊首领' : '深渊生物'} · 基准层数 第 ${depth} 层${EXTREME_BOSS_FLOORS[key] || BIOMES[4].enemies.indexOf(key) >= 0 ? ' · 极限模式' : ''}`,
    size: 'wide',
    body: `
      <div class="cx-dlg">
        <div class="cx-col cx-col-l">
          <div class="cx-detail-top">
            <div class="cx-detail-emoji">${base.i}</div>
            <div style="min-width:0">
              <div style="font-family:var(--serif);font-size:17px;letter-spacing:2px;color:#ffe3bb">${base.n}</div>
              <div class="small dim" style="margin-top:5px">${tags} · 遭遇 ${S.codex[key] || 0} 次</div>
            </div>
          </div>
          <div class="cx-lore">${base.lore}</div>
          <div class="cx-sec">基础属性</div>
          <div class="grid2" style="gap:6px 14px">
            <div class="stat"><span class="stat-k">❤ 生命</span><span class="stat-v">${base.hp}</span></div>
            <div class="stat"><span class="stat-k">⚔ 攻击</span><span class="stat-v">${base.atk}</span></div>
            <div class="stat"><span class="stat-k">🛡 防御</span><span class="stat-v">${base.def}</span></div>
            <div class="stat"><span class="stat-k">💰 金币</span><span class="stat-v">${goldTxt}</span></div>
          </div>
          <div class="cx-sec">意图与技能</div>
          <div class="col" style="gap:5px">${intents || '<div class="small dim">无</div>'}</div>
        </div>
        <div class="cx-col cx-col-r">
          <div class="cx-sec" style="margin-top:0">难度对比</div>
          <div class="small dim" style="margin-bottom:8px;line-height:1.8">
            以「初临深渊（轮回 0）」为基准，对比所选轮回难度下的数值变化。仅可选择已解锁的难度（当前最高 ${ngInfo(maxNg).name}）。
          </div>
          <div class="cx-cmp-row">
            <span class="small muted">轮回难度</span>
            <select class="cx-select" id="cx-ng">${ngOpts.join('')}</select>
          </div>
          <div id="cx-cmp"></div>
        </div>
      </div>`,
    buttons: [{ label: '关闭', cls: 'btn-primary' }],
  });

  const sel = $('#cx-ng');
  if (sel) sel.onchange = () => renderCodexCompare(key, parseInt(sel.value, 10) || 0);
  renderCodexCompare(key, 0);
}

/* ---------------- 装备详情 ---------------- */
function openWeaponEntry(idx) {
  const b = ITEM_BASES[idx];
  if (!b) return;
  const baseStatHtml = Object.entries(b.s).map(([k, v]) =>
    `<div class="stat"><span class="stat-k">${STAT_NAME[k] || k}</span><span class="stat-v">+${v}</span></div>`
  ).join('');
  const rarRows = ['common', 'rare', 'epic', 'legend'].map(r => {
    const m = RARITY[r].mult;
    const stats = Object.entries(b.s).map(([k, v]) => `${STAT_NAME[k] || k} +${Math.round(v * m)}`).join('　');
    return `<div class="stat"><span class="stat-k" style="color:${RARITY[r].color}">${RARITY[r].n}</span><span class="stat-v small" style="color:var(--muted)">${stats}</span></div>`;
  }).join('');
  modal({
    title: `${b.ico} ${b.n}`,
    sub: `${SLOT_NAME[b.slot].toUpperCase()} · ${SLOT_NAME[b.slot]}基底`,
    size: 'wide',
    body: `
      <div class="cx-dlg">
        <div class="cx-col cx-col-l">
          <div class="cx-detail-top">
            <div class="cx-detail-emoji" style="border-color:${RARITY.legend.color}">${b.ico}</div>
            <div style="min-width:0">
              <div style="font-family:var(--serif);font-size:17px;letter-spacing:2px;color:#ffe3bb">${b.n}</div>
              <div class="small dim" style="margin-top:5px">${SLOT_ICON[b.slot]} ${SLOT_NAME[b.slot]} · 装备基底</div>
            </div>
          </div>
          <div class="cx-sec">基底属性</div>
          <div class="grid2" style="gap:6px 14px">${baseStatHtml}</div>
          <div class="small dim" style="margin-top:10px;line-height:1.8">实际掉落的装备会根据稀有度乘以对应倍率，并随机附加词缀。</div>
        </div>
        <div class="cx-col cx-col-r">
          <div class="cx-sec" style="margin-top:0">稀有度倍率</div>
          <div class="col" style="gap:5px">${rarRows}</div>
          <div class="cx-sec">可附加词缀</div>
          <div class="row" style="flex-wrap:wrap;gap:6px">
            ${AFFIXES.map(a => `<span class="pill" style="border-color:${RARITY.epic.color};color:#cfaeff">${a.n} +${a.r[0]}~${a.r[1]}</span>`).join('')}
          </div>
        </div>
      </div>`,
    buttons: [{ label: '关闭', cls: 'btn-primary' }],
  });
}

/* ---------------- 技能详情 ---------------- */
function openSkillEntry(key) {
  const sk = SKILLS[key];
  if (!sk) return;
  const rar = RARITY[sk.rar] || RARITY.common;
  modal({
    title: `${sk.i} ${sk.n}`,
    sub: `SKILL · ${rar.n}技能`,
    size: 'wide',
    body: `
      <div class="cx-dlg">
        <div class="cx-col cx-col-l">
          <div class="cx-detail-top">
            <div class="cx-detail-emoji" style="border-color:${rar.color}">${sk.i}</div>
            <div style="min-width:0">
              <div style="font-family:var(--serif);font-size:17px;letter-spacing:2px;color:#ffe3bb">${sk.n}</div>
              <div class="small dim" style="margin-top:5px">
                <span class="pill" style="border-color:${rar.color};color:${rar.color}">${rar.n}</span>
                　冷却 ${sk.cd} 回合
              </div>
            </div>
          </div>
          <div class="cx-sec">技能效果</div>
          <div class="cx-lore" style="font-size:14px;line-height:2;color:var(--text)">${sk.d}</div>
        </div>
        <div class="cx-col cx-col-r">
          <div class="cx-sec" style="margin-top:0">技能信息</div>
          <div class="grid2" style="gap:6px 14px">
            <div class="stat"><span class="stat-k">稀有度</span><span class="stat-v" style="color:${rar.color}">${rar.n}</span></div>
            <div class="stat"><span class="stat-k">冷却回合</span><span class="stat-v">${sk.cd}</span></div>
          </div>
          <div class="small dim" style="margin-top:12px;line-height:1.8">
            技能可在冒险中通过事件、商店或奖励获取。每局最多携带 4 个技能，初始拥有 3 个基础技能。
          </div>
        </div>
      </div>`,
    buttons: [{ label: '关闭', cls: 'btn-primary' }],
  });
}

function renderCodexCompare(key, ng) {
  const base = ENEMIES[key] || BOSSES[key];
  if (!base) return;
  const isBoss = !!base.boss;
  const depth = codexDepthOf(key);
  const a = enemyStatsAt(base, isBoss, 0, depth);
  const b = enemyStatsAt(base, isBoss, ng, depth);
  const pdef = effStats().def;
  const row = (label, x, y, fmtFn) => {
    const diff = y - x;
    const pct = x === 0 ? (diff === 0 ? '—' : '+∞') : (diff >= 0 ? '+' : '') + Math.round(diff / x * 100) + '%';
    const cls = diff > 0 ? 'up' : (diff < 0 ? 'down' : 'same');
    return `<div class="cmp-line">
      <span class="cmp-k">${label}</span>
      <span class="cmp-v">${fmtFn(x)}</span>
      <span class="cmp-arrow">→</span>
      <span class="cmp-v ${cls}">${fmtFn(y)}</span>
      <span class="cmp-d ${cls}">${pct}</span>
    </div>`;
  };
  const hit0 = Math.max(1, Math.round(a.atk * 1 * (1 - mitigation(pdef))));
  const hit1 = Math.max(1, Math.round(b.atk * 1 * (1 - mitigation(pdef))));
  const goldMul0 = 1;
  const goldMul1 = 1 + ng * 0.3;
  const g0 = base.gold ? Math.round(base.gold[0] * goldMul0) + '~' + Math.round(base.gold[1] * goldMul0) : '—';
  const g1 = base.gold ? Math.round(base.gold[0] * goldMul1) + '~' + Math.round(base.gold[1] * goldMul1) : '—';
  const html = `
    <div class="cmp-head"><span class="cmp-k">属性</span><span class="cmp-v">轮回 0</span><span class="cmp-arrow"></span><span class="cmp-v">${ngInfo(ng).name}</span><span class="cmp-d"></span></div>
    <div class="cmp-body">
      ${row('❤ 生命', a.hp, b.hp, v => Math.round(v))}
      ${row('⚔ 攻击', a.atk, b.atk, v => Math.round(v))}
      ${row('🛡 防御', a.def, b.def, v => Math.round(v))}
      ${row('💥 普攻对玩家伤害', hit0, hit1, v => Math.round(v))}
      <div class="cmp-line">
        <span class="cmp-k">💰 金币</span>
        <span class="cmp-v">${g0}</span>
        <span class="cmp-arrow">→</span>
        <span class="cmp-v ${ng > 0 ? 'up' : 'same'}">${g1}</span>
        <span class="cmp-d ${ng > 0 ? 'up' : 'same'}">${ng > 0 ? '+' + Math.round((goldMul1 - 1) * 100) + '%' : '—'}</span>
      </div>
    </div>
    ${ng === 0 ? '<div class="small dim center" style="margin-top:10px">当前正在与初始难度对比，切换上方难度查看差异。</div>' : ''}`;
  const el = $('#cx-cmp');
  if (el) el.innerHTML = html;
}

/* ---------------- 冒险流程 ---------------- */
// 放弃当前未完成的冒险（用于开始新冒险前），并退还本局开局增益消耗
function discardCurrentRun() {
  const src = (R && R.preBoon) ? R : (S.runSave && S.runSave.preBoon ? S.runSave : null);
  if (src && src.preBoon && src.preBoon.cost > 0) {
    S.meta.soulDust += src.preBoon.cost;
  }
  S.runSave = null;
  R = null;
  saveGame();
}

function startNewRun() {
  if (S.pendingSettlement) { showSettlementModal(S.pendingSettlement); return; }
  if (S.runSave) {
    modal({
      title: '放弃当前的冒险？', sub: 'YOUR RUN IS STILL ACTIVE',
      body: '你还记得深渊的气味。开始新的冒险会失去当前未完成的进度（已获得的魂尘保留）。',
      buttons: [
        { label: '继续当前冒险', cls: 'btn-primary', fn: () => continueRun() },
        { label: '开始新冒险', cls: 'btn-danger', fn: () => { discardCurrentRun(); showDifficultySelect(); } },
      ],
    });
    return;
  }
  showDifficultySelect();
}

function showDifficultySelect() {
  const maxUnlocked = Math.min(S.meta.ngPlus || 0, MAX_NG);
  const rows = [];
  for (let lv = 0; lv <= maxUnlocked; lv++) {
    const info = ngInfo(lv);
    const isMax = lv === maxUnlocked && lv < MAX_NG;
    rows.push(`<div class="choice" onclick="confirmDifficulty(${lv})">
      <b>${info.name}</b>${isMax ? ' <span class="pill tag-gold">当前最高</span>' : ''}${lv === 0 ? ' <span class="pill">标准</span>' : ''}
      <div class="small dim" style="margin-top:5px;line-height:1.7">${info.effects.join('　·　')}</div>
    </div>`);
  }
  // 预览未解锁的下两级
  for (let lv = maxUnlocked + 1; lv <= Math.min(maxUnlocked + 2, MAX_NG); lv++) {
    const info = ngInfo(lv);
    rows.push(`<div class="choice" style="opacity:.42;cursor:not-allowed">
      <b>🔒 ${info.name}</b>
      <div class="small dim" style="margin-top:5px;line-height:1.7">通关【${ngInfo(lv - 1).name}】解锁　·　${info.effects.join('　·　')}</div>
    </div>`);
  }
  modal({
    title: '选择轮回难度', sub: 'REINCARNATION DIFFICULTY · 最高 ' + MAX_NG,
    body: `<div class="small dim" style="margin-bottom:12px;line-height:1.8">
        已解锁至 <b style="color:var(--gold)">${ngInfo(maxUnlocked).name}</b>。难度越高，敌人越强，魂尘与得分倍率也越丰厚。<br>
        深渊统治者全局 buff 在所有难度中均生效。
      </div>${rows.join('')}`,
    buttons: [{ label: '取消', cls: 'btn-ghost' }],
  });
}

function confirmDifficulty(lv) {
  closeModal();
  if (allUpgradesMaxed()) openPreRunBuffs(lv);
  else beginRun(lv);
}

/* ---------------- 开局增益弹窗 ---------------- */
let preRunSel = null;
const BOON_RAR_TEXT = { common: '普通', rare: '精良', epic: '史诗', legend: '传说' };

function openPreRunBuffs(difficulty) {
  preRunSel = { difficulty: difficulty, skills: [], buffs: { hp: 0, atk: 0, def: 0, crit: 0 } };
  renderPreRunModal();
}

function toggleBoonSkill(id) {
  const sel = preRunSel;
  if (!sel) return;
  const i = sel.skills.indexOf(id);
  if (i >= 0) sel.skills.splice(i, 1);
  else {
    if (sel.skills.length >= BOON_SKILL_MAX) { toast(`最多选择 ${BOON_SKILL_MAX} 个技能`, '⚠️', 'warning'); return; }
    sel.skills.push(id);
  }
  renderPreRunModal(true);
}

function toggleBoonBuff(id) {
  const sel = preRunSel;
  if (!sel) return;
  const cur = sel.buffs[id] || 0;
  if (cur === 0 && boonBuffCount(sel) >= BOON_BUFF_MAX) {
    toast(`最多选择 ${BOON_BUFF_MAX} 项属性增益`, '⚠️', 'warning');
    return;
  }
  sel.buffs[id] = cur > 0 ? 0 : 1;
  renderPreRunModal(true);
}

function setBoonBuffTier(id, tier) {
  const sel = preRunSel;
  if (!sel) return;
  const cur = sel.buffs[id] || 0;
  if (cur === 0 && boonBuffCount(sel) >= BOON_BUFF_MAX) {
    toast(`最多选择 ${BOON_BUFF_MAX} 项属性增益`, '⚠️', 'warning');
    return;
  }
  // 再次点击同一突破按钮则回退到基础档；「+」与「++」互斥
  sel.buffs[id] = (cur === tier) ? 1 : tier;
  renderPreRunModal(true);
}

function preRunBodyHtml(sel) {
  const cost = preRunCalc(sel);
  const dust = S.meta.soulDust || 0;
  const lack = cost > dust;
  const skillCnt = sel.skills.length;
  const buffCnt = boonBuffCount(sel);

  const skillCards = SKILL_POOL.map(id => {
    const sk = SKILLS[id];
    const on = sel.skills.includes(id);
    const price = BOON_SKILL_COST[sk.rar] || 100;
    return `<div class="boon-item ${on ? 'sel' : ''}" onclick="toggleBoonSkill('${id}')">
      <div class="boon-head"><span>${sk.i} ${sk.n}</span><span class="cost">✨ ${fmt(price)}</span></div>
      <div class="small dim" style="line-height:1.6">${sk.d}</div>
      <div class="boon-rar">${BOON_RAR_TEXT[sk.rar] || '普通'} · CD ${sk.cd}</div>
    </div>`;
  }).join('');

  const buffRows = BOON_BUFFS.map(b => {
    const t = sel.buffs[b.id] || 0;
    const on = t > 0;
    const val = on ? b.vals[t - 1] : b.vals[0];
    return `<div class="boon-buff ${on ? 'sel' : ''}">
      <div class="boon-buff-main" onclick="toggleBoonBuff('${b.id}')">
        <div class="boon-buff-name">${b.i} ${b.n}</div>
        <div class="small dim" style="margin-top:2px">${b.key} +${val}${b.unit}${on ? `　<span style="color:var(--jade)">${t === 1 ? '基础' : (t === 2 ? '突破 +' : '突破 ++')}</span>` : '　（未选择）'}</div>
      </div>
      <div class="boon-btns">
        <button class="boon-plus ${t === 2 ? 'on' : ''}" title="突破：${b.key} +${b.vals[1]}${b.unit}" onclick="setBoonBuffTier('${b.id}',2)">+</button>
        <button class="boon-plus ${t === 3 ? 'on' : ''}" title="突破：${b.key} +${b.vals[2]}${b.unit}" onclick="setBoonBuffTier('${b.id}',3)">++</button>
      </div>
      <span class="cost" style="min-width:74px;justify-content:flex-end">${on ? '✨ ' + fmt(b.costs[t - 1]) : '—'}</span>
    </div>`;
  }).join('');

  return `
    <div class="small dim" style="margin-bottom:12px;line-height:1.9">
      本局难度：<b style="color:var(--gold)">${ngInfo(sel.difficulty).name}</b>　可用魂尘：<b style="color:var(--gold)">✨ ${fmt(dust)}</b><br>
      最多选择 <b>${BOON_SKILL_MAX}</b> 个技能（${skillCnt}/${BOON_SKILL_MAX}）与 <b>${BOON_BUFF_MAX}</b> 项属性增益（${buffCnt}/${BOON_BUFF_MAX}）。
      属性增益可点击「+ / ++」进行突破，消耗魂尘将大幅提升；两者互斥，只可点击其中一个。
    </div>
    <div class="card-t" style="font-size:14px;margin-bottom:8px">技能 · ${skillCnt}/${BOON_SKILL_MAX}</div>
    <div class="boon-skills">${skillCards}</div>
    <div class="card-t" style="font-size:14px;margin:16px 0 8px">属性增益 · ${buffCnt}/${BOON_BUFF_MAX}</div>
    <div class="col" style="gap:8px">${buffRows}</div>
    <div class="row between" style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line)">
      <span class="small muted">本局开局增益消耗（放弃冒险将全额退还）</span>
      <span class="cost" style="color:${lack ? '#ff8b9a' : 'var(--gold)'}">✨ ${fmt(cost)}</span>
    </div>
    ${lack ? '<div class="small" style="color:#ff8b9a;margin-top:8px">魂尘不足，请减少所选增益后再开始。</div>' : ''}`;
}

function preRunConfirmLabel(cost) {
  return cost > 0 ? `支付 ✨ ${fmt(cost)} 并踏入深渊` : '直接踏入深渊';
}

// updateOnly=true 时只刷新弹窗内容，不重建弹窗骨架（避免每次点击闪一下）
function renderPreRunModal(updateOnly) {
  const sel = preRunSel;
  if (!sel) return;
  const cost = preRunCalc(sel);

  if (updateOnly) {
    const bodyEl = $('#modal-root .modal-body');
    if (bodyEl) {
      const sc = bodyEl.scrollTop;
      bodyEl.innerHTML = preRunBodyHtml(sel);
      bodyEl.scrollTop = sc;
      const okBtn = $('#modal-root .modal-foot [data-mi="1"]');
      if (okBtn) okBtn.textContent = preRunConfirmLabel(cost);
      return;
    }
  }

  const prevScroll = $('#modal-root .modal-body') ? $('#modal-root .modal-body').scrollTop : 0;
  modal({
    size: 'wide',
    title: '开局增益', sub: 'PRE-RUN BOONS · 以魂尘换取这一次的开局优势',
    body: preRunBodyHtml(sel),
    buttons: [
      { label: '返回难度选择', cls: 'btn-ghost', fn: () => showDifficultySelect() },
      { label: preRunConfirmLabel(cost), cls: 'btn-primary', fn: () => purchasePreRun() },
    ],
  });
  const bodyEl = $('#modal-root .modal-body');
  if (bodyEl) bodyEl.scrollTop = prevScroll;
}

function purchasePreRun() {
  const sel = preRunSel;
  if (!sel) return;
  const cost = preRunCalc(sel);
  if (cost > (S.meta.soulDust || 0)) { toast('魂尘不足，无法购买所选开局增益', '✨', 'error'); return; }
  const boon = {
    cost: cost,
    skills: sel.skills.slice(),
    buffs: Object.assign({}, sel.buffs),
  };
  const difficulty = sel.difficulty;
  preRunSel = null;
  closeModal();
  beginRun(difficulty, boon);
}

function beginRun(difficulty, boon) {
  const ng = difficulty !== undefined ? Math.max(0, Math.min(MAX_NG, difficulty | 0)) : (S.meta.ngPlus || 0);
  const u = S.meta.upgrades;
  R = {
    depth: 1, gold: 70 + ng * 20, hp: 0, potions: 2 + (u.potion || 0),
    potionCap: 3 + (u.potion || 0),
    bonusHp: 0, bonusAtk: 0, bonusDef: 0, bonusCrit: 0,
    skills: [], equip: { weapon: [], armor: [], trinket: [] },
    revived: false, usedPotion: false, bossKills: 0, ng: ng, ngAtStart: ng,
    choices: null, choicesFor: -1, shop: null, shopFor: -1,
    skipFloor: false, cursed: false, extreme: false, extremeAllowed: !!S.meta.extreme,
    kills: 0, itemsLog: [], bossLog: [],
    maxItems: 0, maxAtk: 0, maxDef: 0, maxCritDmg: 0, maxHp: 0,
    dev: S.meta.dev ? Object.assign({}, S.meta.dev) : undefined,
  };
  const pool = shuffle(STARTER_SKILLS.slice());
  R.skills = [pool[0]];
  for (let i = 0; i < (u.memory || 0); i++) {
    const avail = SKILL_POOL.filter(s => !R.skills.includes(s));
    if (avail.length) R.skills.push(pick(avail));
  }
  // 开局增益：扣魂尘、发放技能与属性增益（放弃冒险时全额退还）
  if (boon && boon.cost > 0) {
    S.meta.soulDust -= boon.cost;
    R.preBoon = { cost: boon.cost };
    (boon.skills || []).forEach(id => {
      if (SKILLS[id] && !R.skills.includes(id)) R.skills.push(id);
    });
    BOON_BUFFS.forEach(b => {
      const t = (boon.buffs && boon.buffs[b.id]) || 0;
      if (t <= 0) return;
      const v = b.vals[t - 1];
      if (b.id === 'hp') R.bonusHp += v;
      else if (b.id === 'atk') R.bonusAtk += v;
      else if (b.id === 'def') R.bonusDef += v;
      else if (b.id === 'crit') R.bonusCrit += v;
    });
    toast('开局增益已生效', '🌠', 'success');
  }
  R.hp = effStats().maxHp;
  runView = 'choices';
  pendingItems = [];
  S.stats.maxDepth = Math.max(S.stats.maxDepth, 1);
  saveRunState();
  sfx('win');
  renderRun();
  showScreen('run');
}

function continueRun() {
  if (S.pendingSettlement) { showSettlementModal(S.pendingSettlement); return; }
  if (!S.runSave) { toast('没有可继续的冒险', '❔'); return; }
  R = JSON.parse(JSON.stringify(S.runSave));
  if (!R.skills) R.skills = ['fireSlash'];
  if (!R.equip) R.equip = { weapon: [], armor: [], trinket: [] };
  // 兼容旧存档：单物品格式转为数组
  for (const slot of ['weapon', 'armor', 'trinket']) {
    if (!Array.isArray(R.equip[slot])) R.equip[slot] = R.equip[slot] ? [R.equip[slot]] : [];
  }
  if (!R.itemsLog) R.itemsLog = [];
  if (!R.bossLog) R.bossLog = [];
  if (R.kills === undefined) R.kills = 0;
  if (R.extreme === undefined) R.extreme = false;
  if (R.extremeAllowed === undefined) R.extremeAllowed = !!S.meta.extreme;
  if (R.ng === undefined) R.ng = R.ngAtStart !== undefined ? R.ngAtStart : (S.meta.ngPlus || 0);
  R.ngAtStart = R.ng;
  if (R.maxItems === undefined) R.maxItems = 0;
  if (R.maxAtk === undefined) R.maxAtk = 0;
  if (R.maxDef === undefined) R.maxDef = 0;
  if (R.maxCritDmg === undefined) R.maxCritDmg = 0;
  if (R.maxHp === undefined) R.maxHp = 0;
  R.choicesFor = -1; R.shopFor = -1;
  runView = 'choices';
  pendingItems = [];
  renderRun();
  showScreen('run');
  toast('冒险继续 · 第 ' + R.depth + ' 层', '⛏️');
}

function saveRunState() {
  if (!R) return;
  S.runSave = JSON.parse(JSON.stringify(R));
  saveGame();
}

function genChoices(depth) {
  if (isBossFloor(depth)) return [{ type: 'boss' }];
  const pool = R && R.extreme
    ? [['battle', 32], ['elite', 18], ['treasure', 15], ['shop', 11], ['campfire', 10], ['event', 14]]
    : [['battle', 34], ['elite', 12], ['treasure', 16], ['shop', 12], ['campfire', 12], ['event', 14]];
  const out = []; const used = new Set();
  let guard = 0;
  while (out.length < 3 && guard++ < 100) {
    const t = wpick(pool);
    if (used.has(t)) continue;
    used.add(t); out.push({ type: t });
  }
  return out;
}

const ROOM_META = {
  battle:   { n: '战斗', i: '⚔️', d: '与深渊的住民交锋，赢取金币与战利品', cls: '' },
  elite:    { n: '精英战斗', i: '🔱', d: '强大的敌人，更丰厚的奖励', cls: 'elite' },
  treasure: { n: '宝箱', i: '🎁', d: '未知的装备与金币，任你挑选', cls: '' },
  shop:     { n: '流浪商人', i: '🛒', d: '用金币换取补给、装备与技能', cls: 'shop' },
  campfire: { n: '营火', i: '🔥', d: '休整、强化自身，或恢复生命', cls: 'camp' },
  event:    { n: '奇遇', i: '❓', d: '未知的命运在等待着你', cls: '' },
  boss:     { n: '首领', i: '👑', d: '这一层的守卫者，击败它才能继续深入', cls: 'boss' },
};

function playerPanelHtml() {
  const s = effStats();
  const hpPct = clamp(R.hp / s.maxHp * 100, 0, 100);
  const eq = ['weapon', 'armor', 'trinket'].map(k => {
    const arr = R.equip[k] || [];
    const best = arr.length ? arr.reduce((a, b) => (a.score > b.score ? a : b)) : null;
    return `<div class="stat" style="padding:6px 9px">
      <span class="stat-k">${SLOT_ICON[k]} ${SLOT_NAME[k]}</span>
      <span class="small" style="color:${best ? RARITY[best.rarity].color : 'var(--dim)'};max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${best ? best.name + (arr.length > 1 ? ` ×${arr.length}` : '') : '空'}</span>
    </div>`;
  }).join('');
  const totalEquip = (R.equip.weapon.length || 0) + (R.equip.armor.length || 0) + (R.equip.trinket.length || 0);
  const sk = R.skills.map(id => `<span class="pill" style="border-color:rgba(150,130,255,.4);color:#c9bcff">${SKILLS[id].i} ${SKILLS[id].n}</span>`).join('');
  return `<div class="card">
    <div class="row between" style="margin-bottom:10px">
      <div><div class="card-t" style="font-size:15px">无名者</div><div class="card-sub">第 ${R.depth} 层 · 堕落者</div></div>
      <div class="pill tag-rose">💰 ${fmt(R.gold)}</div>
    </div>
    <div class="bar hp"><div class="bar-fill" style="width:${hpPct}%"></div></div>
    <div class="row between small" style="margin-top:6px">
      <span class="muted">❤ ${Math.round(R.hp)} / ${s.maxHp}</span>
      <span class="muted">🧪 ${R.potions} / ${R.potionCap}</span>
    </div>
    <div class="pstat-grid">
      <div class="pstat"><b>${Math.round(s.atk)}</b><span>攻击</span></div>
      <div class="pstat"><b>${Math.round(s.def)}</b><span>防御</span></div>
      <div class="pstat"><b>${Math.round(s.crit)}%</b><span>暴击</span></div>
      <div class="pstat"><b>${Math.round(s.critDmg)}%</b><span>暴伤</span></div>
    </div>
    <div class="divider" style="margin:12px 0"></div>
    <div class="col" style="gap:6px">${eq}</div>
    <button class="btn btn-ghost btn-block btn-sm" style="margin-top:10px" onclick="showBackpack()">🎒 背包（${totalEquip} 件装备 · ${R.potions} 药水）</button>
    <div class="divider" style="margin:12px 0"></div>
    <div class="card-sub" style="margin-bottom:7px">已掌握技能</div>
    <div class="row" style="flex-wrap:wrap;gap:6px">${sk || '<span class="dim small">无</span>'}</div>
  </div>`;
}

function floorTrackHtml() {
  let out = '';
  const cap = depthCapOf();
  for (let i = 1; i <= cap; i++) {
    const isBoss = isBossFloor(i);
    const cls = ['fp'];
    if (isBoss) cls.push('boss');
    if (i < R.depth) cls.push('done');
    else if (i === R.depth) cls.push('cur');
    out += `<div class="${cls.join(' ')}" title="第 ${i} 层${isBoss ? ' · 首领' : ''}"></div>`;
  }
  return `<div class="floor-track">${out}</div>`;
}

function renderRun() {
  if (!R) { goHub(); return; }
  trackRunPeaks();
  if (!R.choices || R.choicesFor !== R.depth) { R.choices = genChoices(R.depth); R.choicesFor = R.depth; }
  const bm = biomeOf(R.depth);
  let main = '';

  if (runView === 'choices') {
    const cards = R.choices.map((c, i) => {
      const m = ROOM_META[c.type];
      return `<div class="room ${m.cls}" onclick="enterRoom(${i})">
        <div class="room-icon">${m.i}</div>
        <div class="room-name">${m.n}</div>
        <div class="room-desc">${m.d}</div>
      </div>`;
    }).join('');
    main = `<div class="card">
      <div class="card-h"><span>🧭</span><div><div class="card-t">选择前进的方向</div><div class="card-sub">每层只能选择一处，无法回头</div></div></div>
      <div class="rooms" ${R.choices.length === 1 ? 'style="grid-template-columns:1fr;max-width:420px;margin:18px auto 0"' : ''}>${cards}</div>
      ${isBossFloor(R.depth) ? `<div class="small dim center" style="margin-top:16px">深重的压迫感扑面而来……这一层只有一位守卫者。</div>` : ''}
    </div>`;
  }

  if (runView === 'shop') main = shopHtml();
  if (runView === 'campfire') main = campfireHtml();
  if (runView === 'treasure') main = treasureHtml();
  if (runView === 'event') main = eventHtml();

  $('#screen-run').innerHTML = `
    <div class="depth-head">
      <div class="depth-badge"><div class="depth-num">${R.depth}</div><div class="depth-lbl">DEPTH</div></div>
      <div>
        <div class="biome-name">${bm.name}</div>
        <div class="biome-sub">${bm.sub}</div>
      </div>
      <div style="margin-left:auto" class="row" style="gap:8px;flex-wrap:wrap">
        <span class="pill tag-gold">🔄 ${ngInfo(R.ng || 0).name}</span>
        ${R.extreme ? '<span class="pill tag-rose">🩸 极限模式</span>' : ''}
        ${hasRulerBuff() ? '<span class="pill tag-jade">👑 深渊统治者</span>' : ''}
        <button class="btn btn-sm btn-ghost" onclick="abandonRun()">放弃冒险</button>
      </div>
    </div>
    ${floorTrackHtml()}
    <div class="battle">
      <div id="run-main">${main}</div>
      <div class="panel-b">${playerPanelHtml()}</div>
    </div>`;
  renderTopbar();
}

function abandonRun() {
  modal({
    title: '放弃这次冒险？', sub: 'ABANDON RUN',
    body: '你会带着已获得的魂尘回到圣所，本局的成长会全部消失。若本局购买过开局增益，消耗的魂尘将全额退还。',
    buttons: [
      { label: '继续深入', cls: 'btn-primary' },
      { label: '放弃', cls: 'btn-danger', fn: () => { finishRun(false, true); } },
    ]
  });
}

function enterRoom(i) {
  const c = R.choices[i];
  if (!c) return;
  sfx('click');
  if (c.type === 'battle') startBattle('normal');
  else if (c.type === 'elite') startBattle('elite');
  else if (c.type === 'boss') startBattle('boss');
  else if (c.type === 'shop') { runView = 'shop'; renderShop(); }
  else if (c.type === 'campfire') { runView = 'campfire'; renderRun(); }
  else if (c.type === 'treasure') { runView = 'treasure'; genTreasure(); renderRun(); }
  else if (c.type === 'event') { runView = 'event'; genEvent(); renderRun(); }
}

function clearRoom() {
  if (!R) return;
  flushItems(() => {
    S.stats.rooms++;
    R.kills = R.kills || 0;
    const xm = extremeMul();
    R.bonusHp += Math.round(11 * xm); R.bonusAtk += 2.2 * xm; R.bonusDef += 1.2 * xm;
    R.hp = Math.min(effStats().maxHp, R.hp + Math.round(effStats().maxHp * 0.1));
    let step = 1;
    if (R.skipFloor) { step = 2; R.skipFloor = false; }
    R.depth += step;
    S.stats.maxDepth = Math.max(S.stats.maxDepth, R.extreme ? Math.min(R.depth, EXTREME_MAX_DEPTH) : R.depth);
    runView = 'choices';
    R.choicesFor = -1;
    const cap = depthCapOf();
    if (R.depth > cap) {
      // 通过第 13 层（基础深渊最终层）：按本局开局锁定的极限模式状态决定是否弹出提升层数的提示
      if (!R.extreme && R.extremeAllowed && (R.ng || 0) >= EXTREME_UNLOCK_NG) {
        promptExtreme();
        return;
      }
      finishRun(true);
      return;
    }
    saveRunState();
    checkAch();
    renderRun();
    showScreen('run');
  });
}

/* ---------------- 极限模式 ---------------- */
function promptExtreme() {
  R.depth = MAX_DEPTH + 1;
  saveRunState();
  modal({
    title: '极限模式现已可用', sub: 'EXTREME MODE · 越界之后，深渊仍有尽头',
    body: `<div style="font-size:13.5px;line-height:2">极限模式现已可用，是否要启用该模式并将探索的层数提高到 <b style="color:#ff8b9a">20</b>？<br>
      <span class="small dim" style="display:block;margin-top:10px;line-height:1.9">
        · 深红深渊笼罩整座遗迹，敌人数值大幅提升；<br>
        · 全新精英与三位极限首领登场；<br>
        · 你的增益与事件馈赠同样被深渊放大；<br>
        · 通关后魂尘奖励大幅提升。
      </span></div>`,
    buttons: [
      { label: '暂不启用 · 结算本局', cls: 'btn-ghost', fn: () => finishRun(true) },
      { label: '启用极限模式', cls: 'btn-danger', fn: () => enterExtreme() },
    ],
    size: 'extreme',
  });
}

function enterExtreme() {
  R.extreme = true;
  R.depth = MAX_DEPTH + 1;
  renderTopbar();
  saveRunState();
  toast('极限模式已启用 · 探索上限提升至 20 层', '🩸', 'warning');
  runView = 'choices';
  R.choicesFor = -1;
  renderRun();
  showScreen('run');
}

/* 圣所 · 极限模式开关（轮回难度 ≥ 10 才可开启；冒险进行中不可调整） */
function toggleExtremeMode() {
  if (S.runSave) {
    toast('冒险进行中 · 本局结束前无法调整极限模式', '🔒', 'warning');
    return;
  }
  if ((S.meta.ngPlus || 0) < EXTREME_UNLOCK_NG) {
    toast(`轮回难度达到 ${EXTREME_UNLOCK_NG} 后才可开启极限模式`, '🔒', 'warning');
    return;
  }
  S.meta.extreme = !S.meta.extreme;
  saveGame();
  sfx('click');
  toast(S.meta.extreme ? '极限模式已开启 · 通关第 13 层后可进入 20 层深渊' : '极限模式已关闭 · 通关第 13 层后直接结算',
    '🩸', S.meta.extreme ? 'success' : 'info');
  renderHub();
}

/* ---------------- 装备获取 ---------------- */
function addItem(it) {
  S.stats.itemsFound++;
  pendingItems.push(it);
}

function flushItems(cb) {
  if (!pendingItems.length) { cb && cb(); return; }
  const it = pendingItems.shift();
  if (R) { R.itemsLog = R.itemsLog || []; R.itemsLog.push({ n: it.name, r: it.rarity, i: it.ico }); }
  offerItem(it, () => flushItems(cb));
}

function offerItem(it, cb) {
  const arr = R.equip[it.slot] || [];
  const best = arr.length ? arr.reduce((a, b) => (a.score > b.score ? a : b)) : null;
  const rr = RARITY[it.rarity];
  const better = !best || it.score > best.score;
  modal({
    title: '获得物品', sub: `${rr.n} · ${SLOT_NAME[it.slot]}（已持有 ${arr.length} 件）`,
    body: `<div class="row" style="gap:14px;align-items:flex-start">
      <div class="offer-ico" style="width:58px;height:58px;font-size:27px;border-color:${rr.color};box-shadow:0 0 26px -10px ${rr.color}">${it.ico}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:16px;font-weight:700;color:${rr.color}">${it.name}</div>
        <div class="small muted" style="margin-top:5px">${statLines(it.stats).join(' · ')}</div>
        ${best ? `<div class="small dim" style="margin-top:8px">当前最强：${best.name}<br>${statLines(best.stats).join(' · ')}</div>` : ''}
        <div class="row" style="margin-top:9px;gap:8px">
          <span class="pill ${better ? 'tag-jade' : ''}">${better ? '▲ 更适合你' : '▼ 略逊一筹'}</span>
          <span class="pill tag-gold">估价 ${it.price} 金</span>
        </div>
        <div class="small dim" style="margin-top:8px;line-height:1.7">所有同类装备可同时携带并叠加生效。</div>
      </div>
    </div>`,
    buttons: [
      { label: '装备', cls: 'btn-primary', fn: () => { equipItem(it); toast('已装备 ' + it.name, it.ico); cb && cb(); } },
      { label: `熔解 +${it.price} 金`, cls: 'btn-ghost', fn: () => { addGold(it.price); toast('+' + it.price + ' 金币', '💰'); cb && cb(); } },
    ],
  });
}

function equipItem(it) {
  if (!Array.isArray(R.equip[it.slot])) R.equip[it.slot] = [];
  R.equip[it.slot].push(it);
  if (it.rarity === 'legend') S.stats.legendEquipped++;
  if (R.equip.weapon.length && R.equip.armor.length && R.equip.trinket.length) S.stats.fullSet = 1;
  R.hp = Math.min(R.hp, effStats().maxHp);
  checkAch();
}

function removeEquip(it) {
  const arr = R.equip[it.slot];
  if (!Array.isArray(arr)) return;
  const idx = arr.indexOf(it);
  if (idx >= 0) arr.splice(idx, 1);
}

/* ---------------- 背包弹窗 ---------------- */
function showBackpack() {
  if (!R) return;
  const slotOrder = ['weapon', 'armor', 'trinket'];
  const groups = slotOrder.map(slot => {
    const arr = R.equip[slot] || [];
    const list = arr.map((it, i) => {
      const rr = RARITY[it.rarity];
      return `<div class="cx" style="padding:10px 12px">
        <div class="cx-top" style="margin-bottom:4px">
          <div class="cx-emoji" style="width:36px;height:36px;font-size:20px;border-color:${rr.color}">${it.ico}</div>
          <div style="min-width:0">
            <div class="cx-n" style="color:${rr.color}">${it.name}</div>
            <div class="small dim">${SLOT_NAME[it.slot]} · 估价 ${it.price} 金</div>
          </div>
        </div>
        <div class="row small" style="gap:8px;flex-wrap:wrap">
          ${statLines(it.stats).map(s => `<span style="color:${RARITY.rare.color}">${s}</span>`).join('')}
        </div>
      </div>`;
    }).join('');
    return `<div class="cx-sec" style="margin:0 0 10px"><span>${SLOT_ICON[slot]} ${SLOT_NAME[slot]} · ${arr.length} 件</span></div>
            <div class="grid-auto" style="margin-bottom:16px">${list || '<div class="small dim">无</div>'}</div>`;
  }).join('');

  const total = (R.equip.weapon.length || 0) + (R.equip.armor.length || 0) + (R.equip.trinket.length || 0);
  modal({
    title: '🎒 背包',
    sub: `BACKPACK · 本局持有 · ${total} 件装备 · ${R.potions} 瓶药水`,
    size: 'wide',
    body: `
      <div class="settle-grid" style="grid-template-columns:1fr">
        <div>
          <div class="row" style="gap:10px;flex-wrap:wrap;margin-bottom:6px">
            <span class="pill tag-rose">🧪 治疗药水 × ${R.potions} / ${R.potionCap}</span>
            <span class="pill tag-gold">💰 ${fmt(R.gold)} 金币</span>
          </div>
          ${groups}
        </div>
      </div>
      <div class="small dim" style="margin-top:8px;line-height:1.8">所有同类装备属性同时叠加生效。</div>`,
    buttons: [{ label: '关闭', cls: 'btn-primary' }],
  });
}

/* ---------------- 商店 ---------------- */
function buildShop() {
  const offers = [];
  for (let i = 0; i < 3; i++) {
    const it = genItem(R.depth, rollRarity(R.depth + 1));
    offers.push({ kind: 'item', it, price: Math.round(it.price * 1.15), sold: false });
  }
  offers.push({ kind: 'potion', price: 34, sold: false });
  const buffs = [
    { k: 'bonusHp', v: 26, n: '生命药剂', d: '最大生命 +26', i: '❤️' },
    { k: 'bonusAtk', v: 4, n: '力量药剂', d: '攻击 +4', i: '⚔️' },
    { k: 'bonusDef', v: 3, n: '石肤药剂', d: '防御 +3', i: '🛡️' },
    { k: 'bonusCrit', v: 6, n: '锐目药剂', d: '暴击率 +6%', i: '🎯' },
  ];
  const bf = pick(buffs);
  offers.push({ kind: 'buff', ...bf, price: 62, sold: false });
  const known = R.skills;
  const avail = SKILL_POOL.filter(s => !known.includes(s));
  if (avail.length) {
    const sid = pick(avail);
    offers.push({ kind: 'skill', sid, price: 120 + R.depth * 6, sold: false });
  }
  return offers;
}

function renderShop() {
  if (!R.shop || R.shopFor !== R.depth) { R.shop = buildShop(); R.shopFor = R.depth; }
  renderRun();
}

function shopHtml() {
  const rows = R.shop.map((o, i) => {
    let ico = '❔', name = '', desc = '', rc = '#9fb6e6';
    if (o.kind === 'item') {
      ico = o.it.ico; name = o.it.name; rc = RARITY[o.it.rarity].color;
      desc = `${SLOT_NAME[o.it.slot]} · ${statLines(o.it.stats).join(' · ')}`;
      name = `<span style="color:${rc}">${name}</span>`;
    } else if (o.kind === 'potion') {
      ico = '🧪'; name = '治疗药水'; desc = '战斗中回复 42% 最大生命'; rc = '#ff8fa8';
    } else if (o.kind === 'buff') {
      ico = o.i; name = o.n; desc = o.d + '（本局永久）'; rc = '#ffcf6b';
    } else if (o.kind === 'skill') {
      const sk = SKILLS[o.sid];
      ico = sk.i; name = sk.n; desc = sk.d + ` （冷却 ${sk.cd} 回合）`; rc = '#b9a8ff';
    }
    const can = !o.sold && R.gold >= o.price;
    return `<div class="offer ${o.sold ? 'sold' : ''}" style="--rc:${rc}">
      <div class="offer-ico">${ico}</div>
      <div style="min-width:0">
        <div class="offer-name">${name}</div>
        <div class="offer-desc">${desc}</div>
      </div>
      <div class="col" style="align-items:flex-end;gap:5px">
        <span class="cost">💰 ${o.price}</span>
        <button class="btn btn-sm ${can ? 'btn-primary' : 'btn-ghost'}" ${can ? '' : 'disabled'} onclick="buyOffer(${i})">${o.sold ? '已售出' : '购买'}</button>
      </div>
    </div>`;
  }).join('');

  return `<div class="card">
    <div class="card-h"><span>🛒</span><div><div class="card-t">流浪商人</div><div class="card-sub">"金币在深渊里也会腐坏，不如交给我。"</div></div>
      <div style="margin-left:auto" class="pill tag-gold">💰 ${fmt(R.gold)}</div></div>
    <div class="col" style="gap:10px">${rows}</div>
    <div class="divider"></div>
    <div class="row" style="gap:10px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" ${R.gold >= 30 ? '' : 'disabled'} onclick="rerollShop()">🔄 刷新商品（30 金）</button>
      <button class="btn btn-jade btn-sm" style="margin-left:auto" onclick="leaveShop()">离开商店 →</button>
    </div>
  </div>`;
}

function buyOffer(i) {
  const o = R.shop[i];
  if (!o || o.sold || R.gold < o.price) return;
  R.gold -= o.price;
  o.sold = true;
  S.stats.buys++;
  sfx('buy');
  if (o.kind === 'item') { pendingItems.push(o.it); }
  else if (o.kind === 'potion') { R.potions = Math.min(R.potionCap, R.potions + 1); toast('药水 +1', '🧪'); }
  else if (o.kind === 'buff') {
    R[o.k] += o.v;
    if (o.k === 'bonusHp') R.hp = Math.min(effStats().maxHp, R.hp + o.v);
    toast(o.n + ' 生效', o.i);
  }
  else if (o.kind === 'skill') { R.skills.push(o.sid); toast('学会技能 ' + SKILLS[o.sid].n, SKILLS[o.sid].i); }
  checkAch();
  saveRunState();
  if (o.kind === 'item') { flushItems(() => renderRun()); }
  else renderRun();
}

function rerollShop() {
  if (R.gold < 30) return;
  R.gold -= 30; sfx('click');
  R.shop = buildShop(); R.shopFor = R.depth;
  renderRun();
}

function leaveShop() { clearRoom(); }

/* ---------------- 营火 ---------------- */
function campfireHtml() {
  const s = effStats();
  const opts = [
    { i: '🌙', n: '休息', d: `回复 ${Math.round(s.maxHp * 0.45)} 点生命`, fn: 'campHeal' },
    { i: '⚔️', n: '磨砺武器', d: '攻击永久 +3', fn: 'campAtk' },
    { i: '🛡️', n: '加固护甲', d: '防御永久 +3', fn: 'campDef' },
    { i: '❤️', n: '锻炼体魄', d: `最大生命永久 +24（并回复）`, fn: 'campHp' },
  ];
  return `<div class="card">
    <div class="card-h"><span>🔥</span><div><div class="card-t">营火</div><div class="card-sub">火焰温暖，但时间不多——只能选择一件事</div></div></div>
    <div class="rooms" style="grid-template-columns:repeat(2,1fr)">
      ${opts.map(o => `<div class="room" onclick="${o.fn}()">
        <div class="room-icon">${o.i}</div>
        <div class="room-name">${o.n}</div>
        <div class="room-desc">${o.d}</div>
      </div>`).join('')}
    </div>
  </div>`;
}
function campHeal() { healPlayer(Math.round(effStats().maxHp * 0.45)); toast('你休息了一会儿', '🌙'); clearRoom(); }
function campAtk() { R.bonusAtk += 3; toast('武器更加锋利（攻击 +3）', '⚔️'); clearRoom(); }
function campDef() { R.bonusDef += 3; toast('护甲更加坚固（防御 +3）', '🛡️'); clearRoom(); }
function campHp() { R.bonusHp += 24; healPlayer(24); toast('体格更加强健（最大生命 +24）', '❤️'); clearRoom(); }

/* ---------------- 宝箱 ---------------- */
function genTreasure() {
  R.treasure = {
    items: [genItem(R.depth, rollRarity(R.depth + 1)), genItem(R.depth, rollRarity(R.depth + 1))],
    gold: rnd(50, 110) + R.depth * 14,
  };
}
function treasureHtml() {
  const t = R.treasure;
  return `<div class="card">
    <div class="card-h"><span>🎁</span><div><div class="card-t">尘封的宝箱</div><div class="card-sub">选择一件带走，宝箱随之崩解</div></div></div>
    <div class="col" style="gap:10px">
      ${t.items.map((it, i) => {
        const rr = RARITY[it.rarity];
        return `<div class="offer" style="--rc:${rr.color};cursor:pointer" onclick="takeTreasure(${i})">
          <div class="offer-ico" style="border-color:${rr.color};box-shadow:0 0 22px -12px ${rr.color}">${it.ico}</div>
          <div><div class="offer-name" style="color:${rr.color}">${it.name}</div>
          <div class="offer-desc">${SLOT_NAME[it.slot]} · ${statLines(it.stats).join(' · ')}</div></div>
          <div class="cost">选择 →</div>
        </div>`;
      }).join('')}
      <div class="offer" style="--rc:var(--gold);cursor:pointer" onclick="takeTreasure(9)">
        <div class="offer-ico">💰</div>
        <div><div class="offer-name" style="color:var(--gold)">一把金币</div><div class="offer-desc">直接获得 ${t.gold} 金币</div></div>
        <div class="cost">选择 →</div>
      </div>
    </div>
  </div>`;
}
function takeTreasure(i) {
  if (i === 9) { addGold(R.treasure.gold); toast('+' + R.treasure.gold + ' 金币', '💰'); }
  else { pendingItems.push(R.treasure.items[i]); }
  sfx('buy');
  clearRoom();
}

/* ---------------- 奇遇事件 ---------------- */
function genEvent() {
  const used = R.usedEvents || (R.usedEvents = []);
  let pool = EVENTS.filter(e => !used.includes(e.id));
  if (!pool.length) { used.length = 0; pool = EVENTS; }
  const ev = pick(pool);
  used.push(ev.id);
  R.ev = ev;
}
function eventHtml() {
  const ev = R.ev;
  return `<div class="card">
    <div class="card-h"><span>${ev.i}</span><div><div class="card-t">${ev.n}</div><div class="card-sub">奇遇 · EVENT</div></div></div>
    <div style="font-size:13.5px;line-height:2;color:var(--muted);padding:4px 2px 6px">${ev.d}</div>
    <div class="divider"></div>
    <div class="col" style="gap:9px">
      ${ev.choices.map((c, i) => `<button class="choice" onclick="doEvent(${i})">${c.label}</button>`).join('')}
    </div>
  </div>`;
}
function doEvent(i) {
  const ev = R.ev;
  const choice = ev.choices[i];
  S.stats.events++;
  let text = '';
  try { text = choice.fn() || '什么也没有发生。'; } catch (e) { text = '命运拒绝了你的选择。'; console.warn(e); }
  // 极限模式：事件给予的效果被深渊放大
  if (R.extreme) {
    R.bonusAtk += 5; R.bonusDef += 4; R.bonusHp += 30; R.bonusCrit += 4;
    R.hp = Math.min(effStats().maxHp, R.hp + 20);
    text += '<br><span style="color:#ff9aa8">极限的馈赠：攻击 +5 · 防御 +4 · 生命上限 +30 · 暴击率 +4% · 回复 20 生命。</span>';
  }
  saveRunState();
  checkAch();
  modal({
    title: '命运的回音', sub: ev.n,
    body: `<div style="font-size:14px;line-height:2;color:#d8e2f5">${text}</div>`,
    buttons: [{ label: '继续深入 →', cls: 'btn-primary', fn: () => { runView = 'choices'; clearRoom(); } }],
  });
  renderRun();
}

/* ---------------- 技能获取 ---------------- */
function grantRandomSkill() {
  const avail = SKILL_POOL.filter(s => !R.skills.includes(s));
  if (!avail.length) return null;
  const id = pick(avail);
  R.skills.push(id);
  return SKILLS[id];
}

/* =============== NEXT SCRIPT BLOCK =============== */

/* ============================================================
   战斗流程 / 结算 / 初始化
   ============================================================ */

function startBattle(kind) {
  const bm = biomeOf(R.depth);
  const ng = R.ng || 0;
  const key = kind === 'boss' ? bossKeyOf(R.depth) : pick(bm.enemies);
  const base = kind === 'boss' ? BOSSES[key] : ENEMIES[key];
  let hpMul = 1 + (R.depth - 1) * 0.075 + ng * 0.35;
  let atkMul = 1 + (R.depth - 1) * 0.042 + ng * 0.25;
  if (kind === 'boss') { hpMul = 1 + ng * 0.45; atkMul = 1 + ng * 0.3; }
  if (kind === 'elite') { hpMul *= 1.9; atkMul *= 1.22; }
  // 极限模式：敌人数值大幅提高
  if (R.extreme) { hpMul *= 2.4; atkMul *= 1.9; }
  const hp = Math.round(base.hp * hpMul);
  const enemy = {
    key, ico: base.i,
    name: (kind === 'elite' ? '精英 · ' : '') + base.n,
    hp, maxHp: hp,
    atk: base.atk * atkMul,
    def: base.def * (kind === 'elite' ? 1.15 : 1) * (R.extreme ? 1.5 : 1),
    tags: base.tags || [], boss: !!base.boss,
    intents: base.intents, lore: base.lore, gold: base.gold,
  };
  B = {
    enemy, kind, pBuffs: {}, eBuffs: {}, cds: {}, log: [],
    turn: 1, over: false, busy: true, won: false, lost: false,
    canFlee: kind !== 'boss', dmgTaken: 0, totalDealt: 0, lastIntent: null, intent: null,
  };
  S.codex[key] = (S.codex[key] || 0) + 1;
  S.stats.battles++;
  rollIntent();
  logMsg(kind === 'boss' ? `${enemy.name} 挡住了你的去路。` : `${enemy.name} 从暗中扑出！`, 'enemy');
  showScreen('battle');
  renderBattle();
  sfx('hurt');
  setTimeout(() => { if (B && !B.over) { B.busy = false; renderBattle(); } }, 620);
}

async function afterPlayerAction() {
  if (!B || B.busy || B.over) return;
  B.busy = true;
  renderBattle();
  if (B.enemy.hp <= 0) { winBattle(); return; }
  await sleep(500);
  if (!B || !R || B.over) return;
  await enemyTurn();
  if (!B || !R) return;
  renderBattle();
  if (R.hp <= 0) { loseRun(); return; }
  await sleep(140);
  if (!B || !R) return;
  endRound();
  renderBattle();
  if (B.enemy.hp <= 0) { winBattle(); return; }
  if (R.hp <= 0) { loseRun(); return; }
  B.turn++;
  B.busy = false;
  renderBattle();
}

async function winBattle() {
  if (!B || B.won) return;
  B.won = true; B.over = true; B.busy = true;
  const e = B.enemy;
  const node = $('#enemy-emoji');
  if (node) node.style.opacity = '.25';
  sfx('win');
  await sleep(560);
  if (!B || !R) return;
  S.stats.kills++;
  R.kills = (R.kills || 0) + 1;
  if (B.kind === 'elite') {
    S.stats.eliteKills++;
    if (R.extreme) S.stats.extremeEliteKills = (S.stats.extremeEliteKills || 0) + 1;
    if (B.dmgTaken === 0) S.stats.flawlessElite++;
  }
  if (e.boss) {
    S.stats.bosses[e.key] = (S.stats.bosses[e.key] || 0) + 1;
    R.bossKills = (R.bossKills || 0) + 1;
    R.bossLog = R.bossLog || [];
    R.bossLog.push(e.name);
  }
  const goldMul = 1 + effStats().goldFind / 100 + (R.ng || 0) * 0.3;
  const gold = Math.round(rnd(e.gold[0], e.gold[1]) * goldMul * (B.kind === 'elite' ? 2.2 : 1));
  addGold(gold);
  let dropTxt = '';
  const chance = B.kind === 'boss' ? 1 : (B.kind === 'elite' ? 0.65 : 0.28);
  if (Math.random() < chance) {
    const it = genItem(R.depth + (e.boss ? 2 : 0), e.boss ? rollRarity(R.depth + 4) : rollRarity(R.depth + (B.kind === 'elite' ? 1 : 0)));
    pendingItems.push(it);
    dropTxt = `<div class="row" style="margin-top:12px;gap:10px;align-items:center">
      <div class="offer-ico" style="border-color:${RARITY[it.rarity].color}">${it.ico}</div>
      <div><div style="color:${RARITY[it.rarity].color};font-weight:700">${it.name}</div>
      <div class="small dim">${statLines(it.stats).join(' · ')}</div></div></div>`;
  }
  checkAch();
  saveRunState();
  modal({
    title: e.boss ? '首领陨落' : '战斗胜利',
    sub: `${e.name} · ${B.turn} 回合`,
    body: `<div class="row between" style="gap:12px;flex-wrap:wrap">
        <span class="pill tag-gold">💰 +${fmt(gold)} 金币</span>
        <span class="pill">⚔ ${B.turn} 回合结束</span>
        ${B.dmgTaken === 0 ? '<span class="pill tag-jade">🛡️ 无伤击杀</span>' : ''}
      </div>
      ${dropTxt}
      <div class="small dim" style="margin-top:14px;line-height:1.8">${e.lore || ''}</div>`,
    buttons: [{ label: '继续深入 →', cls: 'btn-primary', fn: () => { clearRoom(); } }],
  });
}

async function loseRun() {
  if (!B || B.lost) return;
  B.lost = true; B.over = true; B.busy = true;
  sfx('lose');
  shakeStage();
  await sleep(760);
  if (!B || !R) return;
  if ((S.meta.upgrades.revive || 0) > 0 && !R.revived) {
    R.revived = true;
    R.hp = Math.round(effStats().maxHp * 0.55);
    B.over = false; B.lost = false; B.busy = false;
    logMsg('🕯️ 不灭之魂燃起，你从死亡的边缘被拽了回来！', 'heal');
    renderBattle();
    return;
  }
  finishRun(false);
}

function finishRun(win, abandoned) {
  if (!R) return;
  const extreme = !!R.extreme;
  const cap = extreme ? EXTREME_MAX_DEPTH : MAX_DEPTH;
  const depthReached = Math.min(R.depth, cap);
  const ng = R.ng || 0;
  const bossKills = R.bossKills || 0;
  const kills = R.kills || 0;
  const items = (R.itemsLog || []).slice();
  const bossList = (R.bossLog || []).slice();
  const boonCost = (R.preBoon && R.preBoon.cost) ? R.preBoon.cost : 0;
  const extremeClear = win && extreme && depthReached >= EXTREME_MAX_DEPTH;

  // 主动放弃冒险：退还本局开局增益消耗的魂尘
  let refund = 0;
  if (abandoned && R.preBoon && R.preBoon.cost > 0) {
    refund = R.preBoon.cost;
    S.meta.soulDust += refund;
  }

  S.stats.runs++;
  if (win) S.stats.wins++; else S.stats.deaths++;
  if (win && !R.usedPotion) S.stats.winsNoPotion++;
  if (extremeClear) S.stats.extremeWins = (S.stats.extremeWins || 0) + 1;
  S.stats.maxDepth = Math.max(S.stats.maxDepth, extreme ? Math.min(R.depth, EXTREME_MAX_DEPTH) : R.depth);

  const dustBase = depthReached * 4 + bossKills * 12 + (win ? 45 : 0);
  // 极限模式通关：魂尘奖励大幅提升
  const dust = Math.round(dustBase * (1 + S.meta.upgrades.dust * 0.1) * (1 + ng * 0.25) * (extreme ? 2.2 : 1));

  let ngUp = false;
  if (win) {
    // 仅在以当前已解锁的最高难度通关时，解锁下一级轮回
    if (ng >= (S.meta.ngPlus || 0) && ng < MAX_NG) {
      S.meta.ngPlus = ng + 1;
      ngUp = true;
    }
    S.meta.ngPlus = Math.min(MAX_NG, S.meta.ngPlus || 0);
    // 单局峰值成就统计：仅通关时计入
    S.stats.maxNgClear = Math.max(S.stats.maxNgClear || 0, ng);
    S.stats.maxItemsRun = Math.max(S.stats.maxItemsRun || 0, R.maxItems || 0);
    S.stats.maxAtkRun = Math.max(S.stats.maxAtkRun || 0, R.maxAtk || 0);
    S.stats.maxDefRun = Math.max(S.stats.maxDefRun || 0, R.maxDef || 0);
    S.stats.maxCritDmgRun = Math.max(S.stats.maxCritDmgRun || 0, R.maxCritDmg || 0);
    S.stats.maxHpRun = Math.max(S.stats.maxHpRun || 0, R.maxHp || 0);
  }

  // 通行证经验（难度 6-15 通关一次 +10；极限模式完整通关可使用每周加成 → +40）
  const weekly = ensurePassWeekly();
  let passXp = 0, canBonus = false;
  if (win && ng >= 6) {
    passXp = PASS_XP_CLEAR;
    if (extremeClear && ng >= EXTREME_UNLOCK_NG && weekly.bonusLeft > 0 && weekly.xpLeft >= PASS_XP_BONUS) canBonus = true;
  } else if (extreme && depthReached >= MAX_DEPTH + 1 && ng >= 6) {
    // 已通过基础深渊但未完整通过极限模式（放弃 / 阵亡）：仅可领取 10 经验，不可使用每周加成
    passXp = PASS_XP_CLEAR;
  }
  const st = { dust: dust, passXp: passXp, canBonus: canBonus, extremeClear: extremeClear, refund: refund, boonCost: boonCost };

  // 结算数据持久化：避免弹窗弹出后意外刷新导致奖励丢失
  const title = win ? (extremeClear ? '你踏穿了极限' : '深渊已被穿透') : '你坠落了';
  const sub = win ? (extremeClear ? 'EXTREME CLEARED · 极限之主已陨落' : 'VICTORY · 深渊之主已陨落') : 'DEFEAT · 深渊记住了你的名字';
  S.pendingSettlement = {
    st: st,
    title: title, sub: sub, win: win, extreme: extreme, extremeClear: extremeClear,
    depthReached: depthReached, ng: ng, kills: kills, bossKills: bossKills,
    items: items, bossList: bossList, boonCost: boonCost, refund: refund,
    dust: dust, passXp: passXp, canBonus: canBonus, ngUp: ngUp,
    ngPlusAfter: S.meta.ngPlus,
  };

  S.runSave = null;
  R = null; B = null;
  saveGame();
  checkAch();
  renderTitle();
  hubTab = 'sanctum';
  renderHub();
  showScreen('hub');
  renderTopbar();

  showSettlementModal(S.pendingSettlement);
}

/* ---------------- 结算弹窗（横向双栏） ---------------- */
function showSettlementModal(d) {
  if (!d) return;
  const rarityColor = { common: '#9aa7b8', rare: '#4fa8ff', epic: '#b06bff', legend: '#ffb545' };
  const itemHtml = d.items.length
    ? d.items.map(it => `<span class="pill" style="border-color:${rarityColor[it.r] || '#666'};color:${rarityColor[it.r] || '#ccc'}">${it.i || '🎁'} ${it.n}</span>`).join('')
    : '<span class="small dim">本次冒险没有获得装备</span>';
  const bossHtml = d.bossList.length
    ? d.bossList.map(n => `<span class="pill" style="border-color:rgba(176,107,255,.5);color:#cfaeff">👑 ${n}</span>`).join('')
    : '<span class="small dim">本局没有击败首领</span>';

  const bodyHtml = `
    <div class="settle-grid">
      <div class="settle-left">
        <div class="center" style="margin-bottom:14px">
          <div style="font-size:50px;line-height:1;filter:drop-shadow(0 10px 30px rgba(255,150,70,.5))">${d.win ? '🌅' : '💀'}</div>
          <div style="font-family:var(--serif);font-size:18px;letter-spacing:3px;margin-top:10px;color:#ffd9a8">${d.title}</div>
          <div class="small dim" style="margin-top:5px">本局难度 · ${ngInfo(d.ng).name}${d.extreme ? ' · 极限模式' : ''}</div>
        </div>
        <div class="col" style="gap:7px">
          <div class="stat"><span class="stat-k">抵达层数</span><span class="stat-v">第 ${d.depthReached} 层${d.extreme ? ' / 20' : ''}</span></div>
          <div class="stat"><span class="stat-k">击败敌人</span><span class="stat-v">${d.kills} 个</span></div>
          <div class="stat"><span class="stat-k">击杀首领</span><span class="stat-v">${d.bossKills} 位</span></div>
          <div class="stat"><span class="stat-k">获得魂尘</span><span class="stat-v" style="color:var(--gold)">✨ +${fmt(d.dust)}</span></div>
          ${d.boonCost ? `<div class="stat"><span class="stat-k">开局增益花费</span><span class="stat-v" style="color:#ff8b9a">✨ -${fmt(d.boonCost)}</span></div>` : ''}
          ${d.refund ? `<div class="stat"><span class="stat-k">开局增益退还</span><span class="stat-v" style="color:var(--jade)">✨ +${fmt(d.refund)}</span></div>` : ''}
          <div class="stat"><span class="stat-k">通行证经验</span><span class="stat-v" style="color:#8fc4ff">${d.passXp > 0 ? '+' + d.passXp + ' 经验' + (d.canBonus ? '（可使用每周加成 → +40）' : '') : '本局无'}</span></div>
        </div>
        ${d.ngUp ? `<div class="center" style="margin-top:12px;color:#b5a8ff;font-size:12.5px">轮回难度提升至 ${d.ngPlusAfter} —— 深渊更深了。</div>` : ''}
      </div>
      <div class="settle-right">
        <div class="cx-sec" style="margin-top:0">获得物品 · ${d.items.length} 件</div>
        <div class="settle-items">${itemHtml}</div>
        <div class="cx-sec">击败的首领 · ${d.bossList.length} 位</div>
        <div class="settle-items">${bossHtml}</div>
        <div class="settle-btns">
          ${d.canBonus ? `<button class="btn btn-arcane" onclick="settleFinish(S.pendingSettlement.st,true,true)">使用每周加成领取（+${PASS_XP_BONUS} 经验）</button>` : ''}
          <button class="btn btn-primary" onclick="settleFinish(S.pendingSettlement.st,true,false)">领取奖励</button>
          <button class="btn btn-ghost" onclick="settleFinish(S.pendingSettlement.st,false,false)">放弃领取</button>
        </div>
        <div class="small dim" style="line-height:1.7">领取后将获得本次的魂尘与通行证经验；放弃领取则不会获得任何奖励。</div>
      </div>
    </div>`;

  modal({
    title: d.win ? 'THE ABYSS FALLS' : 'YOU HAVE FALLEN',
    sub: d.sub, body: bodyHtml, buttons: [], size: 'wide',
  });
}

/* ---------------- 结算领取 ---------------- */
function settleFinish(st, claim, useBonus) {
  closeModal();
  if (claim) {
    S.meta.soulDust += st.dust;
    S.stats.dustEarned += st.dust;
    if (st.passXp > 0 || useBonus) {
      const w = ensurePassWeekly();
      let xp = st.passXp;
      if (useBonus && st.canBonus && w.bonusLeft > 0 && w.xpLeft >= PASS_XP_BONUS) {
        xp = PASS_XP_BONUS;
        w.bonusLeft = Math.max(0, w.bonusLeft - 1);
      }
      const give = Math.min(xp, w.xpLeft);
      if (give > 0) {
        w.xpLeft -= give;
        addPassExpExternal(give);
        toast(`通行证经验 +${give}`, '🎫', 'success');
      }
    }
  }
  S.pendingSettlement = null;
  saveGame();
  checkAch();
  renderTitle();
  goHub();
}

/* ---------------- 每周加成 / 通行证经验 ---------------- */
const PASS_WEEK_XP = 120;      // 每周可获得通行证经验上限（12 级）
const PASS_BONUS_MAX = 3;      // 每周加成次数
const PASS_XP_CLEAR = 10;      // 难度 6-15 通关一次 → 10 经验（1 级）
const PASS_XP_BONUS = 40;      // 使用一次每周加成 → 40 经验（4 级）

// 每周刷新周期：与启动器通行证保持一致 —— 每周一凌晨 4 点（UTC+8）
function passWeekStartTs() {
  const d = new Date(Date.now() - 4 * 3600 * 1000);
  const utc8 = new Date(d.getTime() + 8 * 3600 * 1000);
  const day = utc8.getUTCDay(); // 0 = 周日
  const diff = day === 0 ? 6 : day - 1;
  return Date.UTC(utc8.getUTCFullYear(), utc8.getUTCMonth(), utc8.getUTCDate() - diff, 4, 0, 0) - 8 * 3600 * 1000;
}
function weekKeyNow() {
  const u = new Date(passWeekStartTs() + 8 * 3600 * 1000);
  const t = new Date(Date.UTC(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  const wk = Math.ceil(((t - Date.UTC(y, 0, 1)) / 86400000 + 1) / 7);
  return y + '-W' + wk;
}
// 距离下一次刷新（下周一 04:00）的剩余时间
function pwRefreshText() {
  const left = Math.max(0, passWeekStartTs() + 7 * 86400000 - Date.now());
  const mins = Math.floor(left / 60000);
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  return `${d} 天 ${h} 时 ${m} 分后刷新`;
}
let pwRefreshTimer = null;
function startPwRefreshTimer() {
  if (pwRefreshTimer) return;
  pwRefreshTimer = setInterval(function () {
    const el = document.getElementById('pwRefreshLabel');
    if (el) el.textContent = '🕒 ' + pwRefreshText();
  }, 30000);
}
function ensurePassWeekly() {
  const wk = weekKeyNow();
  if (!S.meta.passWeekly || S.meta.passWeekly.week !== wk) {
    S.meta.passWeekly = { week: wk, xpLeft: PASS_WEEK_XP, bonusLeft: PASS_BONUS_MAX };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
  }
  return S.meta.passWeekly;
}

// 直接写入启动器通行证存档（游戏页未加载 pass.js，按同格式写入）
function addPassExpExternal(amount) {
  amount = Math.max(0, Math.round(amount));
  if (!amount) return 0;
  let cur = {};
  try { cur = JSON.parse(localStorage.getItem('currentUser') || '{}'); } catch (e) {}
  const key = 'pass_' + (cur.username || 'anonymous');
  let data = null;
  try { data = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
  if (!data || typeof data.level !== 'number') {
    data = {
      version: 1, seasonId: 1, level: 0, exp: 0, totalExp: 0, expOverflow: 0,
      isPremium: false, hasBundle: false, seasonBadgeOwned: false, purchasedLevels: 0,
      levelRewardClaimed: {}, premiumRewardClaimed: {}, exFreeClaimed: 0, exPremiumClaimed: 0,
      lastDailyRefresh: null, lastWeeklyRefresh: null, dailyTasks: [], weeklyTasks: [],
      seasonTasks: [], weekly12Tasks: {}, boostTasks: [], phaseRewardsClaimed: {},
      createdAt: new Date().toISOString(),
    };
  }
  const CAP = 120, PER = 10;
  if (data.level >= CAP) {
    data.expOverflow = (data.expOverflow || 0) + amount;
    data.totalExp = (data.totalExp || 0) + amount;
  } else {
    data.exp = (data.exp || 0) + amount;
    data.totalExp = (data.totalExp || 0) + amount;
    while (data.exp >= PER && data.level < CAP) { data.exp -= PER; data.level += 1; }
  }
  data.updatedAt = new Date().toISOString();
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
  return amount;
}

/* ---------------- 战斗渲染 ---------------- */
function battleSkeleton(root) {
  root.innerHTML = `
  <div class="battle">
    <div class="stage" id="battle-stage">
      <div id="battle-main"></div>
      <div class="floats" id="float-layer"></div>
    </div>
    <div class="panel-b" id="battle-side"></div>
  </div>`;
}

function renderBattle() {
  if (!B || !R) return;
  const root = $('#screen-battle');
  if (!$('#battle-main', root)) battleSkeleton(root);
  const e = B.enemy, s = effStats();
  const ii = intentInfo(B.intent || { t: 'atk', m: 1 });
  const hpPct = clamp(e.hp / e.maxHp * 100, 0, 100);

  $('#battle-main').innerHTML = `
    <div class="enemy-card ${B.kind === 'elite' ? 'elite' : ''} ${e.boss ? 'boss' : ''}">
      <div class="enemy-emoji" id="enemy-emoji">${e.ico}</div>
      <div class="enemy-name">${e.name}</div>
      <div class="enemy-meta">${e.boss ? '首领' : (B.kind === 'elite' ? '精英' : '敌人')} · 第 ${R.depth} 层</div>
      <div class="bar hp" style="max-width:440px;margin:0 auto 6px"><div class="bar-fill" style="width:${hpPct}%"></div></div>
      <div class="small dim" style="margin-bottom:12px">${Math.max(0, Math.round(e.hp))} / ${e.maxHp}</div>
      <div class="intent ${ii.cls}">意图 · ${ii.txt}</div>
      <div class="chips" style="justify-content:center">${chipHtml(B.eBuffs)}</div>
    </div>`;

  const pPct = clamp(R.hp / s.maxHp * 100, 0, 100);
  const busy = B.busy || B.over;
  const skillBtns = R.skills.map(id => {
    const sk = SKILLS[id];
    const cd = B.cds[id] || 0;
    const dis = cd > 0 || busy;
    return `<button class="skill ${cd > 0 ? 'cd' : ''}" ${dis ? 'disabled' : ''} onclick="useSkill('${id}')">
      <div class="skill-top">${sk.i} ${sk.n}</div>
      <div class="skill-desc">${sk.d}</div>
      ${cd > 0 ? `<span class="skill-cd">${cd}</span>` : ''}
    </button>`;
  }).join('');

  const mainEl = $('#battle-main');
  if (mainEl) {
    mainEl.innerHTML += `
    <div class="card" style="padding:14px;margin-top:12px">
      <div class="row between" style="margin-bottom:10px;flex-wrap:wrap;gap:6px">
        <span class="card-sub">技能 · 冷却制</span>
        <span class="card-sub">快捷键 Q W E R ｜ 攻击 1 · 防御 2 · 药水 3</span>
      </div>
      <div class="skill-row">${skillBtns || '<span class="dim small">尚未掌握任何技能</span>'}</div>
      <div class="actions">
        <button class="act" ${busy ? 'disabled' : ''} onclick="playerAttack()"><i>⚔️</i><b>攻击</b></button>
        <button class="act defend" ${busy ? 'disabled' : ''} onclick="playerDefend()"><i>🛡️</i><b>防御</b></button>
        <button class="act" ${busy || R.potions <= 0 ? 'disabled' : ''} onclick="playerPotion()"><i>🧪</i><b>药水 ${R.potions}</b></button>
        <button class="act" ${busy || !B.canFlee ? 'disabled' : ''} onclick="tryFlee()"><i>💨</i><b>逃跑</b></button>
      </div>
    </div>`;
  }

  $('#battle-side').innerHTML = `
    <div class="player-card">
      <div class="row between">
        <div><b style="letter-spacing:1px">无名者</b><div class="small dim">第 ${B.turn} 回合</div></div>
        <div class="row" style="gap:6px">
          <span class="pill tag-rose">💰 ${fmt(R.gold)}</span>
          <span class="pill">🧪 ${R.potions}</span>
        </div>
      </div>
      <div class="bar hp" style="margin-top:10px"><div class="bar-fill" style="width:${pPct}%"></div></div>
      <div class="row between small" style="margin-top:6px">
        <span class="muted">❤ ${Math.max(0, Math.round(R.hp))} / ${s.maxHp}</span>
        ${B.pBuffs.shield ? `<span class="muted" style="color:#8fc4ff">🛡 护盾 ${Math.round(B.pBuffs.shield.v)}</span>` : ''}
      </div>
      <div class="pstat-grid">
        <div class="pstat"><b>${Math.round(s.atk)}</b><span>攻击</span></div>
        <div class="pstat"><b>${Math.round(s.def)}</b><span>防御</span></div>
        <div class="pstat"><b>${Math.round(s.crit)}%</b><span>暴击</span></div>
        <div class="pstat"><b>${Math.round(s.critDmg)}%</b><span>暴伤</span></div>
      </div>
      <div class="chips">${chipHtml(B.pBuffs)}</div>
    </div>
    <div class="card" style="padding:12px">
      <div class="card-sub" style="margin-bottom:8px">战斗记录</div>
      <div class="log" id="battle-log">${B.log.map(l => `<div class="log-line ${l.c}">${l.t}</div>`).join('')}</div>
    </div>`;

  const logEl = $('#battle-log');
  if (logEl) logEl.scrollTop = logEl.scrollHeight;
  renderTopbar();
}

/* ---------------- 调试辅助 ---------------- */
function renderAchieveDebug() { checkAch(); renderHub(); toast('成就已重新检测', '🔄'); }

/* ---------------- 背景粒子 ---------------- */
function initEmbers() {
  const c = $('#embers');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w = 0, h = 0;
  const parts = [];
  function resize() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 55; i++) {
    parts.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.5 + 0.35, s: Math.random() * 0.34 + 0.07,
      a: Math.random() * 0.42 + 0.12, d: (Math.random() - 0.5) * 0.5,
    });
  }
  let lastTs = 0;
  function loop(ts) {
    // 动效关闭 / 部分动效：不绘制背景粒子
    const motion = (S && S.settings && S.settings.motion) || 'all';
    if (motion !== 'all') { requestAnimationFrame(loop); return; }
    // 帧率上限：Auto 跟随显示器刷新率，30/60 显式限帧
    const fps = (S && S.settings && S.settings.fps) ? String(S.settings.fps) : 'auto';
    let interval = 0;
    if (fps === '30') interval = 1000 / 30;
    else if (fps === '60') interval = 1000 / 60;
    if (interval && ts - lastTs < interval - 1) { requestAnimationFrame(loop); return; }
    lastTs = ts;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.s; p.x += p.d * 0.28;
      if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
      if (p.x < -12) p.x = w + 12;
      if (p.x > w + 12) p.x = -12;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      g.addColorStop(0, `rgba(255,175,95,${p.a})`);
      g.addColorStop(0.45, `rgba(255,130,60,${p.a * 0.35})`);
      g.addColorStop(1, 'rgba(255,110,50,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ---------------- 启动 ---------------- */
function init() {
  S = loadGame();
  if (!S.settings.fps) S.settings.fps = 'auto';
  if (!S.settings.motion || ['all', 'partial', 'none'].indexOf(S.settings.motion) < 0) S.settings.motion = 'all';
  applyMotion();
  $('#btn-sound').textContent = S.settings.sound ? '🔊' : '🔇';
  $('#btn-sound').classList.toggle('off', !S.settings.sound);
  $('#btn-sound').addEventListener('click', toggleSound);
  document.addEventListener('fullscreenchange', () => {
    if (hubTab === 'settings') renderHub();
  });
  $('#btn-home').addEventListener('click', () => {
    if (B && !B.over) { toast('战斗中无法返回圣所', '⚔️'); return; }
    if (R) { saveRunState(); R = null; B = null; }
    goHub();
  });
  document.addEventListener('keydown', e => {
    if (!B || B.over || B.busy) return;
    if (e.key === '1') playerAttack();
    else if (e.key === '2') playerDefend();
    else if (e.key === '3') playerPotion();
    else if (/^[qwer]$/i.test(e.key)) {
      const idx = 'qwer'.indexOf(e.key.toLowerCase());
      if (R.skills[idx]) useSkill(R.skills[idx]);
    }
  });
  renderTitle();
  showScreen('title');
  initEmbers();
  checkAch();
  // 启动时强制同步一次，确保启动器侧能拿到已有的成就 / 统计进度
  syncLauncherData(true);
  renderTopbar();
  // 若上一局结算未领取（意外刷新/重进），重新弹出结算弹窗
  if (S.pendingSettlement) showSettlementModal(S.pendingSettlement);
}

document.addEventListener('DOMContentLoaded', init);
let booted = false;
function boot() { if (booted) return; booted = true; init(); }
if (document.readyState !== 'loading') boot();
