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
        'lc-current-rps': 'images/limbus0001.png',
        // 当期卡池子卡池：欢迎新经理（新手池）
        'lc-welcome': 'images/limbus0002.png',
        // 常驻卡池默认横幅
        'lc-permanent': ''
    },
    
    // 默认卡池横幅（当未指定具体卡池图片时使用）
    defaultBanner: 'images/limbus0002.png'
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
            // 播报员：瓦伦希娜/卢西奥，1.3%总概率只有1个，默认平分即可，不UP
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
// 播报员数据（共1个）
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
// 人格数据（共140个：3★×87, 2★×41, 1★×12）
// ========================================
var LC_PersonalityData = [];

// 3★人格（87个）
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

'[Cing协会南部4科科长]辛克莱',

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

    ];
    for (var i = 0; i < 87; i++) {
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
    
    // 检查某个EGO在指定池子中是否已获取
    isEgoObtainedInPool: function(egoId, poolId) {
        this._ensurePoolEgoState(poolId);
        return !!this._poolEgoObtained[poolId][egoId];
    },
    
    // 获取指定稀有度的所有人格
    getPersonalitiesByRarity: function(rarity) {
        return LC_PersonalityData.filter(function(p) { return p.rarity === rarity; });
    },
    
    // 获取指定稀有度的人格数量
    getPersonalityCount: function(rarity) {
        return LC_PersonalityData.filter(function(p) { return p.rarity === rarity; }).length;
    },
    
    // 获取所有E.G.O
    getAllEgos: function() {
        return LC_EgoData;
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
    
    // 获取指定池子中剩余E.G.O数量
    getRemainingEgoCount: function(poolId) {
        if (!poolId) {
            return LC_EgoData.filter(function(e) { return !e.obtained; }).length;
        }
        this._ensurePoolEgoState(poolId);
        var obtainedCount = this.getObtainedEgoCount(poolId);
        return LC_EgoData.length - obtainedCount;
    },
    
    // 在指定池子中随机标记一个未获取的E.G.O为已获取
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
        var unobtained = LC_EgoData.filter(function(e) { return !self._poolEgoObtained[poolId][e.id]; });
        if (unobtained.length > 0) {
            var idx = Math.floor(Math.random() * unobtained.length);
            this._poolEgoObtained[poolId][unobtained[idx].id] = true;
            return unobtained[idx];
        }
        return null;
    },
    
    // 重置指定池子的E.G.O获取状态
    resetPoolEgos: function(poolId) {
        if (poolId) {
            this._poolEgoObtained[poolId] = {};
        }
    },
    
    // 重置所有池子的E.G.O获取状态
    resetAllEgos: function() {
        this._poolEgoObtained = {};
        LC_EgoData.forEach(function(e) { e.obtained = false; });
    },
    
    // 获取播报员
    getNarrator: function() {
        return LC_NarratorData[0];
    },
    
    // 根据稀有度随机获取一个具体人格/EGO/播报员实例
    getRandomItemByRarity: function(rarity, poolId) {
        if (rarity === 'narrator') {
            return this.getNarrator();
        }
        if (rarity === 'ego') {
            var unobtained;
            if (poolId) {
                this._ensurePoolEgoState(poolId);
                var self = this;
                unobtained = LC_EgoData.filter(function(e) { return !self._poolEgoObtained[poolId][e.id]; });
            } else {
                unobtained = LC_EgoData.filter(function(e) { return !e.obtained; });
            }
            if (unobtained.length > 0) {
                return unobtained[Math.floor(Math.random() * unobtained.length)];
            }
            // 所有E.G.O都获取了，返回随机一个
            return LC_EgoData[Math.floor(Math.random() * LC_EgoData.length)];
        }
        var list = this.getPersonalitiesByRarity(rarity);
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

    // 根据稀有度返回所有人格列表（用于兑换人格时）
    getAllPersonalities: function() {
        return LC_PersonalityData.slice();
    },

    // ===== 卡池个体概率计算 =====
    // 获取某池的UP概率硬编码配置（自动回退到poolGroupId）
    getPoolRatesConfig: function(poolId) {
        if (!poolId) return {};
        if (LC_PoolRatesConfig[poolId]) return LC_PoolRatesConfig[poolId];
        // 兜底：如果是带前缀的pool找不到（例如lc-current-rps的父lc-current），就返回一个空结构
        return { narrator: {}, ego: {}, '3star': {}, '2star': {}, '1star': {} };
    },

    // 根据稀有度类别返回该类别下所有物品
    _getAllItemsByRarity: function(rarityKey) {
        if (rarityKey === 'narrator') return LC_NarratorData.slice();
        if (rarityKey === 'ego') return LC_EgoData.slice();
        if (rarityKey === '3star' || rarityKey === '2star' || rarityKey === '1star') {
            return this.getPersonalitiesByRarity(rarityKey);
        }
        return [];
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
        var items = this._getAllItemsByRarity(rarityKey);
        if (!items || items.length === 0) return [];

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
