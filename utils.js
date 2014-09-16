var chalk   = require('chalk')
var rainbow = require('ansi-rainbow')

var stores = {
    mem : require('./stores/mem')
}

module.exports = {

    displayVersionMaybe : function (argv) {
        if (!argv.v && !argv.version) return
        var pkg = require('./package.json')
        console.log(rainbow.r(pkg.name)+chalk.red(' ❤ ')+chalk.green('v'+pkg.version))
        process.exit(0)
    },

    displayHelpMaybe : function (argv) {
        if (!argv.h && !argv.help) return
        var pkg = require('./package.json')
        console.log(chalk.cyan('help coming soon!')+chalk.red(' ❤ '))
        process.exit(0)
    },

    selectStore : function (argv) {
        if (stores[argv.store] == undefined) console.log(chalk.red('ERROR ')+'no such datastore '+argv.store)
        return stores[argv.store]()
    },

    displayStartMessage : function (argv) {
        console.log(rainbow.r('nameserver ')+chalk.bgBlue(argv.nameserver))
        console.log(rainbow.r('domain     ')+chalk.bgBlue(argv.domain))
        console.log(rainbow.r('ttl        ')+chalk.bgBlue(argv.ttl))
    },

    wrapDefaults : function (name, payload, argv) {
        name = name+'.'+(payload.domain || argv.domain)
        if (!payload.domain) payload.domain = argv.domain
        if (!payload.ttl) payload.ttl       = argv.ttl
        payload.time                        = this.getUnixTime()
        return {
            name    : name,
            payload : payload
        }
    },

    getUnixTime : function () {
        return Math.floor(new Date().getTime() / 1000)
    }

}
