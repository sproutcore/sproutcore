// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, ok, equals */

var iconURL = sc_static("sproutcore-32.png");
var pane, view;

module("SC.SegmentedView", {
  setup: function() {
    SC.run(function () {
      pane = SC.MainPane.create({
        childViews: [
          SC.SegmentedView.extend({
            items: [
            { value: "Item1", icon: iconURL, width: 100 },
            { value: "Item2", icon: iconURL, width: 100 },
            { value: "Item3", icon: iconURL, width: 100 }],
            itemTitleKey: 'value',
            itemValueKey: 'value',
            itemIconKey: 'icon',
            itemWidthKey: 'width',
            itemActionKey: 'action',
            value: "Item1 Item3".w(),
            allowsEmptySelection: NO,
            layout: { height: 25, width: 400 }
          })]
      });
      pane.append(); // make sure there is a layer...
    });

    view = pane.childViews[0];
  },

  teardown: function() {
    SC.run(function () {
      pane.destroy();
      pane = view = null;
    });
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
  equals(childViews[0].width, 100, 'Computed properties should match');
  equals(childViews[0].toolTip, null, 'Computed properties should match');
  equals(childViews[0].index, 0, 'Computed properties should match');
});


test("Check the values of value", function() {
  equals(SC.isArray(view.get('value')), true, "the value should initially be an array");
  equals(view.getPath('value.length'), 2, "the value array should have 2 items in it");
  view.triggerItemAtIndex(1);
  equals(SC.isArray(view.get('value')), false, "the value should not be an array if allowsMultipleSelection is false");
  equals(view.get('value'), "Item2", "the second item should be selected.");

  view.set('allowsMultipleSelection', true);
  view.triggerItemAtIndex(2);
  equals(SC.isArray(view.get('value')), true, "the value should be an array if allowsMultipleSelection is true");
  equals(view.getPath('value.length'), 2, "the value array should have 2 items in it");
  view.triggerItemAtIndex(1);
  equals(view.getPath('value.length'), 1, "the value array should have 1 item in it");
  view.triggerItemAtIndex(2);
  equals(view.getPath('value.length'), 1, "the value array should have 1 items in it, because allowsEmptySelection is false");

  view.set('allowsEmptySelection', true);
  view.triggerItemAtIndex(2);
  equals(view.getPath('value.length'), 0, "the value array should have 0 items in it,  because allowsEmptySelection is true");

  view.set('allowsMultipleSelection', false);
  view.triggerItemAtIndex(1);
  equals(SC.isArray(view.get('value')), false, "the value should not be an array if allowsMultipleSelection is false again");
  equals(view.get('value'), "Item2", "the second item should be selected.");
  view.triggerItemAtIndex(2);
  equals(view.get('value'), "Item3", "the third item should be selected.");

  view.set('allowsEmptySelection', false);
  view.triggerItemAtIndex(2);
  equals(view.get('value'), "Item3", "the third item should still be selected, because allowsEmptySelection is false");

  view.set('allowsEmptySelection', true);
  view.triggerItemAtIndex(2);
  equals(view.get('value'), null, "the value should go to null if allowsMultipleSelection is false and allowsEmptySelection is true.");
});

// Test that if the clientX & clientY are over an element, that the proper index of that view is returned.
// Note: the test segmented view is centered by default and the items are only 50px wide.
test('displayItemIndexForEvent(evt)', function () {
  var evt = {};

  // Check not over the view.
  evt.target = view.get('layer');
  evt.clientX = 500;
  evt.clientY = 500;
  equals(view.displayItemIndexForEvent(evt), -1, "Clicking at 500,500 which is not over the view element at all should return");

  // Check not over any child elements but in view at 0,0. This tests a special accessibility fix-up where events at 0,0
  // are converted into a point over an element, because WebKit sends clientX & client& of 0,0 for accessibility events.
  evt.target = view.get('layer');
  evt.clientX = 0;
  evt.clientY = 0;
  equals(view.displayItemIndexForEvent(evt), -1, "Clicking at 0,0 which is not over any child elements, but is over the view element should return");

  // Check not over any child elements but in view at 1,1.
  evt.clientX = 1;
  evt.clientY = 1;
  equals(view.displayItemIndexForEvent(evt), -1, "Clicking at 1,1 which is not over any child elements, but is over the view element should return");

  // Check over first child element.
  evt.target = view.get('childViews')[0].get('layer');
  evt.clientX = 51;
  evt.clientY = 0;
  equals(view.displayItemIndexForEvent(evt), 0, "Clicking at 0,51 which is over the first child element should return");

  // Check over second child element.
  evt.target = view.get('childViews')[1].get('layer');
  evt.clientX = 151;
  evt.clientY = 0;
  equals(view.displayItemIndexForEvent(evt), 1, "Clicking at 0,151 which is over the second child element should return");

  // Check over third child element.
  evt.target = view.get('childViews')[2].get('layer');
  evt.clientX = 251;
  evt.clientY = 0;
  equals(view.displayItemIndexForEvent(evt), 2, "Clicking at 0,251 which is over the third child element should return");

  // Check past third child element.
  evt.target = view.get('layer');
  evt.clientX = 351;
  evt.clientY = 0;
  equals(view.displayItemIndexForEvent(evt), -1, "Clicking at 0,351 which is past the third child element should return");
});
