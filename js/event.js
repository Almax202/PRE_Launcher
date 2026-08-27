// 活动系统 - 活动公告与活动中心管理模块

// 本地存储键名
const EVENT_STORAGE_KEYS = {
    VIEWED_EVENT_ANNOUNCEMENT_IDS: 'viewed_event_announcement_ids',
    EVENT_DATA_VERSION: 'event_data_version'
};

// 初始化：如果数据版本不匹配，重置已读状态
(function initEventData() {
    var currentVersion = '1';
    var storedVersion = localStorage.getItem(EVENT_STORAGE_KEYS.EVENT_DATA_VERSION);
    if (storedVersion !== currentVersion) {
        localStorage.removeItem(EVENT_STORAGE_KEYS.VIEWED_EVENT_ANNOUNCEMENT_IDS);
        localStorage.setItem(EVENT_STORAGE_KEYS.EVENT_DATA_VERSION, currentVersion);
    }
})();

// ==================== 活动公告数据 ====================
var eventAnnouncementData = {
    categories: [
        { id: 'current', name: '当前活动', icon: 'fa-star' },
        { id: 'upcoming', name: '即将到来', icon: 'fa-clock' },
        { id: 'ended', name: '已结束', icon: 'fa-flag-checkered' }
    ],
    // 公告侧边栏排序配置：按数组顺序显示
    sortOrder: ['event_001','event_daily_checkin', ],
    announcements: [
        {
            id: 'event_daily_checkin',
            category: 'current',
            title: '每日签到',
            date: '账号建立时间',
            endDate: '无限制',
            description: '每天登录签到，领取日常奖励',
            content: '<h2>每日签到</h2><p>欢迎使用 PRE Launcher！每日签到是一项<span style="color:#d45d79;font-weight:600;">常驻活动</span>，只要您的账号存在，即可随时参与。</p><h3>活动时间</h3><p>起始日：账号建立时间<br>结束时间：无限制<br>每日更新，签到获取成长经验值</p><h3>奖励说明</h3><p>每日签到可获取成长经验值，帮助您的账号等级提升。连续签到还将解锁更多里程碑奖励。</p><h3>参与方式</h3><p>在活动中心点击「立即参与」即可跳转至每日签到区域，点击当日签到卡片完成签到。</p>',
            banner: ''
        },
        {
            id: 'event_001',
            category: 'current',
            title: '秋季签到与等级提速特别活动',
            date: '2026-08-27',
            endDate: '2026-09-30<p>（下一季度前）</p>',
            description: '常驻活动，注册即可参与！14天签到领取丰厚奖励，含名片样式、3D太空背景与海量经验值。',
            content: '<h2>秋季签到与等级提速特别活动</h2><p>秋季来临，全新启程！本次活动为<span style="color:#d45d79;font-weight:600;">第三季度常驻活动</span>，成功注册账号即可直接参与！</p><h3>活动时间</h3><p>起始日：2026年8月27日（UTC+8）<br>结束时间：下一季度前（2026年9月30日）<br>领取完成后活动将纳入已结束类别</p><h3>签到奖励（共14天）</h3><ul><li><strong>第1天：</strong>新名片样式「星河漫游」（特殊获取）</li><li><strong>第2-7天：</strong>每天500经验值（共3000exp）</li><li><strong>第8天：</strong>新3D太空遨游背景（特殊获取）</li><li><strong>第9-13天：</strong>每天1000经验值（共5000exp）</li><li><strong>第14天：</strong>2000经验值（总计10000exp）</li></ul><h3>参与方式</h3><p>进入活动中心 → 找到本活动 → 点击签到奖励卡或一键领取按钮领取对应奖励</p><h3>奖励说明</h3><p>经验值将立即对账户等级生效，名片样式和3D背景将解锁到对应系统中。</p>',
            banner: ''
        },
    ]
};

