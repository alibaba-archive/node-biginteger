var pedding = require('pedding');
var should = require('should');
var BigIntegerLib = require('../lib/BigIntegerLib');
var Long = require('long');

describe('BigIntegerLib', function () {

  it('#primitiveLeftShift()', function (done) {
    var divisor = [232830643, -1486618624];
    var rs = [-569676998, 1983905792];
    var dlen = 2;
    var shift = 4;
    BigIntegerLib.primitiveLeftShift(divisor, dlen, shift);
    divisor[0].should.eql(rs[0]);
    divisor[1].should.eql(rs[1]);
    done();
  });   

});
