// ==================== 幸运抽奖机 ====================
// 入口：顶部导航「每日」→「幸运抽奖机」→ 全屏弹窗（样式自包含，不依赖其他弹窗先打开）
// 抽取类型：
//   - 每日抽取：每日 UTC+8 凌晨 04:00 刷新，每天 1 次
//   - 每周抽取：每周一 UTC+8 凌晨 04:00 刷新，每周 3 次
//   - 月度抽取：每月 1 日 UTC+8 凌晨 04:00 刷新，每月 5 次
// 奖池：仓库目录全部道具（排除：勋章 / 自选物品兑换卡 / PRE Coin 补给包系列；
//       组合包仅存在于商店目录，仓库目录天然不含，无需排除；
//       一袋/一盒幸运币系列（luck_bag_/luck_box_）为开箱型道具，已自奖池排除避免奖池过杂）
// 概率：按物品价值分档（低档易出、高档难出但不至于渺茫），「概率详情」弹窗完整公示
// 历史：「获奖历史」弹窗保存最近 90 日记录，可按每日 / 每周 / 月度筛选
// 子弹窗：复用启动器通用弹窗骨架（milestone-modal-overlay / milestone-modal）
// 动效：跑马灯滚动 + 中奖高亮 + 彩带礼花，仅使用 transform/opacity 合成器动画，不卡顿
// 存储：按账户隔离  key = lottery_<username>
// 期次判定：以 UTC+8 凌晨 4 点为界（将当前时间 -4h 后取日期/ISO 周/月份作为期次 key）

