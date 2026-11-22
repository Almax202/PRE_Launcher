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

/* ---------------- 经济平衡 ---------------- */
// 敌方金币基础值统一缩放：降低金币膨胀，避免玩家靠大量购买装备碾压敌人
const GOLD_SCALE = 0.55;

/* ---------------- 存档键 ---------------- */
const SAVE_KEY = 'echoes_of_abyss_v1';
/* 多存档位：最多 10 个，当前存档位下标单独持久化 */
const SAVE_SLOT_COUNT = 10;
const SLOTS_KEY = 'echoes_of_abyss_slots_v1';
const ACTIVE_SLOT_KEY = 'echoes_of_abyss_active_slot_v1';
let activeSlot = (() => {
  try {
    const v = parseInt(localStorage.getItem(ACTIVE_SLOT_KEY), 10);
    return (isFinite(v) && v >= 0 && v < SAVE_SLOT_COUNT) ? v : null;
  } catch (e) { return null; }
})();

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

  /* 深渊叠加 / 极限：深红深渊（第 11-15 层） */
  voidReaper: { n: '虚渊收割者', i: '🔪', hp: 320, atk: 46, def: 20, gold: [42, 62], tags: ['void', 'undead'],
    lore: '它以碎裂的层数为镰，收割所有试图越界的灵魂。',
    intents: [{ t: 'heavy', m: 1.9 }, { t: 'atk', m: 1.2 }, { t: 'drain', m: 1.1 }, { t: 'debuff', b: 'vuln', v: 0.45, d: 2 }] },
  flameWarden: { n: '焚魂守卫', i: '🔥', hp: 360, atk: 42, def: 28, gold: [44, 66], tags: ['elemental', 'construct'],
    lore: '深红的火不焚肉身，只烧灼那些尚存的希望。',
    intents: [{ t: 'atk', m: 1.1 }, { t: 'dot', b: 'burn', v: 0.06, d: 3 }, { t: 'buff', b: 'defUp', v: 0.8, d: 3 }, { t: 'heavy', m: 1.8 }] },
  mirrorShade: { n: '镜影傀儡', i: '🎭', hp: 300, atk: 48, def: 16, gold: [46, 68], tags: ['void', 'human'],
    lore: '它是你自己，只是选择了另一条更深的道路。',
    intents: [{ t: 'multi', m: 0.6, hits: 3 }, { t: 'debuff', b: 'weak', v: 0.35, d: 2 }, { t: 'atk', m: 1.3 }, { t: 'buff', b: 'atkUp', v: 0.45, d: 2 }] },

  /* 深渊叠加专属精英 */
  xelite1: { n: '深渊猎杀者', i: '🦂', hp: 250, atk: 38, def: 18, gold: [40, 58], tags: ['void', 'beast'], extremeOnly: true,
    lore: '它只在层数被叠加之后出现，专门猎杀那些以为自己还能回头的人。',
    intents: [{ t: 'multi', m: 0.55, hits: 3 }, { t: 'heavy', m: 1.9 }, { t: 'debuff', b: 'vuln', v: 0.4, d: 2 }, { t: 'buff', b: 'atkUp', v: 0.4, d: 2 }] },
  xelite2: { n: '血契祭司', i: '🩸', hp: 280, atk: 34, def: 22, gold: [42, 62], tags: ['human', 'demon'], extremeOnly: true,
    lore: '她用条约上的墨水喂养深渊，每一条契约都让她年轻一分。',
    intents: [{ t: 'drain', m: 1.2 }, { t: 'dot', b: 'burn', v: 0.06, d: 3 }, { t: 'buff', b: 'defUp', v: 0.8, d: 3 }, { t: 'heal', v: 0.16 }] },
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

  /* 深渊叠加 · 极限首领 */
  xboss1: { n: '深渊裂痕 · 卡俄斯', i: '🌀', hp: 880, atk: 52, def: 24, gold: [420, 500], tags: ['void', 'boss'], boss: true,
    lore: '它本是深渊的边界。你越过了它，它便长成了你的形状。',
    intents: [{ t: 'atk', m: 1.2 }, { t: 'multi', m: 0.6, hits: 4 }, { t: 'debuff', b: 'vuln', v: 0.5, d: 2 }, { t: 'buff', b: 'atkUp', v: 0.5, d: 2 }, { t: 'heavy', m: 2.1 }] },
  xboss2: { n: '无光之祖 · 乌尔', i: '🌚', hp: 1150, atk: 62, def: 30, gold: [540, 640], tags: ['void', 'undead', 'boss'], boss: true,
    lore: '在光诞生之前，它就已经在这里等待。',
    intents: [{ t: 'drain', m: 1.4 }, { t: 'heavy', m: 2.2 }, { t: 'dot', b: 'burn', v: 0.07, d: 3 }, { t: 'buff', b: 'defUp', v: 0.9, d: 3 }, { t: 'multi', m: 0.55, hits: 4 }] },
  xboss3: { n: '极限之主 · 绝', i: '👑', hp: 1520, atk: 76, def: 36, gold: [720, 880], tags: ['void', 'demon', 'boss'], boss: true, extremeOnly: true,
    lore: '它是所有走到尽头的人留下的最后一道回声。',
    intents: [{ t: 'heavy', m: 2.4 }, { t: 'multi', m: 0.55, hits: 5 }, { t: 'drain', m: 1.5 }, { t: 'debuff', b: 'weak', v: 0.4, d: 2 }, { t: 'buff', b: 'atkUp', v: 0.55, d: 2 }, { t: 'atk', m: 1.3 }] },
  xboss4: { n: '深渊主宰 · 阒', i: '🌑', hp: 2100, atk: 92, def: 44, gold: [980, 1200], tags: ['void', 'demon', 'boss'], boss: true, extremeOnly: true,
    lore: '条约写满之后，它才终于拥有了真正的名字。',
    intents: [{ t: 'heavy', m: 2.6 }, { t: 'multi', m: 0.6, hits: 5 }, { t: 'drain', m: 1.6 }, { t: 'dot', b: 'burn', v: 0.08, d: 3 }, { t: 'buff', b: 'atkUp', v: 0.6, d: 2 }, { t: 'debuff', b: 'vuln', v: 0.5, d: 2 }] },
};

/* ---------------- 区域 ---------------- */
const BIOMES = [
  { id: 1, name: '腐化地窟', sub: '第 1-2 层 · 湿冷、腐臭与低语',
    enemies: ['rat', 'bat', 'spider', 'skeleton'], boss: 'boss1' },
  { id: 2, name: '幽影回廊', sub: '第 3-4 层 · 无尽的长廊与被遗忘的名字',
    enemies: ['wraith', 'assassin', 'gargoyle', 'priest'], boss: 'boss2' },
  { id: 3, name: '熔火深渊', sub: '第 5-6 层 · 岩浆、硫磺与咆哮',
    enemies: ['worm', 'elemental', 'hound', 'colossus'], boss: 'boss3' },
  { id: 4, name: '虚空王座', sub: '第 7-10 层 · 现实的边缘',
    enemies: ['crawler', 'devourer', 'whisper'], boss: 'boss4' },
  { id: 5, name: '深红极限', sub: '第 11-15 层 · 深渊叠加 · 极限',
    enemies: ['voidReaper', 'flameWarden', 'mirrorShade'], boss: 'xboss1' },
];
const MAX_DEPTH = 5;            // 正常模式：5 层
const STACK_MAX_DEPTH = 10;     // 深渊叠加：10 层
const LIMIT_MAX_DEPTH = 15;     // 深渊叠加 · 极限：15 层
const STACK_UNLOCK_NG = 10;     // 轮回难度 10 及以上才可进入深渊叠加
const EXTREME_ONLY_KEYS = ['voidReaper', 'flameWarden', 'mirrorShade', 'xelite1', 'xelite2', 'xboss1', 'xboss2', 'xboss3', 'xboss4'];
function isExtremeKey(key) { return EXTREME_ONLY_KEYS.indexOf(key) >= 0; }
function modeOf(r) {
  if (!r) return 0;
  if (r.stackMode === undefined) return r.extreme ? 2 : 0;
  return r.stackMode | 0;
}
function modeName(r) {
  const m = modeOf(r);
  return m === 2 ? '深渊叠加 · 极限' : (m === 1 ? '深渊叠加' : '正常模式');
}
function biomeOf(d) {
  if (d <= 2) return BIOMES[0];
  if (d <= 4) return BIOMES[1];
  if (d <= 6) return BIOMES[2];
  if (d <= 10) return BIOMES[3];
  return BIOMES[4];
}
function depthCapOf() {
  const m = modeOf(R);
  return m === 2 ? LIMIT_MAX_DEPTH : (m === 1 ? STACK_MAX_DEPTH : MAX_DEPTH);
}
// 每一层的终点都是该生态区域的首领
function bossKeyOf(d) {
  const m = modeOf(R);
  if (m === 0) {
    if (d <= 2) return 'boss1';
    if (d <= 4) return 'boss2';
    return 'boss3';
  }
  if (m === 1) {
    if (d <= 7) return 'boss4';
    if (d <= 9) return 'xboss1';
    return 'xboss2';
  }
  if (d <= 12) return 'xboss2';
  if (d <= 14) return 'xboss3';
  return 'xboss4';
}
function extremeMul() {
  const m = modeOf(R);
  return m === 2 ? 2.2 : (m === 1 ? 1.6 : 1);
}

/* ---------------- 深渊条约（共 24 条 · 60 分） ---------------- */
// mods 均为比例值：敌人加成累加；我方为负值减益
const TREATIES = [
  { id: 't_hp1',   n: '生命增幅',     s: 1, i: '❤️', d: '敌方生命值 +20%',                 mods: { enemyHp: 0.2 } },
  { id: 't_atk1',  n: '攻击增幅',     s: 1, i: '⚔️', d: '敌方攻击力 +15%',                 mods: { enemyAtk: 0.15 } },
  { id: 't_def1',  n: '铁壁',         s: 1, i: '🏰', d: '敌方防御力 +25%',                 mods: { enemyDef: 0.25 } },
  { id: 't_gold1', n: '贪婪税',       s: 1, i: '💵', d: '金币获取 -20%',                   mods: { goldGain: -0.2 } },
  { id: 't_pdef1', n: '虚弱侵蚀',     s: 1, i: '🩹', d: '我方防御力 -10%',                 mods: { playerDef: -0.1 } },
  { id: 't_patk1', n: '钝刃',         s: 1, i: '🗡️', d: '我方攻击力 -10%',                 mods: { playerAtk: -0.1 } },
  { id: 't_pcrt1', n: '迟缓',         s: 1, i: '🐌', d: '我方暴击率 -10%',                 mods: { playerCrit: -10 } },
  { id: 't_shop1', n: '物价微涨',     s: 1, i: '🏷️', d: '深渊商店价格 +30%',               mods: { shopPrice: 0.3 } },

  { id: 't_hp2',   n: '生命增幅 II',  s: 2, i: '💗', d: '敌方生命值 +40%',                 mods: { enemyHp: 0.4 } },
  { id: 't_atk2',  n: '攻击增幅 II',  s: 2, i: '🔱', d: '敌方攻击力 +30%',                 mods: { enemyAtk: 0.3 } },
  { id: 't_def2',  n: '硬壳',         s: 2, i: '🐢', d: '敌方防御力 +50%',                 mods: { enemyDef: 0.5 } },
  { id: 't_pcd2',  n: '精神压迫',     s: 2, i: '🧠', d: '我方暴击伤害 -25%',               mods: { playerCritDmg: -0.25 } },
  { id: 't_pdef2', n: '疲惫之躯',     s: 2, i: '😵', d: '我方防御力 -20%',                 mods: { playerDef: -0.2 } },
  { id: 't_gold2', n: '贫瘠',         s: 2, i: '💲', d: '金币获取 -35%',                   mods: { goldGain: -0.35 } },

  { id: 't_shop2', n: '通货膨胀',     s: 3, i: '💸', d: '深渊商店所有物品价格翻倍（×2）', mods: { shopPrice: 1.0 } },
  { id: 't_patk3', n: '肌肉萎缩',     s: 3, i: '💪', d: '我方攻击力 -25%，暴击率 -20%',    mods: { playerAtk: -0.25, playerCrit: -20 } },
  { id: 't_atk3',  n: '深渊回响',     s: 3, i: '🔊', d: '敌方攻击力 +45%',                 mods: { enemyAtk: 0.45 } },
  { id: 't_php3',  n: '血之代价',     s: 3, i: '🩸', d: '我方最大生命 -20%',               mods: { playerHp: -0.2 } },

  { id: 't_patk4', n: '肌肉萎缩 · 极', s: 4, i: '💀', d: '我方攻击力 -18%，暴击率 -15%',    mods: { playerAtk: -0.18, playerCrit: -15 } },
  { id: 't_hp4',   n: '生命增幅 · 极', s: 4, i: '💓', d: '敌方生命值 +80%，防御力 +50%',    mods: { enemyHp: 0.8, enemyDef: 0.5 } },

  { id: 't_pcd5',  n: '精神衰竭',     s: 5, i: '💫', d: '我方暴击伤害 -60%',               mods: { playerCritDmg: -0.6 } },
  { id: 't_atk5',  n: '深渊凝视',     s: 5, i: '👁️', d: '敌方生命值 +100%，攻击力 +60%',   mods: { enemyHp: 1.0, enemyAtk: 0.6 } },
  { id: 't_shop5', n: '万物通胀',     s: 5, i: '📈', d: '深渊商店价格 ×3，金币获取 -50%',  mods: { shopPrice: 2.0, goldGain: -0.5 } },
  { id: 't_pall5', n: '灵魂枯竭',     s: 5, i: '🥀', d: '我方攻击 -20%，防御 -18%，生命 -15%', mods: { playerAtk: -0.2, playerDef: -0.18, playerHp: -0.15 } },
];
const TREATY_TOTAL_SCORE = TREATIES.reduce((s, t) => s + t.s, 0);

function treatyById(id) { return TREATIES.find(t => t.id === id) || null; }
function treatyMods() {
  const m = { enemyHp: 0, enemyAtk: 0, enemyDef: 0, playerAtk: 0, playerHp: 0, playerDef: 0, playerCrit: 0, playerCritDmg: 0, shopPrice: 0, goldGain: 0 };
  if (!R || !Array.isArray(R.treatyIds)) return m;
  R.treatyIds.forEach(id => {
    const t = treatyById(id);
    if (!t || !t.mods) return;
    for (const k in t.mods) m[k] = (m[k] || 0) + t.mods[k];
  });
  return m;
}
function treatyScore() {
  if (!R || !Array.isArray(R.treatyIds)) return 0;
  return R.treatyIds.reduce((s, id) => { const t = treatyById(id); return s + (t ? t.s : 0); }, 0);
}

/* ---------------- 深渊苦难（层间馈赠的代偿） ---------------- */
// 每条苦难包含 2-3 项敌方增益，强度中等，可跨层累积
const HARDSHIPS = [
  { id: 'h_hp',     n: '血脉膨胀', i: '🩸', d: '敌方生命 +9%，防御 +5%',              mods: { enemyHp: 0.09, enemyDef: 0.05 } },
  { id: 'h_atk',    n: '嗜血狂怒', i: '🦷', d: '敌方攻击 +8%，生命 +5%',              mods: { enemyAtk: 0.08, enemyHp: 0.05 } },
  { id: 'h_def',    n: '深渊甲壳', i: '🦀', d: '敌方防御 +10%，生命 +4%',             mods: { enemyDef: 0.1, enemyHp: 0.04 } },
  { id: 'h_swift',  n: '迅捷猎杀', i: '💨', d: '敌方攻击 +6%，防御 +6%，生命 +4%',    mods: { enemyAtk: 0.06, enemyDef: 0.06, enemyHp: 0.04 } },
  { id: 'h_giant',  n: '巨物降临', i: '🗿', d: '敌方生命 +11%，攻击 +4%',             mods: { enemyHp: 0.11, enemyAtk: 0.04 } },
  { id: 'h_blade',  n: '磨砺利刃', i: '⚔️', d: '敌方攻击 +10%，防御 +4%',             mods: { enemyAtk: 0.1, enemyDef: 0.04 } },
  { id: 'h_bastion', n: '深渊壁垒', i: '🏯', d: '敌方防御 +12%，攻击 +4%',            mods: { enemyDef: 0.12, enemyAtk: 0.04 } },
  { id: 'h_frenzy', n: '群体狂化', i: '🔥', d: '敌方生命 +6%，攻击 +6%，防御 +5%',    mods: { enemyHp: 0.06, enemyAtk: 0.06, enemyDef: 0.05 } },
];
const GIFT_BUFFS = [
  { k: 'bonusHp',   v: 45, n: '深渊之心', d: '最大生命 +45', i: '❤️' },
  { k: 'bonusAtk',  v: 7,  n: '掠夺之刃', d: '攻击 +7',      i: '⚔️' },
  { k: 'bonusDef',  v: 5,  n: '黑曜石肤', d: '防御 +5',      i: '🛡️' },
  { k: 'bonusCrit', v: 9,  n: '猎杀直觉', d: '暴击率 +9%',   i: '🎯' },
];
function hardshipById(id) { return HARDSHIPS.find(h => h.id === id) || null; }
function hardshipMods() {
  const m = { enemyHp: 0, enemyAtk: 0, enemyDef: 0 };
  if (!R || !Array.isArray(R.hardships)) return m;
  R.hardships.forEach(id => {
    const h = hardshipById(id);
    if (!h || !h.mods) return;
    for (const k in h.mods) m[k] = (m[k] || 0) + h.mods[k];
  });
  // 苦难可跨层累积，但总增益设上限，避免长局敌人被无限放大
  m.enemyHp = Math.min(0.8, m.enemyHp);
  m.enemyAtk = Math.min(0.8, m.enemyAtk);
  m.enemyDef = Math.min(0.8, m.enemyDef);
  return m;
}
function addHardship(id) {
  const h = hardshipById(id);
  if (!h || !R) return;
  if (!Array.isArray(R.hardships)) R.hardships = [];
  R.hardships.push(id);
}

/* 「心神不宁」：古老的石龛标记，随机为某一类战斗附加敌方增益 */
const UNEASE_EFFECTS = [
  { id: 'u_elite_hp',  kind: 'elite', n: '精英战斗时，敌方生命值 +20%', hp: 0.2 },
  { id: 'u_elite_atk', kind: 'elite', n: '精英战斗时，敌方攻击力 +15%', atk: 0.15 },
  { id: 'u_elite_def', kind: 'elite', n: '精英战斗时，敌方防御力 +25%', def: 0.25 },
  { id: 'u_elite_all', kind: 'elite', n: '精英战斗时，敌方生命 +10%、攻击 +10%', hp: 0.1, atk: 0.1 },
  { id: 'u_boss_atk',  kind: 'boss',  n: '首领战斗时，敌方攻击力 +35%', atk: 0.35 },
  { id: 'u_boss_hp',   kind: 'boss',  n: '首领战斗时，敌方生命值 +25%', hp: 0.25 },
  { id: 'u_boss_def',  kind: 'boss',  n: '首领战斗时，敌方防御力 +20%', def: 0.2 },
  { id: 'u_boss_all',  kind: 'boss',  n: '首领战斗时，敌方全属性 +15%', atk: 0.15, hp: 0.15, def: 0.15 },
  { id: 'u_normal_hp', kind: 'normal', n: '普通战斗时，敌方生命值 +15%', hp: 0.15 },
  { id: 'u_normal_atk', kind: 'normal', n: '普通战斗时，敌方攻击力 +10%', atk: 0.1 },
  { id: 'u_normal_def', kind: 'normal', n: '普通战斗时，敌方防御力 +18%', def: 0.18 },
  { id: 'u_normal_all', kind: 'normal', n: '普通战斗时，敌方生命 +8%、攻击 +8%', hp: 0.08, atk: 0.08 },
];
function uneaseMods(kind) {
  const u = R && R.unease;
  if (!u) return null;
  const active = u.kind === kind;
  return {
    n: u.n,
    active: active,
    hp: active ? (u.hp || 0) : 0,
    atk: active ? (u.atk || 0) : 0,
    def: active ? (u.def || 0) : 0,
  };
}
function rollUnease() {
  return JSON.parse(JSON.stringify(pick(UNEASE_EFFECTS)));
}

