// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================


module("SC.ButtonView#actions", {
	setup: function() {
	  b = SC.ButtonView.create();
	}
});

test("Emulate mouse click to verify if the button activates", function() {
  b.triggerAction();
  equals(b.get('isActive'), YES, "the should be active for 200ms");
  
});


test("Test different moused states", function() {
  b.set('isEnabled', YES);
  b.mouseDown();
  equals(b.get('isActive'), YES, "the button should be active after a mouseDown event");
  b.mouseExited();
  equals(b.get('isActive'), NO, "the button should be active after a mouseDown event");
  b.mouseEntered();
  equals(b.get('isActive'), b._isMouseDown, "the button should be active after a mouseDown event");  
//  b.mouseUp();
//  equals(b.get('isActive'), NO, "the button should be inactive after a mouseUP event");

  b.set('buttonBehavior', SC.TOGGLE_BEHAVIOR);
  b._action();
  equals(b.get('value'), b.get('toggleOnValue'), "the value should be the same as the toggle value");
 
  b.set('buttonBehavior', SC.TOGGLE_ON_BEHAVIOR);
  b._action();
  equals(b.get('value'), b.get('toggleOnValue'), "the value should be the same as the toggle value");
  
  b.set('buttonBehavior', SC.TOGGLE_OFF_BEHAVIOR);
  b._action();
  equals(b.get('value'), b.get('toggleOffValue'), "the value should be the same as the toggle value");
});


