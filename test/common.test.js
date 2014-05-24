var pedding = require('pedding');
var should = require('should');
var common = require('../lib/common');
var Long = require('long');

describe('common', function () {

  it('#longString()', function (done) {

    var n = common.longString(Long.fromString('4738381338259423114'), 36);
    n.should.eql('zzzzzzyyyyyy');

    done();
  });

});