// 战斗界面：苦难 / 条约 的加成比例标签
function pctSigned(v) {
  const n = Math.round((v || 0) * 100);
  return (n > 0 ? '+' : '') + n + '%';
}
function enemyModTagsHtml() {
  const hm = hardshipMods(), tm = treatyMods();
  const tags = [];
  if (hm.enemyHp || hm.enemyAtk || hm.enemyDef) {
    tags.push(`<span class="mod-tag hard">☠ 苦难 · 生命 ${pctSigned(hm.enemyHp)} · 攻击 ${pctSigned(hm.enemyAtk)} · 防御 ${pctSigned(hm.enemyDef)}</span>`);
  }
  if (tm.enemyHp || tm.enemyAtk || tm.enemyDef) {
    tags.push(`<span class="mod-tag treaty">📜 条约 · 生命 ${pctSigned(tm.enemyHp)} · 攻击 ${pctSigned(tm.enemyAtk)} · 防御 ${pctSigned(tm.enemyDef)}</span>`);
  }
  if (R && R.unease) {
    const active = B && B.kind === R.unease.kind;
    tags.push(`<span class="mod-tag unease">😖 心神不宁 · ${R.unease.n}${active ? ' · 本场生效' : ''}</span>`);
  }
  return tags.join('');
}
function playerModTagsHtml() {
  const tm = treatyMods();
  const parts = [];
  if (tm.playerAtk) parts.push(`攻击 ${pctSigned(tm.playerAtk)}`);
  if (tm.playerHp) parts.push(`生命 ${pctSigned(tm.playerHp)}`);
  if (tm.playerDef) parts.push(`防御 ${pctSigned(tm.playerDef)}`);
  if (tm.playerCrit) parts.push(`暴击 ${(tm.playerCrit > 0 ? '+' : '') + Math.round(tm.playerCrit)}%`);
  if (tm.playerCritDmg) parts.push(`暴伤 ${pctSigned(tm.playerCritDmg)}`);
  if (!parts.length) return '';
  return `<span class="mod-tag treaty">📜 条约 · 我方 ${parts.join(' · ')}</span>`;
}

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
          const list = (R.equip.weapon || []).slice();
          if (!list.length) {
            openEventItemPicker({ title: '选择要强化的武器', sub: '无名的铁匠 · 攻击 +4', items: [], emptyText: '暂无可强化武器' });
            return null;
          }
          if (R.gold < 60) return '铁匠摇了摇头，继续捶打空气。';
          openEventItemPicker({
            title: '选择要强化的武器', sub: '无名的铁匠 · 攻击 +4',
            items: list,
            emptyText: '暂无可强化武器',
            onPick(it) {
              R.gold -= 60;
              it.stats.atk = Math.round(((it.stats.atk || 0) + 4) * 10) / 10;
              recalcItemPower(it);
              finishEventOutcome(`锤声落在 <b style="color:${RARITY[it.rarity].color}">${it.name}</b> 上，武器泛出新的寒光（攻击 +4）。`);
            },
          });
          return null;
        } },
      { label: '强化护甲（消耗 60 金币，防御 +3）', fn() {
          const list = (R.equip.armor || []).slice();
          if (!list.length) {
            openEventItemPicker({ title: '选择要强化的护甲', sub: '无名的铁匠 · 防御 +3', items: [], emptyText: '暂无可强化护甲' });
            return null;
          }
          if (R.gold < 60) return '铁匠摇了摇头，继续捶打空气。';
          openEventItemPicker({
            title: '选择要强化的护甲', sub: '无名的铁匠 · 防御 +3',
            items: list,
            emptyText: '暂无可强化护甲',
            onPick(it) {
              R.gold -= 60;
              it.stats.def = Math.round(((it.stats.def || 0) + 3) * 10) / 10;
              recalcItemPower(it);
              finishEventOutcome(`护甲被敲得更厚实了一些：<b style="color:${RARITY[it.rarity].color}">${it.name}</b>（防御 +3）。`);
            },
          });
          return null;
        } },
      { label: '索取他的锤子（获得随机装备）', fn() {
          const it = genItem(R.depth, 'rare');
          addItem(it);
          return `他把锤子递给你——那不是锤子，而是 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>。`;
        } },
    ]
  },
  {
    id: 'mirror', n: '裂纹之镜', i: '🔮',
    d: '一面高及穹顶的镜子，裂纹中映出无数个你，每一个都在做不同的选择。',
    choices: [
      { label: '触碰镜面（复制一件装备）', fn() {
          const eq = Object.values(R.equip).flat().filter(Boolean);
          if (!eq.length) return '镜中的你一无所有，镜子黯淡下去。';
          openEventItemPicker({
            title: '选择要复制的装备', sub: '裂纹之镜 · 复制一件已有装备',
            items: eq,
            emptyText: '暂无可复制物品',
            onPick(src) {
              const copy = JSON.parse(JSON.stringify(src));
              copy.uid = 'it' + Date.now() + Math.floor(Math.random() * 9999);
              copy.name = '镜像 · ' + src.name;
              addItem(copy);
              finishEventOutcome(`镜面泛起波纹，一件复制品落进你的怀中：<b style="color:${RARITY[copy.rarity].color}">${copy.name}</b>。`);
            },
          });
          return null;
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
      { label: '放他出来（获得 200 金币与一件史诗物品）', fn() {
          addGold(200);
          const it = genItem(R.depth, 'epic');
          addItem(it);
          return `他吻了你的手背，把藏了多年的财宝塞进你手里（+200 金币），又留下一件 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>，随后消失在阴影里。`;
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
      { label: '取走鳞片（获得一件传说物品，但被“心神不宁”标记）', fn() {
          const it = genItem(R.depth, 'legend');
          addItem(it);
          const u = rollUnease();
          R.unease = u;
          return `你获得了 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>……但同时，深渊在你心里留下了「心神不宁」：<b style="color:#d6a7ff">${u.n}</b>。此状态会持续到本局结束。`;
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
          const eq = Object.values(R.equip).flat().filter(Boolean);
          if (!eq.length) return '你身上没有可以交换的东西。';
          openEventItemPicker({
            title: '选择要交换的装备', sub: '幽灵商队 · 按估价 80% 换取金币',
            items: eq,
            emptyText: '暂无可交换物品',
            onPick(it) {
              const g = Math.round(it.price * 0.8);
              removeEquip(it);
              addGold(g);
              finishEventOutcome(`你卖掉了 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>，换来 ${g} 金币。`);
            },
          });
          return null;
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
  {
    id: 'deepPact', n: '深渊的页码', i: '🌑', extremeOnly: true,
    d: '一本没有封面的书悬在通道中央，每一页都写着你的名字，最后一页还空着。',
    choices: [
      { label: '在空白页上写下名字（攻击 +10，防御 +6，最大生命 -15%）', fn() {
          R.bonusAtk += 10; R.bonusDef += 6;
          const loss = Math.round(effStats().maxHp * 0.15);
          R.bonusHp -= loss; R.hp = Math.min(R.hp, effStats().maxHp);
          if (R.hp <= 0) R.hp = 1;
          return `书页吞下了你的名字（攻击 +10，防御 +6，最大生命 -${loss}）。`;
        } },
      { label: '撕下最后一页（获得一件传说装备）', fn() {
          const it = genItem(R.depth + 2, 'legend');
          addItem(it);
          return `你撕下了空白的一页，它在你手中凝成 <b style="color:${RARITY.legend.color}">${it.name}</b>。`;
        } },
      { label: '合上书，退后（恢复 30% 生命并清除诅咒）', fn() {
          const s = effStats();
          healPlayer(Math.round(s.maxHp * 0.3));
          return '书合上了。你的呼吸重新变得平稳（恢复 30% 生命）。';
        } },
    ]
  },
  {
    id: 'bridge', n: '断桥的守夜人', i: '🌉',
    d: '一位披着破旧斗篷的守夜人守在断桥前。他说桥下藏着会吞人的东西，除非你付出过桥的代价。',
    choices: [
      { label: '支付 50 金币过桥（获得魂尘）', fn() {
          if (R.gold < 50) return '守夜人看了看你空荡的钱袋，侧身让开了半步——桥却在你脚下断裂。';
          R.gold -= 50;
          const dust = 16 + R.depth * 3;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          return `守夜人收起金币，替你照亮了桥面。你在桥心拾起一捧魂尘（+${dust} 魂尘）。`;
        } },
      { label: '斩杀桥下的东西（-12% 生命，获得稀有装备）', fn() {
          const d = Math.round(effStats().maxHp * 0.12);
          R.hp = Math.max(1, R.hp - d);
          const it = genItem(R.depth, 'rare');
          addItem(it);
          return `你拖出桥下的怪物并将其斩杀（-${d} 生命），从它腹中取出 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>。`;
        } },
      { label: '绕路而行（回复 15% 生命）', fn() {
          const h = Math.round(effStats().maxHp * 0.15);
          healPlayer(h);
          return `你沿河岸绕行，顺手采了几株止血草（+${h} 生命）。`;
        } },
    ]
  },
  {
    id: 'weepingStatue', n: '哭泣的雕像', i: '🗿',
    d: '一尊无名的女性雕像跪在路旁，石眼里不断渗出真正的泪水。',
    choices: [
      { label: '替她擦去泪水（回复 25% 生命，获得魂尘）', fn() {
          healPlayer(Math.round(effStats().maxHp * 0.25));
          const dust = 10 + R.depth * 2;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          return `泪水落在你手上，化作温暖的光（回复生命，+${dust} 魂尘）。`;
        } },
      { label: '凿下她眼中的宝石（获得金币）', fn() {
          const g = 90 + R.depth * 18;
          addGold(g);
          return `雕像停止了哭泣。你带走两颗浑浊的宝石，换来 ${g} 金币。`;
        } },
      { label: '陪她坐一会儿（最大生命 +18）', fn() {
          R.bonusHp += 18; healPlayer(18);
          return '你什么也没做，只是陪着她。离开时，你感觉自己的心跳更沉稳了（最大生命 +18）。';
        } },
    ]
  },
  {
    id: 'courier', n: '深渊邮差', i: '📨',
    d: '一个背着巨大邮袋的佝偻身影在岔路口打转。他说自己找不到收信人了。',
    choices: [
      { label: '护送他找到收信人（获得金币）', fn() {
          const g = 70 + R.depth * 15;
          addGold(g);
          return `收信人早已死去，但邮差仍郑重地把谢礼塞给你（+${g} 金币）。`;
        } },
      { label: '抢走邮袋（获得稀有装备与金币）', fn() {
          const g = 40 + R.depth * 8;
          addGold(g);
          const it = genItem(R.depth, 'rare');
          addItem(it);
          S.stats.evil = (S.stats.evil || 0) + 1;
          return `你夺过邮袋，里面除了 ${g} 金币，还有 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>。`;
        } },
      { label: '拆开一封信（可能获得技能）', fn() {
          if (Math.random() < 0.6) {
            const s = grantRandomSkill();
            return s ? `信里写着一套失传的战技，你学会了 <b>${s.n}</b>。` : '信纸在你手中化为灰烬，什么也没有留下。';
          }
          const d = Math.round(effStats().maxHp * 0.1);
          R.hp = Math.max(1, R.hp - d);
          return `信上的诅咒灼伤了你的眼睛（-${d} 生命）。`;
        } },
    ]
  },
  {
    id: 'theater', n: '无光剧场', i: '🎭',
    d: '一座没有观众的剧场仍在演出。舞台上的影子重复着同一场悲剧，幕布后传来掌声。',
    choices: [
      { label: '登台替演（暴击率 +6%）', fn() {
          R.bonusCrit += 6;
          return '你在台上完成了那记致命一击，影子们为你鼓掌。你记住了那个角度（暴击率 +6%）。';
        } },
      { label: '坐在前排看完（回复 30% 生命，获得魂尘）', fn() {
          healPlayer(Math.round(effStats().maxHp * 0.3));
          const dust = 8 + R.depth * 2;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          return `悲剧落幕时，你发现自己泪流满面，伤口却愈合了（+${dust} 魂尘）。`;
        } },
      { label: '放火烧掉幕布（获得金币，损失生命）', fn() {
          const g = 120 + R.depth * 20;
          addGold(g);
          const d = Math.round(effStats().maxHp * 0.12);
          R.hp = Math.max(1, R.hp - d);
          return `火焰吞没舞台，影子们在火中尖叫（+${g} 金币，-${d} 生命）。`;
        } },
    ]
  },
  {
    id: 'boneClass', n: '骸骨课堂', i: '🦴',
    d: '十几具骸骨整齐地坐在石凳上，讲台上的骷髅仍在讲课，黑板上写着“如何杀死自己”。',
    choices: [
      { label: '坐下听课（攻击 +3，防御 +2）', fn() {
          R.bonusAtk += 3; R.bonusDef += 2;
          return '你听完了一整节课，学会了如何让刀锋更省力地切开骨头（攻击 +3，防御 +2）。';
        } },
      { label: '举手回答问题（可能获得魂尘）', fn() {
          if (Math.random() < 0.6) {
            const dust = 20 + R.depth * 4;
            S.meta.soulDust += dust; S.stats.dustEarned += dust;
            return `骷髅老师满意地点了点头，把一罐魂尘作为奖励递给你（+${dust} 魂尘）。`;
          }
          const d = Math.round(effStats().maxHp * 0.12);
          R.hp = Math.max(1, R.hp - d);
          return `你答错了。戒尺落下时，你才明白那也是一根骨头（-${d} 生命）。`;
        } },
      { label: '掀翻讲台（获得金币）', fn() {
          const g = 80 + R.depth * 12;
          addGold(g);
          return `骸骨们四散奔逃，石凳下藏着的金币滚了一地（+${g} 金币）。`;
        } },
    ]
  },
  {
    id: 'echoWell', n: '回声井', i: '🕳️',
    d: '一口深不见底的井。你每说一句话，井里都会用你的声音回答，只是慢半拍。',
    choices: [
      { label: '对着井口呼喊（可能获得随机技能）', fn() {
          const s = grantRandomSkill();
          if (s) return `井底传来一句陌生的咒语，你跟着念了出来：<b>${s.n}</b>。`;
          const dust = 14 + R.depth * 3;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          return `你已经学会了一切，回声只好化作魂尘（+${dust} 魂尘）。`;
        } },
      { label: '投入 30 金币许愿（暴击率 +6%）', fn() {
          if (R.gold < 30) return '金币落进井里，连回声都没有。井水似乎在嘲笑你。';
          R.gold -= 30;
          R.bonusCrit += 6;
          return '井底亮起一点光。你忽然看懂了所有事物的裂缝（暴击率 +6%）。';
        } },
      { label: '垂下绳子下井（获得精良装备，损失生命）', fn() {
          const it = genItem(R.depth, 'rare');
          addItem(it);
          const d = Math.round(effStats().maxHp * 0.1);
          R.hp = Math.max(1, R.hp - d);
          return `井底堆满了旧物，你找到 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>，爬上来时磨破了手（-${d} 生命）。`;
        } },
    ]
  },
  {
    id: 'wishMachine', n: '锈蚀的许愿机', i: '🎰',
    d: '一台锈迹斑斑的机器，投币口上刻着“愿望有价”。它的摇柄还在缓慢转动。',
    choices: [
      { label: '投入 30 金币许愿（随机结果）', fn() {
          if (R.gold < 30) return '机器吞不下空气，摇柄停住了。';
          R.gold -= 30;
          if (Math.random() < 0.5) {
            R.bonusAtk += 2; R.bonusDef += 2; R.bonusHp += 15; R.bonusCrit += 2;
            healPlayer(15);
            return '机器吐出一张发光的票据，你的身体被微弱地重塑（攻击/防御/生命/暴击小幅提升）。';
          }
          const d = Math.round(effStats().maxHp * 0.14);
          R.hp = Math.max(1, R.hp - d);
          return `机器发出刺耳的尖啸并炸开火花（-${d} 生命）。愿望没有实现。`;
        } },
      { label: '拆解机器（获得金币）', fn() {
          const g = 60 + R.depth * 14;
          addGold(g);
          return `你拆下齿轮与铜线，卖给路过的东西（+${g} 金币）。`;
        } },
      { label: '砸碎它（获得魂尘）', fn() {
          const dust = 22 + R.depth * 4;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          return `机器碎裂的瞬间，无数未实现的愿望化作魂尘（+${dust} 魂尘）。`;
        } },
    ]
  },
  {
    id: 'thornCell', n: '荆棘囚室', i: '🌿',
    d: '一间被荆棘封死的石室，里面隐约有东西在动。藤蔓上的刺滴着黑色的汁液。',
    choices: [
      { label: '强行破门（-15% 生命，获得史诗装备）', fn() {
          const d = Math.round(effStats().maxHp * 0.15);
          R.hp = Math.max(1, R.hp - d);
          const it = genItem(R.depth, 'epic');
          addItem(it);
          return `荆棘划破你的皮肉（-${d} 生命），石室里只有 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>。`;
        } },
      { label: '寻找机关（可能获得金币）', fn() {
          if (Math.random() < 0.65) {
            const g = 100 + R.depth * 18;
            addGold(g);
            return `你按下墙上的暗格，石室后方的金币倾泻而出（+${g} 金币）。`;
          }
          const d = Math.round(effStats().maxHp * 0.12);
          R.hp = Math.max(1, R.hp - d);
          return `机关触发了毒刺（-${d} 生命）。你狼狈地退了出来。`;
        } },
      { label: '转身离开（回复 10% 生命）', fn() {
          healPlayer(Math.round(effStats().maxHp * 0.1));
          return '你没有招惹那些荆棘。离开时，呼吸反而顺畅了一些（回复生命）。';
        } },
    ]
  },
  {
    id: 'astrologer', n: '倒吊的占星师', i: '🔭',
    d: '一个占星师被倒吊在穹顶下，星图从他袖口滑落。他倒着看你，说这才是正确的方向。',
    choices: [
      { label: '听预言（暴击率 +7%）', fn() {
          R.bonusCrit += 7;
          return '他告诉你，你的死星在第七次挥刀时闪烁。你决定让那一次更致命（暴击率 +7%）。';
        } },
      { label: '买下他的星图（消耗 60 金币，最大生命 +40）', fn() {
          if (R.gold < 60) return '占星师摇了摇头：“穷人的星图，只能自己画。”';
          R.gold -= 60;
          R.bonusHp += 40; healPlayer(40);
          return '你把星图铺在胸口，星线慢慢缝进血肉（最大生命 +40）。';
        } },
      { label: '割断绳索（获得稀有装备与魂尘）', fn() {
          const it = genItem(R.depth, 'rare');
          addItem(it);
          const dust = 12 + R.depth * 2;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          return `占星师落地后化作星尘（+${dust} 魂尘），留下一件 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>。`;
        } },
    ]
  },
  {
    id: 'hungryFlame', n: '饥饿的祭火', i: '🔥',
    d: '一团没有柴薪的祭火蜷缩在石台上，火舌不断舔向你的行囊。它在饿。',
    choices: [
      { label: '投入 40 金币（攻击 +4）', fn() {
          if (R.gold < 40) return '祭火嗅了嗅你的空钱袋，失望地缩成一团。';
          R.gold -= 40;
          R.bonusAtk += 4;
          return '金币在火中融成金色的液体，渗进你的手臂（攻击 +4）。';
        } },
      { label: '献上血（-12% 生命，暴击率 +7%）', fn() {
          const d = Math.round(effStats().maxHp * 0.12);
          R.hp = Math.max(1, R.hp - d);
          R.bonusCrit += 7;
          return `祭火舔舐你的伤口（-${d} 生命），你的视线变得锐利（暴击率 +7%）。`;
        } },
      { label: '倒入一瓶药水（药水 -1，最大生命 +25）', fn() {
          if (R.potions <= 0) return '你摇了摇空瓶，祭火打了个哈欠。';
          R.potions--;
          R.bonusHp += 25; healPlayer(25);
          return '药水被火焰吞下，化作暖流反哺你的身体（最大生命 +25）。';
        } },
    ]
  },
  {
    id: 'mistInn', n: '迷雾旅店', i: '🏮',
    d: '雾中亮着一盏灯，旅店的招牌上没有字。老板说，这里的房价取决于你有多累。',
    choices: [
      { label: '睡一觉（消耗 20 金币，回复 55% 生命）', fn() {
          if (R.gold < 20) return '老板看了看你，替你留了一夜门廊——风很大，但你还是睡着了。';
          R.gold -= 20;
          healPlayer(Math.round(effStats().maxHp * 0.55));
          return '你睡得很沉，没有做梦。醒来时伤口已经结痂（回复 55% 生命）。';
        } },
      { label: '吃一顿（消耗 40 金币，攻击 +2、防御 +2、生命 +20）', fn() {
          if (R.gold < 40) return '老板端来一碗热水：“至少这个不要钱。”';
          R.gold -= 40;
          R.bonusAtk += 2; R.bonusDef += 2; R.bonusHp += 20; healPlayer(20);
          return '炖肉里有种说不出的香料（攻击 +2、防御 +2、最大生命 +20）。';
        } },
      { label: '向旅人打听消息（获得金币与药水）', fn() {
          const g = 50 + R.depth * 10;
          addGold(g);
          const add = Math.min(1, R.potionCap - R.potions);
          R.potions += add;
          return `一个独眼旅人塞给你 ${g} 金币${add ? '和一瓶药水' : ''}，让你别往东边走。`;
        } },
    ]
  },
  {
    id: 'twinDoor', n: '双子石门', i: '🚪',
    d: '两扇一模一样的石门并排而立。左边的门缝里渗出冷气，右边的门缝里渗出金光。',
    choices: [
      { label: '推开左门（获得史诗装备，损失生命）', fn() {
          const it = genItem(R.depth, 'epic');
          addItem(it);
          const d = Math.round(effStats().maxHp * 0.15);
          R.hp = Math.max(1, R.hp - d);
          return `寒气割开你的皮肤（-${d} 生命），门后只有 <b style="color:${RARITY[it.rarity].color}">${it.name}</b>。`;
        } },
      { label: '推开右门（获得金币，暴击率 +5%）', fn() {
          const g = 180 + R.depth * 20;
          addGold(g);
          R.bonusCrit += 5;
          return `金光刺得你睁不开眼（+${g} 金币）。等视力恢复，你发现自己更擅长寻找要害了（暴击率 +5%）。`;
        } },
      { label: '把两扇门都砸开（获得魂尘，损失生命）', fn() {
          const dust = 18 + R.depth * 3;
          S.meta.soulDust += dust; S.stats.dustEarned += dust;
          const d = Math.round(effStats().maxHp * 0.08);
          R.hp = Math.max(1, R.hp - d);
          return `门后什么也没有，只有一地碎石与魂尘（+${dust} 魂尘，-${d} 生命）。`;
        } },
    ]
  },
  {
    id: 'mushroomGarden', n: '菌菇苗圃', i: '🍄',
    d: '一片发光的菌菇在黑暗中缓慢呼吸。空气里有甜腻的味道，也有腐败的味道。',
    choices: [
      { label: '摘一朵吃下（随机回复或中毒）', fn() {
          if (Math.random() < 0.6) {
            healPlayer(Math.round(effStats().maxHp * 0.35));
            return '菌菇在嘴里化开，暖流涌遍全身（回复 35% 生命）。';
          }
          const d = Math.round(effStats().maxHp * 0.1);
          R.hp = Math.max(1, R.hp - d);
          return `你的视野开始旋转，喉咙像被火烧（-${d} 生命）。`;
        } },
      { label: '采集一些带走（药水 +2）', fn() {
          const add = Math.min(2, R.potionCap - R.potions);
          R.potions += add;
          return add > 0 ? `你小心地采下菌菇，装进空瓶（药水 +${add}）。` : '你的药水袋已经满了。';
        } },
      { label: '连根烧毁（获得金币）', fn() {
          const g = 80 + R.depth * 15;
          addGold(g);
          return `火焰顺着菌丝蔓延，烧出一窝藏在土里的金币（+${g} 金币）。`;
        } },
    ]
  },
];

/* ---------------- 成就 ---------------- */
const ACHIEVEMENTS = [
  { id: 'first_run',  n: '初次坠落', d: '完成第一次冒险（无论成败）', i: '🌱', r: 8, c: s => s.stats.runs >= 1 },
  { id: 'boss1',      n: '地窟征服者', d: '击败地窟领主 · 格拉姆', i: '🐗', r: 20, c: s => s.stats.bosses.boss1 >= 1 },
  { id: 'boss2',      n: '影之猎手', d: '击败幽影君主 · 维尔', i: '🧛', r: 30, c: s => s.stats.bosses.boss2 >= 1 },
  { id: 'boss3',      n: '熔火克星', d: '击败熔火巨兽 · 伊格尼斯', i: '🐉', r: 40, c: s => s.stats.bosses.boss3 >= 1 },
  { id: 'boss4',      n: '深渊之主', d: '击败深渊之主 · 涅赫', i: '😈', r: 80, c: s => s.stats.bosses.boss4 >= 1 },
  { id: 'win',        n: '破晓者', d: '首次完整通关深渊', i: '🌅', r: 100, c: s => s.stats.wins >= 1 },
  { id: 'kill50',     n: '击溃者', d: '累计击杀 50 个敌人', i: '⚔️', r: 18, c: s => s.stats.kills >= 50 },
  { id: 'kill200',    n: '屠戮者', d: '累计击杀 200 个敌人', i: '💀', r: 35, c: s => s.stats.kills >= 200 },
  { id: 'kill500',    n: '深渊收割者', d: '累计击杀 500 个敌人', i: '☠️', r: 70, c: s => s.stats.kills >= 500 },
  { id: 'rich',       n: '富甲一方', d: '单局持有 800 金币并通过游戏', i: '💰', r: 25, c: s => (s.stats.maxGoldRun || 0) >= 800 },
  { id: 'rich2000',   n: '富可敌国', d: '单局持有 2000 金币并通过游戏', i: '🏦', r: 60, c: s => (s.stats.maxGoldRun || 0) >= 2000 },
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
  { id: 'scavenger30', n: '拾荒之王', d: '累计拾取 30 件装备', i: '🎁', r: 25, c: s => s.stats.itemsFound >= 30 },
  /* —— 深渊叠加 / 深渊叠加 · 极限 —— */
  { id: 'depth5',     n: '五层尽处', d: '通过第 5 层', i: '🕯️', r: 30, c: s => (s.stats.maxWinDepth || 0) >= 5 },
  { id: 'depth10',    n: '叠加之底', d: '通过第 10 层', i: '🌋', r: 60, c: s => (s.stats.maxWinDepth || 0) >= 10 },
  { id: 'depth20',    n: '极限之地', d: '通过第 15 层', i: '🌑', r: 100, c: s => (s.stats.maxWinDepth || 0) >= 15 },
  { id: 'xelite10',   n: '叠加猎人', d: '在深渊叠加中击杀 10 个精英敌人', i: '🔺', r: 50, c: s => s.stats.extremeEliteKills >= 10 },
  { id: 'xboss1',     n: '裂痕终结', d: '击败深渊裂痕 · 卡俄斯', i: '🌀', r: 90, c: s => s.stats.bosses.xboss1 >= 1 },
  { id: 'xboss2',     n: '无光终焉', d: '击败无光之祖 · 乌尔', i: '🌚', r: 110, c: s => s.stats.bosses.xboss2 >= 1 },
  { id: 'xboss3',     n: '极限主宰', d: '击败极限之主 · 绝', i: '👑', r: 160, c: s => s.stats.bosses.xboss3 >= 1 },
  { id: 'xboss4',     n: '深渊主宰', d: '击败深渊主宰 · 阒', i: '🌑', r: 220, c: s => s.stats.bosses.xboss4 >= 1 },
  /* —— 数值与轮回极限 —— */
  { id: 'ng6',         n: '轮回六重', d: '通关轮回难度 6', i: '6️⃣', r: 60,  c: s => (s.stats.maxNgClear || 0) >= 6 },
  { id: 'ng10',        n: '轮回十重', d: '通关轮回难度 10', i: '🔟', r: 80,  c: s => (s.stats.maxNgClear || 0) >= 10 },
  { id: 'ng15',        n: '轮回终焉', d: '通关轮回难度 15（最高）', i: '♾️', r: 160, c: s => (s.stats.maxNgClear || 0) >= 15 },
  { id: 'items15',     n: '行囊初满', d: '单局持有 15 件装备并通关', i: '🎒', r: 50,  c: s => (s.stats.maxItemsRun || 0) >= 15 },
  { id: 'items30',     n: '装备收藏家', d: '单局持有 30 件装备并通关', i: '📦', r: 80,  c: s => (s.stats.maxItemsRun || 0) >= 30 },
  { id: 'items50',     n: '囤积狂魔', d: '单局持有 50 件装备并通关', i: '🗃️', r: 120, c: s => (s.stats.maxItemsRun || 0) >= 50 },
  { id: 'items100',    n: '军械库', d: '单局持有 100 件装备并通关', i: '🏗️', r: 180, c: s => (s.stats.maxItemsRun || 0) >= 100 },
  { id: 'items200',    n: '万宝阁', d: '单局持有 200 件装备并通关', i: '🏛️', r: 260, c: s => (s.stats.maxItemsRun || 0) >= 200 },
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
  /* —— 单次爆发伤害 —— */
  { id: 'hit500',      n: '重击者', d: '单次造成 500 点伤害', i: '🔨', r: 45,  c: s => (s.stats.bestHit || 0) >= 500 },
  { id: 'hit1000',     n: '破军者', d: '单次造成 1000 点伤害', i: '💢', r: 70,  c: s => (s.stats.bestHit || 0) >= 1000 },
  { id: 'hit5000',     n: '崩山者', d: '单次造成 5000 点伤害', i: '🌄', r: 120, c: s => (s.stats.bestHit || 0) >= 5000 },
  { id: 'hit10000',    n: '灭城者', d: '单次造成 10000 点伤害', i: '☄️', r: 180, c: s => (s.stats.bestHit || 0) >= 10000 },
  { id: 'hit20000',    n: '弑神者', d: '单次造成 20000 点伤害', i: '🌌', r: 260, c: s => (s.stats.bestHit || 0) >= 20000 },
  /* —— 条约 · 单条条约（签署并通过 15 层） —— */
  { id: 'treaty_hp1',   n: '血肉契约',   d: '签署条约「生命增幅」并通过 15 层',   i: '❤️', r: 60,  c: s => ((s.stats.treatyClear || {})['t_hp1'] || 0) >= 1 },
  { id: 'treaty_atk1',  n: '锋刃契约',   d: '签署条约「攻击增幅」并通过 15 层',   i: '⚔️', r: 60,  c: s => ((s.stats.treatyClear || {})['t_atk1'] || 0) >= 1 },
  { id: 'treaty_def1',  n: '坚壁契约',   d: '签署条约「铁壁」并通过 15 层',       i: '🏰', r: 60,  c: s => ((s.stats.treatyClear || {})['t_def1'] || 0) >= 1 },
  { id: 'treaty_gold1', n: '贪欲契约',   d: '签署条约「贪婪税」并通过 15 层',     i: '💵', r: 60,  c: s => ((s.stats.treatyClear || {})['t_gold1'] || 0) >= 1 },
  { id: 'treaty_pdef1', n: '侵蚀契约',   d: '签署条约「虚弱侵蚀」并通过 15 层',   i: '🩹', r: 60,  c: s => ((s.stats.treatyClear || {})['t_pdef1'] || 0) >= 1 },
  { id: 'treaty_patk1', n: '钝锋契约',   d: '签署条约「钝刃」并通过 15 层',       i: '🗡️', r: 60,  c: s => ((s.stats.treatyClear || {})['t_patk1'] || 0) >= 1 },
  { id: 'treaty_pcrt1', n: '迟滞契约',   d: '签署条约「迟缓」并通过 15 层',       i: '🐌', r: 60,  c: s => ((s.stats.treatyClear || {})['t_pcrt1'] || 0) >= 1 },
  { id: 'treaty_shop1', n: '涨价契约',   d: '签署条约「物价微涨」并通过 15 层',   i: '🏷️', r: 60,  c: s => ((s.stats.treatyClear || {})['t_shop1'] || 0) >= 1 },
  { id: 'treaty_hp2',   n: '血肉契约 II', d: '签署条约「生命增幅 II」并通过 15 层', i: '💗', r: 80, c: s => ((s.stats.treatyClear || {})['t_hp2'] || 0) >= 1 },
  { id: 'treaty_atk2',  n: '锋刃契约 II', d: '签署条约「攻击增幅 II」并通过 15 层', i: '🔱', r: 80, c: s => ((s.stats.treatyClear || {})['t_atk2'] || 0) >= 1 },
  { id: 'treaty_def2',  n: '硬壳契约',   d: '签署条约「硬壳」并通过 15 层',       i: '🐢', r: 80,  c: s => ((s.stats.treatyClear || {})['t_def2'] || 0) >= 1 },
  { id: 'treaty_pcd2',  n: '心压契约',   d: '签署条约「精神压迫」并通过 15 层',   i: '🧠', r: 80,  c: s => ((s.stats.treatyClear || {})['t_pcd2'] || 0) >= 1 },
  { id: 'treaty_pdef2', n: '疲惫契约',   d: '签署条约「疲惫之躯」并通过 15 层',   i: '😵', r: 80,  c: s => ((s.stats.treatyClear || {})['t_pdef2'] || 0) >= 1 },
  { id: 'treaty_gold2', n: '贫瘠契约',   d: '签署条约「贫瘠」并通过 15 层',       i: '💲', r: 80,  c: s => ((s.stats.treatyClear || {})['t_gold2'] || 0) >= 1 },
  { id: 'treaty_shop2', n: '通胀契约',   d: '签署条约「通货膨胀」并通过 15 层',   i: '💸', r: 100, c: s => ((s.stats.treatyClear || {})['t_shop2'] || 0) >= 1 },
  { id: 'treaty_patk3', n: '萎缩契约',   d: '签署条约「肌肉萎缩」并通过 15 层',   i: '💪', r: 100, c: s => ((s.stats.treatyClear || {})['t_patk3'] || 0) >= 1 },
  { id: 'treaty_atk3',  n: '回响契约',   d: '签署条约「深渊回响」并通过 15 层',   i: '🔊', r: 100, c: s => ((s.stats.treatyClear || {})['t_atk3'] || 0) >= 1 },
  { id: 'treaty_php3',  n: '血价契约',   d: '签署条约「血之代价」并通过 15 层',   i: '🩸', r: 100, c: s => ((s.stats.treatyClear || {})['t_php3'] || 0) >= 1 },
  { id: 'treaty_patk4', n: '至萎契约',   d: '签署条约「肌肉萎缩 · 极」并通过 15 层', i: '💀', r: 120, c: s => ((s.stats.treatyClear || {})['t_patk4'] || 0) >= 1 },
  { id: 'treaty_hp4',   n: '至血契约',   d: '签署条约「生命增幅 · 极」并通过 15 层', i: '💓', r: 120, c: s => ((s.stats.treatyClear || {})['t_hp4'] || 0) >= 1 },
  { id: 'treaty_pcd5',  n: '衰竭契约',   d: '签署条约「精神衰竭」并通过 15 层',   i: '💫', r: 150, c: s => ((s.stats.treatyClear || {})['t_pcd5'] || 0) >= 1 },
  { id: 'treaty_atk5',  n: '凝视契约',   d: '签署条约「深渊凝视」并通过 15 层',   i: '👁️', r: 150, c: s => ((s.stats.treatyClear || {})['t_atk5'] || 0) >= 1 },
  { id: 'treaty_shop5', n: '万物通胀',   d: '签署条约「万物通胀」并通过 15 层',   i: '📈', r: 150, c: s => ((s.stats.treatyClear || {})['t_shop5'] || 0) >= 1 },
  { id: 'treaty_pall5', n: '枯竭契约',   d: '签署条约「灵魂枯竭」并通过 15 层',   i: '🥀', r: 150, c: s => ((s.stats.treatyClear || {})['t_pall5'] || 0) >= 1 },
  /* —— 条约 · 单局条约总分（通过 15 层） —— */
  { id: 'treaty_score10', n: '契约学徒', d: '单局累计签署条约达 10 分并通过 15 层', i: '📜', r: 70,  c: s => (s.stats.maxTreatyScoreClear || 0) >= 10 },
  { id: 'treaty_score30', n: '契约行者', d: '单局累计签署条约达 30 分并通过 15 层', i: '🖋️', r: 120, c: s => (s.stats.maxTreatyScoreClear || 0) >= 30 },
  { id: 'treaty_score45', n: '契约大师', d: '单局累计签署条约达 45 分并通过 15 层', i: '📖', r: 180, c: s => (s.stats.maxTreatyScoreClear || 0) >= 45 },
  { id: 'treaty_score60', n: '深渊同谋', d: '单局累计签署条约达 60 分并通过 15 层', i: '🕋', r: 260, c: s => (s.stats.maxTreatyScoreClear || 0) >= 60 },
];

/* ---------------- 成就分类（侧边栏） ---------------- */
const ACH_CATS = [
  { id: 'all',       n: '全部', i: '🏆' },
  { id: 'clear',     n: '清剿', i: '⚔️' },
  { id: 'collect',   n: '收集', i: '🎁' },
  { id: 'accum',     n: '累计', i: '📈' },
  { id: 'treaty',    n: '条约', i: '📜' },
  { id: 'challenge', n: '挑战', i: '🔥' },
];
const ACH_CAT_MAP = {
  /* 清剿：首领 */
  boss1: 'clear', boss2: 'clear', boss3: 'clear', boss4: 'clear', allboss: 'clear',
  xboss1: 'clear', xboss2: 'clear', xboss3: 'clear', xboss4: 'clear',
  flawless: 'challenge',
  /* 收集：装备 / 金币 / 魂尘 / 商品 */
  rich: 'collect', rich2000: 'collect', collector: 'collect', legendary: 'collect',
  fullset: 'collect', scavenger30: 'collect', dust500: 'collect',
  items15: 'collect', items30: 'collect', items50: 'collect',
  items100: 'collect', items200: 'collect',
  /* 累计：击杀累计 / 长期累计行为 / 单次伤害 */
  kill50: 'accum', kill200: 'accum', kill500: 'accum', elite20: 'accum', xelite10: 'accum',
  first_run: 'accum', crit100: 'accum', potions: 'accum', skills: 'accum',
  healer: 'accum', explorer: 'accum', death10: 'accum', bigHit: 'accum',
  hit500: 'accum', hit1000: 'accum', hit5000: 'accum', hit10000: 'accum', hit20000: 'accum',
  /* 条约：单条条约 / 单局条约总分 */
  treaty_hp1: 'treaty', treaty_atk1: 'treaty', treaty_def1: 'treaty', treaty_gold1: 'treaty',
  treaty_pdef1: 'treaty', treaty_patk1: 'treaty', treaty_pcrt1: 'treaty', treaty_shop1: 'treaty',
  treaty_hp2: 'treaty', treaty_atk2: 'treaty', treaty_def2: 'treaty', treaty_pcd2: 'treaty',
  treaty_pdef2: 'treaty', treaty_gold2: 'treaty', treaty_shop2: 'treaty', treaty_patk3: 'treaty',
  treaty_atk3: 'treaty', treaty_php3: 'treaty', treaty_patk4: 'treaty', treaty_hp4: 'treaty',
  treaty_pcd5: 'treaty', treaty_atk5: 'treaty', treaty_shop5: 'treaty', treaty_pall5: 'treaty',
  treaty_score10: 'treaty', treaty_score30: 'treaty', treaty_score45: 'treaty', treaty_score60: 'treaty',
  /* 挑战：通关 / 层数 / 轮回 / 极限数值 */
  win: 'challenge', depth5: 'challenge', depth10: 'challenge', depth20: 'challenge',
  ng1: 'challenge', ng6: 'challenge', ng10: 'challenge', ng15: 'challenge', nopotion: 'challenge',
  atk500: 'challenge', atk1000: 'challenge', def200: 'challenge', def500: 'challenge',
  critdmg200: 'challenge', critdmg500: 'challenge', critdmg1000: 'challenge',
  hp1000: 'challenge', hp2000: 'challenge', hp3000: 'challenge',
};
function achCatOf(id) { return ACH_CAT_MAP[id] || 'accum'; }
function setAchCat(c) {
  achCat = ACH_CATS.some(x => x.id === c) ? c : 'all';
  sfx('click');
  renderHub();
}

/* ---------------- 永久升级（科技树分层） ---------------- */
// tier: 1=基础三围, 2=次级属性/资源, 3=功能强化, 4=终极能力
// 每层全部满级后才会解锁下一层
const UPGRADES = [
  { id: 'hp',     n: '坚韧之魂', d: '最大生命 +9',       max: 25, i: '❤️', cost: l => 8 + l * 6,   tier: 1 },
  { id: 'atk',    n: '力量之魂', d: '攻击 +1.5',         max: 25, i: '⚔️', cost: l => 10 + l * 8,  tier: 1 },
  { id: 'def',    n: '守护之魂', d: '防御 +1',           max: 25, i: '🛡️', cost: l => 10 + l * 8,  tier: 1 },
  { id: 'crit',   n: '敏锐之魂', d: '暴击率 +3%',        max: 12, i: '🎯', cost: l => 16 + l * 12, tier: 2 },
  { id: 'gold',   n: '财富之魂', d: '金币获取 +5%',      max: 10, i: '💰', cost: l => 14 + l * 10, tier: 2 },
  { id: 'dust',   n: '共鸣之魂', d: '魂尘获取 +6%',      max: 10, i: '✨', cost: l => 18 + l * 14, tier: 2 },
  { id: 'potion', n: '行囊扩容', d: '药水携带上限 +1',   max: 4,  i: '🧪', cost: l => 30 + l * 25, tier: 3 },
  { id: 'memory', n: '远古记忆', d: '开局多一个随机技能', max: 3,  i: '📜', cost: l => 45 + l * 45, tier: 3 },
  { id: 'revive', n: '不灭之魂', d: '每局可复活一次',     max: 1,  i: '🕯️', cost: l => 150,        tier: 4 },
];
const UPGRADE_TIERS = [1, 2, 3, 4];
function tierMaxed(tier) {
  const u = S.meta.upgrades || {};
  return UPGRADES.filter(up => up.tier === tier).every(up => (u[up.id] || 0) >= up.max);
}
function tierUnlocked(tier) {
  if (tier <= 1) return true;
  return tierMaxed(tier - 1);
}

/* ---------------- 周期挑战 ---------------- */
// 轮换时更新周期 id 与挑战列表；新周期会自动获得一套全新的奖励领取记录。
const CHALLENGE_NG = STACK_UNLOCK_NG;
const CHALLENGE_PASS_XP = 10;
const CHALLENGE_CYCLE = {
  id: 'cycle_1', name: '第一期', rotation: '不定期轮换',
  startsAt: null, endsAt: null,
};
const CHALLENGES = [
  {
    id: 'vital_lock', n: '命铠试炼', i: '🛡️', reward: CHALLENGE_PASS_XP,
    short: '生命上限固定 200 · 防御固定 50',
    desc: '以轮回难度 X 为基础，在生命值上限固定为 200、防御力固定为 50 的情况下通过第十层。攻击力、暴击率和暴伤等无限制。',
    note: '生命值与防御力不可通过购买物品或其他手段提升；「深渊统治者」与魂尘强化中仅对应的生命、防御增益失效，其他增益不受影响。',
    fixed: { maxHp: 200, def: 50 }, restrictedBoons: ['hp', 'def'],
  },
  {
    id: 'blade_lock', n: '锋刃封印', i: '⚔️', reward: CHALLENGE_PASS_XP,
    short: '攻击固定 300 · 暴击率固定 50%',
    desc: '以轮回难度 X 为基础，在攻击力固定为 300、暴击率固定为 50% 的情况下通过第十层。生命值、防御力和暴伤等无限制。',
    note: '攻击力与暴击率不可通过购买物品或其他手段提升；「深渊统治者」与魂尘强化中仅对应的攻击、暴击增益失效，其他增益不受影响。',
    fixed: { atk: 300, crit: 50 }, restrictedBoons: ['atk', 'crit'],
  },
  {
    id: 'inflation', n: '通胀深渊', i: '💰', reward: CHALLENGE_PASS_XP,
    short: '金币获取加成固定 20% · 物价逐层 ×1',
    desc: '以轮回难度 X 为基础，常规金币获取加成固定至 20%，并且每一层深渊商店中所有物品的售价逐层加倍（第 1 层 ×1、第 2 层 ×2，以此类推），通过第十层。',
    note: '金币获取加成不可通过购买物品或其他手段提升；魂尘强化的金币获取增益失效，其余「深渊统治者」与魂尘强化增益不受影响。',
    fixed: { goldFind: 20 }, restrictedBoons: [],
  },
];
function challengeById(id) { return CHALLENGES.find(c => c.id === id) || null; }
function currentChallenge(r = R) { return r && r.challengeId ? challengeById(r.challengeId) : null; }
function challengesUnlocked() { return (S.meta.ngPlus || 0) >= STACK_UNLOCK_NG; }
function challengeStatLocked(key) {
  const ch = currentChallenge();
  return !!(ch && ch.fixed && ch.fixed[key] !== undefined);
}
function challengeShopPriceMul() {
  const ch = currentChallenge();
  return ch && ch.id === 'inflation' ? Math.max(1, R.depth || 1) : 1;
}

// 奖励按启动器账号记录，避免切换游戏存档位后重复领取同一周期奖励。
function challengeClaimStorageKey() {
  let cur = {};
  try { cur = JSON.parse(localStorage.getItem('currentUser') || '{}'); } catch (e) {}
  return 'pre_abyss_challenge_claims_v1_' + (cur.username || 'anonymous');
}
function challengeClaimData() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(challengeClaimStorageKey()) || 'null'); } catch (e) {}
  if (!data || data.cycle !== CHALLENGE_CYCLE.id || !data.claimed || typeof data.claimed !== 'object') {
    data = { cycle: CHALLENGE_CYCLE.id, claimed: {} };
  }
  return data;
}
function challengeRewardClaimed(id) { return !!challengeClaimData().claimed[id]; }
function markChallengeRewardClaimed(id) {
  const data = challengeClaimData();
  if (data.claimed[id]) return false;
  data.claimed[id] = Date.now();
  try { localStorage.setItem(challengeClaimStorageKey(), JSON.stringify(data)); return true; }
  catch (e) { return false; }
}

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
  const dust = 1 + lv * 0.08;
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

/* 玩家所选轮回难度：单独持久化，不再每局重新选择 */
function currentNgSelect() {
  const max = Math.min(S.meta.ngPlus || 0, MAX_NG);
  const v = (S.meta.ngSelect == null) ? max : (S.meta.ngSelect | 0);
  return clamp(v, 0, max);
}
function setNgSelect(lv) {
  const max = Math.min(S.meta.ngPlus || 0, MAX_NG);
  S.meta.ngSelect = clamp(lv | 0, 0, max);
  saveGame();
  sfx('click');
  renderHub();
  toast(`轮回难度已设置为「${ngInfo(S.meta.ngSelect).name}」`, '🔄', 'success');
}
function toggleNgMenu(e) {
  if (e) e.stopPropagation();
  const m = $('#ng-menu');
  if (m) m.classList.toggle('on');
}
function closeNgMenu() {
  const m = $('#ng-menu');
  if (m) m.classList.remove('on');
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
let achCat = 'all';

/* ---------------- 档案 ---------------- */
function defaultState() {
  return {
    meta: {
      soulDust: 0, ngPlus: 0, ngSelect: 0,
      upgrades: { hp: 0, atk: 0, def: 0, crit: 0, gold: 0, dust: 0, potion: 0, memory: 0, revive: 0 },
      extreme: false, passWeekly: null, stackEnabled: true,
      rulerBuffOn: true,
    },
    stats: {
      runs: 0, wins: 0, deaths: 0, kills: 0, eliteKills: 0,
      bosses: { boss1: 0, boss2: 0, boss3: 0, boss4: 0, xboss1: 0, xboss2: 0, xboss3: 0, xboss4: 0 },
      goldEarned: 0, maxGold: 0, buys: 0, potionsUsed: 0, skillUses: 0, crits: 0,
      bestHit: 0, healed: 0, events: 0, itemsFound: 0, legendEquipped: 0, fullSet: 0,
      flawlessElite: 0, dustEarned: 0, winsNoPotion: 0, maxDepth: 0, rooms: 0, evil: 0,
      damageDealt: 0, battles: 0, extremeWins: 0, extremeEliteKills: 0,
      maxTreatiesRun: 0, maxTreatyScore: 0,
      maxNgClear: 0, maxItemsRun: 0, maxAtkRun: 0, maxDefRun: 0, maxCritDmgRun: 0, maxHpRun: 0,
      maxGoldRun: 0, maxWinDepth: 0, maxTreatyScoreClear: 0, treatyClear: {},
    },
    ach: {},
    codex: {},
    history: [],
    settings: { sound: true, fps: 'auto', motion: 'all' },
  };
}

function normalizeState(d) {
  const base = defaultState();
  d = d || {};
  // 深合并，避免版本升级缺字段
  const merged = Object.assign(base, d);
  merged.meta = Object.assign({}, base.meta, d.meta || {});
  merged.meta.upgrades = Object.assign({}, base.meta.upgrades, (d.meta && d.meta.upgrades) || {});
  merged.stats = Object.assign({}, base.stats, d.stats || {});
  merged.stats.bosses = Object.assign({}, base.stats.bosses, (d.stats && d.stats.bosses) || {});
  merged.stats.treatyClear = Object.assign({}, base.stats.treatyClear, (d.stats && d.stats.treatyClear) || {});
  merged.settings = Object.assign({}, base.settings, d.settings || {});
  merged.ach = d.ach || {};
  // 成就体系扩充后：若新增成就尚未达成，深渊统治者回退为未解锁（不影响已获得魂尘）
  if (merged.ach['abyss_ruler'] && !ACHIEVEMENTS.every(a => merged.ach[a.id])) {
    delete merged.ach['abyss_ruler'];
  }
  merged.codex = d.codex || {};
  merged.meta.ngPlus = Math.min(MAX_NG, merged.meta.ngPlus || 0);
  // 旧存档没有单独保存所选难度时，默认沿用已解锁的最高难度
  if (!d.meta || d.meta.ngSelect == null) merged.meta.ngSelect = merged.meta.ngPlus;
  merged.meta.ngSelect = Math.max(0, Math.min(merged.meta.ngPlus, merged.meta.ngSelect | 0));
  return merged;
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState();
    const d = JSON.parse(raw);
    const hadRuler = !!(d.ach && d.ach['abyss_ruler']);
    const st = normalizeState(d);
    // 成就体系扩充后元成就已回退：立即回写，保证启动器同步显示未解锁
    if (hadRuler && !st.ach['abyss_ruler']) {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(st)); } catch (e) {}
    }
    return st;
  } catch (e) { console.warn('存档读取失败', e); return defaultState(); }
}

/* ---------------- 多存档位 ---------------- */
function loadSlots() {
  let raw = [];
  try { raw = JSON.parse(localStorage.getItem(SLOTS_KEY) || '[]') || []; } catch (e) { raw = []; }
  const out = [];
  for (let i = 0; i < SAVE_SLOT_COUNT; i++) out.push(raw[i] || null);
  return out;
}
function persistSlots(arr) {
  try { localStorage.setItem(SLOTS_KEY, JSON.stringify(arr)); } catch (e) { console.warn('存档位写入失败', e); }
}
function snapshotState() { return { ts: Date.now(), data: JSON.parse(JSON.stringify(S)) }; }
function syncActiveSlot() {
  if (activeSlot === null) return;
  const arr = loadSlots();
  if (!arr[activeSlot]) return;
  arr[activeSlot].data = JSON.parse(JSON.stringify(S));
  arr[activeSlot].ts = Date.now();
  persistSlots(arr);
}
function setActiveSlot(idx) {
  activeSlot = idx;
  try {
    if (idx === null) localStorage.removeItem(ACTIVE_SLOT_KEY);
    else localStorage.setItem(ACTIVE_SLOT_KEY, String(idx));
  } catch (e) {}
}

function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { console.warn('存档失败', e); }
  syncActiveSlot();
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
function rulerUnlocked() { return !!(S && S.ach && S.ach['abyss_ruler']); }
// 总成就开关关闭时不提供全局 buff，但不影响成就解锁进度
function hasRulerBuff() { return rulerUnlocked() && S.meta.rulerBuffOn !== false; }
function rulerBuff() { return hasRulerBuff() ? META_ACHIEVEMENTS[0].buff : null; }
function rulerTagHtml() {
  if (!rulerUnlocked()) return '';
  return hasRulerBuff()
    ? '<span class="pill tag-jade">👑 深渊统治者 · 激活中</span>'
    : '<span class="pill tag-rose">👑 深渊统治者 · 未激活</span>';
}


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
  const tm = treatyMods();
  // 条约攻击减益最多叠加到 -65%，避免后期攻击力被压成 1 而完全无法战斗
  const atkMul = (rb ? (1 + rb.atkPct) : 1) * Math.max(0.35, 1 + tm.playerAtk);
  const defMul = (rb ? (1 + rb.defPct) : 1) * (1 + tm.playerDef);
  const hpMul = 1 + tm.playerHp;
  const critAdd = (rb ? rb.critAdd : 0) + tm.playerCrit;
  const hasHp = dv && dv.hp != null, hasAtk = dv && dv.atk != null;
  const hasDef = dv && dv.def != null, hasCrit = dv && dv.crit != null;
  const stats = {
    maxHp: Math.max(1, Math.round((hasHp ? dv.hp : (100 + u.hp * 10 + eq.hp + bonusHp)) * hpMul)),
    atk: Math.max(1, (hasAtk ? dv.atk : (14 + u.atk * 1.5 + eq.atk + bonusAtk)) * atkMul),
    def: Math.max(0, (hasDef ? dv.def : (3 + u.def * 1 + eq.def + bonusDef)) * defMul),
    crit: clamp((hasCrit ? dv.crit : (5 + u.crit * 3 + eq.crit + bonusCrit)) + critAdd, 0, 100),
    critDmg: Math.max(100, 150 + eq.critDmg + 150 * tm.playerCritDmg),
    lifesteal: eq.lifesteal,
    goldFind: u.gold * 5 + eq.gold,
  };
  // 挑战固定值最后覆盖：装备、魂尘、统治者、事件、开发者数值均无法绕过。
  const ch = currentChallenge();
  if (ch && ch.fixed) Object.keys(ch.fixed).forEach(k => { stats[k] = ch.fixed[k]; });
  return stats;
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
  if (n > 0 && R) {
    const m = modeOf(R);
    const modeMul = m === 2 ? 1.3 : (m === 1 ? 1.15 : 1);
    n = Math.round(n * modeMul * Math.max(0, 1 + treatyMods().goldGain));
  }
  R.gold += n;
  R.maxGold = Math.max(R.maxGold || 0, R.gold);
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
  const atkUp = challengeStatLocked('atk') ? 0 : buffVal(B.pBuffs, 'atkUp');
  const critBonus = challengeStatLocked('crit') ? 0 : (opt.critBonus || 0);
  const atk = s.atk * (1 + atkUp) * (1 - buffVal(B.pBuffs, 'weak'));
  let def = B.enemy.def * (1 + buffVal(B.eBuffs, 'defUp'));
  if (opt.trueDmg) def = 0;
  const res = dmgFormula(atk, def, s.crit + critBonus, s.critDmg, mult);
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
  const defUp = challengeStatLocked('def') ? 0 : buffVal(B.pBuffs, 'defUp');
  const def = s.def * (1 + defUp);
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
  const defUp = challengeStatLocked('def') ? 0 : buffVal(B.pBuffs, 'defUp');
  const def = effStats().def * (1 + defUp);
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

let runView = 'map';
let pendingItems = [];
let shopMode = 'buy';
let sellSelected = new Set();
let batchSell = false;

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

// 总成就全局 buff 开关：不影响解锁进度，仅控制 buff 是否生效
function toggleRulerBuff() {
  if (!rulerUnlocked()) return;
  S.meta.rulerBuffOn = !hasRulerBuff();
  sfx('click');
  saveGame();
  renderHub();
}

/* ---------------- 标题屏 ---------------- */
function renderTitle() {
  const hasRun = !!S.runSave;
  const pending = !!S.pendingSettlement;
  const played = S.stats.runs > 0 || S.meta.soulDust > 0 || S.stats.maxDepth > 0;
  const settleBtn = `<button class="btn btn-danger btn-lg" onclick="showSettlementModal(S.pendingSettlement)">有待领取内容</button>`;
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
        ${played ? `<button class="btn btn-ghost btn-lg" onclick="goHubWithLoading()">灵魂圣所</button>` : ''}
      </div>
      <div class="title-foot">
        魂尘 ${fmt(S.meta.soulDust)} · 最深 ${S.stats.maxDepth} 层 · 成就 ${achCount()}/${ACHIEVEMENTS.length}
      </div>
    </div>
  </div>`;
}

/* ---------------- 圣所 ---------------- */
function goHub(tab) {
  hubTab = tab || 'sanctum';
  renderHub();
  showScreen('hub');
}

/* 返回圣所：播放与进入深渊一致的加载动画；已经在圣所时直接切换，避免重复加载 */
function goHubWithLoading(tab) {
  const target = tab || 'sanctum';
  if (runLoadingBusy) { goHub(target); return; }
  const hubEl = $('#screen-hub');
  if (hubEl && hubEl.classList.contains('active')) { goHub(target); return; }
  showRunLoading(() => goHub(target), { title: '正在返回圣所', duration: 2200 });
}

function renderHub() {
  const u = S.meta.upgrades;
  const challengeOpen = challengesUnlocked();
  if (hubTab === 'challenge' && !challengeOpen) hubTab = 'sanctum';
  const tabs = [
    ['sanctum', '⚒️ 圣所'],
    ['challenge', challengeOpen ? '🏆 挑战' : '🔒 挑战', !challengeOpen],
    ['ach', '🏆 成就'], ['codex', '📖 图鉴'],
    ['weapon', '⚔️ 武器'], ['skill', '✨ 技能'], ['stats', '📊 统计'], ['settings', '⚙️ 设置'],
  ];
  let content = '';

  if (hubTab === 'sanctum') {
    // 科技树渲染：按层分组，每层横向排列节点，层间用连接线相连
    const tierNames = { 1: '基础三围', 2: '次级属性', 3: '功能强化', 4: '终极能力' };
    const tierHtml = UPGRADE_TIERS.map((tier, idx) => {
      const unlocked = tierUnlocked(tier);
      const maxed = tierMaxed(tier);
      const nodes = UPGRADES.filter(up => up.tier === tier).map(up => {
        const lv = u[up.id] || 0;
        const upMaxed = lv >= up.max;
        const cost = up.cost(lv);
        const can = unlocked && !upMaxed && S.meta.soulDust >= cost;
        const pct = Math.round(lv / up.max * 100);
        return `<div class="tech-node ${upMaxed ? 'maxed' : ''} ${unlocked ? '' : 'locked'}" ${unlocked ? '' : 'data-locked="1"'}>
          <div class="tech-node-ico">${up.i}</div>
          <div class="tech-node-name">${up.n} <span class="tech-node-lv">Lv.${lv}/${up.max}</span></div>
          <div class="tech-node-desc">${up.d}</div>
          <div class="bar slim" style="margin-top:7px"><div class="bar-fill" style="width:${pct}%;background:linear-gradient(90deg,#ffcb5c,#ff8a3d)"></div></div>
          <div class="tech-node-foot">
            ${upMaxed
              ? `<span class="pill tag-gold">已满级</span>`
              : unlocked
                ? `<span class="cost">✨ ${fmt(cost)}</span>
                   <button class="btn btn-sm ${can ? 'btn-arcane' : 'btn-ghost'}" ${can ? '' : 'disabled'} onclick="buyUpgrade('${up.id}')">升级</button>`
                : `<span class="pill" style="color:var(--dim)">🔒 未解锁</span>`}
          </div>
        </div>`;
      }).join('');
      const connector = idx < UPGRADE_TIERS.length - 1
        ? `<div class="tech-connector ${maxed ? 'done' : ''}"><div class="tech-connector-line"></div><div class="tech-connector-label">${maxed ? '✦ 已解锁下一层' : '↑ 满级后解锁下一层'}</div></div>`
        : '';
      return `<div class="tech-tier" data-tier="${tier}">
        <div class="tech-tier-head">
          <span class="tech-tier-badge">F${['1','2','3','4'][idx]}</span>
          <span class="tech-tier-name">${tierNames[tier]}</span>
          ${maxed ? '<span class="pill tag-jade" style="margin-left:auto">已完成</span>' : unlocked ? '<span class="pill" style="margin-left:auto">进行中</span>' : '<span class="pill" style="margin-left:auto">🔒 锁定</span>'}
        </div>
        <div class="tech-nodes">${nodes}</div>
      </div>${connector}`;
    }).join('');
    const upgHtml = `<div class="tech-tree">${tierHtml}</div>`;

    const boonUnlocked = allUpgradesMaxed();
    const boonMaxedCnt = UPGRADES.filter(up => (u[up.id] || 0) >= up.max).length;
    const boonCard = `<div class="card" style="margin-top:16px">
      <div class="card-h"><span>🌠</span><div><div class="card-t">开局增益</div><div class="card-sub">PRE-RUN BOONS · ${boonUnlocked ? '已解锁' : '完成全部魂尘强化后解锁'}</div></div>
        <div style="margin-left:auto" class="pill ${boonUnlocked ? 'tag-jade' : ''}">${boonUnlocked ? '已解锁' : boonMaxedCnt + ' / ' + UPGRADES.length + ' 项满级'}</div>
      </div>
      <div class="small dim" style="line-height:1.9">
        ${boonUnlocked
          ? '踏入深渊前可配置开局增益：最多选择 <b>3</b> 个技能与 <b>2</b> 项属性增益，并使用魂尘购买。属性增益可点击「+ / ++」突破，消耗魂尘大幅提升，两者互斥。<br>若本局选择「放弃冒险」，结算时选择「放弃领取」会把开局增益消耗的魂尘<b style="color:var(--jade)">全额退还</b>，但本局魂尘奖励一并放弃；选择「领取奖励」则保留魂尘奖励，开局增益花费不退还。'
          : '将全部魂尘强化升至满级后解锁：进入游戏前可用魂尘购买技能与属性增益（最多 3 个技能 + 2 项属性增益，可突破）。'}
      </div>
    </div>`;

    // 深渊叠加 · 玩法说明卡片（通关第 5 层时触发，无需预先开启）
    const stackUnlocked = (S.meta.ngPlus || 0) >= STACK_UNLOCK_NG;
    const runActive = !!S.runSave;
    const stackEnabled = S.meta.stackEnabled !== false;
    const stackCard = `<div class="card sanctum-card xmode-card ${stackUnlocked && stackEnabled ? 'on' : ''} ${stackUnlocked ? '' : 'locked'}">
      <div class="card-h"><span>🩸</span><div><div class="card-t">深渊叠加</div><div class="card-sub">ABYSS STACK · 5 / 10 / 15 层</div></div>
        <div style="margin-left:auto" class="pill ${runActive ? 'tag-gold' : stackUnlocked && stackEnabled ? 'tag-rose' : ''}">${runActive ? '冒险中' : !stackUnlocked ? '未解锁' : stackEnabled ? '已启用' : '已关闭'}</div>
      </div>
      <div class="small dim" style="line-height:1.9">
        ${stackUnlocked
          ? (stackEnabled
            ? '开启后，通关第 <b>5</b> 层时将弹出提示，可选择进入「深渊叠加」模式并把探索层数提高到 <b style="color:#ff8b9a">10</b> 层；在深渊叠加模式中，敌人的生命与攻击大幅提高，全新的精英与首领登场；我方的增益与事件馈赠同样被深渊放大，通关后的魂尘奖励大幅增加。<br><br>玩家在通过第 <b>10</b> 层后将弹出提示，可选择进入「深渊叠加 · 极限」模式并把探索层数提高到 <b style="color:#ff8b9a">15</b> 层，并连带启用新的「深渊条约」模式：在 11-14 层的每一层结束后，玩家可以选择六种条约（共 24 种条约，所有条约共计 60 分），每个条约将会由分数等级大幅提升敌方/我方的总体难度。'
            : '深渊叠加当前已 <b style="color:#ff9aa8">关闭</b>。通关第 <b>5</b> 层后将直接结算本局，不再弹出进入提示，也不会进入 10 / 15 层的叠加内容。<br><br>开启/关闭状态会在一局开始时锁定，冒险进行中无法更改；本局结算后可重新开启。')
          : `轮回难度达到 <b>${STACK_UNLOCK_NG}</b> 后解锁（当前 ${S.meta.ngPlus}/${MAX_NG}）。未解锁时通关第 5 层将直接结算本局。`}
      </div>
      <div class="xmode-row">
        <div class="xmode-switch ${stackEnabled ? 'on' : ''} ${runActive || !stackUnlocked ? 'locked' : ''}" onclick="toggleStackEnabled()"><span></span></div>
        <div class="small ${stackEnabled ? '' : 'dim'}" style="line-height:1.6">
          ${!stackUnlocked ? '尚未解锁' : runActive ? '冒险进行中 · 结算前无法更改开关' : stackEnabled ? '已启用 · 第 5 层结束后可选择进入深渊叠加' : '已关闭 · 第 5 层结束后直接结算本局'}
        </div>
      </div>
    </div>`;

    // 每周加成卡片（与通行证赛季时间绑定：赛季结束后进入休赛期，无法获取通行证经验）
    const pw = ensurePassWeekly();
    const pwSeason = passWeeklySeasonState();
    const pwOffSeason = !pwSeason.active;
    const pwUnlocked = !pwOffSeason && (S.meta.ngPlus || 0) >= 6;
    const xpPct = Math.round(Math.max(0, pw.xpLeft) / PASS_WEEK_XP * 100);
    const segHtml = [0, 1, 2].map(i => `<div class="pw-seg ${i < pw.bonusLeft ? 'on' : ''}"></div>`).join('');
    const pwPill = pwOffSeason
      ? '<div style="margin-left:auto" class="pill">📅 休赛期</div>'
      : `<div style="margin-left:auto" class="pill ${pwUnlocked ? 'tag-jade' : ''}">${pwUnlocked ? `本周 ${pw.bonusLeft} / ${PASS_BONUS_MAX} 次` : '未解锁'}</div>`;
    const weeklyCard = `<div class="card sanctum-card pw-card ${pwUnlocked ? '' : 'locked'}">
      <div class="card-h"><span>📅</span><div><div class="card-t">每周加成</div><div class="card-sub">WEEKLY BONUS · ${pw.week}</div></div>
        ${pwPill}
      </div>
      <div class="pw-refresh-row"><span class="pw-refresh" id="pwRefreshLabel">🕒 ${pwRefreshText()}</span></div>
      ${pwOffSeason ? `<div class="small dim sanctum-foot" style="line-height:1.9">
        ${pwSeason.phase === 'before'
          ? '通行证赛季尚未开启，每周加成暂时处于休赛期，无法获取通行证经验；赛季开启后将自动恢复。'
          : pwSeason.phase === 'dev'
            ? '开发者调试：已强制进入 <b>休赛期</b>，每周加成、通行证经验与周期挑战经验同步暂停发放（不影响真实赛季时间）；关闭调试后自动恢复。'
            : '当前赛季已结束，每周加成已进入 <b>休赛期</b>，期间无法通过深渊冒险获取通行证经验。<br>下一赛季开启后，本功能将自动恢复。'}
      </div>` : pwUnlocked ? `
      <div class="pw-label"><span>本周剩余可获取通行证经验</span><span style="color:#8fc4ff">${pw.xpLeft} / ${PASS_WEEK_XP}</span></div>
      <div class="pw-bar"><div class="pw-bar-fill" style="width:${xpPct}%"></div></div>
      <div class="pw-label" style="margin-top:14px"><span>本周可用加成次数</span><span style="color:var(--rose)">${pw.bonusLeft} / ${PASS_BONUS_MAX}</span></div>
      <div class="pw-segs">${segHtml}</div>
      <div class="small dim sanctum-foot" style="margin-top:auto;line-height:1.9">
        每周可获得 <b>${PASS_WEEK_XP}</b> 点通行证经验（${PASS_WEEK_XP / 10} 级）。<br>
        轮回难度 6-15 普通模式（5 层）每次通关 +<b>${PASS_XP_CLEAR}</b> 经验（1 级）。<br>
        深渊叠加通关可领取 <b>1</b> 次加成：+${PASS_XP_BONUS} 经验（4 级）。<br>
        深渊叠加 · 极限通关可一次性领取全部剩余加成（最多 ${PASS_BONUS_MAX} 次，共 ${PASS_BONUS_MAX * PASS_XP_BONUS} 经验 / ${PASS_BONUS_MAX * PASS_XP_BONUS / 10} 级）。<br>
        每周经验领取完毕后本周无法再获取，待下周一 04:00 刷新。
      </div>` : `<div class="small dim sanctum-foot" style="line-height:1.9">轮回难度达到 <b>6</b> 后解锁（当前 ${S.meta.ngPlus}/${MAX_NG}）。<br>普通模式（5 层）每次通关可领取 ${PASS_XP_CLEAR} 点通行证经验；深渊叠加 / 极限通关可领取每周加成次数。</div>`}
    </div>`;

    // 轮回难度下拉菜单：仅列出已解锁难度，选择后立即保存
    const ngSel = currentNgSelect();
    const ngMax = Math.min(S.meta.ngPlus || 0, MAX_NG);
    let ngMenuItems = '';
    for (let lv = 0; lv <= ngMax; lv++) {
      const info = ngInfo(lv);
      ngMenuItems += `<button class="ng-item ${lv === ngSel ? 'active' : ''}" onclick="setNgSelect(${lv})">
        <b>${info.name}</b>
        <span class="small dim">${info.effects.join('　·　')}</span>
      </button>`;
    }

    content = `
    <div class="sanctum-grid">
      <div class="card sanctum-card hero-card">
        <div class="hero-panel">
          <div class="hero-avatar">🧝</div>
          <div>
            <div style="font-family:var(--serif);font-size:19px;letter-spacing:2px">无名者</div>
            <div class="small muted" style="margin-top:4px">轮回难度 ${ngInfo(ngSel).name}（0-${MAX_NG}） · 最深 ${S.stats.maxDepth} 层</div>
            <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">
              <span class="pill tag-gold">✨ 魂尘 ${fmt(S.meta.soulDust)}</span>
              <span class="pill tag-jade">🏆 ${achCount()}/${ACHIEVEMENTS.length}</span>
              ${rulerTagHtml()}
            </div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="grid2" style="gap:8px;align-items:start">
          <div class="col" style="gap:8px;min-width:0">
            <button class="btn btn-primary btn-block btn-lg" ${S.pendingSettlement ? 'disabled' : ''} onclick="startNewRun()">踏入深渊</button>
            <div class="ng-set-wrap">
              <button class="btn btn-ghost btn-block btn-lg" onclick="toggleNgMenu(event)">轮回难度设置</button>
              <div class="ng-menu" id="ng-menu">${ngMenuItems}</div>
            </div>
          </div>
          ${S.pendingSettlement
            ? `<button class="btn btn-danger btn-block btn-lg" onclick="showSettlementModal(S.pendingSettlement)">有待领取内容</button>`
            : `<button class="btn btn-ghost btn-block btn-lg" ${S.runSave ? '' : 'disabled'} onclick="continueRun()">${S.runSave ? '继续未完成的冒险' : '无记录'}</button>`}
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
      ${stackCard}
      ${weeklyCard}
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-h"><span>⚒️</span><div><div class="card-t">魂尘强化</div><div class="card-sub">PERMANENT UPGRADES · 永久生效 · 逐层解锁</div></div>
        <div style="margin-left:auto" class="pill tag-gold">✨ ${fmt(S.meta.soulDust)} 可用</div>
      </div>
      ${upgHtml}
    </div>
    ${boonCard}`;
    startPwRefreshTimer();
  }

  if (hubTab === 'challenge') {
    const claimedCount = CHALLENGES.filter(c => challengeRewardClaimed(c.id)).length;
    const boonReady = allUpgradesMaxed();
    const season = passWeeklySeasonState();
    const seasonActive = season.active;
    const cards = CHALLENGES.map((c, idx) => {
      const claimed = challengeRewardClaimed(c.id);
      const active = !!(S.runSave && S.runSave.challengeId === c.id);
      const pending = !!(S.pendingSettlement && S.pendingSettlement.challengeId === c.id);
      const action = pending ? 'showSettlementModal(S.pendingSettlement)' : active ? 'continueRun()' : `startChallenge('${c.id}')`;
      const actionText = pending ? '查看挑战结算' : active ? '继续挑战' : claimed ? '再次挑战' : '开始挑战';
      const rewardPill = claimed
        ? '<span class="pill tag-jade">✓ 本期奖励已领取</span>'
        : seasonActive
          ? `<span class="pill tag-gold">🎫 +${c.reward} 经验</span>`
          : '<span class="pill">📅 休赛期 · 暂不发放经验</span>';
      const footText = claimed
        ? '可无限重复游玩，本期不再重复获得通行证经验'
        : seasonActive
          ? `首次通关并在结算时领取：通行证经验 +${c.reward}（${c.reward / 10} 级）`
          : '休赛期仍可正常挑战，但不发放通行证经验；新赛季开启后自动恢复';
      return `<div class="card challenge-card ${claimed ? 'claimed' : ''}">
        <div class="challenge-card-head">
          <div class="challenge-icon">${c.i}</div>
          <div style="min-width:0;flex:1">
            <div class="challenge-index">CHALLENGE ${String(idx + 1).padStart(2, '0')} · ${ngInfo(CHALLENGE_NG).name} · 10 层</div>
            <div class="card-t" style="margin-top:4px">${c.n}</div>
          </div>
          ${rewardPill}
        </div>
        <div class="challenge-short">${c.short}</div>
        <div class="challenge-desc">${c.desc}</div>
        <div class="challenge-note">${c.note}</div>
        <div class="challenge-card-foot">
          <div class="small ${claimed || !seasonActive ? 'dim' : ''}">${footText}</div>
          <button class="btn ${claimed ? 'btn-ghost' : 'btn-arcane'}" onclick="${action}">${actionText} →</button>
        </div>
      </div>`;
    }).join('');
    content = `<div class="card challenge-hero">
      <div class="card-h"><span>🏆</span><div><div class="card-t">周期挑战</div><div class="card-sub">PERIODIC CHALLENGES · ${CHALLENGE_CYCLE.name}</div></div>
        <div style="margin-left:auto" class="pill tag-rose">${claimedCount} / ${CHALLENGES.length} 奖励已领取</div>
      </div>
      <div class="challenge-cycle-row">
        <span class="pill tag-gold">🔄 ${ngInfo(CHALLENGE_NG).name} 基础</span>
        <span class="pill">⛏️ 固定 10 层</span>
        <span class="pill">📅 ${CHALLENGE_CYCLE.rotation}</span>
        <span class="pill ${seasonActive ? 'tag-jade' : 'tag-rose'}">${seasonActive ? '🎫 通行证经验发放中' : '📅 休赛期 · 不发放经验'}</span>
      </div>
      <div class="small dim" style="line-height:1.9;margin-top:12px">
        每项挑战首次通过并领取结算奖励时获得 <b style="color:#8fc4ff">10 点通行证经验（1 级）</b>，每项每周期仅可领取一次；领取后仍可无限重复游玩。后续周期轮换时，挑战内容与领取状态将一并更新。
        ${seasonActive ? '' : '<br><b style="color:#ff9aa8">通行证当前处于休赛期：挑战仍可正常游玩，但不会发放任何通行证经验；待新赛季开启后该限制自动解除并恢复发放。</b>'}
      </div>
      <div class="challenge-boon-tip ${boonReady ? 'ready' : ''}">
        ${boonReady
          ? '🌠 开局增益已解锁：可选至多 <b>1 个技能</b>与 <b>1 项属性增益</b>，也可不选并直接进入；挑战固定的属性不可选择。'
          : '🔒 全部魂尘强化满级后可在挑战开局前选择增益；未解锁时会直接进入挑战，不影响挑战参与。'}
      </div>
    </div>
    <div class="challenge-list">${cards}</div>`;
  }

  if (hubTab === 'ach') {
    // 侧边栏分类：统计各分类的解锁进度
    const catStats = ACH_CATS.map(c => {
      const items = c.id === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => achCatOf(a.id) === c.id);
      return { ...c, total: items.length, done: items.filter(a => S.ach[a.id]).length };
    });
    const visible = achCat === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => achCatOf(a.id) === achCat);
    const sideHtml = catStats.map(c => `<button class="ach-side-item ${achCat === c.id ? 'on' : ''}" onclick="setAchCat('${c.id}')">
        <span>${c.i}</span><span>${c.n}</span><span class="ach-side-num">${c.done}/${c.total}</span>
      </button>`).join('');
    const list = visible.map(a => {
      const done = !!S.ach[a.id];
      return `<div class="ach ${done ? 'done' : 'locked'}">
        <div class="ach-icon">${done ? a.i : '🔒'}</div>
        <div style="flex:1;min-width:0">
          <div class="ach-name">${a.n}</div>
          <div class="ach-desc">${a.d}</div>
          <div class="ach-reward">${done ? '✦ 已达成' : `奖励 ✨ ${a.r} 魂尘`}</div>
        </div>
        <span class="ach-state">${done ? '已达成' : '未达成'}</span>
      </div>`;
    }).join('');
    const pct = Math.round(achCount() / ACHIEVEMENTS.length * 100);
    const rulerDone = metaAchCount() > 0;
    const rulerOn = hasRulerBuff();
    const rb = META_ACHIEVEMENTS[0].buff;
    const metaCard = `<div class="ach ${rulerDone ? 'done' : 'locked'}" style="${rulerDone ? '' : 'opacity:.55'}">
      <div class="ach-icon" style="font-size:28px">${rulerDone ? '👑' : '🔒'}</div>
      <div style="flex:1;min-width:0">
        <div class="ach-name">${META_ACHIEVEMENTS[0].n} <span class="pill tag-gold" style="margin-left:6px">总成就</span></div>
        <div class="ach-desc">${META_ACHIEVEMENTS[0].d}</div>
        <div class="ach-reward" style="color:${rulerDone ? 'var(--jade)' : 'var(--gold)'}">
          全局 buff：攻击 +${Math.round(rb.atkPct * 100)}% · 防御 +${Math.round(rb.defPct * 100)}% · 暴击率 +${rb.critAdd}% · 回合末回血 ${rb.regen}
          ${rulerDone ? (rulerOn ? '　✦ 已激活' : '　✦ 已关闭') : `　（奖励 ✨ ${META_ACHIEVEMENTS[0].r} 魂尘）`}
        </div>
      </div>
      <div class="ach-switch-wrap">
        <button class="ach-switch ${rulerOn ? 'on' : ''}" ${rulerDone ? '' : 'disabled'} onclick="toggleRulerBuff()" aria-label="切换深渊统治者全局 buff">
          <span class="ach-switch-knob"></span>
        </button>
        <div class="ach-switch-desc">${rulerDone
          ? (rulerOn ? '激活：全局 buff 生效中' : '关闭：全局 buff 已停用')
          : '解锁全部成就后可切换'}</div>
      </div>
    </div>`;
    content = `<div class="card">
      <div class="card-h"><span>🏆</span><div><div class="card-t">成就殿堂</div><div class="card-sub">ACHIEVEMENTS · 解锁全部基础成就以加冕深渊统治者</div></div>
        <div style="margin-left:auto" class="pill tag-gold">${achCount()} / ${ACHIEVEMENTS.length} · ${pct}%</div></div>
      <div class="bar xp" style="margin-bottom:16px"><div class="bar-fill" style="width:${pct}%"></div></div>
      ${metaCard}
      <div class="divider" style="margin:16px 0"></div>
      <div class="ach-body">
        <div class="ach-side">${sideHtml}</div>
        <div class="ach-list">${list}</div>
      </div>
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
    const treatyCards = TREATIES.map(t => `<div class="cx s${t.s}" style="border-color:rgba(255,140,160,${0.16 + t.s * 0.05})">
      <div class="cx-top">
        <div class="cx-emoji" style="border-color:rgba(255,140,160,.5)">${t.i}</div>
        <div><div class="cx-n">${t.n}</div><div class="small dim">${t.s} 分</div></div>
      </div>
      <div class="cx-l">${t.d}</div>
    </div>`).join('');
    content = `<div class="card">
      <div class="card-h"><span>🩸</span><div><div class="card-t">深渊玩法</div><div class="card-sub">ABYSS MODES · 通关第 5 / 10 层时的进阶选择</div></div>
        <div style="margin-left:auto" class="pill ${(S.meta.ngPlus || 0) >= STACK_UNLOCK_NG ? 'tag-rose' : ''}">${(S.meta.ngPlus || 0) >= STACK_UNLOCK_NG ? '深渊叠加已解锁' : `轮回 ${STACK_UNLOCK_NG} 解锁`}</div></div>
      <div class="grid3" style="gap:10px">
        <div class="cx"><div class="cx-n">正常模式 · ${MAX_DEPTH} 层</div><div class="cx-l">通关第 ${MAX_DEPTH} 层后直接结算；轮回难度 ${STACK_UNLOCK_NG} 及以上可触发深渊叠加提示。</div></div>
        <div class="cx"><div class="cx-n">深渊叠加 · ${STACK_MAX_DEPTH} 层</div><div class="cx-l">第 ${MAX_DEPTH} 层后选择进入。敌人生命/攻击大幅提高，全新精英与首领登场，我方增益与事件馈赠同步放大，魂尘奖励提升。</div></div>
        <div class="cx"><div class="cx-n">深渊叠加 · 极限 · ${LIMIT_MAX_DEPTH} 层</div><div class="cx-l">第 ${STACK_MAX_DEPTH} 层后选择进入。敌人数值产生巨大变化，并启用「深渊条约」：第 11-14 层每层结束后可从六条条约中签署任意数量。</div></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-h"><span>📖</span><div><div class="card-t">深渊图鉴</div><div class="card-sub">BESTIARY · 点击已收录的敌人查看详情与数值计算器</div></div>
        <div style="margin-left:auto" class="pill tag-jade">${seenN} / ${Object.keys(all).length}</div></div>
      <div class="grid-auto">${list}</div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-h"><span>📜</span><div><div class="card-t">深渊条约图鉴</div><div class="card-sub">ABYSS TREATIES · 共 ${TREATIES.length} 条 · 总计 ${TREATY_TOTAL_SCORE} 分</div></div>
        <div style="margin-left:auto" class="pill tag-rose">仅在深渊叠加 · 极限生效</div></div>
      <div class="treaty-grid codex-treaties">${treatyCards}</div>
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
      ['深层通关', (st.extremeWins || 0) + ' 次'], ['单局最多条约', (st.maxTreatiesRun || 0) + ' 条'],
      ['单局条约最高分', (st.maxTreatyScore || 0) + ' 分'],
    ];
    const hist = Array.isArray(S.history) ? S.history : [];
    const histHtml = hist.length
      ? hist.map((r, i) => {
          const rMode = r.stackMode !== undefined ? r.stackMode : (r.extreme ? 2 : 0);
          const rChallengeLabel = r.challengeId ? `周期挑战 · ${r.challengeName || '未知挑战'}` : '';
          const res = r.win ? (r.extremeClear ? '极限通关' : r.challengeId ? '挑战通关' : '通关') : (r.abandoned ? '放弃' : '坠落');
          const cls = r.win ? 'tag-jade' : (r.abandoned ? '' : 'tag-rose');
          const ico = r.win ? '🌅' : (r.abandoned ? '🚪' : '💀');
          const icoStyle = r.win
            ? 'background:rgba(63,224,164,.12);border-color:rgba(63,224,164,.35)'
            : (r.abandoned ? '' : 'background:rgba(255,93,122,.12);border-color:rgba(255,93,122,.35)');
          return `<div class="upg" style="cursor:pointer" onclick="openRunRecord(${i})">
            <div class="upg-ico" style="${icoStyle}">${ico}</div>
            <div style="min-width:0;flex:1">
              <div class="upg-name">第 ${r.depth} 层 · ${ngInfo(r.ng || 0).name} · ${rChallengeLabel || (rMode === 2 ? '深渊叠加 · 极限' : rMode === 1 ? '深渊叠加' : '正常模式')}
                <span class="pill ${cls}" style="margin-left:6px">${res}</span></div>
              <div class="upg-desc">${fmtRunTime(r.ts)} · 击败 ${r.kills || 0} 个敌人 · 首领 ${r.bossKills || 0} 位 · 装备 ${(r.items || []).length} 件</div>
            </div>
            <div class="small dim">详情 ›</div>
          </div>`;
        }).join('')
      : '<div class="small dim" style="line-height:1.9;padding:6px 2px">还没有战绩记录。完成或结束一局冒险后，这里会保留最近 10 局的战绩。</div>';
    content = `<div class="card">
      <div class="card-h"><span>📊</span><div><div class="card-t">冒险记录</div><div class="card-sub">STATISTICS</div></div></div>
      <div class="grid2" style="gap:6px 18px">${rows.map(([k, v]) => `<div class="stat"><span class="stat-k">${k}</span><span class="stat-v">${v}</span></div>`).join('')}</div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-h"><span>📜</span><div><div class="card-t">战绩回顾</div><div class="card-sub">RUN HISTORY · 点击查看单局详情</div></div>
        <div style="margin-left:auto" class="pill tag-gold">最近 ${hist.length} / 10 局</div></div>
      <div class="col" style="gap:8px">${histHtml}</div>
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
            <button class="btn btn-ghost btn-block" onclick="openSaveSlots()">🗂️ 切换存档</button>
            <div class="small dim">当前存档位：${activeSlot === null ? '未关联（点击「切换存档」可保存到空闲存档位）' : '存档 ' + String(activeSlot + 1).padStart(2, '0')}</div>
            <div class="divider"></div>
            <button class="btn btn-danger btn-block" onclick="confirmReset()">⚠️ 重置游戏进度</button>
            <div class="small dim" style="line-height:1.9">
              重置操作不可撤销。魂尘、强化、图鉴与战绩记录会被清除；成就解锁状态与每周加成会被保留。游戏进度保存在浏览器本地（localStorage）。
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
      <div class="tabs">${tabs.map(([k, n, locked]) => `<button class="tab ${hubTab === k ? 'active' : ''}" ${locked ? 'disabled title="解锁深渊叠加后开放"' : ''} onclick="switchTab('${k}')">${n}</button>`).join('')}</div>
    </div>
    ${content}`;
}

function switchTab(k) {
  if (k === 'challenge' && !challengesUnlocked()) { toast('解锁深渊叠加后开放周期挑战', '🔒', 'warning'); return; }
  hubTab = k;
  sfx('click');
  renderHub();
}

/* ---------------- 战绩回顾 ---------------- */
function fmtRunTime(ts) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '时间未知';
  const p = n => ('0' + n).slice(-2);
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function openRunRecord(i) {
  const r = (S.history || [])[i];
  if (!r) return;
  sfx('click');
  const rarityColor = { common: '#9aa7b8', rare: '#4fa8ff', epic: '#b06bff', legend: '#ffb545' };
  const itemHtml = (r.items || []).length
    ? r.items.map(it => `<span class="pill" style="border-color:${rarityColor[it.r] || '#666'};color:${rarityColor[it.r] || '#ccc'}">${it.i || '🎁'} ${it.n}</span>`).join('')
    : '<span class="small dim">本局没有获得装备</span>';
  // 击败的敌人：按名称合并计数
  const enemyMap = {};
  (r.enemies || []).forEach(e => {
    const name = (e && e.n) ? e.n : String(e || '未知敌人');
    const o = enemyMap[name] || (enemyMap[name] = { n: name, i: (e && e.i) || '👹', boss: !!(e && e.boss), c: 0 });
    o.c++;
  });
  const enemies = Object.values(enemyMap).sort((a, b) => (b.boss - a.boss) || (b.c - a.c));
  const enemyHtml = enemies.length
    ? enemies.map(e => `<span class="pill" style="${e.boss ? 'border-color:rgba(176,107,255,.5);color:#cfaeff' : ''}">${e.boss ? '👑' : e.i} ${e.n}${e.c > 1 ? ' ×' + e.c : ''}</span>`).join('')
    : '<span class="small dim">本局没有击败敌人</span>';
  const skillHtml = (r.skills || []).length
    ? r.skills.map(id => {
        const sk = SKILLS[id];
        if (!sk) return '';
        return `<span class="pill" style="border-color:${RARITY[sk.rar].color};color:${RARITY[sk.rar].color}">${sk.i} ${sk.n}</span>`;
      }).join('')
    : '<span class="small dim">本局没有习得技能</span>';
  const rMode = r.stackMode !== undefined ? r.stackMode : (r.extreme ? 2 : 0);
  const rCap = r.challengeId ? STACK_MAX_DEPTH : (rMode === 2 ? LIMIT_MAX_DEPTH : rMode === 1 ? STACK_MAX_DEPTH : MAX_DEPTH);
  const rModeLabel = r.challengeId ? `周期挑战 · ${r.challengeName || '未知挑战'}` : (rMode === 2 ? '深渊叠加 · 极限' : rMode === 1 ? '深渊叠加' : '正常模式');
  const result = r.challengeId ? (r.win ? '挑战通关' : r.abandoned ? '主动放弃挑战' : '挑战失败') : (r.win ? (r.extremeClear ? '深渊叠加 · 极限通关' : '通关成功') : (r.abandoned ? '主动放弃' : '冒险失败'));
  const extremeText = rMode === 2 ? (r.extremeClear ? '已进入并完整通关' : '已进入 · 未通关') : rMode === 1 ? '已进入 · 未进入极限' : '未进入深渊叠加';
  const bodyHtml = `
    <div class="settle-grid">
      <div class="settle-left">
        <div class="center" style="margin-bottom:14px">
          <div style="font-size:46px;line-height:1">${r.win ? '🌅' : (r.abandoned ? '🚪' : '💀')}</div>
          <div style="font-family:var(--serif);font-size:17px;letter-spacing:2px;margin-top:8px;color:#ffd9a8">${result}</div>
          <div class="small dim" style="margin-top:5px">${fmtRunTime(r.ts)}</div>
        </div>
        <div class="col" style="gap:7px">
          <div class="stat"><span class="stat-k">难度</span><span class="stat-v">${ngInfo(r.ng || 0).name} · ${rModeLabel}</span></div>
          <div class="stat"><span class="stat-k">抵达层数</span><span class="stat-v">第 ${r.depth} 层 / ${rCap}</span></div>
          <div class="stat"><span class="stat-k">击败敌人</span><span class="stat-v">${r.kills || 0} 个</span></div>
          <div class="stat"><span class="stat-k">击杀首领</span><span class="stat-v">${r.bossKills || 0} 位</span></div>
          ${rMode === 2 ? `<div class="stat"><span class="stat-k">选取条约</span><span class="stat-v" style="color:#ff9aa8">${r.treatyCount || 0} 条 · ${r.treatyScore || 0} 分</span></div>` : ''}
          <div class="stat"><span class="stat-k">获得魂尘</span><span class="stat-v" style="color:var(--gold)">✨ +${fmt(r.dust || 0)}</span></div>
          <div class="stat"><span class="stat-k">深渊叠加</span><span class="stat-v" style="color:${r.extremeClear ? 'var(--jade)' : (rMode > 0 ? '#ff8b9a' : 'inherit')}">${extremeText}</span></div>
          <div class="stat"><span class="stat-k">药水使用</span><span class="stat-v">${r.usedPotion ? '使用过' : '未使用'}</span></div>
        </div>
      </div>
      <div class="settle-right">
        <div class="cx-sec" style="margin-top:0">获得的物品 · ${(r.items || []).length} 件</div>
        <div class="settle-items">${itemHtml}</div>
        <div class="cx-sec">击败的敌人 · ${Object.values(enemyMap).reduce((a, e) => a + e.c, 0)} 个</div>
        <div class="settle-items">${enemyHtml}</div>
        <div class="cx-sec">习得的技能 · ${(r.skills || []).length} 个</div>
        <div class="settle-items">${skillHtml}</div>
      </div>
    </div>`;
  modal({ title: '战绩详情', sub: 'RUN RECORD', body: bodyHtml, size: 'wide', buttons: [{ label: '关闭', cls: 'btn-primary' }] });
}

function buyUpgrade(id) {
  const up = UPGRADES.find(x => x.id === id);
  if (!up) return;
  if (!tierUnlocked(up.tier)) { toast('需先将上一层全部升至满级', '🔒', 'warning'); return; }
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
    title: '确认重置游戏进度？', sub: 'ACHIEVEMENTS & WEEKLY BONUS ARE KEPT',
    body: '魂尘、强化、图鉴与战绩记录都会被重置，但<b>成就解锁状态</b>与<b>每周加成</b>会被保留。',
    buttons: [
      { label: '再想想', cls: 'btn-ghost' },
      { label: '确认重置', cls: 'btn-danger', fn: () => {
          // 保留成就解锁状态与每周加成（每周剩余经验 / 可用加成次数）
          const keepAch = Object.assign({}, S.ach || {});
          const keepWeekly = S.meta && S.meta.passWeekly ? Object.assign({}, S.meta.passWeekly) : null;
          localStorage.removeItem(SAVE_KEY);
          S = defaultState();
          S.ach = keepAch;
          if (keepWeekly) S.meta.passWeekly = keepWeekly;
          R = null; B = null;
          if (activeSlot !== null) setActiveSlot(null);
          saveGame(); renderTitle(); showScreen('title');
          toast('游戏进度已重置（成就与每周加成已保留）', '🗑️');
        } },
    ]
  });
}

/* ---------------- 多存档位：切换 / 新建 / 覆盖 / 删除 ---------------- */
function slotNo(i) { return '存档 ' + String(i + 1).padStart(2, '0'); }
function saveSlotCardHtml(slot, i) {
  if (!slot) {
    return `<div class="save-slot empty" onclick="saveToEmptySlot(${i})">
      <div style="font-size:24px;line-height:1">＋</div>
      <div class="save-slot-name">${slotNo(i)}</div>
      <div class="small dim">空闲 · 点击保存当前进度</div>
    </div>`;
  }
  const d = slot.data || {};
  const dust = (d.meta && d.meta.soulDust) || 0;
  const depth = (d.stats && d.stats.maxDepth) || 0;
  const achN = Object.keys(d.ach || {}).filter(k => d.ach[k]).length;
  const active = activeSlot === i;
  return `<div class="save-slot ${active ? 'active' : ''}" onclick="loadSlot(${i})">
    <div class="row between" style="gap:6px">
      <div class="save-slot-name">${slotNo(i)}</div>
      ${active ? '<span class="pill tag-jade">当前</span>' : ''}
    </div>
    <div class="save-slot-meta">🕒 ${fmtRunTime(slot.ts)}<br>✨ 魂尘 ${fmt(dust)}<br>⛏️ 最深 ${depth} 层 · 🏆 ${achN} 成就</div>
    <div class="save-slot-actions">
      ${active ? '' : `<button class="btn btn-ghost" onclick="event.stopPropagation();loadSlot(${i})">载入</button>`}
      <button class="btn btn-ghost" onclick="event.stopPropagation();confirmOverwriteSlot(${i})">覆盖</button>
      <button class="btn btn-danger" onclick="event.stopPropagation();confirmDeleteSlot(${i})">删除</button>
    </div>
  </div>`;
}

function openSaveSlots() {
  if (!R) renderHub();
  const slots = loadSlots();
  const used = slots.filter(Boolean).length;
  const body = `
    <div class="row between" style="gap:10px;flex-wrap:wrap;margin-bottom:14px">
      <div class="small dim" style="line-height:1.9;max-width:760px">
        点击空闲存档位即可保存当前整个游戏进度；点击已保存的存档位可切换至该存档，再次点击当前存档位可覆盖它。<br>
        新建存档会以全新初始数据开始，<b style="color:var(--jade)">成就进度与每周加成进度受系统保护</b>，不会被重置或替换。
      </div>
      <button class="btn btn-arcane" onclick="createNewSave()">＋ 新建存档</button>
    </div>
    <div class="save-slot-grid">${slots.map((s, i) => saveSlotCardHtml(s, i)).join('')}</div>
    <div class="small dim" style="margin-top:14px;line-height:1.8">已使用 ${used} / ${SAVE_SLOT_COUNT} 个存档位 · 删除后的存档数据不可恢复。</div>`;
  modal({ title: '切换存档', sub: `SAVE SLOTS · 最多 ${SAVE_SLOT_COUNT} 个存档位`, body, buttons: [{ label: '关闭', cls: 'btn-ghost' }], size: 'wide settle-wide' });
}

function saveToEmptySlot(i) {
  if (R) saveRunState();
  setActiveSlot(i);
  const arr = loadSlots();
  arr[i] = snapshotState();
  persistSlots(arr);
  saveGame();
  sfx('buy');
  toast(`当前进度已保存到${slotNo(i)}`, '🗂️', 'success');
  openSaveSlots();
}

function confirmOverwriteSlot(i) {
  modal({
    title: '覆盖存档？', sub: 'OVERWRITE SAVE',
    body: `${slotNo(i)} 原有的进度将被<b style="color:#ff8b9a">当前游戏进度</b>覆盖，被覆盖的数据不可恢复。`,
    buttons: [
      { label: '取消', cls: 'btn-ghost', fn: () => openSaveSlots() },
      { label: '确认覆盖', cls: 'btn-danger', fn: () => {
          if (R) saveRunState();
          setActiveSlot(i);
          const arr = loadSlots();
          arr[i] = snapshotState();
          persistSlots(arr);
          saveGame();
          toast(`已覆盖${slotNo(i)}`, '🗂️', 'success');
          openSaveSlots();
        } },
    ],
  });
}

function loadSlot(i) {
  if (activeSlot === i) { confirmOverwriteSlot(i); return; }
  const slots = loadSlots();
  if (!slots[i]) { saveToEmptySlot(i); return; }
  modal({
    title: '切换到该存档？', sub: 'SWITCH SAVE',
    body: `将载入${slotNo(i)}。当前游戏进度会先保存到当前存档位（若已关联），随后切换。`,
    buttons: [
      { label: '取消', cls: 'btn-ghost', fn: () => openSaveSlots() },
      { label: '确认切换', cls: 'btn-primary', fn: () => doLoadSlot(i) },
    ],
  });
}

function doLoadSlot(i) {
  if (R) saveRunState();
  if (activeSlot !== null) syncActiveSlot();
  const slot = loadSlots()[i];
  if (!slot) { openSaveSlots(); return; }
  const next = normalizeState(JSON.parse(JSON.stringify(slot.data)));
  // 系统保护：成就与每周加成进度不随存档切换被替换
  next.ach = Object.assign({}, next.ach || {}, S.ach || {});
  if (S.meta && S.meta.passWeekly) next.meta.passWeekly = JSON.parse(JSON.stringify(S.meta.passWeekly));
  S = next;
  R = null; B = null;
  setActiveSlot(i);
  saveGame();
  applyMotion();
  $('#btn-sound').textContent = S.settings.sound ? '🔊' : '🔇';
  $('#btn-sound').classList.toggle('off', !S.settings.sound);
  closeModal();
  renderTitle();
  renderHub();
  renderTopbar();
  showScreen('hub');
  toast(`已切换到${slotNo(i)}`, '🗂️', 'success');
  if (S.pendingSettlement) showSettlementModal(S.pendingSettlement);
}

function confirmDeleteSlot(i) {
  const isActive = activeSlot === i;
  modal({
    title: '删除存档？', sub: 'DELETE SAVE',
    body: `${slotNo(i)} 将被永久删除，数据<b style="color:#ff8b9a">不可恢复</b>。${isActive ? '<br><br>该存档位正在使用中，删除后当前进度仍会保留，但不再关联任何存档位。' : ''}`,
    buttons: [
      { label: '取消', cls: 'btn-ghost', fn: () => openSaveSlots() },
      { label: '确认删除', cls: 'btn-danger', fn: () => {
          const arr = loadSlots();
          arr[i] = null;
          persistSlots(arr);
          if (isActive) { setActiveSlot(null); saveGame(); }
          toast(`${slotNo(i)} 已删除，数据不可恢复`, '🗑️');
          openSaveSlots();
        } },
    ],
  });
}

function createNewSave() {
  const slots = loadSlots();
  const i = slots.findIndex(s => !s);
  if (i < 0) { toast('存档位已满，请先删除一个存档', '🗂️', 'warning'); return; }
  if (R) saveRunState();
  if (activeSlot !== null) syncActiveSlot();
  // 成就与每周加成受系统保护，其余内容替换为新的初始数据
  const keepAch = Object.assign({}, S.ach || {});
  const keepWeekly = (S.meta && S.meta.passWeekly) ? JSON.parse(JSON.stringify(S.meta.passWeekly)) : null;
  const fresh = defaultState();
  fresh.ach = keepAch;
  if (keepWeekly) fresh.meta.passWeekly = keepWeekly;
  S = fresh;
  R = null; B = null;
  setActiveSlot(i);
  saveGame();
  // 新存档位尚未写入数据，这里显式落盘
  const arr2 = loadSlots();
  arr2[i] = snapshotState();
  persistSlots(arr2);
  applyMotion();
  $('#btn-sound').textContent = S.settings.sound ? '🔊' : '🔇';
  $('#btn-sound').classList.toggle('off', !S.settings.sound);
  closeModal();
  renderTitle();
  renderHub();
  renderTopbar();
  showScreen('hub');
  toast(`已新建${slotNo(i)}，当前内容已替换为初始数据`, '🗂️', 'success');
}

function toggleSound() {
  S.settings.sound = !S.settings.sound;
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
  const fixed = { boss1: 1, boss2: 3, boss3: 5, boss4: 7, xboss1: 9, xboss2: 10, xboss3: 13, xboss4: 15, xelite1: 6, xelite2: 9 };
  if (fixed[key]) return fixed[key];
  const idx = BIOMES.findIndex(b => b.enemies.indexOf(key) >= 0);
  if (idx === 4) return 11 + Math.max(0, BIOMES[4].enemies.indexOf(key));
  return (idx >= 0 ? idx : 0) * 2 + 1;
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
  const goldTxt = base.gold ? `${Math.round(base.gold[0] * GOLD_SCALE)} ~ ${Math.round(base.gold[1] * GOLD_SCALE)}` : '—';
  const intents = (base.intents || []).map(it => `<div class="intent-line">▸ ${codexIntentText(it, base.atk, effStats().def)}</div>`).join('');
  const ngOpts = [];
  for (let lv = 0; lv <= maxNg; lv++) ngOpts.push(`<option value="${lv}">${ngInfo(lv).name}</option>`);

  modal({
    title: `${base.i} ${base.n}`,
    sub: `${isBoss ? 'BOSS' : 'BESTIARY'} · ${base.tags && base.tags.indexOf('boss') >= 0 ? '深渊首领' : '深渊生物'} · 基准层数 第 ${depth} 层${isExtremeKey(key) ? ' · 深渊叠加 / 极限专属' : ''}`,
    size: 'wide codex-wide',
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
          <div class="cx-sec" style="margin-top:0">数值计算器</div>
          <div class="small dim" style="margin-bottom:8px;line-height:1.8">
            以「初临深渊（轮回 0）」为基准，可叠加轮回难度、全部苦难与全部条约，实时计算敌人的最终数值。
          </div>
          <div class="cx-cmp-row">
            <span class="small muted">轮回难度</span>
            <select class="cx-select" id="cx-ng">${ngOpts.join('')}</select>
          </div>
          <div class="row" style="gap:14px;flex-wrap:wrap;margin-bottom:12px">
            <label class="small" style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="checkbox" id="cx-hardship" style="accent-color:#ff8a3d"> 计入全部苦难
            </label>
            <label class="small" style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="checkbox" id="cx-treaty" style="accent-color:#ff5d7a"> 计入全部条约
            </label>
          </div>
          <div id="cx-cmp"></div>
        </div>
      </div>`,
    buttons: [{ label: '关闭', cls: 'btn-primary' }],
  });

  const sel = $('#cx-ng');
  const refresh = () => renderCodexCompare(key, sel ? (parseInt(sel.value, 10) || 0) : 0);
  if (sel) sel.onchange = refresh;
  ['#cx-hardship', '#cx-treaty'].forEach(s => { const el = $(s); if (el) el.onchange = refresh; });
  refresh();
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

function allTreatyMods() {
  const m = { enemyHp: 0, enemyAtk: 0, enemyDef: 0, playerAtk: 0, playerHp: 0, playerDef: 0, playerCrit: 0, playerCritDmg: 0, shopPrice: 0, goldGain: 0 };
  TREATIES.forEach(t => {
    if (!t.mods) return;
    for (const k in t.mods) m[k] = (m[k] || 0) + t.mods[k];
  });
  return m;
}

function allHardshipMods() {
  const m = { enemyHp: 0, enemyAtk: 0, enemyDef: 0 };
  HARDSHIPS.forEach(h => {
    if (!h.mods) return;
    for (const k in h.mods) m[k] = (m[k] || 0) + h.mods[k];
  });
  m.enemyHp = Math.min(0.8, m.enemyHp);
  m.enemyAtk = Math.min(0.8, m.enemyAtk);
  m.enemyDef = Math.min(0.8, m.enemyDef);
  return m;
}

function renderCodexCompare(key, ng) {
  const base = ENEMIES[key] || BOSSES[key];
  if (!base) return;
  const isBoss = !!base.boss;
  const depth = codexDepthOf(key);
  const useH = !!($('#cx-hardship') && $('#cx-hardship').checked);
  const useT = !!($('#cx-treaty') && $('#cx-treaty').checked);
  const hm = useH ? allHardshipMods() : { enemyHp: 0, enemyAtk: 0, enemyDef: 0 };
  const tm = useT ? allTreatyMods() : { enemyHp: 0, enemyAtk: 0, enemyDef: 0, playerAtk: 0, playerHp: 0, playerDef: 0, playerCrit: 0, playerCritDmg: 0, shopPrice: 0, goldGain: 0 };
  const em = {
    hp: (1 + hm.enemyHp) * (1 + tm.enemyHp),
    atk: (1 + hm.enemyAtk) * (1 + tm.enemyAtk),
    def: (1 + hm.enemyDef) * (1 + tm.enemyDef),
  };
  const a = enemyStatsAt(base, isBoss, 0, depth);
  const rawB = enemyStatsAt(base, isBoss, ng, depth);
  const b = { hp: Math.round(rawB.hp * em.hp), atk: rawB.atk * em.atk, def: Math.round(rawB.def * em.def) };
  const pdef0 = effStats().def;
  const pdef1 = Math.max(0, pdef0 * (1 + tm.playerDef));
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
  const hit0 = Math.max(1, Math.round(a.atk * (1 - mitigation(pdef0))));
  const hit1 = Math.max(1, Math.round(b.atk * (1 - mitigation(pdef1))));
  const goldMul0 = 1;
  const goldMul1 = (1 + ng * 0.08) * Math.max(0, 1 + tm.goldGain);
  const g0 = base.gold ? Math.round(base.gold[0] * GOLD_SCALE * goldMul0) + '~' + Math.round(base.gold[1] * GOLD_SCALE * goldMul0) : '—';
  const g1 = base.gold ? Math.round(base.gold[0] * GOLD_SCALE * goldMul1) + '~' + Math.round(base.gold[1] * GOLD_SCALE * goldMul1) : '—';
  const goldCls = goldMul1 > 1 ? 'up' : (goldMul1 < 1 ? 'down' : 'same');
  const pctOf = v => (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
  const extras = [];
  if (useH) extras.push(`☠ 全部苦难：生命 ${pctOf(hm.enemyHp)} · 攻击 ${pctOf(hm.enemyAtk)} · 防御 ${pctOf(hm.enemyDef)}（单项上限 +80%）`);
  if (useT) {
    extras.push(`📜 全部条约 ${TREATIES.length} 条：敌方生命 ${pctOf(tm.enemyHp)} · 攻击 ${pctOf(tm.enemyAtk)} · 防御 ${pctOf(tm.enemyDef)}`);
    const pl = [];
    if (tm.playerAtk) pl.push(`攻击 ${pctOf(tm.playerAtk)}（实战最多 -65%）`);
    if (tm.playerDef) pl.push(`防御 ${pctOf(tm.playerDef)}`);
    if (tm.playerHp) pl.push(`生命 ${pctOf(tm.playerHp)}`);
    if (tm.playerCrit) pl.push(`暴击率 ${tm.playerCrit > 0 ? '+' : ''}${Math.round(tm.playerCrit)}%`);
    if (tm.playerCritDmg) pl.push(`暴击伤害 ${tm.playerCritDmg > 0 ? '+' : ''}${Math.round(tm.playerCritDmg)}%`);
    if (tm.shopPrice) pl.push(`商店价格 ×${(1 + tm.shopPrice).toFixed(2)}`);
    if (tm.goldGain) pl.push(`金币 ${pctOf(Math.max(-1, tm.goldGain))}`);
    if (pl.length) extras.push(`我方修正：${pl.join('　·　')}`);
  }
  if (!useH && !useT) extras.push('勾选上方选项，可把全部苦难 / 全部条约叠加进计算结果。');
  const html = `
    <div class="cmp-head"><span class="cmp-k">属性</span><span class="cmp-v">基准 · 轮回 0</span><span class="cmp-arrow"></span><span class="cmp-v">${ngInfo(ng).name}${(useH || useT) ? ' + 修正' : ''}</span><span class="cmp-d"></span></div>
    <div class="cmp-body">
      ${row('❤ 生命', a.hp, b.hp, v => Math.round(v))}
      ${row('⚔ 攻击', a.atk, b.atk, v => Math.round(v))}
      ${row('🛡 防御', a.def, b.def, v => Math.round(v))}
      ${row('💥 普攻对玩家伤害', hit0, hit1, v => Math.round(v))}
      <div class="cmp-line">
        <span class="cmp-k">💰 金币</span>
        <span class="cmp-v">${g0}</span>
        <span class="cmp-arrow">→</span>
        <span class="cmp-v ${goldCls}">${g1}</span>
        <span class="cmp-d ${goldCls}">${goldMul1 === 1 ? '—' : pctOf(goldMul1 - 1)}</span>
      </div>
    </div>
    <div class="small dim" style="margin-top:10px;line-height:1.9">${extras.map(x => `<div>${x}</div>`).join('')}</div>`;
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
      body: '你还记得深渊的气味。开始新的冒险会失去当前未完成的进度并放弃本局魂尘奖励，但会全额退还开局增益消耗的魂尘。',
      buttons: [
        { label: '继续当前冒险', cls: 'btn-primary', fn: () => continueRun() },
        { label: '开始新冒险', cls: 'btn-danger', fn: () => { discardCurrentRun(); startRunWithSelectedNg(); } },
      ],
    });
    return;
  }
  startRunWithSelectedNg();
}

