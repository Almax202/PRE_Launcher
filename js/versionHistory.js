function getVersionImageUrl(imagePath) {
    return imagePath;
}

// 版本更新本地存储键名
const VERSION_STORAGE_KEYS = {
    LAST_VIEWED_VERSION_DATE: 'last_viewed_version_date',
    VIEWED_VERSION_IDS: 'viewed_version_ids'
};

// 获取所有版本更新的最新日期
function getLatestVersionDate() {
    let latestDate = null;
    
    Object.keys(versionHistoryData).forEach(function(sectionId) {
        versionHistoryData[sectionId].forEach(function(version) {
            if (!latestDate || new Date(version.date) > new Date(latestDate)) {
                latestDate = version.date;
            }
        });
    });
    
    return latestDate;
}

// 检查是否有新版本更新
function hasNewVersionUpdates() {
    const lastViewedDate = localStorage.getItem(VERSION_STORAGE_KEYS.LAST_VIEWED_VERSION_DATE);
    const latestDate = getLatestVersionDate();
    
    if (!lastViewedDate || !latestDate) {
        return false;
    }
    
    return new Date(latestDate) > new Date(lastViewedDate);
}

function scrollVersionImages(btn, direction) {
    var container = btn.parentElement;
    var scrollContainer = container.querySelector('.version-images');
    if (!scrollContainer) return;
    
    var scrollAmount = scrollContainer.offsetWidth * 0.85;
    scrollContainer.scrollBy({
        left: scrollAmount * direction,
        behavior: 'smooth'
    });
    
    setTimeout(function() {
        updateVersionScrollButtons(scrollContainer);
    }, 300);
}

function updateVersionScrollButtons(scrollContainer) {
    if (!scrollContainer) return;
    
    var container = scrollContainer.parentElement;
    var leftBtn = container.querySelector('.version-scroll-btn.left');
    var rightBtn = container.querySelector('.version-scroll-btn.right');
    
    if (!leftBtn || !rightBtn) return;
    
    if (scrollContainer.classList.contains('single-image')) {
        leftBtn.classList.remove('show');
        rightBtn.classList.remove('show');
        return;
    }
    
    var isAtStart = scrollContainer.scrollLeft < 10;
    var isAtEnd = scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 10;
    
    if (isAtStart) {
        leftBtn.classList.remove('show');
    } else {
        leftBtn.classList.add('show');
    }
    
    if (isAtEnd) {
        rightBtn.classList.remove('show');
    } else {
        rightBtn.classList.add('show');
    }
}

function initVersionScrollButtons() {
    var allScrollContainers = document.querySelectorAll('.version-images');
    allScrollContainers.forEach(function(container) {
        if (container.dataset.scrollButtonsInitialized === 'true') {
            updateVersionScrollButtons(container);
            return;
        }
        
        container.dataset.scrollButtonsInitialized = 'true';
        
        updateVersionScrollButtons(container);
        
        container.addEventListener('scroll', function() {
            updateVersionScrollButtons(container);
        });
        
        container.addEventListener('mouseenter', function() {
            updateVersionScrollButtons(container);
        });
    });
}

// 更新最后查看版本日期
function updateLastViewedVersionDate() {
    const latestDate = getLatestVersionDate();
    if (latestDate) {
        localStorage.setItem(VERSION_STORAGE_KEYS.LAST_VIEWED_VERSION_DATE, latestDate);
    }
}

// 获取已查看的版本ID列表
function getViewedVersionIds() {
    const stored = localStorage.getItem(VERSION_STORAGE_KEYS.VIEWED_VERSION_IDS);
    return stored ? JSON.parse(stored) : [];
}

// 标记版本为已查看
function markVersionAsViewed(versionId) {
    const viewedIds = getViewedVersionIds();
    if (!viewedIds.includes(versionId)) {
        viewedIds.push(versionId);
        localStorage.setItem(VERSION_STORAGE_KEYS.VIEWED_VERSION_IDS, JSON.stringify(viewedIds));
    }
}

// 检查版本是否已查看
function isVersionViewed(versionId) {
    return getViewedVersionIds().includes(versionId);
}

// 生成版本唯一标识符（版本号+日期，确保相同版本号不同日期的更新能被正确识别）
function generateVersionId(version) {
    return version.version.replace(/\s/g, '') + '-' + version.date;
}

// 获取未查看版本数量
function getUnviewedVersionCount() {
    let count = 0;
    console.log('[DEBUG] getUnviewedVersionCount called');
    console.log('[DEBUG] versionHistoryData exists:', typeof versionHistoryData !== 'undefined');
    if (typeof versionHistoryData !== 'undefined' && versionHistoryData.launcherUpdateContent && versionHistoryData.launcherUpdateContent.length > 0) {
        console.log('[DEBUG] Total versions:', versionHistoryData.launcherUpdateContent.length);
        versionHistoryData.launcherUpdateContent.forEach(function(version) {
            var versionId = generateVersionId(version);
            var viewed = isVersionViewed(versionId);
            console.log('[DEBUG] Version:', version.version, 'Date:', version.date, 'Viewed:', viewed);
            if (!viewed) {
                count++;
            }
        });
    } else {
        console.log('[DEBUG] versionHistoryData not available or empty');
    }
    console.log('[DEBUG] Unviewed version count:', count);
    return count;
}

// 一键标记所有版本为已读
function markAllVersionsAsRead() {
    const allVersionIds = [];
    Object.keys(versionHistoryData).forEach(function(sectionId) {
        versionHistoryData[sectionId].forEach(function(version) {
            allVersionIds.push(generateVersionId(version));
        });
    });
    localStorage.setItem(VERSION_STORAGE_KEYS.VIEWED_VERSION_IDS, JSON.stringify(allVersionIds));
    updateLastViewedVersionDate();
    updateVersionNotificationDot();
    if (typeof renderCurrentVersionContent === 'function') {
        renderCurrentVersionContent();
    }
}

// 更新版本更新红点显示
function updateVersionNotificationDot() {
    const dot = document.getElementById('versionNotificationDot');
    if (dot) {
        const count = getUnviewedVersionCount();
        if (count > 0) {
            dot.style.display = 'block';
        } else {
            dot.style.display = 'none';
        }
    }
}

