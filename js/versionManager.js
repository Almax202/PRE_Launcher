// 版本管理文件，统一管理所有页面的版本号
const versionInfo = {
    // 登录页版本号
    login: "RC 2.7.0.0 (b8)",

    // 游戏大厅版本号
    homepage: "RC 1.1.0.0 (a2)",

    // 点击方块游戏版本号
    fkgame: "RC 1.3.1",

    // 五子棋游戏版本号
    wzqgame: "RC 1.2.1",
 
    // 飞行器游戏版本号
    fxqgame: "RC 1.2.1",

    // 贪吃蛇游戏版本号
    snakegame: "RC 1.0.1",

    // 记忆卡牌游戏版本号
    memorygame: "RC 1.1.1",

    // 颜色匹配游戏版本号
    colormatchgame: "RC 1.2.0",

    // 内部版本号
    // 格式：年月日.版本号四位数.补丁批次.累积更新次数
    launcher: "20260701.2700.b8.102",

    // 主题版本信息
    // status字段可选值说明：
    // - "停用优化中": 主题正在优化，暂时不可用，显示红色标签
    // - "公开测试版": 主题处于公开测试阶段，显示蓝色标签
    // - "公开正式版": 主题已正式发布，显示绿色标签
    themes: {
        glass: {
            version: "RC 2.0.0",
            releaseDate: "2026-04-06",
            updateDate: "2026-07-01",
            status: "公开正式版"
        },
        transparent: {
            version: "RC 1.2.9",
            releaseDate: "2026-06-06",
            updateDate: "2026-07-01",
            status: "公开正式版"
        }
    },
    
    components: {
        stickyNotes: {
            name: "便签",
            icon: "fas fa-sticky-note",
            iconBg: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
            iconColor: "#ff8c42",
            version: "RC 1.1.5",
            releaseDate: "2026-06-20",
            updateDate: "2026-06-29",
            status: "公开正式版",
            developer: "PREAlmax",
            copyright: "© 2014-2026 PREAlmax, All rights reserved.",
            description: "便捷的桌面便签组件，支持多条便签管理、全屏显示、自定义排序等功能",
            features: [
                "支持创建多条便签，每条便签独立编辑",
                "全屏显示模式，放大便签卡片展示更多内容",
                "便签卡片自定义排序，拖拽调整顺序",
                "便签内容自动保存，刷新不丢失",
                "支持便签删除和清空操作"
            ]
        },
        pageClock: {
            name: "页面时钟",
            icon: "fas fa-clock",
            iconBg: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            iconColor: "#4ecdc4",
            version: "RC 1.1.8",
            releaseDate: "2026-06-14",
            updateDate: "2026-06-30",
            status: "公开正式版",
            developer: "PREAlmax",
            copyright: "© 2014-2026 PREAlmax, All rights reserved.",
            description: "多功能页面时钟组件，支持数字时钟、天气显示、侧边栏模式等功能",
            features: [
                "数字时钟实时显示",
                "天气信息展示，支持温度和天气状况",
                "侧边栏模式，弹窗从右侧滑出",
                "12/24小时制切换",
                "自定义时钟外观和位置"
            ]
        },
        weather: {
            name: "天气",
            icon: "fas fa-cloud-sun",
            iconBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            iconColor: "#ffffff",
            version: "Public Beta 0.1.1.0",
            releaseDate: "2026-06-27",
            updateDate: "2026-06-30",
            status: "公开测试版",
            developer: "PREAlmax",
            copyright: "© 2014-2026 PREAlmax, All rights reserved.",
            description: "基于Open-Meteo的天气查询组件，支持实时天气、24小时预报、7天预报等功能",
            features: [
                "实时天气数据，基于Open-Meteo API",
                "24小时逐小时预报，横向滚动展示",
                "7天天气预报，每日高低温显示",
                "体感温度、湿度、风力、气压等详细数据",
                "城市切换，内置全国主要城市数据库",
                "自动定位功能，一键获取当前位置天气",
                "摄氏度/华氏度单位切换",
                "自动刷新，支持多档间隔设置"
            ]
        }
    }
};
// 启动器信息
const launcherInfo = {
    name: "PRE Launcher",
    version: getVersion('login'),
    internalVersion: getVersion('launcher'),
    buildDate: "2026-07-01",
    patchDate: "2026-07-01",
    copyright: "© 2014-2026 PREAlmax, All rights reserved.",
    developer: "PREAlmax",
    fontUsage: ""
};

