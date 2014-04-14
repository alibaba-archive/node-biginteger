var pedding = require('pedding');
var should = require('should');
var Integer = require('../lib/Integer');
var Long = require('long');

describe('Integer', function () {

  it('#numberOfLeadingZeros()', function (done) {
    var shift = Integer.numberOfLeadingZeros(232830643);
    should.exist(shift);
    shift.should.eql(4);
    done();
  });

  it('#bitCount() x', function (done) {

    done();
  });

});
