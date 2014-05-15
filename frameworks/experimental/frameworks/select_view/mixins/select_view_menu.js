// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
 * Binds a menu view to an owning SC.SelectView, and checks selected items.
 *
 * @mixin
 *
 */
SC.SelectViewMenu = {
  /**
    The SelectView to bind to.
    
    @property
    @type {SC.SelectView}
    @default null
  */
  selectView: null,

  //
  // CODE TO MAKE ITEMS BE CHECKED WHEN SELECTED:
  //
  
  /**
    The current value of the SelectView.
    
    @property
    @default null
  */
  value: null,
  valueBinding: '.selectView.value',


  /** 
    @private 
    Invalidates menu items' isChecked property when the selectView's value changes.
  */
  valueDidChange: function() {
    var items = this.get('menuItemViews'), idx, len = items.length, item;
    for (idx = 0; idx < len; idx++) {
      // if the item currently is checked, or if it _should_ be checked, we need to
      // invalidate the isChecked property.
      item = items[idx];
      if (item._lastIsChecked) {
        item.notifyPropertyChange('isChecked');
      }

      if (item.get('isChecked')) {
        item.notifyPropertyChange('isChecked');
      }
    }
  }.observes('value'),

  /**
    An overridden MenuItemView to create for each menu item that makes itself checked if
    it is selected.
    
    @property
    @type {SC.MenuItemView}
    @default SC.MenuItemView subclass
  */
  exampleView: SC.AutoResizingMenuItemView.extend({
    isChecked: function() {
      var selectView = this.getPath('parentMenu.selectView');

      // _lastIsChecked is used by the SelectViewMenu mixin above to determine whether
      // the isChecked property needs to be invalidated.
      this._lastIsChecked = selectView.isValueEqualTo(this.get('content'));
      
      return this._lastIsChecked;
    }.property(),

    displayProperties: ['isChecked']
  }),

  //
  // CODE TO BIND TO SELECTVIEW PROPERTIES
  //
  
  /** @private */
  _svm_bindToProperties: [
    { from: 'displayItems', to: 'items' },
    { from: '_itemTitleKey', to: 'itemTitleKey' },
    { from: '_itemIsEnabledKey', to: 'itemIsEnabledKey' },
    { from: '_itemValueKey', to: 'itemValueKey' },
    'itemIconKey', 'itemHeightKey', 'itemSubMenuKey', 'itemSeparatorKey', 
    'itemTargetKey', 'itemActionKey', 'itemCheckboxKey', 'itemShortCutKey',
    'itemKeyEquivalentKey', 'itemDisableMenuFlashKey', 'minimumMenuWidth',
    'target', 'action',
    'preferType', 'preferMatrix'
  ],

  /** @private */
  _svm_setupBindings: function() {
    var bindTo = this.get('selectView');
    if (!bindTo) {
      return;
    }

    var props = this._svm_bindToProperties, idx, len = props.length, from, to;

    for (idx = 0; idx < len; idx++) {
      from = to = props[idx];

      if (SC.typeOf(from) === SC.T_HASH) {
        from = from.from;
        to = to.to;
      }
      this[to + 'Binding'] = this.bind(to, bindTo, from);
    }

    this._svm_isBoundTo = bindTo;
  },

  /** @private */
  _svm_clearBindings: function() {
    var boundTo = this._svm_isBoundTo;
    if (!boundTo) {
      return;
    }

    var props = this._svm_bindToProperties, idx, len = props.length, key;

    for (idx = 0; idx < len; idx++) {
      key = props[idx];

      if (SC.typeOf(from) === SC.T_HASH) {
        key = key.to;
      }
      this[key + 'Binding'].disconnect();
    }
  },

  /** @private */
  _svm_selectViewDidChange: function() {
    this._svm_clearBindings();
    this._svm_setupBindings();
  }.observes('selectView'),

  /** @private */
  initMixin: function() {
    this._svm_setupBindings();
  },

  /** @private */
  destroyMixin: function() {
    this._svm_clearBindings();
  }
};


