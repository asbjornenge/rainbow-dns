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
RainbowDns.prototype.respond = function(request, response, results) {
    // TODO : Populate also Authority & Additional based on results .. ?
    // TODO : Should results be sorted? CNAME pre A ?

    results.forEach(function(resp) {
        response.answer.push(resp)
    })

    // TODO : Being able to validate each record would be nice!!
    try { response.send() }
    catch(e) { console.log('DATA ERROR: Some mismatch between your store data and records.',e); response.answer = []; response.send() }
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
            this.respond(request, response, results)
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
            queryMatcher(records, query, recordtype).forEach(function(record) { results.push(record) })
        })
        this.resolveCNAME(types, records, results)
        var _results = results.map(function(res) { return dns[res.type](res) })
        if (typeof callback === 'function') callback(_results)
    }.bind(this))
}
RainbowDns.prototype.resolveCNAME = function(types, records, results) {
    if (types.indexOf('CNAME') < 0) return
    if (types.indexOf('A') < 0 && types.indexOf('AAAA') < 0) return
    results.forEach(function(res) {
        if (res.type != 'CNAME') return
        if (types.indexOf('A') >= 0)    queryMatcher(records, res.data, 'A').forEach(function(record) { results.push(record) })
        if (types.indexOf('AAAA') >= 0) queryMatcher(records, res.data, 'AAAA').forEach(function(record) { results.push(record) })
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
