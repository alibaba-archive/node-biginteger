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

  it('#bitLength() x', function (done) {

    done();
  });

  it('#abs() x', function (done) {

    done();
  });

  it('#negative() x', function (done) {

    done();
  }); 

  it('#toString()', function (done) {
    var n = BigInteger.fromString('-1649a75c212838e75e09a31f95885cc4', 16);
    n.toString().should.eql('-29625448039597583839432359987556932804');
    done();
  });  

});