const LAST_KNOWN_LOGIN_VERSION_KEY = 'lastKnownLoginVersion';

function getVersion(page) {
    return versionInfo[page] || "获取失败，重定向错误";
}

function getThemeVersionInfo(themeName) {
    return versionInfo.themes && versionInfo.themes[themeName] || null;
}

function getComponentVersionInfo(componentName) {
    return versionInfo.components && versionInfo.components[componentName] || null;
}

function showComponentInfoModal(componentName) {
    const componentInfo = getComponentVersionInfo(componentName);
    
    const existingModal = document.getElementById('componentInfoModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'componentInfoModal';
    modal.className = 'custom-alert component-info-modal-v2';
    
    let modalContent = '';
    if (componentInfo) {
        const featuresHtml = componentInfo.features && componentInfo.features.length > 0
            ? componentInfo.features.map(f => `<li><i class="fas fa-check-circle"></i><span>${f}</span></li>`).join('')
            : '';
        
        modalContent = `
            <div class="alert-content component-info-alert-content">
                <div class="component-modal-header">
                    <div class="component-modal-icon" style="background: ${componentInfo.iconBg || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};">
                        <i class="${componentInfo.icon || 'fas fa-puzzle-piece'}" style="color: ${componentInfo.iconColor || '#fff'};"></i>
                    </div>
                    <div class="component-modal-title">
                        <h2>${componentInfo.name}</h2>
                        <div class="component-modal-version">
                            <span class="version-tag">${componentInfo.version}</span>
                            <span class="status-tag ${componentInfo.status === '公开测试版' ? 'beta' : componentInfo.status === '公开正式版' ? 'release' : ''}">${componentInfo.status}</span>
                        </div>
                    </div>
                    <button class="component-modal-close" onclick="document.getElementById('componentInfoModal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="component-modal-body">
                    <div class="component-description">
                        <p>${componentInfo.description || ''}</p>
                    </div>
                    ${featuresHtml ? `
                    <div class="component-features">
                        <h3><i class="fas fa-star"></i> 主要功能</h3>
                        <ul>${featuresHtml}</ul>
                    </div>
                    ` : ''}
                    <div class="component-info-grid">
                        <div class="info-item">
                            <div class="info-label"><i class="fas fa-calendar-plus"></i> 发布日期</div>
                            <div class="info-value">${componentInfo.releaseDate}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label"><i class="fas fa-calendar-check"></i> 更新日期</div>
                            <div class="info-value">${componentInfo.updateDate}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label"><i class="fas fa-user"></i> 开发者</div>
                            <div class="info-value">${componentInfo.developer}</div>
                        </div>
                    </div>
                </div>
                <div class="component-modal-footer">
                    <div class="component-copyright">${componentInfo.copyright}</div>
                    <button class="alert-confirm" onclick="document.getElementById('componentInfoModal').remove()">关闭</button>
                </div>
            </div>
        `;
    } else {
        modalContent = `
            <div class="alert-content" style="max-width: 500px;">
                <div class="alert-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h2>组件信息</h2>
                <div class="about-info">
                    <p>无法获取组件信息</p>
                </div>
                <div class="modal-buttons">
                    <button class="alert-confirm" onclick="document.getElementById('componentInfoModal').remove()">关闭</button>
                </div>
            </div>
        `;
    }
    
    modal.innerHTML = modalContent;
    
    document.body.appendChild(modal);
    
    modal.style.display = 'flex';
    modal.style.zIndex = '20000';
    setTimeout(function() {
        modal.classList.add('show');
    }, 10);
}

function getLastKnownLoginVersion() {
    return localStorage.getItem(LAST_KNOWN_LOGIN_VERSION_KEY);
}

function updateLastKnownLoginVersion() {
    localStorage.setItem(LAST_KNOWN_LOGIN_VERSION_KEY, getVersion('login'));
}

function hasLoginVersionChanged() {
    const currentVersion = getVersion('login');
    const lastKnownVersion = getLastKnownLoginVersion();
    return lastKnownVersion !== currentVersion;
}

// 更新页面版本号显示的函数
function updateVersionDisplay(page) {
    // 登录页和游戏页面的版本号显示位置不同
    if (page === 'login' || page === 'homepage') {
        // 登录页和游戏大厅的版本号显示在侧边栏用户信息中
        const versionElement = document.getElementById('versionNumber');
        if (versionElement) {
            versionElement.textContent = getVersion(page);
        } else {
            // 兼容旧结构
            const sidebarUidElement = document.querySelector('.sidebar-uid');
            if (sidebarUidElement) {
                sidebarUidElement.textContent = getVersion(page);
            }
        }
    } else if (page === 'fxqgame') {
        // 飞行器游戏的版本号显示在页脚
        const versionElement = document.querySelector('.footer-info p[data-lang="gameVersion"]');
        if (versionElement) {
            // 检查是否有langConfig对象，如果有则使用其中的gameVersion文本
            if (typeof langConfig !== 'undefined' && langConfig[currentLang] && langConfig[currentLang].gameVersion) {
                versionElement.textContent = langConfig[currentLang].gameVersion + getVersion(page);
            } else {
                versionElement.textContent = `游戏版本：${getVersion(page)}`;
            }
        }
    } else {
        // 其他游戏页面的版本号显示在侧边栏用户信息中
        const versionElement = document.querySelector('.sidebar-uid');
        if (versionElement) {
            versionElement.textContent = getVersion(page);
        }
    }
}

// 添加版本号点击事件监听
function addVersionClickEvent() {
    const versionElement = document.getElementById('versionNumber');
    const versionInfoElement = document.getElementById('versionInfo');
    
    if (versionElement && versionInfoElement) {
        let clickCount = 0;
        
        versionElement.addEventListener('click', function() {
            clickCount++;
            
            if (clickCount >= 5) {
                versionInfoElement.style.display = 'block';
                // 重置点击计数，以便再次点击时可以重新显示
                clickCount = 0;
            }
        });
    }
}

// 添加关于启动器窗口中版本号的点击事件监听
function addAboutVersionClickEvent() {
    // 等待关于启动器模态框生成
    setTimeout(function() {
        const versionElement = document.getElementById('aboutVersionNumber');
        
        if (versionElement) {
            let clickCount = 0;
            
            versionElement.addEventListener('click', function() {
                clickCount++;
                
                if (clickCount >= 5) {
                    showInternalVersionInfo();
                    // 重置点击计数
                    clickCount = 0;
                }
            });
        }
    }, 100);
}

// 获取账号唯一标识符
function getAccountId() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            return user.userId || '未登录';
        } catch (e) {
            return '未登录';
        }
    }
    return '未登录';
}

