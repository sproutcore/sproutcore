// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright ©2010 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var items = [
  { title: 'Menu Item', keyEquivalent: 'ctrl_shift_n' },
  { title: 'Checked Menu Item', isChecked: YES, keyEquivalent: 'ctrl_a' },
  { title: 'Selected Menu Item', keyEquivalent: 'backspace' },
  { separator: YES },
  { title: 'Menu Item with Icon', icon: 'inbox', keyEquivalent: 'ctrl_m' },
  { title: 'Menu Item with Icon', icon: 'folder', keyEquivalent: 'ctrl_p' },
  { separator: YES },
  { title: 'Selected Menu Item…', isChecked: YES, keyEquivalent: 'ctrl_shift_o' },
  { title: 'Item with Submenu', subMenu: [{ title: 'Submenu item 1' }, { title: 'Submenu item 2'}] },
  { title: 'Disabled Menu Item', isEnabled: NO }//,
  // { isSeparator: YES },
  // { groupTitle: 'Menu Label', items: [{ title: 'Nested Item' }, { title: 'Nested Item' }] }
];

var menu;

module('SC.MenuPane UI', {
  setup: function() {
    menu = SC.MenuPane.create({
      layout: { width: 206 },

      selectedItemChanged: function() {
        this._selectedItemCount = (this._selectedItemCount||0)+1;
      }.observes('selectedItem'),

      countAction: function() {
        this._actionCount = (this._actionCount||0)+1;
      }
    });

    items[0].target = menu;
    items[0].action = 'countAction';

    items[1].action = function() {
      menu._functionActionCount = (menu._functionActionCount||0)+1;
    };

    menu.set('items', items);
  },

  teardown: function() {
    menu.destroy();
    menu = null;
  }
});

/*
  Simulates clicking on the specified index.  If you pass verify as YES or NO
  also verifies that the item view is subsequently selected or not.

  @param {SC.View} view the view
  @param {Boolean} shiftKey simulate shift key pressed
  @param {Boolean} ctrlKey simulate ctrlKey pressed
  @returns {void}
*/
function clickOn(view, shiftKey, ctrlKey) {
  var layer    = view.get('layer'),
      opts     = { shiftKey: shiftKey, ctrlKey: ctrlKey },
      sel, ev, modifiers;

  ok(layer, 'precond - view %@ should have layer'.fmt(view.toString()));

  ev = SC.Event.simulateEvent(layer, 'mousedown', opts);
  SC.Event.trigger(layer, 'mousedown', [ev]);

  ev = SC.Event.simulateEvent(layer, 'mouseup', opts);
  SC.Event.trigger(layer, 'mouseup', [ev]);
  SC.RunLoop.begin();
  SC.RunLoop.end();
  layer = null ;
}

test('Basic UI', function(){
  menu.popup();
  ok(menu.$().hasClass('sc-menu'), 'pane should have "sc-menu" class');
  ok(menu.$().hasClass('sc-regular-size'), 'pane should have default control size class');
  ok(!menu.get('isSubMenu'), 'isSubMenu should be NO on menus that are not submenus');
  var menuItem = menu.get('menuItemViews')[0], selectedItem;
  menuItem.mouseEntered();
  clickOn(menuItem, NO, NO);
  stop();

  setTimeout(function() {
    selectedItem = menu.get('selectedItem');
    ok(selectedItem, 'menu should have selectedItem property set after clicking on menu item');
    equals(selectedItem.title, menuItem.get('content').title, 'selectedItem should be set to the content item that was clicked');
    equals(1, menu._selectedItemCount, 'selectedItem should only change once when a menu item is clicked');
    equals(1, menu._actionCount, 'action is fired once when menu item is clicked');
    menu.remove();
    ok(!menu.get('isVisibleInWindow'), 'menu should not be visible after being removed');
    equals(menu.get('currentMenuItem'), null, 'currentMenuItem should be null after being removed');
    start();
  }, 250);
});

