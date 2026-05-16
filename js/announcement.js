// 开发者公告数据
// 语法使用：
// {
//     id: "公告ID",
//     title: "公告标题",
//     date: "发布日期",
//     tag: "标签",                 // tag标签使用:   important 重要公告; normal 普通公告; update 更新公告; notice 通知
//     tagText: "标签文本",
//     author: "作者",
//     images: ["图片路径1", "图片路径2"],
//     content: ["段落1", "段落2", ...]
// }
const announcementData = {
    // 重要公告
    importantAnnouncements: [
        {
            id: "importantA-20260430",
            title: "启动器重大更新通知",
            date: "2026-04-30",
            tag: "important",
            tagText: "重要公告",
            author: "GPY Games Studio - PREAlmax",
            images: [],
            content: [
                "尊敬的用户，我们很高兴地宣布，PRE Launcher 将迎来一次重大更新！",
                "本次更新将带来以下新功能：",
                "[color:#667eea]• 新增开发者公告系统，第一时间获取最新消息[/color]",
                "同时，我们也正在筹备将整个项目接入后端服务器，以提供更稳定的服务和更好的用户体验。",
                "因为整个项目只是个人的一个小项目，所以目前仅有一个人正在开发，能力与精力非常有限，这些均为构想中功能，仅供参考，实际更新日期不定。",
                "我们也在努力优化启动器的性能和稳定性，以及修复一些莫名其妙的bug，确保用户在使用过程中不会遇到任何问题。",
                "感谢您的理解和支持！",
                "我们会在更新完成后，及时通知您。",
                "[color:black]© 2014-2026 GPY Games Studio. All rights reserved.[/color]"
            ]
        },
    ],
    // 普通公告
    normalAnnouncements: [
        
    ],
    // 开发日志
    devLogs: [
        {
            id: "devlog-20260516",
            title: "RC 2.6.2.2 开发日志",
            date: "2026-05-16",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.2.2 版本更新，主要带来了暗色模式体验优化、未登录状态处理改进和多语言翻译完善！",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 暗色模式提示弹窗：暗色模式下通用提示弹窗改为暗色主题，与整体界面风格保持一致",
                "• 未登录状态按钮禁用：未登录时禁用进入账户设置、退出登录和名片按钮，显示为淡灰色不可点击状态",
                "• 名片按钮位置调整：将名片按钮移动到更多操作弹窗的进入账户设置按钮右侧",
                "• 账户设置返回按钮：账户设置页面左下角新增返回按钮，点击后可智能返回上一级页面",
                "• 开发者模式菜单优化：开发者模式下在\"核心条款\"下新增\"开发测试\"类别，将测试页面按钮从底部移至侧边栏菜单中",
                "• 解绑验证码优化：账户设置页面的解绑功能验证码改为使用图片验证码API，与登录页保持一致，提升用户体验",
                "• dummyimage版权声明：关于启动器弹窗中新增dummyimage按钮，点击显示Russell Heimlich的完整版权声明",
                "• 外部链接安全提示：点击任何外部链接时弹出安全确认弹窗，显示跳转目标地址，保护用户账号安全",
                "[color:#95e1d3]【多语言支持】[/color]",
                "• 登录页翻译完善：登录页所有文本现已支持中文、英文、日语、韩语四种语言切换",
                "• 新增翻译键：在 lang.js 中新增22个翻译键，覆盖提示模态框、PIN验证、安全验证、主题更新、更多操作/功能弹窗等",
                "• 模态框翻译支持：完善所有登录页模态框的翻译支持，包括提示、确认、倒计时等文本",
                "• 版本历史翻译：版本更新记录侧边栏和小游戏名称等文本也已支持多语言",
                "[color:#667eea]【代码优化】[/color]",
                "• 将OPPO Sans字体版权说明从versionManager.js移动到index.html中，优化代码结构",
                "[color:black]© 2014-2026 GPY Games Studio. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260515",
            title: "RC 2.6.2.1 开发日志",
            date: "2026-05-15",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.2.1 版本更新，主要带来了弹窗界面的优化和功能按钮的改进！",
                "[color:#667eea]【新增功能】[/color]",
                "• 更多操作弹窗：个人卡片中的退出登录按钮改为\"更多操作\"按钮，点击后弹出包含账户设置和退出登录的窗口",
                "• 更多功能弹窗：点击展开更多功能按钮改为弹出窗口形式，包含关于启动器、名片、隐藏UI、调整UI比例四个功能",
                "• UI比例调整弹窗：重新设计UI比例调整功能，使用滑动条进行调整，更加直观便捷",
                "• 全部展开按钮：在版本更新记录中新增\"全部展开\"按钮，点击后可展开所有更新记录",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 弹窗按钮布局：统一弹窗按钮样式为网格布局，图标在上文字在下，更加美观整齐",
                "• 个人卡片优化：个人卡片及其悬浮卡改为不可点击，仅显示用户信息，避免误操作",
                "• 悬浮气泡位置：调整更多操作按钮和展开更多功能按钮的悬浮气泡从左侧显示",
                "• 按钮样式统一：更多操作弹窗和更多功能弹窗使用相同的按钮样式，视觉风格一致",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复调整UI比例按钮点击后没有反应的问题",
                "[color:black]© 2014-2026 GPY Games Studio. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260513",
            title: "RC 2.6.2.0 开发日志",
            date: "2026-05-13",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.2.0 版本更新，主要带来了账户安全验证功能的全面升级和快速登录功能的优化！",
                "[color:#667eea]【新增功能】[/color]",
                "• 启用登录PIN验证功能：在账户设置页安全设置中新增该选项，启用后登录时输入密码还需进行两步验证",
                "• 安全验证功能：点击用户卡片或用户信息卡片跳转账户设置时，需先通过安全验证（输入密码或使用PIN码）",
                "• 今日不再验证：安全验证和PIN验证弹窗新增该选项，勾选后当日不再弹出验证窗口，退出登录后失效",
                "• PIN验证弹窗：登录时启用PIN验证功能后，密码验证通过后弹出PIN验证弹窗，带有详细提示信息",
                "• 快速登录模式：将\"记住我\"功能更名为\"快速登录\"，启用后下次登录仅显示用户名和登录按钮，点击即可直接进入游戏大厅",
                "• 快速登录标签：快速登录模式下在用户名输入框右侧显示绿色\"快速登录模式\"标签，让用户一目了然",
                "• 功能说明弹窗：勾选\"快速登录\"或\"自动登录\"时弹出功能说明窗口，详细说明功能用途和安全注意事项",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 安全验证弹窗：新增详细提示信息、图标和副标题，优化界面设计，提升用户体验",
                "• 提示框优先级：调整提示框z-index，确保提示框显示在其他弹窗上方",
                "• 注册页面优化：改为全屏样式，取消卡片显示，内容居中，返回按钮固定在底部",
                "• 快速登录按钮样式：快速登录模式下按钮显示为正常粉色渐变样式，而非灰色禁用状态",
                "• 用户名修改检测：修改用户名时自动退出快速登录模式并重新显示验证码，\"记住我\"功能失效",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复登录PIN验证通过后错误跳转到账户设置页面的问题",
                "• 修复点击用户卡片后直接跳转而非弹出验证弹窗的问题",
                "• 修复快速登录模式下取消按钮样式不正确的问题",
                "• 登录PIN验证：优化登录PIN验证逻辑，修复验证通过后错误跳转到账户设置页面的问题",
                "[color:#ff6b6b]【技术细节】[/color]",
                "• 使用localStorage存储\"今日不再验证\"标记，过期时间设置为当天24:00",
                "• 安全验证支持密码和PIN码两种验证方式，可根据账户设置灵活切换",
                "• 退出登录时自动清除\"今日不再验证\"标记，确保安全验证有效性",
                "[color:black]© 2014-2026 GPY Games Studio. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260511",
            title: "RC 2.6.1.4 开发日志",
            date: "2026-05-11",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.1.4 版本更新，主要带来了小游戏相关功能的优化和修复！",
                "[color:#667eea]【新增功能】[/color]",
                "• 小游戏更新记录：登录页版本更新记录窗口的LIST栏添加\"小游戏更新记录\"按钮，点击后显示所有小游戏的子选项，方便用户查看各小游戏的版本更新信息",
                "• 版本号统一管理：在 versionManager.js 中添加了记忆卡牌和颜色匹配小游戏的版本号，实现所有小游戏版本号的统一管理，便于后续维护",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 飞行器游戏样式重构：将飞行器小游戏页面样式彻底重构，采用与点击方块小游戏相同的设计风格，包括左侧边栏导航和右侧主内容区布局，提升整体视觉一致性",
                "• 子按钮交互优化：修复点击其他按钮后小游戏按钮不会自动收回的问题，确保按钮状态正确切换",
                "• 版本号调用优化：修复贪吃蛇和飞行器小游戏版本号未正确调用版本管理文件的问题，确保版本号正确显示",
                "• 页面布局优化：修复飞行器游戏页面顶部导航栏和右侧显示区域样式不正确的问题，确保布局正确显示",
                "[color:#ff6b6b]【技术细节】[/color]",
                "• 重构了 fxqgame.html 页面结构，采用与 fkgame.html 相同的布局模式",
                "• 创建了 fxqgame.css 文件，包含完整的游戏样式定义",
                "• 更新了 versionManager.js，添加 memorygame 和 colormatchgame 的版本号配置",
                "[color:black]© 2014-2026 GPY Games Studio. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260508",
            title: "RC 2.6.1.3 开发日志",
            date: "2026-05-08",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.1.3 版本更新，主要带来了离线模式功能的全面升级！",
                "[color:#667eea]【新增功能】[/color]",
                "• 离线模式：登录页侧边栏新增离线模式功能，支持在无网络环境下使用启动器",
                "• 离线模式标签：登录页和账户设置页左上角显示离线模式状态标签",
                "• 网络状态检测：自动检测网络连接状态变化，智能提示用户切换模式",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 离线模式限制：离线模式下自动禁用账户信息修改、安全设置、成就系统、设备管理、数据管理等需要网络的功能",
                "• 验证码优化：离线模式下自动切换为本地生成验证码，正常模式下通过API获取",
                "• 用户体验：网络恢复时自动提示用户是否重新上线",
                "[color:#ff6b6b]【技术细节】[/color]",
                "• 实现了基于 localStorage 的离线模式状态管理",
                "• 添加了 navigator.onLine 事件监听，实现网络状态实时检测",
                "• 优化了验证码生成逻辑，支持在线/离线双模式",
                "[color:black]© 2014-2026 GPY Games Studio. All rights reserved.[/color]"
            ]
        }
    ]
};

