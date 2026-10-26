/**
 * Lucide Icons 桥接层
 * 用途：把原有 Font Awesome 图标（如 "fas fa-coins"）统一渲染为 Lucide SVG 图标，
 *      未映射的类名自动回退 Font Awesome，保证兼容性。
 * 依赖：js/lib/lucide.min.js（UMD，暴露 window.lucide）
 *
 * 关键点：图标 SVG 在生成 HTML 字符串时就同步内联输出，
 *        不再依赖 MutationObserver 异步二次渲染，因此不会出现「图标稍后才出现」的闪空问题。
 *        外层仍保留 <i> 标签，使既有 `... i` 选择器（字号、颜色等）继续生效。
 */
(function () {
    'use strict';

    // Font Awesome 类名 → Lucide 图标名（优先选用游戏类/物品类图标）
    var FA_TO_LUCIDE = {
        // 经验值加成 / 补给
        'fa-gauge': 'gauge',
        'fa-chart-line': 'chart-line',
        'fa-rocket': 'rocket',
        'fa-fire': 'flame',
        'fa-flame': 'flame',
        'fa-bolt': 'zap',
        'fa-star': 'star',
        'fa-atom': 'atom',
        'fa-asterisk': 'asterisk',
        'fa-sun': 'sun',
        'fa-meteor': 'orbit',
        // 抽卡 / 签到 / 货币
        'fa-ticket': 'ticket',
        'fa-ticket-simple': 'ticket',
        'fa-layer-group': 'layers',
        'fa-calendar-plus': 'calendar-plus',
        'fa-dice-five': 'dices',
        'fa-coins': 'coins',
        'fa-wallet': 'wallet',
        'fa-piggy-bank': 'piggy-bank',
        'fa-infinity': 'infinity',
        // 容器 / 礼包
        'fa-shopping-bag': 'shopping-bag',
        'fa-box': 'package',
        'fa-box-open': 'package-open',
        'fa-cube': 'box',
        'fa-cubes': 'boxes',
        'fa-boxes-stacked': 'boxes',
        'fa-gift': 'gift',
        // 徽章 / 勋章
        'fa-medal': 'medal',
        'fa-award': 'award',
        'fa-certificate': 'badge-check',
        'fa-ribbon': 'ribbon',
        'fa-gem': 'gem',
        'fa-crown': 'crown',
        'fa-trophy': 'trophy',
        'fa-shield-alt': 'shield',
        'fa-id-badge': 'id-card',
        'fa-id-card': 'id-card',
        // 通用 / 游戏
        'fa-th-large': 'layout-grid',
        'fa-image': 'image',
        'fa-images': 'images',
        'fa-palette': 'palette',
        'fa-bone': 'bone',
        'fa-gamepad': 'gamepad-2',
        'fa-users': 'users',
        'fa-level-up-alt': 'trending-up',
        'fa-calendar-check': 'calendar-check',
        'fa-calendar-alt': 'calendar-days',
        'fa-calendar-day': 'calendar-days',
        'fa-calendar-week': 'calendar-days',
        'fa-bullseye': 'target',
        'fa-mountain': 'mountain'
    };

    // 从 "fas fa-coins" 这类类名中提取 fa-xxx 关键字
    function extractFaKey(icon) {
        if (!icon || typeof icon !== 'string') return null;
        var parts = icon.split(/\s+/);
        for (var i = 0; i < parts.length; i++) {
            if (parts[i].indexOf('fa-') === 0) return parts[i];
        }
        return null;
    }

    // 将 Font Awesome 类名或 Lucide 图标名统一转换为 Lucide 图标名
    function toLucideName(icon) {
        if (!icon || typeof icon !== 'string') return null;
        var key = extractFaKey(icon);
        if (!key) return icon; // 本身就是 Lucide 图标名
        return FA_TO_LUCIDE[key] || null;
    }

    // Lucide 图标名（kebab-case）→ 导出键（PascalCase）
    function toPascal(name) {
        return name.split('-').map(function (part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join('');
    }

    // 取 Lucide 图标节点数据（形如 [["path", {d:"..."}], ...]）
    function getIconNode(name) {
        var lib = window.lucide;
        if (!lib) return null;
        var pascal = toPascal(name);
        var node = lib[pascal];
        if (!node && lib.icons) node = lib.icons[pascal] || lib.icons[name];
        return Array.isArray(node) ? node : null;
    }

    var SVG_BASE = 'xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"' +
        ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

    // 把图标节点数据序列化为 SVG 子元素
    function renderNodeChildren(node) {
        var html = '';
        for (var i = 0; i < node.length; i++) {
            var spec = node[i];
            var tag = spec[0];
            var attrs = spec[1] || {};
            html += '<' + tag;
            for (var k in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, k)) {
                    html += ' ' + k + '="' + attrs[k] + '"';
                }
            }
            html += '></' + tag + '>';
        }
        return html;
    }

    /**
     * 同步生成图标 HTML（立即输出 SVG，无异步延迟）
     * @param {string} icon  Font Awesome 类名（如 "fas fa-coins"）或直接传 Lucide 图标名（如 "coins"）
     * @param {object} opts  { color, style, cls }
     * @returns {string} 图标 HTML（内联 SVG；未映射/未加载时回退 Font Awesome）
     */
    window.preIcon = function (icon, opts) {
        opts = opts || {};
        var style = opts.color ? ('color:' + opts.color + ';' + (opts.style || '')) : (opts.style || '');
        var styleAttr = style ? ' style="' + style + '"' : '';
        var extraCls = opts.cls ? ' ' + opts.cls : '';
        var name = toLucideName(icon);
        var node = name ? getIconNode(name) : null;
        if (!node) {
            // 未映射或 Lucide 未加载：回退 Font Awesome，保持原有显示
            return '<i class="' + icon + extraCls + '"' + styleAttr + '></i>';
        }
        return '<i class="pre-lucide pre-lucide-' + name + extraCls + '"' + styleAttr + '>' +
            '<svg class="lucide lucide-' + name + '" ' + SVG_BASE + '>' +
            renderNodeChildren(node) +
            '</svg></i>';
    };

    // 兼容旧调用：若页面仍有 <i data-lucide> 占位，立即就地转换为 SVG
    window.refreshLucideIcons = function (root) {
        var scope = root && root.querySelectorAll ? root : document;
        var nodes = scope.querySelectorAll('i[data-lucide]');
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            var name = el.getAttribute('data-lucide');
            var node = getIconNode(name);
            if (!node) continue;
            var styleAttr = el.getAttribute('style') ? ' style="' + el.getAttribute('style') + '"' : '';
            var cls = el.className && el.className !== 'pre-lucide' ? ' ' + el.className : '';
            var holder = document.createElement('i');
            holder.className = 'pre-lucide pre-lucide-' + name + cls;
            if (styleAttr) holder.setAttribute('style', el.getAttribute('style'));
            holder.innerHTML = '<svg class="lucide lucide-' + name + '" ' + SVG_BASE + '>' + renderNodeChildren(node) + '</svg>';
            if (el.parentNode) el.parentNode.replaceChild(holder, el);
        }
    };

    // 兜底：动态插入的遗留 <i data-lucide> 也能立即转换（正常渲染路径已同步输出，无需等待）
    function start() {
        window.refreshLucideIcons(document);
        if (window.MutationObserver && document.body) {
            new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var added = mutations[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                        var node = added[j];
                        if (!node || node.nodeType !== 1) continue;
                        if ((node.tagName === 'I' && node.hasAttribute('data-lucide')) ||
                            (node.querySelector && node.querySelector('i[data-lucide]'))) {
                            window.refreshLucideIcons(node.parentNode || document);
                            return;
                        }
                    }
                }
            }).observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
