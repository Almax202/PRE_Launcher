/* ============================================================
 * soundtrack.js — PRE Launcher 音乐播放器模块
 * 音乐播放器的全部 UI 渲染、样式注入与播放逻辑均集中在本文件。
 *
 * 【如何添加音乐】
 *   1. 将音频文件（.mp3 / .ogg / .wav 等）放入项目根目录下的 sounds/ 目录；
 *   2. 在下方 SOUNDTRACK_TRACKS 数组中追加一条曲目信息即可，
 *      播放器会自动加载并显示，无需改动其它任何代码。
 * ============================================================ */
(function () {
    'use strict';

    // ==================== 曲目数据（音乐资源接入点） ====================
    var SOUNDTRACK_TRACKS = [
        {
            id: 'track-01',
            title: 'SAIKAI',
            artist: 'Mili',
            album: 'Limbus Company',
            src: 'sounds/SAIKAI.mp3',
            colors: ['#667eea', '#764ba2']
        },
        {
            id: 'track-02',
            title: 'TIAN TIAN',
            artist: 'Mili',
            album: 'Limbus Company',
            src: 'sounds/TIAN TIAN.mp3',
            colors: ['#f093fb', '#f5576c']
        },
        {
            id: 'track-03',
            title: 'HERO',
            artist: 'Mili',
            album: 'Limbus Company',
            src: 'sounds/HERO.mp3',
            colors: ['#4facfe', '#00c6fb']
        },
        {
            id: 'track-04',
            title: 'Through Patches of Violet',
            artist: 'Mili',
            album: 'Limbus Company',
            src: 'sounds/Through Patches of Violet.mp3',
            colors: ['#43e97b', '#38f9d7']
        },
        {
            id: 'track-05',
            title: 'Compass',
            artist: 'Mili',
            album: 'Limbus Company',
            src: 'sounds/Compass.mp3',
            colors: ['#fa709a', '#feb47b']
        },
        {
            id: 'track-06',
            title: 'Fly, My Wings',
            artist: 'Mili',
            album: 'Limbus Company',
            src: 'sounds/Fly, My Wings.mp3',
            colors: ['#5b73e8', '#30cfd0']
        },
        {
            id: 'track-07',
            title: '危机合约 - 涤墨作战',
            artist: '塞壬唱片-MSR',
            album: 'Arknights',
            src: 'sounds/Battleplan Obliteration.mp3',
            colors: ['#5b73e8', '#30cfd0']
        },
        {
            id: 'track-08',
            title: '直到大地变成一颗酸橙',
            artist: '塞壬唱片-MSR',
            album: 'Arknights',
            src: 'sounds/直到大地变成一颗酸橙.mp3',
            colors: ['#5b73e8', '#30cfd0']
        },
    ];

    // ==================== 专辑数据（曲目合集快速配置） ====================
    /* 使用说明：
       - 专辑 id 必须唯一；name / description 会直接显示在网格卡片上；
       - trackIds 只需填写 SOUNDTRACK_TRACKS 或自定义播放列表中已存在的曲目 id；
       - colors 用于专辑卡片的渐变背景（取 2 个色值即可），若未提供则自动兜底；
       - 新建专辑最方便的方式：在下方数组末尾追加一条，或用数组 push()；
       - 想让自定义播放列表曲目也能进专辑？把 trackIds 里的 id 换成对应自定义曲目的 id 即可。
    */
    var SOUNDTRACK_ALBUMS = [
        {
            id: 'album-limbus',
            name: 'Limbus Company',
            description: 'Mili · 6 首',
            trackIds: ['track-01', 'track-02', 'track-03', 'track-04', 'track-05', 'track-06'],
            colors: ['#667eea', '#d45d79']
        },
        {
            id: 'album-arknights',
            name: 'Arknights',
            description: '塞壬唱片-MSR · 2 首',
            trackIds: ['track-07', 'track-08'],
            colors: ['#4facfe', '#00c6fb']
        }
        // ← 新增专辑示例（复制下面这行按需注释启用即可）：
        // { id: 'album-new', name: '新专辑名', description: '艺人 · N 首', trackIds: ['track-01','track-02'], colors: ['#667eea','#764ba2'] },
    ];

    // ==================== 播放器状态 ====================
    var STORAGE_KEY = 'soundtrack_player_settings';
    var STORAGE_KEY_BACKGROUNDS = 'soundtrack_track_backgrounds';
    var STORAGE_KEY_PLAYLISTS = 'soundtrack_playlists';

    // 导入歌曲的封面渐变色（循环取用）
    var CUSTOM_TRACK_COLORS = [
        ['#667eea', '#764ba2'], ['#f093fb', '#f5576c'], ['#4facfe', '#00c6fb'],
        ['#43e97b', '#38f9d7'], ['#fa709a', '#feb47b'], ['#5b73e8', '#30cfd0'],
        ['#f6d365', '#fda085'], ['#a18cd1', '#fbc2eb']
    ];

    // 播放器组件位置预设（控制 .stk-main 内内容的 flex 对齐）
    var LAYOUT_PRESETS = {
        'center':   { justify: 'center',     align: 'center' },
        'top':      { justify: 'flex-start', align: 'center' },
        'bottom':   { justify: 'flex-end',   align: 'center' },
        'left-top': { justify: 'flex-start', align: 'flex-start' },
        'left-mid': { justify: 'center',     align: 'flex-start' },
        'left-bot': { justify: 'flex-end',   align: 'flex-start' },
        'right-top':{ justify: 'flex-start', align: 'flex-end' },
        'right-mid':{ justify: 'center',     align: 'flex-end' },
        'right-bot':{ justify: 'flex-end',   align: 'flex-end' }
    };

    var state = {
        tracks: SOUNDTRACK_TRACKS,
        currentIndex: -1,
        isPlaying: false,
        playRequested: false,   // 是否处于"尝试播放"流程（用于区分预加载错误与播放错误）
        shuffle: false,
        repeat: 'off',          // 'off'（不循环） | 'all'（列表循环） | 'one'（单曲循环）
        volume: 0.8,
        muted: false,
        consecutiveErrors: 0,

        // 播放列表管理：playlists = [{ id, name, builtin?, tracks: [trackObj] }]
        // state.tracks 始终指向当前活动播放列表的曲目数组
        playlists: [],
        activePlaylistId: 'default',

        // 专辑浏览模式：右侧展示专辑网格、侧边栏先显示提示文本
        albumMode: false,
        selectedAlbumId: null,    // null 表示专辑列表总览；有值时显示该专辑曲目 + 返回按钮
        // 退出专辑浏览后需要恢复的原活动播放列表引用（避免污染用户自定义列表）
        _albumSavedPlaylistId: null,
        _albumSavedTracksRef: null,

        // 播放器设置模式（侧边栏设置菜单 + 右侧设置面板）
        settingsMode: false,
        settingsSection: null,   // null | 'background' | 'layout' | 'components'

        // 自定义背景：{ [trackId]: dataURL }
        backgrounds: {},
        // 折页/背景层展开状态：'closed' | 'centered'（hover 停在中心） | 'expanded'（完全展开覆盖）
        foldPhase: 'closed',
        // 持久化的展开标志（刷新后恢复）
        foldExpanded: false,

        // 侧边栏收起状态
        sidebarCollapsed: false,

        // 组件显隐（不可隐藏的：progress-area / controls / volume-area）
        components: {
            disc: true,       // 唱片
            songInfo: true    // 歌曲标题+艺人
        },

        // 底部播放控制条行为
        miniBar: {
            showAfterLeave: true   // 离开音乐播放器后始终显示底部控制条
        },

        // 播放样式（随音乐律动的可视化）：'none' | 'bars' | 'ripple' | 'wave'
        playStyle: 'none',

        // 组件布局：位置预设 + 整体缩放
        layout: {
            position: 'center',   // 对应 LAYOUT_PRESETS 的 key
            scale: 1              // 0.7 ~ 1.3
        }
    };

    var audio = null;
    var ui = {};
    var initialized = false;

    // ==================== 工具函数 ====================
    function formatTime(sec) {
        if (!sec || isNaN(sec) || sec < 0) return '0:00';
        var m = Math.floor(sec / 60);
        var s = Math.floor(sec % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function getTrack(index) {
        return (index >= 0 && index < state.tracks.length) ? state.tracks[index] : null;
    }

    function toastWarning(msg) {
        try {
            if (typeof window.showToastWarning === 'function') {
                window.showToastWarning(msg, '音乐播放器');
                return;
            }
            if (typeof window.showToast === 'function') {
                window.showToast({ type: 'warning', title: '音乐播放器', message: msg });
            }
        } catch (e) { /* 通知组件不可用时静默 */ }
    }

    function setStatus(text, isWarning) {
        if (!ui.status) return;
        ui.status.textContent = text || '';
        ui.status.style.color = isWarning ? '#e67e22' : '';
        ui.status.style.display = text ? 'block' : 'none';
    }

    function saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                volume: state.volume,
                muted: state.muted,
                shuffle: state.shuffle,
                repeat: state.repeat,
                lastIndex: state.currentIndex,
                layout: state.layout,
                foldExpanded: state.foldExpanded,
                sidebarCollapsed: state.sidebarCollapsed,
                components: state.components,
                miniBar: state.miniBar,
                playStyle: state.playStyle
            }));
        } catch (e) { /* 存储不可用时静默 */ }
    }

    function loadSettings() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            var s = JSON.parse(raw);
            if (typeof s.volume === 'number') state.volume = Math.min(1, Math.max(0, s.volume));
            if (typeof s.muted === 'boolean') state.muted = s.muted;
            if (typeof s.shuffle === 'boolean') state.shuffle = s.shuffle;
            if (s.repeat === 'off' || s.repeat === 'all' || s.repeat === 'one') state.repeat = s.repeat;
            if (typeof s.lastIndex === 'number' && s.lastIndex >= 0 && s.lastIndex < state.tracks.length) {
                state.currentIndex = s.lastIndex;
            }
            // 布局设置
            if (s.layout && typeof s.layout === 'object') {
                if (s.layout.position && LAYOUT_PRESETS[s.layout.position]) {
                    state.layout.position = s.layout.position;
                }
                if (typeof s.layout.scale === 'number' && s.layout.scale >= 0.6 && s.layout.scale <= 1.5) {
                    state.layout.scale = s.layout.scale;
                }
            }
            // 折页展开状态
            if (typeof s.foldExpanded === 'boolean') {
                state.foldExpanded = s.foldExpanded;
            }
            // 侧边栏收起状态
            if (typeof s.sidebarCollapsed === 'boolean') {
                state.sidebarCollapsed = s.sidebarCollapsed;
            }
            // 组件显隐
            if (s.components && typeof s.components === 'object') {
                if (typeof s.components.disc === 'boolean') state.components.disc = s.components.disc;
                if (typeof s.components.songInfo === 'boolean') state.components.songInfo = s.components.songInfo;
            }
            // 底部控制条行为
            if (s.miniBar && typeof s.miniBar === 'object' && typeof s.miniBar.showAfterLeave === 'boolean') {
                state.miniBar.showAfterLeave = s.miniBar.showAfterLeave;
            }
            // 播放样式（律动可视化）
            if (s.playStyle === 'none' || s.playStyle === 'bars' || s.playStyle === 'ripple' || s.playStyle === 'wave') {
                state.playStyle = s.playStyle;
            }
        } catch (e) { /* 配置损坏时使用默认值 */ }
    }

    // -------- 自定义背景（按曲目独立存储） --------
    function loadBackgrounds() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY_BACKGROUNDS);
            if (!raw) { state.backgrounds = {}; return; }
            var obj = JSON.parse(raw);
            state.backgrounds = (obj && typeof obj === 'object') ? obj : {};
        } catch (e) { state.backgrounds = {}; }
    }

    function saveBackgrounds() {
        try {
            localStorage.setItem(STORAGE_KEY_BACKGROUNDS, JSON.stringify(state.backgrounds));
        } catch (e) { /* 存储可能超限（背景图 base64 较大），静默失败 */
            toastWarning('背景图数据过大，无法保存。建议使用更小分辨率的图片。');
        }
    }

    function getTrackBackground(trackId) {
        return state.backgrounds[trackId] || null;
    }

    function setTrackBackground(trackId, dataURL) {
        state.backgrounds[trackId] = dataURL;
        saveBackgrounds();
    }

    function clearTrackBackground(trackId) {
        if (state.backgrounds[trackId] !== undefined) {
            delete state.backgrounds[trackId];
            saveBackgrounds();
        }
    }

    function readFileAsDataURL(file, maxSizeMB) {
        return new Promise(function (resolve, reject) {
            var limit = (maxSizeMB || 3) * 1024 * 1024;
            if (file.size > limit) {
                reject(new Error('图片超过 ' + maxSizeMB + 'MB 限制，请选择更小的图片。'));
                return;
            }
            var reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = function () { reject(new Error('图片读取失败')); };
            reader.readAsDataURL(file);
        });
    }

    // ==================== 播放列表管理 ====================
    function esc(str) {
        return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // -------- 导入音频的 IndexedDB 存储（音频二进制较大，不能放 localStorage） --------
    var audioDbPromise = null;
    function openAudioDb() {
        if (audioDbPromise) return audioDbPromise;
        audioDbPromise = new Promise(function (resolve, reject) {
            var req = indexedDB.open('soundtrackAudioStorage', 1);
            req.onupgradeneeded = function (e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains('audios')) {
                    db.createObjectStore('audios', { keyPath: 'id' });
                }
            };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        });
        return audioDbPromise;
    }
    function idbPutAudio(record) {
        return openAudioDb().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(['audios'], 'readwrite');
                tx.objectStore('audios').put(record);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        }).catch(function () { /* 存储不可用时仅保留会话内播放能力 */ });
    }
    function idbGetAudio(id) {
        return openAudioDb().then(function (db) {
            return new Promise(function (resolve, reject) {
                var rq = db.transaction(['audios'], 'readonly').objectStore('audios').get(id);
                rq.onsuccess = function () { resolve(rq.result || null); };
                rq.onerror = function () { reject(rq.error); };
            });
        }).catch(function () { return null; });
    }
    function idbDeleteAudio(id) {
        return openAudioDb().then(function (db) {
            return new Promise(function (resolve) {
                var tx = db.transaction(['audios'], 'readwrite');
                tx.objectStore('audios').delete(id);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { resolve(); };
            });
        }).catch(function () { });
    }

    // -------- 播放列表增删改查 --------
    function getPlaylistById(id) {
        for (var i = 0; i < state.playlists.length; i++) {
            if (state.playlists[i].id === id) return state.playlists[i];
        }
        return null;
    }

    function getActivePlaylist() {
        return getPlaylistById(state.activePlaylistId) || state.playlists[0];
    }

    function savePlaylists() {
        try {
            var custom = state.playlists.filter(function (p) { return !p.builtin; }).map(function (p) {
                return {
                    id: p.id,
                    name: p.name,
                    tracks: p.tracks.map(function (t) {
                        return { id: t.id, title: t.title, artist: t.artist, album: t.album || '', colors: t.colors, custom: true };
                    })
                };
            });
            localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify({
                activeId: state.activePlaylistId,
                playlists: custom
            }));
        } catch (e) { /* 存储不可用时静默 */ }
    }

    function loadPlaylists() {
        var def = { id: 'default', name: '播放列表', builtin: true, tracks: SOUNDTRACK_TRACKS };
        state.playlists = [def];
        state.activePlaylistId = 'default';
        try {
            var raw = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
            if (raw) {
                var data = JSON.parse(raw);
                if (data && Array.isArray(data.playlists)) {
                    data.playlists.forEach(function (p) {
                        if (!p || !p.id || !Array.isArray(p.tracks)) return;
                        state.playlists.push({
                            id: String(p.id),
                            name: String(p.name || '新建播放列表'),
                            tracks: p.tracks.map(function (t) {
                                return {
                                    id: String(t.id),
                                    title: String(t.title || '未知曲目'),
                                    artist: String(t.artist || '本地音乐'),
                                    album: String(t.album || ''),
                                    src: null, // 等 IndexedDB 恢复
                                    colors: (t.colors && t.colors.length === 2) ? t.colors : CUSTOM_TRACK_COLORS[0],
                                    custom: true
                                };
                            })
                        });
                    });
                }
                if (data.activeId && getPlaylistById(data.activeId)) {
                    state.activePlaylistId = data.activeId;
                }
            }
        } catch (e) { /* 配置损坏时仅使用默认列表 */ }
        state.tracks = getActivePlaylist().tracks;
    }

    // 刷新后从 IndexedDB 恢复导入歌曲的音频数据（Blob → ObjectURL）
    function restoreCustomAudio() {
        var jobs = [];
        state.playlists.forEach(function (pl) {
            pl.tracks.forEach(function (t) { if (t.custom) jobs.push(t); });
        });
        jobs.forEach(function (t) {
            idbGetAudio(t.id).then(function (rec) {
                if (!rec || !rec.blob) return;
                t.src = URL.createObjectURL(rec.blob);
                // 若该曲目正被选中但还没有音源，立即接上
                var cur = getTrack(state.currentIndex);
                if (cur === t && audio && !audio.src) audio.src = t.src;
            });
        });
    }

    function uniquePlaylistName(base) {
        var names = {};
        state.playlists.forEach(function (p) { names[p.name] = true; });
        if (!names[base]) return base;
        var n = 2;
        while (names[base + ' ' + n]) n++;
        return base + ' ' + n;
    }

    function createPlaylist() {
        var pl = {
            id: 'pl-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            name: uniquePlaylistName('新建播放列表'),
            tracks: []
        };
        state.playlists.push(pl);
        savePlaylists();
        switchPlaylist(pl.id);
        if (typeof window.showToastSuccess === 'function') {
            window.showToastSuccess('已新建并切换到播放列表「' + pl.name + '」', '音乐播放器');
        }
    }

    // 切换播放列表：暂停当前播放，活动曲目数组指向新列表
    function switchPlaylist(id) {
        var pl = getPlaylistById(id);
        if (!pl || id === state.activePlaylistId) return;
        if (audio) {
            audio.pause();
        }
        state.isPlaying = false;
        state.playRequested = false;
        state.activePlaylistId = pl.id;
        state.tracks = pl.tracks;
        state.currentIndex = -1;
        savePlaylists();
        renderTrackList();
        updatePlaylistHeader();
        updateImportBarVisibility();
        updatePlayUI();
        updateMiniBarVisibility();
    }

    function performDeletePlaylist(plId) {
        var pl = getPlaylistById(plId);
        if (!pl) return;
        if (pl.builtin) {
            toastWarning('内置播放列表不可删除');
            return;
        }
        var wasActive = pl.id === state.activePlaylistId;
        // 清理导入歌曲的音频数据
        pl.tracks.forEach(function (t) {
            if (t.custom) {
                idbDeleteAudio(t.id);
                if (t.src) { try { URL.revokeObjectURL(t.src); } catch (e) { } }
            }
        });
        state.playlists = state.playlists.filter(function (p) { return p.id !== plId; });
        if (wasActive) {
            switchPlaylist(state.playlists[0].id);
        } else {
            savePlaylists();
            renderDeleteSubmenu();
        }
        if (typeof window.showToastSuccess === 'function') {
            window.showToastSuccess('已删除播放列表「' + pl.name + '」', '音乐播放器');
        }
    }

    function renamePlaylist(plId, newName) {
        var pl = getPlaylistById(plId);
        if (!pl) return;
        var name = String(newName || '').trim();
        if (!name) return;
        pl.name = name;
        savePlaylists();
        if (plId === state.activePlaylistId) updatePlaylistHeader();
    }

    // -------- 导入本地音频 --------
    function isAudioFile(file) {
        return /^audio\//.test(file.type || '') || /\.(mp3|ogg|wav|flac|m4a|aac|opus|weba|webm)$/i.test(file.name || '');
    }

    function buildCustomTrack(file, colorIndex) {
        // 文件名解析：优先 "艺人 - 歌名" 格式
        var base = file.name.replace(/\.[^.]+$/, '');
        var artist = '本地音乐';
        var title = base;
        var dashIdx = base.indexOf(' - ');
        if (dashIdx > 0 && dashIdx < base.length - 3) {
            artist = base.slice(0, dashIdx).trim() || artist;
            title = base.slice(dashIdx + 3).trim() || base;
        }
        return {
            id: 'ctrack-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
            title: title,
            artist: artist,
            album: '',
            src: URL.createObjectURL(file),
            colors: CUSTOM_TRACK_COLORS[colorIndex % CUSTOM_TRACK_COLORS.length],
            custom: true
        };
    }

    function importAudioFiles(fileList) {
        var pl = getActivePlaylist();
        if (!pl) return;
        if (pl.builtin) {
            toastWarning('请先新建或切换到一个自定义播放列表后再导入歌曲');
            return;
        }
        var files = Array.prototype.slice.call(fileList || []).filter(isAudioFile);
        if (!files.length) {
            toastWarning('未选择有效的音频文件');
            return;
        }
        var startColor = pl.tracks.length;
        files.forEach(function (file, i) {
            var track = buildCustomTrack(file, startColor + i);
            pl.tracks.push(track);
            idbPutAudio({ id: track.id, blob: file });
        });
        savePlaylists();
        renderTrackList();
        updatePlaylistHeader();
        if (typeof window.showToastSuccess === 'function') {
            window.showToastSuccess('已导入 ' + files.length + ' 首歌曲到「' + pl.name + '」', '音乐播放器');
        }
    }

    // ==================== 样式注入（scoped：.stk-*） ====================
    function injectStyles() {
        if (document.getElementById('soundtrackPlayerStyles')) return;
        var style = document.createElement('style');
        style.id = 'soundtrackPlayerStyles';
        style.textContent = [
            '/* ===== 音乐播放器（soundtrack.js） ===== */',
            '#soundtrackArea { padding: 8px 12px; width: 100%; box-sizing: border-box; }',
            '.stk-player { width: 100%; display: flex; gap: 16px; height: calc(100vh - 130px); min-height: 580px; position: relative; }',

            /* 左侧播放列表 */
            '.stk-sidebar { width: 320px; flex-shrink: 0; background: #fff; border-radius: 18px; border: 1px solid #e8e8ee; box-shadow: 0 6px 24px rgba(0,0,0,0.07); display: flex; flex-direction: column; overflow: hidden; }',
            '.stk-sidebar-header { padding: 18px 20px; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, rgba(102,126,234,0.10) 0%, rgba(212,93,121,0.10) 100%); border-bottom: 1px solid rgba(102,126,234,0.12); }',
            '.stk-sidebar-header > i { font-size: 22px; color: #764ba2; }',
            '.stk-sidebar-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #2c2c3a; }',
            '.stk-sidebar-header p { margin: 2px 0 0; font-size: 12px; color: #999; }',
            '.stk-track-list { flex: 1; overflow-y: auto; padding: 10px; }',
            '.stk-track-list::-webkit-scrollbar { width: 6px; }',
            '.stk-track-list::-webkit-scrollbar-thumb { background: rgba(118,75,162,0.25); border-radius: 6px; }',
            '.stk-track-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 14px; cursor: pointer; transition: background 0.2s ease; }',
            '.stk-track-item:hover { background: rgba(102,126,234,0.08); }',
            '.stk-track-item.active { background: linear-gradient(135deg, rgba(102,126,234,0.14) 0%, rgba(212,93,121,0.14) 100%); }',
            '.stk-track-index { width: 22px; flex-shrink: 0; text-align: center; font-size: 13px; color: #aaa; }',
            '.stk-eq { display: none; align-items: flex-end; justify-content: center; gap: 2px; height: 14px; }',
            '.stk-eq i { width: 3px; border-radius: 2px; background: linear-gradient(180deg, #667eea, #d45d79); animation: stkEq 0.9s ease-in-out infinite; }',
            '.stk-eq i:nth-child(1) { height: 60%; animation-delay: -0.2s; }',
            '.stk-eq i:nth-child(2) { height: 100%; }',
            '.stk-eq i:nth-child(3) { height: 40%; animation-delay: -0.5s; }',
            '@keyframes stkEq { 0%,100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }',
            '.stk-track-item.active.playing .stk-num { display: none; }',
            '.stk-track-item.active.playing .stk-eq { display: flex; }',
            '.stk-track-cover { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; flex-shrink: 0; box-shadow: 0 3px 10px rgba(0,0,0,0.15); }',
            '.stk-track-meta { flex: 1; min-width: 0; }',
            '.stk-track-name { font-size: 14px; font-weight: 600; color: #2c2c3a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
            '.stk-track-singer { font-size: 12px; color: #999; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
            '.stk-track-time { font-size: 12px; color: #aaa; flex-shrink: 0; }',
            '.stk-sidebar-footer { padding: 12px 16px; border-top: 1px solid #eee; font-size: 11px; color: #a0a0b0; display: flex; gap: 8px; align-items: flex-start; line-height: 1.6; }',
            '.stk-sidebar-footer i { margin-top: 3px; color: #b0b0c0; }',

            /* 右侧主播放区 */
            '.stk-main { flex: 1; border-radius: 18px; background: #fff; border: 1px solid #e8e8ee; box-shadow: 0 6px 24px rgba(0,0,0,0.07); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 30px; position: relative; overflow: hidden; transition: align-items 0.35s ease, justify-content 0.35s ease; }',
            '.stk-content-wrap { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 100%; max-height: 100%; z-index: 4; transition: transform 0.35s cubic-bezier(0.3,0.0,0.2,1); transform-origin: center center; }',
            '.stk-main::before { content: ""; position: absolute; top: -32%; left: 50%; transform: translateX(-50%); width: 620px; height: 620px; border-radius: 50%; background: radial-gradient(circle, rgba(102,126,234,0.12) 0%, rgba(212,93,121,0.08) 40%, transparent 68%); pointer-events: none; z-index: 3; }',
            '.stk-disc { width: 230px; height: 230px; border-radius: 50%; position: relative; z-index: 1; background: radial-gradient(circle at center, #0a0a12 0 12%, transparent 12.6%), repeating-radial-gradient(circle at center, #262632 0 2px, #1b1b25 2px 4px); box-shadow: 0 18px 45px rgba(30,30,60,0.35), inset 0 0 0 8px rgba(255,255,255,0.04); animation: stkSpin 10s linear infinite; animation-play-state: paused; }',
            '.stk-disc.playing { animation-play-state: running; }',
            '.stk-disc-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 110px; height: 110px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.92); font-size: 30px; box-shadow: 0 0 0 6px rgba(0,0,0,0.25), 0 6px 18px rgba(0,0,0,0.4); }',
            '.stk-disc-hole { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 16px; height: 16px; border-radius: 50%; background: #0a0a12; box-shadow: inset 0 0 0 3px rgba(255,255,255,0.08); z-index: 2; }',
            '@keyframes stkSpin { to { transform: rotate(360deg); } }',
            '.stk-song-info { text-align: center; margin: 26px 0 18px; z-index: 1; max-width: 90%; }',
            '.stk-song-title { font-size: 22px; font-weight: 700; color: #2c2c3a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
            '.stk-song-artist { font-size: 14px; color: #999; margin: 6px 0 0; }',

            /* 进度条 */
            '.stk-progress-area { width: 100%; max-width: 560px; z-index: 1; }',
            '.stk-progress-bar { position: relative; height: 6px; border-radius: 6px; background: #e8e8f0; cursor: pointer; touch-action: none; }',
            '.stk-progress-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 6px; width: 0%; background: linear-gradient(90deg, #667eea, #d45d79); pointer-events: none; }',
            '.stk-progress-thumb { position: absolute; top: 50%; width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 3px solid #764ba2; transform: translate(-50%, -50%); left: 0%; box-shadow: 0 2px 6px rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.2s; pointer-events: none; }',
            '.stk-progress-bar:hover .stk-progress-thumb, .stk-progress-bar.dragging .stk-progress-thumb { opacity: 1; }',
            '.stk-time-row { display: flex; justify-content: space-between; font-size: 12px; color: #aaa; margin-top: 8px; }',

            /* 控制按钮 */
            '.stk-controls { display: flex; align-items: center; gap: 22px; margin-top: 24px; z-index: 1; }',
            '.stk-btn { border: none; background: transparent; cursor: pointer; color: #8a8a9a; font-size: 18px; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; padding: 0; }',
            '.stk-btn:hover { color: #667eea; background: rgba(102,126,234,0.1); transform: scale(1.08); }',
            '.stk-btn.active { color: #764ba2; }',
            '.stk-btn.active::after { content: ""; position: absolute; bottom: 2px; width: 4px; height: 4px; border-radius: 50%; background: #d45d79; }',
            '.stk-btn { position: relative; }',
            '/* 单曲循环：fa-repeat + 右上角 "1" 角标 */',
            '.stk-btn.stk-btn-repeat-one::before { content: "1"; position: absolute; top: 0px; right: 2px; font-size: 9px; font-weight: 800; line-height: 11px; width: 11px; height: 11px; border-radius: 50%; background: linear-gradient(135deg, #764ba2, #d45d79); color: #fff; display: flex; align-items: center; justify-content: center; z-index: 2; }',
            '.stk-btn-play { width: 64px; height: 64px; font-size: 24px; color: #fff; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #d45d79 100%); box-shadow: 0 8px 22px rgba(118,75,162,0.4); }',
            '.stk-btn-play:hover { color: #fff; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #d45d79 100%); transform: scale(1.06); }',
            '.stk-btn-play::after { display: none; }',

            /* 音量 */
            '.stk-volume-area { display: flex; align-items: center; gap: 10px; margin-top: 22px; z-index: 1; }',
            '.stk-volume-slider { -webkit-appearance: none; appearance: none; width: 140px; height: 5px; border-radius: 5px; background: linear-gradient(90deg, #667eea var(--vol, 80%), #e8e8f0 var(--vol, 80%)); outline: none; cursor: pointer; margin: 0; }',
            '.stk-volume-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 3px solid #764ba2; box-shadow: 0 2px 6px rgba(0,0,0,0.2); cursor: pointer; }',
            '.stk-volume-slider::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 3px solid #764ba2; cursor: pointer; }',
            '.stk-status { margin-top: 14px; font-size: 12px; min-height: 16px; z-index: 1; text-align: center; display: none; }',

            /* 暗色模式 */
            'body.dark-mode .stk-sidebar, body.dark-mode .stk-main { background: #1e1e2c; border-color: rgba(255,255,255,0.08); box-shadow: 0 6px 24px rgba(0,0,0,0.35); }',
            'body.dark-mode .stk-sidebar-header { background: linear-gradient(135deg, rgba(102,126,234,0.18) 0%, rgba(212,93,121,0.18) 100%); border-bottom-color: rgba(255,255,255,0.08); }',
            'body.dark-mode .stk-sidebar-header h3 { color: #eee; }',
            'body.dark-mode .stk-sidebar-header p { color: #888; }',
            'body.dark-mode .stk-track-item:hover { background: rgba(255,255,255,0.06); }',
            'body.dark-mode .stk-track-item.active { background: linear-gradient(135deg, rgba(102,126,234,0.25) 0%, rgba(212,93,121,0.25) 100%); }',
            'body.dark-mode .stk-track-name { color: #f0f0f5; }',
            'body.dark-mode .stk-track-singer, body.dark-mode .stk-song-artist { color: #888; }',
            'body.dark-mode .stk-track-time, body.dark-mode .stk-time-row, body.dark-mode .stk-track-index { color: #777; }',
            'body.dark-mode .stk-sidebar-footer { border-top-color: rgba(255,255,255,0.08); color: #777; }',
            'body.dark-mode .stk-song-title { color: #f0f0f5; }',
            'body.dark-mode .stk-progress-bar { background: rgba(255,255,255,0.12); }',
            'body.dark-mode .stk-btn { color: #9a9ab0; }',
            'body.dark-mode .stk-btn:hover { background: rgba(255,255,255,0.08); }',
            'body.dark-mode .stk-volume-slider { background: linear-gradient(90deg, #667eea var(--vol, 80%), rgba(255,255,255,0.14) var(--vol, 80%)); }',

            /* ===== 组件显隐 ===== */
            '.stk-main.hide-disc .stk-disc { display: none !important; }',
            '.stk-main.hide-songInfo .stk-song-info { display: none !important; }',
            '.stk-main.hide-disc .stk-song-info { margin-top: 0; }',

            /* ===== 侧边栏折叠 ===== */
            '.stk-player.sidebar-collapsed .stk-sidebar { width: 0; min-width: 0; max-width: 0; overflow: hidden; border: none; padding: 0; opacity: 0; transition: all 0.35s ease; }',
            '.stk-player .stk-sidebar { transition: width 0.35s ease, opacity 0.3s ease; }',
            '.stk-expand-sidebar-btn { position: absolute; top: 14px; left: 14px; z-index: 6; width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.92); backdrop-filter: blur(8px); color: #764ba2; cursor: pointer; display: none; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); transition: all 0.2s ease; }',
            '.stk-expand-sidebar-btn:hover { background: #fff; color: #667eea; transform: scale(1.05); }',
            '.stk-player.sidebar-collapsed .stk-expand-sidebar-btn { display: flex; }',
            '.stk-collapse-sidebar-btn { margin-left: auto; width: 28px; height: 28px; border-radius: 50%; border: none; background: rgba(118,75,162,0.08); color: #764ba2; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.2s ease; flex-shrink: 0; }',
            '.stk-collapse-sidebar-btn:hover { background: rgba(118,75,162,0.2); color: #d45d79; }',
            'body.dark-mode .stk-expand-sidebar-btn { background: rgba(30,30,44,0.92); border-color: rgba(255,255,255,0.1); color: #9a9ab0; }',
            'body.dark-mode .stk-expand-sidebar-btn:hover { background: #1e1e2c; color: #d45d79; }',
            'body.dark-mode .stk-collapse-sidebar-btn { background: rgba(118,75,162,0.18); color: #d45d79; }',

            /* 响应式 */
            '@media (max-width: 960px) {',
            '  .stk-player { flex-direction: column; height: auto; min-height: 0; }',
            '  .stk-sidebar { width: 100%; max-height: 320px; }',
            '  .stk-main { padding: 30px 20px; }',
            '  .stk-disc { width: 180px; height: 180px; }',
            '  .stk-disc-label { width: 88px; height: 88px; font-size: 24px; }',
            '}',

            /* ===== 自定义背景：背景层 ===== */
            '.stk-bg-layer { position: absolute; inset: 0; z-index: 1; background-size: cover; background-position: center center; background-repeat: no-repeat; opacity: 0; transition: opacity 0.55s ease; pointer-events: none; }',
            '.stk-bg-overlay { position: absolute; inset: 0; z-index: 2; pointer-events: none; background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.0) 25%, rgba(0,0,0,0.18) 100%); opacity: 0; transition: opacity 0.55s ease; }',
            '.stk-main.fold-hover .stk-bg-layer { opacity: 0.18; }',
            '.stk-main.fold-hover .stk-bg-overlay { opacity: 1; }',
            '.stk-main.fold-expanded .stk-bg-layer { opacity: 1; }',
            '.stk-main.fold-expanded .stk-bg-overlay { opacity: 1; }',

            /* z-index 层级说明（从低到高）：
               1. .stk-main 背景（白色卡片）
               2. .stk-bg-layer (z:1) — 自定义背景图（展开/悬浮时显示）
               3. .stk-bg-overlay (z:2) — 背景图上的渐变蒙层
               4. .stk-main::before (z:3) — 装饰性径向光晕
               5. .stk-content-wrap (z:4) — 播放器内容（disc + 文字 + 控件）
               6. .stk-fold-hitzone (z:4) — 右下角折页按钮
               7. .stk-settings-panel (z:6) — 设置模式下的右侧面板
            */

            /* 内容元素始终可见 */
            '.stk-disc, .stk-song-info, .stk-progress-area, .stk-controls, .stk-volume-area, .stk-status { z-index: 5 !important; }',

            /* ===== 展开/悬浮状态下：组件半透明蒙层 + 自适应亮色文字 ===== */
            /* 注意：不使用 backdrop-filter，因为 content-wrap 的 transform 会创建 stacking context，
               导致 backdrop-filter 无法模糊到外部的背景层。改用半透明 rgba 背景保证对比度。 */
            '.stk-main.fold-expanded .stk-song-info,',
            '.stk-main.fold-hover .stk-song-info { background: rgba(0,0,0,0.35); border-radius: 18px; padding: 16px 28px; margin: 26px 0 18px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); }',
            '.stk-main.fold-expanded .stk-song-title,',
            '.stk-main.fold-hover .stk-song-title { color: #fff !important; text-shadow: 0 1px 6px rgba(0,0,0,0.4); }',
            '.stk-main.fold-expanded .stk-song-artist,',
            '.stk-main.fold-hover .stk-song-artist { color: rgba(255,255,255,0.85) !important; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }',

            '.stk-main.fold-expanded .stk-progress-area,',
            '.stk-main.fold-hover .stk-progress-area { background: rgba(0,0,0,0.35); border-radius: 16px; padding: 14px 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); }',
            '.stk-main.fold-expanded .stk-time-row,',
            '.stk-main.fold-hover .stk-time-row { color: rgba(255,255,255,0.9) !important; text-shadow: 0 1px 3px rgba(0,0,0,0.3); }',
            '.stk-main.fold-expanded .stk-progress-bar,',
            '.stk-main.fold-hover .stk-progress-bar { background: rgba(255,255,255,0.25); }',

            '.stk-main.fold-expanded .stk-controls,',
            '.stk-main.fold-hover .stk-controls { background: rgba(0,0,0,0.35); border-radius: 32px; padding: 10px 18px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); }',
            '.stk-main.fold-expanded .stk-btn:not(.stk-btn-play),',
            '.stk-main.fold-hover .stk-btn:not(.stk-btn-play) { color: rgba(255,255,255,0.95); text-shadow: 0 1px 4px rgba(0,0,0,0.4); }',
            '.stk-main.fold-expanded .stk-btn:not(.stk-btn-play):hover,',
            '.stk-main.fold-hover .stk-btn:not(.stk-btn-play):hover { color: #fff; background: rgba(255,255,255,0.2); }',
            '.stk-main.fold-expanded .stk-btn.active:not(.stk-btn-play),',
            '.stk-main.fold-hover .stk-btn.active:not(.stk-btn-play) { color: #f8c471; }',

            '.stk-main.fold-expanded .stk-volume-area,',
            '.stk-main.fold-hover .stk-volume-area { background: rgba(0,0,0,0.35); border-radius: 32px; padding: 8px 18px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); }',
            '.stk-main.fold-expanded .stk-btn-play,',
            '.stk-main.fold-hover .stk-btn-play { box-shadow: 0 8px 28px rgba(0,0,0,0.55); }',
            '.stk-main.fold-expanded .stk-volume-slider,',
            '.stk-main.fold-hover .stk-volume-slider { background: linear-gradient(90deg, #667eea var(--vol, 80%), rgba(255,255,255,0.28) var(--vol, 80%)) !important; }',

            /*（原右上角设置按钮已迁移至侧边栏标题文本右侧） */

            /* ===== 折页按钮（固定右下角，永不移动） ===== */
            '.stk-fold-hitzone { position: absolute; right: 0; bottom: 0; width: 90px; height: 90px; z-index: 4; cursor: pointer; pointer-events: auto; }',
            '.stk-fold-hitzone.hide-hit { pointer-events: none; }',

            '.stk-fold { position: absolute; right: 0; bottom: 0; width: 72px; height: 72px; z-index: 4; pointer-events: none; clip-path: polygon(100% 0, 100% 100%, 0 100%); background: linear-gradient(135deg, #667eea 0%, #764ba2 60%, #d45d79 100%); transition: opacity 0.4s ease; filter: drop-shadow(-3px -3px 8px rgba(102,126,234,0.35)); }',
            '.stk-fold::after { content: ""; position: absolute; right: 0; bottom: 0; width: 42px; height: 42px; clip-path: polygon(100% 100%, 100% 0, 0 100%); background: rgba(255,255,255,0.92); transform-origin: bottom right; transform: scale(0,0); transition: transform 0.5s cubic-bezier(0.35,0.0,0.2,1); }',
            '.stk-fold-hitzone:hover .stk-fold::after { transform: scale(1,1); }',
            '.stk-fold-icon { position: absolute; right: 12px; bottom: 12px; color: rgba(255,255,255,0.95); font-size: 14px; pointer-events: none; }',
            '.stk-main.fold-expanded .stk-fold { opacity: 0.85; filter: drop-shadow(-3px -3px 10px rgba(118,75,162,0.6)); }',
            '.stk-main.fold-expanded .stk-fold-icon { color: #fff; }',

            /* 暗色模式下折页配色 */
            'body.dark-mode .stk-fold { background: linear-gradient(135deg, #764ba2 0%, #8e44ad 60%, #d45d79 100%); filter: drop-shadow(-3px -3px 8px rgba(118,75,162,0.45)); }',
            'body.dark-mode .stk-fold::after { background: rgba(30,30,44,0.92); }',

            /*（原设置弹窗已移除，设置功能迁移至侧边栏"播放器设置"模式与右侧设置面板） */

            /* 背景图预览区（现用于右侧设置面板） */
            '.stk-bg-preview { width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; border: 2px dashed rgba(102,126,234,0.25); background: #f8f8fb; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; margin-bottom: 14px; }',
            '.stk-bg-preview-img { width: 100%; height: 100%; object-fit: cover; display: none; }',
            '.stk-bg-preview.has-image .stk-bg-preview-img { display: block; }',
            '.stk-bg-preview.has-image .stk-bg-preview-empty { display: none; }',
            '.stk-bg-preview-empty { text-align: center; color: #aaa; font-size: 12px; line-height: 1.7; }',
            '.stk-bg-preview-empty i { font-size: 28px; color: #c8c8d8; margin-bottom: 6px; }',
            '.stk-bg-file-row { display: flex; gap: 10px; align-items: center; }',
            '.stk-bg-file-input { display: none; }',
            '.stk-bg-choose-btn { flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(102,126,234,0.3); background: linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08)); cursor: pointer; font-size: 13px; color: #555; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease; }',
            '.stk-bg-choose-btn:hover { border-color: #667eea; color: #667eea; background: linear-gradient(135deg, rgba(102,126,234,0.14), rgba(118,75,162,0.14)); }',
            '.stk-bg-clear-btn { padding: 10px 14px; border-radius: 10px; border: 1px solid #f5c6c3; background: #fef7f6; color: #e64c3c; font-size: 13px; cursor: pointer; transition: all 0.2s ease; }',
            '.stk-bg-clear-btn:hover { background: #fdecea; }',
            '.stk-bg-clear-btn:disabled { opacity: 0.45; cursor: not-allowed; }',
            '.stk-bg-hint { margin-top: 12px; font-size: 11px; color: #999; line-height: 1.7; padding: 10px 12px; background: #f8f8fb; border-radius: 8px; border-left: 3px solid rgba(102,126,234,0.3); }',

            'body.dark-mode .stk-bg-preview { background: rgba(255,255,255,0.04); border-color: rgba(118,75,162,0.25); }',
            'body.dark-mode .stk-bg-choose-btn { background: rgba(118,75,162,0.12); border-color: rgba(118,75,162,0.3); color: #bbb; }',
            'body.dark-mode .stk-bg-choose-btn:hover { color: #d45d79; border-color: #764ba2; background: rgba(118,75,162,0.22); }',
            'body.dark-mode .stk-bg-hint { background: rgba(255,255,255,0.04); color: #aaa; border-left-color: #764ba2; }',

            /* 布局设置区（现用于右侧设置面板） */
            '.stk-layout-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 14px; }',
            '.stk-layout-grid > button { border: 1px solid #e0e0ea; background: #fafafe; border-radius: 10px; padding: 10px 6px; font-size: 12px; color: #555; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; gap: 4px; }',
            '.stk-layout-grid > button i { font-size: 14px; }',
            '.stk-layout-grid > button:hover { border-color: #667eea; color: #667eea; background: rgba(102,126,234,0.06); }',
            '.stk-layout-grid > button.active { border-color: #667eea; color: #fff; background: linear-gradient(135deg, #667eea, #764ba2); box-shadow: 0 2px 8px rgba(118,75,162,0.3); }',
            '.stk-layout-scale-row { display: flex; align-items: center; gap: 12px; }',
            '.stk-layout-scale-row label { font-size: 12px; color: #666; white-space: nowrap; }',
            '.stk-layout-scale-row input[type="range"] { flex: 1; -webkit-appearance: none; appearance: none; height: 5px; border-radius: 5px; background: linear-gradient(90deg, #667eea var(--lv, 50%), #e8e8f0 var(--lv, 50%)); outline: none; cursor: pointer; }',
            '.stk-layout-scale-row input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 3px solid #764ba2; box-shadow: 0 2px 6px rgba(0,0,0,0.15); cursor: pointer; }',
            '.stk-layout-scale-val { font-size: 12px; color: #666; min-width: 48px; text-align: right; font-weight: 600; }',
            '.stk-layout-reset { margin-top: 12px; padding: 8px 14px; border-radius: 8px; border: 1px solid #e0e0ea; background: #fafafe; font-size: 12px; color: #888; cursor: pointer; width: 100%; transition: all 0.2s ease; }',
            '.stk-layout-reset:hover { border-color: #667eea; color: #667eea; background: rgba(102,126,234,0.06); }',

            'body.dark-mode .stk-layout-grid > button { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: #aaa; }',
            'body.dark-mode .stk-layout-grid > button:hover { border-color: #764ba2; color: #d45d79; background: rgba(118,75,162,0.12); }',
            'body.dark-mode .stk-layout-scale-row label { color: #aaa; }',
            'body.dark-mode .stk-layout-scale-row input[type="range"] { background: linear-gradient(90deg, #667eea var(--lv, 50%), rgba(255,255,255,0.14) var(--lv, 50%)); }',
            'body.dark-mode .stk-layout-scale-val { color: #bbb; }',
            'body.dark-mode .stk-layout-reset { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: #aaa; }',

            /* 组件显隐 toggle 开关 */
            '.stk-comp-toggle-row { display: flex; flex-direction: column; gap: 10px; }',
            '.stk-comp-toggle { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 12px; background: #fafafe; border: 1px solid #eee; cursor: pointer; user-select: none; transition: all 0.2s ease; }',
            '.stk-comp-toggle:hover { background: rgba(102,126,234,0.06); border-color: rgba(102,126,234,0.25); }',
            '.stk-comp-toggle input { display: none; }',
            '.stk-comp-switch { position: relative; width: 40px; height: 22px; border-radius: 11px; background: #d0d0dc; transition: background 0.25s ease; flex-shrink: 0; }',
            '.stk-comp-switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); transition: transform 0.25s ease; }',
            '.stk-comp-toggle input:checked + .stk-comp-switch { background: linear-gradient(135deg, #667eea, #764ba2); }',
            '.stk-comp-toggle input:checked + .stk-comp-switch::after { transform: translateX(18px); }',
            '.stk-comp-label { font-size: 13px; color: #444; display: flex; align-items: center; gap: 8px; font-weight: 500; }',
            '.stk-comp-label i { color: #764ba2; font-size: 13px; }',
            '.stk-comp-hint { margin-top: 12px; font-size: 11px; color: #999; background: rgba(255,193,7,0.08); padding: 8px 12px; border-radius: 8px; border-left: 2px solid #f39c12; line-height: 1.6; }',
            '.stk-comp-hint i { color: #f39c12; margin-right: 4px; }',
            'body.dark-mode .stk-comp-toggle { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); }',
            'body.dark-mode .stk-comp-toggle:hover { background: rgba(102,126,234,0.12); border-color: rgba(102,126,234,0.25); }',
            'body.dark-mode .stk-comp-label { color: #ddd; }',
            'body.dark-mode .stk-comp-hint { background: rgba(243,156,18,0.12); color: #bbb; }',

            /* ===== 侧边栏头部：设置入口（位于标题文本右侧） ===== */
            '.stk-header-settings-btn { width: 28px; height: 28px; border-radius: 50%; border: none; background: rgba(118,75,162,0.08); color: #764ba2; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.25s ease; flex-shrink: 0; }',
            '.stk-header-settings-btn:hover { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; transform: rotate(60deg) scale(1.08); box-shadow: 0 3px 10px rgba(118,75,162,0.35); }',
            'body.dark-mode .stk-header-settings-btn { background: rgba(118,75,162,0.18); color: #d45d79; }',
            'body.dark-mode .stk-header-settings-btn:hover { color: #fff; }',

            /* 返回按钮（设置模式下显示在标题左侧） */
            '.stk-back-btn { display: none; width: 28px; height: 28px; border-radius: 50%; border: none; background: rgba(118,75,162,0.08); color: #764ba2; cursor: pointer; align-items: center; justify-content: center; font-size: 12px; transition: all 0.2s ease; flex-shrink: 0; }',
            '.stk-back-btn:hover { background: rgba(118,75,162,0.2); color: #d45d79; transform: translateX(-2px); }',
            '.stk-player.settings-mode .stk-back-btn { display: flex; }',
            '.stk-player.settings-mode .stk-sidebar-icon { display: none; }',
            '.stk-player.settings-mode .stk-header-settings-btn { display: none; }',
            'body.dark-mode .stk-back-btn { background: rgba(118,75,162,0.18); color: #d45d79; }',

            /* ===== 头部"更多"按钮（位于设置按钮左侧） ===== */
            '.stk-header-more-btn { width: 28px; height: 28px; border-radius: 50%; border: none; background: rgba(118,75,162,0.08); color: #764ba2; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.25s ease; flex-shrink: 0; }',
            '.stk-header-more-btn:hover { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; transform: scale(1.08); box-shadow: 0 3px 10px rgba(118,75,162,0.35); }',
            'body.dark-mode .stk-header-more-btn { background: rgba(118,75,162,0.18); color: #d45d79; }',
            'body.dark-mode .stk-header-more-btn:hover { color: #fff; }',
            '.stk-player.settings-mode .stk-header-more-btn { display: none; }',

            /* ===== 播放列表标题可点击 ===== */
            '#stkSidebarTitle { cursor: pointer; transition: color 0.2s ease; user-select: none; }',
            '#stkSidebarTitle:hover { color: #764ba2; }',
            '.stk-title-caret { font-size: 11px; color: #a0a0b0; margin-left: 5px; transition: transform 0.2s ease; }',
            '#stkSidebarTitle:hover .stk-title-caret { color: #764ba2; transform: translateY(1px); }',

            /* ===== 导入歌曲栏 ===== */
            '.stk-import-bar { display: none; padding: 10px 14px; border-bottom: 1px dashed rgba(118,75,162,0.25); }',
            '.stk-import-bar.show { display: block; }',
            '.stk-import-btn { width: 100%; border: none; border-radius: 10px; padding: 9px 12px; font-size: 12.5px; font-weight: 600; font-family: inherit; cursor: pointer; color: #fff; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(118,75,162,0.25); }',
            '.stk-import-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(118,75,162,0.38); filter: brightness(1.05); }',
            '.stk-import-btn:active { transform: translateY(0); }',
            '.stk-player.settings-mode .stk-import-bar { display: none !important; }',
            'body.dark-mode .stk-import-bar { border-bottom-color: rgba(255,255,255,0.1); }',

            /* ===== 空播放列表提示 ===== */
            '.stk-empty-hint { min-height: 200px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 4px; padding: 30px 16px; }',
            '.stk-empty-hint > i { font-size: 34px; color: #d8d8e4; margin-bottom: 8px; }',
            '.stk-empty-hint p { margin: 0; font-size: 13px; font-weight: 600; color: #8a8a9a; }',
            '.stk-empty-hint span { font-size: 11.5px; color: #b0b0c0; }',
            'body.dark-mode .stk-empty-hint > i { color: #3c3c50; }',
            'body.dark-mode .stk-empty-hint p { color: #999; }',
            'body.dark-mode .stk-empty-hint span { color: #777; }',

            /* ===== 下拉菜单（多级） ===== */
            '.stk-drop-menu { position: fixed; z-index: 99990; min-width: 210px; max-width: 320px; background: #fff; border-radius: 14px; border: 1px solid #e8e8ee; box-shadow: 0 12px 36px rgba(0,0,0,0.16); padding: 6px; display: none; animation: stkDropIn 0.16s ease; }',
            '.stk-drop-menu.open { display: block; }',
            '@keyframes stkDropIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }',
            '.stk-drop-item { display: flex; align-items: center; gap: 9px; padding: 9px 11px; border-radius: 9px; font-size: 13px; color: #2c2c3a; cursor: pointer; position: relative; white-space: nowrap; transition: background 0.15s ease; }',
            '.stk-drop-item:hover { background: rgba(102,126,234,0.09); }',
            '.stk-drop-item > i:first-child { width: 15px; text-align: center; color: #764ba2; font-size: 12.5px; flex-shrink: 0; }',
            '.stk-drop-item.active { background: rgba(102,126,234,0.12); }',
            '.stk-drop-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }',
            '.stk-drop-hint { font-size: 10.5px; color: #b0b0c0; flex-shrink: 0; }',
            '.stk-drop-item.danger { color: #d63031; }',
            '.stk-drop-item.danger > i:first-child { color: #d63031; }',
            '.stk-drop-item.danger:hover { background: rgba(214,48,49,0.08); }',
            '.stk-drop-item.disabled { color: #b0b0c0; cursor: not-allowed; }',
            '.stk-drop-item.disabled > i:first-child { color: #c5c5d0; }',
            '.stk-drop-item.disabled:hover { background: transparent; }',
            '.stk-sub-chevron { font-size: 10px; color: #a0a0b0; margin-left: auto; flex-shrink: 0; }',
            '.stk-drop-sep { height: 1px; background: #ececf2; margin: 5px 8px; }',

            /* 二级子菜单：删除播放列表 */
            '.stk-submenu { display: none; position: absolute; left: calc(100% + 6px); top: -7px; min-width: 200px; max-height: 264px; overflow-y: auto; background: #fff; border-radius: 14px; border: 1px solid #e8e8ee; box-shadow: 0 12px 36px rgba(0,0,0,0.16); padding: 6px; }',
            '.stk-submenu::-webkit-scrollbar { width: 6px; }',
            '.stk-submenu::-webkit-scrollbar-thumb { background: rgba(118,75,162,0.25); border-radius: 6px; }',
            '.stk-drop-item.has-sub:hover .stk-submenu, .stk-drop-item.sub-open .stk-submenu { display: block; }',

            /* 播放列表切换菜单：选中标记 + 重命名按钮 */
            '.stk-pl-check { width: 15px; text-align: center; color: #764ba2; font-size: 11px; flex-shrink: 0; }',
            '.stk-pl-rename-btn { border: none; background: transparent; color: #a0a0b0; width: 24px; height: 24px; border-radius: 6px; cursor: pointer; font-size: 11px; flex-shrink: 0; opacity: 0; transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; }',
            '.stk-drop-item:hover .stk-pl-rename-btn { opacity: 1; }',
            '.stk-pl-rename-btn:hover { background: rgba(118,75,162,0.12); color: #764ba2; }',

            /* 行内重命名输入行 */
            '.stk-rename-row { display: flex; align-items: center; gap: 6px; width: 100%; }',
            '.stk-rename-input { flex: 1; min-width: 0; border: 1px solid rgba(118,75,162,0.4); border-radius: 8px; padding: 6px 9px; font-size: 12.5px; font-family: inherit; outline: none; color: #2c2c3a; background: #fff; }',
            '.stk-rename-input:focus { border-color: #764ba2; box-shadow: 0 0 0 2px rgba(118,75,162,0.15); }',
            '.stk-rename-btn { border: none; width: 26px; height: 26px; border-radius: 7px; cursor: pointer; font-size: 11px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease; }',
            '.stk-rename-btn.ok { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }',
            '.stk-rename-btn.ok:hover { filter: brightness(1.08); }',
            '.stk-rename-btn.cancel { background: rgba(0,0,0,0.06); color: #888; }',
            '.stk-rename-btn.cancel:hover { background: rgba(0,0,0,0.12); }',

            /* ===== 删除确认弹窗 ===== */
            '.stk-confirm-mask { position: fixed; inset: 0; z-index: 99995; background: rgba(20,16,40,0.45); backdrop-filter: blur(3px); display: none; align-items: center; justify-content: center; padding: 20px; }',
            '.stk-confirm-mask.show { display: flex; animation: stkFadeIn 0.18s ease; }',
            '@keyframes stkFadeIn { from { opacity: 0; } to { opacity: 1; } }',
            '.stk-confirm-box { width: 350px; max-width: 100%; background: #fff; border-radius: 18px; padding: 26px 24px 20px; text-align: center; animation: stkPopIn 0.2s ease; box-shadow: 0 24px 60px rgba(0,0,0,0.3); }',
            '@keyframes stkPopIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }',
            '.stk-confirm-icon { width: 52px; height: 52px; margin: 0 auto 12px; border-radius: 50%; background: rgba(214,48,49,0.1); color: #d63031; font-size: 20px; display: flex; align-items: center; justify-content: center; }',
            '.stk-confirm-box h4 { margin: 0 0 8px; font-size: 16px; color: #2c2c3a; }',
            '.stk-confirm-box p { margin: 0 0 18px; font-size: 12.5px; color: #8a8a9a; line-height: 1.6; word-break: break-all; }',
            '.stk-confirm-actions { display: flex; gap: 10px; }',
            '.stk-confirm-actions button { flex: 1; border: none; border-radius: 10px; padding: 10px 0; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s ease; }',
            '#stkConfirmCancel { background: rgba(0,0,0,0.06); color: #666; }',
            '#stkConfirmCancel:hover { background: rgba(0,0,0,0.12); }',
            '#stkConfirmOk { background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff; box-shadow: 0 4px 12px rgba(231,76,60,0.3); }',
            '#stkConfirmOk:hover { filter: brightness(1.06); }',

            /* 下拉菜单与弹窗暗色模式 */
            'body.dark-mode .stk-drop-menu { background: #262636; border-color: rgba(255,255,255,0.1); box-shadow: 0 12px 36px rgba(0,0,0,0.5); }',
            'body.dark-mode .stk-drop-item { color: #e8e8f0; }',
            'body.dark-mode .stk-drop-item > i:first-child { color: #b39ddb; }',
            'body.dark-mode .stk-drop-item:hover { background: rgba(255,255,255,0.07); }',
            'body.dark-mode .stk-drop-item.active { background: rgba(102,126,234,0.28); }',
            'body.dark-mode .stk-drop-item.danger { color: #ff7675; }',
            'body.dark-mode .stk-drop-item.danger > i:first-child { color: #ff7675; }',
            'body.dark-mode .stk-drop-item.danger:hover { background: rgba(255,118,117,0.12); }',
            'body.dark-mode .stk-drop-item.disabled { color: #666; }',
            'body.dark-mode .stk-drop-sep { background: rgba(255,255,255,0.08); }',
            'body.dark-mode .stk-submenu { background: #262636; border-color: rgba(255,255,255,0.1); box-shadow: 0 12px 36px rgba(0,0,0,0.5); }',
            'body.dark-mode .stk-pl-check { color: #b39ddb; }',
            'body.dark-mode .stk-pl-rename-btn:hover { background: rgba(179,157,219,0.18); color: #d45d79; }',
            'body.dark-mode .stk-rename-input { background: #1e1e2c; border-color: rgba(179,157,219,0.4); color: #f0f0f5; }',
            'body.dark-mode .stk-rename-btn.cancel { background: rgba(255,255,255,0.08); color: #aaa; }',
            'body.dark-mode .stk-confirm-box { background: #262636; }',
            'body.dark-mode .stk-confirm-box h4 { color: #f0f0f5; }',
            'body.dark-mode .stk-confirm-box p { color: #999; }',
            'body.dark-mode #stkConfirmCancel { background: rgba(255,255,255,0.08); color: #bbb; }',
            'body.dark-mode #stkConfirmCancel:hover { background: rgba(255,255,255,0.14); }',

            /* ===== 侧边栏：播放器设置条目菜单 ===== */
            '.stk-settings-menu { flex: 1; overflow-y: auto; padding: 10px; display: none; flex-direction: column; gap: 6px; }',
            '.stk-settings-menu::-webkit-scrollbar { width: 6px; }',
            '.stk-settings-menu::-webkit-scrollbar-thumb { background: rgba(118,75,162,0.25); border-radius: 6px; }',
            '.stk-player.settings-mode .stk-settings-menu { display: flex; }',
            '.stk-player.settings-mode .stk-track-list { display: none; }',
            '.stk-player.settings-mode .stk-sidebar-footer { display: none; }',
            '.stk-settings-entry { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s ease; }',
            '.stk-settings-entry:hover { background: rgba(102,126,234,0.08); }',
            '.stk-settings-entry.active { background: linear-gradient(135deg, rgba(102,126,234,0.14) 0%, rgba(212,93,121,0.14) 100%); border-color: rgba(102,126,234,0.22); }',
            '.stk-settings-entry-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 15px; flex-shrink: 0; box-shadow: 0 3px 10px rgba(0,0,0,0.12); }',
            '.stk-settings-entry-text { flex: 1; min-width: 0; }',
            '.stk-settings-entry-label { font-size: 13.5px; font-weight: 600; color: #2c2c3a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
            '.stk-settings-entry-desc { font-size: 11.5px; color: #999; margin-top: 2px; }',
            '.stk-settings-entry-chevron { color: #c0c0cc; font-size: 12px; flex-shrink: 0; }',
            '.stk-settings-entry.active .stk-settings-entry-chevron { color: #764ba2; }',
            'body.dark-mode .stk-settings-entry:hover { background: rgba(255,255,255,0.06); }',
            'body.dark-mode .stk-settings-entry.active { background: linear-gradient(135deg, rgba(102,126,234,0.25) 0%, rgba(212,93,121,0.25) 100%); border-color: rgba(102,126,234,0.3); }',
            'body.dark-mode .stk-settings-entry-label { color: #f0f0f5; }',
            'body.dark-mode .stk-settings-entry-desc { color: #888; }',
            'body.dark-mode .stk-settings-entry-chevron { color: #666; }',
            'body.dark-mode .stk-settings-entry.active .stk-settings-entry-chevron { color: #d45d79; }',

            /* 被锁定的设置条目（律动样式启用时锁定布局设置）：灰色不可点击 */
            '.stk-settings-entry.is-disabled { opacity: 0.45; cursor: not-allowed; filter: grayscale(0.7); }',
            '.stk-settings-entry.is-disabled:hover { background: transparent; }',
            '.stk-settings-entry.is-disabled .stk-settings-entry-label { color: #999 !important; }',
            '.stk-settings-entry.is-disabled .stk-settings-entry-desc { color: #b0b0bc !important; font-style: normal; }',
            '.stk-settings-entry.is-disabled .stk-settings-entry-chevron { display: none; }',

            /* ===== 右侧内容区：设置面板（设置模式下替代唱片等内容） ===== */
            '.stk-main.settings-mode .stk-content-wrap, .stk-main.settings-mode .stk-fold-hitzone { display: none !important; }',
            '.stk-settings-panel { position: absolute; inset: 0; z-index: 6; display: none; align-items: stretch; justify-content: center; padding: 34px 38px 100px; }',
            '.stk-main.settings-mode .stk-settings-panel { display: flex; }',
            '.stk-settings-placeholder { margin: auto; text-align: center; color: #b0b0c0; user-select: none; }',
            '.stk-settings-placeholder > i { font-size: 46px; color: #d8d8e4; margin-bottom: 14px; }',
            '.stk-settings-placeholder .ph-title { font-size: 16px; font-weight: 600; color: #8a8a9a; margin-bottom: 6px; }',
            '.stk-settings-placeholder .ph-sub { font-size: 12.5px; }',
            'body.dark-mode .stk-settings-placeholder > i { color: #3c3c50; }',
            'body.dark-mode .stk-settings-placeholder .ph-title { color: #999; }',
            'body.dark-mode .stk-settings-placeholder .ph-sub { color: #777; }',
            '.stk-settings-card { display: none; flex-direction: column; width: min(680px, 100%); margin: auto; max-height: 100%; overflow-y: auto; background: rgba(255,255,255,0.96); backdrop-filter: blur(12px); border: 1px solid rgba(102,126,234,0.16); border-radius: 20px; box-shadow: 0 14px 40px rgba(80,80,140,0.14); padding: 24px 26px; scrollbar-width: thin; scrollbar-color: rgba(118,75,162,0.35) transparent; }',
            '.stk-settings-card::-webkit-scrollbar { width: 6px; }',
            '.stk-settings-card::-webkit-scrollbar-thumb { background: rgba(118,75,162,0.35); border-radius: 6px; }',
            '.stk-settings-card.show { display: flex; animation: stkPanelIn 0.32s ease; }',
            '@keyframes stkPanelIn { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }',
            '.stk-settings-card-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; color: #2c2c3a; margin: 0 0 6px; }',
            '.stk-settings-card-title i { color: #764ba2; }',
            '.stk-settings-card-sub { font-size: 12px; color: #999; margin: 0 0 16px; }',
            'body.dark-mode .stk-settings-card { background: rgba(30,30,44,0.96); border-color: rgba(255,255,255,0.1); box-shadow: 0 14px 40px rgba(0,0,0,0.4); }',
            'body.dark-mode .stk-settings-card-title { color: #eee; }',
            'body.dark-mode .stk-settings-card-sub { color: #888; }',
            '.stk-bg-choose-btn.is-disabled { opacity: 0.5; pointer-events: none; }',

            /* ===== 底部播放控制条（播放时全局固定于视口底部，从底部滑出，四角圆角，不随页面滚动移动） ===== */
            '.stk-mini-bar { position: fixed; left: 50%; bottom: 16px; z-index: 3500; width: min(880px, calc(100% - 32px)); transform: translate(-50%, calc(100% + 80px)); opacity: 0; pointer-events: none; background: rgba(255,255,255,0.92); backdrop-filter: blur(18px); border: 1px solid rgba(102,126,234,0.18); border-radius: 26px; box-shadow: 0 18px 50px rgba(40,40,90,0.28); padding: 12px 20px; display: flex; align-items: center; gap: 16px; transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease; }',
            '.stk-mini-bar.show { transform: translate(-50%, 0); opacity: 1; pointer-events: auto; }',
            '.stk-mini-info { width: 168px; flex-shrink: 0; min-width: 0; }',
            '.stk-mini-title { font-size: 13.5px; font-weight: 700; color: #2c2c3a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
            '.stk-mini-artist { font-size: 11.5px; color: #999; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
            '.stk-mini-controls { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }',
            '.stk-mini-controls .stk-btn { width: 38px; height: 38px; font-size: 15px; }',
            '.stk-mini-controls .stk-btn-play { width: 46px; height: 46px; font-size: 17px; }',
            '.stk-mini-progress { flex: 1; min-width: 140px; display: flex; align-items: center; gap: 10px; }',
            '.stk-mini-time { font-size: 11.5px; color: #999; flex-shrink: 0; min-width: 36px; text-align: center; font-variant-numeric: tabular-nums; }',
            '.stk-mini-progress .stk-progress-bar { flex: 1; height: 7px; }',
            '.stk-mini-volume { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }',
            '.stk-mini-volume .stk-btn { width: 34px; height: 34px; font-size: 14px; }',
            '.stk-mini-volume .stk-volume-slider { width: 96px; }',
            'body.dark-mode .stk-mini-bar { background: rgba(30,30,44,0.94); border-color: rgba(255,255,255,0.1); box-shadow: 0 18px 50px rgba(0,0,0,0.5); }',
            'body.dark-mode .stk-mini-title { color: #f0f0f5; }',
            'body.dark-mode .stk-mini-artist { color: #888; }',
            'body.dark-mode .stk-mini-time { color: #888; }',
            '@media (max-width: 980px) { .stk-mini-info { display: none; } }',
            '@media (max-width: 680px) { .stk-mini-volume { display: none; } .stk-mini-bar { gap: 10px; padding: 10px 14px; border-radius: 22px; } }',

            /* ===== 头部"专辑"按钮（位于更多按钮左侧） ===== */
            '.stk-header-album-btn { width: 28px; height: 28px; border-radius: 50%; border: none; background: rgba(118,75,162,0.08); color: #764ba2; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.25s ease; flex-shrink: 0; }',
            '.stk-header-album-btn:hover { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; transform: scale(1.08); box-shadow: 0 3px 10px rgba(118,75,162,0.35); }',
            '.stk-header-album-btn.active { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; box-shadow: 0 3px 10px rgba(118,75,162,0.35); }',
            'body.dark-mode .stk-header-album-btn { background: rgba(118,75,162,0.18); color: #d45d79; }',
            'body.dark-mode .stk-header-album-btn:hover { color: #fff; }',
            '.stk-player.settings-mode .stk-header-album-btn { display: none; }',
            '.stk-player.album-mode .stk-header-more-btn, .stk-player.album-mode .stk-header-settings-btn { display: none; }',

            /* ===== 侧边栏专辑模式提示 ===== */
            '.stk-album-prompt { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 10px; padding: 30px 22px; }',
            '.stk-album-prompt i { font-size: 38px; color: #d8d8e4; margin-bottom: 4px; }',
            '.stk-album-prompt p { margin: 0; font-size: 13px; font-weight: 600; color: #8a8a9a; line-height: 1.6; }',
            'body.dark-mode .stk-album-prompt i { color: #3c3c50; }',
            'body.dark-mode .stk-album-prompt p { color: #999; }',

            /* ===== 专辑网格视图（替换播放器主内容） ===== */
            '.stk-album-grid { position: absolute; inset: 0; z-index: 5; display: none; padding: 40px 36px; overflow-y: auto; }',
            '.stk-player.album-mode .stk-content-wrap { display: none; }',
            '.stk-player.album-mode .stk-album-grid { display: block; }',
            '.stk-player.album-mode.selected-album .stk-content-wrap { display: flex; }',
            '.stk-player.album-mode.selected-album .stk-album-grid { display: none; }',
            '.stk-album-grid-title { font-size: 18px; font-weight: 700; color: #2c2c3a; margin: 0 0 24px; display: flex; align-items: center; gap: 10px; }',
            '.stk-album-grid-title i { color: #764ba2; }',
            '.stk-album-grid-subtitle { font-size: 12px; color: #999; margin: -16px 0 18px; }',
            '.stk-album-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; }',
            '.stk-album-card { position: relative; aspect-ratio: 1 / 1; border: none; border-radius: 16px; cursor: pointer; overflow: hidden; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 16px; transition: transform 0.25s ease, box-shadow 0.25s ease; box-shadow: 0 6px 18px rgba(0,0,0,0.12); }',
            '.stk-album-card::before { content: ""; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.35) 100%); z-index: 0; }',
            '.stk-album-card > * { position: relative; z-index: 1; }',
            '.stk-album-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.25); }',
            '.stk-album-card-icon { width: 50px; height: 50px; border-radius: 14px; background: rgba(255,255,255,0.22); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; font-size: 22px; }',
            '.stk-album-card-name { font-size: 14px; font-weight: 700; text-align: center; text-shadow: 0 1px 4px rgba(0,0,0,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }',
            '.stk-album-card-desc { font-size: 11px; font-weight: 500; text-align: center; opacity: 0.92; text-shadow: 0 1px 3px rgba(0,0,0,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }',
            '@media (max-width: 1100px) { .stk-album-cards { grid-template-columns: repeat(4, 1fr); } }',
            '@media (max-width: 880px) { .stk-album-cards { grid-template-columns: repeat(3, 1fr); } }',
            '@media (max-width: 600px) { .stk-album-cards { grid-template-columns: repeat(2, 1fr); } }',

            /* ===== 专辑视图下：返回专辑列表按钮 ===== */
            '.stk-album-back-bar { position: absolute; top: 18px; left: 22px; z-index: 6; display: none; align-items: center; gap: 10px; padding: 8px 14px 8px 10px; border-radius: 999px; background: rgba(255,255,255,0.92); border: 1px solid rgba(118,75,162,0.25); box-shadow: 0 4px 14px rgba(0,0,0,0.12); cursor: pointer; font-size: 12.5px; color: #555; font-weight: 600; transition: all 0.2s ease; backdrop-filter: blur(8px); }',
            '.stk-album-back-bar i:first-child { width: 24px; height: 24px; border-radius: 50%; background: rgba(118,75,162,0.1); color: #764ba2; display: flex; align-items: center; justify-content: center; font-size: 11px; transition: all 0.2s ease; }',
            '.stk-album-back-bar:hover { color: #764ba2; border-color: #667eea; transform: translateX(-2px); box-shadow: 0 6px 18px rgba(118,75,162,0.25); }',
            '.stk-album-back-bar:hover i:first-child { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }',
            '.stk-player.album-mode.selected-album .stk-album-back-bar { display: flex; }',
            'body.dark-mode .stk-album-back-bar { background: rgba(30,30,44,0.94); border-color: rgba(118,75,162,0.3); color: #ddd; }',
            'body.dark-mode .stk-album-back-bar:hover { color: #d45d79; border-color: #764ba2; }',

            /* 侧边栏折叠时：返回按钮下移到展开按钮（top:14px, 36px 高）下方，避免重叠 */
            '.stk-player.sidebar-collapsed.album-mode.selected-album .stk-album-back-bar { top: 60px; left: 14px; padding: 6px 10px; }',
            '.stk-player.sidebar-collapsed.album-mode.selected-album .stk-album-back-bar span { display: none; }',

            /* 专辑模式下隐藏导入栏（避免导入自定义曲目和专辑曲目语义冲突） */
            '.stk-player.album-mode .stk-import-bar { display: none !important; }',

            /* 专辑总览态：强制隐藏自定义背景层、恢复 main 白色，让专辑网格背景干净 */
            '.stk-player.album-mode:not(.selected-album) .stk-bg-layer { opacity: 0 !important; background-image: none !important; }',
            '.stk-player.album-mode:not(.selected-album) .stk-bg-overlay { opacity: 0 !important; }',
            '.stk-player.album-mode:not(.selected-album) .stk-main { background: #fff !important; }',
            'body.dark-mode .stk-player.album-mode:not(.selected-album) .stk-main { background: #1e1e2c !important; }',

            /* ===== 音乐律动可视化画布（播放样式） ===== */
            '.stk-visualizer { position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 3; pointer-events: none; display: none; }',
            '.stk-player.viz-on .stk-visualizer { display: block; }',
            '.stk-player.album-mode:not(.selected-album) .stk-visualizer { display: none !important; }',

            /* ===== 设置面板：播放样式选项 ===== */
            '.stk-viz-preview { position: relative; width: 100%; height: 110px; border-radius: 12px; background: linear-gradient(160deg, #f6f6fc, #fdf3f5); border: 1px solid #ececf4; margin-bottom: 12px; overflow: hidden; }',
            '.stk-viz-preview canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }',
            '.stk-viz-preview .stk-viz-preview-empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; color: #b8b8c8; }',
            '.stk-viz-preview.is-live .stk-viz-preview-empty { display: none; }',
            '.stk-viz-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }',
            '.stk-viz-grid > button { border: 1px solid #e0e0ea; background: #fafafe; border-radius: 12px; padding: 12px 8px; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; }',
            '.stk-viz-grid > button i { font-size: 16px; color: #8a8a9a; transition: color 0.2s ease; }',
            '.stk-viz-grid > button .viz-name { font-size: 13px; font-weight: 600; color: #444; }',
            '.stk-viz-grid > button .viz-desc { font-size: 11px; color: #999; }',
            '.stk-viz-grid > button:hover { border-color: #667eea; background: rgba(102,126,234,0.06); }',
            '.stk-viz-grid > button:hover i { color: #667eea; }',
            '.stk-viz-grid > button.active { border-color: #667eea; background: linear-gradient(135deg, rgba(102,126,234,0.12), rgba(212,93,121,0.12)); box-shadow: 0 2px 10px rgba(118,75,162,0.22); }',
            '.stk-viz-grid > button.active i { color: #764ba2; }',
            '.stk-viz-grid > button.active .viz-name { color: #764ba2; }',
            'body.dark-mode .stk-viz-preview { background: linear-gradient(160deg, #262636, #2c2430); border-color: rgba(255,255,255,0.08); }',
            'body.dark-mode .stk-viz-grid > button { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }',
            'body.dark-mode .stk-viz-grid > button .viz-name { color: #ddd; }',
            'body.dark-mode .stk-viz-grid > button .viz-desc { color: #888; }',
            'body.dark-mode .stk-viz-grid > button:hover { border-color: #764ba2; background: rgba(118,75,162,0.12); }',
            'body.dark-mode .stk-viz-grid > button.active { border-color: #764ba2; background: linear-gradient(135deg, rgba(118,75,162,0.25), rgba(212,93,121,0.2)); }',
            'body.dark-mode .stk-viz-grid > button.active .viz-name { color: #d45d79; }',

            /* ===== 播放器组件版本信息卡片（复用全局组件信息弹窗样式） ===== */
            '#stkPanelComponentInfo.stk-cinfo-card { padding: 0; overflow: hidden; width: min(520px, 100%); }',
            '#stkPanelComponentInfo .component-modal-body { max-height: min(46vh, 460px); }',
            '#stkPanelComponentInfo .component-modal-footer { border-top: 1px solid rgba(0,0,0,0.06); padding: 14px 24px; }',
            'body.dark-mode #stkPanelComponentInfo .component-modal-footer { border-top-color: rgba(255,255,255,0.08); }',
            '#stkPanelComponentInfo .component-copyright { font-size: 11px; color: #aaa; text-align: center; width: 100%; }',
            'body.dark-mode #stkPanelComponentInfo .component-copyright { color: #777; }',

        ].join('\n');
        document.head.appendChild(style);
    }

    // ==================== UI 渲染 ====================
    function buildPlayerHTML() {
        return '' +
            '<div class="stk-player">' +
                '<aside class="stk-sidebar">' +
                    '<div class="stk-sidebar-header">' +
                        '<button class="stk-back-btn" id="stkSettingsBackBtn" title="返回播放列表"><i class="fas fa-arrow-left"></i></button>' +
                        '<i class="fas fa-list-music stk-sidebar-icon"></i>' +
                        '<div>' +
                            '<h3 id="stkSidebarTitle">播放列表</h3>' +
                            '<p id="stkTrackCount">共 ' + state.tracks.length + ' 首曲目</p>' +
                        '</div>' +
                        '<button class="stk-header-album-btn" id="stkAlbumBtn" title="专辑浏览"><i class="fas fa-compact-disc"></i></button>' +
                        '<button class="stk-header-more-btn" id="stkMoreBtn" title="更多操作"><i class="fas fa-ellipsis"></i></button>' +
                        '<button class="stk-header-settings-btn" id="stkSettingsBtn" title="播放器设置"><i class="fas fa-gear"></i></button>' +
                        '<button class="stk-collapse-sidebar-btn" id="stkCollapseSidebarBtn" title="收起侧边栏"><i class="fas fa-angle-left"></i></button>' +
                    '</div>' +
                    '<div class="stk-import-bar" id="stkImportBar">' +
                        '<button class="stk-import-btn" id="stkImportBtn" title="导入本地音频文件"><i class="fas fa-file-import"></i>导入歌曲</button>' +
                        '<input type="file" class="stk-import-input" id="stkImportInput" accept="audio/*,.mp3,.ogg,.wav,.flac,.m4a,.aac" multiple hidden>' +
                    '</div>' +
                    '<div class="stk-track-list" id="stkTrackList"></div>' +
                    '<div class="stk-settings-menu" id="stkSettingsMenu">' +
                        '<div class="stk-settings-entry" data-section="background">' +
                            '<div class="stk-settings-entry-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);"><i class="fas fa-image"></i></div>' +
                            '<div class="stk-settings-entry-text">' +
                                '<div class="stk-settings-entry-label">添加自定义背景图片</div>' +
                                '<div class="stk-settings-entry-desc">按曲目独立设置</div>' +
                            '</div>' +
                            '<i class="fas fa-angle-right stk-settings-entry-chevron"></i>' +
                        '</div>' +
                        '<div class="stk-settings-entry" data-section="layout">' +
                            '<div class="stk-settings-entry-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c);"><i class="fas fa-up-down-left-right"></i></div>' +
                            '<div class="stk-settings-entry-text">' +
                                '<div class="stk-settings-entry-label">调整播放器组件位置和大小</div>' +
                                '<div class="stk-settings-entry-desc">九宫格位置与整体缩放</div>' +
                            '</div>' +
                            '<i class="fas fa-angle-right stk-settings-entry-chevron"></i>' +
                        '</div>' +
                        '<div class="stk-settings-entry" data-section="components">' +
                            '<div class="stk-settings-entry-icon" style="background: linear-gradient(135deg, #4facfe, #00c6fb);"><i class="fas fa-eye"></i></div>' +
                            '<div class="stk-settings-entry-text">' +
                                '<div class="stk-settings-entry-label">调整播放器组件显示状态</div>' +
                                '<div class="stk-settings-entry-desc">唱片与歌曲信息的显隐</div>' +
                            '</div>' +
                            '<i class="fas fa-angle-right stk-settings-entry-chevron"></i>' +
                        '</div>' +
                        '<div class="stk-settings-entry" data-section="minibar">' +
                            '<div class="stk-settings-entry-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7);"><i class="fas fa-sliders"></i></div>' +
                            '<div class="stk-settings-entry-text">' +
                                '<div class="stk-settings-entry-label">调整播放器控制条设置</div>' +
                                '<div class="stk-settings-entry-desc">离开播放器后的显示行为</div>' +
                            '</div>' +
                            '<i class="fas fa-angle-right stk-settings-entry-chevron"></i>' +
                        '</div>' +
                        '<div class="stk-settings-entry" data-section="playstyle">' +
                            '<div class="stk-settings-entry-icon" style="background: linear-gradient(135deg, #fa709a, #fecfef);"><i class="fas fa-wave-square"></i></div>' +
                            '<div class="stk-settings-entry-text">' +
                                '<div class="stk-settings-entry-label">调整播放器音乐播放样式</div>' +
                                '<div class="stk-settings-entry-desc">音浪 / 波纹等律动效果</div>' +
                            '</div>' +
                            '<i class="fas fa-angle-right stk-settings-entry-chevron"></i>' +
                        '</div>' +
                        '<div class="stk-settings-entry" data-section="componentinfo">' +
                            '<div class="stk-settings-entry-icon" style="background: linear-gradient(135deg, #5b86e5, #36d1dc);"><i class="fas fa-circle-info"></i></div>' +
                            '<div class="stk-settings-entry-text">' +
                                '<div class="stk-settings-entry-label">播放器组件版本</div>' +
                                '<div class="stk-settings-entry-desc">查看组件版本与功能信息</div>' +
                            '</div>' +
                            '<i class="fas fa-angle-right stk-settings-entry-chevron"></i>' +
                        '</div>' +
                    '</div>' +
                    '<div class="stk-sidebar-footer">' +
                        '<i class="fas fa-circle-info"></i>' +
                        '<span>音频文件统一存储在 <strong>sounds/</strong> 目录，如需使用完整的代码功能请从 Github 中下载完整项目。</span>' +
                    '</div>' +
                '</aside>' +
                '<main class="stk-main">' +
                    '<button class="stk-expand-sidebar-btn" id="stkExpandSidebarBtn" title="展开侧边栏"><i class="fas fa-angle-right"></i></button>' +
                    '<button class="stk-album-back-bar" id="stkAlbumBackBtn" title="返回专辑列表"><i class="fas fa-angle-left"></i><span>返回专辑列表</span></button>' +
                    '<div class="stk-bg-layer" id="stkBgLayer"></div>' +
                    '<div class="stk-bg-overlay" id="stkBgOverlay"></div>' +
                    '<canvas class="stk-visualizer" id="stkVisualizer"></canvas>' +
                    '<div class="stk-album-grid" id="stkAlbumGrid">' +
                        '<h2 class="stk-album-grid-title"><i class="fas fa-compact-disc"></i> 专辑</h2>' +
                        '<p class="stk-album-grid-subtitle">点击任意专辑即可查看其中包含的全部曲目</p>' +
                        '<div class="stk-album-cards" id="stkAlbumCards"></div>' +
                    '</div>' +
                    '<div class="stk-content-wrap" id="stkContentWrap">' +
                    '<div class="stk-disc" id="stkDisc">' +
                        '<div class="stk-disc-label" id="stkDiscLabel"><i class="fas fa-music"></i></div>' +
                        '<div class="stk-disc-hole"></div>' +
                    '</div>' +
                    '<div class="stk-song-info">' +
                        '<h2 class="stk-song-title" id="stkSongTitle">未在播放</h2>' +
                        '<p class="stk-song-artist" id="stkSongArtist">从左侧列表选择一首音乐开始聆听</p>' +
                    '</div>' +
                    '<div class="stk-progress-area">' +
                        '<div class="stk-progress-bar" id="stkProgressBar">' +
                            '<div class="stk-progress-fill" id="stkProgressFill"></div>' +
                            '<div class="stk-progress-thumb" id="stkProgressThumb"></div>' +
                        '</div>' +
                        '<div class="stk-time-row">' +
                            '<span id="stkCurrentTime">0:00</span>' +
                            '<span id="stkDuration">0:00</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="stk-controls">' +
                        '<button class="stk-btn" id="stkBtnShuffle" title="随机播放"><i class="fas fa-shuffle"></i></button>' +
                        '<button class="stk-btn" id="stkBtnPrev" title="上一首"><i class="fas fa-backward-step"></i></button>' +
                        '<button class="stk-btn stk-btn-play" id="stkBtnPlay" title="播放 / 暂停"><i class="fas fa-play"></i></button>' +
                        '<button class="stk-btn" id="stkBtnNext" title="下一首"><i class="fas fa-forward-step"></i></button>' +
                        '<button class="stk-btn" id="stkBtnRepeat" title="循环模式"><i class="fas fa-repeat"></i></button>' +
                    '</div>' +
                    '<div class="stk-volume-area">' +
                        '<button class="stk-btn" id="stkBtnMute" title="静音"><i class="fas fa-volume-high"></i></button>' +
                        '<input type="range" class="stk-volume-slider" id="stkVolumeSlider" min="0" max="100" value="80" aria-label="音量调节">' +
                    '</div>' +
                    '<div class="stk-status" id="stkStatus"></div>' +
                    '</div>' +
                    '<div class="stk-fold-hitzone" id="stkFoldHitzone">' +
                        '<div class="stk-fold" id="stkFold" title="自定义背景">' +
                            '<span class="stk-fold-icon"><i class="fas fa-image"></i></span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="stk-settings-panel" id="stkSettingsPanel">' +
                        '<div class="stk-settings-placeholder" id="stkSettingsPlaceholder">' +
                            '<i class="fas fa-sliders"></i>' +
                            '<div class="ph-title">播放器设置</div>' +
                            '<div class="ph-sub">从左侧选择一个设置条目，在此调整对应功能</div>' +
                        '</div>' +
                        '<div class="stk-settings-card" id="stkPanelBackground">' +
                            '<h4 class="stk-settings-card-title"><i class="fas fa-image"></i>自定义背景图片（按曲目独立）</h4>' +
                            '<p class="stk-settings-card-sub" id="stkPanelBgTrack">尚未选择曲目</p>' +
                            '<div class="stk-bg-preview" id="stkBgPreview">' +
                                '<img class="stk-bg-preview-img" id="stkBgPreviewImg" alt="背景预览">' +
                                '<div class="stk-bg-preview-empty"><i class="fas fa-image"></i><div>当前曲目尚未设置背景<br>点击下方按钮选择图片</div></div>' +
                            '</div>' +
                            '<div class="stk-bg-file-row">' +
                                '<input type="file" class="stk-bg-file-input" id="stkBgFileInput" accept="image/*">' +
                                '<label class="stk-bg-choose-btn" id="stkBgChooseBtn" for="stkBgFileInput"><i class="fas fa-folder-open"></i>选择本地图片</label>' +
                                '<button class="stk-bg-clear-btn" id="stkBgClearBtn" type="button"><i class="fas fa-trash-can"></i>清除</button>' +
                            '</div>' +
                            '<div class="stk-bg-hint">每张图片与当前曲目绑定，切换歌曲时会自动展示对应背景。<br>推荐使用 1920×1080 或更高分辨率的横版图片，单张图片不超过 3MB。</div>' +
                        '</div>' +
                        '<div class="stk-settings-card" id="stkPanelLayout">' +
                            '<h4 class="stk-settings-card-title"><i class="fas fa-up-down-left-right"></i>调整播放器组件位置和大小</h4>' +
                            '<p class="stk-settings-card-sub">调整播放器组件在右侧区域中的位置与整体缩放，更改即时生效</p>' +
                            '<div class="stk-layout-grid" id="stkLayoutGrid">' +
                                '<button data-pos="left-top"><i class="fas fa-arrow-up-left"></i>左上</button>' +
                                '<button data-pos="left-mid"><i class="fas fa-arrow-left"></i>左中</button>' +
                                '<button data-pos="left-bot"><i class="fas fa-arrow-down-left"></i>左下</button>' +
                                '<button data-pos="top"><i class="fas fa-arrow-up"></i>上方</button>' +
                                '<button data-pos="center"><i class="fas fa-crosshairs"></i>居中</button>' +
                                '<button data-pos="bottom"><i class="fas fa-arrow-down"></i>下方</button>' +
                                '<button data-pos="right-top"><i class="fas fa-arrow-up-right"></i>右上</button>' +
                                '<button data-pos="right-mid"><i class="fas fa-arrow-right"></i>右中</button>' +
                                '<button data-pos="right-bot"><i class="fas fa-arrow-down-right"></i>右下</button>' +
                            '</div>' +
                            '<div class="stk-layout-scale-row">' +
                                '<label>组件大小</label>' +
                                '<input type="range" id="stkLayoutScale" min="70" max="130" value="100" aria-label="组件大小">' +
                                '<span class="stk-layout-scale-val" id="stkLayoutScaleVal">100%</span>' +
                            '</div>' +
                            '<button class="stk-layout-reset" id="stkLayoutReset" type="button"><i class="fas fa-rotate-left"></i> 恢复默认布局</button>' +
                        '</div>' +
                        '<div class="stk-settings-card" id="stkPanelComponents">' +
                            '<h4 class="stk-settings-card-title"><i class="fas fa-eye"></i>调整播放器组件显示状态</h4>' +
                            '<p class="stk-settings-card-sub">控制唱片封面与歌曲信息是否显示，更改即时生效</p>' +
                            '<div class="stk-comp-toggle-row">' +
                                '<label class="stk-comp-toggle"><input type="checkbox" id="stkCompDisc" checked><span class="stk-comp-switch"></span><span class="stk-comp-label"><i class="fas fa-compact-disc"></i>唱片封面</span></label>' +
                                '<label class="stk-comp-toggle"><input type="checkbox" id="stkCompSongInfo" checked><span class="stk-comp-switch"></span><span class="stk-comp-label"><i class="fas fa-music"></i>歌曲名称与艺人</span></label>' +
                            '</div>' +
                            '<div class="stk-comp-hint"><i class="fas fa-circle-info"></i>进度条与控件按钮为核心功能区域，始终保持可见。</div>' +
                        '</div>' +
                        '<div class="stk-settings-card" id="stkPanelMiniBar">' +
                            '<h4 class="stk-settings-card-title"><i class="fas fa-sliders"></i>播放器控制条设置</h4>' +
                            '<p class="stk-settings-card-sub">控制底部悬浮控制条在离开播放器后的显示行为，更改即时生效</p>' +
                            '<div class="stk-comp-toggle-row">' +
                                '<label class="stk-comp-toggle"><input type="checkbox" id="stkMiniBarShowAfterLeave" checked><span class="stk-comp-switch"></span><span class="stk-comp-label"><i class="fas fa-down-left-and-up-right-to-center"></i>离开音乐播放器后始终显示底部控制条</span></label>' +
                            '</div>' +
                            '<div class="stk-comp-hint"><i class="fas fa-circle-info"></i>开启后，正在播放音乐时切换到其他页面仍会显示底部控制条；关闭后，离开播放器将不再显示。</div>' +
                        '</div>' +
                        '<div class="stk-settings-card" id="stkPanelPlayStyle">' +
                            '<h4 class="stk-settings-card-title"><i class="fas fa-wave-square"></i>调整播放器音乐播放样式</h4>' +
                            '<p class="stk-settings-card-sub">选择随音乐律动的可视化效果，更改即时生效（上方为实时预览）</p>' +
                            '<div class="stk-viz-preview" id="stkVizPreview">' +
                                '<canvas id="stkVizPreviewCanvas"></canvas>' +
                                '<div class="stk-viz-preview-empty"><i class="fas fa-wave-square"></i>选择下方样式后此处实时预览</div>' +
                            '</div>' +
                            '<div class="stk-viz-grid" id="stkVizGrid">' +
                                '<button type="button" data-style="none"><i class="fas fa-ban"></i><span class="viz-name">默认样式</span><span class="viz-desc">无律动效果</span></button>' +
                                '<button type="button" data-style="bars"><i class="fas fa-chart-simple"></i><span class="viz-name">音浪</span><span class="viz-desc">底部频谱随节拍跳动</span></button>' +
                                '<button type="button" data-style="ripple"><i class="fas fa-circle-notch"></i><span class="viz-name">波纹</span><span class="viz-desc">中心涟漪随低音扩散</span></button>' +
                                '<button type="button" data-style="wave"><i class="fas fa-water"></i><span class="viz-name">流光波浪</span><span class="viz-desc">层叠声波随旋律起伏</span></button>' +
                            '</div>' +
                            '<div class="stk-comp-hint"><i class="fas fa-circle-info"></i>音浪 / 波纹 / 流光波浪会实时分析正在播放的音乐并随之律动，播放暂停时自动恢复平静。所选样式会自动保存，刷新后仍然生效。</div>' +
                        '</div>' +
                        '<div class="stk-settings-card stk-cinfo-card" id="stkPanelComponentInfo"></div>' +
                    '</div>' +
                '</main>' +
                '<div class="stk-mini-bar" id="stkMiniBar" aria-label="播放控制条">' +
                    '<div class="stk-mini-info">' +
                        '<div class="stk-mini-title" id="stkMiniTitle">未在播放</div>' +
                        '<div class="stk-mini-artist" id="stkMiniArtist">—</div>' +
                    '</div>' +
                    '<div class="stk-mini-controls">' +
                        '<button class="stk-btn" id="stkMiniBtnShuffle" title="随机播放"><i class="fas fa-shuffle"></i></button>' +
                        '<button class="stk-btn" id="stkMiniBtnPrev" title="上一首"><i class="fas fa-backward-step"></i></button>' +
                        '<button class="stk-btn stk-btn-play" id="stkMiniBtnPlay" title="播放 / 暂停"><i class="fas fa-play"></i></button>' +
                        '<button class="stk-btn" id="stkMiniBtnNext" title="下一首"><i class="fas fa-forward-step"></i></button>' +
                        '<button class="stk-btn" id="stkMiniBtnRepeat" title="循环模式"><i class="fas fa-repeat"></i></button>' +
                    '</div>' +
                    '<div class="stk-mini-progress">' +
                        '<span class="stk-mini-time" id="stkMiniCurrentTime">0:00</span>' +
                        '<div class="stk-progress-bar" id="stkMiniProgressBar">' +
                            '<div class="stk-progress-fill" id="stkMiniProgressFill"></div>' +
                            '<div class="stk-progress-thumb" id="stkMiniProgressThumb"></div>' +
                        '</div>' +
                        '<span class="stk-mini-time" id="stkMiniDuration">0:00</span>' +
                    '</div>' +
                    '<div class="stk-mini-volume">' +
                        '<button class="stk-btn" id="stkMiniBtnMute" title="静音"><i class="fas fa-volume-high"></i></button>' +
                        '<input type="range" class="stk-volume-slider" id="stkMiniVolumeSlider" min="0" max="100" value="80" aria-label="音量调节">' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    // ==================== 专辑浏览模式 ====================
    function getAlbumById(id) {
        for (var i = 0; i < SOUNDTRACK_ALBUMS.length; i++) {
            if (SOUNDTRACK_ALBUMS[i].id === id) return SOUNDTRACK_ALBUMS[i];
        }
        return null;
    }

    // 从当前活动播放列表中根据 trackId 数组筛选出对应的曲目（保持 trackIds 顺序）
    function lookupTracksByIds(trackIds) {
        var all = state.tracks || [];
        // 如果在专辑模式下已经切换过 tracks，原活动播放列表的曲目仍然在 playlists[].tracks 中，
        // 这里优先在"默认播放列表 + 所有自定义播放列表"里找，确保即使切换过活动列表也能匹配
        var pool = [];
        (state.playlists || []).forEach(function (pl) {
            pool = pool.concat(pl.tracks || []);
        });
        if (!pool.length) pool = all.slice();
        var found = [];
        var seenIds = {};
        trackIds.forEach(function (id) {
            // 先从当前 state.tracks 找（命中几率最高，且包含导入歌曲）
            var hit = null;
            for (var i = 0; i < all.length; i++) {
                if (all[i].id === id) { hit = all[i]; break; }
            }
            if (!hit) {
                for (var j = 0; j < pool.length; j++) {
                    if (pool[j].id === id) { hit = pool[j]; break; }
                }
            }
            if (hit && !seenIds[id]) {
                seenIds[id] = true;
                found.push(hit);
            }
        });
        return found;
    }

    function renderAlbumCards() {
        if (!ui.albumCards) return;
        if (!SOUNDTRACK_ALBUMS.length) {
            ui.albumCards.innerHTML =
                '<div class="stk-empty-hint" style="grid-column: 1 / -1;">' +
                    '<i class="fas fa-folder-open"></i>' +
                    '<p>还没有任何专辑</p>' +
                    '<span>在 soundtrack.js 的 SOUNDTRACK_ALBUMS 数组中新增一条即可</span>' +
                '</div>';
            return;
        }
        ui.albumCards.innerHTML = SOUNDTRACK_ALBUMS.map(function (album) {
            var colors = (album.colors && album.colors.length >= 2)
                ? album.colors
                : CUSTOM_TRACK_COLORS[SOUNDTRACK_ALBUMS.indexOf(album) % CUSTOM_TRACK_COLORS.length];
            var title = esc(album.name || '未命名专辑');
            var desc = esc(album.description || (album.trackIds ? album.trackIds.length + ' 首' : ''));
            return '' +
                '<button class="stk-album-card" data-album-id="' + esc(album.id) + '" ' +
                        'style="background: linear-gradient(135deg, ' + colors[0] + ', ' + colors[1] + ');">' +
                    '<div class="stk-album-card-icon"><i class="fas fa-compact-disc"></i></div>' +
                    '<div class="stk-album-card-name">' + title + '</div>' +
                    '<div class="stk-album-card-desc">' + desc + '</div>' +
                '</button>';
        }).join('');
    }

    // 进入专辑浏览总览：显示专辑网格，侧边栏显示提示文本
    function enterAlbumMode() {
        // 先保存当前活动播放列表（退出时恢复）
        if (!state.albumMode) {
            state._albumSavedPlaylistId = state.activePlaylistId;
            state._albumSavedTracksRef = state.tracks;
        }
        // 退出设置模式（互斥）
        if (state.settingsMode) exitSettingsMode();

        state.albumMode = true;
        state.selectedAlbumId = null;
        if (ui.player) ui.player.classList.add('album-mode');
        if (ui.player) ui.player.classList.remove('selected-album');
        if (ui.albumBtn) ui.albumBtn.classList.add('active');

        // 临时移除 fold-expanded class（保留 state.foldExpanded 持久化标志），避免专辑总览时半透明蒙层错乱
        if (ui.main && ui.main.classList.contains('fold-expanded')) {
            ui.main.classList.remove('fold-expanded');
            ui.main.classList.remove('fold-hover');
            if (ui.fold) {
                var fi = ui.fold.querySelector('.stk-fold-icon i');
                if (fi) fi.className = 'fas fa-image';
            }
        }
        // 清空 bgLayer 背景图（CSS 已经用 !important 强制 opacity:0，这里是双保险）
        if (ui.bgLayer) ui.bgLayer.style.backgroundImage = '';

        renderAlbumCards();
        renderTrackList();         // 显示提示文本
        updatePlaylistHeader();    // 头部标题切换为"专辑浏览"
        updateImportBarVisibility();
        // 停止播放中的当前曲目（继续播放原曲目的话播放器面板被隐藏会比较怪）
        if (audio && state.isPlaying) {
            audio.pause();
        }
        updatePlayUI();
    }

    // 完全退出专辑浏览，恢复到之前的活动播放列表
    function exitAlbumMode() {
        if (!state.albumMode) return;
        state.albumMode = false;
        state.selectedAlbumId = null;
        // 恢复原播放列表
        var savedId = state._albumSavedPlaylistId;
        if (savedId && getPlaylistById(savedId)) {
            state.activePlaylistId = savedId;
        }
        state.tracks = getActivePlaylist().tracks;
        if (ui.player) {
            ui.player.classList.remove('album-mode');
            ui.player.classList.remove('selected-album');
        }
        if (ui.albumBtn) ui.albumBtn.classList.remove('active');
        state.currentIndex = -1;
        renderTrackList();
        updatePlaylistHeader();
        updateImportBarVisibility();
        updatePlayUI();
        // 注：fold-expanded 的恢复不再在这里做（currentIndex 已经是 -1）；
        //     用户下次从播放列表点歌时 loadTrack 内部会根据 state.foldExpanded 自动恢复
    }

    // 选中一张专辑：侧边栏显示该专辑曲目，右侧隐藏专辑网格、显示播放器 + 返回按钮
    function selectAlbum(albumId) {
        var album = getAlbumById(albumId);
        if (!album) return;
        var tracks = lookupTracksByIds(album.trackIds || []);
        if (!tracks.length) {
            toastWarning('该专辑暂无可加载的曲目（请确认 trackIds 是否与现有曲目匹配）');
            return;
        }
        state.selectedAlbumId = album.id;
        state.tracks = tracks;
        state.currentIndex = -1;
        if (ui.player) ui.player.classList.add('selected-album');

        renderTrackList();
        updatePlaylistHeader();
        // 右侧此时显示的是播放器组件（专辑网格被 CSS .selected-album 隐藏）
    }

    // 从专辑详情返回到专辑总览
    function backToAlbumGrid() {
        if (!state.albumMode) return;
        // 恢复原活动播放列表引用，但 albumMode 仍保持 true（仍处于浏览模式）
        var savedId = state._albumSavedPlaylistId;
        if (savedId && getPlaylistById(savedId)) {
            state.activePlaylistId = savedId;
        }
        state.tracks = getActivePlaylist().tracks;
        state.selectedAlbumId = null;
        state.currentIndex = -1;
        if (ui.player) ui.player.classList.remove('selected-album');
        renderAlbumCards();
        renderTrackList();
        updatePlaylistHeader();
        updatePlayUI();
    }

    // 根据 albumMode / selectedAlbumId 决定头部显示内容
    function applyAlbumHeader() {
        if (!ui.sidebarTitle) return;
        if (state.albumMode) {
            if (state.selectedAlbumId) {
                var a = getAlbumById(state.selectedAlbumId);
                ui.sidebarTitle.innerHTML = esc(a ? a.name : '专辑') + '<i class="fas fa-music stk-title-caret"></i>';
                ui.sidebarTitle.title = a ? ('专辑「' + a.name + '」曲目') : '';
                ui.trackCount.textContent = '共 ' + state.tracks.length + ' 首曲目';
            } else {
                ui.sidebarTitle.innerHTML = '专辑浏览<i class="fas fa-compact-disc stk-title-caret"></i>';
                ui.sidebarTitle.title = '专辑浏览';
                ui.trackCount.textContent = '共 ' + SOUNDTRACK_ALBUMS.length + ' 张专辑';
            }
            return true;
        }
        return false;
    }

    function renderTrackList() {
        if (!ui.trackList) return;
        // 专辑模式总览：侧边栏只显示提示文本
        if (state.albumMode && !state.selectedAlbumId) {
            ui.trackList.innerHTML =
                '<div class="stk-album-prompt">' +
                    '<i class="fas fa-folder-open"></i>' +
                    '<p>请在右侧先选择一张专辑</p>' +
                '</div>';
            return;
        }
        if (!state.tracks.length) {
            ui.trackList.innerHTML =
                '<div class="stk-empty-hint">' +
                    '<i class="fas fa-compact-disc"></i>' +
                    '<p>播放列表为空</p>' +
                    '<span>点击上方"导入歌曲"按钮添加本地音乐</span>' +
                '</div>';
            return;
        }
        ui.trackList.innerHTML = state.tracks.map(function (t, i) {
            return '' +
                '<div class="stk-track-item" data-index="' + i + '">' +
                    '<div class="stk-track-index">' +
                        '<span class="stk-num">' + (i + 1) + '</span>' +
                        '<span class="stk-eq"><i></i><i></i><i></i></span>' +
                    '</div>' +
                    '<div class="stk-track-cover" style="background: linear-gradient(135deg, ' + t.colors[0] + ', ' + t.colors[1] + ');">' +
                        '<i class="fas fa-music"></i>' +
                    '</div>' +
                    '<div class="stk-track-meta">' +
                        '<div class="stk-track-name">' + esc(t.title) + '</div>' +
                        '<div class="stk-track-singer">' + esc(t.artist) + '</div>' +
                    '</div>' +
                    '<div class="stk-track-time" id="stkItemDur-' + i + '">--:--</div>' +
                '</div>';
        }).join('');
    }

    function cacheElements() {
        ui.trackList = document.getElementById('stkTrackList');
        ui.disc = document.getElementById('stkDisc');
        ui.discLabel = document.getElementById('stkDiscLabel');
        ui.songTitle = document.getElementById('stkSongTitle');
        ui.songArtist = document.getElementById('stkSongArtist');
        ui.progressBar = document.getElementById('stkProgressBar');
        ui.progressFill = document.getElementById('stkProgressFill');
        ui.progressThumb = document.getElementById('stkProgressThumb');
        ui.currentTime = document.getElementById('stkCurrentTime');
        ui.duration = document.getElementById('stkDuration');
        ui.btnPlay = document.getElementById('stkBtnPlay');
        ui.btnPrev = document.getElementById('stkBtnPrev');
        ui.btnNext = document.getElementById('stkBtnNext');
        ui.btnShuffle = document.getElementById('stkBtnShuffle');
        ui.btnRepeat = document.getElementById('stkBtnRepeat');
        ui.btnMute = document.getElementById('stkBtnMute');
        ui.volumeSlider = document.getElementById('stkVolumeSlider');
        ui.status = document.getElementById('stkStatus');

        // 背景层、折页、内容包裹层
        ui.bgLayer = document.getElementById('stkBgLayer');
        ui.fold = document.getElementById('stkFold');
        ui.foldHitzone = document.getElementById('stkFoldHitzone');
        ui.main = document.querySelector('.stk-main');
        ui.contentWrap = document.getElementById('stkContentWrap');
        ui.player = document.querySelector('.stk-player');
        ui.collapseSidebarBtn = document.getElementById('stkCollapseSidebarBtn');
        ui.expandSidebarBtn = document.getElementById('stkExpandSidebarBtn');

        // 侧边栏头部：标题 + 更多/设置入口 + 返回按钮
        ui.sidebarTitle = document.getElementById('stkSidebarTitle');
        ui.trackCount = document.getElementById('stkTrackCount');
        ui.moreBtn = document.getElementById('stkMoreBtn');
        ui.settingsBtn = document.getElementById('stkSettingsBtn');
        ui.settingsBackBtn = document.getElementById('stkSettingsBackBtn');

        // 专辑浏览相关元素
        ui.albumBtn = document.getElementById('stkAlbumBtn');
        ui.albumGrid = document.getElementById('stkAlbumGrid');
        ui.albumCards = document.getElementById('stkAlbumCards');
        ui.albumBackBtn = document.getElementById('stkAlbumBackBtn');

        // 导入歌曲栏
        ui.importBar = document.getElementById('stkImportBar');
        ui.importBtn = document.getElementById('stkImportBtn');
        ui.importInput = document.getElementById('stkImportInput');

        // 侧边栏设置菜单 + 右侧设置面板
        ui.settingsMenu = document.getElementById('stkSettingsMenu');
        ui.settingsPanel = document.getElementById('stkSettingsPanel');
        ui.settingsPlaceholder = document.getElementById('stkSettingsPlaceholder');
        ui.panelBackground = document.getElementById('stkPanelBackground');
        ui.panelLayout = document.getElementById('stkPanelLayout');
        ui.panelComponents = document.getElementById('stkPanelComponents');
        ui.panelMiniBar = document.getElementById('stkPanelMiniBar');
        ui.panelBgTrack = document.getElementById('stkPanelBgTrack');
        ui.bgPreview = document.getElementById('stkBgPreview');
        ui.bgPreviewImg = document.getElementById('stkBgPreviewImg');
        ui.bgFileInput = document.getElementById('stkBgFileInput');
        ui.bgChooseBtn = document.getElementById('stkBgChooseBtn');
        ui.bgClearBtn = document.getElementById('stkBgClearBtn');
        ui.layoutGrid = document.getElementById('stkLayoutGrid');
        ui.layoutScale = document.getElementById('stkLayoutScale');
        ui.layoutScaleVal = document.getElementById('stkLayoutScaleVal');
        ui.layoutReset = document.getElementById('stkLayoutReset');
        ui.compDisc = document.getElementById('stkCompDisc');
        ui.compSongInfo = document.getElementById('stkCompSongInfo');
        ui.miniBarShowAfterLeave = document.getElementById('stkMiniBarShowAfterLeave');

        // 音乐律动可视化（播放样式）
        ui.vizCanvas = document.getElementById('stkVisualizer');
        ui.panelPlayStyle = document.getElementById('stkPanelPlayStyle');
        ui.vizPreview = document.getElementById('stkVizPreview');
        ui.vizPreviewCanvas = document.getElementById('stkVizPreviewCanvas');
        ui.vizGrid = document.getElementById('stkVizGrid');
        ui.panelComponentInfo = document.getElementById('stkPanelComponentInfo');

        // 底部播放控制条
        ui.miniBar = document.getElementById('stkMiniBar');
        ui.miniTitle = document.getElementById('stkMiniTitle');
        ui.miniArtist = document.getElementById('stkMiniArtist');
        ui.miniBtnPlay = document.getElementById('stkMiniBtnPlay');
        ui.miniBtnPrev = document.getElementById('stkMiniBtnPrev');
        ui.miniBtnNext = document.getElementById('stkMiniBtnNext');
        ui.miniBtnShuffle = document.getElementById('stkMiniBtnShuffle');
        ui.miniBtnRepeat = document.getElementById('stkMiniBtnRepeat');
        ui.miniBtnMute = document.getElementById('stkMiniBtnMute');
        ui.miniVolumeSlider = document.getElementById('stkMiniVolumeSlider');
        ui.miniProgressBar = document.getElementById('stkMiniProgressBar');
        ui.miniProgressFill = document.getElementById('stkMiniProgressFill');
        ui.miniProgressThumb = document.getElementById('stkMiniProgressThumb');
        ui.miniCurrentTime = document.getElementById('stkMiniCurrentTime');
        ui.miniDuration = document.getElementById('stkMiniDuration');
    }

    // ==================== 播放列表菜单 / 确认弹窗（挂载到 body，避免侧边栏裁剪） ====================
    function buildOverlays() {
        // “更多”下拉菜单（含删除播放列表子菜单）
        ui.menuMore = document.createElement('div');
        ui.menuMore.className = 'stk-drop-menu';
        ui.menuMore.innerHTML =
            '<div class="stk-drop-item" data-action="new-playlist">' +
                '<i class="fas fa-plus"></i>' +
                '<span class="stk-drop-label">新建播放列表</span>' +
            '</div>' +
            '<div class="stk-drop-item has-sub" data-action="delete-playlist">' +
                '<i class="fas fa-trash-can"></i>' +
                '<span class="stk-drop-label">删除播放列表</span>' +
                '<i class="fas fa-angle-right stk-sub-chevron"></i>' +
                '<div class="stk-submenu" id="stkDeleteSubmenu"></div>' +
            '</div>';
        document.body.appendChild(ui.menuMore);

        // 播放列表切换/重命名菜单（点击标题弹出）
        ui.menuPlaylist = document.createElement('div');
        ui.menuPlaylist.className = 'stk-drop-menu';
        document.body.appendChild(ui.menuPlaylist);

        // 删除确认弹窗
        ui.confirmMask = document.createElement('div');
        ui.confirmMask.className = 'stk-confirm-mask';
        ui.confirmMask.innerHTML =
            '<div class="stk-confirm-box">' +
                '<div class="stk-confirm-icon"><i class="fas fa-trash-can"></i></div>' +
                '<h4>删除播放列表</h4>' +
                '<p id="stkConfirmText"></p>' +
                '<div class="stk-confirm-actions">' +
                    '<button id="stkConfirmCancel" type="button">取消</button>' +
                    '<button id="stkConfirmOk" type="button">确定删除</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(ui.confirmMask);
        ui.confirmText = document.getElementById('stkConfirmText');
        ui.confirmCancelBtn = document.getElementById('stkConfirmCancel');
        ui.confirmOkBtn = document.getElementById('stkConfirmOk');
    }

    // -------- 下拉菜单定位与开关 --------
    function positionMenu(menu) {
        var anchor = menu._anchor;
        if (!anchor) return;
        var r = anchor.getBoundingClientRect();
        var mw = menu.offsetWidth;
        var mh = menu.offsetHeight;
        var left = r.right - mw; // 默认右对齐锚点
        left = Math.max(8, Math.min(left, window.innerWidth - mw - 8));
        var top = r.bottom + 6;
        if (top + mh > window.innerHeight - 8) {
            top = Math.max(8, r.top - mh - 6);
        }
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    function openDropdown(menu, anchor) {
        closeAllDropdowns();
        menu._anchor = anchor;
        menu.classList.add('open');
        positionMenu(menu);
    }

    function closeAllDropdowns() {
        var closed = false;
        [ui.menuMore, ui.menuPlaylist].forEach(function (m) {
            if (m && m.classList.contains('open')) {
                m.classList.remove('open');
                m._anchor = null;
                closed = true;
            }
        });
        return closed;
    }

    function anyDropdownOpen() {
        return (ui.menuMore && ui.menuMore.classList.contains('open')) ||
               (ui.menuPlaylist && ui.menuPlaylist.classList.contains('open'));
    }

    function repositionOpenMenus() {
        [ui.menuMore, ui.menuPlaylist].forEach(function (m) {
            if (m && m.classList.contains('open')) positionMenu(m);
        });
    }

    // -------- 菜单内容渲染 --------
    function renderDeleteSubmenu() {
        if (!ui.menuMore) return;
        var sub = ui.menuMore.querySelector('#stkDeleteSubmenu');
        if (!sub) return;
        var html = state.playlists.map(function (p) {
            if (p.builtin) {
                return '<div class="stk-drop-item disabled" data-del-id="' + p.id + '">' +
                    '<span class="stk-drop-label">' + esc(p.name) + '</span>' +
                    '<span class="stk-drop-hint">默认</span>' +
                '</div>';
            }
            return '<div class="stk-drop-item danger" data-del-id="' + p.id + '">' +
                '<span class="stk-drop-label">' + esc(p.name) + '</span>' +
                '<span class="stk-drop-hint">' + p.tracks.length + '首</span>' +
            '</div>';
        }).join('');
        sub.innerHTML = html;
    }

    function renderPlaylistMenu() {
        if (!ui.menuPlaylist) return;
        var html = state.playlists.map(function (p) {
            var active = p.id === state.activePlaylistId;
            return '<div class="stk-drop-item' + (active ? ' active' : '') + '" data-pl-id="' + p.id + '">' +
                '<span class="stk-pl-check">' + (active ? '<i class="fas fa-check"></i>' : '') + '</span>' +
                '<span class="stk-drop-label">' + esc(p.name) + '</span>' +
                '<span class="stk-drop-hint">' + p.tracks.length + '首</span>' +
                '<button class="stk-pl-rename-btn" data-rename-id="' + p.id + '" title="重命名"><i class="fas fa-pen"></i></button>' +
            '</div>';
        }).join('');
        html += '<div class="stk-drop-sep"></div>' +
            '<div class="stk-drop-item" data-action="new-from-title">' +
                '<i class="fas fa-plus"></i>' +
                '<span class="stk-drop-label">新建播放列表</span>' +
            '</div>';
        ui.menuPlaylist.innerHTML = html;
    }

    // 标题菜单内的行内重命名
    function startInlineRename(plId) {
        var row = ui.menuPlaylist.querySelector('.stk-drop-item[data-pl-id="' + plId + '"]');
        var pl = getPlaylistById(plId);
        if (!row || !pl) return;
        row.classList.add('renaming');
        row.innerHTML =
            '<div class="stk-rename-row">' +
                '<input class="stk-rename-input" maxlength="30" value="' + esc(pl.name) + '">' +
                '<button class="stk-rename-btn ok" title="确定"><i class="fas fa-check"></i></button>' +
                '<button class="stk-rename-btn cancel" title="取消"><i class="fas fa-xmark"></i></button>' +
            '</div>';
        var input = row.querySelector('input');
        input.focus();
        input.select();
        input.addEventListener('keydown', function (e) {
            e.stopPropagation();
            if (e.key === 'Enter') {
                confirmInlineRename(plId, input.value);
            } else if (e.key === 'Escape') {
                renderPlaylistMenu();
            }
        });
    }

    function confirmInlineRename(plId, value) {
        renamePlaylist(plId, value);
        renderPlaylistMenu(); // 重命名后刷新菜单（保持展开）
    }

    // -------- 删除确认弹窗 --------
    var pendingDeleteId = null;
    function openConfirmDelete(plId) {
        var pl = getPlaylistById(plId);
        if (!pl) return;
        pendingDeleteId = plId;
        ui.confirmText.textContent = '确定要删除播放列表「' + pl.name + '」吗？列表内' + pl.tracks.length + '首歌曲将一并移除，该操作无法撤销。';
        ui.confirmMask.classList.add('show');
    }
    function hideConfirmDelete() {
        pendingDeleteId = null;
        ui.confirmMask.classList.remove('show');
    }

    // -------- 头部标题 / 导入栏同步 --------
    function updatePlaylistHeader() {
        if (!ui.sidebarTitle) return;
        var pl = getActivePlaylist();
        if (!pl) return;
        if (state.settingsMode) return;   // 设置模式下由设置面板处理标题
        // 专辑浏览模式优先
        if (applyAlbumHeader()) return;
        ui.sidebarTitle.innerHTML = esc(pl.name) + '<i class="fas fa-angle-down stk-title-caret"></i>';
        ui.sidebarTitle.title = '点击切换播放列表';
        ui.trackCount.textContent = '共 ' + pl.tracks.length + ' 首曲目';
    }

    function updateImportBarVisibility() {
        if (!ui.importBar) return;
        var pl = getActivePlaylist();
        ui.importBar.classList.toggle('show', !!(pl && !pl.builtin));
    }

    // ==================== 播放逻辑 ====================
    function createAudio() {
        audio = new Audio();
        audio.preload = 'none';

        audio.addEventListener('loadedmetadata', function () {
            ui.duration.textContent = formatTime(audio.duration);
            var itemDur = document.getElementById('stkItemDur-' + state.currentIndex);
            if (itemDur) itemDur.textContent = formatTime(audio.duration);
            if (ui.miniDuration) ui.miniDuration.textContent = formatTime(audio.duration);
        });

        audio.addEventListener('timeupdate', function () {
            if (activeSeekCount === 0) updateProgress();
        });

        audio.addEventListener('durationchange', function () {
            ui.duration.textContent = formatTime(audio.duration);
            if (ui.miniDuration) ui.miniDuration.textContent = formatTime(audio.duration);
        });

        audio.addEventListener('play', function () {
            state.isPlaying = true;
            state.consecutiveErrors = 0;
            updatePlayUI();
        });

        audio.addEventListener('pause', function () {
            state.isPlaying = false;
            updatePlayUI();
        });

        audio.addEventListener('waiting', function () {
            if (state.playRequested) setStatus('正在缓冲…');
        });

        audio.addEventListener('canplay', function () {
            setStatus('');
        });

        audio.addEventListener('ended', function () {
            handleTrackEnded();
        });

        audio.addEventListener('error', function () {
            handleAudioError();
        });
    }

    function setNowPlayingInfo(track) {
        ui.songTitle.textContent = track.title;
        ui.songArtist.textContent = track.artist + (track.album ? ' · ' + track.album : '');
        ui.discLabel.style.background = 'linear-gradient(135deg, ' + track.colors[0] + ', ' + track.colors[1] + ')';
        if (ui.miniTitle) {
            ui.miniTitle.textContent = track.title;
            ui.miniArtist.textContent = track.artist;
        }
    }

    function loadTrack(index, autoplay) {
        var track = getTrack(index);
        if (!track) return;
        // 导入曲目的音源可能尚未从 IndexedDB 恢复（刷新后立即点击的场景），先读取再播放
        if (!track.src && track.custom && !track._srcMissing) {
            setStatus('正在读取音频数据…');
            idbGetAudio(track.id).then(function (rec) {
                if (rec && rec.blob) {
                    track.src = URL.createObjectURL(rec.blob);
                } else {
                    track._srcMissing = true;
                }
                if (state.tracks[index] === track) loadTrack(index, autoplay);
            });
            return;
        }
        state.currentIndex = index;
        state.playRequested = !!autoplay;

        audio.pause();
        audio.src = track.src || '';
        audio.volume = state.muted ? 0 : state.volume;

        // 更新"正在播放"信息（主界面 + 底部控制条）
        setNowPlayingInfo(track);
        ui.currentTime.textContent = '0:00';
        ui.duration.textContent = '0:00';
        if (ui.miniCurrentTime) ui.miniCurrentTime.textContent = '0:00';
        if (ui.miniDuration) ui.miniDuration.textContent = '0:00';
        updateProgressFill(0);
        updateActiveTrackItem();
        applyCurrentTrackBackground();

        // 持久化的 foldExpanded 仍为 true 且当前曲目有背景图 → 自动恢复折叠被临时移除的 fold-expanded class
        // （enterSettingsMode / enterAlbumMode 只移除了 CSS class，没动 state.foldExpanded；
        //   本函数在每次切歌 / 选歌时都会被调用，是 fold-expanded 恢复的唯一真相来源）
        if (state.foldExpanded && ui.main && track && getTrackBackground(track.id)) {
            ui.main.classList.add('fold-expanded');
            state.foldPhase = 'expanded';
            if (ui.fold) {
                var icon = ui.fold.querySelector('.stk-fold-icon i');
                if (icon) icon.className = 'fas fa-chevron-down';
            }
        }

        updateMiniBarVisibility();
        // 设置模式下通过底部控制条切歌时，同步背景设置面板
        if (state.settingsMode && state.settingsSection === 'background') syncBackgroundPanel();
        saveSettings();

        if (autoplay) {
            playAudio();
        } else {
            updatePlayUI();
        }
    }

    function applyCurrentTrackBackground() {
        if (!ui.bgLayer) return;
        var track = getTrack(state.currentIndex);
        var bg = track ? getTrackBackground(track.id) : null;
        if (bg) {
            ui.bgLayer.style.backgroundImage = 'url(' + bg + ')';
        } else {
            ui.bgLayer.style.backgroundImage = '';
        }
    }

    // ==================== 音乐律动可视化（播放样式） ====================
    // 通过 Web Audio AnalyserNode 实时分析正在播放的音频频谱，驱动 Canvas 绘制
    // 三种律动样式：bars 音浪频谱 / ripple 波纹涟漪 / wave 流光波浪；'none' 为默认无律动。
    var VIZ_STYLES = ['none', 'bars', 'ripple', 'wave'];
    var viz = {
        raf: 0,
        lastT: 0,
        audioCtx: null,
        analyser: null,
        srcNode: null,
        freq: null,
        failed: false,                 // Web Audio 初始化失败 → 使用模拟律动兜底
        rings: [],                     // ripple 样式的涟漪圈
        lastRingSpawn: 0,
        ringColorStep: 0,              // 涟漪颜色轮转步长（保证各颜色均匀分布）
        smooth: { bass: 0, mid: 0, treble: 0, all: 0 }   // 平滑后的能量值（0~1）
    };

    // 懒创建音频分析链路（必须在用户手势触发的播放中调用，符合浏览器自动播放策略）
    // 安全策略：只有启用了律动样式时才创建音频图；且先建立"输出链路"（analyser→destination），
    // 最后才创建 MediaElementSource（该节点一旦创建就会永久接管音频元素的输出，
    // 若此后连接失败会导致"进度条在走但没有声音"，所以必须保证元素被接管时链路已完整）。
    function ensureAudioGraph() {
        if (viz.analyser || viz.failed) return viz.analyser;
        // 未启用任何律动样式 → 完全不触碰音频元素，保证原生发声路径不受影响
        if (state.playStyle === 'none') return null;
        if (!window.AudioContext && !window.webkitAudioContext) { viz.failed = true; return null; }
        try {
            var AC = window.AudioContext || window.webkitAudioContext;

            // 第一步：创建上下文与分析器，并先把输出链路接通到扬声器
            var ctx = new AC();
            var analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.82;
            analyser.connect(ctx.destination);   // 输出链路先就绪
            var freq = new Uint8Array(analyser.frequencyBinCount);

            // 第二步：输出链路就绪后，才接管音频元素并接入分析器
            var srcNode = ctx.createMediaElementSource(audio);
            srcNode.connect(analyser);

            // 全部成功后再提交到 viz（提交即代表链路完整可用）
            viz.audioCtx = ctx;
            viz.analyser = analyser;
            viz.srcNode = srcNode;
            viz.freq = freq;
            if (ctx.state === 'suspended') {
                ctx.resume()['catch'](function () { /* 自动播放策略拦截时静默，等待下次手势 */ });
            }
            return analyser;
        } catch (e) {
            // 创建失败：保持音频元素原生发声路径不受影响，下次播放时再重试
            viz.audioCtx = null;
            viz.analyser = null;
            viz.srcNode = null;
            viz.freq = null;
            return null;
        }
    }

    function setPlayStyle(style) {
        if (VIZ_STYLES.indexOf(style) === -1 || state.playStyle === style) return;
        state.playStyle = style;
        saveSettings();

        // 启用律动样式：在用户手势内立即建立音频分析链路（若音乐已在播放也能即时生效）
        if (style !== 'none') ensureAudioGraph();

        applyPlayStyle();

        if (style !== 'none') {
            // 律动样式启用后：组件位置/大小锁定为系统默认（律动效果固定在内容区布局，避免错位）
            state.layout = { position: 'center', scale: 1 };
            saveSettings();
            applyLayout();
        }
        updateLayoutEntryLock();
    }

    // 律动样式启用时，锁定"调整播放器组件位置和大小"条目（灰色不可点击 + 原因说明）
    function updateLayoutEntryLock() {
        if (!ui.settingsMenu) return;
        var locked = state.playStyle !== 'none';
        var entry = ui.settingsMenu.querySelector('.stk-settings-entry[data-section="layout"]');
        if (!entry) return;
        entry.classList.toggle('is-disabled', locked);
        entry.classList.toggle('active', false);
        var desc = entry.querySelector('.stk-settings-entry-desc');
        if (desc) {
            desc.textContent = locked
                ? '律动样式启用时已锁定（组件固定为系统默认位置）'
                : '九宫格位置与整体缩放';
        }
    }

    function applyPlayStyle() {
        var on = state.playStyle !== 'none';
        if (ui.player) ui.player.classList.toggle('viz-on', on);
        syncPlayStylePanel();
        if (on) {
            startVizLoop();
            // 律动样式启用时，组件布局始终锁定为系统默认位置
            state.layout = { position: 'center', scale: 1 };
            applyLayout();
            updateLayoutEntryLock();
        } else {
            stopVizLoop();
            updateLayoutEntryLock();
        }
    }

    function syncPlayStylePanel() {
        if (!ui.vizGrid) return;
        var btns = ui.vizGrid.querySelectorAll('button[data-style]');
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.toggle('active', btns[i].getAttribute('data-style') === state.playStyle);
        }
    }

    // 播放器组件版本信息面板：数据与弹窗样式统一取自 versionManager.js（getComponentVersionInfo）
    function renderComponentInfoPanel() {
        if (!ui.panelComponentInfo) return;
        var info = (typeof getComponentVersionInfo === 'function') ? getComponentVersionInfo('soundtrack') : null;
        if (!info) {
            ui.panelComponentInfo.innerHTML =
                '<div style="padding:28px 26px;">' +
                '<h4 class="stk-settings-card-title"><i class="fas fa-circle-info"></i>播放器组件版本</h4>' +
                '<p class="stk-settings-card-sub">暂时无法获取组件信息，请确认 versionManager.js 已正确加载。</p>' +
                '</div>';
            return;
        }
        var statusCls = info.status === '公开测试版' ? 'beta' : (info.status === '公开正式版' ? 'release' : '');
        var featuresHtml = '';
        if (info.features && info.features.length) {
            featuresHtml =
                '<div class="component-features">' +
                    '<h3><i class="fas fa-star"></i> 主要功能</h3>' +
                    '<ul>' + info.features.map(function (f) {
                        return '<li><i class="fas fa-check-circle"></i><span>' + f + '</span></li>';
                    }).join('') + '</ul>' +
                '</div>';
        }
        ui.panelComponentInfo.innerHTML =
            '<div class="component-modal-header">' +
                '<div class="component-modal-icon" style="background: ' + (info.iconBg || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') + ';">' +
                    '<i class="' + (info.icon || 'fas fa-music') + '" style="color: ' + (info.iconColor || '#fff') + ';"></i>' +
                '</div>' +
                '<div class="component-modal-title">' +
                    '<h2>' + info.name + '</h2>' +
                    '<div class="component-modal-version">' +
                        '<span class="version-tag">' + info.version + '</span>' +
                        '<span class="status-tag ' + statusCls + '">' + info.status + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="component-modal-body">' +
                '<div class="component-description"><p>' + (info.description || '') + '</p></div>' +
                featuresHtml +
                '<div class="component-info-grid">' +
                    '<div class="info-item"><div class="info-label"><i class="fas fa-calendar-plus"></i> 发布日期</div><div class="info-value">' + info.releaseDate + '</div></div>' +
                    '<div class="info-item"><div class="info-label"><i class="fas fa-calendar-check"></i> 更新日期</div><div class="info-value">' + info.updateDate + '</div></div>' +
                    '<div class="info-item"><div class="info-label"><i class="fas fa-user"></i> 开发者</div><div class="info-value">' + info.developer + '</div></div>' +
                '</div>' +
            '</div>' +
            '<div class="component-modal-footer">' +
                '<div class="component-copyright">' + info.copyright + '</div>' +
            '</div>';
    }

    function startVizLoop() {
        if (viz.raf || !ui.vizCanvas) return;
        viz.lastT = 0;
        viz.raf = requestAnimationFrame(vizTick);
    }

    function stopVizLoop() {
        if (viz.raf) {
            cancelAnimationFrame(viz.raf);
            viz.raf = 0;
        }
        // 清空主画布与预览画布
        if (ui.vizCanvas) {
            var ctx = ui.vizCanvas.getContext('2d');
            ctx.clearRect(0, 0, ui.vizCanvas.width, ui.vizCanvas.height);
        }
        if (ui.vizPreviewCanvas) {
            var pctx = ui.vizPreviewCanvas.getContext('2d');
            pctx.clearRect(0, 0, ui.vizPreviewCanvas.width, ui.vizPreviewCanvas.height);
        }
        if (ui.vizPreview) ui.vizPreview.classList.remove('is-live');
    }

    // 读取当前音频能量（低/中/高/整体），未播放或分析不可用时平滑回落到平静呼吸值
    function updateVizEnergy(now, dt) {
        var target = { bass: 0, mid: 0, treble: 0, all: 0 };
        if (viz.analyser && !audio.paused) {
            viz.analyser.getByteFrequencyData(viz.freq);
            var f = viz.freq, len = f.length;
            var sum = 0, n;
            // 低频（约 0~350Hz）：取前 8 个 bin
            for (n = 1, sum = 0; n <= 8; n++) sum += f[n];
            target.bass = sum / (8 * 255);
            // 中频：9~48
            for (n = 9, sum = 0; n <= 48; n++) sum += f[n];
            target.mid = sum / (40 * 255);
            // 高频：49~112
            for (n = 49, sum = 0; n <= 112 && n < len; n++) sum += f[n];
            target.treble = sum / Math.max(1, Math.min(112, len - 49) * 255);
            // 整体平均
            for (n = 0, sum = 0; n < len; n++) sum += f[n];
            target.all = sum / (len * 255);
        } else {
            // 平静呼吸动画（暂停 / 未播放 / 无分析器时仍有微弱律动感）
            var t = now / 1000;
            target.bass = 0.10 + 0.05 * Math.sin(t * 1.4);
            target.mid = 0.07 + 0.04 * Math.sin(t * 1.1 + 1.7);
            target.treble = 0.05 + 0.03 * Math.sin(t * 0.9 + 3.1);
            target.all = (target.bass + target.mid + target.treble) / 3;
        }
        // 指数平滑（快起慢落，视觉更自然）
        var k = dt <= 0 ? 1 : Math.min(1, dt * 10);
        var s = viz.smooth;
        s.bass += (target.bass - s.bass) * k;
        s.mid += (target.mid - s.mid) * k;
        s.treble += (target.treble - s.treble) * k;
        s.all += (target.all - s.all) * k;
    }

    // 自适应画布尺寸（含 devicePixelRatio），返回 CSS 尺寸
    function fitCanvas(canvas) {
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        var w = Math.max(1, Math.round(rect.width * dpr));
        var h = Math.max(1, Math.round(rect.height * dpr));
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
        return { w: rect.width, h: rect.height };
    }

    // 圆角矩形（兼容未提供 ctx.roundRect 的浏览器）
    function vizRoundRect(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    // 样式一：音浪 — 固定在内容区下侧的底部频谱柱状律动
    function drawVizBars(ctx, w, h, now, playing) {
        var s = viz.smooth;
        var n = 48;
        var baseline = h - 10;                       // 频谱基线：内容区底部
        var maxBarH = Math.min(220, h * 0.42);       // 音浪最高高度（固定在下侧区域）
        var grad = ctx.createLinearGradient(0, baseline, 0, baseline - maxBarH);
        grad.addColorStop(0, 'rgba(102,126,234,0.95)');
        grad.addColorStop(0.55, 'rgba(118,75,162,0.92)');
        grad.addColorStop(1, 'rgba(212,93,121,0.9)');

        // 底部光晕基线
        var glowH = 36;
        var baseGlow = ctx.createLinearGradient(0, baseline - glowH, 0, baseline);
        baseGlow.addColorStop(0, 'rgba(118,75,162,0)');
        baseGlow.addColorStop(1, 'rgba(118,75,162,' + (0.10 + s.all * 0.22).toFixed(3) + ')');
        ctx.fillStyle = baseGlow;
        ctx.fillRect(0, baseline - glowH, w, glowH);

        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(118,75,162,0.35)';
        ctx.shadowBlur = 10;
        for (var i = 0; i < n; i++) {
            var v;
            if (viz.analyser && playing) {
                // 频谱 bin 按低→高非线性映射（低频分配更多柱子，视觉更均衡）
                var bin = Math.floor(Math.pow(i / n, 1.35) * viz.freq.length * 0.62);
                v = viz.freq[Math.max(1, bin)] / 255;
                v = Math.max(v, 0.03);
            } else {
                // 模拟律动（未播放或无分析器）
                v = 0.05 + 0.16 * Math.abs(Math.sin(i * 0.34 + now / 260)) * (0.5 + s.bass * 2.2);
            }
            var bw = (w / n) * 0.56;
            var x = (i + 0.5) * (w / n);
            var bh = Math.max(4, v * maxBarH);
            vizRoundRect(ctx, x - bw / 2, baseline - bh, bw, bh, bw / 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    // 样式二：波纹 — 中心涟漪随低音扩散（舒缓均衡：慢速扩散、均匀间距、颜色轮转，久看不眩晕）
    function drawVizRipple(ctx, w, h, now, dt, playing) {
        var s = viz.smooth;
        var cx = w / 2, cy = h / 2;

        // 低音冲击 → 生成新涟漪（间隔放宽至 550ms、阈值提高至 0.5，避免密集堆叠）
        if (playing && s.bass > 0.5 && now - viz.lastRingSpawn > 550) {
            viz.lastRingSpawn = now;
            if (viz.rings.length < 12) {
                // 颜色按调色板顺序轮转，保证蓝紫/紫/玫红/粉均匀分布而非随机扎堆
                viz.ringColorStep = (viz.ringColorStep + 1) % 4;
                viz.rings.push({ r: 30, a: 0.30 + Math.min(0.3, s.bass * 0.3), ci: viz.ringColorStep });
            }
        }

        // 中心呼吸光晕（幅度收敛，更柔和不抢眼）
        var coreR = 30 + s.bass * 60 + s.all * 26;
        var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 1.6);
        core.addColorStop(0, 'rgba(118,75,162,' + (0.08 + s.bass * 0.14).toFixed(3) + ')');
        core.addColorStop(0.6, 'rgba(102,126,234,' + (0.04 + s.all * 0.08).toFixed(3) + ')');
        core.addColorStop(1, 'rgba(102,126,234,0)');
        ctx.fillStyle = core;
        ctx.fillRect(0, 0, w, h);

        // 涟漪圈
        var palette = [
            [102, 126, 234],   // 蓝紫
            [118, 75, 162],    // 紫
            [212, 93, 121],    // 玫红
            [250, 112, 154]    // 粉
        ];
        for (var i = viz.rings.length - 1; i >= 0; i--) {
            var ring = viz.rings[i];
            // 扩散速度约为原来的一半，弱能量耦合，圈与圈之间保持均匀间距
            ring.r += (34 + 105 * s.all + 55 * s.bass) * dt;
            ring.a -= dt * 0.15;   // 淡出同步放慢，单圈寿命约 2~4 秒，扩散轨迹更从容
            if (ring.a <= 0.01 || ring.r > Math.max(w, h) * 0.7) {
                viz.rings.splice(i, 1);
                continue;
            }
            var c = palette[ring.ci % palette.length];
            ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + ring.a.toFixed(3) + ')';
            ctx.lineWidth = 1.2 + s.bass * 1.6;
            ctx.beginPath();
            ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 中心律动圆点（缩放幅度收敛，节奏更沉稳）
        ctx.fillStyle = 'rgba(118,75,162,' + (0.30 + s.bass * 0.4).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(cx, cy, 6 + s.bass * 8, 0, Math.PI * 2);
        ctx.fill();
    }

    // 样式三：流光波浪 — 固定在内容区下侧，层叠声波随旋律起伏
    function drawVizWave(ctx, w, h, now, playing) {
        var s = viz.smooth;
        var layers = [
            { amp: 1.0, speed: 1.0, color: 'rgba(102,126,234,0.20)', line: 'rgba(102,126,234,0.55)' },
            { amp: 0.72, speed: 1.45, color: 'rgba(118,75,162,0.22)', line: 'rgba(118,75,162,0.6)' },
            { amp: 0.48, speed: 1.9, color: 'rgba(212,93,121,0.22)', line: 'rgba(212,93,121,0.62)' }
        ];
        // 波浪锚定在内容区下侧：基线固定在下方 80% 处，整体振幅封顶，不会跑到内容区上半部分
        var baseY = h * 0.80;
        var maxAmp = Math.min(90, h * 0.16);
        var energy = playing ? (0.35 + s.mid * 1.6 + s.bass * 0.9) : (0.3 + s.mid * 0.5);

        for (var li = 0; li < layers.length; li++) {
            var L = layers[li];
            var amp = Math.min(maxAmp, (10 + s.mid * 70) * L.amp * energy * 0.55);
            var step = 22;
            ctx.beginPath();
            ctx.moveTo(-10, h + 10);
            for (var x = -10; x <= w + step; x += step) {
                var phase = now / (620 / L.speed) + li * 1.4;
                var y = baseY
                    + Math.sin(x * 0.011 + phase) * amp
                    + Math.sin(x * 0.004 + now / (1300 / L.speed) + li) * amp * 0.5
                    + Math.sin(x * 0.023 - now / (420 / L.speed)) * amp * 0.18 * (0.4 + s.treble * 2);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(w + 10, h + 10);
            ctx.closePath();
            ctx.fillStyle = L.color;
            ctx.fill();
            // 波峰描边（流光感）
            ctx.strokeStyle = L.line;
            ctx.lineWidth = 1.6;
            ctx.shadowColor = L.line;
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    function vizTick(now) {
        viz.raf = requestAnimationFrame(vizTick);
        if (!viz.lastT) viz.lastT = now;
        var dt = Math.min(0.05, (now - viz.lastT) / 1000);
        viz.lastT = now;
        var playing = audio && !audio.paused;

        updateVizEnergy(now, dt);

        // 兜底：音频上下文被自动播放策略挂起且音乐正在播放时，定时尝试恢复（防止无声）
        if (viz.audioCtx && viz.audioCtx.state === 'suspended' && audio && !audio.paused &&
            now - (viz._lastResume || 0) > 2000) {
            viz._lastResume = now;
            viz.audioCtx.resume()['catch'](function () {});
        }

        // 主画布：播放器区域内绘制
        if (ui.vizCanvas && state.playStyle !== 'none') {
            var size = fitCanvas(ui.vizCanvas);
            var ctx = ui.vizCanvas.getContext('2d');
            var dpr = window.devicePixelRatio || 1;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, size.w, size.h);
            if (state.playStyle === 'bars') drawVizBars(ctx, size.w, size.h, now, playing);
            else if (state.playStyle === 'ripple') drawVizRipple(ctx, size.w, size.h, now, dt, playing);
            else if (state.playStyle === 'wave') drawVizWave(ctx, size.w, size.h, now, playing);
        }

        // 预览画布：仅在播放样式设置面板打开时绘制
        if (ui.vizPreviewCanvas && ui.vizPreview && state.settingsSection === 'playstyle') {
            if (state.playStyle !== 'none') {
                ui.vizPreview.classList.add('is-live');
                var psize = fitCanvas(ui.vizPreviewCanvas);
                var pctx = ui.vizPreviewCanvas.getContext('2d');
                var pdpr = window.devicePixelRatio || 1;
                pctx.setTransform(pdpr, 0, 0, pdpr, 0, 0);
                pctx.clearRect(0, 0, psize.w, psize.h);
                if (state.playStyle === 'bars') drawVizBars(pctx, psize.w, psize.h, now, playing);
                else if (state.playStyle === 'ripple') drawVizRipple(pctx, psize.w, psize.h, now, dt, playing);
                else if (state.playStyle === 'wave') drawVizWave(pctx, psize.w, psize.h, now, playing);
            } else {
                ui.vizPreview.classList.remove('is-live');
            }
        }
    }

    function playAudio() {
        if (state.currentIndex === -1) {
            loadTrack(0, true);
            return;
        }
        ensureAudioGraph();   // 用户手势内懒创建音频分析链路（供律动可视化使用）
        state.playRequested = true;
        setStatus('');
        fadeAudio(true, 500); // 淡入 500ms
    }

    function pauseAudio() {
        state.playRequested = false;
        state.isPlaying = false;
        updatePlayUI(); // 立即切换按钮状态，不等淡出完成
        fadeAudio(false, 500); // 淡出 500ms
    }

    function togglePlay() {
        if (state.isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    }

    function pickShuffleIndex() {
        if (state.tracks.length <= 1) return state.currentIndex;
        var idx;
        do {
            idx = Math.floor(Math.random() * state.tracks.length);
        } while (idx === state.currentIndex);
        return idx;
    }

    function nextTrack(auto) {
        if (!state.tracks.length) return;
        var idx;
        if (state.shuffle) {
            idx = pickShuffleIndex();
        } else {
            idx = state.currentIndex + 1;
            if (idx >= state.tracks.length) idx = 0;
        }
        loadTrack(idx, true);
    }

    function prevTrack() {
        if (!state.tracks.length) return;
        // 播放超过 3 秒时，上一首按钮行为为"重新播放当前曲目"
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            if (!state.isPlaying) playAudio();
            return;
        }
        var idx = state.currentIndex - 1;
        if (idx < 0) idx = state.tracks.length - 1;
        loadTrack(idx, true);
    }

    function handleTrackEnded() {
        if (state.repeat === 'one') {
            audio.currentTime = 0;
            playAudio();
            return;
        }
        if (state.shuffle) {
            loadTrack(pickShuffleIndex(), true);
            return;
        }
        if (state.currentIndex < state.tracks.length - 1) {
            loadTrack(state.currentIndex + 1, true);
        } else if (state.repeat === 'all') {
            loadTrack(0, true);
        } else {
            state.playRequested = false;
            state.isPlaying = false;
            updatePlayUI();
            setStatus('播放列表已播放完毕');
        }
    }

    function handleAudioError() {
        // 仅在用户主动播放时提示错误并自动跳转，预加载阶段静默处理
        if (!state.playRequested) return;
        var track = getTrack(state.currentIndex);
        state.consecutiveErrors++;

        if (state.consecutiveErrors >= state.tracks.length) {
            state.playRequested = false;
            state.isPlaying = false;
            updatePlayUI();
            setStatus('播放列表中的音源均无法加载，请将音频文件放入 sounds/ 目录后重试', true);
            toastWarning('音源文件缺失，无法播放。请将音频文件放入 sounds/ 目录。');
            return;
        }

        if (state.consecutiveErrors === 1) {
            setStatus('音源加载失败，正在自动切换下一首…', true);
            toastWarning('无法加载音源：' + (track ? track.src : '未知') + '，已自动跳过。');
        }
        // 自动跳到下一首（loadTrack 会再次尝试播放，失败则继续累加错误计数）
        setTimeout(function () {
            if (state.playRequested) nextTrack(true);
        }, 400);
    }

    // ==================== UI 状态同步 ====================
    function renderPlayButton(btn) {
        btn.innerHTML = state.isPlaying
            ? '<i class="fas fa-pause"></i>'
            : '<i class="fas fa-play"></i>';
        btn.title = state.isPlaying ? '暂停' : '播放';
    }

    function updatePlayUI() {
        if (!ui.btnPlay) return;
        renderPlayButton(ui.btnPlay);
        if (ui.miniBtnPlay) renderPlayButton(ui.miniBtnPlay);
        ui.disc.classList.toggle('playing', state.isPlaying);
        updateActiveTrackItem();
    }

    function updateActiveTrackItem() {
        if (!ui.trackList) return;
        var items = ui.trackList.querySelectorAll('.stk-track-item');
        for (var i = 0; i < items.length; i++) {
            var isActive = parseInt(items[i].getAttribute('data-index'), 10) === state.currentIndex;
            items[i].classList.toggle('active', isActive);
            items[i].classList.toggle('playing', isActive && state.isPlaying);
        }
    }

    function updateProgress() {
        if (!audio.duration || isNaN(audio.duration)) return;
        var ratio = audio.currentTime / audio.duration;
        updateProgressFill(ratio);
        ui.currentTime.textContent = formatTime(audio.currentTime);
        if (ui.miniCurrentTime) ui.miniCurrentTime.textContent = formatTime(audio.currentTime);
    }

    function updateProgressFill(ratio) {
        ratio = Math.min(1, Math.max(0, ratio));
        var pct = (ratio * 100) + '%';
        ui.progressFill.style.width = pct;
        ui.progressThumb.style.left = pct;
        if (ui.miniProgressFill) {
            ui.miniProgressFill.style.width = pct;
            ui.miniProgressThumb.style.left = pct;
        }
    }

    function updateShuffleUI() {
        ui.btnShuffle.classList.toggle('active', state.shuffle);
        if (ui.miniBtnShuffle) ui.miniBtnShuffle.classList.toggle('active', state.shuffle);
    }

    function renderRepeatButton(btn) {
        btn.classList.remove('stk-btn-repeat-one');
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-repeat"></i>';
        switch (state.repeat) {
            case 'all':
                btn.classList.add('active');
                btn.title = '列表循环（点击切换单曲循环）';
                break;
            case 'one':
                // 使用 fa-repeat + CSS 角标模拟单曲循环图标
                btn.classList.add('active', 'stk-btn-repeat-one');
                btn.title = '单曲循环（点击关闭循环）';
                break;
            default:
                btn.title = '循环模式：关闭（点击切换列表循环）';
        }
    }

    function updateRepeatUI() {
        renderRepeatButton(ui.btnRepeat);
        if (ui.miniBtnRepeat) renderRepeatButton(ui.miniBtnRepeat);
    }

    function renderMuteButton(btn) {
        var vol = state.muted ? 0 : state.volume;
        var icon;
        if (state.muted || state.volume === 0) {
            icon = 'fa-volume-xmark';
        } else if (vol < 0.5) {
            icon = 'fa-volume-low';
        } else {
            icon = 'fa-volume-high';
        }
        btn.innerHTML = '<i class="fas ' + icon + '"></i>';
        btn.title = state.muted ? '取消静音' : '静音';
    }

    function updateVolumeUI() {
        var vol = state.muted ? 0 : state.volume;
        ui.volumeSlider.value = Math.round(vol * 100);
        ui.volumeSlider.style.setProperty('--vol', Math.round(vol * 100) + '%');
        if (ui.miniVolumeSlider) {
            ui.miniVolumeSlider.value = Math.round(vol * 100);
            ui.miniVolumeSlider.style.setProperty('--vol', Math.round(vol * 100) + '%');
        }
        renderMuteButton(ui.btnMute);
        if (ui.miniBtnMute) renderMuteButton(ui.miniBtnMute);
        if (audio) {
            audio.volume = vol;
            audio.muted = state.muted;
        }
    }

    // ==================== 布局应用（位置 + 缩放） ====================
    function applyLayout() {
        if (!ui.main || !ui.contentWrap) return;
        var preset = LAYOUT_PRESETS[state.layout.position] || LAYOUT_PRESETS['center'];
        ui.main.style.justifyContent = preset.justify;
        ui.main.style.alignItems = preset.align;
        ui.contentWrap.style.transform = 'scale(' + state.layout.scale + ')';
    }

    // ==================== 组件显隐 ====================
    function applyComponentsVisibility() {
        if (!ui.main) return;
        ui.main.classList.toggle('hide-disc', !state.components.disc);
        ui.main.classList.toggle('hide-songInfo', !state.components.songInfo);
    }

    // ==================== 侧边栏折叠 ====================
    function applySidebarCollapse() {
        if (!ui.player) return;
        ui.player.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
    }

    // ==================== 播放/暂停淡入淡出（不修改音量条） ====================
    var fadeAnimId = null;
    function fadeAudio(fadeIn, duration) {
        duration = duration || 500; // 默认 500ms，柔和不过快
        if (fadeAnimId) { cancelAnimationFrame(fadeAnimId); fadeAnimId = null; }

        var targetVol = state.muted ? 0 : state.volume;
        var startVol = fadeIn ? audio.volume : audio.volume; // 以当前实际音量为起点，避免跳跃
        var startTime = null;

        // 如果已经是静音状态，直接处理不做动画
        if (targetVol <= 0.001) {
            if (fadeIn) {
                // target 已经是 0，直接 play（静音播放）
                var promise0 = audio.play();
                if (promise0 && typeof promise0.catch === 'function') {
                    promise0.catch(function () {
                        if (!audio.error) { state.isPlaying = false; updatePlayUI(); }
                    });
                }
            } else {
                audio.pause();
            }
            return;
        }

        function step(ts) {
            if (startTime === null) startTime = ts;
            var elapsed = ts - startTime;
            var progress = Math.min(elapsed / duration, 1);

            // easeInOutQuad
            var ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            var curVol = fadeIn ? startVol + (targetVol - startVol) * ease
                               : startVol - (startVol - 0) * ease;

            audio.volume = curVol;

            if (progress < 1) {
                fadeAnimId = requestAnimationFrame(step);
            } else {
                fadeAnimId = null;
                if (!fadeIn) {
                    audio.pause();
                    audio.volume = targetVol; // 恢复音量，下次播放是正常的
                } else {
                    audio.volume = targetVol;
                }
            }
        }

        if (fadeIn) {
            var promise = audio.play();
            if (promise && typeof promise.catch === 'function') {
                promise.then(function () { fadeAnimId = requestAnimationFrame(step); }).catch(function () {
                    // 自动播放被拦截等情况
                    if (!audio.error) { state.isPlaying = false; updatePlayUI(); }
                });
            } else {
                fadeAnimId = requestAnimationFrame(step);
            }
        } else {
            // 如果已经没在播放或音量为0，直接暂停
            if (audio.paused || audio.volume <= 0.001) {
                audio.pause();
                audio.volume = targetVol;
                return;
            }
            fadeAnimId = requestAnimationFrame(step);
        }
    }

    // ==================== 事件绑定 ====================
    var activeSeekCount = 0; // 正在拖拽中的进度条数量（拖拽期间暂停 timeupdate 同步）

    // 为进度条绑定拖拽/点击跳转（Pointer Events，兼容鼠标与触摸）
    function attachSeek(barEl) {
        var seeking = false;
        function doSeek(clientX) {
            var rect = barEl.getBoundingClientRect();
            var ratio = (clientX - rect.left) / rect.width;
            ratio = Math.min(1, Math.max(0, ratio));
            if (audio.duration && !isNaN(audio.duration)) {
                audio.currentTime = ratio * audio.duration;
            }
            updateProgressFill(ratio);
        }
        barEl.addEventListener('pointerdown', function (e) {
            if (!audio.duration || isNaN(audio.duration)) return;
            seeking = true;
            activeSeekCount++;
            barEl.classList.add('dragging');
            try { barEl.setPointerCapture(e.pointerId); } catch (err) { /* 部分浏览器不支持时忽略 */ }
            doSeek(e.clientX);
        });
        barEl.addEventListener('pointermove', function (e) {
            if (!seeking) return;
            doSeek(e.clientX);
        });
        var endSeek = function (e) {
            if (!seeking) return;
            seeking = false;
            activeSeekCount = Math.max(0, activeSeekCount - 1);
            barEl.classList.remove('dragging');
            try { barEl.releasePointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
        };
        barEl.addEventListener('pointerup', endSeek);
        barEl.addEventListener('pointercancel', endSeek);
    }

    // ==================== 共用控制动作（主界面与底部控制条共用） ====================
    function toggleShuffle() {
        state.shuffle = !state.shuffle;
        updateShuffleUI();
        saveSettings();
    }

    function cycleRepeat() {
        state.repeat = state.repeat === 'off' ? 'all' : (state.repeat === 'all' ? 'one' : 'off');
        updateRepeatUI();
        saveSettings();
    }

    function toggleMute() {
        state.muted = !state.muted;
        if (!state.muted && state.volume === 0) state.volume = 0.8;
        updateVolumeUI();
        saveSettings();
    }

    function setVolumeFromSlider(el) {
        state.volume = parseInt(el.value, 10) / 100;
        if (state.volume > 0) state.muted = false;
        updateVolumeUI();
        saveSettings();
    }

    function bindEvents() {
        // 播放列表点击（事件委托）
        ui.trackList.addEventListener('click', function (e) {
            var item = e.target.closest('.stk-track-item');
            if (!item) return;
            var index = parseInt(item.getAttribute('data-index'), 10);
            if (isNaN(index)) return;
            if (index === state.currentIndex) {
                togglePlay();
            } else {
                loadTrack(index, true);
            }
        });

        // 播放 / 暂停
        ui.btnPlay.addEventListener('click', function () {
            togglePlay();
        });

        // 上一首 / 下一首
        ui.btnPrev.addEventListener('click', function () {
            prevTrack();
        });
        ui.btnNext.addEventListener('click', function () {
            nextTrack(false);
        });

        // 随机播放
        ui.btnShuffle.addEventListener('click', toggleShuffle);

        // 循环模式：关闭 → 列表循环 → 单曲循环
        ui.btnRepeat.addEventListener('click', cycleRepeat);

        // 静音
        ui.btnMute.addEventListener('click', toggleMute);

        // 音量滑块
        ui.volumeSlider.addEventListener('input', function () {
            setVolumeFromSlider(ui.volumeSlider);
        });

        // 进度条拖拽 / 点击跳转（主界面 + 底部控制条，Pointer Events 兼容鼠标与触摸）
        attachSeek(ui.progressBar);
        if (ui.miniProgressBar) attachSeek(ui.miniProgressBar);

        // ==================== 折页交互：hover 淡显背景 / 点击全显背景 ====================
        // 折页按钮固定在右下角（hitzone 也固定不动，无 hover 反馈循环）：
        //   鼠标悬浮 → .fold-hover：自定义背景以淡透明（18%）预览
        //   点击折页 → .fold-expanded：背景完全显示（100%）
        //   点击空白区域或按 Esc → 收起

        ui.foldHitzone.addEventListener('mouseenter', function () {
            if (!ui.main || ui.main.classList.contains('fold-expanded')) return;
            ui.main.classList.add('fold-hover');
            state.foldPhase = 'centered';
        });
        ui.foldHitzone.addEventListener('mouseleave', function () {
            if (!ui.main || ui.main.classList.contains('fold-expanded')) return;
            ui.main.classList.remove('fold-hover');
            state.foldPhase = 'closed';
        });

        // 点击 → 完全展开 / 收起
        ui.foldHitzone.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!ui.main) return;
            var icon = ui.fold ? ui.fold.querySelector('.stk-fold-icon i') : null;
            if (ui.main.classList.contains('fold-expanded')) {
                // 收回
                ui.main.classList.remove('fold-expanded');
                ui.main.classList.remove('fold-hover');
                state.foldPhase = 'closed';
                state.foldExpanded = false;
                if (icon) icon.className = 'fas fa-image';
            } else {
                // 展开（保持 hitzone 可点击，让用户能再次点击收回）
                ui.main.classList.add('fold-expanded');
                state.foldPhase = 'expanded';
                state.foldExpanded = true;
                if (icon) icon.className = 'fas fa-chevron-down';
            }
            saveSettings();
        });

        // 注意：展开后背景不会因点击播放器组件而自动消失。
        // 只有以下方式收回：
        //   1) 再次点击折页处（#stkFoldHitzone）
        //   2) 按 Esc 键
        // 这样用户在展开背景后仍然可以正常操作播放控制、进度条、音量等。

        // Esc 收回展开背景 / 关闭菜单弹窗 / 退出设置模式
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            if (ui.confirmMask && ui.confirmMask.classList.contains('show')) {
                hideConfirmDelete();
                return;
            }
            if (closeAllDropdowns()) return;
            if (ui.main && ui.main.classList.contains('fold-expanded')) {
                ui.main.classList.remove('fold-expanded');
                ui.main.classList.remove('fold-hover');
                state.foldPhase = 'closed';
                state.foldExpanded = false;
                if (ui.fold) {
                    var icon = ui.fold.querySelector('.stk-fold-icon i');
                    if (icon) icon.className = 'fas fa-image';
                }
                saveSettings();
                return;
            }
            if (state.settingsMode) { exitSettingsMode(); return; }
            // 专辑模式：已选专辑则先回总览，再按一次完全退出
            if (state.albumMode) {
                if (state.selectedAlbumId) backToAlbumGrid();
                else exitAlbumMode();
            }
        });

        // ===== 侧边栏折叠/展开 =====
        if (ui.collapseSidebarBtn) {
            ui.collapseSidebarBtn.addEventListener('click', function () {
                state.sidebarCollapsed = true;
                applySidebarCollapse();
                saveSettings();
            });
        }
        if (ui.expandSidebarBtn) {
            ui.expandSidebarBtn.addEventListener('click', function () {
                state.sidebarCollapsed = false;
                applySidebarCollapse();
                saveSettings();
            });
        }

        // ===== 播放器设置入口（侧边栏标题文本右侧）/ 返回按钮 / 设置条目 =====
        ui.settingsBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            closeAllDropdowns();
            if (state.albumMode) exitAlbumMode();     // 与专辑浏览互斥
            enterSettingsMode();
        });
        if (ui.settingsBackBtn) {
            ui.settingsBackBtn.addEventListener('click', exitSettingsMode);
        }
        if (ui.settingsMenu) {
            ui.settingsMenu.addEventListener('click', function (e) {
                var entry = e.target.closest('.stk-settings-entry');
                if (!entry) return;
                if (entry.classList.contains('is-disabled')) return;   // 被锁定的条目（律动样式启用时锁定布局）
                showSettingsSection(entry.getAttribute('data-section'));
            });
        }

        // ===== 专辑浏览入口（位于更多按钮左侧） =====
        if (ui.albumBtn) {
            ui.albumBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                closeAllDropdowns();
                if (state.albumMode) {
                    // 再点一次 → 完全退出
                    exitAlbumMode();
                } else {
                    enterAlbumMode();
                }
            });
        }
        // 专辑卡片点击：选中专辑（事件委托）
        if (ui.albumCards) {
            ui.albumCards.addEventListener('click', function (e) {
                var card = e.target.closest('.stk-album-card');
                if (!card) return;
                var id = card.getAttribute('data-album-id');
                if (!id) return;
                selectAlbum(id);
            });
        }
        // 专辑详情内返回按钮 → 回到专辑总览
        if (ui.albumBackBtn) {
            ui.albumBackBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                backToAlbumGrid();
            });
        }

        // ===== "更多"按钮：新建 / 删除播放列表（多级菜单） =====
        ui.moreBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (ui.menuMore.classList.contains('open')) {
                closeAllDropdowns();
                return;
            }
            renderDeleteSubmenu();
            openDropdown(ui.menuMore, ui.moreBtn);
        });
        ui.menuMore.addEventListener('click', function (e) {
            e.stopPropagation();
            var item = e.target.closest('.stk-drop-item');
            if (!item) return;
            // 点击"删除播放列表"父级：切换子菜单展开（兼容触摸屏）
            if (item.classList.contains('has-sub')) {
                item.classList.toggle('sub-open');
                return;
            }
            if (item.classList.contains('disabled')) {
                toastWarning('内置播放列表不可删除');
                return;
            }
            var delId = item.getAttribute('data-del-id');
            if (delId) {
                closeAllDropdowns();
                openConfirmDelete(delId);
                return;
            }
            if (item.getAttribute('data-action') === 'new-playlist') {
                closeAllDropdowns();
                createPlaylist();
            }
        });

        // ===== 播放列表标题：点击弹出切换/重命名菜单 =====
        ui.sidebarTitle.addEventListener('click', function (e) {
            if (state.settingsMode || state.albumMode) return;
            e.stopPropagation();
            if (ui.menuPlaylist.classList.contains('open')) {
                closeAllDropdowns();
                return;
            }
            renderPlaylistMenu();
            openDropdown(ui.menuPlaylist, ui.sidebarTitle);
        });
        ui.menuPlaylist.addEventListener('click', function (e) {
            e.stopPropagation();
            var renameBtn = e.target.closest('.stk-pl-rename-btn');
            if (renameBtn) {
                startInlineRename(renameBtn.getAttribute('data-rename-id'));
                return;
            }
            var rnBtn = e.target.closest('.stk-rename-btn');
            if (rnBtn) {
                var rRow = rnBtn.closest('.stk-drop-item');
                var rInput = rRow ? rRow.querySelector('input') : null;
                if (rInput && rnBtn.classList.contains('ok')) {
                    confirmInlineRename(rRow.getAttribute('data-pl-id'), rInput.value);
                } else {
                    renderPlaylistMenu();
                }
                return;
            }
            if (e.target.closest('.stk-rename-input')) return; // 输入框内点击不触发切换
            var item = e.target.closest('.stk-drop-item');
            if (!item) return;
            if (item.getAttribute('data-action') === 'new-from-title') {
                closeAllDropdowns();
                createPlaylist();
                return;
            }
            var plId = item.getAttribute('data-pl-id');
            if (plId && plId !== state.activePlaylistId) {
                closeAllDropdowns();
                switchPlaylist(plId);
            } else {
                closeAllDropdowns();
            }
        });

        // ===== 导入歌曲（仅自定义播放列表显示） =====
        ui.importBtn.addEventListener('click', function () {
            ui.importInput.click();
        });
        ui.importInput.addEventListener('change', function () {
            importAudioFiles(ui.importInput.files);
            ui.importInput.value = '';
        });

        // ===== 删除确认弹窗 =====
        ui.confirmOkBtn.addEventListener('click', function () {
            var id = pendingDeleteId;
            hideConfirmDelete();
            if (id) performDeletePlaylist(id);
        });
        ui.confirmCancelBtn.addEventListener('click', hideConfirmDelete);
        ui.confirmMask.addEventListener('click', function (e) {
            if (e.target === ui.confirmMask) hideConfirmDelete(); // 点击遮罩关闭
        });

        // ===== 点击外部区域 / 滚动 / 缩放时处理下拉菜单 =====
        document.addEventListener('click', function (e) {
            if (!anyDropdownOpen()) return;
            var t = e.target;
            if (t.closest && (t.closest('.stk-drop-menu') ||
                t.closest('#stkMoreBtn') || t.closest('#stkSidebarTitle'))) return;
            closeAllDropdowns();
        });
        document.addEventListener('scroll', repositionOpenMenus, true);
        window.addEventListener('resize', repositionOpenMenus);

        // ===== 右侧设置面板：自定义背景（选择后立即生效并保存） =====
        ui.bgFileInput.addEventListener('change', function () {
            var file = ui.bgFileInput.files && ui.bgFileInput.files[0];
            if (!file) return;
            var track = getTrack(state.currentIndex);
            if (!track) {
                toastWarning('请先返回播放列表选择一首曲目，再设置背景。');
                ui.bgFileInput.value = '';
                return;
            }
            readFileAsDataURL(file, 3).then(function (dataURL) {
                setTrackBackground(track.id, dataURL);
                applyCurrentTrackBackground();
                syncBackgroundPanel();
                ui.bgFileInput.value = '';
            }).catch(function (err) {
                toastWarning(err.message || '图片读取失败');
                ui.bgFileInput.value = '';
            });
        });
        ui.bgClearBtn.addEventListener('click', function () {
            var track = getTrack(state.currentIndex);
            if (track) {
                clearTrackBackground(track.id);
                applyCurrentTrackBackground();
            }
            syncBackgroundPanel();
        });

        // ===== 右侧设置面板：布局（九宫格位置 + 缩放，即时生效） =====
        ui.layoutGrid.addEventListener('click', function (e) {
            if (state.playStyle !== 'none') return;   // 律动样式启用时布局已锁定
            var btn = e.target.closest('button[data-pos]');
            if (!btn) return;
            var pos = btn.getAttribute('data-pos');
            if (!LAYOUT_PRESETS[pos]) return;
            var buttons = ui.layoutGrid.querySelectorAll('button');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].classList.toggle('active', buttons[i].getAttribute('data-pos') === pos);
            }
            state.layout.position = pos;
            applyLayout();
            saveSettings();
        });
        ui.layoutScale.addEventListener('input', function () {
            if (state.playStyle !== 'none') return;   // 律动样式启用时布局已锁定
            var val = parseInt(ui.layoutScale.value, 10);
            ui.layoutScaleVal.textContent = val + '%';
            ui.layoutScale.style.setProperty('--lv', ((val - 70) / 60 * 100) + '%');
            state.layout.scale = val / 100;
            applyLayout();
            saveSettings();
        });
        ui.layoutReset.addEventListener('click', function () {
            if (state.playStyle !== 'none') return;   // 律动样式启用时布局已锁定
            state.layout.position = 'center';
            state.layout.scale = 1;
            applyLayout();
            syncLayoutPanel();
            saveSettings();
        });

        // ===== 右侧设置面板：组件显隐（即时生效） =====
        if (ui.compDisc) {
            ui.compDisc.addEventListener('change', function () {
                state.components.disc = !!ui.compDisc.checked;
                applyComponentsVisibility();
                saveSettings();
            });
        }
        if (ui.compSongInfo) {
            ui.compSongInfo.addEventListener('change', function () {
                state.components.songInfo = !!ui.compSongInfo.checked;
                applyComponentsVisibility();
                saveSettings();
            });
        }

        // ===== 右侧设置面板：控制条设置（即时生效） =====
        if (ui.miniBarShowAfterLeave) {
            ui.miniBarShowAfterLeave.addEventListener('change', function () {
                state.miniBar.showAfterLeave = !!ui.miniBarShowAfterLeave.checked;
                updateMiniBarVisibility();
                saveSettings();
            });
        }

        // ===== 播放样式（律动可视化）选项 =====
        if (ui.vizGrid) {
            ui.vizGrid.addEventListener('click', function (e) {
                var btn = e.target.closest('button[data-style]');
                if (!btn) return;
                setPlayStyle(btn.getAttribute('data-style'));
            });
        }

        // ===== 底部播放控制条（设置模式下不中断播放） =====
        ui.miniBtnPlay.addEventListener('click', togglePlay);
        ui.miniBtnPrev.addEventListener('click', prevTrack);
        ui.miniBtnNext.addEventListener('click', function () {
            nextTrack(false);
        });
        ui.miniBtnShuffle.addEventListener('click', toggleShuffle);
        ui.miniBtnRepeat.addEventListener('click', cycleRepeat);
        ui.miniBtnMute.addEventListener('click', toggleMute);
        ui.miniVolumeSlider.addEventListener('input', function () {
            setVolumeFromSlider(ui.miniVolumeSlider);
        });
    }

    // ==================== 播放器设置模式（侧边栏设置菜单 + 右侧设置面板 + 底部控制条） ====================
    // 进入设置模式：侧边栏切换为"播放器设置"条目菜单，右侧内容区隐藏唱片等组件并显示设置面板；
    // 底部控制条在已加载曲目时显示（设置模式或离开播放器页面的其他页面），保证调整设置/切换页面时音乐控制不中断。
    function enterSettingsMode() {
        if (state.settingsMode) return;
        if (state.albumMode) exitAlbumMode();   // 与专辑浏览互斥，兜底防御
        state.settingsMode = true;
        state.settingsSection = null;
        closeAllDropdowns();

        // 临时收起展开的背景折页（仅移除 CSS class，保留用户持久化的 foldExpanded 状态，退出设置后会自动恢复）
        if (ui.main && ui.main.classList.contains('fold-expanded')) {
            ui.main.classList.remove('fold-expanded');
            ui.main.classList.remove('fold-hover');
            if (ui.fold) {
                var fi = ui.fold.querySelector('.stk-fold-icon i');
                if (fi) fi.className = 'fas fa-image';
            }
        }

        ui.player.classList.add('settings-mode');
        ui.main.classList.add('settings-mode');
        ui.sidebarTitle.textContent = '播放器设置';
        ui.trackCount.textContent = '选择条目进行调整';
        updateLayoutEntryLock();
        showSettingsSection(null);
        updateMiniBarVisibility();
    }

    // 退出设置模式：恢复播放列表侧边栏与右侧播放内容
    function exitSettingsMode() {
        if (!state.settingsMode) return;
        state.settingsMode = false;
        state.settingsSection = null;
        ui.player.classList.remove('settings-mode');
        ui.main.classList.remove('settings-mode');
        updatePlaylistHeader();
        updateImportBarVisibility();
        showSettingsSection(null);
        updateMiniBarVisibility();

        // 恢复临时收起的折页展开状态（enterSettingsMode 未改动 state.foldExpanded，所以它仍是之前的值）
        if (state.foldExpanded && ui.main && state.currentIndex >= 0) {
            var curTrack = getTrack(state.currentIndex);
            if (curTrack && getTrackBackground(curTrack.id)) {
                ui.main.classList.add('fold-expanded');
                state.foldPhase = 'expanded';
                if (ui.fold) {
                    var icon = ui.fold.querySelector('.stk-fold-icon i');
                    if (icon) icon.className = 'fas fa-chevron-down';
                }
            }
        }
    }

    // 选择要调整的设置条目，右侧内容区显示对应功能面板
    function showSettingsSection(key) {
        // 律动样式启用时，布局设置条目被锁定，不可打开
        if (key === 'layout' && state.playStyle !== 'none') key = null;
        state.settingsSection = key || null;
        if (ui.settingsMenu) {
            var entries = ui.settingsMenu.querySelectorAll('.stk-settings-entry');
            for (var i = 0; i < entries.length; i++) {
                entries[i].classList.toggle('active', entries[i].getAttribute('data-section') === state.settingsSection);
            }
        }
        if (ui.settingsPlaceholder) ui.settingsPlaceholder.style.display = state.settingsSection ? 'none' : '';
        ui.panelBackground.classList.toggle('show', state.settingsSection === 'background');
        ui.panelLayout.classList.toggle('show', state.settingsSection === 'layout');
        ui.panelComponents.classList.toggle('show', state.settingsSection === 'components');
        ui.panelMiniBar.classList.toggle('show', state.settingsSection === 'minibar');
        if (ui.panelPlayStyle) ui.panelPlayStyle.classList.toggle('show', state.settingsSection === 'playstyle');
        if (ui.panelComponentInfo) ui.panelComponentInfo.classList.toggle('show', state.settingsSection === 'componentinfo');
        if (state.settingsSection === 'background') syncBackgroundPanel();
        else if (state.settingsSection === 'layout') syncLayoutPanel();
        else if (state.settingsSection === 'components') syncComponentsPanel();
        else if (state.settingsSection === 'minibar') syncMiniBarPanel();
        else if (state.settingsSection === 'playstyle') syncPlayStylePanel();
        else if (state.settingsSection === 'componentinfo') renderComponentInfoPanel();
    }

    // 同步背景设置面板（跟随当前曲目）
    function syncBackgroundPanel() {
        var track = getTrack(state.currentIndex);
        var bg = track ? getTrackBackground(track.id) : null;
        ui.panelBgTrack.textContent = track
            ? ('当前曲目：' + track.title)
            : '尚未选择曲目 — 请返回播放列表选择一首歌曲后再设置背景';
        if (bg) {
            ui.bgPreviewImg.src = bg;
            ui.bgPreview.classList.add('has-image');
            ui.bgClearBtn.disabled = false;
        } else {
            ui.bgPreviewImg.src = '';
            ui.bgPreview.classList.remove('has-image');
            ui.bgClearBtn.disabled = true;
        }
        ui.bgChooseBtn.classList.toggle('is-disabled', !track);
    }

    // 同步布局设置面板控件状态
    function syncLayoutPanel() {
        var posButtons = ui.layoutGrid.querySelectorAll('button');
        for (var i = 0; i < posButtons.length; i++) {
            posButtons[i].classList.toggle('active', posButtons[i].getAttribute('data-pos') === state.layout.position);
        }
        var scalePct = Math.round(state.layout.scale * 100);
        ui.layoutScale.value = scalePct;
        ui.layoutScaleVal.textContent = scalePct + '%';
        ui.layoutScale.style.setProperty('--lv', ((scalePct - 70) / 60 * 100) + '%');
    }

    // 同步组件显隐面板控件状态
    function syncComponentsPanel() {
        if (ui.compDisc) ui.compDisc.checked = state.components.disc;
        if (ui.compSongInfo) ui.compSongInfo.checked = state.components.songInfo;
    }

    // 同步控制条设置面板控件状态
    function syncMiniBarPanel() {
        if (ui.miniBarShowAfterLeave) ui.miniBarShowAfterLeave.checked = state.miniBar.showAfterLeave;
    }

    // 底部播放控制条显隐：已加载曲目时，设置模式始终显示；离开播放器的其他页面按「离开音乐播放器后始终显示底部控制条」开关决定
    function updateMiniBarVisibility() {
        if (!ui.miniBar) return;
        var show = state.currentIndex >= 0 &&
            (state.settingsMode || (!isPlayerAreaVisible() && state.miniBar.showAfterLeave));
        ui.miniBar.classList.toggle('show', show);
    }

    // 播放器区域当前是否可见（被页面切换隐藏时返回 false）
    function isPlayerAreaVisible() {
        var area = document.getElementById('soundtrackArea');
        if (!area) return false;
        var rect = area.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    // 监听页面切换：播放器区域被隐藏/显示时及时同步控制条（导航逻辑在外部，采用轻量轮询）
    function startMiniBarWatcher() {
        if (startMiniBarWatcher._timer) return;
        startMiniBarWatcher._timer = setInterval(updateMiniBarVisibility, 400);
    }

    // ==================== 初始化入口 ====================
    function initSoundtrackPlayer() {
        if (initialized) return;
        var container = document.getElementById('soundtrackArea');
        if (!container) return; // 游戏中心内容尚未生成时跳过，打开时会再次调用

        injectStyles();
        loadPlaylists();      // 先加载播放列表（state.tracks 指向活动列表），再恢复设置
        loadSettings();
        loadBackgrounds();

        container.innerHTML = buildPlayerHTML();
        cacheElements();
        buildOverlays();
        createAudio();
        renderTrackList();
        bindEvents();
        updatePlaylistHeader();
        updateImportBarVisibility();
        restoreCustomAudio(); // 异步恢复导入歌曲的音频数据

        // 底部控制条挂载到 body：页面切换隐藏播放器区域时仍可全局显示，且 fixed 定位不受父级影响
        if (ui.miniBar && ui.miniBar.parentElement !== document.body) {
            document.body.appendChild(ui.miniBar);
        }
        startMiniBarWatcher();

        // 应用持久化设置
        updateShuffleUI();
        updateRepeatUI();
        updateVolumeUI();
        applyLayout();
        applyComponentsVisibility();
        applySidebarCollapse();
        applyPlayStyle();   // 恢复持久化的播放样式（律动可视化）

        // 恢复上次播放的曲目（不自动播放，等待用户点击；导入曲目等待 IndexedDB 恢复音源）
        if (state.currentIndex >= 0 && getTrack(state.currentIndex)) {
            var track = state.tracks[state.currentIndex];
            if (track.src) audio.src = track.src;
            setNowPlayingInfo(track);
            applyCurrentTrackBackground();
            updateActiveTrackItem();
            updatePlayUI();
        } else {
            state.currentIndex = -1;
            updatePlayUI();
        }

        // 恢复折页展开状态（仅当有已设置背景图的曲目时才展开）
        if (state.foldExpanded && ui.main && state.currentIndex >= 0) {
            var curTrack = getTrack(state.currentIndex);
            if (curTrack && getTrackBackground(curTrack.id)) {
                ui.main.classList.add('fold-expanded');
                state.foldPhase = 'expanded';
                if (ui.fold) {
                    var icon = ui.fold.querySelector('.stk-fold-icon i');
                    if (icon) icon.className = 'fas fa-chevron-down';
                }
            } else {
                // 曲目无背景 → 不展开，同时清除持久化标志避免下次恢复
                state.foldExpanded = false;
                saveSettings();
            }
        }

        initialized = true;
    }

    // 对外暴露
    window.initSoundtrackPlayer = initSoundtrackPlayer;
    window.openSoundtrackPlayer = function () {
        initSoundtrackPlayer();
        if (typeof window.switchGameCenterSubPage === 'function') {
            window.switchGameCenterSubPage('soundtrack');
        }
    };
})();
