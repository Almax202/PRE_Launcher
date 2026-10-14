// 活动系统 - 活动公告与活动中心管理模块

// 本地存储键名
const EVENT_STORAGE_KEYS = {
    VIEWED_EVENT_ANNOUNCEMENT_IDS: 'viewed_event_announcement_ids',
    EVENT_DATA_VERSION: 'event_data_version'
};

// 初始化：如果数据版本不匹配，重置已读状态
(function initEventData() {
    var currentVersion = '2';
    var storedVersion = localStorage.getItem(EVENT_STORAGE_KEYS.EVENT_DATA_VERSION);
    if (storedVersion !== currentVersion) {
        localStorage.removeItem(EVENT_STORAGE_KEYS.VIEWED_EVENT_ANNOUNCEMENT_IDS);
        localStorage.setItem(EVENT_STORAGE_KEYS.EVENT_DATA_VERSION, currentVersion);
    }
})();

// ==================== 限时等级倍率提速活动配置（时间的唯一权威来源，UTC+8） ====================
// 共14天：第1-7天 ×1.25，第8-14天 ×1.50；活动结束后恢复正常 ×1.00
// 活动固定倍率与仓库「经验值加成卡」倍率相乘叠加，加成卡自身叠加规则不变
var LIMITED_LEVEL_BOOST = {
    eventId: 'center_004',
    announcementId: 'event_level_boost',
    startTime: '2026-09-17 17:00:00',   // 第1天 17:00 开始
    phase2Time: '2026-09-24 10:00:00',  // 第8天 10:00 进入第二阶段
    endTime: '2026-10-01 23:59:59',     // 第14天 23:59:59 结束
    phase1Multiplier: 1.25,
    phase2Multiplier: 1.50
};

// ==================== 赛季通行证活动配置（时间的唯一权威来源，UTC+8） ====================
// 与 js/pass.js PASS_CONFIG 赛季时间保持一致：2026-10-01 04:00 ~ 2026-12-31 04:00 (UTC+8)
var SEASON_PASS_EVENT = {
    eventId: 'center_season_s1',
    announcementId: 'event_season_s1',
    startTime: '2026-10-01 04:00:00',   // 赛季开启 04:00 (UTC+8)
    endTime: '2026-12-31 04:00:00'      // 赛季结束 04:00 (UTC+8)
};

// ==================== 活动公告数据 ====================
var eventAnnouncementData = {
    categories: [
        { id: 'current', name: '当前活动', icon: 'fa-star' },
        { id: 'upcoming', name: '即将到来', icon: 'fa-clock' },
        { id: 'ended', name: '已结束', icon: 'fa-flag-checkered' }
    ],
    // 公告侧边栏排序配置：按数组顺序显示
    sortOrder: ['event_season_s1', 'event_level_boost', 'event_autumn_sale', 'event_002', 'event_001', 'event_daily_checkin'],
    announcements: [
        {
            id: 'event_level_boost',
            category: 'current',
            title: '限时等级倍率提速活动',
            date: '2026-09-17',
            endDate: '2026-10-01',
            startTime: LIMITED_LEVEL_BOOST.startTime,
            endTime: LIMITED_LEVEL_BOOST.endTime,
            description: '活动期间全账户成长等级经验获取倍率限时提升：前7天 ×1.25，第8-14天提升至 ×1.50，可与经验值加成卡叠加，共14天。',
            content: '<h2>限时等级倍率提速活动</h2><p>金秋提速，等级成长快人一步！活动期间，<span style="color:#d45d79;font-weight:600;">所有账户的成长等级经验获取倍率将限时提升</span>，无需报名，登录即自动生效。</p><h3>活动时间</h3><p>起始时间：2026年9月17日 17:00:00（UTC+8）<br>结束时间：2026年10月1日 23:59:59（UTC+8）<br>活动共计 14 天，结束后倍率自动恢复为正常的 ×1.00</p><h3>倍率安排</h3><ul><li><strong>第一阶段（第1-7天）：</strong>2026年9月17日 10:00 至 9月24日 10:00，经验倍率提升至 <span style="color:#d45d79;font-weight:600;">×1.25</span></li><li><strong>第二阶段（第8-14天）：</strong>2026年9月24日 10:00 至 10月1日 23:59:59，经验倍率提升至 <span style="color:#d45d79;font-weight:600;">×1.50</span></li><li><strong>活动结束后：</strong>经验倍率恢复正常 ×1.00</li></ul><h3>叠加规则</h3><ul><li>本活动的<span style="color:#d45d79;font-weight:600;">固定加成倍率可与仓库「经验值加成卡」的提升倍率叠加</span>，总倍率 = 活动倍率 × 加成卡倍率</li><li>使用经验值加成卡后，仍遵循加成卡原有叠加规则：不同类型（Ⅰ/Ⅱ/Ⅲ/Ⅳ）可同时生效，同类型不可叠加，最多同时 4 张，每张持续 30 分钟</li><li>举例：第二阶段（×1.50）同时激活 Ⅰ+Ⅱ+Ⅲ 三种加成卡时，总倍率为 ×1.50 × ×1.50 = <span style="color:#d45d79;font-weight:600;">×2.25</span></li></ul><h3>适用范围</h3><p>每日签到、签到里程碑奖励、活动中心签到奖励、邮件经验附件、经验值补给卡等所有成长等级经验获取途径，均享受活动倍率加成。</p><h3>参与方式</h3><p>无需报名或领取，活动期间全账户自动生效。成长等级卡片中的「经验倍率」条目会实时显示当前总倍率与生效时间。</p><h3>温馨提示</h3><p>活动倍率按服务器时间（UTC+8）自动切换阶段，无需刷新页面；活动结束后加成卡若仍在有效期内，将继续按加成卡自身倍率生效，直至时长耗尽。</p>',
            banner: ''
        },
        {
            id: 'event_autumn_sale',
            category: 'current',
            title: '秋季促销',
            date: '2026-08-30',
            endDate: '2026-09-13',
            startTime: '2026-08-30 00:00:00',
            endTime: '2026-09-13 23:59:59',
            description: '商店全场物品限时折扣！PRE Coin 兑换更划算，折扣力度以商店页面实时展示为准。',
            content: '<h2>秋季促销</h2><p>金秋九月，好价连连！秋季促销是商店的<span style="color:#d45d79;font-weight:600;">限时大型促销活动</span>，活动期间商店内全部在售商品均享受促销折扣优惠。</p><h3>活动时间</h3><p>起始日：2026年8月30日 00:00:00（UTC+8）<br>结束时间：2026年9月13日 23:59:59（UTC+8）<br>活动结束后将自动纳入已结束类别</p><h3>促销内容</h3><ul><li><strong>全场折扣：</strong>活动期间商店全部在售商品统一附加促销折扣，具体折扣力度以商店页面的价格标签为准</li><li><strong>划线价展示：</strong>促销商品同时展示原价（划线）与折后价，优惠一目了然</li><li><strong>限购不变：</strong>各类商品的每日/每周/总限购数量在活动期间保持不变</li><li><strong>组合包说明：</strong>组合包价格独立计算，不与全场促销叠加</li></ul><h3>参与方式</h3><p>打开商店即可看到促销价格，使用 PRE Coin 直接兑换；也可在活动中心点击「立即参与」直达商店。</p><h3>温馨提示</h3><p>促销折扣与商品自身折扣取较高者生效；活动结束后商品将恢复原价，请把握机会！</p>',
            banner: ''
        },
        {
            id: 'event_daily_checkin',
            category: 'current',
            title: '每日签到',
            date: '账号建立时间',
            endDate: '无限制',
            description: '每天登录签到，领取日常奖励',
            content: '<h2>每日签到</h2><p>欢迎使用 PRE Launcher！每日签到是一项<span style="color:#d45d79;font-weight:600;">常驻活动</span>，只要您的账号存在，即可随时参与。</p><h3>活动时间</h3><p>起始日：账号建立时间<br>结束时间：无限制<br>每日更新，签到获取成长经验值</p><h3>奖励说明</h3><p>每日签到可获取成长经验值，限时物品道具和赛季通行证经验值（仅限赛季开放期间），帮助您的账号等级提升。连续签到还将解锁更多里程碑奖励。</p><h3>参与方式</h3><p>在活动中心点击「立即参与」即可跳转至每日签到区域，点击当日签到卡片完成签到。</p>',
            banner: ''
        },
        {
            id: 'event_001',
            category: 'current',
            title: '秋季签到与等级提速特别活动',
            date: '2026-08-27',
            endDate: '2026-09-30<p>（第三季度）</p>',
            startTime: '2026-08-27 00:00:00',
            endTime: '2026-09-30 23:59:59',
            description: '常驻活动，注册即可参与！14天签到领取丰厚奖励，含名片样式、3D太空背景与海量经验值。',
            content: '<h2>秋季签到与等级提速特别活动</h2><p>秋季来临，全新启程！本次活动为<span style="color:#d45d79;font-weight:600;">第三季度限时签到活动</span>，成功注册账号即可直接参与！</p><h3>活动时间</h3><p>起始日：2026年8月27日（UTC+8）<br>结束时间：下一季度前（2026年9月30日）<br>领取完成后活动将纳入已结束类别</p><h3>签到奖励（共14天）</h3><ul><li><strong>第1天：</strong>新名片样式「星河漫游」（特殊获取）</li><li><strong>第2-7天：</strong>每天500经验值（共3000exp）</li><li><strong>第8天：</strong>新3D太空遨游背景（特殊获取）</li><li><strong>第9-13天：</strong>每天1000经验值（共5000exp）</li><li><strong>第14天：</strong>2000经验值（总计10000exp）</li></ul><h3>参与方式</h3><p>进入活动中心 → 找到本活动 → 点击签到奖励卡或一键领取按钮领取对应奖励</p><h3>奖励说明</h3><p>经验值将立即对账户等级生效，名片样式和3D背景将解锁到对应系统中。</p>',
            banner: ''
        },
        {
            id: 'event_002',
            category: 'upcoming',
            title: '冬季签到特别活动',
            date: '2026-10-01',
            endDate: '2026-12-31<p>（第四季度）</p>',
            startTime: '2026-10-01 00:00:00',
            endTime: '2026-12-31 23:59:59',
            description: '第四季度限时签到活动，共30天，签到领取各类经验值加成卡、补给卡与 PRE Coin 补给包，奖励自动发送至仓库。',
            content: '<h2>冬季签到特别活动</h2><p>寒冬将至，温暖相伴！本次活动为<span style="color:#d45d79;font-weight:600;">第四季度限时签到活动</span>，共计 30 天签到日程，每天登录即可领取对应奖励，所有奖励均自动发放至仓库。</p><h3>活动时间</h3><p>起始日：2026年10月1日 00:00:00（UTC+8）<br>结束时间：2026年12月31日 23:59:59（UTC+8）</p><h3>签到奖励（共30天）</h3><ul><li><strong>第1/3/5/7天：</strong>经验值加成卡 Ⅰ ×1</li><li><strong>第2/4/6/8天：</strong>经验值补给卡 Ⅰ ×1</li><li><strong>第9天：</strong>PRE Coin 补给包 Ⅰ ×3</li><li><strong>第10/12/14天：</strong>经验值加成卡 Ⅱ ×1</li><li><strong>第11/13/15天：</strong>经验值补给卡 Ⅱ ×1</li><li><strong>第16天：</strong>PRE Coin 补给包 Ⅱ ×3</li><li><strong>第17/19/21天：</strong>经验值加成卡 Ⅲ ×1</li><li><strong>第18/20/22天：</strong>经验值补给卡 Ⅲ ×1</li><li><strong>第23天：</strong>PRE Coin 补给包 Ⅲ ×2</li><li><strong>第24/26/28天：</strong>经验值加成卡 Ⅳ ×1</li><li><strong>第25/27/29天：</strong>经验值补给卡 Ⅳ ×1</li><li><strong>第30天：</strong>PRE Coin 补给包 Ⅳ ×1</li></ul><h3>参与方式</h3><p>活动期间进入活动中心 → 找到本活动 → 点击签到奖励卡或一键领取按钮领取对应奖励，奖励自动发放至仓库（单发 PRE Coin 直接计入余额）。</p><h3>补签规则</h3><p>持有补签卡时可补签已过登录天数内、且尚未领取的奖励；超出当前已过天数的奖励无法补签。</p><h3>公告发布时间</h3><p>2026年09月30日（UTC+8）</p>',
            banner: ''
        },
        {
            id: 'event_season_s1',
            category: 'upcoming',
            title: '第一赛季「初始化」即将上线',
            date: '2026-10-01',
            endDate: '2026-12-31',
            startTime: SEASON_PASS_EVENT.startTime,
            endTime: SEASON_PASS_EVENT.endTime,
            description: '全新赛季通行证系统即将登场！第一赛季「初始化」将于 2026年10月1日 04:00（UTC+8）正式开启，120 级奖励长线等你解锁。',
            content: '<h2>第一赛季「初始化」即将上线</h2><p>全新<span style="color:#d45d79;font-weight:600;">赛季通行证系统</span>即将登场！第一赛季以<span style="color:#d45d79;font-weight:600;">「初始化」(Season 1 - Initialize)</span>为主题——一切伟大航程的起点，都从这里开始。</p><h3>上线时间</h3><p>开启时间：2026年10月1日 04:00（UTC+8）<br>结束时间：2026年12月31日 04:00（UTC+8）</p><h3>赛季亮点</h3><ul><li><strong>120 级奖励长线：</strong>免费/付费双档位奖励，含单次抽券、十连抽券、经验值补给卡、PRE Coin 补给包、经验值加成卡与每级 PRE 硬币奖励（全赛季合计 5000 枚）</li><li><strong>三层任务系统：</strong>日常 / 周常 / 赛季任务，签到、商店兑换、仓库管理等日常行为自动累积通行证经验</li><li><strong>EX 溢出奖励：</strong>满级后继续获取经验，按溢出节奏领取额外 PRE Coin</li><li><strong>通行证组合包：</strong>内含本体全部付费内容，购买后立即获得 10 级、经验值补给卡Ⅳ×2、PRE Coin 补给包Ⅳ×1 与限定「第一赛季纪念徽章」（可展示在用户名片个人荣勋）</li></ul><h3>购买方式</h3><p>通行证本体：6480 PRE Coin<br>通行证组合包：原价 12900 PRE Coin，未购买本体时直接购买可享优惠价 10368 PRE Coin</p><h3>温馨提示</h3><p>赛季开启前无法购买等级、解锁付费通行证或累积任务进度；赛季开启后相关功能将自动解禁。即刻开始囤积 PRE Coin，抢先领跑新赛季！</p><h3>公告发布时间</h3><p>2026年09月23日（UTC+8）</p>',
            banner: ''
        },
    ]
};

