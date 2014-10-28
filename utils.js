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
        if (stores[argv.store] == undefined) { console.log(chalk.red('ERROR ')+'no such datastore '+argv.store); process.exit(1) }
        return stores[argv.store]()
    },

    displayStartMessage : function (argv) {
        // console.log(rainbow.r('nameserver ')+chalk.bgBlue(argv.nameserver))
        this.displayServiceStatus('domain', argv.domain)
        // this.displayServiceStatus('store', argv.store)
        // console.log(rainbow.r('ttl        ')+chalk.bgBlue(argv.ttl))
    },

    displayServiceStatus : function (service, meta, check) {
        console.log(rainbow.r(this.fillSpaces(service,6))+' '+this.fillSpaces(meta,21)+' '+(check ? chalk.green('✔') : ''))
    },

    displayErrorMessage : function (msg, err, props) {
        console.log(chalk.red('ERROR: ')+msg, err)
        if (props.hint) console.log(chalk.cyan('HINT: ')+props.hint)
        if (props.exit) process.exit(1)
    },

    fillSpaces : function (word, len) {
        while(word.length < len) {
            word = word+' '
        }
        return word
    },

    wrapDefaults : function (name, payload, argv) {
        name = name+'.'+(payload.domain || argv.domain)
        if (!payload.domain) payload.domain = argv.domain
        if (!payload.ttl)    payload.ttl    = argv.ttl
        payload.time                        = this.getUnixTime()
        return {
            name    : name,
            payload : payload
        }
    },

    getUnixTime : function () {
        return Math.floor(new Date().getTime() / 1000)
    },

    reverse_map : function(src) {
        var dst = {},
        k;

        for (k in src) {
            if (src.hasOwnProperty(k)) {
                dst[src[k]] = k;
            }
        }
        return dst;
    }

}
