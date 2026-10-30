// ==================== 仓库系统 ====================
// 仓库功能：存放启动器内可用的道具/材料等
// 数据按账户隔离存储（localStorage key = warehouse_<username>），不同账户仓库互不相通
// 入口：游戏中心顶部导航栏「仓库」条目（登录页不显示）
// 道具接入：
//   - 经验加成卡：支持多类型叠加（I+II+III+Ⅳ+V 五种不同类型可同时生效任意5张，同类型不可叠加），每张30分钟；同时激活5张时叠加可达 +175%
//   - 幸运币：使用后激活幸运状态，下一次提取自动消耗并提升稀有项概率
//   - 单抽/十连卡券：提取时自动优先使用（免费抵扣狂气消耗）
//   - 补签卡：在每日签到页点击未解锁的奖励卡即可使用，立即解锁并领取该天奖励
//   - 经验值补给卡：使用后立即获得对应点数经验值，直接对账户等级生效
//   - PRE Coin 补给包：使用后立即获得对应数量 PRE Coin，直接对账户余额生效（addPreCoin）
// 开发者模式：系统设置开启开发者模式后，仓库工具栏最右侧显示「获取道具（dev）」按钮

var WAREHOUSE_DATA_VERSION = 5; // v5: 经验加成卡叠加上限 3 → 4（支持 I+II+III+Ⅳ 同时激活可达 +100%）

// 物品图标统一渲染：优先使用 Lucide（lucide-bridge.js），桥接层缺失时回退 Font Awesome
function _whItemIconHtml(icon, color) {
    if (typeof preIcon === 'function') return preIcon(icon, { color: color });
    return '<i class="' + icon + '" style="color:' + color + ';"></i>';
}

// ===== 开发者移除模式状态（由「移除道具（dev）」按钮切换） =====
var WAREHOUSE_REMOVE_MODE = false;

// ===== 手动开关：是否在道具卡片上显示来源文本（如 dev 发放写入的「测试发放」） =====
// true = 显示来源文本；false = 隐藏（所有道具卡片统一生效）
var WAREHOUSE_SHOW_SOURCE = true;

// ==================== 道具目录 ====================
// category: consumable 消耗品; material 材料; badge 徽章
// rarity: common 普通; rare 稀有; epic 史诗; legendary 传说（用于排序/边框/类型tag配色）
// showSource: 是否在卡片上显示来源文本（需同时满足顶部 WAREHOUSE_SHOW_SOURCE 全局开关）
// 邮件系统对接：附件 type='warehouse' 时通过 warehouseAddItem 自动发放，新增道具无需修改邮件系统
var WAREHOUSE_ITEMS = {
    // ---- 消耗品 ----
    // flavorText: 物品配文（风味文本），展示在物品详情弹窗中，全文以斜体显示
    exp_boost_small: {
        name: '经验值加成卡 Ⅰ', icon: 'fas fa-gauge', color: '#3498db',
        category: 'consumable', rarity: 'common', showSource: true,
        desc: '使用后30分钟内，经验获取提升5%。（可与不同类型加成卡叠加，同类型不可叠加，最多同时5张。当 I+II+III+Ⅳ+V 中任意五张同时激活时，叠加可达 +175%。）',
        flavorText: '一张微微泛着蓝色光芒的卡片，握在手中时，仿佛连时间的流速都变得更有价值。\n——是谁研发出的这张卡片呢？也许这是一个新的开始。',
        source: '活动奖励 / 商店兑换', usable: true, _boostType: 'small', _boostPercent: 5
    },
    exp_boost_mid: {
        name: '经验值加成卡 Ⅱ', icon: 'fas fa-chart-line', color: '#9b59b6',
        category: 'consumable', rarity: 'rare', showSource: true,
        desc: '使用后30分钟内，经验获取提升15%。（可与不同类型加成卡叠加，同类型不可叠加，最多同时5张。当 I+II+III+Ⅳ+V 中任意五张同时激活时，叠加可达 +175%。）',
        flavorText: '一张微微泛着紫色光芒的卡片，激活它的人会感到思维前所未有地敏捷。\n——或许这张卡片内含的可能性远比你想象的更多。',
        source: '活动奖励 / 商店兑换', usable: true, _boostType: 'mid', _boostPercent: 15
    },
    exp_boost_large: {
        name: '经验值加成卡 Ⅲ', icon: 'fas fa-rocket', color: '#f39c12',
        category: 'consumable', rarity: 'epic', showSource: true,
        desc: '使用后30分钟内，经验获取提升30%。（可与不同类型加成卡叠加，同类型不可叠加，最多同时5张。当 I+II+III+Ⅳ+V 中任意五张同时激活时，叠加可达 +175%。）',
        flavorText: '一张微微泛着黄色光芒的卡片，仿佛下一秒就要升空 \n——所谓效率的极限，本来就是用来被突破的。',
        source: '特殊活动奖励', usable: true, _boostType: 'large', _boostPercent: 30
    },
    exp_boost_premium: {
        name: '经验值加成卡 Ⅳ', icon: 'fas fa-fire', color: '#c0392b',
        category: 'consumable', rarity: 'legendary', showSource: true,
        desc: '使用后30分钟内，经验获取提升50%。（可与不同类型加成卡叠加，同类型不可叠加，最多同时5张。当 I+II+III+Ⅳ+V 中任意五张同时激活时，叠加可达 +175%。）',
        flavorText: '一张微微泛着红色光芒的卡片，炽红烈焰沿卡缘燃起，连空气都被蒸腾出涟漪 \n——这是经验加成的极致形态，令人难以直视。',
        source: '高级活动奖励 / 商店兑换', usable: true, _boostType: 'premium', _boostPercent: 50
    },
    exp_boost_5: {
        name: '经验值加成卡 V', icon: 'fas fa-bolt', color: '#ff2d55',
        category: 'consumable', rarity: 'legendary', showSource: true,
        desc: '使用后30分钟内，经验获取提升75%。（该卡仅在阶段突破·极限模式（121级后）可用；可与不同类型加成卡叠加，同类型不可叠加，最多同时5张。当 I+II+III+Ⅳ+V 中任意五张同时激活时，叠加可达 +175%。）',
        flavorText: '一道撕裂天穹的猩红闪电，将经验加成的极限推向了又一个顶峰 \n——当雷霆落下，所有的天花板都不过是一地碎片。',
        source: '阶段突破·极限里程碑奖励（暂不上架商店）', usable: true, _boostType: 'extreme', _boostPercent: 75, _requireExtreme: true
    },
    gacha_single: {
        name: '单次抽卡卷', icon: 'fas fa-ticket-simple', color: '#2ecc71',
        category: 'material', rarity: 'rare', showSource: true,
        desc: '在抽卡模拟器提取1次时自动优先使用，本次提取免扣狂气。',
        flavorText: '一张薄薄的券，却承载着一次与命运握手言和的机会。\n——命运从来不会提前预告答案，而你要做的只是伸出手。',
        source: '签到 / 邮件附件', usable: false
    },
    gacha_ten: {
        name: '十连抽卡卷', icon: 'fas fa-layer-group', color: '#8e44ad',
        category: 'material', rarity: 'epic', showSource: true,
        desc: '在抽卡模拟器十连提取时自动优先使用，本次提取免扣狂气。',
        flavorText: '十声呼唤凝成一纸契约，这一次，幸运或许会十次叩响你的门。\n——当十扇门同时开启，总有一扇门后藏着你期待已久的风景。',
        source: '特殊活动奖励', usable: false
    },
    makeup_card: {
        name: '补签卡', icon: 'fas fa-calendar-plus', color: '#e67e22',
        category: 'consumable', rarity: 'rare', showSource: true,
        desc: '在每日签到中可进行补签。在部分签到活动中可使用该补签卡解锁未被签到的奖励卡，并领取该天奖励。（在每日签到中最多补签两次）',
        flavorText: '错过的时光终究无法倒流，但这张卡可以为你轻轻补上那一天的印记。\n——认真对待每一天的人，也值得被每一天温柔以待。',
        source: '活动奖励 / 邮件附件', usable: false
    },
    luck_coin: {
        name: '幸运币', icon: 'fas fa-dice-five', color: '#f1c40f',
        category: 'material', rarity: 'rare', showSource: true,
        desc: '可在幸运抽奖机投币口投入：下一次抽取时普通奖品概率提升。不同档位幸运币不可同时投入，单次最多投入 10 枚；普通档位奖励合计概率上限 75%。（该幸运币效果与「幸运币 · 普通」一致，并自新版起不再对抽卡模拟器生效）',
        flavorText: '把它轻轻抛起的那一刻，仿佛连概率女神都忍不住多看了你一眼。\n——所谓幸运，不过是机会恰好遇见了相信它的人。',
        source: '商店 / 新手组合包', usable: false
    },
    luck_coin_common: {
        name: '幸运币 · 普通', icon: 'fas fa-coins', color: '#95a5a6',
        category: 'material', rarity: 'common', showSource: true,
        desc: '可在幸运抽奖机中使用：下一次抽取时普通奖品概率提升。不同档位幸运币不可同时投入，单次最多投入 10 枚；普通档位奖励合计概率上限 75%（超出部分无效）。',
        flavorText: '一枚朴素的银色硬币，却能让平凡的时刻悄悄偏向你。\n——幸运从不喧哗，它只是站在你这边。',
        source: '签到（前半月）/ 通行证 1-30 级 / 自选兑换卡', usable: false
    },
    luck_coin_rare: {
        name: '幸运币 · 稀有', icon: 'fas fa-coins', color: '#f1c40f',
        category: 'material', rarity: 'rare', showSource: true,
        desc: '可在幸运抽奖机中使用：下一次抽取时稀有奖品概率提升。不同档位幸运币不可同时投入，单次最多投入 10 枚；稀有档位奖励合计概率上限 65%（超出部分无效）。',
        flavorText: '金色纹路在币面上流转，命运的天平开始微微倾斜。\n——它会记得每一次被投入投币口的瞬间。',
        source: '签到（后半月）/ 通行证 31-60 级 / 自选兑换卡', usable: false
    },
    luck_coin_epic: {
        name: '幸运币 · 史诗', icon: 'fas fa-coins', color: '#9b59b6',
        category: 'material', rarity: 'epic', showSource: true,
        desc: '可在幸运抽奖机中使用：下一次抽取时史诗奖品概率提升。不同档位幸运币不可同时投入，单次最多投入 10 枚；史诗档位奖励合计概率上限 40%（超出部分无效）。',
        flavorText: '紫色的微光自币心升起，那是对更高处的一次郑重邀请。\n——史诗从不轻易现身，除非你足够诚心。',
        source: '通行证 61-90 级 / 自选兑换卡', usable: false
    },
    luck_coin_legend: {
        name: '幸运币 · 传说', icon: 'fas fa-coins', color: '#e67e22',
        category: 'material', rarity: 'legendary', showSource: true,
        desc: '可在幸运抽奖机中使用：下一次抽取时传说奖品概率提升。不同档位幸运币不可同时投入，单次最多投入 10 枚；传说档位奖励合计概率上限 25%（超出部分无效）。',
        flavorText: '炽金的光晕包裹着这枚传说中的硬币，投下的刹那，整台抽奖机都会为之震颤。\n——传说的门槛很高，但幸运女神此刻正注视着你。',
        source: '通行证 91-120 级 / 自选兑换卡', usable: false
    },
    // ---- 幸运币 袋 / 盒（开箱型道具：随机开出对应档位幸运币；暂不加入自选物品兑换卡）----
    luck_bag_common: {
        name: '一袋幸运币 · 普通', icon: 'fas fa-shopping-bag', color: '#95a5a6',
        category: 'material', rarity: 'common', showSource: true,
        desc: '使用后随机开出 3~5 枚「幸运币 · 普通」。',
        flavorText: '沉甸甸的一小袋银币，倒出来时叮当作响。\n——幸运这东西，有时候也论袋卖。',
        source: '特殊活动奖励（暂未投放）', usable: true, _luckPack: { coinId: 'luck_coin_common', min: 3, max: 5 }
    },
    luck_bag_rare: {
        name: '一袋幸运币 · 稀有', icon: 'fas fa-shopping-bag', color: '#f1c40f',
        category: 'material', rarity: 'rare', showSource: true,
        desc: '使用后随机开出 3~5 枚「幸运币 · 稀有」。',
        flavorText: '袋口微微透出金光，掂一掂就知道今天手气不错。\n——好运成串而来时，记得接稳。',
        source: '特殊活动奖励（暂未投放）', usable: true, _luckPack: { coinId: 'luck_coin_rare', min: 3, max: 5 }
    },
    luck_bag_epic: {
        name: '一袋幸运币 · 史诗', icon: 'fas fa-shopping-bag', color: '#9b59b6',
        category: 'material', rarity: 'epic', showSource: true,
        desc: '使用后随机开出 3~5 枚「幸运币 · 史诗」。',
        flavorText: '紫色的雾气从袋口的缝隙里溢出来，隐约有雷鸣般的低吟。\n——史诗的分量，从来压不住袋口的绳结。',
        source: '特殊活动奖励（暂未投放）', usable: true, _luckPack: { coinId: 'luck_coin_epic', min: 3, max: 5 }
    },
    luck_bag_legend: {
        name: '一袋幸运币 · 传说', icon: 'fas fa-shopping-bag', color: '#e67e22',
        category: 'material', rarity: 'legendary', showSource: true,
        desc: '使用后随机开出 3~5 枚「幸运币 · 传说」。',
        flavorText: '据说这袋硬币在铸造时曾浸入流星坠落的余烬。\n——解开绳结的瞬间，连时间都会屏住呼吸。',
        source: '特殊活动奖励（暂未投放）', usable: true, _luckPack: { coinId: 'luck_coin_legend', min: 3, max: 5 }
    },
    luck_box_common: {
        name: '一盒幸运币 · 普通', icon: 'fas fa-box-open', color: '#95a5a6',
        category: 'material', rarity: 'common', showSource: true,
        desc: '使用后随机开出 10~30 枚「幸运币 · 普通」。',
        flavorText: '整整齐齐码放的一盒银币，开盖时像是打开了一小片星空。\n——量变引起质变，幸运也不例外。',
        source: '特殊活动奖励（暂未投放）', usable: true, _luckPack: { coinId: 'luck_coin_common', min: 10, max: 30 }
    },
    luck_box_rare: {
        name: '一盒幸运币 · 稀有', icon: 'fas fa-box-open', color: '#f1c40f',
        category: 'material', rarity: 'rare', showSource: true,
        desc: '使用后随机开出 10~30 枚「幸运币 · 稀有」。',
        flavorText: '盒盖开启的刹那，金色的反光晃得人睁不开眼。\n——这不是钱，这是排面。',
        source: '特殊活动奖励（暂未投放）', usable: true, _luckPack: { coinId: 'luck_coin_rare', min: 10, max: 30 }
    },
    luck_box_epic: {
        name: '一盒幸运币 · 史诗', icon: 'fas fa-box-open', color: '#9b59b6',
        category: 'material', rarity: 'epic', showSource: true,
        desc: '使用后随机开出 10~30 枚「幸运币 · 史诗」。',
        flavorText: '盒子很轻，分量却压手——紫电在币面上游走不散。\n——雷雨天请勿开启（开玩笑的）。',
        source: '特殊活动奖励（暂未投放）', usable: true, _luckPack: { coinId: 'luck_coin_epic', min: 10, max: 30 }
    },
    luck_box_legend: {
        name: '一盒幸运币 · 传说', icon: 'fas fa-box-open', color: '#e67e22',
        category: 'material', rarity: 'legendary', showSource: true,
        desc: '使用后随机开出 10~30 枚「幸运币 · 传说」。',
        flavorText: '传说中，抽奖机曾为这一盒硬币单独亮过一次整排的灯。\n——打开它，然后去改写概率。',
        source: '特殊活动奖励（暂未投放）', usable: true, _luckPack: { coinId: 'luck_coin_legend', min: 10, max: 30 }
    },
    // ---- 随机物品箱（开箱型道具：固定 PRE Coin + 奖池随机抽取，可重复；暂不加入自选物品兑换卡）----
    rand_box_1: {
        name: '随机物品箱 · 初级', icon: 'fas fa-box', color: '#3498db',
        category: 'consumable', rarity: 'rare', showSource: true,
        desc: '使用后开出 3 件物品：固定包含 PRE Coin（10~30 枚），另有 2 件从「经验值补给卡 Ⅰ/Ⅱ、经验值加成卡 Ⅰ/Ⅱ、一袋幸运币（稀有及以下）」中随机抽取（可重复），开出的物品将自动存入仓库。（通过赛季通行证 EX 奖励获取的本物品箱，开出的全部物品均视为「赛季」限定物品（PRE Coin 除外））。',
        flavorText: '一只朴素的蓝色小箱，摇一摇，里面传来叮叮当当的声响。\n——小小的箱子里，也可能装着刚刚好需要的东西。',
        source: '活动奖励', usable: true, _randBox: { tier: 1 }
    },
    rand_box_2: {
        name: '随机物品箱 · 中级', icon: 'fas fa-box-open', color: '#9b59b6',
        category: 'consumable', rarity: 'epic', showSource: true,
        desc: '使用后开出 4 件物品：固定包含 PRE Coin（20~40 枚），另有 3 件从「经验值补给卡 Ⅰ/Ⅱ/Ⅲ、经验值加成卡 Ⅰ/Ⅱ/Ⅲ、一袋幸运币（史诗及以下）、补签卡」中随机抽取（可重复），开出的物品将自动存入仓库。（通过通行证 EX 奖励获取的本物品箱，开出的全部物品均视为「赛季」限定物品（PRE Coin 除外））。',
        flavorText: '紫色箱盖上刻着细密的星纹，开锁的瞬间仿佛能听见概率在低语。\n——中级的分量，是连开箱都值得郑重其事的。',
        source: '通行证 EX 溢出免费奖励', usable: true, _randBox: { tier: 2 }
    },
    rand_box_3: {
        name: '随机物品箱 · 高级', icon: 'fas fa-gifts', color: '#f39c12',
        category: 'consumable', rarity: 'legendary', showSource: true,
        desc: '使用后开出 5 件物品：固定包含 PRE Coin（30~50 枚），另有 4 件从「经验值补给卡 Ⅱ/Ⅲ/Ⅳ、经验值加成卡 Ⅱ/Ⅲ/Ⅳ、一袋幸运币（传说及以下）、补签卡」中随机抽取（可重复），开出的物品将自动存入仓库。（通过通行证 EX 奖励获取的本物品箱，开出的全部物品均视为「赛季」限定物品（PRE Coin 除外））。',
        flavorText: '金色的箱身流转着熔岩般的光泽，据说每一只高级箱都封存着一小段好运的峰值。\n——打开它的人，请做好被惊喜淹没的准备。',
        source: '通行证 EX 溢出付费奖励', usable: true, _randBox: { tier: 3 }
    },
    exp_supply_1: {
        name: '经验值补给卡 Ⅰ', icon: 'fas fa-star', color: '#3498db',
        category: 'consumable', rarity: 'common', showSource: true,
        desc: '使用后获得300点经验值，将立即对账户等级生效。',
        flavorText: '一颗安静的蓝色小星星，是漫长旅途中恰到好处的一次补给。\n——再小的星光，也曾照亮过某个赶路者的夜晚。',
        source: '活动奖励 / 邮件附件', usable: true, _expGain: 300
    },
    exp_supply_2: {
        name: '经验值补给卡 Ⅱ', icon: 'fas fa-atom', color: '#9b59b6',
        category: 'consumable', rarity: 'rare', showSource: true,
        desc: '使用后获得600点经验值，将立即对账户等级生效。',
        flavorText: '紫色星光在掌心微微跳动，成长的脚步似乎又轻快了几分。\n——每一次恰到好处的补给，都是为了让脚步走得更远。',
        source: '活动奖励 / 邮件附件', usable: true, _expGain: 600
    },
    exp_supply_3: {
        name: '经验值补给卡 Ⅲ', icon: 'fas fa-asterisk', color: '#f39c12',
        category: 'consumable', rarity: 'epic', showSource: true,
        desc: '使用后获得1000点经验值，将立即对账户等级生效。',
        flavorText: '金色的星芒几乎要从卡面溢出——厚积，方能薄发。\n——所有看似突如其来的跃升，其实都早有伏笔。',
        source: '活动奖励 / 邮件附件', usable: true, _expGain: 1000
    },
    exp_supply_4: {
        name: '经验值补给卡 Ⅳ', icon: 'fas fa-sun', color: '#e74c3c',
        category: 'consumable', rarity: 'legendary', showSource: true,
        desc: '使用后获得2000点经验值，将立即对账户等级生效。',
        flavorText: '传说中最炽热的一枚红色星辰，只为真正准备好迎接蜕变的人闪耀。\n——当光芒积蓄到极致，蜕变便会在不经意间发生。',
        source: '高级活动奖励 / 商店兑换', usable: true, _expGain: 2000
    },
    exp_supply_5: {
        name: '经验值补给卡 V', icon: 'fas fa-meteor', color: '#ff2d55',
        category: 'consumable', rarity: 'legendary', showSource: true,
        desc: '使用后获得3000点经验值，将立即对账户等级生效。（仅在阶段突破·极限模式（121级后）可用。）',
        flavorText: '一颗从极限深处坠落的猩红陨星，其蕴含的经验密度已超越常理极限 \n——它只向那些敢于踏入极限领域的人展露真容。',
        source: '阶段突破·极限里程碑奖励（暂不上架商店）', usable: true, _expGain: 3000, _requireExtreme: true
    },
    precoin_supply_1: {
        name: 'PRE Coin 补给包 Ⅰ', icon: 'fas fa-coins', color: '#3498db',
        category: 'consumable', rarity: 'common', showSource: true,
        desc: '使用后获得 100 PRE Coin，将立即对账户余额生效。',
        flavorText: '薄薄的一张纸币，却是商店里所有心动物品的入场券。\n——财富的积累，往往始于一枚硬币的重量。',
        source: '活动奖励 / 邮件附件', usable: true, _precoinGain: 100
    },
    precoin_supply_2: {
        name: 'PRE Coin 补给包 Ⅱ', icon: 'fas fa-piggy-bank', color: '#9b59b6',
        category: 'consumable', rarity: 'rare', showSource: true,
        desc: '使用后获得 300 PRE Coin，将立即对账户余额生效。',
        flavorText: '一叠紫色波纹的钞票在指间沙沙作响——商店橱窗里的好东西，正在向你招手。\n——会为喜欢的事物驻足的人，也一定懂得努力的意义。',
        source: '活动奖励 / 邮件附件', usable: true, _precoinGain: 300
    },
    precoin_supply_3: {
        name: 'PRE Coin 补给包 Ⅲ', icon: 'fas fa-wallet', color: '#f39c12',
        category: 'consumable', rarity: 'epic', showSource: true,
        desc: '使用后获得 600 PRE Coin，将立即对账户余额生效。',
        flavorText: '鼓鼓囊囊的金色钱袋，沉甸甸的分量足以让任何一次购物都变得从容。\n——所谓从容，不过是在心动来临之前早已做好准备。',
        source: '高级活动奖励 / 邮件附件', usable: true, _precoinGain: 600
    },
    precoin_supply_4: {
        name: 'PRE Coin 补给包 Ⅳ', icon: 'fas fa-box-open', color: '#e74c3c',
        category: 'consumable', rarity: 'legendary', showSource: true,
        desc: '使用后获得 1500 PRE Coin，将立即对账户余额生效。',
        flavorText: '传说的宝箱在阳光下发出炫目的金光——一次开启，便是商店的一次自由巡礼。\n——自由选择的底气，从来都是自己一点点攒下的。',
        source: '高级活动奖励 / 特殊补偿', usable: true, _precoinGain: 1500
    },

    exchange_card: {
        name: '自选物品兑换卡', icon: 'fas fa-gift', color: '#16a085',
        category: 'consumable', rarity: 'legendary', showSource: true,
        desc: '使用该兑换卡后可以任选一个当前版本可兑换的物品并获取到仓库。（该卡可兑换未来新加入的物品（不含特殊物品）；该兑换卡不包含也不能兑换商店内所有的组合包）',
        flavorText: '「你想要什么？」——这一次，选择权完全握在你自己手中。\n——世间最珍贵的从来不是礼物本身，而是握在手中的选择权。',
        source: '特殊补偿 / 活动奖励', usable: true, _exchangeCard: true
    },

    // ---- 徽章 ----
    medal_pioneer: {
        name: '先驱者勋章', icon: 'fas fa-medal', color: '#f39c12',
        category: 'badge', rarity: 'legendary', showSource: true,
        desc: '授予早期加入启动器的用户纪念勋章。',
        flavorText: '致所有在黎明前就启程的人：后来的万家灯火里，有你们点亮的最初一束。\n——总有人要先迈出第一步，后来者才会看见路的方向。',
        source: '成就系统（敬请期待）', usable: false
    },
    anniv_badge: {
        name: '周年纪念徽章', icon: 'fas fa-award', color: '#f1c40f',
        category: 'badge', rarity: 'legendary', showSource: true,
        desc: 'PRE Launcher 周年庆典限定纪念徽章。',
        flavorText: '一整年的时光凝作一枚徽章，感谢你陪启动器走过的每一个春夏秋冬。\n——时光从不回答，却悄悄把陪伴酿成了最珍贵的纪念。',
        source: '周年庆活动', usable: false
    },
    half_anniv_badge: {
        name: '半周年纪念徽章', icon: 'fas fa-certificate', color: '#e67e22',
        category: 'badge', rarity: 'legendary', showSource: true,
        desc: 'PRE Launcher 半周年限定纪念徽章。',
        flavorText: '半载同行，不长不短，恰好足够把彼此的名字写进同一段故事里。\n——故事还长，这半载只是序章，未来仍值得期待。',
        source: '半周年活动', usable: false
    },
    diligent_medal: {
        name: '勤奋者勋章', icon: 'fas fa-ribbon', color: '#27ae60',
        category: 'badge', rarity: 'legendary', showSource: true,
        desc: '在签到里程碑「标准阶段」中，授予累计签到满180天用户的荣誉勋章，镌刻着持之以恒的勤奋。',
        flavorText: '一百八十个日夜未曾间断——勤奋从来不是一时兴起，而是一种习惯。\n——所有看似轻松的毫不费力，背后都是不为人知的坚持。',
        source: '签到里程碑 · 连续签到180天', usable: false
    },
    persistent_medal: {
        name: '坚持者勋章', icon: 'fas fa-gem', color: '#9b59b6',
        category: 'badge', rarity: 'legendary', showSource: true,
        desc: '在签到里程碑「标准阶段」中，授予累计签到满365天用户的至高荣誉勋章，见证你的持续支持和贡献。',
        flavorText: '三百六十五天的坚持，让这枚勋章拥有了比宝石更璀璨的重量。\n——能把一件事重复三百六十五天的人，本身就已是传奇。',
        source: '签到里程碑 · 连续签到365天', usable: false
    },
    season1_badge: {
        name: '第一赛季纪念徽章', icon: 'fas fa-rocket', color: '#ff6b9d',
        category: 'badge', rarity: 'legendary', showSource: true,
        desc: '购买第一赛季「初始化」通行证组合包即刻获得的限定纪念徽章，可展示在您的用户名片个人荣勋中。',
        flavorText: '「初始化」——一切伟大航程的起点，都被铭刻在这枚徽章之中。\n——第一赛季的序章由你开启，而传说才刚刚开始。',
        source: '购买第一赛季「初始化」通行证组合包', usable: false
    },
    untiring_medal: {
        name: '不懈者勋章', icon: 'fas fa-fire', color: '#e74c3c',
        category: 'badge', rarity: 'legendary', showSource: true,
        desc: '在签到里程碑「阶段突破」中，授予累计签到满 365 天用户的至高荣誉勋章，上面镌刻着你的不懈坚持。',
        flavorText: '当 60 级的天花板被你亲手打破，又用整整一年把它踩在脚下——这枚勋章，是你给自己的回答。\n——所谓极限，不过是留给不够坚持的人的借口。',
        source: '签到里程碑 · 阶段突破 · 累计签到 365 天', usable: false
    },
    breakthrough_medal: {
        name: '突破者勋章', icon: 'fas fa-meteor', color: '#ff2d55',
        category: 'badge', rarity: 'legendary', showSource: true,
        desc: '在签到里程碑「阶段突破 · 极限」中，授予累计签到满 365 天用户的终极荣誉勋章，见证你突破极限的传奇征程。',
        flavorText: '一百二十级只是序章，两百级才是终章——你把所有人眼中的不可能，活成了自己的日常。\n——真正的突破，永远不是抵达终点，而是敢于向终点再迈一步。',
        source: '签到里程碑 · 阶段突破·极限 · 累计签到 365 天', usable: false
    }
};

