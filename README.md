# predefine

[![Build Status](https://travis-ci.org/3rd-Eden/predefine.png)](https://travis-ci.org/3rd-Eden/predefine)

When creating objects or prototypes using `Object.defineProperties` or
`Object.defineProperty` it make your code look really verbose by all the
property descriptions that it needs. Most of the time, they are the same. They
either make your properties writable, readable or prevents them from being
enumerable. So basically:

Predefine makes `Object.defineProperties` your human readable and manageable.

## Installation

```
npm install --save predefine
```

## Getting started

```
var predefine = require('predefine');

function Base() {
  var readable = predefine(this, { configurable: false, enumerable: false })
    , writable = predefine(this, predefine.WRITABLE);

  readable('prop', 'value');
  writable('data', []);
}

Base.writable = predefine(Base.prototype, predefine.WRITABLE);

Base.writable('foo', 'bar');
```

## License

MIT