test('Control size', function() {
  var smallPane, largePane, views, items = [
    { title: 'Can I get get get' },
    { title: 'To know know know know', separator: YES },
    { title: 'Ya better better baby' }
  ];

  smallPane = SC.MenuPane.create({
    controlSize: SC.SMALL_CONTROL_SIZE,
    items: items
  });
  smallPane.popup();
  views = smallPane.get('menuItemViews');
  equals(views[0].get('frame').height, SC.MenuPane.SMALL_MENU_ITEM_HEIGHT, 'should change itemHeight');
  equals(views[1].get('frame').height, SC.MenuPane.SMALL_MENU_ITEM_SEPARATOR_HEIGHT, 'should change itemSeparatorHeight');
  equals(views[0].get('frame').y, SC.MenuPane.SMALL_MENU_HEIGHT_PADDING/2, 'should change menuHeightPadding');
  smallPane.remove();

  largePane = SC.MenuPane.create({
    controlSize: SC.LARGE_CONTROL_SIZE,
    items: items
  });
  largePane.popup();
  views = largePane.get('menuItemViews');
  equals(views[0].get('frame').height, SC.MenuPane.LARGE_MENU_ITEM_HEIGHT, 'should change itemHeight');
  equals(views[1].get('frame').height, SC.MenuPane.LARGE_MENU_ITEM_SEPARATOR_HEIGHT, 'should change itemSeparatorHeight');
  equals(views[0].get('frame').y, SC.MenuPane.LARGE_MENU_HEIGHT_PADDING/2, 'should change menuHeightPadding');
  largePane.remove();
});

test('Legacy Function Support', function(){
  menu.popup();
  var menuItem = menu.get('menuItemViews')[1], selectedItem;
  menuItem.mouseEntered();
  clickOn(menuItem, NO, NO);
  stop();

  setTimeout(function() {
    selectedItem = menu.get('selectedItem');
    equals(1, menu._functionActionCount, 'Function should be called if it is set as the action and the menu item is clicked');
    menu.remove();
    start();
  }, 250);
});

test('Custom MenuItemView Class', function() {
  equals(menu.get('exampleView'), SC.MenuItemView, 'SC.MenuPane should generate SC.MenuItemViews by default');
  var menu2 = SC.MenuPane.create({
    exampleView: SC.MenuItemView.extend({
      classNames: 'custom-menu-item'.w()
    }),

    items: items
  });
  menu2.popup();
  ok(menu2.$('.custom-menu-item').length > 0, 'SC.MenuPane should generate instances of custom classes if exampleView is changed');
  menu2.remove();
});

test('Basic Submenus', function() {
  var smallMenu = SC.MenuPane.create({
    controlSize: SC.SMALL_CONTROL_SIZE,
    items: items
  });
  var menuItem = smallMenu.get('menuItemViews')[8], subMenu;
  smallMenu.popup();
  menuItem.mouseEntered();
  SC.RunLoop.begin().end();
  ok(menuItem.get('hasSubMenu'), 'precond - menu item has a submenu');
  subMenu = menuItem.get('subMenu');
  ok(!subMenu.get('isVisibleInWindow'), 'submenus should not open immediately');
  stop();
  setTimeout(function() {
    ok(subMenu.get('isVisibleInWindow'), 'submenu should open after 100ms delay');
    ok(subMenu.get('isSubMenu'), 'isSubMenu should be YES on submenus');
    ok(subMenu.get('controlSize'), SC.SMALL_CONTROL_SIZE, "submenu should inherit parent's controlSize");
    smallMenu.remove();
    ok(!subMenu.get('isVisibleInWindow'), 'submenus should close if their parent menu is closed');
    start();
  }, 150);
});

test('Menu Item Localization', function() {
  ok(menu.get('localize'), 'menu panes should be localized by default');
  var locMenu, items;

  SC.stringsFor('en', { 'Localized.Text': 'LOCALIZED TEXT' } );
  items = [ 'Localized.Text' ];

  locMenu = SC.MenuPane.create({
    layout: { width: 200 },
    items: items,
    localize: NO
  });
  locMenu.popup();
  equals('Localized.Text', locMenu.$('.sc-menu-item .value').text(), 'Menu item titles should not be localized if localize is NO');
  locMenu.remove();

  locMenu = SC.MenuPane.create({
    items: items,
    localize: YES
  });
  locMenu.popup();
  equals('LOCALIZED TEXT', locMenu.$('.sc-menu-item .value').text(), 'Menu item titles should be localized if localize is YES');
  locMenu.remove();
});

test('Automatic Closing', function() {
  menu.popup();
  ok(menu.get('isVisibleInWindow'), 'precond - window should be visible');
  menu.windowSizeDidChange();
  ok(!menu.get('isVisibleInWindow'), 'menu should close if window resizes');

  menu.popup();
  clickOn(menu);
  ok(!menu.get('isVisibleInWindow'), 'menu should close if anywhere other than a menu item is clicked');
});

