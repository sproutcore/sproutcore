// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/* globals module, test, equals, ok */
var pane;

module("SC", {
  setup: function () {
    SC.run(function () {
      pane = SC.Pane.create();
      pane.append();
    });
  },

  teardown: function () {
    SC.run(function () {
      pane.destroy();
      pane = null;
    });
  }
});

test("SC.viewFor() Argument validation", function() {
  try {
    SC.viewFor();
    ok(false, "Throws an exception when the argument is not given.");
  } catch (ex) {
    ok(true, "Throws an exception when the argument is not given.");
  }

  try {
    SC.viewFor("blarg");
    ok(false, "Throws an exception when the argument is not an Element.");
  } catch (ex) {
    ok(true, "Throws an exception when the argument is not an Element.");
  }
});

test("SC.viewFor() Usage", function() {

  SC.run(function () {
    var view = SC.View.create({
        render: function (context) {
          context = context.begin().setAttr('id', 'inner-el-1');

          context.push('Some text ');
          context.begin('span').setAttr('id', 'inner-el-2').push('and').end();
          context.push(' some text');

          context = context.end();
        }
      }),
      layer;

    pane.appendChild(view);

    layer = view.get('layer');
    equals(SC.viewFor(layer), view, "The layer's view should be found");
    equals(SC.viewFor(layer.childNodes[0]), view, "The layer's view should be found off of an inner element");
    equals(SC.viewFor(layer.childNodes[0].childNodes[1]), view, "The layer's view should be found off of a deeper inner element with non-element parent node");
    pane.remove();
    equals(SC.viewFor(layer), view, "The layer's view should still be found even though the layer is in a fragment now");


    layer = document.createElement('div');
    layer.id = "sc-not-found";
    document.body.appendChild(layer);
    equals(SC.viewFor(layer), null, "The layer's view should not be found for random element");
    document.body.removeChild(layer);
  });

});
