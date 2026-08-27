/**
 * Limbus Company - 人格/EGO/播报员 数据存储
 * 以及卡池横幅背景图片引用
 * 统一管理抽卡模拟器所需的所有静态数据
 */

// ========================================
// 图片资源路径引用
// ========================================
var LC_ImageAssets = {
    // 卡池横幅背景图
    poolBanners: {
        // 当期卡池子卡池：我出剪刀，你呢？
        'lc-current-rps': 'sucai/limbus0001.png',
        // 当期卡池子卡池：Cinq协会 东部三科 鸿路
        // TODO: 用户自行设置卡池背景图路径（替换下方空字符串即可）
        'lc-current-hongru': 'sucai/limbus0003.png',
        // 当期卡池子卡池：欢迎新经理（新手池）
        'lc-welcome': 'sucai/limbus0002.png',
        // 常驻卡池默认横幅
        'lc-permanent': ''
    },
    
    // 默认卡池横幅（当未指定具体卡池图片时使用）
    defaultBanner: 'sucai/limbus0002.png'
};

// ========================================
// 人格/EGO/播报员 图片资源映射
// 每个人物可在此配置对应图片路径，支持后续新增
// 图片建议尺寸：统一 200x200px，支持 PNG/JPG/WebP
// 未配置图片时显示占位区域
// ========================================
var LC_ItemImages = {
    // 人格图片映射（key: 人格id，value: 图片路径）
    personalities: {
        // 3★人格（88个）
        'p3_001': 'sucai/lx003.webp', // [剑契组杀手]李箱
        'p3_002': 'sucai/lx008.webp', // [绽放E.G.O :: 山茶花]李箱
        'p3_003': 'sucai/lx006.webp', // [W公司3级 清扫人员]李箱
        'p3_004': 'sucai/lx009.webp', // [环指 点彩派 学徒]李箱
        'p3_005': 'sucai/lx011.webp', // [六协会南部3科]李箱
        'p3_006': 'sucai/lx014.webp', // [N公司E.G.O :: 凶弹]李箱
        'p3_007': 'sucai/lx015.webp', // [蜘蛛巢食指父辈]李箱
        'p3_008': 'sucai/lx016.webp', // [LCEE.G.O :: 次元撕裂者]李箱

        'p3_009': 'sucai/fsd006.webp', // [执柄者]浮士德
        'p3_010': 'sucai/fsd007.webp', // [Seven协会南部4科]浮士德
        'p3_011': 'sucai/fsd012.webp', // [黑兽-卯魁首]浮士德
        'p3_012': 'sucai/fsd013.webp', // [し协会东部3科]浮士德
        'p3_013': 'sucai/fsd014.webp', // [食指苦行者:【纸条】]浮士德
        'p3_014': 'sucai/fsd015.webp', // [蜘蛛巢环指子辈]浮士德

        'p3_015': 'sucai/tjkd006.webp', // [W公司3级 清扫人员]堂吉诃德
        'p3_016': 'sucai/tjkd007.webp', // [Cinq协会南部5科科长]堂吉诃德
        'p3_017': 'sucai/tjkd008.webp', // [中指幼妹] 堂吉诃德
        'p3_018': 'sucai/tjkd009.webp', // [T公司3级征收人员]堂吉诃德
        'p3_019': 'sucai/tjkd010.webp', // [拉·曼却领总督]堂吉诃德
        'p3_020': 'sucai/tjkd011.webp', // [Cing协会东部3科]堂吉诃德
        'p3_021': 'sucai/tjkd013.webp', // [黑兽-未]堂吉诃德
        'p3_022': 'sucai/tjkd014.webp', // [食指代行者绽放E.G.O:代行]堂吉诃德

        'p3_023': 'sucai/lxiu006.webp', // [黑云会若众]良秀
        'p3_024': 'sucai/lxiu008.webp', // [W公司3级清扫人员]良秀
        'p3_025': 'sucai/lxiu009.webp', // [埃德加家族首席管家]良秀
        'p3_026': 'sucai/lxiu012.webp', // [N公司E.G.O":轻蔑,敬畏]良秀
        'p3_027': 'sucai/lxiu011.webp', // [鸿园的流浪武者]良秀
        'p3_028': 'sucai/lxiu015.webp', // [蜘蛛巢之刃]良秀

        'p3_029': 'sucai/mes006.webp', // [W公司2级 清扫人员]默尔索
        'p3_030': 'sucai/mes007.webp', // [N公司大锤]默尔索
        'p3_031': 'sucai/mes008.webp', // [R公司第四集团军犀牛队]默尔索
        'p3_032': 'sucai/mes010.webp', // [Dieci协会南部4科科长]默尔索
        'p3_033': 'sucai/mes011.webp', // [Cinq协会西部3科]默尔索
        'p3_034': 'sucai/mes012.webp', // [拇指东部 指挥官Ⅲ] 默尔索

        'p3_035': 'sucai/hl007.webp', // [豆豆帮帮主]鸿璐
        'p3_036': 'sucai/hl008.webp', // [K公司3级摘除人员]鸿璐
        'p3_037': 'sucai/hl009.webp', // [Dieci协会南部4科]鸿璐
        'p3_038': 'sucai/hl013.webp', // [R公司第四集团军 驯鹿队]鸿璐
        'p3_039': 'sucai/hl012.webp', // [鸿园的君主]鸿璐
        'p3_040': 'sucai/hl014.webp', // [蜘蛛巢环指父辈]鸿璐
        'p3_085': 'sucai/hl016.webp', // [Cinq协会 东部三科]鸿路
        'p3_088': 'sucai/hl016.webp', // [Cinq协会 东部三科]鸿路

        'p3_041': 'sucai/xsklf006.webp', // [R公司第四集团军 兔子队]希斯克利夫
        'p3_042': 'sucai/xsklf007.webp', // [脑叶公司E.G.O:狐雨]希斯克利夫
        'p3_043': 'sucai/xsklf008.webp', // [裴廓德号 鱼叉手]希斯克利夫
        'p3_044': 'sucai/xsklf009.webp', // [Oufi协会南部3科]希斯克利夫
        'p3_045': 'sucai/xsklf010.webp', // [狂猎]希斯克利夫
        'p3_046': 'sucai/xsklf014.webp', // [黑兽-酉魁首]希斯克利夫
        'p3_047': 'sucai/xsklf015.webp', // [中指幼兄]希斯克利夫
        'p3_048': 'sucai/xsklf016.webp', // [蜘蛛巢拇指子辈]希斯克利夫

        'p3_049': 'sucai/lsml006.webp', // [R公司 第四集团军 驯鹿队]以实玛利
        'p3_050': 'sucai/lsml007.webp', // [六协会南部4科]以实玛利
        'p3_051': 'sucai/lsml009.webp', // [裴廓德号船长]以实玛利
        'p3_052': 'sucai/lsml010.webp', // [Zwei协会西部3科]以实玛利
        'p3_053': 'sucai/lsml012.webp', // [家主候选人]以实玛利
        'p3_054': 'sucai/lsml014.webp', // [蜘蛛巢中指子辈]以实玛利
        'p3_055': 'sucai/lsml015.webp', // [LCD现场推理小队]以实玛利

        'p3_056': 'sucai/lj006.webp', // [黑云会若众]罗佳
        'p3_057': 'sucai/lj007.webp', // [玫瑰扳手工坊代表]罗佳
        'p3_058': 'sucai/lj008.webp', // [Dieci协会南部4科]罗佳
        'p3_059': 'sucai/lj009.webp', // [六协会南部4科科长]罗佳
        'p3_060': 'sucai/lj010.webp', // [AeBATb协会北部3科]罗佳
        'p3_061': 'sucai/lj011.webp', // [拉·曼却领公主]罗佳
        'p3_062': 'sucai/lj012.webp', // [黑兽-巳]罗佳
        'p3_063': 'sucai/lj014.webp', // [R公司 第四集团军 驯鹿队]罗佳
        'p3_064': 'sucai/lj015.webp', // [环指野兽派 讲解员]罗佳
        'p3_065': 'sucai/lj016.webp', // [蜘蛛巢拇指子辈]罗佳

        'p3_066': 'sucai/xkl007.webp', // [剑契组杀手]辛克莱
        'p3_067': 'sucai/xkl008.webp', // [准执柄者]辛克莱
        'p3_068': 'sucai/xkl009.webp', // [Cinq协会南部4科科长]辛克莱
        'p3_069': 'sucai/xkl011.webp', // [AeB9Tb协会北部3科]辛克莱
        'p3_070': 'sucai/xkl012.webp', // [中指幼弟]辛克莱
        'p3_071': 'sucai/xkl013.webp', // [拇指东部 士兵I]辛克莱
        'p3_072': 'sucai/xkl015.webp', // [蜘蛛巢小指子辈]辛克莱

        'p3_073': 'sucai/ats006.webp', // [Seven协会南部6科科长]奥提斯
        'p3_074': 'sucai/ats009.webp', // [呼啸山庄首席管家]奥提斯
        'p3_075': 'sucai/ats010.webp', // [W公司3级 清扫组长]奥提斯
        'p3_076': 'sucai/ats011.webp', // [拉·曼却领理发师]奥提斯
        'p3_077': 'sucai/ats014.webp', // [LCA瓦吉特先锋三队 队长]奥提斯
        'p3_078': 'sucai/ats015.webp', // [蜘蛛巢中指父辈]奧提斯

        'p3_079': 'sucai/glge006.webp', // [G公司科长代理]格里高尔
        'p3_080': 'sucai/glge007.webp', // [Zwei协会南部4科]格里高尔
        'p3_081': 'sucai/glge008.webp', // [双钩海盗团大副]格里高尔
        'p3_082': 'sucai/glge009.webp', // [埃德加家族继承人]格里高尔
        'p3_083': 'sucai/glge010.webp', // [拉·曼却领神父]格里高尔
        'p3_084': 'sucai/glge011.webp', // [炎拳事务所幸存者]格里高尔
        'p3_087': 'sucai/glge015.webp', // [LCEE.G.O :: AEDD]格里高尔

        // 2★人格（41个）
        'p2_001': 'sucai/lx002.webp', // [Seven协会南部6科]李箱
        'p2_002': 'sucai/lx005.webp', // [裴廓德号]李箱
        'p2_003': 'sucai/lx007.webp', // [Dieci协会南部4科]李箱

        'p2_004': 'sucai/fsd002.webp', // [W公司2级 清扫人员]浮士德
        'p2_005': 'sucai/fsd003.webp', // [脑叶公司幸存者]浮士德
        'p2_006': 'sucai/fsd004.webp', // [Zwei协会南部4科]浮士德
        'p2_007': 'sucai/fsd005.webp', // [呼啸山庄 管家]浮士德 

        'p2_008': 'sucai/tjkd002.webp', // [し协会南部5科科长]堂吉诃德
        'p2_009': 'sucai/tjkd003.webp', // [N公司中锤]堂吉诃德

        'p2_010': 'sucai/lxiu002.webp', // [Seven协会南部6科]良秀
        'p2_011': 'sucai/lxiu003.webp', // [LCCB系长]良秀
        'p2_012': 'sucai/lxiu004.webp', // [六协会南部4科]良秀

        'p2_013': 'sucai/mes002.webp', // [六协会南部6科]默尔索
        'p2_014': 'sucai/mes003.webp', // [玫瑰扳手工坊收尾人]默尔索
        'p2_015': 'sucai/mes004.webp', // [中指幼弟]默尔索
        'p2_016': 'sucai/mes005.webp', // [死兔帮 老大]默尔索

        'p2_017': 'sucai/hl002.webp', // [黑云会 若众]鸿璐
        'p2_018': 'sucai/hl003.webp', // [六协会南部5科]鸿璐
        'p2_019': 'sucai/hl004.webp', // [W公司2级清扫人员]鸿璐
        'p2_020': 'sucai/hl006.webp', // [猎牙事务所收尾人]鸿璐

        'p2_021': 'sucai/xsklf002.webp', // [し协会南部5科]希斯克利夫
        'p2_022': 'sucai/xsklf003.webp', // [N公司小锤]希斯克利夫
        'p2_023': 'sucai/xsklf004.webp', // [Seven协会南部4科]希斯克利夫

        'p2_024': 'sucai/lsml003.webp', // [し协会南部5科]以实玛利
        'p2_025': 'sucai/lsml002.webp', // [LCCB系长]以实玛利
        'p2_026': 'sucai/lsml004.webp', // [脑叶公司E.G.O :: 荡漾]以实玛利
        'p2_027': 'sucai/lsml005.webp', // [埃德加家族 管家]以实玛利

        'p2_028': 'sucai/lj002.webp', // [LCCB系长]罗佳
        'p2_029': 'sucai/lj003.webp', // [N公司中锤]罗佳
        'p2_030': 'sucai/lj004.webp', // [Zwei协会南部5科]罗佳
        'p2_031': 'sucai/lj005.webp', // [T公司2级征收人员]罗佳

        'p2_032': 'sucai/xkl002.webp', // [Zwei协会南部6科]辛克莱
        'p2_033': 'sucai/xkl003.webp', // [流浪乐队老大]辛克莱
        'p2_034': 'sucai/xkl004.webp', // [脑叶公司E.G.O :: 朱符]辛克莱
        'p2_035': 'sucai/xkl006.webp', // [Zwei协会西部3科]辛克莱

        'p2_036': 'sucai/ats003.webp', // [剑契组杀手]奥提斯
        'p2_037': 'sucai/ats002.webp', // [G公司部长]奥提斯
        'p2_038': 'sucai/ats004.webp', // [Cinq协会南部4科]奥提斯
        'p2_039': 'sucai/ats005.webp', // [环指 点彩派 学徒]奥提斯

        'p2_040': 'sucai/glge002.webp', // [六协会南部6科]格里高尔
        'p2_041': 'sucai/glge004.webp', // [玫瑰扳手工坊收尾人]格里高尔

        // 1★人格（12个）
        'p1_001': 'sucai/lx001.webp', // [LCB 罪人]李箱
        'p1_002': 'sucai/fsd001.webp', // [LCB罪人]浮士德
        'p1_003': 'sucai/tjkd001.webp', // [LCB罪人]堂吉诃德
        'p1_004': 'sucai/lxiu001.webp', // [LCB罪人]良秀
        'p1_005': 'sucai/mes001.webp', // [LCB罪人]默尔索
        'p1_006': 'sucai/hl001.webp', // [LCB罪人]鸿璐
        'p1_007': 'sucai/xsklf001.webp', // [LCB罪人]希斯克利夫
        'p1_008': 'sucai/lsml001.webp', // [LCB罪人]以实玛利
        'p1_009': 'sucai/lj001.webp', // [LCB罪人]罗佳
        'p1_010': 'sucai/xkl001.webp', // [LCB罪人]辛克莱
        'p1_011': 'sucai/ats001.webp', // [LCB罪人]奥提斯
        'p1_012': 'sucai/glge001.webp'  // [LCB罪人]格里高尔
    },

    // EGO图片映射（key: ego id，value: 图片路径）
    egos: {
        'ego_001': '', // [轻蔑,敬畏]良秀
        'ego_002': '', // [指定审判]罗佳
        'ego_003': '', // [荆棘花园]格里高尔
        'ego_004': '', // [次元撕裂者]李箱
        'ego_005': '', // [凶弹]李箱
        'ego_006': '', // [电线杆]浮士德
        'ego_007': '', // [胸痛]浮士德
        'ego_008': '', // [红艳煞]浮士德
        'ego_009': '', // [电线杆]堂吉诃德
        'ego_010': '', // [赤瞳(开)]良秀
        'ego_011': '', // [执行]默尔索
        'ego_012': '', // [着影挥刀]默尔索
        'ego_013': '', // [次元撕裂者]鸿璐
        'ego_014': '', // [空即是色]希斯克利夫
        'ego_015': '', // [失衡惯性]希斯克利夫
        'ego_016': '', // [红艳煞]以实玛利
        'ego_017': '', // [执行]罗佳
        'ego_018': '', // [提灯]辛克莱
        'ego_019': '', // [祈愿石]李箱
        'ego_020': '', // [诅咒之钉]浮士德
        'ego_021': '', // [祈愿石]堂吉诃德
        'ego_022': '', // [赤瞳]良秀
        'ego_023': '', // [低泣]鸿璐
        'ego_024': '', // [凶弹]希斯克利夫
        'ego_025': '', // [往昔]以实玛利
        'ego_026': '', // [空即是色]奥提斯
        'ego_027': '', // [提灯]格里高尔
        'ego_028': 'sucai/tjkdego001.webp', // [我出剪刀,你呢?]堂吉诃德
        'ego_029': '', // [步入晚霞]罗佳
        'ego_030': ''  // [低泣]辛克莱
    },

    // 播报员图片映射
    narrators: {
        'narrator_001': '', // 瓦伦希娜/卢西奥
        'narrator_002': ''  // 卡利斯托/阿尔比娜
    },

    /**
     * 获取指定物品的图片路径
     * @param {Object} item - 人格/EGO/播报员对象（需包含 id 和 type 字段）
     * @returns {string} 图片路径，空字符串表示未配置
     */
    getImage: function(item) {
        if (!item) return '';
        var type = item.type || '';
        var id = item.id || '';
        var name = item.name || '';
        var rarity = item.rarity || '';

        // 如果没有type，根据rarity推断
        if (!type && rarity === 'ego') type = 'ego';
        if (!type && rarity === 'narrator') type = 'narrator';

        // 先按 id 查找
        var category = null;
        if (type === 'personality') category = this.personalities;
        else if (type === 'ego') category = this.egos;
        else if (type === 'narrator') category = this.narrators;

        if (category && id && category[id]) {
            return category[id];
        }

        // 再按 name 查找（兼容用名称做key的场景）
        if (category && name && category[name]) {
            return category[name];
        }

        // 全局搜索（兜底）
        var allCats = [this.personalities, this.egos, this.narrators];
        for (var ci = 0; ci < allCats.length; ci++) {
            if (allCats[ci][id]) return allCats[ci][id];
            if (allCats[ci][name]) return allCats[ci][name];
        }

        return '';
    },

    /**
     * 设置指定物品的图片路径
     * @param {string} id - 物品id
     * @param {string} type - 'personality' | 'ego' | 'narrator'
     * @param {string} path - 图片路径
     */
    setImage: function(id, type, path) {
        var category = null;
        if (type === 'personality') category = this.personalities;
        else if (type === 'ego') category = this.egos;
        else if (type === 'narrator') category = this.narrators;
        if (category && id) {
            category[id] = path;
        }
    }
};

