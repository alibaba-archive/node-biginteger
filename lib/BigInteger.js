/**
 * Immutable arbitrary-precision integers.  All operations behave as if
 * BigIntegers were represented in two's-complement notation (like Java's
 * primitive integer types).  BigInteger provides analogues to all of Java's
 * primitive integer operators, and all relevant methods from java.lang.Math.
 * Additionally, BigInteger provides operations for modular arithmetic, GCD
 * calculation, primality testing, prime generation, bit manipulation,
 * and a few other miscellaneous operations.
 *
 * <p>Semantics of arithmetic operations exactly mimic those of Java's integer
 * arithmetic operators, as defined in <i>The Java Language Specification</i>.
 * For example, division by zero throws an {@code ArithmeticException}, and
 * division of a negative by a positive yields a negative (or zero) remainder.
 * All of the details in the Spec concerning overflow are ignored, as
 * BigIntegers are made as large as necessary to accommodate the results of an
 * operation.
 *
 * <p>Semantics of shift operations extend those of Java's shift operators
 * to allow for negative shift distances.  A right-shift with a negative
 * shift distance results in a left shift, and vice-versa.  The unsigned
 * right shift operator ({@code >>>}) is omitted, as this operation makes
 * little sense in combination with the "infinite word size" abstraction
 * provided by this class.
 *
 * <p>Semantics of bitwise logical operations exactly mimic those of Java's
 * bitwise integer operators.  The binary operators ({@code and},
 * {@code or}, {@code xor}) implicitly perform sign extension on the shorter
 * of the two operands prior to performing the operation.
 *
 * <p>Comparison operations perform signed integer comparisons, analogous to
 * those performed by Java's relational and equality operators.
 *
 * <p>Modular arithmetic operations are provided to compute residues, perform
 * exponentiation, and compute multiplicative inverses.  These methods always
 * return a non-negative result, between {@code 0} and {@code (modulus - 1)},
 * inclusive.
 *
 * <p>Bit operations operate on a single bit of the two's-complement
 * representation of their operand.  If necessary, the operand is sign-
 * extended so that it contains the designated bit.  None of the single-bit
 * operations can produce a BigInteger with a different sign from the
 * BigInteger being operated on, as they affect only a single bit, and the
 * "infinite word size" abstraction provided by this class ensures that there
 * are infinitely many "virtual sign bits" preceding each BigInteger.
 *
 * <p>For the sake of brevity and clarity, pseudo-code is used throughout the
 * descriptions of BigInteger methods.  The pseudo-code expression
 * {@code (i + j)} is shorthand for "a BigInteger whose value is
 * that of the BigInteger {@code i} plus that of the BigInteger {@code j}."
 * The pseudo-code expression {@code (i == j)} is shorthand for
 * "{@code true} if and only if the BigInteger {@code i} represents the same
 * value as the BigInteger {@code j}."  Other pseudo-code expressions are
 * interpreted similarly.
 *
 * <p>All methods and constructors in this class throw
 * {@code NullPointerException} when passed
 * a null object reference for any input parameter.
 *
 * @see     BigDecimal
 * @author  Josh Bloch
 * @author  Michael McCloskey
 * @since JDK1.1
 */
var Long = require('long');
var Integer = require('./Integer');

var MIN_RADIX = 2;
var MAX_RADIX = 36;

var bitsPerDigit = [ 0, 0,
  1024, 1624, 2048, 2378, 2648, 2875, 3072, 3247, 3402, 3543, 3672,
  3790, 3899, 4001, 4096, 4186, 4271, 4350, 4426, 4498, 4567, 4633,
  4696, 4756, 4814, 4870, 4923, 4975, 5025, 5074, 5120, 5166, 5210,
  5253, 5295
];

var digitsPerInt = [0, 0, 30, 19, 15, 13, 11,
  11, 10, 9, 9, 8, 8, 8, 8, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5
];
var digitsPerLong = [0, 0,
  62, 39, 31, 27, 24, 22, 20, 19, 18, 18, 17, 17, 16, 16, 15, 15, 15, 14,
  14, 14, 14, 13, 13, 13, 13, 13, 13, 12, 12, 12, 12, 12, 12, 12, 12];

var intRadix = [0, 0,
  0x40000000, 0x4546b3db, 0x40000000, 0x48c27395, 0x159fd800,
  0x75db9c97, 0x40000000, 0x17179149, 0x3b9aca00, 0xcc6db61,
  0x19a10000, 0x309f1021, 0x57f6c100, 0xa2f1b6f,  0x10000000,
  0x18754571, 0x247dbc80, 0x3547667b, 0x4c4b4000, 0x6b5a6e1d,
  0x6c20a40,  0x8d2d931,  0xb640000,  0xe8d4a51,  0x1269ae40,
  0x17179149, 0x1cb91000, 0x23744899, 0x2b73a840, 0x34e63b41,
  0x40000000, 0x4cfa3cc1, 0x5c13d840, 0x6d91b519, 0x39aa400
];

var LONG_MASK = 0xffffffff;
var MAX_CONSTANT = 16;