// 语法使用：
        // {
        //     version: "版本号",
        //     date: "日期",
        //     tag: "标签",                 /tag标签使用:   major 重大更新; important 重要更新; normal 常规更新; patch 补丁更新
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
            version: "RC 3.0.2.1 (c3)",
            date: "2026-09-01",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 商店新增「背景」与「名片」分类：顶部分类栏在「材料」之后新增两个条目，收录此前已无法获取的限定返场商品——背景类含鎏金幻彩、动态流光、七月流火、八月鎏金，名片类含名片样式「星河漫游」；两分类商品计入工具栏「在售商品 X 款」实时统计",
                "- 特殊商品固定定价：背景与名片商品每件固定 5000 PRE Coin，定价体系与常规商品完全隔离，不参与任何全局促销与商品折扣（卡片无折扣角标与划线原价，促销统计亦不计入）",
                "- 背景商品卡片预览：点击背景商品卡片任意位置即可打开与邮件附件一致的背景预览查看器，动态背景的渐变动画、年月角标与粒子效果均可完整预览，卡片附「点击卡片预览背景效果」提示；名片商品不提供预览",
                "- 特殊商品购买与解锁：每账号限购 1 件，购买时校验 PRE Coin 余额，支付成功后立即解锁对应背景（写入账户背景解锁列表，与系统设置预设背景联动）或名片样式（写入账户名片样式列表，与名片样式设置联动）",
                "- 特殊商品三态判定：①已拥有——用户已通过任意途径解锁对应背景/名片（含此前通过邮件领取的历史记录）时，卡片置灰且购买按钮禁用并显示「已拥有或已售罄」；②活动锁定——当前有进行中或即将开始的活动包含对应背景/名片奖励时，卡片置灰且购买按钮禁用并显示「暂未开放售卖」，活动结束（endTime 到点自动迁移）或下线（活动移除/手动置为已结束）后自动恢复售卖，若已在活动中领取获得则优先显示「已拥有或已售罄」；③可购买——其余情况正常显示「立即购买」",
                "- 九月限定动态背景「九月月华」：全新初秋夜空与中秋月色主题限定动态背景，采用五个全新光晕框架（月华银蓝、月金暖晕、银白月轮、靛蓝夜境、暖金月晕）与深靛夜幕渐变底色，右下角带 2026.09 年月角标与动态星粒子效果，配套专用 septemberShift 六档渐变动画（22s 循环）",
                "- 九月限定背景发放邮件：新增「九月限定动态背景」邮件（2026-09-01 12:30:00 起发放至 2026-09-30 23:59:59 截止，无发放对象限制），附件即「九月月华」背景；领取后自动解锁，可前往 系统设置 → 个性化 → 特殊获取 中查看与应用",
                "优化改进",
                "- 解锁方式提示优化：系统设置中未解锁的背景/名片样式，若对应商品当前正在商店售卖中，锁定提示横条内容改为「解锁方式：通过商店购买获取」，替代原先的「通过邮件获取」「兑换码已失效」等旧提示；商品未在售或被活动锁定时维持原提示",
            ]
        },
        {
            version: "RC 3.0.2.0 (c3)",
            date: "2026-08-31",
            tag: "patch",
            tagText: "补丁更新",
            images: [],
            features: [
                "优化改进",
                '我们对账户等级与经验值系统进行了平衡性调整，并对商店物品内容与价格进行了更新',,
            ]
        },
        {
            version: "RC 3.0.2.0 (c2)",
            date: "2026-08-29",
            tag: "major",
            tagText: "重大更新",
            images: [],
            features: [
                "新增功能",
                "- 全新PRE Coin硬币系统：启动器内新增通用货币PRE Coin，获取渠道覆盖每日签到、每日任务、游玩小游戏、邮件附件与活动奖励；数据按账户隔离存储（localStorage key=precoin_<username>），完整记录余额、累计获取、累计消费与收支历史",
                "- 全新商店系统：游戏中心顶部导航栏新增「商店」入口，点击弹出全屏商店弹窗，可使用PRE Coin兑换仓库道具（徽章类物品不可出售）；支持数量选择（1-99）与合计金额实时计算，余额不足时阻止购买并提示",
                "- 商店分类筛选：提供全部商品/消耗品/材料/每日限购/每周限购/组合包六大分类，材料与每日限购之间、组合包之前均设置隔离竖条区分；工具栏实时显示在售商品数量与促销信息",
                "- 商店定价集中管理：所有商品价格/折扣/限购集中于SHOP_ITEM_PRICES对象统一配置，修改价格与折扣只需更新该对象，无需改动其他代码",
                "- 促销折扣机制：每个商品支持discount折扣字段（0=原价，20=8折，50=5折，100=免费），卡片展示划线原价+折后价+折扣徽章，合计栏同步展示折前折后价格；工具栏动态统计当前促销商品数",
                "- 三种限购类型：商品与组合包均支持每日限购（每日UTC+8零点重置）、每周限购（每周一UTC+8零点重置）与总限购（永久累计）三种类型，卡片实时显示限购额度与剩余数量，售罄自动置灰禁用购买按钮；限购历史按账户隔离存储（localStorage key=shop_<username>）",
                "- 全新组合包系统：新增「组合包」商品形态，多件商品打包售价低于单买合计，卡片展示含商品件数与立省金额，支持「查看包内内容」弹窗查看包内每件商品详情，组合包同样支持折扣与限购",
                "- 全新每日任务系统：顶部导航栏新增「每日任务」入口，每日UTC+8零点重置，每天从50+任务模板池中随机抽取8个，任务类型覆盖签到、小游戏、抽卡、仓库、百宝箱、邮件、商店等核心操作，单个任务奖励PRE Coin上限100",
                "- 全新每周任务系统：每周一UTC+8零点重置，每周从50+周常模板池中随机抽取16个，进度与每日任务完全独立，单个任务奖励PRE Coin介于20-100",
                "- 任务双池切换：弹窗内提供日常任务/周常任务独立Tab切换，标题右侧显示今日/本周日期tag与距离下次刷新的实时倒计时（每30秒自动刷新），bar内保留池切换按钮与开发者按钮",
                "- 任务进度自动追踪：打开商店/仓库/百宝箱/邮件、完成签到、启动小游戏、抽卡提取等行为自动累计对应任务进度，多条件任务支持组合进度追踪；已完成任务可逐个领取或使用一键领取按钮批量领取全部可领奖励",
                "- 签到奖励全新调整：每日签到奖励改为经验+PRE Coin双奖励，1-6天每日30EXP+20PRE，7天及以上每日60EXP+50PRE，15天及以上每日100EXP+80PRE",
                "- 签到里程碑PRE奖励：累计签到达到7/15天额外获得100PRE，30/60天额外获得200PRE，90/180天额外获得250PRE，365天额外获得500PRE",
                "- 开发者模式-商店：开启开发者模式后商店工具栏显示「获取PRE Coin（dev）」按钮，可直接调整PRE Coin余额（范围0-99,999,999，含+1万/+10万/+100万快捷操作与归零）；新增「重置购买状态（dev）」按钮，点击弹出确认弹窗，确定后所有物品/组合包立即恢复至未购买的初始状态（限购次数恢复满额，限购配置保持不变）",
                "- 开发者模式-每日任务：开启开发者模式后任务弹窗显示「一键完成（dev）」按钮，点击弹出确认弹窗，确定后仅将当前选中的任务池（每日或每周）所有任务进度填满并标记完成，不影响另一任务池",
                "优化改进",
                "- 卡片样式统一：商店与仓库所有物品/道具卡片统一为与组合包一致的卡片样式，移除卡片左侧的稀有度颜色竖条，视觉风格更统一简洁",
                "- 每日任务布局优化：原bar内的今日/每周日期tag与刷新倒计时tag移至每日/每周任务标题文本右侧展示，bar内仅保留任务池切换按钮与开发者按钮，布局更清爽",
                "- 一键领取位置调整：「一键领取」按钮从任务bar移至顶部统计区（可领数量旁），与完成数/可领数/余额统计同行展示，操作路径更直观",
                "修复问题",
                "- 修复商店与每日任务弹窗样式不一致的问题：两弹窗原先共享CSS类导致未同时打开时样式缺失，现已将样式内嵌为各模块独立的作用域化CSS，互不干扰且与仓库弹窗风格完全一致",
                "- 修复商店/每日任务弹窗依赖仓库先打开才能正常显示样式的问题：弹窗样式改为完全自包含，独立打开即可正常渲染，不再依赖仓库模块先加载",
                "- 修复每日任务与每周任务进度互相串扰的问题：两类任务的完成进度完全独立记录，任务完成按钮仅作用于当前选中的任务类型",
            ]
        },
        {
            version: "RC 3.0.1.3 (c2)",
            date: "2026-08-28",
            tag: "important",
            tagText: "重要更新",
            images: [],
            features: [
                "新增功能",
                "- 头图区切换动效：活动中心与活动公告切换条目时，头图区新增从左上角到右下角的白色斜线渐变扫过动画（0.55s cubic-bezier 缓动），配合内容淡入效果，切换过程更流畅自然",
                "- 秋季签到活动签到区展开/收起按钮：在签到区顶部居中位置新增「展开/收起」胶囊按钮，点击可折叠签到卡片区域为内容区留出更多阅读空间；支持折叠状态记忆，领取奖励后刷新UI时保持折叠状态；图标随状态切换（⬆️展开态 / ⬇️收起态）",
                "- 活动公告跳转按钮：每条公告详情右下角新增「跳转至相应活动」按钮，点击后自动关闭公告弹窗→打开活动中心→定位并展示对应活动详情，通过 announcementId 反向查找实现精准跳转",
                "- 邮件过期提醒Tag：邮件详情发布日期右侧新增过期提醒标签，支持三色状态标识（绿色≥8天 / 黄色≤7天 / 红色≤3天 / 已过期显示红色「已过期」），标签仅边框带色文字正常色，每天自动计算剩余天数",
                "- 侧边栏选中竖线动效：活动中心与活动公告侧边栏选中条目左侧新增垂直渐变竖线指示器，选中时从中心向上下平滑展开（scaleY 0→1，0.35s 缓动），切换时旧指示器快速收缩消失（0.3s），再触发新指示器展开",
                "- 顶部导航栏选中横线动效：登录页与游戏中心顶部导航选中条目下方横线指示器新增动态过渡动画，选中时从中心向左右展开（scaleX 0→1，0.35s 缓动），切换时旧横线快速收缩消失后新横线展开，两处导航栏（登录页/游戏中心）均已适配",
                "- 全新仓库功能上线：游戏中心顶部导航栏新增「仓库」入口，点击弹出全屏仓库弹窗，存放启动器内所有可用道具与材料",
                "- 账户隔离存储：仓库数据按账户独立保存（localStorage key=warehouse_<username>），不同账户仓库互不相通，切换账户数据自动切换",
                "- 道具分类与筛选：仓库道具分为消耗品、材料、徽章三大类，支持分类筛选与稀有度排序",
                "- 新增9种道具：经验加成卡（小/中/大）、单抽卡券、十连卡券、补签卡、幸运币、先驱者勋章、周年纪念徽章、半周年纪念徽章",
                "- 经验加成卡：使用后30分钟内经验获取提升10%/25%/50%，生效于每日签到与活动签到经验结算，可重复使用覆盖已有加成",
                "- 幸运币：使用后激活幸运状态，下一次提取时稀有项概率翻倍，抽卡时自动消耗1枚",
                "- 单抽/十连卡券：抽卡提取时自动优先抵扣狂气消耗，免费获得提取次数",
                "- 补签卡：在签到页点击未解锁的奖励卡时可使用，立即解锁并领取该天奖励",
                "- 卡片样式优化：仓库道具卡片采用与游戏中心卡片统一的白色背景+圆角15px+阴影风格，hover上移5px",
                "- 类型Tag位置调整：道具类型Tag（消耗品/材料/徽章）移至卡片右上角，采用边框风格与稀有度配色",
                "- 一行6列网格布局：桌面端一行显示6个道具卡片，窄屏自动降级为4/3/2列",
                "- 邮件系统对接仓库：邮件附件新增warehouse类型，领取时自动调用warehouseAddItem发放到仓库；邮件详情中仓库道具图标、名称、数量从WAREHOUSE_ITEMS动态读取，新增道具无需修改邮件系统",
                "- 开发者模式功能：系统设置开启开发者模式后，仓库工具栏显示「获取道具（dev）」和「移除道具（dev）」两个按钮",
                "- 获取道具（dev）：点击弹出全屏弹窗，包含所有道具卡片，每个卡片可设置数量并一键发放到仓库",
                "- 移除道具（dev）：点击进入移除模式，所有卡片变灰且显示红色「移除」按钮，点击即可删除对应道具",
                "- 数据版本自动迁移：仓库数据版本升级时自动清空旧数据，确保数据结构与代码同步",
                "- 来源文本显示开关：新增WAREHOUSE_SHOW_SOURCE全局变量，手动控制是否显示道具来源文本",
                "优化改进",
                "- 头图区尺寸缩小：活动中心与活动公告头图区高度从 min140/max200 调整为 min90/max140，图标容器从60×60→48×48，标题字号20→17，日期字号13→12，使头图区更紧凑不突兀",
                "- 移动端响应式同步：头图区移动端尺寸同步缩小（min70/max100，图标36×36，标题15px），保持移动端视觉比例协调",
                "- 暗色模式适配：头图区切换动效、侧边栏竖线指示器、顶部导航横线指示器、邮件过期Tag均已完整适配暗色模式，指示器增加发光阴影效果（box-shadow）提升暗色主题下可见度",
                "- CSS类结构优化：侧边栏条目新增 .animating-out 过渡类用于切换时的快速收缩动画，顶部导航栏统一 ::after 伪元素实现横线指示器，避免多套下划线机制冲突",
                "修复问题",
                "- 修复侧边栏条目切换时指示器瞬间消失的问题：原切换逻辑直接移除 active 类导致指示线无过渡消失，现已改为先添加 animating-out 类触发收缩动画，320ms 后再移除 active 类，实现平滑过渡",
                "- 修复顶部导航下拉菜单项切换时双指示器叠加的问题：原下拉菜单项点击同时触发导航项和下拉项的 active 切换，现已改为旧指示器先收缩消失再延迟50ms后新指示器展开，避免两条线同时显示",
                "- 修复仓库弹窗脚本加载顺序问题：warehouse.js必须在premail.js之前加载，否则邮件领取时warehouseAddItem不可用导致仓库道具发放失败；已调整index.html中脚本引用顺序并移除重复引用",
                "- 修复补签卡点击未识别解锁状态的问题：isCheckinDayUnlocked函数已兼容makeupDays字段，补签后正确识别已解锁状态",
                "- 修复经验加成buff被旧数据覆盖的问题：使用经验加成卡时改为先消耗道具并保存数据，再激活buff效果，避免异步覆盖",
            ]
        },
        {
            version: "RC 3.0.1.2 (c2)",
            date: "2026-08-27",
            tag: "patch",
            tagText: "补丁更新",
            images: [],
            features: [
                "修复问题",
                "- 修复秋季签到活动天数计算不正确的问题：原逻辑硬编码活动起始日（2026-08-26）计算解锁天数，导致新注册用户也能直接领取多天奖励；已重构为基于用户实际签到进度（首次签到日期+登录天数）计算解锁状态，新用户首日仅可领取第1天奖励，每日登录推进一天解锁",
                "- 修复奖励卡解锁状态随活动默认时间推进导致自动解锁的问题：已移除基于全局日期的解锁判断，改为每用户独立的 unlockedDays 字段管理，仅在用户登录访问签到区时才推进解锁进度，杜绝自动解锁",
                "- 新增旧数据迁移兼容：对已有老用户数据自动迁移至新结构（补充 firstCheckinDate/lastCheckinDate/unlockedDays 字段），迁移时根据已领取天数推算合理的初始解锁进度，保证历史用户体验不受影响",
            ]
        },
        {
            version: "RC 3.0.1.2 (c1)",
            date: "2026-08-27",
            tag: "important",
            tagText: "重要更新",
            images: [],
            features: [
                "新增功能",
                "- 全新好友系统：用户名片侧边栏新增「好友」Tab，提供好友卡片网格展示（一行三列）、空状态引导、好友搜索添加、好友设置、好友申请管理、黑名单管理等完整社交功能",
                "- 好友申请机制：搜索添加好友改为发送申请模式，不再直接添加；目标用户需同意后双方才建立好友关系，实现双向好友确认流程",
                "- 查看申请弹窗：操作栏新增「查看申请」按钮（带红点数字徽章实时显示未处理申请数），弹窗内列出所有收到的好友申请，每条申请配备「同意」「拒绝」「加入黑名单」三个操作按钮",
                "- 管理黑名单弹窗：操作栏新增「管理黑名单」按钮，弹窗内列出所有被拉黑用户，支持查看用户信息并一键「移出黑名单」恢复对方申请权限",
                "- 好友搜索智能状态：搜索结果按钮支持 7 级互斥状态（自己/已是好友/对方关闭申请/被对方拉黑/已申请/对方已申请/可添加），每种状态对应不同按钮样式与交互，含禁用态与跳转态",
                "- 好友设置功能：新增「好友设置」弹窗，包含 5 项隐私开关（公开个人资料/显示在线状态/允许好友请求/接收陌生人消息/显示已读回执），与系统设置页隐私设置双向实时同步",
                "- 好友卡片展示：好友列表采用渐变头像卡片网格布局，显示好友昵称、ID、等级徽章、签名，支持「发消息」「删除好友」操作；等级徽章从 user.level 优先读取，gameData.level 兜底",
                "- 黑名单防护机制：被拉黑用户无法再发送好友申请，搜索时显示「被对方拉黑」禁用按钮；移出黑名单后自动恢复对方申请权限",
                "- 好友申请重复防护：同一用户不可重复发送申请，搜索结果按钮自动变为「已申请」禁用态；若对方已向我方发送申请，按钮变为蓝色「对方已申请」可点击态，直接跳转查看申请弹窗",
                "- 隐私设置「允许好友请求」开关：关闭后其他用户搜索时按钮自动变为灰色「对方关闭申请」禁用态，彻底阻止申请发送",
                "- 好友数据自动初始化：ensureFriendDataFields 函数为所有历史用户自动补全 friends/username[]、friendRequests/[]、sentRequests/[]、blacklist/[] 四个社交字段，兼容旧用户数据",
                "- 好友徽章红点动态渲染：名片渲染阶段同步读取当前用户 friendRequests 数组长度生成红点徽章 HTML，申请数 ≥1 显示具体数字，≥100 显示 99+，处理申请后徽章自动消失",
                "- 新增「加入黑名单」按钮：好友卡片操作区新增第三个按钮（橙色-ban 图标），点击后弹出自定义确认弹窗（「此操作将会直接删除您与该用户的好友状态并将对方拉入至黑名单，确定要继续吗？」），确认后先双向解除好友关系再写入黑名单，一步完成删除+拉黑双操作",
                "- 新增 addUserToBlacklist 函数：支持直接将指定用户加入当前用户黑名单，含重复检测与友好提示，与 blockUserFromRequest 互为补充（后者附带清理好友申请逻辑）",
                "- 新增 blockFriendFromCard 封装：串联 mutualRemoveFriend（双向删好友）+ addUserToBlacklist（加入黑名单）+ Toast 反馈的完整拉黑流程",
                "- 新增 sendMessageToFriend 占位函数：为「发消息」按钮预留接口，后续接入聊天模块时可直接替换实现",
                "- 事件委托统一升级：bindFriendCardEvents 扩展为同时处理删除好友、加入黑名单、发消息三种按钮点击事件，代码结构清晰易扩展",
                "- 用户名片头像编辑功能：在用户名片「注册时间」下方新增「编辑头像」胶囊按钮（粉色渐变背景 + 编辑图标），点击后弹出头像选择弹窗，支持 6 种默认头像（用户/机器人/猫咪/狗狗/龙/幽灵）和自定义上传两种模式",
                "- 头像选择弹窗交互：默认头像网格（6列布局，圆形渐变背景），点击即切换并保存；自定义上传区域（虚线边框 + 云上传图标），点击后打开文件选择器",
                "- 头像编辑器跨页面调用：上传自定义头像后自动打开与系统设置页完全相同的头像编辑器，支持裁剪比例（1:1/4:3/16:9）、滤镜（原图/黑白/复古/模糊/明亮）、亮度/对比度/饱和度调整、自定义头像名，编辑器CSS动态注入 document.head，支持在任意页面调用",
                "- account-settings.js 架构重构：将原 DOMContentLoaded 闭包改为 IIFE + initAccountSettings() 结构，支持脚本在任意页面加载而不报错（仅 account-settings.html 页面执行 DOM 初始化，其他页面仅暴露头像函数到 window）；头像编辑器 CSS 改为动态注入，不依赖外部样式文件",
                "- 顶部导航栏结构优化：将原独立的「版本更新」与「开发者公告」两个导航项合并为统一的「公告中心」下拉菜单，支持鼠标悬浮与点击两种展开方式，保持登录页与游戏中心两处导航栏完全一致",
                "- 公告中心多级菜单：下拉菜单按顺序包含 4 个条目——活动中心（fa-calendar-alt）、活动公告（fa-bullhorn）、版本更新（fa-history）、开发者公告（fa-newspaper），每项独立绑定各自的弹窗打开逻辑",
                "- 活动公告全屏弹窗：全新全屏弹窗，采用邮件弹窗同款布局（Header + 侧边栏 + 主内容区），侧边栏按分类（当前活动/即将到来/已结束）展示公告条目，主内容区预留 Banner 头图区域（event-banner-area）显示公告详情",
                "- 活动中心全屏弹窗：全新全屏弹窗，同样基于邮件弹窗基础模板（Header + 侧边栏 + 主内容区），侧边栏按分类（精选活动/每日活动/特殊活动）展示活动卡片，主内容区支持活动详情展示与「立即参与」「活动规则」操作按钮，内容结构灵活可扩展",
                "- 活动公告已读状态管理：引入 localStorage 持久化记录已读公告 ID，未读条目显示红色圆点 + 渐变色「最新」标签（带脉冲呼吸动画），点击公告后自动标记已读并移除标签；支持「一键已读」批量操作",
                "- 代码架构优化：将原混在 announcement.js 中的活动相关代码（eventAnnouncementData、eventCenterData、弹窗生成/渲染/交互函数共约 490 行）完整抽离为独立的 event.js 模块，代码组织参照 versionHistory.js、announcement.js、premail.js 的模块规范，数据与逻辑分离、全局函数暴露、分区注释标记",
                "- i18n 多语言支持：为公告中心、活动中心、活动公告新增 4 种语言（中文/英文/日文/韩文）的国际化翻译条目，接入 lang.js 统一管理",
                "- 下拉菜单静态 CSS 样式：为登录页补充独立的下拉菜单 CSS 样式（此前仅在游戏中心模式通过 JS 动态注入），确保无需 JS 预加载即可正常显示交互",
                "- 主题与响应式适配：两个活动弹窗及下拉菜单完整支持普通模式、暗色模式（body.dark-mode）、透明模式（body.transparent-mode）三种主题，以及移动端响应式布局（@media max-width:768px）",
                "- 新增更改名片样式按钮，用户可在系统设置页自定义名片样式，更新样式后可立即生效（系统默认/特殊获取）",
                "- 新增每日签到公告：活动公告系统新增「每日签到」条目（ID: event_daily_checkin），作为活动中心「每日签到」活动的规则说明页，起始日固定显示「账号建立时间」、结束时间固定显示「无限制」，与签到页面内容形成联动闭环",
                "- 活动排序自定义配置：活动中心与活动公告数据新增 sortOrder 数组字段，支持在代码内自定义侧边栏显示顺序，而非按添加时间排序；新增 sortEventsByConfig() / sortAnnouncementsByConfig() 两个排序工具函数，自动对各分类下的条目按配置顺序重排",
                "- 活动规则跨弹窗跳转增强：活动中心「每日签到」活动的「活动规则」按钮现在正确关联到新增的每日签到公告条目，点击后自动跳转至对应活动公告详情",
                "- 每日签到「立即参与」跳转：活动中心点击每日签到活动的「立即参与」按钮后，自动关闭弹窗、显示页面签到区（#checkinArea）、平滑滚动定位到签到区域，实现一键直达签到",
                "- 奖励领取逻辑优化：移除「只能领取当天奖励」的限制，改为允许领取所有已解锁的奖励卡（签到天数 ≥ 该天数即可领取），只有未来未解锁的天数才被拦截；此前错过的签到日仍可补领",
                "- 一键领取逻辑升级：「一键领取」按钮从「只领当天」改为「领取所有已解锁且未领取的奖励」，一次性批量处理所有可领取的奖励，并提示实际领取数量",
                "优化改进",
                "- 好友数据原子保存机制：设计 withAllUsers(mutator) 闭包抽象，所有好友/申请/黑名单修改通过一次 read→补全字段→业务逻辑→write 原子完成，避免并发脏写导致的数据不一致",
                "- 双向关系同步：acceptFriendRequest / mutualRemoveFriend 等函数在双方 registeredUsers 条目上对称修改 friends[] 数组，确保好友关系双向一致",
                "- 申请清理联动：处理申请时（同意/拒绝/拉黑）同步清理对方的 sentRequests 对应项；拒绝和拉黑场景下清理对方 sentRequests 后对方可重新发送申请，拉黑场景下同时追加我方 blacklist 永久禁止",
                "- 好友删除改为双向删除：删除好友按钮触发 mutualRemoveFriend，双方 friends[] 列表同时移除对方，彻底解决旧版单向删除导致的残留问题",
                "- 编辑侧边栏标签页管理：renderTabManagementList / renderSectionManagementList 两处 tabOrder 硬编码数组同步加入 'friends'，用户可在布局管理中自由开关好友 Tab 的显示",
                "- 隐私设置双写同步：account-settings.js saveSetting 函数对 5 个隐私键同步写入 registeredUsers.userProfile（主存储）与 SettingsManager / localStorage.appSettings（从存储），好友设置弹窗读写保持数据源一致",
                "- 好友 Tab 卡片等级显示修复：buildFriendCardHTML 等级读取改为 user.level 优先、gameData.level 兜底，修复旧用户卡片等级恒为 1 的问题",
                "- 按钮悬停样式优化：查看申请按钮与管理黑名单按钮 hover 时不再加深背景渐变色，改为保持原配色 + 微微上浮 + 柔和阴影，视觉体验与其他按钮统一",
                "- CSS 模块化加载：申请/黑名单/徽章相关 80+ 条 CSS 样式通过 ensureFriendRequestStyles() 动态注入 document.head，与主样式分离便于维护，支持幂等加载与暗色模式完整适配",
                "- 好友卡片结构重排：将原居中纵向布局改为左上-右下分区布局，头像放置卡片左上角、用户名+UID 放置头像右侧（字号 16px+12px）、用户签名放置卡片左下角（字号 14px）、操作按钮放置卡片右下角，信息层级更清晰，空间利用率更高",
                "- 好友卡片字体全面放大：用户名从 15px → 16px、UID 从 11px → 12px、签名从 12px → 14px，阅读舒适度显著提升",
                "- 操作按钮尺寸放大：好友卡片操作按钮从 32px → 36px 圆形图标按钮，点击区域更大，视觉更突出",
                "- 按钮悬浮气泡提示：为「发消息」「删除好友」「加入黑名单」三个操作按钮新增 CSS Tooltip 悬浮气泡，鼠标悬停时在按钮上方显示对应操作名称，带淡入动画与箭头指示器，暗色模式同步适配",
                "- 头像选择区精简：系统设置页（account-settings.html）头像选择区删除末尾的上传头像按钮（原 customAvatarOption），只保留下方独立的「上传自定义头像」按钮区域；updateAvatarDisplay() 函数同步移除重新添加上传按钮的逻辑，避免重复添加；updateAvatar() 函数对不存在的 customAvatarOption 元素增加空值保护",
                "- 编辑按钮样式优化：原头像右下角圆形覆盖按钮（相机图标）改为注册时间下方的胶囊按钮（编辑图标 + 文字），更大更显眼，符合常规按钮交互预期；按钮支持 hover 上浮 + 阴影加深、active 回弹动画",
                "- showConfirm 三参数调用规范：统一 showConfirm(title, message, callback) 的调用方式，修复原活动公告「一键已读」按钮因参数缺失导致回调函数被当作文本显示、确定按钮无反应的问题",
                "- 活动数据版本控制：新增 EVENT_DATA_VERSION 版本号机制，当数据版本不匹配时自动清理旧的已读记录，解决历史测试数据残留导致所有公告恒为已读的问题",
                "- 侧边栏条目布局优化：活动公告条目调整为左侧圆点 + 中间标题日期 + 右侧「最新」标签的三段式 flex 布局，event-announcement-info 使用 flex:1 自动推动标签至右端",
                "- 最新标签视觉设计：采用 #ff6b6b → #ee5a6f 渐变背景 + 白色文字 + 脉冲呼吸动画（eventNewTagPulse keyframes），暗色模式自动切换配色，已读状态通过 .viewed 选择器隐藏标签",
                "- 奖励卡片视觉全面放大：卡片尺寸从 130×175px → 150×200px，容器最大高度 300→350px，图标/锁 46×46→50×50，标签从 2 行截断改为 3 行显示，max-height 34→48px，文字采用 word-break:break-all 完整展示",
                "- 奖励卡片与主页签到卡片 CSS 完全隔离：将活动中心奖励卡片的 CSS 类名从 .checkin-card 全部重命名为 .evt-reward-card 前缀（含 12 个子类：day/icon/lock/label/inner/gold/glow/claimed-badge 等），彻底解决与主页每日签到卡片（.checkin-card.enhanced）的样式冲突，两者独立尺寸、独立主题适配",
                "- 「立即参与」按钮条件显示：活动数据新增 showParticipate 布尔字段，各活动可独立控制是否显示该按钮；秋季签到活动（center_002）设为 false 以隐藏按钮，每日签到活动（center_001）设为 true 保留按钮；「活动规则」按钮也改为条件显示（需存在 announcementId）",
                "- 奖励卡类型视觉差异化：cardStyle 类型（名片样式）改用 fa-id-card 图标 + 粉色圆形背景，background3d 类型（3D背景）改用 fa-rocket 图标 + 紫色圆形背景，与普通奖励卡保持一致的圆形图标容器但颜色区分",
                "- 查找机制健壮性：CHECKIN_REWARDS 的 getCheckinRewards() 函数保留双重查找机制（先按 eventId 直接匹配，找不到则通过 hasCheckin + checkinDays 长度智能匹配），即使更改活动 ID 仍能正确找到奖励数据",
                "- 移动端响应式同步更新：奖励卡片移动端尺寸同步从 112×155px → 130×175px，图标、标签字号等同比缩放，保持移动端视觉一致性",
                "- 深色/透明模式适配：新增 evt-reward-card-lock 在深色模式和透明模式下的样式适配，fa-unlock/fa-rocket 图标在暗色主题下正确显示对应颜色",
                "修复问题",
                "- 修复编辑侧边栏「布局管理-标签页管理」未显示好友条目的问题：根因为 renderTabManagementList / renderSectionManagementList 两处 tabOrder 硬编码白名单遗漏 'friends'；已同步在两处数组末尾添加 'friends'，用户可正常开关好友 Tab",
                "- 修复好友设置与系统设置页隐私设置不同步的问题：两边原读写不同数据源（SettingsManager.appSettings vs registeredUsers.userProfile）；已改为 showFriendSettingsModal 读优先 userProfile + 保存时双写 SettingsManager / localStorage.appSettings，account-settings.saveSetting 同步回写",
                "- 修复好友卡片等级徽章恒为 1 的问题：buildFriendCardHTML 原只读取 friendUser.gameData.level，但测试数据为 user:{level:12} 嵌套结构；已改为双源兜底（user.level 优先 + gameData.level 兜底）",
                "- 修复添加好友直接建立关系的问题：原点击添加按钮立即将对方加入 friends[] 数组，不符合社交产品常规流程；已改为发送申请模式，经对方同意后才建立双向好友关系",
                "- 修复黑名单用户仍能发送申请的问题：原拉黑操作仅在我方添加记录，未阻止对方重复发送；已改为拉黑时同步清理对方 sentRequests，搜索时自动检测我方 blacklist 和对方 blacklist 双向拦截",
                "- 修复申请处理后红点徽章不更新的问题：原徽章为异步 JS 更新导致状态不同步；已改为名片渲染阶段直接读取 friendRequests.length 生成 HTML，refreshFriendsInCard() 重建名片时徽章数字立即正确",
                "- 修复好友卡片等级徽章被裁剪的问题：原 .friend-card-avatar 设置 overflow:hidden 导致 Lv 等级徽章（绝对定位在头像右下角）被头像边界裁剪显示不完整；已移除 overflow:hidden 并将徽章偏移从 -4px → -6px，确保徽章完整可见，同步添加 white-space:nowrap 防止文字换行",
                "- 修复删除好友使用浏览器默认弹窗的问题：原 removeFriendFromCard 使用 window.confirm() 触发浏览器原生弹窗样式，与整体页面设计语言不一致；已改为调用全局 showConfirm() 页面内自定义模态框（带标题、消息文本、确定/取消按钮、淡入淡出动画），视觉体验统一",
                "- 修复右上角个人卡片头像不更新的问题：syncMinimalistUserInfo() 原硬编码 avatarEl.className='fas fa-user'，完全不读取 localStorage；已改为读取 currentUserAvatar 键，支持自定义头像（backgroundImage + backgroundSize）和默认头像（font-awesome 图标 className）双模式切换，同步更新 ui-min-user-avatar 和 ui-min-dropdown-avatar 两处",
                "- 修复修改头像后多处不同步的问题：saveAvatar() 和 saveEditedAvatar() 现在同时调用 updateUserCardAvatarDisplay()（更新用户名片头像）+ syncMinimalistUserInfo()（更新右上角个人卡片头像）+ syncAvatarToAllPages()（写入 localStorage 供跨页面读取），确保所有位置实时同步",
                "- 修复 updateAvatarDisplay 重新添加已删除上传按钮的问题：原逻辑在每次调用 updateAvatarDisplay() 时会重新创建 customAvatarOption 元素并 appendChild 到头像选择区，导致与 HTML 中已删除的按钮矛盾；已改为仅在元素存在时绑定事件，不再动态创建",
                "- 修复活动公告侧边栏活动状态恒为已读的问题：根因为 localStorage 中残留历史测试数据；已新增数据版本控制机制自动清理旧记录",
                "- 修复「一键已读」弹窗显示 JavaScript 代码文本的问题：原 showConfirm 仅传 2 参数，回调函数对象被隐式转为字符串显示；已修正为 showConfirm('确认','消息内容',callback) 三参数调用",
                "- 修复「一键已读」弹窗确定按钮点击无反应的问题：与上述同源，confirmCallback 参数接收为 null 导致点击无效；修复三参数后确定按钮正常触发 markAllEventAnnouncementsAsRead()",
                "- 修复奖励卡片内容显示不全的问题：原卡片尺寸 100×135px + 2 行截断导致「名片样式「星河漫游」」等长文本被裁切；已放大至 150×200px + 3 行显示 + word-break，确保奖励名称完整可见",
                "- 修复每日签到卡片显示不正确的问题：根因是 CHECKIN_REWARDS 键（center_003）与活动实际 ID（center_002）不匹配导致返回 null；已修正键名并增加 getCheckinRewards() 回退查找逻辑",
                "- 修复更改活动 ID 后奖励区不显示的问题：原 generateCheckinSection / bindCheckinInteractions / updateCheckinUI 三处均使用硬编码 CHECKIN_REWARDS[eventId] 直接查找；已统一改用 getCheckinRewards() 函数，支持直接匹配 + 回退匹配两种模式",
                "- 修复活动规则按钮无法跳转的问题：原按钮无 click handler 且无 announcementId 绑定；已为每个活动数据增加 announcementId 字段，showEventCenterDetail() 重写按钮点击逻辑，实现关闭中心弹窗 → 打开公告弹窗 → 自动定位对应公告详情的完整链路",
                "- 修复奖励领取仅限当天的逻辑错误：原点击奖励卡时判断 day !== currentDay 导致错过天数后无法补领；已改为 day > currentDay（仅未来天数拦截），支持补领所有已解锁的历史奖励",
                "- 修复「一键领取」只能领当天奖励的问题：原逻辑仅查找 currentDay 对应奖励；已改为遍历所有 day ≤ currentDay 且未领取的奖励，一次性全部领取",
                "- 修复活动中心卡片 CSS 污染主页签到卡片的问题：两套组件共享 .checkin-card 类名导致活动中心卡片放大后主页卡片也被拉伸；已将活动中心奖励卡片全部重命名为 evt-reward-card 前缀，两套样式完全隔离",
                "- 修复秋季签到活动不需要「立即参与」按钮的问题：原所有活动硬编码渲染两个按钮；已改为通过 showParticipate 字段条件渲染，秋季签到设为 false 后按钮正确隐藏",
                "- 修复侧边栏缺少「最新」标签的问题：已在活动公告条目右侧新增 .event-new-tag 元素，未读显示、已读隐藏，点击条目或一键已读后自动清除",
            ]
        },
        {
            version: "RC 3.0.1.1 (c1)",
            date: "2026-08-19",
            tag: "major",
            tagText: "重大更新",
            images: [],
            features: [
                "新增功能",
                "- 新增 3D 游戏「光影冲刺」（html/cube3dgame.html）：一款基于 Three.js 渲染 + cannon-es 物理引擎的 3D 球球冒险闯关游戏，玩家操控发光能量球在霓虹长廊中疾驰，躲避障碍、收集能量晶核，速度持续攀升直至极限",
                "- 新增框架一：Three.js 0.160（通过 ESM importmap 引入 three.module.js），提供完整的 3D 场景图、几何体、材质、光照、阴影、相机、渲染器等 Web 3D 渲染能力，是本次 3D 游戏的渲染基础",
                "- 新增框架二：cannon-es 0.20（通过 CDN 引入 cannon-es.js），提供刚体物理模拟（球体、盒子）、碰撞检测、接触材质（摩擦/弹性）、重力、求解器迭代等能力，是本次 3D 游戏的物理引擎基础",
                "- 既有三框架继续沿用：Tailwind CSS（UI 现代化）+ GSAP（成就解锁 Toast 弹入、横幅滑入等动画）+ Lenis（轻量平滑滚动），与新增的 Three.js / cannon-es 形成完整的 3D 游戏技术栈",
                "- 光影冲刺游戏玩法：A/D 或 ←/→ 控制能量球左右移动、空格跳跃，躲避红色发光屏障、收集黄色能量晶核；速度随时间递增（BASE_SPEED=13 → MAX_SPEED=27），存活越久得分越高（得分=距离×0.4 + 能量球×20）",
                "- 光影冲刺视觉设计：遵循 prelauncherdemo.html 设计语言，采用暖橙(#f0a050)→玫红(#d45d79)→紫(#9b6dff)三色渐变配色，玻璃拟态 HUD、发光边框按钮、渐变文字标题，深色 #0f0a1e 背景 + 三色模糊光斑浮动",
                "- 光影冲刺成就系统集成：新增 10 个普通成就（初入光廊、微光初现、流光溢彩、极速辉光、常客、光影行者、能量收集者、能量狂热者、坚持之心、光之意志）+ 1 个特殊成就「光影之王」（解锁全部 10 个后触发），与 account-settings.js 成就系统无缝集成；index.html 新增游戏卡片（紫粉渐变 logo）与 profile 成就统计 UI；account-settings.html 新增 cube3d 选择器按钮与进度条",
                "- 光影冲刺自定义设置弹窗：顶部导航栏左上角新增「自定义」按钮，弹窗内可设置初始速度倍率（1x~5x 滑块，0.5 步进）和单局时间上限（不限时/1/2/3 分钟/自定义时长，自定义支持分钟+秒输入，最大 60 分钟），设置保存至 localStorage，下一局开始时生效；弹窗打开时游戏自动暂停",
                "- 光影冲刺历史记录弹窗：顶部导航栏新增「历史」按钮，弹窗内展示用户最近 20 次游玩记录（超过自动清除最旧），最高分常驻顶部，每条记录显示排名奖牌（🥇🥈🥉）、得分、能量球数、存活时间、日期；支持「重置记录」按钮（二次确认防误操作）；弹窗打开时游戏自动暂停",
                "- 光影冲刺成就侧边栏：顶部导航栏右上角新增「成就」按钮，点击后从右往左滑出侧边栏（GSAP 流畅动画），展示全部 11 个成就（10 普通 + 1 特殊「光影之王」），每个成就包含 SVG 环形进度条、图标、名称、描述、解锁状态；已解锁成就带闪光扫过动画；右上角徽章实时显示已解锁总数；侧边栏打开时游戏自动暂停",
                "- 光影冲刺倒计时模式：设定时间上限后，左上角时间显示切换为 MM:SS 倒计时格式，最后 10 秒红色脉动警告；时间归零自动结算本局并保存历史记录",
                "- 光影冲刺成就解锁横幅通知：解锁成就时顶部弹出横幅通知（配合右下角 Toast 双重提示），2.8 秒后自动消失；重复解锁时只更新文字不重触发动画",
                "- 新增用户名片成就游戏详情弹窗：在用户名片成就区域点击任一游戏卡片（点击方块/飞行器/五子棋/贪吃蛇/记忆卡牌/颜色匹配/光影冲刺），弹出该游戏的完整成就列表弹窗，显示每个成就的图标、名称、描述、解锁状态，支持查看全部 10 个普通成就 + 1 个特殊成就的详细解锁进度；弹窗带毛玻璃背景、入场动画、GSAP Toast 通知",
                "- 五子棋 3D 重制：将原 2D 五子棋游戏（wzqgame.html/cwzqgame.css）完全重制为 3D 立体风格，采用光影冲刺同款深色主题（#0f0a1e 背景 + 暖橙#f0a050→玫红#d45d79→紫#9b6dff 三色渐变），棋盘使用 CSS perspective + rotateX(52°) 实现 3D 倾斜视角，棋子使用 radial-gradient + 多层 box-shadow 模拟立体球体，落子带从上方下落的弹性动画",
                "- 五子棋顶部导航栏：移除原版本公告、切换语言功能和老旧侧边栏，改为与光影冲刺一致的顶部 HUD 导航栏（得分/时间/回合/成就/暂停/返回），底部改为功能按钮栏（难度/时间/人机/视角/旋转/重置）",
                "- 五子棋视角切换功能：新增「视角」分段控件，支持 3D 侧视角（rotateX 52°）与俯视视角（rotateX 0°）一键切换，切换时带平滑过渡动画",
                "- 五子棋 90° 旋转功能：新增「旋转」按钮，每次点击棋盘水平旋转 90°（0°→90°→180°→270°→0°），使用 cubic-bezier(0.34, 1.56, 0.64, 1) 弹性缓动实现 3D 旋转动画",
                "- 五子棋缩放滑块：屏幕左侧新增竖向缩放滑块（60%-140%），可通过拖拽滑块、点击 +/- 图标、或鼠标滚轮三种方式缩放棋盘，实现镜头前推/后拉效果",
                "- 五子棋重置功能：底部栏新增「重置」按钮，点击弹出确认弹窗（「确定要重置该局吗？」），确认后重置当前棋局状态",
                "- 五子棋 AI 对战：支持人机对战模式，包含简单/中等/困难三档难度，AI 使用评估函数（进攻+防守权重）选择最佳落子位置，难度调节进攻/防守权重比例",
                "- 新增游戏「光影恐龙」（html/dinojump.html）：一款仿 Chrome 离线小恐龙跳跃跑酷游戏，玩家控制恐龙跳跃躲避仙人掌、翼龙、巨石等障碍物，支持键盘（空格/↑跳跃、↓下蹲、P暂停）和触屏操作，UI 采用与光影冲刺/贪吃蛇一致的暖橙(#f0a050)→玫红(#d45d79)→紫(#9b6dff)三色渐变玻璃拟态设计，深色 #0f0a1e 背景 + 三色模糊光斑浮动",
                "- 光影恐龙核心玩法：恐龙自动向前奔跑，玩家通过跳跃躲避地面障碍（小/大仙人掌、双连仙人掌、仙人掌群、巨石、小石头）、下蹲躲避低空翼龙、直接跑过高空翼龙；包含云朵飘动、地面纹理滚动等场景元素，恐龙带跑步动画",
                "- 光影恐龙难度系统：四档预设难度（简单1.0倍速/中等2.0倍速/困难2.5倍速/噩梦3.0倍速）+ 自定义难度，每档难度有独立的初始倍速、最小生成间隔、最大速度倍率、障碍物种类配置；难度选择卡片实时显示初始倍速与障碍描述",
                "- 光影恐龙渐进式加速机制：游戏开始时为难度初始倍速，随时间在60秒内平滑提升至该难度最大倍速（简单3.0x/中等4.0x/困难4.5x/噩梦5.0x/自定义5.0x），障碍物生成间隔同步缩短（最多30%-40%），信息栏实时显示当前倍速数值",
                "- 光影恐龙自定义倍速弹窗：难度选择中新增「自定义」选项，点击弹出毛玻璃弹窗，内含0.5x-5.0x滑块（0.1步进），实时显示当前倍速数值（橙→粉→紫渐变文字），确认后以自定义倍速开始游戏；弹窗带 GSAP back.out(1.5) 入场动画；滑块轨道使用三色渐变，拇指带橙色光晕阴影",
                "- 光影恐龙成就系统：新增10个普通成就（初次尝试/初级跳跃者/中级跳跃者/高级跳跃者/跳跃爱好者/跳跃达人/跳跃高手/累计得分王/躲避大师/生存大师）+ 1个特殊成就「恐龙之王」（解锁全部10个后触发），与 account-settings.js 成就系统无缝集成；侧边栏展示全部成就含 SVG 环形进度条与解锁横幅通知",
                "- 光影恐龙排行榜：游戏侧边栏新增排行榜面板，记录Top10成绩（分数/跳跃次数/时间/日期），带奖牌图标（🥇🥈🥉）；右上角新增重置按钮（红色图标，悬停旋转-45°动画），点击弹出二次确认毛玻璃弹窗",
                "- 光影恐龙历史最高分常驻显示：排行榜顶部新增独立的历史最高分区域（金色奖杯图标+橙粉渐变文字），独立存储于 dinoHistoricalHigh，不会被新记录挤下排序，也不会被重置按钮清除，永久保留玩家巅峰成绩",
                "- 贪吃蛇排行榜升级：同步新增历史最高分常驻显示（snakeHistoricalHigh）和重置按钮+确认弹窗，与光影恐龙排行榜体验完全一致；重置按钮只清除排行榜列表与单局最高分/累计分，历史最高分独立保留",
                "- 游戏卡片三点菜单系统：游戏中心每张游戏卡片右上角新增横向三点按钮，点击后弹出下拉菜单，包含「设为收藏」与「游戏统计」两个选项；支持点击其他区域自动关闭；卡片右上角新增收藏标签（红色渐变），已收藏游戏标题右侧显示「已收藏」Tag",
                "- 游戏收藏功能：点击「设为收藏」可将游戏加入用户收藏列表，数据存储至 registeredUsers.gameData.favorites 数组；用户名片「游戏收藏」页面同步显示已收藏游戏（含名称、图标、渐变色彩）；再次点击切换为「取消收藏」",
                "- 游戏统计弹窗：点击「游戏统计」弹出统计弹窗，显示该游戏的启动次数、游玩总时长（自动格式化为小时/分钟）、历史最高分、历史最佳成绩、最近游戏时间；支持点击背景或关闭按钮关闭",
                "- 游戏数据检测机制：新增共享模块 game-stats.js，包含 GameStatsManager 和 GameTimer 两个核心类；8 个游戏页面（点击方块/五子连珠/飞行器/贪吃蛇/记忆卡牌/颜色匹配/光影冲刺/光影恐龙）均接入自动记录，在游戏开始时启动计时器、游戏结束时记录得分、暂停时暂停计时器、恢复时恢复计时，确保数据真实有效",
                "- 用户名片收藏与统计页面升级：收藏页面改用 favoriteGames 数组渲染，显示游戏名称、图标和渐变色彩；统计页面改用 globalStats 对象显示全局统计（启动次数、游戏时长、最高分、游玩游戏数）；最近游戏页面显示最近玩过的游戏及其时间",
                "- 系统设置页导航精简：删除原「统计数据」页面（section-game-stats）及其内部统计卡片（总游戏时长/游戏次数/获胜次数/总积分/签到统计等），顶部导航栏将原下拉菜单形式的「统计数据」改为直接显示「成就系统」，侧边栏菜单分组改为「成就与统计」，仅保留「成就系统」项",
                "- 成就系统集成光影恐龙：account-settings.html 新增光影恐龙游戏选择器按钮（带进度条、fas fa-bone 图标）+ 成就总数更新（70→80普通、7→8特殊）；account-settings.js 在 loadGameStats、updateAchievements、setupGameSelector、toggleSingleAchievement、toggleAllAchievements 五大核心函数中全面接入 dino 数据（dinoAchievements/dinoGamesPlayed/dinoHighScore/dinoTotalScore/dinoTotalJumps/dinoTotalDodges）；index.html 用户名片新增光影恐龙成就卡片（橙粉紫渐变 logo）+ 成就总数更新（77→88）+ 特殊成就统计新增恐龙之王",
                "优化改进",
                "- 速度倍率全程生效：原 update() 每帧用 BASE_SPEED + elapsed × SPEED_RAMP 重置 forwardSpeed 覆盖了自定义倍率，现改为 speedBase × multiplier + elapsed × SPEED_RAMP × multiplier，倍率全程生效；最大速度同步按倍率提升",
                "- 光影冲刺速度滑块设计：把开局速度从分段按钮改为滑块样式（1x/1.5x/2x/2.5x/3x/3.5x/4x/4.5x/5x 共 9 档），滑块轨道、拇指边框、数值文字随倍率从橙色(#f0a050)渐变到红色(#ff4444)，倍数越大颜色越警示",
                "- 光影冲刺自定义时间输入：定时挑战新增「自定义」选项，支持输入分钟（0-60）+ 秒（0-59），总时长上限 3600 秒（60 分钟），含实时校验与错误提示（「请输入有效的时间！」/「时间不能超过 60 分钟！」）",
                "- 光影冲刺成就徽章升级：全部 11 个成就解锁后，右上角「成就」按钮的徽章文本从数字「11」改为「全部完成」渐变文字（橙→粉→紫），背景同步改为三段渐变；侧边栏标题下方也显示 🏆「全部完成！」渐变文字替代原有 x/11 计数",
                "- 光影冲刺屏障物理体加厚：屏障物理体 z 方向半厚从 0.25 增至 0.4，可视化几何体厚度从 0.5 增至 0.8，cannon-es 求解器迭代次数从默认提升至 20、容差从 0.1 收紧至 0.01，彻底解决高速时球体穿透薄障碍的「无敌点」问题",
                "- account-settings.html 滚轮滚动优化：桌面端 .settings-main 缺少 overflow-y: auto 导致滚轮无效，现已添加 overflow-y: auto !important + overflow-x: hidden + -webkit-overflow-scrolling: touch；Lenis prevent 函数遍历范围扩展至 documentElement（含 body），同时检查 overflowY 和 overflow 属性，支持 overlay 值，增加 body 单独检查，确保系统设置页所有内部可滚动容器滚轮事件始终有效",
                "- 五子棋默认时间改为不限时：进入五子棋时时间默认值从 30s 改为「不限」（timeLimit=0），避免用户忘记调整导致对局中途被结算；时间选择器默认激活项改为「不限」，HUD 时间显示初始为 ∞",
                "- 五子棋 AI 难度选择智能显隐：未开启人机模式时，难度选择框自动隐藏（带 opacity+max-width 过渡动画），开启人机后自动显示，避免无关选项干扰",
                "- 五子棋按钮框尺寸统一：所有底部功能按钮框（难度/时间/人机/视角/旋转/重置）统一为 40px 固定高度 + 0.75rem 圆角，视觉完全一致",
                "- 五子棋棋子定位精度优化：棋子从嵌套在 board-cell 内部改为直接定位在 board-grid 容器上，消除嵌套 transform 导致的 3D 坐标偏移，棋子精确对齐网格交叉点；落子动画同步更新为包含 translate(-50%,-50%) + translateZ 的完整 transform 链",
                "- 五子棋棋盘更大尺寸：棋盘从原尺寸增大到 600px（max-width 90vw），3D 透视效果更明显，棋盘网格线使用橙粉渐变色与主题呼应",
                "- 五子棋成就系统对齐：10 个成就 ID 与 account-settings.js 完全一致（wzq_first_game/wzq_first_win/wzq_win_5/wzq_win_10/wzq_games_20/wzq_quick_win/wzq_long_game/wzq_perfect_win/wzq_ai_master/wzq_veteran），成就解锁判定、存储、UI 展示全部正确对接",
                "- 用户名片徽章解锁时间推算：所有 14 个徽章的 unlockedAt 从硬编码 null 改为基于用户注册时间、签到历史、等级进度、游戏次数、成就完成度等数据合理推算，每个徽章显示不同的解锁时间而非统一的「刚刚解锁」；签到徽章使用签到历史第一条记录时间，等级徽章按目标等级/当前等级比例推算，成就完成度徽章按完成度百分比推算",
                "- 用户名片成就完成度样式优化：总完成度百分比移至成就框内最右侧，字号放大至 40px + 渐变文字；「X/Y 成就已解锁」进度文字移至总百分比左上角，字号 18px，层级低于总百分比但大于原样式；进度条保留在下方",
                "- 光影恐龙得分速率平衡：原公式 game.score += Math.floor(dt/100) 因 dt≈16ms 导致 Math.floor(0.16)=0 分数永远不增加；改为 scoreRaw 浮点累加器（dt × 0.003 × speedMultiplier），得分随时间和倍速合理增长，简单模式100分约需35秒、500分约需3分钟，噩梦模式100分约需12秒，成就解锁曲线合理有挑战性",
                "- 光影恐龙跳跃手感优化：跳跃初速度从 -12 调至 -9（更柔和起跳），重力从 0.6 降至 0.38（更平缓下落），最大跳跃高度约107px、滞空时间约0.78秒，跳跃弧度更自然，下落段不再过急",
                "- 光影恐龙障碍物间距与种类优化：各难度最小生成间隔从1800→900ms递减；新增4种障碍物（cactus_double 双连仙人掌/cactus_cluster 仙人掌群/rock_small 小石头/bird_high 高空翼龙）；简单难度也增加小石头丰富玩法；新增 minGap = 160 + speed×8 最小间距安全检查，确保两个障碍物间至少有可跳跃距离，速度越快最小间距越大，彻底避免出现跳不过去的情况",
                "- 光影恐龙翼龙高度调整：bird_low 从 groundY-35 调整为 groundY-50 确保可通过下蹲躲避；bird_high 为 groundY-115 需直接跑过不跳跃，丰富躲避策略组合",
                "- 光影恐龙障碍物渲染细节：cactus_double 绘制两根错落仙人掌带侧枝；cactus_cluster 绘制四根大小不一的仙人掌群带暗色阴影；rock_small 绘制小石头带高光圆点；所有新障碍物均带渐变填充与圆角细节，视觉风格统一",
                "- 用户名片成就徽章固定宽高：为 .badge-item 设置固定 width:90px × height:100px，使每个徽章外框尺寸完全一致，不受徽章名称字符长度影响；名称超长时自动省略号截断，图标区域 flex-shrink:0 确保圆形图标不变形",
                "- 用户名片成就徽章移除数量限制：移除原 badges.slice(0, badgeLimit) 截断逻辑，所有已解锁徽章全部显示；徽章栏改为横向滚动容器 .badges-scroll-container，支持无限数量徽章左右滑动查看，自定义滚动条样式与主题色(#d45d79)一致",
                "- 用户名片游戏收藏样式重构：将原多列网格布局改为垂直列表布局，每个收藏游戏独占一行；卡片左侧显示游戏标题（15px 加粗），右侧显示 36px 圆形游戏 logo 带阴影，logo 左侧带从右向左的游戏主题色渐变效果(linear-gradient 90deg)",
                "- 用户名片游戏收藏点击交互：点击任意收藏游戏卡片直接弹出该游戏的统计信息弹窗（启动次数、游玩时长、历史最高分、最佳成绩、最近游戏时间），无需先进入游戏中心查看，提升用户查看效率",
                "- 暗色模式适配：为新增的徽章固定尺寸样式、横向滚动容器、收藏列表卡片、收藏图标包装器等所有新增组件添加完整的暗色模式样式，包括背景色、边框色、悬停效果、滚动条样式，确保明暗主题视觉一致",
                "修复问题",
                "- 修复光影冲刺自定义速度不生效的问题：根因为 update() 每帧用 BASE_SPEED + elapsed × SPEED_RAMP 重置 forwardSpeed，覆盖了 startGame() 中设置的自定义倍率；已改为基于 speedBase × multiplier 计算，倍率全程生效",
                "- 修复光影冲刺左侧「无敌点」穿墙问题：根因为屏障物理体太薄（0.25z），高速时 cannon-es 碰撞检测失效导致穿透；已加厚屏障物理体（0.4）+ 可视化（0.8）+ 增加求解器迭代次数（20）+ 收紧容差（0.01），彻底解决穿墙 bug",
                "- 修复光影冲刺成就解锁横幅不消失的问题：根因为 CSS 过渡仅有 transform 属性缺少 opacity 控制，隐藏动画不稳定；已新增 opacity: 0 默认值，.show 加 opacity: 1，新增 .hide 类（opacity: 0 + translateY(-120%)），重写 showAchievementBanner / hideAchievementBanner，使用 show→hide 类切换 + 动画结束后强制重置状态",
                "- 修复光影冲刺成就横幅重复显示的问题：根因为每次调用 showAchievementBanner 都重置动画，无去重；已添加 bannerShowing 状态锁，显示中重复调用只更新文字不重触发动画",
                "- 修复 account-settings.html 系统设置页鼠标滚轮滚动无效的问题：根因为桌面端 .settings-main 缺少 overflow-y: auto（仅移动端有），且 Lenis prevent 函数遍历范围不足；已为桌面端 .settings-main 添加 overflow-y: auto !important + overflow-x: hidden，并扩展 Lenis prevent 函数遍历范围至 documentElement（含 body），同时检查 overflowY 和 overflow 属性，支持 overlay 值",
                "- 修复光影冲刺特殊成就「光影之王」解锁时不触发通知的问题：根因为 checkCube3dAchievements 中解锁特殊成就后未调用 showAchievementToast；已在解锁 cube3d_complete 时触发通知横幅 + 自动调用 updateAchvBadge 更新徽章",
                "- 修复光影冲刺赛道回收逻辑 bug：侧墙和边缘网格未正确随段移动；已将 edges 和 walls 存入 segment 对象，在 moveSegmentBy 中更新它们的位置",
                "- 修复光影冲刺 populateSegment 使用错误 z 坐标导致障碍物生成位置错误的问题：已调整操作顺序，先更新 z 坐标再填充障碍物（moveSegmentBy → s.z = newZ → populateSegment）",
                "- 修复 account-settings.js 中 toggleSingleAchievement 引用 colorAchievements 拼写错误的问题：原引用 user.gameData.achievements，已改为 user.gameData.colorAchievements",
                "- 修复光影冲刺游戏启动时障碍物立即出现导致玩家体验不佳的问题：已新增「安全段」概念，前两段赛道不生成障碍物（populateSegment(s, i < 2)），给玩家起跑缓冲时间",
                "- 修复用户名片徽章弹窗关闭按钮失效的问题：根因为弹窗保留了上一次关闭时残留的 modal-closing 类，导致关闭函数内的守卫检查（if contains modal-closing return）提前退出；已在 showBadgesListModal / showBadgeDetailModal 打开弹窗前添加 classList.remove('modal-closing') 清除残留状态",
                "- 修复用户名片「坚持不懈」徽章图标不显示的问题：原使用 Font Awesome 6 中不存在的 fas fa-flame 类，已改为有效的 fas fa-fire",
                "- 修复用户名片成就中光影冲刺游戏成就不显示的问题：原成就统计未包含 cube3dAchievements，已在 totalAchievements 计算、特殊成就统计、成就卡片渲染中全部加入光影冲刺数据",
                "- 修复用户名片成就详情弹窗中 6 个游戏成就全部显示「未解锁」的问题：根因为 showGameAchievement 函数中定义的成就 ID（如 click_1/fxq_1/snake_1 等）与 account-settings.js 实际存储的 ID（如 first_game/fxq_first_game/snake_first_game 等）完全不匹配；已按 account-settings.js 中的实际 ID 重写全部 7 个游戏的成就配置，确保 indexOf 检测正确匹配已解锁成就",
                "- 修复五子棋棋子位置偏移的问题：根因为棋子使用固定像素负 margin（margin-left:-14px）居中，在 3D 透视变换下无法与百分比定位的网格线对齐；已改用 transform: translate(-50%,-50%) 方案，棋子直接定位在 board-grid 容器上，消除嵌套 transform 偏移",
                "- 修复五子棋切换时间后每次开始游戏仍从 30s 倒计时的问题：根因为 timeLimit 初始值为 30，且默认时间选择器激活项为 30s；已将 timeLimit 初始值改为 0（不限时），默认激活项改为「不限」，startGame 直接使用用户当前选择的 timeLimit 值",
                "- 修复光影恐龙分数始终为0的问题：根因为 game.score += Math.floor(dt/100) 中 dt≈16ms，16/100=0.16，Math.floor(0.16)=0，导致分数永远不增加且与难度/自定义倍速无关；已引入 scoreRaw 浮点累加器（game.scoreRaw += dt * 0.003 * game.speedMultiplier），再取整显示，得分随时间和倍速正常增长",
                "- 修复光影恐龙跳跃下落过快的问题：跳跃初速度 -12 + 重力 0.6 导致下落段过急、操作手感生硬；已调整为初速度 -9 + 重力 0.38，跳跃弧度更平缓自然，滞空时间更合理",
                "- 修复系统设置页成就中未显示光影恐龙游戏成就的问题：原 account-settings.html/account-settings.js 完全未接入 dino 游戏，导致光影恐龙成就无处查看；已在游戏选择器（新增 dino 按钮）、loadGameStats、updateAchievements、setupGameSelector、toggleSingleAchievement、toggleAllAchievements 等全部函数中接入 dino 数据，成就总数从70更新为80、特殊成就从7更新为8、全部成就从70更新为80",
                "- 修复用户名片中未显示光影恐龙游戏成就的问题：原 index.html 成就统计未包含 dinoAchievements，用户名片成就完成度漏算光影恐龙；已在 totalAchievements（77→88）、completedAchievements（concat dinoAchievements）、特殊成就统计（新增 dinoAchievements.length>=10 判断）、成就卡片渲染（新增光影恐龙卡片 with 橙粉紫渐变 logo）中全部加入光影恐龙数据",
                "- 修复特殊成就缺少「解锁光影恐龙所有成就」的问题：新增 dino_complete 特殊成就「恐龙之王」（desc: 解锁光影恐龙所有成就，icon: fa-crown），条件为解锁全部10个光影恐龙成就；已在 loadGameStats、setupGameSelector、toggleSingleAchievement、toggleAllAchievements 四处特殊成就计算逻辑中同步接入 dino_complete 判定，确保解锁10个恐龙成就后自动触发恐龙之王特殊成就",
                "- 修复排行榜重置会误清除历史最高分的问题：用户要求历史最高分为常驻记录，不应被重置按钮清除；已将历史最高分独立存储于 dinoHistoricalHigh / snakeHistoricalHigh，resetRanking 函数只清除排行榜列表（dinoRanking/snakeRanking）与单局最高分（dinoHighScore/snakeHighScore）及累计分（dinoTotalScore/snakeTotalScore），历史最高分独立保留，确保玩家巅峰成绩永久存在",
                "- 修复 Canvas roundRect 方法兼容性问题：部分浏览器不支持 ctx.roundRect 导致绘图异常；已实现跨浏览器兼容的 roundRect 函数，优先使用原生 ctx.roundRect，不支持时手动通过 moveTo/lineTo/quadraticCurveTo 绘制圆角矩形，确保所有现代浏览器圆角矩形正常显示",
                "- 修复光影恐龙暂停后无法恢复游戏的问题：调用 resumeGame 后游戏循环未重启；已在 resumeGame 中显式调用 loop() 重启游戏循环，确保暂停后能正常恢复",
                "- 修复光影恐龙下蹲时碰撞检测错误的问题：下蹲状态下恐龙 Y 坐标计算错误导致碰撞判定异常；已分离下蹲与非下蹲状态的 Y 坐标计算逻辑，下蹲时 dinoY = groundY - 25、dinoHeight = 25，非下蹲时 dinoY = groundY - dinoHeight - |jumpHeight|，碰撞检测精确无误",
                "- 敬请期待卡片特殊处理：移除「敬请期待」卡片的三点按钮和下拉菜单 DOM 结构，在 initGameCardMenus() 函数中添加跳过 game_coming 卡片的逻辑，防止该卡片被初始化菜单功能；游戏启动记录逻辑中同步跳过 game_coming",
                "- 修复成就系统导航点击无反应的问题：顶部导航栏原「成就系统」项缺少 data-nav 属性且嵌套在下拉菜单结构中，导致点击无法触发 switchSection；已改为直接导航项并添加 data-nav=\"achievements\"，侧边栏菜单同步更新",
                "- 修复敬请期待卡片可进行收藏和查看统计的问题：原敬请期待卡片被误添加三点菜单按钮和收藏标签，用户可对未开放游戏进行收藏和查看统计；已移除该卡片的菜单 DOM 结构，JavaScript 初始化函数中添加 game_coming 过滤逻辑",
                "- 同步更新 homepage.css：新增游戏卡片菜单按钮、下拉菜单、收藏标签、统计弹窗等所有组件的 CSS 样式，确保跨页面样式一致",
                "- 修复收藏游戏卡片点击无法触发统计弹窗的问题：showGameStatsModal 函数原仅在 initGameCenterFunctions 作用域内定义，内联 onclick 无法访问；已通过 window.showGameStatsModal = showGameStatsModal 将其暴露到全局作用域，确保点击收藏卡片时统计弹窗正常弹出",
            ]
        },
        {
            version: "RC 3.0.1.0 (c1)",
            date: "2026-08-17",
            tag: "important",
            tagText: "重要更新",
            images: [],
            features: [
                "框架整体升级（核心变更）",
                "- 启动器全部 9 个 HTML 页面（首页、游戏大厅、系统设置、五子棋、数独、飞行棋、颜色匹配、记忆翻牌、贪吃蛇）的前端框架从 MUI 完整替换为：Tailwind CSS（UI 现代化）+ GSAP（高性能动画引擎）+ Lenis（平滑滚动）三剑客组合，技术栈更现代、动画能力更强、体积更轻",
                "- 移除 MUI 框架文件：删除 css/mui.css、css/mui.min.css、js/mui.js、js/mui.min.js、fonts/mui.ttf 共 5 个旧框架文件，fonts 目录仅保留项目实际使用的 HarmonyOS_Sans_SC_Regular.ttf 字体",
                "- Tailwind CSS：通过 Play CDN 引入并预配置主题色（pre-primary: #d45d79 / pre-accent: #f0a050 / pre-deep: #2a1b3d / pre-dark: #0f0a1e），关闭 preflight 重置避免破坏现有 CSS 体系，支持在 HTML 中直接使用 utility classes 写样式",
                "- GSAP 3.12.5：通过 CDN 引入 gsap.min.js 与 ScrollTrigger 插件，提供时间轴、滚动驱动、数值计数、缓动函数等业界最强动画能力，支持页面级滚动触发与入场动画编排",
                "- Lenis 1.0.42：通过 UNPKG CDN 引入，接管滚轮实现物理惯性平滑滚动，并接入 GSAP ticker 驱动 raf() 保证与 ScrollTrigger 无缝协同；对登录页、系统设置页等 overflow:hidden 页面自动智能跳过，避免滚轮失效",
                "- 容错处理：每个 CDN 均添加 onerror 回退，加载失败时降级为原生滚动 + 无动画模式，不影响页面功能；Lenis 初始化被 try/catch 包裹，初始化异常自动降级；Tailwind 全局对象访问前做 window.tailwind 守卫检查",
                "- 更新首页版权声明：原 MUI 版权按钮替换为 Tailwind CSS / GSAP / Lenis 三个版权按钮，showFrontendFrameworkModal(type) 函数分别展示三套框架的完整版权、许可协议与官网链接",
                "新增功能",
                "- 登录页向下滑动后平滑滚动出现底部信息栏：平时不显示滚动条与向下滚动提示，用户自然向下滑动时页面平滑滚动，底部栏以 GSAP 淡入+交错动画优雅出现，不破坏登录页整体美观度",
                "- 底部信息栏四列网格布局（响应式：≤1024px 切 2 列、≤768px 切单列），包含版权信息、技术栈、社交链接、额外推荐四个分区，各分区标题带图标 + 渐变分割线",
                "- 版权信息区：显示 © 2014-2026 PREAlmax. All rights reserved. 版权声明，下方动态填充当前版本号、内部版本号、最后更新日期（均从 versionManager.js 实时获取）",
                "- 技术栈区：Tailwind CSS（v3 Play CDN）、GSAP（v3.12.5）、Lenis（v1.0.42）三套框架以彩色渐变图标卡片形式展示（Tailwind 蓝色 / GSAP 绿色 / Lenis 橙粉色），一行两个排列，点击卡片跳转至对应 GitHub 仓库",
                "- 社交链接区：GitHub（https://github.com/Almax202）与哔哩哔哩（https://space.bilibili.com/554489149）以与技术栈相同的卡片样式展示，一行两个排列，GitHub 深灰渐变图标、Bilibili 粉色渐变图标，悬停时边框变为对应品牌色",
                "- 额外推荐区：新增「PRE Launcher 新框架演示」入口，点击跳转至 html/prelauncherdemo.html 展示页，一行一个排列，金色渐变图标配播放图标",
                "- 底部栏 Powered by PREAlmax 脚标 + 动态版本文字（PRE Launcher · 版本号 · Build 日期）",
                "- 展示页采用深色 #0f0a1e 背景 + 三色模糊光斑浮动（d45d79/f0a050/9b6dff）+ 50px 网格纹理，玻璃拟态卡片、发光边框流动动画、渐变文字、脉冲圆点等高级视觉元素，完整呈现新框架能力",
                "- 登录页卡片（登录/注册表单容器）升级为玻璃拟态样式：rgba(255,255,255,0.05) 背景 + backdrop-filter: blur(20px) + 半透明白色边框 + 深色阴影，表单输入框、复选框、协议勾选、验证码区等元素同步适配",
                "- 登录页登录按钮从毛玻璃白色改为暖橙粉渐变（linear-gradient 135deg #f0a050 → #d45d79），配粉色外发光阴影，hover 时按钮上移并加深阴影；注册面板下一步/确认注册按钮同步采用同一渐变",
                "- 登录页装饰圆圈与粒子颜色改为暖色系（rgba(240,160,80)），添加粉色发光 box-shadow，与背景光斑配色呼应",
                "- 登录页添加入场 GSAP 动画序列：光斑依次淡入并持续浮动、左右面板从两侧滑入、品牌卡片缩放+淡入+回弹、品牌图标从 -180° 旋转入场、名言卡片淡入、欢迎语整体缩放淡入、副标题淡入、输入框交错右滑入场、登录按钮从下方弹入、装饰圆圈从 0 放大入场、粒子交错放大入场、版权文字淡入",
                "优化改进",
                "- 清理过时注释：account-settings.js 第 192 行注释从「防止mui.js阻止滚动」更新为「避免移动端菜单滚动穿透」，与当前技术栈一致",
                "- 框架切换兼容性保障：Tailwind 关闭 preflight CSS 重置，确保 denglu.css / homepage.css / account-settings.css 等项目既有自定义样式不受原子化 CSS 影响；登录页/系统设置页等原本 overflow:hidden 的页面通过智能检测 documentElement.scrollHeight 与 body overflow 属性，自动跳过 Lenis，保留原生滚轮",
                "- Lenis prevent 策略优化：对 .custom-alert / .modal / .settings-sidebar / .content-area / .settings-container 等元素级滚动容器自动跳过 Lenis 接管，改为遍历祖先链自动检测 overflow-y:auto/scroll 且内容溢出的容器并交给原生滚动，避免模态框与侧边栏内部滚轮失效",
                "- 登录页动画时序稳定性优化：采用单一 gsap.timeline 统一管理所有入场动画，防重入标志 isAnimating + lastState 状态机 + MutationObserver 400ms 防抖；每次重新进入登录模式前先 clearProps 清理所有内联样式再 gsap.set 设置初始态，彻底避免 killTweensOf 后 fromTo 把元素卡到 opacity:0 的问题",
                "- 底部栏字体统一：移除版本信息（当前版本/内部版本/最后更新）与技术栈版本号的 font-family: 'Consolas', 'Monaco', monospace，全部统一为页面默认字体，视觉一致性更强",
                "- 底部栏链接智能路由：JS 统一拦截底部栏所有 a 标签点击，http(s) 链接走 showLeaveConfirmModal 跳转确认弹窗，内部页面链接（如 ./html/prelauncherdemo.html）通过 JS 计算完整路径后 window.location.href 跳转，确保各类链接均正确生效",
                "- 底部栏框架卡片添加 pointer-events: auto，确保 GSAP 动画不阻止点击事件",
                "- prelauncherdemo.html 字体替换为鸿蒙字体：新增 @font-face 声明引用 ../fonts/HarmonyOS_Sans_SC_Regular.ttf，body font-family 从 'Segoe UI' 改为 'HarmonyOS Sans' 优先，全页文字统一使用鸿蒙字体",
                "修复问题",
                "- 修复登录页与系统设置页鼠标滚轮失效的问题：根因为 Lenis 默认接管 window 滚动并 preventDefault 了 wheel 事件，但上述页面 body overflow:hidden / 实际滚动发生在内部 overflow-y:auto 容器，导致 Lenis 拦截 wheel 后无处可滚；已在初始化前自动检测 body overflow 与 documentElement.scrollHeight，不可滚动页面完全跳过 Lenis 并保留原生滚动",
                "- 修复登录页动画连续卡顿 2-3 次的问题：根因为 MutationObserver 未防抖，页面加载 class 连续变化触发多次 initLoginAnimations 叠加 tween；已添加 400ms debounce + lastState 状态机（login→other→login 才触发重播）+ 防重入 isAnimating 标志位",
                "- 修复登录页动画完成后登录卡片文本和登录按钮不显示的问题：根因为 killTweensOf 旧动画后 fromTo 再次将元素立即设为 opacity:0；已改为 gsap.set 硬设初始态 + gsap.timeline.to() 纯动画，并在每次重放前 clearProps 清除所有被动画属性的内联样式，确保动画结束后元素回到 CSS 默认可见态（opacity:1）",
                "- 修复欢迎语「欢迎来到 PRE Launcher」渐变文字渲染异常的问题：原实现将 h1 拆分为多个 span 做逐字动画，导致每个 span 独立渲染 background-clip:text 使渐变断裂；已改为整体 scale+opacity 入场动画，保持 h1 完整结构让渐变正确渲染",
                "- 修复 Hero 标题「界面体验」四个字不显示的问题：根因为 heroTitle2 同时携带 .gradient-text 类（-webkit-text-fill-color: transparent + background-clip: text）和 JS splitText() 拆分字符（每个字包成 <span class=\"char\">），拆分后父级 span 文本内容为空导致 background-clip:text 无处裁剪、子级 .char 继承透明色但无自身背景，四个字符全部透明不可见；已为 .gradient-text .char 新增独立的渐变背景 + background-clip:text 规则，每个字符级 span 独立渲染渐变",
                "- 修复特性卡片区三张卡片只有第一张会跟随鼠标 3D 倾斜的问题：根因为卡片 2、3 带了内联 style=\"transition-delay:0.1s/0.2s\"（入场错峰用），mousemove 每帧通过内联 transform 更新倾斜角度时，CSS .glow-card { transition: transform 0.4s } + 内联 transition-delay 叠加生效，导致新 transform 值被延迟 0.1s/0.2s 才开始过渡、鼠标持续移动旧过渡被中断，肉眼看到卡片被「卡住」不动；已改为 mouseenter 时保存并清空 transition + transitionDelay（设为 none/空），mousemove 实时写 transform 无过渡干扰，mouseleave 时恢复带 cubic-bezier 缓动的 transition 并 500ms 后还原原有内联属性，三张卡片倾斜响应完全一致",
                "- 修复底部栏「新框架演示」点击后不跳转的问题：根因为 JS 链接拦截逻辑只匹配 a[href^=\"http\"]，非 http 的内部链接（./html/prelauncherdemo.html）未被处理；已扩大选择范围为底部栏所有 a 标签，内部链接通过 JS 计算完整路径跳转",
            ]
        },
        {
            version: "RC 3.0.0.1 (c1)",
            date: "2026-08-08",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 大厅顶部导航栏新增\"反馈建议\"功能按钮（位于\"每日签到\"与\"版本更新\"之间），点击后弹出与登录页一致的反馈建议选择弹窗，无需返回登录页即可提交反馈",
                "- 右上角用户名片下拉卡片内（粉色边框区域）右侧新增等级显示徽章，采用金色渐变胶囊样式（#ffc107 → #ff9800）显示\"Lv.X\"等级文字，与头像上的小等级徽章形成主次呼应，等级信息一目了然",
                "- 等级显示徽章样式同步适配 denglu.css 与 account-settings.css 两套样式文件，确保不同主题模式下视觉风格一致",
                "- 系统设置页个性化设置中新增「八月鎏金」特殊获取动态背景（解锁方式：邮件领取），采用深金、琥珀与初秋渐变配色，搭配金色光晕、粒子浮动效果与右下角「2026.08」年月数字显示",
                "- 新增对应邮件模板「八月限定动态背景」（邮件ID: monthly_mail_august），有效期 2026-08-08 09:00:00 至 2026-08-31 23:59:59 (UTC+8)",
                "- 新增 augustShift 关键帧动画，采用5段关键帧（0%→25%→50%→75%→100%）实现更丰富的渐变流动效果，同步添加至 common.js、account-settings.css、denglu.css 及 index.html 内联样式，确保登录页、系统设置页及所有页面动态主题切换正常",
                "优化改进",
                "- 优化自定义快捷组件弹窗的滚动条样式：为 .custom-component-list 容器自定义 webkit-scrollbar 样式，滚动条轨道采用半透明黑色背景（rgba(0,0,0,0.05)），滑块采用主题粉色（#d45d79），宽度收窄至 5px 并添加圆角，与整体粉色主题视觉风格统一",
                "- 优化自定义快捷组件弹窗的取消按钮交互逻辑：新增选中状态校验，当用户未选择任何快捷功能即点击取消按钮时，弹出提示横条显示\"请至少选择一个功能\"，避免误操作导致快捷功能配置丢失，提示横条自动消失并恢复弹窗可交互状态",
                "- 优化自定义快捷组件弹窗的尺寸与排版：加长弹窗整体长度以容纳更多功能项，功能列表由纵向单列排版改为 Grid 两列排版（grid-template-columns: repeat(2, 1fr)），单行显示两个功能项，提升空间利用率与浏览效率",
                "- 优化用户名片下拉卡片的布局结构：用户信息区（用户名/ID）添加 flex: 1 占据剩余空间，使右侧等级徽章自然靠右对齐，整体布局更加均衡美观",
                "- 优化 syncMinimalistUserInfo() 函数：在同步用户信息时一并初始化下拉卡片中的等级显示文字（Lv.X），避免初次打开时显示默认值",
                "- 优化下拉菜单点击事件处理逻辑：打开下拉时实时从 localStorage 读取最新等级信息并同步到等级徽章文字，保证等级显示始终为最新值",
                "- 优化 updateLevelCard() 函数：签到升级后同步更新下拉卡片等级徽章文字、头像小徽章、顶部导航栏用户区徽章三处等级显示，并回写 currentUser.level 到 localStorage，确保全站等级信息实时一致",
                "- 优化每日签到区域（.checkin-area）的 CSS 布局：添加 padding: 28px 与 .content-area / .treasure-area 保持一致的内边距，使签到卡片距离浏览器边框的间距与游戏卡片、百宝箱卡片完全统一",
                "- 优化签到日历卡片（.calendar-card）样式：移除冗余的 margin-bottom: 20px，改由父容器 .checkin-area 的 flex gap 统一控制卡片间距，避免双重间距叠加",
                "- 优化游戏中心容器（.game-cards）样式：显式重置 padding/margin/gap 为 0，由内部子区域（.content-area / .checkin-area / .treasure-area）各自控制 padding，避免多层 padding 叠加导致刷新前后间距不一致",
                "- 兑换码功能从「实验性功能」卡片正式毕业，迁移至「增强功能」卡片中（实验时段已结束并成为正式版），同步移除原「获取测试用兑换码」按钮及相关 showTestRedeemCode/closeTestRedeemCodeModal 函数",
                "- 优化未解锁背景点击提示交互：将原有的 showConfirm 弹窗改为更轻量的提示横条（showToast），提示内容优化为「该背景未解锁」+「解锁方式：通过邮件获取/通过兑换码获取」分行显示，根据背景发放方式自动判断提示内容",
                "修复问题",
                "- 修复登录后大厅背景与系统设置页设定的背景不一致的问题：根因为切换到游戏中心时未触发背景加载，已在 switchToGameCenter() 函数中新增 loadCustomBackground() 调用，确保切换瞬间立即加载用户自定义背景",
                "- 修复大厅页刷新后背景显示为登录页默认壁纸（紫蓝渐变）的问题：根因为 initUIStyle() 在 DOMContentLoaded 时无条件添加 login-page-mode 类并清除内联背景样式，覆盖了用户自定义背景；已改为先检查 sessionStorage.isInGameCenter 与登录状态，若已处于游戏中心会话则跳过登录页模式初始化，并主动调用 loadCustomBackground() 加载用户背景",
                "- 修复大厅页刷新后出现登录页一闪而过再恢复正常的问题：根因为 switchToGameCenter() 使用 300ms 淡出动画导致内容替换延迟，已为函数新增 skipFadeOut 参数，刷新场景下调用 switchToGameCenter(true) 跳过淡入淡出动画，立即替换内容并显示",
                "- 修复每日签到区域卡片间距不正确（卡片贴在一起）的问题：根因为导航切换时 checkinArea 被设置为 display: block，导致 CSS 中定义的 display: flex 与 gap 属性失效；已改为 display: flex 使 gap: 20px 正常生效，卡片之间恢复正确间距",
                "- 修复大厅页刷新后卡片边距与正常登录后不一致的问题：根因为 .game-cards 从 common.css 继承了 padding: 30px 40px，但 addGameCenterStyles 仅覆盖了 width: 100%，导致登录与刷新两条路径下内外 padding 叠加方式不同；已在游戏中心样式中显式重置 .game-cards 的 padding/margin/gap 为 0 统一由子区域控制",
                "- 修复页面加载检测游戏中心会话时背景加载时机过晚的问题：已在检测到 isInGameCenter 状态时立即移除 login-page-mode 类并调用 loadCustomBackground()，再调用 switchToGameCenter(true) 跳过动画，确保刷新瞬间即显示正确背景",
                "- 修复登录后进入游戏大厅刷新页面后，点击右上角\"更多功能\"按钮及\"页面时钟\"快捷按钮无反应的问题：根因为这些按钮在 switchToGameCenter() 动态创建后，原 DOMContentLoaded 阶段绑定的事件监听器已失效；已新增 bindGameCenterHeaderEvents() 函数统一绑定 hideInterfaceBtn、toggleButtonsBtn、uiScaleBtn 等动态按钮事件，并在动态创建元素后立即调用，使用 _bound 标记防止重复绑定",
                "- 修复进入页面时钟功能后顶部导航栏和下方内容区 UI 未正确隐藏的问题：根因为 interface-hidden 类的 CSS 规则（opacity/transform）优先级不足，被内联样式、fade-in/fade-out 动画的 @keyframes forwards 填充模式及 transition 过渡效果覆盖；已为 body.interface-hidden 下的 .settings-container、.ui-min-topnav、.settings-header、.settings-sidebar、.community-bg 等关键元素的隐藏规则添加 !important 提升优先级，并补充 visibility: hidden !important 作为双重保障",
                "- 修复进入页面时钟功能后未正确显示时间及其组件内容的问题：根因为 showPageClock() 函数在设置 pageClockOverlay 显示状态时未同步添加 page-clock-enabled 类，导致时钟组件依赖的样式与按钮显示条件未满足；已在 showPageClock() 中确保 page-clock-enabled 类正确添加，并同步启动时钟更新定时器与名言名句数据获取",
                "- 修复开启页面时钟功能后刷新页面会出现未开启时钟的提示及样式反复出现的问题：根因为刷新后 switchToGameCenter(true) 跳过动画路径中未调用 updateHideInterfaceButton() 恢复时钟按钮状态，导致页面时钟启用状态与 UI 显示不一致；已在 switchToGameCenter() 动态创建元素后调用 updateHideInterfaceButton() 同步状态",
                "- 修复页面时钟模式下左上角返回按钮、右上角天气设置按钮和组件调整按钮会消失的问题：根因为这三个按钮的显示依赖 body 同时具备 interface-hidden 与 page-clock-enabled 两个类，而 updateHideInterfaceButton()、showPageClock()、hidePageClock() 各自独立修改类名存在时序竞争；已在 showPageClock()/hidePageClock() 中直接为三个按钮写入内联 display 样式（flex/空值）作为最权威的显示控制，彻底绕过类名竞争问题",
                "- 修复登录后进入游戏中心模式再进入页面时钟时，顶部导航栏和内容区依旧未隐藏的问题：根因为 switchToGameCenter() 替换了 .settings-container 的 DOM 结构，CSS 类选择器 body.interface-hidden .settings-container 的优先级受到动态插入的 game-center-style 标签、内联 opacity 样式及 transition 过渡的多重干扰而失效；已新增 applyInterfaceHiddenUI() 函数，使用内联 setProperty('opacity','0','important') 等方式直接控制所有关键 UI 元素的可见性（opacity/visibility/pointer-events/transform/transition），内联 !important 优先级高于任何 CSS 规则，并在所有进入/退出时钟模式的路径（hideInterfaceBtn 处理器、pageClockBackBtn 处理器、ESC 键退出、点击空白退出、闲置定时器自动进入）中统一调用，确保任意模式下 UI 都能正确隐藏与恢复",
                "- 修复 switchToGameCenter() 中 .settings-sidebar 内联 display:none 阻塞 CSS 控制可见性的问题：initUIStyle() 在初始化时为 .settings-sidebar 设置了内联 display: none，导致后续 interface-hidden 类的 CSS 规则无法正常控制其可见性；已在 switchToGameCenter() 进入游戏中心时清除该内联 style.display，将可见性控制权交还给 CSS",
                "- 修复邮件系统中新增邮件后未在邮件列表中显示的问题：根因为 showMailModal() 函数在打开邮件弹窗时仅调用 removeExpiredMails() 和 renderMailList()，未调用 applyMailUpdates() 检查并应用新的邮件版本；已在 showMailModal() 中新增 mailSystem.applyMailUpdates() 调用，确保每次打开邮件弹窗时都会检查并添加所有已到达有效期的邮件"
            ]
        },
        {
            version: "RC 3.0.0.0 (c1)",
            date: "2026-08-01",
            tag: "major",
            tagText: "重大更新",
            images: [
                "https://media.githubusercontent.com/media/Almax202/PRE_Launcher/master/images/3000.png",
                "https://media.githubusercontent.com/media/Almax202/PRE_Launcher/master/images/3000_2.png",
                "https://media.githubusercontent.com/media/Almax202/PRE_Launcher/master/images/3000_3.png",
                "https://media.githubusercontent.com/media/Almax202/PRE_Launcher/master/images/3000_4.png",
            ],
            features: [
                "新增功能",
                "- 该版本对启动器的所有UI样式进行了全面的大改与优化，使其风格更加统一与美观",
                "- 大厅顶部导航栏右上角新增\"更多功能\"按钮（位于关于启动器、名片、页面时钟三个小功能按钮的最左侧），点击后弹出与登录页一致的更多功能弹窗",
                "- 更多功能弹窗标题右侧新增\"自定义快捷组件\"按钮（滑块图标），点击后弹出选择弹窗，可从9项功能中选择3项显示在顶部导航栏右上角",
                "- 自定义快捷组件选择弹窗支持勾选/取消功能，实时显示已选数量，保存后持久化到 localStorage（customQuickComponents）",
                "- 顶部导航栏动态渲染选中的快捷组件按钮，点击后直接触发对应功能（关于启动器、用户名片、页面时钟、查看引导、便签、天气、日历、兑换码、调整UI比例）",
                "- 点击页面时钟功能后自动隐藏顶部导航栏（ui-min-topnav、settings-header、settings-sidebar），防止遮挡时钟显示，退出时钟后自动恢复",
                "- 新增登录页全新视觉设计：采用固定背景（不受系统设置背景切换影响），左侧为色彩柔和的毛玻璃效果与动态粒子背景，右侧为登录功能区，中间以斜向分割线分隔，整体风格更加统一美观",
                "- 登录页右侧登录功能区顶部新增\"欢迎来到 PRE Launcher\"标题与副标题，标题采用纯白色加阴影替代渐变色文字，显著提升可读性",
                "- 新增注册账号滑动切换交互：点击\"注册账号\"按钮后不再弹出模态框，改为登录表单向左滑出隐藏、注册表单从右侧滑入登录区原位置，完成注册后再反向滑回，整体交互更顺滑连贯",
                "- 注册模式下左侧装饰面板同步切换：品牌标题由\"PRE Launcher\"变为\"注册账号\"，logo 图标由火箭变为用户加号图标，并隐藏名言区，注册完成或返回后自动恢复原样",
                "- 注册表单采用三步式流程（设置账号 / 绑定信息 / 完成注册），含步骤指示器、用户名实时唯一性校验、密码强度实时检测、手机号与邮箱格式校验、图形验证码校验与用户协议勾选",
                "- 注册表单内嵌随机用户名生成按钮，点击即可一键填入用户名输入框并触发实时校验",
                "- 注册表单完成所有步骤后新增信息确认弹窗，弹窗内展示用户填写的注册信息（用户名、密码以掩码显示、手机号、邮箱），用户点击\"确定注册\"后才真正执行注册流程，点击\"返回修改\"可返回继续编辑",
                "- 注册表单验证码改为通过 API 获取图片验证码，与登录页验证码获取方式完全一致，支持在线/离线模式自动切换（离线时回退为本地生成的字符验证码）",
                "- 新增注册账号切换检测机制：当注册表单（用户名、密码、确认密码、手机号、邮箱、验证码）已填写任意字段时，点击顶部导航栏或侧边栏的\"登录账号\"按钮先弹出确认弹窗（标题：切换确认，内容：当前表单未提交，切换功能则会清空所有已填写内容，是否继续？）；点击\"取消\"则留在注册页并恢复导航栏 active 状态为\"注册账号\"，点击\"确定\"则正常切换回登录页；若表单未填写任何内容则直接切换，无需弹窗确认",
                "优化改进",
                "- 大厅顶部导航栏恢复显示\"版本更新\"和\"开发者公告\"导航项，登录后无需返回登录页即可查看版本记录与开发者公告",
                "- 游戏中心卡片布局由一行三列改为一行四列，并同步缩小卡片图标与内边距，提升信息密度与视觉一致性",
                "- 百宝箱卡片布局由一行三列改为一行四列，与游戏中心卡片保持一致的网格布局",
                "- 默认背景与暗色模式背景统一为粉色主题渐变（多层径向渐变叠加线性渐变），与整体粉色主题色保持一致",
                "- 简约模式下背景装饰形状（bg-shape）透明度提升，背景装饰效果更加明显",
                "- 新增 .settings-card-header 与 .settings-card-body 基础样式，统一测试页面卡片的标题与内容区布局",
                "- 系统设置页顶部导航栏改为多级下拉菜单结构，减少导航项数量，提升视觉简洁度",
                "- 导航菜单分组：\"账户系统\"包含账户信息/安全设置/隐私设置；\"统计数据\"包含统计数据/成就系统；\"高级管理\"包含通知设置/设备管理/个性化/增强功能/账户管理；\"核心条款\"包含用户协议/隐私政策；\"实验室\"直接显示（不使用多级菜单）",
                "- 多级下拉菜单支持点击展开/收起、悬停显示、点击菜单项切换页面内容并同步更新侧边栏高亮状态",
                "- 导航项的 active 状态在父级下拉菜单上同步显示（激活子菜单项时父级高亮），提供更清晰的视觉反馈",
                "- 响应式布局适配移动端：下拉菜单居中显示，隐藏下拉箭头图标，确保小屏幕设备良好体验",
                "- 顶部导航栏相关元素添加过渡动画（transition），使页面时钟模式下的显示/隐藏更加平滑",
                "- 登录页名言区边框固定尺寸：宽度固定为 400px（响应式自适应），高度固定为 150px，名言文字限制最多 4 行（-webkit-line-clamp），名言切换时框体不再随内容大小变动",
                "- 登录页名言区整体尺寸优化：缩小内边距、字号、圆角与装饰引号大小，使名言区更加紧凑精致",
                "- 登录页名言区下方移除原有三个特性框（精品游戏/安全保障/极速体验），替换为版权文本\"© 2014-2026 PREAlmax. All rights reserved.\"",
                "- 登录页右侧登录功能区从纯白背景改为半透明毛玻璃效果（rgba + backdrop-filter: blur），与整体背景风格统一",
                "- 登录页登录按钮改为毛玻璃样式：添加 backdrop-filter 模糊效果，边框加粗并提高透明度保证可读，文字添加阴影增强对比度",
                "- 登录页表单输入框、复选框、链接等元素全部适配毛玻璃风格，文字颜色统一为白色系",
                "- 优化登录页名言文字显示位置：名言内容改为在框内垂直居中显示，作者名位置保持不变，视觉重心更平衡",
                "- 登录页品牌区元素（logo 图标、标题、副标题）添加 transition 过渡动画，使注册模式切换时品牌名称与图标变化更平滑自然",
                "- 注册面板容器改为毛玻璃效果（rgba(255,255,255,0.15) + backdrop-filter: blur(20px) + 半透明白色边框），与登录页整体毛玻璃风格统一",
                "- 注册面板内表单元素（输入框、按钮、验证码区、协议勾选、随机用户名按钮等）全部适配毛玻璃风格，文字与图标颜色统一为白色系",
                "- 注册面板容器隐藏原有顶部彩色渐变条（::before 伪元素），保持毛玻璃视觉纯净度",
                "- 注册模式下自动隐藏左侧版权信息文本（opacity + max-height 过渡），减少视觉干扰，使左侧更聚焦于\"注册账号\"品牌信息",
                "- 注册面板容器高度由 JS 动态计算并同步设置到外层容器，确保登录/注册面板切换过程中容器高度平稳过渡，避免内容跳动",
                "- 暗色模式下注册面板容器同步适配毛玻璃效果（背景透明度降至 0.08、边框与阴影针对深色背景优化）",
                "- 注册引导步骤指示器框改为毛玻璃效果（rgba(255,255,255,0.15) 半透明背景 + backdrop-filter: blur(20px) + 半透明边框 + 内高光阴影），与注册面板整体毛玻璃风格统一，暗色模式下同步适配（背景透明度降至 0.08）",
                "- 版本更新记录弹窗和开发者公告弹窗的强调色从紫色主题（#667eea/#764ba2）全面改为粉色主题（#d45d79/#e67e8a），与关于启动器弹窗保持一致的视觉风格",
                "- 弹窗侧边栏结构优化：新增 .terms-nav-scroll 滚动容器将导航项与底部\"一键已读\"按钮分离，导航项区域可独立滚动而\"一键已读\"按钮始终固定可见，不再随内容滚动消失",
                "- 弹窗容器移除外边距（.terms-modal-content 的 padding 从 20px 改为 0），与关于启动器全屏弹窗样式保持一致，各区域（header/content）自行管理内边距",
                "- 暗色模式和透明主题下弹窗的所有紫色 rgba 值同步替换为粉色 rgba 值，确保三种主题模式下视觉风格统一",
                "- 开发者公告内容中的文本颜色标签（[color:#667eea]）同步从紫色改为粉色（[color:#d45d79]），保持内容文字颜色与弹窗主题一致",
                "- 弹窗内所有滚动条滑块颜色从紫色统一改为粉色（#d45d79），包括侧边栏导航滚动区、主内容区、暗色模式滚动条等",
                "- 弹窗内导航项激活态/悬停态、子按钮悬停态、查看中标签、一键已读按钮渐变、折叠按钮等所有交互元素的颜色均从紫色改为粉色渐变",
                "- 弹窗内内容标题（h3）、列表项符号、加粗文字、协议链接等文本元素颜色从紫色改为粉色",
                "- 弹窗内版本图片滚动按钮、字体大小调节按钮、图片查看器按钮等辅助交互元素颜色从紫色改为粉色",
                "修复问题",
                "- 修复登录页和系统设置页无法显示背景的问题：根因为 .settings-container 设置了不透明的线性渐变背景覆盖了底层 .community-bg 装饰元素，已将其改为 transparent 让 body 渐变背景透出",
                "- 修复系统设置页中间内容区容器大小不正确导致卡片忽大忽小的问题：根因为 .settings-content 设置了 max-width: 1200px 与 margin: 0 auto 限制了卡片宽度，已移除该限制并添加 width: 100% 与 box-sizing: border-box 让卡片贴近浏览器窗口边缘",
                "- 修复 .section-card 与 .settings-card 卡片样式不一致的问题：统一两者的 width、box-sizing、border-radius、box-shadow 等属性",
                "- 修复简约模式暗色模式下 settings-container 选择器缺失空格（body.ui-minimalist.dark-mode.settings-container）导致规则失效的问题，并移除其不透明背景以正确显示 body 渐变背景",
                "- 修复更多功能弹窗中点击\"关于启动器\"按钮无响应的问题：根因为按钮通过 aboutLauncherBtn.click() 间接触发事件，但该元素在切换页面模式时被替换导致事件绑定丢失，已改为直接调用 showAboutLauncherModal() 函数",           
                "- 修复登录页斜向分割线变成竖向的问题：原因为使用 transform: skewX 实现斜向效果在某些情况下失效，已改用 clip-path: polygon 方案实现真正的斜向分割线",
                "- 修复登录页名言区宽度随内容变化的问题：原因为未设置固定宽度，已添加 width: 400px 固定宽度并配合响应式适配",
                "- 修复每次刷新登录页时出现一瞬老样式再快速切回新样式的问题：根因为 ui-minimalist 与 login-page-mode 类名在 DOMContentLoaded 后才由 JS 添加，导致首帧按无类名默认样式渲染，已改为直接在 <body> 标签硬编码 class=\"ui-minimalist login-page-mode\"，浏览器解析时立即应用样式",
                "- 修复邮件功能中关闭按钮、领取记录按钮和删除邮件按钮点击均无反应的问题：根因为邮件列表按钮为动态生成，传统的事件监听器在重新渲染后失效，已改用事件委托方案，将 click 统一绑定到模态框容器，通过事件冒泡与 target.closest('button') 分发处理",
                "- 修复注册账号时登录面板未完全隐藏导致与注册面板内容重叠的问题：根因为登录面板仅使用 transform 移出视口但仍占据文档流且可见，已添加 visibility: hidden 并调整 z-index 层级（登录面板降至 z-index:1、注册面板升至 z-index:2），确保切换时登录面板完全消失且不接收指针事件",
                "- 修复名言文字垂直居中与 -webkit-line-clamp 多行截断冲突的问题：根因为 display: flex 与 display: -webkit-box 不能同时作用于同一元素，已移除 -webkit-box 相关属性，改用 flex 布局实现垂直居中并保留 text-align: center 确保文本居中",
                "- 修复注册表单元素 ID 与原模态框注册表单 ID 重复导致事件绑定冲突的问题：已为内联注册表单所有元素添加 inline 前缀（如 inlineRegUsername、inlineRegPassword 等），确保 ID 唯一性",
                "- 修复暗色模式下注册表单样式异常的问题：根因为未针对注册表单单独适配暗色模式样式，已更新 CSS 选择器将注册表单与登录表单样式合并管理，确保暗色模式下样式统一",
                "- 修复版本更新记录和开发者公告弹窗侧边栏底部\"一键已读\"按钮不可见的问题：根因为简约模式规则 body.ui-minimalist .sidebar-footer { display: none; } 选择器过于宽泛，误隐藏了弹窗中的页脚容器，已收窄为 body.ui-minimalist .settings-sidebar .sidebar-footer 仅作用于系统设置侧边栏，不影响弹窗中的页脚",
                "- 修复自定义快捷组件中查看引导、便签、天气、日历等组件通过快捷入口点击无反应的问题：根因为 handleQuickComponentAction 函数引用了不存在的按钮 ID（stickyNotesBtn/weatherBtn/calendarBtn）和函数名（showGuide），已改为优先直接调用对应函数（startGuide/showStickyNotesModal/showWeatherModal/showCalendarModal）并添加按钮点击回退逻辑，确保各组件均可正常打开",
            ]
        }
    ],
    homepageUpdateContent: [],
    earlyUpdateContent: [],
    // 过时版本记录 - 启动器记录 (RC-L)
    outdatedLauncherContent: [
        {
            version: "RC 2.7.2.1 (b10)",
            date: "2026-07-29",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2721.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2721_2.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2721_3.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2721_4.png",],
            features: [
                "新增功能",
                "- 新增系统级提示横条，并替换大量一次确认弹窗的显示，确保用户操作更流畅，避免用户操作被弹窗遮挡",
                "- 新增百宝箱中，今日人品与今日运势的全新显示样式，点击查看今日人品/运势按钮后将弹出新的显示样式",
                "- 名片设置功能新增\"布局管理\"、\"外观设置\"和\"个人资料\"功能，在个人资料中修改个人签名时会同步到系统设置页中",
                "- 在用户名片的成就徽章中新增查看全部功能，点击后可以查看所有已解锁/未解锁的成就徽章，并且点击单个徽章可以查看详细信息",
                "- 版本更新记录中的图片获取方式已优化，现在从GitHub仓库中直接获取，无需通过JsZip解压，并且一并提升图片的清晰度",
                "优化改进",
                "- 优化未登录时登录页的部分功能逻辑，现在更多功能和更多操作系统在未登录时将不再可用",
                "- 时钟组件调整侧边栏样式统一：将页面时钟的组件调整侧边栏和天气设置侧边栏改为直角白色背景样式，与用户名片侧边栏风格统一",
                "- 侧边栏色调统一：时钟设置和天气设置的强调色从蓝色(#3498db)统一改为粉色(#d45d79/#e67e8a)，与整体主题色保持一致",
                "- 侧边栏标题装饰：时钟设置标题添加滑块图标(fa-sliders-h)，天气设置标题添加天气图标(fa-cloud-sun)，视觉层次更清晰",
                "- 天气跳转目标改为下拉菜单：将原先平铺的跳转目标选项改为标准下拉选择菜单，支持MSN Weather、Yahoo Weather、AccuWeather、Windy.com和页面天气五个选项",
                "- 页面天气VPN提示智能隐藏：选择\"页面天气\"作为跳转目标时，自动隐藏VPN提示信息；选择其他外部跳转目标时恢复显示",
                "- 滚动条样式统一：时钟设置和天气设置的滚动条样式统一为粉色半透明样式，与用户名片侧边栏滚动条保持一致",
                "- 侧边栏模式移除：移除时钟设置中的\"侧边栏模式\"开关，所有设置面板现在默认使用侧边栏模式，从右侧滑入滑出",
                "修复问题",
                "- 修复了在登陆页的部分全局弹窗按钮颜色及阴影色不一致的问题",
                "- 修复了在用户名片中点击编辑按钮后会导致页面无响应的问题",
                "- 修复在移动端下，系统设置页点击返回按钮后不会返回到主界面的问题",
                "- 修复时钟设置和天气设置侧边栏暗色模式适配不完整的问题：完善暗色模式下的背景色、边框色、滚动条、下拉菜单、按钮等样式",
                "- 修复时钟设置弹窗关闭动画不统一的问题：所有设置面板关闭动画统一为侧边栏滑出动画(slideOutToRight)",
                "",
            ]
        },
        {
            version: "RC 2.7.2.0 (b10)",
            date: "2026-07-27",
            tag: "major",
            tagText: "重大更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2720.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2720_2.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2720_3.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2720_4.png",],
            features: [
                "新增功能",
                "- 对游戏大厅进行了全面改版，现在将大厅页与登录页合并为一个页面，用户无需再登录后跳转大厅页",
                "- 每日签到功能重新改版，并且一并支持等级里程碑等功能",
                "- 用户名片功能重新改版，新增\"成长\"标签页，显示等级信息、累计经验、当前等级、连续签到、累计签到等成长数据",
                "- 签到里程碑弹窗：每日签到卡片中的\"下一里程碑\"改为可点击，点击后弹出里程碑弹窗，以双列网格形式展示所有签到里程碑（7天/15天/30天/60天/90天/180天/365天），已达成的里程碑以紫色渐变高亮显示",
                "- 名片成长标签页：用户名片中新增\"成长\"标签页，显示等级信息、累计经验、当前等级、连续签到、累计签到等成长数据",
                "- 等级红点显示：登录页和大厅页头像右下角显示等级小红点，白底红圈样式，实时同步等级",
                "- 新增在新的大厅页面中，更多操作弹窗内新增\"退回至登录页\"按钮，点击后返回登录页，无需重新登录",
                "优化改进",
                "- 经验值公式重设计：每级所需经验改为 50 + (等级-1) × 30，升级曲线更平缓，从0 EXP到满级60级总计约54,280 EXP（原91,450 EXP）",
                "- 每日签到奖励优化：三层阶梯奖励（1-6天30EXP/7-14天60EXP/15天以上100EXP），断签后从30EXP重新开始",
                "- 签到里程碑奖励优化：第7天额外500 EXP，每满30天额外1000 EXP（循环触发），支持每月持续获取",
                "- 签到卡片标题样式统一：每日签到卡片标题图标改为与成长等级一致的渐变方块图标框，标题改为左对齐，字号与颜色统一",
                "- 卡片布局优化：调整等级按钮移至LV等级徽章左侧，调整签到天数按钮推至卡片最右侧",
                "- 里程碑弹窗双列布局：里程碑弹窗改为每行两个卡片的网格布局，弹窗宽度扩大至580px，提升视觉体验",
                "- 深色模式全面适配：里程碑弹窗、签到卡片标题、按钮悬浮效果等全部适配深色模式",
                "- 成长等级卡片经验条优化：经验条颜色、进度显示、下一级提示实时同步新公式",
                "修复问题",
                "- 修复签到卡片标题文字居中问题：修复增强版签到卡片继承基础卡片text-align:center导致标题和描述居中的问题",
                "- 修复经验值数据不同步：修复开发者调整等级和签到天数时经验值未按新公式正确同步的问题",
                "- 修复等级徽章红点闪烁：修复等级红点仅在刷新页面时短暂显示的问题，登录页和大厅页均持久显示",
                "- 修复名片成长标签页数据：修复名片中等级信息显示与签到系统数据不一致的问题",
                "- 修复收起侧边栏按钮点击无效的问题",
                "- 修复部分弹窗中的层级显示顺序不正确的问题",
                "",
            ]
        },
        {
            version: "RC 2.7.1.5 (b10)",
            date: "2026-07-25",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2715.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2715_2.png"],
            features: [
                "新增功能",
                "- 一键领取邮件：邮件弹窗左侧边栏底部新增\"一键领取\"按钮，点击后弹窗确认领取全部邮件，领取后显示附件汇总",
                "- 邮件领取记录单条删除：每个领取记录条目右上角新增垃圾桶按钮，点击弹窗确认后删除该条记录",
                "- 兑换历史记录单条删除：每个兑换记录条目右上角新增垃圾桶按钮，点击弹窗确认后删除该条记录",
                "优化改进",
                "- 邮件领取记录排版优化：领取账户和领取时间改为一排显示并靠左对齐，领取内容文本也靠左对齐",
                "- 邮件内图片查看器功能栏隐藏：在邮件内使用图片查看器查看背景时隐藏右侧功能栏",
                "- 兑换历史记录排版优化：兑换时间放到和兑换账户一行显示",
                "- 领取成功弹窗内容优化：换行显示并加深附件文本颜色（深黑色）",
                "- 移动端更多功能弹窗优化：修复移动端模式下弹窗显示不全、无法正常点击的问题",
                "修复问题",
                "- 修复账号数据错误互通问题：修复了账号数据在不同账号间互通时的错误问题，确保账号数据的一致性",
                "- 修复切换账号后，邮件数据和兑换码数据会保留在上一个账号的问题",
                "- 修复图片查看器动态背景元素残留：查看动态背景后再查看静态背景时，右上角\"动态背景\"标签和右下角日期数字不再错误显示",
                "- 修复版本更新记录图片背景残留：在邮件中查看背景后，版本更新记录图片不再显示之前的背景",
                "- 修复七月流火背景粒子效果不显示：图片查看器中七月流火背景现在能正常显示粒子效果",
                "- 修复showAlert函数不支持HTML内容：将textContent改为innerHTML，支持HTML标签渲染"
            ]
        },
        {
            version: "RC 2.7.1.4 (b10)",
            date: "2026-07-22",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 日历组件查看引导：日历弹窗多级菜单中新增\"查看引导\"选项，点击后显示完整的日历功能引导步骤",
                "- 关于启动器免责声明：版权声明标题右侧新增\"免责声明\"切换按钮，显示服务性质、数据安全、第三方服务等免责条款",
                "- 日历功能正式上线：日历功能从实验性功能移至增强功能区域，正式发布",
                "- 全局主题颜色常态显示：全局主题颜色在个性化设置中始终显示，不可通过开关控制",
                "- 未登录邮件禁用：登录页侧边栏邮件功能在未登录时显示为灰色且不可点击，防止未登录用户领取邮件",
                "优化改进",
                "- 全局主题颜色实时同步：修复登录页侧边栏、用户中心、关于启动器按钮等元素颜色未实时同步的问题",
                "- 日历引导弹窗优化：日历引导步骤现在正确显示在日历弹窗内部，不再跑到登录页",
                "- 兑换码弹窗可滚动：低分辨率或小窗口下兑换码弹窗内容可滚动，不会被截断",
                "- 便签弹窗删除按钮优化：删除按钮移至关闭按钮左侧，避免重叠",
                "- 自定义滚动条样式：登录页侧边栏、便签内容区、日历弹窗等区域添加统一的自定义滚动条样式",
                "- 版权声明样式优化：去除版权声明卡片标题左侧的粉色高光竖线",
                "修复问题",
                "- 修复退出登录后功能残留问题：退出登录时自动清除所有功能启用状态，确保更多功能弹窗为空",
                "- 修复日历引导步骤位置错误：引导高亮框和提示正确显示在日历弹窗内",
                "- 修复滚动条样式未正确应用：为正确的滚动容器添加自定义滚动条样式"
            ]
        },
        {
            version: "RC 2.7.1.3 (b10)",
            date: "2026-07-21",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2713.png"],
            features: [
                "新增功能",
                "- 七月份限定动态背景「七月流火」：系统设置页特殊获取类别中新增七月限定动态背景，通过邮件领取解锁",
                "- 动态背景日期显示：动态背景右下角显示年月份数字（如2026.07），增强月份主题氛围",
                "- 动态背景粒子效果：七月流火背景支持粒子飘浮动画效果，营造星空般的视觉体验",
                "- 动态背景标签：有动态效果的壁纸预览右上角添加灰色微透明\"动态背景\"标签，常驻显示",
                "- 特殊获取说明图标：特殊获取分类文本右侧新增\"i\"信息图标，悬浮显示说明文案",
                "优化改进",
                "- 背景预览布局优化：每行显示5个背景预览块，调整样式和间距",
                "- 背景列表滚动支持：背景列表区域添加自定义滚动条，支持滚动浏览",
                "- 收起/展开状态持久化：系统默认和特殊获取分类的收起/展开状态保存到本地存储，刷新页面后自动恢复",
                "- 邮件附件动态预览：邮件附件中动态背景预览同步显示动态效果",
                "修复问题",
                "- 修复动态背景不生效问题：优化背景应用逻辑，确保动态渐变和动画效果正确显示",
                "- 修复粒子效果不显示问题：修正particles属性解析逻辑，确保粒子容器正确创建",
                "- 修复各页面背景同步问题：登录页、游戏大厅页和系统设置页背景效果统一"
            ]
        },
        {
            version: "RC 2.7.1.2 (b10)",
            date: "2026-07-21",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2712.png"],
            features: [
                "新增功能",
                "- 新增邮件功能，支持用户通过邮件领取各种奖励，如背景、兑换码等",
                "- 增量邮件发放系统：参考versionHistory.js的模式，实现版本化邮件发放，支持按版本号增量添加新邮件",
                "- 邮件固定有效期：支持设置固定的startTime和endTime（UTC时间），邮件只在指定时间段内显示",
                "- 鎏金幻彩背景：系统设置页特殊获取类别中新增\"鎏金幻彩\"限定背景，通过邮件领取解锁",
                "- 测试邮件更新：测试邮件附件改为鎏金幻彩背景奖励，有效期设置为2026-07-20至2026-08-01（UTC时间）",
                "优化改进",
                "- 邮件附件预览：支持CSS渐变直接渲染预览图，无需依赖图片文件",
                "- 背景解锁提示：优化未解锁背景的提示文案，明确指引用户前往邮件功能领取",
                "- 上锁图标样式：未解锁背景的上锁图标添加毛玻璃效果和阴影，更加醒目",
                "修复问题",
                "- 修复背景无法选择的问题：将isBackgroundUnlocked函数移到正确的作用域",
                "- 修复邮件版本逻辑问题：确保新增邮件能正确添加到邮件列表",
                "- 修复邮件时间逻辑问题：修复CST时区转换bug，确保时间判断准确",
                "- 修复旧邮件不更新问题：改进版本检查逻辑，确保旧邮件内容能正确更新"
            ]
        },
        {
            version: "RC 2.7.1.1 (b10)",
            date: "2026-07-20",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2711.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2711_2.png"],
            features: [
                "(以下的更新内容包含部分为\"兑换码\"的新实验性功能，不建议在生产环境中使用)",
                "新增功能",
                "- 兑换码功能：系统设置页实验性功能中新增\"兑换码\"功能，开启后在登录页更多功能中显示\"兑换码\"按钮",
                "- 获取测试兑换码：兑换码开关左侧新增\"获取测试用兑换码\"按钮，点击弹出包含测试兑换码的弹窗",
                "- 兑换码弹窗：全屏弹窗包含输入框、确认兑换按钮、兑换历史记录和兑换规则",
                "- 动态流光背景：更换默认背景弹窗中新增\"特殊获取\"类别，包含通过兑换码或其他来源解锁的动态渐变背景",
                "- 背景分类：默认背景分为\"系统默认\"（9个原有渐变）和\"特殊获取\"（兑换码或其他来源解锁背景）两大类",
                "- 清空兑换记录：兑换历史记录标题旁新增\"清空兑换记录\"按钮，点击弹出确认弹窗后执行清空",
                "优化改进",
                "- 版本更新图片滚动：版本更新记录弹窗图片区添加左右滚动按钮，移除原生滚动条",
                "- 兑换码弹窗UI：卡片式布局，粉色竖线标题，渐变色确认按钮，响应式设计",
                "- 兑换码弹窗放大：各区块内容放大，贴近边框显示",
                "- 背景预览放大：背景预览图片高度从280px增加到350px，弹窗支持上下滚动",
                "- 自定义滚动条：兑换历史记录使用粉色主题色自定义滚动条样式",
                "- 透明主题适配：兑换码弹窗、清空按钮、滚动条等适配透明主题样式",
                "修复问题",
                "- 修复关于启动器按钮点击后不弹窗的问题",
                "- 修复兑换码弹窗标题跑到右侧的问题"
            ]
        },
        {
            version: "RC 2.7.1.0 (b10)",
            date: "2026-07-19",
            tag: "major",
            tagText: "重大更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2710.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2710_2.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2710_3.png"],
            features: [
                "新增功能",
                "- 实验性功能中新增\"全局主题颜色\"功能，支持用户自定义登录页、系统设置页和游戏大厅页的主题颜色",
                "- 更换默认背景功能：系统设置页个性化卡片中新增\"更换默认背景\"按钮，点击弹出包含9个渐变背景选项的弹窗，支持选择不同风格的默认背景",
                "- 默认背景渐变选项：提供梦幻粉紫、深海幽蓝、晨曦暖阳、森林绿意、晚霞橙红、极光幻境、星空夜曲、纯净白蓝、玫瑰金粉共9种渐变背景",
                "- 系统设置页中新增导航多级菜单，支持用户快速切换到不同的设置页面",
                "优化改进",
                "- 默认背景重新设计：登录页、系统设置页和游戏大厅页背景采用多层径向渐变和线性渐变组合，营造现代感视觉效果",
                "- 个性化卡片按钮调整：删除\"自定义主题\"按钮，\"更多主题\"改名为\"更换更多主题\"并调整位置到第三位",
                "- 默认背景同步更新：游戏大厅页背景样式与登录页、系统设置页保持一致，支持用户选择的默认渐变",
                "- 默认背景显示逻辑优化：未选择自定义背景时自动显示用户选择的默认渐变，所有页面背景实现同步",
                "- 退回至登录页功能：游戏大厅更多操作弹窗中新增\"退回至登录页\"按钮，保留登录状态直接跳转至登录页",
                "- 自动登录跳过机制：退回登录页时设置skipAutoLogin标志，避免自动登录导致的循环跳转",
                "- 系统设置页移动端适配：优化导航侧边栏在移动端的显示和操作，提供更方便的导航体验",
                "修复问题",
                "- 修复resetToDefaultBackground函数未读取用户选择的默认渐变问题",
                "- 修复样式冲突问题：removeBackgroundFromPage函数增加清理default-gradient-style元素的逻辑"
            ]
        },
        {
            version: "RC 2.7.0.6 (b10)",
            date: "2026-07-15",
            tag: "patch",
            tagText: "补丁更新",
            images: [],
            features: [
                "新增功能",
                "- 新增在版本更新记录中使用补丁批次的tag标签，用于标识该版本为补丁更新，并优化之前的补丁更新中的tag标签显示，使用户更方便地识别和管理补丁更新",
                "修复问题",
                "- 回退了在RC 2.7.0.6 (b9)版本更新中新增的注册时间校验功能，因为该功能存在逻辑错误，导致用户在较新的时间点中注册时，校验功能会认为用户注册时间晚于该版本构建日期",
            ]
        },
        {
            version: "RC 2.7.0.6 (b9)",
            date: "2026-07-14",
            tag: "patch",
            tagText: "补丁更新",
            images: [],
            features: [
                "新增功能",
                "- 新增注册时间校验功能，确保用户注册时间早于该版本构建日期",
                "修复问题",
                "- 修复注册时间校验功能在注册时间为空时的校验问题"
            ]
        },
        {
            version: "RC 2.7.0.6 (b8)",
            date: "2026-07-14",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 天气版权文本：天气组件弹窗底部添加\"天气数据由 Open-Meteo API 提供支持\"版权声明",
                "- 组件信息按钮：登录页更多功能弹窗中每个卡片按钮右上角新增\"i\"信息图标，点击弹出组件信息弹窗",
                "- 显示组件信息开关：系统设置页增强功能中新增\"其他设置\"卡片，包含\"显示组件信息\"开关，控制信息图标的显示/隐藏",
                "优化改进",
                "- 日历卡片样式重新设计：待办事项和课程表卡片采用现代化flex布局，视觉更美观",
                "- 今日日程删除功能：新增删除全部和单个删除按钮，删除全部时弹出自定义确认弹窗",
                "- 日历清空数据优化：删除日历弹窗菜单中的\"清空所有数据\"选项，只保留日历设置中的该选项，并添加确认弹窗",
                "- 信息按钮样式优化：移除信息按钮周围的粉色圆圈，只保留i图标",
                "修复问题",
                "- 修复日历侧边栏tab高亮常驻问题，切换tab时清除内联样式",
                "- 修复信息按钮因嵌套button标签导致浏览器自动修正的问题，改为div标签",
                "- 修复自定义确认弹窗关闭动画异常问题"
            ]
        },
        {
            version: "RC 2.7.0.5 (b8)",
            date: "2026-07-13",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2705.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2705_2.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2705_4.png"],
            features: [
                "新增功能",
                "- 增强功能总开关：系统设置页增强功能卡片右上角新增启用/关闭按钮，控制登录页更多功能按钮显示及所有子功能开关状态",
                "- 日历设置侧边栏：点击日历设置后从屏幕右侧滑出侧边栏，包含显示设置、提醒设置、外观设置、日期格式和数据管理功能",
                "- 关于启动器弹窗：新增Github源码跳转和开发者Github主页跳转，点击跳转后即可打开相应的页面，方便开发者和用户查看和贡献",
                "优化改进",
                "- 更多功能弹窗全屏样式：将更多功能弹窗从居中对话框改为全屏样式，与关于启动器弹窗风格统一，采用卡片式按钮设计",
                "- 便签关闭按钮位置调整：将便签弹窗关闭按钮从侧边栏头部移至弹窗右上角，操作更直观",
                "- 关闭增强功能确认弹窗：点击关闭增强功能时弹出确认弹窗，防止误操作",
                "- 透明主题日历样式优化：日历弹窗输入框和设置侧边栏改为透明毛玻璃样式，适配透明主题",
                "修复问题",
                "- 修复透明主题下登录页侧边栏头部纯白问题，改为透明样式",
                "- 修复透明主题下系统设置页侧边栏头部纯白问题，改为透明样式",
                "- 修复便签弹窗侧边栏透明主题下纯白问题，调整为透明样式",
                "- 修复更多功能弹窗空状态内容偏右问题，改为居中显示",
                "- 修复移动端更多功能弹窗打开后突然消失问题，统一使用.show类控制显示",
                "- 修复便签侧边栏全屏状态下三点按钮与关闭按钮重叠问题，增加头部右侧padding",
                "- 修复开启增强功能后登录页左下角个人卡片上方显示移动端按钮的问题",
                "- 修复日历设置功能无法正确应用的问题，修复侧边栏被裁剪、开关样式缺失、主题色变量未定义等问题"
            ]
        },
        {
            version: "RC 2.7.0.4 (b8)",
            date: "2026-07-11",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2704.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2704_2.png"],
            features: [
                "(以下的更新内容为\"日历\"组件的新实验性功能，不建议在生产环境中使用)",
                "新增功能",
                "- 日历组件：实验性功能中新增日历组件，支持添加/删除/修改事件等功能，事件数据存储在本地文件中",
                "- 日历组件信息：在versionManager.js中新增日历组件版本信息，包含详细功能特性描述",
                "- 组件信息弹窗：日历三点菜单中的\"使用帮助\"功能改为\"组件信息\"，点击弹出统一的组件信息弹窗",
                "- 日历三点菜单：在日历弹窗右上角关闭按钮左侧添加三点按钮，点击弹出多级菜单",
                "- 日历菜单功能：菜单包含导出数据、导入数据、日历设置、清空所有数据、组件信息等功能项",
                "优化改进",
                "- 便签弹窗样式统一：便签弹窗侧边栏从紫色渐变背景改为白色背景+粉色主题色，与日历弹窗风格一致",
                "- 便签内部元素样式：统一便签弹窗内按钮、搜索框、标题、便签列表项等元素样式，采用粉色主题色",
                "- 多主题适配：便签弹窗完整适配默认、暗色、透明三种主题，保持视觉一致性",
                "- 交互体验优化：便签按钮悬停效果、选中状态、滚动条样式等细节优化",
                "修复问题",
                "- 修复日历弹窗显示不到一秒后突然消失的问题"
            ]
        },
        {
            version: "RC 2.7.0.3 (b8)",
            date: "2026-07-06",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2703.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2703_2.png"],
            features: [
                "新增功能",
                "- 城市管理侧边栏：点击添加城市按钮后从左侧划出侧边栏，支持搜索城市、查看城市卡片预览（含地区、空气质量、温度、天气状态）、添加/删除城市",
                "- 地区下拉菜单：天气组件左上角地区文本旁添加右三角图标，点击展开菜单显示切换城市和添加城市选项",
                "- 生活指数卡片弹窗：点击生活指数卡片弹出详情弹窗，显示影响因素和温馨提示",
                "- 空气质量详情卡片弹窗：点击污染物卡片弹出详情弹窗，显示等级标准和健康建议",
                "- 便签颜色标签：编辑器工具栏新增调色板按钮，支持9种颜色选择，侧边栏便签卡片左侧显示彩色边框指示",
                "- 自动保存功能：输入停止3秒后自动保存便签，未创建便签时直接输入会自动创建新便签",
                "- 字数统计：编辑器底部实时显示字符数统计，打开便签时自动更新",
                "- 快捷键增强：Ctrl+N新建便签、Ctrl+D删除便签、Escape关闭便签弹窗",
                "优化改进",
                "- 卡片悬浮弹跳效果：为生活指数、空气质量详情、天气详情卡片添加鼠标悬浮时图标弹跳动画",
                "- 天气引导步骤优化：更新引导步骤以适配新的城市管理功能和卡片点击弹窗功能",
                "- 透明主题适配：天气位置下拉菜单适配透明主题样式，使用毛玻璃效果",
                "- 保存状态反馈：底部显示已保存/保存中/未保存状态，不同状态使用不同颜色图标和文字",
                "- 空状态优化：重新设计空状态页面，添加图标和引导文案，搜索无结果时显示搜索提示和创建按钮",
                "- 便签卡片视觉增强：圆角增大、添加毛玻璃效果、悬停时向右滑动并添加阴影",
                "- 工具栏按钮激活状态：检测当前选区格式，粗体、斜体等按钮在激活时高亮显示",
                "- 多级菜单优化：组件信息和查看引导移至菜单最底部，菜单结构更加合理",
                "- 暗色/透明主题适配：所有新增UI元素适配三种主题，保持视觉一致性",
                "修复问题",
                "- 修复头像悬浮卡片被边框遮挡的问题，使卡片正常显示在边框外围",
                "- 修复PM10卡片中fa-smoke图标不显示的问题，替换为fa-cloud-meatball"
            ]
        },
        {
            version: "RC 2.7.0.2 (b8)",
            date: "2026-07-05",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2702.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2702_2.png"],
            features: [
                "重要变更",
                "- 天气组件的实验性测试现已结束，现已移动到'增强设置'卡片中，正式成为稳定功能",
                "新增功能",
                "- 天气动画效果：为天气图标添加太阳脉冲、云朵飘动、雨滴下落、雪花飘落、闪电、风吹等动态动画效果",
                "- 动态背景：天气弹窗根据天气状况自动切换背景渐变（晴天橙红、多云蓝、雨天灰黑、雪天银灰等）",
                "- 多城市管理：支持添加、删除、切换多个城市，城市列表显示实时温度",
                "- 穿衣建议：根据温度、湿度、天气状况智能推荐穿搭方案",
                "- 生活指数：提供洗车指数、运动指数、钓鱼指数、发型指数、化妆指数、旅游指数等参考",
                "- 语音播报：使用Web Speech API播放当前天气信息",
                "- 分享功能：一键复制天气信息到剪贴板",
                "- 空气质量详情：展示PM2.5、PM10、NO₂、O₃等详细污染物数据",
                "- 智能缓存策略：使用localStorage缓存天气数据，30分钟内有效，支持离线模式",
                "- 离线状态指示器：网络断开时显示离线状态提示",
                "- 天气预警提示：高温、低温、降水、紫外线、空气质量预警",
                "优化改进",
                "- 天气引导步骤优化：调整引导步骤顺序，添加自动滚动功能，确保所有步骤都能正常显示",
                "- 引导步骤扩展：新增添加城市、分享天气、语音播报、城市列表、穿衣建议、生活指数、空气质量等引导步骤",
                "- 响应式布局：天气弹窗适配移动端显示",
                "- 深色模式适配：天气组件完整适配暗色主题",
                "修复问题",
                "- 修复生活指数数值不显示的问题",
                "- 修复添加城市按钮点击后无反应的问题",
                "- 修复引导步骤自动滚动到空气质量区域不生效的问题",
                "- 修复新增城市后直接切换而不是添加到列表的问题",
                "- 修复天气详情、24小时预报、7天预报引导步骤触发时间过早导致不显示的问题"
            ]
        },
        {
            version: "RC 2.7.0.1 (b8)",
            date: "2026-07-03",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2701.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2701_2.png"],
            features: [
                "新增功能",
                "- 系统设置页卡片折叠功能：每个条目下的卡片右上角新增展开/收起按钮，默认展开状态，点击可折叠卡片内容",
                "- 卡片折叠状态持久化：每个卡片的展开/收起状态保存到本地存储，刷新页面后自动恢复",
                "- 全部展开/收起按钮：每个条目顶部导航栏新增\"全部展开/收起\"按钮，可一键操作所有卡片",
                "- 卡片折叠动画：为卡片展开/收起操作添加平滑的高度渐变、透明度变化和轻微位移动画效果",
                "- 开发者公告多级筛选菜单：开发日志中新增多级筛选菜单，支持按月份和版本筛选公告",
                "- 图片查看器组件信息按钮：版本更新记录中图片查看器右下角新增\"组件信息\"按钮，替换原展开按钮，点击可查看图片查看器组件版本详情",
                "优化改进",
                "- 卡片折叠动画优化：修复非当前显示条目下的卡片折叠/展开功能异常问题，确保所有条目下的卡片都能正常展开收起",
                "- 基本信息卡片排版优化：系统设置页基本信息卡片中用户名、用户ID和注册时间改为一行三列布局，竖线分隔并保留间距",
                "- 联系方式卡片排版优化：联系方式卡片改为与基本信息卡片相同的一行多列排版布局",
                "- 自定义背景显示逻辑优化：只有选择预设背景或自定义背景图片后才显示背景预览区域及其下方各个条目",
                "- 图片查看器全屏弹窗样式：图片查看器弹窗改为全屏显示样式，包含顶部标题栏、渐变装饰条和圆形关闭按钮，视觉风格与关于启动器弹窗保持一致",
                "- 图片查看器组件版本信息：在versionManager.js中新增图片查看器组件版本代码，包含详细的功能特性描述",
                "修复问题",
                "- 清除筛选按钮无反应：修复开发者公告中清除筛选按钮点击后无反应的问题",
                "- 图片查看器弹窗无法弹出：修复图片查看器中引用已删除的expandBtn元素导致JavaScript报错的问题，现在点击图片可正常弹出查看器"
            ]
        },
        {
            version: "RC 2.7.0.0 (b8)",
            date: "2026-07-01",
            tag: "major",
            tagText: "重大更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2700.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2700_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2700_3.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2700_4.png"],
            features: [
                "新增功能",
                "- 毛玻璃主题重新开放：更多主题中的毛玻璃主题正式开放使用，带来柔和的半透明模糊视觉体验",
                "优化改进",
                "- 透明主题全面优化：修复透明主题下的显示bug，现在透明主题效果与登录页保持一致，无模糊效果，通透性更强",
                "- 系统设置页现代化重构：优化系统设置页的整体样式布局，界面风格更加现代简洁",
                "- 全屏弹窗样式重构：重构部分全屏显示的弹窗样式，视觉效果更加精致统一",
                "- 全屏弹窗透明主题适配：对重构的全屏弹窗进行透明主题适配，保证各主题下的一致性体验",
                "- 编辑头像弹窗优化：修复并优化了编辑头像弹窗的按钮排版，以及透明主题下的显示效果",
                "- 背景图片显示优化：修复系统设置页个性化设置中修改背景图片后页面不显示背景的问题",
                "修复问题",
                "- 修复透明主题选择器不匹配导致样式无法正常生效的问题"
            ]
        },
        {
            version: "RC 2.6.4.8 (b8)",
            date: "2026-06-30",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2648.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2648_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2648_3.png"],
            features: [
                "新增功能",
                "- 名言打字机效果开关：组件调整弹窗中新增\"名言打字机效果\"开关，关闭后名言直接显示，开启后保留打字机动画",
                "- 显示秒数：时钟调整弹窗中新增\"显示秒数\"开关，可在时间中显示秒数",
                "- 分别调整字体大小：时钟调整弹窗中新增4个独立滑块，可分别调整时钟数字、日期、天气、名言的字体大小",
                "- 新增字体样式：新增粗体、手写体、细体3种字体样式，提供更多个性化选择",
                "- 组件初始化功能：组件设置弹窗中新增\"初始化\"大类和\"组件初始化\"按钮，点击后可一键重置组件所有设置到默认状态",
                "- 天气详情弹窗：天气组件中的8个信息卡片（体感温度、湿度、风向风力、气压、能见度、紫外线、降水概率、空气质量）点击后弹出详情弹窗，展示更详细的天气信息和科普知识",
                "- 天气组件折线图切换：天气组件中新增折线图展示未来7天内的天气变化趋势，更直观地了解天气变化",
                "优化改进",
                "- 跳转目标按钮布局：跳转目标按钮改为一行两个排版，按钮之间有间距，视觉上更清晰",
                "- 时钟调整弹窗滚动：时钟调整弹窗内容区域改为可滚动浏览，滚动条使用自定义样式，内容过多时不会溢出",
                "- 组件初始化按钮间距：调整组件初始化按钮与弹窗底部边框的距离，避免紧贴边框",
                "- 天气详情弹窗布局：详情弹窗采用左右两栏布局，左侧为大卡片展示主数值（粘性定位），右侧为详细信息列表，弹窗宽度扩大至860px，视觉更美观",
                "- 天气详情弹窗字体：所有文字优化为白色/亮色，配合渐变背景，大幅提升可读性",
                "- 天气详情弹窗标题栏：移除左上角返回按钮，仅保留右上角关闭按钮，界面更简洁统一",
                "- 透明主题适配：选择城市弹窗改为透明毛玻璃样式，与透明主题风格统一"
            ]
        },
        {
            version: "RC 2.6.4.7 (b8)",
            date: "2026-06-29",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 时钟调整收起展开：时钟调整弹窗底部新增收起/展开小按钮，点击后收起弹窗只保留顶部标题栏，再次点击恢复完整大小",
                "- 引导功能新增：在便签组件、页面时钟组件和天气组件中新增引导功能，引导用户完成首次设置",
                "优化改进",
                "- 引导事件绑定优化：全局引导按钮事件从addEventListener改为onclick属性绑定，避免与组件引导的事件处理函数冲突导致状态混乱",
                "- 引导重新开始逻辑：全局引导结束弹窗的\"重新开始\"按钮改为直接从头开始引导，不再走欢迎弹窗流程，与组件引导行为一致",
                " -启动器查看引导一图流功能移除：启动器引导一图流功能已被移除，仅保留全局引导功能，引导用户完成首次设置",
                "修复问题",
                "- 修复引导进行到一半时提前显示完成弹窗的问题，解决全局和组件引导事件同时执行导致的状态不同步",
                "- 修复所有组件引导步骤文本不显示的问题，恢复tooltip提示框的可见状态",
                "- 修复启动器引导结束弹窗中重新开始按钮点击后无反应的问题",
                "- 修复个人名片设置中保存设置按钮无法显示的问题，改用唯一ID选择器定位",
                "- 修复名片组件调整后关闭刷新状态不保留的问题，确保设置正确持久化"
            ]
        },
        {
            version: "RC 2.6.4.6 (b8)",
            date: "2026-06-28",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 一键已读：版本更新记录和开发者公告弹窗侧边栏底部新增\"一键已读\"按钮，点击后自动标记所有内容为已读，无需逐个查看",
                "优化改进",
                "- 暗色模式适配：天气设置弹窗和组件调整弹窗完整适配暗色模式，所有元素样式与深色主题统一",
                "- 透明主题适配：天气下拉菜单、版本更新/公告侧边栏子按钮、页面时钟设置按钮等改为透明毛玻璃样式，适配透明主题",
                "- 便签菜单样式统一：便签多级菜单样式改为与天气下拉菜单一致，圆角、阴影、内边距等风格统一",
                "- 便签菜单透明度：透明主题下便签多级菜单透明度调整为微透明，提高可读性同时保留毛玻璃质感",
                "- 页面时钟定时优化：弹窗打开时不触发页面时钟自动定时功能，避免停留弹窗过久自动进入时钟模式",
                "- 天气功能联动：关闭显示天气时自动关闭并禁用\"点击天气后跳转到指定程序\"功能，开启天气后恢复可用",
                "- 组件版本条目：保持隐藏UI模式下组件版本条目始终可见可点击，不受全局禁用影响",
                "- 组件调整滚动条：组件调整弹窗滚动条改为自定义样式，支持亮色、暗色、透明三种主题",
                "- 文字调整：组件调整弹窗中\"时钟位置\"改为\"调整时钟\"，\"调整位置\"按钮改为\"点击调整\"",
                "修复问题",
                "- 修复组件调整弹窗滚动时开关按钮溢出圆角边界的问题",
                "- 修复部分天气类型（如雷暴）图标不显示的问题，补充缺失的天气代码图标映射"
            ]
        },
        {
            version: "RC 2.6.4.5 (b8)",
            date: "2026-06-27",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2645.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2645_2.png"],
            features: [
                "新增功能",
                "- 页面时钟定时开启：页面时钟条目内新增\"定时开启\"子功能，支持设置登录页静置X分钟/秒后自动启用页面时钟，所有功能在同一条目框内显示",
                "- 天气跳转目标扩展：天气跳转功能新增Yahoo Weather、AccuWeather、Windy.com三个跳转选项，提供更多天气网站选择",
                "优化改进",
                "- 页面时钟天气跳转：将\"跳转到MSN Weather\"改为\"点击天气后跳转到指定程序\"，支持下拉选择MSN Weather、Yahoo Weather、AccuWeather、Windy.com和页面天气五种目标",
                "- 名言打字机效果：页面时钟名言刷新后文字以打字机效果逐字显示，内容和作者分别打字，带有闪烁光标",
                "- 城市选择自动保存：手动选择城市后自动保存到本地存储，下次进入天气弹窗时自动使用该地址查询天气",
                "- MSN天气图标优化：将MSN Weather的图标从地球图标改为微软田字格品牌图标",
                "修复问题",
                "- 修复名言打字机效果循环播放的问题，现在打字完成后不会再重新开始"
            ]
        },
        {
            version: "RC 2.6.4.4 (b8)",
            date: "2026-06-27",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2644.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2644_2.png"],
            features: [
                "(以下的更新内容为\"天气\"组件的新实验性功能，不建议在生产环境中使用)",
                "新增功能",
                "- 天气组件：实验性功能中新增天气组件，支持实时天气、24小时预报、7天预报等功能，数据来源为Open-Meteo API",
                "- 城市切换：天气弹窗支持切换城市，内置全国主要城市数据库，支持搜索定位",
                "- 自动定位：支持浏览器自动定位功能，开启后打开天气弹窗自动获取当前位置天气",
                "- 更多选项菜单：天气弹窗右上角新增竖向三个点按钮，下拉菜单包含自动定位开关、温度单位切换、自动刷新设置、组件信息等功能",
                "- 温度单位切换：支持摄氏度（°C）与华氏度（°F）切换，所有温度显示同步转换",
                "- 自动刷新：支持15分钟、30分钟、1小时三档自动刷新间隔",
                "- 组件信息：天气组件版本信息统一存放在versionManager.js的components中，可通过下拉菜单查看",
                "优化改进",
                "- 天气卡片布局：体感温度等八个卡片数值放大并右对齐，布局更清晰",
                "- 24小时预报优化：改为大卡片横向滚动布局，每小时数据用竖线分隔",
                "- 滚动条样式：天气弹窗垂直滚动条和24小时预报横向滚动条改为自定义样式，与整体风格统一",
                "- 城市数据库：内置丰富的全国城市数据，减少搜索未找到的情况",
                "- 组件信息样式优化：弹窗内显示组件详细信息，包括版本号、开发者、版权等，优化样式和布局，更符合整体风格"
            ]
        },
        {
            version: "RC 2.6.4.3 (b8)",
            date: "2026-06-24",
            tag: "patch",
            tagText: "补丁更新",
            images: [],
            features: [
                "优化改进",
                "- 对《用户协议》和《隐私政策》进行了全面更新，更新后的协议将于 2026年6月24日 起正式生效",
                "修复问题",
                "- 修复了在开发者公告中，普通公告tag标签错误使用的问题",
                "- 在RC 2.6.4.3 (b7)版本更新记录中新增了一张预览图片，因为该图片在更新整合时被意外遗落，故此补充"
            ]
        },
        {
            version: "RC 2.6.4.3 (b7)",
            date: "2026-06-24",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2643.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2643_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2643_3.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2643_4.png"],
            features: [
                "新增功能",
                "- 便签全屏显示：便签弹窗侧边栏右上角新增\"全屏显示\"按钮，点击后侧边栏向右延展铺满全屏，放大便签卡片比例显示更多内容",
                "- 页面时钟侧边栏模式：组件调整弹窗新增\"侧边栏模式\"，开启后天气设置和组件设置弹窗改为从右到左侧滑出",
                "- 组件版本信息：组件设置弹窗新增\"组件版本\"类别，点击显示便签、页面时钟等组件的详细版本信息",
                "- 实验性功能提示卡片：系统设置页面实验性功能区域新增提示卡片，显示实验性功能说明",
                "- 禁用实验性功能：新增禁用实验性功能按钮，点击后弹出确认弹窗，禁用后禁止所有实验性功能开关",
                "优化改进",
                "- 便签卡片预览扩展：全屏显示模式下便签卡片预览内容从50字符扩展到200字符，配合自定义滚动条样式",
                "- 侧边栏模式背景：启用侧边栏模式后背景为正常透明效果，而非模糊效果",
                "- 侧边栏模式天气排版：天气设置面板中天气预览和刷新按钮移至温度单位条目下方（仅侧边栏模式）",
                "- 登录页图标更新：PRE Launcher图标从游戏手柄改为火箭图标，更符合多功能启动器定位",
                "- 版本号动态更新：修复修改versionManager.js后组件版本条目中版本号不更新的问题",
                "- 实验性功能状态持久化：实验性功能警告阅读状态和禁用状态使用localStorage持久化保存",
                "修复问题",
                "- 修复登录页更多操作弹窗关闭动效未生效问题",
                "- 修复登录页更多功能弹窗关闭动效未生效问题",
                "- 修复页面时钟天气设置弹窗关闭动效未生效问题",
                "- 修复页面时钟组件调整弹窗关闭动效未生效问题",
                "- 修复便签弹窗关闭动效未生效问题"
            ]
        },
        {
            version: "RC 2.6.4.2 (b7)",
            date: "2026-06-21",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 系统引导卡片：增强功能页面新增\"系统引导\"开关，启用后在登录页\"更多功能\"中显示\"查看引导\"按钮",
                "- UI调整卡片：增强功能页面新增\"UI调整\"开关，启用后在登录页\"更多功能\"中显示\"调整UI比例\"按钮",
                "- 页面时钟卡片：增强功能页面中页面时钟功能保持独立卡片",
                "- 隐藏UI功能：增强功能页面新增\"隐藏UI\"开关，与页面时钟联动，开启后可使用页面时钟功能",
                "- 关于启动器功能：增强功能页面新增\"关于启动器\"开关，启用后在登录页\"更多功能\"中显示\"关于启动器\"按钮",
                "- 富文本编辑器增强：便签富文本编辑器新增撤销、重做、左对齐、右对齐、两端对齐、缩进、文字颜色、高亮颜色、插入链接、插入水平线功能",
                "优化改进",
                "- 功能开关控制：增强功能中的开关可控制登录页\"更多功能\"弹窗中对应按钮的显示与隐藏",
                "- 空状态提示：当所有功能都关闭时，更多功能弹窗显示友好的空状态提示，引导用户前往系统设置开启功能",
                "- 实验性功能集成：便签等实验性功能现在可被更多功能弹窗正确识别和显示"
            ]
        },
        {
            version: "RC 2.6.4.1 (b7)",
            date: "2026-06-21",
            tag: "patch",
            tagText: "补丁更新",
            images: [],
            features: [
                "修复问题",
                "- 回退了个性化中的某个更新，因为该更新导致背景图片出现异常",
            ]
        },
        {
            version: "RC 2.6.4.1 (b6)",
            date: "2026-06-21",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2641.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2641_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2641_3.png"],
            features: [
                "(以下的更新内容为\"便签\"组件的新实验性功能，不建议在生产环境中使用)",
                "新增功能",
                "- 自动创建便签：在未新建便签时直接写入内容，点击保存后自动创建新便签",
                "- 菜单选项：便签侧边栏右上角新增三个点菜单按钮，滑出多级选项卡",
                "- 编辑模式：支持批量选择便签进行置顶或删除操作，点击卡片即可选择",
                "- 列表/宫格模式：支持切换便签列表排版，一行一个便签或一行两个宫格布局",
                "- 组件信息：点击显示便签组件详细版本信息弹窗，版本信息统一管理在versionManager.js",
                "- 置顶功能：支持将便签置顶，置顶便签显示金色图钉图标在右上角",
                "- 取消置顶：支持取消便签的置顶状态，新增取消置顶按钮",
                "- 导出便签：支持选择便签导出为TXT文本文件，包含标题、时间和内容",
                "- 导入便签：支持导入TXT文本文件，自动解析并创建新便签",
                "- 排序功能：支持按创建时间或修改时间降序排列便签",
                "优化改进",
                "- 编辑模式优化：进入编辑模式时隐藏新建按钮，三个操作按钮样式减小并下移",
                "- 取消按钮：编辑模式新增取消按钮，点击退出编辑模式并显示新建按钮",
                "- 点击逻辑：编辑模式下点击卡片即可完成选择，无需点击圆圈按钮",
                "- 暗色主题适配：便签菜单面板适配暗色主题样式，统一深色背景和文字",
                "- 透明主题适配：便签菜单面板和导出导入弹窗适配透明主题毛玻璃样式",
                "- 按钮颜色：透明主题下导出导入按钮统一改为粉色样式",
                "修复问题",
                "- 组件信息弹窗层级：修复弹窗显示在便签窗口下方的问题",
                "- 排序功能：修复按创建时间/修改时间排序不生效的问题",
                "- 置顶功能：修复置顶后便签未正确标记和排序的问题",
                "- 滚动功能：修复右侧便签内容过多时无法滚动的问题",
                "- 导出导入弹窗层级：修复导出和导入便签弹窗显示在便签窗口下方的问题"
            ]
        },
        {
            version: "RC 2.6.4.0 (b6)",
            date: "2026-06-20",
            tag: "major",
            tagText: "重大更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2640.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2640_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2640_3.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2640_4.png"],
            features: [
                "新增功能",
                "- 登录认证机制：新增登录页认证机制，大厅页面需要通过登录页认证才能进入，直接进入大厅会被拦截并踢回登录页",
                "- 便签功能：实验性功能中新增便签功能，支持富文本编辑、搜索、删除等操作",
                "- 便签富文本编辑：支持标题、小标题、正文、等宽样式、居中、项目符号列表、编号列表、斜体、粗体、下划线、删除线、引用、待办事项",
                "优化改进",
                "- 字体更新：所有页面字体更新为鸿蒙字体 HarmonyOS Sans",
                "- 账户设置更名为系统设置：侧边栏、顶部导航栏、语言配置、弹窗文本等全部更新",
                "- 增强功能：高级管理类别下新增\"增强功能\"条目，页面时钟从个性化移动到此条目",
                "- 便签侧边栏优化：新增搜索框支持快速搜索便签，新建按钮改为右下角大圆圈+号样式",
                "- 透明主题适配：便签弹窗支持透明主题毛玻璃样式",
                "- 删除确认弹窗：便签删除确认改为自定义弹窗样式，替代浏览器默认confirm",
                "- 字体版权声明：登录页关于启动器中的字体版权声明更新为鸿蒙字体版权信息",
                "修复问题",
                "- 修复直接进入大厅页面没有被拦截的问题",
                "- 修复增强功能页面标题显示为账户信息的问题"
            ]
        },
        {
            version: "RC 2.6.3.13 (b6)",
            date: "2026-06-18",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 天气跳转功能：页面时钟天气组件新增点击跳转到MSN Weather网站功能",
                "- 天气跳转开关：组件调整弹窗中新增\"点击天气组件后跳转到MSN Weather\"开关选项",
                "优化改进",
                "- 安全验证弹窗按钮：使用PIN码进行安全验证按钮改为透明样式",
                "- PIN码验证弹窗：PIN码提示文本框改为透明样式",
                "- 实验性功能弹窗：透明主题下文本内容字体调亮，提高可读性",
                "- 卡片条目文本：所有卡片条目中主标题下方的详细内容文本改为统一亮色",
                "- 弹窗内容文本：所有弹窗中主标题下方的详细内容文本改为统一亮色",
                "- 注册弹窗样式：注册新账号弹窗中的步骤栏、输入框和按钮改为透明样式",
                "修复问题",
                "- 修复验证码图片和输入框不对齐的问题"
            ]
        },
        {
            version: "RC 2.6.3.12 (b6)",
            date: "2026-06-17",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 页面时钟实验性测试已结束，现已移动到\"个性化\"设置中",
                "- 点击名言刷新：点击名言框内即可刷新名言内容",
                "- 名言加载图标：点击刷新时在名言框中间显示旋转加载图标",
                "- 隐藏所有图标功能：可隐藏页面时钟中的返回、天气设置和组件调整按钮，鼠标悬停显示",
                "- 时钟调整提示：进入时钟调整模式时底部弹出\"拖拽时间组件可调整位置\"提示横条",
                "优化改进",
                "- 名言框尺寸固定：固定名言框宽度和高度，防止被较长名言内容延长",
                "- 个性化命名：将主题设置更名为个性化",
                "- 透明主题适配：天气设置、组件设置弹窗和底部提示横条支持透明主题毛玻璃样式",
                "修复问题",
                "- 修复点击时钟调整弹窗关闭按钮后时钟仍可拖动的问题"
            ]
        },
        {
            version: "RC 2.6.3.11 (b6)",
            date: "2026-06-16",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/26311.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/26311_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/26311_3.png"],
            features: [
                "新增功能",
                "(以下的更新内容为页面时钟的新实验性功能，不建议在生产环境中使用)",
                "- 页面时钟新增名言显示功能：使用 hitokoto API 获取实时名言数据，显示在时钟下方",
                "- 时钟调整面板：点击调整位置按钮后显示可移动弹窗，支持调整文字大小、对齐方式、时间格式、字体样式、日期格式",
                "- 鼠标滚轮调节大小：进入调整模式后，鼠标悬停在时钟上滚动滚轮可调节大小",
                "- 左上角返回按钮：开启页面时钟后在左上角显示返回按钮，点击退出时钟模式",
                "优化改进",
                "- 天气对齐同步：调整对齐方式时，天气显示也同步调整对齐方向",
                "- 农历字体统一：农历字体与时钟字体样式保持一致",
                "- 组件调整弹窗优化：删除名言位置功能，时钟位置移至显示选项上方，改为单列布局",
                "- 时钟调整弹窗按钮样式统一：所有按钮使用一致的样式设计",
                "- 时钟调整弹窗加宽：宽度从280px增加到340px，按钮显示更完整",
                "- 点击行为优化：开启页面时钟后点击空白处不再返回，需点击返回按钮；关闭后恢复点击空白显示UI",
                "- 提示横条优化：启用页面时钟后自动隐藏提示横条，关闭后重新显示",
                "修复问题",
                "- 修复调整位置后大小功能失效的问题",
                "- 修复保存设置后刷新时钟大小不生效的问题",
                "- 修复时钟设置弹窗按钮点击无效的问题"
            ]
        },
        {
            version: "RC 2.6.3.10 (b6)",
            date: "2026-06-15",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/26310.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/26310_2.png"],
            features: [
                "新增功能",
                "(以下的更新内容为页面时钟的新实验性功能，不建议在生产环境中使用)",
                "- 天气设置功能：支持API获取天气数据，用户可自行选择城市/省份",
                "- 温度单位切换：支持摄氏度/华氏度切换，并持久化保存设置",
                "- Open-Meteo API版权声明：在天气设置弹窗底部添加API版权信息",
                "- 关于启动器新增Open-Meteo API版权按钮，点击显示详细声明",
                "- 天气预览测试区域：方便测试切换地区后的天气显示效果",
                "优化改进",
                "- 天气设置弹窗改为左右两栏布局，左侧显示设置项，右侧显示预览",
                "- 版权声明按钮重新排序，改为分类显示结构",
                "- 自动定位时显示\"获取位置信息中\"状态提示",
                "修复问题",
                "- 修复部分城市天气图标不显示的问题",
                "- 修复PC端开启页面时钟后仍显示\"隐藏UI\"文本的问题",
                "- 修复自动定位只显示摄氏度的问题",
                "- 修复温度单位设置刷新后不生效的问题",
                "- 修复自动定位弹窗自动关闭的问题"
            ]
        },
        {
            version: "RC 2.6.3.9 (b6)",
            date: "2026-06-14",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2639.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2639_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2639_3.png"],
            features: [
                "新增功能",
                "- 账户设置页新增\"实验室\"类别和\"实验性功能\"页面",
                "- 页面时钟实验性功能：隐藏UI后显示时间、日期、天气和农历",
                "- 页面时钟设置弹窗：可调整位置、格式、字体大小等多项参数",
                "优化改进",
                "- 页面时钟支持9种位置、3种日期格式、3种字体样式、12/24小时制",
                "- 页面时钟设置弹窗采用双列布局，全局开关置于顶部",
                "- \"保持UI隐藏\"模式下所有调节按钮自动禁用变灰",
                "修复问题",
                "- 修复关闭页面时钟实验功能后登录页仍显示该功能的问题"
            ]
        },
        {
            version: "RC 2.6.3.8 (b6)",
            date: "2026-06-10",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2638.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2638_2.png"],
            features: [
                "新增功能",
                "- 反馈选择弹窗：点击反馈建议先弹出选择弹窗，包含\"本地反馈\"和\"提交到Github Issue\"两个按钮",
                "- 透明主题正式版现已推出：包含登录页、游戏大厅、游戏内界面等所有元素的透明毛玻璃效果",
                "优化改进",
                "- Github跳转确认：点击Github按钮弹出离开页面确认弹窗，确认后才跳转",
                "- 透明主题全面优化：登录页所有弹窗、侧边栏、导航项、公告项、版本记录等全部改为透明毛玻璃样式",
                "- 透明主题文本：所有文字颜色提升亮度，添加文字阴影增强对比度和可读性",
            ]
        },
        {
            version: "RC 2.6.3.7 (b6)",
            date: "2026-06-09",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2637.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2637_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2637_3.png"],
            features: [
                "新增功能",
                "- 弹窗快捷键支持：账户设置页所有弹窗支持Enter键确认、ESC键取消",
                "- 登录页引导功能：首次进入或无账号登录时自动显示UI引导，详细介绍各功能位置及用途",
                "- 更多功能查看引导：登录页右上角更多功能中新增\"查看引导\"按钮，可随时重新查看引导",
                "优化改进",
                "- 引导步骤优化：添加登录卡片、侧边栏收起、更多功能弹窗等引导内容",
                "- 引导颜色优化：高亮框从淡蓝色改为更醒目的橙色，进度条同步更新",
                "- 引导底部布局优化：进度条移至按钮上方，跳过引导改为淡红色按钮样式",
                "- 引导结束弹窗：引导完成后显示确认弹窗，可选择结束引导或重新开始",
                "修复问题",
                "- 修复登录后点击查看引导按钮无反应的问题",
                "- 修复引导结束弹窗弹出后底部按钮仍可点击的问题"
            ]
        },
        {
            version: "RC 2.6.3.6 (b6)",
            date: "2026-06-09",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "优化改进",
                "- 背景图片上传：最大文件限制从100MB调整为20MB，防止过大图片导致内存占用过高",
                "- 背景图片上传：添加图片格式白名单验证，仅支持JPG、PNG、GIF、WebP、BMP格式",
                "- 背景图片上传：添加30秒超时机制，防止异常格式图片处理超时",
                "- 背景图片上传：使用Image对象验证图片解码有效性，防止无效图片导致页面卡死",
                "- IndexedDB操作：所有页面背景读取添加5秒超时机制，超时后跳过背景加载",
                "- IndexedDB操作：所有IndexedDB操作添加try-catch保护，防止异常导致页面卡死",
                "- 背景设置验证：加载背景时验证fit、opacity、blur参数有效性，防止无效值导致错误",
                "- 全局错误监听：所有页面添加window.onerror和unhandledrejection监听",
                "- 外部资源加载：Font Awesome CSS添加onerror回退机制",
                "- 外部资源加载：JSZip脚本添加onerror处理，标记fallback状态",
                "修复问题",
                "- 修复移动端账户设置页更换自选背景后设置不会同步到其他页面的问题",
                "- 修复重新加载页面时CSS和JS文件加载异常导致页面卡死的问题",
                "- 修复使用HDR图片作为背景时有概率导致页面卡死的问题"
            ]
        },
        {
            version: "RC 2.6.3.5 (b6)",
            date: "2026-06-08",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2635.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2635_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2635_3.png"],
            features: [
                "新增功能",
                "- 主题信息查看按钮：账户设置页更多主题弹窗中每个主题按钮左上角新增信息按钮，点击显示主题详细版本信息",
                "- 登录页复制功能：用户信息卡片右侧新增复制按钮，点击后显示所有条目的单独复制按钮",
                "优化改进",
                "- 透明主题适配：账户设置页默认弹窗、按钮和输入框改为透明毛玻璃样式",
                "- 弹窗文本可读性：透明主题下弹窗内文字颜色提升，添加阴影增强对比度",
                "- 复制提示样式：复制成功提示横条改为与隐藏UI横条一致的透明毛玻璃样式",
                "- 版本更新图片路径：原始路径 fallback 方案改为使用 localimages 目录，保持 zip 解压方案不变",
                "修复问题",
                "- 修复透明主题下复制提示横条样式不正确的问题"
            ]
        },
        {
            version: "RC 2.6.3.4 (b6)",
            date: "2026-06-07",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 隐藏UI提示横条：点击隐藏UI后，屏幕底部从下往上弹出提示横条'点击空白处显示UI'",
                "- 提示横条交互：鼠标悬浮时文本淡入淡出切换为'点击隐藏该提示'，点击可隐藏提示横条",
                "优化改进",
                "- 透明主题适配：用户信息卡片、更多操作悬浮气泡、按钮悬浮气泡、侧边栏菜单悬浮气泡全部改为透明样式",
                "- 透明主题适配：更多功能按钮、更多操作按钮、登录按钮、左上角徽标图标改为透明样式",
                "- 透明主题适配：账户设置页卡片图标、条目背景、返回按钮、滚动条改为透明样式",
                "- 透明主题适配：成就系统页小游戏按钮、进度条改为透明样式",
                "- 透明主题适配：更多功能弹窗、更多操作弹窗、确认弹窗改为透明毛玻璃样式",
                "- UI优化：删除确认弹窗内部上下两条隔断横线，视觉更简洁",
                "修复问题",
                "- 修复透明主题下头像悬浮卡片中昵称输入框边框不显示和字体过白的问题",
                "- 修复移动端模式下更多功能区透明主题样式不生效的问题",
                "- 修复移动端提示弹窗在透明主题下不是透明主题样式的问题"
            ]
        },
        {
            version: "RC 2.6.3.3 (b6)",
            date: "2026-06-07",
            tag: "patch",
            tagText: "补丁更新",
            images: [],
            features: [
                "新增功能",
                "- 引入 JSZip 技术：版本公告图片支持从 verimg.zip 压缩包自动解压加载",
                "优化改进",
                "- 图片加载方式升级：使用本地缓存系统存储图片 URL，减少 HTTP 请求",
                "修复问题",
                "- 修复本地 file:// 协议下无法加载资源的问题，自动降级使用原始图片路径"
            ]
        },
        {
            version: "RC 2.6.3.3 (b5)",
            date: "2026-06-06",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2633.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2633_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2633_3.png"],
            features: [
                "新增功能",
                "- 更多主题弹窗：毛玻璃主题按钮改为'更多主题'入口，弹出选择窗口",
                "- 透明主题 BETA：全新的透明主题，侧边栏、导航栏和卡片全部透明化，保留边框线条，文字添加阴影增强可读性",
                "- 本地预设背景：预设背景选择新增联网/本地切换滑块，支持使用bgimg目录下的本地图片",
                "优化改进",
                "- 透明主题移动端优化：移动端侧边栏弹出时自动调暗背景，提升可读性",
                "- 毛玻璃主题功能精简：毛玻璃主题按钮暂时禁用，待优化后重新开放",
                "- 透明主题输入框统一优化：所有输入框、下拉框、文本域统一透明样式，文字颜色为白色并带阴影",
                "- 弹窗输入框样式覆盖：透明主题下弹窗背景为白色，输入框改用深色边框和深色文字保持对比",
                "- 下拉菜单选项优化：透明主题下下拉选项改为深色文字，确保白底黑字可读性",
                "- 三页面同步：账户设置页、登录页、游戏大厅页透明主题输入框样式完全统一",
                "- 预设背景弹窗精简：移除刷新预设背景按钮，简化界面",
                "- 滑块按钮悬浮提示：本地/联网切换滑块添加悬浮气泡提示，显示'切换本地壁纸或联网壁纸'",
                "- 移动端预设背景弹窗优化：调整滑块按钮位置，避免遮挡标题文本",
                "修复问题",
                "- 修复透明主题在登录页和游戏大厅页面不生效的问题",
                "- 修复登录页顶部导航栏透明主题不生效的问题",
                "- 修复本地图片路径问题：账户设置、登录页、游戏大厅页本地背景图片路径统一处理",
                "- 修复背景预览区双重图片显示问题：预览区与页面背景分别应用，不再叠加",
                "- 修复预设背景图片预览不显示问题：本地/联网预设图片选择后正确显示预览",
                "- 修复自定义背景图片应用后页面空白问题：base64 data URL 不再被错误添加路径前缀",
                "- 修复登录页开发者公告中点击返回顶部按钮后功能不生效的问题"
            ]
        },
        {
            version: "RC 2.6.3.2 (b5)",
            date: "2026-06-04",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2632.png"],
            features: [
                "新增功能",
                "- 静默更新提示弹窗：登录页检测到最新版本后自动弹出静默更新提示弹窗",
                "- 跳转到版本更新按钮：点击按钮可直接打开版本更新记录窗口",
                "- 自动定位版本公告：点击跳转后自动识别当前版本号并跳转到对应的更新公告处",
                "优化改进",
                "- 全局设置弹窗样式：登录页全局设置弹窗改为全屏统一样式",
                "- 弹窗宽度优化：静默更新弹窗宽度从300px增加到550px",
                "修复问题",
                "- 修复版本更新跳转问题：点击\"跳转到版本更新\"按钮后不再显示\"加载中\"，正确显示更新公告内容"
            ]
        },
        {
            version: "RC 2.6.3.1 (b5)",
            date: "2026-06-03",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 弹窗键盘快捷键支持：所有弹窗新增键盘按键绑定，按下Enter触发确定按钮，按下Esc触发取消/返回按钮",
                "修复问题",
                "- 修复注册成功弹窗文本不显示问题：注册成功后弹窗正确显示\"注册成功！请使用新账号登录\"提示",
                "- 修复注册自动登录问题：注册成功后不再自动登录，不会覆盖原有登录表单和个人卡片"
            ]
        },
        {
            version: "RC 2.6.3.0 (b5)",
            date: "2026-05-29",
            tag: "major",
            tagText: "重大更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2630.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2630_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2630_3.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2630_4.png"],
            features: [
                "新增功能",
                "- 反馈建议弹窗全屏显示：采用侧边栏导航布局，包含功能建议、Bug反馈、其他问题三个分类",
                "- 反馈表单增强：添加优先级选择、平台选择、反馈标题、复现步骤、预期结果等字段",
                "- 文件附件上传：支持图片、日志文件上传，最大5MB",
                "- 开发者公告月份分类：重要公告和普通公告按月份分组显示，例如2026年5月、2026年4月分别显示",
                "- 预设背景底部抽屉：移动端预设背景弹窗改为底部抽拉样式，支持触摸滑动关闭",
                "- 图片查看器全面升级：新增旋转、翻转功能，控制按钮移至右侧，支持展开/收起",
                "- 图片查看器悬浮气泡：控制按钮添加从右往左滑出的悬浮气泡提示",
                "优化改进",
                "- 版本更新红点逻辑优化：使用版本号+日期作为唯一标识，相同版本号不同日期更新也能正确触发消息通知",
                "- 反馈弹窗布局优化：充分利用右侧显示区域，所有内容一页显示",
                "- 账户设置移动端布局优化：账户信息卡片内容不再溢出卡片边界，按钮、输入框和文本排版更加整齐",
                "- 预设背景图片放大：移动端预设背景弹窗中图片放大显示，改为全屏高度展示",
                "- 暗色模式按钮样式统一：版本更新记录和开发者公告中的版本块状按钮支持暗色模式，文本颜色调亮",
                "- 预设背景功能精简：移除预设背景弹窗中的预览背景功能，界面更加简洁",
                "- 图片查看器布局优化：采用三栏布局，控制按钮垂直排列在右侧，底部显示缩放百分比",
                "- 图片查看器优化拖拽功能：优化拖拽图片时的响应速度，拖拽更流畅",
                "修复问题",
                "- 修复反馈弹窗双重滚动条问题",
                "- 修复Bug反馈时复现步骤字段未正确显示问题",
                "- 修复开发者公告中块状按钮未生效暗色模式的问题",
                "- 修复版本更新记录中块状按钮文本在暗色模式下不明显的问题",
                "- 修复图片查看器悬浮气泡被侧边栏裁剪的问题，现在可以正常向外显示",
                "- 修复图片查看器控制栏展开/收起状态重置问题"
            ]
        },
        {
            version: "RC 2.6.2.5 (b5)",
            date: "2026-05-27",
            tag: "patch",
            tagText: "补丁更新",
            images: [],
            features: [
                "修复问题",
                "- 修复消息红点显示错误问题"
            ]
        },
        {
            version: "RC 2.6.2.5 (b4)",
            date: "2026-05-26",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2625.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2625_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2625_3.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2625_4.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2625_5.png"],
            features: [
                "新增功能",
                "- 开发者公告选择界面：公告窗口右侧首先显示块状按钮列表，点击按钮后显示公告详情",
                "- 消息红点通知：侧边栏版本更新和开发者公告按钮添加红点提醒，有未查看内容时显示",
                "- 悬浮气泡提示：鼠标悬浮在红点上时显示\"存在未查看的更新\"提示",
                "- 返回按钮固定：公告详情页返回按钮使用粘性定位，滚动时保持固定",
                "优化改进",
                "- 红点显示优化：版本和公告按钮内红点显示未查看数量，提高辨识效率",
                "- 红点位置调整：按钮内红点移至右下角，悬浮气泡从下往上滑出",
                "- 新更新标签：版本条目内添加\"新更新\"标签，查看后自动消失",
                "修复问题",
                "- 修复红点数量计算错误：版本按钮红点显示该版本下未查看子版本数量",
                "- 修复红点显示文本错误：侧边栏红点仅显示圆点，不显示数字",
                "- 修复按钮内红点不显示数量问题"
            ]
        },
        {
            version: "RC 2.6.2.4 (b4)",
            date: "2026-05-24",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2624.png"],
            features: [
                "优化改进",
                "- 版本选择按钮样式优化：版本更新记录窗口中版本号选择改为块状按钮样式，一行四个按钮，支持自动换行",
                "- 按钮样式优化：加长按钮宽度，背景改为白色，日期和版本数量文本放大加深，提升可读性",
                "- 版本分类功能：添加版本维护状态分类条目，分为\"正在维护中的版本\"和\"已结束维护的版本\"两组显示"
            ]
        },
        {
            version: "RC 2.6.2.3 (b4)",
            date: "2026-05-17",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2623.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2623_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2623_3.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2623_4.png"],
            features: [
                "新增功能",
                "- 侧边栏收起功能：登录页侧边栏顶部新增\"收起侧边栏\"按钮，点击后收起侧边栏仅保留图标显示",
                "- 侧边栏收起状态持久化：使用localStorage保存收起状态，刷新或退出后重新访问时保持上次状态",
                "- 收起侧边栏悬浮气泡：侧边栏收起时，鼠标悬浮在菜单按钮上在对应条目右侧显示悬浮气泡文本",
                "- 移动端更多功能按钮：移动端模式下在个人卡片上方新增独立卡片样式的更多功能按钮，点击弹出与PC端一样的弹窗",
                "优化改进",
                "- 收起侧边栏样式优化：个人卡片竖向排列，仅显示头像和更多操作按钮，隐藏顶部启动器图标",
                "- 收起侧边栏边框优化：增加个人卡片边框宽度，确保头像和按钮全部包含在卡片内",
                "- 移动端按钮位置优化：收起侧边栏按钮移至三条杠按钮左侧，解决位置冲突问题",
                "- 悬浮气泡样式统一：菜单项悬浮气泡显示效果与更多功能按钮保持一致",
                "- 移动端弹窗样式统一：移动端更多功能弹窗改为与PC端一致的弹窗样式",
                "- 移动端收起侧边栏优化：移动端模式下收起侧边栏时，个人卡片上方也显示更多功能按钮",
                "修复问题",
                "- 修复收起侧边栏后用户信息卡片被限制在侧边栏内无法正常显示的问题",
                "- 修复移动端更多功能弹窗关闭按钮样式不正确的问题",
                "- 修复收起侧边栏时悬浮气泡被拦截在侧边栏内无法正常显示的问题",
                "- 修复移动端关于启动器弹窗显示不完整的问题，改为全屏滚动显示",
                "- 修复移动端账户设置侧边栏无法上下滑动的问题，确保侧边栏内容超出屏幕时可正常滚动",
            ]
        },
        {
            version: "RC 2.6.2.2 (b4)",
            date: "2026-05-16",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "优化改进",
                "- 暗色模式提示弹窗：暗色模式下通用提示弹窗改为暗色主题，与整体界面风格保持一致",
                "- 未登录状态按钮禁用：未登录时禁用进入账户设置、退出登录和名片按钮，显示为淡灰色不可点击状态",
                "- 名片按钮位置调整：将名片按钮移动到更多操作弹窗的进入账户设置按钮右侧",
                "- 账户设置返回按钮：账户设置页面左下角新增返回按钮，点击返回上一级页面",
                "- 开发者模式菜单优化：开发者模式下新增\"开发测试\"类别，将测试页面按钮移至侧边栏",
                "- 解绑验证码优化：解绑功能验证码改为使用图片验证码API，与登录页保持一致",
                "- dummyimage版权声明：关于启动器弹窗新增dummyimage按钮，显示完整版权声明",
                "- 外部链接安全提示：点击外部链接时弹出安全确认弹窗，显示跳转地址",
                "- 登录页翻译优化：登录页所有文本现已支持中文、英文、日语、韩语四种语言切换",
                "- 新增翻译键：在 lang.js 中新增22个翻译键，覆盖提示模态框、PIN验证、安全验证、主题更新、更多操作/功能弹窗等",
                "- 模态框翻译支持：完善所有登录页模态框的翻译支持，包括提示、确认、倒计时等文本",
                "- 版本历史翻译：版本更新记录侧边栏和小游戏名称等文本也已支持多语言",
            ]
        },
        {
            version: "RC 2.6.2.1 (b4)",
            date: "2026-05-15",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2621.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2621_2.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2621_3.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2621_4.png"],
            features: [
                "新增功能",
                "- 更多操作弹窗：个人卡片中的退出登录按钮改为\"更多操作\"按钮，点击后弹出包含账户设置和退出登录的窗口",
                "- 更多功能弹窗：点击展开更多功能按钮改为弹出窗口形式，包含关于启动器、名片、隐藏UI、调整UI比例四个功能",
                "- UI比例调整弹窗：重新设计UI比例调整功能，使用滑动条进行调整",
                "- 全部展开按钮：在版本更新记录中新增\"全部展开\"按钮，点击后可展开所有更新记录",
                "优化改进",
                "- 弹窗按钮布局：统一弹窗按钮样式为2x2或3xN网格布局，图标在上文字在下",
                "- 个人卡片优化：个人卡片及其悬浮卡改为不可点击，仅显示用户信息",
                "- 悬浮气泡位置：调整更多操作按钮和展开更多功能按钮的悬浮气泡从左侧显示",
                "- 按钮样式统一：更多操作弹窗和更多功能弹窗使用相同的按钮样式",
                "修复问题",
                "- 修复调整UI比例按钮点击后没有反应的问题",
            ]
        },
        {
            version: "RC 2.6.2.0 (b4)",
            date: "2026-05-13",
            tag: "major",
            tagText: "重大更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2620.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2620_1.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2620_2.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2620_3.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2620_4.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2620_5.png"],
            features: [
                "新增功能",
                "- 启用登录PIN验证功能：在账户设置页安全设置中新增该选项，启用后登录时输入密码还需进行两步验证",
                "- 安全验证功能：点击用户卡片或用户信息卡片跳转账户设置时，需先通过安全验证",
                "- 今日不再验证：安全验证和PIN验证弹窗新增该选项，勾选后当日不再弹出验证窗口",
                "- PIN验证弹窗：登录时启用PIN验证功能后，密码验证通过后弹出PIN验证弹窗",
                "- 快速登录模式：启用\"快速登录\"功能后，下次登录仅显示用户名和登录按钮，点击即可直接进入游戏大厅",
                "- 快速登录标签：快速登录模式下在用户名输入框右侧显示绿色\"快速登录模式\"标签",
                "- 功能说明弹窗：勾选\"快速登录\"或\"自动登录\"时弹出功能说明窗口，提示用户功能用途和安全注意事项",
                "优化改进",
                "- 安全验证弹窗：新增详细提示信息和图标，优化界面设计",
                "- 提示框优先级：修复提示框被其他弹窗遮挡的问题",
                "- 注册页面优化：改为全屏样式，取消卡片显示，内容居中，返回按钮固定在底部",
                "- 快速登录按钮样式：快速登录模式下按钮显示为正常粉色渐变，而非灰色",
                "- 用户名修改检测：修改用户名时自动退出快速登录模式并重新显示验证码",
                "修复问题",
                "- 修复登录PIN验证通过后错误跳转到账户设置页面的问题",
                "- 修复点击用户卡片后直接跳转而非弹出验证弹窗的问题",
                "- 修复快速登录模式下取消按钮样式不正确的问题",
            ]
        },
        {
            version: "RC 2.6.1.4 (b4)",
            date: "2026-05-11",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2614.png"],
            features: [
                "新增功能",
                "- 小游戏更新记录：登录页版本更新记录窗口的LIST栏添加\"小游戏更新记录\"按钮，点击后显示所有小游戏的子选项",
                "优化改进",
                "- 子按钮交互优化：修复点击其他按钮后小游戏按钮不会自动收回的问题",
            ]
        },
        {
            version: "RC 2.6.1.3 (b4)",
            date: "2026-05-08",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2613.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2613_2.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2613_3.png"],
            features: [
                "新增功能",
                "- 离线模式：登录页侧边栏新增离线模式功能，支持在无网络环境下使用启动器",
                "- 离线模式标签：登录页和账户设置页左上角显示离线模式状态标签",
                "- 网络状态检测：自动检测网络连接状态变化，智能提示用户切换模式",
                "优化改进",
                "- 离线模式限制：离线模式下自动禁用账户信息修改、安全设置、成就系统、设备管理、数据管理等重要功能",
                "- 验证码优化：离线模式下自动切换为本地生成验证码，正常模式下通过API获取",
                "- 用户体验：网络恢复时自动提示用户是否重新上线",
            ]
        },
        {
            version: "RC 2.6.1.2 (b4)",
            date: "2026-05-07",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "新增功能",
                "- 登录页无网络提示：在登录页新增提示功能，无网络情况下将显示\"无网络连接，请检查网络设置\"",
                "- 主题更新自动刷新：在账户设置页面切换主题后，游戏大厅页面会弹出主题更新窗口，三秒后自动刷新页面以应用新主题",
                "优化改进",
                "- 界面体验：主题更新弹窗倒计时按钮调整为居中显示",
                "- 界面体验：优化主题更新检测机制，确保弹窗正确显示",
            ]
        },
        {
            version: "RC 2.6.1.1 (b4)",
            date: "2026-05-03",
            tag: "normal",
            tagText: "常规更新",
            images: [],
            features: [
                "修复问题",
                "- 用户协议优化：修复在用户协议窗口内点击右侧导航栏后，再查看隐私政策内容不显示的问题",
            ]
        },
        {
            version: "RC 2.6.1.0 (b4)",
            date: "2026-04-30",
            tag: "major",
            tagText: "重大更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2610.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2610_2.png"],
            features: [
                "新增功能",
                "- 开发者公告：登录页侧边栏新增\"开发者公告\"按钮，可查看最新公告",
                "优化改进",
                "- 界面优化：优化了关于启动器窗口和MIT License窗口的滚动条样式",
                "- 界面优化：公告和版本记录内容全部改为左对齐，阅读更舒适",
                "- 界面优化：登录页侧边栏优化排版布局",
            ]
        },
        {
            version: "RC 2.6.0.12 (b4)",
            date: "2026-04-30",
            tag: "normal",
            tagText: "常规更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/26012.png"],
            features: [
                "新增功能",
                "- 预设背景：主题设置新增\"预设背景\"功能，提供9款精美预设背景图可选",
                "- 预览效果：选中预设背景后可预览查看效果",
                "优化改进",
                "- 预设背景窗口支持亮色/暗色模式自适应切换",
                "- 优化图片显示尺寸，提升视觉效果",
                "修复问题",
                "- 修复预设背景刷新页面后无法保存的问题"
            ]
        },
        {
            version: "RC 2.6.0.11 (b4)",
            date: "2026-04-29",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/26011.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/26011_2.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/26011_3.png"],
            features: [
                "新增功能",
                "- 忘记密码功能优化：新增使用PIN码重置密码的功能",
                "优化改进",
                "- 登录页优化：优化登录卡片的布局和交互，提升用户体验",
                "- 统一并重置账户设置页面样式：将账户信息、安全设置、隐私设置、通知设置、设备管理、主题设置等页面的条目统一改为卡片式布局，左侧显示文本说明，右侧放置按钮或控件",
                "- 暗色模式优化：提升暗色模式下所有设置页面和卡片的字体亮度，确保文字清晰可读",
                "- 统一按钮样式：所有设置页面的按钮采用一致的设计风格",
                "- 输入框样式标准化：各类文本输入框统一宽度和对齐方式",
                "- 卡片悬停效果：添加鼠标悬停时的视觉反馈，提升交互体验",
                "修复问题",
                "- 用户协议改进：修复用户协议目录侧边栏无法滚动的问题，增加最大高度限制",
                "- 编辑头像窗口：优化头像编辑窗口为全屏显示，修复裁剪预设比例按钮不生效的问题",
                "- 两步验证功能：修复了两步验证功能在退出登录后自动关闭的问题",
                "- 头像悬浮卡片：修复了鼠标悬浮在头像上时，悬浮卡片显示不完整的问题",
            ]
        },
        {
            version: "RC 2.6.0.10 (b4)",
            date: "2026-04-28",
            tag: "important",
            tagText: "重要更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/26010.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/26010_2.png"],
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
            tag: "normal",
            tagText: "常规更新",
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
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2607.png"],
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
            tag: "patch",
            tagText: "补丁更新",
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2606.png"],
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
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2603.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2603_2.png"],
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
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2600.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2600_2.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2600_3.png"],
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
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2540.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2540_2.png"],
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
            tag: "patch",
            tagText: "补丁更新",
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
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2530.png"],
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
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2520.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2520_2.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2520_3.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2520_4.png"],
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
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2510.png"],
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
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2501.png"],
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
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2400.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2400_1.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2400_2.png"],
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
            images: ["https://github.com/Almax202/PRE_Launcher/raw/master/images/2300.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2300_2.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2300_3.png", 
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2300_4.png"],
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
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2210.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2210_2.png",
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
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2120.png",
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/2120_2.png",
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
                "https://github.com/Almax202/PRE_Launcher/raw/master/images/list.png"
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
        },
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
            version: "RC 1.1.0.2 (a2)",
            date: "2026-07-19",
            tag: "normal",
            tagText: "常规更新",
            images: ["./images/h1102.png"],
            features: [
                "优化改进",
                "- 默认背景同步更新：游戏大厅页背景样式与登录页、系统设置页保持一致，采用多层径向渐变和线性渐变组合",
                "- 默认背景显示逻辑优化：未选择自定义背景时自动显示用户选择的默认渐变，支持9种渐变背景选项",
                "- 退回至登录页功能：更多操作弹窗中新增\"退回至登录页\"按钮，保留登录状态直接跳转至登录页",
                "- 自动登录跳过机制：退回登录页时设置skipAutoLogin标志，避免自动登录导致的循环跳转",
                "- 更多操作按钮布局优化：按钮改为3列布局，移动端自动切换为垂直排列"
            ]
        },
        {
            version: "RC 1.1.0.1 (a2)",
            date: "2026-07-03",
            tag: "normal",
            tagText: "常规更新",
            images: ["./images/h1101.png"],
            features: [
                "新增功能",
                "- 游戏大厅更多操作按钮：个人卡片中的退出登录按钮改为\"更多操作\"按钮，点击弹出包含系统设置和退出登录选项的弹窗",
                "优化改进",
                "- 游戏大厅弹窗样式统一：将游戏大厅中的默认弹窗样式改为与登录页一致，包括标题居左、按钮右对齐、粉色渐变主按钮等设计元素",
                "- 用户信息卡片优化：删除用户信息卡片中的\"点击进入系统设置\"文本，点击卡片不再跳转到系统设置页",
            ]
        },
        {
            version: "RC 1.1.0.0 (a2)",
            date: "2026-05-30",
            tag: "important",
            tagText: "重要更新",
            images: ["./images/h1100.png"],
            features: [
                "新增功能",
                "- 侧边栏收起功能：在游戏大厅页面侧边栏添加与登录页一致的收起/展开按钮，支持状态记忆",
                "- 侧边栏收起小卡片：侧边栏收起时底部显示个人卡片，包含用户头像和退出按钮",
                "优化改进",
                "- 侧边栏收起后图标放大：收起侧边栏时菜单项图标放大显示，提升视觉效果",
                "- 弹窗样式统一：游戏大厅弹窗样式与登录页保持一致，包括深色遮罩、顶部粉色渐变条和粉色渐变按钮",
                "修复问题",
                "- 修复侧边栏收起时个人卡片图标和按钮显示在方框外的问题"
            ]
        },
        {
            version: "RC 1.0.3.3 (a2)",
            date: "2026-05-11",
            tag: "normal",
            tagText: "常规更新",
            images: ["./images/h1033_2.png"],
            features: [
                "优化改进",
                "- 飞行器游戏样式重构：将飞行器小游戏页面样式重构为与点击方块小游戏相同的设计风格，包括左侧边栏导航和右侧主内容区布局",
                "- 版本号统一管理：在 versionManager.js 中添加记忆卡牌和颜色匹配小游戏的版本号，实现所有小游戏版本号统一管理",
                "- 版本号调用优化：修复贪吃蛇和飞行器小游戏版本号未正确调用版本管理文件的问题",
                "- 页面布局优化：修复飞行器游戏页面顶部导航栏和右侧显示区域样式不正确的问题"
            ]
        },
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
        },
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
    ],
    miniGameSnakeContent: [
        {
            version: "RC 1.0.1",
            date: "2026-05-11",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "调整 更新公告统一存放至个人中心页面的“版本更新”选项卡，方便玩家查看和管理更新",
            ]
        },
        {
            version: "RC 1.0.0",
            date: "2026-04-02",
            tag: "major",
            tagText: "重大更新",
            features: [
                "新增 贪吃蛇游戏",
                "新增 WASD键和鼠标控制",
                "新增 成就系统",
                "优化 界面风格统一"
            ]
        }
    ],
    miniGameColormatchContent: [
        {
            version: "RC 1.0.1",
            date: "2026-05-11",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "调整 更新公告统一存放至个人中心页面的“版本更新”选项卡，方便玩家查看和管理更新",
            ]
        },
        {
            version: "RC 1.0.0",
            date: "2026-04-16",
            tag: "major",
            tagText: "重大更新",
            features: [
                "新增 颜色匹配游戏",
                "新增 游戏成就系统",
                "新增 游戏排行榜功能"
            ]
        }
    ],
    miniGameMemoryContent: [
        {
            version: "RC 1.1.1",
            date: "2026-05-11",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "调整 更新公告统一存放至个人中心页面的“版本更新”选项卡，方便玩家查看和管理更新",
            ]
        },
        {
            version: "RC 1.1.0",
            date: "2026-04-18",
            tag: "important",
            tagText: "重要更新",
            features: [
                "新增功能",
                "- 新增成就：记忆卡牌专家（累计完成20局游戏）",
                "- 新增成就：记忆大师（单局得分达到300分）",
                "优化改进",
                "- 修复成就数据互通问题"
            ]
        },
        {
            version: "RC 1.0.0",
            date: "2026-04-07",
            tag: "major",
            tagText: "重大更新",
            features: [
                "上线 记忆卡牌小游戏（BETA）",
                "新增 卡牌翻转匹配玩法"
            ]
        }
    ],
    miniGameWzqContent: [
        {
            version: "RC 1.2.1",
            date: "2026-05-11",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "调整 更新公告统一存放至个人中心页面的“版本更新”选项卡，方便玩家查看和管理更新",
            ]
        },
        {
            version: "RC 1.2.0",
            date: "2026-03-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 界面风格统一",
                "新增 个人中心页面快捷跳转",
            ]
        },
        {
            version: "RC 1.1.0",
            date: "2026-03-24",
            tag: "important",
            tagText: "重要更新",
            features: [
                "新增 成就系统",
            ]
        },
        {
            version: "RC 1.0.2",
            date: "2026-02-28",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "删除 更多游戏按钮",
            ]
        },
        {
            version: "RC 1.0.1",
            date: "2026-02-27",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 查看版本公告时固定窗口大小使其不会来回变动",
            ]
        },
        {
            version: "RC 1.0.0",
            date: "2026-02-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "新增 人机对战功能",
			        "新增 时间无限制功能",
			        "优化 顶部状态栏样式统一",
                    "修复 游戏结束后卡死问题",
                    "增强 AI对战强度"
            ]
        },
        {
            version: "Beta v0.2.0",
            date: "2026-02-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 棋盘比例调整",
            ]
        },
        {
            version: "Beta v0.1.0",
            date: "2026-02-26",
            tag: "major",
            tagText: "重大更新",
            features: [
                "通告 游戏上线",
            ]
        }
    ],
    miniGameFxqContent: [
        
        {
            version: "RC 1.2.2",
            date: "2026-05-11",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化改进",
                "- 飞行器游戏样式重构：将飞行器小游戏页面样式重构为与点击方块小游戏相同的设计风格，包括左侧边栏导航和右侧主内容区布局",
            ]
        },
        {
            version: "RC 1.2.1",
            date: "2026-05-11",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "调整 更新公告统一存放至个人中心页面的“版本更新”选项卡，方便玩家查看和管理更新",
            ]
        },
        {
            version: "RC 1.2.0",
            date: "2026-03-24",
            tag: "important",
            tagText: "重要更新",
            features: [
                "新增 成就系统",
            ]
        },
        {
            version: "RC 1.1.0",
            date: "2026-02-27",
            tag: "important",
            tagText: "重要更新",
            features: [
                "新增 梦魇难度",
			        "优化 顶部状态栏样式统一",
			        "修复 上个版本并未正确修复的游戏结束后卡死问题",
			        "增强 障碍物生成逻辑",
					"增强 AI难度逻辑",
					"删除 更多游戏按钮"
            ]
        },
        {
            version: "RC 1.0.0",
            date: "2026-02-27",
            tag: "major",
            tagText: "重大更新",
            features: [
                "通告 飞行器小游戏上线",
                    "新增 自动飞行功能",
                    "新增 时间无限制功能",
                    "优化 顶部状态栏样式统一",
                    "修复 游戏结束后卡死问题",
                    "增强 障碍物生成逻辑"
            ]
        }
    ],
    miniGameFkgameContent: [
        {
            version: "RC 1.3.1",
            date: "2026-05-11",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "调整 更新公告统一存放至个人中心页面的“版本更新”选项卡，方便玩家查看和管理更新",
            ]
        },
        {
            version: "RC 1.3.0",
            date: "2026-03-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 界面风格统一",
                "新增 重置排行榜功能",
                "新增 个人中心页面快捷跳转"
            ]
        },
        {
            version: "RC 1.2.0",
            date: "2026-03-24",
            tag: "major",
            tagText: "重大更新",
            features: [
                "新增 游戏成就系统",
            ]
        },
        {
            version: "RC 1.1.2",
            date: "2026-02-28",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "删除 更多游戏按钮",
            ]
        },
        {
            version: "RC 1.1.1",
            date: "2026-02-27",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 查看版本公告时固定窗口大小使其不会来回变动",
            ]
        },
        {
            version: "RC 1.1.0",
            date: "2026-02-26",
            tag: "important",
            tagText: "重要更新",
            features: [
                "新增 英文语言",
                "新增 中英文语言切换按钮",
                "新增 版本更新公告重要更新提示",
                "新增 游戏排行榜功能",
                "通告：目前正在进行多语种适配，预计将在不久之后的版本实装更多语言（例如日语和韩语），请持续关注GBG工作室。",
            ]
        },
        {
            version: "RC 1.0.1.2",
            date: "2026-02-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "新增 版本更新公告切换正式版(RC)/测试版(Beta)按钮",
            ]
        },
        {
            version: "RC 1.0.1.1",
            date: "2026-02-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 点击版本更新公告时，窗口的淡入，淡出效果",
            ]
        },
        {
            version: "RC 1.0.1",
            date: "2026-02-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "修复 返回首页按钮未正确生效的问题",
            ]
        },
        {
            version: "RC 1.0.0",
            date: "2026-02-26",
            tag: "major",
            tagText: "重大更新",
            features: [
                "通告 游戏正式上线，版本自动更替已从Beta转至RC",
            ]
        },
        {
            version: "Beta v0.1.4",
            date: "2026-02-26",
            tag: "major",
            tagText: "重大更新",
            features: [
                "修复 由版本更新公告导致全局卡死，无法正常进行游戏的问题",
                "修复 更改难度时背景颜色并未正确生效的问题"
            ]
        },
        {
            version: "Beta v0.1.3.1",
            date: "2026-02-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 公告排版及其显示逻辑",
            ]
        },
        {
            version: "Beta v0.1.3",
            date: "2026-02-26",
            tag: "important",
            tagText: "重要更新",
            features: [
                "新增 版本更新公告功能",
                "新增 游戏排行榜功能",
                "新增 游戏成就系统（部分）"
            ]
        },
        {
            version: "Beta v0.1.2",
            date: "2026-02-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "优化 游戏界面布局",
                "优化 游戏难度设置"
            ]
        },
        {
            version: "Beta v0.1.1",
            date: "2026-02-26",
            tag: "normal",
            tagText: "常规更新",
            features: [
                "修复 游戏计时器问题",
                "优化 游戏响应速度"
            ]
        },
        {
            version: "Beta v0.1.0",
            date: "2026-02-26",
            tag: "major",
            tagText: "重大更新",
            features: [
                "游戏首次发布Beta版本",
                "基础游戏功能实现"
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
                
                // 检查版本是否已查看
                var versionId = generateVersionId(versionItem);
                var isVersionViewedFlag = isVersionViewed(versionId);
                
                // 构建版本项HTML
                var versionHTML = `
                    <div class="version-header">
                        <div class="version-header-left">
                            <div class="version-title-row">
                                <span class="version-number">${versionItem.version}</span>
                                ${versionItem.tag ? `<span class="version-tag ${versionItem.tag}">${versionItem.tagText}</span>` : ''}
                                ${!isVersionViewedFlag ? '<span class="new-update-tag">新更新</span>' : ''}
                            </div>
                            <span class="version-date">${versionItem.date}</span>
                        </div>
                        <button class="view-log-btn" onclick="toggleVersionDetails(this, '${versionId}')"><i class="fas fa-file-lines"></i> 查看日志 <i class="fas fa-chevron-down"></i></button>
                    </div>
                    <div class="version-details" style="display: none;">
                `
                
                // 添加版本图片（如果有）
                if (versionItem.images && versionItem.images.length > 0) {
                    var isSingleImage = versionItem.images.length === 1;
                    versionHTML += `
                        <div class="version-images-container">
                            <div class="version-scroll-btn left" onclick="scrollVersionImages(this, -1)">
                                <i class="fa-solid fa-chevron-left"></i>
                            </div>
                            <div class="version-images ${isSingleImage ? 'single-image' : ''}">
                    `;
                    versionItem.images.forEach(function(image) {
                        var imageUrl = getVersionImageUrl(image);
                        versionHTML += `
                            <div class="image-container ${isSingleImage ? 'single-image-container' : ''}">
                                <img src="${imageUrl}" alt="版本更新图片" class="version-image ${isSingleImage ? 'single-image-item' : ''}" draggable="false">
                                <div class="image-tooltip">查看图片</div>
                            </div>
                        `;
                    });
                    versionHTML += `
                            </div>
                            <div class="version-scroll-btn right" onclick="scrollVersionImages(this, 1)">
                                <i class="fa-solid fa-chevron-right"></i>
                            </div>
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
            initVersionScrollButtons();
        }
    });
    
    // 为选择功能更新按钮添加点击事件
    var featureUpdateNav = document.getElementById('featureUpdateNav');
    if (featureUpdateNav) {
        featureUpdateNav.addEventListener('click', function(e) {
            e.stopPropagation();
            
            var allViewingTags = document.querySelectorAll('.viewing-tag');
            allViewingTags.forEach(function(tag) {
                tag.style.display = 'none';
            });
            
            var outdatedSubButtons = document.getElementById('outdatedSubButtons');
            if (outdatedSubButtons) {
                outdatedSubButtons.style.display = 'none';
            }
            var miniGameSubButtons = document.getElementById('miniGameSubButtons');
            if (miniGameSubButtons) {
                miniGameSubButtons.style.display = 'none';
            }
            
            var navItems = document.querySelectorAll('#versionHistoryModal .terms-nav-item');
            navItems.forEach(function(navItem) {
                navItem.classList.remove('active');
            });
            this.classList.add('active');
            
            // 直接触发启动器更新子按钮的点击逻辑
            var launcherBtn = document.querySelector('#featureSubButtons .sub-button[data-type="launcher"]');
            if (launcherBtn) {
                launcherBtn.click();
            }
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
            
            // 隐藏选择功能更新和小游戏的子按钮
            var featureSubButtons = document.getElementById('featureSubButtons');
            if (featureSubButtons) {
                featureSubButtons.style.display = 'none';
            }
            var miniGameSubButtons = document.getElementById('miniGameSubButtons');
            if (miniGameSubButtons) {
                miniGameSubButtons.style.display = 'none';
            }
            
            // 显示提示文本
            var contentArea = document.querySelector('.terms-content');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
                        <div style="font-size: 48px; margin-bottom: 20px; color: #999;">
                            <i class="fas fa-inbox"></i>
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
    
    // 为小游戏更新记录按钮添加点击事件
    var miniGameUpdateNav = document.getElementById('miniGameUpdateNav');
    if (miniGameUpdateNav) {
        miniGameUpdateNav.addEventListener('click', function(e) {
            // 阻止事件冒泡，避免触发导航初始化中的点击事件
            e.stopPropagation();
            
            // 显示子按钮
            var subButtons = document.getElementById('miniGameSubButtons');
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
            
            // 隐藏其他子按钮
            var featureSubButtons = document.getElementById('featureSubButtons');
            if (featureSubButtons) {
                featureSubButtons.style.display = 'none';
            }
            
            var outdatedSubButtons = document.getElementById('outdatedSubButtons');
            if (outdatedSubButtons) {
                outdatedSubButtons.style.display = 'none';
            }
            
            // 显示提示文本
            var contentArea = document.querySelector('.terms-content');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
                        <div style="font-size: 48px; margin-bottom: 20px; color: #999;">
                            <i class="fas fa-inbox"></i>
                        </div>
                        <p class="select-hint" style="font-style: normal; color: black; text-align: center; padding: 0; margin: 0;">请选择要查看的小游戏更新记录</p>
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
            // 提取主版本号和次版本号
            var versionMatch = versionItem.version.match(/RC\s+(\d+)\.(\d+)\.\d+\.\d+/);
            var majorVersion;
            var isRC = versionItem.version.includes('RC');
            var isMiniGame = versionItem.version.startsWith('V ');
            
            if (versionMatch) {
                // RC 格式: "RC 2.6.0.1 (b3)" -> "2.6"
                majorVersion = versionMatch[1] + '.' + versionMatch[2];
            } else if (isMiniGame) {
                // 小游戏格式: "V 1.1.0" -> "1.1"
                versionMatch = versionItem.version.match(/V\s+(\d+)\.(\d+)/);
                majorVersion = versionMatch ? versionMatch[1] + '.' + versionMatch[2] : '其他版本';
            } else {
                // 处理其他格式的版本号
                versionMatch = versionItem.version.match(/(\d+)\.(\d+)/);
                majorVersion = versionMatch ? versionMatch[1] + '.' + versionMatch[2] : '其他版本';
            }
            
            if (!grouped[majorVersion]) {
                grouped[majorVersion] = { versions: [], isRC: isRC, isMiniGame: isMiniGame };
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
                isRC: grouped[key].isRC,
                isMiniGame: grouped[key].isMiniGame
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
                } else if (parentId === 'miniGameSubButtons') {
                    // 小游戏更新记录按钮
                    var miniGameDataMap = {
                        'snake': versionHistoryData.miniGameSnakeContent,
                        'colormatch': versionHistoryData.miniGameColormatchContent,
                        'memory': versionHistoryData.miniGameMemoryContent,
                        'wzq': versionHistoryData.miniGameWzqContent,
                        'fxq': versionHistoryData.miniGameFxqContent,
                        'fkgame': versionHistoryData.miniGameFkgameContent
                    };
                    data = miniGameDataMap[type] || [];
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
                    
                    // 按维护状态分组版本
                    var maintainingVersions = [];
                    var endedVersions = [];
                    var outdatedVersions = [];
                    
                    var isOutdatedPage = parentId === 'outdatedSubButtons';
                    var latestVersion = groupedVersions[0]?.majorVersion;
                    
                    groupedVersions.forEach(function(group) {
                        if (isOutdatedPage) {
                            outdatedVersions.push(group);
                        } else {
                            if (group.majorVersion === latestVersion) {
                                maintainingVersions.push(group);
                            } else {
                                endedVersions.push(group);
                            }
                        }
                    });
                    
                    // 创建版本按钮网格容器
                    var versionsContainer = document.createElement('div');
                    versionsContainer.style.cssText = `
                        padding: 0 20px;
                        display: flex;
                        flex-direction: column;
                        gap: 24px;
                    `;
                    contentArea.appendChild(versionsContainer);
                    
                    // 创建分组函数
                    function createVersionGroup(title, icon, color, versions) {
                        if (versions.length === 0) return;
                        
                        // 创建分组标题
                        var groupHeader = document.createElement('div');
                        groupHeader.style.cssText = `
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            margin-bottom: 16px;
                            padding: 12px 20px;
                            background: linear-gradient(135deg, ${color}15 0%, ${color}08 100%);
                            border-radius: 10px;
                            border-left: 4px solid ${color};
                        `;
                        
                        groupHeader.innerHTML = `
                            <span style="font-size: 20px;">${icon}</span>
                            <span style="font-size: 16px; font-weight: bold; color: ${color}; margin: 0;">${title}</span>
                            <span style="font-size: 14px; color: #888; margin-left: auto;">共 ${versions.length} 个版本</span>
                        `;
                        
                        // 创建网格容器
                        var gridContainer = document.createElement('div');
                        gridContainer.style.cssText = `
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 16px;
                            margin-bottom: 8px;
                        `;
                        
                        // 创建版本按钮
                        versions.forEach(function(group) {
                            var groupButton = document.createElement('button');
                            groupButton.className = 'version-group-button';
                            
                            var isDarkMode = document.body.classList.contains('dark-mode');
                            var bgColor = isDarkMode ? 'rgba(50, 50, 70, 0.95)' : 'white';
                            var borderColor = isDarkMode ? 'rgba(212, 93, 121, 0.4)' : 'rgba(212, 93, 121, 0.3)';
                            var shadowColor = isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.06)';
                            var textColor1 = isDarkMode ? '#e0e0e0' : '#444';
                            var textColor2 = isDarkMode ? '#ccc' : '#666';
                            
                            groupButton.style.cssText = `
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
                                min-height: 90px;
                                box-shadow: 0 2px 10px ${shadowColor};
                            `;
                            
                            // 添加鼠标悬浮效果
                            groupButton.addEventListener('mouseenter', function() {
                                this.style.transform = 'translateY(-3px)';
                                this.style.boxShadow = '0 8px 20px rgba(212, 93, 121, 0.2)';
                                this.style.borderColor = '#d45d79';
                            });
                            
                            groupButton.addEventListener('mouseleave', function() {
                                this.style.transform = 'translateY(0)';
                                this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.06)';
                                this.style.borderColor = 'rgba(212, 93, 121, 0.3)';
                            });
                            
                            // 添加点击效果
                            groupButton.addEventListener('mousedown', function() {
                                this.style.transform = 'translateY(-1px) scale(0.99)';
                            });
                            
                            groupButton.addEventListener('mouseup', function() {
                                this.style.transform = 'translateY(-3px)';
                            });
                            
                            // 确定版本状态
                            var versionStatus = '';
                            var statusColor = '';
                            
                            if (isOutdatedPage) {
                                versionStatus = '已过时';
                                statusColor = '#999';
                            } else if (group.majorVersion === latestVersion) {
                                versionStatus = '维护中';
                                statusColor = '#4CAF50';
                            } else {
                                versionStatus = '已结束';
                                statusColor = '#f44336';
                            }
                            
                            // 计算该主版本下未查看的子版本数量
                            var unviewedCount = group.versions.filter(function(subVersion) {
                                var subVersionId = generateVersionId(subVersion);
                                return !isVersionViewed(subVersionId);
                            }).length;
                            
                            // 设置按钮内容
                            groupButton.innerHTML = `
                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                    <span style="font-size: 18px; font-weight: bold; color: #e67e8a;">${group.isRC ? 'RC' : (group.isMiniGame ? 'V' : '版本')} ${group.majorVersion}</span>
                                    <span style="padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; background-color: ${statusColor}; color: white;">${versionStatus}</span>
                                </div>
                                <div style="font-size: 14px; color: ${textColor1};">共 ${group.versions.length} 个版本</div>
                                <div style="font-size: 13px; color: ${textColor2};">${group.startDate} ~ ${group.endDate}</div>
                                ${unviewedCount > 0 ? `<span class="notification-dot">${unviewedCount}<span class="notification-tooltip">存在未查看的更新，数量${unviewedCount}个</span></span>` : ''}
                            `;
                            
                            // 添加点击事件，标记版本为已查看
                            groupButton.addEventListener('click', function() {
                                // 标记所有子版本为已查看
                                group.versions.forEach(function(subVersion) {
                                    var subVersionId = generateVersionId(subVersion);
                                    markVersionAsViewed(subVersionId);
                                });
                            }, true);
                            
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
                                        
                                        // 如果RC格式不匹配，尝试小游戏格式 "V 1.1.0"
                                        if (!aMatch) {
                                            aMatch = a.version.match(/V\s+(\d+)\.(\d+)(?:\.(\d+))?/);
                                        }
                                        if (!bMatch) {
                                            bMatch = b.version.match(/V\s+(\d+)\.(\d+)(?:\.(\d+))?/);
                                        }
                                        
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
                                        
                                        // 检查版本是否已查看
                                        var versionId = generateVersionId(versionItem);
                                        var isVersionViewedFlag = isVersionViewed(versionId);
                                        
                                        // 构建版本项HTML
                                        var versionHTML = `
                                            <div class="version-header">
                                                <div class="version-header-left">
                                                    <div class="version-title-row">
                                                        <span class="version-number">${versionItem.version}</span>
                                                        ${versionItem.tag ? `<span class="version-tag ${versionItem.tag}">${versionItem.tagText}</span>` : ''}
                                                        ${!isVersionViewedFlag ? '<span class="new-update-tag">新更新</span>' : ''}
                                                    </div>
                                                    <span class="version-date">${versionItem.date}</span>
                                                </div>
                                                <button class="view-log-btn" onclick="toggleVersionDetails(this, '${versionId}')"><i class="fas fa-file-lines"></i> 查看日志 <i class="fas fa-chevron-down"></i></button>
                                            </div>
                                            <div class="version-details" style="display: none;">
                                        `;
                                        
                                        // 添加版本图片（如果有）
                                        if (versionItem.images && versionItem.images.length > 0) {
                                            var isSingleImage = versionItem.images.length === 1;
                                            versionHTML += `
                                                <div class="version-images-container">
                                                    <div class="version-scroll-btn left" onclick="scrollVersionImages(this, -1)">
                                                        <i class="fa-solid fa-chevron-left"></i>
                                                    </div>
                                                    <div class="version-images ${isSingleImage ? 'single-image' : ''}">
                                            `;
                                            versionItem.images.forEach(function(image) {
                                                var imageUrl = getVersionImageUrl(image);
                                                versionHTML += `
                                                    <div class="image-container ${isSingleImage ? 'single-image-container' : ''}">
                                                        <img src="${imageUrl}" alt="版本更新图片" class="version-image ${isSingleImage ? 'single-image-item' : ''}" draggable="false">
                                                        <div class="image-tooltip">查看图片</div>
                                                    </div>
                                                `;
                                            });
                                            versionHTML += `
                                                    </div>
                                                    <div class="version-scroll-btn right" onclick="scrollVersionImages(this, 1)">
                                                        <i class="fa-solid fa-chevron-right"></i>
                                                    </div>
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
                                    initVersionScrollButtons();
                                }
                                
                                // 排序按钮点击事件
                                sortButton.addEventListener('click', sortVersions);
                                
                                // 全部展开/收起按钮
                                var expandAllButton = document.createElement('button');
                                expandAllButton.className = 'expand-all-button';
                                expandAllButton.style.cssText = `
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
                                expandAllButton.addEventListener('mouseenter', function() {
                                    this.style.transform = 'translateY(-3px)';
                                    this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                                });
                                
                                expandAllButton.addEventListener('mouseleave', function() {
                                    this.style.transform = 'translateY(0)';
                                    this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                                });
                                
                                // 展开状态
                                var isAllExpanded = false;
                                expandAllButton.innerHTML = '<i class="fas fa-chevron-down"></i> 全部展开';
                                
                                // 全部展开/收起函数
                                function toggleAllVersions() {
                                    isAllExpanded = !isAllExpanded;
                                    
                                    if (isAllExpanded) {
                                        expandAllButton.innerHTML = '<i class="fas fa-chevron-up"></i> 全部收起';
                                        // 展开所有版本详情
                                        var allDetails = contentArea.querySelectorAll('.version-details');
                                        var allButtons = contentArea.querySelectorAll('.view-log-btn');
                                        allDetails.forEach(function(details) {
                                            details.style.display = 'block';
                                        });
                                        allButtons.forEach(function(btn) {
                                            btn.innerHTML = '<i class="fas fa-file-lines"></i> 收起日志 <i class="fas fa-chevron-up"></i>';
                                        });
                                    } else {
                                        expandAllButton.innerHTML = '<i class="fas fa-chevron-down"></i> 全部展开';
                                        // 收起所有版本详情
                                        var allDetails = contentArea.querySelectorAll('.version-details');
                                        var allButtons = contentArea.querySelectorAll('.view-log-btn');
                                        allDetails.forEach(function(details) {
                                            details.style.display = 'none';
                                        });
                                        allButtons.forEach(function(btn) {
                                            btn.innerHTML = '<i class="fas fa-file-lines"></i> 查看日志 <i class="fas fa-chevron-down"></i>';
                                        });
                                    }
                                }
                                
                                expandAllButton.addEventListener('click', toggleAllVersions);
                                
                                // 添加按钮到按钮容器
                                buttonContainer.appendChild(backButton);
                                buttonContainer.appendChild(sortButton);
                                buttonContainer.appendChild(expandAllButton);
                                
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
                                    
                                    // 如果RC格式不匹配，尝试小游戏格式 "V 1.1.0"
                                    if (!aMatch) {
                                        aMatch = a.version.match(/V\s+(\d+)\.(\d+)(?:\.(\d+))?/);
                                    }
                                    if (!bMatch) {
                                        bMatch = b.version.match(/V\s+(\d+)\.(\d+)(?:\.(\d+))?/);
                                    }
                                    
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
                                    
                                    // 检查版本是否已查看
                                    var versionId = generateVersionId(versionItem);
                                    var isVersionViewedFlag = isVersionViewed(versionId);
                                    
                                    // 构建版本项HTML
                                    var versionHTML = `
                                        <div class="version-header">
                                            <div class="version-header-left">
                                                <div class="version-title-row">
                                                    <span class="version-number">${versionItem.version}</span>
                                                    ${versionItem.tag ? `<span class="version-tag ${versionItem.tag}">${versionItem.tagText}</span>` : ''}
                                                    ${!isVersionViewedFlag ? '<span class="new-update-tag">新更新</span>' : ''}
                                                </div>
                                                <span class="version-date">${versionItem.date}</span>
                                            </div>
                                            <button class="view-log-btn" onclick="toggleVersionDetails(this, '${versionId}')"><i class="fas fa-file-lines"></i> 查看日志 <i class="fas fa-chevron-down"></i></button>
                                        </div>
                                        <div class="version-details" style="display: none;">
                                    `;
                                    
                                    // 添加版本图片（如果有）
                                    if (versionItem.images && versionItem.images.length > 0) {
                                        var isSingleImage = versionItem.images.length === 1;
                                        versionHTML += `
                                            <div class="version-images-container">
                                                <div class="version-scroll-btn left" onclick="scrollVersionImages(this, -1)">
                                                    <i class="fa-solid fa-chevron-left"></i>
                                                </div>
                                                <div class="version-images ${isSingleImage ? 'single-image' : ''}">
                                        `;
                                        versionItem.images.forEach(function(image) {
                                            var imageUrl = getVersionImageUrl(image);
                                            versionHTML += `
                                                <div class="image-container ${isSingleImage ? 'single-image-container' : ''}">
                                                    <img src="${imageUrl}" alt="版本更新图片" class="version-image ${isSingleImage ? 'single-image-item' : ''}" draggable="false">
                                                    <div class="image-tooltip">查看图片</div>
                                                </div>
                                            `;
                                        });
                                        versionHTML += `
                                                </div>
                                                <div class="version-scroll-btn right" onclick="scrollVersionImages(this, 1)">
                                                    <i class="fa-solid fa-chevron-right"></i>
                                                </div>
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
                                initVersionScrollButtons();
                            });
                            
                            gridContainer.appendChild(groupButton);
                        });
                        
                        // 添加分组到容器
                        versionsContainer.appendChild(groupHeader);
                        versionsContainer.appendChild(gridContainer);
                    }
                    
                    // 创建各个分组
                    if (!isOutdatedPage) {
                        createVersionGroup('正在维护中的版本', '🔧', '#4CAF50', maintainingVersions);
                        createVersionGroup('已结束维护的版本', '📦', '#f44336', endedVersions);
                    } else {
                        createVersionGroup('已过时的版本记录', '📋', '#999', outdatedVersions);
                    }
                }
                
                // 初始显示版本选择界面
                showVersionSelection();
            }
        });
    });
}

