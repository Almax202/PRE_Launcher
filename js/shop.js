// ==================== 商店系统 ====================
// 功能：使用 PRE Coin 兑换仓库中的道具（不包括所有徽章类）
// 定价：集中在 SHOP_ITEM_PRICES 中，修改价格/折扣只需更新该对象
// 入口：顶部导航栏「商店」→ 全屏弹窗
// 样式：完全自包含（wh-* 基础 + shop-* 扩展），不依赖仓库先打开

var SHOP_DATA_VERSION = 7; // v7: 新增 PRE 月卡（30 天订阅，最多叠加 90 天）

// 物品图标统一渲染：优先使用 Lucide（lucide-bridge.js），桥接层缺失时回退 Font Awesome
function _shopItemIconHtml(icon, color) {
    if (typeof preIcon === 'function') return preIcon(icon, color ? { color: color } : {});
    return '<i class="' + icon + '"' + (color ? ' style="color:' + color + ';"' : '') + '></i>';
}

// ==================== 商店定价配置（★ 修改价格/折扣仅需改此处 ★）====================
// 规则：
//   - price: 原价（购买 1 件所需 PRE Coin 数量，必须 ≥ 1）
//   - discount: 打折百分比（0 = 不打折，20 = 8 折，50 = 5 折，100 = 免费）
//     ★ 实际售价 = Math.round(price * (1 - discount/100))
//   - stock: 限购数量，-1 表示不限购
//   - stockType: 'daily' 每日重置限购; 'weekly' 每周重置限购(周一 UTC+8); 'monthly' 每月1号重置; 'total' 永久累计限购; 'none' 不限购
//   - enabled: 是否上架
//   - note: 商品说明（卡片底部展示）
//   - 说明：徽章（category === 'badge'）不得在商店出售，此处只允许消耗品和材料
var SHOP_ITEM_PRICES = {
    // ===== 消耗品：经验值加成卡（可与不同类型叠加，同类型不叠加，最多同时5张；同时激活5张时叠加可达 +175%） =====
    exp_boost_small: {
        price: 400,
        discount: 0,
        stock: 5,
        stockType: 'daily',
        enabled: true,
        note: '每日限购 5 张，经验获取 +5%，可与不同类型叠加（I+II+III+Ⅳ+V 组合可至 +175%）'
    },
    exp_boost_mid: {
        price: 600,
        discount: 0,
        stock: 1,
        stockType: 'daily',
        enabled: true,
        note: '经验获取 +15%，每日限购 1 份，可叠加（I+II+III+Ⅳ+V 组合可至 +175%）'
    },
    exp_boost_large: {
        price: 1000,
        discount: 0,
        stock: 1,
        stockType: 'weekly',
        enabled: true,
        note: '经验获取 +30%，每周限购 1 份，可叠加（I+II+III+Ⅳ+V 组合可至 +175%）'
    },
    exp_boost_premium: {
        price: 1800,
        discount: 0,
        stock: 2,
        stockType: 'total',
        enabled: true,
        note: '经验获取 +50%，永久限购 2 份，可叠加（I+II+III+Ⅳ+V 同时激活可至 +175%）'
    },
    // ===== 消耗品：抽卡卷 =====
    gacha_single: {
        price: 130,
        discount: 0,
        stock: 20,
        stockType: 'daily',
        enabled: true,
        note: '每日限购 20 张，免扣狂气单抽'
    },
    gacha_ten: {
        price: 1300,
        discount: 0,
        stock: 1,
        stockType: 'daily',
        enabled: true,
        note: '每日限购 1 张，免扣狂气十连'
    },

    // ===== 消耗品：补签卡 =====
    makeup_card: {
        price: 500,
        discount: 0,
        stock: 2,
        stockType: 'weekly',
        enabled: true,
        note: '每周限购 2 张，解锁错过的签到奖励'
    },

    // ===== 消耗品：幸运币（幸运抽奖机投币使用） =====
    luck_coin: {
        price: 100,
        discount: 0,
        stock: 3,
        stockType: 'daily',
        enabled: true,
        note: '每日限购 3 枚，在幸运抽奖机投币口使用：提升普通档位奖品概率（上限 75%）'
    },

    // ===== 消耗品：经验值补给卡 =====
    exp_supply_1: {
        price: 400,
        discount: 0,
        stock: 2,
        stockType: 'daily',
        enabled: true,
        note: '每日限购 2 份，立即获得 300 经验值'
    },
    exp_supply_2: {
        price: 800,
        discount: 0,
        stock: 2,
        stockType: 'weekly',
        enabled: true,
        note: '每周限购 2 份，立即获得 600 经验值'
    },
    exp_supply_3: {
        price: 1400,
        discount: 0,
        stock: 1,
        stockType: 'weekly',
        enabled: true,
        note: '每周限购 1 份，立即获得 1000 经验值'
    },
    exp_supply_4: {
        price: 2000,
        discount: 0,
        stock: 3,
        stockType: 'total',
        enabled: true,
        note: '永久限购 3 份，立即获得 2000 经验值'
    },
    // ===== 消耗品：每月限购特供（stockType: monthly，对应已有仓库道具 ID） =====
    exp_boost_large_monthly: {
        price: 1000,
        discount: 0,
        stock: 1,
        stockType: 'monthly',
        enabled: true,
        warehouseId: 'exp_boost_large', // 与普通版共享仓库条目
        note: '每月限购 1 份，经验获取 +30%，可叠加（月度特供价 90% 折）'
    },
    exp_supply_4_monthly: {
        price: 2000,
        discount: 0,              
        stock: 1,
        stockType: 'monthly',
        enabled: true,
        warehouseId: 'exp_supply_4',
        note: '每月限购 1 份，立即获得 2000 经验值，（月度特供价 90% 折）'
    },
    gacha_ten_monthly: {
        price: 1300,
        discount: 0,
        stock: 3,
        stockType: 'monthly',
        enabled: true,
        warehouseId: 'gacha_ten',
        note: '每月限购 3 张，免扣狂气十连（月度特供价 90% 折）'
    }
    // 新增商品：复制上方格式，追加新条目即可
    // new_item_id: {
    //     price: 999,
    //     discount: 0,          // ★ 打折百分比，修改此单一数值即可
    //     stock: 1,
    //     stockType: 'daily',   // daily / weekly / total / none
    //     enabled: true,
    //     note: '商品描述说明'
    // }
};

// ==================== 全局促销配置（★ 一处设置，全场商品自动促销 ★）====================
// 规则：
//   - enabled: 是否启用全局促销（false 时全场按原价/各自折扣销售）
//   - discount: 全局促销折扣百分比（0 = 不打折，20 = 8 折，50 = 5 折）
//     ★ 生效时对全部商品自动生效，商品实际折扣 = max(商品自身折扣, 全局折扣)
//     ★ 仅对普通商品生效，组合包折扣仍在 SHOP_BUNDLES 中单独配置
//   - start / end: 促销起止时间（UTC+8，格式 'YYYY-MM-DD HH:mm:ss'，也可只写日期）
//     ★ start 留空 '' = 立即开始；end 留空 '' = 永不结束
//     ★ 到点自动开始 / 到点自动结束，无需手动干预
var SHOP_GLOBAL_PROMO = {
    enabled: false,
    discount: 20,                     // ★ 全场促销折扣百分比，修改此单一数值即可
    start: '2026-08-30 00:00:00',     // 促销开始时间（UTC+8）
    end: '2026-09-13 23:59:59'        // 促销截止时间（UTC+8）
};

// 将 'YYYY-MM-DD HH:mm:ss' 按 UTC+8 解析为时间戳；未配置/格式错误返回 null
function _shopParsePromoTime(str) {
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

// 全局促销是否正在进行（根据起止时间自动开关）
function isShopGlobalPromoActive() {
    var p = SHOP_GLOBAL_PROMO;
    if (!p || !p.enabled) return false;
    if (!p.discount || p.discount <= 0) return false;
    var now = Date.now();
    var start = _shopParsePromoTime(p.start);
    var end = _shopParsePromoTime(p.end);
    if (start !== null && now < start) return false;
    if (end !== null && now > end) return false;
    return true;
}

// 当前生效的全局促销折扣（未生效返回 0）
function getShopGlobalPromoDiscount() {
    return isShopGlobalPromoActive() ? (SHOP_GLOBAL_PROMO.discount || 0) : 0;
}

// 商品最终生效折扣 = max(商品自身折扣, 全局促销折扣)
function getShopItemEffectiveDiscount(itemId) {
    var cfg = SHOP_ITEM_PRICES[itemId];
    var own = cfg ? (cfg.discount || 0) : 0;
    return Math.max(own, getShopGlobalPromoDiscount());
}

// ==================== 组合包配置（★ 包名/内容在此处自由增改 ★）====================
// 规则：
//   - name: 组合包名称（直接改这里即可换名）
//   - icon / color: 包图标与主题色
//   - items: 包内物品列表，每项支持：
//       itemId   — 仓库道具 id（必须存在于 WAREHOUSE_ITEMS）
//       price    — 包内单项售价（省略则自动取单买价 SHOP_ITEM_PRICES.price）
//       discount — 包内单项额外折扣（可选，0 = 不打折）
//       qty      — 该物品数量（可选，默认 1）
//   - discount: 整包折扣百分比（0 = 不打折）★ 包总价 = Σ单项折后价 ×(1 - 整包折扣%)
//   - stock / stockType: 限购（daily / weekly / total / none）
//   - enabled: 是否上架
//   - note: 组合包说明
//   - 新增组合包：复制一个条目、改 id 与内容即可，前端自动渲染与计价
var SHOP_BUNDLES = {
    bundle_starter: {
        name: '新手专享起航包',
        icon: 'fas fa-gift',
        color: '#e67e22',
        items: [
            { itemId: 'exp_boost_small', price: 400 },
            { itemId: 'exp_supply_1', price: 400 },
            { itemId: 'luck_coin', price: 100 }
        ],
        discount: 50,          // ★ 整包打折百分比，修改此单一数值即可
        stock: 1,
        stockType: 'total',
        enabled: true,
        note: '新手补给三件套，包含 50% 折扣，助力初期等级提升（该组合包仅限购 1 份）'
    },
    bundle_allinone: {
        name: 'PRE Launcher 豪华组合包',
        icon: 'fas fa-gift',
        color: '#e74c3c',
        items: [
            { itemId: 'exp_boost_small', price: 400 },
            { itemId: 'exp_boost_mid', price: 600 },
            { itemId: 'exp_boost_large', price: 1000 },
            { itemId: 'exp_supply_1', price: 400 },
            { itemId: 'exp_supply_2', price: 800 },
            { itemId: 'exp_supply_3', price: 1400 },
            { itemId: 'exp_supply_4', price: 2000 },
            { itemId: 'makeup_card', price: 500 },
            { itemId: 'makeup_card', price: 500 },
            { itemId: 'makeup_card', price: 500 },
        ],
        discount: 20,          // ★ 整包打折百分比，修改此单一数值即可
        stock: 1,
        stockType: 'total',
        enabled: true,
        note: 'PRE Launcher 豪华组合包，包含 20% 折扣，购买即可享受最豪华的经验补给服务（该组合包仅限购 1 份）'
    },
    bundle_exp01: {
        name: '经验补给包 Ⅰ',
        icon: 'fas fa-gift',
        color: '#3498db',
        items: [
            { itemId: 'exp_supply_1', price: 400 },
            { itemId: 'exp_supply_1', price: 400 },
        ],
        discount: 10,          // ★ 整包打折百分比，修改此单一数值即可
        stock: 1,
        stockType: 'total',
        enabled: true,
        note: '经验补给包 Ⅰ，两张经验补给卡 Ⅰ（共600 EXP）（该组合包仅限购 1 份）'
    },
    bundle_exp02: {
        name: '经验补给包 Ⅱ',
        icon: 'fas fa-gift',
        color: '#9b59b6',
        items: [
            { itemId: 'exp_supply_2', price: 800 },
            { itemId: 'exp_supply_2', price: 800 },
        ],
        discount: 10,          // ★ 整包打折百分比，修改此单一数值即可
        stock: 1,
        stockType: 'total',
        enabled: true,
        note: '经验补给包 Ⅱ，两张经验补给卡 Ⅱ（共1200 EXP）（该组合包仅限购 1 份）'
    },
    bundle_exp03: {
        name: '经验补给包 Ⅲ',
        icon: 'fas fa-gift',
        color: '#e67e22',
        items: [
            { itemId: 'exp_supply_3', price: 1400 },
            { itemId: 'exp_supply_3', price: 1400 },
        ],
        discount: 10,          // ★ 整包打折百分比，修改此单一数值即可
        stock: 1,
        stockType: 'total',
        enabled: true,
        note: '经验补给包 Ⅲ，两张经验补给卡 Ⅲ（共2000 EXP）（该组合包仅限购 1 份）'
    },
    bundle_exp04: {
        name: '经验补给包 Ⅳ',
        icon: 'fas fa-gift',
        color: '#e74c3c',
        items: [
            { itemId: 'exp_supply_4', price: 2000 },
            { itemId: 'exp_supply_4', price: 2000 },
        ],
        discount: 10,          // ★ 整包打折百分比，修改此单一数值即可
        stock: 1,
        stockType: 'total',
        enabled: true,
        note: '经验补给包 Ⅳ，两张经验补给卡 Ⅳ（共4000 EXP），获取经验的有效方式（该组合包仅限购 1 份）'
    },
    bundle_gacha01: {
        name: '提取补给包 Ⅰ',
        icon: 'fas fa-gift',
        color: '#9b59b6',
        items: [
            { itemId: 'gacha_single', price: 130 },
            { itemId: 'gacha_single', price: 130 },
            { itemId: 'gacha_single', price: 130 },
            { itemId: 'gacha_single', price: 130 },
            { itemId: 'gacha_single', price: 130 },
        ],
        discount: 10,          // ★ 整包打折百分比，修改此单一数值即可
        stock: 2,
        stockType: 'total',
        enabled: true,
        note: '提取补给包 Ⅰ，包含 5 张单次抽卡卷（该组合包限购 2 份）'
    },
    bundle_gacha02: {
        name: '提取补给包 Ⅱ',
        icon: 'fas fa-gift',
        color: '#e67e22',
        items: [
            { itemId: 'gacha_ten', price: 1300 },
            { itemId: 'gacha_ten', price: 1300 },
        ],
        discount: 15,          // ★ 整包打折百分比，修改此单一数值即可
        stock: 1,
        stockType: 'total',
        enabled: true,
        note: '提取补给包 Ⅱ，包含 2 张十连抽卡卷（该组合包限购 1 份）'
    },
    bundle_expup1: {
        name: '经验加成包 Ⅰ',
        icon: 'fas fa-gift',
        color: '#3498db',
        items: [
            { itemId: 'exp_boost_small', price: 400 },
            { itemId: 'exp_boost_small', price: 400 },
        ],
        discount: 10,          // ★ 整包打折百分比，修改此单一数值即可
        stock: 1,
        stockType: 'total',
        enabled: true,
        note: '经验加成包 Ⅰ，内含两张经验加成卡 Ⅰ，可与其他类型叠加至最高+50%（该组合包仅限购 1 份）'
    },
    bundle_expup2: {
        name: '经验加成包 Ⅱ',
        icon: 'fas fa-gift',
        color: '#9b59b6',
        items: [
            { itemId: 'exp_boost_mid', price: 600 },
            { itemId: 'exp_boost_mid', price: 600 },
        ],
        discount: 10,          // ★ 整包打折百分比，修改此单一数值即可
        stock: 1,
        stockType: 'total',
        enabled: true,
        note: '经验加成包 Ⅱ，内含两张经验加成卡 Ⅱ，可叠加（该组合包仅限购 1 份）'
    },
    bundle_expup3: {
        name: '经验加成包 Ⅲ',
        icon: 'fas fa-gift',
        color: '#e67e22',
        items: [
            { itemId: 'exp_boost_large', price: 1000 },
            { itemId: 'exp_boost_large', price: 1000 },
        ],
        discount: 10,          // ★ 整包打折百分比，修改此单一数值即可
        stock: 1,
        stockType: 'total',
        enabled: true,
        note: '经验加成包 Ⅲ，内含两张经验加成卡 Ⅲ，可叠加（该组合包仅限购 1 份）'
    },

    // 新增组合包：复制上方格式追加即可
    // bundle_xxx: {
    //     name: '包名',
    //     icon: 'fas fa-box-open',
    //     color: '#3498db',
    //     items: [
    //         { itemId: '道具id', price: 100, discount: 0, qty: 1 },
    //     ],
    //     discount: 0,        // ★ 整包打折百分比
    //     stock: 1,
    //     stockType: 'weekly',
    //     enabled: true,
    //     note: '组合包说明'
    // },

    // ===== 每月限购组合包 =====
    bundle_monthly_supply: {
        name: '月度成长补给包',
        icon: 'fas fa-gift',
        color: '#e67e22',
        items: [
            { itemId: 'exp_boost_mid', price: 600 },
            { itemId: 'exp_boost_large', price: 1000 },
            { itemId: 'exp_supply_4', price: 2000 },
        ],
        discount: 15,         // ★ 整包 85% 折
        stock: 1,
        stockType: 'monthly',
        enabled: true,
        note: '每月限购 1 份： 经验加成卡Ⅱ + 经验加成卡Ⅲ + 经验补给卡Ⅳ（整包 85% 折）'
    },

    // ===== 每周限购组合包 =====
    bundle_weekly_supply: {
        name: '每周轻量补给包',
        icon: 'fas fa-gift',
        color: '#16a085',
        items: [
            { itemId: 'exp_supply_2', price: 800 },
            { itemId: 'exp_boost_mid', price: 600 },
            { itemId: 'makeup_card', price: 500 },
        ],
        discount: 20,         // ★ 整包 8 折
        stock: 1,
        stockType: 'weekly',
        enabled: true,
        note: '每周限购 1 份：经验补给卡Ⅱ + 经验加成卡Ⅱ + 补签卡 1 张（整包 80% 折）'
    }
};

// ==================== 特殊商品：背景 / 名片（★ 固定价，不参与任何促销与折扣 ★）====================
// 规则：
//   - price 固定 5000 PRE Coin，任何全局促销 / 商品折扣均不影响（与 SHOP_ITEM_PRICES 完全隔离）
//   - kind: 'background'（背景）| 'namecard'（名片样式）
//   - targetId: 背景 id（对应 account-settings 预设背景）或名片样式 id（对应 cardStyleData）
//   - unlockSource: 该背景原邮件的 id（用于判定用户是否曾通过邮件领取过 → 已拥有）
//   - preview: 背景卡片点击预览数据（字段与邮件附件一致，复用 openBackgroundPreview）；名片不提供预览
//   - 已拥有对应背景 / 名片样式时：购买按钮显示「已拥有或已售罄」且卡片置灰
//   - 当前有进行中 / 即将开始的活动包含对应背景 / 名片奖励时：购买按钮显示「暂未开放售卖」且卡片置灰，
//     活动结束（endTime 到点）或下线（活动移除 / status 置为 ended）后自动恢复售卖
var SHOP_SPECIAL_ITEMS = {
    sp_bg_liujin: {
        kind: 'background',
        targetId: 'mail-bg-1',
        unlockSource: 'test_mail_001',
        name: '限定背景「鎏金幻彩」',
        icon: 'fas fa-image',
        color: '#e94560',
        price: 3000,
        enabled: true,
        desc: '曾随欢迎邮件发放的限定静态背景，深邃夜色与流光溢彩交织',
        note: '限定返场 · 固定价 3000 PRE Coin（因非动态背景降价调整），不参与任何促销与折扣；购买后可前往系统设置应用',
        preview: {
            name: '鎏金幻彩',
            gradient: 'radial-gradient(circle at 10% 20%, rgba(255, 223, 0, 0.2) 0%, transparent 35%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.18) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.15) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.12) 0%, transparent 45%), radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 40%), linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 20%, #16213e 40%, #0f3460 60%, #533483 80%, #e94560 100%)'
        }
    },
    sp_bg_dongtai: {
        kind: 'background',
        targetId: 'dynamic-bg-1',
        name: '限定背景「动态流光」',
        icon: 'fas fa-image',
        color: '#e67e22',
        price: 5000,
        enabled: true,
        desc: '早期测试兑换码解锁的限定动态背景，四色流光循环变换',
        note: '限定返场 · 固定价 5000 PRE Coin，不参与任何促销与折扣；购买后可前往系统设置应用',
        preview: {
            name: '动态流光',
            gradient: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
            isDynamic: true,
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite'
        }
    },
    sp_bg_july: {
        kind: 'background',
        targetId: 'monthly-bg-july',
        unlockSource: 'monthly_mail_july',
        name: '限定背景「七月流火」',
        icon: 'fas fa-image',
        color: '#f97316',
        price: 5000,
        enabled: true,
        desc: '七月限定动态背景，暖橙渐变配动态星光与年月角标（2026.07）',
        note: '限定返场 · 固定价 5000 PRE Coin，不参与任何促销与折扣；购买后可前往系统设置应用',
        preview: {
            name: '七月流火',
            gradient: 'radial-gradient(circle at 15% 15%, rgba(255, 200, 50, 0.3) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(255, 100, 50, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(255, 150, 0, 0.2) 0%, transparent 55%), radial-gradient(circle at 30% 70%, rgba(255, 230, 100, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255, 80, 80, 0.15) 0%, transparent 50%), linear-gradient(135deg, #fff7ed 0%, #ffedd5 15%, #fed7aa 30%, #fdba74 45%, #fb923c 60%, #f97316 75%, #ea580c 90%, #c2410c 100%)',
            isDynamic: true,
            backgroundSize: '200% 200%',
            animation: 'monthlyShift 20s ease infinite',
            particles: true,
            showDate: true,
            dateText: '2026.07'
        }
    },
    sp_bg_august: {
        kind: 'background',
        targetId: 'monthly-bg-august',
        unlockSource: 'monthly_mail_august',
        name: '限定背景「八月鎏金」',
        icon: 'fas fa-image',
        color: '#daa520',
        price: 5000,
        enabled: true,
        desc: '八月限定动态背景，深金琥珀渐变配动态粒子与年月角标（2026.08）',
        note: '限定返场 · 固定价 5000 PRE Coin，不参与任何促销与折扣；购买后可前往系统设置应用',
        preview: {
            name: '八月鎏金',
            gradient: 'radial-gradient(circle at 12% 18%, rgba(218, 165, 32, 0.35) 0%, transparent 40%), radial-gradient(circle at 88% 82%, rgba(255, 140, 0, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 55%), radial-gradient(circle at 28% 72%, rgba(139, 90, 43, 0.18) 0%, transparent 50%), radial-gradient(circle at 72% 28%, rgba(46, 139, 142, 0.12) 0%, transparent 45%), linear-gradient(135deg, #1a0f00 0%, #2d1810 15%, #4a2c1a 30%, #8b6914 45%, #b8860b 55%, #daa520 65%, #cd853f 75%, #6b4423 85%, #2e2e2e 100%)',
            isDynamic: true,
            backgroundSize: '300% 300%',
            animation: 'augustShift 18s ease infinite',
            particles: true,
            showDate: true,
            dateText: '2026.08'
        }
    },
    sp_bg_september: {
        kind: 'background',
        targetId: 'monthly-bg-september',
        unlockSource: 'monthly_mail_september',
        name: '限定背景「九月月华」',
        icon: 'fas fa-image',
        color: '#7185b8',
        price: 5000,
        enabled: true,
        desc: '九月限定动态背景，深靛夜幕配月华银蓝光晕、动态星粒子与年月角标（2026.09）',
        note: '限定返场 · 固定价 5000 PRE Coin，不参与任何促销与折扣；购买后可前往系统设置应用',
        preview: {
            name: '九月月华',
            gradient: 'radial-gradient(circle at 20% 15%, rgba(170, 200, 255, 0.28) 0%, transparent 40%), radial-gradient(circle at 85% 80%, rgba(255, 220, 150, 0.22) 0%, transparent 45%), radial-gradient(circle at 55% 45%, rgba(220, 235, 255, 0.16) 0%, transparent 50%), radial-gradient(circle at 10% 75%, rgba(110, 120, 220, 0.2) 0%, transparent 50%), radial-gradient(circle at 78% 25%, rgba(255, 190, 130, 0.14) 0%, transparent 45%), linear-gradient(135deg, #0a0e23 0%, #131a3a 15%, #1c2750 30%, #2b3a6b 45%, #46588f 60%, #6f81b0 75%, #a5b4d8 88%, #3d4c7d 100%)',
            isDynamic: true,
            backgroundSize: '300% 300%',
            animation: 'septemberShift 22s ease infinite',
            particles: true,
            showDate: true,
            dateText: '2026.09'
        }
    },
    sp_bg_october: {
        kind: 'background',
        targetId: 'monthly-bg-october',
        unlockSource: 'monthly_mail_october',
        name: '限定背景「十月枫华」',
        icon: 'fas fa-leaf',
        color: '#b84a2a',
        price: 5000,
        enabled: true,
        desc: '十月限定动态背景，深秋红枫与金秋晚霞渐变，缀以枫红光晕、动态星粒子与年月角标（2026.10）',
        note: '限定返场 · 固定价 5000 PRE Coin，不参与任何促销与折扣；购买后可前往系统设置应用',
        preview: {
            name: '十月枫华',
            gradient: 'radial-gradient(circle at 18% 18%, rgba(255, 170, 80, 0.28) 0%, transparent 40%), radial-gradient(circle at 82% 78%, rgba(220, 70, 60, 0.26) 0%, transparent 45%), radial-gradient(circle at 55% 40%, rgba(255, 210, 130, 0.18) 0%, transparent 50%), radial-gradient(circle at 12% 78%, rgba(150, 40, 70, 0.22) 0%, transparent 50%), radial-gradient(circle at 75% 22%, rgba(240, 130, 50, 0.16) 0%, transparent 45%), linear-gradient(135deg, #1f0809 0%, #3d1012 15%, #6b1f16 30%, #9c3a1c 45%, #c96a24 60%, #e89a3c 72%, #a64826 88%, #401718 100%)',
            isDynamic: true,
            backgroundSize: '300% 300%',
            animation: 'octoberShift 21s ease infinite',
            particles: true,
            showDate: true,
            dateText: '2026.10'
        }
    },
    sp_bg_3d_space: {
        kind: 'background',
        targetId: 'bg-3d-space',
        name: '限定背景「3D 太空遨游」',
        icon: 'fas fa-rocket',
        color: '#7c5cbf',
        price: 5000,
        enabled: true,
        desc: '秋季签到活动第 8 天奖励 · 深邃太空配 3D 漂浮星球与流星轨迹',
        note: '活动返场 · 固定价 5000 PRE Coin，不参与任何促销与折扣；已通过秋季签到活动领取过的用户无需再次购买',
        preview: {
            name: '3D 太空遨游',
            gradient: 'radial-gradient(ellipse at 30% 20%, rgba(124, 92, 191, 0.35) 0%, transparent 45%), radial-gradient(ellipse at 75% 70%, rgba(59, 130, 246, 0.28) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 60%), linear-gradient(180deg, #0a0a1f 0%, #12123a 40%, #1a1a4e 70%, #262667 100%)',
            isDynamic: true,
            backgroundSize: '300% 300%',
            particles: true
        }
    },
    sp_nc_star: {
        kind: 'namecard',
        targetId: 'card-style-special-autumn',
        name: '名片样式「星河漫游」',
        icon: 'fas fa-id-card',
        color: '#6366f1',
        price: 5000,
        enabled: true,
        desc: '特殊获取的名片样式，深邃星河配色',
        note: '限定返场 · 固定价 5000 PRE Coin，不参与任何促销与折扣；购买后可前往用户名片中更改名片样式'
    }
};

// ==================== PRE 月卡配置（商店专属订阅制商品）====================
// 规则：
//   - 售价 3000 PRE Coin / 张，每张 30 天
//   - 可重复购买，但同时持有的剩余天数最多 90 天（即最多 3 张）
//   - 达到 90 天上限后不可购买，需等待首张月卡消耗完（30 天）后才可继续购买
//   - 每日通过邮件系统发放当日奖励（当日未登录启动器不发放，且不可补领）
var PRE_MONTHLY_CARD = {
    id: 'pre_monthly_card',
    name: 'PRE 月卡',
    price: 3000,
    days: 30,
    maxDays: 90,
    icon: 'fas fa-id-card',
    color: '#d4af37',
    dailyRewards: [
        { type: 'precoin', name: 'PRE Coin', count: 120, icon: 'fas fa-coins', color: '#f39c12' },
        { type: 'warehouse', itemId: 'rand_box_1', count: 1 },
        { type: 'warehouse', itemId: 'exp_boost_large', count: 1 },
        { type: 'warehouse', itemId: 'exp_supply_2', count: 1 },
        { type: 'warehouse', itemId: 'exp_supply_3', count: 1 }
    ]
};

var _MONTHLY_CARD_MS_PER_DAY = 24 * 60 * 60 * 1000;

function _monthlyCardStorageKey() {
    return _shopGetUsername() + '_preMonthlyCard';
}

// 读取月卡状态（自动清理已结束的卡片，避免数据无限增长）
function getMonthlyCardState() {
    var state = null;
    try { state = JSON.parse(localStorage.getItem(_monthlyCardStorageKey()) || 'null'); } catch (e) { state = null; }
    if (!state || typeof state !== 'object') {
        state = { version: 1, cards: [], lastIssuedDate: null, totalPurchased: 0, lastPurchaseTime: 0 };
        return state;
    }
    if (!Array.isArray(state.cards)) state.cards = [];
    var now = Date.now();
    var valid = state.cards.filter(function(c) { return c && c.startTime && c.endTime && c.endTime > now; });
    if (valid.length !== state.cards.length) {
        state.cards = valid;
        saveMonthlyCardState(state);
    }
    return state;
}

function saveMonthlyCardState(state) {
    if (!state) return;
    try { localStorage.setItem(_monthlyCardStorageKey(), JSON.stringify(state)); } catch (e) {}
}

// 剩余可用时长（毫秒）：所有卡片按顺序衔接，因此取最后一张的结束时间即可
function getMonthlyCardRemainingMs() {
    var state = getMonthlyCardState();
    if (!state.cards || state.cards.length === 0) return 0;
    var maxEnd = 0;
    state.cards.forEach(function(c) { if (c.endTime > maxEnd) maxEnd = c.endTime; });
    return Math.max(0, maxEnd - Date.now());
}

function getMonthlyCardRemainingDays() {
    return Math.ceil(getMonthlyCardRemainingMs() / _MONTHLY_CARD_MS_PER_DAY);
}

// 月卡是否处于生效状态（有未消耗时长即为生效）
function isMonthlyCardActive() {
    return getMonthlyCardRemainingMs() > 0;
}

// 购买资格：剩余天数 + 30 天不超过 90 天
function canPurchaseMonthlyCard() {
    return getMonthlyCardRemainingMs() + PRE_MONTHLY_CARD.days * _MONTHLY_CARD_MS_PER_DAY <= PRE_MONTHLY_CARD.maxDays * _MONTHLY_CARD_MS_PER_DAY;
}

// ==================== 价格计算辅助（★ 单一改价入口 ★）====================
// 获取商品实际最终价格（已应用自身折扣 + 全局促销折扣）
function getShopItemFinalPrice(itemId) {
    var cfg = SHOP_ITEM_PRICES[itemId];
    if (!cfg) return 0;
    var price = cfg.price || 0;
    var discount = getShopItemEffectiveDiscount(itemId);
    if (discount <= 0) return price;
    if (discount >= 100) return 0;
    return Math.round(price * (1 - discount / 100));
}

// ==================== 组合包价格计算 ====================
// 包内单项折后价
function _shopBundleItemFinal(item) {
    var basePrice = (item.price !== undefined) ? item.price
        : (SHOP_ITEM_PRICES[item.itemId] ? SHOP_ITEM_PRICES[item.itemId].price : 0);
    var d = item.discount || 0;
    if (d <= 0) return basePrice;
    if (d >= 100) return 0;
    return Math.round(basePrice * (1 - d / 100));
}
// 包内物品折后总价（未应用整包折扣）
function getShopBundleItemsSum(bundleId) {
    var cfg = SHOP_BUNDLES[bundleId];
    if (!cfg) return 0;
    var sum = 0;
    cfg.items.forEach(function(it) { sum += _shopBundleItemFinal(it) * (it.qty || 1); });
    return sum;
}
// 组合包最终售价（应用整包折扣）★ 自动计价唯一入口
function getShopBundleFinalPrice(bundleId) {
    var cfg = SHOP_BUNDLES[bundleId];
    if (!cfg) return 0;
    var sum = getShopBundleItemsSum(bundleId);
    var d = cfg.discount || 0;
    if (d <= 0) return sum;
    if (d >= 100) return 0;
    return Math.round(sum * (1 - d / 100));
}
// 单买总价（用于「立省」提示）
function getShopBundleSingleSum(bundleId) {
    var cfg = SHOP_BUNDLES[bundleId];
    if (!cfg) return 0;
    var sum = 0;
    cfg.items.forEach(function(it) {
        var pc = SHOP_ITEM_PRICES[it.itemId];
        sum += (pc ? pc.price : 0) * (it.qty || 1);
    });
    return sum;
}

// ==================== 商店分类 ====================
var SHOP_CATEGORIES = [
    { id: 'recommend',    name: '推荐',       icon: 'fas fa-thumbs-up' },
    { id: 'all',          name: '全部商品',   icon: 'fas fa-th-large' },
    { id: 'consumable',   name: '消耗品',     icon: 'fas fa-bolt' },
    { id: 'material',     name: '材料',       icon: 'fas fa-cubes' },
    { id: 'background',   name: '背景',       icon: 'fas fa-image' },
    { id: 'namecard',     name: '名片',       icon: 'fas fa-id-card' },
    { id: 'daily_limit',  name: '每日限购',   icon: 'fas fa-calendar-day', separator: true },
    { id: 'weekly_limit', name: '每周限购',   icon: 'fas fa-calendar-week' },
    { id: 'monthly_limit',name: '每月限购',   icon: 'fas fa-calendar-alt' },
    { id: 'total_limit',  name: '累计限购',   icon: 'fas fa-infinity' },
    { id: 'bundle',       name: '组合包',     icon: 'fas fa-gift', separator: true },
    { id: 'monthly_card', name: 'PRE 月卡',   icon: 'fas fa-id-card', separator: true }
];

// ==================== 开发者模式检测 ====================
function isShopDevMode() {
    var currentUser = {};
    var devModeData = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        devModeData = JSON.parse(localStorage.getItem('devModeData') || '{}');
    } catch (e) {}
    return !!(devModeData[currentUser.username] && devModeData[currentUser.username].enabled) ||
           !!(devModeData['__global__'] && devModeData['__global__'].enabled);
}

