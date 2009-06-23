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
    if (!this.get('isEnabled')) return NO ;
    var menu = this.get('menu') ;
    return (!!menu && menu.performKeyEquivalent(charCode, evt)) ;
  },
  
  /**
    PopupMenu reference. Will be lazy-loaded from the 'menuName' string.
    @type {SC.PopupMenu}
  */
  menu: function()
  {
    if ( !this._menu )
    {
      if(!this.get('menuName')) return null ;
      var menu = this.get('menuName').create();
      if (menu) menu.set('isVisible', NO);
      // calling set so that the isSelectedBinding is triggered
      this.set('_menu', menu);
    }
    return this._menu;
  }.property(),
  
  /**
    menuView is used to create the Menu
    
    @default SC.MenuView
  */
  menuName : null,
  
  /**
    Binds the button's selection state to the menu's visibility.
    @private
  */
  isSelectedBinding: '*menu.isVisible',
  
  /**private*/
  render: function(context,firstTime) {
    sc_super() ;
    var menu = this.get('menu') ;
    if(menu) {
      menu.createLayer() ;
    }
  },
  /**
    Button action handler
    @param {DOMMouseEvent} evt mouseup event that triggered the action
  */
  action: function( evt )
  {
    var menu = this.get('menu') ;
    // no menu to toggle... bail...
    if (!menu) return NO ;
    menu.set('isVisible', YES) ;
    menu.popup(this) ;
    return YES;
  }
  
});
