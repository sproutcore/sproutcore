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
    The array of items to display.  This may be a simple array of strings, objects
    or SC.Objects.  If you pass objects or SC.Objects, you must also set the
    various itemKey properties to tell the SegmentedView how to extract the
    information it needs.
    
    Note: only SC.Object items support key-value coding and therefore can be 
    observered by the view for changes to titles, values, icons, widths, 
    isEnabled values & tooltips.
    
    TODO: explain how to notify the view of changes to String & Object items
    
    @property {Array}
  */
  items: null,

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
  
  /** @private
    The following properties are used to map items to child views. Item keys
    are looked up on the item based on this view's value for each 'itemKey'.  
    If a value in the item is found, then that value is mapped to a child
    view using the matching viewKey.
    
    @property {Array}
  */
  itemKeys: 'itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemWidthKey itemToolTipKey itemKeyEquivalentKey'.w(),
  viewKeys: 'title value isEnabled icon titleMinWidth hint keyEquivalent'.w(),
  
  /**
    Call itemsDidChange once to initialize segment child views for the items that exist at
    creation time.
  */
  init: function() {
    sc_super();
    
    this.itemsDidChange();
  },
  
  /**
    Called whenever the number of items changes.  This method populates SegmentedView's childViews, taking
    care to re-use existing childViews if possible.
    
    */
  itemsDidChange: function() {
    var items = this.get('items') || [],
        item,
        localItem,                        // Used to avoid altering the original items
        childViews = this.get('childViews'),
        childView,
        value = this.get('value'),        // The value can change if items that were once selected are removed
        isSelected,
        itemKeys = this.get('itemKeys'),
        itemKey, 
        viewKeys = this.get('viewKeys'),
        viewKey,
        i, j;
  
    // Update childViews 
    if (childViews.length > items.length) {   // We've lost segments (ie. childViews)
      
      // Remove unneeded segments from the end back
      for (i = childViews.length - 1; i >= items.length; i--) {
        childView = childViews[i];
        
        // If a selected childView has been removed then update our value
        if (SC.isArray(value)) {
          value.removeObject(childView.get('value'));
        } else if (value === childView.get('value')) {
          value = null;
        }
        
        // Remove any observers on the matching item of this childView
        item = this.cachedItems[i];
        if (item instanceof SC.Object) {
          for (j = itemKeys.length - 1; j >= 0; j--) {
            itemKey = this.get(itemKeys[j]);
          
            if (itemKey) item.removeObserver(itemKey, this, this.itemContentDidChange);
          }
        }
        
        // Finally remove the cached item & its childView
        this.cachedItems.removeAt(i);
        this.removeChild(childView);
      }
      
      // Update the new last segment (this segment may be first and last after this point)
      childView = childViews[items.length - 1];
      childView.set({'isLastSegment': YES, 'isMiddleSegment': NO});
      
      // Update our value which may have changed
      this.set('value', value);
      
    } else if (childViews.length < items.length) {  // We've gained segments
    
      // Update the class of the segment previously last
      if (childViews.length > 0) {
        
        childView = childViews[childViews.length - 1];
        if (childViews.length === 1) {
          childView.set({'isLastSegment': NO});
        } else {
          childView.set({'isLastSegment': NO, 'isMiddleSegment': YES});
        }
      }

      // Create the new segments
      for (i = childViews.length; i < items.length; i++) {
        localItem = items[i];
        
        // Skip null/undefined items (but don't skip empty strings)
        if (SC.none(localItem)) continue;
        
        // Normalize the item (may be a String, Object or SC.Object)
        if (SC.typeOf(localItem) === SC.T_STRING) {
          
          localItem = SC.Object.create({
            'title': localItem.humanize().titleize(),
            'value': localItem
          });
          
          // Update our keys accordingly
          this.set('itemTitleKey', 'title');
          this.set('itemValueKey', 'value');
        } else if (SC.typeOf(localItem) === SC.T_HASH) {
          
          localItem = SC.Object.create(localItem);
        } else if (localItem instanceof SC.Object)  {
          
          // We don't need to make any changes to SC.Object items, but we can observe them
          for (j = itemKeys.length - 1; j >= 0; j--) {
            itemKey = this.get(itemKeys[j]);
          
            if (itemKey) localItem.addObserver(itemKey, this, this.itemContentDidChange);
          }
        } else {
          SC.Logger.error('SC.SegmentedView items may be Strings, Objects (ie. Hashes) or SC.Objects only');
        }
        
        // Determine whether this segment is selected based on the view's existing value(s)
        isSelected = NO;
        if (SC.isArray(value) ? value.indexOf(localItem.get(this.get('itemValueKey'))) >= 0 : value === localItem.get(this.get('itemValueKey'))) {
          isSelected = YES;
        }
    
        // We create a default SC.ButtonView like object for each segment
        childView = SC.View.create(SC.Control, {
          /* SC.Control (note: this brings its own display properties: 'isEnabled', 'isSelected', 'isActive', 'controlSize') */
          isEnabled: YES,
          isActive: NO,
          isSelected: isSelected,
          controlSize: this.get('controlSize'),
          /* SC.Button (note: we don't actually mix this in, because it doesn't define displayProperties or renderMixin) */
          title: '',
          value: null,
          icon: null,
          localize: this.get('localize'),
          keyEquivalent: null,
          escapeHTML: YES,      // TODO: Modification currently unsupported
          needsEllipsis: YES,   // TODO: Modification currently unsupported
          /* SC.ButtonView */
          hint: '',   // TODO: SC.ButtonView has a toolTip, but the render delegate wants a hint property (which is it?)
          titleMinWidth: null,
          supportFocusRing: NO, // TODO: Modification currently unsupported
          /* SC.View */
          theme: this.get('theme'),
          renderDelegateName: 'segmentRenderDelegate',
          useStaticLayout: YES,
          displayProperties: ['icon', 'title', 'value', 'toolTip', 'isDefault', 'isCancel', 'titleMinWidth', 'isFirstSegment', 'isMiddleSegment', 'isLastSegment', 'index'] // TODO: isDefault, isCancel, value not really supported
        });
        
        // Assign the properties from the item
        for (j = itemKeys.length - 1; j >= 0; j--) {
          itemKey = this.get(itemKeys[j]);
          viewKey = viewKeys[j];
        
          // Don't overwrite the default value if none exists in the item
          if (!SC.none(localItem.get(itemKey))) childView.set(viewKey, localItem.get(itemKey));
        }
        
        // Assign segment specific properties based on position
        childView.set('index', i);
        childView.set('isFirstSegment', i === 0);
        childView.set('isMiddleSegment',  i < items.length - 1 && i > 0);
        childView.set('isLastSegment', i === items.length - 1);
        
        // Attach the child
        this.appendChild(childView);
      }
      
      // Cache these items (only so that we may remove observers if 'items' is altered externally)
      // TODO: look into the necessity of this.  Do removed items need to have observers removed?
      this.cachedItems = SC.clone(items);
    }
  }.observes('*items.[]'),
  
  itemContentDidChange: function(item) {
    var childViews = this.get('childViews'),
        childView,
        itemKeys = this.get('itemKeys'),
        itemKey,
        viewKeys = this.get('viewKeys'),
        viewKey,
        i;

    i = this.cachedItems.indexOf(item);
    childView = childViews[i];
    if (childView) {
      
      // Update the childView
      for (i = itemKeys.length - 1; i >= 0; i--) {
        itemKey = this.get(itemKeys[i]); 
        viewKey = viewKeys[i];
        
        // Don't overwrite the default value if none exists in the item
        if (!SC.none(item.get(itemKey))) childView.set(viewKey, item.get(itemKey));
      }
    } else {
      SC.Logger.warn("Item content change was observed on item without matching segment child view.");
    }
  },
  
  // ..........................................................
  // RENDERING/DISPLAY SUPPORT
  // 
  
  displayProperties: ['align'],
  
  renderDelegateName: 'segmentedRenderDelegate',
  
  // ..........................................................
  // EVENT HANDLING
  // 
  
  /** 
    Determines the index into the displayItems array where the passed mouse
    event occurred.
  */
  displayItemIndexForEvent: function(evt) {
    var renderDelegate = this.get('renderDelegate');

    if (renderDelegate && renderDelegate.indexForClientPosition) {
      return renderDelegate.indexForClientPosition(this, evt.clientX, evt.clientY);
    }
  },
  
  keyDown: function(evt) {
    // handle tab key
    var i, item, items, len, value, isArray;
    if (evt.which === 9 || evt.keyCode === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if(view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }    
    if (!this.get('allowsMultipleSelection') && !this.get('allowsEmptySelection')){
      items = this.get('displayItems').slice(0);
      
      len = items.length;
      value = this.get('value');
      isArray = SC.isArray(value);
      if (evt.which === 39 || evt.which === 40) {  
        for(i=0; i< len-1; i++){
          item=items[i];
          if( isArray ? (value.indexOf(item.get('value'))>=0) : (item.get('value')===value)){
            this.triggerItemAtIndex(i+1);
          }
        }
        return YES ; // handled
      }
      else if (evt.which === 37 || evt.which === 38) {
        for(i=1; i< len; i++){
          item=items[i];
          if( isArray ? (value.indexOf(item.get('value'))>=0) : (item.get('value')===value)){
            this.triggerItemAtIndex(i-1);
          }
        }
        return YES ; // handled
      }
    }
    return YES; 
  },
  
  mouseDown: function(evt) {
    var childViews = this.get('childViews'),
        childView,
        index;
        
    if (!this.get('isEnabled')) return YES; // nothing to do
    
    index = this.displayItemIndexForEvent(evt);
    if (index >= 0) {                          
      
      childView = childViews[index];
      childView.set('isActive', YES);
      
      this.activeChildView = childView;
      
      // if mouse was pressed on a button, then start detecting pressed events
      this._isMouseDown = YES;
    }
    
    return YES ;
  },
  
  mouseUp: function(evt) {
    var activeChildView,
        index;
        
    index = this.displayItemIndexForEvent(evt);
    
    if (this._isMouseDown && (index >= 0)) {
    
      // Clean up
      this.triggerItemAtIndex(index);
    
      activeChildView = this.activeChildView;
      activeChildView.set('isActive', NO);
      this.activeChildView = null;
      
      this._isMouseDown = NO;
    }
      
    return YES ;
  },
  
  mouseMoved: function(evt) {
    var childViews = this.get('childViews'),
        activeChildView,
        childView,
        index;
        
    if (this._isMouseDown) {
      // Update the last segment
      index = this.displayItemIndexForEvent(evt);
      
      activeChildView = this.activeChildView;
      childView = childViews[index];
      
      if (childView && childView !== activeChildView) {
        // Changed
        if (activeChildView) activeChildView.set('isActive', NO);
        childView.set('isActive', YES);
        
        this.activeChildView = childView;
      }
    }
    return YES;
  },
  
  mouseEntered: function(evt) {
    var childViews = this.get('childViews'),
        childView,
        index;
        
    // if mouse was pressed down initially, start detection again
    if (this._isMouseDown) {
      index = this.displayItemIndexForEvent(evt);
      
      if (index >= 0) {
        childView = childViews[index];
        childView.set('isActive', YES);
        
        this.activeChildView = childView;
      }
    }
    return YES;
  },
  
  mouseExited: function(evt) {
    var activeChildView;
        
    // if mouse was down, hide active index
    if (this._isMouseDown) {
      activeChildView = this.activeChildView;
      if (activeChildView) activeChildView.set('isActive', NO);
        
      this.activeChildView = null;
    }
    
    return YES;
  },
  
  touchStart: function(touch) {
    var childViews = this.get('childViews'),
        childView,
        index;
    
    if (!this.get('isEnabled')) return YES; // nothing to do
    
    index = this.displayItemIndexForEvent(touch);
    
    if (index >= 0) {   
      childView = childViews[index];
      childView.set('isActive', YES);
      this.activeChildView = childView;
      
      this._isTouching = YES;
    }
    
    return YES ;
  },
  
  touchEnd: function(touch) {
    var activeChildView,
        index;
        
    index = this.displayItemIndexForEvent(touch);
    // if mouse was pressed on a button then detect where we where when we
    // release and use that one.
    if (this._isTouching && (index >= 0)) this.triggerItemAtIndex(index);
    
    // cleanup
    activeChildView = this.activeChildView;
    activeChildView.set('isActive', NO);
    this.activeChildView = null;
    
    this._isTouching = NO;
      
    return YES ;
  },
  
  touchesDragged: function(evt, touches) {
    var isTouching = this.touchIsInBoundary(evt),
        childViews = this.get('childViews'),
        activeChildView,
        childView,
        index;

    if (isTouching) {
      if (!this._isTouching) {
        this._touchDidEnter(evt);
      }
      index = this.displayItemIndexForEvent(evt);
      
      activeChildView = this.activeChildView;
      childView = childViews[index];
      
      if (childView && childView !== activeChildView) {
        // Changed
        if (activeChildView) activeChildView.set('isActive', NO);
        childView.set('isActive', YES);
        
        this.activeChildView = childView;
      }
    } else {
      if (this._isTouching) this._touchDidExit(evt);
    }
    
    this._isTouching = isTouching;
    
    return YES;
  },
  
  _touchDidExit: function(evt) {
    var activeChildView;
    
    activeChildView = this.activeChildView;
    activeChildView.set('isActive', NO);
    this.activeChildView = null;

    return YES;
  },
  
  _touchDidEnter: function(evt) {
    var childViews = this.get('childViews'),
        childView,
        index;
    
    index = this.displayItemIndexForEvent(evt);
    
    if (index >= 0) {
      childView = childViews[index];
      childView.set('isActive', YES);
      this.activeChildView = childView;
    }
      
    return YES;
  },

  /** 
    Simulates the user clicking on the segment at the specified index. This
    will update the value if possible and fire the action.
  */
  triggerItemAtIndex: function(index) {
    var childViews = this.get('childViews'),
        childView,
        sel, value, val, empty, mult;
    
    childView = childViews[index];
    
    if (!childView.get('isEnabled')) return this; // nothing to do!

    empty = this.get('allowsEmptySelection');
    mult = this.get('allowsMultipleSelection');
    
    
    // get new value... bail if not enabled. Also save original for later.
    sel = childView.get('value');
    value = val = this.get('value') ;
      
    if (SC.empty(value)) {
      value = [];
    } else if (!SC.isArray(value)) {
      value = [value]; // force to array
    }
    
    // if we do not allow multiple selection, either replace the current
    // selection or deselect it
    if (!mult) {
      // if we allow empty selection and the current value is the same as
      // the selected value, then deselect it.
      if (empty && (value.get('length')===1) && (value.objectAt(0)===sel)) {
        value = [];
      
      // otherwise, simply replace the value.
      } else value = [sel] ;
      
    // if we do allow multiple selection, then add or remove item to the array.
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
    
    // Clean up previously selected segments (and assign new ones)
    for (var i = childViews.length - 1; i >= 0; i--) {
      childView = childViews[i];
      if (SC.isArray(value) ? value.indexOf(childView.get('value')) >= 0 : value === childView.get('value')) {
        childView.set('isSelected', YES);
      } else {
        childView.set('isSelected', NO);
      }
    }
    
    // also, trigger target if needed.
    var actionKey = this.get('itemActionKey'),
        targetKey = this.get('itemTargetKey'),
        action, target = null,
        resp = this.getPath('pane.rootResponder'),
        item;

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
    
});