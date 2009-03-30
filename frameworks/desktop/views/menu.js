// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/**
  @class
  @extends SC.View
  @since SproutCore 1.0
*/
require('views/picker_pane');
require('views/menu_item');

SC.MenuView = SC.PickerPane.extend(SC.Control, {
  /** @scope SC.MenuItemView.prototype */
  classNames: ['sc-menu-view'],

  tagName:'div',

  /**
    Set to YES to enabled the menu view, NO to disabled it.
  */
  isEnabled: YES,

  /**
    The key that explains whether each item is Enabled. If omitted, no icons will
    be displayed.

    @type String
  */
  itemIsEnabledKey:YES,
  
  /**
    The key that contains the title for each item.  If omitted, no icons will
     be displayed.

    @type String
  */
  itemTitleKey: null,

  /**
    The array of items to display.  This can be a simple array of strings,
    objects or hashes.  If you pass objects or hashes, you must also set the
    various itemKey properties to tell the MenuView how to extract the
    information it needs.

    @type String
  */ 
  items: [],

  /** 
    The key that contains the value for each item.  If omitted, no icons will
    be displayed.

    @type String
  */
  itemValueKey: null,

  /** 
    The key that contains the icon for each item.  If omitted, no icons will
    be displayed.

    @type String
  */
  itemIconKey: null,

  /** 
    The width for each menu item and ultimately the menu itself.

    @type String
  */
  itemWidth: null,

  /** 
    The height of the menu and ultimately the menu itself.

    @type Integer
  */
  menuHeight: null,
  
  /** 
    The height for each menu item and ultimately the menu itself.

    @type Integer
  */
  itemHeight: null,

  /**
    If YES, titles will be localized before display.
  */
  localize: YES,

  /** 
    This key defined which key represents Separator.

    @type Boolean
  */  
  itemSeparator: NO,

  /** 
    This key is need to assign an action to the menu item.

    @type Function
  */
  itemAction: null,

  /** 
    The key for setting a checkbox for the menu item.

    @type String
  */
  itemCheckboxKey: null,

  /** 
    The key for setting a branch for the menu item.

    @type String
  */
  itemBranchKey:null,
  
  /** 
    The key for setting a branch for the menu item.

    @type String
  */
  itemShortCutKey:null,
  
  /** 
    The key for setting Key Equivalent for the menu item.

    @type String
  */
  itemKeyEquivalent:null,
  
  /** 
    Define whether this pane is the Key Pane.

    @type String
  */
  isKeyPane: YES,

  /**
    Panel type
    
    @type String
  */
  preferType:SC.PICKER_MENU,

  
  /**
    The array of itemKeys that will be searched to build the displayItems
    array.  This is used internally by the class.  You will not generally
    need to access or edit this array.

    @property {Array}
  */
  itemKeys: 'itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemSeparator itemAction itemCheckboxKey itemShortCutKey itemBranchKey itemHeight subMenuKey itemKeyEquivalent'.w(),

  /**
    Define the current Selected Menu Item.
    type SC.MenuItemView
  */
  currentItemSelected : null,

  /**
    The final layout for the inside content View
    type Array
  */
  layoutShadow: {},
  
  /**
    Overwrite the popup function of the pickerPane
  */
  popup: function(anchorViewOrElement, preferMatrix) {
    this.set('anchorElement',anchorViewOrElement.get('layer')) ;
    this.set('preferType',SC.PICKER_MENU) ;
    if(preferMatrix) this.set('preferMatrix',preferMatrix) ;
    this.positionPane() ;
    this.append() ;
  },
  
  /**
    This computed property is generated from the items array
  */
  displayItems: function() {
    var items = this.get('items') ;
    var loc = this.get('localize') ;
    var keys = null,itemType, cur ;
    var ret = [] ;
    var max = items.get('length') ;
    var idx, item ;
    var fetchKeys = SC._menu_fetchKeys ;
    var fetchItem = SC._menu_fetchItem ;
    var menuHeight = this.menuHeight||0 ;
    // loop through items and collect data
    for (idx = 0; idx < max; idx++) {
      item = items.objectAt(idx) ;
      if (SC.none(item)) continue ; // skip is null or undefined
      // if the item is a string, build the array using defaults...
      itemType = SC.typeOf(item) ;

      if (itemType === SC.T_STRING) {
        ret[ret.length] = { title:item.humanize().titleize(), value:item,
                            isEnabled:YES, icon:null,
                            isSeparator:null, action:null, isCheckbox:NO,
                            menuItemNumber:idx, isShortCut:NO, isBranch:NO 
                           } ;
         this.menuHeight = this.menuHeight+20 ;
      // if the item is not an array, try to use the itemKeys.
      } else if (itemType !== SC.T_ARRAY) {
        // get the itemKeys the first time
        if (keys === null) {
          keys = this.itemKeys.map(fetchKeys, this) ;
        }
        cur = keys.map(fetchItem, item) ;
        cur[cur.length] = idx ; // save current index

        // special case 1...if title key is null, try to make into string
        if (!keys[0] && item.toString) cur[0] = item.toString() ;

        // special case 2...if value key is null, use item itself
        if (!keys[1]) cur[1] = item ;
        // special case 3...if isEnabled is null, default to yes.
        if (!keys[2]) cur[2] = YES ;
        if(!cur[9])  cur[9] = 20 ; // set default height
        if(cur[4]) cur[9] = 5 ; // if separator set height to 5px

        this.menuHeight = this.menuHeight+cur[9] ;
        // add to return array
        if (loc && cur[0]) cur[0] = cur[0].loc() ;

        ret[ret.length] = { title:cur[0], value:cur[1], isEnabled:cur[2],
                          icon:cur[3], isSeparator:cur[4], action:cur[5],
                          isCheckbox:cur[6], isShortCut:cur[7],
                          menuItemNumber:cur[9], isBranch:cur[8],
                          itemHeight:cur[9],
                          subMenu:cur[10],
                          keyEquivalent:cur[11] } ;
      }
    }
    return ret;
  }.property('items').cacheable(),

  /** If the items array itself changes, add/remove observer on item... */
  itemsDidChange: function() {
    if (this._items) {
      this._items.removeObserver('[]', this, this.itemContentDidChange) ;
    }
    this._items = this.get('items') ;
    if (this._items) {
      this._items.addObserver('[]', this, this.itemContentDidChange) ;
    }
    this.itemContentDidChange() ;
  }.observes('items'),

  /** 
    Invoked whenever the item array or an item in the array is changed.  This method will reginerate the list of items.
  */
  itemContentDidChange: function() {
    this.notifyPropertyChange('displayItems') ;
  },

  /**
    Init function
  */
  init: function() {
    sc_super() ;
    this.itemsDidChange() ;
  },

  // ..........................................................
  // RENDERING/DISPLAY SUPPORT
  // 
  displayProperties: ['displayItems', 'value'],

  /**
    The render function which depends on the displayItems and value
  */
  render: function(context, firstTime) {
    // collect some data 
    var items = this.get('displayItems') ;

    // regenerate the buttons only if the new display items differs from the
    // last cached version of it needsFirstDisplay is YES.
    var last = this._menu_displayItems ;
    var parentView = this.parentView ;
    if (firstTime || (items !== last)) {
      if(!this.get('isEnabled')) return ;
      var s=this.contentView.get('layoutShadow') ;
      var ss='' ;
      for(var key in s) {
        var value = s[key] ;
        if(key === "height" && this.menuHeight) value = this.menuHeight ;
        if (value!==null) {
          ss=ss+key+' : '+value+'px; ';
        }
      }
      if(ss.length>0) context.push("<div style='position:absolute;"+ss+"'>") ;
      this._menu_displayItems = items ; // save for future
      context.addStyle('text-align', 'center') ;
      if (this.itemWidth === undefined || this.itemWidth === null) {
        this.itemWidth = this.get('contentView').get('layout').width || 
        ((this.parentView!==null && this.parentView!==undefined)?this.parentView.get('layout').width:100) ;
      }
      this.renderChildren(context,items) ;
      context.push("<div class='top-left-edge'></div>") ;
      context.push("<div class='top-edge'></div>") ;
      context.push("<div class='top-right-edge'></div>") ;
      context.push("<div class='right-edge'></div>") ;
      context.push("<div class='bottom-right-edge'></div>") ;
      context.push("<div class='bottom-edge'></div>") ;
      context.push("<div class='bottom-left-edge'></div>") ;
      context.push("<div class='left-edge'></div>") ;
      context.push("</div>") ;
     } 
  },

  /**
    Actually generates the menu HTML for the display items.  This method 
    is called the first time a view is constructed and any time the display
    items change thereafter.  This will construct the HTML but will not set
    any "transient" states such as the global isEnabled property or selection.
  */
  renderChildren: function(context,items) {
    if(!this.isEnabled) return ;
    var len = items.length ;
    var content = SC.makeArray(items) ;
    for (var i = 0; i < len; i++) {
      if(!items[i]|| items[i].length===0) continue ;
    var itemTitle = items[i]['title'] ;
    var itemValue = items[i]['value'] ;
    var itemIsEnabled = items[i]['isEnabled'] ;
    var itemIcon = items[i]['icon'] ;
    var isSeparator = items[i]['isSeparator'] ;
    var itemAction = items[i]['action'] ;
    var isCheckbox = items[i]['isCheckbox'] ;
    var menuItemNumber = items[i]['menuItemNumber'] ;
    var isShortCut = items[i]['isShortCut'] ;
    var isBranch   = items[i]['isBranch'] ;
    var itemSubMenu = items[i]['subMenu'] ;
    var itemHeight = items[i]['itemHeight'] || 20 ;
    var itemKeyEquivalent = items[i]['keyEquivalent'] ;
        var itemView = this.createChildView(
        SC.MenuItemView, {
          owner : itemView,
          displayDelegate : itemView,
          parentView : this,
          isVisible : YES,
          contentValueKey : 'title',
          contentIconKey : 'icon',
          contentCheckboxKey : 'checkbox',
          contentIsBranchKey :'branchItem',  
          isEnabledKey :'isEnabled',
          isSeparator : 'separator',
          shortCutKey :'shortCut',  
          action : 'action',
          layout : { top:0, left:0, width:this.itemWidth, height:itemHeight, centerX:0, centerY:0},
          isEnabled : itemIsEnabled,
          itemHeight : itemHeight,
          itemWidth : this.itemWidth,
          keyEquivalent : itemKeyEquivalent,
          content : SC.Object.create({
          title : itemTitle,
          value : itemValue,
          icon : itemIcon,
          separator : isSeparator,
          action : itemAction,
          checkbox : isCheckbox,
          shortCut : isShortCut,
          branchItem : isBranch,
          subMenu : itemSubMenu
        }),
        rootElementPath : [menuItemNumber]
      });
      context = context.begin(itemView.get('tagName')) ;
      itemView.prepareContext(context, YES) ;
      context = context.end() ;
    }
  },
  
  //..........................................................
  // mouseEvents and keyBoard Events handling
  //..........................................................
  
  moveUp:function(sender,evt) {
    //console.log('%@.%@'.fmt(this,evt.toString()));
    return YES ;
  },

  moveDown:function(sender,evt) {
    //console.log('%@.%@'.fmt(this,evt.toString()));
    return YES ;
  },
  
  mouseUp:function(evt) {
    var f=this.contentView.get("frame");
    if(!this.clickInside(f, evt)) this.remove();
    return NO;
  },
  
  mouseEntered:function(evt) {
    //console.log('%@.%@'.fmt(this,evt.toString()));
    var parentView = this.get('parentView') ;
    if(parentView && parentView.kindOf(SC.MenuItemView)) {
      return NO;
    }
  },
  
  /**
    Perform actions equivalent for the keyBoard Shortcuts
    @param {String} keystring
    @param {SC.Event} evt
    @returns {Boolean}  YES if handled, NO otherwise
  */
  performKeyEquivalent:function(keyString,evt) {
    if(!this.isEnabled) return YES ;
    var len = this.items.length ;
    for(var i=0;i<len;i++) {
      var keyEquivalent = this.items[i]['keyEquivalent'];
      var action = this.items[i]['action'] ;
      var isEnabled = items[i]['isEnabled'] ;
      if(keyEquivalent == keyString && isEnabled) {
        return this.performAction(this,action) ;
      }
    }
    return YES ;
  },
  
  /**
    Actually fires the action.Pass the target and action to
    the function.
    @param {Object} target
    @returns {function,string} action  
  */
  performAction: function(target,action) {
    var typeOfAction = SC.typeOf(action) ;
    
    // if the action is a function, just try to call it.
    if (typeOfAction == SC.T_FUNCTION) {
      action.call((target || this), this) ;

    // otherwise, action should be a string.  If it has a period, treat it
    // like a property path.
    } else if (typeOfAction === SC.T_STRING) {
      if (action.indexOf('.') >= 0) {
        var path = action.split('.') ;
        var property = path.pop() ;

        var newTarget = SC.objectForPropertyPath(path, window) ;
        var newAction = target.get ? target.get(property) : target[property] ;
        if (newAction && SC.typeOf(newAction) == SC.T_FUNCTION) {
          newAction.call(newTarget, this) ;
        } else {
          throw '%@: Menu could not find a function at %@'.fmt(this, this.action) ;
        }

      // otherwise, try to execute action direction on target or send down
      // responder chain.
      } else {
        SC.RootResponder.responder.sendAction(this.action, this.target, this) ;
      }
    }
  }
  
});

SC._menu_fetchKeys = function(k) {
  return this.get(k) ;
};
SC._menu_fetchItem = function(k) {
  if (!k) return null ;
  return this.get ? this.get(k) : this[k] ;
};