// ==================== 账户隔离存储（限购历史） ====================
function getShopStorageKey() {
    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch (e) {}
    var username = currentUser.username || 'anonymous';
    return 'shop_' + username;
}

// 刷新时间统一规则（UTC+8）：每日限购每日凌晨 4 点刷新，每周限购每周一凌晨 4 点刷新，每月限购每月 1 日凌晨 4 点刷新
// 各日期 key 以凌晨 4 点为边界：时间戳回退 4 小时后 +8h 取 UTC+8 墙钟（纯时间戳换算，时区无关；4 点前仍算前一周期）
function _shopGetTodayKey() {
    var now = new Date();
    var utc8 = new Date(now.getTime() - 4 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000);
    return utc8.toISOString().substring(0, 10);
}

// 本周周一（UTC+8，周一凌晨 4 点为一周起点）日期 key，用于每周限购重置
function _shopGetWeekKey() {
    var now8 = new Date(new Date().getTime() - 4 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000);
    var day = now8.getUTCDay(); // 0=周日
    var diff = day === 0 ? 6 : day - 1;
    var monday = new Date(now8.getTime() - diff * 24 * 60 * 60 * 1000);
    return monday.toISOString().substring(0, 10);
}

// 本月（UTC+8，1 日凌晨 4 点为一月起点）年月 key，用于每月限购重置
function _shopGetMonthKey() {
    var now8 = new Date(new Date().getTime() - 4 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000);
    return now8.toISOString().substring(0, 7); // YYYY-MM
}

function getShopData() {
    var todayKey = _shopGetTodayKey();
    var weekKey = _shopGetWeekKey();
    var monthKey = _shopGetMonthKey();
    var stored = localStorage.getItem(getShopStorageKey());
    if (stored) {
        try {
            var data = JSON.parse(stored);
            if (data && typeof data.purchases === 'object') {
                var dirty = false;
                if (data.lastPurchaseDate !== todayKey) {
                    Object.keys(data.purchases).forEach(function(id) {
                        var rec = data.purchases[id];
                        if (rec.dailyCount !== undefined) rec.dailyCount = 0;
                    });
                    data.lastPurchaseDate = todayKey;
                    dirty = true;
                }
                if (data.lastPurchaseWeek !== weekKey) {
                    Object.keys(data.purchases).forEach(function(id) {
                        var rec = data.purchases[id];
                        if (rec.weeklyCount !== undefined) rec.weeklyCount = 0;
                    });
                    data.lastPurchaseWeek = weekKey;
                    dirty = true;
                }
                if (data.lastPurchaseMonth !== monthKey) {
                    Object.keys(data.purchases).forEach(function(id) {
                        var rec = data.purchases[id];
                        if (rec.monthlyCount !== undefined) rec.monthlyCount = 0;
                    });
                    data.lastPurchaseMonth = monthKey;
                    dirty = true;
                }
                if (dirty) saveShopData(data);
                return data;
            }
        } catch (e) {}
    }
    return {
        version: SHOP_DATA_VERSION,
        lastPurchaseDate: todayKey,
        lastPurchaseWeek: weekKey,
        lastPurchaseMonth: monthKey,
        purchases: {},
        totalSpentCoin: 0,
        totalPurchased: 0
    };
}

function saveShopData(data) {
    data.version = SHOP_DATA_VERSION;
    localStorage.setItem(getShopStorageKey(), JSON.stringify(data));
}

function _shopRecordPurchase(itemId, price, qty) {
    var data = getShopData();
    if (!data.purchases[itemId]) data.purchases[itemId] = { dailyCount: 0, weeklyCount: 0, monthlyCount: 0, totalCount: 0 };
    var rec = data.purchases[itemId];
    rec.dailyCount = (rec.dailyCount || 0) + qty;
    rec.weeklyCount = (rec.weeklyCount || 0) + qty;
    rec.monthlyCount = (rec.monthlyCount || 0) + qty;
    rec.totalCount = (rec.totalCount || 0) + qty;
    data.totalSpentCoin += price * qty;
    data.totalPurchased += qty;
    saveShopData(data);
}

// 记录商店外的 PRE Coin 消费到「累计消费」统计（如购买通行证本体/组合包/等级）。
// 仅累加消费额，不增加商品购买件数（totalPurchased），因为这些不是商店商品。
function shopAddExternalSpend(amount) {
    amount = parseInt(amount, 10);
    if (!amount || amount <= 0) return false;
    var data = getShopData();
    data.totalSpentCoin = (data.totalSpentCoin || 0) + amount;
    saveShopData(data);
    return true;
}
if (typeof window !== 'undefined') window.shopAddExternalSpend = shopAddExternalSpend;

function getShopStockRemaining(itemId) {
    var cfg = SHOP_ITEM_PRICES[itemId];
    if (!cfg || !cfg.enabled) return 0;
    if (cfg.stockType === 'none' || cfg.stock === -1) return 9999;
    var data = getShopData();
    var rec = data.purchases[itemId] || { dailyCount: 0, weeklyCount: 0, monthlyCount: 0, totalCount: 0 };
    if (cfg.stockType === 'daily') return Math.max(0, cfg.stock - (rec.dailyCount || 0));
    if (cfg.stockType === 'weekly') return Math.max(0, cfg.stock - (rec.weeklyCount || 0));
    if (cfg.stockType === 'monthly') return Math.max(0, cfg.stock - (rec.monthlyCount || 0));
    if (cfg.stockType === 'total') return Math.max(0, cfg.stock - (rec.totalCount || 0));
    return 9999;
}

// 组合包限购余量
function getShopBundleStockRemaining(bundleId) {
    var cfg = SHOP_BUNDLES[bundleId];
    if (!cfg || !cfg.enabled) return 0;
    if (cfg.stockType === 'none' || cfg.stock === -1) return 9999;
    var data = getShopData();
    var rec = data.purchases['bundle_' + bundleId] || { dailyCount: 0, weeklyCount: 0, monthlyCount: 0, totalCount: 0 };
    if (cfg.stockType === 'daily') return Math.max(0, cfg.stock - (rec.dailyCount || 0));
    if (cfg.stockType === 'weekly') return Math.max(0, cfg.stock - (rec.weeklyCount || 0));
    if (cfg.stockType === 'monthly') return Math.max(0, cfg.stock - (rec.monthlyCount || 0));
    if (cfg.stockType === 'total') return Math.max(0, cfg.stock - (rec.totalCount || 0));
    return 9999;
}

// ==================== 购买 API ====================
// 实际执行购买（仅在确认弹窗点确定后由回调调用）
function _shopExecutePurchaseItem(itemId, qty) {
    var cfg = SHOP_ITEM_PRICES[itemId];
    var wid = _shopResolveWarehouseId(itemId);
    var item = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS[wid] : null;
    var finalPrice = getShopItemFinalPrice(itemId);
    var totalCost = finalPrice * qty;

    var spent = spendPreCoin(totalCost, '商店兑换：' + (item ? item.name : itemId) + ' ×' + qty);
    if (!spent) return false;
    if (typeof warehouseAddItem === 'function') {
        warehouseAddItem(wid, qty, '商店兑换');
    }
    _shopRecordPurchase(itemId, finalPrice, qty);

    if (typeof renderShopUI === 'function') {
        var modal = document.getElementById('shopModal');
        if (modal && modal.style.display === 'flex') renderShopUI();
    }
    return true;
}

// 商店单个商品购买入口：快速可校验部分先过，通过后弹出「确认购买」弹窗
function shopPurchaseItem(itemId, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var cfg = SHOP_ITEM_PRICES[itemId];
    if (!cfg || !cfg.enabled) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '购买失败', message: '商品不存在或已下架' });
        return false;
    }
    var wid = _shopResolveWarehouseId(itemId);
    if (typeof WAREHOUSE_ITEMS === 'undefined' || !WAREHOUSE_ITEMS[wid]) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '购买失败', message: '道具目录中不存在该商品' });
        return false;
    }
    var item = WAREHOUSE_ITEMS[wid];
    if (item.category === 'badge') {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '购买失败', message: '徽章类商品不可在商店购买' });
        return false;
    }
    var remaining = getShopStockRemaining(itemId);
    if (remaining < qty) {
        if (typeof showToast === 'function') {
            var limitMsgMap = { daily: '今日剩余', weekly: '本周剩余', monthly: '本月剩余', total: '总剩余' };
            var limitMsg = (limitMsgMap[cfg.stockType] || '剩余') + '：' + remaining;
            showToast({ type: 'error', title: '超出限购数量', message: limitMsg });
        }
        return false;
    }

    var finalPrice = getShopItemFinalPrice(itemId);
    var totalCost = finalPrice * qty;

    if (typeof spendPreCoin !== 'function') {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '系统错误', message: 'PRE Coin 系统未加载' });
        return false;
    }
    var balance = getPreCoinBalance();
    if (balance < totalCost) {
        showToast({ type: 'error', title: 'PRE Coin 不足', message: '当前余额 ' + balance + '，需要 ' + totalCost });
        return false;
    }

    shopOpenPurchaseConfirm({ kind: 'item', itemId: itemId, qty: qty });
    return true;
}

// 商店单个商品确认：点确定后真正执行购买 → 显示购买成功弹窗
function _shopConfirmPurchaseItem(itemId, qty) {
    var ok = _shopExecutePurchaseItem(itemId, qty);
    if (ok) {
        shopOpenPurchaseSuccess({ kind: 'item', itemId: itemId, qty: qty });
    } else {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '购买失败', message: '购买过程中发生问题，请稍后重试' });
    }
}

// ==================== 全屏弹窗 ====================
// 每次进入商店固定落在「推荐」分类
var _shopActiveCategory = 'recommend';

function ensureShopModal() {
    var modal = document.getElementById('shopModal');
    if (modal) return modal;

    // 注入商店完整样式（自包含 wh-* 基础 + shop-* 扩展 + 暗色 + 响应式）
    if (!document.getElementById('shop-style')) {
        var style = document.createElement('style');
        style.id = 'shop-style';
        style.innerHTML = getShopStyleCSS();
        document.head.appendChild(style);
    }

    modal = document.createElement('div');
    modal.className = 'custom-alert';
    modal.id = 'shopModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="shop-fullscreen">
            <div class="wh-header shop-header">
                <div class="wh-title">
                    <i class="fas fa-store"></i>
                    <h2>商店</h2>
                </div>
                <div class="wh-stats" id="shopStats"></div>
                <button class="wh-close" id="shopCloseBtn" title="关闭"><i class="fas fa-times"></i></button>
            </div>
            <div class="shop-content-outer">
                <div class="shop-layout">
                    <aside class="shop-sidebar" id="shopSidebar"></aside>
                    <div class="shop-main">
                        <div class="shop-main-bar" id="shopMainBar"></div>
                        <div class="wh-content shop-content" id="shopContent"></div>
                    </div>
                </div>
            </div>
            <div class="wh-footer">
                <i class="fas fa-coins" style="color: #f39c12;"></i>
                <span>使用 PRE Coin 兑换商品</span>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#shopCloseBtn').addEventListener('click', closeShopModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeShopModal();
    });

    return modal;
}

function showShopModal() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser || currentUser === '未登录' || currentUser === '') {
        if (typeof showAlert === 'function') showAlert('请先登录账号以使用商店功能');
        return;
    }
    if (typeof dailyTaskMarkProgress === 'function') dailyTaskMarkProgress('shop');

    // 每次打开商店都做一次返还检查（有多重幂等保护，不会重复发邮件）
    _shopRunPriceAdjustmentRefunds();

    var modal = ensureShopModal();
    // 每次进入商店都固定展示「推荐」，并从第一件推荐商品开始
    _shopActiveCategory = 'recommend';
    _shopRecIndex = 0;
    renderShopUI();
    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

function closeShopModal() {
    if (_shopRefreshTimer) { clearInterval(_shopRefreshTimer); _shopRefreshTimer = null; }
    _shopRecCleanup();
    var modal = document.getElementById('shopModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(function() { modal.style.display = 'none'; }, 300);
}

// ==================== 价格调整自动返还（鎏金幻彩 5000 → 3000）====================
// 逻辑：仅执行一次（每用户），在用户登录后首次打开商店 / 首次调用时触发。
// 触发条件：
//   1. 用户通过商店购买过 鎏金幻彩（shopData.purchases['special_sp_bg_liujin'].totalCount > 0）
//   2. 返还金额 = 原价格 5000 − 新价格 3000 = 2000 PRE Coin
// 返还方式：通过邮件系统 addMail 发送一封邮件，附件为 2000 PRE Coin，
//   有效期为「用户此次更新后首次登录日 UTC+8 00:00 起 31 天，截止到最后一天凌晨 04:00」。
// 幂等：检查 / 写入 <username>_shop_refunded_liujin_v1 标记，避免重复发放。
var _shopRefundChecked = false; // 同一页内只跑一次

function _shopRunPriceAdjustmentRefunds() {
    if (_shopRefundChecked) return;
    // 不在这里立即置 true：等 mailSystem 就绪且真的执行完才置，
    // 避免页面加载时 mailSystem 尚未准备好 → 邮件没发成 → showShopModal 备份也被挡掉。

    var username = _shopGetUsername();
    if (!username || username === 'anonymous') { _shopRefundChecked = true; return; }

    var flagKey = username + '_shop_refunded_liujin_v1';
    if (localStorage.getItem(flagKey) === '1') { _shopRefundChecked = true; return; } // 已经执行过

    // 1) 检查购买记录：商店数据里是否有 special_sp_bg_liujin 的购买记录
    var shopData;
    try { shopData = getShopData(); } catch (e) { _shopRefundChecked = true; return; }
    var purchases = shopData && shopData.purchases ? shopData.purchases : {};
    var rec = purchases['special_sp_bg_liujin'];
    var boughtCount = (rec && rec.totalCount) ? rec.totalCount : 0;
    if (boughtCount <= 0) {
        // 没买过 → 也打上标记（没资格领），下次不再跑
        localStorage.setItem(flagKey, '1');
        _shopRefundChecked = true;
        return;
    }

    // 2) 计算返还金额与有效期
    var ORIG_PRICE = 5000, NEW_PRICE = 3000;
    var refundPerUnit = ORIG_PRICE - NEW_PRICE; // 2000
    var refundTotal = refundPerUnit * boughtCount;

    // 有效期：以「用户此刻打开商店」作为此次更新后首次登录时间锚点
    // expireTime = 登录日 UTC+8 00:00 + 30 整天 + 第 31 天凌晨 04:00（UTC 时间戳）
    var now = new Date();
    var now8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    // loginDayStart = 登录当天 UTC+8 00:00 对应的 UTC 时间戳（Date.UTC 返回 UTC 午夜 08:00 UTC+8，需 -8h）
    var loginDayStart = Date.UTC(now8.getUTCFullYear(), now8.getUTCMonth(), now8.getUTCDate()) - 8 * 60 * 60 * 1000;
    expireTimeUTC = loginDayStart + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000;

    // 3) mailSystem 必须就绪才能继续；否则让 showShopModal 下次打开再试
    if (typeof mailSystem === 'undefined' || typeof mailSystem.addMail !== 'function') {
        console.warn('[ShopRefund] mailSystem 未就绪，鎏金幻彩返还邮件暂未发送，下次打开商店将重试');
        return;
    }

    var mailId = 'shop_refund_liujin_v1_' + username;
    // 再次防护：邮箱里若已存在本 id 邮件就不再重复发
    var existing = (typeof mailSystem.getMails === 'function') ? mailSystem.getMails() : [];
    var alreadySent = existing.some(function(m) { return m && m.id === mailId; });
    if (!alreadySent) {
        mailSystem.addMail({
            id: mailId,
            title: '「鎏金幻彩」价格调整及其PRE Coin的返还',
            sender: 'PRE Launcher',
            content: '亲爱的用户：\n\n商店商品「鎏金幻彩」背景因属于静态背景，定价已于本次更新中由原 5000 PRE Coin 调整为 3000 PRE Coin，差额为 2000 PRE Coin / 件。\n\n您曾在商店中购买过该背景（共 ' + boughtCount + ' 件），系统已自动将对应差额 ' + refundTotal + ' PRE Coin 返还至本邮件附件。请在有效期内点击「领取」按钮完成返还。\n\n感谢您的理解与支持！\n\n— PRE Launcher 商店系统',
            attachments: [
                {
                    name: 'PRE Coin 差价返还',
                    type: 'precoin',
                    count: refundTotal
                }
            ],
            mailType: 'reward',
            expireTime: expireTimeUTC
        });
    }

    // 4) 标记已处理，防止下次再跑
    localStorage.setItem(flagKey, '1');
    _shopRefundChecked = true;
}

// 在 DOM ready 之后尽快挂入检查，但要等邮件系统就绪
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(_shopRunPriceAdjustmentRefunds, 800);
        });
    } else {
        setTimeout(_shopRunPriceAdjustmentRefunds, 800);
    }
}

// 促销商品统计（按最终生效折扣判定，含全局促销，供顶栏 tag 使用）
function getShopPromoStats() {
    var tradableIds = Object.keys(SHOP_ITEM_PRICES).filter(function(id) {
        var c = SHOP_ITEM_PRICES[id];
        if (!c.enabled) return false;
        var wid = _shopResolveWarehouseId(id);
        return typeof WAREHOUSE_ITEMS !== 'undefined' && WAREHOUSE_ITEMS[wid];
    });
    var promoCount = tradableIds.filter(function(id) {
        var d = getShopItemEffectiveDiscount(id);
        return d > 0 && d < 100;
    }).length;
    return { total: tradableIds.length, promo: promoCount };
}

// 限购类别（weekly / monthly / total）→ 对应的 stockType 映射
function _shopCatToStockType(catId) {
    return { daily_limit: 'daily', weekly_limit: 'weekly', monthly_limit: 'monthly', total_limit: 'total' }[catId] || null;
}

// 解析 shop itemId 对应的真实仓库道具 ID（支持月度特供等镜像配置）
function _shopResolveWarehouseId(itemId) {
    var cfg = SHOP_ITEM_PRICES[itemId];
    if (!cfg) return itemId;
    return cfg.warehouseId || itemId;
}

// ==================== 特殊商品（背景 / 名片）辅助 ====================
function _shopGetUsername() {
    try {
        return (JSON.parse(localStorage.getItem('currentUser') || '{}').username) || 'anonymous';
    } catch (e) { return 'anonymous'; }
}

// 特殊商品固定售价（不参与任何促销与折扣）
function getShopSpecialPrice(itemId) {
    var cfg = SHOP_SPECIAL_ITEMS[itemId];
    return cfg ? (cfg.price || 0) : 0;
}

// 判断特殊商品是否已拥有（背景：解锁 ID / 旧兑换码 / 邮件领取历史；名片：userProfile.unlockedCardStyles）
function _shopIsSpecialOwned(itemId) {
    var cfg = SHOP_SPECIAL_ITEMS[itemId];
    if (!cfg) return false;
    var username = _shopGetUsername();
    try {
        if (cfg.kind === 'background') {
            var unlockedIds = JSON.parse(localStorage.getItem(username + '_unlockedBackgroundIds') || '[]');
            if (unlockedIds.indexOf(cfg.targetId) !== -1) return true;
            // 兼容旧存储键：动态流光曾通过测试兑换码解锁
            if (cfg.targetId === 'dynamic-bg-1' && localStorage.getItem(username + '_unlockedBackgrounds') === 'true') return true;
            if (cfg.unlockSource) {
                var history = JSON.parse(localStorage.getItem(username + '_mailHistory') || '[]');
                if (history.some(function(item) { return item.id === cfg.unlockSource; })) return true;
            }
            return false;
        }
        if (cfg.kind === 'namecard') {
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var foundUser = users.find(function(u) { return u.username === username; });
            if (foundUser && foundUser.userProfile && foundUser.userProfile.unlockedCardStyles) {
                return foundUser.userProfile.unlockedCardStyles.indexOf(cfg.targetId) !== -1;
            }
        }
    } catch (e) {}
    return false;
}

// 判断特殊商品是否被进行中的活动锁定（活动签到奖励包含对应背景 / 名片，且活动未结束、未下线）
// 活动结束后（endTime 到点自动迁移 status）或下线后（活动移除 / status 手动置为 ended）自动解除锁定
function _shopIsSpecialBlockedByEvent(itemId) {
    var cfg = SHOP_SPECIAL_ITEMS[itemId];
    if (!cfg) return false;
    if (typeof eventCenterData === 'undefined' || !eventCenterData.events) return false;
    var wantType = cfg.kind === 'background' ? 'background3d' : 'cardStyle';
    for (var i = 0; i < eventCenterData.events.length; i++) {
        var evt = eventCenterData.events[i];
        // 已结束 / 已下线的活动不锁定；upcoming（未开始）与 active（进行中）均锁定
        if (!evt || evt.status === 'ended' || !evt.hasCheckin) continue;
        var rewards = (typeof getCheckinRewards === 'function') ? getCheckinRewards(evt.id) : null;
        if (!rewards) continue;
        var hit = rewards.some(function(r) {
            return r && r.type === wantType && r.value === cfg.targetId;
        });
        if (hit) return true;
    }
    return false;
}

// 判断某背景 / 名片当前是否正在商店售卖中（已上架且未被活动锁定，不含已拥有判断）
// 供系统设置（背景 / 名片样式弹窗）等外部模块查询解锁提示使用
function isShopSpecialOnSale(kind, targetId) {
    var ids = Object.keys(SHOP_SPECIAL_ITEMS);
    for (var i = 0; i < ids.length; i++) {
        var cfg = SHOP_SPECIAL_ITEMS[ids[i]];
        if (cfg.enabled && cfg.kind === kind && cfg.targetId === targetId) {
            return !_shopIsSpecialBlockedByEvent(ids[i]);
        }
    }
    return false;
}

// 购买后解锁背景（写入 <username>_unlockedBackgroundIds，与系统设置预设背景联动）
function _shopUnlockBackground(bgId) {
    try {
        var username = _shopGetUsername();
        var unlockedIds = JSON.parse(localStorage.getItem(username + '_unlockedBackgroundIds') || '[]');
        if (unlockedIds.indexOf(bgId) === -1) {
            unlockedIds.push(bgId);
            localStorage.setItem(username + '_unlockedBackgroundIds', JSON.stringify(unlockedIds));
        }
    } catch (e) {}
}

// 购买后解锁名片样式（写入 registeredUsers.userProfile.unlockedCardStyles，与名片样式弹窗联动）
function _shopUnlockCardStyle(styleId) {
    try {
        var username = _shopGetUsername();
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var foundUser = users.find(function(u) { return u.username === username; });
        if (foundUser) {
            if (!foundUser.userProfile) foundUser.userProfile = {};
            if (!foundUser.userProfile.unlockedCardStyles) foundUser.userProfile.unlockedCardStyles = [];
            if (foundUser.userProfile.unlockedCardStyles.indexOf(styleId) === -1) {
                foundUser.userProfile.unlockedCardStyles.push(styleId);
                localStorage.setItem('registeredUsers', JSON.stringify(users));
            }
        }
    } catch (e) {}
}

// 背景卡片点击预览（复用邮件附件预览查看器）
function shopOpenSpecialBackgroundPreview(itemId) {
    var cfg = SHOP_SPECIAL_ITEMS[itemId];
    if (!cfg || !cfg.preview) return;
    if (typeof openBackgroundPreview === 'function') {
        openBackgroundPreview(cfg.preview);
    } else if (typeof showAlert === 'function') {
        showAlert('预览功能暂不可用');
    }
}

// 特殊商品实际执行购买（仅确认弹窗点确定后由回调调用）
function _shopExecutePurchaseSpecialItem(itemId) {
    var cfg = SHOP_SPECIAL_ITEMS[itemId];
    var price = getShopSpecialPrice(itemId);
    var spent = spendPreCoin(price, '商店购买：' + cfg.name);
    if (!spent) return false;

    if (cfg.kind === 'background') {
        _shopUnlockBackground(cfg.targetId);
    } else {
        _shopUnlockCardStyle(cfg.targetId);
    }
    _shopRecordPurchase('special_' + itemId, price, 1);

    var modal = document.getElementById('shopModal');
    if (modal && modal.style.display === 'flex') renderShopUI();
    return true;
}

// 特殊商品购买入口（背景 / 名片样式）：快速校验后弹出确认弹窗
function shopPurchaseSpecialItem(itemId) {
    var cfg = SHOP_SPECIAL_ITEMS[itemId];
    if (!cfg || !cfg.enabled) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '购买失败', message: '商品不存在或已下架' });
        return false;
    }
    if (_shopIsSpecialOwned(itemId)) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '已拥有或已售罄', message: '您已拥有该' + (cfg.kind === 'background' ? '背景' : '名片样式') + '，无法重复购买' });
        return false;
    }
    if (_shopIsSpecialBlockedByEvent(itemId)) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '暂未开放售卖', message: '包含该' + (cfg.kind === 'background' ? '背景' : '名片样式') + '的活动正在进行中，请通过活动获取，活动结束后开放购买' });
        return false;
    }
    if (typeof spendPreCoin !== 'function' || typeof getPreCoinBalance !== 'function') {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '系统错误', message: 'PRE Coin 系统未加载' });
        return false;
    }
    var price = getShopSpecialPrice(itemId);
    var balance = getPreCoinBalance();
    if (balance < price) {
        showToast({ type: 'error', title: 'PRE Coin 不足', message: '当前余额 ' + balance + '，需要 ' + price });
        return false;
    }

    shopOpenPurchaseConfirm({ kind: 'special', specialId: itemId });
    return true;
}

// 特殊商品确认：点确定后真正执行 → 显示购买成功弹窗
function _shopConfirmPurchaseSpecialItem(itemId) {
    var ok = _shopExecutePurchaseSpecialItem(itemId);
    if (ok) {
        shopOpenPurchaseSuccess({ kind: 'special', specialId: itemId });
    } else {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '购买失败', message: '购买过程中发生问题，请稍后重试' });
    }
}

// ==================== PRE 月卡购买 ====================
// 月卡购买入口：校验上限与余额后弹出统一的「确认购买」弹窗
function shopPurchaseMonthlyCard() {
    var cfg = PRE_MONTHLY_CARD;
    if (typeof spendPreCoin !== 'function' || typeof getPreCoinBalance !== 'function') {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '系统错误', message: 'PRE Coin 系统未加载' });
        return false;
    }
    if (!canPurchaseMonthlyCard()) {
        if (typeof showToast === 'function') {
            showToast({ type: 'error', title: '已达购买上限', message: '月卡最多同时持有 ' + cfg.maxDays + ' 天，请等待当前月卡消耗 30 天后再购买' });
        }
        return false;
    }
    var balance = getPreCoinBalance();
    if (balance < cfg.price) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: 'PRE Coin 不足', message: '当前余额 ' + balance + '，需要 ' + cfg.price });
        return false;
    }
    shopOpenPurchaseConfirm({ kind: 'monthly' });
    return true;
}

// 月卡实际执行购买（仅在确认弹窗点确定后调用）
function _shopExecutePurchaseMonthlyCard() {
    var cfg = PRE_MONTHLY_CARD;
    if (!canPurchaseMonthlyCard()) return false;
    var spent = spendPreCoin(cfg.price, '商店购买：' + cfg.name + '（30 天）');
    if (!spent) return false;

    var state = getMonthlyCardState();
    var now = Date.now();
    var lastEnd = now;
    state.cards.forEach(function(c) { if (c.endTime > lastEnd) lastEnd = c.endTime; });
    var startTime = lastEnd;
    var endTime = startTime + cfg.days * _MONTHLY_CARD_MS_PER_DAY;
    state.cards.push({ id: 'mc_' + now + '_' + (state.cards.length + 1), purchaseTime: now, startTime: startTime, endTime: endTime });
    state.totalPurchased = (state.totalPurchased || 0) + 1;
    state.lastPurchaseTime = now;
    saveMonthlyCardState(state);

    _shopRecordPurchase('monthly_card', cfg.price, 1);

    // 购买后立即发放当天的月卡邮件（防止首日奖励漏发）
    if (typeof checkMonthlyCardDailyMail === 'function') {
        try { checkMonthlyCardDailyMail(); } catch (e) {}
    }

    var modal = document.getElementById('shopModal');
    if (modal && modal.style.display === 'flex') renderShopUI();
    return true;
}

// 月卡确认购买：执行成功后弹出统一的购买成功弹窗
function _shopConfirmPurchaseMonthlyCard() {
    var ok = _shopExecutePurchaseMonthlyCard();
    if (ok) {
        shopOpenPurchaseSuccess({ kind: 'monthly' });
    } else {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '购买失败', message: '购买过程中发生问题，请稍后重试' });
    }
}

