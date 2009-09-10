// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class

  Drop Down Menu has a functionality similar to that of SelectField

  Clicking the DropDownMenu button displays a menu pane with a
  list of items. The selected item will be displayed on the button.
  User has the option of enabling checkbox for the selected menu item.

  @extends SC.ButtonView
  @version 1.0
  @author Mohammed Ashik
*/
sc_require('views/button');

SC.DropDownMenu = SC.ButtonView.extend(
/** @scope SC.DropDownMenu.prototype */ {

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
    @default ['drop-down-menu']
  */
  classNames: ['drop-down-menu'],

  /**
    Menu item list

    @property
    @type:{Array}
  */
  itemList: [],

  /**
    Current selected menu item

    @property
    @default null
  */
  currentSelItem: null,

  /**
    Property to set the index of the selected menu item. This in turn
    is used to calculate the preferMatrix.

    @property
    @type {Number}
    @default null
  */
  itemIdx: null,

  /**
     Current Value of the dropDown

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
    Default value of the drop down.
     This will be the first item from the menu item list.

    @private
  */
  _defaultVal: null,

  /**
    Default value of the drop down.
     This will be the title corresponding to the _defaultVal.

    @private
  */
  _defaultTitle: null,

  /**
    Default value of the drop down.
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
  displayProperties: ['icon', 'value','controlSize'],

  /**
    Prefer matrix to position the drop down menu such that the
    selected item for the menu item will appear aligned to the
    the button. The value at the second index(0) changes based on the
    postion(index) of the menu item in the menu pane.

    @property
    @type {Array}
    @default [ 0, 0, 2]

  */
  preferMatrix: null,

  /**
    Width of the sprite image that gets applied due to the theme.
     This has to be accounted for while calculating the actual
     width of the button

    @property
    @type {Number}
    @default 32
  */
  DROP_DOWN_SPRITE_WIDTH: 32,

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
    the objects of this drop down.

    @private
  */
  lastMenuWidth: null,

  /**
    Background color of the icon.This is an optional property.

    @private
  */
  iconBgColor: null,

  /**
    customView used to draw the menu
  */
  customView: null,

  /**
    This is a property for enabling/disabling ellipsis

    @private
    @default YES
  */
  needsEllipsis: YES,

  /**
    Left Alignment based on the size of the button

    @private
  */
  leftAlign: function() {
    var val = 0 ;
    var controlSize = this.get('controlSize') ;
    if(controlSize === SC.SMALL_CONTROL_SIZE) val = -14 ;
    if(controlSize === SC.REGULAR_CONTROL_SIZE) val = -16 ;
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

    var layoutWidth = this.layout.width ;
    if(firstTime && layoutWidth) {
      this.adjust({ width: layoutWidth - this.DROP_DOWN_SPRITE_WIDTH }) ;
    }

    var objects = this.get('objects') ;
    objects = this.sortObjects(objects) ;

    //Get the namekey, iconKey and valueKey set by the user
    var nameKey = this.get('nameKey') ;
    var iconKey = this.get('iconKey') ;
    var valueKey = this.get('valueKey') ;
    var iconBgColorKey = this.get('iconBgColorKey') ;
    var checkboxEnabled = this.get('checkboxEnabled') ;

    //get the current selected value
    var currentSelectedVal = this.get('value') ;

    // get the localization flag.
    var shouldLocalize = this.get('localize') ;

    //itemList array to set the menu items
    var itemList = [] ;

    //to set the 'checkbox' property of menu items
    var isChecked = YES ;

    //index for finding the first item in the list
    var idx = 0 ;

    objects.forEach(function(object) {
    if (object) {

      //Get the name value. If value key is not specified convert obj
      //to string
      var name = nameKey ? (object.get ?
        object.get(nameKey) : object[nameKey]) : object.toString() ;

      // localize name if specified.
      name = shouldLocalize? name.loc() : name ;

      //Get the icon value
      var icon = iconKey ? (object.get ?
        object.get(iconKey) : object[iconKey]) : null ;
      if (SC.none(object[iconKey])) icon = null ;

      // get the value using the valueKey or the object 
      var value = (valueKey) ? (object.get ?
        object.get(valueKey) : object[valueKey]) : object ;

        var iconColor = iconBgColorKey ? (object.get ?
          object.get(iconBgColorKey) : object[iconBgColorKey]) : null ;
        if (SC.none(object[iconBgColorKey])) iconBgColor = null ;

      if (currentSelectedVal && value){
        if( currentSelectedVal === value ) {
          this.set('title', name) ;
          this.set('icon', icon) ;
        }
      }

      //Check if the item is currentSelectedItem or not
      if(name === this.title) {

        //set the itemIdx - To change the prefMatrix accordingly.
        this.set('itemIdx', idx) ;
        isChecked = !checkboxEnabled ? NO : YES ;
      }
      else {
        isChecked = NO ;
      }

      //Set the first item from the list as default selected item
      if (idx === 0) {
        this._defaultVal = value ;
        this._defaultTitle = name ;
        this._defaultIcon = icon ;
      }

      var item = SC.Object.create({
        title: name,
        icon: icon,
        newVal:value,
        isEnabled: YES,
        checkbox: isChecked,
        action: this.displaySelectedItem,
        iconBgColor: iconColor
      }) ;

      //Set the items in the itemList array
      itemList.push(item);
    }

    idx += 1 ;

    this.set('itemList', itemList) ;
    }, this ) ;

    if(firstTime) {
      var value = this.get('value') ;
      if(SC.none(value)) {
        this.set('value', this._defaultVal) ;
        this.set('title', this._defaultTitle) ;
        this.set('icon', this._defaultIcon) ;
      }
    }

    //Set the preference matrix for the menu pane
    this.changeDropDownPreferMatrix(this.itemIdx) ;

    arguments.callee.base.apply(this,arguments) ;
  },

  /**
    renderTitle method

    @private
  */
  renderTitle: function(context, firstTime) {
    var icon = this.get('icon') ;
    var iconBgColor = this.get('iconBgColor') ;
    var image = '' ;
    var title = this.get('displayTitle') ;
    var needsTitle = (!SC.none(title) && title.length>0) ;
    var elem, htmlNode ;

    // get the icon.  If there is an icon, then get the image and update it.
    // if there is no image element yet, create it and insert it just before
    // title.
    if (icon) {
      var blank = sc_static('blank');

      if (iconBgColor) {
        image = '<img src="%@1" alt="" class="%@2" style="background-color: %@3;" />' ;
        if (icon.indexOf('/') >= 0) {
          image = image.fmt(icon, 'icon', iconBgColor) ;
        }
        else {
          image = image.fmt(blank, icon, iconBgColor) ;
        }
      }
      else {
        image = '<img src="%@1" alt="" class="%@2" />' ;
        if (icon.indexOf('/') >= 0) {
          image = image.fmt(icon, 'icon') ;
        }
        else {
          image = image.fmt(blank, icon) ;
        }
      }
      needsTitle = YES ;
    }
    elem = this.$('label');

    if (firstTime) {
      context.push('<label class="sc-button-label">'+image+title+'</label>');
    }
    else if ((htmlNode = elem[0])) {
      if(needsTitle) {
        htmlNode.innerHTML = image + title ;
      }
      else {
        htmlNode.innerHTML = '' ;
      }
    }
    return context ;
  },

  /**
    Button action handler

    @private
    @param {DOMMouseEvent} evt mouseup event that triggered the action
  */
  _action: function( evt )
  {

    var buttonLabel = this.$('.sc-button-label')[0] ;
    var menuWidth = this.get('layer').offsetWidth ; // Get the length of the text on the button in pixels
    var scrollWidth = buttonLabel.scrollWidth ;
    var lastMenuWidth = this.get('lastMenuWidth') ;
    if(scrollWidth) {
       var offsetWidth = buttonLabel.offsetWidth ; // Get the original width of the label in the button
       if(scrollWidth && offsetWidth) {
          menuWidth = menuWidth + scrollWidth - offsetWidth ; //Add the difference of the offset Height and the scrollHeight to the menu width
       }
    }
    if (!lastMenuWidth || (menuWidth > lastMenuWidth)) {
      lastMenuWidth = menuWidth ;
    }
    this.set('lastMenuWidth',lastMenuWidth) ;
    var currSel = this.get('currentSelItem') ;
    var itemList = this.get('itemList') ;
    var menuControlSize = this.get('controlSize') ;

    // get the user defined custom view
    var customView = this.get('customView') ;
    var customMenuView = customView ? customView : SC.MenuItemView ;

    var menu  = SC.MenuPane.create({

      /**
        Class name - drop-down-menu-item

      */
      classNames: ['drop-down-menu'],

      /**
        The menu items are set from the itemList property of DropDownMenu

        @property
      */
      items: itemList,

      /**
        Example view which will be used to create the Menu Items

        @default SC.MenuItemView
        @type SC.View
      */
      exampleView: customMenuView,

      /**
        This property enables all the items and makes them selectable.

        @property
      */
      isEnabled: YES,

      preferType: SC.PICKER_MENU,
      itemHeightKey: 'height',
      layout: { width: lastMenuWidth },
      controlSize: menuControlSize,
      itemWidth: lastMenuWidth,
      contentView: SC.View.extend({
      })
    }) ;

    // no menu to toggle... bail...
    if (!menu) return NO ;
    menu.popup(this, this.preferMatrix) ;
    menu.set('currentSelectedMenuItem', currSel) ;
    return YES ;
  },

  /**
     Action method for the drop down menu items

  */
  displaySelectedItem: function() {

    //Get MenuPane, currentSelectedMenuItem & menuItemView
    var menuView = this.get('parentView') ;
    var currSel = menuView.get('currentSelectedMenuItem') ;
    var itemViews = menuView.menuItemViews ;
    var title,newVal ;

    //  Fetch the index of the current selected item
    var itemIdx = 0 ;
    if (currSel && itemViews) {
      itemIdx = itemViews.indexOf(currSel) ;
    }

    // Get the drop down View
    var button = this.getPath('parentView.anchor') ;

    // set the value and title
    var object = menuView.get('items') ;
    var len = object.length ;
    var found = null ;

    while (!found && (--len >= 0)) {
      title = object[len].title ? object[len].title: object.toString() ;
      newVal =  object[len].newVal ? object[len].newVal: title ;

      if (title === this.get('value')) {
        found = object ;
        button.set('value', newVal) ;
        button.set('title', title) ;
      }
    }

    // set the icon, currentSelectedItem and itemIdx
    button.set('icon', this.get('icon')).set('currentSelItem', currSel).
      set('itemIdx', itemIdx) ;
  },

  /**
     Set the "top" attribute in the prefer matrix property which will
     position menu such that the selected item in the menu will be
     place aligned to the item on the button when menu is opened.
  */
  changeDropDownPreferMatrix: function() {
    var preferMatrixAttributeTop = 0 ;
    var itemIdx = this.get('itemIdx') ;
    var leftAlign = this.get('leftAlign') ;
    var defPreferMatrix ;
    var tempPreferMatrix ;

    if(this.get('isDefaultPosition')) {
      defPreferMatrix = [leftAlign, 4, 3] ;
      this.set('preferMatrix', defPreferMatrix) ;
    }
    else {
      if(itemIdx) {
        preferMatrixAttributeTop = itemIdx * this.CUSTOM_MENU_ITEM_HEIGHT ;
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
  }

}) ;

