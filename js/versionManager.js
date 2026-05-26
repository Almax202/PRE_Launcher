// 版本管理文件，统一管理所有页面的版本号
const versionInfo = {
    // 登录页版本号
    login: "RC 2.6.2.5 (b4)",

    // 游戏大厅版本号
    homepage: "RC 1.0.3.3 (a2)",

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
    launcher: "20260526.2625.b4.74"
};
// 启动器信息
const launcherInfo = {
    name: "PRE Launcher",
    version: getVersion('login'),
    internalVersion: getVersion('launcher'),
    buildDate: "2026-05-26",
    patchDate: "2026-05-26",
    copyright: "© 2014-2026 GPY Games Studio",
    developer: "GPY Games Studio",
    purpose: "",
    fontUsage: ""
};

// 获取版本号的函数
function getVersion(page) {
    return versionInfo[page] || "获取失败，重定向错误";
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