function startChallenge(id) {
  const ch = challengeById(id);
  if (!ch || !challengesUnlocked()) { toast('解锁深渊叠加后开放周期挑战', '🔒', 'warning'); return; }
  if (S.pendingSettlement) { showSettlementModal(S.pendingSettlement); return; }
  const launch = () => {
    if (allUpgradesMaxed()) openPreRunBuffs(CHALLENGE_NG, id);
    else beginRun(CHALLENGE_NG, null, id);
  };
  if (S.runSave) {
    modal({
      title: '放弃当前冒险并进入挑战？', sub: ch.n + ' · PERIODIC CHALLENGE',
      body: `当前未完成的冒险进度将会丢失，并放弃其魂尘奖励；开局增益消耗的魂尘会全额退还。随后将以${ngInfo(CHALLENGE_NG).name}开始「${ch.n}」。`,
      buttons: [
        { label: '继续当前冒险', cls: 'btn-primary', fn: () => continueRun() },
        { label: '放弃并开始挑战', cls: 'btn-danger', fn: () => { discardCurrentRun(); launch(); } },
      ],
    });
    return;
  }
  launch();
}

// 直接使用已保存的轮回难度开局（不再弹出难度选择弹窗）
function startRunWithSelectedNg() {
  const lv = currentNgSelect();
  if (allUpgradesMaxed()) openPreRunBuffs(lv);
  else beginRun(lv);
}