// 分类筛选配置
var WAREHOUSE_CATEGORIES = [
    { id: 'all', name: '全部', icon: 'fas fa-th-large' },
    { id: 'consumable', name: '消耗品', icon: 'fas fa-bolt' },
    { id: 'material', name: '材料', icon: 'fas fa-cubes' },
    { id: 'badge', name: '徽章', icon: 'fas fa-id-badge' }
];

// 稀有度配置（用于排序/类型tag配色）
var WAREHOUSE_RARITY = {
    common:    { name: '普通', color: '#9aa0a6' },
    rare:      { name: '稀有', color: '#3498db' },
    epic:      { name: '史诗', color: '#9b59b6' },
    legendary: { name: '传说', color: '#f39c12' }
};

// ==================== 账户隔离存储 ====================
// 每个账户的仓库数据独立存储：key = warehouse_<username>
function getWarehouseStorageKey() {
    var currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch (e) {}
    var username = currentUser.username || 'anonymous';
    return 'warehouse_' + username;
}

function getWarehouseData() {
    var stored = localStorage.getItem(getWarehouseStorageKey());
    if (stored) {
        try {
            var data = JSON.parse(stored);
            if (data && data.items && typeof data.items === 'object') {
                // 数据版本升级迁移：保留原有道具，仅剔除道具目录中已不存在的旧道具（如历史测试道具）
                var migrated = data.version !== WAREHOUSE_DATA_VERSION;
                if (migrated) {
                    Object.keys(data.items).forEach(function(id) {
                        if (!WAREHOUSE_ITEMS[id]) {
                            delete data.items[id];
                        } else if (!data.items[id] || typeof data.items[id].qty !== 'number' || data.items[id].qty <= 0) {
                            delete data.items[id]; // 修复无效条目
                        }
                    });
                    data.version = WAREHOUSE_DATA_VERSION;
                }
                if (!data.expBuffs) {
                    // v4 迁移：旧单对象 expBuff → 新数组 expBuffs
                    data.expBuffs = [];
                    if (data.expBuff && data.expBuff.multiplier && data.expBuff.expiresAt) {
                        // 根据 multiplier 反推 type（旧值 1.1/1.25/1.5）
                        var oldMult = data.expBuff.multiplier;
                        var oldType = 'small', oldPercent = 5;
                        if (Math.abs(oldMult - 1.1) < 0.001) { oldType = 'small'; oldPercent = 5; }
                        else if (Math.abs(oldMult - 1.25) < 0.001) { oldType = 'mid'; oldPercent = 15; }
                        else if (Math.abs(oldMult - 1.5) < 0.001) { oldType = 'large'; oldPercent = 30; }
                        data.expBuffs.push({ type: oldType, percent: oldPercent, multiplier: 1 + oldPercent / 100, expiresAt: data.expBuff.expiresAt });
                    }
                    data.expBuff = null;
                    migrated = true;
                }
                if (migrated) saveWarehouseData(data); // 迁移结果立即落盘
                mergeSeasonTimedItems(data); // 合并重复的赛季限定物品条目
                return data;
            }
        } catch (e) {}
    }
    return { version: WAREHOUSE_DATA_VERSION, items: {}, expBuffs: [], timedItems: [], createdAt: new Date().toISOString() };
}

function saveWarehouseData(data) {
    data.version = WAREHOUSE_DATA_VERSION;
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(getWarehouseStorageKey(), JSON.stringify(data));
}

// ==================== 限时物品（签到奖励） ====================
// timedItems 数组：每项 { uid, itemId, qty, obtainedAt, expiresAt, source }
// 与 items（普通无期限物品）完全独立存储，渲染为独立卡片
// 过期清理在 getWarehouseData / 渲染前统一执行，保证过期项自动消失

// 清理已过期的限时物品（每次读取/渲染时自动调用）
function cleanExpiredTimedItems(data) {
    if (!data.timedItems) { data.timedItems = []; return; }
    var now = Date.now();
    var valid = data.timedItems.filter(function(t) {
        return t.expiresAt && new Date(t.expiresAt).getTime() > now && (!t.qty || t.qty > 0);
    });
    if (valid.length !== data.timedItems.length) {
        data.timedItems = valid;
        saveWarehouseData(data);
    }
}

// 合并相同赛季物品：同一 itemId、同一赛季、同一到期时间的多条限时条目合并为一条，数量累加
// 仅处理带 season 标记的赛季限定物品，普通限时物品（签到奖励等）保持独立条目
function mergeSeasonTimedItems(data) {
    if (!data.timedItems || !data.timedItems.length) return false;
    var groups = {};
    var merged = [];
    var changed = false;
    data.timedItems.forEach(function(t) {
        if (!t || !t.season) {
            merged.push(t);
            return;
        }
        var key = t.itemId + '|' + t.season + '|' + (t.expiresAt ? new Date(t.expiresAt).getTime() : 0);
        if (groups[key]) {
            groups[key].qty = (groups[key].qty || 0) + (t.qty || 0);
            if (t.obtainedAt && (!groups[key].obtainedAt || t.obtainedAt < groups[key].obtainedAt)) {
                groups[key].obtainedAt = t.obtainedAt;
            }
            changed = true;
        } else {
            groups[key] = {
                uid: t.uid,
                itemId: t.itemId,
                qty: t.qty || 0,
                obtainedAt: t.obtainedAt,
                expiresAt: t.expiresAt,
                source: t.source || '',
                season: t.season
            };
            merged.push(groups[key]);
        }
    });
    if (changed) {
        data.timedItems = merged;
        saveWarehouseData(data);
    }
    return changed;
}

// 获取当前有效的限时物品列表（自动清理过期项）
function getActiveTimedItems() {
    var data = getWarehouseData();
    cleanExpiredTimedItems(data);
    return data.timedItems || [];
}

// 添加限时物品：warehouseAddTimedItem('exp_supply_1', 1, '签到奖励', 14)
function warehouseAddTimedItem(itemId, qty, source, expiryDays, silent) {
    if (!WAREHOUSE_ITEMS[itemId]) return false;
    qty = Math.max(1, parseInt(qty, 10) || 1);
    if (typeof expiryDays !== 'number' || expiryDays <= 0) expiryDays = 14;
    var data = getWarehouseData();
    cleanExpiredTimedItems(data);
    var now = Date.now();
    var expiresAt = new Date(now + expiryDays * 24 * 60 * 60 * 1000).toISOString();
    // 同一 uid 是一个独立的限时条目，不同批次不同 uid
    var uid = 'ti_' + now + '_' + Math.floor(Math.random() * 1e6);
    data.timedItems.push({
        uid: uid,
        itemId: itemId,
        qty: qty,
        obtainedAt: new Date(now).toISOString(),
        expiresAt: expiresAt,
        source: source || ''
    });
    saveWarehouseData(data);
    // 如果该道具原本就有 usable=true 且有特殊效果字段，保留为限时版
    // silent 为 true 时不弹横条（由调用方汇总展示，如签到结果弹窗）
    if (!silent && typeof showToast === 'function') {
        var item = WAREHOUSE_ITEMS[itemId];
        var expireStr = new Date(expiresAt);
        var dd = ('0' + expireStr.getDate()).slice(-2);
        var mm = ('0' + (expireStr.getMonth() + 1)).slice(-2);
        showToast({ type: 'success', title: '签到奖励', message: '获得限时道具：' + item.name + ' ×' + qty + '（有效期至 ' + mm + '/' + dd + '）' });
    }
    return uid;
}

// 消耗限时道具（按 uid 定位）
function warehouseUseTimedItem(uid) {
    var data = getWarehouseData();
    cleanExpiredTimedItems(data);
    var idx = -1;
    for (var i = 0; i < data.timedItems.length; i++) {
        if (data.timedItems[i].uid === uid) { idx = i; break; }
    }
    if (idx === -1) return false;
    var entry = data.timedItems[idx];
    entry.qty -= 1;
    if (entry.qty <= 0) {
        data.timedItems.splice(idx, 1);
    }
    saveWarehouseData(data);
    return true;
}

// 查询限时物品中某 itemId 的剩余数量（不含普通物品）
function warehouseGetTimedItemCount(itemId) {
    var items = getActiveTimedItems();
    var total = 0;
    items.forEach(function(t) { if (t.itemId === itemId) total += (t.qty || 0); });
    return total;
}

// 批量添加多个限时物品（一次签到发放多个道具时使用）
// silent: 为 true 时不弹提示横条（由调用方汇总展示，如签到结果弹窗）
function warehouseAddTimedItems(items, source, expiryDays, silent) {
    if (!Array.isArray(items)) return [];
    var uids = [];
    items.forEach(function(it) {
        // it:  { itemId: 'exp_supply_1', qty: 1 }
        var uid = warehouseAddTimedItem(it.itemId, it.qty || 1, source, expiryDays, silent);
        if (uid) uids.push(uid);
    });
    return uids;
}

// ==================== 赛季限定物品（通行证等级奖励专用） ====================
// 与限时物品共用 timedItems 存储，条目附加 season（赛季名）标记：
// - 到期时间固定为赛季结束时间，赛季结束后由 cleanExpiredTimedItems 自动过期清空
// - 仓库卡片 / 详情以「XX赛季」文本标记替代剩余天数倒计时
// - 仅通行证等级奖励（含 EX 溢出）发放的物品使用此接口；PRE Coin 等统一货币与其他获取途径不受影响
// warehouseAddSeasonItem('exp_supply_1', 1, '通行证 Lv.10 免费奖励', '第一赛季', '2026-12-30T20:00:00Z')
function warehouseAddSeasonItem(itemId, qty, source, seasonLabel, expiresAt) {
    if (!WAREHOUSE_ITEMS[itemId]) return false;
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var expireMs = expiresAt ? new Date(expiresAt).getTime() : 0;
    if (!expireMs || isNaN(expireMs)) return false;
    var data = getWarehouseData();
    cleanExpiredTimedItems(data);
    var now = Date.now();
    var season = seasonLabel || '第一赛季';
    // 已存在相同赛季、相同道具、相同到期时间的条目时直接累加数量，避免产生重复卡片
    for (var i = 0; i < data.timedItems.length; i++) {
        var existing = data.timedItems[i];
        if (existing.season === season && existing.itemId === itemId &&
            new Date(existing.expiresAt).getTime() === expireMs) {
            existing.qty = (existing.qty || 0) + qty;
            if (source && !existing.source) existing.source = source;
            saveWarehouseData(data);
            return existing.uid;
        }
    }
    var uid = 'ti_' + now + '_' + Math.floor(Math.random() * 1e6);
    data.timedItems.push({
        uid: uid,
        itemId: itemId,
        qty: qty,
        obtainedAt: new Date(now).toISOString(),
        expiresAt: new Date(expireMs).toISOString(),
        source: source || '',
        season: season
    });
    saveWarehouseData(data);
    return uid;
}

// 赛季限定物品显示名：带 season 标记的限时条目在基础名后追加「XX赛季」后缀
function _whSeasonItemName(item, timedEntry) {
    if (timedEntry && timedEntry.season) return item.name + '「' + timedEntry.season + '」';
    return item.name;
}

// ==================== 仓库操作 API（供其他模块调用） ====================
// 添加道具：warehouseAddItem('gacha_single', 1, '签到第3天奖励')
// silent = true 时不弹 toast（由调用方自行汇总展示，如通行证批量领取结算弹窗）
function warehouseAddItem(itemId, qty, source, silent) {
    if (!WAREHOUSE_ITEMS[itemId]) return false;
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var data = getWarehouseData();
    var entry = data.items[itemId];
    if (entry) {
        entry.qty += qty;
    } else {
        entry = data.items[itemId] = { qty: qty, obtainedAt: new Date().toISOString() };
    }
    if (source) entry.source = source;
    saveWarehouseData(data);
    if (!silent && typeof showToast === 'function') {
        var item = WAREHOUSE_ITEMS[itemId];
        showToast({ type: 'success', title: '仓库', message: '获得道具：' + item.name + ' ×' + qty });
    }
    return true;
}

// 消耗道具
function warehouseRemoveItem(itemId, qty) {
    if (!WAREHOUSE_ITEMS[itemId]) return false;
    qty = qty || 1;
    var data = getWarehouseData();
    var entry = data.items[itemId];
    if (!entry || entry.qty < qty) return false;
    entry.qty -= qty;
    if (entry.qty <= 0) delete data.items[itemId];
    saveWarehouseData(data);
    return true;
}

// 查询道具数量（仅普通/无期限道具）
function warehouseGetItemCount(itemId) {
    var data = getWarehouseData();
    return data.items[itemId] ? data.items[itemId].qty : 0;
}

// 查询道具总数量（普通 + 限时，自动清理过期）
function warehouseGetTotalItemCount(itemId) {
    var count = warehouseGetItemCount(itemId);
    count += warehouseGetTimedItemCount(itemId);
    return count;
}

// 消耗道具：优先消耗普通道具，普通不足时消耗限时道具
// 返回 true 表示成功消耗，false 表示数量不足
function warehouseConsumeItem(itemId, qty) {
    if (!WAREHOUSE_ITEMS[itemId]) return false;
    qty = qty || 1;
    var remain = qty;
    // 优先扣普通
    var normal = warehouseGetItemCount(itemId);
    if (normal > 0) {
        var takeNormal = Math.min(normal, remain);
        if (!warehouseRemoveItem(itemId, takeNormal)) return false;
        remain -= takeNormal;
    }
    if (remain > 0) {
        // 再扣限时（按过期时间升序扣，先扣早过期的）
        var timedList = getActiveTimedItems().filter(function(t) { return t.itemId === itemId; });
        // 按 expiresAt 排序
        timedList.sort(function(a, b) { return new Date(a.expiresAt) - new Date(b.expiresAt); });
        for (var i = 0; i < timedList.length && remain > 0; i++) {
            var entry = timedList[i];
            var takeOne = Math.min(entry.qty, remain);
            for (var j = 0; j < takeOne; j++) {
                // warehouseUseTimedItem 每次扣1
                if (!warehouseUseTimedItem(entry.uid)) return false;
            }
            remain -= takeOne;
        }
    }
    return remain === 0;
}

// 查找指定 itemId 的任意一个可用的限时道具 uid（用于需要精确操作限时道具的场景）
function warehouseFindTimedItemUid(itemId) {
    var list = getActiveTimedItems().filter(function(t) { return t.itemId === itemId && t.qty > 0; });
    if (list.length === 0) return null;
    // 返回最早过期的
    list.sort(function(a, b) { return new Date(a.expiresAt) - new Date(b.expiresAt); });
    return list[0].uid;
}

// ==================== 道具效果接入 ====================
// 清理过期加成卡（内部调用），返回有效 buff 数组
function _cleanExpBuffs(data) {
    if (!data.expBuffs) data.expBuffs = [];
    var now = Date.now();
    var valid = [];
    data.expBuffs.forEach(function(b) {
        if (b.expiresAt && new Date(b.expiresAt).getTime() > now) valid.push(b);
    });
    if (valid.length !== data.expBuffs.length) {
        data.expBuffs = valid;
        saveWarehouseData(data);
    }
    return valid;
}

// 经验加成：计算当前叠加后总倍率（所有有效加成卡累加百分比；无加成返回 1）
function getWarehouseExpMultiplier() {
    var data = getWarehouseData();
    var buffs = _cleanExpBuffs(data);
    if (buffs.length === 0) return 1;
    var totalPercent = 0;
    buffs.forEach(function(b) { totalPercent += (b.percent || 0); });
    return 1 + totalPercent / 100;
}

// 经验加成：返回当前生效的加成卡数组（供 UI 展示）
function getWarehouseExpBuffs() {
    var data = getWarehouseData();
    return _cleanExpBuffs(data);
}

// 激活经验加成（支持多类型叠加，同类型刷新时长，最多 5 张同时生效）
// boostType: 'small' | 'mid' | 'large' | 'premium' | 'extreme'，percent: 5/15/30/50/75
// 返回值：{ ok: bool, reason: string|null }
//   ok=true  → 成功激活（新增或刷新时长）
//   ok=false → 失败（同类型已生效 or 已达上限 5 张）
function activateWarehouseExpBuff(boostType, percent) {
    var data = getWarehouseData();
    var buffs = _cleanExpBuffs(data);
    var now = Date.now();
    var expiresAt = new Date(now + 30 * 60 * 1000).toISOString();
    var existingIdx = -1;
    for (var i = 0; i < buffs.length; i++) {
        if (buffs[i].type === boostType) { existingIdx = i; break; }
    }
    if (existingIdx >= 0) {
        // 同类型已生效 → 仅刷新时长（不叠加）
        buffs[existingIdx].expiresAt = expiresAt;
        buffs[existingIdx].percent = percent;
        buffs[existingIdx].multiplier = 1 + percent / 100;
        data.expBuffs = buffs;
        saveWarehouseData(data);
        return { ok: true, refreshed: true };
    }
    if (buffs.length >= 5) {
        return { ok: false, reason: '已同时激活 5 张不同类型加成卡，无法继续叠加' };
    }
    buffs.push({ type: boostType, percent: percent, multiplier: 1 + percent / 100, expiresAt: expiresAt });
    data.expBuffs = buffs;
    saveWarehouseData(data);
    return { ok: true, refreshed: false };
}

// 补签卡：解锁活动签到的指定天（写入 makeupDays，仅解锁该天）
// 支持普通补签卡和限时补签卡（优先消耗普通的，不足时消耗限时的）
function warehouseUseMakeupCard(eventId, day) {
    if (warehouseGetTotalItemCount('makeup_card') <= 0) return false;
    if (typeof getCheckinData !== 'function' || typeof saveCheckinData !== 'function') return false;
    if (!warehouseConsumeItem('makeup_card', 1)) return false;

    var data = getCheckinData(eventId);
    if (!data.makeupDays) data.makeupDays = [];
    if (data.makeupDays.indexOf(day) === -1) data.makeupDays.push(day);
    saveCheckinData(eventId, data);
    return true;
}

// 补签卡：弹窗询问是否使用（在签到页点击未解锁的奖励卡时调用）
// callback(used)：used=true 表示已消耗补签卡并解锁，可继续领取奖励
function warehousePromptMakeupCard(eventId, day, callback) {
    if (warehouseGetTotalItemCount('makeup_card') <= 0) {
        if (typeof showToast === 'function') {
            showToast({ type: 'info', title: '暂未解锁', message: '该奖励卡暂未解锁，请明天登录后继续签到以推进进度' });
        }
        if (typeof callback === 'function') callback(false);
        return;
    }

    var modal = ensureWarehouseConfirmModal();
    var textEl = document.getElementById('whConfirmText');
    if (textEl) textEl.textContent = '该奖励卡暂未解锁，是否使用 1 张补签卡立即解锁第 ' + day + ' 天奖励？';

    var okBtn = document.getElementById('whConfirmOk');
    var cancelBtn = document.getElementById('whConfirmCancel');
    var modalEl = document.getElementById('warehouseConfirmModal');

    // 重新绑定按钮事件（克隆替换以清除旧监听）
    var newOk = okBtn.cloneNode(true);
    var newCancel = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    function close() {
        modalEl.classList.remove('show');
        setTimeout(function() { modalEl.style.display = 'none'; }, 250);
    }

    newOk.addEventListener('click', function() {
        var used = warehouseUseMakeupCard(eventId, day);
        close();
        if (used) {
            if (typeof showToast === 'function') {
                showToast({ type: 'success', title: '补签成功', message: '已使用补签卡解锁第 ' + day + ' 天奖励' });
            }
        } else if (typeof showToast === 'function') {
            showToast({ type: 'error', title: '补签失败', message: '补签卡使用失败，请重试' });
        }
        if (typeof callback === 'function') callback(used);
    });
    newCancel.addEventListener('click', function() {
        close();
        if (typeof callback === 'function') callback(false);
    });

    modalEl.style.display = 'flex';
    setTimeout(function() { modalEl.classList.add('show'); }, 10);
}

// ==================== 开发者模式 ====================
// 与系统设置的开发者模式同一数据源（devModeData[username].enabled）
function isWarehouseDevMode() {
    var currentUser = {};
    var devModeData = {};
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        devModeData = JSON.parse(localStorage.getItem('devModeData') || '{}');
    } catch (e) {}
    return !!(devModeData[currentUser.username] && devModeData[currentUser.username].enabled) ||
           !!(devModeData['__global__'] && devModeData['__global__'].enabled);
}

// ==================== 全屏弹窗 ====================
function ensureWarehouseModal() {
    var modal = document.getElementById('warehouseModal');
    if (modal) return modal;

    // 注入仓库样式
    if (!document.getElementById('warehouse-style')) {
        var style = document.createElement('style');
        style.id = 'warehouse-style';
        style.innerHTML = getWarehouseStyleCSS();
        document.head.appendChild(style);
    }

    modal = document.createElement('div');
    modal.className = 'custom-alert';
    modal.id = 'warehouseModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="wh-fullscreen">
            <div class="wh-header">
                <div class="wh-title">
                    <i class="fas fa-warehouse"></i>
                    <h2>仓库</h2>
                </div>
                <div class="wh-stats" id="whStats"></div>
                <button class="wh-close" id="whCloseBtn"><i class="fas fa-times"></i></button>
            </div>
            <div class="wh-toolbar" id="whToolbar"></div>
            <div class="wh-content" id="whContent"></div>
            <div class="wh-footer">
                <i class="fas fa-shield-alt"></i>
                <span>仓库数据与当前账号绑定，不同账号的仓库相互独立</span>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 关闭事件
    modal.querySelector('#whCloseBtn').addEventListener('click', closeWarehouseModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeWarehouseModal();
    });
    // ESC 关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeWarehouseModal();
    });
    return modal;
}

// 使用/领取确认弹窗（补签卡等）
function ensureWarehouseConfirmModal() {
    var modal = document.getElementById('warehouseConfirmModal');
    if (modal) return modal;

    // 注入仓库样式（补签卡弹窗依赖 .wh-confirm-* 样式）
    if (!document.getElementById('warehouse-style')) {
        var style = document.createElement('style');
        style.id = 'warehouse-style';
        style.innerHTML = getWarehouseStyleCSS();
        document.head.appendChild(style);
    }

    modal = document.createElement('div');
    modal.className = 'custom-alert';
    modal.id = 'warehouseConfirmModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="wh-confirm-box">
            <div class="wh-confirm-icon"><i class="fas fa-calendar-plus"></i></div>
            <h3>使用补签卡</h3>
            <p id="whConfirmText"></p>
            <div class="wh-confirm-actions">
                <button id="whConfirmCancel">取消</button>
                <button id="whConfirmOk">使用</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(function() { modal.style.display = 'none'; }, 250);
        }
    });
    return modal;
}

function showWarehouseModal() {
    // 检查登录状态（与邮件一致）
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser || currentUser === '未登录' || currentUser === '') {
        if (typeof showAlert === 'function') showAlert('请先登录账号以使用仓库功能');
        return;
    }

    var modal = ensureWarehouseModal();

    renderWarehouseToolbar();
    renderWarehouseItems();

    modal.style.display = 'flex';
    setTimeout(function() {
        modal.classList.add('show');
    }, 10);
}

function closeWarehouseModal() {
    var modal = document.getElementById('warehouseModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(function() {
        modal.style.display = 'none';
    }, 300);
}

// 渲染分类筛选工具栏（含开发者模式「获取道具」「移除道具」按钮）
function renderWarehouseToolbar(activeCategory) {
    activeCategory = activeCategory || 'all';
    var toolbar = document.getElementById('whToolbar');
    if (!toolbar) return;

    var tabsHtml = WAREHOUSE_CATEGORIES.map(function(cat) {
        return '<button class="wh-tab' + (cat.id === activeCategory ? ' active' : '') + '" data-cat="' + cat.id + '">' +
            '<i class="' + cat.icon + '"></i><span>' + cat.name + '</span></button>';
    }).join('');

    // 开发者模式：工具栏最右侧显示「获取道具（dev）」和「移除道具（dev）」按钮
    var devHtml = '';
    if (isWarehouseDevMode()) {
        var removeActive = WAREHOUSE_REMOVE_MODE ? ' active' : '';
        devHtml = '<button class="wh-dev-btn wh-remove-dev-btn' + removeActive + '" id="whRemoveDevBtn"><i class="fas fa-trash"></i> 移除道具（dev）</button>' +
                  '<button class="wh-dev-btn" id="whDevBtn"><i class="fas fa-code"></i> 获取道具（dev）</button>';
    }

    toolbar.innerHTML = tabsHtml + devHtml;

    toolbar.querySelectorAll('.wh-tab').forEach(function(btn) {
        btn.addEventListener('click', function() {
            renderWarehouseToolbar(btn.getAttribute('data-cat'));
            renderWarehouseItems();
        });
    });

    var removeDevBtn = document.getElementById('whRemoveDevBtn');
    if (removeDevBtn) removeDevBtn.addEventListener('click', toggleWarehouseRemoveMode);

    var devBtn = document.getElementById('whDevBtn');
    if (devBtn) devBtn.addEventListener('click', showWarehouseDevModal);
}

