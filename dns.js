var dns   = require('native-dns')
var utils = require('./utils')

var RainbowDns = function (argv, store) {
    this.argv       = argv
    this.store      = store
    this.server     = dns.createServer()
    this.nameserver = { address: argv.nameserver, port: 53, type: 'udp' }
}
RainbowDns.prototype.forward = function (request, response) {
    var req = dns.Request({
        question : request,
        server   : this.nameserver,
        timeout  : 1000
    })
    req.on('message', function(err, answer) {
        response.answer       = answer.answer
        response.authority    = answer.authority
        response.additional   = answer.additional
        response.edns_options = answer.edns_options
        try {
            response.send()
        } catch(e) {
            console.log('Error sending forward requrest: ',e)
        }
    })
    req.on('timeout', function () {
      console.log('Timeout in making forward request');
    });
    req.send()
}
RainbowDns.prototype.handleRequest = function (request, response) {
    console.log('dns request')
    this.forward(request.question[0], response)
}
RainbowDns.prototype.start = function () {
    this.server.on('request', this.handleRequest.bind(this))
    this.server.serve(53, function () {
        utils.displayServiceStatus('dns', 'udp://127.0.0.1:53', true)
    }.bind(this))
}

module.exports = function (argv, store) {
    return new RainbowDns(argv, store)
}
