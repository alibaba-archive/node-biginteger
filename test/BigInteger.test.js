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

  it('#fromBuffer()', function (done) {
    var n = BigInteger.fromBuffer(1, new Buffer('hello1234'));
    n.toString(10).should.eql('1925769719185931383604');
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

  it('#add()', function (done) {
    var n = BigInteger.fromString('-1649a75c212838e75e09a31f95885cc4', 16);
    var n1 = n.add(n);
    n1.toString().should.eql('-59250896079195167678864719975113865608');
    
    var n2 = n.add(BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16));
    n2.toString().should.eql('0');

    var n3 = n.add(BigInteger.fromString('1649a75c21', 16));
    n3.toString().should.eql('-29625448039597583839432359891831947427');

    var n4 = n3.add(BigInteger.fromBuffer(1, new Buffer('hello1234')));
    n4.toString(10).should.eql('-29625448039597581913662640705900563823');

    done();
  });

});
