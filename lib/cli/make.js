/**
 * CLI/make
 * ========
 *
 * Этот файл запускает сборку из командной строки.
 */
var MakePlatform = require('../make');
var makePlatform = new MakePlatform();
var path = require('path');

module.exports = function (program) {
    program.command('make')
        .option('-d, --dir <dir>', 'path to folder with smiles', process.cwd())
        .option('-c, --config <config.json>', 'path to config file')
        .option('-s, --settings <.config.json>', 'path to settings file')
        .option('-o, --output <file>', 'path to output css file')
        .option('-p, --path <path>', 'path to folder with smiles', process.cwd())
        .description('build css file to json and png set')
        .on('--help', function(){
            console.log('  Examples:');
            console.log('');
            console.log('    $ smaylik --help');
            console.log('    $ smaylik make --help');
            console.log('    $ smaylik make -p smiles/skype/source/');
            console.log('');
        })
        .action(function () {
            var args = program.args.slice(0);
            var cmd = args.pop();

            makePlatform.init(cmd).then((function (res) {
                if (!res.base) {
                    console.error('  D\'ont find base folder'.red);
                    program.help(1);
                }
                if (!res.settings) {
                    console.error('  D\'ont find settings file'.red);
                    program.help(1);
                }
                if (!res.config) {
                    console.error('  D\'ont find config file '.red);
                    program.help(1);
                }
            }))
            .then(function() {
                makePlatform.process();
            })
            .then(null, function (err) {
                console.error(err.stack);
                process.exit(1);
            });
        });
};