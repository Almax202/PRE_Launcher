// ==================== 每日/每周任务系统 ====================
// 每日任务：每天重置（UTC+8 00:00:00），每天随机 8 个（模板池 ≥50）
// 每周任务：每周一重置（UTC+8 00:00:00），每周随机 16 个（模板池 ≥50）
// 存储：按账户隔离  key = dailytask_<username>
// 入口：顶部导航栏「每日任务」→ 全屏弹窗（样式自包含，不依赖仓库先打开）

var DAILYTASK_DATA_VERSION = 2;
var DT_DAILY_POOL_SIZE = 8;    // 每天挑选数量
var DT_WEEKLY_POOL_SIZE = 16;  // 每周挑选数量

// ==================== 每日任务模板池（≥50，每天随机选8个）====================
// coinReward ∈ [20, 100]，progressMax ∈ [1, 3]（日常难度略低）
// type: 'auto' 系统自动进度  'manual' 手动触发
var DAILY_TASK_TEMPLATES = [
    // —— 核心操作类（8个基础操作）——
    { id:'d_checkin',    taskKey:'checkin',    name:'每日签到',     icon:'fas fa-calendar-check', color:'#667eea', coinReward:30, progressMax:1, desc:'完成一次每日签到（点击「立即签到」按钮）。' },
    { id:'d_minigame',   taskKey:'minigame',   name:'小游戏达人',   icon:'fas fa-gamepad',        color:'#3498db', coinReward:40, progressMax:1, desc:'启动并游玩任意一个休闲小游戏（进入游戏页即可）。' },
    { id:'d_gacha',      taskKey:'gacha',      name:'抽取好运',     icon:'fas fa-dice-d20',       color:'#9b59b6', coinReward:50, progressMax:1, desc:'在抽卡模拟器中完成任意一次提取（单抽或十连）。' },
    { id:'d_warehouse',  taskKey:'warehouse',  name:'仓库视察',     icon:'fas fa-warehouse',      color:'#2ecc71', coinReward:20, progressMax:1, desc:'打开仓库界面查看道具。' },
    { id:'d_treasure',   taskKey:'treasure',   name:'百宝箱探秘',   icon:'fas fa-box-open',       color:'#e67e22', coinReward:20, progressMax:1, desc:'打开百宝箱页面体验功能。' },
    { id:'d_mail',       taskKey:'mail',       name:'查阅邮件',     icon:'fas fa-envelope',       color:'#1abc9c', coinReward:20, progressMax:1, desc:'打开邮件系统查看消息。' },
    { id:'d_shop',       taskKey:'shop',       name:'商店浏览',     icon:'fas fa-store',          color:'#c0392b', coinReward:30, progressMax:1, desc:'打开商店界面浏览商品。' },

    // —— 次数累加类（progressMax > 1）——
    { id:'d_minigame3',  taskKey:'minigame',   name:'小游戏连击',   icon:'fas fa-gamepad',        color:'#2980b9', coinReward:60, progressMax:3, desc:'游玩任意休闲小游戏累计 3 次。' },
    { id:'d_gacha3',     taskKey:'gacha',      name:'三次抽奖',     icon:'fas fa-dice-d20',       color:'#8e44ad', coinReward:80, progressMax:3, desc:'在抽卡模拟器中完成累计 3 次提取。' },
    { id:'d_warehouse2', taskKey:'warehouse',  name:'仓库常客',     icon:'fas fa-warehouse',      color:'#27ae60', coinReward:40, progressMax:2, desc:'累计打开仓库 2 次。' },
    { id:'d_treasure2',  taskKey:'treasure',   name:'宝箱猎人',     icon:'fas fa-box-open',       color:'#d35400', coinReward:40, progressMax:2, desc:'累计打开百宝箱 2 次。' },
    { id:'d_mail2',      taskKey:'mail',       name:'邮件达人',     icon:'fas fa-envelope',       color:'#16a085', coinReward:40, progressMax:2, desc:'累计打开邮件系统 2 次。' },
    { id:'d_shop2',      taskKey:'shop',       name:'商店老顾客',   icon:'fas fa-store',          color:'#e74c3c', coinReward:40, progressMax:2, desc:'累计打开商店界面 2 次。' },

    // —— 签到类变体 ——
    { id:'d_checkin_early', taskKey:'checkin', name:'早起签到',     icon:'fas fa-sun',            color:'#f1c40f', coinReward:40, progressMax:1, desc:'完成一次每日签到（早鸟版本）。' },
    { id:'d_checkin_streak',taskKey:'checkin', name:'签到达人',    icon:'fas fa-calendar-star',  color:'#e91e63', coinReward:60, progressMax:2, desc:'累计完成 2 次签到（可跨天）。' },

    // —— 小游戏变体 ——
    { id:'d_minigame_fav',  taskKey:'minigame', name:'经典游戏回味', icon:'fas fa-chess',         color:'#27ae60', coinReward:50, progressMax:2, desc:'游玩任意休闲小游戏累计 2 次。' },
    { id:'d_minigame_champ',taskKey:'minigame', name:'休闲大师',     icon:'fas fa-trophy',        color:'#f39c12', coinReward:70, progressMax:3, desc:'游玩任意休闲小游戏累计 3 次。' },

    // —— 抽卡变体 ——
    { id:'d_gacha_ten',     taskKey:'gacha',    name:'欧皇降临',     icon:'fas fa-crown',          color:'#f39c12', coinReward:100,progressMax:1, desc:'完成一次十连抽卡（狂十）。' },
    { id:'d_gacha_single3', taskKey:'gacha',    name:'三次单抽',     icon:'fas fa-dice',           color:'#9b59b6', coinReward:60, progressMax:3, desc:'完成累计 3 次单抽。' },
    { id:'d_gacha_mix',     taskKey:'gacha',    name:'抽取达人',     icon:'fas fa-dice-five',      color:'#8e44ad', coinReward:90, progressMax:2, desc:'完成累计 2 次任意抽卡提取。' },

    // —— 仓库变体 ——
    { id:'d_warehouse_full',taskKey:'warehouse',name:'仓库管理员',   icon:'fas fa-boxes',          color:'#2ecc71', coinReward:60, progressMax:3, desc:'累计打开仓库 3 次。' },

    // —— 百宝箱变体 ——
    { id:'d_treasure_hunt', taskKey:'treasure', name:'寻宝者',       icon:'fas fa-compass',        color:'#e67e22', coinReward:60, progressMax:3, desc:'累计打开百宝箱 3 次。' },

    // —— 邮件变体 ——
    { id:'d_mail_full',     taskKey:'mail',     name:'邮件收发室',   icon:'fas fa-inbox',          color:'#1abc9c', coinReward:60, progressMax:3, desc:'累计打开邮件系统 3 次。' },

    // —— 商店变体 ——
    { id:'d_shop_window',   taskKey:'shop',     name:'逛街达人',     icon:'fas fa-shopping-bag',   color:'#c0392b', coinReward:60, progressMax:3, desc:'累计打开商店界面 3 次。' },

    // —— 组合类（用进度追踪多事件，显示友好文案）——
    { id:'d_all4',      taskKey:'all4',      name:'四巨头',       icon:'fas fa-star',            color:'#f39c12', coinReward:80, progressMax:4, desc:'分别完成签到 / 小游戏 / 抽卡 / 仓库 各 1 次。' },
    { id:'d_mini3gacha2', taskKey:'mini3gacha2', name:'抽玩双线', icon:'fas fa-bolt',           color:'#e91e63', coinReward:90, progressMax:5, desc:'游玩小游戏 3 次 + 抽卡 2 次。' },

    // —— 更多轮换模板 ——
    { id:'d_visit_all',  taskKey:'visit_all', name:'四处逛逛',     icon:'fas fa-map-signs',      color:'#667eea', coinReward:80, progressMax:4, desc:'打开仓库 / 百宝箱 / 邮件 / 商店 各 1 次。' },
    { id:'d_minigame_win', taskKey:'minigame', name:'再来一局',    icon:'fas fa-undo',           color:'#3498db', coinReward:50, progressMax:2, desc:'游玩任意小游戏 2 次。' },
    { id:'d_gacha_collector',taskKey:'gacha',  name:'抽卡收藏家',   icon:'fas fa-layer-group',    color:'#9b59b6', coinReward:70, progressMax:2, desc:'完成 2 次抽卡提取。' },
    { id:'d_checkin_evening',taskKey:'checkin',name:'夜间签到',     icon:'fas fa-moon',           color:'#34495e', coinReward:40, progressMax:1, desc:'完成一次每日签到。' },
    { id:'d_warehouse_check',taskKey:'warehouse',name:'盘库',       icon:'fas fa-clipboard-list', color:'#2ecc71', coinReward:30, progressMax:1, desc:'打开仓库界面。' },
    { id:'d_treasure_open', taskKey:'treasure', name:'开宝箱',       icon:'fas fa-gift',           color:'#e67e22', coinReward:30, progressMax:1, desc:'打开百宝箱。' },
    { id:'d_mail_read',     taskKey:'mail',     name:'看邮件',       icon:'fas fa-envelope-open',  color:'#1abc9c', coinReward:30, progressMax:1, desc:'打开邮件系统。' },
    { id:'d_shop_browse',   taskKey:'shop',     name:'看商品',       icon:'fas fa-tags',           color:'#c0392b', coinReward:30, progressMax:1, desc:'打开商店界面。' },
    { id:'d_task_helper',   taskKey:'taskmaster',name:'任务学徒',    icon:'fas fa-graduation-cap', color:'#f39c12', coinReward:50, progressMax:5, desc:'完成任意 5 个其他每日任务。' },
    { id:'d_task_master',   taskKey:'taskmaster',name:'任务达人',    icon:'fas fa-crown',          color:'#f39c12', coinReward:80, progressMax:5, desc:'完成任意 5 个其他每日任务后可领取。' },
    { id:'d_minigame_happy',taskKey:'minigame',name:'快乐小游戏',   icon:'fas fa-smile',          color:'#3498db', coinReward:40, progressMax:1, desc:'游玩任意休闲小游戏 1 次。' },
    { id:'d_gacha_lucky',   taskKey:'gacha',    name:'幸运抽卡',     icon:'fas fa-dice-one',       color:'#9b59b6', coinReward:40, progressMax:1, desc:'完成一次抽卡提取。' },
    { id:'d_warehouse_peek',taskKey:'warehouse',name:'翻仓库',      icon:'fas fa-search',         color:'#2ecc71', coinReward:20, progressMax:1, desc:'打开仓库界面 1 次。' },
    { id:'d_treasure_peek', taskKey:'treasure', name:'翻宝箱',       icon:'fas fa-search-dollar',  color:'#e67e22', coinReward:20, progressMax:1, desc:'打开百宝箱 1 次。' },
    { id:'d_mail_peek',     taskKey:'mail',     name:'翻邮件',       icon:'fas fa-search-plus',    color:'#1abc9c', coinReward:20, progressMax:1, desc:'打开邮件系统 1 次。' },
    { id:'d_shop_peek',     taskKey:'shop',     name:'翻商店',       icon:'fas fa-search',         color:'#c0392b', coinReward:20, progressMax:1, desc:'打开商店界面 1 次。' },
    { id:'d_gacha2_minigame3',taskKey:'gacha_minigame', name:'玩抽结合', icon:'fas fa-gamepad', color:'#e91e63', coinReward:90, progressMax:5, desc:'抽卡 2 次 + 小游戏 3 次。' },
    { id:'d_visit_mix',     taskKey:'visit_mix',name:'到处走走',     icon:'fas fa-walking',        color:'#667eea', coinReward:70, progressMax:3, desc:'打开仓库 / 邮件 / 商店 各 1 次。' },
    { id:'d_minigame_series',taskKey:'minigame',name:'游戏系列',     icon:'fas fa-list',           color:'#2980b9', coinReward:70, progressMax:3, desc:'游玩 3 次休闲小游戏。' },
    { id:'d_gacha_series',  taskKey:'gacha',    name:'抽卡系列',     icon:'fas fa-list',           color:'#8e44ad', coinReward:90, progressMax:3, desc:'完成 3 次抽卡提取。' },

    // —— 补充模板 ——
    { id:'d_final_round',   taskKey:'gacha',    name:'最后一抽',     icon:'fas fa-dice-one',       color:'#9b59b6', coinReward:40, progressMax:1, desc:'完成一次抽卡提取。' },
    { id:'d_last_check',    taskKey:'checkin',  name:'今日签到',     icon:'fas fa-calendar-days',  color:'#e67e22', coinReward:25, progressMax:1, desc:'完成一次每日签到。' },
    { id:'d_last_visit',    taskKey:'warehouse',name:'最后盘点',     icon:'fas fa-clipboard-check',color:'#27ae60', coinReward:35, progressMax:1, desc:'打开仓库界面盘点。' },
    { id:'d_browsing_round',taskKey:'shop',     name:'再逛一次商店', icon:'fas fa-store',          color:'#e74c3c', coinReward:35, progressMax:1, desc:'再打开一次商店。' },
];

