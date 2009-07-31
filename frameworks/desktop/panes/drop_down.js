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
  
  /** 
    Current selected menu item
    @Array
  */
  currentSelItem: null,
  
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
  
  /**
    To set the menu item index
    
    @property
  */
  itemIdx: null,
  
  /**
     Current Value of the dropDown
     
     @property
  */
  dropDownValue: null,
  
  /**
    Binds the button's title to the 'dropDownValue'
    
    @private
  */
  titleBinding: '*.dropDownValue',
  
  /**
    Default selected value of the drop down.
     This will be the first item from the menu item list.
    
    @private
  */
  defaultSelVal: null,
  
  /**
    Prefer matrix to position the drop down menu the button such that the 
    selected item for the menu item will appear aligned to the 
    icon on the button.
    
    @property
    @default [ -4, 0. 2]
    
  */
  preferMatrix: [-4, 0, 2],
  
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
    
    //Get the titleValuekey set by the user
    var titleValueKey = this.get('titleValueKey') ;
    
    //Get the iconValueKey from the user
    var iconValueKey = this.get('iconValueKey') ;
    
    //itemList array to set the menu items
    var itemList = [];
    
    //to set the 'checkbox' property of menu items
    var isChecked = YES ;
    
    //index for finding the first item in the list
    var idx = 0 ;
    
    items.forEach(function(object) {
      if (object) {
        
        //Get the title value key. If value key is not specified convert obj 
        //to string
        var titleValue = 
          titleValueKey ? object[titleValueKey] : object.toString() ;
        
        //Check if the item is currentSelectedItem or not
        if(titleValue === this.dropDownValue) {
          
          //set the itemIdx - To change the prefMatrix accordingly.
          this.set('itemIdx', idx) ;
          isChecked = YES ;
        }
        
        else {
          isChecked = NO ;
        }
        
        //Get the iconVlaue key
        var iconValue = iconValueKey ? object[iconValueKey] : object ;
        
        //Set the first item from the list as default selected item 
        if (idx === 0) {
          this.set('defaultSelVal',titleValue) ;
          this.set('icon', iconValue) ;
        }
        
        //Set the items in the itemList array
        itemList.push({
          title: titleValue,
          icon: iconValue,
          isEnabled: YES,
          checkbox: isChecked,
          action: this.displaySelectedItem
        });
       }
       idx += 1 ;
      
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
    
    
    if(firstTime) {
      var selectionValue = this.get('selectionValue') ;
      if(selectionValue) {
        this.set('dropDownValue', selectionValue) ;
      }
      else {
        this.set('dropDownValue', this.get('defaultSelVal')) ;
      }
    }
    
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
    var currSel = this.get('currentSelItem') ;
    var itemList = this.get('itemList') ;
    var menu = SC.MenuPane.create({
      
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
      
      preferType: SC.PICKER_MENU,
      itemHeightKey: 'height',
      layout: { width: 150},
      contentView: SC.View.extend({
      })
    }) ;
    
    // menu.popup(this, this.preferMatrix) ;
    
    // no menu to toggle... bail...
    if (!menu) return NO ;
    menu.popup(this, this.preferMatrix) ;
    menu.set('currentSelectedMenuItem', currSel) ;
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
     
     //Set the button title and icon
     button.set('dropDownValue', this.get('value')) ;
     
     //Set the current selected item
     button.set('currentSelItem', currSel) ;
     
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