// ==================== 通行证公告数据 ====================
// 专门存放通行证窗口内「公告」弹窗的全部公告内容
// pass.js 渲染公告弹窗时按数组顺序显示，第一条默认选中
// 左侧列表按 categories 分组展示：system=系统公告（公告/指南类内容）、rules=规则说明（机制说明类公告）
var passAnnouncementData = {
    categories: [
        { id: 'system', name: '系统公告', icon: 'fa-bullhorn' },
        { id: 'rules', name: '规则说明', icon: 'fa-book-open' }
    ],
    announcements: [
        {
            id: 'pass_ann_s1_launch',
            category: 'system',
            title: '第一赛季通行证「初始化」正式上线',
            date: '2026-10-01',
            content: '<h2>第一赛季通行证「初始化」正式上线</h2><p>全新<span style="color:#ff9dc0;font-weight:600;">赛季通行证系统</span>正式登场！第一赛季以<span style="color:#ff9dc0;font-weight:600;">「初始化」(Season 1 - Initialize)</span>为主题——一切伟大航程的起点，都从这里开始。</p><h3>赛季时间</h3><p>开启时间：2026年10月1日 04:00（UTC+8）<br>结束时间：2026年12月31日 04:00（UTC+8）<br>赛季共计 91 天</p><h3>赛季亮点</h3><ul><li><strong>120 级奖励长线：</strong>免费/付费双档位奖励，含单次抽券、十连抽券、经验值补给卡、PRE Coin 补给包、经验值加成卡与每级 PRE 硬币奖励（全赛季合计 5000 枚）</li><li><strong>三层任务系统：</strong>日常 / 周常 / 赛季任务，签到、商店兑换、仓库管理等日常行为自动累积通行证经验</li><li><strong>EX 溢出奖励：</strong>满级后继续获取经验，按溢出节奏领取额外 PRE Coin</li><li><strong>通行证组合包：</strong>内含本体全部付费内容，购买后立即获得 10 级、经验值补给卡Ⅳ×2、PRE Coin 补给包Ⅳ×1 与限定「第一赛季纪念徽章」（可展示在用户名片个人荣勋）</li></ul><h3>购买方式</h3><p>通行证本体：6480 PRE Coin<br>通行证组合包：原价 12900 PRE Coin，未购买本体时直接购买可享优惠价 10368 PRE Coin</p><h3>温馨提示</h3><p>赛季期间可随时通过通行证窗口左上角的「切换」按钮查看赛季信息；赛季结束未领取的等级奖励将无法补领，请及时领取。</p><h3>公告发布时间</h3><p>2026年10月1日（UTC+8）</p>'
        },
        {
            id: 'pass_ann_task_guide',
            category: 'system',
            title: '赛季任务与经验获取指南',
            date: '2026-10-10',
            content: '<h2>赛季任务与经验获取指南</h2><p>通行证经验是提升通行证等级的唯一途径，本公告帮助您快速了解<span style="color:#ff9dc0;font-weight:600;">经验获取途径与任务系统</span>，规划本赛季的升级节奏。</p><h3>升级所需经验</h3><p>通行证每提升 1 级需要 <strong>10 点通行证经验</strong>，全赛季 120 级共需 1200 点经验，满级后进入 EX 溢出阶段。</p><h3>三层任务系统</h3><ul><li><strong>日常任务：</strong>每日凌晨 4 点刷新，完成签到、商店兑换、仓库管理等日常行为即可自动累积通行证经验</li><li><strong>周常任务：</strong>每周一凌晨 4 点刷新，目标跨度更大，奖励经验更多，请留意每周事项页签的刷新时间</li><li><strong>赛季任务：</strong>贯穿整个赛季的长线目标，一次性完成后可获取大额经验奖励</li></ul><h3>经验获取途径</h3><ul><li>完成日常 / 周常 / 赛季任务</li><li>每日签到（仅限赛季开放期间同步累积通行证经验）</li><li>商店兑换、仓库管理等日常行为的附带经验</li></ul><h3>温馨提示</h3><p>通行证经验与账号成长等级经验相互独立；赛季结束后未使用的通行证经验将清零，请合理安排完成节奏。</p><h3>公告发布时间</h3><p>2026年10月10日（UTC+8）</p>'
        },
        {
            id: 'pass_ann_purchase_guide',
            category: 'rules',
            title: '通行证购买与等级直购说明',
            date: '2026-10-10',
            content: '<h2>通行证购买与等级直购说明</h2><p>本公告说明第一赛季通行证的<span style="color:#ff9dc0;font-weight:600;">付费档位、组合包优惠与等级直购规则</span>，购买前请仔细阅读。</p><h3>购买档位</h3><ul><li><strong>免费档位：</strong>所有玩家默认解锁，120 级免费奖励长线</li><li><strong>付费本体：</strong>6480 PRE Coin，解锁 120 级付费奖励长线与每级 PRE 硬币奖励</li><li><strong>通行证组合包：</strong>原价 12900 PRE Coin，内含本体全部付费内容与立即豪礼（立即获得 10 级、经验值补给卡Ⅳ×2、PRE Coin 补给包Ⅳ×1 与限定「第一赛季纪念徽章」）</li></ul><h3>组合包优惠</h3><p>未购买本体时直接购买组合包，可享约 8 折优惠价 <strong>10368 PRE Coin</strong>；已购买本体后再购买组合包按原价结算，请优先选择直接购买组合包以享受优惠。</p><h3>等级直购</h3><ul><li>购买 1 级通行证等级需要 <strong>300 PRE Coin</strong>，可一次性购买多级</li><li>等级直购上限为 120 级，超出部分无法购买</li><li>直购等级同步获得该等级免费与付费奖励（需已解锁对应档位）</li></ul><h3>温馨提示</h3><p>购买付费通行证后，此前等级的付费奖励会一并补发至仓库；赛季结束前请留意余额，合理安排消费。</p><h3>公告发布时间</h3><p>2026年10月10日（UTC+8）</p>'
        },
        {
            id: 'pass_ann_ex_overflow',
            category: 'rules',
            title: 'EX 溢出奖励机制说明',
            date: '2026-10-10',
            content: '<h2>EX 溢出奖励机制说明</h2><p>通行证等级达到 120 级上限后，继续获取的通行证经验将进入<span style="color:#ff9dc0;font-weight:600;">EX 溢出阶段</span>，持续为您提供 PRE Coin 收益。</p><h3>溢出规则</h3><ul><li>通行证等级达到 120 级后，超出部分的经验按每级 10 点继续累积，转化为 EX 溢出等级（121 级起）</li><li>EX 溢出等级不再提供物品奖励，改为发放 PRE Coin</li><li>EX 溢出等级无上限，赛季期间可持续累积</li></ul><h3>溢出奖励</h3><ul><li><strong>免费档位：</strong>每提升 1 级 EX 溢出等级，获得 <strong>50 PRE Coin</strong></li><li><strong>付费档位：</strong>每提升 1 级 EX 溢出等级，额外获得 <strong>100 PRE Coin</strong>（与免费合计 150 枚/级）</li></ul><h3>温馨提示</h3><p>EX 溢出奖励即时发放，点击一键领取按钮即可领取溢出的EX奖励；赛季结束后 EX 等级与未结算经验将清零，不会累计至下个赛季。</p><h3>公告发布时间</h3><p>2026年10月10日（UTC+8）</p>'
        },
        {
            id: 'pass_ann_weekly12_guide',
            category: 'rules',
            title: '每周事项机制说明',
            date: '2026-10-10',
            content: '<h2>每周事项机制说明</h2><p>「每周事项」是赛季通行证的<span style="color:#ff9dc0;font-weight:600;">12 周长线任务玩法</span>，每周解锁一批专属任务，帮助您在赛季全程稳定获取通行证经验。</p><h3>开放规则</h3><ul><li>自赛季开启（2026年10月1日 04:00，UTC+8）起，<strong>每 7 天开放 1 周</strong>（即新一周第一天的凌晨 4 点扩充），全赛季共 12 周</li><li>点击「每周事项」页签后，周次按钮会从页签栏右侧滑出，可点击周次切换，也可使用左右箭头翻页</li><li>未开放的周次按钮置灰显示，页签栏内会实时显示<strong>距下一周开放的天数</strong>（1~7 天）</li><li>12 周全部开放后不再显示倒计时</li></ul><h3>任务构成</h3><ul><li>每周固定 <strong>8 个任务</strong>，全赛季 12 周共 96 个任务</li><li>任务内容涵盖每日签到、小游戏、抽卡模拟器、仓库、商店、邮件、百宝箱与累计赚取 PRE Coin 等日常行为</li><li>任务难度随周次递进（如第 1 周签到 2 次、第 2 周签到 3 次），单任务经验值为 <strong>3~8 点</strong></li></ul><h3>进度与领取</h3><ul><li>任务进度由对应的日常行为自动累积，无需手动报名</li><li>进度达标后需在「每周事项」页内<strong>手动点击领取</strong>通行证经验</li><li>开放周次内的任务在当周结束后仍可领取，请放心安排时间</li></ul><h3>温馨提示</h3><p>每周事项经验与日常/周常/赛季任务相互独立；赛季结束后未领取的任务经验将随赛季一并失效，建议每周定期查看并领取。</p><h3>公告发布时间</h3><p>2026年10月10日（UTC+8）</p>'
        },
        {
            id: 'pass_ann_phase_guide',
            category: 'rules',
            title: '阶段奖励机制说明',
            date: '2026-10-10',
            content: '<h2>阶段奖励机制说明</h2><p>「阶段奖励」是<span style="color:#ff9dc0;font-weight:600;">付费通行证专属的长线里程碑奖励</span>，以时间轴形式展示，通行证等级达到指定节点即可领取额外好礼。</p><h3>解锁条件</h3><ul><li>阶段奖励为<strong>付费通行证专属内容</strong>，需购买「付费通行证」或「通行证组合包」后解锁</li><li>免费通行证用户可查看时间轴，但无法领取节点奖励</li></ul><h3>奖励节点</h3><ul><li><strong>0 级（初始奖励）：</strong>经验值补给卡 Ⅲ ×1（购买后立即可领）</li><li><strong>30 级：</strong>PRE Coin 补给包 Ⅲ ×1</li><li><strong>50 级：</strong>经验值补给卡 Ⅳ ×1</li><li><strong>80 级：</strong>限定名片样式「通行证·第一赛季」</li><li><strong>100 级：</strong>PRE Coin 补给包 Ⅳ ×1</li><li><strong>120 级（终点奖励）：</strong>3D 动态背景「赛季顶点」</li></ul><h3>领取规则</h3><ul><li>需同时满足<strong>已购买付费通行证</strong>且<strong>通行证等级达到节点等级</strong>两个条件</li><li>奖励类型包括仓库物品、用户名片样式与 3D 动态背景，领取后立即发放/解锁</li><li>每个节点仅可领取一次，可在「阶段奖励」页签的时间轴上随时查看领取状态</li></ul><h3>温馨提示</h3><p>购买付费通行证前已达成的节点等级不会错过奖励，购买后即可一并补领；赛季结束未领取的阶段奖励将无法补领，请及时领取。</p><h3>公告发布时间</h3><p>2026年10月10日（UTC+8）</p>'
        },
        {
            id: 'pass_ann_boost_guide',
            category: 'rules',
            title: '等级提速机制说明',
            date: '2026-10-10',
            content: '<h2>等级提速机制说明</h2><p>「等级提速」是赛季<span style="color:#ff9dc0;font-weight:600;">收官阶段的限时冲刺玩法</span>，仅在赛季最后一周开启，提供 15 个高价值任务，助力您在赛季结束前冲刺更高等级。</p><h3>开启时间</h3><ul><li>等级提速在<strong>赛季最后一周（结束前 7 天）限时开启</strong>，赛季结束即下线</li><li><strong>倒数第二周为等待期</strong>：页签显示倒计时（1~7 天），可提前了解玩法但无法开始任务</li><li>进入最后一周后自动启用，任务进度开始累积</li></ul><h3>任务构成</h3><ul><li>共 <strong>15 个专属任务</strong>，每个任务奖励 <strong>10 点通行证经验</strong>，全部完成合计 <strong>150 点</strong>（相当于 15 级）</li><li>任务内容涵盖每日签到、小游戏、抽卡模拟器、仓库、商店、邮件、百宝箱、累计赚取 PRE Coin 与使用经验加成卡等</li><li>目标量较高（如签到 7 次、抽卡 15 次、赚取 800 PRE Coin），请提前规划冲刺节奏</li></ul><h3>进度与领取</h3><ul><li>仅<strong>提速启用期间</strong>的对应行为才计入任务进度，等待期内的行为不计入</li><li>进度达标后需在「等级提速」页内<strong>手动点击领取</strong>通行证经验</li></ul><h3>温馨提示</h3><p>等级提速是赛季末期追赶等级、冲击 120 级终点奖励与 EX 溢出收益的最后机会；赛季结束后未领取的提速任务经验将失效，请在赛季结束前完成并领取。</p><h3>公告发布时间</h3><p>2026年10月10日（UTC+8）</p>'
        },
        {
            id: 'pass_ann_season_switch',
            category: 'rules',
            title: '切换赛季通行证功能说明',
            date: '2026-10-10',
            content: '<h2>切换赛季通行证功能说明</h2><p>「切换赛季通行证」功能位于通行证窗口左上角，通过<span style="color:#ff9dc0;font-weight:600;">「切换」按钮</span>打开更换赛季弹窗，可查看各赛季通行证的起止时间、赛季名称与进行状态。</p><h3>功能入口</h3><ul><li>点击通行证窗口左上角的「切换」按钮，打开「更换赛季通行证」弹窗</li><li>弹窗中以块状卡片展示各赛季信息：左上为起止时间，左下为赛季名称，右下为进行状态标签</li><li>点击对应赛季卡片即可切换查看</li></ul><h3>当前功能范围</h3><ul><li>该功能目前<strong>仅支持过往赛季预览</strong>：用于查看历史赛季的基本信息，不会改变您当前通行证的任何数据</li><li>当前仅第一赛季「初始化」开放，其余赛季卡片显示「敬请期待」</li><li>点击当前进行中的赛季卡片，将直接返回当前赛季通行证</li></ul><h3>单赛季进行规则</h3><ul><li>同一时间<strong>仅有一个赛季通行证处于进行状态</strong>，无法多个通行证同时存在并推进</li><li>通行证等级、经验、任务进度（日常/周常/赛季/每周事项/等级提速）均仅归属当前进行中的赛季</li><li>过往赛季的进度与奖励领取状态在赛季结束后即冻结，不会与新一赛季并行累积</li></ul><h3>温馨提示</h3><p>未来新赛季开放后，将可通过该弹窗切换至对应赛季通行证；当前赛季进行期间，请留意赛季结束时间，及时领取未领取的奖励。</p><h3>公告发布时间</h3><p>2026年10月10日（UTC+8）</p>'
        },
        {
            id: 'pass_ann_progress_guide',
            category: 'system',
            title: '赛季完成度功能指南',
            date: '2026-10-12',
            content: '<h2>赛季完成度功能指南</h2><p>赛季通行证现已新增<span style="color:#ffb347;font-weight:600;">「赛季完成度」</span>功能，帮助您直观掌握本赛季各维度的完成进度，一眼看出哪些方面还有提升空间。</p><h3>功能入口</h3><ul><li>打开赛季通行证窗口，在顶部页签栏中点击<strong>「赛季完成度」</strong>即可进入</li><li>也可点击通行证窗口左上角「切换」按钮，在赛季卡片的<strong>右上角金色完成度标签</strong>上点击，查看当前赛季完成度概览</li></ul><h3>界面布局</h3><ul><li>页面<strong>左侧</strong>为金色渐变描边的<strong>总进度圆环</strong>，中心显示整体完成百分比，下方在 100% 时会出现「全部完成」金色徽章</li><li>页面<strong>右侧</strong>以 2 列网格展示各维度完成度条目，通过金色连接线统一汇入左侧总进度圆环</li></ul><h3>五大完成度维度</h3><ul><li><strong>通行证等级总进度：</strong>当前等级与 120 级满级的比值（已等级经验折算）</li><li><strong>通行证任务总进度：</strong>赛季任务（10 个长线任务）的累计完成度，日常/周常为循环刷新任务不计入</li><li><strong>每周事项十二周总进度：</strong>仅计入<strong>已开放周次</strong>（每 7 天开放 1 周），新周次开放后自动纳入计算，赛季全程共 12 周</li><li><strong>阶段奖励领取完成度：</strong>付费通行证专属的 6 个里程碑节点（0/30/50/80/100/120 级）领取完成情况；未购买付费通行证时显示解锁提示</li><li><strong>等级提速完成度：</strong>仅在<strong>赛季最后一周</strong>开启后自动计入总进度，未开启时显示为 0% 且不计入平均值</li></ul><h3>总进度计算</h3><ul><li>总进度为已计入维度完成度的<strong>简单平均值</strong>（未开启等级提速时为 4 维平均，开启后为 5 维平均）</li><li>赛季完成后总进度将冻结，进入下一赛季后可通过切换赛季弹窗回看历史赛季完成度</li></ul><h3>温馨提示</h3><p>总进度 100% 时圆环下方会出现发光的「全部完成」金色徽章；赛季结束后可随时在切换赛季弹窗中点击金色标签回看本赛季的完成度数据。</p><h3>公告发布时间</h3><p>2026年10月12日（UTC+8）</p>'
        }
    ]
};

