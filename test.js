describe('predefine', function () {
  'use strict';

  var predefine = require('./')
    , assume = require('assume');

  it('exports as function', function () {
    assume(predefine).to.be.a('function');
  });

  it('correctly assigns the value', function () {
    var obj = {};

    var writable = predefine(obj, predefine.WRITABLE)
      , readable = predefine(obj, predefine.READABLE);

    readable('foo', 'bar');
    assume(obj.foo).to.equal('bar');

    try { obj.foo = 'foo'; }
    catch (e) {}

    assume(obj.foo).to.equal('bar');

    writable('bar', 'bar');
    assume(obj.bar).to.equal('bar');

    obj.bar = 'foo';
    assume(obj.bar).to.equal('foo');
    assume(Object.keys(obj).length).to.equal(0);

    readable('cache', {
      get: function () { },
      set: function () { }
    });

    assume(obj.cache).to.be.a('object');
    assume(obj.cache.get).to.be.a('function');
    assume(obj.cache.set).to.be.a('function');
  });

  it('supports overriding', function () {
    var obj = {}
      , value = 'str'
      , readable = predefine(obj, predefine.READABLE);

    readable('cache', {
      get: function () { return value; },
      set: function (data) { value = data; return value; }
    }, true);

    assume(obj.cache).to.be.a('string');
    assume(obj.cache).to.equal('str');
    assume(obj.cache).to.equal(value);

    obj.cache = 'bar';
    assume(obj.cache).to.be.a('string');
    assume(obj.cache).to.equal('bar');
    assume(obj.cache).to.equal(value);
  });

  it('does not throw when attempting to override', function () {
    var obj = {};

    var readable = predefine(obj, predefine.READABLE);

    readable('foo', 'bar');
    readable('foo', 'bar');
  });

  describe('.descriptor', function () {
    it('sees non Objects as an invalid description', function () {
      assume(predefine.descriptor([])).to.equal(false);
      assume(predefine.descriptor(undefined)).to.equal(false);
      assume(predefine.descriptor(null)).to.equal(false);
      assume(predefine.descriptor(0)).to.equal(false);
      assume(predefine.descriptor(1)).to.equal(false);
      assume(predefine.descriptor('')).to.equal(false);
      assume(predefine.descriptor(new Date)).to.equal(false);
    });

    it('disallows empty objects', function () {
      assume(predefine.descriptor({})).to.equal(false);
    });

    it('correctly detects valid descriptions', function () {
      assume(predefine.descriptor({
        enumerable: false
      })).to.equal(true);

      assume(predefine.descriptor({
        enumerable: true
      })).to.equal(true);

      assume(predefine.descriptor({
        enumerable: true,
        configurable: false
      })).to.equal(true);

      assume(predefine.descriptor({
        set: function() {},
        get: function() {}
      })).to.equal(true);

      assume(predefine.descriptor({
        set: function() {},
        get: function() {},
        value: 'foo'
      })).to.equal(false);

      assume(predefine.descriptor({
        set: true,
        get: false,
      })).to.equal(false);

      assume(predefine.descriptor({
        enumerable: function () {}
      })).to.equal(false);
    });

    it('doesnt accept non description keys in a object', function () {
      assume(predefine.descriptor({
        enumerable: true,
        configurable: false,
        fake: true
      })).to.equal(false);
    });
  });

  describe('patterns', function () {
    it('exposes the READABLE pattern', function () {
      assume(predefine.READABLE).to.be.a('object');
      assume(predefine.READABLE.enumerable).to.equal(false);
    });

    it('exposes the WRITABLE pattern', function () {
      assume(predefine.WRITABLE).to.be.a('object');
      assume(predefine.WRITABLE.configurable).to.equal(true);
      assume(predefine.WRITABLE.enumerable).to.equal(false);
      assume(predefine.WRITABLE.writable).to.equal(true);
    });
  });

  describe('.remove', function () {
    it('removes properties from an object', function () {
      var obj = { foo: 'bar' };

      predefine.remove(obj);
      assume(obj.foo).to.equal(undefined);
      assume('foo' in obj).to.equal(false);
    });

    it('doesnt remove defined properties', function () {
      var obj = { bar: 'bar' }
        , define = predefine(obj);

      define('foo', 'bar');
      assume(obj.foo).to.equal('bar');
      assume(obj.bar).to.equal('bar');

      predefine.remove(obj);
      assume(obj.foo).to.equal('bar');
      assume(obj.bar).to.equal(undefined);
    });
  });

  describe('.lazy', function () {
    it('adds a lazy loading property to the object', function () {
      var obj = {}
        , calls = 0;

      predefine.lazy(obj, 'foo', function () {
        calls++;
        return 'foo';
      });

      assume(calls).to.equal(0);
      assume(obj.foo).to.equal('foo');
      assume(calls).to.equal(1);
      assume(obj.foo).to.equal('foo');
      assume(calls).to.equal(1);
    });
  });

  describe('.merge', function () {
    it('avoids prototype polluting', function () {
      predefine.merge({}, JSON.parse('{"__proto__": {"a": "b"}}'));

      assume(({}).a).to.be.undefined();
   });
  });
});
