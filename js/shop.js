// ==================== 商店系统 ====================
// 功能：使用 PRE Coin 兑换仓库中的道具（不包括所有徽章类）
// 定价：集中在 SHOP_ITEM_PRICES 中，修改价格/折扣只需更新该对象
// 入口：顶部导航栏「商店」→ 全屏弹窗
// 样式：完全自包含（wh-* 基础 + shop-* 扩展），不依赖仓库先打开

var SHOP_DATA_VERSION = 4; // v4: 补齐 precoin_supply_1-4 商店上架条目（自选物品兑换卡可兑换）

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
        stock: -1,
        stockType: 'none',
        enabled: true,
        note: '经验获取 +5%，可与不同类型叠加（I+II+III+Ⅳ 组合可至 +100%）'
    },
    exp_boost_mid: {
        price: 600,
        discount: 0,
        stock: 1,
        stockType: 'daily',
        enabled: true,
        note: '经验获取 +15%，每日限购 1 份，可叠加（I+II+III+Ⅳ 组合可至 +100%）'
    },
    exp_boost_large: {
        price: 1000,
        discount: 0,
        stock: 1,
        stockType: 'weekly',
        enabled: true,
        note: '经验获取 +30%，每周限购 1 份，可叠加（I+II+III+Ⅳ 组合可至 +100%）'
    },
    exp_boost_premium: {
        price: 1800,
        discount: 0,
        stock: 2,
        stockType: 'total',
        enabled: true,
        note: '经验获取 +50%，永久限购 2 份，可叠加（I+II+III+Ⅳ 同时激活可至 +100%）'
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
        note: '永久限购 3 份，立即获得 2000 经验值（最高效）'
    },

    // ===== 消耗品：每月限购特供（stockType: monthly，对应已有仓库道具 ID） =====
    exp_boost_large_monthly: {
        price: 1000,
        discount: 10,
        stock: 1,
        stockType: 'monthly',
        enabled: true,
        warehouseId: 'exp_boost_large', // 与普通版共享仓库条目
        note: '每月限购 1 份，经验获取 +30%，可叠加（月度特供价 90% 折）'
    },
    exp_supply_4_monthly: {
        price: 2000,
        discount: 10,              // ★ 90 折月度特供
        stock: 1,
        stockType: 'monthly',
        enabled: true,
        warehouseId: 'exp_supply_4',
        note: '每月限购 1 份，立即获得 2000 经验值，（月度特供价 90% 折）'
    },
    gacha_ten_monthly: {
        price: 1300,
        discount: 10,
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
        note: '经验补给包 Ⅳ，两张经验补给卡 Ⅳ（共4000 EXP），最高效经验来源（该组合包仅限购 1 份）'
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
        note: '经验加成包 Ⅰ，两张经验加成卡 Ⅰ（各+5%），可与其他类型叠加至最高+50%（该组合包仅限购 1 份）'
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
        note: '经验加成包 Ⅱ，两张经验加成卡 Ⅱ（各+15%），可叠加（该组合包仅限购 1 份）'
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
        note: '经验加成包 Ⅲ，两张经验加成卡 Ⅲ（各+30%），可叠加（该组合包仅限购 1 份）'
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
        stock: 2,
        stockType: 'weekly',
        enabled: true,
        note: '每周限购 2 份：经验补给卡Ⅱ + 经验加成卡Ⅱ + 补签卡 1 张（整包 80% 折）'
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
        price: 5000,
        enabled: true,
        desc: '曾随欢迎邮件发放的限定静态背景，深邃夜色与流光溢彩交织',
        note: '限定返场 · 固定价 5000 PRE Coin，不参与任何促销与折扣；购买后可前往系统设置应用',
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
    { id: 'all',          name: '全部商品',   icon: 'fas fa-th-large' },
    { id: 'consumable',   name: '消耗品',     icon: 'fas fa-bolt' },
    { id: 'material',     name: '材料',       icon: 'fas fa-cubes' },
    { id: 'background',   name: '背景',       icon: 'fas fa-image' },
    { id: 'namecard',     name: '名片',       icon: 'fas fa-id-card' },
    { id: 'daily_limit',  name: '每日限购',   icon: 'fas fa-calendar-day', separator: true },
    { id: 'weekly_limit', name: '每周限购',   icon: 'fas fa-calendar-week' },
    { id: 'monthly_limit',name: '每月限购',   icon: 'fas fa-calendar-alt' },
    { id: 'total_limit',  name: '累计限购',   icon: 'fas fa-infinity' },
    { id: 'bundle',       name: '组合包',     icon: 'fas fa-gift', separator: true }
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
var _shopActiveCategory = 'all';

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
            <div class="wh-toolbar shop-toolbar" id="shopToolbar"></div>
            <div class="wh-content shop-content" id="shopContent"></div>
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

    var modal = ensureShopModal();
    renderShopUI();
    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

function closeShopModal() {
    if (_shopRefreshTimer) { clearInterval(_shopRefreshTimer); _shopRefreshTimer = null; }
    var modal = document.getElementById('shopModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(function() { modal.style.display = 'none'; }, 300);
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

// 渲染分类工具栏（含组合包隔离线 / dev 按钮）
function renderShopToolbar() {
    var toolbar = document.getElementById('shopToolbar');
    if (!toolbar) return;

    var tabsHtml = SHOP_CATEGORIES.map(function(cat) {
        var sep = cat.separator ? '<span class="shop-toolbar-sep"></span>' : '';
        return sep + '<button class="wh-tab' + (cat.id === _shopActiveCategory ? ' active' : '') + '" data-cat="' + cat.id + '">' +
            '<i class="' + cat.icon + '"></i><span>' + cat.name + '</span></button>';
    }).join('');

    // 动态计数：按当前类别过滤 singles + bundles + specials（背景/名片）
    var fc = _shopFilterByCategory(_shopActiveCategory);
    var singleCount = fc.singles.length + (fc.specials ? fc.specials.length : 0);
    var hasS = singleCount > 0, hasB = fc.bundles.length > 0;
    var countHtml;
    if (_shopActiveCategory === 'bundle') {
        countHtml = '<span class="shop-item-count"><i class="fas fa-gift"></i> 在售组合包 <b>' + fc.bundles.length + '</b> 款</span>';
    } else if (hasS && hasB) {
        countHtml = '<span class="shop-item-count"><i class="fas fa-tag"></i> 在售商品 <b>' + singleCount + '</b> 款、组合包 <b>' + fc.bundles.length + '</b> 款</span>';
    } else if (hasB) {
        countHtml = '<span class="shop-item-count"><i class="fas fa-gift"></i> 在售组合包 <b>' + fc.bundles.length + '</b> 款</span>';
    } else {
        countHtml = '<span class="shop-item-count"><i class="fas fa-tag"></i> 在售商品 <b>' + singleCount + '</b> 款</span>';
    }

    // 开发者模式按钮：获取 PRE Coin / 重置购买状态
    var devBtnHtml = isShopDevMode()
        ? '<button class="shop-dev-btn" id="shopDevCoinBtn" title="调整 PRE Coin 持有数量"><i class="fas fa-coins"></i> 获取PRE Coin（dev）</button>'
        : '';
    var devResetBtnHtml = isShopDevMode()
        ? '<button class="shop-dev-btn" id="shopDevResetBtn" title="重置所有物品/组合包的购买状态"><i class="fas fa-rotate-left"></i> 重置购买状态（dev）</button>'
        : '';

    toolbar.innerHTML = tabsHtml +
        '<span class="shop-toolbar-right">' + countHtml + devBtnHtml + devResetBtnHtml + '</span>';

    toolbar.querySelectorAll('.wh-tab').forEach(function(btn) {
        btn.addEventListener('click', function() {
            _shopActiveCategory = btn.getAttribute('data-cat');
            renderShopToolbar();
            renderShopUI();
        });
    });

    var devBtn = document.getElementById('shopDevCoinBtn');
    if (devBtn) {
        devBtn.addEventListener('click', openShopDevCoinModal);
    }

    var devResetBtn = document.getElementById('shopDevResetBtn');
    if (devResetBtn) {
        devResetBtn.addEventListener('click', openShopDevResetModal);
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

    return `
        <div class="wh-item-card shop-bundle-card ${isSoldOut ? 'shop-sold-out' : ''}" data-id="${bundleId}">
            ${priceTagHtml}
            <span class="wh-type-tag shop-bundle-type">组合包</span>
            <div class="wh-item-icon shop-bundle-icon" style="background: ${hexToRgbaShop(cfg.color, 0.15)};">
                ${_shopItemIconHtml(cfg.icon, cfg.color)}
            </div>
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
            <div class="shop-ps-label"><i class="fas fa-warehouse"></i> ${labelLine}</div>
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
            flex: 1; overflow-y: auto; padding: 24px 40px;
            display: block; /* 让 .shop-grid 成为真正的网格容器 */
        }
        /* ★ 统一网格容器：单类商品/组合包 均用此 class */
        #shopModal .shop-grid {
            display: grid; gap: 16px; align-content: start;
            grid-template-columns: repeat(5, 1fr);
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
        @media (max-width: 1400px) { #shopModal .shop-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 1100px) { #shopModal .shop-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 800px)  { #shopModal .shop-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px)  {
            #shopModal .wh-header, #shopModal .wh-toolbar, #shopModal .wh-footer { padding: 14px 16px !important; }
            #shopModal .wh-stats { display: none; }
            #shopModal .wh-content { padding: 16px; }
            #shopModal .shop-grid { grid-template-columns: repeat(1, 1fr); }
        }
    `;

    // ====== 商店扩展 ======
    var shopExtCSS = `
        #shopModal .shop-fullscreen {
            width: 100%; height: 100%;
            display: flex; flex-direction: column;
            background: #f5f6fa; overflow: hidden;
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

    return warehouseBaseCSS + warehouseDarkCSS + responsiveCSS + shopExtCSS + devCoinCSS + devResetCSS + bundleCSS;
}
