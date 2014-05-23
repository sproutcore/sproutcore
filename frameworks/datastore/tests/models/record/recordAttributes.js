// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, Foo, json, foo ;
module("SC.Record.recordAttributes", {
  setup: function() {
    SC.RunLoop.begin();
    Foo = SC.Record.extend({
      attr1: SC.Record.attr(String),
      attr2: SC.Record.attr(String),
      attr3: 'Not a record attribute'
    });
    Bar = Foo.extend({
      attr4: SC.Record.attr(String)
    });
    SC.RunLoop.end();
  }
});

test("Returns all record attributes and nothing else.", function() {
  // Class.
  var recordAttributes = Foo.recordAttributes(),
      recordAttributeNames = Foo.recordAttributeNames(),
      len = recordAttributeNames.length,
      hasOnlyAttrs = true,
      attr, i;
  
  equals(len, 2, "Correct number of attributes returned from class");
  for (i = 0; i < len; i++) {
    attr = recordAttributes[recordAttributeNames[i]];
    hasOnlyAttrs = hasOnlyAttrs && (attr && attr.isRecordAttribute);
  }
  ok(hasOnlyAttrs, "Only record attributes are returned from class.");

  // Subclass.
  recordAttributes = Bar.recordAttributes();
  recordAttributeNames = Bar.recordAttributeNames();
  len = recordAttributeNames.length;
  equals(len, 3, "Correct number of attributes returned from subclass");
  hasOnlyAttrs = true;
  for (i = 0; i < len; i++) {
    attr = recordAttributes[recordAttributeNames[i]];
    hasOnlyAttrs = hasOnlyAttrs && (attr && attr.isRecordAttribute);
  }
  ok(hasOnlyAttrs, "Only record attributes are returned from subclass.");

});

test("SC.Record.reopen updates recordAttributes.", function() {
  var superclassLen = Foo.recordAttributeNames().length,
      subclassLen = Bar.recordAttributeNames().length;

  Foo.reopen({
    attr5: SC.Record.attr(String)
  });

  // Class.
  equals(superclassLen, 2, "Class begins with the correct number of record attributes");
  equals(Foo.recordAttributeNames().length, 3, "Class has correct number of record attributes after reopen");
  // Subclass.
  equals(subclassLen, 3, "Subclass begins with the correct number of record attributes");
  equals(Bar.recordAttributeNames().length, 4, "Subclass has correct number of record attributes after superclass reopen");

});
