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
        }
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsManager;
}