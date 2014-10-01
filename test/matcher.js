var assert  = require('assert')
var matcher = require('../matcher')
var T       = require('transducers.js')

var records = {
    'a.lol.test.domain.com' : {
        ipv4 : ['1.1.1.1','2.2.2.2'],
        ttl  : 30
    },
    'b.lol.test.domain.com' : {
        ipv4 : ['2.2.2.2','3.3.3.3'],
        ttl  : 30
    },
    'a.ehm.test.domain.com' : {
        ipv4 : ['3.3.3.3'],
        ttl  : 30

    },
    'broken.lol.test.domain.com' : {
        ttl : 30
    },
    'test2.another.com' : {
        ipv4 : ['5.5.5.5','6.6.6.6'],
        ttl  : 30
    }
}

var similar = function(item, index) {
    var record = item[0]
    return record.indexOf(this.query) >= 0
}

var recordType = function(item, index) {
    return item[1][this.recordType] != undefined
}

var mapResponses = function(item, index) {
    var record  = item[0]
    var data    = item[1]
    var records = data[this.recordType].map(function(ip) {
        return {
          name    : record,
          address : ip,
          ttl     : data.ttl,            
        }
    })
    return [ record, records ]
}

var mapGroups = function(item, index) {
    var record_name = item[0]
    var records     = item[1]

    if (!this.wildcard && record_name != this.query) records.forEach(function(record) {
        record.name = this.query
    }.bind(this))

    return item
}

describe('Matcher', function() {

    it('Should pick direct matches', function() {
        var query    = 'lol.test.domain.com'
        var wildcard = false
        var type     = 'ipv4'
        // split wildcard here?

        var append = function(result, x) {
            x[1].forEach(function(record) { result.push(record) })
            return result
        }

        var filterAndMap = T.compose(
            T.filter(similar.bind({ query : query })),
            T.filter(recordType.bind({ recordType : 'ipv4' })),
            T.map(mapResponses.bind({  recordType : 'ipv4' })),
            T.map(mapGroups.bind({ query : query, wildcard : wildcard }))
        )

        var mapped = T.transduce(filterAndMap, append, [], records)

        var normalized = mapped.reduce(function(result, record, index, raw) {
            result[record.name+record.address] = record
            if (index == mapped.length-1) return Object.keys(result).map(function(key) { return result[key] })
            return result
        }, {})

        console.log(normalized)
        // assert(Object.keys(matches).length == 1)
    })

    // it('Should pick multiple matches on wildcard', function() {
    //     var matches = matcher(records, '*.lol.test.domain.com').wildcard().matches
    //     assert(matches.length == 2)
    //     console.log(matches)
    // })

    // it('Should pick multiple matches on group', function() {
    //     var matches = matcher(records, 'test.domain.com').group().matches
    //     assert(matches.length == 3)
    //     console.log(matches)
    // })

})