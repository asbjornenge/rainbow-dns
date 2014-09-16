var argv = require('minimist')(process.argv.slice(2), {
    default : {
        host       : '127.0.0.1',
        port       : '8080',
        store      : 'mem',
        domain     : require('random-domain')(),
        ttl        : 300,
        nameserver : '8.8.8.8'
    }
})
var utils = require('./utils')
var api   = require('./api')


utils.displayVersionMaybe(argv)
utils.displayHelpMaybe(argv)
var store = utils.selectStore(argv)

// store ready
store.ready(function () {
    // start dns server

    // start http server
    api(argv.host, argv.port, store).start()
    utils.displayStartMessage(argv)
})
