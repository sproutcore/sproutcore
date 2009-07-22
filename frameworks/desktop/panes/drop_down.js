// ==========================================================================
// Project:   DropDownMenu
// Copyright: 
// License:
// ==========================================================================

/** @class
  
  @extends SC.Button
  @version 1.0
  @author Mohammed Ashik
*/
sc_require('views/button');

SC.DropDownView = SC.ButtonView.extend(
/** @scope SC.DropDownView.prototype */ {
  
  /**
    This property shows whether the menu is currently displayed or not
  */
  keyEquivalent: null,
  classNames: ['sc-popup-button'],
  
  /** 
    Menu item list
  */
  itemList: [],
    
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
    Method to set the Menu Items from the user defined objects
  */
  fetchMenuItems: function() {
    var items = this.get('objects');
    var itemList = [];
    
    for (var idx = 0, iLen = items.length; idx < iLen; ++idx) {
      itemList.push({
       title: items[idx],
       isEnabled: YES,
       action: this.displaySelectedItem
      });
    }
    this.set('itemList', itemList) ;
  },

  /**
    @private
  */
  render: function(context,firstTime) {
    sc_super() ;
    
    this.fetchMenuItems() ;
    
    var menu = this.get('menu') ;
    if(firstTime && menu) {
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
    var itemList = this.get('itemList') ;
    var pane = SC.MenuPane.create({
      
      items: itemList,
      
      isEnabled: YES,
      itemIsEnabledKey: "isEnabled",
      itemTitleKey: "title",
      preferType: SC.PICKER_MENU,
      itemHeightKey: 'height',
      layout: { width: 150 },
      contentView: SC.View.extend({
      })
    }) ;
    
    pane.popup(this) ;
    
    // no menu to toggle... bail...
    if (!menu) return NO ;
    menu.popup(this) ;
    return YES;
  },
  
  /**
    @private
    
    The button theme will be popup
  */
  theme: 'popup',
  
  /**
    Trigger the render function when these properties change
  */
  displayProperties: ['icon', 'title'],
  
  /** 
     @param view - the selected MenuItem view
     
  */  
   displaySelectedItem: function() {
     //set the title and icon of the here. This in turn
     //triggers the render method
     var button = this.getPath('parentView.anchor') ;
     
     button.set('title', this.get('value')) ;
     //button.set('icon', '')
   }
}) ;

