// ==================== 赛季通行证系统 ====================
// —— 启动器的独立等级系统，与账户等级完全隔离
// —— 数据按账户隔离存储（localStorage key = pass_<username>）
// —— UI 弹窗使用项目五框架：Tailwind(布局) + GSAP(入场/交互动效) + Lenis(平滑滚动)
//    + Three.js(3D粒子背景)

var PASS_DATA_VERSION = 1;

// ==================== 赛季配置 ====================
var PASS_CONFIG = {
    seasonId: 1,
    name: '第一赛季通行证 「初始化」',
    nameEn: 'Season 1 PRE Pass 「Initialize」',
    levelCap: 120,
    devLevelMax: 9999,             // 开发者模式「修改通行证等级」可设定的最高等级（121 级起为 EX 溢出等级）
    expPerLevel: 10,
    precoinPerLevel: 300,        // 购买一级通行证等级所需 PRE Coin
    premiumCost: 6480,           // 购买付费通行证本体所需 PRE Coin
    bundlePrice: 12900,          // 通行证组合包原价（本体全部内容 + 立即豪礼）
    bundleDiscountRate: 0.8,     // 组合包优惠：未购买本体时直接购买享约 8 折优惠
    bundleDiscountPrice: 10368,  // 组合包优惠价（未购买本体时的实付价格）
    exFreePrecoin: 50,           // EX 溢出：免费每级奖励 PRE Coin
    exPremiumPrecoin: 100,       // EX 溢出：付费每级额外奖励 PRE Coin（+免费=150）
    startTime: '2026-10-01T00:00:00Z',   // 赛季起始时间 (UTC) = 2026-10-01 08:00 (UTC+8)
    endTime: '2026-12-31T09:00:00Z'      // 赛季结束时间 (UTC) = 2026-12-31 17:00 (UTC+8)
};

// ==================== 奖励表生成 ====================
// 动态生成 120 级的奖励配置
// 免费档位：每级 1 件物品（不含 PRE 硬币，已全部移入付费档）
// 付费档位：每级 2 件物品 + PRE 硬币（共 3 槽）
// PRE Coin 补给包等级四（precoin_supply_4）全赛季不再投放
// PRE Coin 补给包等级三 ≤5、等级二 ≤10、等级一 ≤15
function buildPassRewards() {
    var W = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS : {};

    // 常见物品轮换池（已移除所有 PRE Coin 补给包，补给包改由稀有投放表精确控制）
    var FREE_COMMON = ['gacha_single', 'luck_coin', 'exp_supply_1', 'exp_supply_2'];
    var PREMIUM_COMMON_A = ['exp_boost_small', 'gacha_single', 'luck_coin'];
    var PREMIUM_COMMON_B = ['exp_boost_mid', 'exp_boost_large', 'gacha_ten'];

    // 稀有物品限量投放表：[物品id, 全赛季上限, 投放等级列表]
    var PREMIUM_RARE_SCHEDULE = [
        ['exp_boost_premium', 8,  [50, 65, 80, 90, 100, 110, 115, 120]],
        ['precoin_supply_3',  5,  [25, 45, 75, 100, 115]],
        ['precoin_supply_2',  10, [8, 16, 24, 32, 40, 55, 70, 85, 100, 115]],
        ['precoin_supply_1',  15, [3, 9, 15, 21, 27, 33, 39, 45, 51, 57, 63, 69, 75, 81, 87]],
        ['exp_supply_4',      8,  [48, 58, 68, 82, 92, 104, 112, 118]],
        ['exp_supply_3',      12, [22, 28, 34, 42, 52, 62, 72, 88, 96, 106, 114, 118]]
    ];
    var PREMIUM_RARE = {};
    PREMIUM_RARE_SCHEDULE.forEach(function(def) {
        def[2].slice(0, def[1]).forEach(function(lv) {
            if (!PREMIUM_RARE[lv]) PREMIUM_RARE[lv] = [];
            PREMIUM_RARE[lv].push(def[0]);
        });
    });

    function getItemName(id) { return W[id] ? W[id].name : id; }
    function getItemIcon(id) { return W[id] ? W[id].icon : 'fas fa-question'; }
    function getItemColor(id) { return W[id] ? W[id].color : '#999'; }
    function makeItem(id, qty) {
        return { id: id, qty: qty, name: getItemName(id), icon: getItemIcon(id), color: getItemColor(id) };
    }

    // 数量规则：低等级多给，高等级精给
    function getQty(level, tier) {
        if (tier === 'free') {
            if (level <= 40) return level % 5 === 0 ? 3 : 2;
            if (level <= 80) return level % 10 === 0 ? 2 : 1;
            return 1;
        }
        if (level <= 40) return level % 10 === 0 ? 2 : 1;
        return 1;
    }

    // PRE 硬币（付费档专属）：每级 40，逢 6 的倍数等级 +10
    function getPrecoinForLevel(level) {
        return 40 + (level % 6 === 0 ? 10 : 0);
    }

    var rewards = [];
    for (var lv = 1; lv <= PASS_CONFIG.levelCap; lv++) {
        // 免费物品：整十级给十连抽券，其余从常见池轮换（不含 PRE 硬币）
        var isMilestone = lv % 10 === 0;
        var freeItem = isMilestone
            ? makeItem('gacha_ten', 1)
            : makeItem(FREE_COMMON[(lv - 1) % FREE_COMMON.length], getQty(lv, 'free'));

        // 付费槽 A / B：稀有投放表优先，否则常见池轮换
        var rares = PREMIUM_RARE[lv] || [];
        var premA = makeItem(PREMIUM_COMMON_A[(lv - 1) % PREMIUM_COMMON_A.length], getQty(lv, 'premium'));
        var premB = rares.length > 0
            ? makeItem(rares[0], 1)
            : makeItem(PREMIUM_COMMON_B[(lv - 1) % PREMIUM_COMMON_B.length], getQty(lv, 'premium'));
        if (rares.length > 1) premA = makeItem(rares[1], 1);

        rewards.push({
            level: lv,
            precoin: 0,                    // 免费档不再给 PRE 硬币
            premiumPrecoin: getPrecoinForLevel(lv), // 付费档 PRE 硬币
            freeItem: freeItem,
            premiumItems: [premA, premB]   // 付费物品 2 件 + 下方 premiumPrecoin 共 3 槽
        });
    }

    return rewards;
}

// ==================== 任务定义 ====================
// 日常任务：每天刷新，最多 5 个，每个 2 经验
var PASS_DAILY_TASK_POOL = [
    { id: 'd_claim',    title: '领取任意每日奖励', desc: '在每日签到领取 1 次奖励',        target: 1, exp: 2 },
    { id: 'd_warehouse', title: '查看仓库',          desc: '打开仓库 1 次',                  target: 1, exp: 2 },
    { id: 'd_shop',     title: '浏览商店',          desc: '打开商店 1 次',                  target: 1, exp: 2 },
    { id: 'd_login',    title: '每日登录',          desc: '今日启动启动器 1 次',             target: 1, exp: 2 },
    { id: 'd_coin',     title: '赚取 PRE Coin',     desc: '今日获得任意数量 PRE Coin',       target: 1, exp: 2 },
    { id: 'd_play',     title: '玩一次小游戏',      desc: '在游戏中心游玩任意小游戏 1 次',   target: 1, exp: 2 },
    { id: 'd_gacha',    title: '抽卡一次',          desc: '在抽卡模拟器执行 1 次抽取',       target: 1, exp: 2 }
];

// 周常任务：每周一刷新，最多 5 个，每个 4 经验
var PASS_WEEKLY_TASK_POOL = [
    { id: 'w_claim7',   title: '签到累计',          desc: '本周在每日签到累计领取 3 天',     target: 3, exp: 4 },
    { id: 'w_play5',    title: '玩小游戏',          desc: '本周游玩任意小游戏 5 次',         target: 5, exp: 4 },
    { id: 'w_gacha10',  title: '抽卡挑战',          desc: '本周在抽卡模拟器抽取 10 次',      target: 10, exp: 4 },
    { id: 'w_coin100',  title: '积累财富',          desc: '本周累计赚取 100 PRE Coin',       target: 100, exp: 4 },
    { id: 'w_browse',   title: '探索启动器',        desc: '本周打开仓库/商店/任务中心各 1 次', target: 3, exp: 4 },
    { id: 'w_catchup',  title: '补签奖励',          desc: '本周使用补签卡 1 次',             target: 1, exp: 4 },
    { id: 'w_premium',  title: '体验付费道具',      desc: '本周使用任意经验加成卡 2 次',     target: 2, exp: 4 }
];

// 赛季任务：赛季内固定 10 个，赛季结束后整体刷新，5-8 经验
function buildSeasonTasks() {
    return [
        { id: 's_first_login', title: '新赛季启航',        desc: '进入游戏中心 1 次',                      target: 1,   exp: 5 },
        { id: 's_claim30',    title: '坚持签到',          desc: '赛季内累计签到 30 天',                    target: 30,  exp: 6 },
        { id: 's_play50',     title: '游戏达人',          desc: '赛季内累计游玩任意小游戏 50 次',          target: 50,  exp: 6 },
        { id: 's_gacha50',    title: '抽卡狂',            desc: '赛季内在抽卡模拟器抽取 50 次',            target: 50,  exp: 5 },
        { id: 's_coin1000',   title: '财富积累',          desc: '赛季内累计赚取 1000 PRE Coin',            target: 1000, exp: 7 },
        { id: 's_boost10',    title: '经验加成体验',      desc: '赛季内累计使用任意经验加成卡 10 次',      target: 10,  exp: 6 },
        { id: 's_reach30',    title: '初入巅峰',          desc: '赛季通行证等级达到 30 级',                 target: 30,  exp: 7 },
        { id: 's_reach60',    title: '稳定攀登',          desc: '赛季通行证等级达到 60 级',                 target: 60,  exp: 8 },
        { id: 's_reach90',    title: '高级征途',          desc: '赛季通行证等级达到 90 级',                 target: 90,  exp: 8 },
        { id: 's_reach120',   title: '赛季顶点',          desc: '赛季通行证等级达到 120 级（满级）',        target: 120, exp: 8 }
    ];
}

// ==================== 账户隔离存储 ====================
function getPassStorageKey() {
    var currentUser = {};
    try { currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}'); } catch (e) {}
    var username = currentUser.username || 'anonymous';
    return 'pass_' + username;
}

function getPassData() {
    var stored = localStorage.getItem(getPassStorageKey());
    if (stored) {
        try {
            var data = JSON.parse(stored);
            if (data && typeof data.level === 'number') return data;
        } catch (e) {}
    }
    return createDefaultPassData();
}

function createDefaultPassData() {
    var today = new Date();
    var weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // 周一为起点
    weekStart.setHours(0, 0, 0, 0);

    return {
        version: PASS_DATA_VERSION,
        seasonId: PASS_CONFIG.seasonId,
        level: 0,
        exp: 0,                           // 当前等级内累积经验
        totalExp: 0,                      // 累计获得经验（不含已升级消耗）
        expOverflow: 0,                   // 满级后溢出的经验计数（用于 EX 奖励节奏）
        isPremium: false,                 // 是否购买了付费通行证
        hasBundle: false,                 // 是否购买了通行证组合包
        seasonBadgeOwned: false,          // 是否获得「第一赛季纪念徽章」
        purchasedLevels: 0,               // 购买的等级数（升级节奏参考）
        levelRewardClaimed: {},           // { 1:true, 2:true, ... } 免费奖励已领取
        premiumRewardClaimed: {},         // { 1:true, 2:true, ... } 付费奖励已领取
        exFreeClaimed: 0,                 // EX 免费奖励已领取等级数
        exPremiumClaimed: 0,              // EX 付费奖励已领取等级数
        // 任务系统
        lastDailyRefresh: null,           // 上次日常刷新 YYYY-MM-DD
        lastWeeklyRefresh: null,          // 上次周常刷新 ISO 时间戳
        dailyTasks: [],                   // [{ id, progress, claimed }]
        weeklyTasks: [],                  // [{ id, progress, claimed }]
        seasonTasks: [],                  // [{ id, progress, claimed }]
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

function savePassData(data) {
    data.version = PASS_DATA_VERSION;
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(getPassStorageKey(), JSON.stringify(data));
}

// ==================== 任务刷新逻辑 ====================
function refreshDailyTasks(data) {
    var today = new Date().toISOString().slice(0, 10);
    if (data.lastDailyRefresh === today) return data;
    data.lastDailyRefresh = today;
    // 从池子里随机抽 5 个
    var pool = PASS_DAILY_TASK_POOL.slice();
    data.dailyTasks = [];
    for (var i = 0; i < 5 && pool.length > 0; i++) {
        var idx = Math.floor(Math.random() * pool.length);
        var t = pool.splice(idx, 1)[0];
        data.dailyTasks.push({ id: t.id, progress: 0, claimed: false });
    }
    savePassData(data);
    return data;
}

function refreshWeeklyTasks(data) {
    var today = new Date();
    var weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    if (data.lastWeeklyRefresh && new Date(data.lastWeeklyRefresh) >= weekStart) return data;
    data.lastWeeklyRefresh = weekStart.toISOString();

    var pool = PASS_WEEKLY_TASK_POOL.slice();
    data.weeklyTasks = [];
    for (var i = 0; i < 5 && pool.length > 0; i++) {
        var idx = Math.floor(Math.random() * pool.length);
        var t = pool.splice(idx, 1)[0];
        data.weeklyTasks.push({ id: t.id, progress: 0, claimed: false });
    }
    savePassData(data);
    return data;
}

function ensureSeasonTasks(data) {
    if (!data.seasonTasks || data.seasonTasks.length === 0) {
        data.seasonTasks = buildSeasonTasks().map(function(t) {
            return { id: t.id, progress: 0, claimed: false };
        });
        savePassData(data);
    }
    return data;
}

// ==================== 核心 API ====================

// 增加通行证经验（完成任务 / 购买等级等）
function passAddExp(amount, source) {
    amount = parseInt(amount, 10);
    if (!amount || amount <= 0) return false;

    var data = getPassData();
    data = refreshDailyTasks(data);
    data = refreshWeeklyTasks(data);
    data = ensureSeasonTasks(data);

    // 满级检查
    if (data.level >= PASS_CONFIG.levelCap) {
        data.expOverflow += amount;
        data.totalExp += amount;
        savePassData(data);
        return { leveledUp: false, reachedCap: true, expAdded: amount };
    }

    data.exp += amount;
    data.totalExp += amount;
    var leveledUp = false;

    while (data.exp >= PASS_CONFIG.expPerLevel && data.level < PASS_CONFIG.levelCap) {
        data.exp -= PASS_CONFIG.expPerLevel;
        data.level += 1;
        leveledUp = true;

        // 赛季任务：等级相关进度自动更新
        data.seasonTasks.forEach(function(st) {
            if (st.id === 's_reach30' && data.level >= 30) st.progress = Math.max(st.progress, 30);
            if (st.id === 's_reach60' && data.level >= 60) st.progress = Math.max(st.progress, 60);
            if (st.id === 's_reach90' && data.level >= 90) st.progress = Math.max(st.progress, 90);
            if (st.id === 's_reach120' && data.level >= 120) st.progress = 120;
        });
    }

    savePassData(data);

    if (leveledUp && typeof window.__passOnLevelUp === 'function') {
        try { window.__passOnLevelUp(data.level); } catch (e) {}
    }

    return { leveledUp: leveledUp, level: data.level, expAdded: amount };
}

// 购买等级：直接提升 N 级（每级 300 PRE Coin）
function passBuyLevel(count) {
    count = Math.max(1, parseInt(count, 10) || 1);
    if (_isPassSeasonLocked()) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '通行证', message: _getPassLockedMessage('购买等级') });
        return false;
    }
    var data = getPassData();
    var remaining = PASS_CONFIG.levelCap - data.level;
    if (remaining <= 0) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '通行证', message: '已达满级 120 级，无法继续购买' });
        return false;
    }
    count = Math.min(count, remaining);
    var cost = count * PASS_CONFIG.precoinPerLevel;
    if (getPreCoinBalance() < cost) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '通行证', message: 'PRE Coin 不足，需要 ' + cost + ' 枚' });
        return false;
    }
    if (spendPreCoin(cost, '购买通行证等级 ×' + count) && typeof shopAddExternalSpend === 'function') {
        shopAddExternalSpend(cost); // 计入商店「累计消费」统计
    }
    data.purchasedLevels += count;
    savePassData(data);
    // 每级 10 经验 -> 直接调 passAddExp
    passAddExp(count * PASS_CONFIG.expPerLevel, '购买等级');
    if (typeof showToast === 'function') showToast({ type: 'success', title: '通行证', message: '购买成功，' + count + ' 级已添加' });
    return true;
}

// 购买付费通行证
// 返回值：null = 失败；对象 = 成功 { kind: 'premium' }（无即时物品，由结算弹窗展示解锁提示）
function passBuyPremium() {
    if (_isPassSeasonLocked()) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '通行证', message: _getPassLockedMessage('购买付费通行证') });
        return null;
    }
    var data = getPassData();
    if (data.isPremium) {
        if (typeof showToast === 'function') showToast({ type: 'info', title: '通行证', message: '你已拥有付费通行证' });
        return null;
    }
    if (getPreCoinBalance() < PASS_CONFIG.premiumCost) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '通行证', message: 'PRE Coin 不足，需要 ' + PASS_CONFIG.premiumCost + ' 枚' });
        return null;
    }
    if (spendPreCoin(PASS_CONFIG.premiumCost, '购买付费通行证') && typeof shopAddExternalSpend === 'function') {
        shopAddExternalSpend(PASS_CONFIG.premiumCost); // 计入商店「累计消费」统计
    }
    data.isPremium = true;
    savePassData(data);
    return { kind: 'premium' };
}

// 购买通行证组合包（含通行证本体全部内容 + 立即获得 10 级/经验值补给卡Ⅳ×2/PRE Coin 补给包Ⅳ×1/第一赛季纪念徽章）
// 返回值：null = 失败；对象 = 成功 { kind: 'bundle', items, bonusLevels, alreadyPremium }
function passBuyBundle() {
    if (_isPassSeasonLocked()) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '通行证', message: _getPassLockedMessage('购买通行证组合包') });
        return null;
    }
    var data = getPassData();
    if (data.hasBundle) {
        if (typeof showToast === 'function') showToast({ type: 'info', title: '通行证', message: '你已拥有通行证组合包' });
        return null;
    }
    // 已购买通行证本体时不享受 8 折优惠，按原价购买
    var price = _getBundlePrice();
    if (getPreCoinBalance() < price) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '通行证', message: 'PRE Coin 不足，需要 ' + price + ' 枚' });
        return null;
    }
    var wasPremium = !!data.isPremium;
    if (spendPreCoin(price, '购买通行证组合包') && typeof shopAddExternalSpend === 'function') {
        shopAddExternalSpend(price); // 计入商店「累计消费」统计
    }
    data.isPremium = true;
    data.hasBundle = true;
    data.seasonBadgeOwned = true;
    savePassData(data);
    // 立即获得 10 级通行证等级（复用经验入账流程，自动同步等级相关赛季任务进度）
    passAddExp(10 * PASS_CONFIG.expPerLevel, '通行证组合包');
    // 立即获得物品（静默入账，汇总至结算弹窗）：经验值补给卡Ⅳ×2、PRE Coin 补给包Ⅳ×1、第一赛季纪念徽章
    var items = [];
    warehouseAddItem('exp_supply_4', 2, '通行证组合包奖励', true);
    _passCollectItem(items, 'exp_supply_4', 2);
    warehouseAddItem('precoin_supply_4', 1, '通行证组合包奖励', true);
    _passCollectItem(items, 'precoin_supply_4', 1);
    warehouseAddItem('season1_badge', 1, '通行证组合包奖励', true);
    _passCollectItem(items, 'season1_badge', 1);
    return { kind: 'bundle', items: items, bonusLevels: 10, alreadyPremium: wasPremium };
}