var longRadix = [null, null,
  Long.fromString('4000000000000000',16), Long.fromString('383d9170b85ff80b',16),
  Long.fromString('4000000000000000',16), Long.fromString('6765c793fa10079d',16),
  Long.fromString('41c21cb8e1000000',16), Long.fromString('3642798750226111',16),
  Long.fromString('1000000000000000',16), Long.fromString('12bf307ae81ffd59',16),
  Long.fromString( 'de0b6b3a7640000',16), Long.fromString('4d28cb56c33fa539',16),
  Long.fromString('1eca170c00000000',16), Long.fromString('780c7372621bd74d',16),
  Long.fromString('1e39a5057d810000',16), Long.fromString('5b27ac993df97701',16),
  Long.fromString('1000000000000000',16), Long.fromString('27b95e997e21d9f1',16),
  Long.fromString('5da0e1e53c5c8000',16), Long.fromString( 'b16a458ef403f19',16),
  Long.fromString('16bcc41e90000000',16), Long.fromString('2d04b7fdd9c0ef49',16),
  Long.fromString('5658597bcaa24000',16), Long.fromString( '6feb266931a75b7',16),
  Long.fromString( 'c29e98000000000',16), Long.fromString('14adf4b7320334b9',16),
  Long.fromString('226ed36478bfa000',16), Long.fromString('383d9170b85ff80b',16),
  Long.fromString('5a3c23e39c000000',16), Long.fromString( '4e900abb53e6b71',16),
  Long.fromString( '7600ec618141000',16), Long.fromString( 'aee5720ee830681',16),
  Long.fromString('1000000000000000',16), Long.fromString('172588ad4f5f0981',16),
  Long.fromString('211e44f7d02c1000',16), Long.fromString('2ee56725f06e5c71',16),
  Long.fromString('41c21cb8e1000000',16)
];

/* zero[i] is a string of i consecutive zeros. */
var zeros = new Array(64);
zeros[63] = "000000000000000000000000000000000000000000000000000000000000000";
for (var i = 0; i < 63; i++)
  zeros[i] = zeros[63].substring(0, i);

/**
 * Translates a byte array containing the two's-complement binary
 * representation of a BigIntegerTest into a BigIntegerTest.  The input array is
 * assumed to be in <i>big-endian</i> byte-order: the most significant
 * byte is in the zeroth element.
 *
 * @param  val big-endian two's-complement binary representation of
 *         BigIntegerTest.
 * @throws NumberFormatException {@code val} is zero bytes long.
 */
exports.fromBuffer = function (signum, magnitude) {
  var _bigInteger = new BigInteger();
  _bigInteger.mag = _bigInteger._stripLeadingZeroBytes(magnitude);

  if (signum < -1 || signum > 1)
      throw new Error("Invalid signum value");

  if (_bigInteger.mag.length==0) {
      _bigInteger.signum = 0;
  } else {
      if (signum == 0)
          throw new Error("signum-magnitude mismatch");
      _bigInteger.signum = signum;
  }
};

var _fromLong = exports.fromLong = function (val) {
  var _bigInteger = new BigInteger();
  if (val < 0) {
    val = -val;
    _bigInteger.signum = -1;
  } else {
    _bigInteger.signum = 1;
  }

  if (val.high === 0) {
    _bigInteger.mag = new Array(1);
    _bigInteger.mag[0] = val.low;
  } else {
    _bigInteger.mag = new Array(1);
    _bigInteger.mag[0] = val.high;
    _bigInteger.mag[1] = val.low;
  }
  return _bigInteger;
};

/**
 * Translates the String representation of a BigInteger in the
 * specified radix into a BigInteger.  The String representation
 * consists of an optional minus or plus sign followed by a
 * sequence of one or more digits in the specified radix.  The
 * character-to-digit mapping is provided by {@code
 * Character.digit}.  The String may not contain any extraneous
 * characters (whitespace, for example).
 *
 * @param val String representation of BigInteger.
 * @param radix radix to be used in interpreting {@code val}.
 * @throws NumberFormatException {@code val} is not a valid representation
 *         of a BigInteger in the specified radix, or {@code radix} is
 *         outside the range from {@link Character#MIN_RADIX} to
 *         {@link Character#MAX_RADIX}, inclusive.
 * @see    Character#digit
 */
