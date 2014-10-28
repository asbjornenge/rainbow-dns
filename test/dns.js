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

    it('can filter non-existing response types', function() {
        var d = dns({}, memstore())
        var filteredAnswerTypes = d.filterTypes(['A','CNAME','YOLO'])
        assert(filteredAnswerTypes.length == 2)
    })

    it('should return appropriate response object from queryStore', function(done) {
        var s = memstore()
        s.set('break.dance.kiwi', {
            'A'     : [{'address':'1.2.3.4'}]
        })
        s.set('yolo.dance.kiwi', {
            'CNAME' : [{'data':'break.dance.kiwi'}]
        })
        var d = dns({}, s)
        d.queryStore('yolo.dance.kiwi', ['A', 'CNAME'], function(results) {
            assert(results.length == 2) // <- Enough to check this?
            assert(results[0].type == 5)
            assert(results[0].name == 'yolo.dance.kiwi')
            assert(results[0].data == 'break.dance.kiwi')
            assert(results[1].type == 1)
            assert(results[1].name == 'break.dance.kiwi')
            assert(results[1].address == '1.2.3.4')
            done()
        })
    })

})