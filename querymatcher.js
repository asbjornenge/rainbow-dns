var T = require('transducers.js')

var onlySimilar = function(item, index) {
    var record = item[0]
    return record.indexOf(this.query) >= 0
}
var onlyRecordType = function(item, index) {
    return item[1][this.recordType] != undefined
}
var intoResponses = function(item, index) {
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
var intoGroups = function(item, index) {
    var record_name = item[0]
    var records     = item[1]
    if (!this.wildcard && record_name != this.query) records.forEach(function(record) {
        record.name = this.query
    }.bind(this))
    return item
}
var append = function(result, x) {
    x[1].forEach(function(record) { result.push(record) })
    return result
}

/** This is where the magic happens **/

var matcher = function(records, query, type, wildcard) {
    var filterAndMap = T.compose(
        T.filter(onlySimilar.bind({ query : query })),
        T.filter(onlyRecordType.bind({ recordType : type })),
        T.map(intoResponses.bind({  recordType : type })),
        T.map(intoGroups.bind({ query : query, wildcard : wildcard }))
    )
    var mapped = T.transduce(filterAndMap, append, [], records)
    if (mapped.length == 0) return mapped
    var normalized = mapped.reduce(function(result, record, index, raw) {
        result[record.name+record.address] = record
        if (index == mapped.length-1) return Object.keys(result).map(function(key) { return result[key] })
        return result
    }, {})
    return normalized
}

module.exports = function(records, query, type) {
    var wildcard = false
    if (query[0] == '*') { query = query.split('*.')[1]; wildcard = true }
    if (!query) return []
    return matcher(records, query, type, wildcard)
}