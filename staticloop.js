var utils = require('./utils')

var StaticLoop = function(argv, store) {
    this.argv  = argv
    this.store = store
}
StaticLoop.prototype.start = function () {
    this.populate()
    this.interval = setInterval(this.populate.bind(this), (this.argv.ttl*1000)-10)
}
StaticLoop.prototype.populate = function () {
    var records = require(this.argv.static).records
    records.forEach(function (record) {
        var obj = utils.wrapDefaults(record.name, record, this.argv)
        this.store.set(obj.name, obj.payload, function (err, set_value) {
            if (err) console.log('NEED ERROR HANDLING! GAAH!')
        })
    }.bind(this))
}
StaticLoop.prototype.stop = function () {
    clearInterval(this.interval)
}
module.exports = function (argv, store) {
    return new StaticLoop(argv, store)
}
