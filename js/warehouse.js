// ==================== 仓库系统 ====================
// 仓库功能：存放启动器内可用的道具/材料等
// 数据按账户隔离存储（localStorage key = warehouse_<username>），不同账户仓库互不相通
// 入口：游戏中心顶部导航栏「仓库」条目（登录页不显示）
// 道具接入：
//   - 经验加成卡：使用后30分钟内经验获取提升（生效于每日签到与活动签到经验），可重复使用覆盖已有加成
//   - 幸运币：使用后激活幸运状态，下一次提取自动消耗并提升稀有项概率
//   - 单抽/十连卡券：提取时自动优先使用（免费抵扣狂气消耗）
//   - 补签卡：在每日签到页点击未解锁的奖励卡即可使用，立即解锁并领取该天奖励
//   - 经验值补给卡：使用后立即获得对应点数经验值，直接对账户等级生效
// 开发者模式：系统设置开启开发者模式后，仓库工具栏最右侧显示「获取道具（dev）」按钮

var WAREHOUSE_DATA_VERSION = 3; // 数据版本：升级时自动迁移旧仓库数据（保留已有道具，仅剔除目录中已移除的旧道具）

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
    exp_boost_small: {
        name: '经验值加成卡 Ⅰ', icon: 'fas fa-arrow-up', color: '#3498db',
        category: 'consumable', rarity: 'common', showSource: true,
        desc: '使用后30分钟内，经验获取提升10%（签到经验结算时生效，可重复使用刷新时长）。',
        source: '活动奖励 / 商店兑换', usable: true
    },
    exp_boost_mid: {
        name: '经验值加成卡 Ⅱ', icon: 'fas fa-arrow-circle-up', color: '#9b59b6',
        category: 'consumable', rarity: 'rare', showSource: true,
        desc: '使用后30分钟内，经验获取提升25%（签到经验结算时生效，可重复使用刷新时长）。',
        source: '活动奖励 / 商店兑换', usable: true
    },
    exp_boost_large: {
        name: '经验值加成卡 Ⅲ', icon: 'fas fa-rocket', color: '#f39c12',
        category: 'consumable', rarity: 'epic', showSource: true,
        desc: '使用后30分钟内，经验获取提升50%（签到经验结算时生效，可重复使用刷新时长）。',
        source: '特殊活动奖励', usable: true
    },
    gacha_single: {
        name: '单次抽卡卷', icon: 'fas fa-ticket-alt', color: '#2ecc71',
        category: 'consumable', rarity: 'rare', showSource: true,
        desc: '在抽卡模拟器提取1次时自动优先使用，本次提取免扣狂气。',
        source: '签到 / 邮件附件', usable: false
    },
    gacha_ten: {
        name: '十连抽卡卷', icon: 'fas fa-ticket', color: '#8e44ad',
        category: 'consumable', rarity: 'epic', showSource: true,
        desc: '在抽卡模拟器十连提取时自动优先使用，本次提取免扣狂气。',
        source: '特殊活动奖励', usable: false
    },
    makeup_card: {
        name: '补签卡', icon: 'fas fa-calendar-plus', color: '#e67e22',
        category: 'consumable', rarity: 'rare', showSource: true,
        desc: '在部分签到活动中可使用该补签卡即可解锁未被解锁的奖励卡，并领取该天奖励。',
        source: '活动奖励 / 邮件附件', usable: false
    },
    luck_coin: {
        name: '幸运币', icon: 'fas fa-coins', color: '#f1c40f',
        category: 'consumable', rarity: 'rare', showSource: true,
        desc: '使用后激活幸运状态：下一次提取时稀有项概率翻倍（自动消耗1枚）。',
        source: '百宝箱 / 活动奖励', usable: true
    },
    exp_supply_1: {
        name: '经验值补给卡 Ⅰ', icon: 'fas fa-star', color: '#3498db',
        category: 'consumable', rarity: 'common', showSource: true,
        desc: '使用后获得1000点经验值，将立即对账户等级生效。',
        source: '活动奖励 / 邮件附件', usable: true
    },
    exp_supply_2: {
        name: '经验值补给卡 Ⅱ', icon: 'fas fa-star', color: '#9b59b6',
        category: 'consumable', rarity: 'rare', showSource: true,
        desc: '使用后获得2000点经验值，将立即对账户等级生效。',
        source: '活动奖励 / 邮件附件', usable: true
    },
    exp_supply_3: {
        name: '经验值补给卡 Ⅲ', icon: 'fas fa-star', color: '#f39c12',
        category: 'consumable', rarity: 'epic', showSource: true,
        desc: '使用后获得3000点经验值，将立即对账户等级生效。',
        source: '活动奖励 / 邮件附件', usable: true
    },

    // ---- 徽章 ----
    medal_pioneer: {
        name: '先驱者勋章', icon: 'fas fa-medal', color: '#f39c12',
        category: 'badge', rarity: 'legendary', showSource: true,
        desc: '授予早期加入启动器的用户纪念勋章。',
        source: '成就系统（敬请期待）', usable: false
    },
    anniv_badge: {
        name: '周年纪念徽章', icon: 'fas fa-award', color: '#f1c40f',
        category: 'badge', rarity: 'legendary', showSource: true,
        desc: 'PRE Launcher 周年庆典限定纪念徽章。',
        source: '周年庆活动', usable: false
    },
    half_anniv_badge: {
        name: '半周年纪念徽章', icon: 'fas fa-certificate', color: '#e67e22',
        category: 'badge', rarity: 'legendary', showSource: true,
        desc: 'PRE Launcher 半周年限定纪念徽章。',
        source: '半周年活动', usable: false
    }
};