// ==================== 活动中心数据（基础模板，内容可随时更新） ====================
var eventCenterData = {
    categories: [
        { id: 'season', name: '赛季活动', icon: 'fa-trophy' },
        { id: 'featured', name: '精选活动', icon: 'fa-fire' },
        { id: 'daily', name: '每日活动', icon: 'fa-calendar-day' },
        { id: 'special', name: '特殊活动', icon: 'fa-gem' },
        { id: 'ended', name: '已结束', icon: 'fa-flag-checkered' }
    ],
    // 活动侧边栏排序配置：按数组顺序显示
    sortOrder: ['center_season_s1', 'center_005', 'center_004', 'center_003', 'center_002', 'center_001'],
    events: [
        {
            id: 'center_season_s1',
            category: 'season',
            title: '第一赛季「初始化」',
            subtitle: '赛季通行证正式开启',
            status: 'upcoming',
            description: '全新赛季通行证第一赛季「初始化」即将开启！<p>120 级免费/付费双档位奖励长线，日常/周常/赛季三层任务系统，满级后更有 EX 溢出奖励持续发放。</p><p>赛季期间购买通行证组合包可立即获得 10 级、经验值补给卡Ⅳ×2、PRE Coin 补给包Ⅳ×1 与限定「第一赛季纪念徽章」。</p><p>赛季时间：2026年10月1日 04:00 - 2026年12月31日 04:00（UTC+8）</p><p>赛季开始后点击「立即参与」即可打开赛季通行证界面</p>',
            icon: 'fa-trophy',
            announcementId: 'event_season_s1',
            showParticipate: true,
            participateAction: 'pass',
            startTime: SEASON_PASS_EVENT.startTime,
            endTime: SEASON_PASS_EVENT.endTime
        },

        {
            id: 'center_004',
            category: 'special',
            title: '限时等级倍率提速活动',
            subtitle: '全账户经验倍率限时提升',
            status: 'active',
            description: '活动期间全账户成长等级经验获取倍率限时提升，等级成长快人一步，无需报名自动生效！<p>第一阶段（第1-7天，9月17日 17:00 - 9月24日 10:00）：经验倍率 ×1.25</p><p>第二阶段（第8-14天，9月24日 10:00 - 10月1日 23:59）：经验倍率 ×1.50</p><p>活动固定倍率可与仓库经验值加成卡叠加（总倍率 = 活动倍率 × 加成卡倍率），活动结束后恢复 ×1.00</p>',
            icon: 'fa-gauge-high',
            announcementId: 'event_level_boost',
            showParticipate: false,
            startTime: LIMITED_LEVEL_BOOST.startTime,
            endTime: LIMITED_LEVEL_BOOST.endTime
        },

        {
            id: 'center_003',
            category: 'featured',
            title: '秋季促销',
            subtitle: '全场商品限时折扣',
            status: 'active',
            description: '商店全场物品限时促销，PRE Coin 兑换更划算<p>（折扣力度以商店页面为准）</p><p>活动时间：2026年8月30日 00:00 - 2026年9月13日 23:59（UTC+8）</p>',
            icon: 'fa-percent',
            announcementId: 'event_autumn_sale',
            showParticipate: true,
            participateAction: 'shop',
            startTime: '2026-08-30 00:00:00',
            endTime: '2026-09-13 23:59:59'
        },

        {
            id: 'center_001',
            category: 'daily',
            title: '每日签到',
            subtitle: '每日更新',
            status: 'active',
            description: '每天登录签到，领取日常奖励',
            icon: 'fa-calendar-check',
            announcementId: 'event_daily_checkin',
            showParticipate: true
        },
        {
            id: 'center_002',
            category: 'featured',
            title: '秋季签到与等级提速特别活动',
            subtitle: '第三季度限时活动',
            status: 'active',
            description: '14天签到领丰厚奖励：名片样式、3D太空背景与海量经验值<p>（共10000exp）</p><p>活动时间：2026年8月27日 - 2026年9月30日（UTC+8）（下一季度前）</p>',
            icon: 'fa-rocket',
            hasCheckin: true,
            checkinDays: 14,
            announcementId: 'event_001',
            showParticipate: false,
            startTime: '2026-08-27 00:00:00',
            endTime: '2026-09-30 23:59:59'
        },
        {
            id: 'center_005',
            category: 'featured',
            title: '冬季签到特别活动',
            subtitle: '第四季度限时活动',
            status: 'upcoming',
            description: '第四季度限时签到活动，共30天，每天签到领取经验值加成卡/补给卡与 PRE Coin 补给包，奖励自动发放至仓库<p>活动时间：2026年10月1日 00:00 - 2026年12月31日 23:59（UTC+8）</p>',
            icon: 'fa-snowflake',
            hasCheckin: true,
            checkinDays: 30,
            announcementId: 'event_002',
            showParticipate: false,
            startTime: '2026-10-01 00:00:00',
            endTime: '2026-12-31 23:59:59'
        },
    ]
};

// ==================== 活动定时开始/结束（依据 startTime / endTime 自动迁移） ====================

// 将 'YYYY-MM-DD HH:mm:ss' 按 UTC+8 解析为时间戳；未配置/格式错误返回 null
function parseEventTimeUtc8(str) {
    if (!str) return null;
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/.exec(String(str).trim());
    if (!m) return null;
    var h = m[4] !== undefined ? parseInt(m[4], 10) : 0;
    return Date.UTC(
        parseInt(m[1], 10),
        parseInt(m[2], 10) - 1,
        parseInt(m[3], 10),
        h - 8, // UTC+8 → UTC
        m[5] !== undefined ? parseInt(m[5], 10) : 0,
        m[6] !== undefined ? parseInt(m[6], 10) : 0
    );
}

// 获取活动时间状态：'upcoming' 未开始 / 'active' 进行中 / 'ended' 已结束
function getEventTimeState(startStr, endStr) {
    var now = Date.now();
    var s = parseEventTimeUtc8(startStr);
    var e = parseEventTimeUtc8(endStr);
    if (s !== null && now < s) return 'upcoming';
    if (e !== null && now > e) return 'ended';
    return 'active';
}

// 活动状态中文文本
function getEventStatusText(status) {
    return status === 'active' ? '进行中' : (status === 'upcoming' ? '未开始' : '已结束');
}