// ========================================
// 理想兑换配置（每个卡池可兑换的物品）
// ========================================
var LC_ExchangeConfig = {
    // 我出剪刀，你呢？卡池
    'lc-current-rps': [
        {
            id: 'ego_rps_don_quixote',
            type: 'ego',
            rarity: 'ego',
            name: '[我出剪刀,你呢?]堂吉诃德',
            title: '我出剪刀,你呢?',
            charName: '堂吉诃德',
            description: 'Rock Paper Scissors 主题E.G.O'
        }
    ],
    // Cinq协会 东部三科 鸿路 卡池（当期UP人格可兑换）
    'lc-current-hongru': [
        {
            id: 'p3_088',
            type: 'personality',
            rarity: '3star',
            name: '[Cinq协会 东部三科]鸿路',
            title: 'Cinq协会 东部三科',
            charName: '鸿路',
            description: 'Cinq协会 东部三科 UP三星人格'
        }
    ],
    // 常驻卡池（示例配置，可后续扩展）
    'lc-permanent': [
        // 常驻卡池的可兑换物品暂未指定（留空）
    ],
    // 欢迎新经理新手池（无E.G.O和播报员，只含人格，因此兑换列表留空或加人格）
    'lc-welcome': []
};

// ========================================
// 卡池个体 UP 概率硬编码配置（与LC_ExchangeConfig按池一一对应）
//  每个池的每项（narrator / ego / 3star / 2star / 1star）都可以为 指定的物品(name或id) 写死个体概率(%)
//  写死的UP概率优先使用，其余未指定物品在本类总概率中平分剩余
// ========================================
var LC_PoolRatesConfig = {
    // =============== 当期卡池 - 我出剪刀，你呢？ ===============
    'lc-current-rps': {
        narrator: {
            // 播报员：瓦伦希娜/卢西奥 独占播报员1.3%概率
            '瓦伦希娜/卢西奥': 1.3000
        },
        ego: {
            // 当期UP的EGO：硬编码个体概率 0.6500%（总100%占比）
            // key 必须精确匹配 LC_EgoData 中某物品的 name 或 id
            '[我出剪刀,你呢?]堂吉诃德': 0.6500
            // 剩余29个EGO平分：(E.G.O总1.3% - 0.65%) / 29 = 约 0.02241% / 个
        },
        // 人格UP（目前暂未指定具体人格UP，保留接口后可直接填）
        '3star': {},
        '2star': {},
        '1star': {}
    },
    // =============== 当期卡池 - Cinq协会 东部三科 鸿路 ===============
    'lc-current-hongru': {
        narrator: {
            // 新播报员：卡利斯托/阿尔比娜 播报员，概率1.3000%
            '卡利斯托/阿尔比娜': 1.3000
        },
        ego: {
            // EGO无UP，30个EGO平分1.3%总概率
        },
        '3star': {
            // 当期UP三星人格：[Cinq协会 东部三科]鸿路，固定1.4500%
            // 其余87个三星人格平分(2.9% - 1.45%) = 1.45%，约0.0167%/个
            '[Cinq协会 东部三科]鸿路': 1.4500
        },
        '2star': {},
        '1star': {}
    },
    // =============== 常驻卡池（无播报员） ===============
    'lc-permanent': {
        ego: {},
        '3star': {},
        '2star': {},
        '1star': {}
    },
    // =============== 欢迎新经理新手池（含EGO，无播报员） ===============
    'lc-welcome': {
        ego: {},
        '3star': {},
        '2star': {},
        '1star': {}
    }
};

