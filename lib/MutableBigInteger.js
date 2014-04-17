
var Integer = require('./Integer');
var BigIntegerLib = require('./BigIntegerLib');
var Long = require('long');
var Common = require('./common');

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
  var div = Common.copyOfRange(b.value, b.offset, b.offset + b.intLen);
  return this.divideMagnitude(div, quotient);
}

/**
 * Divide this MutableBigInteger by the divisor represented by its magnitude
 * array. The quotient will be placed into the provided quotient object &
 * the remainder object is returned.
 */
MutableBigInteger.prototype.divideMagnitude = function (divisor, quotient) {
  // Remainder starts as dividend with space for a leading zero
  var rem = new MutableBigInteger();
  Common.arraycopy(this.value, this.offset, rem.value, 1, this.intLen);
  rem.intLen = this.intLen;
  rem.offset = 1;
  
  var nlen = rem.intLen;

  // Set the quotient size
  var dlen = divisor.length;
  var limit = nlen - dlen + 1;
  if (quotient.value.length < limit) {
    quotient.value =  Common.intArray(limit);
    quotient.offset = 0;
  }
  quotient.intLen = limit;
  // int[]
  var q = quotient.value;

  // D1 normalize the divisor
  var shift = Integer.numberOfLeadingZeros(divisor[0]);
  if (shift > 0) {
      // First shift will not grow array
      BigIntegerLib.primitiveLeftShift(divisor, dlen, shift);
      // But this one might
      rem.leftShift(shift);
  }

  // Must insert leading 0 in rem if its length did not change
  if (rem.intLen == nlen) {
    rem.offset = 0;
    rem.value[0] = 0;
    rem.intLen++;
  }

  var dh = divisor[0];
  var dhLong = Long.fromNumber(dh >>> 32);
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
      var nChunk = Long.fromInt(nh).shiftLeft(32).or(Long.fromNumber(nm >>> 32));
      if (nChunk >= 0) {
        qhat = nChunk.div(dhLong).low;
        qrem = nChunk.subtract(Long.fromInt(qhat).multiply(dhLong)).low;
      } else {
        this.divWord(qWord, nChunk, dh);
        qhat = qWord[0];
        qrem = qWord[1];
      }
    }

    if (qhat == 0)
      continue;

    if (!skipCorrection) { // Correct qhat
      var nl = Long.fromNumber(rem.value[j + 2 + rem.offset] >>> 32);
      var rs = Long.fromNumber(qrem >>> 32).shiftLeft(32).or(nl);
      var estProduct = Long.fromNumber(dl >>> 32).multiply(Long.fromNumber(qhat >>> 32));

      if (this.unsignedLongCompare(estProduct, rs)) {
        qhat--;
        var qrem = Long.fromNumber(qrem >>> 32).add(dhLong).low;
        if (Long.fromNumber(qrem >>> 32).compare(dhLong) >= 0) {
          estProduct = estProduct.subtract(Long.fromNumber(dl >>> 32));
          rs = Long.fromNumber(qrem >>> 32).shiftLeft(32).or(nl);
          if (this.unsignedLongCompare(estProduct, rs)) {
            qhat--;
          }
        }

      }
    }

    // D4 Multiply and subtract
    rem.value[j + rem.offset] = 0;
    
    var borrow = this.mulsub(rem.value, divisor, qhat, dlen, j + rem.offset);

    // D5 Test remainder
    if ((borrow + 0x80000000) > nh2) {
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
  var carry = Long.fromInt(0);
  for (var j = a.length-1; j >= 0; j--) {
    var sum = Long.fromNumber(a[j] >>> 32).add(Long.fromNumber(result[j + offset] >>> 32)).add(carry);
    result[j+offset] = sum.low;
    carry = sum.shiftRightUnsigned(32);
  }
  return carry.low;
}

/**
 * Ensure that the MutableBigIntegerTest is in normal form, specifically
 * making sure that there are no leading zeros, and that if the
 * magnitude is zero, then intLen is zero.
 */
MutableBigInteger.prototype.normalize = function () {
  if (this.intLen === 0) {
    this.offset = 0;
    return;
  }

  var index = this.offset;
  if (this.value[index] != 0)
    return;

  var indexBound = index + this.intLen;
  do {
    index++;
  } while((index < indexBound) && (this.value[index] === 0));
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
    carry = Long.fromNumber( product.shiftRightUnsigned(32).low ).add( 
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
  var bitsInHighWord = BigIntegerLib.bitLengthForInt(this.value[this.offset]);

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
    var result =  Common.intArray(newLen);
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
  var bitsInHighWord = BigIntegerLib.bitLengthForInt(this.value[this.offset]);
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
  var val = Common.intArray(this.intLen);
  for (var i = 0; i < this.intLen; i++) {
    val[i] = this.value[i];
  }
  return new MutableBigInteger(val);
}

MutableBigInteger.prototype.getMagnitudeArray = function () {
  if (this.offset > 0 || this.value.length != this.intLen) {
    return Common.copyOfRange(this.value, this.offset, this.offset + this.intLen);
  }
  return this.value;
};

// MutableBigInteger.prototype.toBigInteger = function (sign) {
//   if (this.intLen == 0 || sign == 0) {
//     return BigInteger.fromMag([0], 0);
//   }
//   return BigInteger.fromMag(this.getMagnitudeArray(), sign);
// }


module.exports = MutableBigInteger;

