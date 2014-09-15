var Hapi  = require('hapi')
var chalk = require('chalk')
var rainbow = require('ansi-rainbow')

var routes = [
    {
        method: 'GET',
        path: '/hello',
        handler: function (request, reply) {
            console.log(request.store)
            reply('hello world');
        }
    }
]

module.exports = function (host,port,store) {
    var server = new Hapi.Server(host, port)
    routes.forEach(function (route) {
        server.route(route)
    })
    server.ext('onRequest', function (request, next) {
        request.store = store
        next()
    })
    server.realStart = server.start
    server.start = function () {
        this.realStart(function () {
            console.log(rainbow.r('API up'), chalk.bgBlue.white(server.info.uri), chalk.green('✔'))
        })
    }
    return server
}