// 分类筛选配置
var WAREHOUSE_CATEGORIES = [
    { id: 'all', name: '全部', icon: 'fas fa-th-large' },
    { id: 'consumable', name: '消耗品', icon: 'fas fa-bolt' },
    { id: 'material', name: '材料', icon: 'fas fa-cubes' },
    { id: 'badge', name: '徽章', icon: 'fas fa-medal' }
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
                if (!data.expBuff) data.expBuff = null;
                if (typeof data.luckyActive === 'undefined') data.luckyActive = false;
                if (migrated) saveWarehouseData(data); // 迁移结果立即落盘
                return data;
            }
        } catch (e) {}
    }
    return { version: WAREHOUSE_DATA_VERSION, items: {}, expBuff: null, luckyActive: false, createdAt: new Date().toISOString() };
}

function saveWarehouseData(data) {
    data.version = WAREHOUSE_DATA_VERSION;
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(getWarehouseStorageKey(), JSON.stringify(data));
}

// ==================== 仓库操作 API（供其他模块调用） ====================
// 添加道具：warehouseAddItem('gacha_single', 1, '签到第3天奖励')
function warehouseAddItem(itemId, qty, source) {
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
    if (typeof showToast === 'function') {
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

// 查询道具数量
function warehouseGetItemCount(itemId) {
    var data = getWarehouseData();
    return data.items[itemId] ? data.items[itemId].qty : 0;
}

// ==================== 道具效果接入 ====================
// 经验加成：计算当前生效的经验倍率（未激活/已过期返回1）
function getWarehouseExpMultiplier() {
    var data = getWarehouseData();
    if (!data.expBuff || !data.expBuff.expiresAt) return 1;
    if (new Date(data.expBuff.expiresAt).getTime() <= Date.now()) {
        data.expBuff = null;
        saveWarehouseData(data);
        return 1;
    }
    return data.expBuff.multiplier || 1;
}

// 激活经验加成（30分钟）
function activateWarehouseExpBuff(multiplier) {
    var data = getWarehouseData();
    data.expBuff = {
        multiplier: multiplier,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
    saveWarehouseData(data);
}

// 幸运币：激活幸运状态（使用时调用）
function activateWarehouseLucky() {
    var data = getWarehouseData();
    data.luckyActive = true;
    saveWarehouseData(data);
}

// 幸运币：提取时调用——若幸运状态激活则消耗1枚幸运币并返回true（仅提升一次）
function warehouseTakeLuckyBoost() {
    var data = getWarehouseData();
    if (!data.luckyActive) return false;
    if (!data.items['luck_coin']) {
        data.luckyActive = false;
        saveWarehouseData(data);
        return false;
    }
    data.items['luck_coin'].qty -= 1;
    if (data.items['luck_coin'].qty <= 0) delete data.items['luck_coin'];
    data.luckyActive = false;
    saveWarehouseData(data);
    return true;
}

// 补签卡：解锁活动签到的指定天（写入 makeupDays，仅解锁该天）
function warehouseUseMakeupCard(eventId, day) {
    if (warehouseGetItemCount('makeup_card') <= 0) return false;
    if (typeof getCheckinData !== 'function' || typeof saveCheckinData !== 'function') return false;
    if (!warehouseRemoveItem('makeup_card', 1)) return false;

    var data = getCheckinData(eventId);
    if (!data.makeupDays) data.makeupDays = [];
    if (data.makeupDays.indexOf(day) === -1) data.makeupDays.push(day);
    saveCheckinData(eventId, data);
    return true;
}

// 补签卡：弹窗询问是否使用（在签到页点击未解锁的奖励卡时调用）
// callback(used)：used=true 表示已消耗补签卡并解锁，可继续领取奖励
function warehousePromptMakeupCard(eventId, day, callback) {
    if (warehouseGetItemCount('makeup_card') <= 0) {
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
    return !!(devModeData[currentUser.username] && devModeData[currentUser.username].enabled);
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

// 渲染道具网格
function renderWarehouseItems() {
    var content = document.getElementById('whContent');
    var stats = document.getElementById('whStats');
    if (!content) return;

    var activeTab = document.querySelector('#whToolbar .wh-tab.active');
    var category = activeTab ? activeTab.getAttribute('data-cat') : 'all';

    var data = getWarehouseData();
    var ownedIds = Object.keys(data.items);

    // 分类筛选
    var filteredIds = ownedIds.filter(function(id) {
        var item = WAREHOUSE_ITEMS[id];
        return item && (category === 'all' || item.category === category);
    });

    // 按稀有度（传说>史诗>稀有>普通）、名称排序
    var rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    filteredIds.sort(function(a, b) {
        var ra = (rarityOrder[WAREHOUSE_ITEMS[a].rarity] !== undefined) ? rarityOrder[WAREHOUSE_ITEMS[a].rarity] : 4;
        var rb = (rarityOrder[WAREHOUSE_ITEMS[b].rarity] !== undefined) ? rarityOrder[WAREHOUSE_ITEMS[b].rarity] : 4;
        if (ra !== rb) return ra - rb;
        return WAREHOUSE_ITEMS[a].name.localeCompare(WAREHOUSE_ITEMS[b].name, 'zh-CN');
    });

    // 统计信息
    var totalKinds = ownedIds.length;
    var totalQty = ownedIds.reduce(function(sum, id) { return sum + data.items[id].qty; }, 0);
    if (stats) {
        var buffInfo = '';
        var mult = getWarehouseExpMultiplier();
        if (mult > 1) buffInfo = '<span class="wh-stat wh-buff"><i class="fas fa-bolt"></i> 经验加成 ×' + mult + ' 生效中</span>';
        stats.innerHTML = '<span class="wh-stat"><i class="fas fa-layer-group"></i> 道具种类 <b>' + totalKinds + '</b></span>' +
            '<span class="wh-stat"><i class="fas fa-cube"></i> 道具总数 <b>' + totalQty + '</b></span>' + buffInfo;
    }

    if (filteredIds.length === 0) {
        content.innerHTML = '<div class="wh-empty"><i class="fas fa-box-open"></i><p>暂无道具</p><span>通过签到、活动、邮件等方式获取道具后，将存放在此处</span></div>';
        return;
    }

    content.innerHTML = filteredIds.map(function(id) {
        return buildWarehouseCardHTML(id, data.items[id], WAREHOUSE_REMOVE_MODE);
    }).join('');

    // 绑定使用按钮事件
    content.querySelectorAll('.wh-use-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            useWarehouseItem(btn.getAttribute('data-id'));
        });
    });

    // 绑定移除按钮事件（移除模式下）
    content.querySelectorAll('.wh-remove-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            warehouseRemoveItem(btn.getAttribute('data-id'), 1);
            renderWarehouseItems();
        });
    });
}

