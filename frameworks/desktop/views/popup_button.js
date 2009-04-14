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
    if (!this.get('isEnabled')) return false ;
    var menu = this.get('menu') ;
    return (!!menu && menu.performKeyEquivalent(charCode, evt)) ;
  },
  /**
    this is the Menu View associated with Popup Button
  */
  menu: null,

  /**
    Binds the button's selection state to the menu's visibility.
    @private
  */
  //isSelectedBinding: '*menu.isVisible',
  
  /**
    Button action handler
    @param {DOMMouseEvent} evt mouseup event that triggered the action
  */
  action: function( evt )
  {
    var menu = this.get('menu') ;
    // no menu to toggle... bail...
    if (!menu) return false ;
    if (!this._didFirstRun) {
    // for some reason the menu#isVisible is true the first time we get 
    // it... and since this#isSelected is bound to it... we get an incorrect 
    // conditional check. hacking it here to keep moving.
    menu.popup(this) ;
    this._didFirstRun = true ;
    } else {
      // toggle the menu...
      this.get('isSelected') ? menu.set('isVisible', false) : menu.popup(this,SC.PICKER_MENU) ;
    }
    return true;
  }
  
});