// ==================== 奖励收集（静默入账 + 汇总，供结算弹窗展示） ====================
// 向汇总结果中累加一件仓库物品（同 id 自动合并数量）
function _passCollectItem(bucket, itemId, qty) {
    var w = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS[itemId] : null;
    if (!w) return;
    qty = Math.max(1, parseInt(qty, 10) || 1);
    for (var i = 0; i < bucket.length; i++) {
        if (bucket[i].id === itemId) { bucket[i].qty += qty; return; }
    }
    bucket.push({ id: itemId, name: w.name, icon: w.icon, color: w.color, qty: qty });
}

// 领取等级奖励
// 返回值：null = 失败（已弹错误提示）；对象 = 成功并附带本次奖励明细 { levels, items, precoin }
function passClaimLevelReward(level) {
    level = parseInt(level, 10);
    if (_isPassSeasonLocked()) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '通行证', message: _getPassLockedMessage('领取奖励') });
        return null;
    }
    var data = getPassData();
    if (level < 1 || level > PASS_CONFIG.levelCap) return null;
    if (level > data.level) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '通行证', message: '等级未解锁' });
        return null;
    }
    var rewards = buildPassRewards();
    var reward = rewards[level - 1];

    var result = { levels: [], items: [], precoin: 0 };
    var claimedAny = false;

    // 免费奖励（仅 1 件物品，不含 PRE 硬币）
    if (!data.levelRewardClaimed[level]) {
        data.levelRewardClaimed[level] = true;
        warehouseAddItem(reward.freeItem.id, reward.freeItem.qty, '通行证 Lv.' + level + ' 免费奖励', true);
        _passCollectItem(result.items, reward.freeItem.id, reward.freeItem.qty);
        claimedAny = true;
    }

    // 付费奖励（2 件物品 + PRE 硬币，共 3 槽）
    if (data.isPremium && !data.premiumRewardClaimed[level]) {
        data.premiumRewardClaimed[level] = true;
        reward.premiumItems.forEach(function(it) {
            warehouseAddItem(it.id, it.qty, '通行证 Lv.' + level + ' 付费奖励', true);
            _passCollectItem(result.items, it.id, it.qty);
        });
        if (reward.premiumPrecoin) {
            addPreCoin(reward.premiumPrecoin, '通行证 Lv.' + level + ' PRE 硬币奖励', true);
            result.precoin += reward.premiumPrecoin;
        }
        claimedAny = true;
    }

    if (!claimedAny) {
        if (typeof showToast === 'function') showToast({ type: 'info', title: '通行证', message: '该等级奖励已领取' });
        return null;
    }

    result.levels.push(level);
    savePassData(data);
    return result;
}

// 一键领取全部可领取的等级奖励（免费 + 付费）
// 返回值：null = 失败；对象 = 本次全部奖励汇总 { levels, items, precoin }
function passClaimAllLevelRewards() {
    if (_isPassSeasonLocked()) {
        if (typeof showToast === 'function') showToast({ type: 'info', title: '通行证', message: _getPassLockedMessage('领取奖励') });
        return null;
    }
    var data = getPassData();
    var rewards = buildPassRewards();
    var result = { levels: [], items: [], precoin: 0 };

    for (var lv = 1; lv <= Math.min(data.level, PASS_CONFIG.levelCap); lv++) {
        var reward = rewards[lv - 1];
        var got = false;
        // 免费奖励（仅 1 件物品，不含 PRE 硬币）
        if (!data.levelRewardClaimed[lv]) {
            data.levelRewardClaimed[lv] = true;
            warehouseAddItem(reward.freeItem.id, reward.freeItem.qty, '通行证 Lv.' + lv + ' 免费奖励', true);
            _passCollectItem(result.items, reward.freeItem.id, reward.freeItem.qty);
            got = true;
        }
        // 付费奖励（2 件物品 + PRE 硬币）
        if (data.isPremium && !data.premiumRewardClaimed[lv]) {
            data.premiumRewardClaimed[lv] = true;
            reward.premiumItems.forEach(function(it) {
                warehouseAddItem(it.id, it.qty, '通行证 Lv.' + lv + ' 付费奖励', true);
                _passCollectItem(result.items, it.id, it.qty);
            });
            if (reward.premiumPrecoin) {
                addPreCoin(reward.premiumPrecoin, '通行证 Lv.' + lv + ' PRE 硬币奖励', true);
                result.precoin += reward.premiumPrecoin;
            }
            got = true;
        }
        if (got) result.levels.push(lv);
    }

    savePassData(data);

    if (result.levels.length === 0) {
        if (typeof showToast === 'function') showToast({ type: 'info', title: '通行证', message: '暂无可领取的等级奖励' });
        return null;
    }
    return result;
}

// ==================== 奖励结算弹窗 ====================
// 工具：hex 转 rgba
function _passHexToRgba(hex, alpha) {
    try {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    } catch (e) { return hex; }
}

// 展示奖励结算弹窗
// opts: { medalIcon, medalColor, title, subtitle, items:[{name,icon,color,qty}], precoin, bonusLevels, note }
function _showPassRewardModal(opts) {
    var overlay = document.getElementById('passRewardModal');
    if (!overlay) return;

    var medal = document.getElementById('passRewardMedal');
    if (medal) {
        medal.innerHTML = '<i class="fas ' + (opts.medalIcon || 'fa-gift') + '"></i>';
        medal.style.background = opts.medalColor ? _passHexToRgba(opts.medalColor, 0.16) : 'rgba(255,107,157,0.16)';
        medal.style.color = opts.medalColor || '#ff6b9d';
    }
    document.getElementById('passRewardTitle').textContent = opts.title || '获得奖励';
    document.getElementById('passRewardSubtitle').textContent = opts.subtitle || '';

    var body = document.getElementById('passRewardBody');
    var html = '';

    // 特殊卡：即时通行证等级（组合包）
    if (opts.bonusLevels) {
        html += '<div class="pass-reward-result-card pass-reward-result-level">' +
            '<div class="pass-reward-result-iconb" style="background:rgba(255,107,157,0.15);color:#ff6b9d;"><i class="fas fa-crown"></i></div>' +
            '<div class="pass-reward-result-name">通行证等级</div>' +
            '<div class="pass-reward-result-qty">+' + opts.bonusLevels + ' 级</div>' +
        '</div>';
    }

    // 仓库物品卡（聚合后的全部物品）
    (opts.items || []).forEach(function(it) {
        html += '<div class="pass-reward-result-card">' +
            '<div class="pass-reward-result-iconb" style="background:' + _passHexToRgba(it.color, 0.15) + ';color:' + it.color + ';"><i class="' + it.icon + '"></i></div>' +
            '<div class="pass-reward-result-name">' + it.name + '</div>' +
            '<div class="pass-reward-result-qty">×' + it.qty + '</div>' +
        '</div>';
    });

    // PRE 硬币卡
    if (opts.precoin > 0) {
        html += '<div class="pass-reward-result-card pass-reward-result-coin">' +
            '<div class="pass-reward-result-iconb" style="background:rgba(255,217,61,0.15);color:#ffd93d;"><i class="fas fa-coins"></i></div>' +
            '<div class="pass-reward-result-name">PRE 硬币</div>' +
            '<div class="pass-reward-result-qty">+' + opts.precoin + '</div>' +
        '</div>';
    }

    // 纯提示信息（如付费通行证本体解锁，无即时物品）
    if (opts.note) {
        html += '<div class="pass-reward-result-note"><i class="fas fa-circle-info"></i> ' + opts.note + '</div>';
    }

    body.innerHTML = html;
    overlay.style.display = 'flex';
}

function _closePassRewardModal() {
    var overlay = document.getElementById('passRewardModal');
    if (overlay) overlay.style.display = 'none';
}

// 领取等级奖励（单级 / 一键全部）成功后展示
function _showPassClaimResult(result) {
    var n = result.levels.length;
    var subtitle;
    if (n === 1) {
        subtitle = '已领取 Lv.' + result.levels[0] + ' 的全部奖励';
    } else {
        subtitle = '已一键领取 Lv.' + result.levels[0] + ' ~ Lv.' + result.levels[n - 1] + ' 共 ' + n + ' 个等级的全部奖励';
    }
    _showPassRewardModal({
        medalIcon: 'fa-gifts',
        medalColor: '#ff6b9d',
        title: '领取成功',
        subtitle: subtitle,
        items: result.items,
        precoin: result.precoin
    });
}

// 购买付费通行证本体成功后展示（无即时物品，仅解锁提示）
function _showPassPremiumResult() {
    _showPassRewardModal({
        medalIcon: 'fa-gem',
        medalColor: '#c084fc',
        title: '购买成功',
        subtitle: '付费通行证已解锁',
        items: [],
        note: '全部 120 级付费档位奖励已开放，请在等级达标后前往「赛季通行证」逐一领取。'
    });
}

// 购买通行证组合包成功后展示
function _showPassBundleResult(result) {
    _showPassRewardModal({
        medalIcon: 'fa-box-open',
        medalColor: '#f8b500',
        title: '组合包购买成功',
        subtitle: result.alreadyPremium ? '组合包专属豪礼已立即到账' : '付费通行证已同步解锁，组合包专属豪礼已立即到账',
        items: result.items,
        bonusLevels: result.bonusLevels
    });
}

// ==================== 开发者模式专属功能 ====================
// 检测开发者模式是否启用（与 account-settings 的 devModeData 存储保持一致）
function _isPassDevMode() {
    try {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var devModeData = JSON.parse(localStorage.getItem('devModeData') || '{}');
        var key = currentUser.username || '__global__';
        if (devModeData[key] && devModeData[key].enabled) return true;
        if (devModeData['__global__'] && devModeData['__global__'].enabled) return true;
        return false;
    } catch (e) { return false; }
}

// Dev 全部解禁开关：开启后无视赛季未开始/已结束的所有限制（购买/领取/任务）
var _passDevUnlockAll = false;

// 赛季状态：'not_started'（未开始）| 'active'（进行中）| 'ended'（已结束）
function _getPassSeasonState() {
    var now = Date.now();
    if (now < new Date(PASS_CONFIG.startTime).getTime()) return 'not_started';
    if (now >= new Date(PASS_CONFIG.endTime).getTime()) return 'ended';
    return 'active';
}

// 赛季是否处于锁定状态（未开始 或 已结束；Dev 全部解禁时视为已开启）
function _isPassSeasonLocked() {
    if (_passDevUnlockAll) return false;
    return _getPassSeasonState() !== 'active';
}

// 赛季锁定时的提示文案（区分未开始 / 已结束）
function _getPassLockedMessage(action) {
    var state = _getPassSeasonState();
    if (state === 'ended') return '赛季已结束，暂时无法' + action;
    return '赛季尚未开始，暂时无法' + action;
}

// Dev：切换全部解禁
function _togglePassDevUnlock() {
    _passDevUnlockAll = !_passDevUnlockAll;
    if (typeof showToast === 'function') {
        showToast({ type: 'info', title: '通行证 Dev', message: _passDevUnlockAll
            ? '已开启全部解禁：无视赛季未开始的购买/领取/任务限制'
            : '已关闭全部解禁：恢复赛季时间限制' });
    }
    renderPassUI();
}

// Dev：一键解锁所有通行证等级（仅将等级状态解锁至满级，不发放任何奖励物品）
function passDevUnlockAllLevels() {
    var data = getPassData();
    if (data.level >= PASS_CONFIG.levelCap) {
        if (typeof showToast === 'function') {
            showToast({ type: 'info', title: '通行证 Dev', message: '所有通行证等级均已解锁，无需重复操作' });
        }
        return false;
    }
    data.level = PASS_CONFIG.levelCap;
    data.exp = 0;
    // 同步赛季任务的等级进度
    data = ensureSeasonTasks(data);
    var reachMap = { s_reach30: 30, s_reach60: 60, s_reach90: 90, s_reach120: 120 };
    data.seasonTasks.forEach(function(st) {
        if (reachMap[st.id]) st.progress = Math.max(st.progress || 0, reachMap[st.id]);
    });
    savePassData(data);
    if (typeof showToast === 'function') {
        showToast({ type: 'success', title: '通行证 Dev', message: '已解锁全部 ' + PASS_CONFIG.levelCap + ' 级（仅解锁等级状态，奖励请手动领取）' });
    }
    return true;
}

// Dev：一键关闭所有通行证等级解锁状态（等级/经验/EX 溢出归零，清除领取记录；不扣除已获得的物品）
function passDevLockAllLevels() {
    var data = getPassData();
    var freeCount = Object.keys(data.levelRewardClaimed || {}).length;
    var premCount = Object.keys(data.premiumRewardClaimed || {}).length;
    if (!data.level && !data.exp && !(data.expOverflow > 0) &&
        !data.exFreeClaimed && !data.exPremiumClaimed && !freeCount && !premCount) {
        if (typeof showToast === 'function') {
            showToast({ type: 'info', title: '通行证 Dev', message: '当前没有已解锁的通行证等级，无需关闭' });
        }
        return false;
    }
    data.level = 0;
    data.exp = 0;
    data.expOverflow = 0;
    data.exFreeClaimed = 0;
    data.exPremiumClaimed = 0;
    data.levelRewardClaimed = {};
    data.premiumRewardClaimed = {};
    savePassData(data);
    if (typeof showToast === 'function') {
        showToast({ type: 'success', title: '通行证 Dev', message: '已关闭全部通行证等级解锁状态（等级与 EX 溢出归零，已获得的物品保留）' });
    }
    return true;
}

// Dev：重置通行证购买状态（通行证本体 + 通行证组合包）
// 仅清除购买标记，不返还 PRE Coin，不回收已领取的等级奖励与组合包物品
function passDevResetPurchase() {
    var data = getPassData();
    if (!data.isPremium && !data.hasBundle) {
        if (typeof showToast === 'function') {
            showToast({ type: 'info', title: '通行证 Dev', message: '当前未购买通行证本体或组合包，无需重置' });
        }
        return false;
    }
    data.isPremium = false;
    data.hasBundle = false;
    savePassData(data);
    if (typeof showToast === 'function') {
        showToast({ type: 'success', title: '通行证 Dev', message: '已重置通行证购买状态（本体与组合包），PRE Coin 不予返还' });
    }
    return true;
}

// Dev：设置通行证等级为指定值（0 ~ 9999；0~120 为正式等级，121 级起映射为 EX 溢出等级）
// 等级内经验归零；赛季任务「达到 X 级」进度仅上调同步，不回退
function passDevSetLevel(targetLevel) {
    var n = Math.floor(Number(targetLevel));
    if (isNaN(n)) return false;
    n = Math.max(0, Math.min(PASS_CONFIG.devLevelMax, n));
    var data = getPassData();
    data = ensureSeasonTasks(data);
    if (n <= PASS_CONFIG.levelCap) {
        // 正式等级段：直接写入等级，同时清空 EX 溢出经验，保证显示等级与设定值一致
        data.level = n;
        data.exp = 0;
        data.expOverflow = 0;
    } else {
        // EX 段：等级固定为满级，超出部分按每级 expPerLevel 点映射为溢出经验，沿用 EX 结算链路
        data.level = PASS_CONFIG.levelCap;
        data.exp = 0;
        data.expOverflow = (n - PASS_CONFIG.levelCap) * PASS_CONFIG.expPerLevel;
    }
    var reachMap = { s_reach30: 30, s_reach60: 60, s_reach90: 90, s_reach120: 120 };
    data.seasonTasks.forEach(function(st) {
        if (reachMap[st.id] && n >= reachMap[st.id]) st.progress = Math.max(st.progress || 0, reachMap[st.id]);
    });
    savePassData(data);
    return true;
}

// Dev：打开「修改通行证等级」弹窗（动态创建，挂载于通行证弹窗内）
function _openPassDevSetLevelModal() {
    if (!_passUI.overlay) return;
    var overlay = document.getElementById('passDevSetLevelModal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'pass-modal-overlay';
        overlay.id = 'passDevSetLevelModal';
        overlay.style.display = 'none';
        overlay.innerHTML =
            '<div class="pass-modal-box pass-modal-box-sm">' +
                '<div class="pass-modal-title">修改通行证等级</div>' +
                '<div class="pass-modal-subtitle">直接设定当前通行证等级（0 ~ ' + PASS_CONFIG.devLevelMax + '，121 级起为 EX 溢出等级，自然升级无上限）</div>' +
                '<div class="pass-modal-body">' +
                    '<div class="pass-buylevel-control">' +
                        '<button class="pass-btn pass-btn-mini pass-step-btn" id="passDevSetLevelMinus" type="button"><i class="fas fa-minus"></i></button>' +
                        '<input type="number" id="passDevSetLevelInput" class="pass-buylevel-input" min="0" max="' + PASS_CONFIG.devLevelMax + '" value="0">' +
                        '<button class="pass-btn pass-btn-mini pass-step-btn" id="passDevSetLevelPlus" type="button"><i class="fas fa-plus"></i></button>' +
                    '</div>' +
                    '<div class="pass-buylevel-info">' +
                        '<div class="pass-buylevel-row">' +
                            '<span>当前等级</span>' +
                            '<span id="passDevSetLevelCur">0</span>' +
                        '</div>' +
                        '<div class="pass-buylevel-row">' +
                            '<span>等级上限</span>' +
                            '<span>' + PASS_CONFIG.levelCap + '（EX 无上限）</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="pass-buylevel-warn" id="passDevSetLevelWarn" style="display:none;"></div>' +
                '</div>' +
                '<div class="pass-modal-footer">' +
                    '<button class="pass-btn pass-btn-disabled" id="passDevSetLevelCancel" type="button">取消</button>' +
                    '<button class="pass-btn pass-btn-primary" id="passDevSetLevelConfirm" type="button"><i class="fas fa-check"></i> 确认修改</button>' +
                '</div>' +
            '</div>';
        _passUI.overlay.appendChild(overlay);

        var input = overlay.querySelector('#passDevSetLevelInput');
        var warn = overlay.querySelector('#passDevSetLevelWarn');

        function _clampValue() {
            var n = parseInt(input.value, 10);
            if (isNaN(n)) n = 0;
            var max = PASS_CONFIG.devLevelMax;
            if (n > max) {
                n = max;
                warn.textContent = '调试等级不可超过上限 ' + max + ' 级，已自动调整';
                warn.style.display = 'block';
            } else if (n < 0) {
                n = 0;
                warn.textContent = '等级不可小于 0 级，已自动调整';
                warn.style.display = 'block';
            } else {
                warn.style.display = 'none';
            }
            input.value = n;
            return n;
        }

        overlay.querySelector('#passDevSetLevelMinus').addEventListener('click', function() {
            var n = parseInt(input.value, 10) || 0;
            input.value = Math.max(0, n - 1);
            _clampValue();
        });
        overlay.querySelector('#passDevSetLevelPlus').addEventListener('click', function() {
            var n = parseInt(input.value, 10) || 0;
            input.value = Math.min(PASS_CONFIG.devLevelMax, n + 1);
            _clampValue();
        });
        input.addEventListener('input', _clampValue);

        function _closeModal() { overlay.style.display = 'none'; }

        overlay.querySelector('#passDevSetLevelCancel').addEventListener('click', _closeModal);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) _closeModal();
        });
        overlay.querySelector('#passDevSetLevelConfirm').addEventListener('click', function() {
            var n = _clampValue();
            if (passDevSetLevel(n)) {
                _closeModal();
                if (typeof showToast === 'function') {
                    var msg = n > PASS_CONFIG.levelCap
                        ? '通行证等级已修改为 Lv.' + n + '（EX 溢出等级，等级内经验已归零）'
                        : '通行证等级已修改为 Lv.' + n + '（等级内经验已归零）';
                    showToast({ type: 'success', title: '通行证 Dev', message: msg });
                }
                renderPassUI();
            }
        });
    }

    // 每次打开同步当前等级（121 级起由 EX 溢出经验换算显示等级）
    var data = getPassData();
    var curDisplay = data.level >= PASS_CONFIG.levelCap
        ? PASS_CONFIG.levelCap + Math.floor((data.expOverflow || 0) / PASS_CONFIG.expPerLevel)
        : data.level;
    overlay.querySelector('#passDevSetLevelInput').value = curDisplay;
    overlay.querySelector('#passDevSetLevelCur').textContent = curDisplay;
    overlay.querySelector('#passDevSetLevelWarn').style.display = 'none';
    overlay.style.display = 'flex';
}