// 依据起止时间自动调整活动/公告的状态与分类（结束后归入已结束类别），返回是否有变化
function applyTimedEventStates() {
    var changed = false;
    // 通行证 Dev「全部解禁」开启时，赛季通行证活动/公告视为进行中
    var devUnlockActive = (window.pass && typeof window.pass.isDevUnlockAll === 'function' && window.pass.isDevUnlockAll());

    eventCenterData.events.forEach(function(evt) {
        if (!evt.startTime && !evt.endTime) return;
        var state = getEventTimeState(evt.startTime, evt.endTime);
        // 赛季通行证活动：Dev 全部解禁时强制视为进行中
        if (devUnlockActive && evt.id === SEASON_PASS_EVENT.eventId) state = 'active';
        if (evt.status !== state) { evt.status = state; changed = true; }
        // 已结束的活动归入「已结束」类别（Dev 解禁的赛季活动除外，保持原分类）
        if (state === 'ended' && evt.category !== 'ended') { evt.category = 'ended'; changed = true; }
        if (devUnlockActive && evt.id === SEASON_PASS_EVENT.eventId && evt.category === 'ended') {
            evt.category = 'season'; changed = true;
        }
    });

    // 公告分类跟随时间：即将到来 → 当前活动 → 已结束
    var annCatMap = { upcoming: 'upcoming', active: 'current', ended: 'ended' };
    eventAnnouncementData.announcements.forEach(function(ann) {
        if (!ann.startTime && !ann.endTime) return;
        var state = getEventTimeState(ann.startTime, ann.endTime);
        // 赛季通行证公告：Dev 全部解禁时强制视为当前活动（进行中）
        if (devUnlockActive && ann.id === SEASON_PASS_EVENT.announcementId) state = 'active';
        var newCat = annCatMap[state];
        if (newCat && ann.category !== newCat) { ann.category = newCat; changed = true; }
    });

    return changed;
}

// 刷新已打开的活动弹窗（侧边栏列表 + 当前选中详情）
function refreshOpenEventModals() {
    var annModal = document.getElementById('eventAnnouncementModal');
    if (annModal && annModal.style.display === 'flex') renderEventAnnouncementList();

    var centerModal = document.getElementById('eventCenterModal');
    if (centerModal && centerModal.style.display === 'flex') {
        renderEventCenterList();
        var activeItem = centerModal.querySelector('.event-announcement-item.active');
        if (activeItem) showEventCenterDetail(activeItem.getAttribute('data-id'));
    }
}

// 定时检查：每 30 秒校验一次，活动到点自动开始/结束并刷新界面
setInterval(function() {
    if (applyTimedEventStates()) refreshOpenEventModals();
}, 30000);

// 页面加载时立即应用一次时间状态
applyTimedEventStates();

// ==================== 限时等级倍率提速：经验倍率计算（纯时间驱动，不依赖本地存储） ====================

// 获取限时提速活动当前状态
// 返回 { active, phase, multiplier, phaseEnd, eventEnd }
//   active=false 时 multiplier=1；phase: 0=未开始/已结束, 1=第一阶段(×1.25), 2=第二阶段(×1.50)
//   phaseEnd: 当前阶段倍率的持续终点时间戳（阶段1→阶段2切换点；阶段2→活动结束点）
function getLevelBoostEventState(now) {
    var nowMs = (now === undefined) ? Date.now() : now;
    var start = parseEventTimeUtc8(LIMITED_LEVEL_BOOST.startTime);
    var phase2 = parseEventTimeUtc8(LIMITED_LEVEL_BOOST.phase2Time);
    var end = parseEventTimeUtc8(LIMITED_LEVEL_BOOST.endTime);

    if (nowMs < start) {
        return { active: false, phase: 0, multiplier: 1, phaseEnd: null, eventEnd: end, started: false };
    }
    if (nowMs > end) {
        return { active: false, phase: 0, multiplier: 1, phaseEnd: null, eventEnd: end, ended: true };
    }
    if (nowMs < phase2) {
        return { active: true, phase: 1, multiplier: LIMITED_LEVEL_BOOST.phase1Multiplier, phaseEnd: phase2, eventEnd: end };
    }
    return { active: true, phase: 2, multiplier: LIMITED_LEVEL_BOOST.phase2Multiplier, phaseEnd: end, eventEnd: end };
}

// 限时活动提供的固定经验倍率（活动外为 1）
function getEventExpMultiplier() {
    return getLevelBoostEventState().multiplier;
}

// 当前经验获取总倍率 = 活动固定倍率 × 仓库经验值加成卡倍率
// 加成卡仍严格遵循其自身叠加规则（不同类型可叠加、同类型不可叠加、最多同时4张）
function getTotalExpMultiplier() {
    var eventMult = getEventExpMultiplier();
    var cardMult = (typeof getWarehouseExpMultiplier === 'function') ? getWarehouseExpMultiplier() : 1;
    return Math.round(eventMult * cardMult * 10000) / 10000;
}

// 将时间戳格式化为 'MM-DD HH:mm'
function formatEventBoostTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var dd = ('0' + d.getDate()).slice(-2);
    var hh = ('0' + d.getHours()).slice(-2);
    var mi = ('0' + d.getMinutes()).slice(-2);
    return mm + '-' + dd + ' ' + hh + ':' + mi;
}

// ==================== 活动排序工具 ====================

// 根据 sortOrder 配置对活动列表排序
function sortEventsByConfig(events) {
    var sortOrder = eventCenterData.sortOrder || [];
    if (!sortOrder.length) return events;

    return events.slice().sort(function(a, b) {
        var idxA = sortOrder.indexOf(a.id);
        var idxB = sortOrder.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });
}

// 根据 sortOrder 配置对公告列表排序
function sortAnnouncementsByConfig(announcements) {
    var sortOrder = eventAnnouncementData.sortOrder || [];
    if (!sortOrder.length) return announcements;

    return announcements.slice().sort(function(a, b) {
        var idxA = sortOrder.indexOf(a.id);
        var idxB = sortOrder.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });
}

// ==================== 类别排序工具 ====================

// 类别排序：有内容的类别优先显示在上层（已结束类别除外，始终保持在最后）
function orderCategoriesByActivity(categories, countFn) {
    var endedCat = null;
    var rest = categories.filter(function(cat) {
        if (cat.id === 'ended') { endedCat = cat; return false; }
        return true;
    });
    var withItems = rest.filter(function(cat) { return countFn(cat.id) > 0; });
    var withoutItems = rest.filter(function(cat) { return countFn(cat.id) === 0; });
    var ordered = withItems.concat(withoutItems);
    if (endedCat) ordered.push(endedCat);
    return ordered;
}

// ==================== 活动公告已读状态管理 ====================

function getViewedEventAnnouncementIds() {
    var stored = localStorage.getItem(EVENT_STORAGE_KEYS.VIEWED_EVENT_ANNOUNCEMENT_IDS);
    return stored ? JSON.parse(stored) : [];
}

function markEventAnnouncementAsViewed(id) {
    var viewedIds = getViewedEventAnnouncementIds();
    if (viewedIds.indexOf(id) === -1) {
        viewedIds.push(id);
        localStorage.setItem(EVENT_STORAGE_KEYS.VIEWED_EVENT_ANNOUNCEMENT_IDS, JSON.stringify(viewedIds));
        // 即时通知顶部导航气泡刷新（避免轮询延迟）
        notifyUnreadStateChanged();
    }
}

function markAllEventAnnouncementsAsRead() {
    var allIds = eventAnnouncementData.announcements.map(function(a) { return a.id; });
    localStorage.setItem(EVENT_STORAGE_KEYS.VIEWED_EVENT_ANNOUNCEMENT_IDS, JSON.stringify(allIds));
    renderEventAnnouncementList();

    var eventList = document.getElementById('eventAnnouncementList');
    if (eventList) {
        eventList.querySelectorAll('.event-announcement-item').forEach(function(item) {
            item.classList.add('viewed');
            var dot = item.querySelector('.event-announcement-dot');
            if (dot) dot.classList.add('viewed');
            var tag = item.querySelector('.event-new-tag');
            if (tag) tag.remove();
        });
    }
    if (typeof showAlert === 'function') {
        showAlert('所有活动公告已标记为已读');
    }
    // 即时通知顶部导航气泡刷新
    notifyUnreadStateChanged();
}

// ==================== 未读状态变更通知（顶部导航气泡即时刷新） ====================
// 所有已读/未读状态变化（邮件、开发者公告、活动公告、活动中心）统一派发该事件，
// 气泡控制器监听后立即重绘，无需等待轮询；轮询仅作为兜底。
function notifyUnreadStateChanged() {
    try {
        document.dispatchEvent(new Event('prel:unread-changed'));
    } catch (e) {
        var evt = document.createEvent('Event');
        evt.initEvent('prel:unread-changed', true, false);
        document.dispatchEvent(evt);
    }
}

// ==================== 活动中心已读状态管理（顶部导航「有新活动未读」气泡用） ====================
var VIEWED_EVENT_CENTER_KEY = 'viewed_event_center_ids';