// ========================================
// 卡池物品归属限制配置（按物品限制"哪些池子允许出现"）
// ========================================
// 规则如下（双斜线说明，代码严格遵守）：
// ① 未在本配置中登记的物品 → 默认"所有池子均允许出现"（即原常驻物品/EGO/老播报员自然行为不变）
// ② 登记了 restrictedToPools 的物品 → 只在 restrictedToPools 数组中列出的池子（poolId=subPool.id或poolGroup.id）内出现
//    - 当某卡池不包含此物品时：1）该物品不出现在此卡池的概率列表与抽取结果；2）不参与平分概率，不占用/摊薄旧卡池中其他物品的个体概率
// ③ 常驻人格（登记时 restrictedToPools 需包含 lc-permanent 与 lc-welcome）：常驻池与新手池永远可抽到；而过往/限定卡池按需要排除
// ④ 限定播报员 / 限定EGO（登记时 restrictedToPools 只含当期限定池 id）：仅当期卡池可抽到，常驻池、新手池、过往卡池均不出现
// ⑤ 每次新增"当期池专属内容"（新播报员/新EGO）后，只需在本配置中新增一条登记；之前所有旧池、过往池、常驻池、新手池自动被排除，无需修改旧池代码
var LC_RestrictedItems = {
    // === 常驻人格：[Cinq协会 东部三科]鸿路（id=p3_088）===
    // 只出现在：当期新池 lc-current-hongru、常驻池 lc-permanent、新手池 lc-welcome；
    // 过往卡池（例如 lc-current-rps / lc-past 分组下的所有池子）均不出现，不参与旧池概率平分
    'p3_088': { restrictedToPools: ['lc-current-hongru', 'lc-permanent', 'lc-welcome'] },
    '[Cinq协会 东部三科]鸿路': { restrictedToPools: ['lc-current-hongru', 'lc-permanent', 'lc-welcome'] },

    // === 限定播报员：卡利斯托/阿尔比娜 播报员（id=narrator_002）===
    // 只出现在当期新池 lc-current-hongru；过往卡池、常驻池、新手池均不出现
    'narrator_002': { restrictedToPools: ['lc-current-hongru'] },
    '卡利斯托/阿尔比娜': { restrictedToPools: ['lc-current-hongru'] }
};