// 切换开发者移除模式
function toggleWarehouseRemoveMode() {
    WAREHOUSE_REMOVE_MODE = !WAREHOUSE_REMOVE_MODE;
    if (typeof showToast === 'function') {
        if (WAREHOUSE_REMOVE_MODE) {
            showToast({ type: 'info', title: '移除模式', message: '已开启：点击卡片上的「移除」按钮即可删除对应道具' });
        } else {
            showToast({ type: 'info', title: '移除模式', message: '已关闭：恢复正常使用模式' });
        }
    }
    renderWarehouseToolbar();
    renderWarehouseItems();
}

// ==================== 仓库展示：分类分组 / 系列排序 ====================
// 分类展示顺序（徽章固定放在仓库最下面）
var WAREHOUSE_CATEGORY_ORDER = ['consumable', 'material', 'badge'];
var WAREHOUSE_CATEGORY_META = {
    consumable: { name: '消耗品', icon: 'fas fa-bolt' },
    material: { name: '材料', icon: 'fas fa-cubes' },
    badge: { name: '徽章', icon: 'fas fa-id-badge' }
};
// 系列展示顺序：经验值补给卡 → 经验值加成卡 → PRE Coin 补给包 → 一袋/一盒幸运币 → 随机物品箱 → 幸运币 → 抽卡卷 → 补签卡 → 兑换卡
var WAREHOUSE_SERIES_ORDER = ['exp_supply', 'exp_boost', 'precoin_supply', 'luck_bag', 'luck_box', 'rand_box', 'luck_coin', 'gacha_ticket', 'makeup', 'exchange'];
var WAREHOUSE_TIER_MAP = { common: 1, rare: 2, epic: 3, legend: 4, small: 1, mid: 2, large: 3, premium: 4 };

// 返回 { series: 系列key, tier: 系列内档位 }
function getWarehouseSeriesInfo(itemId, item) {
    var m;
    if ((m = itemId.match(/^exp_supply_(\d+)$/))) return { series: 'exp_supply', tier: parseInt(m[1], 10) || 0 };
    if ((m = itemId.match(/^exp_boost_(small|mid|large|premium|5)$/))) return { series: 'exp_boost', tier: WAREHOUSE_TIER_MAP[m[1]] || 9 };
    if ((m = itemId.match(/^precoin_supply_(\d+)$/))) return { series: 'precoin_supply', tier: parseInt(m[1], 10) || 0 };
    if ((m = itemId.match(/^luck_bag_(common|rare|epic|legend)$/))) return { series: 'luck_bag', tier: WAREHOUSE_TIER_MAP[m[1]] || 9 };
    if ((m = itemId.match(/^luck_box_(common|rare|epic|legend)$/))) return { series: 'luck_box', tier: WAREHOUSE_TIER_MAP[m[1]] || 9 };
    if ((m = itemId.match(/^rand_box_(\d+)$/))) return { series: 'rand_box', tier: parseInt(m[1], 10) || 0 };
    if (itemId === 'luck_coin') return { series: 'luck_coin', tier: 0 };
    if ((m = itemId.match(/^luck_coin_(common|rare|epic|legend)$/))) return { series: 'luck_coin', tier: WAREHOUSE_TIER_MAP[m[1]] || 9 };
    if (itemId === 'gacha_single') return { series: 'gacha_ticket', tier: 1 };
    if (itemId === 'gacha_ten') return { series: 'gacha_ticket', tier: 2 };
    if (itemId === 'makeup_card') return { series: 'makeup', tier: 1 };
    if (itemId === 'exchange_card') return { series: 'exchange', tier: 1 };
    return { series: (item && item.category === 'badge') ? 'badge' : 'other', tier: 0 };
}

function getWarehouseSeriesRank(series) {
    var idx = WAREHOUSE_SERIES_ORDER.indexOf(series);
    return idx < 0 ? 99 : idx;
}

// 仓库卡片排序：分类 → 非限时优先 → 系列 → 档位 → 名称
function compareWarehouseCards(a, b) {
    var ia = WAREHOUSE_ITEMS[a.itemId];
    var ib = WAREHOUSE_ITEMS[b.itemId];

    // 1) 分类顺序（徽章固定最底部）
    var ca = WAREHOUSE_CATEGORY_ORDER.indexOf(ia.category);
    var cb = WAREHOUSE_CATEGORY_ORDER.indexOf(ib.category);
    if (ca < 0) ca = WAREHOUSE_CATEGORY_ORDER.length;
    if (cb < 0) cb = WAREHOUSE_CATEGORY_ORDER.length;
    if (ca !== cb) return ca - cb;

    // 2) 限时物品统一排在本分类非限时物品之后
    if (a.kind !== b.kind) return a.kind === 'timed' ? 1 : -1;

    // 3) 系列顺序
    var sa = getWarehouseSeriesInfo(a.itemId, ia);
    var sb = getWarehouseSeriesInfo(b.itemId, ib);
    var ra = getWarehouseSeriesRank(sa.series);
    var rb = getWarehouseSeriesRank(sb.series);
    if (ra !== rb) return ra - rb;

    // 4) 同系列内按档位降序（等级最高的卡片排在最前，如 Ⅴ＞Ⅳ＞Ⅲ＞Ⅱ＞Ⅰ）
    if (sa.tier !== sb.tier) return sb.tier - sa.tier;

    // 5) 名称兜底
    return ia.name.localeCompare(ib.name, 'zh-CN');
}

// 渲染道具网格
function renderWarehouseItems() {
    var content = document.getElementById('whContent');
    var stats = document.getElementById('whStats');
    if (!content) return;

    var activeTab = document.querySelector('#whToolbar .wh-tab.active');
    var category = activeTab ? activeTab.getAttribute('data-cat') : 'all';

    var data = getWarehouseData();
    // 每次渲染前清理过期限时物品
    cleanExpiredTimedItems(data);

    // 收集要渲染的卡片：{ kind: 'normal'|'timed', id, entry, timedMeta }
    var cards = [];

    // 普通物品
    var ownedIds = Object.keys(data.items);
    ownedIds.forEach(function(id) {
        var item = WAREHOUSE_ITEMS[id];
        if (!item) return;
        if (category !== 'all' && item.category !== category) return;
        cards.push({ kind: 'normal', itemId: id, entry: data.items[id] });
    });

    // 限时物品（始终参与渲染，分类筛选同样适用）
    (data.timedItems || []).forEach(function(t) {
        var item = WAREHOUSE_ITEMS[t.itemId];
        if (!item) return;
        if (category !== 'all' && item.category !== category) return;
        cards.push({ kind: 'timed', itemId: t.itemId, entry: t, timedMeta: t });
    });

    // 排序：分类顺序（徽章最底部）→ 限时物品排在本分类末尾 → 系列顺序 → 系列内档位 → 名称
    cards.sort(compareWarehouseCards);

    // 统计信息
    var totalNormalKinds = ownedIds.length;
    var totalNormalQty = ownedIds.reduce(function(sum, id) { return sum + data.items[id].qty; }, 0);
    var totalTimed = (data.timedItems || []).reduce(function(sum, t) { return sum + (t.qty || 0); }, 0);
    if (stats) {
        var buffInfo = '';
        var buffs = getWarehouseExpBuffs();
        if (buffs.length > 0) {
            var totalMult = getWarehouseExpMultiplier();
            var typeLabels = { small: '卡I', mid: '卡II', large: '卡III', premium: '卡Ⅳ', extreme: '卡V' };
            var buffTags = buffs.map(function(b) { return (typeLabels[b.type] || b.type) + '+' + b.percent + '%'; }).join(' ');
            buffInfo = '<span class="wh-stat wh-buff"><i class="fas fa-bolt"></i> 经验加成 ×' + totalMult.toFixed(2) + ' 生效中 <b style="font-weight:normal;font-size:11px;opacity:.85;">[' + buffTags + ']</b></span>';
        }
        stats.innerHTML = '<span class="wh-stat wh-precoin-stat" id="whPrecoinStat" role="button" tabindex="0" title="点击查看 PRE Coin 说明"><i class="fas fa-coins" style="color:#ffd93d;"></i> PRE Coin <b id="whPrecoinStatVal">0</b><i class="fas fa-circle-info wh-precoin-info-icon"></i></span>' +
            '<span class="wh-stat"><i class="fas fa-layer-group"></i> 道具种类 <b>' + totalNormalKinds + '</b></span>' +
            '<span class="wh-stat"><i class="fas fa-cube"></i> 道具总数 <b>' + totalNormalQty + '</b></span>' +
            (totalTimed > 0 ? '<span class="wh-stat"><i class="fas fa-clock" style="color:#f39c12;"></i> 限时 <b style="color:#f39c12;">' + totalTimed + '</b></span>' : '') +
            buffInfo;
        // 更新 PRE Coin 余额并绑定点击事件
        var precoinVal = stats.querySelector('#whPrecoinStatVal');
        if (precoinVal && typeof getPreCoinBalance === 'function') {
            precoinVal.textContent = getPreCoinBalance();
        }
        var precoinStat = stats.querySelector('#whPrecoinStat');
        if (precoinStat) {
            var openPrecoinDesc = function() {
                if (typeof window.showPrecoinDescription === 'function') {
                    window.showPrecoinDescription(0, 'warehouse');
                }
            };
            precoinStat.addEventListener('click', openPrecoinDesc);
            precoinStat.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openPrecoinDesc();
                }
            });
        }
    }

    if (cards.length === 0) {
        content.innerHTML = '<div class="wh-empty"><i class="fas fa-box-open"></i><p>暂无道具</p><span>通过签到、活动、邮件等方式获取道具后，将存放在此处</span></div>';
        return;
    }

    // 详情弹窗左右切换列表：与当前展示顺序一致（分类/搜索/排序过滤后）
    _whDetailNavList = cards.map(function(c) {
        return { id: c.itemId, timedUid: (c.kind === 'timed' && c.timedMeta) ? c.timedMeta.uid : null };
    });

    // 组装卡片：全部视图下按分类分组展示，分组之间用虚线分隔（徽章固定最底部）
    var buildCard = function(c) {
        return buildWarehouseCardHTML(c.itemId, c.entry, WAREHOUSE_REMOVE_MODE, c.kind === 'timed' ? c.timedMeta : null);
    };
    if (category === 'all') {
        var groups = {};
        cards.forEach(function(c) {
            var cat = WAREHOUSE_ITEMS[c.itemId].category || 'other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(c);
        });
        var orderedCats = WAREHOUSE_CATEGORY_ORDER.filter(function(cat) {
            return groups[cat] && groups[cat].length > 0;
        });
        Object.keys(groups).forEach(function(cat) {
            if (orderedCats.indexOf(cat) < 0) orderedCats.push(cat);
        });
        content.innerHTML = orderedCats.map(function(cat) {
            var meta = WAREHOUSE_CATEGORY_META[cat] || { name: getWarehouseCategoryLabel(cat), icon: 'fas fa-cube' };
            var list = groups[cat];
            return '<div class="wh-cat-header"><i class="' + meta.icon + '"></i><span class="wh-cat-name">' + meta.name + '</span><em class="wh-cat-count">' + list.length + '</em></div>' +
                list.map(buildCard).join('');
        }).join('<div class="wh-cat-divider"></div>');
    } else {
        content.innerHTML = cards.map(buildCard).join('');
    }

    // 绑定使用按钮事件
    content.querySelectorAll('.wh-use-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            useWarehouseItem(btn.getAttribute('data-id'), btn.getAttribute('data-timed-uid') || null);
        });
    });

    // 绑定卡片点击：打开物品详情弹窗（移除模式下不响应；按钮的点击已 stopPropagation）
    content.querySelectorAll('.wh-item-card').forEach(function(card) {
        card.addEventListener('click', function() {
            if (WAREHOUSE_REMOVE_MODE) return;
            var id = card.getAttribute('data-item-id');
            if (!id) return;
            var tuid = card.getAttribute('data-timed-uid');
            // 记录当前卡片在展示列表中的位置，供详情弹窗左右切换使用
            var navIdx = -1;
            for (var ni = 0; ni < _whDetailNavList.length; ni++) {
                if (_whDetailNavList[ni].id === id && (_whDetailNavList[ni].timedUid || null) === (tuid || null)) { navIdx = ni; break; }
            }
            showWarehouseItemDetail(id, { timedUid: tuid || null, navIndex: navIdx });
        });
    });

    // 绑定移除按钮事件（移除模式下）
    content.querySelectorAll('.wh-remove-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var timedUid = btn.getAttribute('data-timed-uid');
            if (timedUid) {
                // 移除模式下的限时物品：直接按 uid 删除整个条目
                var wdata = getWarehouseData();
                wdata.timedItems = (wdata.timedItems || []).filter(function(t) { return t.uid !== timedUid; });
                saveWarehouseData(wdata);
                renderWarehouseItems();
                return;
            }
            warehouseRemoveItem(btn.getAttribute('data-id'), 1);
            renderWarehouseItems();
        });
    });
}

// 构建道具卡片 HTML
// timedMeta: null 或限时物品条目对象（带 uid / expiresAt）
function buildWarehouseCardHTML(itemId, entry, removeMode, timedMeta) {
    var item = WAREHOUSE_ITEMS[itemId];
    var rarity = WAREHOUSE_RARITY[item.rarity] || WAREHOUSE_RARITY.common;
    var categoryLabel = getWarehouseCategoryLabel(item.category);
    var isTimed = !!timedMeta;

    // 限时物品：名称后缀（限时）、描述追加时效提示
    // 赛季限定物品：名称追加「XX赛季」后缀，右上角以「XX赛季」文本标记替代剩余天数倒计时
    var displayName = item.name;
    var displayDesc = item.desc;
    var timedTagHtml = '';
    if (isTimed && timedMeta.season) {
        displayName = _whSeasonItemName(item, timedMeta);
        timedTagHtml = '<span class="wh-timed-tag" style="background:#6a5acd;color:#fff;" title="该物品为「' + timedMeta.season + '」物品，赛季结束后将自动过期并清除">「' + timedMeta.season + '」</span>';
    } else if (isTimed && timedMeta.expiresAt) {
        displayName = item.name + '（限时）';
        displayDesc = item.desc + '（该物品具有时效性，有效期为14天）';
        // 计算剩余天数
        var now = Date.now();
        var expireMs = new Date(timedMeta.expiresAt).getTime();
        var daysLeft = Math.ceil((expireMs - now) / (24 * 60 * 60 * 1000));
        if (daysLeft < 0) daysLeft = 0;
        var tagColor, tagBg;
        if (daysLeft <= 3) { tagColor = '#fff'; tagBg = '#e74c3c'; }
        else if (daysLeft <= 7) { tagColor = '#fff'; tagBg = '#f39c12'; }
        else { tagColor = '#fff'; tagBg = '#27ae60'; }
        var expireDate = new Date(expireMs);
        var mm = ('0' + (expireDate.getMonth() + 1)).slice(-2);
        var dd = ('0' + expireDate.getDate()).slice(-2);
        timedTagHtml = '<span class="wh-timed-tag" style="background:' + tagBg + ';color:' + tagColor + ';" title="有效期至 ' + mm + '/' + dd + '">剩' + daysLeft + '天</span>';
    }

    // 来源文本：由顶部 WAREHOUSE_SHOW_SOURCE 全局开关 + 每个道具的 showSource 字段共同控制
    var sourceHtml = '';
    if (WAREHOUSE_SHOW_SOURCE && item.showSource) {
        sourceHtml = '<div class="wh-item-source"><i class="fas fa-link"></i> ' + (entry.source || item.source || '') + '</div>';
    }

    // 移除模式 / 使用按钮：限时物品按钮带 data-timed-uid
    var actionHtml = '';
    if (removeMode) {
        if (isTimed) {
            actionHtml = '<button class="wh-remove-btn" data-timed-uid="' + timedMeta.uid + '"><i class="fas fa-trash"></i> 移除</button>';
        } else {
            actionHtml = '<button class="wh-remove-btn" data-id="' + itemId + '"><i class="fas fa-trash"></i> 移除</button>';
        }
    } else if (item.usable) {
        if (isTimed) {
            actionHtml = '<button class="wh-use-btn" data-id="' + itemId + '" data-timed-uid="' + timedMeta.uid + '"><i class="fas fa-hand-sparkles"></i> 使用</button>';
        } else {
            actionHtml = '<button class="wh-use-btn" data-id="' + itemId + '"><i class="fas fa-hand-sparkles"></i> 使用</button>';
        }
    }

    return '<div class="wh-item-card' + (isTimed ? ' wh-timed-card' : '') + (removeMode ? ' wh-remove-mode' : '') + '" data-item-id="' + itemId + '"' + (isTimed ? ' data-timed-uid="' + timedMeta.uid + '"' : '') + '>' +
        '<span class="wh-qty-badge">×' + entry.qty + '</span>' +
        '<span class="wh-type-tag" style="color:' + rarity.color + '; border-color:' + rarity.color + ';">' + categoryLabel + '</span>' +
        timedTagHtml +
        '<div class="wh-item-icon" style="background: ' + hexToRgba(item.color, 0.15) + ';">' +
            _whItemIconHtml(item.icon, item.color) +
        '</div>' +
        '<div class="wh-item-name">' + displayName + '</div>' +
        '<div class="wh-item-desc">' + displayDesc + '</div>' +
        sourceHtml +
        actionHtml +
    '</div>';
}

// 分类名称
function getWarehouseCategoryLabel(category) {
    var labels = { consumable: '消耗品', material: '材料', badge: '徽章' };
    return labels[category] || '道具';
}

// ==================== 随机物品箱 ====================
// 奖池配置：固定 PRE Coin（区间内随机）+ 从奖池随机抽取 picks 件（允许重复，同 id 自动合并）
var RAND_BOX_CONFIG = {
    // 初级：共 3 件 = PRE Coin(10~30) + 随机 2 件（经验值补给卡Ⅰ/Ⅱ、经验值加成卡Ⅰ/Ⅱ、一袋幸运币 稀有及以下）
    1: { coinMin: 10, coinMax: 30, picks: 2, pool: ['exp_supply_1', 'exp_supply_2', 'exp_boost_small', 'exp_boost_mid', 'luck_bag_common', 'luck_bag_rare'] },
    // 中级：共 4 件 = PRE Coin(20~40) + 随机 3 件（补给卡Ⅰ/Ⅱ/Ⅲ、加成卡Ⅰ/Ⅱ/Ⅲ、一袋幸运币 史诗及以下、补签卡）
    // 该档位仅由通行证 EX 溢出奖励发放，开箱所得物品按第一赛季物品处理（PRE Coin 除外）
    2: { coinMin: 20, coinMax: 40, picks: 3, pool: ['exp_supply_1', 'exp_supply_2', 'exp_supply_3', 'exp_boost_small', 'exp_boost_mid', 'exp_boost_large', 'luck_bag_common', 'luck_bag_rare', 'luck_bag_epic', 'makeup_card'], passExSeason: true },
    // 高级：共 5 件 = PRE Coin(30~50) + 随机 4 件（补给卡Ⅱ/Ⅲ/Ⅳ、加成卡Ⅱ/Ⅲ/Ⅳ、一袋幸运币 传说及以下、补签卡）
    // 该档位仅由通行证 EX 溢出奖励发放，开箱所得物品按第一赛季物品处理（PRE Coin 除外）
    3: { coinMin: 30, coinMax: 50, picks: 4, pool: ['exp_supply_2', 'exp_supply_3', 'exp_supply_4', 'exp_boost_mid', 'exp_boost_large', 'exp_boost_premium', 'luck_bag_common', 'luck_bag_rare', 'luck_bag_epic', 'luck_bag_legend', 'makeup_card'], passExSeason: true }
};

// 通行证 EX 随机物品箱开出的物品所附带的赛季标记与赛季结束时间（用于按赛季限定物品入仓）
function _whRandBoxSeasonInfo(item, entrySeason) {
    var label = entrySeason || null;
    var cfg = (item && item._randBox) ? RAND_BOX_CONFIG[item._randBox.tier] : null;
    if (!label && cfg && cfg.passExSeason) {
        label = (typeof PASS_CONFIG !== 'undefined' && PASS_CONFIG.seasonLabel) ? PASS_CONFIG.seasonLabel : '第一赛季';
    }
    if (!label) return null;
    var expiresAt = (typeof PASS_CONFIG !== 'undefined' && PASS_CONFIG.endTime) ? PASS_CONFIG.endTime : '2026-12-30T20:00:00Z';
    return { label: label, expiresAt: expiresAt };
}

// 开箱抽取一次：返回 { precoin, items: [{ id, qty }] }（同 id 已合并）
function _whRollRandBox(tier) {
    var cfg = RAND_BOX_CONFIG[tier];
    if (!cfg) return null;
    var precoin = cfg.coinMin + Math.floor(Math.random() * (cfg.coinMax - cfg.coinMin + 1));
    var merged = {};
    for (var i = 0; i < cfg.picks; i++) {
        var id = cfg.pool[Math.floor(Math.random() * cfg.pool.length)];
        merged[id] = (merged[id] || 0) + 1;
    }
    var items = Object.keys(merged).map(function(id) { return { id: id, qty: merged[id] }; });
    return { precoin: precoin, items: items };
}

// 发放一次开箱所得（PRE Coin 入账 + 物品入仓库，全程静默，由结果弹窗统一展示）
// entrySeason：所使用物品箱条目的赛季标记；通行证 EX 随机物品箱开出的物品按第一赛季物品入仓
function _whGrantRandBoxRoll(item, roll, batch, entrySeason) {
    var srcLabel = '仓库道具' + (batch ? '（批量）' : '') + '：' + item.name;
    var seasonInfo = _whRandBoxSeasonInfo(item, entrySeason);
    if (roll.precoin > 0 && typeof addPreCoin === 'function') {
        addPreCoin(roll.precoin, srcLabel, true);
    }
    roll.items.forEach(function(g) {
        // PRE Coin 不受赛季限制；其余物品在赛季箱中按赛季限定物品写入限时条目
        if (seasonInfo && typeof warehouseAddSeasonItem === 'function') {
            warehouseAddSeasonItem(g.id, g.qty, srcLabel, seasonInfo.label, seasonInfo.expiresAt);
        } else {
            warehouseAddItem(g.id, g.qty, srcLabel, true);
        }
    });
}

