(function ($, exports, window, name) {

    if (!exports) {
        exports = {};

        if ($) {
            $[name] = exports;
        }
        else {
            window[name] = exports;
        }
    }

    var smaylik,
        codesMap = {},
        primaryCodesMap = {},
        regexp,
        metachars = /[[\]{}()*+?.\\|^$\-,&#\s]/g,
        entityMap;

    entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };

    function escape(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    /**
     * Define smaylik set.
     *
     * @param {Object} data
     */
    exports.define = function (data) {
        var name, i, codes, code,
            patterns = [];

        for (name in data) {
            codes = data[name].codes;
            for (i in codes) {
                code = codes[i];
                codesMap[code] = name;

                // Create escaped variants, because mostly you want to parse escaped
                // user text.
                codesMap[escape(code)] = name;
                if (i == 0) {
                    primaryCodesMap[code] = name;
                }
            }
        }

        for (code in codesMap) {
            patterns.push('(' + code.replace(metachars, '\\$&') + ')');
        }

        regexp = new RegExp(patterns.join('|'), 'g');
        smaylik = data;
    };

    /**
     * Replace smaylik in text.
     *
     * @param {String} text
     * @param {Function} [fn] optional template builder function.
     */
    exports.replace = function (text, fn) {
        return text.replace(regexp, function (code) {
            var name = codesMap[code];
            return (fn || exports.tpl)(name, code, smaylik[name].title);
        });
    };

    /**
     * Get primary smaylik as html string in order to display them later as overview.
     *
     * @param {Function} [fn] optional template builder function.
     * @return {String}
     */
    exports.toString = function (fn) {
        var code,
            str = '',
            name;

        for (code in primaryCodesMap) {
            name = primaryCodesMap[code];
            str += (fn || exports.tpl)(name, code, smaylik[name].title);
        }

        return str;
    };

    /**
     * Build html string for smaylik.
     *
     * @param {String} name
     * @param {String} code
     * @param {String} title
     * @return {String}
     */
    exports.tpl = function (name, code, title) {
        return '<span class="cs-smile-' + name + '" title="' + title + '">' +
               code + '</span>';
    };

}(typeof jQuery != 'undefined'
        ? jQuery
        : null,
    typeof exports != 'undefined'
        ? exports
        : null,
    window,
    'smaylik'));
