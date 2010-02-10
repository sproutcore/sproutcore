// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
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
    Property to set the menu item height. This in turn is used for
    the calculation of prefMatrix.

    @property
    @type {Number}
    @default 20
  */
  CUSTOM_MENU_ITEM_HEIGHT: 20,

  /**
    Binds the button's selection state to the menu's visibility.

    @private
  */
  isSelectedBinding: '*menu.isVisibleInWindow',

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
    Left Alignment based on the size of the button

    @private
  */
  leftAlign: function() {
    var val = 0, controlSize = this.get('controlSize') ;
    if(controlSize === SC.SMALL_CONTROL_SIZE) val = -12 ;
    if(controlSize === SC.REGULAR_CONTROL_SIZE) val = -15 ;
    return val;
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
      itemEnabled = object[isEnabledKey] ;
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
        action: this.displaySelectedItem
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
    this.set('CUSTOM_MENU_ITEM_HEIGHT', this.get('controlSize')===SC.SMALL_CONTROL_SIZE ? 18 : 20);
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
      customMenuView, menu, itemsLength;

    buttonLabel = this.$('.sc-button-label')[0] ;
    // Get the length of the text on the button in pixels
    menuWidth = this.get('layer').offsetWidth ;
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

    var customViewClassName = this.get('customViewClassName') ;
    var customViewMenuOffsetWidth = this.get('customViewMenuOffsetWidth') ;
    var className = 'sc-view sc-pane sc-panel sc-palette sc-picker sc-menu select-button sc-scroll-view sc-menu-scroll-view sc-container-view menuContainer sc-button-view sc-menu-item sc-regular-size' ;
    className = customViewClassName ? (className + ' ' + customViewClassName) : className ;

    for (idx = 0, itemsLength = items.length; idx < itemsLength; ++idx) {
      //getting the width of largest menu item
      item = items.objectAt(idx) ;
      element = document.createElement('div') ;
      element.style.cssText = 'top:-10000px; left: -10000px;  position: absolute;' ;
      element.className = className ;
      element.innerHTML = item.title ;
      document.body.appendChild(element) ;
      elementOffsetWidth = element.offsetWidth + customViewMenuOffsetWidth;

      if (!largestMenuWidth || (elementOffsetWidth > largestMenuWidth)) {
        largestMenuWidth = elementOffsetWidth ;
      }
      document.body.removeChild(element) ;
    }

    lastMenuWidth = (largestMenuWidth > lastMenuWidth) ?
                      largestMenuWidth: lastMenuWidth ;

    // Get the window size width and compare with the lastMenuWidth.
    // If it is greater than windows width then reduce the maxwidth by 25px
    // so that the ellipsis property is enabled by default
    var maxWidth = SC.RootResponder.responder.get('currentWindowSize').width;
    if(lastMenuWidth > maxWidth) {
      lastMenuWidth = (maxWidth - 25) ;
    }

    this.set('lastMenuWidth',lastMenuWidth) ;
    value = this.get('value') ;
    itemList = this.get('itemList') ;
    menuControlSize = this.get('controlSize') ;
    menuHeightPadding = this.get('menuPaneHeightPadding') ;

    // get the user defined custom view
    customView = this.get('customView') ;
    customMenuView = customView ? customView : SC.MenuItemView ;

    menu  = SC.MenuPane.create({

      classNames: ['select-button'],

      items: itemList,

      exampleView: customMenuView,

      isEnabled: YES,

      menuHeightPadding: menuHeightPadding,

      preferType: SC.PICKER_MENU,
      itemHeightKey: 'height',
      layout: { width: lastMenuWidth },
      controlSize: menuControlSize,
      itemWidth: lastMenuWidth,
      itemHeight: this.get('itemHeight') || 20,
      contentView: SC.View.extend({
      })
    }) ;

    // no menu to toggle... bail...
    if (!menu) return NO ;
    menu.set('defaultSelectedItemValue', value) ;
    menu.popup(this, this.preferMatrix) ;
    return YES ;
  },

  /**
     Action method for the select button menu items

  */
  displaySelectedItem: function(menuView) {
    var currentItem = menuView.get('selectedItem');

    this.set('value', currentItem.get('value')) ;
    this.set('title', currentItem.get('title')) ;
    this.set('itemIdx', currentItem.get('contentIndex')) ;
  },

  /**
     Set the "top" attribute in the prefer matrix property which will
     position menu such that the selected item in the menu will be
     place aligned to the item on the button when menu is opened.
  */
  changeSelectButtonPreferMatrix: function() {
    var controlSizeTuning =
      this.get('controlSize')===SC.SMALL_CONTROL_SIZE ? 0 : -2;
    var preferMatrixAttributeTop = controlSizeTuning ,
      itemIdx = this.get('itemIdx') ,
      leftAlign = this.get('leftAlign'), defPreferMatrix, tempPreferMatrix ;

    if(this.get('isDefaultPosition')) {
      defPreferMatrix = [leftAlign, 4, 3] ;
      this.set('preferMatrix', defPreferMatrix) ;
    }
    else {
      if(itemIdx) {
        preferMatrixAttributeTop = itemIdx * this.CUSTOM_MENU_ITEM_HEIGHT +
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
    return YES ;
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
      arguments.callee.base.apply(this,arguments);
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
    return arguments.callee.base.apply(this,arguments);
  },

  /** Function overridden - tied to the isEnabled state */
  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled')

}) ;