// 初始化公告侧边栏导航
function initializeAnnouncementNavigation() {
    var navItems = document.querySelectorAll('#announcementModal .terms-nav-item');
    
    navItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            // 阻止事件冒泡
            e.stopPropagation();
            
            // 移除所有active状态
            navItems.forEach(function(nav) {
                nav.classList.remove('active');
            });
            
            // 添加当前active状态
            this.classList.add('active');
            
            // 隐藏所有子按钮
            var allSubButtons = document.querySelectorAll('#announcementModal .sub-buttons');
            allSubButtons.forEach(function(sub) {
                sub.style.display = 'none';
            });
            
            // 显示当前项的子按钮（如果有）
            var subButtons = this.querySelector('.sub-buttons');
            if (subButtons) {
                subButtons.style.display = subButtons.style.display === 'none' ? 'block' : 'none';
            }
            
            // 根据点击的导航项加载对应内容
            var navId = this.id;
            loadAnnouncementContent(navId);
        });
    });
    
    // 为子按钮添加点击事件
    var subButtons = document.querySelectorAll('#announcementModal .sub-button');
    subButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 隐藏所有"查看中"tag
            var allViewingTags = document.querySelectorAll('#announcementModal .viewing-tag');
            allViewingTags.forEach(function(tag) {
                tag.style.display = 'none';
            });
            
            // 显示当前按钮的"查看中"tag
            var viewingTag = this.querySelector('.viewing-tag');
            if (viewingTag) {
                viewingTag.style.display = 'inline-block';
            }
            
            var type = this.getAttribute('data-type');
            loadAnnouncementByType(type);
        });
    });
}

