var argv = require('minimist')(process.argv.slice(2), {
    default : {
        host : '127.0.0.1',
        port : '8080'
    }
})
var utils = require('./utils')
var api   = require('./api')

// backend ready

// start http server
// start dns server


utils.displayVersionMaybe(argv)
// console.log(argv.v || argv.version)

// api(defaults.host, defaults.port).start()
