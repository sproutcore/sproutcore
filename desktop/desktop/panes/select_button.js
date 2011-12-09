// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  SelectButtonView has a functionality similar to that of SelectField

  Clicking the SelectButtonView button displays a menu pane with a
  list of items. The selected item will be displayed on the button.
  User has the option of enabling checkbox for the selected menu item.

  @extends SC.ButtonView
  @version 1.0
  @author Mohammed Ashik
*/
sc_require('views/button');

SC.SelectButtonView = SC.ButtonView.extend(
/** @scope SC.SelectButtonView.prototype */ {

  escapeHTML: YES,

  /**
    An array of items that will be form the menu you want to show.

    @property
    @type {Array}
  */
  objects: [],

  /**
    Binding default for an array of objects

    @property
    @default SC.Binding.multiple()
  */
  objectsBindingDefault: SC.Binding.multiple(),

  /**
    If you set this to a non-null value, then the name shown for each
    menu item will be pulled from the object using the named property.
    if this is null, the collection objects themselves will be used.

    @property
    @type {String}
    @default: null
  */
  nameKey: null,

  /**
    If you set this to a non-null value, then the value of this key will
    be used to sort the objects.  If this is not set, then nameKey will
    be used.

    @property
    @type: {String}
    @default: null
  */
  sortKey: null,

  /**
     Set this to a non-null value to use a key from the passed set of objects
     as the value for the options popup.  If you don't set this, then the
     objects themselves will be used as the value.

     @property
     @type {String}
     @default null
  */
  valueKey: null,

  /**
     Key used to extract icons from the objects array
  */
  iconKey: null,

  /**
    Key used to indicate if the item is to be enabled
   */
  isEnabledKey: "isEnabled",

  /**
    If true, the empty name will be localized.

    @property
    @type {Boolean}
    @default YES
  */
  localize: YES,

  /**
    if true, it means that no sorting will occur, objects will appear
    in the same order as in the array

    @property
    @type {Boolean}
    @default YES
  */
  disableSort: YES,

  /**

    @property
    @default ['select-button']
  */
  classNames: ['select-button'],

  /**
    Menu attached to the selectButton
    @default SC.MenuView
  */
  menu : null,

  /**
    Menu item list

    @property
    @type:{Array}
  */
  itemList: [],

  /**
    Property to set the index of the selected menu item. This in turn
    is used to calculate the preferMatrix.

    @property
    @type {Number}
    @default null
  */
  itemIdx: null,

  /**
     Current Value of the selectButton

     @property
     @default null
  */
  value: null ,

  /**
    if this property is set to 'YES', a checbox is shown next to the
    selected menu item.

    @private
    @default YES
  */
  checkboxEnabled: YES,

  /**
    Set this property to required display positon of separtor from bottom

    @private
    @default null
  */
  separatorPostion: null,

  /**
    Default value of the select button.
     This will be the first item from the menu item list.

    @private
  */
  _defaultVal: null,

  /**
    Default title of the select button.
     This will be the title corresponding to the _defaultVal.

    @private
  */
  _defaultTitle: null,

  /**
    Default icon of the select button.
     This will be the icon corresponding to the _defaultVal.

    @private
  */
  _defaultIcon: null,

  /**
    @private

    The button theme will be popup
  */
  theme: 'popup',

  /**
    Render method gets triggered when these properties change

    @property
    @type{SC.Array}
  */
  displayProperties: ['icon', 'value','controlSize','objects'],

  /**
    Prefer matrix to position the select button menu such that the
    selected item for the menu item will appear aligned to the
    the button. The value at the second index(0) changes based on the
    postion(index) of the menu item in the menu pane.

    @property
    @type {Array}
    @default null

  */
  preferMatrix: null,

  /**
    Width of the sprite image that gets applied due to the theme.
     This has to be accounted for while calculating the actual
     width of the button

    @property
    @type {Number}
    @default 28
  */
  SELECT_BUTTON_SPRITE_WIDTH: 28,

  /**
    Binds the select button's active state to the visibility of its menu.
  */
  isActiveBinding: '*menu.isVisibleInWindow',

  /**
    If this property is set to 'YES', the menu pane will be positioned
    below the anchor.

    @private
    @default NO
  */
  isDefaultPosition: NO,

  /**
    lastMenuWidth is the width of the last menu which was created from
    the objects of this select button.

    @private
  */
  lastMenuWidth: null,

  /**
    customView used to draw the menu
  */
  customView: null,

  /**
    css classes applied to customView
  */
  customViewClassName: null,

  /**
    customView menu offset width
  */
  customViewMenuOffsetWidth: 0,

  /**
    This is a property for enabling/disabling ellipsis

    @private
    @default YES
  */
  needsEllipsis: YES,

  /**
    This property allows you at add extra padding to the height
    of the menu pane.

    @default 0
    @property {Number} heightPadding for menu pane.
  */
  menuPaneHeightPadding: 0,

  /**
    This is a property to enable/disable focus rings in buttons.
    For select_button we are making it a default.

    @default YES
  */
  supportFocusRing: YES,
  
  /**
    Disable context menu.
  */
  isContextMenuEnabled: NO,
  

  /**
    Left Alignment based on the size of the button

    @private
  */
  leftAlign: function() {
    switch (this.get('controlSize')) {
      case SC.TINY_CONTROL_SIZE:
        return SC.SelectButtonView.TINY_OFFSET_X;
      case SC.SMALL_CONTROL_SIZE:
        return SC.SelectButtonView.SMALL_OFFSET_X;
      case SC.REGULAR_CONTROL_SIZE:
        return SC.SelectButtonView.REGULAR_OFFSET_X;
      case SC.LARGE_CONTROL_SIZE:
        return SC.SelectButtonView.LARGE_OFFSET_X;
      case SC.HUGE_CONTROL_SIZE:
        return SC.SelectButtonView.HUGE_OFFSET_X;
    }
    return 0;
  }.property('controlSize'),

  /**
    override this method to implement your own sorting of the menu. By
    default, menu items are sorted using the value shown or the sortKey

    @param{SC.Array} objects the unsorted array of objects to display.
    @returns sorted array of objects
  */
  sortObjects: function(objects) {
    if(!this.get('disableSort')){
      var nameKey = this.get('sortKey') || this.get('nameKey') ;
      objects = objects.sort(function(a,b) {
        if (nameKey) {
          a = a.get ? a.get(nameKey) : a[nameKey] ;
          b = b.get ? b.get(nameKey) : b[nameKey] ;
        }
        return (a<b) ? -1 : ((a>b) ? 1 : 0) ;
      }) ;
    }
    return objects ;
  },

  /**
    render method

    @private
  */
  render: function(context,firstTime) {
    sc_super();
    var layoutWidth, objects, len, nameKey, iconKey, valueKey, checkboxEnabled,
      currentSelectedVal, shouldLocalize, separatorPostion, itemList, isChecked,
      idx, name, icon, value, item, itemEnabled, isEnabledKey ;
    layoutWidth = this.layout.width ;
    if(firstTime && layoutWidth) {
      this.adjust({ width: layoutWidth - this.SELECT_BUTTON_SPRITE_WIDTH }) ;
    }

    objects = this.get('objects') ;
    objects = this.sortObjects(objects) ;
    len = objects.length ;

    //Get the namekey, iconKey and valueKey set by the user
    nameKey = this.get('nameKey') ;
    iconKey = this.get('iconKey') ;
    valueKey = this.get('valueKey') ;
    isEnabledKey = this.get('isEnabledKey') ;
    checkboxEnabled = this.get('checkboxEnabled') ;

    //get the current selected value
    currentSelectedVal = this.get('value') ;

    // get the localization flag.
    shouldLocalize = this.get('localize') ;

    //get the separatorPostion
    separatorPostion = this.get('separatorPostion') ;

    //itemList array to set the menu items
    itemList = [] ;

    //to set the 'checkbox' property of menu items
    isChecked = YES ;

    //index for finding the first item in the list
    idx = 0 ;

    objects.forEach(function(object) {
    if (object) {

      //Get the name value. If value key is not specified convert obj
      //to string
      name = nameKey ? (object.get ?
        object.get(nameKey) : object[nameKey]) : object.toString() ;

      // localize name if specified.
      name = shouldLocalize? name.loc() : name ;

      //Get the icon value
      icon = iconKey ? (object.get ?
        object.get(iconKey) : object[iconKey]) : null ;
      if (SC.none(object[iconKey])) icon = null ;

      // get the value using the valueKey or the object
        value = (valueKey) ? (object.get ?
        object.get(valueKey) : object[valueKey]) : object ;

      if (!SC.none(currentSelectedVal) && !SC.none(value)){
        if( currentSelectedVal === value ) {
          this.set('title', name) ;
          this.set('icon', icon) ;
        }
      }

      //Check if the item is currentSelectedItem or not
      if(value === this.get('value')) {

        //set the itemIdx - To change the prefMatrix accordingly.
        this.set('itemIdx', idx) ;
        isChecked = !checkboxEnabled ? NO : YES ;
      }
      else {
        isChecked = NO ;
      }

      //Check if item is enabled
      itemEnabled = (isEnabledKey) ? (object.get ?
      object.get(isEnabledKey) : object[isEnabledKey]) : object ;
      
      if(NO !== itemEnabled) itemEnabled = YES ;

      //Set the first item from the list as default selected item
      if (idx === 0) {
        this._defaultVal = value ;
        this._defaultTitle = name ;
        this._defaultIcon = icon ;
      }

      var item = SC.Object.create({
        title: name,
        icon: icon,
        value: value,
        isEnabled: itemEnabled,
        checkbox: isChecked,
        target: this,
        action: 'displaySelectedItem'
      }) ;

      //Set the items in the itemList array
      itemList.push(item);
    }

    idx += 1 ;

    // display the separator if specified by the user
    if (separatorPostion && idx === (len-separatorPostion)) {
      var separator = SC.Object.create({
        separator: YES
      }) ;
      itemList.push(separator);
    }

    this.set('itemList', itemList) ;
    }, this ) ;

    if(firstTime) {
      this.invokeLast(function() {
        var value = this.get('value') ;
        if(SC.none(value)) {
          this.set('value', this._defaultVal) ;
          this.set('title', this._defaultTitle) ;
          this.set('icon', this._defaultIcon) ;
        }
      });
    }

    //Set the preference matrix for the menu pane
    this.changeSelectButtonPreferMatrix(this.itemIdx) ;

  },

  /**
    Button action handler

    @private
    @param {DOMMouseEvent} evt mouseup event that triggered the action
  */
  _action: function( evt )
  {
    var buttonLabel, menuWidth, scrollWidth, lastMenuWidth, offsetWidth,
      items, elementOffsetWidth, largestMenuWidth, item, element, idx,
      value, itemList, menuControlSize, menuHeightPadding, customView,
      customMenuView, menu, itemsLength, dummyMenuItemView, 
      menuItemViewEscapeHTML, menuWidthOffset, body;

    buttonLabel = this.$('.sc-button-label')[0] ;

    menuWidthOffset = SC.SelectButtonView.MENU_WIDTH_OFFSET ;
    if(!this.get('isDefaultPosition')) {
      switch (this.get('controlSize')) {
        case SC.TINY_CONTROL_SIZE:
          menuWidthOffset += SC.SelectButtonView.TINY_POPUP_MENU_WIDTH_OFFSET;
          break;
        case SC.SMALL_CONTROL_SIZE:
          menuWidthOffset += SC.SelectButtonView.SMALL_POPUP_MENU_WIDTH_OFFSET;
          break;
        case SC.REGULAR_CONTROL_SIZE:
          menuWidthOffset += SC.SelectButtonView.REGULAR_POPUP_MENU_WIDTH_OFFSET;
          break;
        case SC.LARGE_CONTROL_SIZE:
          menuWidthOffset += SC.SelectButtonView.LARGE_POPUP_MENU_WIDTH_OFFSET;
          break;
        case SC.HUGE_CONTROL_SIZE:
          menuWidthOffset += SC.SelectButtonView.HUGE_POPUP_MENU_WIDTH_OFFSET;
          break;
      }
    }
    // Get the length of the text on the button in pixels
    menuWidth = this.get('layer').offsetWidth + menuWidthOffset ;
    scrollWidth = buttonLabel.scrollWidth ;
    lastMenuWidth = this.get('lastMenuWidth') ;
    if(scrollWidth) {
       // Get the original width of the label in the button
       offsetWidth = buttonLabel.offsetWidth ;
       if(scrollWidth && offsetWidth) {
          menuWidth = menuWidth + scrollWidth - offsetWidth ;
       }
    }
    if (!lastMenuWidth || (menuWidth > lastMenuWidth)) {
      lastMenuWidth = menuWidth ;
    }

    items = this.get('itemList') ;

    var customViewClassName = this.get('customViewClassName'),
        customViewMenuOffsetWidth = this.get('customViewMenuOffsetWidth'),
        className = 'sc-view sc-pane sc-panel sc-palette sc-picker sc-menu select-button sc-scroll-view sc-menu-scroll-view sc-container-view menuContainer sc-button-view sc-menu-item sc-regular-size' ;
    className = customViewClassName ? (className + ' ' + customViewClassName) : className ;

    dummyMenuItemView = (this.get('customView') || SC.MenuItemView).create(); 
    menuItemViewEscapeHTML = dummyMenuItemView.get('escapeHTML') ;
    var body = document.body;
    for (idx = 0, itemsLength = items.length; idx < itemsLength; ++idx) {
      //getting the width of largest menu item
      item = items.objectAt(idx) ;
      element = document.createElement('div') ;
      element.style.cssText = 'top:-10000px; left: -10000px;  position: absolute;' ;
      element.className = className ;
      element.innerHTML = menuItemViewEscapeHTML ? SC.RenderContext.escapeHTML(item.title) : item.title ;
      body.appendChild(element) ;
      elementOffsetWidth = element.offsetWidth + customViewMenuOffsetWidth;

      if (!largestMenuWidth || (elementOffsetWidth > largestMenuWidth)) {
        largestMenuWidth = elementOffsetWidth ;
      }
      body.removeChild(element) ;
    }
    largestMenuWidth = (largestMenuWidth > lastMenuWidth) ?
                      largestMenuWidth: lastMenuWidth ;

    // Get the window size width and compare with the lastMenuWidth.
    // If it is greater than windows width then reduce the maxwidth by 25px
    // so that the ellipsis property is enabled by default
    var maxWidth = SC.RootResponder.responder.get('currentWindowSize').width;
    if(largestMenuWidth > maxWidth) {
      largestMenuWidth = (maxWidth - 25) ;
    }

    this.set('lastMenuWidth',lastMenuWidth) ;
    value = this.get('value') ;
    itemList = this.get('itemList') ;
    menuControlSize = this.get('controlSize') ;

    // get the user defined custom view
    customView = this.get('customView') ;
    customMenuView = customView ? customView : SC.MenuItemView ;

    menu  = SC.MenuPane.create({

      classNames: ['select-button'],

      items: itemList,

      exampleView: customMenuView,

      isEnabled: YES,
      preferType: SC.PICKER_MENU,
      itemHeightKey: 'height',
      layout: { width: largestMenuWidth },
      controlSize: menuControlSize,
      itemWidth: lastMenuWidth,

      /**
        PerformKeyEquivalent, for handling tab and shift + tab
        Prevents the focus going to next fields when menu is open and you tab

        @param {String} keystring
        @param {SC.Event} evt
        @returns {Boolean}  YES if handled
      */

      performKeyEquivalent: function( keystring, evt ) {
        switch (keystring) {
          case 'tab':
          case 'shift_tab':
            return YES ;
          default:
            return sc_super() ;
        }
      }
    }) ;

    // no menu to toggle... bail...
    if (!menu) return NO ;
    menu.popup(this, this.preferMatrix) ;
    this.set('menu', menu);

    customView = menu.menuItemViewForContentIndex(this.get('itemIdx'));
    menu.set('currentMenuItem', customView) ;
    if (customView) customView.becomeFirstResponder();

    this.set('isActive', YES);
    return YES ;
  },

  /**
     Action method for the select button menu items

  */
  displaySelectedItem: function(menuView) {
    var currentItem = this.getPath('menu.selectedItem');
    if (!currentItem) return NO;

    this.set('value', currentItem.get('value')) ;
    this.set('title', currentItem.get('title')) ;
    this.set('itemIdx', currentItem.get('contentIndex')) ;

    return YES;
  },

  /**
     Set the "top" attribute in the prefer matrix property which will
     position menu such that the selected item in the menu will be
     place aligned to the item on the button when menu is opened.
  */
  changeSelectButtonPreferMatrix: function() {
    var controlSizeTuning = 0, customMenuItemHeight = 0 ;
    switch (this.get('controlSize')) {
      case SC.TINY_CONTROL_SIZE:
        controlSizeTuning = SC.SelectButtonView.TINY_OFFSET_Y;
        customMenuItemHeight = SC.MenuPane.TINY_MENU_ITEM_HEIGHT;
        break;
      case SC.SMALL_CONTROL_SIZE:
        controlSizeTuning = SC.SelectButtonView.SMALL_OFFSET_Y;
        customMenuItemHeight = SC.MenuPane.SMALL_MENU_ITEM_HEIGHT;
        break;
      case SC.REGULAR_CONTROL_SIZE:
        controlSizeTuning = SC.SelectButtonView.REGULAR_OFFSET_Y;
        customMenuItemHeight = SC.MenuPane.REGULAR_MENU_ITEM_HEIGHT;
        break;
      case SC.LARGE_CONTROL_SIZE:
        controlSizeTuning = SC.SelectButtonView.LARGE_OFFSET_Y;
        customMenuItemHeight = SC.MenuPane.LARGE_MENU_ITEM_HEIGHT;
        break;
      case SC.HUGE_CONTROL_SIZE:
        controlSizeTuning = SC.SelectButtonView.HUGE_OFFSET_Y;
        customMenuItemHeight = SC.MenuPane.HUGE_MENU_ITEM_HEIGHT;
        break;
    }

    var preferMatrixAttributeTop = controlSizeTuning ,
        itemIdx = this.get('itemIdx') ,
        leftAlign = this.get('leftAlign'), defPreferMatrix, tempPreferMatrix ;

    if(this.get('isDefaultPosition')) {
      defPreferMatrix = [1, 0, 3] ;
      this.set('preferMatrix', defPreferMatrix) ;
    }
    else {
      if(itemIdx) {
        preferMatrixAttributeTop = itemIdx * customMenuItemHeight +
          controlSizeTuning ;
      }
      tempPreferMatrix = [leftAlign, -preferMatrixAttributeTop, 2] ;
      this.set('preferMatrix', tempPreferMatrix) ;
    }
  },

  /**
    @private

    Holding down the button should display the menu pane.
  */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES ; // handled event, but do nothing
    this.set('isActive', YES);
    this._isMouseDown = YES;
    this.becomeFirstResponder() ;
    this._action() ;

    // Store the current timestamp. We register the timestamp at the end of
    // the runloop so that the menu has been rendered, in case that operation
    // takes more than a few hundred milliseconds.

    // One mouseUp, we'll use this value to determine how long the mouse was
    // pressed.
    this.invokeLast(this._recordMouseDownTimestamp);
    return YES ;
  },

  /** @private
    Records the current timestamp. This is invoked at the end of the runloop
    by mouseDown. We use this value to determine the delay between mouseDown
    and mouseUp.
  */
  _recordMouseDownTimestamp: function() {
    this._menuRenderedTimestamp = new Date().getTime();
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
    var timestamp = new Date().getTime(),
        previousTimestamp = this._menuRenderedTimestamp,
        menu = this.get('menu'),
        touch = SC.platform.touch,
        targetMenuItem;

    if (menu) {
      targetMenuItem = menu.getPath('rootMenu.targetMenuItem');

      if (targetMenuItem && targetMenuItem.get('mouseHasEntered')) {
        // Have the menu item perform its action.
        // If the menu returns NO, it had no action to
        // perform, so we should close the menu immediately.
        if (!targetMenuItem.performAction()) menu.remove();
      } else if (!touch && (timestamp - previousTimestamp > SC.ButtonView.CLICK_AND_HOLD_DELAY)) {
        // If the user waits more than a certain length of time between
        // mouseDown and mouseUp, we can assume that they are clicking and
        // dragging to the menu item, and we should close the menu if they
        // mouseup anywhere not inside the menu.

        // As a special case, we should trigger an action on the currently
        // selected menu item if the menu item is under the mouse and the user
        // never moved their mouse before mouseup.
        if (!menu.get('mouseHasEntered') && !this.get('isDefaultPosition')) {
          targetMenuItem = menu.get('currentMenuItem');
          if (targetMenuItem && !targetMenuItem.performAction()) {
            menu.remove();
          }
        } else {
          // Otherwise, just remove the menu because no selection
          // has been made.
          menu.remove();
        }
      }
    }


    // Reset state.
    this._isMouseDown = NO;
    return YES;
  },

  /**
    Override mouseExited to not remove the active state on mouseexit.
  */
  mouseExited: function() {
    return YES;
  },

  /**
    @private

    Handle Key event - Down arrow key
  */
  keyDown: function(event) {
    if ( this.interpretKeyEvents(event) ) {
      return YES;
    }
    else {
      return sc_super();
    }
  },

  /**
    @private

    Pressing the Up or Down arrow key should display the menu pane
  */
  interpretKeyEvents: function(event) {
    if (event) {
      if ((event.keyCode === 38 || event.keyCode === 40)) {
        this._action() ;
      }
      else if (event.keyCode === 27) {
        this.resignFirstResponder() ;
      }
    }
    return sc_super();
  },

  /** Function overridden - tied to the isEnabled state */
  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled'),

  /** @private
    Override the button isSelectedDidChange function in order to not perform any action
    on selecting the select_button
  */
  _button_isSelectedDidChange: function() {

  }.observes('isSelected'),
  
  didAppendToDocument: function() {
  }

}) ;

