// 语法使用：
        // {
        //     version: "版本号",
        //     date: "日期",
        //     tag: "标签",                 /tag标签使用:   major 重大更新; important 重要更新; normal 常规更新
        //     tagText: "标签文本",
        //     images: ["图片路径1", "图片路径2"],
        //     features: ["功能描述1", "功能描述2", ...]
        // },
        //     demo:
        // {
        //     version: "RC 1.0.0.0 (a1)",
        //     date: "2026-04-26",
        //     tag: "normal",
        //     tagText: "常规更新",
        //     images: [],
        //     features: [
                    // "新增功能"
                    // "[color:颜色]文本1[/color]",  /文本段落颜色使用方法：red, blue, green, yellow, orange, pink, #ff0000, #0000ff, #00ff00, #ff933ff, #ff9900, #0099ff
                    // "优化改进"
                    // "[color:颜色]-文本2[/color]",
                    // "修复问题"
                    // "[color:颜色]-文本3[/color]" 
                    //     ]
        // },
// 版本更新公告数据
const versionHistoryData = {
    launcherUpdateContent: [
        {
            version: "RC 2.6.0.10 (b4)",
            date: "2026-04-28",
            tag: "important",
            tagText: "重要更新",
            images: ["./images/26010.png", "./images/26010_2.png"],
            features: [
                "新增功能",
                "- 版权声明：在关于启动器的版权声明部分添加\"MIT License\"按钮",
                "优化改进",
                "- 界面优化：MIT License弹窗内容改为分页展示，提升阅读体验",
                "- 界面体验：版本更新记录窗口优化更新公告显示区域与LIST列表对齐",
                "- 界面体验：调整版本更新记录返回和排序按钮位置向上对齐",
                "- 优化JavaScript代码，提取公共功能模块，减少重复代码",
                "- 使用CSS变量系统，统一管理颜色和样式参数",
                "- 优化资源加载，脚本改为延迟加载提升页面加载速度",
                "- 图标库改为懒加载，减少初始加载时间",
                "- 页面加载更加流畅快速",
                "- 代码结构更加清晰易维护",
                "- 为所有页面添加完善的Meta标签",
                "- 支持PWA特性，提升移动端体验",
                "- 移除无效的文件引用，清理代码",
            ]
        },
        {
            version: "RC 2.6.0.9 (b4)",
            date: "2026-04-28",
            tag: "important",
            tagText: "重要更新",
            images: [],
            features: [
                "新增功能",
                "- 版本管理：版本更新记录子按钮添加\"查看中\"tag，显示当前查看状态",
                "- 字体调整：用户协议和隐私政策窗口添加字体大小调整按钮（支持12px-24px）",
                "优化改进",
                "- 自定义滚动条：用户协议目录侧边栏添加自定义滚动条样式",
                "- 暗色模式：优化游戏大厅个人卡片、签到规则、退出登录悬浮气泡样式",
                "- 响应式设计：今日运势窗口改为响应式布局，跟随浏览器窗口大小变动",
                "- 界面体验：版本更新记录提示文本居中显示并添加等待图标",
                "- 全屏显示：图片查看器窗口改为全屏显示",
                "- 暗色模式：优化版本更新记录卡片和日期文本在暗色模式下的显示",
                "修复问题",
                "- 按钮修复：修复用户协议窗口返回顶部按钮不生效问题",
                "- 主题修复：修复暗色主题设置后刷新页面变回亮色主题的问题"
            ]
        },
        {
            version: "RC 2.6.0.8 (b4)",
            date: "2026-04-27",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "修复问题",
                "- 界面修复：修复了过时版本记录中排序功能不生效的问题",
                "- 界面修复：修复了版本日期范围显示倒叙的问题"
            ]
        },
        {
            version: "RC 2.6.0.7 (b4)",
            date: "2026-04-27",
            tag: "normal",
            tagText: "常规更新",
            images: ["./images/2607.png"],
            features: [
                "优化改进",
                "- 界面优化：版本更新记录选择版本部分显示日期范围信息",
                "- 功能增强：版本更新记录添加状态tag显示（版本维护中、更新已结束、已过时版本）",
                "- 界面优化：登录页用户协议与隐私政策窗口图标改为横向排列",
                "- 界面优化：调整用户协议与隐私政策窗口图标与边框的距离",
                "修复问题",
                "- 界面修复：关于版本更新记录中正序/倒叙排列错误的问题"
            ]
        },
        {
            version: "RC 2.6.0.6 (b4)",
            date: "2026-04-27",
            tag: "normal",
            tagText: "常规更新",
            images: ["./images/2606.png"],
            features: [
                "优化改进",
                "- 界面优化：关于启动器窗口改为与用户名片相同的大小和排版",
                "- 界面优化：版权使用声明改为\"版权声明\"，添加详细的版权声明文本",
                "- 功能增强：添加OPPO Sans和MUI版权信息查看按钮，点击后显示详细版权信息",
                "修复问题",
                "- 界面修复：关于启动器窗口左侧图标显示不全的问题"
            ]
        },
        {
            version: "RC 2.6.0.6 (b3)",
            date: "2026-04-27",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 功能增强：版本更新记录支持字体颜色设置",
                "- 功能增强：版本更新记录添加\"查看日志\"按钮，支持展开/收起功能",
                "优化改进",
                "- 界面优化：版本选择按钮样式与版本更新条目保持一致",
                "修复问题",
                "- 界面修复：版本号显示不一致的问题",
                "- 界面修复：关于启动器悬浮气泡文本显示错误问题",
            ]
        },
        {
            version: "RC 2.6.0.5 (b3)",
            date: "2026-04-27",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 界面体验：在登录页右上角的更多功能区添加一个新按钮为\"调整UI比例\"(BETA)",
                "优化改进",
                "- 字体更新：所有页面的字体均已更换为OPPO Sans SC，提升字体质量",
                "（声明：OPPO Sans 字体著作权与知识产权专属归属：OPPO 广东移动通信有限公司。本项目合法使用 OPPO Sans 开源免费字体，字体完整版权归 OPPO 广东移动通信有限公司所有，已严格遵守官方字体使用协议，仅作正常展示与内容应用，未进行字体修改、售卖及二次分发等违规操作。）",
                "- 界面体验：提升整体视觉效果，使字体更加美观统一",
                "修复问题",
                "- 界面修复：调整UI比例的按钮样式不正确的问题",
                "- 功能修复：调整完比例后页面UI不会延申，导致出现空白的问题"
            ]
        },
        {
            version: "RC 2.6.0.4 (b3)",
            date: "2026-04-26",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "优化改进",
                "- 移动端适配：移动端模式下版本更新记录把LIST列表放在中间偏上的位置",
                "修复问题",
                "- 布局修复：修复返回顶部按钮与侧边栏和关闭按钮互相遮挡的问题",
                "- 界面体验：调整返回顶部按钮位置，避免与其他元素重叠",
                "- 移动端适配：修复移动端模式下LIST侧边栏缩小后为竖向的问题",
                "- 兼容性：保持PC端不变，确保跨设备兼容性"
            ]
        },
        {
            version: "RC 2.6.0.3 (b3)",
            date: "2026-04-26",
            tag: "normal",
            tagText: "常规更新",
            images: ["./images/2603.png", "./images/2603_2.png",],
            features: [
                "优化改进",
                "- 界面体验：将版本更新记录窗口改为全屏显示，提升内容展示空间",
                "- 界面体验：调整窗口布局以适应全屏显示，优化用户浏览体验",
                "- 界面体验：版本更新记录中图标和文本改为横向排列",
                "- 界面体验：调整头部布局，提升视觉层次感",
                "- 界面体验：在版本更新记录中添加返回按钮，方便用户返回版本选择页面",
                "- 界面体验：调整头部内边距，提升视觉舒适度",
                "- 界面体验：优化返回按钮和排序按钮的样式，使其贴合总体风格",
                "- 界面体验：更新按钮样式，使其和其他按钮样式一致",
            ]
        },
        {
            version: "RC 2.6.0.2 (b3)",
            date: "2026-04-26",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 版本管理：实现版本号按主版本号和次版本号分组显示（如2.0, 2.1, 2.2等）",
                "- 版本管理：在每个版本内添加排序功能，可以按正序/倒序显示版本",
                "优化改进",
                "- 界面体验：在版本选择页面上方添加提示文本，提升用户引导",
                "- 界面体验：在版本详情页面添加返回版本选择按钮，方便导航",
                "- 界面体验：优化返回按钮位置，使其不随滚动条滚动，保持在页面顶部",
                "- 界面体验：固定返回按钮和排序按钮的位置，使其不被滚动操作所影响",
                "- 界面体验：优化按钮样式和美观度，添加鼠标悬浮效果",
                "- 界面体验：增加版本号按钮之间的间距，提升视觉效果",
                "修复问题",
                "- 功能修复：修复返回版本选择按钮多次点击后无反应的问题"
            ]
        },
        {
            version: "RC 2.6.0.1 (b3)",
            date: "2026-04-26",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 语言支持：在账户设置页面和登录页添加韩语支持",
                "- 语言管理：同步语言状态，集中管理账户设置页面的语言映射",
                "- 语言同步：实现账户设置与登录页的全局设置状态同步，无需每个页面单独设置",
                "优化改进",
                "- 性能优化：优化账户设置页面语言切换性能，解决页面卡死问题",
                "- 界面体验：改进语言切换后的弹窗提示，点击确定后自动刷新页面",
                "- 语言一致性：修复账户标签页在四语状态下尾缀均显示韩文的问题",
                "- 翻译完整性：修复英文、日语和韩语状态下侧边栏和顶部导航栏翻译不完整的问题",
                "修复问题",
                "- 语言切换：修复账户设置页面语言切换后页面不响应对应语言状态的问题",
                "- 事件绑定：修复登录页在英文和日语状态下点击用户协议和隐私政策按钮没反应的问题"
            ]
        },
        {
            version: "RC 2.6.0.0 (b3)",
            date: "2026-04-24",
            tag: "major",
            tagText: "重大更新",
            images: ["./images/2600.png", "./images/2600_2.png", "./images/2600_3.png"],
            features: [
                "新增功能",
                "- 个人名片：个人名片支持新增/移除小组件",
                "优化改进",
                "- 界面体验：弹窗样式更新，新增新窗口的过渡动画效果",
                "- 功能更新：将社交链接小组件改为签到统计",
                "- 界面体验：在个人名片中添加设置按钮，点击后滑出选项栏可添加新小组件",
                "- 界面体验：为个人名片设置面板添加最近游戏、统计数据、徽章展示和社交链接等小组件选项",
                "- 界面体验：在个人名片的功能区块添加移除按钮，点击后可将组件恢复显示在设置栏中",
                "- 界面体验：为设置面板中的小组件选项添加点击事件，可重新添加已移除的组件",
                "- 界面体验：点击名片设置的关闭按钮时弹出提示，询问用户是否要退出编辑模式",
                "- 界面体验：为组件部分添加滚动条，解决组件过多显示不全的问题",
                "- 功能更新：实现最近游戏、统计数据和签到统计组件与账户设置页的同步",
                "- 界面体验：将浏览器自带的提示改为页面内使用固定弹窗的样式",
                "- 修复问题：修复弹窗点击取消和确认按钮没有过渡动画效果的问题",
                "- 界面体验：在版本更新记录窗口右下角添加快速返回顶部的功能按钮",
                "- 界面体验：为返回顶部按钮添加鼠标悬浮提示气泡效果",
                "- 界面体验：调整个人名片窗口中设置按钮与窗口边框的间距，并为其添加鼠标悬浮提示气泡",
                "修复问题",
                "- 界面体验：修复个人名片功能，在账户设置更换头像后名片不会更新头像的问题",
                "- 界面体验：修复上传头像按钮会被之前设置的头像暂时顶掉的问题，确保上传按钮始终显示正确样式",
                "- 界面体验：修复窗口优先级问题，确保名片设置栏显示在用户名片的上方",
                "- 修复问题：修复未点击名片设置按钮小组件也会显示移除按钮的问题",
                "- 界面体验：固定用户名片的窗口大小，使其不会受到增加/移除小组件窗口大小变动的问题",
                "- 修复问题：修复个人名片窗口中设置按钮位置错乱的问题",
            ]
        },
        {
            version: "RC 2.5.4.1 (b3)",
            date: "2026-04-23",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 登录页：在顶部导航栏右上角添加隐藏UI按钮，点击后仅显示背景图",
                "- 登录页：为隐藏UI按钮添加悬停提示",
                "- 登录页：将名片按钮从个人卡片移动到顶部导航栏右上角",
                "- 登录页：在顶部导航栏右上角添加可收起/展开的功能按钮组及其切换按钮",
                "优化改进",
                "- 界面体验：为隐藏UI功能添加过渡动画效果",
                "- 界面体验：修复名片提示错位问题，调大按钮间距",
                "- 登录体验：优化未同意协议时的动效提示",
                "- 界面体验：将同意协议提示从左侧移到下方，确保完整显示",
                "- 界面体验：优化关于启动器按钮的颜色，使其与其他按钮协调",
                "- 界面体验：统一所有按钮的提示气泡样式，确保位置和大小一致",
                "- 界面体验：为功能按钮组添加平滑的展开/收起动画效果",
                "- 界面体验：为按钮添加从展开按钮内滑出的动效，增强视觉体验",
                "- 界面体验：优化移动端模式下的按钮显示，将按钮移动到侧边栏",
                "- 界面体验：为移动端按钮添加从右侧滑出的动效，增强视觉体验",
                "- 界面体验：添加移动端提示弹窗，提醒用户使用桌面端以获得更好的使用体验",
                "修复问题",
                "- 界面体验：修复按钮提示气泡不显示的问题",
                "- 界面体验：修复按钮与边框冲突导致显示不完整的问题"
            ]
        },
        {
            version: "RC 2.5.4.0 (b3)",
            date: "2026-04-23",
            tag: "important",
            tagText: "重要更新",
            images: ["./images/2540.png", "./images/2540_2.png"],
            features: [
                "新增功能",
                "- 个人名片：新增个人名片功能，用户可以在登录页查看个人名片",
                "- 个人名片：在成就完成度文本右侧添加向下的小三角按钮，点击后展开所有游戏的成就",
                "- 个人名片：点击对应的游戏成就可以查看其完成度",
                "- 个人名片：未登录状态下禁用名片功能",
                "优化改进",
                "- 个人名片：修复成就总完成度和账户设置中的成就系统不一致的问题",
                "- 个人名片：将个人签名的文本位置向左对齐，与成就完成度文本达成视觉平衡",
                "- 个人名片：把名片的提示样式改为和退出登录一样的提示样式"
            ]
        },
        {
            version: "RC 2.5.3.0 (b3)",
            date: "2026-04-22",
            tag: "major",
            tagText: "重大更新",
            images: [],
            features: [
                "修复问题",
                "- 数据管理：修复清除缓存功能，选择清除全部数据后会导致账户直接被删除的问题，现在只会清除缓存相关数据，不会发生其他问题"
            ]
        },
        {
            version: "RC 2.5.3.0 (b2)",
            date: "2026-04-22",
            tag: "normal",
            tagText: "常规更新",
            images: ["./images/2530.png"],
            features: [
                "新增功能",
                "- 两步验证：启用两步验证后添加更改PIN码和更新安全问题的功能",
                "- 两步验证：设置PIN码时添加\"使用英文及字符\"的复选框，选择后才能输入英文及字符",
                "优化改进",
                "- 两步验证：优化设置模态框布局，将PIN码设置和安全问题设置分为左右两栏，提高界面清晰度",
                "- 安全性：点击更新PIN码和更新安全问题按钮后需要验证当前的PIN码",
                "- 安全性：关闭两步验证时需要验证PIN码，确保只有授权用户可以禁用该功能",
                "修复问题",
                "- 两步验证：修复状态在页面刷新或重进后关闭的问题",
                "- 两步验证：修复点击启用按钮后，即使没有输入密码进行验证，启用状态也会持续的问题",
                "- 未登录状态：修复在登录页个人中心悬浮卡片中点击\"点击进入账户设置\"后会短时间跳转到账户设置页面然后重新跳转到登录页的问题，改为直接显示未登录提示窗口"
            ]
        },
        {
            version: "RC 2.5.2.0 (b2)",
            date: "2026-04-18",
            tag: "important",
            tagText: "重要更新",
            images: ["./images/2520.png", "./images/2520_2.png", "./images/2520_3.png", "./images/2520_4.png"],
            features: [
                "新增功能",
                "- 数据管理：添加导入数据功能，支持从之前导出的数据文件恢复数据",
                "- 数据安全：导出数据时添加密码验证，加强数据安全性",
                "- 数据安全：导入数据时添加密码验证，确保只有授权用户可以导入数据",
                "- 数据管理：优化导出数据功能，导出更加详细的用户数据",
                "- 缓存管理：优化清除缓存功能，支持选择要清除的具体数据内容",
                "优化改进",
                "- 界面一致性：清除缓存选择窗口使用与其他模态窗口相同的样式",
                "- 交互体验：当常规清理的四个选项都被选中时，自动启动全部清理的选项",
                "- 显示优化：增加清除缓存选择窗口的宽度，避免出现滚动条",
                "- 界面一致性：突出显示\"清除全部数据\"选项，提醒用户此操作的风险",
                "修复问题",
                "- 导出数据：修复密码框保留之前输入的密码的问题",
                "- 清除缓存：修复清除数据功能不生效的问题"
            ]
        },
        {
            version: "RC 2.5.1.0 (b2)",
            date: "2026-04-18",
            tag: "normal",
            tagText: "常规更新",
            images: ["./images/2510.png"],
            features: [
                "新增功能",
                "- 游戏中心个人卡片样式更新：登出按钮改为小按钮放在个人卡片内部右侧",
                "- 登出按钮悬浮提示：鼠标悬停时显示\"退出登录\"提示",
                "- 未登录状态处理：点击登出按钮或个人卡片时显示提示窗口，提供去登录和去注册选项",
                "优化改进",
                "- 登出流程优化：添加二级确认提示，确保用户操作准确性",
                "- 界面一致性：登录页个人卡片添加与游戏大厅相同的登出按钮",
                "- 交互体验：修复登出按钮与个人卡片点击事件的冲突",
                "- 显示优先级：确保登出按钮悬浮提示显示在用户信息悬浮卡上方",
                "修复问题",
                "- 注册模态窗口：修复\"返回登录\"链接无反应的问题"
            ]
        },
        {
            version: "RC 2.5.0.2 (b2)",
            date: "2026-04-12",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "优化改进",
                "- 登录页新增：用户可以通过点击\"关于启动器\"按钮，查看启动器的详细信息，包括版本号、版权信息等。",
                "- 账户设置页优化：优化了账户设置中的暗色主题的颜色适配度。",
                "修复问题",
                "- 已知问题",
            ]
        },
        {
            version: "RC 2.5.0.1 (b2)",
            date: "2026-04-11",
            tag: "normal",
            tagText: "常规更新",
            images: ["./images/2501.png"],
            features: [
                "优化改进",
                "- 登录页面优化：个人卡片更新鼠标悬浮其上时显示用户信息卡片",
                "修复问题",
                "- 已知问题",
            ]
        },
        {
            version: "RC 2.5.0.0 (b2)",
            date: "2026-04-08",
            tag: "major",
            tagText: "重大更新",
            images: [],
            features: [
                "新增功能",
                "- 启动器页面移动端适配：添加移动端菜单按钮，优化侧边栏滑出效果",
                "- 账户设置页面移动端适配：添加移动端菜单按钮，优化布局和交互体验",
                "- 侧边栏强制刷新按钮：在移动端模式下添加强制刷新所有页面的按钮，防止出现bug导致的需要反复重启程序的问题",
                "优化改进",
                "- 启动器页面优化：优化登录页页面布局，个人卡片位置更显眼",
                "- 百宝箱和游戏卡片大小统一：调整百宝箱卡片大小，使其与游戏卡片大小一致",
                "- 每日签到日期排版优化：调整日历网格布局为5列，优化日期单元格的大小和间距",
                "- 游戏原声带功能优化：调整顶部音乐图标位置为垂直布局，扩大曲目卡片尺寸，优化按钮排布使序号和按钮靠左对齐",
                "- 顶部区域贴合度优化：确保在移动端模式下顶部区域完全贴合页面框架",
                "修复问题",
                "- 播放控制问题：修复点击停止按钮后再点击播放按钮不播放音频的问题",
                "- 响应式布局问题：确保在不同屏幕尺寸下都能良好显示"
            ]
        },
        {
            version: "RC 2.4.0.0 (b2)",
            date: "2026-04-06",
            tag: "important",
            tagText: "重要更新",
            images: ["./images/2400.png", "./images/2400_1.png", "./images/2400_2.png"],
            features: [
                "新增功能",
                "- 正式版更新：毛玻璃主题，硬件GPU加速功能以及自定义背景现已推出",
                "- 头像编辑功能：支持图片裁剪、滤镜效果（原图/黑白）、亮度/对比度/饱和度调整",
                "- 自定义头像管理：最多支持10个自定义头像，包含名称设置和悬浮卡片操作",
                "- 设备管理：显示真实设备数据，包括操作系统、浏览器和设备类型",
                "- 登录历史：仅保留30天内前20次登录记录，支持删除功能",
                "- 图片大小突破：支持最大100MB的背景图片上传（使用IndexedDB存储）",
                "- 智能提示：上传超过5MB图片时显示确认弹窗",
                "优化改进",
                "- 界面美观：统一按钮样式，优化滚动条样式",
                "- 头像编辑：调整编辑窗口大小，优化裁剪区域初始位置和大小",
                "- 图片显示：保持原图比例，优化图片显示尺寸",
                "修复问题",
                "- 布局问题：修复毛玻璃主题下登录页个人卡片与启动器名称重叠问题",
                "- 背景显示：修复自定义背景在登录页和游戏大厅不显示的问题",
                "- 裁剪功能：修复确认按钮无响应、裁剪边框样式和编辑窗口不弹出问题",
                "- 边界处理：确保裁剪区域不会超出图片边界"
            ]
        },
        {
            version: "RC 2.3.0.0 (b2)",
            date: "2026-04-06",
            tag: "important",
            tagText: "重要更新",
            images: ["./images/2300.png", "./images/2300_2.png", "./images/2300_3.png", "./images/2300_4.png"],
            features: [
                "新增功能",
                "- 毛玻璃主题（BETA）以及自定义背景（BETA）",
                "- 硬件GPU加速（BETA）：添加了GPU加速功能，启用时会显示系统要求和警告信息的确认对话框",
                "- 针对性保存按钮：在个人资料卡片和声音设置卡片中添加了保存按钮",
                "优化改进",
                "- 自动保存机制：删除了\"保存所有更改\"按钮，实现所有设置的自动保存",
                "- 按钮样式统一：统一了上传自定义头像、上传背景图片、保存个人资料和保存声音设置按钮的颜色",
                "- 毛玻璃效果优化：为所有按钮和示例按钮添加了毛玻璃模式下的样式",
                "- 主题设置独立：为自定义主题和毛玻璃主题分别添加了独立的示例按钮、应用主题和重置按钮",
                "- 导航栏优化：将\"高级设置\"导航项改为\"主题设置\"，并同步更新了页面描述文本",
                "- 全局滚动条优化：优化了全局滚动条样式与主题适配度统一",
                "- 账户设置优化：优化了账户设置页面的部分文字排版布局",
                "修复问题",
                "- 按钮颜色不一致：修复了上传按钮与保存按钮颜色不统一的问题",
                "- 毛玻璃模式下的按钮样式：修复了毛玻璃模式下按钮样式与其他元素不协调的问题",
                "- 主题设置导航：修复了主题设置页面标题与导航文本不一致的问题",
                "- 主题设置：修复了暗色主题下启动器页面未正确同步主题的问题",
                "- 登录：修复了账户退出登录时，自定义背景残留的问题"
            ]
        },
        {
            version: "RC 2.2.1.1 (b1)",
            date: "2026-04-05",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "修复 账户退出登录后卡片显示为未登录但仍有自定义头像留存的问题",
                "修复 再次登录已退出的账户后登录页和游戏大厅等没有即时加载自定义头像的问题",
                "优化 退出登录时的头像清除逻辑，确保账户隔离",
                "优化 登录时的头像同步逻辑，确保立即显示自定义头像"
            ]
        },
        {
            version: "RC 2.2.1.0 (b1)",
            date: "2026-04-05",
            tag: "important",
            tagText: "重要更新",
            images: [
                "./images/2210.png",
                "./images/2210_2.png",
            ],
            features: [
                "新增 头像同步功能，在账户设置、登录页、游戏大厅等页面同步显示自定义头像",
                "修复 账户设置页面左上角头像不更新的问题",
                "优化 头像上传和同步逻辑，确保所有页面都能显示最新的头像",
                "优化 响应式设计，确保在各种设备上都有良好的用户体验"
            ]
        },
        {
            version: "RC 2.2.0.0 (b1)",
            date: "2026-04-05",
            tag: "important",
            tagText: "重要更新",
            images: [
                "./images/2120.png",
                "./images/2120_2.png",
            ],
            features: [
                "新增 开发者模式下新增演示功能",
                "新增 版本号右侧显示常规更新、重要更新和重大更新标签",
                "新增 图片查看器功能，支持放大缩小和拖拽移动",
                "新增 图片右上角添加查看图片提示",
                "新增 多张图片时水平排列并显示滚动条",
                "修复 开发者模式下LIST任务栏收起后竖条内会出现演示模式按钮的问题",
                "修复 图片查看器再次打开时没有动效的问题",
                "修复 图片查看器拖拽时松开鼠标左键后图片依旧会跟着鼠标移动的问题",
                "修复 禁止图片被拖拽出窗口外进行新建标签页或复制操作",
                "优化 按钮悬浮时的动效从向右浮动改为向上浮动",
                "优化 图片查看器窗口大小与版本更新记录窗口一致",
                "优化 为图片查看器添加弹出/关闭动效",
                "优化 将放大、缩小和还原按钮与关闭按钮放在同一排",
                "优化 图片查看器中添加灰色方框，明确图片显示区域",
                "优化 当同时存在的图片大小不一致时，通过固定容器尺寸使它们看上去长宽高都一样",
                "优化 如果更新公告中只存在一张图片，则保持原图片尺寸，不进行固定尺寸限制",
            ]
        },
        {
            version: "RC 2.1.1.0 (b1)",
            date: "2026-04-05",
            tag: "normal",
            tagText: "常规更新",
            images: [
                "./images/list.png"
            ],
            features: [
                "新增 版本更新记录中新版本条目使用图片说明的功能",
                "新增 版本更新记录界面布局及优化功能体验",
                "修复 版本更新记录出现两个滚动条的问题",
                "修复 已知问题"
            ]
        },
        {
            version: "RC 2.1.0.0 (b1)",
            date: "2026-04-04",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "修复 自动登录功能，现已正常且无需重新登录",
                "新增 启动器页面登出的提示逻辑",
                "修复 已知问题"
            ]
        },
        {
            version: "RC 2.0.0.0 (b1)",
            date: "2026-04-04",
            tag: "major",
            tagText: "重大更新",
            features: [
                "优化 账号注册时的所有流程及功能，包括验证码、密码、手机号、邮箱、用户名等",
                "优化 部分文本内容",
                "删除 账户设置显示UID",
                "优化 页面布局和操作体验",
                "优化 查看协议内容时的加载速度",
                "修复 切换至自定义服务器时未出现调试设置的问题",
                "其他 RC1.0及其之后的衍生版本的所有版本更新公告已移动至过时版本记录中",
                "修复 已知问题"
            ]
        }
    ],
    homepageUpdateContent: [
        {
            version: "RC 1.0.3.2 (a2)",
            date: "2026-04-27",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化改进",
                "- 功能调整：游戏大厅中暂时屏蔽游戏原声带功能",
            ]
        },
        {
            version: "RC 1.0.3.1 (a2)",
            date: "2026-04-18",
            tag: "important",
            tagText: "重要更新",
            features: [
                "新增功能",
                "- 成就系统更新：为记忆卡牌和颜色匹配游戏各新增两个成就",
                "- 记忆卡牌新增：记忆卡牌专家（累计完成20局游戏）和记忆大师（单局得分达到300分）",
                "- 颜色匹配新增：色彩大师（累计完成100局游戏）和万分王者（累计获得2000分）",
                "优化改进",
                "- 成就系统优化：修复了成就总数量计算错误的问题",
                "- 成就系统优化：修复了一键开启所有成就后成就数量混乱的问题",
                "- 成就系统优化：确保了记忆卡牌和颜色匹配游戏的成就数据互通",
                "- 成就系统优化：更新了成就进度显示，确保每个游戏的成就数量和进度正确显示",
                "修复问题",
                "- 修复 记忆卡牌和颜色匹配游戏成就条目单个按钮点击后没反应的问题",
                "- 修复 开发者模式下一键开启所有成就后记忆卡牌成就未启用的问题"
            ]
        },
        {
            version: "RC 1.0.3.0 (a2)",
            date: "2026-04-07",
            tag: "important",
            tagText: "重要更新",
            features: [
                "上线 记忆卡牌游戏 （BETA）",
                "修复 已知问题"
            ]
        },
        {
            version: "RC 1.0.2.0 (a2)",
            date: "2026-04-02",
            tag: "major",
            tagText: "重大更新",
            features: [
                "上线 贪吃蛇小游戏",
                "新增 新的成就条目及其新的功能",
                "优化 启动器游戏卡片图标，使其游戏主题更明晰",
                "修复 部分情况下，游戏中心会错误出现每日签到页面的内容的问题",
                "修复 已知问题"
            ]
        },
        {
            version: "RC 1.0.1.2 (a2)",
            date: "2026-04-01",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "下线 启动器页面中的版本回退功能，该功能因过于老旧且影响安全问题所以已被移除",
                "修复 已知问题"
            ]
        },
        {
            version: "RC 1.0.1.2 (a1)",
            date: "2026-04-01",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "更新 账户设置中的《用户协议》与《隐私政策》部分，并优化其使用体验",
                "修复 已知问题"
            ]
        },
        {
            version: "RC 1.0.1.1",
            date: "2026-04-01",
            tag: "major",
            tagText: "重大更新",
            features: [
                "新增 每日签到功能，包含30天日历视图",
                "新增 签到积分系统，支持积分累积",
                "新增 开发者模式下的签到管理功能",
                "优化 账户设置中的签到统计数据",
                "修复 已知问题"
            ]
        },
        {
            version: "RC 1.0.1.0",
            date: "2026-03-31",
            tag: "major",
            tagText: "重大更新",
            features: [
                "新增 百宝箱功能，包含多种实用工具",
                "新增 每日人品、运势、每日一句等功能",
                "新增 随机数生成器、掷骰子、抛硬币等工具",
                "优化 游戏中心卡片布局",
                "改进 整体用户体验"
            ]
        },
        {
            version: "RC 1.0.0.0",
            date: "2026-03-25",
            tag: "major",
            tagText: "重大更新",
            features: [
                "优化 启动器整体风格，使其更匹配全局主题",
                "改进 整体用户体验"
            ]
        }
    ],
    earlyUpdateContent: [],
    // 过时版本记录 - 启动器记录 (RC-L)
    outdatedLauncherContent: [
        {
            version: "RC-L 1.2.1.2 (a5)",
            date: "2026-04-04",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "修复 登录页卡片验证码点击无法刷新的问题",
                "修复 已知问题"
            ]
        },
        {
            version: "RC-L 1.2.1.2 (a4)",
            date: "2026-04-03",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "新增 账户设置页面显示启动器版本号",
                "优化 退出登录后启动器主页重定向逻辑",
                "修复 已知问题"
            ]
        },
        {
            version: "RC-L 1.2.1.2 (a3)",
            date: "2026-04-02",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "修复 登录页查看《用户协议》和《隐私政策》无法上下滑动的问题",
                "新增 登录页版权信息显示",
                "新增 登录页反馈建议功能",
                "修复 已知问题"
            ]
        },
        {
            version: "RC-L 1.2.1.1 (a3)",
            date: "2026-04-02",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "新增 账户注销七天等待期",
                "新增 用户协议与隐私政策最后更新日期",
                "修复 已知问题"
            ]
        },
        {
            version: "RC-L 1.2.1.0 (a3)",
            date: "2026-04-01",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 登录页版本更新公告窗口样式及其操作体验",
                "修复 已知问题"
            ]
        },
        {
            version: "RC-L 1.2.1.0 (a2)",
            date: "2026-04-01",
            tag: "important",
            tagText: "重要更新",
            features: [
                "更新 登录页提供查看《用户协议》与《隐私政策》的功能",
                "添加 登陆或注册账户时必须要确定《用户协议》与《隐私政策》",
                "修复 已知问题"
            ]
        },
        {
            version: "RC-L 1.2.1.0 (a1)",
            date: "2026-03-31",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "更新 验证码生成，现已接入网络请求",
                "修复 已知问题"
            ]
        },
        {
            version: "RC-L 1.2.0.0 (a1)",
            date: "2026-03-25",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 各种运行问题",
                "修复 已知问题"
            ]
        },
        {
            version: "RC-L 1.1.0.0",
            date: "2026-03-22",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "新增 查看账户设置功能，以及退出登录及其更多",
                "优化 登录注册流程",
                "改进 用户体验"
            ]
        },
        {
            version: "RC-L 1.0.0.0",
            date: "2026-03-22",
            tag: "major",
            tagText: "重大更新",
            features: [
                "更新游戏启动器登录页，独立保存每个玩家的游戏数据",
                "支持账号注册和登录",
                "多个新功能及其优化",
                "优化界面设计"
            ]
        }
    ],
    // 过时版本记录 - 主页面记录 (RC-H)
    outdatedHomepageContent: [
        {
            version: "RC-H 4.0.0 ",
            date: "无记录",
            tag: "",
            tagText: "",
            features: [
                "过渡版",
                "开发者模式模块测试"
            ]
        },
        {
            version: "RC-H 3.3.0 ",
            date: "2026-02-28",
            tag: "important",
            tagText: "重要更新",
            features: [
                "修复 版本更新公告未正确显示更新时间和版本号的问题",
                "修复 版本回退未正确启用的问题",
                "修复 切换语言选项中未正确出现日语语言的问题",
                "修复 重要更新提示及其他提示未正确生效显示undefined的问题",
                "修复 进入游戏跳转错误的问题",
                "禁用 切换游戏/模拟器的功能按钮",
                "优化 UI排版",
                "优化 界面流畅度，提升用户体验"
            ]
        },
        {
            version: "RC-H 3.2.0 ",
            date: "2026-02-28",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "新增 日语语言"
            ]
        },
        {
            version: "RC-H 3.1.0 ",
            date: "2026-02-28",
            tag: "important",
            tagText: "重要更新",
            features: [
                "上线 飞行器小游戏",
                "优化 小游戏卡片显示逻辑",
                "优化 界面UI排列",
                "优化 界面流畅度，提升用户体验"
            ]
        },
        {
            version: "RC-H 3.0.0 ",
            date: "2026-02-27",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "新增 版本回退功能",
                "优化 部分文本内容",
                "优化 界面流畅度，提升用户体验"
            ]
        },
        {
            version: "BETA-H 3.0.1 ",
            date: "2026-02-27",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 版本公告翻页过渡效果",
                "优化 查看版本公告时固定窗口大小使其不会来回变动"
            ]
        },
        {
            version: "BETA-H 3.0.0 ",
            date: "2026-02-27",
            tag: "important",
            tagText: "重要更新",
            features: [
                "新增 游戏/模拟器切换按钮",
                "新增 Windows11网页模拟器",
                "修复 重要更新提示未正确启用的问题",
                "新增 版本更新公告增加RC/BETA公告切换按钮"
            ]
        },
        {
            version: "RC-H 2.0 ",
            date: "2026-02-26",
            tag: "important",
            tagText: "重要更新",
            features: [
                "新增 五子棋小游戏"
            ]
        },
        {
            version: "RC-H 1.1",
            date: "2026-02-26",
            tag: "important",
            tagText: "重要更新",
            features: [
                "新增 英文语言",
                "新增 中英文切换按钮"
            ]
        },
        {
            version: "RC-H 1.0.2 ",
            date: "2026-02-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "新增 版本更新公告重要更新提示",
                "修复 版本更新公告错误排版问题"
            ]
        },
        {
            version: "RC-H 1.0.1.1 ",
            date: "2026-02-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 点击版本更新公告时，窗口的淡入，淡出效果"
            ]
        },
        {
            version: "RC-H 1.0.1 ",
            date: "2026-02-26",
            tag: "major",
            tagText: "重大更新",
            features: [
                "新增 版本更新公告，快速查看更新内容",
                "新增 进入小游戏页面的过渡效果"
            ]
        },
        {
            version: "RC-H 1.0.0 ",
            date: "2026-02-26",
            tag: "major",
            tagText: "重大更新",
            features: [
                "上线 [点击方块]小游戏",
                "新增 各项界面视觉体验"
            ]
        }
    ]
};