// Dev：打开「重置通行证购买状态」确认弹窗（必须点击确定才执行重置）
function _openPassDevResetPurchaseModal() {
    var overlay = document.getElementById('passDevResetPurchaseModal');
    if (overlay) overlay.style.display = 'flex';
}

function _closePassDevResetPurchaseModal() {
    var overlay = document.getElementById('passDevResetPurchaseModal');
    if (overlay) overlay.style.display = 'none';
}

// Dev：一键完成全部日常/周常/赛季任务（进度拉满，不自动领取经验）
// 注意：任务列表按「任务池」全量渲染（日常7/周常7/赛季10），
// 而日常/周常每期仅随机抽取5个入库，赛季任务也可能因版本更新缺失条目，
// 因此这里必须以任务池为准遍历，缺失条目自动补建，确保界面上所有任务都被拉满。
function passDevCompleteAllTasks() {
    var data = getPassData();
    data = refreshDailyTasks(data);
    data = refreshWeeklyTasks(data);
    data = ensureSeasonTasks(data);

    var completed = 0;
    [
        { pool: PASS_DAILY_TASK_POOL, arr: data.dailyTasks },
        { pool: PASS_WEEKLY_TASK_POOL, arr: data.weeklyTasks },
        { pool: buildSeasonTasks(), arr: data.seasonTasks }
    ].forEach(function(group) {
        group.pool.forEach(function(def) {
            // 在入库数组中查找该任务条目，找不到则补建（覆盖未抽中的日常/周常、版本新增的赛季任务）
            var entry = null;
            for (var i = 0; i < group.arr.length; i++) {
                if (group.arr[i].id === def.id) { entry = group.arr[i]; break; }
            }
            if (!entry) {
                entry = { id: def.id, progress: 0, claimed: false };
                group.arr.push(entry);
            }
            // 未达目标的计为本次完成；无论是否已达标，统一强制拉满（兼容异常进度值）
            if ((entry.progress || 0) < def.target) completed++;
            entry.progress = def.target;
        });
    });

    savePassData(data);
    if (typeof showToast === 'function') {
        showToast({ type: 'success', title: '通行证 Dev', message: '已将全部日常/周常/赛季任务进度拉满（' + completed + ' 个任务本次完成），经验需手动领取' });
    }
    return true;
}

// Dev：一键重置日常/周常/赛季任务（进度清零、领取状态清空，不扣除已获得的经验值）
// 同样以任务池为准遍历，确保界面上展示的所有任务条目状态都被重置。
function passDevResetAllTasks() {
    var data = getPassData();
    data = refreshDailyTasks(data);
    data = refreshWeeklyTasks(data);
    data = ensureSeasonTasks(data);

    [
        { pool: PASS_DAILY_TASK_POOL, arr: data.dailyTasks },
        { pool: PASS_WEEKLY_TASK_POOL, arr: data.weeklyTasks },
        { pool: buildSeasonTasks(), arr: data.seasonTasks }
    ].forEach(function(group) {
        group.pool.forEach(function(def) {
            var entry = null;
            for (var i = 0; i < group.arr.length; i++) {
                if (group.arr[i].id === def.id) { entry = group.arr[i]; break; }
            }
            if (!entry) {
                entry = { id: def.id, progress: 0, claimed: false };
                group.arr.push(entry);
                return;
            }
            entry.progress = 0;
            entry.claimed = false;
        });
    });

    savePassData(data);
    if (typeof showToast === 'function') {
        showToast({ type: 'success', title: '通行证 Dev', message: '已重置全部任务进度与领取状态（已获得的经验值保留）' });
    }
    return true;
}

// 一键领取全部 EX 溢出奖励（每 10 溢出经验为 1 级，每级免费 +50、付费额外 +100 PRE Coin）
function passClaimExReward() {
    if (_isPassSeasonLocked()) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '通行证', message: _getPassLockedMessage('领取奖励') });
        return false;
    }
    var data = getPassData();
    if (data.level < PASS_CONFIG.levelCap) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '通行证', message: '需要先达到满级 120 级' });
        return false;
    }
    // EX 奖励按溢出经验每 10 发一次，一键领取当前全部可领等级
    var earnedFreeEx = Math.floor(data.expOverflow / PASS_CONFIG.expPerLevel);
    var pending = earnedFreeEx - data.exFreeClaimed;
    if (pending <= 0) {
        if (typeof showToast === 'function') showToast({ type: 'info', title: '通行证', message: '暂无可领取的 EX 溢出奖励' });
        return false;
    }
    var fromLevel = PASS_CONFIG.levelCap + data.exFreeClaimed + 1;   // 本次领取的起始 EX 等级
    var toLevel = PASS_CONFIG.levelCap + earnedFreeEx;               // 本次领取的结束 EX 等级
    // 按可领等级数一次性发放
    data.exFreeClaimed += pending;
    var freeCoins = PASS_CONFIG.exFreePrecoin * pending;
    addPreCoin(freeCoins, '通行证 EX 溢出免费奖励', true);
    var total = freeCoins;
    if (data.isPremium) {
        data.exPremiumClaimed += pending;
        var premCoins = PASS_CONFIG.exPremiumPrecoin * pending;
        addPreCoin(premCoins, '通行证 EX 溢出付费奖励', true);
        total += premCoins;
    }
    savePassData(data);
    _showPassExClaimResult({
        levels: pending,
        fromLevel: fromLevel,
        toLevel: toLevel,
        precoin: total,
        isPremium: !!data.isPremium
    });
    return true;
}

// 一键领取 EX 溢出奖励成功后展示（奖励弹窗，不使用提示横条）
function _showPassExClaimResult(r) {
    var note = r.isPremium
        ? '免费档位 +' + PASS_CONFIG.exFreePrecoin + ' × ' + r.levels + ' 级，付费档位 +' + PASS_CONFIG.exPremiumPrecoin + ' × ' + r.levels + ' 级'
        : '免费档位 +' + PASS_CONFIG.exFreePrecoin + ' × ' + r.levels + ' 级，解锁付费通行证可获取每级额外 PRE Coin';
    _showPassRewardModal({
        medalIcon: 'fa-infinity',
        medalColor: '#4ecdc4',
        title: '领取成功',
        subtitle: r.levels === 1
            ? '已领取 Lv.' + r.fromLevel + '（EX 溢出等级）的溢出奖励'
            : '已一键领取 Lv.' + r.fromLevel + ' ~ Lv.' + r.toLevel + ' 共 ' + r.levels + ' 级 EX 溢出奖励',
        items: [],
        precoin: r.precoin,
        note: note
    });
}

// 任务进度更新（通用入口，其他模块调用此函数）
// taskType: 'daily' | 'weekly' | 'season'
// taskId: 任务 id
// increment: 增量
function passUpdateTaskProgress(taskType, taskId, increment) {
    if (_isPassSeasonLocked()) return false;
    increment = parseInt(increment, 10) || 1;
    var data = getPassData();
    data = refreshDailyTasks(data);
    data = refreshWeeklyTasks(data);
    data = ensureSeasonTasks(data);

    var pool = taskType === 'daily' ? PASS_DAILY_TASK_POOL
             : taskType === 'weekly' ? PASS_WEEKLY_TASK_POOL
             : buildSeasonTasks();
    var arr = taskType === 'daily' ? data.dailyTasks
           : taskType === 'weekly' ? data.weeklyTasks
           : data.seasonTasks;
    var def = null;
    for (var i = 0; i < pool.length; i++) {
        if (pool[i].id === taskId) { def = pool[i]; break; }
    }
    if (!def) return false;
    var entry = null;
    for (var j = 0; j < arr.length; j++) {
        if (arr[j].id === taskId) { entry = arr[j]; break; }
    }
    if (!entry) return false;
    if (entry.claimed) return false;
    entry.progress = Math.min(def.target, (entry.progress || 0) + increment);
    savePassData(data);
    return { progress: entry.progress, target: def.target, complete: entry.progress >= def.target };
}

// 领取任务经验奖励
function passClaimTask(taskType, taskId) {
    if (_isPassSeasonLocked()) {
        var state = _getPassSeasonState();
        if (typeof showToast === 'function') showToast({ type: 'error', title: '任务', message: state === 'ended' ? '赛季已结束，任务暂未开放' : '赛季尚未开始，任务暂未开放' });
        return false;
    }
    var data = getPassData();
    data = refreshDailyTasks(data);
    data = refreshWeeklyTasks(data);
    data = ensureSeasonTasks(data);

    var pool = taskType === 'daily' ? PASS_DAILY_TASK_POOL
             : taskType === 'weekly' ? PASS_WEEKLY_TASK_POOL
             : buildSeasonTasks();
    var arr = taskType === 'daily' ? data.dailyTasks
           : taskType === 'weekly' ? data.weeklyTasks
           : data.seasonTasks;
    var def = null;
    for (var i = 0; i < pool.length; i++) {
        if (pool[i].id === taskId) { def = pool[i]; break; }
    }
    if (!def) return false;
    var entry = null;
    for (var j = 0; j < arr.length; j++) {
        if (arr[j].id === taskId) { entry = arr[j]; break; }
    }
    if (!entry) return false;
    if (entry.claimed) return false;
    if ((entry.progress || 0) < def.target) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '任务', message: '进度未完成' });
        return false;
    }
    entry.claimed = true;
    savePassData(data);
    passAddExp(def.exp, '完成' + (taskType === 'daily' ? '日常' : taskType === 'weekly' ? '周常' : '赛季') + '任务：' + def.title);
    return true;
}

// ==================== 便捷：计算满级进度 ====================
function passGetProgress() {
    var data = getPassData();
    var atCap = data.level >= PASS_CONFIG.levelCap;
    // 满级后每攒满 expPerLevel 点溢出经验即提升 1 级 EX 等级（121、122……无自然上限）
    var exLevel = atCap ? Math.floor((data.expOverflow || 0) / PASS_CONFIG.expPerLevel) : 0;
    var exInLevel = atCap ? ((data.expOverflow || 0) % PASS_CONFIG.expPerLevel) : 0;
    return {
        level: data.level,
        displayLevel: atCap ? PASS_CONFIG.levelCap + exLevel : data.level,
        exp: data.exp,
        expNeeded: PASS_CONFIG.expPerLevel,
        isPremium: data.isPremium,
        // 满级后经验条继续展示当前 EX 等级内的进度（0~expPerLevel）
        percent: atCap
            ? Math.floor((exInLevel / PASS_CONFIG.expPerLevel) * 100)
            : Math.floor((data.exp / PASS_CONFIG.expPerLevel) * 100),
        levelPercent: Math.min(100, Math.floor((data.level / PASS_CONFIG.levelCap) * 100)),
        atCap: atCap,
        exLevel: exLevel,
        exInLevel: exInLevel,
        exOverflow: data.expOverflow,
        exEarnedCount: exLevel,
        exClaimedCount: data.exFreeClaimed
    };
}

// ==================== 全局暴露 ====================
window.pass = {
    config: PASS_CONFIG,
    buildRewards: buildPassRewards,
    getData: getPassData,
    saveData: savePassData,
    addExp: passAddExp,
    buyLevel: passBuyLevel,
    buyPremium: passBuyPremium,
    buyBundle: passBuyBundle,
    claimLevelReward: passClaimLevelReward,
    claimAllLevelRewards: passClaimAllLevelRewards,
    isDevMode: _isPassDevMode,
    devUnlockAllLevels: passDevUnlockAllLevels,
    devLockAllLevels: passDevLockAllLevels,
    devSetLevel: passDevSetLevel,
    devResetPurchase: passDevResetPurchase,
    devCompleteAllTasks: passDevCompleteAllTasks,
    devResetAllTasks: passDevResetAllTasks,
    devToggleUnlockAll: _togglePassDevUnlock,
    claimExReward: passClaimExReward,
    updateTask: passUpdateTaskProgress,
    claimTask: passClaimTask,
    // 赛季是否处于进行中（供每日签到等外部模块判断是否发放通行证固定奖励）
    // Dev「全部解禁」开启时，即使真实赛季时间未到，也视为赛季已开启（正常赛季时间不变）
    isSeasonActive: function() { return _getPassSeasonState() === 'active' || _passDevUnlockAll; },
    getSeasonState: _getPassSeasonState,
    getProgress: passGetProgress,
    openUI: openPassUI,
    closeUI: closePassUI,
    refreshUI: renderPassUI
};

// ==================== 通行证 UI 弹窗 ====================

var _passUI = {
    overlay: null,
    content: null,
    particleCanvas: null,
    lenis: null,
    threeScene: null,
    threeCamera: null,
    threeRenderer: null,
    threeParticles: null,
    animFrame: null,
    activeTab: 'rewards',   // rewards | tasks
    activeSubTab: 'daily',  // daily | weekly | season
    isAnimating: false
};

