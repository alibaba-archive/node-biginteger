exports.copyOfRange = function (original, from, to) {
  var newLength = to - from;
  if (newLength < 0)
      throw new Error(from + " > " + to);
  var copy = new Array(newLength);
  var destPos = 0;
  var srcPos = from;
  var length = Math.min(original.length - from, newLength);
  for (var i = srcPos; i < (srcPos + length); i++) {
    copy[destPos++] = original[i];
  }
  return copy;
}