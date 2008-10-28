require('views/button/button') ;

/**
  @class

  @extends SC.ButtonView
  @author Skip Baney
  @copyright 2006-2008, Sprout Systems, Inc. and contributors.
  @version 1.0
*/
SC.PopupButtonView = SC.ButtonView.extend({

  /**
    Overriding the default SC.ButtonView#performKeyEquivalent method to pass 
    it onto the menu

    @param {string} keystring method name corresponding to the keys pressed 
    (i.e alt_shift_z)
    @param {DOMMouseEvent} evt mousedown event
  */
  performKeyEquivalent: function( keystring, evt )
  {
    if (!this.get('isEnabled')) return false;
    
    // is it our own keyEquivalent? 
    if (sc_super()) return true;

    // is it any of our menu items keyEquivalent?
    var menu = this.get('menu');
    return (!!menu && menu.performKeyEquivalent(keystring, evt));
  },
  
  /**
    Name of the menu view to use.
    @type {string}
  */
  menuName: null,

  /**
    PopupMenu reference. Will be lazy-loaded from the 'menuName' string.
    @type {SC.PopupMenu}
  */
  menu: function( key, value )
  {
    if ( value !== undefined ) 
    {
      value.set('isVisible', false);
      this.set('_menu', value);
    }
    if ( !this._menu )
    {
      var menu = SC.page.get(this.get('menuName'));
      if (menu) menu.set('isVisible', false);
      // calling set so that the isSelectedBinding is triggered
      this.set('_menu', menu);
    }
    return this._menu;
  }.property(),
  
  /**
    Binds the button's selection state to the menu's visibility.
    @private
  */
  isSelectedBinding: '*_menu.isVisible',
  
  /**
    Button action handler
    @param {DOMMouseEvent} evt mouseup event that triggered the action
  */
  action: function( evt )
  {
    var menu = this.get('menu');
    // no menu to toggle... bail...
    if (!menu) return false;
    
    if (!this._didFirstRun) {
      // for some reason the menu#isVisible is true the first time we get 
      // it... and since this#isSelected is bound to it... we get an incorrect 
      // conditional check. hacking it here to keep moving.
      menu.popup(this, evt);
      this._didFirstRun = true;
    } else {
      // toggle the menu...
      this.get('isSelected') ? menu.set('isVisible', false) : menu.popup(this, evt);
    }
    
    return true;
  }

});
