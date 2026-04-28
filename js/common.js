var CommonUtils = (function() {
    function initIndexedDB() {
        return new Promise(function(resolve, reject) {
            var request = indexedDB.open('backgroundStorage', 1);

            request.onerror = function(event) {
                console.error('IndexedDB打开失败:', event.target.error);
                reject('IndexedDB打开失败');
            };

            request.onsuccess = function(event) {
                resolve(event.target.result);
            };

            request.onupgradeneeded = function(event) {
                var db = event.target.result;
                if (!db.objectStoreNames.contains('backgrounds')) {
                    db.createObjectStore('backgrounds', { keyPath: 'id' });
                }
            };
        });
    }

    function getBackgroundFromIndexedDB(userId) {
        return new Promise(function(resolve, reject) {
            initIndexedDB().then(function(db) {
                var transaction = db.transaction(['backgrounds'], 'readonly');
                var store = transaction.objectStore('backgrounds');
                var request = store.get('background_' + userId);

                request.onsuccess = function(event) {
                    var result = event.target.result;
                    resolve(result ? result.image : null);
                };

                request.onerror = function(event) {
                    console.error('读取背景图片失败:', event.target.error);
                    reject('读取背景图片失败');
                };
            }).catch(reject);
        });
    }

    function applyBackgroundStyle(backgroundSettings, containerSelector) {
        var existingStyle = document.getElementById('custom-background-style');
        if (existingStyle) {
            existingStyle.remove();
        }

        var style = document.createElement('style');
        style.id = 'custom-background-style';

        var backgroundImage = backgroundSettings.image;
        var fit = backgroundSettings.fit;
        var opacity = backgroundSettings.opacity;
        var blur = backgroundSettings.blur;

        if (fit === 'content') {
            style.textContent = [
                'body { position: relative; }',
                '.settings-container { position: relative; }',
                '.settings-container::before { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\'' + backgroundImage + '\'); background-size: cover; background-position: center; background-repeat: no-repeat; opacity: ' + opacity + '; filter: blur(' + blur + 'px); z-index: -1; }',
                '.community-bg { display: none; }'
            ].join('\n');
        } else {
            style.textContent = [
                'body { position: relative; }',
                'body::before { content: ""; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\'' + backgroundImage + '\'); background-size: ' + fit + '; background-position: center; background-repeat: ' + (fit === 'repeat' ? 'repeat' : 'no-repeat') + '; opacity: ' + opacity + '; filter: blur(' + blur + 'px); z-index: -1; }',
                '.community-bg { display: none; }'
            ].join('\n');
        }

        document.head.appendChild(style);
    }

    function loadCustomBackground() {
        var backgroundSettings = localStorage.getItem('customBackground');
        if (backgroundSettings) {
            try {
                backgroundSettings = JSON.parse(backgroundSettings);

                if (backgroundSettings.useIndexedDB && !backgroundSettings.image) {
                    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    var userId = currentUser.userId || currentUser.username;

                    if (userId) {
                        getBackgroundFromIndexedDB(userId).then(function(imageData) {
                            if (imageData) {
                                applyBackgroundStyle({
                                    image: imageData,
                                    fit: backgroundSettings.fit,
                                    opacity: backgroundSettings.opacity,
                                    blur: backgroundSettings.blur
                                });
                            }
                        }).catch(function(error) {
                            console.error('从IndexedDB读取背景图片失败:', error);
                        });
                    }
                } else {
                    applyBackgroundStyle(backgroundSettings);
                }
            } catch (e) {
                console.error('加载背景设置失败:', e);
            }
        }
    }

    function applyGlassThemeToPage(glassTheme, isDarkMode) {
        var rgbaColor = isDarkMode
            ? 'rgba(30, 30, 50, ' + glassTheme.opacity + ')'
            : 'rgba(255, 255, 255, ' + glassTheme.opacity + ')';

        var style = document.createElement('style');
        style.id = 'glass-theme-style';
        var existingStyle = document.getElementById('glass-theme-style');
        if (existingStyle) {
            existingStyle.remove();
        }

        var blur = glassTheme.blur;
        var hoverColor = isDarkMode
            ? 'rgba(50, 50, 70, ' + (parseFloat(glassTheme.opacity) + 0.1) + ')'
            : 'rgba(255, 255, 255, ' + (parseFloat(glassTheme.opacity) + 0.1) + ')';

        var selectors = [
            '.settings-sidebar { background: ' + rgbaColor + '; backdrop-filter: blur(' + blur + 'px); -webkit-backdrop-filter: blur(' + blur + 'px); border-right: 1px solid ' + (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)') + '; }',
            '.settings-main { background: ' + rgbaColor + '; backdrop-filter: blur(' + blur + 'px); -webkit-backdrop-filter: blur(' + blur + 'px); }',
            '.login-container { background: ' + rgbaColor + '; backdrop-filter: blur(' + blur + 'px); -webkit-backdrop-filter: blur(' + blur + 'px); border: 1px solid ' + (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)') + '; }',
            '.user-center { background: ' + rgbaColor + '; backdrop-filter: blur(' + blur + 'px); -webkit-backdrop-filter: blur(' + blur + 'px); border: 1px solid ' + (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)') + '; }',
            '.user-center:hover { background: ' + hoverColor + '; }',
            '.user-center .user-name { color: ' + (isDarkMode ? '#e0e0e0' : '#333') + '; }',
            '.user-center .user-id { color: ' + (isDarkMode ? '#bbb' : '#666') + '; }',
            '.game-card { background: ' + rgbaColor + '; backdrop-filter: blur(' + blur + 'px); -webkit-backdrop-filter: blur(' + blur + 'px); border: 1px solid ' + (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)') + '; }',
            '.treasure-card { background: ' + rgbaColor + '; backdrop-filter: blur(' + blur + 'px); -webkit-backdrop-filter: blur(' + blur + 'px); border: 1px solid ' + (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)') + '; }',
            '.checkin-area { background: ' + rgbaColor + '; backdrop-filter: blur(' + blur + 'px); -webkit-backdrop-filter: blur(' + blur + 'px); border: 1px solid ' + (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)') + '; }'
        ];

        style.textContent = selectors.join('\n');
        document.head.appendChild(style);
        document.body.classList.add('glass-mode');
    }

    function loadThemeSettings() {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        var glassMode = false;
        var glassTheme = null;
        var isDarkMode = false;

        if (currentUser && users.length > 0) {
            var user = users.find(function(u) {
                return u.username === currentUser.username;
            });

            if (user && user.userProfile) {
                isDarkMode = user.userProfile.theme === 'dark';
                if (isDarkMode) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }

                if (typeof SettingsManager !== 'undefined') {
                    SettingsManager.set('darkMode', isDarkMode);
                }

                glassMode = user.userProfile.theme === 'glass';
                glassTheme = user.userProfile.glassTheme;
            }
        }

        if (!glassTheme) {
            var glassThemeSettings = localStorage.getItem('glassThemeSettings');
            if (glassThemeSettings) {
                try {
                    glassTheme = JSON.parse(glassThemeSettings);
                } catch (e) {
                    console.error('加载毛玻璃主题设置失败:', e);
                }
            }
        }

        if (glassMode && glassTheme) {
            applyGlassThemeToPage(glassTheme, isDarkMode);
        }
    }

    function loadUserAvatar() {
        var avatarInfo = JSON.parse(localStorage.getItem('currentUserAvatar') || 'null');
        if (avatarInfo) {
            var userAvatar = document.querySelector('.user-avatar');
            if (userAvatar) {
                if (avatarInfo.avatar && (avatarInfo.avatar === 'custom' || avatarInfo.avatar.startsWith('custom_')) && avatarInfo.customAvatar) {
                    userAvatar.innerHTML = '';
                    userAvatar.style.backgroundImage = 'url(' + avatarInfo.customAvatar + ')';
                    userAvatar.style.backgroundSize = 'cover';
                    userAvatar.style.backgroundPosition = 'center';
                } else {
                    userAvatar.style.backgroundImage = '';
                    userAvatar.innerHTML = '<i class="fas fa-' + (avatarInfo.avatar || 'user') + '"></i>';
                }
            }
        }
    }

    function initMobileMenu() {
        var mobileMenuBtn = document.getElementById('mobileMenuBtn');
        var settingsSidebar = document.querySelector('.settings-sidebar');
        var menuItems = document.querySelectorAll('.sidebar-menu .menu-item');

        if (mobileMenuBtn && settingsSidebar) {
            mobileMenuBtn.addEventListener('click', function() {
                settingsSidebar.classList.toggle('active');
            });

            menuItems.forEach(function(item) {
                item.addEventListener('click', function() {
                    settingsSidebar.classList.remove('active');
                });
            });

            document.addEventListener('click', function(e) {
                if (!settingsSidebar.contains(e.target) && !mobileMenuBtn.contains(e.target) && settingsSidebar.classList.contains('active')) {
                    settingsSidebar.classList.remove('active');
                }
            });
        }
    }

    return {
        initIndexedDB: initIndexedDB,
        getBackgroundFromIndexedDB: getBackgroundFromIndexedDB,
        applyBackgroundStyle: applyBackgroundStyle,
        loadCustomBackground: loadCustomBackground,
        applyGlassThemeToPage: applyGlassThemeToPage,
        loadThemeSettings: loadThemeSettings,
        loadUserAvatar: loadUserAvatar,
        initMobileMenu: initMobileMenu
    };
})();