// ★ 统一的类别过滤：返回 { singles: [itemIds], bundles: [bundleIds], specials: [specialIds] }
//   singles → 已排序好的 itemId 列表（同现有稀有度+价格排序）
//   bundles → 已排序好的 bundleId 列表
//   specials → 特殊商品（背景 / 名片）specialId 列表（仅背景 / 名片分类返回）
//   对于限购类别（weekly/monthly/total）同时包含 singles 和 bundles
function _shopFilterByCategory(catId) {
    var stockType = _shopCatToStockType(catId);
    var rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };

    // —— specials（背景 / 名片特殊商品）——
    var specials = [];
    if (catId === 'background' || catId === 'namecard') {
        specials = Object.keys(SHOP_SPECIAL_ITEMS).filter(function(id) {
            var cfg = SHOP_SPECIAL_ITEMS[id];
            return cfg.enabled && cfg.kind === catId;
        });
    }

    // —— singles ——
    var singles = Object.keys(SHOP_ITEM_PRICES).filter(function(id) {
        var cfg = SHOP_ITEM_PRICES[id];
        if (!cfg.enabled) return false;
        var wid = _shopResolveWarehouseId(id);
        if (typeof WAREHOUSE_ITEMS === 'undefined' || !WAREHOUSE_ITEMS[wid]) return false;
        if (stockType !== null) return cfg.stockType === stockType;
        if (catId === 'all') return true;
        if (catId === 'bundle') return false; // bundle tab 不卖单个
        return WAREHOUSE_ITEMS[wid].category === catId;
    });
    singles.sort(function(a, b) {
        var ia = WAREHOUSE_ITEMS[_shopResolveWarehouseId(a)], ib = WAREHOUSE_ITEMS[_shopResolveWarehouseId(b)];
        var ra = rarityOrder[ia.rarity] !== undefined ? rarityOrder[ia.rarity] : 4;
        var rb = rarityOrder[ib.rarity] !== undefined ? rarityOrder[ib.rarity] : 4;
        if (ra !== rb) return ra - rb;
        return getShopItemFinalPrice(a) - getShopItemFinalPrice(b);
    });

    // —— bundles ——
    var bundles = Object.keys(SHOP_BUNDLES).filter(function(id) {
        var cfg = SHOP_BUNDLES[id];
        if (!cfg.enabled) return false;
        if (catId === 'bundle') return true;
        // 限购类别：包含匹配 stockType 的 bundle（weekly / monthly / total 才支持）
        if (catId === 'weekly_limit' || catId === 'monthly_limit' || catId === 'total_limit') {
            return cfg.stockType === stockType;
        }
        return false;
    });
    bundles.sort(function(a, b) {
        return getShopBundleFinalPrice(a) - getShopBundleFinalPrice(b);
    });

    return { singles: singles, bundles: bundles, specials: specials };
}

// ★ 按仓库分类分组渲染 singles（与仓库「全部视图」一致：分类标题 + 数量 + 虚线隔断）
//   仅当存在多个分类时才插入 .wh-cat-divider；复用仓库的 .wh-cat-header / .wh-cat-count / .wh-cat-divider 样式
function _shopRenderSinglesGroupedByCategory(singles) {
    if (!singles || singles.length === 0) return '';
    var groups = {};
    singles.forEach(function(id) {
        var wid = _shopResolveWarehouseId(id);
        var cat = (typeof WAREHOUSE_ITEMS !== 'undefined' && WAREHOUSE_ITEMS[wid] && WAREHOUSE_ITEMS[wid].category) || 'other';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(id);
    });
    var order = (typeof WAREHOUSE_CATEGORY_ORDER !== 'undefined') ? WAREHOUSE_CATEGORY_ORDER.slice() : ['consumable', 'material', 'badge'];
    var ordered = order.filter(function(c) { return groups[c] && groups[c].length > 0; });
    Object.keys(groups).forEach(function(c) { if (ordered.indexOf(c) < 0) ordered.push(c); });
    var meta = (typeof WAREHOUSE_CATEGORY_META !== 'undefined') ? WAREHOUSE_CATEGORY_META : {};
    return ordered.map(function(cat, idx) {
        var m = meta[cat] || { name: (typeof getWarehouseCategoryLabel === 'function' ? getWarehouseCategoryLabel(cat) : cat), icon: 'fas fa-cube' };
        var list = groups[cat];
        var html = '<div class="shop-cat-group">' +
            '<div class="wh-cat-header"><i class="' + m.icon + '"></i><span class="wh-cat-name">' + m.name + '</span><em class="wh-cat-count">' + list.length + '</em></div>' +
            '<div class="shop-grid">' + list.map(function(id) { return buildShopCardHTML(id); }).join('') + '</div>' +
            '</div>';
        if (idx < ordered.length - 1) html += '<div class="wh-cat-divider"></div>';
        return html;
    }).join('');
}

// 格式化促销时间戳为 UTC+8 紧凑展示（MM-DD HH:mm）
function _shopFormatPromoTime(ts) {
    var d = new Date(ts + 8 * 60 * 60 * 1000);
    var p2 = function(n) { return (n < 10 ? '0' : '') + n; };
    return p2(d.getUTCMonth() + 1) + '-' + p2(d.getUTCDate()) + ' ' + p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes());
}

// ==================== 库存刷新倒计时 ====================
// 下次库存刷新时间戳：每日 04:00（UTC+8）重置每日限购库存（周一 04:00 同时重置每周限购，1 日 04:00 重置每月限购）
function _shopGetNextStockResetTs() {
    var now8 = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
    var next = Date.UTC(now8.getUTCFullYear(), now8.getUTCMonth(), now8.getUTCDate(), 4, 0, 0);
    if (next <= now8.getTime()) next += 24 * 60 * 60 * 1000;
    return next - 8 * 60 * 60 * 1000; // 转回真实 UTC 时间戳
}

// 格式化库存刷新倒计时（HH:MM:SS，剩余不足一天）
function _shopFormatRefreshCountdown(ms) {
    if (ms < 0) ms = 0;
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    var p2 = function(n) { return (n < 10 ? '0' : '') + n; };
    return p2(h) + ':' + p2(m) + ':' + p2(sec);
}

var _shopRefreshTimer = null;

// 启动顶栏库存刷新倒计时（每秒更新；重复调用会先清理旧定时器）
function _shopStartStockRefreshCountdown() {
    if (_shopRefreshTimer) { clearInterval(_shopRefreshTimer); _shopRefreshTimer = null; }
    var update = function() {
        var el = document.querySelector('#shopStockRefreshTag .shop-refresh-countdown');
        if (!el) return;
        el.textContent = _shopFormatRefreshCountdown(_shopGetNextStockResetTs() - Date.now());
    };
    update();
    _shopRefreshTimer = setInterval(update, 1000);
}

// 渲染左侧竖向分类侧边栏（含分类计数徽标 / 组合包隔离线）+ 主区顶部信息条（计数 / dev 按钮）
function renderShopToolbar() {
    var sidebar = document.getElementById('shopSidebar');
    var mainBar = document.getElementById('shopMainBar');
    if (!sidebar) return;

    // —— 侧边栏：分类导航（每项附带在售数量徽标）——
    var recEntries = _shopGetRecommendEntries();
    var tabsHtml = SHOP_CATEGORIES.map(function(cat) {
        var catCount;
        if (cat.id === 'recommend') {
            catCount = recEntries.length;
        } else if (cat.id === 'monthly_card') {
            // 月卡条目显示当前剩余天数（未激活时显示 NEW）
            var mcDays = getMonthlyCardRemainingDays();
            catCount = mcDays > 0 ? mcDays + '天' : 'NEW';
        } else {
            var fc2 = _shopFilterByCategory(cat.id);
            catCount = fc2.singles.length + fc2.bundles.length + (fc2.specials ? fc2.specials.length : 0);
        }
        var sep = cat.separator ? '<div class="shop-side-sep"></div>' : '';
        var isRecommend = cat.id === 'recommend';
        var isMonthly = cat.id === 'monthly_card';
        var html = sep + '<button class="shop-side-item' + (isRecommend ? ' shop-side-recommend' : '') +
            (cat.id === _shopActiveCategory ? ' active' : '') + '" data-cat="' + cat.id + '">' +
            '<i class="' + cat.icon + '"></i><span class="shop-side-name">' + cat.name + '</span>' +
            '<em class="shop-side-count' + (isMonthly && catCount !== 'NEW' ? ' shop-side-count-days' : '') + '">' + catCount + '</em></button>';
        // 「推荐」作为独立精选入口，与下方商品分类之间加一条分隔线
        if (isRecommend) html += '<div class="shop-side-sep"></div>';
        return html;
    }).join('');
    sidebar.innerHTML = '<div class="shop-side-title"><i class="fas fa-bars-staggered"></i> 商品分类</div>' + tabsHtml;

    sidebar.querySelectorAll('.shop-side-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
            _shopActiveCategory = btn.getAttribute('data-cat');
            renderShopToolbar();
            renderShopUI();
        });
    });

    // —— 主区顶部信息条：当前分类在售计数 + dev 按钮 ——
    if (mainBar) {
        // 动态计数：按当前类别过滤 singles + bundles + specials（背景/名片）
        var fc = _shopFilterByCategory(_shopActiveCategory);
        var singleCount = fc.singles.length + (fc.specials ? fc.specials.length : 0);
        var hasS = singleCount > 0, hasB = fc.bundles.length > 0;
        var countHtml;
        if (_shopActiveCategory === 'recommend') {
            countHtml = '<span class="shop-item-count shop-rec-count"><i class="fas fa-thumbs-up"></i> 精选推荐 <b>' + recEntries.length + '</b> 款</span>';
        } else if (_shopActiveCategory === 'monthly_card') {
            var mcRemainDays = getMonthlyCardRemainingDays();
            countHtml = mcRemainDays > 0
                ? '<span class="shop-item-count shop-mc-bar-tag"><i class="fas fa-hourglass-half"></i> 月卡剩余 <b>' + mcRemainDays + '</b> 天</span>'
                : '<span class="shop-item-count"><i class="fas fa-id-card"></i> 月卡未激活</span>';
        } else if (_shopActiveCategory === 'bundle') {
            countHtml = '<span class="shop-item-count"><i class="fas fa-gift"></i> 在售组合包 <b>' + fc.bundles.length + '</b> 款</span>';
        } else if (hasS && hasB) {
            countHtml = '<span class="shop-item-count"><i class="fas fa-tag"></i> 在售商品 <b>' + singleCount + '</b> 款、组合包 <b>' + fc.bundles.length + '</b> 款</span>';
        } else if (hasB) {
            countHtml = '<span class="shop-item-count"><i class="fas fa-gift"></i> 在售组合包 <b>' + fc.bundles.length + '</b> 款</span>';
        } else {
            countHtml = '<span class="shop-item-count"><i class="fas fa-tag"></i> 在售商品 <b>' + singleCount + '</b> 款</span>';
        }

        // 当前分类名称回显
        var activeCat = SHOP_CATEGORIES.filter(function(c) { return c.id === _shopActiveCategory; })[0];
        var catTitleHtml = activeCat
            ? '<span class="shop-main-cat"><i class="' + activeCat.icon + '"></i> ' + activeCat.name + '</span>'
            : '';

        // 开发者模式按钮：获取 PRE Coin / 重置购买状态
        var devBtnHtml = isShopDevMode()
            ? '<button class="shop-dev-btn" id="shopDevCoinBtn" title="调整 PRE Coin 持有数量"><i class="fas fa-coins"></i> 获取PRE Coin（dev）</button>'
            : '';
        var devResetBtnHtml = isShopDevMode()
            ? '<button class="shop-dev-btn" id="shopDevResetBtn" title="重置所有物品/组合包的购买状态"><i class="fas fa-rotate-left"></i> 重置购买状态（dev）</button>'
            : '';

        mainBar.innerHTML = catTitleHtml +
            '<span class="shop-toolbar-right">' + countHtml + devBtnHtml + devResetBtnHtml + '</span>';

        var devBtn = document.getElementById('shopDevCoinBtn');
        if (devBtn) {
            devBtn.addEventListener('click', openShopDevCoinModal);
        }

        var devResetBtn = document.getElementById('shopDevResetBtn');
        if (devResetBtn) {
            devResetBtn.addEventListener('click', openShopDevResetModal);
        }
    }
}

// ==================== 开发者模式：重置购买状态弹窗 ====================
function openShopDevResetModal() {
    if (!isShopDevMode()) return;

    var existing = document.getElementById('shopDevResetModal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.className = 'custom-alert';
    modal.id = 'shopDevResetModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="shop-devcoin-box">
            <div class="shop-devcoin-title"><i class="fas fa-rotate-left"></i> 重置购买状态 (Dev)</div>
            <div class="shop-devcoin-info">
                是否要重置商店内所有物品/组合包的购买状态？<br>确定后将立即生效
            </div>
            <div class="shop-devcoin-actions">
                <button id="shopDevResetCancel">取消</button>
                <button id="shopDevResetOk" class="shop-devcoin-primary"><i class="fas fa-check"></i> 确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#shopDevResetOk').addEventListener('click', function() {
        var data = getShopData();
        // 恢复所有物品/组合包的购买次数至初始未购买状态（限购配置保持不变）
        data.purchases = {};
        data.totalSpentCoin = 0;
        data.totalPurchased = 0;
        saveShopData(data);

        if (typeof showToast === 'function') {
            showToast({ type: 'success', title: '重置购买状态', message: '所有物品/组合包已恢复至未购买的初始状态' });
        }
        closeShopDevResetModal();
        renderShopUI();
    });
    modal.querySelector('#shopDevResetCancel').addEventListener('click', closeShopDevResetModal);

    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}
function closeShopDevResetModal() {
    var m = document.getElementById('shopDevResetModal');
    if (!m) return;
    m.classList.remove('show');
    setTimeout(function() { if (m.parentNode) m.parentNode.removeChild(m); }, 250);
}

// ==================== 开发者模式：PRE Coin 调整弹窗 ====================
function openShopDevCoinModal() {
    if (!isShopDevMode()) return;
    var current = typeof getPreCoinBalance === 'function' ? getPreCoinBalance() : 0;

    var existing = document.getElementById('shopDevCoinModal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.className = 'custom-alert';
    modal.id = 'shopDevCoinModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="shop-devcoin-box">
            <div class="shop-devcoin-title"><i class="fas fa-coins"></i> 调整 PRE Coin 持有数量 (Dev)</div>
            <div class="shop-devcoin-info">
                当前余额：<b class="shop-devcoin-current">${current.toLocaleString()}</b> PRE Coin
            </div>
            <div class="shop-devcoin-row">
                <label>目标数量（0 ~ 99,999,999）</label>
                <input type="number" id="shopDevCoinInput" min="0" max="99999999" value="${current}" step="1">
            </div>
            <div class="shop-devcoin-row">
                <label>快捷操作</label>
                <div class="shop-devcoin-quick">
                    <button data-add="10000">+10,000</button>
                    <button data-add="100000">+100,000</button>
                    <button data-add="1000000">+1,000,000</button>
                    <button data-add="0" data-set="true">归零</button>
                </div>
            </div>
            <div class="shop-devcoin-actions">
                <button id="shopDevCoinCancel">取消</button>
                <button id="shopDevCoinOk" class="shop-devcoin-primary"><i class="fas fa-check"></i> 确定应用</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    var input = modal.querySelector('#shopDevCoinInput');
    var apply = function() {
        var raw = parseInt(input.value, 10);
        if (isNaN(raw) || raw < 0) raw = 0;
        if (raw > 99999999) raw = 99999999;
        raw = Math.floor(raw);

        var diff = raw - current;
        if (diff === 0) {
            closeShopDevCoinModal();
            return;
        }
        // 清掉历史，直接 set 到目标值
        var data = JSON.parse(localStorage.getItem('precoin_' + (JSON.parse(localStorage.getItem('currentUser') || '{}').username || 'anonymous')) || '{"version":1,"balance":0,"totalEarned":0,"totalSpent":0,"history":[]}');
        data.balance = raw;
        if (raw > current) {
            data.totalEarned += (raw - current);
        } else {
            data.totalSpent += (current - raw);
        }
        data.history = data.history || [];
        data.history.push({ type: 'dev_set', amount: diff, source: 'dev 模式直接调整为 ' + raw, timestamp: new Date().toISOString() });
        if (data.history.length > 200) data.history = data.history.slice(-200);
        localStorage.setItem('precoin_' + (JSON.parse(localStorage.getItem('currentUser') || '{}').username || 'anonymous'), JSON.stringify(data));

        if (typeof showToast === 'function') {
            showToast({ type: 'success', title: 'PRE Coin', message: '已调整为 ' + raw.toLocaleString() + ' PRE' });
        }
        closeShopDevCoinModal();
        renderShopUI();
    };

    modal.querySelector('#shopDevCoinOk').addEventListener('click', apply);
    modal.querySelector('#shopDevCoinCancel').addEventListener('click', closeShopDevCoinModal);
    modal.querySelectorAll('.shop-devcoin-quick button').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var add = parseInt(btn.getAttribute('data-add'), 10);
            var isSet = btn.getAttribute('data-set') === 'true';
            if (isSet) {
                input.value = 0;
            } else {
                input.value = Math.min(99999999, Math.max(0, (parseInt(input.value, 10) || 0) + add));
            }
        });
    });

    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}
function closeShopDevCoinModal() {
    var m = document.getElementById('shopDevCoinModal');
    if (!m) return;
    m.classList.remove('show');
    setTimeout(function() { if (m.parentNode) m.parentNode.removeChild(m); }, 250);
}

// 渲染商品列表
function renderShopUI() {
    var content = document.getElementById('shopContent');
    var statsEl = document.getElementById('shopStats');
    if (!content) return;

    _shopRecCleanup();
    content.classList.remove('shop-content-rec');
    renderShopToolbar();

    var coinBalance = typeof getPreCoinBalance === 'function' ? getPreCoinBalance() : 0;
    var shopData = getShopData();
    if (statsEl) {
        // 大促时间 tag（全局促销配置启用时显示，位于 PRE 余额左侧）
        var promoPeriodHtml = '';
        var promoItemsHtml = '';
        var p = SHOP_GLOBAL_PROMO;
        if (p && p.enabled && (p.discount || 0) > 0) {
            var sTs = _shopParsePromoTime(p.start);
            var eTs = _shopParsePromoTime(p.end);
            var sTxt = sTs !== null ? _shopFormatPromoTime(sTs) : '不限';
            var eTxt = eTs !== null ? _shopFormatPromoTime(eTs) : '不限';
            var activeNow = isShopGlobalPromoActive();
            // 促销状态：未开始 / 进行中 / 已结束
            var promoStateTxt = activeNow ? '进行中'
                : ((sTs !== null && Date.now() < sTs) ? '未开始' : '已结束');
            promoPeriodHtml = '<span class="wh-stat shop-promo-period-tag' + (activeNow ? '' : ' shop-promo-pending') + '"' +
                ' title="全场促销 -' + p.discount + '%：' + sTxt + ' ~ ' + eTxt + '（UTC+8，' + promoStateTxt + '）">' +
                '<i class="fas fa-bullhorn"></i> 促销时间 ' + sTxt + ' ~ ' + eTxt +
                '<span class="shop-promo-state">· ' + promoStateTxt + '</span></span>';
        }

        // 促销商品统计 tag（紧随大促时间 tag 右侧，有促销商品时显示）
        var ps = getShopPromoStats();
        if (ps.promo > 0) {
            promoItemsHtml = (ps.promo >= ps.total)
                ? '<span class="shop-promo-tag shop-promo-all"><i class="fas fa-fire"></i> 所有物品正在进行促销</span>'
                : '<span class="shop-promo-tag"><i class="fas fa-tags"></i> 当前有 ' + ps.promo + ' 款物品正在进行促销</span>';
        }

        // 库存刷新倒计时 tag（PRE Coin 余额左侧）
        var stockRefreshHtml = '<span class="shop-stock-refresh-tag" id="shopStockRefreshTag"' +
            ' title="每日 04:00（UTC+8）刷新所有每日限购库存；每周一 04:00 额外重置每周限购；每月 1 号 04:00 重置每月限购">' +
            '<i class="fas fa-hourglass-half"></i> 距离下次刷新库存时间剩余：<b class="shop-refresh-countdown">--:--:--</b></span>';

        statsEl.innerHTML =
            promoPeriodHtml +
            promoItemsHtml +
            stockRefreshHtml +
            '<span class="wh-stat"><i class="fas fa-wallet"></i> PRE Coin 余额 <b>' + formatPreCoin(coinBalance) + '</b></span>' +
            '<span class="wh-stat"><i class="fas fa-shopping-cart"></i> 累计消费 <b>' + formatPreCoin(shopData.totalSpentCoin) + '</b> PRE Coin</span>' +
            '<span class="wh-stat"><i class="fas fa-receipt"></i> 累计购买 <b>' + shopData.totalPurchased + '</b> 件</span>';

        _shopStartStockRefreshCountdown();
    }

    // ★ 「推荐」为独立精选轮播视图，不参与普通分类过滤
    if (_shopActiveCategory === 'recommend') {
        _shopRenderRecommendView(content);
        return;
    }

    // ★ PRE 月卡为独立订阅视图，整块内容区展示月卡信息
    if (_shopActiveCategory === 'monthly_card') {
        _shopRenderMonthlyCardView(content);
        return;
    }

    // ★ 统一过滤（singles + bundles + specials）
    var fc = _shopFilterByCategory(_shopActiveCategory);
    var singles = fc.singles;
    var bundles = fc.bundles;
    var specials = fc.specials || [];
    var hasS = singles.length > 0;
    var hasB = bundles.length > 0;
    var hasSp = specials.length > 0;

    if (!hasS && !hasB && !hasSp) {
        content.innerHTML =
            '<div class="wh-empty"><i class="fas fa-store-slash"></i><p>暂无在售商品</p><span>该分类下暂无可购买的商品或组合包</span></div>';
        return;
    }

    // —— 渲染逻辑：
    // ・只有 singles：直接渲染 singles（「全部商品」按仓库分类分组，含分类标题 + 虚线隔断）
    // ・只有 bundles：直接渲染 bundles（复用 bundle 卡片）
    // ・两者都有：分成两个 subsection（单独售卖 / 组合包），中间用仓库同款虚线隔断
    // ・只有 specials（背景 / 名片分类）：渲染特殊商品卡片（背景卡片点击可预览）
    var html = '';
    if (hasS && hasB) {
        // subsection: singles
        html += '<div class="shop-subsection">';
        html += '<div class="shop-subsection-title"><i class="fas fa-tag"></i> 单独售卖 <span class="shop-subsection-count">' + singles.length + ' 款</span></div>';
        html += '<div class="shop-grid">' + singles.map(function(id) { return buildShopCardHTML(id); }).join('') + '</div>';
        html += '</div>';
        // 仓库同款虚线隔断（separate 单独售卖 / 组合包）
        html += '<div class="wh-cat-divider"></div>';
        // subsection: bundles
        html += '<div class="shop-subsection">';
        html += '<div class="shop-subsection-title"><i class="fas fa-gift"></i> 组合包 <span class="shop-subsection-count">' + bundles.length + ' 款</span></div>';
        html += '<div class="shop-grid">' + bundles.map(function(id) { return buildShopBundleCardHTML(id); }).join('') + '</div>';
        html += '</div>';
    } else if (hasB) {
        // 纯 bundle 分类（bundle tab 或刚好该限购类别无 singles 只有 bundle）
        html += '<div class="shop-grid">' + bundles.map(function(id) { return buildShopBundleCardHTML(id); }).join('') + '</div>';
    } else if (hasSp) {
        // 背景 / 名片特殊商品分类
        html += '<div class="shop-grid">' + specials.map(function(id) { return buildShopSpecialCardHTML(id); }).join('') + '</div>';
    } else {
        // 纯 singles 分类
        if (_shopActiveCategory === 'all') {
            // 「全部商品」：按仓库分类分组渲染（分类标题 + 数量 + 虚线隔断）
            html += _shopRenderSinglesGroupedByCategory(singles);
        } else {
            html += '<div class="shop-grid">' + singles.map(function(id) { return buildShopCardHTML(id); }).join('') + '</div>';
        }
    }

    content.innerHTML = html;

    // —— 绑定事件（singles，排除特殊商品购买按钮与组合包购买按钮）
    content.querySelectorAll('.shop-buy-btn:not(.shop-special-buy):not(.shop-bundle-buy)').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var id = btn.getAttribute('data-id');
            var qtyInput = document.getElementById('shopQty_' + id);
            var qty = 1;
            if (qtyInput) qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
            shopPurchaseItem(id, qty);
        });
    });

    // 可购买物品卡 ± 步进：单击一次一步，长按可快速批量增减（bindHoldRepeat 由 warehouse.js 提供）
    content.querySelectorAll('.shop-qty-minus').forEach(function(btn) {
        var id = btn.getAttribute('data-id');
        var step = function() {
            var input = document.getElementById('shopQty_' + id);
            if (!input) return;
            input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
            _shopUpdateTotalPrice(id, input.value);
        };
        if (typeof window.bindHoldRepeat === 'function') {
            window.bindHoldRepeat(btn, step, { stopPropagation: true });
        } else {
            btn.addEventListener('click', function(e) { e.stopPropagation(); step(); });
        }
    });
    content.querySelectorAll('.shop-qty-plus').forEach(function(btn) {
        var id = btn.getAttribute('data-id');
        var step = function() {
            var input = document.getElementById('shopQty_' + id);
            var maxV = Math.min(99, getShopStockRemaining(id));
            if (!input) return;
            input.value = Math.min(maxV, (parseInt(input.value, 10) || 1) + 1);
            _shopUpdateTotalPrice(id, input.value);
        };
        if (typeof window.bindHoldRepeat === 'function') {
            window.bindHoldRepeat(btn, step, { stopPropagation: true });
        } else {
            btn.addEventListener('click', function(e) { e.stopPropagation(); step(); });
        }
    });
    content.querySelectorAll('.shop-qty-input').forEach(function(input) {
        input.addEventListener('change', function() {
            var id = input.getAttribute('data-id');
            var maxV = Math.min(99, getShopStockRemaining(id));
            input.value = Math.max(1, Math.min(maxV, parseInt(input.value, 10) || 1));
            _shopUpdateTotalPrice(id, input.value);
        });
    });

    // —— 绑定事件（bundles，当限购类别混排时 inline 渲染的 bundle 卡片）
    content.querySelectorAll('.shop-bundle-card').forEach(function(card) {
        card.addEventListener('click', function() { openShopBundleModal(card.getAttribute('data-id')); });
    });
    content.querySelectorAll('.shop-bundle-buy').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            shopPurchaseBundle(btn.getAttribute('data-id'));
        });
    });
    content.querySelectorAll('.shop-bundle-open').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            openShopBundleModal(btn.getAttribute('data-id'));
        });
    });

    // —— 绑定事件（特殊商品：背景 / 名片）
    content.querySelectorAll('.shop-special-buy').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            shopPurchaseSpecialItem(btn.getAttribute('data-id'));
        });
    });
    content.querySelectorAll('.shop-special-card').forEach(function(card) {
        // 仅背景卡片支持点击整卡预览（名片无预览）
        if (card.getAttribute('data-kind') === 'background') {
            card.addEventListener('click', function() {
                shopOpenSpecialBackgroundPreview(card.getAttribute('data-id'));
            });
        }
    });
}

// ==================== PRE 月卡视图 ====================
function _shopMonthlyRewardMeta(r) {
    if (r.type === 'precoin') {
        return { name: r.name || 'PRE Coin', icon: r.icon || 'fas fa-coins', color: r.color || '#f39c12', count: r.count || 0 };
    }
    var it = (typeof WAREHOUSE_ITEMS !== 'undefined' && WAREHOUSE_ITEMS[r.itemId]) ? WAREHOUSE_ITEMS[r.itemId] : null;
    return { name: it ? it.name : r.itemId, icon: it ? it.icon : 'fas fa-box', color: it ? it.color : '#999999', count: r.count || 1 };
}

function _shopMonthlyRewardChipsHtml(chipClass) {
    chipClass = chipClass || 'shop-mc-reward-chip';
    return PRE_MONTHLY_CARD.dailyRewards.map(function(r) {
        var m = _shopMonthlyRewardMeta(r);
        return '<span class="' + chipClass + '" style="background:' + hexToRgbaShop(m.color, 0.12) + ';color:' + m.color + ';border-color:' + hexToRgbaShop(m.color, 0.35) + ';">' +
            _shopItemIconHtml(m.icon) + m.name + ' ×' + m.count + '</span>';
    }).join('');
}

function _shopFormatMonthlyDateTime(ts) {
    if (!ts) return '—';
    var d = new Date(ts + 8 * 60 * 60 * 1000);
    var p2 = function(n) { return (n < 10 ? '0' : '') + n; };
    return (d.getUTCMonth() + 1) + '月' + d.getUTCDate() + '日 ' + p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes());
}