// ========================================
// 播报员数据（共2个）
// ========================================
var LC_NarratorData = [
    {
        id: 'narrator_001',
        name: '瓦伦希娜/卢西奥',
        title: '',
        charName: '瓦伦希娜/卢西奥',
        rarity: 'narrator',
        type: 'narrator',
        description: '特殊播报员',
        icon: 'fa-microphone'
    },
    {
        id: 'narrator_002',
        name: '卡利斯托/阿尔比娜',
        title: '',
        charName: '卡利斯托/阿尔比娜',
        rarity: 'narrator',
        type: 'narrator',
        description: 'Cinq协会专属播报员',
        icon: 'fa-microphone'
    }
];

// ========================================
// E.G.O 数据（共30个）
// 不会重复提取，获取后从卡池移除
// ========================================
var LC_EgoData = [];
(function() {
    var egoNames = [
        '[轻蔑,敬畏]良秀',

'[指定审判]罗佳',
'[荆棘花园]格里高尔',
'[次元撕裂者]李箱',

'[凶弹]李箱',
'[电线杆]浮士德',
'[胸痛]浮士德',

'[红艳煞]浮士德',

'[电线杆]堂吉诃德',
'[赤瞳(开)]良秀',
'[执行]默尔索',
'[着影挥刀]默尔索',

'[次元撕裂者]鸿璐',

'[空即是色]希斯克利夫',

'[失衡惯性]希斯克利夫',

'[红艳煞]以实玛利',

'[执行]罗佳',

'[提灯]辛克莱',

'[祈愿石]李箱',

'[诅咒之钉]浮士德',

'[祈愿石]堂吉诃德',

'[赤瞳]良秀',

'[低泣]鸿璐',

'[凶弹]希斯克利夫',

'[往昔]以实玛利',

'[空即是色]奥提斯',

'[提灯]格里高尔',

'[我出剪刀,你呢?]堂吉诃德',

'[步入晚霞]罗佳',

'[低泣]辛克莱',
    ];
    for (var i = 0; i < 30; i++) {
        var rawName = egoNames[i] || ('E.G.O ' + (i + 1));
        var parsed = parseBracketName(rawName);
        LC_EgoData.push({
            id: 'ego_' + String(i + 1).padStart(3, '0'),
            name: rawName,
            title: parsed.title,
            charName: parsed.charName,
            rarity: 'ego',
            type: 'ego',
            index: i + 1,
            obtained: false,
            icon: 'fa-fire',
            description: 'E.G.O装备 ' + (i + 1)
        });
    }
})();

/**
 * 解析 [title]charName 格式的名称
 */
function parseBracketName(raw) {
    var match = raw.match(/^\[(.+?)\](.+)$/);
    if (match) {
        return { title: match[1], charName: match[2] };
    }
    return { title: '', charName: raw };
}

// ========================================
// 人格数据（共141个：3★×88, 2★×41, 1★×12）
// ========================================
var LC_PersonalityData = [];