// 使用道具（支持限时物品：传入 timedUid 指定扣减 timedItems 中的条目）
// 返回值：true = 使用成功（或已打开后续流程弹窗）；false = 使用失败（物品不可用/数量不足/加成激活被拒）
function useWarehouseItem(itemId, timedUid) {
    var item = WAREHOUSE_ITEMS[itemId];
    if (!item || !item.usable) return false;

    var data = getWarehouseData();
    cleanExpiredTimedItems(data);

    var timedEntry = null;
    var normalEntry = null;
    if (timedUid) {
        for (var i = 0; i < (data.timedItems || []).length; i++) {
            if (data.timedItems[i].uid === timedUid) { timedEntry = data.timedItems[i]; break; }
        }
        if (!timedEntry || timedEntry.qty <= 0) return false;
    } else {
        normalEntry = data.items[itemId];
        if (!normalEntry || normalEntry.qty <= 0) return false;
    }

    // 自选物品兑换卡：打开选择弹窗，确认兑换后才消耗（不在此处消耗）
    if (item._exchangeCard) {
        openExchangeCardModal();
        return true;
    }

    // 极限限定道具等级检查：经验值加成卡 V / 经验值补给卡 V 仅在阶段突破·极限模式（121级后）可用
    if (item._requireExtreme) {
        var _extOk = false;
        try {
            if (typeof isStageExtremeActive === 'function' && isStageExtremeActive()) {
                _extOk = true;
            } else {
                // fallback：直接读取用户等级
                var _cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
                var _users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                for (var _ui = 0; _ui < _users.length; _ui++) {
                    if (_users[_ui].username === _cu.username) {
                        var _lv = (_users[_ui].gameData && _users[_ui].gameData.level) || 0;
                        var _prof = _users[_ui].userProfile || {};
                        if (_lv >= 121 && _prof.stageExtreme === true) { _extOk = true; }
                        break;
                    }
                }
            }
        } catch (e) {}
        if (!_extOk) {
            if (typeof showToastInfo === 'function') {
                showToastInfo('账户等级未达标，暂不可使用该加成卡/补给卡');
            } else if (typeof showToast === 'function') {
                showToast({ type: 'warning', title: '等级未达标', message: '账户等级未达标，暂不可使用该加成卡/补给卡' });
            }
            return false;
        }
    }

    // 批量使用弹窗：持有数量 > 1 且非加成卡（同类型不可叠加，批量无意义）、非兑换卡时弹出
    var ownedQty = timedEntry ? timedEntry.qty : normalEntry.qty;
    if (ownedQty > 1 && !item._exchangeCard && !item._boostType) {
        showWarehouseBatchUseModal(itemId, timedUid, ownedQty);
        return true;
    }

    var isBoost = item._boostType && typeof item._boostPercent === 'number';
    var expGain = item._expGain || null;
    var precoinGain = item._precoinGain || null;

    // 扣减数量（辅助函数）
    function deductOne() {
        if (timedEntry) {
            timedEntry.qty -= 1;
            if (timedEntry.qty <= 0) {
                var arr = data.timedItems;
                for (var j = 0; j < arr.length; j++) { if (arr[j].uid === timedEntry.uid) { arr.splice(j, 1); break; } }
            }
        } else {
            normalEntry.qty -= 1;
            if (normalEntry.qty <= 0) delete data.items[itemId];
        }
        saveWarehouseData(data);
    }

    // 经验加成卡：先尝试激活（检查叠加条件），失败则不消耗道具
    if (isBoost) {
        var actResult = activateWarehouseExpBuff(item._boostType, item._boostPercent);
        if (!actResult.ok) {
            if (typeof showToast === 'function') {
                showToast({ type: 'warning', title: '无法激活', message: actResult.reason || '激活失败' });
            }
            return;
        }
        // 激活已将最新 expBuffs 写入存储；此处必须重新读取数据再扣减，
        // 否则用函数开头的旧快照保存会把刚激活的 expBuffs 覆盖丢失
        data = getWarehouseData();
        timedEntry = null;
        normalEntry = null;
        if (timedUid) {
            for (var bi = 0; bi < (data.timedItems || []).length; bi++) {
                if (data.timedItems[bi].uid === timedUid) { timedEntry = data.timedItems[bi]; break; }
            }
            if (!timedEntry || timedEntry.qty <= 0) return;
        } else {
            normalEntry = data.items[itemId];
            if (!normalEntry || normalEntry.qty <= 0) return;
        }
        deductOne();

        // 通知
        if (typeof showToast === 'function') {
            var expire = new Date(Date.now() + 30 * 60 * 1000);
            var hh = ('0' + expire.getHours()).slice(-2), mm = ('0' + expire.getMinutes()).slice(-2);
            var timedLabel = timedEntry ? '【限时】' : '';
            if (actResult.refreshed) {
                showToast({ type: 'success', title: '经验加成已刷新', message: timedLabel + '「' + item.name + '」同类型已生效，时长已刷新（至 ' + hh + ':' + mm + '）' });
            } else {
                var cardMult = getWarehouseExpMultiplier();
                // 限时等级倍率提速活动进行中时，提示活动与加成卡叠加后的合计总倍率
                var activeEventMult = (typeof getEventExpMultiplier === 'function') ? getEventExpMultiplier() : 1;
                var rateMessage;
                if (activeEventMult > 1) {
                    var combinedMult = (typeof getTotalExpMultiplier === 'function')
                        ? getTotalExpMultiplier()
                        : Math.round(activeEventMult * cardMult * 10000) / 10000;
                    rateMessage = '加成卡 ×' + cardMult.toFixed(2) + '，叠加限时活动后合计经验获取 ×' + combinedMult.toFixed(2);
                } else {
                    rateMessage = '叠加后经验获取 ×' + cardMult.toFixed(2);
                }
                showToast({ type: 'success', title: '经验加成已激活', message: timedLabel + '「' + item.name + '」已激活，' + rateMessage + '（至 ' + hh + ':' + mm + '）' });
            }
        }
        // 同步刷新签到/名片页的经验倍率条目
        if (typeof updateExpBoostDisplay === 'function') {
            try { updateExpBoostDisplay(); } catch (e) {}
        }
        renderWarehouseItems();
        return;
    }

    // 先消耗道具
    deductOne();

    // 幸运币 袋 / 盒：随机开出对应档位幸运币并直接存入仓库
    if (item._luckPack && item._luckPack.coinId) {
        var lp = item._luckPack;
        var openN = lp.min + Math.floor(Math.random() * (lp.max - lp.min + 1));
        var coinItem = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS[lp.coinId] : null;
        if (openN > 0 && typeof warehouseAddItem === 'function') {
            warehouseAddItem(lp.coinId, openN, '仓库道具：' + item.name, true);
        }
        // 结果弹窗（替代提示横条，防止用户忽略或提示消失过快）
        if (typeof _whShowLuckPackModal === 'function') {
            _whShowLuckPackModal(item, 1, coinItem, [openN]);
        }
        renderWarehouseItems();
        return true;
    }

    // 随机物品箱：固定 PRE Coin + 奖池随机物品，全部自动入账/入仓库
    if (item._randBox) {
        var rbRoll = _whRollRandBox(item._randBox.tier);
        if (rbRoll) {
            var rbSeason = timedEntry ? timedEntry.season : null;
            _whGrantRandBoxRoll(item, rbRoll, false, rbSeason);
            // 「使用结果」弹窗：展示本次开出的全部物品
            _whShowRandBoxModal(item, 1, [rbRoll], rbSeason);
        }
        renderWarehouseItems();
        return true;
    }

    // 经验值补给：记录使用前等级快照（补给反馈弹窗用）
    var _expBefore = (expGain !== null && typeof _whGetLevelSnapshot === 'function') ? _whGetLevelSnapshot() : null;

    // 再激活效果（避免旧数据覆盖）
    if (expGain !== null) {
        if (typeof addCheckinExp === 'function') {
            addCheckinExp(expGain);
        } else {
            console.warn('[Warehouse] addCheckinExp not available, exp supply skipped:', expGain);
            _expBefore = null;
        }
    }
    // PRE Coin 补给：与经验值补给独立分支处理（支持综合补给包同时发放经验+硬币）
    if (precoinGain !== null) {
        if (typeof addPreCoin === 'function') {
            // silent=true：避免 addPreCoin 自带 toast 与下方统一提示重复
            addPreCoin(precoinGain, '仓库道具：' + item.name, true);
        } else {
            console.warn('[Warehouse] addPreCoin not available, precoin supply skipped:', precoinGain);
        }
    }

    // 纯 PRE Coin 补给包：结果弹窗（替代提示横条，醒目展示本次获得的 PRE Coin 总额）
    // 综合补给包（经验+硬币）走下方经验值补给反馈弹窗，其中已附带展示 PRE Coin 数量
    if (precoinGain !== null && expGain === null && typeof _whShowPrecoinSupplyModal === 'function') {
        _whShowPrecoinSupplyModal(item, 1, precoinGain);
        renderWarehouseItems();
        return true;
    }

    // 经验值补给反馈弹窗（替代经验 toast）：动态进度条展示本次增加的经验值/等级
    if (expGain !== null && _expBefore && typeof _whShowExpSupplyModal === 'function') {
        var _expAfter = _whGetLevelSnapshot();
        if (_expAfter.totalExp > _expBefore.totalExp) {
            _whShowExpSupplyModal(item, 1, _expBefore, _expAfter, precoinGain || 0);
            renderWarehouseItems();
            return true;
        }
        // 快照异常（经验未增加）时回落到下方 toast 提示
    }

    if (typeof showToast === 'function') {
        if (expGain !== null && precoinGain !== null) {
            showToast({ type: 'success', title: '综合补给', message: '「' + item.name + '」已使用，获得 ' + expGain + ' 点经验值和 ' + precoinGain + ' PRE Coin，均已生效' });
        } else if (expGain !== null) {
            showToast({ type: 'success', title: '经验值补给', message: '「' + item.name + '」已使用，获得 ' + expGain + ' 点经验值，已对账户等级生效' });
        } else if (precoinGain !== null) {
            showToast({ type: 'success', title: 'PRE Coin 补给', message: '「' + item.name + '」已使用，获得 ' + precoinGain + ' PRE Coin，已对账户余额生效' });
        }
    }
    renderWarehouseItems();
    return true;
}

// ==================== 长按连发工具（仓库 / 商店 / 通行证 ± 步进按钮共用） ====================
// 单击一次步进一次；按住约 420ms 后进入连发模式，步进间隔逐渐缩短（110ms → 45ms）。
// 长按松开时抑制随之而来的 click，避免多走一步。opts.stopPropagation 用于卡片内按钮阻止冒泡。
// 重复调用会刷新步进回调（复用型弹窗每次打开可安全重绑）。
window.bindHoldRepeat = function(btn, onStep, opts) {
    if (!btn) return;
    btn._holdRepeatStep = onStep;
    var stopPropagation = !!(opts && opts.stopPropagation);
    if (btn._holdRepeatBound) {
        btn._holdRepeatStopProp = stopPropagation;
        return;
    }
    btn._holdRepeatBound = true;
    btn._holdRepeatStopProp = stopPropagation;
    var holdTimer = null, repeatTimer = null, suppressClick = false;
    function clearTimers() {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        if (repeatTimer) { clearTimeout(repeatTimer); repeatTimer = null; }
    }
    btn.addEventListener('pointerdown', function(e) {
        if (e.button !== undefined && e.button !== 0) return;
        suppressClick = false;
        holdTimer = setTimeout(function() {
            suppressClick = true;
            var delay = 110;
            var tick = function() {
                if (typeof btn._holdRepeatStep === 'function') btn._holdRepeatStep();
                repeatTimer = setTimeout(tick, delay);
                if (delay > 45) delay = Math.max(45, delay - 6);
            };
            tick();
        }, 420);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function(ev) {
        btn.addEventListener(ev, clearTimers);
    });
    btn.addEventListener('click', function(e) {
        if (btn._holdRepeatStopProp) e.stopPropagation();
        if (suppressClick) { suppressClick = false; e.preventDefault(); return; }
        if (typeof btn._holdRepeatStep === 'function') btn._holdRepeatStep();
    });
    btn.addEventListener('contextmenu', function(e) {
        if (suppressClick) e.preventDefault();
    });
};

// ==================== 批量使用弹窗 ====================
// 当仓库中某物品持有数量 > 1 且可批量使用时，先弹出数量选择弹窗
function showWarehouseBatchUseModal(itemId, timedUid, maxQty) {
    var item = WAREHOUSE_ITEMS[itemId];
    if (!item) return;

    var modal = document.getElementById('warehouseBatchUseModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'custom-alert';
        modal.id = 'warehouseBatchUseModal';
        modal.style.display = 'none';
        modal.innerHTML =
            '<div class="wh-batch-box">' +
                '<button class="wh-batch-close" id="whBatchCloseBtn" type="button"><i class="fas fa-times"></i></button>' +
                '<div class="wh-batch-iconpanel">' +
                    '<div class="wh-batch-icon" style="background:' + hexToRgba(item.color || '#3498db', 0.15) + ';">' +
                        _whItemIconHtml(item.icon || 'fas fa-gift', item.color || '#3498db') +
                    '</div>' +
                    '<div class="wh-batch-hold">持有 ×<span id="whBatchMax">1</span></div>' +
                '</div>' +
                '<div class="wh-batch-info">' +
                    '<h3 class="wh-batch-name"></h3>' +
                    '<p class="wh-batch-desc"></p>' +
                '</div>' +
                '<div class="wh-batch-control">' +
                    '<button class="wh-batch-btn" id="whBatchMinus" type="button"><i class="fas fa-minus"></i></button>' +
                    '<input type="number" id="whBatchInput" min="1" value="1">' +
                    '<button class="wh-batch-btn" id="whBatchPlus" type="button"><i class="fas fa-plus"></i></button>' +
                    '<button class="wh-batch-btn wh-batch-btn-max" id="whBatchMaxBtn" type="button">MAX</button>' +
                '</div>' +
                '<div class="wh-batch-preview" id="whBatchPreview"></div>' +
                '<div class="wh-batch-footer">' +
                    '<button class="wh-batch-cancel" id="whBatchCancel" type="button">取消</button>' +
                    '<button class="wh-batch-confirm" id="whBatchConfirm" type="button"><i class="fas fa-check"></i> 确认使用</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);

        modal.querySelector('#whBatchCloseBtn').addEventListener('click', function() { closeModal(); });
        modal.querySelector('#whBatchCancel').addEventListener('click', function() { closeModal(); });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                e.stopPropagation();
                closeModal();
            }
        }, true);
    }

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(function() { modal.style.display = 'none'; }, 250);
    }

    // 解析限时条目的赛季限定标记（赛季物品名称追加「XX赛季」后缀）
    var _batchSeasonMeta = null;
    if (timedUid) {
        var _batchData = getWarehouseData();
        cleanExpiredTimedItems(_batchData);
        for (var _bi = 0; _bi < (_batchData.timedItems || []).length; _bi++) {
            if (_batchData.timedItems[_bi].uid === timedUid) { _batchSeasonMeta = _batchData.timedItems[_bi]; break; }
        }
    }

    // 填充物品信息（弹窗标题/描述使用 class 选择器，与上方 innerHTML 模板一致）
    modal.querySelector('.wh-batch-name').textContent = _whSeasonItemName(item, _batchSeasonMeta);
    modal.querySelector('.wh-batch-desc').textContent = item.desc;
    modal.querySelector('#whBatchMax').textContent = maxQty;

    var input = modal.querySelector('#whBatchInput');
    input.max = maxQty;
    input.value = 1;

    function _clampInput() {
        var n = parseInt(input.value, 10);
        if (isNaN(n) || n < 1) n = 1;
        if (n > maxQty) n = maxQty;
        input.value = n;
        updatePreview(n);
        return n;
    }

    function updatePreview(n) {
        var preview = modal.querySelector('#whBatchPreview');
        var parts = [];
        if (item._expGain) parts.push((item._expGain * n) + ' 点经验值');
        if (item._precoinGain) parts.push((item._precoinGain * n) + ' PRE Coin');
        if (item._luckPack) parts.push('随机开出 ' + (item._luckPack.min * n) + '~' + (item._luckPack.max * n) + ' 枚幸运币');
        if (item._randBox) {
            var rcfg = RAND_BOX_CONFIG[item._randBox.tier];
            if (rcfg) parts.push('每箱开出 PRE Coin（' + rcfg.coinMin + '~' + rcfg.coinMax + ' 枚）与随机物品 ×' + rcfg.picks);
        }
        if (parts.length > 0) {
            preview.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> 预计效果：使用 ' + n + ' 次后获得 ' + parts.join('，');
        } else {
            preview.innerHTML = '<i class="fas fa-check-circle"></i> 将使用 ' + n + ' 次「' + _whSeasonItemName(item, _batchSeasonMeta) + '」';
        }
    }

    // ± 按钮和输入框事件
    var minusBtn = modal.querySelector('#whBatchMinus');
    var plusBtn = modal.querySelector('#whBatchPlus');
    var maxBtn = modal.querySelector('#whBatchMaxBtn');
    var confirmBtn = modal.querySelector('#whBatchConfirm');

    // ± 步进：单击一次一步，长按可快速批量增减
    function _batchStep(delta) {
        var n = (parseInt(input.value, 10) || 1) + delta;
        input.value = Math.max(1, Math.min(maxQty, n));
        _clampInput();
    }
    if (typeof window.bindHoldRepeat === 'function') {
        window.bindHoldRepeat(minusBtn, function() { _batchStep(-1); });
        window.bindHoldRepeat(plusBtn, function() { _batchStep(1); });
    } else {
        minusBtn.onclick = function() { _batchStep(-1); };
        plusBtn.onclick = function() { _batchStep(1); };
    }
    maxBtn.onclick = function() { input.value = maxQty; _clampInput(); };
    input.addEventListener('input', _clampInput);

    updatePreview(1);

    // 确认按钮
    // 使用 cloneNode 清除旧监听（避免同一弹窗多次打开时重复绑定）
    var newConfirm = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    confirmBtn = newConfirm;
    modal.querySelector('#whBatchConfirm').onclick = function() {
        var useCount = _clampInput();
        closeModal();
        _doBatchUse(itemId, timedUid, useCount, item);
    };

    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

// 批量使用的核心逻辑：循环消耗物品并激活效果，最终统一通知
function _doBatchUse(itemId, timedUid, useCount, item) {
    var totalExpGain = 0, totalPrecoinGain = 0, totalLuckCoins = 0;
    var luckRolls = []; // 每次开出的幸运币数量（幸运币袋/盒专用）
    var randBoxRolls = []; // 每次开箱的完整结果（随机物品箱专用）
    var actualUsed = 0;
    // 记录所使用批次的赛季标记（通行证 EX 随机物品箱开出的物品按赛季限定物品入仓）
    var batchSeasonLabel = null;
    if (timedUid) {
        var _batchInitData = getWarehouseData();
        for (var _bi0 = 0; _bi0 < (_batchInitData.timedItems || []).length; _bi0++) {
            if (_batchInitData.timedItems[_bi0].uid === timedUid) {
                batchSeasonLabel = _batchInitData.timedItems[_bi0].season || null;
                break;
            }
        }
    }
    var _expBefore = (typeof _whGetLevelSnapshot === 'function') ? _whGetLevelSnapshot() : null;

    for (var i = 0; i < useCount; i++) {
        // 每次循环重新扣减（优先按 timedUid 扣限时物品，否则扣普通物品）
        var data = getWarehouseData();
        cleanExpiredTimedItems(data);
        var consumed = false;

        if (timedUid) {
            // 限时物品：按 uid 定位扣减
            for (var j = 0; j < (data.timedItems || []).length; j++) {
                if (data.timedItems[j].uid === timedUid) {
                    data.timedItems[j].qty -= 1;
                    if (data.timedItems[j].qty <= 0) data.timedItems.splice(j, 1);
                    saveWarehouseData(data);
                    consumed = true;
                    break;
                }
            }
        } else {
            // 普通物品：直接扣减
            var entry = data.items[itemId];
            if (entry && entry.qty > 0) {
                entry.qty -= 1;
                if (entry.qty <= 0) delete data.items[itemId];
                saveWarehouseData(data);
                consumed = true;
            }
        }

        if (!consumed) break;
        actualUsed++;

        // 激活效果（与 useWarehouseItem 中单个物品逻辑一致）
        if (item._expGain) {
            if (typeof addCheckinExp === 'function') addCheckinExp(item._expGain);
            totalExpGain += item._expGain;
        }
        if (item._precoinGain) {
            if (typeof addPreCoin === 'function') addPreCoin(item._precoinGain, '仓库道具（批量）：' + item.name, true);
            totalPrecoinGain += item._precoinGain;
        }
        if (item._luckPack) {
            // 幸运币 袋 / 盒：每次随机开出对应档位幸运币
            var lpB = item._luckPack;
            var nB = lpB.min + Math.floor(Math.random() * (lpB.max - lpB.min + 1));
            if (nB > 0 && typeof warehouseAddItem === 'function') {
                warehouseAddItem(lpB.coinId, nB, '仓库道具（批量）：' + item.name, true);
            }
            totalLuckCoins += nB;
            luckRolls.push(nB);
        }
        if (item._randBox) {
            // 随机物品箱：每次独立开箱，结果入 rolls 供弹窗合并展示
            var rbB = _whRollRandBox(item._randBox.tier);
            if (rbB) {
                _whGrantRandBoxRoll(item, rbB, true, batchSeasonLabel);
                randBoxRolls.push(rbB);
            }
        }
    }

    // 幸运币袋/盒：结果弹窗（替代汇总提示横条，防止用户忽略或提示消失过快）
    if (actualUsed > 0 && item._luckPack && item._luckPack.coinId && totalLuckCoins > 0) {
        var coinItemB = (typeof WAREHOUSE_ITEMS !== 'undefined') ? WAREHOUSE_ITEMS[item._luckPack.coinId] : null;
        if (typeof _whShowLuckPackModal === 'function') {
            _whShowLuckPackModal(item, actualUsed, coinItemB, luckRolls);
        }
        renderWarehouseItems();
        return;
    }

    // 随机物品箱：「使用结果」弹窗（合并展示本次批量开箱的全部所得）
    if (actualUsed > 0 && item._randBox && randBoxRolls.length > 0) {
        _whShowRandBoxModal(item, actualUsed, randBoxRolls, batchSeasonLabel);
        renderWarehouseItems();
        return;
    }

    // 经验值补给反馈弹窗（替代经验 toast）：动态进度条展示本次增加的经验值/等级
    if (actualUsed > 0 && totalExpGain > 0 && _expBefore && typeof _whShowExpSupplyModal === 'function') {
        var _expAfter = _whGetLevelSnapshot();
        if (_expAfter.totalExp > _expBefore.totalExp) {
            _whShowExpSupplyModal(item, actualUsed, _expBefore, _expAfter, totalPrecoinGain);
            renderWarehouseItems();
            return;
        }
    }

    // 纯 PRE Coin 补给包：结果弹窗（替代汇总提示横条，醒目展示本次共获得的 PRE Coin 总额）
    if (actualUsed > 0 && totalPrecoinGain > 0 && totalExpGain === 0 && typeof _whShowPrecoinSupplyModal === 'function') {
        _whShowPrecoinSupplyModal(item, actualUsed, totalPrecoinGain);
        renderWarehouseItems();
        return;
    }

    // 汇总通知
    if (actualUsed > 0 && typeof showToast === 'function') {
        var toastType = 'success';
        var toastTitle = '批量使用完成';
        var toastMsg = '「' + item.name + '」共使用 ' + actualUsed + ' 次';
        var extras = [];
        if (totalExpGain > 0) extras.push(totalExpGain + ' 点经验值');
        if (totalPrecoinGain > 0) extras.push(totalPrecoinGain + ' PRE Coin');
        if (totalLuckCoins > 0) extras.push('共开出 ' + totalLuckCoins + ' 枚幸运币（已存入仓库）');
        if (extras.length > 0) toastMsg += '，获得 ' + extras.join('，') + '，均已生效';
        showToast({ type: toastType, title: toastTitle, message: toastMsg });
    }

    renderWarehouseItems();
}

// ==================== 经验值补给反馈弹窗 ====================
// 使用经验值补给卡（含综合补给包）后弹出：以成长等级卡片同款进度条动态展示本次增加的经验值与等级变化
function _whGetLevelSnapshot() {
    var snap = { level: 1, totalExp: 0, inLevel: 0, need: 0, maxLevel: 60, maxed: false };
    try {
        var cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var u = null;
        for (var i = 0; i < users.length; i++) {
            if (users[i].username === cu.username) { u = users[i]; break; }
        }
        if (u && u.gameData) {
            var gd = u.gameData;
            snap.maxLevel = (typeof window.MAX_LEVEL === 'number') ? window.MAX_LEVEL : 60;
            snap.totalExp = (gd.totalExp !== undefined) ? gd.totalExp : 0;
            snap.level = (typeof getLevelFromExp === 'function') ? getLevelFromExp(snap.totalExp) : (gd.level || 1);
            snap.inLevel = (typeof getExpInCurrentLevel === 'function') ? Math.max(0, getExpInCurrentLevel(snap.totalExp, snap.level)) : (gd.exp || 0);
            snap.need = (typeof getExpRequiredForLevel === 'function') ? getExpRequiredForLevel(snap.level) : (gd.expToNext || 0);
            snap.maxed = snap.level >= snap.maxLevel || snap.need <= 0;
        }
    } catch (e) {}
    return snap;
}

// 数字滚动动画（rAF 缓出）
function _wesupCountUp(el, from, to, dur, formatter) {
    if (!el) return;
    if (from === to) { el.textContent = formatter(to); return; }
    var start = null;
    function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = formatter(Math.round(from + (to - from) * eased));
        if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function _whShowExpSupplyModal(item, usedCount, before, after, precoinGain) {
    var gainedExp = Math.max(0, after.totalExp - before.totalExp);
    var gainedLv = Math.max(0, after.level - before.level);
    var pctBefore = before.maxed ? 100 : (before.need > 0 ? Math.min(100, before.inLevel / before.need * 100) : 0);
    var pctAfter = after.maxed ? 100 : (after.need > 0 ? Math.min(100, after.inLevel / after.need * 100) : 0);
    var fmt = function(n) { return n.toLocaleString('zh-CN'); };

    var modal = document.getElementById('warehouseExpSupplyModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'custom-alert';
        modal.id = 'warehouseExpSupplyModal';
        modal.style.display = 'none';
        modal.style.zIndex = 100002; // 需覆盖物品详情弹窗（100001）
        modal.innerHTML =
            '<div class="wesup-box" role="dialog" aria-modal="true">' +
                '<div class="wesup-icon" id="wesupIcon"><i class="fas fa-star"></i></div>' +
                '<h3 class="wesup-title">经验值补给已生效</h3>' +
                '<p class="wesup-sub" id="wesupSub"></p>' +
                '<div class="wesup-gain" id="wesupGain"></div>' +
                '<div class="wesup-precoin" id="wesupPrecoin" style="display:none;"></div>' +
                '<div class="wesup-level-row" id="wesupLevelRow"></div>' +
                '<div class="wesup-bar-wrapper">' +
                    '<div class="wesup-bar-bg"><div class="wesup-bar-inner" id="wesupBarFill"></div></div>' +
                    '<div class="wesup-bar-labels">' +
                        '<span id="wesupExpText">0 / 0 EXP</span>' +
                        '<span id="wesupNextLevel"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="wesup-actions"><button class="wesup-ok" id="wesupOkBtn" type="button">确定</button></div>' +
            '</div>';
        document.body.appendChild(modal);
        modal.querySelector('#wesupOkBtn').addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(function() { modal.style.display = 'none'; }, 250);
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.querySelector('#wesupOkBtn').click();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                e.stopPropagation();
                modal.querySelector('#wesupOkBtn').click();
            }
        }, true);
    }

    // 填充内容
    var iconEl = modal.querySelector('#wesupIcon');
    iconEl.innerHTML = _whItemIconHtml(item.icon || 'fas fa-star', item.color || '#3498db');
    iconEl.style.background = hexToRgba(item.color || '#3498db', 0.15);
    modal.querySelector('#wesupSub').textContent = '「' + item.name + '」' + (usedCount > 1 ? '× ' + usedCount + ' ' : '') + '已对账户等级生效';

    var gainEl = modal.querySelector('#wesupGain');
    var gainSuffix = gainedLv > 0 ? ' · 连升 ' + gainedLv + ' 级' : '';
    var precoinEl = modal.querySelector('#wesupPrecoin');
    if (precoinGain > 0) {
        precoinEl.style.display = 'block';
        precoinEl.textContent = '+' + fmt(precoinGain) + ' PRE Coin';
    } else {
        precoinEl.style.display = 'none';
    }

    // 等级变化行
    var lvRow = modal.querySelector('#wesupLevelRow');
    if (gainedLv > 0) {
        lvRow.innerHTML =
            '<span class="wesup-lv-old">Lv.' + before.level + '</span>' +
            '<i class="fas fa-arrow-right"></i>' +
            '<span class="wesup-lv-new">Lv.' + after.level + '</span>' +
            '<span class="wesup-lv-badge">+' + gainedLv + ' 级</span>';
    } else {
        lvRow.innerHTML = '<span class="wesup-lv-old">Lv.' + after.level + '</span>';
    }

    // 进度条标签
    var expTextEl = modal.querySelector('#wesupExpText');
    var nextEl = modal.querySelector('#wesupNextLevel');
    if (after.maxed) {
        nextEl.textContent = '已达最高等级';
    } else {
        nextEl.textContent = '升级至 Lv.' + (after.level + 1);
    }

    // 打开弹窗并播放动画：进度条先停在使用前进度，随后动态增长到使用后进度（数字同步滚动）
    var barFill = modal.querySelector('#wesupBarFill');
    barFill.style.transition = 'none';
    barFill.style.width = pctBefore + '%';
    void barFill.offsetWidth; // 强制回流，确保起始宽度不产生过渡
    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);

    setTimeout(function() {
        barFill.style.transition = 'width 0.9s cubic-bezier(0.25, 0.8, 0.35, 1)';
        barFill.style.width = pctAfter + '%';
        _wesupCountUp(gainEl, 0, gainedExp, 900, function(v) { return '+' + fmt(v) + ' 点经验值' + gainSuffix; });
        if (after.maxed) {
            _wesupCountUp(expTextEl, before.totalExp, after.totalExp, 900, function(v) { return '累计 ' + fmt(v) + ' EXP'; });
        } else {
            _wesupCountUp(expTextEl, before.inLevel, after.inLevel, 900, function(v) { return fmt(v) + ' / ' + fmt(after.need) + ' EXP'; });
        }
    }, 500);
}