// 构建道具卡片 HTML
function buildWarehouseCardHTML(itemId, entry, removeMode) {
    var item = WAREHOUSE_ITEMS[itemId];
    var rarity = WAREHOUSE_RARITY[item.rarity] || WAREHOUSE_RARITY.common;
    var categoryLabel = getWarehouseCategoryLabel(item.category);

    // 来源文本：由顶部 WAREHOUSE_SHOW_SOURCE 全局开关 + 每个道具的 showSource 字段共同控制
    var sourceHtml = '';
    if (WAREHOUSE_SHOW_SOURCE && item.showSource) {
        sourceHtml = '<div class="wh-item-source"><i class="fas fa-link"></i> ' + (entry.source || item.source || '') + '</div>';
    }

    // 移除模式：显示移除按钮，其他按钮隐藏/禁用
    var actionHtml = '';
    if (removeMode) {
        actionHtml = '<button class="wh-remove-btn" data-id="' + itemId + '"><i class="fas fa-trash"></i> 移除</button>';
    } else if (item.usable) {
        actionHtml = '<button class="wh-use-btn" data-id="' + itemId + '"><i class="fas fa-hand-sparkles"></i> 使用</button>';
    }

    return '<div class="wh-item-card' + (removeMode ? ' wh-remove-mode' : '') + '">' +
        '<span class="wh-qty-badge">×' + entry.qty + '</span>' +
        '<span class="wh-type-tag" style="color:' + rarity.color + '; border-color:' + rarity.color + ';">' + categoryLabel + '</span>' +
        '<div class="wh-item-icon" style="background: ' + hexToRgba(item.color, 0.15) + ';">' +
            '<i class="' + item.icon + '" style="color:' + item.color + ';"></i>' +
        '</div>' +
        '<div class="wh-item-name">' + item.name + '</div>' +
        '<div class="wh-item-desc">' + item.desc + '</div>' +
        sourceHtml +
        actionHtml +
    '</div>';
}