/* ---------------- 开局增益弹窗 ---------------- */
let preRunSel = null;
const BOON_RAR_TEXT = { common: '普通', rare: '精良', epic: '史诗', legend: '传说' };

function openPreRunBuffs(difficulty, challengeId) {
  preRunSel = { difficulty: difficulty, challengeId: challengeId || null, skills: [], buffs: { hp: 0, atk: 0, def: 0, crit: 0 } };
  renderPreRunModal();
}

function preRunChallenge(sel) {
  return sel && sel.challengeId ? challengeById(sel.challengeId) : null;
}
function preRunBoonRestricted(sel, id) {
  const ch = preRunChallenge(sel);
  return !!(ch && (ch.restrictedBoons || []).includes(id));
}

function toggleBoonSkill(id) {
  const sel = preRunSel;
  if (!sel) return;
  const i = sel.skills.indexOf(id);
  if (i >= 0) sel.skills.splice(i, 1);
  else {
    const max = preRunChallenge(sel) ? 1 : BOON_SKILL_MAX;
    if (sel.skills.length >= max) { toast(`最多选择 ${max} 个技能`, '⚠️', 'warning'); return; }
    sel.skills.push(id);
  }
  renderPreRunModal(true);
}

function toggleBoonBuff(id) {
  const sel = preRunSel;
  if (!sel) return;
  if (preRunBoonRestricted(sel, id)) { toast('本挑战已固定该属性，对应开局增益不可选择', '🔒', 'warning'); return; }
  const cur = sel.buffs[id] || 0;
  const max = preRunChallenge(sel) ? 1 : BOON_BUFF_MAX;
  if (cur === 0 && boonBuffCount(sel) >= max) {
    toast(`最多选择 ${max} 项属性增益`, '⚠️', 'warning');
    return;
  }
  sel.buffs[id] = cur > 0 ? 0 : 1;
  renderPreRunModal(true);
}