// 3★人格（88个）
(function() {
    var stars3Names = [
        '[剑契组杀手]李箱',

        '[绽放E.G.O :: 山茶花]李箱',

'[W公司3级 清扫人员]李箱',

'[环指 点彩派 学徒]李箱',

'[六协会南部3科]李箱',

'[N公司E.G.O :: 凶弹]李箱',

'[蜘蛛巢食指父辈]李箱', 

'[LCEE.G.O :: 次元撕裂者]李箱',

'[执柄者]浮士德',

'[Seven协会南部4科]浮士德',

'[黑兽-卯魁首]浮士德',

'[し协会东部3科]浮士德',

'[食指苦行者:【纸条】]浮士德',

'[蜘蛛巢环指子辈]浮士德',

'[W公司3级 清扫人员]堂吉诃德',

'[Cinq协会南部5科科长]堂吉诃德',

'[中指幼妹] 堂吉诃德',

'[T公司3级征收人员]堂吉诃德',

'[拉·曼却领总督]堂吉诃德',

'[Cing协会东部3科]堂吉诃德',

'[黑兽-未]堂吉诃德',

'[食指代行者绽放E.G.O:代行]堂吉诃德',

'[黑云会若众]良秀',

'[W公司3级清扫人员]良秀',

'[埃德加家族首席管家]良秀',

'[N公司E.G.O”:轻蔑,敬畏]良秀',

'[鸿园的流浪武者]良秀',

'[蜘蛛巢之刃]良秀',

'[W公司2级 清扫人员]默尔索',

'[N公司大锤]默尔索',

'[R公司第四集团军犀牛队]默尔索',

'[Dieci协会南部4科科长]默尔索',

'[Cinq协会西部3科]默尔索',

'[拇指东部 指挥官Ⅲ] 默尔索',

'[豆豆帮帮主]鸿璐',

'[K公司3级摘除人员]鸿璐',

'[Dieci协会南部4科]鸿璐',

'[R公司第四集团军 驯鹿队]鸿璐',

'[鸿园的君主]鸿璐',

'[蜘蛛巢环指父辈]鸿璐',

'[R公司第四集团军 兔子队]希斯克利夫',

'[脑叶公司E.G.O:狐雨]希斯克利夫',

'[裴廓德号 鱼叉手]希斯克利夫',

'[Oufi协会南部3科]希斯克利夫',

'[狂猎]希斯克利夫',

'[黑兽-酉魁首]希斯克利夫',

'[中指幼兄]希斯克利夫',

'[蜘蛛巢拇指子辈]希斯克利夫',

'[R公司 第四集团军 驯鹿队]以实玛利',

'[六协会南部4科]以实玛利',

'[裴廓德号船长]以实玛利',

'[Zwei协会西部3科]以实玛利',

'[家主候选人]以实玛利',

'[蜘蛛巢中指子辈]以实玛利',

'[LCD现场推理小队]以实玛利',

'[黑云会若众]罗佳',

'[玫瑰扳手工坊代表]罗佳',

'[Dieci协会南部4科]罗佳',

'[六协会南部4科科长]罗佳',

'[AeBATb协会北部3科]罗佳',

'[拉·曼却领公主]罗佳',

'[黑兽-巳]罗佳',

'[R公司 第四集团军 驯鹿队]罗佳',

'[环指野兽派 讲解员]罗佳',

'[蜘蛛巢拇指父辈]罗佳',

'[剑契组杀手]辛克莱',

'[准执柄者]辛克莱',

'[Cinq协会南部4科科长]辛克莱',

'[AeB9Tb协会北部3科]辛克莱',

'[中指幼弟]辛克莱',

'[拇指东部 士兵I]辛克莱',

'[蜘蛛巢小指子辈]辛克莱',

'[Seven协会南部6科科长]奥提斯',

'[呼啸山庄首席管家]奥提斯',

'[W公司3级 清扫组长]奥提斯',

'[拉·曼却领理发师]奥提斯',

'[LCA瓦吉特先锋三队 队长]奥提斯',

'[蜘蛛巢中指父辈]奧提斯',

'[G公司科长代理]格里高尔',

'[Zwei协会南部4科]格里高尔',

'[双钩海盗团大副]格里高尔',

'[埃德加家族继承人]格里高尔',

'[拉·曼却领神父]格里高尔',

'[炎拳事务所幸存者]格里高尔',

'[黑兽-巳]格里高尔',

'[脑叶公司E.G.O:目灯]格里高尔',

'[LCEE.G.O :: AEDD]格里高尔',

'[Cinq协会 东部三科]鸿路',

    ];
    for (var i = 0; i < 88; i++) {
        var rawName = stars3Names[i] || ('3★人格 ' + (i + 1));
        var parsed = parseBracketName(rawName);
        LC_PersonalityData.push({
            id: 'p3_' + String(i + 1).padStart(3, '0'),
            name: rawName,
            title: parsed.title,
            charName: parsed.charName,
            rarity: '3star',
            type: 'personality',
            stars: 3,
            index: i + 1,
            description: '三星人格 ' + (i + 1)
        });
    }
})();

// 2★人格（41个）
(function() {
    var stars2Names = [
        '[Seven协会南部6科]李箱',

'[裴廓德号大副]李箱',

'[Dieci协会南部4科]李箱',

'[W公司2级 清扫人员]浮士德',

'[脑叶公司幸存者]浮士德',

'[Zwei协会南部4科]浮士德',

'[呼啸山庄 管家]浮士德',

'[し协会南部5科科长]堂吉诃德',

'[N公司中锤]堂吉诃德',

'[Seven协会南部6科]良秀',

'[LCCB系长]良秀',

'[六协会南部4科]良秀',

'[六协会南部6科]默尔索',

'[玫瑰扳手工坊收尾人]默尔索',

'[中指幼弟]默尔索',

'[死兔帮 老大]默尔索',

'[黑云会 若众]鸿璐',

'[六协会南部5科]鸿璐',

'[W公司2级清扫人员]鸿璐',

'[猎牙事务所收尾人]鸿璐',

'[し协会南部5科]希斯克利夫',

'[N公司小锤]希斯克利夫',

'[Seven协会南部4科]希斯克利夫',

'[し协会南部5科]以实玛利',

'[LCCB系长]以实玛利',

'[脑叶公司E.G.O :: 荡漾]以实玛利',

'[埃德加家族 管家]以实玛利',

'[LCCB系长]罗佳',

'[N公司中锤]罗佳',

'[Zwei协会南部5科]罗佳',

'[T公司2级征收人员]罗佳',

'[Zwei协会南部6科]辛克莱',

'[流浪乐队老大]辛克莱',

'[脑叶公司E.G.O :: 朱符]辛克莱',

'[Zwei协会西部3科]辛克莱',

'[剑契组杀手]奥提斯',

'[G公司部长]奥提斯',

'[Cinq协会南部4科]奥提斯',

'[环指 点彩派 学徒]奥提斯',

'[六协会南部6科]格里高尔',

'[玫瑰扳手工坊收尾人]格里高尔',

    ];
    for (var i = 0; i < 41; i++) {
        var rawName = stars2Names[i] || ('2★人格 ' + (i + 1));
        var parsed = parseBracketName(rawName);
        LC_PersonalityData.push({
            id: 'p2_' + String(i + 1).padStart(3, '0'),
            name: rawName,
            title: parsed.title,
            charName: parsed.charName,
            rarity: '2star',
            type: 'personality',
            stars: 2,
            index: i + 1,
            description: '二星人格 ' + (i + 1)
        });
    }
})();

// 1★人格（12个）
(function() {
    var stars1Names = [
        
        '[LCB 罪人]李箱',
        '[LCB罪人]浮士德',

'[LCB罪人]堂吉诃德',

'[LCB罪人]良秀',

'[LCB罪人]默尔索',

'[LCB罪人]鸿璐',

'[LCB罪人]希斯克利夫',

'[LCB罪人]以实玛利',

'[LCB罪人]罗佳',

'[LCB罪人]辛克莱',

'[LCB罪人]奥提斯',

'[LCB罪人]格里高尔',

    ];
    for (var i = 0; i < 12; i++) {
        var rawName = stars1Names[i] || ('1★人格 ' + (i + 1));
        var parsed = parseBracketName(rawName);
        LC_PersonalityData.push({
            id: 'p1_' + String(i + 1).padStart(3, '0'),
            name: rawName,
            title: parsed.title,
            charName: parsed.charName,
            rarity: '1star',
            type: 'personality',
            stars: 1,
            index: i + 1,
            description: '一星人格 ' + (i + 1)
        });
    }
})();

