exports.copyOfRange = function (original, from, to) {
  var newLength = to - from;
  if (newLength < 0)
      throw new Error(from + " > " + to);
  var copy = new Array(newLength);
  arrayCopy(original, from, copy, 0, Math.min(original.length - from, newLength));
  return copy;
}

var arrayCopy = exports.arrayCopy = function (src, srcPos, dest, destPos, length) {
  for (var i = srcPos; i < (srcPos + length); i++) {
    dest[destPos++] = src[i];
  }
};