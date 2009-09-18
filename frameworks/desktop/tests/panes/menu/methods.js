// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var menu;
var menuItemTarget;
var menuItemTargetName = "The Target";
var menuItemCheckboxKey = "isCheckbox";

module('SC.MenuPane#MenuItemTargetIsSet', {
  setup: function() {
    menuItemTarget = SC.Object.create({
      myName: menuItemTargetName
    });
    
    menu = SC.MenuPane.create({
      layout: { width: 80, height: 0 },
      itemTargetKey: 'myTarget',
      itemTitleKey: 'myTitle',
      itemCheckboxKey: menuItemCheckboxKey,
      items: [
        { myTitle: "Item1", myTarget: menuItemTarget }
      ],
      contentView: SC.View.extend({})
    });
  },
  
  teardown: function() {
    menuItemTarget.destroy();
    menuItemTarget = null;
    menu.destroy();
    menu = null;
  }
});

test("Menu sets item target.", function() {
  menu.get('displayItems');
  menu.append(); // force a rendering of the menu item child views
  var target = menu.menuItemViews[0].get('target'); // see if the target propagated through
  menu.remove(); // remove the menu
  var success = (target && (target.myName === menuItemTargetName)); // check to see if it's the right target
  ok(success, "Menu item should have the target we specified.");
});

test("Menu sets MenuItem.contentCheckboxKey.", function() {
  menu.get('displayItems');
  menu.append();
  var key = menu.menuItemViews[0].get('contentCheckboxKey');
  menu.remove();
  var success = (key && (key === menuItemCheckboxKey));
  ok(success, "MenuItem.contentCheckboxKey should equal MenuPane.itemCheckboxKey after being rendered.");
});
