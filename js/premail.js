var mailSystem = {
    MAX_MAILS: 100,
    MAX_HISTORY: 200,
    
    MAIL_STORAGE_KEYS: {
        MAILS: 'mails',
        MAIL_HISTORY: 'mailHistory',
        LAST_MAIL_VERSION: 'last_mail_version'
    },
    
    getUserPrefix: function() {
        var currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                var user = JSON.parse(currentUser);
                return user.username ? user.username + '_' : '';
            } catch(e) {
                console.error('[MailSystem] Failed to parse currentUser:', e);
                return '';
            }
        }
        return '';
    },
    
    getStorageKey: function(baseKey) {
        return this.getUserPrefix() + baseKey;
    },
    
    getMails: function() {
        var mails = localStorage.getItem(this.getStorageKey(this.MAIL_STORAGE_KEYS.MAILS));
        return mails ? JSON.parse(mails) : [];
    },
    
    saveMails: function(mails) {
        localStorage.setItem(this.getStorageKey(this.MAIL_STORAGE_KEYS.MAILS), JSON.stringify(mails));
    },
    
    getMailHistory: function() {
        var history = localStorage.getItem(this.getStorageKey(this.MAIL_STORAGE_KEYS.MAIL_HISTORY));
        return history ? JSON.parse(history) : [];
    },
    
    saveMailHistory: function(history) {
        if (history.length > this.MAX_HISTORY) {
            history = history.slice(0, this.MAX_HISTORY);
        }
        localStorage.setItem(this.getStorageKey(this.MAIL_STORAGE_KEYS.MAIL_HISTORY), JSON.stringify(history));
    },
    
    addMail: function(mail) {
        var mails = this.getMails();
        if (mails.length >= this.MAX_MAILS) {
            mails.pop();
        }
        mails.unshift(mail);
        this.saveMails(mails);
        this.updateMailNotification();
    },
    
    removeMail: function(mailId) {
        var mails = this.getMails();
        mails = mails.filter(function(m) { return m.id !== mailId; });
        this.saveMails(mails);
        this.updateMailNotification();
    },
    
    markAsRead: function(mailId) {
        var mails = this.getMails();
        mails.forEach(function(m) {
            if (m.id === mailId) {
                m.isRead = true;
            }
        });
        this.saveMails(mails);
        this.updateMailNotification();
    },
    
    claimMail: function(mailId) {
        var mails = this.getMails();
        var mail = mails.find(function(m) { return m.id === mailId; });
        if (!mail || mail.isClaimed) return false;
        
        // 发放对象二次校验：若邮件要求注册时间早于指定时间点，
        // 即使邮件已存在于邮箱中，也不允许不符合条件的账户领取。
        // 与 isMailAvailable 保持一致的宽松策略：无法判定注册时间时放行，
        // 仅当能明确判定账户注册时间晚于门槛时才拦截。
        if (mail.requireRegisteredBefore) {
            var deadlineTime = typeof mail.requireRegisteredBefore === 'string' 
                ? this.parseCSTTime(mail.requireRegisteredBefore) 
                : mail.requireRegisteredBefore;
            
            if (deadlineTime !== null) {
                var userRegTime = this.getUserRegisterTime();
                if (userRegTime !== null && userRegTime >= deadlineTime) {
                    console.log('[MailSystem] Mail claim blocked by registration time check:', mailId);
                    return false;
                }
            }
        }
        
        // 应用附件奖励
        // 当前支持类型：
        //   - experience：经验值，领取后立即对账户等级生效
        //   - background：背景奖励，仅记录到领取历史中（由用户在历史中预览/应用）
        // 后续新增奖励类型可在此处扩展
        if (mail.attachments && mail.attachments.length > 0) {
            mail.attachments.forEach(function(att) {
                if (att.type === 'experience' && att.count) {
                    if (typeof addCheckinExp === 'function') {
                        addCheckinExp(att.count);
                    } else {
                        console.warn('[MailSystem] addCheckinExp not available, experience reward skipped:', att.count);
                    }
                }
            });
        }
        
        mail.isClaimed = true;
        
        var history = this.getMailHistory();
        history.unshift({
            id: mail.id,
            title: mail.title,
            rewards: mail.attachments || [],
            claimTime: Date.now()
        });
        this.saveMailHistory(history);
        
        this.saveMails(mails);
        this.updateMailNotification();
        return true;
    },
    
    removeExpiredMails: function() {
        var now = Date.now();
        var mails = this.getMails();
        var expiredCount = 0;
        mails = mails.filter(function(m) {
            if (m.expireTime && m.expireTime < now) {
                expiredCount++;
                return false;
            }
            return true;
        });
        if (expiredCount > 0) {
            this.saveMails(mails);
            this.updateMailNotification();
        }
        return expiredCount;
    },
    
    updateMailNotification: function() {
        var mails = this.getMails();
        var unreadCount = mails.filter(function(m) { return !m.isRead; }).length;
        var dot = document.getElementById('mailNotificationDot');
        if (dot) {
            dot.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    },
    
    getLastMailVersion: function() {
        var version = localStorage.getItem(this.getStorageKey(this.MAIL_STORAGE_KEYS.LAST_MAIL_VERSION));
        return version ? parseInt(version, 10) : 0;
    },
    
    setLastMailVersion: function(version) {
        localStorage.setItem(this.getStorageKey(this.MAIL_STORAGE_KEYS.LAST_MAIL_VERSION), version.toString());
    },
    
    parseCSTTime: function(timeStr) {
        var match = timeStr.match(/(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})\s+(\d{1,2}):(\d{2}):(\d{2})/);
        if (match) {
            var year = parseInt(match[1], 10);
            var month = parseInt(match[2], 10) - 1;
            var day = parseInt(match[3], 10);
            var hour = parseInt(match[4], 10);
            var minute = parseInt(match[5], 10);
            var second = parseInt(match[6], 10);
            
            return Date.UTC(year, month, day, hour, minute, second) - 8 * 60 * 60 * 1000;
        }
        return null;
    },
    
    // ==================== 账户注册时间检查系统 ====================
    // 用于判定邮件发放对象：当邮件模板配置了 requireRegisteredBefore 时，
    // 仅当当前账户的注册时间早于该时间点，邮件才会被发放与显示。
    // 每个邮件模板均可独立配置该字段，便于后续灵活发放邮件。
    getUserRegisterTime: function() {
        var currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
            console.warn('[MailSystem] getUserRegisterTime: no currentUser in localStorage');
            return null;
        }
        
        try {
            var currentUser = JSON.parse(currentUserStr);
            if (!currentUser || !currentUser.username) {
                console.warn('[MailSystem] getUserRegisterTime: currentUser has no username');
                return null;
            }
            
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var foundUser = users.find(function(u) { return u.username === currentUser.username; });
            
            if (!foundUser) {
                console.warn('[MailSystem] getUserRegisterTime: user not found in registeredUsers:', currentUser.username);
                return null;
            }
            
            if (!foundUser.createdAt) {
                console.warn('[MailSystem] getUserRegisterTime: user has no createdAt field:', currentUser.username);
                return null;
            }
            
            var ts = new Date(foundUser.createdAt).getTime();
            if (isNaN(ts)) {
                console.warn('[MailSystem] getUserRegisterTime: createdAt is unparseable:', foundUser.createdAt);
                return null;
            }
            
            return ts;
        } catch(e) {
            console.error('[MailSystem] Failed to get user register time:', e);
            return null;
        }
    },
    
    isMailAvailable: function(mailTemplate) {
        var now = Date.now();
        var mailId = mailTemplate.id || 'unknown';
        
        if (mailTemplate.startTime) {
            var startTime = typeof mailTemplate.startTime === 'string' 
                ? this.parseCSTTime(mailTemplate.startTime) 
                : mailTemplate.startTime;
            
            if (startTime !== null && now < startTime) {
                console.log('[MailSystem] isMailAvailable: BLOCKED by startTime check',
                    'mailId:', mailId,
                    'now:', now, '(' + new Date(now).toLocaleString() + ')',
                    'startTime:', startTime, '(' + new Date(startTime).toLocaleString() + ')',
                    'now < startTime:', now < startTime);
                return false;
            }
        }
        
        if (mailTemplate.endTime) {
            var endTime = typeof mailTemplate.endTime === 'string' 
                ? this.parseCSTTime(mailTemplate.endTime) 
                : mailTemplate.endTime;
            
            if (endTime !== null && now > endTime) {
                console.log('[MailSystem] isMailAvailable: BLOCKED by endTime check',
                    'mailId:', mailId,
                    'now:', now, '(' + new Date(now).toLocaleString() + ')',
                    'endTime:', endTime, '(' + new Date(endTime).toLocaleString() + ')',
                    'now > endTime:', now > endTime);
                return false;
            }
        }
        
        // 发放对象注册时间检查：若邮件模板要求注册时间早于指定时间点，
        // 则校验当前账户注册时间。
        // 注意：当无法确定账户注册时间时（如老账户缺少 createdAt 字段），
        // 默认放行——因为这类账户通常早于该字段引入时间，本身就符合发放条件。
        // 仅当能明确判定账户注册时间晚于门槛时才拦截。
        if (mailTemplate.requireRegisteredBefore) {
            var deadlineTime = typeof mailTemplate.requireRegisteredBefore === 'string' 
                ? this.parseCSTTime(mailTemplate.requireRegisteredBefore) 
                : mailTemplate.requireRegisteredBefore;
            
            if (deadlineTime !== null) {
                var userRegTime = this.getUserRegisterTime();
                console.log('[MailSystem] isMailAvailable: requireRegisteredBefore check',
                    'mailId:', mailId,
                    'deadlineTime:', deadlineTime, '(' + new Date(deadlineTime).toLocaleString() + ')',
                    'userRegTime:', userRegTime, userRegTime !== null ? '(' + new Date(userRegTime).toLocaleString() + ')' : 'null (will pass)');
                
                if (userRegTime !== null && userRegTime >= deadlineTime) {
                    console.log('[MailSystem] isMailAvailable: BLOCKED by registration time check',
                        'userRegTime(' + new Date(userRegTime).toLocaleString() + ') >= deadlineTime(' + new Date(deadlineTime).toLocaleString() + ')');
                    return false;
                }
            }
        }
        
        console.log('[MailSystem] isMailAvailable: PASSED', mailId);
        return true;
    },
    
    // ==================== 增量邮件发放系统 ====================
    // 每次新增邮件或更新邮件内容时，添加新的版本号和邮件数据
    // 新增邮件版本示例：
        // {
        //     version: 2,
        //     date: "2026-07-21",
        //     mails: [
        //         {
        //             id: 'event_mail_001',
        //             title: '限时活动奖励',
        //             sender: 'PRE Launcher',
        //             content: '感谢您参与本次活动！这里是您的专属奖励。',
        //             attachments: [
        //                 { name: '活动限定背景', type: 'background', gradient: '...' },
        //                 { name: '金币', type: 'currency', count: 100 }
        //             ],
        //             startTime: "2026-07-21 10:00:00",
        //             endTime: "2026-07-28 10:00:00"
        //         }
        //     ]
        // }
    mailVersions: [
        
        {
            version: 1,
            date: "2026-07-20",
            mails: [
                {
                    id: 'test_mail_001',
                    title: '欢迎使用邮件系统',
                    sender: 'PRE Launcher',
                    content: '感谢您使用PRE Launcher！这是一封测试奖励邮件，您可以点击 "领取" 按钮以获得测试的「鎏金幻彩」背景奖励。\n\n该邮件的领取有效期已延长至 2026-08-31 23:59:59 (UTC+8)，过期后将无法领取，请注意领取时间。\n\n祝您使用愉快！',
                    attachments: [
                        { name: '鎏金幻彩', type: 'background', gradient: 'radial-gradient(circle at 10% 20%, rgba(255, 223, 0, 0.2) 0%, transparent 35%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.18) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.15) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.12) 0%, transparent 45%), radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 40%), linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 20%, #16213e 40%, #0f3460 60%, #533483 80%, #e94560 100%)' }
                    ],
                    startTime: "2026-07-20 09:00:00",
                    endTime: "2026-08-31 23:59:59"
                }
            ]
        },
        {
            version: 2,
            date: "2026-07-21",
            mails: [
                {
                    id: 'monthly_mail_july',
                    title: '七月限定动态背景',
                    sender: 'PRE Launcher',
                    content: '七月限定动态背景「七月流火」已发放！点击"领取"按钮即可获得这一专属背景。\n\n该背景采用暖色调渐变设计，象征着七月的热情与活力，右下角带有年月数字显示和动态星光效果。\n\n同时我们也一并延长了上一封邮件中「鎏金幻彩」背景的领取有效期，现已延长至 2026-08-31 23:59:59 (UTC+8)，以防用户忘记领取。\n\n该动态背景领取有效期截止至 2026-08-31 23:59:59 (UTC+8)，请及时领取！\n\n祝您使用愉快！',
                    attachments: [
                        { 
                            name: '七月流火', 
                            type: 'background', 
                            gradient: 'radial-gradient(circle at 15% 15%, rgba(255, 200, 50, 0.3) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(255, 100, 50, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(255, 150, 0, 0.2) 0%, transparent 55%), radial-gradient(circle at 30% 70%, rgba(255, 230, 100, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255, 80, 80, 0.15) 0%, transparent 50%), linear-gradient(135deg, #fff7ed 0%, #ffedd5 15%, #fed7aa 30%, #fdba74 45%, #fb923c 60%, #f97316 75%, #ea580c 90%, #c2410c 100%)',
                            isDynamic: true,
                            backgroundSize: '200% 200%',
                            animation: 'monthlyShift 20s ease infinite',
                            particles: true,
                            showDate: true,
                            dateText: '2026.07'
                        }
                    ],
                    startTime: "2026-07-21 19:20:00",
                    endTime: "2026-08-31 23:59:59"
                }
            ]
        },
        {
            version: 3,
            date: "2026-08-08",
            mails: [
                {
                    id: 'monthly_mail_august',
                    title: '八月限定动态背景',
                    sender: 'PRE Launcher',
                    content: '八月限定动态背景「八月鎏金」已发放！点击"领取"按钮即可获得这一专属背景。\n\n该背景采用深金、琥珀与初秋渐变配色，象征着八月的成熟与华美，右下角带有年月数字显示和动态粒子效果，为您的桌面带来浓郁的秋意氛围。\n\n该动态背景领取有效期截止至 2026-08-31 23:59:59 (UTC+8)，请及时领取！\n\n祝您使用愉快！',
                    attachments: [
                        { 
                            name: '八月鎏金', 
                            type: 'background', 
                            gradient: 'radial-gradient(circle at 12% 18%, rgba(218, 165, 32, 0.35) 0%, transparent 40%), radial-gradient(circle at 88% 82%, rgba(255, 140, 0, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 55%), radial-gradient(circle at 28% 72%, rgba(139, 90, 43, 0.18) 0%, transparent 50%), radial-gradient(circle at 72% 28%, rgba(46, 139, 142, 0.12) 0%, transparent 45%), linear-gradient(135deg, #1a0f00 0%, #2d1810 15%, #4a2c1a 30%, #8b6914 45%, #b8860b 55%, #daa520 65%, #cd853f 75%, #6b4423 85%, #2e2e2e 100%)',
                            isDynamic: true,
                            backgroundSize: '300% 300%',
                            animation: 'augustShift 18s ease infinite',
                            particles: true,
                            showDate: true,
                            dateText: '2026.08'
                        }
                    ],
                    startTime: "2026-08-08 09:00:00",
                    endTime: "2026-08-31 23:59:59"
                }
            ]
        },
        {
            version: 4,
            date: "2026-08-27",
            mails: [
                {
                    id: 'compensation_mail_20260827',
                    title: '2026-08-27 版本更新补偿',
                    sender: 'PRE Launcher',
                    content: '亲爱的用户，您好！\n\n感谢您一直以来对 PRE Launcher 的支持与厚爱。在 2026-08-27 推送的 RC 3.0.1.2 (c1) 版本更新中，我们对启动器进行了多项功能优化与问题修复。\n\n为感谢您在本次版本更新前已完成账户注册，我们特为您奉上 300 经验值作为版本更新补偿。领取后将立即对您的账户等级生效，助力您在秋季签到等级提速活动中更进一步。\n\n本邮件发放对象为 2026-08-27 09:00:00 (UTC+8) 之前完成注册的账户；\n领取有效期截至 2026-09-03 23:59:59 (UTC+8)，逾期未领取将无法补发，请及时领取。\n\n祝您使用愉快！',
                    attachments: [
                        {
                            name: '经验值',
                            type: 'experience',
                            count: 300,
                            icon: 'fa-star'
                        }
                    ],
                    startTime: "2026-08-27 09:00:00",
                    endTime: "2026-09-03 23:59:59",
                    requireRegisteredBefore: "2026-08-27 09:00:00"
                }
            ]
        },
        {
            version: 5,
            date: "2026-08-27",
            mails: [
                {
                    id: 'checkin_fix_compensation_20260827',
                    title: '「秋季签到与等级提速特别活动」错误修复与补偿',
                    sender: 'PRE Launcher',
                    content: '亲爱的用户，您好！\n\n我们在 2026-08-27 发现「秋季签到与等级提速特别活动」的签到天数计算存在逻辑错误——部分用户在首次进入时即可领取多天的签到奖励，这不符合活动设计预期。\n\n该问题已在 RC 3.0.1.2 (c2) 补丁中修复，签到天数将改为基于您的实际登录记录进行计算，每天登录仅解锁一天。\n\n为感谢您的理解与支持，我们为在 2026-08-27 11:00:00 之前注册的所有账户发放 1000 经验值作为补偿，助力您的账号等级提升。\n\n本邮件领取有效期截至 2026-09-03 23:59:59 (UTC+8)，请及时领取！\n\n祝您使用愉快！',
                    attachments: [
                        {
                            name: '经验值',
                            type: 'experience',
                            count: 1000,
                            icon: 'fa-star'
                        }
                    ],
                    startTime: "2026-08-27 11:00:00",
                    endTime: "2026-09-03 23:59:59",
                    requireRegisteredBefore: "2026-08-27 11:00:00"
                }
            ]
        }
        
    ],
    
    applyMailUpdates: function() {
        var currentVersion = this.getLastMailVersion();
        var latestVersion = 0;
        
        this.mailVersions.forEach(function(v) {
            if (v.version > latestVersion) {
                latestVersion = v.version;
            }
        });
        
        console.log('[MailSystem] applyMailUpdates - currentVersion:', currentVersion, ', latestVersion:', latestVersion);
        
        var hasUpdates = false;
        
        this.mailVersions.forEach(function(versionData) {
            versionData.mails.forEach(function(mailTemplate) {
                if (!this.isMailAvailable(mailTemplate)) {
                    console.log('[MailSystem] Mail not available yet:', mailTemplate.id);
                    return;
                }
                
                var existingMail = this.getMails().find(function(m) { return m.id === mailTemplate.id; });
                
                var startTime = typeof mailTemplate.startTime === 'string' 
                    ? this.parseCSTTime(mailTemplate.startTime) 
                    : (mailTemplate.startTime || Date.now());
                var endTime = typeof mailTemplate.endTime === 'string' 
                    ? this.parseCSTTime(mailTemplate.endTime) 
                    : mailTemplate.endTime;
                
                if (existingMail) {
                    var needsUpdate = false;
                    if (mailTemplate.title !== undefined && existingMail.title !== mailTemplate.title) needsUpdate = true;
                    if (mailTemplate.sender !== undefined && existingMail.sender !== mailTemplate.sender) needsUpdate = true;
                    if (mailTemplate.content !== undefined && existingMail.content !== mailTemplate.content) needsUpdate = true;
                    if (mailTemplate.attachments !== undefined && JSON.stringify(existingMail.attachments) !== JSON.stringify(mailTemplate.attachments)) needsUpdate = true;
                    if (endTime !== undefined && existingMail.expireTime !== endTime) needsUpdate = true;
                    if (mailTemplate.requireRegisteredBefore !== undefined && existingMail.requireRegisteredBefore !== mailTemplate.requireRegisteredBefore) needsUpdate = true;
                    
                    if (needsUpdate) {
                        console.log('[MailSystem] Updating existing mail:', mailTemplate.id);
                        this._updateExistingMail(existingMail.id, mailTemplate);
                        hasUpdates = true;
                    }
                } else {
                    console.log('[MailSystem] Adding new mail:', mailTemplate.id);
                    var newMail = {
                        id: mailTemplate.id,
                        title: mailTemplate.title,
                        sender: mailTemplate.sender,
                        content: mailTemplate.content,
                        attachments: mailTemplate.attachments,
                        sendTime: startTime,
                        expireTime: endTime,
                        isRead: false,
                        isClaimed: false
                    };
                    // 持久化发放对象注册时间门槛，便于领取时二次校验
                    if (mailTemplate.requireRegisteredBefore !== undefined) {
                        newMail.requireRegisteredBefore = mailTemplate.requireRegisteredBefore;
                    }
                    
                    var history = this.getMailHistory();
                    var hasClaimed = history.some(function(item) { return item.id === newMail.id; });
                    if (hasClaimed) {
                        newMail.isClaimed = true;
                    }
                    
                    this.addMail(newMail);
                    hasUpdates = true;
                }
            }, this);
        }, this);
        
        this.setLastMailVersion(latestVersion);
        console.log('[MailSystem] Mail updates applied, last version set to:', latestVersion, ', hasUpdates:', hasUpdates);
    },
    
    _updateExistingMail: function(existingMailId, mailTemplate) {
        var mails = this.getMails();
        var mail = mails.find(function(m) { return m.id === existingMailId; });
        if (!mail) return;
        
        if (mailTemplate.title !== undefined) mail.title = mailTemplate.title;
        if (mailTemplate.sender !== undefined) mail.sender = mailTemplate.sender;
        if (mailTemplate.content !== undefined) mail.content = mailTemplate.content;
        if (mailTemplate.attachments !== undefined) mail.attachments = mailTemplate.attachments;
        
        if (mailTemplate.startTime !== undefined) {
            var startTime = typeof mailTemplate.startTime === 'string' 
                ? this.parseCSTTime(mailTemplate.startTime) 
                : mailTemplate.startTime;
            if (startTime !== null) mail.sendTime = startTime;
        }
        
        if (mailTemplate.endTime !== undefined) {
            var endTime = typeof mailTemplate.endTime === 'string' 
                ? this.parseCSTTime(mailTemplate.endTime) 
                : mailTemplate.endTime;
            if (endTime !== null) mail.expireTime = endTime;
        }
        
        // 同步发放对象注册时间门槛，便于领取时二次校验
        if (mailTemplate.requireRegisteredBefore !== undefined) {
            mail.requireRegisteredBefore = mailTemplate.requireRegisteredBefore;
        }
        
        this.saveMails(mails);
    }
};