// ==================== 活动中心数据（基础模板，内容可随时更新） ====================
var eventCenterData = {
    categories: [
        { id: 'featured', name: '精选活动', icon: 'fa-fire' },
        { id: 'daily', name: '每日活动', icon: 'fa-calendar-day' },
        { id: 'special', name: '特殊活动', icon: 'fa-gem' },
        { id: 'ended', name: '已结束', icon: 'fa-flag-checkered' }
    ],
    // 活动侧边栏排序配置：按数组顺序显示
    sortOrder: ['center_002', 'center_001'],
    events: [

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
            subtitle: '第三季度常驻活动 · 注册即可参与',
            status: 'active',
            description: '14天签到领丰厚奖励：名片样式、3D太空背景与海量经验值<p>（共10000exp）</p><p>活动时间：2026年8月27日 - 2026年9月30日（UTC+8）（下一季度前）</p>',
            icon: 'fa-rocket',
            hasCheckin: true,
            checkinDays: 14,
            announcementId: 'event_001',
            showParticipate: false
        },
    ]
};

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
                    <div class="event-banner-area" id="eventBannerArea">
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
    var categories = eventAnnouncementData.categories;

    categories.forEach(function(cat) {
        var catAnnouncements = sortAnnouncementsByConfig(eventAnnouncementData.announcements.filter(function(a) {
            return a.category === cat.id;
        }));

        if (catAnnouncements.length === 0) return;

        html += `<div class="event-category-header"><i class="fas ${cat.icon}"></i><span>${cat.name}</span></div>`;

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
    }
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
                    <div class="event-banner-area" id="eventCenterBannerArea">
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
    var categories = eventCenterData.categories;

    categories.forEach(function(cat) {
        var catEvents = sortEventsByConfig(eventCenterData.events.filter(function(e) {
            return e.category === cat.id;
        }));

        if (catEvents.length === 0) return;

        html += `<div class="event-category-header"><i class="fas ${cat.icon}"></i><span>${cat.name}</span></div>`;

        catEvents.forEach(function(evt) {
            html += `
                <div class="event-announcement-item" data-id="${evt.id}">
                    <div class="event-announcement-icon"><i class="fas ${evt.icon}"></i></div>
                    <div class="event-announcement-info">
                        <div class="event-announcement-title">${evt.title}</div>
                        <div class="event-announcement-subtitle">${evt.subtitle}</div>
                    </div>
                    <div class="event-status-tag ${evt.status}">
                        ${evt.status === 'active' ? '进行中' : '已结束'}
                    </div>
                </div>
            `;
        });
    });

    listContainer.innerHTML = html;

    listContainer.querySelectorAll('.event-announcement-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
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
            actionButtonsHtml += `<button class="event-action-btn event-primary-btn" data-action="participate" data-event-id="${evt.id}">
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
                    ${evt.status === 'active' ? '进行中' : '已结束'}
                </div>
                <div class="event-center-desc">${evt.description}</div>
                <div class="event-center-actions">
                    ${actionButtonsHtml}
                </div>
            </div>
        `;

        detailEl.querySelectorAll('.event-action-btn').forEach(function(btn) {
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
                    if (targetEvt && targetEvt.id === 'center_001') {
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
        bannerArea.innerHTML = `
            <div class="event-banner-default event-banner-center">
                <div class="event-banner-icon"><i class="fas ${evt.icon}"></i></div>
                <div class="event-banner-title">${evt.title}</div>
            </div>
        `;
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
        try { return JSON.parse(stored); } catch(e) {}
    }
    return { claimedDays: [], lastClaimDate: null };
}

function saveCheckinData(eventId, data) {
    var key = getCheckinStorageKey(eventId);
    localStorage.setItem(key, JSON.stringify(data));
}

function getCurrentCheckinDay() {
    var startDate = new Date('2026-08-26T00:00:00+08:00');
    var now = new Date();
    var utc8 = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    var todayStr = utc8.toISOString().substring(0, 10);
    var today = new Date(todayStr + 'T00:00:00+08:00');
    var diffMs = today - startDate;
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    var day = diffDays + 1;
    if (day < 1) return 0;
    if (day > 14) return 14;
    return day;
}

function isCheckinDayUnlocked(rewardDay) {
    var currentDay = getCurrentCheckinDay();
    return rewardDay <= currentDay;
}

function generateCheckinSection(eventId) {
    var rewards = getCheckinRewards(eventId);
    if (!rewards || rewards.length === 0) return '';

    var checkinData = getCheckinData(eventId);
    var claimedDays = checkinData.claimedDays || [];
    var currentDay = getCurrentCheckinDay();
    var allClaimed = claimedDays.length >= rewards.length;

    var cardsHtml = rewards.map(function(reward) {
        var isClaimed = claimedDays.indexOf(reward.day) !== -1;
        var isGold = reward.isGold;
        var isLocked = !isCheckinDayUnlocked(reward.day);
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

    var canClaimAny = rewards.some(function(r) { return r.day <= currentDay && claimedDays.indexOf(r.day) === -1; });
    var claimAllDisabled = claimedDays.length >= rewards.length || !canClaimAny;

    return `
        <div class="checkin-section">
            <div class="checkin-section-header">
                <div class="checkin-section-title"><i class="fas fa-calendar-check"></i> 签到区</div>
                <div class="checkin-progress">${progressText}</div>
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

    var currentDay = getCurrentCheckinDay();

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

            if (isLocked) {
                showToast({ type: 'info', title: '暂未解锁', message: '该奖励卡暂未解锁，请接着签到以推进奖励解锁进度吧' });
                return;
            }

            if (day > currentDay) {
                showToast({ type: 'info', title: '暂未解锁', message: '该奖励尚未解锁，请等待对应签到日到来' });
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

    var claimAllBtn = document.getElementById('checkinClaimAllBtn');
    if (claimAllBtn) {
        claimAllBtn.addEventListener('click', function() {
            var data = getCheckinData(eventId);
            var claimedDays = data.claimedDays || [];
            var currentDay = getCurrentCheckinDay();

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
    }
}

function updateCheckinUI(eventId) {
    var checkinEl = document.getElementById('eventCenterCheckin');
    if (!checkinEl) return;

    var rewards = getCheckinRewards(eventId);
    if (!rewards || rewards.length === 0) return;

    checkinEl.innerHTML = generateCheckinSection(eventId);
    bindCheckinInteractions(eventId);

    var claimedDays = (getCheckinData(eventId).claimedDays || []).slice();
    var allClaimed = rewards.every(function(r) { return claimedDays.indexOf(r.day) !== -1; });
    if (allClaimed) {
        migrateEventToEnded(eventId);
    }
}

function migrateEventToEnded(eventId) {
    if (window.eventAnnouncementData) {
        var ann = window.eventAnnouncementData;
        var itemIdx = ann.announcements.findIndex(function(a) { return a.id === eventId; });
        if (itemIdx !== -1 && ann.announcements[itemIdx].category !== 'ended') {
            ann.announcements[itemIdx].category = 'ended';
            localStorage.setItem('eventAnnouncementData', JSON.stringify(ann));
        }
    }

    if (window.eventCenterData) {
        var ec = window.eventCenterData;
        var eIdx = ec.events.findIndex(function(e) { return e.id === eventId; });
        if (eIdx !== -1 && ec.events[eIdx].category !== 'ended') {
            ec.events[eIdx].category = 'ended';
            localStorage.setItem('eventCenterData', JSON.stringify(ec));
        }
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

    if (!foundUser.gameData) foundUser.gameData = {};
    if (foundUser.gameData.level === undefined) foundUser.gameData.level = 1;
    if (foundUser.gameData.totalExp === undefined) foundUser.gameData.totalExp = 0;
    if (foundUser.gameData.exp === undefined) foundUser.gameData.exp = 0;

    var level = foundUser.gameData.level;
    var totalExp = foundUser.gameData.totalExp + amount;
    var expInLevel = foundUser.gameData.exp + amount;

    while (expInLevel >= getExpRequiredForLevelStatic(level)) {
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
    var MAX_LEVEL = 60;
    if (level >= MAX_LEVEL) return 0;
    return 50 + (level - 1) * 30;
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
window.eventCenterData = eventCenterData;