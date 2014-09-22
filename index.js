var argv = require('minimist')(process.argv.slice(2), {
    default : {
        host       : '127.0.0.1',
        port       : '8080',
        store      : 'mem',
        domain     : require('random-domain')(),
        nameserver : '8.8.8.8'
    }
})
var utils  = require('./utils')
var api    = require('./api')
var dns    = require('./dns')
var ttloop = require('./ttloop')

utils.displayVersionMaybe(argv)
utils.displayHelpMaybe(argv)
var store = utils.selectStore(argv)

store.ready(function () {
    dns(argv, store).start()
    api(argv, store).start()
    if (argv.ttl) ttloop(store).start()
    utils.displayStartMessage(argv)
})
