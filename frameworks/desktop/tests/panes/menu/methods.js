// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var items = [
  { title: 'Menu Item', keyEquivalent: 'ctrl_shift_n' },
  { title: 'Checked Menu Item', isChecked: YES, keyEquivalent: 'ctrl_a' },
  { title: 'Selected Menu Item', keyEquivalent: 'backspace' },
  { isSeparator: YES },
  { title: 'Menu Item with Icon', icon: 'inbox', keyEquivalent: 'ctrl_m' },
  { title: 'Menu Item with Icon', icon: 'folder', keyEquivalent: 'ctrl_p' },
  { isSeparator: YES },
  { title: 'Selected Menu Item…', isChecked: YES, keyEquivalent: 'ctrl_shift_o' },
  { title: 'Item with Submenu', subMenu: [{ title: 'Submenu item 1' }, { title: 'Submenu item 2'}] },
  { title: 'Disabled Menu Item', isEnabled: NO }//,
  // { isSeparator: YES },
  // { groupTitle: 'Menu Label', items: [{ title: 'Nested Item' }, { title: 'Nested Item' }] }
];

var menu, anchor;

module('SC.MenuPane#popup', {
  setup: function() {
    menu = SC.MenuPane.create({
      layout: { width: 206 },
      items: items
    });
    
    anchor = SC.Pane.create({
      layout: { top: 15, left: 15, width: 100, height: 100 }
    });
  },

  teardown: function() {
    menu.destroy();
    menu = null;
  }
});

test('SC.MenuPane - popup() without anchor', function(){
  var layout;
  
  menu.popup();
  layout = menu.get('layout');
  equals(layout.centerX, 0, 'menu should be horizontally centered');
  equals(layout.centerY, 0, 'menu should be vertically centered');
  equals(layout.width, 206, 'menu should maintain the width specified');
  equals(layout.height, 178, 'menu height should resize based on item content');
  menu.remove();
});

test('SC.MenuPane - popup() with anchor', function(){
  var layout;
  
  anchor.append();
  menu.popup(anchor);
  layout = menu.get('layout');
  equals(layout.left, 16, 'menu should be aligned to the left of the anchor');
  equals(layout.top, 119, 'menu should be positioned below the anchor');
  equals(layout.width, 206, 'menu should maintain the width specified');
  equals(layout.height, 178, 'menu height should resize based on item content');
  menu.remove();
});