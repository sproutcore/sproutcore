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
  renderDelegateName: 'selectRenderDelegate',

  /**
    The items that should populate the menu.
  */
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
   * mix in SC.SelectViewMenu, it'll get the bindings and the extended
   * MenuItemView that draws its checkbox when it is the selected item.
   *
  */
  menu: SC.MenuPane.extend(SC.SelectViewMenu),

  /**
    * The currently selected item. If no item is selected, `null`.
   */
  selectedItem: null,
  selectedItemBinding: '*menu.rootMenu.selectedItem',


  /**
    This is a property to enable/disable focus rings in buttons. 
    For SelectView, it is a default.

    @default YES
  */
  supportsFocusRing: YES,


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
    var sel = this.get('selectedItem'),
        last = this._scsv_lastSelection,
        titleKey = this.get('itemTitleKey'),
        valueKey = this.get('itemValueKey');

    if (!sel) {
      this.setIfChanged('value', null);
    } else if (sel.get) {
      this.setIfChanged('value', sel.get(valueKey));
    } else {
      this.setIfChanged('value', sel[valueKey]);
    }

    // add/remove observers for the title and value so we can invalidate
    if (last && last.addObserver && sel !== last) {
      last.removeObserver(titleKey, this, this._scsv_selectedItemPropertyDidChange);
      last.removeObserver(valueKey, this, this._scsv_selectedItemPropertyDidChange);
    }
    
    if (sel && sel.addObserver && sel !== last) {
      sel.addObserver(titleKey, this, this._scsv_selectedItemPropertyDidChange);
      sel.addObserver(valueKey, this, this._scsv_selectedItemPropertyDidChange);
    }

    this._scsv_lastSelection = sel;
  }.observes('selectedItem'),

  // called when either title or value changes on the selected item
  _scsv_selectedItemPropertyDidChange: function(item) {
    this.notifyPropertyChange('title');
    this.set('value', item.get('value'));
  },

  /**
    The title to show when no item is selected.

    @property
    @type String
    @default ""
  */
  defaultTitle: "",

  /**
    The title of the button, derived from the selected item.
  */
  title: function() {
    var sel = this.get('selectedItem');

    if (!sel) {
      return this.get('defaultTitle');
    } else if (sel.get) {
      return sel.get(this.get('itemTitleKey'));
    } else {
      return sel[this.get('itemTitleKey')];
    }
  }.property('selectedItem').cacheable(),

  /**
    * When the value changes, we need to update selectedItem.
    * @private
  */
  _scsv_valueDidChange: function() {
    var value = this.get('value');

    if (!this.get('items')) {
      return;
    }

    var items = this.get('items'), len = items.length, idx;
    for (idx = 0; idx < len; idx++) {
      if (items[idx][this.get('itemValueKey')] === value) {
        this.setIfChanged('selectedItem', items[idx]);
        return;
      }
    }

    // if we got here, this means no item is selected
    this.setIfChanged('selectedItem', null);
  }.observes('value'),

  /**
    SelectView must set the selectView property on the menu so that the menu's
    properties get bound to the SelectView's. The bindings get set up by 
    the SelectViewMenu mixin, which should be mixed in to any SelectView menu.

    In addition, the initial selected item and the initial minimum menu width are set.
    @private
  */
  createMenu: function(klass) {
    var attrs = {
      selectView: this,
      selectedItem: this.get('selectedItem'),
      minimumMenuWidth: this.get('minimumMenuWidth')
    };

    return klass.create(attrs);
  },

  /**
    The amount by which to offset the menu's left position when displaying it.
    This can be used to make sure the selected menu item is directly on top of
    the label in the SelectView.

    By default, this comes from the render delegate's menuLeftOffset property. 
    If you are writing a theme, you should set the value there.
  */
  menuLeftOffset: SC.propertyFromRenderDelegate('menuLeftOffset', 0),

  /**
    The amount by which to offset the menu's top position when displaying it.
    This is added to any amount calculated based on the 'top' of a menu item.

    This can be used to make sure the selected menu item's label is directly on
    top of the SelectView's label.

    By default, this comes from the render delegate's menuTopOffset property.
    If you are writing a theme, you should set the value there.

    @property
    @default (from render delegate)
  */
  menuTopOffset: SC.propertyFromRenderDelegate('menuTopOffset', 0),

  /**
    An amount to add to the menu's minimum width. For instance, this could be
    set to a negative value to let arrows on the side of the SelectView be visible.

    By default, this comes from the render delegate's menuMinimumWidthOffset property.
    If you are writing a theme, you should set the value there.

    @property
    @default (from render delegate)
  */
  menuMinimumWidthOffset: SC.propertyFromRenderDelegate('menuMinimumWidthOffset', 0),

  /**
    The prefer matrix for menu positioning. It is calculated so that the selected
    menu item is positioned directly over the SelectView.
  */
  menuPreferMatrix: function() {
    var menu = this.get('menu'),
        leftPosition = this.get('menuLeftOffset'),
        topPosition = this.get('menuTopOffset');

    if (!menu) {
      return [leftPosition, topPosition, 2];
    }

    var idx = this.get('_selectedItemIndex'), itemViews = menu.get('menuItemViews');
    if (idx > -1) {
      return [leftPosition, topPosition - itemViews[idx].get('layout').top, 2];
    }

    return [leftPosition, topPosition, 2];

  }.property('value', 'menu').cacheable(),

  /**
    Used to calculate things like the menu's top position.

    @private
  */
  _selectedItemIndex: function() {
    var menu = this.get('menu');
    if (!menu) {
      return -1;
    }

    // We have to find the selected item, and then get its 'top' position so we
    // can position the menu correctly.
    var itemViews = menu.get('menuItemViews'), idx, len = itemViews.length, view;
    for (idx = 0; idx < len; idx++) {
      view = itemViews[idx];

      // we have to compare via value
      var value = view.get('content').get(this.get('itemValueKey'));
      if (value === this.get('value')) {
        break;
      }
    }

    if (idx < len) {
      return idx;
    }

    return -1;
  }.property('value', 'menu').cacheable(),

  showMenu: function(orig) {
    orig();

    var menu = this.get('menu'), itemViews = menu.get('menuItemViews');
  }.enhance(),

  minimumMenuWidth: function() {
    return this.get('frame').width + this.get('menuMinimumWidthOffset');
  }.property('frame', 'menuMinimumWidthOffset').cacheable(),

  minimumMenuWidthDidChange: function() {
    if (this.get('menu') && !this.get('menu').isClass) {
      menu.set('minimumMenuWidth', this.get('minimumMenuWidth'));
    }
  },

  //
  // KEY HANDLING
  //
  /**
    @private

    Handle Key event - Down arrow key
  */
  keyDown: function(event) {
    if ( this.interpretKeyEvents(event) ) {
      return YES;
    }
    else {
      sc_super();
    }
  },

  /**
    @private

    Pressing the Up or Down arrow key should display the menu pane
  */
  interpretKeyEvents: function(event) {
    if (event) {
      if ((event.keyCode === 38 || event.keyCode === 40)) {
        this.showMenu();
        return YES;
      }
      else if (event.keyCode === 27) {
        this.resignFirstResponder() ;
        return YES;
      }
    }
    return sc_super();
  },

  /** Function overridden - tied to the isEnabled state */
  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled').cacheable()

});
