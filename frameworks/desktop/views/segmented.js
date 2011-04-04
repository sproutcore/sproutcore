// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
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
  | *segmentViewClass* | class to be used for creating segments |

  @extends SC.View
  @since SproutCore 1.0
*/
SC.SegmentedView = SC.View.extend(SC.Control,
/** @scope SC.SegmentedView.prototype */ {

  ariaRole: 'tablist',

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

  /**
    Aligns the segments of the segmented view within its frame horizontally.
  */
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

    Note: only SC.Object items support key-value coding and therefore may be
    observed by the view for changes to titles, values, icons, widths,
    isEnabled values & tooltips.

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

  /**
    The title to use for the overflow segment if it appears.

    @property {String}
  */
  overflowTitle: '&raquo;',

  /**
    The toolTip to use for the overflow segment if it appears.

    @property {String}
  */
  overflowToolTip: 'More&hellip;',

  /**
    The icon to use for the overflow segment if it appears.

    @property {String}
  */
  overflowIcon: null,

  /**
    The view class used when creating segments.

    @property {SC.View}
  */
  segmentViewClass: SC.SegmentView,


  /** @private
    The following properties are used to map items to child views. Item keys
    are looked up on the item based on this view's value for each 'itemKey'.
    If a value in the item is found, then that value is mapped to a child
    view using the matching viewKey.

    @property {Array}
  */
  itemKeys: 'itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemWidthKey itemToolTipKey itemKeyEquivalentKey'.w(),
  viewKeys: 'title value isEnabled icon width toolTip keyEquivalent'.w(),

  /**
    Call itemsDidChange once to initialize segment child views for the items that exist at
    creation time.
  */
  init: function() {
    sc_super();

    var title = this.get('overflowTitle'),
        toolTip = this.get('overflowToolTip'),
        icon = this.get('overflowIcon'),
        overflowView;

    overflowView = this.get('segmentViewClass').create({
      controlSize: this.get('controlSize'),
      localize: this.get('localize'),
      title: title,
      toolTip: toolTip,
      icon: icon,
      isLastSegment: YES,
      isOverflowSegment: YES
    });

    this.appendChild(overflowView);

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
        overflowView = childViews.lastObject(),
        value = this.get('value'),        // The value can change if items that were once selected are removed
        isSelected,
        itemKeys = this.get('itemKeys'),
        itemKey,
        viewKeys = this.get('viewKeys'),
        viewKey,
        segmentViewClass = this.get('segmentViewClass'),
        i, j;

    // Update childViews
    if (childViews.get('length') - 1 > items.get('length')) {   // We've lost segments (ie. childViews)

      // Remove unneeded segments from the end back
      for (i = childViews.get('length') - 2; i >= items.get('length'); i--) {
        childView = childViews.objectAt(i);

        // If a selected childView has been removed then update our value
        if (SC.isArray(value)) {
          value.removeObject(childView.get('value'));
        } else if (value === childView.get('value')) {
          value = null;
        }

        this.removeChild(childView);
      }

      // Update our value which may have changed
      this.set('value', value);

    } else if (childViews.get('length') - 1 < items.get('length')) {  // We've gained segments

      // Create the new segments
      for (i = childViews.get('length') - 1; i < items.get('length'); i++) {

        // We create a default SC.ButtonView-like object for each segment
        childView = segmentViewClass.create({
          controlSize: this.get('controlSize'),
          localize: this.get('localize')
        });

        // Attach the child
        this.insertBefore(childView, overflowView);
      }
    }

    // Because the items array can be altered with insertAt or removeAt, we can't be sure that the items
    // continue to match 1-to-1 the existing views, so once we have the correct number of childViews,
    // simply update them all
    childViews = this.get('childViews');

    for (i = 0; i < items.get('length'); i++) {
      localItem = items.objectAt(i);
      childView = childViews.objectAt(i);

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
        for (j = itemKeys.get('length') - 1; j >= 0; j--) {
          itemKey = this.get(itemKeys.objectAt(j));

          if (itemKey) {
            localItem.removeObserver(itemKey, this, this.itemContentDidChange);
            localItem.addObserver(itemKey, this, this.itemContentDidChange, i);
          }
        }
      } else {
        SC.Logger.error('SC.SegmentedView items may be Strings, Objects (ie. Hashes) or SC.Objects only');
      }

      // Determine whether this segment is selected based on the view's existing value(s)
      isSelected = NO;
      if (SC.isArray(value) ? value.indexOf(localItem.get(this.get('itemValueKey'))) >= 0 : value === localItem.get(this.get('itemValueKey'))) {
        isSelected = YES;
      }
      childView.set('isSelected', isSelected);

      // Assign segment specific properties based on position
      childView.set('index', i);
      childView.set('isFirstSegment', i === 0);
      childView.set('isMiddleSegment',  i < items.get('length') - 1 && i > 0);
      childView.set('isLastSegment', i === items.get('length') - 1);

      // Be sure to update the view's properties for the (possibly new) matched item
      childView.updateItem(this, localItem);
    }

    // Force a segment remeasure to check overflow
    this.invokeLast(this.remeasure);
  }.observes('*items.[]'),

  /**
    This observer method is called whenever any of the relevant properties of an item change.  This only applies
    to SC.Object based items that may be observed.

  */
  itemContentDidChange: function(item, key, alwaysNull, index) {
    var items = this.get('items'),
        childViews = this.get('childViews'),
        childView;

    childView = childViews.objectAt(index);
    if (childView) {

      // Update the childView
      childView.updateItem(this, item);
    } else {
      SC.Logger.warn("Item content change was observed on item without matching segment child view.");
    }

    // Reset our measurements (which depend on width or title) and adjust visible views
    this.invokeLast(this.remeasure);
  },

  /**
    Whenever the view resizes, we need to check to see if we're overflowing.

  */
  viewDidResize: function() {
    var visibleWidth = this.$().width();

    // Only overflow if we've gone below the minimum width required to fit all the segments
    if (this.isOverflowing || visibleWidth <= this.cachedMinimumWidth) this.adjustOverflow();
  },

  /**
    Whenever visibility changes, we need to check to see if we're overflowing.

   */
  isVisibleInWindowDidChange: function() {
    this.invokeLast(this.remeasure);
  }.observes('isVisibleInWindow'),

  /** @private
    Calling this method forces the segments to be remeasured and will also adjust the
    segments for overflow if necessary.

  */
  remeasure: function() {
    var renderDelegate = this.get('renderDelegate'),
        childViews = this.get('childViews'),
        overflowView;

    if (this.get('isVisibleInWindow')) {
      // Make all the views visible so that they can be measured
      overflowView = childViews.lastObject();
      overflowView.set('isVisible', YES);

      for (var i = childViews.get('length') - 1; i >= 0; i--){
        childViews.objectAt(i).set('isVisible', YES);
      }

      this.cachedWidths = renderDelegate.segmentWidths(this);
      this.cachedOverflowWidth = renderDelegate.overflowSegmentWidth(this);

      this.adjustOverflow();
    }
  },

  /** @private
    This method is called to adjust the segment views for overflow.

   */
  adjustOverflow: function() {
    var childViews = this.get('childViews'),
        childView,
        value = this.get('value'),
        overflowView = childViews.lastObject(),
        visibleWidth = this.$().width(),             // The inner width of the div
        curElementsWidth = 0,
        widthToFit,
        length, i;

    // This variable is useful to optimize when we are overflowing
    this.isOverflowing = NO;
    overflowView.set('isSelected', NO);

    // Clear out the overflow items (these are the items not currently visible)
    this.overflowItems = [];

    length = this.cachedWidths.length;
    for (i=0; i < length; i++) {
      childView = childViews.objectAt(i);
      curElementsWidth += this.cachedWidths[i];

      // check for an overflow (leave room for the overflow segment except for with the last segment)
      widthToFit = (i === length - 1) ? curElementsWidth : curElementsWidth + this.cachedOverflowWidth;

      if (widthToFit > visibleWidth) {
        // Add the localItem to the overflowItems
        this.overflowItems.pushObject(childView.get('localItem'));

        // Record that we're now overflowing
        this.isOverflowing = YES;

        childView.set('isVisible', NO);

        // If the first item is already overflowed, make the overflowView first segment
        if (i === 0) overflowView.set('isFirstSegment', YES);

        // If the overflowed segment was selected, show the overflowView as selected instead
        if (SC.isArray(value) ? value.indexOf(childView.get('value')) >= 0 : value === childView.get('value')) {
          overflowView.set('isSelected', YES);
        }
      } else {
        childView.set('isVisible', YES);

        // If the first item is not overflowed, don't make the overflowView first segment
        if (i === 0) overflowView.set('isFirstSegment', NO);
      }
    }

    // Show/hide the overflow view if we have overflowed
    if (this.isOverflowing) overflowView.set('isVisible', YES);
    else overflowView.set('isVisible', NO);

    // Store the minimum width before overflow
    this.cachedMinimumWidth = curElementsWidth + this.cachedOverflowWidth;
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
    var childViews,
        childView,
        i, length,
        value, isArray;

    // handle tab key
    if (evt.which === 9 || evt.keyCode === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if(view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }

    // handle arrow keys
    if (!this.get('allowsMultipleSelection')) {
      childViews = this.get('childViews');

      length = childViews.get('length');
      value = this.get('value');
      isArray = SC.isArray(value);

      // Select from the left to the right
      if (evt.which === 39 || evt.which === 40) {

        if (value) {
          for(i = 0; i < length - 2; i++){
            childView = childViews.objectAt(i);
            if ( isArray ? (value.indexOf(childView.get('value'))>=0) : (childView.get('value')===value)){
              this.triggerItemAtIndex(i + 1);
            }
          }
        } else {
          this.triggerItemAtIndex(0);
        }
        return YES ; // handled

      // Select from the right to the left
      } else if (evt.which === 37 || evt.which === 38) {

        if (value) {
          for(i = 1; i < length - 1; i++) {
            childView = childViews.objectAt(i);
            if ( isArray ? (value.indexOf(childView.get('value'))>=0) : (childView.get('value')===value)){
              this.triggerItemAtIndex(i - 1);
            }
          }
        } else {
          this.triggerItemAtIndex(length - 2);
        }

        return YES; // handled
      }
    }

    return NO;
  },

  mouseDown: function(evt) {
    var childViews = this.get('childViews'),
        childView,
        overflowIndex = childViews.get('length') - 1,
        index;

    if (!this.get('isEnabled')) return YES; // nothing to do

    index = this.displayItemIndexForEvent(evt);

    if (index >= 0) {
      childView = childViews.objectAt(index);
      childView.set('isActive', YES);
      this.activeChildView = childView;

      // if mouse was pressed on the overflow segment, popup the menu
      if (index === overflowIndex) this.showOverflowMenu();
      else this._isMouseDown = YES;
    }

    return YES;
  },

  mouseUp: function(evt) {
    var activeChildView,
        index;

    index = this.displayItemIndexForEvent(evt);

    if (this._isMouseDown && (index >= 0)) {

      this.triggerItemAtIndex(index);

      // Clean up
      activeChildView = this.activeChildView;
      activeChildView.set('isActive', NO);
      this.activeChildView = null;

      this._isMouseDown = NO;
    }

    return YES;
  },

  mouseMoved: function(evt) {
    var childViews = this.get('childViews'),
        overflowIndex = childViews.get('length') - 1,
        activeChildView,
        childView,
        index;

    if (this._isMouseDown) {
      // Update the last segment
      index = this.displayItemIndexForEvent(evt);

      activeChildView = this.activeChildView;
      childView = childViews.objectAt(index);

      if (childView && childView !== activeChildView) {
        // Changed
        if (activeChildView) activeChildView.set('isActive', NO);
        childView.set('isActive', YES);

        this.activeChildView = childView;

        if (index === overflowIndex) {
          this.showOverflowMenu();
          this._isMouseDown = NO;
        }
      }
    }
    return YES;
  },

  mouseEntered: function(evt) {
    var childViews = this.get('childViews'),
        childView,
        overflowIndex = childViews.get('length') - 1,
        index;

    // if mouse was pressed down initially, start detection again
    if (this._isMouseDown) {
      index = this.displayItemIndexForEvent(evt);

      // if mouse was pressed on the overflow segment, popup the menu
      if (index === overflowIndex) {
        this.showOverflowMenu();
        this._isMouseDown = NO;
      } else if (index >= 0) {
        childView = childViews.objectAt(index);
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
        overflowIndex = childViews.get('length') - 1,
        index;

    if (!this.get('isEnabled')) return YES; // nothing to do

    index = this.displayItemIndexForEvent(touch);

    if (index >= 0) {
      childView = childViews.objectAt(index);
      childView.set('isActive', YES);
      this.activeChildView = childView;

      // if touch was on the overflow segment, popup the menu
      if (index === overflowIndex) this.showOverflowMenu();
      else this._isTouching = YES;
    }

    return YES ;
  },

  touchEnd: function(touch) {
    var activeChildView,
        index;

    index = this.displayItemIndexForEvent(touch);

    if (this._isTouching && (index >= 0)) {
      this.triggerItemAtIndex(index);

      // Clean up
      activeChildView = this.activeChildView;
      activeChildView.set('isActive', NO);
      this.activeChildView = null;

      this._isTouching = NO;
    }

    return YES;
  },

  touchesDragged: function(evt, touches) {
    var isTouching = this.touchIsInBoundary(evt),
        childViews = this.get('childViews'),
        overflowIndex = childViews.get('length') - 1,
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

        if (index === overflowIndex) {
          this.showOverflowMenu();
          this._isMouseDown = NO;
        }
      }
    } else {
      if (this._isTouching) this._touchDidExit(evt);
    }

    this._isTouching = isTouching;

    return YES;
  },

  _touchDidExit: function(evt) {
    var activeChildView;

    if (this.isTouching) {
      activeChildView = this.activeChildView;
      activeChildView.set('isActive', NO);
      this.activeChildView = null;
    }

    return YES;
  },

  _touchDidEnter: function(evt) {
    var childViews = this.get('childViews'),
        childView,
        overflowIndex = childViews.get('length') - 1,
        index;

    index = this.displayItemIndexForEvent(evt);

    if (index === overflowIndex) {
      this.showOverflowMenu();
      this._isTouching = NO;
    } else if (index >= 0) {
      childView = childViews.objectAt(index);
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

    childView = childViews.objectAt(index);

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

    // also, trigger target if needed.
    var actionKey = this.get('itemActionKey'),
        targetKey = this.get('itemTargetKey'),
        action, target = null,
        resp = this.getPath('pane.rootResponder'),
        item;

    if (actionKey && (item = this.get('items').objectAt(index))) {
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

  /** @private
    Invoked whenever an item is selected in the overflow menu.
  */
  selectOverflowItem: function(menu) {
    var item = menu.get('selectedItem');

    this.triggerItemAtIndex(item.get('index'));

    // Cleanup
    menu.removeObserver('selectedItem', this, 'selectOverflowItem');

    this.activeChildView.set('isActive', NO);
    this.activeChildView = null;
  },

  /** @private
    Presents the popup menu containing overflowed segments.
  */
  showOverflowMenu: function() {
    var childViews = this.get('childViews'),
        overflowViewIndex = childViews.get('length') - 1,
        overflowItems = this.overflowItems,
        overflowItemsLength,
        startIndex,
        isArray, value;

    // Check the currently selected item if it is in overflowItems
    overflowItemsLength = overflowItems.get('length');
    startIndex = childViews.get('length') - 1 - overflowItemsLength;

    value = this.get('value');
    isArray = SC.isArray(value);
    for (var i = 0; i < overflowItemsLength; i++) {
      var item = overflowItems.objectAt(i),
          itemValueKey = this.get('itemValueKey');

      if (isArray ? value.indexOf(item.get(itemValueKey)) >= 0 : value === item.get(itemValueKey)) {
        item.set('isChecked', YES);
      } else {
        item.set('isChecked', NO);
      }

      // Track the matching segment index
      item.set('index', startIndex + i);
    }

    // TODO: we can't pass a shortcut key to the menu, because it isn't a property of SegmentedView (yet?)
    var self = this;

    var menu = SC.MenuPane.create({
      layout: { width: 200 },
      items: overflowItems,
      itemTitleKey: this.get('itemTitleKey'),
      itemIconKey: this.get('itemIconKey'),
      itemIsEnabledKey: this.get('itemIsEnabledKey'),
      itemKeyEquivalentKey: this.get('itemKeyEquivalentKey'),
      itemCheckboxKey: 'isChecked',

      // We need to be able to update our overflow segment even if the user clicks outside of the menu.  Since
      // there is no callback method or observable property when the menu closes, override modalPaneDidClick().
      modalPaneDidClick: function() {
        sc_super();

        // Cleanup
        this.removeObserver('selectedItem', self, 'selectOverflowItem');

        self.activeChildView.set('isActive', NO);
        self.activeChildView = null;
      }
    });

    var layer = this.get('layer');
    var overflowElement = layer.childNodes[layer.childNodes.length - 1];
    menu.popup(overflowElement);

    menu.addObserver("selectedItem", this, 'selectOverflowItem');
  },

  /** @private
    Whenever the value changes, update the segments accordingly.
  */
  valueDidChange: function() {
    var value = this.get('value'),
        overflowItemsLength,
        childViews = this.get('childViews'),
        overflowIndex = Infinity,
        overflowView = childViews.lastObject(),
        childView,
        isSelected;

    // The index where childViews are all overflowed
    if (this.overflowItems) {
      overflowItemsLength = this.overflowItems.get('length');
      overflowIndex = childViews.get('length') - 1 - overflowItemsLength;

      // Clear out the selected value of the overflowView (if it's set)
      overflowView.set('isSelected', NO);
    }

    for (var i = childViews.get('length') - 2; i >= 0; i--) {
      childView = childViews.objectAt(i);
      if (SC.isArray(value) ? value.indexOf(childView.get('value')) >= 0 : value === childView.get('value')) {
        childView.set('isSelected', YES);

        // If we've gone over the overflow index, the child view is represented in overflow items
        if (i >= overflowIndex) overflowView.set('isSelected', YES);
      } else {
        childView.set('isSelected', NO);
      }
    }
  }.observes('value'),

  /** tied to the isEnabled state */
   acceptsFirstResponder: function() {
     if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
     else return NO;
   }.property('isEnabled').cacheable()

});
