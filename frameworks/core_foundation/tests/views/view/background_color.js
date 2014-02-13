// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

module("SC.View - backgroundColor");

test("Basic use", function() {
  var view = SC.View.create({
    backgroundColor: "red"
  });

  view.createLayer();

  equals(view.get('layer').style.backgroundColor, "red", "backgroundColor sets the CSS background-color value");

});

test("Dynamic use", function() {
  var view = SC.View.create({
    backgroundColor: 'red',
    displayProperties: ['backgroundColor']
  });
  
  view.createLayer();
  view.viewState = SC.View.ATTACHED_SHOWN; // hack to get view properties to update.

  equals(view.get('layer').style.backgroundColor, 'red', "PRELIM: backgroundColor sets the CSS background-color value");

  SC.run(function() {
    view.set('backgroundColor', 'blue');
  });

  equals(view.get('layer').style.backgroundColor, 'blue', "Changing backgroundColor when it is a display property updates the CSS background-color value");

  SC.run(function() {
    view.set('backgroundColor', null);
  });

  ok(!view.get('layer').style.backgroundColor, "Setting backgroundColor to null clears the CSS background-color value");

});
