// 本地存储键名
const STORAGE_KEYS = {
    LAST_VIEWED_ANNOUNCEMENT_DATE: 'last_viewed_announcement_date',
    VIEWED_ANNOUNCEMENT_IDS: 'viewed_announcement_ids'
};

// 获取所有公告的最新日期
function getLatestAnnouncementDate() {
    let latestDate = null;
    
    // 检查重要公告
    if (announcementData.importantAnnouncements.length > 0) {
        announcementData.importantAnnouncements.forEach(ann => {
            if (!latestDate || new Date(ann.date) > new Date(latestDate)) {
                latestDate = ann.date;
            }
        });
    }
    
    // 检查普通公告
    if (announcementData.normalAnnouncements.length > 0) {
        announcementData.normalAnnouncements.forEach(ann => {
            if (!latestDate || new Date(ann.date) > new Date(latestDate)) {
                latestDate = ann.date;
            }
        });
    }
    
    // 检查开发日志
    if (announcementData.devLogs.length > 0) {
        announcementData.devLogs.forEach(ann => {
            if (!latestDate || new Date(ann.date) > new Date(latestDate)) {
                latestDate = ann.date;
            }
        });
    }
    
    return latestDate;
}

// 检查是否有新公告
function hasNewAnnouncements() {
    const lastViewedDate = localStorage.getItem(STORAGE_KEYS.LAST_VIEWED_ANNOUNCEMENT_DATE);
    const latestDate = getLatestAnnouncementDate();
    
    if (!lastViewedDate || !latestDate) {
        return false;
    }
    
    return new Date(latestDate) > new Date(lastViewedDate);
}

// 更新最后查看日期
function updateLastViewedAnnouncementDate() {
    const latestDate = getLatestAnnouncementDate();
    if (latestDate) {
        localStorage.setItem(STORAGE_KEYS.LAST_VIEWED_ANNOUNCEMENT_DATE, latestDate);
    }
}

// 获取已查看的公告ID列表
function getViewedAnnouncementIds() {
    const stored = localStorage.getItem(STORAGE_KEYS.VIEWED_ANNOUNCEMENT_IDS);
    return stored ? JSON.parse(stored) : [];
}

// 标记公告为已查看
function markAnnouncementAsViewed(announcementId) {
    const viewedIds = getViewedAnnouncementIds();
    if (!viewedIds.includes(announcementId)) {
        viewedIds.push(announcementId);
        localStorage.setItem(STORAGE_KEYS.VIEWED_ANNOUNCEMENT_IDS, JSON.stringify(viewedIds));
    }
}

// 检查公告是否已查看
function isAnnouncementViewed(announcementId) {
    return getViewedAnnouncementIds().includes(announcementId);
}

// 获取未查看公告数量
function getUnviewedAnnouncementCount() {
    let count = 0;
    console.log('[DEBUG] getUnviewedAnnouncementCount called');
    console.log('[DEBUG] announcementData exists:', typeof announcementData !== 'undefined');
    if (typeof announcementData !== 'undefined') {
        // 检查所有公告分类
        ['importantAnnouncements', 'normalAnnouncements', 'devLogs'].forEach(function(category) {
            if (announcementData[category] && announcementData[category].length > 0) {
                console.log('[DEBUG] Category:', category, 'Count:', announcementData[category].length);
                announcementData[category].forEach(function(announcement) {
                    var viewed = isAnnouncementViewed(announcement.id);
                    console.log('[DEBUG] Announcement:', announcement.id, 'Viewed:', viewed);
                    if (!viewed) {
                        count++;
                    }
                });
            }
        });
    } else {
        console.log('[DEBUG] announcementData not available');
    }
    console.log('[DEBUG] Unviewed announcement count:', count);
    return count;
}

