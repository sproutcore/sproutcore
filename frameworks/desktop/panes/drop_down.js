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

SC.DropDownMenu = SC.ButtonView.extend(
/** @scope SC.DropDownView.prototype */ {
  
  /**
    This property shows whether the menu is currently displayed or not
  */
  keyEquivalent: null,
  
  /**
    className - sc-popup-button
  */
  classNames: ['sc-popup-button'],
  
  /** 
    Menu item list
    @Array
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
    To set the menu item index
    
    @property
  */
  itemIdx: null,
  
  // flag: 0,
  
  /**
      Prefer matrix to position the drop down menu the button such that the 
      selected item for the menu item will appear aligned to the 
      icon on the button.
      
      @property
  */  
  preferMatrix: [-13, 0, 2],
  
  /**
    Binds the button's selection state to the menu's visibility.
    @private
  */
  isSelectedBinding: '*menu.isVisibleInWindow',
  
  /** 
    Method to set the Menu Items from the user defined objects
  */
  fetchMenuItems: function() {
    var items = this.get('objects') ;
    var titleValueKey = this.get('titleValueKey') ;
    var iconValueKey = this.get('iconValueKey') ;
    var selectionValueKey = this.get('selectionValueKey') ;
    var itemList = [];
    
    
    // var flag = this.get('flag') ;
    
    //to set the 'checkbox' property of menu items
    var isChecked = YES ;
    
    items.forEach(function(object) {
      if (object) {
        
        //Get the title value key. If value key is not specified convert obj 
        //to string
        var titleValue = 
          titleValueKey ? object[titleValueKey] : object.toString() ;
        
        //get selection value
        var selectionValue = 
          selectionValueKey ? object[selectionValueKey] : null ;
          
        //Check if the item is currentSelectedItem or not
        if(titleValue === this.title) {
          isChecked = YES ;
        }
        // else if (selectionValue === YES) {
        //          if (flag === 0 ) {
        //            isChecked = YES
        //            this.set('flag', 1) ;
        //          }
        //          else {
        //            isChecked = NO ;
        //          }
        //        }
        else {
          isChecked = NO ;
        }
        
        //Get the iconVlaue key
        var iconValue = iconValueKey ? object[iconValueKey] : object ;
        
        //Set the items in the itemList array
        itemList.push({
          title: titleValue,
          icon: iconValue,
          isEnabled: YES,
          checkbox: isChecked,
          action: this.displaySelectedItem
        });
       }
      this.set('itemList', itemList) ;
   }, this ) ;
  },

  /**
    render method 
    @private
  */
  render: function(context,firstTime) {
    sc_super() ;
    
    //Fetch the menu items
    this.fetchMenuItems() ;
    
    //Set the preference matrix for the menu pane
    this.changeDropDownPreferMatrix(this.itemIdx);
    
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
      
      /**
        Class name - drop-down-menu-item

      */
      classNames: ['drop-down-menu-item'],
      
      /**
        The menu items are set from the itemList property of DropDownMenu

        @property
      */
      items: itemList,
      
      /**
        This property enables all the items and makes them selectable.

        @property
      */
      isEnabled: YES,
      
      /**
        This property points to the key setting the enable/disable configuration.

        @property
      */
      itemIsEnabledKey: "isEnabled",
      
      /**
        This property points to the key setting the title.

        @property
      */
      itemTitleKey: "title",
      
      /**
        This property points to the key setting the icon.

        @property
      */
      itemIconKey:"icon",
      
      /**
        This property points to the key setting the checkbox.

        @property
      */
      itemCheckboxKey: "checkbox",
      
      /**
        This property points to the key setting the action.

        @property
      */
      itemActionKey: "action",
      
      preferType: SC.PICKER_MENU,
      itemHeightKey: 'height',
      layout: { width: 150 },
      contentView: SC.View.extend({
      })
    }) ;
    
    pane.popup(this, this.preferMatrix) ;
    
    // no menu to toggle... bail...
    if (!menu) return NO ;
    menu.popup(this, this.preferMatrix) ;
    return YES;
  },
  
  /**
    @private
    
    The button theme will be popup
  */
  theme: 'popup',
  
  /**
    Render method gets triggered when these properties change
  */
  displayProperties: ['icon', 'title'],
  
  /** 
     Action method for the drop down menu items
     
  */  
   displaySelectedItem: function() {
     
     //Get the menu pane
     var menuView = this.get('parentView') ;
     
     //Current selected menu item
     var currSel = menuView.get('currentSelectedMenuItem') ;
     
     // MenuItemViews
     var itemViews = menuView.menuItemViews ;
     
     /**
       Fetch the index of the current selected item
     */
     var itemIdx = itemViews.indexOf(currSel) ; 
     
     //Get the drop down View
     var button = this.getPath('parentView.anchor') ;
     
     //Set the button title and icon
     button.set('title', this.get('value')) ;
     button.set('icon', this.get('icon')) ;
     
     //Set the value of 'itemIdx' property of the DropDownMenu 
     button.set('itemIdx', itemIdx) ;
   },
   
   /**
     Set the "top" attribute in the prefer matrix property which will position 
     menu such that the selected item in the menu will be place aligned 
     to the item on the button when menu is opened.
   */
   changeDropDownPreferMatrix: function() {
     var pxOffset = 0;
     var preferMatrixAttributeTop = 0;
     
     var itemIdx = this.get('itemIdx') ;
     
     //Set the preferMatrixAttribute Top
     if(itemIdx) 
     preferMatrixAttributeTop = itemIdx * 20;
     
     if(this.get('preferMatrix'))
       this.get('preferMatrix')[1] = -preferMatrixAttributeTop + pxOffset;
   }
}) ;