var currentMailId = null;

function initMailSystem() {
    console.log('[MailSystem] initMailSystem called');
    
    bindMailEventListeners();
    
    var hasUser = mailSystem.getUserPrefix() !== '';
    if (hasUser) {
        migrateOldMailData();
        
        console.log('[MailSystem] Current mails count:', mailSystem.getMails().length);
        console.log('[MailSystem] Last mail version in localStorage:', localStorage.getItem(mailSystem.getStorageKey(mailSystem.MAIL_STORAGE_KEYS.LAST_MAIL_VERSION)));
        
        mailSystem.applyMailUpdates();
        
        console.log('[MailSystem] Mails count after updates:', mailSystem.getMails().length);
        
        mailSystem.removeExpiredMails();
        mailSystem.updateMailNotification();
    } else {
        console.log('[MailSystem] No user logged in, skipping mail data initialization');
    }
}

function bindMailEventListeners() {
    var sidebarMail = document.getElementById('sidebarMail');
    if (sidebarMail) {
        sidebarMail.addEventListener('click', function() {
            if (sidebarMail.classList.contains('disabled-mail')) {
                if (typeof showToastInfo === 'function') {
                    showToastInfo('您需要登录后才可使用邮件功能');
                }
                return;
            }
            showMailModal();
        });
    }
    
    // 模态框内的按钮事件现在由事件委托处理
    // 事件委托在 showMailModal 和 showMailHistoryModal 中设置
}

