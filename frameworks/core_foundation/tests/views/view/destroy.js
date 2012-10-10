// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/* global module test equals context ok same */

module("SC.View#destroy");

test('isDestroyed works.', function() {
  var v = SC.View.create();
  ok(!v.get('isDestroyed'), 'undestroyed view\'s isDestroyed property is false.');
  v.destroy();
  ok(v.get('isDestroyed'), 'destroyed view\'s isDestroyed property is true.');
});

test('childViews specified as classes are also destroyed.', function() {
  var v = SC.View.create({ childViews: [ SC.View ] }),
      v2 = v.childViews[0];
  ok(v2.get('owner') === v, 'precond - child instance instantiated by view correctly references view as owner.');
  v.destroy();
  ok(v2.get('isDestroyed'), 'destroying a parent also destroys a child, mwaha.');
  ok(!v2.get('parentView'), 'destroying a parent removes the parentView reference from the child.');
  ok(v2.get('owner') === null, 'destroying a parent removes the owner reference from the child.');
});

test('childViews specified as instances are also destroyed.', function() {
  var v2 = SC.View.create(),
      v = SC.View.create({ childViews: [v2] });
  v.destroy();
  ok(v2.get('isDestroyed'), 'destroying a parent also destroys a child, mwaha.');
  ok(!v2.get('parentView'), 'destroying a parent removes the parentView reference from the child.');
});