// ==================== 每周任务模板池（≥50，每周随机选16个）====================
// coinReward ∈ [20, 100]，progressMax ∈ [2, 5]（周常难度略高）
var WEEKLY_TASK_TEMPLATES = [
    // —— 高频基础操作 ——
    { id:'w_checkin7',   taskKey:'checkin',   name:'周常签到·七次', icon:'fas fa-calendar-week',  color:'#e67e22', coinReward:60, progressMax:7, desc:'本周内累计完成 7 次每日签到。' },
    { id:'w_minigame10', taskKey:'minigame',  name:'周常游戏·十局', icon:'fas fa-gamepad',        color:'#2980b9', coinReward:80, progressMax:10, desc:'本周内游玩任意休闲小游戏累计 10 次。' },
    { id:'w_minigame5',  taskKey:'minigame',  name:'周常游戏·五局', icon:'fas fa-gamepad',        color:'#3498db', coinReward:50, progressMax:5,  desc:'本周内游玩任意休闲小游戏累计 5 次。' },
    { id:'w_gacha10',    taskKey:'gacha',     name:'周常抽卡·十次', icon:'fas fa-dice-d20',       color:'#8e44ad', coinReward:100,progressMax:10, desc:'本周内完成累计 10 次抽卡提取。' },
    { id:'w_gacha5',     taskKey:'gacha',     name:'周常抽卡·五次', icon:'fas fa-dice',           color:'#9b59b6', coinReward:60, progressMax:5,  desc:'本周内完成累计 5 次抽卡提取。' },
    { id:'w_gacha30',    taskKey:'gacha',     name:'周常抽卡·狂抽', icon:'fas fa-crown',          color:'#f39c12', coinReward:100,progressMax:30, desc:'本周内完成累计 30 次抽卡提取。' },
    { id:'w_warehouse5', taskKey:'warehouse', name:'周常仓库·五次', icon:'fas fa-warehouse',      color:'#27ae60', coinReward:40, progressMax:5,  desc:'本周内累计打开仓库 5 次。' },
    { id:'w_warehouse10',taskKey:'warehouse', name:'周常仓库·十次', icon:'fas fa-boxes',          color:'#2ecc71', coinReward:70, progressMax:10, desc:'本周内累计打开仓库 10 次。' },
    { id:'w_treasure5',  taskKey:'treasure',  name:'周常百宝箱·五次',icon:'fas fa-box-open',      color:'#d35400', coinReward:40, progressMax:5,  desc:'本周内累计打开百宝箱 5 次。' },
    { id:'w_treasure10', taskKey:'treasure',  name:'周常百宝箱·十次',icon:'fas fa-compass',       color:'#e67e22', coinReward:70, progressMax:10, desc:'本周内累计打开百宝箱 10 次。' },
    { id:'w_mail5',      taskKey:'mail',      name:'周常邮件·五次',  icon:'fas fa-envelope',      color:'#16a085', coinReward:40, progressMax:5,  desc:'本周内累计打开邮件系统 5 次。' },
    { id:'w_mail10',     taskKey:'mail',      name:'周常邮件·十次',  icon:'fas fa-inbox',         color:'#1abc9c', coinReward:70, progressMax:10, desc:'本周内累计打开邮件系统 10 次。' },
    { id:'w_shop5',      taskKey:'shop',      name:'周常商店·五次',  icon:'fas fa-store',         color:'#e74c3c', coinReward:40, progressMax:5,  desc:'本周内累计打开商店界面 5 次。' },
    { id:'w_shop10',     taskKey:'shop',      name:'周常商店·十次',  icon:'fas fa-shopping-bag',  color:'#c0392b', coinReward:70, progressMax:10, desc:'本周内累计打开商店界面 10 次。' },

    // —— 签到类变体（每周更难）——
    { id:'w_checkin_half',taskKey:'checkin',  name:'半周全勤',      icon:'fas fa-calendar-alt',  color:'#f39c12', coinReward:40, progressMax:4,  desc:'本周内累计签到 4 天。' },
    { id:'w_checkin_full',taskKey:'checkin',  name:'全周签到',      icon:'fas fa-calendar-star', color:'#e91e63', coinReward:80, progressMax:7,  desc:'本周内累计签到 7 天。' },

    // —— 小游戏挑战 ——
    { id:'w_mini20',     taskKey:'minigame', name:'游戏狂魔',      icon:'fas fa-headset',       color:'#2980b9', coinReward:100,progressMax:20, desc:'本周内游玩任意小游戏 20 次。' },
    { id:'w_mini15',     taskKey:'minigame', name:'游戏达人',      icon:'fas fa-trophy',        color:'#f39c12', coinReward:80, progressMax:15, desc:'本周内游玩任意小游戏 15 次。' },
    { id:'w_mini30',     taskKey:'minigame', name:'游戏大师',      icon:'fas fa-medal',         color:'#e67e22', coinReward:100,progressMax:30, desc:'本周内游玩任意小游戏 30 次。' },

    // —— 抽卡挑战 ——
    { id:'w_gacha50',    taskKey:'gacha',    name:'狂抽五十',      icon:'fas fa-crown',         color:'#f39c12', coinReward:100,progressMax:50, desc:'本周内累计抽卡 50 次。' },
    { id:'w_gacha20',    taskKey:'gacha',    name:'抽卡高手',      icon:'fas fa-layer-group',   color:'#9b59b6', coinReward:90, progressMax:20, desc:'本周内累计抽卡 20 次。' },
    { id:'w_gacha_ten3', taskKey:'gacha',    name:'三连十连',      icon:'fas fa-fire',          color:'#e74c3c', coinReward:100,progressMax:3,  desc:'本周内完成 3 次十连抽卡。' },

    // —— 仓库挑战 ——
    { id:'w_wh20',       taskKey:'warehouse',name:'仓库大户',      icon:'fas fa-database',      color:'#27ae60', coinReward:90, progressMax:20, desc:'本周内累计打开仓库 20 次。' },

    // —— 百宝箱挑战 ——
    { id:'w_tr20',       taskKey:'treasure', name:'寻宝狂人',      icon:'fas fa-gem',          color:'#d35400', coinReward:90, progressMax:20, desc:'本周内累计打开百宝箱 20 次。' },

    // —— 邮件挑战 ——
    { id:'w_mail20',     taskKey:'mail',     name:'邮件狂人',      icon:'fas fa-mail-bulk',    color:'#16a085', coinReward:90, progressMax:20, desc:'本周内累计打开邮件系统 20 次。' },

    // —— 商店挑战 ——
    { id:'w_shop20',     taskKey:'shop',     name:'购物狂人',      icon:'fas fa-cart-arrow-down',color:'#c0392b', coinReward:90, progressMax:20, desc:'本周内累计打开商店 20 次。' },

    // —— 组合挑战 ——
    { id:'w_check_mini', taskKey:'checkin_minigame', name:'签到游玩', icon:'fas fa-tasks',      color:'#e91e63', coinReward:90, progressMax:12, desc:'本周内签到 7 次 + 游玩小游戏 5 次。' },
    { id:'w_mini_gacha', taskKey:'minigame_gacha',   name:'玩抽双修', icon:'fas fa-bolt',        color:'#f39c12', coinReward:100,progressMax:15, desc:'本周内小游戏 10 次 + 抽卡 5 次。' },
    { id:'w_wh_shop',    taskKey:'warehouse_shop',   name:'买卖逛仓', icon:'fas fa-handshake',   color:'#27ae60', coinReward:90, progressMax:15, desc:'本周内仓库 10 次 + 商店 5 次。' },
    { id:'w_allround',   taskKey:'weekly_allround',  name:'全能周常', icon:'fas fa-star',        color:'#f39c12', coinReward:100,progressMax:20, desc:'本周内完成签到 7 次 + 小游戏 5 次 + 抽卡 5 次 + 仓库 3 次。' },

    // —— 周常任务达人奖励 ——
    { id:'w_master10',   taskKey:'weeklytaskmaster', name:'周常新手', icon:'fas fa-graduation-cap', color:'#f39c12', coinReward:60, progressMax:5,  desc:'完成任意 5 个其他每周任务。' },
    { id:'w_master_full',taskKey:'weeklytaskmaster', name:'周常达人', icon:'fas fa-crown',        color:'#f39c12', coinReward:100,progressMax:12, desc:'完成任意 12 个其他每周任务后可领取。' },

    // —— 更多轮换模板 ——
    { id:'w_checkin2',   taskKey:'checkin',  name:'周签到·四天',   icon:'fas fa-calendar-check',color:'#e67e22', coinReward:40, progressMax:4,  desc:'本周签到 4 次。' },
    { id:'w_checkin3',   taskKey:'checkin',  name:'周签到·五天',   icon:'fas fa-calendar-plus', color:'#e67e22', coinReward:50, progressMax:5,  desc:'本周签到 5 次。' },
    { id:'w_mini7',      taskKey:'minigame', name:'周游戏·七局',   icon:'fas fa-gamepad',      color:'#3498db', coinReward:50, progressMax:7,  desc:'本周游玩小游戏 7 次。' },
    { id:'w_gacha7',     taskKey:'gacha',    name:'周抽卡·七次',   icon:'fas fa-dice',         color:'#9b59b6', coinReward:70, progressMax:7,  desc:'本周抽卡 7 次。' },
    { id:'w_gacha15',    taskKey:'gacha',    name:'周抽卡·十五',   icon:'fas fa-dice-d20',     color:'#8e44ad', coinReward:90, progressMax:15, desc:'本周抽卡 15 次。' },
    { id:'w_wh3',        taskKey:'warehouse',name:'周仓库·三次',   icon:'fas fa-warehouse',    color:'#27ae60', coinReward:30, progressMax:3,  desc:'本周打开仓库 3 次。' },
    { id:'w_tr3',        taskKey:'treasure', name:'周宝箱·三次',   icon:'fas fa-box-open',     color:'#d35400', coinReward:30, progressMax:3,  desc:'本周打开百宝箱 3 次。' },
    { id:'w_mail3',      taskKey:'mail',     name:'周邮件·三次',   icon:'fas fa-envelope',     color:'#16a085', coinReward:30, progressMax:3,  desc:'本周打开邮件 3 次。' },
    { id:'w_shop3',      taskKey:'shop',     name:'周商店·三次',   icon:'fas fa-store',        color:'#e74c3c', coinReward:30, progressMax:3,  desc:'本周打开商店 3 次。' },
    { id:'w_mini50',     taskKey:'minigame', name:'游戏狂魔·五十', icon:'fas fa-headset',      color:'2980b9',  coinReward:100,progressMax:50, desc:'本周游玩小游戏 50 次。' },
    { id:'w_gacha_ten5', taskKey:'gacha',    name:'五连十连',       icon:'fas fa-fire',         color:'#e74c3c', coinReward:100,progressMax:5,  desc:'本周完成 5 次十连抽卡。' },
    { id:'w_visit_wh15', taskKey:'warehouse',name:'仓库常客·周',   icon:'fas fa-boxes',        color:'#2ecc71', coinReward:80, progressMax:15, desc:'本周打开仓库 15 次。' },
    { id:'w_visit_tr15', taskKey:'treasure', name:'寻宝达人·周',   icon:'fas fa-compass',      color:'#e67e22', coinReward:80, progressMax:15, desc:'本周打开百宝箱 15 次。' },
    { id:'w_visit_mail15',taskKey:'mail',    name:'邮件达人·周',   icon:'fas fa-inbox',        color:'#1abc9c', coinReward:80, progressMax:15, desc:'本周打开邮件 15 次。' },
    { id:'w_visit_shop15',taskKey:'shop',    name:'购物达人·周',   icon:'fas fa-shopping-bag', color:'#c0392b', coinReward:80, progressMax:15, desc:'本周打开商店 15 次。' },
    { id:'w_combo1',     taskKey:'weekly_combo1', name:'周常·基础组合', icon:'fas fa-bars', color:'#667eea', coinReward:90, progressMax:10, desc:'本周签到 5 次 + 小游戏 5 次。' },
    { id:'w_combo2',     taskKey:'weekly_combo2', name:'周常·进阶组合', icon:'fas fa-bars', color:'#e67e22', coinReward:100,progressMax:15, desc:'本周抽卡 5 次 + 小游戏 5 次 + 仓库 5 次。' },
    { id:'w_combo3',     taskKey:'weekly_combo3', name:'周常·全能组合', icon:'fas fa-star', color:'#f39c12', coinReward:100,progressMax:25, desc:'本周签到 7 次 + 抽卡 5 次 + 仓库 10 次 + 商店 3 次。' },
    { id:'w_mini_gacha5',taskKey:'minigame_gacha',name:'玩抽双刷', icon:'fas fa-gamepad',      color:'#e91e63', coinReward:90, progressMax:12, desc:'本周小游戏 7 次 + 抽卡 5 次。' },
    { id:'w_all5',       taskKey:'weekly_all5', name:'五面出击',       icon:'fas fa-rocket',       color:'#9b59b6', coinReward:100,progressMax:20, desc:'本周签到 4 次 + 小游戏 4 次 + 抽卡 4 次 + 仓库 4 次 + 商店 4 次。' },
];