// ==================== 幸运币开箱结果弹窗 ====================
// 使用「一袋/一盒幸运币」系列道具后弹出：醒目展示本次共开出多少枚对应档位的幸运币
// 单次使用 rolls 长度为 1；批量使用时展示每次开箱明细
function _whShowLuckPackModal(item, usedCount, coinItem, rolls) {
    rolls = rolls || [];
    var totalCoins = rolls.reduce(function(s, n) { return s + n; }, 0);
    var coinName = coinItem ? coinItem.name : '幸运币';
    var coinIcon = coinItem && coinItem.icon ? coinItem.icon : 'fas fa-coins';
    var coinColor = coinItem && coinItem.color ? coinItem.color : '#f1c40f';
    var fmt = function(n) { return n.toLocaleString('zh-CN'); };

    var modal = document.getElementById('warehouseLuckPackModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'custom-alert';
        modal.id = 'warehouseLuckPackModal';
        modal.style.display = 'none';
        modal.style.zIndex = 100002; // 覆盖物品详情弹窗（100001）
        modal.innerHTML =
            '<div class="wluck-box" role="dialog" aria-modal="true">' +
                '<div class="wluck-icon" id="wluckIcon"><i class="fas fa-coins"></i></div>' +
                '<h3 class="wluck-title">幸运币开箱</h3>' +
                '<p class="wluck-sub" id="wluckSub"></p>' +
                '<div class="wluck-gain" id="wluckGain"></div>' +
                '<div class="wluck-coin" id="wluckCoin"></div>' +
                '<div class="wluck-rolls" id="wluckRolls" style="display:none;"></div>' +
                '<p class="wluck-note"><i class="fas fa-warehouse"></i> 已自动存入仓库</p>' +
                '<div class="wluck-actions"><button class="wluck-ok" id="wluckOkBtn" type="button">确定</button></div>' +
            '</div>';
        document.body.appendChild(modal);
        modal.querySelector('#wluckOkBtn').addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(function() { modal.style.display = 'none'; }, 250);
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.querySelector('#wluckOkBtn').click();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                e.stopPropagation();
                modal.querySelector('#wluckOkBtn').click();
            }
        }, true);
    }

    // 填充内容
    var iconEl = modal.querySelector('#wluckIcon');
    iconEl.innerHTML = _whItemIconHtml(coinIcon, coinColor);
    iconEl.style.background = hexToRgba(coinColor, 0.15);
    modal.querySelector('#wluckSub').textContent = '「' + item.name + '」' + (usedCount > 1 ? '× ' + usedCount + ' ' : '') + '已使用';

    var coinEl = modal.querySelector('#wluckCoin');
    coinEl.innerHTML = _whItemIconHtml(coinIcon, coinColor) + '<span>' + coinName + '</span>';
    coinEl.style.background = hexToRgba(coinColor, 0.12);
    coinEl.style.borderColor = hexToRgba(coinColor, 0.4);

    // 批量开箱明细
    var rollsEl = modal.querySelector('#wluckRolls');
    if (usedCount > 1) {
        rollsEl.style.display = 'block';
        var rows = rolls.map(function(n, idx) {
            return '<div class="wluck-roll-row"><span>第 ' + (idx + 1) + ' 次</span><b>+' + fmt(n) + ' 枚</b></div>';
        }).join('');
        rollsEl.innerHTML = rows;
    } else {
        rollsEl.style.display = 'none';
        rollsEl.innerHTML = '';
    }

    // 打开弹窗并播放数字滚动动画
    var gainEl = modal.querySelector('#wluckGain');
    gainEl.textContent = '+0 枚';
    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
    setTimeout(function() {
        _wesupCountUp(gainEl, 0, totalCoins, 900, function(v) { return '+' + fmt(v) + ' 枚'; });
    }, 350);
}

// ==================== 随机物品箱「使用结果」弹窗 ====================
// 使用「随机物品箱」系列道具后弹出：以物品卡片网格展示本次开出的全部物品
// 单次使用 rolls 长度为 1；批量使用时合并全部开箱所得一并展示
// seasonLabel：所选物品箱条目的赛季标记（通行证 EX 随机物品箱开出的物品按赛季限定展示）
function _whShowRandBoxModal(item, usedCount, rolls, seasonLabel) {
    rolls = rolls || [];
    var seasonInfo = _whRandBoxSeasonInfo(item, seasonLabel);
    var seasonName = seasonInfo ? seasonInfo.label : null;
    var fmt = function(n) { return n.toLocaleString('zh-CN'); };
    var boxColor = item.color || '#9b59b6';
    var boxIcon = item.icon || 'fas fa-box-open';

    // 合并全部开箱结果：PRE Coin 求和，物品按 id 合并数量
    var totalPrecoin = 0;
    var merged = {}; // id -> qty
    var order = [];  // 保持首次出现顺序
    rolls.forEach(function(r) {
        totalPrecoin += r.precoin || 0;
        (r.items || []).forEach(function(g) {
            if (merged[g.id] === undefined) order.push(g.id);
            merged[g.id] = (merged[g.id] || 0) + g.qty;
        });
    });

    var modal = document.getElementById('warehouseRandBoxModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'custom-alert';
        modal.id = 'warehouseRandBoxModal';
        modal.style.display = 'none';
        modal.style.zIndex = 100002; // 覆盖物品详情弹窗（100001）
        modal.innerHTML =
            '<div class="wrbox-box" role="dialog" aria-modal="true">' +
                '<div class="wrbox-icon" id="wrboxIcon"><i class="fas fa-box-open"></i></div>' +
                '<h3 class="wrbox-title">使用结果</h3>' +
                '<p class="wrbox-sub" id="wrboxSub"></p>' +
                '<div class="wrbox-grid" id="wrboxGrid"></div>' +
                '<p class="wrbox-note" id="wrboxNote"><i class="fas fa-warehouse"></i> 物品已自动存入仓库，PRE Coin 已入账</p>' +
                '<div class="wrbox-actions"><button class="wrbox-ok" id="wrboxOkBtn" type="button">确定</button></div>' +
            '</div>';
        document.body.appendChild(modal);
        modal.querySelector('#wrboxOkBtn').addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(function() { modal.style.display = 'none'; }, 250);
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.querySelector('#wrboxOkBtn').click();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                e.stopPropagation();
                modal.querySelector('#wrboxOkBtn').click();
            }
        }, true);
    }

    // 填充内容
    var iconEl = modal.querySelector('#wrboxIcon');
    iconEl.innerHTML = _whItemIconHtml(boxIcon, boxColor);
    iconEl.style.background = hexToRgba(boxColor, 0.15);
    modal.querySelector('#wrboxSub').textContent = '「' + item.name + '」' + (usedCount > 1 ? '× ' + usedCount + ' ' : '') + '已使用，本次共开出：';
    var noteEl = modal.querySelector('#wrboxNote');
    if (noteEl) {
        noteEl.innerHTML = seasonName
            ? '<i class="fas fa-warehouse"></i> 物品已按「' + seasonName + '」限定存入仓库，赛季结束后自动过期；PRE Coin 已入账'
            : '<i class="fas fa-warehouse"></i> 物品已自动存入仓库，PRE Coin 已入账';
    }

    // 物品卡片：PRE Coin 金色卡固定居首，其余按开出顺序
    var html = '';
    if (totalPrecoin > 0) {
        html += '<div class="wrbox-card wrbox-card-coin">' +
            '<div class="wrbox-card-icon" style="background:rgba(255,215,0,0.14);color:#e6a800;">' + _whItemIconHtml('fas fa-coins', '#e6a800') + '</div>' +
            '<div class="wrbox-card-name">PRE Coin</div>' +
            '<div class="wrbox-card-qty">+' + fmt(totalPrecoin) + '</div>' +
        '</div>';
    }
    order.forEach(function(id) {
        var w = WAREHOUSE_ITEMS[id];
        if (!w) return;
        html += '<div class="wrbox-card">' +
            '<div class="wrbox-card-icon" style="background:' + hexToRgba(w.color, 0.14) + ';color:' + w.color + ';">' + _whItemIconHtml(w.icon, w.color) + '</div>' +
            '<div class="wrbox-card-name">' + w.name + (seasonName ? '「' + seasonName + '」' : '') + '</div>' +
            '<div class="wrbox-card-qty">×' + fmt(merged[id]) + '</div>' +
        '</div>';
    });
    modal.querySelector('#wrboxGrid').innerHTML = html;

    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

// ==================== 随机物品箱「概率详情」弹窗 ====================
// 展示对应档位奖池内每种物品的单次抽取概率与期望数量，并包含固定产出的 PRE Coin
function openRandBoxProbabilityModal(tier) {
    var cfg = RAND_BOX_CONFIG[tier];
    if (!cfg) return;

    // 反查该档位对应的物品箱（用于标题与配色）
    var boxItem = null;
    Object.keys(WAREHOUSE_ITEMS).forEach(function(id) {
        var it = WAREHOUSE_ITEMS[id];
        if (!boxItem && it && it._randBox && it._randBox.tier === tier) boxItem = it;
    });
    var boxColor = boxItem ? (boxItem.color || '#9b59b6') : '#9b59b6';
    var boxIcon = boxItem ? (boxItem.icon || 'fas fa-box') : 'fas fa-box';

    var modal = document.getElementById('randBoxProbModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'custom-alert';
        modal.id = 'randBoxProbModal';
        modal.style.display = 'none';
        modal.style.zIndex = 100002; // 覆盖物品详情弹窗（100001）
        modal.innerHTML =
            '<div class="wrprob-box" role="dialog" aria-modal="true" aria-labelledby="wrprobTitle">' +
                '<button class="wrprob-close" id="wrprobCloseBtn" type="button" aria-label="关闭"><i class="fas fa-times"></i></button>' +
                '<div class="wrprob-head">' +
                    '<div class="wrprob-box-icon" id="wrprobBoxIcon"><i class="fas fa-box"></i></div>' +
                    '<div class="wrprob-head-text">' +
                        '<h3 class="wrprob-title" id="wrprobTitle">概率详情</h3>' +
                        '<p class="wrprob-sub" id="wrprobSub"></p>' +
                    '</div>' +
                '</div>' +
                '<div class="wrprob-summary" id="wrprobSummary"></div>' +
                '<div class="wrprob-list" id="wrprobList"></div>' +
                '<p class="wrprob-note"><i class="fas fa-circle-info"></i> 每次抽取相互独立、允许重复，同种物品自动合并数量</p>' +
                '<div class="wrprob-actions"><button class="wrprob-ok" id="wrprobOkBtn" type="button">知道了</button></div>' +
            '</div>';
        document.body.appendChild(modal);

        modal.querySelector('#wrprobCloseBtn').addEventListener('click', closeRandBoxProbabilityModal);
        modal.querySelector('#wrprobOkBtn').addEventListener('click', closeRandBoxProbabilityModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeRandBoxProbabilityModal();
        });
        // ESC 在 window 捕获阶段处理：优先于下层详情弹窗的 document 监听，避免两个弹窗同时关闭
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                e.stopImmediatePropagation();
                e.preventDefault();
                closeRandBoxProbabilityModal();
            }
        }, true);
    }

    // 奖池概率：每次从奖池中独立等概率抽取
    var poolLen = cfg.pool.length;
    var perProb = poolLen ? (100 / poolLen) : 0;
    var perExpect = poolLen ? (cfg.picks / poolLen) : 0;

    modal.querySelector('#wrprobBoxIcon').innerHTML = _whItemIconHtml(boxIcon, boxColor);
    modal.querySelector('#wrprobBoxIcon').style.background = hexToRgba(boxColor, 0.15);
    modal.querySelector('#wrprobTitle').textContent = '概率详情';
    modal.querySelector('#wrprobSub').textContent = (boxItem ? '「' + boxItem.name + '」' : '随机物品箱 · ' + tier) + ' 奖池一览';
    modal.querySelector('#wrprobSummary').innerHTML =
        '<span><i class="fas fa-box-open"></i> 共开出 <b>' + (cfg.picks + 1) + '</b> 件（含 PRE Coin）</span>' +
        '<span><i class="fas fa-dice"></i> 随机 <b>' + cfg.picks + '</b> 件 · 奖池 <b>' + poolLen + '</b> 种</span>';

    var html = '';
    // PRE Coin：固定产出，概率 100%
    html += '<div class="wrprob-row wrprob-row-coin">' +
        '<div class="wrprob-icon" style="background:rgba(255,215,0,0.16);color:#e6a800;">' + _whItemIconHtml('fas fa-coins', '#e6a800') + '</div>' +
        '<div class="wrprob-main">' +
            '<div class="wrprob-name">PRE Coin<span class="wrprob-tag wrprob-tag-coin">固定</span></div>' +
            '<div class="wrprob-bar"><span class="wrprob-bar-fill" style="width:100%;background:linear-gradient(90deg,#f5c542,#e6a800);"></span></div>' +
            '<div class="wrprob-meta">每次固定获得 ' + cfg.coinMin + '~' + cfg.coinMax + ' 枚 · 期望约 ' + ((cfg.coinMin + cfg.coinMax) / 2) + ' 枚</div>' +
        '</div>' +
        '<div class="wrprob-val">100%</div>' +
    '</div>';

    cfg.pool.forEach(function(id) {
        var w = WAREHOUSE_ITEMS[id];
        if (!w) return;
        var rar = (typeof WAREHOUSE_RARITY !== 'undefined' && WAREHOUSE_RARITY[w.rarity])
            ? WAREHOUSE_RARITY[w.rarity]
            : { name: '普通', color: '#9aa0a6' };
        var barW = Math.max(perProb, 3);
        html += '<div class="wrprob-row">' +
            '<div class="wrprob-icon" style="background:' + hexToRgba(w.color || '#9aa0a6', 0.14) + ';color:' + (w.color || '#9aa0a6') + ';">' +
                _whItemIconHtml(w.icon || 'fas fa-gift', w.color || '#9aa0a6') +
            '</div>' +
            '<div class="wrprob-main">' +
                '<div class="wrprob-name">' + w.name +
                    '<span class="wrprob-tag" style="color:' + rar.color + ';border-color:' + rar.color + ';">' + rar.name + '</span>' +
                '</div>' +
                '<div class="wrprob-bar"><span class="wrprob-bar-fill" style="width:' + barW.toFixed(2) + '%;background:linear-gradient(90deg,' + (w.color || '#9aa0a6') + ',#b06bff);"></span></div>' +
                '<div class="wrprob-meta">单次抽取 ' + perProb.toFixed(2) + '% · 期望 ' + perExpect.toFixed(2) + ' 件</div>' +
            '</div>' +
            '<div class="wrprob-val">' + perProb.toFixed(2) + '%</div>' +
        '</div>';
    });

    var listEl = modal.querySelector('#wrprobList');
    listEl.innerHTML = html;
    listEl.scrollTop = 0;

    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

function closeRandBoxProbabilityModal() {
    var modal = document.getElementById('randBoxProbModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(function() {
        if (!modal.classList.contains('show')) modal.style.display = 'none';
    }, 250);
}

// ==================== PRE Coin 补给结果弹窗 ====================
// 使用「PRE Coin 补给包」系列道具后弹出：醒目展示本次共获得多少 PRE Coin（含数字滚动动画）
// 单次使用 usedCount 为 1；批量使用时展示累计获得总额
function _whShowPrecoinSupplyModal(item, usedCount, totalPrecoin) {
    var fmt = function(n) { return n.toLocaleString('zh-CN'); };
    var itemColor = item.color || '#f39c12';
    var itemIcon = item.icon || 'fas fa-coins';

    var modal = document.getElementById('warehousePrecoinSupplyModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'custom-alert';
        modal.id = 'warehousePrecoinSupplyModal';
        modal.style.display = 'none';
        modal.style.zIndex = 100002; // 覆盖物品详情弹窗（100001）
        modal.innerHTML =
            '<div class="wpc-box" role="dialog" aria-modal="true">' +
                '<div class="wpc-icon" id="wpcIcon"><i class="fas fa-coins"></i></div>' +
                '<h3 class="wpc-title">PRE Coin 补给已生效</h3>' +
                '<p class="wpc-sub" id="wpcSub"></p>' +
                '<div class="wpc-gain" id="wpcGain"></div>' +
                '<p class="wpc-note"><i class="fas fa-wallet"></i> <span id="wpcBalance">已对账户余额生效</span></p>' +
                '<div class="wpc-actions"><button class="wpc-ok" id="wpcOkBtn" type="button">确定</button></div>' +
            '</div>';
        document.body.appendChild(modal);
        modal.querySelector('#wpcOkBtn').addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(function() { modal.style.display = 'none'; }, 250);
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.querySelector('#wpcOkBtn').click();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                e.stopPropagation();
                modal.querySelector('#wpcOkBtn').click();
            }
        }, true);
    }

    // 填充内容
    var iconEl = modal.querySelector('#wpcIcon');
    iconEl.innerHTML = _whItemIconHtml(itemIcon, itemColor);
    iconEl.style.background = hexToRgba(itemColor, 0.15);
    modal.querySelector('#wpcSub').textContent = '「' + item.name + '」' + (usedCount > 1 ? '× ' + usedCount + ' ' : '') + '已使用';

    // 当前余额
    var balanceEl = modal.querySelector('#wpcBalance');
    if (typeof getPreCoinBalance === 'function') {
        balanceEl.textContent = '已对账户余额生效，当前余额 ' + fmt(getPreCoinBalance()) + ' PRE Coin';
    } else {
        balanceEl.textContent = '已对账户余额生效';
    }

    // 打开弹窗并播放数字滚动动画
    var gainEl = modal.querySelector('#wpcGain');
    gainEl.textContent = '+0 PRE Coin';
    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
    setTimeout(function() {
        _wesupCountUp(gainEl, 0, totalPrecoin, 900, function(v) { return '+' + fmt(v) + ' PRE Coin'; });
    }, 350);
}

// ==================== 物品详情弹窗（仓库 / 邮件附件 / 邮件领取记录共用） ====================
// 布局：左侧约 1/3 为物品图标区，右侧自上而下为名称、详细介绍、风味文本（斜体）；
// 右下角「使用该物品」按钮仅对可使用且当前拥有的物品显示。
// options:
//   timedUid    : 限时物品条目 uid（仓库限时卡片传入）
//   qty         : 预览模式下展示的数量（如邮件附件数量）
//   previewOnly : true = 仅预览（邮件附件/领取记录），不显示使用按钮
function ensureWarehouseItemDetailModal() {
    var modal = document.getElementById('warehouseItemDetailModal');
    if (modal) return modal;

    // 确保仓库样式已注入（邮件页直接打开详情弹窗时仓库弹窗可能尚未创建）
    if (!document.getElementById('warehouse-style')) {
        var style = document.createElement('style');
        style.id = 'warehouse-style';
        style.innerHTML = getWarehouseStyleCSS();
        document.head.appendChild(style);
    }

    modal = document.createElement('div');
    modal.className = 'custom-alert';
    modal.id = 'warehouseItemDetailModal';
    modal.style.display = 'none';
    modal.innerHTML =
        '<div class="wh-detail-wrap">' +
            '<button class="wh-detail-nav wh-detail-nav-left" id="whDetailNavPrev" type="button" aria-label="上一个物品"><i class="fas fa-chevron-left"></i></button>' +
            '<div class="wh-detail-box" role="dialog" aria-modal="true" aria-labelledby="whDetailName">' +
                '<button class="wh-detail-close" id="whDetailCloseBtn" type="button" aria-label="关闭"><i class="fas fa-times"></i></button>' +
                '<div class="wh-detail-main" id="whDetailMain">' +
                    '<div class="wh-detail-icon-panel" id="whDetailIconPanel"></div>' +
                    '<div class="wh-detail-info">' +
                        '<h3 class="wh-detail-name" id="whDetailName"></h3>' +
                        '<p class="wh-detail-desc" id="whDetailDesc"></p>' +
                        '<div class="wh-detail-notes" id="whDetailNotes"></div>' +
                        '<div class="wh-detail-flavor" id="whDetailFlavor"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="wh-detail-footer" id="whDetailFooter"></div>' +
            '</div>' +
            '<button class="wh-detail-nav wh-detail-nav-right" id="whDetailNavNext" type="button" aria-label="下一个物品"><i class="fas fa-chevron-right"></i></button>' +
        '</div>';
    document.body.appendChild(modal);

    modal.querySelector('#whDetailCloseBtn').addEventListener('click', closeWarehouseItemDetailModal);
    modal.querySelector('#whDetailNavPrev').addEventListener('click', function(e) {
        e.stopPropagation();
        _whDetailNavigate(-1);
    });
    modal.querySelector('#whDetailNavNext').addEventListener('click', function(e) {
        e.stopPropagation();
        _whDetailNavigate(1);
    });
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeWarehouseItemDetailModal();
    });
    // 捕获阶段处理 ESC：阻止下层弹窗（如仓库/邮件全屏弹窗）的 ESC 监听同时触发
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            e.stopPropagation();
            closeWarehouseItemDetailModal();
        }
    }, true);
    return modal;
}