// 注入全屏弹窗 HTML
function _buildPassHTML() {
    var cfg = PASS_CONFIG;
    return `
<div id="passOverlay" class="pass-overlay" style="display:none;">
    <canvas id="passParticleBg" class="pass-particle-bg"></canvas>
    <div class="pass-glow pass-glow-tl"></div>
    <div class="pass-glow pass-glow-br"></div>

    <div class="pass-container">
        <!-- ===== Header ===== -->
        <div class="pass-header">
            <div class="pass-header-left">
                <div class="pass-logo-wrap">
                    <i class="fas fa-crown pass-logo-icon"></i>
                </div>
                <div class="pass-title-group">
                    <div class="pass-title-cn">${cfg.name}</div>
                    <div class="pass-title-en">${cfg.nameEn}</div>
                </div>
                <div class="pass-badge pass-badge-live" id="passSeasonBadge">
                    <i class="fas fa-circle"></i> 进行中
                </div>
                <div class="pass-season-time">
                    <div class="pass-season-time-item">
                        <i class="fas fa-play"></i>
                        <span class="pass-season-time-label">起始</span>
                        <span class="pass-season-time-value" id="passStartTime">2026-09-21 19:00</span>
                    </div>
                    <i class="fas fa-ellipsis pass-season-time-sep"></i>
                    <div class="pass-season-time-item">
                        <i class="fas fa-flag-checkered"></i>
                        <span class="pass-season-time-label">结束</span>
                        <span class="pass-season-time-value" id="passEndTime">2026-12-21 17:00</span>
                    </div>
                    <i class="fas fa-ellipsis pass-season-time-sep"></i>
                    <div class="pass-season-time-item pass-season-days-left" id="passSeasonDaysLeft">
                        <i class="fas fa-hourglass-half"></i>
                        <span class="pass-season-time-label" id="passSeasonDaysLeftLabel">剩余</span>
                        <span class="pass-season-time-value" id="passSeasonDaysLeftVal">--</span>
                    </div>
                </div>
            </div>
            <div class="pass-header-right">
                <button class="pass-close-btn" id="passCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>

        <!-- ===== Hero 进度条 ===== -->
        <div class="pass-hero">
            <div class="pass-hero-left">
                <div class="pass-level-ring" id="passLevelRing">
                    <svg class="pass-ring-svg" viewBox="0 0 120 120">
                        <circle class="pass-ring-bg" cx="60" cy="60" r="54"></circle>
                        <circle class="pass-ring-fg" cx="60" cy="60" r="54" id="passRingFg"></circle>
                    </svg>
                    <div class="pass-level-text">
                        <div class="pass-level-num" id="passLevelNum">0</div>
                        <div class="pass-level-label">等级</div>
                    </div>
                </div>
                <div class="pass-exp-block">
                    <div class="pass-exp-label">经验值</div>
                    <div class="pass-exp-bar">
                        <div class="pass-exp-fill" id="passExpFill"></div>
                        <div class="pass-exp-glow"></div>
                    </div>
                    <div class="pass-exp-text" id="passExpText">0 / 10</div>
                    <div class="pass-ex-info" id="passExInfo" style="display:none;">
                        <i class="fas fa-infinity"></i> EX 溢出：<span id="passExVal">0</span> 级（每 10 经验 +1 级，无上限）
                        <button class="pass-btn pass-btn-mini" id="passBtnClaimEx"><i class="fas fa-gift"></i> 一键领取</button>
                    </div>
                </div>
            </div>
            <div class="pass-hero-right">
                <div class="pass-hero-stats">
                    <div class="pass-stat">
                        <div class="pass-stat-num" id="passStatPrecoin" style="color:#ffd93d;">0</div>
                        <div class="pass-stat-label"><i class="fas fa-coins"></i> PRE Coin</div>
                    </div>
                    <div class="pass-stat">
                        <div class="pass-stat-num" id="passStatCap">120</div>
                        <div class="pass-stat-label">等级上限</div>
                    </div>
                    <div class="pass-stat">
                        <div class="pass-stat-num" id="passStatPremium">免费</div>
                        <div class="pass-stat-label">当前档位</div>
                    </div>
                </div>
                <div class="pass-buy-panel">
                    <div class="pass-buy-row">
                        <button class="pass-btn pass-btn-primary" id="passBtnBuyLevel"><i class="fas fa-arrow-up"></i> 购买等级</button>
                        <button class="pass-btn pass-btn-premium-ghost" id="passBtnBuyPremium" style="display:none;"><i class="fas fa-gem"></i> 解锁付费通行证</button>
                    </div>
                    <div class="pass-buy-hint">每级 <b>300</b> PRE Coin · 付费通行证 <b>6480</b> PRE Coin</div>
                </div>
            </div>
        </div>

        <!-- ===== Tabs ===== -->
        <div class="pass-tabs">
            <div class="pass-tab active" data-tab="rewards" id="passTabRewards">
                <i class="fas fa-trophy"></i> 赛季通行证
            </div>
            <div class="pass-tab" data-tab="tasks" id="passTabTasks">
                <i class="fas fa-list-check"></i> 通行证任务
                <span class="pass-tab-dot" id="passTaskDot" style="display:none;"></span>
            </div>
            <!-- 右侧工具组：滚动提示 + 全部领取 + 开发者调试多级菜单（不占用内容区高度） -->
            <div class="pass-tabs-right">
                <div class="pass-reward-scroll-hint" id="passScrollHint"><i class="fas fa-arrows-left-right"></i> 左右滑动查看更多等级奖励</div>
                <button class="pass-btn pass-btn-primary" id="passBtnClaimAll"><i class="fas fa-gifts"></i> 全部领取</button>
                <div class="pass-dev-menu" id="passDevMenu" style="display:none;">
                    <button class="pass-btn pass-btn-dev" id="passDevMenuBtn" type="button">
                        <i class="fas fa-code"></i> 开发者调试 <i class="fas fa-chevron-down pass-dev-menu-caret"></i>
                    </button>
                    <div class="pass-dev-dropdown" id="passDevDropdown">
                        <div class="pass-dev-dropdown-title"><i class="fas fa-screwdriver-wrench"></i> 通行证调试功能</div>
                        <button class="pass-dev-item" type="button" data-dev-action="unlockLevels">
                            <i class="fas fa-lock-open pass-dev-item-icon"></i>
                            <span class="pass-dev-item-label">一键解锁所有通行证等级</span>
                        </button>
                        <button class="pass-dev-item" type="button" data-dev-action="lockLevels">
                            <i class="fas fa-lock pass-dev-item-icon"></i>
                            <span class="pass-dev-item-label">一键关闭所有等级解锁状态</span>
                        </button>
                        <button class="pass-dev-item" type="button" data-dev-action="completeTasks">
                            <i class="fas fa-bolt pass-dev-item-icon"></i>
                            <span class="pass-dev-item-label">一键完成日常/周常/赛季任务</span>
                        </button>
                        <button class="pass-dev-item" type="button" data-dev-action="resetTasks">
                            <i class="fas fa-rotate-left pass-dev-item-icon"></i>
                            <span class="pass-dev-item-label">一键重置日常/周常/赛季任务</span>
                        </button>
                        <button class="pass-dev-item" type="button" data-dev-action="setLevel">
                            <i class="fas fa-pen pass-dev-item-icon"></i>
                            <span class="pass-dev-item-label">修改通行证等级</span>
                        </button>
                        <button class="pass-dev-item" type="button" data-dev-action="resetPurchase">
                            <i class="fas fa-eraser pass-dev-item-icon"></i>
                            <span class="pass-dev-item-label">重置通行证购买状态</span>
                        </button>
                        <div class="pass-dev-dropdown-divider"></div>
                        <button class="pass-dev-item pass-dev-item-toggle" type="button" data-dev-action="unlockSeason">
                            <i class="fas fa-unlock pass-dev-item-icon"></i>
                            <span class="pass-dev-item-label">全部解禁（无视赛季时间限制）</span>
                            <i class="fas fa-circle-check pass-dev-item-state"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ===== Content ===== -->
        <div class="pass-content-scroll" id="passContentScroll">
            <!-- 奖励视图 -->
            <div class="pass-view" id="passViewRewards">
                <div class="pass-rewards-grid" id="passRewardsGrid"></div>
            </div>
            <!-- 任务视图 -->
            <div class="pass-view pass-view-hidden" id="passViewTasks">
                <div class="pass-subtabs">
                    <div class="pass-subtab active" data-sub="daily"><i class="fas fa-sun"></i> 日常</div>
                    <div class="pass-subtab" data-sub="weekly"><i class="fas fa-calendar-week"></i> 周常</div>
                    <div class="pass-subtab" data-sub="season"><i class="fas fa-mountain"></i> 赛季</div>
                    <div class="pass-refresh-hint" id="passRefreshHint"><i class="fas fa-clock"></i> <span id="passRefreshHintText"></span></div>
                </div>
                <div class="pass-tasks-list" id="passTasksList"></div>
            </div>
        </div>

        <!-- ===== Footer hint ===== -->
        <div class="pass-footer-hint">
            <span> 第一赛季通行证「初始化」 ————  Season 1 PRE Pass「Initialize」</span>
        </div>
    </div>

    <!-- ===== 购买等级弹窗 ===== -->
    <div class="pass-modal-overlay" id="passBuyLevelModal" style="display:none;">
        <div class="pass-modal-box">
            <div class="pass-modal-title">购买通行证等级</div>
            <div class="pass-modal-subtitle">输入想要提升的等级数（不可超过当前剩余等级）</div>
            <div class="pass-modal-body">
                <div class="pass-buylevel-control">
                    <button class="pass-btn pass-btn-mini pass-step-btn" id="passStepMinus"><i class="fas fa-minus"></i></button>
                    <input type="number" id="passBuyLevelInput" class="pass-buylevel-input" min="1" value="1">
                    <button class="pass-btn pass-btn-mini pass-step-btn" id="passStepPlus"><i class="fas fa-plus"></i></button>
                </div>
                <div class="pass-buylevel-info">
                    <div class="pass-buylevel-row">
                        <span>当前等级</span>
                        <span id="passBuyCurLevel">0</span>
                    </div>
                    <div class="pass-buylevel-row">
                        <span>剩余可购买</span>
                        <span id="passBuyMaxLevel">120</span>
                    </div>
                    <div class="pass-buylevel-row pass-buylevel-cost">
                        <span>所需 PRE Coin</span>
                        <span><span id="passBuyCostNum">300</span> <i class="fas fa-coins" style="color:#ffd93d;"></i></span>
                    </div>
                </div>
                <div class="pass-buylevel-warn" id="passBuyLevelWarn" style="display:none;"></div>
            </div>
            <div class="pass-modal-footer">
                <button class="pass-btn pass-btn-disabled" id="passBuyLevelCancel">取消</button>
                <button class="pass-btn pass-btn-primary" id="passBuyLevelConfirm"><i class="fas fa-check"></i> 确定</button>
            </div>
        </div>
    </div>

    <!-- ===== 购买等级二次确认弹窗 ===== -->
    <div class="pass-modal-overlay" id="passBuyLevelConfirmModal" style="display:none;">
        <div class="pass-modal-box pass-modal-box-sm">
            <div class="pass-modal-title">确认购买</div>
            <div class="pass-modal-body pass-confirm-body">
                <div class="pass-confirm-icon"><i class="fas fa-coins"></i></div>
                <div class="pass-confirm-text" id="passBuyLevelConfirmText">是否确认购买？</div>
            </div>
            <div class="pass-modal-footer">
                <button class="pass-btn pass-btn-disabled" id="passBuyLevelConfirmCancel">取消</button>
                <button class="pass-btn pass-btn-primary" id="passBuyLevelConfirmOk"><i class="fas fa-check"></i> 确认购买</button>
            </div>
        </div>
    </div>

    <!-- ===== 购买付费通行证弹窗 ===== -->
    <div class="pass-modal-overlay" id="passBuyPremiumModal" style="display:none;">
        <div class="pass-modal-box pass-modal-box-lg">
            <div class="pass-modal-title">购买付费通行证</div>
            <div class="pass-modal-subtitle">购买后即可解锁全部付费档位奖励</div>
            <div class="pass-modal-body">
                <div class="pass-premium-intro">
                    是否要花费 <b>6480 PRE 硬币</b> 购买付费通行证？<br>
                    购买通行证后您将陆续获得以下福利：
                </div>
                <div class="pass-premium-items" id="passPremiumItemsList"></div>
                <div class="pass-premium-cost">总计：6480 <i class="fas fa-coins" style="color:#ffd93d;"></i> PRE Coin</div>
            </div>
            <div class="pass-modal-footer">
                <button class="pass-btn pass-btn-disabled" id="passBuyPremiumCancel">取消</button>
                <button class="pass-btn pass-btn-premium-ghost" id="passBuyPremiumConfirm"><i class="fas fa-gem"></i> 确认购买</button>
            </div>
        </div>
    </div>

    <!-- ===== 购买方式选择弹窗 ===== -->
    <div class="pass-modal-overlay" id="passPurchaseSelectModal" style="display:none;">
        <div class="pass-modal-box pass-modal-box-xl">
            <div class="pass-modal-title">是否要进行购买？</div>
            <div class="pass-modal-subtitle">我们为您提供了以下两种组合方式</div>
            <div class="pass-modal-body pass-select-body">
                <button class="pass-select-card" id="passSelectBody">
                    <div class="pass-select-icon"><i class="fas fa-gem"></i></div>
                    <div class="pass-select-info">
                        <div class="pass-select-name">第一赛季「初始化」通行证本体</div>
                        <div class="pass-select-desc">解锁全部 120 级付费档位奖励，福利陆续领取</div>
                    </div>
                    <div class="pass-select-price" id="passSelectBodyPrice"><span class="pass-select-price-num">6480</span> <i class="fas fa-coins"></i></div>
                </button>
                <button class="pass-select-card pass-select-card-bundle" id="passSelectBundle">
                    <div class="pass-select-icon"><i class="fas fa-box-open"></i></div>
                    <div class="pass-select-info">
                        <div class="pass-select-name">第一赛季「初始化」通行证组合包 <span class="pass-select-tag" id="passSelectBundleTag">限时 8 折</span></div>
                        <div class="pass-select-desc">通行证本体 + 立即获得 10 级、经验值补给卡Ⅳ×2、PRE Coin 补给包Ⅳ×1、第一赛季纪念徽章</div>
                    </div>
                    <div class="pass-select-price" id="passSelectBundlePrice"></div>
                </button>
            </div>
            <div class="pass-modal-footer">
                <button class="pass-btn pass-btn-disabled" id="passPurchaseSelectCancel">取消</button>
            </div>
        </div>
    </div>

    <!-- ===== 购买通行证组合包弹窗 ===== -->
    <div class="pass-modal-overlay" id="passBuyBundleModal" style="display:none;">
        <div class="pass-modal-box pass-modal-box-lg">
            <div class="pass-modal-title">购买通行证组合包</div>
            <div class="pass-modal-subtitle">一次购齐通行证本体全部内容与专属豪礼</div>
            <div class="pass-modal-body">
                <div class="pass-premium-intro">
                    购买通行证组合包后，您除了可以直接获取通行证本体内容，您还将立即获得10级的通行证等级，以及两张经验值补给卡 Ⅳ和一份PRE Coin 补给包 Ⅳ，此外还可获得一个新的徽章为「第一赛季纪念徽章」，此徽章可展示在您的用户名片内
                </div>
                <div class="pass-bundle-extras" id="passBundleExtras"></div>
                <div class="pass-premium-intro">以下为通行证本体包含的全部付费档位奖励（购买后陆续领取）：</div>
                <div class="pass-premium-items" id="passBundleItemsList"></div>
                <div class="pass-premium-cost" id="passBundleCost"></div>
            </div>
            <div class="pass-modal-footer">
                <button class="pass-btn pass-btn-disabled" id="passBuyBundleCancel">取消</button>
                <button class="pass-btn pass-btn-premium-ghost" id="passBuyBundleConfirm"><i class="fas fa-gem"></i> 确认购买</button>
            </div>
        </div>
    </div>

    <!-- ===== Dev：重置通行证购买状态确认弹窗 ===== -->
    <div class="pass-modal-overlay" id="passDevResetPurchaseModal" style="display:none;">
        <div class="pass-modal-box pass-modal-box-sm">
            <div class="pass-modal-title">重置通行证购买状态</div>
            <div class="pass-modal-body pass-confirm-body">
                <div class="pass-confirm-icon pass-confirm-icon-danger"><i class="fas fa-triangle-exclamation"></i></div>
                <div class="pass-confirm-text">
                    是否要重置通行证的购买状态？<br>
                    （通行证本体及其通行证组合包）<br>
                    <span class="pass-confirm-danger">开发者模式下重置通行证后不返还 PRE Coin</span>
                </div>
            </div>
            <div class="pass-modal-footer">
                <button class="pass-btn pass-btn-disabled" id="passDevResetPurchaseCancel">取消</button>
                <button class="pass-btn pass-btn-danger" id="passDevResetPurchaseOk"><i class="fas fa-check"></i> 确定</button>
            </div>
        </div>
    </div>

    <!-- ===== 奖励结算弹窗（领取等级奖励 / 购买通行证后统一展示获得物品） ===== -->
    <div class="pass-modal-overlay" id="passRewardModal" style="display:none;">
        <div class="pass-modal-box pass-modal-box-rewards">
            <div class="pass-reward-result-head">
                <div class="pass-reward-result-medal" id="passRewardMedal"><i class="fas fa-gift"></i></div>
                <div class="pass-reward-result-headtext">
                    <div class="pass-modal-title" id="passRewardTitle">领取奖励</div>
                    <div class="pass-modal-subtitle" id="passRewardSubtitle"></div>
                </div>
            </div>
            <div class="pass-modal-body pass-reward-result-body" id="passRewardBody"></div>
            <div class="pass-modal-footer pass-reward-result-footer">
                <button class="pass-btn pass-btn-primary" id="passRewardOk"><i class="fas fa-check"></i> 确定</button>
            </div>
        </div>
    </div>
</div>
    `;
}

function openPassUI() {
    if (_passUI.overlay) {
        _passUI.overlay.style.display = 'flex';
        // 恢复粒子动画
        _passUI._particleRunning = true;
        // 重新渲染最新数据
        renderPassUI();
        _animatePassEnter();
        return;
    }

    // 首次创建
    document.body.insertAdjacentHTML('beforeend', _buildPassHTML());
    _passUI.overlay = document.getElementById('passOverlay');
    _passUI.content = _passUI.overlay.querySelector('.pass-container');
    _passUI._particleRunning = true;

    _initPassParticles();
    _bindPassEvents();
    _initPassLenis();
    renderPassUI();
    _animatePassEnter();
}

function closePassUI() {
    if (!_passUI.overlay) return;
    // 暂停粒子动画，释放 GPU
    _passUI._particleRunning = false;
    _animatePassExit(function() {
        _passUI.overlay.style.display = 'none';
    });
}

function _animatePassEnter() {
    if (typeof gsap === 'undefined') {
        _passUI.overlay.style.display = 'flex';
        return;
    }
    if (_passUI.isAnimating) return;
    _passUI.isAnimating = true;

    gsap.fromTo(_passUI.overlay, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo('.pass-container', { scale: 0.92, y: 40, opacity: 0 }, {
        scale: 1, y: 0, opacity: 1,
        duration: 0.6, ease: 'back.out(1.3)', delay: 0.05
    });
    gsap.fromTo('.pass-header', { y: -20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.15
    });
    gsap.fromTo('.pass-hero', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.25
    });
    gsap.fromTo('.pass-tabs', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.35
    });

    setTimeout(function() { _passUI.isAnimating = false; }, 700);
}

function _animatePassExit(done) {
    if (typeof gsap === 'undefined') { done && done(); return; }
    gsap.to('.pass-container', { scale: 0.95, y: 30, opacity: 0, duration: 0.35, ease: 'power2.in' });
    gsap.to(_passUI.overlay, { opacity: 0, duration: 0.3, delay: 0.1 });
    setTimeout(done || function(){}, 450);
}

// ==================== Three.js 粒子背景 ====================
function _initPassParticles() {
    try {
        if (typeof THREE === 'undefined') return;
        var canvas = document.getElementById('passParticleBg');
        if (!canvas) return;

        _passUI.threeScene = new THREE.Scene();
        var w = canvas.offsetWidth || window.innerWidth;
        var h = canvas.offsetHeight || window.innerHeight;
        _passUI.threeCamera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
        _passUI.threeCamera.position.z = 50;
        _passUI.threeRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        _passUI.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        _passUI.threeRenderer.setSize(w, h, false);

        // 粒子（精简：40 粒 + 低透明度 + 慢速旋转，避免卡顿与遮挡 UI）
        var geo = new THREE.BufferGeometry();
        var count = 40;
        var positions = new Float32Array(count * 3);
        var colors = new Float32Array(count * 3);
        var palette = [
            new THREE.Color('#ff6b9d'),
            new THREE.Color('#c44569'),
            new THREE.Color('#f8b500'),
            new THREE.Color('#6a5acd'),
            new THREE.Color('#00cec9')
        ];
        for (var i = 0; i < count; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
            var c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3 + 0] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        var mat = new THREE.PointsMaterial({
            size: 0.35,
            vertexColors: true,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        _passUI.threeParticles = new THREE.Points(geo, mat);
        _passUI.threeScene.add(_passUI.threeParticles);

        // 动画循环（节流 + 可暂停，避免关闭后仍占用 GPU）
        var startTime = Date.now();
        var frameCounter = 0;
        function tick() {
            _passUI.animFrame = requestAnimationFrame(tick);
            if (!_passUI._particleRunning) return; // 暂停时跳过重绘
            frameCounter++;
            if (frameCounter % 3 !== 0) return; // 每 3 帧渲染一次（≈20fps）
            var t = (Date.now() - startTime) * 0.00008;
            _passUI.threeParticles.rotation.y = t * 0.3;
            _passUI.threeParticles.rotation.x = t * 0.1;
            _passUI.threeRenderer.render(_passUI.threeScene, _passUI.threeCamera);
        }
        tick();

        // Resize
        window.addEventListener('resize', function() {
            if (!_passUI.threeRenderer) return;
            var c = document.getElementById('passParticleBg');
            if (!c) return;
            var ww = c.offsetWidth || window.innerWidth;
            var hh = c.offsetHeight || window.innerHeight;
            _passUI.threeRenderer.setSize(ww, hh, false);
            _passUI.threeCamera.aspect = ww / hh;
            _passUI.threeCamera.updateProjectionMatrix();
        });
    } catch (e) {
        console.warn('[Pass] Three.js particle init failed:', e.message);
    }
}

// ==================== 滚动（使用原生滚动，避免 Lenis 导致卡顿） ====================
function _initPassLenis() {
    // 保留函数占位，使用浏览器原生滚动以保证流畅度
    return;
}

// ==================== 事件绑定 ====================
function _bindPassEvents() {
    // 关闭
    document.getElementById('passCloseBtn').addEventListener('click', closePassUI);
    _passUI.overlay.addEventListener('click', function(e) {
        if (e.target === _passUI.overlay) closePassUI();
    });
    document.addEventListener('keydown', _passEscHandler = function(e) {
        if (e.key !== 'Escape' || !_passUI.overlay || _passUI.overlay.style.display === 'none') return;
        // 开发者调试菜单展开时，Esc 优先收起菜单而非关闭整个通行证
        var devMenuEl = document.getElementById('passDevMenu');
        if (devMenuEl && devMenuEl.classList.contains('pass-dev-menu-open')) {
            devMenuEl.classList.remove('pass-dev-menu-open');
            return;
        }
        closePassUI();
    });

    // Tab 切换（切换时收起开发者调试菜单）
    document.getElementById('passTabRewards').addEventListener('click', function() { if (_passUI._closeDevMenu) _passUI._closeDevMenu(); _switchPassTab('rewards'); });
    document.getElementById('passTabTasks').addEventListener('click', function() { if (_passUI._closeDevMenu) _passUI._closeDevMenu(); _switchPassTab('tasks'); });

    // 子 tab
    _passUI.overlay.querySelectorAll('.pass-subtab').forEach(function(st) {
        st.addEventListener('click', function() {
            if (_passUI._closeDevMenu) _passUI._closeDevMenu();
            _switchPassSubTab(this.getAttribute('data-sub'));
        });
    });

    // 购买等级（打开弹窗）
    document.getElementById('passBtnBuyLevel').addEventListener('click', function() {
        _openBuyLevelModal();
    });

    // 购买等级弹窗：输入框实时计算
    var buyInput = document.getElementById('passBuyLevelInput');
    buyInput.addEventListener('input', _updateBuyLevelCost);
    document.getElementById('passStepMinus').addEventListener('click', function() {
        var n = parseInt(buyInput.value, 10) || 1;
        n = Math.max(1, n - 1);
        buyInput.value = n;
        _updateBuyLevelCost();
    });
    document.getElementById('passStepPlus').addEventListener('click', function() {
        var n = parseInt(buyInput.value, 10) || 1;
        var max = PASS_CONFIG.levelCap - getPassData().level;
        n = Math.min(max, n + 1);
        buyInput.value = n;
        _updateBuyLevelCost();
    });
    document.getElementById('passBuyLevelCancel').addEventListener('click', _closeBuyLevelModal);
    document.getElementById('passBuyLevelConfirm').addEventListener('click', _openBuyLevelConfirm);

    // 二次确认弹窗
    document.getElementById('passBuyLevelConfirmCancel').addEventListener('click', _closeBuyLevelConfirmModal);
    document.getElementById('passBuyLevelConfirmOk').addEventListener('click', function() {
        var n = parseInt(buyInput.value, 10) || 1;
        _closeBuyLevelConfirmModal();
        _closeBuyLevelModal();
        if (passBuyLevel(n)) renderPassUI();
    });

    // 购买付费通行证（打开弹窗）
    document.getElementById('passBtnBuyPremium').addEventListener('click', _openPurchaseSelectModal);
    document.getElementById('passPurchaseSelectCancel').addEventListener('click', _closePurchaseSelectModal);
    document.getElementById('passSelectBody').addEventListener('click', function() {
        if (this.classList.contains('pass-select-owned')) return;
        _closePurchaseSelectModal();
        _openBuyPremiumModal();
    });
    document.getElementById('passSelectBundle').addEventListener('click', function() {
        _closePurchaseSelectModal();
        _openBuyBundleModal();
    });
    document.getElementById('passBuyPremiumCancel').addEventListener('click', _closeBuyPremiumModal);
    document.getElementById('passBuyPremiumConfirm').addEventListener('click', function() {
        var result = passBuyPremium();
        if (result) {
            _closeBuyPremiumModal();
            renderPassUI();
            _showPassPremiumResult();
        }
    });
    document.getElementById('passBuyBundleCancel').addEventListener('click', _closeBuyBundleModal);
    document.getElementById('passBuyBundleConfirm').addEventListener('click', function() {
        var result = passBuyBundle();
        if (result) {
            _closeBuyBundleModal();
            renderPassUI();
            _showPassBundleResult(result);
        }
    });

    // 奖励结算弹窗：确定按钮 / 点击遮罩关闭
    document.getElementById('passRewardOk').addEventListener('click', _closePassRewardModal);
    document.getElementById('passRewardModal').addEventListener('click', function(e) {
        if (e.target === this) _closePassRewardModal();
    });

    // Dev：重置通行证购买状态确认弹窗（取消 / 确定 / 点击遮罩关闭）
    document.getElementById('passDevResetPurchaseCancel').addEventListener('click', _closePassDevResetPurchaseModal);
    document.getElementById('passDevResetPurchaseOk').addEventListener('click', function() {
        if (passDevResetPurchase()) {
            _closePassDevResetPurchaseModal();
            renderPassUI();
        }
    });
    document.getElementById('passDevResetPurchaseModal').addEventListener('click', function(e) {
        if (e.target === this) _closePassDevResetPurchaseModal();
    });

    // 点击遮罩关闭所有弹窗
    ['passBuyLevelModal', 'passBuyLevelConfirmModal', 'passBuyPremiumModal', 'passPurchaseSelectModal', 'passBuyBundleModal'].forEach(function(id) {
        var m = document.getElementById(id);
        if (m) m.addEventListener('click', function(e) {
            if (e.target === this) this.style.display = 'none';
        });
    });

    // EX 奖励
    document.getElementById('passBtnClaimEx').addEventListener('click', function() {
        if (passClaimExReward()) renderPassUI();
    });

    // 全部领取（一键领取所有可领取的等级奖励）
    document.getElementById('passBtnClaimAll').addEventListener('click', function() {
        var result = passClaimAllLevelRewards();
        renderPassUI();
        if (result) _showPassClaimResult(result);
    });

    // Dev 功能：「开发者调试」多级菜单（整合全部通行证调试操作）
    var passDevMenu = document.getElementById('passDevMenu');
    var passDevMenuBtn = document.getElementById('passDevMenuBtn');
    var passDevDropdown = document.getElementById('passDevDropdown');

    function _setPassDevMenuOpen(open) {
        if (!passDevMenu) return;
        passDevMenu.classList.toggle('pass-dev-menu-open', open);
    }

    if (passDevMenuBtn) {
        passDevMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            _setPassDevMenuOpen(!passDevMenu.classList.contains('pass-dev-menu-open'));
        });
    }
    if (passDevDropdown) {
        passDevDropdown.addEventListener('click', function(e) {
            var item = e.target.closest('.pass-dev-item');
            if (!item) return;
            var action = item.getAttribute('data-dev-action');
            var acted = true;
            if (action === 'unlockLevels') passDevUnlockAllLevels();
            else if (action === 'lockLevels') passDevLockAllLevels();
            else if (action === 'completeTasks') passDevCompleteAllTasks();
            else if (action === 'resetTasks') passDevResetAllTasks();
            else if (action === 'setLevel') _openPassDevSetLevelModal();
            else if (action === 'resetPurchase') _openPassDevResetPurchaseModal();
            else if (action === 'unlockSeason') _togglePassDevUnlock();
            else acted = false;
            _setPassDevMenuOpen(false);
            if (acted) renderPassUI();
        });
    }
    // 点击菜单外部 / 切换 Tab 时关闭
    document.addEventListener('click', function(e) {
        if (passDevMenu && passDevMenu.classList.contains('pass-dev-menu-open') && !passDevMenu.contains(e.target)) {
            _setPassDevMenuOpen(false);
        }
    });
    _passUI._closeDevMenu = function() { _setPassDevMenuOpen(false); };

    // 奖励区：鼠标滚轮横向滚动
    var rewardsGrid = document.getElementById('passRewardsGrid');
    // 滚动期间给 overlay 加 pass-scrolling 类，暂停光晕/脉冲等无限动画，停止后恢复
    var _passScrollTimer = null;
    function _markPassScrolling() {
        var ov = document.querySelector('.pass-overlay');
        if (!ov) return;
        ov.classList.add('pass-scrolling');
        clearTimeout(_passScrollTimer);
        _passScrollTimer = setTimeout(function() { ov.classList.remove('pass-scrolling'); }, 180);
    }
    if (rewardsGrid) {
        rewardsGrid.addEventListener('wheel', function(e) {
            // 当内容可横向滚动时，将纵向滚轮转为横向滚动
            if (this.scrollWidth > this.clientWidth + 2) {
                e.preventDefault();
                var delta = e.deltaY;
                this.scrollLeft += delta;
            }
        }, { passive: false });
        rewardsGrid.addEventListener('scroll', _markPassScrolling, { passive: true });
    }
    var passContentScroll = document.querySelector('.pass-content-scroll');
    if (passContentScroll) passContentScroll.addEventListener('scroll', _markPassScrolling, { passive: true });
}