// 渲染整页「PRE 月卡」：带鼠标跟随 3D 倾斜的动态银行卡 + 订阅信息 / 每日奖励 / 购买区
function _shopRenderMonthlyCardView(content) {
    var cfg = PRE_MONTHLY_CARD;
    var state = getMonthlyCardState();
    var remainingMs = getMonthlyCardRemainingMs();
    var remainingDays = Math.ceil(remainingMs / _MONTHLY_CARD_MS_PER_DAY);
    var maxEnd = 0;
    state.cards.forEach(function(c) { if (c.endTime > maxEnd) maxEnd = c.endTime; });
    var active = remainingMs > 0;
    var canBuy = canPurchaseMonthlyCard();
    var maxRemainDays = cfg.maxDays - remainingDays;
    var username = _shopGetUsername();
    var holderName = username && username !== 'anonymous' ? username : 'PRE USER';

    var rewardRows = cfg.dailyRewards.map(function(r) {
        var m = _shopMonthlyRewardMeta(r);
        return '<div class="shop-mc-reward-row">' +
            '<div class="shop-mc-reward-icon" style="background:' + hexToRgbaShop(m.color, 0.15) + ';">' + _shopItemIconHtml(m.icon, m.color) + '</div>' +
            '<div class="shop-mc-reward-name">' + m.name + '</div>' +
            '<div class="shop-mc-reward-count">×' + m.count + '</div>' +
            '</div>';
    }).join('');

    var limitNote = !canBuy
        ? '已达购买上限：当前剩余 ' + remainingDays + ' 天，最多可同时持有 ' + cfg.maxDays + ' 天。需等待首张月卡消耗 30 天后才可继续购买。'
        : '可重复购买，最多同时持有 ' + cfg.maxDays + ' 天；当前还可购买约 ' + Math.floor(maxRemainDays / cfg.days) + ' 张。';

    var html = '' +
        '<div class="shop-mc-wrap">' +
            '<div class="shop-mc-hero">' +
                '<div class="shop-mc-scene" id="shopMcScene">' +
                    '<div class="shop-mc-float">' +
                        '<div class="shop-mc-card3d" id="shopMonthlyCard3D">' +
                            '<div class="shop-mc-aura"></div>' +
                            '<div class="shop-mc-shine"></div>' +
                            '<div class="shop-mc-grid"></div>' +
                            '<div class="shop-mc-top">' +
                                '<span class="shop-mc-brand"><i class="fas fa-crown"></i> PRE LAUNCHER</span>' +
                                '<span class="shop-mc-tier">MONTHLY PASS</span>' +
                            '</div>' +
                            '<div class="shop-mc-mid">' +
                                '<div class="shop-mc-chip"></div>' +
                                (active
                                    ? '<span class="shop-mc-days-tag"><i class="fas fa-hourglass-half"></i> 剩余 ' + remainingDays + ' 天</span>'
                                    : '<span class="shop-mc-days-tag shop-mc-days-tag-off">未激活</span>') +
                            '</div>' +
                            '<div class="shop-mc-number">1145 1419 1981 0325</div>' +
                            '<div class="shop-mc-bottom">' +
                                '<div class="shop-mc-bank-field"><div class="shop-mc-label">PASS HOLDER</div><div class="shop-mc-holder">' + holderName + '</div></div>' +
                                '<div class="shop-mc-bank-field shop-mc-right"><div class="shop-mc-label">VALID THRU</div><div class="shop-mc-holder">' + (active ? _shopFormatMonthlyDateTime(maxEnd) : '30 DAYS') + '</div></div>' +
                            '</div>' +
                            '<div class="shop-mc-holo"></div>' +
                            '<div class="shop-mc-stars"><span></span><span></span><span></span><span></span><span></span><span></span></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="shop-mc-info">' +
                    '<div class="shop-mc-info-head">' +
                        '<div class="shop-mc-title"><i class="fas fa-id-card"></i> PRE 月卡</div>' +
                        '<div class="shop-mc-sub">30 天订阅 · 每日奖励通过邮件发放</div>' +
                    '</div>' +
                    '<div class="shop-mc-stats">' +
                        '<div class="shop-mc-stat"><span>剩余天数</span><b>' + (active ? remainingDays + ' 天' : '未激活') + '</b></div>' +
                        '<div class="shop-mc-stat"><span>生效状态</span><b class="' + (active ? 'shop-mc-on' : 'shop-mc-off') + '">' + (active ? '生效中' : '未购买') + '</b></div>' +
                        '<div class="shop-mc-stat"><span>到期时间</span><b>' + (active ? _shopFormatMonthlyDateTime(maxEnd) : '—') + '</b></div>' +
                        '<div class="shop-mc-stat"><span>已购买</span><b>' + (state.totalPurchased || 0) + ' 张</b></div>' +
                    '</div>' +
                    '<div class="shop-mc-price-box">' +
                        '<div class="shop-mc-price"><b>' + cfg.price + '</b><small>PRE Coin / 30 天</small></div>' +
                        '<div class="shop-mc-limit"><i class="fas fa-circle-info"></i><span>' + limitNote + '</span></div>' +
                    '</div>' +
                    '<button class="shop-mc-buy" id="shopMonthlyCardBuyBtn" type="button" ' + (canBuy ? '' : 'disabled') + '>' +
                        '<i class="fas ' + (canBuy ? 'fa-crown' : 'fa-ban') + '"></i> ' + (canBuy ? '购买月卡' : '已达购买上限') +
                    '</button>' +
                    '<div class="shop-mc-buy-tip"><i class="fas fa-envelope"></i> 购买后立即发放今日月卡邮件，当日奖励请前往邮件领取</div>' +
                '</div>' +
            '</div>' +
            '<div class="shop-mc-panel">' +
                '<div class="shop-mc-panel-title"><i class="fas fa-gift"></i> 每日奖励（当天登录启动器后通过邮件发放）</div>' +
                '<div class="shop-mc-rewards">' + rewardRows + '</div>' +
            '</div>' +
            '<div class="shop-mc-rules">' +
                '<div class="shop-mc-rule"><i class="fas fa-check"></i> 每张月卡有效期 30 天，可叠加购买，最多同时持有 90 天（3 张）。</div>' +
                '<div class="shop-mc-rule"><i class="fas fa-check"></i> 达到 90 天上限后无法购买，需等待首张月卡消耗完 30 天后才能继续购买。</div>' +
                '<div class="shop-mc-rule"><i class="fas fa-check"></i> 每日奖励于当天登录启动器时通过邮件发放，邮件有效期 7 天（截至一周后凌晨 04:00）。</div>' +
                '<div class="shop-mc-rule"><i class="fas fa-check"></i> 当日未登录启动器则不发放当日奖励，且不可补领。</div>' +
            '</div>' +
        '</div>';

    content.innerHTML = html;

    // 3D 鼠标跟随倾斜（外圈浮动动画 + 内层 transform，互不冲突）
    var scene = content.querySelector('#shopMcScene');
    var card = content.querySelector('#shopMonthlyCard3D');
    if (scene && card) {
        scene.addEventListener('mousemove', function(e) {
            var r = scene.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width - 0.5;
            var py = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = 'rotateX(' + (-py * 16) + 'deg) rotateY(' + (px * 22) + 'deg) translateZ(8px)';
        });
        scene.addEventListener('mouseleave', function() { card.style.transform = ''; });
    }

    var buyBtn = content.querySelector('#shopMonthlyCardBuyBtn');
    if (buyBtn) buyBtn.addEventListener('click', function() { shopPurchaseMonthlyCard(); });
}

// ==================== 「推荐」精选轮播 ====================
// 逻辑：从当前在售单品 / 组合包 / 限定外观中按「稀有度 + 折扣 + 价值」综合评分挑选 7 款，
//      以 3D 斜向叠放卡片 + 鼠标跟随倾斜展示，支持圆点 / 滚轮 / 方向键 / 左右箭头切换与自动轮播。
var _shopRecIndex = 0;
var _shopRecEntries = [];
var _shopRecAutoTimer = null;
var _shopRecWheelLockUntil = 0;
var _shopRecHover = false;
var _shopRecAutoDelay = 7000;
var _shopRecMaxCount = 7;

function _shopRecHexRgb(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '192, 57, 43';
    return parseInt(m[1].slice(0, 2), 16) + ', ' + parseInt(m[1].slice(2, 4), 16) + ', ' + parseInt(m[1].slice(4, 6), 16);
}

// 汇总当前可售卖的推荐条目（已售罄 / 已拥有 / 活动锁定的特殊商品不进入推荐）
function _shopGetRecommendEntries() {
    var entries = [];
    var rarityScore = { legendary: 100, epic: 70, rare: 45, common: 20 };
    var catLabels = { consumable: '消耗品', material: '材料', badge: '徽章' };

    Object.keys(SHOP_ITEM_PRICES).forEach(function(id) {
        var cfg = SHOP_ITEM_PRICES[id];
        if (!cfg || !cfg.enabled) return;
        var wid = _shopResolveWarehouseId(id);
        if (typeof WAREHOUSE_ITEMS === 'undefined' || !WAREHOUSE_ITEMS[wid]) return;
        var item = WAREHOUSE_ITEMS[wid];
        if (getShopStockRemaining(id) <= 0) return;

        var discount = getShopItemEffectiveDiscount(id);
        var price = getShopItemFinalPrice(id);
        var rarity = item.rarity || 'common';
        var meta = (typeof WAREHOUSE_RARITY !== 'undefined' && WAREHOUSE_RARITY[rarity])
            ? WAREHOUSE_RARITY[rarity] : { name: '普通', color: '#9aa0a6' };

        entries.push({
            kind: 'item',
            id: id,
            name: item.name,
            desc: item.desc || '',
            icon: item.icon,
            color: item.color || '#c0392b',
            rarityName: meta.name,
            rarityColor: meta.color,
            kindLabel: catLabels[item.category] || '道具',
            price: price,
            originalPrice: (discount > 0 && discount < 100) ? cfg.price : null,
            discount: discount,
            score: (rarityScore[rarity] || 10) + Math.min(30, price / 200) + discount * 1.5
        });
    });

    Object.keys(SHOP_BUNDLES).forEach(function(id) {
        var cfg = SHOP_BUNDLES[id];
        if (!cfg || !cfg.enabled) return;
        if (getShopBundleStockRemaining(id) <= 0) return;
        var price = getShopBundleFinalPrice(id);
        var original = getShopBundleSingleSum(id);
        var discount = cfg.discount || 0;
        entries.push({
            kind: 'bundle',
            id: id,
            name: cfg.name,
            desc: cfg.note || '',
            icon: cfg.icon || 'fas fa-gift',
            color: cfg.color || '#e67e22',
            rarityName: '组合',
            rarityColor: '#e67e22',
            kindLabel: '组合包',
            price: price,
            originalPrice: original > price ? original : null,
            discount: discount,
            score: 55 + Math.min(30, price / 200) + discount * 1.5
        });
    });

    Object.keys(SHOP_SPECIAL_ITEMS).forEach(function(id) {
        var cfg = SHOP_SPECIAL_ITEMS[id];
        if (!cfg || !cfg.enabled) return;
        if (_shopIsSpecialOwned(id) || _shopIsSpecialBlockedByEvent(id)) return;
        var price = getShopSpecialPrice(id);
        entries.push({
            kind: 'special',
            id: id,
            name: cfg.name,
            desc: cfg.desc || '',
            icon: cfg.icon,
            color: cfg.color || '#f39c12',
            rarityName: '限定',
            rarityColor: '#f39c12',
            kindLabel: cfg.kind === 'background' ? '限定背景' : '限定名片',
            price: price,
            originalPrice: null,
            discount: 0,
            score: 70 + Math.min(30, price / 200)
        });
    });

    entries.sort(function(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return b.price - a.price;
    });
    entries = entries.slice(0, _shopRecMaxCount);

    // ★ PRE 月卡常驻精选：无论是否已达购买上限均展示（达上限时按钮变为「查看详情」）
    entries.unshift(_shopRecMonthlyEntry());

    entries.forEach(function(e) {
        if (e.kind === 'monthly') {
            // 常驻月卡条目的 tag / reason / stockText 已在工厂函数中设定，这里仅补全 stockText
        } else if (e.kind === 'bundle' && e.originalPrice && e.originalPrice > e.price) {
            e.tag = '超值组合';
            e.reason = '单买合计 ' + e.originalPrice.toLocaleString() + '，打包立省 ' + (e.originalPrice - e.price).toLocaleString() + ' PRE Coin';
        } else if (e.discount > 0 && e.discount < 100) {
            e.tag = '限时特惠';
            e.reason = '当前享受 ' + e.discount + '% 折扣，入手正当时';
        } else if (e.kind === 'special') {
            e.tag = '限定返场';
            e.reason = '限定外观返场，收藏与展示价值兼备';
        } else if (e.rarityName === '传说') {
            e.tag = '稀世珍品';
            e.reason = '传说级稀有道具，人气与实用度兼具';
        } else {
            e.tag = '人气之选';
            e.reason = '高性价比之选，适合日常补给';
        }
        e.stockText = _shopRecStockText(e);
    });

    return entries;
}

// 常驻精选条目：PRE 月卡（始终展示，不受购买上限影响）
function _shopRecMonthlyEntry() {
    var cfg = PRE_MONTHLY_CARD;
    var days = getMonthlyCardRemainingDays();
    return {
        kind: 'monthly',
        id: cfg.id,
        name: cfg.name,
        desc: '30 天订阅，每日通过邮件发放 PRE Coin ×120、随机物品箱 · 初级、经验值加成卡 Ⅲ、经验值补给卡 Ⅱ / Ⅲ',
        icon: cfg.icon,
        color: cfg.color,
        rarityName: '订阅',
        rarityColor: '#d4af37',
        kindLabel: '订阅月卡',
        price: cfg.price,
        originalPrice: null,
        discount: 0,
        tag: '常驻精选',
        reason: days > 0
            ? '月卡生效中，剩余 ' + days + ' 天，可叠加续费至 ' + cfg.maxDays + ' 天'
            : '每日登录即领 5 项奖励，30 天收益远超售价',
        stockText: days > 0 ? '月卡剩余 ' + days + ' 天' : '最多持有 ' + cfg.maxDays + ' 天',
        score: 999
    };
}

function _shopRecStockText(entry) {
    if (entry.kind === 'special') return '每账号限购 1 件';
    if (entry.kind === 'monthly') return entry.stockText || '';
    var cfg = entry.kind === 'bundle' ? SHOP_BUNDLES[entry.id] : SHOP_ITEM_PRICES[entry.id];
    if (!cfg) return '';
    var remaining = entry.kind === 'bundle' ? getShopBundleStockRemaining(entry.id) : getShopStockRemaining(entry.id);
    if (cfg.stockType === 'daily') return '今日剩余 ' + remaining + ' 件';
    if (cfg.stockType === 'weekly') return '本周剩余 ' + remaining + ' 件';
    if (cfg.stockType === 'monthly') return '本月剩余 ' + remaining + ' 件';
    if (cfg.stockType === 'total') return '限购剩余 ' + remaining + ' 件';
    return '不限量供应';
}

function _shopRecStopAuto() {
    if (_shopRecAutoTimer) {
        clearInterval(_shopRecAutoTimer);
        _shopRecAutoTimer = null;
    }
}

function _shopRecStartAuto() {
    _shopRecStopAuto();
    if (_shopRecHover || _shopRecEntries.length < 2) return;
    _shopRecRestartProgress();
    _shopRecAutoTimer = setInterval(function() {
        if (document.hidden || _shopRecHover) return;
        _shopRecIndex = (_shopRecIndex + 1) % _shopRecEntries.length;
        _shopRecPaint();
    }, _shopRecAutoDelay);
}

function _shopRecRestartProgress() {
    var bar = document.querySelector('#shopRecStage .shop-rec-progress > span');
    if (!bar) return;
    bar.style.animation = 'none';
    void bar.offsetWidth;
    bar.style.animation = '';
}

// 离开推荐页 / 关闭商店时清理定时器与键盘监听
function _shopRecCleanup() {
    _shopRecStopAuto();
    _shopRecHover = false;
    if (typeof document !== 'undefined' && typeof _shopRecKeyHandler === 'function') {
        document.removeEventListener('keydown', _shopRecKeyHandler);
    }
}

function _shopRecKeyHandler(e) {
    if (!document.getElementById('shopRecStage')) return;
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key === 'ArrowRight') {
        e.preventDefault();
        _shopRecGoTo(_shopRecIndex + 1);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        _shopRecGoTo(_shopRecIndex - 1);
    }
}

function _shopRecGoTo(nextIndex) {
    if (!_shopRecEntries.length) return;
    var len = _shopRecEntries.length;
    _shopRecIndex = ((nextIndex % len) + len) % len;
    _shopRecPaint();
    if (!_shopRecHover) _shopRecStartAuto();
}

// 单张 3D 玻璃卡片：仅渲染当前推荐商品，配合舞台透视与鼠标跟随倾斜
function _shopRecBuildLayers(entry) {
    var plainIcon = _shopItemIconHtml(entry.icon);
    var coloredIcon = _shopItemIconHtml(entry.icon, entry.color);
    return '<div class="shop-rec-layer is-front" style="z-index:20;">' +
        '<div class="shop-rec-card">' +
            '<span class="shop-rec-card-sheen"></span>' +
            '<div class="shop-rec-icon3d">' +
                '<span class="shop-rec-icon-copy c1">' + plainIcon + '</span>' +
                '<span class="shop-rec-icon-copy c2">' + plainIcon + '</span>' +
                '<span class="shop-rec-icon-main">' + coloredIcon + '</span>' +
            '</div>' +
            '<div class="shop-rec-card-chips">' +
                '<span class="shop-rec-chip" style="color:' + entry.rarityColor + ';border-color:' + entry.rarityColor + ';">' + entry.rarityName + '</span>' +
                '<span class="shop-rec-chip">' + entry.kindLabel + '</span>' +
            '</div>' +
        '</div>' +
    '</div>';
}

// 点击波纹：从鼠标位置向外扩散的玻璃光斑
function _shopRecSpawnRipple(stage, clientX, clientY) {
    var rect = stage.getBoundingClientRect();
    var ripple = document.createElement('span');
    ripple.className = 'shop-rec-ripple';
    ripple.style.left = (clientX - rect.left) + 'px';
    ripple.style.top = (clientY - rect.top) + 'px';
    stage.appendChild(ripple);
    setTimeout(function() {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 820);
}

function _shopRecInfoHtml(entry) {
    var kindIcon = entry.kind === 'bundle' ? 'fas fa-gift'
        : (entry.kind === 'special' ? 'fas fa-gem'
        : (entry.kind === 'monthly' ? 'fas fa-id-card' : 'fas fa-tag'));
    var priceHtml = '<div class="shop-rec-price">' +
        '<b>' + entry.price.toLocaleString() + '</b>' +
        '<span class="unit">PRE Coin' + (entry.kind === 'monthly' ? ' / 30 天' : '') + '</span>' +
        (entry.originalPrice ? '<s>' + entry.originalPrice.toLocaleString() + '</s>' : '') +
        '</div>';
    // 月卡：可购买时「立即购买」，已达 90 天上限时变为「查看详情」（点击跳转至月卡条目）
    var ctaLabel, ctaIcon;
    if (entry.kind === 'monthly') {
        if (canPurchaseMonthlyCard()) { ctaLabel = '立即购买'; ctaIcon = 'fas fa-crown'; }
        else { ctaLabel = '查看详情'; ctaIcon = 'fas fa-eye'; }
    } else if (entry.kind === 'bundle') {
        ctaLabel = '查看组合包'; ctaIcon = 'fas fa-eye';
    } else {
        ctaLabel = '立即购买'; ctaIcon = 'fas fa-shopping-cart';
    }
    return '<div class="shop-rec-info-main">' +
            '<div class="shop-rec-kicker">' +
                '<span class="shop-rec-tag">' + entry.tag + '</span>' +
                '<span class="shop-rec-kind"><i class="' + kindIcon + '"></i> ' + entry.kindLabel + '</span>' +
                '<span class="shop-rec-stock"><i class="fas fa-cubes"></i> ' + entry.stockText + '</span>' +
            '</div>' +
            '<h3 class="shop-rec-title">' + entry.name + '</h3>' +
            '<p class="shop-rec-desc">' + entry.desc + '</p>' +
            '<div class="shop-rec-reason"><i class="fas fa-lightbulb"></i><span>' + entry.reason + '</span></div>' +
        '</div>' +
        '<div class="shop-rec-buy">' + priceHtml +
            '<button class="shop-rec-cta' + (entry.kind === 'monthly' ? ' shop-rec-cta-monthly' : '') + '" data-kind="' + entry.kind + '" data-id="' + entry.id + '">' +
                '<i class="' + ctaIcon + '"></i> ' + ctaLabel +
            '</button>' +
        '</div>';
}

function _shopRecBuy(entry) {
    if (!entry) return;
    if (entry.kind === 'bundle') {
        openShopBundleModal(entry.id);
    } else if (entry.kind === 'special') {
        shopPurchaseSpecialItem(entry.id);
    } else if (entry.kind === 'monthly') {
        if (canPurchaseMonthlyCard()) {
            shopPurchaseMonthlyCard();
        } else {
            // 已达购买上限：跳转至月卡条目查看详情
            _shopGoToCategory('monthly_card');
        }
    } else {
        shopPurchaseItem(entry.id, 1);
    }
}

// 切换侧边栏分类并刷新视图（月卡「查看详情」等入口使用）
function _shopGoToCategory(catId) {
    _shopActiveCategory = catId;
    if (document.getElementById('shopContent')) renderShopUI();
}

function _shopRecPaint() {
    var stage = document.getElementById('shopRecStage');
    var ensemble = document.getElementById('shopRecEnsemble');
    var info = document.getElementById('shopRecInfo');
    if (!stage || !ensemble || !info) return;
    if (!_shopRecEntries.length) return;
    if (_shopRecIndex >= _shopRecEntries.length) _shopRecIndex = 0;
    if (_shopRecIndex < 0) _shopRecIndex = _shopRecEntries.length - 1;

    var entry = _shopRecEntries[_shopRecIndex];
    stage.style.setProperty('--rec-accent', entry.color);
    stage.style.setProperty('--rec-accent-rgb', _shopRecHexRgb(entry.color));

    ensemble.innerHTML = _shopRecBuildLayers(entry);
    info.innerHTML = _shopRecInfoHtml(entry);

    var idxEl = stage.querySelector('.shop-rec-index');
    if (idxEl) {
        idxEl.textContent = ('0' + (_shopRecIndex + 1)).slice(-2) + ' / ' + ('0' + _shopRecEntries.length).slice(-2);
    }

    stage.querySelectorAll('.shop-rec-dot').forEach(function(dot, i) {
        var active = i === _shopRecIndex;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    // 重置进度条动画，让每张卡片重新计时
    _shopRecRestartProgress();

    var cta = info.querySelector('.shop-rec-cta');
    if (cta) {
        cta.addEventListener('click', function() { _shopRecBuy(entry); });
    }
}

function _shopRenderRecommendView(content) {
    _shopRecEntries = _shopGetRecommendEntries();
    content.classList.add('shop-content-rec');
    if (!_shopRecEntries.length) {
        content.innerHTML = '<div class="wh-empty"><i class="fas fa-thumbs-up"></i><p>暂无推荐商品</p>' +
            '<span>当前没有可推荐的在售商品，稍后再来看看吧</span></div>';
        return;
    }
    if (_shopRecIndex >= _shopRecEntries.length) _shopRecIndex = 0;

    var first = _shopRecEntries[_shopRecIndex];
    var dotsHtml = _shopRecEntries.map(function(e, i) {
        return '<button class="shop-rec-dot" data-rec-index="' + i + '" role="tab" aria-selected="false" title="' + e.name + '"></button>';
    }).join('');

    content.innerHTML =
        '<div class="shop-rec">' +
            '<div class="shop-rec-stage" id="shopRecStage" style="--rec-accent:' + first.color + ';--rec-accent-rgb:' + _shopRecHexRgb(first.color) + ';">' +
                '<div class="shop-rec-grid"></div>' +
                '<div class="shop-rec-glow"></div>' +
                '<div class="shop-rec-progress"><span></span></div>' +
                '<div class="shop-rec-eyebrow"><i class="fas fa-thumbs-up"></i> PRE SELECT · 精选推荐</div>' +
                '<div class="shop-rec-index">01 / ' + ('0' + _shopRecEntries.length).slice(-2) + '</div>' +
                '<div class="shop-rec-tilt"><div class="shop-rec-ensemble" id="shopRecEnsemble"></div></div>' +
                '<button class="shop-rec-arrow prev" data-rec-dir="-1" title="上一个推荐"><i class="fas fa-chevron-left"></i></button>' +
                '<button class="shop-rec-arrow next" data-rec-dir="1" title="下一个推荐"><i class="fas fa-chevron-right"></i></button>' +
                '<div class="shop-rec-hint"><i class="fas fa-computer-mouse"></i> 滚轮切换</div>' +
                '<div class="shop-rec-dots" role="tablist">' + dotsHtml + '</div>' +
            '</div>' +
            '<div class="shop-rec-info" id="shopRecInfo"></div>' +
        '</div>';

    var stage = content.querySelector('#shopRecStage');
    if (!stage) return;

    stage.querySelectorAll('.shop-rec-dot').forEach(function(dot) {
        dot.addEventListener('click', function(e) {
            e.stopPropagation();
            _shopRecGoTo(parseInt(dot.getAttribute('data-rec-index'), 10) || 0);
        });
    });

    stage.querySelectorAll('.shop-rec-arrow').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var dir = parseInt(btn.getAttribute('data-rec-dir'), 10) || 1;
            _shopRecGoTo(_shopRecIndex + dir);
        });
    });

    // 鼠标移动 → 整体 3D 跟随倾斜 + 光斑跟随
    stage.addEventListener('mousemove', function(e) {
        var rect = stage.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        var px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        var py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
        stage.style.setProperty('--rx', ((0.5 - py) * 9).toFixed(2) + 'deg');
        stage.style.setProperty('--ry', ((px - 0.5) * 13).toFixed(2) + 'deg');
        stage.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        stage.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    stage.addEventListener('mouseleave', function() {
        stage.style.setProperty('--rx', '0deg');
        stage.style.setProperty('--ry', '0deg');
        stage.style.setProperty('--gx', '52%');
        stage.style.setProperty('--gy', '42%');
    });

    // 悬停暂停自动轮播与进度条
    stage.addEventListener('mouseenter', function() {
        _shopRecHover = true;
        _shopRecStopAuto();
        stage.classList.add('is-paused');
    });
    stage.addEventListener('mouseleave', function() {
        _shopRecHover = false;
        stage.classList.remove('is-paused');
        _shopRecStartAuto();
    });

    // 滚轮切换（节流 420ms，避免触控板惯性一次跳过多个）
    stage.addEventListener('wheel', function(e) {
        if (Math.abs(e.deltaY) < 4 && Math.abs(e.deltaX) < 4) return;
        e.preventDefault();
        var now = Date.now();
        if (now < _shopRecWheelLockUntil) return;
        _shopRecWheelLockUntil = now + 420;
        var delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        _shopRecGoTo(_shopRecIndex + (delta > 0 ? 1 : -1));
    }, { passive: false });

    // 点击玻璃卡片：按压下沉 + 波纹光斑（圆点/箭头不触发）
    stage.addEventListener('pointerdown', function(e) {
        if (e.button !== 0) return;
        var t = e.target;
        if (t && t.closest && t.closest('.shop-rec-dot, .shop-rec-arrow')) return;
        var card = stage.querySelector('.shop-rec-card');
        if (card) card.classList.add('is-pressed');
        _shopRecSpawnRipple(stage, e.clientX, e.clientY);
        var release = function() {
            if (card) card.classList.remove('is-pressed');
            document.removeEventListener('pointerup', release);
            document.removeEventListener('pointercancel', release);
        };
        document.addEventListener('pointerup', release);
        document.addEventListener('pointercancel', release);
    });

    document.addEventListener('keydown', _shopRecKeyHandler);

    _shopRecPaint();
    _shopRecStartAuto();
}

function _shopUpdateTotalPrice(itemId, qty) {
    var cfg = SHOP_ITEM_PRICES[itemId];
    var finalPrice = getShopItemFinalPrice(itemId);
    var effDiscount = getShopItemEffectiveDiscount(itemId);
    var totalEl = document.getElementById('shopTotalPrice_' + itemId);
    if (!totalEl) return;
    var isDiscounted = effDiscount > 0 && effDiscount < 100;
    if (isDiscounted) {
        // 折后价（左）+ 原价删除线（右）
        totalEl.innerHTML = (finalPrice * qty) + '<span class="shop-total-strike">' + (cfg.price * qty) + '</span> PRE Coin';
    } else {
        totalEl.textContent = (finalPrice * qty) + ' PRE';
    }
}

// 构建单个商品卡片 HTML
function buildShopCardHTML(itemId) {
    var wid = _shopResolveWarehouseId(itemId);
    var item = WAREHOUSE_ITEMS[wid];
    var cfg = SHOP_ITEM_PRICES[itemId];
    var rarity = (typeof WAREHOUSE_RARITY !== 'undefined' && WAREHOUSE_RARITY[item.rarity])
        ? WAREHOUSE_RARITY[item.rarity]
        : { name: '普通', color: '#9aa0a6' };
    var categoryLabels = { consumable: '消耗品', material: '材料', badge: '徽章' };
    var categoryLabel = categoryLabels[item.category] || '道具';

    var remaining = getShopStockRemaining(itemId);
    var finalPrice = getShopItemFinalPrice(itemId);
    var effDiscount = getShopItemEffectiveDiscount(itemId);
    var isDiscounted = effDiscount > 0 && effDiscount < 100;

    // 价格标签：原价划线 + 折扣价
    var priceTagHtml = '';
    if (effDiscount >= 100) {
        priceTagHtml = '<span class="shop-price-tag shop-free-tag"><i class="fas fa-gift"></i> 免费</span>';
    } else if (isDiscounted) {
        priceTagHtml = '<span class="shop-price-tag">' +
            '<span class="shop-price-strike">' + cfg.price + '</span>' +
            '<i class="fas fa-coins"></i> ' + finalPrice +
            '<span class="shop-unit">/件</span>' +
            '<span class="shop-discount-badge">-' + effDiscount + '%</span>' +
        '</span>';
    } else {
        priceTagHtml = '<span class="shop-price-tag">' +
            '<i class="fas fa-coins"></i> ' + cfg.price +
            '<span class="shop-unit">/件</span>' +
        '</span>';
    }

    var limitHtml = '';
    if (cfg.stockType === 'daily') {
        limitHtml = '<div class="shop-stock shop-stock-daily"><i class="fas fa-calendar-day"></i> 每日限购 ' + cfg.stock + '，剩余 ' + remaining + '</div>';
    } else if (cfg.stockType === 'weekly') {
        limitHtml = '<div class="shop-stock shop-stock-weekly"><i class="fas fa-calendar-week"></i> 每周限购 ' + cfg.stock + '，剩余 ' + remaining + '</div>';
    } else if (cfg.stockType === 'monthly') {
        limitHtml = '<div class="shop-stock shop-stock-monthly"><i class="fas fa-calendar-alt"></i> 每月限购 ' + cfg.stock + '，剩余 ' + remaining + '</div>';
    } else if (cfg.stockType === 'total') {
        limitHtml = '<div class="shop-stock shop-stock-total"><i class="fas fa-infinity"></i> 总限购 ' + cfg.stock + '，剩余 ' + remaining + '</div>';
    }

    var isSoldOut = remaining <= 0;
    var noteHtml = cfg.note ? '<div class="shop-note"><i class="fas fa-info-circle"></i> ' + cfg.note + '</div>' : '';
    // 镜像商品（warehouseId 指向不同仓库条目）的特殊角标，例如月度/每周特供
    var mirrorTagHtml = '';
    if (cfg.warehouseId && cfg.warehouseId !== itemId) {
        var mirrorLabel = cfg.stockType === 'monthly' ? '月度特供'
            : (cfg.stockType === 'weekly' ? '每周特供' : '');
        if (mirrorLabel) mirrorTagHtml = '<span class="shop-mirror-tag">' + mirrorLabel + '</span>';
    }

    return `
        <div class="wh-item-card shop-item-card ${isSoldOut ? 'shop-sold-out' : ''}">
            ${priceTagHtml}
            ${mirrorTagHtml}
            <span class="wh-type-tag" style="color:${rarity.color}; border-color:${rarity.color};">${categoryLabel}</span>
            <div class="wh-item-icon" style="background: ${hexToRgbaShop(item.color, 0.15)};">
                ${_shopItemIconHtml(item.icon, item.color)}
            </div>
            <div class="wh-item-name">${item.name}</div>
            <div class="wh-item-desc">${item.desc}</div>
            ${limitHtml}
            ${noteHtml}
            <div class="shop-qty-row">
                <button class="shop-qty-minus" data-id="${itemId}">-</button>
                <input type="number" class="shop-qty-input" id="shopQty_${itemId}" data-id="${itemId}" value="1" min="1" max="99">
                <button class="shop-qty-plus" data-id="${itemId}">+</button>
            </div>
            <div class="shop-total-row">
                <span>合计：</span>
                <b class="shop-total-price" id="shopTotalPrice_${itemId}">${isDiscounted ? (finalPrice + '<span class="shop-total-strike">' + cfg.price + '</span> PRE Coin') : (finalPrice + ' PRE Coin')}</b>
            </div>
            <button class="shop-buy-btn" data-id="${itemId}" ${isSoldOut ? 'disabled' : ''}>
                <i class="fas ${isSoldOut ? 'fa-ban' : 'fa-shopping-cart'}"></i>
                ${isSoldOut ? '已售罄' : (effDiscount >= 100 ? '立即领取' : '立即购买')}
            </button>
        </div>
    `;
}

function hexToRgbaShop(hex, alpha) {
    if (!hex || hex.charAt(0) !== '#') return 'rgba(0,0,0,0.1)';
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

// 构建特殊商品卡片（背景 / 名片：固定价、不参与折扣；背景卡片点击可预览）
// 状态优先级：已拥有（「已拥有或已售罄」置灰）> 活动锁定（「暂未开放售卖」置灰）> 可购买
function buildShopSpecialCardHTML(itemId) {
    var cfg = SHOP_SPECIAL_ITEMS[itemId];
    if (!cfg) return '';
    var isBg = cfg.kind === 'background';
    var typeNoun = isBg ? '背景' : '名片样式';
    var owned = _shopIsSpecialOwned(itemId);
    var eventBlocked = !owned && _shopIsSpecialBlockedByEvent(itemId);
    var typeLabel = isBg ? '背景' : '名片';

    // 固定价：不应用任何折扣 / 全局促销
    var priceTagHtml = '<span class="shop-price-tag">' +
        '<i class="fas fa-coins"></i> ' + cfg.price +
        '<span class="shop-unit">/件</span>' +
    '</span>';

    var stockHtml;
    if (owned) {
        stockHtml = '<div class="shop-stock shop-stock-total"><i class="fas fa-check-circle"></i> 已拥有该' + typeNoun + '，每账号限购 1 件</div>';
    } else if (eventBlocked) {
        stockHtml = '<div class="shop-stock shop-stock-daily"><i class="fas fa-lock"></i> 包含该' + typeNoun + '的活动正在进行中，暂不开放售卖</div>';
    } else {
        stockHtml = '<div class="shop-stock shop-stock-total"><i class="fas fa-infinity"></i> 每账号限购 1 件</div>';
    }

    var noteHtml = cfg.note ? '<div class="shop-note"><i class="fas fa-info-circle"></i> ' + cfg.note + '</div>' : '';
    var previewHintHtml = isBg
        ? '<div class="shop-special-hint"><i class="fas fa-magnifying-glass"></i> 点击卡片预览背景效果</div>'
        : '';

    return `
        <div class="wh-item-card shop-item-card shop-special-card ${isBg ? 'shop-special-bg' : ''} ${(owned || eventBlocked) ? 'shop-sold-out' : ''}" data-id="${itemId}" data-kind="${cfg.kind}">
            ${priceTagHtml}
            <span class="wh-type-tag" style="color:${cfg.color}; border-color:${cfg.color};"><i class="${cfg.icon}"></i> ${typeLabel}</span>
            <div class="wh-item-icon" style="background: ${hexToRgbaShop(cfg.color, 0.15)};">
                ${_shopItemIconHtml(cfg.icon, cfg.color)}
            </div>
            <div class="wh-item-name">${cfg.name}</div>
            <div class="wh-item-desc">${cfg.desc || ''}</div>
            ${stockHtml}
            ${previewHintHtml}
            ${noteHtml}
            <div class="shop-total-row">
                <span>合计：</span>
                <b class="shop-total-price">${cfg.price} PRE Coin</b>
            </div>
            <button class="shop-buy-btn shop-special-buy" data-id="${itemId}" ${(owned || eventBlocked) ? 'disabled' : ''}>
                <i class="fas ${owned ? 'fa-ban' : (eventBlocked ? 'fa-lock' : 'fa-shopping-cart')}"></i>
                ${owned ? '已拥有或已售罄' : (eventBlocked ? '暂未开放售卖' : '立即购买')}
            </button>
        </div>
    `;
}

// ==================== 组合包：渲染 / 购买 / 详情弹窗 ====================
function renderShopBundleGrid(content) {
    var bundleIds = Object.keys(SHOP_BUNDLES).filter(function(id) { return SHOP_BUNDLES[id].enabled; });
    if (!bundleIds.length) {
        content.innerHTML = '<div class="wh-empty"><i class="fas fa-gift"></i><p>暂无组合包</p><span></span></div>';
        return;
    }
    content.innerHTML = bundleIds.map(function(id) { return buildShopBundleCardHTML(id); }).join('');
    content.querySelectorAll('.shop-bundle-card').forEach(function(card) {
        card.addEventListener('click', function() { openShopBundleModal(card.getAttribute('data-id')); });
    });
    content.querySelectorAll('.shop-bundle-buy').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            shopPurchaseBundle(btn.getAttribute('data-id'));
        });
    });
    content.querySelectorAll('.shop-bundle-open').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            openShopBundleModal(btn.getAttribute('data-id'));
        });
    });
}

