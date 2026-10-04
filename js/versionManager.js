// 版本管理文件，统一管理所有页面的版本号
const versionInfo = {
    // 登录页版本号
    login: "RC 3.0.3.5 (c3)",

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
    // 格式：年月日.版本号四位数.补丁批次.累积更新次数.组件版本
    launcher: "20261004.3035.c3.141.l6",

    // 主题版本信息
    // status字段可选值说明：
    // - "停用优化中": 主题正在优化，暂时不可用，显示红色标签
    // - "公开测试版": 主题处于公开测试阶段，显示蓝色标签
    // - "公开正式版": 主题已正式发布，显示绿色标签
    themes: {
        glass: {
            version: "RC 2.0.1",
            releaseDate: "2026-04-06",
            updateDate: "2026-07-05",
            status: "公开正式版"
        },
        transparent: {
            version: "RC 1.2.17",
            releaseDate: "2026-06-06",
            updateDate: "2026-08-08",
            status: "公开正式版"
        }
    },
    
    components: {
        stickyNotes: {
            name: "便签",
            icon: "fas fa-sticky-note",
            iconBg: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
            iconColor: "#ff8c42",
            version: "RC 1.2.2",
            releaseDate: "2026-06-20",
            updateDate: "2026-07-22",
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
            version: "RC 1.1.11",
            releaseDate: "2026-06-14",
            updateDate: "2026-10-03",
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
            version: "RC 1.2.2",
            releaseDate: "2026-06-27",
            updateDate: "2026-07-14",
            status: "公开正式版",
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
        },
        imageViewer: {
            name: "图片查看器",
            icon: "fas fa-image",
            iconBg: "linear-gradient(135deg, #d45d79 0%, #e67e8a 100%)",
            iconColor: "#ffffff",
            version: "RC 2.2.0",
            releaseDate: "2026-04-05",
            updateDate: "2026-07-25",
            status: "公开正式版",
            developer: "PREAlmax",
            copyright: "© 2014-2026 PREAlmax, All rights reserved.",
            description: "专用图片查看器，支持查看版本更新记录和邮件内图片的查看器，可支持图片缩放、旋转、翻转和组件信息查看功能",
            features: [
                "支持图片放大缩小，最大可放大至500%",
                "支持向左向右旋转，每次旋转90度",
                "支持水平翻转和垂直翻转",
                "支持鼠标拖拽平移查看大图",
                "全屏弹窗显示，沉浸式查看体验",
                "点击组件信息按钮查看版本详情"
            ]
        },
        calendar: {
            name: "日历",
            icon: "fas fa-calendar-alt",
            iconBg: "linear-gradient(135deg, #d45d79 0%, #e67e8a 100%)",
            iconColor: "#ffffff",
            version: "RC 1.0.3",
            releaseDate: "2026-07-11",
            updateDate: "2026-07-22",
            status: "公开正式版",
            developer: "PREAlmax",
            copyright: "© 2014-2026 PREAlmax, All rights reserved.",
            description: "功能完整的日历组件，支持月视图日历、待办事项、日程管理和课程表功能",
            features: [
                "月视图日历，支持月份切换和日期选择",
                "待办事项管理，支持优先级和截止日期",
                "日程管理，支持时间设置和颜色标签",
                "课程表管理，按星期分组显示",
                "数据导入导出，支持JSON格式",
                "数据本地持久化，自动保存不丢失"
            ]
        },
        uiSwitching: {
            name: "UI切换",
            icon: "fas fa-layer-group",
            iconBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            iconColor: "#ffffff",
            version: "RC 0",
            releaseDate: "2026-07-30",
            updateDate: "2026-07-30",
            status: "停用优化中",
            developer: "PREAlmax",
            copyright: "© 2014-2026 PREAlmax, All rights reserved.",
            description: "界面风格切换组件，支持在系统默认UI与简约设计UI之间切换，UI设计采用简约风格顶部导航栏布局",
            features: [
                "支持系统默认UI（侧边栏布局）和简约设计UI（顶部导航栏布局）切换",
                "UI设计采用简约风格顶部导航栏，左上角启动器Logo和名称",
                "右上角账户显示，中间区域更现代化的登录样式",
                "切换UI后自动保存设置，下次访问自动应用",
                "支持版本信息查看，了解组件更新历史"
            ]
        },
        soundtrack: {
            name: "音乐播放器",
            icon: "fas fa-music",
            iconBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            iconColor: "#ffffff",
            version: "RC 1.0.3",
            releaseDate: "2026-09-04",
            updateDate: "2026-09-18",
            status: "公开正式版",
            developer: "PREAlmax",
            copyright: "© 2014-2026 PREAlmax, All rights reserved.",
            description: "PRE Launcher 内置音乐播放器组件，双栏布局独立播放界面，支持多播放列表管理、本地音频导入、专辑浏览、自定义曲目背景与随音乐律动的播放样式可视化，全部设置本地持久化保存",
            features: [
                "双栏播放界面：左侧播放列表，右侧主播放区",
                "播放列表管理：新建、重命名、删除（内置默认列表受保护）、多列表快速切换，支持导入本地音频文件（mp3/ogg/wav/flac/m4a/aac/opus），音频数据通过 IndexedDB 持久化保存",
                "专辑浏览：专辑卡片总览，侧边栏引导选择专辑，选中后展示专辑曲目并可随时返回重新选择，专辑仅需配置曲目 id 即可快速制作",
                "自定义背景图片：按曲目独立设置专属背景，折页悬浮预览、点击完全展开，展开状态自动持久化恢复",
                "音乐律动播放样式：基于 Web Audio 实时频谱分析，提供音浪、波纹、流光波浪三种随音乐律动的可视化效果，设置面板内实时预览",
                "播放器个性化：组件位置九宫格预设与缩放、唱片/歌曲信息显隐、底部控制条行为均可独立调整并自动保存",
                "底部全局播放控制条：切换到其他页面时音乐不中断，悬浮控制条固定于视口底部随时可控，与主播放界面双向同步",
            ]
        },
        commandPrompt: {
            name: "命令提示符",
            icon: "fas fa-terminal",
            iconBg: "linear-gradient(135deg, #232526 0%, #414345 100%)",
            iconColor: "#16c60c",
            version: "RC 1.0.0",
            releaseDate: "2026-09-29",
            updateDate: "2026-09-29",
            status: "公开正式版",
            developer: "PREAlmax",
            copyright: "© 2014-2026 PREAlmax, All rights reserved.",
            description: "Windows CMD 风格的开发者命令提示符，支持脚本自动化测试，可对启动器全部页面及 JS 运行逻辑进行完整功能检查并输出测试结论，输入 /exit 可返回正常页面",
            features: [
                "输入 /help 查看全部可执行命令",
                "一键自动执行所有页面的完整功能检查（含 JS 运行逻辑）",
                "覆盖页面可达性、静态资源完整性、JS 语法与运行时错误检查",
                "全部测试完成后输出通过 / 未通过测试结论",
                "输入 /exit 退出并返回正常页面"
            ]
        },
        networkSpeedTest: {
            name: "网络测速",
            icon: "fas fa-gauge-high",
            iconBg: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
            iconColor: "#ffffff",
            version: "Beta 0.1.0.0",
            releaseDate: "2026-09-29",
            updateDate: "2026-09-29",
            status: "公开测试版",
            developer: "PREAlmax",
            copyright: "© 2014-2026 PREAlmax, All rights reserved.",
            description: "实验性网络测速组件，通过 Cloudflare 全球测速节点测量网络 Ping 延迟、下载速度与上传速度，每个阶段持续不少于 10 秒，并以仪表盘实时展示测速数据",
            features: [
                "Ping 延迟测试：连续采样不少于 10 秒，给出平均延迟、最小延迟与抖动数据",
                "下载速度测试：多连接并行下载测速节点数据流，持续不少于 10 秒，结果以 Mbps 显示",
                "上传速度测试：多连接并行上传数据，持续不少于 10 秒，结果以 Mbps 显示",
                "实时仪表盘：指针式仪表盘直观展示当前测速数值，并随速度自动切换量程",
                "三阶段自动进行：Ping → 下载 → 上传依次执行，支持随时停止与重新测试",
                "测速入口需在系统设置 → 实验性功能中手动开启后，于更多功能中使用"
            ]
        }
    }
};
// 启动器信息
const launcherInfo = {
    name: "PRE Launcher",
    version: getVersion('login'),
    internalVersion: getVersion('launcher'),    
    buildDate: "2026-10-04",
    patchDate: "2026-10-04",
    copyright: "© 2014-2026 PREAlmax, All rights reserved.",
    developer: "PREAlmax",
    fontUsage: "",
    description: "集休闲小游戏、实用组件与个性化主题于一体的网页启动器",
    license: "MIT License",
    techStack: "HTML5 / CSS3 / JavaScript",
    supportedPlatforms: "Windows / macOS / Linux / Android / iOS",
    githubRepoUrl: "https://github.com/Almax202/PRE_Launcher",
    githubDeveloperUrl: "https://github.com/Almax202"
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

function getUIStyleVersionInfo() {
    return versionInfo.components && versionInfo.components.uiSwitching || null;
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

function openGithubRepo() {
    if (typeof showLeaveConfirmModal === 'function') {
        showLeaveConfirmModal(launcherInfo.githubRepoUrl);
    } else {
        window.open(launcherInfo.githubRepoUrl, '_blank');
    }
}

function openGithubDeveloper() {
    if (typeof showLeaveConfirmModal === 'function') {
        showLeaveConfirmModal(launcherInfo.githubDeveloperUrl);
    } else {
        window.open(launcherInfo.githubDeveloperUrl, '_blank');
    }
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

/* =====================================================================
 * 网络测速组件（实验性功能）
 * ---------------------------------------------------------------------
 * 1. 组件信息注册于 versionInfo.components.networkSpeedTest
 * 2. 入口：系统设置 → 实验性功能 → 网络测速（localStorage 开关
 *    networkSpeedTestEnabled，受实验性功能总开关 experimentalFeaturesDisabled 约束）
 * 3. 开启后在登录页「更多功能」弹窗（桌面端 + 移动端）显示「网络测速」按钮
 * 4. 测速阶段：Ping → 下载 → 上传，每阶段持续不少于 10 秒（NST_PHASE_MS）
 * 5. 测速节点：Cloudflare Speed Test 公开端点（CORS 开放）
 *       GET  https://speed.cloudflare.com/__down?bytes=<字节数>
 *       POST https://speed.cloudflare.com/__up
 * ===================================================================== */
(function() {
    'use strict';

    var NST_BASE_URL = 'https://speed.cloudflare.com';
    var NST_PHASE_MS = 10000;              // 每个阶段的最短持续时间：10 秒
    var NST_PING_TIMEOUT = 5000;           // 单次 Ping 超时
    var NST_DOWN_CONCURRENCY = 4;          // 下载并行连接数
    var NST_DOWN_CHUNK = 25 * 1024 * 1024; // 单次下载 25MB
    var NST_UP_CONCURRENCY = 3;            // 上传并行连接数
    var NST_UP_CHUNK = 8 * 1024 * 1024;    // 单次上传 8MB（整块复用，不逐字节生成）
    var NST_STORAGE_KEY = 'networkSpeedTestEnabled';

    var NST_SPEED_SCALE = [10, 30, 50, 100, 200, 500, 1000]; // Mbps 量程
    var NST_PING_SCALE = [50, 100, 200, 500, 1000];          // ms 量程
    var NST_ARC_LEN = Math.PI * 105;                          // 仪表盘弧长（半径 105）

    var NST_STOP = { nstStopped: true };

    // 运行时状态
    var nstState = {
        modal: null,
        running: false,
        stopRequested: false,
        phase: null,
        timers: [],        // setTimeout / setInterval 句柄
        controllers: [],   // fetch AbortController
        xhrs: []           // 上传/回退下载用的 XMLHttpRequest
    };
    var nstUploadPayload = null; // 上传数据块只分配一次并重复使用

    /* ---------------- 开关状态 ---------------- */
    function isNetworkSpeedTestEnabled() {
        try {
            if (localStorage.getItem('experimentalFeaturesDisabled') === 'true') return false;
            return localStorage.getItem(NST_STORAGE_KEY) === 'true';
        } catch (e) {
            return false;
        }
    }

    /* ---------------- 样式注入 ---------------- */
    function nstInjectStyles() {
        if (document.getElementById('nstComponentStyle')) return;
        var style = document.createElement('style');
        style.id = 'nstComponentStyle';
        style.textContent = ''
            + '.feature-card-icon.speedtest-icon { background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); }'
            + '.custom-alert.nst-modal { z-index: 20000; }'
            + '.nst-dialog { width: 720px; max-width: calc(100vw - 32px); max-height: calc(100vh - 40px); background: #fff; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 24px 70px rgba(15, 23, 42, .28); animation: nstPop .25s ease; }'
            + '@keyframes nstPop { from { transform: translateY(18px) scale(.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }'
            + '.nst-header { display: flex; align-items: center; gap: 14px; padding: 18px 22px; border-bottom: 1px solid #eef2f7; flex-shrink: 0; }'
            + '.nst-header-icon { width: 44px; height: 44px; border-radius: 13px; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }'
            + '.nst-header h3 { margin: 0; font-size: 18px; color: #1e293b; }'
            + '.nst-header p { margin: 3px 0 0; font-size: 12.5px; color: #94a3b8; }'
            + '.nst-close { margin-left: auto; width: 36px; height: 36px; border: none; border-radius: 50%; background: #f1f5f9; color: #64748b; cursor: pointer; font-size: 15px; transition: .2s; flex-shrink: 0; }'
            + '.nst-close:hover { background: #e2e8f0; color: #334155; }'
            + '.nst-body { padding: 18px 22px 22px; overflow-y: auto; }'
            + '.nst-server-note { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12.5px; color: #64748b; background: #f1f7ff; border: 1px solid #e0edff; border-radius: 999px; padding: 7px 14px; margin-bottom: 10px; }'
            + '.nst-server-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,.18); flex-shrink: 0; }'
            + '.nst-gauge-phase { text-align: center; font-size: 14px; font-weight: 600; color: #2563eb; min-height: 20px; }'
            + '.nst-gauge-wrap { position: relative; width: 300px; max-width: 100%; margin: 0 auto; }'
            + '.nst-gauge-svg { width: 100%; display: block; }'
            + '#nstGaugeArc { transition: stroke-dashoffset .22s ease; }'
            + '#nstGaugeNeedle { transition: transform .22s ease; transform-origin: 130px 140px; transform-box: view-box; }'
            + '.nst-gauge-readout { text-align: center; line-height: 1.1; margin-top: 4px; }'
            + '.nst-gauge-num { display: block; font-size: 34px; font-weight: 700; color: #1e293b; font-variant-numeric: tabular-nums; }'
            + '.nst-gauge-unit { display: block; font-size: 12px; color: #94a3b8; letter-spacing: 1px; margin-top: 2px; }'
            + '.nst-progress { height: 6px; border-radius: 999px; background: #eef2f7; overflow: hidden; margin: 8px 6px 4px; }'
            + '.nst-progress-fill { height: 100%; width: 0; border-radius: 999px; background: linear-gradient(90deg, #0ea5e9, #2563eb); }'
            + '.nst-status-line { text-align: center; font-size: 12.5px; color: #64748b; min-height: 18px; }'
            + '.nst-phases { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 14px 0 2px; }'
            + '.nst-phase-card { border: 1.5px solid #e8eef5; border-radius: 14px; padding: 12px 8px 10px; text-align: center; background: #fafcff; transition: border-color .2s, background .2s, box-shadow .2s; }'
            + '.nst-phase-icon { width: 34px; height: 34px; border-radius: 10px; margin: 0 auto 7px; display: flex; align-items: center; justify-content: center; font-size: 15px; background: #eef4fb; color: #64748b; }'
            + '.nst-phase-name { font-size: 12.5px; color: #64748b; margin-bottom: 3px; }'
            + '.nst-phase-main { font-size: 16px; font-weight: 700; color: #1e293b; font-variant-numeric: tabular-nums; min-height: 21px; }'
            + '.nst-phase-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; min-height: 15px; }'
            + '.nst-phase-card.active { border-color: #2563eb; background: #f0f7ff; box-shadow: 0 6px 18px rgba(37,99,235,.12); }'
            + '.nst-phase-card.active .nst-phase-icon { background: #2563eb; color: #fff; }'
            + '.nst-phase-card.done { border-color: #86efac; background: #f2fcf5; }'
            + '.nst-phase-card.done .nst-phase-icon { background: #22c55e; color: #fff; }'
            + '.nst-phase-card.error { border-color: #fca5a5; background: #fef2f2; }'
            + '.nst-phase-card.error .nst-phase-icon { background: #ef4444; color: #fff; }'
            + '.nst-start-btn { width: 100%; margin-top: 16px; padding: 13px; border: none; border-radius: 13px; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: .2s; box-shadow: 0 8px 20px rgba(37,99,235,.25); }'
            + '.nst-start-btn:hover { filter: brightness(1.06); }'
            + '.nst-start-btn.running { background: linear-gradient(135deg, #f97316, #ef4444); box-shadow: 0 8px 20px rgba(239,68,68,.25); }'
            + '.nst-tips { margin-top: 12px; font-size: 12px; line-height: 1.6; color: #94a3b8; display: flex; gap: 8px; }'
            + '.nst-tips i { color: #cbd5e1; margin-top: 3px; }'
            + 'body.dark-mode .nst-dialog { background: #1e293b; }'
            + 'body.dark-mode .nst-header { border-color: #334155; }'
            + 'body.dark-mode .nst-header h3 { color: #f1f5f9; }'
            + 'body.dark-mode .nst-header p { color: #94a3b8; }'
            + 'body.dark-mode .nst-close { background: #334155; color: #cbd5e1; }'
            + 'body.dark-mode .nst-gauge-num { color: #f1f5f9; }'
            + 'body.dark-mode .nst-phase-card { background: #1e293b; border-color: #334155; }'
            + 'body.dark-mode .nst-phase-card .nst-phase-main { color: #f1f5f9; }'
            + 'body.dark-mode .nst-phase-icon { background: #334155; color: #cbd5e1; }'
            + 'body.dark-mode .nst-progress { background: #334155; }';
        document.head.appendChild(style);
    }

    /* ---------------- 工具函数 ---------------- */
    function nstSleep(ms) {
        return new Promise(function(resolve) {
            var id = setTimeout(function() {
                var i = nstState.timers.indexOf(id);
                if (i >= 0) nstState.timers.splice(i, 1);
                resolve();
            }, ms);
            nstState.timers.push(id);
        });
    }

    function nstClearTimers() {
        nstState.timers.forEach(function(id) {
            clearTimeout(id);
            clearInterval(id);
        });
        nstState.timers = [];
    }

    function nstAbortAll() {
        nstState.controllers.forEach(function(c) { try { c.abort(); } catch (e) {} });
        nstState.xhrs.forEach(function(x) { try { x.abort(); } catch (e) {} });
    }

    // 用量程数组选择不小于当前值的最小档（只增不减，避免指针来回跳）
    function nstGrowScale(value, scales, current) {
        for (var i = 0; i < scales.length; i++) {
            if (scales[i] >= value) return Math.max(current, scales[i]);
        }
        return scales[scales.length - 1];
    }

    function nstFmtSpeed(mbps) {
        if (!isFinite(mbps) || mbps < 0) mbps = 0;
        return (mbps >= 100 ? mbps.toFixed(0) : mbps.toFixed(1));
    }

    function nstFmtBytes(bytes) {
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function nstStats(samples) {
        var sum = 0, min = Infinity, max = 0, jitterSum = 0;
        for (var i = 0; i < samples.length; i++) {
            var v = samples[i];
            sum += v;
            if (v < min) min = v;
            if (v > max) max = v;
            if (i > 0) jitterSum += Math.abs(v - samples[i - 1]);
        }
        return {
            avg: sum / samples.length,
            min: min,
            max: max,
            jitter: samples.length > 1 ? jitterSum / (samples.length - 1) : 0
        };
    }

    /* ---------------- 仪表盘 ---------------- */
    function nstGaugeSVG() {
        return ''
            + '<svg viewBox="0 0 260 170" class="nst-gauge-svg" aria-hidden="true">'
            +   '<defs><linearGradient id="nstGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">'
            +     '<stop offset="0%" stop-color="#22c55e"/>'
            +     '<stop offset="55%" stop-color="#eab308"/>'
            +     '<stop offset="100%" stop-color="#ef4444"/>'
            +   '</linearGradient></defs>'
            +   '<path d="M 25 140 A 105 105 0 0 1 235 140" fill="none" stroke="#e8eef5" stroke-width="14" stroke-linecap="round"/>'
            +   '<path id="nstGaugeArc" d="M 25 140 A 105 105 0 0 1 235 140" fill="none" stroke="url(#nstGaugeGradient)" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + NST_ARC_LEN.toFixed(2) + '" stroke-dashoffset="' + NST_ARC_LEN.toFixed(2) + '"/>'
            +   '<g id="nstGaugeTicks"></g>'
            +   '<line id="nstGaugeNeedle" x1="130" y1="140" x2="130" y2="52" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>'
            +   '<circle cx="130" cy="140" r="8" fill="#1e293b"/>'
            +   '<circle cx="130" cy="140" r="3.2" fill="#fff"/>'
            + '</svg>';
    }

    function nstRenderTicks(max) {
        var g = document.getElementById('nstGaugeTicks');
        if (!g) return;
        var html = '';
        var ticks = 10;
        for (var i = 0; i <= ticks; i++) {
            var frac = i / ticks;
            var ang = Math.PI * (1 - frac); // 从左到右
            var cos = Math.cos(ang), sin = Math.sin(ang);
            var major = (i % 5 === 0);
            html += '<line x1="' + (130 + 93 * cos).toFixed(1) + '" y1="' + (140 - 93 * sin).toFixed(1)
                 + '" x2="' + (130 + 83 * cos).toFixed(1) + '" y2="' + (140 - 83 * sin).toFixed(1)
                 + '" stroke="#94a3b8" stroke-width="' + (major ? 2 : 1) + '"/>';
            if (major) {
                var label = frac === 0 ? '0' : (frac === 1 ? String(Math.round(max)) : String(Math.round(max / 2)));
                html += '<text x="' + (130 + 70 * cos).toFixed(1) + '" y="' + (140 - 70 * sin + 3.5).toFixed(1)
                     + '" text-anchor="middle" font-size="9.5" fill="#94a3b8">' + label + '</text>';
            }
        }
        g.innerHTML = html;
    }

    function nstSetGauge(value, max, bigText, unitText) {
        var pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
        var arc = document.getElementById('nstGaugeArc');
        if (arc) arc.style.strokeDashoffset = (NST_ARC_LEN * (1 - pct)).toFixed(2);
        var needle = document.getElementById('nstGaugeNeedle');
        if (needle) needle.style.transform = 'rotate(' + (-90 + pct * 180).toFixed(1) + 'deg)';
        var numEl = document.getElementById('nstGaugeNum');
        if (numEl) numEl.textContent = bigText;
        var unitEl = document.getElementById('nstGaugeUnit');
        if (unitEl) unitEl.textContent = unitText;
    }

    /* ---------------- 阶段 UI ---------------- */
    var NST_PHASE_UI = {
        ping:     { title: 'Ping 延迟', icon: 'fas fa-signal' },
        download: { title: '下载速度', icon: 'fas fa-arrow-down' },
        upload:   { title: '上传速度', icon: 'fas fa-arrow-up' }
    };

    function nstSetCard(phase, state, main, sub) {
        var card = document.getElementById('nstCard_' + phase);
        if (!card) return;
        card.classList.remove('active', 'done', 'error');
        if (state) card.classList.add(state);
        var icon = card.querySelector('.nst-phase-icon i');
        if (icon) {
            if (state === 'active') {
                icon.className = 'fas fa-circle-notch fa-spin';
            } else if (state === 'done') {
                icon.className = 'fas fa-check';
            } else if (state === 'error') {
                icon.className = 'fas fa-exclamation';
            } else {
                icon.className = NST_PHASE_UI[phase].icon;
            }
        }
        var mainEl = card.querySelector('.nst-phase-main');
        var subEl = card.querySelector('.nst-phase-sub');
        if (mainEl) mainEl.textContent = main;
        if (subEl) subEl.textContent = sub;
    }

    function nstSetPhaseLabel(text) {
        var el = document.getElementById('nstPhaseLabel');
        if (el) el.textContent = text;
    }

    function nstSetStatus(text) {
        var el = document.getElementById('nstStatusLine');
        if (el) el.textContent = text;
    }

    function nstSetProgress(p) {
        var el = document.getElementById('nstProgressFill');
        if (el) el.style.width = (Math.max(0, Math.min(1, p)) * 100).toFixed(1) + '%';
    }

    function nstResetUI(forRun) {
        nstSetProgress(0);
        nstSetCard('ping', '', '—', forRun ? '等待测试' : '—');
        nstSetCard('download', '', '—', forRun ? '等待测试' : '—');
        nstSetCard('upload', '', '—', forRun ? '等待测试' : '—');
        nstRenderTicks(100);
        nstSetGauge(0, 100, '--', forRun ? '准备中' : 'Mbps');
        nstSetPhaseLabel(forRun ? '正在准备测试…' : '准备就绪');
        nstSetStatus(forRun ? '正在连接测速节点…' : '点击下方按钮开始测试');
    }

    /* ---------------- 测速核心：Ping ---------------- */
    function nstPingOnce() {
        return new Promise(function(resolve, reject) {
            var ctrl = new AbortController();
            var finished = false;
            var timer = setTimeout(function() {
                if (finished) return;
                finished = true;
                try { ctrl.abort(); } catch (e) {}
                reject(new Error('ping timeout'));
            }, NST_PING_TIMEOUT);
            var t0 = performance.now();
            fetch(NST_BASE_URL + '/__down?bytes=0&r=' + Math.random(), {
                cache: 'no-store',
                mode: 'cors',
                signal: ctrl.signal
            }).then(function(resp) {
                if (finished) return;
                finished = true;
                clearTimeout(timer);
                if (!resp.ok) { reject(new Error('http ' + resp.status)); return; }
                resolve(performance.now() - t0);
            }).catch(function() {
                if (finished) return;
                finished = true;
                clearTimeout(timer);
                reject(new Error('ping failed'));
            });
        });
    }

    async function nstRunPingPhase() {
        nstState.phase = 'ping';
        nstSetCard('ping', 'active', '—', '采样中…');
        nstSetPhaseLabel('正在测试 Ping 延迟…（阶段 1/3）');
        nstRenderTicks(NST_PING_SCALE[0]);
        nstSetGauge(0, NST_PING_SCALE[0], '0', 'ms');

        var samples = [];
        var failures = 0;
        var maxScale = NST_PING_SCALE[0];
        var start = performance.now();

        // 连续采样直到满 10 秒（至少完成一整个 10 秒窗口）
        while (performance.now() - start < NST_PHASE_MS) {
            if (nstState.stopRequested) throw NST_STOP;
            nstSetProgress((performance.now() - start) / NST_PHASE_MS);
            try {
                var ms = await nstPingOnce();
                samples.push(ms);
                var s = nstStats(samples);
                if (s.avg > maxScale * 0.9) {
                    maxScale = nstGrowScale(s.avg, NST_PING_SCALE, maxScale);
                    nstRenderTicks(maxScale);
                }
                nstSetGauge(s.avg, maxScale, Math.round(s.avg).toString(), 'ms');
                nstSetCard('ping', 'active', Math.round(s.avg) + ' ms', '已采样 ' + samples.length + ' 次');
                nstSetStatus('Ping 采样进行中，已持续 ' + ((performance.now() - start) / 1000).toFixed(1) + ' 秒');
            } catch (e) {
                failures++;
                if (samples.length === 0 && failures >= 3) {
                    throw new Error('PING_FAILED');
                }
            }
        }

        if (samples.length === 0) throw new Error('PING_FAILED');
        nstSetProgress(1);
        var result = nstStats(samples);
        nstSetGauge(result.avg, maxScale, Math.round(result.avg).toString(), 'ms');
        return result;
    }

    /* ---------------- 测速核心：下载 ---------------- */
    async function nstDownloadWorker(shared, endAt, onFail) {
        while (!nstState.stopRequested && performance.now() < endAt) {
            var ctrl = new AbortController();
            nstState.controllers.push(ctrl);
            var removed = false;
            var cleanup = function() {
                if (!removed) {
                    removed = true;
                    var i = nstState.controllers.indexOf(ctrl);
                    if (i >= 0) nstState.controllers.splice(i, 1);
                }
            };
            try {
                var url = NST_BASE_URL + '/__down?bytes=' + NST_DOWN_CHUNK + '&r=' + Math.random();
                var resp = await fetch(url, { cache: 'no-store', mode: 'cors', signal: ctrl.signal });
                if (!resp.ok) throw new Error('http ' + resp.status);
                if (resp.body && typeof resp.body.getReader === 'function') {
                    // 优先使用流式读取统计已到达字节，不依赖 Content-Length / lengthComputable
                    var reader = resp.body.getReader();
                    while (true) {
                        var chunk = await reader.read();
                        if (chunk.done) break;
                        shared.bytes += chunk.value.length;
                        if (nstState.stopRequested || performance.now() >= endAt) {
                            try { ctrl.abort(); } catch (e) {}
                            break;
                        }
                    }
                } else {
                    await nstDownloadViaXHR(ctrl, shared);
                }
                cleanup();
            } catch (e) {
                cleanup();
                if (nstState.stopRequested || (e && e.name === 'AbortError')) return;
                onFail();
                await nstSleep(400);
            }
        }
    }

    function nstDownloadViaXHR(ctrl, shared) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            var url = NST_BASE_URL + '/__down?bytes=' + NST_DOWN_CHUNK + '&x=' + Math.random();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            var last = 0;
            var onAbort = function() { try { xhr.abort(); } catch (e) {} };
            xhr.onprogress = function(e) {
                var loaded = e.loaded || 0;
                shared.bytes += (loaded - last);
                last = loaded;
                if (nstState.stopRequested || performance.now() >= shared.endAt) onAbort();
            };
            xhr.onload = function() {
                ctrl.signal.removeEventListener('abort', onAbort);
                if (xhr.status >= 200 && xhr.status < 300) {
                    var total = xhr.response ? xhr.response.byteLength : last;
                    if (total > last) shared.bytes += (total - last);
                    resolve();
                } else {
                    reject(new Error('http ' + xhr.status));
                }
            };
            xhr.onerror = function() { ctrl.signal.removeEventListener('abort', onAbort); reject(new Error('xhr error')); };
            xhr.onabort = function() { ctrl.signal.removeEventListener('abort', onAbort); resolve(); };
            ctrl.signal.addEventListener('abort', onAbort);
            xhr.send();
        });
    }

    /* ---------------- 测速核心：上传 ---------------- */
    function nstGetUploadPayload() {
        // 只分配一次固定模式数据并在所有请求中复用，避免逐字节生成随机数卡死主线程
        if (!nstUploadPayload) nstUploadPayload = new Uint8Array(NST_UP_CHUNK);
        return nstUploadPayload;
    }

    function nstUploadOnce(shared, payload, endAt) {
        return new Promise(function(resolve) {
            var xhr = new XMLHttpRequest();
            var last = 0;
            var settled = false;
            nstState.xhrs.push(xhr);
            var done = function() {
                if (!settled) {
                    settled = true;
                    var i = nstState.xhrs.indexOf(xhr);
                    if (i >= 0) nstState.xhrs.splice(i, 1);
                }
                resolve();
            };
            xhr.open('POST', NST_BASE_URL + '/__up?r=' + Math.random());
            try { xhr.setRequestHeader('Content-Type', 'application/octet-stream'); } catch (e) {}
            xhr.upload.onprogress = function(e) {
                var loaded = e.loaded || 0;
                if (loaded > last) {
                    shared.bytes += (loaded - last);
                    last = loaded;
                }
                if (nstState.stopRequested || performance.now() >= endAt) {
                    try { xhr.abort(); } catch (e2) {}
                }
            };
            xhr.upload.onload = function() {
                if (last < payload.length) shared.bytes += (payload.length - last);
            };
            xhr.onload = done;
            xhr.onerror = done;
            xhr.onabort = done;
            xhr.ontimeout = done;
            try {
                xhr.send(payload);
            } catch (e) {
                done();
            }
        });
    }

    async function nstUploadWorker(shared, endAt) {
        var payload = nstGetUploadPayload();
        while (!nstState.stopRequested && performance.now() < endAt) {
            await nstUploadOnce(shared, payload, endAt);
            if (!nstState.stopRequested && performance.now() < endAt) await nstSleep(50);
        }
    }

    /* ---------------- 传输类阶段通用流程（下载 / 上传） ---------------- */
    function nstStartTransferSampler(shared, start, endAt, maxScale0, phase, liveMaxRef) {
        var samples = [{ t: start, b: 0 }];
        var id = setInterval(function() {
            if (nstState.stopRequested) return;
            var now = performance.now();
            samples.push({ t: now, b: shared.bytes });
            var ref = null;
            for (var i = samples.length - 1; i >= 0; i--) {
                if (now - samples[i].t >= 500) { ref = samples[i]; break; }
            }
            if (!ref) ref = samples[0];
            var dt = (now - ref.t) / 1000;
            var instant = dt > 0 ? (shared.bytes - ref.b) * 8 / dt / 1000000 : 0;
            if (instant > liveMaxRef.max * 0.92) {
                liveMaxRef.max = nstGrowScale(instant, NST_SPEED_SCALE, liveMaxRef.max);
                nstRenderTicks(liveMaxRef.max);
            }
            nstSetGauge(instant, liveMaxRef.max, nstFmtSpeed(instant), 'Mbps');
            nstSetCard(phase, 'active', nstFmtSpeed(instant) + ' Mbps', '已传输 ' + nstFmtBytes(shared.bytes));
            nstSetProgress(Math.min(1, (now - start) / NST_PHASE_MS));
            nstSetStatus((phase === 'download' ? '下载' : '上传') + '测速进行中，已持续 '
                + Math.min(NST_PHASE_MS / 1000, (now - start) / 1000).toFixed(1) + ' 秒');
        }, 200);
        nstState.timers.push(id);
        return id;
    }

    async function nstRunTransferPhase(phase) {
        var isDown = (phase === 'download');
        nstState.phase = phase;
        nstSetCard(phase, 'active', '—', '准备连接…');
        nstSetPhaseLabel(isDown ? '正在测试下载速度…（阶段 2/3）' : '正在测试上传速度…（阶段 3/3）');
        nstSetStatus(isDown ? '正在建立多条下载连接…' : '正在建立多条上传连接…');

        var liveMax = { max: NST_SPEED_SCALE[0] };
        nstRenderTicks(liveMax.max);
        nstSetGauge(0, liveMax.max, '0.0', 'Mbps');

        var shared = { bytes: 0, endAt: 0 };
        var start = performance.now();
        var endAt = start + NST_PHASE_MS;
        shared.endAt = endAt;

        var samplerId = nstStartTransferSampler(shared, start, endAt, liveMax.max, phase, liveMax);

        var workers = [];
        var concurrency = isDown ? NST_DOWN_CONCURRENCY : NST_UP_CONCURRENCY;
        for (var i = 0; i < concurrency; i++) {
            workers.push(isDown
                ? nstDownloadWorker(shared, endAt, function() {})
                : nstUploadWorker(shared, endAt));
        }

        // 每阶段至少运行满 10 秒
        while (performance.now() < endAt) {
            if (nstState.stopRequested) {
                clearInterval(samplerId);
                nstAbortAll();
                throw NST_STOP;
            }
            await nstSleep(100);
        }

        // 时间窗口结束，中止仍在传输中的请求（已到达/已发送的字节均已计入 shared.bytes）
        nstAbortAll();
        await Promise.all(workers.map(function(w) {
            return w.catch(function() {});
        }));
        clearInterval(samplerId);
        var idx = nstState.timers.indexOf(samplerId);
        if (idx >= 0) nstState.timers.splice(idx, 1);

        var elapsedSec = Math.max(NST_PHASE_MS / 1000, (performance.now() - start) / 1000);
        if (shared.bytes <= 0) throw new Error(isDown ? 'DOWNLOAD_FAILED' : 'UPLOAD_FAILED');
        var mbps = shared.bytes * 8 / (elapsedSec * 1000000);
        nstSetProgress(1);
        nstSetGauge(mbps, liveMax.max, nstFmtSpeed(mbps), 'Mbps');
        return { mbps: mbps, bytes: shared.bytes, seconds: elapsedSec };
    }

    /* ---------------- 测试编排 ---------------- */
    async function nstStartTest(btn) {
        if (nstState.running) return;
        if (!navigator.onLine && typeof navigator.onLine !== 'undefined') {
            nstSetStatus('当前处于离线状态，请检查网络连接后重试');
            return;
        }

        nstState.running = true;
        nstState.stopRequested = false;
        nstResetUI(true);
        btn.classList.add('running');
        btn.innerHTML = '<i class="fas fa-stop"></i> 停止测试';

        try {
            // 阶段 1：Ping
            var ping = await nstRunPingPhase();
            nstSetCard('ping', 'done', Math.round(ping.avg) + ' ms',
                '最小 ' + Math.round(ping.min) + ' · 抖动 ' + Math.round(ping.jitter) + ' ms');

            // 阶段 2：下载
            nstSetStatus('Ping 测试完成，即将开始下载测试…');
            await nstSleep(500);
            var down = await nstRunTransferPhase('download');
            nstSetCard('download', 'done', nstFmtSpeed(down.mbps) + ' Mbps',
                nstFmtBytes(down.bytes) + ' / ' + down.seconds.toFixed(1) + ' 秒');

            // 阶段 3：上传
            nstSetStatus('下载测试完成，即将开始上传测试…');
            await nstSleep(500);
            var up = await nstRunTransferPhase('upload');
            nstSetCard('upload', 'done', nstFmtSpeed(up.mbps) + ' Mbps',
                nstFmtBytes(up.bytes) + ' / ' + up.seconds.toFixed(1) + ' 秒');

            nstSetPhaseLabel('测速完成');
            nstSetStatus('Ping ' + Math.round(ping.avg) + ' ms · 下载 ' + nstFmtSpeed(down.mbps)
                + ' Mbps · 上传 ' + nstFmtSpeed(up.mbps) + ' Mbps');
            nstFinishButton(btn, false);
        } catch (err) {
            nstAbortAll();
            nstClearTimers();
            var stopped = err === NST_STOP || (err && err.nstStopped);
            if (stopped) {
                nstSetPhaseLabel('测试已停止');
                nstSetStatus('测试已手动停止，可点击按钮重新测试');
                if (nstState.phase) nstSetCard(nstState.phase, '', nstGetCardMain(nstState.phase), '已停止');
            } else {
                var phase = nstState.phase || 'ping';
                nstSetCard(phase, 'error', '失败', '无法连接节点');
                nstSetPhaseLabel('测速失败');
                nstSetStatus('无法连接测速节点，请检查网络连接（或浏览器扩展拦截）后重试');
            }
            nstFinishButton(btn, true);
        } finally {
            nstState.running = false;
            nstState.stopRequested = false;
        }
    }

    function nstGetCardMain(phase) {
        var card = document.getElementById('nstCard_' + phase);
        var el = card ? card.querySelector('.nst-phase-main') : null;
        return el ? el.textContent : '—';
    }

    function nstFinishButton(btn, isRetry) {
        btn.classList.remove('running');
        btn.innerHTML = '<i class="fas fa-redo"></i> ' + (isRetry ? '重新测试' : '再次测试');
    }

    function nstRequestStop(btn) {
        if (!nstState.running) return;
        nstState.stopRequested = true;
        nstAbortAll();
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> 正在停止…';
        btn.disabled = true;
        setTimeout(function() { btn.disabled = false; }, 600);
    }

    /* ---------------- 弹窗 ---------------- */
    function nstModalHTML() {
        return ''
            + '<div class="alert-content nst-dialog">'
            +   '<div class="nst-header">'
            +     '<div class="nst-header-icon"><i class="fas fa-gauge-high"></i></div>'
            +     '<div><h3>网络测速</h3><p>Ping · 下载 · 上传，每阶段持续不少于 10 秒</p></div>'
            +     '<button class="nst-close" id="nstCloseBtn" title="关闭"><i class="fas fa-times"></i></button>'
            +   '</div>'
            +   '<div class="nst-body">'
            +     '<div class="nst-server-note"><span class="nst-server-dot"></span>测速节点：Cloudflare 全球网络 · 结果仅供参考</div>'
            +     '<div class="nst-gauge-phase" id="nstPhaseLabel">准备就绪</div>'
            +     '<div class="nst-gauge-wrap">'
            +       nstGaugeSVG()
            +       '<div class="nst-gauge-readout">'
            +         '<span class="nst-gauge-num" id="nstGaugeNum">--</span>'
            +         '<span class="nst-gauge-unit" id="nstGaugeUnit">Mbps</span>'
            +       '</div>'
            +     '</div>'
            +     '<div class="nst-progress"><div class="nst-progress-fill" id="nstProgressFill"></div></div>'
            +     '<div class="nst-status-line" id="nstStatusLine">点击下方按钮开始测试</div>'
            +     '<div class="nst-phases">'
            +       '<div class="nst-phase-card" id="nstCard_ping">'
            +         '<div class="nst-phase-icon"><i class="fas fa-signal"></i></div>'
            +         '<div class="nst-phase-name">Ping 延迟</div>'
            +         '<div class="nst-phase-main">—</div>'
            +         '<div class="nst-phase-sub">—</div>'
            +       '</div>'
            +       '<div class="nst-phase-card" id="nstCard_download">'
            +         '<div class="nst-phase-icon"><i class="fas fa-arrow-down"></i></div>'
            +         '<div class="nst-phase-name">下载速度</div>'
            +         '<div class="nst-phase-main">—</div>'
            +         '<div class="nst-phase-sub">—</div>'
            +       '</div>'
            +       '<div class="nst-phase-card" id="nstCard_upload">'
            +         '<div class="nst-phase-icon"><i class="fas fa-arrow-up"></i></div>'
            +         '<div class="nst-phase-name">上传速度</div>'
            +         '<div class="nst-phase-main">—</div>'
            +         '<div class="nst-phase-sub">—</div>'
            +       '</div>'
            +     '</div>'
            +     '<button class="nst-start-btn" id="nstStartBtn"><i class="fas fa-play"></i> 开始测试</button>'
            +     '<div class="nst-tips"><i class="fas fa-info-circle"></i><span>测速将消耗一定网络流量，建议在 Wi-Fi 环境下进行；测速期间请避免下载、在线视频等大流量任务，以提高数据准确性。</span></div>'
            +   '</div>'
            + '</div>';
    }

    function openNetworkSpeedTestModal() {
        nstInjectStyles();

        var existing = document.getElementById('networkSpeedTestModal');
        if (existing) {
            nstState.stopRequested = true;
            nstAbortAll();
            existing.remove();
        }

        var modal = document.createElement('div');
        modal.id = 'networkSpeedTestModal';
        modal.className = 'custom-alert nst-modal';
        modal.innerHTML = nstModalHTML();
        document.body.appendChild(modal);
        nstState.modal = modal;

        var startBtn = modal.querySelector('#nstStartBtn');
        var closeBtn = modal.querySelector('#nstCloseBtn');

        nstResetUI(false);

        startBtn.addEventListener('click', function() {
            if (nstState.running) {
                nstRequestStop(startBtn);
            } else {
                nstStartTest(startBtn);
            }
        });

        var closeModal = function() {
            nstState.stopRequested = true;
            nstAbortAll();
            nstClearTimers();
            nstState.running = false;
            modal.classList.remove('show');
            setTimeout(function() {
                if (modal.parentNode) modal.parentNode.removeChild(modal);
                if (nstState.modal === modal) nstState.modal = null;
            }, 250);
        };
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });

        modal.style.display = 'flex';
        modal.style.zIndex = '20000';
        setTimeout(function() { modal.classList.add('show'); }, 10);
    }

    // 暴露到全局，供 index.html / 系统设置页调用
    window.openNetworkSpeedTestModal = openNetworkSpeedTestModal;
    window.isNetworkSpeedTestEnabled = isNetworkSpeedTestEnabled;

    // 样式尽早注入（defer 脚本执行时 head 已存在）
    if (document.head) {
        nstInjectStyles();
    } else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', nstInjectStyles);
    } else {
        nstInjectStyles();
    }
})();