function migrateOldMailData() {
    var userPrefix = mailSystem.getUserPrefix();
    if (!userPrefix) return;
    
    var keysToMigrate = [
        { old: 'mails', new: 'mails' },
        { old: 'mailHistory', new: 'mailHistory' },
        { old: 'last_mail_version', new: 'last_mail_version' }
    ];
    
    var migrated = false;
    
    keysToMigrate.forEach(function(key) {
        var oldKey = key.old;
        var newKey = userPrefix + key.new;
        
        if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
            var data = localStorage.getItem(oldKey);
            localStorage.setItem(newKey, data);
            localStorage.removeItem(oldKey);
            console.log('[MailSystem] Migrated data from', oldKey, 'to', newKey);
            migrated = true;
        }
    });
    
    if (migrated) {
        console.log('[MailSystem] Old mail data migration completed');
    }
}

function showMailModal() {
    // 检查登录状态
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser || currentUser === '未登录' || currentUser === '') {
        showAlert('请先登录账号以使用邮件功能');
        return;
    }
    
    var mailModal = document.getElementById('mailModal');
    if (!mailModal) return;
    
    mailSystem.removeExpiredMails();
    mailSystem.applyMailUpdates();
    renderMailList();
    clearMailDetail();
    
    mailModal.style.display = 'flex';
    setTimeout(function() {
        mailModal.classList.add('show');
    }, 10);
    
    // 使用事件委托确保按钮事件正确绑定
    setupMailModalEventDelegation();
}