exports.fromString = function (val, radix) {
  var cursor = 0;
  var numDigits;
  var len = val.length;
  if (radix < MIN_RADIX || radix > MAX_RADIX) {
    throw new Error('Radix out of range');
  }
  if (len === 0) {
    throw new Error("Zero length BigInteger");
  }
  var sign = 1;
  var index1 = val.lastIndexOf('-');
  var index2 = val.lastIndexOf('+');
  if ((index1 + index2) <= -1) {
    if (index1 === 0 || index2 === 0) {
      cursor = 1;
      if (len === 1) {
        throw new Error("Zero length BigInteger");
      }
    }
    if (index1 === 0) {
      sign = -1;
    }
  } else {
    throw new Error("Illegal embedded sign character");
  }
  var _bigInteger = new BigInteger();
  /*跳过前导的0，如果全部是0，直接储存ZERO.mag*/
  // Skip leading zeros and compute number of digits in magnitude
  // while (cursor < len && Character.digit(val.charAt(cursor), radix) == 0)
      // cursor++;
  // }
  if (cursor === len) {
    _bigInteger.signum = 0;
    _bigInteger.mag = new Buffer([0]);
    return;
  }
  numDigits = len - cursor;
  _bigInteger.signum = sign;
  // Pre-allocate array of expected size. May be too large but can
  // never be too small. Typically exact.
  var numBits = parseInt(((numDigits * bitsPerDigit[radix]) >>> 10) + 1, 10);
  var numWords = (numBits + 31) >>> 5;
  // 存储转换后的数字
  var magnitude = new Array(numWords);
  for (var i = 0; i < numWords; i++)
    magnitude[i] = 0;

  var firstGroupLen = numDigits % digitsPerInt[radix];
  if (firstGroupLen == 0)
    firstGroupLen = digitsPerInt[radix];

  var group = val.substring(cursor, cursor += firstGroupLen);
  
  magnitude[numWords - 1] = parseInt(group, radix);
  if (magnitude[numWords - 1] < 0)
    throw new Error("Illegal digit");

  // Process remaining digit groups
  var superRadix = intRadix[radix];
  var groupVal = 0;
  while (cursor < len) {
      group = val.substring(cursor, cursor += digitsPerInt[radix]);
      groupVal = parseInt(group, radix);

      if (groupVal < 0)
          throw new Error("Illegal digit");
      _bigInteger._destructiveMulAdd(magnitude, superRadix, groupVal);
  }
  
  _bigInteger.mag = _bigInteger._trustedStripLeadingZeroInts(magnitude);
  return _bigInteger;
};

var bitLengthForInt = exports.bitLengthForInt = function (i) {
  return 32 - Integer.numberOfLeadingZeros(i);
}

// shifts a up to len left n bits assumes no leading zeros, 0<=n<32
// int[] a, int len, int n
exports.primitiveLeftShift =  function (a, len, n) {
  if (len == 0 || n == 0)
    return;
  var n2 = 32 - n;
  for (var i=0, c=a[i], m=i+len-1; i<m; i++) {
    var b = c;
    c = a[i+1];
    a[i] = (b << n) | (c >>> n2);
  }
  a[len-1] <<= n;
}

function BigInteger() {
  this.signum;
  this.mag;
  this._bitLength = 0;
  this.firstNonzeroIntNum = 0;
}

/**
 * Returns a copy of the input array stripped of any leading zero bytes.
 */
BigInteger.prototype._stripLeadingZeroBytes = function (a) {
  var byteLength = a.length;
  var keep;

  // Find first nonzero byte
  for (keep = 0; keep < byteLength && a[keep] === 0; keep++)
      ;

  // Allocate new array and copy relevant part of input array
  var intLength = ((byteLength - keep) + 3) >>> 2;
  var result = new Array(intLength);
  var b = byteLength - 1;
  for (var i = intLength-1; i >= 0; i--) {
    result[i] = a[b--] & 0xff;
    var bytesRemaining = b - keep + 1;
    var bytesToTransfer = Math.min(3, bytesRemaining);
    for (var j=8; j <= (bytesToTransfer << 3); j += 8)
      result[i] |= ((a[b--] & 0xff) << j);
  }
  return result;
}

// Multiply x array times word y in place, and add word z
BigInteger.prototype._destructiveMulAdd = function (x, y, z) {
  // Perform the multiplication word by word
  var ylong = y & LONG_MASK;
  var zlong = z & LONG_MASK;
  var len = x.length;
  var product = 0;
  var carry = 0;
  for (var i = len-1; i >= 0; i--) {
    product = Long.fromNumber(ylong).multiply( Long.fromNumber(x[i] >>> 32) ).add(Long.fromInt(carry));
    x[i] = product.low;
    carry = product.high;
  }
  // Perform the addition
  var sum = (x[len - 1] >>> 32) + zlong;
  sum = Long.fromNumber(sum);
  x[len-1] = sum.low;
  carry = sum.high;
  for (var i = len - 2 ; i >= 0; i--) {
    sum = Long.fromNumber((x[i] >>> 32) + carry);
    x[i] = sum.low;
    carry = sum.high;
  }

};

BigInteger.prototype._trustedStripLeadingZeroInts = function (val) {
  var vlen = val.length;
  var keep;
  // Find first nonzero byte
  for (keep = 0; keep < vlen && val[keep] == 0; keep++)
      ;
  return keep == 0 ? val : _copyOfRange(val, keep, vlen);
};

function _copyOfRange(original, from, to) {
  var newLength = to - from;
  if (newLength < 0)
      throw new Error(from + " > " + to);
  var copy = new Array(newLength);
  var destPos = 0;
  var length = Math.min(original.length - from, newLength);
  for (var i = from; i <= length; i++) {
    copy[destPos++] = original[i];
  }
  return copy;
}

/**
 * Returns the number of bits in the minimal two's-complement
 * representation of this BigIntegerTest, <i>excluding</i> a sign bit.
 * For positive BigIntegerTests, this is equivalent to the number of bits in
 * the ordinary binary representation.  (Computes
 * {@code (ceil(log2(this < 0 ? -this : this+1)))}.)
 *
 * @return number of bits in the minimal two's-complement
 *         representation of this BigIntegerTest, <i>excluding</i> a sign bit.
 */
