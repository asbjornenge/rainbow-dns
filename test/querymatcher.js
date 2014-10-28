var assert  = require('assert')
var queryMatcher = require('../querymatcher')

var records = {
    'a.lol.test.domain.com' : {
        A     : [{'address' : '1.1.1.1'},{'address':'2.2.2.2'}],
        AAAA  : [{'address' : '2605:f8b0:4006:802:0:0:0:1010'}],
        CNAME : [{'data'    : 'yolo'}],
        ttl   : 30
    },
    'b.lol.test.domain.com' : {
        A   : [{'address':'2.2.2.2'},{'address':'3.3.3.3'}],
        ttl : 30
    },
    'a.ehm.test.domain.com' : {
        A   : [{'address':'4.4.4.4'}],
        ttl : 30
    },
    'broken.lol.test.domain.com' : {
        ttl : 30
    },
    'test2.another.com' : {
        A   : [{'address':'5.5.5.5'},{'address':'6.6.6.6'}],
        ttl : 30
    }
}

describe('Matcher', function() {

    // TODO: TEST speed of matching before (with current match function) and after

    it('Should match direct queries and return all IPs', function() {
        var results = queryMatcher(records, 'a.lol.test.domain.com', 'A')
        assert(results.length == 2)
    })

    it('Should support group queries', function() {
        var results = queryMatcher(records, 'test.domain.com', 'A')
        assert(results.length > 1)
    })

    it('Should mutate record names to match query for groups', function() {
        var results = queryMatcher(records, 'test.domain.com', 'A')
        assert(results[0].name == 'test.domain.com' )        
    })

    it('Should support wildcard queries', function() {
        var results = queryMatcher(records, '*.lol.test.domain.com', 'A')
        assert(results.length == 4)
    })

    it('Should not mutate record names for wildcard queries', function() {
        var results = queryMatcher(records, '*.lol.test.domain.com', 'A')
        assert(results[0].name.indexOf('lol.test.domain.com') > 0)
    })

    it('Should support AAAA queries too', function() {
        var results = queryMatcher(records, 'test.domain.com', 'AAAA')
        assert(results.length == 1)
    })

    it('Should support CNAME queries too', function() {
        var results = queryMatcher(records, 'test.domain.com', 'CNAME')
        assert(results.length == 1)
    })

})