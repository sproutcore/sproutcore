// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals Forms module test ok equals same stop start */
var pane = SC.Pane.create();
module("Forms - Form Row", {
  setup: function() {
    pane.append();
  }
});

test("Measuring label width", function() {
  SC.RunLoop.begin();
  var row = SC.FormRowView.create({
    label: "Hi"
  });
  pane.appendChild(row);
  SC.RunLoop.end();

  var size = row.get('rowLabelMeasuredSize');
  ok(size > 0, "Size should not be 0");

  SC.RunLoop.begin();
  row.set('label', "Hiyo!");
  SC.RunLoop.end();

  var newSize = row.get('rowLabelMeasuredSize');
  ok(newSize > size, "Size grew when label text did");
});
