// ==================== PRE Coin 硬币系统 ====================
// 货币：PRE Coin (PRE硬币)
// 获取渠道：每日签到、每日任务、游玩小游戏、邮件附件、活动奖励
// 用途：商店兑换道具
// 数据按账户隔离存储（localStorage key = precoin_<username>）

var PRECOIN_DATA_VERSION = 1;

// ==================== 账户隔离存储 ====================
function getPreCoinStorageKey() {
    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch (e) {}
    var username = currentUser.username || 'anonymous';
    return 'precoin_' + username;
}

function getPreCoinData() {
    var stored = localStorage.getItem(getPreCoinStorageKey());
    if (stored) {
        try {
            var data = JSON.parse(stored);
            if (data && typeof data.balance === 'number') {
                return data;
            }
        } catch (e) {}
    }
    return {
        version: PRECOIN_DATA_VERSION,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        history: [],
        createdAt: new Date().toISOString()
    };
}

function savePreCoinData(data) {
    data.version = PRECOIN_DATA_VERSION;
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(getPreCoinStorageKey(), JSON.stringify(data));
}

// ==================== 核心 API ====================

// 获取当前余额
function getPreCoinBalance() {
    var data = getPreCoinData();
    return data.balance || 0;
}

// 增加 PRE Coin
// source: 来源说明（如 '每日签到', '每日任务', '商店消费退款' 等）
// 返回是否成功
function addPreCoin(amount, source) {
    amount = parseInt(amount, 10);
    if (!amount || amount <= 0) return false;

    var data = getPreCoinData();
    data.balance += amount;
    data.totalEarned += amount;

    if (source) {
        if (!data.history) data.history = [];
        data.history.push({
            type: 'earn',
            amount: amount,
            source: source,
            timestamp: new Date().toISOString()
        });
        if (data.history.length > 200) data.history = data.history.slice(-200);
    }

    savePreCoinData(data);

    if (typeof showToast === 'function') {
        showToast({
            type: 'success',
            title: 'PRE Coin',
            message: '获得 ' + amount + ' PRE 硬币' + (source ? '（' + source + '）' : '')
        });
    }

    return true;
}

// 消费 PRE Coin（必须余额充足）
// source: 消费说明（如 '商店兑换' 等）
// 返回是否成功
function spendPreCoin(amount, source) {
    amount = parseInt(amount, 10);
    if (!amount || amount <= 0) return false;

    var data = getPreCoinData();
    if (data.balance < amount) {
        if (typeof showToast === 'function') {
            showToast({
                type: 'error',
                title: 'PRE Coin 不足',
                message: '当前余额：' + data.balance + '，需要：' + amount + ' PRE 硬币'
            });
        }
        return false;
    }

    data.balance -= amount;
    data.totalSpent += amount;

    if (source) {
        if (!data.history) data.history = [];
        data.history.push({
            type: 'spend',
            amount: amount,
            source: source,
            timestamp: new Date().toISOString()
        });
        if (data.history.length > 200) data.history = data.history.slice(-200);
    }

    savePreCoinData(data);
    return true;
}

// 格式化显示 PRE Coin 余额
function formatPreCoin(amount) {
    amount = amount || 0;
    if (amount >= 10000) {
        return (amount / 10000).toFixed(1) + '万';
    }
    return amount.toString();
}

// ==================== PRE Coin 每日奖励配置 ====================
// 每日签到根据连续签到天数给出的硬币奖励
var PRECOIN_DAILY_CHECKIN_REWARDS = {
    // 1-6天：每天 20
    tier1: { minDays: 1, maxDays: 6, coin: 20 },
    // 7-14天：每天 50
    tier2: { minDays: 7, maxDays: 14, coin: 50 },
    // 15天及以上：每天 80
    tier3: { minDays: 15, maxDays: 99999, coin: 80 }
};

// 根据连续签到天数获取每日 PRE Coin 奖励
function getPreCoinDailyCheckinReward(streak) {
    streak = parseInt(streak, 10) || 0;
    if (streak <= 0) return PRECOIN_DAILY_CHECKIN_REWARDS.tier1.coin;
    if (streak >= PRECOIN_DAILY_CHECKIN_REWARDS.tier3.minDays) return PRECOIN_DAILY_CHECKIN_REWARDS.tier3.coin;
    if (streak >= PRECOIN_DAILY_CHECKIN_REWARDS.tier2.minDays) return PRECOIN_DAILY_CHECKIN_REWARDS.tier2.coin;
    return PRECOIN_DAILY_CHECKIN_REWARDS.tier1.coin;
}

// ==================== PRE Coin 签到里程碑配置 ====================
// 经验值奖励保持不变，在此基础上新增硬币奖励
var PRECOIN_CHECKIN_MILESTONE_BONUSES = [
    { days: 7,   coin: 100, label: '连续签到7天奖励' },
    { days: 15,  coin: 100, label: '连续签到15天奖励' },
    { days: 30,  coin: 200, label: '连续签到30天奖励' },
    { days: 60,  coin: 200, label: '连续签到60天奖励' },
    { days: 90,  coin: 250, label: '连续签到90天奖励' },
    { days: 180, coin: 250, label: '连续签到180天奖励' },
    { days: 365, coin: 500, label: '连续签到365天奖励' }
];

// 获取新达成的里程碑 PRE Coin 奖励
// streak: 当前连续签到天数
// claimedMilestones: 已领取过的里程碑天数数组
// 返回 [{days, coin, label}, ...]
function getPreCoinMilestoneBonuses(streak, claimedMilestones) {
    claimedMilestones = claimedMilestones || [];
    var bonuses = [];
    PRECOIN_CHECKIN_MILESTONE_BONUSES.forEach(function(m) {
        if (streak >= m.days && claimedMilestones.indexOf(m.days) === -1) {
            bonuses.push({ days: m.days, coin: m.coin, label: m.label });
        }
    });
    return bonuses;
}
