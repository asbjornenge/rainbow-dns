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
    var records = data[this.recordType].map(function(store_data) {
        return {
          name       : record,
          type       : this.recordType,
          store_data : store_data,
          ttl        : data.ttl,
        }
    }.bind(this))
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
var transformer = {
    init : function() {
        return []
    },
    step : function(result, x) {
        x[1].forEach(function(record) {
            var store_data = typeof record.store_data == 'object' ? record.store_data : {}
            Object.keys(store_data).forEach(function(key) {
                record[key] = record.store_data[key]
            })
            delete record.store_data
            result.push(record)
        })
        return result
    },
    result : function(result) {
        return result
    }
}

/** This is where the magic happens **/
var matcher = function(records, query, type, wildcard) {
    var filterAndMap = T.compose(
        T.filter(onlySimilar.bind({ query : query })),
        T.filter(onlyRecordType.bind({ recordType : type })),
        T.map(intoResponses.bind({  recordType : type })),
        T.map(intoGroups.bind({ query : query, wildcard : wildcard }))
    )
    return T.transduce(records, filterAndMap, transformer)
}

module.exports = function(records, query, type) {
    var wildcard = false
    if (query[0] == '*') { query = query.split('*.')[1]; wildcard = true }
    if (!query) return []
    return matcher(records, query, type, wildcard)
}