// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 Seapine Software, Inc. and contributors
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module, test, ok, equals */

var C;

module('SC.Object children', {
  setup: function () {
    C = SC.Object.extend({
      childProperties: ['a'],

      a: SC.Object.extend()
    });
  }
});

test('instantiates and destroys childProperties', function () {
  var obj = C.create(),
      child = obj.a;

  ok(child.isObject, 'child property was created');

  obj.destroy();
  ok(child.isDestroyed, 'object at child property was destroyed');
  equals(obj.a, null, 'child property was set to null');
});

test('can add and remove childProperties', function () {
  var obj = C.create(),
      childB,
      childC,
      childD;

  obj.set('b', SC.Object.create());
  obj.set('c', SC.Object.create());
  obj.set('d', SC.Object.create());
  obj.addChildProperty('b');
  obj.addChildProperty('d');
  childB = obj.b;
  childC = obj.c;
  childD = obj.d;

  ok(obj._childProperties.indexOf('d') >= 0, 'property "d" is initially a child property');
  obj.removeChildProperty('d');
  ok(obj._childProperties.indexOf('d') < 0, 'property "d" is no longer a child property');

  obj.destroy();

  ok(childB.isDestroyed, 'object at child property "b" was destroyed');
  equals(obj.b, null, 'child property "b" was set to null');
  ok(!childC.isDestroyed, 'object at property "c" was not destroyed');
  ok(obj.c !== null, 'property "c" was not set to null');
  ok(!childD.isDestroyed, 'object at property "d" was not destroyed');
  ok(obj.d !== null, 'property "d" was not set to null');
});

test('can add and remove childObjects', function () {
  var obj = C.create(),
      childB = SC.Object.create(),
      childC = SC.Object.create(),
      childD = SC.Object.create();

  obj.addChildObject(childB);
  obj.addChildObject(childD);

  ok(obj._childObjects.indexOf(childD) >= 0, 'object "childD" is initially a child object');
  obj.removeChildObject(childD);
  ok(obj._childObjects.indexOf(childD) < 0, 'object "childD" is no longer a child object');

  obj.destroy();

  ok(childB.isDestroyed, 'child object "childB" was destroyed');
  ok(!childC.isDestroyed, 'object "childC" was not destroyed');
  ok(!childC.isDestroyed, 'object "childD" was not destroyed');
});

test('childProperties get destroyed when set', function () {
  var obj = C.create(),
      childA = obj.a,
      childB = SC.Object.create();

  obj.set('a', childB);
  ok(childA.isDestroyed, 'previous value of child property is destroyed when new value is set');

  obj.set('a', null);
  ok(childB.isDestroyed, 'previous value of child property is destroyed when set to null');
});

test('cannot have duplicate childProperties', function () {
  var obj = C.create();

  ok(obj._childProperties.length === 1, '_childProperties initially has one key');
  obj.addChildProperty('a');
  ok(obj._childProperties.length === 1, '_childProperties still has one key');
});

test('cannot have duplicate childObjects', function () {
  var obj = C.create(),
      childB = SC.Object.create();

  obj.addChildObject(childB);
  ok(obj._childObjects.length === 1, '_childObjects initially has one key');
  obj.addChildObject(childB);
  ok(obj._childObjects.length === 1, '_childObjects still has one key');
});
