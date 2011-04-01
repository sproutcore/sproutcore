// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.ALIGN_JUSTIFY = "justify";
/**
  @namespace 

  Normal SproutCore views are absolutely positioned--parent views have relatively
  little input on where their child views are placed.
  
  This mixin makes a view layout its child views itself, flowing left-to-right
  or up-to-down, and, optionally, wrapping.
  
  Child views with useAbsoluteLayout===YES will be ignored in the layout process.
  This mixin detects when child views have changed their size, and will adjust accordingly.
  It also observes child views' isVisible and calculatedWidth/Height properties, and, as a
  flowedlayout-specific extension, isHidden.
  
  These properties are observed through `#js:observeChildLayout` and `#js:unobserveChildLayout`;
  you can override the method to add your own properties. To customize isVisible behavior,
  you will also want to override shouldIncludeChildInFlow.
  
  This relies on the children's frames or, if specified, calculatedWidth and calculatedHeight
  properties.
  
  This view mixes very well with animation. Further, it is able to automatically mix
  in to child views it manages, created or not yet created, allowing you to specify
  settings such as animation once only, and have everything "just work".
  
  Like normal views, you simply specify child views--everything will "just work."
  
  @since SproutCore 1.0
*/
SC.FlowedLayout = {
  /**
    The direction of flow.
  */
  layoutDirection: SC.LAYOUT_HORIZONTAL,

  /**
    Whether the view should automatically resize (to allow scrolling, for instance)
  */
  autoResize: YES,
  
  shouldResizeWidth: YES,
  
  shouldResizeHeight: YES,
  
  /**
    The alignment of items within rows or columns.
  */
  align: SC.ALIGN_LEFT,
  
  /**
    If YES, flowing child views are allowed to wrap to new rows or columns.
  */
  canWrap: YES,
  
  /**
    A set of spacings (left, top, right, bottom) for subviews. Defaults to 0s all around.
    This is the amount of space that will be before, after, above, and below the view. These
    spacings do not collapse into each other.
    
    You can also set flowSpacing on any child view, or implement flowSpacingForView.
  */
  defaultFlowSpacing: { left: 0, bottom: 0, top: 0, right: 0 },
  
  /**
    @property {Hash}
    
    Padding around the edges of this flow layout view. This is useful for
    situations where you don't control the layout of the FlowedLayout view;
    for instance, when the view is the contentView for a SC.ScrollView.
  */
  flowPadding: { left: 0, bottom: 0, right: 0, top: 0 },

  /**
    @private
    
    If the flowPadding somehow misses a property (one of the sides),
    we need to make sure a default value of 0 is still there.
   */
  _scfl_validFlowPadding: function() {
    var padding = this.get('flowPadding') || {}, ret = {};
    ret.left = padding.left || 0;
    ret.top = padding.top || 0;
    ret.bottom = padding.bottom || 0;
    ret.right = padding.right || 0;
    return ret;
  }.property('flowPadding').cacheable(),
  
  concatenatedProperties: ["childMixins"],
  
  initMixin: function() {
    this.invokeOnce("_scfl_tile");
  },
  
  /**
    Detects when the child views change.
  */
  _scfl_childViewsDidChange: function(c) {
    this.invokeOnce("_scfl_tile");
  }.observes("childViews"),
  
  _scfl_layoutPropertyDidChange: function(){
    this.invokeOnce("_scfl_tile");
  },
  
  /**
    Overriden to only update if it is a view we do not manage, or the width or height has changed
    since our last record of it.
  */
  layoutDidChangeFor: function(c) {
    // now, check if anything has changed
    var l = c._scfl_lastLayout, cl = c.get('layout'), f = c.get('frame');
    if (!l) return sc_super();
    
    var same = YES;
    
    // in short, if anything interfered with the layout, we need to
    // do something about it.
    if (l.left && l.left !== cl.left) same = NO;
    else if (l.top && l.top !== cl.top) same = NO;
    else if (!c.get('fillWidth') && l.width && l.width !== cl.width) same = NO;
    else if (!l.width && !c.get('fillWidth') && f.width !== c._scfl_lastFrame.width) same = NO;
    else if (!c.get('fillHeight') && l.height && l.height !== cl.height) same = NO;
    else if (!l.height && !c.get('fillHeight') && f.height !== c._scfl_lastFrame.height) same = NO;
    
    if (same) {
      return sc_super();
    }
    
    // nothing has changed. This is where we do something
    this.invokeOnce("_scfl_tile");
    sc_super();
  },
  
  /**
    Sets up layout observers on child view. We observe three things:
    - isVisible
    - calculatedWidth
    - calculatedHeight
    
    Actual layout changes are detected through layoutDidChangeFor.
  */
  observeChildLayout: function(c) {
    if (c._scfl_isBeingObserved) return;
    c._scfl_isBeingObserved = YES;
    c.addObserver('isVisible', this, '_scfl_layoutPropertyDidChange');
    c.addObserver('useAbsoluteLayout', this, '_scfl_layoutPropertyDidChange');
    c.addObserver('calculatedWidth', this, '_scfl_layoutPropertyDidChange');
    c.addObserver('calculatedHeight', this, '_scfl_layoutPropertyDidChange');
    c.addObserver('startsNewRow', this, '_scfl_layoutPropertyDidChange');
  },
  
  /**
    Removes observers on child view.
  */
  unobserveChildLayout: function(c) {
    c._scfl_isBeingObserved = NO;
    c.removeObserver('isVisible', this, '_scfl_layoutPropertyDidChange');
    c.removeObserver('useAbsoluteLayout', this, '_scfl_layoutPropertyDidChange');
    c.removeObserver('calculatedWidth', this, '_scfl_layoutPropertyDidChange');
    c.removeObserver('calculatedHeight', this, '_scfl_layoutPropertyDidChange');
    c.removeObserver('startsNewRow', this, '_scfl_layoutPropertyDidChange');
  },
  
  /**
    Determines whether the specified child view should be included in the flow layout.
    By default, if it has isVisible: NO or useAbsoluteLayout: YES, it will not be included.
  */
  shouldIncludeChildInFlow: function(idx, c) {
    return c.get('isVisible') && !c.get('useAbsoluteLayout');
  },
  
  /**
    Returns the flow spacings for a given view. By default, returns the view's flowSpacing,
    and if they don't exist, the defaultFlowSpacing for this view.
  */
  flowSpacingForChild: function(idx, view) {
    var spacing = view.get("flowSpacing");
    if (SC.none(spacing)) spacing = this.get("defaultFlowSpacing");
    
    if (SC.typeOf(spacing) === SC.T_NUMBER) {
      spacing = { left: spacing, right: spacing, bottom: spacing, top: spacing };
    } else {
      spacing['left'] = spacing['left'] || 0;
      spacing['right'] = spacing['right'] || 0;
      spacing['top'] = spacing['top'] || 0;
      spacing['bottom'] = spacing['bottom'] || 0;
    }
    
    return spacing;
  },
  
  /**
    Returns the flow size for a given view, excluding spacing. The default version 
    checks the view's calculatedWidth/Height, then its frame.
    
    For spacers, this returns an empty size.
    
    This should return a structure like: { width: whatever, height: whatever }
  */
  flowSizeForChild: function(idx, view) {
    var cw = view.get('calculatedWidth'), ch = view.get('calculatedHeight');
    
    var calc = {}, f = view.get('frame');
    view._scfl_lastFrame = f;
    
    // if there is a calculated width, use that. NOTE: if calculatedWidth === 0,
    // it is invalid. This is the practice in other views.
    if (cw) {
      calc.width = cw;
    } else {
      calc.width = f.width;
    }
    
    // same for calculated height
    if (ch) {
      calc.height = ch;
    } else {
      calc.height = f.height;
    }
    
    // if it is a spacer, we must set the dimension that it
    // expands in to 0.
    if (view.get('isSpacer')) {
      if (this.get('layoutDirection') === SC.LAYOUT_HORIZONTAL) calc.width = 0;
      else calc.height = 0;
    }
    
    // if it has a fillWidth/Height, clear it for later
    if (
      this.get('layoutDirection') === SC.LAYOUT_HORIZONTAL && view.get('fillHeight')
    ) {
      calc.height = 0;
    } else if (
      this.get('layoutDirection') === SC.LAYOUT_VERTICAL && view.get('fillWidth')
    ) {
      calc.width = 0;
    }
    
    // return
    return calc;
  },
  
  clippingFrame: function() {
    return { left: 0, top: 0, width: this.get('calculatedWidth'), height: this.get('calculatedHeight') };
  }.property('calculatedWidth', 'calculatedHeight'),
  
  _scfl_calculatedSizeDidChange: function() {
    if(this.get('autoResize')) {
      if(this.get('shouldResizeWidth')) this.adjust('minWidth', this.get('calculatedWidth'));
      if(this.get('shouldResizeHeight')) this.adjust('minHeight', this.get('calculatedHeight'));
    }
  }.observes('autoResize', 'shouldResizeWidth', 'calculatedWidth', 'shouldResizeHeight', 'calculatedHeight'),
  
  /**
    @private
    Creates a plan, initializing all of the basic properties in it, but not
    doing anything further.
    
    Other methods should be called to do this:
    
    - _scfl_distributeChildrenIntoRows distributes children into rows.
    - _scfl_positionChildrenInRows positions the children within the rows.
      - this calls _scfl_positionChildrenInRow
    - _scfl_positionRows positions and sizes rows within the plan.
    
    The plan's structure is defined inside the method.
    
    Some of these methods may eventually be made public and/or delegate methods.
  */
  _scfl_createPlan: function() {
    var layoutDirection = this.get('layoutDirection'),
        flowPadding = this.get('_scfl_validFlowPadding'),
        frame = this.get('frame');
    
    var isVertical = (layoutDirection === SC.LAYOUT_VERTICAL);
    
    // A plan hash contains general information about the layout, and also,
    // the collection of rows.
    //
    // This method only fills out a subset of the properties in a plan.
    // 
    var plan = {
      // The rows array starts empty. It will get filled out by the method
      // _scfl_distributeChildrenIntoRows.
      rows: undefined,
      
      // These properties are calculated once here, but later used by
      // the various methods.
      isVertical: layoutDirection === SC.LAYOUT_VERTICAL,
      isHorizontal: layoutDirection === SC.LAYOUT_HORIZONTAL,
      
      flowPadding: flowPadding,
      
      planStartPadding: flowPadding[isVertical ? 'left' : 'top'],
      planEndPadding: flowPadding[isVertical ? 'right' : 'bottom'],
      
      rowStartPadding: flowPadding[isVertical ? 'top' : 'left'],
      rowEndPadding: flowPadding[isVertical ? 'bottom' : 'right'],
      
      maximumRowLength: undefined, // to be calculated below
      
      // if any rows need to fit to fill, this is the size to fill
      fitToPlanSize: undefined,
      
      
      align: this.get('align')
    };
    
    if (isVertical) {
      plan.maximumRowLength = frame.height - plan.rowStartPadding - plan.rowEndPadding;
      plan.fitToPlanSize = frame.width - plan.planStartPadding - plan.planEndPadding;
    } else {
      plan.maximumRowLength = frame.width - plan.rowStartPadding - plan.rowEndPadding;
      plan.fitToPlanSize = frame.height - plan.planStartPadding - plan.planEndPadding;
    }
    
    return plan;
  },
  
  _scfl_distributeChildrenIntoRows: function(plan) {
    var children = this.get('childViews'), child, idx, len = children.length,
        isVertical = plan.isVertical, rows = [], lastIdx;
    
    lastIdx = -1; idx = 0;
    while (idx < len && idx !== lastIdx) {
      lastIdx = idx;
      
      var row = {
        // always a referene to the plan
        plan: plan,
        
        // the combined size of the items in the row. This is used, for instance,
        // in justification or right-alignment.
        rowLength: undefined,
        
        // the size of the row. When flowing horizontally, this is the height;
        // it is the opposite dimension of rowLength. It is calculated
        // both while positioning items in the row and while positioning the rows
        // themselves.
        rowSize: undefined,
        
        // whether this row should expand to fit any available space. In this case,
        // the size is the row's minimum size.
        shouldExpand: undefined,
        
        // to be decided by _scfl_distributeItemsIntoRows
        items: undefined,
        
        // to be decided by _scfl_positionRows
        position: undefined
      };
      
      idx = this._scfl_distributeChildrenIntoRow(children, idx, row);
      rows.push(row);
    }
    
    plan.rows = rows;
  },
  
  /**
    @private
    Distributes as many children as possible into a single row, stating
    at the given index, and returning the index of the next item, if any.
  */
  _scfl_distributeChildrenIntoRow: function(children, startingAt, row) {
    var idx, len = children.length, plan = row.plan, child, childSize, spacing, childSpacedSize, 
        items = [], itemOffset = 0, isVertical = plan.isVertical, itemSize, itemLength,
        canWrap = this.get('canWrap'),
        newRowPending = NO;
    
    var max = row.plan.maximumRowLength;
    
    for (idx = startingAt; idx < len; idx++) {
      child = children[idx];

      // this must be set before we check if the child is included because even
      // if it isn't included, we need to remember that there is a line break
      // for later
      newRowPending = newRowPending || (items.length > 0 && child.get('startsNewRow'));

      if (!this.shouldIncludeChildInFlow(idx, child)) continue;
      
      childSize = this.flowSizeForChild(idx, child);
      spacing = this.flowSpacingForChild(idx, child);
      childSpacedSize = {
        width: childSize.width + spacing.left + spacing.right,
        height: childSize.height + spacing.top + spacing.bottom
      };
      
      itemLength = childSpacedSize[isVertical ? 'height' : 'width'];
      itemSize = childSpacedSize[isVertical ? 'width' : 'height'];
      
      // there are two cases where we must start a new row: if the child or a
      // previous child in the row that wasn't included has
      // startsNewRow === YES, and if the item cannot fit. Neither applies if there
      // is nothing in the row yet.
      if ((newRowPending || (canWrap && itemOffset + itemLength > max)) && items.length > 0) {
        break;
      }
      
      var item = {
        child: child,
        
        itemLength: itemLength,
        itemSize: itemSize,
        
        spacing: spacing,
        
        // The position in the row.
        //
        // note: in one process or another, this becomes left or top.
        // but before that, it is calculated.
        position: undefined,
        
        // whether this item should attempt to fill to the row's size
        fillRow: isVertical ? child.get('fillWidth') : child.get('fillHeight'),
        
        // whether this item is a spacer, and thus should be resized to its itemLength
        isSpacer: child.get('isSpacer'),
        
        // these will get set if necessary during the positioning code
        left: undefined, top: undefined,
        width: undefined, height: undefined
      };
      
      items.push(item);
      itemOffset += itemLength;
    }
    
    row.rowLength = itemOffset;
    row.items = items;
    return idx;
  },
  
  _scfl_positionChildrenInRows: function(plan) {
    var rows = plan.rows, len = rows.length, idx;
    
    for (idx = 0; idx < len; idx++) {
      this._scfl_positionChildrenInRow(rows[idx]);
    }
  },
  
  /**
    @private
    Positions items within a row. The items are already in the row, this just
    modifies the 'position' property.
    
    This also marks a tentative size of the row, and whether it should be expanded
    to fit in any available extra space. Note the term 'size' rather than 'length'...
  */
  _scfl_positionChildrenInRow: function(row) {
    var items = row.items, len = items.length, idx, item, position, rowSize = 0,
        spacerCount = 0, spacerSize, align = row.plan.align, shouldExpand = YES;
    
    // 
    // STEP ONE: DETERMINE SPACER SIZE + COUNT
    // 
    for (idx = 0; idx < len; idx++) {
      item = items[idx];
      if (item.isSpacer) spacerCount += item.child.get('spaceUnits') || 1;
    }
    
    // justification is like adding a spacer between every item. We'll actually account for
    // that later, but for now...
    if (align === SC.ALIGN_JUSTIFY) spacerCount += len - 1;
    
    // calculate spacer size
    spacerSize = Math.max(0, row.plan.maximumRowLength - row.rowLength) / spacerCount;
    
    //
    // STEP TWO: ADJUST FOR ALIGNMENT
    // Note: if there are spacers, this has no effect, because they fill all available
    // space.
    //
    position = 0;
    if (spacerCount === 0 && (align === SC.ALIGN_RIGHT || align === SC.ALIGN_BOTTOM)) {
      position = row.plan.maximumRowLength - row.rowLength;
    } else if (spacerCount === 0 && (align === SC.ALIGN_CENTER || align === SC.ALIGN_MIDDLE)) {
      position = (row.plan.maximumRowLength / 2) - (row.rowLength / 2);
    }
    
    position += row.plan.rowStartPadding;
    // 
    // STEP TWO: LOOP + POSITION
    // 
    for (idx = 0; idx < len; idx++) {
      item = items[idx];
      
      if (item.isSpacer) {
        item.itemLength += spacerSize * (item.child.get('spaceUnits') || 1);
      }
      
      // if the item is not a fill-row item, this row has a size that all fill-row
      // items should expand to
      if (!item.fillRow) shouldExpand = NO;
      rowSize = Math.max(item.itemSize, rowSize);
      
      item.position = position;
      position += item.itemLength;
      
      // if justification is on, we have one more spacer
      // note that we check idx because position is used to determine the new rowLength.
      if (align === SC.ALIGN_JUSTIFY && idx < len - 1) position += spacerSize;
    }
    
    row.shouldExpand = shouldExpand;
    row.rowLength = position - row.plan.rowStartPadding; // row length does not include padding
    row.rowSize = rowSize;
    
  },

  _scfl_positionRows: function(plan) {
    var rows = plan.rows, len = rows.length, idx, row, position,
        fillRowCount = 0, planSize = 0, fillSpace;
    
    // first, we need a count of rows that need to fill, and the size they
    // are filling to (the combined size of all _other_ rows).
    for (idx = 0; idx < len; idx++) {
      if (rows[idx].shouldExpand) fillRowCount++;
      planSize += rows[idx].rowSize;
    }
    
    fillSpace = plan.fitToPlanSize - planSize;
    
    // now, position+size the rows
    position = plan.planStartPadding;
    for (idx = 0; idx < len; idx++) {
      row = rows[idx];
      
      if (row.shouldExpand && fillSpace > 0) {
        row.rowSize += fillSpace / fillRowCount;
        fillRowCount--;
      }
      
      row.position = position;
      position += row.rowSize;
    }
  },
  
  /**
    @private
    Positions all of the child views according to the plan.
  */
  _scfl_applyPlan: function(plan) {
    var rows = plan.rows, rowIdx, rowsLen, row, longestRow = 0, totalSize = 0,
        items, itemIdx, itemsLen, item, layout,
        
        isVertical = plan.isVertical;
    
    rowsLen = rows.length;
    for (rowIdx = 0; rowIdx < rowsLen; rowIdx++) {
      row = rows[rowIdx];
      longestRow = Math.max(longestRow, row.rowLength);
      totalSize += row.rowSize;
      
      items = row.items; itemsLen = items.length;
      
      for (itemIdx = 0; itemIdx < itemsLen; itemIdx++) {
        item = items[itemIdx];
        item.child.beginPropertyChanges();
        
        layout = {};
        
        // we are _going_ to set position. that much is certain.
        layout.left = item.spacing.left + (isVertical ? row.position : item.position);
        layout.top = item.spacing.top + (isVertical ? item.position : row.position);
        
        // the size is more questionable: we only change that if the
        // item wants.
        if (item.fillRow) {
          layout[isVertical ? 'width' : 'height'] = row.rowSize;
        }
        if (item.isSpacer) {
          layout[isVertical ? 'height' : 'width'] = item.itemLength;
        }
        
        if (layout.width !== undefined) {
          layout.width -= item.spacing.left + item.spacing.right;
        }
        if (layout.height !== undefined) {
          layout.height -= item.spacing.top + item.spacing.bottom;
        }
        
        item.child.adjust(layout);
        item.child._scfl_lastLayout = layout;
        
        item.child.endPropertyChanges();
      }
    }
    
    totalSize += plan.planStartPadding + plan.planEndPadding;
    longestRow += plan.rowStartPadding + plan.rowEndPadding;
    
    this.beginPropertyChanges();

    this.set('calculatedHeight', isVertical ? longestRow : totalSize);

    this.set('calculatedWidth', isVertical ? totalSize : longestRow);

    this.endPropertyChanges();
  },
  
  _scfl_tile: function() {
    // first, do the plan
    var plan = this._scfl_createPlan();
    this._scfl_distributeChildrenIntoRows(plan);
    this._scfl_positionChildrenInRows(plan);
    this._scfl_positionRows(plan);
    this._scfl_applyPlan(plan);
    
    // second, observe all children, and stop observing any children we no longer
    // should be observing.
    var previouslyObserving = this._scfl_isObserving || SC.CoreSet.create(),
        nowObserving = SC.CoreSet.create();
    
    var children = this.get('childViews'), len = children.length, idx, child;
    for (idx = 0; idx < len; idx++) {
      child = children[idx];
      
      if (!previouslyObserving.contains(child)) {
        this.observeChildLayout(child);
      } else {
        previouslyObserving.remove(child);
      }
      
      nowObserving.add(child);
    }
    
    len = previouslyObserving.length;
    for (idx = 0; idx < len; idx++) {
      this.unobserveChildLayout(previouslyObserving[idx]);
    }
  },
  
  _scfl_frameDidChange: function() {
    var frame = this.get("frame"), lf = this._scfl_lastFrameSize;
    this._scfl_lastFrameSize = frame;

    if (lf && lf.width == frame.width && lf.height == frame.height) return;
    
    this.invokeOnce("_scfl_tile");
  }.observes("frame"),
  
  destroyMixin: function() {
    var isObserving = this._scfl_isObserving;
    if (!isObserving) return;
    
    var len = isObserving.length, idx;
    for (idx = 0; idx < len; idx++) {
      this.unobserveChildLayout(isObserving[idx]);
    }
  },
  
  /*
    Reorders childViews so that the passed views are at the beginning in the order they are passed. Needed because childViews are layed out in the order they appear in childViews.
  */
  reorder: function(views) {
    if(!SC.typeOf(views) === SC.T_ARRAY) views = arguments;
    
    var i = views.length, childViews = this.childViews, view;
    
    // childViews.[] should be observed
    this.beginPropertyChanges();
    
    while(i-- > 0) {
      view = views[i];
      
      childViews.removeObject(view);
      childViews.unshiftObject(view);
    }
    
    this.endPropertyChanges();
    
    this._scfl_childViewsDidChange();
    
    return this;
  }
};
