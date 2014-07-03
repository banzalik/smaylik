var fs = require('vow-fs');
var fss = require('fs');
var path = require('path');
var inherit = require('inherit');
var Vow = require('vow');
var _ = require('lodash');
var util = require("util");
var mime = require("mime");

/**
 * MakePlatform
 * ============
 *
 * Класс MakePlatform управляет сборкой проекта.
 * @name MakePlatform
 * @class
 */
module.exports = inherit( /** @lends MakePlatform.prototype */ {

    /**
     * Конструктор.
     */
    __constructor: function () {
        this._mode = null;
        this._env = {};
        this._cdir = null;
        this._settings = {};
        this._settingsFileName = null;
        this._config = {};
        this._configFileName = null;
        this._outputFileName = null;
        this._css = '';
        this._cssCommon = [];
        this._cssRules = '';
    },

    /**
     * Инициализация
     * @param {String} cmd Путь к директории с проектом.
     * @param {String} [mode] Режим сборки. Например, development.
     * @returns {Promise}
     */
    init: function (cmd, mode) {
        var _this = this;
        this._mode = mode = mode || process.env.YENV || 'development';
        this._cdir = path.resolve(cmd.dir, cmd.path);

        this._settingsFileName = cmd.settings ?
                                    path.resolve(cmd.dir, cmd.settings) :
                                    path.resolve(cmd.dir, cmd.path, '.config.json');

        this._configFileName = cmd.config ?
                                    path.resolve(cmd.dir, cmd.config) :
                                    path.resolve(cmd.dir, cmd.path, 'config.json');

        this._outputFileName = cmd.output ?
                                    path.resolve(cmd.dir, cmd.output) :
                                    path.resolve(cmd.dir, cmd.path, 'smiles.css');

        var isBaseDir = fs.exists(this.getDir());
        var isSettings = fs.exists(this._settingsFileName);
        var isConfig = fs.exists(this._configFileName);

        isSettings.then(function() {
            _this._settings = require(_this._settingsFileName);
        });

        isConfig.then(function() {
            _this._config = require(_this._configFileName);
        });

        return Vow.all({
            base: isBaseDir,
            settings: isSettings,
            config: isConfig
        });
    },

    /**
     * Возвращает абсолютный путь к директории с проектом.
     * @returns {String}
     */
    getDir: function () {
        return this._cdir;
    },

    /**
     * Возвращает конфиг.
     * @returns {Object}
     */
    getConfig: function () {
        return this._config;
    },

    /**
     * Возвращает сеттинги.
     * @returns {Object}
     */
    getSettings: function () {
        return this._settings;
    },

    /**
    * Процесинг css файла
    * @returns {String}
    */
   process: function () {
        var messageComplete ='File ' + this._outputFileName  + ' saved!',
            css = this.processCss();

        fss.writeFile(this._outputFileName, css, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(messageComplete.green);
            }
        });
   },

    /**
    * Формируем css файл
    * @returns {String} Сформированные CSS правила в виде простого текста
    */
   processCss: function () {
        var _this = this,
            config = this.getConfig(),
            settings = this.getSettings(),
            basePath = this.getDir(),
            cssDefaults = this.getSettingsCss();

        _.forEach(config, function (val, key) {
            var filePath = path.resolve(basePath, key  + '.png');
            if (fss.existsSync(filePath)) {
                var base64 = _this.getFileBase64(filePath);
                _this._cssCommon.push(settings.cssPrefix + key);
                _this._css += settings.cssPrefix + key + '{'
                _this._css += 'background-image:url("' + base64 + '");';
                _this._css += '}';
            }
            else {
                var err = 'Warning: d\'ont exist file: ' + filePath;
                console.log(err.yellow);
            }
        })

        var commonCSS = _this._cssCommon.join(',') + '{' + cssDefaults + '}';

        return commonCSS + _this._css;
   },

    /**
    * Вывод дефолтных CSS свойств
    * @returns {String} Сформированные CSS свойства в виде простого текста
    */
   getSettingsCss: function () {
        var _this = this,
            settings = this.getSettings();

        if (!this._cssRules.length || settings.cssRules || _.size(settings.cssRules)) {
            _.forEach(settings.cssRules, function (val, key) {
                _this._cssRules += key + ':' + val + ';'
            })
        }

        return this._cssRules;
    },

    /**
    * Преобразование файла в Base64
    * @param  {String} path Путь к файлу.
    * @returns {String} Base64 данные
    */
   getFileBase64: function (path) {
        var data = fss.readFileSync(path).toString('base64');

        return util.format('data:%s;base64,%s', mime.lookup(path), data);
   }

});