// 生成设备唯一标识符
function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        // 生成一个随机的设备ID
        deviceId = 'DEV-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

// 显示内部版本信息窗口
function showInternalVersionInfo() {
    // 获取账号和设备信息
    const accountId = getAccountId();
    const deviceId = getDeviceId();
    
    // 创建模态框元素
    const modal = document.createElement('div');
    modal.id = 'internalVersionModal';
    modal.className = 'custom-alert';
    
    // 模态框内容
    modal.innerHTML = `
        <div class="alert-content" style="max-width: 500px;">
            <div class="alert-icon">
                <i class="fas fa-code-branch"></i>
            </div>
            <h2>内部版本信息</h2>
            <div class="about-content">
                <div class="about-info">
                    <p>内部版本号：${launcherInfo.internalVersion}</p>
                    <p>版本构建日期：${launcherInfo.buildDate}</p>
                    <p>维护补丁日期：${launcherInfo.patchDate}</p>
                    <p>发布版本：${launcherInfo.version}</p>
                    <p>账号唯一标识符：${accountId}</p>
                    <p>设备唯一标识符：${deviceId}</p>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="alert-confirm" onclick="document.getElementById('internalVersionModal').remove()">关闭</button>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 显示模态框
    modal.style.display = 'flex';
    setTimeout(function() {
        modal.classList.add('show');
    }, 10);
}

// 页面加载完成后添加事件监听
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        addVersionClickEvent();
        addAboutVersionClickEvent();
    });
} else {
    addVersionClickEvent();
    addAboutVersionClickEvent();
}
