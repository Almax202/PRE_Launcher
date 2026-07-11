document.addEventListener('DOMContentLoaded', function() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.username) {
        window.location.href = '../index.html';
        return;
    }
    
    document.body.classList.add('page-transition-in');
    setTimeout(function() {
        document.body.classList.remove('page-transition-in');
    }, 500);
    
    SettingsManager.init();
    AccountLangManager.init();
    SettingsManager.initCardCollapse();
    loadUserInfo();
    initializeEventListeners();
    loadDeviceInfo();
    loadLoginHistory();
    
    checkOfflineModeAndDisableFeatures();
    
    updateExperimentalFeaturesState();
    
    function loadUserInfo() {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        if (user) {
            document.getElementById('sidebarUsername').textContent = user.username;
            document.getElementById('sidebarUid').textContent = 'UID: ' + (user.userId || '---');
            document.getElementById('accountUsername').value = user.username;
            document.getElementById('accountUid').value = user.userId || '---';
            
            if (user.createdAt) {
                document.getElementById('accountRegTime').value = formatDate(user.createdAt);
            }
            
            if (user.email) {
                document.getElementById('accountEmail').value = user.email;
                document.getElementById('bindEmailBtnText').textContent = '解绑';
                document.getElementById('emailVerificationStatus').style.display = 'flex';
            } else {
                document.getElementById('accountEmail').value = '';
                document.getElementById('bindEmailBtnText').textContent = '绑定';
                document.getElementById('emailVerificationStatus').style.display = 'none';
            }
            
            if (user.phone) {
                document.getElementById('accountPhone').value = user.phone;
                document.getElementById('bindPhoneBtnText').textContent = '解绑';
                document.getElementById('phoneVerificationStatus').style.display = 'flex';
            } else {
                document.getElementById('accountPhone').value = '';
                document.getElementById('bindPhoneBtnText').textContent = '绑定';
                document.getElementById('phoneVerificationStatus').style.display = 'none';
            }
            
            if (user.userProfile && user.userProfile.language) {
                SettingsManager.set('language', user.userProfile.language);
            }
            
            // 加载并显示头像
            updateAvatarDisplay();
            // 更新左上角头像
            updateSidebarAvatar(user);
            
            // 同步头像到其他页面
            syncAvatarToAllPages(user);
        }
        
        loadVersionInfo();
        
        var darkMode = SettingsManager.get('darkMode');
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        loadUserSettings();
        
        // 加载背景设置
        loadBackgroundSettings();
        
        checkDevModeStatus();
    }
    
    function checkDevModeStatus() {
        if (isDevModeEnabled()) {
            var toggleBtn = document.getElementById('toggleAllAchievementsBtn');
            if (toggleBtn) {
                toggleBtn.style.display = 'flex';
            }
            
            var devModeTitle = document.getElementById('devModeTitle');
            var devModeDesc = document.getElementById('devModeDesc');
            var devModeIcon = document.getElementById('devModeIcon');
            var devModeBtnText = document.getElementById('devModeBtnText');
            
            if (devModeTitle) devModeTitle.textContent = '退出开发者模式';
            if (devModeDesc) devModeDesc.textContent = '退出开发者模式将禁用高级功能';
            if (devModeIcon) devModeIcon.className = 'fas fa-power-off';
            if (devModeBtnText) devModeBtnText.textContent = '退出开发者模式';
            
            var devModeGroup = document.getElementById('devModeGroup');
            if (devModeGroup) {
                devModeGroup.style.display = 'block';
            }
        } else {
            var toggleBtn = document.getElementById('toggleAllAchievementsBtn');
            if (toggleBtn) {
                toggleBtn.style.display = 'none';
            }
            
            var devModeTitle = document.getElementById('devModeTitle');
            var devModeDesc = document.getElementById('devModeDesc');
            var devModeIcon = document.getElementById('devModeIcon');
            var devModeBtnText = document.getElementById('devModeBtnText');
            
            if (devModeTitle) devModeTitle.textContent = '开发者模式';
            if (devModeDesc) devModeDesc.textContent = '进入开发者模式以使用高级功能';
            if (devModeIcon) devModeIcon.className = 'fas fa-code';
            if (devModeBtnText) devModeBtnText.textContent = '进入开发者模式';
            
            var devModeGroup = document.getElementById('devModeGroup');
            if (devModeGroup) {
                devModeGroup.style.display = 'none';
            }
        }
    }
    
    function initializeEventListeners() {
        // 返回按钮点击事件
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', function() {
                goBack();
            });
        }
        
        // 移动端菜单按钮点击事件
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const settingsSidebar = document.querySelector('.settings-sidebar');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
        
        function toggleSidebar(show) {
            if (show) {
                settingsSidebar.classList.add('show');
                if (sidebarBackdrop) {
                    sidebarBackdrop.classList.add('show');
                }
                document.body.style.overflow = 'hidden';
            } else {
                settingsSidebar.classList.remove('show');
                if (sidebarBackdrop) {
                    sidebarBackdrop.classList.remove('show');
                }
                document.body.style.overflow = '';
            }
        }
        
        if (mobileMenuBtn && settingsSidebar) {
            // 点击菜单按钮切换侧边栏显示/隐藏
            mobileMenuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const isShowing = settingsSidebar.classList.contains('show');
                toggleSidebar(!isShowing);
            });
            
            // 点击菜单项后关闭侧边栏
            menuItems.forEach(function(item) {
                item.addEventListener('click', function() {
                    toggleSidebar(false);
                });
            });
            
            // 点击遮罩层关闭侧边栏
            if (sidebarBackdrop) {
                sidebarBackdrop.addEventListener('click', function() {
                    toggleSidebar(false);
                });
            }
            
            // 点击侧边栏外部关闭侧边栏
            document.addEventListener('click', function(e) {
                if (!settingsSidebar.contains(e.target) && !mobileMenuBtn.contains(e.target) && settingsSidebar.classList.contains('show')) {
                    toggleSidebar(false);
                }
            });
            
            // 阻止touchmove事件冒泡，防止mui.js阻止滚动
            settingsSidebar.addEventListener('touchmove', function(e) {
                e.stopPropagation();
            }, { passive: true });
            
            // 确保侧边栏显示时可以正常滚动
            settingsSidebar.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            }, { passive: true });
        }
        
        document.querySelectorAll('.menu-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var section = this.getAttribute('data-section');
                if (section === 'experimental') {
                    var isDisabled = localStorage.getItem('experimentalFeaturesDisabled') === 'true';
                    var hasRead = localStorage.getItem('experimentalWarningRead') === 'true';
                    
                    if (isDisabled || !hasRead) {
                        showExperimentalWarningModal();
                    } else {
                        switchSection('experimental');
                    }
                } else {
                    switchSection(section);
                }
            });
        });
        
        document.getElementById('editUsernameBtn').addEventListener('click', function() {
            showEditModal('username');
        });
        
        document.getElementById('copyUidBtn').addEventListener('click', function() {
            var uid = document.getElementById('accountUid').value;
            if (uid && uid !== '---') {
                navigator.clipboard.writeText(uid).then(function() {
                    showAlert('UID已复制到剪贴板');
                }).catch(function() {
                    showAlert('复制失败，请手动复制');
                });
            }
        });
        
        document.getElementById('copyRegTimeBtn').addEventListener('click', function() {
            var regTime = document.getElementById('accountRegTime').value;
            if (regTime && regTime !== '---') {
                navigator.clipboard.writeText(regTime).then(function() {
                    showAlert('注册时间已复制到剪贴板');
                }).catch(function() {
                    showAlert('复制失败，请手动复制');
                });
            }
        });
        
        document.getElementById('bindEmailBtn').addEventListener('click', function() {
            var currentEmail = document.getElementById('accountEmail').value;
            if (currentEmail && currentEmail !== '未绑定') {
                unbindContact('email');
            } else {
                showBindModal('email', '绑定邮箱', '请输入邮箱地址');
            }
        });
        
        document.getElementById('bindPhoneBtn').addEventListener('click', function() {
            var currentPhone = document.getElementById('accountPhone').value;
            if (currentPhone && currentPhone !== '未绑定') {
                unbindContact('phone');
            } else {
                showBindModal('phone', '绑定手机', '请输入手机号码');
            }
        });
        
        document.getElementById('accountBio').addEventListener('input', function() {
            updateBioCount();
        });
        
        document.querySelectorAll('.avatar-option').forEach(function(option) {
            option.addEventListener('click', function() {
                var avatar = this.getAttribute('data-avatar');
                updateAvatar(avatar);
                saveAvatar(avatar);
            });
        });
        
        document.getElementById('uploadAvatarBtn').addEventListener('click', function() {
            document.getElementById('avatarUpload').click();
        });
        
        document.getElementById('avatarUpload').addEventListener('change', function(e) {
            handleAvatarUpload(e);
        });
        
        document.getElementById('verifyPasswordBtn').addEventListener('click', function() {
            verifyPassword();
        });
        
        document.getElementById('setNewPasswordCancel').addEventListener('click', function() {
            hideSetNewPasswordModal();
        });
        
        document.getElementById('setNewPasswordConfirm').addEventListener('click', function() {
            updatePassword();
        });
        
        document.getElementById('passwordVerificationCancel').addEventListener('click', function() {
            hidePasswordVerificationModal();
        });
        
        document.getElementById('passwordVerificationConfirm').addEventListener('click', function() {
            verifyPasswordForAction();
        });
        
        document.getElementById('twoFactorAuthCancel').addEventListener('click', function() {
            hideTwoFactorAuthModal();
        });
        
        document.getElementById('twoFactorAuthConfirm').addEventListener('click', function() {
            setupTwoFactorAuth();
        });
        
        document.getElementById('changeTwoFactorPinBtn').addEventListener('click', function() {
            // 先验证PIN码
            showVerifyTwoFactorPinModal('changePin');
        });
        
        document.getElementById('updateSecurityQuestionsBtn').addEventListener('click', function() {
            // 先验证PIN码
            showVerifyTwoFactorPinModal('updateSecurityQuestions');
        });
        
        document.getElementById('verifyTwoFactorPinCancel').addEventListener('click', function() {
            hideVerifyTwoFactorPinModal();
        });
        
        document.getElementById('verifyTwoFactorPinConfirm').addEventListener('click', function() {
            verifyTwoFactorPin();
        });
        
        document.getElementById('changeTwoFactorPinCancel').addEventListener('click', function() {
            hideChangeTwoFactorPinModal();
        });
        
        document.getElementById('changeTwoFactorPinConfirm').addEventListener('click', function() {
            changeTwoFactorPin();
        });
        
        document.getElementById('updateSecurityQuestionsCancel').addEventListener('click', function() {
            hideUpdateSecurityQuestionsModal();
        });
        
        document.getElementById('updateSecurityQuestionsConfirm').addEventListener('click', function() {
            updateSecurityQuestions();
        });
        
        // 初始化两步验证状态（按用户隔离）
        var twoFactorEnabled = currentUser.twoFactorAuth && currentUser.twoFactorAuth.enabled;
        document.getElementById('twoFactorAuth').checked = twoFactorEnabled;
        if (twoFactorEnabled) {
            document.getElementById('twoFactorActions').style.display = 'block';
        }
        
        // 初始化登录PIN验证功能状态
        var loginPinAuthEnabled = currentUser.twoFactorAuth && currentUser.twoFactorAuth.loginPinEnabled;
        document.getElementById('loginPinAuth').checked = loginPinAuthEnabled;
        
        document.getElementById('loginPinAuth').addEventListener('change', function() {
            var enabled = this.checked;
            if (enabled && !twoFactorEnabled) {
                this.checked = false;
                showAlert('请先启用两步验证');
                return;
            }
            // 保存设置到twoFactorAuth对象中
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var userIndex = users.findIndex(function(user) {
                return user.username === currentUser.username;
            });
            if (userIndex !== -1) {
                if (!users[userIndex].twoFactorAuth) {
                    users[userIndex].twoFactorAuth = {};
                }
                users[userIndex].twoFactorAuth.loginPinEnabled = enabled;
                localStorage.setItem('registeredUsers', JSON.stringify(users));
            }
        });
        
        document.getElementById('twoFactorAuth').addEventListener('change', function() {
            var enabled = this.checked;
            if (enabled) {
                // 先重置为未选中状态，只有验证通过后才真正启用
                this.checked = false;
                // 启用两步验证，先验证账号密码
                showPasswordVerificationModal('twoFactorAuth');
            } else {
                // 先重置为选中状态，只有验证通过后才真正禁用
                this.checked = true;
                // 禁用两步验证，先验证PIN码
                showVerifyTwoFactorPinModal('disableTwoFactorAuth');
            }
        });
        
        document.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach(function(toggle) {
            toggle.addEventListener('change', function() {
                var setting = this.id;
                var value = this.checked;
                
                // 特殊处理GPU加速设置
                if (setting === 'gpuAcceleration' && value) {
                    showGpuAccelerationConfirmModal();
                } else {
                    saveSetting(setting, value);
                }
                
                // 页面时钟开关变化时更新子功能可见性
                if (setting === 'pageClockEnabled') {
                    updatePageClockSubFeaturesVisibility();
                    if (!value) {
                        saveSetting('pageClockTimedStart', false);
                        var timedStartToggle = document.getElementById('pageClockTimedStart');
                        if (timedStartToggle) {
                            timedStartToggle.checked = false;
                        }
                        updatePageClockSubFeaturesVisibility();
                    }
                }
                
                // 定时开启开关变化时更新选项可见性
                if (setting === 'pageClockTimedStart') {
                    updatePageClockSubFeaturesVisibility();
                }
            });
        });
        
        document.querySelectorAll('.volume-item input[type="range"]').forEach(function(slider) {
            slider.addEventListener('input', function() {
                var value = this.value;
                var valueSpan = this.nextElementSibling;
                valueSpan.textContent = value + '%';
            });
            
            // 添加change事件监听器，实现自动保存
            slider.addEventListener('change', function() {
                var setting = this.id;
                var value = parseInt(this.value);
                saveSetting(setting, value);
            });
        });
        
        // 定时开启时间输入框事件处理
        var timedStartMinutes = document.getElementById('timedStartMinutes');
        var timedStartSeconds = document.getElementById('timedStartSeconds');
        
        function validateTimedStartTime() {
            var minutes = parseInt(timedStartMinutes.value) || 0;
            var seconds = parseInt(timedStartSeconds.value) || 0;
            
            if (minutes < 0) minutes = 0;
            if (seconds < 0) seconds = 0;
            if (minutes > 59) minutes = 59;
            if (seconds > 59) seconds = 59;
            
            if (minutes === 0 && seconds === 0) {
                seconds = 1;
            }
            
            timedStartMinutes.value = minutes;
            timedStartSeconds.value = seconds;
            
            saveSetting('timedStartMinutes', minutes);
            saveSetting('timedStartSeconds', seconds);
        }
        
        if (timedStartMinutes) {
            timedStartMinutes.addEventListener('input', function() {
                var val = parseInt(this.value);
                if (val > 59) this.value = 59;
                if (val < 0) this.value = 0;
            });
            timedStartMinutes.addEventListener('change', validateTimedStartTime);
        }
        
        if (timedStartSeconds) {
            timedStartSeconds.addEventListener('input', function() {
                var val = parseInt(this.value);
                if (val > 59) this.value = 59;
                if (val < 0) this.value = 0;
            });
            timedStartSeconds.addEventListener('change', validateTimedStartTime);
        }
        
        document.querySelectorAll('.theme-option').forEach(function(option) {
            option.addEventListener('click', function() {
                if (this.id === 'moreThemesBtn') {
                    openMoreThemesModal();
                    return;
                }
                var theme = this.getAttribute('data-theme');
                setTheme(theme);
            });
        });

        // 更多主题弹窗事件绑定
        bindMoreThemesModal();
        bindThemeVersionModal();
        
        document.getElementById('languageSelect').addEventListener('change', function() {
            var language = this.value;
            setLanguage(language);
        });
        
        document.querySelectorAll('.color-mode-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.color-mode-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                var mode = this.getAttribute('data-mode');
                var rgbControls = document.getElementById('rgbControls');
                var paletteControls = document.getElementById('paletteControls');
                
                if (mode === 'rgb') {
                    rgbControls.style.display = 'flex';
                    paletteControls.style.display = 'none';
                } else {
                    rgbControls.style.display = 'none';
                    paletteControls.style.display = 'flex';
                }
            });
        });
        
        document.querySelectorAll('.color-swatch').forEach(function(swatch) {
            swatch.addEventListener('click', function() {
                document.querySelectorAll('.color-swatch').forEach(function(s) {
                    s.classList.remove('selected');
                });
                this.classList.add('selected');
                
                var color = this.getAttribute('data-color');
                document.getElementById('customColorPicker').value = color;
                updateThemePreview();
            });
        });
        
        document.getElementById('customColorPicker').addEventListener('input', function() {
            document.querySelectorAll('.color-swatch').forEach(function(s) {
                s.classList.remove('selected');
            });
            updateThemePreview();
        });
        
        document.getElementById('redSlider').addEventListener('input', function() {
            document.getElementById('redValue').textContent = this.value;
            updateThemePreview();
        });
        
        document.getElementById('greenSlider').addEventListener('input', function() {
            document.getElementById('greenValue').textContent = this.value;
            updateThemePreview();
        });
        
        document.getElementById('blueSlider').addEventListener('input', function() {
            document.getElementById('blueValue').textContent = this.value;
            updateThemePreview();
        });
        
        document.getElementById('opacitySlider').addEventListener('input', function() {
            document.getElementById('opacityValue').textContent = Math.round(this.value * 100) + '%';
            updateThemePreview();
        });
        
        document.getElementById('contrastSlider').addEventListener('input', function() {
            document.getElementById('contrastValue').textContent = Math.round(this.value * 100) + '%';
            updateThemePreview();
        });
        
        document.getElementById('applyCustomTheme').addEventListener('click', function() {
            applyCustomThemeSettings();
        });
        
        document.getElementById('resetCustomTheme').addEventListener('click', function() {
            resetCustomTheme();
        });
        
        // 毛玻璃主题设置事件监听器
        var glassOpacitySlider = document.getElementById('glassOpacitySlider');
        if (glassOpacitySlider) {
            glassOpacitySlider.addEventListener('input', function() {
                var value = this.value;
                document.getElementById('glassOpacityValue').textContent = Math.round(value * 100) + '%';
                updateGlassThemePreview();
            });
        }
        
        var glassBlurSlider = document.getElementById('glassBlurSlider');
        if (glassBlurSlider) {
            glassBlurSlider.addEventListener('input', function() {
                var value = this.value;
                document.getElementById('glassBlurValue').textContent = value + 'px';
                updateGlassThemePreview();
            });
        }
        
        // 毛玻璃主题按钮事件
        var applyGlassTheme = document.getElementById('applyGlassTheme');
        if (applyGlassTheme) {
            applyGlassTheme.addEventListener('click', function() {
                saveGlassTheme();
            });
        }
        
        var resetGlassThemeBtn = document.getElementById('resetGlassTheme');
        if (resetGlassThemeBtn) {
            resetGlassThemeBtn.addEventListener('click', function() {
                resetGlassTheme();
            });
        }
        
        // 自定义背景设置事件监听器
        document.getElementById('uploadBackgroundBtn').addEventListener('click', function() {
            document.getElementById('backgroundUpload').click();
        });
        
        document.getElementById('backgroundUpload').addEventListener('change', function(e) {
            handleBackgroundUpload(e);
        });
        
        document.getElementById('backgroundOpacity').addEventListener('input', function() {
            document.getElementById('opacityValue').textContent = Math.round(this.value * 100) + '%';
        });
        
        document.getElementById('backgroundBlur').addEventListener('input', function() {
            document.getElementById('blurValue').textContent = this.value + 'px';
        });
        
        document.getElementById('applyBackground').addEventListener('click', function() {
            saveBackgroundSettings();
        });
        
        document.getElementById('resetBackground').addEventListener('click', function() {
            resetBackgroundSettings();
        });
        
        // 预设背景功能事件监听器
        document.getElementById('presetBackgroundBtn').addEventListener('click', function() {
            openPresetBackgroundModal();
        });
        
        document.getElementById('closePresetModal').addEventListener('click', function() {
            closePresetBackgroundModal();
        });
        
        document.getElementById('presetBackgroundModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closePresetBackgroundModal();
            }
        });
        
        document.getElementById('presetSourceToggle').addEventListener('change', function(e) {
            switchPresetSource(e.target.checked);
        });
        
        document.getElementById('confirmPresetBtn').addEventListener('click', function() {
            confirmPresetBackground();
        });
        
        document.getElementById('cancelPresetBtn').addEventListener('click', function() {
            cancelPresetBackground();
        });
        
        initPresetBackgroundTouchSupport();
        
        document.getElementById('exportDataBtn').addEventListener('click', function() {
            // 清空密码输入框
            document.getElementById('verifyPassword').value = '';
            // 显示验证模态窗口
            document.getElementById('exportDataVerifyModal').style.display = 'flex';
            setTimeout(function() {
                document.getElementById('exportDataVerifyModal').classList.add('show');
            }, 100);
        });
        
        document.getElementById('importDataBtn').addEventListener('click', function() {
            // 显示导入数据模态窗口
            document.getElementById('importDataModal').style.display = 'flex';
            setTimeout(function() {
                document.getElementById('importDataModal').classList.add('show');
            }, 100);
        });
        
        document.getElementById('clearCacheBtn').addEventListener('click', function() {
            // 重置选择状态
            document.querySelectorAll('input[name="cacheOption"]').forEach(function(checkbox) {
                checkbox.checked = false;
                checkbox.disabled = false;
            });
            
            // 显示选择模态窗口
            document.getElementById('clearCacheSelectModal').style.display = 'flex';
            setTimeout(function() {
                document.getElementById('clearCacheSelectModal').classList.add('show');
            }, 100);
        });
        
        // 为清除全部数据选项添加事件监听器
        document.querySelector('input[name="cacheOption"][value="all"]').addEventListener('change', function() {
            var allCheckbox = this;
            document.querySelectorAll('input[name="cacheOption"]').forEach(function(checkbox) {
                if (checkbox.value !== 'all') {
                    checkbox.disabled = allCheckbox.checked;
                    if (allCheckbox.checked) {
                        checkbox.checked = false;
                    }
                }
            });
        });
        
        // 为其他选项添加事件监听器，确保与清除全部数据选项的互斥
        document.querySelectorAll('input[name="cacheOption"]').forEach(function(checkbox) {
            if (checkbox.value !== 'all') {
                checkbox.addEventListener('change', function() {
                    var allCheckbox = document.querySelector('input[name="cacheOption"][value="all"]');
                    if (this.checked) {
                        allCheckbox.checked = false;
                    }
                    
                    // 检查是否所有常规清理选项都被选中
                    var regularOptions = ['avatars', 'backgrounds', 'themes', 'loginHistory'];
                    var allRegularChecked = true;
                    regularOptions.forEach(function(option) {
                        var optionCheckbox = document.querySelector('input[name="cacheOption"][value="' + option + '"]');
                        if (!optionCheckbox.checked) {
                            allRegularChecked = false;
                        }
                    });
                    
                    // 如果所有常规清理选项都被选中，自动选中全部清理选项
                    if (allRegularChecked) {
                        allCheckbox.checked = true;
                        // 禁用所有常规清理选项
                        regularOptions.forEach(function(option) {
                            var optionCheckbox = document.querySelector('input[name="cacheOption"][value="' + option + '"]');
                            optionCheckbox.disabled = true;
                        });
                    } else {
                        // 如果不是所有常规清理选项都被选中，启用所有常规清理选项
                        regularOptions.forEach(function(option) {
                            var optionCheckbox = document.querySelector('input[name="cacheOption"][value="' + option + '"]');
                            optionCheckbox.disabled = false;
                        });
                    }
                });
            }
        });
        
        document.getElementById('deleteAccountBtn').addEventListener('click', function() {
            showDeleteAccountConfirmModal();
        });
        
        document.getElementById('logoutBtn').addEventListener('click', function() {
            showLogoutConfirmModal();
        });
        
        document.getElementById('resetSettingsBtn').addEventListener('click', function() {
            showResetSettingsConfirmModal();
        });
        
        document.getElementById('devModeBtn').addEventListener('click', function() {
            if (isDevModeEnabled()) {
                showExitDevModeConfirmModal();
            } else {
                showDevModeConfirmModal();
            }
        });
        
        document.getElementById('devModeConfirmCancel').addEventListener('click', function() {
            hideDevModeConfirmModal();
        });
        
        document.getElementById('devModeConfirmOk').addEventListener('click', function() {
            hideDevModeConfirmModal();
            showDevModePasswordModal();
        });
        
        document.getElementById('devModePasswordCancel').addEventListener('click', function() {
            hideDevModePasswordModal();
        });
        
        document.getElementById('devModePasswordConfirm').addEventListener('click', function() {
            var password = document.getElementById('devModePasswordInput').value;
            if (password === 'admin') {
                enableDevMode();
                hideDevModePasswordModal();
                showDevModeSuccessModal();
            } else {
                showAlert('密码错误');
                document.getElementById('devModePasswordInput').value = '';
            }
        });
        
        document.getElementById('devModeSuccessOk').addEventListener('click', function() {
            hideDevModeSuccessModal();
            location.reload();
        });
        
        document.getElementById('toggleAllAchievementsBtn').addEventListener('click', function() {
            showToggleAchievementsConfirmModal();
        });
        
        document.getElementById('toggleAchievementsCancel').addEventListener('click', function() {
            hideToggleAchievementsConfirmModal();
        });
        
        document.getElementById('toggleAchievementsConfirm').addEventListener('click', function() {
            hideToggleAchievementsConfirmModal();
            toggleAllAchievements();
        });
        
        document.getElementById('toggleAchievementsConfirmModal').addEventListener('click', function(e) {
            if (e.target === this) {
                hideToggleAchievementsConfirmModal();
            }
        });
        

        
        document.getElementById('exitDevModeCancel').addEventListener('click', function() {
            hideExitDevModeConfirmModal();
        });
        
        document.getElementById('exitDevModeConfirm').addEventListener('click', function() {
            hideExitDevModeConfirmModal();
            exitDevMode();
        });
        
        // 个人资料保存按钮
        document.getElementById('saveProfileBtn').addEventListener('click', function() {
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var userIndex = users.findIndex(function(user) {
                return user.username === currentUser.username;
            });
            
            if (userIndex !== -1) {
                if (!users[userIndex].userProfile) {
                    users[userIndex].userProfile = {};
                }
                
                var userProfile = users[userIndex].userProfile;
                var bio = document.getElementById('accountBio').value.trim();
                userProfile.bio = bio;
                
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                showAlert('个性签名已保存');
            }
        });
        
        // 保存头像设置按钮
        document.getElementById('saveAvatarBtn').addEventListener('click', function() {
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var userIndex = users.findIndex(function(user) {
                return user.username === currentUser.username;
            });
            
            if (userIndex !== -1) {
                if (!users[userIndex].userProfile) {
                    users[userIndex].userProfile = {};
                }
                
                // 头像设置已经在选择时自动保存，这里只需要显示提示
                showAlert('头像设置已保存');
            }
        });
        
        // 声音设置保存按钮
        document.getElementById('saveSoundBtn').addEventListener('click', function() {
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var userIndex = users.findIndex(function(user) {
                return user.username === currentUser.username;
            });
            
            if (userIndex !== -1) {
                if (!users[userIndex].userProfile) {
                    users[userIndex].userProfile = {};
                }
                
                var userProfile = users[userIndex].userProfile;
                userProfile.notificationVolume = parseInt(document.getElementById('notificationVolume').value);
                userProfile.messageVolume = parseInt(document.getElementById('messageVolume').value);
                
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                showAlert('声音设置已保存');
            }
        });
        
        document.getElementById('alertConfirm').addEventListener('click', function() {
            hideAlert();
        });
        
        document.getElementById('editCancel').addEventListener('click', function() {
            hideEditModal();
        });
        
        document.getElementById('editConfirm').addEventListener('click', function() {
            confirmEdit();
        });
        
        document.getElementById('bindCancel').addEventListener('click', function() {
            hideBindModal();
        });
        
        document.getElementById('bindConfirm').addEventListener('click', function() {
            confirmBind();
        });
        
        document.getElementById('termsActionBtn').addEventListener('click', function() {
            handleTermsAction();
        });
        
        document.getElementById('privacyActionBtn').addEventListener('click', function() {
            handlePrivacyAction();
        });
        
        initializeTermsNavigation();
        
        document.getElementById('termsAgreementCancel').addEventListener('click', function() {
            hideTermsAgreementModal();
        });
        
        document.getElementById('termsAgreementReject').addEventListener('click', function() {
            showRejectTermsConfirmModal();
        });
        
        document.getElementById('rejectTermsCancel').addEventListener('click', function() {
            hideRejectTermsConfirmModal();
        });
        
        document.getElementById('rejectTermsConfirm').addEventListener('click', function() {
            confirmRejectTerms();
        });
        
        document.getElementById('unbindCancel').addEventListener('click', function() {
            hideUnbindConfirmModal();
        });
        
        document.getElementById('unbindConfirm').addEventListener('click', function() {
            confirmUnbind();
        });
        
        document.getElementById('unbindConfirmModal').addEventListener('click', function(e) {
            if (e.target === this) {
                hideUnbindConfirmModal();
            }
        });
        
        document.getElementById('experimentalWarningCancel').addEventListener('click', function() {
            hideExperimentalWarningModal();
        });
        
        document.getElementById('experimentalWarningConfirm').addEventListener('click', function() {
            hideExperimentalWarningModal();
            localStorage.setItem('experimentalWarningRead', 'true');
            localStorage.removeItem('experimentalFeaturesDisabled');
            switchSection('experimental');
            updateExperimentalFeaturesState();
        });
        
        document.getElementById('experimentalWarningModal').addEventListener('click', function(e) {
            if (e.target === this) {
                hideExperimentalWarningModal();
            }
        });
        
        var disableBtn = document.getElementById('disableExperimentalBtn');
        if (disableBtn) {
            disableBtn.addEventListener('click', function() {
                var isDisabled = localStorage.getItem('experimentalFeaturesDisabled') === 'true';
                if (isDisabled) {
                    showExperimentalWarningModal();
                } else {
                    showDisableExperimentalConfirmModal();
                }
            });
        }
        
        var disableCancel = document.getElementById('disableExperimentalCancel');
        if (disableCancel) {
            disableCancel.addEventListener('click', function() {
                hideDisableExperimentalConfirmModal();
            });
        }
        
        var disableConfirm = document.getElementById('disableExperimentalConfirm');
        if (disableConfirm) {
            disableConfirm.addEventListener('click', function() {
                disableAllExperimentalFeatures();
                hideDisableExperimentalConfirmModal();
            });
        }
        
        var disableModal = document.getElementById('disableExperimentalConfirmModal');
        if (disableModal) {
            disableModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    hideDisableExperimentalConfirmModal();
                }
            });
        }
    }
    
    function showExperimentalWarningModal() {
        var modal = document.getElementById('experimentalWarningModal');
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideExperimentalWarningModal() {
        var modal = document.getElementById('experimentalWarningModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function showDisableExperimentalConfirmModal() {
        var modal = document.getElementById('disableExperimentalConfirmModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(function() {
                modal.classList.add('show');
            }, 10);
        }
    }
    
    function hideDisableExperimentalConfirmModal() {
        var modal = document.getElementById('disableExperimentalConfirmModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(function() {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    function disableAllExperimentalFeatures() {
        localStorage.setItem('experimentalFeaturesDisabled', 'true');
        updateExperimentalFeaturesState();
    }
    
    function updateExperimentalFeaturesState() {
        var isDisabled = localStorage.getItem('experimentalFeaturesDisabled') === 'true';
        var hasRead = localStorage.getItem('experimentalWarningRead') === 'true';
        
        var featureItems = document.querySelectorAll('#section-experimental .two-factor-item');
        featureItems.forEach(function(item) {
            if (isDisabled) {
                item.classList.add('experimental-feature-disabled');
            } else {
                item.classList.remove('experimental-feature-disabled');
            }
        });
        
        var emptyState = document.getElementById('experimentalEmptyState');
        if (emptyState) {
            if (featureItems.length === 0) {
                emptyState.style.display = 'flex';
            } else {
                emptyState.style.display = 'none';
            }
        }
        
        var disableBtn = document.getElementById('disableExperimentalBtn');
        if (disableBtn) {
            if (isDisabled) {
                disableBtn.innerHTML = '<i class="fas fa-redo"></i><span>重新启用实验性功能</span>';
                disableBtn.style.backgroundColor = '#4CAF50';
            } else {
                disableBtn.innerHTML = '<i class="fas fa-ban"></i><span>禁用实验性功能</span>';
                disableBtn.style.backgroundColor = '';
            }
        }
    }
    
    function switchSection(sectionId) {
        document.querySelectorAll('.menu-item').forEach(function(item) {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            }
        });
        
        document.querySelectorAll('.settings-section').forEach(function(section) {
            section.classList.remove('active');
        });
        
        var targetSection = document.getElementById('section-' + sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            

            
            var texts = AccountLangManager.getLanguageMap();
            var titles = {
                'account': { title: texts.accountInfo, desc: texts.accountInfoDesc },
                'security': { title: texts.password, desc: texts.passwordDesc },
                'privacy': { title: texts.visibility, desc: texts.visibilityDesc },
                'game-stats': { title: texts.gameStats, desc: texts.gameStatsDesc },
                'achievements': { title: texts.achievements, desc: texts.achievementsDesc },
                'notifications': { title: texts.notifications, desc: texts.notificationsDesc },
                'devices': { title: texts.devices, desc: texts.devicesDesc },
                'advanced': { title: texts.theme, desc: texts.themeDesc },
                'enhanced-features': { title: '增强功能', desc: '扩展界面功能和体验' },
                'account-management': { title: texts.data, desc: texts.dataDesc },
                'terms': { title: texts.terms, desc: texts.termsDesc },
                'privacy-policy': { title: texts.privacyPolicy, desc: texts.privacyPolicyDesc },
                'test': { title: texts.testPage || '测试页面', desc: texts.testPageDesc || '用于测试主题适配性、按钮风格统一度以及各种测试案例' },
                'experimental': { title: '实验性功能', desc: '探索并启用处于测试阶段的新功能' }
            };
            
            if (titles[sectionId]) {
                document.getElementById('settingsTitle').textContent = titles[sectionId].title;
                document.getElementById('settingsDesc').textContent = titles[sectionId].desc;
            }
            
            if (sectionId === 'game-stats') {
                loadGameStats();
            }
            
            if (sectionId === 'achievements') {
                loadGameStats();
            }
            
            setTimeout(function() {
                SettingsManager.updateCardHeights();
            }, 50);
        }
    }
    
    function showEditModal(field) {
        var modal = document.getElementById('editModal');
        var title = document.getElementById('editModalTitle');
        var input = document.getElementById('editInput');
        
        if (field === 'username') {
            title.textContent = '修改用户名';
            input.value = document.getElementById('accountUsername').value;
            input.setAttribute('data-field', 'username');
        }
        
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideEditModal() {
        var modal = document.getElementById('editModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function confirmEdit() {
        var input = document.getElementById('editInput');
        var field = input.getAttribute('data-field');
        var value = input.value.trim();
        
        if (!value) {
            showAlert('请输入有效值');
            return;
        }
        
        if (field === 'username') {
            if (value.length < 3) {
                showAlert('用户名至少3个字符');
                return;
            }
            
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var existingUser = users.find(function(user) {
                return user.username === value && user.username !== currentUser.username;
            });
            
            if (existingUser) {
                showAlert('用户名已存在');
                return;
            }
            
            var userIndex = users.findIndex(function(user) {
                return user.username === currentUser.username;
            });
            
            if (userIndex !== -1) {
                users[userIndex].username = value;
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                
                currentUser.username = value;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                document.getElementById('accountUsername').value = value;
                document.getElementById('sidebarUsername').textContent = value;
                
                showAlert('用户名修改成功');
            }
        }
        
        hideEditModal();
    }
    
    function showBindModal(type, title, placeholder) {
        var modal = document.getElementById('bindModal');
        var modalTitle = document.getElementById('bindModalTitle');
        var input = document.getElementById('bindInput');
        var icon = modal.querySelector('.alert-icon i');
        
        modalTitle.textContent = title;
        input.value = '';
        input.placeholder = placeholder;
        input.setAttribute('data-type', type);
        
        if (type === 'email') {
            icon.className = 'fas fa-envelope';
            input.type = 'email';
        } else if (type === 'phone') {
            icon.className = 'fas fa-mobile-alt';
            input.type = 'tel';
        }
        
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideBindModal() {
        var modal = document.getElementById('bindModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function confirmBind() {
        var input = document.getElementById('bindInput');
        var type = input.getAttribute('data-type');
        var value = input.value.trim();
        
        if (!value) {
            showAlert('请输入有效值');
            return;
        }
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex === -1) {
            return;
        }
        
        if (type === 'email') {
            if (!validateEmail(value)) {
                showAlert('邮箱格式不正确');
                return;
            }
            
            users[userIndex].email = value;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            document.getElementById('accountEmail').value = value;
            document.getElementById('bindEmailBtnText').textContent = '解绑';
            document.getElementById('emailVerificationStatus').style.display = 'flex';
            
            showAlert('邮箱绑定成功');
        } else if (type === 'phone') {
            if (!validatePhone(value)) {
                showAlert('手机号格式不正确');
                return;
            }
            
            users[userIndex].phone = value;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            document.getElementById('accountPhone').value = value;
            document.getElementById('bindPhoneBtnText').textContent = '解绑';
            document.getElementById('phoneVerificationStatus').style.display = 'flex';
            
            showAlert('手机号绑定成功');
        }
        
        hideBindModal();
    }
    
    function unbindContact(type) {
        showUnbindConfirmModal(type);
    }
    
    function showUnbindConfirmModal(type) {
        var modal = document.getElementById('unbindConfirmModal');
        
        fetchUnbindCaptcha();
        document.getElementById('unbindCaptchaInput').value = '';
        modal.dataset.unbindType = type;
        
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    var isUnbindCaptchaLoading = false;
    var unbindCaptchaRetryCount = 0;
    var unbindCaptchaCode = '';
    
    function fetchUnbindCaptcha(event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        if (isUnbindCaptchaLoading) return;
        
        var isOfflineMode = localStorage.getItem('offlineMode') === 'true';
        
        if (isOfflineMode) {
            generateLocalUnbindCaptcha();
        } else {
            fetchRemoteUnbindCaptcha();
        }
    }
    
    function generateLocalUnbindCaptcha() {
        var captchaEl = document.getElementById('unbindCaptchaImage');
        isUnbindCaptchaLoading = true;
        captchaEl.innerHTML = '<span class="captcha-text" style="pointer-events: none;">加载中...</span>';
        
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var code = '';
        for (var i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        var colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'];
        
        var fontSize = 20 + Math.floor(Math.random() * 8);
        var rotateDeg = (Math.random() - 0.5) * 10;
        
        var captchaHtml = '';
        for (var i = 0; i < code.length; i++) {
            var charRotate = (Math.random() - 0.5) * 15;
            var charColor = colors[Math.floor(Math.random() * colors.length)];
            captchaHtml += '<span style="display: inline-block; transform: rotate(' + charRotate + 'deg); color: ' + charColor + '; font-size: ' + fontSize + 'px; font-weight: bold; margin: 0 2px; font-family: Arial, sans-serif;">' + code[i] + '</span>';
        }
        
        setTimeout(function() {
            captchaEl.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; letter-spacing: 5px; transform: rotate(' + rotateDeg + 'deg);">' + captchaHtml + '</div>';
            captchaEl.addEventListener('click', function(e) {
                fetchUnbindCaptcha(e);
            });
            unbindCaptchaCode = code;
            isUnbindCaptchaLoading = false;
        }, 100);
    }
    
    function fetchRemoteUnbindCaptcha() {
        if (!navigator.onLine) {
            var captchaEl = document.getElementById('unbindCaptchaImage');
            captchaEl.innerHTML = '<span class="captcha-text" style="pointer-events: none; color: #ff6b6b;">无网络连接</span>';
            captchaEl.addEventListener('click', function(e) {
                fetchUnbindCaptcha(e);
            });
            unbindCaptchaCode = '';
            return;
        }
        
        if (unbindCaptchaRetryCount >= 3) {
            console.error('验证码获取失败次数过多，已停止重试');
            var captchaEl = document.getElementById('unbindCaptchaImage');
            captchaEl.innerHTML = '<span class="captcha-text" style="pointer-events: none;">获取失败<br>点击刷新</span>';
            captchaEl.addEventListener('click', function(e) {
                fetchUnbindCaptcha(e);
            });
            return;
        }
        
        var captchaEl = document.getElementById('unbindCaptchaImage');
        isUnbindCaptchaLoading = true;
        unbindCaptchaRetryCount++;
        captchaEl.innerHTML = '<span class="captcha-text" style="pointer-events: none;">加载中...</span>';
        
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var code = '';
        for (var i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        var timestamp = Date.now();
        var colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'];
        var randomColor = colors[Math.floor(Math.random() * colors.length)];
        var imageUrl = 'https://dummyimage.com/120x45/' + randomColor.substring(1) + '/ffffff&text=' + code + '&t=' + timestamp;
        
        var img = new Image();
        img.onload = function() {
            captchaEl.innerHTML = '<img src="' + imageUrl + '" alt="验证码" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;">';
            captchaEl.addEventListener('click', function(e) {
                fetchUnbindCaptcha(e);
            });
            unbindCaptchaCode = code;
            isUnbindCaptchaLoading = false;
            unbindCaptchaRetryCount = 0;
        };
        img.onerror = function() {
            console.error('验证码图片加载失败，切换到本地生成');
            generateLocalUnbindCaptcha();
        };
        img.src = imageUrl;
    }
    
    function hideUnbindConfirmModal() {
        var modal = document.getElementById('unbindConfirmModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    // GPU加速确认模态框
    function showGpuAccelerationConfirmModal() {
        var modal = document.getElementById('gpuAccelerationModal');
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideGpuAccelerationConfirmModal() {
        var modal = document.getElementById('gpuAccelerationModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    // GPU加速确认按钮事件
    document.getElementById('gpuAccelerationCancel').addEventListener('click', function() {
        hideGpuAccelerationConfirmModal();
        document.getElementById('gpuAcceleration').checked = false;
    });
    
    document.getElementById('gpuAccelerationConfirm').addEventListener('click', function() {
        hideGpuAccelerationConfirmModal();
        saveSetting('gpuAcceleration', true);
    });
    
    // 点击模态框外部关闭
    document.getElementById('gpuAccelerationModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideGpuAccelerationConfirmModal();
            document.getElementById('gpuAcceleration').checked = false;
        }
    });
    
    function confirmUnbind() {
        var modal = document.getElementById('unbindConfirmModal');
        var type = modal.dataset.unbindType;
        var inputCode = document.getElementById('unbindCaptchaInput').value.toUpperCase();
        
        if (!inputCode) {
            showAlert('请输入验证码');
            return;
        }
        
        if (inputCode !== unbindCaptchaCode) {
            showAlert('验证码错误，请重新输入');
            fetchUnbindCaptcha();
            return;
        }
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex === -1) {
            return;
        }
        
        if (type === 'email') {
            delete users[userIndex].email;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            document.getElementById('accountEmail').value = '';
            document.getElementById('bindEmailBtnText').textContent = '绑定';
            document.getElementById('emailVerificationStatus').style.display = 'none';
            
            showAlert('邮箱解绑成功');
        } else if (type === 'phone') {
            delete users[userIndex].phone;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            document.getElementById('accountPhone').value = '';
            document.getElementById('bindPhoneBtnText').textContent = '绑定';
            document.getElementById('phoneVerificationStatus').style.display = 'none';
            
            showAlert('手机号解绑成功');
        }
        
        hideUnbindConfirmModal();
    }
    
    function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        var re = /^1[3-9]\d{9}$/;
        return re.test(phone);
    }
    
    function verifyPassword() {
        var currentPassword = document.getElementById('currentPassword').value;
        
        if (!currentPassword) {
            showAlert('请输入当前密码');
            return;
        }
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex === -1) {
            showAlert('用户不存在');
            return;
        }
        
        if (users[userIndex].password !== currentPassword) {
            showAlert('当前密码错误');
            return;
        }
        
        // 验证通过，显示设置新密码模态框
        showSetNewPasswordModal();
    }
    
    function showSetNewPasswordModal() {
        var modal = document.getElementById('setNewPasswordModal');
        var newPasswordInput = document.getElementById('newPassword');
        var confirmNewPasswordInput = document.getElementById('confirmNewPassword');
        
        // 清空输入框
        newPasswordInput.value = '';
        confirmNewPasswordInput.value = '';
        
        // 显示模态框
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideSetNewPasswordModal() {
        var modal = document.getElementById('setNewPasswordModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function updatePassword() {
        var newPassword = document.getElementById('newPassword').value;
        var confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        if (!newPassword) {
            showAlert('请输入新密码');
            return;
        }
        
        if (newPassword.length < 6) {
            showAlert('新密码至少6个字符');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            showAlert('两次输入的密码不一致');
            return;
        }
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex === -1) {
            showAlert('用户不存在');
            return;
        }
        
        // 更新密码
        users[userIndex].password = newPassword;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // 清空输入框
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        
        // 隐藏模态框
        hideSetNewPasswordModal();
        
        // 显示成功提示
        showAlert('密码修改成功');
    }
    
    // 显示密码验证模态框
    function showPasswordVerificationModal(action) {
        var modal = document.getElementById('passwordVerificationModal');
        var passwordInput = document.getElementById('verificationPassword');
        
        // 清空输入框
        passwordInput.value = '';
        
        // 存储要执行的操作
        window.verificationAction = action;
        
        // 显示模态框
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    // 隐藏密码验证模态框
    function hidePasswordVerificationModal() {
        var modal = document.getElementById('passwordVerificationModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
        
        // 重置两步验证复选框状态
        resetTwoFactorCheckbox();
    }
    
    // 重置两步验证复选框状态（按用户隔离）
    function resetTwoFactorCheckbox() {
        var twoFactorEnabled = currentUser.twoFactorAuth && currentUser.twoFactorAuth.enabled;
        document.getElementById('twoFactorAuth').checked = twoFactorEnabled;
    }
    
    // 验证密码并执行相应操作
    function verifyPasswordForAction() {
        var password = document.getElementById('verificationPassword').value;
        
        if (!password) {
            showAlert('请输入密码');
            resetTwoFactorCheckbox();
            return;
        }
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex === -1) {
            showAlert('用户不存在');
            resetTwoFactorCheckbox();
            return;
        }
        
        if (users[userIndex].password !== password) {
            showAlert('密码错误');
            resetTwoFactorCheckbox();
            return;
        }
        
        // 隐藏密码验证模态框
        hidePasswordVerificationModal();
        
        // 执行相应操作
        if (window.verificationAction === 'twoFactorAuth') {
            showTwoFactorAuthModal();
        }
    }
    
    // 显示两步验证设置模态框
    function showTwoFactorAuthModal() {
        var modal = document.getElementById('twoFactorAuthModal');
        
        // 清空输入框
        document.getElementById('twoFactorPin').value = '';
        document.getElementById('confirmTwoFactorPin').value = '';
        document.getElementById('securityQuestion1').value = '';
        document.getElementById('securityAnswer1').value = '';
        document.getElementById('securityQuestion2').value = '';
        document.getElementById('securityAnswer2').value = '';
        document.getElementById('securityQuestion3').value = '';
        document.getElementById('securityAnswer3').value = '';
        
        // 重置所有下拉菜单的选项
        resetSecurityQuestionOptions();
        
        // 添加事件监听器
        addSecurityQuestionEventListeners();
        
        // 添加PIN码输入限制
        addPinInputRestrictions();
        
        // 显示模态框
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    // 重置安全问题下拉菜单的选项
    function resetSecurityQuestionOptions() {
        var allQuestions = [
            "您的宠物名字叫什么",
            "您的小学老师叫什么",
            "您的初中老师叫什么",
            "您的高中老师叫什么",
            "您的出生地在哪",
            "您小时候的昵称是什么",
            "您的父亲名字叫什么",
            "您的母亲名字叫什么",
            "您的第一个学校叫什么"
        ];
        
        var selectElements = [
            document.getElementById('securityQuestion1'),
            document.getElementById('securityQuestion2'),
            document.getElementById('securityQuestion3')
        ];
        
        selectElements.forEach(function(select) {
            // 清空现有选项
            select.innerHTML = '<option value="">请选择安全问题</option>';
            
            // 添加所有选项
            allQuestions.forEach(function(question) {
                var option = document.createElement('option');
                option.value = question;
                option.textContent = question;
                select.appendChild(option);
            });
        });
    }
    
    // 添加安全问题下拉菜单的事件监听器
    function addSecurityQuestionEventListeners() {
        var selectElements = [
            document.getElementById('securityQuestion1'),
            document.getElementById('securityQuestion2'),
            document.getElementById('securityQuestion3')
        ];
        
        selectElements.forEach(function(select) {
            select.addEventListener('change', function() {
                updateSecurityQuestionOptions();
            });
        });
    }
    
    // 更新安全问题下拉菜单的选项
    function updateSecurityQuestionOptions() {
        var selectedQuestions = [];
        
        // 收集已选择的问题
        var selectElements = [
            document.getElementById('securityQuestion1'),
            document.getElementById('securityQuestion2'),
            document.getElementById('securityQuestion3')
        ];
        
        selectElements.forEach(function(select) {
            if (select.value) {
                selectedQuestions.push(select.value);
            }
        });
        
        // 更新每个下拉菜单的选项
        selectElements.forEach(function(select) {
            var currentValue = select.value;
            
            // 保存当前选项
            var savedValue = select.value;
            
            // 清空现有选项
            select.innerHTML = '<option value="">请选择安全问题</option>';
            
            // 添加所有选项，禁用已选择的选项
            var allQuestions = [
                "您的宠物名字叫什么",
                "您的小学老师叫什么",
                "您的初中老师叫什么",
                "您的高中老师叫什么",
                "您的出生地在哪",
                "您小时候的昵称是什么",
                "您的父亲名字叫什么",
                "您的母亲名字叫什么",
                "您的第一个学校叫什么"
            ];
            
            allQuestions.forEach(function(question) {
                var option = document.createElement('option');
                option.value = question;
                option.textContent = question;
                
                // 如果问题已经被其他下拉菜单选择，则禁用
                if (selectedQuestions.includes(question) && question !== currentValue) {
                    option.disabled = true;
                }
                
                select.appendChild(option);
            });
            
            // 恢复当前选项
            select.value = savedValue;
        });
    }
    
    // 隐藏两步验证设置模态框
    function hideTwoFactorAuthModal() {
        var modal = document.getElementById('twoFactorAuthModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    // 设置两步验证
    function setupTwoFactorAuth() {
        var pin = document.getElementById('twoFactorPin').value;
        var confirmPin = document.getElementById('confirmTwoFactorPin').value;
        var question1 = document.getElementById('securityQuestion1').value;
        var answer1 = document.getElementById('securityAnswer1').value;
        var question2 = document.getElementById('securityQuestion2').value;
        var answer2 = document.getElementById('securityAnswer2').value;
        var question3 = document.getElementById('securityQuestion3').value;
        var answer3 = document.getElementById('securityAnswer3').value;
        
        if (!pin) {
            showAlert('请输入PIN码');
            return;
        }
        
        if (pin.length < 6) {
            showAlert('PIN码至少6位');
            return;
        }
        
        if (pin !== confirmPin) {
            showAlert('两次输入的PIN码不一致');
            return;
        }
        
        if (!question1 || !answer1 || !question2 || !answer2 || !question3 || !answer3) {
            showAlert('请选择所有安全问题并填写答案');
            return;
        }
        
        // 保存两步验证信息到用户对象
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(u) {
            return u.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            users[userIndex].twoFactorAuth = {
                enabled: true,
                pin: pin,
                securityQuestions: {
                    question1: question1,
                    answer1: answer1,
                    question2: question2,
                    answer2: answer2,
                    question3: question3,
                    answer3: answer3
                }
            };
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            // 更新当前用户对象
            currentUser.twoFactorAuth = users[userIndex].twoFactorAuth;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // 隐藏模态框
        hideTwoFactorAuthModal();
        
        // 设置复选框为选中状态
        document.getElementById('twoFactorAuth').checked = true;
        
        // 显示两步验证操作按钮
        document.getElementById('twoFactorActions').style.display = 'block';
        
        // 显示成功提示
        showAlert('两步验证已启用');
    }
    
    // 显示更改PIN码模态框
    function showChangeTwoFactorPinModal() {
        var modal = document.getElementById('changeTwoFactorPinModal');
        
        // 清空输入框
        document.getElementById('currentTwoFactorPin').value = '';
        document.getElementById('newTwoFactorPin').value = '';
        document.getElementById('confirmNewTwoFactorPin').value = '';
        
        // 添加PIN码输入限制
        addChangePinInputRestrictions();
        
        // 显示模态框
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    // 隐藏更改PIN码模态框
    function hideChangeTwoFactorPinModal() {
        var modal = document.getElementById('changeTwoFactorPinModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    // 更改PIN码
    function changeTwoFactorPin() {
        var currentPin = document.getElementById('currentTwoFactorPin').value;
        var newPin = document.getElementById('newTwoFactorPin').value;
        var confirmNewPin = document.getElementById('confirmNewTwoFactorPin').value;
        
        if (!currentPin) {
            showAlert('请输入当前PIN码');
            return;
        }
        
        if (!newPin) {
            showAlert('请输入新PIN码');
            return;
        }
        
        if (newPin.length < 6) {
            showAlert('新PIN码至少6位');
            return;
        }
        
        if (newPin !== confirmNewPin) {
            showAlert('两次输入的新PIN码不一致');
            return;
        }
        
        // 验证当前PIN码（按用户隔离）
        var storedPin = currentUser.twoFactorAuth && currentUser.twoFactorAuth.pin;
        if (storedPin !== currentPin) {
            showAlert('当前PIN码错误');
            return;
        }
        
        // 更新PIN码（按用户隔离）
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(u) {
            return u.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            users[userIndex].twoFactorAuth.pin = newPin;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            // 更新当前用户对象
            currentUser.twoFactorAuth.pin = newPin;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // 隐藏模态框
        hideChangeTwoFactorPinModal();
        
        // 显示成功提示
        showAlert('PIN码已更改');
    }
    
    // 显示更新安全问题模态框
    function showUpdateSecurityQuestionsModal() {
        var modal = document.getElementById('updateSecurityQuestionsModal');
        
        // 清空输入框
        document.getElementById('updateSecurityQuestion1').value = '';
        document.getElementById('updateSecurityAnswer1').value = '';
        document.getElementById('updateSecurityQuestion2').value = '';
        document.getElementById('updateSecurityAnswer2').value = '';
        document.getElementById('updateSecurityQuestion3').value = '';
        document.getElementById('updateSecurityAnswer3').value = '';
        
        // 重置所有下拉菜单的选项
        resetUpdateSecurityQuestionOptions();
        
        // 添加事件监听器
        addUpdateSecurityQuestionEventListeners();
        
        // 显示模态框
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    // 隐藏更新安全问题模态框
    function hideUpdateSecurityQuestionsModal() {
        var modal = document.getElementById('updateSecurityQuestionsModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    // 重置更新安全问题下拉菜单的选项
    function resetUpdateSecurityQuestionOptions() {
        var allQuestions = [
            "您的宠物名字叫什么",
            "您的小学老师叫什么",
            "您的初中老师叫什么",
            "您的高中老师叫什么",
            "您的出生地在哪",
            "您小时候的昵称是什么",
            "您的父亲名字叫什么",
            "您的母亲名字叫什么",
            "您的第一个学校叫什么"
        ];
        
        var selectElements = [
            document.getElementById('updateSecurityQuestion1'),
            document.getElementById('updateSecurityQuestion2'),
            document.getElementById('updateSecurityQuestion3')
        ];
        
        selectElements.forEach(function(select) {
            // 清空现有选项
            select.innerHTML = '<option value="">请选择安全问题</option>';
            
            // 添加所有选项
            allQuestions.forEach(function(question) {
                var option = document.createElement('option');
                option.value = question;
                option.textContent = question;
                select.appendChild(option);
            });
        });
    }
    
    // 添加更新安全问题下拉菜单的事件监听器
    function addUpdateSecurityQuestionEventListeners() {
        var selectElements = [
            document.getElementById('updateSecurityQuestion1'),
            document.getElementById('updateSecurityQuestion2'),
            document.getElementById('updateSecurityQuestion3')
        ];
        
        selectElements.forEach(function(select) {
            select.addEventListener('change', function() {
                updateUpdateSecurityQuestionOptions();
            });
        });
    }
    
    // 更新更新安全问题下拉菜单的选项
    function updateUpdateSecurityQuestionOptions() {
        var selectedQuestions = [];
        
        // 收集已选择的问题
        var selectElements = [
            document.getElementById('updateSecurityQuestion1'),
            document.getElementById('updateSecurityQuestion2'),
            document.getElementById('updateSecurityQuestion3')
        ];
        
        selectElements.forEach(function(select) {
            if (select.value) {
                selectedQuestions.push(select.value);
            }
        });
        
        // 更新每个下拉菜单的选项
        selectElements.forEach(function(select) {
            var currentValue = select.value;
            
            // 保存当前选项
            var savedValue = select.value;
            
            // 清空现有选项
            select.innerHTML = '<option value="">请选择安全问题</option>';
            
            // 添加所有选项，禁用已选择的选项
            var allQuestions = [
                "您的宠物名字叫什么",
                "您的小学老师叫什么",
                "您的初中老师叫什么",
                "您的高中老师叫什么",
                "您的出生地在哪",
                "您小时候的昵称是什么",
                "您的父亲名字叫什么",
                "您的母亲名字叫什么",
                "您的第一个学校叫什么"
            ];
            
            allQuestions.forEach(function(question) {
                var option = document.createElement('option');
                option.value = question;
                option.textContent = question;
                
                // 如果问题已经被其他下拉菜单选择，则禁用
                if (selectedQuestions.includes(question) && question !== currentValue) {
                    option.disabled = true;
                }
                
                select.appendChild(option);
            });
            
            // 恢复当前选项
            select.value = savedValue;
        });
    }
    
    // 更新安全问题
    function updateSecurityQuestions() {
        var question1 = document.getElementById('updateSecurityQuestion1').value;
        var answer1 = document.getElementById('updateSecurityAnswer1').value;
        var question2 = document.getElementById('updateSecurityQuestion2').value;
        var answer2 = document.getElementById('updateSecurityAnswer2').value;
        var question3 = document.getElementById('updateSecurityQuestion3').value;
        var answer3 = document.getElementById('updateSecurityAnswer3').value;
        
        if (!question1 || !answer1 || !question2 || !answer2 || !question3 || !answer3) {
            showAlert('请选择所有安全问题并填写答案');
            return;
        }
        
        // 保存安全问题
        var securityQuestions = {
            question1: question1,
            answer1: answer1,
            question2: question2,
            answer2: answer2,
            question3: question3,
            answer3: answer3
        };
        localStorage.setItem('securityQuestions', JSON.stringify(securityQuestions));
        
        // 隐藏模态框
        hideUpdateSecurityQuestionsModal();
        
        // 显示成功提示
        showAlert('安全问题已更新');
    }
    
    // 显示验证PIN码模态框
    function showVerifyTwoFactorPinModal(action) {
        var modal = document.getElementById('verifyTwoFactorPinModal');
        
        // 清空输入框
        document.getElementById('verifyTwoFactorPin').value = '';
        
        // 存储要执行的操作
        window.verifyAction = action;
        
        // 显示模态框
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    // 隐藏验证PIN码模态框
    function hideVerifyTwoFactorPinModal() {
        var modal = document.getElementById('verifyTwoFactorPinModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    // 验证PIN码（按用户隔离）
    function verifyTwoFactorPin() {
        var pin = document.getElementById('verifyTwoFactorPin').value;
        
        if (!pin) {
            showAlert('请输入PIN码');
            return;
        }
        
        // 验证PIN码（按用户隔离）
        var storedPin = currentUser.twoFactorAuth && currentUser.twoFactorAuth.pin;
        if (storedPin !== pin) {
            showAlert('PIN码错误');
            return;
        }
        
        // 隐藏验证PIN码模态框
        hideVerifyTwoFactorPinModal();
        
        // 执行相应操作
        if (window.verifyAction === 'changePin') {
            showChangeTwoFactorPinModal();
        } else if (window.verifyAction === 'updateSecurityQuestions') {
            showUpdateSecurityQuestionsModal();
        } else if (window.verifyAction === 'disableTwoFactorAuth') {
            // 禁用两步验证（按用户隔离）
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var userIndex = users.findIndex(function(u) {
                return u.username === currentUser.username;
            });
            
            if (userIndex !== -1) {
                delete users[userIndex].twoFactorAuth;
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                
                // 更新当前用户对象
                delete currentUser.twoFactorAuth;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            document.getElementById('twoFactorAuth').checked = false;
            document.getElementById('twoFactorActions').style.display = 'none';
            showAlert('两步验证已禁用');
        }
    }
    
    // 添加PIN码输入限制
    function addPinInputRestrictions() {
        var twoFactorPin = document.getElementById('twoFactorPin');
        var confirmTwoFactorPin = document.getElementById('confirmTwoFactorPin');
        var useEnglishAndChars = document.getElementById('useEnglishAndChars');
        
        // 输入限制函数
        function restrictInput(input) {
            input.addEventListener('input', function() {
                if (!useEnglishAndChars.checked) {
                    // 只允许数字
                    this.value = this.value.replace(/[^0-9]/g, '');
                }
            });
        }
        
        // 为输入框添加限制
        restrictInput(twoFactorPin);
        restrictInput(confirmTwoFactorPin);
    }
    
    // 添加更改PIN码输入限制
    function addChangePinInputRestrictions() {
        var newTwoFactorPin = document.getElementById('newTwoFactorPin');
        var confirmNewTwoFactorPin = document.getElementById('confirmNewTwoFactorPin');
        var useEnglishAndCharsChange = document.getElementById('useEnglishAndCharsChange');
        
        // 输入限制函数
        function restrictInput(input) {
            input.addEventListener('input', function() {
                if (!useEnglishAndCharsChange.checked) {
                    // 只允许数字
                    this.value = this.value.replace(/[^0-9]/g, '');
                }
            });
        }
        
        // 为输入框添加限制
        restrictInput(newTwoFactorPin);
        restrictInput(confirmNewTwoFactorPin);
    }
    
    function updateAvatar(avatar) {
        document.querySelectorAll('.avatar-option').forEach(function(option) {
            option.classList.remove('selected');
            if (option.getAttribute('data-avatar') === avatar) {
                option.classList.add('selected');
            }
        });
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        var userProfile = user && user.userProfile ? user.userProfile : {};
        var customAvatarOption = document.getElementById('customAvatarOption');
        
        // 检查是否是自定义头像
        if (avatar && avatar.startsWith('custom_')) {
            // 从自定义头像数组中找到对应的头像
            if (userProfile.customAvatars) {
                var foundAvatar = userProfile.customAvatars.find(function(avatarItem) {
                    return avatarItem.id === avatar;
                });
                
                if (foundAvatar) {
                    customAvatarOption.classList.add('selected');
                    customAvatarOption.style.backgroundImage = 'url(' + foundAvatar.image + ')';
                    customAvatarOption.style.backgroundSize = 'cover';
                    customAvatarOption.style.backgroundPosition = 'center';
                    customAvatarOption.innerHTML = '';
                } else {
                    // 如果找不到对应的自定义头像，显示默认上传按钮
                    customAvatarOption.classList.remove('selected');
                    customAvatarOption.style.backgroundImage = '';
                    customAvatarOption.style.backgroundSize = '';
                    customAvatarOption.style.backgroundPosition = '';
                    customAvatarOption.innerHTML = '<i class="fas fa-upload"></i>';
                }
            } else {
                // 如果没有自定义头像数组，显示默认上传按钮
                customAvatarOption.classList.remove('selected');
                customAvatarOption.style.backgroundImage = '';
                customAvatarOption.style.backgroundSize = '';
                customAvatarOption.style.backgroundPosition = '';
                customAvatarOption.innerHTML = '<i class="fas fa-upload"></i>';
            }
        } else {
            // 不是自定义头像，显示默认上传按钮
            customAvatarOption.classList.remove('selected');
            customAvatarOption.style.backgroundImage = '';
            customAvatarOption.style.backgroundSize = '';
            customAvatarOption.style.backgroundPosition = '';
            customAvatarOption.innerHTML = '<i class="fas fa-upload"></i>';
        }
    }
    
    function saveAvatar(avatar) {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            if (!users[userIndex].userProfile) {
                users[userIndex].userProfile = {};
            }
            users[userIndex].userProfile.avatar = avatar;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            // 更新左上角头像
            updateSidebarAvatar(users[userIndex]);
            
            // 同步头像到其他页面
            syncAvatarToAllPages(users[userIndex]);
        }
    }
    
    function syncAvatarToAllPages(user) {
        // 保存头像信息到 localStorage，供其他页面使用
        if (user && user.userProfile) {
            var avatarType = user.userProfile.avatar || 'user';
            var customAvatar = null;
            
            // 检查是否是自定义头像
            if (avatarType.startsWith('custom_')) {
                // 从自定义头像数组中找到对应的头像
                if (user.userProfile.customAvatars) {
                    var foundAvatar = user.userProfile.customAvatars.find(function(avatar) {
                        return avatar.id === avatarType;
                    });
                    
                    if (foundAvatar) {
                        customAvatar = foundAvatar.image;
                    }
                }
            }
            
            var avatarInfo = {
                avatar: avatarType,
                customAvatar: customAvatar
            };
            localStorage.setItem('currentUserAvatar', JSON.stringify(avatarInfo));
        }
    }
    
    function updateSidebarAvatar(user) {
        var sidebarAvatar = document.querySelector('.sidebar-avatar');
        if (sidebarAvatar) {
            if (user.userProfile && user.userProfile.avatar) {
                var avatarType = user.userProfile.avatar;
                
                // 检查是否是自定义头像
                if (avatarType.startsWith('custom_')) {
                    // 从自定义头像数组中找到对应的头像
                    if (user.userProfile.customAvatars) {
                        var customAvatar = user.userProfile.customAvatars.find(function(avatar) {
                            return avatar.id === avatarType;
                        });
                        
                        if (customAvatar) {
                            // 显示自定义头像
                            sidebarAvatar.innerHTML = '<div class="sidebar-uid" id="sidebarUid">UID: ' + (user.userId || '---') + '</div>';
                            sidebarAvatar.style.backgroundImage = 'url(' + customAvatar.image + ')';
                            sidebarAvatar.style.backgroundSize = 'cover';
                            sidebarAvatar.style.backgroundPosition = 'center';
                            sidebarAvatar.style.color = 'transparent';
                            return;
                        }
                    }
                }
                
                // 显示默认头像
                sidebarAvatar.innerHTML = '<i class="fas fa-' + avatarType + '"></i><div class="sidebar-uid" id="sidebarUid">UID: ' + (user.userId || '---') + '</div>';
                sidebarAvatar.style.backgroundImage = '';
                sidebarAvatar.style.color = '';
            } else {
                // 显示默认头像
                sidebarAvatar.innerHTML = '<i class="fas fa-user"></i><div class="sidebar-uid" id="sidebarUid">UID: ' + (user.userId || '---') + '</div>';
                sidebarAvatar.style.backgroundImage = '';
                sidebarAvatar.style.color = '';
            }
        }
    }
    
    // IndexedDB初始化
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
    
    function storeBackgroundInIndexedDB(imageData, userId) {
        return new Promise(function(resolve, reject) {
            var timeoutId = setTimeout(function() {
                console.warn('IndexedDB存储超时');
                reject('存储超时');
            }, 30000);
            
            initIndexedDB().then(function(db) {
                try {
                    var transaction = db.transaction(['backgrounds'], 'readwrite');
                    var store = transaction.objectStore('backgrounds');
                    
                    var backgroundItem = {
                        id: 'background_' + userId,
                        image: imageData,
                        timestamp: new Date().toISOString()
                    };
                    
                    var request = store.put(backgroundItem);
                    
                    request.onsuccess = function() {
                        clearTimeout(timeoutId);
                        resolve();
                    };
                    
                    request.onerror = function(event) {
                        clearTimeout(timeoutId);
                        console.error('存储背景图片失败:', event.target.error);
                        reject('存储背景图片失败');
                    };
                } catch (e) {
                    clearTimeout(timeoutId);
                    console.error('IndexedDB事务异常:', e);
                    reject(e);
                }
            }).catch(function(err) {
                clearTimeout(timeoutId);
                reject(err);
            });
        });
    }
    
    function getBackgroundFromIndexedDB(userId) {
        return new Promise(function(resolve, reject) {
            var timeoutId = setTimeout(function() {
                console.warn('IndexedDB读取超时，跳过背景加载');
                resolve(null);
            }, 5000);
            
            initIndexedDB().then(function(db) {
                try {
                    var transaction = db.transaction(['backgrounds'], 'readonly');
                    var store = transaction.objectStore('backgrounds');
                    
                    var request = store.get('background_' + userId);
                    
                    request.onsuccess = function(event) {
                        clearTimeout(timeoutId);
                        var result = event.target.result;
                        resolve(result ? result.image : null);
                    };
                    
                    request.onerror = function(event) {
                        clearTimeout(timeoutId);
                        console.error('读取背景图片失败:', event.target.error);
                        resolve(null);
                    };
                } catch (e) {
                    clearTimeout(timeoutId);
                    console.error('IndexedDB事务异常:', e);
                    resolve(null);
                }
            }).catch(function(err) {
                clearTimeout(timeoutId);
                console.error('IndexedDB初始化失败:', err);
                resolve(null);
            });
        });
    }
    
    function deleteBackgroundFromIndexedDB(userId) {
        return new Promise(function(resolve, reject) {
            var timeoutId = setTimeout(function() {
                console.warn('IndexedDB删除超时');
                resolve();
            }, 10000);
            
            initIndexedDB().then(function(db) {
                try {
                    var transaction = db.transaction(['backgrounds'], 'readwrite');
                    var store = transaction.objectStore('backgrounds');
                    
                    var request = store.delete('background_' + userId);
                    
                    request.onsuccess = function() {
                        clearTimeout(timeoutId);
                        resolve();
                    };
                    
                    request.onerror = function(event) {
                        clearTimeout(timeoutId);
                        console.error('删除背景图片失败:', event.target.error);
                        resolve();
                    };
                } catch (e) {
                    clearTimeout(timeoutId);
                    console.error('IndexedDB事务异常:', e);
                    resolve();
                }
            }).catch(function(err) {
                clearTimeout(timeoutId);
                console.error('IndexedDB初始化失败:', err);
                resolve();
            });
        });
    }
    
    function handleAvatarUpload(event) {
        var file = event.target.files[0];
        var target = event.target;
        
        if (!file) {
            return;
        }
        
        var maxSize = 2 * 1024 * 1024;
        
        if (file.size > maxSize) {
            showAlert('头像文件大小不能超过2MB');
            target.value = '';
            return;
        }
        
        if (!file.type.match('image.*')) {
            showAlert('请选择图片文件');
            target.value = '';
            return;
        }
        
        var reader = new FileReader();
        
        reader.onload = function(e) {
            var base64 = e.target.result;
            // 显示头像编辑窗口
            showAvatarEditor(base64);
            // 清空文件输入框的值，以便下次选择相同文件时也能触发change事件
            target.value = '';
        };
        
        reader.onerror = function() {
            showAlert('头像上传失败，请重试');
            target.value = '';
        };
        
        reader.readAsDataURL(file);
    }
    
    function showAvatarEditor(originalImage) {
        // 创建头像编辑窗口
        var editorContainer = document.createElement('div');
        editorContainer.className = 'avatar-editor-container';
        editorContainer.innerHTML = `
            <div class="avatar-editor-overlay"></div>
            <div class="avatar-editor-content">
                <div class="avatar-editor-header">
                    <h3>编辑头像</h3>
                    <button class="close-editor-btn">&times;</button>
                </div>
                <div class="avatar-editor-body">
                    <div class="editor-preview">
                        <div class="preview-container">
                            <img id="editorImage" src="${originalImage}" alt="头像预览">
                            <div class="crop-overlay"></div>
                        </div>
                        <div class="image-info">
                            <span id="imageSize"></span>
                        </div>
                    </div>
                    <div class="editor-tools">
                        <div class="two-factor-item">
                            <div class="two-factor-info" style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-signature" style="color: #3498db; font-size: 18px; flex-shrink: 0;"></i>
                                <h4 style="margin: 0;">头像名称</h4>
                            </div>
                            <input type="text" id="avatarNameInput" placeholder="输入头像名称" style="width: 200px; padding: 8px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div class="two-factor-item">
                            <div class="two-factor-info" style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-crop" style="color: #3498db; font-size: 18px; flex-shrink: 0;"></i>
                                <h4 style="margin: 0;">裁剪</h4>
                            </div>
                            <div class="crop-tools" style="display: flex; gap: 8px;">
                                <button class="crop-btn" data-size="1:1">1:1</button>
                                <button class="crop-btn" data-size="4:3">4:3</button>
                                <button class="crop-btn" data-size="16:9">16:9</button>
                            </div>
                        </div>
                        <div class="two-factor-item">
                            <div class="two-factor-info" style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-image" style="color: #3498db; font-size: 18px; flex-shrink: 0;"></i>
                                <h4 style="margin: 0;">滤镜</h4>
                            </div>
                            <div class="filter-tools" style="display: flex; gap: 8px;">
                                <button class="filter-btn" data-filter="none">原图</button>
                                <button class="filter-btn" data-filter="grayscale">黑白</button>
                                <button class="filter-btn" data-filter="sepia">复古</button>
                                <button class="filter-btn" data-filter="blur">模糊</button>
                                <button class="filter-btn" data-filter="brightness">明亮</button>
                            </div>
                        </div>
                        <div class="two-factor-item">
                            <div class="two-factor-info" style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-sun" style="color: #3498db; font-size: 18px; flex-shrink: 0;"></i>
                                <h4 style="margin: 0;">亮度</h4>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; width: 200px;">
                                <input type="range" id="brightnessRange" min="0" max="200" value="100">
                                <span id="brightnessValue">100%</span>
                            </div>
                        </div>
                        <div class="two-factor-item">
                            <div class="two-factor-info" style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-adjust" style="color: #3498db; font-size: 18px; flex-shrink: 0;"></i>
                                <h4 style="margin: 0;">对比度</h4>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; width: 200px;">
                                <input type="range" id="contrastRange" min="0" max="200" value="100">
                                <span id="contrastValue">100%</span>
                            </div>
                        </div>
                        <div class="two-factor-item">
                            <div class="two-factor-info" style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-palette" style="color: #3498db; font-size: 18px; flex-shrink: 0;"></i>
                                <h4 style="margin: 0;">饱和度</h4>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; width: 200px;">
                                <input type="range" id="saturationRange" min="0" max="200" value="100">
                                <span id="saturationValue">100%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="avatar-editor-footer">
                    <button class="cancel-btn">取消</button>
                    <button class="confirm-btn">确认</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editorContainer);
        
        // 添加动画
        setTimeout(function() {
            editorContainer.classList.add('show');
        }, 10);
        
        // 绑定事件
        var editorImage = document.getElementById('editorImage');
        var brightnessRange = document.getElementById('brightnessRange');
        var contrastRange = document.getElementById('contrastRange');
        var saturationRange = document.getElementById('saturationRange');
        
        // 滤镜按钮事件
        document.querySelectorAll('.filter-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                var filter = this.getAttribute('data-filter');
                updateImageStyle();
            });
        });
        
        // 裁剪按钮事件
        document.querySelectorAll('.crop-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.crop-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                var size = this.getAttribute('data-size');
                var ratioParts = size.split(':');
                var ratio = parseInt(ratioParts[0]) / parseInt(ratioParts[1]);
                
                // 根据选择的比例调整裁剪区域
                var editorImage = document.getElementById('editorImage');
                var imgRatio = editorImage.naturalWidth / editorImage.naturalHeight;
                
                var newWidth, newHeight;
                
                if (ratio > imgRatio) {
                    // 宽屏比例，以高度为准
                    newHeight = 0.4;
                    newWidth = newHeight * ratio;
                } else {
                    // 竖屏或正方形比例，以宽度为准
                    newWidth = 0.4;
                    newHeight = newWidth / ratio;
                }
                
                // 确保不超过边界
                newWidth = Math.min(newWidth, 0.9);
                newHeight = Math.min(newHeight, 0.9);
                
                // 居中裁剪区域
                cropArea.x = (1 - newWidth) / 2;
                cropArea.y = (1 - newHeight) / 2;
                cropArea.width = newWidth;
                cropArea.height = newHeight;
                
                // 更新裁剪区域显示
                updateCropOverlay();
            });
        });
        
        // 调整滑块事件
        brightnessRange.addEventListener('input', updateImageStyle);
        contrastRange.addEventListener('input', updateImageStyle);
        saturationRange.addEventListener('input', updateImageStyle);
        
        // 关闭按钮事件
        document.querySelector('.close-editor-btn').addEventListener('click', function() {
            closeAvatarEditor(editorContainer);
        });
        
        // 取消按钮事件
        document.querySelector('.cancel-btn').addEventListener('click', function() {
            closeAvatarEditor(editorContainer);
        });
        
        // 确认按钮事件
        document.querySelector('.confirm-btn').addEventListener('click', function() {
            // 获取头像名称
            var avatarName = document.getElementById('avatarNameInput').value;
            // 保存编辑后的头像
            saveEditedAvatar(originalImage, editorContainer, cropArea, avatarName);
        });
        
        // 点击遮罩关闭
        document.querySelector('.avatar-editor-overlay').addEventListener('click', function() {
            closeAvatarEditor(editorContainer);
        });
        
        // 显示图片原始尺寸
        var editorImage = document.getElementById('editorImage');
        var imageSizeElement = document.getElementById('imageSize');
        
        editorImage.onload = function() {
            var width = this.naturalWidth;
            var height = this.naturalHeight;
            imageSizeElement.textContent = `原始尺寸: ${width} × ${height}`;
        };
        
        // 初始化裁剪区域
        var cropOverlay = document.querySelector('.crop-overlay');
        var cropArea = {
            x: 0.3, // 相对于图片的百分比，使裁剪框位于中央
            y: 0.3,
            width: 0.4, // 较小的初始尺寸
            height: 0.4
        };
        
        // 绘制裁剪区域
        function updateCropOverlay() {
            var editorImage = document.getElementById('editorImage');
            var previewContainer = document.querySelector('.preview-container');
            
            // 获取图片实际尺寸
            var imgWidth = editorImage.naturalWidth;
            var imgHeight = editorImage.naturalHeight;
            
            // 获取预览容器尺寸
            var containerWidth = previewContainer.offsetWidth;
            var containerHeight = previewContainer.offsetHeight;
            
            // 计算图片在预览容器中的实际显示尺寸
            var imgDisplayWidth, imgDisplayHeight;
            var imgRatio = imgWidth / imgHeight;
            var containerRatio = containerWidth / containerHeight;
            
            if (imgRatio > containerRatio) {
                imgDisplayWidth = containerWidth;
                imgDisplayHeight = containerWidth / imgRatio;
            } else {
                imgDisplayHeight = containerHeight;
                imgDisplayWidth = containerHeight * imgRatio;
            }
            
            // 计算图片在预览容器中的偏移量
            var imgOffsetX = (containerWidth - imgDisplayWidth) / 2;
            var imgOffsetY = (containerHeight - imgDisplayHeight) / 2;
            
            // 确保裁剪区域不会超出图片边界
            var maxWidth = Math.min(cropArea.width, 1 - cropArea.x);
            var maxHeight = Math.min(cropArea.height, 1 - cropArea.y);
            
            // 计算裁剪区域的实际像素位置和大小
            var cropX = imgOffsetX + (cropArea.x * imgDisplayWidth);
            var cropY = imgOffsetY + (cropArea.y * imgDisplayHeight);
            var cropWidth = maxWidth * imgDisplayWidth;
            var cropHeight = maxHeight * imgDisplayHeight;
            
            // 设置裁剪区域样式
            cropOverlay.style.left = cropX + 'px';
            cropOverlay.style.top = cropY + 'px';
            cropOverlay.style.width = cropWidth + 'px';
            cropOverlay.style.height = cropHeight + 'px';
            cropOverlay.style.background = 'transparent';
            cropOverlay.style.border = '2px dashed #d45d79';
            cropOverlay.style.display = 'block';
            cropOverlay.style.pointerEvents = 'auto';
        }
        
        // 初始化裁剪区域
        updateCropOverlay();
        
        // 裁剪区域拖动功能
        var isDragging = false;
        var dragStart = { x: 0, y: 0 };
        var cropStart = { ...cropArea };
        
        cropOverlay.addEventListener('mousedown', function(e) {
            isDragging = true;
            var rect = cropOverlay.getBoundingClientRect();
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            cropStart = { ...cropArea };
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            var editorImage = document.getElementById('editorImage');
            var previewContainer = document.querySelector('.preview-container');
            
            // 获取图片实际尺寸
            var imgWidth = editorImage.naturalWidth;
            var imgHeight = editorImage.naturalHeight;
            
            // 获取预览容器尺寸
            var containerWidth = previewContainer.offsetWidth;
            var containerHeight = previewContainer.offsetHeight;
            
            // 计算图片在预览容器中的实际显示尺寸
            var imgDisplayWidth, imgDisplayHeight;
            var imgRatio = imgWidth / imgHeight;
            var containerRatio = containerWidth / containerHeight;
            
            if (imgRatio > containerRatio) {
                imgDisplayWidth = containerWidth;
                imgDisplayHeight = containerWidth / imgRatio;
            } else {
                imgDisplayHeight = containerHeight;
                imgDisplayWidth = containerHeight * imgRatio;
            }
            
            var deltaX = (e.clientX - dragStart.x) / imgDisplayWidth;
            var deltaY = (e.clientY - dragStart.y) / imgDisplayHeight;
            
            // 更新裁剪区域位置，确保不会超出图片边界
            cropArea.x = Math.max(0, Math.min(1 - cropArea.width, cropStart.x + deltaX));
            cropArea.y = Math.max(0, Math.min(1 - cropArea.height, cropStart.y + deltaY));
            
            updateCropOverlay();
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        // 裁剪区域调整大小功能
        var resizeHandles = ['nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w'];
        
        // 创建调整大小的手柄
        resizeHandles.forEach(function(position) {
            var handle = document.createElement('div');
            handle.className = 'resize-handle ' + position;
            cropOverlay.appendChild(handle);
            
            handle.addEventListener('mousedown', function(e) {
                e.stopPropagation();
                isResizing = true;
                resizePosition = position;
                dragStart.x = e.clientX;
                dragStart.y = e.clientY;
                cropStart = { ...cropArea };
            });
        });
        
        var isResizing = false;
        var resizePosition = '';
        
        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;
            
            var editorImage = document.getElementById('editorImage');
            var previewContainer = document.querySelector('.preview-container');
            
            // 获取图片实际尺寸
            var imgWidth = editorImage.naturalWidth;
            var imgHeight = editorImage.naturalHeight;
            
            // 获取预览容器尺寸
            var containerWidth = previewContainer.offsetWidth;
            var containerHeight = previewContainer.offsetHeight;
            
            // 计算图片在预览容器中的实际显示尺寸
            var imgDisplayWidth, imgDisplayHeight;
            var imgRatio = imgWidth / imgHeight;
            var containerRatio = containerWidth / containerHeight;
            
            if (imgRatio > containerRatio) {
                imgDisplayWidth = containerWidth;
                imgDisplayHeight = containerWidth / imgRatio;
            } else {
                imgDisplayHeight = containerHeight;
                imgDisplayWidth = containerHeight * imgRatio;
            }
            
            var deltaX = (e.clientX - dragStart.x) / imgDisplayWidth;
            var deltaY = (e.clientY - dragStart.y) / imgDisplayHeight;
            
            // 根据手柄位置调整裁剪区域，确保不会超出图片边界
            switch (resizePosition) {
                case 'nw':
                    cropArea.x = Math.max(0, cropStart.x + deltaX);
                    cropArea.y = Math.max(0, cropStart.y + deltaY);
                    cropArea.width = Math.max(0.2, Math.min(1 - cropArea.x, cropStart.width - deltaX));
                    cropArea.height = Math.max(0.2, Math.min(1 - cropArea.y, cropStart.height - deltaY));
                    break;
                case 'ne':
                    cropArea.y = Math.max(0, cropStart.y + deltaY);
                    cropArea.width = Math.max(0.2, Math.min(1 - cropStart.x, cropStart.width + deltaX));
                    cropArea.height = Math.max(0.2, Math.min(1 - cropArea.y, cropStart.height - deltaY));
                    break;
                case 'sw':
                    cropArea.x = Math.max(0, cropStart.x + deltaX);
                    cropArea.width = Math.max(0.2, Math.min(1 - cropArea.x, cropStart.width - deltaX));
                    cropArea.height = Math.max(0.2, Math.min(1 - cropStart.y, cropStart.height + deltaY));
                    break;
                case 'se':
                    cropArea.width = Math.max(0.2, Math.min(1 - cropStart.x, cropStart.width + deltaX));
                    cropArea.height = Math.max(0.2, Math.min(1 - cropStart.y, cropStart.height + deltaY));
                    break;
                case 'n':
                    cropArea.y = Math.max(0, cropStart.y + deltaY);
                    cropArea.height = Math.max(0.2, Math.min(1 - cropArea.y, cropStart.height - deltaY));
                    break;
                case 'e':
                    cropArea.width = Math.max(0.2, Math.min(1 - cropStart.x, cropStart.width + deltaX));
                    break;
                case 's':
                    cropArea.height = Math.max(0.2, Math.min(1 - cropStart.y, cropStart.height + deltaY));
                    break;
                case 'w':
                    cropArea.x = Math.max(0, cropStart.x + deltaX);
                    cropArea.width = Math.max(0.2, Math.min(1 - cropArea.x, cropStart.width - deltaX));
                    break;
            }
            
            updateCropOverlay();
        });
        
        document.addEventListener('mouseup', function() {
            isResizing = false;
            resizePosition = '';
        });
        
        function updateImageStyle() {
            var brightness = brightnessRange.value;
            var contrast = contrastRange.value;
            var saturation = saturationRange.value;
            var activeFilter = document.querySelector('.filter-btn.active');
            var filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'none';
            
            var filterStyle = '';
            if (filter === 'grayscale') {
                filterStyle += 'grayscale(100%) ';
            } else if (filter === 'sepia') {
                filterStyle += 'sepia(100%) ';
            } else if (filter === 'blur') {
                filterStyle += 'blur(3px) ';
            }
            
            filterStyle += `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
            
            editorImage.style.filter = filterStyle;
        }
    }
    
    function closeAvatarEditor(container) {
        container.classList.remove('show');
        setTimeout(function() {
            document.body.removeChild(container);
        }, 300);
    }
    
    function saveEditedAvatar(originalImage, container, cropArea, avatarName) {
        // 获取编辑后的图片
        var editorImage = document.getElementById('editorImage');
        
        // 创建一个canvas来保存编辑后的图片
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        
        // 设置canvas大小
        canvas.width = 200;
        canvas.height = 200;
        
        // 应用滤镜和调整
        ctx.filter = editorImage.style.filter;
        
        // 绘制图片（根据裁剪区域）
        var img = new Image();
        img.onload = function() {
            // 计算裁剪区域的实际像素值
            var cropX = cropArea.x * img.width;
            var cropY = cropArea.y * img.height;
            var cropWidth = cropArea.width * img.width;
            var cropHeight = cropArea.height * img.height;
            
            // 绘制裁剪后的图片
            ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, 200, 200);
            
            // 获取编辑后的base64
            var editedImage = canvas.toDataURL('image/png');
            
            // 保存到用户配置
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var userIndex = users.findIndex(function(user) {
                return user.username === currentUser.username;
            });
            
            if (userIndex !== -1) {
                if (!users[userIndex].userProfile) {
                    users[userIndex].userProfile = {};
                }
                
                // 初始化自定义头像数组
                if (!users[userIndex].userProfile.customAvatars) {
                    users[userIndex].userProfile.customAvatars = [];
                }
                
                // 限制最大存储头像数量为10个
                var customAvatars = users[userIndex].userProfile.customAvatars;
                if (customAvatars.length >= 10) {
                    // 如果超过10个，移除最早的一个
                    customAvatars.shift();
                }
                
                // 添加新的自定义头像
                var avatarId = 'custom_' + Date.now();
                customAvatars.push({
                    id: avatarId,
                    image: editedImage,
                    name: avatarName,
                    timestamp: Date.now()
                });
                
                // 设置当前使用的头像
                users[userIndex].userProfile.avatar = avatarId;
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                
                // 更新头像显示
                updateAvatarDisplay();
                
                // 更新左上角头像
                updateSidebarAvatar(users[userIndex]);
                
                // 同步头像到其他页面
                syncAvatarToAllPages(users[userIndex]);
                
                showAlert('头像上传成功');
            }
            
            // 关闭编辑窗口
            closeAvatarEditor(container);
        };
        
        img.src = originalImage;
    }
    
    function updateAvatarDisplay() {
        // 清空现有的头像选项
        var avatarSelection = document.querySelector('.avatar-selection');
        var customAvatarOption = document.getElementById('customAvatarOption');
        var uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
        
        // 保存上传按钮和自定义头像选项
        var uploadBtnHTML = uploadAvatarBtn.outerHTML;
        
        // 清空头像选择区域，只保留系统默认头像
        avatarSelection.innerHTML = '';
        
        // 默认头像名称映射
        var defaultAvatarNames = {
            'user': '用户',
            'robot': '机器人',
            'cat': '猫咪',
            'dog': '狗狗',
            'dragon': '龙',
            'ghost': '幽灵'
        };
        
        // 添加系统默认头像
        var defaultAvatars = ['user', 'robot', 'cat', 'dog', 'dragon', 'ghost'];
        defaultAvatars.forEach(function(avatar) {
            var option = document.createElement('div');
            option.className = 'avatar-option';
            option.setAttribute('data-avatar', avatar);
            option.innerHTML = '<i class="fas fa-' + avatar + '"></i>';
            
            // 添加悬浮卡片（只显示名称）
            var card = document.createElement('div');
            card.className = 'avatar-hover-card';
            card.innerHTML = `
                <div class="avatar-card-content">
                    <div class="avatar-card-header">
                        <input type="text" class="avatar-name-input" readonly value="${defaultAvatarNames[avatar]}" disabled>
                    </div>
                </div>
            `;
            option.appendChild(card);
            
            avatarSelection.appendChild(option);
        });
        
        // 添加用户的自定义头像
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        if (user && user.userProfile && user.userProfile.customAvatars) {
            user.userProfile.customAvatars.forEach(function(customAvatar) {
                var option = document.createElement('div');
                option.className = 'avatar-option custom-avatar';
                option.setAttribute('data-avatar', customAvatar.id);
                option.style.backgroundImage = 'url(' + customAvatar.image + ')';
                option.style.backgroundSize = 'cover';
                option.style.backgroundPosition = 'center';
                option.innerHTML = '';
                
                // 添加悬浮卡片
                var card = document.createElement('div');
                card.className = 'avatar-hover-card';
                
                // 格式化日期
                var date = new Date(customAvatar.timestamp);
                var dateStr = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
                
                card.innerHTML = `
                    <div class="avatar-card-content">
                        <div class="avatar-card-header">
                            <input type="text" class="avatar-name-input" placeholder="输入头像名称" value="${customAvatar.name || ''}" data-avatar-id="${customAvatar.id}">
                        </div>
                        <div class="avatar-card-info">
                            <span class="avatar-date">添加日期: ${dateStr}</span>
                        </div>
                        <div class="avatar-card-actions">
                            <button class="delete-avatar-btn" data-avatar-id="${customAvatar.id}">删除头像</button>
                        </div>
                    </div>
                `;
                
                option.appendChild(card);
                avatarSelection.appendChild(option);
            });
        }
        
        // 添加上传头像按钮
        var uploadBtnContainer = document.createElement('div');
        uploadBtnContainer.className = 'avatar-option custom-avatar';
        uploadBtnContainer.id = 'customAvatarOption';
        uploadBtnContainer.innerHTML = '<i class="fas fa-upload"></i>';
        // 确保上传按钮没有背景图片
        uploadBtnContainer.style.background = '';
        uploadBtnContainer.style.backgroundImage = '';
        uploadBtnContainer.style.backgroundSize = '';
        uploadBtnContainer.style.backgroundPosition = '';
        uploadBtnContainer.style.color = '';
        avatarSelection.appendChild(uploadBtnContainer);
        
        // 重新绑定事件
        document.getElementById('customAvatarOption').addEventListener('click', function() {
            document.getElementById('avatarUpload').click();
        });
        
        // 为删除头像按钮添加事件监听器
        document.querySelectorAll('.delete-avatar-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡
                var avatarId = this.getAttribute('data-avatar-id');
                deleteAvatar(avatarId);
            });
        });
        
        // 为头像名称输入框添加事件监听器
        document.querySelectorAll('.avatar-name-input').forEach(function(input) {
            input.addEventListener('input', function() {
                var avatarId = this.getAttribute('data-avatar-id');
                var name = this.value;
                saveAvatarName(avatarId, name);
            });
        });
        
        // 更新选中状态
        if (user && user.userProfile) {
            var currentAvatar = user.userProfile.avatar;
            updateAvatar(currentAvatar);
        }
    }
    
    function updateBioCount() {
        var bio = document.getElementById('accountBio').value;
        var count = bio.length;
        document.getElementById('bioCount').textContent = count;
    }
    
    function deleteAvatar(avatarId) {
        // 显示确认弹窗
        showConfirm('您确认要删除该头像吗？删除后将无法恢复。', function(confirm) {
            if (confirm) {
                var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                var userIndex = users.findIndex(function(user) {
                    return user.username === currentUser.username;
                });
                
                if (userIndex !== -1 && users[userIndex].userProfile && users[userIndex].userProfile.customAvatars) {
                    // 找到要删除的头像
                    var avatarIndex = users[userIndex].userProfile.customAvatars.findIndex(function(avatar) {
                        return avatar.id === avatarId;
                    });
                    
                    if (avatarIndex !== -1) {
                        // 检查是否是当前使用的头像
                        if (users[userIndex].userProfile.avatar === avatarId) {
                            // 如果是当前使用的头像，切换到默认头像
                            users[userIndex].userProfile.avatar = 'user';
                        }
                        
                        // 删除头像
                        users[userIndex].userProfile.customAvatars.splice(avatarIndex, 1);
                        localStorage.setItem('registeredUsers', JSON.stringify(users));
                        
                        // 更新头像显示
                        updateAvatarDisplay();
                        
                        // 更新左上角头像
                        updateSidebarAvatar(users[userIndex]);
                        
                        // 同步头像到其他页面
                        syncAvatarToAllPages(users[userIndex]);
                        
                        showAlert('头像删除成功');
                    }
                }
            }
        });
    }
    
    function saveAvatarName(avatarId, name) {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1 && users[userIndex].userProfile && users[userIndex].userProfile.customAvatars) {
            var avatar = users[userIndex].userProfile.customAvatars.find(function(avatar) {
                return avatar.id === avatarId;
            });
            
            if (avatar) {
                avatar.name = name;
                localStorage.setItem('registeredUsers', JSON.stringify(users));
            }
        }
    }
    
    function setTheme(theme) {
        document.querySelectorAll('.theme-option').forEach(function(option) {
            option.classList.remove('active');
            if (option.getAttribute('data-theme') === theme) {
                option.classList.add('active');
            }
        });

        var customThemePanel = document.getElementById('customThemePanel');
        if (customThemePanel) {
            customThemePanel.style.display = theme === 'custom' ? 'block' : 'none';
        }

        var glassThemePanel = document.getElementById('glassThemePanel');
        if (glassThemePanel) {
            // 毛玻璃主题面板：仅在使用毛玻璃主题时显示
            glassThemePanel.style.display = theme === 'glass' ? 'block' : 'none';
        }

        var darkMode = false;
        if (theme === 'dark') {
            darkMode = true;
        } else if (theme === 'light') {
            darkMode = false;
        } else if (theme === 'auto') {
            darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        SettingsManager.set('darkMode', darkMode);

        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });

        if (userIndex !== -1) {
            if (!users[userIndex].userProfile) {
                users[userIndex].userProfile = {};
            }
            users[userIndex].userProfile.theme = theme;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }

        if (theme === 'custom') {
            applyCustomThemeSettings();
        } else if (theme === 'glass' || theme === 'transparent') {
            applyGlassThemeSettings();
        }

        updateThemeDisplay();
    }
    
    function setLanguage(language) {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            if (!users[userIndex].userProfile) {
                users[userIndex].userProfile = {};
            }
            users[userIndex].userProfile.language = language;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            SettingsManager.set('language', language);
            
            // 使用AccountLangManager更新语言
            AccountLangManager.updateLanguage(language);
            
            showAlert('语言切换成功，点击确定以刷新');
            
            // 重新绑定确定按钮的点击事件，添加刷新功能
            var alertConfirm = document.getElementById('alertConfirm');
            alertConfirm.removeEventListener('click', hideAlert);
            alertConfirm.addEventListener('click', function() {
                hideAlert();
                // 刷新页面
                location.reload();
            });
        }
    }
    
    function getCustomThemeColor() {
        var rgbMode = document.querySelector('.color-mode-btn.active').getAttribute('data-mode') === 'rgb';
        
        if (rgbMode) {
            var r = document.getElementById('redSlider').value;
            var g = document.getElementById('greenSlider').value;
            var b = document.getElementById('blueSlider').value;
            return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        } else {
            return document.getElementById('customColorPicker').value;
        }
    }
    
    function updateThemePreview() {
        var color = getCustomThemeColor();
        var opacity = document.getElementById('opacitySlider').value;
        var contrast = document.getElementById('contrastSlider').value;
        
        var previewBox = document.getElementById('themePreviewBox');
        if (previewBox) {
            previewBox.style.backgroundColor = color.replace(')', ', ' + opacity + ')');
            previewBox.style.filter = 'contrast(' + contrast + ')';
        }
    }
    
    function applyCustomThemeSettings() {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1 && users[userIndex].userProfile && users[userIndex].userProfile.customTheme) {
            var customTheme = users[userIndex].userProfile.customTheme;
            
            if (customTheme.rgbMode) {
                document.getElementById('redSlider').value = customTheme.r;
                document.getElementById('greenSlider').value = customTheme.g;
                document.getElementById('blueSlider').value = customTheme.b;
                document.getElementById('redValue').textContent = customTheme.r;
                document.getElementById('greenValue').textContent = customTheme.g;
                document.getElementById('blueValue').textContent = customTheme.b;
                
                document.querySelectorAll('.color-mode-btn').forEach(function(btn) {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-mode') === 'rgb') {
                        btn.classList.add('active');
                    }
                });
                document.getElementById('rgbControls').style.display = 'flex';
                document.getElementById('paletteControls').style.display = 'none';
            } else {
                document.getElementById('customColorPicker').value = customTheme.color;
                
                document.querySelectorAll('.color-mode-btn').forEach(function(btn) {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-mode') === 'palette') {
                        btn.classList.add('active');
                    }
                });
                document.getElementById('rgbControls').style.display = 'none';
                document.getElementById('paletteControls').style.display = 'flex';
            }
            
            document.getElementById('opacitySlider').value = customTheme.opacity;
            document.getElementById('opacityValue').textContent = Math.round(customTheme.opacity * 100) + '%';
            
            document.getElementById('contrastSlider').value = customTheme.contrast;
            document.getElementById('contrastValue').textContent = Math.round(customTheme.contrast * 100) + '%';
            
            updateThemePreview();
        }
    }
    
    function saveCustomTheme() {
        var rgbMode = document.querySelector('.color-mode-btn.active').getAttribute('data-mode') === 'rgb';
        var customTheme = {
            rgbMode: rgbMode,
            opacity: parseFloat(document.getElementById('opacitySlider').value),
            contrast: parseFloat(document.getElementById('contrastSlider').value)
        };
        
        if (rgbMode) {
            customTheme.r = parseInt(document.getElementById('redSlider').value);
            customTheme.g = parseInt(document.getElementById('greenSlider').value);
            customTheme.b = parseInt(document.getElementById('blueSlider').value);
        } else {
            customTheme.color = document.getElementById('customColorPicker').value;
        }
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            if (!users[userIndex].userProfile) {
                users[userIndex].userProfile = {};
            }
            users[userIndex].userProfile.customTheme = customTheme;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
        
        applyCustomThemeToPage(customTheme);
        showAlert('自定义主题已应用');
    }
    
    function resetCustomTheme() {
        document.getElementById('redSlider').value = 255;
        document.getElementById('greenSlider').value = 255;
        document.getElementById('blueSlider').value = 255;
        document.getElementById('redValue').textContent = '255';
        document.getElementById('greenValue').textContent = '255';
        document.getElementById('blueValue').textContent = '255';
        
        document.getElementById('customColorPicker').value = '#FF6B6B';
        
        document.getElementById('opacitySlider').value = 1;
        document.getElementById('opacityValue').textContent = '100%';
        
        document.getElementById('contrastSlider').value = 1;
        document.getElementById('contrastValue').textContent = '100%';
        
        document.querySelectorAll('.color-swatch').forEach(function(s) {
            s.classList.remove('selected');
        });
        
        updateThemePreview();
        showAlert('自定义主题已重置');
    }
    
    function applyCustomThemeToPage(customTheme) {
        var color;
        if (customTheme.rgbMode) {
            color = 'rgba(' + customTheme.r + ', ' + customTheme.g + ', ' + customTheme.b + ', ' + customTheme.opacity + ')';
        } else {
            var hex = customTheme.color;
            var r = parseInt(hex.slice(1, 3), 16);
            var g = parseInt(hex.slice(3, 5), 16);
            var b = parseInt(hex.slice(5, 7), 16);
            color = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + customTheme.opacity + ')';
        }
        
        var style = document.createElement('style');
        style.id = 'custom-theme-style';
        var existingStyle = document.getElementById('custom-theme-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        style.textContent = `
            :root {
                --custom-primary-color: ${color};
                --custom-contrast: ${customTheme.contrast};
            }
            .settings-container {
                filter: contrast(${customTheme.contrast});
            }
            .section-card {
                background: ${color};
            }
        `;
        document.head.appendChild(style);
    }
    
    function updateThemeDisplay() {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });

        // 移除所有主题类
        document.body.classList.remove('dark-mode', 'glass-mode', 'transparent-mode');

        if (userIndex !== -1 && users[userIndex].userProfile) {
            var theme = users[userIndex].userProfile.theme;

            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
            } else if (theme === 'glass') {
                document.body.classList.add('glass-mode');

                if (users[userIndex].userProfile.glassTheme) {
                    var glassTheme = users[userIndex].userProfile.glassTheme;
                    applyGlassThemeToPage(glassTheme);
                }
            } else if (theme === 'transparent') {
                document.body.classList.add('glass-mode', 'transparent-mode');

                if (users[userIndex].userProfile.glassTheme) {
                    var glassThemeForTransparent = users[userIndex].userProfile.glassTheme;
                    applyGlassThemeToPage(glassThemeForTransparent);
                }
            }

            if (users[userIndex].userProfile.customTheme) {
                var customTheme = users[userIndex].userProfile.customTheme;
                applyCustomThemeToPage(customTheme);
            }
        }
    }
    
    function applyGlassThemeSettings() {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1 && users[userIndex].userProfile && users[userIndex].userProfile.glassTheme) {
            var glassTheme = users[userIndex].userProfile.glassTheme;
            
            if (document.getElementById('glassOpacitySlider')) {
                document.getElementById('glassOpacitySlider').value = glassTheme.opacity;
                document.getElementById('glassOpacityValue').textContent = Math.round(glassTheme.opacity * 100) + '%';
            }
            
            if (document.getElementById('glassBlurSlider')) {
                document.getElementById('glassBlurSlider').value = glassTheme.blur;
                document.getElementById('glassBlurValue').textContent = glassTheme.blur + 'px';
            }
            
            updateGlassThemePreview();
        }
    }
    
    function updateGlassThemePreview() {
        var opacity = parseFloat(document.getElementById('glassOpacitySlider').value);
        var blur = parseInt(document.getElementById('glassBlurSlider').value);
        
        // 使用默认颜色
        var rgbaColor = 'rgba(255, 255, 255, ' + opacity + ')';
        
        var previewBox = document.getElementById('glassPreviewBox');
        if (previewBox) {
            previewBox.style.background = rgbaColor;
            previewBox.style.backdropFilter = 'blur(' + blur + 'px)';
            previewBox.style.webkitBackdropFilter = 'blur(' + blur + 'px)';
        }
    }
    
    function saveGlassTheme() {
        var glassTheme = {
            opacity: parseFloat(document.getElementById('glassOpacitySlider').value),
            blur: parseInt(document.getElementById('glassBlurSlider').value)
        };
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            if (!users[userIndex].userProfile) {
                users[userIndex].userProfile = {};
            }
            users[userIndex].userProfile.glassTheme = glassTheme;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
        
        // 同时保存到全局设置中，以便其他页面（登录页、游戏大厅）可以访问
        localStorage.setItem('glassThemeSettings', JSON.stringify(glassTheme));
        
        applyGlassThemeToPage(glassTheme);
        showAlert('毛玻璃主题已应用');
    }
    
    function resetGlassTheme() {
        if (document.getElementById('glassOpacitySlider')) {
            document.getElementById('glassOpacitySlider').value = 0.2;
            document.getElementById('glassOpacityValue').textContent = '20%';
        }
        
        if (document.getElementById('glassBlurSlider')) {
            document.getElementById('glassBlurSlider').value = 10;
            document.getElementById('glassBlurValue').textContent = '10px';
        }
        
        // 重置全局设置
        var defaultGlassTheme = {
            opacity: 0.2,
            blur: 10
        };
        localStorage.setItem('glassThemeSettings', JSON.stringify(defaultGlassTheme));
        
        updateGlassThemePreview();
        showAlert('毛玻璃主题已重置');
    }
    
    function applyGlassThemeToPage(glassTheme) {
        // 使用默认颜色
        var rgbaColor = 'rgba(255, 255, 255, ' + glassTheme.opacity + ')';
        
        var style = document.createElement('style');
        style.id = 'glass-theme-style';
        var existingStyle = document.getElementById('glass-theme-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        style.textContent = `
            :root {
                --glass-background: ${rgbaColor};
                --glass-blur: ${glassTheme.blur}px;
            }
            
            body.glass-mode .sidebar {
                background: ${rgbaColor};
                backdrop-filter: blur(${glassTheme.blur}px);
                -webkit-backdrop-filter: blur(${glassTheme.blur}px);
                border-right: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            body.glass-mode .settings-container {
                background: ${rgbaColor};
                backdrop-filter: blur(${glassTheme.blur}px);
                -webkit-backdrop-filter: blur(${glassTheme.blur}px);
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            body.glass-mode .section-card {
                background: ${rgbaColor};
                backdrop-filter: blur(${glassTheme.blur}px);
                -webkit-backdrop-filter: blur(${glassTheme.blur}px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5);
            }
            
            body.glass-mode .menu-item {
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            body.glass-mode .menu-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            body.glass-mode .menu-item.active {
                background: rgba(255, 255, 255, 0.2);
            }
            
            /* 暗色模式下的毛玻璃效果 */
            body.glass-mode.dark-mode .sidebar {
                background: rgba(30, 30, 50, ${glassTheme.opacity});
                border-right: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            body.glass-mode.dark-mode .settings-container {
                background: rgba(30, 30, 50, ${glassTheme.opacity});
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            body.glass-mode.dark-mode .section-card {
                background: rgba(30, 30, 50, ${glassTheme.opacity});
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
            }
            
            body.glass-mode.dark-mode .menu-item {
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            body.glass-mode.dark-mode .menu-item:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            body.glass-mode.dark-mode .menu-item.active {
                background: rgba(255, 255, 255, 0.1);
            }
        `;
        document.head.appendChild(style);
    }
    
    function saveSetting(setting, value) {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            if (!users[userIndex].userProfile) {
                users[userIndex].userProfile = {};
            }
            users[userIndex].userProfile[setting] = value;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            // 如果是GPU加速设置，立即应用
            if (setting === 'gpuAcceleration') {
                applyGpuAcceleration();
            }
            
            // 如果是隐藏UI设置，更新页面时钟开关状态
            if (setting === 'hideUiEnabled') {
                updatePageClockToggleState();
            }
        }
    }
    
    function updatePageClockToggleState() {
        var hideUiEnabled = document.getElementById('hideUiEnabled').checked;
        var pageClockEnabled = document.getElementById('pageClockEnabled');
        var pageClockSlider = pageClockEnabled ? pageClockEnabled.nextElementSibling : null;
        var pageClockHint = document.getElementById('pageClockDisabledHint');
        var pageClockSubFeatures = document.getElementById('pageClockSubFeatures');
        
        if (pageClockEnabled) {
            if (hideUiEnabled) {
                pageClockEnabled.disabled = false;
                pageClockEnabled.classList.remove('disabled');
                if (pageClockSlider) {
                    pageClockSlider.classList.remove('disabled');
                }
                if (pageClockHint) {
                    pageClockHint.style.display = 'none';
                }
                if (pageClockSubFeatures && pageClockEnabled.checked) {
                    pageClockSubFeatures.style.display = 'block';
                }
            } else {
                pageClockEnabled.disabled = true;
                pageClockEnabled.checked = false;
                pageClockEnabled.classList.add('disabled');
                if (pageClockSlider) {
                    pageClockSlider.classList.add('disabled');
                }
                if (pageClockHint) {
                    pageClockHint.style.display = 'block';
                }
                if (pageClockSubFeatures) {
                    pageClockSubFeatures.style.display = 'none';
                }
                var timedStartToggle = document.getElementById('pageClockTimedStart');
                var timedStartMinutesInput = document.getElementById('timedStartMinutes');
                var timedStartSecondsInput = document.getElementById('timedStartSeconds');
                var timedStartOptions = document.getElementById('timedStartOptions');
                if (timedStartToggle) {
                    timedStartToggle.checked = false;
                }
                if (timedStartMinutesInput) {
                    timedStartMinutesInput.value = 5;
                }
                if (timedStartSecondsInput) {
                    timedStartSecondsInput.value = 0;
                }
                if (timedStartOptions) {
                    timedStartOptions.style.display = 'none';
                }
                saveSetting('pageClockEnabled', false);
                saveSetting('pageClockTimedStart', false);
                saveSetting('timedStartMinutes', 5);
                saveSetting('timedStartSeconds', 0);
            }
        }
    }
    
    function updatePageClockSubFeaturesVisibility() {
        var pageClockEnabled = document.getElementById('pageClockEnabled');
        var pageClockSubFeatures = document.getElementById('pageClockSubFeatures');
        var timedStartToggle = document.getElementById('pageClockTimedStart');
        var timedStartOptions = document.getElementById('timedStartOptions');
        
        if (pageClockSubFeatures && pageClockEnabled) {
            if (pageClockEnabled.checked && !pageClockEnabled.disabled) {
                pageClockSubFeatures.style.display = 'block';
            } else {
                pageClockSubFeatures.style.display = 'none';
            }
        }
        
        if (timedStartOptions && timedStartToggle) {
            timedStartOptions.style.display = timedStartToggle.checked ? 'block' : 'none';
        }
    }
    
    function loadVersionInfo() {
        // 使用版本管理文件中的login版本号
        var loginVersion = '未知版本';
        if (typeof getVersion === 'function') {
            loginVersion = getVersion('login');
        }
        
        // 更新版本号显示
        var versionNumberElement = document.getElementById('versionNumber');
        if (versionNumberElement) {
            versionNumberElement.textContent = loginVersion;
        }
        
        // 更新侧边栏版本号显示
        var sidebarVersionElement = document.getElementById('sidebarVersion');
        if (sidebarVersionElement) {
            sidebarVersionElement.textContent = '' + loginVersion;
        }
        
        var securityResponseDateElement = document.getElementById('securityResponseDate');
        if (securityResponseDateElement) {
            securityResponseDateElement.textContent = '2024-01-15';
        }
        var versionUpdateTimeElement = document.getElementById('versionUpdateTime');
        if (versionUpdateTimeElement) {
            versionUpdateTimeElement.textContent = '2024-01-15 10:30:00';
        }
        
        var deviceId = localStorage.getItem('deviceUniqueId');
        if (!deviceId) {
            deviceId = generateDeviceId();
            localStorage.setItem('deviceUniqueId', deviceId);
        }
        var deviceUniqueIdElement = document.getElementById('deviceUniqueId');
        if (deviceUniqueIdElement) {
            deviceUniqueIdElement.textContent = deviceId;
        }
    }
    
    function generateDeviceId() {
        var timestamp = Date.now().toString(36);
        var randomPart = Math.random().toString(36).substring(2, 15);
        return timestamp + '-' + randomPart;
    }
    
    function getDeviceInfo() {
        // 获取设备信息
        var deviceInfo = {
            name: '',
            browser: '',
            os: '',
            platform: navigator.platform,
            userAgent: navigator.userAgent
        };
        
        // 检测操作系统
        var userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('windows')) {
            deviceInfo.os = 'Windows';
            deviceInfo.name = 'Windows PC';
        } else if (userAgent.includes('macintosh')) {
            deviceInfo.os = 'macOS';
            deviceInfo.name = 'Mac';
        } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
            deviceInfo.os = 'iOS';
            if (userAgent.includes('iphone')) {
                deviceInfo.name = 'iPhone';
            } else {
                deviceInfo.name = 'iPad';
            }
        } else if (userAgent.includes('android')) {
            deviceInfo.os = 'Android';
            deviceInfo.name = 'Android Device';
        } else {
            deviceInfo.os = 'Unknown';
            deviceInfo.name = 'Unknown Device';
        }
        
        // 检测浏览器
        if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
            deviceInfo.browser = 'Chrome';
        } else if (userAgent.includes('firefox')) {
            deviceInfo.browser = 'Firefox';
        } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
            deviceInfo.browser = 'Safari';
        } else if (userAgent.includes('edg')) {
            deviceInfo.browser = 'Edge';
        } else if (userAgent.includes('opera') || userAgent.includes('opr')) {
            deviceInfo.browser = 'Opera';
        } else {
            deviceInfo.browser = 'Unknown';
        }
        
        return deviceInfo;
    }
    
    function loadDeviceInfo() {
        var deviceInfo = getDeviceInfo();
        var devicesList = document.getElementById('devicesList');
        
        if (devicesList) {
            // 清空现有设备列表
            devicesList.innerHTML = '';
            
            // 创建当前设备项
            var currentDeviceItem = document.createElement('div');
            currentDeviceItem.className = 'device-item current';
            currentDeviceItem.innerHTML = `
                <div class="device-icon">
                    <i class="fas ${deviceInfo.os === 'Windows' || deviceInfo.os === 'macOS' ? 'fa-laptop' : 'fa-mobile-alt'}"></i>
                </div>
                <div class="device-info">
                    <div class="device-name">${deviceInfo.name}</div>
                    <div class="device-browser">${deviceInfo.browser} 浏览器</div>
                    <div class="device-time">当前会话</div>
                    <div class="device-location">未知位置</div>
                </div>
                <div class="device-status">
                    <span class="status-badge current">当前设备</span>
                </div>
            `;
            
            devicesList.appendChild(currentDeviceItem);
        }
    }
    
    function loadLoginHistory() {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        var loginHistoryElement = document.getElementById('loginHistory');
        if (loginHistoryElement) {
            // 清空现有登录历史
            loginHistoryElement.innerHTML = '';
            
            if (user && user.loginHistory && user.loginHistory.length > 0) {
                user.loginHistory.forEach(function(record, index) {
                    var historyItem = document.createElement('div');
                    historyItem.className = 'two-factor-item history-item';
                    
                    // 格式化时间
                    var loginTime = new Date(record.timestamp);
                    var formattedTime = loginTime.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    // 确定设备图标
                    var deviceIcon = 'fa-desktop';
                    if (record.device.includes('iPhone') || record.device.includes('iPad') || record.device.includes('Android')) {
                        deviceIcon = 'fa-mobile-alt';
                    }
                    
                    // 确定状态
                    var statusClass = index === 0 ? 'current' : '';
                    var statusText = index === 0 ? '当前设备' : '已登录';
                    var statusIcon = index === 0 ? 'fa-check-circle' : 'fa-times-circle';
                    
                    historyItem.innerHTML = `
                        <div class="two-factor-info">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 5px;">
                                <i class="fas ${deviceIcon}" style="color: #3498db; font-size: 18px;"></i>
                                <div>
                                    <h4 style="margin: 0;">${record.device}</h4>
                                </div>
                            </div>
                            <p style="margin: 0; font-size: 13px; color: #666;">${formattedTime} · ${record.location}</p>
                        </div>
                        <div class="history-actions">
                            <button class="action-btn small danger delete-history-btn" data-index="${index}">
                                <i class="fas fa-trash-alt"></i>
                                删除
                            </button>
                            <div class="history-status ${statusClass}">
                                <i class="fas ${statusIcon}"></i>
                                ${statusText}
                            </div>
                        </div>
                    `;
                    
                    loginHistoryElement.appendChild(historyItem);
                });
                
                // 添加删除按钮点击事件
                document.querySelectorAll('.delete-history-btn').forEach(function(button) {
                    button.addEventListener('click', function() {
                        var index = parseInt(this.getAttribute('data-index'));
                        deleteLoginHistory(index);
                    });
                });
            } else {
                // 显示无登录历史提示
                var noHistoryItem = document.createElement('div');
                noHistoryItem.className = 'two-factor-item history-item';
                noHistoryItem.innerHTML = `
                    <div class="two-factor-info" style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 5px;">
                            <i class="fas fa-history" style="color: #999; font-size: 18px;"></i>
                            <div>
                                <h4 style="margin: 0;">无登录历史</h4>
                            </div>
                        </div>
                        <p style="margin: 0; font-size: 13px; color: #666;">暂无登录记录</p>
                    </div>
                `;
                
                loginHistoryElement.appendChild(noHistoryItem);
            }
        }
        
        // 绑定清除所有按钮点击事件
        var clearAllBtn = document.getElementById('clearAllLoginHistory');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function() {
                clearAllLoginHistory();
            });
        }
    }
    
    function deleteLoginHistory(index) {
        // 显示确认弹窗
        var modal = document.createElement('div');
        modal.className = 'custom-alert';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="alert-content" style="max-width: 400px;">
                <div class="alert-icon" style="color: #f39c12;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>确认删除</h3>
                <p style="color: #666; margin: 15px 0;">您确认要删除该条记录吗？删除后将无法恢复。</p>
                <div class="modal-buttons">
                    <button class="alert-confirm" id="deleteCancel" style="background-color: #95a5a6;">取消</button>
                    <button class="alert-confirm" id="deleteConfirm" style="background-color: #e74c3c;">确认删除</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
        
        // 点击取消按钮
        document.getElementById('deleteCancel').addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // 点击确认删除按钮
        document.getElementById('deleteConfirm').addEventListener('click', function() {
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var user = users.find(function(u) {
                return u.username === currentUser.username;
            });
            
            if (user && user.loginHistory && user.loginHistory.length > index) {
                // 从登录历史中删除指定记录
                user.loginHistory.splice(index, 1);
                
                // 保存更新后的用户信息
                var userIndex = users.findIndex(function(u) {
                    return u.username === currentUser.username;
                });
                if (userIndex !== -1) {
                    users[userIndex] = user;
                    localStorage.setItem('registeredUsers', JSON.stringify(users));
                }
                
                // 重新加载登录历史
                loadLoginHistory();
                
                showAlert('登录记录已删除');
            }
            
            modal.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(modal);
            }, 300);
        });
    }
    
    function clearAllLoginHistory() {
        // 显示确认弹窗
        var modal = document.createElement('div');
        modal.className = 'custom-alert';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="alert-content" style="max-width: 400px;">
                <div class="alert-icon" style="color: #e74c3c;">
                    <i class="fas fa-trash-alt"></i>
                </div>
                <h3>确认删除</h3>
                <p style="color: #666; margin: 15px 0;">您确认要删除所有登录历史记录吗？删除后将无法恢复。</p>
                <div class="modal-buttons">
                    <button class="alert-confirm" id="clearAllCancel" style="background-color: #95a5a6;">取消</button>
                    <button class="alert-confirm" id="clearAllConfirm" style="background-color: #e74c3c;">确认删除</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
        
        // 点击取消按钮
        document.getElementById('clearAllCancel').addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // 点击确认删除按钮
        document.getElementById('clearAllConfirm').addEventListener('click', function() {
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var user = users.find(function(u) {
                return u.username === currentUser.username;
            });
            
            if (user) {
                // 清空所有登录历史
                user.loginHistory = [];
                
                // 保存更新后的用户信息
                var userIndex = users.findIndex(function(u) {
                    return u.username === currentUser.username;
                });
                if (userIndex !== -1) {
                    users[userIndex] = user;
                    localStorage.setItem('registeredUsers', JSON.stringify(users));
                }
                
                // 重新加载登录历史
                loadLoginHistory();
                
                showAlert('所有登录记录已删除');
            }
            
            modal.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(modal);
            }, 300);
        });
    }
    
    function loadUserSettings() {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        var userProfile = user && user.userProfile ? user.userProfile : {};
        
        var darkMode = SettingsManager.get('darkMode');
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        if (userProfile.bio) {
            document.getElementById('accountBio').value = userProfile.bio;
            updateBioCount();
        }
        
        if (userProfile.customAvatar) {
            var customAvatarOption = document.getElementById('customAvatarOption');
            customAvatarOption.style.backgroundImage = 'url(' + userProfile.customAvatar + ')';
            customAvatarOption.style.backgroundSize = 'cover';
            customAvatarOption.style.backgroundPosition = 'center';
            customAvatarOption.innerHTML = '';
            updateAvatar('custom');
        } else if (userProfile.avatar) {
            updateAvatar(userProfile.avatar);
        }
        
        if (userProfile.theme) {
            setTheme(userProfile.theme);
        }
        
        updateThemeDisplay();
        
        var savedLanguage = SettingsManager.get('language');
        if (savedLanguage) {
            document.getElementById('languageSelect').value = savedLanguage;
        } else if (userProfile.language) {
            document.getElementById('languageSelect').value = userProfile.language;
        }
        
        if (userProfile.publicProfile !== undefined) {
            document.getElementById('publicProfile').checked = userProfile.publicProfile;
        }
        
        if (userProfile.showOnlineStatus !== undefined) {
            document.getElementById('showOnlineStatus').checked = userProfile.showOnlineStatus;
        }
        
        if (userProfile.allowFriendRequests !== undefined) {
            document.getElementById('allowFriendRequests').checked = userProfile.allowFriendRequests;
        }
        
        if (userProfile.strangerMessages !== undefined) {
            document.getElementById('strangerMessages').checked = userProfile.strangerMessages;
        }
        
        if (userProfile.readReceipts !== undefined) {
            document.getElementById('readReceipts').checked = userProfile.readReceipts;
        }
        
        if (userProfile.systemNotifications !== undefined) {
            document.getElementById('systemNotifications').checked = userProfile.systemNotifications;
        }
        
        if (userProfile.gameNotifications !== undefined) {
            document.getElementById('gameNotifications').checked = userProfile.gameNotifications;
        }
        
        if (userProfile.activityNotifications !== undefined) {
            document.getElementById('activityNotifications').checked = userProfile.activityNotifications;
        }
        
        if (userProfile.marketingNotifications !== undefined) {
            document.getElementById('marketingNotifications').checked = userProfile.marketingNotifications;
        }
        
        if (userProfile.notificationVolume !== undefined) {
            document.getElementById('notificationVolume').value = userProfile.notificationVolume;
            document.getElementById('notificationVolume').nextElementSibling.textContent = userProfile.notificationVolume + '%';
        }
        
        if (userProfile.messageVolume !== undefined) {
            document.getElementById('messageVolume').value = userProfile.messageVolume;
            document.getElementById('messageVolume').nextElementSibling.textContent = userProfile.messageVolume + '%';
        }
        
        if (userProfile.gpuAcceleration !== undefined) {
            document.getElementById('gpuAcceleration').checked = userProfile.gpuAcceleration;
        }
        
        if (userProfile.hideUiEnabled !== undefined) {
            document.getElementById('hideUiEnabled').checked = userProfile.hideUiEnabled;
        }
        
        if (userProfile.aboutLauncherEnabled !== undefined) {
            document.getElementById('aboutLauncherEnabled').checked = userProfile.aboutLauncherEnabled;
        }
        
        if (userProfile.pageClockEnabled !== undefined) {
            document.getElementById('pageClockEnabled').checked = userProfile.pageClockEnabled;
        }
        
        if (userProfile.pageClockTimedStart !== undefined) {
            document.getElementById('pageClockTimedStart').checked = userProfile.pageClockTimedStart;
        }
        
        if (userProfile.timedStartMinutes !== undefined) {
            document.getElementById('timedStartMinutes').value = userProfile.timedStartMinutes;
        }
        
        if (userProfile.timedStartSeconds !== undefined) {
            document.getElementById('timedStartSeconds').value = userProfile.timedStartSeconds;
        }
        
        if (userProfile.guideEnabled !== undefined) {
            document.getElementById('guideEnabled').checked = userProfile.guideEnabled;
        }
        
        if (userProfile.uiScaleEnabled !== undefined) {
            document.getElementById('uiScaleEnabled').checked = userProfile.uiScaleEnabled;
        }
        
        updatePageClockToggleState();
        updatePageClockSubFeaturesVisibility();
        
        // 应用GPU加速设置
        applyGpuAcceleration();
        
        // 加载背景设置
        if (userProfile.background) {
            var backgroundSettings = userProfile.background;
            
            // 更新表单
            document.getElementById('backgroundFit').value = backgroundSettings.fit || 'cover';
            document.getElementById('backgroundOpacity').value = backgroundSettings.opacity || 1;
            document.getElementById('opacityValue').textContent = Math.round((backgroundSettings.opacity || 1) * 100) + '%';
            document.getElementById('backgroundBlur').value = backgroundSettings.blur || 0;
            document.getElementById('blurValue').textContent = (backgroundSettings.blur || 0) + 'px';
            
            // 更新预览
            if (backgroundSettings.image) {
                var preview = document.getElementById('backgroundPreview');
                preview.innerHTML = '';
                preview.style.backgroundImage = 'url(' + backgroundSettings.image + ')';
                preview.style.backgroundSize = backgroundSettings.fit || 'cover';
                preview.style.backgroundPosition = 'center';
            }
            
            // 如非 IndexedDB 背景图片，这里不做处理（由 loadBackgroundSettings 处理）
            if (!backgroundSettings.useIndexedDB) {
                applyBackgroundToPage(backgroundSettings);
                localStorage.setItem('customBackground', JSON.stringify(backgroundSettings));
            }
        }
    }
    
    function applyGpuAcceleration() {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        var gpuAcceleration = user && user.userProfile && user.userProfile.gpuAcceleration;
        
        if (gpuAcceleration) {
            // 启用GPU加速
            document.body.style.transform = 'translateZ(0)';
            document.body.style.willChange = 'transform';
            document.body.style.backfaceVisibility = 'hidden';
            
            // 添加CSS样式启用GPU加速
            var style = document.createElement('style');
            style.id = 'gpu-acceleration-style';
            style.textContent = `
                * {
                    transform: translateZ(0);
                    will-change: transform;
                    backface-visibility: hidden;
                }
                
                .settings-container {
                    transform: translateZ(0);
                }
                
                .section-card {
                    transform: translateZ(0);
                }
                
                .menu-item {
                    transform: translateZ(0);
                }
            `;
            
            var existingStyle = document.getElementById('gpu-acceleration-style');
            if (existingStyle) {
                existingStyle.remove();
            }
            document.head.appendChild(style);
        } else {
            // 禁用GPU加速
            document.body.style.transform = '';
            document.body.style.willChange = '';
            document.body.style.backfaceVisibility = '';
            
            var existingStyle = document.getElementById('gpu-acceleration-style');
            if (existingStyle) {
                existingStyle.remove();
            }
        }
    }
    

    
    function resetAllSettings() {
        var defaultProfile = {
            avatar: 'user',
            bio: '',
            publicProfile: true,
            showOnlineStatus: true,
            allowFriendRequests: true,
            strangerMessages: false,
            readReceipts: true,
            systemNotifications: true,
            gameNotifications: true,
            activityNotifications: true,
            marketingNotifications: false,
            notificationVolume: 80,
            messageVolume: 80,
            language: 'zh',
            theme: 'auto'
        };
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            users[userIndex].userProfile = defaultProfile;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
        
        SettingsManager.set('darkMode', false);
        SettingsManager.set('language', 'zh');
        
        showAlert('所有设置已重置');
        
        setTimeout(function() {
            location.reload();
        }, 500);
    }
    
    function exportUserData() {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        if (user) {
            // 收集所有用户数据
            var userData = {
                // 基本信息
                username: user.username,
                userId: user.userId,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin || null,
                
                // 用户个人资料
                userProfile: user.userProfile || {
                    bio: '',
                    publicProfile: true,
                    showOnlineStatus: true,
                    allowFriendRequests: true,
                    strangerMessages: false,
                    readReceipts: true,
                    systemNotifications: true,
                    gameNotifications: true,
                    activityNotifications: true,
                    marketingNotifications: false,
                    notificationVolume: 80,
                    messageVolume: 80,
                    language: 'zh',
                    theme: 'auto'
                },
                
                // 游戏数据
                gameData: user.gameData || {},
                
                // 登录历史
                loginHistory: user.loginHistory || [],
                
                // 设备管理
                devices: user.devices || [],
                
                // 社交数据
                friends: user.friends || [],
                friendRequests: user.friendRequests || [],
                
                // 通知设置
                notificationSettings: user.notificationSettings || {
                    systemNotifications: true,
                    gameNotifications: true,
                    activityNotifications: true,
                    marketingNotifications: false
                },
                
                // 安全设置
                securitySettings: user.securitySettings || {
                    twoFactorAuth: false,
                    loginAlerts: true,
                    sessionManagement: []
                },
                
                // 导出时间
                exportedAt: new Date().toISOString()
            };
            
            // 收集本地存储中的其他相关数据
            var additionalData = {
                currentUserAvatar: localStorage.getItem('currentUserAvatar') || null,
                customBackground: localStorage.getItem('customBackground') || null
            };
            
            // 将额外数据添加到导出数据中
            userData.additionalData = additionalData;
            
            var dataStr = JSON.stringify(userData, null, 2);
            var blob = new Blob([dataStr], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            
            var a = document.createElement('a');
            a.href = url;
            a.download = 'user_data_' + user.username + '_' + new Date().toISOString().split('T')[0] + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showAlert('数据导出成功');
        }
    }
    
    function importUserData(importedData) {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(u) {
            return u.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            var user = users[userIndex];
            
            // 导入基本信息
            if (importedData.lastLogin) {
                user.lastLogin = importedData.lastLogin;
            }
            
            // 导入用户个人资料
            if (importedData.userProfile) {
                user.userProfile = importedData.userProfile;
            }
            
            // 导入游戏数据
            if (importedData.gameData) {
                user.gameData = importedData.gameData;
            }
            
            // 导入登录历史
            if (importedData.loginHistory) {
                user.loginHistory = importedData.loginHistory;
            }
            
            // 导入设备管理
            if (importedData.devices) {
                user.devices = importedData.devices;
            }
            
            // 导入社交数据
            if (importedData.friends) {
                user.friends = importedData.friends;
            }
            if (importedData.friendRequests) {
                user.friendRequests = importedData.friendRequests;
            }
            
            // 导入通知设置
            if (importedData.notificationSettings) {
                user.notificationSettings = importedData.notificationSettings;
            }
            
            // 导入安全设置
            if (importedData.securitySettings) {
                user.securitySettings = importedData.securitySettings;
            }
            
            // 导入额外数据
            if (importedData.additionalData) {
                if (importedData.additionalData.currentUserAvatar) {
                    localStorage.setItem('currentUserAvatar', importedData.additionalData.currentUserAvatar);
                }
                if (importedData.additionalData.customBackground) {
                    localStorage.setItem('customBackground', importedData.additionalData.customBackground);
                }
            }
            
            // 保存更新后的用户数据
            users[userIndex] = user;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            showAlert('数据导入成功');
            
            // 刷新页面以应用更改
            setTimeout(function() {
                location.reload();
            }, 1500);
        }
    }
    
    function clearCache(options) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(u) {
            return u.username === currentUser.username;
        });
        
        if (options.includes('all')) {
            // 清除所有缓存数据，但保留用户账户数据
            // 清除头像数据
            localStorage.removeItem('currentUserAvatar');
            if (userIndex !== -1 && users[userIndex].userProfile) {
                delete users[userIndex].userProfile.avatar;
                delete users[userIndex].userProfile.customAvatars;
            }
            
            // 清除背景数据
            localStorage.removeItem('customBackground');
            if (userIndex !== -1 && users[userIndex].userProfile) {
                delete users[userIndex].userProfile.background;
                delete users[userIndex].userProfile.customBackgrounds;
            }
            
            // 清除主题数据
            if (userIndex !== -1 && users[userIndex].userProfile) {
                users[userIndex].userProfile.theme = 'auto';
                delete users[userIndex].userProfile.customTheme;
            }
            
            // 清除登录历史数据
            if (userIndex !== -1) {
                delete users[userIndex].loginHistory;
            }
            
            // 清除其他缓存数据
            localStorage.removeItem('language');
            localStorage.removeItem('darkMode');
            localStorage.removeItem('glassMode');
            localStorage.removeItem('fxqGamesPlayed');
            localStorage.removeItem('fkGamesPlayed');
            localStorage.removeItem('memoryGamesPlayed');
            localStorage.removeItem('colorGamesPlayed');
            localStorage.removeItem('achievements');
            localStorage.removeItem('skipSecurityVerify');
            localStorage.removeItem('skipSecurityVerifyExpire');
            
            // 保存更新后的用户数据
            if (userIndex !== -1) {
                localStorage.setItem('registeredUsers', JSON.stringify(users));
            }
            
            showAlert('缓存已清除，请重新登录');
            setTimeout(function() {
                document.body.classList.add('page-transition-out');
                setTimeout(function() {
                    window.location.href = '../index.html';
                }, 500);
            }, 1500);
        } else {
            // 清除选定的数据
            options.forEach(function(option) {
                switch(option) {
                    case 'avatars':
                        // 清除头像数据
                        localStorage.removeItem('currentUserAvatar');
                        if (userIndex !== -1 && users[userIndex].userProfile) {
                            delete users[userIndex].userProfile.avatar;
                            delete users[userIndex].userProfile.customAvatars;
                        }
                        break;
                    case 'backgrounds':
                        // 清除背景数据
                        localStorage.removeItem('customBackground');
                        if (userIndex !== -1 && users[userIndex].userProfile) {
                            delete users[userIndex].userProfile.background;
                            delete users[userIndex].userProfile.customBackgrounds;
                        }
                        break;
                    case 'themes':
                        // 清除主题数据
                        if (userIndex !== -1 && users[userIndex].userProfile) {
                            users[userIndex].userProfile.theme = 'auto';
                            delete users[userIndex].userProfile.customTheme;
                        }
                        break;
                    case 'loginHistory':
                        // 清除登录历史数据
                        if (userIndex !== -1) {
                            delete users[userIndex].loginHistory;
                        }
                        break;
                }
            });
            
            // 保存更新后的用户数据
            if (userIndex !== -1) {
                localStorage.setItem('registeredUsers', JSON.stringify(users));
            }
            
            showAlert('选定的数据已清除');
            // 刷新页面以应用更改
            setTimeout(function() {
                location.reload();
            }, 1500);
        }
    }
    
    function deleteAccount() {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            // 标记用户为注销状态，并设置注销时间
            users[userIndex].isDeleting = true;
            users[userIndex].deleteRequestTime = new Date().getTime();
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('savedPassword');
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('currentUserAvatar');
        localStorage.removeItem('customBackground');
        localStorage.removeItem('skipSecurityVerify');
        localStorage.removeItem('skipSecurityVerifyExpire');
        
        // 显示账户注销成功弹窗
        showDeleteSuccessModal();
    }

    // 显示账户注销成功弹窗
    function showDeleteSuccessModal() {
        var modal = document.createElement('div');
        modal.className = 'custom-alert';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="alert-content" style="max-width: 400px;">
                <div class="alert-icon" style="color: #4CAF50;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>账户注销成功</h3>
                <p style="color: #666; margin: 15px 0;">您有七天时间的等待期以便账户彻底完成注销，在此期间内任意一次登录都将视为取消注销操作。</p>
                <div class="modal-buttons">
                    <button class="alert-confirm" id="deleteSuccessConfirm">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
        
        // 点击确定按钮后跳转到登录页
        document.getElementById('deleteSuccessConfirm').addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(modal);
                document.body.classList.add('page-transition-out');
                setTimeout(function() {
                    window.location.href = '../index.html';
                }, 500);
            }, 300);
        });
    }
    
    function handleLogout() {
        // 获取当前用户信息
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var username = currentUser.username;
        
        // 更新登录历史状态
        if (username) {
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var user = users.find(function(u) {
                return u.username === username;
            });
            
            if (user && user.loginHistory && user.loginHistory.length > 0) {
                // 更新最新的登录记录状态为"已退出"
                user.loginHistory[0].status = '已退出';
                
                // 保存更新后的用户信息
                var userIndex = users.findIndex(function(u) {
                    return u.username === username;
                });
                if (userIndex !== -1) {
                    users[userIndex] = user;
                    localStorage.setItem('registeredUsers', JSON.stringify(users));
                }
            }
        }
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('savedPassword');
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('currentUserAvatar');
        localStorage.removeItem('customBackground');
        localStorage.removeItem('skipSecurityVerify');
        localStorage.removeItem('skipSecurityVerifyExpire');
        
        showAlert('已退出登录');
        
        setTimeout(function() {
            document.body.classList.add('page-transition-out');
            setTimeout(function() {
                window.location.href = '../index.html';
            }, 500);
        }, 1000);
    }
    
    // 自定义背景功能
    function handleBackgroundUpload(event) {
        var file = event.target.files[0];
        
        if (!file) {
            return;
        }
        
        var maxSize = 20 * 1024 * 1024; // 20MB
        var warningSize = 5 * 1024 * 1024; // 5MB
        
        var supportedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
            'image/webp', 'image/bmp', 'image/x-icon'
        ];
        
        if (file.size > maxSize) {
            showAlert('背景图片文件大小不能超过20MB');
            event.target.value = '';
            return;
        }
        
        if (!file.type.match('image.*')) {
            showAlert('请选择图片文件');
            event.target.value = '';
            return;
        }
        
        if (file.type && supportedTypes.indexOf(file.type) === -1) {
            showAlert('不支持的图片格式，请使用 JPG、PNG、GIF、WebP 或 BMP 格式');
            event.target.value = '';
            return;
        }
        
        if (file.size > warningSize) {
            showConfirm('您正在上传的图片文件已大于5MB，继续使用会出现页面背景加载不及时的问题，是否继续操作？', function(confirm) {
                if (confirm) {
                    processBackgroundUpload(file, event);
                } else {
                    event.target.value = '';
                }
            });
        } else {
            processBackgroundUpload(file, event);
        }
    }
    
    function processBackgroundUpload(file, event) {
        var preview = document.getElementById('backgroundPreview');
        preview.innerHTML = '<div class="preview-loading"><i class="fas fa-spinner fa-spin"></i><span>处理中...</span></div>';
        
        var reader = new FileReader();
        var timeoutId = null;
        var isDone = false;
        
        timeoutId = setTimeout(function() {
            if (!isDone) {
                isDone = true;
                reader.abort();
                console.error('图片处理超时');
                showAlert('图片处理超时，请尝试使用较小的图片');
                event.target.value = '';
                preview.innerHTML = '<div class="preview-placeholder"><i class="fas fa-image"></i><span>预览</span></div>';
            }
        }, 30000);
        
        reader.onload = function(e) {
            if (isDone) return;
            isDone = true;
            clearTimeout(timeoutId);
            
            try {
                var base64 = e.target.result;
                
                preview.innerHTML = '';
                
                var img = new Image();
                img.onerror = function() {
                    console.error('图片格式无效，无法解码');
                    showAlert('图片格式无效或已损坏，请尝试其他图片');
                    event.target.value = '';
                    preview.innerHTML = '<div class="preview-placeholder"><i class="fas fa-image"></i><span>预览</span></div>';
                };
                
                img.onload = function() {
                    preview.style.backgroundImage = 'url(' + base64 + ')';
                    preview.style.backgroundSize = 'cover';
                    preview.style.backgroundPosition = 'center';
                    window.tempBackground = base64;
                    
                    // 显示背景详情区域
                    showBackgroundDetails();
                };
                
                img.src = base64;
            } catch (e) {
                console.error('图片处理失败:', e);
                showAlert('图片处理失败，请重试');
                event.target.value = '';
                preview.innerHTML = '<div class="preview-placeholder"><i class="fas fa-image"></i><span>预览</span></div>';
            }
        };
        
        reader.onerror = function() {
            if (isDone) return;
            isDone = true;
            clearTimeout(timeoutId);
            showAlert('背景图片上传失败，请重试');
            event.target.value = '';
            preview.innerHTML = '<div class="preview-placeholder"><i class="fas fa-image"></i><span>预览</span></div>';
        };
        
        reader.onabort = function() {
            if (isDone) return;
            isDone = true;
            clearTimeout(timeoutId);
        };
        
        reader.readAsDataURL(file);
    }
    
    function showConfirm(message, callback) {
        var confirmBox = document.createElement('div');
        confirmBox.className = 'custom-confirm';
        confirmBox.innerHTML = `
            <div class="confirm-content">
                <div class="confirm-icon"><i class="fas fa-exclamation-circle"></i></div>
                <div class="confirm-message">${message}</div>
                <div class="confirm-buttons">
                    <button class="confirm-btn cancel">取消</button>
                    <button class="confirm-btn confirm">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmBox);
        
        // 添加动画
        setTimeout(function() {
            confirmBox.classList.add('show');
        }, 10);
        
        // 绑定按钮事件
        confirmBox.querySelector('.cancel').addEventListener('click', function() {
            confirmBox.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(confirmBox);
                callback(false);
            }, 300);
        });
        
        confirmBox.querySelector('.confirm').addEventListener('click', function() {
            confirmBox.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(confirmBox);
                callback(true);
            }, 300);
        });
    }
    
    function saveBackgroundSettings() {
        var backgroundImage = window.tempBackground;
        var fit = document.getElementById('backgroundFit').value;
        var opacity = parseFloat(document.getElementById('backgroundOpacity').value);
        var blur = parseInt(document.getElementById('backgroundBlur').value);
        
        if (!backgroundImage) {
            showAlert('请先上传背景图片');
            return;
        }
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex === -1) {
            showAlert('用户未找到');
            return;
        }
        
        var userId = users[userIndex].userId || currentUser.username;
        
        // 显示加载状态
        var preview = document.getElementById('backgroundPreview');
        var originalContent = preview.innerHTML;
        preview.innerHTML = '<div class="preview-loading"><i class="fas fa-spinner fa-spin"></i><span>保存中...</span></div>';
        
        // 存储背景图片到IndexedDB
        storeBackgroundInIndexedDB(backgroundImage, userId).then(function() {
            // 只保存设置信息到localStorage，不保存图片本身
            // 其他页面会通过IndexedDB来读取图片数据
            var backgroundSettings = {
                fit: fit,
                opacity: opacity,
                blur: blur,
                useIndexedDB: true
            };
            
            try {
                // 保存到用户配置
                if (!users[userIndex].userProfile) {
                    users[userIndex].userProfile = {};
                }
                users[userIndex].userProfile.background = backgroundSettings;
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                
                // 保存到localStorage供其他页面使用
                localStorage.setItem('customBackground', JSON.stringify(backgroundSettings));
                
                // 应用到当前页面
                applyBackgroundToPage({
                    image: backgroundImage,
                    fit: fit,
                    opacity: opacity,
                    blur: blur
                });
                
                // 恢复预览
                preview.innerHTML = originalContent;
                
                showAlert('背景设置已保存');
            } catch (e) {
                console.error('保存背景设置失败:', e);
                preview.innerHTML = originalContent;
                showAlert('保存背景设置失败，请重试');
            }
        }).catch(function(error) {
            console.error('存储背景图片失败:', error);
            preview.innerHTML = originalContent;
            showAlert('存储背景图片失败，请重试');
        });
    }
    
    function resetBackgroundSettings() {
        // 清除临时变量
        window.tempBackground = null;
        
        // 重置表单
        document.getElementById('backgroundUpload').value = '';
        document.getElementById('backgroundFit').value = 'cover';
        document.getElementById('backgroundOpacity').value = 1;
        document.getElementById('opacityValue').textContent = '100%';
        document.getElementById('backgroundBlur').value = 0;
        document.getElementById('blurValue').textContent = '0px';
        
        // 重置预览
        var preview = document.getElementById('backgroundPreview');
        preview.innerHTML = '<div class="preview-placeholder"><i class="fas fa-image"></i><span>预览</span></div>';
        
        // 从用户配置中移除
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            var userId = users[userIndex].userId || currentUser.username;
            
            // 从IndexedDB中删除背景图片
            deleteBackgroundFromIndexedDB(userId).then(function() {
                console.log('背景图片已从IndexedDB中删除');
            }).catch(function(error) {
                console.error('从IndexedDB中删除背景图片失败:', error);
            });
            
            if (users[userIndex].userProfile) {
                delete users[userIndex].userProfile.background;
                localStorage.setItem('registeredUsers', JSON.stringify(users));
            }
        }
        
        // 从localStorage中移除
        localStorage.removeItem('customBackground');
        
        // 移除背景
        removeBackgroundFromPage();
        
        // 隐藏背景详情区域
        hideBackgroundDetails();
        
        showAlert('背景设置已重置');
    }
    
    function showBackgroundDetails() {
        var details = document.getElementById('backgroundDetails');
        if (details) {
            details.classList.add('show');
        }
    }
    
    function hideBackgroundDetails() {
        var details = document.getElementById('backgroundDetails');
        if (details) {
            details.classList.remove('show');
        }
    }
    
    function applyBackgroundToPage(backgroundSettings) {
        // 移除现有的背景样式
        removeBackgroundFromPage();
        
        // 如果没有背景设置，直接返回
        if (!backgroundSettings) {
            return;
        }
        
        // 创建新的背景样式
        var style = document.createElement('style');
        style.id = 'custom-background-style';
        
        var backgroundImage = backgroundSettings.image;
        var fit = backgroundSettings.fit;
        var opacity = backgroundSettings.opacity;
        var blur = backgroundSettings.blur;
        
        // 根据当前页面位置调整图片路径
        var currentPath = window.location.pathname;
        var imageUrl = backgroundImage;
        
        // 如果图片路径是相对路径且不是绝对URL，也不是data URL，根据页面位置调整
        if (backgroundImage && 
            !backgroundImage.startsWith('http://') && 
            !backgroundImage.startsWith('https://') && 
            !backgroundImage.startsWith('/') && 
            !backgroundImage.startsWith('data:')) {
            if (currentPath.includes('/html/')) {
                // 在 html 目录下，需要添加 ../
                imageUrl = '../' + backgroundImage;
            }
        }
        
        var isDarkMode = document.body.classList.contains('dark-mode');
        var mainBg = isDarkMode ? 'rgba(20, 20, 30, 0)' : 'rgba(255, 255, 255, 0)';
        
        if (fit === 'content') {
            style.textContent = `
                body {
                    background: linear-gradient(135deg, #f0f9ff 0%, #dceeff 100%);
                }
                
                .settings-main {
                    background: ${mainBg} !important;
                }
                
                .settings-content, .content-container, .main-content {
                    position: relative;
                }
                
                .settings-content::before, .content-container::before, .main-content::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-image: url('${imageUrl}');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    opacity: ${opacity};
                    filter: blur(${blur}px);
                    z-index: -1;
                }
            `;
        } else {
            style.textContent = `
                body {
                    background: linear-gradient(135deg, #f0f9ff 0%, #dceeff 100%);
                    position: relative;
                }
                
                body::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-image: url('${imageUrl}');
                    background-size: ${fit};
                    background-position: center;
                    background-repeat: ${fit === 'repeat' ? 'repeat' : 'no-repeat'};
                    opacity: ${opacity};
                    filter: blur(${blur}px);
                    z-index: -1;
                }
                
                .settings-main {
                    background: ${mainBg} !important;
                }
            `;
        }
        
        document.head.appendChild(style);
    }
    
    function removeBackgroundFromPage() {
        var existingStyle = document.getElementById('custom-background-style');
        if (existingStyle) {
            existingStyle.remove();
        }
    }
    
    function loadBackgroundSettings() {
        // 从当前登录用户的配置中加载背景设置
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        if (user && user.userProfile && user.userProfile.background) {
            try {
                var backgroundSettings = user.userProfile.background;
                
                // 检查是否使用IndexedDB存储
                if (backgroundSettings.useIndexedDB) {
                    var userId = user.userId || currentUser.username;
                    
                    // 从IndexedDB中读取背景图片
                    getBackgroundFromIndexedDB(userId).then(function(imageData) {
                        if (imageData) {
                            // 应用背景到当前页面
                            applyBackgroundToPage({
                                image: imageData,
                                fit: backgroundSettings.fit,
                                opacity: backgroundSettings.opacity,
                                blur: backgroundSettings.blur
                            });
                            
                            // 更新表单
                            window.tempBackground = imageData;
                            document.getElementById('backgroundFit').value = backgroundSettings.fit;
                            document.getElementById('backgroundOpacity').value = backgroundSettings.opacity;
                            document.getElementById('opacityValue').textContent = Math.round(backgroundSettings.opacity * 100) + '%';
                            document.getElementById('backgroundBlur').value = backgroundSettings.blur;
                            document.getElementById('blurValue').textContent = backgroundSettings.blur + 'px';
                            
                            // 更新预览
                            var preview = document.getElementById('backgroundPreview');
                            preview.innerHTML = '';
                            preview.style.backgroundImage = 'url(' + imageData + ')';
                            preview.style.backgroundSize = backgroundSettings.fit || 'cover';
                            preview.style.backgroundPosition = 'center';
                            
                            // 保存设置信息到localStorage供其他页面使用
                            // 不保存图片数据，其他页面会通过IndexedDB读取
                            localStorage.setItem('customBackground', JSON.stringify(backgroundSettings));
                            
                            // 显示背景详情区域
                            showBackgroundDetails();
                        } else {
                            // 如果IndexedDB中没有图片，清除背景设置
                            localStorage.removeItem('customBackground');
                            applyBackgroundToPage(null);
                        }
                    }).catch(function(error) {
                        console.error('从IndexedDB读取背景图片失败:', error);
                        // 清除背景设置
                        localStorage.removeItem('customBackground');
                        applyBackgroundToPage(null);
                    });
                } else {
                    // 传统方式，直接从localStorage读取
                    applyBackgroundToPage(backgroundSettings);
                    
                    // 更新表单
                    window.tempBackground = backgroundSettings.image;
                    document.getElementById('backgroundFit').value = backgroundSettings.fit;
                    document.getElementById('backgroundOpacity').value = backgroundSettings.opacity;
                    document.getElementById('opacityValue').textContent = Math.round(backgroundSettings.opacity * 100) + '%';
                    document.getElementById('backgroundBlur').value = backgroundSettings.blur;
                    document.getElementById('blurValue').textContent = backgroundSettings.blur + 'px';
                    
                    // 更新预览
                    var preview = document.getElementById('backgroundPreview');
                    preview.innerHTML = '';
                    preview.style.backgroundImage = 'url(' + backgroundSettings.image + ')';
                    preview.style.backgroundSize = backgroundSettings.fit || 'cover';
                    preview.style.backgroundPosition = 'center';
                    
                    // 同步到localStorage供其他页面使用
                    localStorage.setItem('customBackground', JSON.stringify(backgroundSettings));
                    
                    // 显示背景详情区域
                    showBackgroundDetails();
                }
            } catch (e) {
                console.error('加载背景设置失败:', e);
                // 清除背景设置
                localStorage.removeItem('customBackground');
                applyBackgroundToPage(null);
            }
        } else {
            // 清除背景设置
            localStorage.removeItem('customBackground');
            applyBackgroundToPage(null);
        }
    }
    
    function showAlert(message) {
        var alertBox = document.getElementById('customAlert');
        var alertMessage = document.getElementById('alertMessage');
        
        alertMessage.textContent = message;
        alertBox.style.display = 'flex';
        setTimeout(function() {
            alertBox.classList.add('show');
        }, 10);
    }
    
    function hideAlert() {
        var alertBox = document.getElementById('customAlert');
        alertBox.classList.remove('show');
        setTimeout(function() {
            alertBox.style.display = 'none';
        }, 300);
    }
    
    function formatDate(dateString) {
        var date = new Date(dateString);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }
    
    function getUserGameData(gameKey, defaultValue) {
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        if (user && user.gameData && user.gameData[gameKey] !== undefined) {
            return user.gameData[gameKey];
        }
        
        return defaultValue;
    }
    
    var currentGame = 'all';
    
    function loadGameStats() {
        var fkGamesPlayed = getUserGameData('gamesPlayed', 0);
        var fkAchievements = getUserGameData('achievements', []);
        var fkHighScore = getUserGameData('highScore', 0);
        
        var fxqGamesPlayed = getUserGameData('fxqGamesPlayed', 0);
        var fxqAchievements = getUserGameData('fxqAchievements', []);
        var fxqHighScore = getUserGameData('fxqHighScore', 0);
        
        var wzqGamesPlayed = getUserGameData('wzqGamesPlayed', 0);
        var wzqAchievements = getUserGameData('wzqAchievements', []);
        var wzqWins = getUserGameData('wzqWins', 0);
        
        var snakeGamesPlayed = getUserGameData('snakeGamesPlayed', 0);
        var snakeAchievements = getUserGameData('snakeAchievements', []);
        var snakeHighScore = getUserGameData('snakeHighScore', 0);
        var snakeTotalScore = getUserGameData('snakeTotalScore', 0);
        
        var memoryGamesPlayed = getUserGameData('memoryGamesPlayed', 0);
        var memoryAchievements = getUserGameData('memoryAchievements', []);
        var memoryHighScore = getUserGameData('memoryHighScore', 0);
        
        var colorGamesPlayed = getUserGameData('colorGamesPlayed', 0);
        var colorAchievements = getUserGameData('colorAchievements', []);
        var colorHighScore = getUserGameData('colorHighScore', 0);
        var colorTotalScore = getUserGameData('colorTotalScore', 0);
        var colorMaxCombo = getUserGameData('colorMaxCombo', 0);
        
        var totalGames = fkGamesPlayed + fxqGamesPlayed + wzqGamesPlayed + snakeGamesPlayed + memoryGamesPlayed + colorGamesPlayed;
        var totalScore = fkHighScore + fxqHighScore + wzqWins * 100 + snakeTotalScore + memoryHighScore + colorTotalScore;
        var totalWins = fkAchievements.length + fxqAchievements.length + wzqAchievements.length + snakeAchievements.length + memoryAchievements.length + colorAchievements.length;
        var totalPlayTime = Math.floor(totalGames * 0.5);
        
        document.getElementById('totalPlayTime').textContent = totalPlayTime + 'h';
        document.getElementById('totalGames').textContent = totalGames;
        document.getElementById('totalWins').textContent = totalWins;
        document.getElementById('totalScore').textContent = totalScore;
        
        loadCheckinStats();
        
        var allAchievements = fkAchievements.concat(fxqAchievements, wzqAchievements, snakeAchievements, memoryAchievements, colorAchievements);
        updateGameProgress(fkAchievements, 10, 'fk');
        updateGameProgress(fxqAchievements, 10, 'fxq');
        updateGameProgress(wzqAchievements, 10, 'wzq');
        updateGameProgress(snakeAchievements, 10, 'snake');
        updateGameProgress(memoryAchievements, 10, 'memory');
        updateGameProgress(colorAchievements, 10, 'color');
        updateGameProgress(allAchievements, 60, 'all');
        
        fkAchievements.forEach(function(achievementId) {
            saveAchievementTime(achievementId);
        });
        fxqAchievements.forEach(function(achievementId) {
            saveAchievementTime(achievementId);
        });
        wzqAchievements.forEach(function(achievementId) {
            saveAchievementTime(achievementId);
        });
        snakeAchievements.forEach(function(achievementId) {
            saveAchievementTime(achievementId);
        });
        memoryAchievements.forEach(function(achievementId) {
            saveAchievementTime(achievementId);
        });
        colorAchievements.forEach(function(achievementId) {
            saveAchievementTime(achievementId);
        });
        
        var specialAchievements = [];
        if (fkAchievements.length >= 10) {
            specialAchievements.push('fk_complete');
        }
        if (fxqAchievements.length >= 10) {
            specialAchievements.push('fxq_complete');
        }
        if (wzqAchievements.length >= 10) {
            specialAchievements.push('wzq_complete');
        }
        if (snakeAchievements.length >= 10) {
            specialAchievements.push('snake_complete');
        }
        if (memoryAchievements.length >= 10) {
            specialAchievements.push('memory_complete');
        }
        if (colorAchievements.length >= 9) {
            specialAchievements.push('cm_complete');
        }
        updateGameProgress(specialAchievements, 6, 'special');
        
        updateAchievements(fkAchievements, fkGamesPlayed, fkHighScore, fxqAchievements, fxqGamesPlayed, fxqHighScore, wzqAchievements, wzqGamesPlayed, wzqWins, snakeAchievements, snakeGamesPlayed, snakeHighScore, snakeTotalScore, memoryAchievements, memoryGamesPlayed, memoryHighScore, colorAchievements, colorGamesPlayed, colorHighScore, colorTotalScore, colorMaxCombo, specialAchievements);
        
        setupGameSelector();
    }
    
    function updateGameProgress(unlockedAchievements, totalAchievements, gameCode) {
        var unlockedCount = unlockedAchievements.length;
        var progressPercent = Math.min((unlockedCount / totalAchievements) * 100, 100);
        
        var progressFill = document.getElementById(gameCode + '-progress');
        var progressText = document.getElementById(gameCode + '-progress-text');
        var progressPercentText = document.getElementById(gameCode + '-progress-percent');
        
        if (progressFill && progressText) {
            progressFill.style.width = progressPercent + '%';
            progressText.textContent = unlockedCount + '/' + totalAchievements;
        }
        
        if (progressPercentText) {
            progressPercentText.textContent = Math.round(progressPercent) + '%';
        }
    }
    
    function getGameName(gameCode) {
        var gameNames = {
            'fk': '点击方块',
            'fxq': '飞行器',
            'wzq': '五子棋',
            'special': '特殊成就'
        };
        return gameNames[gameCode] || gameCode;
    }
    
    function getAchievementTime(achievementId) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.username) {
            return '';
        }
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        if (!user || !user.achievementTimes) {
            return '';
        }
        
        var timestamp = user.achievementTimes[achievementId];
        if (!timestamp) {
            return '';
        }
        
        var date = new Date(timestamp);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        var hours = String(date.getHours()).padStart(2, '0');
        var minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    
    function saveAchievementTime(achievementId) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.username) {
            return;
        }
        
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(u) {
            return u.username === currentUser.username;
        });
        
        if (userIndex === -1) {
            return;
        }
        
        if (!users[userIndex].achievementTimes) {
            users[userIndex].achievementTimes = {};
        }
        
        if (!users[userIndex].achievementTimes[achievementId]) {
            users[userIndex].achievementTimes[achievementId] = Date.now();
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
    }
    
    var gameSelectorInitialized = false;
    
    function setupGameSelector() {
        if (gameSelectorInitialized) {
            return;
        }
        
        var gameSelectorBtns = document.querySelectorAll('.game-selector-btn');
        gameSelectorBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                gameSelectorBtns.forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                currentGame = this.getAttribute('data-game');
                
                var fkGamesPlayed = getUserGameData('gamesPlayed', 0);
                var fkAchievements = getUserGameData('achievements', []);
                var fkHighScore = getUserGameData('highScore', 0);
                
                var fxqGamesPlayed = getUserGameData('fxqGamesPlayed', 0);
                var fxqAchievements = getUserGameData('fxqAchievements', []);
                var fxqHighScore = getUserGameData('fxqHighScore', 0);
                
                var wzqGamesPlayed = getUserGameData('wzqGamesPlayed', 0);
                var wzqAchievements = getUserGameData('wzqAchievements', []);
                var wzqWins = getUserGameData('wzqWins', 0);
                
                var snakeGamesPlayed = getUserGameData('snakeGamesPlayed', 0);
                var snakeAchievements = getUserGameData('snakeAchievements', []);
                var snakeHighScore = getUserGameData('snakeHighScore', 0);
                var snakeTotalScore = getUserGameData('snakeTotalScore', 0);
                
                var memoryGamesPlayed = getUserGameData('memoryGamesPlayed', 0);
                var memoryAchievements = getUserGameData('memoryAchievements', []);
                var memoryHighScore = getUserGameData('memoryHighScore', 0);
                
                var colorGamesPlayed = getUserGameData('colorGamesPlayed', 0);
                var colorAchievements = getUserGameData('colorAchievements', []);
                var colorHighScore = getUserGameData('colorHighScore', 0);
                var colorTotalScore = getUserGameData('colorTotalScore', 0);
                var colorMaxCombo = getUserGameData('colorMaxCombo', 0);
                
                var allAchievements = fkAchievements.concat(fxqAchievements, wzqAchievements, snakeAchievements, memoryAchievements, colorAchievements);
                updateGameProgress(fkAchievements, 10, 'fk');
                updateGameProgress(fxqAchievements, 10, 'fxq');
                updateGameProgress(wzqAchievements, 10, 'wzq');
                updateGameProgress(snakeAchievements, 10, 'snake');
                updateGameProgress(memoryAchievements, 10, 'memory');
                updateGameProgress(colorAchievements, 10, 'color');
                updateGameProgress(allAchievements, 60, 'all');
                
                var specialAchievements = [];
                if (fkAchievements.length >= 10) {
                    specialAchievements.push('fk_complete');
                }
                if (fxqAchievements.length >= 10) {
                    specialAchievements.push('fxq_complete');
                }
                if (wzqAchievements.length >= 10) {
                    specialAchievements.push('wzq_complete');
                }
                if (snakeAchievements.length >= 10) {
                    specialAchievements.push('snake_complete');
                }
                if (memoryAchievements.length >= 10) {
                    specialAchievements.push('memory_complete');
                }
                if (colorAchievements.length >= 9) {
                    specialAchievements.push('cm_complete');
                }
                updateGameProgress(specialAchievements, 6, 'special');
                
                updateAchievements(fkAchievements, fkGamesPlayed, fkHighScore, fxqAchievements, fxqGamesPlayed, fxqHighScore, wzqAchievements, wzqGamesPlayed, wzqWins, snakeAchievements, snakeGamesPlayed, snakeHighScore, snakeTotalScore, memoryAchievements, memoryGamesPlayed, memoryHighScore, colorAchievements, colorGamesPlayed, colorHighScore, colorTotalScore, colorMaxCombo, specialAchievements);
            });
        });
        
        gameSelectorInitialized = true;
    }
    
    function updateAchievements(fkUnlockedAchievements, fkGamesPlayed, fkHighScore, fxqUnlockedAchievements, fxqGamesPlayed, fxqHighScore, wzqUnlockedAchievements, wzqGamesPlayed, wzqWins, snakeUnlockedAchievements, snakeGamesPlayed, snakeHighScore, snakeTotalScore, memoryUnlockedAchievements, memoryGamesPlayed, memoryHighScore, colorUnlockedAchievements, colorGamesPlayed, colorHighScore, colorTotalScore, colorMaxCombo, specialUnlockedAchievements) {
        var allAchievements = [
            {
                id: 'fk_complete',
                name: '精确点击',
                desc: '解锁点击方块所有成就',
                icon: 'fa-crown',
                game: 'special',
                condition: () => fkUnlockedAchievements.length >= 10
            },
            {
                id: 'fxq_complete',
                name: '操作大师',
                desc: '解锁飞行器所有成就',
                icon: 'fa-crown',
                game: 'special',
                condition: () => fxqUnlockedAchievements.length >= 10
            },
            {
                id: 'wzq_complete',
                name: '精妙对弈',
                desc: '解锁五子棋所有成就',
                icon: 'fa-crown',
                game: 'special',
                condition: () => wzqUnlockedAchievements.length >= 10
            },
            {
                id: 'first_game',
                name: '初试锋芒',
                desc: '完成第一局游戏',
                icon: 'fa-trophy',
                game: 'fk',
                condition: () => fkGamesPlayed >= 1
            },
            {
                id: 'score_100',
                name: '百发百中',
                desc: '单局得分达到100分',
                icon: 'fa-star',
                game: 'fk',
                condition: () => fkHighScore >= 100
            },
            {
                id: 'score_200',
                name: '神射手',
                desc: '单局得分达到200分',
                icon: 'fa-bullseye',
                game: 'fk',
                condition: () => fkHighScore >= 200
            },
            {
                id: 'games_10',
                name: '游戏达人',
                desc: '累计完成10局游戏',
                icon: 'fa-gamepad',
                game: 'fk',
                condition: () => fkGamesPlayed >= 10
            },
            {
                id: 'combo_master',
                name: '连击大师',
                desc: '在一局游戏中连续点击20个方块不失误',
                icon: 'fa-fire',
                game: 'fk',
                condition: () => false
            },
            {
                id: 'speed_king',
                name: '速度之王',
                desc: '在困难难度下，10秒内获得50分',
                icon: 'fa-bolt',
                game: 'fk',
                condition: () => false
            },
            {
                id: 'perfect_start',
                name: '完美开局',
                desc: '在游戏开始前5秒内获得20分',
                icon: 'fa-rocket',
                game: 'fk',
                condition: () => false
            },
            {
                id: 'total_score_1000',
                name: '千分王者',
                desc: '累计获得1000分',
                icon: 'fa-crown',
                game: 'fk',
                condition: () => parseInt(localStorage.getItem('totalScore') || '0') >= 1000
            },
            {
                id: 'games_100',
                name: '百战百胜',
                desc: '累计完成100局游戏',
                icon: 'fa-medal',
                game: 'fk',
                condition: () => fkGamesPlayed >= 100
            },
            {
                id: 'extreme_challenge',
                name: '极限挑战',
                desc: '在困难难度下单局获得300分',
                icon: 'fa-skull',
                game: 'fk',
                condition: () => false
            },
            {
                id: 'fxq_first_game',
                name: '初次飞行',
                desc: '完成第一次飞行',
                icon: 'fa-rocket',
                game: 'fxq',
                condition: () => fxqGamesPlayed >= 1
            },
            {
                id: 'fxq_score_50',
                name: '初级飞行员',
                desc: '单局得分达到50分',
                icon: 'fa-star',
                game: 'fxq',
                condition: () => fxqHighScore >= 50
            },
            {
                id: 'fxq_score_100',
                name: '中级飞行员',
                desc: '单局得分达到100分',
                icon: 'fa-medal',
                game: 'fxq',
                condition: () => fxqHighScore >= 100
            },
            {
                id: 'fxq_score_200',
                name: '高级飞行员',
                desc: '单局得分达到200分',
                icon: 'fa-trophy',
                game: 'fxq',
                condition: () => fxqHighScore >= 200
            },
            {
                id: 'fxq_games_5',
                name: '飞行爱好者',
                desc: '累计完成5局游戏',
                icon: 'fa-plane',
                game: 'fxq',
                condition: () => fxqGamesPlayed >= 5
            },
            {
                id: 'fxq_games_10',
                name: '飞行达人',
                desc: '累计完成10局游戏',
                icon: 'fa-fighter-jet',
                game: 'fxq',
                condition: () => fxqGamesPlayed >= 10
            },
            {
                id: 'fxq_easy_master',
                name: '轻松过关',
                desc: '在简单难度下完成一局游戏',
                icon: 'fa-smile',
                game: 'fxq',
                condition: () => false
            },
            {
                id: 'fxq_hard_master',
                name: '困难征服者',
                desc: '在困难难度下完成一局游戏',
                icon: 'fa-fire',
                game: 'fxq',
                condition: () => false
            },
            {
                id: 'fxq_nightmare_survivor',
                name: '梦魇幸存者',
                desc: '在梦魇难度下完成一局游戏',
                icon: 'fa-skull',
                game: 'fxq',
                condition: () => false
            },
            {
                id: 'fxq_perfect_score',
                name: '完美飞行',
                desc: '单局得分达到300分',
                icon: 'fa-crown',
                game: 'fxq',
                condition: () => fxqHighScore >= 300
            },
            {
                id: 'wzq_first_game',
                name: '初次对弈',
                desc: '完成第一局五子棋',
                icon: 'fa-chess-board',
                game: 'wzq',
                condition: () => wzqGamesPlayed >= 1
            },
            {
                id: 'wzq_first_win',
                name: '首战告捷',
                desc: '赢得第一局五子棋',
                icon: 'fa-trophy',
                game: 'wzq',
                condition: () => wzqWins >= 1
            },
            {
                id: 'wzq_win_5',
                name: '棋艺初成',
                desc: '累计赢得5局游戏',
                icon: 'fa-medal',
                game: 'wzq',
                condition: () => wzqWins >= 5
            },
            {
                id: 'wzq_win_10',
                name: '棋坛新秀',
                desc: '累计赢得10局游戏',
                icon: 'fa-star',
                game: 'wzq',
                condition: () => wzqWins >= 10
            },
            {
                id: 'wzq_games_20',
                name: '棋迷',
                desc: '累计完成20局游戏',
                icon: 'fa-gamepad',
                game: 'wzq',
                condition: () => wzqGamesPlayed >= 20
            },
            {
                id: 'wzq_quick_win',
                name: '速战速决',
                desc: '在30步内赢得比赛',
                icon: 'fa-bolt',
                game: 'wzq',
                condition: () => false
            },
            {
                id: 'wzq_long_game',
                name: '持久战',
                desc: '完成一局超过100步的对局',
                icon: 'fa-hourglass-half',
                game: 'wzq',
                condition: () => false
            },
            {
                id: 'wzq_perfect_win',
                name: '没关就是开了？',
                desc: '在对手未落子的情况下获胜',
                icon: 'fa-crown',
                game: 'wzq',
                condition: () => false
            },
            {
                id: 'wzq_ai_master',
                name: '人机大师',
                desc: '在AI模式下赢得10局',
                icon: 'fa-robot',
                game: 'wzq',
                condition: () => false
            },
            {
                id: 'wzq_veteran',
                name: '五子棋大师',
                desc: '累计赢得50局游戏',
                icon: 'fa-chess-king',
                game: 'wzq',
                condition: () => wzqWins >= 50
            },
            {
                id: 'snake_complete',
                name: '贪吃蛇大师',
                desc: '解锁贪吃蛇所有成就',
                icon: 'fa-crown',
                game: 'special',
                condition: () => snakeUnlockedAchievements.length >= 10
            },
            {
                id: 'snake_first_game',
                name: '初次尝试',
                desc: '完成第一局贪吃蛇游戏',
                icon: 'fa-gamepad',
                game: 'snake',
                condition: () => snakeGamesPlayed >= 1
            },
            {
                id: 'snake_score_50',
                name: '初级贪吃蛇',
                desc: '单局得分达到50分',
                icon: 'fa-star',
                game: 'snake',
                condition: () => snakeHighScore >= 50
            },
            {
                id: 'snake_score_100',
                name: '中级贪吃蛇',
                desc: '单局得分达到100分',
                icon: 'fa-medal',
                game: 'snake',
                condition: () => snakeHighScore >= 100
            },
            {
                id: 'snake_score_200',
                name: '高级贪吃蛇',
                desc: '单局得分达到200分',
                icon: 'fa-trophy',
                game: 'snake',
                condition: () => snakeHighScore >= 200
            },
            {
                id: 'snake_games_5',
                name: '贪吃蛇爱好者',
                desc: '累计完成5局游戏',
                icon: 'fa-apple-alt',
                game: 'snake',
                condition: () => snakeGamesPlayed >= 5
            },
            {
                id: 'snake_games_10',
                name: '贪吃蛇达人',
                desc: '累计完成10局游戏',
                icon: 'fa-gamepad',
                game: 'snake',
                condition: () => snakeGamesPlayed >= 10
            },
            {
                id: 'snake_total_100',
                name: '累计得分王',
                desc: '累计得分达到100分',
                icon: 'fa-chart-line',
                game: 'snake',
                condition: () => snakeTotalScore >= 100
            },
            {
                id: 'snake_total_500',
                name: '贪吃蛇大师',
                desc: '累计得分达到500分',
                icon: 'fa-crown',
                game: 'snake',
                condition: () => snakeTotalScore >= 500
            },
            {
                id: 'snake_perfect_game',
                name: '完美游戏',
                desc: '在一局游戏中没有撞到任何墙壁或自己',
                icon: 'fa-check-circle',
                game: 'snake',
                condition: () => false
            },
            {
                id: 'snake_survivor',
                name: '生存大师',
                desc: '在一局游戏中存活超过2分钟',
                icon: 'fa-clock',
                game: 'snake',
                condition: () => false
            },
            {
                id: 'memory_first_game',
                name: '初次尝试',
                desc: '完成第一局记忆卡牌游戏',
                icon: 'fa-gamepad',
                game: 'memory',
                condition: () => memoryGamesPlayed >= 1
            },
            {
                id: 'memory_score_50',
                name: '初级记忆师',
                desc: '单局得分达到50分',
                icon: 'fa-star',
                game: 'memory',
                condition: () => memoryHighScore >= 50
            },
            {
                id: 'memory_score_100',
                name: '中级记忆师',
                desc: '单局得分达到100分',
                icon: 'fa-medal',
                game: 'memory',
                condition: () => memoryHighScore >= 100
            },
            {
                id: 'memory_score_200',
                name: '高级记忆师',
                desc: '单局得分达到200分',
                icon: 'fa-trophy',
                game: 'memory',
                condition: () => memoryHighScore >= 200
            },
            {
                id: 'memory_games_5',
                name: '记忆卡牌爱好者',
                desc: '累计完成5局游戏',
                icon: 'fa-memory',
                game: 'memory',
                condition: () => memoryGamesPlayed >= 5
            },
            {
                id: 'memory_games_10',
                name: '记忆卡牌达人',
                desc: '累计完成10局游戏',
                icon: 'fa-gamepad',
                game: 'memory',
                condition: () => memoryGamesPlayed >= 10
            },
            {
                id: 'memory_perfect_game',
                name: '完美记忆',
                desc: '在一局游戏中没有失误',
                icon: 'fa-check-circle',
                game: 'memory',
                condition: () => false
            },
            {
                id: 'memory_speed_master',
                name: '速度记忆',
                desc: '在困难难度下，30秒内完成游戏',
                icon: 'fa-bolt',
                game: 'memory',
                condition: () => false
            },
            {
                id: 'memory_games_20',
                name: '记忆卡牌专家',
                desc: '累计完成20局游戏',
                icon: 'fa-certificate',
                game: 'memory',
                condition: () => memoryGamesPlayed >= 20
            },
            {
                id: 'memory_score_300',
                name: '记忆大师',
                desc: '单局得分达到300分',
                icon: 'fa-crown',
                game: 'memory',
                condition: () => memoryHighScore >= 300
            },
            {
                id: 'memory_complete',
                name: '记忆王者',
                desc: '解锁记忆卡牌所有成就',
                icon: 'fa-crown',
                game: 'special',
                condition: () => memoryUnlockedAchievements.length >= 10
            },
            {
                id: 'color_first_game',
                name: '初试锋芒',
                desc: '完成第一局颜色匹配游戏',
                icon: 'fa-trophy',
                game: 'color',
                condition: () => colorGamesPlayed >= 1
            },
            {
                id: 'color_score_100',
                name: '色彩大师',
                desc: '单局得分达到100分',
                icon: 'fa-star',
                game: 'color',
                condition: () => colorHighScore >= 100
            },
            {
                id: 'color_score_200',
                name: '色彩专家',
                desc: '单局得分达到200分',
                icon: 'fa-bullseye',
                game: 'color',
                condition: () => colorHighScore >= 200
            },
            {
                id: 'color_games_10',
                name: '游戏达人',
                desc: '累计完成10局游戏',
                icon: 'fa-gamepad',
                game: 'color',
                condition: () => colorGamesPlayed >= 10
            },
            {
                id: 'color_perfect_match',
                name: '完美匹配',
                desc: '在一局游戏中连续匹配5对颜色',
                icon: 'fa-fire',
                game: 'color',
                condition: () => colorMaxCombo >= 5
            },
            {
                id: 'color_speed_master',
                name: '速度之王',
                desc: '在困难难度下，30秒内获得100分',
                icon: 'fa-bolt',
                game: 'color',
                condition: () => false
            },
            {
                id: 'color_total_score_1000',
                name: '千分王者',
                desc: '累计获得1000分',
                icon: 'fa-crown',
                game: 'color',
                condition: () => colorTotalScore >= 1000
            },
            {
                id: 'color_games_50',
                name: '色彩守护者',
                desc: '累计完成50局游戏',
                icon: 'fa-medal',
                game: 'color',
                condition: () => colorGamesPlayed >= 50
            },
            {
                id: 'color_games_100',
                name: '色彩大师',
                desc: '累计完成100局游戏',
                icon: 'fa-trophy',
                game: 'color',
                condition: () => colorGamesPlayed >= 100
            },
            {
                id: 'color_total_score_2000',
                name: '万分王者',
                desc: '累计获得2000分',
                icon: 'fa-crown',
                game: 'color',
                condition: () => colorTotalScore >= 2000
            },
            {
                id: 'cm_complete',
                name: '色彩王者',
                desc: '解锁颜色匹配所有成就',
                icon: 'fa-crown',
                game: 'special',
                condition: () => colorUnlockedAchievements.length >= 10
            }
        ];
        
        var allUnlocked = fkUnlockedAchievements.concat(fxqUnlockedAchievements, wzqUnlockedAchievements, snakeUnlockedAchievements, memoryUnlockedAchievements, colorUnlockedAchievements);
        if (specialUnlockedAchievements) {
            allUnlocked = allUnlocked.concat(specialUnlockedAchievements);
        }
        
        var achievementsContainer = document.getElementById('achievementsList');
        achievementsContainer.innerHTML = '';
        
        var filteredAchievements = allAchievements.filter(function(achievement) {
            if (currentGame === 'all') {
                return achievement.game !== 'special';
            }
            return achievement.game === currentGame;
        });
        
        filteredAchievements.forEach(function(achievement) {
            var isUnlocked = allUnlocked.includes(achievement.id);
            var isCompleted = achievement.condition();
            
            var achievementItem = document.createElement('div');
            var className = 'achievement-item' + (isUnlocked ? ' unlocked' : ' locked');
            if (achievement.game === 'special') {
                className += ' special-achievement';
            }
            achievementItem.className = className;
            
            var progressPercent = 0;
            var progressText = '';
            
            if (isUnlocked) {
                progressPercent = 100;
                progressText = '已完成';
            } else if (achievement.id === 'first_game') {
                progressPercent = fkGamesPlayed >= 1 ? 100 : 0;
                progressText = fkGamesPlayed >= 1 ? '1/1' : '0/1';
            } else if (achievement.id === 'score_100') {
                progressPercent = Math.min((fkHighScore / 100) * 100, 100);
                progressText = fkHighScore + '/100';
            } else if (achievement.id === 'score_200') {
                progressPercent = Math.min((fkHighScore / 200) * 100, 100);
                progressText = fkHighScore + '/200';
            } else if (achievement.id === 'games_10') {
                progressPercent = Math.min((fkGamesPlayed / 10) * 100, 100);
                progressText = fkGamesPlayed + '/10';
            } else if (achievement.id === 'fxq_first_game') {
                progressPercent = fxqGamesPlayed >= 1 ? 100 : 0;
                progressText = fxqGamesPlayed >= 1 ? '1/1' : '0/1';
            } else if (achievement.id === 'fxq_score_50') {
                progressPercent = Math.min((fxqHighScore / 50) * 100, 100);
                progressText = fxqHighScore + '/50';
            } else if (achievement.id === 'fxq_score_100') {
                progressPercent = Math.min((fxqHighScore / 100) * 100, 100);
                progressText = fxqHighScore + '/100';
            } else if (achievement.id === 'fxq_score_200') {
                progressPercent = Math.min((fxqHighScore / 200) * 100, 100);
                progressText = fxqHighScore + '/200';
            } else if (achievement.id === 'fxq_score_300') {
                progressPercent = Math.min((fxqHighScore / 300) * 100, 100);
                progressText = fxqHighScore + '/300';
            } else if (achievement.id === 'fxq_games_5') {
                progressPercent = Math.min((fxqGamesPlayed / 5) * 100, 100);
                progressText = fxqGamesPlayed + '/5';
            } else if (achievement.id === 'fxq_games_10') {
                progressPercent = Math.min((fxqGamesPlayed / 10) * 100, 100);
                progressText = fxqGamesPlayed + '/10';
            } else if (achievement.id === 'wzq_first_game') {
                progressPercent = wzqGamesPlayed >= 1 ? 100 : 0;
                progressText = wzqGamesPlayed >= 1 ? '1/1' : '0/1';
            } else if (achievement.id === 'wzq_first_win') {
                progressPercent = Math.min((wzqWins / 1) * 100, 100);
                progressText = wzqWins + '/1';
            } else if (achievement.id === 'wzq_win_5') {
                progressPercent = Math.min((wzqWins / 5) * 100, 100);
                progressText = wzqWins + '/5';
            } else if (achievement.id === 'wzq_win_10') {
                progressPercent = Math.min((wzqWins / 10) * 100, 100);
                progressText = wzqWins + '/10';
            } else if (achievement.id === 'wzq_games_20') {
                progressPercent = Math.min((wzqGamesPlayed / 20) * 100, 100);
                progressText = wzqGamesPlayed + '/20';
            } else if (achievement.id === 'wzq_veteran') {
                progressPercent = Math.min((wzqWins / 50) * 100, 100);
                progressText = wzqWins + '/50';
            } else if (achievement.id === 'fk_complete') {
                progressPercent = Math.min((fkUnlockedAchievements.length / 10) * 100, 100);
                progressText = fkUnlockedAchievements.length + '/10';
            } else if (achievement.id === 'fxq_complete') {
                progressPercent = Math.min((fxqUnlockedAchievements.length / 10) * 100, 100);
                progressText = fxqUnlockedAchievements.length + '/10';
            } else if (achievement.id === 'wzq_complete') {
                progressPercent = Math.min((wzqUnlockedAchievements.length / 10) * 100, 100);
                progressText = wzqUnlockedAchievements.length + '/10';
            } else if (achievement.id === 'snake_first_game') {
                progressPercent = snakeGamesPlayed >= 1 ? 100 : 0;
                progressText = snakeGamesPlayed >= 1 ? '1/1' : '0/1';
            } else if (achievement.id === 'snake_score_50') {
                progressPercent = Math.min((snakeHighScore / 50) * 100, 100);
                progressText = snakeHighScore + '/50';
            } else if (achievement.id === 'snake_score_100') {
                progressPercent = Math.min((snakeHighScore / 100) * 100, 100);
                progressText = snakeHighScore + '/100';
            } else if (achievement.id === 'snake_score_200') {
                progressPercent = Math.min((snakeHighScore / 200) * 100, 100);
                progressText = snakeHighScore + '/200';
            } else if (achievement.id === 'snake_games_5') {
                progressPercent = Math.min((snakeGamesPlayed / 5) * 100, 100);
                progressText = snakeGamesPlayed + '/5';
            } else if (achievement.id === 'snake_games_10') {
                progressPercent = Math.min((snakeGamesPlayed / 10) * 100, 100);
                progressText = snakeGamesPlayed + '/10';
            } else if (achievement.id === 'snake_total_100') {
                progressPercent = Math.min((snakeTotalScore / 100) * 100, 100);
                progressText = snakeTotalScore + '/100';
            } else if (achievement.id === 'snake_total_500') {
                progressPercent = Math.min((snakeTotalScore / 500) * 100, 100);
                progressText = snakeTotalScore + '/500';
            } else if (achievement.id === 'snake_complete') {
                progressPercent = Math.min((snakeUnlockedAchievements.length / 10) * 100, 100);
                progressText = snakeUnlockedAchievements.length + '/10';
            } else {
                progressPercent = isCompleted ? 100 : 0;
                progressText = isCompleted ? '已完成' : '未完成';
            }
            
            achievementItem.innerHTML = `
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                    ${currentGame === 'all' ? `<div class="achievement-game-tag">${getGameName(achievement.game)}</div>` : ''}
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <span class="progress-text">${progressText}</span>
                    </div>
                </div>
                ${isUnlocked ? `<div class="achievement-time">${getAchievementTime(achievement.id)}</div>` : ''}
                ${isDevModeEnabled() && achievement.game !== 'special' ? `<button class="achievement-toggle-btn" data-achievement-id="${achievement.id}" data-is-unlocked="${isUnlocked}">
                    <i class="fas ${isUnlocked ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                </button>` : ''}
            `;
            
            achievementsContainer.appendChild(achievementItem);
            
            if (isDevModeEnabled() && achievement.game !== 'special') {
                var toggleBtn = achievementItem.querySelector('.achievement-toggle-btn');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        toggleSingleAchievement(achievement.id, achievement.game);
                    });
                }
            }
        });
    }
    
    function showDeleteAccountConfirmModal() {
        var modal = document.getElementById('deleteAccountConfirmModal');
        var overlay = document.getElementById('deleteAccountOverlay');
        modal.style.display = 'flex';
        overlay.classList.add('show');
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideDeleteAccountConfirmModal() {
        var modal = document.getElementById('deleteAccountConfirmModal');
        var overlay = document.getElementById('deleteAccountOverlay');
        modal.classList.remove('show');
        overlay.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function showLogoutConfirmModal() {
        var modal = document.getElementById('logoutConfirmModal');
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideLogoutConfirmModal() {
        var modal = document.getElementById('logoutConfirmModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function showResetSettingsConfirmModal() {
        var modal = document.getElementById('resetSettingsConfirmModal');
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideResetSettingsConfirmModal() {
        var modal = document.getElementById('resetSettingsConfirmModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function showDevModeConfirmModal() {
        var modal = document.getElementById('devModeConfirmModal');
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideDevModeConfirmModal() {
        var modal = document.getElementById('devModeConfirmModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function showDevModePasswordModal() {
        var modal = document.getElementById('devModePasswordModal');
        document.getElementById('devModePasswordInput').value = '';
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideDevModePasswordModal() {
        var modal = document.getElementById('devModePasswordModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function showDevModeSuccessModal() {
        var modal = document.getElementById('devModeSuccessModal');
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideDevModeSuccessModal() {
        var modal = document.getElementById('devModeSuccessModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function showExitDevModeConfirmModal() {
        var modal = document.getElementById('exitDevModeConfirmModal');
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideExitDevModeConfirmModal() {
        var modal = document.getElementById('exitDevModeConfirmModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function exitDevMode() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var devModeData = JSON.parse(localStorage.getItem('devModeData') || '{}');
        
        if (devModeData[currentUser.username]) {
            delete devModeData[currentUser.username];
            localStorage.setItem('devModeData', JSON.stringify(devModeData));
        }
        
        showAlert('已退出开发者模式');
        
        setTimeout(function() {
            location.reload();
        }, 1000);
    }
    
    function showToggleAchievementsConfirmModal() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(u) {
            return u.username === currentUser.username;
        });
        
        if (userIndex === -1) return;
        
        var user = users[userIndex];
        var fkAchievements = user.gameData && user.gameData.achievements ? user.gameData.achievements : [];
        var fxqAchievements = user.gameData && user.gameData.fxqAchievements ? user.gameData.fxqAchievements : [];
        var wzqAchievements = user.gameData && user.gameData.wzqAchievements ? user.gameData.wzqAchievements : [];
        
        var snakeAchievements = user.gameData && user.gameData.snakeAchievements ? user.gameData.snakeAchievements : [];
        var allUnlocked = fkAchievements.concat(fxqAchievements, wzqAchievements, snakeAchievements);
        var totalAchievements = 40;
        
        var modal = document.getElementById('toggleAchievementsConfirmModal');
        var title = document.getElementById('toggleAchievementsTitle');
        var message = document.getElementById('toggleAchievementsMessage');
        
        if (allUnlocked.length >= totalAchievements) {
            title.textContent = '关闭所有成就';
            message.textContent = '此操作将关闭所有成就并清零相关游戏数据，且无法恢复。您确定要继续吗？';
        } else {
            title.textContent = '启用所有成就';
            message.textContent = '此操作将启用所有成就。您确定要继续吗？';
        }
        
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideToggleAchievementsConfirmModal() {
        var modal = document.getElementById('toggleAchievementsConfirmModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function enableDevMode() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var devModeData = JSON.parse(localStorage.getItem('devModeData') || '{}');
        
        devModeData[currentUser.username] = {
            enabled: true,
            enabledAt: Date.now()
        };
        
        localStorage.setItem('devModeData', JSON.stringify(devModeData));
    }
    
    function isDevModeEnabled() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var devModeData = JSON.parse(localStorage.getItem('devModeData') || '{}');
        
        if (devModeData[currentUser.username] && devModeData[currentUser.username].enabled) {
            return true;
        }
        return false;
    }
    
    // 导出数据确认模态窗口事件监听器
    document.getElementById('exportDataCancel').addEventListener('click', function() {
        document.getElementById('exportDataConfirmModal').classList.remove('show');
        setTimeout(function() {
            document.getElementById('exportDataConfirmModal').style.display = 'none';
        }, 300);
    });
    
    document.getElementById('exportDataConfirm').addEventListener('click', function() {
        document.getElementById('exportDataConfirmModal').classList.remove('show');
        setTimeout(function() {
            document.getElementById('exportDataConfirmModal').style.display = 'none';
            exportUserData();
        }, 300);
    });
    
    // 清除缓存选择模态窗口事件监听器
    document.getElementById('clearCacheSelectCancel').addEventListener('click', function() {
        document.getElementById('clearCacheSelectModal').classList.remove('show');
        setTimeout(function() {
            document.getElementById('clearCacheSelectModal').style.display = 'none';
        }, 300);
    });
    
    document.getElementById('clearCacheSelectConfirm').addEventListener('click', function() {
        // 获取选中的选项
        var selectedOptions = [];
        document.querySelectorAll('input[name="cacheOption"]:checked').forEach(function(checkbox) {
            selectedOptions.push(checkbox.value);
        });
        
        if (selectedOptions.length === 0) {
            showAlert('请至少选择一项要清除的数据');
            return;
        }
        
        // 隐藏选择模态窗口
        document.getElementById('clearCacheSelectModal').classList.remove('show');
        setTimeout(function() {
            document.getElementById('clearCacheSelectModal').style.display = 'none';
            
            // 显示确认模态窗口
            var selectedOptionsList = document.getElementById('selectedCacheOptionsList');
            selectedOptionsList.innerHTML = '';
            
            if (selectedOptions.includes('all')) {
                var allOption = document.createElement('div');
                allOption.className = 'selected-option';
                allOption.textContent = '清除全部数据';
                selectedOptionsList.appendChild(allOption);
            } else {
                var optionNames = {
                    'avatars': '清除账户自定义头像数据',
                    'backgrounds': '清除账户自定义背景数据',
                    'themes': '清除账户自定义主题数据',
                    'loginHistory': '清除设备管理登录历史数据'
                };
                selectedOptions.forEach(function(option) {
                    var optionElement = document.createElement('div');
                    optionElement.className = 'selected-option';
                    optionElement.textContent = optionNames[option];
                    selectedOptionsList.appendChild(optionElement);
                });
            }
            
            // 保存选中的选项
            window.selectedCacheOptions = selectedOptions;
            
            // 显示确认模态窗口
            document.getElementById('clearCacheConfirmModal').style.display = 'flex';
            setTimeout(function() {
                document.getElementById('clearCacheConfirmModal').classList.add('show');
            }, 100);
        }, 300);
    });
    
    // 清除缓存确认模态窗口事件监听器
    document.getElementById('clearCacheCancel').addEventListener('click', function() {
        document.getElementById('clearCacheConfirmModal').classList.remove('show');
        setTimeout(function() {
            document.getElementById('clearCacheConfirmModal').style.display = 'none';
        }, 300);
    });
    
    document.getElementById('clearCacheConfirm').addEventListener('click', function() {
        document.getElementById('clearCacheConfirmModal').classList.remove('show');
        setTimeout(function() {
            document.getElementById('clearCacheConfirmModal').style.display = 'none';
            // 调用清除缓存函数，传入选中的选项
            clearCache(window.selectedCacheOptions);
        }, 300);
    });

    // 导出数据验证模态窗口事件监听器
    document.getElementById('exportDataVerifyCancel').addEventListener('click', function() {
        document.getElementById('exportDataVerifyModal').classList.remove('show');
        setTimeout(function() {
            document.getElementById('exportDataVerifyModal').style.display = 'none';
        }, 300);
    });
    
    document.getElementById('exportDataVerifyConfirm').addEventListener('click', function() {
        var password = document.getElementById('verifyPassword').value;
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        if (user && user.password === password) {
            // 密码验证成功
            document.getElementById('exportDataVerifyModal').classList.remove('show');
            setTimeout(function() {
                document.getElementById('exportDataVerifyModal').style.display = 'none';
                // 执行导出操作
                exportUserData();
            }, 300);
        } else {
            // 密码验证失败
            showAlert('密码错误，请重新输入');
        }
    });
    
    // 导入数据模态窗口事件监听器
    document.getElementById('importDataCancel').addEventListener('click', function() {
        document.getElementById('importDataModal').classList.remove('show');
        setTimeout(function() {
            document.getElementById('importDataModal').style.display = 'none';
        }, 300);
    });
    
    document.getElementById('importDataConfirm').addEventListener('click', function() {
        var fileInput = document.getElementById('importFile');
        var file = fileInput.files[0];
        var password = document.getElementById('importPassword').value;
        
        if (!file) {
            showAlert('请选择一个数据文件');
            return;
        }
        
        if (!password) {
            showAlert('请输入密码');
            return;
        }
        
        // 验证密码
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var user = users.find(function(u) {
            return u.username === currentUser.username;
        });
        
        if (!user || user.password !== password) {
            showAlert('密码错误，请重新输入');
            return;
        }
        
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var importedData = JSON.parse(e.target.result);
                
                // 验证数据是否为当前账号的数据
                if (importedData.username !== currentUser.username) {
                    showAlert('拒绝导入：数据文件不属于当前账号');
                    return;
                }
                
                // 导入数据
                importUserData(importedData);
                
                // 关闭模态窗口
                document.getElementById('importDataModal').classList.remove('show');
                setTimeout(function() {
                    document.getElementById('importDataModal').style.display = 'none';
                }, 300);
            } catch (error) {
                showAlert('导入失败：数据文件格式错误');
            }
        };
        
        reader.readAsText(file);
    });

    function toggleSingleAchievement(achievementId, game) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(u) {
            return u.username === currentUser.username;
        });
        
        if (userIndex === -1) return;
        
        var user = users[userIndex];
        
        if (!user.gameData) {
            user.gameData = {};
        }
        
        var achievementArrayName = '';
        if (game === 'fk') {
            achievementArrayName = 'achievements';
        } else if (game === 'fxq') {
            achievementArrayName = 'fxqAchievements';
        } else if (game === 'wzq') {
            achievementArrayName = 'wzqAchievements';
        } else if (game === 'snake') {
            achievementArrayName = 'snakeAchievements';
        } else if (game === 'memory') {
            achievementArrayName = 'memoryAchievements';
        } else if (game === 'color') {
            achievementArrayName = 'colorAchievements';
        } else if (game === 'special') {
            achievementArrayName = 'specialAchievements';
        }
        
        if (!achievementArrayName) return;
        
        if (!user.gameData[achievementArrayName]) {
            user.gameData[achievementArrayName] = [];
        }
        
        var achievementArray = user.gameData[achievementArrayName];
        var achievementIndex = achievementArray.indexOf(achievementId);
        
        if (achievementIndex !== -1) {
            achievementArray.splice(achievementIndex, 1);
            showAlert('成就已关闭');
        } else {
            achievementArray.push(achievementId);
            saveAchievementTime(achievementId);
            showAlert('成就已启用');
        }
        
        var fkAchievements = user.gameData.achievements || [];
        var fxqAchievements = user.gameData.fxqAchievements || [];
        var wzqAchievements = user.gameData.wzqAchievements || [];
        var snakeAchievements = user.gameData.snakeAchievements || [];
        var memoryAchievements = user.gameData.memoryAchievements || [];
        var colorAchievements = user.gameData.achievements || [];
        
        var specialAchievements = [];
        if (fkAchievements.length >= 10) {
            specialAchievements.push('fk_complete');
        }
        if (fxqAchievements.length >= 10) {
            specialAchievements.push('fxq_complete');
        }
        if (wzqAchievements.length >= 10) {
            specialAchievements.push('wzq_complete');
        }
        if (snakeAchievements.length >= 10) {
            specialAchievements.push('snake_complete');
        }
        if (memoryAchievements.length >= 10) {
            specialAchievements.push('memory_complete');
        }
        if (colorAchievements.length >= 9) {
            specialAchievements.push('cm_complete');
        }
        
        user.gameData.specialAchievements = specialAchievements;
        
        users[userIndex] = user;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        loadGameStats();
    }
    
    function toggleAllAchievements() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(u) {
            return u.username === currentUser.username;
        });
        
        if (userIndex === -1) return;
        
        var user = users[userIndex];
        
        var fkAchievements = user.gameData && user.gameData.achievements ? user.gameData.achievements : [];
        var fxqAchievements = user.gameData && user.gameData.fxqAchievements ? user.gameData.fxqAchievements : [];
        var wzqAchievements = user.gameData && user.gameData.wzqAchievements ? user.gameData.wzqAchievements : [];
        var snakeAchievements = user.gameData && user.gameData.snakeAchievements ? user.gameData.snakeAchievements : [];
        var memoryAchievements = user.gameData && user.gameData.memoryAchievements ? user.gameData.memoryAchievements : [];
        var colorAchievements = user.gameData && user.gameData.colorAchievements ? user.gameData.colorAchievements : [];
        
        var allUnlocked = fkAchievements.concat(fxqAchievements, wzqAchievements, snakeAchievements, memoryAchievements, colorAchievements);
        
        var allFkAchievements = ['first_game', 'score_100', 'score_200', 'games_10', 'combo_master', 'speed_king', 'perfect_start', 'total_score_1000', 'games_100', 'extreme_challenge'];
        var allFxqAchievements = ['fxq_first_game', 'fxq_score_50', 'fxq_score_100', 'fxq_score_200', 'fxq_games_5', 'fxq_games_10', 'fxq_easy_master', 'fxq_hard_master', 'fxq_nightmare_survivor', 'fxq_perfect_score'];
        var allWzqAchievements = ['wzq_first_game', 'wzq_first_win', 'wzq_win_5', 'wzq_win_10', 'wzq_games_20', 'wzq_quick_win', 'wzq_long_game', 'wzq_perfect_win', 'wzq_ai_master', 'wzq_veteran'];
        var allSnakeAchievements = ['snake_first_game', 'snake_score_50', 'snake_score_100', 'snake_score_200', 'snake_games_5', 'snake_games_10', 'snake_total_100', 'snake_total_500', 'snake_perfect_game', 'snake_survivor'];
        var allMemoryAchievements = ['memory_first_game', 'memory_score_50', 'memory_score_100', 'memory_score_200', 'memory_games_5', 'memory_games_10', 'memory_perfect_game', 'memory_speed_master', 'memory_games_20', 'memory_score_300'];
        var allColorAchievements = ['color_first_game', 'color_score_100', 'color_score_200', 'color_games_10', 'color_perfect_match', 'color_speed_master', 'color_total_score_1000', 'color_games_50', 'color_games_100', 'color_total_score_2000'];
        
        var totalAchievements = allFkAchievements.length + allFxqAchievements.length + allWzqAchievements.length + allSnakeAchievements.length + allMemoryAchievements.length + allColorAchievements.length;
        
        if (allUnlocked.length >= totalAchievements) {
            user.gameData.achievements = [];
            user.gameData.fxqAchievements = [];
            user.gameData.wzqAchievements = [];
            user.gameData.snakeAchievements = [];
            user.gameData.memoryAchievements = [];
            user.gameData.colorAchievements = [];
            user.gameData.specialAchievements = [];
            user.gameData.gamesPlayed = 0;
            user.gameData.highScore = 0;
            user.gameData.fxqGamesPlayed = 0;
            user.gameData.fxqHighScore = 0;
            user.gameData.wzqGamesPlayed = 0;
            user.gameData.wzqWins = 0;
            user.gameData.snakeGamesPlayed = 0;
            user.gameData.snakeHighScore = 0;
            user.gameData.snakeTotalScore = 0;
            user.gameData.memoryGamesPlayed = 0;
            user.gameData.memoryHighScore = 0;
            user.gameData.colorGamesPlayed = 0;
            user.gameData.colorHighScore = 0;
            user.gameData.colorTotalScore = 0;
            user.gameData.colorMaxCombo = 0;
            showAlert('所有成就已关闭');
        } else {
            user.gameData.achievements = allFkAchievements;
            user.gameData.fxqAchievements = allFxqAchievements;
            user.gameData.wzqAchievements = allWzqAchievements;
            user.gameData.snakeAchievements = allSnakeAchievements;
            user.gameData.memoryAchievements = allMemoryAchievements;
            user.gameData.colorAchievements = allColorAchievements;
            
            // 计算特殊成就
            var specialAchievements = [];
            if (allFkAchievements.length >= 10) {
                specialAchievements.push('fk_complete');
            }
            if (allFxqAchievements.length >= 10) {
                specialAchievements.push('fxq_complete');
            }
            if (allWzqAchievements.length >= 10) {
                specialAchievements.push('wzq_complete');
            }
            if (allSnakeAchievements.length >= 10) {
                specialAchievements.push('snake_complete');
            }
            if (allMemoryAchievements.length >= 8) {
                specialAchievements.push('memory_complete');
            }
            if (allColorAchievements.length >= 8) {
                specialAchievements.push('cm_complete');
            }
            user.gameData.specialAchievements = specialAchievements;
            
            showAlert('所有成就已激活');
        }
        
        users[userIndex] = user;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        loadGameStats();
    }
    
    document.getElementById('deleteAccountCancel').addEventListener('click', function() {
        hideDeleteAccountConfirmModal();
    });
    
    document.getElementById('deleteAccountConfirm').addEventListener('click', function() {
        hideDeleteAccountConfirmModal();
        showDeleteAccountFinalConfirmModal();
    });
    
    document.getElementById('logoutCancel').addEventListener('click', function() {
        hideLogoutConfirmModal();
    });
    
    document.getElementById('logoutConfirm').addEventListener('click', function() {
        hideLogoutConfirmModal();
        handleLogout();
    });
    
    document.getElementById('resetSettingsCancel').addEventListener('click', function() {
        hideResetSettingsConfirmModal();
    });
    
    document.getElementById('resetSettingsConfirm').addEventListener('click', function() {
        hideResetSettingsConfirmModal();
        resetAllSettings();
    });
    
    // 获取注销账号验证码
    function fetchDeleteAccountCaptcha(event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        const captchaEl = document.getElementById('deleteAccountCaptchaImage');
        
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const timestamp = Date.now();
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const imageUrl = `https://dummyimage.com/100x40/${randomColor.substring(1)}/ffffff&text=${code}&t=${timestamp}`;
        
        captchaEl.innerHTML = `<img src="${imageUrl}" alt="验证码" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;">`;
        
        // 重新绑定点击事件
        captchaEl.addEventListener('click', function(e) {
            fetchDeleteAccountCaptcha(e);
        });
        
        window.currentDeleteAccountCaptchaCode = code;
    }

    function showDeleteAccountFinalConfirmModal() {
        var modal = document.getElementById('deleteAccountFinalConfirmModal');
        var input = document.getElementById('deleteAccountConfirmInput');
        var checkbox = document.getElementById('deleteAccountAgreeCheckbox');
        var captchaInput = document.getElementById('deleteAccountCaptchaInput');
        input.value = '';
        captchaInput.value = '';
        checkbox.checked = false;
        
        // 初始化验证码
        fetchDeleteAccountCaptcha();
        
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideDeleteAccountFinalConfirmModal() {
        var modal = document.getElementById('deleteAccountFinalConfirmModal');
        var overlay = document.getElementById('deleteAccountOverlay');
        modal.classList.remove('show');
        overlay.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function handleTermsAction() {
        var checkbox = document.getElementById('termsAgreementCheckbox');
        if (checkbox.checked) {
            showTermsAgreementModal();
        } else {
            showAlert('请先勾选"我已阅读并同意用户条款"');
        }
    }
    
    function handlePrivacyAction() {
        var checkbox = document.getElementById('privacyAgreementCheckbox');
        if (checkbox.checked) {
            showTermsAgreementModal();
        } else {
            showAlert('请先勾选"我已阅读并同意用户条款"');
        }
    }
    
    function showTermsAgreementModal() {
        var modal = document.getElementById('termsAgreementModal');
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideTermsAgreementModal() {
        var modal = document.getElementById('termsAgreementModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function showRejectTermsConfirmModal() {
        hideTermsAgreementModal();
        var modal = document.getElementById('rejectTermsConfirmModal');
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function hideRejectTermsConfirmModal() {
        var modal = document.getElementById('rejectTermsConfirmModal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    }
    
    function confirmRejectTerms() {
        hideRejectTermsConfirmModal();
        
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var username = currentUser.username;
        
        if (username) {
            var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            var user = users.find(function(u) {
                return u.username === username;
            });
            
            if (user && user.loginHistory && user.loginHistory.length > 0) {
                user.loginHistory[0].status = '已退出';
                
                var userIndex = users.findIndex(function(u) {
                    return u.username === username;
                });
                if (userIndex !== -1) {
                    users[userIndex] = user;
                    localStorage.setItem('registeredUsers', JSON.stringify(users));
                }
            }
        }
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('savedPassword');
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('currentUserAvatar');
        localStorage.removeItem('customBackground');
        localStorage.removeItem('skipSecurityVerify');
        localStorage.removeItem('skipSecurityVerifyExpire');
        
        document.body.classList.add('page-transition-out');
        setTimeout(function() {
            window.location.href = '../index.html';
        }, 500);
    }
    
    document.getElementById('deleteAccountFinalCancel').addEventListener('click', function() {
        hideDeleteAccountFinalConfirmModal();
    });
    
    document.getElementById('deleteAccountFinalConfirm').addEventListener('click', function() {
        var input = document.getElementById('deleteAccountConfirmInput');
        var checkbox = document.getElementById('deleteAccountAgreeCheckbox');
        var captchaInput = document.getElementById('deleteAccountCaptchaInput');
        var confirmText = input.value.trim();
        var isAgreed = checkbox.checked;
        var captchaValue = captchaInput.value.trim().toUpperCase();
        var expectedCaptcha = window.currentDeleteAccountCaptchaCode;
        
        if (!isAgreed) {
            showAlert('请先勾选"我已阅读并确认用户协议及其条款"');
        } else if (confirmText !== '确认注销') {
            showAlert('请输入"确认注销"以继续操作');
        } else if (!captchaValue) {
            showAlert('请输入验证码');
        } else if (captchaValue !== expectedCaptcha) {
            showAlert('验证码错误，请重新输入');
            fetchDeleteAccountCaptcha();
        } else {
            hideDeleteAccountFinalConfirmModal();
            deleteAccount();
        }
    });
    
    function loadCheckinStats() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.username) {
            document.getElementById('totalCheckinDays').textContent = '0';
            document.getElementById('checkinPoints').textContent = '0';
            document.getElementById('consecutiveDays').textContent = '0';
            document.getElementById('monthCheckinDays').textContent = '0';
            return;
        }
        
        var today = new Date();
        var currentYear = today.getFullYear();
        var currentMonth = today.getMonth() + 1;
        var currentDay = today.getDate();
        
        var totalCheckinDays = 0;
        var totalPoints = 0;
        var consecutiveDays = 0;
        var monthCheckinDays = 0;
        
        var checkinKey = 'checkin_' + currentUser.username + '_' + currentYear + '_' + currentMonth;
        var checkinData = JSON.parse(localStorage.getItem(checkinKey) || '{}');
        
        var pointsKey = 'points_' + currentUser.username;
        totalPoints = parseInt(localStorage.getItem(pointsKey) || '0');
        
        var allCheckinData = {};
        for (var year = 2020; year <= currentYear; year++) {
            for (var month = 1; month <= 12; month++) {
                if (year === currentYear && month > currentMonth) {
                    continue;
                }
                var key = 'checkin_' + currentUser.username + '_' + year + '_' + month;
                var data = JSON.parse(localStorage.getItem(key) || '{}');
                for (var day in data) {
                    totalCheckinDays++;
                    allCheckinData[year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0')] = data[day];
                }
            }
        }
        
        var tempConsecutive = 0;
        var maxConsecutive = 0;
        var sortedDates = Object.keys(allCheckinData).sort();
        
        if (sortedDates.length > 0) {
            var lastDate = new Date(sortedDates[sortedDates.length - 1]);
            var currentDate = new Date(lastDate);
            
            tempConsecutive = 1;
            maxConsecutive = 1;
            
            for (var i = sortedDates.length - 2; i >= 0; i--) {
                var prevDate = new Date(sortedDates[i]);
                var diffTime = currentDate.getTime() - prevDate.getTime();
                var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    tempConsecutive++;
                    maxConsecutive = Math.max(maxConsecutive, tempConsecutive);
                } else {
                    tempConsecutive = 1;
                }
                
                currentDate = prevDate;
            }
        }
        
        var todayStr = currentYear + '-' + String(currentMonth).padStart(2, '0') + '-' + String(currentDay).padStart(2, '0');
        if (allCheckinData[todayStr]) {
            consecutiveDays = maxConsecutive;
        } else {
            var yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            var yesterdayStr = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');
            
            if (allCheckinData[yesterdayStr]) {
                consecutiveDays = maxConsecutive;
            } else {
                consecutiveDays = 0;
            }
        }
        
        monthCheckinDays = Object.keys(checkinData).length;
        
        document.getElementById('totalCheckinDays').textContent = totalCheckinDays;
        document.getElementById('checkinPoints').textContent = totalPoints;
        document.getElementById('consecutiveDays').textContent = consecutiveDays;
        document.getElementById('monthCheckinDays').textContent = monthCheckinDays;
    }
    
    function initializeTermsNavigation() {
        var navItems = document.querySelectorAll('.terms-nav-item');
        
        navItems.forEach(function(item) {
            item.addEventListener('click', function() {
                var targetId = this.getAttribute('data-target');
                
                var termsLayout = this.closest('.terms-layout');
                
                var navItemsInLayout = termsLayout.querySelectorAll('.terms-nav-item');
                navItemsInLayout.forEach(function(navItem) {
                    navItem.classList.remove('active');
                });
                this.classList.add('active');
                
                var sectionsInLayout = termsLayout.querySelectorAll('.terms-section');
                sectionsInLayout.forEach(function(section) {
                    section.style.display = 'none';
                });
                
                var targetSection = termsLayout.querySelector('#' + targetId);
                if (targetSection) {
                    targetSection.style.display = 'block';
                    targetSection.style.animation = 'none';
                    setTimeout(function() {
                        targetSection.style.animation = 'fadeIn 0.3s ease';
                    }, 10);
                }
            });
        });
    }

    // 处理用户协议链接
    document.querySelectorAll('.agreement-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var type = this.getAttribute('data-type');
            if (type === 'terms') {
                showTermsModal();
            } else if (type === 'privacy') {
                showPrivacyModal();
            }
        });
    });

    // 显示用户协议模态框
    function showTermsModal() {
        var termsModal = document.getElementById('termsModal');
        if (termsModal) {
            termsModal.style.display = 'flex';
            setTimeout(function() {
                termsModal.classList.add('show');
            }, 10);
        }
    }

    // 显示隐私政策模态框
    function showPrivacyModal() {
        var privacyModal = document.getElementById('privacyModal');
        if (privacyModal) {
            privacyModal.style.display = 'flex';
            setTimeout(function() {
                privacyModal.classList.add('show');
            }, 10);
        }
    }
    
    // 联网预设背景图片数据
    var onlinePresetBackgrounds = [
        {
            id: 1,
            name: '星空之夜',
            url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop'
        },
        {
            id: 2,
            name: '山脉日出',
            url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop'
        },
        {
            id: 3,
            name: '静水流深',
            url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop'
        },
        {
            id: 4,
            name: '城市夜景',
            url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop'
        },
        {
            id: 5,
            name: '森林小径',
            url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop'
        },
        {
            id: 6,
            name: '海边日落',
            url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop'
        },
        {
            id: 7,
            name: '雪景森林',
            url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'
        },
        {
            id: 8,
            name: '沙漠孤烟',
            url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop'
        },
        {
            id: 9,
            name: '极光奇观',
            url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800&h=600&fit=crop'
        }
    ];
    
    // 本地预设背景图片数据
    var localPresetBackgrounds = [
        {
            id: 1,
            name: '玄砂波纹',
            url: '../bgimg/bg1.jpg'
        },
        {
            id: 2,
            name: '峻钢方隅',
            url: '../bgimg/bg2.jpg'
        },
        {
            id: 3,
            name: '橙紫弧光',
            url: '../bgimg/bg3.jpg'
        },
        {
            id: 4,
            name: '素灰柔峦',
            url: '../bgimg/bg4.jpg'
        },
        {
            id: 5,
            name: '玄锋曜珠',
            url: '../bgimg/bg5.jpg'
        },
        {
            id: 6,
            name: '晶叠幻彩',
            url: '../bgimg/bg6.jpg'
        },
        {
            id: 7,
            name: '幽紫凝澜',
            url: '../bgimg/bg7.jpg'
        },
        {
            id: 8,
            name: '靛蓝流韵',
            url: '../bgimg/bg8.jpg'
        },
        {
            id: 9,
            name: '玫紫迤光',
            url: '../bgimg/bg9.jpg'
        }
    ];
    
    // 当前使用的预设背景数据
    var presetBackgrounds = onlinePresetBackgrounds;
    
    // 当前选中的预设背景
    var selectedPresetBackground = null;
    
    // 打开预设背景选择窗口
    function openPresetBackgroundModal() {
        var modal = document.getElementById('presetBackgroundModal');
        if (modal) {
            modal.classList.add('show');
            selectedPresetBackground = null;
            renderPresetBackgrounds();
            updateConfirmButtonState();
        }
    }
    
    // 切换预设背景数据源
    function switchPresetSource(isOnline) {
        presetBackgrounds = isOnline ? onlinePresetBackgrounds : localPresetBackgrounds;
        selectedPresetBackground = null;
        renderPresetBackgrounds();
        updateConfirmButtonState();
    }
    
    // 关闭预设背景选择窗口
    function closePresetBackgroundModal() {
        var modal = document.getElementById('presetBackgroundModal');
        if (modal) {
            modal.classList.remove('show');
            selectedPresetBackground = null;
        }
    }
    
    // 移动端触摸滑动支持
    function initPresetBackgroundTouchSupport() {
        var modal = document.getElementById('presetBackgroundModal');
        var container = document.querySelector('.preset-background-container');
        if (!modal || !container) return;
        
        var startY = 0;
        var currentY = 0;
        var deltaY = 0;
        var isDragging = false;
        var startTop = 0;
        
        container.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                startY = e.touches[0].clientY;
                isDragging = true;
                startTop = parseInt(window.getComputedStyle(container).transform.split(',')[5] || '0');
            }
        }, { passive: true });
        
        container.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            deltaY = currentY - startY;
            
            if (deltaY > 0) {
                var translateY = Math.min(deltaY * 0.5, window.innerHeight * 0.5);
                container.style.transform = 'translateY(' + translateY + 'px)';
            }
        }, { passive: true });
        
        container.addEventListener('touchend', function() {
            if (!isDragging) return;
            isDragging = false;
            
            var threshold = window.innerHeight * 0.2;
            
            if (deltaY > threshold) {
                closePresetBackgroundModal();
            } else {
                container.style.transform = '';
            }
            
            deltaY = 0;
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePresetBackgroundModal();
            }
        });
    }
    
    // 渲染预设背景图片
    function renderPresetBackgrounds() {
        var grid = document.getElementById('presetBackgroundGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        presetBackgrounds.forEach(function(background) {
            var item = document.createElement('div');
            item.className = 'preset-background-item' + (selectedPresetBackground && selectedPresetBackground.id === background.id ? ' selected' : '');
            item.setAttribute('data-url', background.url);
            item.setAttribute('data-name', background.name);
            item.setAttribute('data-id', background.id);
            
            item.innerHTML = `
                <img src="${background.url}" alt="${background.name}" loading="lazy">
                <div class="preset-background-name">${background.name}</div>
                ${selectedPresetBackground && selectedPresetBackground.id === background.id ? '<div class="preset-background-check"><i class="fas fa-check"></i></div>' : ''}
            `;
            
            item.addEventListener('click', function() {
                togglePresetBackgroundSelection(background);
            });
            
            grid.appendChild(item);
        });
    }
    
    // 切换预设背景选中状态
    function togglePresetBackgroundSelection(background) {
        // 清除之前的选中状态
        var previousSelected = document.querySelector('.preset-background-item.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
            var checkIcon = previousSelected.querySelector('.preset-background-check');
            if (checkIcon) {
                checkIcon.remove();
            }
        }
        
        // 设置新的选中状态
        if (selectedPresetBackground && selectedPresetBackground.id === background.id) {
            selectedPresetBackground = null;
        } else {
            selectedPresetBackground = background;
            var currentItem = document.querySelector('.preset-background-item[data-id="' + background.id + '"]');
            if (currentItem) {
                currentItem.classList.add('selected');
                var checkDiv = document.createElement('div');
                checkDiv.className = 'preset-background-check';
                checkDiv.innerHTML = '<i class="fas fa-check"></i>';
                currentItem.appendChild(checkDiv);
            }
        }
        
        updateConfirmButtonState();
    }
    
    // 更新确认按钮状态
    function updateConfirmButtonState() {
        var confirmBtn = document.getElementById('confirmPresetBtn');
        if (confirmBtn) {
            confirmBtn.disabled = !selectedPresetBackground;
        }
    }
    
    // 确认应用选中的预设背景
    function confirmPresetBackground() {
        if (!selectedPresetBackground) return;
        
        var url = selectedPresetBackground.url;
        var name = selectedPresetBackground.name;
        
        // 更新预览
        var preview = document.getElementById('backgroundPreview');
        if (preview) {
            // 清空innerHTML，移除之前上传的img标签等内容
            preview.innerHTML = '';
            // 设置背景图片样式
            preview.style.backgroundImage = 'url(' + url + ')';
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            preview.style.backgroundRepeat = 'no-repeat';
        }
        
        // 显示背景详情区域
        showBackgroundDetails();
        
        // 保存背景设置
        var fit = document.getElementById('backgroundFit').value;
        var opacity = parseFloat(document.getElementById('backgroundOpacity').value);
        var blur = parseInt(document.getElementById('backgroundBlur').value);
        
        // 将本地相对路径转换为相对于根目录的路径
        var savedUrl = url;
        if (url.startsWith('../bgimg/')) {
            savedUrl = url.substring(3);
        }
        
        var backgroundSettings = {
            image: savedUrl,
            fit: fit,
            opacity: opacity,
            blur: blur,
            useIndexedDB: false
        };
        
        // 保存到用户配置
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        
        if (userIndex !== -1) {
            if (!users[userIndex].userProfile) {
                users[userIndex].userProfile = {};
            }
            users[userIndex].userProfile.background = backgroundSettings;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
        
        localStorage.setItem('customBackground', JSON.stringify(backgroundSettings));
        
        // 应用到当前页面
        applyBackgroundToPage(backgroundSettings);
        
        // 关闭窗口
        closePresetBackgroundModal();
        
        showAlert('背景图片已更新为 "' + name + '"');
    }
    
    // 取消选择
    function cancelPresetBackground() {
        closePresetBackgroundModal();
    }
    
    function checkOfflineModeAndDisableFeatures() {
        var isOfflineMode = localStorage.getItem('offlineMode') === 'true';
        
        if (!isOfflineMode) {
            return;
        }
        
        var offlineModeTag = document.getElementById('accountOfflineModeTag');
        if (offlineModeTag) {
            offlineModeTag.style.display = 'inline-flex';
        }
        
        var accountSection = document.getElementById('section-account');
        var securitySection = document.getElementById('section-security');
        var achievementsSection = document.getElementById('section-achievements');
        var devicesSection = document.getElementById('section-devices');
        var advancedSection = document.getElementById('section-advanced');
        var accountManagementSection = document.getElementById('section-account-management');
        
        function disableElement(element, disabledClass) {
            if (!element) return;
            
            var buttons = element.querySelectorAll('button, input[type="button"], input[type="submit"], .two-factor-btn, .game-selector-btn');
            buttons.forEach(function(btn) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.title = '离线模式下不可用';
            });
            
            var inputs = element.querySelectorAll('input:not([readonly]):not([type="checkbox"]):not([type="radio"]), textarea, select');
            inputs.forEach(function(input) {
                input.disabled = true;
                input.style.opacity = '0.5';
                input.style.cursor = 'not-allowed';
            });
            
            var checkboxes = element.querySelectorAll('input[type="checkbox"], input[type="radio"]');
            checkboxes.forEach(function(checkbox) {
                checkbox.disabled = true;
                checkbox.style.cursor = 'not-allowed';
            });
            
            var links = element.querySelectorAll('a');
            links.forEach(function(link) {
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.5';
            });
        }
        
        disableElement(accountSection);
        disableElement(securitySection);
        disableElement(achievementsSection);
        disableElement(devicesSection);
        
        if (advancedSection) {
            var presetBackgroundBtn = document.getElementById('presetBackgroundBtn');
            if (presetBackgroundBtn) {
                presetBackgroundBtn.disabled = true;
                presetBackgroundBtn.style.opacity = '0.5';
                presetBackgroundBtn.style.cursor = 'not-allowed';
                presetBackgroundBtn.title = '离线模式下不可用';
            }
        }
        
        if (accountManagementSection) {
            var dataManagementCards = accountManagementSection.querySelectorAll('.section-card');
            dataManagementCards.forEach(function(card) {
                var cardHeader = card.querySelector('.card-header');
                var cardTitle = cardHeader ? cardHeader.querySelector('h3') : null;
                if (cardTitle && cardTitle.textContent === '数据管理') {
                    disableElement(card);
                }
            });
            
            var dangerZoneCards = accountManagementSection.querySelectorAll('.section-card');
            dangerZoneCards.forEach(function(card) {
                var cardHeader = card.querySelector('.card-header');
                var cardTitle = cardHeader ? cardHeader.querySelector('h3') : null;
                if (cardTitle && cardTitle.textContent === '危险区域') {
                    disableElement(card);
                }
            });
        }
        
        showAlert('当前为离线模式，部分功能已禁用');
    }
    
    function goBack() {
        var referrer = document.referrer;
        var previousPage = localStorage.getItem('previousPage');
        
        var homePage = '../html/homepage4.0.html';
        var loginPage = '../index.html';
        
        if (referrer && (referrer.includes('homepage') || referrer.includes('index'))) {
            window.location.href = referrer;
        } else if (previousPage) {
            window.location.href = previousPage;
            localStorage.removeItem('previousPage');
        } else {
            window.location.href = homePage;
        }
    }
    
    // 外部链接确认弹窗
    function showLeaveConfirmModal(url) {
        var existingModal = document.getElementById('leaveConfirmModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        var modal = document.createElement('div');
        modal.id = 'leaveConfirmModal';
        modal.className = 'custom-alert';
        
        modal.innerHTML = `
            <div class="alert-content" style="max-width: 500px;">
                <div class="alert-header">
                    <h2>即将离开PRE Launcher</h2>
                </div>
                <div class="about-content" style="text-align: left;">
                    <p style="margin: 15px 0;">您即将离开PRE Launcher，请注意您的账号和财产安全。</p>
                    <p style="margin: 15px 0;"><strong>跳转地址：</strong><span style="color: #666; word-break: break-all;">${url}</span></p>
                </div>
                <div class="modal-buttons">
                    <button id="leaveConfirmCancel" class="alert-confirm">取消</button>
                    <button id="leaveConfirmOk" class="alert-confirm" style="background-color: #d45d79;">确认跳转</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        var cancelBtn = modal.querySelector('#leaveConfirmCancel');
        var okBtn = modal.querySelector('#leaveConfirmOk');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeLeaveConfirmModal);
        }
        if (okBtn) {
            okBtn.addEventListener('click', function() {
                confirmLeave(url);
            });
        }
        
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
    }
    
    function closeLeaveConfirmModal() {
        var modal = document.getElementById('leaveConfirmModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(function() {
                modal.remove();
            }, 300);
        }
    }
    
    function confirmLeave(url) {
        closeLeaveConfirmModal();
        window.open(url, '_blank');
    }

    // ================= 更多主题弹窗 =================
    function openMoreThemesModal() {
        var modal = document.getElementById('moreThemesModal');
        if (!modal) return;
        updateMoreThemesSelected();
        modal.classList.add('show');
    }

    function closeMoreThemesModal() {
        var modal = document.getElementById('moreThemesModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    function updateMoreThemesSelected() {
        // 读取当前主题并高亮对应卡片
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        var currentTheme = null;
        var userIndex = users.findIndex(function(user) {
            return user.username === currentUser.username;
        });
        if (userIndex !== -1 && users[userIndex].userProfile) {
            currentTheme = users[userIndex].userProfile.theme;
        }

        document.querySelectorAll('.more-theme-card').forEach(function(card) {
            if (card.getAttribute('data-theme') === currentTheme) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    function bindMoreThemesModal() {
        var modal = document.getElementById('moreThemesModal');
        if (!modal) return;

        var backdrop = document.getElementById('moreThemesBackdrop');
        var closeBtn = document.getElementById('moreThemesClose');
        var cancelBtn = document.getElementById('moreThemesCancel');

        if (backdrop) {
            backdrop.addEventListener('click', closeMoreThemesModal);
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMoreThemesModal);
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeMoreThemesModal);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeMoreThemesModal();
            }
        });

        document.querySelectorAll('.more-theme-card').forEach(function(card) {
            card.addEventListener('click', function(e) {
                if (e.target.closest('.more-theme-info-btn')) {
                    return;
                }
                
                var theme = this.getAttribute('data-theme');
                if (!theme) return;

                // 检查是否为禁用的毛玻璃主题
                if (card.classList.contains('more-theme-card-disabled')) {
                    showThemeNoticeModal('该主题优化中，暂不可使用，敬请谅解');
                    return;
                }



                // 立即更新选中态
                document.querySelectorAll('.more-theme-card').forEach(function(c) {
                    c.classList.remove('selected');
                });
                this.classList.add('selected');

                // 应用主题
                setTheme(theme);

                // 短暂延迟后关闭弹窗，给用户看到选中态
                setTimeout(closeMoreThemesModal, 250);
            });
        });

        document.querySelectorAll('.more-theme-info-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var theme = this.getAttribute('data-theme');
                if (theme) {
                    showThemeVersionModal(theme);
                }
            });
        });
    }

    function showThemeVersionModal(themeName) {
        var modal = document.getElementById('themeVersionModal');
        if (!modal) return;

        var versionInfo = null;
        if (typeof getThemeVersionInfo === 'function') {
            versionInfo = getThemeVersionInfo(themeName);
        }

        document.getElementById('themeVersionNumber').textContent = versionInfo?.version || '未知';
        document.getElementById('themeReleaseDate').textContent = versionInfo?.releaseDate || '未知';
        document.getElementById('themeUpdateDate').textContent = versionInfo?.updateDate || '未知';
        document.getElementById('themeStatus').textContent = versionInfo?.status || '未知';

        var statusContainer = document.getElementById('themeStatusContainer');
        statusContainer.classList.remove('beta', 'optimizing', 'release');
        if (versionInfo?.status === '公开测试版') {
            statusContainer.classList.add('beta');
        } else if (versionInfo?.status === '停用优化中') {
            statusContainer.classList.add('optimizing');
        } else if (versionInfo?.status === '公开正式版') {
            statusContainer.classList.add('release');
        }

        modal.classList.add('show');
    }

    function closeThemeVersionModal() {
        var modal = document.getElementById('themeVersionModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    function bindThemeVersionModal() {
        var modal = document.getElementById('themeVersionModal');
        if (!modal) return;

        var backdrop = document.getElementById('themeVersionBackdrop');
        var closeBtn = document.getElementById('themeVersionClose');
        var closeBtn2 = document.getElementById('themeVersionCloseBtn');

        if (backdrop) {
            backdrop.addEventListener('click', closeThemeVersionModal);
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', closeThemeVersionModal);
        }
        if (closeBtn2) {
            closeBtn2.addEventListener('click', closeThemeVersionModal);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeThemeVersionModal();
            }
        });
    }

    function showThemeNoticeModal(message) {
        var noticeModal = document.createElement('div');
        noticeModal.id = 'themeNoticeModal';
        noticeModal.className = 'theme-notice-modal';
        noticeModal.innerHTML = `
            <div class="theme-notice-backdrop"></div>
            <div class="theme-notice-content">
                <div class="theme-notice-header">
                    <h3>提示</h3>
                </div>
                <div class="theme-notice-body">
                    <p>${message}</p>
                </div>
                <div class="theme-notice-footer">
                    <button id="themeNoticeOk" class="theme-notice-btn">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(noticeModal);

        var backdrop = noticeModal.querySelector('.theme-notice-backdrop');
        var okBtn = noticeModal.querySelector('.theme-notice-btn');

        function closeModal() {
            noticeModal.remove();
        }

        backdrop.addEventListener('click', closeModal);
        okBtn.addEventListener('click', closeModal);

        setTimeout(function() {
            noticeModal.classList.add('show');
        }, 10);
    }

    // 拦截外部链接点击
    document.addEventListener('click', function(e) {
        var target = e.target;
        while (target && target !== document) {
            if (target.tagName === 'A' && target.getAttribute('target') === '_blank') {
                e.preventDefault();
                var href = target.getAttribute('href');
                if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                    showLeaveConfirmModal(href);
                    return;
                }
            }
            target = target.parentNode;
        }
    }, true);
    
    // 弹窗键盘快捷键支持
    function getVisibleModal() {
        var modals = [
            { id: 'alertModal', confirmBtn: 'alertConfirm', cancelBtn: null },
            { id: 'editModal', confirmBtn: 'editConfirm', cancelBtn: 'editCancel' },
            { id: 'bindModal', confirmBtn: 'bindConfirm', cancelBtn: 'bindCancel' },
            { id: 'deleteAccountConfirmModal', confirmBtn: 'deleteAccountConfirm', cancelBtn: 'deleteAccountCancel' },
            { id: 'logoutConfirmModal', confirmBtn: 'logoutConfirm', cancelBtn: 'logoutCancel' },
            { id: 'resetSettingsConfirmModal', confirmBtn: 'resetSettingsConfirm', cancelBtn: 'resetSettingsCancel' },
            { id: 'setNewPasswordModal', confirmBtn: 'setNewPasswordConfirm', cancelBtn: 'setNewPasswordCancel' },
            { id: 'passwordVerificationModal', confirmBtn: 'passwordVerificationConfirm', cancelBtn: 'passwordVerificationCancel' },
            { id: 'twoFactorAuthModal', confirmBtn: 'twoFactorAuthConfirm', cancelBtn: 'twoFactorAuthCancel' },
            { id: 'changeTwoFactorPinModal', confirmBtn: 'changeTwoFactorPinConfirm', cancelBtn: 'changeTwoFactorPinCancel' },
            { id: 'verifyTwoFactorPinModal', confirmBtn: 'verifyTwoFactorPinConfirm', cancelBtn: 'verifyTwoFactorPinCancel' },
            { id: 'updateSecurityQuestionsModal', confirmBtn: 'updateSecurityQuestionsConfirm', cancelBtn: 'updateSecurityQuestionsCancel' },
            { id: 'deleteAccountFinalConfirmModal', confirmBtn: 'deleteAccountFinalConfirm', cancelBtn: 'deleteAccountFinalCancel' },
            { id: 'termsAgreementModal', confirmBtn: null, cancelBtn: 'termsAgreementCancel', rejectBtn: 'termsAgreementReject' },
            { id: 'rejectTermsConfirmModal', confirmBtn: 'rejectTermsConfirm', cancelBtn: 'rejectTermsCancel' },
            { id: 'unbindConfirmModal', confirmBtn: 'unbindConfirm', cancelBtn: 'unbindCancel' },
            { id: 'devModeConfirmModal', confirmBtn: 'devModeConfirmOk', cancelBtn: 'devModeConfirmCancel' },
            { id: 'devModePasswordModal', confirmBtn: 'devModePasswordConfirm', cancelBtn: 'devModePasswordCancel' },
            { id: 'devModeSuccessModal', confirmBtn: 'devModeSuccessOk', cancelBtn: null },
            { id: 'exitDevModeConfirmModal', confirmBtn: 'exitDevModeConfirm', cancelBtn: 'exitDevModeCancel' },
            { id: 'toggleAchievementsConfirmModal', confirmBtn: 'toggleAchievementsConfirm', cancelBtn: 'toggleAchievementsCancel' },
            { id: 'gpuAccelerationModal', confirmBtn: 'gpuAccelerationConfirm', cancelBtn: 'gpuAccelerationCancel' },
            { id: 'exportDataConfirmModal', confirmBtn: 'exportDataConfirm', cancelBtn: 'exportDataCancel' },
            { id: 'clearCacheSelectModal', confirmBtn: 'clearCacheSelectConfirm', cancelBtn: 'clearCacheSelectCancel' },
            { id: 'clearCacheConfirmModal', confirmBtn: 'clearCacheConfirm', cancelBtn: 'clearCacheCancel' },
            { id: 'exportDataVerifyModal', confirmBtn: 'exportDataVerifyConfirm', cancelBtn: 'exportDataVerifyCancel' },
            { id: 'importDataModal', confirmBtn: 'importDataConfirm', cancelBtn: 'importDataCancel' },
            { id: 'presetBackgroundModal', confirmBtn: 'confirmPresetBtn', cancelBtn: 'cancelPresetBtn', closeBtn: 'closePresetModal' },
            { id: 'moreThemesModal', confirmBtn: null, cancelBtn: 'moreThemesCancel', closeBtn: 'moreThemesClose' },
            { id: 'themeVersionModal', confirmBtn: null, cancelBtn: null, closeBtn: 'themeVersionClose' },
            { id: 'leaveConfirmModal', confirmBtn: 'leaveConfirmOk', cancelBtn: 'leaveConfirmCancel' },
            { id: 'themeConfirmModal', confirmBtn: 'themeConfirmOk', cancelBtn: 'themeConfirmCancel' },
            { id: 'themeNoticeModal', confirmBtn: 'themeNoticeOk', cancelBtn: null }
        ];
        
        for (var i = 0; i < modals.length; i++) {
            var modalEl = document.getElementById(modals[i].id);
            if (modalEl) {
                var isVisible = modalEl.style.display === 'flex' || modalEl.classList.contains('show');
                if (isVisible) {
                    return {
                        element: modalEl,
                        info: modals[i]
                    };
                }
            }
        }
        
        return null;
    }
    
    function handleModalKeydown(e) {
        var visibleModal = getVisibleModal();
        if (!visibleModal) return;
        
        var info = visibleModal.info;
        
        if (e.key === 'Enter') {
            e.preventDefault();
            var confirmBtn = document.getElementById(info.confirmBtn);
            if (confirmBtn) {
                confirmBtn.click();
            } else if (info.rejectBtn) {
                var rejectBtn = document.getElementById(info.rejectBtn);
                if (rejectBtn) {
                    rejectBtn.click();
                }
            } else if (info.closeBtn) {
                var closeBtn = document.getElementById(info.closeBtn);
                if (closeBtn) {
                    closeBtn.click();
                }
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            var cancelBtn = document.getElementById(info.cancelBtn);
            if (cancelBtn) {
                cancelBtn.click();
            } else if (info.closeBtn) {
                var closeBtn = document.getElementById(info.closeBtn);
                if (closeBtn) {
                    closeBtn.click();
                }
            } else if (info.confirmBtn) {
                var confirmBtn = document.getElementById(info.confirmBtn);
                if (confirmBtn) {
                    confirmBtn.click();
                }
            }
        }
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === 'Escape') {
            handleModalKeydown(e);
        }
    });
    
    var stickyNotesToggle = document.getElementById('enableStickyNotes');
    if (stickyNotesToggle) {
        var isStickyNotesEnabled = localStorage.getItem('stickyNotesEnabled') === 'true';
        stickyNotesToggle.checked = isStickyNotesEnabled;
    }
    
    var weatherFeatureToggle = document.getElementById('enableWeatherFeature');
    if (weatherFeatureToggle) {
        var isWeatherFeatureEnabled = localStorage.getItem('weatherFeatureEnabled') === 'true';
        weatherFeatureToggle.checked = isWeatherFeatureEnabled;
    }
    
    var calendarToggle = document.getElementById('enableCalendar');
    if (calendarToggle) {
        var isCalendarEnabled = localStorage.getItem('calendarEnabled') === 'true';
        calendarToggle.checked = isCalendarEnabled;
    }
    
});