(function () {
    'use strict';

    var LT_DATA_VERSION = 2;
    var LT_CELL_W = 124;   // 跑马灯单元格宽度（需与 CSS 保持一致）
    var LT_CELL_GAP = 14;  // 单元格间距
    var LT_STRIP_LEN = 48;   // 转轮总格数
    var LT_WIN_INDEX = 42;   // 奖品落点格（需预留右侧空位避免露馅）
    var LT_SPIN_MS = 4300;   // 旋转时长
    var LT_HISTORY_DAYS = 90; // 获奖历史保留天数
    var LT_HISTORY_CAP = 300; // 获奖历史条数上限（防膨胀）

    // ==================== 抽取类型配置 ====================
    var LT_TYPES = {
        daily:   { name: '每日抽取', short: '今日', icon: 'fas fa-sun',             max: 1, color: '#667eea', refresh: '每日 04:00 刷新' },
        weekly:  { name: '每周抽取', short: '本周', icon: 'fas fa-calendar-week',   max: 3, color: '#f39c12', refresh: '每周一 04:00 刷新' },
        monthly: { name: '月度抽取', short: '本月', icon: 'fas fa-calendar-alt',    max: 5, color: '#e91e63', refresh: '每月 1 日 04:00 刷新' }
    };

    // ==================== 概率配置（按价值分档，权重越高越易出） ====================
    // 基础权重按稀有度：普通 100 / 稀有 42 / 史诗 13 / 传说 5
    // 极限模式限定卡（V 卡）实际价值更高，单独下调权重
    var LT_RARITY_WEIGHT = { common: 100, rare: 42, epic: 13, legendary: 5 };
    var LT_WEIGHT_OVERRIDE = { exp_boost_5: 2, exp_supply_5: 2 };
    var LT_RARITY_COLOR = (typeof WAREHOUSE_RARITY !== 'undefined')
        ? { common: WAREHOUSE_RARITY.common.color, rare: WAREHOUSE_RARITY.rare.color, epic: WAREHOUSE_RARITY.epic.color, legendary: WAREHOUSE_RARITY.legendary.color }
        : { common: '#9aa0a6', rare: '#3498db', epic: '#9b59b6', legendary: '#f39c12' };
    var LT_RARITY_NAME = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' };
    var LT_RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'];

    // 奖池（从仓库目录动态构建，缓存结果）
    var _ltPool = null;
    function ltGetPool() {
        if (_ltPool) return _ltPool;
        _ltPool = [];
        var src = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS : {};
        Object.keys(src).forEach(function (id) {
            var it = src[id];
            if (!it || it.category === 'badge') return;        // 排除勋章
            if (id === 'exchange_card') return;                 // 排除自选物品兑换卡
            if (id.indexOf('precoin_supply_') === 0) return;    // 排除 PRE Coin 补给包系列
            if (id.indexOf('luck_bag_') === 0 || id.indexOf('luck_box_') === 0) return; // 排除一袋/一盒幸运币系列（避免奖池过杂）
            _ltPool.push({
                id: id,
                item: it,
                weight: LT_WEIGHT_OVERRIDE[id] || LT_RARITY_WEIGHT[it.rarity] || 20
            });
        });
        return _ltPool;
    }

    // 加权随机抽取一次（可传入加成后的奖池）
    function ltPickOne(pool) {
        pool = pool || ltGetPool();
        if (!pool.length) return null;
        var total = 0;
        pool.forEach(function (p) { total += p.weight; });
        var r = Math.random() * total;
        for (var i = 0; i < pool.length; i++) {
            r -= pool[i].weight;
            if (r < 0) return pool[i];
        }
        return pool[pool.length - 1];
    }

    // ==================== 幸运币概率加成 ====================
    // 投币规则：不同档位不可同时投入；同档位单次最多 10 枚；
    // 每枚按 perCoin 提升目标档位权重，且该档位合计概率不超过 cap（防止数值崩坏）
    var LT_COIN_MAX = 10;
    var LT_COIN_TYPES = {
        luck_coin:        { name: '幸运币',        tier: 'common',    perCoin: 25, cap: 0.75 },
        luck_coin_common: { name: '幸运币 · 普通', tier: 'common',    perCoin: 25, cap: 0.75 },
        luck_coin_rare:   { name: '幸运币 · 稀有', tier: 'rare',      perCoin: 18, cap: 0.65 },
        luck_coin_epic:   { name: '幸运币 · 史诗', tier: 'epic',      perCoin: 10, cap: 0.40 },
        luck_coin_legend: { name: '幸运币 · 传说', tier: 'legendary', perCoin: 6,  cap: 0.25 }
    };

    // 构建投币加成后的奖池（目标档位权重提升，并按档位概率上限钳制）
    function _ltBuildBoostedPool(coinId, qty) {
        var pool = ltGetPool().map(function (p) { return { id: p.id, item: p.item, weight: p.weight }; });
        var cfg = LT_COIN_TYPES[coinId];
        if (!cfg || !qty) return pool;
        var tierW = 0, totalW = 0;
        pool.forEach(function (p) {
            totalW += p.weight;
            if (p.item.rarity === cfg.tier) tierW += p.weight;
        });
        var add = cfg.perCoin * qty;
        var maxAdd = (cfg.cap * totalW - tierW) / (1 - cfg.cap); // 由 (tierW+add)/(totalW+add) ≤ cap 反解
        if (!isFinite(maxAdd) || maxAdd < 0) maxAdd = 0;
        if (add > maxAdd) add = maxAdd;
        var factor = tierW > 0 ? (1 + add / tierW) : 1;
        pool.forEach(function (p) {
            if (p.item.rarity === cfg.tier) p.weight = p.weight * factor;
        });
        return pool;
    }

    // 指定档位在奖池中的合计概率（0-1）
    function _ltTierProb(pool, tier) {
        var tierW = 0, totalW = 0;
        pool.forEach(function (p) {
            totalW += p.weight;
            if (p.item.rarity === tier) tierW += p.weight;
        });
        return totalW > 0 ? tierW / totalW : 0;
    }

    // ==================== UTC+8 凌晨 4 点期次逻辑 ====================
    // 将「UTC+8 墙钟 - 4 小时」作为期次锚点：4 点前仍属上一期
    function _ltAnchor() {
        return new Date(Date.now() + 8 * 3600000 - 4 * 3600000);
    }

    function _ltPeriodKey(type) {
        var s = _ltAnchor();
        var y = s.getUTCFullYear(), m = s.getUTCMonth(), d = s.getUTCDate();
        if (type === 'daily') {
            return y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + d).slice(-2);
        }
        if (type === 'monthly') {
            return y + '-' + ('0' + (m + 1)).slice(-2);
        }
        // weekly：ISO 周（周一为一周之始）
        var th = new Date(Date.UTC(y, m, d));
        var dow = (th.getUTCDay() + 6) % 7; // Mon=0
        th.setUTCDate(th.getUTCDate() - dow + 3); // 本周周四
        var first = new Date(Date.UTC(th.getUTCFullYear(), 0, 4));
        var fdow = (first.getUTCDay() + 6) % 7;
        first.setUTCDate(first.getUTCDate() - fdow + 3); // 年内第一周周四
        var week = 1 + Math.round((th - first) / (7 * 86400000));
        return th.getUTCFullYear() + '-W' + ('0' + week).slice(-2);
    }

    // 距离下一刷新点的毫秒数（每日=下个 4 点；每周=下个周一 4 点；月度=下个 1 日 4 点）
    function _ltNextRefreshMs(type) {
        var now8 = new Date(Date.now() + 8 * 3600000);
        var y = now8.getUTCFullYear(), m = now8.getUTCMonth(), d = now8.getUTCDate();
        var t = now8.getTime();
        var day4 = Date.UTC(y, m, d, 4, 0, 0);
        if (type === 'daily') {
            return (t < day4 ? day4 : Date.UTC(y, m, d + 1, 4, 0, 0)) - t;
        }
        if (type === 'weekly') {
            var dow = now8.getUTCDay(); // 0=周日
            var add = (dow === 1) ? ((t < day4) ? 0 : 7) : ((dow === 0) ? 1 : (8 - dow));
            return Date.UTC(y, m, d + add, 4, 0, 0) - t;
        }
        return (t < Date.UTC(y, m, 1, 4, 0, 0) ? Date.UTC(y, m, 1, 4, 0, 0) : Date.UTC(y, m + 1, 1, 4, 0, 0)) - t;
    }

    function _ltCountdownText(type) {
        var ms = _ltNextRefreshMs(type);
        if (ms < 0) ms = 0;
        var totalMin = Math.floor(ms / 60000);
        var days = Math.floor(totalMin / 1440);
        var hours = Math.floor((totalMin % 1440) / 60);
        var mins = totalMin % 60;
        if (days > 0) return days + ' 天 ' + hours + ' 小时 ' + mins + ' 分';
        if (hours > 0) return hours + ' 小时 ' + mins + ' 分';
        return mins + ' 分钟';
    }

    // ==================== 账户隔离存储 ====================
    function ltStorageKey() {
        var u = {};
        try { u = JSON.parse(localStorage.getItem('currentUser') || '{}'); } catch (e) {}
        return 'lottery_' + (u.username || 'anonymous');
    }

    function ltGetData() {
        var data = null;
        try {
            var stored = localStorage.getItem(ltStorageKey());
            if (stored) data = JSON.parse(stored);
        } catch (e) {}
        if (!data || typeof data !== 'object') data = {};
        if (!Array.isArray(data.history)) data.history = [];
        ['daily', 'weekly', 'monthly'].forEach(function (k) {
            if (!data[k] || typeof data[k] !== 'object') data[k] = {};
            var pk = _ltPeriodKey(k);
            if (data[k].period !== pk) { data[k].period = pk; data[k].used = 0; } // 跨期自动重置
            if (typeof data[k].used !== 'number' || data[k].used < 0) data[k].used = 0;
        });
        // 投入的幸运币校验（档位合法 + 数量 0-10）
        if (data.pendingCoin && !LT_COIN_TYPES[data.pendingCoin.id]) data.pendingCoin = null;
        if (data.pendingCoin) {
            data.pendingCoin.qty = Math.max(0, Math.min(LT_COIN_MAX, parseInt(data.pendingCoin.qty, 10) || 0));
            if (!data.pendingCoin.qty) data.pendingCoin = null;
        }
        // 获奖历史：仅保留最近 90 日，超期自动清理
        var cutoff = Date.now() - LT_HISTORY_DAYS * 86400000;
        data.history = data.history.filter(function (r) {
            return r && r.t && r.itemId && new Date(r.t).getTime() >= cutoff;
        });
        if (data.history.length > LT_HISTORY_CAP) data.history.length = LT_HISTORY_CAP;
        return data;
    }

    function ltSaveData(data) {
        data.version = LT_DATA_VERSION;
        try { localStorage.setItem(ltStorageKey(), JSON.stringify(data)); } catch (e) {}
    }

    // ==================== 开发者模式（判定方式与日常任务一致） ====================
    function ltIsDevMode() {
        var user = null;
        try { user = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch (e) {}
        var name = user ? (user.username || '') : '';
        if (!name) return false;
        try {
            var dm = JSON.parse(localStorage.getItem('devModeData') || '{}');
            return !!(dm[name] && dm[name].enabled) || !!(dm['__global__'] && dm['__global__'].enabled);
        } catch (e) { return false; }
    }

    // 抽奖机调试开关（全局本地存储）：unlimited=无限次抽取 / freeCoins=无视幸运币数量
    function ltDevFlags() {
        var f = { unlimited: false, freeCoins: false };
        try {
            var s = JSON.parse(localStorage.getItem('lotteryDevFlags') || '{}');
            if (s && s.unlimited) f.unlimited = true;
            if (s && s.freeCoins) f.freeCoins = true;
        } catch (e) {}
        return f;
    }
    function ltSaveDevFlags(f) {
        try { localStorage.setItem('lotteryDevFlags', JSON.stringify(f)); } catch (e) {}
    }

    // ==================== 颜色工具 ====================
    function _ltDarken(hex, ratio) {
        var h = hex.replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        var n = parseInt(h, 16);
        var r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - ratio)));
        var g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - ratio)));
        var b = Math.max(0, Math.round((n & 255) * (1 - ratio)));
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    function _ltAlpha(hex, a) {
        var h = hex.replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        var n = parseInt(h, 16);
        return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }
    function _ltIconBg(item, fallback) {
        var c = item.color || fallback || '#888';
        return 'linear-gradient(145deg, ' + _ltAlpha(c, 0.95) + ', ' + _ltDarken(c, 0.35) + ')';
    }

    // ==================== 样式注入（作用域到 #lotteryModal / .lt-sub-modal） ====================
    function _ltInjectCSS() {
        if (document.getElementById('lottery-style')) return;
        var css = `
        #lotteryModal {
            background: rgba(8, 6, 24, 0.88);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: none; position: fixed; inset: 0; z-index: 9998;
            align-items: stretch; justify-content: stretch;
        }
        #lotteryModal.show { display: flex; animation: ltFadeIn 0.28s ease; }
        @keyframes ltFadeIn { from { opacity: 0; } to { opacity: 1; } }

        #lotteryModal .lt-fullscreen {
            width: 100%; height: 100%;
            display: flex; flex-direction: column; overflow: hidden;
            background:
                radial-gradient(1100px 520px at 50% -10%, rgba(133, 96, 255, 0.28), transparent 60%),
                radial-gradient(900px 460px at 85% 110%, rgba(233, 60, 140, 0.16), transparent 60%),
                linear-gradient(160deg, #241a52 0%, #2f2168 45%, #3a2678 100%);
        }
        body.dark-mode #lotteryModal .lt-fullscreen {
            background:
                radial-gradient(1100px 520px at 50% -10%, rgba(110, 80, 220, 0.22), transparent 60%),
                radial-gradient(900px 460px at 85% 110%, rgba(200, 50, 120, 0.12), transparent 60%),
                linear-gradient(160deg, #171035 0%, #1e1546 45%, #261a56 100%);
        }

        /* ====== 顶栏（左：刷新倒计时 · 中：标题 · 右：关闭） ====== */
        #lotteryModal .lt-header {
            display: flex; align-items: center; gap: 16px;
            padding: 16px 28px; flex-shrink: 0;
            border-bottom: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.04);
        }
        #lotteryModal .lt-refresh-tag {
            display: inline-flex; align-items: center; gap: 7px;
            padding: 7px 14px; border-radius: 999px;
            background: rgba(46, 204, 113, 0.14); border: 1px solid rgba(88, 214, 141, 0.35);
            color: #7be3a5; font-size: 12px; font-weight: 700; white-space: nowrap;
            flex-shrink: 0;
        }
        #lotteryModal .lt-title { display: flex; align-items: center; gap: 12px; min-width: 0; }
        #lotteryModal .lt-title-ico {
            width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, #f7b733 0%, #e8890c 100%);
            box-shadow: 0 4px 16px rgba(247, 183, 51, 0.45), inset 0 1px 0 rgba(255,255,255,0.4);
            color: #fff; font-size: 19px;
        }
        #lotteryModal .lt-title h2 {
            margin: 0; font-size: 20px; color: #fff; letter-spacing: 1px;
            background: linear-gradient(90deg, #ffe9b8 0%, #f7b733 55%, #ffb84d 100%);
            -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        #lotteryModal .lt-title-badge {
            padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 2px;
            color: #cbb7ff; border: 1px solid rgba(203, 183, 255, 0.35); background: rgba(133, 96, 255, 0.14);
            white-space: nowrap;
        }
        #lotteryModal .lt-close {
            width: 36px; height: 36px; border: none; border-radius: 50%; flex-shrink: 0;
            margin-left: auto;
            background: rgba(255,255,255,0.10); color: #ddd; font-size: 15px; cursor: pointer;
            transition: all 0.25s ease;
        }
        #lotteryModal .lt-close:hover { background: #e74c3c; color: #fff; transform: rotate(90deg); }

        /* ====== 主体（单栏居中） ====== */
        #lotteryModal .lt-body { flex: 1; min-height: 0; overflow: hidden; }
        #lotteryModal .lt-main {
            width: 100%; height: 100%; overflow-y: auto;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 24px 30px 26px; gap: 20px;
            scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.28) transparent;
        }
        #lotteryModal .lt-main::-webkit-scrollbar { width: 8px; }
        #lotteryModal .lt-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22); border-radius: 8px; }

        /* ====== 抽取类型 Tabs ====== */
        #lotteryModal .lt-tabs { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        #lotteryModal .lt-tab {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 22px; border-radius: 999px; cursor: pointer;
            border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.07);
            color: #cfd0e8; font-size: 13.5px; font-weight: 700; letter-spacing: 0.5px;
            transition: all 0.22s ease; user-select: none;
        }
        #lotteryModal .lt-tab:hover { border-color: rgba(255,255,255,0.45); color: #fff; }
        #lotteryModal .lt-tab.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: transparent; color: #fff;
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45);
        }
        #lotteryModal .lt-tab-count {
            min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px;
            display: inline-flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 800;
            background: rgba(255,255,255,0.16); color: inherit;
        }
        #lotteryModal .lt-tab.active .lt-tab-count { background: rgba(255,255,255,0.28); }
        #lotteryModal .lt-tab-count.done { background: rgba(0,0,0,0.3); color: #9a9ab5; }

        /* ====== 抽奖机（居中放大） ====== */
        #lotteryModal .lt-machine-wrap { position: relative; width: min(1020px, 100%); }
        #lotteryModal .lt-machine {
            position: relative; border-radius: 26px; padding: 24px 24px 26px;
            background: linear-gradient(150deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%);
            border: 1px solid rgba(255,255,255,0.22);
            box-shadow: 0 22px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.22);
            transition: box-shadow 0.3s ease;
        }
        #lotteryModal .lt-machine.lt-spinning { box-shadow: 0 22px 60px rgba(0,0,0,0.45), 0 0 34px rgba(247, 183, 51, 0.28), inset 0 1px 0 rgba(255,255,255,0.22); }
        #lotteryModal .lt-machine.lt-flash { animation: ltFlash 0.7s ease; }
        @keyframes ltFlash {
            0% { box-shadow: 0 22px 60px rgba(0,0,0,0.45), 0 0 0 rgba(247,183,51,0); }
            35% { box-shadow: 0 22px 60px rgba(0,0,0,0.45), 0 0 60px rgba(247,183,51,0.65); }
            100% { box-shadow: 0 22px 60px rgba(0,0,0,0.45), 0 0 34px rgba(247, 183, 51, 0.28); }
        }
        #lotteryModal .lt-machine-label {
            display: flex; align-items: center; justify-content: center; gap: 12px;
            font-size: 12px; font-weight: 800; letter-spacing: 4px; color: rgba(255, 233, 184, 0.75);
            margin-bottom: 16px; text-transform: uppercase;
        }
        #lotteryModal .lt-machine-label::before, #lotteryModal .lt-machine-label::after {
            content: ''; width: 64px; height: 1px; flex-shrink: 0;
            background: linear-gradient(90deg, transparent, rgba(247,183,51,0.6));
        }
        #lotteryModal .lt-machine-label::after { transform: scaleX(-1); }

        /* 顶部灯泡 */
        #lotteryModal .lt-bulbs {
            position: absolute; top: 10px; left: 30px; right: 30px;
            display: flex; justify-content: space-between; pointer-events: none;
        }
        #lotteryModal .lt-bulb {
            width: 7px; height: 7px; border-radius: 50%;
            background: #ffd873; box-shadow: 0 0 8px rgba(255, 216, 115, 0.9);
            animation: ltBlink 1.5s ease-in-out infinite;
            animation-delay: calc(var(--i) * 0.11s);
        }
        @keyframes ltBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }

        /* 跑马灯窗口 */
        #lotteryModal .lt-marquee {
            position: relative; overflow: hidden; border-radius: 17px;
            background: rgba(12, 9, 34, 0.62);
            box-shadow: inset 0 3px 14px rgba(0,0,0,0.55), inset 0 -2px 8px rgba(0,0,0,0.35);
            border: 1px solid rgba(255,255,255,0.10);
        }
        #lotteryModal .lt-strip {
            display: flex; gap: 14px; padding: 16px 0;
            will-change: transform; transform: translateX(0);
        }
        #lotteryModal .lt-cell {
            width: 124px; height: 148px; flex-shrink: 0;
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px;
            border-radius: 15px; position: relative;
            background: linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%);
            border: 1px solid rgba(255,255,255,0.13);
            border-top: 3px solid var(--rc, rgba(255,255,255,0.3));
            transition: border-color 0.25s ease;
        }
        #lotteryModal .lt-cell-ico {
            width: 48px; height: 48px; border-radius: 13px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 19px;
            box-shadow: inset 0 -6px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35);
        }
        #lotteryModal .lt-cell-name {
            font-size: 12px; color: #eceaff; font-weight: 600; text-align: center;
            line-height: 1.35; padding: 0 7px;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        #lotteryModal .lt-cell-rar { font-size: 10.5px; font-weight: 800; letter-spacing: 1px; opacity: 0.9; }

        /* 中奖高亮 */
        #lotteryModal .lt-cell.lt-win {
            background: linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%);
            animation: ltWinPulse 1.1s ease-in-out infinite;
        }
        @keyframes ltWinPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
        }

        /* 左右边缘渐隐 */
        #lotteryModal .lt-fade {
            position: absolute; top: 0; bottom: 0; width: 64px; pointer-events: none; z-index: 2;
        }
        #lotteryModal .lt-fade-l { left: 0; background: linear-gradient(90deg, rgba(12,9,34,0.95), transparent); border-radius: 17px 0 0 17px; }
        #lotteryModal .lt-fade-r { right: 0; background: linear-gradient(-90deg, rgba(12,9,34,0.95), transparent); border-radius: 0 17px 17px 0; }

        /* 中央指针 */
        #lotteryModal .lt-pointer {
            position: absolute; top: 7px; left: 50%; transform: translateX(-50%);
            z-index: 3; display: flex; flex-direction: column; align-items: center; pointer-events: none;
        }
        #lotteryModal .lt-pointer-gem {
            width: 16px; height: 16px; transform: rotate(45deg); border-radius: 4px;
            background: linear-gradient(135deg, #ffe9b8, #f7b733 60%, #e8890c);
            box-shadow: 0 0 12px rgba(247, 183, 51, 0.85), inset 0 1px 0 rgba(255,255,255,0.5);
        }
        #lotteryModal .lt-pointer-line {
            width: 3px; height: 148px; border-radius: 3px; margin-top: -3px;
            background: linear-gradient(180deg, rgba(247,183,51,0.95), rgba(247,183,51,0.35), rgba(247,183,51,0.9));
            box-shadow: 0 0 10px rgba(247, 183, 51, 0.55);
        }
        #lotteryModal .lt-machine.lt-spinning .lt-pointer-gem { animation: ltGemSpin 0.7s linear infinite; }
        @keyframes ltGemSpin {
            0% { transform: rotate(45deg) scale(1); }
            50% { transform: rotate(225deg) scale(1.18); }
            100% { transform: rotate(405deg) scale(1); }
        }

        /* 彩带礼花层 */
        #lotteryModal .lt-confetti { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 4; }
        #lotteryModal .lt-confetti span {
            position: absolute; top: -14px; width: 9px; height: 14px; border-radius: 2px;
            opacity: 0; animation: ltConfetti var(--dur, 1.5s) ease-out var(--delay, 0s) forwards;
        }
        @keyframes ltConfetti {
            0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
            100% { opacity: 0; transform: translate(var(--dx, 0px), 360px) rotate(var(--rot, 360deg)); }
        }

        /* ====== 抽奖按钮区 ====== */
        #lotteryModal .lt-btn-area { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        #lotteryModal .lt-draw-btn {
            min-width: 280px; padding: 16px 50px; border: none; border-radius: 999px; cursor: pointer;
            background: linear-gradient(135deg, #f7b733 0%, #e8890c 60%, #d97706 100%);
            color: #fff; font-size: 18px; font-weight: 800; letter-spacing: 3px;
            display: inline-flex; align-items: center; justify-content: center; gap: 10px;
            box-shadow: 0 10px 28px rgba(247, 183, 51, 0.42), inset 0 1px 0 rgba(255,255,255,0.4);
            transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        #lotteryModal .lt-draw-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.02); box-shadow: 0 14px 34px rgba(247, 183, 51, 0.55), inset 0 1px 0 rgba(255,255,255,0.4); }
        #lotteryModal .lt-draw-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        #lotteryModal .lt-draw-btn:disabled { filter: grayscale(0.85) brightness(0.75); cursor: not-allowed; box-shadow: 0 6px 18px rgba(0,0,0,0.3); }
        #lotteryModal .lt-btn-sub { font-size: 12.5px; color: #b9b4dd; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        #lotteryModal .lt-btn-sub i { color: #f7b733; }
        #lotteryModal .lt-btn-sub.lt-sub-done { color: #8f8ab0; }

        /* ====== 结果横幅 ====== */
        #lotteryModal .lt-result {
            width: min(680px, 100%); min-height: 82px; border-radius: 18px;
            display: flex; align-items: center; gap: 18px; padding: 15px 22px;
            background: linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05));
            border: 1px solid rgba(255,255,255,0.16);
        }
        #lotteryModal .lt-result.lt-show { animation: ltResultIn 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2); }
        @keyframes ltResultIn { from { opacity: 0; transform: translateY(16px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
        #lotteryModal .lt-result-ico {
            width: 56px; height: 56px; border-radius: 15px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px;
            box-shadow: inset 0 -8px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 18px rgba(0,0,0,0.3);
        }
        #lotteryModal .lt-result-label { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #b9b4dd; margin-bottom: 4px; }
        #lotteryModal .lt-result-name { font-size: 18px; font-weight: 800; color: #fff; }
        #lotteryModal .lt-result-hint { margin-left: auto; font-size: 11.5px; color: #8f8ab0; text-align: right; line-height: 1.6; flex-shrink: 0; }

        /* ====== 概率详情 / 获奖历史 按钮 ====== */
        #lotteryModal .lt-sub-btns { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: center; }
        #lotteryModal .lt-sub-btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 24px; border-radius: 999px; cursor: pointer;
            border: 1px solid rgba(255,255,255,0.20); background: rgba(255,255,255,0.08);
            color: #d9d6f0; font-size: 13.5px; font-weight: 700; letter-spacing: 0.5px;
            transition: all 0.22s ease; user-select: none;
        }
        #lotteryModal .lt-sub-btn i { font-size: 13px; }
        #lotteryModal .lt-sub-btn:hover { transform: translateY(-2px); color: #fff; border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.14); }
        #lotteryModal .lt-sub-btn.lt-odds i { color: #8fa0ff; }
        #lotteryModal .lt-sub-btn.lt-hist i { color: #ffd873; }
        #lotteryModal .lt-sub-btn.lt-devbtn i { color: #ff6b81; }

        /* ====== 底栏 ====== */
        #lotteryModal .lt-footer {
            flex-shrink: 0; text-align: center; padding: 10px 24px;
            border-top: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.18);
            font-size: 11.5px; color: #8f8ab0; letter-spacing: 0.4px;
        }

        /* ====== 投币口（机身右下角） ====== */
        #lotteryModal .lt-machine-foot {
            display: flex; align-items: center; justify-content: space-between; gap: 14px;
            flex-wrap: wrap;
            margin-top: 14px; padding: 0 4px; min-height: 58px;
        }
        #lotteryModal .lt-coin-status { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 3px; }
        #lotteryModal .lt-coin-hint { font-size: 11.5px; color: #8f8ab0; display: inline-flex; align-items: center; gap: 6px; }
        #lotteryModal .lt-coin-hint i { color: #f7b733; font-size: 10px; }
        #lotteryModal .lt-coin-loaded { font-size: 12.5px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; }
        #lotteryModal .lt-coin-loaded i { font-size: 11px; }
        #lotteryModal .lt-coin-boost { font-size: 11px; color: #b9b4dd; }
        #lotteryModal .lt-coin-slot {
            position: relative; flex-shrink: 0;
            display: flex; align-items: center; gap: 10px;
            padding: 9px 16px 9px 12px; border-radius: 14px; cursor: pointer;
            background: linear-gradient(150deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05));
            border: 1px solid rgba(255,255,255,0.22);
            box-shadow: inset 0 2px 8px rgba(0,0,0,0.4), 0 4px 14px rgba(0,0,0,0.3);
            transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        #lotteryModal .lt-coin-slot:hover { transform: translateY(-2px); border-color: rgba(247,183,51,0.6); box-shadow: inset 0 2px 8px rgba(0,0,0,0.4), 0 8px 22px rgba(247,183,51,0.25); }
        #lotteryModal .lt-coin-slot:disabled { cursor: not-allowed; filter: grayscale(0.6); }
        #lotteryModal .lt-slot-coin {
            width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            background: linear-gradient(145deg, #ffe9b8, #f7b733 55%, #d97706);
            color: #7a4b06; font-size: 15px;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), 0 3px 8px rgba(0,0,0,0.35);
        }
        #lotteryModal .lt-slot-body { display: flex; flex-direction: column; align-items: stretch; gap: 5px; }
        #lotteryModal .lt-slot-slit {
            width: 58px; height: 5px; border-radius: 3px;
            background: #0d0a24;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(247,183,51,0.45);
        }
        #lotteryModal .lt-slot-label { font-size: 10.5px; font-weight: 800; letter-spacing: 2px; color: #cbb7ff; text-align: center; }
        #lotteryModal .lt-coin-slot.lt-loaded .lt-slot-slit {
            background: linear-gradient(90deg, #ffd873, #f7b733);
            box-shadow: 0 0 10px rgba(255, 216, 115, 0.8);
        }
        #lotteryModal .lt-coin-slot.lt-loaded .lt-slot-coin { animation: ltCoinReady 1.4s ease-in-out infinite; }
        @keyframes ltCoinReady {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
        }
        #lotteryModal .lt-slot-badge {
            position: absolute; top: -9px; right: -9px; min-width: 24px; height: 24px; padding: 0 7px;
            border-radius: 999px; align-items: center; justify-content: center; gap: 4px;
            font-size: 11px; font-weight: 800; color: #fff;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4);
            border: 2px solid rgba(255,255,255,0.25);
            display: none;
        }
        #lotteryModal .lt-slot-badge i { font-size: 9px; }

        /* —— 额度耗尽状态（三种抽取次数全部用完；调试无限抽取不受影响） —— */
        #lotteryModal .lt-machine.lt-depleted .lt-pointer { display: none; }
        #lotteryModal .lt-strip-empty {
            width: 100%; padding: 54px 20px; text-align: center;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        #lotteryModal .lt-strip-empty .lt-empty-emoji { font-size: 30px; line-height: 1; }
        #lotteryModal .lt-strip-empty .lt-empty-text { font-size: 15px; font-weight: 800; letter-spacing: 3px; color: #d9d6f0; }
        #lotteryModal .lt-coin-slot.lt-depleted {
            filter: grayscale(1) brightness(0.78);
            cursor: not-allowed;
        }
        #lotteryModal .lt-coin-slot.lt-depleted:hover {
            transform: none; border-color: rgba(255,255,255,0.22);
            box-shadow: inset 0 2px 8px rgba(0,0,0,0.4), 0 4px 14px rgba(0,0,0,0.3);
        }
        #lotteryModal .lt-coin-slot.lt-depleted .lt-slot-coin {
            background: linear-gradient(145deg, #b9bec7, #868c96);
            color: #565b63; animation: none;
            font-size: 17px;
        }
        #lotteryModal .lt-coin-slot.lt-depleted .lt-slot-label { color: #8f8ab0; }

        /* ====== 通用弹窗（概率详情 / 获奖历史，基于启动器 milestone-modal 骨架） ====== */
        .lt-sub-modal { max-height: 84vh; display: flex; flex-direction: column; }
        .lt-sub-tip {
            display: flex; align-items: flex-start; gap: 9px;
            background: #eef3ff; border: 1px solid #dfe8ff; color: #4a68d4;
            font-size: 12.5px; line-height: 1.75; padding: 10px 14px;
            border-radius: 10px; margin-bottom: 14px; flex-shrink: 0;
        }
        .lt-sub-tip i { margin-top: 4px; flex-shrink: 0; }
        body.dark-mode .lt-sub-tip { background: rgba(102,126,234,0.12); border-color: rgba(102,126,234,0.32); color: #9db4ff; }
        .lt-sub-body { overflow-y: auto; min-height: 0; flex: 1; padding-right: 4px; scrollbar-width: thin; scrollbar-color: #c6cbdc #f0f1f5; }
        .lt-sub-body::-webkit-scrollbar { width: 8px; }
        .lt-sub-body::-webkit-scrollbar-track { background: #f0f1f5; border-radius: 4px; }
        .lt-sub-body::-webkit-scrollbar-thumb { background: #c6cbdc; border-radius: 4px; }
        body.dark-mode .lt-sub-body { scrollbar-color: #4a4a5c #2c2c38; }
        body.dark-mode .lt-sub-body::-webkit-scrollbar-track { background: #2c2c38; }
        body.dark-mode .lt-sub-body::-webkit-scrollbar-thumb { background: #4a4a5c; }

        /* —— 概率详情内容 —— */
        .lt-sub-modal .lt2-groups { display: flex; flex-direction: column; gap: 16px; }
        .lt-sub-modal .lt2-group-head {
            display: flex; align-items: center; justify-content: space-between;
            font-size: 13px; font-weight: 800; margin-bottom: 7px; letter-spacing: 0.5px;
        }
        .lt-sub-modal .lt2-group-head .lt2-total { font-size: 11.5px; opacity: 0.9; }
        .lt-sub-modal .lt2-rows { display: flex; flex-direction: column; gap: 6px; }
        .lt-sub-modal .lt2-row {
            display: flex; align-items: center; gap: 11px;
            padding: 8px 12px; border-radius: 10px;
            background: #fafbfd; border: 1px solid #eef0f5;
        }
        .lt-sub-modal .lt2-ico {
            width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12.5px;
            box-shadow: inset 0 -4px 8px rgba(0,0,0,0.25);
        }
        .lt-sub-modal .lt2-name { flex: 1; min-width: 0; font-size: 12.5px; color: #444; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lt-sub-modal .lt2-name .lt2-extreme {
            display: inline-block; margin-left: 6px; padding: 1px 6px; border-radius: 6px;
            font-size: 9.5px; font-weight: 800; color: #ff5d7a; border: 1px solid rgba(255, 93, 122, 0.5); vertical-align: 1px;
        }
        .lt-sub-modal .lt2-pct { font-size: 12.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
        .lt-sub-modal .lt2-foot { margin-top: 14px; font-size: 11px; color: #999; text-align: center; line-height: 1.7; }
        body.dark-mode .lt-sub-modal .lt2-row { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.10); }
        body.dark-mode .lt-sub-modal .lt2-name { color: #ddd; }
        body.dark-mode .lt-sub-modal .lt2-foot { color: #888; }

        /* —— 获奖历史内容 —— */
        .lt-sub-modal .lt2-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; flex-shrink: 0; }
        .lt-sub-modal .lt2-chip {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 6px 14px; border-radius: 999px; cursor: pointer; user-select: none;
            border: 1px solid #e2e6ef; background: #fafbfd; color: #777;
            font-size: 12px; font-weight: 700; transition: all 0.2s ease;
        }
        .lt-sub-modal .lt2-chip:hover { border-color: #667eea; color: #667eea; }
        .lt-sub-modal .lt2-chip.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-color: transparent; color: #fff; }
        .lt-sub-modal .lt2-chip b { font-weight: 800; opacity: 0.85; }
        .lt-sub-modal .lt2-hlist { display: flex; flex-direction: column; gap: 6px; }
        .lt-sub-modal .lt2-hrow {
            display: flex; align-items: center; gap: 11px;
            padding: 9px 12px; border-radius: 10px;
            background: #fafbfd; border: 1px solid #eef0f5;
        }
        .lt-sub-modal .lt2-hico {
            width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px;
            box-shadow: inset 0 -4px 8px rgba(0,0,0,0.25);
        }
        .lt-sub-modal .lt2-hinfo { flex: 1; min-width: 0; }
        .lt-sub-modal .lt2-hname { font-size: 12.5px; color: #444; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lt-sub-modal .lt2-hmeta { font-size: 10.5px; color: #999; margin-top: 2px; }
        .lt-sub-modal .lt2-htype {
            padding: 3px 10px; border-radius: 999px; font-size: 10.5px; font-weight: 800; flex-shrink: 0;
        }
        .lt-sub-modal .lt2-hrar { font-size: 10.5px; font-weight: 800; flex-shrink: 0; }
        .lt-sub-modal .lt2-empty { font-size: 12.5px; color: #999; text-align: center; padding: 30px 0 20px; line-height: 1.9; }
        body.dark-mode .lt-sub-modal .lt2-hrow { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.10); }
        body.dark-mode .lt-sub-modal .lt2-hname { color: #ddd; }
        body.dark-mode .lt-sub-modal .lt2-chip { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); color: #aaa; }
        body.dark-mode .lt-sub-modal .lt2-chip.active { color: #fff; }

        /* —— 投币口弹窗内容 —— */
        .lt-sub-modal .lt2-coin-rows { display: flex; flex-direction: column; gap: 8px; }
        .lt-sub-modal .lt2-coin-row {
            display: flex; align-items: center; gap: 12px;
            padding: 10px 14px; border-radius: 12px;
            background: #fafbfd; border: 1px solid #eef0f5;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .lt-sub-modal .lt2-coin-row.lt2-active { border-color: #667eea; box-shadow: 0 0 0 2px rgba(102,126,234,0.18); }
        .lt-sub-modal .lt2-coin-ico {
            width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px;
            box-shadow: inset 0 -4px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4);
        }
        .lt-sub-modal .lt2-coin-info { flex: 1; min-width: 0; }
        .lt-sub-modal .lt2-coin-name { font-size: 13px; font-weight: 800; color: #333; }
        .lt-sub-modal .lt2-coin-name .lt2-owned { margin-left: 8px; font-size: 11px; font-weight: 700; color: #999; }
        .lt-sub-modal .lt2-coin-cap { font-size: 11px; color: #888; margin-top: 3px; line-height: 1.5; }
        .lt-sub-modal .lt2-coin-step { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .lt-sub-modal .lt2-step-btn {
            width: 30px; height: 30px; border-radius: 9px; border: 1px solid #dfe3ee; background: #fff;
            color: #555; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.18s ease;
        }
        .lt-sub-modal .lt2-step-btn:hover:not(:disabled) { border-color: #667eea; color: #667eea; }
        .lt-sub-modal .lt2-step-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .lt-sub-modal .lt2-coin-qty { min-width: 26px; text-align: center; font-size: 15px; font-weight: 800; color: #333; font-variant-numeric: tabular-nums; }
        .lt-sub-modal .lt2-coin-preview {
            margin-top: 12px; padding: 10px 14px; border-radius: 10px;
            background: #fff8e8; border: 1px solid #f3e3b3; color: #8a6d1a;
            font-size: 12px; line-height: 1.7;
        }
        .lt-sub-modal .lt2-coin-preview b { font-weight: 800; }
        .lt-sub-modal .lt2-coin-actions { display: flex; gap: 10px; margin-top: 14px; }
        .lt-sub-modal .lt2-coin-btn {
            flex: 1; padding: 11px 0; border-radius: 10px; border: none; cursor: pointer;
            font-size: 13.5px; font-weight: 800; transition: all 0.2s ease;
        }
        .lt-sub-modal .lt2-coin-clear { background: #f0f1f5; color: #666; }
        .lt-sub-modal .lt2-coin-clear:hover { background: #e4e6ec; }
        .lt-sub-modal .lt2-coin-ok { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }
        .lt-sub-modal .lt2-coin-ok:hover { filter: brightness(1.08); }
        body.dark-mode .lt-sub-modal .lt2-coin-row { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.10); }
        body.dark-mode .lt-sub-modal .lt2-coin-name { color: #ddd; }
        body.dark-mode .lt-sub-modal .lt2-coin-cap { color: #999; }
        body.dark-mode .lt-sub-modal .lt2-step-btn { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.16); color: #ccc; }
        body.dark-mode .lt-sub-modal .lt2-coin-qty { color: #eee; }
        body.dark-mode .lt-sub-modal .lt2-coin-preview { background: rgba(247,183,51,0.10); border-color: rgba(247,183,51,0.3); color: #ffd873; }
        body.dark-mode .lt-sub-modal .lt2-coin-clear { background: rgba(255,255,255,0.10); color: #bbb; }

        /* —— 获奖历史：清空按钮（位于筛选 chips 行右侧） —— */
        .lt-sub-modal .lt2-clear-hist {
            margin-left: auto; display: inline-flex; align-items: center; gap: 6px;
            padding: 6px 14px; border-radius: 999px; cursor: pointer; user-select: none;
            border: 1px solid rgba(231, 76, 60, 0.45); background: rgba(231, 76, 60, 0.06); color: #e74c3c;
            font-size: 12px; font-weight: 700; transition: all 0.2s ease;
        }
        .lt-sub-modal .lt2-clear-hist:hover { background: #e74c3c; color: #fff; border-color: #e74c3c; }
        .lt-sub-modal .lt2-btn-danger { background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff; }
        .lt-sub-modal .lt2-btn-danger:hover { filter: brightness(1.08); }
        body.dark-mode .lt-sub-modal .lt2-clear-hist { background: rgba(231, 76, 60, 0.14); }

        /* —— 投币数量手动输入 —— */
        .lt-sub-modal .lt2-coin-qty-input {
            width: 48px; text-align: center; font-size: 15px; font-weight: 800; color: #333;
            border: 1.5px solid #dfe3ee; border-radius: 9px; padding: 4px 2px; outline: none;
            font-variant-numeric: tabular-nums; background: #fff; transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .lt-sub-modal .lt2-coin-qty-input:focus { border-color: #667eea; box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15); }
        body.dark-mode .lt-sub-modal .lt2-coin-qty-input { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.16); color: #eee; }

        /* —— 开发者调试弹窗 —— */
        .lt-sub-modal .lt2-dev-rows { display: flex; flex-direction: column; gap: 10px; }
        .lt-sub-modal .lt2-dev-row {
            display: flex; align-items: center; gap: 14px;
            padding: 12px 14px; border-radius: 12px;
            background: #fafbfd; border: 1px solid #eef0f5;
        }
        .lt-sub-modal .lt2-dev-info { flex: 1; min-width: 0; }
        .lt-sub-modal .lt2-dev-name { font-size: 13px; font-weight: 800; color: #333; }
        .lt-sub-modal .lt2-dev-desc { font-size: 11.5px; color: #888; margin-top: 3px; line-height: 1.6; }
        .lt2-dev-switch {
            position: relative; width: 46px; height: 26px; border-radius: 999px; flex-shrink: 0;
            background: #d5d9e4; border: none; cursor: pointer; transition: background 0.2s ease; padding: 0;
        }
        .lt2-dev-switch::after {
            content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%;
            background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.25); transition: left 0.2s ease;
        }
        .lt2-dev-switch.on { background: linear-gradient(135deg, #667eea, #764ba2); }
        .lt2-dev-switch.on::after { left: 23px; }
        body.dark-mode .lt-sub-modal .lt2-dev-row { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.10); }
        body.dark-mode .lt-sub-modal .lt2-dev-name { color: #ddd; }
        body.dark-mode .lt-sub-modal .lt2-dev-desc { color: #999; }

        /* ====== 响应式 ====== */
        @media (max-width: 980px) {
            #lotteryModal .lt-main { padding: 18px 14px 20px; justify-content: flex-start; }
            #lotteryModal .lt-header { padding: 12px 14px; gap: 10px; }
            #lotteryModal .lt-title-badge { display: none; }
            #lotteryModal .lt-refresh-tag { font-size: 11px; padding: 6px 10px; }
            #lotteryModal .lt-title h2 { font-size: 17px; }
        }
        `;

        var style = document.createElement('style');
        style.id = 'lottery-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==================== 弹窗构建 ====================
    var _ltModalBuilt = false;
    function ensureLotteryModal() {
        if (_ltModalBuilt) return;
        _ltInjectCSS();

        var modal = document.createElement('div');
        modal.id = 'lotteryModal';
        modal.innerHTML = `
            <div class="lt-fullscreen">
                <div class="lt-header">
                    <div class="lt-title">
                        <div class="lt-title-ico"><i class="fas fa-dice-five"></i></div>
                        <h2>幸运抽奖机</h2>
                        <span class="lt-title-badge">LUCKY DRAW</span>
                    </div>
                    <span class="lt-refresh-tag" id="ltRefreshTag"><i class="fas fa-hourglass-half"></i> --</span>
                    <button class="lt-close" id="ltModalClose" title="关闭"><i class="fas fa-times"></i></button>
                </div>
                <div class="lt-body">
                    <div class="lt-main">
                        <div class="lt-tabs" id="ltTabs"></div>
                        <div class="lt-machine-wrap" id="ltMachineWrap">
                            <div class="lt-machine" id="ltMachine">
                                <div class="lt-bulbs" id="ltBulbs"></div>
                                <div class="lt-machine-label">PRE Launcher · Lucky Draw</div>
                                <div class="lt-marquee" id="ltMarquee">
                                    <div class="lt-strip" id="ltStrip"></div>
                                    <div class="lt-fade lt-fade-l"></div>
                                    <div class="lt-fade lt-fade-r"></div>
                                    <div class="lt-pointer"><div class="lt-pointer-gem"></div><div class="lt-pointer-line"></div></div>
                                </div>
                                <div class="lt-machine-foot">
                                    <div class="lt-coin-status" id="ltCoinStatus"></div>
                                    <button class="lt-coin-slot" id="ltCoinSlot" title="点击投入幸运币">
                                        <span class="lt-slot-coin"><i class="fas fa-coins"></i></span>
                                        <span class="lt-slot-body"><span class="lt-slot-slit"></span><span class="lt-slot-label">投币口</span></span>
                                        <span class="lt-slot-badge" id="ltSlotBadge"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="lt-confetti" id="ltConfetti"></div>
                        </div>
                        <div class="lt-btn-area">
                            <button class="lt-draw-btn" id="ltDrawBtn"><i class="fas fa-gift"></i> 立即抽奖</button>
                            <span class="lt-btn-sub" id="ltBtnSub"></span>
                        </div>
                        <div class="lt-result" id="ltResult"></div>
                        <div class="lt-sub-btns">
                            <button class="lt-sub-btn lt-odds" id="ltOddsBtn"><i class="fas fa-percent"></i> 概率详情</button>
                            <button class="lt-sub-btn lt-hist" id="ltHistoryBtn"><i class="fas fa-clock-rotate-left"></i> 获奖历史</button>
                            <button class="lt-sub-btn lt-devbtn" id="ltDevBtn" style="display:none"><i class="fas fa-bug"></i> 开发者调试</button>
                        </div>
                    </div>
                </div>
                <div class="lt-footer">奖励自动发放至仓库 · 概率按物品价值由低档至高档递减 · 详细概率请点击「概率详情」查看</div>
            </div>
        `;
        document.body.appendChild(modal);

        // 灯泡
        var bulbs = modal.querySelector('#ltBulbs');
        var bulbHtml = '';
        for (var i = 0; i < 16; i++) bulbHtml += '<span class="lt-bulb" style="--i:' + i + '"></span>';
        bulbs.innerHTML = bulbHtml;

        // 事件
        modal.querySelector('#ltModalClose').addEventListener('click', function () {
            modal.classList.remove('show');
        });
        modal.querySelector('#ltDrawBtn').addEventListener('click', ltDoDraw);
        modal.querySelector('#ltOddsBtn').addEventListener('click', ltOpenOddsModal);
        modal.querySelector('#ltHistoryBtn').addEventListener('click', function () { ltOpenHistoryModal('all'); });
        modal.querySelector('#ltDevBtn').addEventListener('click', ltOpenDevModal);
        modal.querySelector('#ltCoinSlot').addEventListener('click', function () {
            if (_ltSpinning) return;
            ltOpenCoinModal();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            // 子弹窗（概率详情 / 获奖历史）打开时优先由子弹窗自身响应 ESC，不关闭主弹窗
            if (document.querySelector('.lt-sub-overlay')) return;
            var m = document.getElementById('lotteryModal');
            if (m && m.classList.contains('show')) m.classList.remove('show');
        });

        _ltModalBuilt = true;

        // 倒计时定时器（30 秒一次，仅弹窗打开时刷新文案）
        setInterval(function () {
            var m = document.getElementById('lotteryModal');
            if (!m || !m.classList.contains('show')) return;
            _ltRenderRefreshTag();
        }, 30000);
    }

    // ==================== 通用子弹窗骨架（复用启动器 milestone-modal 样式） ====================
    function _ltOpenSubModal(opts) {
        var overlay = document.createElement('div');
        overlay.className = 'milestone-modal-overlay lt-sub-overlay';
        var modal = document.createElement('div');
        modal.className = 'milestone-modal lt-sub-modal';
        if (opts.width) modal.style.maxWidth = opts.width;
        if (opts.height) modal.style.height = opts.height; // 固定高度（内容增减不改变弹窗大小）
        modal.innerHTML =
            '<div class="milestone-modal-header">' +
                '<h3><i class="' + opts.icon + '" style="color:' + (opts.iconColor || '#667eea') + '"></i> ' + opts.title + '</h3>' +
                '<button class="milestone-close"><i class="fas fa-times"></i></button>' +
            '</div>' +
            (opts.tip ? '<div class="lt-sub-tip"><i class="fas fa-circle-info"></i><span>' + opts.tip + '</span></div>' : '') +
            '<div class="lt-sub-body">' + opts.bodyHtml + '</div>';
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        function close() {
            if (typeof animateModalClose === 'function') {
                animateModalClose(overlay);
            } else if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            document.removeEventListener('keydown', onKey);
        }
        function onKey(e) {
            if (e.key !== 'Escape') return;
            var subs = document.querySelectorAll('.lt-sub-overlay');
            if (subs.length && subs[subs.length - 1] !== overlay) return; // 多层弹窗时仅最上层响应 ESC
            close();
        }

        overlay.querySelector('.milestone-close').addEventListener('click', close);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        document.addEventListener('keydown', onKey);
        if (typeof opts.onMount === 'function') opts.onMount(modal, close);
        return modal;
    }

    // ==================== 概率详情弹窗 ====================
    function _ltBuildOddsHtml() {
        var pool = ltGetPool();
        var total = 0;
        pool.forEach(function (p) { total += p.weight; });
        var html = '<div class="lt2-groups">';
        LT_RARITY_ORDER.forEach(function (rar) {
            var rows = pool.filter(function (p) { return p.item.rarity === rar; });
            if (!rows.length) return;
            var rc = LT_RARITY_COLOR[rar];
            var groupWeight = 0;
            rows.forEach(function (p) { groupWeight += p.weight; });
            html += '<div class="lt2-group">' +
                '<div class="lt2-group-head" style="color:' + rc + '"><span><i class="fas fa-tag" style="margin-right:6px;"></i>' + (LT_RARITY_NAME[rar] || rar) + '档位</span>' +
                '<span class="lt2-total" style="color:' + rc + '">合计 ' + (groupWeight / total * 100).toFixed(2) + '%</span></div>' +
                '<div class="lt2-rows">';
            rows.forEach(function (p) {
                var it = p.item;
                html += '<div class="lt2-row" title="' + it.name + '">' +
                    '<div class="lt2-ico" style="background:' + _ltIconBg(it, rc) + '"><i class="' + (it.icon || 'fas fa-box') + '"></i></div>' +
                    '<div class="lt2-name">' + it.name +
                    (it._requireExtreme ? '<span class="lt2-extreme">极限</span>' : '') +
                    '</div>' +
                    '<div class="lt2-pct" style="color:' + rc + '">' + (p.weight / total * 100).toFixed(2) + '%</div>' +
                '</div>';
            });
            html += '</div></div>';
        });
        html += '</div>' +
            '<div class="lt2-foot">以上为单次抽取的公示概率，合计 100%（展示值四舍五入至小数点后两位）<br>奖励发放至仓库</div>';
        return html;
    }

    function ltOpenOddsModal() {
        _ltOpenSubModal({
            icon: 'fas fa-percent',
            iconColor: '#667eea',
            title: '幸运抽奖机 · 概率详情',
            width: '560px',
            tip: '以下为<b>单次抽取</b>的公示概率，每日 / 每周 / 月度抽取共享同一奖池与概率，奖励按物品价值由低档至高档递减。投入幸运币可在单次抽取中进一步提升指定档位概率（详见投币口与各幸运币说明）。',
            bodyHtml: _ltBuildOddsHtml()
        });
    }

    // ==================== 获奖历史弹窗 ====================
    var LT_HIST_FILTERS = [
        { key: 'all', name: '全部' },
        { key: 'daily', name: '每日' },
        { key: 'weekly', name: '每周' },
        { key: 'monthly', name: '月度' }
    ];

    function _ltBuildHistoryListHtml(filter) {
        var data = ltGetData();
        var recs = data.history.filter(function (r) { return filter === 'all' || r.type === filter; });
        if (!recs.length) {
            return '<div class="lt2-empty"><i class="fas fa-inbox" style="font-size:30px;opacity:0.4;display:block;margin-bottom:8px;"></i>90 日内暂无获奖记录<br>首次好运从「立即抽奖」开始</div>';
        }
        var rowsHtml = '';
        recs.forEach(function (rec) {
            var it = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS[rec.itemId] : null;
            if (!it) return;
            var rc = LT_RARITY_COLOR[it.rarity] || '#999';
            var t = new Date(rec.t);
            var timeStr = t.getFullYear() + '/' + ('0' + (t.getMonth() + 1)).slice(-2) + '/' + ('0' + t.getDate()).slice(-2) +
                ' ' + ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2);
            var typeInfo = LT_TYPES[rec.type] || { name: rec.type, color: '#999' };
            rowsHtml += '<div class="lt2-hrow">' +
                '<div class="lt2-hico" style="background:' + _ltIconBg(it, rc) + '"><i class="' + (it.icon || 'fas fa-box') + '"></i></div>' +
                '<div class="lt2-hinfo">' +
                    '<div class="lt2-hname">' + it.name + ' ×1</div>' +
                    '<div class="lt2-hmeta">' + timeStr + '</div>' +
                '</div>' +
                '<span class="lt2-hrar" style="color:' + rc + '">' + (LT_RARITY_NAME[it.rarity] || '') + '</span>' +
                '<span class="lt2-htype" style="color:' + typeInfo.color + ';background:' + _ltAlpha(typeInfo.color, 0.12) + ';border:1px solid ' + _ltAlpha(typeInfo.color, 0.35) + '">' + typeInfo.name + '</span>' +
            '</div>';
        });
        return '<div class="lt2-hlist">' + rowsHtml + '</div>';
    }

    // 渲染获奖历史弹窗主体（筛选 chips + 清空按钮 + 记录列表）；切换筛选 / 清空后就地刷新，弹窗尺寸固定不变
    function _ltRenderHistoryBody(modal, filter) {
        var body = modal.querySelector('.lt-sub-body');
        if (!body) return;
        var data = ltGetData();
        var counts = { all: data.history.length, daily: 0, weekly: 0, monthly: 0 };
        data.history.forEach(function (r) { if (counts[r.type] !== undefined) counts[r.type]++; });

        var chipsHtml = '';
        LT_HIST_FILTERS.forEach(function (f) {
            chipsHtml += '<span class="lt2-chip' + (f.key === filter ? ' active' : '') + '" data-filter="' + f.key + '">' +
                f.name + ' <b>' + counts[f.key] + '</b></span>';
        });

        body.innerHTML =
            '<div class="lt2-chips">' + chipsHtml +
                '<button class="lt2-clear-hist" id="ltHistClear"><i class="fas fa-trash-can"></i> 清空历史记录</button>' +
            '</div>' +
            '<div class="lt2-hist-result">' + _ltBuildHistoryListHtml(filter) + '</div>';

        body.querySelectorAll('.lt2-chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                filter = this.getAttribute('data-filter');
                body.querySelectorAll('.lt2-chip').forEach(function (c) { c.classList.remove('active'); });
                this.classList.add('active');
                var box = body.querySelector('.lt2-hist-result');
                if (box) box.innerHTML = _ltBuildHistoryListHtml(filter);
            });
        });

        var clearBtn = body.querySelector('#ltHistClear');
        if (clearBtn) clearBtn.addEventListener('click', function () { _ltOpenHistoryClearConfirm(modal, filter); });
    }

    // 清空历史：二级确认弹窗，点击「确认清空」后才执行
    function _ltOpenHistoryClearConfirm(histModal, filter) {
        _ltOpenSubModal({
            icon: 'fas fa-triangle-exclamation',
            iconColor: '#e74c3c',
            title: '清空获奖历史',
            width: '420px',
            tip: '将删除最近 <b>90 日</b>内的<b>全部</b>获奖记录（含每日 / 每周 / 月度），此操作不可恢复，请谨慎操作。',
            bodyHtml:
                '<div class="lt2-coin-actions" style="margin-top:4px;">' +
                    '<button class="lt2-coin-btn lt2-coin-clear" id="ltHistCancel"><i class="fas fa-xmark"></i> 取消</button>' +
                    '<button class="lt2-coin-btn lt2-btn-danger" id="ltHistConfirm"><i class="fas fa-trash-can"></i> 确认清空</button>' +
                '</div>',
            onMount: function (modal, close) {
                modal.querySelector('#ltHistCancel').addEventListener('click', close);
                modal.querySelector('#ltHistConfirm').addEventListener('click', function () {
                    var d = ltGetData();
                    d.history = [];
                    ltSaveData(d);
                    close();
                    if (typeof showToast === 'function') {
                        showToast({ type: 'success', title: '获奖历史', message: '已清空全部获奖记录' });
                    }
                    _ltRenderHistoryBody(histModal, filter); // 就地刷新列表与计数
                });
            }
        });
    }

    function ltOpenHistoryModal(filter) {
        filter = filter || 'all';
        _ltOpenSubModal({
            icon: 'fas fa-clock-rotate-left',
            iconColor: '#f39c12',
            title: '幸运抽奖机 · 获奖历史',
            width: '620px',
            height: '600px', // 固定高度，不随历史条目增减而变化
            tip: '保存最近 <b>90 日</b>内的获奖记录（超期自动清理），可按每日 / 每周 / 月度抽取类型筛选查看。',
            bodyHtml: '',
            onMount: function (modal) { _ltRenderHistoryBody(modal, filter); }
        });
    }

    // ==================== 单元格 HTML ====================
    function _ltCellHtml(entry, isWin) {
        var it = entry.item;
        var rc = LT_RARITY_COLOR[it.rarity] || '#fff';
        return '<div class="lt-cell' + (isWin ? ' lt-win' : '') + '" style="--rc:' + rc + '">' +
            '<div class="lt-cell-ico" style="background:' + _ltIconBg(it, rc) + '"><i class="' + (it.icon || 'fas fa-box') + '"></i></div>' +
            '<div class="lt-cell-name">' + it.name + '</div>' +
            '<div class="lt-cell-rar" style="color:' + rc + '">' + (LT_RARITY_NAME[it.rarity] || '道具') + '</div>' +
        '</div>';
    }

    // ==================== 渲染 ====================
    var _ltActiveType = 'daily';
    var _ltSpinning = false;
    var _ltSpinToken = 0;

    // 三种抽取的本期次数是否全部耗尽（调试「无限抽取」开启时恒为 false，不受影响）
    function ltAllDepleted() {
        if (ltDevFlags().unlimited) return false;
        var data = ltGetData();
        var keys = ['daily', 'weekly', 'monthly'];
        for (var i = 0; i < keys.length; i++) {
            if ((data[keys[i]].used || 0) < LT_TYPES[keys[i]].max) return false;
        }
        return true;
    }

    function ltRenderAll() {
        ltRenderTabs();
        ltRenderStripIdle();
        ltUpdateBtnState();
        _ltRenderRefreshTag();
        ltRenderCoinUI();
        var devBtn = document.getElementById('ltDevBtn');
        if (devBtn) devBtn.style.display = ltIsDevMode() ? '' : 'none'; // 开发者模式开启时才显示调试按钮
        var result = document.getElementById('ltResult');
        if (result) {
            result.classList.remove('lt-show');
            result.innerHTML = '<div class="lt-result-hint" style="margin:0 auto">点击「立即抽奖」，好运正在派送中 ✦</div>';
        }
    }

    function ltRenderTabs() {
        var wrap = document.getElementById('ltTabs');
        if (!wrap) return;
        var data = ltGetData();
        var unlimited = ltDevFlags().unlimited;
        var html = '';
        Object.keys(LT_TYPES).forEach(function (k) {
            var t = LT_TYPES[k];
            var remain = unlimited ? '∞' : Math.max(0, t.max - (data[k].used || 0));
            html += '<div class="lt-tab' + (k === _ltActiveType ? ' active' : '') + '" data-type="' + k + '">' +
                '<i class="' + t.icon + '"></i> ' + t.name +
                '<span class="lt-tab-count' + (!unlimited && remain === 0 ? ' done' : '') + '">' + remain + '</span>' +
            '</div>';
        });
        wrap.innerHTML = html;
        wrap.querySelectorAll('.lt-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                if (_ltSpinning) return;
                var type = this.getAttribute('data-type');
                if (type === _ltActiveType) return;
                _ltActiveType = type;
                ltRenderAll();
            });
        });
    }

    // 空闲状态跑马灯：随机物品铺满窗口区域；额度全部耗尽时改显示等待备货文本（无物品、无指针）
    function ltRenderStripIdle() {
        var strip = document.getElementById('ltStrip');
        var marquee = document.getElementById('ltMarquee');
        var machine = document.getElementById('ltMachine');
        if (!strip || !marquee) return;
        if (ltAllDepleted()) {
            if (machine) machine.classList.add('lt-depleted');
            strip.style.transition = 'none';
            strip.style.transform = 'translateX(0)';
            strip.innerHTML =
                '<div class="lt-strip-empty">' +
                    '<span class="lt-empty-text">⛔ 额度已耗尽，请等待备货 ⛔</span>' +
                '</div>';
            return;
        }
        if (machine) machine.classList.remove('lt-depleted');
        var pool = ltGetPool();
        if (!pool.length) {
            strip.innerHTML = '<div style="padding:30px;color:#9a95c0;font-size:13px;">仓库道具目录加载失败，请刷新页面后重试</div>';
            return;
        }
        var count = Math.max(8, Math.ceil(marquee.clientWidth / (LT_CELL_W + LT_CELL_GAP)) + 2);
        var html = '';
        for (var i = 0; i < count; i++) html += _ltCellHtml(ltPickOne(), false);
        strip.style.transition = 'none';
        strip.style.transform = 'translateX(0)';
        strip.innerHTML = html;
    }

    function ltUpdateBtnState() {
        var btn = document.getElementById('ltDrawBtn');
        var sub = document.getElementById('ltBtnSub');
        if (!btn || !sub) return;
        var data = ltGetData();
        var t = LT_TYPES[_ltActiveType];
        var st = data[_ltActiveType];
        var dev = ltDevFlags();
        var remain = Math.max(0, t.max - (st.used || 0));
        if (_ltSpinning) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-dice-five"></i> 转动中...';
            sub.className = 'lt-btn-sub';
            sub.innerHTML = '<i class="fas fa-spinner"></i> 命运的齿轮正在转动';
            return;
        }
        if (!dev.unlimited && remain <= 0) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-check"></i> 本期已抽完';
            sub.className = 'lt-btn-sub lt-sub-done';
            sub.innerHTML = '<i class="fas fa-hourglass-half"></i> 距离刷新还剩 ' + _ltCountdownText(_ltActiveType) + '（' + t.refresh + '）';
            return;
        }
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-gift"></i> 立即抽奖';
        sub.className = 'lt-btn-sub';
        sub.innerHTML = dev.unlimited
            ? '<i class="fas fa-infinity"></i> 调试模式 · 无限次抽取 · ' + t.refresh
            : '<i class="fas fa-ticket"></i> ' + t.short + '剩余 ' + remain + ' / ' + t.max + ' 次 · ' + t.refresh;
    }

    function _ltRenderRefreshTag() {
        var tag = document.getElementById('ltRefreshTag');
        if (!tag) return;
        var t = LT_TYPES[_ltActiveType];
        tag.innerHTML = '<i class="fas fa-hourglass-half"></i> ' + t.name + '刷新倒计时：' + _ltCountdownText(_ltActiveType);
        tag.title = t.refresh + '（UTC+8）';
    }

    // ==================== 投币口 UI ====================
    function ltRenderCoinUI() {
        var status = document.getElementById('ltCoinStatus');
        var slot = document.getElementById('ltCoinSlot');
        var badge = document.getElementById('ltSlotBadge');
        if (!status || !slot) return;
        var coinFace = slot.querySelector('.lt-slot-coin');
        // 额度全部耗尽：投币口置灰不可点击，金币图标换为 ⛔
        if (ltAllDepleted()) {
            slot.disabled = true;
            slot.classList.remove('lt-loaded');
            slot.classList.add('lt-depleted');
            if (coinFace) coinFace.innerHTML = '⛔';
            if (badge) badge.style.display = 'none';
            status.innerHTML = '<span class="lt-coin-hint"><i class="fas fa-ban"></i> 三种抽取额度均已耗尽，投币口暂不可用（等待刷新备货）</span>';
            return;
        }
        slot.disabled = false;
        slot.classList.remove('lt-depleted');
        if (coinFace) coinFace.innerHTML = '<i class="fas fa-coins"></i>';
        var data = ltGetData();
        var p = data.pendingCoin;
        slot.classList.toggle('lt-loaded', !!(p && p.qty > 0));
        if (p && p.qty > 0) {
            var cfg = LT_COIN_TYPES[p.id];
            var it = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS[p.id] : null;
            var cc = it ? it.color : '#f1c40f';
            if (badge) {
                badge.innerHTML = '<i class="fas fa-coins"></i> ×' + p.qty;
                badge.style.background = cc;
                badge.style.display = 'flex';
            }
            var after = (_ltTierProb(_ltBuildBoostedPool(p.id, p.qty), cfg.tier) * 100).toFixed(2);
            status.innerHTML =
                '<span class="lt-coin-loaded" style="color:' + cc + '"><i class="fas fa-coins"></i> 已投入 ' + cfg.name + ' ×' + p.qty + '</span>' +
                '<span class="lt-coin-boost">下一次抽取 ' + LT_RARITY_NAME[cfg.tier] + '档概率 → 约 ' + after + '%</span>';
        } else {
            if (badge) badge.style.display = 'none';
            status.innerHTML = '<span class="lt-coin-hint"><i class="fas fa-arrow-right"></i> 投入幸运币可提升指定档位概率（点击投币口选择）</span>';
        }
    }

    // ==================== 投币口弹窗 ====================
    var _ltCoinDraft = null; // { id, qty } 弹窗内的临时投币草稿

    function _ltCoinOwned(id) {
        return (typeof warehouseGetTotalItemCount === 'function') ? warehouseGetTotalItemCount(id) : 0;
    }

    function _ltRenderCoinRows(modal) {
        var rowsBox = modal.querySelector('#ltCoinRows');
        if (!rowsBox) return;
        var devFree = ltDevFlags().freeCoins;
        var html = '';
        Object.keys(LT_COIN_TYPES).forEach(function (id) {
            var cfg = LT_COIN_TYPES[id];
            var it = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS[id] : null;
            if (!it) return;
            var active = !!(_ltCoinDraft && _ltCoinDraft.id === id && _ltCoinDraft.qty > 0);
            var qty = active ? _ltCoinDraft.qty : 0;
            var maxQty = devFree ? LT_COIN_MAX : Math.min(LT_COIN_MAX, _ltCoinOwned(id));
            var ownedText = devFree ? ('持有 ' + _ltCoinOwned(id) + ' · 调试：无视数量') : ('持有 ' + _ltCoinOwned(id));
            html += '<div class="lt2-coin-row' + (active ? ' lt2-active' : '') + '" data-id="' + id + '">' +
                '<div class="lt2-coin-ico" style="background:' + _ltIconBg(it, cfg.tier && LT_RARITY_COLOR[cfg.tier]) + '"><i class="' + it.icon + '"></i></div>' +
                '<div class="lt2-coin-info">' +
                    '<div class="lt2-coin-name">' + it.name + '<span class="lt2-owned">' + ownedText + '</span></div>' +
                    '<div class="lt2-coin-cap">下一次抽取' + LT_RARITY_NAME[cfg.tier] + '档奖品概率提升 · 档位概率上限 ' + Math.round(cfg.cap * 100) + '% · 不同档位不可同时投入</div>' +
                '</div>' +
                '<div class="lt2-coin-step">' +
                    '<button class="lt2-step-btn" data-act="minus"' + (qty <= 0 ? ' disabled' : '') + '>−</button>' +
                    '<input class="lt2-coin-qty-input" type="text" inputmode="numeric" value="' + qty + '">' +
                    '<button class="lt2-step-btn" data-act="plus"' + (qty >= maxQty ? ' disabled' : '') + '>＋</button>' +
                '</div>' +
            '</div>';
        });
        rowsBox.innerHTML = html;

        // 草稿更新（数量自动钳制到 0 ~ 上限；置 0 即清空该档位）
        // 注意：仅在弹窗打开时初始化草稿，渲染过程绝不回读 pendingCoin，
        //       否则「清空 / 减到 0」会立即被已保存的投币状态覆盖（曾导致按钮失效的 bug）
        function setQty(id, v) {
            var maxQty = ltDevFlags().freeCoins ? LT_COIN_MAX : Math.min(LT_COIN_MAX, _ltCoinOwned(id));
            v = Math.max(0, Math.min(maxQty, parseInt(v, 10) || 0));
            _ltCoinDraft = v > 0 ? { id: id, qty: v } : null; // 单一档位，天然互斥
            _ltRenderCoinRows(modal);
            _ltUpdateCoinPreview(modal);
        }

        rowsBox.querySelectorAll('.lt2-coin-row').forEach(function (row) {
            var id = row.getAttribute('data-id');
            var input = row.querySelector('.lt2-coin-qty-input');

            // 手动输入：失焦 / 回车提交，仅允许数字
            if (input) {
                input.addEventListener('focus', function () { this.select(); });
                input.addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 2); });
                input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); this.blur(); } });
                input.addEventListener('change', function () { setQty(id, this.value); });
            }

            // 步进按钮：单击 ±1；长按 420ms 后每 90ms 连发，抬起 / 拖出 / 弹窗关闭即停
            row.querySelectorAll('.lt2-step-btn').forEach(function (btn) {
                var delta = btn.getAttribute('data-act') === 'plus' ? 1 : -1;
                var pressTimer = null, repeatTimer = null, didLongPress = false;
                function stopPress() {
                    clearTimeout(pressTimer);
                    clearInterval(repeatTimer);
                    pressTimer = repeatTimer = null;
                    document.removeEventListener('pointerup', stopPress);
                    document.removeEventListener('pointercancel', stopPress);
                }
                btn.addEventListener('click', function () {
                    if (didLongPress) { didLongPress = false; return; } // 长按结束后的残留 click 不重复计步
                    var cur = (_ltCoinDraft && _ltCoinDraft.id === id) ? _ltCoinDraft.qty : 0;
                    setQty(id, cur + delta);
                });
                btn.addEventListener('pointerdown', function () {
                    if (btn.disabled) return;
                    stopPress();
                    didLongPress = false;
                    pressTimer = setTimeout(function () {
                        pressTimer = null;
                        didLongPress = true;
                        repeatTimer = setInterval(function () {
                            if (!modal.isConnected) { stopPress(); return; }
                            var cur = (_ltCoinDraft && _ltCoinDraft.id === id) ? _ltCoinDraft.qty : 0;
                            var maxQty = ltDevFlags().freeCoins ? LT_COIN_MAX : Math.min(LT_COIN_MAX, _ltCoinOwned(id));
                            if ((delta > 0 && cur >= maxQty) || (delta < 0 && cur <= 0)) return; // 到界空转
                            setQty(id, cur + delta);
                        }, 90);
                    }, 420);
                    document.addEventListener('pointerup', stopPress);
                    document.addEventListener('pointercancel', stopPress);
                });
            });
        });
    }

    function _ltUpdateCoinPreview(modal) {
        var box = modal.querySelector('#ltCoinPreview');
        if (!box) return;
        if (_ltCoinDraft && _ltCoinDraft.qty > 0) {
            var cfg = LT_COIN_TYPES[_ltCoinDraft.id];
            var base = (_ltTierProb(ltGetPool(), cfg.tier) * 100).toFixed(2);
            var after = _ltTierProb(_ltBuildBoostedPool(_ltCoinDraft.id, _ltCoinDraft.qty), cfg.tier) * 100;
            box.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> 下一次抽取<b>' + LT_RARITY_NAME[cfg.tier] + '</b>档概率：<b>' + base + '%</b> → <b>' + after.toFixed(2) + '%</b>（上限 ' + Math.round(cfg.cap * 100) + '%，超出部分无效）';
        } else {
            box.innerHTML = '<i class="fas fa-circle-info"></i> 未投入幸运币，将按「概率详情」中的公示概率抽取';
        }
    }

    function ltOpenCoinModal() {
        var data = ltGetData();
        _ltCoinDraft = data.pendingCoin ? { id: data.pendingCoin.id, qty: data.pendingCoin.qty } : null;
        _ltOpenSubModal({
            icon: 'fas fa-coins',
            iconColor: '#f39c12',
            title: '幸运抽奖机 · 投币口',
            width: '580px',
            tip: '投入幸运币可提升<b>下一次抽取</b>对应档位奖品的概率。不同档位不可同时投入，同一档位单次最多投入 <b>10 枚</b>（支持长按 ± 按钮批量增减，或直接输入数量），各档位设有概率上限以防止数值溢出。投币在点击「立即抽奖」时生效并消耗。',
            bodyHtml:
                '<div class="lt2-coin-rows" id="ltCoinRows"></div>' +
                '<div class="lt2-coin-preview" id="ltCoinPreview"></div>' +
                '<div class="lt2-coin-actions">' +
                    '<button class="lt2-coin-btn lt2-coin-clear" id="ltCoinClear"><i class="fas fa-eraser"></i> 清空投币</button>' +
                    '<button class="lt2-coin-btn lt2-coin-ok" id="ltCoinOk"><i class="fas fa-check"></i> 确定投入</button>' +
                '</div>',
            onMount: function (modal, close) {
                _ltRenderCoinRows(modal);
                _ltUpdateCoinPreview(modal);
                modal.querySelector('#ltCoinClear').addEventListener('click', function () {
                    _ltCoinDraft = null;
                    _ltRenderCoinRows(modal);
                    _ltUpdateCoinPreview(modal);
                });
                modal.querySelector('#ltCoinOk').addEventListener('click', function () {
                    var d = ltGetData();
                    d.pendingCoin = (_ltCoinDraft && _ltCoinDraft.qty > 0) ? { id: _ltCoinDraft.id, qty: _ltCoinDraft.qty } : null;
                    ltSaveData(d);
                    ltRenderCoinUI();
                    close();
                    if (d.pendingCoin && typeof showToast === 'function') {
                        var cfg = LT_COIN_TYPES[d.pendingCoin.id];
                        showToast({ type: 'success', title: '投币成功', message: '已投入 ' + cfg.name + ' ×' + d.pendingCoin.qty + '，下一次抽取时生效' });
                    }
                });
            }
        });
    }

    // ==================== 开发者调试弹窗 ====================
    function ltOpenDevModal() {
        var flags = ltDevFlags();
        _ltOpenSubModal({
            icon: 'fas fa-bug',
            iconColor: '#e74c3c',
            title: '幸运抽奖机 · 开发者调试',
            width: '520px',
            tip: '以下调试开关仅用于测试，开启后会影响抽奖机正常规则；切换即时生效并保存在本地，关闭浏览器后仍保留。',
            bodyHtml:
                '<div class="lt2-dev-rows">' +
                    '<div class="lt2-dev-row">' +
                        '<div class="lt2-dev-info">' +
                            '<div class="lt2-dev-name">启用无限次抽取（每日 / 每周 / 月度）</div>' +
                            '<div class="lt2-dev-desc">三种抽取均不再受本期次数上限约束，可连续点击「立即抽奖」进行测试。</div>' +
                        '</div>' +
                        '<button class="lt2-dev-switch' + (flags.unlimited ? ' on' : '') + '" id="ltDevUnlimited" title="点击切换"></button>' +
                    '</div>' +
                    '<div class="lt2-dev-row">' +
                        '<div class="lt2-dev-info">' +
                            '<div class="lt2-dev-name">无视仓库幸运币数量</div>' +
                            '<div class="lt2-dev-desc">投币口不再校验仓库持有数量，可直接投入 1-10 枚；抽取时也不会真正消耗幸运币。</div>' +
                        '</div>' +
                        '<button class="lt2-dev-switch' + (flags.freeCoins ? ' on' : '') + '" id="ltDevFreeCoins" title="点击切换"></button>' +
                    '</div>' +
                '</div>',
            onMount: function (modal) {
                function bindToggle(btnId, key, after) {
                    var btn = modal.querySelector(btnId);
                    if (!btn) return;
                    btn.addEventListener('click', function () {
                        var f = ltDevFlags();
                        f[key] = !f[key];
                        ltSaveDevFlags(f);
                        btn.classList.toggle('on', f[key]);
                        if (after) after(f[key]);
                    });
                }
                bindToggle('#ltDevUnlimited', 'unlimited', function () {
                    ltRenderTabs();
                    ltUpdateBtnState();
                    ltRenderStripIdle(); // 关闭无限抽取后立即恢复/进入额度耗尽显示
                    ltRenderCoinUI();
                });
                bindToggle('#ltDevFreeCoins', 'freeCoins');
            }
        });
    }

    // ==================== 抽奖主流程 ====================
    function ltDoDraw() {
        if (_ltSpinning) return;
        var pool = ltGetPool();
        if (!pool.length) return;
        var data = ltGetData();
        var type = _ltActiveType;
        var t = LT_TYPES[type];
        var st = data[type];
        var devFlags = ltDevFlags();
        if (!devFlags.unlimited && (st.used || 0) >= t.max) {
            if (typeof showToast === 'function') {
                showToast({ type: 'info', title: '幸运抽奖机', message: '本期' + t.name + '次数已用完，' + t.refresh + '。' });
            }
            return;
        }

        // 投币结算：校验持有量 → 消耗 → 生成本次概率加成（随后清空投币状态）
        // 调试模式（无视幸运币数量）：跳过持有校验且不消耗，直接按投入数量生效
        var boost = null;
        var pending = data.pendingCoin;
        if (pending && pending.qty > 0) {
            var coinCfg = LT_COIN_TYPES[pending.id];
            if (devFlags.freeCoins) {
                boost = { id: pending.id, qty: pending.qty };
                data.pendingCoin = null;
            } else {
                var owned = (typeof warehouseGetTotalItemCount === 'function') ? warehouseGetTotalItemCount(pending.id) : 0;
                var useQty = Math.min(pending.qty, owned);
                if (useQty <= 0) {
                    data.pendingCoin = null;
                    if (typeof showToast === 'function') {
                        showToast({ type: 'info', title: '幸运抽奖机', message: '仓库中已无「' + coinCfg.name + '」，本次按公示概率抽取' });
                    }
                } else {
                    if (typeof warehouseConsumeItem === 'function') warehouseConsumeItem(pending.id, useQty);
                    boost = { id: pending.id, qty: useQty };
                    data.pendingCoin = null;
                }
            }
        }

        var winner = ltPickOne(boost ? _ltBuildBoostedPool(boost.id, boost.qty) : null);
        if (!winner) return;

        // 奖励在开抽瞬间入账（动画纯展示，避免中途关闭弹窗丢失奖励）
        st.used = (st.used || 0) + 1;
        data.history.unshift({ t: new Date().toISOString(), type: type, itemId: winner.id });
        if (data.history.length > LT_HISTORY_CAP) data.history.length = LT_HISTORY_CAP;
        if (typeof warehouseAddItem === 'function') {
            warehouseAddItem(winner.id, 1, '幸运抽奖机 · ' + t.name, true);
        }
        ltSaveData(data);

        _ltSpin(winner, type, boost);
    }

    // ==================== 转轮动画（仅 transform/opacity，性能友好） ====================
    function _ltSpin(winner, type, boost) {
        _ltSpinning = true;
        var token = ++_ltSpinToken;
        var strip = document.getElementById('ltStrip');
        var marquee = document.getElementById('ltMarquee');
        var machine = document.getElementById('ltMachine');
        if (!strip || !marquee || !machine) { _ltSpinning = false; return; }

        ltUpdateBtnState();
        ltRenderTabs(); // 刷新次数角标
        ltRenderCoinUI(); // 投币已消耗，恢复投币口空闲态
        var result = document.getElementById('ltResult');
        if (result) {
            result.classList.remove('lt-show');
            result.innerHTML = '<div class="lt-result-hint" style="margin:0 auto"><i class="fas fa-spinner fa-spin"></i> 正在揭晓幸运奖品...</div>';
        }

        // 构建转轮：随机填充 + 指定格放置奖品
        var html = '';
        for (var i = 0; i < LT_STRIP_LEN; i++) {
            html += (i === LT_WIN_INDEX) ? _ltCellHtml(winner, false) : _ltCellHtml(ltPickOne(), false);
        }
        strip.style.transition = 'none';
        strip.style.transform = 'translateX(0)';
        strip.innerHTML = html;
        machine.classList.add('lt-spinning');

        // 强制回流后启动滚动动画
        void strip.offsetWidth;
        var step = LT_CELL_W + LT_CELL_GAP;
        var targetX = LT_WIN_INDEX * step + LT_CELL_W / 2 - marquee.clientWidth / 2;
        strip.style.transition = 'transform ' + LT_SPIN_MS + 'ms cubic-bezier(0.12, 0.72, 0.16, 1)';
        strip.style.transform = 'translateX(-' + targetX + 'px)';

        var settled = false;
        function finish() {
            if (settled || token !== _ltSpinToken) return;
            settled = true;
            machine.classList.remove('lt-spinning');
            machine.classList.add('lt-flash');
            setTimeout(function () { machine.classList.remove('lt-flash'); }, 750);

            // 高亮中奖格 + 彩带
            var winCell = strip.children[LT_WIN_INDEX];
            if (winCell) winCell.classList.add('lt-win');
            _ltBurstConfetti();

            // 结果横幅
            var it = winner.item;
            var rc = LT_RARITY_COLOR[it.rarity] || '#fff';
            if (result) {
                result.innerHTML =
                    '<div class="lt-result-ico" style="background:' + _ltIconBg(it, rc) + '"><i class="' + (it.icon || 'fas fa-box') + '"></i></div>' +
                    '<div>' +
                        '<div class="lt-result-label">恭喜获得 · ' + LT_TYPES[type].name + '</div>' +
                        '<div class="lt-result-name" style="color:' + rc + '">' + it.name + ' ×1</div>' +
                    '</div>' +
                    '<div class="lt-result-hint">奖励已发放至仓库<br><span style="color:' + rc + '">' + (LT_RARITY_NAME[it.rarity] || '') + '品质</span>' +
                    (boost ? '<br><span style="color:#ffd873"><i class="fas fa-coins"></i> ' + LT_COIN_TYPES[boost.id].name + ' ×' + boost.qty + ' 已生效</span>' : '') +
                    '</div>';
                result.classList.add('lt-show');
            }

            _ltSpinning = false;
            ltRenderTabs();
            ltUpdateBtnState();
            ltRenderCoinUI(); // 抽完可能恰好用尽全部额度，同步投币口置灰状态
        }

        // transitionend 一次性结算；同时用 setTimeout 兜底（窗口隐藏/被打断时仍能结算）
        strip.addEventListener('transitionend', function onEnd(e) {
            if (e.target !== strip) return;
            strip.removeEventListener('transitionend', onEnd);
            finish();
        });
        setTimeout(finish, LT_SPIN_MS + 300);
    }

    // ==================== 彩带礼花（26 个粒子，动画结束自动清理） ====================
    function _ltBurstConfetti() {
        var box = document.getElementById('ltConfetti');
        if (!box) return;
        box.innerHTML = '';
        var colors = ['#f7b733', '#667eea', '#e91e63', '#2ecc71', '#9b59b6', '#ffe9b8'];
        var frag = document.createDocumentFragment();
        for (var i = 0; i < 26; i++) {
            var s = document.createElement('span');
            var left = Math.random() * 100;
            var dx = (Math.random() - 0.5) * 280;
            var dur = 1.2 + Math.random() * 0.9;
            var delay = Math.random() * 0.25;
            var rot = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540);
            s.style.left = left + '%';
            s.style.background = colors[i % colors.length];
            s.style.setProperty('--dx', dx.toFixed(0) + 'px');
            s.style.setProperty('--dur', dur.toFixed(2) + 's');
            s.style.setProperty('--delay', delay.toFixed(2) + 's');
            s.style.setProperty('--rot', rot.toFixed(0) + 'deg');
            frag.appendChild(s);
        }
        box.appendChild(frag);
        setTimeout(function () { box.innerHTML = ''; }, 2600);
    }

    // ==================== 对外入口 ====================
    function showLotteryModal() {
        ensureLotteryModal();
        ltGetData(); // 读取即完成跨期重置与历史清理
        ltRenderAll();
        document.getElementById('lotteryModal').classList.add('show');
    }

    window.showLotteryModal = showLotteryModal;
})();
