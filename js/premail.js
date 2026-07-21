var mailSystem = {
    MAX_MAILS: 100,
    MAX_HISTORY: 200,
    
    MAIL_STORAGE_KEYS: {
        MAILS: 'mails',
        MAIL_HISTORY: 'mailHistory',
        LAST_MAIL_VERSION: 'last_mail_version'
    },
    
    getMails: function() {
        var mails = localStorage.getItem(this.MAIL_STORAGE_KEYS.MAILS);
        return mails ? JSON.parse(mails) : [];
    },
    
    saveMails: function(mails) {
        localStorage.setItem(this.MAIL_STORAGE_KEYS.MAILS, JSON.stringify(mails));
    },
    
    getMailHistory: function() {
        var history = localStorage.getItem(this.MAIL_STORAGE_KEYS.MAIL_HISTORY);
        return history ? JSON.parse(history) : [];
    },
    
    saveMailHistory: function(history) {
        if (history.length > this.MAX_HISTORY) {
            history = history.slice(0, this.MAX_HISTORY);
        }
        localStorage.setItem(this.MAIL_STORAGE_KEYS.MAIL_HISTORY, JSON.stringify(history));
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
        var version = localStorage.getItem(this.MAIL_STORAGE_KEYS.LAST_MAIL_VERSION);
        return version ? parseInt(version, 10) : 0;
    },
    
    setLastMailVersion: function(version) {
        localStorage.setItem(this.MAIL_STORAGE_KEYS.LAST_MAIL_VERSION, version.toString());
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
    
    isMailAvailable: function(mailTemplate) {
        var now = Date.now();
        
        if (mailTemplate.startTime) {
            var startTime = typeof mailTemplate.startTime === 'string' 
                ? this.parseCSTTime(mailTemplate.startTime) 
                : mailTemplate.startTime;
            
            if (startTime !== null && now < startTime) {
                return false;
            }
        }
        
        if (mailTemplate.endTime) {
            var endTime = typeof mailTemplate.endTime === 'string' 
                ? this.parseCSTTime(mailTemplate.endTime) 
                : mailTemplate.endTime;
            
            if (endTime !== null && now > endTime) {
                return false;
            }
        }
        
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
                    content: '感谢您使用PRE Launcher！这是一封测试奖励邮件，您可以点击 "领取" 按钮以获得测试的背景奖励。\n\n该邮件的领取有效期截止至 2026-08-01 09:00:00 (UTC)，过期后将无法领取，请注意领取时间。\n\n祝您使用愉快！',
                    attachments: [
                        { name: '鎏金幻彩', type: 'background', gradient: 'radial-gradient(circle at 10% 20%, rgba(255, 223, 0, 0.2) 0%, transparent 35%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.18) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.15) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.12) 0%, transparent 45%), radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 40%), linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 20%, #16213e 40%, #0f3460 60%, #533483 80%, #e94560 100%)' }
                    ],
                    startTime: "2026-07-20 09:00:00",
                    endTime: "2026-08-01 09:00:00"
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
        
        this.saveMails(mails);
    }
};

var currentMailId = null;

function initMailSystem() {
    console.log('[MailSystem] initMailSystem called');
    console.log('[MailSystem] Current mails count:', mailSystem.getMails().length);
    console.log('[MailSystem] Last mail version in localStorage:', localStorage.getItem('last_mail_version'));
    
    mailSystem.applyMailUpdates();
    
    console.log('[MailSystem] Mails count after updates:', mailSystem.getMails().length);
    
    mailSystem.removeExpiredMails();
    mailSystem.updateMailNotification();
    
    var sidebarMail = document.getElementById('sidebarMail');
    if (sidebarMail) {
        sidebarMail.addEventListener('click', function() {
            showMailModal();
        });
    }
    
    var mailCloseBtn = document.getElementById('mailCloseBtn');
    if (mailCloseBtn) {
        mailCloseBtn.addEventListener('click', function() {
            closeMailModal();
        });
    }
    
    var mailModal = document.getElementById('mailModal');
    if (mailModal) {
        mailModal.addEventListener('click', function(e) {
            if (e.target === mailModal) {
                closeMailModal();
            }
        });
    }
    
    var mailInboxTab = document.getElementById('mailInboxTab');
    if (mailInboxTab) {
        mailInboxTab.addEventListener('click', function() {
            switchMailTab('inbox');
        });
    }
    
    var mailHistoryTab = document.getElementById('mailHistoryTab');
    if (mailHistoryTab) {
        mailHistoryTab.addEventListener('click', function() {
            showMailHistoryModal();
        });
    }
    
    var mailClaimBtn = document.getElementById('mailClaimBtn');
    if (mailClaimBtn) {
        mailClaimBtn.addEventListener('click', function() {
            claimSelectedMail();
        });
    }
    
    var mailDeleteBtn = document.getElementById('mailDeleteBtn');
    if (mailDeleteBtn) {
        mailDeleteBtn.addEventListener('click', function() {
            deleteSelectedMail();
        });
    }
    
    var mailHistoryCloseBtn = document.getElementById('mailHistoryCloseBtn');
    if (mailHistoryCloseBtn) {
        mailHistoryCloseBtn.addEventListener('click', function() {
            closeMailHistoryModal();
        });
    }
    
    var mailHistoryClearBtn = document.getElementById('mailHistoryClearBtn');
    if (mailHistoryClearBtn) {
        mailHistoryClearBtn.addEventListener('click', function() {
            clearMailHistory();
        });
    }
    
    var mailHistoryModal = document.getElementById('mailHistoryModal');
    if (mailHistoryModal) {
        mailHistoryModal.addEventListener('click', function(e) {
            if (e.target === mailHistoryModal) {
                closeMailHistoryModal();
            }
        });
    }
}

function showMailModal() {
    var mailModal = document.getElementById('mailModal');
    if (!mailModal) return;
    
    mailSystem.removeExpiredMails();
    renderMailList();
    clearMailDetail();
    
    mailModal.style.display = 'flex';
    setTimeout(function() {
        mailModal.classList.add('show');
    }, 10);
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
        var html = '';
        mail.attachments.forEach(function(att) {
            if (att.type === 'background') {
                if (att.gradient) {
                    html += `
                        <div class="mail-attachment-item mail-attachment-background">
                            <div class="mail-attachment-preview" style="background: ${att.gradient};"></div>
                            <div class="mail-attachment-info">
                                <div class="mail-attachment-name">${escapeHtml(att.name)}</div>
                                <div class="mail-attachment-desc">静态背景</div>
                            </div>
                        </div>
                    `;
                } else if (att.preview) {
                    html += `
                        <div class="mail-attachment-item mail-attachment-background">
                            <div class="mail-attachment-preview">
                                <img src="${att.preview}" alt="${escapeHtml(att.name)}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'preview-placeholder\\'><i class=\\'fas fa-image\\'></i><span>暂无预览图</span></div>';" />
                            </div>
                            <div class="mail-attachment-info">
                                <div class="mail-attachment-name">${escapeHtml(att.name)}</div>
                                <div class="mail-attachment-desc">静态背景</div>
                            </div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="mail-attachment-item mail-attachment-background">
                            <div class="mail-attachment-preview">
                                <div class="preview-placeholder">
                                    <i class="fas fa-image"></i>
                                    <span>暂无预览图</span>
                                </div>
                            </div>
                            <div class="mail-attachment-info">
                                <div class="mail-attachment-name">${escapeHtml(att.name)}</div>
                                <div class="mail-attachment-desc">静态背景</div>
                            </div>
                        </div>
                    `;
                }
            } else {
                html += `
                    <div class="mail-attachment-item">
                        <div class="mail-attachment-icon">
                            <i class="fas ${att.icon || 'fa-gift'}"></i>
                        </div>
                        <div class="mail-attachment-info">
                            <div class="mail-attachment-name">${escapeHtml(att.name)}</div>
                            <div class="mail-attachment-count">${att.count !== undefined ? 'x' + att.count : ''}</div>
                        </div>
                    </div>
                `;
            }
        });
        attachmentList.innerHTML = html;
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
    if (!currentMailId) return;
    
    var mails = mailSystem.getMails();
    var mail = mails.find(function(m) { return m.id === currentMailId; });
    
    if (!mail || mail.isClaimed) return;
    
    var isExpired = mail.expireTime && mail.expireTime < Date.now();
    if (isExpired) return;
    
    showConfirm('确认领取', '确定要领取这封邮件的奖励吗？', function() {
        mailSystem.claimMail(currentMailId);
        
        showAlert('领取成功！');
        
        selectMail(currentMailId);
        renderMailList();
    });
}

function deleteSelectedMail() {
    if (!currentMailId) return;
    
    var mails = mailSystem.getMails();
    var mail = mails.find(function(m) { return m.id === currentMailId; });
    
    if (!mail) return;
    
    var isExpired = mail.expireTime && mail.expireTime < Date.now();
    if (!mail.isClaimed && !isExpired) {
        showAlert('未领取的邮件不能删除');
        return;
    }
    
    showConfirm('确认删除', '确定要删除这封邮件吗？', function() {
        mailSystem.removeMail(currentMailId);
        
        clearMailDetail();
        renderMailList();
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
        localStorage.removeItem('mailHistory');
        renderMailHistoryList();
        showAlert('领取记录已清空');
    });
}

function renderMailHistoryList() {
    var list = document.getElementById('mailHistoryList');
    if (!list) return;
    
    var history = mailSystem.getMailHistory();
    
    if (history.length === 0) {
        list.innerHTML = `
            <div class="mail-history-empty">
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
            ? item.rewards.map(function(r) { 
                if (r.type === 'background') {
                    return r.name;
                }
                return r.name + ' x' + r.count; 
            }).join(', ')
            : '无';
        
        html += `
            <div class="mail-history-item">
                <div class="mail-history-item-info">
                    <div class="mail-history-item-title">${escapeHtml(item.title)}</div>
                    <div class="mail-history-item-time">${timeStr}</div>
                </div>
                <div class="mail-history-item-rewards">${escapeHtml(rewardsStr)}</div>
            </div>
        `;
    });
    
    list.innerHTML = html;
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
    console.log('mailSystem object:', typeof mailSystem);
    console.log('mailVersions:', mailSystem.mailVersions);
    console.log('Current mails:', mailSystem.getMails());
    console.log('Last mail version:', mailSystem.getLastMailVersion());
    
    var currentVersion = mailSystem.getLastMailVersion();
    var latestVersion = 0;
    mailSystem.mailVersions.forEach(function(v) {
        if (v.version > latestVersion) {
            latestVersion = v.version;
        }
    });
    console.log('Latest version available:', latestVersion);
    console.log('Need updates:', currentVersion < latestVersion);
}