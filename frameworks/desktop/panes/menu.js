// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
require('panes/picker');
require('views/menu_item');

/**
  @class SC.MenuPane

  SC.MenuPane allows you to display a standard menu. Menus appear over other
  panes, and block input to other views until a selection is made or the pane
  is dismissed by clicking outside of its bounds.

  To use a menu pane, you need three simple ingredients: the pane
  itself, an array of menu items, and an existing view to which the menu
  should anchor itself.

  The items array can be provided in two forms: an array of strings or an
  array of objects.

  The preferred form is an array of objects. Out of the box, the menu pane
  has some default keys it uses to get information from the objects. For
  example, to find out the title of the menu item, the menu pane will ask your
  object for its @title@ property. If you need to change this key, you can set
  the @itemTitleKey@ property on the pane itself.

   If all you require is a simple menu, you can provide an array of strings.
  These menu items will

   {{{
   var pane = SC.MenuPane.create({
    test 123
   });
   }}}

  @extends SC.PickerPane
  @since SproutCore 1.0
*/
SC.MenuPane = SC.PickerPane.extend(
/** @scope SC.MenuPane.prototype */ {

  classNames: ['sc-menu'],

  /**
    The array of items to display.  This can be a simple array of strings,
    objects or hashes.  If you pass objects or hashes, you can also set the
    various itemKey properties to tell the MenuPane how to extract the
    information it needs.

    @type String
  */
  items: [],

  /**
    Create a modal pane beneath the menu that will prevent any mouse clicks
    that fall outside the menu pane from triggering an inadvertent action.

    @type Boolean
    @isReadOnly
  */
  isModal: YES,

  /**
    The name of the property that contains the title for each item.

    @type String
    @default title
    @commonTask Menu Item Properties
  */
  itemTitleKey: 'title',

  /**
    The name of the property that determines whether the item is enabled.

    @property String
    @type isEnabled
    @commonTask Menu Item Properties
  */
  itemIsEnabledKey: 'isEnabled',

  /**
    The name of the property that contains the value for each item.

    @type String
    @default value
    @commonTask Menu Item Properties
  */
  itemValueKey: 'value',

  /**
    The name of the property that contains the icon for each item.

    @type String
    @default icon
    @commonTask Menu Item Properties
  */
  itemIconKey: 'icon',

  /**
    The name of the property that contains the height for each item.

    @readOnly
    @type String
    @default height
  */
  itemHeightKey: 'height',

  /**
    The name of the property that contains an optional submenu for each item.

    @type String
    @default subMenu
  */
  itemSubMenuKey: 'subMenu',

  /**
    The default height for each menu item, in pixels.

    You can override this on a per-item basis by setting the (by default) +height+ property on your object.

    @type Number
    @default 20
  */
  itemHeight: 20,

  /**
    The default height for separator menu items.

    @property Number
  */
  itemSeparatorHeight: 9,

  /**
    The height of the menu and ultimately the menu itself.

    @type Integer
  */
  menuHeight: null,

  /**
    If YES, titles will be localized before display.
  */
  localize: YES,

  /**
    This key defined which key represents Separator.

    @readOnly
    @type Boolean
    @default separator
  */
  itemSeparatorKey: 'separator',

  /**
    This key is need to assign an action to the menu item.

    @readOnly
    @type String
    @default action
  */
  itemActionKey: 'action',

  /**
    The key for setting a checkbox for the menu item.

    @readOnly
    @type String
    @default checkbox
  */
  itemCheckboxKey: 'checkbox',

  /**
    The key for setting a branch for the menu item.

    @readOnly
    @type String
    @default shortcut
  */
  itemShortCutKey: 'shortcut',

  /**
    The key for setting Key Equivalent for the menu item.

    @readOnly
    @type String
    @default keyEquivalent
  */
  itemKeyEquivalentKey: 'keyEquivalent',

  /**
    The key for setting Key Equivalent for the menu item.

    @readOnly
    @type String
    @default target
  */
  itemTargetKey: 'target',

  /**
    The array of keys used by SC.MenuItemView when inspecting your menu items
    for display properties.

    @private
    @property Array
  */
  menuItemKeys: 'itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemSeparatorKey itemActionKey itemCheckboxKey itemShortCutKey itemBranchKey itemHeightKey subMenuKey itemKeyEquivalentKey itemTargetKey'.w(),

  /** @private */
  preferType: SC.PICKER_MENU,

  /**
    The anchor for this menu

    @property SC.View
  */
  anchor: null,

  /**
    Example view which will be used to create the Menu Items

    @default SC.MenuItemView
    @type SC.View
  */
  exampleView: SC.MenuItemView,

  /**
    Control Size for the Menu Item
  */
  controlSize: SC.REGULAR_CONTROL_SIZE,

  /**
    Padding to add to the minHeight of the pane.
  */
  menuHeightPadding: 0,

  /**
    YES if this menu was generated by a parent SC.MenuPane.

    @type Boolean
  */
  isSubMenu: NO,

  /**
    The view that contains the MenuItemViews that are visible on screen.

    This is created and set in createChildViews.

    @property SC.View
    @private
  */
  _menuView: null,

  init: function() {
    sc_super();

    // Set the MenuPane to its own default responder, so it can
    // interpret key events.
    this.set('defaultResponder', this);
  },

  /**
    Creates the child scroll view, and sets its contentView to a new
    view.  This new view is saved and managed by the SC.MenuPane,
    and contains the visible menu items.

    @returns {SC.View} receiver
  */
  createChildViews: function() {
    var scroll, menuView, menuItemViews;

    scroll = this.createChildView(SC.MenuScrollView, {
      borderStyle: SC.BORDER_NONE
    });

    menuView = this._menuView = SC.View.create();
    menuItemViews = this.get('menuItemViews');
    menuView.set('layout', { top: 0, left: 0, height : this.get('menuHeight')});
    menuView.replaceAllChildren(menuItemViews);
    scroll.set('contentView', menuView);

    this.childViews = [scroll];

    return this;
  },

  menuItemViews: function() {
    var views = [], items = this.get('displayItems'),
        exampleView = this.get('exampleView'), item, view,
        height, heightKey, separatorKey, defaultHeight, separatorHeight,
        menuHeight, menuHeightPadding, keyArray, idx, len;

    if (!items) return null;

    heightKey = this.get('itemHeightKey');
    separatorKey = this.get('itemSeparatorKey');
    defaultHeight = this.get('itemHeight');
    separatorHeight = this.get('itemSeparatorHeight');

    menuHeightPadding = Math.floor(this.get('menuHeightPadding')/2);
    menuHeight = menuHeightPadding;

    keyArray = this.menuItemKeys.map(function(key) {
      return this.get(key);
    }, this);

    len = items.get('length');
    for (idx = 0; idx < len; idx++) {
      item = items[idx];
      height = item.get(heightKey);
      if (!height) {
        height = item.get(separatorKey) ? separatorHeight : defaultHeight;
      }
      view = this._menuView.createChildView(exampleView, {
        layout: { height: height, top: menuHeight },
        contentDisplayProperties: keyArray,
        content: item,
        parentMenu: this
      });
      views[idx] = view;
      menuHeight += height;
    }


    this.set('menuHeight', menuHeight+menuHeightPadding);
    return views;
  }.property('displayItems').cacheable(),

  /**
    Makes the menu visible and adds it to the HTML document.

    If you provide a view or element as the first parameter, the menu will
    anchor itself to the view, and intelligently reposition itself if the
    contents of the menu exceed the available space.

    @param {SC.View|Element}  anchorViewOrElement the view or element to which the menu should anchor
  */
  popup: function(anchorViewOrElement, preferMatrix) {
    var anchor = anchorViewOrElement.isView ? anchorViewOrElement.get('layer') : anchorViewOrElement;

    this.beginPropertyChanges();

    this.set('anchorElement',anchor) ;
    this.set('anchor',anchorViewOrElement);
    this.set('preferType',SC.PICKER_MENU) ;
    if (preferMatrix) this.set('preferMatrix',preferMatrix) ;

    this.endPropertyChanges();
    this.adjust('height', this.get('menuHeight'));
    this.positionPane();
    this.append();
  },

  /**
    If this is a submenu, this property corresponds to the
    top-most parent menu.  If this is the root menu, it returns
    itself.

    @type SC.MenuPane
  */
  rootMenu: function() {
    if (this.get('isSubMenu')) return this.getPath('parentMenu.rootMenu');
    return this;
  }.property().cacheable(),

  windowSizeDidChange: function(oldSize, newSize) {
    this.adjust('height', this.get('menuHeight'));
    sc_super();
  },

  /**
    Because the items property can be provided as either an array of strings,
    or an object with key-value pairs, or an exotic mish-mash of both, we need
    to normalize it for our display logic.

    If an @items@ member is an object, we can assume it is formatted properly
    and leave it as-is.

    If an @items@ member is a string, we create a hash with the title value
    set to that string, and some sensible defaults for the other properties.

    As a last resort, if an @items@ member is an array, we have a legacy
    handler that converts the array into a hash. This behavior is deprecated
    and is not guaranteed to be supported in the future.

    A side effect of running this computed property is that the menuHeight
    property is updated.

    @property Object
  */
  displayItems: function() {
    var items = this.get('items'), localize = this.get('localize'),
        itemHeight = this.get('itemHeight'), len,
        ret = [], idx, item, itemType;

    if (!items) return null;

    len = items.get('length');

    // Loop through the items property and transmute as needed, then
    // copy the new objects into the ret array.
    for (idx = 0; idx < len; idx++) {
      item = items.objectAt(idx) ;

      // fast track out if we can't do anything with this item
      if (!item) continue;

      itemType = SC.typeOf(item);
      if (itemType === SC.T_STRING) {
        item = SC.Object.create({ title: item.humanize().titleize(),
                                  value: item,
                                  isEnabled: YES
                               });
      } else if (itemType === SC.T_HASH) {
        item = SC.Object.create(item);
      } else if (itemType === SC.T_ARRAY) {
          item = this.convertArrayMenuItemToObject(item);
      }

      ret.push(item);
    }

    return ret;
  }.property('items').cacheable(),

  displayItemsDidChange: function() {
    var views = this.get('menuItemViews');
    this._menuView.replaceAllChildren(views);
    this._menuView.adjust('height', this.get('menuHeight'));
  }.observes('displayItems'),

  /**
    Takes an array of values and places them in a hash that can be used
    to render a menu item.

    The mapping goes a little something like this:
    0: title
    1: value
    2: isEnabled
    3: icon
    4: isSeparator
    5: action
    6: isCheckbox
    7: isShortCut
    8: isBranch
    9: itemHeight
    10: subMenu
    11: keyEquivalent
    12: target
  */
  convertArrayMenuItemToObject: function(item) {
    SC.Logger.warn('Support for Array-based menu items has been deprecated.  Please update your menus to use a hash.');

    var keys, fetchKeys = SC._menu_fetchKeys,
        fetchItem = SC._menu_fetchItem, cur, ret = SC.Object.create(), idx, loc;

    // Gets an array of all of the value keys
    keys = this.menuItemKeys.map(fetchKeys, this);

    // title
    ret[keys[0]] = item[0];
    ret[keys[1]] = item[1];
    ret[keys[2]] = item[2];
    ret[keys[3]] = item[3];
    ret[keys[4]] = item[4];
    ret[keys[5]] = item[5];
    ret[keys[6]] = item[6];
    ret[keys[7]] = item[7];
    ret[keys[8]] = item[8];
    ret[keys[9]] = item[9];
    ret[keys[10]] = item[10];
    ret[keys[11]] = item[11];
    ret[keys[12]] = item[12];

    return ret;
  },

  // ..........................................................
  // RENDERING/DISPLAY SUPPORT
  //
  displayProperties: ['displayItems', 'value', 'controlSize'],

  mouseEntered: function() {
    this.becomeKeyPane();
    this.set('mouseHasEntered', YES);
  },

  mouseExited: function() {
    this.set('currentMenuItem', null);
    this.set('mouseHasEntered', NO);
  },

  currentMenuItem: function(key, value) {
    if (value !== undefined) {
      if (this._currentMenuItem !== null) {
        this.set('previousMenuItem', this._currentMenuItem);
      }
      this._currentMenuItem = value;
      return value;
    }

    return this._currentMenuItem;
  }.property().cacheable(),

  currentMenuItemDidChange: function() {

    var currentMenuItem = this.get('currentMenuItem'),
        previousMenuItem = this.get('previousMenuItem');

    if (previousMenuItem) {
      if (previousMenuItem.get('hasSubMenu') && currentMenuItem === null) {

      } else {
        previousMenuItem.$().removeClass('focus');
        this.closeOpenMenusFor(previousMenuItem);
      }
    }

    if (currentMenuItem && currentMenuItem.get('isEnabled') && !currentMenuItem.get('isSeparator')) {
     currentMenuItem.$().addClass('focus');
    }
  }.observes('currentMenuItem'),

  closeOpenMenusFor: function(menuItem) {
    if (!menuItem) return;

    var menu = menuItem.get('parentMenu');

    // Close any open menus if a root menu changes
    while (menu && menuItem) {
      menu = menuItem.get('subMenu');
      if (menu) {
        menu.remove();
        menuItem = menu.get('previousMenuItem');
      }
    }
  },

  closeOpenMenus: function() {
    this.closeOpenMenusFor(this.get('previousMenuItem'));
  },

  remove: function() {
    this.set('currentMenuItem', null);
    this.closeOpenMenus();
    sc_super();
  },

  /**
    This function returns whether the anchor is of type of MenuItemView

    @returns Boolean
  */
  isAnchorMenuItemType: function() {
    var anchor = this.get('anchor') ;
    return (anchor && anchor.kindOf && anchor.kindOf(SC.MenuItemView)) ;
  },

  //..........................................................
  // mouseEvents and keyBoard Events handling
  //..........................................................

  /**
    Perform actions equivalent for the keyBoard Shortcuts

    @param {String} keystring
    @param {SC.Event} evt
    @returns {Boolean}  YES if handled, NO otherwise
  */
  // performKeyEquivalent: function(keyString,evt) {
  //   var items, len, menuItems, item, keyEquivalent,
  //       action, isEnabled, target, idx;
  //   if(!this.get('isEnabled')) return NO ;
  //   this.displayItems() ;
  //
  //   // Make sure we redraw the menu items if they've changed
  //   SC.RunLoop.begin().end();
  //
  //   items = this.get('displayItemsArray') ;
  //   if (!items) return NO;
  //
  //   // handling esc key
  //   if (keyString === 'escape') {
  //     this.remove() ;
  //     var pane = this.getPath('anchor.pane') ;
  //     if (pane) pane.becomeKeyPane() ;
  //   }
  //
  //   len = items.length ;
  //   for(idx=0; idx<len; ++idx) {
  //     item          = items[idx] ;
  //     keyEquivalent = item.get('keyEquivalent') ;
  //     action        = item.get('action') ;
  //     isEnabled     = item.get('isEnabled') ;
  //     target        = item.get('target') || this ;
  //     if(keyEquivalent == keyString && isEnabled) {
  //       var retVal = SC.RootResponder.responder.sendAction(action,target);
  //       this.remove();
  //       return retVal;
  //     }
  //   }
  //   return NO ;
  // },

  //Mouse and Key Events

  /** @private */
  mouseDown: function(evt) {
    return YES ;
  },

  /**
    @private

    Get the anchor and send the event to the anchor in case the
    current Menu is a subMenu
  */
  mouseUp: function(evt) {
    this.remove() ;
    var anchor = this.get('anchor') ;
    if(this.isAnchorMenuItemType()) this.sendEvent('mouseUp', evt, anchor) ;
    return YES ;
  },

  /**
    @private - click away picker.

    Override to pass the event to the parent Menu
    in case the current Menu is a subMenu

    @returns Boolean
  */
  modalPaneDidClick: function(evt) {
    this.closeOpenMenusFor(this.get('previousMenuItem'));
    this.remove();
  }
});

SC._menu_fetchKeys = function(k) {
  return this.get(k) ;
};
SC._menu_fetchItem = function(k) {
  if (!k) return null ;
  return this.get ? this.get(k) : this[k] ;
};
