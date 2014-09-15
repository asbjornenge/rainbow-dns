var chalk   = require('chalk')
var rainbow = require('ansi-rainbow')

module.exports = {

    displayVersionMaybe : function (argv) {
        if (!argv.v && !argv.version) return
        var pkg = require('./package.json')
        console.log(rainbow.r(pkg.name)+chalk.red(' ❤ ')+chalk.green('v'+pkg.version))
        process.exit(0)
    }

}
