sc_require('views/button');

/** @class

  SC.PopupButtonView displays a pop-up menu when clicked, from which the user
  can select an item.

  To use, create the SC.PopupButtonView as you would a standard SC.ButtonView,
  then set the menu property to an instance of SC.MenuPane. For example:

{{{
SC.PopupButtonView.design({
  layout: { width: 200, height: 18 },
  menuBinding: 'MyApp.menuController.menuPane'
});
}}}

  You would then have your MyApp.menuController return an instance of the menu
  to display.

  @extends SC.ButtonView
  @author Santosh Shanbhogue
  @author Tom Dale
  @copyright 2008-2010, Sprout Systems, Inc. and contributors.
  @version 1.0
*/
SC.PopupButtonView = SC.ButtonView.extend(
/** @scope SC.PopupButtonView.prototype */ {
  classNames: ['sc-popup-button'],

  // ..........................................................
  // PROPERTIES
  //

  /**
    The prefer matrix to use when displaying the menu.

    @property
  */
  preferMatrix: null,

  /**
    The SC.MenuPane that should be displayed when the button is clicked.

    @type {SC.MenuPane}
    @default null
  */
  menu: null,

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private
    Binds the button's selection state to the menu's visibility.
  */
  isActiveBinding: '*menu.isVisibleInWindow',

  /** @private
    Displays the menu.

    @param {SC.Event} evt
  */
  action: function(evt)
  {
    var menu = this.get('menu') ;

    if (!menu) {
      //@ if (debug)
      SC.Logger.warn("SC.PopupButton - Unable to show menu because the menu property is set to %@.".fmt(menu));
      //@ endif
      return NO ;
    }

    menu.popup(this, this.get('preferMatrix')) ;
    return YES;
  },

  /** @private
    On mouse down, we set the state of the button, save some state for further
    processing, then call the button's action method.

    @param {SC.Event} evt
    @returns {Boolean}
  */
  mouseDown: function(evt) {
    // If disabled, handle mouse down but ignore it.
    if (!this.get('isEnabled')) return YES ;

    this.set('isActive', YES);
    this._isMouseDown = YES;

    // Store the timestamp so we know how long between mouseDown and mouseUp.
    this._mouseDownTimestamp = evt.timeStamp;
    this._action() ;
    return YES ;
  },

  /** @private
    Because we responded YES to the mouseDown event, we have responsibility
    for handling the corresponding mouseUp event.

    However, the user may click on this button, then drag the mouse down to a
    menu item, and release the mouse over the menu item. We therefore need to
    delegate any mouseUp events to the menu's menu item, if one is selected.

    We also need to differentiate between a single click and a click and hold.
    If the user clicks and holds, we want to close the menu when they release.
    Otherwise, we should wait until they click on the menu's modal pane before
    removing our active state.

    @param {SC.Event} evt
    @returns {Boolean}
  */
  mouseUp: function(evt) {
    var menu = this.get('menu'), targetMenuItem, success;

    if (menu) {
      // Get the menu item the user is currently hovering their mouse over
      targetMenuItem = menu.getPath('rootMenu.targetMenuItem');

      if (targetMenuItem) {
        // Have the menu item perform its action.
        // If the menu returns NO, it had no action to
        // perform, so we should close the menu immediately.
        if (!targetMenuItem.performAction()) menu.remove();
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

    // Reset state.
    this._isMouseDown = NO;
    sc_super();
    return YES;
  },

  /** @private
    Overrides ButtonView's mouseExited method to remove the behavior where the
    active state is removed on mouse exit. We want the button to remain active
    as long as the menu is visible.

    @param {SC.Event} evt
    @returns {Boolean}
  */
  mouseExited: function(evt) {
    return YES;
  },

  /** @private
    Overrides performKeyEquivalent method to pass any keyboard shortcuts to
    the menu.

    @param {String} charCode string corresponding to shortcut pressed (e.g.,
    alt_shift_z)
    @param {SC.Event} evt
  */
  performKeyEquivalent: function( charCode, evt )
  {
    if (!this.get('isEnabled')) return NO ;
    var menu = this.get('menu') ;
    return (!!menu && menu.performKeyEquivalent(charCode, evt)) ;
  },

  /** @private */
  acceptsFirstResponder: function() {
    if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
    else return NO;
  }.property('isEnabled')

});