function setBoonBuffTier(id, tier) {
  const sel = preRunSel;
  if (!sel) return;
  if (preRunBoonRestricted(sel, id)) { toast('本挑战已固定该属性，对应开局增益不可选择', '🔒', 'warning'); return; }
  const cur = sel.buffs[id] || 0;
  const max = preRunChallenge(sel) ? 1 : BOON_BUFF_MAX;
  if (cur === 0 && boonBuffCount(sel) >= max) {
    toast(`最多选择 ${max} 项属性增益`, '⚠️', 'warning');
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
  const ch = preRunChallenge(sel);
  const skillMax = ch ? 1 : BOON_SKILL_MAX;
  const buffMax = ch ? 1 : BOON_BUFF_MAX;

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
    const restricted = preRunBoonRestricted(sel, b.id);
    const val = on ? b.vals[t - 1] : b.vals[0];
    return `<div class="boon-buff ${on ? 'sel' : ''} ${restricted ? 'locked' : ''}">
      <div class="boon-buff-main" ${restricted ? '' : `onclick="toggleBoonBuff('${b.id}')"`}>
        <div class="boon-buff-name">${b.i} ${b.n}${restricted ? '　🔒' : ''}</div>
        <div class="small dim" style="margin-top:2px">${restricted ? '本挑战固定该属性，不可选择对应增益' : `${b.key} +${val}${b.unit}${on ? `　<span style="color:var(--jade)">${t === 1 ? '基础' : (t === 2 ? '突破 +' : '突破 ++')}</span>` : '　（未选择）'}`}</div>
      </div>
      <div class="boon-buff-foot">
        <div class="boon-btns">
          <button class="boon-plus ${t === 2 ? 'on' : ''}" title="突破：${b.key} +${b.vals[1]}${b.unit}" ${restricted ? 'disabled' : ''} onclick="setBoonBuffTier('${b.id}',2)">+</button>
          <button class="boon-plus ${t === 3 ? 'on' : ''}" title="突破：${b.key} +${b.vals[2]}${b.unit}" ${restricted ? 'disabled' : ''} onclick="setBoonBuffTier('${b.id}',3)">++</button>
        </div>
        <span class="cost">${on ? '✨ ' + fmt(b.costs[t - 1]) : '—'}</span>
      </div>
    </div>`;
  }).join('');

  return `
    ${ch ? `<div class="challenge-boon-tip ready" style="margin-bottom:12px">🏆 <b>${ch.n}</b> · ${ch.short}<br>挑战开局至多选择 1 个技能与 1 项属性增益；被挑战固定的属性已锁定，也可不选任何增益直接开始。</div>` : ''}
    <div class="small dim" style="margin-bottom:12px;line-height:1.9">
      本局难度：<b style="color:var(--gold)">${ngInfo(sel.difficulty).name}</b>　可用魂尘：<b style="color:var(--gold)">✨ ${fmt(dust)}</b><br>
      最多选择 <b>${skillMax}</b> 个技能（${skillCnt}/${skillMax}）与 <b>${buffMax}</b> 项属性增益（${buffCnt}/${buffMax}）。
      属性增益可点击「+ / ++」进行突破，消耗魂尘将大幅提升；两者互斥，只可点击其中一个。
    </div>
    <div class="card-t" style="font-size:14px;margin-bottom:8px">技能 · ${skillCnt}/${skillMax}</div>
    <div class="boon-skills">${skillCards}</div>
    <div class="card-t" style="font-size:14px;margin:16px 0 8px">属性增益 · ${buffCnt}/${buffMax}</div>
    <div class="boon-buffs">${buffRows}</div>
    <div class="row between" style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line)">
      <span class="small muted">本局开局增益消耗（放弃领取时全额退还）</span>
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
    size: 'wide settle-wide',
    title: '开局增益', sub: 'PRE-RUN BOONS · 以魂尘换取这一次的开局优势',
    body: preRunBodyHtml(sel),
    buttons: [
      { label: '取消', cls: 'btn-ghost' },
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
  const challengeId = sel.challengeId || null;
  preRunSel = null;
  closeModal();
  beginRun(difficulty, boon, challengeId);
}

/* ---------------- 开局加载动画 ---------------- */
let runLoadingBusy = false;
const RUN_LOADING_TIPS = [
  '深渊正在调整它的呼吸……',
  '你的名字正在被写在潮湿的石壁上。',
  '魂尘在空中缓慢聚拢，像一场不肯落下的雨。',
  '有人在很深的地方，替你翻开了下一页。',
  '这里的回响，总是比脚步早一步抵达。',
  '火把点燃之前，黑暗先学会了你走路的样子。',
  '小心：深渊记得每一个曾经转身离开的人。',
  '契约尚未落笔，墨迹已经在颤抖。',
  '你的心跳被石壁复制了一份，作为备份。',
  '若听见有人叫你的名字，请先确认它还属于你。',
];

// 生成可无缝循环的波浪路径（每 720 单位一个周期，多留一个周期避免右侧断裂）
function runLoadingWavePath(base, amp, phase, period) {
  const W = 2880, step = period / 48;
  let d = '';
  for (let x = 0; x <= W; x += step) {
    const y = base + amp * Math.sin((x / period) * Math.PI * 2 + phase);
    d += (x === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  return d;
}

function beginRun(difficulty, boon, challengeId) {
  const ch = challengeById(challengeId);
  showRunLoading(() => beginRunNow(difficulty, boon, challengeId), { title: ch ? '正在进入周期挑战' : '正在渗入深渊', duration: 3200 });
}

function showRunLoading(done, opts) {
  if (runLoadingBusy) return;
  opts = opts || {};
  const title = opts.title || '正在渗入深渊';
  const duration = opts.duration || 3200;
  runLoadingBusy = true;
  const waves = [
    { b: 70,  a: 30, p: 0.0, dur: 9.5, c: ['#4fd7ff', '#8b7cff'] },
    { b: 102, a: 22, p: 1.1, dur: 12,  c: ['#8b7cff', '#ff5d7a'] },
    { b: 134, a: 34, p: 2.2, dur: 7.5, c: ['#3fe0a4', '#4fd7ff'] },
    { b: 166, a: 18, p: 3.3, dur: 14,  c: ['#ffcb5c', '#ff8a3d'] },
    { b: 198, a: 26, p: 4.4, dur: 10,  c: ['#ff5d7a', '#b06bff'] },
  ];
  const defs = waves.map((w, i) => `<linearGradient id="rlG${i}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${w.c[0]}"/>
      <stop offset="50%" stop-color="${w.c[1]}"/>
      <stop offset="100%" stop-color="${w.c[0]}"/>
    </linearGradient>`).join('');
  const paths = waves.map((w, i) => `<path class="rl-wave" d="${runLoadingWavePath(w.b, w.a, w.p, 720)}"
      vector-effect="non-scaling-stroke"
      stroke="url(#rlG${i})" style="animation-duration:${w.dur}s;animation-direction:${i % 2 ? 'reverse' : 'normal'}"/>`).join('');

  const el = document.createElement('div');
  el.id = 'runLoading';
  el.className = 'run-loading';
  el.innerHTML = `
    <div class="rl-waves">
      <svg viewBox="0 0 2160 240" preserveAspectRatio="none" aria-hidden="true">
        <defs>${defs}</defs>
        ${paths}
      </svg>
    </div>
    <div class="rl-center">
      <div class="rl-title">${title}</div>
      <div class="rl-bar"><i class="rl-fill"></i></div>
      <div class="rl-meta"><span class="rl-tip"></span><span class="rl-pct">0%</span></div>
    </div>`;
  document.body.appendChild(el);
  document.body.style.overflow = 'hidden';

  const tipEl = el.querySelector('.rl-tip');
  const setTip = () => {
    tipEl.classList.remove('swap');
    void tipEl.offsetWidth;
    tipEl.textContent = pick(RUN_LOADING_TIPS);
    tipEl.classList.add('swap');
  };
  setTip();
  const tipTimer = setInterval(setTip, 1050);

  const fill = el.querySelector('.rl-fill');
  const pctEl = el.querySelector('.rl-pct');
  const DUR = duration - 200;
  requestAnimationFrame(() => {
    fill.style.transition = `width ${DUR}ms cubic-bezier(.25,.8,.35,1)`;
    fill.style.width = '100%';
  });
  const t0 = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - t0) / DUR);
    pctEl.textContent = Math.round(p * 100) + '%';
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  setTimeout(() => {
    clearInterval(tipTimer);
    el.classList.add('out');
    setTimeout(() => {
      el.remove();
      document.body.style.overflow = '';
      runLoadingBusy = false;
      done();
    }, 420);
  }, duration);
}

function beginRunNow(difficulty, boon, challengeId) {
  const ch = challengeById(challengeId);
  const ng = ch ? CHALLENGE_NG : (difficulty !== undefined ? Math.max(0, Math.min(MAX_NG, difficulty | 0)) : currentNgSelect());
  const u = S.meta.upgrades;
  R = {
    depth: 1, gold: 70 + ng * 20, hp: 0, potions: 2 + (u.potion || 0),
    potionCap: 3 + (u.potion || 0),
    bonusHp: 0, bonusAtk: 0, bonusDef: 0, bonusCrit: 0,
    skills: [], equip: { weapon: [], armor: [], trinket: [] },
    revived: false, usedPotion: false, bossKills: 0, ng: ng, ngAtStart: ng,
    challengeId: ch ? ch.id : null,
    map: null, mapFor: -1, node: null, active: null, done: [],
    shop: null, shopFor: -1, shopReroll: 0, hardships: [], gift: null, giftNext: null,
    skipFloor: false, cursed: false, stackMode: 0,
    stackEnabled: ch ? false : S.meta.stackEnabled !== false,
    treatyIds: [], treatySeen: [], treatyOptions: [], treatySel: [],
    kills: 0, itemsLog: [], bossLog: [], enemyLog: [],
    maxItems: 0, maxAtk: 0, maxDef: 0, maxCritDmg: 0, maxHp: 0, maxGold: 0,
    dev: S.meta.dev ? Object.assign({}, S.meta.dev) : undefined,
  };
  const pool = shuffle(STARTER_SKILLS.slice());
  R.skills = [pool[0]];
  for (let i = 0; i < (u.memory || 0); i++) {
    const avail = SKILL_POOL.filter(s => !R.skills.includes(s));
    if (avail.length) R.skills.push(pick(avail));
  }
  // 开局增益：扣魂尘、发放技能与属性增益（放弃领取时全额退还）
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
  runView = 'map';
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
  showRunLoading(() => continueRunNow(), { title: '正在渗入深渊', duration: 3400 });
}

function continueRunNow() {
  R = JSON.parse(JSON.stringify(S.runSave));
  if (!R.skills) R.skills = ['fireSlash'];
  if (!R.equip) R.equip = { weapon: [], armor: [], trinket: [] };
  // 兼容旧存档：单物品格式转为数组
  for (const slot of ['weapon', 'armor', 'trinket']) {
    if (!Array.isArray(R.equip[slot])) R.equip[slot] = R.equip[slot] ? [R.equip[slot]] : [];
  }
  if (!R.itemsLog) R.itemsLog = [];
  if (!R.bossLog) R.bossLog = [];
  if (!R.enemyLog) R.enemyLog = [];
  if (R.kills === undefined) R.kills = 0;
  if (R.stackMode === undefined) R.stackMode = R.extreme ? 2 : 0;
  if (R.stackEnabled === undefined) R.stackEnabled = true;
  if (!Array.isArray(R.treatyIds)) R.treatyIds = [];
  if (!Array.isArray(R.treatySeen)) R.treatySeen = [];
  if (!Array.isArray(R.treatyOptions)) R.treatyOptions = [];
  if (!Array.isArray(R.treatySel)) R.treatySel = [];
  if (!Array.isArray(R.hardships)) R.hardships = [];
  if (R.shopReroll === undefined) R.shopReroll = 0;
  if (R.giftNext === undefined) R.giftNext = null;
  if (R.ng === undefined) R.ng = R.ngAtStart !== undefined ? R.ngAtStart : currentNgSelect();
  R.ngAtStart = R.ng;
  if (R.maxItems === undefined) R.maxItems = 0;
  if (R.maxAtk === undefined) R.maxAtk = 0;
  if (R.maxDef === undefined) R.maxDef = 0;
  if (R.maxCritDmg === undefined) R.maxCritDmg = 0;
  if (R.maxHp === undefined) R.maxHp = 0;
  if (R.maxGold === undefined) R.maxGold = R.gold || 0;
  if (!Array.isArray(R.done)) R.done = [];
  if (!R.map || R.mapFor !== R.depth) { R.map = null; R.mapFor = -1; R.node = null; R.done = []; }
  R.active = null;
  // 保留本层商店数据：返回圣所再继续时不应刷新商品
  if (!R.shop) R.shopFor = -1;
  runView = R.gift ? 'gift' : ((modeOf(R) === 2 && R.treatyOptions.length && R.depth >= 12 && R.depth <= 15) ? 'treaty' : 'map');
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

/* ---------------- 深渊路线地图 ---------------- */
const MAP_COL_W = 132;
const MAP_ROW_H = 136;
const MAP_NODE = 82;

const ROOM_META = {
  start:  { n: '入口', i: '🚪', d: '本层的起点', cls: 'start' },
  battle: { n: '战斗', i: '⚔️', d: '与深渊的住民交锋，赢取金币与战利品', cls: '' },
  elite:  { n: '精英', i: '🔱', d: '强大的敌人，更丰厚的奖励', cls: 'elite' },
  event:  { n: '奇遇', i: '❓', d: '未知的命运在等待着你', cls: '' },
  shop:   { n: '深渊商店', i: '🛒', d: '用金币换取补给、装备与技能', cls: 'shop' },
  boss:   { n: '首领', i: '👑', d: '这一层的守卫者，击败它才能继续深入', cls: 'boss' },
};

function genMap(depth) {
  const rows = 3;
  const spineRow = Math.floor(rows / 2);
  // 主路线 4-5 列：所有行从第 1 列到最后 1 列全部填满，不再出现空缺
  const middleCols = rnd(4, 5);

  const nodes = [];
  let uid = 0;
  function mkNode(c, r, type) {
    const n = { id: 'm' + (uid++), c: c, r: r, type: type, links: [] };
    nodes.push(n);
    return n;
  }
  function connect(a, b) {
    if (!a || !b || a === b) return;
    if (a.links.indexOf(b.id) < 0) a.links.push(b.id);
    if (b.links.indexOf(a.id) < 0) b.links.push(a.id);
  }
  function rollType() {
    const x = Math.random();
    if (x < 0.2) return 'elite';
    if (x < 0.44) return 'event';
    return 'battle';
  }

  // 固定位：入口、深渊商店、首领始终在同一水平线上
  const start = mkNode(0, spineRow, 'start');
  const shop = mkNode(middleCols + 1, spineRow, 'shop');
  const boss = mkNode(middleCols + 2, spineRow, 'boss');

  // 三行道路全部填满：每一行在第 1 列到第 N 列都有节点
  for (let c = 1; c <= middleCols; c++) {
    for (let r = 0; r < rows; r++) mkNode(c, r, rollType());
  }

  const grid = {};
  nodes.forEach(n => { grid[n.c + ',' + n.r] = n; });
  const at = (c, r) => grid[c + ',' + r] || null;

  // 同一行内按列顺序连接，避免出现同列上下移动
  for (let r = 0; r < rows; r++) {
    const list = nodes.filter(n => n.r === r).sort((a, b) => a.c - b.c);
    for (let i = 0; i < list.length - 1; i++) connect(list[i], list[i + 1]);
  }
  // 入口连接第一列的上/下节点（中行由入口自身延伸）
  [0, 2].forEach(r => { if (at(1, r)) connect(start, at(1, r)); });

  // 换行：只随机开放 1-2 个岔口，且每个岔口只连通「中行 <-> 上行/下行」
  const gapCandidates = [];
  for (let g = 1; g < middleCols; g++) {
    [0, 2].forEach(side => {
      const linkA = at(g, spineRow) && at(g + 1, side);
      const linkB = at(g, side) && at(g + 1, spineRow);
      if (linkA || linkB) gapCandidates.push({ g: g, side: side });
    });
  }
  const usedGaps = {};
  const laneGapLimit = rnd(1, 2);
  shuffle(gapCandidates).forEach(cand => {
    if (Object.keys(usedGaps).length >= laneGapLimit) return;
    if (usedGaps[cand.g]) return;
    usedGaps[cand.g] = 1;
    const a1 = at(cand.g, spineRow), b1 = at(cand.g + 1, cand.side);
    const a2 = at(cand.g, cand.side), b2 = at(cand.g + 1, spineRow);
    if (a1 && b1) connect(a1, b1);
    if (a2 && b2) connect(a2, b2);
  });

  // 末列各行汇入商店：每一行的最后一个节点都能直达商店（上下行在终点回到中线）
  for (let r = 0; r < rows; r++) {
    const list = nodes.filter(n => n.r === r).sort((a, b) => a.c - b.c);
    if (list.length) connect(list[list.length - 1], shop);
  }
  connect(shop, boss);

  return {
    key: 'map_' + Date.now() + '_' + Math.floor(Math.random() * 1e6),
    rows: rows, cols: middleCols + 3, middleCols: middleCols,
    nodes: nodes, start: start.id, shop: shop.id, boss: boss.id,
    w: (middleCols + 3) * MAP_COL_W, h: rows * MAP_ROW_H,
  };
}

function nodeById(id) {
  if (!R || !R.map) return null;
  return R.map.nodes.find(n => n.id === id) || null;
}

function linkNodes(a, b) {
  if (!a || !b || a === b) return;
  if (a.links.indexOf(b.id) < 0) a.links.push(b.id);
  if (b.links.indexOf(a.id) < 0) b.links.push(a.id);
}

// 兜底修复：极少数旧存档可能停在“四周都不可走”的节点，强行接通最近的后续节点
function repairMapProgress() {
  if (!R || !R.map || R.active) return;
  const cur = nodeById(R.node);
  if (!cur || cur.type === 'boss') return;
  const moves = R.map.nodes.filter(n => R.done.indexOf(n.id) < 0 && n.c >= cur.c && cur.links.indexOf(n.id) >= 0);
  if (moves.length) return;
  const future = R.map.nodes.filter(n => R.done.indexOf(n.id) < 0 && n.c > cur.c);
  if (!future.length) return;
  const minC = Math.min.apply(null, future.map(n => n.c));
  linkNodes(cur, pick(future.filter(n => n.c === minC)));
}

function ensureMap() {
  if (!R) return;
  if (!R.map || R.mapFor !== R.depth) {
    R.map = genMap(R.depth);
    R.mapFor = R.depth;
    R.node = R.map.start;
    R.done = [R.map.start];
    R.active = null;
    R.shopFor = -1;
  }
  if (!Array.isArray(R.done)) R.done = [R.map.start];
  if (R.done.indexOf(R.map.start) < 0) R.done.unshift(R.map.start);
  if (!R.node || !nodeById(R.node)) R.node = R.map.start;
  repairMapProgress();
}

function canEnterNode(n) {
  if (!n || !R || R.active) return false;
  if (R.done.indexOf(n.id) >= 0) return false;
  const cur = nodeById(R.node);
  if (!cur || cur.links.indexOf(n.id) < 0) return false;
  // 只允许同列纵向移动或继续向右，禁止回到已经走过的列，避免回头后前方节点已清理而卡死
  return n.c >= cur.c;
}

function playerPanelHtml() {
  const s = effStats();
  const hpPct = clamp(R.hp / s.maxHp * 100, 0, 100);
  const eq = ['weapon', 'armor', 'trinket'].map(k => {
    const arr = R.equip[k] || [];
    const best = arr.length ? arr.reduce((a, b) => (a.score > b.score ? a : b)) : null;
    return `<div class="stat" style="padding:6px 9px">
      <span class="stat-k">${SLOT_ICON[k]} ${SLOT_NAME[k]}</span>
      <span class="small" style="color:${best ? RARITY[best.rarity].color : 'var(--dim)'};max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${best ? best.name + (arr.length > 1 ? ` ×${arr.length}` : '') : '空'}</span>
    </div>`;
  }).join('');
  const totalEquip = (R.equip.weapon.length || 0) + (R.equip.armor.length || 0) + (R.equip.trinket.length || 0);
  const sk = R.skills.map(id => `<span class="pill" style="border-color:rgba(150,130,255,.4);color:#c9bcff">${SKILLS[id].i} ${SKILLS[id].n}</span>`).join('');
  const treatyPill = (R.treatyIds && R.treatyIds.length)
    ? `<span class="pill tag-rose" title="点击查看已签署的条约" style="cursor:pointer" onclick="showTreatyTags()">📜 条约 ${R.treatyIds.length} 条 · ${treatyScore()} 分</span>` : '';
  const hardshipPill = (R.hardships && R.hardships.length)
    ? `<span class="pill tag-rose" title="点击查看已背负的苦难" style="cursor:pointer" onclick="showHardshipTags()">☠ 苦难 ${R.hardships.length}</span>` : '';
  const uneasePill = R.unease
    ? `<span class="pill" title="${R.unease.n}" style="border-color:rgba(170,110,255,.45);color:#d6a7ff">😖 心神不宁</span>` : '';
  return `<div class="card hero-strip">
    <div class="hs-col hs-id">
      <div class="row between" style="margin-bottom:9px">
        <div><div class="card-t" style="font-size:16px">无名者</div><div class="card-sub">第 ${R.depth} 层 · ${modeName(R)}</div></div>
        <div class="pill tag-gold">💰 ${fmt(R.gold)}</div>
      </div>
      <div class="bar hp"><div class="bar-fill" style="width:${hpPct}%"></div></div>
      <div class="row between small" style="margin-top:6px">
        <span class="muted">❤ ${Math.round(R.hp)} / ${s.maxHp}</span>
        <span class="muted">🧪 ${R.potions} / ${R.potionCap}</span>
      </div>
      ${(treatyPill || hardshipPill || uneasePill) ? `<div class="row" style="margin-top:9px;flex-wrap:wrap;gap:6px">${treatyPill}${hardshipPill}${uneasePill}</div>` : ''}
    </div>
    <div class="hs-col hs-stat">
      <div class="pstat-grid" style="margin-top:0">
        <div class="pstat"><b>${Math.round(s.atk)}</b><span>攻击</span></div>
        <div class="pstat"><b>${Math.round(s.def)}</b><span>防御</span></div>
        <div class="pstat"><b>${Math.round(s.crit)}%</b><span>暴击</span></div>
        <div class="pstat"><b>${Math.round(s.critDmg)}%</b><span>暴伤</span></div>
      </div>
      <div class="col" style="gap:6px;margin-top:9px">${eq}</div>
    </div>
    <div class="hs-col hs-skill">
      <div class="card-sub" style="margin-bottom:7px">已掌握技能</div>
      <div class="row" style="flex-wrap:wrap;gap:6px;max-height:72px;overflow:auto">${sk || '<span class="dim small">无</span>'}</div>
      <button class="btn btn-ghost btn-block btn-sm" style="margin-top:10px" onclick="showBackpack()">🎒 背包（${totalEquip} 件装备 · ${R.potions} 药水）</button>
    </div>
  </div>`;
}

function mapHtml() {
  const map = R.map;
  const doneSet = {};
  (R.done || []).forEach(id => { doneSet[id] = 1; });
  const curId = R.node;
  const xOf = n => n.c * MAP_COL_W + MAP_COL_W / 2;
  const yOf = n => n.r * MAP_ROW_H + MAP_ROW_H / 2;

  const seen = {};
  let edges = '';
  map.nodes.forEach(a => {
    a.links.forEach(id => {
      const b = nodeById(id);
      if (!b) return;
      const key = a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id;
      if (seen[key]) return;
      seen[key] = 1;
      const live = (a.id === curId && canEnterNode(b)) || (b.id === curId && canEnterNode(a));
      const cls = (doneSet[a.id] && doneSet[b.id]) ? 'done' : (live ? 'live' : '');
      edges += `<line x1="${xOf(a)}" y1="${yOf(a)}" x2="${xOf(b)}" y2="${yOf(b)}" class="ml ${cls}"/>`;
    });
  });

  let nodeHtml = '';
  map.nodes.forEach(n => {
    const m = ROOM_META[n.type] || ROOM_META.battle;
    const done = !!doneSet[n.id];
    const cur = n.id === curId;
    const avail = canEnterNode(n);
    const cls = ['mn', 'mn-' + n.type];
    if (done) cls.push('done');
    if (cur) cls.push('cur');
    if (avail) cls.push('avail');
    if (!done && !cur && !avail) cls.push('locked');
    nodeHtml += `<div class="${cls.join(' ')}" style="left:${xOf(n)}px;top:${yOf(n)}px;--mn:${MAP_NODE}px"
      title="${m.n} · ${m.d}" ${avail ? `onclick="enterNode('${n.id}')"` : ''}>
      <span class="mn-ico">${m.i}</span>
      <span class="mn-name">${m.n}</span>
      ${cur ? '<span class="mn-here">你</span>' : ''}
      ${done && !cur ? '<span class="mn-check">✓</span>' : ''}
    </div>`;
  });

  const total = map.nodes.length;
  const cleared = (R.done || []).length;
  const hint = R.active ? '正在探索当前节点……'
    : (R.node === map.shop ? '离开商店后即可挑战本层首领。'
      : '只能沿路线向右前进，部分岔口可上下换行，无法回头。');
  return `<div class="card map-card">
    <div class="card-h">
      <span>🧭</span>
      <div><div class="card-t">深渊路线 · 第 ${R.depth} 层</div><div class="card-sub">${modeName(R)} · 点击相邻节点前进 · 本层会经历多场战斗与奇遇</div></div>
      <div style="margin-left:auto" class="row" style="gap:6px;flex-wrap:wrap">
        ${R.treatyIds && R.treatyIds.length ? `<span class="pill tag-rose">📜 ${R.treatyIds.length} 条 · ${treatyScore()} 分</span>` : ''}
        <span class="pill tag-jade">已清理 ${cleared} / ${total}</span>
      </div>
    </div>
    <div class="map-legend">
      <span><i class="lg battle"></i>战斗</span>
      <span><i class="lg elite"></i>精英</span>
      <span><i class="lg event"></i>奇遇</span>
      <span><i class="lg shop"></i>深渊商店</span>
      <span><i class="lg boss"></i>首领</span>
    </div>
    <div class="map-viewport" id="map-viewport">
      <div class="map-stage abyss-map" id="map-stage" style="width:${map.w}px;height:${map.h}px">
        <svg class="map-links" width="${map.w}" height="${map.h}" viewBox="0 0 ${map.w} ${map.h}">${edges}</svg>
        ${nodeHtml}
      </div>
      <div class="map-zoom-tip">🖱 滚轮缩放 · 按住拖拽查看完整路线</div>
    </div>
    <div class="map-hint">${hint}</div>
  </div>`;
}

/* ---------------- 地图摄像机：滚轮缩放 + 拖拽平移 ---------------- */
const MAP_MIN_SCALE = 0.42;
const MAP_MAX_SCALE = 2.2;
const MAP_INITIAL_SCALE = 1.35;
const MAP_EDGE_MARGIN = 36;
let mapCam = { depth: null, key: null, scale: MAP_INITIAL_SCALE, tx: 0, ty: 0 };
let mapDrag = null;
let mapSuppressClickUntil = 0;

function clampMapCamera() {
  const vp = document.getElementById('map-viewport');
  if (!vp || !R || !R.map) return;
  const vw = vp.clientWidth, vh = vp.clientHeight;
  if (!vw || !vh) return;
  const mw = R.map.w * mapCam.scale, mh = R.map.h * mapCam.scale;
  mapCam.tx = mw <= vw - MAP_EDGE_MARGIN * 2
    ? (vw - mw) / 2
    : clamp(mapCam.tx, vw - mw - MAP_EDGE_MARGIN, MAP_EDGE_MARGIN);
  mapCam.ty = mh <= vh - MAP_EDGE_MARGIN * 2
    ? (vh - mh) / 2
    : clamp(mapCam.ty, vh - mh - MAP_EDGE_MARGIN, MAP_EDGE_MARGIN);
}

function applyMapCamera() {
  const stage = document.getElementById('map-stage');
  if (!stage) return;
  clampMapCamera();
  stage.style.transform = `translate3d(${mapCam.tx}px, ${mapCam.ty}px, 0) scale(${mapCam.scale})`;
  stage.style.visibility = 'visible';
}

function mapZoomAt(px, py, nextScale) {
  const next = clamp(nextScale, MAP_MIN_SCALE, MAP_MAX_SCALE);
  if (Math.abs(next - mapCam.scale) < 0.0005) return;
  const k = next / mapCam.scale;
  mapCam.tx = px - (px - mapCam.tx) * k;
  mapCam.ty = py - (py - mapCam.ty) * k;
  mapCam.scale = next;
  applyMapCamera();
}

function bindMapCamera() {
  const vp = document.getElementById('map-viewport');
  if (!vp) return;
  vp.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = vp.getBoundingClientRect();
    const factor = Math.pow(1.0015, -e.deltaY);
    mapZoomAt(e.clientX - rect.left, e.clientY - rect.top, mapCam.scale * factor);
  }, { passive: false });

  vp.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    mapDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, tx: mapCam.tx, ty: mapCam.ty, moved: false };
    vp.classList.add('dragging');

    const onMove = ev => {
      if (!mapDrag || ev.pointerId !== mapDrag.id) return;
      const dx = ev.clientX - mapDrag.x;
      const dy = ev.clientY - mapDrag.y;
      if (!mapDrag.moved && Math.hypot(dx, dy) > 5) mapDrag.moved = true;
      if (!mapDrag.moved) return;
      mapCam.tx = mapDrag.tx + dx;
      mapCam.ty = mapDrag.ty + dy;
      applyMapCamera();
    };
    const onUp = ev => {
      if (!mapDrag || ev.pointerId !== mapDrag.id) return;
      if (mapDrag.moved) mapSuppressClickUntil = Date.now() + 320;
      mapDrag = null;
      vp.classList.remove('dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  });
}

// 进入新一层或身处入口时，摄像机定位到地图最左侧的入口处并保持整体放大比例
function setupMapCamera() {
  const vp = document.getElementById('map-viewport');
  if (!vp || !R || !R.map) return;
  const map = R.map;
  const vw = vp.clientWidth, vh = vp.clientHeight;
  if (!vw || !vh) return;
  if (mapCam.key !== map.key || R.node === map.start) {
    const atStart = R.node === map.start;
    const focusNode = atStart ? nodeById(map.start) : (nodeById(R.node) || nodeById(map.start));
    // 初始比例略放大，同时保证三行节点基本完整可见
    const scale = clamp(Math.min(MAP_INITIAL_SCALE, vh * 1.12 / map.h), MAP_MIN_SCALE, MAP_MAX_SCALE);
    const focusX = ((focusNode ? focusNode.c : 0) + 0.5) * MAP_COL_W;
    const focusY = ((focusNode ? focusNode.r : 0) + 0.5) * MAP_ROW_H;
    mapCam = {
      depth: R.depth,
      key: map.key,
      scale: scale,
      tx: atStart ? vw * 0.14 - focusX * scale : vw / 2 - focusX * scale,
      ty: atStart ? vh / 2 - (map.h / 2) * scale : vh / 2 - focusY * scale,
    };
  }
  applyMapCamera();
  bindMapCamera();
}

function floorTrackHtml() {
  let out = '';
  const cap = depthCapOf();
  for (let i = 1; i <= cap; i++) {
    const cls = ['fp'];
    if (i < R.depth) cls.push('done');
    else if (i === R.depth) cls.push('cur');
    out += `<div class="${cls.join(' ')}" title="第 ${i} 层"></div>`;
  }
  return `<div class="floor-track">${out}</div>`;
}

/* ---------------- 深渊条约 ---------------- */
function rollTreatyOptions() {
  let seen = Array.isArray(R.treatySeen) ? R.treatySeen : [];
  const owned = Array.isArray(R.treatyIds) ? R.treatyIds : [];
  let pool = TREATIES.filter(t => seen.indexOf(t.id) < 0 && owned.indexOf(t.id) < 0);
  if (pool.length < 6) {
    R.treatySeen = [];
    seen = [];
    pool = TREATIES.filter(t => owned.indexOf(t.id) < 0);
  }
  const opts = shuffle(pool).slice(0, 6);
  opts.forEach(t => { if (R.treatySeen.indexOf(t.id) < 0) R.treatySeen.push(t.id); });
  R.treatyOptions = opts.map(t => t.id);
  R.treatySel = [];
}
function treatyHtml() {
  const opts = (R.treatyOptions || []).map(treatyById).filter(Boolean);
  const sel = R.treatySel || [];
  const pickedScore = sel.reduce((s, id) => { const t = treatyById(id); return s + (t ? t.s : 0); }, 0);
  const cards = opts.map(t => {
    const on = sel.indexOf(t.id) >= 0;
    return `<div class="treaty ${on ? 'on' : ''} s${t.s}" onclick="toggleTreaty('${t.id}')">
      <div class="treaty-top"><span class="treaty-ico">${t.i}</span><b>${t.n}</b><span class="treaty-score">${t.s} 分</span></div>
      <div class="treaty-desc">${t.d}</div>
      <div class="treaty-mark">${on ? '已签署' : '点击签署'}</div>
    </div>`;
  }).join('');
  return `<div class="card treaty-card">
    <div class="card-h">
      <span>📜</span>
      <div><div class="card-t">深渊条约 · 通往第 ${R.depth} 层</div><div class="card-sub">签署条约会让深渊更兴奋，但奖励也更丰厚</div></div>
      <div style="margin-left:auto"><span class="pill tag-rose">已选 ${sel.length} 条 · ${pickedScore} 分</span></div>
    </div>
    <div class="small dim" style="line-height:1.8;margin-bottom:12px">从下方六条条约中任意勾选（可不选），随后点击「挑战」进入第 ${R.depth} 层。本局累计：<b style="color:#ff9aa8">${(R.treatyIds || []).length} 条 · ${treatyScore()} 分</b>。</div>
    <div class="treaty-grid">${cards}</div>
    <div class="row between" style="margin-top:14px;gap:10px;flex-wrap:wrap">
      <span class="small dim">条约只能签署，无法撤销；未选择的条约会留在深渊中。</span>
      <button class="btn btn-primary" onclick="confirmTreaty()">⚔️ 挑战第 ${R.depth} 层</button>
    </div>
  </div>`;
}
function toggleTreaty(id) {
  if (!R || runView !== 'treaty') return;
  const i = R.treatySel.indexOf(id);
  if (i >= 0) R.treatySel.splice(i, 1);
  else R.treatySel.push(id);
  sfx('click');
  renderRun();
}
function confirmTreaty() {
  if (!R) return;
  const picks = (R.treatySel || []).slice();
  picks.forEach(id => {
    if (R.treatyIds.indexOf(id) < 0) R.treatyIds.push(id);
  });
  R.treatyOptions = [];
  R.treatySel = [];
  R.hp = Math.min(R.hp, effStats().maxHp);
  if (R.hp <= 0) R.hp = 1;
  runView = 'map';
  saveRunState();
  sfx('click');
  renderRun();
  showScreen('run');
}

/* ---------------- 层间馈赠：深渊的馈赠与代偿 ---------------- */
function makeGiftReward(kind) {
  const d = R.depth;
  if (kind === 'gold') {
    const amount = 45 + d * 10;
    return { kind, i: '💰', n: '深渊金币', d: `立即获得 ${fmt(amount)} 金币`, gold: amount };
  }
  if (kind === 'potion') {
    return { kind, i: '🧪', n: '治疗药水 ×2', d: '补充 2 瓶药水（不超过上限）', potions: 2 };
  }
  if (kind === 'item') {
    const it = genItem(d, rollRarity(d, 3));
    return { kind, i: it.ico, n: it.name, d: `${SLOT_NAME[it.slot]} · ${statLines(it.stats).join(' · ')}`, it };
  }
  if (kind === 'buff') {
    const b = pick(GIFT_BUFFS);
    return { kind, i: b.i, n: b.n, d: b.d + '（本局永久）', buff: b };
  }
  const avail = SKILL_POOL.filter(s => !R.skills.includes(s));
  if (avail.length) {
    const sid = pick(avail);
    return { kind: 'skill', i: SKILLS[sid].i, n: SKILLS[sid].n, d: SKILLS[sid].d + `（冷却 ${SKILLS[sid].cd} 回合）`, sid };
  }
  return makeGiftReward('gold');
}

function startGift(nextView, clearedDepth) {
  const kinds = shuffle(['gold', 'item', 'potion', 'buff', 'skill']).slice(0, 4);
  const rewards = kinds.map(makeGiftReward);
  const hardshipIds = shuffle(HARDSHIPS.map(h => h.id)).slice(0, 4);
  R.gift = { rewards, hardshipIds, sel: [], from: clearedDepth || (R.depth - 1) };
  R.giftNext = nextView || 'map';
  runView = 'gift';
}

function giftHtml() {
  if (!R || !R.gift) return mapHtml();
  const g = R.gift;
  const sel = g.sel || [];
  const cols = g.rewards.map((r, i) => {
    const h = hardshipById(g.hardshipIds[i]);
    const on = sel.indexOf(i) >= 0;
    const full = sel.length >= 2 && !on;
    return `<div class="col" style="gap:10px">
      <div class="card" style="padding:14px;height:158px;overflow:hidden;display:flex;flex-direction:column;cursor:${full ? 'not-allowed' : 'pointer'};opacity:${full ? '.45' : '1'};border-color:${on ? 'rgba(255,203,92,.7)' : 'var(--line)'}" ${full ? '' : `onclick="toggleGift(${i})"`}>
        <div class="row between"><span style="font-size:26px">${r.i}</span><span class="pill ${on ? 'tag-gold' : ''}">${on ? '✓ 已选择' : '点击选择'}</span></div>
        <div class="card-t" style="font-size:14px;margin-top:8px">${r.n}</div>
        <div class="small dim" style="line-height:1.7;margin-top:4px">${r.d}</div>
      </div>
      <div class="card" style="padding:13px;height:104px;overflow:hidden;border-color:rgba(255,95,115,.4);background:linear-gradient(165deg,rgba(74,18,28,.62),rgba(18,9,15,.92))">
        <div class="small" style="color:#ff8b9a;letter-spacing:1px">☠ 苦难 · ${h ? h.n : '未知'}</div>
        <div class="small dim" style="line-height:1.7;margin-top:5px">${h ? h.d : '深渊的低语'}</div>
      </div>
    </div>`;
  }).join('');
  return `<div class="card">
    <div class="card-h">
      <span>🎁</span>
      <div><div class="card-t">深渊的馈赠与代偿</div><div class="card-sub">第 ${g.from || (R.depth - 1)} 层已结束 · 免费带走至多 2 件馈赠，但每件馈赠都附带着苦难</div></div>
      <div style="margin-left:auto"><span class="pill tag-rose">已选择 ${sel.length} / 2</span></div>
    </div>
    <div class="small dim" style="line-height:1.8;margin-bottom:12px">馈赠无需金币，但深渊从不做亏本买卖——选择上方的馈赠，就必须接受其下方的苦难。苦难会永久强化本局后续层数的敌人。</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px">${cols}</div>
    <div class="row between" style="margin-top:16px;gap:10px;flex-wrap:wrap">
      <button class="btn btn-ghost" onclick="rejectGift()">拒绝馈赠</button>
      <button class="btn btn-primary" onclick="confirmGift()" ${sel.length ? '' : 'disabled'}>${sel.length ? `领取 ${sel.length} 件馈赠并进入第 ${R.depth} 层` : '请选择至多 2 件馈赠'}</button>
    </div>
  </div>`;
}

function toggleGift(i) {
  if (!R || !R.gift) return;
  const sel = R.gift.sel || (R.gift.sel = []);
  const k = sel.indexOf(i);
  if (k >= 0) sel.splice(k, 1);
  else if (sel.length < 2) sel.push(i);
  else { toast('最多只能选择 2 件馈赠', '🎁'); return; }
  sfx('click');
  renderRun();
}

function applyGiftReward(r) {
  if (r.kind === 'gold') R.gold += r.gold;
  else if (r.kind === 'potion') R.potions = Math.min(R.potionCap, R.potions + r.potions);
  else if (r.kind === 'item') pendingItems.push(r.it);
  else if (r.kind === 'buff') {
    R[r.buff.k] += r.buff.v;
    if (r.buff.k === 'bonusHp') R.hp = Math.min(effStats().maxHp, R.hp + r.buff.v);
  } else if (r.kind === 'skill') {
    if (R.skills.indexOf(r.sid) < 0) R.skills.push(r.sid);
  }
}

function proceedGiftNext() {
  if (!R) return;
  const next = R.giftNext || 'map';
  R.giftNext = null;
  if (next === 'treaty') { rollTreatyOptions(); runView = 'treaty'; }
  else runView = 'map';
  saveRunState();
  checkAch();
  renderRun();
  showScreen('run');
}

function confirmGift() {
  if (!R || !R.gift) return;
  const g = R.gift;
  const sel = (g.sel || []).slice();
  if (!sel.length) return;
  sel.forEach(i => {
    applyGiftReward(g.rewards[i]);
    addHardship(g.hardshipIds[i]);
  });
  R.gift = null;
  sfx('buy');
  if (pendingItems.length) flushItems(proceedGiftNext);
  else proceedGiftNext();
}

function rejectGift() {
  if (!R || !R.gift) return;
  modal({
    title: '拒绝深渊的馈赠？', sub: 'REFUSE THE GIFT',
    body: '即便不选择馈赠，深渊也将随机给你选择当前物品的任意两个苦难，是否要拒绝馈赠并进入下一层？',
    buttons: [
      { label: '返回选择', cls: 'btn-ghost' },
      { label: '确定 · 拒绝馈赠', cls: 'btn-danger', fn: () => {
          const g = R.gift;
          if (!g) return;
          const picked = shuffle(g.hardshipIds.slice()).slice(0, 2);
          picked.forEach(id => addHardship(id));
          R.gift = null;
          proceedGiftNext();
          const lines = picked.map(id => {
            const h = hardshipById(id);
            return h ? `<div><b style="color:#ff8b9a">${h.i} ${h.n}</b> · ${h.d}</div>` : '';
          }).join('');
          modal({
            title: '深渊的嘲弄', sub: 'ABYSSAL MOCKERY',
            body: `<div style="line-height:2">你拒绝了馈赠，但深渊仍将两个苦难强加于你：</div><div class="col" style="gap:8px;margin-top:12px">${lines}</div>`,
            buttons: [{ label: `继续进入第 ${R.depth} 层`, cls: 'btn-primary' }],
          });
        } },
    ],
  });
}

function renderRun() {
  if (!R) { goHub(); return; }
  trackRunPeaks();
  ensureMap();
  const bm = biomeOf(R.depth);
  let main = '';

  if (runView === 'map') main = mapHtml();
  if (runView === 'shop') main = shopHtml();
  if (runView === 'event') main = eventHtml();
  if (runView === 'treaty') main = treatyHtml();
  if (runView === 'gift') main = giftHtml();

  $('#screen-run').innerHTML = `
    <div class="depth-head">
      <div class="depth-badge"><div class="depth-num">${R.depth}</div><div class="depth-lbl">DEPTH</div></div>
      <div>
        <div class="biome-name">${bm.name}</div>
        <div class="biome-sub">${bm.sub}</div>
      </div>
      <div style="margin-left:auto" class="row" style="gap:8px;flex-wrap:wrap">
        <span class="pill tag-gold">🔄 ${ngInfo(R.ng || 0).name}</span>
        ${R.stackMode ? `<span class="pill tag-rose">🩸 ${modeName(R)}</span>` : ''}
        ${currentChallenge() ? `<span class="pill tag-gold">🏆 ${currentChallenge().n}</span>` : ''}
        ${rulerTagHtml()}
        <button class="btn btn-sm btn-ghost" onclick="abandonRun()">放弃冒险</button>
      </div>
    </div>
    ${floorTrackHtml()}
    <div class="run-stack">
      <div id="run-main">${main}</div>
      <div class="player-rail">${playerPanelHtml()}</div>
    </div>`;
  renderTopbar();
  if (runView === 'map') requestAnimationFrame(setupMapCamera);
}

function abandonRun() {
  modal({
    title: '放弃这次冒险？', sub: 'ABANDON RUN',
    body: '你将以「放弃冒险」结束本局。结算时选择「放弃领取」会全额退还开局增益消耗的魂尘，但本局魂尘奖励一并放弃；选择「领取奖励」则保留本局魂尘奖励，开局增益消耗不退还。',
    buttons: [
      { label: '继续深入', cls: 'btn-primary' },
      { label: '放弃', cls: 'btn-danger', fn: () => { finishRun(false, true); } },
    ]
  });
}

function closeBattleAndContinue() {
  if (!R) return;
  R.active = null;
  B = null;
  pendingItems = [];
  runView = 'map';
  saveRunState();
  renderRun();
  showScreen('run');
}

function enterNode(id) {
  if (Date.now() < mapSuppressClickUntil) return;
  const n = nodeById(id);
  if (!canEnterNode(n)) return;
  R.active = id;
  saveRunState();
  sfx('click');
  if (n.type === 'battle') startBattle('normal');
  else if (n.type === 'elite') startBattle('elite');
  else if (n.type === 'boss') startBattle('boss');
  else if (n.type === 'shop') { runView = 'shop'; renderShop(); }
  else if (n.type === 'event') { runView = 'event'; genEvent(); renderRun(); }
}

function clearRoom() {
  if (!R) return;
  flushItems(() => {
    if (!R) return;
    const node = R.active ? nodeById(R.active) : null;
    S.stats.rooms++;
    R.kills = R.kills || 0;
    R.active = null;
    if (node) {
      if (R.done.indexOf(node.id) < 0) R.done.push(node.id);
      R.node = node.id;
    }
    if (!node || node.type !== 'boss') {
      // 清理单个节点：少量成长与恢复，然后继续在本层地图前进
      const xm = extremeMul();
      R.bonusHp += Math.round(2 * xm);
      R.bonusAtk += 0.4 * xm;
      R.bonusDef += 0.2 * xm;
      R.hp = Math.min(effStats().maxHp, R.hp + Math.round(effStats().maxHp * 0.05));
      runView = 'map';
      saveRunState();
      checkAch();
      renderRun();
      showScreen('run');
      return;
    }
    // 击败本层首领：发放整层奖励，并进入「深渊的馈赠与代偿」
    const xm = extremeMul();
    R.bonusHp += Math.round(11 * xm); R.bonusAtk += 2.2 * xm; R.bonusDef += 1.2 * xm;
    R.hp = Math.min(effStats().maxHp, R.hp + Math.round(effStats().maxHp * 0.1));
    let step = 1;
    if (R.skipFloor) { step = 2; R.skipFloor = false; }
    R.depth += step;
    R.map = null; R.mapFor = -1; R.node = null; R.done = []; R.active = null; R.shopFor = -1; R.shopReroll = 0;
    const clearedDepth = R.depth - step;
    const capNow = depthCapOf();
    S.stats.maxDepth = Math.max(S.stats.maxDepth, Math.min(R.depth, capNow));
    const cap = depthCapOf();
    if (R.depth > cap) {
      // 本模式已到最后一层：不再展示馈赠，直接进入跨模式或结算流程
      runView = 'map';
      const m = modeOf(R);
      if (m === 0 && (R.ng || 0) >= STACK_UNLOCK_NG) {
        // 挑战保留正常前五层的首领进程，第五层后自动进入叠加层，第十层直接结算。
        if (currentChallenge()) { enterStackMode(1); return; }
        if (R.stackEnabled === false) { finishRun(true); return; }
        promptStack();
        return;
      }
      if (m === 1) {
        if (R.stackEnabled === false) { finishRun(true); return; }
        promptLimit();
        return;
      }
      finishRun(true);
      return;
    }
    // 每一层结束后：深渊的馈赠与代偿（极限模式 11-14 层结束后还需签署条约）
    const nextView = (modeOf(R) === 2 && clearedDepth >= 11 && clearedDepth <= 14) ? 'treaty' : 'map';
    const enterNext = () => {
      startGift(nextView, clearedDepth);
      saveRunState();
      checkAch();
      renderRun();
      showScreen('run');
    };
    showRunLoading(enterNext, { title: '正在前往下一层', duration: 3400 });
  });
}

/* ---------------- 深渊叠加 / 深渊叠加 · 极限 ---------------- */
function toggleStackEnabled() {
  if (S.runSave) { toast('冒险进行中，结算前无法更改深渊叠加开关', '🔒'); return; }
  if ((S.meta.ngPlus || 0) < STACK_UNLOCK_NG) { toast(`轮回难度达到 ${STACK_UNLOCK_NG} 后解锁`, '🔒'); return; }
  S.meta.stackEnabled = S.meta.stackEnabled === false;
  saveGame();
  sfx('click');
  renderHub();
  toast(S.meta.stackEnabled ? '深渊叠加已开启' : '深渊叠加已关闭 · 第 5 层结束后直接结算', '🩸', S.meta.stackEnabled ? 'success' : 'warning');
}

function promptStack() {
  R.depth = MAX_DEPTH;
  saveRunState();
  modal({
    title: '深渊叠加模式现已可用', sub: 'ABYSS STACK · 越界之后，深渊仍在增厚',
    body: `<div style="font-size:13.5px;line-height:2">深渊叠加模式现已可用，是否要进入该模式并将层数上限提升至 <b style="color:#ff8b9a">10 层</b>？<br>
      <span class="small dim" style="display:block;margin-top:10px;line-height:1.9">
        · 第 6-10 层敌人的生命与攻击大幅提高；<br>
        · 全新的精英与首领登场；<br>
        · 你的增益与事件馈赠同样被深渊放大；<br>
        · 通关后的魂尘奖励大幅增加。<br>
        · 若不进入，将直接结算第 5 层进度并领取对应奖励。
      </span></div>`,
    buttons: [
      { label: '暂不进入 · 结算本局', cls: 'btn-ghost', fn: () => finishRun(true) },
      { label: '进入深渊叠加', cls: 'btn-danger', fn: () => enterStackMode(1) },
    ],
    size: 'extreme',
  });
}

function promptLimit() {
  R.depth = STACK_MAX_DEPTH;
  saveRunState();
  modal({
    title: '深渊叠加 · 极限模式现已可用', sub: 'ABYSS LIMIT · 15 层与深渊条约',
    body: `<div style="font-size:13.5px;line-height:2">深渊叠加 · 极限模式现已可用，是否要进入该模式并将层数上限提升至 <b style="color:#ff8b9a">15 层</b>？<br>
      <span class="small dim" style="display:block;margin-top:10px;line-height:1.9">
        · 第 11-15 层敌人/精英与首领的数值将产生巨大变化；<br>
        · 连带启用「深渊条约」：11-14 层每层结束后可从六条条约中选择签署；<br>
        · 共 24 条条约、总计 60 分，分数越高，对敌我双方的总体难度提升越大；<br>
        · 若不进入，将直接结算第 10 层进度并领取对应奖励。
      </span></div>`,
    buttons: [
      { label: '暂不进入 · 结算本局', cls: 'btn-ghost', fn: () => finishRun(true) },
      { label: '进入深渊叠加 · 极限', cls: 'btn-danger', fn: () => enterStackMode(2) },
    ],
    size: 'extreme',
  });
}

function enterStackMode(mode) {
  R.stackMode = mode;
  R.depth = mode === 2 ? STACK_MAX_DEPTH + 1 : MAX_DEPTH + 1;
  R.map = null; R.mapFor = -1; R.node = null; R.done = []; R.active = null; R.shopFor = -1;
  runView = 'map';
  renderTopbar();
  saveRunState();
  toast(mode === 2 ? '已进入深渊叠加 · 极限 · 上限提升至 15 层' : '已进入深渊叠加 · 上限提升至 10 层', '🩸', 'warning');
  // 进入叠加层同样播放「正在前往下一层」，并补齐上一层的深渊的馈赠与代偿
  const clearedDepth = mode === 2 ? STACK_MAX_DEPTH : MAX_DEPTH;
  showRunLoading(() => {
    startGift('map', clearedDepth);
    saveRunState();
    checkAch();
    renderRun();
    showScreen('run');
  }, { title: '正在前往下一层', duration: 3400 });
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

/* ---------------- 苦难 / 条约标签弹窗 ---------------- */
function showHardshipTags() {
  if (!R) return;
  const ids = R.hardships || [];
  const rows = ids.length ? ids.map(id => {
    const h = hardshipById(id);
    if (!h) return '';
    return `<div class="cx" style="padding:10px 12px">
      <div class="row between"><div style="font-weight:700;color:#ff9fae">${h.i} ${h.n}</div><span class="pill tag-rose">苦难</span></div>
      <div class="small dim" style="margin-top:5px;line-height:1.7">${h.d}</div>
    </div>`;
  }).join('') : '<div class="small dim">本局尚未背负苦难。</div>';
  const hm = hardshipMods();
  const total = `敌方生命 +${Math.round(hm.enemyHp * 100)}% · 攻击 +${Math.round(hm.enemyAtk * 100)}% · 防御 +${Math.round(hm.enemyDef * 100)}%`;
  modal({
    title: '☠ 已背负的苦难', sub: `HARDSHIPS · ${ids.length} 项`,
    size: 'wide',
    body: `<div class="col" style="gap:8px">${rows}</div>
      <div class="small dim" style="margin-top:10px;line-height:1.8">当前苦难总增益：${total}（每项上限 +80%）。</div>`,
    buttons: [{ label: '关闭', cls: 'btn-primary' }],
  });
}

function showTreatyTags() {
  if (!R) return;
  const ids = R.treatyIds || [];
  const rows = ids.length ? ids.map(id => {
    const t = treatyById(id);
    if (!t) return '';
    return `<div class="cx" style="padding:10px 12px">
      <div class="row between"><div style="font-weight:700;color:#ffb3c0">${t.i} ${t.n}</div><span class="pill tag-rose">${t.s} 分</span></div>
      <div class="small dim" style="margin-top:5px;line-height:1.7">${t.d}</div>
    </div>`;
  }).join('') : '<div class="small dim">尚未签署任何条约。</div>';
  modal({
    title: '📜 已签署的深渊条约', sub: `TREATIES · ${ids.length} 条 · ${treatyScore()} 分`,
    size: 'wide',
    body: `<div class="col" style="gap:8px">${rows}</div>
      <div class="small dim" style="margin-top:10px;line-height:1.8">条约分数越高，结算时的深渊评价越高，但敌我双方也会承受更强的变化。</div>`,
    buttons: [{ label: '关闭', cls: 'btn-primary' }],
  });
}

/* ---------------- 商店 ---------------- */
function buildShop() {
  const offers = [];
  const mul = (1 + treatyMods().shopPrice) * challengeShopPriceMul();
  for (let i = 0; i < 3; i++) {
    const it = genItem(R.depth, rollRarity(R.depth + 1));
    offers.push({ kind: 'item', it, price: Math.max(1, Math.round(it.price * 1.15 * mul)), sold: false });
  }
  offers.push({ kind: 'potion', price: Math.max(1, Math.round(34 * mul)), sold: false });
  const buffs = [
    { k: 'bonusHp', v: 26, n: '生命药剂', d: '最大生命 +26', i: '❤️' },
    { k: 'bonusAtk', v: 4, n: '力量药剂', d: '攻击 +4', i: '⚔️' },
    { k: 'bonusDef', v: 3, n: '石肤药剂', d: '防御 +3', i: '🛡️' },
    { k: 'bonusCrit', v: 6, n: '锐目药剂', d: '暴击率 +6%', i: '🎯' },
  ];
  const buffStatKey = { bonusHp: 'maxHp', bonusAtk: 'atk', bonusDef: 'def', bonusCrit: 'crit' };
  const bf = pick(buffs.filter(b => !challengeStatLocked(buffStatKey[b.k])));
  offers.push({ kind: 'buff', ...bf, price: Math.max(1, Math.round(62 * mul)), sold: false });
  const known = R.skills;
  const avail = SKILL_POOL.filter(s => !known.includes(s));
  if (avail.length) {
    const sid = pick(avail);
    offers.push({ kind: 'skill', sid, price: Math.max(1, Math.round((120 + R.depth * 6) * mul)), sold: false });
  }
  return offers;
}

function renderShop() {
  if (!R.shop || R.shopFor !== R.depth) {
    R.shop = buildShop();
    R.shopFor = R.depth;
    R.shopReroll = 0;
    sellSelected.clear();
    batchSell = false;
    shopMode = 'buy';
  } else if (R.shopReroll === undefined) {
    R.shopReroll = 0;
  }
  renderRun();
}

function setShopMode(m) {
  shopMode = m === 'sell' ? 'sell' : 'buy';
  if (shopMode === 'buy') sellSelected.clear();
  batchSell = false;
  sfx('click');
  renderRun();
}

// 出售价：按装备估价等比折算
function sellPriceOf(it) { return Math.max(1, Math.round((it.price || 0) * 0.8)); }

function shopBuyHtml() {
  const cards = R.shop.map((o, i) => {
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
    return `<div class="shop-card ${o.sold ? 'sold' : ''}" style="--rc:${rc}">
      <div class="si-head"><span class="si-ico">${ico}</span><span class="si-name">${name}</span></div>
      <div class="si-desc">${desc}</div>
      <div class="si-foot">
        <span class="cost">💰 ${o.price}</span>
        <button class="btn btn-sm ${can ? 'btn-primary' : 'btn-ghost'}" ${can ? '' : 'disabled'} onclick="buyOffer(${i})">${o.sold ? '已售出' : '购买'}</button>
      </div>
    </div>`;
  }).join('');
  return `<div class="shop-grid">${cards}</div>`;
}

function shopSellEntries() {
  const entries = [];
  ['weapon', 'armor', 'trinket'].forEach(slot => {
    (R.equip[slot] || []).forEach((it, idx) => entries.push({ key: slot + ':' + idx, slot, idx, it }));
  });
  return entries;
}

function shopSellHtml() {
  const entries = shopSellEntries();
  const selCount = entries.filter(e => sellSelected.has(e.key)).length;
  const total = entries.reduce((a, e) => a + (sellSelected.has(e.key) ? sellPriceOf(e.it) : 0), 0);
  const cards = entries.map(({ key, slot, idx, it }) => {
    const rc = RARITY[it.rarity].color;
    const on = sellSelected.has(key);
    return `<div class="shop-card sell-card ${batchSell ? 'pick' : ''} ${on ? 'on' : ''}" style="--rc:${rc}"
        ${batchSell ? `onclick="toggleSellItem('${key}',${!on})"` : ''}>
      ${batchSell ? `<span class="sell-check ${on ? 'on' : ''}">${on ? '✓' : ''}</span>` : ''}
      <div class="si-head"><span class="si-ico">${it.ico}</span><span class="si-name" style="color:${rc}">${it.name}</span></div>
      <div class="si-desc">${SLOT_NAME[slot]} · ${statLines(it.stats).join(' · ')}</div>
      <div class="si-foot">
        <span class="cost">💰 ${sellPriceOf(it)}</span>
        ${batchSell ? '' : `<button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();sellOneItem('${slot}',${idx})">出售</button>`}
      </div>
    </div>`;
  }).join('');
  const empty = `<div class="small dim" style="grid-column:1/-1;padding:24px 0;text-align:center">背包中没有可出售的装备。</div>`;
  const head = `<div class="sell-head">
      <span class="small dim">${batchSell
        ? `背包 ${entries.length} 件 · 已选 ${selCount} 件 · 合计 💰 ${fmt(total)}`
        : `背包 ${entries.length} 件 · 估价合计 💰 ${fmt(entries.reduce((a, e) => a + sellPriceOf(e.it), 0))}`}</span>
      <span class="row" style="gap:8px">
        ${batchSell
          ? `<button class="btn btn-ghost btn-sm" onclick="exitBatchSell()">退出批量</button>
             <button class="btn btn-primary btn-sm" ${selCount ? '' : 'disabled'} onclick="sellSelectedItems()">全部出售</button>`
          : `<button class="btn btn-ghost btn-sm" ${entries.length ? '' : 'disabled'} onclick="batchSelectSell()">批量出售</button>`}
      </span>
    </div>`;
  return `${head}<div class="shop-grid">${entries.length ? cards : empty}</div>`;
}

// 渲染后保留商店网格的滚动位置
function renderKeepShopScroll() {
  const box = $('.shop-grid');
  const st = box ? box.scrollTop : 0;
  renderRun();
  const nb = $('.shop-grid');
  if (nb) nb.scrollTop = st;
}

function toggleSellItem(key, on) {
  if (on) sellSelected.add(key); else sellSelected.delete(key);
  renderKeepShopScroll();
}

function batchSelectSell() {
  // 进入批量选择模式：不默认勾选，由玩家自行选择
  batchSell = true;
  sellSelected.clear();
  sfx('click');
  renderKeepShopScroll();
}

function exitBatchSell() {
  batchSell = false;
  sellSelected.clear();
  sfx('click');
  renderKeepShopScroll();
}

// 单件出售
function sellOneItem(slot, idx) {
  const arr = R.equip[slot] || [];
  const it = arr[idx];
  if (!it) return;
  const gain = sellPriceOf(it);
  arr.splice(idx, 1);
  addGold(gain);
  R.hp = Math.min(R.hp, effStats().maxHp);
  sellSelected.clear();
  sfx('buy');
  toast(`已出售 ${it.name}，获得 💰 ${fmt(gain)}`, '💰', 'success');
  checkAch();
  saveRunState();
  renderKeepShopScroll();
}

function sellSelectedItems() {
  const slots = ['weapon', 'armor', 'trinket'];
  let total = 0, count = 0;
  slots.forEach(slot => {
    const arr = R.equip[slot] || [];
    arr.forEach((it, idx) => {
      if (sellSelected.has(slot + ':' + idx)) { total += sellPriceOf(it); count++; }
    });
    R.equip[slot] = arr.filter((it, idx) => !sellSelected.has(slot + ':' + idx));
  });
  if (!count) return;
  addGold(total);
  R.hp = Math.min(R.hp, effStats().maxHp);
  sellSelected.clear();
  batchSell = false;
  sfx('buy');
  toast(`已出售 ${count} 件装备，获得 💰 ${fmt(total)}`, '💰', 'success');
  checkAch();
  saveRunState();
  renderKeepShopScroll();
}

function shopHtml() {
  const tm = treatyMods();
  const priceTag = tm.shopPrice ? `<span class="pill tag-rose" style="margin-left:6px">📜 价格 ×${(1 + tm.shopPrice).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}</span>` : '';
  const challengePriceTag = currentChallenge() && currentChallenge().id === 'inflation' ? `<span class="pill tag-rose" style="margin-left:6px">🏆 挑战物价 ×${challengeShopPriceMul()}</span>` : '';
  const body = shopMode === 'sell' ? shopSellHtml() : shopBuyHtml();
  const foot = shopMode === 'sell'
    ? `<span class="small dim">出售按装备估价的 80% 折算</span>`
    : `<button class="btn btn-ghost btn-sm" ${R.gold >= rerollCost() ? '' : 'disabled'} onclick="rerollShop()">🔄 刷新商品（${rerollCost()} 金）</button>`;
  return `<div class="card">
    <div class="card-h"><span>🛒</span><div><div class="card-t">深渊商店</div><div class="card-sub">"金币在深渊里也会腐坏，不如交给我。"</div></div>
      <div style="margin-left:auto" class="row">${priceTag}${challengePriceTag}<span class="pill tag-gold">💰 ${fmt(R.gold)}</span></div></div>
    <div class="shop-tabs">
      <button class="shop-tab ${shopMode === 'buy' ? 'on' : ''}" onclick="setShopMode('buy')">购入</button>
      <button class="shop-tab ${shopMode === 'sell' ? 'on' : ''}" onclick="setShopMode('sell')">出售</button>
    </div>
    ${body}
    <div class="divider"></div>
    <div class="row" style="gap:10px;flex-wrap:wrap">
      ${foot}
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

