// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/segment');

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

  # Defining Your Segments

  You define your segments by providing a items array, much like you provide
  to a RadioView.  Your items array can be as simple as an array of strings
  or as complex as full model objects.  Based on how you configure your
  itemKey properties, the segmented view will read the properties it needs
  from the array and construct the button.

  You can define the following properties on objects you pass in:

    - *itemTitleKey* - the title of the button
    - *itemValueKey* - the value of the button
    - *itemWidthKey* - the preferred width. if omitted, it autodetects
    - *itemIconKey*  - an icon
    - *itemActionKey* - an optional action to fire when pressed
    - *itemTargetKey* - an optional target for the action
    - *itemLayerIdKey* - an optional target for the action
    - *segmentViewClass* - class to be used for creating segments

  @extends SC.View
  @extends SC.Control
  @since SproutCore 1.0
*/
SC.SegmentedView = SC.View.extend(SC.Control,
/** @scope SC.SegmentedView.prototype */ {

  /** @private
    @ field
    @type Boolean
    @default YES
  */
  acceptsFirstResponder: function () {
    if (SC.FOCUS_ALL_CONTROLS) { return this.get('isEnabledInPane'); }
    return NO;
  }.property('isEnabledInPane').cacheable(),

  /** @private
    @type String
    @default 'tablist'
    @readOnly
  */
  //ariaRole: 'tablist',
  ariaRole: 'group', // workaround for <rdar://problem/10444670>; switch back to 'tablist' later with <rdar://problem/10463928> (also see segment.js)

  /** @private
    @type Array
    @default ['sc-segmented-view']
    @see SC.View#classNames
  */
  classNames: ['sc-segmented-view'],

  /**
    @type String
    @default 'square'
    @see SC.ButtonView#theme
  */
  theme: 'square',

  /**
    The value of the segmented view.

    The SegmentedView's value will always be the value of the currently
    selected button or buttons.  Setting this value will change the selected
    button or buttons.

    If you set this value to something that has no matching button, then
    no buttons will be selected.

    Note: if allowsMultipleSelection is set to true, then the value must be
    an Array.

    @type Object | Array
    @default null
  */
  value: null,

  /**
    If YES, clicking a selected button again will deselect it, setting the
    segmented views value to null.

    @type Boolean
    @default NO
  */
  allowsEmptySelection: NO,

  /**
    If YES, then clicking on a tab will not deselect the other segments, it
    will simply add or remove it from the selection.

    @type Boolean
    @default NO
  */
  allowsMultipleSelection: NO,

  /**
    If YES, it will set the segment value even if an action is defined.

    @type Boolean
    @default NO
  */
  selectSegmentWhenTriggeringAction: NO,

  /**
    @type Boolean
    @default YES
  */
  localize: YES,

  /**
    Aligns the segments of the segmented view within its frame horizontally.
    Possible values:

      - SC.ALIGN_LEFT
      - SC.ALIGN_RIGHT
      - SC.ALIGN_CENTER

    @type String
    @default SC.ALIGN_CENTER
  */
  align: SC.ALIGN_CENTER,

  /**
    Change the layout direction to make this a vertical set of tabs instead
    of horizontal ones. Possible values:

      - SC.LAYOUT_HORIZONTAL
      - SC.LAYOUT_VERTICAL

    @type String
    @default SC.LAYOUT_HORIZONTAL
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

    @type Array
    @default null
  */
  items: null,

  /**
    The key that contains the title for each item.

    @type String
    @default null
  */
  itemTitleKey: null,

  /**
    The key that contains the value for each item.

    @type String
    @default null
  */
  itemValueKey: null,

  /**
    A key that determines if this item in particular is enabled.  Note if the
    control in general is not enabled, no items will be enabled, even if the
    item's enabled property returns YES.

    @type String
    @default null
  */
  itemIsEnabledKey: null,

  /**
    The key that contains the icon for each item.  If omitted, no icons will
    be displayed.

    @type String
    @default null
  */
  itemIconKey: null,

  /**
    The key that contains the desired width for each item.  If omitted, the
    width will autosize.

    @type String
    @default null
  */
  itemWidthKey: null,

  /**
    The key that contains the action for this item.  If defined, then
    selecting this item will fire the action in addition to changing the
    value.  See also itemTargetKey.

    @type String
    @default null
  */
  itemActionKey: null,

  /**
    The key that contains the target for this item.  If this and itemActionKey
    are defined, then this will be the target of the action fired.

    @type String
    @default null
  */
  itemTargetKey: null,

  /**
    The key that contains the layerId for each item.
    @type String
  */
  itemLayerIdKey: null,

  /**
    The key that contains the key equivalent for each item.  If defined then
    pressing that key equivalent will be like selecting the tab.  Also,
    pressing the Alt or Option key for 3 seconds will display the key
    equivalent in the tab.

    @type String
    @default null
  */
  itemKeyEquivalentKey: null,

  /**
    If YES, overflowing items are placed into a menu and an overflow segment is
    added to popup that menu.

    @type Boolean
    @default YES
  */
  shouldHandleOverflow: YES,

  /**
    The title to use for the overflow segment if it appears.

    NOTE: This will not be HTML escaped and must never be assigned to user inserted text!

    @type String
    @default '&raquo;'
  */
  overflowTitle: '&raquo;',

  /**
    The toolTip to use for the overflow segment if it appears.

    @type String
    @default 'More&hellip;'
  */
  overflowToolTip: 'More…',

  /**
    The icon to use for the overflow segment if it appears.

    @type String
    @default null
  */
  overflowIcon: null,

  /**
    The view class used when creating segments.

    @type SC.View
    @default SC.SegmentView
  */
  segmentViewClass: SC.SegmentView,

  /**
    Set to YES if you would like your SegmentedView to size itself based on its
    visible segments. Useful if you're using SegmentedView in a flowed context
    (for example if its parent view has `childViewLayout: SC.View.HORIZONTAL_STACK`).

    The view will not auto-resize unless you define an initial value for the layout
    property which will be auto-resized (i.e. `width` when in the default horizontal
    orientation). This is to prevent the view from inappropriately adding width to a
    flexible (`{ left: 0, right: 0 }`) layout.

    Has no effect if `shouldHandleOverflow` is NO.

    @type Boolean
    @default NO
   */
  shouldAutoResize: NO,

  /** @private
    The following properties are used to map items to child views. Item keys
    are looked up on the item based on this view's value for each 'itemKey'.
    If a value in the item is found, then that value is mapped to a child
    view using the matching viewKey.

    @type Array
  */
  itemKeys: ['itemTitleKey', 'itemValueKey', 'itemIsEnabledKey', 'itemIconKey', 'itemWidthKey', 'itemToolTipKey', 'itemKeyEquivalentKey', 'itemLayerIdKey'],

  /** @private */
  viewKeys: ['title', 'value', 'isEnabled', 'icon', 'width', 'toolTip', 'keyEquivalent', 'layerId'],

  /** @private
    Call itemsDidChange once to initialize segment child views for the items that exist at
    creation time.
  */
  init: function () {
    sc_super();

    // Initialize.
    this.shouldHandleOverflowDidChange();
    this.itemsDidChange();
  },

  shouldHandleOverflowDidChange: function () {
    var overflowView = this.get('overflowView');

    if (this.get('shouldHandleOverflow')) {
      var title = this.get('overflowTitle'),
          toolTip = this.get('overflowToolTip'),
          icon = this.get('overflowIcon');

      overflowView = this.get('segmentViewClass').create({
        controlSize: this.get('controlSize'),
        escapeHTML: false,
        localize: this.get('localize'),
        title: title,
        toolTip: toolTip,
        icon: icon,
        isLastSegment: YES,
        isOverflowSegment: YES,
        layoutDirection: this.get('layoutDirection')
      });
      this.appendChild(overflowView);
      this.set('overflowView', overflowView);

      // remeasure should show/hide it as needed
      this.invokeLast(this.remeasure);
    } else {
      if (overflowView) { // There will not be an overflow view on initialization.
        this.removeChildAndDestroy(overflowView);
        this.set('overflowView', null);
      }
    }
  }.observes('shouldHandleOverflow'),

  /** @private
    Called whenever the number of items changes.  This method populates SegmentedView's childViews, taking
    care to re-use existing childViews if possible.
  */
  itemsDidChange: function () {
    var items = this.get('items') || [],
        localItem,                        // Used to avoid altering the original items
        previousItem,
        childViews = this.get('childViews'),
        childView,
        overflowView = this.get('overflowView'),
        value = this.get('value'),        // The value can change if items that were once selected are removed
        isSelected,
        itemKeys = this.get('itemKeys'),
        itemKey,
        segmentViewClass = this.get('segmentViewClass'),
        i, j;

    // Update childViews
    var childViewsLength = this.get('shouldHandleOverflow') ? childViews.get('length') - 1 : childViews.get('length');
    if (childViewsLength > items.get('length')) {   // We've lost segments (ie. childViews)

      // Remove unneeded segments from the end back
      for (i = childViewsLength - 1; i >= items.get('length'); i--) {
        childView = childViews.objectAt(i);
        localItem = childView.get('localItem');

        // Remove observers from items we are losing off the end
        if (localItem instanceof SC.Object) {

          for (j = itemKeys.get('length') - 1; j >= 0; j--) {
            itemKey = this.get(itemKeys.objectAt(j));

            if (itemKey) {
              localItem.removeObserver(itemKey, this, this.itemContentDidChange);
            }
          }
        }

        // If a selected childView has been removed then update our value
        if (SC.isArray(value)) {
          value.removeObject(localItem);
        } else if (value === localItem) {
          value = null;
        }

        this.removeChildAndDestroy(childView);
      }

      // Update our value which may have changed
      this.set('value', value);

    } else if (childViewsLength < items.get('length')) {  // We've gained segments

      // Create the new segments
      for (i = childViewsLength; i < items.get('length'); i++) {

        // We create a default SC.ButtonView-like object for each segment
        childView = segmentViewClass.create({
          controlSize: this.get('controlSize'),
          localize: this.get('localize'),
          layoutDirection: this.get('layoutDirection')
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
      previousItem = childView.get('localItem');

      if (previousItem instanceof SC.Object && !items.contains(previousItem)) {
        // If the old item is no longer in the view, remove its observers
        for (j = itemKeys.get('length') - 1; j >= 0; j--) {
          itemKey = this.get(itemKeys.objectAt(j));

          if (itemKey) {
            previousItem.removeObserver(itemKey, this, this.itemContentDidChange);
          }
        }
      }

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
    if (this.get('shouldHandleOverflow')) {
      this.invokeLast(this.remeasure);
    }
  }.observes('*items.[]'),

  /** @private
    This observer method is called whenever any of the relevant properties of an item change.  This only applies
    to SC.Object based items that may be observed.
  */
  itemContentDidChange: function (item, key, alwaysNull, index) {
    var childViews = this.get('childViews'),
        childView;

    childView = childViews.objectAt(index);
    if (childView) {

      // Update the childView
      childView.updateItem(this, item);

      // Reset our measurements (which depend on width/height or title) and adjust visible views
      if (this.get('shouldHandleOverflow')) {
        this.invokeLast(this.remeasure);
      }
    }
  },

  /** @private
    Whenever the view resizes, we need to check to see if we're overflowing.
  */
  viewDidResize: function () {
    this._sc_viewFrameDidChange();

    var isHorizontal = this.get('layoutDirection') === SC.LAYOUT_HORIZONTAL,
      visibleDim = isHorizontal ? this.$().width() : this.$().height();

    // Only overflow if we've gone below the minimum dimension required to fit all the segments
    if (this.get('shouldHandleOverflow') && (this.get('isOverflowing') || visibleDim <= this.cachedMinimumDim)) {
      this.invokeLast(this.remeasure);
    }
  },

  /** @private
    Whenever visibility changes, we need to check to see if we're overflowing.
  */
  isVisibleInWindowDidChange: function () {
    if (this.get('shouldHandleOverflow')) {
      this.invokeLast(this.remeasure);
    }
  }.observes('isVisibleInWindow'),

  /** @private
    Calling this method forces the segments to be remeasured and will also adjust the
    segments for overflow if necessary.
  */
  remeasure: function () {
    if (!this.get('shouldHandleOverflow')) { return; }

    var childViews = this.get('childViews'),
        overflowView;

    if (this.get('isVisibleInWindow')) {
      // Make all the views visible so that they can be measured
      overflowView = this.get('overflowView');
      overflowView.set('isVisible', YES);

      for (var i = childViews.get('length') - 1; i >= 0; i--) {
        childViews.objectAt(i).set('isVisible', YES);
      }

      this.cachedDims = this.segmentDimensions();
      this.cachedOverflowDim = this.overflowSegmentDim();

      this.adjustOverflow();
    }
  },

  /** @private
    This method is called to adjust the segment views to see if we need to handle for overflow.
   */
  adjustOverflow: function () {
    if (!this.get('shouldHandleOverflow')) { return; }

    var childViews = this.get('childViews'),
        childView,
        value = this.get('value'),
        overflowView = this.get('overflowView'),
        isHorizontal = this.get('layoutDirection') === SC.LAYOUT_HORIZONTAL,
        visibleDim = isHorizontal ? this.$().width() : this.$().height(),  // The inner width/height of the div
        curElementsDim = 0,
        dimToFit, length, i,
        isOverflowing = NO,
        wantsAutoResize = this.get('shouldAutoResize'),
        layoutProperty = isHorizontal ? 'width' : 'height',
        canAutoResize = !SC.none(this.getPath('layout.%@'.fmt(layoutProperty))),
        willAutoResize = wantsAutoResize && canAutoResize;

    // If child views and cachedDims lengths are out of sync here, it means adjustOverflow
    // got called in between itemsDidChange and remeasure. Since we know that the remeasure is
    // scheduled, just return and let the remeasure + adjustOverflow happen later.
    if (childViews.get('length') !== this.cachedDims.length + 1) { return; }

    // This variable is useful to optimize when we are overflowing
    isOverflowing = NO;
    overflowView.set('isSelected', NO);

    // Clear out the overflow items (these are the items not currently visible)
    this.overflowItems = [];

    length = this.cachedDims.length;
    for (i = 0; i < length; i++) {
      childView = childViews.objectAt(i);
      curElementsDim += this.cachedDims[i];

      // Check and see if this item kicks us over into overflow.
      if (!isOverflowing && !willAutoResize) {
        // (don't leave room for the overflow segment on the last item)
        dimToFit = (i === length - 1) ? curElementsDim : curElementsDim + this.cachedOverflowDim;
        if (dimToFit > visibleDim) isOverflowing = YES;
      }

      // Update the view depending on overflow state.
      if (isOverflowing) {
        // Add the localItem to the overflowItems
        this.overflowItems.pushObject(childView.get('localItem'));

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

    // Show/hide the overflow view as needed.
    overflowView.set('isVisible', isOverflowing);

    // Set the overflowing property.
    this.setIfChanged('isOverflowing', isOverflowing);

    // Autosize if needed.
    if (willAutoResize) {
      this.adjust(layoutProperty, this.isOverflowing ? this.cachedMinimumDim : curElementsDim);
    }

    // Store the minimum dimension (height/width) before overflow
    this.cachedMinimumDim = curElementsDim + this.cachedOverflowDim;
  },

  /**
    Return the dimensions (either heights or widths depending on the layout direction) of the DOM
    elements of the segments.  This will be measured by the view to determine which segments should
    be overflowed.

    It ignores the last segment (the overflow segment).
  */
  segmentDimensions: function () {
    var cv = this.get('childViews'),
        v, f,
        dims = [],
        isHorizontal = this.get('layoutDirection') === SC.LAYOUT_HORIZONTAL;

    for (var i = 0, length = cv.length; i < length - 1; i++) {
      v = cv[i];
      f = v.get('frame');
      dims[i] = isHorizontal ? f.width : f.height;
    }

    return dims;
  },

  /**
    Return the dimension (height or width depending on the layout direction) over the overflow segment.
  */
  overflowSegmentDim: function () {
    var cv = this.get('childViews'),
        v, f,
        isHorizontal = this.get('layoutDirection') === SC.LAYOUT_HORIZONTAL;

    v = cv.length && cv[cv.length - 1];
    if (v) {
      f = v.get('frame');
      return isHorizontal ? f.width : f.height;
    }

    return 0;
  },

  /**
    Return the index of the segment view that is the target of the mouse click.
  */
  indexForClientPosition: function (x, y) {
    var cv = this.get('childViews'),
        length, i,
        v, rect,
        point;

    point = { x: x, y: y };
    for (i = 0, length = cv.length; i < length; i++) {
      v = cv[i];

      rect = v.get('layer').getBoundingClientRect();
      rect = {
        x: rect.left,
        y: rect.top,
        width: (rect.right - rect.left),
        height: (rect.bottom - rect.top)
      };

      // Return the index early if found
      if (SC.pointInRect(point, rect)) return i;
    }

    // Default not found
    return -1;
  },

  // ..........................................................
  // RENDERING/DISPLAY SUPPORT
  //

  /**
    @type Array
    @default ['align']
    @see SC.View#displayProperties
  */
  displayProperties: ['align'],

  /**
    @type String
    @default 'segmentedRenderDelegate'
  */
  renderDelegateName: 'segmentedRenderDelegate',

  // ..........................................................
  // EVENT HANDLING
  //

  /** @private
    Determines the index into the displayItems array where the passed mouse
    event occurred.
  */
  displayItemIndexForEvent: function (evt) {
    var el = evt.target,
        x = evt.clientX,
        y = evt.clientY,
        ret = -1;

    if (el && el !== this.get('layer')) {
      // Accessibility workaround: WebKit sends all event coords as 0,0 for all AXPress-triggered events.
      // For example, triggering an element with VoiceOver in OS X.
      // Note: by ensuring that the event target wasn't our own layer, we avoid the situation where an
      // actual mouse clicked at 0,0 and hit only our layer.
      if (x === 0 && y === 0) {
        var offset = SC.offset(el);

        // Generate point coordinates in the middle of the target element.
        x = offset.x + Math.round(el.offsetWidth / 2);
        y = offset.y + Math.round(el.offsetHeight / 2);
      }

      var renderDelegate = this.get('renderDelegate');
      if (renderDelegate && renderDelegate.indexForClientPosition) {
        ret = renderDelegate.indexForClientPosition(this, x, y);
      } else {
        ret = this.indexForClientPosition(x, y);
      }
    }

    return ret;
  },

  /** @private */
  keyDown: function (evt) {
    var childViews,
        childView,
        i, length,
        value, isArray;

    // handle tab key
    if (evt.which === 9 || evt.keyCode === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if (view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES; // handled
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
          for (i = 0; i < length - 2; i++) {
            childView = childViews.objectAt(i);
            if (isArray ? (value.indexOf(childView.get('value')) >= 0) : (childView.get('value') === value)) {
              this.triggerItemAtIndex(i + 1);
            }
          }
        } else {
          this.triggerItemAtIndex(0);
        }
        return YES; // handled

      // Select from the right to the left
      } else if (evt.which === 37 || evt.which === 38) {

        if (value) {
          for (i = 1; i < length - 1; i++) {
            childView = childViews.objectAt(i);
            if (isArray ? (value.indexOf(childView.get('value')) >= 0) : (childView.get('value') === value)) {
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

  /** @private */
  mouseDown: function (evt) {
    // Fast path, reject secondary clicks.
    if (evt.which !== 1) return false;

    var childViews = this.get('childViews'),
        childView,
        index;

    if (!this.get('isEnabledInPane')) return YES; // nothing to do // TODO: return NO?

    index = this.displayItemIndexForEvent(evt);
    if (index >= 0) {
      childView = childViews.objectAt(index);
      if (childView.get('isEnabled')) childView.set('isActive', YES);
      this.activeChildView = childView;

      // if mouse was pressed on the overflow segment, popup the menu
      var overflowIndex = this.get('shouldHandleOverflow') ? childViews.get('length') - 1 : null;
      if (index === overflowIndex) this.showOverflowMenu();
      else this._isMouseDown = YES;

      return YES;
    }
    // If this event originated outside of a segment, pass the event along up.
    else {
      return NO;
    }
  },

  /** @private */
  mouseUp: function (evt) {
    var activeChildView,
        index;

    index = this.displayItemIndexForEvent(evt);
    if (this._isMouseDown && (index >= 0)) {

      this.triggerItemAtIndex(index);

      // Clean up
      activeChildView = this.activeChildView;
      if (activeChildView) {
        activeChildView.set('isActive', NO);
        this.activeChildView = null;
      }
    }

    this._isMouseDown = NO;
    return YES;
  },

  /** @private */
  mouseMoved: function (evt) {
    var childViews = this.get('childViews'),
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
        if (childView.get('isEnabled')) childView.set('isActive', YES);
        this.activeChildView = childView;

        var overflowIndex = this.get('shouldHandleOverflow') ? childViews.get('length') - 1 : null;
        if (index === overflowIndex) {
          this.showOverflowMenu();
          this._isMouseDown = NO;
        }
      }
    }
    return YES;
  },

  /** @private */
  mouseEntered: function (evt) {
    var childViews = this.get('childViews'),
        childView,
        index;

    // if mouse was pressed down initially, start detection again
    if (this._isMouseDown) {
      index = this.displayItemIndexForEvent(evt);

      // if mouse was pressed on the overflow segment, popup the menu
      var overflowIndex = this.get('shouldHandleOverflow') ? childViews.get('length') - 1 : null;
      if (index === overflowIndex) {
        this.showOverflowMenu();
        this._isMouseDown = NO;
      } else if (index >= 0) {
        childView = childViews.objectAt(index);
        if (childView.get('isEnabled')) childView.set('isActive', YES);

        this.activeChildView = childView;
      }
    }
    return YES;
  },

  /** @private */
  mouseExited: function (evt) {
    var activeChildView;

    // if mouse was down, hide active index
    if (this._isMouseDown) {
      activeChildView = this.activeChildView;
      if (activeChildView) activeChildView.set('isActive', NO);

      this.activeChildView = null;
    }

    return YES;
  },

  /** @private */
  touchStart: function (touch) {
    var childViews = this.get('childViews'),
        childView,
        index;

    if (!this.get('isEnabledInPane')) return YES; // nothing to do

    index = this.displayItemIndexForEvent(touch);

    if (index >= 0) {
      childView = childViews.objectAt(index);
      childView.set('isActive', YES);
      this.activeChildView = childView;

      // if touch was on the overflow segment, popup the menu
      var overflowIndex = this.get('shouldHandleOverflow') ? childViews.get('length') - 1 : null;
      if (index === overflowIndex) this.showOverflowMenu();
      else this._isTouching = YES;
    }

    return YES;
  },

  /** @private */
  touchEnd: function (touch) {
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

  /** @private */
  touchesDragged: function (evt, touches) {
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

        var overflowIndex = this.get('shouldHandleOverflow') ? childViews.get('length') - 1 : null;
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

  /** @private */
  _touchDidExit: function (evt) {
    var activeChildView;

    if (this.isTouching) {
      activeChildView = this.activeChildView;
      activeChildView.set('isActive', NO);
      this.activeChildView = null;
    }

    return YES;
  },

  /** @private */
  _touchDidEnter: function (evt) {
    var childViews = this.get('childViews'),
        childView,
        index;

    index = this.displayItemIndexForEvent(evt);

    var overflowIndex = this.get('shouldHandleOverflow') ? childViews.get('length') - 1 : null;
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

  /** @private
    Simulates the user clicking on the segment at the specified index. This
    will update the value if possible and fire the action.
  */
  triggerItemAtIndex: function (index) {
    var childViews = this.get('childViews'),
        childView,
        childValue, value, allowEmpty, allowMult;

    childView = childViews.objectAt(index);

    if (!childView.get('isEnabled')) return this; // nothing to do!

    allowEmpty = this.get('allowsEmptySelection');
    allowMult = this.get('allowsMultipleSelection');

    // get new value... bail if not enabled. Also save original for later.
    childValue = childView.get('value');
    value = this.get('value');

    // if we do not allow multiple selection, either replace the current
    // selection or deselect it
    if (!allowMult) {
      // if we allow empty selection and the current value is the same as
      // the selected value, then deselect it.
      if (allowEmpty && value === childValue) {
        value = null;
      } else {
        // otherwise, simply replace the value.
        value = childValue;
      }
    } else {
      // Lazily create the value array.
      if (!value) {
        value = [];
      } else if (!SC.isArray(value)) {
        value = [value];
      }

      // if we do allow multiple selection, then add or remove item to the array.
      if (value.indexOf(childValue) >= 0) {
        if (value.get('length') > 1 || (value.objectAt(0) !== childValue) || allowEmpty) {
          value = value.without(childValue);
        }
      } else {
        value = value.concat(childValue);
      }
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
      if (resp) resp.sendAction(action, target, this, this.get('pane'), value);
    }

    if (value !== undefined && (!action || this.get('selectSegmentWhenTriggeringAction'))) {
      this.set('value', value);
    }

    // if an action/target is defined on self use that also
    action = this.get('action');
    if (action && resp) {
      resp.sendAction(action, this.get('target'), this, this.get('pane'), value);
    }
  },

  /** @private
    Invoked whenever an item is selected in the overflow menu.
  */
  selectOverflowItem: function (menu) {
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
  showOverflowMenu: function () {
    var self = this,
        childViews = this.get('childViews'),
        itemValueKey = this.get('itemValueKey'),
        itemLayerIdKey = this.get('itemLayerIdKey'),
        overflowItems = this.overflowItems,
        overflowItemsLength,
        startIndex,
        isArray,
        value,
        item,
        layerId,
        layer,
        overflowElement;

    // Check the currently selected item if it is in overflowItems
    overflowItemsLength = overflowItems.get('length');
    startIndex = childViews.get('length') - 1 - overflowItemsLength;

    value = this.get('value');
    isArray = SC.isArray(value);
    for (var i = 0; i < overflowItemsLength; i++) {
      item = overflowItems.objectAt(i);

      if (isArray ? value.indexOf(item.get(itemValueKey)) >= 0 : value === item.get(itemValueKey)) {
        item.set('isChecked', YES);
      } else {
        item.set('isChecked', NO);
      }

      // Track the matching segment index
      item.set('index', startIndex + i);

      // Add '-overflow-menu-item' to the existing layer id (if set),
      // and use that as the layer id on the menu. This prevents the original
      // segment from being removed when the menu closes.
      layerId = item.get(itemLayerIdKey);
      if (layerId) {
        item.set('overflowLayerId', layerId + '-overflow-menu-item');
      }
    }

    // TODO: we can't pass a shortcut key to the menu, because it isn't a property of SegmentedView (yet?)
    var menu = SC.MenuPane.create({
      layout: { width: 200 },
      items: overflowItems,
      itemTitleKey: this.get('itemTitleKey'),
      itemIconKey: this.get('itemIconKey'),
      itemIsEnabledKey: this.get('itemIsEnabledKey'),
      itemKeyEquivalentKey: this.get('itemKeyEquivalentKey'),
      itemCheckboxKey: 'isChecked',
      itemLayerIdKey: 'overflowLayerId',

      // We need to be able to update our overflow segment even if the user clicks outside of the menu.  Since
      // there is no callback method or observable property when the menu closes, override modalPaneDidClick().
      modalPaneDidClick: function () {
        sc_super();

        // Cleanup
        this.removeObserver('selectedItem', self, 'selectOverflowItem');

        self.activeChildView.set('isActive', NO);
        self.activeChildView = null;
      }
    });

    layer = this.get('layer');
    overflowElement = layer.childNodes[layer.childNodes.length - 1];
    menu.popup(overflowElement);

    menu.addObserver("selectedItem", this, 'selectOverflowItem');
  },

  /** @private
    Whenever the value changes, update the segments accordingly.
  */
  valueDidChange: function () {
    var value = this.get('value'),
        overflowItemsLength,
        childViews = this.get('childViews'),
        childViewsLength = this.get('shouldHandleOverflow') ? childViews.get('length') - 1 : childViews.get('length'),
        overflowIndex = Infinity,
        overflowView = this.get('overflowView'),
        childView;

    // The index where childViews are all overflowed
    if (this.overflowItems) {
      overflowItemsLength = this.overflowItems.get('length');
      overflowIndex = childViewsLength - overflowItemsLength;

      // Clear out the selected value of the overflowView (if it's set)
      overflowView.set('isSelected', NO);
    }

    for (var i = childViewsLength - 1; i >= 0; i--) {
      childView = childViews.objectAt(i);
      if (SC.isArray(value) ? value.indexOf(childView.get('value')) >= 0 : value === childView.get('value')) {
        childView.set('isSelected', YES);

        // If we've gone over the overflow index, the child view is represented in overflow items
        if (i >= overflowIndex) overflowView.set('isSelected', YES);
      } else {
        childView.set('isSelected', NO);
      }
    }
  }.observes('value')

});