// 使用事件委托确保邮件模态框中的按钮事件正确绑定
function setupMailModalEventDelegation() {
    var mailModal = document.getElementById('mailModal');
    if (!mailModal) return;
    
    // 移除旧的事件委托
    if (mailModal._delegatedHandler) {
        mailModal.removeEventListener('click', mailModal._delegatedHandler);
    }
    
    // 添加新的事件委托
    mailModal._delegatedHandler = function(e) {
        // 点击背景关闭模态框
        if (e.target === mailModal) {
            closeMailModal();
            return;
        }
        
        var target = e.target.closest('button, [role="button"]');
        if (!target || !mailModal.contains(target)) return;
        
        switch (target.id) {
            case 'mailCloseBtn':
                closeMailModal();
                break;
            case 'mailInboxTab':
                switchMailTab('inbox');
                break;
            case 'mailHistoryTab':
                showMailHistoryModal();
                break;
            case 'mailClaimBtn':
                claimSelectedMail();
                break;
            case 'mailDeleteBtn':
                deleteSelectedMail();
                break;
            case 'mailClaimAllBtn':
                claimAllMails();
                break;
        }
    };
    
    mailModal.addEventListener('click', mailModal._delegatedHandler);
}

function closeMailModal() {
    var mailModal = document.getElementById('mailModal');
    if (!mailModal) return;
    
    mailModal.classList.remove('show');
    setTimeout(function() {
        mailModal.style.display = 'none';
    }, 300);
    
    currentMailId = null;
}

function switchMailTab(tab) {
    var inboxTab = document.getElementById('mailInboxTab');
    var historyTab = document.getElementById('mailHistoryTab');
    var mailList = document.getElementById('mailList');
    var mailDetailEmpty = document.getElementById('mailDetailEmpty');
    var mailDetail = document.getElementById('mailDetail');
    var mailDetailFooter = document.getElementById('mailDetailFooter');
    
    if (tab === 'inbox') {
        inboxTab.classList.add('active');
        historyTab.classList.remove('active');
        renderMailList();
    } else {
        historyTab.classList.add('active');
        inboxTab.classList.remove('active');
        renderMailHistory();
    }
    
    clearMailDetail();
    mailDetailEmpty.style.display = 'flex';
    mailDetail.style.display = 'none';
    mailDetailFooter.style.display = 'none';
    currentMailId = null;
}

function renderMailList() {
    var mailList = document.getElementById('mailList');
    if (!mailList) return;
    
    var mails = mailSystem.getMails();
    
    if (mails.length === 0) {
        mailList.innerHTML = `
            <div class="mail-empty">
                <i class="fas fa-envelope"></i>
                <p>暂无邮件</p>
            </div>
        `;
        return;
    }
    
    mails.sort(function(a, b) {
        if (a.isRead === b.isRead) {
            return b.sendTime - a.sendTime;
        }
        return a.isRead ? 1 : -1;
    });
    
    var html = '';
    mails.forEach(function(mail) {
        var isUnread = !mail.isRead;
        var isClaimed = mail.isClaimed;
        var isExpired = mail.expireTime && mail.expireTime < Date.now();
        
        var timeStr = formatMailTime(mail.sendTime);
        var preview = mail.content ? mail.content.substring(0, 50) + (mail.content.length > 50 ? '...' : '') : '';
        
        html += `
            <div class="mail-item ${isUnread ? 'unread' : ''} ${isExpired ? 'expired' : ''}" data-mail-id="${mail.id}">
                <div class="mail-item-header">
                    <span class="mail-item-sender">${escapeHtml(mail.sender)}</span>
                    <span class="mail-item-time">${timeStr}</span>
                </div>
                <div class="mail-item-title">${escapeHtml(mail.title)}</div>
                <div class="mail-item-preview">${escapeHtml(preview)}</div>
                ${isClaimed ? '<div style="margin-top: 8px; font-size: 12px; color: #52c41a;">已领取</div>' : ''}
                ${isExpired ? '<div style="margin-top: 8px; font-size: 12px; color: #999;">已过期</div>' : ''}
            </div>
        `;
    });
    
    mailList.innerHTML = html;
    
    mailList.querySelectorAll('.mail-item').forEach(function(item) {
        item.addEventListener('click', function() {
            selectMail(this.dataset.mailId);
        });
    });
    
    updateClaimAllButton();
}

