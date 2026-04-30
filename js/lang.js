// 语言管理模块
const LangManager = (function() {
    const langMap = {
        'zh': {
            title: 'LauncherLogin',
            username: '账号',
            password: '密码',
            captcha: '验证码',
            remember: '记住我',
            autoLogin: '自动登录',
            loginBtn: '登录',
            settingsBtn: '全局设置',
            versionHistoryBtn: '版本更新',
            settingsTitle: '全局设置',
            launcherUpdate: '启动器更新',
            homepageUpdate: '主页面更新',
            earlyUpdate: '早期更新历史',
            language: '语言',
            gameServer: '游戏服务器',
            officialServer: '官方服务器',
            customServer: '自定义服务器',
            debugAddress: '请输入调试地址',
            cancel: '取消',
            confirm: '确定',
            close: '关闭',
            versionHistoryTitle: '版本更新记录',
            majorUpdate: '重大更新',
            importantUpdate: '重要更新',
            normalUpdate: '常规更新',
            regTitle: '注册新账号',
            regUsername: '请输入用户名',
            regPassword: '请输入密码',
            regConfirmPassword: '请确认密码',
            regBtn: '注册',
            successReg: '注册成功！请使用新账号登录',
            loading: '加载中...',
            backToHome: '返回首页',
            loginAccount: '登录账号',
            registerAccount: '注册账号',
            loginPageTitle: '登录账号',
            loginPageDesc: '欢迎回来，请您登录账号以继续使用~  (っ˘ ˘ς)',
            backToLogin: '返回登录',
            forgotPassword: '忘记密码？',
            feedback: '反馈建议',
            feedbackTitle: '反馈建议',
            feedbackType: '反馈类型',
            feedbackContent: '反馈内容',
            includeSystemInfo: '发送系统信息',
            submitFeedback: '提交反馈',
            forgotPasswordTitle: '忘记密码',
            resetPasswordTitle: '重置密码',
            newPassword: '新密码',
            confirmPassword: '确认密码',
            verify: '验证',
            reset: '重置',
            forgotPasswordMessage: '请输入完整的手机号和邮箱进行验证',
            userAgreement: '用户协议',
            privacyPolicy: '隐私政策',
            iHaveRead: '我已阅读并同意',
            and: '及其',
            userCenter: '用户中心',
            notLoggedIn: '未登录',
            id: 'ID: ',
            refreshCaptcha: '点击刷新验证码',
            aboutLauncher: '关于启动器',
            card: '名片',
            hideUI: '隐藏UI',
            expandMore: '点击展开更多功能',
            collapseMore: '点击收起更多功能',
            mobileExpandMore: '展开更多功能',
            mobileCollapseMore: '收起更多功能',
            userInfo: '用户信息',
            accountSettings: '点击进入账户设置',
            logout: '退出登录',
            versionInfo: '启动器基于 RC 1.2.1.2 (a4) 版本开发',
            copyright: '© 2014-2026 GPY Games Studio',
            mobileWarning: '移动端体验可能不佳，建议使用PC端访问',
            mobileWarningBtn: '我知道了',
            autoLoginSuccess: '自动登录成功',
            autoLoginMessage: '正在登录中，即将进入游戏大厅...',
            accountNotFound: '账号不存在',
            accountNotFoundMessage: '未查找到账号，请先注册！',
            goToRegister: '去注册',
            goToLogin: '去登录',
            logoutConfirm: '是否要退出登录吗？',
            notLoggedInMessage: '未登录任何账号，请先进行登录或注册',
            registerConfirm: '确认注册信息',
            confirmSubmit: '确定注册',
            confirmCancel: '返回修改',
            feedbackSubmitSuccess: '反馈提交成功，感谢您的建议！',
            passwordResetSuccess: '密码重置成功！请使用新密码登录',
            accountDeleted: '账户已彻底注销',
            cancelDelete: '取消注销操作',
            confirmLogin: '重新登录确认',
            confirmLoginMessage: '已确认重新登录，账户注销操作终止',
            backToTop: '返回顶部',
            enterAccount: '请输入账号',
            enterPassword: '请输入密码',
            enterUsername: '请输入用户名',
            usernameMinLength: '用户名至少需要3个字符',
            passwordMinLength: '密码至少需要6个字符',
            passwordMismatch: '两次输入的密码不一致',
            enterCaptcha: '请输入验证码',
            captchaError: '验证码错误，请重新输入',
            usernameExists: '该用户名已被注册',
            loginError: '用户名或密码错误',
            loginSuccess: '登录成功！',
            serverSaved: '调试地址已保存',
            officialServer: '已切换到官方服务器'
        },
        'en': {
            title: 'LauncherLogin',
            username: 'Account',
            password: 'Password',
            captcha: 'Captcha',
            remember: 'Remember Me',
            autoLogin: 'Auto Login',
            loginBtn: 'Enter Game',
            settingsBtn: 'Global Settings',
            versionHistoryBtn: 'Version Update',
            settingsTitle: 'Global Settings',
            launcherUpdate: 'Launcher Update',
            homepageUpdate: 'Homepage Update',
            earlyUpdate: 'Early Update History',
            language: 'Language',
            gameServer: 'Game Server',
            officialServer: 'Official Server',
            customServer: 'Custom Server',
            debugAddress: 'Enter debug address',
            cancel: 'Cancel',
            confirm: 'Confirm',
            close: 'Close',
            versionHistoryTitle: 'Version Update History',
            majorUpdate: 'Major Update',
            importantUpdate: 'Important Update',
            normalUpdate: 'Normal Update',
            regTitle: 'Register New Account',
            regUsername: 'Enter username',
            regPassword: 'Enter password',
            regConfirmPassword: 'Confirm password',
            regBtn: 'Register',
            successReg: 'Registration successful! Please login with your new account',
            loading: 'Loading...',
            backToHome: 'Back to Home',
            loginAccount: 'Login',
            registerAccount: 'Register',
            loginPageTitle: 'Login Account',
            loginPageDesc: 'Welcome back, please login to continue~  (っ˘ ˘ς)',
            backToLogin: 'Back to Login',
            forgotPassword: 'Forgot password?',
            feedback: 'Feedback',
            feedbackTitle: 'Feedback',
            feedbackType: 'Feedback Type',
            feedbackContent: 'Feedback Content',
            includeSystemInfo: 'Send System Info',
            submitFeedback: 'Submit Feedback',
            forgotPasswordTitle: 'Forgot Password',
            resetPasswordTitle: 'Reset Password',
            newPassword: 'New Password',
            confirmPassword: 'Confirm Password',
            verify: 'Verify',
            reset: 'Reset',
            forgotPasswordMessage: 'Please enter your complete phone number and email for verification',
            userAgreement: 'User Agreement',
            privacyPolicy: 'Privacy Policy',
            iHaveRead: 'I have read and agree to the',
            and: 'and',
            userCenter: 'User Center',
            notLoggedIn: 'Not Logged In',
            id: 'ID: ',
            refreshCaptcha: 'Click to refresh captcha',
            aboutLauncher: 'About Launcher',
            card: 'Card',
            hideUI: 'Hide UI',
            expandMore: 'Click to expand more features',
            collapseMore: 'Click to collapse more features',
            mobileExpandMore: 'Expand more features',
            mobileCollapseMore: 'Collapse more features',
            userInfo: 'User Info',
            accountSettings: 'Click to enter account settings',
            logout: 'Logout',
            versionInfo: 'Launcher based on RC 1.2.1.2 (a4) version',
            copyright: '© 2014-2026 GPY Games Studio',
            mobileWarning: 'Mobile experience may be poor, please use PC to access',
            mobileWarningBtn: 'I know',
            autoLoginSuccess: 'Auto login successful',
            autoLoginMessage: 'Logging in, entering game lobby soon...',
            accountNotFound: 'Account not found',
            accountNotFoundMessage: 'Account not found, please register first!',
            goToRegister: 'Go to Register',
            goToLogin: 'Go to Login',
            logoutConfirm: 'Are you sure you want to logout?',
            notLoggedInMessage: 'No account logged in, please login or register first',
            registerConfirm: 'Confirm registration information',
            confirmSubmit: 'Confirm Registration',
            confirmCancel: 'Back to Modify',
            feedbackSubmitSuccess: 'Feedback submitted successfully, thank you for your suggestion!',
            passwordResetSuccess: 'Password reset successful! Please login with your new password',
            accountDeleted: 'Account has been completely deleted',
            cancelDelete: 'Cancel deletion operation',
            confirmLogin: 'Re-login confirmation',
            confirmLoginMessage: 'Re-login confirmed, account deletion operation terminated',
            backToTop: 'Back to top',
            enterAccount: 'Please enter account',
            enterPassword: 'Please enter password',
            enterUsername: 'Please enter username',
            usernameMinLength: 'Username must be at least 3 characters',
            passwordMinLength: 'Password must be at least 6 characters',
            passwordMismatch: 'Passwords do not match',
            enterCaptcha: 'Please enter captcha',
            captchaError: 'Captcha error, please try again',
            usernameExists: 'Username already exists',
            loginError: 'Invalid username or password',
            loginSuccess: 'Login successful!',
            serverSaved: 'Debug address saved',
            officialServer: 'Switched to official server'
        },
        'ja': {
            title: 'ランチャーログイン',
            username: 'アカウント',
            password: 'パスワード',
            captcha: 'キャプチャ',
            remember: 'ログイン状態を保持',
            autoLogin: '自動ログイン',
            loginBtn: 'ゲームに入る',
            settingsBtn: 'グローバル設定',
            versionHistoryBtn: 'バージョン更新',
            settingsTitle: 'グローバル設定',
            launcherUpdate: 'ランチャーアップデート',
            homepageUpdate: 'ホームページアップデート',
            earlyUpdate: '初期アップデート履歴',
            language: '言語',
            gameServer: 'ゲームサーバー',
            officialServer: '公式サーバー',
            customServer: 'カスタムサーバー',
            debugAddress: 'デバッグアドレスを入力',
            cancel: 'キャンセル',
            confirm: '確認',
            close: '閉じる',
            versionHistoryTitle: 'バージョン更新履歴',
            majorUpdate: 'メジャーアップデート',
            importantUpdate: '重要なアップデート',
            normalUpdate: '通常のアップデート',
            regTitle: '新規アカウント登録',
            regUsername: 'ユーザー名を入力',
            regPassword: 'パスワードを入力',
            regConfirmPassword: 'パスワードを確認',
            regBtn: '登録',
            successReg: '登録成功！新しいアカウントでログインしてください',
            loading: '読み込み中...',
            backToHome: 'ホームに戻る',
            loginAccount: 'ログイン',
            registerAccount: '登録',
            loginPageTitle: 'アカウントログイン',
            loginPageDesc: 'おかえりなさい、続けるにはログインしてください~  (っ˘ ˘ς)',
            backToLogin: 'ログインに戻る',
            forgotPassword: 'パスワードをお忘れですか？',
            feedback: 'フィードバック',
            feedbackTitle: 'フィードバック',
            feedbackType: 'フィードバックの種類',
            feedbackContent: 'フィードバック内容',
            includeSystemInfo: 'システム情報を送信',
            submitFeedback: 'フィードバックを送信',
            forgotPasswordTitle: 'パスワードを忘れた',
            resetPasswordTitle: 'パスワードをリセット',
            newPassword: '新しいパスワード',
            confirmPassword: 'パスワードを確認',
            verify: '検証',
            reset: 'リセット',
            forgotPasswordMessage: '認証のために電話番号とメールアドレスを入力してください',
            userAgreement: 'ユーザー契約',
            privacyPolicy: 'プライバシーポリシー',
            iHaveRead: '私は読んで同意します',
            and: '及び',
            userCenter: 'ユーザーセンター',
            notLoggedIn: 'ログインしていない',
            id: 'ID: ',
            refreshCaptcha: 'クリックしてキャプチャを更新',
            aboutLauncher: 'ランチャーについて',
            card: '名刺',
            hideUI: 'UIを非表示',
            expandMore: 'さらに機能を展開するにはクリック',
            collapseMore: '機能を折りたたむにはクリック',
            mobileExpandMore: 'さらに機能を展開',
            mobileCollapseMore: '機能を折りたたむ',
            userInfo: 'ユーザー情報',
            accountSettings: 'アカウント設定に入るにはクリック',
            logout: 'ログアウト',
            versionInfo: 'ランチャーは RC 1.2.1.2 (a4) バージョンに基づいています',
            copyright: '© 2014-2026 GPY Games Studio',
            mobileWarning: 'モバイル体験は悪い可能性があります、PCでアクセスすることをお勧めします',
            mobileWarningBtn: '知っています',
            autoLoginSuccess: '自動ログイン成功',
            autoLoginMessage: 'ログイン中、すぐにゲームロビーに入ります...',
            accountNotFound: 'アカウントが見つかりません',
            accountNotFoundMessage: 'アカウントが見つかりません、最初に登録してください！',
            goToRegister: '登録に行く',
            goToLogin: 'ログインに行く',
            logoutConfirm: 'ログアウトしますか？',
            notLoggedInMessage: 'ログインしているアカウントがありません、最初にログインまたは登録してください',
            registerConfirm: '登録情報を確認',
            confirmSubmit: '登録を確認',
            confirmCancel: '修正に戻る',
            feedbackSubmitSuccess: 'フィードバックが正常に送信されました、ご提案ありがとうございます！',
            passwordResetSuccess: 'パスワードのリセットに成功しました！新しいパスワードでログインしてください',
            accountDeleted: 'アカウントは完全に削除されました',
            cancelDelete: '削除操作をキャンセル',
            confirmLogin: '再ログイン確認',
            confirmLoginMessage: '再ログインが確認されました、アカウント削除操作は終了しました',
            backToTop: '上部に戻る',
            enterAccount: 'アカウントを入力してください',
            enterPassword: 'パスワードを入力してください',
            enterUsername: 'ユーザー名を入力してください',
            usernameMinLength: 'ユーザー名は3文字以上である必要があります',
            passwordMinLength: 'パスワードは6文字以上である必要があります',
            passwordMismatch: 'パスワードが一致しません',
            enterCaptcha: 'キャプチャを入力してください',
            captchaError: 'キャプチャエラー、もう一度お試しください',
            usernameExists: 'ユーザー名は既に存在します',
            loginError: 'ユーザー名またはパスワードが間違っています',
            loginSuccess: 'ログイン成功！',
            serverSaved: 'デバッグアドレスが保存されました',
            officialServer: '公式サーバーに切り替えました'
        },
        'ko': {
            title: '런처로그인',
            username: '계정',
            password: '비밀번호',
            captcha: '인증코드',
            remember: '로그인 상태 유지',
            autoLogin: '자동 로그인',
            loginBtn: '게임에 들어가기',
            settingsBtn: '전역 설정',
            versionHistoryBtn: '버전 업데이트',
            settingsTitle: '전역 설정',
            launcherUpdate: '런처 업데이트',
            homepageUpdate: '홈페이지 업데이트',
            earlyUpdate: '초기 업데이트 기록',
            language: '언어',
            gameServer: '게임 서버',
            officialServer: '공식 서버',
            customServer: '커스텀 서버',
            debugAddress: '디버그 주소를 입력하세요',
            cancel: '취소',
            confirm: '확인',
            close: '닫기',
            versionHistoryTitle: '버전 업데이트 기록',
            majorUpdate: '주요 업데이트',
            importantUpdate: '중요 업데이트',
            normalUpdate: '일반 업데이트',
            regTitle: '새 계정 등록',
            regUsername: '사용자 이름을 입력하세요',
            regPassword: '비밀번호를 입력하세요',
            regConfirmPassword: '비밀번호를 확인하세요',
            regBtn: '등록',
            successReg: '등록 성공! 새 계정으로 로그인하세요',
            loading: '로딩 중...',
            backToHome: '홈으로 돌아가기',
            loginAccount: '로그인',
            registerAccount: '등록',
            loginPageTitle: '계정 로그인',
            loginPageDesc: '환영합니다, 계속하려면 로그인하세요~  (っ˘ ˘ς)',
            backToLogin: '로그인으로 돌아가기',
            forgotPassword: '비밀번호를 잊으셨나요?',
            feedback: '피드백',
            feedbackTitle: '피드백',
            feedbackType: '피드백 유형',
            feedbackContent: '피드백 내용',
            includeSystemInfo: '시스템 정보 보내기',
            submitFeedback: '피드백 제출',
            forgotPasswordTitle: '비밀번호 잊음',
            resetPasswordTitle: '비밀번호 재설정',
            newPassword: '새 비밀번호',
            confirmPassword: '비밀번호 확인',
            verify: '검증',
            reset: '재설정',
            forgotPasswordMessage: '인증을 위해 전화번호와 이메일을 입력해주세요',
            userAgreement: '사용자 약관',
            privacyPolicy: '개인정보 정책',
            iHaveRead: '저는 읽고 동의합니다',
            and: '및',
            userCenter: '사용자 센터',
            notLoggedIn: '로그인되지 않음',
            id: 'ID: ',
            refreshCaptcha: '클릭하여 인증코드 새로고침',
            aboutLauncher: '런처 정보',
            card: '명함',
            hideUI: 'UI 숨기기',
            expandMore: '더 많은 기능을展开하려면 클릭하세요',
            collapseMore: '기능을 접으려면 클릭하세요',
            mobileExpandMore: '더 많은 기능展开',
            mobileCollapseMore: '기능 접기',
            userInfo: '사용자 정보',
            accountSettings: '계정 설정에 들어가려면 클릭하세요',
            logout: '로그아웃',
            versionInfo: '런처는 RC 1.2.1.2 (a4) 버전을 기반으로 개발되었습니다',
            copyright: '© 2014-2026 GPY Games Studio',
            mobileWarning: '모바일 경험이 좋지 않을 수 있습니다, PC로 접속하는 것이 좋습니다',
            mobileWarningBtn: '알겠습니다',
            autoLoginSuccess: '자동 로그인 성공',
            autoLoginMessage: '로그인 중, 곧 게임 로비에 들어갑니다...',
            accountNotFound: '계정을 찾을 수 없습니다',
            accountNotFoundMessage: '계정을 찾을 수 없습니다, 먼저 등록하세요!',
            goToRegister: '등록하러 가기',
            goToLogin: '로그인하러 가기',
            logoutConfirm: '로그아웃하시겠습니까?',
            notLoggedInMessage: '로그인된 계정이 없습니다, 먼저 로그인하거나 등록하세요',
            registerConfirm: '등록 정보 확인',
            confirmSubmit: '등록 확인',
            confirmCancel: '수정으로 돌아가기',
            feedbackSubmitSuccess: '피드백이 성공적으로 제출되었습니다, 제안해 주셔서 감사합니다!',
            passwordResetSuccess: '비밀번호 재설정 성공! 새 비밀번호로 로그인하세요',
            accountDeleted: '계정이 완전히 삭제되었습니다',
            cancelDelete: '삭제 작업 취소',
            confirmLogin: '다시 로그인 확인',
            confirmLoginMessage: '다시 로그인이 확인되었습니다, 계정 삭제 작업이 종료되었습니다',
            backToTop: '맨 위로 돌아가기',
            enterAccount: '계정을 입력하세요',
            enterPassword: '비밀번호를 입력하세요',
            enterUsername: '사용자 이름을 입력하세요',
            usernameMinLength: '사용자 이름은 최소 3자 이상이어야 합니다',
            passwordMinLength: '비밀번호는 최소 6자 이상이어야 합니다',
            passwordMismatch: '두 번 입력한 비밀번호가 일치하지 않습니다',
            enterCaptcha: '인증코드를 입력하세요',
            captchaError: '인증코드 오류, 다시 입력하세요',
            usernameExists: '이 사용자 이름은 이미 존재합니다',
            loginError: '사용자 이름 또는 비밀번호가 잘못되었습니다',
            loginSuccess: '로그인 성공!',
            serverSaved: '디버그 주소가 저장되었습니다',
            officialServer: '공식 서버로 전환되었습니다'
        }
    };
    
    // 初始化语言设置
    function init() {
        const lang = SettingsManager.get('language') || 'zh';
        changeLanguage(lang);
    }
    
    // 切换语言
    function changeLanguage(lang) {
        SettingsManager.set('language', lang);
        const texts = langMap[lang];
        
        // 更新页面标题
        document.title = texts.title;
        
        // 更新登录表单
        document.getElementById('username').placeholder = texts.username;
        document.getElementById('password').placeholder = texts.password;
        document.getElementById('captcha').placeholder = texts.captcha;
        document.querySelector('label[for="remember"]').textContent = texts.remember;
        document.querySelector('label[for="autoLogin"]').textContent = texts.autoLogin;
        document.getElementById('loginButton').innerHTML = '<i class="fas fa-sign-in-alt"></i> ' + texts.loginBtn;
        
        // 更新全局设置模态框
        document.querySelector('#debugModal h3').textContent = texts.settingsTitle;
        document.querySelectorAll('.setting-label span')[0].textContent = texts.language;
        document.querySelectorAll('.setting-label span')[1].textContent = texts.gameServer;
        document.querySelector('#serverSelect option[value="official"]').textContent = texts.officialServer;
        document.querySelector('#serverSelect option[value="custom"]').textContent = texts.customServer;
        document.getElementById('apiUrlInput').placeholder = texts.debugAddress;
        document.getElementById('debugCancel').textContent = texts.cancel;
        document.getElementById('debugConfirm').textContent = texts.confirm;
        
        // 更新版本更新历史模态框
        document.querySelector('#versionHistoryModal h3').textContent = texts.versionHistoryTitle;
        document.getElementById('versionHistoryCancel').textContent = texts.close;
        
        // 更新注册模态框
        document.querySelector('#registerModal h3').textContent = texts.regTitle;
        document.getElementById('regUsername').placeholder = texts.regUsername;
        document.getElementById('regPassword').placeholder = texts.regPassword;
        document.getElementById('regConfirmPassword').placeholder = texts.regConfirmPassword;
        document.getElementById('regCaptcha').placeholder = texts.captcha;
        document.getElementById('registerConfirm').textContent = texts.regBtn;
        document.getElementById('goToLogin').textContent = texts.backToLogin;
        document.getElementById('registerNext1').textContent = texts.confirm;
        document.getElementById('registerBack1').textContent = texts.cancel;
        document.getElementById('registerNext2').textContent = texts.confirm;
        document.getElementById('registerBack2').textContent = texts.cancel;
        
        // 更新验证码相关
        document.querySelectorAll('.captcha-text').forEach(el => {
            el.textContent = texts.loading;
        });
        var captchaHints = document.querySelectorAll('.captcha-hint');
        captchaHints.forEach(function(hint) {
            hint.textContent = texts.refreshCaptcha;
        });
        
        // 更新侧边栏
        var sidebarMenuItems = document.querySelectorAll('.sidebar-menu .menu-item span');
        if (sidebarMenuItems[0]) sidebarMenuItems[0].textContent = texts.loginAccount;
        if (sidebarMenuItems[1]) sidebarMenuItems[1].textContent = texts.registerAccount;
        if (sidebarMenuItems[2]) sidebarMenuItems[2].textContent = texts.settingsBtn;
        if (sidebarMenuItems[3]) sidebarMenuItems[3].textContent = texts.feedback;
        if (sidebarMenuItems[4]) sidebarMenuItems[4].textContent = texts.versionHistoryBtn;
        if (sidebarMenuItems[5]) sidebarMenuItems[5].textContent = '开发者公告';
        
        // 更新版本信息
        var versionInfo = document.getElementById('versionInfo');
        if (versionInfo) versionInfo.textContent = texts.versionInfo;
        
        // 更新版权信息
        var copyright = document.querySelector('.sidebar-copyright p');
        if (copyright) copyright.textContent = texts.copyright;
        
        // 更新顶部导航栏
        var settingsHeader = document.querySelector('.settings-header h1');
        var settingsHeaderDesc = document.querySelector('.settings-header p');
        if (settingsHeader) settingsHeader.textContent = texts.loginPageTitle;
        if (settingsHeaderDesc) settingsHeaderDesc.textContent = texts.loginPageDesc;
        
        // 更新顶部按钮提示
        var headerButtonsContainer = document.getElementById('headerButtonsContainer');
        var toggleButtonsContainer = document.querySelector('.toggle-buttons-container');
        
        // 更新顶部功能按钮的提示
        var aboutTooltip = headerButtonsContainer.querySelector('.about-launcher-btn-container .btn-tooltip span');
        var cardTooltip = headerButtonsContainer.querySelector('.card-btn-container .btn-tooltip span');
        var hideUITooltip = headerButtonsContainer.querySelector('.hide-interface-btn-container .btn-tooltip span');
        var uiScaleTooltip = headerButtonsContainer.querySelector('.ui-scale-btn-container .btn-tooltip span');
        
        if (aboutTooltip) aboutTooltip.textContent = texts.aboutLauncher;
        if (cardTooltip) cardTooltip.textContent = texts.card;
        if (hideUITooltip) hideUITooltip.textContent = texts.hideUI;
        if (uiScaleTooltip) uiScaleTooltip.textContent = '调整UI比例(BETA)';
        
        // 更新切换按钮的提示
        var toggleTooltip = toggleButtonsContainer.querySelector('.btn-tooltip span');
        if (toggleTooltip) {
            toggleTooltip.textContent = headerButtonsContainer.classList.contains('expanded') ? texts.collapseMore : texts.expandMore;
        }
        
        // 更新移动端按钮提示
        var mobileToggleText = document.querySelector('.mobile-toggle-text');
        if (mobileToggleText) {
            var mobileButtonsGroup = document.getElementById('mobileButtonsGroup');
            mobileToggleText.textContent = mobileButtonsGroup.classList.contains('expanded') ? texts.mobileCollapseMore : texts.mobileExpandMore;
        }
        var mobileBtnTooltips = document.querySelectorAll('.mobile-buttons-group .btn-tooltip span');
        if (mobileBtnTooltips[0]) mobileBtnTooltips[0].textContent = texts.aboutLauncher;
        if (mobileBtnTooltips[1]) mobileBtnTooltips[1].textContent = texts.card;
        if (mobileBtnTooltips[2]) mobileBtnTooltips[2].textContent = texts.hideUI;
        
        // 更新用户中心
        var userNameElement = document.getElementById('userName');
        if (userNameElement) {
            var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser.username) {
                userNameElement.textContent = currentUser.username;
            } else {
                userNameElement.textContent = texts.notLoggedIn;
            }
        }
        
        var userIdElement = document.getElementById('userId');
        if (userIdElement) {
            var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser.userId) {
                userIdElement.textContent = texts.id + currentUser.userId;
            } else {
                userIdElement.textContent = texts.id + '---';
            }
        }
        
        // 更新用户中心提示框
        var userTooltipHeader = document.querySelector('#userTooltip .tooltip-header span');
        if (userTooltipHeader) userTooltipHeader.textContent = texts.userInfo;
        var accountSettingsLink = document.querySelector('#accountSettingsLink span');
        if (accountSettingsLink) accountSettingsLink.textContent = texts.accountSettings;
        var logoutTooltip = document.querySelector('.logout-tooltip span');
        if (logoutTooltip) logoutTooltip.textContent = texts.logout;
        
        // 更新忘记密码链接
        var forgotPasswordLink = document.getElementById('forgotPassword');
        if (forgotPasswordLink) {
            forgotPasswordLink.textContent = texts.forgotPassword;
        }
        
        // 更新用户协议和隐私政策
        var agreementSections = document.querySelectorAll('.agreement-section label');
        agreementSections.forEach(function(agreementSection) {
            agreementSection.innerHTML = texts.iHaveRead + '《<a href="#" class="agreement-link" data-type="terms">' + texts.userAgreement + '</a>》' + texts.and + '《<a href="#" class="agreement-link" data-type="privacy">' + texts.privacyPolicy + '</a>》';
        });
        
        // 重新绑定点击事件监听器
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
        
        // 更新找回密码模态框
        var forgotPasswordModal = document.getElementById('forgotPasswordModal');
        if (forgotPasswordModal) {
            var forgotPasswordTitle = forgotPasswordModal.querySelector('h3');
            if (forgotPasswordTitle) forgotPasswordTitle.textContent = texts.forgotPasswordTitle;
            var forgotPasswordMessage = forgotPasswordModal.querySelector('p');
            if (forgotPasswordMessage) forgotPasswordMessage.textContent = texts.forgotPasswordMessage;
        }
        
        // 更新重置密码模态框
        var resetPasswordModal = document.getElementById('resetPasswordModal');
        if (resetPasswordModal) {
            var resetPasswordTitle = resetPasswordModal.querySelector('h3');
            if (resetPasswordTitle) resetPasswordTitle.textContent = texts.resetPasswordTitle;
            var resetPasswordMessage = resetPasswordModal.querySelector('p');
            if (resetPasswordMessage) resetPasswordMessage.textContent = 'Please enter your new password';
            document.getElementById('resetPasswordConfirm').textContent = texts.reset;
            document.getElementById('resetPasswordCancel').textContent = texts.cancel;
        }
        
        // 更新反馈建议模态框
        var feedbackModal = document.getElementById('feedbackModal');
        if (feedbackModal) {
            var feedbackTitle = feedbackModal.querySelector('h3');
            if (feedbackTitle) feedbackTitle.textContent = texts.feedbackTitle;
            var feedbackTypeLabel = feedbackModal.querySelector('label[for="feedbackType"]');
            if (feedbackTypeLabel) feedbackTypeLabel.textContent = texts.feedbackType;
            var feedbackContentLabel = feedbackModal.querySelector('label[for="feedbackContent"]');
            if (feedbackContentLabel) feedbackContentLabel.textContent = texts.feedbackContent;
            var includeSystemInfoLabel = feedbackModal.querySelector('label[for="includeSystemInfo"]');
            if (includeSystemInfoLabel) includeSystemInfoLabel.textContent = texts.includeSystemInfo;
            document.getElementById('feedbackSubmit').textContent = texts.submitFeedback;
            document.getElementById('feedbackCancel').textContent = texts.cancel;
        }
        
        // 更新账号不存在模态框
        var accountNotFoundModal = document.getElementById('accountNotFoundModal');
        if (accountNotFoundModal) {
            var accountNotFoundTitle = accountNotFoundModal.querySelector('h3');
            if (accountNotFoundTitle) accountNotFoundTitle.textContent = texts.accountNotFound;
            var accountNotFoundMessage = accountNotFoundModal.querySelector('p');
            if (accountNotFoundMessage) accountNotFoundMessage.textContent = texts.accountNotFoundMessage;
            document.getElementById('accountNotFoundCancel').textContent = texts.cancel;
            document.getElementById('accountNotFoundRegister').textContent = texts.goToRegister;
        }
        
        // 更新未登录模态框
        var notLoggedInModal = document.getElementById('notLoggedInModal');
        if (notLoggedInModal) {
            var notLoggedInTitle = notLoggedInModal.querySelector('h3');
            if (notLoggedInTitle) notLoggedInTitle.textContent = texts.notLoggedIn;
            var notLoggedInMessage = notLoggedInModal.querySelector('p');
            if (notLoggedInMessage) notLoggedInMessage.textContent = texts.notLoggedInMessage;
            document.getElementById('goToLogin').textContent = texts.goToLogin;
            document.getElementById('goToRegister').textContent = texts.goToRegister;
        }
        
        // 更新登出确认模态框
        var logoutConfirmModal = document.getElementById('logoutConfirmModal');
        if (logoutConfirmModal) {
            var logoutConfirmTitle = logoutConfirmModal.querySelector('h3');
            if (logoutConfirmTitle) logoutConfirmTitle.textContent = texts.confirm;
            var logoutConfirmMessage = logoutConfirmModal.querySelector('p');
            if (logoutConfirmMessage) logoutConfirmMessage.textContent = texts.logoutConfirm;
            document.getElementById('logoutCancel').textContent = texts.cancel;
            document.getElementById('logoutConfirm').textContent = texts.confirm;
        }
        
        // 更新注册确认模态框
        var registerConfirmModal = document.getElementById('registerConfirmModal');
        if (registerConfirmModal) {
            var registerConfirmTitle = registerConfirmModal.querySelector('h3');
            if (registerConfirmTitle) registerConfirmTitle.textContent = texts.registerConfirm;
            document.getElementById('confirmCancel').textContent = texts.confirmCancel;
            document.getElementById('confirmSubmit').textContent = texts.confirmSubmit;
        }
        
        // 更新移动端提示模态框
        var mobileWarningModal = document.getElementById('mobileWarningModal');
        if (mobileWarningModal) {
            var mobileWarningMessage = mobileWarningModal.querySelector('p');
            if (mobileWarningMessage) mobileWarningMessage.textContent = texts.mobileWarning;
            var mobileWarningBtn = document.getElementById('mobileWarningBtn');
            if (mobileWarningBtn) mobileWarningBtn.textContent = texts.mobileWarningBtn;
        }
        
        // 更新返回顶部按钮提示
        var backToTopTooltips = document.querySelectorAll('.back-to-top-tooltip');
        backToTopTooltips.forEach(function(tooltip) {
            tooltip.textContent = texts.backToTop;
        });
    }
    
    // 获取语言文本
    function getLanguageText(key) {
        const lang = SettingsManager.get('language') || 'zh';
        return langMap[lang][key];
    }
    
    return {
        init: init,
        changeLanguage: changeLanguage,
        getLanguageText: getLanguageText
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LangManager;
}