function buildShopBundleCardHTML(bundleId) {
    var cfg = SHOP_BUNDLES[bundleId];
    var finalPrice = getShopBundleFinalPrice(bundleId);
    var isDiscounted = cfg.discount > 0 && cfg.discount < 100;
    var singleSum = getShopBundleSingleSum(bundleId);
    var savings = singleSum - finalPrice;
    var remaining = getShopBundleStockRemaining(bundleId);
    var isSoldOut = remaining <= 0;

    var priceTagHtml = '';
    if (cfg.discount >= 100) {
        priceTagHtml = '<span class="shop-price-tag shop-free-tag"><i class="fas fa-gift"></i> 免费</span>';
    } else if (isDiscounted) {
        priceTagHtml = '<span class="shop-price-tag">' +
            '<span class="shop-price-strike">' + getShopBundleItemsSum(bundleId) + '</span>' +
            '<i class="fas fa-coins"></i> ' + finalPrice +
            '<span class="shop-unit">/包</span>' +
            '<span class="shop-discount-badge">-' + cfg.discount + '%</span>' +
        '</span>';
    } else {
        priceTagHtml = '<span class="shop-price-tag">' +
            '<i class="fas fa-coins"></i> ' + finalPrice +
            '<span class="shop-unit">/包</span>' +
        '</span>';
    }

    var limitHtml = '';
    if (cfg.stockType === 'daily') {
        limitHtml = '<div class="shop-stock shop-stock-daily"><i class="fas fa-calendar-day"></i> 每日限购 ' + cfg.stock + '，剩余 ' + remaining + '</div>';
    } else if (cfg.stockType === 'weekly') {
        limitHtml = '<div class="shop-stock shop-stock-weekly"><i class="fas fa-calendar-week"></i> 每周限购 ' + cfg.stock + '，剩余 ' + remaining + '</div>';
    } else if (cfg.stockType === 'monthly') {
        limitHtml = '<div class="shop-stock shop-stock-monthly"><i class="fas fa-calendar-alt"></i> 每月限购 ' + cfg.stock + '，剩余 ' + remaining + '</div>';
    } else if (cfg.stockType === 'total') {
        limitHtml = '<div class="shop-stock shop-stock-total"><i class="fas fa-infinity"></i> 总限购 ' + cfg.stock + '，剩余 ' + remaining + '</div>';
    }

    // —— 卡片 3D 叠放堆（与详情弹窗同款的立体堆叠视觉，最多展示 4 件，超出以 +N 标记）——
    var pileItems = cfg.items.slice(0, 4).map(function(it) {
        var sub = (typeof WAREHOUSE_ITEMS !== 'undefined' && WAREHOUSE_ITEMS[it.itemId])
            ? WAREHOUSE_ITEMS[it.itemId] : { name: it.itemId, icon: 'fas fa-box', color: '#999' };
        return { name: sub.name, icon: sub.icon, color: sub.color, qty: it.qty || 1 };
    });
    var extraCount = Math.max(0, cfg.items.length - pileItems.length);
    var pileOffsets = [
        { tx: 0,   ty: 0,   rot: -8,  z: 3 },
        { tx: 12,  ty: -13, rot: -2,  z: 4 },
        { tx: 20,  ty: 11,  rot: 6,   z: 5 },
        { tx: -9,  ty: 18,  rot: 10,  z: 6 }
    ];
    var pileHtml = '<div class="shop-card-pile-bg" style="background:linear-gradient(135deg,' + hexToRgbaShop(cfg.color, 0.2) + ' 0%,' + hexToRgbaShop(cfg.color, 0.05) + ' 100%);">' +
        '<div class="shop-card-pile">' +
        pileItems.map(function(it, idx) {
            var o = pileOffsets[idx] || pileOffsets[0];
            return '<div class="shop-card-pile-item" style="' +
                'background:' + hexToRgbaShop(it.color, 0.92) + ';' +
                'transform:translate(' + o.tx + 'px,' + o.ty + 'px) rotate(' + o.rot + 'deg);' +
                'z-index:' + o.z + ';' +
                'box-shadow:0 5px 14px ' + hexToRgbaShop(it.color, 0.35) + ', 0 2px 5px rgba(0,0,0,0.15);' +
                '" title="' + it.name + (it.qty > 1 ? ' ×' + it.qty : '') + '">' +
                _shopItemIconHtml(it.icon) +
                '</div>';
        }).join('') +
        '</div>' +
        (extraCount > 0 ? '<div class="shop-card-pile-more">+' + extraCount + '</div>' : '') +
        '</div>';

    return `
        <div class="wh-item-card shop-bundle-card ${isSoldOut ? 'shop-sold-out' : ''}" data-id="${bundleId}">
            ${priceTagHtml}
            <span class="wh-type-tag shop-bundle-type">组合包</span>
            ${pileHtml}
            <div class="wh-item-name">${cfg.name}</div>
            <div class="shop-bundle-count"><i class="fas fa-boxes-stacked"></i> 含 ${cfg.items.length} 件商品${savings > 0 ? ' · 立省 ' + savings + ' PRE Coin' : ''}</div>
            <div class="wh-item-desc">${cfg.note || ''}</div>
            ${limitHtml}
            <div class="shop-total-row">
                <span>合计：</span>
                <b class="shop-total-price">${isDiscounted ? (finalPrice + '<span class="shop-total-strike">' + getShopBundleItemsSum(bundleId) + '</span> PRE Coin') : (finalPrice + ' PRE Coin')}</b>
            </div>
            <button class="shop-buy-btn shop-bundle-buy" data-id="${bundleId}" ${isSoldOut ? 'disabled' : ''}>
                <i class="fas ${isSoldOut ? 'fa-ban' : 'fa-shopping-cart'}"></i>
                ${isSoldOut ? '已售罄' : (cfg.discount >= 100 ? '立即领取' : '立即购买')}
            </button>
            <button class="shop-bundle-open" data-id="${bundleId}"><i class="fas fa-list-ul"></i> 查看该组合包所有物品</button>
        </div>
    `;
}

// 组合包实际执行购买（仅确认弹窗点确定后由回调调用）
function _shopExecutePurchaseBundle(bundleId) {
    var cfg = SHOP_BUNDLES[bundleId];
    var totalCost = getShopBundleFinalPrice(bundleId);

    var spent = spendPreCoin(totalCost, '商店组合包：' + cfg.name);
    if (!spent) return false;
    cfg.items.forEach(function(it) {
        if (typeof warehouseAddItem === 'function') warehouseAddItem(it.itemId, it.qty || 1, '组合包：' + cfg.name);
    });
    _shopRecordPurchase('bundle_' + bundleId, totalCost, 1);
    var modal = document.getElementById('shopModal');
    if (modal && modal.style.display === 'flex') renderShopUI();
    return true;
}

// 组合包购买入口：快速校验后弹出「确认购买」弹窗
function shopPurchaseBundle(bundleId) {
    var cfg = SHOP_BUNDLES[bundleId];
    if (!cfg || !cfg.enabled) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '购买失败', message: '组合包不存在或已下架' });
        return false;
    }
    var remaining = getShopBundleStockRemaining(bundleId);
    if (remaining < 1) {
        if (typeof showToast === 'function') {
            var lmMap = { daily: '今日', weekly: '本周', monthly: '本月' };
            var lm = lmMap[cfg.stockType] || '';
            showToast({ type: 'error', title: '超出限购数量', message: lm ? lm + '限购已用完' : '限购已用完' });
        }
        return false;
    }
    if (typeof spendPreCoin !== 'function' || typeof getPreCoinBalance !== 'function') {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '系统错误', message: 'PRE Coin 系统未加载' });
        return false;
    }
    var totalCost = getShopBundleFinalPrice(bundleId);
    var balance = getPreCoinBalance();
    if (balance < totalCost) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: 'PRE Coin 不足', message: '当前余额 ' + balance + '，需要 ' + totalCost });
        return false;
    }

    shopOpenPurchaseConfirm({ kind: 'bundle', bundleId: bundleId });
    return true;
}

// 组合包确认：点确定后真正执行 → 关闭可能已打开的详情弹窗 → 显示购买成功弹窗
function _shopConfirmPurchaseBundle(bundleId) {
    var ok = _shopExecutePurchaseBundle(bundleId);
    if (ok) {
        // 如果是从详情弹窗点的「立即购买」，购买成功后顺手关掉详情弹窗
        var bundleModal = document.getElementById('shopBundleModal');
        if (bundleModal) closeShopBundleModal();
        shopOpenPurchaseSuccess({ kind: 'bundle', bundleId: bundleId });
    } else {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '购买失败', message: '购买过程中发生问题，请稍后重试' });
    }
}

// ==================== 购买确认弹窗 & 购买成功弹窗 ====================
// 打开「确认购买」弹窗：展示商品 / 组合包信息、数量、PRE Coin 花费与当前余额
function shopOpenPurchaseConfirm(opts) {
    if (document.getElementById('shopPurchaseConfirmModal')) return; // 防重入
    var cfg, item, finalPrice, totalCost, rowsHtml, name, icon, color, desc, unitLabel, extraHtml = '';

    if (opts.kind === 'item') {
        var wid = _shopResolveWarehouseId(opts.itemId);
        item = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS[wid] : null;
        cfg = SHOP_ITEM_PRICES[opts.itemId];
        finalPrice = getShopItemFinalPrice(opts.itemId);
        totalCost = finalPrice * opts.qty;
        name = item ? item.name : opts.itemId;
        icon = item ? item.icon : 'fas fa-box';
        color = item ? item.color : '#999999';
        desc = item ? item.desc : '';
        unitLabel = '件';
    } else if (opts.kind === 'bundle') {
        cfg = SHOP_BUNDLES[opts.bundleId];
        totalCost = getShopBundleFinalPrice(opts.bundleId);
        name = cfg.name;
        icon = cfg.icon || 'fas fa-gift';
        color = cfg.color || '#e67e22';
        desc = '组合包';
        unitLabel = '包';
        var singleSum = getShopBundleSingleSum(opts.bundleId);
        var savings = singleSum - totalCost;
        var isDiscounted = cfg.discount > 0 && cfg.discount < 100;
        rowsHtml = cfg.items.map(function(it) {
            var sub = (typeof WAREHOUSE_ITEMS !== 'undefined' && WAREHOUSE_ITEMS[it.itemId])
                ? WAREHOUSE_ITEMS[it.itemId] : { name: it.itemId, icon: 'fas fa-box', color: '#999' };
            return `
                <div class="shop-cf-sub">
                    <div class="shop-cf-sub-icon" style="background:${hexToRgbaShop(sub.color, 0.15)};">
                        ${_shopItemIconHtml(sub.icon, sub.color)}
                    </div>
                    <div class="shop-cf-sub-info">
                        <div class="shop-cf-sub-name">${sub.name}${(it.qty || 1) > 1 ? ' ×' + (it.qty || 1) : ''}</div>
                    </div>
                </div>
            `;
        }).join('');
        extraHtml = `
            <div class="shop-cf-section-title"><i class="fas fa-boxes-stacked"></i> 包含商品</div>
            <div class="shop-cf-items">${rowsHtml}</div>
            ${isDiscounted ? '<div class="shop-cf-promo">整包促销 -' + cfg.discount + '% 立省 <b>' + savings + '</b> PRE Coin</div>' : ''}
        `;
    } else if (opts.kind === 'special') {
        cfg = SHOP_SPECIAL_ITEMS[opts.specialId];
        totalCost = getShopSpecialPrice(opts.specialId);
        name = cfg.name;
        icon = cfg.icon || 'fas fa-palette';
        color = cfg.color || '#3498db';
        desc = cfg.kind === 'background' ? '动态背景' : '名片样式';
        unitLabel = '件';
    } else if (opts.kind === 'monthly') {
        cfg = PRE_MONTHLY_CARD;
        totalCost = cfg.price;
        name = cfg.name;
        icon = cfg.icon;
        color = cfg.color;
        desc = '30 天订阅 · 每日邮件奖励';
        unitLabel = '张';
    }

    var balance = (typeof getPreCoinBalance === 'function') ? getPreCoinBalance() : 0;
    var finalBalance = balance - totalCost;
    var shortage = balance < totalCost;

    var qtyRowHtml = '';
    if (opts.kind === 'item') {
        qtyRowHtml = `
            <div class="shop-cf-row">
                <span>购买数量</span>
                <b>${opts.qty} ${unitLabel}</b>
            </div>
            <div class="shop-cf-row">
                <span>单价</span>
                <b>${finalPrice} PRE Coin</b>
            </div>
        `;
    } else if (opts.kind === 'monthly') {
        var mcRemainDays = getMonthlyCardRemainingDays();
        qtyRowHtml = `
            <div class="shop-cf-row">
                <span>月卡时长</span>
                <b>${PRE_MONTHLY_CARD.days} 天</b>
            </div>
            <div class="shop-cf-row">
                <span>当前剩余</span>
                <b>${mcRemainDays} 天</b>
            </div>
            <div class="shop-cf-row">
                <span>购买后剩余</span>
                <b>${mcRemainDays + PRE_MONTHLY_CARD.days} 天（上限 ${PRE_MONTHLY_CARD.maxDays} 天）</b>
            </div>
        `;
    }

    // 左侧 1/3 区域：单件 / 特殊商品 = 大号图标卡；组合包 = 3D 叠放图标堆
    var leftHtml = '';
    if (opts.kind === 'bundle') {
        // 取最多 5 件展示在叠放堆中；超出用 +N 标记
        var pileItems = cfg.items.slice(0, 5).map(function(it) {
            var sub = (typeof WAREHOUSE_ITEMS !== 'undefined' && WAREHOUSE_ITEMS[it.itemId])
                ? WAREHOUSE_ITEMS[it.itemId] : { name: it.itemId, icon: 'fas fa-box', color: '#999' };
            return { name: sub.name, icon: sub.icon, color: sub.color, qty: it.qty || 1 };
        });
        var extraCount = Math.max(0, cfg.items.length - pileItems.length);
        leftHtml = `
            <div class="shop-cf-pile-bg" style="background:linear-gradient(135deg,${hexToRgbaShop(color,0.22)} 0%,${hexToRgbaShop(color,0.06)} 100%);">
                <div class="shop-cf-pile">
                    ${pileItems.map(function(it, idx) {
                        // 每张卡叠放偏移 & 旋转角
                        var offsets = [
                            { tx: 0,   ty: 0,   rot: -8,  z: 3 },
                            { tx: 14,  ty: -16, rot: -2,  z: 4 },
                            { tx: 24,  ty: 14,  rot: 6,   z: 5 },
                            { tx: -10, ty: 22,  rot: 10,  z: 6 },
                            { tx: 18,  ty: -26, rot: -6,  z: 7 }
                        ];
                        var o = offsets[idx] || offsets[0];
                        return `<div class="shop-cf-pile-item" style="
                            background:${hexToRgbaShop(it.color,0.9)};
                            transform:translate(${o.tx}px,${o.ty}px) rotate(${o.rot}deg);
                            z-index:${o.z};
                            box-shadow:0 6px 18px ${hexToRgbaShop(it.color,0.35)}, 0 2px 6px rgba(0,0,0,0.15);
                        " title="${it.name}${it.qty>1?' ×'+it.qty:''}">
                            ${_shopItemIconHtml(it.icon)}
                        </div>`;
                    }).join('')}
                </div>
                ${extraCount > 0 ? '<div class="shop-cf-pile-more">+' + extraCount + '</div>' : ''}
            </div>
        `;
    } else {
        // item / special — 单张大号图标卡
        leftHtml = `
            <div class="shop-cf-single-bg" style="background:linear-gradient(135deg,${hexToRgbaShop(color,0.22)} 0%,${hexToRgbaShop(color,0.06)} 100%);">
                <div class="shop-cf-single" style="background:${hexToRgbaShop(color,0.95)}; box-shadow:0 10px 28px ${hexToRgbaShop(color,0.4)}, 0 4px 10px rgba(0,0,0,0.15);">
                    ${_shopItemIconHtml(icon, 'white')}
                </div>
                ${opts.kind === 'item' && opts.qty > 1 ? '<div class="shop-cf-qty-badge">×' + opts.qty + '</div>' : ''}
            </div>
        `;
    }

    // 右侧 2/3 区域：商品信息 + 包含商品（组合包）+ 消费明细
    var rightHtml = `
        <div class="shop-cf-right-top">
            <div class="shop-cf-product-name">${name}</div>
            <div class="shop-cf-product-desc">${desc}</div>
        </div>
    `;
    if (opts.kind === 'bundle') {
        rightHtml += `
            ${isDiscounted ? '<div class="shop-cf-promo">整包促销 -' + cfg.discount + '% 立省 <b>' + savings + '</b> PRE Coin</div>' : ''}
            <div class="shop-cf-section-title shop-cf-section-title-sm"><i class="fas fa-boxes-stacked"></i> 包含商品（${cfg.items.length} 种）</div>
            <div class="shop-cf-items-compact">
                ${cfg.items.map(function(it) {
                    var sub = (typeof WAREHOUSE_ITEMS !== 'undefined' && WAREHOUSE_ITEMS[it.itemId])
                        ? WAREHOUSE_ITEMS[it.itemId] : { name: it.itemId, icon: 'fas fa-box', color: '#999' };
                    return `<span class="shop-cf-chip" style="background:${hexToRgbaShop(sub.color,0.12)};color:${sub.color};border-color:${hexToRgbaShop(sub.color,0.35)};">
                        ${_shopItemIconHtml(sub.icon)}${sub.name} ×${it.qty || 1}
                    </span>`;
                }).join('')}
            </div>
        `;
    } else if (opts.kind === 'monthly') {
        rightHtml += `
            <div class="shop-cf-section-title shop-cf-section-title-sm"><i class="fas fa-gift"></i> 每日奖励（共 ${cfg.dailyRewards.length} 项）</div>
            <div class="shop-cf-items-compact">${_shopMonthlyRewardChipsHtml('shop-cf-chip')}</div>
        `;
    }
    rightHtml += `
        <div class="shop-cf-section-title"><i class="fas fa-receipt"></i> 消费明细</div>
        ${qtyRowHtml}
        <div class="shop-cf-row shop-cf-row-total">
            <span>合计花费</span>
            <b class="shop-cf-total">${totalCost} <small>PRE Coin</small></b>
        </div>
        <div class="shop-cf-balance">
            <span>当前余额<b>：${balance}</b> PRE Coin</span>
            <span>购买后余额<b class="${shortage ? 'shop-cf-bad' : 'shop-cf-good'}">${finalBalance}</b> PRE Coin</span>
        </div>
    `;

    var modal = document.createElement('div');
    modal.className = 'custom-alert shop-cf-modal';
    modal.id = 'shopPurchaseConfirmModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="shop-cf-box">
            <button class="shop-cf-close" title="关闭"><i class="fas fa-times"></i></button>
            <div class="shop-cf-body">
                <div class="shop-cf-left">${leftHtml}</div>
                <div class="shop-cf-right">${rightHtml}</div>
            </div>
            <div class="shop-cf-foot">
                <button class="shop-cf-btn shop-cf-cancel" type="button">取消</button>
                <button class="shop-cf-btn shop-cf-ok" type="button" ${shortage ? 'disabled' : ''}>
                    <i class="fas fa-check"></i> 确定购买
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    var confirmEscHandler = function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) cleanup();
    };
    document.addEventListener('keydown', confirmEscHandler);

    function cleanup() {
        document.removeEventListener('keydown', confirmEscHandler);
        modal.classList.remove('show');
        setTimeout(function() { if (modal.parentNode) modal.parentNode.removeChild(modal); }, 260);
    }

    modal.querySelector('.shop-cf-close').addEventListener('click', function() { cleanup(); });
    modal.querySelector('.shop-cf-cancel').addEventListener('click', function() { cleanup(); });
    modal.addEventListener('click', function(e) { if (e.target === modal) cleanup(); });

    var okBtn = modal.querySelector('.shop-cf-ok');
    if (okBtn) okBtn.addEventListener('click', function() {
        cleanup();
        if (opts.kind === 'item') _shopConfirmPurchaseItem(opts.itemId, opts.qty);
        else if (opts.kind === 'bundle') _shopConfirmPurchaseBundle(opts.bundleId);
        else if (opts.kind === 'special') _shopConfirmPurchaseSpecialItem(opts.specialId);
        else if (opts.kind === 'monthly') _shopConfirmPurchaseMonthlyCard();
    });

    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

// 关闭确认弹窗（对外暴露，便于遮罩点击 / Esc 兜底；内部 cleanup 已自动调用）
function closeShopPurchaseConfirm() {
    var m = document.getElementById('shopPurchaseConfirmModal');
    if (!m) return;
    m.classList.remove('show');
    setTimeout(function() { if (m.parentNode) m.parentNode.removeChild(m); }, 260);
}

// 打开「购买成功」弹窗：展示商品信息，告知已存入仓库
function shopOpenPurchaseSuccess(opts) {
    if (document.getElementById('shopPurchaseSuccessModal')) return;

    var cfg, item, qty, totalCost, name, icon, color, desc, labelLine, itemsMiniHtml = '';

    if (opts.kind === 'item') {
        var wid = _shopResolveWarehouseId(opts.itemId);
        item = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS[wid] : null;
        cfg = SHOP_ITEM_PRICES[opts.itemId];
        qty = opts.qty;
        totalCost = (getShopItemFinalPrice(opts.itemId) || (cfg && cfg.price) || 0) * qty;
        name = item ? item.name : opts.itemId;
        icon = item ? item.icon : 'fas fa-box';
        color = item ? item.color : '#2ecc71';
        desc = item ? item.desc : '';
        labelLine = '已存入仓库';
    } else if (opts.kind === 'bundle') {
        cfg = SHOP_BUNDLES[opts.bundleId];
        totalCost = getShopBundleFinalPrice(opts.bundleId);
        name = cfg.name;
        icon = cfg.icon || 'fas fa-gift';
        color = cfg.color || '#e67e22';
        desc = '组合包';
        labelLine = '已存入仓库';
        itemsMiniHtml = cfg.items.map(function(it) {
            var sub = (typeof WAREHOUSE_ITEMS !== 'undefined' && WAREHOUSE_ITEMS[it.itemId])
                ? WAREHOUSE_ITEMS[it.itemId] : { name: it.itemId, icon: 'fas fa-box', color: '#999' };
            return `<span class="shop-ps-chip" style="background:${hexToRgbaShop(sub.color, 0.12)};color:${sub.color};border-color:${hexToRgbaShop(sub.color, 0.35)};">
            ${_shopItemIconHtml(sub.icon)}${sub.name} ×${it.qty || 1}
            </span>`;
        }).join('');
    } else if (opts.kind === 'special') {
        cfg = SHOP_SPECIAL_ITEMS[opts.specialId];
        totalCost = getShopSpecialPrice(opts.specialId);
        name = cfg.name;
        icon = cfg.icon || 'fas fa-palette';
        color = cfg.color || '#3498db';
        desc = cfg.kind === 'background' ? '动态背景' : '名片样式';
        labelLine = cfg.kind === 'background' ? '已解锁 · 可前往系统设置 → 预设背景应用' : '已解锁 · 可在系统设置中更改名片样式';
    } else if (opts.kind === 'monthly') {
        cfg = PRE_MONTHLY_CARD;
        totalCost = cfg.price;
        name = cfg.name;
        icon = cfg.icon;
        color = cfg.color;
        desc = '30 天订阅 · 每日邮件奖励（剩余 ' + getMonthlyCardRemainingDays() + ' 天）';
        labelLine = '月卡已激活 · 今日奖励已发送至邮件';
        itemsMiniHtml = _shopMonthlyRewardChipsHtml('shop-ps-chip');
    }

    var modal = document.createElement('div');
    modal.className = 'custom-alert shop-ps-modal';
    modal.id = 'shopPurchaseSuccessModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="shop-ps-box">
            <div class="shop-ps-confetti">
                <div class="shop-ps-check">
                    <i class="fas fa-check"></i>
                </div>
            </div>
            <div class="shop-ps-title">购买成功</div>
            <div class="shop-ps-product">
                <div class="shop-ps-icon" style="background:${hexToRgbaShop(color, 0.15)};">
                    ${_shopItemIconHtml(icon, color)}
                </div>
                <div class="shop-ps-info">
                    <div class="shop-ps-name">${name}${opts.kind === 'item' && qty > 1 ? ' ×' + qty : ''}</div>
                    <div class="shop-ps-desc">${desc}</div>
                </div>
            </div>
            <div class="shop-ps-label"><i class="fas ${opts.kind === 'monthly' ? 'fa-envelope-open-text' : 'fa-warehouse'}"></i> ${labelLine}</div>
            ${itemsMiniHtml ? '<div class="shop-ps-chips">' + itemsMiniHtml + '</div>' : ''}
            <div class="shop-ps-foot">
                <span class="shop-ps-cost">本次花费 <b>${totalCost}</b> PRE Coin</span>
                <button class="shop-ps-close" type="button"><i class="fas fa-check-circle"></i> 好的</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    var successEscHandler = function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) cleanup();
    };
    document.addEventListener('keydown', successEscHandler);
    function cleanup() {
        document.removeEventListener('keydown', successEscHandler);
        modal.classList.remove('show');
        setTimeout(function() { if (modal.parentNode) modal.parentNode.removeChild(modal); }, 260);
    }

    modal.querySelector('.shop-ps-close').addEventListener('click', function() { cleanup(); });
    modal.addEventListener('click', function(e) { if (e.target === modal) cleanup(); });

    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

function closeShopPurchaseSuccess() {
    var m = document.getElementById('shopPurchaseSuccessModal');
    if (!m) return;
    m.classList.remove('show');
    setTimeout(function() { if (m.parentNode) m.parentNode.removeChild(m); }, 260);
}

