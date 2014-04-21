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
var Common = require('./common');
var MutableBigInteger = require('./MutableBigInteger');
var BigIntegerLib = require('./BigIntegerLib');

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
var zeros = Common.intArray(64);
zeros[63] = "000000000000000000000000000000000000000000000000000000000000000";
for (var i = 0; i < 63; i++)
  zeros[i] = zeros[63].substring(0, i);


function BigInteger() {
  this.signum;
  this.mag;
  this._bitLength = 0;
  this.bitCount = 0;
  this.firstNonzeroIntNum = 0;
}

/**
 * Translates a byte array containing the two's-complement binary
 * representation of a BigInteger into a BigInteger.  The input array is
 * assumed to be in <i>big-endian</i> byte-order: the most significant
 * byte is in the zeroth element.
 *
 * @param  val big-endian two's-complement binary representation of
 *         BigInteger.
 * @throws NumberFormatException {@code val} is zero bytes long.
 */
BigInteger.fromBuffer = function (signum, magnitude) {
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
  return _bigInteger;
};

BigInteger.fromLong = function (val) {
  var _bigInteger = new BigInteger();
  if (val < 0) {
    val = -val;
    _bigInteger.signum = -1;
  } else {
    _bigInteger.signum = 1;
  }

  if (val.high === 0) {
    _bigInteger.mag = Common.intArray(1);
    _bigInteger.mag[0] = val.low;
  } else {
    _bigInteger.mag = Common.intArray(1);
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
BigInteger.fromString = function (val, radix) {
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
  var magnitude = Common.intArray(numWords);
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
  
  _bigInteger.mag = trustedStripLeadingZeroInts(magnitude);
  return _bigInteger;
};

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
  var result = Common.intArray(intLength);
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

function trustedStripLeadingZeroInts(val) {
  var vlen = val.length;
  var keep;
  // Find first nonzero byte
  for (keep = 0; keep < vlen && val[keep] == 0; keep++)
      ;
  return keep == 0 ? val : Common.copyOfRange(val, keep, vlen);
};

/**
 * Returns the number of bits in the minimal two's-complement
 * representation of this BigInteger, <i>excluding</i> a sign bit.
 * For positive BigIntegers, this is equivalent to the number of bits in
 * the ordinary binary representation.  (Computes
 * {@code (ceil(log2(this < 0 ? -this : this+1)))}.)
 *
 * @return number of bits in the minimal two's-complement
 *         representation of this BigInteger, <i>excluding</i> a sign bit.
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
      var magBitLength = ((len - 1) << 5) + BigIntegerLib.bitLengthForInt(this.mag[0]);
       if (this.signum < 0) {
           // Check if magnitude is a power of two
           var pow2 = (Integer.bitCount(this.mag[0]) == 1);
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

/**
 * Returns a byte array containing the two's-complement
 * representation of this BigInteger.  The byte array will be in
 * <i>big-endian</i> byte-order: the most significant byte is in
 * the zeroth element.  The array will contain the minimum number
 * of bytes required to represent this BigInteger, including at
 * least one sign bit, which is {@code (ceil((this.bitLength() +
 * 1)/8))}.  (This representation is compatible with the
 * {@link #BigInteger(byte[]) (byte[])} constructor.)
 *
 * @return a byte array containing the two's-complement representation of
 *         this BigInteger.
 * @see    #BigInteger(byte[])
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
 * Returns a BigInteger whose value is the absolute value of this
 * BigInteger.
 *
 * @return {@code abs(this)}
 */
BigInteger.prototype.abs = function () {
  return this.signum >= 0 ? this : this.negative();
};

/**
 * Returns a BigInteger whose value is {@code (-this)}.
 *
 * @return {@code -this}
 */
BigInteger.prototype.negative = function () {
  return BigInteger.fromMag(this.mag, -this.signum);
};

BigInteger.fromMag = function (magnitude, signum) {
  
  var _bigInteger = new BigInteger();

  if (typeof signum === 'undefined') {
    // @see BigInteger(int[] val) 
    if (magnitude.length == 0)
      throw new Error("Zero length BigInteger");

    if (magnitude[0] < 0) {
      _bigInteger.mag = makePositive();
      _bigInteger.signum = -1;
    } else {
      _bigInteger.mag = trustedStripLeadingZeroInts(magnitude);
      _bigInteger.signum = _bigInteger.length === 0 ? 0 : 1
    }

  } else {
    // @see BigInteger(int[] magnitude, int signum)    
    _bigInteger.signum = (magnitude.length === 0 ? 0 : signum);
    _bigInteger.mag = magnitude;
    
  }

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
 * Right shift this MutableBigInteger n bits, where n is
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
 * Converts this BigInteger to a {@code long}.  This
 * conversion is analogous to a
 * <i>narrowing primitive conversion</i> from {@code long} to
 * {@code int} as defined in section 5.1.3 of
 * <cite>The Java&trade; Language Specification</cite>:
 * if this BigInteger is too big to fit in a
 * {@code long}, only the low-order 64 bits are returned.
 * Note that this conversion can lose information about the
 * overall magnitude of the BigInteger value as well as return a
 * result with the opposite sign.
 *
 * @return this BigInteger converted to a {@code long}.
 */
BigInteger.prototype.longValue = function () {
  var result = Long.fromInt(0);
  for (var i = 1; i >= 0; i--)
    result = result.shiftLeft(32).add(Long.fromNumber(this._getInt(i) >>> 32));
  return result;
}

BigInteger.fromMutableBigInteger = function (mb, sign) {
  if (mb.intLen === 0 || sign === 0) {
    return ZERO;
  }
  return BigInteger.fromMag(mb.getMagnitudeArray(), sign);
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
  var digitGroup = Common.intArray(maxNumDigitGroups);
  // var MutableBigInteger = require('./MutableBigInteger');
  // Translate number to string, a digit group at a time
  var tmp = this.abs();
  var numGroups = 0;
  while (tmp.signum != 0) {
    var d = BigInteger.fromLong(longRadix[radix]);
    
    var q = new MutableBigInteger();
    var a = new MutableBigInteger(tmp.mag);
    var b = new MutableBigInteger(d.mag);
    var r = a.divide(b, q);
    
    var q2 = BigInteger.fromMutableBigInteger(q, tmp.signum * d.signum);
    var r2 = BigInteger.fromMutableBigInteger(r, tmp.signum * d.signum);
     
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

/**
 * Adds the contents of the int arrays x and y. This method allocates
 * a new int array to hold the answer and returns a reference to that
 * array.
 */
function add(x, y) {
  // If x is shorter, swap the two arrays
  if (x.length < y.length) {
    var tmp = x;
    x = y;
    y = tmp;
  }

  var xIndex = x.length;
  var yIndex = y.length;
  var result = Common.intArray(xIndex);
  // long
  var sum = Long.fromInt(0);

  // Add common parts of both numbers
  while(yIndex > 0) {
    // sum = (x[--xIndex] & LONG_MASK) + (y[--yIndex] & LONG_MASK) + (sum >>> 32);
    sum = Long.fromNumber(x[--xIndex] >>> 32).add(Long.fromNumber(y[--yIndex] >>> 32)).add(sum.shiftRight(32));
    // result[xIndex] = (int)sum;
    result[xIndex] = sum.low;
  }

  // Copy remainder of longer number while carry propagation is required
  var carry = (sum.shiftRight(32).toInt() != 0);
  while (xIndex > 0 && carry)
    carry = ((result[--xIndex] = x[xIndex] + 1) == 0);

  // Copy remainder of longer number
  while (xIndex > 0)
    result[--xIndex] = x[xIndex];

  // Grow result if necessary
  if (carry) {
    var bigger = Common.intArray(result.length + 1);
    Common.arraycopy(result, 0, bigger, 1, result.length);
    bigger[0] = 0x01;
    return bigger;
  }
  return result;
}

/**  
 * Subtracts the contents of the second int arrays (little) from the
 * first (big).  The first int array (big) must represent a larger number
 * than the second.  This method allocates the space necessary to hold the
 * answer.
 */
function subtract(big, little) {
  var bigIndex = big.length;
  var result = Common.intArray(bigIndex);
  var littleIndex = little.length;
  // long
  var difference = Long.fromInt(0);

  // Subtract common parts of both numbers
  while(littleIndex > 0) {
    difference = Long.fromNumber(big[--bigIndex] >>> 32).subtract(Long.fromNumber(little[--littleIndex] >>> 32)).add(difference.shiftRight(32));
    result[bigIndex] = difference.low;
  }

  // Subtract remainder of longer number while borrow propagates
  var borrow = (difference.shiftRight(32).toInt() != 0);
  while (bigIndex > 0 && borrow)
    borrow = ((result[--bigIndex] = big[bigIndex] - 1) == -1);

  // Copy remainder of longer number
  while (bigIndex > 0)
    result[--bigIndex] = big[bigIndex];

  return result;
}

/**
 * Returns a BigInteger whose value is {@code (this + val)}.
 *
 * @param  val value to be added to this BigInteger.
 * @return {@code this + val}
 */
BigInteger.prototype.add = function (val) {
  if (val.signum === 0)
    return this;
  if (this.signum === 0)
    return val;
  if (val.signum === this.signum)
    return BigInteger.fromMag(add(this.mag, val.mag), this.signum);

  var cmp = this.compareMagnitude(val);
  if (cmp == 0)
    return ZERO;
  var resultMag = (cmp > 0 ? subtract(this.mag, val.mag) : subtract(val.mag, this.mag));
  resultMag = trustedStripLeadingZeroInts(resultMag);

  return BigInteger.fromMag(resultMag, cmp === this.signum ? 1 : -1);
}


/**
 * Returns a BigInteger whose value is {@code (this - val)}.
 *
 * @param  val value to be subtracted from this BigInteger.
 * @return {@code this - val}
 */
BigInteger.prototype.subtract = function (val) {
  if (val.signum == 0)
    return this;
  if (this.signum == 0)
    return val.negate();
  if (val.signum != this.signum)
    return BigInteger.fromMag(add(this.mag, val.mag), this.signum);

  var cmp = this.compareMagnitude(val);
  if (cmp == 0)
    return ZERO;
  var resultMag = (cmp > 0 ? subtract(this.mag, val.mag) : subtract(val.mag, this.mag));
  resultMag = trustedStripLeadingZeroInts(resultMag);
  return BigInteger.fromMag(resultMag, cmp == this.signum ? 1 : -1);
}

/**
 * Compares the magnitude array of this BigInteger with the specified
 * BigInteger's. This is the version of compareTo ignoring sign.
 *
 * @param val BigInteger whose magnitude array to be compared.
 * @return -1, 0 or 1 as this magnitude array is less than, equal to or
 *         greater than the magnitude aray for the specified BigInteger's.
 */
BigInteger.prototype.compareMagnitude = function (val) {
  var m1 = this.mag;
  var len1 = m1.length;
  var m2 = val.mag;
  var len2 = m2.length;
  if (len1 < len2)
    return -1;
  if (len1 > len2)
    return 1;
  for (var i = 0; i < len1; i++) {
    var a = m1[i];
    var b = m2[i];
    if (a != b)
      return ((a >>> 32) < (b >>> 32)) ? -1 : 1;
  }
  return 0;
}

/**
 * Multiplies int arrays x and y to the specified lengths and places
 * the result into z. There will be no leading zeros in the resultant array.
 */
function multiplyToLen(x, xlen, y, ylen, z) {
  var xstart = xlen - 1;
  var ystart = ylen - 1;

  if (z == null || z.length < (xlen+ ylen))
    z = Common.intArray(xlen+ylen);

  var carry = Long.fromInt(0);
  for (var j=ystart, k=ystart+1+xstart; j>=0; j--, k--) {
      var product = Long.fromNumber(y[j] >>> 32).multiply(Long.fromNumber(x[xstart] >>> 32)).add(carry);
      z[k] = product.low;
      carry = product.shiftRightUnsigned(32);
  }
  z[xstart] = carry.low;

  for (var i = xstart-1; i >= 0; i--) {
    carry = Long.fromInt(0);
    for (var j=ystart, k=ystart+1+i; j>=0; j--, k--) {
        var product = Long.fromNumber(y[j] >>> 32).multiply(Long.fromNumber(x[i] >>> 32)).add(Long.fromNumber(z[k] >>> 32)).add(carry);
        z[k] = product.low;
        carry = product.shiftRightUnsigned(32);
    }
    z[i] = carry.low;
  }
  return z;
}

/**
 * Returns a BigInteger whose value is {@code (this * val)}.
 *
 * @param  val value to be multiplied by this BigInteger.
 * @return {@code this * val}
 */
BigInteger.prototype.multiply = function (val) {
  if (val.signum == 0 || this.signum == 0)
    return ZERO;

  var result = multiplyToLen(this.mag, this.mag.length, val.mag, val.mag.length, null);
  result = trustedStripLeadingZeroInts(result);
  return BigInteger.fromMag(result, this.signum == val.signum ? 1 : -1);
}

/**
 * Returns the length of the two's complement representation in ints,
 * including space for at least one sign bit.
 */
BigInteger.prototype.intLength = function () {
  return (this.bitLength() >>> 5) + 1;
}

/**
 * Returns a BigInteger with the given two's complement representation.
 * Assumes that the input array will not be modified (the returned
 * BigInteger will reference the input array if feasible).
 */
function valueOf(val) {
  return (val[0] > 0 ? BigInteger.fromMag(val, 1) : BigInteger.fromMag(val));
}

/**
 * Takes an array a representing a negative 2's-complement number and
 * returns the minimal (no leading zero ints) unsigned whose value is -a.
 * @param {int[]} a
 */
function makePositive(a) {
    var keep, j;

    // Find first non-sign (0xffffffff) int of input
    for (keep = 0; keep < a.length && a[keep] === -1; keep++)
        ;

    /* Allocate output array.  If all non-sign ints are 0x00, we must
     * allocate space for one extra output int. */
    for (j = keep; j < a.length && a[j] === 0; j++)
        ;
    var extraInt = (j === a.length ? 1 : 0);
    var result = Common.intArray(a.length - keep + extraInt);

    /* Copy one's complement of input into output, leaving extra
     * int (if it exists) == 0x00 */
    for (var i = keep; i < a.length; i++)
        result[i - keep + extraInt] = ~a[i];

    // Add one to one's complement to generate two's complement
    for (var i = result.length - 1; ++result[i] === 0; i--)
        ;

    return result;
}

/**
 * Returns a BigInteger whose value is {@code (this & val)}.  (This
 * method returns a negative BigInteger if and only if this and val are
 * both negative.)
 *
 * @param val value to be AND'ed with this BigInteger.
 * @return {@code this & val}
 */
BigInteger.prototype.and = function (val) {
  var result = Common.intArray(Math.max(this.intLength(), val.intLength()));
  for (var i = 0; i < result.length; i++)
    result[i] = (this._getInt(result.length-i-1) & val._getInt(result.length-i-1));
  return valueOf(result);
}

/**
* Squares the contents of the int array x. The result is placed into the
* int array z.  The contents of x are not changed.
*/
var squareToLen = BigInteger.squareToLen = function (x, len, z) {
  /*
   * The algorithm used here is adapted from Colin Plumb's C library.
   * Technique: Consider the partial products in the multiplication
   * of "abcde" by itself:
   *
   *               a  b  c  d  e
   *            *  a  b  c  d  e
   *          ==================
   *              ae be ce de ee
   *           ad bd cd dd de
   *        ac bc cc cd ce
   *     ab bb bc bd be
   *  aa ab ac ad ae
   *
   * Note that everything above the main diagonal:
   *              ae be ce de = (abcd) * e
   *           ad bd cd       = (abc) * d
   *        ac bc             = (ab) * c
   *     ab                   = (a) * b
   *
   * is a copy of everything below the main diagonal:
   *                       de
   *                 cd ce
   *           bc bd be
   *     ab ac ad ae
   *
   * Thus, the sum is 2 * (off the diagonal) + diagonal.
   *
   * This is accumulated beginning with the diagonal (which
   * consist of the squares of the digits of the input), which is then
   * divided by two, the off-diagonal added, and multiplied by two
   * again.  The low bit is simply a copy of the low bit of the
   * input, so it doesn't need special care.
   */
  var zlen = len << 1;
  if (z == null || z.length < zlen)
    z = Common.intArray(zlen);

  // Store the squares, right shifted one bit (i.e., divided by 2)
  var lastProductLowWord = 0;
  for (var j=0, i=0; j<len; j++) {
    var piece = Long.fromNumber(x[j] >>> 32);
    var product = piece.multiply(piece);
    z[i++] = (lastProductLowWord << 31) | product.shiftRightUnsigned(33).low;
    z[i++] = product.shiftRightUnsigned(1).low;
    lastProductLowWord = product.low;
  }

  // Add in off-diagonal sums
  for (var i = len, offset = 1; i > 0; i--, offset += 2) {
    var t = x[i-1];
    t = mulAdd(z, x, offset, i-1, t);
    addOne(z, offset-1, i, t);
  }

  // Shift back up and set low bit
  primitiveLeftShift(z, zlen, 1);
  z[zlen-1] |= x[len-1] & 1;

  return z;
}

/**
 * Multiply an array by one word k and add to result, return the carry
 * int[] out, int[] in, int offset, int len, int k
 */
function mulAdd(out, _in, offset, len, k) {
    var kLong = Long.fromNumber(k >>> 32);
    var carry = Long.fromNumber(0);

    offset = out.length - offset - 1;
    for (var j=len-1; j >= 0; j--) {
      var product = Long.fromNumber(_in[j] >>> 32).multiply(kLong).add(Long.fromNumber(out[offset] >>> 32)).add(carry);
      out[offset--] = product.low;
      carry = product.shiftRightUnsigned(32);
    }
    return carry.low;
}

/**
 * Add one word to the number a mlen words into a. Return the resulting
 * carry.
 * int[] a, int offset, int mlen, int carry
 */
function addOne(a, offset, mlen, carry) {
  offset = a.length - 1 - mlen - offset;
  var t = Long.fromNumber(a[offset] >>> 32).add(Long.fromNumber(carry >>> 32));

  a[offset] = t.low;
  if (t.shiftRightUnsigned(32).toInt() === 0)
    return 0;
  while (--mlen >= 0) {
    if (--offset < 0) { // Carry out of number
      return 1;
    } else {
      a[offset]++;
      if (a[offset] != 0)
        return 0;
    }
  }
  return 1;
}

// shifts a up to len left n bits assumes no leading zeros, 0<=n<32
function primitiveLeftShift(a, len, n) {
  if (len === 0 || n === 0)
    return;
  var n2 = 32 - n;
  for (var i=0, c=a[i], m=i+len-1; i<m; i++) {
      var b = c;
      c = a[i+1];
      a[i] = (b << n) | (c >>> n2);
  }
  a[len-1] <<= n;
}


/**
 * Returns a BigInteger whose value is <tt>(this<sup>exponent</sup>)</tt>.
 * Note that {@code exponent} is an integer rather than a BigInteger.
 *
 * @param  exponent exponent to which this BigInteger is to be raised.
 * @return <tt>this<sup>exponent</sup></tt>
 * @throws ArithmeticException {@code exponent} is negative.  (This would
 *         cause the operation to yield a non-integer value.)
 */
BigInteger.prototype.pow = function (exponent) {
  if (exponent < 0)
    throw new Error("Negative exponent");
  if (this.signum === 0)
    return (exponent === 0 ? ONE : this);

  // Perform exponentiation using repeated squaring trick
  var newSign = (this.signum < 0 && (exponent & 1) === 1 ? -1 : 1);
  var baseToPow2 = this.mag;
  var result = [1];

  while (exponent != 0) {
    if ((exponent & 1)==1) {
      result = multiplyToLen(result, result.length, baseToPow2, baseToPow2.length, null);
      result = trustedStripLeadingZeroInts(result);
    }
    if ((exponent >>>= 1) != 0) {
      baseToPow2 = squareToLen(baseToPow2, baseToPow2.length, null);
      baseToPow2 = trustedStripLeadingZeroInts(baseToPow2);
    }
  }
  return BigInteger.fromMag(result, newSign);
}

/**
 * Returns a BigInteger whose value is {@code (this | val)}.  (This method
 * returns a negative BigInteger if and only if either this or val is
 * negative.)
 *
 * @param val value to be OR'ed with this BigInteger.
 * @return {@code this | val}
 */
BigInteger.prototype.or = function (val) {
  var result = Common.intArray(Math.max(this.intLength(), val.intLength()));
  for (var i = 0; i < result.length; i++)
    result[i] = (this._getInt(result.length-i-1) | val._getInt(result.length-i-1));

  return valueOf(result);
}


/**
 * Returns a BigInteger whose value is {@code (this ^ val)}.  (This method
 * returns a negative BigInteger if and only if exactly one of this and
 * val are negative.)
 *
 * @param val value to be XOR'ed with this BigInteger.
 * @return {@code this ^ val}
 */
BigInteger.prototype.xor = function (val) {
    var result = Common.intArray(Math.max(this.intLength(), val.intLength()));
    for (var i=0; i<result.length; i++)
      result[i] = (this._getInt(result.length-i-1) ^ val._getInt(result.length-i-1));

    return valueOf(result);
}

/**
 * Returns a BigInteger whose value is {@code (this & ~val)}.  This
 * method, which is equivalent to {@code and(val.not())}, is provided as
 * a convenience for masking operations.  (This method returns a negative
 * BigInteger if and only if {@code this} is negative and {@code val} is
 * positive.)
 *
 * @param val value to be complemented and AND'ed with this BigInteger.
 * @return {@code this & ~val}
 */
BigInteger.prototype.andNot = function (val) {
  var result = Common.intArray(Math.max(this.intLength(), val.intLength()));
  for (var i=0; i<result.length; i++)
    result[i] = (this._getInt(result.length-i-1) & ~val._getInt(result.length-i-1));

  return valueOf(result);
}

/**
 * Returns a BigInteger whose value is {@code (~this)}.  (This method
 * returns a negative value if and only if this BigInteger is
 * non-negative.)
 *
 * @return {@code ~this}
 */
BigInteger.prototype.not = function () {
  var result = Common.intArray(this.intLength());
  for (var i=0; i<result.length; i++)
    result[i] = ~this._getInt(result.length-i-1);

  return valueOf(result);
}

/**
 * Returns the number of bits in the two's complement representation
 * of this BigInteger that differ from its sign bit.  This method is
 * useful when implementing bit-vector style sets atop BigIntegers.
 *
 * @return number of bits in the two's complement representation
 *         of this BigInteger that differ from its sign bit.
 */ 
BigInteger.prototype.bitCount = function () {
  var bc = this.bitCount - 1;
  if (bc === -1) {  // bitCount not initialized yet
    bc = 0;      // offset by one to initialize
    // Count the bits in the magnitude
    for (var i = 0; i< this.mag.length; i++)
      bc += Integer.bitCount(this.mag[i]);
    if (this.signum < 0) {
      // Count the trailing zeros in the magnitude
      var magTrailingZeroCount = 0, j;
      for (j = this.mag.length-1; this.mag[j]==0; j--)
          magTrailingZeroCount += 32;
      magTrailingZeroCount += Integer.numberOfTrailingZeros(this.mag[j]);
      bc += magTrailingZeroCount - 1;
    }
    this.bitCount = bc + 1;
  }
  return bc;
}

/**
 * Returns a BigInteger whose value is equivalent to this BigInteger
 * with the designated bit cleared.
 * (Computes {@code (this & ~(1<<n))}.)
 *
 * @param  n index of bit to clear.
 * @return {@code this & ~(1<<n)}
 * @throws ArithmeticException {@code n} is negative.
 */
BigInteger.prototype.clearBit = function (n) {
  if (n<0)
    throw new Error("Negative bit address");

  var intNum = n >>> 5;
  var result = Common.intArray(Math.max(this.intLength(), ((n + 1) >>> 5) + 1));

  for (var i = 0; i < result.length; i++)
    result[result.length-i-1] = this._getInt(i);

  result[result.length-intNum-1] &= ~(1 << (n & 31));

  return valueOf(result);
}

/**
 * Returns a BigIntegerTest whose value is {@code (this << n)}.
 * The shift distance, {@code n}, may be negative, in which case
 * this method performs a right shift.
 * (Computes <tt>floor(this * 2<sup>n</sup>)</tt>.)
 *
 * @param  n shift distance, in bits.
 * @return {@code this << n}
 * @throws ArithmeticException if the shift distance is {@code
 *         Integer.MIN_VALUE}.
 * @see #shiftRight
 */
BigInteger.prototype.shiftLeft = function (n) {
  if (this.signum == 0)
    return ZERO;
  if (n==0)
    return this;
  if (n<0) {
    if (n == Integer.MIN_VALUE) {
        throw new Error("Shift distance of Integer.MIN_VALUE not supported.");
    } else {
        return this.shiftRight(-n);
    }
  }

  var nInts = n >>> 5;
  var nBits = n & 0x1f;
  var magLen = this.mag.length;
  var newMag = null;

  if (nBits == 0) {
    newMag = Common.intArray(magLen + nInts);
    for (var i=0; i<magLen; i++)
      newMag[i] = this.mag[i];
  } else {
      var i = 0;
      var nBits2 = 32 - nBits;
      var highBits = this.mag[0] >>> nBits2;
      if (highBits != 0) {
          newMag = Common.intArray(magLen + nInts + 1);
          newMag[i++] = highBits;
      } else {
          newMag = Common.intArray(magLen + nInts);
      }
      var j=0;
      while (j < magLen-1)
          newMag[i++] = this.mag[j++] << nBits | this.mag[j] >>> nBits2;
      newMag[i] = this.mag[j] << nBits;
  }

  return BigInteger.fromMag(newMag, this.signum);
}

/**
 * Returns a BigIntegerTest whose value is {@code (this >> n)}.  Sign
 * extension is performed.  The shift distance, {@code n}, may be
 * negative, in which case this method performs a left shift.
 * (Computes <tt>floor(this / 2<sup>n</sup>)</tt>.)
 *
 * @param  n shift distance, in bits.
 * @return {@code this >> n}
 * @throws ArithmeticException if the shift distance is {@code
 *         Integer.MIN_VALUE}.
 * @see #shiftLeft
 */
BigInteger.prototype.shiftRight = function (n) {
    if (n==0)
      return this;
    if (n<0) {
      if (n == Integer.MIN_VALUE) {
          throw new Error("Shift distance of Integer.MIN_VALUE not supported.");
      } else {
          return this.shiftLeft(-n);
      }
    }

    var nInts = n >>> 5;
    var nBits = n & 0x1f;
    var magLen = this.mag.length;
    var newMag = null;

    // Special case: entire contents shifted off the end
    if (nInts >= magLen)
        return (this.signum >= 0 ? ZERO : negConst[1]);

    if (nBits == 0) {
        var newMagLen = magLen - nInts;
        newMag = Common.intArray(newMagLen);
        for (var i=0; i<newMagLen; i++)
            newMag[i] = this.mag[i];
    } else {
        var i = 0;
        var highBits = this.mag[0] >>> nBits;
        if (highBits != 0) {
            newMag = Common.intArray(magLen - nInts);
            newMag[i++] = highBits;
        } else {
            newMag = Common.intArray(magLen - nInts -1);
        }

        var nBits2 = 32 - nBits;
        var j=0;
        while (j < magLen - nInts - 1)
            newMag[i++] = (this.mag[j++] << nBits2) | (this.mag[j] >>> nBits);
    }

    if (this.signum < 0) {
        // Find out whether any one-bits were shifted off the end.
        var onesLost = false;
        for (var i=magLen-1, j=magLen-nInts; i>=j && !onesLost; i--)
            onesLost = (this.mag[i] != 0);
        if (!onesLost && nBits != 0)
            onesLost = (this.mag[magLen - nInts - 1] << (32 - nBits) != 0);

        if (onesLost)
            newMag = javaIncrement(newMag);
    }

    return BigInteger.fromMag(newMag, this.signum);
}

function javaIncrement(val) {
  var lastSum = 0;
  for (var i=val.length-1;  i >= 0 && lastSum == 0; i--)
      lastSum = (val[i] += 1);
  if (lastSum == 0) {
      val = Common.intArray(val.length+1);
      val[0] = 1;
  }
  return val;
}

/**
 * Compares this BigIntegerTest with the specified BigIntegerTest.  This
 * method is provided in preference to individual methods for each
 * of the six boolean comparison operators ({@literal <}, ==,
 * {@literal >}, {@literal >=}, !=, {@literal <=}).  The suggested
 * idiom for performing these comparisons is: {@code
 * (x.compareTo(y)} &lt;<i>op</i>&gt; {@code 0)}, where
 * &lt;<i>op</i>&gt; is one of the six comparison operators.
 *
 * @param  val BigIntegerTest to which this BigIntegerTest is to be compared.
 * @return -1, 0 or 1 as this BigIntegerTest is numerically less than, equal
 *         to, or greater than {@code val}.
 */
BigInteger.prototype.compareTo = function (val) {
  if (this.signum == val.signum) {
    switch (this.signum) {
    case 1:
      return this.compareMagnitude(val);
    case -1:
      return val.compareMagnitude(this);
    default:
      return 0;
    }
  }
  return this.signum > val.signum ? 1 : -1;
}

/**
 * Compares this BigIntegerTest with the specified Object for equality.
 *
 * @param  x Object to which this BigIntegerTest is to be compared.
 * @return {@code true} if and only if the specified Object is a
 *         BigIntegerTest whose value is numerically equal to this BigIntegerTest.
 */
BigInteger.prototype.equals = function (x) {
  // This test is just an optimization, which may or may not help
  // if (x === this)
  //   return true;

  if (x.constructor.name !== 'BigInteger')
    return false;

  var xInt = x;
  if (xInt.signum != this.signum)
      return false;

  var m = this.mag;
  var len = m.length;
  var xm = xInt.mag;
  if (len != xm.length)
    return false;

  for (var i = 0; i < len; i++){
    if (xm[i] != m[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Returns a BigIntegerTest whose value is {@code (this % val)}.
 *
 * @param  val value by which this BigIntegerTest is to be divided, and the
 *         remainder computed.
 * @return {@code this % val}
 * @throws ArithmeticException if {@code val} is zero.
 */
BigInteger.prototype.remainder = function (val) {
  var q = new MutableBigInteger();
  var a = new MutableBigInteger(this.mag);
  var b = new MutableBigInteger(val.mag);
  var x = a.divide(b, q);
  return BigInteger.fromMutableBigInteger(x, this.signum);
}

/**
 * Returns a BigIntegerTest whose value is {@code (this mod m}).  This method
 * differs from {@code remainder} in that it always returns a
 * <i>non-negative</i> BigIntegerTest.
 *
 * @param  m the modulus.
 * @return {@code this mod m}
 * @throws ArithmeticException {@code m} &le; 0
 * @see    #remainder
 */
BigInteger.prototype.mod = function (m) {
  if (m.signum <= 0)
    throw new Error("BigInteger: modulus not positive");

  var result = this.remainder(m);
  return (result.signum >= 0 ? result : result.add(m));
}

/**
 * Initialize static constant array when class is loaded.
 */
var MAX_CONSTANT = 16;
var posConst = new Array(MAX_CONSTANT + 1);
var negConst = new Array(MAX_CONSTANT + 1);

for (var i = 1; i <= MAX_CONSTANT; i++) {
  var magnitude = Common.intArray(1);
  magnitude[0] = i;
  posConst[i] = BigInteger.fromMag(magnitude,  1);
  negConst[i] = BigInteger.fromMag(magnitude, -1);
}

var ZERO = BigInteger.fromMag([0], 0);

module.exports = BigInteger;

