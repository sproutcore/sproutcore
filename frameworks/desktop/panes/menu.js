// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/picker');
sc_require('views/list');
sc_require('views/menu_item');

/**
  @class

  `SC.MenuPane` allows you to display a standard menu. Menus appear over other
  panes, and block input to other views until a selection is made or the pane
  is dismissed by clicking outside of its bounds.

  You can create a menu pane and manage it yourself, or you can use the
  `SC.SelectButtonView` and `SC.PopupButtonView` controls to manage the menu for
  you.

  ## Specifying Menu Items

  The menu pane examines the `items` property to determine what menu items
  should be presented to the user.

  In its most simple form, you can provide an array of strings. Every item
  will be converted into a menu item whose title is the string.

  If you need more control over the menu items, such as specifying a keyboard
  shortcut, enabled state, custom height, or submenu, you can provide an array
  of content objects.

  Out of the box, the menu pane has some default keys it uses to get
  information from the objects. For example, to find out the title of the menu
  item, the menu pane will ask your object for its `title` property. If you
  need to change this key, you can set the `itemTitleKey` property on the pane
  itself.

      var menuItems = [
        { title: 'Menu Item', keyEquivalent: 'ctrl_shift_n' },
        { title: 'Checked Menu Item', checkbox: true, keyEquivalent: 'ctrl_a' },
        { title: 'Selected Menu Item', keyEquivalent: ['backspace', 'delete'] },
        { isSeparator: true },
        { title: 'Menu Item with Icon', icon: 'inbox', keyEquivalent: 'ctrl_m' },
        { title: 'Menu Item with Icon', icon: 'folder', keyEquivalent: 'ctrl_p' }
      ];

      var menu = SC.MenuPane.create({
        items: menuItems
      });

  ## Observing User Selections

  To determine when a user clicks on a menu item, you can observe the
  `selectedItem` property for changes.

  @extends SC.PickerPane
  @since SproutCore 1.0
*/
SC.MenuPane = SC.PickerPane.extend(SC.SelectionSupport,
/** @scope SC.MenuPane.prototype */ {

  /** @private Cache of the items array, used for clean up of observers. */
  _sc_menu_items: null,

  /**
    @type Array
    @default ['sc-menu']
    @see SC.View#classNames
  */
  classNames: ['sc-menu'],

  /**
    The WAI-ARIA role for menu pane.

    @type String
    @default 'menu'
    @constant
  */
  ariaRole: 'menu',


  // ..........................................................
  // PROPERTIES
  //

  /**
    The array of items to display. This can be a simple array of strings,
    objects or hashes. If you pass objects or hashes, you can also set the
    various itemKey properties to tell the menu how to extract the information
    it needs.

    @type Array
    @default []
  */
  items: null,

  /**
    The size of the menu. This will set a CSS style on the menu that can be
    used by the current theme to style the appearance of the control. This
    value will also determine the default `itemHeight`, `itemSeparatorHeight`,
    `menuHeightPadding`, and `submenuOffsetX` if you don't explicitly set these
    properties.

    Your theme can override the default values for each control size by specifying
    them in the `menuRenderDelegate`. For example:

        MyTheme.menuRenderDelegate = SC.BaseTheme.menuRenderDelegate.create({
          'sc-tiny-size': {
            itemHeight: 20,
            itemSeparatorHeight: 9,
            menuHeightPadding: 6,
            submenuOffsetX: 2
          }
        });

    Changing the controlSize once the menu is instantiated has no effect.

    @type String
    @default SC.REGULAR_CONTROL_SIZE
  */
  controlSize: SC.REGULAR_CONTROL_SIZE,

  /**
    The height of each menu item, in pixels.

    You can override this on a per-item basis by setting the (by default)
    `height` property on your object.

    If you don't specify a value, the item height will be inferred from
    `controlSize`.

    @type Number
    @default itemHeight from theme if present, or 20.
  */
  itemHeight: SC.propertyFromRenderDelegate('itemHeight', 20),

  /**
    The height of separator menu items.

    You can override this on a per-item basis by setting the (by default)
    `height` property on your object.

    If you don't specify a value, the height of the separator menu items will
    be inferred from `controlSize`.

    @type Number
    @default itemSeparatorHeight from theme, or 9.
  */
  itemSeparatorHeight: SC.propertyFromRenderDelegate('itemSeparatorHeight', 9),

  /**
    The height of the menu pane. This is updated every time menuItemViews
    is recalculated.

    @type Number
    @default 0
    @isReadOnly
  */
  menuHeight: 0,

  /**
    The amount of padding to add to the height of the pane.

    The first menu item is offset by half this amount, and the other half is
    added to the height of the menu, such that a space between the top and the
    bottom is created.

    If you don't specify a value, the padding will be inferred from the
    controlSize.

    @type Number
    @default menuHeightPadding from theme, or 6
  */
  menuHeightPadding: SC.propertyFromRenderDelegate('menuHeightPadding', 6),

  /**
    The amount of offset x while positioning submenu.

    If you don't specify a value, the padding will be inferred from the
    controlSize.

    @type Number
    @default submenuOffsetX from theme, or 2
  */
  submenuOffsetX: SC.propertyFromRenderDelegate('submenuOffsetX', 2),

  /**
    The last menu item to be selected by the user.

    You can place an observer on this property to be notified when the user
    makes a selection.

    @type SC.Object
    @default null
    @isReadOnly
  */
  selectedItem: null,

  /**
    The view class to use when creating new menu item views.

    The menu pane will automatically create an instance of the view class you
    set here for each item in the `items` array. You may provide your own
    subclass for this property to display the customized content.

    @type SC.View
    @default SC.MenuItemView
  */
  exampleView: SC.MenuItemView,

  /**
    The view which the menu will anchor itself.

    @type SC.View
  */
  selectView: null,

  /**
    `true` if this menu pane was generated by a parent `SC.MenuPane`.

    @type Boolean
    @default false
    @isReadOnly
  */
  isSubMenu: false,

  /**
    Set this to true if you want to allow subMenu item owner to be selected.

    @type Boolean
    @default false
  */
  actOnSubMenu: false,

  /**
    If true, title of menu items will be escaped to avoid scripting attacks.

    @type Boolean
    @default true
  */
  escapeHTML: true,

  /**
    Whether or not this menu pane should accept the “current menu pane”
    designation when visible, which is the highest-priority pane when routing
    events.  Generally you want this set to `true` so that your menu pane can
    intercept keyboard events.

    @type Boolean
    @default true
  */
  acceptsMenuPane: true,

  /**
    Disable context menu.

    @type Boolean
    @default false
  */
  isContextMenuEnabled: false,


  // ..........................................................
  // METHODS
  //

  /**
    Makes the menu visible and adds it to the HTML document.

    If you provide a view or element as the first parameter, the menu will
    anchor itself to the view, and intelligently reposition itself if the
    contents of the menu exceed the available space.

    @param {SC.View} anchorViewOrElement the view or element to which the menu
    should anchor.
    @param {Array} (preferMatrix) The prefer matrix used to position the pane.
  */
  popup: function (anchorViewOrElement, preferMatrix) {
    this.setIfChanged('anchorElement', anchorViewOrElement);
    if (preferMatrix) this.set('preferMatrix', preferMatrix);

    // Resize the pane's initial height to fit the height of the menu.
    // Note: SC.PickerPane's positioning code may adjust the height to fit within the window.
    this.adjust('height', this.get('menuHeight'));
    this.positionPane();

    // Because panes themselves do not receive key events, we need to set the
    // pane's defaultResponder to itself. This way key events can be
    // interpreted in keyUp.
    this.set('defaultResponder', this._listView);

    // Prevent body overflow (we don't want to overflow because of shadows).
    SC.bodyOverflowArbitrator.requestHidden(this, true);

    //@if(debug)
    // A debug-mode only flag to indicate that the popup method was called (see override of append in SC.PickerPane).
    this._sc_didUsePopup = true;
    //@endif

    this.append();
  },

  // ..........................................................
  // ITEM KEYS
  //

  /**
    The name of the property that contains the title for each item.

    @type String
    @default "title"
    @commonTask Menu Item Properties
  */
  itemTitleKey: 'title',

  /**
    The name of the property that contains the value for each item.

    @type String
    @default "value"
    @commonTask Menu Item Properties
  */
  itemValueKey: 'value',

  /**
    The name of the property that contains the tooltip for each item.

    @type String
    @default "toolTip"
    @commonTask Menu Item Properties
  */
  itemToolTipKey: 'toolTip',

  /**
    The name of the property that determines whether the item is enabled.

    @type String
    @default "isEnabled"
    @commonTask Menu Item Properties
  */
  itemIsEnabledKey: 'isEnabled',

  /**
    The name of the property that contains the icon for each item.

    @type String
    @default "icon"
    @commonTask Menu Item Properties
  */
  itemIconKey: 'icon',

  /**
    The name of the property that contains the icon for each item.

    @type String
    @default "count"
    @commonTask Menu Item Properties
  */
  itemUnreadCountKey: 'count',

  /**
    The name of the property that contains the height for each item.

    @readOnly
    @type String
    @default "height"
    @commonTask Menu Item Properties
  */
  itemHeightKey: 'height',

  /**
    The name of the property that contains an optional submenu for each item.

    @type String
    @default "subMenu"
    @commonTask Menu Item Properties
  */
  itemSubMenuKey: 'subMenu',

  /**
    The name of the property that determines whether the item is a menu
    separator.

    @type String
    @default "isSeparator"
    @commonTask Menu Item Properties
  */
  itemSeparatorKey: 'isSeparator',

  /**
    The name of the property that contains the target for the action that is
    triggered when the user clicks the menu item.

    Note that this property is ignored if the menu item has a submenu.

    @type String
    @default "target"
    @commonTask Menu Item Properties
  */
  itemTargetKey: 'target',

  /**
    The name of the property that contains the action that is triggered when
    the user clicks the menu item.

    Note that this property is ignored if the menu item has a submenu.

    @type String
    @default "action"
    @commonTask Menu Item Properties
  */
  itemActionKey: 'action',

  /**
    The name of the property that determines whether the menu item should
    display a checkbox.

    @type String
    @default "isChecked"
    @commonTask Menu Item Properties
  */
  itemCheckboxKey: 'isChecked',

  /**
    The name of the property that contains the shortcut to be displayed.

    The shortcut should communicate the keyboard equivalent to the user.

    @type String
    @default "shortcut"
    @commonTask Menu Item Properties
  */
  itemShortCutKey: 'shortcut',

  /**
    The name of the property that contains the key equivalent of the menu
    item.

    The action of the menu item will be fired, and the menu pane's
    `selectedItem` property set to the menu item, if the user presses this
    key combination on the keyboard.

    @type String
    @default "keyEquivalent"
    @commonTask Menu Item Properties
  */
  itemKeyEquivalentKey: 'keyEquivalent',

  /**
    The name of the property that determines whether menu flash should be
    disabled.

    When you click on a menu item, it will flash several times to indicate
    selection to the user. Some browsers block windows from opening outside of
    a mouse event, so you may wish to disable menu flashing if the action of
    the menu item should open a new window.

    @type String
    @default "disableMenuFlash"
    @commonTask Menu Item Properties
  */
  itemDisableMenuFlashKey: 'disableMenuFlash',

  /**
    The array of keys used by SC.MenuItemView when inspecting your menu items
    for display properties.

    @private
    @isReadOnly
    @type Array
  */
  itemKeys: ['itemTitleKey', 'itemValueKey', 'itemToolTipKey', 'itemIsEnabledKey', 'itemIconKey', 'itemUnreadCountKey', 'itemSeparatorKey', 'itemActionKey', 'itemCheckboxKey', 'itemShortCutKey', 'itemHeightKey', 'itemSubMenuKey', 'itemKeyEquivalentKey', 'itemDisableMenuFlashKey', 'itemTargetKey'],


  // ..........................................................
  // DEFAULT PROPERTIES
  //

  /*
    If an item doesn't specify a target, this is used. (Only used if an action is found and is not a function.)

    @type String
    @default null
  */
  target: null,

  /*
    If an item doesn't specify an action, this is used.

    @type String
    @default null
  */
  action: null,

  // ..........................................................
  // INTERNAL PROPERTIES
  //

  /** @private */
  preferType: SC.PICKER_MENU,

  // ..........................................................
  // INTERNAL METHODS
  //

  /** @private */
  init: function () {
    // Initialize the items array.
    if (!this.items) { this.items = []; }

    // An associative array of the shortcut keys. The key is the shortcut in the
    // form 'ctrl_z', and the value is the menu item of the action to trigger.
    this._keyEquivalents = {};

    // Continue initializing now that default values exist.
    sc_super();

    // Initialize the observer function once.
    this._sc_menu_itemsDidChange();
  },

  displayProperties: ['controlSize'],

  renderDelegateName: 'menuRenderDelegate',

  /**
    Creates the child scroll view, and sets its `contentView` to a new
    view.  This new view is saved and managed by the `SC.MenuPane`,
    and contains the visible menu items.

    @private
    @returns {SC.View} receiver
  */
  createChildViews: function () {
    var scroll = this.createScrollView({
      contentView: this.createListView()
    });

    this.childViews = [scroll];

    return this;
  },

  /** @private */
  createListView: function(opt) {
    var that = this,
      selectView = this.selectView || this,
      listView;

    if (!opt) opt = {};
    opt.parentMenu = this;
    opt.rowSize = this.get('itemHeight');
    opt.exampleView = this.get('exampleView');
    opt.escapeHTML = this.get('escapeHTML');

    this.itemKeys.forEach(function(itemKey) {
      opt[itemKey] = selectView[itemKey] || this[itemKey];
    }, this);

    opt.contentIndexRowSize = function(view, content, contentIndex) {
      return this.get('customRowSizeData')[contentIndex];
    };

    listView = this._listView = this.listView.create(opt);

    listView.bind('selection', this, 'selection');

    return listView;
  },

  /** @private */
  createScrollView: function (opt) {
    var menuHeightPadding = Math.floor(this.get('menuHeightPadding') / 2);

    if (!opt) opt = {};
    if (!opt.layout) opt.layout = { top: menuHeightPadding };

    opt.controlSize = this.get('controlSize');

    return this._menuScrollView = this.createChildView(SC.MenuScrollView, opt);
  },

  /**
    Called when the pane is attached.  Takes on menu pane status.

    We don't call `sc_super()` here because `PanelPane` sets the current pane to
    be the key pane when attached.
  */
  didAppendToDocument: function () {
    if (this._itemsNeedUpdate) this._sc_menu_itemsDidChange();
    this.becomeMenuPane();
  },

  /**
    Called when the pane is detached.  Closes all submenus and resigns menu pane
    status.

    We don't call `sc_super()` here because `PanelPane` resigns key pane when
    detached.
  */
  willRemoveFromDocument: function () {
    var parentMenu = this.get('parentMenu');

    this.selectObject();
    this.closeOpenMenus();
    this.resignMenuPane();

    if (parentMenu) {
      parentMenu.becomeMenuPane();
    }
  },

  /**
    Make the pane the menu pane. When you call this, all key events will
    temporarily be routed to this pane. Make sure that you call
    resignMenuPane; otherwise all key events will be blocked to other panes.

    @returns {SC.Pane} receiver
  */
  becomeMenuPane: function () {
    if (this.rootResponder) this.rootResponder.makeMenuPane(this);

    return this;
  },

  /**
    Remove the menu pane status from the pane.  This will simply set the
    `menuPane` on the `rootResponder` to `null.

    @returns {SC.Pane} receiver
  */
  resignMenuPane: function () {
    if (this.rootResponder) {
      // We check that it's the current menuPane because if an animation is defined, when the
      // menu is removed from the DOM, another could have been add before.
      if (this.rootResponder.get('menuPane') === this) this.rootResponder.makeMenuPane(null);
    }

    return this;
  },

  /**
    The array of child menu item views that compose the menu.

    This computed property parses `displayItems` and constructs an
    `SC.MenuItemView` (or whatever class you have set as the `exampleView`) for every item.

    This calls createMenuItemViews. If you want to override this property, override
    that method.

    @type Array
    @readOnly
  */
  menuItemViews: function () {
    return this.createMenuItemViews();
  }.property('displayItems').cacheable(),

  /**
    Processes the displayItems and creates menu item views for each item.

    Override this method to change how menuItemViews is calculated.

    @return Array
  */
  createMenuItemViews: function () {
    var items = this.get('displayItems'),
      titleKey = this.get('itemTitleKey'),
      separatorKey = this.get('itemSeparatorKey'),
      separatorHeight = this.get('itemSeparatorHeight'),
      keyEquivalentKey = this.get('itemKeyEquivalentKey'),

      heightKey = this.get('itemHeightKey'),
      defaultItemHeight = this.get('itemHeight'),
      menuHeight = this.get('menuHeightPadding'),
      customRowSizeData = {};

    this._listView.set('content', items);

    var customRowSizeIndexes = SC.IndexSet.create();
    items.forEach(function(item, i) {
      var height = defaultItemHeight,
        itemHeight = 0;

      if (item.get(separatorKey) || (itemHeight = item.get(heightKey))) {
        customRowSizeIndexes.add(i, 1);

        if (item.get(separatorKey)) height = item.get(titleKey) ? defaultItemHeight : separatorHeight;
        else height = itemHeight;

        customRowSizeData[i] = height;
      }

      menuHeight += height;

      keyEquivalent = item.get(keyEquivalentKey);
      if (keyEquivalent) {
        // if array, apply each one for this item
        if (SC.typeOf(keyEquivalent) === SC.T_ARRAY) {
          keyEquivalent.forEach(function (keyEq) {
            this._keyEquivalents[keyEq] = item;
          }, this);
        } else {
          this._keyEquivalents[keyEquivalent] = item;
        }
      }
    }, this);

    this._listView.set('customRowSizeData', customRowSizeData);
    this._listView.set('customRowSizeIndexes', customRowSizeIndexes);
    this.set('menuHeight', menuHeight);

    return this._listView.get('childViews');
  },

  /**
    Returns the menu item view for the content object at the specified index.

    @param Number idx the item index
    @returns {SC.MenuItemView} instantiated view
  */
  menuItemViewForContentIndex: function (idx) {
    var menuItemViews = this.get('menuItemViews');

    if (!menuItemViews) return undefined;
    return menuItemViews.objectAt(idx);
  },

  /**
    If this is a submenu, this property corresponds to the
    top-most parent menu. If this is the root menu, it returns
    itself.

    @type SC.MenuPane
    @isReadOnly
    @type
  */
  rootMenu: function () {
    if (this.get('isSubMenu')) return this.getPath('parentMenu.rootMenu');
    return this;
  }.property('isSubMenu').cacheable(),

  /** @private @see SC.Object */
  destroy: function () {
    var ret = sc_super();

    // Clean up previous enumerable observer.
    if (this._sc_menu_items) {
      this._sc_menu_items.removeObserver('[]', this, '_sc_menu_itemPropertiesDidChange');
    }

    // Destroy the menu view we created.  The scroll view's container will falseT
    // destroy this because it receives it already instantiated.
    if (this._listView) {
      this._listView.destroy();
    }

    this.destroyDisplayItems();

    // Clean up caches.
    this._sc_menu_items = null;
    this._listView = null;

    return ret;
  },

  destroyDisplayItems: function () {
    var items = this._lastDisplayItems,
      itemKeys = this.itemKeys,
      itemKeyLen = itemKeys.length,
      j, itemKey;

    if (items) items.forEach(function(item) {
      if (item._isLocal) item.destroy();
    }, this);

    this._lastDisplayItems = null;
  },

  /**
    Close the menu if the user resizes the window.

    @private
  */
  windowSizeDidChange: function () {
    this.remove();
    return sc_super();
  },

  /**
    Returns an array of normalized display items.

    Because the items property can be provided as either an array of strings,
    or an object with key-value pairs, or an exotic mish-mash of both, we need
    to normalize it for our display logic.

    If an `items` member is an object, we can assume it is formatted properly
    and leave it as-is.

    If an `items` member is a string, we create a hash with the title value
    set to that string, and some sensible defaults for the other properties.

    A side effect of running this computed property is that the menuHeight
    property is updated.

    `displayItems` should never be set directly; instead, set `items` and
    `displayItems` will update automatically.

    @type
    @type Array
    @isReadOnly
  */
  displayItems: function () {
    var items = this.get('items'),
      len,
      titleKey = this.get('itemTitleKey'),
      valueKey = this.get('itemValueKey'),
      isEnabledKey = this.get('itemIsEnabledKey'),
      itemSeparatorKey = this.get('itemSeparatorKey'),
      ret = [], idx, item, itemName, itemType, isLocal;

    if (!items) return [];

    this.destroyDisplayItems();

    len = items.get('length');

    // Loop through the items property and transmute as needed, then
    // copy the new objects into the ret array.
    for (idx = 0; idx < len; idx++) {
      item = items.objectAt(idx);
      if (!item) continue;

      isLocal = false;
      itemType = SC.typeOf(item);
      if (itemType === SC.T_STRING) {
        itemName = item;
        item = SC.Object.create();
        item[titleKey] = itemName;
        item[valueKey] = itemName;
        isLocal = true;
      } else if (itemType === SC.T_HASH) {
        // Do not display the first separator only if it don't have a title
        if (!ret.length && SC.get(item, itemSeparatorKey) && !SC.get(item, titleKey)) continue;

        item = SC.Object.create(item);
        isLocal = true;
      }

      if (isLocal) item._isLocal = isLocal;
      if (item[itemSeparatorKey]) item[isEnabledKey] = false;

      ret.push(item);
    }

    this._lastDisplayItems = ret;

    return ret;
  }.property().cacheable(),

  /** @private */
  _sc_menu_itemsDidChange: function () {
    if (!this.get('isVisibleInWindow')) return this._itemsNeedUpdate = true;
    this._itemsNeedUpdate = false;

    var items = this.get('items');

    // Clean up previous enumerable observer.
    if (this._sc_menu_items) {
      this._sc_menu_items.removeObserver('[]', this, '_sc_menu_itemPropertiesDidChange');
    }

    // Add new enumerable observer
    if (items) {
      items.addObserver('[]', this, '_sc_menu_itemPropertiesDidChange');
    }

    // Cache the last items.
    this._sc_menu_items = items;

    this._sc_menu_itemPropertiesDidChange();
  }.observes('items'),

  /** @private */
  _sc_menu_itemPropertiesDidChange: function () {
    // Indicate that the displayItems changed.
    this.notifyPropertyChange('displayItems');
    this.get('menuItemViews');

    this.adjust('height', this.get('menuHeight'));
    this.positionPane();
  },

  currentMenuItem: function () {
    return this._listView.itemViewForContentObject(this.getPath('selection.firstObject'));
  }.property('selection').cacheable(),

  /** @private */
  _sc_menu_currentMenuItemDidChange: function () {
    var currentMenuItem = this.get('currentMenuItem'),
        previousMenuItem = this.get('previousMenuItem');

    if (previousMenuItem) {
      if (!(previousMenuItem.get('hasSubMenu') && currentMenuItem === null)) {
        this.closeOpenMenusFor(previousMenuItem);
      }
    }
    this.set('previousMenuItem', currentMenuItem);

    // Scroll to the selected menu item if it's not visible on screen.
    // This is useful for keyboard navigation and programmatically selecting
    // the selected menu item, as in `SelectButtonView`.
    if (currentMenuItem && currentMenuItem.get('isEnabled')) {
      currentMenuItem.scrollToVisible();
    }
  }.observes('currentMenuItem'),

  closeOpenMenusFor: function (menuItem) {
    if (!menuItem) return;

    var menu = menuItem.get('parentMenu');

    // Close any open menus if a root menu changes
    while (menu && menuItem) {
      menu = menuItem.get('subMenuView');
      if (menu) {
        menu.remove();
        menuItem = menu.get('previousMenuItem');
      }
    }
  },

  remove: function () {
    this.get('menuItemViews').forEach(function(menuItemView) {
      var subMenu = menuItemView._subMenu;
      if (subMenu) subMenu.remove();
    });

    return sc_super();
  },

  closeOpenMenus: function () {
    this.closeOpenMenusFor(this.get('previousMenuItem'));
  },


  // ..........................................................
  // MOUSE AND KEY EVENTS
  //

  listView: SC.ListView.extend({

    actOnSelect: true,

    allowsMultipleSelection: false,

    allowsEmptySelection: true,

    /** @private */
    performAction: function() {
      var view = this.parentMenu.get('currentMenuItem');
      if (view) view.performAction();
    },

    /** @private */
    mouseDown: function() {
      return true;
    },

    /** @private */
    mouseUp: function() {
      this.performAction();
      return true;
    },

    /**
      Needed for touch devices
    @private */
    _cv_action: function() {
      this.invokeLast('performAction');
      return true;
    },

    /** @private
      Called by the view hierarchy when the menu should respond to a shortcut
      key being pressed.

      Normally, the menu will only respond to key presses when it is visible.
      However, when the menu is part of another control, such as an
      SC.PopupButtonView, the menu should still respond if it is hidden but its
      parent control is visible. In those cases, the parameter
      fromVisibleControl will be set to `true`.

      @param keyEquivalent {String} the shortcut key sequence that was pressed
      @param fromVisibleControl Boolean if the shortcut key press was proxied
      to this menu by a visible parent control
      @returns Boolean
    */
    performKeyEquivalent: function (keyEquivalent, evt, fromVisibleControl) {
      var parentMenu = this.parentMenu;

      //If menu is not visible
      if (!fromVisibleControl && !this.get('isVisibleInWindow')) return false;

      // Look for menu item that has this key equivalent
      var item = parentMenu._keyEquivalents[keyEquivalent];

      // If found, have it perform its action
      if (item) {
        this._listView.itemViewForContentObject(item).performAction();
        return true;
      }

      // If escape key or the enter key was pressed and no menu item handled it,
      // close the menu pane and return true that the event was handled
      if (keyEquivalent === 'escape' || keyEquivalent === 'return') {
        parentMenu.remove();
        return true;
      }

      return false;
    },

    /** @private */
    moveLeft: function (sender, evt) {
      this.parentMenu.remove();
      return true;
    },

    /** @private */
    moveRight: function (sender, evt) {
      var currentMenuItem = this.parentMenu.get('currentMenuItem');
      if (currentMenuItem) currentMenuItem.showSubMenu();
      return true;
    },

    /** @private */
    insertNewline: function(ev) {
      this.performAction();
      return true;
    },

    insertText: function (chr) {
      var timer = this._timer, keyBuffer = this._keyBuffer;

      if (timer) {
        timer.invalidate();
      }
      timer = this._timer = SC.Timer.schedule({
        target: this,
        action: 'clearKeyBuffer',
        interval: 500,
        isPooled: false
      });

      keyBuffer = keyBuffer || '';
      keyBuffer += chr.toUpperCase();

      this.selectMenuItemForString(keyBuffer);
      this._keyBuffer = keyBuffer;

      return true;
    },

    selectMenuItemForString: function (buffer) {
      var items = this.get('content');
      if (!items) return;

      var titleKey = this.get('itemTitleKey'),
        bufferLength = buffer.length,
        len = items.get('length'),
        item, title, idx;

      for (idx = 0; idx < len; idx++) {
        item = items.objectAt(idx);
        title = item.get(titleKey);

        if (!title) continue;

        title = title.replace(/ /g, '').substr(0, bufferLength).toUpperCase();
        if (title === buffer) {
          this.select(idx);
          break;
        }
      }
    },

    /**
      Clear the key buffer if the user does not enter any text after a certain
      amount of time.

      This is called by the timer created in the `insertText` method.

      @private
    */
    clearKeyBuffer: function () {
      this._keyBuffer = '';
    },

    /** @private */
    _findNextSelectableItemFromIndex: function(proposedIndex, bottom) {
      var lim = this.get('length');

      while (proposedIndex < lim) {
        var itemView = this.itemViewForContentIndex(proposedIndex) ;
        if (itemView && itemView.get('isEnabled')) return proposedIndex ;
        proposedIndex++;
      }

      return bottom ;
    }

  }),

  /**
    Close the menu and any open submenus if the user clicks outside the menu.

    Because only the root-most menu has a modal pane, this will only ever get
    called once.

    @returns Boolean
    @private
  */
  modalPaneDidClick: function () {
    this.remove();

    return true;
  }

});


