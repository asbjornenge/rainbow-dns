function MemStore(config) {
    this.data = {}
}
MemStore.prototype.ready = function(callback) {
    callback()
}
MemStore.prototype.get = function(key, callback) {
    if (typeof callback === 'function') callback(null, this.data[key])
}
MemStore.prototype.set = function (key, value, callback) {
    this.data[key] = value
    if (typeof callback === 'function') callback(null, this.data[key])
}
MemStore.prototype.del = function (key, callback) {
    delete this.data[key]
    if (typeof callback === 'function') callback(null)
}
MemStore.prototype.list = function (callback) {
    if (typeof callback === 'function') callback(null, this.data)
}
module.exports = function (config) {
    return new MemStore(config)
}
