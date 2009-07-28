// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";

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
          value: "Item1 Item3".w(),
          allowsEmptySelection: NO,
          layout: { height: 25 } 
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
    var items=view.displayItems();
    equals(items[0][0], "Item1", 'Computed properties should match');
    equals(items[0][1], "Item1", 'Computed properties should match');
    equals(items[0][2], true, 'Computed properties should match');
    equals(items[0][3], iconURL, 'Computed properties should match');
    equals(items[0][4], null, 'Computed properties should match');
    equals(items[0][5], null, 'Computed properties should match');
    equals(items[0][6], 0, 'Computed properties should match');
    var elem = view.get('layer').childNodes[0];

    SC.Event.trigger(elem, 'mousedown');
    equals(view._isMouseDown, YES, 'mousedown');
    equals(view.get('activeIndex'), 0, '');
    
 });



 test("Check that mouse actions work", function() {
   view.triggerItemAtIndex(1);
   SC.RunLoop.begin();
   view.set('isEnabled', YES);
   SC.RunLoop.end();
   var elem = view.get('layer').childNodes[0];

   SC.Event.trigger(elem, 'mousedown');
   equals(view._isMouseDown, YES, 'Mouse down flag on mousedown should be ');
   equals(view.get('activeIndex'), 0, 'The active item is the first segment.');
   
   var elem = view.get('layer').childNodes[1];
   SC.Event.trigger(elem, 'mouseup');
   equals(view._isMouseDown, NO, 'Mouse down flag on mouseup should be ');
   equals(view.get('activeIndex'), -1, 'Ther shouldnt be any active item');
   
   var elem = view.get('layer').childNodes[2];
   SC.Event.trigger(elem, 'mousedown');
    
   SC.Event.trigger(elem, 'mousemoved');
   equals(view._isMouseDown, YES, 'Mouse down flag on mousemoved should be ');
   equals(view.get('activeIndex'), 2, 'The active item is the third segment.');
   
   SC.Event.trigger(elem, 'mouseover');
   equals(view._isMouseDown, YES, 'Mouse down flag on mouseover should be ');
   equals(view.get('activeIndex'), 2, 'The active item is the third segment.');
   
  });


