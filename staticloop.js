var path  = require('path')
var utils = require('./utils')

var pathToStatic = function (static_param) {
    if (static_param[0] != '/') static_param = process.cwd()+'/'+static_param
    return path.resolve(static_param)
}

var StaticLoop = function(argv, store) {
    this.argv  = argv
    this.store = store
}
StaticLoop.prototype.start = function () {
    this.populate()
    this.interval = setInterval(this.populate.bind(this), this.intervalMillis())
}
StaticLoop.prototype.populate = function () {
    var records = require(pathToStatic(this.argv.static)).records
    records.forEach(function (record) {
        var obj = utils.wrapDefaults(record.name, record, this.argv)
        this.store.set(obj.name, obj.payload, function (err, set_value) {
            if (err) console.log('NEED ERROR HANDLING! GAAH!')
        })
    }.bind(this))
}
StaticLoop.prototype.intervalMillis = function () {
    var interval = (this.argv.ttl*1000)-(this.argv.ttl*100)
    return interval > 1000 ? interval : 1000
}
StaticLoop.prototype.stop = function () {
    clearInterval(this.interval)
}
module.exports = function (argv, store) {
    return new StaticLoop(argv, store)
}