// 刷新费用等比递增：30 → 45 → 68 → 101 …
function rerollCost() {
  const n = (R && R.shopReroll) || 0;
  return Math.round(30 * Math.pow(1.5, n));
}

function rerollShop() {
  const cost = rerollCost();
  if (R.gold < cost) return;
  R.gold -= cost; sfx('click');
  R.shopReroll = (R.shopReroll || 0) + 1;
  R.shop = buildShop(); R.shopFor = R.depth;
  saveRunState();
  renderRun();
}

function leaveShop() { clearRoom(); }

/* ---------------- 奇遇事件 ---------------- */
function genEvent() {
  const used = R.usedEvents || (R.usedEvents = []);
  const m = modeOf(R);
  let pool = EVENTS.filter(e => !used.includes(e.id) && (!e.extremeOnly || m === 2));
  if (!pool.length) { used.length = 0; pool = EVENTS.filter(e => !e.extremeOnly || m === 2); }
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
  if (eventPickCtx) return;
  const ev = R.ev;
  const choice = ev.choices[i];
  S.stats.events++;
  let text = null;
  let deferred = false;
  try {
    const r = choice.fn();
    if (r === null) deferred = true;
    else text = r || '什么也没有发生。';
  } catch (e) { text = '命运拒绝了你的选择。'; console.warn(e); }
  renderRun();
  if (deferred) return;
  finishEventOutcome(text);
}