BigInteger.prototype.bitLength = function () {
  var n = this._bitLength - 1;
  if (n == -1) { // bitLength not initialized yet
    var m = this.mag;
    var len = m.length;
    if (len == 0) {
      n = 0; // offset by one to initialize
    }  else {
      // Calculate the bit length of the magnitude
      var magBitLength = ((len - 1) << 5) + bitLengthForInt(this.mag[0]);
       if (this.signum < 0) {
           // Check if magnitude is a power of two
           var pow2 = (this._bitCount(this.mag[0]) == 1);
           for(var i=1; i< len && pow2; i++)
               pow2 = (this.mag[i] == 0);

           n = (pow2 ? magBitLength -1 : magBitLength);
       } else {
           n = magBitLength;
       }
    }
    bitLength = n + 1;
  }
  return n;
}

BigInteger.prototype._bitCount = function (i) {
  // HD, Figure 5-2
  i = i - ((i >>> 1) & 0x55555555);
  i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
  i = (i + (i >>> 4)) & 0x0f0f0f0f;
  i = i + (i >>> 8);
  i = i + (i >>> 16);
  return i & 0x3f;
}

/**
 * Returns a byte array containing the two's-complement
 * representation of this BigIntegerTest.  The byte array will be in
 * <i>big-endian</i> byte-order: the most significant byte is in
 * the zeroth element.  The array will contain the minimum number
 * of bytes required to represent this BigIntegerTest, including at
 * least one sign bit, which is {@code (ceil((this.bitLength() +
 * 1)/8))}.  (This representation is compatible with the
 * {@link #BigIntegerTest(byte[]) (byte[])} constructor.)
 *
 * @return a byte array containing the two's-complement representation of
 *         this BigIntegerTest.
 * @see    #BigIntegerTest(byte[])
 */
BigInteger.prototype.toBuffer = function () {
  var byteLen = parseInt(this.bitLength() / 8, 10) + 1;
  var byteArray = new Buffer(byteLen);
  byteArray.fill(0xff);

  for (var i = byteLen - 1, bytesCopied = 4, nextInt = 0, intIndex = 0; i >= 0; i--) {
    if (bytesCopied == 4) {
        nextInt = this._getInt(intIndex++);
        bytesCopied = 1;
    } else {
        nextInt >>>= 8;
        bytesCopied++;
    }
    byteArray[i] = nextInt;
  }
  return byteArray;
}

/**
 * Returns a BigIntegerTest whose value is the absolute value of this
 * BigIntegerTest.
 *
 * @return {@code abs(this)}
 */
BigInteger.prototype.abs = function () {
  return this.signum >= 0 ? this : this.negative();
};

/**
 * Returns a BigIntegerTest whose value is {@code (-this)}.
 *
 * @return {@code -this}
 */
BigInteger.prototype.negative = function () {
  return exports._fromMag(this.mag, -this.signum);
};

exports._fromMag = function (magnitude, signum) {
  var _bigInteger = new BigInteger();
  _bigInteger.signum = (magnitude.length === 0 ? 0 : signum);
  _bigInteger.mag = magnitude;
  return _bigInteger;
};

/* Returns an int of sign bits */
BigInteger.prototype._signInt = function () {
  return this.signum < 0 ? -1 : 0;
}

/**
 * Returns the index of the int that contains the first nonzero int in the
 * little-endian binary representation of the magnitude (int 0 is the
 * least significant). If the magnitude is zero, return value is undefined.
 */
BigInteger.prototype._firstNonzeroIntNum = function () {
 var fn = this.firstNonzeroIntNum - 2;
 if (fn == -2) { // firstNonzeroIntNum not initialized yet
   fn = 0;

   // Search for the first nonzero int
   var i;
   var mlen = this.mag.length;
   for (i = mlen - 1; i >= 0 && this.mag[i] == 0; i--)
       ;
   fn = mlen - i - 1;
   this.firstNonzeroIntNum = fn + 2; // offset by two to initialize
 }
 return fn;
}

/**
 * Returns the specified int of the little-endian two's complement
 * representation (int 0 is the least significant).  The int number can
 * be arbitrarily high (values are logically preceded by infinitely many
 * sign ints).
 */
BigInteger.prototype._getInt = function (n) {
  if (n < 0)
      return 0;
  if (n >= this.mag.length)
      return this._signInt();

  var magInt = this.mag[this.mag.length - n - 1];

  return (this.signum >= 0 ? magInt :
          (n <= this._firstNonzeroIntNum() ? -magInt : ~magInt));
}

/**
 * Right shift this MutableBigIntegerTest n bits, where n is
 * less than 32.
 * Assumes that intLen > 0, n > 0 for speed
 */
BigInteger.prototype.primitiveRightShift = function (n) {
  // int[]
  var val = this.value;
  var n2 = 32 - n;
  for (var i = offset + intLen - 1, c = val[i]; i > offset; i--) {
    var b = c;
    c = val[i - 1];
    val[i] = (c << n2) | (b >>> n);
  }
  val[offset] >>>= n;
}

/**
 * Converts this BigIntegerTest to a {@code long}.  This
 * conversion is analogous to a
 * <i>narrowing primitive conversion</i> from {@code long} to
 * {@code int} as defined in section 5.1.3 of
 * <cite>The Java&trade; Language Specification</cite>:
 * if this BigIntegerTest is too big to fit in a
 * {@code long}, only the low-order 64 bits are returned.
 * Note that this conversion can lose information about the
 * overall magnitude of the BigIntegerTest value as well as return a
 * result with the opposite sign.
 *
 * @return this BigIntegerTest converted to a {@code long}.
 */
