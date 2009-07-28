// ==========================================================================
// Project: SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
// portions copyright @2009 Apple Inc.
// License: Licened under MIT license (see license.js)
// ==========================================================================
/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
(function() {
  var method = function() { console.log("done"); };
var pane = SC.ControlTestPane.design({ width:200,height: 32 })
  .add("full", SC.MenuItemView.design({ 
    content: SC.Object.create({ 
      icon: "sc-icon-folder-16",
      title1: "List Item 1",
      checkbox: YES,
      shortcut: "Text",
      keyEquivalent: "alt_shift_z"
   }),
  isAnOption: YES,
  contentValueKey: "title1",
  contentIconKey: "icon",
  shortCutKey: "shortcut",
  contentCheckboxKey: "checkbox",
  keyEquivalent: "shift_>",
  action: method,
  isEnabled: NO
    // contentIsBranchKey: 'branch'
  }))
  
  .add("disabled menu item with no content", SC.MenuItemView.design({ 
    content: SC.Object.create(),
    isSeparator: YES,
    isEnabled: NO
  }));
 
pane.show();

module("Menu Item View");
test("Changing the properties", function() {
  pane.view('full').set('isEnabledKey', YES);
});
})();