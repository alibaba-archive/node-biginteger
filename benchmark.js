var Benchmark = require('benchmark');
var BigInteger = require('./');
var bignum = require('bignum');

var suite = new Benchmark.Suite;

var msg = '7260580986005314663220885108603836683954870712159103203970460311568842873488890063378217596713766762096812844404018368152888087954541805361386268475501815657238701978875459554778023600881498995280721919038749556556936444959652605779460456195256240861409427021060436404204905533574646393427346248885612592';
var m = '106018959548758374075240809816873307051744278500184673237124291327881973299725540626067594238570323588126236461136683027956239792390449112769067259228949389410083004114146729895400397755212626461400573141171389790509512527175274685865958330933256619829994461246888027851693134079594422706047966237154237741197';
var e = '65537';
// add tests
suite

.add('BigInteger#multiply', function() {
  var n = BigInteger.fromString('1649a75c212838e75e09a31f95885cc4', 16);
  var n1 = n.multiply(BigInteger.fromBuffer(1, new Buffer('hello1234')));
})

.add('bignum#mul', function() {
  var n = bignum('1649a75c212838e75e09a31f95885cc4', 16);
  var n1 = n.mul(bignum.fromBuffer(new Buffer('hello1234')));
})

.add('BigInteger#modPow(long)', function() {
  var _m = BigInteger.fromString(m, 10);
  var exponent = BigInteger.fromString(e, 10);
  var test = BigInteger.fromString(msg, 10);
  test.modPow(exponent, _m);
})

.add('bignum#powm(long)', function() {
  var _m = bignum(m);
  var exponent = bignum(e);
  var test = bignum(msg);
  test.powm(e, _m);
})

.add('BigInteger#modPow(short)', function () {
  var n1 = BigInteger.fromString('100', 16);
  var n2 = n1.modPow(BigInteger.fromString("16"), BigInteger.fromString("1000", 16));
})

.add('bignum#powm(short)', function() {
  var _m = bignum('1000');
  var exponent = bignum('16');
  var test = bignum('100');
  test.powm(e, _m);
})

.on('cycle', function(event) {
  console.log(String(event.target));
})

.run({ 'async': false });