// ==================== 辅助工具 ====================
function _dtGetNow() { return new Date(); }
function _dtUtc8DayKey(d) {
    d = d || _dtGetNow();
    var utc = d.getTime() + d.getTimezoneOffset() * 60000;
    var utc8 = new Date(utc + 8 * 3600000);
    return utc8.toISOString().slice(0, 10);
}
function _dtGetMondayKey(d) {
    d = d || _dtGetNow();
    var utc = d.getTime() + d.getTimezoneOffset() * 60000;
    var utc8 = new Date(utc + 8 * 3600000);
    var day = utc8.getUTCDay(); // 0=周日
    var diff = day === 0 ? 6 : day - 1;
    var monday = new Date(utc8);
    monday.setUTCDate(utc8.getUTCDate() - diff);
    return monday.toISOString().slice(0, 10);
}
function _dtSeededPick(list, seedStr, n) {
    // 种子随机数：hash(seedStr) → 洗牌 → 取前 n 个
    var h = 2166136261 >>> 0;
    for (var i = 0; i < seedStr.length; i++) {
        h ^= seedStr.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    var seed = h;
    var arr = list.slice();
    for (var i = arr.length - 1; i > 0; i--) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        var j = Math.floor((seed / 0x100000000) * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr.slice(0, Math.min(n, arr.length));
}

// ==================== 存储 ====================
function _dtGetStorageKey() {
    var user = null;
    try { user = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch (e) {}
    var name = user ? (user.username || '') : '';
    // 兼容旧版单账户存储（无 currentUser 时用 dailytask）
    return name ? ('dailytask_' + name) : 'dailytask';
}

function _dtGetData() {
    try {
        var raw = localStorage.getItem(_dtGetStorageKey());
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) { return null; }
}

function _dtSaveData(data) {
    localStorage.setItem(_dtGetStorageKey(), JSON.stringify(data));
}

function _dtInitData() {
    var todayKey = _dtUtc8DayKey();
    var weekKey = _dtGetMondayKey();
    var dailyPool = _dtSeededPick(DAILY_TASK_TEMPLATES, todayKey, DT_DAILY_POOL_SIZE);
    var weeklyPool = _dtSeededPick(WEEKLY_TASK_TEMPLATES, weekKey, DT_WEEKLY_POOL_SIZE);
    // 自动把 task_master 类放在最后，progressMax 为「其他已完成数」
    return {
        version: DAILYTASK_DATA_VERSION,
        date: todayKey,
        weekKey: weekKey,
        dailyPool: dailyPool.map(function(t) {
            var isMaster = t.taskKey === 'taskmaster';
            return {
                id: t.id,
                template: t,
                progress: 0,
                completed: false,
                claimed: false,
                dynamicProgressMax: isMaster
            };
        }),
        weeklyPool: weeklyPool.map(function(t) {
            var isMaster = t.taskKey === 'weeklytaskmaster';
            return {
                id: t.id,
                template: t,
                progress: 0,
                completed: false,
                claimed: false,
                dynamicProgressMax: isMaster
            };
        }),
        activeTab: 'daily'
    };
}

function getDailyTaskData() {
    var data = _dtGetData();
    var todayKey = _dtUtc8DayKey();
    var weekKey = _dtGetMondayKey();
    var needsSave = false;
    if (!data || data.version !== DAILYTASK_DATA_VERSION) {
        data = _dtInitData();
        needsSave = true;
    } else {
        // 每日刷新
        if (data.date !== todayKey) {
            data.date = todayKey;
            data.dailyPool = _dtSeededPick(DAILY_TASK_TEMPLATES, todayKey, DT_DAILY_POOL_SIZE).map(function(t) {
                var isMaster = t.taskKey === 'taskmaster';
                return { id:t.id, template:t, progress:0, completed:false, claimed:false, dynamicProgressMax:isMaster };
            });
            needsSave = true;
        }
        // 每周刷新
        if (data.weekKey !== weekKey) {
            data.weekKey = weekKey;
            data.weeklyPool = _dtSeededPick(WEEKLY_TASK_TEMPLATES, weekKey, DT_WEEKLY_POOL_SIZE).map(function(t) {
                var isMaster = t.taskKey === 'weeklytaskmaster';
                return { id:t.id, template:t, progress:0, completed:false, claimed:false, dynamicProgressMax:isMaster };
            });
            needsSave = true;
        }
    }
    if (needsSave) _dtSaveData(data);
    return data;
}

// ==================== 进度更新（对外暴露）====================
// 兼容旧 API：dailyTaskMarkProgress('checkin') — 默认日常
// 新 API：dailyTaskMarkProgress('checkin', 'weekly') — 指定周常
function dailyTaskMarkProgress(taskKey, pool) {
    var data = getDailyTaskData();
    var pools = [];
    if (pool === 'daily') pools.push('daily');
    else if (pool === 'weekly') pools.push('weekly');
    else pools.push('daily', 'weekly'); // 未指定时两边都尝试
    pools.forEach(function(poolName) {
        var list = poolName === 'daily' ? data.dailyPool : data.weeklyPool;
        list.forEach(function(t) {
            if (t.claimed) return;
            var tpl = t.template;
            if (tpl.taskKey !== taskKey) return;
            // 组合类 task：内部解析
            var delta = 1;
            if (taskKey === 'all4') {
                // 需要分别触发  checkin/minigame/gacha/warehouse  → 这些会各自触发一次
                delta = 0; // 由各子任务完成时推进
                // 此处不处理
            }
            if (taskKey === 'checkin_minigame') {
                // 每日签到类 + 小游戏类 混合 key —— 这里只在 checkin 事件时才 +1
                // 简化处理：由 dailyTaskMarkProgress('checkin') 和 ('minigame') 各自推进
                delta = 0;
            }
            if (delta > 0) {
                t.progress = Math.min(t.progress + delta, tpl.progressMax);
                if (t.progress >= tpl.progressMax) t.completed = true;
            }
        });
    });
    // task_master 动态计算：已完成其他任务数
    function _recalcMaster(list) {
        var othersDone = list.filter(function(x) {
            return x.dynamicProgressMax && x.template.taskKey !== 'taskmaster' && x.template.taskKey !== 'weeklytaskmaster';
        });
        // task_master 任务的 progressMax = 「其他总池 - master 数」
        list.forEach(function(t) {
            if (!t.dynamicProgressMax) return;
            var isDailyMaster = t.template.taskKey === 'taskmaster';
            var isWeeklyMaster = t.template.taskKey === 'weeklytaskmaster';
            if (!isDailyMaster && !isWeeklyMaster) return;
            var otherPool = list.filter(function(x) {
                if (x === t) return false;
                return !x.dynamicProgressMax && !x.claimed;
            });
            // 动态 progressMax 展示
            var done = list.filter(function(x) {
                return !x.dynamicProgressMax && x.completed;
            }).length;
            t.progress = Math.min(done, otherPool.length);
            if (t.progress >= t.template.progressMax) t.completed = true;
        });
    }
    _recalcMaster(data.dailyPool);
    _recalcMaster(data.weeklyPool);
    _dtSaveData(data);
    // 尝试刷新弹窗（如果正在显示）
    if (document.getElementById('dailyTaskModal')) {
        try { renderDailyTasksUI(); } catch (e) {}
    }
}

// 特殊：在签到事件里 dailyTaskMarkProgress('checkin')，组合任务要同时累计
// 组合类 taskKey 特殊标记 —— 我们需要覆盖一下：让 checkin/minigame/gacha 推进对应组合任务
(function _dtPatchComboMark() {
    // 记录每个 taskKey 对应的组合类引用
    var comboMap = {
        'checkin': ['d_all4', 'w_check_mini', 'w_combo1', 'w_combo2', 'w_combo3', 'w_all5'],
        'minigame': ['d_all4', 'd_mini3gacha2', 'w_check_mini', 'w_mini_gacha', 'w_mini_gacha5', 'w_combo1', 'w_combo2', 'w_combo3', 'w_all5'],
        'gacha':    ['d_all4', 'd_mini3gacha2', 'd_gacha2_minigame3', 'w_mini_gacha', 'w_combo2', 'w_combo3', 'w_all5'],
        'warehouse':['d_all4', 'd_visit_all', 'w_wh_shop', 'w_combo2', 'w_combo3', 'w_all5'],
        'treasure': ['d_visit_all', 'w_all5'],
        'mail':     ['d_visit_all', 'w_all5'],
        'shop':     ['d_visit_all', 'w_wh_shop', 'w_combo3', 'w_all5']
    };
    var _orig = dailyTaskMarkProgress;
    dailyTaskMarkProgress = function(taskKey, pool) {
        // 先推进所有组合任务（遍历 dailyPool + weeklyPool 中 id 在 comboMap[taskKey] 里的）
        var data = getDailyTaskData();
        function tryCombo(list, comboIds) {
            list.forEach(function(t) {
                if (t.claimed || t.completed) return;
                if (comboIds.indexOf(t.id) < 0) return;
                var tpl = t.template;
                // 组合任务使用 progressMax 作为总次数（每日版：4 类各一次 → 4；weekly_allround: 20）
                t.progress = Math.min(t.progress + 1, tpl.progressMax);
                if (t.progress >= tpl.progressMax) t.completed = true;
            });
        }
        if (comboMap[taskKey]) {
            if (pool !== 'weekly') tryCombo(data.dailyPool, comboMap[taskKey]);
            if (pool !== 'daily') tryCombo(data.weeklyPool, comboMap[taskKey]);
        }
        // 然后调用原逻辑
        _orig(taskKey, pool);
    };
})();

// ==================== 领取奖励 ====================
function dtClaimReward(taskId, pool) {
    var data = getDailyTaskData();
    var list = pool === 'weekly' ? data.weeklyPool : data.dailyPool;
    var t = list.find(function(x) { return x.id === taskId; });
    if (!t) return false;
    if (!t.completed || t.claimed) return false;
    var tpl = t.template;
    var reward = tpl.coinReward || 0;
    // 发奖
    if (typeof addPreCoin === 'function') {
        addPreCoin(reward, (pool === 'weekly' ? '每周任务:' : '每日任务:') + tpl.name);
    }
    t.claimed = true;
    _dtSaveData(data);
    // 刷新
    if (document.getElementById('dailyTaskModal')) renderDailyTasksUI();
    return true;
}

function dtClaimAll() {
    var data = getDailyTaskData();
    var pool = data.activeTab || 'daily';
    var list = pool === 'weekly' ? data.weeklyPool : data.dailyPool;
    var count = 0;
    list.forEach(function(t) {
        if (t.completed && !t.claimed) {
            dtClaimReward(t.id, pool);
            count++;
        }
    });
    return count;
}

// ==================== 开发者工具 ====================
function isDailyTaskDevMode() {
    var user = null;
    try { user = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch (e) {}
    var name = user ? (user.username || '') : '';
    if (!name) return false;
    try {
        var dm = JSON.parse(localStorage.getItem('devModeData') || '{}');
        return !!(dm[name] && dm[name].enabled);
    } catch (e) { return false; }
}

function dtDevComplete(pool) {
    var data = getDailyTaskData();
    var list = pool === 'weekly' ? data.weeklyPool : data.dailyPool;
    list.forEach(function(t) {
        var tpl = t.template;
        t.progress = tpl.progressMax;
        t.completed = true;
    });
    _dtSaveData(data);
    if (document.getElementById('dailyTaskModal')) renderDailyTasksUI();
}

// ==================== 弹窗样式（自包含，复制自仓库并作用域化）====================
function _dtInjectCSS() {
    if (document.getElementById('dailytask-style')) return;
    var css = `
        /* ====== 仓库 wh-* 基础样式（作用域到 #dailyTaskModal）====== */
        #dailyTaskModal {
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: none;
            position: fixed; inset: 0; z-index: 9998;
            align-items: stretch; justify-content: stretch;
        }
        #dailyTaskModal.show { display: flex; animation: dtlFadeIn 0.25s ease; }
        @keyframes dtlFadeIn { from{opacity:0} to{opacity:1} }
        #dailyTaskModal .wh-fullscreen {
            width: 100%; height: 100%;
            display: flex; flex-direction: column;
            background: #f5f6fa; overflow: hidden;
        }
        #dailyTaskModal .wh-header {
            display: flex; align-items: center; gap: 20px;
            padding: 18px 40px; background: white;
            border-bottom: 1px solid rgba(0,0,0,0.08); flex-shrink: 0;
        }
        #dailyTaskModal .wh-title { display: flex; align-items: center; gap: 12px; }
        #dailyTaskModal .wh-title i { font-size: 22px; color: #667eea; }
        #dailyTaskModal .wh-title h2 { margin: 0; font-size: 20px; color: #333; }
        #dailyTaskModal .wh-stats { display: flex; align-items: center; gap: 16px; margin-left: auto; }
        #dailyTaskModal .wh-stat { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #888; }
        #dailyTaskModal .wh-stat b { color: #667eea; }
        #dailyTaskModal .wh-close {
            width: 36px; height: 36px; border: none; border-radius: 50%;
            background: rgba(0,0,0,0.05); color: #666; font-size: 15px;
            cursor: pointer; transition: all 0.25s ease; flex-shrink: 0;
        }
        #dailyTaskModal .wh-close:hover { background: #667eea; color: white; transform: rotate(90deg); }
        #dailyTaskModal .wh-toolbar {
            display: flex; align-items: center; gap: 10px;
            padding: 14px 40px; background: white;
            border-bottom: 1px solid rgba(0,0,0,0.06);
            flex-shrink: 0; flex-wrap: wrap;
        }
        #dailyTaskModal .wh-tab {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 7px 16px; border: 1.5px solid rgba(102,126,234,0.25);
            border-radius: 20px; background: transparent; color: #666;
            font-size: 13px; cursor: pointer; transition: all 0.25s ease;
        }
        #dailyTaskModal .wh-tab:hover { border-color: #667eea; color: #667eea; }
        #dailyTaskModal .wh-tab.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: transparent; color: white;
        }
        #dailyTaskModal .wh-content {
            flex: 1; overflow-y: auto; padding: 24px 40px;
            display: grid; gap: 16px; align-content: start;
            grid-template-columns: repeat(4, 1fr);
        }
        #dailyTaskModal .wh-empty {
            grid-column: 1 / -1; display: flex; flex-direction: column;
            align-items: center; justify-content: center; padding: 80px 20px; color: #999;
        }
        #dailyTaskModal .wh-empty i { font-size: 56px; color: #667eea; margin-bottom: 16px; opacity: 0.5; }
        #dailyTaskModal .wh-empty p { margin: 0 0 6px; font-size: 16px; font-weight: bold; color: #666; }
        #dailyTaskModal .wh-empty span { font-size: 13px; }
        #dailyTaskModal .wh-footer {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            padding: 12px 40px; background: white;
            border-top: 1px solid rgba(0,0,0,0.06);
            font-size: 12px; color: #aaa; flex-shrink: 0;
        }

        /* ====== dt-* 任务卡片扩展 ====== */
        #dailyTaskModal .dt-fullscreen { display: flex; flex-direction: column; width:100%; height:100%; }
        #dailyTaskModal .dt-title-tags {
            display: inline-flex; align-items: center; gap: 8px; margin-left: 4px;
        }
        #dailyTaskModal .dt-date-tag {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 7px 14px; border-radius: 20px;
            background: rgba(102, 126, 234, 0.12); color: #4a68d4;
            font-size: 12px; font-weight: bold;
        }
        #dailyTaskModal .dt-date-tag.weekly {
            background: rgba(230, 126, 34, 0.12); color: #c06922;
        }
        #dailyTaskModal .dt-claimall-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 18px; border: none; border-radius: 20px;
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white; font-size: 13px; font-weight: bold; cursor: pointer;
            transition: all 0.25s ease;
        }
        #dailyTaskModal .dt-claimall-btn:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(46,204,113,0.35); }

        /* dev 按钮 */
        #dailyTaskModal .dt-dev-btn {
            margin-left: auto; padding: 7px 14px;
            border: 1.5px dashed #9b59b6; border-radius: 20px;
            background: rgba(155, 89, 182, 0.08); color: #9b59b6;
            font-size: 12px; font-weight: bold; cursor: pointer; transition: all 0.25s ease;
            display: inline-flex; align-items: center; gap: 5px;
        }
        #dailyTaskModal .dt-dev-btn:hover { background: #9b59b6; color: white; }

        /* 任务卡片（覆盖 warehouse 卡片样式） */
        #dailyTaskModal .dt-task-card {
            position: relative; display: flex; flex-direction: column;
            gap: 6px; padding: 22px 18px 18px; background: white;
            border: 1px solid #e8e8e8; border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        #dailyTaskModal .dt-task-card:hover:not(.dt-card-done) {
            transform: translateY(-5px); box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }
        #dailyTaskModal .dt-task-card.dt-card-done { opacity: 0.7; }

        #dailyTaskModal .dt-coin-badge {
            position: absolute; top: 12px; left: 12px; padding: 3px 10px; border-radius: 12px;
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
            color: white; font-size: 11px; font-weight: bold; z-index: 1;
            display: inline-flex; align-items: center; gap: 4px;
        }
        #dailyTaskModal .dt-coin-badge i { font-size: 10px; }

        #dailyTaskModal .dt-type-tag {
            position: absolute; top: 12px; right: 12px; padding: 2px 10px; border-radius: 12px;
            border: 1.5px solid; background: white; font-size: 11px; font-weight: bold; z-index: 1;
        }
        #dailyTaskModal .dt-type-tag.daily { color: #4a68d4; border-color: #4a68d4; }
        #dailyTaskModal .dt-type-tag.weekly { color: #c06922; border-color: #c06922; }
        #dailyTaskModal .dt-type-tag.bonus { color: #c0392b; border-color: #c0392b; }

        #dailyTaskModal .dt-task-icon {
            width: 58px; height: 58px; border-radius: 16px;
            display: flex; align-items: center; justify-content: center;
            font-size: 24px; margin-top: 12px;
        }
        #dailyTaskModal .dt-task-name { font-size: 15px; font-weight: bold; color: #333; }
        #dailyTaskModal .dt-task-desc { font-size: 12px; color: #888; line-height: 1.6; min-height: 40px; }
        #dailyTaskModal .dt-progress-bar { height: 6px; background: #f0f0f0; border-radius: 6px; overflow: hidden; margin: 4px 0; }
        #dailyTaskModal .dt-progress-fill { height: 100%; border-radius: 6px; transition: width 0.3s ease; }
        #dailyTaskModal .dt-action-row { display: flex; align-items: center; justify-content: center; margin-top: 4px; }
        #dailyTaskModal .dt-claim-btn {
            width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            padding: 9px 0; border: none; border-radius: 10px;
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white; font-size: 13px; font-weight: bold; cursor: pointer; transition: all 0.25s ease;
        }
        #dailyTaskModal .dt-claim-btn:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(46,204,113,0.35); }
        #dailyTaskModal .dt-status {
            display: inline-flex; align-items: center; gap: 5px; font-size: 12px;
            font-weight: bold; padding: 6px 12px; border-radius: 10px;
        }
        #dailyTaskModal .dt-status-claimed { color: #999; background: #f0f0f0; }
        #dailyTaskModal .dt-status-progress { color: #888; background: rgba(0,0,0,0.05); }

        /* ====== dev complete confirm 弹窗 ====== */
        #dtDevCompleteModal {
            background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            display: none; position: fixed; inset: 0; z-index: 9999;
            align-items: center; justify-content: center;
        }
        #dtDevCompleteModal.show { display: flex; }
        #dtDevCompleteModal .dt-devbox {
            width: 400px; max-width: 92vw; padding: 26px 24px 20px;
            background: white; border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        #dtDevCompleteModal .dt-devbox-title {
            font-size: 17px; font-weight: bold; color: #333;
            display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
        }
        #dtDevCompleteModal .dt-devbox-title i { color: #9b59b6; }
        #dtDevCompleteModal .dt-devbox-info { font-size: 13px; color: #777; line-height: 1.6; margin-bottom: 14px; }
        #dtDevCompleteModal .dt-devbox-info b { color: #c0392b; }
        #dtDevCompleteModal .dt-devbox-actions { display: flex; gap: 10px; }
        #dtDevCompleteModal .dt-devbox-actions button {
            flex: 1; padding: 10px 0; border: none; border-radius: 10px;
            font-size: 13px; font-weight: bold; cursor: pointer; transition: all 0.2s ease;
        }
        #dtDevCompleteModal #dtDevCancel { background: rgba(0,0,0,0.06); color: #666; }
        #dtDevCompleteModal #dtDevOk {
            background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
            color: white; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }

        /* ====== 暗色模式 ====== */
        body.dark-mode #dailyTaskModal .wh-fullscreen,
        body.dark-mode #dailyTaskModal .dt-fullscreen { background: #1a1a2e; }
        body.dark-mode #dailyTaskModal .wh-header,
        body.dark-mode #dailyTaskModal .wh-toolbar,
        body.dark-mode #dailyTaskModal .wh-footer {
            background: #1a1a2e; border-color: rgba(255,255,255,0.08);
        }
        body.dark-mode #dailyTaskModal .wh-title h2 { color: #e0e0e0; }
        body.dark-mode #dailyTaskModal .wh-title i { color: #8fa0ff; }
        body.dark-mode #dailyTaskModal .wh-stat { color: #888; }
        body.dark-mode #dailyTaskModal .wh-stat b { color: #8fa0ff; }
        body.dark-mode #dailyTaskModal .wh-close { background: rgba(255,255,255,0.08); color: #ccc; }
        body.dark-mode #dailyTaskModal .wh-close:hover { background: #667eea; color: white; }
        body.dark-mode #dailyTaskModal .wh-tab { border-color: rgba(102,126,234,0.3); color: #aaa; }
        body.dark-mode #dailyTaskModal .wh-tab:hover { border-color: #8fa0ff; color: #8fa0ff; }
        body.dark-mode #dailyTaskModal .wh-tab.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;
        }
        body.dark-mode #dailyTaskModal .wh-empty p { color: #ccc; }
        body.dark-mode #dailyTaskModal .dt-date-tag { background: rgba(138,160,255,0.18); color: #b4c4ff; }
        body.dark-mode #dailyTaskModal .dt-date-tag.weekly { background: rgba(243,156,18,0.2); color: #f39c12; }
        body.dark-mode #dailyTaskModal .dt-task-card {
            background: rgba(20, 20, 20, 0.8); border-color: rgba(255,255,255,0.1);
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        body.dark-mode #dailyTaskModal .dt-task-name { color: #e0e0e0; }
        body.dark-mode #dailyTaskModal .dt-task-desc { color: #999; }
        body.dark-mode #dailyTaskModal .dt-type-tag { background: #1a1a2e; }
        body.dark-mode #dailyTaskModal .dt-status-progress { background: rgba(255,255,255,0.08); color: #aaa; }
        body.dark-mode #dailyTaskModal .dt-dev-btn {
            border-color: #bd8fd0; background: rgba(155, 89, 182, 0.15); color: #d9b3e8;
        }
        body.dark-mode #dtDevCompleteModal .dt-devbox { background: #24243a; }
        body.dark-mode #dtDevCompleteModal .dt-devbox-title { color: #e0e0e0; }
        body.dark-mode #dtDevCompleteModal .dt-devbox-info { color: #ccc; }
        body.dark-mode #dtDevCompleteModal #dtDevCancel { background: rgba(255,255,255,0.08); color: #ccc; }
        body.dark-mode #dailyTaskModal .dt-refresh-tag { background: rgba(46, 204, 113, 0.18); color: #58d68d; }
        body.dark-mode #dailyTaskModal .wh-content { scrollbar-color: #8fa0ff rgba(255,255,255,0.08); }
        body.dark-mode #dailyTaskModal .wh-content::-webkit-scrollbar-track { background: rgba(255,255,255,0.06); }
        body.dark-mode #dailyTaskModal .wh-content::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #8fa0ff 0%, #a29bfe 100%);
            background-clip: padding-box;
        }

        /* ====== 刷新倒计时 tag ====== */
        #dailyTaskModal .dt-refresh-tag {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 7px 14px; border-radius: 20px;
            background: rgba(46, 204, 113, 0.12); color: #1e8449;
            font-size: 12px; font-weight: bold;
        }
        #dailyTaskModal .dt-refresh-tag i { font-size: 11px; }

        /* ====== 自定义滚动条 ====== */
        #dailyTaskModal .wh-content {
            scrollbar-width: thin;
            scrollbar-color: #667eea rgba(0, 0, 0, 0.06);
        }
        #dailyTaskModal .wh-content::-webkit-scrollbar { width: 10px; }
        #dailyTaskModal .wh-content::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.04); border-radius: 8px;
        }
        #dailyTaskModal .wh-content::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px; border: 2px solid transparent;
            background-clip: padding-box;
        }
        #dailyTaskModal .wh-content::-webkit-scrollbar-thumb:hover {
            background: #667eea; background-clip: padding-box;
        }

        /* ====== 响应式 ====== */
        @media (max-width: 1400px) { #dailyTaskModal .wh-content { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1000px) { #dailyTaskModal .wh-content { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 700px) {
            #dailyTaskModal .wh-header,
            #dailyTaskModal .wh-toolbar,
            #dailyTaskModal .wh-footer { padding: 14px 16px; }
            #dailyTaskModal .wh-stats { display: none; }
            #dailyTaskModal .wh-content { padding: 16px; grid-template-columns: repeat(1, 1fr); }
        }
    `;
    var style = document.createElement('style');
    style.id = 'dailytask-style';
    style.textContent = css;
    document.head.appendChild(style);
}

// ==================== 弹窗构建 ====================
var _dtModalBuilt = false;
function ensureDailyTaskModal() {
    if (_dtModalBuilt) return;
    _dtInjectCSS();
    var modal = document.createElement('div');
    modal.id = 'dailyTaskModal';
    modal.innerHTML = `
        <div class="wh-fullscreen">
            <div class="wh-header">
                <div class="wh-title"><i class="fas fa-tasks"></i><h2>每日任务</h2><span class="dt-title-tags" id="dtTitleTags"></span></div>
                <div class="wh-stats" id="dtHeaderStats"></div>
                <button class="wh-close" id="dtModalClose" title="关闭"><i class="fas fa-times"></i></button>
            </div>
            <div class="wh-toolbar" id="dtToolbar"></div>
            <div class="wh-content" id="dtContent"></div>
            <div class="wh-footer" id="dtFooter"></div>
        </div>
    `;
    document.body.appendChild(modal);
    // dev confirm modal
    var devModal = document.createElement('div');
    devModal.id = 'dtDevCompleteModal';
    devModal.innerHTML = `
        <div class="dt-devbox">
            <div class="dt-devbox-title"><i class="fas fa-bolt"></i>一键完成 <span id="dtDevPoolLabel">每日</span> 任务（dev）</div>
            <div class="dt-devbox-info">
                即将把 <b id="dtDevPoolLabel2">每日</b> 任务的所有进度直接填满并标记为已完成。<br>
                <span style="color:#999;font-size:11px">本操作只会作用于当前选中的任务池，不会影响另一池。</span>
            </div>
            <div class="dt-devbox-actions">
                <button id="dtDevCancel"><i class="fas fa-times"></i> 取消</button>
                <button id="dtDevOk"><i class="fas fa-check"></i> 一键完成</button>
            </div>
        </div>
    `;
    document.body.appendChild(devModal);
    // 关闭按钮
    document.getElementById('dtModalClose').addEventListener('click', function() {
        document.getElementById('dailyTaskModal').classList.remove('show');
    });
    document.getElementById('dtDevCancel').addEventListener('click', function() {
        document.getElementById('dtDevCompleteModal').classList.remove('show');
    });
    // ESC 关闭
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        var devModal = document.getElementById('dtDevCompleteModal');
        if (devModal && devModal.classList.contains('show')) {
            devModal.classList.remove('show');
            return;
        }
        var modal = document.getElementById('dailyTaskModal');
        if (modal && modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    });
    _dtModalBuilt = true;
    _dtStartCountdownTimer();
}

// ==================== 弹窗显示 ====================
function showDailyTaskModal() {
    ensureDailyTaskModal();
    getDailyTaskData(); // 自动刷新
    renderDailyTasksUI();
    document.getElementById('dailyTaskModal').classList.add('show');
}

// ==================== 刷新倒计时 ====================
function _dtUtc8Now() {
    var now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 8 * 3600000);
}

// 距离下次刷新的文案（日常=下个 UTC+8 零点；周常=下个周一 UTC+8 零点）
function _dtRefreshCountdownText() {
    var data = getDailyTaskData();
    var isWeekly = data.activeTab === 'weekly';
    var now8 = _dtUtc8Now();
    var target;
    if (isWeekly) {
        var day = now8.getUTCDay(); // 0=周日
        var addDays = day === 1 ? 7 : ((8 - day) % 7);
        target = new Date(Date.UTC(now8.getUTCFullYear(), now8.getUTCMonth(), now8.getUTCDate() + addDays, 0, 0, 0));
    } else {
        target = new Date(Date.UTC(now8.getUTCFullYear(), now8.getUTCMonth(), now8.getUTCDate() + 1, 0, 0, 0));
    }
    var ms = target.getTime() - now8.getTime();
    if (ms < 0) ms = 0;
    var totalMin = Math.floor(ms / 60000);
    var days = Math.floor(totalMin / 1440);
    var hours = Math.floor((totalMin % 1440) / 60);
    var mins = totalMin % 60;
    var txt;
    if (days > 0) txt = days + ' 天 ' + hours + ' 小时 ' + mins + ' 分';
    else if (hours > 0) txt = hours + ' 小时 ' + mins + ' 分';
    else txt = mins + ' 分钟';
    return '距离下次刷新时间还剩：' + txt;
}

// 定时刷新倒计时 tag（30 秒一次，仅当弹窗打开时）
var _dtCountdownTimer = null;
function _dtStartCountdownTimer() {
    if (_dtCountdownTimer) return;
    _dtCountdownTimer = setInterval(function() {
        var tag = document.getElementById('dtRefreshTag');
        if (!tag) return;
        var modal = document.getElementById('dailyTaskModal');
        if (!modal || !modal.classList.contains('show')) return;
        tag.innerHTML = '<i class="fas fa-hourglass-half"></i> ' + _dtRefreshCountdownText();
    }, 30000);
}

// ==================== UI 渲染 ====================
function renderDailyTasksUI() {
    ensureDailyTaskModal();
    var data = getDailyTaskData();
    var modal = document.getElementById('dailyTaskModal');
    modal.querySelector('.wh-title h2').textContent = data.activeTab === 'weekly' ? '每周任务' : '每日任务';

    var list = data.activeTab === 'weekly' ? data.weeklyPool : data.dailyPool;
    var done = list.filter(function(t) { return t.completed; }).length;
    var claimed = list.filter(function(t) { return t.claimed; }).length;
    var claimable = list.filter(function(t) { return t.completed && !t.claimed; }).length;
    var poolSize = list.length;
    var canClaimAll = claimable > 0;

    // header 统计（可领数量必须显示数字，而不是 true/false）
    var balance = typeof getPreCoinBalance === 'function' ? getPreCoinBalance() : 0;
    var todayLabel = data.activeTab === 'weekly' ? ('本周：' + data.weekKey) : ('今日：' + data.date);
    var claimableLabel = data.activeTab === 'weekly' ? ('一键领取周常 (' + claimable + ')') : ('一键领取 (' + claimable + ')');
    document.getElementById('dtHeaderStats').innerHTML =
        '<span class="wh-stat"><i class="fas fa-check-circle"></i><b>' + done + '/' + poolSize + '</b> 完成</span>' +
        '<span class="wh-stat"><i class="fas fa-coins"></i><b>' + claimable + '</b> 可领</span>' +
        '<span class="wh-stat"><i class="fas fa-wallet"></i>余额 <b>' + balance + ' PRE</b></span>' +
        (canClaimAll ? '<button class="dt-claimall-btn" id="dtClaimAllBtn"><i class="fas fa-gift"></i> ' + claimableLabel + '</button>' : '');

    // 标题右侧 tags：今日/本周 tag + 刷新倒计时 tag
    var titleTagsEl = document.getElementById('dtTitleTags');
    if (titleTagsEl) {
        titleTagsEl.innerHTML =
            '<span class="dt-date-tag ' + (data.activeTab === 'weekly' ? 'weekly' : '') + '"><i class="fas fa-calendar-alt"></i> ' + todayLabel + ' 任务</span>' +
            '<span class="dt-refresh-tag" id="dtRefreshTag"><i class="fas fa-hourglass-half"></i> ' + _dtRefreshCountdownText() + '</span>';
    }

    // toolbar（仅保留日常/周常切换按钮与开发者按钮）
    var weeklyTabCls = data.activeTab === 'weekly' ? ' active' : '';
    var dailyTabCls = data.activeTab === 'daily' ? ' active' : '';
    var toolbarHTML =
        '<button class="wh-tab' + dailyTabCls + '" data-pool="daily"><i class="fas fa-sun"></i> 日常任务</button>' +
        '<button class="wh-tab' + weeklyTabCls + '" data-pool="weekly"><i class="fas fa-calendar-week"></i> 周常任务</button>' +
        (isDailyTaskDevMode() ? '<button class="dt-dev-btn" id="dtDevCompleteBtn"><i class="fas fa-bolt"></i> 一键完成' + (data.activeTab === 'weekly' ? '每周' : '每日') + '任务（dev）</button>' : '');
    document.getElementById('dtToolbar').innerHTML = toolbarHTML;
    document.getElementById('dtToolbar').querySelectorAll('[data-pool]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            data.activeTab = btn.getAttribute('data-pool');
            _dtSaveData(data);
            renderDailyTasksUI();
        });
    });
    var claimAllBtn = document.getElementById('dtClaimAllBtn');
    if (claimAllBtn) claimAllBtn.addEventListener('click', function() { dtClaimAll(); });
    var devBtn = document.getElementById('dtDevCompleteBtn');
    if (devBtn) devBtn.addEventListener('click', function() {
        var poolLabel = data.activeTab === 'weekly' ? '每周' : '每日';
        document.getElementById('dtDevPoolLabel').textContent = poolLabel;
        document.getElementById('dtDevPoolLabel2').textContent = poolLabel;
        document.getElementById('dtDevCompleteModal').classList.add('show');
    });
    document.getElementById('dtDevOk').onclick = function() {
        dtDevComplete(data.activeTab);
        document.getElementById('dtDevCompleteModal').classList.remove('show');
    };

    // content
    var contentEl = document.getElementById('dtContent');
    if (!list.length) {
        contentEl.innerHTML = '<div class="wh-empty"><i class="fas fa-calendar-xmark"></i><p>暂无' + (data.activeTab === 'weekly' ? '周常' : '每日') + '任务</p><span>请明天再来</span></div>';
    } else {
        contentEl.innerHTML = list.map(function(t) {
            var tpl = t.template;
            var progressMax = tpl.progressMax;
            var progVal = t.progress;
            var pct = Math.min(100, Math.round(progVal / progressMax * 100));
            var cls = t.dynamicProgressMax ? 'bonus' : (data.activeTab === 'weekly' ? 'weekly' : 'daily');
            var labelMap = { daily:'日常任务', weekly:'周常任务', bonus:'奖励任务' };
            var labelText = labelMap[cls] || '任务';
            var completed = t.completed;
            var claimed = t.claimed;
            var cardCls = 'dt-task-card' + (claimed ? ' dt-card-done' : '');
            var progressColor = tpl.color;
            var action = '';
            if (claimed) {
                action = '<div class="dt-status dt-status-claimed"><i class="fas fa-check-double"></i> 已领取</div>';
            } else if (completed) {
                action = '<div class="dt-action-row"><button class="dt-claim-btn" data-id="' + t.id + '"><i class="fas fa-gift"></i> 领取 ' + tpl.coinReward + ' PRE</button></div>';
            } else {
                action = '<div class="dt-status dt-status-progress"><i class="fas fa-clock"></i> 进度 ' + progVal + '/' + progressMax + '</div>';
            }
            return '' +
                '<div class="' + cardCls + '">' +
                    '<div class="dt-coin-badge"><i class="fas fa-coins"></i> ' + tpl.coinReward + '</div>' +
                    '<div class="dt-type-tag ' + cls + '">' + labelText + '</div>' +
                    '<div class="dt-task-icon" style="background:' + tpl.color + '1a;color:' + tpl.color + '"><i class="' + tpl.icon + '"></i></div>' +
                    '<div class="dt-task-name">' + tpl.name + '</div>' +
                    '<div class="dt-task-desc">' + tpl.desc + '</div>' +
                    '<div class="dt-progress-bar"><div class="dt-progress-fill" style="width:' + pct + '%;background:' + progressColor + '"></div></div>' +
                    action +
                '</div>';
        }).join('');
        contentEl.querySelectorAll('.dt-claim-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = btn.getAttribute('data-id');
                dtClaimReward(id, data.activeTab);
            });
        });
    }

    // footer
    var footerTip = data.activeTab === 'weekly'
        ? '每周任务将于 UTC+8 每周一 00:00:00 重置，单个任务奖励 PRE 硬币 20-100'
        : '每日任务将于 UTC+8 每日 00:00:00 重置，单个任务奖励 PRE 硬币上限 100';
    document.getElementById('dtFooter').innerHTML = '<i class="fas fa-info-circle"></i> ' + footerTip;
}
