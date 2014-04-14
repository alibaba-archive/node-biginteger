exports.numberOfLeadingZeros = function (i) {
  // HD, Figure 5-6
  if (i == 0)
    return 32;
  
  var n = 1;
  if (i >>> 16 == 0) { n += 16; i <<= 16; }
  if (i >>> 24 == 0) { n +=  8; i <<=  8; }
  if (i >>> 28 == 0) { n +=  4; i <<=  4; }
  if (i >>> 30 == 0) { n +=  2; i <<=  2; }
  n -= i >>> 31;

  return n;
}

exports.bitCount = function (i) {
  // HD, Figure 5-2
  i = i - ((i >>> 1) & 0x55555555);
  i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
  i = (i + (i >>> 4)) & 0x0f0f0f0f;
  i = i + (i >>> 8);
  i = i + (i >>> 16);
  return i & 0x3f;
}