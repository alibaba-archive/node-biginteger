node-biginteger
======

This library is based on [java.math.BigInteger](http://docs.oracle.com/javase/7/docs/api/java/math/BigInteger.html)
Dependency [Long](https://github.com/dcodeIO/Long.js.git)

example
======

```
  $ npm install node-biginteger

  var BigInteger = require('node-biginteger');
  var n = BigInteger.fromString('abc', 16);
  n.toString(16);
  
```

Class Method: BigInteger.fromLong(val)
------
- val Long
- Return: BigInteger

Class Method: BigInteger.fromString(val, [radix])
------
- val String
- radix int,Optional, Default: 10
- Return: BigInteger

Class Method: BigInteger.fromBuffer(signum, magnitude)
------
- signum int, 1,0,-1
- magnitude Array
- Return: BigInteger

n.toBuffer()
------
- Return: Buffer

n.toString()
------
- Return: String

n.abs()
------
- Return: BigInteger

n.negative()
------
- Return: BigInteger

n.longValue()
------
- Return: Long

n.add(val)
------
- val BigInteger
- Return: BigInteger

n.subtract(val)
------
- val BigInteger
- Return: BigInteger

n.multiply(val)
------
- val BigInteger
- Return: BigInteger

n.and(val)
------
- val BigInteger
- Return: BigInteger

n.andNot(val)
------
- val BigInteger
- Return: BigInteger

n.not()
------
- Return: BigInteger

n.pow(exponent)
------
- exponent int
- Return: BigInteger

```
  var n = BigInteger.fromString('2', 10);
  var n1 = n.pow(2);
  console.log(n1.toString());
  // 4
```

n.or()
------
- Return: BigInteger

n.xor(val)
------
- val BigInteger
- Return: BigInteger

n.bitLength()
------
- Return: int

n.bitCount()
------
- Return: int

n.clearBit(n)
------
- n int
- Return: BigInteger

n.compareTo(val)
------
- val BigInteger
- Return: BigInteger

n.equals(x)
------
- x BigInteger
- Return: Boolean

n.shiftLeft(n)
------
- n int
- Return: BigInteger

n.shiftRight(n)
------
- n int
- Return: BigInteger

n.mod(n)
------
- n BigInteger
- Return: BigInteger



n.modPow(exponent, m)
------
- exponent BigInteger
- m BigInteger
- Return: BigInteger


## License
MIT




