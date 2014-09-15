function MemStore(config) {
    this.data = {}
}
MemStore.prototype.isReady = function() {
    return true
}
MemStore.prototype.get = function(key, callback) {
    if (typeof callback === 'function') callback(null, this.data[key])
}
MemStore.prototype.list = function (pattern, callback) {
    if (typeof callback === 'function') callback(null, this.data)
}
MemStore.prototype.set = function (key, value, callback) {
    this.data[key] = value
    if (typeof callback === 'function') callback(null, this.data[key])
}
MemStore.prototype.del = function (key, callback) {
    delete this.data[key]
    if (typeof callback === 'function') callback(null)
}

module.exports = function (config) {
    return new MemStore(config)
}