var _passEscHandler = null;

// ==================== 购买等级弹窗控制 ====================
function _openBuyLevelModal() {
    var data = getPassData();
    var max = PASS_CONFIG.levelCap - data.level;
    if (max <= 0) {
        if (typeof showToast === 'function') showToast({ type: 'info', title: '通行证', message: '已达满级，无需购买' });
        return;
    }
    document.getElementById('passBuyCurLevel').textContent = data.level;
    document.getElementById('passBuyMaxLevel').textContent = max;
    var input = document.getElementById('passBuyLevelInput');
    input.value = 1;
    input.max = max;
    _updateBuyLevelCost();
    document.getElementById('passBuyLevelModal').style.display = 'flex';
}

function _closeBuyLevelModal() {
    document.getElementById('passBuyLevelModal').style.display = 'none';
}

function _updateBuyLevelCost() {
    var input = document.getElementById('passBuyLevelInput');
    var max = PASS_CONFIG.levelCap - getPassData().level;
    var n = parseInt(input.value, 10) || 1;
    n = Math.max(1, Math.min(max, n));
    input.value = n;
    var cost = n * PASS_CONFIG.precoinPerLevel;
    document.getElementById('passBuyCostNum').textContent = cost;

    var warn = document.getElementById('passBuyLevelWarn');
    var balance = getPreCoinBalance();
    if (cost > balance) {
        warn.textContent = 'PRE Coin 不足，当前余额：' + balance + ' 枚';
        warn.style.display = 'block';
    } else {
        warn.style.display = 'none';
    }
}

function _openBuyLevelConfirm() {
    var input = document.getElementById('passBuyLevelInput');
    var n = parseInt(input.value, 10) || 1;
    var max = PASS_CONFIG.levelCap - getPassData().level;
    if (n < 1 || n > max) {
        _updateBuyLevelCost();
        return;
    }
    var cost = n * PASS_CONFIG.precoinPerLevel;
    document.getElementById('passBuyLevelConfirmText').innerHTML =
        '将花费 <b style="color:#ffd93d;">' + cost + ' PRE Coin</b> 购买 <b style="color:#ff6b9d;">' + n + ' 级</b> 通行证等级，是否确认？';
    document.getElementById('passBuyLevelConfirmModal').style.display = 'flex';
}

function _closeBuyLevelConfirmModal() {
    document.getElementById('passBuyLevelConfirmModal').style.display = 'none';
}

// ==================== 购买付费通行证弹窗控制 ====================
// 汇总全部付费档位物品清单（本体购买弹窗与组合包弹窗共用）
function _buildPremiumItemsHTML() {
    var rewards = buildPassRewards();
    var itemMap = {};
    rewards.forEach(function(r) {
        r.premiumItems.forEach(function(it) {
            if (!itemMap[it.id]) {
                itemMap[it.id] = { id: it.id, name: it.name, icon: it.icon, color: it.color, totalQty: 0 };
            }
            itemMap[it.id].totalQty += it.qty;
        });
    });
    var html = '';
    Object.keys(itemMap).forEach(function(id) {
        var it = itemMap[id];
        html += '<div class="pass-premium-item">' +
            '<i class="' + it.icon + '" style="color:' + it.color + ';"></i>' +
            '<span class="pass-premium-item-name">' + it.name + '</span>' +
            '<span class="pass-premium-item-qty">×' + it.totalQty + '</span>' +
            '</div>';
    });
    return html;
}

// 组合包实付价格：未购买本体享优惠价 10368，已购买本体按原价 12900
function _getBundlePrice() {
    var data = getPassData();
    return data.isPremium ? PASS_CONFIG.bundlePrice : (PASS_CONFIG.bundleDiscountPrice || Math.round(PASS_CONFIG.bundlePrice * PASS_CONFIG.bundleDiscountRate));
}

function _openBuyPremiumModal() {
    var list = document.getElementById('passPremiumItemsList');
    if (list) list.innerHTML = _buildPremiumItemsHTML();
    document.getElementById('passBuyPremiumModal').style.display = 'flex';
}

function _closeBuyPremiumModal() {
    document.getElementById('passBuyPremiumModal').style.display = 'none';
}

// ==================== 购买方式选择弹窗控制 ====================
function _openPurchaseSelectModal() {
    var data = getPassData();
    // 本体卡片：已拥有时置灰并标注
    var bodyCard = document.getElementById('passSelectBody');
    var bodyPrice = document.getElementById('passSelectBodyPrice');
    if (data.isPremium) {
        bodyCard.classList.add('pass-select-owned');
        bodyPrice.innerHTML = '<span class="pass-select-owned-tag">已拥有</span>';
    } else {
        bodyCard.classList.remove('pass-select-owned');
        bodyPrice.innerHTML = '<span class="pass-select-price-num">' + PASS_CONFIG.premiumCost + '</span> <i class="fas fa-coins"></i>';
    }
    // 组合包卡片：未购买本体时展示 8 折优惠价（划线原价），已购买本体按原价
    var bundleTag = document.getElementById('passSelectBundleTag');
    var bundlePrice = document.getElementById('passSelectBundlePrice');
    if (data.isPremium) {
        if (bundleTag) bundleTag.style.display = 'none';
        bundlePrice.innerHTML = '<span class="pass-select-price-num">' + PASS_CONFIG.bundlePrice + '</span> <i class="fas fa-coins"></i>';
    } else {
        if (bundleTag) bundleTag.style.display = '';
        bundlePrice.innerHTML = '<span class="pass-price-original">' + PASS_CONFIG.bundlePrice + '</span>' +
            '<span class="pass-select-price-num">' + _getBundlePrice() + '</span> <i class="fas fa-coins"></i>';
    }
    document.getElementById('passPurchaseSelectModal').style.display = 'flex';
}

function _closePurchaseSelectModal() {
    document.getElementById('passPurchaseSelectModal').style.display = 'none';
}

// ==================== 购买通行证组合包弹窗控制 ====================
function _openBuyBundleModal() {
    var W = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS : {};
    function exItem(id, fallbackName, fallbackIcon, fallbackColor) {
        return {
            icon: W[id] ? W[id].icon : fallbackIcon,
            color: W[id] ? W[id].color : fallbackColor,
            name: W[id] ? W[id].name : fallbackName
        };
    }
    var extras = [
        { icon: 'fas fa-arrow-up', color: '#4ade80', name: '通行证等级', qty: '+10 级' },
        (function() { var it = exItem('exp_supply_4', '经验值补给卡Ⅳ', 'fas fa-sun', '#a78bfa'); it.qty = '×2'; return it; })(),
        (function() { var it = exItem('precoin_supply_4', 'PRE Coin 补给包Ⅳ', 'fas fa-wallet', '#ffd93d'); it.qty = '×1'; return it; })(),
        { icon: 'fas fa-rocket', color: '#ff6b9d', name: '第一赛季纪念徽章', qty: '×1' }
    ];
    var extrasHtml = '';
    extras.forEach(function(ex) {
        extrasHtml += '<div class="pass-bundle-extra">' +
            '<i class="' + ex.icon + '" style="color:' + ex.color + ';"></i>' +
            '<span class="pass-bundle-extra-name">' + ex.name + '</span>' +
            '<span class="pass-bundle-extra-qty">' + ex.qty + '</span>' +
            '</div>';
    });
    var extrasBox = document.getElementById('passBundleExtras');
    if (extrasBox) extrasBox.innerHTML = extrasHtml;

    // 通行证本体付费物品清单（与本体购买弹窗一致）
    var list = document.getElementById('passBundleItemsList');
    if (list) list.innerHTML = _buildPremiumItemsHTML();

    // 价格展示：未购本体享 8 折（划线原价 + 折扣标签），已购本体按原价
    var data = getPassData();
    var costEl = document.getElementById('passBundleCost');
    if (data.isPremium) {
        costEl.innerHTML = '通行证本体已拥有，组合包按原价购买 · 总计：' + PASS_CONFIG.bundlePrice + ' <i class="fas fa-coins" style="color:#ffd93d;"></i> PRE Coin';
    } else {
        costEl.innerHTML = '<span class="pass-price-original">原价 ' + PASS_CONFIG.bundlePrice + '</span>' +
            '<span class="pass-price-discount-tag">限时 8 折</span>' +
            '总计：' + _getBundlePrice() + ' <i class="fas fa-coins" style="color:#ffd93d;"></i> PRE Coin';
    }
    document.getElementById('passBuyBundleModal').style.display = 'flex';
}

function _closeBuyBundleModal() {
    document.getElementById('passBuyBundleModal').style.display = 'none';
}

function _switchPassTab(tab) {
    _passUI.activeTab = tab;
    document.getElementById('passTabRewards').classList.toggle('active', tab === 'rewards');
    document.getElementById('passTabTasks').classList.toggle('active', tab === 'tasks');
    document.getElementById('passViewRewards').classList.toggle('pass-view-hidden', tab !== 'rewards');
    document.getElementById('passViewTasks').classList.toggle('pass-view-hidden', tab !== 'tasks');
    // 滚动提示仅奖励页显示
    var scrollHint = document.getElementById('passScrollHint');
    if (scrollHint) scrollHint.style.display = tab === 'tasks' ? 'none' : '';
    if (tab === 'tasks') {
        _switchPassSubTab(_passUI.activeSubTab);
    }
}

function _switchPassSubTab(sub) {
    _passUI.activeSubTab = sub;
    _passUI.overlay.querySelectorAll('.pass-subtab').forEach(function(st) {
        st.classList.toggle('active', st.getAttribute('data-sub') === sub);
    });
    renderPassUI();
}

// ==================== 主渲染函数 ====================
function renderPassUI() {
    if (!_passUI.overlay || _passUI.overlay.style.display === 'none') return;
    var data = getPassData();
    var prog = passGetProgress();

    // 赛季时间（UTC+8）
    var startEl = document.getElementById('passStartTime');
    var endEl = document.getElementById('passEndTime');
    if (startEl && endEl) {
        // UTC+8 显示
        var fmtUTC8 = function(iso) {
            var d = new Date(new Date(iso).getTime() + 8 * 3600 * 1000);
            var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
            return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate())
                 + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
        };
        startEl.textContent = fmtUTC8(PASS_CONFIG.startTime) + ' UTC+8';
        endEl.textContent = fmtUTC8(PASS_CONFIG.endTime) + ' UTC+8';
    }

    // 赛季剩余天数标签（未开始/已结束显示状态文案）
    var daysLeftVal = document.getElementById('passSeasonDaysLeftVal');
    var daysLeftLabel = document.getElementById('passSeasonDaysLeftLabel');
    if (daysLeftVal && daysLeftLabel) {
        var seasonStateNow = _getPassSeasonState();
        if (seasonStateNow === 'not_started') {
            daysLeftLabel.textContent = '状态';
            daysLeftVal.textContent = '赛季未开始';
        } else if (seasonStateNow === 'ended') {
            daysLeftLabel.textContent = '状态';
            daysLeftVal.textContent = '已结束';
        } else {
            var msLeft = new Date(PASS_CONFIG.endTime).getTime() - Date.now();
            var daysLeftNum = Math.max(0, Math.ceil(msLeft / 86400000));
            daysLeftLabel.textContent = '剩余';
            daysLeftVal.textContent = '本赛季剩余 ' + daysLeftNum + ' 天';
        }
    }

    // 顶部 Hero
    var ring = document.getElementById('passRingFg');
    if (ring) {
        var circumference = 2 * Math.PI * 54;
        ring.style.strokeDasharray = circumference;
        var progressFrac = data.level >= PASS_CONFIG.levelCap ? 1 : data.level / PASS_CONFIG.levelCap;
        ring.style.strokeDashoffset = circumference * (1 - progressFrac);
    }
    document.getElementById('passLevelNum').textContent = prog.displayLevel;
    document.getElementById('passExpFill').style.width = prog.percent + '%';
    document.getElementById('passExpText').textContent = prog.atCap
        ? 'EX ' + prog.exInLevel + ' / ' + PASS_CONFIG.expPerLevel
        : data.exp + ' / ' + PASS_CONFIG.expPerLevel;

    // EX 信息
    var exInfo = document.getElementById('passExInfo');
    if (prog.atCap) {
        exInfo.style.display = 'inline-flex';
        document.getElementById('passExVal').textContent = prog.exEarnedCount;
    } else {
        exInfo.style.display = 'none';
    }

    // 满级后等级上限统计改为「∞ · EX 无上限」，正式等级段显示 levelCap
    var capStatNum = document.getElementById('passStatCap');
    if (capStatNum) {
        capStatNum.textContent = prog.atCap ? '∞' : PASS_CONFIG.levelCap;
        var capStatLabel = capStatNum.parentElement.querySelector('.pass-stat-label');
        if (capStatLabel) capStatLabel.textContent = prog.atCap ? 'EX 无上限' : '等级上限';
    }

    document.getElementById('passStatPremium').textContent = data.isPremium ? '付费' : '免费';

    // 右上角 PRE Coin 余额（领取奖励等操作后随 renderPassUI 同步刷新）
    var precoinStatNum = document.getElementById('passStatPrecoin');
    if (precoinStatNum) {
        precoinStatNum.textContent = (typeof getPreCoinBalance === 'function') ? getPreCoinBalance() : 0;
    }

    // 赛季状态：徽章显示「未开始 / 进行中 / 已结束」，锁定购买等级与解锁付费通行证按钮
    var seasonLocked = _isPassSeasonLocked();
    var seasonState = _getPassSeasonState();
    var badge = document.getElementById('passSeasonBadge');
    if (badge) {
        if (seasonState === 'active') {
            badge.className = 'pass-badge pass-badge-live';
            badge.innerHTML = '<i class="fas fa-circle"></i> 进行中';
        } else if (seasonState === 'ended') {
            badge.className = 'pass-badge pass-badge-ended';
            badge.innerHTML = '<i class="fas fa-circle"></i> 已结束';
        } else {
            badge.className = 'pass-badge pass-badge-wait';
            badge.innerHTML = '<i class="fas fa-circle"></i> 未开始';
        }
    }
    var buyLevelBtn = document.getElementById('passBtnBuyLevel');
    if (prog.atCap) {
        // 满级（含 EX 溢出阶段）：购买等级入口永久替换为不可点的「已满级」
        buyLevelBtn.className = 'pass-btn pass-btn-disabled';
        buyLevelBtn.disabled = true;
        buyLevelBtn.innerHTML = '<i class="fas fa-lock"></i> 已满级';
    } else {
        buyLevelBtn.className = 'pass-btn ' + (seasonLocked ? 'pass-btn-disabled' : 'pass-btn-primary');
        buyLevelBtn.disabled = seasonLocked;
        buyLevelBtn.innerHTML = '<i class="fas fa-arrow-up"></i> 购买等级';
    }
    var premiumBtn = document.getElementById('passBtnBuyPremium');
    premiumBtn.className = 'pass-btn ' + (seasonLocked ? 'pass-btn-disabled' : 'pass-btn-premium-ghost');
    premiumBtn.disabled = seasonLocked;
    if (data.hasBundle) {
        // 组合包已购买：本体与组合包均已拥有，隐藏购买入口
        premiumBtn.style.display = 'none';
    } else {
        premiumBtn.style.display = '';
        // 已购本体未购组合包：按钮改为组合包购买入口（按原价，无 8 折优惠）
        premiumBtn.innerHTML = data.isPremium
            ? '<i class="fas fa-box-open"></i> 购买通行证组合包'
            : '<i class="fas fa-gem"></i> 解锁付费通行证';
    }

    // 开发者模式：显示/隐藏「开发者调试」多级菜单，并同步「全部解禁」开关的激活状态
    var devOn = _isPassDevMode();
    var devMenuEl = document.getElementById('passDevMenu');
    if (devMenuEl) devMenuEl.style.display = devOn ? '' : 'none';
    var devUnlockItem = document.querySelector('#passDevDropdown [data-dev-action="unlockSeason"]');
    if (devUnlockItem) {
        devUnlockItem.classList.toggle('pass-dev-item-on', _passDevUnlockAll);
        var stateIcon = devUnlockItem.querySelector('.pass-dev-item-state');
        if (stateIcon) stateIcon.title = _passDevUnlockAll ? '当前已开启' : '当前已关闭';
    }
    var devMenuBtn = document.getElementById('passDevMenuBtn');
    if (devMenuBtn) devMenuBtn.classList.toggle('pass-btn-dev-active', _passDevUnlockAll);
    if (!devOn && devMenuEl) devMenuEl.classList.remove('pass-dev-menu-open');

    // 滚动提示仅在有奖励内容时显示（任务页 / 赛季锁定时隐藏）
    var scrollHint = document.getElementById('passScrollHint');
    if (scrollHint) scrollHint.style.display = (_passUI.activeTab === 'tasks' || seasonLocked) ? 'none' : '';

    // 奖励网格
    _renderPassRewards(data);

    // 任务
    _renderPassTasks(data);
}