// 根据导航ID加载公告内容
function loadAnnouncementContent(navId) {
    var contentArea = document.querySelector('#announcementModal .terms-content');
    if (!contentArea) return;
    
    switch(navId) {
        case 'importantNav':
            loadAnnouncementList(announcementData.importantAnnouncements);
            break;
        case 'normalNav':
            loadAnnouncementList(announcementData.normalAnnouncements);
            break;
        case 'devLogNav':
            loadAnnouncementList(announcementData.devLogs);
            break;
        default:
            contentArea.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
                    <div style="font-size: 48px; margin-bottom: 20px; color: #d45d79;">
                        <i class="fas fa-newspaper"></i>
                    </div>
                    <p style="font-style: normal; text-align: center; padding: 0; margin: 0;">请选择要查看的公告分类</p>
                </div>
            `;
    }
}

// 根据类型加载公告
function loadAnnouncementByType(type) {
    var data;
    switch(type) {
        case 'important':
            data = announcementData.importantAnnouncements;
            break;
        case 'normal':
            data = announcementData.normalAnnouncements;
            break;
        case 'dev':
            data = announcementData.devLogs;
            break;
        default:
            data = [];
    }
    loadAnnouncementList(data);
}

// 加载公告列表
function loadAnnouncementList(announcements) {
    var contentArea = document.querySelector('#announcementModal .terms-content');
    if (!contentArea) return;
    
    contentArea.innerHTML = '';
    
    if (announcements.length === 0) {
        contentArea.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
                <div style="font-size: 48px; margin-bottom: 20px; color: #999;">
                    <i class="fas fa-inbox"></i>
                </div>
                <p style="font-style: normal; text-align: center; padding: 0; margin: 0; color: #999;">暂无公告</p>
            </div>
        `;
        return;
    }
    
    announcements.forEach(function(announcement) {
        var announcementElement = document.createElement('div');
        announcementElement.className = 'announcement-item';
        
        var announcementHTML = `
            <div class="announcement-header">
                <h3 class="announcement-title">${announcement.title}</h3>
                <div class="announcement-meta">
                    ${announcement.tag ? `<span class="announcement-tag ${announcement.tag}">${announcement.tagText}</span>` : ''}
                    <span class="announcement-date"><i class="fas fa-calendar"></i> ${announcement.date}</span>
                    <span class="announcement-author"><i class="fas fa-user"></i> ${announcement.author}</span>
                    <span class="announcement-id">ID: ${announcement.id}</span>
                </div>
            </div>
            <div class="announcement-content">
        `;
        
        // 添加公告图片
        if (announcement.images && announcement.images.length > 0) {
            var isSingleImage = announcement.images.length === 1;
            announcementHTML += `
                <div class="announcement-images ${isSingleImage ? 'single-image' : ''}">
            `;
            announcement.images.forEach(function(image) {
                announcementHTML += `
                    <div class="image-container ${isSingleImage ? 'single-image-container' : ''}">
                        <img src="${image}" alt="公告图片" class="announcement-image ${isSingleImage ? 'single-image-item' : ''}" draggable="false">
                        <div class="image-tooltip">点击查看大图</div>
                    </div>
                `;
            });
            announcementHTML += `
                </div>
            `;
        }
        
        // 添加公告内容
        announcement.content.forEach(function(paragraph) {
            // 解析颜色格式 [color:颜色]文本[/color]
            let formattedParagraph = paragraph;
            const colorRegex = /\[color:([^\]]+)\]([^\[]+)\[\/color\]/g;
            formattedParagraph = formattedParagraph.replace(colorRegex, '<span style="color: $1;">$2</span>');
            
            announcementHTML += `
                <p>${formattedParagraph}</p>
            `;
        });
        
        announcementHTML += `
            </div>
        `;
        
        announcementElement.innerHTML = announcementHTML;
        contentArea.appendChild(announcementElement);
    });
    
    // 为图片添加点击事件
    initAnnouncementImageClick();
}

