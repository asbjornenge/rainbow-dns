var assert   = require('assert')
var dns      = require('../dns')
var memstore = require('../stores/mem')

describe('Dns', function() {

    it('should return appropriate answer types for A records', function() {
        var d     = dns({}, memstore())
        var types = d.includeAnswerTypes('A')
        assert(types.indexOf('A') >= 0)
        assert(types.indexOf('CNAME') >= 0)
    })

    it('should return appropriate answer types for AAAA records', function() {
        var d     = dns({}, memstore())
        var types = d.includeAnswerTypes('AAAA')
        assert(types.indexOf('AAAA') >= 0)
        assert(types.indexOf('CNAME') >= 0)
    })

    it('should return same answer types non handled queries', function() {
        var d     = dns({}, memstore())
        var types = d.includeAnswerTypes('YEAH')
        assert(types.length == 1)
        assert(types.indexOf('YEAH') >= 0)
    })

    it('should map the appropriate response objects', function() {
        var d = dns({}, memstore())
        var responseObjects = d.mapResponseObjects(['A','CNAME'])
        assert(typeof responseObjects['A'] == 'function')
        assert(typeof responseObjects['CNAME'] == 'function')
    })

})