function renderMailHistory() {
    var mailList = document.getElementById('mailList');
    if (!mailList) return;
    
    var history = mailSystem.getMailHistory();
    
    if (history.length === 0) {
        mailList.innerHTML = `
            <div class="mail-empty">
                <i class="fas fa-history"></i>
                <p>暂无领取记录</p>
            </div>
        `;
        return;
    }
    
    var html = '';
    history.forEach(function(item) {
        var timeStr = formatMailTime(item.claimTime);
        var rewardsStr = item.rewards && item.rewards.length > 0 
            ? item.rewards.map(function(r) { return r.name + ' x' + r.count; }).join(', ')
            : '无附件';
        
        html += `
            <div class="mail-item">
                <div class="mail-item-header">
                    <span class="mail-item-sender">已领取</span>
                    <span class="mail-item-time">${timeStr}</span>
                </div>
                <div class="mail-item-title">${escapeHtml(item.title)}</div>
                <div class="mail-item-preview">奖励: ${escapeHtml(rewardsStr)}</div>
            </div>
        `;
    });
    
    mailList.innerHTML = html;
}

function selectMail(mailId) {
    var mails = mailSystem.getMails();
    var mail = mails.find(function(m) { return m.id === mailId; });
    
    if (!mail) return;
    
    currentMailId = mailId;
    mailSystem.markAsRead(mailId);
    
    var mailDetailEmpty = document.getElementById('mailDetailEmpty');
    var mailDetail = document.getElementById('mailDetail');
    var mailDetailFooter = document.getElementById('mailDetailFooter');
    
    mailDetailEmpty.style.display = 'none';
    mailDetail.style.display = 'block';
    mailDetailFooter.style.display = 'flex';
    
    document.getElementById('mailDetailTitle').textContent = mail.title;
    document.getElementById('mailDetailSender').textContent = mail.sender;
    document.getElementById('mailDetailTime').textContent = formatMailTime(mail.sendTime);
    
    var expireStr = mail.expireTime 
        ? '有效期至: ' + formatMailExpireTime(mail.expireTime)
        : '无有效期限制';
    document.getElementById('mailDetailExpire').textContent = expireStr;
    
    document.getElementById('mailDetailBody').textContent = mail.content;
    
    var attachments = document.getElementById('mailAttachments');
    var attachmentList = document.getElementById('mailAttachmentList');
    
    if (mail.attachments && mail.attachments.length > 0) {
        attachments.style.display = 'block';
        attachmentList.innerHTML = '';
        mail.attachments.forEach(function(att) {
            if (att.type === 'background') {
                var itemDiv = document.createElement('div');
                itemDiv.className = 'mail-attachment-item mail-attachment-background';
                
                if (att.gradient) {
                    var isDynamic = att.isDynamic || false;
                    var gradientStyle = isDynamic 
                        ? 'background: ' + att.gradient + '; background-size: ' + (att.backgroundSize || '200% 200%') + '; animation: ' + (att.animation || 'monthlyShift 20s ease infinite') + ';' 
                        : 'background: ' + att.gradient + ';';
                    
                    var previewDiv = document.createElement('div');
                    previewDiv.className = 'mail-attachment-preview';
                    previewDiv.style.cssText = gradientStyle;
                    
                    if (att.showDate && att.dateText) {
                        var dateEl = document.createElement('div');
                        dateEl.className = 'mail-attachment-date';
                        dateEl.textContent = att.dateText;
                        previewDiv.appendChild(dateEl);
                    }
                    
                    if (att.particles) {
                        var particlesEl = document.createElement('div');
                        particlesEl.className = 'mail-attachment-particles';
                        particlesEl.innerHTML = '<div class="particle p1"></div><div class="particle p2"></div><div class="particle p3"></div><div class="particle p4"></div><div class="particle p5"></div><div class="particle p6"></div>';
                        previewDiv.appendChild(particlesEl);
                    }
                    
                    if (isDynamic) {
                        var badgeEl = document.createElement('div');
                        badgeEl.className = 'mail-attachment-dynamic';
                        badgeEl.textContent = '动态背景';
                        previewDiv.appendChild(badgeEl);
                    }
                    
                    itemDiv.appendChild(previewDiv);
                } else if (att.preview) {
                    var previewDiv = document.createElement('div');
                    previewDiv.className = 'mail-attachment-preview';
                    previewDiv.innerHTML = '<img src="' + att.preview + '" alt="' + escapeHtml(att.name) + '" onerror="this.style.display=\'none\'; this.parentElement.innerHTML=\'<div class=\\\'preview-placeholder\\\'><i class=\\\'fas fa-image\\\'></i><span>暂无预览图</span></div>\';" />';
                    itemDiv.appendChild(previewDiv);
                } else {
                    var previewDiv = document.createElement('div');
                    previewDiv.className = 'mail-attachment-preview';
                    previewDiv.innerHTML = '<div class="preview-placeholder"><i class="fas fa-image"></i><span>暂无预览图</span></div>';
                    itemDiv.appendChild(previewDiv);
                }
                
                var infoDiv = document.createElement('div');
                infoDiv.className = 'mail-attachment-info';
                
                var nameEl = document.createElement('div');
                nameEl.className = 'mail-attachment-name';
                nameEl.textContent = att.name;
                infoDiv.appendChild(nameEl);
                
                var descEl = document.createElement('div');
                descEl.className = 'mail-attachment-desc';
                descEl.textContent = (att.isDynamic || false) ? '动态背景' : '静态背景';
                infoDiv.appendChild(descEl);
                
                itemDiv.appendChild(infoDiv);
                
                itemDiv.addEventListener('click', function() {
                    openBackgroundPreview(att);
                });
                
                attachmentList.appendChild(itemDiv);
            } else {
                var itemDiv = document.createElement('div');
                itemDiv.className = 'mail-attachment-item';
                
                var iconDiv = document.createElement('div');
                iconDiv.className = 'mail-attachment-icon';
                iconDiv.innerHTML = '<i class="fas ' + (att.icon || 'fa-gift') + '"></i>';
                itemDiv.appendChild(iconDiv);
                
                var infoDiv = document.createElement('div');
                infoDiv.className = 'mail-attachment-info';
                
                var nameEl = document.createElement('div');
                nameEl.className = 'mail-attachment-name';
                nameEl.textContent = att.name;
                infoDiv.appendChild(nameEl);
                
                if (att.count !== undefined) {
                    var countEl = document.createElement('div');
                    countEl.className = 'mail-attachment-count';
                    countEl.textContent = 'x' + att.count;
                    infoDiv.appendChild(countEl);
                }
                
                itemDiv.appendChild(infoDiv);
                attachmentList.appendChild(itemDiv);
            }
        });
    } else {
        attachments.style.display = 'none';
        attachmentList.innerHTML = '';
    }
    
    var claimBtn = document.getElementById('mailClaimBtn');
    var deleteBtn = document.getElementById('mailDeleteBtn');
    
    var isExpired = mail.expireTime && mail.expireTime < Date.now();
    
    if (mail.isClaimed) {
        claimBtn.disabled = true;
        claimBtn.innerHTML = '<i class="fas fa-check"></i><span>已领取</span>';
    } else if (isExpired) {
        claimBtn.disabled = true;
        claimBtn.innerHTML = '<i class="fas fa-clock"></i><span>已过期</span>';
    } else {
        claimBtn.disabled = false;
        claimBtn.innerHTML = '<i class="fas fa-gift"></i><span>领取</span>';
    }
    
    if (mail.isClaimed || isExpired) {
        deleteBtn.disabled = false;
    } else {
        deleteBtn.disabled = true;
    }
    
    document.querySelectorAll('.mail-item').forEach(function(item) {
        item.classList.remove('active');
    });
    var activeItem = document.querySelector('.mail-item[data-mail-id="' + mailId + '"]');
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    renderMailList();
}