// 更新公告红点显示
function updateAnnouncementNotificationDot() {
    const dot = document.getElementById('announcementNotificationDot');
    if (dot) {
        const count = getUnviewedAnnouncementCount();
        if (count > 0) {
            dot.style.display = 'block';
        } else {
            dot.style.display = 'none';
        }
    }
}

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
            id: "importantA-20260603",
            title: "RC 3.0 版本开发预告与计划调整",
            date: "2026-06-03",
            tag: "important",
            tagText: "重要公告",
            author: "GPY Games Studio - PREAlmax",
            images: [],
            content: [
                "尊敬的用户，感谢您一直以来对 PRE Launcher 的支持与关注！",
                "",
                "[color:#667eea]【RC 3.0.0 版本预告 - 预计 Q2 第二季度初发布】[/color]",
                "我们很高兴地宣布，PRE Launcher RC 3.0.0 版本的开发工作已经正式启动！",
                "作为启动器的重大版本更新，RC 3.0.0 将带来全新的界面设计、更流畅的交互体验，以及丰富的新功能。",
                "",
                "[color:#4ecdc4]【近期开发重点】[/color]",
                "[color:#4ecdc4]• 移动端适配全面优化[/color]",
                "随着移动端设备的普及，我们正在集中精力完善移动端的用户体验。包括：",
                "  - 响应式布局优化，适配各种屏幕尺寸",
                "  - 触摸交互优化，提升操作流畅度",
                "  - 移动端专属功能，提供更便捷的使用体验",
                "  - 性能优化，确保在移动设备上运行流畅",
                "",
                "[color:#4ecdc4]• 老旧代码重构[/color]",
                "为了提升代码质量和可维护性，我们正在对启动器早期遗留的部分代码进行重构：",
                "  - 统一代码风格，提升代码可读性",
                "  - 提取公共模块，减少代码冗余",
                "  - 优化性能瓶颈，提升运行效率",
                "  - 修复潜在的兼容性问题",
                "",
                "[color:#4ecdc4]• 新功能与小游戏[/color]",
                "在 RC 3.0.0 版本中，我们计划加入更多有趣的新功能和小游戏：",
                "  - 更多个性化设置选项",
                "  - 新的百宝箱小游戏",
                "  - 更丰富的互动功能",
                "  - 以及更多内容...",
                "",
                "[color:#ff6b6b]【开发计划调整说明】[/color]",
                "经过慎重考虑，我们决定将后端服务器搭建的工作暂时延后。",
                "作为一个个人项目，开发能力和资源有限。为了确保前端体验的质量和功能的完善，",
                "我们决定先集中精力打磨前端功能，待时机成熟后再逐步推进后端的搭建工作。",
                "这意味着：",
                "  - 近期版本仍将以本地存储为主",
                "  - 将继续优化本地数据的备份与恢复功能",
                "",
                "[color:#ffd93d]【关于开发进度】[/color]",
                "PRE Launcher 目前仅有一人进行开发，开发进度可能会受到各种因素影响（或跳票）。",
                "我们承诺会尽最大努力完成开发工作，但具体发布日期仍需根据实际开发情况调整。",
                "请持续关注我们的开发者公告，我们会第一时间向大家通报最新进展！",
                "",
                "[color:#667eea]【感谢您的理解与支持】[/color]",
                "感谢您对 PRE Launcher 的持续关注和支持！",
                "您的每一条建议、每一份反馈，都是我们前进的动力。",
                "如果您有任何想法或建议，欢迎通过Github仓库提交Issue与我们进行沟通。",
                "",
                "让我们一起期待 PRE Launcher RC 3.0.0 版本的到来！",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
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
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
    ],
    // 普通公告
    normalAnnouncements: [
        
    ],
    // 开发日志
    devLogs: [
        {
            id: "devlog-20260603",
            title: "RC 2.6.3.1 (b5) 开发日志",
            date: "2026-06-03",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.1 (b5) 版本更新，主要修复注册相关问题并新增弹窗键盘快捷键功能！",
                "[color:#667eea]【新增功能】[/color]",
                "• 弹窗键盘快捷键支持：所有弹窗新增键盘按键绑定，按下Enter键触发确定按钮，按下Esc键触发取消/返回按钮",
                "• 智能弹窗检测：自动识别当前显示的弹窗类型，支持 custom-alert 和 custom-confirm-modal 两种类型",
                "• 按钮智能识别：通过按钮类名和文本内容智能识别确定和取消按钮，确保兼容性",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复注册成功弹窗文本不显示问题：修复语言键名拼写错误，注册成功后弹窗正确显示\"注册成功！请使用新账号登录\"提示",
                "• 修复注册自动登录问题：注册成功后不再自动设置 currentUser，不会覆盖原有登录表单和个人卡片，用户需手动登录新账号",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260530",
            title: "RC 1.1.0.0 (a2) 开发日志",
            date: "2026-05-30",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            category: "game_hall",
            images: [],
            content: [
                "今天我们发布了 RC 1.1.0.0 (a2) 版本，带来了侧边栏交互优化和弹窗样式统一！",
                "[color:#667eea]【新增功能】[/color]",
                "• 游戏大厅侧边栏收起功能：在游戏大厅页面侧边栏添加与登录页一致的收起/展开按钮",
                "• 侧边栏状态记忆：侧边栏收起/展开状态通过 localStorage 持久化保存，下次打开自动恢复",
                "• 侧边栏收起小卡片：侧边栏收起时底部显示个人卡片，包含用户头像和退出登录按钮",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 侧边栏收起后图标放大：收起侧边栏时菜单项图标放大显示，提升视觉效果",
                "• 弹窗样式统一：游戏大厅弹窗样式与登录页保持一致，包括深色遮罩（透明度80%）、顶部粉色渐变条和粉色渐变按钮",
                "• 弹窗动画优化：弹窗出现动画从位移改为缩放，与登录页保持一致",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复侧边栏收起时个人卡片图标和按钮显示在方框外的问题",
                "• 修复收起状态下侧边栏布局与登录页不一致的问题",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260529",
            title: "RC 2.6.3.0 开发日志",
            date: "2026-05-29",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.0 版本更新，主要带来了图片查看器的全面升级和多项功能优化！",
                "[color:#667eea]【新增功能】[/color]",
                "• 反馈建议弹窗全屏显示：采用侧边栏导航布局，包含功能建议、Bug反馈、其他问题三个分类",
                "• 反馈表单增强：添加优先级选择、平台选择、反馈标题、复现步骤、预期结果等字段",
                "• 文件附件上传：支持图片、日志文件上传，最大5MB",
                "• 开发者公告月份分类：重要公告和普通公告按月份分组显示，例如2026年5月、2026年4月分别显示，方便按时间查找",
                "• 预设背景底部抽屉：移动端预设背景弹窗改为底部抽拉样式，带有拖拽指示条，支持触摸滑动关闭",
                "• 图片查看器全面升级：新增旋转（左/右旋转）、翻转（水平/垂直翻转）功能，控制按钮移至右侧，支持展开/收起控制栏",
                "• 图片查看器悬浮气泡：控制按钮添加从右往左滑出的悬浮气泡提示，清晰展示各按钮功能",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 版本更新红点逻辑优化：使用版本号+日期作为唯一标识，相同版本号不同日期更新也能正确触发红点",
                "• 反馈弹窗布局优化：充分利用右侧显示区域，所有内容一页显示",
                "• 账户设置移动端布局优化：账户信息卡片内容不再溢出卡片边界，按钮、输入框和文本排版更加整齐",
                "• 预设背景图片放大：移动端预设背景弹窗中图片放大显示，改为全屏高度展示，带有弹性动画效果",
                "• 暗色模式按钮样式统一：版本更新记录和开发者公告中的版本块状按钮支持暗色模式，文本颜色调亮提升可读性",
                "• 预设背景功能精简：移除预设背景弹窗中的预览背景功能，界面更加简洁高效",
                "• 图片查看器布局优化：采用三栏布局（头部+主体+底部），控制按钮垂直排列在右侧，底部显示当前缩放百分比",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复反馈弹窗双重滚动条问题",
                "• 修复Bug反馈时复现步骤字段未正确显示问题",
                "• 修复开发者公告中块状按钮未生效暗色模式的问题",
                "• 修复版本更新记录中块状按钮文本在暗色模式下不明显的问题",
                "• 修复图片查看器悬浮气泡被侧边栏裁剪的问题，现在可以正常向外显示",
                "• 修复图片查看器控制栏展开/收起状态重置问题",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260526",
            title: "RC 2.6.2.5 开发日志",
            date: "2026-05-26",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.2.5 版本更新，主要带来了开发者公告和版本更新的消息通知功能！",
                "[color:#667eea]【新增功能】[/color]",
                "• 开发者公告选择界面：公告窗口右侧首先显示块状按钮列表，点击按钮后显示公告详情",
                "• 消息红点通知：侧边栏版本更新和开发者公告按钮添加红点提醒，有未查看内容时显示",
                "• 悬浮气泡提示：鼠标悬浮在红点上时显示\"存在未查看的更新\"提示",
                "• 返回按钮固定：公告详情页返回按钮使用粘性定位，滚动时保持固定",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 红点显示优化：版本和公告按钮内红点显示未查看数量，提高辨识效率",
                "• 红点位置调整：按钮内红点移至右下角，悬浮气泡从下往上滑出",
                "• 新更新标签：版本条目内添加\"新更新\"标签，查看后自动消失",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复红点数量计算错误：版本按钮红点显示该版本下未查看子版本数量",
                "• 修复红点显示文本错误：侧边栏红点仅显示圆点，不显示数字",
                "• 修复按钮内红点不显示数量问题",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260524",
            title: "RC 2.6.2.4 开发日志",
            date: "2026-05-24",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.2.4 版本更新，主要带来了版本更新记录窗口的界面优化！",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 版本选择按钮样式优化：版本更新记录窗口中版本号选择改为块状按钮样式，一行四个按钮，支持自动换行显示，布局更加清晰美观",
                "• 按钮样式优化：加长按钮宽度，背景改为白色，日期和版本数量文本放大加深，提升可读性和视觉体验",
                "• 版本分类功能：添加版本维护状态分类条目，分为\"正在维护中的版本\"和\"已结束维护的版本\"两组显示，方便用户快速区分版本状态",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260517",
            title: "RC 2.6.2.3 开发日志",
            date: "2026-05-17",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.2.3 版本更新，主要带来了侧边栏收起功能的全面升级和移动端体验优化！",
                "[color:#667eea]【新增功能】[/color]",
                "• 侧边栏收起功能：登录页侧边栏顶部新增\"收起侧边栏\"按钮，点击后收起侧边栏仅保留图标显示，让界面更加简洁",
                "• 侧边栏收起状态持久化：使用localStorage保存收起状态，刷新或退出后重新访问时保持上次的收起/展开状态",
                "• 收起侧边栏悬浮气泡：侧边栏收起时，鼠标悬浮在菜单按钮上在对应条目右侧显示悬浮气泡文本，清晰展示各功能名称",
                "• 移动端更多功能按钮：移动端模式下在个人卡片上方新增独立卡片样式的更多功能按钮，点击弹出与PC端一样的弹窗，体验更加一致",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 收起侧边栏样式优化：个人卡片竖向排列，仅显示头像和更多操作按钮，隐藏顶部启动器图标，界面更加紧凑",
                "• 收起侧边栏边框优化：增加个人卡片边框宽度和内边距，确保头像和按钮全部包含在卡片内，不会溢出",
                "• 移动端按钮位置优化：收起侧边栏按钮移至三条杠按钮左侧，解决移动端两个按钮位置冲突的问题",
                "• 悬浮气泡样式统一：菜单项悬浮气泡显示效果与更多功能按钮保持一致，视觉风格统一协调",
                "• 移动端弹窗样式统一：移动端更多功能弹窗改为与PC端一致的弹窗样式，包含关于启动器、隐藏UI、调整UI比例三个按钮横向排列",
                "• 移动端收起侧边栏优化：移动端模式下收起侧边栏时，个人卡片上方也显示更多功能按钮的小卡片，功能完整不缺失",
                "• 用户信息卡片位置优化：收起侧边栏时用户信息卡片从右侧弹出显示，确保信息完整展示",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复收起侧边栏后用户信息卡片被限制在侧边栏内无法正常显示的问题",
                "• 修复移动端更多功能弹窗关闭按钮样式不正确的问题，统一使用与PC端一致的按钮样式",
                "• 修复收起侧边栏时悬浮气泡被拦截在侧边栏内无法正常显示的问题，设置overflow: visible允许内容溢出",
                "• 修复移动端关于启动器弹窗显示不完整的问题，改为全屏显示并支持上下滚动",
                "• 修复移动端账户设置侧边栏无法上下滑动的问题，通过添加touchmove事件阻止冒泡和优化CSS样式确保正常滚动",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 移动端关于启动器弹窗优化：全屏显示布局，包含固定头部、可滚动内容区域和固定底部",
                "• 头部固定：包含logo图标、标题和关闭按钮，方便用户随时关闭",
                "• 内容区域：支持上下滚动，适配小屏幕设备查看完整信息",
                "• 底部固定：关闭按钮固定在底部，操作便捷",
                "[color:#95e1d3]【技术细节】[/color]",
                "• 使用localStorage.setItem/getItem存储和读取侧边栏收起状态",
                "• 为每个菜单条目添加menu-tooltip元素实现悬浮气泡效果",
                "• 设置sidebar-menu的overflow: visible确保悬浮内容可以正常显示",
                "• 移动端收起侧边栏时仅显示更多功能按钮图标，隐藏文字内容",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260516",
            title: "RC 2.6.2.2 开发日志",
            date: "2026-05-16",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
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
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260515",
            title: "RC 2.6.2.1 开发日志",
            date: "2026-05-15",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
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
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260513",
            title: "RC 2.6.2.0 开发日志",
            date: "2026-05-13",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
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
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260511",
            title: "RC 2.6.1.4 开发日志",
            date: "2026-05-11",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
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
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260508",
            title: "RC 2.6.1.3 开发日志",
            date: "2026-05-08",
            tag: "update",
            tagText: "更新公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
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
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
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
            
            // 隐藏所有"查看中"tag
            var allViewingTags = document.querySelectorAll('#announcementModal .viewing-tag');
            allViewingTags.forEach(function(tag) {
                tag.style.display = 'none';
            });
            
            // 显示当前项的子按钮（如果有）
            var subButtons = this.querySelector('.sub-buttons');
            if (subButtons) {
                subButtons.style.display = 'block';
                // 旋转箭头图标
                var arrow = this.querySelector('.nav-arrow');
                if (arrow) {
                    arrow.style.transform = 'rotate(90deg)';
                }
            }
            
            // 重置其他导航项的箭头
            navItems.forEach(function(nav) {
                if (nav !== item) {
                    var otherArrow = nav.querySelector('.nav-arrow');
                    if (otherArrow) {
                        otherArrow.style.transform = 'rotate(0deg)';
                    }
                }
            });
            
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
            contentArea.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
                    <div style="font-size: 48px; margin-bottom: 20px; color: #d45d79;">
                        <i class="fas fa-code"></i>
                    </div>
                    <p style="font-style: normal; text-align: center; padding: 0; margin: 0;">请选择要查看的开发日志分类</p>
                    <p style="font-style: normal; text-align: center; padding: 0; margin: 10px 0 0; color: #999; font-size: 14px;">选择左侧"启动器更新"或"主页面更新"查看详细内容</p>
                </div>
            `;
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
        case 'dev_launcher':
            data = announcementData.devLogs.filter(function(log) {
                return log.category === 'launcher';
            });
            break;
        case 'dev_game_hall':
            data = announcementData.devLogs.filter(function(log) {
                return log.category === 'game_hall';
            });
            break;
        default:
            data = [];
    }
    loadAnnouncementList(data);
}

// 加载公告列表（显示选择按钮）
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
    
    // 显示公告选择按钮界面
    showAnnouncementSelection(announcements);
}

// 按月份分组公告
function groupAnnouncementsByMonth(announcements) {
    var grouped = {};
    
    announcements.forEach(function(announcement) {
        var date = new Date(announcement.date);
        var monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        var monthName = date.getFullYear() + '年' + (date.getMonth() + 1) + '月';
        
        if (!grouped[monthKey]) {
            grouped[monthKey] = {
                monthName: monthName,
                announcements: []
            };
        }
        grouped[monthKey].announcements.push(announcement);
    });
    
    var sortedGroups = Object.keys(grouped).sort(function(a, b) {
        return b.localeCompare(a);
    });
    
    return sortedGroups.map(function(key) {
        return grouped[key];
    });
}

// 显示公告选择按钮界面
function showAnnouncementSelection(announcements) {
    var contentArea = document.querySelector('#announcementModal .terms-content');
    if (!contentArea) return;
    
    contentArea.innerHTML = '';
    
    // 添加提示文本
    var hintText = document.createElement('p');
    hintText.className = 'announcement-selection-hint';
    hintText.style.cssText = `
        font-style: normal;
        text-align: center;
        padding: 20px 0;
        margin-bottom: 20px;
        font-size: 16px;
        color: #333;
    `;
    hintText.textContent = '请选择要查看的公告';
    contentArea.appendChild(hintText);
    
    // 按日期倒序排序公告
    var sortedAnnouncements = [...announcements].sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    
    // 按月份分组
    var groupedAnnouncements = groupAnnouncementsByMonth(sortedAnnouncements);
    
    // 创建月份分组
    groupedAnnouncements.forEach(function(group) {
        // 创建月份标题
        var monthHeader = document.createElement('div');
        monthHeader.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 20px;
            margin-bottom: 12px;
        `;
        
        var monthLine = document.createElement('div');
        monthLine.style.cssText = `
            flex: 1;
            height: 1px;
            background: linear-gradient(to right, transparent, rgba(212, 93, 121, 0.3), transparent);
        `;
        
        var monthTitle = document.createElement('span');
        monthTitle.style.cssText = `
            font-size: 14px;
            font-weight: bold;
            color: #d45d79;
            white-space: nowrap;
        `;
        monthTitle.textContent = group.monthName + '（共' + group.announcements.length + '条）';
        
        monthHeader.appendChild(monthLine);
        monthHeader.appendChild(monthTitle);
        monthHeader.appendChild(monthLine.cloneNode(true));
        contentArea.appendChild(monthHeader);
        
        // 创建该月份的公告按钮网格容器
        var buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'announcement-buttons-container';
        buttonsContainer.style.cssText = `
            padding: 0 20px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        `;
        contentArea.appendChild(buttonsContainer);
        
        // 创建该月份的公告按钮
        group.announcements.forEach(function(announcement) {
        var button = document.createElement('button');
        button.className = 'announcement-select-button';
        
        var isDarkMode = document.body.classList.contains('dark-mode');
        var bgColor = isDarkMode ? 'rgba(50, 50, 70, 0.95)' : 'white';
        var borderColor = isDarkMode ? 'rgba(212, 93, 121, 0.4)' : 'rgba(212, 93, 121, 0.3)';
        var shadowColor = isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.06)';
        var titleColor = isDarkMode ? '#e67e8a' : '#d45d79';
        var textColor1 = isDarkMode ? '#e0e0e0' : '#666';
        var textColor2 = isDarkMode ? '#ccc' : '#888';
        
        button.style.cssText = `
            position: relative;
            padding: 20px 16px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: ${bgColor};
            border: 2px solid ${borderColor};
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-height: 100px;
            box-shadow: 0 2px 10px ${shadowColor};
        `;
        
        // 添加鼠标悬浮效果
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 8px 20px rgba(212, 93, 121, 0.2)';
            this.style.borderColor = '#d45d79';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.06)';
            this.style.borderColor = 'rgba(212, 93, 121, 0.3)';
        });
        
        // 添加点击效果
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-1px) scale(0.99)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        // 确定标签颜色
        var tagColor = '#999';
        if (announcement.tag === 'important') {
            tagColor = '#f44336';
        } else if (announcement.tag === 'update') {
            tagColor = '#4CAF50';
        } else if (announcement.tag === 'notice') {
            tagColor = '#2196F3';
        }
        
        // 检查公告是否已查看
        var isViewed = isAnnouncementViewed(announcement.id);
        
        // 设置按钮内容
        button.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span style="font-size: 16px; font-weight: bold; color: ${titleColor}; line-height: 1.3;">${announcement.title}</span>
                ${announcement.tag ? `<span style="padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; background-color: ${tagColor}; color: white;">${announcement.tagText}</span>` : ''}
            </div>
            <div style="font-size: 14px; color: ${textColor1};"><i class="fas fa-calendar"></i> ${announcement.date}</div>
            <div style="font-size: 13px; color: ${textColor2};"><i class="fas fa-user"></i> ${announcement.author}</div>
            ${!isViewed ? `<span class="notification-dot">1<span class="notification-tooltip">存在未查看的更新</span></span>` : ''}
        `;
        
        // 添加点击事件，显示公告详情
        button.addEventListener('click', function() {
            // 标记公告为已查看
            markAnnouncementAsViewed(announcement.id);
            showAnnouncementDetail(announcement, sortedAnnouncements);
        });
        
        buttonsContainer.appendChild(button);
        });
    });
}

// 显示公告详情
function showAnnouncementDetail(announcement, allAnnouncements) {
    var contentArea = document.querySelector('#announcementModal .terms-content');
    if (!contentArea) return;
    
    contentArea.innerHTML = '';
    
    // 添加返回按钮
    var backButton = document.createElement('button');
    backButton.className = 'announcement-back-button';
    backButton.style.cssText = `
        padding: 10px 20px;
        background: linear-gradient(135deg, #d45d79 0%, #e67e8a 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
    `;
    
    // 添加鼠标悬浮效果
    backButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    });
    
    backButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    });
    
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> 返回公告列表';
    
    // 返回按钮点击事件
    backButton.addEventListener('click', function() {
        showAnnouncementSelection(allAnnouncements);
    });
    
    contentArea.appendChild(backButton);
    
    // 创建公告详情元素
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
                            <i class="fas fa-chevron-right nav-arrow"></i>
                        </div>
                        <div class="sub-buttons" id="devLogSubButtons">
                            <button class="sub-button" data-type="dev_launcher">
                                <i class="fas fa-rocket"></i>
                                <span>启动器更新</span>
                                <span class="viewing-tag" style="display:none;">查看中</span>
                            </button>
                            <button class="sub-button" data-type="dev_game_hall">
                                <i class="fas fa-gamepad"></i>
                                <span>主页面更新</span>
                                <span class="viewing-tag" style="display:none;">查看中</span>
                            </button>
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
    
    // 更新最后查看日期
    updateLastViewedAnnouncementDate();
    
    // 隐藏红点
    updateAnnouncementNotificationDot();
    
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
    // 更新公告红点显示
    updateAnnouncementNotificationDot();
    
    // 为开发者公告按钮添加点击事件
    var announcementBtn = document.getElementById('sidebarAnnouncement');
    if (announcementBtn) {
        announcementBtn.addEventListener('click', function() {
            showAnnouncementModal();
        });
    }
});