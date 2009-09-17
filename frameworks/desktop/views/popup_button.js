/**
  @class

  @extends SC.ButtonView
  @author Santosh Shanbhogue
  @copyright 2008-2009, Sprout Systems, Inc. and contributors.
  @version 1.0
*/
sc_require('views/button');
SC.PopupButtonView = SC.ButtonView.extend({
  /**
    This property shows whether the menu is currently displayed or not
  */
  keyEquivalent: null,
  classNames: ['sc-popup-button'],
  
  /**
    Prefer matrix to pass the offsets to position the pane popped up by this 
    button.
    
    @property
  */
  preferMatrix: null,
    
  /**private */
  acceptsFirstResponder: YES,
  /**
    Overriding the default SC.ButtonView#performKeyEquivalent method to pass 
    it onto the menu
    
    @param {string} keystring method name corresponding to the keys pressed 
    (i.e alt_shift_z)
    @param {DOMMouseEvent} evt mousedown event
  */
  isSelected: NO,
  performKeyEquivalent: function( charCode, evt )
  {
    if (!this.get('isEnabled')) return NO ;
    var menu = this.get('menu') ;
    return (!!menu && menu.performKeyEquivalent(charCode, evt)) ;
  },
  
  /**
    Menu attached to the popupButton
    @default SC.MenuView
  */
  menu : null,
  
  /**
    Binds the button's selection state to the menu's visibility.
    @private
  */
  isSelectedBinding: '*menu.isVisibleInWindow',
  
  /**
    Button action handler
    @param {DOMMouseEvent} evt mouseup event that triggered the action
  */
  action: function( evt )
  {
    var menu = this.get('menu') ;
    // no menu to toggle... bail...
    if (!menu) return NO ;
    menu.popup(this, this.preferMatrix) ;
    return YES;
  },
  
  /**
    @private

    Holding down the button should display the menu pane.
  */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES ; // handled event, but do nothing
    this.set('isActive', YES);
    this._isMouseDown = YES;
    this._action() ;
    return YES ;
  }
  
});