BigInteger.prototype.longValue = function () {
  var result = Long.fromInt(0);
  for (var i = 1; i >= 0; i--)
    // result = (result << 32) + (getInt(i) & LONG_MASK);
    result = result.shiftLeft(32).add(Long.fromNumber(this._getInt(i) >>> 32));
  return result;
}

BigInteger.prototype.toString = function (radix) {
  if (!radix) {
    radix = 10;
  }

  if (this.signum == 0)
      return "0";
  if (radix < MIN_RADIX || radix > MAX_RADIX)
      radix = 10;

  // Compute upper bound on number of digit groups and allocate space
  var maxNumDigitGroups = parseInt((4 * this.mag.length + 6) / 7);
  // String
  var digitGroup = new Array(maxNumDigitGroups);
  // var MutableBigInteger = require('./MutableBigInteger');
  // Translate number to string, a digit group at a time
  var tmp = this.abs();
  var numGroups = 0;
  while (tmp.signum != 0) {
    var d = _fromLong(longRadix[radix]);
    var q = new MutableBigInteger();
    var a = new MutableBigInteger(tmp.mag);
    var b = new MutableBigInteger(d.mag);
    var r = a.divide(b, q);
    var q2 = q.toBigInteger(tmp.signum * d.signum);
    var r2 = r.toBigInteger(tmp.signum * d.signum);

    digitGroup[numGroups++] = r2.longValue().toString(radix);
    tmp = q2;
  }

  // Put sign (if any) and first digit group into result buffer
  // var buf = new StringBuilder(numGroups*digitsPerLong[radix]+1);
  var buf = [];
  if (this.signum < 0)
    buf.push('-');
  buf.push(digitGroup[numGroups-1]);

  // Append remaining digit groups padded with leading zeros
  for (var i = numGroups - 2; i >= 0; i--) {
    // Prepend (any) leading zeros for this digit group
    var numLeadingZeros = digitsPerLong[radix]-digitGroup[i].length;
    if (numLeadingZeros != 0)
        buf.push(zeros[numLeadingZeros]);
    buf.push(digitGroup[i]);
  }
  return buf.join('');
}



// ======

function MutableBigInteger(val) {
  if (Array.isArray(val)) {
    this.value = val;
    this.intLen = val.length;
  } else {
    this.value = [0];
    this.intLen = 0;
  }
  this.offset = 0;
}

/**
 * Calculates the quotient of this div b and places the quotient in the
 * provided MutableBigIntegerTest objects and the remainder object is returned.
 *
 * Uses Algorithm D in Knuth section 4.3.1.
 * Many optimizations to that algorithm have been adapted from the Colin
 * Plumb C library.
 * It special cases one word divisors for speed. The content of b is not
 * changed.
 *
 */
MutableBigInteger.prototype.divide = function (b, quotient) {
  if (b.intLen === 0) {
    throw new Error("BigIntegerTest divide by zero");
  }
  // Dividend is zero
  if (this.intLen == 0) {
    quotient.intLen = quotient.offset;
    return new MutableBigInteger();
  }

  var cmp = this.compare(b);
  // Dividend less than divisor
  if (cmp < 0) {
    quotient.intLen = quotient.offset = 0;
    return this.clone();
  }
  // Dividend equal to divisor
  if (cmp == 0) {
    quotient.value[0] = quotient.intLen = 1;
    quotient.offset = 0;
    return new MutableBigInteger();
  }

  quotient.clear();
  // Special case one word divisor
  if (b.intLen == 1) {
    var r = this.divideOneWord(b.value[b.offset], quotient);
    if (r == 0)
      return new MutableBigInteger();
    return new MutableBigInteger(r);
  }

  // Copy divisor value to protect divisor
  // var div = Arrays.copyOfRange(b.value, b.offset, b.offset + b.intLen);
  var div = [];
  for (var i = b.offset; i < (b.offset + b.intLen); i++) {
    div.push(b.value[i]);
  }
  return this.divideMagnitude(div, quotient);
}

/**
 * Divide this MutableBigInteger by the divisor represented by its magnitude
 * array. The quotient will be placed into the provided quotient object &
 * the remainder object is returned.
 */