function toggleStickyNotes() {
    var enabled = document.getElementById('enableStickyNotes').checked;
    localStorage.setItem('stickyNotesEnabled', enabled ? 'true' : 'false');
    
    if (enabled) {
        showAlert('便签功能已启用，在登录页更多功能弹窗中可使用');
    } else {
        showAlert('便签功能已关闭');
    }
    
    if (typeof parent.updateEnhancedFeatureButtons === 'function') {
        parent.updateEnhancedFeatureButtons();
    }
}

function toggleWeatherFeature() {
    var enabled = document.getElementById('enableWeatherFeature').checked;
    localStorage.setItem('weatherFeatureEnabled', enabled ? 'true' : 'false');
    
    if (enabled) {
        showAlert('天气功能已启用，在登录页更多功能弹窗中可使用');
    } else {
        showAlert('天气功能已关闭');
    }
    
    if (typeof parent.updateEnhancedFeatureButtons === 'function') {
        parent.updateEnhancedFeatureButtons();
    }
}

function toggleCalendarFeature() {
    var enabled = document.getElementById('enableCalendar').checked;
    localStorage.setItem('calendarEnabled', enabled ? 'true' : 'false');
    
    if (enabled) {
        showAlert('日历功能已启用，在登录页更多功能弹窗中可使用');
    } else {
        showAlert('日历功能已关闭');
    }
    
    if (typeof parent.updateEnhancedFeatureButtons === 'function') {
        parent.updateEnhancedFeatureButtons();
    }
}