// ========================================
// 数据访问辅助函数
// ========================================
var LC_DataHelper = {
    // 每个池子独立的EGO获取状态（按poolId存储已获取的EGO ID集合）
    _poolEgoObtained: {},
    
    // 确保池子的EGO状态已初始化
    _ensurePoolEgoState: function(poolId) {
        if (!this._poolEgoObtained[poolId]) {
            this._poolEgoObtained[poolId] = {};
        }
    },

    // ===== 卡池物品归属过滤（基于 LC_RestrictedItems） =====
    // 规则：未登记物品→全部池允许；登记物品→仅 restrictedToPools 中的池允许
    // 目的：过往卡池/常驻池/新手池不会被"新增的当期UP或限定物品"占用概率与抽取名额

    // 判断单个物品在指定池中是否允许出现（按id或name查询 LC_RestrictedItems）
    _isItemAllowedInPool: function(item, poolId) {
        // ① 如果此调用未提供poolId（兼容旧代码入口）→ 一律允许，避免误伤
        if (!poolId) return true;
        if (!item) return false;
        if (typeof LC_RestrictedItems === 'undefined') return true;

        // ② 按id查限制，其次按name查（任意一个命中即应用限制规则）
        var hit = null;
        if (item.id && LC_RestrictedItems[item.id]) hit = LC_RestrictedItems[item.id];
        else if (item.name && LC_RestrictedItems[item.name]) hit = LC_RestrictedItems[item.name];

        // ③ 没命中限制 → 默认允许（所有常驻老物品走这条）
        if (!hit) return true;

        // ④ 命中限制 → poolId 必须出现在 restrictedToPools 白名单中才允许
        var whitelist = hit.restrictedToPools || [];
        return whitelist.indexOf(poolId) !== -1;
    },

    // 批量过滤：只保留 poolId 允许的物品（影响物品计数与概率平分）
    _filterItemsByPool: function(items, poolId) {
        if (!poolId || !items || items.length === 0) return items || [];
        if (typeof LC_RestrictedItems === 'undefined') return items;
        var self = this;
        return items.filter(function(it) { return self._isItemAllowedInPool(it, poolId); });
    },
    
    // 检查某个EGO在指定池子中是否已获取
    isEgoObtainedInPool: function(egoId, poolId) {
        this._ensurePoolEgoState(poolId);
        return !!this._poolEgoObtained[poolId][egoId];
    },
    
    // 获取指定稀有度的人格（poolId可选，提供则只返回该池允许出现的人格）
    getPersonalitiesByRarity: function(rarity, poolId) {
        var base = LC_PersonalityData.filter(function(p) { return p.rarity === rarity; });
        return this._filterItemsByPool(base, poolId);
    },
    
    // 获取指定稀有度的人格数量（poolId可选，提供则按该池实际可见数量统计）
    getPersonalityCount: function(rarity, poolId) {
        return this.getPersonalitiesByRarity(rarity, poolId).length;
    },
    
    // 获取所有E.G.O（poolId可选，提供则只返回该池允许出现的EGO）
    getAllEgos: function(poolId) {
        return this._filterItemsByPool(LC_EgoData.slice(), poolId);
    },
    
    // 获取播报员（兼容旧：poolId不提供时返回第一个；提供时返回该池允许中的第一个）
    getNarrator: function(poolId) {
        var list = this._filterItemsByPool(LC_NarratorData.slice(), poolId);
        return list && list.length > 0 ? list[0] : LC_NarratorData[0];
    },
    
    // 获取所有播报员（poolId可选，用于按池过滤）
    getAllNarrators: function(poolId) {
        return this._filterItemsByPool(LC_NarratorData.slice(), poolId);
    },
    
    // 获取指定池子中已获取的E.G.O数量
    getObtainedEgoCount: function(poolId) {
        if (!poolId) {
            // 无poolId时使用全局obtained属性（兼容旧代码）
            return LC_EgoData.filter(function(e) { return e.obtained; }).length;
        }
        this._ensurePoolEgoState(poolId);
        var count = 0;
        for (var id in this._poolEgoObtained[poolId]) {
            if (this._poolEgoObtained[poolId][id]) count++;
        }
        return count;
    },
    
    // 获取指定池子中剩余E.G.O数量（按该池实际允许的EGO总数减去已获取数）
    getRemainingEgoCount: function(poolId) {
        var poolEgos = this.getAllEgos(poolId);
        var total = poolEgos ? poolEgos.length : LC_EgoData.length;
        if (!poolId) {
            return LC_EgoData.filter(function(e) { return !e.obtained; }).length;
        }
        this._ensurePoolEgoState(poolId);
        var obtainedCount = this.getObtainedEgoCount(poolId);
        return Math.max(0, total - obtainedCount);
    },
    
    // 在指定池子中随机标记一个未获取的E.G.O为已获取（只在该池允许的EGO范围内抽）
    markRandomEgoObtained: function(poolId) {
        if (!poolId) {
            // 兼容旧代码
            var unobtained = LC_EgoData.filter(function(e) { return !e.obtained; });
            if (unobtained.length > 0) {
                var idx = Math.floor(Math.random() * unobtained.length);
                unobtained[idx].obtained = true;
                return unobtained[idx];
            }
            return null;
        }
        this._ensurePoolEgoState(poolId);
        var self = this;
        // ① 先按池过滤EGO白名单，再剔除该池中已获取的
        var poolAllowedEgos = this.getAllEgos(poolId);
        var unobtained = poolAllowedEgos.filter(function(e) { return !self._poolEgoObtained[poolId][e.id]; });
        if (unobtained.length > 0) {
            var idx = Math.floor(Math.random() * unobtained.length);
            this._poolEgoObtained[poolId][unobtained[idx].id] = true;
            // 抽卡后自动保存状态
            this.savePoolEgoState();
            return unobtained[idx];
        }
        return null;
    },
    
    // 重置指定池子的E.G.O获取状态
    resetPoolEgos: function(poolId) {
        if (poolId) {
            this._poolEgoObtained[poolId] = {};
            this.savePoolEgoState();
        }
    },
    
    // 重置所有池子的E.G.O获取状态
    resetAllEgos: function() {
        this._poolEgoObtained = {};
        LC_EgoData.forEach(function(e) { e.obtained = false; });
        this.savePoolEgoState();
    },
    
    // ===== EGO持有状态持久化（localStorage） =====
    _egostorageKey: 'lc_gacha_pool_ego_obtained',
    
    // 保存所有池子的EGO获取状态到localStorage
    savePoolEgoState: function() {
        try {
            // 转换为可序列化的结构（只保存true的条目）
            var serializable = {};
            for (var pid in this._poolEgoObtained) {
                var poolObj = this._poolEgoObtained[pid];
                var ids = [];
                for (var eid in poolObj) {
                    if (poolObj[eid]) ids.push(eid);
                }
                if (ids.length > 0) serializable[pid] = ids;
            }
            localStorage.setItem(this._egostorageKey, JSON.stringify(serializable));
        } catch(e) { /* 静默失败 */ }
    },
    
    // 从localStorage加载所有池子的EGO获取状态
    loadPoolEgoState: function() {
        try {
            var raw = localStorage.getItem(this._egostorageKey);
            if (!raw) return;
            var data = JSON.parse(raw);
            if (!data || typeof data !== 'object') return;
            for (var pid in data) {
                var ids = data[pid];
                if (Array.isArray(ids)) {
                    this._ensurePoolEgoState(pid);
                    for (var i = 0; i < ids.length; i++) {
                        this._poolEgoObtained[pid][ids[i]] = true;
                    }
                }
            }
        } catch(e) { /* 静默失败 */ }
    },
    
    // 根据稀有度随机获取一个具体人格/EGO/播报员实例（poolId用于按池归属过滤）
    getRandomItemByRarity: function(rarity, poolId) {
        if (rarity === 'narrator') {
            // 按池过滤播报员，再随机取1个；兼容无poolId时返回第1个
            var narratorList = this.getAllNarrators(poolId);
            if (narratorList && narratorList.length > 0) {
                return narratorList[Math.floor(Math.random() * narratorList.length)];
            }
            return this.getNarrator();
        }
        if (rarity === 'ego') {
            var unobtained;
            // 先按池过滤，再结合该池已获取状态剔除
            var egoCandidates = this.getAllEgos(poolId);
            if (poolId) {
                this._ensurePoolEgoState(poolId);
                var self = this;
                unobtained = egoCandidates.filter(function(e) { return !self._poolEgoObtained[poolId][e.id]; });
            } else {
                unobtained = egoCandidates.filter(function(e) { return !e.obtained; });
            }
            if (unobtained.length > 0) {
                return unobtained[Math.floor(Math.random() * unobtained.length)];
            }
            // 所有E.G.O都获取了，返回候选中随机一个
            return egoCandidates[Math.floor(Math.random() * egoCandidates.length)];
        }
        // 人格：直接使用支持 poolId 的过滤函数
        var list = this.getPersonalitiesByRarity(rarity, poolId);
        if (list.length > 0) {
            return list[Math.floor(Math.random() * list.length)];
        }
        return null;
    },
    
    // 获取卡池横幅图片
    getPoolBanner: function(subPoolId) {
        if (LC_ImageAssets.poolBanners[subPoolId]) {
            return LC_ImageAssets.poolBanners[subPoolId];
        }
        return LC_ImageAssets.defaultBanner;
    },
    
    // 获取物品的显示文本（根据稀有度格式化）
    getDisplayString: function(item) {
        if (!item) return '';
        if (item.type === 'narrator') {
            return item.name || '瓦伦希娜/卢西奥';
        }
        if (item.type === 'ego') {
            if (item.title && item.charName) {
                return '[' + item.title + '] ' + item.charName;
            }
            return item.name;
        }
        // personality
        var starsStr = '';
        if (item.stars) {
            for (var s = 0; s < item.stars; s++) starsStr += '★';
        }
        if (item.title && item.charName) {
            return starsStr + '[' + item.title + '] ' + item.charName;
        }
        return starsStr + item.name;
    },

    // ===== 理想兑换相关 =====
    // 获取指定卡池的可兑换物品列表
    getExchangeItems: function(poolId) {
        if (!poolId) return [];
        return LC_ExchangeConfig[poolId] || [];
    },

    // 根据ID标记指定E.G.O为已获取（用于兑换）
    markEgoObtainedById: function(egoId, poolId) {
        // 按池子独立记录
        if (poolId) {
            this._ensurePoolEgoState(poolId);
            this._poolEgoObtained[poolId][egoId] = true;
        }
        // 同时设置全局 obtained 以兼容旧代码
        var target = LC_EgoData.find(function(e) { return e.id === egoId; });
        if (target) {
            target.obtained = true;
            return target;
        }
        // 如果ID找不到，尝试按名称匹配（兼容自定义兑换物品ID）
        var byName = LC_EgoData.find(function(e) { return e.id === egoId || ('ego_' + egoId === e.id); });
        if (byName) { byName.obtained = true; return byName; }
        return null;
    },

    // 设置指定E.G.O的持有状态（用于"设定EGO持有情况"功能，支持标记为已获取或取消标记）
    setEgoObtained: function(egoId, poolId, isObtained) {
        if (!poolId) return;
        this._ensurePoolEgoState(poolId);
        if (isObtained) {
            this._poolEgoObtained[poolId][egoId] = true;
        } else {
            delete this._poolEgoObtained[poolId][egoId];
        }
        // 同步更新全局 obtained（仅在按ID能找到时）
        var target = LC_EgoData.find(function(e) { return e.id === egoId; });
        if (target) {
            target.obtained = !!isObtained;
        }
    },

    // 批量设置指定池子的多个E.G.O持有状态
    batchSetEgoObtained: function(poolId, egoStateMap) {
        if (!poolId || !egoStateMap) return;
        this._ensurePoolEgoState(poolId);
        var self = this;
        Object.keys(egoStateMap).forEach(function(egoId) {
            self.setEgoObtained(egoId, poolId, egoStateMap[egoId]);
        });
        // 自动持久化
        this.savePoolEgoState();
    },

    // 检查E.G.O是否已获取（按ID或名称）
    isEgoObtained: function(idOrName, poolId) {
        // 先检查池子独立状态
        if (poolId) {
            this._ensurePoolEgoState(poolId);
            if (this._poolEgoObtained[poolId][idOrName]) return true;
            // 也检查是否ID或名称匹配
            var hit = LC_EgoData.find(function(e) {
                return e.id === idOrName || e.name === idOrName || ('ego_' + idOrName === e.id);
            });
            if (hit && this._poolEgoObtained[poolId][hit.id]) return true;
        }
        // 兜底：检查全局 obtained 属性
        var hit2 = LC_EgoData.find(function(e) {
            return e.id === idOrName || e.name === idOrName || ('ego_' + idOrName === e.id);
        });
        return !!(hit2 && hit2.obtained);
    },

    // 根据稀有度返回所有人格列表（用于兑换人格时；poolId可选，提供则按池过滤）
    getAllPersonalities: function(poolId) {
        return this._filterItemsByPool(LC_PersonalityData.slice(), poolId);
    },

    // ===== 卡池个体概率计算 =====
    // 获取某池的UP概率硬编码配置（自动回退到poolGroupId）
    getPoolRatesConfig: function(poolId) {
        if (!poolId) return {};
        if (LC_PoolRatesConfig[poolId]) return LC_PoolRatesConfig[poolId];
        // 兜底：如果是带前缀的pool找不到（例如lc-current-rps的父lc-current），就返回一个空结构
        return { narrator: {}, ego: {}, '3star': {}, '2star': {}, '1star': {} };
    },

    // 根据稀有度类别返回该类别下所有物品（poolId可选，提供则按该池归属过滤）
    _getAllItemsByRarity: function(rarityKey, poolId) {
        var raw;
        if (rarityKey === 'narrator') raw = LC_NarratorData.slice();
        else if (rarityKey === 'ego') raw = LC_EgoData.slice();
        else if (rarityKey === '3star' || rarityKey === '2star' || rarityKey === '1star') {
            // 注意：这里必须传poolId给getPersonalitiesByRarity，才能对人格做池归属过滤
            return this.getPersonalitiesByRarity(rarityKey, poolId);
        } else {
            return [];
        }
        // 播报员与EGO走统一池过滤
        return this._filterItemsByPool(raw, poolId);
    },

    // 根据UP表查找某物品的硬编码固定概率（按id或name匹配），返回数字或null
    _lookupHardcodedRate: function(upMap, item) {
        if (!upMap || !item) return null;
        if (item.id && upMap[item.id] !== undefined && upMap[item.id] !== null) return upMap[item.id];
        if (item.name && upMap[item.name] !== undefined && upMap[item.name] !== null) return upMap[item.name];
        return null;
    },

    /**
     * 计算某池某稀有度类别的个体概率分布
     * @param {string} poolId - 唯一卡池ID（subPool或poolGroup）
     * @param {string} rarityKey - 'narrator' | 'ego' | '3star' | '2star' | '1star'
     * @param {number} totalRatePercent - 该类别在总100%中的总概率（如 EGO 总 1.3%）
     * @returns {Array<{item:object, rate:number, isUp:boolean}>} 每项的个体概率（以%为单位）
     */
    getIndividualRateList: function(poolId, rarityKey, totalRatePercent) {
        var cfg = this.getPoolRatesConfig(poolId);
        var upMap = cfg[rarityKey] || {};
        // 关键：传入poolId到 _getAllItemsByRarity → 该池不包含的物品会被预先过滤
        // → 过滤后得到的items不包含新人格/新播报，它们不再参与概率平分
        // → 从而保证"过往卡池不被新物品占用概率"这条规则严格成立
        var items = this._getAllItemsByRarity(rarityKey, poolId);
        
        // EGO特殊处理：记录过滤前的总数
        var egoTotalBeforeFilter = 0;
        if (rarityKey === 'ego' && items) {
            egoTotalBeforeFilter = items.length;
        }
        
        // EGO特殊过滤：如果提供了poolId，剔除该池中已获取（被移除）的EGO
        if (rarityKey === 'ego' && poolId && items && items.length > 0) {
            var self = this;
            items = items.filter(function(it) {
                return !self.isEgoObtainedInPool(it.id, poolId);
            });
        }
        if (!items || items.length === 0) return [];

        // EGO概率重新计算规则：
        // 当有EGO被移除时，剩余EGO平分总概率（totalRatePercent），不再使用UP硬编码概率
        // 没有EGO被移除时，才使用UP配置的硬编码概率
        var egoHasRemovals = (rarityKey === 'ego' && egoTotalBeforeFilter > 0 && items.length < egoTotalBeforeFilter);
        
        if (egoHasRemovals) {
            // EGO被移除过：所有剩余EGO平分总概率，UP标记保留但不影响概率
            var equalRate = totalRatePercent / items.length;
            var result = [];
            for (var ei = 0; ei < items.length; ei++) {
                var eit = items[ei];
                var eFixed = this._lookupHardcodedRate(upMap, eit);
                result.push({ 
                    item: eit, 
                    rate: parseFloat(equalRate.toFixed(6)), 
                    isUp: (eFixed !== null && !isNaN(eFixed)) 
                });
            }
            // UP物品排序到最前面
            result.sort(function(a, b) {
                if (a.isUp && !b.isUp) return -1;
                if (!a.isUp && b.isUp) return 1;
                return 0;
            });
            return result;
        }

        var result = [];
        var sumUp = 0;
        var notUpCount = 0;
        // 第一遍：标记UP项并累加UP概率
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var fixed = this._lookupHardcodedRate(upMap, it);
            if (fixed !== null && !isNaN(fixed)) {
                result.push({ item: it, rate: parseFloat(fixed), isUp: true });
                sumUp += parseFloat(fixed);
            } else {
                // 占位，后续填入均分概率
                result.push({ item: it, rate: 0, isUp: false });
                notUpCount++;
            }
        }

        // 剩余概率
        var remaining = Math.max(0, totalRatePercent - sumUp);
        // 如果UP总和已经超过总概率，按比例缩放（保底不破坏总100%）
        if (sumUp >= totalRatePercent) {
            var scale = totalRatePercent / sumUp;
            for (var j = 0; j < result.length; j++) {
                if (result[j].isUp) result[j].rate = parseFloat((result[j].rate * scale).toFixed(6));
            }
        } else if (notUpCount > 0) {
            var each = remaining / notUpCount;
            for (var k = 0; k < result.length; k++) {
                if (!result[k].isUp) {
                    result[k].rate = parseFloat(each.toFixed(6));
                }
            }
        }

        // 将UP物品排序到最前面
        result.sort(function(a, b) {
            if (a.isUp && !b.isUp) return -1;
            if (!a.isUp && b.isUp) return 1;
            return 0;
        });

        return result;
    },

    /**
     * 根据稀有度加权随机抽取一个物品（考虑当期UP硬编码概率）
     */
    getRandomItemByRarityWeighted: function(poolId, rarityKey, totalRatePercent) {
        var list = this.getIndividualRateList(poolId, rarityKey, totalRatePercent);
        
        // EGO特殊：由于getIndividualRateList已过滤掉已获取的EGO，
        // 如果过滤后列表为空（所有EGO已获取），则回退到未过滤的完整列表
        // 以支持全部获取后仍可重复抽取的回退逻辑
        if ((!list || list.length === 0) && rarityKey === 'ego' && poolId) {
            var fullItems = this._getAllItemsByRarity('ego', poolId);
            if (fullItems && fullItems.length > 0) {
                // 用未过滤的列表重建概率（不再过滤已获取的）
                var cfg = this.getPoolRatesConfig(poolId);
                var upMap = cfg['ego'] || {};
                list = [];
                var sumUp = 0;
                var notUpCount = 0;
                for (var fi = 0; fi < fullItems.length; fi++) {
                    var fit = fullItems[fi];
                    var fixed = this._lookupHardcodedRate(upMap, fit);
                    if (fixed !== null && !isNaN(fixed)) {
                        list.push({ item: fit, rate: parseFloat(fixed), isUp: true });
                        sumUp += parseFloat(fixed);
                    } else {
                        list.push({ item: fit, rate: 0, isUp: false });
                        notUpCount++;
                    }
                }
                var remaining = Math.max(0, totalRatePercent - sumUp);
                if (sumUp >= totalRatePercent) {
                    var scale = totalRatePercent / sumUp;
                    for (var fj = 0; fj < list.length; fj++) {
                        if (list[fj].isUp) list[fj].rate = parseFloat((list[fj].rate * scale).toFixed(6));
                    }
                } else if (notUpCount > 0) {
                    var each = remaining / notUpCount;
                    for (var fk = 0; fk < list.length; fk++) {
                        if (!list[fk].isUp) {
                            list[fk].rate = parseFloat(each.toFixed(6));
                        }
                    }
                }
            }
        }
        
        if (!list || list.length === 0) return null;

        // EGO特殊：剔除已获得的（按池子独立判断）
        var filtered = list;
        if (rarityKey === 'ego') {
            var self = this;
            filtered = list.filter(function(entry) {
                // 使用池子独立的EGO获取状态判断
                if (poolId) {
                    return !self.isEgoObtainedInPool(entry.item.id, poolId);
                }
                // 无poolId时使用全局obtained属性（兼容旧代码）
                return !(entry.item.obtained);
            });
            if (filtered.length === 0) {
                // 全部获得，回退到list中随机（用户接受重复）
                filtered = list;
            }
        }

        var sum = 0;
        for (var i = 0; i < filtered.length; i++) sum += filtered[i].rate;
        if (sum <= 0) return filtered[0].item;

        var r = Math.random() * sum;
        var acc = 0;
        for (var j = 0; j < filtered.length; j++) {
            acc += filtered[j].rate;
            if (r <= acc) return filtered[j].item;
        }
        return filtered[filtered.length - 1].item;
    },

    /**
     * 一次性返回整个卡池的全品类个体概率表
     */
    getAllPoolIndividualRates: function(poolId, poolRates) {
        var out = {};
        var self = this;
        var keys = [];
        if (poolRates.narrator !== undefined) keys.push('narrator');
        if (poolRates.ego !== undefined) keys.push('ego');
        if (poolRates['3star'] !== undefined) keys.push('3star');
        if (poolRates['2star'] !== undefined) keys.push('2star');
        if (poolRates['1star'] !== undefined) keys.push('1star');
        keys.forEach(function(k) {
            out[k] = self.getIndividualRateList(poolId, k, poolRates[k]);
        });
        return out;
    }
};
