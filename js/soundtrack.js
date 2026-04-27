/**
 * 游戏原声带管理模块
 * 包含歌曲列表管理、自定义歌曲路径、专辑信息管理等功能
 */

// 游戏原声带数据
const soundtrackData = {
    // 基础路径配置
    basePaths: {
        fkgame: '../soundtrack/lcb/'
    },

    albums: {
        fkgame: {
            name: 'LimbusCompany',
            title: 'LimbusCompany —— 原声带',
            description: '来自LimbusCompany游戏的背景音乐专辑',
            tracks: [
                { id: 1, title: '玻璃窗', duration: '2:50', path: 'lcb_main.wav' },
                { id: 2, title: 'Mili - In Hell We Live, Lament', duration: '3:12', path: 'TitleBgm.wav' },
                { id: 3, title: 'Mili - SAIKAI', duration: '2:58', path: 'Mili - SAIKAI AR.wav' },
                { id: 4, title: 'Mili - SAIKAI（伴奏）', duration: '3:25', path: 'Mili - SAIKAI MR.wav' },
                { id: 5, title: '未知剧情', duration: '2:58', path: 'noinfo1.wav' },
                { id: 6, title: 'Thumbs_Down', duration: '2:58', path: 'Thumbs_Down.wav' },
                { id: 7, title: 'Sanzunokawa', duration: '3:25', path: 'Sanzunokawa.wav' },
                { id: 8, title: 'Middle_Finger_Sanjou', duration: '3:25', path: 'Middle_Finger_Sanjou.wav' },
                { id: 9, title: 'Kumo_No_Ito', duration: '2:58', path: 'Kumo_No_Ito.wav' },
                { id: 10, title: 'Cut_Your_Rings', duration: '3:25', path: 'Cut_Your_Rings.wav' },
                { id: 11, title: 'Alert_Beta', duration: '2:58', path: 'Alert_Beta.wav' },
                { id: 12, title: 'Alert_Alpha', duration: '3:25', path: 'Alert_Alpha.wav' },
                { id: 13, title: 'They_Were_Here', duration: '2:58', path: 'They_Were_Here.wav' },
                { id: 14, title: 'They_Must_Be_Here', duration: '3:25', path: 'They_Must_Be_Here.wav' },
                { id: 15, title: 'Good_Old_Day', duration: '2:58', path: 'Good_Old_Day.wav' },
                { id: 16, title: 'And_Day_Passes', duration: '3:25', path: 'And_Day_Passes.wav' },
                { id: 17, title: 'Aka_No_Ito', duration: '2:58', path: 'Aka_No_Ito.wav' },
                { id: 18, title: 'You_Must_Train', duration: '3:25', path: 'You_Must_Train.wav' },
                { id: 19, title: 'You_Must_Study', duration: '2:58', path: 'You_Must_Study.wav' },
                { id: 20, title: 'You_Must_Rest', duration: '3:25', path: 'You_Must_Rest.wav' },
                { id: 21, title: 'Lost_Beacon', duration: '2:58', path: 'Lost_Beacon.wav' },
                { id: 22, title: 'Long_Live_The_Hierarch', duration: '3:25', path: 'Long_Live_The_Hierarch.wav' },
                { id: 23, title: 'False_Worship', duration: '2:58', path: 'False_Worship.wav' },
                { id: 24, title: 'Call_Of_Iberia', duration: '3:25', path: 'Call_Of_Iberia.wav' },
                { id: 25, title: 'SFX_Amb_Budda', duration: '2:58', path: 'SFX_Amb_Budda.wav' },
                { id: 26, title: 'Se_Ji_Shi_Kong', duration: '3:25', path: 'Se_Ji_Shi_Kong.wav' },
                { id: 27, title: 'Remembrance-2', duration: '2:58', path: 'Remembrance-2.wav' },
                { id: 28, title: 'LC_Credit_108', duration: '3:25', path: 'LC_Credit_108.wav' },
                { id: 29, title: 'Grand_Party', duration: '2:58', path: 'Grand_Party.wav' },
                { id: 30, title: 'Golden_Flower', duration: '3:25', path: 'Golden_Flower.wav' },
                { id: 31, title: '10_Emergency2', duration: '2:58', path: '10_Emergency2.wav' },
                { id: 32, title: '', duration: '3:25', path: '' },
                { id: 33, title: '', duration: '2:58', path: '' },
                { id: 34, title: '', duration: '3:25', path: '' },
                { id: 35, title: '', duration: '2:58', path: '' },
                { id: 36, title: '', duration: '3:25', path: '' },
                { id: 37, title: '', duration: '2:58', path: '' },
                { id: 38, title: '', duration: '3:25', path: '' },
                { id: 39, title: '', duration: '2:58', path: '' },
                { id: 40, title: '', duration: '3:25', path: '' },
                { id: 41, title: '', duration: '2:58', path: '' },
            ],
            chapters: [
                { id: 1, name: '游戏通用界面', trackIds: [1] },
                { id: 2, name: '第一章剧情/战斗', trackIds: [1] },
                { id: 3, name: '第二章剧情/战斗', trackIds: [2] },
                { id: 4, name: '第三章剧情/战斗', trackIds: [3] },
                { id: 5, name: '第四章剧情/战斗', trackIds: [4] },
                { id: 6, name: '第五章剧情/战斗', trackIds: [] },
                { id: 7, name: '第六章剧情/战斗', trackIds: [] },
                { id: 8, name: '第七章剧情/战斗', trackIds: [] },
                { id: 9, name: '第八章剧情/战斗', trackIds: [] },
                { id: 10, name: '第九章剧情/战斗', trackIds: [] },
                { id: 11, name: '其他曲目', trackIds: [5] },
                { id: 12, name: '特殊曲目', trackIds: [] }
            ]
        }
    },
    
    // 获取专辑信息
    getAlbum: function(gameId) {
        return this.albums[gameId] || null;
    },
    
    // 获取所有专辑
    getAllAlbums: function() {
        return Object.values(this.albums);
    },
    
    // 增加新专辑
    addAlbum: function(gameId, albumData) {
        if (!this.albums[gameId]) {
            this.albums[gameId] = {
                name: albumData.name,
                title: albumData.title || `${albumData.name} 原声带`,
                description: albumData.description || `来自${albumData.name}游戏的背景音乐专辑`,
                tracks: albumData.tracks || [],
                chapters: albumData.chapters || [
                    { id: 1, name: '第一章' },
                    { id: 2, name: '第二章' },
                    { id: 3, name: '第三章' },
                    { id: 4, name: '第四章' },
                    { id: 5, name: '第五章' },
                    { id: 6, name: '第六章' },
                    { id: 7, name: '第七章' },
                    { id: 8, name: '第八章' },
                    { id: 9, name: '第九章' },
                    { id: 10, name: '其他曲目' }
                ]
            };
            return true;
        }
        return false;
    },
    
    // 更新专辑信息
    updateAlbum: function(gameId, albumData) {
        if (this.albums[gameId]) {
            this.albums[gameId] = {
                ...this.albums[gameId],
                ...albumData
            };
            return true;
        }
        return false;
    },
    
    // 删除专辑
    removeAlbum: function(gameId) {
        if (this.albums[gameId]) {
            delete this.albums[gameId];
            return true;
        }
        return false;
    },
    
    // 为专辑添加曲目
    addTrack: function(gameId, trackData) {
        if (this.albums[gameId]) {
            const trackId = this.albums[gameId].tracks.length + 1;
            this.albums[gameId].tracks.push({
                id: trackId,
                title: trackData.title,
                duration: trackData.duration || '0:00',
                path: trackData.path || ''
            });
            return true;
        }
        return false;
    },
    
    // 更新曲目信息
    updateTrack: function(gameId, trackId, trackData) {
        if (this.albums[gameId]) {
            const track = this.albums[gameId].tracks.find(t => t.id === trackId);
            if (track) {
                track.title = trackData.title || track.title;
                track.duration = trackData.duration || track.duration;
                track.path = trackData.path || track.path;
                return true;
            }
        }
        return false;
    },
    
    // 删除曲目
    removeTrack: function(gameId, trackId) {
        if (this.albums[gameId]) {
            const initialLength = this.albums[gameId].tracks.length;
            this.albums[gameId].tracks = this.albums[gameId].tracks.filter(t => t.id !== trackId);
            // 重新编号
            this.albums[gameId].tracks.forEach((track, index) => {
                track.id = index + 1;
            });
            return this.albums[gameId].tracks.length < initialLength;
        }
        return false;
    },
    
    // 设置歌曲路径
    setTrackPath: function(gameId, trackId, path) {
        if (this.albums[gameId]) {
            const track = this.albums[gameId].tracks.find(t => t.id === trackId);
            if (track) {
                track.path = path;
                return true;
            }
        }
        return false;
    },
    
    // 导入专辑数据
    importAlbums: function(data) {
        if (typeof data === 'object' && data !== null) {
            this.albums = {
                ...this.albums,
                ...data
            };
            return true;
        }
        return false;
    },
    
    // 导出专辑数据
    exportAlbums: function() {
        return JSON.stringify(this.albums, null, 2);
    },
    
    // 为专辑添加章节
    addChapter: function(gameId, chapterData) {
        if (this.albums[gameId]) {
            const chapterId = this.albums[gameId].chapters.length + 1;
            this.albums[gameId].chapters.push({
                id: chapterId,
                name: chapterData.name
            });
            return true;
        }
        return false;
    },
    
    // 更新章节信息
    updateChapter: function(gameId, chapterId, chapterData) {
        if (this.albums[gameId]) {
            const chapter = this.albums[gameId].chapters.find(c => c.id === chapterId);
            if (chapter) {
                chapter.name = chapterData.name || chapter.name;
                return true;
            }
        }
        return false;
    },
    
    // 删除章节
    removeChapter: function(gameId, chapterId) {
        if (this.albums[gameId]) {
            const initialLength = this.albums[gameId].chapters.length;
            this.albums[gameId].chapters = this.albums[gameId].chapters.filter(c => c.id !== chapterId);
            // 重新编号
            this.albums[gameId].chapters.forEach((chapter, index) => {
                chapter.id = index + 1;
            });
            return this.albums[gameId].chapters.length < initialLength;
        }
        return false;
    },
    
    // 获取专辑的章节列表
    getChapters: function(gameId) {
        if (this.albums[gameId]) {
            return this.albums[gameId].chapters || [];
        }
        return [];
    },
    
    // 获取曲目的完整路径
    getTrackPath: function(gameId, trackId) {
        if (this.albums[gameId]) {
            const track = this.albums[gameId].tracks.find(t => t.id === trackId);
            if (track && track.path) {
                // 检查是否已经包含完整路径
                if (track.path.startsWith('http') || track.path.startsWith('../')) {
                    return track.path;
                }
                // 否则添加基础路径
                const basePath = this.basePaths[gameId] || '';
                return basePath + track.path;
            }
        }
        return '';
    },
    
    // 获取带完整路径的曲目列表
    getTracksWithFullPath: function(gameId) {
        if (this.albums[gameId]) {
            const basePath = this.basePaths[gameId] || '';
            return this.albums[gameId].tracks.map(track => {
                let fullPath = track.path;
                if (fullPath && !fullPath.startsWith('http') && !fullPath.startsWith('../')) {
                    fullPath = basePath + fullPath;
                }
                return {
                    ...track,
                    path: fullPath
                };
            });
        }
        return [];
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = soundtrackData;
} else if (typeof window !== 'undefined') {
    window.soundtrackData = soundtrackData;
}