// ==================== 奖励网格渲染 ====================
function _renderPassRewards(data) {
    var grid = document.getElementById('passRewardsGrid');
    if (!grid) return;
    var rewards = buildPassRewards();
    var html = '';
    var claimableLevels = 0;
    var seasonLocked = _isPassSeasonLocked();
    var seasonState = _getPassSeasonState();

    // 赛季未开始 / 已结束：不渲染等级卡片，改为展示横条提示（Dev 全部解禁时不受影响）
    if (seasonLocked) {
        var fmtUTC8 = function(iso) {
            var d = new Date(new Date(iso).getTime() + 8 * 3600 * 1000);
            var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
            return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate())
                 + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
        };
        var bannerIcon, bannerTitle, bannerDesc, bannerClass;
        if (seasonState === 'ended') {
            bannerIcon = 'fa-flag-checkered';
            bannerTitle = '当前赛季已经结束';
            bannerDesc = '通行证等级奖励不可领取，请等待下一赛季开启';
            bannerClass = 'pass-season-banner pass-season-banner-ended';
        } else {
            bannerIcon = 'fa-hourglass-half';
            bannerTitle = '当前赛季暂未开始';
            bannerDesc = '请等待赛季开启，开启时间为 ' + fmtUTC8(PASS_CONFIG.startTime) + ' (UTC+8)';
            bannerClass = 'pass-season-banner pass-season-banner-wait';
        }
        grid.innerHTML = '<div class="' + bannerClass + '">' +
            '<i class="fas ' + bannerIcon + '"></i>' +
            '<div class="pass-season-banner-text">' +
                '<div class="pass-season-banner-title">' + bannerTitle + '</div>' +
                '<div class="pass-season-banner-desc">' + bannerDesc + '</div>' +
            '</div>' +
        '</div>';
        // 隐藏「全部领取」按钮
        var claimAllBtn = document.getElementById('passBtnClaimAll');
        if (claimAllBtn) {
            claimAllBtn.classList.remove('pass-btn-primary');
            claimAllBtn.classList.add('pass-btn-disabled');
            claimAllBtn.disabled = true;
            claimAllBtn.innerHTML = '<i class="fas fa-gifts"></i> 全部领取';
        }
        return;
    }

    // 6 段滚动锚点，每 20 级一组，当前等级所在的组高亮
    for (var i = 0; i < rewards.length; i++) {
        var r = rewards[i];
        var isLocked = r.level > data.level;
        var freeClaimed = !!data.levelRewardClaimed[r.level];
        var premClaimed = !!data.premiumRewardClaimed[r.level];
        var canClaimFree = !isLocked && !seasonLocked && !freeClaimed;
        var canClaimPrem = !isLocked && !seasonLocked && data.isPremium && !premClaimed;
        if (canClaimFree || canClaimPrem) claimableLevels++;
        var cardClass = 'pass-reward-card';
        if (isLocked || seasonLocked) cardClass += ' pass-card-locked';
        else if (canClaimFree || canClaimPrem) cardClass += ' pass-card-claimable';
        else cardClass += ' pass-card-claimed';

        // 底部按钮文案
        var btnText;
        if (canClaimFree || canClaimPrem) {
            btnText = '<i class="fas fa-gift"></i> 领取奖励';
        } else if (freeClaimed && data.isPremium) {
            btnText = '<i class="fas fa-check-double"></i> 已领取';
        } else if (seasonLocked) {
            btnText = '<i class="fas fa-lock"></i> 赛季未开始';
        } else {
            btnText = '<i class="fas fa-lock"></i> 解锁后可领';
        }

        html += `
<div class="${cardClass}" data-level="${r.level}">
    <div class="pass-level-badge">Lv.${r.level}</div>
    <div class="pass-reward-tiers">
        <!-- 免费挡位条目（仅 1 件物品） -->
        <div class="pass-tier pass-tier-free ${freeClaimed ? 'pass-tier-claimed' : ''} ${canClaimFree ? 'pass-tier-claimable' : ''}">
            <div class="pass-tier-head">
                <span class="pass-tier-tag"><i class="fas fa-gift"></i> 免费</span>
                ${freeClaimed
                    ? '<span class="pass-tier-state"><i class="fas fa-check"></i> 已领取</span>'
                    : (canClaimFree
                        ? '<span class="pass-tier-state pass-tier-state-ready">可领取</span>'
                        : (seasonLocked ? '<span class="pass-tier-state"><i class="fas fa-lock"></i> 赛季未开始</span>' : ''))}
            </div>
            <div class="pass-slot pass-slot-clickable ${freeClaimed ? 'pass-slot-claimed' : ''}" data-item-id="${r.freeItem.id}" data-item-qty="${r.freeItem.qty}" title="点击查看物品详情">
                <i class="${r.freeItem.icon}" style="color:${r.freeItem.color};"></i>
                <div class="pass-slot-name">${r.freeItem.name}</div>
                <div class="pass-slot-qty">×${r.freeItem.qty}</div>
                ${isLocked ? '<div class="pass-slot-locked-mask"><i class="fas fa-lock"></i></div>' : ''}
            </div>
        </div>
        <!-- 付费挡位条目（2 件物品 + PRE 硬币，共 3 槽） -->
        <div class="pass-tier pass-tier-premium ${data.isPremium ? '' : 'pass-tier-locked'} ${premClaimed ? 'pass-tier-claimed' : ''} ${canClaimPrem ? 'pass-tier-claimable' : ''}">
            <div class="pass-tier-head">
                <span class="pass-tier-tag"><i class="fas fa-gem"></i> 付费</span>
                ${data.isPremium
                    ? (premClaimed
                        ? '<span class="pass-tier-state"><i class="fas fa-check"></i> 已领取</span>'
                        : (canClaimPrem
                            ? '<span class="pass-tier-state pass-tier-state-ready">可领取</span>'
                            : (seasonLocked ? '<span class="pass-tier-state"><i class="fas fa-lock"></i> 赛季未开始</span>' : '')))
                    : '<span class="pass-tier-state"><i class="fas fa-lock"></i> 需解锁付费通行证</span>'}
            </div>
            ${r.premiumItems.map(function(p) {
                return `
<div class="pass-slot pass-slot-clickable ${premClaimed ? 'pass-slot-claimed' : ''}" data-item-id="${p.id}" data-item-qty="${p.qty}" title="点击查看物品详情">
    <i class="${p.icon}" style="color:${p.color};"></i>
    <div class="pass-slot-name">${p.name}</div>
    <div class="pass-slot-qty">×${p.qty}</div>
    ${(isLocked || !data.isPremium) ? '<div class="pass-slot-locked-mask"><i class="fas ' + (isLocked ? 'fa-lock' : 'fa-gem') + '"></i></div>' : ''}
</div>`;
            }).join('')}
            <div class="pass-slot pass-slot-clickable ${premClaimed ? 'pass-slot-claimed' : ''}" data-precoin="1" data-precoin-amount="${r.premiumPrecoin}" title="点击查看 PRE 硬币说明">
                <i class="fas fa-coins" style="color:#ffd93d;"></i>
                <div class="pass-slot-name">PRE 硬币</div>
                <div class="pass-slot-qty">+${r.premiumPrecoin}</div>
                ${(isLocked || !data.isPremium) ? '<div class="pass-slot-locked-mask"><i class="fas ' + (isLocked ? 'fa-lock' : 'fa-gem') + '"></i></div>' : ''}
            </div>
        </div>
    </div>
    <button class="pass-btn ${(canClaimFree || canClaimPrem) ? 'pass-btn-primary' : 'pass-btn-disabled'} pass-reward-claim" data-level="${r.level}" ${(canClaimFree || canClaimPrem) ? '' : 'disabled'}>
        ${btnText}
    </button>
</div>`;
    }
    grid.innerHTML = html;

    // 「全部领取」按钮状态
    var claimAllBtn = document.getElementById('passBtnClaimAll');
    if (claimAllBtn) {
        if (claimableLevels > 0) {
            claimAllBtn.classList.remove('pass-btn-disabled');
            claimAllBtn.classList.add('pass-btn-primary');
            claimAllBtn.disabled = false;
            claimAllBtn.innerHTML = '<i class="fas fa-gifts"></i> 全部领取 (' + claimableLevels + ')';
        } else {
            claimAllBtn.classList.remove('pass-btn-primary');
            claimAllBtn.classList.add('pass-btn-disabled');
            claimAllBtn.disabled = true;
            claimAllBtn.innerHTML = '<i class="fas fa-gifts"></i> 全部领取';
        }
    }

    // 绑定领取按钮
    grid.querySelectorAll('.pass-reward-claim').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var lv = parseInt(this.getAttribute('data-level'), 10);
            var result = passClaimLevelReward(lv);
            if (result) {
                _animateRewardClaim(btn);
                renderPassUI();
                _showPassClaimResult(result);
            }
        });
    });

    // 绑定物品槽点击：弹出与仓库一致的物品详情弹窗（仅预览，展示该等级奖励数量）
    grid.querySelectorAll('.pass-slot[data-item-id]').forEach(function(slot) {
        slot.addEventListener('click', function() {
            var itemId = this.getAttribute('data-item-id');
            var qty = parseInt(this.getAttribute('data-item-qty'), 10) || 1;
            if (typeof showWarehouseItemDetail !== 'function') return;
            if (typeof WAREHOUSE_ITEMS === 'undefined' || !WAREHOUSE_ITEMS[itemId]) return;
            showWarehouseItemDetail(itemId, { previewOnly: true, qty: qty });
            var detailModal = document.getElementById('warehouseItemDetailModal');
            if (detailModal) detailModal.style.zIndex = '1000000';
        });
    });

    // 绑定 PRE 硬币槽点击：弹出 PRE 硬币介绍弹窗
    grid.querySelectorAll('.pass-slot[data-precoin]').forEach(function(slot) {
        slot.addEventListener('click', function() {
            var amount = parseInt(this.getAttribute('data-precoin-amount'), 10) || 40;
            if (typeof window.showPrecoinDescription === 'function') {
                window.showPrecoinDescription(amount, 'pass');
            }
        });
    });
}

// 领取动效（仅保留 GSAP 按钮缩放，已移除烟花粒子效果以避免卡顿）
function _animateRewardClaim(btn) {
    try {
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(btn, { scale: 1 }, { scale: 1.15, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' });
        }
    } catch(e) {}
}

// ==================== 任务列表渲染 ====================
function _renderPassTasks(data) {
    var list = document.getElementById('passTasksList');
    if (!list) return;

    var sub = _passUI.activeSubTab;

    // 任务栏右侧刷新倒计时标签（日常/周常按刷新周期，赛季与赛季剩余天数一致）
    var hintText = document.getElementById('passRefreshHintText');
    if (hintText) {
        if (sub === 'daily') {
            // 日常按 UTC 日期刷新（与 refreshDailyTasks 的刷新键一致），下次刷新为下一个 UTC 零点
            var nextUtcMidnight = new Date();
            nextUtcMidnight.setUTCHours(24, 0, 0, 0);
            var dailyDays = Math.max(1, Math.ceil((nextUtcMidnight.getTime() - Date.now()) / 86400000));
            hintText.textContent = '距离下一次日常刷新还剩 ' + dailyDays + ' 天';
        } else if (sub === 'weekly') {
            // 周常以周一为起点刷新，计算距下一个周一的天数
            var weeklyDays = (8 - new Date().getDay()) % 7;
            if (weeklyDays === 0) weeklyDays = 7;
            hintText.textContent = '距离下一次周常刷新还剩 ' + weeklyDays + ' 天';
        } else {
            var seasonSt = _getPassSeasonState();
            if (seasonSt === 'not_started') hintText.textContent = '赛季未开始';
            else if (seasonSt === 'ended') hintText.textContent = '赛季已结束';
            else {
                var seasonDays = Math.max(0, Math.ceil((new Date(PASS_CONFIG.endTime).getTime() - Date.now()) / 86400000));
                hintText.textContent = '本赛季剩余 ' + seasonDays + ' 天';
            }
        }
    }
    var pool, arr;
    if (sub === 'daily') { pool = PASS_DAILY_TASK_POOL; arr = data.dailyTasks; }
    else if (sub === 'weekly') { pool = PASS_WEEKLY_TASK_POOL; arr = data.weeklyTasks; }
    else { pool = buildSeasonTasks(); arr = data.seasonTasks; }

    // 确保 pool 顺序：按已完成/未完成
    var html = '';
    var unclaimedCount = 0;
    var seasonLocked = _isPassSeasonLocked();
    var seasonState = _getPassSeasonState();
    pool.forEach(function(def) {
        var entry = null;
        for (var i = 0; i < arr.length; i++) { if (arr[i].id === def.id) { entry = arr[i]; break; } }
        if (!entry) entry = { progress: 0, claimed: false };
        var complete = (entry.progress || 0) >= def.target;
        if (complete && !entry.claimed) unclaimedCount++;
        var percent = Math.min(100, Math.floor(((entry.progress || 0) / def.target) * 100));
        var cls = 'pass-task-item';
        if (seasonLocked) cls += ' pass-task-locked';
        else if (entry.claimed) cls += ' pass-task-done';
        else if (complete) cls += ' pass-task-ready';

        var taskBtnCls = (seasonLocked || entry.claimed || !complete) ? 'pass-btn-disabled' : 'pass-btn-primary';
        var taskLockText = seasonState === 'ended' ? '赛季已结束' : '赛季未开始';
        var taskBtnText = seasonLocked
            ? '<i class="fas fa-lock"></i> ' + taskLockText
            : entry.claimed ? '<i class="fas fa-check"></i> 已领取'
            : (complete ? '<i class="fas fa-bolt"></i> 领取经验' : '进行中');
        var taskBtnDisabled = (seasonLocked || entry.claimed || !complete) ? 'disabled' : '';

        html += `
<div class="${cls}">
    <div class="pass-task-title">
        <i class="fas fa-circle-check"></i>
        <div class="pass-task-name">${def.title}</div>
        <div class="pass-task-exp-tag">+${def.exp} <i class="fas fa-bolt"></i></div>
    </div>
    <div class="pass-task-desc">${def.desc}</div>
    <div class="pass-task-bar-wrap">
        <div class="pass-task-bar">
            <div class="pass-task-bar-fill" style="width:${percent}%;"></div>
        </div>
        <div class="pass-task-bar-text">${Math.min(entry.progress || 0, def.target)} / ${def.target}</div>
    </div>
    <button class="pass-btn ${taskBtnCls} pass-task-claim" data-task-type="${sub}" data-task-id="${def.id}" ${taskBtnDisabled}>
        ${taskBtnText}
    </button>
</div>
`;
    });
    list.innerHTML = html;

    // Tab 红点
    document.getElementById('passTaskDot').style.display = (unclaimedCount > 0 && !seasonLocked) ? 'inline-block' : 'none';

    // 绑定领取
    list.querySelectorAll('.pass-task-claim').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var type = this.getAttribute('data-task-type');
            var id = this.getAttribute('data-task-id');
            if (passClaimTask(type, id)) {
                renderPassUI();
            }
        });
    });
}

