// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
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
    If YES, it will set the segment value even if an action is defined.
  */
  selectSegmentWhenTriggeringAction: NO,

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
  itemKeys: 'itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemWidthKey itemToolTipKey'.w(),
  
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
      item, fetchKeys = SC._segmented_fetchKeys, fetchItem = SC._segmented_fetchItem;
    
    // loop through items and collect data
    for(idx=0;idx<max;idx++) {
      item = items.objectAt(idx) ;
      if (SC.none(item)) continue; //skip is null or undefined
      
      // if the item is a string, build the array using defaults...
      itemType = SC.typeOf(item);
      if (itemType === SC.T_STRING) {
        cur = [item.humanize().titleize(), item, YES, null, null,  null, idx] ;
        
      // if the item is not an array, try to use the itemKeys.
      } else if (itemType !== SC.T_ARRAY) {
        // get the itemKeys the first time
        if (keys===null) {
          keys = this.itemKeys.map(fetchKeys,this);
        }
        
        // now loop through the keys and try to get the values on the item
        cur = keys.map(fetchItem, item);
        cur[cur.length] = idx; // save current index
        
        // special case 1...if title key is null, try to make into string
        if (!keys[0] && item.toString) cur[0] = item.toString(); 
        
        // special case 2...if value key is null, use item itself
        if (!keys[1]) cur[1] = item;
        
        // special case 3...if isEnabled is null, default to yes.
        if (!keys[2]) cur[2] = YES ; 
      }
      
      // finally, be sure to loc the title if needed
      if (loc && cur[0]) cur[0] = cur[0].loc();

      // finally, be sure to loc the toolTip if needed
      if (loc && cur[5] && SC.typeOf(cur[5]) === SC.T_STRING) cur[5] = cur[5].loc();
      
      // add to return array
      ret[ret.length] = cur;
    }
    
    // all done, return!
    return ret ;
  }.property('items', 'itemTitleKey', 'itemValueKey', 'itemIsEnabledKey', 'localize', 'itemIconKey', 'itemWidthKey', 'itemToolTipKey'),
  
  /** If the items array itself changes, add/remove observer on item... */
  itemsDidChange: function() { 
    if (this._items) {
      this._items.removeObserver('[]',this,this.itemContentDidChange) ;
    } 
    this._items = this.get('items') ;
    if (this._items) {
      this._items.addObserver('[]', this, this.itemContentDidChange) ;
    }
    
    this.itemContentDidChange();
  }.observes('items'),
  
  /** 
    Invoked whenever the item array or an item in the array is changed.  This method will reginerate the list of items.
  */
  itemContentDidChange: function() {
    this.set('renderLikeFirstTime', YES);
    this.notifyPropertyChange('displayItems');
  },
  
  init: function() {
    sc_super();
    this.itemsDidChange() ;
  },

  
  // ..........................................................
  // RENDERING/DISPLAY SUPPORT
  // 
  
  displayProperties: ['displayItems', 'value', 'activeIndex'],
  
  
  render: function(context, firstTime) { 
    
    // collect some data 
    var items = this.get('displayItems');
    
    var theme = this.get('theme');
    if (theme) context.addClass(theme);
    if (firstTime || this.get('renderLikeFirstTime')) {
      this._seg_displayItems = items; // save for future
      this.renderDisplayItems(context, items) ;
      context.addStyle('text-align', this.get('align'));
      this.set('renderLikeFirstTime',NO);
    }else{
    // update selection and active state
      var activeIndex = this.get('activeIndex'),
          value = this.get('value'),
          isArray = SC.isArray(value);
      if (isArray && value.get('length')===1) {
        value = value.objectAt(0); isArray = NO ;
      }
      var names = {}, // reuse  
          loc = items.length, cq = this.$('.sc-segment'), item;
      while(--loc>=0) {
        item = items[loc];
        names.sel = isArray ? (value.indexOf(item[1])>=0) : (item[1]===value);
        names.active = (activeIndex === loc);
        names.disabled = !item[2];
        SC.$(cq[loc]).setClass(names);
      }
      names = items = value = items = null; // cleanup
    }
  },
  
  /**
    Actually generates the segment HTML for the display items.  This method 
    is called the first time a view is constructed and any time the display
    items change thereafter.  This will construct the HTML but will not set
    any "transient" states such as the global isEnabled property or selection.
  */
  renderDisplayItems: function(context, items) {
    var value       = this.get('value'),
        isArray     = SC.isArray(value),
        activeIndex = this.get('activeIndex'),
        len         = items.length,
        title, icon, url, className, ic, item, toolTip, width, i, stylesHash,
        classArray;

    for(i=0; i< len; i++){
      ic = context.begin('a').attr('role', 'button');
      item=items[i];
      title = item[0]; 
      icon = item[3];
      toolTip = item[5];
      
      stylesHash = {};
      classArray = [];

      if (this.get('layoutDirection') == SC.LAYOUT_HORIZONTAL) {
        stylesHash['display'] = 'inline-block' ;
      }

      classArray.push('sc-segment');
      
      if(!item[2]){
        classArray.push('disabled');
      }
      if(i===0){
        classArray.push('sc-first-segment');
      }
      if(i===(len-1)){
        classArray.push('sc-last-segment');
      }
      if(i!==0 && i!==(len-1)){
        classArray.push('sc-middle-segment');
      }      
      if( isArray ? (value.indexOf(item[1])>=0) : (item[1]===value)){
        classArray.push('sel');
      }
      if(activeIndex === i) {
        classArray.push('active') ;
      }
      if(item[4]){
        width=item[4];
        stylesHash['width'] = width+'px';
      }
      ic.addClass(classArray);
      ic.addStyle(stylesHash);
      if(toolTip) {
        ic.attr('title', toolTip) ;
      }

      if (icon) {
        url = (icon.indexOf('/')>=0) ? icon : SC.BLANK_IMAGE_URL;
        className = (url === icon) ? '' : icon ;
        icon = '<img src="'+url+'" alt="" class="icon '+className+'" />';
      } else {
        icon = '';
      }
      ic.push('<span class="sc-button-inner"><label class="sc-button-label">',
              icon+title, '</label></span>');
      ic.end();
    }   
  },  
  
  // ..........................................................
  // EVENT HANDLING
  // 
  
  /** 
    Determines the index into the displayItems array where the passed mouse
    event occurred.
  */
  displayItemIndexForEvent: function(evt) {
    return this.displayItemIndexForPosition(evt.pageX, evt.pageY);
  },
  
  /**
    Determines an item index based on a position. The position does not have to be within the view's
    bounding rectangle. If no item is at that position, this will return -1.
    
    NOTE: Eventually, this sort of function should be implemented in a renderer.
  */
  displayItemIndexForPosition: function(pageX, pageY) {
    // find the segments
    var segments = this.$('.sc-segment'), len = segments.length, idx, segment, r;
    
    // loop through them (yes, this comment is mostly because it looks nice in TextMate)
    for (idx = 0; idx < len; idx++) {
      // get the segment
      segment = segments[idx];
      
      // get its rectangle
      r = segment.getBoundingClientRect();
      
      // based on orientation, check the position left-to-right or up-to-down.
      if (this.get('layoutDirection') == SC.LAYOUT_VERTICAL) {
        // if it fits, return it right away
        if (pageY > r.top && pageY < r.bottom) return idx;
      }
      else {
        // if it fits, return it right away.
        if (pageX > r.left && pageX < r.right) return idx;
      }
    }
    
    // if we didn't find anything, return the old standard -1 for "not found."
    return -1;
  },
  
  keyDown: function(evt) {
    // handle tab key
    var i, item, items, len, value, isArray;
    if (evt.which === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if(view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }    
    if (!this.get('allowsMultipleSelection') && !this.get('allowsEmptySelection')){
      items = this.get('displayItems');
      len = items.length;
      value = this.get('value');
      isArray = SC.isArray(value);
      if (evt.which === 39 || evt.which === 40) {  
        for(i=0; i< len-1; i++){
          item=items[i];
          if( isArray ? (value.indexOf(item[1])>=0) : (item[1]===value)){
            this.triggerItemAtIndex(i+1);
          }
        }
        return YES ; // handled
      }
      else if (evt.which === 37 || evt.which === 38) {
        for(i=1; i< len; i++){
          item=items[i];
          if( isArray ? (value.indexOf(item[1])>=0) : (item[1]===value)){
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
    
    // if mouse was pressed on a button, then start detecting pressed events
    if (idx>=0) {
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
    
    // if mouse was pressed on a button, then start detecting pressed events
    if (idx>=0) {
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
        item  = items.objectAt(idx),
        sel, value, val, empty, mult;
        
    if (!item[2]) return this; // nothing to do!

    empty = this.get('allowsEmptySelection');
    mult = this.get('allowsMultipleSelection');
    
    
    // get new value... bail if not enabled. Also save original for later.
    sel = item[1];
    value = val = this.get('value') ;
    if (!SC.isArray(value)) value = [value]; // force to array
    
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

    if (actionKey && (item = this.get('items').objectAt(item[6]))) {
      // get the source item from the item array.  use the index stored...
      action = item.get ? item.get(actionKey) : item[actionKey];
      if (targetKey) {
        target = item.get ? item.get(targetKey) : item[targetKey];
      }
      if (resp) resp.sendAction(action, target, this, this.get('pane'));
    }

    if(val !== undefined && (!action || this.get('selectSegmentWhenTriggeringAction'))) {
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




