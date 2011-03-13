// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/popup_button');
sc_require('mixins/select_view_menu');

/**
 * @extends SC.PopupButtonView
 * @version 2.0
 * @author Alex Iskander
 */
SC.SelectView = SC.PopupButtonView.extend({
  /** @scope SC.SelectView.prototype */

  //
  // Properties
  //
  theme: 'popup',

  items: null,

  /**
    Binding default for an array of items

    @property
    @default SC.Binding.multiple()
  */
  itemsBindingDefault: SC.Binding.multiple(),

  /**
    If you set this to a non-null value, then the name shown for each
    menu item will be pulled from the object using the named property.
    if this is null, the collection items themselves will be used.

    @property
    @type {String}
    @default: null
  */
  itemTitleKey: null,

  /**
    If you set this to a non-null value, then the value of this key will
    be used to sort the items.  If this is not set, then itemTitleKey will
    be used.

    @property
    @type: {String}
    @default: null
  */
  itemSortKey: null,

  /**
     Set this to a non-null value to use a key from the passed set of items
     as the value for the options popup.  If you don't set this, then the
     items themselves will be used as the value.

     @property
     @type {String}
     @default null
  */
  itemValueKey: null,

  /**
     Key used to extract icons from the items array
  */
  itemIconKey: null,
  
  /**
    Key to use to identify separators.
  */
  itemSeparatorKey: "separator",
  
  /**
    Key used to indicate if the item is to be enabled.
  */
  itemIsEnabledKey: "isEnabled",


  /**
   * The menu that will pop up when this button is clicked.
   *
   * The default menu has its properties bound to the SC.SelectView,
   * meaning that it will get all its items from the SelectView.
   * You may override them menu entirely with one of your own; if you
   * mix in SC.SelectViewMenu, it'll get the bindings as well.
   *
  */
  menu: SC.MenuPane.extend(SC.SelectViewMenu),

  /**
    * If YES, the menu width will be automatically calculated based on its items.
  */
  shouldCalculateMenuWidth: YES,

  /**
    * The currently selected item. If no item is selected, `null`.
   */
  selectedItem: null,
  selectedItemBinding: '*menu.rootMenu.selectedItem',


  /**
    * @private
  */
  init: function() {
    sc_super();
    
    // call valueDidChange to get the initial item, if any
    this._scsv_valueDidChange();
  },

  /**
    * When the selected item changes, we need to update our value.
    * @private
  */
  _scsv_selectedItemDidChange: function() {
    var sel = this.get('selectedItem');

    if (!sel) {
      this.setIfChanged('value', null);
    } else {
      this.setIfChanged('value', sel[this.get('itemValueKey')]);
    }
  }.observes('selectedItem'),

  /**
    * The title of the button, derived from the selected item.
  */
  title: function() {
    var sel = this.get('selectedItem');

    if (!sel) {
      return this.get('defaultTitle');
    } else {
      return sel[this.get('itemTitleKey')];
    }
  }.property('selectedItem'),

  /**
    * When the value changes, we need to update selectedItem.
    * @private
  */
  _scsv_valueDidChange: function() {
    var value = this.get('value');

    var items = this.get('items'), len = items.length, idx;
    for (idx = 0; idx < len; idx++) {
      if (items[idx][this.get('itemValueKey')] === value) {
        this.setIfChanged('selectedItem', items[idx]);
      }
    }
  }.observes('value'),

  /**
    * SelectView calculates its menu width (if shouldCalculateMenuWidth is set to YES),
    * and also needs to set the initial selected item. While both of these happen in
    * observers, createMenu is the natural point at which to set them initially.
    * @private
  */
  createMenu: function(menu) {
    var attrs = {
      selectedItem: this.get('selectedItem'),
      minimumMenuWidth: this.get('minimumMenuWidth'),
      preferMatrix: [15, -40, 2]
    };

    return menu.create(attrs);
  },

  minimumMenuWidth: function() {
    return this.get('frame').width;
  }.property('frame').cacheable(),

  minimumMenuWidthDidChange: function() {
    if (this.get('menu') && !this.get('menu').isClass) {
      menu.set('minimumMenuWidth', this.get('minimumMenuWidth'));
    }
  }

});
