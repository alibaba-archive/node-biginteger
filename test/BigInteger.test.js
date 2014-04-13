var pedding = require('pedding');
var should = require('should');
var BigInteger = require('../lib/BigInteger');
var Long = require('long');

describe('BigInteger', function () {

  it('#fromString()', function (done) {
    var n = BigInteger.fromString('-1649a75c212838e75e09a31f95885cc4', 16);
    n.toBuffer().toString('hex').should.eql(new Buffer([-23, -74, 88, -93, -34, -41, -57, 24, -95, -10, 92, -32, 106, 119, -93, 60]).toString('hex'));
    done();
  });

  it('#fromBuffer() x', function (done) {

    done();
  });

  it('#fromLong()', function (done) {
    var mag = [1073741824, 0];
    var n = BigInteger.fromLong(Long.fromString('4000000000000000', 16));
    n.mag[0].should.eql(mag[0]);
    n.mag[1].should.eql(mag[1]);

    mag = [943559024, -1201670133];
    n = BigInteger.fromLong(Long.fromString('383d9170b85ff80b', 16));
    n.mag[0].should.eql(mag[0]);
    n.mag[1].should.eql(mag[1]);
    done();
  });

  it('#toString() x', function (done) {
    var n = BigInteger.fromString('-1649a75c212838e75e09a31f95885cc4', 16);
    n.toString().should.eql('-29625448039597583839432359987556932804');
    done();
  });  

  it('#bitCount() x', function (done) {

    done();
  });

  it('#bitLength() x', function (done) {

    done();
  });

  it('#abs() x', function (done) {

    done();
  });

  it('#negative() x', function (done) {

    done();
  });

  it('#primitiveLeftShift()', function (done) {
    var divisor = [232830643, -1486618624];
    var rs = [-569676998, 1983905792];
    var dlen = 2;
    var shift = 4;
    BigInteger.primitiveLeftShift(divisor, dlen, shift);
    divisor[0].should.eql(rs[0]);
    divisor[1].should.eql(rs[1]);
    done();
  });  

});
