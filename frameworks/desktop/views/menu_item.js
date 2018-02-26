// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/separator');
sc_require('views/list_item');


/**
  @class

  An SC.MenuItemView is created for every item in a menu.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.MenuItemView = SC.ListItemView.extend(SC.Control,
/** @scope SC.MenuItemView.prototype */ {

  /**
    @type Array
    @default ['sc-menu-item']
    @see SC.View#classNames
  */
  classNames: ['sc-menu-item'],

  /**
    @type Array
    @default ['title', 'isEnabled', 'isSeparator', 'isChecked']
    @see SC.View#displayProperties
  */
  displayProperties: ['title', 'toolTip', 'isEnabled', 'icon', 'isSeparator', 'shortcut', 'isChecked'],

  /**
    The WAI-ARIA role for menu items.

    @type String
    @default 'menuitem'
    @readOnly
  */
  ariaRole: 'menuitem',

  /**
    @type Boolean
    @default YES
  */
  escapeHTML: YES,

  /**
    IE only attribute to block blurring of other controls

    @type Boolean
    @default YES
  */
  blocksIEDeactivate: YES,

  /**
    @type Boolean
    @default NO
  */
  isContextMenuEnabled: NO,


  // ..........................................................
  // KEY PROPERTIES
  //

  /**
    The content object the menu view will display.

    @type Object
    @default null
  */
  content: null,

  contentKeys: {
    itemTitleKey: 'title',
    itemValueKey: 'value',
    itemToolTipKey: 'toolTip',
    itemIconKey: 'icon',
    itemSeparatorKey: 'isSeparator',
    itemShortCutKey: 'shortcut',
    itemCheckboxKey: 'isChecked',
    itemIsEnabledKey: 'isEnabled',
    itemSubMenuKey: 'subMenu'
  },

  /**
    The parent menu.

    @type SC.MenuPane
  */
  parentMenu: function() {
    return this.get('displayDelegate').get('parentMenu');
  }.property().cacheable(),

  /**
    This menu item's submenu, if it exists.

    @type SC.MenuPane
  */
  subMenuView: function () {
    var parentMenu = this.get('parentMenu'),
        menuItems = this.get('subMenu');

    if (menuItems) {
      if (SC.kindOf(menuItems, SC.MenuPane)) {
        menuItems.set('isModal', NO);
        menuItems.set('isSubMenu', YES);
        menuItems.set('parentMenu', parentMenu);
        return menuItems;
      } else {
        var subMenu = this._subMenu;
        if (subMenu) {
          if (subMenu.get('isAttached')) {
            this.invokeLast('showSubMenu');
          }
          subMenu.remove();
          subMenu.destroy();
        }

        var opt = {
          items: menuItems,
          isModal: NO,
          isSubMenu: YES,
          parentMenu: parentMenu,
          controlSize: parentMenu.get('controlSize'),
          exampleView: parentMenu.get('exampleView')
        };

        parentMenu.itemKeys.forEach(function(itemKey) {
          opt[itemKey] = parentMenu[itemKey];
        }, this);

        subMenu = this._subMenu = SC.AutoResizingMenuPane.create(opt);
        return subMenu;
      }
    }

    return null;
  }.property('subMenu').cacheable(),

  /**
    @type Boolean
    @default NO
  */
  hasSubMenu: function () {
    return !!this.get('subMenu');
  }.property('subMenu').cacheable(),

  /** @private */
  getContentProperty: function (property) {
    var content = this.get('content'),
      menu = this.get('parentMenu');

    if (content && menu) {
      return content.get(menu.get(property));
    }
  },

  /** @private */
  destroy: function () {
    sc_super();

    var subMenu = this._subMenu;
    if (subMenu) {
      subMenu.remove();
      subMenu.destroy();
      this._subMenu = null;
    }
  },

  /** SC.MenuItemView is not able to update itself in place at this time. */
  // TODO: add update: support.
  isReusable: false,

  /** @private
    Fills the passed html-array with strings that can be joined to form the
    innerHTML of the receiver element.  Also populates an array of classNames
    to set on the outer element.

    @param {SC.RenderContext} context
    @param {Boolean} firstTime
    @returns {void}
  */
  render: function (context) {
    var content = this.get('content'),
      del = this.get('displayDelegate'),
      isSeparator = this.get('isSeparator'),
      title = this.get('title') || '',
      val,
      menu = this.get('parentMenu'),
      itemWidth = this.get('itemWidth') || menu.layout.width,
      escapeHTML = this.get('escapeHTML');

    this.set('itemWidth', itemWidth);

    //addressing accessibility
    if (isSeparator) {
      //assign the role of separator
      context.setAttr('role', 'separator');
    } else if (this.get('isChecked')) {
      //assign the role of menuitemcheckbox
      context.setAttr('role', 'menuitemcheckbox');
      context.setAttr('aria-checked', true);
    }

    context = context.begin('a').addClass('menu-item');

    if (isSeparator) {
      context.push('<span class="separator"></span>');
      context.addClass('disabled');

      if (title) context.push('<span class="separator-title">'+title+'</span>');
    }
    else {
      val = this.get('icon');
      if (val) {
        this.renderImage(context, val);
        context.addClass('has-icon');
      }

      if (SC.typeOf(title) !== SC.T_STRING) title = title.toString();
      this.renderLabel(context, title);

      val = this.get('toolTip');
      if (val) {
        if (SC.typeOf(val) !== SC.T_STRING) val = val.toString();
        if (escapeHTML) {
          val = SC.RenderContext.escapeHTML(val);
        }
        context.setAttr('title', val);
      }

      if (this.get('isChecked')) {
        context.push('<div class="checkbox"></div>');
      }

      if (this.get('hasSubMenu')) {
        this.renderBranch(context);
      }

      val = this.get('shortcut');
      if (val) {
        this.renderShortcut(context, val);
      }
    }

    context = context.end();
  },

  /** @private
   Generates the image used to represent the image icon. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {String} the source path of the image
   @returns {void}
  */
  renderImage: function (context, image) {
    // get a class name and url to include if relevant
    var classArray = ['icon'];
    if (image && SC.ImageView.valueIsUrl(image)) {
      context.begin('img').addClass(classArray).setAttr('src', image).end();
    } else {
      classArray.push(image);
      context.begin('div').addClass(classArray).end();
    }
  },

  /** @private
   Generates the label used to represent the menu item. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {String} menu item name
   @returns {void}
  */
  renderLabel: function (context, label) {
    if (this.get('escapeHTML')) {
      label = SC.RenderContext.escapeHTML(label);
    }
    context.push("<span class='value ellipsis'>" + label + "</span>");
  },

  /** @private
   Generates the string used to represent the branch arrow. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @returns {void}
  */
  renderBranch: function (context) {
    context.push('<span class="has-branch"></span>');
  },

  /** @private
   Generates the string used to represent the short cut keys. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {String} the shortcut key string to be displayed with menu item name
   @returns {void}
  */
  renderShortcut: function (context, shortcut) {
    context.push('<span class = "shortcut">' + shortcut + '</span>');
  },

  /**
    This method will check whether the current Menu Item is still
    selected and then create a submenu accordingly.
  */
  showSubMenu: function () {
    var subMenu = this.get('subMenuView');
    if (subMenu && !subMenu.get('isAttached')) {
      subMenu.popup(this, [0, 0, 0]);
    }

    this._subMenuTimer = null;
  },


  //..........................................
  // ACTION HANDLING
  //

  /** @private
    Called on mouse down to send the action to the target.

    This method will start flashing the menu item to indicate to the user that
    their selection has been received, unless disableMenuFlash has been set to
    YES on the menu item.

    @returns {Boolean}
  */
  performAction: function () {
    var rootMenu = this.getPath('parentMenu.rootMenu');

    // Clicking on a disabled menu item should close the menu.
    if (!this.get('isEnabled')) {
      rootMenu.remove();
      return YES;
    }

    // Menus that contain submenus should ignore clicks
    if (this.get('hasSubMenu')) {
      if (!rootMenu.get('actOnSubMenu') || !this.getContentProperty('itemValueKey')) return NO;
    }

    var disableFlash = this.getContentProperty('itemDisableMenuFlashKey');
    if (disableFlash) {
      // Menu flashing has been disabled for this menu item, so perform
      // the action immediately.
      this.sendAction();
    } else {
      // Flash the highlight of the menu item to indicate selection,
      // then actually send the action once its done.
      this._flashCounter = 0;

      // Set a flag on the root menu to indicate that we are in a
      // flashing state. In the flashing state, no other menu items
      // should become selected.
      rootMenu._isFlashing = YES;
      this.invokeLater(this.flashHighlight, 25);
      this.invokeLater(this.sendAction, 150);
    }

    return YES;
  },

  /** @private
    Actually sends the action of the menu item to the target.
  */
  sendAction: function () {
    var action = this.getContentProperty('itemActionKey'),
      target = this.getContentProperty('itemTargetKey'),
      rootMenu = this.getPath('parentMenu.rootMenu'),
      content = this.get('content'),
      responder;

    // Close the menu
    rootMenu.remove();
    // We're no longer flashing
    rootMenu._isFlashing = NO;

    action = (action === undefined) ? rootMenu.get('action') : action;
    target = (target === undefined) ? rootMenu.get('target') : target;

    // Notify the root menu pane that the selection has changed
    rootMenu.set('selectedItem', content);

    // Legacy support for actions that are functions
    if (SC.typeOf(action) === SC.T_FUNCTION) {
      action.apply(target, [rootMenu]);
      //@if (debug)
      SC.Logger.warn('Support for menu item action functions has been deprecated. Please use target and action.');
      //@endif
    } else {
      responder = this.getPath('pane.rootResponder') || SC.RootResponder.responder;

      if (responder) {
        // Send the action down the responder chain
        responder.sendAction(action, target, content);
      }
    }
  },

  /** @private
    Toggles the highlight class name on the menu item layer to quickly flash the
    highlight. This indicates to the user that a selection has been made.

    This is initially called by performAction(). flashHighlight then keeps
    track of how many flashes have occurred, and calls itself until a maximum
    has been reached.
  */
  flashHighlight: function () {
    var flashCounter = this._flashCounter, layer = this.$();
    if (flashCounter % 2 === 0) {
      layer.addClass('highlight');
    } else {
      layer.removeClass('highlight');
    }

    if (flashCounter <= 2) {
      this.invokeLater(this.flashHighlight, 50);
      this._flashCounter++;
    }
  },


  //..........................................
  // MOUSE EVENTS HANDLING
  //

  /** @private */
  mouseEntered: function (evt) {
    var menu = this.get('parentMenu'),
      rootMenu = menu.get('rootMenu');

    // Ignore mouse entering if we're in the middle of a menu flash
    // or if the item is already selected
    if (rootMenu._isFlashing || menu.get('currentMenuItem') === this) return;

    menu.selectObject(this.get('content'));

    if (this.get('hasSubMenu')) {
      this._subMenuTimer = this.invokeLater(this.showSubMenu, 100);
    }

    return YES;
  },

  /** @private
    Set the menu selection based on whether the current menu item is selected or not.
  */
  mouseExited: function (evt) {
    // If we have a submenu, we need to give the user's mouse time to get
    // to the new menu before we remove highlight.
    if (this.get('hasSubMenu')) {
      // If they are exiting the view before we opened the submenu,
      // make sure we don't open it once they've left.
      var timer = this._subMenuTimer;
      if (timer) {
        timer.invalidate();
      } else {
        this.invokeLater(this.checkMouseLocation, 100);
      }
    } else {
      var menu = this.get('parentMenu');

      if (menu.get('currentMenuItem') === this) {
        menu.selectObject();
      }
    }

    return YES;
  },

  /** @private */
  checkMouseLocation: function () {
    var subMenu = this.get('subMenuView'),
      currentMenuItem = this.getPath('parentMenu.currentMenuItem');

    if (currentMenuItem !== this) {
      subMenu.remove();
    }
  }

});