/**
  Default metrics for the different control sizes.
*/
SC.SelectButtonView.TINY_OFFSET_X = 0;
SC.SelectButtonView.TINY_OFFSET_Y = 0;
SC.SelectButtonView.TINY_POPUP_MENU_WIDTH_OFFSET = 0;

SC.SelectButtonView.SMALL_OFFSET_X = -18;
SC.SelectButtonView.SMALL_OFFSET_Y = 3;
SC.SelectButtonView.SMALL_POPUP_MENU_WIDTH_OFFSET = 7;

SC.SelectButtonView.REGULAR_OFFSET_X = -17;
SC.SelectButtonView.REGULAR_OFFSET_Y = 3;
SC.SelectButtonView.REGULAR_POPUP_MENU_WIDTH_OFFSET = 4;

SC.SelectButtonView.LARGE_OFFSET_X = -17;
SC.SelectButtonView.LARGE_OFFSET_Y = 6;
SC.SelectButtonView.LARGE_POPUP_MENU_WIDTH_OFFSET = 3;

SC.SelectButtonView.HUGE_OFFSET_X = 0;
SC.SelectButtonView.HUGE_OFFSET_Y = 0;
SC.SelectButtonView.HUGE_POPUP_MENU_WIDTH_OFFSET = 0;

SC.SelectButtonView.MENU_WIDTH_OFFSET = -2;
