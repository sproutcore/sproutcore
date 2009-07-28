// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

// ..........................................................
// contentPropertyDidChange()
// 
var view, content ;
module('SC.Control#contentPropertyDidChange', {
  setup: function() {
    content = SC.Object.create();
    view = SC.View.create(SC.Control);
  },
  
  teardown: function() {
    content = null;
    view.destroy();
  }
});

test("invoked with key = * whenever content changes", function() {
  view.contentPropertyDidChange = function(target, key) {
    ok(target === content, 'should pass content object as target target=%@'.fmt(target));
    equals(key, '*', 'should pass * as key');    
  };
  view.set('content', content);
});

test("invoked with key = foo whenever a propery on content is changed", function() {
  var isTesting = NO, curKey ;
  view.contentPropertyDidChange = function(target, key) {
    if (!isTesting) return ; //wait until testing should begin...
    ok(target === content, 'should pass content object as target');
    equals(key, curKey, 'should pass * as key');    
  };
  view.set('content', content);
  
  isTesting = YES ;
  
  curKey= 'foo';
  content.set('foo', 'foo');
  
  curKey = 'bar';
  content.set('bar', 'bar');
});

test("should no longer be invoked when a key is changed on a former content object", function() {
  var isTesting = NO;
  view.contentPropertyDidChange = function(target, key) {
    if (!isTesting) return ; //wait until testing should begin...
    ok(NO, 'should not invoke contentPropertyDidChange after content is removed');
  };
  
  view.set('content', content);
  content.set('foo', 'foo');
  view.set('content', null);
  
  isTesting= YES ;
  content.set('bar', 'bar');
});

test("should fire even on a content object set when the object is created", function() {
  var callCount = 0;
  var view = SC.View.create(SC.Control, {
    contentPropertyDidChange: function() { callCount++; },
    content: content
  });
  
  equals(callCount, 1, 'should call contentPropertyDidChange on init to do initial setup');
  
  content.set('foo', 'foo');
  equals(callCount, 2, 'should call contentPropertyDidChange when changing content.foo');
});

// ..........................................................
// updatePropertyFromContent()
// 
module("SC.Control#updatePropertyFromContent()", {
  setup: function() {
    content = SC.Object.create({ foo: "foo", bar: "bar" });
    view = SC.View.create(SC.Control, { content: content });
  },
  teardown: function() {
    content = null ;
    view.destroy();
  }
}) ;

test("copies value of content[key] to this[prop] if changed key.  Gets key from contentKey property", function() {
  view.contentValueKey = 'foo'; // set key mapping.
  view.updatePropertyFromContent('value', 'foo', 'contentValueKey');
  equals(view.get('value'), 'foo', 'should copy foo from content.foo to value');
});

test("does nothing of changed key does not match contentKey value" ,function() {
  view.value = "foo";
  view.contentValueKey = "foo" ;
  view.updatePropertyFromContent('value', 'bar', 'contentValueKey');
  equals(view.get('value'), 'foo', 'should not have changed "value"');
});

test("if contentKey is not passed, assume contentPROPKey", function() {
  view.contentValueKey = "foo";
  view.updatePropertyFromContent("value", "foo");
  equals(view.get('value'), 'foo', 'should have looked at foo since contentValueKey is set to foo');
});

test("if contentFooKey is not set on receiver, ask displayDelegate", function() {
  view.displayDelegate = SC.Object.create({ contentValueKey: "foo" });
  view.updatePropertyFromContent("value", "foo", "contentValueKey");
  equals(view.get('value'), 'foo', 'should have looked at foo since contentValueKey is set to foo');
});

test("should be able to get value from a content object that is not SC.Object", function() {
  view.content = { foo: "foo" };
  view.contentValueKey = "foo";
  view.updatePropertyFromContent("value", "foo", "contentValueKey");
  equals(view.get('value'), 'foo', 'should have looked at foo since contentValueKey is set to foo');
});

// ..........................................................
// updateContentWithValueObserver()
// 
module("SC.Control#updatePropertyFromContent()", {
  setup: function() {
    content = SC.Object.create({ foo: "foo", bar: "bar" });
    view = SC.View.create(SC.Control, { 
      value: "bar",
      content: content,
      contentValueKey: "bar",
      displayDelegate: SC.Object.create({ contentValueKey: "foo" }) 
    });
  },
  teardown: function() {
    content = null ;
    view.destroy();
  }
}) ;

test("if contentValueKey is set, changing value will be pushed to content", function() {
  view.set('value', 'baz');
  equals(content.get('bar'), 'baz', 'should copy from view.value to content');
});

test("does nothing if content is null", function() {
  view.set('content', null);
  view.set('value', 'baz'); // should be no errors here...
  equals(content.get('bar'), 'bar', 'should not change');
  equals(content.get('foo'), 'foo', 'should not change');
});

test("if contentValueKey is undefined, asks display delegate instead", function() {
  delete view.contentValueKey ;
  view.set('value', 'baz');
  equals(content.get('foo'), 'baz', 'should copy from view.value to content');
});

test("if contentValueKey is not set & displayDelegate not set, does nothing", function() {
  delete view.contentValueKey;
  delete view.displayDelegate;
  view.set('value', 'baz');
  equals(content.get('bar'), 'bar', 'should not change');
  equals(content.get('foo'), 'foo', 'should not change');
});
