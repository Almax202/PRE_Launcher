// 语言管理模块
const LangManager = (function() {
    const langMap = {
        'zh': {
            title: 'LauncherLogin',
            username: '账号',
            password: '密码',
            captcha: '验证码',
            remember: '快速登录',
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
            suggestionType: '功能建议',
            bugType: 'Bug反馈',
            otherType: '其他问题',
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
            hideUIHint: '点击空白处显示UI',
            hideHint: '点击隐藏该提示',
            expandMore: '点击展开更多功能',
            collapseMore: '点击收起更多功能',
            mobileExpandMore: '展开更多功能',
            mobileCollapseMore: '收起更多功能',
            userInfo: '用户信息',
            accountSettings: '点击进入系统设置',
            logout: '退出登录',
            versionInfo: '启动器基于 RC 1.2.1.2 (a4) 版本开发',
            copyright: '© 2014-2026 PREAlmax, All rights reserved.',
            mobileWarning: '移动端体验可能不佳，建议使用PC端访问',
            mobileWarningBtn: '我知道了',
            autoLoginSuccess: '自动登录成功',
            autoLoginMessage: '正在登录中，即将进入游戏大厅...',
            accountNotFound: '账号不存在',
            accountNotFoundMessage: '未查找到账号，请先注册！',
            goToRegister: '去注册',
            goToLogin: '去登录',
            logoutConfirm: '确认要退出登录吗？',
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
            officialServer: '已切换到官方服务器',
            developerAnnouncement: '开发者公告',
            announcementCenter: '公告中心',
            eventCenter: '活动中心',
            eventAnnouncement: '活动公告',
            offlineMode: '离线模式',
            quickLoginMode: '快速登录模式',
            pinVerification: '验证PIN码',
            pinVerificationDesc: '为了您的账户安全，请完成两步验证',
            pinInfo: 'PIN码是您在启用两步验证时设置的6位数字密码',
            forgotPin: '忘记PIN码？请在系统设置中重置',
            noVerifyToday: '今日不再验证',
            noVerifyHint: '退出登录后需重新验证',
            securityVerify: '安全验证',
            securityVerifyDesc: '请输入账户密码以进行安全验证',
            usePinForVerification: '使用PIN码进行安全验证',
            themeUpdate: '主题更新',
            themeUpdateMessage: '检测到主题更新，三秒后将自动刷新页面以应用新主题',
            adjustUiScale: '调整UI比例',
            scaleReset: '重置',
            offlineModeConfirm: '确认要进入离线模式吗？进入后启动器的部分功能将受到限制',
            onlineModeConfirm: '确认要切换到在线模式吗？将尝试重新连接服务器',
            noNetwork: '网络连接提示',
            noNetworkMessage: '当前无网络连接，请检查网络设置',
            noNetworkQuestion: '是否进入离线模式？',
            networkRestored: '网络连接恢复',
            networkRestoredMessage: '检测到网络连接已恢复，是否重新上线？',
            moreActions: '更多操作',
            enterAccountSettings: '系统设置',
            tooltipUsername: '用户名：',
            tooltipUserId: '用户ID：',
            tooltipRegTime: '注册时间：',
            enterNewPassword: '请输入新密码',
            enterPin: '请输入6位PIN码',
            pinError: 'PIN码错误，请重试',
            passwordError: '密码错误，请重试',
            uiScaleRange: '调整UI比例(BETA)',
            close: '关闭',
            prompt: '提示',
            alertMessage: '提示信息',
            cancelLogin: '取消登录',
            verifyLogin: '验证登录',
            confirmAction: '确认操作',
            remainingSeconds: '还剩',
            seconds: '秒',
            moreFeatures: '更多功能',
            adjustUiScaleSimple: '调整UI比例',
            enterOfflineMode: '进入离线模式',
            defaultServer: '默认服务器',
            listNav: 'LIST',
            featureUpdates: '查看功能更新',
            outdatedVersions: '过时版本记录',
            miniGameUpdates: '小游戏更新记录',
            viewing: '查看中',
            snake: '贪吃蛇',
            colormatch: '颜色匹配',
            memory: '记忆卡牌',
            wzq: '五子棋',
            fxq: '飞行器',
            fkgame: '点击方块',
            launcherRecord: '启动器记录',
            homepageRecord: '主页面记录'
        },
        'en': {
            title: 'LauncherLogin',
            username: 'Account',
            password: 'Password',
            captcha: 'Captcha',
            remember: 'Quick Login',
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
            suggestionType: 'Feature Suggestion',
            bugType: 'Bug Report',
            otherType: 'Other Issues',
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
            hideUIHint: 'Click blank area to show UI',
            hideHint: 'Click to hide this hint',
            expandMore: 'Click to expand more features',
            collapseMore: 'Click to collapse more features',
            mobileExpandMore: 'Expand more features',
            mobileCollapseMore: 'Collapse more features',
            userInfo: 'User Info',
            accountSettings: 'Click to enter account settings',
            logout: 'Logout',
            versionInfo: 'Launcher based on RC 1.2.1.2 (a4) version',
            copyright: '© 2014-2026 PREAlmax, All rights reserved.',
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
            officialServer: 'Switched to official server',
            developerAnnouncement: 'Developer Announcement',
            announcementCenter: 'Announcement Center',
            eventCenter: 'Event Center',
            eventAnnouncement: 'Event Announcement',
            offlineMode: 'Offline Mode',
            quickLoginMode: 'Quick Login Mode',
            pinVerification: 'Verify PIN',
            pinVerificationDesc: 'For your account security, please complete two-factor verification',
            pinInfo: 'PIN is a 6-digit password set when you enabled two-factor authentication',
            forgotPin: 'Forgot PIN? Reset in account settings',
            noVerifyToday: 'Do not verify today',
            noVerifyHint: 'Re-verification required after logout',
            securityVerify: 'Security Verification',
            securityVerifyDesc: 'Please enter account password for security verification',
            usePinForVerification: 'Use PIN for verification',
            themeUpdate: 'Theme Update',
            themeUpdateMessage: 'Theme update detected, page will refresh automatically in 3 seconds',
            adjustUiScale: 'Adjust UI Scale',
            scaleReset: 'Reset',
            offlineModeConfirm: 'Are you sure you want to enter offline mode? Some features will be limited',
            onlineModeConfirm: 'Are you sure you want to switch to online mode? Will try to reconnect to server',
            noNetwork: 'Network Connection',
            noNetworkMessage: 'No network connection, please check network settings',
            noNetworkQuestion: 'Enter offline mode?',
            networkRestored: 'Network Restored',
            networkRestoredMessage: 'Network connection restored, reconnect?',
            moreActions: 'More Actions',
            enterAccountSettings: 'Enter Account Settings',
            tooltipUsername: 'Username: ',
            tooltipUserId: 'User ID: ',
            tooltipRegTime: 'Registration Time: ',
            enterNewPassword: 'Please enter your new password',
            enterPin: 'Please enter 6-digit PIN',
            pinError: 'PIN error, please try again',
            passwordError: 'Password error, please try again',
            uiScaleRange: 'Adjust UI Scale(BETA)',
            close: 'Close',
            prompt: 'Prompt',
            alertMessage: 'Alert Message',
            cancelLogin: 'Cancel Login',
            verifyLogin: 'Verify Login',
            confirmAction: 'Confirm Action',
            remainingSeconds: '',
            seconds: 's',
            moreFeatures: 'More Features',
            adjustUiScaleSimple: 'Adjust UI Scale',
            enterOfflineMode: 'Enter Offline Mode',
            defaultServer: 'Default Server',
            listNav: 'LIST',
            featureUpdates: 'Feature Updates',
            outdatedVersions: 'Outdated Versions',
            miniGameUpdates: 'Mini Game Updates',
            viewing: 'Viewing',
            snake: 'Snake',
            colormatch: 'Color Match',
            memory: 'Memory Cards',
            wzq: 'Gomoku',
            fxq: 'Flyer',
            fkgame: 'Click Blocks',
            launcherRecord: 'Launcher Record',
            homepageRecord: 'Homepage Record'
        },
        'ja': {
            title: 'ランチャーログイン',
            username: 'アカウント',
            password: 'パスワード',
            captcha: 'キャプチャ',
            remember: 'クイックログイン',
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
            suggestionType: '機能提案',
            bugType: 'バグ報告',
            otherType: 'その他の問題',
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
            hideUIHint: '空白部分をクリックしてUIを表示',
            hideHint: 'クリックしてこのヒントを非表示',
            expandMore: 'さらに機能を展開するにはクリック',
            collapseMore: '機能を折りたたむにはクリック',
            mobileExpandMore: 'さらに機能を展開',
            mobileCollapseMore: '機能を折りたたむ',
            userInfo: 'ユーザー情報',
            accountSettings: 'アカウント設定に入るにはクリック',
            logout: 'ログアウト',
            versionInfo: 'ランチャーは RC 1.2.1.2 (a4) バージョンに基づいています',
            copyright: '© 2014-2026 PREAlmax, All rights reserved.',
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
            officialServer: '公式サーバーに切り替えました',
            developerAnnouncement: '開発者告知',
            announcementCenter: '告知センター',
            eventCenter: 'イベントセンター',
            eventAnnouncement: 'イベント告知',
            offlineMode: 'オフラインモード',
            quickLoginMode: 'クイックログインモード',
            pinVerification: 'PINを確認',
            pinVerificationDesc: 'アカウントのセキュリティのため、二要素認証を完了してください',
            pinInfo: 'PINは二要素認証を有効にしたときに設定した6桁のパスワードです',
            forgotPin: 'PINを忘れましたか？アカウント設定でリセットしてください',
            noVerifyToday: '今日は確認しない',
            noVerifyHint: 'ログアウト後に再確認が必要です',
            securityVerify: 'セキュリティ確認',
            securityVerifyDesc: 'セキュリティ確認のためアカウントパスワードを入力してください',
            usePinForVerification: 'PINで確認',
            themeUpdate: 'テーマ更新',
            themeUpdateMessage: 'テーマ更新を検出しました、3秒後に自動的にページを更新して新しいテーマを適用します',
            adjustUiScale: 'UIスケールを調整',
            scaleReset: 'リセット',
            offlineModeConfirm: 'オフラインモードに入りますか？一部の機能が制限されます',
            onlineModeConfirm: 'オンラインモードに切り替えますか？サーバーに再接続しようとします',
            noNetwork: 'ネットワーク接続',
            noNetworkMessage: '現在ネットワークに接続されていません、ネットワーク設定を確認してください',
            noNetworkQuestion: 'オフラインモードに入りますか？',
            networkRestored: 'ネットワーク接続が復元されました',
            networkRestoredMessage: 'ネットワーク接続が復元されました、再接続しますか？',
            moreActions: 'その他の操作',
            enterAccountSettings: 'アカウント設定に入る',
            tooltipUsername: 'ユーザー名：',
            tooltipUserId: 'ユーザーID：',
            tooltipRegTime: '登録時間：',
            enterNewPassword: '新しいパスワードを入力してください',
            enterPin: '6桁のPINを入力してください',
            pinError: 'PINが間違っています、もう一度お試しください',
            passwordError: 'パスワードが間違っています、もう一度お試しください',
            uiScaleRange: 'UIスケールを調整(BETA)',
            close: '閉じる',
            prompt: 'ヒント',
            alertMessage: 'ヒント情報',
            cancelLogin: 'ログインをキャンセル',
            verifyLogin: 'ログインを確認',
            confirmAction: '操作を確認',
            remainingSeconds: '残り',
            seconds: '秒',
            moreFeatures: 'その他の機能',
            adjustUiScaleSimple: 'UIスケールを調整',
            enterOfflineMode: 'オフラインモードに入る',
            defaultServer: 'デフォルトサーバー',
            listNav: 'LIST',
            featureUpdates: '機能更新',
            outdatedVersions: '古いバージョン',
            miniGameUpdates: 'ミニゲーム更新',
            viewing: '表示中',
            snake: 'スネーク',
            colormatch: 'カラーマッチ',
            memory: '記憶カード',
            wzq: '五目並べ',
            fxq: 'フライヤー',
            fkgame: 'ブロックをクリック',
            launcherRecord: 'ランチャー記録',
            homepageRecord: 'ホームページ記録'
        },
        'ko': {
            title: '런처로그인',
            username: '계정',
            password: '비밀번호',
            captcha: '인증코드',
            remember: '빠른 로그인',
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
            suggestionType: '기능 제안',
            bugType: '버그 보고',
            otherType: '기타 문제',
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
            hideUIHint: '빈 공간을 클릭하여 UI 표시',
            hideHint: '클릭하여 이 힌트 숨기기',
            expandMore: '더 많은 기능을展开하려면 클릭하세요',
            collapseMore: '기능을 접으려면 클릭하세요',
            mobileExpandMore: '더 많은 기능展开',
            mobileCollapseMore: '기능 접기',
            userInfo: '사용자 정보',
            accountSettings: '계정 설정에 들어가려면 클릭하세요',
            logout: '로그아웃',
            versionInfo: '런처는 RC 1.2.1.2 (a4) 버전을 기반으로 개발되었습니다',
            copyright: '© 2014-2026 PREAlmax, All rights reserved.',
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
            officialServer: '공식 서버로 전환되었습니다',
            developerAnnouncement: '개발자 공지',
            announcementCenter: '공지 센터',
            eventCenter: '이벤트 센터',
            eventAnnouncement: '이벤트 공지',
            offlineMode: '오프라인 모드',
            quickLoginMode: '빠른 로그인 모드',
            pinVerification: 'PIN 확인',
            pinVerificationDesc: '계정 보안을 위해 2단계 인증을 완료하세요',
            pinInfo: 'PIN은 2단계 인증을 활성화할 때 설정한 6자리 비밀번호입니다',
            forgotPin: 'PIN을 잊으셨나요? 계정 설정에서 재설정하세요',
            noVerifyToday: '오늘은 확인하지 않음',
            noVerifyHint: '로그아웃 후 재확인이 필요합니다',
            securityVerify: '보안 확인',
            securityVerifyDesc: '보안 확인을 위해 계정 비밀번호를 입력하세요',
            usePinForVerification: 'PIN으로 확인',
            themeUpdate: '테마 업데이트',
            themeUpdateMessage: '테마 업데이트가 감지되었습니다, 3초 후 자동으로 페이지를 새로 고쳐 새로운 테마를 적용합니다',
            adjustUiScale: 'UI 비율 조정',
            scaleReset: '초기화',
            offlineModeConfirm: '오프라인 모드에 들어가시겠습니까? 일부 기능이 제한됩니다',
            onlineModeConfirm: '온라인 모드로 전환하시겠습니까? 서버에 다시 연결하려고 시도합니다',
            noNetwork: '네트워크 연결',
            noNetworkMessage: '현재 네트워크에 연결되지 않았습니다, 네트워크 설정을 확인하세요',
            noNetworkQuestion: '오프라인 모드로 들어갑니까?',
            networkRestored: '네트워크 연결 복원',
            networkRestoredMessage: '네트워크 연결이 복원되었습니다, 다시 연결하시겠습니까?',
            moreActions: '기타 작업',
            enterAccountSettings: '계정 설정에 들어가기',
            tooltipUsername: '사용자 이름：',
            tooltipUserId: '사용자 ID：',
            tooltipRegTime: '등록 시간：',
            enterNewPassword: '새 비밀번호를 입력하세요',
            enterPin: '6자리 PIN을 입력하세요',
            pinError: 'PIN 오류, 다시 시도하세요',
            passwordError: '비밀번호 오류, 다시 시도하세요',
            uiScaleRange: 'UI 비율 조정(BETA)',
            close: '닫기',
            prompt: '알림',
            alertMessage: '알림 메시지',
            cancelLogin: '로그인 취소',
            verifyLogin: '로그인 확인',
            confirmAction: '작업 확인',
            remainingSeconds: '남은',
            seconds: '초',
            moreFeatures: '더 많은 기능',
            adjustUiScaleSimple: 'UI 비율 조정',
            enterOfflineMode: '오프라인 모드로 들어가기',
            defaultServer: '기본 서버',
            listNav: 'LIST',
            featureUpdates: '기능 업데이트',
            outdatedVersions: '오래된 버전',
            miniGameUpdates: '미니게임 업데이트',
            viewing: '보는 중',
            snake: '스네이크',
            colormatch: '컬러 매치',
            memory: '기억 카드',
            wzq: '오목',
            fxq: '플라이어',
            fkgame: '블록 클릭',
            launcherRecord: '런처 기록',
            homepageRecord: '홈페이지 기록'
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
        if (sidebarMenuItems[5]) sidebarMenuItems[5].textContent = texts.developerAnnouncement;
        
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
        if (uiScaleTooltip) uiScaleTooltip.textContent = texts.uiScaleRange;
        
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
        
        // 更新隐藏UI提示横条
        var hideUiHintBar = document.querySelector('#hideUiHintBar span');
        if (hideUiHintBar) hideUiHintBar.textContent = texts.hideUIHint;
        
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
            if (resetPasswordMessage) resetPasswordMessage.textContent = texts.enterNewPassword;
            document.getElementById('resetPasswordConfirm').textContent = texts.reset;
            document.getElementById('resetPasswordCancel').textContent = texts.cancel;
        }
        
        // 更新反馈建议模态框
        var feedbackModal = document.getElementById('feedbackModal');
        if (feedbackModal) {
            var feedbackTitle = feedbackModal.querySelector('h3');
            if (feedbackTitle) feedbackTitle.textContent = texts.feedbackTitle;
            var feedbackContentLabel = feedbackModal.querySelector('label[for="feedbackContent"]');
            if (feedbackContentLabel) feedbackContentLabel.textContent = texts.feedbackContent;
            var includeSystemInfoLabel = feedbackModal.querySelector('label[for="includeSystemInfo"]');
            if (includeSystemInfoLabel) includeSystemInfoLabel.textContent = texts.includeSystemInfo;
            document.getElementById('feedbackSubmit').textContent = texts.submitFeedback;
            document.getElementById('feedbackCancel').textContent = texts.cancel;
            
            // 更新侧边栏导航文本
            var feedbackNavItems = feedbackModal.querySelectorAll('.feedback-nav-item');
            if (feedbackNavItems.length >= 3) {
                var suggestionText = feedbackNavItems[0].querySelector('span');
                if (suggestionText) suggestionText.innerHTML = texts.suggestionType + '<ul>Suggestion</ul>';
                var bugText = feedbackNavItems[1].querySelector('span');
                if (bugText) bugText.innerHTML = texts.bugType + '<ul>Bug Report</ul>';
                var otherText = feedbackNavItems[2].querySelector('span');
                if (otherText) otherText.innerHTML = texts.otherType + '<ul>Other</ul>';
            }
            
            // 更新侧边栏标题
            var feedbackNavTitle = feedbackModal.querySelector('.terms-nav-title');
            if (feedbackNavTitle) feedbackNavTitle.textContent = texts.feedbackType;
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
        
        // 更新自定义提示模态框
        var customAlert = document.getElementById('customAlert');
        if (customAlert) {
            var customAlertTitle = customAlert.querySelector('h3');
            if (customAlertTitle) customAlertTitle.textContent = texts.prompt;
            var customAlertOk = document.getElementById('alertConfirm');
            if (customAlertOk) customAlertOk.textContent = texts.confirm;
        }
        
        // 更新PIN验证模态框
        var loginPinModal = document.getElementById('loginPinModal');
        if (loginPinModal) {
            var loginPinTitle = loginPinModal.querySelector('h3');
            if (loginPinTitle) loginPinTitle.textContent = texts.pinVerification;
            var loginPinDesc = loginPinModal.querySelector('.header-desc');
            if (loginPinDesc) loginPinDesc.textContent = texts.pinVerificationDesc;
            var pinInfo = loginPinModal.querySelector('.pin-info span');
            if (pinInfo) pinInfo.textContent = texts.pinInfo;
            var loginPinInput = document.getElementById('loginPinInput');
            if (loginPinInput) loginPinInput.placeholder = texts.enterPin;
            var loginPinError = document.getElementById('loginPinError');
            if (loginPinError) loginPinError.textContent = texts.pinError;
            var pinTips = loginPinModal.querySelector('.pin-tips p');
            if (pinTips) pinTips.innerHTML = '<i class="fas fa-key"></i> ' + texts.forgotPin;
            var noVerifyTodayLabel = loginPinModal.querySelector('label[for="pinNoVerifyToday"]');
            if (noVerifyTodayLabel) noVerifyTodayLabel.textContent = texts.noVerifyToday;
            var noVerifyHint = loginPinModal.querySelector('.no-verify-hint');
            if (noVerifyHint) noVerifyHint.textContent = texts.noVerifyHint;
            document.getElementById('loginPinCancel').textContent = texts.cancelLogin;
            document.getElementById('loginPinConfirm').textContent = texts.verifyLogin;
        }
        
        // 更新安全验证模态框
        var securityVerifyModal = document.getElementById('securityVerifyModal');
        if (securityVerifyModal) {
            var securityVerifyTitle = securityVerifyModal.querySelector('h3');
            if (securityVerifyTitle) securityVerifyTitle.textContent = texts.securityVerify;
            var securityVerifyDesc = securityVerifyModal.querySelector('.header-desc');
            if (securityVerifyDesc) securityVerifyDesc.textContent = texts.securityVerifyDesc;
            var securityVerifyInput = document.getElementById('securityVerifyPassword');
            if (securityVerifyInput) securityVerifyInput.placeholder = texts.enterPassword;
            var securityVerifyError = document.getElementById('securityVerifyError');
            if (securityVerifyError) securityVerifyError.textContent = texts.passwordError;
            var usePinBtn = document.getElementById('usePinForVerification');
            if (usePinBtn) usePinBtn.innerHTML = '<i class="fas fa-shield-halved"></i><span>' + texts.usePinForVerification + '</span>';
            var noVerifyLabel2 = securityVerifyModal.querySelector('label[for="noVerifyToday"]');
            if (noVerifyLabel2) noVerifyLabel2.textContent = texts.noVerifyToday;
            var noVerifyHint2 = securityVerifyModal.querySelectorAll('.no-verify-hint')[1];
            if (noVerifyHint2) noVerifyHint2.textContent = texts.noVerifyHint;
            document.getElementById('securityVerifyCancel').textContent = texts.cancel;
            document.getElementById('securityVerifyConfirm').textContent = texts.verify;
        }
        
        // 更新主题更新模态框
        var themeUpdateModal = document.getElementById('themeUpdateModal');
        if (themeUpdateModal) {
            var themeUpdateTitle = themeUpdateModal.querySelector('h3');
            if (themeUpdateTitle) themeUpdateTitle.textContent = texts.themeUpdate;
            var themeUpdateMessage = themeUpdateModal.querySelector('p');
            if (themeUpdateMessage) themeUpdateMessage.textContent = texts.themeUpdateMessage;
            var themeCountdownBtn = document.getElementById('themeCountdownBtn');
            if (themeCountdownBtn) {
                var countdownSpan = themeCountdownBtn.querySelector('span');
                if (countdownSpan) {
                    var currentCount = countdownSpan.textContent.trim();
                    themeCountdownBtn.innerHTML = texts.remainingSeconds + ' <span id="themeCountdown">' + currentCount + '</span> ' + texts.seconds;
                }
            }
        }
        
        // 更新UI比例调整模态框
        var uiScaleModal = document.getElementById('uiScaleModal');
        if (uiScaleModal) {
            var uiScaleTitle = uiScaleModal.querySelector('h3');
            if (uiScaleTitle) uiScaleTitle.textContent = texts.adjustUiScale;
            document.getElementById('scaleResetBtn').textContent = texts.scaleReset;
            document.getElementById('uiScaleClose').textContent = texts.confirm;
        }
        
        // 更新登出确认模态框 - 修正标题
        if (logoutConfirmModal) {
            if (logoutConfirmTitle) logoutConfirmTitle.textContent = texts.confirmAction;
        }
        
        // 更新离线模式确认模态框
        var offlineModeConfirmModal = document.getElementById('offlineModeConfirmModal');
        if (offlineModeConfirmModal) {
            var offlineModeTitle = offlineModeConfirmModal.querySelector('h3');
            if (offlineModeTitle) offlineModeTitle.textContent = texts.confirmAction;
            var offlineModeMessage = offlineModeConfirmModal.querySelector('p');
            if (offlineModeMessage) offlineModeMessage.textContent = texts.offlineModeConfirm;
            document.getElementById('offlineModeCancel').textContent = texts.cancel;
            document.getElementById('offlineModeConfirm').textContent = texts.confirm;
        }
        
        // 更新在线模式确认模态框
        var onlineModeConfirmModal = document.getElementById('onlineModeConfirmModal');
        if (onlineModeConfirmModal) {
            var onlineModeTitle = onlineModeConfirmModal.querySelector('h3');
            if (onlineModeTitle) onlineModeTitle.textContent = texts.confirmAction;
            var onlineModeMessage = onlineModeConfirmModal.querySelector('p');
            if (onlineModeMessage) onlineModeMessage.textContent = texts.onlineModeConfirm;
            document.getElementById('onlineModeCancel').textContent = texts.cancel;
            document.getElementById('onlineModeConfirm').textContent = texts.confirm;
        }
        
        // 更新无网络模态框
        var noNetworkModal = document.getElementById('noNetworkModal');
        if (noNetworkModal) {
            var noNetworkTitle = noNetworkModal.querySelector('h3');
            if (noNetworkTitle) noNetworkTitle.textContent = texts.noNetwork;
            var noNetworkTexts = noNetworkModal.querySelectorAll('p');
            if (noNetworkTexts[0]) noNetworkTexts[0].textContent = texts.noNetworkMessage;
            if (noNetworkTexts[1]) noNetworkTexts[1].textContent = texts.noNetworkQuestion;
            document.getElementById('noNetworkCancel').textContent = texts.cancel;
            document.getElementById('noNetworkEnterOffline').textContent = texts.enterOfflineMode;
        }
        
        // 更新网络恢复模态框
        var networkRestoredModal = document.getElementById('networkRestoredModal');
        if (networkRestoredModal) {
            var networkRestoredTitle = networkRestoredModal.querySelector('h3');
            if (networkRestoredTitle) networkRestoredTitle.textContent = texts.networkRestored;
            var networkRestoredMessage = networkRestoredModal.querySelector('p');
            if (networkRestoredMessage) networkRestoredMessage.textContent = texts.networkRestoredMessage;
            document.getElementById('networkRestoredCancel').textContent = texts.cancel;
            document.getElementById('networkRestoredConfirm').textContent = texts.confirm;
        }
        
        // 更新未登录模态框标题
        if (notLoggedInModal) {
            if (notLoggedInTitle) notLoggedInTitle.textContent = texts.prompt;
        }
        
        // 更新更多操作模态框
        var moreActionsModal = document.getElementById('moreActionsModal');
        if (moreActionsModal) {
            var moreActionsTitle = moreActionsModal.querySelector('h3');
            if (moreActionsTitle) moreActionsTitle.textContent = texts.moreActions;
            var moreActionsButtons = moreActionsModal.querySelectorAll('.more-action-btn span');
            if (moreActionsButtons[0]) moreActionsButtons[0].textContent = texts.enterAccountSettings;
            if (moreActionsButtons[1]) moreActionsButtons[1].textContent = texts.card;
            if (moreActionsButtons[2]) moreActionsButtons[2].textContent = texts.logout;
            document.getElementById('moreActionsClose').textContent = texts.close;
        }
        
        // 更新更多功能模态框
        var moreFeaturesModal = document.getElementById('moreFeaturesModal');
        if (moreFeaturesModal) {
            var moreFeaturesTitle = moreFeaturesModal.querySelector('h2');
            if (moreFeaturesTitle) moreFeaturesTitle.textContent = texts.moreFeatures;
            var moreFeaturesButtons = moreFeaturesModal.querySelectorAll('.more-feature-card .feature-card-title');
            if (moreFeaturesButtons[0]) moreFeaturesButtons[0].textContent = texts.aboutLauncher;
            if (moreFeaturesButtons[1]) moreFeaturesButtons[1].textContent = texts.hideUI;
            if (moreFeaturesButtons[2]) moreFeaturesButtons[2].textContent = texts.adjustUiScaleSimple;
        }
        
        // 更新全局设置模态框中的服务器选项
        var serverSelect = document.getElementById('serverSelect');
        if (serverSelect) {
            var officialOption = serverSelect.querySelector('option[value="official"]');
            if (officialOption) officialOption.textContent = texts.defaultServer;
        }
        
        // 更新版本更新历史侧边栏
        var termsNavTitle = document.querySelector('.terms-nav-title');
        if (termsNavTitle) termsNavTitle.textContent = texts.listNav;
        
        var featureUpdatesNav = document.querySelector('#featureUpdateNav .nav-item-content span');
        if (featureUpdatesNav) featureUpdatesNav.innerHTML = texts.featureUpdates + '<ul>Feature Updates</ul>';
        
        var outdatedVersionsNav = document.querySelector('#earlyUpdateNav .nav-item-content span');
        if (outdatedVersionsNav) outdatedVersionsNav.innerHTML = texts.outdatedVersions + '<ul>Outdated Versions</ul>';
        
        var miniGameUpdatesNav = document.querySelector('#miniGameUpdateNav .nav-item-content span');
        if (miniGameUpdatesNav) miniGameUpdatesNav.innerHTML = texts.miniGameUpdates + '<ul>Mini Game Updates</ul>';
        
        // 更新查看中标签
        var viewingTags = document.querySelectorAll('.viewing-tag');
        viewingTags.forEach(function(tag) {
            tag.textContent = texts.viewing;
        });
        
        // 更新功能更新子按钮
        var featureSubButtons = document.querySelectorAll('#featureSubButtons .sub-button .button-text');
        if (featureSubButtons[0]) featureSubButtons[0].textContent = texts.launcherUpdate;
        if (featureSubButtons[1]) featureSubButtons[1].textContent = texts.homepageUpdate;
        
        // 更新过时版本子按钮
        var outdatedSubButtons = document.querySelectorAll('#outdatedSubButtons .sub-button .button-text');
        if (outdatedSubButtons[0]) outdatedSubButtons[0].textContent = texts.launcherRecord;
        if (outdatedSubButtons[1]) outdatedSubButtons[1].textContent = texts.homepageRecord;
        
        // 更新小游戏更新子按钮
        var miniGameSubButtons = document.querySelectorAll('#miniGameSubButtons .sub-button .button-text');
        if (miniGameSubButtons[0]) miniGameSubButtons[0].textContent = texts.snake;
        if (miniGameSubButtons[1]) miniGameSubButtons[1].textContent = texts.colormatch;
        if (miniGameSubButtons[2]) miniGameSubButtons[2].textContent = texts.memory;
        if (miniGameSubButtons[3]) miniGameSubButtons[3].textContent = texts.wzq;
        if (miniGameSubButtons[4]) miniGameSubButtons[4].textContent = texts.fxq;
        if (miniGameSubButtons[5]) miniGameSubButtons[5].textContent = texts.fkgame;
        
        // 更新用户信息提示标签
        var tooltipLabels = document.querySelectorAll('.tooltip-label');
        if (tooltipLabels[0]) tooltipLabels[0].textContent = texts.tooltipUsername;
        if (tooltipLabels[1]) tooltipLabels[1].textContent = texts.tooltipUserId;
        if (tooltipLabels[2]) tooltipLabels[2].textContent = texts.tooltipRegTime;
        
        // 更新更多操作提示
        var moreActionsTooltip = document.querySelector('.more-actions-tooltip span');
        if (moreActionsTooltip) moreActionsTooltip.textContent = texts.moreActions;
        
        // 更新快速登录模式标签
        var quickLoginTag = document.getElementById('quickLoginTag');
        if (quickLoginTag) quickLoginTag.textContent = texts.quickLoginMode;
        
        // 更新离线模式标签
        var offlineModeTag = document.querySelector('#loginOfflineModeTag span');
        if (offlineModeTag) offlineModeTag.textContent = texts.offlineMode;
        
        var offlineModeText = document.getElementById('offlineModeText');
        if (offlineModeText) offlineModeText.textContent = texts.offlineMode;
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