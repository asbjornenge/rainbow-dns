var Hapi  = require('hapi')
var chalk = require('chalk')
var rainbow = require('ansi-rainbow')

var routes = [
    {
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            request.store.list(function (err, all_records) {
                if (err) console.log('NEED ERROR HANDLING! GAAH!')
                reply(all_records)
            })
        }
    },
    {
        method: 'PUT',
        path: '/{name}',
        handler: function (request, reply) {
            request.store.set(encodeURIComponent(request.params.name), request.payload, function (err, set_value) {
                if (err) console.log('NEED ERROR HANDLING! GAAH!')
                reply(JSON.stringify(set_value));
            })
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
