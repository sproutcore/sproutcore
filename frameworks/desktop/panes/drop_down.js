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
      Prefer matrix to position the color menu on the button such that the 
      selected color swatch from color menu will appear alligned to the 
      swtach image on the button.

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
    console.log(this.get('preferMatrix')) ;
    var items = this.get('objects') ;
    var titleValueKey = this.get('titleValueKey') ;
    var iconValueKey = this.get('iconValueKey') ;
    var itemList = [];
    items.forEach(function(object) {
      if (object) {
        // Get the value key. If value key is not specified convert obj 
        //to string
        var titleValue = titleValueKey ? object[titleValueKey] : object.toString() ;
        var iconURL = object[iconValueKey] ;
        var iconValue = iconValueKey ? object[iconValueKey] : object ;
        itemList.push({
          title: titleValue,
          icon: iconURL,
          isEnabled: YES,
          // checkbox: YES,
          action: this.displaySelectedItem
        });
       }
      this.set('itemList', itemList) ;
   }, this ) ;
  },

  /**
    @private
  */
  render: function(context,firstTime) {
    sc_super() ;
    
    this.fetchMenuItems() ;
    this.changeDropDownPreferMatrix();
    
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
      classNames: ['drop-down-menu-item'],
            
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
    Trigger the render function when these properties change
  */
  displayProperties: ['icon', 'title'],
  
  /** 
     @param view - the selected MenuItem view
     
  */  
   displaySelectedItem: function() {
     console.log(this) ;
     var menuView = this.get('parentView') ;
     console.log('menuView =>'+menuView) ;
     
     // var menuIdx = idx = (menuItemViews.indexOf(menuItem)
     //set the title and icon of the here. This in turn
     //triggers the render method
     var button = this.getPath('parentView.anchor') ;
     
     button.set('title', this.get('value')) ;
     button.set('icon', this.get('icon')) ;
   },
   
   /**
     Set the "top" attribute in the prefer matrix property which will position 
     menu such that the selected color swatch in the menu will be place alligned 
     to the swatch on the button when menu is opened.
   */
   changeDropDownPreferMatrix: function() {
     var pxOffset = 0;
     var preferMatrixAttributeTop = 20;
     
     /** 
       Have to fetch the selected menuItem index. Once this is done.
        the menu pane aligment is complete.
     */
     // if(selectedItem) {}
     //   preferMatrixAttributeTop = index * 20;
     
     if(this.get('preferMatrix'))
       this.get('preferMatrix')[1] = -preferMatrixAttributeTop + pxOffset;
   }
}) ;