function getViewedEventCenterIds() {
    try {
        var stored = localStorage.getItem(VIEWED_EVENT_CENTER_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function markEventCenterIdsViewed(ids) {
    var viewed = getViewedEventCenterIds();
    var changed = false;
    (ids || []).forEach(function(id) {
        if (viewed.indexOf(id) === -1) {
            viewed.push(id);
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem(VIEWED_EVENT_CENTER_KEY, JSON.stringify(viewed));
    }
    return changed;
}

// 是否存在未查看的活动（未结束/进行中/未开始且未查看；Dev 全部解禁时赛季活动视为进行中）
function hasUnviewedCenterEvents() {
    if (typeof eventCenterData === 'undefined' || !eventCenterData.events) return false;
    var viewed = getViewedEventCenterIds();
    var devUnlockActive = (window.pass && typeof window.pass.isDevUnlockAll === 'function' && window.pass.isDevUnlockAll());
    return eventCenterData.events.some(function(evt) {
        if (viewed.indexOf(evt.id) !== -1) return false;
        var state = (evt.startTime || evt.endTime) ? getEventTimeState(evt.startTime, evt.endTime) : 'active';
        if (devUnlockActive && evt.id === SEASON_PASS_EVENT.eventId) state = 'active';
        return state !== 'ended';
    });
}

// ==================== 活动公告模态框 ====================

function generateEventAnnouncementModal() {
    var modal = document.createElement('div');
    modal.id = 'eventAnnouncementModal';
    modal.className = 'custom-alert';
    modal.style.display = 'none';

    modal.innerHTML = `
        <div class="about-fullscreen event-modal-fullscreen">
            <div class="mail-desktop-header">
                <div class="mail-desktop-title">
                    <h2>活动公告</h2>
                </div>
                <button class="mail-desktop-close" id="eventAnnouncementCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mail-desktop-content event-modal-content">
                <div class="mail-sidebar event-sidebar">
                    <div class="mail-sidebar-header event-sidebar-header">
                        <div class="event-sidebar-title">活动分类</div>
                    </div>
                    <div class="event-sidebar-list" id="eventAnnouncementList">
                        <div class="event-empty">
                            <i class="fas fa-calendar-alt"></i>
                            <p>暂无活动公告</p>
                        </div>
                    </div>
                    <div class="mail-sidebar-footer event-sidebar-footer">
                        <button class="mail-claim-all-btn" id="eventAnnouncementMarkAllBtn">
                            <i class="fas fa-check-double"></i>
                            <span>一键已读</span>
                        </button>
                    </div>
                </div>
                <div class="mail-main event-main">
                    <div class="event-banner-area" id="eventBannerArea" style="display: none;">
                        <div class="event-banner-placeholder">
                            <i class="fas fa-image"></i>
                            <span>头图区域（预留）</span>
                        </div>
                    </div>
                    <div class="event-detail-empty" id="eventAnnouncementEmpty">
                        <i class="fas fa-bullhorn"></i>
                        <p>请选择左侧公告查看详情</p>
                    </div>
                    <div class="event-detail" id="eventAnnouncementDetail" style="display: none;"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('eventAnnouncementCloseBtn').addEventListener('click', function() {
        closeEventAnnouncementModal();
    });

    var markAllBtn = document.getElementById('eventAnnouncementMarkAllBtn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', function() {
            if (typeof showConfirm === 'function') {
                showConfirm('确认', '确定要已读全部活动公告？', function() {
                    markAllEventAnnouncementsAsRead();
                });
            } else {
                markAllEventAnnouncementsAsRead();
            }
        });
    }

    renderEventAnnouncementList();
}

function renderEventAnnouncementList() {
    var listContainer = document.getElementById('eventAnnouncementList');
    if (!listContainer) return;

    var viewedIds = getViewedEventAnnouncementIds();

    if (!eventAnnouncementData.announcements || eventAnnouncementData.announcements.length === 0) {
        listContainer.innerHTML = `
            <div class="event-empty">
                <i class="fas fa-calendar-alt"></i>
                <p>暂无活动公告</p>
            </div>
        `;
        return;
    }

    var html = '';
    var categories = orderCategoriesByActivity(eventAnnouncementData.categories, function(catId) {
        return eventAnnouncementData.announcements.filter(function(a) { return a.category === catId; }).length;
    });

    categories.forEach(function(cat) {
        var catAnnouncements = sortAnnouncementsByConfig(eventAnnouncementData.announcements.filter(function(a) {
            return a.category === cat.id;
        }));

        html += `<div class="event-category-header"><i class="fas ${cat.icon}"></i><span>${cat.name}</span></div>`;

        if (catAnnouncements.length === 0) {
            html += '<div class="event-category-empty">该类别暂无活动</div>';
            return;
        }

        catAnnouncements.forEach(function(ann) {
            var isViewed = viewedIds.indexOf(ann.id) !== -1;
            html += `
                <div class="event-announcement-item ${isViewed ? 'viewed' : ''}" data-id="${ann.id}">
                    <div class="event-announcement-dot ${isViewed ? 'viewed' : ''}"></div>
                    <div class="event-announcement-info">
                        <div class="event-announcement-title">${ann.title}</div>
                        <div class="event-announcement-date">${ann.date}</div>
                    </div>
                    ${isViewed ? '' : '<div class="event-new-tag">最新</div>'}
                </div>
            `;
        });
    });

    listContainer.innerHTML = html;

    listContainer.querySelectorAll('.event-announcement-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var currentActive = listContainer.querySelector('.event-announcement-item.active');
            if (currentActive && currentActive !== this) {
                currentActive.classList.add('animating-out');
                setTimeout(function() {
                    currentActive.classList.remove('active');
                    currentActive.classList.remove('animating-out');
                }, 320);
            }
            this.classList.add('active');
            showEventAnnouncementDetail(id);

            markEventAnnouncementAsViewed(id);
            this.classList.add('viewed');
            var dot = this.querySelector('.event-announcement-dot');
            if (dot) dot.classList.add('viewed');
            var tag = this.querySelector('.event-new-tag');
            if (tag) tag.remove();
        });
    });
}

function showEventAnnouncementDetail(id) {
    var ann = eventAnnouncementData.announcements.find(function(a) { return a.id === id; });
    if (!ann) return;

    var emptyEl = document.getElementById('eventAnnouncementEmpty');
    var detailEl = document.getElementById('eventAnnouncementDetail');
    var bannerArea = document.getElementById('eventBannerArea');

    if (emptyEl) emptyEl.style.display = 'none';
    if (detailEl) {
        detailEl.style.display = 'block';
        detailEl.innerHTML = ann.content;
    }

    if (bannerArea) {
        bannerArea.style.display = '';
        bannerArea.classList.remove('banner-content-enter');
        if (ann.banner) {
            bannerArea.innerHTML = `<img src="${ann.banner}" alt="${ann.title}" class="event-banner-image">`;
        } else {
            bannerArea.innerHTML = `
                <div class="event-banner-default">
                    <div class="event-banner-title">${ann.title}</div>
                    <div class="event-banner-date">${ann.date} ~ ${ann.endDate}</div>
                </div>
            `;
        }
        triggerBannerSweep(bannerArea);
    }

    if (detailEl) {
        detailEl.classList.add('event-detail-jump-wrapper');
        var centerEvent = eventCenterData.events.find(function(e) { return e.announcementId === id; });
        if (centerEvent) {
            var existingJumpBtn = detailEl.querySelector('.event-announcement-jump-btn');
            if (existingJumpBtn) existingJumpBtn.remove();
            var jumpBtn = document.createElement('button');
            jumpBtn.className = 'event-announcement-jump-btn';
            jumpBtn.innerHTML = '<i class="fas fa-arrow-right"></i><span>跳转至相应活动</span>';
            jumpBtn.addEventListener('click', function() {
                closeEventAnnouncementModal();
                setTimeout(function() {
                    showEventCenterModal();
                    setTimeout(function() {
                        showEventCenterDetail(centerEvent.id);
                        var listContainer = document.getElementById('eventCenterList');
                        var item = listContainer ? listContainer.querySelector('.event-announcement-item[data-id="' + centerEvent.id + '"]') : null;
                        if (item) {
                            var currentActive = listContainer.querySelector('.event-announcement-item.active');
                            if (currentActive && currentActive !== item) {
                                currentActive.classList.add('animating-out');
                                setTimeout(function() {
                                    currentActive.classList.remove('active');
                                    currentActive.classList.remove('animating-out');
                                }, 320);
                            }
                            item.classList.add('active');
                        }
                    }, 150);
                }, 350);
            });
            detailEl.appendChild(jumpBtn);
        }
    }
}

function triggerBannerSweep(bannerArea) {
    var sweep = document.createElement('div');
    sweep.className = 'event-banner-sweep animating';
    bannerArea.appendChild(sweep);
    bannerArea.classList.add('banner-content-enter');
    setTimeout(function() {
        sweep.remove();
    }, 600);
}

function showEventAnnouncementModal() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.username) {
        if (typeof showToast === 'function') {
            showToast({ type: 'warning', title: '需要登录', message: '请先登录后再查看活动公告' });
        }
        return;
    }

    var modal = document.getElementById('eventAnnouncementModal');
    if (!modal) {
        generateEventAnnouncementModal();
        modal = document.getElementById('eventAnnouncementModal');
    }

    // 应用时间状态与已结束迁移并刷新侧边栏列表
    var stateChanged = applyTimedEventStates();
    if (applyMigratedEvents() || stateChanged) {
        renderEventAnnouncementList();
    }

    modal.style.display = 'flex';
    setTimeout(function() {
        modal.classList.add('show');
    }, 10);
}

function closeEventAnnouncementModal() {
    var modal = document.getElementById('eventAnnouncementModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
}

// ==================== 活动中心模态框 ====================

function generateEventCenterModal() {
    var modal = document.createElement('div');
    modal.id = 'eventCenterModal';
    modal.className = 'custom-alert';
    modal.style.display = 'none';

    modal.innerHTML = `
        <div class="about-fullscreen event-modal-fullscreen">
            <div class="mail-desktop-header">
                <div class="mail-desktop-title">
                    <h2>活动中心</h2>
                </div>
                <button class="mail-desktop-close" id="eventCenterCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mail-desktop-content event-modal-content">
                <div class="mail-sidebar event-sidebar">
                    <div class="mail-sidebar-header event-sidebar-header">
                        <div class="event-sidebar-title">活动分类</div>
                    </div>
                    <div class="event-sidebar-list" id="eventCenterList">
                        <div class="event-empty">
                            <i class="fas fa-fire"></i>
                            <p>暂无活动</p>
                        </div>
                    </div>
                </div>
                <div class="mail-main event-main">
                    <div class="event-banner-area" id="eventCenterBannerArea" style="display: none;">
                        <div class="event-banner-placeholder">
                            <i class="fas fa-image"></i>
                            <span>头图区域（预留）</span>
                        </div>
                    </div>
                    <div class="event-detail-empty" id="eventCenterEmpty">
                        <i class="fas fa-fire"></i>
                        <p>请选择左侧活动查看详情</p>
                    </div>
                    <div class="event-detail" id="eventCenterDetail" style="display: none;"></div>
                    <div id="eventCenterCheckin" class="event-checkin-container" style="display: none;"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('eventCenterCloseBtn').addEventListener('click', function() {
        closeEventCenterModal();
    });

    renderEventCenterList();
}

function renderEventCenterList() {
    var listContainer = document.getElementById('eventCenterList');
    if (!listContainer) return;

    if (!eventCenterData.events || eventCenterData.events.length === 0) {
        listContainer.innerHTML = `
            <div class="event-empty">
                <i class="fas fa-fire"></i>
                <p>暂无活动</p>
            </div>
        `;
        return;
    }

    var html = '';
    var categories = orderCategoriesByActivity(eventCenterData.categories, function(catId) {
        return eventCenterData.events.filter(function(e) { return e.category === catId; }).length;
    });

    categories.forEach(function(cat) {
        var catEvents = sortEventsByConfig(eventCenterData.events.filter(function(e) {
            return e.category === cat.id;
        }));

        html += `<div class="event-category-header"><i class="fas ${cat.icon}"></i><span>${cat.name}</span></div>`;

        if (catEvents.length === 0) {
            html += '<div class="event-category-empty">该类别暂无活动</div>';
            return;
        }

        catEvents.forEach(function(evt) {
            html += `
                <div class="event-announcement-item" data-id="${evt.id}">
                    <div class="event-announcement-icon"><i class="fas ${evt.icon}"></i></div>
                    <div class="event-announcement-info">
                        <div class="event-announcement-title">${evt.title}</div>
                        <div class="event-announcement-subtitle">${evt.subtitle}</div>
                    </div>
                    <div class="event-status-tag ${evt.status}">
                        ${getEventStatusText(evt.status)}
                    </div>
                </div>
            `;
        });
    });

    listContainer.innerHTML = html;

    listContainer.querySelectorAll('.event-announcement-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var currentActive = listContainer.querySelector('.event-announcement-item.active');
            if (currentActive && currentActive !== this) {
                currentActive.classList.add('animating-out');
                setTimeout(function() {
                    currentActive.classList.remove('active');
                    currentActive.classList.remove('animating-out');
                }, 320);
            }
            this.classList.add('active');
            showEventCenterDetail(id);
        });
    });
}

function showEventCenterDetail(id) {
    var evt = eventCenterData.events.find(function(e) { return e.id === id; });
    if (!evt) return;

    var emptyEl = document.getElementById('eventCenterEmpty');
    var detailEl = document.getElementById('eventCenterDetail');
    var checkinEl = document.getElementById('eventCenterCheckin');
    var bannerArea = document.getElementById('eventCenterBannerArea');

    if (emptyEl) emptyEl.style.display = 'none';
    if (detailEl) {
        var hasCheckin = evt.hasCheckin === true;
        var showParticipateBtn = evt.showParticipate !== false;
        var hasAnnouncement = !!evt.announcementId;

        var actionButtonsHtml = '';
        if (showParticipateBtn) {
            // 活动未开始/已结束时按钮失效（灰色不可点击）
            var partDisabled = evt.status !== 'active';
            actionButtonsHtml += `<button class="event-action-btn event-primary-btn" data-action="participate" data-event-id="${evt.id}"${partDisabled ? ' disabled' : ''}>
                <i class="fas fa-play"></i>
                <span>立即参与</span>
            </button>`;
        }
        if (hasAnnouncement) {
            actionButtonsHtml += `<button class="event-action-btn event-secondary-btn" data-action="rules" data-event-id="${evt.id}" data-announcement-id="${evt.announcementId}">
                <i class="fas fa-info-circle"></i>
                <span>活动规则</span>
            </button>`;
        }

        detailEl.style.display = 'block';
        detailEl.innerHTML = `
            <div class="event-center-detail">
                <div class="event-center-icon"><i class="fas ${evt.icon}"></i></div>
                <h2 class="event-center-title">${evt.title}</h2>
                <div class="event-center-subtitle">${evt.subtitle}</div>
                <div class="event-center-status ${evt.status}">
                    ${getEventStatusText(evt.status)}
                </div>
                <div class="event-center-desc">${evt.description}</div>
            </div>
        `;

        // 操作按钮统一渲染在顶部公告图区最右侧，并在 banner 重建后绑定（见函数末尾）

        if (hasCheckin && checkinEl) {
            checkinEl.style.display = 'block';
            checkinEl.innerHTML = generateCheckinSection(id);
            bindCheckinInteractions(id);
        } else if (checkinEl) {
            checkinEl.style.display = 'none';
            checkinEl.innerHTML = '';
        }
    }

    if (bannerArea) {
        bannerArea.style.display = '';
        bannerArea.classList.remove('banner-content-enter');
        // 「立即参与」「活动规则」按钮固定在公告图区最右侧，一行排列；无立即参与配置的活动仅显示活动规则
        var bannerActionsHtml = (typeof actionButtonsHtml !== 'undefined' && actionButtonsHtml)
            ? '<div class="event-banner-actions">' + actionButtonsHtml + '</div>'
            : '';
        bannerArea.innerHTML = `
            <div class="event-banner-default event-banner-center">
                <div class="event-banner-icon"><i class="fas ${evt.icon}"></i></div>
                <div class="event-banner-title">${evt.title}</div>
                ${bannerActionsHtml}
            </div>
        `;

        // 按钮已随 banner 重建，需在新 DOM 上重新绑定（内容区不再包含操作按钮）
        var centerModalForBtns = document.getElementById('eventCenterModal');
        (centerModalForBtns || document).querySelectorAll('.event-action-btn').forEach(function(btn) {
            if (btn.getAttribute('data-bound') === '1') return;
            btn.setAttribute('data-bound', '1');
            btn.addEventListener('click', function() {
                var action = this.getAttribute('data-action');
                var eventId = this.getAttribute('data-event-id');
                var announcementId = this.getAttribute('data-announcement-id');

                if (action === 'rules' && announcementId) {
                    closeEventCenterModal();
                    setTimeout(function() {
                        showEventAnnouncementModal();
                        setTimeout(function() {
                            showEventAnnouncementDetail(announcementId);
                            markEventAnnouncementAsViewed(announcementId);
                            var item = document.querySelector('.event-announcement-item[data-id="' + announcementId + '"]');
                            if (item) {
                                item.classList.add('viewed');
                                var dot = item.querySelector('.event-announcement-dot');
                                if (dot) dot.classList.add('viewed');
                                var tag = item.querySelector('.event-new-tag');
                                if (tag) tag.remove();
                            }
                        }, 150);
                    }, 350);
                } else if (action === 'participate') {
                    var targetEvt = eventCenterData.events.find(function(e) { return e.id === eventId; });
                    // 未开始/已结束的活动不允许参与（按钮已禁用，此处为兜底）
                    if (targetEvt && targetEvt.status !== 'active') {
                        if (typeof showToast === 'function') {
                            showToast({
                                type: 'info',
                                title: getEventStatusText(targetEvt.status),
                                message: targetEvt.status === 'upcoming' ? '活动尚未开始，请等待活动开始后再参与' : '活动已结束，感谢您的关注'
                            });
                        }
                        return;
                    }
                    if (targetEvt && targetEvt.participateAction === 'shop') {
                        // 直接打开商店弹窗
                        closeEventCenterModal();
                        setTimeout(function() {
                            if (typeof showShopModal === 'function') showShopModal();
                        }, 350);
                    } else if (targetEvt && targetEvt.participateAction === 'pass') {
                        // 直接打开赛季通行证弹窗
                        closeEventCenterModal();
                        setTimeout(function() {
                            if (window.pass && typeof window.pass.openUI === 'function') window.pass.openUI();
                        }, 350);
                    } else if (targetEvt && targetEvt.id === 'center_001') {
                        closeEventCenterModal();
                        setTimeout(function() {
                            var checkinArea = document.getElementById('checkinArea');
                            if (checkinArea) {
                                checkinArea.style.display = 'flex';
                                checkinArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 300);
                    } else if (targetEvt && targetEvt.hasCheckin) {
                        var checkinSection = document.getElementById('eventCenterCheckin');
                        if (checkinSection) {
                            checkinSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    } else {
                        if (typeof showToast === 'function') {
                            showToast({ type: 'info', title: '提示', message: '请查看活动说明了解参与方式' });
                        }
                    }
                }
            });
        });
        triggerBannerSweep(bannerArea);
    }
}

// ==================== 签到系统 ====================

var CHECKIN_REWARDS = {
    center_002: [
        { day: 1, type: 'cardStyle', value: 'card-style-special-autumn', label: '名片样式「星河漫游」', icon: 'fa-palette', isGold: true },
        { day: 2, type: 'exp', value: 500, label: '500 经验值', icon: 'fa-star', isGold: false },
        { day: 3, type: 'exp', value: 500, label: '500 经验值', icon: 'fa-star', isGold: false },
        { day: 4, type: 'exp', value: 500, label: '500 经验值', icon: 'fa-star', isGold: false },
        { day: 5, type: 'exp', value: 500, label: '500 经验值', icon: 'fa-star', isGold: false },
        { day: 6, type: 'exp', value: 500, label: '500 经验值', icon: 'fa-star', isGold: false },
        { day: 7, type: 'exp', value: 500, label: '500 经验值', icon: 'fa-star', isGold: false },
        { day: 8, type: 'background3d', value: 'bg-3d-space', label: '3D太空遨游背景', icon: 'fa-rocket', isGold: true },
        { day: 9, type: 'exp', value: 1000, label: '1000 经验值', icon: 'fa-star', isGold: false },
        { day: 10, type: 'exp', value: 1000, label: '1000 经验值', icon: 'fa-star', isGold: false },
        { day: 11, type: 'exp', value: 1000, label: '1000 经验值', icon: 'fa-star', isGold: false },
        { day: 12, type: 'exp', value: 1000, label: '1000 经验值', icon: 'fa-star', isGold: false },
        { day: 13, type: 'exp', value: 1000, label: '1000 经验值', icon: 'fa-star', isGold: false },
        { day: 14, type: 'exp', value: 2000, label: '2000 经验值', icon: 'fa-crown', isGold: true }
    ],
    center_005: [
        { day: 1,  type: 'warehouse', itemId: 'exp_boost_small',  count: 1, label: '经验值加成卡 Ⅰ',  icon: 'fa-gauge',      color: '#3498db', isGold: false },
        { day: 2,  type: 'warehouse', itemId: 'exp_supply_1',     count: 1, label: '经验值补给卡 Ⅰ',  icon: 'fa-star',       color: '#3498db', isGold: false },
        { day: 3,  type: 'warehouse', itemId: 'exp_boost_small',  count: 1, label: '经验值加成卡 Ⅰ',  icon: 'fa-gauge',      color: '#3498db', isGold: false },
        { day: 4,  type: 'warehouse', itemId: 'exp_supply_1',     count: 1, label: '经验值补给卡 Ⅰ',  icon: 'fa-star',       color: '#3498db', isGold: false },
        { day: 5,  type: 'warehouse', itemId: 'exp_boost_small',  count: 1, label: '经验值加成卡 Ⅰ',  icon: 'fa-gauge',      color: '#3498db', isGold: false },
        { day: 6,  type: 'warehouse', itemId: 'exp_supply_1',     count: 1, label: '经验值补给卡 Ⅰ',  icon: 'fa-star',       color: '#3498db', isGold: false },
        { day: 7,  type: 'warehouse', itemId: 'exp_boost_small',  count: 1, label: '经验值加成卡 Ⅰ',  icon: 'fa-gauge',      color: '#3498db', isGold: false },
        { day: 8,  type: 'warehouse', itemId: 'exp_supply_1',     count: 1, label: '经验值补给卡 Ⅰ',  icon: 'fa-star',       color: '#3498db', isGold: false },
        { day: 9,  type: 'warehouse', itemId: 'precoin_supply_1', count: 3, label: 'PRE Coin 补给包 Ⅰ', icon: 'fa-coins',    color: '#3498db', isGold: true },
        { day: 10, type: 'warehouse', itemId: 'exp_boost_mid',    count: 1, label: '经验值加成卡 Ⅱ',  icon: 'fa-chart-line', color: '#9b59b6', isGold: false },
        { day: 11, type: 'warehouse', itemId: 'exp_supply_2',     count: 1, label: '经验值补给卡 Ⅱ',  icon: 'fa-atom',       color: '#9b59b6', isGold: false },
        { day: 12, type: 'warehouse', itemId: 'exp_boost_mid',    count: 1, label: '经验值加成卡 Ⅱ',  icon: 'fa-chart-line', color: '#9b59b6', isGold: false },
        { day: 13, type: 'warehouse', itemId: 'exp_supply_2',     count: 1, label: '经验值补给卡 Ⅱ',  icon: 'fa-atom',       color: '#9b59b6', isGold: false },
        { day: 14, type: 'warehouse', itemId: 'exp_boost_mid',    count: 1, label: '经验值加成卡 Ⅱ',  icon: 'fa-chart-line', color: '#9b59b6', isGold: false },
        { day: 15, type: 'warehouse', itemId: 'exp_supply_2',     count: 1, label: '经验值补给卡 Ⅱ',  icon: 'fa-atom',       color: '#9b59b6', isGold: false },
        { day: 16, type: 'warehouse', itemId: 'precoin_supply_2', count: 3, label: 'PRE Coin 补给包 Ⅱ', icon: 'fa-piggy-bank', color: '#9b59b6', isGold: true },
        { day: 17, type: 'warehouse', itemId: 'exp_boost_large',  count: 1, label: '经验值加成卡 Ⅲ',  icon: 'fa-rocket',     color: '#f39c12', isGold: false },
        { day: 18, type: 'warehouse', itemId: 'exp_supply_3',     count: 1, label: '经验值补给卡 Ⅲ',  icon: 'fa-asterisk',   color: '#f39c12', isGold: false },
        { day: 19, type: 'warehouse', itemId: 'exp_boost_large',  count: 1, label: '经验值加成卡 Ⅲ',  icon: 'fa-rocket',     color: '#f39c12', isGold: false },
        { day: 20, type: 'warehouse', itemId: 'exp_supply_3',     count: 1, label: '经验值补给卡 Ⅲ',  icon: 'fa-asterisk',   color: '#f39c12', isGold: false },
        { day: 21, type: 'warehouse', itemId: 'exp_boost_large',  count: 1, label: '经验值加成卡 Ⅲ',  icon: 'fa-rocket',     color: '#f39c12', isGold: false },
        { day: 22, type: 'warehouse', itemId: 'exp_supply_3',     count: 1, label: '经验值补给卡 Ⅲ',  icon: 'fa-asterisk',   color: '#f39c12', isGold: false },
        { day: 23, type: 'warehouse', itemId: 'precoin_supply_3', count: 2, label: 'PRE Coin 补给包 Ⅲ', icon: 'fa-wallet',   color: '#f39c12', isGold: true },
        { day: 24, type: 'warehouse', itemId: 'exp_boost_premium',count: 1, label: '经验值加成卡 Ⅳ',  icon: 'fa-fire',       color: '#c0392b', isGold: false },
        { day: 25, type: 'warehouse', itemId: 'exp_supply_4',     count: 1, label: '经验值补给卡 Ⅳ',  icon: 'fa-sun',        color: '#e74c3c', isGold: false },
        { day: 26, type: 'warehouse', itemId: 'exp_boost_premium',count: 1, label: '经验值加成卡 Ⅳ',  icon: 'fa-fire',       color: '#c0392b', isGold: false },
        { day: 27, type: 'warehouse', itemId: 'exp_supply_4',     count: 1, label: '经验值补给卡 Ⅳ',  icon: 'fa-sun',        color: '#e74c3c', isGold: false },
        { day: 28, type: 'warehouse', itemId: 'exp_boost_premium',count: 1, label: '经验值加成卡 Ⅳ',  icon: 'fa-fire',       color: '#c0392b', isGold: false },
        { day: 29, type: 'warehouse', itemId: 'exp_supply_4',     count: 1, label: '经验值补给卡 Ⅳ',  icon: 'fa-sun',        color: '#e74c3c', isGold: false },
        { day: 30, type: 'warehouse', itemId: 'precoin_supply_4', count: 1, label: 'PRE Coin 补给包 Ⅳ', icon: 'fa-box-open', color: '#e74c3c', isGold: true }
    ]
};

function getCheckinRewards(eventId) {
    if (CHECKIN_REWARDS[eventId]) return CHECKIN_REWARDS[eventId];
    for (var key in CHECKIN_REWARDS) {
        if (CHECKIN_REWARDS.hasOwnProperty(key)) {
            var evt = eventCenterData.events.find(function(e) { return e.id === eventId; });
            if (evt && evt.hasCheckin && CHECKIN_REWARDS[key].length === (evt.checkinDays || 14)) {
                return CHECKIN_REWARDS[key];
            }
        }
    }
    return null;
}

function getCheckinStorageKey(eventId) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    var username = currentUser.username || 'anonymous';
    return 'checkin_' + username + '_' + eventId;
}

function getCheckinData(eventId) {
    var key = getCheckinStorageKey(eventId);
    var stored = localStorage.getItem(key);
    if (stored) {
        try {
            var data = JSON.parse(stored);
            var needsMigration = false;

            if (typeof data.unlockedDays === 'undefined') {
                data.unlockedDays = 0;
                needsMigration = true;
            }
            if (!data.claimedDays) data.claimedDays = [];
            if (!data.firstCheckinDate) {
                data.firstCheckinDate = null;
                needsMigration = true;
            }
            if (!data.lastCheckinDate) {
                data.lastCheckinDate = null;
                needsMigration = true;
            }

            if (needsMigration) {
                var todayStr = getTodayDateStr();
                if (data.claimedDays.length > 0) {
                    var maxClaimed = Math.max.apply(null, data.claimedDays);
                    data.unlockedDays = Math.min(maxClaimed + 1, 14);
                    data.firstCheckinDate = todayStr;
                    data.lastCheckinDate = todayStr;
                }
                if (data.unlockedDays === 0) {
                    data.unlockedDays = 1;
                    data.firstCheckinDate = todayStr;
                    data.lastCheckinDate = todayStr;
                }
                if (!data.firstCheckinDate) data.firstCheckinDate = todayStr;
                if (!data.lastCheckinDate) data.lastCheckinDate = todayStr;
                saveCheckinData(eventId, data);
            }

            return data;
        } catch(e) {}
    }
    return { claimedDays: [], firstCheckinDate: null, lastCheckinDate: null, unlockedDays: 0, makeupDays: [] };
}

function saveCheckinData(eventId, data) {
    var key = getCheckinStorageKey(eventId);
    localStorage.setItem(key, JSON.stringify(data));
}

function getTodayDateStr() {
    var now = new Date();
    var utc8 = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    return utc8.toISOString().substring(0, 10);
}

function updateCheckinProgress(eventId) {
    var data = getCheckinData(eventId);
    var todayStr = getTodayDateStr();
    var rewards = getCheckinRewards(eventId);
    var maxDays = rewards ? rewards.length : 14;

    if (data.unlockedDays === 0 || !data.firstCheckinDate) {
        data.firstCheckinDate = todayStr;
        data.lastCheckinDate = todayStr;
        data.unlockedDays = 1;
        saveCheckinData(eventId, data);
        return data;
    }

    if (data.lastCheckinDate !== todayStr && data.unlockedDays < maxDays) {
        var lastDate = new Date(data.lastCheckinDate + 'T00:00:00+08:00');
        var todayDate = new Date(todayStr + 'T00:00:00+08:00');
        var diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        var daysToUnlock = Math.min(diffDays, maxDays - data.unlockedDays);
        if (daysToUnlock > 0) {
            data.unlockedDays += daysToUnlock;
            data.lastCheckinDate = todayStr;
            saveCheckinData(eventId, data);
        }
    }

    return data;
}

function getCurrentCheckinDay(eventId) {
    var data = getCheckinData(eventId);
    return data.unlockedDays || 0;
}

// 获取活动当前可参与的总天数（基于活动起始时间已过的自然日数，封顶为签到总天数）
// 用于限制补签卡仅可补签该范围内的奖励；活动未开始返回 0，无起始时间时回退为已解锁天数
function getCheckinAvailableDays(eventId) {
    var evt = eventCenterData.events.find(function(e) { return e.id === eventId; });
    var rewards = getCheckinRewards(eventId);
    var maxDays = rewards ? rewards.length : 0;
    var startTs = evt ? parseEventTimeUtc8(evt.startTime) : null;
    if (startTs === null) {
        var data = getCheckinData(eventId);
        return Math.min(data.unlockedDays || 0, maxDays);
    }
    var now = Date.now();
    if (now < startTs) return 0;
    var elapsedDays = Math.floor((now - startTs) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(elapsedDays, maxDays);
}

function isCheckinDayUnlocked(eventId, rewardDay) {
    var data = getCheckinData(eventId);
    if (rewardDay <= (data.unlockedDays || 0)) return true;
    // 补签卡解锁的天数同样视为已解锁，但必须在活动已过天数范围内
    var availableDays = getCheckinAvailableDays(eventId);
    if (rewardDay > availableDays) return false;
    return !!(data.makeupDays && data.makeupDays.indexOf(rewardDay) !== -1);
}

function generateCheckinSection(eventId) {
    var rewards = getCheckinRewards(eventId);
    if (!rewards || rewards.length === 0) return '';

    // 活动已结束：签到区不显示任何奖励卡片，改为居中提示文本
    var centerEvt = eventCenterData.events.find(function(e) { return e.id === eventId; });
    if (centerEvt && getEventTimeState(centerEvt.startTime, centerEvt.endTime) === 'ended') {
        return `
            <div class="checkin-section" id="checkinSection_${eventId}">
                <div class="checkin-section-header">
                    <div class="checkin-section-title"><i class="fas fa-calendar-check"></i> 签到区</div>
                </div>
                <div class="checkin-ended-note">⛔ 活动已结束 ⛔</div>
            </div>
        `;
    }

    // 活动未开始：签到区不显示奖励卡片，改为居中提示文本
    if (centerEvt && getEventTimeState(centerEvt.startTime, centerEvt.endTime) === 'upcoming') {
        return `
            <div class="checkin-section" id="checkinSection_${eventId}">
                <div class="checkin-section-header">
                    <div class="checkin-section-title"><i class="fas fa-calendar-check"></i> 签到区</div>
                </div>
                <div class="checkin-ended-note checkin-upcoming-note">⛔ 活动未开始 ⛔</div>
            </div>
        `;
    }

    updateCheckinProgress(eventId);
    var checkinData = getCheckinData(eventId);
    var claimedDays = checkinData.claimedDays || [];
    var currentDay = getCurrentCheckinDay(eventId);
    var availableDays = getCheckinAvailableDays(eventId);
    var allClaimed = claimedDays.length >= rewards.length;

    var cardsHtml = rewards.map(function(reward) {
        var isClaimed = claimedDays.indexOf(reward.day) !== -1;
        var isGold = reward.isGold;
        var isLocked = !isCheckinDayUnlocked(eventId, reward.day);
        var cardClass = 'evt-reward-card';
        if (isGold) cardClass += ' evt-reward-card-gold';
        if (isClaimed) cardClass += ' claimed';
        if (isLocked) cardClass += ' locked';

        var bgGradient;
        if (isClaimed) {
            bgGradient = 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)';
        } else if (isLocked) {
            bgGradient = 'linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)';
        } else if (isGold) {
            bgGradient = 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 50%, #ffe082 100%)';
        } else {
            bgGradient = 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)';
        }

        var innerContent = '';
        if (isLocked) {
            innerContent = '<div class="evt-reward-card-lock"><i class="fas fa-lock"></i></div><div class="evt-reward-card-label">第' + reward.day + '天 待解锁</div>';
        } else if (reward.type === 'cardStyle') {
            innerContent = '<div class="evt-reward-card-icon" style="background: rgba(212, 93, 121, 0.15);"><i class="fas fa-id-card" style="color: #d45d79;"></i></div><div class="evt-reward-card-label">' + reward.label + '</div>';
        } else if (reward.type === 'background3d') {
            innerContent = '<div class="evt-reward-card-icon" style="background: rgba(124, 92, 191, 0.15);"><i class="fas fa-rocket" style="color: #7c5cbf;"></i></div><div class="evt-reward-card-label">' + reward.label + '</div>';
        } else if (reward.type === 'warehouse') {
            var wColor = reward.color || '#d45d79';
            var wCountBadge = reward.count > 1 ? '<span class="evt-reward-card-count">×' + reward.count + '</span>' : '';
            innerContent = '<div class="evt-reward-card-icon" style="background: ' + wColor + '22;"><i class="fas ' + reward.icon + '" style="color: ' + wColor + ';"></i>' + wCountBadge + '</div><div class="evt-reward-card-label">' + reward.label + '</div>';
        } else {
            innerContent = '<div class="evt-reward-card-icon"><i class="fas ' + reward.icon + '"></i></div><div class="evt-reward-card-label">' + reward.label + '</div>';
        }

        return `
            <div class="${cardClass}" data-day="${reward.day}" data-type="${reward.type}" data-value="${reward.value}" data-locked="${isLocked ? 'true' : 'false'}" data-claimed="${isClaimed ? 'true' : 'false'}" style="background: ${bgGradient};">
                <div class="evt-reward-card-day">第${reward.day}天</div>
                <div class="evt-reward-card-inner">
                    ${innerContent}
                </div>
                ${isGold && !isLocked && !isClaimed ? '<div class="evt-reward-card-glow"></div>' : ''}
                ${isClaimed ? '<div class="evt-reward-card-claimed-badge"><i class="fas fa-check-circle"></i></div>' : ''}
            </div>
        `;
    }).join('');

    var progressText = '已领取 ' + claimedDays.length + ' / ' + rewards.length + ' 天';

    // 可补签天数：在活动已过天数范围内、尚未领取、且未自然解锁的奖励天数
    var makeupableCount = 0;
    for (var md = currentDay + 1; md <= availableDays; md++) {
        if (claimedDays.indexOf(md) === -1) makeupableCount++;
    }
    var loginTagHtml = '<div class="checkin-login-tag"><i class="fas fa-user-clock"></i> 已登录 ' + currentDay + ' 天 · 可补签 ' + makeupableCount + ' 天</div>';

    var canClaimAny = rewards.some(function(r) { return r.day <= currentDay && claimedDays.indexOf(r.day) === -1; });
    var claimAllDisabled = claimedDays.length >= rewards.length || !canClaimAny;

    return `
        <div class="checkin-section" id="checkinSection_${eventId}">
            <div class="checkin-section-header">
                <div class="checkin-section-title"><i class="fas fa-calendar-check"></i> 签到区</div>
                <div class="checkin-progress">${progressText}</div>
                ${loginTagHtml}
                <div class="checkin-header-btn-group">
                    <button class="checkin-toggle-btn" id="checkinToggleBtn_${eventId}" data-collapsed="false">
                        <span>收起</span>
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button class="checkin-full-display-btn" id="checkinFullDisplayBtn_${eventId}" data-full="false">
                        <i class="fas fa-expand"></i>
                        <span>完整显示</span>
                    </button>
                </div>
                <button class="checkin-claim-all-btn" id="checkinClaimAllBtn" ${claimAllDisabled ? 'disabled' : ''}>
                    <i class="fas fa-gift"></i>
                    <span>一键领取</span>
                </button>
            </div>
            <div class="checkin-cards-wrapper">
                <div class="checkin-cards-scroll" id="checkinCardsScroll">
                    ${cardsHtml}
                </div>
                <button class="checkin-scroll-arrow left" id="checkinScrollLeft">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="checkin-scroll-arrow right" id="checkinScrollRight">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            ${allClaimed ? '<div class="checkin-all-done">🎉 恭喜！所有奖励已领取完成，活动将纳入已结束类别。</div>' : ''}
        </div>
    `;
}

function bindCheckinInteractions(eventId) {
    var rewards = getCheckinRewards(eventId);
    if (!rewards || rewards.length === 0) return;

    var scrollContainer = document.getElementById('checkinCardsScroll');
    if (!scrollContainer) return;

    var currentDay = getCurrentCheckinDay(eventId);

    scrollContainer.querySelectorAll('.evt-reward-card').forEach(function(card) {
        card.addEventListener('click', function() {
            var day = parseInt(card.getAttribute('data-day'));
            var isLocked = card.getAttribute('data-locked') === 'true';
            var isClaimed = card.getAttribute('data-claimed') === 'true';
            var reward = rewards.find(function(r) { return r.day === day; });

            if (!reward) return;

            if (isClaimed) {
                showToast({ type: 'info', title: '已领取', message: '该奖励已领取' });
                return;
            }

            if (isLocked || day > currentDay) {
                // 补签卡：仅可补签活动已过天数范围内的奖励；超出范围直接提示无法补签
                var availableDays = getCheckinAvailableDays(eventId);
                if (day > availableDays) {
                    showToast({ type: 'info', title: '无法补签', message: '第 ' + day + ' 天奖励尚未到可补签时间，需活动进行至该天后再补签' });
                    return;
                }
                // 持有补签卡时可解锁未解锁的奖励卡
                if (typeof warehousePromptMakeupCard === 'function') {
                    warehousePromptMakeupCard(eventId, day, function(used) {
                        if (used) {
                            claimCheckinReward(eventId, day, reward);
                            updateCheckinUI(eventId);
                        }
                    });
                } else if (isLocked) {
                    showToast({ type: 'info', title: '暂未解锁', message: '该奖励卡暂未解锁，请明天登录后继续签到以推进进度' });
                } else {
                    showToast({ type: 'info', title: '暂未解锁', message: '该奖励尚未解锁，请等待对应签到日到来' });
                }
                return;
            }

            var data = getCheckinData(eventId);
            if (data.claimedDays.indexOf(day) !== -1) {
                showToast({ type: 'info', title: '已领取', message: '该奖励已领取' });
                return;
            }

            claimCheckinReward(eventId, day, reward);
            updateCheckinUI(eventId);
        });
    });

    var scrollLeft = document.getElementById('checkinScrollLeft');
    var scrollRight = document.getElementById('checkinScrollRight');

    if (scrollLeft) {
        scrollLeft.addEventListener('click', function() {
            scrollContainer.scrollBy({ left: -220, behavior: 'smooth' });
        });
    }
    if (scrollRight) {
        scrollRight.addEventListener('click', function() {
            scrollContainer.scrollBy({ left: 220, behavior: 'smooth' });
        });
    }

    var toggleBtn = document.getElementById('checkinToggleBtn_' + eventId);
    var section = document.getElementById('checkinSection_' + eventId);
    if (toggleBtn && section) {
        toggleBtn.addEventListener('click', function() {
            var isCollapsed = toggleBtn.getAttribute('data-collapsed') === 'true';
            if (isCollapsed) {
                section.classList.remove('collapsed');
                toggleBtn.setAttribute('data-collapsed', 'false');
                toggleBtn.querySelector('span').textContent = '收起';
                toggleBtn.querySelector('i').className = 'fas fa-chevron-up';
            } else {
                section.classList.add('collapsed');
                toggleBtn.setAttribute('data-collapsed', 'true');
                toggleBtn.querySelector('span').textContent = '展开';
                toggleBtn.querySelector('i').className = 'fas fa-chevron-down';
            }
        });
    }

    // 完整显示：签到区上移覆盖头图区域，卡片改为每行7张网格布局
    var fullDisplayBtn = document.getElementById('checkinFullDisplayBtn_' + eventId);
    var eventMainEl = document.querySelector('.event-main');
    if (fullDisplayBtn && section && eventMainEl) {
        fullDisplayBtn.addEventListener('click', function() {
            var isFull = fullDisplayBtn.getAttribute('data-full') === 'true';
            if (isFull) {
                eventMainEl.classList.remove('checkin-full-mode');
                section.classList.remove('full-display');
                fullDisplayBtn.setAttribute('data-full', 'false');
                fullDisplayBtn.querySelector('span').textContent = '完整显示';
                fullDisplayBtn.querySelector('i').className = 'fas fa-expand';
            } else {
                eventMainEl.classList.add('checkin-full-mode');
                section.classList.add('full-display');
                fullDisplayBtn.setAttribute('data-full', 'true');
                fullDisplayBtn.querySelector('span').textContent = '退出完整';
                fullDisplayBtn.querySelector('i').className = 'fas fa-compress';
            }
        });
    }

    var claimAllBtn = document.getElementById('checkinClaimAllBtn');
    if (claimAllBtn) {
        claimAllBtn.addEventListener('click', function() {
            updateCheckinProgress(eventId);
            var data = getCheckinData(eventId);
            var claimedDays = data.claimedDays || [];
            var currentDay = getCurrentCheckinDay(eventId);

            var availableRewards = rewards.filter(function(r) {
                return r.day <= currentDay && claimedDays.indexOf(r.day) === -1;
            });

            if (availableRewards.length === 0) {
                if (claimedDays.length >= rewards.length) {
                    showToast({ type: 'info', title: '已全部领取', message: '所有奖励都已领取' });
                } else if (claimedDays.indexOf(currentDay) !== -1) {
                    showToast({ type: 'info', title: '已领取', message: '今日奖励已领取' });
                } else {
                    showToast({ type: 'info', title: '暂未解锁', message: '当前没有可领取的奖励' });
                }
                return;
            }

            availableRewards.forEach(function(r) {
                claimCheckinReward(eventId, r.day, r);
            });
            updateCheckinUI(eventId);
            showToast({ type: 'success', title: '领取成功', message: '已领取 ' + availableRewards.length + ' 项奖励！' });
        });
    }
}

function claimCheckinReward(eventId, day, reward) {
    var data = getCheckinData(eventId);
    if (data.claimedDays.indexOf(day) !== -1) return;

    data.claimedDays.push(day);
    data.lastClaimDate = new Date().toISOString();
    data.lastCheckinDate = getTodayDateStr();
    saveCheckinData(eventId, data);

    if (reward.type === 'exp') {
        addCheckinExp(reward.value);
        showToast({ type: 'success', title: '奖励领取', message: '获得 ' + reward.value + ' 经验值！' });
    } else if (reward.type === 'cardStyle') {
        unlockCardStyle(reward.value);
        showToast({ type: 'success', title: '名片样式解锁', message: '成功解锁：' + reward.label });
    } else if (reward.type === 'background3d') {
        unlock3DBackground(reward.value);
        showToast({ type: 'success', title: '3D背景解锁', message: '成功解锁：' + reward.label });
    } else if (reward.type === 'warehouse') {
        var qty = reward.count || 1;
        if (typeof warehouseAddItem === 'function') {
            warehouseAddItem(reward.itemId, qty, '冬季签到第' + day + '天奖励', true);
            showToast({ type: 'success', title: '奖励领取', message: '获得 ' + reward.label + (qty > 1 ? ' ×' + qty : '') + '，已发送至仓库' });
        } else {
            showToast({ type: 'error', title: '领取失败', message: '仓库系统未就绪，请稍后重试' });
        }
    }
}

function updateCheckinUI(eventId) {
    var checkinEl = document.getElementById('eventCenterCheckin');
    if (!checkinEl) return;

    var rewards = getCheckinRewards(eventId);
    if (!rewards || rewards.length === 0) return;

    var wasCollapsed = false;
    var wasFullDisplay = false;
    var oldSection = checkinEl.querySelector('.checkin-section');
    if (oldSection) {
        if (oldSection.classList.contains('collapsed')) wasCollapsed = true;
        if (oldSection.classList.contains('full-display')) wasFullDisplay = true;
    }

    checkinEl.innerHTML = generateCheckinSection(eventId);
    bindCheckinInteractions(eventId);

    if (wasCollapsed) {
        var newSection = checkinEl.querySelector('.checkin-section');
        var newToggleBtn = document.getElementById('checkinToggleBtn_' + eventId);
        if (newSection && newToggleBtn) {
            newSection.classList.add('collapsed');
            newToggleBtn.setAttribute('data-collapsed', 'true');
            newToggleBtn.querySelector('span').textContent = '展开';
            newToggleBtn.querySelector('i').className = 'fas fa-chevron-down';
        }
    }

    if (wasFullDisplay) {
        var newSection2 = checkinEl.querySelector('.checkin-section');
        var newFullBtn = document.getElementById('checkinFullDisplayBtn_' + eventId);
        var eventMainEl2 = document.querySelector('.event-main');
        if (newSection2 && newFullBtn && eventMainEl2) {
            newSection2.classList.add('full-display');
            eventMainEl2.classList.add('checkin-full-mode');
            newFullBtn.setAttribute('data-full', 'true');
            newFullBtn.querySelector('span').textContent = '退出完整';
            newFullBtn.querySelector('i').className = 'fas fa-compress';
        }
    }

    var claimedDays = (getCheckinData(eventId).claimedDays || []).slice();
    var allClaimed = rewards.every(function(r) { return claimedDays.indexOf(r.day) !== -1; });
    if (allClaimed) {
        migrateEventToEnded(eventId);

        // 刷新侧边栏列表，使活动条目移入已结束类别并保持选中状态
        var listContainer = document.getElementById('eventCenterList');
        if (listContainer) {
            renderEventCenterList();
            var item = listContainer.querySelector('.event-announcement-item[data-id="' + eventId + '"]');
            if (item) item.classList.add('active');
        }
    }
}

// ==================== 活动结束迁移（领完全部奖励的活动纳入已结束类别） ====================

function getMigratedEventIds() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    var key = 'event_migrated_' + (currentUser.username || 'anonymous');
    try {
        var stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch(e) { return []; }
}

function saveMigratedEventIds(ids) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    var key = 'event_migrated_' + (currentUser.username || 'anonymous');
    localStorage.setItem(key, JSON.stringify(ids));
}

// 打开弹窗时应用已迁移活动：下次打开后活动始终显示在已结束类别
function applyMigratedEvents() {
    var migratedIds = getMigratedEventIds();
    if (!migratedIds.length) return false;
    var changed = false;

    migratedIds.forEach(function(eventId) {
        var evt = eventCenterData.events.find(function(e) { return e.id === eventId; });
        if (evt && (evt.category !== 'ended' || evt.status !== 'ended')) {
            evt.category = 'ended';
            evt.status = 'ended';
            changed = true;
        }
        var annId = evt && evt.announcementId ? evt.announcementId : eventId;
        var ann = eventAnnouncementData.announcements.find(function(a) { return a.id === annId; });
        if (ann && ann.category !== 'ended') {
            ann.category = 'ended';
            changed = true;
        }
    });

    return changed;
}

function migrateEventToEnded(eventId) {
    var evt = eventCenterData.events.find(function(e) { return e.id === eventId; });
    if (evt) {
        evt.category = 'ended';
        evt.status = 'ended';

        // 同步迁移关联的活动公告
        if (evt.announcementId) {
            var ann = eventAnnouncementData.announcements.find(function(a) { return a.id === evt.announcementId; });
            if (ann && ann.category !== 'ended') {
                ann.category = 'ended';
            }
        }
    }

    var migratedIds = getMigratedEventIds();
    if (migratedIds.indexOf(eventId) === -1) {
        migratedIds.push(eventId);
        saveMigratedEventIds(migratedIds);
    }
}

function isCardStyleUnlocked(styleId) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    var foundUser = users.find(function(u) { return u.username === currentUser.username; });
    if (foundUser && foundUser.userProfile && foundUser.userProfile.unlockedCardStyles) {
        return foundUser.userProfile.unlockedCardStyles.indexOf(styleId) !== -1;
    }
    return false;
}

function unlockCardStyle(styleId) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    var foundUser = users.find(function(u) { return u.username === currentUser.username; });
    if (foundUser) {
        if (!foundUser.userProfile) foundUser.userProfile = {};
        if (!foundUser.userProfile.unlockedCardStyles) foundUser.userProfile.unlockedCardStyles = [];
        if (foundUser.userProfile.unlockedCardStyles.indexOf(styleId) === -1) {
            foundUser.userProfile.unlockedCardStyles.push(styleId);
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
    }
}

function unlock3DBackground(bgId) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    var username = currentUser.username || '';
    var unlockedIds = JSON.parse(localStorage.getItem(username + '_unlockedBackgroundIds') || '[]');
    if (unlockedIds.indexOf(bgId) === -1) {
        unlockedIds.push(bgId);
        localStorage.setItem(username + '_unlockedBackgroundIds', JSON.stringify(unlockedIds));
    }
}