// 组合包详情弹窗
function openShopBundleModal(bundleId) {
    var cfg = SHOP_BUNDLES[bundleId];
    if (!cfg) return;
    var old = document.getElementById('shopBundleModal');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var finalPrice = getShopBundleFinalPrice(bundleId);
    var singleSum = getShopBundleSingleSum(bundleId);
    var savings = singleSum - finalPrice;
    var isDiscounted = cfg.discount > 0 && cfg.discount < 100;
    var remaining = getShopBundleStockRemaining(bundleId);

    // 左侧 1/4 —— 3D 叠放堆（与确认弹窗一致的视觉）
    var pileItems = cfg.items.slice(0, 5).map(function(it) {
        var item = (typeof WAREHOUSE_ITEMS !== 'undefined' && WAREHOUSE_ITEMS[it.itemId])
            ? WAREHOUSE_ITEMS[it.itemId] : { name: it.itemId, icon: 'fas fa-box', color: '#999' };
        return { name: item.name, icon: item.icon, color: item.color, qty: it.qty || 1 };
    });
    var extraCount = Math.max(0, cfg.items.length - pileItems.length);
    var offsets = [
        { tx: 0,   ty: 0,   rot: -8,  z: 3 },
        { tx: 14,  ty: -16, rot: -2,  z: 4 },
        { tx: 24,  ty: 14,  rot: 6,   z: 5 },
        { tx: -10, ty: 22,  rot: 10,  z: 6 },
        { tx: 18,  ty: -26, rot: -6,  z: 7 }
    ];
    var pileHtml = `
        <div class="shop-bm-pile-bg" style="background:linear-gradient(135deg,${hexToRgbaShop(cfg.color,0.22)} 0%,${hexToRgbaShop(cfg.color,0.06)} 100%);">
            <div class="shop-bm-pile" style="transform-style:preserve-3d;perspective:420px;">
                ${pileItems.map(function(it, idx) {
                    var o = offsets[idx] || offsets[0];
                    return `<div class="shop-bm-pile-item" style="
                        background:${hexToRgbaShop(it.color,0.9)};
                        transform:translate(${o.tx}px,${o.ty}px) rotate(${o.rot}deg);
                        z-index:${o.z};
                        box-shadow:0 6px 18px ${hexToRgbaShop(it.color,0.35)}, 0 2px 6px rgba(0,0,0,0.15);
                    " title="${it.name}${it.qty>1?' ×'+it.qty:''}">
                        ${_shopItemIconHtml(it.icon)}
                    </div>`;
                }).join('')}
            </div>
            ${extraCount > 0 ? '<div class="shop-bm-pile-more">+' + extraCount + '</div>' : ''}
        </div>
    `;

    // 右侧 3/4 —— 组合包名 + 包含商品清单（详细说明 + 单价）+ 取消 / 立即购买
    var rowsHtml = cfg.items.map(function(it) {
        var item = (typeof WAREHOUSE_ITEMS !== 'undefined' && WAREHOUSE_ITEMS[it.itemId])
            ? WAREHOUSE_ITEMS[it.itemId]
            : { name: it.itemId, icon: 'fas fa-box', color: '#999999', desc: '' };
        var singlePrice = SHOP_ITEM_PRICES[it.itemId] ? SHOP_ITEM_PRICES[it.itemId].price : 0;
        var inPrice = _shopBundleItemFinal(it);
        var qty = it.qty || 1;
        return `
            <div class="shop-bm-row">
                <div class="shop-bm-row-icon" style="background:${hexToRgbaShop(item.color,0.15)};">
                    ${_shopItemIconHtml(item.icon, item.color)}
                </div>
                <div class="shop-bm-row-info">
                    <div class="shop-bm-row-name">${item.name}${qty > 1 ? ' ×' + qty : ''}</div>
                    <div class="shop-bm-row-desc">${item.desc || ''}</div>
                </div>
                <div class="shop-bm-row-price">
                    ${inPrice < singlePrice ? '<span class="shop-bm-row-single">' + singlePrice + '</span>' : ''}
                    <b>${inPrice}</b>
                </div>
            </div>
        `;
    }).join('');

    var modal = document.createElement('div');
    modal.className = 'custom-alert shop-bm-modal';
    modal.id = 'shopBundleModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="shop-bm-box">
            <button class="shop-bm-close" title="关闭"><i class="fas fa-times"></i></button>
            <div class="shop-bm-body">
                <div class="shop-bm-left">${pileHtml}</div>
                <div class="shop-bm-right">
                    <div class="shop-bm-head">
                        <div class="shop-bm-title">${cfg.name}</div>
                        <div class="shop-bm-sub">包含 ${cfg.items.length} 件商品${isDiscounted ? ' · 整包 -' + cfg.discount + '% 促销中' : ' · 原价组合'}</div>
                        ${cfg.note ? '<div class="shop-bm-note"><i class="fas fa-info-circle"></i> ' + cfg.note + '</div>' : ''}
                    </div>
                    ${isDiscounted ? '<div class="shop-bm-promo">整包促销 -' + cfg.discount + '% 立省 <b>' + savings + '</b> PRE Coin</div>' : ''}
                    <div class="shop-bm-section-title"><i class="fas fa-boxes-stacked"></i> 包含商品明细</div>
                    <div class="shop-bm-list">${rowsHtml}</div>
                </div>
            </div>
            <div class="shop-bm-foot">
                <span class="shop-bm-total">合计花费<b>${finalPrice}</b> PRE Coin${savings > 0 ? ' <span class="shop-bm-save">立省 ' + savings + ' PRE Coin</span>' : ''}</span>
                <div style="display:flex; gap:10px;">
                    <button class="shop-bm-btn shop-bm-cancel" type="button">取消</button>
                    <button class="shop-bm-btn shop-bm-buy" type="button" ${remaining < 1 ? 'disabled' : ''}>
                        <i class="fas ${remaining < 1 ? 'fa-ban' : 'fa-shopping-cart'}"></i> ${remaining < 1 ? '已售罄' : '立即购买'}
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    function cleanup() {
        closeShopBundleModal();
    }
    modal.querySelector('.shop-bm-close').addEventListener('click', cleanup);
    modal.querySelector('.shop-bm-cancel').addEventListener('click', cleanup);
    modal.addEventListener('click', function(e) { if (e.target === modal) cleanup(); });
    var buyBtn = modal.querySelector('.shop-bm-buy');
    if (buyBtn) buyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        // shopPurchaseBundle 会自行弹出确认弹窗，购买成功后由 _shopConfirmPurchaseBundle 负责关闭本详情弹窗
        shopPurchaseBundle(bundleId);
    });

    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

function closeShopBundleModal() {
    var m = document.getElementById('shopBundleModal');
    if (!m) return;
    m.classList.remove('show');
    setTimeout(function() { if (m.parentNode) m.parentNode.removeChild(m); }, 250);
}

