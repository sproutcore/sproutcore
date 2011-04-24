// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/menu');
sc_require('views/button');

/**
 * @extends SC.ButtonView
 * @version 1.6
 * @author Alex Iskander
 */
SC.PopupButtonView = SC.ButtonView.extend({
  /** @scope SC.PopupButtonView.prototype */


  /**
    @type String
    @default 'popupButtonRenderDelegate'
  */
  renderDelegateName: 'popupButtonRenderDelegate',

  /**
    The menu that will pop up when this button is clicked.
    @type {SC.MenuPane}
    @default SC.MenuPane
  */
  menu: SC.MenuPane.extend(),

  /**
    If YES, a menu instantiation task will be placed in SproutCore's
    `SC.backgroundTaskQueue` so the menu will be instantiated before 
    the user taps the button; this should improve response time.

    @type Boolean
    @default NO
  */
  shouldLoadInBackground: NO,

  /**
   * @private
   * If YES, the menu has been instantiated; if NO, the 'menu' property
   * still has a class instead of an instance.
  */
  _menuIsLoaded: NO,

  /** @private
    isActive is NO, but when the menu is instantiated, it is bound to the menu's isVisibleInWindow property.
  */
  isActive: NO,

  acceptsFirstResponder: YES,
  

  /**
    * @private
  */
  init: function() {
    sc_super();

    // keep track of the current instantiated menu separately from
    // our property. This allows us to destroy it when the property
    // changes, and to track if the property change was initiated by
    // us (since we set `menu` to the instantiated menu).
    this._currentMenu = null;
    this.invokeOnce('scheduleMenuSetupIfNeeded');
  },

  /**
    * Adds menu instantiation to the background task queue if the menu
    * is not already instantiated and if shouldLoadInBackground is YES.
    *
    * @method
   */
  scheduleMenuSetupIfNeeded: function() {
    var menu = this.get('menu');

    if (menu && menu.isClass && this.get('shouldLoadInBackground')) {
      SC.backgroundTaskQueue.push(SC.PopupButtonView.InstantiateMenuTask.create({ popupButton: this }));
    }
  },

  // if the menu changes, we'll need to set it up again
  menuDidChange: function() {
    // first, check if we are the ones who changed the property
    // by setting it to the instantiated menu
    var menu = this.get('menu');
    if (menu === this._currentMenu) { 
      return;
    }

    this.invokeOnce('scheduleMenuSetupIfNeeded');
  }.observes('menu'),

  /**
   * Instantiates the menu if it exists and is not already instantiated.
   * If another menu is already instantiated, it will be destroyed.
  */
  setupMenu: function() {
    var menu = this.get('menu');

    // handle our existing menu, if any
    if (menu === this._currentMenu) { return; }
    if (this._currentMenu) {
      this.isActiveBinding.disconnect();

      this._currentMenu.destroy();
      this._currentMenu = null;
    }

    // do not do anything if there is nothing to do.
    if (menu && menu.isClass) {
      menu = this.createMenu(menu);
    }

    this._currentMenu = menu;
    this.set('menu', menu);

    this.isActiveBinding = this.bind('isActive', menu, 'isVisibleInWindow');
  },

  /**
    * Called to instantiate a menu. You can override this to set properties
    * such as the menu's width or the currently selected item.
  */
  createMenu: function(menu) {
    return menu.create();
  },


  /**
    Shows the PopupButton's menu. You can call this to show it manually.
  */
  showMenu: function() {
    // problem: menu's bindings may not flush
    this.setupMenu();

    // solution: pop up the menu later. Ugly-ish, but not too bad:
    this.invokeLast('_showMenu');
  },

  /**
    Hides the PopupButton's menu if it is currently showing.
  */
  hideMenu: function() {
    var menu = this.get('menu');
    if (menu && !menu.isClass) {
      menu.remove();
    }
  },

  /**
    The prefer matrix (positioning information) to use to pop up the new menu.
  */
  menuPreferMatrix: [0, 0, 0],

  /**
    * @private
    * The actual showing of the menu is delayed because bindings may need
    * to flush.
  */
  _showMenu: function() {
    var menu = this.get('menu');

    menu.popup(this, this.get('menuPreferMatrix'));
  },

  mouseDown: function(evt) {
    this.showMenu();

    this._mouseDownTimestamp = new Date().getTime();
    this.becomeFirstResponder();

    return YES;
  },

  mouseUp: function(evt) {
    var menu = this.get('menu'), targetMenuItem, success;

    if (menu) {
      targetMenuItem = menu.getPath('rootMenu.targetMenuItem');

      if (targetMenuItem && menu.get('mouseHasEntered')) {
        // Have the menu item perform its action.
        // If the menu returns NO, it had no action to
        // perform, so we should close the menu immediately.
        if (!targetMenuItem.performAction()) {
          menu.remove();
        }
      } else {
        // If the user waits more than 200ms between mouseDown and mouseUp,
        // we can assume that they are clicking and dragging to the menu item,
        // and we should close the menu if they mouseup anywhere not inside
        // the menu.
        if (evt.timeStamp - this._mouseDownTimestamp > 400) {
          menu.remove();
        }
      }
    }

    return YES;
  },

  /**
    Shows the menu when the user presses Enter. Otherwise, hands it off to button
    to decide what to do.
  */
  keyDown: function(event) {
    if (event.which == 13) {
      this.showMenu();
      return YES;
    }

    return sc_super();
  }
});

SC.PopupButtonView.InstantiateMenuTask = SC.Task.extend({
  run: function(queue) {
    this.popupButton.setupMenu();
  }
});