// 为公告图片添加点击事件
function initAnnouncementImageClick() {
    var images = document.querySelectorAll('.announcement-image');
    images.forEach(function(image) {
        image.addEventListener('click', function() {
            openImageViewer(this.src);
        });
    });
}

// 打开图片查看器
function openImageViewer(imageSrc) {
    var imageViewerModal = document.getElementById('announcementImageViewer');
    if (!imageViewerModal) {
        createImageViewer();
        imageViewerModal = document.getElementById('announcementImageViewer');
    }
    
    var viewerImage = document.getElementById('announcementViewerImage');
    if (viewerImage) {
        viewerImage.src = imageSrc;
    }
    
    imageViewerModal.style.display = 'flex';
    setTimeout(function() {
        imageViewerModal.classList.add('show');
    }, 10);
}

// 创建图片查看器
function createImageViewer() {
    var imageViewerModal = document.createElement('div');
    imageViewerModal.id = 'announcementImageViewer';
    imageViewerModal.className = 'custom-alert';
    imageViewerModal.style.display = 'none';
    imageViewerModal.innerHTML = `
        <div class="alert-content image-viewer-content">
            <div class="alert-icon">
                <i class="fas fa-image"></i>
            </div>
            <h3>图片查看器</h3>
            <div class="image-viewer-container" id="announcementImageViewerContainer">
                <img id="announcementViewerImage" src="" alt="查看图片" draggable="false">
            </div>
            <div class="terms-modal-buttons">
                <button class="viewer-btn" id="announcementZoomInBtn"><i class="fas fa-search-plus"></i> 放大</button>
                <button class="viewer-btn" id="announcementZoomOutBtn"><i class="fas fa-search-minus"></i> 缩小</button>
                <button class="viewer-btn" id="announcementResetZoomBtn"><i class="fas fa-sync-alt"></i> 重置</button>
                <button class="alert-confirm" id="closeAnnouncementImageViewer">关闭</button>
            </div>
        </div>
    `;
    document.body.appendChild(imageViewerModal);
    
    // 初始化图片查看器交互
    initImageViewerInteraction('announcement');
}

