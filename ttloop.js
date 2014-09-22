var utils = require('./utils')

var Ttloop = function(store) {
    this.store = store
}
Ttloop.prototype.start = function () {
    this.interval = setInterval(this.check.bind(this), 1000)
}
Ttloop.prototype.check = function () {
    var now = utils.getUnixTime()
    this.store.list(function (err, records) {
        if (err) { console.log(err); this.stop(); process.exit(1) }
        Object.keys(records).forEach(function (record) {
            var r = records[record]
            if (r.time+r.ttl < now) this.store.del(record)
        }.bind(this))
    }.bind(this))
}
Ttloop.prototype.stop = function () {
    clearInterval(this.interval)
}
module.exports = function (store) {
    return new Ttloop(store)
}
