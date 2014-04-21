# BigInteger
==========

#### `BigInteger fromLong(val) √`

#### `BigInteger fromString(val, radix) √`

#### `Buffer toBuffer() √`

#### `String toString() √`

#### `BigInteger abs() √`

#### `BigInteger negative() √`

#### `Long longValue() √`

#### `BigInteger fromBuffer(signum, magnitude) √`

#### `BigInteger add(val) √`

#### `BigInteger subtract(val) √`

#### `BigInteger multiply(val) √`

#### `BigInteger and(val) √`

#### `BigInteger andNot(val) √`

#### `BigInteger not() √`

#### `BigInteger pow(exponent) √`

#### `BigInteger or() √`

#### `BigInteger xor(val) √`

#### `int bitLength() √`

#### `int bitCount() √`

#### `BigInteger clearBit(n) √`

#### `BigInteger compareTo(val) √`

#### `Boolean equals(x) √`

#### `BigInteger shiftLeft(n) √`

#### `BigInteger shiftRight(n) √`

#### `BigInteger mod(n) √`

#### `BigInteger modPow(exponent, m) x`

#### java -> js

```
  long LONG_MASK = 0xffffffffL;
  
  int a = 1;
  a & LONG_MASK 
    ==> a >>> 32;

  int qrem = 0;
  long rs = ((qrem & LONG_MASK) << 32) 
    ==> Long.fromNumber(qrem >>> 32).shiftLeft(32);

```

## License
MIT