// 初始化图片查看器交互
function initImageViewerInteraction(prefix) {
    var currentZoom = 1;
    var currentX = 0;
    var currentY = 0;
    var isDragging = false;
    var startX = 0;
    var startY = 0;
    
    var viewerImage = document.getElementById(prefix + 'ViewerImage');
    var imageContainer = document.getElementById(prefix + 'ImageViewerContainer');
    var imageViewerModal = document.getElementById(prefix + 'ImageViewer');
    
    if (!viewerImage || !imageContainer || !imageViewerModal) return;
    
    // 设置图片样式
    viewerImage.style.position = 'relative';
    viewerImage.style.transformOrigin = 'center center';
    viewerImage.style.cursor = 'grab';
    
    // 关闭图片查看器
    document.getElementById('close' + capitalizeFirstLetter(prefix) + 'ImageViewer').addEventListener('click', function() {
        imageViewerModal.classList.remove('show');
        setTimeout(function() {
            imageViewerModal.style.display = 'none';
            resetViewer();
        }, 300);
    });
    
    // 放大图片
    document.getElementById(prefix + 'ZoomInBtn').addEventListener('click', function() {
        zoomImage(0.1);
    });
    
    // 缩小图片
    document.getElementById(prefix + 'ZoomOutBtn').addEventListener('click', function() {
        zoomImage(-0.1);
    });
    
    // 重置缩放
    document.getElementById(prefix + 'ResetZoomBtn').addEventListener('click', function() {
        resetViewer();
    });
    
    // 鼠标滚轮放大缩小
    imageContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomImage(delta);
    });
    
    // 鼠标拖拽开始
    viewerImage.addEventListener('mousedown', function(e) {
        if (currentZoom <= 1) return;
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        viewerImage.style.cursor = 'grabbing';
    });
    
    // 鼠标拖拽移动
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        updateImagePosition();
    });
    
    // 鼠标拖拽结束
    function endDrag() {
        isDragging = false;
        viewerImage.style.cursor = currentZoom > 1 ? 'grab' : 'default';
    }
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('mouseleave', endDrag);
    window.addEventListener('mouseout', endDrag);
    window.addEventListener('blur', endDrag);
    imageContainer.addEventListener('mouseleave', endDrag);
    
    // 缩放图片
    function zoomImage(delta) {
        var newZoom = currentZoom + delta;
        if (newZoom > 0.1 && newZoom < 5) {
            currentZoom = newZoom;
            viewerImage.style.cursor = currentZoom > 1 ? 'grab' : 'default';
            updateImagePosition();
        }
    }
    
    // 更新图片位置
    function updateImagePosition() {
        viewerImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
        keepImageInBounds();
    }
    
    // 确保图片保持在窗口内
    function keepImageInBounds() {
        var containerRect = imageContainer.getBoundingClientRect();
        var imageRect = viewerImage.getBoundingClientRect();
        
        if (imageRect.width * currentZoom <= containerRect.width) {
            currentX = (containerRect.width - imageRect.width * currentZoom) / 2;
        } else {
            if (currentX > 0) currentX = 0;
            if (currentX < containerRect.width - imageRect.width * currentZoom) {
                currentX = containerRect.width - imageRect.width * currentZoom;
            }
        }
        
        if (imageRect.height * currentZoom <= containerRect.height) {
            currentY = (containerRect.height - imageRect.height * currentZoom) / 2;
        } else {
            if (currentY > 0) currentY = 0;
            if (currentY < containerRect.height - imageRect.height * currentZoom) {
                currentY = containerRect.height - imageRect.height * currentZoom;
            }
        }
        
        viewerImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
    }
    
    // 重置查看器
    function resetViewer() {
        currentZoom = 1;
        currentX = 0;
        currentY = 0;
        viewerImage.style.transform = 'translate(0, 0) scale(1)';
        viewerImage.style.cursor = 'default';
    }
}

