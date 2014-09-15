var Hapi = require('hapi')

var routes = [
    {
        method: 'GET',
        path: '/hello',
        handler: function (request, reply) {
            reply('hello world');
        }
    }
]

module.exports = function (host,port) {
    var server = new Hapi.Server(host, port)
    routes.forEach(function (route) {
        server.route(route)
    })
    return server
}