function claimSelectedMail() {
    if (!currentMailId) {
        showAlert('请先选择一封邮件');
        return;
    }
    
    var mails = mailSystem.getMails();
    var mail = mails.find(function(m) { return m.id === currentMailId; });
    
    if (!mail) {
        showAlert('邮件不存在');
        return;
    }
    
    if (mail.isClaimed) {
        showAlert('该邮件已领取');
        return;
    }
    
    var isExpired = mail.expireTime && mail.expireTime < Date.now();
    if (isExpired) {
        showAlert('该邮件已过期');
        return;
    }
    
    showConfirm('确认领取', '确定要领取这封邮件的奖励吗？', function() {
        mailSystem.claimMail(currentMailId);
        
        showAlert('领取成功！');
        
        selectMail(currentMailId);
        renderMailList();
        updateClaimAllButton();
    });
}

function deleteSelectedMail() {
    if (!currentMailId) {
        showAlert('请先选择一封邮件');
        return;
    }
    
    var mails = mailSystem.getMails();
    var mail = mails.find(function(m) { return m.id === currentMailId; });
    
    if (!mail) {
        showAlert('邮件不存在');
        return;
    }
    
    var isExpired = mail.expireTime && mail.expireTime < Date.now();
    if (!mail.isClaimed && !isExpired) {
        showAlert('未领取的邮件不能删除');
        return;
    }
    
    showConfirm('确认删除', '确定要删除这封邮件吗？', function() {
        mailSystem.removeMail(currentMailId);
        
        clearMailDetail();
        renderMailList();
        updateClaimAllButton();
    });
}

function updateClaimAllButton() {
    var claimAllBtn = document.getElementById('mailClaimAllBtn');
    if (!claimAllBtn) return;
    
    var mails = mailSystem.getMails();
    var now = Date.now();
    var hasUnclaimed = mails.some(function(m) {
        return !m.isClaimed && (!m.expireTime || m.expireTime > now);
    });
    
    claimAllBtn.disabled = !hasUnclaimed;
}

function claimAllMails() {
    var mails = mailSystem.getMails();
    var now = Date.now();
    var unclaimedMails = mails.filter(function(m) {
        return !m.isClaimed && (!m.expireTime || m.expireTime > now);
    });
    
    if (unclaimedMails.length === 0) {
        showAlert('没有可领取的邮件');
        return;
    }
    
    showConfirm('确认一键领取', '是否要全部领取邮件？', function() {
        var allRewards = [];
        
        unclaimedMails.forEach(function(mail) {
            mailSystem.claimMail(mail.id);
            
            if (mail.attachments && mail.attachments.length > 0) {
                mail.attachments.forEach(function(attachment) {
                    allRewards.push(attachment.name + ' x' + (attachment.count || 1));
                });
            }
        });
        
        renderMailList();
        updateClaimAllButton();
        
        var rewardText = '您已领取所有邮件，领取的附件内容如下：<br><br><span style="color: #1a1a1a; font-weight: 500;">';
        if (allRewards.length > 0) {
            rewardText += allRewards.join('<br>');
        } else {
            rewardText += '无附件';
        }
        rewardText += '</span>';
        
        showAlert(rewardText);
    });
}

function clearMailDetail() {
    document.getElementById('mailDetailTitle').textContent = '';
    document.getElementById('mailDetailSender').textContent = '';
    document.getElementById('mailDetailTime').textContent = '';
    document.getElementById('mailDetailExpire').textContent = '';
    document.getElementById('mailDetailBody').textContent = '';
    document.getElementById('mailAttachmentList').innerHTML = '';
    
    var mailDetailEmpty = document.getElementById('mailDetailEmpty');
    var mailDetail = document.getElementById('mailDetail');
    var mailDetailFooter = document.getElementById('mailDetailFooter');
    
    mailDetailEmpty.style.display = 'flex';
    mailDetail.style.display = 'none';
    mailDetailFooter.style.display = 'none';
    
    currentMailId = null;
}

function showMailHistoryModal() {
    var modal = document.getElementById('mailHistoryModal');
    if (!modal) return;
    
    renderMailHistoryList();
    
    modal.style.display = 'flex';
    setTimeout(function() {
        modal.classList.add('show');
    }, 10);
    
    // 使用事件委托确保邮件历史模态框中的按钮事件正确绑定
    setupMailHistoryModalEventDelegation();
}

// 使用事件委托确保邮件历史模态框中的按钮事件正确绑定
function setupMailHistoryModalEventDelegation() {
    var modal = document.getElementById('mailHistoryModal');
    if (!modal) return;
    
    // 移除旧的事件委托
    if (modal._delegatedHandler) {
        modal.removeEventListener('click', modal._delegatedHandler);
    }
    
    // 添加新的事件委托
    modal._delegatedHandler = function(e) {
        // 点击背景关闭模态框
        if (e.target === modal) {
            closeMailHistoryModal();
            return;
        }
        
        var target = e.target.closest('button, [role="button"]');
        if (!target || !modal.contains(target)) return;
        
        switch (target.id) {
            case 'mailHistoryCloseBtn':
                closeMailHistoryModal();
                break;
            case 'mailHistoryClearBtn':
                clearMailHistory();
                break;
        }
    };
    
    modal.addEventListener('click', modal._delegatedHandler);
}

function closeMailHistoryModal() {
    var modal = document.getElementById('mailHistoryModal');
    if (!modal) return;
    
    modal.classList.remove('show');
    setTimeout(function() {
        modal.style.display = 'none';
    }, 300);
}

function clearMailHistory() {
    showConfirm('确认清空', '确定要全部清空吗？清空后不可恢复', function() {
        localStorage.removeItem(mailSystem.getStorageKey(mailSystem.MAIL_STORAGE_KEYS.MAIL_HISTORY));
        renderMailHistoryList();
        showAlert('领取记录已清空');
    });
}

function renderMailHistoryList() {
    var list = document.getElementById('mailHistoryList');
    if (!list) return;
    
    var history = mailSystem.getMailHistory();
    var currentUser = localStorage.getItem('currentUser');
    var username = currentUser ? JSON.parse(currentUser).username : '未知用户';
    
    list.innerHTML = '';
    
    if (history.length === 0) {
        list.innerHTML = `
            <div class="mail-history-empty">
                <i class="fas fa-history"></i>
                <p>暂无领取记录</p>
            </div>
        `;
        return;
    }
    
    history.forEach(function(item) {
        var timeStr = formatMailTime(item.claimTime);
        
        var itemDiv = document.createElement('div');
        itemDiv.className = 'mail-history-item';
        
        var infoDiv = document.createElement('div');
        infoDiv.className = 'mail-history-item-info';
        
        var titleRow = document.createElement('div');
        titleRow.className = 'mail-history-item-title-row';
        
        var titleEl = document.createElement('div');
        titleEl.className = 'mail-history-item-title';
        titleEl.textContent = item.title;
        titleRow.appendChild(titleEl);
        
        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'mail-history-item-delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', function() {
            deleteMailHistoryItem(item.id);
        });
        titleRow.appendChild(deleteBtn);
        
        infoDiv.appendChild(titleRow);
        
        var metaDiv = document.createElement('div');
            metaDiv.className = 'mail-history-item-meta';
            
            var accountEl = document.createElement('div');
            accountEl.className = 'mail-history-item-account';
            accountEl.textContent = '领取账户：' + (item.account || username);
            metaDiv.appendChild(accountEl);
            
            var timeEl = document.createElement('div');
            timeEl.className = 'mail-history-item-time';
            timeEl.textContent = '领取时间：' + timeStr;
            metaDiv.appendChild(timeEl);
            
            infoDiv.appendChild(metaDiv);
        
        itemDiv.appendChild(infoDiv);
        
        if (item.rewards && item.rewards.length > 0) {
            var rewardsDiv = document.createElement('div');
            rewardsDiv.className = 'mail-history-item-rewards';
            
            var rewardsTitle = document.createElement('div');
            rewardsTitle.className = 'mail-history-item-rewards-title';
            rewardsTitle.textContent = '领取内容：';
            rewardsDiv.appendChild(rewardsTitle);
            
            var rewardsList = document.createElement('div');
            rewardsList.className = 'mail-history-item-rewards-list';
            
            item.rewards.forEach(function(reward, idx) {
                var rewardEl = document.createElement('div');
                rewardEl.className = 'mail-history-item-reward';
                rewardEl.dataset.rewardIndex = idx;
                
                if (reward.type === 'background') {
                    rewardEl.textContent = reward.name + (reward.isDynamic ? ' (动态)' : '');
                    rewardEl.classList.add('mail-history-reward-background');
                    
                    rewardEl.addEventListener('click', function() {
                        openBackgroundPreview(reward);
                    });
                } else {
                    rewardEl.textContent = reward.name + (reward.count !== undefined ? ' x' + reward.count : '');
                }
                
                rewardsList.appendChild(rewardEl);
            });
            
            rewardsDiv.appendChild(rewardsList);
            itemDiv.appendChild(rewardsDiv);
        } else {
            var rewardsDiv = document.createElement('div');
            rewardsDiv.className = 'mail-history-item-rewards';
            rewardsDiv.textContent = '领取内容：无';
            itemDiv.appendChild(rewardsDiv);
        }
        
        list.appendChild(itemDiv);
    });
}