// ==================== 样式（自包含：wh-* 基础 + shop-* 扩展 + devcoin 弹窗 + 暗色 + 响应式）====================
function getShopStyleCSS() {
    // ====== 仓库 wh-* 基础样式（复制并作用域化，确保不依赖仓库先打开）======
    var warehouseBaseCSS = `
        /* 基础容器作用域：下面的 .wh-* 全部加 #shopModal 前缀 */
        #shopModal {
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        #shopModal .wh-header {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 18px 40px;
            background: white;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            flex-shrink: 0;
        }
        #shopModal .wh-title {
            display: flex; align-items: center; gap: 12px;
        }
        #shopModal .wh-title i { font-size: 22px; color: #c0392b; }
        #shopModal .wh-title h2 { margin: 0; font-size: 20px; color: #333; }
        #shopModal .wh-stats { display: flex; align-items: center; gap: 16px; margin-left: auto; }
        #shopModal .wh-stat { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #888; }
        #shopModal .wh-stat b { color: #c0392b; }
        #shopModal .wh-close {
            width: 36px; height: 36px; border: none; border-radius: 50%;
            background: rgba(0,0,0,0.05); color: #666; font-size: 15px;
            cursor: pointer; transition: all 0.25s ease; flex-shrink: 0;
        }
        #shopModal .wh-close:hover { background: #c0392b; color: white; transform: rotate(90deg); }
        #shopModal .wh-toolbar {
            display: flex; align-items: center; gap: 10px;
            padding: 14px 40px; background: white;
            border-bottom: 1px solid rgba(0,0,0,0.06);
            flex-shrink: 0; flex-wrap: wrap;
        }
        #shopModal .wh-tab {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 7px 16px; border: 1.5px solid rgba(192, 57, 43, 0.25);
            border-radius: 20px; background: transparent; color: #666;
            font-size: 13px; cursor: pointer; transition: all 0.25s ease;
        }
        #shopModal .wh-tab:hover { border-color: #c0392b; color: #c0392b; }
        #shopModal .wh-tab.active {
            background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
            border-color: transparent; color: white;
        }
        #shopModal .wh-content {
            flex: 1; overflow-y: auto; padding: 20px 24px;
            display: block; /* 让 .shop-grid 成为真正的网格容器 */
            min-height: 0;
        }
        /* ★ 统一网格容器：单类商品/组合包 均用此 class */
        #shopModal .shop-grid {
            display: grid; gap: 16px; align-content: start;
            grid-template-columns: repeat(4, 1fr);
        }
        /* ★ 分组 subsection（weekly/monthly/total 混排 singles + bundles 时） */
        #shopModal .shop-subsection { margin-bottom: 18px; }
        #shopModal .shop-subsection:last-child { margin-bottom: 0; }
        #shopModal .shop-subsection-title {
            display: flex; align-items: center; gap: 8px;
            font-size: 14px; font-weight: 700; color: #2c3e50;
            margin: 0 0 14px 4px;
            padding: 0 0 0 12px;
            border-left: 3px solid #c0392b;
        }
        #shopModal .shop-subsection-title i { color: #c0392b; }
        #shopModal .shop-subsection-count {
            font-size: 12px; font-weight: 500; color: #7f8c8d;
            margin-left: auto;
        }
        /* ★ 分类标题 / 虚线隔断（与仓库同款，独立注入以免先开商店时仓库样式未加载） */
        #shopModal .wh-cat-header {
            display: flex; align-items: center; gap: 8px;
            padding: 2px 2px 0; color: #555;
            font-size: 14px; font-weight: 700;
        }
        #shopModal .wh-cat-header i { color: #d45d79; font-size: 13px; }
        #shopModal .wh-cat-count {
            display: inline-flex; align-items: center; justify-content: center;
            min-width: 20px; padding: 0 6px; height: 18px;
            border-radius: 9px; background: rgba(212, 93, 121, 0.12);
            color: #d45d79; font-size: 11px; font-style: normal; font-weight: 600;
        }
        #shopModal .wh-cat-divider {
            border-top: 1.5px dashed rgba(0, 0, 0, 0.16);
            margin: 6px 0; height: 0;
        }
        /* 「全部商品」按分类分组：分类标题与网格容器之间的间距 */
        #shopModal .shop-cat-group .wh-cat-header { margin-bottom: 12px; }
        #shopModal .shop-cat-group + .wh-cat-divider { margin: 18px 0; }
        #shopModal .wh-item-card {
            position: relative; display: flex; flex-direction: column;
            gap: 8px; padding: 22px 18px 18px; background: white;
            border: 1px solid #e8e8e8; border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        #shopModal .wh-item-card:hover { transform: translateY(-5px); box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
        /* 稀有度左侧竖条已移除：所有卡片统一为无左侧竖条的组合包样式 */
        #shopModal .wh-type-tag {
            position: absolute; top: 12px; right: 12px; padding: 2px 10px;
            border-radius: 12px; border: 1.5px solid; font-size: 11px; font-weight: bold;
            background: white; z-index: 1;
        }
        #shopModal .wh-item-icon {
            width: 64px; height: 64px; border-radius: 18px;
            display: flex; align-items: center; justify-content: center;
            font-size: 26px;
        }
        #shopModal .wh-item-name { font-size: 15px; font-weight: bold; color: #333; line-height: 1.3; }
        #shopModal .wh-item-desc { font-size: 12px; color: #888; line-height: 1.6; flex: 1; }
        #shopModal .wh-empty {
            grid-column: 1 / -1; display: flex; flex-direction: column;
            align-items: center; justify-content: center; padding: 80px 20px; color: #999;
        }
        #shopModal .wh-empty i { font-size: 56px; color: #c0392b; margin-bottom: 16px; opacity: 0.5; }
        #shopModal .wh-empty p { margin: 0 0 6px; font-size: 16px; font-weight: bold; color: #666; }
        #shopModal .wh-empty span { font-size: 13px; }
        #shopModal .wh-footer {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            padding: 12px 40px; background: white;
            border-top: 1px solid rgba(0,0,0,0.06);
            font-size: 12px; color: #aaa; flex-shrink: 0;
        }
    `;

    // ====== 暗色模式 wh-* 基础 ======
    var warehouseDarkCSS = `
        body.dark-mode #shopModal .wh-header,
        body.dark-mode #shopModal .wh-toolbar,
        body.dark-mode #shopModal .wh-footer {
            background: #1a1a2e; border-color: rgba(255,255,255,0.08);
        }
        body.dark-mode #shopModal .wh-title h2 { color: #e0e0e0; }
        body.dark-mode #shopModal .wh-title i { color: #e74c3c; }
        body.dark-mode #shopModal .wh-stat { color: #888; }
        body.dark-mode #shopModal .wh-stat b { color: #e74c3c; }
        body.dark-mode #shopModal .wh-close { background: rgba(255,255,255,0.08); color: #ccc; }
        body.dark-mode #shopModal .wh-close:hover { background: #c0392b; color: white; }
        body.dark-mode #shopModal .wh-tab { border-color: rgba(231, 76, 60, 0.3); color: #aaa; }
        body.dark-mode #shopModal .wh-tab:hover { border-color: #e74c3c; color: #e74c3c; }
        body.dark-mode #shopModal .wh-tab.active {
            background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%); color: white;
        }
        body.dark-mode #shopModal .wh-item-card {
            background: rgba(20, 20, 20, 0.8); border-color: rgba(255,255,255,0.1);
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        body.dark-mode #shopModal .wh-item-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
        body.dark-mode #shopModal .wh-type-tag { background: #1a1a2e; }
        body.dark-mode #shopModal .wh-item-name { color: #e0e0e0; }
        body.dark-mode #shopModal .wh-item-desc { color: #999; }
        body.dark-mode #shopModal .wh-empty p { color: #ccc; }
    `;

    // ====== 响应式 ======
    var responsiveCSS = `
        @media (max-width: 1500px) { #shopModal .shop-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1100px) { #shopModal .shop-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 900px)  {
            /* 窄屏：侧边栏转为矩形顶部横向滚动条 */
            #shopModal .shop-layout { flex-direction: column; }
            #shopModal .shop-sidebar {
                flex: 0 0 auto; width: 100%; max-width: none;
                flex-direction: row; align-items: center;
                overflow-x: auto; overflow-y: hidden;
                border-right: none; border-bottom: 1px solid rgba(0,0,0,0.07);
                padding: 10px 14px; gap: 8px;
            }
            #shopModal .shop-side-title { display: none; }
            #shopModal .shop-side-item { flex: 0 0 auto; width: auto; padding: 7px 12px; }
            #shopModal .shop-side-sep { width: 1px; height: 20px; margin: 0 2px; }
        }
        @media (max-width: 700px)  { #shopModal .shop-grid { grid-template-columns: repeat(1, 1fr); } }
        @media (max-width: 600px)  {
            #shopModal .wh-header, #shopModal .wh-footer { padding: 14px 16px !important; }
            #shopModal .wh-stats { display: none; }
            #shopModal .shop-content-outer { padding: 12px; }
            #shopModal .wh-content { padding: 14px 12px; }
        }
    `;

    // ====== 商店扩展 ======
    var shopExtCSS = `
        #shopModal .shop-fullscreen {
            width: 100%; height: 100%;
            display: flex; flex-direction: column;
            background: #f5f6fa; overflow: hidden;
        }

        /* ====== 内容区大矩形（左侧边栏 1/6 + 右侧内容 5/6） ====== */
        #shopModal .shop-content-outer {
            flex: 1; min-height: 0;
            display: flex; padding: 22px 40px;
        }
        #shopModal .shop-layout {
            flex: 1; min-height: 0; min-width: 0;
            display: flex; background: white;
            border-radius: 20px; border: 1px solid rgba(0,0,0,0.06);
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        /* —— 左侧竖向侧边栏（约 1/6） —— */
        #shopModal .shop-sidebar {
            flex: 0 0 16.6%; min-width: 168px; max-width: 230px;
            display: flex; flex-direction: column; gap: 4px;
            padding: 18px 12px; overflow-y: auto; overflow-x: hidden;
            background: linear-gradient(180deg, #fafbfc 0%, #f4f5f7 100%);
            border-right: 1px solid rgba(0,0,0,0.07);
            scrollbar-width: thin;
            scrollbar-color: rgba(192,57,43,0.35) transparent;
        }
        /* 自定义侧边栏滚动条 */
        #shopModal .shop-sidebar::-webkit-scrollbar { width: 8px; height: 8px; }
        #shopModal .shop-sidebar::-webkit-scrollbar-track {
            background: transparent; border-radius: 8px;
        }
        #shopModal .shop-sidebar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(231,76,60,0.45) 0%, rgba(192,57,43,0.55) 100%);
            border-radius: 8px;
            border: 2px solid transparent;
            background-clip: padding-box;
            transition: background 0.25s ease;
        }
        #shopModal .shop-sidebar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(231,76,60,0.75) 0%, rgba(192,57,43,0.85) 100%);
            background-clip: padding-box; border: 2px solid transparent;
        }
        #shopModal .shop-sidebar::-webkit-scrollbar-thumb:active {
            background: rgba(155,45,36,0.9);
            background-clip: padding-box; border: 1px solid transparent;
        }
        #shopModal .shop-sidebar::-webkit-scrollbar-corner { background: transparent; }
        #shopModal .shop-side-title {
            display: flex; align-items: center; gap: 7px;
            font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
            color: #9aa0a6; text-transform: uppercase;
            padding: 0 10px 10px; flex-shrink: 0;
        }
        #shopModal .shop-side-title i { color: #c0392b; font-size: 11px; }
        #shopModal .shop-side-item {
            display: flex; align-items: center; gap: 10px;
            width: 100%; padding: 11px 12px; border: none; border-radius: 12px;
            background: transparent; color: #555;
            font-size: 13.5px; font-weight: 600; cursor: pointer;
            transition: all 0.22s ease; text-align: left;
            position: relative; flex-shrink: 0;
        }
        #shopModal .shop-side-item i {
            width: 30px; height: 30px; flex-shrink: 0;
            display: inline-flex; align-items: center; justify-content: center;
            border-radius: 9px; font-size: 13px;
            background: rgba(0,0,0,0.05); color: #777;
            transition: all 0.22s ease;
        }
        #shopModal .shop-side-item .shop-side-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        #shopModal .shop-side-count {
            font-style: normal; font-size: 10.5px; font-weight: 700;
            min-width: 20px; height: 18px; padding: 0 6px; border-radius: 9px;
            display: inline-flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.06); color: #999; flex-shrink: 0;
            transition: all 0.22s ease;
        }
        #shopModal .shop-side-item:hover {
            background: rgba(192, 57, 43, 0.07); color: #c0392b;
        }
        #shopModal .shop-side-item:hover i { background: rgba(192,57,43,0.12); color: #c0392b; }
        #shopModal .shop-side-item.active {
            background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
            color: white;
            box-shadow: 0 4px 14px rgba(192,57,43,0.35);
        }
        #shopModal .shop-side-item.active i { background: rgba(255,255,255,0.2); color: white; }
        #shopModal .shop-side-item.active .shop-side-count { background: rgba(255,255,255,0.25); color: white; }
        #shopModal .shop-side-sep {
            height: 1px; margin: 8px 10px; flex-shrink: 0;
            background: rgba(0,0,0,0.08);
        }
        /* —— 右侧主内容区（约 5/6） —— */
        #shopModal .shop-main {
            flex: 1; min-width: 0; min-height: 0;
            display: flex; flex-direction: column;
        }
        #shopModal .shop-main-bar {
            display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
            padding: 14px 24px; flex-shrink: 0;
            border-bottom: 1px solid rgba(0,0,0,0.06);
            background: rgba(0,0,0,0.015);
        }
        #shopModal .shop-main-cat {
            display: inline-flex; align-items: center; gap: 8px;
            font-size: 15px; font-weight: 700; color: #2c3e50;
        }
        #shopModal .shop-main-cat i { color: #c0392b; font-size: 14px; }

        /* —— 组合包卡片 3D 叠放堆 —— */
        #shopModal .shop-card-pile-bg {
            position: relative; width: 100%; aspect-ratio: 16/10;
            border-radius: 14px; overflow: hidden;
            display: flex; align-items: center; justify-content: center;
        }
        #shopModal .shop-card-pile {
            position: relative; width: 74px; height: 74px;
            transform-style: preserve-3d; perspective: 420px;
            transition: transform 0.3s ease;
        }
        #shopModal .shop-bundle-card:hover .shop-card-pile { transform: translateY(-4px) scale(1.05); }
        #shopModal .shop-card-pile-item {
            position: absolute; left: 50%; top: 50%;
            width: 62%; aspect-ratio: 1/1; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px; margin-left: -31%; margin-top: -31%;
            animation: shopCardPileIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        #shopModal .shop-card-pile-item i { color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.25); }
        @keyframes shopCardPileIn {
            0% { transform: translate(0,0) rotate(0) scale(0.6); opacity: 0; }
            100% { opacity: 1; }
        }
        #shopModal .shop-card-pile-more {
            position: absolute; right: 8px; bottom: 8px;
            min-width: 24px; height: 24px; padding: 0 6px; border-radius: 12px;
            background: rgba(0,0,0,0.2); color: white; font-size: 11px; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        /* 暗色模式 —— 布局 / 侧边栏 / 3D 堆 */
        body.dark-mode #shopModal .shop-layout {
            background: #20203a; border-color: rgba(255,255,255,0.08);
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }
        body.dark-mode #shopModal .shop-sidebar {
            background: linear-gradient(180deg, #1c1c32 0%, #181828 100%);
            border-right-color: rgba(255,255,255,0.08);
            scrollbar-color: rgba(231,76,60,0.4) transparent;
        }
        body.dark-mode #shopModal .shop-sidebar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(231,76,60,0.4) 0%, rgba(192,57,43,0.5) 100%);
            background-clip: padding-box; border: 2px solid transparent;
        }
        body.dark-mode #shopModal .shop-sidebar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(231,76,60,0.7) 0%, rgba(192,57,43,0.8) 100%);
            background-clip: padding-box; border: 2px solid transparent;
        }
        body.dark-mode #shopModal .shop-side-title { color: #777; }
        body.dark-mode #shopModal .shop-side-item { color: #aaa; }
        body.dark-mode #shopModal .shop-side-item i { background: rgba(255,255,255,0.07); color: #999; }
        body.dark-mode #shopModal .shop-side-count { background: rgba(255,255,255,0.08); color: #888; }
        body.dark-mode #shopModal .shop-side-item:hover { background: rgba(231,76,60,0.12); color: #e74c3c; }
        body.dark-mode #shopModal .shop-side-item:hover i { background: rgba(231,76,60,0.18); color: #e74c3c; }
        body.dark-mode #shopModal .shop-side-item.active { color: white; }
        body.dark-mode #shopModal .shop-side-item.active i { background: rgba(255,255,255,0.2); color: white; }
        body.dark-mode #shopModal .shop-side-item.active .shop-side-count { background: rgba(255,255,255,0.25); color: white; }
        body.dark-mode #shopModal .shop-side-sep { background: rgba(255,255,255,0.1); }
        body.dark-mode #shopModal .shop-main-bar {
            border-bottom-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);
        }
        body.dark-mode #shopModal .shop-main-cat { color: #e8e8e8; }
        body.dark-mode #shopModal .shop-card-pile-item i { color: white; }
        @media (max-width: 900px) {
            body.dark-mode #shopModal .shop-sidebar { border-bottom-color: rgba(255,255,255,0.1); }
        }
        #shopModal .shop-item-count {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 13px; color: #888;
        }
        #shopModal .shop-item-count b { color: #c0392b; font-weight: bold; }
        #shopModal .shop-toolbar-right {
            margin-left: auto; display: inline-flex; align-items: center;
            gap: 10px; flex-wrap: wrap;
        }
        #shopModal .shop-toolbar-sep {
            width: 1px; height: 22px; flex-shrink: 0;
            background: rgba(0,0,0,0.14); margin: 0 4px;
        }
        #shopModal .shop-promo-tag {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 6px 14px; border-radius: 20px;
            background: linear-gradient(135deg, #e74c3c 0%, #e67e22 100%);
            color: white; font-size: 12px; font-weight: bold;
            box-shadow: 0 2px 8px rgba(231,76,60,0.3);
            animation: shopPromoPulse 2.4s ease-in-out infinite;
        }
        #shopModal .shop-promo-tag i { font-size: 11px; }
        #shopModal .shop-promo-all {
            background: linear-gradient(135deg, #f39c12 0%, #d35400 100%);
            box-shadow: 0 2px 8px rgba(243,156,18,0.35);
        }
        /* 顶栏大促时间 tag（全局促销起止时间展示） */
        #shopModal .shop-promo-period-tag {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 5px 13px; border-radius: 20px;
            background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
            color: white; font-size: 12px; font-weight: bold;
            box-shadow: 0 2px 8px rgba(192,57,43,0.3);
        }
        #shopModal .shop-promo-period-tag i { font-size: 11px; }
        #shopModal .shop-promo-period-tag .shop-promo-state { opacity: 0.85; margin-left: 1px; }
        #shopModal .shop-promo-period-tag.shop-promo-pending {
            background: rgba(0,0,0,0.07); color: #999; box-shadow: none;
        }
        /* 顶栏库存刷新倒计时 tag（PRE Coin 余额左侧） */
        #shopModal .shop-stock-refresh-tag {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 5px 13px; border-radius: 20px;
            background: linear-gradient(135deg, #2980b9 0%, #3498db 100%);
            color: white; font-size: 12px; font-weight: bold;
            box-shadow: 0 2px 8px rgba(52,152,219,0.3);
            cursor: default;
        }
        #shopModal .shop-stock-refresh-tag i { font-size: 11px; }
        #shopModal .shop-stock-refresh-tag .shop-refresh-countdown {
            color: white; font-variant-numeric: tabular-nums; letter-spacing: 0.5px;
        }
        body.dark-mode #shopModal .shop-stock-refresh-tag .shop-refresh-countdown { color: white; }
        @keyframes shopPromoPulse {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
        }
        #shopModal .wh-item-card.shop-sold-out { opacity: 0.6; filter: grayscale(0.6); }
        /* ★ 特殊商品卡片（背景 / 名片）：背景卡片整体可点击预览 */
        #shopModal .shop-special-card.shop-special-bg { cursor: pointer; }
        #shopModal .shop-special-card .shop-special-buy[disabled] { cursor: not-allowed; }
        #shopModal .shop-special-hint {
            display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: bold;
            color: #2980b9; background: rgba(52, 152, 219, 0.08);
            padding: 4px 8px; border-radius: 8px;
            border: 1px dashed rgba(52, 152, 219, 0.4);
        }
        #shopModal .shop-special-hint i { font-size: 10px; }
        #shopModal .shop-special-card.shop-sold-out .shop-special-hint {
            color: #8e44ad; background: rgba(142, 68, 173, 0.06);
            border-color: rgba(142, 68, 173, 0.35);
        }
        body.dark-mode #shopModal .shop-special-hint { color: #7fb8e0; background: rgba(52, 152, 219, 0.12); }
        body.dark-mode #shopModal .shop-special-card.shop-sold-out .shop-special-hint { color: #c39bd3; }
        /* ★ 镜像商品角标（月度/每周特供） */
        #shopModal .shop-mirror-tag {
            position: absolute; top: -2px; right: -2px;
            background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
            color: white; font-size: 10px; font-weight: 700;
            padding: 3px 8px; border-radius: 10px;
            box-shadow: 0 2px 6px rgba(211,84,0,0.4);
            z-index: 2; letter-spacing: 0.5px;
        }
        /* ★ 价格标签改为文档流内元素（不再绝对定位），彻底避免遮挡下方物品图标 */
        #shopModal .shop-price-tag {
            position: static; align-self: flex-start;
            margin: -8px 0 0; padding: 4px 12px; border-radius: 14px;
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
            color: white; font-size: 13px; font-weight: bold;
            display: inline-flex; align-items: center; gap: 5px;
            box-shadow: 0 2px 8px rgba(230,126,34,0.35);
        }
        #shopModal .shop-price-tag i { font-size: 11px; }
        #shopModal .shop-unit { font-size: 10px; opacity: 0.85; font-weight: normal; margin-left: 1px; }
        #shopModal .shop-price-strike { font-size: 10px; text-decoration: line-through; opacity: 0.75; margin-right: 3px; }
        #shopModal .shop-discount-badge {
            margin-left: 4px; padding: 1px 6px; border-radius: 8px;
            background: rgba(255,255,255,0.28); font-size: 10px; font-weight: bold;
        }
        #shopModal .shop-free-tag {
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            box-shadow: 0 2px 8px rgba(39,174,96,0.35);
        }
        #shopModal .shop-stock {
            display: flex; align-items: center; gap: 5px; font-size: 11px;
            padding: 3px 8px; border-radius: 8px; font-weight: bold;
        }
        #shopModal .shop-stock i { font-size: 10px; }
        #shopModal .shop-stock-daily { background: rgba(52, 152, 219, 0.1); color: #2980b9; }
        #shopModal .shop-stock-weekly { background: rgba(22, 160, 133, 0.1); color: #16a085; }
        #shopModal .shop-stock-total { background: rgba(155, 89, 182, 0.1); color: #8e44ad; }
        #shopModal .shop-stock-monthly { background: rgba(230, 126, 34, 0.1); color: #d35400; }
        #shopModal .shop-note {
            font-size: 11px; color: #a88; line-height: 1.5; padding: 3px 6px;
            border-left: 2px solid #e67e22; background: rgba(230,126,34,0.05);
        }
        #shopModal .shop-note i { color: #e67e22; margin-right: 2px; }
        #shopModal .shop-qty-row {
            display: flex; align-items: stretch; gap: 0;
            border: 1.5px solid rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden; margin-top: 2px;
        }
        #shopModal .shop-qty-minus, #shopModal .shop-qty-plus {
            width: 36px; border: none; background: rgba(0,0,0,0.04); color: #555;
            font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.2s ease;
        }
        #shopModal .shop-qty-minus:hover, #shopModal .shop-qty-plus:hover {
            background: rgba(192, 57, 43, 0.1); color: #c0392b;
        }
        #shopModal .shop-qty-input {
            flex: 1; border: none; border-left: 1px solid rgba(0,0,0,0.08);
            border-right: 1px solid rgba(0,0,0,0.08); outline: none; text-align: center;
            font-size: 14px; font-weight: bold; color: #333; padding: 6px 2px;
            background: transparent; min-width: 0; width: 100%; height: 100%;
            box-sizing: border-box; -moz-appearance: textfield;
        }
        #shopModal .shop-qty-input::-webkit-outer-spin-button,
        #shopModal .shop-qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        #shopModal .shop-total-row {
            display: flex; align-items: baseline; justify-content: space-between;
            padding: 4px 2px; font-size: 13px; color: #777;
        }
        #shopModal .shop-total-price { color: #c0392b; font-size: 15px; }
        /* 折扣商品：合计 = 折后价（左）+ 原价删除线（右） */
        #shopModal .shop-total-strike {
            text-decoration: line-through; font-size: 12px; font-weight: normal;
            color: #b0b0b0; margin-left: 6px; opacity: 0.85;
        }
        #shopModal .shop-buy-btn {
            width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            padding: 9px 0; border: none; border-radius: 10px;
            background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
            color: white; font-size: 13px; font-weight: bold; cursor: pointer; transition: all 0.25s ease;
        }
        #shopModal .shop-buy-btn:hover:not([disabled]) {
            transform: scale(1.03); box-shadow: 0 4px 12px rgba(192,57,43,0.35);
        }
        #shopModal .shop-buy-btn[disabled] { opacity: 0.5; cursor: not-allowed; }

        /* 开发者按钮（工具栏右侧分组内） */
        #shopModal .shop-dev-btn {
            padding: 7px 14px;
            border: 1.5px dashed #9b59b6; border-radius: 20px;
            background: rgba(155, 89, 182, 0.08); color: #9b59b6;
            font-size: 12px; font-weight: bold; cursor: pointer; transition: all 0.25s ease;
            display: inline-flex; align-items: center; gap: 5px;
        }
        #shopModal .shop-dev-btn:hover { background: #9b59b6; color: white; }

        /* 暗色模式扩展 */
        body.dark-mode #shopModal .shop-fullscreen { background: #1a1a2e; }
        body.dark-mode #shopModal .wh-item-card {
            background: rgba(20, 20, 20, 0.8); border-color: rgba(255,255,255,0.1);
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        body.dark-mode #shopModal .shop-qty-row { border-color: rgba(255,255,255,0.15); }
        body.dark-mode #shopModal .shop-qty-minus, body.dark-mode #shopModal .shop-qty-plus {
            background: rgba(255,255,255,0.06); color: #aaa;
        }
        body.dark-mode #shopModal .shop-qty-input { color: #e0e0e0; border-color: rgba(255,255,255,0.1); }
        body.dark-mode #shopModal .shop-total-row { color: #aaa; }
        body.dark-mode #shopModal .shop-dev-btn {
            border-color: #bd8fd0; background: rgba(155, 89, 182, 0.15); color: #d9b3e8;
        }
        body.dark-mode #shopModal .shop-dev-btn:hover { background: #9b59b6; color: white; }
    `;

    // ====== 开发者 PRE Coin 调整弹窗 ======
    var devCoinCSS = `
        #shopDevCoinModal {
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            display: flex; align-items: center; justify-content: center;
        }
        #shopDevCoinModal .shop-devcoin-box {
            width: 420px; max-width: 92vw; padding: 26px 24px 20px;
            background: white; border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        #shopDevCoinModal .shop-devcoin-title {
            font-size: 17px; font-weight: bold; color: #333;
            display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
        }
        #shopDevCoinModal .shop-devcoin-title i { color: #9b59b6; }
        #shopDevCoinModal .shop-devcoin-info {
            font-size: 13px; color: #777; background: rgba(155,89,182,0.08);
            padding: 10px 14px; border-radius: 10px; margin-bottom: 14px;
        }
        #shopDevCoinModal .shop-devcoin-current { color: #c0392b; }
        #shopDevCoinModal .shop-devcoin-row { margin-bottom: 14px; }
        #shopDevCoinModal .shop-devcoin-row label {
            display: block; font-size: 12px; color: #888; margin-bottom: 6px; font-weight: bold;
        }
        #shopDevCoinModal #shopDevCoinInput {
            width: 100%; padding: 10px 12px; border: 1.5px solid rgba(0,0,0,0.12);
            border-radius: 10px; font-size: 14px; color: #333; box-sizing: border-box; outline: none;
        }
        #shopDevCoinModal #shopDevCoinInput:focus { border-color: #9b59b6; }
        #shopDevCoinModal .shop-devcoin-quick { display: flex; flex-wrap: wrap; gap: 8px; }
        #shopDevCoinModal .shop-devcoin-quick button {
            padding: 6px 12px; border: 1.5px solid rgba(155,89,182,0.3); border-radius: 14px;
            background: rgba(155,89,182,0.08); color: #7d3c98; font-size: 12px; font-weight: bold;
            cursor: pointer; transition: all 0.2s ease;
        }
        #shopDevCoinModal .shop-devcoin-quick button:hover { background: #9b59b6; color: white; }
        #shopDevCoinModal .shop-devcoin-actions { display: flex; gap: 10px; margin-top: 16px; }
        #shopDevCoinModal .shop-devcoin-actions button {
            flex: 1; padding: 10px 0; border: none; border-radius: 10px;
            font-size: 13px; font-weight: bold; cursor: pointer; transition: all 0.2s ease;
        }
        #shopDevCoinModal #shopDevCoinCancel { background: rgba(0,0,0,0.06); color: #666; }
        #shopDevCoinModal #shopDevCoinOk {
            background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
            color: white; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        #shopDevCoinModal #shopDevCoinOk:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(155,89,182,0.35); }

        body.dark-mode #shopDevCoinModal .shop-devcoin-box { background: #24243a; }
        body.dark-mode #shopDevCoinModal .shop-devcoin-title { color: #e0e0e0; }
        body.dark-mode #shopDevCoinModal .shop-devcoin-info { background: rgba(155,89,182,0.18); color: #ccc; }
        body.dark-mode #shopDevCoinModal #shopDevCoinInput {
            background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); color: #e0e0e0;
        }
        body.dark-mode #shopDevCoinModal #shopDevCoinInput:focus { border-color: #bd8fd0; }
        body.dark-mode #shopDevCoinModal .shop-devcoin-quick button {
            background: rgba(155,89,182,0.15); color: #d9b3e8; border-color: rgba(155,89,182,0.4);
        }
        body.dark-mode #shopDevCoinModal .shop-devcoin-quick button:hover { background: #9b59b6; color: white; }
        body.dark-mode #shopDevCoinModal #shopDevCoinCancel { background: rgba(255,255,255,0.08); color: #ccc; }
    `;

    // ====== 开发者 重置购买状态 弹窗（复用 devcoin 弹窗样式结构） ======
    var devResetCSS = `
        #shopDevResetModal {
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            display: flex; align-items: center; justify-content: center;
        }
        #shopDevResetModal .shop-devcoin-box {
            width: 420px; max-width: 92vw; padding: 26px 24px 20px;
            background: white; border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        #shopDevResetModal .shop-devcoin-title {
            font-size: 17px; font-weight: bold; color: #333;
            display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
        }
        #shopDevResetModal .shop-devcoin-title i { color: #9b59b6; }
        #shopDevResetModal .shop-devcoin-info {
            font-size: 13px; color: #777; background: rgba(155,89,182,0.08);
            padding: 10px 14px; border-radius: 10px; margin-bottom: 14px; line-height: 1.7;
        }
        #shopDevResetModal .shop-devcoin-actions { display: flex; gap: 10px; margin-top: 16px; }
        #shopDevResetModal .shop-devcoin-actions button {
            flex: 1; padding: 10px 0; border: none; border-radius: 10px;
            font-size: 13px; font-weight: bold; cursor: pointer; transition: all 0.2s ease;
        }
        #shopDevResetModal #shopDevResetCancel { background: rgba(0,0,0,0.06); color: #666; }
        #shopDevResetModal #shopDevResetOk {
            background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
            color: white; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        #shopDevResetModal #shopDevResetOk:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(155,89,182,0.35); }

        body.dark-mode #shopDevResetModal .shop-devcoin-box { background: #24243a; }
        body.dark-mode #shopDevResetModal .shop-devcoin-title { color: #e0e0e0; }
        body.dark-mode #shopDevResetModal .shop-devcoin-info { background: rgba(155,89,182,0.18); color: #ccc; }
        body.dark-mode #shopDevResetModal #shopDevResetCancel { background: rgba(255,255,255,0.08); color: #ccc; }
    `;

    // ====== 组合包 + 自定义滚动条 ======
    var bundleCSS = `
        /* 组合包卡片 */
        #shopModal .shop-bundle-card { cursor: pointer; }
        #shopModal .wh-type-tag.shop-bundle-type { color: #e67e22; border-color: #e67e22; }
        #shopModal .shop-bundle-count {
            display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: bold;
            color: #e67e22; background: rgba(230,126,34,0.1); padding: 3px 8px; border-radius: 8px;
            align-self: flex-start;
        }
        #shopModal .shop-bundle-count i { font-size: 10px; }
        #shopModal .shop-bundle-open {
            width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            padding: 7px 0; border: 1.5px solid rgba(230,126,34,0.4); border-radius: 10px;
            background: rgba(230,126,34,0.06); color: #d35400; font-size: 12px; font-weight: bold;
            cursor: pointer; transition: all 0.2s ease;
        }
        #shopModal .shop-bundle-open:hover { background: #e67e22; color: white; }

        /* 自定义滚动条（商店内容区） */
        #shopModal .wh-content {
            scrollbar-width: thin;
            scrollbar-color: #c0392b rgba(0, 0, 0, 0.06);
        }
        #shopModal .wh-content::-webkit-scrollbar { width: 10px; }
        #shopModal .wh-content::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.04); border-radius: 8px;
        }
        #shopModal .wh-content::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #e74c3c 0%, #c0392b 100%);
            border-radius: 8px; border: 2px solid transparent;
            background-clip: padding-box;
        }
        #shopModal .wh-content::-webkit-scrollbar-thumb:hover {
            background: #c0392b; background-clip: padding-box;
        }

        /* ====== 组合包详情弹窗（新横向布局 shop-bm-*） ====== */
        #shopBundleModal {
            background: rgba(0, 0, 0, 0.78);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: none; position: fixed; inset: 0; z-index: 100010;
            align-items: center; justify-content: center;
        }
        #shopBundleModal.show { display: flex; }
        #shopBundleModal .shop-bm-box {
            position: relative;
            width: 720px; max-width: 95vw;
            display: flex; flex-direction: column;
            background: white; border-radius: 20px;
            box-shadow: 0 24px 64px rgba(0,0,0,0.4); overflow: hidden;
            animation: shopBmPop 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes shopBmPop {
            0% { transform: translateY(18px) scale(0.92); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        #shopBundleModal .shop-bm-close {
            position: absolute; top: 14px; right: 14px; z-index: 10;
            width: 30px; height: 30px; border: none; border-radius: 50%; cursor: pointer;
            background: rgba(0,0,0,0.06); color: #777; font-size: 14px; transition: all 0.2s;
            display: flex; align-items: center; justify-content: center;
        }
        #shopBundleModal .shop-bm-close:hover { background: #e67e22; color: white; transform: rotate(90deg); }

        #shopBundleModal .shop-bm-body {
            display: grid; grid-template-columns: 1fr 3fr; gap: 0;
            padding: 24px 22px 14px;
        }
        #shopBundleModal .shop-bm-left {
            display: flex; align-items: flex-start; justify-content: center;
            padding: 0 6px 12px;
        }
        #shopBundleModal .shop-bm-pile-bg {
            position: relative; width: 100%; aspect-ratio: 1/1;
            border-radius: 18px; display: flex; align-items: center; justify-content: center;
            overflow: hidden;
        }
        #shopBundleModal .shop-bm-pile { position: relative; width: 100%; height: 100%; }
        #shopBundleModal .shop-bm-pile-item {
            position: absolute; left: 50%; top: 50%;
            width: 58%; aspect-ratio: 1/1;
            border-radius: 16px;
            display: flex; align-items: center; justify-content: center;
            font-size: 28px;
            margin-left: -29%; margin-top: -29%;
            animation: shopCfPileIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        #shopBundleModal .shop-bm-pile-item i { color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.25); }
        #shopBundleModal .shop-bm-pile-more {
            position: absolute; right: 10px; bottom: 10px;
            width: 30px; height: 30px; border-radius: 50%;
            background: rgba(0,0,0,0.2); color: white; font-size: 11px; font-weight: 700;
            display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }

        #shopBundleModal .shop-bm-right { padding: 0 0 0 40px; min-width: 0; display: flex; flex-direction: column; min-height: 0; }
        #shopBundleModal .shop-bm-title { font-size: 18px; font-weight: bold; color: #2c3e50; line-height: 1.25; }
        #shopBundleModal .shop-bm-sub { font-size: 12px; color: #888; margin-top: 3px; }
        #shopBundleModal .shop-bm-note {
            font-size: 11px; color: #a88; margin-top: 5px; padding: 6px 10px;
            background: rgba(230,126,34,0.06); border-radius: 8px; border-left: 3px solid #e67e22;
        }
        #shopBundleModal .shop-bm-note i { color: #e67e22; margin-right: 3px; }
        #shopBundleModal .shop-bm-promo {
            margin-top: 8px; padding: 6px 12px; border-radius: 8px;
            background: linear-gradient(135deg,#fff4e6 0%,#ffe2bf 100%);
            color: #a55a00; font-size: 12px; text-align: center; font-weight: 600;
        }
        #shopBundleModal .shop-bm-promo b { color: #d35400; }
        #shopBundleModal .shop-bm-section-title {
            margin: 10px 0 6px; font-size: 11px; font-weight: 700; color: #888;
            display: flex; align-items: center; gap: 6px; letter-spacing: 0.04em; text-transform: uppercase;
        }
        #shopBundleModal .shop-bm-section-title i { color: #e67e22; font-size: 11px; }

        #shopBundleModal .shop-bm-list {
            overflow-y: auto; max-height: 224px;
            display: flex; flex-direction: column; gap: 8px;
            padding-right: 4px;
            scrollbar-width: thin; scrollbar-color: #e67e22 rgba(0,0,0,0.05);
        }
        #shopBundleModal .shop-bm-list::-webkit-scrollbar { width: 8px; }
        #shopBundleModal .shop-bm-list::-webkit-scrollbar-track { background: rgba(0,0,0,0.04); border-radius: 8px; }
        #shopBundleModal .shop-bm-list::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #f39c12 0%, #e67e22 100%);
            border-radius: 8px; border: 2px solid transparent; background-clip: padding-box;
        }
        #shopBundleModal .shop-bm-row {
            display: flex; align-items: center; gap: 12px; padding: 9px 12px;
            border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; background: rgba(0,0,0,0.02);
        }
        #shopBundleModal .shop-bm-row-icon {
            width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; font-size: 17px;
        }
        #shopBundleModal .shop-bm-row-info { flex: 1; min-width: 0; }
        #shopBundleModal .shop-bm-row-name { font-size: 13px; font-weight: bold; color: #333; }
        #shopBundleModal .shop-bm-row-desc {
            font-size: 11px; color: #999; margin-top: 2px;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        #shopBundleModal .shop-bm-row-price { text-align: right; font-size: 13px; color: #c0392b; flex-shrink: 0; min-width: 80px; }
        #shopBundleModal .shop-bm-row-price b { font-weight: 700; }
        #shopBundleModal .shop-bm-row-single { text-decoration: line-through; color: #b0b0b0; font-size: 11px; margin-right: 4px; }

        #shopBundleModal .shop-bm-foot {
            padding: 12px 22px 18px; border-top: 1px solid rgba(0,0,0,0.06);
            display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-shrink: 0;
        }
        #shopBundleModal .shop-bm-total { font-size: 12px; color: #777; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        #shopBundleModal .shop-bm-total b { color: #c0392b; font-size: 16px; margin: 0 2px; }
        #shopBundleModal .shop-bm-save {
            font-size: 11px; font-weight: bold; color: #27ae60; margin-left: 4px;
            background: rgba(39,174,96,0.1); padding: 3px 8px; border-radius: 8px;
        }
        #shopBundleModal .shop-bm-btn {
            padding: 9px 18px; border-radius: 10px; border: none; font-size: 13px; font-weight: 600;
            cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            white-space: nowrap;
        }
        #shopBundleModal .shop-bm-cancel { background: rgba(0,0,0,0.06); color: #555; }
        #shopBundleModal .shop-bm-cancel:hover { background: rgba(0,0,0,0.12); color: #222; }
        #shopBundleModal .shop-bm-buy {
            background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
            color: white; box-shadow: 0 4px 12px rgba(230,126,34,0.35);
        }
        #shopBundleModal .shop-bm-buy:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(230,126,34,0.45); }
        #shopBundleModal .shop-bm-buy:disabled { background: #bdc3c7; box-shadow: none; cursor: not-allowed; opacity: 0.7; }

        /* 组合包弹窗暗色模式 */
        body.dark-mode #shopBundleModal .shop-bm-box { background: #24243a; }
        body.dark-mode #shopBundleModal .shop-bm-close { background: rgba(255,255,255,0.08); color: #ccc; }
        body.dark-mode #shopBundleModal .shop-bm-title { color: #e8e8e8; }
        body.dark-mode #shopBundleModal .shop-bm-sub { color: #aaa; }
        body.dark-mode #shopBundleModal .shop-bm-note { color: #d98; background: rgba(230,126,34,0.1); border-left-color: #e67e22; }
        body.dark-mode #shopBundleModal .shop-bm-promo { background: linear-gradient(135deg,rgba(230,126,34,0.2) 0%,rgba(211,84,0,0.1) 100%); color: #ffcc88; }
        body.dark-mode #shopBundleModal .shop-bm-row { border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
        body.dark-mode #shopBundleModal .shop-bm-row-name { color: #e0e0e0; }
        body.dark-mode #shopBundleModal .shop-bm-foot { border-color: rgba(255,255,255,0.08); }
        body.dark-mode #shopBundleModal .shop-bm-total { color: #aaa; }
        body.dark-mode #shopBundleModal .shop-bm-cancel { background: rgba(255,255,255,0.08); color: #ddd; }
        body.dark-mode #shopBundleModal .shop-bm-cancel:hover { background: rgba(255,255,255,0.16); color: #fff; }

        @media (max-width: 640px) {
            #shopBundleModal .shop-bm-box { width: 95vw; }
            #shopBundleModal .shop-bm-body { grid-template-columns: 1fr; padding: 18px 16px 10px; }
            #shopBundleModal .shop-bm-left { padding: 4px 24px 10px; }
            #shopBundleModal .shop-bm-right { padding: 0; }
            #shopBundleModal .shop-bm-foot { flex-wrap: wrap; }
        }
        body.dark-mode #shopModal .shop-toolbar-sep { background: rgba(255,255,255,0.16); }
        body.dark-mode #shopModal .shop-promo-period-tag { color: white; }
        body.dark-mode #shopModal .shop-promo-period-tag.shop-promo-pending { background: rgba(255,255,255,0.1); color: #888; }
        body.dark-mode #shopModal .shop-bundle-count { background: rgba(230,126,34,0.18); color: #f5b041; }
        body.dark-mode #shopModal .shop-bundle-open { background: rgba(230,126,34,0.12); color: #f5b041; border-color: rgba(230,126,34,0.5); }
        body.dark-mode #shopModal .shop-subsection-title { color: #e8e8e8; }
        body.dark-mode #shopModal .shop-subsection-count { color: #aaa; }
        body.dark-mode #shopModal .wh-cat-header { color: #ccc; }
        body.dark-mode #shopModal .wh-cat-count { background: rgba(230, 126, 138, 0.18); color: #e67e8a; }
        body.dark-mode #shopModal .wh-cat-divider { border-top-color: rgba(255, 255, 255, 0.16); }
        body.dark-mode #shopModal .wh-content { scrollbar-color: #e74c3c rgba(255,255,255,0.08); }
        body.dark-mode #shopModal .wh-content::-webkit-scrollbar-track { background: rgba(255,255,255,0.06); }
        body.dark-mode #shopModal .wh-content::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #f0716a 0%, #e74c3c 100%);
            background-clip: padding-box;
        }

        /* ===== 确认购买弹窗 & 购买成功弹窗（#shopPurchaseConfirmModal / #shopPurchaseSuccessModal） ===== */
        #shopPurchaseConfirmModal, #shopPurchaseSuccessModal {
            background: rgba(0,0,0,0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 100020;
        }
        #shopPurchaseConfirmModal .shop-cf-box,
        #shopPurchaseSuccessModal .shop-ps-box {
            width: 460px; max-width: 92vw; background: white; border-radius: 18px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.35); overflow: hidden;
            animation: shopCfPop 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes shopCfPop {
            0% { transform: translateY(18px) scale(0.92); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        /* 确认弹窗（长方形横向布局） */
        #shopPurchaseConfirmModal .shop-cf-box {
            position: relative;
            width: 700px; max-width: 95vw; background: white; border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.35); overflow: hidden;
            animation: shopCfPop 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        #shopPurchaseConfirmModal .shop-cf-close {
            position: absolute; top: 14px; right: 14px;
            width: 30px; height: 30px; border: none; border-radius: 50%; cursor: pointer; z-index: 10;
            background: rgba(0,0,0,0.06); color: #777; font-size: 14px; transition: all 0.2s;
            display: flex; align-items: center; justify-content: center;
        }
        #shopPurchaseConfirmModal .shop-cf-close:hover { background: #e74c3c; color: white; transform: rotate(90deg); }

        #shopPurchaseConfirmModal .shop-cf-body {
            display: grid; grid-template-columns: 1fr 3fr; gap: 0;
            padding: 24px 22px 16px;
        }

        /* 左侧 1/3 */
        #shopPurchaseConfirmModal .shop-cf-left {
            display: flex; align-items: center; justify-content: center;
            padding: 12px 6px;
        }
        #shopPurchaseConfirmModal .shop-cf-single-bg,
        #shopPurchaseConfirmModal .shop-cf-pile-bg {
            position: relative;
            width: 100%; aspect-ratio: 1/1;
            border-radius: 18px;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
        }
        #shopPurchaseConfirmModal .shop-cf-single {
            width: 66%; height: 66%;
            border-radius: 18px;
            display: flex; align-items: center; justify-content: center;
            font-size: 42px;
            animation: shopCfIconPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes shopCfIconPop {
            0% { transform: scale(0.6) rotate(-10deg); opacity: 0; }
            100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        #shopPurchaseConfirmModal .shop-cf-single i { color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.25); }
        #shopPurchaseConfirmModal .shop-cf-qty-badge {
            position: absolute; right: 10px; bottom: 10px;
            padding: 3px 10px; border-radius: 12px; background: rgba(0,0,0,0.15);
            color: white; font-size: 12px; font-weight: 700; backdrop-filter: blur(4px);
        }

        /* 左侧 —— 组合包 3D 叠放堆 */
        #shopPurchaseConfirmModal .shop-cf-pile {
            position: relative; width: 100%; height: 100%;
            transform-style: preserve-3d; perspective: 420px;
        }
        #shopPurchaseConfirmModal .shop-cf-pile-item {
            position: absolute; left: 50%; top: 50%;
            width: 58%; aspect-ratio: 1/1;
            border-radius: 16px;
            display: flex; align-items: center; justify-content: center;
            font-size: 28px;
            margin-left: -29%; margin-top: -29%;
            transition: transform 0.3s ease;
            animation: shopCfPileIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes shopCfPileIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        #shopPurchaseConfirmModal .shop-cf-pile-item i {
            color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.25);
        }
        #shopPurchaseConfirmModal .shop-cf-pile-more {
            position: absolute; right: 10px; bottom: 10px;
            width: 30px; height: 30px; border-radius: 50%;
            background: rgba(0,0,0,0.2); color: white; font-size: 11px; font-weight: 700;
            display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }

        /* 右侧 2/3 */
        #shopPurchaseConfirmModal .shop-cf-right {
            padding: 4px 0 0 40px; min-width: 0;
        }
        #shopPurchaseConfirmModal .shop-cf-right-top { margin-bottom: 6px; }
        #shopPurchaseConfirmModal .shop-cf-product-name {
            font-size: 17px; font-weight: bold; color: #2c3e50; line-height: 1.25;
        }
        #shopPurchaseConfirmModal .shop-cf-product-desc {
            font-size: 12px; color: #888; margin-top: 3px;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        #shopPurchaseConfirmModal .shop-cf-promo {
            margin: 8px 0; padding: 6px 12px; border-radius: 8px;
            background: linear-gradient(135deg,#fff4e6 0%,#ffe2bf 100%);
            color: #a55a00; font-size: 12px; text-align: center; font-weight: 600;
        }
        #shopPurchaseConfirmModal .shop-cf-promo b { color: #d35400; }

        #shopPurchaseConfirmModal .shop-cf-section-title {
            margin: 12px 0 6px; font-size: 11px; font-weight: 700; color: #888;
            display: flex; align-items: center; gap: 6px; letter-spacing: 0.04em; text-transform: uppercase;
        }
        #shopPurchaseConfirmModal .shop-cf-section-title-sm { margin-top: 6px; }
        #shopPurchaseConfirmModal .shop-cf-section-title i { color: #c0392b; font-size: 11px; }

        #shopPurchaseConfirmModal .shop-cf-items-compact {
            display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 2px;
        }
        #shopPurchaseConfirmModal .shop-cf-chip {
            display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 12px;
            font-size: 11px; font-weight: 600; border: 1px solid; white-space: nowrap;
        }
        #shopPurchaseConfirmModal .shop-cf-chip i { font-size: 10px; }

        #shopPurchaseConfirmModal .shop-cf-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 4px 0; font-size: 13px; color: #555;
        }
        #shopPurchaseConfirmModal .shop-cf-row b { color: #333; font-weight: 600; }
        #shopPurchaseConfirmModal .shop-cf-row-total {
            margin-top: 4px; padding-top: 8px; border-top: 1px dashed rgba(0,0,0,0.1);
            font-size: 14px; color: #2c3e50; font-weight: 600;
        }
        #shopPurchaseConfirmModal .shop-cf-total { color: #c0392b; font-size: 19px; }
        #shopPurchaseConfirmModal .shop-cf-total small { font-size: 12px; font-weight: normal; color: #999; margin-left: 2px; }
        #shopPurchaseConfirmModal .shop-cf-balance {
            margin-top: 8px; padding: 8px 12px; border-radius: 10px; background: rgba(0,0,0,0.03);
            display: flex; justify-content: space-between; font-size: 12px; color: #666; gap: 8px; flex-wrap: wrap;
        }
        #shopPurchaseConfirmModal .shop-cf-balance b { color: #333; font-weight: 600; }
        #shopPurchaseConfirmModal .shop-cf-balance .shop-cf-bad { color: #c0392b; }
        #shopPurchaseConfirmModal .shop-cf-balance .shop-cf-good { color: #27ae60; }

        #shopPurchaseConfirmModal .shop-cf-foot {
            display: flex; gap: 10px; padding: 12px 22px 18px; border-top: 1px solid rgba(0,0,0,0.06);
        }
        #shopPurchaseConfirmModal .shop-cf-btn {
            flex: 1; padding: 10px 0; border-radius: 10px; border: none; font-size: 14px; font-weight: 600;
            cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        #shopPurchaseConfirmModal .shop-cf-cancel { background: rgba(0,0,0,0.06); color: #555; }
        #shopPurchaseConfirmModal .shop-cf-cancel:hover { background: rgba(0,0,0,0.12); color: #222; }
        #shopPurchaseConfirmModal .shop-cf-ok {
            background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
            color: white; box-shadow: 0 4px 12px rgba(231,76,60,0.35);
        }
        #shopPurchaseConfirmModal .shop-cf-ok:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(231,76,60,0.45); }
        #shopPurchaseConfirmModal .shop-cf-ok:active:not(:disabled) { transform: translateY(0); }
        #shopPurchaseConfirmModal .shop-cf-ok:disabled {
            background: #bdc3c7; box-shadow: none; cursor: not-allowed; opacity: 0.7;
        }

        /* 成功弹窗 */
        #shopPurchaseSuccessModal .shop-ps-box {
            width: 420px; max-width: 92vw; padding: 24px 22px 18px; text-align: center;
        }
        #shopPurchaseSuccessModal .shop-ps-confetti {
            display: flex; justify-content: center; margin-bottom: 12px;
        }
        #shopPurchaseSuccessModal .shop-ps-check {
            width: 72px; height: 72px; border-radius: 50%;
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white; font-size: 32px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 8px 22px rgba(46,204,113,0.45);
            animation: shopPsBounce 0.55s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes shopPsBounce {
            0% { transform: scale(0); }
            60% { transform: scale(1.15); }
            100% { transform: scale(1); }
        }
        #shopPurchaseSuccessModal .shop-ps-title {
            font-size: 20px; font-weight: bold; color: #2c3e50; margin-bottom: 16px;
        }
        #shopPurchaseSuccessModal .shop-ps-product {
            display: flex; gap: 12px; align-items: center; justify-content: center;
            padding: 12px; border-radius: 12px; background: linear-gradient(135deg,#fafbfc 0%,#f3f4f6 100%);
            border: 1px solid rgba(0,0,0,0.05); margin-bottom: 12px;
        }
        #shopPurchaseSuccessModal .shop-ps-icon {
            width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
            font-size: 20px; flex-shrink: 0;
        }
        #shopPurchaseSuccessModal .shop-ps-name { font-size: 15px; font-weight: bold; color: #2c3e50; }
        #shopPurchaseSuccessModal .shop-ps-desc { font-size: 12px; color: #9aa0a6; margin-top: 3px; }
        #shopPurchaseSuccessModal .shop-ps-label {
            display: inline-flex; align-items: center; gap: 6px; color: #27ae60; font-size: 13px; font-weight: 600;
            padding: 6px 12px; border-radius: 18px; background: rgba(46,204,113,0.1); margin-bottom: 10px;
        }
        #shopPurchaseSuccessModal .shop-ps-label i { font-size: 14px; }
        #shopPurchaseSuccessModal .shop-ps-chips {
            display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 6px 0 14px;
        }
        #shopPurchaseSuccessModal .shop-ps-chip {
            display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 14px;
            font-size: 11px; font-weight: 600; border: 1px solid;
        }
        #shopPurchaseSuccessModal .shop-ps-chip i { font-size: 10px; }
        #shopPurchaseSuccessModal .shop-ps-foot {
            display: flex; align-items: center; justify-content: space-between; gap: 10px;
            padding-top: 14px; border-top: 1px dashed rgba(0,0,0,0.08);
        }
        #shopPurchaseSuccessModal .shop-ps-cost { font-size: 12px; color: #666; }
        #shopPurchaseSuccessModal .shop-ps-cost b { color: #c0392b; font-size: 14px; }
        #shopPurchaseSuccessModal .shop-ps-close {
            padding: 9px 22px; border-radius: 10px; border: none; cursor: pointer;
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;
            box-shadow: 0 4px 12px rgba(46,204,113,0.35); transition: all 0.2s;
        }
        #shopPurchaseSuccessModal .shop-ps-close:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(46,204,113,0.45); }

        /* 暗色主题覆盖 —— 确认弹窗（横向） */
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-box,
        body.dark-mode #shopPurchaseSuccessModal .shop-ps-box { background: #24243a; color: #ddd; }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-close { background: rgba(255,255,255,0.08); color: #ccc; }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-product-name { color: #e8e8e8; }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-product-desc { color: #aaa; }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-section-title { color: #aaa; }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-row { color: #aaa; }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-row b { color: #e8e8e8; }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-balance { background: rgba(255,255,255,0.05); color: #aaa; }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-balance b { color: #eee; }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-foot { border-color: rgba(255,255,255,0.08); }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-cancel { background: rgba(255,255,255,0.08); color: #ddd; }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-cancel:hover { background: rgba(255,255,255,0.16); color: #fff; }
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-single i,
        body.dark-mode #shopPurchaseConfirmModal .shop-cf-pile-item i { color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
        body.dark-mode #shopPurchaseSuccessModal .shop-ps-product { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); }
        body.dark-mode #shopPurchaseSuccessModal .shop-ps-foot { border-color: rgba(255,255,255,0.1); }
        body.dark-mode #shopPurchaseSuccessModal .shop-ps-cost { color: #aaa; }

        @media (max-width: 640px) {
            #shopPurchaseConfirmModal .shop-cf-box { width: 94vw; }
            #shopPurchaseConfirmModal .shop-cf-body { grid-template-columns: 1fr; padding: 18px 16px 12px; }
            #shopPurchaseConfirmModal .shop-cf-left { padding: 4px 24px 10px; }
            #shopPurchaseConfirmModal .shop-cf-right { padding: 0; }
            #shopPurchaseConfirmModal .shop-cf-foot { padding: 10px 16px 16px; }
        }

    `;

    // ====== 「推荐」精选轮播 ======
    var recommendCSS = `
        /* —— 侧边栏「推荐」条目：激活后持续流动 + 大拇指摆动 —— */
        #shopModal .shop-side-item.shop-side-recommend { overflow: hidden; }
        #shopModal .shop-side-item.shop-side-recommend > i { color: #d35400; background: rgba(243,156,18,0.14); }
        #shopModal .shop-side-item.shop-side-recommend:hover > i { color: #c0392b; }
        #shopModal .shop-side-item.shop-side-recommend.active {
            background: linear-gradient(120deg, #b83227 0%, #e74c3c 35%, #f39c12 65%, #e74c3c 100%);
            background-size: 240% 240%;
            animation: shopRecSidebarFlow 5s ease infinite, shopRecSidebarPulse 2.4s ease-in-out infinite;
        }
        #shopModal .shop-side-item.shop-side-recommend.active::after {
            content: '';
            position: absolute; inset: 0;
            background: linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.45) 50%, transparent 75%);
            transform: translateX(-130%);
            animation: shopRecSidebarShine 2.4s ease-in-out infinite;
            pointer-events: none;
        }
        #shopModal .shop-side-item.shop-side-recommend.active > i {
            animation: shopRecThumbRock 1.8s ease-in-out infinite;
            background: rgba(255,255,255,0.22); color: #fff;
        }
        @keyframes shopRecSidebarFlow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        @keyframes shopRecSidebarPulse {
            0%, 100% { box-shadow: 0 4px 14px rgba(192,57,43,0.38); }
            50% { box-shadow: 0 6px 24px rgba(243,156,18,0.5); }
        }
        @keyframes shopRecSidebarShine {
            0% { transform: translateX(-130%); }
            55%, 100% { transform: translateX(130%); }
        }
        @keyframes shopRecThumbRock {
            0%, 100% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(-10deg) scale(1.08); }
            60% { transform: rotate(8deg) scale(1.05); }
        }

        /* —— 推荐视图：右侧大长方形 + 外侧左下角图文 —— */
        #shopModal .wh-content.shop-content-rec {
            display: flex; flex-direction: column;
            padding: 22px 26px; overflow: hidden;
        }
        #shopModal .shop-rec {
            display: flex; flex-direction: column; gap: 18px;
            flex: 1 1 auto; height: auto; min-height: 0;
        }
        #shopModal .shop-rec-stage {
            position: relative; flex: 1 1 auto; min-height: 320px;
            border-radius: 26px; overflow: hidden;
            background:
                radial-gradient(circle at 18% 18%, rgba(var(--rec-accent-rgb), 0.30) 0%, transparent 46%),
                radial-gradient(circle at 86% 82%, rgba(var(--rec-accent-rgb), 0.16) 0%, transparent 44%),
                linear-gradient(135deg, #1b2230 0%, #121722 55%, #0b0f17 100%);
            border: 1px solid rgba(255,255,255,0.09);
            box-shadow: 0 18px 46px rgba(15,23,42,0.28);
            perspective: 1300px;
            --rx: 0deg; --ry: 0deg; --gx: 52%; --gy: 42%;
            isolation: isolate; user-select: none;
        }
        #shopModal .shop-rec-grid {
            position: absolute; inset: 0; pointer-events: none;
            background-image:
                linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px);
            background-size: 52px 52px;
            -webkit-mask-image: radial-gradient(circle at 50% 50%, #000 0%, transparent 78%);
            mask-image: radial-gradient(circle at 50% 50%, #000 0%, transparent 78%);
            opacity: 0.8;
        }
        #shopModal .shop-rec-glow {
            position: absolute; inset: -20%; pointer-events: none;
            background: radial-gradient(circle at var(--gx) var(--gy), rgba(var(--rec-accent-rgb), 0.30) 0%, rgba(var(--rec-accent-rgb), 0.08) 26%, transparent 55%);
            transition: background 0.18s linear;
            z-index: 1;
        }
        #shopModal .shop-rec-stage::before {
            content: ''; position: absolute; left: 50%; top: 50%; width: 620px; height: 620px;
            margin: -310px 0 0 -310px; border-radius: 50%;
            border: 1px solid rgba(var(--rec-accent-rgb), 0.22);
            box-shadow: 0 0 0 90px rgba(var(--rec-accent-rgb), 0.035), inset 0 0 80px rgba(var(--rec-accent-rgb), 0.05);
            pointer-events: none; z-index: 0;
        }
        #shopModal .shop-rec-stage::after {
            content: ''; position: absolute; left: 50%; bottom: -46%;
            width: 78%; height: 62%; transform: translateX(-50%) rotateX(62deg);
            border-radius: 50%;
            background: radial-gradient(circle at 50% 50%, rgba(var(--rec-accent-rgb), 0.24), transparent 68%);
            filter: blur(18px); pointer-events: none; z-index: 0;
        }
        #shopModal .shop-rec-progress {
            position: absolute; left: 0; right: 0; top: 0; height: 3px;
            background: rgba(255,255,255,0.08); z-index: 30;
        }
        #shopModal .shop-rec-progress > span {
            display: block; height: 100%; width: 0;
            background: linear-gradient(90deg, rgba(var(--rec-accent-rgb), 0.45), var(--rec-accent));
            border-radius: 0 3px 3px 0;
            animation: shopRecProgress 7s linear forwards;
            box-shadow: 0 0 10px rgba(var(--rec-accent-rgb), 0.75);
        }
        #shopModal .shop-rec-stage.is-paused .shop-rec-progress > span { animation-play-state: paused; }
        @keyframes shopRecProgress { from { width: 0; } to { width: 100%; } }
        #shopModal .shop-rec-eyebrow {
            position: absolute; left: 22px; top: 20px; z-index: 25;
            display: inline-flex; align-items: center; gap: 8px;
            padding: 6px 14px; border-radius: 999px;
            background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16);
            color: #f1f5f9; font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        #shopModal .shop-rec-eyebrow i { color: var(--rec-accent); }
        #shopModal .shop-rec-index {
            position: absolute; right: 24px; top: 22px; z-index: 25;
            font-size: 12px; font-weight: 700; letter-spacing: 0.16em;
            color: rgba(255,255,255,0.55);
        }
        #shopModal .shop-rec-index::before {
            content: ''; display: inline-block; width: 22px; height: 1px;
            background: rgba(var(--rec-accent-rgb), 0.8); vertical-align: middle;
            margin-right: 8px;
        }

        /* —— 单张 3D 玻璃卡片（鼠标跟随倾斜） —— */
        #shopModal .shop-rec-tilt {
            position: absolute; left: 50%; top: 49%; z-index: 10;
            transform: translate(-50%, -50%) rotateX(var(--rx)) rotateY(var(--ry));
            transform-style: preserve-3d;
            transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        #shopModal .shop-rec-ensemble {
            position: relative; width: 280px; height: 340px;
            transform-style: preserve-3d;
            animation: shopRecFloat 7s ease-in-out infinite;
        }
        #shopModal .shop-rec-layer {
            position: absolute; left: 50%; top: 50%; width: 264px; height: 336px;
            margin: -168px 0 0 -132px;
            transform-style: preserve-3d;
            animation: shopRecLayerIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        #shopModal .shop-rec-layer.is-front { width: 264px; height: 336px; margin: -168px 0 0 -132px; }
        @keyframes shopRecLayerIn {
            from { opacity: 0; filter: blur(8px); }
            to { filter: blur(0); }
        }
        #shopModal .shop-rec-card {
            position: relative; width: 100%; height: 100%;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 18px; border-radius: 28px; overflow: hidden;
            background:
                radial-gradient(120% 90% at 14% 0%, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0.10) 40%, transparent 64%),
                radial-gradient(85% 65% at 88% 102%, rgba(var(--rec-accent-rgb), 0.26) 0%, transparent 66%),
                linear-gradient(158deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 52%, rgba(255,255,255,0.03) 100%);
            border: 1px solid rgba(255,255,255,0.32);
            box-shadow:
                0 34px 64px rgba(0,0,0,0.46),
                inset 0 1px 1px rgba(255,255,255,0.55),
                inset 0 -22px 34px rgba(0,0,0,0.24),
                inset 0 0 0 1px rgba(255,255,255,0.08);
            backdrop-filter: blur(20px) saturate(168%);
            -webkit-backdrop-filter: blur(20px) saturate(168%);
            transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease, filter 0.22s ease;
        }
        /* 玻璃上沿的高光棱线 */
        #shopModal .shop-rec-card::before {
            content: ''; position: absolute; left: 7%; right: 7%; top: 0; height: 1.5px;
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.92) 50%, transparent 100%);
            opacity: 0.85; pointer-events: none; z-index: 3;
        }
        #shopModal .shop-rec-layer.is-front .shop-rec-card {
            border-color: rgba(var(--rec-accent-rgb), 0.5);
            box-shadow:
                0 36px 72px rgba(0,0,0,0.52),
                0 0 0 1px rgba(var(--rec-accent-rgb), 0.2),
                0 0 78px rgba(var(--rec-accent-rgb), 0.32),
                inset 0 1px 1px rgba(255,255,255,0.6),
                inset 0 -24px 38px rgba(0,0,0,0.26),
                inset 0 0 0 1px rgba(255,255,255,0.1);
        }
        /* 按压：玻璃轻微下沉 + 内部提亮 + 光晕收紧 */
        #shopModal .shop-rec-layer.is-front .shop-rec-card.is-pressed {
            transform: translateY(3px) scale(0.976);
            filter: brightness(1.1) saturate(1.12);
            box-shadow:
                0 14px 26px rgba(0,0,0,0.4),
                0 0 0 1px rgba(var(--rec-accent-rgb), 0.35),
                0 0 46px rgba(var(--rec-accent-rgb), 0.5),
                inset 0 2px 10px rgba(0,0,0,0.28),
                inset 0 1px 1px rgba(255,255,255,0.5);
        }
        #shopModal .shop-rec-card-sheen {
            position: absolute; inset: 0; pointer-events: none; overflow: hidden;
            background:
                radial-gradient(circle at 28% 18%, rgba(255,255,255,0.46) 0%, transparent 40%),
                linear-gradient(135deg, transparent 38%, rgba(255,255,255,0.24) 50%, transparent 62%);
            opacity: 0.8;
        }
        #shopModal .shop-rec-card-sheen::after {
            content: ''; position: absolute; top: -70%; left: -45%; width: 46%; height: 240%;
            background: linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
            transform: rotate(16deg) translateX(-130%);
            transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
        }
        #shopModal .shop-rec-card:hover .shop-rec-card-sheen::after {
            transform: rotate(16deg) translateX(360%);
        }
        /* 点击波纹：从鼠标位置扩散的玻璃光斑 */
        #shopModal .shop-rec-ripple {
            position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px;
            border-radius: 50%; pointer-events: none; z-index: 22;
            background: radial-gradient(circle, rgba(255,255,255,0.92) 0%, rgba(var(--rec-accent-rgb), 0.55) 42%, transparent 72%);
            box-shadow: 0 0 24px rgba(var(--rec-accent-rgb), 0.55);
            animation: shopRecRipple 0.78s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes shopRecRipple {
            0% { transform: scale(0.6); opacity: 0.95; }
            100% { transform: scale(24); opacity: 0; }
        }
        #shopModal .shop-rec-icon3d {
            position: relative; width: 160px; height: 160px;
            display: flex; align-items: center; justify-content: center;
            font-size: 96px; line-height: 1; color: var(--rec-accent);
            transform: translateZ(50px);
            filter: drop-shadow(0 16px 26px rgba(var(--rec-accent-rgb), 0.45));
            animation: shopRecIconFloat 5.6s ease-in-out infinite;
        }
        #shopModal .shop-rec-icon-copy,
        #shopModal .shop-rec-icon-main {
            position: absolute; inset: 0;
            display: flex; align-items: center; justify-content: center;
        }
        #shopModal .shop-rec-icon-copy > i,
        #shopModal .shop-rec-icon-main > i {
            display: inline-flex; align-items: center; justify-content: center;
            width: 1em; height: 1em; font-size: 1em; line-height: 1;
        }
        #shopModal .shop-rec-icon-copy.c1 { color: rgba(0,0,0,0.34); transform: translate(6px, 7px); }
        #shopModal .shop-rec-icon-copy.c2 { color: rgba(0,0,0,0.2); transform: translate(12px, 14px); filter: blur(1px); }
        #shopModal .shop-rec-icon-main {
            color: var(--rec-accent);
            filter: drop-shadow(0 0 22px rgba(var(--rec-accent-rgb), 0.65));
        }
        @keyframes shopRecIconFloat {
            0%, 100% { transform: translateZ(50px) translateY(0); }
            50% { transform: translateZ(50px) translateY(-9px); }
        }
        #shopModal .shop-rec-card-chips {
            display: flex; gap: 8px; position: relative; z-index: 2;
            transform: translateZ(35px);
        }
        #shopModal .shop-rec-chip {
            display: inline-flex; align-items: center;
            padding: 3px 11px; border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.3);
            background: rgba(10,14,22,0.32);
            color: #e2e8f0; font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
            backdrop-filter: blur(4px);
        }
        @keyframes shopRecFloat {
            0%, 100% { transform: translateY(0) rotateZ(-0.4deg); }
            50% { transform: translateY(-12px) rotateZ(0.4deg); }
        }

        /* —— 左右切换箭头 —— */
        #shopModal .shop-rec-arrow {
            position: absolute; top: 50%; transform: translateY(-50%); z-index: 28;
            width: 42px; height: 42px; border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.18);
            background: rgba(9,13,20,0.42); color: rgba(255,255,255,0.75);
            font-size: 14px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(8px); transition: all 0.25s ease;
        }
        #shopModal .shop-rec-arrow.prev { left: 18px; }
        #shopModal .shop-rec-arrow.next { right: 18px; }
        #shopModal .shop-rec-arrow:hover {
            background: var(--rec-accent); border-color: transparent; color: #10141c;
            transform: translateY(-50%) scale(1.08);
            box-shadow: 0 0 22px rgba(var(--rec-accent-rgb), 0.55);
        }
        #shopModal .shop-rec-hint {
            position: absolute; left: 22px; bottom: 20px; z-index: 25;
            display: inline-flex; align-items: center; gap: 7px;
            font-size: 11px; color: rgba(255,255,255,0.5);
        }
        #shopModal .shop-rec-hint i { color: rgba(255,255,255,0.65); }

        /* —— 大长方形右下角圆点（可点击 / 滚轮切换） —— */
        #shopModal .shop-rec-dots {
            position: absolute; right: 20px; bottom: 15px; z-index: 30;
            display: flex; align-items: center; gap: 7px;
            padding: 9px 13px; border-radius: 999px;
            background: rgba(8,12,20,0.52); border: 1px solid rgba(255,255,255,0.15);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        #shopModal .shop-rec-dot {
            width: 7px; height: 7px; padding: 0; border-radius: 999px;
            border: none; background: rgba(255,255,255,0.34); cursor: pointer;
            transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        #shopModal .shop-rec-dot:hover { background: rgba(255,255,255,0.72); transform: scale(1.25); }
        #shopModal .shop-rec-dot.active {
            width: 22px; background: var(--rec-accent);
            box-shadow: 0 0 10px rgba(var(--rec-accent-rgb), 0.85);
        }

        /* —— 大长方形外侧左下角：标题 / 图文 / 推荐理由 / 价格与购买 —— */
        #shopModal .shop-rec-info {
            flex: 0 0 auto; display: flex; align-items: flex-end; justify-content: space-between;
            gap: 28px; padding: 0 6px 2px;
        }
        #shopModal .shop-rec-info-main { min-width: 0; flex: 1; }
        #shopModal .shop-rec-kicker {
            display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
            margin-bottom: 7px;
        }
        #shopModal .shop-rec-tag {
            display: inline-flex; align-items: center;
            padding: 3px 11px; border-radius: 999px;
            background: linear-gradient(135deg, #c0392b, #e67e22);
            color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
            box-shadow: 0 3px 10px rgba(192,57,43,0.3);
        }
        #shopModal .shop-rec-kind,
        #shopModal .shop-rec-stock {
            display: inline-flex; align-items: center; gap: 5px;
            font-size: 12px; color: #8a919a;
        }
        #shopModal .shop-rec-kind i { color: #c0392b; font-size: 11px; }
        #shopModal .shop-rec-stock i { color: #7f8c8d; font-size: 11px; }
        #shopModal .shop-rec-title {
            margin: 0 0 6px; font-size: 22px; line-height: 1.25; color: #2c3e50;
            font-weight: 800; letter-spacing: 0.01em;
        }
        #shopModal .shop-rec-desc {
            margin: 0; max-width: 860px; font-size: 13px; line-height: 1.7; color: #7f8c8d;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        #shopModal .shop-rec-reason {
            display: flex; align-items: center; gap: 7px; margin-top: 8px;
            font-size: 12px; color: #b9770e;
        }
        #shopModal .shop-rec-reason i { color: #f39c12; }
        #shopModal .shop-rec-buy {
            flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
        }
        #shopModal .shop-rec-price { display: flex; align-items: baseline; gap: 8px; color: #c0392b; }
        #shopModal .shop-rec-price b { font-size: 26px; font-weight: 800; line-height: 1; }
        #shopModal .shop-rec-price .unit { font-size: 12px; color: #999; }
        #shopModal .shop-rec-price s { font-size: 12px; color: #b0b6bd; }
        #shopModal .shop-rec-cta {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            min-width: 168px; padding: 12px 24px; border: none; border-radius: 12px;
            background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
            color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
            box-shadow: 0 6px 18px rgba(192,57,43,0.32);
            transition: all 0.25s ease;
        }
        #shopModal .shop-rec-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 24px rgba(192,57,43,0.42);
            filter: brightness(1.04);
        }
        #shopModal .shop-rec-cta:active { transform: translateY(0) scale(0.98); }

        /* —— 暗色模式 —— */
        body.dark-mode #shopModal .shop-rec-title { color: #e8e8e8; }
        body.dark-mode #shopModal .shop-rec-desc { color: #98a0aa; }
        body.dark-mode #shopModal .shop-rec-kind,
        body.dark-mode #shopModal .shop-rec-stock { color: #8a919a; }
        body.dark-mode #shopModal .shop-rec-price s { color: #666; }

        /* —— 响应式 —— */
        @media (max-width: 1100px) {
            #shopModal .shop-rec-stage { min-height: 300px; }
            #shopModal .shop-rec-ensemble { width: 240px; height: 300px; }
            #shopModal .shop-rec-layer { width: 210px; height: 274px; margin: -137px 0 0 -105px; }
            #shopModal .shop-rec-layer.is-front { width: 228px; height: 296px; margin: -148px 0 0 -114px; }
            #shopModal .shop-rec-icon3d { width: 136px; height: 136px; font-size: 78px; }
            #shopModal .shop-rec-title { font-size: 19px; }
        }
        @media (max-width: 900px) {
            #shopModal .shop-rec-stage { min-height: 260px; }
            #shopModal .shop-rec-ensemble { width: 210px; height: 260px; }
            #shopModal .shop-rec-layer { width: 180px; height: 236px; margin: -118px 0 0 -90px; }
            #shopModal .shop-rec-layer.is-front { width: 196px; height: 254px; margin: -127px 0 0 -98px; }
            #shopModal .shop-rec-icon3d { width: 118px; height: 118px; font-size: 66px; }
            #shopModal .shop-rec-info { flex-direction: column; align-items: stretch; gap: 14px; }
            #shopModal .shop-rec-buy { flex-direction: row; align-items: center; justify-content: space-between; }
            #shopModal .shop-rec-eyebrow { left: 14px; top: 14px; padding: 5px 10px; font-size: 10px; }
            #shopModal .shop-rec-index { right: 16px; top: 18px; font-size: 11px; }
            #shopModal .shop-rec-arrow { width: 34px; height: 34px; }
            #shopModal .shop-rec-arrow.prev { left: 10px; }
            #shopModal .shop-rec-arrow.next { right: 10px; }
            #shopModal .shop-rec-hint { display: none; }
        }
    `;

    // ====== PRE 月卡（3D 动态银行卡 + 订阅信息）======
    var monthlyCardCSS = `
        #shopModal .shop-side-count-days {
            background: linear-gradient(135deg, #b8860b 0%, #f0c944 100%);
            color: #3a2605;
        }
        #shopModal .shop-side-item.active .shop-side-count-days { background: rgba(255,255,255,0.32); color: white; }
        #shopModal .shop-mc-bar-tag b { color: #b8860b; }

        #shopModal .shop-mc-wrap { display: flex; flex-direction: column; gap: 20px; padding-bottom: 10px; }
        #shopModal .shop-mc-hero { display: flex; gap: 28px; align-items: stretch; flex-wrap: wrap; }
        #shopModal .shop-mc-scene {
            flex: 1 1 430px; min-width: 340px; perspective: 1200px;
            display: flex; align-items: center; justify-content: center; padding: 16px 4px;
        }
        #shopModal .shop-mc-float { width: 100%; max-width: 480px; animation: shopMcFloat 6.5s ease-in-out infinite; }
        @keyframes shopMcFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        #shopModal .shop-mc-card3d {
            position: relative; width: 100%; aspect-ratio: 1.586 / 1; border-radius: 20px;
            overflow: hidden; transform-style: preserve-3d; transition: transform 0.16s ease-out;
            color: #fff9e8;
            background: linear-gradient(115deg, #1a1206 0%, #3a260b 18%, #8a6512 40%, #e9c766 55%, #fff1bc 63%, #d4af37 74%, #5d400d 100%);
            box-shadow: 0 26px 60px rgba(0,0,0,0.38), 0 10px 24px rgba(184,134,11,0.3), inset 0 1px 0 rgba(255,255,255,0.45);
        }
        #shopModal .shop-mc-card3d::after {
            content: ''; position: absolute; inset: 0; border-radius: 20px; pointer-events: none;
            border: 1px solid rgba(255,240,190,0.45); box-shadow: inset 0 0 40px rgba(255,225,150,0.25);
        }
        #shopModal .shop-mc-aura {
            position: absolute; inset: -20%;
            background: radial-gradient(circle at 30% 20%, rgba(255,235,170,0.45), transparent 45%), radial-gradient(circle at 80% 75%, rgba(255,200,90,0.35), transparent 50%);
            animation: shopMcAura 9s ease-in-out infinite;
        }
        @keyframes shopMcAura { 0%, 100% { opacity: 0.85; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
        #shopModal .shop-mc-shine {
            position: absolute; top: -60%; left: -40%; width: 55%; height: 220%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
            transform: rotate(22deg); animation: shopMcShine 4.8s ease-in-out infinite;
        }
        @keyframes shopMcShine { 0% { left: -55%; } 55% { left: 110%; } 100% { left: 110%; } }
        #shopModal .shop-mc-grid {
            position: absolute; inset: 0; opacity: 0.6;
            background-image: linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
            background-size: 34px 34px;
            -webkit-mask-image: radial-gradient(circle at 50% 50%, #000 30%, transparent 80%);
            mask-image: radial-gradient(circle at 50% 50%, #000 30%, transparent 80%);
        }
        #shopModal .shop-mc-holo {
            position: absolute; right: -40px; bottom: -60px; width: 220px; height: 220px; border-radius: 50%;
            background: conic-gradient(from 0deg, rgba(255,0,128,0.35), rgba(0,200,255,0.35), rgba(255,220,0,0.35), rgba(120,255,150,0.35), rgba(255,0,128,0.35));
            filter: blur(18px); opacity: 0.55; animation: shopMcHolo 12s linear infinite;
        }
        @keyframes shopMcHolo { to { transform: rotate(360deg); } }
        #shopModal .shop-mc-stars span {
            position: absolute; width: 6px; height: 6px; border-radius: 50%;
            background: #fff6cf; box-shadow: 0 0 10px #ffe9a0; animation: shopMcStar 3.6s ease-in-out infinite;
        }
        #shopModal .shop-mc-stars span:nth-child(1) { left: 14%; top: 24%; animation-delay: 0s; }
        #shopModal .shop-mc-stars span:nth-child(2) { left: 48%; top: 14%; width: 4px; height: 4px; animation-delay: 0.6s; }
        #shopModal .shop-mc-stars span:nth-child(3) { left: 78%; top: 30%; animation-delay: 1.2s; }
        #shopModal .shop-mc-stars span:nth-child(4) { left: 28%; top: 66%; width: 4px; height: 4px; animation-delay: 1.8s; }
        #shopModal .shop-mc-stars span:nth-child(5) { left: 62%; top: 58%; animation-delay: 2.4s; }
        #shopModal .shop-mc-stars span:nth-child(6) { left: 88%; top: 72%; width: 5px; height: 5px; animation-delay: 3s; }
        @keyframes shopMcStar { 0%, 100% { opacity: 0.25; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.15); } }
        #shopModal .shop-mc-top {
            position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between;
            padding: 20px 24px 0;
        }
        #shopModal .shop-mc-brand {
            display: inline-flex; align-items: center; gap: 8px;
            font-size: 15px; font-weight: 800; letter-spacing: 0.14em; color: #fff6d5;
            text-shadow: 0 1px 4px rgba(0,0,0,0.55);
        }
        #shopModal .shop-mc-brand i { color: #ffd76a; font-size: 15px; }
        #shopModal .shop-mc-tier {
            font-size: 10px; font-weight: 800; letter-spacing: 0.18em; color: rgba(255,246,213,0.9);
            border: 1px solid rgba(255,246,213,0.42); border-radius: 20px; padding: 4px 10px;
        }
        #shopModal .shop-mc-mid {
            position: relative; z-index: 2; display: flex; align-items: center; gap: 14px;
            padding: 22px 24px 0;
        }
        #shopModal .shop-mc-chip {
            width: 44px; height: 32px; border-radius: 8px;
            background: linear-gradient(135deg, #f7e7a8 0%, #d4af37 45%, #a4791b 100%);
            box-shadow: inset 0 0 0 1px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.2);
            position: relative;
        }
        #shopModal .shop-mc-chip::before, #shopModal .shop-mc-chip::after {
            content: ''; position: absolute; background: rgba(0,0,0,0.18);
        }
        #shopModal .shop-mc-chip::before { left: 8px; right: 8px; top: 50%; height: 1px; }
        #shopModal .shop-mc-chip::after { top: 6px; bottom: 6px; left: 50%; width: 1px; }
        #shopModal .shop-mc-days-tag {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 12px; font-weight: 800; color: #3a2605;
            background: linear-gradient(135deg, #fff4c9 0%, #f0c944 100%);
            border-radius: 20px; padding: 6px 14px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.7);
        }
        #shopModal .shop-mc-days-tag-off { background: rgba(0,0,0,0.28); color: #ffefc9; box-shadow: none; }
        #shopModal .shop-mc-number {
            position: relative; z-index: 2; padding: 18px 24px 0;
            font-family: 'Courier New', monospace; font-size: clamp(15px, 2.2vw, 21px); font-weight: 700;
            letter-spacing: 0.24em; color: #fff6d5; text-shadow: 0 1px 4px rgba(0,0,0,0.55);
        }
        #shopModal .shop-mc-bottom {
            position: absolute; left: 0; right: 0; bottom: 0; z-index: 2;
            display: flex; align-items: flex-end; justify-content: space-between;
            padding: 0 24px 20px;
        }
        #shopModal .shop-mc-label {
            font-size: 8.5px; font-weight: 800; letter-spacing: 0.16em; color: rgba(255,246,213,0.72);
            text-shadow: 0 1px 3px rgba(0,0,0,0.45);
        }
        #shopModal .shop-mc-holder {
            font-size: 13px; font-weight: 800; color: #fff6d5; margin-top: 3px;
            letter-spacing: 0.06em; text-shadow: 0 1px 4px rgba(0,0,0,0.5);
            max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        #shopModal .shop-mc-right { text-align: right; }

        #shopModal .shop-mc-info {
            flex: 1 1 320px; min-width: 300px;
            background: linear-gradient(160deg, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.03) 60%, rgba(0,0,0,0.02) 100%);
            border: 1px solid rgba(212,175,55,0.28); border-radius: 18px;
            padding: 22px 24px; display: flex; flex-direction: column; gap: 14px;
        }
        #shopModal .shop-mc-title {
            display: flex; align-items: center; gap: 10px;
            font-size: 22px; font-weight: 800; color: #2c3e50;
        }
        #shopModal .shop-mc-title i { color: #b8860b; }
        #shopModal .shop-mc-sub { font-size: 12.5px; color: #8a8f98; margin-top: 4px; }
        #shopModal .shop-mc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        #shopModal .shop-mc-stat {
            background: rgba(255,255,255,0.72); border: 1px solid rgba(0,0,0,0.05);
            border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;
        }
        #shopModal .shop-mc-stat span { font-size: 11px; color: #9aa0a6; }
        #shopModal .shop-mc-stat b { font-size: 15px; color: #2c3e50; }
        #shopModal .shop-mc-on { color: #27ae60 !important; }
        #shopModal .shop-mc-off { color: #b0b6bd !important; }
        #shopModal .shop-mc-price-box { display: flex; flex-direction: column; gap: 8px; }
        #shopModal .shop-mc-price { display: flex; align-items: baseline; gap: 8px; color: #b8860b; }
        #shopModal .shop-mc-price b { font-size: 34px; font-weight: 800; letter-spacing: -0.02em; }
        #shopModal .shop-mc-price small { font-size: 12px; color: #8a8f98; }
        #shopModal .shop-mc-limit { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #8a8f98; line-height: 1.7; }
        #shopModal .shop-mc-limit i { color: #c9a227; margin-top: 3px; }
        #shopModal .shop-mc-buy {
            margin-top: auto; width: 100%; padding: 14px 0; border: none; border-radius: 14px;
            font-size: 15px; font-weight: 800; letter-spacing: 0.04em; cursor: pointer; color: #3a2605;
            background: linear-gradient(135deg, #f6e3a1 0%, #e9c766 45%, #d4af37 100%);
            box-shadow: 0 8px 20px rgba(184,134,11,0.35), inset 0 1px 0 rgba(255,255,255,0.7);
            transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        #shopModal .shop-mc-buy:hover:not([disabled]) { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(184,134,11,0.45); filter: brightness(1.04); }
        #shopModal .shop-mc-buy:active:not([disabled]) { transform: translateY(0) scale(0.99); }
        #shopModal .shop-mc-buy[disabled] { background: rgba(0,0,0,0.08); color: #9aa0a6; box-shadow: none; cursor: not-allowed; }
        #shopModal .shop-mc-buy-tip { font-size: 11.5px; color: #9aa0a6; display: flex; align-items: center; gap: 6px; }
        #shopModal .shop-mc-buy-tip i { color: #c9a227; }

        #shopModal .shop-mc-panel {
            background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 18px 20px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }
        #shopModal .shop-mc-panel-title {
            display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #2c3e50;
            margin-bottom: 14px; padding-left: 10px; border-left: 3px solid #d4af37;
        }
        #shopModal .shop-mc-panel-title i { color: #b8860b; }
        #shopModal .shop-mc-rewards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
        #shopModal .shop-mc-reward-row {
            display: flex; align-items: center; gap: 12px; padding: 10px 12px;
            border-radius: 12px; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.04);
        }
        #shopModal .shop-mc-reward-icon {
            width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; font-size: 14px;
        }
        #shopModal .shop-mc-reward-name { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; color: #444; }
        #shopModal .shop-mc-reward-count { font-size: 13px; font-weight: 800; color: #b8860b; }
        #shopModal .shop-mc-reward-chip {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px;
            border: 1px solid transparent; margin: 0 8px 8px 0;
        }
        #shopModal .shop-mc-rules { display: flex; flex-direction: column; gap: 8px; }
        #shopModal .shop-mc-rule { font-size: 12px; color: #8a8f98; line-height: 1.7; display: flex; gap: 8px; align-items: flex-start; }
        #shopModal .shop-mc-rule i { color: #27ae60; margin-top: 3px; }

        body.dark-mode #shopModal .shop-mc-info { background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.25); }
        body.dark-mode #shopModal .shop-mc-title,
        body.dark-mode #shopModal .shop-mc-stat b { color: #e8e8e8; }
        body.dark-mode #shopModal .shop-mc-stat { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.08); }
        body.dark-mode #shopModal .shop-mc-panel { background: #24243a; border-color: rgba(255,255,255,0.08); }
        body.dark-mode #shopModal .shop-mc-panel-title { color: #e8e8e8; }
        body.dark-mode #shopModal .shop-mc-reward-row { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.06); }
        body.dark-mode #shopModal .shop-mc-reward-name { color: #ccc; }
        body.dark-mode #shopModal .shop-mc-rules,
        body.dark-mode #shopModal .shop-mc-rule { color: #98a0aa; }

        @media (max-width: 1100px) {
            #shopModal .shop-mc-hero { flex-direction: column; gap: 18px; }
            #shopModal .shop-mc-scene { flex: 0 0 auto; min-width: 0; }
            #shopModal .shop-mc-float { max-width: 520px; }
        }
    `;

    return warehouseBaseCSS + warehouseDarkCSS + responsiveCSS + shopExtCSS + devCoinCSS + devResetCSS + bundleCSS + recommendCSS + monthlyCardCSS;
}