// ==================== CSS 自注入 ====================
var _passCSSInjected = false;
function _injectPassCSS() {
    if (_passCSSInjected) return;
    _passCSSInjected = true;
    var style = document.createElement('style');
    style.id = 'passStyles';
    style.textContent = `
/* ===== 通行证全屏弹窗 ===== */
.pass-overlay {
    position: fixed; inset: 0;
    /* 性能优化：背景本身接近不透明，去掉全屏 backdrop-filter（滚动时逐帧模糊是主要卡顿源） */
    background: rgba(8, 4, 20, 0.97);
    z-index: 999999;
    display: flex; flex-direction: column;
    overflow: hidden;
    font-family: 'HarmonyOS Sans SC', -apple-system, sans-serif;
    color: #fff;
}
/* 提示横条层级：强制高于通行证弹窗 */
.system-toast-container { z-index: 1000001 !important; }
.pass-particle-bg {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.6;
}
.pass-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(140px);
    opacity: 0.25;
    pointer-events: none;
    z-index: 0;
    /* 静态大模糊元素提升为独立合成层，只栅格化一次 */
    transform: translateZ(0);
}
.pass-glow-tl {
    top: -150px; left: -150px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, #ff6b9d, transparent 60%);
}
.pass-glow-br {
    bottom: -200px; right: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, #6a5acd, transparent 60%);
}
.pass-container {
    position: relative;
    z-index: 2;
    display: flex; flex-direction: column;
    height: 100%;
    max-width: none;
    width: 100%;
    padding: 24px 20px 12px;
    box-sizing: border-box;
}

/* ===== Header ===== */
.pass-header {
    display: flex; justify-content: space-between; align-items: center;
    flex-shrink: 0;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
}
.pass-header-left {
    display: flex; align-items: center; gap: 18px;
}
.pass-logo-wrap {
    width: 54px; height: 54px;
    background: linear-gradient(135deg, #ff6b9d, #6a5acd);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 32px rgba(255,107,157,0.35);
}
.pass-logo-icon {
    font-size: 26px; color: #fff;
}
.pass-title-group { display: flex; flex-direction: column; }
.pass-title-cn {
    font-size: 22px; font-weight: 700; letter-spacing: 0.5px;
    background: linear-gradient(90deg, #ff6b9d, #f8b500, #6a5acd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
.pass-title-en {
    font-size: 12px; color: rgba(255,255,255,0.45);
    letter-spacing: 2px; text-transform: uppercase;
    margin-top: 2px;
}
.pass-badge {
    padding: 5px 12px; border-radius: 20px;
    font-size: 12px; font-weight: 600;
    display: inline-flex; align-items: center; gap: 6px;
}
.pass-badge-live {
    background: rgba(34,197,94,0.18); color: #4ade80;
    border: 1px solid rgba(74,222,128,0.3);
}
.pass-badge-live i { font-size: 6px; animation: pass-pulse 1.5s infinite; }
@keyframes pass-pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

/* 赛季时间监测 */
.pass-season-time {
    display: flex; align-items: center; gap: 10px;
    margin-left: 8px;
    padding: 6px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
}
.pass-season-time-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: rgba(255,255,255,0.6);
}
.pass-season-time-item > i {
    font-size: 10px; color: rgba(255,255,255,0.35);
}
.pass-season-time-label {
    color: rgba(255,255,255,0.4); font-size: 11px;
}
.pass-season-time-value {
    color: rgba(255,255,255,0.8); font-weight: 600; font-size: 12px;
    font-variant-numeric: tabular-nums;
}
.pass-season-time-sep {
    font-size: 8px; color: rgba(255,255,255,0.25);
}
/* 赛季剩余天数标签（高亮展示） */
.pass-season-days-left {
    padding: 2px 10px;
    background: rgba(248,181,0,0.12);
    border: 1px solid rgba(248,181,0,0.3);
    border-radius: 12px;
}
.pass-season-days-left > i { color: #f8b500; }
.pass-season-days-left .pass-season-time-label { color: rgba(248,181,0,0.7); }
.pass-season-days-left .pass-season-time-value { color: #f8b500; }

.pass-header-right { display: flex; align-items: center; gap: 12px; }
.pass-close-btn {
    width: 42px; height: 42px; border-radius: 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.7);
    cursor: pointer; font-size: 18px;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
}
.pass-close-btn:hover {
    background: rgba(255,107,157,0.2);
    border-color: #ff6b9d; color: #fff;
    transform: rotate(90deg);
}

/* ===== Hero ===== */
.pass-hero {
    display: flex; gap: 24px;
    padding: 20px 0;
    flex-shrink: 0;
}
.pass-hero-left { display: flex; gap: 24px; align-items: center; flex: 1; }
.pass-level-ring { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
.pass-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.pass-ring-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 6; }
.pass-ring-fg {
    fill: none; stroke: #ff6b9d; stroke-width: 6; stroke-linecap: round;
    transition: stroke-dashoffset 0.6s ease;
    filter: drop-shadow(0 0 6px rgba(255,107,157,0.5));
}
.pass-level-text {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.pass-level-num {
    font-size: 32px; font-weight: 800;
    background: linear-gradient(135deg, #ff6b9d, #6a5acd);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.pass-level-label { font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 2px; }

.pass-exp-block { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 200px; }
.pass-exp-label { font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 1px; }
.pass-exp-bar {
    height: 12px; background: rgba(255,255,255,0.06);
    border-radius: 6px; overflow: hidden; position: relative;
    border: 1px solid rgba(255,255,255,0.08);
}
.pass-exp-fill {
    height: 100%; width: 0%;
    background: linear-gradient(90deg, #ff6b9d, #f8b500, #6a5acd);
    border-radius: 6px;
    transition: width 0.5s ease;
    box-shadow: 0 0 12px rgba(255,107,157,0.5);
}
.pass-exp-text { font-size: 13px; color: rgba(255,255,255,0.6); font-weight: 500; }
.pass-ex-info {
    display: none; align-items: center; gap: 10px;
    background: linear-gradient(90deg, rgba(106,90,205,0.2), rgba(248,181,0,0.2));
    border: 1px solid rgba(248,181,0,0.4);
    padding: 8px 14px; border-radius: 10px;
    font-size: 13px; color: #f8b500;
    margin-top: 4px;
}
.pass-ex-info i { margin-right: 4px; }

.pass-hero-right {
    display: flex; flex-direction: column; gap: 12px;
    min-width: 340px;
}
.pass-hero-stats {
    display: flex; gap: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 12px 16px;
}
.pass-stat { flex: 1; text-align: center; }
.pass-stat-num { font-size: 20px; font-weight: 700; color: #ff6b9d; }
.pass-stat-label { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 2px; letter-spacing: 1px; }

.pass-buy-panel {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 14px 16px;
}
.pass-buy-row {
    display: flex; align-items: center; gap: 12px;
    font-size: 13px; color: rgba(255,255,255,0.7);
}
.pass-buy-row .pass-btn { flex: 1; justify-content: center; }
.pass-buy-input {
    width: 60px; padding: 6px 10px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 6px; color: #fff; font-size: 14px; font-weight: 600;
    text-align: center; outline: none;
}
.pass-buy-input:focus { border-color: #ff6b9d; }
.pass-buy-cost { font-size: 13px; color: #ffd93d; font-weight: 600; }
.pass-buy-hint { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 8px; }
.pass-buy-hint b { color: #f8b500; }

/* ===== Buttons ===== */
.pass-btn {
    padding: 8px 18px; border-radius: 8px;
    font-size: 13px; font-weight: 600;
    border: none; cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.2s;
    font-family: inherit;
    white-space: nowrap;
}
.pass-btn-primary {
    background: linear-gradient(135deg, #ff6b9d, #c44569);
    color: #fff;
    box-shadow: 0 4px 16px rgba(255,107,157,0.4);
}
.pass-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,107,157,0.5); }
.pass-btn-premium-ghost {
    background: linear-gradient(135deg, rgba(248,181,0,0.18), rgba(106,90,205,0.18));
    border: 1px solid rgba(248,181,0,0.4);
    color: #f8b500;
}
.pass-btn-premium-ghost:hover { background: linear-gradient(135deg, rgba(248,181,0,0.28), rgba(106,90,205,0.28)); }
.pass-btn-disabled {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.35);
    cursor: not-allowed;
}
.pass-btn-mini { padding: 4px 12px; font-size: 12px; }

/* ===== Dev 按钮（开发者模式，位于 Tab 栏右侧工具组） ===== */
.pass-btn-dev {
    background: rgba(255,159,67,0.12);
    border: 1px solid rgba(255,159,67,0.45);
    color: #ffa94d;
    font-size: 12px;
    padding: 7px 14px;
}
.pass-btn-dev:hover { background: rgba(255,159,67,0.22); border-color: #ffa94d; }
.pass-btn-dev-active { background: rgba(74,222,128,0.15); border-color: rgba(74,222,128,0.5); color: #4ade80; }
.pass-btn-dev-active:hover { background: rgba(74,222,128,0.25); border-color: #4ade80; }

/* ===== 开发者调试多级菜单 ===== */
.pass-dev-menu { position: relative; }
.pass-dev-menu-caret { font-size: 10px; margin-left: 6px; transition: transform 0.2s; }
.pass-dev-menu-open .pass-dev-menu-caret { transform: rotate(180deg); }
.pass-dev-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    min-width: 286px;
    background: linear-gradient(160deg, rgba(38,26,60,0.98), rgba(18,12,36,0.99));
    border: 1px solid rgba(255,159,67,0.35);
    border-radius: 14px;
    padding: 8px;
    box-shadow: 0 18px 50px rgba(0,0,0,0.55), 0 0 30px rgba(255,159,67,0.12);
    z-index: 40;
    opacity: 0; visibility: hidden; transform: translateY(-6px) scale(0.97);
    transform-origin: top right;
    transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s;
}
.pass-dev-menu-open .pass-dev-dropdown {
    opacity: 1; visibility: visible; transform: translateY(0) scale(1);
}
.pass-dev-dropdown-title {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 12px 8px;
    font-size: 11px; font-weight: 700; letter-spacing: 1px;
    color: #ffa94d; opacity: 0.8;
}
.pass-dev-item {
    width: 100%;
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px;
    background: transparent;
    border: none; border-radius: 9px;
    color: rgba(255,255,255,0.82);
    font-size: 13px; font-weight: 500;
    text-align: left; cursor: pointer;
    transition: background 0.15s, color 0.15s;
}
.pass-dev-item:hover { background: rgba(255,159,67,0.14); color: #fff; }
.pass-dev-item-icon {
    width: 26px; height: 26px; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 7px;
    background: rgba(255,255,255,0.07);
    font-size: 12px; color: #ffa94d;
}
.pass-dev-item-label { flex: 1; line-height: 1.3; }
.pass-dev-item-state {
    color: rgba(255,255,255,0.18);
    font-size: 15px; flex-shrink: 0;
    transition: color 0.2s;
}
.pass-dev-item.pass-dev-item-on { color: #4ade80; }
.pass-dev-item.pass-dev-item-on:hover { background: rgba(74,222,128,0.12); }
.pass-dev-item.pass-dev-item-on .pass-dev-item-icon { background: rgba(74,222,128,0.15); color: #4ade80; }
.pass-dev-item.pass-dev-item-on .pass-dev-item-state { color: #4ade80; }
.pass-dev-dropdown-divider { height: 1px; margin: 6px 10px; background: rgba(255,255,255,0.09); }

/* 禁用态按钮（赛季未开始锁定等） */
.pass-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.pass-btn:disabled:hover { transform: none; box-shadow: none; }

/* 徽章：未开始（灰色态） */
.pass-badge-wait { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.18); }
.pass-badge-wait i { animation: none; }

/* 徽章：已结束（橙红态） */
.pass-badge-ended { background: rgba(239,68,68,0.16); color: #f87171; border: 1px solid rgba(239,68,68,0.35); }
.pass-badge-ended i { animation: none; }

/* 赛季未开始 / 已结束：等级内容区横条提示 */
.pass-season-banner {
    width: 100%;
    min-height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 32px 40px;
    margin: 8px 8px 20px 8px;
    border-radius: 16px;
    border: 1px dashed;
    text-align: left;
}
.pass-season-banner > i {
    font-size: 42px;
    flex-shrink: 0;
    opacity: 0.85;
}
.pass-season-banner-text { display: flex; flex-direction: column; gap: 6px; }
.pass-season-banner-title {
    font-size: 20px; font-weight: 700;
}
.pass-season-banner-desc {
    font-size: 14px;
    opacity: 0.75;
    line-height: 1.6;
}
.pass-season-banner-wait {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.18);
    color: rgba(255,255,255,0.85);
}
.pass-season-banner-wait > i { color: #fbbf24; }
.pass-season-banner-ended {
    background: rgba(239,68,68,0.06);
    border-color: rgba(239,68,68,0.3);
    color: rgba(255,255,255,0.85);
}
.pass-season-banner-ended > i { color: #f87171; }

/* ===== Tabs ===== */
.pass-tabs {
    display: flex; align-items: center; gap: 4px;
    padding-top: 4px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
    /* 提升层级：GSAP 入场动画会在 .pass-tabs 上留下 transform（形成层叠上下文），
       导致其内部的开发者调试下拉菜单被下方 .pass-content-scroll 覆盖而变透明、无法点击；
       显式设置 z-index 使整个 Tab 栏（含下拉菜单）浮于内容区之上 */
    position: relative;
    z-index: 10;
}
/* Tab 栏右侧工具组：滚动提示 + 全部领取 + Dev 按钮（不占用内容区高度） */
.pass-tabs-right {
    margin-left: auto;
    display: flex; align-items: center; gap: 8px;
    flex-wrap: wrap; justify-content: flex-end;
    padding: 0 16px 6px 0;
}
.pass-tabs-right .pass-btn { padding: 6px 14px; font-size: 12px; }
.pass-tabs-right .pass-btn-dev { padding: 5px 12px; }
.pass-tabs .pass-reward-scroll-hint { margin-bottom: 0; animation: none; }
.pass-tab {
    padding: 12px 22px;
    font-size: 14px; font-weight: 600;
    color: rgba(255,255,255,0.5);
    cursor: pointer; position: relative;
    display: flex; align-items: center; gap: 8px;
    transition: all 0.2s;
}
.pass-tab:hover { color: rgba(255,255,255,0.8); }
.pass-tab.active { color: #fff; }
.pass-tab.active::after {
    content: ''; position: absolute; bottom: -1px; left: 12px; right: 12px; height: 2px;
    background: linear-gradient(90deg, #ff6b9d, #6a5acd);
    border-radius: 2px;
}
.pass-tab-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #ef4444; animation: pass-pulse 1.5s infinite;
}

/* ===== Content ===== */
.pass-content-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 20px 0;
    scroll-behavior: smooth;
}
.pass-content-scroll::-webkit-scrollbar { width: 8px; }
.pass-content-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 4px; }
.pass-content-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #ff6b9d, #6a5acd);
    border-radius: 4px;
}
.pass-view-hidden { display: none; }
.pass-reward-scroll-hint {
    text-align: center; color: rgba(255,255,255,0.3); font-size: 12px;
    margin-bottom: 16px; animation: pass-bounce 2s infinite;
}
.pass-reward-scroll-hint i { margin-right: 6px; }
@keyframes pass-bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(4px);} }

/* ===== Rewards Grid（横向滚动） ===== */
.pass-rewards-grid {
    display: flex;
    flex-direction: row;
    gap: 18px;
    padding: 8px 8px 20px 8px;
    overflow-x: auto;
    overflow-y: hidden;
    /* 性能优化：去掉 smooth（JS 滚轮逐次触发平滑动画会互相打断，导致卡顿感），
       mandatory 改 proximity（自由滑动时减少强制吸附回流） */
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
}
.pass-rewards-grid::-webkit-scrollbar { height: 10px; }
.pass-rewards-grid::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 5px; margin: 0 8px; }
.pass-rewards-grid::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #ff6b9d, #6a5acd);
    border-radius: 5px;
}
.pass-reward-card {
    flex: 0 0 350px;
    scroll-snap-align: start;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 10px;
    position: relative;
    /* 性能优化：overflow 改 visible 让可领取光晕可扩展到卡外（顶部渐变条自带圆角），
       transition 收窄避免 hover 时的额外重绘 */
    overflow: visible;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    height: auto;
    min-height: 280px;
    /* 性能优化：离屏卡片跳过渲染与动画（120 张卡只渲染可视区附近几张） */
    content-visibility: auto;
    contain-intrinsic-size: auto 350px auto 320px;
}
.pass-reward-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #ff6b9d, #f8b500, #6a5acd);
    border-radius: 16px 16px 0 0;
    opacity: 0.3; transition: opacity 0.2s;
}
.pass-reward-card:hover {
    background: rgba(255,255,255,0.09);
    transform: translateY(-2px);
}
.pass-reward-card:hover::before { opacity: 1; }
/* 未解锁等级：整体压暗，与已领取卡片形成明显反差 */
.pass-card-locked { opacity: 0.5; }
.pass-card-locked:hover { transform: none; }
.pass-card-claimable {
    border-color: rgba(255,107,157,0.5);
    box-shadow: 0 0 12px rgba(255,107,157,0.12);
}
/* 性能优化：光晕呼吸动画从 box-shadow 逐帧重绘改为伪元素 opacity 合成器动画
   （高等级下上百张可领取卡同时跑 box-shadow 动画是滑动卡顿的最大来源） */
.pass-card-claimable::after {
    content: ''; position: absolute; inset: -2px;
    border-radius: 16px;
    box-shadow: 0 0 24px rgba(255,107,157,0.3), 0 0 8px rgba(255,107,157,0.18);
    opacity: 0.35;
    animation: pass-glow-pulse 2s ease-in-out infinite;
    pointer-events: none;
}
@keyframes pass-glow-pulse { 0%,100%{opacity:0.25;} 50%{opacity:0.8;} }
/* 滚动期间暂停所有无限动画，进一步降低滑动时重绘压力（由 JS 滚动监听切换） */
.pass-overlay.pass-scrolling .pass-card-claimable::after,
.pass-overlay.pass-scrolling .pass-tier-state-ready,
.pass-overlay.pass-scrolling .pass-badge-live i,
.pass-overlay.pass-scrolling .pass-reward-scroll-hint { animation-play-state: paused; }
/* 已领取卡片：不再压暗，改为明亮的绿色调，清晰区别于未解锁卡片 */
.pass-card-claimed {
    opacity: 1;
    background: linear-gradient(165deg, rgba(74,222,128,0.13), rgba(34,211,238,0.06));
    border-color: rgba(74,222,128,0.45);
    box-shadow: 0 0 18px rgba(74,222,128,0.1);
}
.pass-card-claimed::before {
    background: linear-gradient(90deg, #4ade80, #22d3ee);
    opacity: 0.85;
}
.pass-card-claimed:hover { background: linear-gradient(165deg, rgba(74,222,128,0.18), rgba(34,211,238,0.09)); }
.pass-card-claimed .pass-reward-claim { background: rgba(74,222,128,0.18); color: #86efac; border-color: rgba(74,222,128,0.45); }

.pass-level-badge {
    position: absolute; top: 10px; right: 10px;
    font-size: 12px; font-weight: 700;
    padding: 4px 12px; border-radius: 14px;
    background: linear-gradient(135deg, #ff6b9d, #6a5acd);
    color: #fff;
}

.pass-reward-tiers {
    display: flex; flex-direction: column; gap: 8px; margin-top: 22px;
}
/* 挡位条目：免费 / 付费 */
.pass-tier {
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 8px 10px;
    display: flex; flex-direction: column; gap: 6px;
    background: rgba(255,255,255,0.04);
    position: relative;
    transition: all 0.2s;
}
.pass-tier-free { border-left: 3px solid #6a5acd; }
.pass-tier-premium { border-left: 3px solid #f8b500; }
.pass-tier-head {
    display: flex; align-items: center; gap: 8px;
    min-height: 18px;
}
.pass-tier-tag {
    font-size: 11px; font-weight: 700; letter-spacing: 1px;
    padding: 2px 9px; border-radius: 10px;
    display: inline-flex; align-items: center; gap: 5px;
}
.pass-tier-free .pass-tier-tag { background: rgba(106,90,205,0.22); color: #b3aaff; }
.pass-tier-premium .pass-tier-tag { background: rgba(248,181,0,0.15); color: #f8b500; }
.pass-tier-state {
    margin-left: auto;
    font-size: 11px; color: rgba(255,255,255,0.4);
    display: inline-flex; align-items: center; gap: 4px;
}
.pass-tier-state-ready { color: #ff6b9d; font-weight: 600; animation: pass-pulse 1.5s infinite; }
.pass-tier-locked { opacity: 0.45; filter: grayscale(0.6); }
.pass-tier-claimable { border-color: rgba(255,107,157,0.45); background: rgba(255,107,157,0.05); }
/* 已领取挡位：保持明亮，叠加淡绿色调而非压暗 */
.pass-tier-claimed {
    opacity: 1;
    background: rgba(74,222,128,0.07);
    border-color: rgba(74,222,128,0.22);
}
.pass-tier-claimed .pass-tier-state { color: #86efac; }
.pass-slot {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 10px; border-radius: 10px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    position: relative;
}
.pass-slot i:first-child {
    font-size: 20px; width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    background: rgba(255,255,255,0.12);
    flex-shrink: 0;
}
.pass-slot-qty {
    position: absolute; top: 4px; right: 8px;
    font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.9);
}
.pass-slot-name {
    font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.96);
    flex: 1; padding-right: 22px; padding-left: 2px;
    white-space: normal; word-break: break-word;
    line-height: 1.25;
    text-shadow: 0 1px 2px rgba(0,0,0,0.25);
}
/* 已领取物品槽：不透明、绿色提亮，文字保持高可读 */
.pass-slot-claimed {
    opacity: 1;
    background: rgba(74,222,128,0.1);
    border-color: rgba(74,222,128,0.22);
}
.pass-slot-claimed i:first-child { background: rgba(74,222,128,0.16); }
.pass-slot-locked-mask {
    position: absolute; inset: 0;
    /* 性能优化：去掉每个锁定槽位的 backdrop-filter，改用更深的半透明底色 */
    background: rgba(8, 4, 20, 0.72);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; color: rgba(255,255,255,0.5);
}
/* 可点击物品槽（弹出物品详情弹窗） */
.pass-slot-clickable { cursor: pointer; transition: background 0.15s, border-color 0.15s; }
.pass-slot-clickable:hover { background: rgba(255,255,255,0.13); border-color: rgba(255,107,157,0.45); }
.pass-slot-clickable.pass-slot-claimed:hover { background: rgba(74,222,128,0.16); border-color: rgba(74,222,128,0.4); }

/* ===== Tasks ===== */
.pass-subtabs {
    display: flex; gap: 8px; margin-bottom: 16px;
}
.pass-subtab {
    padding: 8px 18px; border-radius: 20px;
    font-size: 13px; font-weight: 600;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    transition: all 0.2s;
}
.pass-subtab:hover { color: #fff; border-color: rgba(255,107,157,0.5); }
.pass-subtab.active {
    background: linear-gradient(135deg, rgba(255,107,157,0.2), rgba(106,90,205,0.2));
    border-color: #ff6b9d; color: #fff;
}
/* 任务子标签栏右侧：刷新倒计时标签 */
.pass-refresh-hint {
    margin-left: auto;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px; font-weight: 600;
    color: #f8b500;
    background: rgba(248,181,0,0.1);
    border: 1px solid rgba(248,181,0,0.3);
    white-space: nowrap;
}
.pass-refresh-hint i { font-size: 11px; }
.pass-tasks-list { display: flex; flex-direction: column; gap: 12px; }
.pass-task-item {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 14px 18px;
    display: flex; flex-direction: column; gap: 10px;
    transition: all 0.2s;
}
.pass-task-item.pass-task-ready { border-color: rgba(74,222,128,0.5); background: rgba(74,222,128,0.08); }
.pass-task-item.pass-task-done { opacity: 0.65; }
/* 任务项：赛季未开始锁定态 */
.pass-task-item.pass-task-locked { opacity: 0.5; }
.pass-task-item.pass-task-locked .pass-task-bar-fill { background: rgba(255,255,255,0.25); }
.pass-task-title { display: flex; align-items: center; gap: 10px; }
.pass-task-title > i:first-child { color: #ff6b9d; font-size: 18px; }
.pass-task-item.pass-task-ready .pass-task-title > i:first-child { color: #4ade80; }
.pass-task-name { font-size: 15px; font-weight: 600; flex: 1; }
.pass-task-exp-tag {
    font-size: 12px; font-weight: 700; color: #f8b500;
    background: rgba(248,181,0,0.15);
    padding: 4px 12px; border-radius: 12px;
    display: inline-flex; align-items: center; gap: 4px;
}
.pass-task-desc { font-size: 12px; color: rgba(255,255,255,0.5); }
.pass-task-bar-wrap { display: flex; align-items: center; gap: 12px; }
.pass-task-bar {
    flex: 1; height: 8px; background: rgba(255,255,255,0.08);
    border-radius: 4px; overflow: hidden;
}
.pass-task-bar-fill {
    height: 100%; background: linear-gradient(90deg, #ff6b9d, #6a5acd);
    border-radius: 4px; transition: width 0.3s ease;
}
.pass-task-bar-text { font-size: 12px; color: rgba(255,255,255,0.5); min-width: 70px; text-align: right; }
.pass-task-item.pass-task-ready .pass-task-bar-fill { background: linear-gradient(90deg, #4ade80, #22c55e); }

/* ===== Footer ===== */
.pass-footer-hint {
    text-align: center; padding: 8px;
    font-size: 11px; color: rgba(255,255,255,0.25);
    border-top: 1px solid rgba(255,255,255,0.04);
    flex-shrink: 0;
}

/* ===== Modal 弹窗 ===== */
.pass-modal-overlay {
    position: absolute; inset: 0;
    background: rgba(8, 4, 20, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
}
.pass-modal-box {
    background: linear-gradient(160deg, rgba(30,20,50,0.98), rgba(15,10,30,0.98));
    border: 1px solid rgba(255,107,157,0.3);
    border-radius: 20px; padding: 28px 32px;
    width: 90%; max-width: 460px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,107,157,0.15);
    animation: pass-modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pass-modal-box-sm { max-width: 400px; }
.pass-modal-box-lg { max-width: 560px; max-height: 80vh; display: flex; flex-direction: column; }
.pass-modal-box-xl { max-width: 880px; }
@keyframes pass-modal-pop { 0%{transform:scale(0.8);opacity:0;} 100%{transform:scale(1);opacity:1;} }
.pass-modal-title {
    font-size: 20px; font-weight: 700;
    background: linear-gradient(90deg, #ff6b9d, #f8b500);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 6px;
}
.pass-modal-subtitle { font-size: 12px; color: rgba(255,255,255,0.45); margin-bottom: 20px; }
.pass-modal-body { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
.pass-modal-box-lg .pass-modal-body { flex: 1; min-height: 0; }
.pass-modal-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    margin-top: 24px; padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
}
.pass-modal-footer .pass-btn { padding: 10px 24px; font-size: 14px; }

/* ===== 奖励结算弹窗（宽版，领取/购买后统一展示获得物品） ===== */
.pass-modal-box-rewards {
    width: 94%; max-width: 1060px;
    max-height: 86vh;
    display: flex; flex-direction: column;
}
.pass-reward-result-head {
    display: flex; align-items: center; gap: 16px;
    margin-bottom: 22px;
}
.pass-reward-result-medal {
    width: 58px; height: 58px; flex-shrink: 0;
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
}
.pass-reward-result-headtext { min-width: 0; }
.pass-reward-result-headtext .pass-modal-title { margin-bottom: 4px; }
.pass-reward-result-headtext .pass-modal-subtitle { margin-bottom: 0; font-size: 13px; }
.pass-reward-result-body {
    flex: 1; min-height: 0;
    display: flex; flex-direction: row; flex-wrap: wrap;
    gap: 14px;
    align-content: flex-start;
}
.pass-reward-result-card {
    flex: 0 0 148px;
    display: flex; flex-direction: column; align-items: center;
    gap: 8px;
    padding: 18px 12px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    transition: transform 0.2s, box-shadow 0.2s;
}
.pass-reward-result-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}
.pass-reward-result-iconb {
    width: 56px; height: 56px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
}
.pass-reward-result-name {
    font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9);
    text-align: center; line-height: 1.35;
}
.pass-reward-result-qty {
    font-size: 15px; font-weight: 700;
    background: linear-gradient(90deg, #ff6b9d, #f8b500);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.pass-reward-result-level { border-color: rgba(255,107,157,0.45); }
.pass-reward-result-coin { border-color: rgba(255,217,61,0.4); }
.pass-reward-result-note {
    flex: 1 1 100%;
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px;
    background: rgba(192,132,252,0.08);
    border: 1px solid rgba(192,132,252,0.28);
    border-radius: 12px;
    font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.8);
}
.pass-reward-result-note i { color: #c084fc; font-size: 16px; flex-shrink: 0; }
.pass-reward-result-footer { justify-content: center; }
.pass-reward-result-footer .pass-btn { min-width: 160px; padding: 11px 28px; }
@media (max-width: 768px) {
    .pass-reward-result-card { flex: 0 0 calc(33.333% - 10px); }
    .pass-reward-result-iconb { width: 46px; height: 46px; font-size: 22px; }
    .pass-reward-result-name { font-size: 12px; }
}

/* 购买等级控制 */
.pass-buylevel-control { display: flex; align-items: center; justify-content: center; gap: 14px; }
.pass-step-btn {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff; font-size: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
}
.pass-step-btn:hover { background: rgba(255,107,157,0.2); border-color: #ff6b9d; }
.pass-buylevel-input {
    width: 90px; height: 44px; text-align: center;
    background: rgba(255,255,255,0.06);
    border: 2px solid rgba(255,107,157,0.4);
    border-radius: 10px; color: #fff;
    font-size: 22px; font-weight: 700;
    outline: none;
}
.pass-buylevel-input::-webkit-inner-spin-button,
.pass-buylevel-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.pass-buylevel-info {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 14px 18px;
    display: flex; flex-direction: column; gap: 10px;
}
.pass-buylevel-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 14px; color: rgba(255,255,255,0.6);
}
.pass-buylevel-row span:last-child { font-weight: 600; color: rgba(255,255,255,0.85); }
.pass-buylevel-cost {
    border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;
    font-size: 16px;
}
.pass-buylevel-cost span:last-child { color: #ffd93d; font-weight: 700; font-size: 18px; }
.pass-buylevel-warn {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.3);
    color: #f87171;
    padding: 10px 14px; border-radius: 10px;
    font-size: 13px; text-align: center;
}

/* 二次确认 */
.pass-confirm-body { align-items: center; text-align: center; gap: 18px; }
.pass-confirm-icon {
    width: 64px; height: 64px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(248,181,0,0.2), rgba(255,107,157,0.2));
    border: 2px solid rgba(248,181,0,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; color: #f8b500;
    margin: 0 auto;
}
.pass-confirm-text { font-size: 15px; color: rgba(255,255,255,0.8); line-height: 1.6; }
/* 危险操作确认（Dev 重置购买状态） */
.pass-confirm-danger { color: #f87171; font-size: 13px; }
.pass-confirm-icon-danger {
    background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(255,159,67,0.2)) !important;
    border-color: rgba(239,68,68,0.45) !important;
    color: #f87171 !important;
}
.pass-btn-danger {
    background: linear-gradient(135deg, #ef4444, #c44569);
    color: #fff;
    box-shadow: 0 4px 16px rgba(239,68,68,0.35);
}
.pass-btn-danger:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239,68,68,0.5); }

/* 付费通行证弹窗 */
.pass-premium-intro {
    font-size: 14px; color: rgba(255,255,255,0.7);
    line-height: 1.7; padding: 12px 16px;
    background: rgba(248,181,0,0.06);
    border: 1px solid rgba(248,181,0,0.2);
    border-radius: 10px;
}
.pass-premium-intro b { color: #f8b500; }
.pass-premium-items {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px; max-height: 300px; overflow-y: auto; padding-right: 4px;
}
.pass-premium-items::-webkit-scrollbar { width: 6px; }
.pass-premium-items::-webkit-scrollbar-thumb { background: rgba(248,181,0,0.3); border-radius: 3px; }
.pass-premium-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px;
}
.pass-premium-item i { font-size: 22px; width: 32px; text-align: center; }
.pass-premium-item-name { flex: 1; font-size: 13px; color: rgba(255,255,255,0.8); font-weight: 500; }
.pass-premium-item-qty { font-size: 13px; color: #f8b500; font-weight: 700; }
.pass-premium-cost {
    text-align: right; font-size: 16px; font-weight: 700; color: #f8b500;
    padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08);
}

/* 购买方式选择弹窗（块状按钮） */
.pass-select-body { gap: 14px; }
.pass-select-card {
    display: flex; align-items: center; gap: 16px;
    width: 100%;
    padding: 18px 22px; text-align: left;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    cursor: pointer; color: #fff; font-family: inherit;
    transition: all 0.2s;
}
.pass-select-card:hover { border-color: rgba(255,107,157,0.6); background: rgba(255,107,157,0.08); transform: translateY(-2px); }
.pass-select-card-bundle:hover { border-color: rgba(248,181,0,0.6); background: rgba(248,181,0,0.08); }
.pass-select-card.pass-select-owned { opacity: 0.45; cursor: not-allowed; }
.pass-select-card.pass-select-owned:hover { transform: none; border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); }
.pass-select-icon {
    width: 52px; height: 52px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    background: linear-gradient(135deg, rgba(106,90,205,0.25), rgba(255,107,157,0.25));
    border: 1px solid rgba(255,107,157,0.35);
    color: #ff6b9d;
}
.pass-select-card-bundle .pass-select-icon {
    background: linear-gradient(135deg, rgba(248,181,0,0.22), rgba(255,107,157,0.22));
    border-color: rgba(248,181,0,0.4);
    color: #f8b500;
}
.pass-select-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.pass-select-name { font-size: 15px; font-weight: 700; color: #fff; }
.pass-select-desc { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.5; }
.pass-select-tag {
    display: inline-block; vertical-align: 2px; margin-left: 6px;
    font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px;
    background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.4); color: #4ade80;
}
.pass-select-price { display: flex; align-items: center; gap: 6px; flex-shrink: 0; color: #ffd93d; font-size: 14px; }
.pass-select-price-num { font-size: 20px; font-weight: 700; }
.pass-select-price i { font-size: 14px; }
.pass-select-owned-tag {
    font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.55);
}
.pass-price-original { text-decoration: line-through; color: rgba(255,255,255,0.35); font-size: 13px; font-weight: 500; margin-right: 8px; }
.pass-price-discount-tag {
    display: inline-block; margin-right: 8px; vertical-align: 1px;
    font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px;
    background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.4); color: #4ade80;
}

/* 组合包立即获得内容 */
.pass-bundle-extras {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;
}
.pass-bundle-extra {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px;
    background: rgba(106,90,205,0.1);
    border: 1px solid rgba(106,90,205,0.3);
    border-radius: 8px;
}
.pass-bundle-extra i { font-size: 20px; width: 28px; text-align: center; }
.pass-bundle-extra-name { flex: 1; font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500; }
.pass-bundle-extra-qty { font-size: 13px; color: #a78bfa; font-weight: 700; }

/* ===== 响应式 ===== */
@media (max-width: 1100px) {
    .pass-hero { flex-direction: column; }
    .pass-hero-right { flex-direction: row; min-width: auto; }
    .pass-hero-right > * { flex: 1; }
    .pass-season-time { flex-wrap: wrap; gap: 6px; }
}
@media (max-width: 768px) {
    .pass-container { padding: 16px; }
    .pass-header-left { gap: 10px; flex-wrap: wrap; }
    .pass-logo-wrap { width: 42px; height: 42px; }
    .pass-logo-icon { font-size: 20px; }
    .pass-title-cn { font-size: 17px; }
    .pass-season-time { width: 100%; margin-left: 0; }
    .pass-season-time-value { font-size: 11px; }
    .pass-hero-right { flex-direction: column; }
    .pass-rewards-grid { gap: 10px; padding: 8px 4px 16px; }
    .pass-reward-card { flex: 0 0 300px; min-height: 260px; }
    .pass-tabs { flex-wrap: wrap; }
    .pass-tabs-right { padding-right: 0; }
    .pass-subtabs { flex-wrap: wrap; }
    .pass-refresh-hint { margin-left: 0; width: 100%; justify-content: center; }
    .pass-buylevel-control { flex-wrap: wrap; }
    .pass-premium-items { grid-template-columns: 1fr; }
}
`;
    document.head.appendChild(style);
}

