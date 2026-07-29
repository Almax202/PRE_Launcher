var SettingsManager = (function() {
    var settings = {
        darkMode: false,
        language: 'zh',
        theme: 'auto',
        notificationVolume: 80,
        messageVolume: 60,
        systemNotifications: true,
        gameNotifications: true,
        activityNotifications: false,
        marketingNotifications: false,
        publicProfile: true,
        showOnlineStatus: true,
        allowFriendRequests: true,
        strangerMessages: false,
        readReceipts: true,
        twoFactorAuth: false
    };
    
    var callbacks = {
        onDarkModeChange: [],
        onLanguageChange: [],
        onThemeChange: [],
        onSettingsChange: []
    };
    
    function init() {
        loadSettings();
        applyDarkMode();
        bindEvents();
    }
    
    function loadSettings() {
        var savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            try {
                var parsed = JSON.parse(savedSettings);
                for (var key in parsed) {
                    if (settings.hasOwnProperty(key)) {
                        settings[key] = parsed[key];
                    }
                }
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
        
        if (localStorage.getItem('darkMode') === 'true') {
            settings.darkMode = true;
        }
    }
    
    function saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        localStorage.setItem('darkMode', settings.darkMode.toString());
        notifyCallbacks('onSettingsChange', settings);
    }
    
    function bindEvents() {
        window.addEventListener('storage', function(e) {
            if (e.key === 'appSettings' || e.key === 'darkMode') {
                loadSettings();
                applyDarkMode();
                notifyCallbacks('onSettingsChange', settings);
            }
        });
    }
    
    function notifyCallbacks(callbackType, data) {
        var callbacksList = callbacks[callbackType];
        if (callbacksList && callbacksList.length > 0) {
            callbacksList.forEach(function(callback) {
                try {
                    callback(data);
                } catch (e) {
                    console.error('Callback error:', e);
                }
            });
        }
    }
    
    function applyDarkMode() {
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        var darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = settings.darkMode;
        }
    }
    
    return {
        init: init,
        
        get: function(key) {
            return settings[key];
        },
        
        getAll: function() {
            return Object.assign({}, settings);
        },
        
        set: function(key, value) {
            if (settings.hasOwnProperty(key)) {
                var oldValue = settings[key];
                settings[key] = value;
                saveSettings();
                
                if (key === 'darkMode') {
                    applyDarkMode();
                    notifyCallbacks('onDarkModeChange', { old: oldValue, new: value });
                } else if (key === 'language') {
                    notifyCallbacks('onLanguageChange', { old: oldValue, new: value });
                } else if (key === 'theme') {
                    notifyCallbacks('onThemeChange', { old: oldValue, new: value });
                }
            }
        },
        
        setMultiple: function(newSettings) {
            var changed = false;
            for (var key in newSettings) {
                if (settings.hasOwnProperty(key) && settings[key] !== newSettings[key]) {
                    settings[key] = newSettings[key];
                    changed = true;
                }
            }
            
            if (changed) {
                saveSettings();
                
                if (newSettings.darkMode !== undefined) {
                    applyDarkMode();
                    notifyCallbacks('onDarkModeChange', { 
                        old: settings.darkMode, 
                        new: newSettings.darkMode 
                    });
                }
                
                if (newSettings.language !== undefined) {
                    notifyCallbacks('onLanguageChange', { 
                        old: settings.language, 
                        new: newSettings.language 
                    });
                }
                
                if (newSettings.theme !== undefined) {
                    notifyCallbacks('onThemeChange', { 
                        old: settings.theme, 
                        new: newSettings.theme 
                    });
                }
            }
        },
        
        toggleDarkMode: function() {
            settings.darkMode = !settings.darkMode;
            saveSettings();
            applyDarkMode();
            notifyCallbacks('onDarkModeChange', { 
                old: !settings.darkMode, 
                new: settings.darkMode 
            });
            return settings.darkMode;
        },
        
        on: function(event, callback) {
            if (callbacks[event] && typeof callback === 'function') {
                callbacks[event].push(callback);
            }
        },
        
        off: function(event, callback) {
            if (callbacks[event]) {
                var index = callbacks[event].indexOf(callback);
                if (index > -1) {
                    callbacks[event].splice(index, 1);
                }
            }
        },
        
        reset: function() {
            settings = {
                darkMode: false,
                language: 'zh',
                theme: 'auto',
                notificationVolume: 80,
                messageVolume: 60,
                systemNotifications: true,
                gameNotifications: true,
                activityNotifications: false,
                marketingNotifications: false,
                publicProfile: true,
                showOnlineStatus: true,
                allowFriendRequests: true,
                strangerMessages: false,
                readReceipts: true,
                twoFactorAuth: false
            };
            saveSettings();
            applyDarkMode();
            notifyCallbacks('onSettingsChange', settings);
        },
        
        exportSettings: function() {
            return JSON.stringify(settings, null, 2);
        },
        
        importSettings: function(settingsString) {
            try {
                var imported = JSON.parse(settingsString);
                for (var key in imported) {
                    if (settings.hasOwnProperty(key)) {
                        settings[key] = imported[key];
                    }
                }
                saveSettings();
                applyDarkMode();
                notifyCallbacks('onSettingsChange', settings);
                return true;
            } catch (e) {
                console.error('Failed to import settings:', e);
                return false;
            }
        },

        initCardCollapse: function() {
            var cards = document.querySelectorAll('.section-card');
            var collapsedStates = this.loadCardCollapseStates();
            
            cards.forEach(function(card, index) {
                var header = card.querySelector('.card-header');
                var content = card.querySelector('.card-content');
                if (!header || !content) return;
                
                var cardTitle = header.querySelector('.card-title h3');
                var cardId = cardTitle ? cardTitle.textContent.trim() : 'card-' + index;
                
                var collapseBtn = document.createElement('button');
                collapseBtn.className = 'card-collapse-btn';
                collapseBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
                collapseBtn.setAttribute('aria-label', '收起卡片');
                
                var isCollapsed = collapsedStates[cardId] === true;
                if (isCollapsed) {
                    card.classList.add('collapsed');
                    content.style.maxHeight = '0px';
                    collapseBtn.querySelector('i').className = 'fas fa-chevron-down';
                    collapseBtn.setAttribute('aria-label', '展开卡片');
                } else {
                    var contentHeight = content.scrollHeight;
                    if (contentHeight > 0) {
                        content.style.maxHeight = contentHeight + 'px';
                    } else {
                        content.style.maxHeight = '2000px';
                    }
                }
                
                collapseBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    var isCurrentlyCollapsed = card.classList.contains('collapsed');
                    
                    if (isCurrentlyCollapsed) {
                        content.style.maxHeight = 'none';
                        var currentHeight = content.scrollHeight;
                        content.style.maxHeight = currentHeight + 'px';
                        card.classList.remove('collapsed');
                        collapseBtn.querySelector('i').className = 'fas fa-chevron-up';
                        collapseBtn.setAttribute('aria-label', '收起卡片');
                        collapsedStates[cardId] = false;
                    } else {
                        content.style.maxHeight = '0px';
                        card.classList.add('collapsed');
                        collapseBtn.querySelector('i').className = 'fas fa-chevron-down';
                        collapseBtn.setAttribute('aria-label', '展开卡片');
                        collapsedStates[cardId] = true;
                    }
                    SettingsManager.saveCardCollapseStates(collapsedStates);
                });
                
                header.appendChild(collapseBtn);
            });
            
            this.bindCollapseAllButton();
        },
        
        loadCardCollapseStates: function() {
            try {
                var saved = localStorage.getItem('cardCollapseStates');
                return saved ? JSON.parse(saved) : {};
            } catch (e) {
                console.error('Failed to load card collapse states:', e);
                return {};
            }
        },
        
        saveCardCollapseStates: function(states) {
            try {
                localStorage.setItem('cardCollapseStates', JSON.stringify(states));
            } catch (e) {
                console.error('Failed to save card collapse states:', e);
            }
        },
        
        updateCardHeights: function() {
            var cards = document.querySelectorAll('.section-card');
            var collapsedStates = this.loadCardCollapseStates();
            
            cards.forEach(function(card, index) {
                var header = card.querySelector('.card-header');
                var content = card.querySelector('.card-content');
                if (!header || !content) return;
                
                var cardTitle = header.querySelector('.card-title h3');
                var cardId = cardTitle ? cardTitle.textContent.trim() : 'card-' + index;
                var isCollapsed = collapsedStates[cardId] === true;
                
                if (!isCollapsed) {
                    content.style.maxHeight = 'none';
                    var height = content.scrollHeight;
                    content.style.maxHeight = height + 'px';
                }
            });
        },
        
        bindCollapseAllButton: function() {
            var collapseAllBtn = document.getElementById('collapseAllBtn');
            if (!collapseAllBtn) return;
            
            collapseAllBtn.addEventListener('click', function() {
                var cards = document.querySelectorAll('.section-card');
                var allCollapsed = true;
                
                cards.forEach(function(card) {
                    if (!card.classList.contains('collapsed')) {
                        allCollapsed = false;
                    }
                });
                
                var collapsedStates = {};
                
                cards.forEach(function(card, index) {
                    var header = card.querySelector('.card-header');
                    var content = card.querySelector('.card-content');
                    if (!header) return;
                    
                    var cardTitle = header.querySelector('.card-title h3');
                    var cardId = cardTitle ? cardTitle.textContent.trim() : 'card-' + index;
                    var collapseBtn = header.querySelector('.card-collapse-btn');
                    var icon = collapseBtn ? collapseBtn.querySelector('i') : null;
                    
                    if (allCollapsed) {
                        if (content) {
                            var contentHeight = content.scrollHeight;
                            content.style.maxHeight = contentHeight + 'px';
                        }
                        card.classList.remove('collapsed');
                        if (icon) icon.className = 'fas fa-chevron-up';
                        if (collapseBtn) collapseBtn.setAttribute('aria-label', '收起卡片');
                        collapsedStates[cardId] = false;
                    } else {
                        if (content) {
                            content.style.maxHeight = '0px';
                        }
                        card.classList.add('collapsed');
                        if (icon) icon.className = 'fas fa-chevron-down';
                        if (collapseBtn) collapseBtn.setAttribute('aria-label', '展开卡片');
                        collapsedStates[cardId] = true;
                    }
                });
                
                SettingsManager.saveCardCollapseStates(collapsedStates);
                
                var btnIcon = collapseAllBtn.querySelector('i');
                var btnText = collapseAllBtn.querySelector('span');
                if (allCollapsed) {
                    btnIcon.className = 'fas fa-chevron-up';
                    btnText.textContent = '全部收起';
                    collapseAllBtn.setAttribute('title', '收起所有卡片');
                } else {
                    btnIcon.className = 'fas fa-chevron-down';
                    btnText.textContent = '全部展开';
                    collapseAllBtn.setAttribute('title', '展开所有卡片');
                }
            });
        }
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsManager;
}