function closeWarehouseItemDetailModal() {
    var modal = document.getElementById('warehouseItemDetailModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(function() { modal.style.display = 'none'; }, 280);
}

// ==================== 物品详情弹窗：左右切换与描述尾注提取 ====================
// 详情弹窗左右切换列表：由仓库渲染时写入（与当前分类/搜索过滤后的展示顺序一致）
var _whDetailNavList = [];   // [{ id, timedUid }]
var _whDetailNavIndex = -1;  // 当前展示条目在列表中的下标；-1 表示无导航上下文（隐藏左右切换）

// 左右切换：dir = 1 下一个（从右侧滑入）/ -1 上一个（从左侧滑入），到末尾后循环
function _whDetailNavigate(dir) {
    if (_whDetailNavIndex < 0 || _whDetailNavList.length === 0) return;
    var len = _whDetailNavList.length;
    var next = (_whDetailNavIndex + dir + len) % len;
    var target = _whDetailNavList[next];
    showWarehouseItemDetail(target.id, {
        timedUid: target.timedUid || null,
        navIndex: next,
        slideDir: dir > 0 ? 'left' : 'right'
    });
}

// 从描述末尾提取独立的（...）尾注块（可连续多段），返回 { main, notes }
// 嵌在句子中间的括号不属于尾注，保留在正文中；提取出的内容不带外层括号
function _whSplitDescNotes(desc) {
    var s = String(desc || '').trim();
    var notes = [];
    for (var guard = 0; guard < 8; guard++) {
        if (s.charAt(s.length - 1) !== '）') break;
        var depth = 0, start = -1;
        for (var i = s.length - 1; i >= 0; i--) {
            var ch = s.charAt(i);
            if (ch === '）') depth++;
            else if (ch === '（') { depth--; if (depth === 0) { start = i; break; } }
        }
        if (start < 0) break;
        notes.unshift(s.slice(start + 1, s.length - 1).trim());
        s = s.slice(0, start).replace(/[；;\s]+$/, '');
    }
    return { main: s, notes: notes };
}

function showWarehouseItemDetail(itemId, options) {
    options = options || {};
    var item = WAREHOUSE_ITEMS[itemId];
    if (!item) return;

    var modal = ensureWarehouseItemDetailModal();
    var categoryLabel = getWarehouseCategoryLabel(item.category);

    // 导航上下文：仅仓库列表打开时提供左右切换（索引由调用方传入；预览/邮件打开无列表上下文）
    _whDetailNavIndex = (typeof options.navIndex === 'number') ? options.navIndex : -1;

    // 解析持有数量、来源与限时信息
    var timedUid = options.timedUid || null;
    var timedMeta = null;
    var ownedQty = 0;
    var sourceText = item.source || '';
    var previewOnly = !!options.previewOnly;

    if (!previewOnly) {
        var data = getWarehouseData();
        cleanExpiredTimedItems(data);
        if (timedUid) {
            for (var i = 0; i < (data.timedItems || []).length; i++) {
                if (data.timedItems[i].uid === timedUid) { timedMeta = data.timedItems[i]; break; }
            }
            if (timedMeta) {
                ownedQty = timedMeta.qty;
                sourceText = timedMeta.source || item.source || '';
            }
        } else {
            var entry = data.items[itemId];
            if (entry) {
                ownedQty = entry.qty;
                sourceText = entry.source || item.source || '';
            }
        }
    } else if (options.qty !== undefined && options.qty !== null) {
        ownedQty = options.qty;
    }

    // 赛季限定物品：名称追加「XX赛季」后缀，描述写明赛季过期规则，不显示剩余天数
    var isSeasonItem = !!(timedMeta && timedMeta.season);
    var displayName = item.name + (timedMeta ? (isSeasonItem ? '' : '（限时）') : '');
    var displayDesc = item.desc + (timedMeta ? (isSeasonItem
        ? '（该物品为「' + timedMeta.season + '」物品，赛季结束后将自动过期并清除）'
        : '（该物品具有时效性，有效期为14天）') : '');

    // ---- 左侧图标区 ----
    var iconPanel = modal.querySelector('#whDetailIconPanel');
    iconPanel.style.setProperty('--whc-soft', hexToRgba(item.color || '#3498db', 0.22));

    var tagColor = item.color || '#d45d79';
    var tagsHtml = '<span class="wh-detail-tag" style="color:' + tagColor + ';border-color:' + tagColor + ';">' + categoryLabel + '</span>';

    var timedTagHtml = '';
    if (isSeasonItem) {
        timedTagHtml = '<span class="wh-detail-tag wh-detail-season-tag" title="赛季结束后将自动过期并清除">「' + timedMeta.season + '」</span>';
    } else if (timedMeta && timedMeta.expiresAt) {
        var nowMs = Date.now();
        var expireMs = new Date(timedMeta.expiresAt).getTime();
        var daysLeft = Math.ceil((expireMs - nowMs) / (24 * 60 * 60 * 1000));
        if (daysLeft < 0) daysLeft = 0;
        var expireDate = new Date(expireMs);
        var mm = ('0' + (expireDate.getMonth() + 1)).slice(-2);
        var dd = ('0' + expireDate.getDate()).slice(-2);
        timedTagHtml = '<span class="wh-detail-tag wh-detail-timed-tag" title="有效期至 ' + mm + '/' + dd + '">限时 · 剩' + daysLeft + '天</span>';
    }

    iconPanel.innerHTML =
        '<div class="wh-detail-icon" style="background:' + hexToRgba(item.color || '#3498db', 0.15) + ';">' +
            _whItemIconHtml(item.icon || 'fas fa-gift', item.color || '#3498db') +
        '</div>' +
        (ownedQty ? '<div class="wh-detail-qty">持有 ×' + ownedQty + '</div>' : '') +
        '<div class="wh-detail-tag-row">' + tagsHtml + timedTagHtml + '</div>';

    // ---- 右侧文本区 ----
    modal.querySelector('#whDetailName').textContent = displayName;

    // 描述尾注提取：描述末尾的（...）注释块移入 flavor 注释区（去括号、以 ；分隔），句中括号保留在正文
    var notesSplit = _whSplitDescNotes(displayDesc);
    modal.querySelector('#whDetailDesc').textContent = notesSplit.main;
    var notesEl = modal.querySelector('#whDetailNotes');
    if (notesSplit.notes.length) {
        notesEl.style.display = '';
        notesEl.innerHTML = '<i class="fas fa-circle-info wh-detail-notes-label" title="flavor"></i><span class="wh-detail-notes-text"></span>';
        notesEl.querySelector('.wh-detail-notes-text').textContent = notesSplit.notes.join('；');
    } else {
        notesEl.style.display = 'none';
        notesEl.innerHTML = '';
    }

    var flavorEl = modal.querySelector('#whDetailFlavor');
    if (item.flavorText) {
        flavorEl.style.display = '';
        flavorEl.innerHTML = '<i class="fas fa-quote-left wh-detail-flavor-mark"></i>' +
            '<span class="wh-detail-flavor-text"></span>';
        flavorEl.querySelector('.wh-detail-flavor-text').textContent = item.flavorText;
    } else {
        flavorEl.style.display = 'none';
        flavorEl.innerHTML = '';
    }

    // ---- 底部：来源 + 概率详情 / 使用按钮 ----
    var footer = modal.querySelector('#whDetailFooter');
    var canUse = !previewOnly && item.usable && ownedQty > 0;
    var actionBtns = '';
    if (item._randBox) {
        actionBtns += '<button class="wh-detail-prob-btn" type="button"><i class="fas fa-percent"></i> 概率详情</button>';
    }
    if (canUse) {
        actionBtns += '<button class="wh-detail-use-btn" type="button"><i class="fas fa-hand-sparkles"></i> 使用该物品</button>';
    }
    footer.innerHTML =
        '<div class="wh-detail-source">' +
            (sourceText ? '<i class="fas fa-link"></i><span></span>' : '') +
        '</div>' +
        (actionBtns ? '<div class="wh-detail-actions">' + actionBtns + '</div>' : '');
    var sourceSpan = footer.querySelector('.wh-detail-source span');
    if (sourceSpan) sourceSpan.textContent = sourceText;

    var probBtn = footer.querySelector('.wh-detail-prob-btn');
    if (probBtn) {
        probBtn.onclick = function() {
            openRandBoxProbabilityModal(item._randBox.tier);
        };
    }

    var useBtn = footer.querySelector('.wh-detail-use-btn');
    if (useBtn) {
        useBtn.onclick = function() {
            var ok = useWarehouseItem(itemId, timedUid);
            // 使用成功（含打开兑换卡选择弹窗）后关闭详情；失败（如加成叠加被拒）则保留弹窗
            if (ok !== false) closeWarehouseItemDetailModal();
        };
    }

    // 左右切换按钮：仅仓库列表打开且列表多于 1 项时显示（预览/邮件打开时隐藏）
    var hasNav = !previewOnly && _whDetailNavIndex >= 0 && _whDetailNavList.length > 1;
    modal.querySelector('#whDetailNavPrev').style.display = hasNav ? 'flex' : 'none';
    modal.querySelector('#whDetailNavNext').style.display = hasNav ? 'flex' : 'none';

    // 左右切换滑入动效：切换到下一个内容从右侧滑入，切换到上一个从左侧滑入
    var boxEl = modal.querySelector('.wh-detail-box');
    boxEl.classList.remove('wh-detail-slide-left', 'wh-detail-slide-right');
    if (options.slideDir) {
        void boxEl.offsetWidth; // 强制回流以重启动画
        boxEl.classList.add(options.slideDir === 'left' ? 'wh-detail-slide-left' : 'wh-detail-slide-right');
    }

    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

// ==================== 自选物品兑换卡弹窗 ====================
// 可兑换物品：当前版本商店内正在售卖的单个物品（自动包含之后新加入的物品；不含组合包）
function _getExchangeCardCandidates() {
    if (typeof SHOP_ITEM_PRICES === 'undefined') return [];
    var seen = {}; // 按“真实仓库道具 ID”去重（镜像商品如月度特供与普通版视为同一物品）
    var list = [];
    Object.keys(SHOP_ITEM_PRICES).forEach(function(shopId) {
        var cfg = SHOP_ITEM_PRICES[shopId];
        if (!cfg || !cfg.enabled) return;
        var wid = (typeof _shopResolveWarehouseId === 'function') ? _shopResolveWarehouseId(shopId) : shopId;
        if (seen[wid]) return;
        if (typeof WAREHOUSE_ITEMS === 'undefined' || !WAREHOUSE_ITEMS[wid]) return;
        if (WAREHOUSE_ITEMS[wid].category === 'badge') return; // 徽章不可商店售卖
        seen[wid] = true;
        list.push(wid);
    });
    var rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    // 追加未上架商店但可用自选兑换卡兑换的物品（阶段突破·极限限定道具 + 全档位幸运币）
    ['exp_boost_5', 'exp_supply_5', 'luck_coin_common', 'luck_coin_rare', 'luck_coin_epic', 'luck_coin_legend'].forEach(function(extraId) {
        if (WAREHOUSE_ITEMS[extraId] && !seen[extraId]) {
            seen[extraId] = true;
            list.push(extraId);
        }
    });
    list.sort(function(a, b) {
        var ia = WAREHOUSE_ITEMS[a], ib = WAREHOUSE_ITEMS[b];
        var ra = rarityOrder[ia.rarity] !== undefined ? rarityOrder[ia.rarity] : 4;
        var rb = rarityOrder[ib.rarity] !== undefined ? rarityOrder[ib.rarity] : 4;
        if (ra !== rb) return ra - rb;
        return ia.name.localeCompare(ib.name, 'zh-CN');
    });
    return list;
}

function ensureExchangeCardModal() {
    var modal = document.getElementById('exchangeCardModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'custom-alert';
    modal.id = 'exchangeCardModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="wh-fullscreen wh-ex-fullscreen">
            <div class="wh-header">
                <div class="wh-title">
                    <i class="fas fa-gift" style="color:#16a085;"></i>
                    <h2>自选物品兑换卡</h2>
                </div>
                <span class="wh-ex-tip">选择一个可兑换物品后点击「确定兑换」（不可兑换组合包）</span>
                <button class="wh-close" id="whExCloseBtn"><i class="fas fa-times"></i></button>
            </div>
            <div class="wh-content wh-ex-content" id="whExContent"></div>
            <div class="wh-footer wh-ex-footer">
                <span id="whExSelectedName">未选择物品</span>
                <button class="wh-ex-confirm-btn" id="whExConfirmBtn" disabled>
                    <i class="fas fa-check"></i> 确定兑换
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#whExCloseBtn').addEventListener('click', closeExchangeCardModal);
    modal.querySelector('#whExConfirmBtn').addEventListener('click', function() {
        if (!_exSelectedId || !WAREHOUSE_ITEMS[_exSelectedId]) return;
        _showExchangeConfirm(_exSelectedId);
    });
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeExchangeCardModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeExchangeCardModal();
    });
    return modal;
}

var _exSelectedId = null;

function openExchangeCardModal() {
    var modal = ensureExchangeCardModal();
    _exSelectedId = null;
    renderExchangeCardItems();
    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

function closeExchangeCardModal() {
    var modal = document.getElementById('exchangeCardModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(function() { modal.style.display = 'none'; }, 300);
}

function renderExchangeCardItems() {
    var content = document.getElementById('whExContent');
    if (!content) return;
    var ids = _getExchangeCardCandidates();

    if (!ids.length) {
        content.innerHTML = '<div class="wh-empty"><i class="fas fa-store-slash"></i><p>暂无可兑换物品</p><span>当前商店内没有在售物品</span></div>';
        _updateExFooter();
        return;
    }

    content.innerHTML = ids.map(function(id) {
        var item = WAREHOUSE_ITEMS[id];
        var rarity = WAREHOUSE_RARITY[item.rarity] || WAREHOUSE_RARITY.common;
        return '<div class="wh-item-card wh-ex-card' + (_exSelectedId === id ? ' selected' : '') + '" data-id="' + id + '">' +
            '<span class="wh-type-tag" style="color:' + rarity.color + '; border-color:' + rarity.color + ';">' + getWarehouseCategoryLabel(item.category) + '</span>' +
            '<div class="wh-item-icon" style="background: ' + hexToRgba(item.color, 0.15) + ';">' +
                _whItemIconHtml(item.icon, item.color) +
            '</div>' +
            '<div class="wh-item-name">' + item.name + '</div>' +
            '<div class="wh-item-desc">' + item.desc + '</div>' +
        '</div>';
    }).join('');

    content.querySelectorAll('.wh-ex-card').forEach(function(card) {
        card.addEventListener('click', function() {
            _exSelectedId = card.getAttribute('data-id');
            content.querySelectorAll('.wh-ex-card').forEach(function(c) { c.classList.toggle('selected', c === card); });
            _updateExFooter();
        });
    });

    _updateExFooter();
}

function _updateExFooter() {
    var nameEl = document.getElementById('whExSelectedName');
    var btn = document.getElementById('whExConfirmBtn');
    if (!nameEl || !btn) return;
    if (_exSelectedId && WAREHOUSE_ITEMS[_exSelectedId]) {
        nameEl.textContent = '已选择：' + WAREHOUSE_ITEMS[_exSelectedId].name;
        btn.disabled = false;
    } else {
        nameEl.textContent = '未选择物品';
        btn.disabled = true;
    }
}

// 二次确认弹窗：确定要兑换该物品吗？（下方展示所选物品 logo/名称/描述）
function ensureExchangeConfirmModal() {
    var modal = document.getElementById('exchangeConfirmModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'custom-alert';
    modal.id = 'exchangeConfirmModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="wh-confirm-box">
            <div class="wh-confirm-icon" style="background:rgba(22,160,133,0.12); color:#16a085;"><i class="fas fa-gift"></i></div>
            <h3>确定要兑换该物品吗？</h3>
            <div class="wh-ex-confirm-item" id="whExConfirmItem"></div>
            <div class="wh-confirm-actions">
                <button id="whExConfirmCancel">取消</button>
                <button id="whExConfirmOk">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(function() { modal.style.display = 'none'; }, 250);
        }
    });
    return modal;
}

function _showExchangeConfirm(selectedId) {
    var modal = ensureExchangeConfirmModal();
    var item = WAREHOUSE_ITEMS[selectedId];
    var box = modal.querySelector('#whExConfirmItem');
    box.innerHTML =
        '<div class="wh-ex-confirm-icon" style="background: ' + hexToRgba(item.color, 0.15) + ';">' +
            _whItemIconHtml(item.icon, item.color) +
        '</div>' +
        '<div class="wh-ex-confirm-name">' + item.name + '</div>' +
        '<div class="wh-ex-confirm-desc">' + item.desc + '</div>';

    var okBtn = modal.querySelector('#whExConfirmOk');
    var cancelBtn = modal.querySelector('#whExConfirmCancel');
    // 移除旧监听（clone 替换）
    var newOk = okBtn.cloneNode(true);
    var newCancel = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    newCancel.addEventListener('click', function() {
        modal.classList.remove('show');
        setTimeout(function() { modal.style.display = 'none'; }, 250);
    });
    newOk.addEventListener('click', function() {
        _doExchange(selectedId);
        modal.classList.remove('show');
        setTimeout(function() { modal.style.display = 'none'; }, 250);
    });

    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

function _doExchange(selectedId) {
    var data = getWarehouseData();
    var entry = data.items['exchange_card'];
    if (!entry || entry.qty <= 0) {
        if (typeof showToast === 'function') showToast({ type: 'error', title: '兑换失败', message: '自选物品兑换卡数量不足' });
        return;
    }
    // 消耗兑换卡
    entry.qty -= 1;
    if (entry.qty <= 0) delete data.items['exchange_card'];
    saveWarehouseData(data);

    // 发放所选物品
    if (typeof warehouseAddItem === 'function') {
        warehouseAddItem(selectedId, 1, '自选物品兑换卡');
    }
    if (typeof showToast === 'function') {
        showToast({ type: 'success', title: '兑换成功', message: '已消耗 1 张自选物品兑换卡，获得「' + WAREHOUSE_ITEMS[selectedId].name + '」×1' });
    }
    // 刷新仓库界面（若打开中）
    var whModal = document.getElementById('warehouseModal');
    if (whModal && whModal.style.display === 'flex') renderWarehouseItems();
    closeExchangeCardModal();
}

// ==================== 开发者获取道具弹窗 ====================
function ensureWarehouseDevModal() {
    var modal = document.getElementById('warehouseDevModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'custom-alert';
    modal.id = 'warehouseDevModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="wh-dev-fullscreen">
            <div class="wh-header wh-dev-header">
                <div class="wh-title">
                    <i class="fas fa-code"></i>
                    <h2>获取道具 <span class="wh-dev-badge">dev</span></h2>
                </div>
                <span class="wh-dev-tip">开发者模式专用：选择数量后点击「发放」立即加入仓库</span>
                <button class="wh-close" id="whDevCloseBtn"><i class="fas fa-times"></i></button>
            </div>
            <div class="wh-content wh-dev-content" id="whDevContent"></div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#whDevCloseBtn').addEventListener('click', closeWarehouseDevModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeWarehouseDevModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeWarehouseDevModal();
    });
    return modal;
}

function showWarehouseDevModal() {
    if (!isWarehouseDevMode()) return;
    var modal = ensureWarehouseDevModal();
    renderWarehouseDevItems();
    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);
}

function closeWarehouseDevModal() {
    var modal = document.getElementById('warehouseDevModal');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(function() { modal.style.display = 'none'; }, 300);
}

// 渲染开发者发放卡片（所有道具 + 数量输入 + 发放按钮）
function renderWarehouseDevItems() {
    var content = document.getElementById('whDevContent');
    if (!content) return;

    var ids = Object.keys(WAREHOUSE_ITEMS);
    var rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    ids.sort(function(a, b) {
        var ra = (rarityOrder[WAREHOUSE_ITEMS[a].rarity] !== undefined) ? rarityOrder[WAREHOUSE_ITEMS[a].rarity] : 4;
        var rb = (rarityOrder[WAREHOUSE_ITEMS[b].rarity] !== undefined) ? rarityOrder[WAREHOUSE_ITEMS[b].rarity] : 4;
        if (ra !== rb) return ra - rb;
        return WAREHOUSE_ITEMS[a].name.localeCompare(WAREHOUSE_ITEMS[b].name, 'zh-CN');
    });

    content.innerHTML = ids.map(function(id) {
        var item = WAREHOUSE_ITEMS[id];
        var rarity = WAREHOUSE_RARITY[item.rarity] || WAREHOUSE_RARITY.common;
        return '<div class="wh-item-card wh-dev-card wh-rarity-' + item.rarity + '">' +
            '<span class="wh-type-tag" style="color:' + rarity.color + '; border-color:' + rarity.color + ';">' + getWarehouseCategoryLabel(item.category) + '</span>' +
            '<div class="wh-item-icon" style="background: ' + hexToRgba(item.color, 0.15) + ';">' +
                _whItemIconHtml(item.icon, item.color) +
            '</div>' +
            '<div class="wh-item-name">' + item.name + '</div>' +
            '<div class="wh-item-desc">' + item.desc + '</div>' +
            '<div class="wh-dev-controls">' +
                '<input type="number" class="wh-dev-qty" id="whDevQty_' + id + '" min="1" max="9999" value="1">' +
                '<button class="wh-dev-grant-btn" data-id="' + id + '"><i class="fas fa-paper-plane"></i> 发放</button>' +
            '</div>' +
        '</div>';
    }).join('');

    content.querySelectorAll('.wh-dev-grant-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-id');
            var input = document.getElementById('whDevQty_' + id);
            var qty = parseInt(input && input.value, 10);
            if (!qty || qty < 1) qty = 1;
            if (qty > 9999) qty = 9999;
            if (warehouseAddItem(id, qty, '测试发放')) {
                // 仓库弹窗若打开中，同步刷新网格
                if (document.getElementById('warehouseModal') && document.getElementById('warehouseModal').style.display === 'flex') {
                    renderWarehouseItems();
                }
            }
        });
    });
}

// ==================== PRE Coin 介绍弹窗 ====================
// 通行证里点击 PRE 硬币槽、仓库里点击 PRE Coin 说明入口时弹出
// context: 'pass' = 来自通行证（可能带 amount）, 'warehouse' = 来自仓库
function showPrecoinDescription(amount, context) {
    // 确保仓库样式已注入（通行证等入口直接打开 PRE Coin 介绍时，仓库弹窗可能尚未创建，.wh-precoin-* 样式尚未生效）
    if (!document.getElementById('warehouse-style')) {
        var style = document.createElement('style');
        style.id = 'warehouse-style';
        style.innerHTML = getWarehouseStyleCSS();
        document.head.appendChild(style);
    }

    var modal = document.getElementById('warehousePrecoinModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'custom-alert';
        modal.id = 'warehousePrecoinModal';
        modal.style.display = 'none';
        modal.innerHTML =
            '<div class="wh-precoin-box">' +
                '<button class="wh-precoin-close" id="whPrecoinCloseBtn" type="button"><i class="fas fa-times"></i></button>' +
                '<div class="wh-precoin-iconpanel">' +
                    '<div class="wh-precoin-icon">' +
                        '<i class="fas fa-coins"></i>' +
                    '</div>' +
                    '<div class="wh-precoin-balance" id="whPrecoinBalance"></div>' +
                '</div>' +
                '<div class="wh-precoin-info">' +
                    '<h3 class="wh-precoin-name">PRE Coin</h3>' +
                    '<div class="wh-precoin-rarity-tag"><span>基础货币</span></div>' +
                    '<p class="wh-precoin-desc">PRE Launcher 的基础货币，用于在商店购买各类道具、购买赛季通行证及其通行证等级升级。</p>' +
                '</div>' +
                '<div class="wh-precoin-section">' +
                    '<h4><i class="fas fa-circle-question"></i> 如何获取 PRE Coin</h4>' +
                    '<ul>' +
                        '<li><i class="fas fa-hand-holding-dollar"></i> 赛季通行证付费档位：每级固定 +40，6 的倍数等级额外 +10</li>' +
                        '<li><i class="fas fa-box-open"></i> 使用「PRE Coin 补给包」系列仓库道具</li>' +
                        '<li><i class="fas fa-calendar-check"></i> 每日签到、特殊活动奖励、邮件附件</li>' +
                        '<li><i class="fas fa-layer-group"></i> 通行证 EX 溢出奖励：每级可领取随机物品箱，开箱必得 PRE Coin</li>' +
                    '</ul>' +
                '</div>' +
                '<div class="wh-precoin-section">' +
                    '<h4><i class="fas fa-bag-shopping"></i> PRE Coin 可以用来做什么</h4>' +
                    '<ul>' +
                        '<li><i class="fas fa-store"></i> 在商店购买各类道具（经验加成卡、补给卡、抽卡券等）</li>' +
                        '<li><i class="fas fa-crown"></i> 购买 PRE 赛季通行证及其通行证等级</li>' +
                    '</ul>' +
                '</div>' +
                '<div class="wh-precoin-flavor">' +
                    '<i class="fas fa-quote-left"></i>' +
                    '<span>商店里的每一次心动，都源于日积月累的一枚枚硬币。<br>——所谓自由选择的底气，从来都是自己一点点攒下的。</span>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);

        modal.querySelector('#whPrecoinCloseBtn').addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                e.stopPropagation();
                closeModal();
            }
        }, true);
    }

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(function() { modal.style.display = 'none'; }, 250);
    }

    // 显示当前余额
    var balance = (typeof getPreCoinBalance === 'function') ? getPreCoinBalance() : 0;
    var balanceEl = modal.querySelector('#whPrecoinBalance');
    if (balanceEl) {
        if (context === 'pass' && amount > 0) {
            balanceEl.innerHTML = '当前余额：<b>' + balance + '</b> <span style="opacity:.7;">· 本等级奖励 +' + amount + '</span>';
        } else {
            balanceEl.innerHTML = '当前余额：<b>' + balance + '</b>';
        }
    }

    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('show'); }, 10);

    // 如果从通行证打开，提升层级在通行证弹窗之上
    modal.style.zIndex = '1000000';
}
window.showPrecoinDescription = showPrecoinDescription;

// 工具：hex 转 rgba
function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

