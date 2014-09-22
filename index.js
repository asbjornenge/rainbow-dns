var argv = require('minimist')(process.argv.slice(2), {
    default : {
        apihost : '127.0.0.1',
        apiport : 8080,
        dnshost : '127.0.0.1',
        dnsport : 53,
        fwdhost : '8.8.8.8',
        fwdport : 53,
        store   : 'mem',
        domain  : require('random-domain')(),
        ttl     : 300,
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
    ttloop(store).start()
    utils.displayStartMessage(argv)
})