function deleteMailHistoryItem(itemId) {
    showConfirm('确认删除', '是否要删除该条领取记录？', function() {
        var history = mailSystem.getMailHistory();
        history = history.filter(function(item) {
            return item.id !== itemId;
        });
        mailSystem.saveMailHistory(history);
        renderMailHistoryList();
    });
}

function formatMailTime(timestamp) {
    var date = new Date(timestamp);
    var now = new Date();
    var diff = now - date;
    
    if (diff < 60000) {
        return '刚刚';
    } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
    } else if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
    } else if (diff < 604800000) {
        return Math.floor(diff / 86400000) + '天前';
    } else {
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = date.getDate().toString().padStart(2, '0');
        var hour = date.getHours().toString().padStart(2, '0');
        var minute = date.getMinutes().toString().padStart(2, '0');
        return month + '-' + day + ' ' + hour + ':' + minute;
    }
}

function formatMailExpireTime(timestamp) {
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    var hour = date.getHours().toString().padStart(2, '0');
    var minute = date.getMinutes().toString().padStart(2, '0');
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
}

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function debugMailSystem() {
    console.log('=== Mail System Debug ===');
    
    var currentUserStr = localStorage.getItem('currentUser');
    var currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    console.log('currentUser:', currentUser);
    
    var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (currentUser && currentUser.username) {
        var foundUser = users.find(function(u) { return u.username === currentUser.username; });
        console.log('Found user in registeredUsers:', foundUser ? foundUser.username : 'NOT FOUND');
        if (foundUser) {
            console.log('User createdAt:', foundUser.createdAt, 'type:', typeof foundUser.createdAt);
            if (foundUser.createdAt) {
                var ts = new Date(foundUser.createdAt).getTime();
                console.log('Parsed timestamp:', ts, 'isNaN:', isNaN(ts));
                if (!isNaN(ts)) {
                    console.log('Parsed date:', new Date(ts).toLocaleString());
                }
            }
        }
    }
    
    console.log('--- getUserRegisterTime ---');
    var regTime = mailSystem.getUserRegisterTime();
    console.log('getUserRegisterTime result:', regTime, regTime !== null ? '(' + new Date(regTime).toLocaleString() + ')' : 'null');
    
    console.log('--- Mail versions ---');
    mailSystem.mailVersions.forEach(function(v) {
        console.log('Version', v.version, ':', v.mails.map(function(m) { return m.id + ' (start:' + m.startTime + ', end:' + m.endTime + ', reqRegBefore:' + (m.requireRegisteredBefore || 'none') + ')'; }));
    });
    
    console.log('--- isMailAvailable test for compensation mail ---');
    var compMail = mailSystem.mailVersions[3].mails[0];
    console.log('Compensation mail template:', compMail);
    var available = mailSystem.isMailAvailable(compMail);
    console.log('isMailAvailable result:', available);
    
    console.log('--- Parsed times ---');
    console.log('startTime parsed:', mailSystem.parseCSTTime(compMail.startTime));
    console.log('endTime parsed:', mailSystem.parseCSTTime(compMail.endTime));
    console.log('requireRegisteredBefore parsed:', mailSystem.parseCSTTime(compMail.requireRegisteredBefore));
    console.log('now:', Date.now(), '(' + new Date().toLocaleString() + ')');
    
    console.log('--- Current mails ---');
    var mails = mailSystem.getMails();
    console.log('Mail count:', mails.length);
    mails.forEach(function(m) { console.log('  -', m.id, m.title, 'expireTime:', m.expireTime); });
    
    console.log('--- Last version ---');
    console.log('Last mail version:', mailSystem.getLastMailVersion());
    var latestVersion = 0;
    mailSystem.mailVersions.forEach(function(v) { if (v.version > latestVersion) latestVersion = v.version; });
    console.log('Latest version available:', latestVersion);
    console.log('Need updates:', mailSystem.getLastMailVersion() < latestVersion);
    
    console.log('=== Debug complete ===');
}