// 分类名称
function getWarehouseCategoryLabel(category) {
    var labels = { consumable: '消耗品', material: '材料', badge: '徽章' };
    return labels[category] || '道具';
}

// 使用道具
function useWarehouseItem(itemId) {
    var item = WAREHOUSE_ITEMS[itemId];
    if (!item || !item.usable) return;

    var data = getWarehouseData();
    var entry = data.items[itemId];
    if (!entry || entry.qty <= 0) return;

    var buffMult = null;
    var isLucky = false;
    var expGain = null;
    if (itemId === 'exp_boost_small' || itemId === 'exp_boost_mid' || itemId === 'exp_boost_large') {
        buffMult = itemId === 'exp_boost_small' ? 1.1 : (itemId === 'exp_boost_mid' ? 1.25 : 1.5);
    } else if (itemId === 'luck_coin') {
        isLucky = true;
    } else if (itemId === 'exp_supply_1' || itemId === 'exp_supply_2' || itemId === 'exp_supply_3') {
        expGain = itemId === 'exp_supply_1' ? 1000 : (itemId === 'exp_supply_2' ? 2000 : 3000);
    } else {
        return;
    }

    // 先消耗道具
    entry.qty -= 1;
    if (entry.qty <= 0) delete data.items[itemId];
    saveWarehouseData(data);

    // 再激活效果（避免旧数据覆盖）
    if (buffMult !== null) {
        activateWarehouseExpBuff(buffMult);
    } else if (isLucky) {
        activateWarehouseLucky();
    } else if (expGain !== null) {
        if (typeof addCheckinExp === 'function') {
            addCheckinExp(expGain);
        } else {
            console.warn('[Warehouse] addCheckinExp not available, exp supply skipped:', expGain);
        }
    }

    if (typeof showToast === 'function') {
        if (isLucky) {
            showToast({ type: 'success', title: '幸运状态', message: '幸运币已激活：下一次提取时稀有项概率翻倍（自动消耗）' });
        } else if (expGain !== null) {
            showToast({ type: 'success', title: '经验值补给', message: '「' + item.name + '」已使用，获得 ' + expGain + ' 点经验值，已对账户等级生效' });
        } else {
            var expire = new Date(Date.now() + 30 * 60 * 1000);
            var hh = ('0' + expire.getHours()).slice(-2), mm = ('0' + expire.getMinutes()).slice(-2);
            showToast({ type: 'success', title: '经验加成', message: '「' + item.name + '」已激活，30分钟内经验获取 ×' + buffMult + '（至 ' + hh + ':' + mm + '）' });
        }
    }
    renderWarehouseItems();
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
                '<i class="' + item.icon + '" style="color:' + item.color + ';"></i>' +
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

        /* 卡片内移除按钮（移除模式下显示） */
        .wh-remove-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 7px 0;
            border: none;
            border-radius: 10px;
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .wh-remove-btn:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 10px rgba(231, 76, 60, 0.35);
        }

        /* 内容区域：一行固定6个道具 */
        .wh-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px 40px;
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 16px;
            align-content: start;
        }

        /* 道具卡片 - 与游戏中心卡片统一风格 */
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

        /* 窄屏适配（优先保证一行 6 个，仅在较窄视口逐级减少） */
        @media (max-width: 1200px) {
            .wh-content,
            .wh-dev-content {
                grid-template-columns: repeat(4, 1fr);
            }
        }

        @media (max-width: 900px) {
            .wh-content,
            .wh-dev-content {
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
            .wh-dev-content {
                padding: 16px;
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;
}
