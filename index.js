
var api = require('./api')

var defaults = {
    host : '127.0.0.1',
    port : '8080'
}

// backend ready

// start http server
// start dns server

api(defaults.host, defaults.port).start()
