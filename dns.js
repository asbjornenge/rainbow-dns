var dns          = require('native-dns')
var consts       = require('native-dns-packet').consts
var utils        = require('./utils')
var queryMatcher = require('./querymatcher')

var RainbowDns = function (argv, store) {
    this.argv       = argv
    this.store      = store
    this.server     = dns.createServer()
    if (argv.fwdhost) this.fwdserver = { address: argv.fwdhost, port: argv.fwdport || 53, type: 'udp' }
}
RainbowDns.prototype.forward = function (request, response) {
    var req = dns.Request({
        question : request,
        server   : this.fwdserver,
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
            req.cancel()
            console.log('Error sending forward requrest: ',e)
        }
    })
    req.on('timeout', function () {
        req.cancel()
        console.log('Timeout in making forward request');
    });
    req.send()
}
RainbowDns.prototype.populateAndRespond = function(request, response, results) {
    // TODO : Populate also Authority & Additional based on results .. ?
    // TODO : Should results be sorted? CNAME pre A ?
    // TODO : Map CNAME(s) (pick A and AAAA records to go along)
    results.forEach(function(resp) {
        response.answer.push(resp)
    })
    response.send()
}
RainbowDns.prototype.handleRequest = function (request, response) {
    var _request     = request.question[0]
    var query        = _request.name
    var answer_types = this.filterTypes(this.pickAnswerTypes(_request.type))
    this.queryStore(query, answer_types, function(results) {
        if (results.length == 0 && this.fwdserver) 
            // FORWARD
            this.forward(_request, response)
        else 
            // RESPOND
            this.populateAndRespond(request, response, results)
    }.bind(this))
}
RainbowDns.prototype.pickAnswerTypes = function(type) {
    return this.includeAnswerTypes(consts.QTYPE_TO_NAME[type])
}
RainbowDns.prototype.includeAnswerTypes = function(queryType) {
    // TODO: Support ipv6-crutch mode
    switch (queryType) {
        case 'A':
            return ['A','CNAME']
        case 'AAAA':
            return ['AAAA','CNAME']
        default:
            return [queryType]
    }
}
RainbowDns.prototype.filterTypes = function(responseTypes) {
    return responseTypes
        .filter(function(type) {
            return typeof dns[type] == 'function'
        })
}
RainbowDns.prototype.queryStore = function(query, types, callback) {
    var results = []
    this.store.list(function (err, records) {
        if (err) { console.log('ERROR: Unable to list data in store',err); process.exit(1) }
        types.forEach(function(recordtype) {
            var matchedRecords = queryMatcher(records, query, recordtype)
            matchedRecords.forEach(function(record) {
                results.push(dns[recordtype](record))
            })
        })
        if (typeof callback === 'function') callback(results)
    })
}
RainbowDns.prototype.start = function () {
    this.server.on('request', this.handleRequest.bind(this))
    this.server.on('listening', function () {
        utils.displayServiceStatus('dns', 'udp://'+this.argv.dnshost+':'+this.argv.dnsport, true)
    }.bind(this))
    this.server.on('close', function () {
        utils.displayErrorMessage('DNS socket unexpectedly closed', null, { exit : true })
    })
    this.server.on('error', function (err) {
        utils.displayErrorMessage('Unknown DNS error', err, { exit : true })
    })
    this.server.on('socketError', function (err) {
        utils.displayErrorMessage('DNS socket error occurred', err, { exit : true, hint : 'Port might be in use or you might not have permissions to bind to port. Try sudo?' })
    })
    this.server.serve(this.argv.dnsport, this.argv.dnshost)
}

module.exports = function (argv, store) {
    return new RainbowDns(argv, store)
}