// ==================== 仓库样式 ====================
function getWarehouseStyleCSS() {
    return `
        /* 仓库全屏弹窗 */
        #warehouseModal {
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        #warehouseModal .wh-fullscreen {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #f5f6fa;
            overflow: hidden;
        }

        /* 头部 */
        .wh-header {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 18px 40px;
            background: white;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            flex-shrink: 0;
        }

        .wh-title {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .wh-title i {
            font-size: 22px;
            color: #d45d79;
        }

        .wh-title h2 {
            margin: 0;
            font-size: 20px;
            color: #333;
        }

        .wh-stats {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-left: auto;
        }

        .wh-stat {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #888;
        }

        .wh-stat b {
            color: #d45d79;
        }

        .wh-stat.wh-buff {
            color: #e67e22;
        }

        .wh-close {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.05);
            color: #666;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.25s ease;
            flex-shrink: 0;
        }

        .wh-close:hover {
            background: #d45d79;
            color: white;
            transform: rotate(90deg);
        }

        /* 分类工具栏 */
        .wh-toolbar {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 40px;
            background: white;
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            flex-shrink: 0;
            flex-wrap: wrap;
        }

        .wh-tab {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 16px;
            border: 1.5px solid rgba(212, 93, 121, 0.25);
            border-radius: 20px;
            background: transparent;
            color: #666;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .wh-tab:hover {
            border-color: #d45d79;
            color: #d45d79;
        }

        .wh-tab.active {
            background: linear-gradient(135deg, #d45d79 0%, #e67e8a 100%);
            border-color: transparent;
            color: white;
        }

        /* 开发者发放按钮（工具栏最右侧） */
        .wh-dev-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-left: auto;
            padding: 7px 16px;
            border: 1.5px dashed #9b59b6;
            border-radius: 20px;
            background: rgba(155, 89, 182, 0.08);
            color: #9b59b6;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .wh-dev-btn:hover {
            background: #9b59b6;
            color: white;
        }

        /* 移除道具按钮（在获取道具左侧） */
        .wh-remove-dev-btn {
            border-color: #e74c3c;
            background: rgba(231, 76, 60, 0.08);
            color: #e74c3c;
            margin-left: auto;
        }

        .wh-remove-dev-btn:hover,
        .wh-remove-dev-btn.active {
            background: #e74c3c;
            color: white;
        }

        .wh-remove-dev-btn.active {
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.25);
        }

        /* 卡片内移除按钮（移除模式下显示）：与使用按钮同款胶囊，绝对定位右下 */
        .wh-remove-btn {
            position: absolute;
            right: 10px;
            bottom: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 5px 12px;
            border: none;
            border-radius: 999px;
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            font-size: 11.5px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
            flex-shrink: 0;
        }

        .wh-remove-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 10px rgba(231, 76, 60, 0.35);
        }

        /* 内容区域：一行固定6个道具（仓库主窗口通过 #warehouseModal 作用域覆盖为 5 个） */
        .wh-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px 40px;
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 16px;
            align-content: start;
        }

        /* 全部视图：分类标题（跨整行） */
        .wh-cat-header {
            grid-column: 1 / -1;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 2px 2px 0;
            color: #555;
            font-size: 14px;
            font-weight: 700;
        }

        .wh-cat-header i {
            color: #d45d79;
            font-size: 13px;
        }

        .wh-cat-count {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 20px;
            padding: 0 6px;
            height: 18px;
            border-radius: 9px;
            background: rgba(212, 93, 121, 0.12);
            color: #d45d79;
            font-size: 11px;
            font-style: normal;
            font-weight: 600;
        }

        /* 全部视图：分类之间的虚线分界 */
        .wh-cat-divider {
            grid-column: 1 / -1;
            border-top: 1.5px dashed rgba(0, 0, 0, 0.16);
            margin: 6px 0;
            height: 0;
        }

        /* PRE Coin 余额：可点击，胶囊高亮样式 */
        .wh-stat.wh-precoin-stat {
            cursor: pointer;
            padding: 4px 12px;
            border: 1.5px solid rgba(240, 190, 30, 0.55);
            border-radius: 999px;
            background: rgba(255, 217, 61, 0.16);
            color: #a8790a;
            font-weight: 600;
            transition: all 0.22s ease;
        }

        .wh-stat.wh-precoin-stat:hover {
            background: #ffd93d;
            border-color: #ffd93d;
            color: #7a5300;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 200, 40, 0.4);
        }

        .wh-stat.wh-precoin-stat:active {
            transform: translateY(0) scale(0.98);
        }

        .wh-stat.wh-precoin-stat b {
            color: #8a6400;
        }

        .wh-precoin-info-icon {
            font-size: 11px;
            opacity: 0.75;
            margin-left: 2px;
        }

        /* 自定义滚动条（仓库 / 获取道具 / 自选兑换卡 内容区共用） */
        #warehouseModal .wh-content,
        #warehouseDevModal .wh-content,
        #exchangeCardModal .wh-content {
            scrollbar-width: thin;
            scrollbar-color: #667eea rgba(0, 0, 0, 0.06);
        }
        #warehouseModal .wh-content::-webkit-scrollbar,
        #warehouseDevModal .wh-content::-webkit-scrollbar,
        #exchangeCardModal .wh-content::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        #warehouseModal .wh-content::-webkit-scrollbar-track,
        #warehouseDevModal .wh-content::-webkit-scrollbar-track,
        #exchangeCardModal .wh-content::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.04);
            border-radius: 8px;
        }
        #warehouseModal .wh-content::-webkit-scrollbar-thumb,
        #warehouseDevModal .wh-content::-webkit-scrollbar-thumb,
        #exchangeCardModal .wh-content::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            border: 2px solid transparent;
            background-clip: padding-box;
        }
        #warehouseModal .wh-content::-webkit-scrollbar-thumb:hover,
        #warehouseDevModal .wh-content::-webkit-scrollbar-thumb:hover,
        #exchangeCardModal .wh-content::-webkit-scrollbar-thumb:hover {
            background: #667eea;
            background-clip: padding-box;
        }

        /* 道具卡片 - 与游戏中心卡片统一风格（基础自适应布局：仓库主窗口在下方作用域块中覆盖为紧凑固定卡片） */
        .wh-item-card {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 22px 18px 18px;
            background: white;
            border: 1px solid #e8e8e8;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .wh-item-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        /* 稀有度左边框强调条已移除：所有卡片统一为无左侧竖条的组合包样式 */

        /* 移除模式：卡片变灰，禁用交互 */
        .wh-item-card.wh-remove-mode {
            filter: grayscale(0.8);
            pointer-events: auto;
        }

        .wh-item-card.wh-remove-mode .wh-item-icon,
        .wh-item-card.wh-remove-mode .wh-use-btn {
            pointer-events: none;
        }

        .wh-qty-badge {
            position: absolute;
            top: 36px;
            right: 12px;
            padding: 2px 10px;
            border-radius: 10px;
            background: rgba(212, 93, 121, 0.12);
            color: #d45d79;
            font-size: 12px;
            font-weight: bold;
            z-index: 1;
        }

        /* 类型标签：移至卡片右上角，边框风格，颜色跟随稀有度 */
        .wh-type-tag {
            position: absolute;
            top: 12px;
            right: 12px;
            padding: 2px 10px;
            border-radius: 12px;
            border: 1.5px solid;
            font-size: 11px;
            font-weight: bold;
            background: white;
            z-index: 1;
        }

        .wh-item-icon {
            width: 64px;
            height: 64px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
        }

        .wh-item-name {
            font-size: 15px;
            font-weight: bold;
            color: #333;
            line-height: 1.3;
        }

        .wh-item-desc {
            font-size: 12px;
            color: #888;
            line-height: 1.6;
            flex: 1;
        }

        .wh-item-source {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 11px;
            color: #aaa;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .wh-item-source i {
            font-size: 10px;
            flex-shrink: 0;
        }

        .wh-use-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 7px 0;
            border: none;
            border-radius: 10px;
            background: linear-gradient(135deg, #d45d79 0%, #e67e8a 100%);
            color: white;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .wh-use-btn:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 10px rgba(212, 93, 121, 0.35);
        }

        /* ===== 仓库主窗口专属：紧凑固定卡片样式（仅作用于 #warehouseModal，
           商店 / 自选兑换卡 / 开发者发放弹窗保持上方原始自适应卡片，互不影响） ===== */
        #warehouseModal .wh-content {
            grid-template-columns: repeat(5, 1fr);
        }

        #warehouseModal .wh-item-card {
            height: 210px;
            gap: 6px;
            padding: 14px 14px 42px;
            border-radius: 14px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            overflow: hidden;
        }

        #warehouseModal .wh-item-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 22px rgba(0, 0, 0, 0.12);
        }

        #warehouseModal .wh-qty-badge {
            top: 10px;
            right: 56px;
            padding: 1px 8px;
            font-size: 11px;
        }

        #warehouseModal .wh-type-tag {
            top: 10px;
            right: 10px;
            padding: 1px 8px;
            border-radius: 10px;
            font-size: 10px;
        }

        #warehouseModal .wh-item-icon {
            width: 50px;
            height: 50px;
            border-radius: 14px;
            font-size: 22px;
            margin-top: 8px;
            flex-shrink: 0;
        }

        #warehouseModal .wh-item-name {
            font-size: 13.5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex-shrink: 0;
        }

        #warehouseModal .wh-item-desc {
            font-size: 11.5px;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            max-height: 34px;
            min-height: 0;
        }

        #warehouseModal .wh-item-source {
            position: absolute;
            left: 12px;
            bottom: 10px;
            gap: 4px;
            font-size: 10.5px;
            max-width: calc(100% - 90px);
            pointer-events: none;
        }

        #warehouseModal .wh-item-source i {
            font-size: 9px;
        }

        #warehouseModal .wh-use-btn {
            position: absolute;
            right: 10px;
            bottom: 8px;
            gap: 4px;
            padding: 5px 12px;
            border-radius: 999px;
            font-size: 11.5px;
        }

        #warehouseModal .wh-use-btn:hover {
            transform: scale(1.05);
        }

        #warehouseModal .wh-remove-btn {
            position: absolute;
            right: 10px;
            bottom: 8px;
            gap: 4px;
            padding: 5px 12px;
            border-radius: 999px;
            font-size: 11.5px;
        }

        #warehouseModal .wh-remove-btn:hover {
            transform: scale(1.05);
        }

        body.dark-mode #warehouseModal .wh-item-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        }

        /* 空状态 */
        .wh-empty {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 20px;
            color: #999;
        }

        .wh-empty i {
            font-size: 56px;
            color: #d45d79;
            margin-bottom: 16px;
            opacity: 0.5;
        }

        .wh-empty p {
            margin: 0 0 6px;
            font-size: 16px;
            font-weight: bold;
            color: #666;
        }

        .wh-empty span {
            font-size: 13px;
        }

        /* 底部提示 */
        .wh-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 40px;
            background: white;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            font-size: 12px;
            color: #aaa;
            flex-shrink: 0;
        }

        /* ==================== 开发者获取道具弹窗 ==================== */
        #warehouseDevModal {
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        #warehouseDevModal .wh-dev-fullscreen {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #f5f6fa;
            overflow: hidden;
        }

        .wh-dev-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            border: 1.5px solid #9b59b6;
            color: #9b59b6;
            font-size: 11px;
            vertical-align: middle;
            margin-left: 6px;
        }

        .wh-dev-header {
            background: rgba(155, 89, 182, 0.06);
        }

        .wh-dev-tip {
            font-size: 12px;
            color: #999;
        }

        .wh-dev-content {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
        }

        .wh-dev-controls {
            display: flex;
            align-items: stretch;
            gap: 8px;
        }

        .wh-dev-qty {
            width: 90px;
            padding: 7px 10px;
            border: 1.5px solid rgba(0, 0, 0, 0.12);
            border-radius: 10px;
            font-size: 13px;
            color: #333;
            outline: none;
        }

        .wh-dev-qty:focus {
            border-color: #9b59b6;
        }

        .wh-dev-grant-btn {
            flex: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 7px 0;
            border: none;
            border-radius: 10px;
            background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
            color: white;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .wh-dev-grant-btn:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 10px rgba(155, 89, 182, 0.35);
        }

        /* ==================== 补签卡确认弹窗 ==================== */
        #warehouseConfirmModal {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        }

        .wh-confirm-box {
            width: 360px;
            max-width: 90vw;
            padding: 28px 26px 22px;
            background: white;
            border-radius: 16px;
            text-align: center;
        }

        .wh-confirm-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 12px;
            border-radius: 18px;
            background: rgba(230, 126, 34, 0.12);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            color: #e67e22;
        }

        .wh-confirm-box h3 {
            margin: 0 0 10px;
            font-size: 17px;
            color: #333;
        }

        .wh-confirm-box p {
            margin: 0 0 20px;
            font-size: 13px;
            color: #777;
            line-height: 1.6;
        }

        .wh-confirm-actions {
            display: flex;
            gap: 10px;
        }

        .wh-confirm-actions button {
            flex: 1;
            padding: 9px 0;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        #whConfirmCancel {
            background: rgba(0, 0, 0, 0.06);
            color: #666;
        }

        #whConfirmOk {
            background: linear-gradient(135deg, #e67e22 0%, #f39c12 100%);
            color: white;
        }

        /* ==================== 暗色模式 ==================== */
        body.dark-mode #warehouseModal .wh-fullscreen,
        body.dark-mode #warehouseDevModal .wh-dev-fullscreen {
            background: #1a1a2e;
        }

        /* 暗色模式：自定义滚动条 */
        body.dark-mode #warehouseModal .wh-content,
        body.dark-mode #warehouseDevModal .wh-content,
        body.dark-mode #exchangeCardModal .wh-content {
            scrollbar-color: #8fa0ff rgba(255, 255, 255, 0.08);
        }
        body.dark-mode #warehouseModal .wh-content::-webkit-scrollbar-track,
        body.dark-mode #warehouseDevModal .wh-content::-webkit-scrollbar-track,
        body.dark-mode #exchangeCardModal .wh-content::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.06);
        }
        body.dark-mode #warehouseModal .wh-content::-webkit-scrollbar-thumb,
        body.dark-mode #warehouseDevModal .wh-content::-webkit-scrollbar-thumb,
        body.dark-mode #exchangeCardModal .wh-content::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #8fa0ff 0%, #a29bfe 100%);
            background-clip: padding-box;
        }

        body.dark-mode .wh-header,
        body.dark-mode .wh-toolbar,
        body.dark-mode .wh-footer,
        body.dark-mode .wh-dev-header {
            background: #1a1a2e;
            border-color: rgba(255, 255, 255, 0.08);
        }

        body.dark-mode .wh-title h2 {
            color: #e0e0e0;
        }

        body.dark-mode .wh-title i {
            color: #e67e8a;
        }

        body.dark-mode .wh-stat {
            color: #888;
        }

        body.dark-mode .wh-stat b {
            color: #e67e8a;
        }

        body.dark-mode .wh-stat.wh-buff {
            color: #f39c12;
        }

        body.dark-mode .wh-stat.wh-precoin-stat {
            background: rgba(255, 217, 61, 0.12);
            border-color: rgba(255, 217, 61, 0.45);
            color: #ffd93d;
        }

        body.dark-mode .wh-stat.wh-precoin-stat:hover {
            background: #ffd93d;
            border-color: #ffd93d;
            color: #4a3500;
        }

        body.dark-mode .wh-stat.wh-precoin-stat b {
            color: #ffd93d;
        }

        body.dark-mode .wh-stat.wh-precoin-stat:hover b {
            color: #4a3500;
        }

        body.dark-mode .wh-cat-header {
            color: #ccc;
        }

        body.dark-mode .wh-cat-count {
            background: rgba(230, 126, 138, 0.18);
            color: #e67e8a;
        }

        body.dark-mode .wh-cat-divider {
            border-top-color: rgba(255, 255, 255, 0.16);
        }

        body.dark-mode .wh-close {
            background: rgba(255, 255, 255, 0.08);
            color: #ccc;
        }

        body.dark-mode .wh-close:hover {
            background: #d45d79;
            color: white;
        }

        body.dark-mode .wh-tab {
            border-color: rgba(230, 126, 138, 0.3);
            color: #aaa;
        }

        body.dark-mode .wh-tab:hover {
            border-color: #e67e8a;
            color: #e67e8a;
        }

        body.dark-mode .wh-tab.active {
            background: linear-gradient(135deg, #d45d79 0%, #e67e8a 100%);
            color: white;
        }

        body.dark-mode .wh-dev-btn {
            border-color: #bd8fd0;
            background: rgba(155, 89, 182, 0.15);
            color: #d9b3e8;
        }

        body.dark-mode .wh-dev-btn:hover {
            background: #9b59b6;
            color: white;
        }

        body.dark-mode .wh-remove-dev-btn {
            border-color: #e74c3c;
            background: rgba(231, 76, 60, 0.15);
            color: #ff8a7f;
        }

        body.dark-mode .wh-remove-dev-btn:hover,
        body.dark-mode .wh-remove-dev-btn.active {
            background: #e74c3c;
            color: white;
        }

        body.dark-mode .wh-item-card {
            background: rgba(20, 20, 20, 0.8);
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        body.dark-mode .wh-item-card:hover {
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        }

        body.dark-mode .wh-item-card.wh-remove-mode {
            filter: grayscale(0.8) brightness(0.7);
        }

        body.dark-mode .wh-type-tag {
            background: #1a1a2e;
        }

        body.dark-mode .wh-item-name {
            color: #e0e0e0;
        }

        body.dark-mode .wh-item-desc {
            color: #999;
        }

        body.dark-mode .wh-item-source {
            color: #777;
        }

        body.dark-mode .wh-empty p {
            color: #ccc;
        }

        body.dark-mode .wh-dev-badge {
            border-color: #bd8fd0;
            color: #d9b3e8;
        }

        body.dark-mode .wh-dev-tip {
            color: #777;
        }

        body.dark-mode .wh-dev-qty {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(255, 255, 255, 0.15);
            color: #e0e0e0;
        }

        body.dark-mode .wh-dev-qty:focus {
            border-color: #bd8fd0;
        }

        body.dark-mode .wh-confirm-box {
            background: #24243a;
        }

        body.dark-mode .wh-confirm-box h3 {
            color: #e0e0e0;
        }

        body.dark-mode .wh-confirm-box p {
            color: #aaa;
        }

        body.dark-mode #whConfirmCancel {
            background: rgba(255, 255, 255, 0.08);
            color: #ccc;
        }

        /* ==================== 自选物品兑换卡弹窗 ==================== */
        #exchangeCardModal {
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }

        /* ===== 自选物品兑换卡弹窗 ===== */
        /* 固定弹窗尺寸：header/footer 锁定，仅 content 区滚动 */
        .wh-ex-fullscreen {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #f5f6fa;
            overflow: hidden;
        }

        .wh-ex-fullscreen .wh-title i { margin-right: 8px; }

        .wh-ex-tip {
            margin-left: auto;
            margin-right: 16px;
            font-size: 12px;
            color: #999;
            flex-shrink: 0;
        }

        .wh-ex-content {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 16px;
            align-content: start;
            padding: 24px 40px;
            overflow-y: auto;
            flex: 1;
            min-height: 0;
        }

        .wh-ex-card {
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }

        .wh-ex-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .wh-ex-card.selected {
            border-color: #16a085 !important;
            border-width: 2px;
            box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.18), 0 8px 20px rgba(22, 160, 133, 0.15);
        }

        .wh-ex-card.selected::after {
            content: '\f00c';
            font-family: 'Font Awesome 6 Free';
            font-weight: 900;
            position: absolute;
            top: 10px;
            right: 10px;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #16a085;
            color: white;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .wh-ex-footer {
            justify-content: space-between;
            padding: 12px 40px;
        }

        .wh-ex-footer span {
            font-size: 13px;
            color: #666;
            font-weight: 600;
        }

        .wh-ex-confirm-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 22px;
            border: none;
            border-radius: 20px;
            background: linear-gradient(135deg, #16a085 0%, #1abc9c 100%);
            color: white;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 3px 10px rgba(22, 160, 133, 0.35);
        }

        .wh-ex-confirm-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 5px 14px rgba(22, 160, 133, 0.45);
        }

        .wh-ex-confirm-btn:disabled {
            opacity: 0.45;
            cursor: not-allowed;
            box-shadow: none;
        }

        /* 二次确认弹窗内的物品展示 */
        .wh-ex-confirm-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 14px 12px;
            margin-bottom: 18px;
            background: rgba(0, 0, 0, 0.03);
            border-radius: 12px;
        }

        .wh-ex-confirm-icon {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
        }

        .wh-ex-confirm-name {
            font-size: 14px;
            font-weight: 700;
            color: #333;
        }

        .wh-ex-confirm-desc {
            font-size: 12px;
            color: #888;
            line-height: 1.6;
            text-align: center;
        }

        body.dark-mode #exchangeCardModal .wh-ex-fullscreen {
            background: #1a1a2e;
        }

        body.dark-mode .wh-ex-tip { color: #777; }

        body.dark-mode .wh-ex-card.selected {
            border-color: #1abc9c !important;
            box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.2), 0 8px 20px rgba(26, 188, 156, 0.15);
        }

        body.dark-mode .wh-ex-footer span { color: #aaa; }

        body.dark-mode .wh-ex-confirm-item { background: rgba(255, 255, 255, 0.05); }

        body.dark-mode .wh-ex-confirm-name { color: #e0e0e0; }

        body.dark-mode .wh-ex-confirm-desc { color: #999; }

        body.dark-mode #whExConfirmOk {
            background: #16a085;
            color: white;
        }

        /* ==================== 经验值补给反馈弹窗 ==================== */
        #warehouseExpSupplyModal {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        }

        .wesup-box {
            position: relative;
            width: min(92vw, 430px);
            background: white;
            border-radius: 18px;
            padding: 26px 26px 22px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
            text-align: center;
            animation: wesupPop 0.28s ease;
        }

        @keyframes wesupPop {
            from { opacity: 0; transform: translateY(14px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .wesup-icon {
            width: 62px;
            height: 62px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            margin: 0 auto 12px;
        }

        .wesup-title {
            margin: 0 0 4px;
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }

        .wesup-sub {
            margin: 0 0 10px;
            font-size: 12.5px;
            color: #999;
        }

        .wesup-gain {
            font-size: 24px;
            font-weight: bold;
            background: linear-gradient(90deg, #ffd700, #ffaa00);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 4px;
        }

        .wesup-precoin {
            font-size: 12.5px;
            color: #f39c12;
            margin-bottom: 4px;
        }

        .wesup-level-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin: 10px 0 14px;
            font-size: 17px;
            font-weight: bold;
            color: #333;
        }

        .wesup-level-row i {
            color: #d45d79;
            font-size: 13px;
        }

        .wesup-lv-new {
            color: #d45d79;
        }

        .wesup-lv-badge {
            font-size: 11px;
            font-weight: bold;
            color: white;
            background: linear-gradient(135deg, #d45d79 0%, #e67e8a 100%);
            padding: 2px 9px;
            border-radius: 999px;
        }

        .wesup-bar-wrapper {
            text-align: left;
        }

        .wesup-bar-bg {
            background: #e8e8e8;
            border-radius: 20px;
            height: 12px;
            overflow: hidden;
            margin-bottom: 8px;
        }

        .wesup-bar-inner {
            background: linear-gradient(90deg, #ffd700, #ffaa00);
            height: 100%;
            border-radius: 20px;
            width: 0%;
        }

        .wesup-bar-labels {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #666;
        }

        .wesup-actions {
            margin-top: 18px;
            display: flex;
            justify-content: center;
        }

        .wesup-ok {
            padding: 9px 42px;
            border: none;
            border-radius: 999px;
            background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
            color: white;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 4px 14px rgba(255, 170, 0, 0.35);
        }

        .wesup-ok:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(255, 170, 0, 0.45);
        }

        body.dark-mode .wesup-box { background: #1e1e2e; }
        body.dark-mode .wesup-title { color: #eee; }
        body.dark-mode .wesup-sub { color: #888; }
        body.dark-mode .wesup-level-row { color: #eee; }
        body.dark-mode .wesup-bar-bg { background: #0f3460; }
        body.dark-mode .wesup-bar-labels { color: #aaa; }

        /* ==================== 幸运币开箱结果弹窗 ==================== */
        .wluck-box {
            position: relative;
            width: min(92vw, 430px);
            background: white;
            border-radius: 18px;
            padding: 26px 26px 22px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
            text-align: center;
            animation: wesupPop 0.28s ease;
        }

        .wluck-icon {
            width: 62px;
            height: 62px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            margin: 0 auto 12px;
        }

        .wluck-title {
            margin: 0 0 4px;
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }

        .wluck-sub {
            margin: 0 0 10px;
            font-size: 12.5px;
            color: #999;
        }

        .wluck-gain {
            font-size: 34px;
            font-weight: bold;
            background: linear-gradient(90deg, #ffd700, #ff8f00);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
            min-height: 42px;
        }

        .wluck-coin {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 16px;
            border: 1.5px solid rgba(0, 0, 0, 0.08);
            border-radius: 999px;
            font-size: 14px;
            font-weight: 600;
            color: #444;
            margin-bottom: 4px;
        }

        .wluck-rolls {
            margin: 12px 0 0;
            max-height: 150px;
            overflow-y: auto;
            border: 1px dashed rgba(0, 0, 0, 0.12);
            border-radius: 12px;
            padding: 8px 14px;
            text-align: left;
        }

        .wluck-roll-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
            font-size: 13px;
            color: #666;
        }

        .wluck-roll-row + .wluck-roll-row {
            border-top: 1px dashed rgba(0, 0, 0, 0.08);
        }

        .wluck-roll-row b {
            color: #e6a800;
        }

        .wluck-note {
            margin: 12px 0 0;
            font-size: 12px;
            color: #999;
        }

        .wluck-note i {
            margin-right: 4px;
            color: #d45d79;
        }

        .wluck-actions {
            margin-top: 16px;
            display: flex;
            justify-content: center;
        }

        .wluck-ok {
            padding: 9px 42px;
            border: none;
            border-radius: 999px;
            background: linear-gradient(135deg, #ffd700 0%, #ff8f00 100%);
            color: white;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 4px 14px rgba(255, 160, 0, 0.35);
        }

        .wluck-ok:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(255, 160, 0, 0.45);
        }

        body.dark-mode .wluck-box { background: #1e1e2e; }
        body.dark-mode .wluck-title { color: #eee; }
        body.dark-mode .wluck-sub { color: #888; }
        body.dark-mode .wluck-coin { color: #ccc; }
        body.dark-mode .wluck-rolls { border-color: rgba(255, 255, 255, 0.14); }
        body.dark-mode .wluck-roll-row { color: #aaa; }
        body.dark-mode .wluck-roll-row + .wluck-roll-row { border-top-color: rgba(255, 255, 255, 0.1); }
        body.dark-mode .wluck-roll-row b { color: #ffd93d; }
        body.dark-mode .wluck-note { color: #777; }

        /* ==================== 随机物品箱「使用结果」弹窗 ==================== */
        .wrbox-box {
            position: relative;
            width: min(92vw, 480px);
            background: white;
            border-radius: 18px;
            padding: 26px 26px 22px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
            text-align: center;
            animation: wesupPop 0.28s ease;
        }

        .wrbox-icon {
            width: 62px;
            height: 62px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            margin: 0 auto 12px;
        }

        .wrbox-title {
            margin: 0 0 4px;
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }

        .wrbox-sub {
            margin: 0 0 12px;
            font-size: 12.5px;
            color: #999;
        }

        .wrbox-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
            gap: 8px;
            max-height: 260px;
            overflow-y: auto;
            padding: 2px;
        }

        .wrbox-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 10px 6px 9px;
            border-radius: 12px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: rgba(0, 0, 0, 0.02);
        }

        .wrbox-card-coin {
            border-color: rgba(230, 168, 0, 0.35);
            background: rgba(255, 215, 0, 0.06);
        }

        .wrbox-card-icon {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 17px;
        }

        .wrbox-card-name {
            font-size: 11.5px;
            font-weight: 600;
            color: #555;
            line-height: 1.3;
            word-break: break-all;
        }

        .wrbox-card-qty {
            font-size: 13px;
            font-weight: bold;
            color: #e6a800;
        }

        .wrbox-note {
            margin: 14px 0 0;
            font-size: 12px;
            color: #999;
        }

        .wrbox-note i {
            margin-right: 4px;
            color: #d45d79;
        }

        .wrbox-actions {
            margin-top: 16px;
            display: flex;
            justify-content: center;
        }

        .wrbox-ok {
            padding: 9px 42px;
            border: none;
            border-radius: 999px;
            background: linear-gradient(135deg, #b06bff 0%, #6a5acd 100%);
            color: white;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 4px 14px rgba(106, 90, 205, 0.35);
        }

        .wrbox-ok:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(106, 90, 205, 0.45);
        }

        /* ==================== 随机物品箱「概率详情」弹窗 ==================== */
        .wrprob-box {
            position: relative;
            width: min(92vw, 520px);
            max-height: 86vh;
            display: flex;
            flex-direction: column;
            background: white;
            border-radius: 18px;
            padding: 22px 24px 18px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
            text-align: left;
            animation: wesupPop 0.28s ease;
        }

        .wrprob-close {
            position: absolute; top: 12px; right: 12px;
            width: 30px; height: 30px;
            display: flex; align-items: center; justify-content: center;
            border: none; border-radius: 50%;
            background: rgba(0, 0, 0, 0.06);
            color: #888; font-size: 13px; cursor: pointer;
            transition: all 0.2s ease;
        }

        .wrprob-close:hover { background: rgba(0, 0, 0, 0.12); color: #555; }

        .wrprob-head {
            display: flex; align-items: center; gap: 12px;
            padding-right: 34px;
            flex-shrink: 0;
        }

        .wrprob-box-icon {
            width: 48px; height: 48px; flex-shrink: 0;
            border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            font-size: 21px;
        }

        .wrprob-head-text { min-width: 0; }
        .wrprob-title { margin: 0 0 2px; font-size: 18px; font-weight: bold; color: #333; }
        .wrprob-sub { margin: 0; font-size: 12.5px; color: #999; }

        .wrprob-summary {
            display: flex; flex-wrap: wrap; gap: 8px 16px;
            margin: 14px 0 12px; padding: 10px 12px;
            border-radius: 12px;
            background: rgba(106, 90, 205, 0.07);
            font-size: 12px; color: #777;
            flex-shrink: 0;
        }

        .wrprob-summary b { color: #6a5acd; }
        .wrprob-summary i { margin-right: 4px; color: #b06bff; }

        .wrprob-list {
            display: flex; flex-direction: column; gap: 8px;
            flex: 1 1 auto;
            overflow-y: auto; min-height: 0; padding-right: 4px;
        }

        .wrprob-row {
            display: flex; align-items: center; gap: 12px;
            padding: 10px 12px; border-radius: 12px;
            border: 1px solid rgba(0, 0, 0, 0.07);
            background: rgba(0, 0, 0, 0.02);
        }

        .wrprob-row-coin {
            border-color: rgba(230, 168, 0, 0.35);
            background: rgba(255, 215, 0, 0.07);
        }

        .wrprob-icon {
            width: 38px; height: 38px; flex-shrink: 0;
            border-radius: 11px;
            display: flex; align-items: center; justify-content: center;
            font-size: 17px;
        }

        .wrprob-main { flex: 1; min-width: 0; }

        .wrprob-name {
            display: flex; align-items: center; gap: 6px;
            font-size: 13px; font-weight: 600; color: #444;
        }

        .wrprob-tag {
            flex-shrink: 0;
            padding: 1px 7px; border-radius: 999px;
            border: 1px solid currentColor;
            font-size: 10.5px; font-weight: 600; line-height: 1.5;
        }

        .wrprob-tag-coin { color: #e6a800; }

        .wrprob-bar {
            height: 5px; margin: 6px 0 4px;
            border-radius: 999px;
            background: rgba(0, 0, 0, 0.07);
            overflow: hidden;
        }

        .wrprob-bar-fill {
            display: block; height: 100%;
            border-radius: 999px;
            transition: width 0.4s ease;
        }

        .wrprob-meta { font-size: 11px; color: #999; }

        .wrprob-val {
            flex-shrink: 0;
            font-size: 15px; font-weight: bold; color: #6a5acd;
            font-variant-numeric: tabular-nums;
        }

        .wrprob-row-coin .wrprob-val { color: #e6a800; }

        .wrprob-note { margin: 12px 0 0; font-size: 11.5px; color: #999; flex-shrink: 0; }
        .wrprob-note i { margin-right: 4px; color: #b06bff; }

        .wrprob-actions { margin-top: 14px; display: flex; justify-content: center; flex-shrink: 0; }

        .wrprob-ok {
            padding: 9px 42px;
            border: none; border-radius: 999px;
            background: linear-gradient(135deg, #b06bff 0%, #6a5acd 100%);
            color: white; font-size: 14px; font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 4px 14px rgba(106, 90, 205, 0.35);
        }

        .wrprob-ok:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(106, 90, 205, 0.45);
        }

        body.dark-mode .wrprob-box { background: #1e1e2e; }
        body.dark-mode .wrprob-close { background: rgba(255, 255, 255, 0.08); color: #bbb; }
        body.dark-mode .wrprob-title { color: #eee; }
        body.dark-mode .wrprob-sub,
        body.dark-mode .wrprob-meta,
        body.dark-mode .wrprob-note { color: #888; }
        body.dark-mode .wrprob-summary { background: rgba(176, 107, 255, 0.1); color: #aaa; }
        body.dark-mode .wrprob-row { background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.08); }
        body.dark-mode .wrprob-row-coin { background: rgba(255, 215, 0, 0.08); border-color: rgba(230, 168, 0, 0.4); }
        body.dark-mode .wrprob-name { color: #ddd; }
        body.dark-mode .wrprob-bar { background: rgba(255, 255, 255, 0.1); }

        body.dark-mode .wrbox-box { background: #1e1e2e; }
        body.dark-mode .wrbox-title { color: #eee; }
        body.dark-mode .wrbox-sub { color: #888; }
        body.dark-mode .wrbox-card { background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.1); }
        body.dark-mode .wrbox-card-coin { background: rgba(255, 215, 0, 0.08); border-color: rgba(230, 168, 0, 0.4); }
        body.dark-mode .wrbox-card-name { color: #ccc; }
        body.dark-mode .wrbox-card-qty { color: #ffd93d; }
        body.dark-mode .wrbox-note { color: #777; }

        /* ==================== PRE Coin 补给结果弹窗 ==================== */
        .wpc-box {
            position: relative;
            width: min(92vw, 430px);
            background: white;
            border-radius: 18px;
            padding: 26px 26px 22px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
            text-align: center;
            animation: wesupPop 0.28s ease;
        }

        .wpc-icon {
            width: 62px;
            height: 62px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            margin: 0 auto 12px;
        }

        .wpc-title {
            margin: 0 0 4px;
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }

        .wpc-sub {
            margin: 0 0 10px;
            font-size: 12.5px;
            color: #999;
        }

        .wpc-gain {
            font-size: 30px;
            font-weight: bold;
            background: linear-gradient(90deg, #ffd700, #ff8f00);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
            min-height: 42px;
        }

        .wpc-note {
            margin: 12px 0 0;
            font-size: 12px;
            color: #999;
        }

        .wpc-note i {
            margin-right: 4px;
            color: #d45d79;
        }

        .wpc-actions {
            margin-top: 16px;
            display: flex;
            justify-content: center;
        }

        .wpc-ok {
            padding: 9px 42px;
            border: none;
            border-radius: 999px;
            background: linear-gradient(135deg, #ffd700 0%, #ff8f00 100%);
            color: white;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 4px 14px rgba(255, 160, 0, 0.35);
        }

        .wpc-ok:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(255, 160, 0, 0.45);
        }

        body.dark-mode .wpc-box { background: #1e1e2e; }
        body.dark-mode .wpc-title { color: #eee; }
        body.dark-mode .wpc-sub { color: #888; }
        body.dark-mode .wpc-note { color: #777; }

        /* 窄屏适配（仓库主窗口 5 个起步、其余容器 6 个起步，仅在较窄视口逐级减少） */
        @media (max-width: 1200px) {
            .wh-content,
            .wh-dev-content,
            #warehouseModal .wh-content {
                grid-template-columns: repeat(4, 1fr);
            }

            .wh-ex-content {
                grid-template-columns: repeat(4, 1fr);
            }
        }

        @media (max-width: 900px) {
            .wh-content,
            .wh-dev-content,
            #warehouseModal .wh-content {
                grid-template-columns: repeat(3, 1fr);
            }

            .wh-ex-content {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media (max-width: 768px) {
            .wh-header {
                padding: 14px 16px;
                gap: 10px;
            }

            .wh-stats {
                display: none;
            }

            .wh-toolbar {
                padding: 10px 16px;
            }

            .wh-content,
            .wh-dev-content,
            #warehouseModal .wh-content {
                padding: 16px;
                grid-template-columns: repeat(2, 1fr);
            }

            .wh-ex-content {
                padding: 16px;
                grid-template-columns: repeat(2, 1fr);
            }

            .wh-ex-footer {
                padding: 12px 16px;
            }
        }

        /* ==================== 物品详情弹窗（仓库 / 邮件附件 / 领取记录共用） ==================== */
        #warehouseItemDetailModal {
            z-index: 100001;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }

        .wh-detail-box {
            position: relative;
            width: 820px;
            max-width: 94vw;
            height: 480px;
            max-height: 86vh;
            display: flex;
            flex-direction: column;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.92);
            transition: transform 0.28s cubic-bezier(0.34, 1.3, 0.64, 1);
        }

        .custom-alert.show .wh-detail-box {
            transform: scale(1);
        }

        .wh-detail-close {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 34px;
            height: 34px;
            border: none;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.06);
            color: #888;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.25s ease;
            z-index: 2;
        }

        .wh-detail-close:hover {
            background: #d45d79;
            color: white;
            transform: rotate(90deg);
        }

        /* 弹窗包裹层：承载弹窗主体与外侧左右切换按钮（flex 水平排列，按钮与弹窗保持间距） */
        .wh-detail-wrap {
            position: relative;
            display: flex;
            align-items: center;
            max-width: 94vw;
        }

        /* 左右切换按钮：位于弹窗外侧，点击快速切换上/下一个物品 */
        .wh-detail-nav {
            flex-shrink: 0;
            width: 46px;
            height: 46px;
            margin: 0 22px;
            border: none;
            border-radius: 50%;
            background: #ffffff;
            color: #667eea;
            font-size: 17px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
            transition: background 0.22s ease, color 0.22s ease, transform 0.22s ease;
            z-index: 3;
        }

        .wh-detail-nav:hover {
            background: #667eea;
            color: #ffffff;
            transform: scale(1.08);
        }

        body.dark-mode .wh-detail-nav {
            background: #3a3f5c;
            color: #aeb8ff;
        }

        body.dark-mode .wh-detail-nav:hover {
            background: #667eea;
            color: #ffffff;
        }

        /* 窄屏下空间不足，切换按钮收回弹窗内侧悬浮 */
        @media (max-width: 1000px) {
            .wh-detail-nav {
                position: absolute;
                margin: 0;
            }

            .wh-detail-nav-left {
                left: 12px;
            }

            .wh-detail-nav-right {
                right: 12px;
            }
        }

        /* 左右切换滑入动效：下一个从右侧滑入，上一个从左侧滑入 */
        .wh-detail-box.wh-detail-slide-left .wh-detail-main,
        .wh-detail-box.wh-detail-slide-left .wh-detail-footer {
            animation: whDetailSlideLeft 0.32s ease;
        }

        .wh-detail-box.wh-detail-slide-right .wh-detail-main,
        .wh-detail-box.wh-detail-slide-right .wh-detail-footer {
            animation: whDetailSlideRight 0.32s ease;
        }

        @keyframes whDetailSlideLeft {
            from { opacity: 0; transform: translateX(34px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes whDetailSlideRight {
            from { opacity: 0; transform: translateX(-34px); }
            to { opacity: 1; transform: translateX(0); }
        }

        .wh-detail-main {
            flex: 1;
            display: flex;
            min-height: 0;
        }

        /* 左侧图标区（约 1/3） */
        .wh-detail-icon-panel {
            width: 34%;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 14px;
            padding: 36px 24px;
            background: radial-gradient(circle at 50% 38%, var(--whc-soft, rgba(212, 93, 121, 0.15)) 0%, #fafafa 72%);
        }

        .wh-detail-icon {
            width: 108px;
            height: 108px;
            border-radius: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            box-shadow: 0 10px 26px rgba(0, 0, 0, 0.1);
        }

        .wh-detail-qty {
            padding: 4px 16px;
            border-radius: 14px;
            background: rgba(212, 93, 121, 0.12);
            color: #d45d79;
            font-size: 13px;
            font-weight: bold;
        }

        .wh-detail-tag-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 8px;
        }

        .wh-detail-tag {
            padding: 3px 12px;
            border-radius: 12px;
            border: 1.5px solid;
            background: #ffffff;
            font-size: 12px;
            font-weight: bold;
        }

        .wh-detail-tag.wh-detail-timed-tag {
            color: #ffffff !important;
            border-color: #f39c12 !important;
            background: #f39c12;
        }

        .wh-detail-tag.wh-detail-season-tag {
            color: #ffffff !important;
            border-color: #6a5acd !important;
            background: #6a5acd;
        }

        /* 右侧文本区：名称 / 详细介绍 / 风味文本 */
        .wh-detail-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            padding: 34px 34px 24px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #667eea transparent;
        }

        /* 详情弹窗文本区自定义滚动条（与仓库内容区样式一致） */
        .wh-detail-info::-webkit-scrollbar {
            width: 6px;
        }

        .wh-detail-info::-webkit-scrollbar-track {
            background: transparent;
        }

        .wh-detail-info::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 3px;
        }

        .wh-detail-info::-webkit-scrollbar-thumb:hover {
            background: #8fa0ff;
        }

        body.dark-mode .wh-detail-info::-webkit-scrollbar-thumb {
            background: #8fa0ff;
        }

        .wh-detail-name {
            margin: 0;
            padding-right: 40px;
            font-size: 22px;
            font-weight: bold;
            line-height: 1.35;
            color: #333;
        }

        .wh-detail-desc {
            margin: 16px 0 0;
            font-size: 14px;
            line-height: 1.85;
            color: #666;
        }

        /* flavor 注释区：存放描述末尾括号内提取的注释内容（位于风味文本上方） */
        .wh-detail-notes {
            margin-top: 14px;
            padding: 10px 14px;
            border-radius: 10px;
            background: rgba(102, 126, 234, 0.08);
            border-left: 3px solid #667eea;
            font-size: 12.5px;
            line-height: 1.75;
            color: #555c6e;
        }

        .wh-detail-notes-label {
            margin-right: 6px;
            color: #667eea;
            font-size: 13px;
            vertical-align: -1px;
        }

        body.dark-mode .wh-detail-notes {
            background: rgba(102, 126, 234, 0.14);
            color: rgba(255, 255, 255, 0.72);
        }

        body.dark-mode .wh-detail-notes-label {
            color: #aeb8ff;
        }

        /* 风味文本区：该区域内所有文本均以斜体显示 */
        .wh-detail-flavor {
            margin-top: 18px;
            padding: 14px 16px;
            border-radius: 12px;
            border-left: 3px solid #d45d79;
            background: rgba(212, 93, 121, 0.07);
            font-style: italic;
            font-size: 13.5px;
            line-height: 1.8;
            color: #9c5a70;
        }

        .wh-detail-flavor-mark {
            font-style: italic;
            font-size: 12px;
            margin-right: 6px;
            opacity: 0.7;
        }

        .wh-detail-flavor-text {
            font-style: italic;
            white-space: pre-wrap;
        }

        /* 底部：来源 + 右下角使用按钮 */
        .wh-detail-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 30px;
            background: #fafafa;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .wh-detail-source {
            display: flex;
            align-items: center;
            gap: 6px;
            min-width: 0;
            font-size: 12px;
            color: #aaa;
        }

        .wh-detail-source span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .wh-detail-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: 10px;
            margin-left: auto;
            flex-shrink: 0;
        }

        /* 随机物品箱：使用按钮左侧的「概率详情」按钮 */
        .wh-detail-prob-btn {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 10px 20px;
            border: 1px solid rgba(106, 90, 205, 0.35);
            border-radius: 22px;
            background: rgba(106, 90, 205, 0.08);
            color: #6a5acd;
            font-size: 13.5px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .wh-detail-prob-btn:hover {
            background: rgba(106, 90, 205, 0.16);
            border-color: rgba(106, 90, 205, 0.55);
            transform: translateY(-1px);
            box-shadow: 0 4px 14px rgba(106, 90, 205, 0.22);
        }

        .wh-detail-use-btn {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 30px;
            border: none;
            border-radius: 22px;
            background: linear-gradient(135deg, #d45d79 0%, #e67e8a 100%);
            color: white;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 4px 12px rgba(212, 93, 121, 0.35);
        }

        .wh-detail-use-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(212, 93, 121, 0.45);
        }

        /* 仓库卡片可点击提示（移除模式除外） */
        #whContent .wh-item-card {
            cursor: pointer;
        }

        #whContent .wh-item-card.wh-remove-mode {
            cursor: default;
        }

        /* 邮件内仓库物品的可点击悬停反馈 */
        .mail-attachment-item.mail-attachment-clickable {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .mail-attachment-item.mail-attachment-clickable:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(212, 93, 121, 0.18);
        }

        .mail-history-item-reward.mail-history-reward-clickable:hover {
            background: rgba(212, 93, 121, 0.22);
            transform: translateY(-1px);
        }

        /* 物品详情弹窗暗色模式 */
        body.dark-mode #warehouseItemDetailModal {
            background: rgba(0, 0, 0, 0.85);
        }

        body.dark-mode .wh-detail-box {
            background: #24243a;
        }

        body.dark-mode .wh-detail-icon-panel {
            background: radial-gradient(circle at 50% 38%, var(--whc-soft, rgba(212, 93, 121, 0.2)) 0%, #24243a 72%);
        }

        body.dark-mode .wh-detail-icon {
            box-shadow: 0 10px 26px rgba(0, 0, 0, 0.4);
        }

        body.dark-mode .wh-detail-tag {
            background: #24243a;
        }

        body.dark-mode .wh-detail-qty {
            background: rgba(212, 93, 121, 0.2);
            color: #e67e8a;
        }

        body.dark-mode .wh-detail-name {
            color: #e0e0e0;
        }

        body.dark-mode .wh-detail-desc {
            color: #aaaaaa;
        }

        body.dark-mode .wh-detail-flavor {
            background: rgba(212, 93, 121, 0.12);
            color: #e2a8ba;
        }

        body.dark-mode .wh-detail-footer {
            background: #1f1f33;
            border-color: rgba(255, 255, 255, 0.08);
        }

        body.dark-mode .wh-detail-prob-btn {
            color: #c7bfff;
            border-color: rgba(176, 107, 255, 0.4);
            background: rgba(176, 107, 255, 0.12);
        }

        body.dark-mode .wh-detail-prob-btn:hover {
            background: rgba(176, 107, 255, 0.22);
            border-color: rgba(176, 107, 255, 0.6);
        }

        body.dark-mode .wh-detail-source {
            color: #777777;
        }

        body.dark-mode .wh-detail-close {
            background: rgba(255, 255, 255, 0.08);
            color: #cccccc;
        }

        body.dark-mode .wh-detail-close:hover {
            background: #d45d79;
            color: white;
        }

        /* 物品详情弹窗透明模式 */
        body.transparent-mode #warehouseItemDetailModal {
            background: rgba(0, 0, 0, 0.4);
        }

        body.transparent-mode .wh-detail-box {
            background: rgba(42, 42, 64, 0.62);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.22);
        }

        body.transparent-mode .wh-detail-icon-panel {
            background: radial-gradient(circle at 50% 38%, var(--whc-soft, rgba(212, 93, 121, 0.22)) 0%, rgba(255, 255, 255, 0.04) 72%);
        }

        body.transparent-mode .wh-detail-tag {
            background: rgba(255, 255, 255, 0.08);
        }

        body.transparent-mode .wh-detail-name {
            color: rgba(255, 255, 255, 0.92);
        }

        body.transparent-mode .wh-detail-desc {
            color: rgba(255, 255, 255, 0.72);
        }

        body.transparent-mode .wh-detail-flavor {
            background: rgba(212, 93, 121, 0.16);
            color: rgba(255, 214, 226, 0.9);
        }

        body.transparent-mode .wh-detail-footer {
            background: rgba(0, 0, 0, 0.18);
            border-color: rgba(255, 255, 255, 0.12);
        }

        body.transparent-mode .wh-detail-source {
            color: rgba(255, 255, 255, 0.55);
        }

        /* 物品详情弹窗窄屏适配 */
        @media (max-width: 768px) {
            .wh-detail-box {
                height: auto;
                max-height: 92vh;
            }

            .wh-detail-main {
                flex-direction: column;
                overflow-y: auto;
            }

            .wh-detail-icon-panel {
                width: 100%;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
                padding: 22px 18px 14px;
            }

            .wh-detail-icon {
                width: 58px;
                height: 58px;
                border-radius: 16px;
                font-size: 26px;
            }

            .wh-detail-info {
                padding: 8px 22px 20px;
                overflow: visible;
            }

            .wh-detail-name {
                font-size: 18px;
            }

            .wh-detail-footer {
                flex-direction: column;
                align-items: stretch;
                padding: 12px 20px;
            }

            .wh-detail-source {
                justify-content: center;
            }

            .wh-detail-use-btn {
                width: 100%;
                justify-content: center;
            }

            .wh-detail-actions {
                width: 100%;
                margin-left: 0;
                gap: 8px;
            }

            .wh-detail-actions .wh-detail-prob-btn {
                flex: 1 1 auto;
                justify-content: center;
                padding: 10px 14px;
            }

            .wh-detail-actions .wh-detail-use-btn {
                width: auto;
                flex: 1.4 1 auto;
                padding: 10px 16px;
            }
        }

        /* ===== 批量使用弹窗 ===== */
        .wh-batch-box {
            position: relative;
            background: linear-gradient(135deg, #ffffff 0%, #fff8fa 100%);
            border-radius: 20px;
            padding: 32px 28px 24px;
            width: 420px;
            max-width: 92vw;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 107, 157, 0.15);
            animation: whPopIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .wh-batch-close {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: none;
            background: rgba(0,0,0,0.06);
            color: #666;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.18s;
        }
        .wh-batch-close:hover { background: rgba(0,0,0,0.12); color: #333; }
        .wh-batch-iconpanel {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            margin-bottom: 18px;
        }
        .wh-batch-icon {
            width: 72px;
            height: 72px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.08);
        }
        .wh-batch-hold {
            font-size: 13px;
            color: #888;
        }
        .wh-batch-hold span {
            color: #ff6b9d;
            font-weight: 600;
        }
        .wh-batch-info { text-align: center; margin-bottom: 20px; }
        .wh-batch-info h3 {
            margin: 0 0 8px;
            font-size: 17px;
            font-weight: 700;
            color: #2d3748;
        }
        .wh-batch-info p {
            margin: 0;
            font-size: 13px;
            color: #6b7280;
            line-height: 1.5;
            max-height: 40px;
            overflow: hidden;
        }
        .wh-batch-control {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background: #f7f7fa;
            border-radius: 14px;
            padding: 10px 12px;
            margin-bottom: 14px;
        }
        .wh-batch-btn {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            border: none;
            background: #fff;
            color: #ff6b9d;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(255, 107, 157, 0.12);
            transition: all 0.15s;
        }
        .wh-batch-btn:hover:not(:disabled) { background: #fff5f7; transform: scale(1.06); }
        .wh-batch-btn:active:not(:disabled) { transform: scale(0.94); }
        .wh-batch-btn-max {
            width: auto;
            padding: 0 12px;
            font-size: 12px;
            color: #c084fc;
            box-shadow: 0 2px 8px rgba(192, 132, 252, 0.15);
        }
        .wh-batch-control input[type="number"] {
            width: 70px;
            height: 38px;
            text-align: center;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 700;
            color: #2d3748;
            background: #fff;
            box-shadow: inset 0 2px 6px rgba(0,0,0,0.06);
            -moz-appearance: textfield;
        }
        .wh-batch-control input[type="number"]::-webkit-outer-spin-button,
        .wh-batch-control input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none; margin: 0;
        }
        .wh-batch-preview {
            text-align: center;
            font-size: 12.5px;
            color: #888;
            background: #fafaf5;
            border-radius: 10px;
            padding: 10px 14px;
            margin-bottom: 18px;
            line-height: 1.55;
        }
        .wh-batch-preview i { color: #f39c12; margin-right: 4px; }
        .wh-batch-footer {
            display: flex;
            gap: 12px;
        }
        .wh-batch-footer button {
            flex: 1;
            height: 42px;
            border-radius: 12px;
            border: none;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.18s;
        }
        .wh-batch-cancel {
            background: #f3f4f6;
            color: #6b7280;
        }
        .wh-batch-cancel:hover { background: #e5e7eb; }
        .wh-batch-confirm {
            background: linear-gradient(135deg, #ff6b9d 0%, #c084fc 100%);
            color: #fff;
            box-shadow: 0 4px 14px rgba(255, 107, 157, 0.35);
        }
        .wh-batch-confirm:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255, 107, 157, 0.45); }

        /* ===== PRE Coin 介绍弹窗 ===== */
        .wh-precoin-box {
            position: relative;
            background: linear-gradient(135deg, #fffef5 0%, #fff8ea 100%);
            border-radius: 20px;
            padding: 28px 26px 24px;
            width: 460px;
            max-width: 92vw;
            max-height: 88vh;
            overflow-y: auto;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 217, 61, 0.25);
            animation: whPopIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .wh-precoin-box::-webkit-scrollbar { width: 6px; }
        .wh-precoin-box::-webkit-scrollbar-thumb { background: rgba(255, 217, 61, 0.4); border-radius: 3px; }
        .wh-precoin-close {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none;
            background: rgba(0,0,0,0.06);
            color: #666;
            font-size: 13px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.18s;
            z-index: 1;
        }
        .wh-precoin-close:hover { background: rgba(0,0,0,0.12); color: #333; }
        .wh-precoin-iconpanel {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            margin-bottom: 14px;
        }
        .wh-precoin-icon {
            width: 78px;
            height: 78px;
            border-radius: 20px;
            background: linear-gradient(135deg, rgba(255, 217, 61, 0.25) 0%, rgba(255, 165, 0, 0.18) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 34px;
            color: #ffb300;
            box-shadow: 0 6px 20px rgba(255, 179, 0, 0.25);
        }
        .wh-precoin-balance {
            font-size: 13px;
            color: #888;
        }
        .wh-precoin-balance b {
            color: #ffb300;
            font-weight: 700;
            font-size: 16px;
        }
        .wh-precoin-info { text-align: center; margin-bottom: 16px; }
        .wh-precoin-name {
            margin: 0 0 8px;
            font-size: 20px;
            font-weight: 800;
            color: #2d3748;
            letter-spacing: 1px;
        }
        .wh-precoin-rarity-tag {
            display: inline-block;
            margin-bottom: 10px;
        }
        .wh-precoin-rarity-tag span {
            font-size: 11px;
            font-weight: 600;
            color: #ffb300;
            border: 1.5px solid rgba(255, 179, 0, 0.4);
            border-radius: 6px;
            padding: 2px 10px;
            letter-spacing: 1px;
        }
        .wh-precoin-desc {
            margin: 0;
            font-size: 13.5px;
            color: #4b5563;
            line-height: 1.65;
            text-align: left;
            padding: 0 4px;
        }
        .wh-precoin-section {
            margin-top: 14px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 12px;
            padding: 14px 16px;
        }
        .wh-precoin-section h4 {
            margin: 0 0 10px;
            font-size: 13px;
            font-weight: 700;
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .wh-precoin-section h4 i { color: #ffb300; }
        .wh-precoin-section ul {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .wh-precoin-section li {
            font-size: 12.5px;
            color: #6b7280;
            line-height: 1.8;
            padding-left: 4px;
        }
        .wh-precoin-section li i {
            color: #ffb300;
            margin-right: 6px;
            font-size: 11px;
            width: 14px;
            text-align: center;
        }
        .wh-precoin-flavor {
            margin-top: 16px;
            padding: 14px 16px;
            background: linear-gradient(135deg, rgba(255, 217, 61, 0.12) 0%, rgba(255, 165, 0, 0.08) 100%);
            border-radius: 12px;
            font-size: 12px;
            color: #92683f;
            font-style: italic;
            line-height: 1.7;
            position: relative;
        }
        .wh-precoin-flavor i {
            color: rgba(255, 179, 0, 0.6);
            font-size: 10px;
            margin-right: 4px;
        }

        /* PRE Coin stat 可点击样式 */
        .wh-precoin-stat {
            cursor: pointer;
            transition: transform 0.15s, background 0.18s;
        }
        .wh-precoin-stat:hover {
            transform: translateY(-1px);
            background: rgba(255, 217, 61, 0.12);
        }
        .wh-precoin-stat:active { transform: scale(0.97); }

        @keyframes whPopIn {
            0% { opacity: 0; transform: translateY(12px) scale(0.96); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 520px) {
            .wh-batch-box { width: 94vw; padding: 26px 20px 20px; }
            .wh-precoin-box { width: 94vw; padding: 22px 18px 18px; }
        }
    `;
}