function openBackgroundPreview(attachment) {
    var imageViewerModal = document.getElementById('imageViewerModal');
    
    if (!imageViewerModal && typeof initImageViewer === 'function') {
        initImageViewer();
        imageViewerModal = document.getElementById('imageViewerModal');
    }
    
    if (!imageViewerModal) {
        imageViewerModal = createMailImageViewer();
    }
    
    var viewerImage = document.getElementById('viewerImage');
    var imageContainer = document.getElementById('imageViewerContainer');
    var viewerTitle = imageViewerModal.querySelector('.image-viewer-title span');
    
    // 隐藏右侧功能栏（仅在邮件背景预览时）
    var viewerControls = document.querySelector('.image-viewer-controls');
    if (viewerControls) {
        viewerControls.style.display = 'none';
        viewerControls.dataset.mailPreview = 'true';
    }
    
    if (!viewerImage || !imageContainer) return;
    
    if (viewerTitle) {
        viewerTitle.textContent = attachment.name || '背景预览';
    }
    
    if (attachment.gradient) {
        var isDynamic = attachment.isDynamic || false;
        var gradientStyle = isDynamic 
            ? 'background: ' + attachment.gradient + '; background-size: ' + (attachment.backgroundSize || '200% 200%') + '; animation: ' + (attachment.animation || 'monthlyShift 20s ease infinite') + ';' 
            : 'background: ' + attachment.gradient + ';';
        
        viewerImage.style.display = 'none';
        
        var bgPreviewDiv = document.getElementById('mailBgPreviewDiv');
        if (!bgPreviewDiv) {
            bgPreviewDiv = document.createElement('div');
            bgPreviewDiv.id = 'mailBgPreviewDiv';
            bgPreviewDiv.style.width = '100%';
            bgPreviewDiv.style.height = '600px';
            bgPreviewDiv.style.borderRadius = '8px';
            bgPreviewDiv.style.position = 'relative';
            bgPreviewDiv.style.overflow = 'hidden';
            imageContainer.appendChild(bgPreviewDiv);
        }
        
        bgPreviewDiv.style.display = 'block';
        bgPreviewDiv.style.cssText = 'width: 100%; height: 600px; border-radius: 8px; position: relative; overflow: hidden; ' + gradientStyle;
        
        if (attachment.showDate && attachment.dateText) {
            var dateEl = document.getElementById('mailBgPreviewDate');
            if (!dateEl) {
                dateEl = document.createElement('div');
                dateEl.id = 'mailBgPreviewDate';
                dateEl.style.position = 'absolute';
                dateEl.style.bottom = '20px';
                dateEl.style.right = '20px';
                dateEl.style.fontSize = '24px';
                dateEl.style.fontWeight = '700';
                dateEl.style.color = 'rgba(255,255,255,0.9)';
                dateEl.style.textShadow = '0 2px 10px rgba(0,0,0,0.3)';
                bgPreviewDiv.appendChild(dateEl);
            }
            dateEl.textContent = attachment.dateText;
        }
        
        if (attachment.particles) {
            var particlesEl = document.getElementById('mailBgPreviewParticles');
            if (!particlesEl) {
                particlesEl = document.createElement('div');
                particlesEl.id = 'mailBgPreviewParticles';
                particlesEl.className = 'mail-attachment-particles';
                particlesEl.innerHTML = '<div class="particle p1"></div><div class="particle p2"></div><div class="particle p3"></div><div class="particle p4"></div><div class="particle p5"></div><div class="particle p6"></div>';
                bgPreviewDiv.appendChild(particlesEl);
            }
            particlesEl.style.display = 'block';
        }
        
        if (attachment.isDynamic) {
            var badgeEl = document.getElementById('mailBgPreviewBadge');
            if (!badgeEl) {
                badgeEl = document.createElement('div');
                badgeEl.id = 'mailBgPreviewBadge';
                badgeEl.textContent = '动态背景';
                badgeEl.style.position = 'absolute';
                badgeEl.style.top = '16px';
                badgeEl.style.right = '16px';
                badgeEl.style.padding = '6px 14px';
                badgeEl.style.borderRadius = '4px';
                badgeEl.style.fontSize = '13px';
                badgeEl.style.fontWeight = '600';
                badgeEl.style.background = 'rgba(0,0,0,0.4)';
                badgeEl.style.color = 'white';
                bgPreviewDiv.appendChild(badgeEl);
            }
            badgeEl.style.display = 'block';
        }
    } else if (attachment.preview) {
        viewerImage.style.display = 'block';
        viewerImage.src = attachment.preview;
        
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
    } else {
        viewerImage.style.display = 'none';
        
        var bgPreviewDiv = document.getElementById('mailBgPreviewDiv');
        if (!bgPreviewDiv) {
            bgPreviewDiv = document.createElement('div');
            bgPreviewDiv.id = 'mailBgPreviewDiv';
            bgPreviewDiv.style.width = '100%';
            bgPreviewDiv.style.height = '600px';
            bgPreviewDiv.style.borderRadius = '8px';
            bgPreviewDiv.style.position = 'relative';
            bgPreviewDiv.style.overflow = 'hidden';
            bgPreviewDiv.style.background = '#f0f0f0';
            bgPreviewDiv.style.display = 'flex';
            bgPreviewDiv.style.alignItems = 'center';
            bgPreviewDiv.style.justifyContent = 'center';
            bgPreviewDiv.innerHTML = '<div style="text-align:center"><i class="fas fa-image" style="font-size:48px;color:#ccc;margin-bottom:12px;"></i><div style="color:#999;">暂无预览图</div></div>';
            imageContainer.appendChild(bgPreviewDiv);
        }
        bgPreviewDiv.style.display = 'flex';
    }
    
    imageViewerModal.style.display = 'flex';
    setTimeout(function() {
        imageViewerModal.classList.add('show');
    }, 10);
}

function createMailImageViewer() {
    var imageViewerModal = document.createElement('div');
    imageViewerModal.id = 'imageViewerModal';
    imageViewerModal.className = 'custom-alert';
    imageViewerModal.style.display = 'none';
    imageViewerModal.innerHTML = `
        <div class="image-viewer-fullscreen">
            <div class="image-viewer-header">
                <div class="image-viewer-title">
                    <span>背景预览</span>
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
                </div>
            </div>
            <div class="image-viewer-footer">
                <span id="viewerZoomInfo">100%</span>
            </div>
        </div>
    `;
    document.body.appendChild(imageViewerModal);
    
    var currentZoom = 1;
    var currentX = 0;
    var currentY = 0;
    var currentRotation = 0;
    var flipHorizontal = false;
    var flipVertical = false;
    var isDragging = false;
    var viewerImage = document.getElementById('viewerImage');
    var imageContainer = document.getElementById('imageViewerContainer');
    
    viewerImage.style.position = 'relative';
    viewerImage.style.transformOrigin = 'center center';
    viewerImage.style.cursor = 'grab';
    
    document.getElementById('closeImageViewer').addEventListener('click', function() {
        imageViewerModal.classList.remove('show');
        setTimeout(function() {
            imageViewerModal.style.display = 'none';
            currentZoom = 1;
            currentX = 0;
            currentY = 0;
            currentRotation = 0;
            flipHorizontal = false;
            flipVertical = false;
            if (viewerImage) {
                viewerImage.style.transform = 'scale(1) translate(0, 0) rotate(0deg)';
                viewerImage.src = '';
            }
            document.getElementById('viewerZoomInfo').textContent = '100%';
            
            // 恢复右侧功能栏
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
        }, 300);
    });
    
    function zoomImage(delta) {
        currentZoom = Math.max(0.1, Math.min(5, currentZoom + delta));
        updateImagePosition();
    }
    
    function updateImagePosition() {
        var scaleX = flipHorizontal ? -1 : 1;
        var scaleY = flipVertical ? -1 : 1;
        var transform = 'scale(' + currentZoom * scaleX + ', ' + currentZoom * scaleY + ') translate(' + currentX + 'px, ' + currentY + 'px) rotate(' + currentRotation + 'deg)';
        if (viewerImage) {
            viewerImage.style.transform = transform;
        }
        var bgPreviewDiv = document.getElementById('mailBgPreviewDiv');
        if (bgPreviewDiv) {
            bgPreviewDiv.style.transform = 'scale(' + currentZoom + ') translate(' + currentX + 'px, ' + currentY + 'px) rotate(' + currentRotation + 'deg)';
            bgPreviewDiv.style.transformOrigin = 'center center';
        }
        document.getElementById('viewerZoomInfo').textContent = Math.round(currentZoom * 100) + '%';
    }
    
    document.getElementById('zoomInBtn').addEventListener('click', function() {
        zoomImage(0.1);
    });
    
    document.getElementById('zoomOutBtn').addEventListener('click', function() {
        zoomImage(-0.1);
    });
    
    document.getElementById('resetZoomBtn').addEventListener('click', function() {
        currentZoom = 1;
        currentX = 0;
        currentY = 0;
        currentRotation = 0;
        flipHorizontal = false;
        flipVertical = false;
        updateImagePosition();
    });
    
    document.getElementById('rotateLeftBtn').addEventListener('click', function() {
        currentRotation -= 90;
        updateImagePosition();
    });
    
    document.getElementById('rotateRightBtn').addEventListener('click', function() {
        currentRotation += 90;
        updateImagePosition();
    });
    
    document.getElementById('flipHorizontalBtn').addEventListener('click', function() {
        flipHorizontal = !flipHorizontal;
        updateImagePosition();
    });
    
    document.getElementById('flipVerticalBtn').addEventListener('click', function() {
        flipVertical = !flipVertical;
        updateImagePosition();
    });
    
    imageContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomImage(delta);
    });
    
    imageContainer.addEventListener('mousedown', function(e) {
        if (e.target.closest('.viewer-control-btn')) return;
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        if (viewerImage) viewerImage.style.cursor = 'grabbing';
    });
    
    imageContainer.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        updateImagePosition();
    });
    
    imageContainer.addEventListener('mouseup', function() {
        isDragging = false;
        if (viewerImage) viewerImage.style.cursor = 'grab';
    });
    
    imageContainer.addEventListener('mouseleave', function() {
        isDragging = false;
        if (viewerImage) viewerImage.style.cursor = 'grab';
    });
    
    return imageViewerModal;
}