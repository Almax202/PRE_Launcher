/**
 * 游戏数据记录模块
 * 用于记录各个游戏的启动次数、游玩时长、分数等数据
 */

// 游戏ID映射
window.GameStatsConfig = {
    'game_fk': '点击方块',
    'game_wzq': '五子连珠',
    'game_fxq': '飞行器',
    'game_snake': '贪吃蛇',
    'game_memory': '记忆卡牌',
    'game_color': '颜色匹配',
    'game_cube3d': '光影冲刺',
    'game_dino': '光影恐龙'
};

// 游戏数据管理器
window.GameStatsManager = {
    // 获取当前用户
    getCurrentUser: function() {
        return JSON.parse(localStorage.getItem('currentUser') || '{}');
    },

    // 获取所有用户
    getUsers: function() {
        return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    },

    // 保存用户数据
    saveUsers: function(users) {
        localStorage.setItem('registeredUsers', JSON.stringify(users));
    },

    // 获取游戏数据
    getGameData: function(gameId) {
        var user = this.getCurrentUser();
        var users = this.getUsers();
        var userIndex = users.findIndex(function(u) { return u.username === user.username; });

        if (userIndex === -1) {
            return {
                launchCount: 0,
                totalPlayTime: 0,
                highScore: 0,
                bestRank: '-',
                lastPlayed: null
            };
        }

        var gameData = users[userIndex].gameData || {};
        var gameStats = gameData[gameId] || {};

        return {
            launchCount: gameStats.launchCount || 0,
            totalPlayTime: gameStats.totalPlayTime || 0,
            highScore: gameStats.highScore || 0,
            bestRank: gameStats.bestRank || '-',
            lastPlayed: gameStats.lastPlayed || null
        };
    },

    // 更新游戏数据
    updateGameData: function(gameId, updates) {
        var user = this.getCurrentUser();
        var users = this.getUsers();
        var userIndex = users.findIndex(function(u) { return u.username === user.username; });

        if (userIndex === -1) return false;

        if (!users[userIndex].gameData) {
            users[userIndex].gameData = {};
        }
        if (!users[userIndex].gameData[gameId]) {
            users[userIndex].gameData[gameId] = {};
        }

        Object.keys(updates).forEach(function(key) {
            users[userIndex].gameData[gameId][key] = updates[key];
        });

        this.saveUsers(users);
        return true;
    },

    // 记录游戏启动
    recordLaunch: function(gameId) {
        var stats = this.getGameData(gameId);
        this.updateGameData(gameId, {
            launchCount: stats.launchCount + 1,
            lastPlayed: new Date().toISOString()
        });
    },

    // 添加游玩时长（秒）
    addPlayTime: function(gameId, seconds) {
        var stats = this.getGameData(gameId);
        this.updateGameData(gameId, {
            totalPlayTime: stats.totalPlayTime + seconds,
            lastPlayed: new Date().toISOString()
        });
    },

    // 记录分数
    recordScore: function(gameId, score, rank) {
        var stats = this.getGameData(gameId);
        var updates = {
            lastPlayed: new Date().toISOString()
        };

        if (score > stats.highScore) {
            updates.highScore = score;
        }

        if (rank && rank !== '-') {
            updates.bestRank = rank;
        }

        this.updateGameData(gameId, updates);
    },

    // 获取全局统计数据（所有游戏汇总）
    getGlobalStats: function() {
        var self = this;
        var gameIds = Object.keys(window.GameStatsConfig);
        var totalLaunchCount = 0;
        var totalPlayTime = 0;
        var totalHighScore = 0;
        var gamesPlayed = 0;
        var lastPlayedGame = null;
        var lastPlayedTime = null;

        gameIds.forEach(function(gameId) {
            var stats = self.getGameData(gameId);
            if (stats.launchCount > 0) {
                gamesPlayed++;
                totalLaunchCount += stats.launchCount;
                totalPlayTime += stats.totalPlayTime;
                totalHighScore += stats.highScore;
            }
            if (stats.lastPlayed) {
                if (!lastPlayedTime || new Date(stats.lastPlayed) > new Date(lastPlayedTime)) {
                    lastPlayedTime = stats.lastPlayed;
                    lastPlayedGame = gameId;
                }
            }
        });

        return {
            totalLaunchCount: totalLaunchCount,
            totalPlayTime: totalPlayTime,
            totalHighScore: totalHighScore,
            gamesPlayed: gamesPlayed,
            lastPlayedGame: lastPlayedGame,
            lastPlayedTime: lastPlayedTime
        };
    }
};

// 游戏计时器类 - 用于在游戏页面中追踪游玩时间
window.GameTimer = function(gameId) {
    this.gameId = gameId;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.isRunning = false;
};

window.GameTimer.prototype.start = function() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
    this.timerInterval = setInterval(function() {
        // 每秒更新一次
    }, 1000);
};

window.GameTimer.prototype.stop = function() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }
    if (this.startTime) {
        var now = Date.now();
        var elapsed = Math.floor((now - this.startTime) / 1000);
        this.elapsedSeconds += elapsed;
        this.startTime = null;
        // 保存游玩时间
        if (this.elapsedSeconds > 0) {
            window.GameStatsManager.addPlayTime(this.gameId, this.elapsedSeconds);
            this.elapsedSeconds = 0;
        }
    }
};

window.GameTimer.prototype.pause = function() {
    this.stop();
};

window.GameTimer.prototype.resume = function() {
    this.start();
};

window.GameTimer.prototype.getElapsedSeconds = function() {
    return this.elapsedSeconds;
};

// 格式化时长显示
window.formatPlayTime = function(seconds) {
    if (seconds === 0) return '0分钟';
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return hours + '小时' + (minutes > 0 ? minutes + '分钟' : '');
    }
    return minutes + '分钟';
};

// 自动记录游戏启动
document.addEventListener('DOMContentLoaded', function() {
    var gameId = document.body.getAttribute('data-game-id');
    if (gameId && window.GameStatsConfig[gameId]) {
        window.GameStatsManager.recordLaunch(gameId);
    }
});