function addCheckinExp(amount) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    var foundUser = users.find(function(u) { return u.username === currentUser.username; });
    if (!foundUser) return;

    // 经验倍率结算：限时提速活动固定倍率 × 仓库经验加成卡倍率（叠加规则各自独立）
    var expMult = (typeof getTotalExpMultiplier === 'function')
        ? getTotalExpMultiplier()
        : ((typeof getWarehouseExpMultiplier === 'function') ? getWarehouseExpMultiplier() : 1);
    if (expMult > 1) amount = Math.round(amount * expMult);

    if (!foundUser.gameData) foundUser.gameData = {};
    if (foundUser.gameData.level === undefined) foundUser.gameData.level = 1;
    if (foundUser.gameData.totalExp === undefined) foundUser.gameData.totalExp = 0;
    if (foundUser.gameData.exp === undefined) foundUser.gameData.exp = 0;

    var level = foundUser.gameData.level;
    var totalExp = foundUser.gameData.totalExp + amount;
    var expInLevel = foundUser.gameData.exp + amount;

    // 等级上限跟随主系统（阶段突破模式下为 120，否则 60）
    var safeMaxLevel = (typeof window.MAX_LEVEL === 'number') ? window.MAX_LEVEL : 60;
    // 重要：满级时升级需求为 0，若不检查等级上限，while 会死循环
    // （60级满级使用经验值补给卡页面卡死的根因），溢出经验保留在当前等级内
    while (level < safeMaxLevel && expInLevel >= getExpRequiredForLevelStatic(level)) {
        expInLevel -= getExpRequiredForLevelStatic(level);
        level++;
    }

    foundUser.gameData.level = level;
    foundUser.gameData.totalExp = totalExp;
    foundUser.gameData.exp = expInLevel;
    foundUser.gameData.expToNext = getExpRequiredForLevelStatic(level);

    localStorage.setItem('registeredUsers', JSON.stringify(users));

    if (typeof window.updateLevelCard === 'function') {
        var currentUserData = users.find(function(u) { return u.username === currentUser.username; });
        if (currentUserData) {
            window.updateLevelCard(currentUserData);
        }
    }
}