MutableBigInteger.prototype.divideMagnitude = function (divisor, quotient) {
  // Remainder starts as dividend with space for a leading zero
  var newArr = new Array(this.intLen + 1);
  for (var i = 0; i < newArr.length; i++) {
    newArr[i] = 0;
  }

  var rem = new MutableBigInteger();
  // System.arraycopy(this.value, this.offset, rem.value, 1, intLen);
  var desPos = 1;
  for (var i = this.offset; i < this.intLen; i++) {
    rem.value[desPos++] = this.value[i];
  }

  rem.intLen = this.intLen;
  rem.offset = 1;
  
  var nlen = rem.intLen;

  // Set the quotient size
  var dlen = divisor.length;
  var limit = nlen - dlen + 1;
  if (quotient.value.length < limit) {
    quotient.value = new Array(limit);
    quotient.offset = 0;
  }
  quotient.intLen = limit;
  // int[]
  var q = quotient.value;

  // D1 normalize the divisor
  // console.log([0, 373925724, 556284135, 1577689887, -1786225468], rem.value);

  var shift = Integer.numberOfLeadingZeros(divisor[0]);
  if (shift > 0) {
      // First shift will not grow array
      exports.primitiveLeftShift(divisor, dlen, shift);
      // But this one might
      rem.leftShift(shift);
  }

  // console.log([1, 1687844290, 310611573, -526765575, 1485163584], rem.value);
  // Must insert leading 0 in rem if its length did not change
  if (rem.intLen == nlen) {
      rem.offset = 0;
      rem.value[0] = 0;
      rem.intLen++;
  }

  var dh = divisor[0];
  // long
  // var dhLong = dh & LONG_MASK;
  var dhLong = dh >>> 32;
  var dl = divisor[1];
  var qWord = [0, 0];
  
  // D2 Initialize j
  for(var j = 0; j < limit; j++) {
    // D3 Calculate qhat
    // estimate qhat
    var qhat = 0;
    var qrem = 0;
    var skipCorrection = false;
    var nh = rem.value[j + rem.offset];
    var nh2 = nh + 0x80000000;
    var nm = rem.value[j + 1 + rem.offset];

    if (nh === dh) {
      qhat = ~0;
      qrem = nh + nm;
      skipCorrection = (qrem + 0x80000000) < nh2;
    } else {
      var a = Long.fromInt(nh).shiftLeft(32);
      var b = Long.fromNumber(nm >>> 32);
      var nChunk = a.or(b);
      if (nChunk >= 0) {
        qhat = nChunk.div(Long.fromNumber(dhLong)).low;
        qrem = nChunk.subtract(Long.fromInt(qhat).multiply(Long.fromNumber(dhLong))).low;
      } else {
        this.divWord(qWord, nChunk, dh);
        qhat = qWord[0];
        qrem = qWord[1];
      }
    }

    if (qhat == 0)
      continue;

    if (!skipCorrection) { // Correct qhat
      var nl = Long.fromInt(rem.value[j + 2 + rem.offset])
      var rs = Long.fromInt(qrem).shiftLeft(32).or(nl);
      var estProduct = Long.fromNumber(dl >>> 32).multiply(Long.fromNumber(qhat >>> 32));

      if (this.unsignedLongCompare(estProduct, rs)) {
        console.log('unsignedLongCompare 暂不应该进这个函数');
        qhat--;
        qrem = Long.fromInt(qrem).add(dhLong);
        if (qrem.compare(dhLong) >= 0) {
          estProduct.subtract(Long.fromInt(dl));
          rs = Long.fromInt(qrem).shiftLeft(32).or(nl);
          if (this.unsignedLongCompare(estProduct, rs))
              qhat--;
        }
      }
    }

    // D4 Multiply and subtract
    rem.value[j + rem.offset] = 0;
    
    var borrow = this.mulsub(rem.value, divisor, qhat, dlen, j + rem.offset);

    // D5 Test remainder
    if (borrow + 0x80000000 > nh2) {
      // D6 Add back
      this.divadd(divisor, rem.value, j+1+rem.offset);
      qhat--;
    }

    // // Store the quotient digit
    q[j] = qhat;
  } // D7 loop on j

  // D8 Unnormalize
  if (shift > 0)
    rem.rightShift(shift);

  quotient.normalize();
  rem.normalize();
  return rem;
}

/**
* A primitive used for division. This method adds in one multiple of the
* divisor a back to the dividend result at a specified offset. It is used
* when qhat was estimated too large, and must be adjusted.
* int[] a, int[] result, int offset
*/
MutableBigInteger.prototype.divadd = function (a, result, offset) {
  console.warn('divadd 不应该进这个函数!!!');
  console.warn('divadd 不应该进这个函数!!!');
  console.warn('divadd 不应该进这个函数!!!');
  console.warn('divadd 不应该进这个函数!!!');

  var carry = Long.fromInt(0);
  for (var j = a.length-1; j >= 0; j--) {
    // long sum = (a[j] & LONG_MASK) +
    //            (result[j+offset] & LONG_MASK) + carry;
    var sum = Long.fromInt(a[j]).add(Long.fromInt[result[j + offset]]).add(carry);
    // result[j+offset] = (int)sum;
    result[j+offset] = sum.low;
    carry = Long.fromNumber(sum >>> 32);
  }
  return carry >>> 32;
}

/**
 * Ensure that the MutableBigIntegerTest is in normal form, specifically
 * making sure that there are no leading zeros, and that if the
 * magnitude is zero, then intLen is zero.
 */
MutableBigInteger.prototype.normalize = function () {
  if (this.intLen == 0) {
    this.offset = 0;
    return;
  }

  var index = this.offset;
  if (this.value[index] != 0)
    return;

  var indexBound = index + this.intLen;
  do {
    index++;
  } while(index < indexBound && this.value[index] === 0);
  var numZeros = index - this.offset;
  this.intLen -= numZeros;
  this.offset = (this.intLen === 0 ?  0 : this.offset + numZeros);
}

