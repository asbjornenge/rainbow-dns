var dns   = require('native-dns')
var utils = require('./utils')

var match = function (record, query) {
    var wildcard = false
    if (query[0] == '*') { query = query.split('*.')[1]; wildcard = true }
    return wildcard ? record.indexOf(query) >= 0 : record.indexOf(query) == 0
}

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
    // TODO: Add wildcard support
    var _request = request.question[0]
    switch(_request.type) {
        case 1:
            this.handleARequest(request, response)
            break
        case 28:
            this.handleAAAARequest(request, response)
            break
        case 33:
            this.handleSRVRequest(request, response)
            break
    }
    if (response.answer.length > 0) response.send()
    else this.forward(request.question[0], response)
}
RainbowDns.prototype.handleARequest = function (request, response) {
    var query = request.question[0].name
    this.store.list(function (err, records) {
        if (err) { console.log(err); process.exit(1) }
        Object.keys(records).forEach(function (record) {
            if (match(record,query)) {
                records[record].ipv4.forEach(function (ip) {
                    response.answer.push(dns.A({
                      name    : record,
                      address : ip,
                      ttl     : records[record].ttl,
                    }));
                })
            }
        })
    })
}
RainbowDns.prototype.handleAAAARequest = function (request, response) {
    var query = request.question[0].name
    this.store.list(function (err, records) {
        if (err) { console.log(err); process.exit(1) }
            Object.keys(records).forEach(function (record) {
                if (match(record, query)) {
                    records[record].ipv6.forEach(function (ip) {
                        response.answer.push(dns.AAAA({
                          name    : record,
                          address : ip,
                          ttl     : records[record].ttl,
                        }));
                    })
                }
            })
    })
}
RainbowDns.prototype.handleSRVRequest = function (request, response) {

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
