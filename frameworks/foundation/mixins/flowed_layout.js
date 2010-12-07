// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
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
  }.observes("*childViews.[]"),
  
  _scfl_layoutPropertyDidChange: function(){
    this.invokeOnce("_scfl_tile");
  },
  
  /**
    Overriden to only update if it is a view we do not manage, or the width or height has changed
    since our last record of it.
  */
  layoutDidChangeFor: function(c) {
    // if we have not flowed yet, ignore as well
    if (!this._scfl_itemLayouts) return sc_super();
    
    // now, check if anything has changed
    var l = this._scfl_itemLayouts[SC.guidFor(c)], cl = c.get('layout'), f = c.get('frame');
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
  },
  
  /**
    Determines whether the specified child view should be included in the flow layout.
    By default, if it has isVisible: NO or useAbsoluteLayout: YES, it will not be included.
  */
  shouldIncludeChildInFlow: function(c) {
    return c.get('isVisible') && !c.get('useAbsoluteLayout');
  },
  
  /**
    Returns the flow spacings for a given view. By default, returns the view's flowSpacing,
    and if they don't exist, the defaultFlowSpacing for this view.
  */
  flowSpacingForView: function(idx, view) {
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
    Returns the flow size for a given view. The default version checks the view's
    calculatedWidth/Height, then its frame.
    
    For spacers, this returns an empty size.
    
    This should return a structure like: { width: whatever, height: whatever }
  */
  flowSizeForView: function(idx, view) {
    var cw = view.get('calculatedWidth'), ch = view.get('calculatedHeight');
    
    var calc = {}, f = view.get('frame');
    view._scfl_lastFrame = f;
    
    // if there is a calculated width, use that. NOTE: if calculatedWidth === 0,
    // it is invalid. This is the practice in other views.
    if (cw) {
      calc.width = cw;
    } else {
      // if the width is not calculated, we can't just use the frame because
      // we may have altered the frame. _scfl_cachedFlowSize is valid, however,
      // if the frame width is equal to _scfl_cachedCalculatedFlowSize.width, as 
      // that means the width has not been recomputed.
      //
      // Keep in mind that if we are the ones who recomputed it, we can use our
      // original value. If it was recomputed by the view itself, then its value
      // should be ok and unmanipulated by us, in theory.
      if (view._scfl_cachedCalculatedFlowSize && view._scfl_cachedCalculatedFlowSize.width == f.width) {
        calc.width = view._scfl_cachedFlowSize.width;
      } else {
        calc.width = f.width;
      }
    }
    
    // same for calculated height
    if (ch) {
      calc.height = ch;
    } else {
      if (view._scfl_cachedCalculatedFlowSize && view._scfl_cachedCalculatedFlowSize.height == f.height) {
        calc.height = view._scfl_cachedFlowSize.height;
      } else {
        calc.height = f.height;
      }
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
  
  /**
    Takes a row and positions everything within the row, calling updateLayout.
    It should return the row height.
  */
  flowRow: function(row, rowOffset, rowSize, availableRowLength, padding, primary, secondary, align) {
    
    // we deal with values already offset for padding
    // therefore, we must adjust availableRowLength
    if (primary === 'left') availableRowLength -= padding['left'] + padding['right'];
    else availableRowLength -= padding['top'] + padding['bottom'];
    
    // if it is justified, we'll add spacing between ALL views.
    var item, len = row.length, idx, layout, rowLength = 0, totalSpaceUnits = 0, spacePerUnit = 0;
    
    // first, determine the width of all items, and find out how many virtual spacers there are
    // this width includes spacing
    for (idx = 0; idx < len; idx++) {
      item = row[idx];
      if (item.get("isSpacer")) totalSpaceUnits += item.get("spaceUnits") || 1;
      else rowLength += item._scfl_cachedSpacedSize[primary === "left" ? "width" : "height"];
    }
    
    // add space units for justification
    // when justifying, we give one space unit between each item
    if (len > 1 && align === SC.ALIGN_JUSTIFY) {
      totalSpaceUnits += len - 1;
    }
    
    // calculate space per unit if needed
    if (totalSpaceUnits > 0) {
      spacePerUnit = (availableRowLength - rowLength) / totalSpaceUnits;
      rowLength = availableRowLength;
    }
    
    // prepare.
    // we will setup x, y
    // we _may_ set up width and/or height, if the view is a spacer or has
    // fillHeight/fillWidth.
    var x = padding['left'], y = padding['top'], width, height, itemSize = 0;
    
    if (primary === 'left') y = rowOffset;
    else x = rowOffset;
    
    // handle align
    if (align === SC.ALIGN_RIGHT || align === SC.ALIGN_BOTTOM) {
      if (primary === 'left') x = (availableRowLength - rowLength - padding.right);
      else y = (availableRowLength - rowLength - padding.bottom);
    } else if (align === SC.ALIGN_CENTER || align === SC.ALIGN_MIDDLE) {
      if (primary === 'left') x = (availableRowLength - padding.top - padding.bottom) / 2 - rowLength / 2;
      else y = (availableRowLength - padding.top - padding.bottom) / 2 - rowLength / 2;
    }
    
    // position
    for (idx = 0; idx < len; idx++) {
      item = row[idx];
      
      width = undefined; height = undefined;
      
      // sometimes a view wants to fill the row; that is, if we flow horizontally,
      // be the full height, and vertically, fill the width. This only applies if
      // we are not wrapping...
      //
      // Since we still position with spacing, we have to set the width to the total row
      // size minus the spacing. The spaced size holds only the spacing because the
      // flow size method returns 0.
      if (item.get("fillHeight") && primary === "left") {
        height = rowSize - item._scfl_cachedSpacedSize.height;
      }
      if (item.get("fillWidth") && primary === "top") {
        width = rowSize - item._scfl_cachedSpacedSize.width;
      }
      
      // update offset
      if (item.get('isSpacer')) {
        // the cached size is the minimum size for the spacer
        itemSize = item._scfl_cachedSpacedSize[primary === 'left' ? 'width' : 'height'];
        
        // get the spacer size
        itemSize = Math.max(itemSize, spacePerUnit * (item.get('spaceUnits') || 1));
        
        // and finally, set back the cached flow size value--
        // not including spacing (this is the view size for rendering)
        // spacers include 
        if (primary === "left") {
          width = itemSize;
        } else {
          height = itemSize;
        }
      } else {
        if (primary === "left") {
          itemSize = item._scfl_cachedSpacedSize.width;
        } else {
          itemSize = item._scfl_cachedSpacedSize.height;
        }
      }
      
      this.flowPositionView(idx, item, x, y, width, height);
      
      if (primary === 'left') x += itemSize;
      else y += itemSize;
      
      // update justification
      if (align === SC.ALIGN_JUSTIFY) {
        if (primary === 'left') x += spacePerUnit;
        else y += spacePerUnit;
      }
    }
    
    if (primary === 'left') return x;
    return y;
  },
  
  flowPositionView: function(idx, item, x, y, width, height) {
    var last = this._scfl_itemLayouts[SC.guidFor(item)],
        spacing = item._scfl_cachedSpacing;
    var l = {
      left: x + spacing.left,
      top: y + spacing.top
    };
    
    if (width !== undefined) l.width = width;
    if (height !== undefined) l.height = height;

    // we must set this first, or it will think it has to update layout again, and again, and again
    // and we get a crash.
    this._scfl_itemLayouts[SC.guidFor(item)] = l;

    // Also, never set if the same. We only want to compare layout properties, though
    if (last && 
      last.left == l.left && last.top == l.top && 
      last.width == l.width && l.width !== undefined && 
      last.height == l.height && l.height !== undefined
    ) {
      return;
    }
    
    item.adjust(l);
  },
  
  // hacky, but only way to allow us to use calculatedWidth/Height and avoid clobbering
  // our own layout (interfering with our tiling) while still allowing scrolling.
  renderMixin: function(context) {
    context.css('minWidth', this.get('calculatedWidth'));
    context.css('minHeight', this.get('calculatedHeight'));
  },
  
  clippingFrame: function() {
    return { left: 0, top: 0, width: this.get('calculatedWidth'), height: this.get('calculatedHeight') };
  }.property('calculatedWidth', 'calculatedHeight'),
  
  _scfl_calculatedSizeDidChange: function() {
    this.$().css('minWidth', this.get('calculatedWidth'));
    this.$().css('minHeight', this.get('calculatedHeight'));
  }.observes('calculatedWidth', 'calculatedHeight'),
  
  _scfl_tile: function() {
    if (!this._scfl_itemLayouts) this._scfl_itemLayouts = {};
    
    var isObserving = this._scfl_isObserving || SC.CoreSet.create(),
        nowObserving = SC.CoreSet.create();
    
    var children = this.get("childViews"), child, idx, len = children.length,
        rows = [], row = [], startRowSize = 0, rowSize = 0, longestRow = 0,
        rowOffset, itemOffset, 
        width = this.get('frame').width, height = this.get('frame').height,
        canWrap = this.get('canWrap'),
        layoutDirection = this.get('layoutDirection'),
        padding = this.get('_scfl_validFlowPadding'),
        childSize, childSpacing, childSpacedSize, align = this.get('align');
    
    
    var primary, primary_os, primary_d, secondary, secondary_os, secondary_d, flowLimit, availableRowLength;
    if (layoutDirection === SC.LAYOUT_HORIZONTAL) {
      availableRowLength = width;
      flowLimit = width - padding["right"];
      
      primary = "left"; secondary = "top";
      primary_os = "right"; secondary_os = "bottom";
      primary_d = "width"; secondary_d = "height";
    } else {
      availableRowLength = height;
      flowLimit = height - padding["bottom"];
      
      primary = "top"; secondary = "left";
      primary_os = "bottom"; secondary_os = "right";
      primary_d = "height"; secondary_d = "width";
    }
    
    rowOffset = padding[secondary];
    itemOffset = padding[primary];
    
    // if we cannot wrap, the row size is our frame (minus padding)
    if (!canWrap) {
      if (layoutDirection === SC.LAYOUT_HORIZONTAL) {
        rowSize = startRowSize = height - padding.top - padding.bottom;
      } else {
        rowSize = startRowSize = width - padding.right - padding.left;
      }
    }
        
    // now, loop through all child views and group them into rows.
    // note that we are NOT positioning.
    // when we are done with a row, we call flowRow to finish it.
    for (idx = 0; idx < len; idx++) {
      // get a child.
      child = children[idx];
      
      // update observing lists
      isObserving.remove(SC.guidFor(child));
      nowObserving.add(child);
      
      if (!this.shouldIncludeChildInFlow(child)) continue;
      
      // get spacing, size, and cache
      childSize = this.flowSizeForView(idx, child);
            
      childSpacing = this.flowSpacingForView(idx, child);
      childSpacedSize = {
        width: childSize.width + childSpacing.left + childSpacing.right,
        height: childSize.height + childSpacing.top + childSpacing.bottom
      };
      
      // flowRow will use this; it's purely here for performance
      child._scfl_cachedFlowSize = childSize;
      child._scfl_cachedSpacedSize = childSpacedSize;
      child._scfl_cachedSpacing = childSpacing;
      
      var newRow = child.get('startsNewRow');
      
      // determine if the item can fit in the row
      if ((newRow || canWrap) && row.length > 0) {
        if (newRow || itemOffset + childSize[primary_d] >= flowLimit) {
          // first, flow this row
          itemOffset = this.flowRow(row, rowOffset, rowSize, availableRowLength, padding, primary, secondary, align);
          longestRow = Math.max(longestRow, itemOffset);

          // We need another row.
          row = [];
          rows.push(row);
          rowOffset += rowSize;
          rowSize = startRowSize;
          itemOffset = padding[primary];
        }
      }

      // add too row and update row size+item offset
      row.push(child);
      rowSize = Math.max(childSpacedSize[secondary_d], rowSize);
      itemOffset += childSpacedSize[primary_d];
      longestRow = Math.max(longestRow, itemOffset);
    }
    
    
    // flow last row
    itemOffset = this.flowRow(row, rowOffset, rowSize, availableRowLength, padding, primary, secondary, align);
    longestRow = Math.max(longestRow, itemOffset);

    
    // update calculated width/height
    this._scfl_lastFrameSize = this.get('frame');
    
    // size is now calculated the same whether canWrap is on or not
    if (this.get('autoResize')) {
      if(longestRow) {
        if (layoutDirection === SC.LAYOUT_HORIZONTAL) {
          this.set('calculatedWidth', longestRow + padding[primary_os]);
        } else {
          this.set('calculatedHeight', longestRow + padding[primary_os]);
        }
      }
      
      if(rowOffset + rowSize) {
        if (layoutDirection === SC.LAYOUT_HORIZONTAL) {
          this.set('calculatedHeight', rowOffset + rowSize + padding[secondary_os]);
        } else {
          this.set('calculatedWidth', rowOffset + rowSize + padding[secondary_os]);
        }
      }
    }
    
    
    // cleanup on aisle 7
    len = isObserving.length;
    for (idx = 0; idx < len; idx++) {
      this.unobserveChildLayout(isObserving[idx]);
    }

    len = nowObserving.length;
    for (idx = 0; idx < len; idx++) {
      this.observeChildLayout(nowObserving[idx]);
    }
    
    this._scfl_isObserving = nowObserving;
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
  }
  
};