/**
 * This method is used for division. It multiplies an n word input a by one
 * word input x, and subtracts the n word product from q. This is needed
 * when subtracting qhat*divisor from dividend.
 * int[] q, int[] a, int x, int len, int offset
 */
MutableBigInteger.prototype.mulsub = function (q, a, x, len, offset) {
  var xLong = Long.fromNumber(x >>> 32);
  var carry = Long.fromNumber(0);
  offset += len;
  for (var j = len - 1; j >= 0; j--) {
    var product = Long.fromNumber(a[j] >>> 32).multiply(xLong).add(carry);
    var difference = Long.fromInt(q[offset]).subtract(product);
    q[offset--] = difference.low;
    // console.log('rem value set', q[offset+1]);
    carry = Long.fromNumber( product.shiftRight(32).low ).add( 
      Long.fromNumber(difference.low >>>32).compare(Long.fromNumber(~product.low >>> 32)) > 0 ? Long.fromInt(1) : Long.fromInt(0)
    );
  }

  return carry.low;
}

/**
 * Compare two longs as if they were unsigned.
 * Returns true iff one is bigger than two.
 */
MutableBigInteger.prototype.unsignedLongCompare = function (one, two) {
  return one.add(Long.MIN_VALUE).compare(two.add(Long.MIN_VALUE)) > 0;
}

/**
 * [divWord description]
 * @param  {int[] } result [description]
 * @param  {long} n             [description]
 * @param  {int}     d             [description]
 * @return {[type]}        [description]
 */
MutableBigInteger.prototype.divWord = function (result, n, d) {
  // if (typeof n === 'number') {
  //   n = Long.fromNumber(n);
  // }
  // long
  var dLong = Long.fromNumber(d >>> 32);

  if (dLong.toNumber() === 1) {
    result[0] = n.low;
    result[1] = 0;
    return;
  }

  // Approximate the quotient and remainder
  // var q = (n >>> 1) / (dLong >>> 1);
  var q = n.shiftRightUnsigned(1).div(dLong.shiftRightUnsigned(1));

  // var r = n - q * dLong;
  var r = n.subtract(q.multiply(dLong));
  var zero = Long.fromInt(0);
  // Correct the approximation
  while (r.compare(zero) < 0) {
    // r += dLong;
    r = r.add(dLong);
    // q--;
    q = q.subtract(1);
  }
  while (r.compare(dLong) >= 0) {
    // r -= dLong;
    // q++;
    r = r.subtract(dLong);
    q = q.add(1);
  }

  result[0] = q.low;
  result[1] = r.low;
}

/**
 * [primitiveLeftShift description]
 * @param  {int[]}  a             [description]
 * @param  {int}  len           [description]
 * @param  {int}  n             [description]
 * @return {[type]}       [description]
 */
MutableBigInteger.prototype.primitiveLeftShift = function (n) {
  var val = this.value;
  var n2 = 32 - n;
  for (var i = this.offset, c = val[i], m = i + this.intLen - 1; i < m; i++) {
    var b = c;
    c = val[i + 1];
    val[i] = (b << n) | (c >>> n2);
  }
  val[this.offset + this.intLen - 1] <<= n;
}

/**
 * Right shift this MutableBigIntegerTest n bits, where n is
 * less than 32.
 * Assumes that intLen > 0, n > 0 for speed
 */
MutableBigInteger.prototype.primitiveRightShift = function (n) {
  var val = this.value;
  var n2 = 32 - n;
  for (var i = this.offset + this.intLen - 1, c = val[i]; i > this.offset; i--) {
    var b = c;
    c = val[i-1];
    val[i] = (c << n2) | (b >>> n);
  }
  val[this.offset] >>>= n;
}

/**
 * Left shift this MutableBigIntegerTest n bits.
 * int 
 */
MutableBigInteger.prototype.leftShift = function (n) {
  /*
   * If there is enough storage space in this MutableBigIntegerTest already
   * the available space will be used. Space to the right of the used
   * ints in the value array is faster to utilize, so the extra space
   * will be taken from the right if possible.
   */
  if (this.intLen == 0)
     return;
  var nInts = n >>> 5;
  var nBits = n & 0x1F;
  var bitsInHighWord = exports.bitLengthForInt(this.value[this.offset]);

  // If shift can be done without moving words, do so
  if (n <= (32 - bitsInHighWord)) {
    this.primitiveLeftShift(nBits);
    return;
  }

  var newLen = this.intLen + nInts +1;
  if (nBits <= (32 - bitsInHighWord))
    newLen--;
  if (this.value.length < newLen) {
    // The array must grow
    var result = new Array(newLen);
    for (var i = 0; i < this.intLen; i++)
      result[i] = this.value[this.offset+i];
    this.setValue(result, newLen);
  } else if (this.value.length - this.offset >= newLen) {
    // Use space on right
    for(var i = 0; i < newLen - this.intLen; i++)
      this.value[this.offset + this.intLen + i] = 0;
  } else {
    // Must use space on left
    for (var i = 0; i < this.intLen; i++)
      this.value[i] = this.value[this.offset+i];
    for (var i = this.intLen; i < newLen; i++)
      this.value[i] = 0;
    this.offset = 0;
  }
  this.intLen = newLen;
  if (nBits == 0)
    return;
  if (nBits <= (32 - bitsInHighWord))
    this.primitiveLeftShift(nBits);
  else
    this.primitiveRightShift(32 - nBits);
}