// 切换版本详情展开/收起
function toggleVersionDetails(button, versionId) {
    const versionItem = button.closest('.version-item');
    const details = versionItem.querySelector('.version-details');
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        button.innerHTML = '<i class="fas fa-file-lines"></i> 收起日志 <i class="fas fa-chevron-up"></i>';
        
        // 标记版本为已查看
        if (versionId) {
            markVersionAsViewed(versionId);
            // 移除新更新标签
            const newUpdateTag = versionItem.querySelector('.new-update-tag');
            if (newUpdateTag) {
                newUpdateTag.remove();
            }
        }
    } else {
        details.style.display = 'none';
        button.innerHTML = '<i class="fas fa-file-lines"></i> 查看日志 <i class="fas fa-chevron-down"></i>';
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
        <div class="image-viewer-fullscreen">
            <div class="image-viewer-header">
                <div class="image-viewer-title">
                    <span>图片查看器</span>
                </div>
                <button class="image-viewer-close" id="closeImageViewer">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="image-viewer-main">
                <div class="image-viewer-container" id="imageViewerContainer">
                    <img id="viewerImage" src="" alt="查看图片" draggable="false">
                </div>
                <div class="image-viewer-controls">
                    <button class="viewer-control-btn" id="zoomInBtn">
                        <i class="fas fa-search-plus"></i>
                        <span class="viewer-btn-tooltip">放大</span>
                    </button>
                    <button class="viewer-control-btn" id="zoomOutBtn">
                        <i class="fas fa-search-minus"></i>
                        <span class="viewer-btn-tooltip">缩小</span>
                    </button>
                    <button class="viewer-control-btn" id="resetZoomBtn">
                        <i class="fas fa-sync-alt"></i>
                        <span class="viewer-btn-tooltip">重置</span>
                    </button>
                    <div class="viewer-control-divider"></div>
                    <button class="viewer-control-btn" id="rotateLeftBtn">
                        <i class="fas fa-rotate-left"></i>
                        <span class="viewer-btn-tooltip">向左旋转</span>
                    </button>
                    <button class="viewer-control-btn" id="rotateRightBtn">
                        <i class="fas fa-rotate-right"></i>
                        <span class="viewer-btn-tooltip">向右旋转</span>
                    </button>
                    <div class="viewer-control-divider"></div>
                    <button class="viewer-control-btn" id="flipHorizontalBtn">
                        <i class="fas fa-arrows-h"></i>
                        <span class="viewer-btn-tooltip">水平翻转</span>
                    </button>
                    <button class="viewer-control-btn" id="flipVerticalBtn">
                        <i class="fas fa-arrows-v"></i>
                        <span class="viewer-btn-tooltip">垂直翻转</span>
                    </button>
                    <div class="viewer-control-divider"></div>
                    <button class="viewer-control-btn" id="componentInfoBtn">
                        <i class="fas fa-info-circle"></i>
                        <span class="viewer-btn-tooltip">组件信息</span>
                    </button>
                </div>
            </div>
            <div class="image-viewer-footer">
                <span id="viewerZoomInfo">100%</span>
            </div>
        </div>
    `;
    document.body.appendChild(imageViewerModal);
    
    // 初始状态
    var currentZoom = 1;
    var currentX = 0;
    var currentY = 0;
    var currentRotation = 0;
    var flipHorizontal = false;
    var flipVertical = false;
    var isDragging = false;
    var startX = 0;
    var startY = 0;
    var viewerImage = document.getElementById('viewerImage');
    var imageContainer = document.getElementById('imageViewerContainer');
    
    // 设置图片样式
    viewerImage.style.position = 'relative';
    viewerImage.style.transformOrigin = 'center center';
    viewerImage.style.cursor = 'grab';
    
    // 关闭图片查看器
    document.getElementById('closeImageViewer').addEventListener('click', function() {
        imageViewerModal.classList.remove('show');
        setTimeout(function() {
            imageViewerModal.style.display = 'none';
            viewerImage.src = '';
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
    
    // 向左旋转
    document.getElementById('rotateLeftBtn').addEventListener('click', function() {
        currentRotation -= 90;
        updateImagePosition();
    });
    
    // 向右旋转
    document.getElementById('rotateRightBtn').addEventListener('click', function() {
        currentRotation += 90;
        updateImagePosition();
    });
    
    // 水平翻转
    document.getElementById('flipHorizontalBtn').addEventListener('click', function() {
        flipHorizontal = !flipHorizontal;
        updateImagePosition();
    });
    
    // 垂直翻转
    document.getElementById('flipVerticalBtn').addEventListener('click', function() {
        flipVertical = !flipVertical;
        updateImagePosition();
    });
    
    // 组件信息按钮
    document.getElementById('componentInfoBtn').addEventListener('click', function() {
        if (typeof showComponentInfoModal === 'function') {
            showComponentInfoModal('imageViewer');
        } else {
            showAlert('组件信息功能不可用');
        }
    });
    
    // 鼠标滚轮放大缩小
    imageContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomImage(delta);
    });
    
    var dragStartX = 0;
    var dragStartY = 0;
    var dragImageStartX = 0;
    var dragImageStartY = 0;
    var lastX = 0;
    var lastY = 0;
    var velocityX = 0;
    var velocityY = 0;
    var lastTime = 0;
    
    // 鼠标拖拽开始
    viewerImage.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragImageStartX = currentX;
        dragImageStartY = currentY;
        lastX = e.clientX;
        lastY = e.clientY;
        lastTime = Date.now();
        velocityX = 0;
        velocityY = 0;
        
        viewerImage.style.cursor = 'grabbing';
        viewerImage.style.transition = 'none';
    });
    
    // 鼠标拖拽移动
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        var now = Date.now();
        var deltaTime = now - lastTime;
        
        if (deltaTime > 0) {
            velocityX = (e.clientX - lastX) / deltaTime;
            velocityY = (e.clientY - lastY) / deltaTime;
        }
        
        lastX = e.clientX;
        lastY = e.clientY;
        lastTime = now;
        
        currentX = dragImageStartX + (e.clientX - dragStartX);
        currentY = dragImageStartY + (e.clientY - dragStartY);
        
        viewerImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom * (flipHorizontal ? -1 : 1)}, ${currentZoom * (flipVertical ? -1 : 1)}) rotate(${currentRotation}deg)`;
    });
    
    // 鼠标拖拽结束
    function endDrag(e) {
        if (!isDragging) return;
        
        isDragging = false;
        viewerImage.style.cursor = 'grab';
        
        var now = Date.now();
        var deltaTime = now - lastTime;
        var shouldInertia = deltaTime < 100 && (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1);
        
        if (shouldInertia) {
            var inertiaDuration = 300;
            var startTime = now;
            var startX = currentX;
            var startY = currentY;
            
            function applyInertia() {
                var elapsed = Date.now() - startTime;
                var progress = Math.min(elapsed / inertiaDuration, 1);
                var easeOut = 1 - Math.pow(1 - progress, 3);
                
                var inertiaMultiplier = 100 * (1 - easeOut);
                currentX = startX + velocityX * inertiaMultiplier;
                currentY = startY + velocityY * inertiaMultiplier;
                
                viewerImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom * (flipHorizontal ? -1 : 1)}, ${currentZoom * (flipVertical ? -1 : 1)}) rotate(${currentRotation}deg)`;
                
                if (progress < 1) {
                    requestAnimationFrame(applyInertia);
                } else {
                    viewerImage.style.transition = 'transform 0.2s ease-out';
                    updateImagePosition();
                }
            }
            
            requestAnimationFrame(applyInertia);
        } else {
            viewerImage.style.transition = 'transform 0.2s ease-out';
            updateImagePosition();
        }
    }
    
    // 添加多个事件监听器确保拖拽正确结束
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('mouseleave', function(e) {
        if (e.target === document || e.target === document.documentElement) {
            endDrag(e);
        }
    });
    window.addEventListener('blur', endDrag);
    
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
        // 应用变换：先旋转，再翻转，再缩放和平移
        var scaleX = flipHorizontal ? -1 : 1;
        var scaleY = flipVertical ? -1 : 1;
        viewerImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom * scaleX}, ${currentZoom * scaleY}) rotate(${currentRotation}deg)`;
        
        // 同时应用变换到邮件背景预览div（如果存在）
        var mailBgPreviewDiv = document.getElementById('mailBgPreviewDiv');
        if (mailBgPreviewDiv) {
            mailBgPreviewDiv.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom}) rotate(${currentRotation}deg)`;
            mailBgPreviewDiv.style.transformOrigin = 'center center';
        }
        
        // 更新缩放信息
        document.getElementById('viewerZoomInfo').textContent = Math.round(currentZoom * 100) + '%';
        
        // 确保图片保持在窗口内
        keepImageInBounds();
    }
    
    // 确保图片保持在窗口内
    function keepImageInBounds() {
        var containerRect = imageContainer.getBoundingClientRect();
        var imageRect = viewerImage.getBoundingClientRect();
        
        // 计算边界（考虑旋转后的情况，放宽限制）
        var minX = containerRect.left + 10 - imageRect.left;
        var maxX = containerRect.right - 10 - (imageRect.left + imageRect.width);
        var minY = containerRect.top + 10 - imageRect.top;
        var maxY = containerRect.bottom - 60 - (imageRect.top + imageRect.height); // 预留空间给底部
        
        // 调整位置
        currentX = Math.max(minX, Math.min(maxX, currentX));
        currentY = Math.max(minY, Math.min(maxY, currentY));
        
        // 重新应用变换
        var scaleX = flipHorizontal ? -1 : 1;
        var scaleY = flipVertical ? -1 : 1;
        viewerImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom * scaleX}, ${currentZoom * scaleY}) rotate(${currentRotation}deg)`;
    }
    
    // 重置查看器
    function resetViewer() {
        currentZoom = 1;
        currentX = 0;
        currentY = 0;
        currentRotation = 0;
        flipHorizontal = false;
        flipVertical = false;
        viewerImage.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
        viewerImage.style.cursor = 'grab';
        viewerImage.style.display = 'block';
        document.getElementById('viewerZoomInfo').textContent = '100%';
        
        // 恢复右侧功能栏（从邮件预览切换回来时）
        var viewerControls = document.querySelector('.image-viewer-controls');
        if (viewerControls) {
            viewerControls.style.display = 'flex';
            delete viewerControls.dataset.mailPreview;
        }
        
        // 清理邮件背景预览元素
        var bgPreviewDiv = document.getElementById('mailBgPreviewDiv');
        if (bgPreviewDiv) {
            bgPreviewDiv.style.display = 'none';
            bgPreviewDiv.innerHTML = '';
        }
        
        var dateEl = document.getElementById('mailBgPreviewDate');
        if (dateEl) dateEl.style.display = 'none';
        var particlesEl = document.getElementById('mailBgPreviewParticles');
        if (particlesEl) particlesEl.style.display = 'none';
        var badgeEl = document.getElementById('mailBgPreviewBadge');
        if (badgeEl) badgeEl.style.display = 'none';
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
        updateVersionNotificationDot();
    });
} else {
    loadVersionHistory();
    initImageViewer();
    updateVersionNotificationDot();
}