/**
  Default metrics for the different control sizes.
*/
SC.MenuPane.TINY_MENU_ITEM_HEIGHT = 10;
// SC.MenuPane.TINY_MENU_ITEM_SEPARATOR_HEIGHT = 2;
// SC.MenuPane.TINY_MENU_HEIGHT_PADDING = 2;
// SC.MenuPane.TINY_SUBMENU_OFFSET_X = 0;

SC.MenuPane.SMALL_MENU_ITEM_HEIGHT = 16;
// SC.MenuPane.SMALL_MENU_ITEM_SEPARATOR_HEIGHT = 7;
// SC.MenuPane.SMALL_MENU_HEIGHT_PADDING = 4;
// SC.MenuPane.SMALL_SUBMENU_OFFSET_X = 2;

SC.MenuPane.REGULAR_MENU_ITEM_HEIGHT = 22;
// SC.MenuPane.REGULAR_MENU_ITEM_SEPARATOR_HEIGHT = 9;
// SC.MenuPane.REGULAR_MENU_HEIGHT_PADDING = 6;
// SC.MenuPane.REGULAR_SUBMENU_OFFSET_X = 2;

SC.MenuPane.LARGE_MENU_ITEM_HEIGHT = 31;
// SC.MenuPane.LARGE_MENU_ITEM_SEPARATOR_HEIGHT = 20;
// SC.MenuPane.LARGE_MENU_HEIGHT_PADDING = 0;
// SC.MenuPane.LARGE_SUBMENU_OFFSET_X = 4;

SC.MenuPane.HUGE_MENU_ITEM_HEIGHT = 20;
// SC.MenuPane.HUGE_MENU_ITEM_SEPARATOR_HEIGHT = 9;
// SC.MenuPane.HUGE_MENU_HEIGHT_PADDING = 0;
// SC.MenuPane.HUGE_SUBMENU_OFFSET_X = 0;