function getExpRequiredForLevelStatic(level) {
    // 优先使用主系统公式（与阶段突破模式 60-120 级新公式保持同步）
    if (typeof window.getExpRequiredForLevel === 'function') {
        return window.getExpRequiredForLevel(level);
    }
    var MAX_LEVEL = 60;
    if (level >= MAX_LEVEL) return 0;
    if (level >= 50) return 2000 + (level + 5) * 80;   // 50级+：2000 + (等级+5) × 80
    if (level >= 20) return 1500 + (level + 5) * 60;   // 20-49级：1500 + (等级+5) × 60
    return 1000 + (level + 3) * 50;                     // 1-19级：1000 + (等级+3) × 50
}

function showEventCenterModal() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.username) {
        if (typeof showToast === 'function') {
            showToast({ type: 'warning', title: '需要登录', message: '请先登录后再进入活动中心' });
        }
        return;
    }

    var modal = document.getElementById('eventCenterModal');
    if (!modal) {
        generateEventCenterModal();
        modal = document.getElementById('eventCenterModal');
    }

    // 应用时间状态与已结束迁移并刷新侧边栏列表
    var stateChanged = applyTimedEventStates();
    if (applyMigratedEvents() || stateChanged) {
        renderEventCenterList();
    }

    // 打开活动中心即视为已查看当前所有非已结束活动，立即刷新顶部导航气泡
    var viewableIds = eventCenterData.events.filter(function(e) {
        return (e.startTime || e.endTime) ? getEventTimeState(e.startTime, e.endTime) !== 'ended' : true;
    }).map(function(e) { return e.id; });
    if (markEventCenterIdsViewed(viewableIds)) {
        notifyUnreadStateChanged();
    }

    modal.style.display = 'flex';
    setTimeout(function() {
        modal.classList.add('show');
    }, 10);
}

function closeEventCenterModal() {
    var modal = document.getElementById('eventCenterModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
}

window.eventAnnouncementData = eventAnnouncementData;
window.passAnnouncementData = passAnnouncementData;
window.eventCenterData = eventCenterData;
window.getLevelBoostEventState = getLevelBoostEventState;
window.getEventExpMultiplier = getEventExpMultiplier;
window.getTotalExpMultiplier = getTotalExpMultiplier;
window.formatEventBoostTime = formatEventBoostTime;