// 加载版本历史数据到页面
function loadVersionHistory() {
    // 遍历所有版本历史内容区域
    Object.keys(versionHistoryData).forEach(function(sectionId) {
        var section = document.getElementById(sectionId);
        if (section) {
            // 清空现有内容
            section.innerHTML = '';
            
            // 添加版本更新项
            versionHistoryData[sectionId].forEach(function(versionItem) {
                var versionElement = document.createElement('div');
                versionElement.className = 'version-item';
                
                // 构建版本项HTML
                var versionHTML = `
                    <div class="version-header">
                        <span class="version-number">${versionItem.version}</span>
                        <div class="version-header-content">
                            ${versionItem.tag ? `<span class="version-tag ${versionItem.tag}">${versionItem.tagText}</span>` : ''}
                            <button class="view-log-btn" onclick="toggleVersionDetails(this)">查看日志 <span style="margin-left: 4px;">▶</span></button>
                        </div>
                        <span class="version-date">${versionItem.date}</span>
                    </div>
                    <div class="version-details" style="display: none;">
                `
                
                // 添加版本图片（如果有）
                if (versionItem.images && versionItem.images.length > 0) {
                    var isSingleImage = versionItem.images.length === 1;
                    versionHTML += `
                        <div class="version-images ${isSingleImage ? 'single-image' : ''}">
                    `;
                    versionItem.images.forEach(function(image) {
                        versionHTML += `
                            <div class="image-container ${isSingleImage ? 'single-image-container' : ''}">
                                <img src="${image}" alt="版本更新图片" class="version-image ${isSingleImage ? 'single-image-item' : ''}" draggable="false">
                                <div class="image-tooltip">查看图片</div>
                            </div>
                        `;
                    });
                    versionHTML += `
                        </div>
                    `;
                }
                
                // 添加版本特性
                versionHTML += `
                        <ul class="version-features">
                `;
                
                versionItem.features.forEach(function(feature) {
                    // 解析颜色格式 [color:red]文本[/color]
                    let formattedFeature = feature;
                    const colorRegex = /\[color:(\w+)\]([^\[]+)\[\/color\]/g;
                    formattedFeature = formattedFeature.replace(colorRegex, '<span style="color: $1;">$2</span>');
                    
                    versionHTML += `
                            <li>${formattedFeature}</li>
                    `;
                });
                
                versionHTML += `
                        </ul>
                    </div>
                `;
                
                versionElement.innerHTML = versionHTML;
                section.appendChild(versionElement);
            });
        }
    });
    
    // 为选择功能更新按钮添加点击事件
    var featureUpdateNav = document.getElementById('featureUpdateNav');
    if (featureUpdateNav) {
        featureUpdateNav.addEventListener('click', function(e) {
            // 阻止事件冒泡，避免触发导航初始化中的点击事件
            e.stopPropagation();
            
            // 显示子按钮
            var subButtons = document.getElementById('featureSubButtons');
            if (subButtons) {
                var isHidden = subButtons.style.display === 'none';
                subButtons.style.display = isHidden ? 'block' : 'none';
                
                // 如果是收起子按钮，隐藏所有"查看中"tag
                if (!isHidden) {
                    var allViewingTags = document.querySelectorAll('.viewing-tag');
                    allViewingTags.forEach(function(tag) {
                        tag.style.display = 'none';
                    });
                }
            }
            
            // 隐藏过时版本记录的子按钮
            var outdatedSubButtons = document.getElementById('outdatedSubButtons');
            if (outdatedSubButtons) {
                outdatedSubButtons.style.display = 'none';
            }
            
            // 显示提示文本
            var contentArea = document.querySelector('.terms-content');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
                        <div style="font-size: 48px; margin-bottom: 20px; color: #667eea;">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                        <p class="select-hint" style="font-style: normal; color: black; text-align: center; padding: 0; margin: 0;">请选择要查看的功能更新</p>
                    </div>
                `;
            }
            
            // 确保其他导航项不处于active状态
            var navItems = document.querySelectorAll('#versionHistoryModal .terms-nav-item');
            navItems.forEach(function(navItem) {
                navItem.classList.remove('active');
            });
            this.classList.add('active');
        });
    }
    
    // 为过时版本记录按钮添加点击事件
    var earlyUpdateNav = document.getElementById('earlyUpdateNav');
    if (earlyUpdateNav) {
        earlyUpdateNav.addEventListener('click', function(e) {
            // 阻止事件冒泡，避免触发导航初始化中的点击事件
            e.stopPropagation();
            
            // 显示子按钮
            var subButtons = document.getElementById('outdatedSubButtons');
            if (subButtons) {
                var isHidden = subButtons.style.display === 'none';
                subButtons.style.display = isHidden ? 'block' : 'none';
                
                // 如果是收起子按钮，隐藏所有"查看中"tag
                if (!isHidden) {
                    var allViewingTags = document.querySelectorAll('.viewing-tag');
                    allViewingTags.forEach(function(tag) {
                        tag.style.display = 'none';
                    });
                }
            }
            
            // 隐藏选择功能更新的子按钮
            var featureSubButtons = document.getElementById('featureSubButtons');
            if (featureSubButtons) {
                featureSubButtons.style.display = 'none';
            }
            
            // 显示提示文本
            var contentArea = document.querySelector('.terms-content');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
                        <div style="font-size: 48px; margin-bottom: 20px; color: #667eea;">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                        <p class="select-hint" style="font-style: normal; color: black; text-align: center; padding: 0; margin: 0;">请选择要查看的过时版本记录</p>
                    </div>
                `;
            }
            
            // 确保其他导航项不处于active状态
            var navItems = document.querySelectorAll('#versionHistoryModal .terms-nav-item');
            navItems.forEach(function(navItem) {
                navItem.classList.remove('active');
            });
            this.classList.add('active');
        });
    }
    
    // 按主版本号和次版本号分组版本数据
    function groupVersionsByMajorVersion(versions) {
        var grouped = {};
        
        versions.forEach(function(versionItem) {
            // 提取主版本号和次版本号（如从 "RC 2.6.0.1 (b3)" 中提取 "2.6"）
            var versionMatch = versionItem.version.match(/RC\s+(\d+)\.(\d+)\.\d+\.\d+/);
            var majorVersion;
            var isRC = versionItem.version.includes('RC');
            
            if (versionMatch) {
                majorVersion = versionMatch[1] + '.' + versionMatch[2];
            } else {
                // 处理其他格式的版本号
                versionMatch = versionItem.version.match(/(\d+)\.(\d+)/);
                majorVersion = versionMatch ? versionMatch[1] + '.' + versionMatch[2] : '其他版本';
            }
            
            if (!grouped[majorVersion]) {
                grouped[majorVersion] = { versions: [], isRC: isRC };
            }
            grouped[majorVersion].versions.push(versionItem);
        });
        
        // 按版本号降序排序
        var sortedGroups = [];
        Object.keys(grouped).sort(function(a, b) {
            // 处理"其他版本"的情况
            if (a === '其他版本') return 1;
            if (b === '其他版本') return -1;
            
            // 提取版本号进行比较
            var aParts = a.split('.').map(Number);
            var bParts = b.split('.').map(Number);
            
            // 比较主版本号
            if (aParts[0] !== bParts[0]) {
                return bParts[0] - aParts[0];
            }
            // 比较次版本号
            if (aParts[1] !== bParts[1]) {
                return bParts[1] - aParts[1];
            }
            return 0;
        }).forEach(function(key) {
            var group = { 
                majorVersion: key, 
                versions: grouped[key].versions, 
                isRC: grouped[key].isRC 
            };
            
            // 计算最早和最晚日期
            if (group.versions.length > 0) {
                // 按日期正序排序以获取最早和最晚日期
                var sortedByDate = [...group.versions].sort(function(a, b) {
                    return new Date(a.date) - new Date(b.date);
                });
                group.startDate = sortedByDate[0].date;
                group.endDate = sortedByDate[sortedByDate.length - 1].date;
                
                // 按日期倒序排序版本列表
                group.versions.sort(function(a, b) {
                    return new Date(b.date) - new Date(a.date);
                });
            }
            
            sortedGroups.push(group);
        });
        
        return sortedGroups;
    }
    
    // 为子按钮添加点击事件
    var subButtons = document.querySelectorAll('.sub-button');
    subButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            // 阻止事件冒泡
            e.stopPropagation();
            
            // 隐藏所有"查看中"tag
            var allViewingTags = document.querySelectorAll('.viewing-tag');
            allViewingTags.forEach(function(tag) {
                tag.style.display = 'none';
            });
            
            // 显示当前按钮的"查看中"tag
            var viewingTag = this.querySelector('.viewing-tag');
            if (viewingTag) {
                viewingTag.style.display = 'inline-block';
            }
            
            var type = this.getAttribute('data-type');
            var contentArea = document.querySelector('.terms-content');
            if (contentArea) {
                // 清空内容
                contentArea.innerHTML = '';
                
                // 检查按钮所属的父容器，确定加载哪种数据
                var parentId = this.closest('.sub-buttons').id;
                var data;
                
                if (parentId === 'featureSubButtons') {
                    // 功能更新按钮
                    data = type === 'launcher' ? versionHistoryData.launcherUpdateContent : versionHistoryData.homepageUpdateContent;
                } else if (parentId === 'outdatedSubButtons') {
                    // 过时版本记录按钮
                    data = type === 'launcher' ? versionHistoryData.outdatedLauncherContent : versionHistoryData.outdatedHomepageContent;
                }
                
                // 按主版本号分组
                var groupedVersions = groupVersionsByMajorVersion(data);
                
                // 显示版本选择界面
                function showVersionSelection() {
                    // 清空内容
                    contentArea.innerHTML = '';
                    
                    // 添加提示文本
                    var hintText = document.createElement('p');
                    hintText.className = 'version-selection-hint';
                    hintText.style.cssText = `
                        font-style: normal;
                        text-align: center;
                        padding: 20px 0;
                        margin-bottom: 20px;
                        font-size: 16px;
                    `;
                    hintText.textContent = ' 请选择要查看的版本更新 ';
                    contentArea.appendChild(hintText);
                    
                    // 生成主版本号分组按钮
                    groupedVersions.forEach(function(group) {
                        var groupButton = document.createElement('div');
                        groupButton.className = 'version-item';
                        groupButton.style.cssText = `
                            margin: 15px 0;
                            padding: 15px;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        `;
                        
                        // 添加鼠标悬浮效果
                        groupButton.addEventListener('mouseenter', function() {
                            this.style.transform = 'translateY(-2px)';
                            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                        });
                        
                        groupButton.addEventListener('mouseleave', function() {
                            this.style.transform = 'translateY(0)';
                            this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                        });
                        
                        // 确定版本状态
                        var versionStatus = '';
                        var statusColor = '';
                        
                        // 检查是否是过时版本记录
                        var isOutdated = parentId === 'outdatedSubButtons';
                        
                        if (isOutdated) {
                            versionStatus = '已过时版本';
                            statusColor = '#999';
                        } else {
                            // 对于当前版本，判断维护状态
                            // 假设最新的主版本是维护中的
                            var latestVersion = groupedVersions[0].majorVersion;
                            if (group.majorVersion === latestVersion) {
                                versionStatus = '版本维护中';
                                statusColor = '#4CAF50';
                            } else {
                                versionStatus = '更新已结束';
                                statusColor = '#f44336';
                            }
                        }
                        
                        // 设置按钮内容
                        groupButton.innerHTML = `
                            <div class="version-header">
                                <span class="version-number" style="font-size: 18px; font-weight: bold; color: #d45d79;">${group.isRC ? 'RC' : '版本'} ${group.majorVersion}</span>
                                <div class="version-header-content">
                                    <button style="padding: 4px 12px; border: none; border-radius: 12px; font-size: 12px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; cursor: pointer; transition: all 0.3s ease; flex-shrink: 0;">查看详细内容 <span style="margin-left: 4px;">▶</span></button>
                                </div>
                                <span class="version-date-range" style="font-size: 14px; margin-left: auto; margin-right: 10px;">从 ${group.startDate} 至 ${group.endDate} 的更新</span>
                                <span class="version-count" style="font-size: 14px; margin-left: 0; margin-right: 10px;">共 ${group.versions.length} 个版本</span>
                                <span style="padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; background-color: ${statusColor}; color: white;">${versionStatus}</span>
                            </div>
                        `;
                        
                        // 添加点击事件，显示该主版本号下的所有版本
                        groupButton.addEventListener('click', function() {
                            // 清空内容
                            contentArea.innerHTML = '';
                            
                            // 添加返回按钮和排序控制
                            var controlsContainer = document.createElement('div');
                            controlsContainer.style.cssText = `
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-start;
                                margin-bottom: 0;
                                position: sticky;
                                top: 0;
                                z-index: 100;
                                background-color: none;
                                padding: 0;
                                border-radius: 10px 10px 0 0;
                            `;
                            
                            // 按钮容器
                            var buttonContainer = document.createElement('div');
                            buttonContainer.style.cssText = `
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                margin-bottom: 5px;
                                margin-top: 2px;
                            `;
                            
                            // 返回按钮
                            var backButton = document.createElement('button');
                            backButton.className = 'back-button';
                            backButton.style.cssText = `
                                padding: 8px 16px;
                                background: linear-gradient(135deg, #d45d79 0%, #e67e8a 100%);
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                transition: all 0.3s ease;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                                display: flex;
                                align-items: center;
                                gap: 5px;
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
                            backButton.innerHTML = '<i class="fas fa-arrow-left"></i> 返回';
                            
                            // 返回按钮点击事件
                            backButton.addEventListener('click', showVersionSelection);
                            
                            // 排序按钮
                            var sortButton = document.createElement('button');
                            sortButton.className = 'sort-button';
                            sortButton.style.cssText = `
                                padding: 8px 16px;
                                background: linear-gradient(135deg, #d45d79 0%, #e67e8a 100%);
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                transition: all 0.3s ease;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                                display: flex;
                                align-items: center;
                                gap: 5px;
                            `;
                            
                            // 添加鼠标悬浮效果
                            sortButton.addEventListener('mouseenter', function() {
                                this.style.transform = 'translateY(-3px)';
                                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                            });
                            
                            sortButton.addEventListener('mouseleave', function() {
                                this.style.transform = 'translateY(0)';
                                this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                            });
                            
                            // 排序状态
                            var isAscending = false;
                            sortButton.innerHTML = '<i class="fas fa-sort-down"></i> 倒序';
                            
                            // 排序函数
                            function sortVersions() {
                                // 切换排序状态
                                isAscending = !isAscending;
                                
                                // 更新排序按钮文本
                                if (isAscending) {
                                    sortButton.innerHTML = '<i class="fas fa-sort-up"></i> 正序';
                                } else {
                                    sortButton.innerHTML = '<i class="fas fa-sort-down"></i> 倒序';
                                }
                                
                                // 清空内容，重新添加控件
                                contentArea.innerHTML = '';
                                contentArea.appendChild(controlsContainer);
                                
                                // 排序版本
                                var sortedVersions = [...group.versions];
                                sortedVersions.sort(function(a, b) {
                                    // 提取版本号进行比较
                                    var aMatch = a.version.match(/RC.*?(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/);
                                    var bMatch = b.version.match(/RC.*?(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/);
                                    
                                    if (aMatch && bMatch) {
                                        var aVersion = aMatch.slice(1).map(Number);
                                        var bVersion = bMatch.slice(1).map(Number);
                                        
                                        // 确保版本号数组长度一致
                                        while (aVersion.length < 4) aVersion.push(0);
                                        while (bVersion.length < 4) bVersion.push(0);
                                        
                                        for (var i = 0; i < 4; i++) {
                                            if (aVersion[i] !== bVersion[i]) {
                                                return isAscending ? aVersion[i] - bVersion[i] : bVersion[i] - aVersion[i];
                                            }
                                        }
                                    }
                                    
                                    // 如果版本号格式不匹配，按日期排序
                                    return isAscending ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
                                });
                                
                                // 生成排序后的版本历史内容
                                sortedVersions.forEach(function(versionItem) {
                                    var versionElement = document.createElement('div');
                                    versionElement.className = 'version-item';
                                    
                                    // 构建版本项HTML
                                    var versionHTML = `
                                        <div class="version-header">
                                            <span class="version-number">${versionItem.version}</span>
                                            <div class="version-header-content">
                                                ${versionItem.tag ? `<span class="version-tag ${versionItem.tag}">${versionItem.tagText}</span>` : ''}
                                                <button class="view-log-btn" onclick="toggleVersionDetails(this)">查看日志 <span style="margin-left: 4px;">▶</span></button>
                                            </div>
                                            <span class="version-date">${versionItem.date}</span>
                                        </div>
                                        <div class="version-details" style="display: none;">
                                    `;
                                    
                                    // 添加版本图片（如果有）
                                    if (versionItem.images && versionItem.images.length > 0) {
                                        var isSingleImage = versionItem.images.length === 1;
                                        versionHTML += `
                                            <div class="version-images ${isSingleImage ? 'single-image' : ''}">
                                        `;
                                        versionItem.images.forEach(function(image) {
                                            versionHTML += `
                                                <div class="image-container ${isSingleImage ? 'single-image-container' : ''}">
                                                    <img src="${image}" alt="版本更新图片" class="version-image ${isSingleImage ? 'single-image-item' : ''}" draggable="false">
                                                    <div class="image-tooltip">查看图片</div>
                                                </div>
                                            `;
                                        });
                                        versionHTML += `
                                            </div>
                                        `;
                                    }
                                    
                                    // 添加版本特性
                                    versionHTML += `
                                            <ul class="version-features">
                                    `;
                                    
                                    versionItem.features.forEach(function(feature) {
                                        // 解析颜色格式 [color:red]文本[/color]
                                        let formattedFeature = feature;
                                        const colorRegex = /\[color:(\w+)\]([^\[]+)\[\/color\]/g;
                                        formattedFeature = formattedFeature.replace(colorRegex, '<span style="color: $1;">$2</span>');
                                        
                                        versionHTML += `
                                                <li>${formattedFeature}</li>
                                        `;
                                    });
                                    
                                    versionHTML += `
                                            </ul>
                                        </div>
                                    `;
                                    
                                    versionElement.innerHTML = versionHTML;
                                    contentArea.appendChild(versionElement);
                                });
                            }
                            
                            // 排序按钮点击事件
                            sortButton.addEventListener('click', sortVersions);
                            
                            // 添加按钮到按钮容器
                            buttonContainer.appendChild(backButton);
                            buttonContainer.appendChild(sortButton);
                            
                            // 添加按钮容器到控件容器
                            controlsContainer.appendChild(buttonContainer);
                            
                            // 添加控件容器到内容区域
                            contentArea.appendChild(controlsContainer);
                            
                            // 初始生成版本历史内容（默认倒序）
                            var sortedVersions = [...group.versions];
                            sortedVersions.sort(function(a, b) {
                                // 提取版本号进行比较
                                var aMatch = a.version.match(/RC.*?(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/);
                                var bMatch = b.version.match(/RC.*?(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/);
                                
                                if (aMatch && bMatch) {
                                    var aVersion = aMatch.slice(1).map(Number);
                                    var bVersion = bMatch.slice(1).map(Number);
                                    
                                    // 确保版本号数组长度一致
                                    while (aVersion.length < 4) aVersion.push(0);
                                    while (bVersion.length < 4) bVersion.push(0);
                                    
                                    for (var i = 0; i < 4; i++) {
                                        if (aVersion[i] !== bVersion[i]) {
                                            return bVersion[i] - aVersion[i]; // 倒序
                                        }
                                    }
                                }
                                
                                // 如果版本号格式不匹配，按日期倒序排序
                                return new Date(b.date) - new Date(a.date);
                            });
                            
                            sortedVersions.forEach(function(versionItem) {
                                var versionElement = document.createElement('div');
                                versionElement.className = 'version-item';
                                
                                // 构建版本项HTML
                                var versionHTML = `
                                    <div class="version-header">
                                        <span class="version-number">${versionItem.version}</span>
                                        <div class="version-header-content">
                                            ${versionItem.tag ? `<span class="version-tag ${versionItem.tag}">${versionItem.tagText}</span>` : ''}
                                            <button class="view-log-btn" onclick="toggleVersionDetails(this)">查看日志 <span style="margin-left: 4px;">▶</span></button>
                                        </div>
                                        <span class="version-date">${versionItem.date}</span>
                                    </div>
                                    <div class="version-details" style="display: none;">
                                `;
                                
                                // 添加版本图片（如果有）
                                if (versionItem.images && versionItem.images.length > 0) {
                                    var isSingleImage = versionItem.images.length === 1;
                                    versionHTML += `
                                        <div class="version-images ${isSingleImage ? 'single-image' : ''}">
                                    `;
                                    versionItem.images.forEach(function(image) {
                                        versionHTML += `
                                            <div class="image-container ${isSingleImage ? 'single-image-container' : ''}">
                                                <img src="${image}" alt="版本更新图片" class="version-image ${isSingleImage ? 'single-image-item' : ''}" draggable="false">
                                                <div class="image-tooltip">查看图片</div>
                                            </div>
                                        `;
                                    });
                                    versionHTML += `
                                        </div>
                                    `;
                                }
                                
                                // 添加版本特性
                                versionHTML += `
                                        <ul class="version-features">
                                `;
                                
                                versionItem.features.forEach(function(feature) {
                                    // 解析颜色格式 [color:red]文本[/color]
                                    let formattedFeature = feature;
                                    const colorRegex = /\[color:(\w+)\]([^\[]+)\[\/color\]/g;
                                    formattedFeature = formattedFeature.replace(colorRegex, '<span style="color: $1;">$2</span>');
                                    
                                    versionHTML += `
                                            <li>${formattedFeature}</li>
                                    `;
                                });
                                
                                versionHTML += `
                                        </ul>
                                    </div>
                                `;
                                
                                versionElement.innerHTML = versionHTML;
                                contentArea.appendChild(versionElement);
                            });
                        });
                        
                        contentArea.appendChild(groupButton);
                    });
                }
                
                // 初始显示版本选择界面
                showVersionSelection();
            }
        });
    });
}

// 切换版本详情展开/收起
function toggleVersionDetails(button) {
    const versionItem = button.closest('.version-item');
    const details = versionItem.querySelector('.version-details');
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        button.innerHTML = '收起日志 <span style="margin-left: 4px;">▼</span>';
    } else {
        details.style.display = 'none';
        button.innerHTML = '查看日志 <span style="margin-left: 4px;">▶</span>';
    }
}

// 图片查看器功能
function initImageViewer() {
    // 创建图片查看器模态框
    var imageViewerModal = document.createElement('div');
    imageViewerModal.id = 'imageViewerModal';
    imageViewerModal.className = 'custom-alert';
    imageViewerModal.style.display = 'none';
    imageViewerModal.innerHTML = `
        <div class="alert-content image-viewer-content">
            <div class="alert-icon">
                <i class="fas fa-image"></i>
            </div>
            <h3>图片查看器</h3>
            <div class="image-viewer-container" id="imageViewerContainer">
                <img id="viewerImage" src="" alt="查看图片" draggable="false">
            </div>
            <div class="terms-modal-buttons">
                <button class="viewer-btn" id="zoomInBtn"><i class="fas fa-search-plus"></i> 放大</button>
                <button class="viewer-btn" id="zoomOutBtn"><i class="fas fa-search-minus"></i> 缩小</button>
                <button class="viewer-btn" id="resetZoomBtn"><i class="fas fa-sync-alt"></i> 重置</button>
                <button class="alert-confirm" id="closeImageViewer">关闭</button>
            </div>
        </div>
    `;
    document.body.appendChild(imageViewerModal);
    
    // 初始状态
    var currentZoom = 1;
    var currentX = 0;
    var currentY = 0;
    var isDragging = false;
    var startX = 0;
    var startY = 0;
    var viewerImage = document.getElementById('viewerImage');
    var imageContainer = document.getElementById('imageViewerContainer');
    
    // 设置图片样式
    viewerImage.style.position = 'relative';
    viewerImage.style.transformOrigin = 'center center';
    
    // 关闭图片查看器
    document.getElementById('closeImageViewer').addEventListener('click', function() {
        imageViewerModal.classList.remove('show');
        setTimeout(function() {
            imageViewerModal.style.display = 'none';
            resetViewer();
        }, 300); // 等待动画完成
    });
    
    // 放大图片
    document.getElementById('zoomInBtn').addEventListener('click', function() {
        zoomImage(0.1);
    });
    
    // 缩小图片
    document.getElementById('zoomOutBtn').addEventListener('click', function() {
        zoomImage(-0.1);
    });
    
    // 重置缩放
    document.getElementById('resetZoomBtn').addEventListener('click', function() {
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
        viewerImage.style.cursor = 'grab';
    }
    
    // 添加多个事件监听器确保拖拽正确结束
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('mouseleave', endDrag);
    window.addEventListener('mouseout', endDrag);
    window.addEventListener('blur', endDrag);
    imageContainer.addEventListener('mouseleave', endDrag);
    
    // 缩放图片
    function zoomImage(delta) {
        var newZoom = currentZoom + delta;
        if (newZoom > 0.1 && newZoom < 5) { // 限制缩放范围
            currentZoom = newZoom;
            updateImagePosition();
        }
    }
    
    // 更新图片位置
    function updateImagePosition() {
        // 应用变换
        viewerImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
        
        // 确保图片保持在窗口内
        keepImageInBounds();
    }
    
    // 确保图片保持在窗口内
    function keepImageInBounds() {
        var containerRect = imageContainer.getBoundingClientRect();
        var imageRect = viewerImage.getBoundingClientRect();
        
        // 计算边界
        var minX = containerRect.left + 20 - imageRect.left;
        var maxX = containerRect.right - 20 - (imageRect.left + imageRect.width);
        var minY = containerRect.top + 20 - imageRect.top;
        var maxY = containerRect.bottom - 20 - (imageRect.top + imageRect.height);
        
        // 调整位置
        currentX = Math.max(minX, Math.min(maxX, currentX));
        currentY = Math.max(minY, Math.min(maxY, currentY));
        
        // 重新应用变换
        viewerImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
    }
    
    // 重置查看器
    function resetViewer() {
        currentZoom = 1;
        currentX = 0;
        currentY = 0;
        viewerImage.style.transform = 'translate(0, 0) scale(1)';
        viewerImage.style.cursor = 'grab';
    }
    
    // 为所有版本图片添加点击事件
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('version-image')) {
            var imageSrc = e.target.src;
            viewerImage.src = imageSrc;
            resetViewer(); // 重置查看器状态
            imageViewerModal.style.display = 'flex';
            setTimeout(function() {
                imageViewerModal.classList.add('show');
                // 确保图片加载后保持在窗口内，但不自动放大
                viewerImage.onload = function() {
                    // 只确保图片在容器内，不调整大小
                    var containerRect = imageContainer.getBoundingClientRect();
                    var imageRect = viewerImage.getBoundingClientRect();
                    
                    // 计算边界
                    var minX = containerRect.left + 20 - imageRect.left;
                    var maxX = containerRect.right - 20 - (imageRect.left + imageRect.width);
                    var minY = containerRect.top + 20 - imageRect.top;
                    var maxY = containerRect.bottom - 100 - (imageRect.top + imageRect.height); // 预留空间给按钮
                    
                    // 调整位置
                    currentX = Math.max(minX, Math.min(maxX, currentX));
                    currentY = Math.max(minY, Math.min(maxY, currentY));
                    
                    // 应用变换
                    viewerImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
                };
            }, 10);
        }
    });
    
    // 阻止图片被拖拽
    document.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('version-image') || e.target.id === 'viewerImage') {
            e.preventDefault();
        }
    });
}

// 当文档加载完成时执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        loadVersionHistory();
        initImageViewer();
    });
} else {
    loadVersionHistory();
    initImageViewer();
}
