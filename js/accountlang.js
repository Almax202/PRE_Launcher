const AccountLangManager = (function() {
    const langMap = {
        'zh': {
            // 页面标题和描述
            pageTitle: '系统设置',
            accountInfo: '账户信息',
            accountInfoDesc: '管理您的账户基本信息',
            
            // 侧边栏菜单
            sidebar: {
                account: '账户信息',
                security: '安全设置',
                privacy: '隐私设置',
                gameStats: '统计数据',
                achievements: '成就系统',
                notifications: '通知设置',
                devices: '设备管理',
                advanced: '主题设置',
                accountManagement: '账户管理',
                terms: '用户协议',
                privacyPolicy: '隐私政策',
                test: '测试页面'
            },
            
            // 菜单组标题
            menuGroups: {
                accountSystem: '账户系统',
                statistics: '统计数据',
                advancedManagement: '高级管理',
                coreTerms: '核心条款',
                devTesting: '开发测试'
            },
            
            // 基本信息
            basicInfo: '基本信息',
            basicInfoDesc: '更新您的基本账户信息',
            username: '用户名',
            userId: '用户ID',
            regTime: '注册时间',
            
            // 个人资料
            profile: '个人资料',
            profileDesc: '设置您的个人资料信息',
            bio: '个性签名',
            bioPlaceholder: '写点什么...',
            saveBio: '保存个性签名',
            
            // 头像设置
            avatar: '头像设置',
            avatarDesc: '设置您的个人头像',
            uploadAvatar: '上传自定义头像',
            saveAvatar: '保存头像设置',
            avatarHint: '支持 JPG、PNG 格式，最大 2MB',
            
            // 联系方式
            contact: '联系方式',
            contactDesc: '管理您的联系信息',
            email: '邮箱地址',
            emailPlaceholder: '未绑定',
            bind: '绑定',
            unbind: '解绑',
            phone: '手机号码',
            phonePlaceholder: '未绑定',
            verified: '已验证',
            
            // 密码管理
            password: '密码管理',
            passwordDesc: '保护您的账户安全',
            currentPassword: '当前密码',
            currentPasswordPlaceholder: '请输入当前密码',
            verifyPassword: '验证密码',
            
            // 两步验证
            twoFactor: '两步验证',
            twoFactorDesc: '增强您的账户安全性',
            enableTwoFactor: '启用两步验证',
            twoFactorHint: '登录时需要额外的验证码',
            changePin: '更改PIN码',
            updateSecurity: '更新安全问题',
            
            // 资料可见性
            visibility: '资料可见性',
            visibilityDesc: '控制谁可以看到您的信息',
            publicProfile: '公开个人资料',
            publicProfileHint: '所有用户都可以查看您的资料',
            showOnline: '显示在线状态',
            showOnlineHint: '其他用户可以看到您是否在线',
            allowFriends: '允许好友请求',
            allowFriendsHint: '其他用户可以向您发送好友请求',
            
            // 消息隐私
            messagePrivacy: '消息隐私',
            messagePrivacyDesc: '管理消息接收设置',
            strangerMessages: '接收陌生人消息',
            strangerMessagesHint: '非好友用户可以向您发送消息',
            readReceipts: '显示已读回执',
            readReceiptsHint: '发送者可以看到您是否已读消息',
            
            // 游戏统计
            gameStats: '游戏统计',
            gameStatsDesc: '查看您的游戏数据',
            totalPlayTime: '总游戏时长',
            totalGames: '游戏次数',
            totalWins: '获胜次数',
            totalScore: '总积分',
            
            // 签到统计
            checkin: '签到统计',
            checkinDesc: '查看您的签到数据',
            totalCheckin: '签到总天数',
            checkinPoints: '签到积分',
            consecutive: '连续签到',
            monthCheckin: '本月签到',
            
            // 成就系统
            achievements: '成就系统',
            achievementsDesc: '查看您的游戏成就',
            allAchievements: '全部成就',
            selecting: '选择中',
            
            // 通知设置
            notifications: '通知设置',
            notificationsDesc: '管理您接收的通知类型',
            system: '系统通知',
            systemHint: '接收系统重要通知和更新',
            game: '游戏通知',
            gameHint: '接收游戏相关通知和活动',
            activity: '活动通知',
            activityHint: '接收活动和促销信息',
            marketing: '营销通知',
            marketingHint: '接收产品推广和优惠信息',
            
            // 声音设置
            sound: '声音设置',
            soundDesc: '控制通知声音和音效',
            notificationVolume: '通知音量',
            messageVolume: '消息音效',
            saveSound: '保存声音设置',
            
            // 已登录设备
            devices: '已登录设备',
            devicesDesc: '管理您已登录的设备',
            currentDevice: '当前设备',
            
            // 登录历史
            loginHistory: '登录历史',
            loginHistoryDesc: '查看最近的登录记录',
            
            // 主题设置
            theme: '个性化',
            themeDesc: '自定义界面外观',
            light: '明亮主题',
            dark: '暗色主题',
            custom: '自定义主题',
            glass: '毛玻璃主题',
            gpuAcceleration: '启用硬件GPU加速',
            gpuAccelerationHint: '启用后将使用GPU进行页面渲染，提升性能',
            
            // 自定义主题
            colorSettings: '颜色设置',
            rgbMode: 'RGB模式',
            paletteMode: '调色盘',
            red: '红色 (R)',
            green: '绿色 (G)',
            blue: '蓝色 (B)',
            customColor: '自定义颜色',
            interface: '界面设置',
            opacity: '透明度',
            contrast: '对比度',
            preview: '预览',
            applyTheme: '应用主题',
            reset: '重置',
            
            // 毛玻璃主题
            glassEffect: '毛玻璃效果设置',
            blur: '模糊程度',
            
            // 自定义背景
            background: '自定义背景',
            backgroundDesc: '设置自定义界面背景图片',
            uploadBackground: '选择图片',
            backgroundHint: '支持 JPG、PNG 格式，最大 100MB',
            backgroundFit: '自适应方式',
            backgroundFitOptions: {
                cover: '拉伸覆盖',
                contain: '等比缩放',
                fill: '拉伸填充',
                repeat: '平铺',
                center: '居中',
                content: '内容区域适配'
            },
            applyBackground: '应用背景',
            resetBackground: '重置背景',
            
            // 语言设置
            language: '语言设置',
            languageDesc: '选择界面语言',
            interfaceLanguage: '界面语言',
            
            // 数据管理
            data: '数据管理',
            dataDesc: '管理您的账户数据',
            export: '导出数据',
            exportHint: '下载您的账户数据副本',
            import: '导入数据',
            importHint: '从之前导出的数据文件恢复',
            clearCache: '清除缓存',
            clearCacheHint: '清除本地缓存数据',
            
            // 危险区域
            danger: '危险区域',
            dangerDesc: '请谨慎操作，除非您知道自己在做什么，否则请勿执行下列的任何操作',
            deleteAccount: '注销账户',
            deleteAccountHint: '永久删除您的账户和所有数据',
            logout: '退出登录',
            logoutHint: '退出当前账户',
            resetSettings: '重置所有设置',
            resetSettingsHint: '将所有设置恢复到默认状态',
            devMode: '开发者模式',
            devModeHint: '进入开发者模式以使用高级功能',
            exitDevMode: '退出开发者模式',
            exitDevModeHint: '退出开发者模式将禁用高级功能',
            
            // 用户协议
            terms: '用户协议',
            termsDesc: '请仔细阅读并同意以下条款',
            termsTitle: 'GPY Games Studio 用户协议',
            termsIntro: '用户协议概述',
            termsDefinition: '定义与解释',
            termsService: '服务许可与使用范围',
            termsAccount: '用户账号管理',
            termsPrivacy: '个人信息保护',
            termsProperty: '虚拟财产相关约定',
            termsRights: '双方权利与义务',
            termsDisclaimer: '免责条款',
            
            // 隐私政策
            privacyPolicy: '隐私政策',
            privacyPolicyDesc: '我们如何保护您的个人信息',
            
            // 按钮文本
            save: '保存',
            cancel: '取消',
            confirm: '确认',
            edit: '编辑',
            copy: '复制',
            upload: '上传',
            
            // 提示信息
            saved: '已保存',
            copied: '已复制到剪贴板',
            error: '错误',
            success: '成功',
            
            // 测试页面
            testPage: '测试页面',
            testPageDesc: '用于测试主题适配性、按钮风格统一度以及各种测试案例',
            
            // 版权信息
            copyright: '© 2014-2026 GPY Games Studio'
        },
        'en': {
            // 页面标题和描述
            pageTitle: 'Account Settings',
            accountInfo: 'Account Info',
            accountInfoDesc: 'Manage your basic account information',
            
            // 侧边栏菜单
            sidebar: {
                account: 'Account Info',
                security: 'Security Settings',
                privacy: 'Privacy Settings',
                gameStats: 'Statistics',
                achievements: 'Achievements',
                notifications: 'Notification Settings',
                devices: 'Device Management',
                advanced: 'Theme Settings',
                accountManagement: 'Account Management',
                terms: 'User Agreement',
                privacyPolicy: 'Privacy Policy',
                test: 'Test Page'
            },
            
            // 菜单组标题
            menuGroups: {
                accountSystem: 'Account System',
                statistics: 'Statistics',
                advancedManagement: 'Advanced Management',
                coreTerms: 'Core Terms',
                devTesting: 'Dev Testing'
            },
            
            // 基本信息
            basicInfo: 'Basic Info',
            basicInfoDesc: 'Update your basic account information',
            username: 'Username',
            userId: 'User ID',
            regTime: 'Registration Time',
            
            // 个人资料
            profile: 'Profile',
            profileDesc: 'Set your profile information',
            bio: 'Bio',
            bioPlaceholder: 'Write something...',
            saveBio: 'Save Bio',
            
            // 头像设置
            avatar: 'Avatar Settings',
            avatarDesc: 'Set your personal avatar',
            uploadAvatar: 'Upload Custom Avatar',
            saveAvatar: 'Save Avatar Settings',
            avatarHint: 'Supports JPG, PNG formats, maximum 2MB',
            
            // 联系方式
            contact: 'Contact',
            contactDesc: 'Manage your contact information',
            email: 'Email Address',
            emailPlaceholder: 'Not bound',
            bind: 'Bind',
            unbind: 'Unbind',
            phone: 'Phone Number',
            phonePlaceholder: 'Not bound',
            verified: 'Verified',
            
            // 密码管理
            password: 'Password Management',
            passwordDesc: 'Protect your account security',
            currentPassword: 'Current Password',
            currentPasswordPlaceholder: 'Please enter current password',
            verifyPassword: 'Verify Password',
            
            // 两步验证
            twoFactor: 'Two-Factor Authentication',
            twoFactorDesc: 'Enhance your account security',
            enableTwoFactor: 'Enable Two-Factor Authentication',
            twoFactorHint: 'Additional verification code required for login',
            changePin: 'Change PIN',
            updateSecurity: 'Update Security Questions',
            
            // 资料可见性
            visibility: 'Profile Visibility',
            visibilityDesc: 'Control who can see your information',
            publicProfile: 'Public Profile',
            publicProfileHint: 'All users can view your profile',
            showOnline: 'Show Online Status',
            showOnlineHint: 'Other users can see if you are online',
            allowFriends: 'Allow Friend Requests',
            allowFriendsHint: 'Other users can send you friend requests',
            
            // 消息隐私
            messagePrivacy: 'Message Privacy',
            messagePrivacyDesc: 'Manage message receiving settings',
            strangerMessages: 'Receive Messages from Strangers',
            strangerMessagesHint: 'Non-friend users can send you messages',
            readReceipts: 'Show Read Receipts',
            readReceiptsHint: 'Senders can see if you have read messages',
            
            // 游戏统计
            gameStats: 'Game Statistics',
            gameStatsDesc: 'View your game data',
            totalPlayTime: 'Total Play Time',
            totalGames: 'Game Count',
            totalWins: 'Win Count',
            totalScore: 'Total Score',
            
            // 签到统计
            checkin: 'Check-in Statistics',
            checkinDesc: 'View your check-in data',
            totalCheckin: 'Total Check-in Days',
            checkinPoints: 'Check-in Points',
            consecutive: 'Consecutive Check-ins',
            monthCheckin: 'Monthly Check-ins',
            
            // 成就系统
            achievements: 'Achievement System',
            achievementsDesc: 'View your game achievements',
            allAchievements: 'All Achievements',
            selecting: 'Selecting',
            
            // 通知设置
            notifications: 'Notification Settings',
            notificationsDesc: 'Manage the types of notifications you receive',
            system: 'System Notifications',
            systemHint: 'Receive important system notifications and updates',
            game: 'Game Notifications',
            gameHint: 'Receive game-related notifications and events',
            activity: 'Activity Notifications',
            activityHint: 'Receive activity and promotion information',
            marketing: 'Marketing Notifications',
            marketingHint: 'Receive product promotions and offers',
            
            // 声音设置
            sound: 'Sound Settings',
            soundDesc: 'Control notification sounds and effects',
            notificationVolume: 'Notification Volume',
            messageVolume: 'Message Sound',
            saveSound: 'Save Sound Settings',
            
            // 已登录设备
            devices: 'LoggedIn Devices',
            devicesDesc: 'Manage your logged-in devices',
            currentDevice: 'Current Device',
            
            // 登录历史
            loginHistory: 'Login History',
            loginHistoryDesc: 'View recent login records',
            
            // 主题设置
            theme: 'Theme Settings',
            themeDesc: 'Customize interface appearance',
            light: 'Light Theme',
            dark: 'Dark Theme',
            custom: 'Custom Theme',
            glass: 'Glass Theme',
            gpuAcceleration: 'Enable Hardware GPU Acceleration',
            gpuAccelerationHint: 'Enabling will use GPU for page rendering to improve performance',
            
            // 自定义主题
            colorSettings: 'Color Settings',
            rgbMode: 'RGB Mode',
            paletteMode: 'Palette',
            red: 'Red (R)',
            green: 'Green (G)',
            blue: 'Blue (B)',
            customColor: 'Custom Color',
            interface: 'Interface Settings',
            opacity: 'Opacity',
            contrast: 'Contrast',
            preview: 'Preview',
            applyTheme: 'Apply Theme',
            reset: 'Reset',
            
            // 毛玻璃主题
            glassEffect: 'Glass Effect Settings',
            blur: 'Blur Level',
            
            // 自定义背景
            background: 'Custom Background',
            backgroundDesc: 'Set custom interface background image',
            uploadBackground: 'Select Image',
            backgroundHint: 'Supports JPG, PNG formats, maximum 100MB',
            backgroundFit: 'Fit Mode',
            backgroundFitOptions: {
                cover: 'Cover',
                contain: 'Contain',
                fill: 'Fill',
                repeat: 'Repeat',
                center: 'Center',
                content: 'Content Fit'
            },
            applyBackground: 'Apply Background',
            resetBackground: 'Reset Background',
            
            // 语言设置
            language: 'Language Settings',
            languageDesc: 'Select interface language',
            interfaceLanguage: 'Interface Language',
            
            // 数据管理
            data: 'Data Management',
            dataDesc: 'Manage your account data',
            export: 'Export Data',
            exportHint: 'Download a copy of your account data',
            import: 'Import Data',
            importHint: 'Restore from previously exported data file',
            clearCache: 'Clear Cache',
            clearCacheHint: 'Clear local cache data',
            
            // 危险区域
            danger: 'Danger Zone',
            dangerDesc: 'Please operate with caution, do not perform any of the following operations unless you know what you are doing',
            deleteAccount: 'Delete Account',
            deleteAccountHint: 'Permanently delete your account and all data',
            logout: 'Logout',
            logoutHint: 'Logout of current account',
            resetSettings: 'Reset All Settings',
            resetSettingsHint: 'Restore all settings to default state',
            devMode: 'Developer Mode',
            devModeHint: 'Enter developer mode to use advanced features',
            exitDevMode: 'Exit Developer Mode',
            exitDevModeHint: 'Exiting developer mode will disable advanced features',
            
            // 用户协议
            terms: 'User Agreement',
            termsDesc: 'Please read and agree to the following terms',
            termsTitle: 'GPY Games Studio User Agreement',
            termsIntro: 'User Agreement Overview',
            termsDefinition: 'Definitions and Interpretations',
            termsService: 'Service License and Scope of Use',
            termsAccount: 'User Account Management',
            termsPrivacy: 'Personal Information Protection',
            termsProperty: 'Virtual Property Related Agreements',
            termsRights: 'Rights and Obligations of Both Parties',
            termsDisclaimer: 'Disclaimer',
            
            // 隐私政策
            privacyPolicy: 'Privacy Policy',
            privacyPolicyDesc: 'How we protect your personal information',
            
            // 按钮文本
            save: 'Save',
            cancel: 'Cancel',
            confirm: 'Confirm',
            edit: 'Edit',
            copy: 'Copy',
            upload: 'Upload',
            
            // 提示信息
            saved: 'Saved',
            copied: 'Copied to clipboard',
            error: 'Error',
            success: 'Success',
            
            // 测试页面
            testPage: 'Test Page',
            testPageDesc: 'Used to test theme compatibility, button style consistency, and various test cases',
            
            // 版权信息
            copyright: '© 2014-2026 GPY Games Studio'
        },
        'ja': {
            // 页面标题和描述
            pageTitle: 'アカウント設定',
            accountInfo: 'アカウント情報',
            accountInfoDesc: 'アカウントの基本情報を管理します',
            
            // 侧边栏菜单
            sidebar: {
                account: 'アカウント情報',
                security: 'セキュリティ設定',
                privacy: 'プライバシー設定',
                gameStats: '統計データ',
                achievements: 'アチーブメント',
                notifications: '通知設定',
                devices: 'デバイス管理',
                advanced: 'テーマ設定',
                accountManagement: 'アカウント管理',
                terms: '利用規約',
                privacyPolicy: 'プライバシーポリシー',
                test: 'テストページ'
            },
            
            // 菜单组标题
            menuGroups: {
                accountSystem: 'アカウントシステム',
                statistics: '統計データ',
                advancedManagement: '高度な管理',
                coreTerms: 'コア規約',
                devTesting: '開発テスト'
            },
            
            // 基本信息
            basicInfo: '基本情報',
            basicInfoDesc: 'アカウントの基本情報を更新します',
            username: 'ユーザー名',
            userId: 'ユーザーID',
            regTime: '登録時間',
            
            // 个人资料
            profile: 'プロフィール',
            profileDesc: 'プロフィール情報を設定します',
            bio: '自己紹介',
            bioPlaceholder: '何か書いてください...',
            saveBio: '自己紹介を保存',
            
            // 头像设置
            avatar: 'アバター設定',
            avatarDesc: 'プロフィールアバターを設定します',
            uploadAvatar: 'カスタムアバターをアップロード',
            saveAvatar: 'アバター設定を保存',
            avatarHint: 'JPG、PNG形式に対応、最大2MB',
            
            // 联系方式
            contact: '連絡先',
            contactDesc: '連絡先情報を管理します',
            email: 'メールアドレス',
            emailPlaceholder: '未登録',
            bind: '登録',
            unbind: '解除',
            phone: '電話番号',
            phonePlaceholder: '未登録',
            verified: '確認済み',
            
            // 密码管理
            password: 'パスワード管理',
            passwordDesc: 'アカウントのセキュリティを保護します',
            currentPassword: '現在のパスワード',
            currentPasswordPlaceholder: '現在のパスワードを入力してください',
            verifyPassword: 'パスワードを確認',
            
            // 两步验证
            twoFactor: '二要素認証',
            twoFactorDesc: 'アカウントのセキュリティを強化します',
            enableTwoFactor: '二要素認証を有効にする',
            twoFactorHint: 'ログインには追加の認証コードが必要です',
            changePin: 'PINを変更',
            updateSecurity: 'セキュリティ質問を更新',
            
            // 资料可见性
            visibility: 'プロフィールの表示設定',
            visibilityDesc: '誰があなたの情報を見ることができるかを制御します',
            publicProfile: '公開プロフィール',
            publicProfileHint: 'すべてのユーザーがあなたのプロフィールを表示できます',
            showOnline: 'オンライン状態を表示',
            showOnlineHint: '他のユーザーはあなたがオンラインかどうかを確認できます',
            allowFriends: 'フレンドリクエストを許可',
            allowFriendsHint: '他のユーザーはあなたにフレンドリクエストを送信できます',
            
            // 消息隐私
            messagePrivacy: 'メッセージのプライバシー',
            messagePrivacyDesc: 'メッセージ受信設定を管理します',
            strangerMessages: '見知らぬ人からのメッセージを受信',
            strangerMessagesHint: 'フレンドでないユーザーはあなたにメッセージを送信できます',
            readReceipts: '既読確認を表示',
            readReceiptsHint: '送信者はあなたがメッセージを読んだかどうかを確認できます',
            
            // 游戏统计
            gameStats: 'ゲーム統計',
            gameStatsDesc: 'ゲームデータを表示します',
            totalPlayTime: '総プレイ時間',
            totalGames: 'ゲーム回数',
            totalWins: '勝利回数',
            totalScore: '総スコア',
            
            // 签到统计
            checkin: 'チェックイン統計',
            checkinDesc: 'チェックインデータを表示します',
            totalCheckin: '総チェックイン日数',
            checkinPoints: 'チェックインポイント',
            consecutive: '連続チェックイン',
            monthCheckin: '今月のチェックイン',
            
            // 成就系统
            achievements: 'アチーブメントシステム',
            achievementsDesc: 'ゲームのアチーブメントを表示します',
            allAchievements: 'すべてのアチーブメント',
            selecting: '選択中',
            
            // 通知设置
            notifications: '通知設定',
            notificationsDesc: '受信する通知の種類を管理します',
            system: 'システム通知',
            systemHint: '重要なシステム通知と更新を受信します',
            game: 'ゲーム通知',
            gameHint: 'ゲーム関連の通知とイベントを受信します',
            activity: 'アクティビティ通知',
            activityHint: 'アクティビティとプロモーション情報を受信します',
            marketing: 'マーケティング通知',
            marketingHint: '製品のプロモーションとオファーを受信します',
            
            // 声音设置
            sound: 'サウンド設定',
            soundDesc: '通知音と効果音を制御します',
            notificationVolume: '通知音量',
            messageVolume: 'メッセージ音',
            saveSound: 'サウンド設定を保存',
            
            // 已登录设备
            devices: 'ログイン済みデバイス',
            devicesDesc: 'ログイン済みのデバイスを管理します',
            currentDevice: '現在のデバイス',
            
            // 登录历史
            loginHistory: 'ログイン履歴',
            loginHistoryDesc: '最近のログイン記録を表示します',
            
            // 主题设置
            theme: 'テーマ設定',
            themeDesc: 'インターフェイスの外観をカスタマイズします',
            light: 'ライトテーマ',
            dark: 'ダークテーマ',
            custom: 'カスタムテーマ',
            glass: 'ガラステーマ',
            gpuAcceleration: 'ハードウェアGPUアクセラレーションを有効にする',
            gpuAccelerationHint: '有効にすると、ページレンダリングにGPUを使用してパフォーマンスが向上します',
            
            // 自定义主题
            colorSettings: 'カラー設定',
            rgbMode: 'RGBモード',
            paletteMode: 'パレット',
            red: '赤 (R)',
            green: '緑 (G)',
            blue: '青 (B)',
            customColor: 'カスタムカラー',
            interface: 'インターフェイス設定',
            opacity: '不透明度',
            contrast: 'コントラスト',
            preview: 'プレビュー',
            applyTheme: 'テーマを適用',
            reset: 'リセット',
            
            // 毛玻璃主题
            glassEffect: 'ガラス効果設定',
            blur: 'ブラーレベル',
            
            // 自定义背景
            background: 'カスタム背景',
            backgroundDesc: 'カスタムインターフェイス背景画像を設定します',
            uploadBackground: '画像を選択',
            backgroundHint: 'JPG、PNG形式に対応、最大100MB',
            backgroundFit: 'フィットモード',
            backgroundFitOptions: {
                cover: 'カバー',
                contain: 'コンテイン',
                fill: 'フィル',
                repeat: 'リピート',
                center: 'センター',
                content: 'コンテンツフィット'
            },
            applyBackground: '背景を適用',
            resetBackground: '背景をリセット',
            
            // 语言设置
            language: '言語設定',
            languageDesc: 'インターフェイス言語を選択',
            interfaceLanguage: 'インターフェイス言語',
            
            // 数据管理
            data: 'データ管理',
            dataDesc: 'アカウントデータを管理します',
            export: 'データをエクスポート',
            exportHint: 'アカウントデータのコピーをダウンロード',
            import: 'データをインポート',
            importHint: '以前にエクスポートしたデータファイルから復元',
            clearCache: 'キャッシュをクリア',
            clearCacheHint: 'ローカルキャッシュデータをクリア',
            
            // 危险区域
            danger: '危険ゾーン',
            dangerDesc: '注意して操作してください。何をしているかわからない限り、以下の操作を実行しないでください',
            deleteAccount: 'アカウントを削除',
            deleteAccountHint: 'アカウントとすべてのデータを永久に削除',
            logout: 'ログアウト',
            logoutHint: '現在のアカウントからログアウト',
            resetSettings: 'すべての設定をリセット',
            resetSettingsHint: 'すべての設定をデフォルト状態に戻す',
            devMode: '開発者モード',
            devModeHint: '高度な機能を使用するには開発者モードに入ります',
            exitDevMode: '開発者モードを終了',
            exitDevModeHint: '開発者モードを終了すると高度な機能が無効になります',
            
            // 用户协议
            terms: '利用規約',
            termsDesc: '以下の条項をよく読んで同意してください',
            termsTitle: 'GPY Games Studio 利用規約',
            termsIntro: '利用規約の概要',
            termsDefinition: '定義と解釈',
            termsService: 'サービスライセンスと使用範囲',
            termsAccount: 'ユーザーアカウント管理',
            termsPrivacy: '個人情報の保護',
            termsProperty: '仮想財産に関する合意',
            termsRights: '両当事者の権利と義務',
            termsDisclaimer: '免責事項',
            
            // 隐私政策
            privacyPolicy: 'プライバシーポリシー',
            privacyPolicyDesc: 'お客様の個人情報をどのように保護するか',
            
            // 按钮文本
            save: '保存',
            cancel: 'キャンセル',
            confirm: '確認',
            edit: '編集',
            copy: 'コピー',
            upload: 'アップロード',
            
            // 提示信息
            saved: '保存されました',
            copied: 'クリップボードにコピーされました',
            error: 'エラー',
            success: '成功',
            
            // 测试页面
            testPage: 'テストページ',
            testPageDesc: 'テーマの互換性、ボタンスタイルの一貫性、およびさまざまなテストケースをテストするために使用されます',
            
            // 版权信息
            copyright: '© 2014-2026 GPY Games Studio'
        },
        'ko': {
            // 页面标题和描述
            pageTitle: '계정 설정',
            accountInfo: '계정 정보',
            accountInfoDesc: '기본 계정 정보를 관리합니다',
            
            // 侧边栏菜单
            sidebar: {
                account: '계정 정보',
                security: '보안 설정',
                privacy: '개인정보 설정',
                gameStats: '통계 데이터',
                achievements: '업적 시스템',
                notifications: '알림 설정',
                devices: '기기 관리',
                advanced: '테마 설정',
                accountManagement: '계정 관리',
                terms: '이용 약관',
                privacyPolicy: '개인정보 정책',
                test: '테스트 페이지'
            },
            
            // 菜单组标题
            menuGroups: {
                accountSystem: '계정 시스템',
                statistics: '통계 데이터',
                advancedManagement: '고급 관리',
                coreTerms: '핵심 약관',
                devTesting: '개발 테스트'
            },
            
            // 基本信息
            basicInfo: '기본 정보',
            basicInfoDesc: '기본 계정 정보를 업데이트합니다',
            username: '사용자 이름',
            userId: '사용자 ID',
            regTime: '가입 시간',
            
            // 个人资料
            profile: '프로필',
            profileDesc: '프로필 정보를 설정합니다',
            bio: '자기 소개',
            bioPlaceholder: '뭔가 쓰세요...',
            saveBio: '자기 소개 저장',
            
            // 头像设置
            avatar: '아바타 설정',
            avatarDesc: '개인 아바타를 설정합니다',
            uploadAvatar: '커스텀 아바타 업로드',
            saveAvatar: '아바타 설정 저장',
            avatarHint: 'JPG, PNG 형식 지원, 최대 2MB',
            
            // 联系方式
            contact: '연락처',
            contactDesc: '연락처 정보를 관리합니다',
            email: '이메일 주소',
            emailPlaceholder: '연결되지 않음',
            bind: '연결',
            unbind: '해제',
            phone: '전화 번호',
            phonePlaceholder: '연결되지 않음',
            verified: '인증 완료',
            
            // 密码管理
            password: '비밀번호 관리',
            passwordDesc: '계정 보안을 보호합니다',
            currentPassword: '현재 비밀번호',
            currentPasswordPlaceholder: '현재 비밀번호를 입력하세요',
            verifyPassword: '비밀번호 확인',
            
            // 两步验证
            twoFactor: '이중 인증',
            twoFactorDesc: '계정 보안을 강화합니다',
            enableTwoFactor: '이중 인증 활성화',
            twoFactorHint: '로그인 시 추가 인증 코드가 필요합니다',
            changePin: 'PIN 변경',
            updateSecurity: '보안 질문 업데이트',
            
            // 资料可见性
            visibility: '프로필 가시성',
            visibilityDesc: '누가 귀하의 정보를 볼 수 있는지 제어합니다',
            publicProfile: '공개 프로필',
            publicProfileHint: '모든 사용자가 귀하의 프로필을 볼 수 있습니다',
            showOnline: '온라인 상태 표시',
            showOnlineHint: '다른 사용자가 귀하가 온라인인지 확인할 수 있습니다',
            allowFriends: '친구 요청 허용',
            allowFriendsHint: '다른 사용자가 귀하에게 친구 요청을 보낼 수 있습니다',
            
            // 消息隐私
            messagePrivacy: '메시지 개인정보',
            messagePrivacyDesc: '메시지 수신 설정을 관리합니다',
            strangerMessages: '낯선 사람으로부터 메시지 받기',
            strangerMessagesHint: '친구가 아닌 사용자가 귀하에게 메시지를 보낼 수 있습니다',
            readReceipts: '읽음 확인 표시',
            readReceiptsHint: '발신자가 귀하가 메시지를 읽었는지 확인할 수 있습니다',
            
            // 游戏统计
            gameStats: '게임 통계',
            gameStatsDesc: '게임 데이터를 확인합니다',
            totalPlayTime: '총 플레이 시간',
            totalGames: '게임 횟수',
            totalWins: '승리 횟수',
            totalScore: '총 점수',
            
            // 签到统计
            checkin: '체크인 통계',
            checkinDesc: '체크인 데이터를 확인합니다',
            totalCheckin: '총 체크인 일수',
            checkinPoints: '체크인 포인트',
            consecutive: '연속 체크인',
            monthCheckin: '이달의 체크인',
            
            // 成就系统
            achievements: '업적 시스템',
            achievementsDesc: '게임 업적을 확인합니다',
            allAchievements: '모든 업적',
            selecting: '선택 중',
            
            // 通知设置
            notifications: '알림 설정',
            notificationsDesc: '받는 알림 유형을 관리합니다',
            system: '시스템 알림',
            systemHint: '중요한 시스템 알림 및 업데이트를 받습니다',
            game: '게임 알림',
            gameHint: '게임 관련 알림 및 이벤트를 받습니다',
            activity: '활동 알림',
            activityHint: '활동 및 프로모션 정보를 받습니다',
            marketing: '마케팅 알림',
            marketingHint: '제품 프로모션 및 제안을 받습니다',
            
            // 声音设置
            sound: '사운드 설정',
            soundDesc: '알림 소리 및 효과를 제어합니다',
            notificationVolume: '알림 볼륨',
            messageVolume: '메시지 소리',
            saveSound: '사운드 설정 저장',
            
            // 已登录设备
            devices: '로그인된 기기',
            devicesDesc: '로그인된 기기를 관리합니다',
            currentDevice: '현재 기기',
            
            // 登录历史
            loginHistory: '로그인 기록',
            loginHistoryDesc: '최근 로그인 기록을 확인합니다',
            
            // 主题设置
            theme: '테마 설정',
            themeDesc: '인터페이스 모양을 사용자 정의합니다',
            light: '밝은 테마',
            dark: '어두운 테마',
            custom: '사용자 정의 테마',
            glass: '유리 테마',
            gpuAcceleration: '하드웨어 GPU 가속 활성화',
            gpuAccelerationHint: '활성화하면 페이지 렌더링에 GPU를 사용하여 성능이 향상됩니다',
            
            // 自定义主题
            colorSettings: '색상 설정',
            rgbMode: 'RGB 모드',
            paletteMode: '팔레트',
            red: '빨강 (R)',
            green: '초록 (G)',
            blue: '파랑 (B)',
            customColor: '사용자 정의 색상',
            interface: '인터페이스 설정',
            opacity: '불투명도',
            contrast: '대비',
            preview: '미리 보기',
            applyTheme: '테마 적용',
            reset: '초기화',
            
            // 毛玻璃主题
            glassEffect: '유리 효과 설정',
            blur: '흐림 수준',
            
            // 自定义背景
            background: '사용자 정의 배경',
            backgroundDesc: '사용자 정의 인터페이스 배경 이미지를 설정합니다',
            uploadBackground: '이미지 선택',
            backgroundHint: 'JPG, PNG 형식 지원, 최대 100MB',
            backgroundFit: '맞춤 모드',
            backgroundFitOptions: {
                cover: '커버',
                contain: '포함',
                fill: '채우기',
                repeat: '반복',
                center: '중앙',
                content: '콘텐츠 맞춤'
            },
            applyBackground: '배경 적용',
            resetBackground: '배경 초기화',
            
            // 语言设置
            language: '언어 설정',
            languageDesc: '인터페이스 언어 선택',
            interfaceLanguage: '인터페이스 언어',
            
            // 数据管理
            data: '데이터 관리',
            dataDesc: '계정 데이터를 관리합니다',
            export: '데이터 내보내기',
            exportHint: '계정 데이터 복사본 다운로드',
            import: '데이터 가져오기',
            importHint: '이전에 내보낸 데이터 파일에서 복원',
            clearCache: '캐시 지우기',
            clearCacheHint: '로컬 캐시 데이터 지우기',
            
            // 危险区域
            danger: '위험 구역',
            dangerDesc: '주의하여操作하십시오. 무엇을 하는지 모르는 한 다음 작업을 수행하지 마십시오',
            deleteAccount: '계정 삭제',
            deleteAccountHint: '계정 및 모든 데이터 영구 삭제',
            logout: '로그아웃',
            logoutHint: '현재 계정에서 로그아웃',
            resetSettings: '모든 설정 초기화',
            resetSettingsHint: '모든 설정을 기본 상태로 복원',
            devMode: '개발자 모드',
            devModeHint: '고급 기능을 사용하려면 개발자 모드에 들어갑니다',
            exitDevMode: '개발자 모드 종료',
            exitDevModeHint: '개발자 모드를 종료하면 고급 기능이 비활성화됩니다',
            
            // 用户协议
            terms: '이용 약관',
            termsDesc: '다음 약관을仔细히 읽고 동의하십시오',
            termsTitle: 'GPY Games Studio 이용 약관',
            termsIntro: '이용 약관 개요',
            termsDefinition: '정의 및 해석',
            termsService: '서비스 라이센스 및 사용 범위',
            termsAccount: '사용자 계정 관리',
            termsPrivacy: '개인정보 보호',
            termsProperty: '가상 재산 관련 계약',
            termsRights: '양 당사자의 권리 및 의무',
            termsDisclaimer: '면책 조항',
            
            // 隐私政策
            privacyPolicy: '개인정보 정책',
            privacyPolicyDesc: '귀하의 개인정보를 어떻게 보호하는지',
            
            // 按钮文本
            save: '저장',
            cancel: '취소',
            confirm: '확인',
            edit: '편집',
            copy: '복사',
            upload: '업로드',
            
            // 提示信息
            saved: '저장되었습니다',
            copied: '클립보드에 복사되었습니다',
            error: '오류',
            success: '성공',
            
            // 测试页面
            testPage: '테스트 페이지',
            testPageDesc: '테마 적합성, 버튼 스타일 일관성 및 다양한 테스트 사례를 테스트하는 데 사용됩니다',
            
            // 版权信息
            copyright: '© 2014-2026 GPY Games Studio'
        }
    };
    
    function init() {
        var currentLang = SettingsManager.get('language') || 'zh';
        updateLanguage(currentLang);
    }
    
    function updateLanguage(lang) {
        // 确保语言设置同步到SettingsManager
        SettingsManager.set('language', lang);
        var texts = langMap[lang] || langMap['zh'];
        
        // 更新页面标题
        var launcherText = {
            'zh': 'PRE Launcher',
            'en': 'PRE Launcher',
            'ja': 'PRE ゲームランチャー',
            'ko': 'PRE의 게임 실행기'
        };
        document.title = texts.pageTitle + ' - ' + (launcherText[lang] || launcherText['zh']);
        
        // 更新侧边栏菜单
        updateSidebarMenu(texts);
        
        // 更新页面标题和描述
        updatePageTitles(texts);
        
        // 更新表单元素
        updateFormElements(texts);
        
        // 更新模态框
        updateModals(texts);
        
        // 更新统计数据
        updateStats(texts);
        
        // 更新按钮文本
        updateButtons(texts);
        
        // 更新提示信息
        updateAlerts(texts);
    }
    
    function updateSidebarMenu(texts) {
        var sidebarTexts = texts.sidebar;
        var menuGroupTexts = texts.menuGroups;
        
        var menuItems = {
            'account': '账户信息',
            'security': '安全设置',
            'privacy': '隐私设置',
            'game-stats': '统计数据',
            'achievements': '成就系统',
            'notifications': '通知设置',
            'devices': '设备管理',
            'advanced': '主题设置',
            'account-management': '账户管理',
            'terms': '用户协议',
            'privacy-policy': '隐私政策',
            'test': '测试页面'
        };
        
        // 键映射：将kebab-case转换为camelCase
        var keyMap = {
            'game-stats': 'gameStats',
            'account-management': 'accountManagement',
            'privacy-policy': 'privacyPolicy'
        };
        
        Object.keys(menuItems).forEach(function(key) {
            var menuItem = document.querySelector('.menu-item[data-section="' + key + '"]');
            if (menuItem) {
                var span = menuItem.querySelector('span');
                if (span) {
                    // 使用映射的键或原始键查找翻译
                    var mappedKey = keyMap[key] || key;
                    span.textContent = sidebarTexts[mappedKey] || menuItems[key];
                }
            }
        });
        
        // 更新菜单组标题
        var menuGroupTitles = {
            '账户系统': menuGroupTexts.accountSystem,
            '统计数据': menuGroupTexts.statistics,
            '高级管理': menuGroupTexts.advancedManagement,
            '核心条款': menuGroupTexts.coreTerms,
            '开发测试': menuGroupTexts.devTesting
        };
        
        Object.keys(menuGroupTitles).forEach(function(oldText) {
            var groupTitle = document.querySelector('.menu-group-title');
            if (groupTitle && groupTitle.textContent === oldText) {
                groupTitle.textContent = menuGroupTitles[oldText];
            }
        });
        
        // 更全面的菜单组标题更新
        var menuGroupTitlesElements = document.querySelectorAll('.menu-group-title');
        var originalTitles = ['账户系统', '统计数据', '高级管理', '核心条款', '开发测试'];
        var translatedTitles = [menuGroupTexts.accountSystem, menuGroupTexts.statistics, menuGroupTexts.advancedManagement, menuGroupTexts.coreTerms, menuGroupTexts.devTesting];
        
        menuGroupTitlesElements.forEach(function(element, index) {
            if (originalTitles[index] && element.textContent === originalTitles[index]) {
                element.textContent = translatedTitles[index];
            }
        });
    }
    
    function updatePageTitles(texts) {
        var titles = {
            'account': { title: texts.accountInfo, desc: texts.accountInfoDesc },
            'security': { title: texts.password, desc: texts.passwordDesc },
            'privacy': { title: texts.visibility, desc: texts.visibilityDesc },
            'game-stats': { title: texts.gameStats, desc: texts.gameStatsDesc },
            'achievements': { title: texts.achievements, desc: texts.achievementsDesc },
            'notifications': { title: texts.notifications, desc: texts.notificationsDesc },
            'devices': { title: texts.devices, desc: texts.devicesDesc },
            'advanced': { title: texts.theme, desc: texts.themeDesc },
            'account-management': { title: texts.data, desc: texts.dataDesc },
            'terms': { title: texts.terms, desc: texts.termsDesc },
            'privacy-policy': { title: texts.privacyPolicy, desc: texts.privacyPolicyDesc },
            'test': { title: '测试页面', desc: '用于测试主题适配性、按钮风格统一度以及各种测试案例' }
        };
        
        Object.keys(titles).forEach(function(key) {
            var section = document.getElementById('section-' + key);
            if (section) {
                // 当切换到该部分时会更新标题
                // 这里只需要确保数据存在
            }
        });
        
        // 更新当前显示的标题
        var activeSection = document.querySelector('.settings-section.active');
        if (activeSection) {
            var sectionId = activeSection.id.replace('section-', '');
            if (titles[sectionId]) {
                document.getElementById('settingsTitle').textContent = titles[sectionId].title;
                document.getElementById('settingsDesc').textContent = titles[sectionId].desc;
            }
        }
    }
    
    function updateFormElements(texts) {
        // 创建文本映射对象，用于批量更新
        var textMap = {
            // 基本信息
            '基本信息': texts.basicInfo,
            '更新您的基本账户信息': texts.basicInfoDesc,
            '用户名': texts.username,
            '用户ID': texts.userId,
            '注册时间': texts.regTime,
            
            // 个人资料
            '个人资料': texts.profile,
            '设置您的个人资料信息': texts.profileDesc,
            '个性签名': texts.bio,
            '保存个性签名': texts.saveBio,
            
            // 头像设置
            '头像设置': texts.avatar,
            '设置您的个人头像': texts.avatarDesc,
            '上传自定义头像': texts.uploadAvatar,
            '保存头像设置': texts.saveAvatar,
            '支持 JPG、PNG 格式，最大 2MB': texts.avatarHint,
            
            // 联系方式
            '联系方式': texts.contact,
            '管理您的联系信息': texts.contactDesc,
            '邮箱地址': texts.email,
            '绑定': texts.bind,
            '解绑': texts.unbind,
            '手机号码': texts.phone,
            '已验证': texts.verified,
            
            // 密码管理
            '密码管理': texts.password,
            '保护您的账户安全': texts.passwordDesc,
            '当前密码': texts.currentPassword,
            '验证密码': texts.verifyPassword,
            
            // 两步验证
            '两步验证': texts.twoFactor,
            '增强您的账户安全性': texts.twoFactorDesc,
            '启用两步验证': texts.enableTwoFactor,
            '登录时需要额外的验证码': texts.twoFactorHint,
            '更改PIN码': texts.changePin,
            '更新安全问题': texts.updateSecurity,
            
            // 资料可见性
            '资料可见性': texts.visibility,
            '控制谁可以看到您的信息': texts.visibilityDesc,
            '公开个人资料': texts.publicProfile,
            '所有用户都可以查看您的资料': texts.publicProfileHint,
            '显示在线状态': texts.showOnline,
            '其他用户可以看到您是否在线': texts.showOnlineHint,
            '允许好友请求': texts.allowFriends,
            '其他用户可以向您发送好友请求': texts.allowFriendsHint,
            
            // 消息隐私
            '消息隐私': texts.messagePrivacy,
            '管理消息接收设置': texts.messagePrivacyDesc,
            '接收陌生人消息': texts.strangerMessages,
            '非好友用户可以向您发送消息': texts.strangerMessagesHint,
            '显示已读回执': texts.readReceipts,
            '发送者可以看到您是否已读消息': texts.readReceiptsHint,
            
            // 游戏统计
            '游戏统计': texts.gameStats,
            '查看您的游戏数据': texts.gameStatsDesc,
            '总游戏时长': texts.totalPlayTime,
            '游戏次数': texts.totalGames,
            '获胜次数': texts.totalWins,
            '总积分': texts.totalScore,
            
            // 签到统计
            '签到统计': texts.checkin,
            '查看您的签到数据': texts.checkinDesc,
            '签到总天数': texts.totalCheckin,
            '签到积分': texts.checkinPoints,
            '连续签到': texts.consecutive,
            '本月签到': texts.monthCheckin,
            
            // 成就系统
            '成就系统': texts.achievements,
            '查看您的游戏成就': texts.achievementsDesc,
            '全部成就': texts.allAchievements,
            '选择中': texts.selecting,
            
            // 通知设置
            '通知设置': texts.notifications,
            '管理您接收的通知类型': texts.notificationsDesc,
            '系统通知': texts.system,
            '接收系统重要通知和更新': texts.systemHint,
            '游戏通知': texts.game,
            '接收游戏相关通知和活动': texts.gameHint,
            '活动通知': texts.activity,
            '接收活动和促销信息': texts.activityHint,
            '营销通知': texts.marketing,
            '接收产品推广和优惠信息': texts.marketingHint,
            
            // 声音设置
            '声音设置': texts.sound,
            '控制通知声音和音效': texts.soundDesc,
            '通知音量': texts.notificationVolume,
            '消息音效': texts.messageVolume,
            '保存声音设置': texts.saveSound,
            
            // 已登录设备
            '已登录设备': texts.devices,
            '管理您已登录的设备': texts.devicesDesc,
            '当前设备': texts.currentDevice,
            
            // 登录历史
            '登录历史': texts.loginHistory,
            '查看最近的登录记录': texts.loginHistoryDesc,
            
            // 主题设置
            '主题设置': texts.theme,
            '自定义界面外观': texts.themeDesc,
            '明亮主题': texts.light,
            '暗色主题': texts.dark,
            '自定义主题': texts.custom,
            '毛玻璃主题': texts.glass,
            '启用硬件GPU加速': texts.gpuAcceleration,
            '启用后将使用GPU进行页面渲染，提升性能': texts.gpuAccelerationHint,
            
            // 自定义主题
            '颜色设置': texts.colorSettings,
            'RGB模式': texts.rgbMode,
            '调色盘': texts.paletteMode,
            '红色 (R)': texts.red,
            '绿色 (G)': texts.green,
            '蓝色 (B)': texts.blue,
            '自定义颜色': texts.customColor,
            '界面设置': texts.interface,
            '透明度': texts.opacity,
            '对比度': texts.contrast,
            '预览': texts.preview,
            '应用主题': texts.applyTheme,
            '重置': texts.reset,
            
            // 毛玻璃主题
            '毛玻璃效果设置': texts.glassEffect,
            '模糊程度': texts.blur,
            
            // 自定义背景
            '自定义背景': texts.background,
            '设置自定义界面背景图片': texts.backgroundDesc,
            '选择图片': texts.uploadBackground,
            '支持 JPG、PNG 格式，最大 100MB': texts.backgroundHint,
            '自适应方式': texts.backgroundFit,
            '应用背景': texts.applyBackground,
            '重置背景': texts.resetBackground,
            
            // 语言设置
            '语言设置': texts.language,
            '选择界面语言': texts.languageDesc,
            '界面语言': texts.interfaceLanguage,
            
            // 数据管理
            '数据管理': texts.data,
            '管理您的账户数据': texts.dataDesc,
            '导出数据': texts.export,
            '下载您的账户数据副本': texts.exportHint,
            '导入数据': texts.import,
            '从之前导出的数据文件恢复': texts.importHint,
            '清除缓存': texts.clearCache,
            '清除本地缓存数据': texts.clearCacheHint,
            
            // 危险区域
            '危险区域': texts.danger,
            '请谨慎操作，除非您知道自己在做什么，否则请勿执行下列的任何操作': texts.dangerDesc,
            '注销账户': texts.deleteAccount,
            '永久删除您的账户和所有数据': texts.deleteAccountHint,
            '退出登录': texts.logout,
            '退出当前账户': texts.logoutHint,
            '重置所有设置': texts.resetSettings,
            '将所有设置恢复到默认状态': texts.resetSettingsHint,
            '开发者模式': texts.devMode,
            '进入开发者模式以使用高级功能': texts.devModeHint,
            '退出开发者模式': texts.exitDevMode,
            '退出开发者模式将禁用高级功能': texts.exitDevModeHint,
            
            // 用户协议
            '用户协议': texts.terms,
            '请仔细阅读并同意以下条款': texts.termsDesc,
            'GPY Games Studio 用户协议': texts.termsTitle,
            '用户协议概述': texts.termsIntro,
            '定义与解释': texts.termsDefinition,
            '服务许可与使用范围': texts.termsService,
            '用户账号管理': texts.termsAccount,
            '个人信息保护': texts.termsPrivacy,
            '虚拟财产相关约定': texts.termsProperty,
            '双方权利与义务': texts.termsRights,
            '免责条款': texts.termsDisclaimer,
            
            // 隐私政策
            '隐私政策': texts.privacyPolicy,
            '我们如何保护您的个人信息': texts.privacyPolicyDesc
        };
        
        // 批量更新文本
        updateMultipleTexts(textMap);
        
        // 更新占位符
        updateElementPlaceholder('accountBio', texts.bioPlaceholder);
        updateElementPlaceholder('accountEmail', texts.emailPlaceholder);
        updateElementPlaceholder('accountPhone', texts.phonePlaceholder);
        updateElementPlaceholder('currentPassword', texts.currentPasswordPlaceholder);
        
        // 更新背景适配选项
        var backgroundFitSelect = document.getElementById('backgroundFit');
        if (backgroundFitSelect) {
            var options = backgroundFitSelect.options;
            for (var i = 0; i < options.length; i++) {
                var value = options[i].value;
                if (texts.backgroundFitOptions[value]) {
                    options[i].text = texts.backgroundFitOptions[value];
                }
            }
        }
    }
    
    function updateModals(texts) {
        // 创建文本映射对象，用于批量更新
        var textMap = {
            '修改用户名': texts.edit + ' ' + texts.username,
            '绑定邮箱': texts.bind + ' ' + texts.email,
            '绑定手机': texts.bind + ' ' + texts.phone,
            '请输入邮箱地址': texts.email + ' ' + texts.bind,
            '请输入手机号码': texts.phone + ' ' + texts.bind,
            '取消': texts.cancel,
            '确认': texts.confirm
        };
        
        // 批量更新文本
        updateMultipleTexts(textMap);
    }
    
    function updateStats(texts) {
        // 创建文本映射对象，用于批量更新
        var textMap = {
            '总游戏时长': texts.totalPlayTime,
            '游戏次数': texts.totalGames,
            '获胜次数': texts.totalWins,
            '总积分': texts.totalScore,
            '签到总天数': texts.totalCheckin,
            '签到积分': texts.checkinPoints,
            '连续签到': texts.consecutive,
            '本月签到': texts.monthCheckin
        };
        
        // 批量更新文本
        updateMultipleTexts(textMap);
    }
    
    function updateButtons(texts) {
        // 创建文本映射对象，用于批量更新
        var textMap = {
            '编辑': texts.edit,
            '复制': texts.copy,
            '绑定': texts.bind,
            '解绑': texts.unbind,
            '保存个性签名': texts.saveBio,
            '保存头像设置': texts.saveAvatar,
            '验证密码': texts.verifyPassword,
            '更改PIN码': texts.changePin,
            '更新安全问题': texts.updateSecurity,
            '保存声音设置': texts.saveSound,
            '应用主题': texts.applyTheme,
            '重置': texts.reset,
            '应用背景': texts.applyBackground,
            '重置背景': texts.resetBackground,
            '导出': texts.export,
            '导入': texts.import,
            '清除': texts.clearCache,
            '注销账户': texts.deleteAccount,
            '退出登录': texts.logout,
            '重置所有设置': texts.resetSettings,
            '进入开发者模式': texts.devMode,
            '退出开发者模式': texts.exitDevMode
        };
        
        // 批量更新文本
        updateMultipleTexts(textMap);
    }
    
    function updateAlerts(texts) {
        // 创建文本映射对象，用于批量更新
        var textMap = {
            '已保存': texts.saved,
            '已复制到剪贴板': texts.copied,
            '错误': texts.error,
            '成功': texts.success
        };
        
        // 批量更新文本
        updateMultipleTexts(textMap);
    }
    
    function updateElementText(oldText, newText) {
        // 优化：使用更精确的选择器，只查找包含指定文本的元素
        var xpath = "//*[text()='" + oldText + "']";
        var elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        
        for (var i = 0; i < elements.snapshotLength; i++) {
            var element = elements.snapshotItem(i);
            if (element.firstChild && element.firstChild.nodeType === 3) {
                element.firstChild.textContent = newText;
            }
        }
    }
    
    // 批量更新文本的函数，减少多次DOM查询
    function updateMultipleTexts(textMap) {
        // 一次性获取所有可能的文本元素
        var elementTypes = ['span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'label', 'button', 'li'];
        var selector = elementTypes.join(', ');
        var elements = document.querySelectorAll(selector);
        
        elements.forEach(function(element) {
            if (element.firstChild && element.firstChild.nodeType === 3) {
                var textContent = element.firstChild.textContent.trim();
                if (textMap[textContent]) {
                    element.firstChild.textContent = textMap[textContent];
                }
            }
        });
    }
    
    function updateElementPlaceholder(elementId, placeholder) {
        var element = document.getElementById(elementId);
        if (element) {
            element.placeholder = placeholder;
        }
    }
    
    function getLanguageText(key) {
        var currentLang = SettingsManager.get('language') || 'zh';
        var texts = langMap[currentLang] || langMap['zh'];
        
        // 处理嵌套键
        var keys = key.split('.');
        var value = texts;
        for (var i = 0; i < keys.length; i++) {
            if (value[keys[i]] !== undefined) {
                value = value[keys[i]];
            } else {
                return key;
            }
        }
        return value;
    }
    
    function getLanguageMap() {
        var currentLang = SettingsManager.get('language') || 'zh';
        return langMap[currentLang] || langMap['zh'];
    }
    
    return {
        init: init,
        updateLanguage: updateLanguage,
        getLanguageText: getLanguageText,
        getLanguageMap: getLanguageMap
    };
})();