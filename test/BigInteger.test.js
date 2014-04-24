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
      
    var n = BigInteger.fromMag([246752, -1590483493, 1026437694, -1650966168, 1302453669, -2061979589, -1322696806, -1021457984, -929746066, -235164568, -2018752966, -836472077, -979803355, -1357116076, 1860959356, 772980992], 1);
    n.toString().should.eql('770299664011129139433679167424561096649974571934768846338049791388830494291999678886952832217429827452869220180212280123272521504180623355525727437056');
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

  it('#subtract()', function (done) {

    var n = BigInteger.fromString('-1649a75c212838e75e09a31f95885cc4', 16);
    var n1 = n.subtract(n);
    n1.toString().should.eql('0');

    var n2 = n.subtract(BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16));
    n2.toString().should.eql('-59250896079195167678864719975113865608');

    var n4 = BigInteger.fromBuffer(-1, new Buffer('hello1234')).subtract(n);
    n4.toString(10).should.eql('29625448039597581913662640801625549200');

    done();

  });

  it('#multiply()', function (done) {
    var n = BigInteger.fromString('4', 10);
    var n1 = n.multiply(BigInteger.fromString('4', 10));
    n1.toString().should.eql('16');

    var n = BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16);
    var n1 = n.multiply(BigInteger.fromBuffer(1, new Buffer('hello1234')));
    n1.toString().should.eql('57051790751973240447433385155385407248918430815970175345616');    

    done();
  });

  it('#and()', function (done) {

    var n = BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16);
    var n1 = n.and(BigInteger.fromBuffer(1, new Buffer('hello1234')));
    n1.toString().should.eql('1775789634519591555076'); 
      
    done();

  });

  it('#squareToLen()', function (done) {

    var z = BigInteger.squareToLen([373925724, 556284135, 1577689887, -1786225468], 4, null);
    JSON.stringify(z).should.eql(JSON.stringify([32554484, -1247336670, -1953533566, 447288530, 680235003, 468127167, -1438116842, -639797744]));
    
    var z = BigInteger.squareToLen([32554484, -1247336670, -1953533566, 447288530, 680235003, 468127167, -1438116842, -639797744],8,null);
    var rs = [246752, -1590483493, 1026437694, -1650966168, 1302453669, -2061979589, -1322696806, -1021457984, -929746066, -235164568, -2018752966, -836472077, -979803355, -1357116076, 1860959356, 772980992];
    z.length.should.eql(rs.length);
    z.forEach(function (x, i) {
      x.should.eql(rs[i]);
    });
    
    done();
  });

  it('#pow()', function (done) {

    var n = BigInteger.fromString('2', 10);
    var n1 = n.pow(2);
    n1.toString().should.eql('4'); 

    var n = BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16);
    var n1 = n.pow(4);
    n1.toString().should.eql('770299664011129139433679167424561096649974571934768846338049791388830494291999678886952832217429827452869220180212280123272521504180623355525727437056'); 
      
    done();

  });

  it('#shiftRight()', function (done) {

    var n = BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16);
    var n1 = n.shiftRight(32);
    n1.toString().should.eql('6897712135593775622414508831'); 
    
    done();

  });

  it('#shiftLeft()', function (done) {

    var n = BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16);
    var n1 = n.shiftLeft(32);
    n1.toString().should.eql('127240330459418935590980101350655993331249577984'); 
    
    done();

  });
  
  it('#equals()', function (done) {

    var n = BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16);
    n.equals(n).should.be.true;

    var n2 = BigInteger.fromString('abc', 16);
    n.equals(n2).should.be.false;

    done();
  });

  it('#mod()', function (done) {

    var n = BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16);
    var n1 = n.mod(n);
    n1.toString().should.eql('0');

    var n = BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16);
    var n1 = n.mod(BigInteger.fromString('abc', 16));
    n1.toString().should.eql('876');

    done();
  });

  it('#montReduce()', function (done) {

    var b = [ 0, 2, -318705130, 1861126921 ];
    var mod = [ 2, -1356139857 ];
    var modLen = 2;
    var inv = 208184004;

    var rs = BigInteger.montReduce(b, mod, modLen, inv);
    JSON.stringify(rs).should.eql(JSON.stringify([1, -275680574, -1193753352, -316060955]));
    // [ 1, 1574182409, 0, 0 ]
    done();

  });

  it('#oddModPow()', function (done) {

    var y = BigInteger.fromMag([16], 1);
    var z = BigInteger.fromMag([687], 1);

    var test = BigInteger.fromMag([189], 1);

    var rs = test.oddModPow(y, z);
    JSON.stringify(rs.mag).should.eql(JSON.stringify([378]));


    var y = BigInteger.fromMag([16], 1);
    var z = BigInteger.fromMag([2, -1356139857], 1);

    var test = BigInteger.fromMag([2, 332369740], 1);

    var rs = test.oddModPow(y, z);
    JSON.stringify(rs.mag).should.eql(JSON.stringify([2, -2116968924]));

    done();

  });  

  it('#modPow()', function (done) {

    var n1 = BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16);
    var n2 = n1.modPow(BigInteger.fromString("16"), BigInteger.fromString("abc", 16));
    n2.toString().should.eql('1752');

    var n1 = BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16);
    n1 = n1.pow(16);
    
    n1.toString().should.eql('352077955572113749997766377800604444622460076305148734968729358265317637098322962367820050347875583315344462964959665575949583116858309826255943650974517847912636933043978007322657211481406063863803949575003585086657243583913635357700112214488990102841758130001472359622751803579436110307628748204242262026718059412403465177436225378758674098108230598260597569124215061062220122063183945992340833626410963722148168454106006573450244960544517302509105365797445155768980556404517176572624540378353645377100167311486845332613253103175716184748878557825330895970505263892076714272346348610201111018602496');
    
    var n2 = n1.modPow(BigInteger.fromString("16"), BigInteger.fromString("abcabcabc", 16));
    n2.toString().should.eql('10767932964');

    done();

  }); 


});

