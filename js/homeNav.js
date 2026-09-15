/* =====================================================
 * PRE Launcher - 首页导航模式（浏览器首页导航及辅助功能）
 * =====================================================
 * 功能：
 *  - 全屏首页导航界面：搜索（多引擎）、时钟问候、常用网站快捷导航
 *  - 完整同步启动器内置音乐播放器（复用 #soundtrackArea + soundtrack.js）
 *  - 高度自定义：搜索引擎、组件显隐、快捷链接增删改排序、背景
 *    （预设渐变 / 图片URL / 本地上传 / 遮罩暗度 / 背景模糊）、恢复默认
 *  - 「进入启动器」临时返回完整启动器界面，右下角悬浮按钮可随时返回首页
 *  - 模式持久化：localStorage.launcher_mode = 'home' | 'full'
 *    首页配置：homenav_settings / homenav_links / homenav_bg_custom
 * ===================================================== */

(function () {
    'use strict';

    // ==================== 常量与默认配置 ====================
    var SETTINGS_KEY = 'homenav_settings';
    var LINKS_KEY = 'homenav_links';
    var BG_CUSTOM_KEY = 'homenav_bg_custom';
    var MODE_KEY = 'launcher_mode';
    var HISTORY_KEY = 'homenav_search_history';
    var HISTORY_MAX = 200;     // 历史总上限
    var SUGGEST_HISTORY_SHOW = 6; // 下拉面板中展示的历史条数
    var ONLINE_SUGGEST_MAX = 8;   // 联网联想条数

    var SEARCH_ENGINES = {
        baidu: { name: '百度', short: '百', url: 'https://www.baidu.com/s?wd=' },
        bing: { name: '必应', short: '必', url: 'https://www.bing.com/search?q=' },
        google: { name: '谷歌', short: 'G', url: 'https://www.google.com/search?q=' },
        sogou: { name: '搜狗', short: '狗', url: 'https://www.sogou.com/web?query=' },
        so360: { name: '360搜索', short: '3', url: 'https://www.so.com/s?q=' },
        duckduckgo: { name: 'DuckDuckGo', short: 'D', url: 'https://duckduckgo.com/?q=' }
    };

    var BG_PRESETS = [
        { id: 'aurora', name: '极光粉', css: 'linear-gradient(135deg, #16102a 0%, #5d3a8e 50%, #d45d79 100%)' },
        { id: 'ocean', name: '深夜蓝', css: 'linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)' },
        { id: 'dusk', name: '暮空紫', css: 'linear-gradient(135deg, #2b1055 0%, #7597de 100%)' },
        { id: 'sunset', name: '日落橙', css: 'linear-gradient(160deg, #0f2027 0%, #a84b57 55%, #e67e8a 100%)' },
        { id: 'mint', name: '薄荷绿', css: 'linear-gradient(135deg, #123f33 0%, #1d7a63 55%, #56ab8a 100%)' },
        { id: 'obsidian', name: '曜石黑', css: 'linear-gradient(135deg, #0f1115 0%, #23262e 100%)' }
    ];

    var LINK_COLORS = [
        'linear-gradient(135deg, #d45d79 0%, #e67e8a 100%)',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
        'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
        'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
        'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
        'linear-gradient(135deg, #fd746c 0%, #ff9068 100%)',
        'linear-gradient(135deg, #16a085 0%, #f4d03f 100%)'
    ];

    var DEFAULT_SETTINGS = {
        engine: 'baidu',
        widgets: { clock: true, search: true, links: true, music: true },
        bg: { preset: 'aurora', dim: 25, blur: 0 }
    };

    var DEFAULT_LINKS = [
        { name: '哔哩哔哩', url: 'https://www.bilibili.com' },
        { name: '百度', url: 'https://www.baidu.com' },
        { name: '知乎', url: 'https://www.zhihu.com' },
        { name: 'GitHub', url: 'https://github.com' },
        { name: '网易云音乐', url: 'https://music.163.com' },
        { name: '微博', url: 'https://weibo.com' },
        { name: '淘宝', url: 'https://www.taobao.com' },
        { name: '京东', url: 'https://www.jd.com' }
    ];

    // ==================== 状态 ====================
    var settings = loadJSON(SETTINGS_KEY, null);
    if (!settings) {
        settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    } else {
        // 合并缺失的默认字段，兼容旧数据
        if (!settings.widgets) settings.widgets = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.widgets));
        if (!settings.bg) settings.bg = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.bg));
        if (!SEARCH_ENGINES[settings.engine]) settings.engine = DEFAULT_SETTINGS.engine;
    }
    var links = loadJSON(LINKS_KEY, null);
    if (!Array.isArray(links)) links = JSON.parse(JSON.stringify(DEFAULT_LINKS));

    var built = false;
    var visible = false;
    var clockTimer = null;
    var dragIndex = -1;
    var editingLinkIndex = -1;
    var currentBgImage = localStorage.getItem(BG_CUSTOM_KEY) || null;

    // ==================== 工具函数 ====================
    function loadJSON(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
    function saveLinks() { localStorage.setItem(LINKS_KEY, JSON.stringify(links)); }

    function toast(msg) {
        if (typeof window.showToastSuccess === 'function') {
            window.showToastSuccess(msg);
        }
    }

    function normalizeUrl(url) {
        url = (url || '').trim();
        if (!url) return '';
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        return url;
    }

    function getHost(url) {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch (e) {
            return url;
        }
    }

    // ==================== DOM 构建 ====================
    function el(tag, className, html) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (html !== undefined) node.innerHTML = html;
        return node;
    }

    function build() {
        if (built) return;
        built = true;

        var overlay = el('div', 'hn-overlay');
        overlay.id = 'homeNavOverlay';
        overlay.innerHTML =
            '<div class="hn-bg" id="hnBg"></div>' +
            '<div class="hn-bg-dim" id="hnBgDim"></div>' +
            '<div class="hn-topbar">' +
                '<div class="hn-brand">' +
                    '<div class="hn-brand-logo"><i class="fas fa-rocket"></i></div>' +
                    '<div class="hn-brand-text">' +
                        '<span class="hn-brand-name">PRE Launcher</span>' +
                        '<span class="hn-brand-tag">首页导航</span>' +
                    '</div>' +
                '</div>' +
                '<div class="hn-topbar-actions">' +
                    '<button class="hn-top-btn" id="hnBtnCustomize" title="自定义首页"><i class="fas fa-sliders-h"></i><span>自定义</span></button>' +
                    '<button class="hn-top-btn" id="hnBtnSettings" title="全局设置"><i class="fas fa-cog"></i><span>全局设置</span></button>' +
                    '<button class="hn-top-btn hn-top-btn-primary" id="hnBtnLauncher" title="进入启动器"><i class="fas fa-th-large"></i><span>进入启动器</span></button>' +
                '</div>' +
            '</div>' +
            '<div class="hn-main">' +
                '<div class="hn-clock" id="hnClock">' +
                    '<div class="hn-time" id="hnTime">00:00</div>' +
                    '<div class="hn-date" id="hnDate"></div>' +
                    '<div class="hn-greeting" id="hnGreeting"></div>' +
                '</div>' +
                '<div class="hn-search" id="hnSearch">' +
                    '<button class="hn-engine-btn" id="hnEngineBtn" type="button">' +
                        '<span class="hn-engine-short" id="hnEngineShort">百</span>' +
                        '<span class="hn-engine-name" id="hnEngineName">百度</span>' +
                        '<i class="fas fa-chevron-down"></i>' +
                    '</button>' +
                    '<input type="text" class="hn-search-input" id="hnSearchInput" placeholder="搜索一下" autocomplete="off">' +
                    '<button class="hn-search-submit" id="hnSearchSubmit" type="button" title="搜索"><i class="fas fa-search"></i></button>' +
                    '<div class="hn-engine-menu" id="hnEngineMenu"></div>' +
                    // 搜索建议下拉面板
                    '<div class="hn-suggest" id="hnSuggest" role="listbox">' +
                        '<div class="hn-suggest-section hn-suggest-history" id="hnSuggestHistory"></div>' +
                        '<div class="hn-suggest-divider" id="hnSuggestDivider" style="display:none"></div>' +
                        '<div class="hn-suggest-section hn-suggest-online" id="hnSuggestOnline"></div>' +
                        '<div class="hn-suggest-footer">' +
                            '<button class="hn-suggest-manage" id="hnSuggestManage" type="button">' +
                                '<i class="fas fa-history"></i><span>管理搜索历史记录</span>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="hn-links" id="hnLinks"></div>' +
            '</div>' +
            '<button class="hn-music-fab" id="hnMusicFab" type="button" title="音乐播放器"><i class="fas fa-music"></i></button>' +
            '<div class="hn-music-panel" id="hnMusicPanel">' +
                '<div class="hn-music-head">' +
                    '<div class="hn-music-title"><i class="fas fa-music"></i><span>音乐播放器</span></div>' +
                    '<button class="hn-music-close" id="hnMusicClose" type="button" title="收起"><i class="fas fa-chevron-down"></i></button>' +
                '</div>' +
                '<div class="hn-music-body" id="hnMusicBody"></div>' +
                // 8 方向 resize handles（N/S/E/W + 四角）
                '<div class="hn-resize n"  data-dir="n"></div>' +
                '<div class="hn-resize s"  data-dir="s"></div>' +
                '<div class="hn-resize e"  data-dir="e"></div>' +
                '<div class="hn-resize w"  data-dir="w"></div>' +
                '<div class="hn-resize nw" data-dir="nw"></div>' +
                '<div class="hn-resize ne" data-dir="ne"></div>' +
                '<div class="hn-resize sw" data-dir="sw"></div>' +
                '<div class="hn-resize se" data-dir="se"></div>' +
            '</div>' +
            '<div class="hn-drawer" id="hnDrawer">' +
                '<div class="hn-drawer-head">' +
                    '<div class="hn-drawer-title"><i class="fas fa-sliders-h"></i><span>自定义首页</span></div>' +
                    '<button class="hn-drawer-close" id="hnDrawerClose" type="button" title="关闭"><i class="fas fa-times"></i></button>' +
                '</div>' +
                '<div class="hn-drawer-body">' +
                    // 搜索引擎
                    '<div class="hn-sec">' +
                        '<div class="hn-sec-title"><i class="fas fa-search"></i>搜索引擎</div>' +
                        '<div class="hn-engine-list" id="hnEngineList"></div>' +
                    '</div>' +
                    // 组件显隐
                    '<div class="hn-sec">' +
                        '<div class="hn-sec-title"><i class="fas fa-layer-group"></i>组件显示</div>' +
                        '<div class="hn-switch-row" data-widget="clock"><span><i class="fas fa-clock"></i>时钟与问候</span><label class="hn-switch"><input type="checkbox" id="hnWgClock"><span class="hn-switch-slider"></span></label></div>' +
                        '<div class="hn-switch-row" data-widget="search"><span><i class="fas fa-search"></i>搜索框</span><label class="hn-switch"><input type="checkbox" id="hnWgSearch"><span class="hn-switch-slider"></span></label></div>' +
                        '<div class="hn-switch-row" data-widget="links"><span><i class="fas fa-th-large"></i>快捷链接</span><label class="hn-switch"><input type="checkbox" id="hnWgLinks"><span class="hn-switch-slider"></span></label></div>' +
                        '<div class="hn-switch-row" data-widget="music"><span><i class="fas fa-music"></i>音乐播放器</span><label class="hn-switch"><input type="checkbox" id="hnWgMusic"><span class="hn-switch-slider"></span></label></div>' +
                    '</div>' +
                    // 快捷链接管理
                    '<div class="hn-sec">' +
                        '<div class="hn-sec-title"><i class="fas fa-link"></i>快捷链接管理</div>' +
                        '<div class="hn-link-form" id="hnLinkForm">' +
                            '<input type="text" id="hnLinkName" class="hn-form-input" placeholder="链接名称" maxlength="12">' +
                            '<input type="text" id="hnLinkUrl" class="hn-form-input" placeholder="链接地址（如 example.com）">' +
                            '<div class="hn-form-buttons">' +
                                '<button class="hn-form-btn hn-form-btn-primary" id="hnLinkSave" type="button">添加</button>' +
                                '<button class="hn-form-btn" id="hnLinkCancel" type="button" style="display:none;">取消编辑</button>' +
                            '</div>' +
                        '</div>' +
                        '<div class="hn-manage-list" id="hnManageList"></div>' +
                    '</div>' +
                    // 背景设置
                    '<div class="hn-sec">' +
                        '<div class="hn-sec-title"><i class="fas fa-image"></i>背景设置</div>' +
                        '<div class="hn-bg-presets" id="hnBgPresets"></div>' +
                        '<div class="hn-bg-custom">' +
                            '<input type="text" id="hnBgUrl" class="hn-form-input" placeholder="自定义背景图片 URL">' +
                            '<div class="hn-form-buttons">' +
                                '<button class="hn-form-btn hn-form-btn-primary" id="hnBgUrlApply" type="button">应用图片</button>' +
                                '<button class="hn-form-btn" id="hnBgUploadBtn" type="button"><i class="fas fa-upload"></i>上传本地图片</button>' +
                                '<button class="hn-form-btn" id="hnBgClearBtn" type="button">清除图片</button>' +
                                '<input type="file" id="hnBgFile" accept="image/*" style="display:none;">' +
                            '</div>' +
                            '<div class="hn-slider-row"><span>遮罩暗度</span><input type="range" id="hnDimRange" min="0" max="70" step="5"><b id="hnDimVal">25%</b></div>' +
                            '<div class="hn-slider-row"><span>背景模糊</span><input type="range" id="hnBlurRange" min="0" max="20" step="1"><b id="hnBlurVal">0px</b></div>' +
                        '</div>' +
                    '</div>' +
                    // 恢复默认
                    '<div class="hn-sec">' +
                        '<button class="hn-reset-btn" id="hnResetBtn" type="button"><i class="fas fa-rotate-left"></i>恢复全部默认设置</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // 搜索历史管理弹窗 & 二次确认弹窗 —— 直接挂到 body，用 position: fixed 覆盖全屏
        var modalMaskHTML = [
            // 搜索历史管理弹窗
            '<div class="hn-modal-mask" id="hnHistoryModal">' +
                '<div class="hn-modal hn-history-modal">' +
                    '<div class="hn-modal-head">' +
                        '<div class="hn-modal-title"><i class="fas fa-history"></i><span>搜索历史</span></div>' +
                        '<button class="hn-modal-close" data-close="hnHistoryModal" type="button"><i class="fas fa-times"></i></button>' +
                    '</div>' +
                    '<div class="hn-modal-body">' +
                        '<div class="hn-history-toolbar">' +
                            '<div class="hn-history-filter" id="hnHistoryFilter">' +
                                '<button type="button" data-range="all" class="active">全部</button>' +
                                '<button type="button" data-range="month">近一个月</button>' +
                                '<button type="button" data-range="week">近一周</button>' +
                                '<button type="button" data-range="day">近一天</button>' +
                            '</div>' +
                            '<button class="hn-history-clear" id="hnHistoryClear" type="button"><i class="fas fa-trash-alt"></i>一键清除</button>' +
                        '</div>' +
                        '<div class="hn-history-list" id="hnHistoryList"></div>' +
                    '</div>' +
                '</div>' +
            '</div>',
            // 二次确认弹窗
            '<div class="hn-modal-mask" id="hnConfirmModal">' +
                '<div class="hn-modal hn-confirm-modal">' +
                    '<div class="hn-modal-head">' +
                        '<div class="hn-modal-title"><i class="fas fa-exclamation-triangle"></i><span id="hnConfirmTitle">提示</span></div>' +
                        '<button class="hn-modal-close" data-close="hnConfirmModal" type="button"><i class="fas fa-times"></i></button>' +
                    '</div>' +
                    '<div class="hn-modal-body">' +
                        '<p class="hn-confirm-msg" id="hnConfirmMsg">确定要执行此操作吗？</p>' +
                    '</div>' +
                    '<div class="hn-modal-foot">' +
                        '<button class="hn-btn-cancel" id="hnConfirmCancel" type="button">取消</button>' +
                        '<button class="hn-btn-danger" id="hnConfirmOk" type="button">确定</button>' +
                    '</div>' +
                '</div>' +
            '</div>'
        ].join('');
        var modalWrap = document.createElement('div');
        modalWrap.innerHTML = modalMaskHTML;
        while (modalWrap.firstChild) document.body.appendChild(modalWrap.firstChild);

        // 右下角「返回首页导航」悬浮按钮（进入启动器后显示）
        var returnBtn = el('button', 'hn-return-btn');
        returnBtn.id = 'homeNavReturnBtn';
        returnBtn.title = '返回首页导航';
        returnBtn.innerHTML = '<i class="fas fa-house"></i><span>首页导航</span>';
        returnBtn.style.display = 'none';
        document.body.appendChild(returnBtn);

        bindEvents();
        bindWindowing();
        renderEngines();
        renderEngineMenu();
        renderLinks();
        renderManageList();
        renderBgPresets();
        syncControlsToSettings();
        applyBackground();
        applyWidgets();
    }

    // ==================== 渲染 ====================
    function renderEngines() {
        var list = document.getElementById('hnEngineList');
        if (!list) return;
        var html = '';
        Object.keys(SEARCH_ENGINES).forEach(function (key) {
            var eng = SEARCH_ENGINES[key];
            html += '<button class="hn-engine-item' + (key === settings.engine ? ' active' : '') + '" data-engine="' + key + '" type="button">' +
                '<span class="hn-engine-short">' + eng.short + '</span>' +
                '<span class="hn-engine-item-name">' + eng.name + '</span>' +
                '<span class="hn-engine-check"><i class="fas fa-check"></i></span>' +
            '</button>';
        });
        list.innerHTML = html;
    }

    function renderEngineMenu() {
        var menu = document.getElementById('hnEngineMenu');
        if (!menu) return;
        var html = '';
        Object.keys(SEARCH_ENGINES).forEach(function (key) {
            var eng = SEARCH_ENGINES[key];
            html += '<div class="hn-engine-menu-item' + (key === settings.engine ? ' active' : '') + '" data-engine="' + key + '">' +
                '<span class="hn-engine-short">' + eng.short + '</span>' +
                '<span>' + eng.name + '</span>' +
            '</div>';
        });
        menu.innerHTML = html;
    }

    function syncEngineUI() {
        var eng = SEARCH_ENGINES[settings.engine] || SEARCH_ENGINES.baidu;
        var shortEl = document.getElementById('hnEngineShort');
        var nameEl = document.getElementById('hnEngineName');
        if (shortEl) shortEl.textContent = eng.short;
        if (nameEl) nameEl.textContent = eng.name;
    }

    function renderLinks() {
        var wrap = document.getElementById('hnLinks');
        if (!wrap) return;
        var html = '';
        links.forEach(function (link, index) {
            var color = LINK_COLORS[index % LINK_COLORS.length];
            var firstChar = (link.name || '?').trim().charAt(0).toUpperCase() || '?';
            html += '<div class="hn-link-card" draggable="true" data-index="' + index + '" title="' + escapeAttr(link.url) + '">' +
                '<div class="hn-link-icon" style="background:' + color + '">' + escapeHtml(firstChar) + '</div>' +
                '<div class="hn-link-name">' + escapeHtml(link.name) + '</div>' +
                '<div class="hn-link-host">' + escapeHtml(getHost(link.url)) + '</div>' +
            '</div>';
        });
        html += '<div class="hn-link-card hn-link-add" id="hnLinkAdd" title="添加快捷链接">' +
            '<div class="hn-link-add-icon"><i class="fas fa-plus"></i></div>' +
            '<div class="hn-link-name">添加链接</div>' +
        '</div>';
        wrap.innerHTML = html;

        // 卡片事件
        wrap.querySelectorAll('.hn-link-card:not(.hn-link-add)').forEach(function (card) {
            card.addEventListener('click', function () {
                var idx = parseInt(card.getAttribute('data-index'), 10);
                if (links[idx]) window.open(links[idx].url, '_blank');
            });
            card.addEventListener('dragstart', function (e) {
                dragIndex = parseInt(card.getAttribute('data-index'), 10);
                card.classList.add('dragging');
                try { e.dataTransfer.setData('text/plain', String(dragIndex)); } catch (err) { }
            });
            card.addEventListener('dragend', function () {
                card.classList.remove('dragging');
            });
            card.addEventListener('dragover', function (e) {
                e.preventDefault();
                var idx = parseInt(card.getAttribute('data-index'), 10);
                if (idx !== dragIndex && dragIndex > -1) {
                    var moved = links.splice(dragIndex, 1)[0];
                    links.splice(idx, 0, moved);
                    dragIndex = idx;
                    saveLinks();
                    renderLinks();
                    renderManageList();
                }
            });
        });

        var addCard = document.getElementById('hnLinkAdd');
        if (addCard) {
            addCard.addEventListener('click', function () {
                openDrawer();
                startLinkForm(-1);
            });
        }
    }

    function renderManageList() {
        var list = document.getElementById('hnManageList');
        if (!list) return;
        if (links.length === 0) {
            list.innerHTML = '<div class="hn-manage-empty">暂无快捷链接，点击下方按钮添加</div>';
            return;
        }
        var html = '';
        links.forEach(function (link, index) {
            var color = LINK_COLORS[index % LINK_COLORS.length];
            var firstChar = (link.name || '?').trim().charAt(0).toUpperCase() || '?';
            html += '<div class="hn-manage-item" data-index="' + index + '">' +
                '<span class="hn-manage-icon" style="background:' + color + '">' + escapeHtml(firstChar) + '</span>' +
                '<span class="hn-manage-info"><b>' + escapeHtml(link.name) + '</b><i>' + escapeHtml(link.url) + '</i></span>' +
                '<span class="hn-manage-actions">' +
                    '<button class="hn-manage-btn" data-act="up" title="前移"' + (index === 0 ? ' disabled' : '') + '><i class="fas fa-arrow-left"></i></button>' +
                    '<button class="hn-manage-btn" data-act="down" title="后移"' + (index === links.length - 1 ? ' disabled' : '') + '><i class="fas fa-arrow-right"></i></button>' +
                    '<button class="hn-manage-btn" data-act="edit" title="编辑"><i class="fas fa-pen"></i></button>' +
                    '<button class="hn-manage-btn hn-manage-btn-danger" data-act="del" title="删除"><i class="fas fa-trash"></i></button>' +
                '</span>' +
            '</div>';
        });
        list.innerHTML = html;
    }

    function renderBgPresets() {
        var wrap = document.getElementById('hnBgPresets');
        if (!wrap) return;
        var html = '';
        BG_PRESETS.forEach(function (preset) {
            html += '<button class="hn-bg-preset' + (settings.bg.preset === preset.id && !currentBgImage ? ' active' : '') + '" data-preset="' + preset.id + '" type="button" title="' + preset.name + '" style="background:' + preset.css + '"></button>';
        });
        wrap.innerHTML = html;
    }

    // ==================== 背景应用 ====================
    function applyBackground() {
        var bg = document.getElementById('hnBg');
        var dim = document.getElementById('hnBgDim');
        if (!bg) return;

        var preset = null;
        BG_PRESETS.forEach(function (p) { if (p.id === settings.bg.preset) preset = p; });
        if (!preset) preset = BG_PRESETS[0];

        if (currentBgImage) {
            bg.style.backgroundImage = 'url("' + currentBgImage.replace(/"/g, '\\"') + '")';
        } else {
            bg.style.backgroundImage = preset.css;
        }
        bg.style.filter = settings.bg.blur > 0 ? 'blur(' + settings.bg.blur + 'px)' : 'none';

        if (dim) dim.style.opacity = (settings.bg.dim / 100).toFixed(2);

        // 预设选中态
        document.querySelectorAll('#hnBgPresets .hn-bg-preset').forEach(function (btn) {
            btn.classList.toggle('active', !currentBgImage && btn.getAttribute('data-preset') === settings.bg.preset);
        });
    }

    // ==================== 组件显隐 ====================
    function applyWidgets() {
        var clock = document.getElementById('hnClock');
        var search = document.getElementById('hnSearch');
        var linkswrap = document.getElementById('hnLinks');
        var fab = document.getElementById('hnMusicFab');
        var panel = document.getElementById('hnMusicPanel');

        if (clock) clock.style.display = settings.widgets.clock ? '' : 'none';
        if (search) search.style.display = settings.widgets.search ? '' : 'none';
        if (linkswrap) linkswrap.style.display = settings.widgets.links ? '' : 'none';

        if (!settings.widgets.music) {
            if (fab) fab.style.display = 'none';
            if (panel) panel.classList.remove('open');
            // 隐藏首页独立容器
            var area = document.getElementById(HN_STK_ID);
            if (area) area.style.display = 'none';
        } else if (fab && !panelOpen()) {
            fab.style.display = '';
        }
    }

    // ==================== 时钟 ====================
    function startClock() {
        if (clockTimer) return;
        var update = function () {
            if (!visible) return;
            var timeEl = document.getElementById('hnTime');
            var dateEl = document.getElementById('hnDate');
            var greetEl = document.getElementById('hnGreeting');
            if (!timeEl) return;
            var now = new Date();
            var h = String(now.getHours()).padStart(2, '0');
            var m = String(now.getMinutes()).padStart(2, '0');
            var s = String(now.getSeconds()).padStart(2, '0');
            timeEl.textContent = h + ':' + m + ':' + s;
            if (dateEl) {
                var weekMap = ['日', '一', '二', '三', '四', '五', '六'];
                dateEl.textContent = now.getFullYear() + ' 年 ' + (now.getMonth() + 1) + ' 月 ' + now.getDate() + ' 日 · 星期' + weekMap[now.getDay()];
            }
            if (greetEl) {
                var hour = now.getHours();
                var greet = '夜深了，注意休息';
                if (hour >= 5 && hour < 8) greet = '清晨好，新的一天开始了';
                else if (hour >= 8 && hour < 11) greet = '上午好，精力充沛';
                else if (hour >= 11 && hour < 13) greet = '中午好，记得吃午饭';
                else if (hour >= 13 && hour < 17) greet = '下午好，保持专注';
                else if (hour >= 17 && hour < 19) greet = '傍晚好，享受黄昏';
                else if (hour >= 19 && hour < 23) greet = '晚上好，放松一下';
                greetEl.textContent = greet;
            }
        };
        clockTimer = setInterval(update, 1000);
        update();
    }

    // ==================== 搜索 ====================
    function doSearch() {
        var input = document.getElementById('hnSearchInput');
        if (!input) return;
        var query = input.value.trim();
        if (!query) {
            input.focus();
            return;
        }
        var eng = SEARCH_ENGINES[settings.engine] || SEARCH_ENGINES.baidu;
        // 记录历史（只有非纯 URL 的才记，纯网址走 normalizeUrl 也记一下但去掉尾部斜杠）
        saveSearchHistory(query);
        hideSuggestions();
        // 输入内容为网址格式时直接打开对应网站
        if (/^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(query)) {
            window.open(normalizeUrl(query), '_blank');
            return;
        }
        window.open(eng.url + encodeURIComponent(query), '_blank');
    }

    // ==================== 搜索历史工具 ====================
    // 历史项结构：{ q: "查询词", t: timestamp }
    function loadSearchHistory() {
        try {
            var raw = localStorage.getItem(HISTORY_KEY);
            if (!raw) return [];
            var arr = JSON.parse(raw);
            if (!Array.isArray(arr)) return [];
            return arr;
        } catch (e) { return []; }
    }
    function saveSearchHistory(query) {
        query = (query || '').trim();
        if (!query) return;
        var list = loadSearchHistory();
        var now = Date.now();
        // 去重：相同查询词去重后把旧的删掉
        list = list.filter(function (h) { return h.q !== query; });
        list.unshift({ q: query, t: now });
        if (list.length > HISTORY_MAX) list = list.slice(0, HISTORY_MAX);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (e) {}
    }
    function clearSearchHistory() {
        try { localStorage.removeItem(HISTORY_KEY); } catch (e) {}
    }
    function deleteSearchItem(query) {
        var list = loadSearchHistory();
        list = list.filter(function (h) { return h.q !== query; });
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (e) {}
    }
    // 按时间段过滤：'day' | 'week' | 'month' | 'all'
    function filterHistoryByTime(range, list) {
        var now = Date.now();
        var cutoff = 0;
        if (range === 'day') cutoff = now - 24 * 60 * 60 * 1000;
        else if (range === 'week') cutoff = now - 7 * 24 * 60 * 60 * 1000;
        else if (range === 'month') cutoff = now - 30 * 24 * 60 * 60 * 1000;
        return (list || loadSearchHistory()).filter(function (h) { return h.t >= cutoff; });
    }
    function formatTimeAgo(ts) {
        var diff = (Date.now() - ts) / 1000;
        if (diff < 60) return '刚刚';
        if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';
        if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前';
        if (diff < 7 * 86400) return Math.floor(diff / 86400) + ' 天前';
        var d = new Date(ts);
        return (d.getMonth() + 1) + '-' + d.getDate();
    }

    // ==================== 搜索建议面板 ====================
    var SUGGEST_SOURCE_HISTORY = 1;
    var SUGGEST_SOURCE_ONLINE = 2;
    var _suggestHighlightIdx = -1;   // 键盘导航高亮索引
    var _suggestActiveList = [];      // 当前渲染的建议项（供键盘导航）
    var _onlineDebounceTimer = null;
    var _onlineAbortController = null;

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function highlightMatch(text, query) {
        if (!query) return escapeHtml(text);
        var escQ = escapeHtml(query);
        var escT = escapeHtml(text);
        // 简单不区分大小写替换
        try {
            var safeQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return escT.replace(new RegExp('(' + safeQ + ')', 'gi'), '<b>$1</b>');
        } catch (e) { return escT; }
    }

    function hideSuggestions() {
        var p = document.getElementById('hnSuggest');
        if (p) p.classList.remove('show');
        _suggestHighlightIdx = -1;
        _suggestActiveList = [];
    }

    // 打开面板：history 必须是数组；online 如果为 null 表示"请求中/暂不显示"
    function showSuggestions(historyItems, onlineItems, query) {
        var panel = document.getElementById('hnSuggest');
        if (!panel) return;
        var histBox = document.getElementById('hnSuggestHistory');
        var onlBox = document.getElementById('hnSuggestOnline');
        var divider = document.getElementById('hnSuggestDivider');

        _suggestActiveList = [];

        // 历史
        if (historyItems && historyItems.length) {
            var html = historyItems.map(function (h) {
                var tpl = '<div class="hn-suggest-item hn-suggest-hist" ' +
                          'data-q="' + escapeHtml(h.q) + '" data-src="' + SUGGEST_SOURCE_HISTORY + '">' +
                          '<i class="fas fa-history"></i>' +
                          '<span class="hn-suggest-text">' + highlightMatch(h.q, query) + '</span>' +
                          '<button class="hn-suggest-del" type="button" data-del="' + escapeHtml(h.q) + '" title="删除"><i class="fas fa-times"></i></button>' +
                          '</div>';
                _suggestActiveList.push({ q: h.q, src: SUGGEST_SOURCE_HISTORY, el: histBox ? null : null });
                return tpl;
            }).join('');
            histBox.innerHTML = html;
            histBox.style.display = '';
        } else {
            histBox.innerHTML = '';
            histBox.style.display = 'none';
        }

        // 联网联想
        if (onlineItems && onlineItems.length) {
            var ohtml = onlineItems.map(function (s) {
                var tpl = '<div class="hn-suggest-item hn-suggest-online-item" ' +
                          'data-q="' + escapeHtml(s) + '" data-src="' + SUGGEST_SOURCE_ONLINE + '">' +
                          '<i class="fas fa-search"></i>' +
                          '<span class="hn-suggest-text">' + highlightMatch(s, query) + '</span>' +
                          '</div>';
                _suggestActiveList.push({ q: s, src: SUGGEST_SOURCE_ONLINE });
                return tpl;
            }).join('');
            onlBox.innerHTML = ohtml;
            onlBox.style.display = '';
        } else {
            onlBox.innerHTML = '';
            onlBox.style.display = 'none';
        }

        // 分隔线
        if ((historyItems && historyItems.length) && (onlineItems && onlineItems.length)) {
            divider.style.display = '';
        } else {
            divider.style.display = 'none';
        }

        // 至少有历史记录或正在输入，才显示面板
        if ((historyItems && historyItems.length) || (query && query.trim())) {
            panel.classList.add('show');
        } else {
            panel.classList.remove('show');
        }
        _suggestHighlightIdx = -1;
    }

    // 入口：根据当前输入框内容渲染建议
    function renderSuggestions() {
        var input = document.getElementById('hnSearchInput');
        if (!input) return;
        var query = input.value.trim();

        // 1) 历史条目（按 query 过滤，取前 SUGGEST_HISTORY_SHOW 条）
        var hist = loadSearchHistory();
        var filtered = hist;
        if (query) {
            filtered = hist.filter(function (h) {
                return h.q.toLowerCase().indexOf(query.toLowerCase()) !== -1;
            });
        }
        filtered = filtered.slice(0, SUGGEST_HISTORY_SHOW);

        // 2) 联网联想（输入 1 个字符以上时触发，加 debounce）
        if (_onlineDebounceTimer) clearTimeout(_onlineDebounceTimer);
        if (query.length >= 1) {
            _onlineDebounceTimer = setTimeout(function () {
                fetchOnlineSuggestions(query).then(function (list) {
                    // 再过滤掉已经在历史里出现过的
                    var onlineOnly = (list || []).filter(function (s) {
                        return filtered.indexOf(s) === -1 &&
                               filtered.every(function (h) { return h.q !== s; });
                    }).slice(0, ONLINE_SUGGEST_MAX);
                    showSuggestions(filtered, onlineOnly, query);
                });
            }, 220);
            // 先只渲染历史，等联网结果回来再更新
            showSuggestions(filtered, null, query);
        } else {
            // 无 query 时只显示历史
            showSuggestions(filtered, [], query);
        }
    }

    // 必应 Suggestions API（JSONP 跨域）
    function fetchOnlineSuggestions(query) {
        return new Promise(function (resolve) {
            if (!query) { resolve([]); return; }
            // 用必应的公共联想接口（JSONP）
            var cbName = '__hnBingCb_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            var script = document.createElement('script');
            var timeout = setTimeout(function () {
                if (script.parentNode) script.parentNode.removeChild(script);
                delete window[cbName];
                resolve([]);
            }, 2500);
            window[cbName] = function (data) {
                clearTimeout(timeout);
                if (script.parentNode) script.parentNode.removeChild(script);
                delete window[cbName];
                var arr = [];
                try { arr = (data && data[1]) || []; } catch (e) { arr = []; }
                resolve(arr.slice(0, ONLINE_SUGGEST_MAX));
            };
            // 必应 ac.js 接口
            script.src = 'https://www.bing.com/AC?q=' + encodeURIComponent(query) +
                         '&mkt=zh-CN&setlang=zh-CN&jsonp=' + cbName;
            script.onerror = function () {
                clearTimeout(timeout);
                if (script.parentNode) script.parentNode.removeChild(script);
                delete window[cbName];
                resolve([]);
            };
            document.body.appendChild(script);
        });
    }

    // 键盘导航高亮（↑ ↓ Enter Esc）
    function suggestKeydownHandler(e) {
        var panel = document.getElementById('hnSuggest');
        if (!panel || !panel.classList.contains('show')) return;
        var items = panel.querySelectorAll('.hn-suggest-item');
        var count = items.length;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            _suggestHighlightIdx = (_suggestHighlightIdx + 1) % count;
            updateSuggestHighlight(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            _suggestHighlightIdx = (_suggestHighlightIdx - 1 + count) % count;
            updateSuggestHighlight(items);
        } else if (e.key === 'Enter') {
            if (_suggestHighlightIdx >= 0 && _suggestHighlightIdx < count) {
                e.preventDefault();
                items[_suggestHighlightIdx].click();
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
            document.getElementById('hnSearchInput').blur();
        }
    }
    function updateSuggestHighlight(items) {
        for (var i = 0; i < items.length; i++) {
            items[i].classList.toggle('active', i === _suggestHighlightIdx);
        }
    }

    // 点击建议项
    function onSuggestItemClick(q) {
        var input = document.getElementById('hnSearchInput');
        input.value = q;
        hideSuggestions();
        doSearch();
    }

    // 删除单条历史
    function onSuggestItemDel(q, itemEl) {
        deleteSearchItem(q);
        // 实时从面板移除
        if (itemEl && itemEl.parentNode) {
            itemEl.parentNode.removeChild(itemEl);
        }
        // 重新判断是否需要整个重渲染（避免历史区变空时分隔线/Footer 异常）
        setTimeout(renderSuggestions, 0);
    }

    // ==================== 历史管理弹窗 ====================
    var _historyFilterRange = 'all';
    function openHistoryModal() {
        var m = document.getElementById('hnHistoryModal');
        if (!m) return;
        _historyFilterRange = 'all';
        // 重置 filter 按钮高亮
        var filterBtns = document.querySelectorAll('#hnHistoryFilter button');
        filterBtns.forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-range') === 'all');
        });
        renderHistoryModal();
        m.classList.add('show');
    }
    function closeHistoryModal() {
        var m = document.getElementById('hnHistoryModal');
        if (m) m.classList.remove('show');
    }
    function renderHistoryModal() {
        var listBox = document.getElementById('hnHistoryList');
        if (!listBox) return;
        var list = filterHistoryByTime(_historyFilterRange);
        if (!list.length) {
            listBox.innerHTML = '<div class="hn-history-empty"><i class="fas fa-inbox"></i><span>暂无历史记录</span></div>';
            return;
        }
        // 按日期分组
        var grouped = {};
        list.forEach(function (h) {
            var d = new Date(h.t);
            var key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(h);
        });
        var html = '';
        Object.keys(grouped).sort(function (a, b) { return b.localeCompare(a); }).forEach(function (k) {
            var items = grouped[k];
            html += '<div class="hn-history-group"><div class="hn-history-date">' + k + '</div>';
            items.forEach(function (h) {
                html += '<div class="hn-history-row">' +
                    '<span class="hn-history-time">' + formatTimeAgo(h.t) + '</span>' +
                    '<span class="hn-history-q" title="' + escapeHtml(h.q) + '">' + escapeHtml(h.q) + '</span>' +
                    '<button class="hn-history-del" type="button" data-del="' + escapeHtml(h.q) + '" title="删除"><i class="fas fa-times"></i></button>' +
                    '</div>';
            });
            html += '</div>';
        });
        listBox.innerHTML = html;
    }

    // ==================== 二次确认弹窗 ====================
    var _confirmCallback = null;
    function openConfirmModal(title, msg, okText, cancelText, callback) {
        var m = document.getElementById('hnConfirmModal');
        if (!m) return;
        document.getElementById('hnConfirmTitle').textContent = title || '提示';
        document.getElementById('hnConfirmMsg').innerHTML = msg || '';
        document.getElementById('hnConfirmOk').textContent = okText || '确定';
        document.getElementById('hnConfirmCancel').textContent = cancelText || '取消';
        _confirmCallback = callback;
        m.classList.add('show');
    }
    function closeConfirmModal() {
        var m = document.getElementById('hnConfirmModal');
        if (m) m.classList.remove('show');
        _confirmCallback = null;
    }

    // ==================== 快捷链接表单 ====================
    function startLinkForm(index) {
        editingLinkIndex = index;
        var nameInput = document.getElementById('hnLinkName');
        var urlInput = document.getElementById('hnLinkUrl');
        var saveBtn = document.getElementById('hnLinkSave');
        var cancelBtn = document.getElementById('hnLinkCancel');
        if (!nameInput) return;
        if (index > -1 && links[index]) {
            nameInput.value = links[index].name;
            urlInput.value = links[index].url;
            saveBtn.textContent = '保存修改';
            if (cancelBtn) cancelBtn.style.display = '';
        } else {
            nameInput.value = '';
            urlInput.value = '';
            saveBtn.textContent = '添加';
            if (cancelBtn) cancelBtn.style.display = 'none';
        }
        nameInput.focus();
    }

    function saveLinkForm() {
        var nameInput = document.getElementById('hnLinkName');
        var urlInput = document.getElementById('hnLinkUrl');
        if (!nameInput || !urlInput) return;
        var name = nameInput.value.trim();
        var url = normalizeUrl(urlInput.value);
        if (!name || !url) {
            toast('请填写链接名称和地址');
            return;
        }
        if (editingLinkIndex > -1 && links[editingLinkIndex]) {
            links[editingLinkIndex] = { name: name, url: url };
            toast('快捷链接已更新');
        } else {
            links.push({ name: name, url: url });
            toast('快捷链接已添加');
        }
        saveLinks();
        renderLinks();
        renderManageList();
        startLinkForm(-1);
    }

    // ==================== 音乐播放器 ====================
    // 首页导航使用独立容器 hnSoundtrackArea，与游戏中心的 soundtrackArea 完全隔离
    var HN_STK_ID = 'hnSoundtrackArea';

    function panelOpen() {
        var panel = document.getElementById('hnMusicPanel');
        return !!(panel && panel.classList.contains('open'));
    }

    // 确保首页独立的音乐播放器容器存在于 hnMusicBody 内
    function ensureHNContainer() {
        var body = document.getElementById('hnMusicBody');
        if (!body) return null;

        var area = document.getElementById(HN_STK_ID);
        if (area && area.parentNode === body) return area;

        // 如果 area 已存在但挂在别处（比如上次 hide 时被留在了 body 上），搬回来
        if (area) {
            body.appendChild(area);
            return area;
        }

        // 创建新容器
        area = document.createElement('div');
        area.id = HN_STK_ID;
        area.className = 'soundtrack-area';
        area.style.display = 'none';
        body.appendChild(area);
        return area;
    }

    function openMusicPanel() {
        if (!settings.widgets.music) return;
        var panel = document.getElementById('hnMusicPanel');
        var fab = document.getElementById('hnMusicFab');
        if (!panel) return;

        var area = ensureHNContainer();
        if (!area) return;

        area.style.display = 'block';

        // 让 soundtrack.js 初始化或迁移到首页容器
        if (typeof window.initSoundtrackPlayer === 'function') {
            window.initSoundtrackPlayer(HN_STK_ID);
        }

        panel.classList.add('open');
        if (fab) fab.style.display = 'none';
    }

    function closeMusicPanel() {
        var panel = document.getElementById('hnMusicPanel');
        var fab = document.getElementById('hnMusicFab');
        if (panel) panel.classList.remove('open');
        if (fab && settings.widgets.music) fab.style.display = '';

        // 隐藏首页独立容器 → miniBar 的轮询检测到不可见 → miniBar 会自动显示
        var area = document.getElementById(HN_STK_ID);
        if (area) area.style.display = 'none';
    }

    // ==================== 音乐面板：可拖拽 + 8 向缩放 + 持久化 ====================
    var HN_MUSIC_STATE_KEY = 'hnMusicPanelState';
    var HN_MUSIC_MIN_W = 720;
    var HN_MUSIC_MIN_H = 500;
    var HN_MUSIC_DEFAULT = { w: 1120, h: 700 };

    // 拖拽/缩放时的临时状态
    var _dragState = null;  // { startX, startY, origLeft, origTop }
    var _resizeState = null; // { dir, startX, startY, origX, origY, origW, origH }

    function loadPanelState() {
        try {
            var raw = localStorage.getItem(HN_MUSIC_STATE_KEY);
            if (!raw) return null;
            var s = JSON.parse(raw);
            if (typeof s.x === 'number' && typeof s.y === 'number' &&
                typeof s.w === 'number' && typeof s.h === 'number') {
                return s;
            }
        } catch (e) {}
        return null;
    }

    function savePanelState() {
        var panel = document.getElementById('hnMusicPanel');
        if (!panel) return;
        var r = panel.getBoundingClientRect();
        try {
            localStorage.setItem(HN_MUSIC_STATE_KEY, JSON.stringify({
                x: Math.round(r.left),
                y: Math.round(r.top),
                w: Math.round(r.width),
                h: Math.round(r.height)
            }));
        } catch (e) {}
    }

    // 应用已保存的位置和尺寸；如果从未保存过则先不 windowed，保持居中
    function applyPanelState() {
        var panel = document.getElementById('hnMusicPanel');
        var state = loadPanelState();
        if (!state) return;

        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var cx = state.w / 2;
        var cy = state.h / 2;

        // 边界保护：如果保存的位置超出视口范围，重置到默认位置
        if (state.x + state.w < 20 || state.y + state.h < 20 ||
            state.x > vw - 20 || state.y > vh - 20 ||
            state.w > vw || state.h > vh) {
            localStorage.removeItem(HN_MUSIC_STATE_KEY);
            return;
        }

        panel.classList.add('windowed');
        panel.style.left = (state.x + cx) + 'px';
        panel.style.top = (state.y + cy) + 'px';
        panel.style.width = state.w + 'px';
        panel.style.height = state.h + 'px';
        panel.style.transform = 'translate(-50%, -50%)';
    }

    function resetPanelState() {
        var panel = document.getElementById('hnMusicPanel');
        if (!panel) return;
        localStorage.removeItem(HN_MUSIC_STATE_KEY);
        panel.classList.remove('windowed');
        panel.style.left = '';
        panel.style.top = '';
        panel.style.width = '';
        panel.style.height = '';
        panel.style.transform = '';
    }

    // —— 拖拽：整个 header 作为手柄 ——
    function startDrag(e) {
        var panel = document.getElementById('hnMusicPanel');
        if (!panel) return;
        // 如果还没 windowed，先进入 windowed 模式（用当前位置做锚点）
        if (!panel.classList.contains('windowed')) {
            var r = panel.getBoundingClientRect();
            panel.classList.add('windowed');
            panel.style.left = (r.left + r.width / 2) + 'px';
            panel.style.top = (r.top + r.height / 2) + 'px';
            panel.style.width = r.width + 'px';
            panel.style.height = r.height + 'px';
            panel.style.transform = 'translate(-50%, -50%)';
        }
        var rect = panel.getBoundingClientRect();
        _dragState = {
            startX: e.clientX,
            startY: e.clientY,
            origLeft: rect.left,
            origTop: rect.top,
            w: rect.width,
            h: rect.height
        };
        panel.classList.add('dragging');
        e.preventDefault();
    }

    function doDrag(e) {
        if (!_dragState) return;
        var panel = document.getElementById('hnMusicPanel');
        var dx = e.clientX - _dragState.startX;
        var dy = e.clientY - _dragState.startY;
        var nx = _dragState.origLeft + dx;
        var ny = _dragState.origTop + dy;
        // 把 left/top 设为中心点（因为 transform: translate(-50%, -50%)）
        panel.style.left = (nx + _dragState.w / 2) + 'px';
        panel.style.top = (ny + _dragState.h / 2) + 'px';
    }

    function endDrag() {
        if (!_dragState) return;
        var panel = document.getElementById('hnMusicPanel');
        if (panel) panel.classList.remove('dragging');
        _dragState = null;
        savePanelState();
    }

    // —— 8 向 resize ——
    function startResize(dir, e) {
        var panel = document.getElementById('hnMusicPanel');
        if (!panel) return;
        // 确保已 windowed
        if (!panel.classList.contains('windowed')) {
            var rr = panel.getBoundingClientRect();
            panel.classList.add('windowed');
            panel.style.left = (rr.left + rr.width / 2) + 'px';
            panel.style.top = (rr.top + rr.height / 2) + 'px';
            panel.style.width = rr.width + 'px';
            panel.style.height = rr.height + 'px';
            panel.style.transform = 'translate(-50%, -50%)';
        }
        var rect = panel.getBoundingClientRect();
        _resizeState = {
            dir: dir,
            startX: e.clientX,
            startY: e.clientY,
            origX: rect.left,
            origY: rect.top,
            origW: rect.width,
            origH: rect.height
        };
        panel.classList.add('resizing');
        e.preventDefault();
    }

    function doResize(e) {
        if (!_resizeState) return;
        var panel = document.getElementById('hnMusicPanel');
        var s = _resizeState;
        var dx = e.clientX - s.startX;
        var dy = e.clientY - s.startY;
        var nx = s.origX, ny = s.origY, nw = s.origW, nh = s.origH;

        if (s.dir.indexOf('e') !== -1) nw = s.origW + dx;
        if (s.dir.indexOf('w') !== -1) { nw = s.origW - dx; nx = s.origX + dx; }
        if (s.dir.indexOf('s') !== -1) nh = s.origH + dy;
        if (s.dir.indexOf('n') !== -1) { nh = s.origH - dy; ny = s.origY + dy; }

        // 最小尺寸保护
        if (nw < HN_MUSIC_MIN_W) {
            if (s.dir.indexOf('w') !== -1) nx = s.origX + s.origW - HN_MUSIC_MIN_W;
            nw = HN_MUSIC_MIN_W;
        }
        if (nh < HN_MUSIC_MIN_H) {
            if (s.dir.indexOf('n') !== -1) ny = s.origY + s.origH - HN_MUSIC_MIN_H;
            nh = HN_MUSIC_MIN_H;
        }

        panel.style.left = (nx + nw / 2) + 'px';
        panel.style.top = (ny + nh / 2) + 'px';
        panel.style.width = nw + 'px';
        panel.style.height = nh + 'px';
    }

    function endResize() {
        if (!_resizeState) return;
        var panel = document.getElementById('hnMusicPanel');
        if (panel) panel.classList.remove('resizing');
        _resizeState = null;
        savePanelState();
    }

    // 在 build 之后绑定所有拖拽/resize 事件
    function bindWindowing() {
        var panel = document.getElementById('hnMusicPanel');
        if (!panel) return;
        var head = panel.querySelector('.hn-music-head');
        if (!head) return;

        // 拖拽：用 pointerdown 让 touch 也能用
        head.addEventListener('pointerdown', function (e) {
            // 按钮或子元素上按下不触发拖拽
            var tag = e.target && e.target.tagName;
            if (tag === 'BUTTON' || e.target.closest('button')) return;
            startDrag(e);
        });

        // 8 向 resize handles
        panel.querySelectorAll('.hn-resize').forEach(function (handle) {
            handle.addEventListener('pointerdown', function (e) {
                startResize(handle.getAttribute('data-dir'), e);
            });
        });

        // 全局 pointer 事件（拖拽/resize 中跟随）
        document.addEventListener('pointermove', function (e) {
            if (_resizeState) return doResize(e);
            if (_dragState) return doDrag(e);
        });
        document.addEventListener('pointerup', function () {
            if (_resizeState) return endResize();
            if (_dragState) return endDrag();
        });
        document.addEventListener('pointercancel', function () {
            if (_resizeState) return endResize();
            if (_dragState) return endDrag();
        });

        // 窗口尺寸变化时，确保面板仍在可视范围内
        window.addEventListener('resize', function () {
            if (!panel.classList.contains('windowed')) return;
            var r = panel.getBoundingClientRect();
            var vw = window.innerWidth, vh = window.innerHeight;
            var fixed = false;
            var nx = r.left, ny = r.top, nw = r.width, nh = r.height;
            if (nx < 0) { nx = 0; fixed = true; }
            if (ny < 0) { ny = 0; fixed = true; }
            if (nx + nw > vw) { nx = Math.max(0, vw - nw); fixed = true; }
            if (ny + nh > vh) { ny = Math.max(0, vh - nh); fixed = true; }
            if (fixed) {
                panel.style.left = (nx + nw / 2) + 'px';
                panel.style.top = (ny + nh / 2) + 'px';
            }
        });

        // 恢复之前保存的位置/尺寸
        applyPanelState();
    }

    // ==================== 抽屉 ====================
    function openDrawer() {
        var drawer = document.getElementById('hnDrawer');
        if (drawer) drawer.classList.add('open');
    }

    function closeDrawer() {
        var drawer = document.getElementById('hnDrawer');
        if (drawer) drawer.classList.remove('open');
    }

    // ==================== 事件绑定 ====================
    function bindEvents() {
        // 顶栏按钮
        document.getElementById('hnBtnLauncher').addEventListener('click', function () { hide(); });
        document.getElementById('hnBtnCustomize').addEventListener('click', function () {
            closeDrawer();
            setTimeout(openDrawer, 10);
        });
        document.getElementById('hnBtnSettings').addEventListener('click', function () {
            openGlobalSettings();
        });
        var drawerClose = document.getElementById('hnDrawerClose');
        if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

        // 返回首页悬浮按钮
        var returnBtn = document.getElementById('homeNavReturnBtn');
        if (returnBtn) returnBtn.addEventListener('click', function () { show(); });

        // 搜索
        document.getElementById('hnSearchSubmit').addEventListener('click', doSearch);
        var searchInput = document.getElementById('hnSearchInput');
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && _suggestHighlightIdx < 0) doSearch();
            else suggestKeydownHandler(e);
        });
        searchInput.addEventListener('focus', function () {
            renderSuggestions();
        });
        searchInput.addEventListener('input', function () {
            renderSuggestions();
        });
        // 点击输入框 / 搜索区域之外关闭建议面板
        document.addEventListener('mousedown', function (e) {
            var suggest = document.getElementById('hnSuggest');
            if (!suggest) return;
            if (suggest.contains(e.target)) return;
            if (document.getElementById('hnSearch').contains(e.target)) return;
            hideSuggestions();
        });

        // 建议面板事件委托
        var suggest = document.getElementById('hnSuggest');
        if (suggest) {
            suggest.addEventListener('click', function (e) {
                // 1) 删除按钮（X）→ 最优先判断，避免冒泡到下面的 item 分支被吞掉
                var delBtn = e.target.closest('.hn-suggest-del');
                if (delBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    var dq = delBtn.getAttribute('data-del');
                    var parent = delBtn.closest('.hn-suggest-item');
                    onSuggestItemDel(dq, parent);
                    return;
                }
                // 2) 管理按钮
                if (e.target.closest('#hnSuggestManage')) {
                    hideSuggestions();
                    openHistoryModal();
                    return;
                }
                // 3) 单条建议点击（排除按钮/链接内部元素）
                var item = e.target.closest('.hn-suggest-item');
                if (item && !e.target.closest('button')) {
                    var q = item.getAttribute('data-q');
                    if (q) {
                        onSuggestItemClick(q);
                    }
                    return;
                }
            });
        }

        // 历史管理弹窗
        document.querySelectorAll('[data-close]').forEach(function (b) {
            b.addEventListener('click', function () {
                var id = b.getAttribute('data-close');
                var m = document.getElementById(id);
                if (m) m.classList.remove('show');
            });
        });
        // 弹窗遮罩点击关闭
        document.querySelectorAll('.hn-modal-mask').forEach(function (m) {
            m.addEventListener('click', function (e) {
                if (e.target === m) {
                    m.classList.remove('show');
                }
            });
        });
        // 历史筛选按钮
        var filterWrap = document.getElementById('hnHistoryFilter');
        if (filterWrap) {
            filterWrap.addEventListener('click', function (e) {
                var btn = e.target.closest('button');
                if (!btn) return;
                filterWrap.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                _historyFilterRange = btn.getAttribute('data-range');
                renderHistoryModal();
            });
        }
        // 历史单条删除（管理弹窗内）
        var histList = document.getElementById('hnHistoryList');
        if (histList) {
            histList.addEventListener('click', function (e) {
                var delBtn = e.target.closest('.hn-history-del');
                if (!delBtn) return;
                var q = delBtn.getAttribute('data-del');
                openConfirmModal('删除历史', '确定要删除该条搜索历史吗？', '删除', '取消', function () {
                    deleteSearchItem(q);
                    renderHistoryModal();
                    if (typeof toast === 'function') toast('已删除');
                });
            });
        }
        // 一键清除历史
        var clearBtn = document.getElementById('hnHistoryClear');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                openConfirmModal('清除搜索历史', '确定要<strong>清除全部</strong>搜索历史吗？该操作不可恢复。', '一键清除', '取消', function () {
                    clearSearchHistory();
                    renderHistoryModal();
                    if (typeof toast === 'function') toast('搜索历史已清除');
                });
            });
        }
        // 二次确认弹窗 Ok/Cancel
        var confirmOk = document.getElementById('hnConfirmOk');
        var confirmCancel = document.getElementById('hnConfirmCancel');
        if (confirmOk) {
            confirmOk.addEventListener('click', function () {
                if (typeof _confirmCallback === 'function') _confirmCallback();
                closeConfirmModal();
            });
        }
        if (confirmCancel) {
            confirmCancel.addEventListener('click', closeConfirmModal);
        }

        // 引擎下拉
        var engineBtn = document.getElementById('hnEngineBtn');
        var engineMenu = document.getElementById('hnEngineMenu');
        engineBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            engineMenu.classList.toggle('open');
        });
        engineMenu.addEventListener('click', function (e) {
            var item = e.target.closest('.hn-engine-menu-item');
            if (!item) return;
            settings.engine = item.getAttribute('data-engine');
            saveSettings();
            syncEngineUI();
            renderEngineMenu();
            renderEngines();
            engineMenu.classList.remove('open');
        });
        document.addEventListener('click', function (e) {
            if (engineMenu.classList.contains('open') && !e.target.closest('#hnSearch')) {
                engineMenu.classList.remove('open');
            }
        });

        // 抽屉：引擎单选
        document.getElementById('hnEngineList').addEventListener('click', function (e) {
            var item = e.target.closest('.hn-engine-item');
            if (!item) return;
            settings.engine = item.getAttribute('data-engine');
            saveSettings();
            renderEngines();
            renderEngineMenu();
            syncEngineUI();
        });

        // 抽屉：组件开关
        [['hnWgClock', 'clock'], ['hnWgSearch', 'search'], ['hnWgLinks', 'links'], ['hnWgMusic', 'music']].forEach(function (pair) {
            var checkbox = document.getElementById(pair[0]);
            checkbox.addEventListener('change', function () {
                settings.widgets[pair[1]] = checkbox.checked;
                saveSettings();
                applyWidgets();
            });
        });

        // 抽屉：链接表单
        document.getElementById('hnLinkSave').addEventListener('click', saveLinkForm);
        document.getElementById('hnLinkCancel').addEventListener('click', function () { startLinkForm(-1); });

        // 抽屉：链接管理列表（事件委托）
        document.getElementById('hnManageList').addEventListener('click', function (e) {
            var btn = e.target.closest('.hn-manage-btn');
            if (!btn) return;
            var item = btn.closest('.hn-manage-item');
            var index = parseInt(item.getAttribute('data-index'), 10);
            var act = btn.getAttribute('data-act');
            if (act === 'edit') {
                startLinkForm(index);
            } else if (act === 'del') {
                links.splice(index, 1);
                saveLinks();
                renderLinks();
                renderManageList();
                if (editingLinkIndex === index) startLinkForm(-1);
                toast('快捷链接已删除');
            } else if (act === 'up' && index > 0) {
                var tmpUp = links[index - 1];
                links[index - 1] = links[index];
                links[index] = tmpUp;
                saveLinks();
                renderLinks();
                renderManageList();
            } else if (act === 'down' && index < links.length - 1) {
                var tmpDown = links[index + 1];
                links[index + 1] = links[index];
                links[index] = tmpDown;
                saveLinks();
                renderLinks();
                renderManageList();
            }
        });

        // 抽屉：背景
        document.getElementById('hnBgPresets').addEventListener('click', function (e) {
            var btn = e.target.closest('.hn-bg-preset');
            if (!btn) return;
            settings.bg.preset = btn.getAttribute('data-preset');
            currentBgImage = null;
            localStorage.removeItem(BG_CUSTOM_KEY);
            saveSettings();
            applyBackground();
        });

        document.getElementById('hnBgUrlApply').addEventListener('click', function () {
            var urlInput = document.getElementById('hnBgUrl');
            var url = normalizeUrl(urlInput.value);
            if (!url) {
                toast('请输入图片地址');
                return;
            }
            currentBgImage = url;
            localStorage.setItem(BG_CUSTOM_KEY, url);
            applyBackground();
            toast('背景图片已应用');
        });

        document.getElementById('hnBgUploadBtn').addEventListener('click', function () {
            document.getElementById('hnBgFile').click();
        });

        document.getElementById('hnBgFile').addEventListener('change', function () {
            var file = this.files && this.files[0];
            this.value = '';
            if (!file) return;
            if (!/^image\//.test(file.type)) {
                toast('请选择图片文件');
                return;
            }
            if (file.size > 4 * 1024 * 1024) {
                toast('图片大小不能超过 4MB');
                return;
            }
            var reader = new FileReader();
            reader.onload = function () {
                currentBgImage = reader.result;
                try {
                    localStorage.setItem(BG_CUSTOM_KEY, currentBgImage);
                } catch (e) {
                    toast('图片过大，保存失败');
                    currentBgImage = null;
                    return;
                }
                applyBackground();
                toast('背景图片已应用');
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('hnBgClearBtn').addEventListener('click', function () {
            currentBgImage = null;
            localStorage.removeItem(BG_CUSTOM_KEY);
            document.getElementById('hnBgUrl').value = '';
            applyBackground();
            toast('已清除自定义背景图片');
        });

        var dimRange = document.getElementById('hnDimRange');
        dimRange.addEventListener('input', function () {
            settings.bg.dim = parseInt(dimRange.value, 10);
            document.getElementById('hnDimVal').textContent = settings.bg.dim + '%';
            applyBackground();
        });
        dimRange.addEventListener('change', saveSettings);

        var blurRange = document.getElementById('hnBlurRange');
        blurRange.addEventListener('input', function () {
            settings.bg.blur = parseInt(blurRange.value, 10);
            document.getElementById('hnBlurVal').textContent = settings.bg.blur + 'px';
            applyBackground();
        });
        blurRange.addEventListener('change', saveSettings);

        // 抽屉：恢复默认
        document.getElementById('hnResetBtn').addEventListener('click', function () {
            var doReset = function () {
                settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
                links = JSON.parse(JSON.stringify(DEFAULT_LINKS));
                currentBgImage = null;
                localStorage.removeItem(BG_CUSTOM_KEY);
                saveSettings();
                saveLinks();
                syncControlsToSettings();
                renderEngines();
                renderEngineMenu();
                syncEngineUI();
                renderLinks();
                renderManageList();
                renderBgPresets();
                applyBackground();
                applyWidgets();
                startLinkForm(-1);
                toast('已恢复全部默认设置');
            };
            if (typeof window.showConfirmModal === 'function') {
                window.showConfirmModal('确定要恢复首页导航的全部默认设置吗？自定义的快捷链接与背景将被重置。', doReset);
            } else if (window.confirm('确定要恢复首页导航的全部默认设置吗？')) {
                doReset();
            }
        });

        // 音乐播放器
        document.getElementById('hnMusicFab').addEventListener('click', openMusicPanel);
        document.getElementById('hnMusicClose').addEventListener('click', closeMusicPanel);

        // ESC：关闭抽屉 / 引擎菜单 / 音乐面板
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape' || !visible) return;
            var engineMenu = document.getElementById('hnEngineMenu');
            if (engineMenu && engineMenu.classList.contains('open')) {
                engineMenu.classList.remove('open');
                return;
            }
            var drawer = document.getElementById('hnDrawer');
            if (drawer && drawer.classList.contains('open')) {
                closeDrawer();
                return;
            }
            if (panelOpen()) closeMusicPanel();
        });

        // 首页模式下，点击底部音乐控制条的「快速跳转」区域改为打开首页音乐面板
        document.addEventListener('click', function (e) {
            if (!visible) return;
            var miniInfo = e.target.closest ? e.target.closest('#stkMiniInfo') : null;
            if (miniInfo && miniInfo.classList.contains('stk-clickable')) {
                e.stopPropagation();
                e.preventDefault();
                openMusicPanel();
            }
        }, true);
    }

    function syncControlsToSettings() {
        var eng = SEARCH_ENGINES[settings.engine] || SEARCH_ENGINES.baidu;
        var shortEl = document.getElementById('hnEngineShort');
        var nameEl = document.getElementById('hnEngineName');
        if (shortEl) shortEl.textContent = eng.short;
        if (nameEl) nameEl.textContent = eng.name;

        var map = { hnWgClock: 'clock', hnWgSearch: 'search', hnWgLinks: 'links', hnWgMusic: 'music' };
        Object.keys(map).forEach(function (id) {
            var checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = !!settings.widgets[map[id]];
        });

        var dimRange = document.getElementById('hnDimRange');
        if (dimRange) dimRange.value = settings.bg.dim;
        var dimVal = document.getElementById('hnDimVal');
        if (dimVal) dimVal.textContent = settings.bg.dim + '%';
        var blurRange = document.getElementById('hnBlurRange');
        if (blurRange) blurRange.value = settings.bg.blur;
        var blurVal = document.getElementById('hnBlurVal');
        if (blurVal) blurVal.textContent = settings.bg.blur + 'px';
    }

    // ==================== 全局设置（复用登录页弹窗） ====================
    function openGlobalSettings() {
        var sidebarBtn = document.getElementById('sidebarSettings');
        if (sidebarBtn) {
            sidebarBtn.click();
            return;
        }
        // 兜底：直接打开全局设置弹窗
        var modal = document.getElementById('debugModal');
        if (!modal) return;
        modal.style.display = 'flex';
        setTimeout(function () {
            modal.classList.add('show');
            var currentMode = localStorage.getItem(MODE_KEY) || 'full';
            modal.querySelectorAll('.gf-mode-option').forEach(function (opt) {
                opt.classList.toggle('selected', opt.getAttribute('data-mode') === currentMode);
            });
        }, 10);
    }

    // ==================== 显示 / 隐藏 ====================
    function show() {
        build();
        var overlay = document.getElementById('homeNavOverlay');
        var returnBtn = document.getElementById('homeNavReturnBtn');
        if (!overlay) return;

        visible = true;
        overlay.style.display = 'flex';
        // 触发过渡动画
        requestAnimationFrame(function () {
            overlay.classList.add('show');
        });
        document.body.classList.add('homenav-active');
        if (returnBtn) returnBtn.style.display = 'none';

        renderLinks();
        renderManageList();
        applyBackground();
        applyWidgets();
        startClock();
    }

    function hide() {
        var overlay = document.getElementById('homeNavOverlay');
        var returnBtn = document.getElementById('homeNavReturnBtn');
        if (!overlay || !visible) return;

        visible = false;
        closeDrawer();
        closeMusicPanel();

        // 切换播放器宿主到游戏中心容器（如果之后用户进入启动器，播放器 DOM 会迁移过去）
        if (typeof window.setSoundtrackContainer === 'function') {
            window.setSoundtrackContainer('soundtrackArea');
        }

        overlay.classList.remove('show');
        setTimeout(function () {
            if (!visible) overlay.style.display = 'none';
        }, 320);
        document.body.classList.remove('homenav-active');
        if (returnBtn) returnBtn.style.display = '';
    }

    // ==================== 全局暴露与自启 ====================
    window.HomeNav = {
        show: show,
        hide: hide,
        isOpen: function () { return visible; },
        isHomeMode: function () { return localStorage.getItem(MODE_KEY) === 'home'; }
    };

    function boot() {
        if (window.HomeNav.isHomeMode()) {
            // 页面过渡完成后自动进入首页导航模式
            setTimeout(show, 280);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // ==================== HTML 转义 ====================
    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function escapeAttr(str) {
        return escapeHtml(str);
    }
})();