/**
 * Right shift this MutableBigIntegerTest n bits. The MutableBigIntegerTest is left
 * in normal form.
 */
MutableBigInteger.prototype.rightShift = function (n) {
  if (this.intLen === 0)
    return;
  var nInts = n >>> 5;
  var nBits = n & 0x1F;
  this.intLen -= nInts;
  if (nBits == 0)
    return;
  var bitsInHighWord = exports.bitLengthForInt(this.value[this.offset]);
  if (nBits >= bitsInHighWord) {
    this.primitiveLeftShift(32 - nBits);
    this.intLen--;
  } else {
    this.primitiveRightShift(nBits);
  }
}

/**
 * Sets this MutableBigIntegerTest's value array to the specified array.
 * The intLen is set to the specified length.
 * int[] 
 */
MutableBigInteger.prototype.setValue = function (val, length) {
  this.value = val;
  this.intLen = length;
  this.offset = 0;
}

/**
 * This method is used for division of an n word dividend by a one word
 * divisor. The quotient is placed into quotient. The one word divisor is
 * specified by divisor.
 *
 * @return the remainder of the division is returned.
 *
 */
// MutableBigInteger.prototype.divideOneWord = function (divisor, quotient) {
//     // long
//     var divisorLong = divisor & LONG_MASK;

//     // Special case of one word dividend
//     if (intLen == 1) {
//         long dividendValue = value[offset] & LONG_MASK;
//         int q = (int) (dividendValue / divisorLong);
//         int r = (int) (dividendValue - q * divisorLong);
//         quotient.value[0] = q;
//         quotient.intLen = (q == 0) ? 0 : 1;
//         quotient.offset = 0;
//         return r;
//     }

//     if (quotient.value.length < intLen)
//         quotient.value = new int[intLen];
//     quotient.offset = 0;
//     quotient.intLen = intLen;

//     // Normalize the divisor
//     int shift = Integer.numberOfLeadingZeros(divisor);

//     int rem = value[offset];
//     long remLong = rem & LONG_MASK;
//     if (remLong < divisorLong) {
//         quotient.value[0] = 0;
//     } else {
//         quotient.value[0] = (int)(remLong / divisorLong);
//         rem = (int) (remLong - (quotient.value[0] * divisorLong));
//         remLong = rem & LONG_MASK;
//     }

//     int xlen = intLen;
//     int[] qWord = new int[2];
//     while (--xlen > 0) {
//         long dividendEstimate = (remLong<<32) |
//             (value[offset + intLen - xlen] & LONG_MASK);
//         if (dividendEstimate >= 0) {
//             qWord[0] = (int) (dividendEstimate / divisorLong);
//             qWord[1] = (int) (dividendEstimate - qWord[0] * divisorLong);
//         } else {
//             divWord(qWord, dividendEstimate, divisor);
//         }
//         quotient.value[intLen - xlen] = qWord[0];
//         rem = qWord[1];
//         remLong = rem & LONG_MASK;
//     }

//     quotient.normalize();
//     // Unnormalize
//     if (shift > 0)
//         return rem % divisor;
//     else
//         return rem;
// }

/**
 * Compare the magnitude of two MutableBigIntegerTests. Returns -1, 0 or 1
 * as this MutableBigIntegerTest is numerically less than, equal to, or
 * greater than <tt>b</tt>.
 */
MutableBigInteger.prototype.compare = function (b) {
  var blen = b.intLen;
  if (this.intLen < blen)
    return -1;
  if (this.intLen > blen)
   return 1;

  // Add Integer.MIN_VALUE to make the comparison act as unsigned integer
  // comparison.
  var bval = b.value;
  for (var i = this.offset, j = b.offset; i < this.intLen + this.offset; i++, j++) {
    var b1 = this.value[i] + 0x80000000;
    var b2 = bval[j]  + 0x80000000;
    if (b1 < b2)
      return -1;
    if (b1 > b2)
      return 1;
  }
  return 0;
}

/**
 * Clear out a MutableBigIntegerTest for reuse.
 */
MutableBigInteger.prototype.clear = function () {
  this.offset = this.intLen = 0;
  for (var index = 0, n = this.value.length; index < n; index++)
    this.value[index] = 0;
}

MutableBigInteger.prototype.clone = function () {
  var val = new Array(this.intLen);
  for (var i = 0; i < intLen; i++) {
    val[i] = this.value[i];
  }
  return new MutableBigInteger(val);
}

MutableBigInteger.prototype.getMagnitudeArray = function () {
  if (this.offset > 0 || this.value.length != this.intLen) {
    var original = this.value;
    var from = this.offset;
    var to = this.offset + this.intLen;
    var newLength = to - from;
    var copy = new Array(newLength);
    var desPos = 0;
    var length = Math.min(original.length - from, newLength);
    for (var i = from; i < length; i++) {
      copy[desPos++] = original[i];
    }
    return copy;
  }
  return this.value;
};

MutableBigInteger.prototype.toBigInteger = function (sign) {
  if (this.intLen == 0 || sign == 0) {
    return exports._fromMag([0], 0);
  }
  return exports._fromMag(this.getMagnitudeArray(), sign);
}


