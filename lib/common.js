exports.copyOfRange = function (original, from, to) {
  var newLength = to - from;
  if (newLength < 0)
      throw new Error(from + " > " + to);
  var copy = new Array(newLength);
  arraycopy(original, from, copy, 0, Math.min(original.length - from, newLength));
  return copy;
}

var arraycopy = exports.arraycopy = function (src, srcPos, dest, destPos, length) {
  for (var i = srcPos; i < (srcPos + length); i++) {
    dest[destPos++] = src[i];
  }
};

var intArray = exports.intArray = function (length) {
  var array = new Array(length);
  for (var i = 0; i < length; i++) {
    array[i] = 0;
  }
  return array;
};

exports.copyOf = function (original, newLength) {
  var copy = intArray(newLength);
  arraycopy(original, 0, copy, 0, Math.min(original.length, newLength));
  return copy;
}