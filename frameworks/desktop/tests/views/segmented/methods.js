// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
var pane, view;

module("SC.SegmentedView", {
  setup: function() {
    SC.RunLoop.begin();
    pane = SC.MainPane.create({
      childViews: [
        SC.SegmentedView.extend({
          items: [
          { value: "Item1", icon: iconURL },
          { value: "Item2", icon: iconURL },
          { value: "Item3", icon: iconURL }],
          itemTitleKey: 'value',
          itemValueKey: 'value',
          itemIconKey: 'icon',
          itemActionKey: 'action',
          value: "Item1 Item3".w(),
          allowsEmptySelection: NO,
          layout: { height: 25, width: 400 }
        })]
    });
    pane.append(); // make sure there is a layer...
    SC.RunLoop.end();

    view = pane.childViews[0];
  },

  teardown: function() {
    pane.remove();
    pane = view = null ;
  }
});

test("Check that properties are mapped correctly", function() {
  view.triggerItemAtIndex(1);

  SC.RunLoop.begin();
  view.set('isEnabled', YES);
  SC.RunLoop.end();

  equals(view.get('value'), "Item2", "the second item should be selected.");

  var childViews = view.get('childViews');
  equals(childViews[0].title, "Item1", 'Computed properties should match');
  equals(childViews[0].value, "Item1", 'Computed properties should match');
  equals(childViews[0].isEnabled, true, 'Computed properties should match');
  equals(childViews[0].icon, iconURL, 'Computed properties should match');
  equals(childViews[0].width, null, 'Computed properties should match');
  equals(childViews[0].toolTip, null, 'Computed properties should match');
  equals(childViews[0].index, 0, 'Computed properties should match');
});


 test("Check that mouse actions work", function() {
   view.triggerItemAtIndex(1);
   SC.RunLoop.begin();
   view.set('isEnabled', YES);
   SC.RunLoop.end();
   
   // Test Mouse Down
   // it now gets the item by the position, so we have to pass a position
   var firstItemEvent = SC.Event.simulateEvent(elem, 'mousedown', { clientX: rect1.left + 1, clientY: rect1.top + 1 });
   view.mouseDown(firstItemEvent);
   
   equals(view._isMouseDown, YES, 'Mouse down flag on mousedown should be ');
   equals(view.get('activeIndex'), 0, 'The active item is the first segment.');
   
   // Test Mouse Up
   elem = view.get('layer').childNodes[1];
      
   view.mouseUp(firstItemEvent);
   equals(view._isMouseDown, NO, 'Mouse down flag on mouseup should be ');
   equals(view.get('activeIndex'), -1, 'There shouldnt be any active item');
   
   // Test third item
   elem = view.get('layer').childNodes[2];
   var thirdItemEvent = SC.Event.simulateEvent(elem, 'mousedown', { clientX: rect3.left + 1, client: rect3.top + 1 });
   
   // mouse down and move
   view.mouseDown(thirdItemEvent);
   view.mouseMoved(thirdItemEvent);
   equals(view._isMouseDown, YES, 'Mouse down flag on mousemoved should be ');
   equals(view.get('activeIndex'), 2, 'The active item is the third segment.');
   
   // try moving mouse while mouse down
   var secondItemEvent = SC.Event.simulateEvent(elem, 'mousedown', { clientX: rect2.left + 1, clientY: rect2.top + 1 });
   view.mouseMoved(secondItemEvent);
   equals(view._isMouseDown, YES, 'Mouse down flag on mousemoved should be ');
   equals(view.get('activeIndex'), 1, 'The active item should have changed to the second segment.');
   
   // and check that mouse out cancels.
   var noItemEvent = SC.Event.simulateEvent(elem, 'mousedown', { clientX: rect1.left - 5, clientY: rect1.top - 5 });

   view.mouseExited(noItemEvent);
   equals(view._isMouseDown, YES, 'Mouse down flag on mouseout should still be ');
   equals(view.get('activeIndex'), -1, 'The active item is no longer specified.');
   
  });
