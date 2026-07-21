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
        var customBackground = localStorage.getItem('customBackground');
        var defaultBgGradient = localStorage.getItem('defaultBackgroundGradient');
        
        if (customBackground) {
            try {
                var backgroundSettings = JSON.parse(customBackground);

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
                            applyDefaultGradientBackground();
                        });
                    }
                } else {
                    applyBackgroundStyle(backgroundSettings);
                }
            } catch (e) {
                console.error('加载背景设置失败:', e);
                applyDefaultGradientBackground();
            }
        } else if (defaultBgGradient) {
            applyDefaultGradientBackground();
        }
    }
    
    function applyDefaultGradientBackground() {
        var defaultBgGradient = localStorage.getItem('defaultBackgroundGradient');
        if (!defaultBgGradient) return;
        
        try {
            var parsedDefaultBg = JSON.parse(defaultBgGradient);
            if (!parsedDefaultBg || !parsedDefaultBg.gradient) return;
            
            var gradient = parsedDefaultBg.gradient;
            var isDynamic = parsedDefaultBg.isDynamic || false;
            var backgroundSize = parsedDefaultBg.backgroundSize || '100% 100%';
            var animation = parsedDefaultBg.animation || '';
            var hasParticles = parsedDefaultBg.particles || false;
            
            console.log('DEBUG - common.js applyDefaultGradientBackground:', {
                hasParticles: hasParticles,
                isDynamic: isDynamic,
                animation: animation,
                gradient: gradient ? 'set' : 'not set',
                rawData: localStorage.getItem('defaultBackgroundGradient')
            });
            
            var existingStyle = document.getElementById('custom-background-style');
            if (existingStyle) {
                existingStyle.remove();
            }
            
            var existingParticles = document.getElementById('global-particles-container');
            if (existingParticles) {
                existingParticles.remove();
            }
            
            document.body.style.background = gradient;
            document.body.style.backgroundSize = isDynamic ? backgroundSize : '100% 100%';
            document.body.style.backgroundPosition = isDynamic ? '0% 50%' : 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';
            
            if (isDynamic && animation) {
                document.body.style.animation = animation;
            } else {
                document.body.style.animation = '';
            }
            
            if (hasParticles) {
                var particlesContainer = document.createElement('div');
                particlesContainer.id = 'global-particles-container';
                particlesContainer.innerHTML = '<div class="particle p1"></div><div class="particle p2"></div><div class="particle p3"></div><div class="particle p4"></div><div class="particle p5"></div><div class="particle p6"></div>';
                document.body.appendChild(particlesContainer);
            }
            
            var style = document.createElement('style');
            style.id = 'custom-background-style';
            
            style.textContent = `
                body::before {
                    display: none !important;
                }
                
                body.dark-mode {
                    background: ${gradient} !important;
                    background-size: ${isDynamic ? backgroundSize : '100% 100%'} !important;
                    background-position: ${isDynamic ? '0% 50%' : 'center'} !important;
                    background-repeat: no-repeat !important;
                    background-attachment: fixed !important;
                    ${isDynamic && animation ? 'animation: ' + animation + ' !important;' : ''}
                }
                
                #global-particles-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    overflow: hidden;
                    z-index: 9998;
                }
                
                #global-particles-container .particle {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 50%;
                    animation: particleFloat linear infinite;
                    box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.4);
                }
                
                #global-particles-container .particle.p1 {
                    width: 6px;
                    height: 6px;
                    left: 20%;
                    top: 30%;
                    animation-duration: 4s;
                    animation-delay: 0s;
                }
                
                #global-particles-container .particle.p2 {
                    width: 8px;
                    height: 8px;
                    left: 60%;
                    top: 20%;
                    animation-duration: 5s;
                    animation-delay: 1s;
                }
                
                #global-particles-container .particle.p3 {
                    width: 5px;
                    height: 5px;
                    left: 80%;
                    top: 50%;
                    animation-duration: 3.5s;
                    animation-delay: 0.5s;
                }
                
                #global-particles-container .particle.p4 {
                    width: 6px;
                    height: 6px;
                    left: 10%;
                    top: 70%;
                    animation-duration: 4.5s;
                    animation-delay: 1.5s;
                }
                
                #global-particles-container .particle.p5 {
                    width: 6px;
                    height: 6px;
                    left: 40%;
                    top: 80%;
                    animation-duration: 3s;
                    animation-delay: 0.8s;
                }
                
                #global-particles-container .particle.p6 {
                    width: 5px;
                    height: 5px;
                    left: 70%;
                    top: 60%;
                    animation-duration: 5.5s;
                    animation-delay: 2s;
                }
                
                @keyframes monthlyShift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                
                @keyframes particleFloat {
                    0% {
                        transform: translateY(0) translateX(0) scale(1);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-60px) translateX(15px) scale(0.5);
                        opacity: 0;
                    }
                }
            `;
            
            document.head.appendChild(style);
        } catch (e) {
            console.error('加载默认渐变背景失败:', e);
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
