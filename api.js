var Hapi    = require('hapi')
var chalk   = require('chalk')
var rainbow = require('ansi-rainbow')
var utils   = require('./utils.js')

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
            var obj = utils.wrapDefaults(encodeURIComponent(request.params.name), request.payload, request.argv)
            request.store.set(obj.name, obj.payload, function (err, set_value) {
                if (err) console.log('NEED ERROR HANDLING! GAAH!')
                reply('OK.');
            })
        }
    },
    {
        method: 'DELETE',
        path: '/{name}',
        handler: function (request, reply) {
            var obj = utils.wrapDefaults(encodeURIComponent(request.params.name), request.payload, request.argv)
            request.store.del(obj.name, function (err, set_value) {
                if (err) console.log('NEED ERROR HANDLING! GAAH!')
                reply(obj.name+' removed.');
            })
        }
    }
]

module.exports = function (argv,store) {
    var server = new Hapi.Server(argv.apihost, argv.apiport)
    routes.forEach(function (route) {
        server.route(route)
    })
    server.ext('onRequest', function (request, next) {
        request.store = store
        request.argv  = argv
        next()
    })
    server.realStart = server.start
    server.start = function () {
        this.realStart(function () {
            utils.displayServiceStatus('api',server.info.uri, true)
        })
    }
    return server
}
