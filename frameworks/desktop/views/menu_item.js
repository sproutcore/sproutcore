// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/button') ;
sc_require('views/separator') ;

/**
  @class

  An SC.MenuItemView is created for every item in a menu.

  @extends SC.ButtonView
  @since SproutCore 1.0
*/
SC.MenuItemView = SC.View.extend( SC.ContentDisplay,
/** @scope SC.MenuItemView.prototype */{

  classNames: ['sc-menu-item'],

  /**
    @private
    @property
    @type {Boolean}
  */
  acceptsFirstResponder: YES,

  // ..........................................................
  // KEY PROPERTIES
  //
  /**
    The content object the menu view will display.

    @type Object
  */
  content: null,

  /**
    This returns true if the child view is a menu list view.
    This property can be over written to have other child views as well.

    @type Boolean
  */
  isSubMenuViewVisible: null,

  /**
    This property specifies whether this menu item is currently in focus

    @type Boolean
  */
  hasMouseExited: NO,

  /**
    This menu item's submenu, if it exists.

    @type SC.MenuView
  */
  subMenu: function() {
    var content = this.get('content'), menuItems, parentMenu;

    if (!content) return null;

    parentMenu = this.get('parentMenu');
    menuItems = content.get(parentMenu.itemSubMenuKey );
    if (menuItems) {
      if (SC.kindOf(menuItems, SC.MenuPane)) {
        menuItems.set('isModal', NO);
        menuItems.set('isSubMenu', YES);
        menuItems.set('parentMenu', parentMenu);
        return menuItems;
      } else {
        return SC.MenuPane.create({
          layout: { width: 200 },
          items: menuItems,
          isModal: NO,
          isSubMenu: YES,
          parentMenu: parentMenu
        });
      }
    }

    return null;
  }.property('content').cacheable(),

  /**
    Whether or not this menu item has a submenu.

    @type Boolean
  */
  hasSubMenu: function() {
    return !!this.get('subMenu');
  }.property('subMenu').cacheable(),

  /**
    Fills the passed html-array with strings that can be joined to form the
    innerHTML of the receiver element.  Also populates an array of classNames
    to set on the outer element.

    @param {SC.RenderContext} context
    @param {Boolean} firstTime
    @returns {void}
  */
  render: function(context, firstTime) {
    var content = this.get('content') ;
    var key, val ;
    var menu = this.get('parentMenu');
    var itemWidth = this.get('itemWidth') || menu.layout.width ;
    var itemHeight = this.get('itemHeight') || SC.DEFAULT_MENU_ITEM_HEIGHT ;
    this.set('itemWidth',itemWidth);
    this.set('itemHeight',itemHeight);

    context = context.begin('a');

    if (content.get(menu.itemSeparatorKey)) {
      context.push('<span class="separator"></span>');
      context.addClass('disabled');
    } else {
      val = content.get(menu.itemIconKey);
      if (val) {
        this.renderImage(context, val);
        context.addClass('has-icon');
      }

      val = this.get('title');
      if (SC.typeOf(val) !== SC.T_STRING) val = val.toString();
      this.renderLabel(context, val);

      if (this.getContentProperty('itemCheckboxKey')) {
        context.push('<div class="checkbox"></div>');
      }

      if (this.get('hasSubMenu')) {
        this.renderBranch(context);
      }

      val = this.getContentProperty('itemShortCutKey');
      if (val) {
        this.renderShortcut(context, val);
      }
    }

    context = context.end();
  },

  /**
   Generates the image used to represent the image icon. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {String} the source path of the image
   @returns {void}
  */
  renderImage: function(context, image) {
    // get a class name and url to include if relevant

    var url, className ;
    if (image && SC.ImageView.valueIsUrl(image)) {
      url = image ;
      className = '' ;
    } else {
      className = image ;
      url = SC.BLANK_IMAGE_URL;
    }
    // generate the img element...
    context.begin('img').addClass('image').addClass(className).attr('src', url).end() ;
  },

  /**
   Generates the label used to represent the menu item. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {String} menu item name
   @returns {void}
  */

  renderLabel: function(context, label) {
    if (this.get('escapeHTML')) {
      label = SC.RenderContext.escapeHTML(label) ;
    }
    context.push("<span class='value ellipsis'>"+label+"</span>") ;
  },

  /**
   Generates the string used to represent the branch arrow. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @returns {void}
  */

  renderBranch: function(context) {
    context.push('<span class="has-branch"></span>') ;
  },

  /**
   Generates the string used to represent the short cut keys. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {String} the shortcut key string to be displayed with menu item name
   @returns {void}
  */
  renderShortcut: function(context, shortcut) {
    context.push('<span class = "shortcut">' + shortcut + '</span>') ;
  },

  /**
    This method checks if the menu item is a separator.

    @param {}
    @returns Boolean
  */
  isSeparator: function() {
    return this.getContentProperty('itemSeparatorKey') === YES;
  }.property('content').cacheable(),

  /**
    This method will check whether the current Menu Item is still
    selected and then create a submenu accordignly.

    @param {}
    @returns void
  */
  showSubMenu: function() {
    var subMenu = this.get('subMenu') ;
    if(subMenu) {
      subMenu.popup(this,[0,0,0]) ;
    }
  },

  isEnabled: function() {
    return this.getContentProperty('itemIsEnabledKey') !== NO &&
           this.getContentProperty('itemSeparatorKey') !== YES;
  }.property('content.isEnabled').cacheable(),

  title: function() {
    var ret = this.getContentProperty('itemTitleKey'),
        localize = this.getPath('parentMenu.localize');

    if (localize && ret) ret = ret.loc();

    return ret||'';
  }.property('content.title').cacheable(),

  getContentProperty: function(property) {
    var content = this.get('content'),
        menu = this.get('parentMenu');

    if (content) {
      return content.get(menu.get(property));
    }
  },

  //..........................................
  //Mouse Events Handling
  //..........................................

  mouseUp: function(evt) {
    // SproutCore's event system will deliver the mouseUp event to the view
    // that got the mouseDown event, but for menus we want to track the mouse,
    // so we'll do our own dispatching.
    var targetMenuItem;

    targetMenuItem = this.getPath('parentMenu.rootMenu.targetMenuItem');

    if (targetMenuItem) targetMenuItem.performAction();
    return YES ;
  },

  /**
    Called on mouse down to send the action to the target.

    This method will start flashing the menu item to indicate to the user that
    their selection has been received, unless disableMenuFlash has been set to
    YES on the menu item.

    @private
  */
  performAction: function() {
    // Disabled menu items and menu items with submenus should not have
    // actions.
    if (!this.get('isEnabled')||this.get('hasSubMenu')) return;

    var disableFlash = this.getContentProperty('itemDisableMenuFlashKey');

    if (disableFlash) {
      // Menu flashing has been disabled for this menu item, so perform
      // the action immediately.
      this.sendAction();
    } else {
      // Flash the highlight of the menu item to indicate selection,
      // then actually send the action once its done.
      this._flashCounter = 0;
      this.invokeLater(this.flashHighlight, 25);
      this.invokeLater(this.sendAction, 200);
    }
  },

  /**
    Actually sends the action of the menu item to the target.
    @private
  */
  sendAction: function() {
    var action = this.getContentProperty('itemActionKey'),
        target = this.getContentProperty('itemTargetKey'),
        rootMenu = this.getPath('parentMenu.rootMenu'), responder;

    action = (action === undefined) ? rootMenu.get('action') : action;
    target = (target === undefined) ? rootMenu.get('target') : target;

    // Notify the root menu pane that the selection has changed
    rootMenu.set('selectedItem', this.get('content'));

    // Legacy support for actions that are functions
    if (SC.typeOf(action) === SC.T_FUNCTION) {
      action.apply(target, [rootMenu]);
      SC.Logger.warn('Support for menu item action functions has been deprecated. Please use target and action.');
    } else {
      responder = this.getPath('pane.rootResponder') || SC.RootResponder.responder;
      if (responder) {
        responder.sendAction(action, target, this, this.get('pane'));
      }
    }

    // Now that the action has been dispatched, close the menu
    this.getPath('parentMenu.rootMenu').remove();
  },

  /**
    Toggles the focus class name on the menu item layer to quickly flash the
    highlight. This indicates to the user that a selection has been made.

    This is initially called by performAction(). flashHighlight then keeps
    track of how many flashes have occurred, and calls itself until a maximum
    has been reached.

    @private
  */
  flashHighlight: function() {
    var flashCounter = this._flashCounter, layer = this.$();
    if (flashCounter % 2 === 0) {
      layer.addClass('focus');
    } else {
      layer.removeClass('focus');
    }

    if (flashCounter <= 2) {
      this.invokeLater(this.flashHighlight, 50);
      this._flashCounter++;
    }
  },

  /** @private*/
  mouseDown: function(evt) {
    return YES ;
  },

  /** @private */
  mouseEntered: function(evt) {
    var menu = this.get('parentMenu');
    menu.set('mouseHasEntered', YES);
    menu.set('currentMenuItem', this);

    if(this.get('hasSubMenu')) {
      this.invokeLater(this.showSubMenu,100) ;
    }
	  return YES ;
  },

  /** @private
    Set the focus based on whether the current Menu item is selected or not.

    @returns Boolean
  */
  mouseExited: function(evt) {
    var subMenu, parentMenu;

    if (this.get('hasSubMenu')) {
      subMenu = this.get('subMenu');
      this.invokeLater(this.checkMouseLocation, 200);
    } else {
      parentMenu = this.get('parentMenu');

      if (parentMenu.get('currentMenuItem') === this) {
        parentMenu.set('currentMenuItem', null);
      }
    }

    return YES ;
  },

  checkMouseLocation: function() {
    var subMenu = this.get('subMenu'), parentMenu = this.get('parentMenu'),
        currentMenuItem, previousMenuItem;
    if (!subMenu.get('mouseHasEntered')) {
      currentMenuItem = parentMenu.get('currentMenuItem');
      if (currentMenuItem === this || currentMenuItem === null) {
        previousMenuItem = parentMenu.get('previousMenuItem');

        if (previousMenuItem) {
          previousMenuItem.resignFirstResponder();
        }
        subMenu.remove();
      }
    }
  },

  /** @private
    Call the moveUp function on the parent Menu

    @returns Boolean
  */
  moveUp: function(sender,evt) {
    var menu = this.get('parentMenu') ;
    if(menu) {
      menu.moveUp(this) ;
    }
    return YES ;
  },

  /** @private
    Call the moveDown function on the parent Menu

    @returns Boolean
  */
  moveDown: function(sender,evt) {
    var menu = this.get('parentMenu') ;
    if(menu) {
      menu.moveDown(this) ;
    }
    return YES ;
  },

  /** @private
    Call the function to create a branch

    @returns Boolean
  */
  moveRight: function(sender,evt) {
    this.showSubMenu() ;
    return YES;
  },

  /** @private*/
  keyDown: function(evt) {
    return this.interpretKeyEvents(evt) ;
  },

  /** @private*/
  keyUp: function(evt) {
    return YES ;
  },

  /** @private*/
  cancel: function(evt) {
    this.getPath('parentMenu.rootMenu').remove();
    return YES ;
  },

  /** @private*/
  didBecomeFirstResponder: function(responder) {
    if (responder !== this) return;
    var parentMenu = this.get('parentMenu') ;
    if(parentMenu) {
      parentMenu.set('currentSelectedMenuItem', this) ;
    }
  },

  /** @private*/
  willLoseFirstResponder: function(responder) {
    if (responder !== this) return;
    var parentMenu = this.get('parentMenu') ;
    if(parentMenu) {
      parentMenu.set('currentSelectedMenuItem', null) ;
      parentMenu.set('previousSelectedMenuItem', this) ;
    }
  },

  /** @private*/
  insertNewline: function(sender, evt) {
    this.mouseUp(evt) ;
  },

  /**
    Close the parent Menu and remove the focus of the current Selected
    Menu Item

    @returns void
  */
  closeParent: function() {
    this.$().removeClass('focus') ;
    var menu = this.get('parentMenu') ;
    if(menu) {
      menu.remove() ;
    }
  },

  /** @private*/
  clickInside: function(frame, evt) {
    return SC.pointInRect({ x: evt.pageX, y: evt.pageY }, frame) ;
  }

}) ;
