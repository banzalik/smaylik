(function ($, exports, window, name, config) {

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
        localConfig,
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

    defaultConfig = {
        clsPrefix: 'cs-smile-',
        tag: 'span'
    };


    function escape(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    // extend one object with another object's property's (default is deep extend)
    // this works with circular references and is faster than other deep extend methods
    // http://jsperf.com/comparing-custom-deep-extend-to-jquery-deep-extend/2
    // https://gist.github.com/fshost/4146993
    function extend(target, source, shallow) {
        var array = '[object Array]',
            object = '[object Object]',
            targetMeta, sourceMeta,
            setMeta = function (value) {
                var meta,
                  jclass = {}.toString.call(value);
                if (value === undefined) return 0;
                if (typeof value !== 'object') return false;
                if (jclass === array) {
                    return 1;
                }
                if (jclass === object) return 2;
            };
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                targetMeta = setMeta(target[key]);
                sourceMeta = setMeta(source[key]);
                if (source[key] !== target[key]) {
                    if (!shallow && sourceMeta && targetMeta && targetMeta === sourceMeta) {
                        target[key] = extend(target[key], source[key], true);
                    } else if (sourceMeta !== 0) {
                        target[key] = source[key];
                    }
                }
            }
            else break; // ownProperties are always first (see jQuery's isPlainObject function)
        }
        return target;
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
        config = exports.getConfig();

        return '<'+ config.tag + ' class="'+ config.clsPrefix + name + '" title="' + title + '">' +
               code + '</'+ config.tag +'>';
    };

    exports.getConfig = function () {
        if (localConfig) {
            return localConfig;
        }

        if (!config) {
            localConfig = config;
        }
        else {
            localConfig = extend(config, defaultConfig);
        }

        return localConfig;
    }

}(typeof jQuery != 'undefined'
        ? jQuery
        : null,
    typeof exports != 'undefined'
        ? exports
        : null,
    window,
    'smaylik',
    {}));
