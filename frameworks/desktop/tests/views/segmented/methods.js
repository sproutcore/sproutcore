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