// 首字母大写
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// 生成公告模态框
function generateAnnouncementModal() {
    var modal = document.createElement('div');
    modal.id = 'announcementModal';
    modal.className = 'custom-alert';
    modal.style.display = 'none';
    
    modal.innerHTML = `
        <div class="alert-content terms-modal-content announcement-modal-content">
            <div class="header-container">
                <div class="alert-icon">
                    <i class="fas fa-newspaper"></i>
                </div>
                <h3>开发者公告</h3>
            </div>
            <div class="terms-layout">
                <div class="terms-sidebar" id="announcementSidebar">
                    <div class="terms-nav-header">
                        <div class="terms-nav-title">公告分类</div>
                        <button class="toggle-sidebar-btn" id="toggleAnnouncementSidebarBtn">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="terms-nav-item active" id="importantNav">
                        <div class="nav-item-content">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>重要公告<ul>Important</ul></span>
                        </div>
                    </div>
                    <div class="terms-nav-item" id="normalNav">
                        <div class="nav-item-content">
                            <i class="fas fa-info-circle"></i>
                            <span>普通公告<ul>Announcements</ul></span>
                        </div>
                    </div>
                    <div class="terms-nav-item" id="devLogNav">
                        <div class="nav-item-content">
                            <i class="fas fa-code"></i>
                            <span>开发日志<ul>Dev Logs</ul></span>
                        </div>
                    </div>
                </div>
                <div class="terms-main">
                    <div class="terms-content" id="announcementContent">
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
                            <div style="font-size: 48px; margin-bottom: 20px; color: #d45d79;">
                                <i class="fas fa-newspaper"></i>
                            </div>
                            <p style="font-style: normal; text-align: center; padding: 0; margin: 0;">欢迎查看开发者公告</p>
                            <p style="font-style: normal; text-align: center; padding: 0; margin: 10px 0 0; color: #999; font-size: 14px;">选择左侧分类查看详细内容</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="terms-modal-buttons">
                <button class="alert-confirm" id="closeAnnouncementModal">关闭</button>
            </div>
            <div class="back-to-top-container">
                <button class="back-to-top-btn" id="announcementBackToTopBtn" title="返回顶部">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <div class="back-to-top-tooltip">返回顶部</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加关闭按钮事件
    document.getElementById('closeAnnouncementModal').addEventListener('click', function() {
        closeAnnouncementModal();
    });
    
    // 添加返回顶部按钮事件
    document.getElementById('announcementBackToTopBtn').addEventListener('click', function() {
        var contentArea = document.querySelector('#announcementModal .terms-content');
        if (contentArea) {
            contentArea.scrollTop = 0;
        }
    });
    
    // 添加侧边栏切换按钮事件
    document.getElementById('toggleAnnouncementSidebarBtn').addEventListener('click', function() {
        var sidebar = document.getElementById('announcementSidebar');
        var layout = document.querySelector('#announcementModal .terms-layout');
        if (sidebar && layout) {
            sidebar.classList.toggle('collapsed');
            layout.classList.toggle('collapsed');
            
            var icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = sidebar.classList.contains('collapsed') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }
    });
    
    // 初始化导航
    initializeAnnouncementNavigation();
}

// 显示公告模态框
function showAnnouncementModal() {
    // 检查网络连接
    if (!navigator.onLine) {
        showAlert('无网络连接，请检查网络设置');
        return;
    }
    
    var modal = document.getElementById('announcementModal');
    if (!modal) {
        generateAnnouncementModal();
        modal = document.getElementById('announcementModal');
    }
    
    modal.style.display = 'flex';
    setTimeout(function() {
        modal.classList.add('show');
    }, 10);
    
    // 默认加载重要公告
    var importantNav = document.getElementById('importantNav');
    if (importantNav) {
        importantNav.click();
    }
}

// 关闭公告模态框
function closeAnnouncementModal() {
    var modal = document.getElementById('announcementModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 为开发者公告按钮添加点击事件
    var announcementBtn = document.getElementById('sidebarAnnouncement');
    if (announcementBtn) {
        announcementBtn.addEventListener('click', function() {
            showAnnouncementModal();
        });
    }
});