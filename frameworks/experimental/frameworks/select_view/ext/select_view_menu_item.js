// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Extends the default itemView to add automatic computation of isChecked for the
  selected item in a selectView.
*/
SC.SelectViewMenuItemView = SC.MenuItemView.extend({
  isChecked: function() {
    // _lastIsChecked is used by the SelectViewMenu mixin above to determine whether
    // the isChecked property needs to be invalidated.
    this._lastIsChecked = this.getContentProperty('itemValueKey') === this.getPath('parentMenu.rootMenu.value');
    return this._lastIsChecked;
  }.property(),

  displayProperties: ['isChecked']
});