/* ---------------- 事件物品选择器（铁匠 / 裂纹之镜 / 幽灵商队共用） ---------------- */
let eventPickCtx = null;
function recalcItemPower(it) {
  const s = it.stats || {};
  const score = (s.atk || 0) * 3 + (s.def || 0) * 2.5 + (s.hp || 0) * 0.5 +
    (s.crit || 0) * 1.2 + (s.critDmg || 0) * 0.4 + (s.lifesteal || 0) * 2 + (s.gold || 0) * 0.2;
  it.score = Math.round(score);
  const rr = RARITY[it.rarity] || RARITY.common;
  it.price = Math.round((16 + score * 0.62) * rr.mult * (1 + ((R ? R.depth : 1) - 1) * 0.06));
}
function eventItemPickHtml(items) {
  return items.map((it, i) => {
    const rr = RARITY[it.rarity] || RARITY.common;
    return `<button class="cx clickable" style="text-align:left;width:100%;font-family:inherit;color:inherit;cursor:pointer;border-color:${rr.color}55" onclick="eventPickItem(${i})">
      <div class="cx-top">
        <div class="cx-emoji" style="border-color:${rr.color};width:38px;height:38px;font-size:19px">${it.ico}</div>
        <div style="min-width:0;flex:1">
          <div class="cx-n" style="color:${rr.color}">${it.name}</div>
          <div class="small dim">${SLOT_NAME[it.slot]} · 估价 ${it.price} 金</div>
        </div>
        <span class="pill">选择</span>
      </div>
      <div class="small" style="color:#9fc0ff;line-height:1.7">${statLines(it.stats).join(' · ')}</div>
    </button>`;
  }).join('');
}
function openEventItemPicker({ title, sub = '', items, emptyText, onPick }) {
  eventPickCtx = { items: items, onPick: onPick };
  const body = items.length
    ? `<div class="col" style="gap:8px">${eventItemPickHtml(items)}</div>`
    : `<div class="center muted" style="padding:26px 10px;font-size:13.5px;line-height:1.9">${emptyText}</div>`;
  modal({
    title: title,
    sub: sub || '命运的回音',
    body: body,
    buttons: items.length
      ? [{ label: '离开', cls: 'btn-ghost', fn: () => { eventPickCtx = null; finishEventOutcome('你最终什么也没有选择，转身离开。', true); } }]
      : [{ label: '确定', cls: 'btn-primary', fn: () => { eventPickCtx = null; finishEventOutcome(emptyText, true); } }],
    size: 'wide',
  });
}
function eventPickItem(i) {
  const ctx = eventPickCtx;
  eventPickCtx = null;
  const it = ctx && ctx.items ? ctx.items[i] : null;
  closeModal();
  if (it && ctx.onPick) ctx.onPick(it);
}
function finishEventOutcome(text, immediate) {
  const ev = R && R.ev;
  // 深渊叠加：事件给予的效果被深渊放大
  const m = modeOf(R);
  if (m > 0) {
    const k = m === 2 ? 1.6 : 1;
    const atk = Math.round(5 * k), def = Math.round(4 * k), hp = Math.round(30 * k), crit = Math.round(4 * k), heal = Math.round(20 * k);
    R.bonusAtk += atk; R.bonusDef += def; R.bonusHp += hp; R.bonusCrit += crit;
    R.hp = Math.min(effStats().maxHp, R.hp + heal);
    text += `<br><span style="color:#ff9aa8">${m === 2 ? '极限' : '叠加'}的馈赠：攻击 +${atk} · 防御 +${def} · 生命上限 +${hp} · 暴击率 +${crit}% · 回复 ${heal} 生命。</span>`;
  }
  saveRunState();
  checkAch();
  if (immediate) { clearRoom(); return; }
  modal({
    title: '命运的回音', sub: ev ? ev.n : '',
    body: `<div style="font-size:14px;line-height:2;color:#d8e2f5">${text}</div>`,
    buttons: [{ label: '继续深入 →', cls: 'btn-primary', fn: () => { clearRoom(); } }],
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
  const m = modeOf(R);
  const tm = treatyMods();
  let key;
  if (kind === 'boss') key = bossKeyOf(R.depth);
  else if (kind === 'elite' && m > 0) key = pick(['xelite1', 'xelite2']);
  else key = pick(bm.enemies);
  const base = kind === 'boss' ? BOSSES[key] : ENEMIES[key];
  let hpMul = 1 + (R.depth - 1) * 0.075 + ng * 0.35;
  let atkMul = 1 + (R.depth - 1) * 0.042 + ng * 0.25;
  if (kind === 'boss') { hpMul = 1 + (R.depth - 1) * 0.09 + ng * 0.45; atkMul = 1 + (R.depth - 1) * 0.05 + ng * 0.3; }
  if (kind === 'elite') { hpMul *= 1.9; atkMul *= 1.22; }
  // 深渊叠加 / 极限：敌人数值大幅提高
  let defMul = kind === 'elite' ? 1.15 : 1;
  if (m === 1) { hpMul *= 2.4; atkMul *= 1.9; defMul *= 1.5; }
  if (m === 2) { hpMul *= 3.8; atkMul *= 2.8; defMul *= 2.0; }
  // 深渊条约：敌方增益
  hpMul *= (1 + tm.enemyHp);
  atkMul *= (1 + tm.enemyAtk);
  defMul *= (1 + tm.enemyDef);
  // 深渊苦难：层间馈赠的代偿，永久累积
  const hm = hardshipMods();
  hpMul *= (1 + hm.enemyHp);
  atkMul *= (1 + hm.enemyAtk);
  defMul *= (1 + hm.enemyDef);
  // 心神不宁：石龛标记触发对应战斗类型的敌方增益
  const um = uneaseMods(kind);
  if (um) {
    hpMul *= (1 + um.hp);
    atkMul *= (1 + um.atk);
    defMul *= (1 + um.def);
  }
  const hp = Math.round(base.hp * hpMul);
  const enemy = {
    key, ico: base.i,
    name: (kind === 'elite' ? '精英 · ' : '') + base.n,
    hp, maxHp: hp,
    atk: base.atk * atkMul,
    def: base.def * defMul,
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
  R.enemyLog = R.enemyLog || [];
  R.enemyLog.push({ n: e.name, i: e.ico, boss: !!e.boss, elite: B.kind === 'elite' });
  if (B.kind === 'elite') {
    S.stats.eliteKills++;
    if (modeOf(R) > 0) S.stats.extremeEliteKills = (S.stats.extremeEliteKills || 0) + 1;
    if (B.dmgTaken === 0) S.stats.flawlessElite++;
  }
  if (e.boss) {
    S.stats.bosses[e.key] = (S.stats.bosses[e.key] || 0) + 1;
    R.bossKills = (R.bossKills || 0) + 1;
    R.bossLog = R.bossLog || [];
    R.bossLog.push(e.name);
  }
  const goldMul = 1 + effStats().goldFind / 100 + (R.ng || 0) * 0.08;
  const gold = Math.round(rnd(e.gold[0], e.gold[1]) * GOLD_SCALE * goldMul * (B.kind === 'elite' ? 1.7 : 1));
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
  const ch = currentChallenge();
  const mode = modeOf(R);
  const extreme = mode === 2;
  const cap = depthCapOf();
  const depthReached = Math.min(R.depth, cap);
  const ng = R.ng || 0;
  const bossKills = R.bossKills || 0;
  const kills = R.kills || 0;
  const items = (R.itemsLog || []).slice();
  const bossList = (R.bossLog || []).slice();
  const boonCost = (R.preBoon && R.preBoon.cost) ? R.preBoon.cost : 0;
  // 休赛期（含开发者调试强制休赛期）挑战仍可游玩，但不发放通行证经验
  const challengeXp = ch && win && passWeeklySeasonActive() && !challengeRewardClaimed(ch.id) ? ch.reward : 0;
  const extremeClear = win && extreme && depthReached >= LIMIT_MAX_DEPTH;
  const treatyCount = (R.treatyIds || []).length;
  const treatyScoreRun = treatyScore();

  S.stats.runs++;
  if (win) S.stats.wins++; else S.stats.deaths++;
  if (win && !R.usedPotion) S.stats.winsNoPotion++;
  if (extremeClear) S.stats.extremeWins = (S.stats.extremeWins || 0) + 1;
  S.stats.maxDepth = Math.max(S.stats.maxDepth, Math.min(R.depth, cap));
  S.stats.maxTreatiesRun = Math.max(S.stats.maxTreatiesRun || 0, treatyCount);
  S.stats.maxTreatyScore = Math.max(S.stats.maxTreatyScore || 0, treatyScoreRun);
  if (win) S.stats.maxWinDepth = Math.max(S.stats.maxWinDepth || 0, depthReached);
  // 通过 15 层时记录本局签署的条约，用于条约类成就
  if (win && depthReached >= 15) {
    const tc = S.stats.treatyClear = S.stats.treatyClear || {};
    (R.treatyIds || []).forEach(id => { tc[id] = (tc[id] || 0) + 1; });
    S.stats.maxTreatyScoreClear = Math.max(S.stats.maxTreatyScoreClear || 0, treatyScoreRun);
  }

  const dustBase = depthReached * 2 + bossKills * 5 + (win ? 20 : 0);
  // 深渊叠加通关：魂尘奖励提升
  const dustMul = mode === 2 ? 2.4 : (mode === 1 ? 1.7 : 1);
  const dust = Math.round(dustBase * (1 + S.meta.upgrades.dust * 0.06) * (1 + ng * 0.08) * dustMul);

  let ngUp = false;
  if (win) {
    // 仅在以当前已解锁的最高难度通关时，解锁下一级轮回
    if (!ch && ng >= (S.meta.ngPlus || 0) && ng < MAX_NG) {
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
    S.stats.maxGoldRun = Math.max(S.stats.maxGoldRun || 0, R.maxGold || 0, R.gold || 0);
  }

  // 通行证经验与每周加成：
  // · 轮回难度 6-15 普通模式（5 层）通关 → +10 经验（1 级）
  // · 深渊叠加（10 层）通关 → 可领取 1 次每周加成（+40 经验 / 4 级）
  // · 深渊叠加 · 极限（15 层）完整通关 → 可一次性领取全部剩余加成（最多 3 次 / 12 级）
  // 每周经验总量 120 封顶，全部领取完毕后需等下周刷新
  const weekly = ensurePassWeekly();
  const seasonActive = passWeeklySeasonActive();
  let passXp = 0, bonusUses = 0;
  if (!ch && seasonActive && win && ng >= 6) {
    if (mode === 0) {
      passXp = weekly.xpLeft >= PASS_XP_CLEAR ? PASS_XP_CLEAR : 0;
    } else if (extremeClear) {
      bonusUses = Math.min(weekly.bonusLeft, Math.floor(weekly.xpLeft / PASS_XP_BONUS));
    } else if (mode === 1 && depthReached >= STACK_MAX_DEPTH) {
      bonusUses = Math.min(1, weekly.bonusLeft, Math.floor(weekly.xpLeft / PASS_XP_BONUS));
    }
  }
  const bonusXp = bonusUses * PASS_XP_BONUS;
  const st = {
    dust: dust, passXp: passXp, bonusUses: bonusUses, bonusXp: bonusXp,
    canBonus: bonusUses > 0, extremeClear: extremeClear, boonCost: boonCost,
    challengeId: ch ? ch.id : null, challengeCycle: ch ? CHALLENGE_CYCLE.id : null, challengeXp: challengeXp,
    abandoned: !!abandoned,
  };

  // 战绩回顾：记录本局详情，仅保留最近 10 局
  S.history = Array.isArray(S.history) ? S.history : [];
  S.history.unshift({
    ts: Date.now(),
    win: !!win, abandoned: !!abandoned,
    extreme: extreme, extremeClear: extremeClear, stackMode: mode,
    treatyCount: treatyCount, treatyScore: treatyScoreRun,
    ng: ng, depth: depthReached, challengeId: ch ? ch.id : null, challengeName: ch ? ch.n : null,
    kills: kills, bossKills: bossKills, dust: dust,
    items: items, bosses: bossList,
    enemies: (R.enemyLog || []).slice(),
    skills: (R.skills || []).slice(),
    usedPotion: !!R.usedPotion,
  });
  if (S.history.length > 10) S.history.length = 10;

  // 结算数据持久化：避免弹窗弹出后意外刷新导致奖励丢失
  const title = ch
    ? (win ? `挑战完成 · ${ch.n}` : abandoned ? `已放弃挑战 · ${ch.n}` : `挑战失败 · ${ch.n}`)
    : win
      ? (extremeClear ? '你踏穿了深渊叠加 · 极限' : mode === 1 ? '深渊已被叠加' : '深渊已被穿透')
      : '你坠落了';
  const sub = ch
    ? (win ? 'CHALLENGE CLEARED · 十层试炼完成' : 'CHALLENGE ENDED · 深渊等待你的再次挑战')
    : win
      ? (extremeClear ? 'ABYSS LIMIT CLEARED · 深渊主宰已陨落' : mode === 1 ? 'ABYSS STACK CLEARED · 十层尽处' : 'VICTORY · 深渊之主已陨落')
      : 'DEFEAT · 深渊记住了你的名字';
  S.pendingSettlement = {
    st: st,
    title: title, sub: sub, win: win, extreme: extreme, extremeClear: extremeClear,
    mode: mode, depthReached: depthReached, ng: ng, kills: kills, bossKills: bossKills,
    treatyCount: treatyCount, treatyScore: treatyScoreRun,
    items: items, bossList: bossList, boonCost: boonCost, abandoned: !!abandoned,
    dust: dust, passXp: passXp, bonusUses: bonusUses, bonusXp: bonusXp, canBonus: bonusUses > 0, ngUp: ngUp,
    challengeId: ch ? ch.id : null, challengeCycle: ch ? CHALLENGE_CYCLE.id : null, challengeXp: challengeXp,
    ngPlusAfter: S.meta.ngPlus,
  };

  S.runSave = null;
  R = null; B = null;
  saveGame();
  checkAch();
  renderTitle();
  hubTab = ch ? 'challenge' : 'sanctum';
  renderHub();
  showScreen('hub');
  renderTopbar();

  // 通关结算前先播放结算加载动画
  if (win) {
    showRunLoading(() => showSettlementModal(S.pendingSettlement), { title: '正在进行结算', duration: 5000 });
  } else {
    showSettlementModal(S.pendingSettlement);
  }
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
  const challenge = d.challengeId ? challengeById(d.challengeId) : null;
  const challengeXp = d.challengeXp !== undefined ? d.challengeXp : ((d.st && d.st.challengeXp) || 0);
  const modeLabel = challenge ? `周期挑战 · ${challenge.n}` : (d.extreme ? '深渊叠加 · 极限' : (d.mode === 1 ? '深渊叠加' : '正常模式'));
  const capLabel = challenge ? STACK_MAX_DEPTH : (d.extreme ? LIMIT_MAX_DEPTH : (d.mode === 1 ? STACK_MAX_DEPTH : MAX_DEPTH));
  const treatyCount = d.treatyCount || 0;
  const treatyScoreVal = d.treatyScore || 0;
  const bonusUses = d.bonusUses !== undefined ? d.bonusUses : (d.canBonus ? 1 : 0);
  const bonusXp = d.bonusXp !== undefined ? d.bonusXp : bonusUses * PASS_XP_BONUS;
  const passXpText = challenge
    ? (!d.win ? '挑战未通过' : !passWeeklySeasonActive() ? '休赛期 · 不发放挑战经验' : challengeXp > 0 ? `挑战奖励 +${challengeXp} 经验（${challengeXp / 10} 级）` : '本期已领取 · 不重复发放')
    : bonusUses > 0
      ? `每周加成 ×${bonusUses} · +${bonusXp} 经验（${bonusUses * PASS_XP_BONUS / 10} 级）`
      : (d.passXp > 0 ? `+${d.passXp} 经验（${d.passXp / 10} 级）` : '本局无');

  const bodyHtml = `
    <div class="settle-grid">
      <div class="settle-left">
        <div class="center" style="margin-bottom:14px">
          <div style="font-size:50px;line-height:1;filter:drop-shadow(0 10px 30px rgba(255,150,70,.5))">${d.win ? '🌅' : '💀'}</div>
          <div style="font-family:var(--serif);font-size:18px;letter-spacing:3px;margin-top:10px;color:#ffd9a8">${d.title}</div>
          <div class="small dim" style="margin-top:5px">本局难度 · ${ngInfo(d.ng).name} · ${modeLabel}</div>
        </div>
        <div class="col" style="gap:7px">
          <div class="stat"><span class="stat-k">抵达层数</span><span class="stat-v">第 ${d.depthReached} 层 / ${capLabel}</span></div>
          <div class="stat"><span class="stat-k">击败敌人</span><span class="stat-v">${d.kills} 个</span></div>
          <div class="stat"><span class="stat-k">击杀首领</span><span class="stat-v">${d.bossKills} 位</span></div>
          ${treatyCount || d.extreme ? `<div class="stat"><span class="stat-k">选取条约</span><span class="stat-v" style="color:#ff9aa8">${treatyCount} 条 · ${treatyScoreVal} 分</span></div>` : ''}
          <div class="stat"><span class="stat-k">获得魂尘</span><span class="stat-v" style="color:var(--gold)">✨ +${fmt(d.dust)}</span></div>
          ${d.boonCost ? `<div class="stat"><span class="stat-k">开局增益花费</span><span class="stat-v" style="color:#ff8b9a">✨ -${fmt(d.boonCost)}</span></div>` : ''}
          ${d.abandoned && d.boonCost ? `<div class="stat"><span class="stat-k">放弃领取可退还</span><span class="stat-v" style="color:var(--jade)">✨ +${fmt(d.boonCost)}</span></div>` : ''}
          <div class="stat"><span class="stat-k">通行证经验</span><span class="stat-v" style="color:#8fc4ff">${passXpText}</span></div>
        </div>
        ${d.ngUp ? `<div class="center" style="margin-top:12px;color:#b5a8ff;font-size:12.5px">轮回难度提升至 ${d.ngPlusAfter} —— 深渊更深了。</div>` : ''}
        <div class="settle-btns">
          ${bonusUses > 0 ? `<button class="btn btn-arcane" onclick="settleFinish(S.pendingSettlement.st,true,true)">${d.extreme ? '全部领取每周加成' : '领取每周加成'}（+${bonusXp} 经验 · ${bonusUses * PASS_XP_BONUS / 10} 级）</button>` : ''}
          <button class="btn btn-primary" onclick="settleFinish(S.pendingSettlement.st,true,false)">领取奖励</button>
          <button class="btn btn-ghost" onclick="settleDefer()">暂不领取，返回圣所</button>
          <button class="btn btn-ghost" onclick="settleFinish(S.pendingSettlement.st,false,false)">放弃领取</button>
        </div>
        <div class="small dim" style="line-height:1.7;margin-top:10px">${d.abandoned
          ? '主动放弃：选择「领取奖励」将获得本局魂尘，但开局增益花费不退还；选择「放弃领取」将放弃本局全部魂尘奖励，并全额退还开局增益花费。'
          : challenge
            ? (passWeeklySeasonActive()
              ? '挑战通关后，领取奖励可获得本局魂尘与首次挑战通行证经验；每项挑战每周期仅发放一次，不占用每周经验上限或加成次数。本期已领取过的挑战仍可重复游玩，但不会再次获得挑战经验。'
              : '通行证当前处于休赛期：挑战仍可正常游玩与结算，但本次不会发放任何挑战通行证经验；新赛季开启后将自动恢复发放。')
            : '领取后将获得本次的魂尘与通行证经验；选择每周加成会消耗本周剩余加成次数。放弃领取则不会获得任何奖励；暂不领取则返回圣所，待领取内容将保留便于后续领取。'}</div>
      </div>
      <div class="settle-right">
        <div class="cx-sec" style="margin-top:0">获得物品 · ${d.items.length} 件</div>
        <div class="settle-items">${itemHtml}</div>
        <div class="cx-sec">击败的首领 · ${d.bossList.length} 位</div>
        <div class="settle-items">${bossHtml}</div>
      </div>
    </div>`;

  modal({
    title: d.win ? 'THE ABYSS FALLS' : 'YOU HAVE FALLEN',
    sub: d.sub, body: bodyHtml, buttons: [], size: 'wide settle-wide',
  });
}

/* ---------------- 结算领取 ---------------- */
function settleFinish(st, claim, useBonus) {
  closeModal();
  const seasonActive = passWeeklySeasonActive();
  if (claim) {
    S.meta.soulDust += st.dust;
    S.stats.dustEarned += st.dust;
    if (st.passXp > 0 || useBonus) {
      if (!seasonActive) {
        // 休赛期兜底：结算弹窗跨过赛季结束时间时，不再发放通行证经验
        toast('通行证已进入休赛期，本次不发放通行证经验', '📅');
      } else {
        const w = ensurePassWeekly();
        let xp = st.passXp || 0;
        if (useBonus) {
          const uses = Math.min(st.bonusUses || 0, w.bonusLeft, Math.floor(w.xpLeft / PASS_XP_BONUS));
          if (uses > 0) {
            xp = uses * PASS_XP_BONUS;
            w.bonusLeft = Math.max(0, w.bonusLeft - uses);
          }
        }
        const give = Math.min(xp, w.xpLeft);
        if (give > 0) {
          w.xpLeft -= give;
          addPassExpExternal(give);
          toast(`通行证经验 +${give}` + (w.xpLeft <= 0 ? ' · 本周经验已全部领取' : ''), '🎫', 'success');
        } else if (useBonus) {
          toast('本周加成次数或通行证经验已用完，待下周刷新', '📅');
        }
      }
    }
    // 挑战经验独立于每周上限与加成次数；领取时再次校验，避免多存档位或待结算页面重复发奖。
    if (st.challengeId && (st.challengeXp || 0) > 0) {
      const ch = challengeById(st.challengeId);
      if (!seasonActive) {
        toast('通行证已进入休赛期，本次不发放挑战经验', '📅', 'warning');
      } else if (!ch || st.challengeCycle !== CHALLENGE_CYCLE.id) {
        toast('该挑战所属周期已轮换，本次不发放挑战经验', '🔄', 'warning');
      } else if (challengeRewardClaimed(ch.id)) {
        toast('本期挑战经验已领取，不会重复发放', '🎫', 'warning');
      } else if (markChallengeRewardClaimed(ch.id)) {
        addPassExpExternal(ch.reward);
        toast(`挑战奖励 · 通行证经验 +${ch.reward}（${ch.reward / 10} 级）`, '🎫', 'success');
      } else {
        toast('挑战奖励记录保存失败，本次未发放挑战经验', '⚠️', 'error');
      }
    }
  }
  S.pendingSettlement = null;
  // 主动放弃且选择「放弃领取」：全额退还开局增益消耗；选择「领取奖励」则花费保留
  if (!claim && st.abandoned && (st.boonCost || 0) > 0) {
    S.meta.soulDust += st.boonCost;
    toast(`已退还开局增益消耗 ✨ +${fmt(st.boonCost)}`, '💰', 'success');
  }
  saveGame();
  checkAch();
  renderTitle();
  goHubWithLoading(st.challengeId ? 'challenge' : 'sanctum');
}

/* 暂不领取：保留待结算数据，返回圣所（踏入深渊禁用，继续按钮变为「有待领取内容」） */
function settleDefer() {
  closeModal();
  saveGame();
  renderTitle();
  goHubWithLoading(S.pendingSettlement && S.pendingSettlement.challengeId ? 'challenge' : 'sanctum');
}

/* ---------------- 每周加成 / 通行证经验 ---------------- */
const PASS_WEEK_XP = 120;      // 每周可获得通行证经验上限（12 级）
const PASS_BONUS_MAX = 3;      // 每周加成次数
const PASS_XP_CLEAR = 10;      // 难度 6-15 通关一次 → 10 经验（1 级）
const PASS_XP_BONUS = 40;      // 使用一次每周加成 → 40 经验（4 级）

// 每周加成与通行证赛季时间绑定：时间窗由 pass.js 同步到 localStorage（PASS_CONFIG.weeklyBonusSeasonWindow）
const PASS_WEEKLY_SEASON_KEY = 'pre_pass_weekly_bonus_window';
// 通行证开发者调试「进入休赛期 / 关闭休赛期」开关，由 pass.js 写入，深渊回响读取后同步生效
const PASS_DEV_OFFSEASON_KEY = 'pre_pass_dev_offseason';
const PASS_WEEKLY_SEASON_FALLBACK = ['2026-09-30T20:00:00Z', '2026-11-30T20:00:00Z'];
function passDevOffSeasonForced() {
  try { return localStorage.getItem(PASS_DEV_OFFSEASON_KEY) === '1'; } catch (e) { return false; }
}
function passWeeklySeasonState() {
  let win = PASS_WEEKLY_SEASON_FALLBACK;
  try {
    const raw = JSON.parse(localStorage.getItem(PASS_WEEKLY_SEASON_KEY) || 'null');
    if (Array.isArray(raw) && raw.length === 2 && raw[0] && raw[1]) win = raw;
  } catch (e) {}
  const start = new Date(win[0]).getTime();
  const end = new Date(win[1]).getTime();
  const now = Date.now();
  // 开发者调试强制休赛期：不影响真实日期，仅用于调试，关闭后恢复真实时间判定
  if (passDevOffSeasonForced()) return { active: false, phase: 'dev', start: start, end: end };
  if (!isNaN(start) && now < start) return { active: false, phase: 'before', start: start, end: end };
  if (!isNaN(end) && now >= end) return { active: false, phase: 'off', start: start, end: end };
  return { active: true, phase: 'in', start: start, end: end };
}
function passWeeklySeasonActive() { return passWeeklySeasonState().active; }

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
  const eMods = enemyModTagsHtml();
  const pMods = playerModTagsHtml();

  $('#battle-main').innerHTML = `
    <div class="enemy-card ${B.kind === 'elite' ? 'elite' : ''} ${e.boss ? 'boss' : ''}">
      <div class="enemy-emoji" id="enemy-emoji">${e.ico}</div>
      <div class="enemy-name">${e.name}</div>
      <div class="enemy-meta">${e.boss ? '首领' : (B.kind === 'elite' ? '精英' : '敌人')} · 第 ${R.depth} 层</div>
      <div class="bar hp" style="max-width:440px;margin:0 auto 6px"><div class="bar-fill" style="width:${hpPct}%"></div></div>
      <div class="small dim" style="margin-bottom:12px">${Math.max(0, Math.round(e.hp))} / ${e.maxHp}</div>
      <div class="intent ${ii.cls}">意图 · ${ii.txt}</div>
      ${eMods ? `<div class="mod-row">${eMods}</div>` : ''}
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
      ${pMods ? `<div class="mod-row left">${pMods}</div>` : ''}
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
    goHubWithLoading();
  });
  // 通行证页面切换赛季时间窗 / 开发者调试休赛期后，深渊回响立即同步刷新
  window.addEventListener('storage', e => {
    if (!S) return;
    if (e.key !== PASS_DEV_OFFSEASON_KEY && e.key !== PASS_WEEKLY_SEASON_KEY) return;
    renderTitle();
    const hubScr = $('#screen-hub');
    if (hubScr && hubScr.classList.contains('active')) renderHub();
    renderTopbar();
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
  document.addEventListener('click', e => {
    if (!e.target.closest || !e.target.closest('.ng-set-wrap')) closeNgMenu();
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
  // 进入游戏页时在游戏页面内播放加载动画（固定 5 秒）
  showRunLoading(() => {}, { title: '正在加载程序', duration: 5000 });
}

/* ============================================================
   Lucide 图标升级
   把界面文本中的 emoji / 符号统一替换为 Lucide 内联 SVG 图标。
   采用文本节点后处理，覆盖静态模板与动态渲染，未收录的字符保持原样。
   ============================================================ */
const EMOJI_LUCIDE = {
  '✨': 'sparkles', '💰': 'coins', '⚔': 'swords', '🔒': 'lock', '🛡': 'shield',
  '🧪': 'flask-conical', '📜': 'scroll-text', '👑': 'crown', '🩸': 'droplet',
  '🏆': 'trophy', '🔄': 'refresh-cw', '💀': 'skull', '🔥': 'flame',
  '📅': 'calendar-days', '❤': 'heart', '🔊': 'volume2', '🎯': 'target',
  '⚠': 'triangle-alert', '🕯': 'lamp', '🎁': 'gift', '🗂': 'archive',
  '🔱': 'swords', '💥': 'zap', '☠': 'skull', '📖': 'book-open', '✓': 'check',
  '🎫': 'ticket', '⚡': 'zap', '🗿': 'landmark', '🌑': 'moon', '🚪': 'door-open',
  '🌅': 'sunrise', '✦': 'sparkle', '🔇': 'volume-x', '⚒': 'hammer', '🗡': 'sword',
  '🔮': 'gem', '👁': 'eye', '🌀': 'tornado', '🐗': 'paw-print', '🏰': 'castle',
  '💗': 'heart', '💪': 'dumbbell', '📈': 'chart-line', '🛒': 'shopping-cart',
  '🎒': 'backpack', '🌠': 'star', '🕒': 'clock', '⛏': 'pickaxe',
  '❔': 'circle-help', '❄': 'snowflake', '🌪': 'wind', '💧': 'droplet',
  '☀': 'sun', '🌋': 'mountain', '🎭': 'drama', '🧛': 'venetian-mask',
  '🐉': 'flame', '😈': 'annoyed', '🌚': 'moon', '💵': 'banknote',
  '🩹': 'bandage', '🐌': 'snail', '🏷': 'tag', '🐢': 'turtle', '🧠': 'brain',
  '😵': 'annoyed', '💲': 'dollar-sign', '💸': 'banknote', '💓': 'heart-pulse',
  '💫': 'sparkle', '🥀': 'flower', '💨': 'wind', '😖': 'frown', '🔨': 'hammer',
  '🌱': 'sprout', '🌟': 'star', '🧭': 'compass', '✕': 'x', '📊': 'chart-column',
  '⚙': 'settings', '🔳': 'square', '⛶': 'maximize', '🗑': 'trash2', '🥋': 'shirt',
  '👘': 'shirt', '🦺': 'shield', '📿': 'circle-dot', '💍': 'gem', '🧣': 'shirt',
  '💎': 'gem', '🐀': 'rat', '🦇': 'bird', '🕷': 'bug', '👻': 'ghost',
  '👤': 'user', '🐛': 'bug', '🐺': 'dog', '🕸': 'grid3x3', '🔪': 'pocket-knife',
  '🦂': 'bug', '🦷': 'bone', '🦀': 'shell', '🏯': 'castle', '⛲': 'droplets',
  '🎲': 'dices', '⛓': 'link', '🐫': 'footprints', '📚': 'library',
  '👺': 'venetian-mask', '🌉': 'route', '📨': 'mail', '🦴': 'bone',
  '🕳': 'circle-dashed', '🎰': 'dices', '🌿': 'leaf', '🔭': 'telescope',
  '🏮': 'lamp', '🍄': 'sprout', '🏦': 'landmark', '🎽': 'shirt', '💚': 'heart',
  '⚰': 'skull', '🚫': 'ban', '🔺': 'triangle', '🔟': 'hash', '♾': 'infinity',
  '📦': 'package', '🗃': 'archive', '🏗': 'construction', '🏛': 'landmark',
  '💖': 'heart', '💢': 'annoyed', '🌄': 'sunrise', '☄': 'star', '🌌': 'orbit',
  '🖋': 'pen-tool', '🕋': 'landmark', '↑': 'arrow-up', '🧝': 'user-round',
  '🛠': 'wrench', '👹': 'venetian-mask', '🎚': 'sliders-horizontal',
  '▸': 'chevron-right', '❓': 'circle-help', '🖱': 'mouse-pointer',
  '▲': 'chevron-up', '▼': 'chevron-down', '◈': 'gem', '→': 'arrow-right',
  '6️⃣': 'hash', '🏠': 'house'
};
const ICON_SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, OPTION: 1, SELECT: 1, NOSCRIPT: 1 };
const EMOJI_RE = new RegExp('(' + Object.keys(EMOJI_LUCIDE)
  .sort((a, b) => b.length - a.length)
  .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|') + ')\\uFE0F?', 'g');

function upgradeEmojiIcons(root) {
  if (!root || typeof window.preIcon !== 'function') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentNode;
      if (!p || !node.nodeValue || ICON_SKIP_TAGS[p.tagName]) return NodeFilter.FILTER_REJECT;
      if (p.classList && p.classList.contains('pre-lucide')) return NodeFilter.FILTER_REJECT;
      EMOJI_RE.lastIndex = 0;
      return EMOJI_RE.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const targets = [];
  while (walker.nextNode()) targets.push(walker.currentNode);
  targets.forEach(node => {
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let last = 0, m;
    EMOJI_RE.lastIndex = 0;
    while ((m = EMOJI_RE.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const holder = document.createElement('span');
      holder.innerHTML = window.preIcon(EMOJI_LUCIDE[m[1]], { cls: 'emoji-ic' });
      while (holder.firstChild) frag.appendChild(holder.firstChild);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    if (node.parentNode) node.parentNode.replaceChild(frag, node);
  });
}

let iconScheduled = false;
function scheduleEmojiIcons() {
  if (iconScheduled) return;
  iconScheduled = true;
  // 微任务中同步替换：在浏览器绘制前完成，避免 emoji 闪现一帧
  Promise.resolve().then(() => {
    iconScheduled = false;
    upgradeEmojiIcons(document.body);
  });
}
function startEmojiIcons() {
  if (!document.body) return;
  upgradeEmojiIcons(document.body);
  if (window.MutationObserver) {
    new MutationObserver(records => {
      // 加载动画每秒数十次刷新进度文字，跳过它可避免无意义的全量扫描
      for (let i = 0; i < records.length; i++) {
        const target = records[i].target;
        if (target && target.closest && target.closest('.run-loading')) continue;
        scheduleEmojiIcons();
        return;
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startEmojiIcons);
} else {
  setTimeout(startEmojiIcons, 0);
}

document.addEventListener('DOMContentLoaded', init);
let booted = false;
function boot() { if (booted) return; booted = true; init(); }
if (document.readyState !== 'loading') boot();
