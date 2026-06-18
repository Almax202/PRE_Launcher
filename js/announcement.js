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
            tagText: "重要",
            author: "GPY Games Studio - PREAlmax",
            images: [],
            content: [
                "尊敬的用户，感谢您一直以来对 PRE Launcher 的支持与关注！",
                "",
                "[color:#667eea]【RC 3.0.0 版本预告 - 预计2026下半年发布】[/color]",
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
            tagText: "重要",
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
        {
            id: "normalA-20260618",
            title: "登录功能逻辑错误与预计修复日期",
            date: "2026-06-18",
            tag: "normal",
            tagText: "普通",
            author: "GPY Games Studio - PREAlmax",
            images: [],
            content: [
                "大家好，这里是 PREAlmax。",
                "",
                "以下为大家带来一则关于近期发现的已知问题及修复排期的通知。",
                "",
                "[color:#ff6b6b]【问题说明】[/color]",
                "经排查，我们发现在账户设置页面中存在一处逻辑漏洞：在特定操作条件下，用户可通过账户设置页直接绕过登录流程进入游戏大厅。",
                "",
                "[color:#ffd93d]【当前状态】[/color]",
                "由于目前暂未确定该问题的确切引入时间，我们将在修复完成后通过新的更新公告另行通知。",
                "",
                "[color:#4ecdc4]【修复安排】[/color]",
                "此外，因端午假期临近，后续更新工作将暂缓进行。预计将于 2026 年 6 月 21 日发布包含该问题修复的更新版本。",
                "",
                "[color:#667eea]【感谢支持】[/color]",
                "感谢您的理解与支持！如果您在使用过程中遇到其他问题，欢迎通过 Github Issue 与我们联系。",
                "",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "normalA-20260608",
            title: "RC 2.6.3.5 版本问题说明",
            date: "2026-06-08",
            tag: "normal",
            tagText: "普通",
            author: "GPY Games Studio - PREAlmax",
            images: [],
            content: [
                "大家好，这里是 PREAlmax。",
                "",
                "在推送 RC 2.6.3.5 (b6) 版本更新后，我们注意到移动端程序存在以下问题：",
                "",
                "[color:#ff6b6b]【已知问题】[/color]",
                "• 移动端账户设置页更换自选背景时，保存应用后设置不会同步到其他页面",
                "• 重新加载页面时，CSS 和 JS 文件可能无法正常加载，进而导致页面进程卡死",
                "• 使用 HDR 图片作为背景时，有一定概率导致页面进程卡死，并且页面无法正常显示",
                "",
                "[color:#ffd93d]【当前进展】[/color]",
                "目前我们正在对上述问题进行逐一排查、测试和修复。由于部分问题需要进行多场景、多设备的兼容性测试，修复工作需要一定时间。",
                "",
                "[color:#4ecdc4]【后续安排】[/color]",
                "待所有问题修复完毕并验证通过后，我们将推送新版本并发布更详细的更新公告，届时会同步修复详情和更新说明。",
                "",
                "[color:#667eea]【感谢支持】[/color]",
                "感谢您的理解与支持！如果您遇到其他问题，欢迎通过 Github Issue 与我们联系。",
                "",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        }
    ],
    // 开发日志
    devLogs: [
        {
            id: "devlog-20260618",
            title: "RC 2.6.3.13 开发日志",
            date: "2026-06-18",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.13 版本更新，主要带来了天气跳转功能和多项透明主题优化！",
                "[color:#667eea]【新增功能】[/color]",
                "• 天气跳转功能：页面时钟天气组件新增点击跳转到MSN Weather网站功能，方便用户查看详细天气信息",
                "• 天气跳转开关：组件调整弹窗中新增\"点击天气组件后跳转到MSN Weather\"开关选项，用户可自由开启或关闭此功能",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 安全验证弹窗按钮：\"使用PIN码进行安全验证\"按钮改为透明样式，与弹窗背景更好地融合",
                "• PIN码验证弹窗：\"PIN码是您在启用两步验证时设置的6位数字密码\"提示文本框改为透明样式",
                "• 实验性功能弹窗：透明主题下文本内容字体调亮，提高在深色背景上的可读性",
                "• 卡片条目文本：所有卡片条目中主标题下方的详细内容文本改为统一亮色，增强可读性",
                "• 弹窗内容文本：所有弹窗中主标题下方的详细内容文本改为统一亮色，保持视觉一致性",
                "• 注册弹窗样式：注册新账号弹窗中的步骤栏、输入框和按钮改为透明毛玻璃样式，与透明主题保持一致",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复验证码图片和输入框不对齐的问题，确保两者高度一致",
                "[color:#667eea]【感谢支持】[/color]",
                "感谢您对 PRE Launcher 的持续关注和支持！",
                "如果您有任何想法或建议，欢迎通过Github仓库提交Issue与我们进行沟通。",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260617",
            title: "RC 2.6.3.12 开发日志",
            date: "2026-06-17",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.12 版本更新，主要带来了页面时钟功能的交互优化和透明主题适配！",
                "[color:#667eea]【新增功能】[/color]",
                "• 页面时钟实验性测试已结束，现已移动到\"个性化\"设置中",
                "• 点击名言刷新：点击名言框内任意位置即可刷新名言内容，无需额外按钮",
                "• 名言加载图标：点击刷新时在名言框中间显示旋转加载图标，提示用户正在加载",
                "• 隐藏所有图标功能：新增设置项可隐藏页面时钟中的返回、天气设置和组件调整按钮，鼠标悬停时显示",
                "• 时钟调整提示：进入时钟调整模式时底部从下到上弹出\"拖拽时间组件可调整位置\"提示横条",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 名言框尺寸固定：固定名言框宽度(450px)和高度(115px)，防止被较长名言内容延长",
                "• 个性化命名：将主题设置更名为个性化，侧边栏和顶部导航栏文本同步更新",
                "• 透明主题适配：天气设置、组件设置弹窗和底部提示横条支持透明主题毛玻璃样式",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复点击时钟调整弹窗关闭按钮后时钟组件仍可拖动的问题",
                "[color:#667eea]【感谢支持】[/color]",
                "感谢您对 PRE Launcher 的持续关注和支持！",
                "如果您有任何想法或建议，欢迎通过Github仓库提交Issue与我们进行沟通。",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260616",
            title: "RC 2.6.3.11 开发日志",
            date: "2026-06-16",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.11 版本更新，主要带来了页面时钟实验性功能的多项优化和新增功能！",
                "[color:#667eea]【新增功能】[/color]",
                "(以下的更新内容为页面时钟的新实验性功能，不建议在生产环境中使用)",
                "• 页面时钟名言显示：使用 hitokoto API 获取实时名言数据，显示在时钟下方，支持30分钟缓存",
                "• 时钟调整面板：点击调整位置按钮后显示可移动弹窗，支持调整文字大小、对齐方式、时间格式、字体样式、日期格式",
                "• 鼠标滚轮调节：进入调整模式后，鼠标悬停在时钟上滚动滚轮可实时调节大小",
                "• 左上角返回按钮：开启页面时钟后在左上角显示返回按钮，点击退出时钟模式",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 天气对齐同步：调整对齐方式时，天气显示也同步调整对齐方向，视觉更加平衡",
                "• 农历字体统一：农历字体与时钟字体样式保持一致，不再单独使用宋体",
                "• 组件调整弹窗优化：删除名言位置功能，时钟位置移至显示选项上方，改为单列布局，界面更简洁",
                "• 时钟调整弹窗按钮样式统一：时间格式、字体样式、日期格式按钮使用与对齐方式一致的样式",
                "• 时钟调整弹窗加宽：宽度从280px增加到340px，按钮显示更完整",
                "• 点击行为优化：开启页面时钟后点击空白处不再返回，需点击返回按钮；关闭后恢复点击空白显示UI",
                "• 提示横条智能隐藏：启用页面时钟后自动隐藏提示横条，关闭后重新显示",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复调整位置后大小功能失效的问题",
                "• 修复保存设置后刷新时钟大小不生效的问题",
                "• 修复时钟设置弹窗按钮点击无效的问题",
                "[color:#667eea]【感谢支持】[/color]",
                "感谢您对 PRE Launcher 的持续关注和支持！",
                "如果您有任何想法或建议，欢迎通过Github仓库提交Issue与我们进行沟通。",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260615",
            title: "RC 2.6.3.10 开发日志",
            date: "2026-06-15",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.10 版本更新，主要带来了天气功能的全面优化和多项Bug修复！",
                "[color:#667eea]【新增功能】[/color]",
                "(以下的更新内容为页面时钟的新实验性功能，不建议在生产环境中使用)",
                "• 天气设置功能：支持通过API获取实时天气数据，用户可自行选择城市/省份显示当地天气",
                "• 温度单位切换：支持摄氏度/华氏度切换，并使用localStorage持久化保存用户设置",
                "• Open-Meteo API版权声明：在天气设置弹窗底部添加API版权信息，感谢Open-Meteo提供的免费天气API服务",
                "• 关于启动器新增Open-Meteo API版权按钮，点击显示详细版权声明和官方链接",
                "• 天气预览测试区域：方便用户测试切换地区后的天气显示效果",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 天气设置弹窗改为左右两栏布局：左侧显示当前城市、选择区域和温度单位设置，右侧显示天气预览",
                "• 版权声明按钮重新排序：改为分类显示结构，大类别下包含小类别按钮",
                "• 自动定位体验优化：点击自动定位按钮后在预览区显示\"获取位置信息中\"状态提示，弹窗不会自动关闭",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复部分城市天气图标不显示的问题，更新Font Awesome图标映射",
                "• 修复PC端开启页面时钟实验功能后仍显示\"隐藏UI\"文本的问题",
                "• 修复自动定位只显示摄氏度的问题，现在自动定位也支持温度单位设置",
                "• 修复温度单位设置刷新后不生效的问题，页面加载时自动读取保存的设置",
                "• 修复自动定位弹窗自动关闭的问题，确保用户可以看到定位状态",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260614",
            title: "RC 2.6.3.9 开发日志",
            date: "2026-06-14",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.9 版本更新，主要带来了全新的页面时钟实验性功能！",
                "[color:#667eea]【新增功能】[/color]",
                "• 账户设置页新增\"实验室\"类别，包含\"实验性功能\"入口页面",
                "• 页面时钟实验性功能：开启后点击隐藏UI可显示时间、日期、天气和农历",
                "• 页面时钟设置弹窗：支持位置、日期格式、时间格式、字体样式等多项自定义设置",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 页面时钟支持9种位置（含四角、四侧和居中）、3种日期格式、3种字体样式",
                "• 页面时钟支持12/24小时制切换、字体大小调节、日期/天气/农历独立开关",
                "• 页面时钟设置弹窗采用双列布局，全局开关置于顶部，\"保持UI隐藏\"模式下按钮自动禁用",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复关闭页面时钟实验功能后登录页仍显示该功能的问题",
                "[color:#667eea]【感谢支持】[/color]",
                "感谢您对 PRE Launcher 的持续关注和支持！",
                "如果您有任何想法或建议，欢迎通过Github仓库提交Issue与我们进行沟通。",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260610",
            title: "RC 2.6.3.8 开发日志",
            date: "2026-06-10",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.8 版本更新，主要优化了反馈建议功能和透明主题的用户体验！",
                "[color:#667eea]【新增功能】[/color]",
                "• 反馈选择弹窗：点击反馈建议功能先弹出选择弹窗，包含\"本地反馈\"和\"提交到Github Issue\"两个按钮",
                "• Github跳转确认：点击提交到Github Issue按钮后，弹出离开页面确认弹窗，确认后才进行跳转",
                "• 透明主题正式版现已推出：包含登录页、游戏大厅、游戏内界面等所有元素的透明毛玻璃效果",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 反馈按钮布局：两个反馈按钮改为横向排列，显示更加紧凑美观",
                "• 本地反馈按钮：标记为灰色禁用状态，点击后提示\"由于暂未提供后端服务器，本地反馈现已停止支持，开放时间暂且未知，敬请谅解\"",
                "• 透明主题全面优化：登录页所有弹窗、侧边栏terms-sidebar、导航项terms-nav-item/active、块状按钮version-group-button/announcement-select-button、显示区域terms-main、公告项announcement-item全部改为透明毛玻璃样式",
                "• 透明主题文本增强：所有文字颜色提升亮度，添加文字阴影增强对比度，确保在任何背景下都清晰可读",
                "[color:#667eea]【感谢支持】[/color]",
                "感谢您对 PRE Launcher 的持续关注和支持！",
                "如果您有任何想法或建议，欢迎通过Github仓库提交Issue与我们进行沟通。",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260609-2",
            title: "RC 2.6.3.7 开发日志",
            date: "2026-06-09",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.7 版本更新，主要带来了全新的登录页引导功能和弹窗快捷键支持！",
                "[color:#667eea]【新增功能】[/color]",
                "• 弹窗快捷键支持：账户设置页所有弹窗支持Enter键确认、ESC键取消，无需鼠标操作",
                "• 登录页引导功能：首次进入或无账号登录时自动显示UI引导，详细介绍各功能位置及用途",
                "• 更多功能查看引导：登录页右上角更多功能中新增\"查看引导\"按钮，可随时重新查看引导",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 引导步骤优化：添加登录卡片、侧边栏收起、更多功能弹窗等引导内容，精简不必要的引导项",
                "• 引导颜色优化：高亮框从淡蓝色改为更醒目的橙色，进度条同步更新为橙色",
                "• 引导底部布局优化：进度条移至按钮上方，跳过引导改为淡红色按钮样式，视觉层次更清晰",
                "• 引导结束弹窗：引导完成后显示确认弹窗，可选择结束引导或重新开始",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复登录后点击查看引导按钮无反应的问题",
                "• 修复引导结束弹窗弹出后底部按钮仍可点击的问题",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260609",
            title: "RC 2.6.3.6 开发日志",
            date: "2026-06-09",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.6 版本更新，主要修复了上一版本发现的三个关键问题，并优化了背景图片处理和页面加载机制！",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 背景图片上传优化：最大文件限制从100MB调整为20MB，防止过大图片导致内存占用过高",
                "• 背景图片格式验证：添加图片格式白名单机制，仅支持JPG、PNG、GIF、WebP、BMP格式，过滤HDR等不支持的格式",
                "• 图片处理超时机制：背景图片上传添加30秒超时限制，防止异常格式图片处理超时导致页面卡死",
                "• 图片解码验证：使用Image对象验证图片解码有效性，防止无效或损坏图片导致页面卡死",
                "• IndexedDB超时优化：所有页面背景读取添加5秒超时机制，超时后自动跳过背景加载，避免页面卡死",
                "• IndexedDB异常保护：所有IndexedDB操作添加try-catch保护，防止数据库异常导致页面崩溃",
                "• 背景设置参数验证：加载背景时验证fit、opacity、blur参数有效性，防止无效值导致样式错误",
                "• 全局错误监听：登录页、游戏大厅页、账户设置页添加window.onerror和unhandledrejection监听",
                "• Font Awesome资源容错：CSS加载添加onerror回退机制，CDN加载失败时使用本地资源",
                "• JSZip资源容错：JSZip脚本添加onerror处理，标记fallback状态以便代码降级处理",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复移动端账户设置页更换自选背景后设置不会同步到其他页面的问题",
                "• 修复重新加载页面时CSS和JS文件加载异常导致页面卡死的问题",
                "• 修复使用HDR图片作为背景时有概率导致页面卡死的问题",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260608",
            title: "RC 2.6.3.5 开发日志",
            date: "2026-06-08",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.5 版本更新，主要带来了复制功能的全面升级和透明主题的进一步优化！",
                "[color:#667eea]【新增功能】[/color]",
                "• 主题信息查看按钮：账户设置页更多主题弹窗中每个主题按钮左上角新增圆圈i信息按钮，点击弹出主题详细版本信息（组件版本号、发布日期、最近更新日期、组件状态）",
                "• 登录页复制功能：登录页用户信息卡片最右侧新增复制按钮，点击后用户名、用户ID、注册时间三个条目右侧都显示复制按钮，可单独复制每项内容",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 透明主题适配：账户设置页默认弹窗、按钮和输入框改为透明毛玻璃样式，与整体主题风格保持一致",
                "• 弹窗文本可读性：透明主题下弹窗内文字颜色提升，添加双层文字阴影增强对比度，确保在任何背景下都清晰可读",
                "• 复制提示样式：复制成功提示横条改为与隐藏UI横条一致的样式，透明主题下呈现透明毛玻璃效果",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复透明主题下复制提示横条样式不正确的问题，现在使用与隐藏UI横条相同的透明毛玻璃样式",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260607",
            title: "RC 2.6.3.4 开发日志",
            date: "2026-06-07",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.4 版本更新，主要带来了透明主题的进一步优化和隐藏UI提示横条功能！",
                "[color:#667eea]【新增功能】[/color]",
                "• 隐藏UI提示横条：点击隐藏UI后，屏幕底部从下往上弹出提示横条'点击空白处显示UI'，引导用户恢复界面",
                "• 提示横条交互增强：鼠标悬浮在提示横条上时，文本以淡入淡出效果切换为'点击隐藏该提示'，点击可隐藏提示横条",
                "• 4种语言国际化：提示横条文本支持中文、英文、日语、韩语切换，与系统语言保持一致",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 透明主题适配：用户信息卡片、更多操作悬浮气泡、按钮悬浮气泡、侧边栏菜单悬浮气泡全部改为透明样式，视觉风格统一",
                "• 透明主题适配：更多功能按钮、更多操作按钮、登录卡片登录按钮、左上角徽标图标全部改为透明样式",
                "• 透明主题适配：账户设置页卡片左上角图标、卡片条目背景、侧边栏返回按钮、侧边栏滚动条全部改为透明样式",
                "• 透明主题适配：成就系统页小游戏按钮、进度条、一键激活/关闭按钮全部改为透明样式",
                "• 透明主题适配：更多功能弹窗、更多操作弹窗、确认弹窗全部改为透明毛玻璃样式，视觉风格统一",
                "• UI优化：删除确认弹窗内部上下两条隔断横线，整体视觉更加简洁",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复透明主题下头像悬浮卡片中昵称输入框边框不显示和字体过白的问题，确保在白色背景上有足够的对比度",
                "• 修复移动端模式下更多功能区透明主题样式不生效的问题，确保移动端体验一致性",
                "• 修复移动端提示弹窗在透明主题下不是透明主题样式的问题，实现全页面透明主题适配",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260605",
            title: "RC 2.6.3.3 开发日志",
            date: "2026-06-06",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.3 版本更新，主要带来了全新的透明主题 BETA 和本地预设背景功能！",
                "[color:#667eea]【新增功能】[/color]",
                "• 更多主题弹窗：主题设置中的毛玻璃主题按钮改为\"更多主题\"入口，点击后弹出主题选择窗口",
                "• 透明主题 BETA：全新的透明主题，所有侧边栏、顶部导航栏和卡片全部透明化，保留边框和线条，文字添加阴影增强可读性",
                "• 本地预设背景：预设背景选择新增联网/本地切换滑块，支持使用bgimg目录下的九张本地图片作为背景",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 透明主题移动端优化：移动端模式下侧边栏弹出时自动调暗背景，确保文字可读性",
                "• 毛玻璃主题功能精简：毛玻璃主题按钮暂时禁用，待优化后重新开放",
                "• 透明主题输入框统一优化：所有输入框、下拉框、文本域统一透明样式，文字颜色为白色并带阴影",
                "• 弹窗输入框样式覆盖：透明主题下弹窗背景为白色，输入框改用深色边框和深色文字保持对比",
                "• 下拉菜单选项优化：透明主题下下拉选项改为深色文字，确保白底黑字可读性",
                "• 三页面同步：账户设置页、登录页、游戏大厅页透明主题输入框样式完全统一",
                "• 预设背景弹窗精简：移除刷新预设背景按钮，简化界面",
                "• 滑块按钮悬浮提示：本地/联网切换滑块添加悬浮气泡提示，鼠标悬浮时显示'切换本地壁纸或联网壁纸'",
                "• 移动端预设背景弹窗优化：调整滑块按钮位置，避免遮挡标题文本",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复透明主题在登录页和游戏大厅页面不生效的问题",
                "• 修复登录页顶部导航栏透明主题不生效的问题",
                "• 修复本地图片路径问题：账户设置、登录页、游戏大厅页本地背景图片路径统一处理",
                "• 修复背景预览区双重图片显示问题：预览区与页面背景分别应用，不再叠加显示",
                "• 修复预设背景图片预览不显示问题：本地/联网预设图片选择后正确显示预览效果",
                "• 修复自定义背景图片应用后页面空白问题：base64 data URL 不再被错误添加路径前缀",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]",
            ]
        },
        {
            id: "devlog-20260604",
            title: "RC 2.6.3.2 开发日志",
            date: "2026-06-04",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.2 版本更新，主要带来了静默更新提示功能和弹窗样式优化！",
                "[color:#667eea]【新增功能】[/color]",
                "• 静默更新提示弹窗：登录页每次进入时自动检测版本，检测到新版本后自动弹出静默更新提示",
                "• 弹窗版本号显示：静默更新弹窗内显示当前最新版本号，方便用户确认当前版本",
                "• 跳转到版本更新按钮：弹窗内新增\"跳转到版本更新\"按钮，点击可直接打开版本更新记录窗口",
                "• 自动定位版本公告：点击跳转按钮后自动识别当前版本号，并跳转到对应的更新公告处显示详细内容",
                "[color:#4ecdc4]【优化改进】[/color]",
                "• 全局设置弹窗样式：登录页全局设置弹窗改为与注册页一致的全屏统一样式，提升视觉一致性",
                "• 弹窗宽度优化：静默更新弹窗宽度从300px增加到550px，内容展示更舒适",
                "[color:#ff6b6b]【修复问题】[/color]",
                "• 修复版本更新跳转问题：点击\"跳转到版本更新\"按钮后不再显示\"加载中\"，正确显示更新公告内容",
                "[color:black]© 2014-2026 PREAlmax. All rights reserved.[/color]"
            ]
        },
        {
            id: "devlog-20260603",
            title: "RC 2.6.3.1 开发日志",
            date: "2026-06-03",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "launcher",
            images: [],
            content: [
                "今天我们发布了 RC 2.6.3.1 版本更新，主要修复注册相关问题并新增弹窗键盘快捷键功能！",
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
            title: "RC 1.1.0.0 开发日志",
            date: "2026-05-30",
            tag: "update",
            tagText: "公告",
            author: "GPY Games Studio - PREAlmax",
            category: "game_hall",
            images: [],
            content: [
                "今天我们发布了 RC 1.1.0.0 版本更新，主要带来了侧边栏交互优化和弹窗样式统一！",
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
            tagText: "公告",
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
            tagText: "公告",
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
            tagText: "公告",
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
            tagText: "公告",
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
            tagText: "公告",
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
            tagText: "公告",
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
            tagText: "公告",
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
            tagText: "公告",
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
            tagText: "公告",
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
        var contentArea = document.querySelector('#announcementModal .terms-main');
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