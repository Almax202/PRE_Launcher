/* 自定义字体：本地持久化（IndexedDB）与全页面应用 */
(function () {
    'use strict';

    var DB_NAME = 'launcherFontStorage';
    var STORE_NAME = 'fonts';
    var RECORD_ID = 'custom';
    var FONT_FAMILY = 'PREUserFont';
    var STYLE_ID = 'preCustomFontStyle';

    var dbPromise = null;
    var initPromise = null;
    var currentFace = null;
    var currentRecord = null;

    function openDB() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise(function (resolve, reject) {
            if (!window.indexedDB) {
                reject(new Error('indexeddb-unavailable'));
                return;
            }
            var request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = function (event) {
                var db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
            request.onsuccess = function () { resolve(request.result); };
            request.onerror = function () { reject(request.error || new Error('indexeddb-open-failed')); };
            request.onblocked = function () { reject(new Error('indexeddb-blocked')); };
        });
        return dbPromise;
    }

    function readRecord() {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readonly');
                var request = tx.objectStore(STORE_NAME).get(RECORD_ID);
                request.onsuccess = function () { resolve(request.result || null); };
                request.onerror = function () { reject(request.error); };
            });
        });
    }

    function putRecord(record) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(record);
                tx.oncomplete = function () { resolve(record); };
                tx.onerror = function () { reject(tx.error); };
                tx.onabort = function () { reject(tx.error || new Error('indexeddb-aborted')); };
            });
        });
    }

    function deleteRecord() {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).delete(RECORD_ID);
                tx.oncomplete = function () { resolve(true); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    function validateBlob(blob) {
        if (!window.FontFace) return Promise.reject(new Error('fontface-unavailable'));
        var url = URL.createObjectURL(blob);
        var face;
        try {
            face = new FontFace('PREUserFontValidate', 'url("' + url + '")');
        } catch (e) {
            URL.revokeObjectURL(url);
            return Promise.reject(e);
        }
        return face.load().then(function () {
            URL.revokeObjectURL(url);
            return true;
        }, function (err) {
            URL.revokeObjectURL(url);
            throw err;
        });
    }

    function commitBlob(blob) {
        if (!window.FontFace) return Promise.reject(new Error('fontface-unavailable'));
        var url = URL.createObjectURL(blob);
        var face = new FontFace(FONT_FAMILY, 'url("' + url + '")');
        return face.load().then(function (loaded) {
            if (currentFace) {
                try { document.fonts.delete(currentFace); } catch (e) { /* 忽略 */ }
            }
            document.fonts.add(loaded);
            currentFace = loaded;
            URL.revokeObjectURL(url);
            return loaded;
        }, function (err) {
            URL.revokeObjectURL(url);
            throw err;
        });
    }

    function injectFontStyle() {
        var style = document.getElementById(STYLE_ID);
        if (!style) {
            style = document.createElement('style');
            style.id = STYLE_ID;
            (document.head || document.documentElement).appendChild(style);
        }
        // 排除图标字体所在元素，避免自定义字体覆盖图标字形
        style.textContent = 'html body, html body *:not(i):not(.fa):not(.fas):not(.far):not(.fab):not(.fa-solid):not(.fa-regular):not(.fa-brands):not([class*="fa-"]):not([class*="mui-icon"]) { font-family: "' + FONT_FAMILY + '", "HarmonyOS Sans", "Microsoft YaHei", "PingFang SC", "Segoe UI Emoji", sans-serif !important; }';
    }

    function removeFontStyle() {
        var style = document.getElementById(STYLE_ID);
        if (style && style.parentNode) style.parentNode.removeChild(style);
    }

    function notify(record) {
        try {
            document.dispatchEvent(new CustomEvent('pre-font-change', {
                detail: { record: record || null }
            }));
        } catch (e) { /* 忽略 */ }
    }

    function applyRecord(record) {
        if (!record || !record.blob) {
            removeFontStyle();
            currentRecord = null;
            return Promise.resolve(false);
        }
        return commitBlob(record.blob).then(function () {
            currentRecord = record;
            injectFontStyle();
            notify(record);
            return true;
        });
    }

    function init() {
        if (initPromise) return initPromise;
        initPromise = readRecord().then(function (record) {
            if (!record || !record.blob) return null;
            return applyRecord(record).then(function () { return record; });
        }).catch(function () {
            return null;
        });
        return initPromise;
    }

    function isTtf(file) {
        if (!file) return false;
        var name = file.name || '';
        return /\.ttf$/i.test(name) || file.type === 'font/ttf' || file.type === 'application/x-font-ttf';
    }

    function saveFont(file) {
        if (!isTtf(file)) {
            var unsupported = new Error('unsupported-type');
            unsupported.code = 'unsupported-type';
            return Promise.reject(unsupported);
        }
        var blob;
        try {
            blob = file.slice ? file.slice(0, file.size, 'font/ttf') : file;
        } catch (e) {
            blob = file;
        }
        return validateBlob(blob).then(function () {
            var record = {
                id: RECORD_ID,
                name: (file.name || '自定义字体').replace(/\.ttf$/i, ''),
                fileName: file.name || '自定义字体.ttf',
                size: blob.size,
                type: 'font/ttf',
                importedAt: Date.now(),
                blob: blob
            };
            return putRecord(record).then(function () {
                return applyRecord(record).then(function () { return record; });
            });
        }, function () {
            var parseError = new Error('font-parse-failed');
            parseError.code = 'font-parse-failed';
            throw parseError;
        });
    }

    function clearFont() {
        return deleteRecord().then(function () {
            if (currentFace) {
                try { document.fonts.delete(currentFace); } catch (e) { /* 忽略 */ }
                currentFace = null;
            }
            currentRecord = null;
            removeFontStyle();
            notify(null);
            return true;
        });
    }

    window.CustomFont = {
        family: FONT_FAMILY,
        init: init,
        get: readRecord,
        save: saveFont,
        clear: clearFont,
        apply: applyRecord,
        isTtf: isTtf,
        getCurrent: function () { return currentRecord; }
    };

    if (document.head) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
