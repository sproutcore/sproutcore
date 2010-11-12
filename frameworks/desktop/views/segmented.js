// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  SegmentedView is a special type of button that can display multiple
  segments.  Each segment has a value assigned to it.  When the user clicks
  on the segment, the value of that segment will become the new value of 
  the control.
  
  You can also optionally configure a target/action that will fire whenever
  the user clicks on an item.  This will give your code an opportunity to take
  some action depending on the new value.  (of course, you can always bind to
  the value as well, which is generally the preferred approach.)
  
  h1. Defining Your Segments
  
  You define your segments by providing a items array, much like you provide
  to a RadioView.  Your items array can be as simple as an array of strings 
  or as complex as full model objects.  Based on how you configure your
  itemKey properties, the segmented view will read the properties it needs 
  from the array and construct the button.
  
  You can define the following properties on objects you pass in:
  
  | *itemTitleKey* | the title of the button |
  | *itemValueKey* | the value of the button |
  | *itemWidthKey* | the preferred width. if omitted, it autodetects |
  | *itemIconKey*  | an icon |
  | *itemActionKey* | an optional action to fire when pressed |
  | *itemTargetKey* | an optional target for the action |

  @extends SC.View
  @since SproutCore 1.0
*/
SC.SegmentedView = SC.View.extend(SC.Control,
/** @scope SC.SegmentedView.prototype */ {
  
  classNames: ['sc-segmented-view'],
  
  theme: 'square',
  
  /**
    The value of the segmented view.
    
    The SegmentedView's value will always be the value of the currently
    selected button.  Setting this value will change the selected button. 
    If you set this value to something that has no matching button, then
    no buttons will be selected.
    
    @field {Object}
  */
  value: null,

  /**
    Set to YES to enabled the segmented view, NO to disabled it.
  */
  isEnabled: YES, 

  /**
    If YES, clicking a selected button again will deselect it, setting the
    segmented views value to null.  Defaults to NO.
  */
  allowsEmptySelection: NO,  
  
  /**
    If YES, then clicking on a tab will not deselect the other segments, it
    will simply add or remove it from the selection.
  */
  allowsMultipleSelection: NO,

  /**
    If YES, titles will be localized before display.
  */
  localize: YES,
  
  align: SC.ALIGN_CENTER,
  
  /**
    Change the layout direction to make this a vertical set of tabs instead
    of horizontal ones.
  */
  layoutDirection: SC.LAYOUT_HORIZONTAL,
  
  // ..........................................................
  // SEGMENT DEFINITION
  //
   
  /**
    The array of items to display.  This can be a simple array of strings,
    objects or hashes.  If you pass objects or hashes, you must also set the
    various itemKey properties to tell the SegmentedView how to extract the
    information it needs.
    
    Note: if you pass hashes, they will be converted into SC.Objects so that
    they may be observed for title & width changes.  Therefore, if you retrieve
    the items back, be sure to access their properties using KVC (ie. get() &
    set()).
    
    @property {Array}
  */
  items: [],

  /** 
    The key that contains the title for each item.
    
    @property {String}
  */
  itemTitleKey: null,
  
  /** 
    The key that contains the value for each item.
    
    @property {String}
  */
  itemValueKey: null,
  
  /** 
    A key that determines if this item in particular is enabled.  Note if the
    control in general is not enabled, no items will be enabled, even if the
    item's enabled property returns YES.
    
    @property {String}
  */
  itemIsEnabledKey: null,

  /** 
    The key that contains the icon for each item.  If omitted, no icons will
    be displayed.
    
    @property {String}
  */
  itemIconKey: null,

  /** 
    The key that contains the desired width for each item.  If omitted, the
    width will autosize.
  
    @property {String}
  */
  itemWidthKey: null,
  
  /** 
    The key that contains the action for this item.  If defined, then 
    selecting this item will fire the action in addition to changing the 
    value.  See also itemTargetKey.
    
    @property {String}
  */
  itemActionKey: null,

  /** 
    The key that contains the target for this item.  If this and itemActionKey
    are defined, then this will be the target of the action fired. 
    
    @property {String}
  */
  itemTargetKey: null,

  /** 
    The key that contains the key equivalent for each item.  If defined then
    pressing that key equivalent will be like selecting the tab.  Also, 
    pressing the Alt or Option key for 3 seconds will display the key 
    equivalent in the tab.
  */
  itemKeyEquivalentKey: null,

  /**
    The array of itemKeys that will be searched to build the displayItems
    array.  This is used internally by the class.  You will not generally
    need to access or edit this array.
    
    @property {Array}
  */
  itemKeys: 'itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemWidthKey itemToolTipKey itemKeyEquivalentKey'.w(),
  
  /**
    This computed property is generated from the items array based on the 
    itemKey properties that you set.  The return value is an array of arrays
    that contain private information used by the SegmentedView to render. 
    
    You will not generally need to access or edit this property.
    
    @property {Array}
  */
  displayItems: function() {
    var items = this.get('items'), loc = this.get('localize'),
      keys=null, itemType, cur, ret = [], max = items.get('length'), idx, 
      item, fetchKeys = SC._segmented_fetchKeys, fetchItem = SC._segmented_fetchItem,
      overflowItems;
    
    overflowItems = this.overflowItems = [];
      
    // loop through items and collect data
    for(idx=0;idx<max;idx++) {
      item = items.objectAt(idx) ;
      if (SC.none(item)) continue; //skip is null or undefined
      
      // if the item is a string, build the array using defaults...
      itemType = SC.typeOf(item);
      if (itemType === SC.T_STRING) {
        cur = {
          title: item.humanize().titleize(),
          value: item,
          isEnabled: YES,
          icon: null,
          width: null,
          toolTip: null,
          keyEquivalent: null,
          index: idx
        };
        // cur = [item.humanize().titleize(), item, YES, null, null,  null, idx] ;
        
      // if the item is not an array, try to use the itemKeys.
      } else if (itemType !== SC.T_ARRAY) {
        // get the itemKeys the first time
        if (keys===null) {
          keys = this.itemKeys.map(fetchKeys,this);
        }
        
        // now loop through the keys and try to get the values on the item
        cur = keys.map(fetchItem, item);
        
        // create the actual item
        cur = {
          title: cur[0],
          value: cur[1],
          isEnabled: cur[2],
          icon: cur[3],
          width: cur[4],
          toolTip: cur[5],
          keyEquivalent: cur[6],
          index: idx
        };
        
        // special case 1...if title key is null, try to make into string
        if (!keys[0] && item.toString) cur.title = item.toString(); 
        
        // special case 2...if value key is null, use item itself
        if (!keys[1]) cur.value = item;
        
        // special case 3...if isEnabled is null, default to yes.
        if (!keys[2]) cur.isEnabled = YES ; 
      }
      
      // finally, be sure to loc the title if needed
      if (loc && cur.title) cur.title = cur.title.loc();

      // finally, be sure to loc the toolTip if needed
      if (loc && cur.toolTip && SC.typeOf(cur.toolTip) === SC.T_STRING) cur.toolTip = cur.toolTip.loc();
      
      if (this.overflowIndex <= idx) {
        
        // return an overflow segment the first time
        if (overflowItems.length === 0) {
          ret[ret.length] = {width: null, isOverflowSegment: YES};
        }
        
        // store the overflowed items in overflowItems (to be used in popup menu)
        overflowItems[overflowItems.length] = cur;
      } else {
        // add to return array
        ret[ret.length] = cur;
      }
    }
    
    // return an overflow segment the first time so that it can be measured
    if (!this.overflowSegmentWidth) {
      ret[ret.length] = {width: null, isOverflowSegment: YES};
    }
    
    return ret ;
  }.property('items', 'itemTitleKey', 'itemValueKey', 'itemIsEnabledKey', 'localize', 'itemIconKey', 'itemWidthKey', 'itemToolTipKey').cacheable(),
  
  /** @private
    Measures the visible segments after they've been rendered to see if we need to overflow.  This method will
    be called automatically whenever the frame or items array changes.
  */
  measureForOverflow: function() {
    var layer = this.get('layer');                       // <div> ...
    
    if (!layer) return;
    
    if (!this.elementWidths) {
      this.elementWidths = [];
      
      // The last segment will be an overflow segment (so measure it but don't add it to elementWidths)
      var len = layer.childNodes.length;
      if (!this.overflowSegmentWidth) {
        var el = layer.childNodes[len - 1];
        
        len = len - 1;
        this.overflowSegmentWidth = el.getBoundingClientRect().width;
      }
      
      // Measure the segments and cache it
      for (var i=0; i < len; i++) {
        el = layer.childNodes[i];
  
        this.elementWidths[i] = el.getBoundingClientRect().width;
      }
    }
  
    var visibleWidth = SC.$(layer).width();             // The inner width of the div
    var curElementsWidth = 0;
    
    len = this.elementWidths.length;
    for (i=0; i < len; i++) {
      curElementsWidth += this.elementWidths[i];
    
      // check for an overflow (leave room for the overflow segment except for the last segment)
      var widthToFit = (i === len - 1) ? curElementsWidth : curElementsWidth + this.overflowSegmentWidth;
      if (widthToFit >= visibleWidth) {
        if (this.overflowIndex === i) return;          // overflow hasn't changed, no need to redraw
      
        // Else, mark the index that went over the visible width and redraw
        this.overflowIndex = i;
        this.notifyPropertyChange('displayItems');
        return;
      }
    }
  
    if (this.overflowIndex === Infinity) return;        // overflow hasn't changed, no need to redraw
   
    this.overflowIndex = Infinity;
    this.notifyPropertyChange('displayItems');
  },
  
  /** @private
    If our frame changes, then we may need to add or remove an overflow segment
  */
  frameDidChange: function() {
    this.measureForOverflow();
  }.observes('frame'),
  
  /** If the items array itself changes, add/remove observer on item... */
  itemsDidChange: function() { 
    if (this._items) {
      for (var i = this._items.length - 1; i >= 0; i--){
        if (this._items[i] instanceof SC.Object) {
          var item = this._items[i];
          
          if (this.get('itemTitleKey')) item.removeObserver(this.get('itemTitleKey'), this, this.itemContentDidChange);
          if (this.get('itemWidthKey')) item.removeObserver(this.get('itemWidthKey'), this, this.itemContentDidChange);
        }
      }
    } 
    
    this._items = this.get('items');
    
    if (this._items) {
      var value = this.get('value');
      var isArray = SC.isArray(value);
      var newValue = [];
      var itemType, itemValue;
      
      for (i = this._items.length - 1; i >= 0; i--) {
        item = this._items[i];
        itemType = SC.typeOf(item);
        if (itemType !== SC.T_STRING) {
      
          // Convert objects to SC.Objects
          if (!(item instanceof SC.Object)) item = this._items[i] = SC.Object.create(item);
          if (this.get('itemTitleKey')) item.addObserver(this.get('itemTitleKey'), this, this.itemContentDidChange);
          if (this.get('itemWidthKey')) item.addObserver(this.get('itemWidthKey'), this, this.itemContentDidChange);
          
          itemValue = item.get(this.get('itemValueKey'));
        } else {
          itemValue = item;
        }
        
        // If the selected item has been removed then make sure the current value still exists
        if (!SC.empty(value)) {
          if (isArray ? value.indexOf(itemValue) >= 0 : value === itemValue) {
            newValue[newValue.length] = itemValue; 
          }
        }
      }
      
      // Update the value
      if (newValue.length === 0) newValue = null;
      this.set('value', newValue);
    }
      
    this.itemContentDidChange();
  }.observes('*items.[]'),
  
  /** 
    Invoked whenever the item array or an item in the array is changed.  This method will regenerate the list of items.
  */
  itemContentDidChange: function() {
    this.set('renderLikeFirstTime', YES);
    this.notifyPropertyChange('displayItems');
    
    if (this.overflowIndex) this.overflowIndex = Infinity;      // Don't overflow items so that they can be measured one time
    
    // Re-measure after drawing is complete
    this.invokeLast(function() {
      this.elementWidths = null;
      this.measureForOverflow();
    }, this);
  },
  
  init: function() {
    sc_super();
    this.itemsDidChange() ;
  },
  
  // ..........................................................
  // RENDERING/DISPLAY SUPPORT
  // 
  
  displayProperties: ['displayItems', 'value', 'activeIndex'],
  
  createRenderer: function(theme) {
    return theme.segmented();
  },
  
  updateRenderer: function(r) {
    var items = this.get('displayItems'), overflowItems = this.overflowItems, value = this.get('value'), isArray = SC.isArray(value),
        activeIndex = this.get("activeIndex"), item;
    
    // Check displayed items
    for (var idx = 0, len = items.length; idx < len; idx++) {
      item = items[idx];
      
      // change active
      if (activeIndex == idx) item.isActive = YES;
      else item.isActive = NO;
      
      // change selection
      if (isArray ? value.indexOf(item.value) >= 0 : value === item.value) {
        item.isSelected = YES;
      }
      else item.isSelected = NO;
    }
    
    // Check overflowed items
    for (idx = 0, len = overflowItems.length; idx < len; idx++) {
      item = overflowItems[idx];
      
      // change selection
      if (isArray ? value.indexOf(item.value) >= 0 : value === item.value) {
        items[items.length - 1].isSelected = YES;
      }
    }
    
    // set the attributes
    r.attr({
      segments: items,
      align: this.get('align'),
      layoutDirection: this.get('layoutDirection')
    });
  },
  
  // ..........................................................
  // EVENT HANDLING
  // 
  
  /** 
    Determines the index into the displayItems array where the passed mouse
    event occurred.
  */
  displayItemIndexForEvent: function(evt) {
    if (this.renderer) return this.renderer.indexForEvent(evt);
  },
  
  /** @private
    Invoked whenever an item is selected in the overflow menu.
  */
  selectOverflowSegment: function(menu) {
    var item = menu.get('selectedItem');
    this.triggerItemAtIndex(item.index);
    
    // Cleanup
    menu.removeObserver('selectedItem', this, 'selectOverflowSegment');
  },
  
  /** @private
    Presents the popup menu containing overflowed segments.
  */
  showOverflowItems: function(idx) {
    this.set('activeIndex', this.overflowIndex);
      
    // Select the currently selected item if it is in overflowItems
    var overflowItems = this.overflowItems;
    var value = this.get('value');
    var isArray = SC.isArray(value);
    for (var i = overflowItems.length - 1; i >= 0; i--) {
      var item = overflowItems[i];
      if (isArray ? value.indexOf(item.value) >= 0 : value === item.value) {
        item.isChecked = YES;
      } else item.isChecked = NO;
    }
    
    // TODO: we can't pass a shortcut key to the menu, because it isn't a property of this (yet?)
    var menu = SC.MenuPane.create({
      layout: { width: 200 },
      items: this.overflowItems,
      itemTitleKey: 'title',
      itemIconKey: 'icon',
      itemIsEnabledKey: 'isEnabled',
      itemKeyEquivalentKey: 'keyEquivalent',
      itemCheckboxKey: 'isChecked'
    });
    
    var layer = this.get('layer');
    var overflowElement = layer.childNodes[layer.childNodes.length - 1];
    menu.popup(overflowElement);
    
    menu.addObserver("selectedItem", this, 'selectOverflowSegment');
  },
  
  keyDown: function(evt) {
    // handle tab key
    var i, item, items, overflowItems, len, value, isArray;
    if (evt.which === 9 || evt.keyCode === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if(view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }    
    if (!this.get('allowsMultipleSelection') && !this.get('allowsEmptySelection')){
      items = this.get('displayItems').slice(0);
      
      // If we've overflowed, discard the overflow segment and re-append the overflowed items
      if (this.overflowItems.length > 0) items.removeAt(items.length - 1).pushObjects(this.overflowItems);
      
      len = items.length;
      value = this.get('value');
      isArray = SC.isArray(value);
      if (evt.which === 39 || evt.which === 40) {  
        for(i=0; i< len-1; i++){
          item=items[i];
          if( isArray ? (value.indexOf(item.value)>=0) : (item.value===value)){
            this.triggerItemAtIndex(i+1);
          }
        }
        return YES ; // handled
      }
      else if (evt.which === 37 || evt.which === 38) {
        for(i=1; i< len; i++){
          item=items[i];
          if( isArray ? (value.indexOf(item.value)>=0) : (item.value===value)){
            this.triggerItemAtIndex(i-1);
          }
        }
        return YES ; // handled
      }
    }
    return YES; 
  },
  
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES; // nothing to do
    var idx = this.displayItemIndexForEvent(evt);
    
    // if mouse was pressed on an overflow segment popup the menu
    if (idx === this.overflowIndex) {
      this.showOverflowItems();
    } else if (idx>=0) {                          
      // if mouse was pressed on a button, then start detecting pressed events
      this._isMouseDown = YES ;
      this.set('activeIndex', idx);
    }
    
    return YES ;
  },
  
  mouseUp: function(evt) {
    var idx = this.displayItemIndexForEvent(evt);
    // if mouse was pressed on a button then detect where we where when we
    // release and use that one.
    if (this._isMouseDown && (idx>=0)) this.triggerItemAtIndex(idx);
    
    // cleanup
    this._isMouseDown = NO ;
    this.set('activeIndex', -1);
    return YES ;
  },
  
  mouseMoved: function(evt) {
    if (this._isMouseDown) {
      var idx = this.displayItemIndexForEvent(evt);
      this.set('activeIndex', idx);
    }
    return YES;
  },
  
  mouseExited: function(evt) {
    // if mouse was pressed down initially, start detection again
    if (this._isMouseDown) {
      var idx = this.displayItemIndexForEvent(evt);
      this.set('activeIndex', idx);
    }
    return YES;
  },
  
  mouseEntered: function(evt) {
    // if mouse was down, hide active index
    if (this._isMouseDown) {
      var idx = this.displayItemIndexForEvent(evt);
      this.set('activeIndex', -1);
    }
    return YES ;
  },
  
  touchStart: function(touch) {
    if (!this.get('isEnabled')) return YES; // nothing to do
    var idx = this.displayItemIndexForEvent(touch);
    
    // if touch was on an overflow segment popup the menu
    if (idx === this.overflowIndex) {
      this.showOverflowItems();
    } else if (idx>=0) {   
      this._isTouching = YES ;
      this.set('activeIndex', idx);
    }
    
    return YES ;
  },
  
  touchEnd: function(touch) {
    var idx = this.displayItemIndexForEvent(touch);
    // if mouse was pressed on a button then detect where we where when we
    // release and use that one.
    if (this._isTouching && (idx>=0)) this.triggerItemAtIndex(idx);
    
    // cleanup
    this._isTouching = NO ;
    this.set('activeIndex', -1);
    return YES ;
  },
  
  touchesDragged: function(evt, touches) {
    var isTouching = this.touchIsInBoundary(evt);

    if (isTouching) {
      if (!this._isTouching) {
        this._touchDidEnter(evt);
      }
      var idx = this.displayItemIndexForEvent(evt);
      this.set('activeIndex', idx);
    } else {
      if (this._isTouching) this._touchDidExit(evt);
    }
    
    this._isTouching = isTouching;
    
    return YES;
  },
  
  _touchDidExit: function(evt) {
    var idx = this.displayItemIndexForEvent(evt);
    this.set('activeIndex', -1);

    return YES;
  },
  
  _touchDidEnter: function(evt) {
    // if mouse was down, hide active index
    var idx = this.displayItemIndexForEvent(evt);
    this.set('activeIndex', idx);

    return YES ;
  },

  /** 
    Simulates the user clicking on the segment at the specified index. This
    will update the value if possible and fire the action.
  */
  triggerItemAtIndex: function(idx) {
    var items = this.get('displayItems'),
        overflowItems = this.get('overflowItems'),
        item, sel, value, val, empty, mult;
    
    if (overflowItems.length > 0 && idx >= items.length - 1) item = overflowItems.objectAt(idx - (items.length - 1)); // subtract 1 for the overflow segment
    else item = items.objectAt(idx);
        
    if (!item.isEnabled) return this; // nothing to do!

    empty = this.get('allowsEmptySelection');
    mult = this.get('allowsMultipleSelection');
    
    
    // get new value... bail if not enabled. Also save original for later.
    sel = item.value;
    value = val = this.get('value') ;
    
    if (SC.empty(value)) value = [];
    else if (!SC.isArray(value)) value = [value]; // force to array
    
    // if we do not allow multiple selection, either replace the current
    // selection or deselect it
    if (!mult) {
      // if we allow empty selection and the current value is the same as
      // the selected value, then deselect it.
      if (empty && (value.get('length')===1) && (value.objectAt(0)===sel)){
        value = [];
      
      // otherwise, simply replace the value.
      } else value = [sel] ;
      
    // if we do allow multiple selection, then add or remove item to the
    // array.
    } else {
      if (value.indexOf(sel) >= 0) {
        if (value.get('length')>1 || (value.objectAt(0)!==sel) || empty) {
          value = value.without(sel);
        }
      } else value = value.concat([sel]) ;
    }
    
    // normalize back to non-array form
    switch(value.get('length')) {
      case 0:
        value = null;
        break;
      case 1:
        value = value.objectAt(0);
        break;
      default:
        break;
    }
    
    // also, trigger target if needed.
    var actionKey = this.get('itemActionKey'),
        targetKey = this.get('itemTargetKey'),
        action, target = null,
        resp = this.getPath('pane.rootResponder');

    if (actionKey && (item = this.get('items').objectAt(item.index))) {
      // get the source item from the item array.  use the index stored...
      action = item.get ? item.get(actionKey) : item[actionKey];
      if (targetKey) {
        target = item.get ? item.get(targetKey) : item[targetKey];
      }
      if (resp) resp.sendAction(action, target, this, this.get('pane'));
    }

    // Only set value if there is no action and a value is defined.
    if(!action && val !== undefined) {
      this.set('value', value);
    }
    
    // if an action/target is defined on self use that also
    action =this.get('action');
    if (action && resp) {
      resp.sendAction(action, this.get('target'), this, this.get('pane'));
    }
  },
  
  /** tied to the isEnabled state */
   acceptsFirstResponder: function() {
     if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
     else return NO;
   }.property('isEnabled'),

   willBecomeKeyResponderFrom: function(keyView) {
     // focus the text field.
     if (!this._isFocused) {
       this._isFocused = YES ;
       this.becomeFirstResponder();
       if (this.get('isVisibleInWindow')) {
         this.$()[0].focus();
       }
     }
   },
   
   willLoseKeyResponderTo: function(responder) {
     if (this._isFocused) this._isFocused = NO ;
   }
    
}) ;

// Helpers defined here to avoid creating lots of closures...
SC._segmented_fetchKeys = function(k) { return this.get(k); };
SC._segmented_fetchItem = function(k) { 
  if (!k) return null;
  return this.get ? this.get(k) : this[k]; 
};