// ==================== DOM Ready 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    _injectPassCSS();
    _wireTaskHooks();

    // 在导航栏模板更新函数中插入"通行证"入口（通过 hook）
    if (typeof window.updateMinimalistTopNavForGameCenter === 'function' && !window.__passNavPatched) {
        window.__passNavPatched = true;
        var orig = window.updateMinimalistTopNavForGameCenter;
        window.updateMinimalistTopNavForGameCenter = function() {
            orig();
            _injectPassNavItem();
        };
    }
    // 如果还没有注入过，尝试立即注入（适用于 DOMContentLoaded 后才执行 update 的情况）
    setTimeout(function() { _injectPassNavItem(); }, 500);
    setTimeout(function() { _injectPassNavItem(); }, 2000);
});

// ==================== 任务进度自动集成 Hook ====================
// 通过 monkey patch 既有模块的关键函数，自动推进通行证任务进度
function _wireTaskHooks() {
    try {
        // 1. PRE Coin 变化 → 每日"赚取 PRE Coin" + 周/赛季累计
        if (typeof window.addPreCoin === 'function' && !window.__passCoinHooked) {
            window.__passCoinHooked = true;
            var _origAddCoin = window.addPreCoin;
            window.addPreCoin = function(amount, source, silent) {
                var ret = _origAddCoin.apply(this, arguments);
                if (ret) {
                    passUpdateTaskProgress('daily', 'd_coin', 1);
                    passUpdateTaskProgress('weekly', 'w_coin100', amount);
                    passUpdateTaskProgress('season', 's_coin1000', amount);
                }
                return ret;
            };
        }

        // 2. 仓库打开 → 每日任务
        if (typeof window.openWarehouseModal === 'function' && !window.__passWarehouseHooked) {
            window.__passWarehouseHooked = true;
            var _origOpenWH = window.openWarehouseModal;
            window.openWarehouseModal = function() {
                passUpdateTaskProgress('daily', 'd_warehouse', 1);
                passUpdateTaskProgress('weekly', 'w_browse', 1);
                return _origOpenWH.apply(this, arguments);
            };
        }

        // 3. 商店打开 → 每日任务
        if (typeof window.openShopModal === 'function' && !window.__passShopHooked) {
            window.__passShopHooked = true;
            var _origOpenShop = window.openShopModal;
            window.openShopModal = function() {
                passUpdateTaskProgress('daily', 'd_shop', 1);
                passUpdateTaskProgress('weekly', 'w_browse', 1);
                return _origOpenShop.apply(this, arguments);
            };
        }

        // 4. 每日签到领取 → 推进签到任务
        if (!window.__passClaimHooked) {
            window.__passClaimHooked = true;
            // 尝试 hook 签到领取函数（可能因命名不同而不存在，跳过即可）
            var claimFns = ['claimDailyCheckIn', 'claimCheckIn', 'dailyClaim', 'claimDayReward'];
            claimFns.forEach(function(name) {
                if (typeof window[name] === 'function' && !window[name].__passHooked) {
                    var _origClaim = window[name];
                    window[name].__passHooked = true;
                    window[name] = function() {
                        passUpdateTaskProgress('daily', 'd_claim', 1);
                        passUpdateTaskProgress('weekly', 'w_claim7', 1);
                        passUpdateTaskProgress('season', 's_claim30', 1);
                        return _origClaim.apply(this, arguments);
                    };
                }
            });
        }

        // 5. 经验加成卡使用 → 赛季任务
        if (typeof window.activateWarehouseExpBuff === 'function' && !window.__passBoostHooked) {
            window.__passBoostHooked = true;
            var _origActivate = window.activateWarehouseExpBuff;
            window.activateWarehouseExpBuff = function() {
                passUpdateTaskProgress('weekly', 'w_premium', 1);
                passUpdateTaskProgress('season', 's_boost10', 1);
                return _origActivate.apply(this, arguments);
            };
        }

        // 6. 登录（首次进入） → 每日"登录"任务
        passUpdateTaskProgress('daily', 'd_login', 1);
        passUpdateTaskProgress('season', 's_first_login', 1);

    } catch(e) {
        console.warn('[Pass] Task hook setup warning:', e.message);
    }
}

// 注入导航栏通行证条目
function _injectPassNavItem() {
    var centerNav = document.querySelector('#uiMinTopnav .ui-min-topnav-center');
    if (!centerNav) return;
    // 防止重复注入
    if (centerNav.querySelector('[data-nav="battlepass"]')) return;

    // 通行证条目：放在"游戏中心"dropdown 之后，"仓库"之前
    var warehouse = centerNav.querySelector('[data-nav="warehouse"]');
    var passItem = document.createElement('div');
    passItem.className = 'ui-min-nav-item';
    passItem.setAttribute('data-nav', 'battlepass');
    passItem.id = 'uiMinBattlePass';
    passItem.innerHTML = `
        <i class="fas fa-crown"></i>
        <span>通行证</span>
    `;

    if (warehouse) {
        centerNav.insertBefore(passItem, warehouse);
    } else {
        centerNav.appendChild(passItem);
    }

    passItem.addEventListener('click', function(e) {
        e.stopPropagation();
        openPassUI();
    });
}

