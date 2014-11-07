// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/collection');
sc_require('views/list_item');
sc_require('mixins/collection_row_delegate');

/** @class

  A list view renders vertical or horizontal lists of items.  It is a specialized
  form of collection view that is simpler than a table view, but more refined than
  a generic collection.

  You can use a list view just like any collection view, except that often you
  provide the rowSize, which will be either the height of each row when laying
  out rows vertically (the default) or the widht of each row when laying out
  the rows horizontally.

  ## Variable Row Heights

  Normally you set the row height or width through the rowSize property, but
  you can also support custom row sizes by assigning the `customRowSizeIndexes`
  property to an index set of all custom sized rows.

  ## Using ListView with Very Large Data Sets

  ListView implements incremental rendering, which means it will only render
  HTML for the items that are currently visible on the screen.  This means you
  can use it to efficiently render lists with 100K+ items or more very efficiently.

  If you need to work with very large lists of items however, be aware that
  calculating variable row sizes can become very expensive since the list
  view will essentially have to iterate over every item in the collection to
  determine each the total height or width.

  Therefore, to work with very large lists, you should consider using a design
  that allows your row sizes to remain uniform.  This will allow the list view
  to much more efficiently render content.

  Alternatively, to support differently sized and incrementally rendered item
  views, you may want to consider overriding the `offsetForRowAtContentIndex()`
  and `rowSizeForContentIndex()` methods to perform some specialized faster
  calculations that do not require inspecting every item in the collection.

  Note: row sizes and offsets are cached so once they are calculated
  the list view will be able to display very quickly.

  ## Dragging and Dropping

  When the list view is configured to accept drops onto its items, it
  will set the `isDropTarget` property on the target item accordingly.  This
  allows you to modify the appearance of the drop target list item accordingly
  (@see SC.ListItemView#isDropTarget).

  @extends SC.CollectionView
  @extends SC.CollectionRowDelegate
  @since SproutCore 1.0
*/
// (Can we also have an 'estimate row heights' property that will simply
// cheat for very long data sets to make rendering more efficient?)
SC.ListView = SC.CollectionView.extend(SC.CollectionRowDelegate,
/** @scope SC.ListView.prototype */ {

  /** @private */
  _sc_customRowSizeIndexes: null,

  /** @private */
  _sc_insertionPointView: null,

  /** @private */
  _sc_lastDropOnView: null,

  /** @private */
  _sc_layout: null,

  /** @private */
  _sc_sizeCache: null,

  /** @private */
  _sc_offsetCache: null,

  /** @private */
  _sc_rowDelegate: null,

  /** @private */
  _sc_rowSize: null,

  /**
    @type Array
    @default ['sc-list-view']
    @see SC.View#classNames
  */
  classNames: ['sc-list-view'],

  /**
    @type Boolean
    @default true
  */
  acceptsFirstResponder: true,

  /** @private SC.CollectionView.prototype */
  exampleView: SC.ListItemView,

  /**
    Determines the layout direction of the rows of items, either vertically or
    horizontally. Possible values:

      - SC.LAYOUT_HORIZONTAL
      - SC.LAYOUT_VERTICAL

    @type String
    @default SC.LAYOUT_VERTICAL
  */
  layoutDirection: SC.LAYOUT_VERTICAL,

  /**
    If set to true, the default theme will show alternating rows
    for the views this ListView created through exampleView property.

    @type Boolean
    @default false
  */
  showAlternatingRows: false,

  // ..........................................................
  // METHODS
  //

  /** @private */
  init: function () {
    sc_super();

    this._sc_rowDelegateDidChange();
  },

  /** @private SC.CollectionView.prototype.destroy. */
  destroy: function () {
    sc_super();

    // All manipulations made to objects we use must be reversed!
    var del = this._sc_rowDelegate;
    if (del) {
      del.removeObserver('_sc_totalRowSize', this, this._sc_rowSizeDidChange);
      del.removeObserver('customRowSizeIndexes', this, this._sc_customRowSizeIndexesDidChange);

      this._sc_rowDelegate = null;
    }

    var customRowSizeIndexes = this._sc_customRowSizeIndexes;
    if (customRowSizeIndexes) {
      customRowSizeIndexes.removeObserver('[]', this, this._sc_customRowSizeIndexesContentDidChange);

      this._sc_customRowSizeIndexes = null;
    }
  },

  /** @private */
  render: function (context, firstTime) {
    context.setClass('alternating', this.get('showAlternatingRows'));

    return sc_super();
  },

  // ..........................................................
  // COLLECTION ROW DELEGATE SUPPORT
  //

  /**
    @field
    @type Object
    @observes 'delegate'
    @observes 'content'
  */
  rowDelegate: function () {
    var del = this.delegate,
      content = this.get('content');

    return this.delegateFor('isCollectionRowDelegate', del, content);
  }.property('delegate', 'content').cacheable(),

  /** @private - Whenever the rowDelegate changes, begin observing important properties */
  _sc_rowDelegateDidChange: function () {
    var last = this._sc_rowDelegate,
      del  = this.get('rowDelegate'),
      func = this._sc_rowSizeDidChange,
      func2 = this._sc_customRowSizeIndexesDidChange;

    if (last === del) return this; // nothing to do
    this._sc_rowDelegate = del;

    // last may be null on a new object
    if (last) {
      last.removeObserver('_sc_totalRowSize', this, func);
      last.removeObserver('customRowSizeIndexes', this, func2);
    }

    //@if(debug)
    if (!del) {
      throw new Error("%@ - Developer Error: SC.ListView must always have a rowDelegate.".fmt(this));
    }
    //@endif

    // Add the new observers.
    del.addObserver('_sc_totalRowSize', this, func);
    del.addObserver('customRowSizeIndexes', this, func2);

    // Trigger once to initialize.
    this._sc_rowSizeDidChange()._sc_customRowSizeIndexesDidChange();

    return this;
  }.observes('rowDelegate'),

  /** @private - Called whenever the _sc_totalRowSize changes. If the property actually changed then invalidate all row sizes. */
  _sc_rowSizeDidChange: function () {
    var del = this.get('rowDelegate'),
      totalRowSize = del.get('_sc_totalRowSize'),
      indexes;

    if (totalRowSize === this._sc_rowSize) return this; // nothing to do
    this._sc_rowSize = totalRowSize;

    indexes = SC.IndexSet.create(0, this.get('length'));
    this.rowSizeDidChangeForIndexes(indexes);

    return this;
  },

  /** @private - Called whenever the customRowSizeIndexes changes. If the property actually changed then invalidate affected row sizes. */
  _sc_customRowSizeIndexesDidChange: function () {
    var del   = this.get('rowDelegate'),
      indexes = del.get('customRowSizeIndexes'),
      last    = this._sc_customRowSizeIndexes,
      func    = this._sc_customRowSizeIndexesContentDidChange;

    // nothing to do
    if ((indexes === last) || (last && last.isEqual(indexes))) return this;

    // if we were observing the last index set, then remove observer
    if (last && this._sc_isObservingCustomRowSizeIndexes) {
      last.removeObserver('[]', this, func);
    }

    // only observe new index set if it exists and it is not frozen.
    this._sc_isObservingCustomRowSizeIndexes = indexes;
    if (indexes && !indexes.get('isFrozen')) {
      indexes.addObserver('[]', this, func);
    }

    // Trigger once to initialize.
    this._sc_customRowSizeIndexesContentDidChange();

    return this;
  },

  /** @private - Called whenever the customRowSizeIndexes set is modified. */
  _sc_customRowSizeIndexesContentDidChange: function () {
    var del     = this.get('rowDelegate'),
      indexes = del.get('customRowSizeIndexes'),
      last    = this._sc_customRowSizeIndexes,
      changed;

    // compute the set to invalidate.  the union of cur and last set
    if (indexes && last) {
      changed = indexes.copy().add(last);
    } else {
      changed = indexes || last;
    }

    this._sc_customRowSizeIndexes = indexes ? indexes.frozenCopy() : null;

    // invalidate
    this.rowSizeDidChangeForIndexes(changed);

    return this;
  },


  // ..........................................................
  // ROW PROPERTIES
  //

  /**
    Returns the top or left offset for the specified content index.  This will take
    into account any custom row sizes and group views.

    @param {Number} idx the content index
    @returns {Number} the row offset
  */
  rowOffsetForContentIndex: function (idx) {
    if (idx === 0) return 0; // Fast path!

    var del = this.get('rowDelegate'),
      totalRowSize = del.get('_sc_totalRowSize'),
      rowSpacing = del.get('rowSpacing'),
      ret, custom, cache, delta, max;

    ret = idx * totalRowSize;

		if (rowSpacing) {
      ret += idx * rowSpacing;
    }

    if (del.customRowSizeIndexes && (custom = del.get('customRowSizeIndexes'))) {

      // prefill the cache with custom rows.
      cache = this._sc_offsetCache;
      if (!cache) {
        cache = [];
        delta = max = 0;
        custom.forEach(function (idx) {
          delta += this.rowSizeForContentIndex(idx) - totalRowSize;
          cache[idx + 1] = delta;
          max = idx;
        }, this);
        this._sc_max = max + 1;

        // moved down so that the cache is not marked as initialized until it actually is
        this._sc_offsetCache = cache;
      }

      // now just get the delta for the last custom row before the current
      // idx.
      delta = cache[idx];
      if (delta === undefined) {
        delta = cache[idx] = cache[idx - 1];
        if (delta === undefined) {
          max = this._sc_max;
          if (idx < max) max = custom.indexBefore(idx) + 1;
          delta = cache[idx] = cache[max] || 0;
        }
      }

      ret += delta;
    }

    return ret;
  },

  /** @deprecated Version 1.11. Please use the `rowSizeForContentIndex()` function instead.
    Not implemented by default.

    @field
    @param {Number} idx content index
    @returns {Number} the row height
  */
  rowHeightForContentIndex: null,

  /**
    Returns the row size for the specified content index.  This will take
    into account custom row sizes and group rows.

    @param {Number} idx content index
    @returns {Number} the row height
  */
  rowSizeForContentIndex: function (idx) {
    var del = this.get('rowDelegate'),
        ret, cache, content, indexes;

    if (this.rowHeightForContentIndex) {
      //@if(debug)
      SC.warn('Developer Warning: The rowHeightForContentIndex() method of SC.ListView has been renamed rowSizeForContentIndex().');
      //@endif
      return this.rowHeightForContentIndex(idx);
    }

    if (del.customRowSizeIndexes && (indexes = del.get('customRowSizeIndexes'))) {
      cache = this._sc_sizeCache;
      if (!cache) {
        cache = [];
        content = this.get('content');
        indexes.forEach(function (idx) {
          cache[idx] = del.contentIndexRowSize(this, content, idx);
        }, this);

        // moved down so that the cache is not marked as initialized until it actually is.
        this._sc_sizeCache = cache;
      }

      ret = cache[idx];
      if (ret === undefined) ret = del.get('_sc_totalRowSize');
    } else {
      ret = del.get('_sc_totalRowSize');
    }

    return ret;
  },

  /** @deprecated Version 1.11. Please use the `rowSizeDidChangeForIndexes()` function instead.
    Call this method whenever a row height has changed in one or more indexes.
    This will invalidate the row height cache and reload the content indexes.
    Pass either an index set or a single index number.

    This method is called automatically whenever you change the rowSize, rowPadding
    or customRowSizeIndexes properties on the collectionRowDelegate.

    @param {SC.IndexSet|Number} indexes
    @returns {SC.ListView} receiver
  */
  rowHeightDidChangeForIndexes: function (indexes) {
    //@if(debug)
    SC.warn('Developer Warning: The rowHeightDidChangeForIndexes() function of SC.ListView has been renamed to rowSizeDidChangeForIndexes().');
    //@endif
    return this.rowSizeDidChangeForIndexes(indexes);
  },

  /**
    Call this method whenever a row size has changed in one or more indexes.
    This will invalidate the row size cache and reload the content indexes.
    Pass either an index set or a single index number.

    This method is called automatically whenever you change the rowSize, rowPadding
    or customRowSizeIndexes properties on the collectionRowDelegate.

    @param {SC.IndexSet|Number} indexes
    @returns {SC.ListView} receiver
  */
  rowSizeDidChangeForIndexes: function (indexes) {
    var len = this.get('length');

    // clear any cached offsets
    this._sc_sizeCache = this._sc_offsetCache = null;

    // find the smallest index changed; invalidate everything past it
    if (indexes && indexes.isIndexSet) indexes = indexes.get('min');
    this.reload(SC.IndexSet.create(indexes, len - indexes));

    // If the row height changes, our entire layout needs to change.
    this.invokeOnce('adjustLayout');

    return this;
  },

  // ..........................................................
  // SUBCLASS IMPLEMENTATIONS
  //

  /**
    The layout for a ListView is computed from the total number of rows
    along with any custom row heights.
  */
  computeLayout: function () {
    // default layout
    var ret = this._sc_layout,
      layoutDirection = this.get('layoutDirection'),
      del = this.get('rowDelegate'),
      rowSpacing = del.get('rowSpacing');

    // Initialize lazily.
    if (!ret) ret = this._sc_layout = {};

    // Support both vertical and horizontal lists.
    if (layoutDirection === SC.LAYOUT_HORIZONTAL) {
      // Don't include the row spacing after the last item in the width.
      ret.width = Math.max(this.rowOffsetForContentIndex(this.get('length')) - rowSpacing, 0);
    } else {
      // Don't include the row spacing after the last item in the height.
      ret.height = Math.max(this.rowOffsetForContentIndex(this.get('length')) - rowSpacing, 0);
    }
    return ret;
  },

  /**
    Computes the layout for a specific content index by combining the current
    row heights.

    @param {Number} contentIndex
    @returns {Hash} layout hash for the index provided
  */
  layoutForContentIndex: function (contentIndex) {
    var del = this.get('rowDelegate'),
      layoutDirection = this.get('layoutDirection'),
      offset, size;

    offset = this.rowOffsetForContentIndex(contentIndex);
    size = this.rowSizeForContentIndex(contentIndex) - del.get('rowPadding') * 2;

    // Support both vertical and horizontal lists.
    if (layoutDirection === SC.LAYOUT_HORIZONTAL) {
      return {
        left: offset,
        width: size,
        top: 0,
        bottom: 0
      };
    } else {
      return {
        top: offset,
        height: size,
        left: 0,
        right: 0
      };
    }
  },

  /**
    Override to return an IndexSet with the indexes that are at least
    partially visible in the passed rectangle.  This method is used by the
    default implementation of computeNowShowing() to determine the new
    nowShowing range after a scroll.

    Override this method to implement incremental rendering.

    The default simply returns the current content length.

    @param {Rect} rect the visible rect or a point
    @returns {SC.IndexSet} now showing indexes
  */
  contentIndexesInRect: function (rect) {
    var del = this.get('rowDelegate'),
      totalRowSize = del.get('_sc_totalRowSize'),
      rowSpacing = del.get('rowSpacing'),
      totalRowSizeWithSpacing = totalRowSize + rowSpacing,
      layoutDirection = this.get('layoutDirection'),
      len = this.get('length'),
      offset, start, end,
      firstEdge, lastEdge,
      size;

    // Support both vertical and horizontal lists.
    if (layoutDirection === SC.LAYOUT_HORIZONTAL) {
      firstEdge = SC.minX(rect);
      lastEdge = SC.maxX(rect);
      size = rect.width || 0;
    } else {
      firstEdge = SC.minY(rect);
      lastEdge = SC.maxY(rect);
      size = rect.height || 0;
    }

    // estimate the starting row and then get actual offsets until we are
    // right.
    start = (firstEdge - (firstEdge % totalRowSizeWithSpacing)) / totalRowSizeWithSpacing;
    offset = this.rowOffsetForContentIndex(start);

    // go backwards until offset of row is before first edge
    while (start > 0 && offset > firstEdge) {
      start--;
      offset -= (this.rowSizeForContentIndex(start) + rowSpacing);
    }

    // go forwards until offset plus size of row is after first edge
    offset += this.rowSizeForContentIndex(start);
    while (start < len && offset <= firstEdge) {
      start++;
      offset += this.rowSizeForContentIndex(start) + rowSpacing;
    }
    if (start < 0) start = 0;
    if (start >= len) start = len;


    // estimate the final row and then get the actual offsets until we are
    // right. - look at the offset of the _following_ row
    end = start + ((size - (size % totalRowSizeWithSpacing)) / totalRowSizeWithSpacing);
    if (end > len) end = len;
    offset = this.rowOffsetForContentIndex(end);

    // walk backwards until offset of row is before or at last edge
    while (end >= start && offset >= lastEdge) {
      end--;
      offset -= (this.rowSizeForContentIndex(end) + rowSpacing);
    }

    // go forwards until offset plus size of row is after last edge
    offset += this.rowSizeForContentIndex(end) + rowSpacing;
    while (end < len && offset < lastEdge) {
      end++;
      offset += this.rowSizeForContentIndex(end) + rowSpacing;
    }

    end++; // end should be after start

    if (end < start) end = start;
    if (end > len) end = len;

    // convert to IndexSet and return
    return SC.IndexSet.create(start, end - start);
  },


  // ..........................................................
  // DRAG AND DROP SUPPORT
  //

  /**
    Default view class used to draw an insertion point, which uses CSS
    styling to show a horizontal line.

    This view's position (top & left) will be automatically adjusted to the
    point of insertion.

    @field
    @type SC.View
  */
  insertionPointView: SC.View.extend({
    classNames: 'sc-list-insertion-point',

    layout: function (key, value) {
      var layoutDirection = this.get('layoutDirection');

      key = layoutDirection === SC.LAYOUT_HORIZONTAL ? 'width' : 'height';

      // Getter – create layout hash.
      if (value === undefined) {
        value = {};
      }

      // Either way, add the narrow dimension to the layout if needed.
      if (SC.none(value[key])) value[key] = 2;

      return value;
    }.property('layoutDirection').cacheable(),

    /**
      The direction of layout of the SC.ListView.
      This property will be set by the list view when this view is created.
      */
    layoutDirection: SC.LAYOUT_VERTICAL,

    /** @private */
    render: function (context, firstTime) {
      if (firstTime) context.push('<div class="anchor"></div>');
    }
  }),

  /**
    Default implementation will show an insertion point
    @see SC.CollectionView#showInsertionPoint
  */
  showInsertionPoint: function (itemView, dropOperation) {
    // FAST PATH: If we're dropping on the item view itself... (Note: support for this
    // should be built into CollectionView's calling method and not the unrelated method
    // for showing an insertion point.)
    if (dropOperation & SC.DROP_ON) {
      if (itemView && itemView !== this._sc_lastDropOnView) {
        this.hideInsertionPoint();

        // If the drag is supposed to drop onto an item, notify the item that it
        // is the current target of the drop.
        itemView.set('isDropTarget', YES);

        // Track the item so that we can clear isDropTarget when the drag changes;
        // versus having to clear it from all items.
        this._sc_lastDropOnView = itemView;
      }
      return;
    }

    // Otherwise, we're actually inserting.

    // TODO: CollectionView's notes on showInsertionPoint specify that if no itemView
    // is passed, this should try to get the last itemView. (Note that ListView's
    // itemViewForContentIndex creates a new view on demand, so make sure that we
    // have content items before getting the last view.) This is a change in established
    // behavior however, so proceed carefully.

    // If there was an item that was the target of the drop previously, be
    // sure to clear it.
    if (this._sc_lastDropOnView) {
      this._sc_lastDropOnView.set('isDropTarget', NO);
      this._sc_lastDropOnView = null;
    }

    var len = this.get('length'),
      index, level, indent;

    // Get values from itemView, if present.
    if (itemView) {
      index = itemView.get('contentIndex');
      level = itemView.get('outlineLevel');
      indent = itemView.get('outlineIndent');
    }

    // Set defaults.
    index = index || 0;
    if (SC.none(level)) level = -1;
    indent = indent || 0;

    // Show item indented if we are inserting at the end and the last item
    // is a group item.  This is a special case that should really be
    // converted into a more general protocol.
    if ((index >= len) && index > 0) {
      var previousItem = this.itemViewForContentIndex(len - 1);
      if (previousItem.get('isGroupView')) {
        level = 1;
        indent = previousItem.get('outlineIndent');
      }
    }

    // Get insertion point.
    var insertionPoint = this._sc_insertionPointView,
      layoutDirection = this.get('layoutDirection');

    if (!insertionPoint) {
      insertionPoint = this._sc_insertionPointView = this.get('insertionPointView').create({
        layoutDirection: layoutDirection
      });
    }

    // Calculate where it should go.
    var itemViewLayout = itemView ? itemView.get('layout') : { top: 0, left: 0 },
      top, left;

    // Support both vertical and horizontal lists.
    if (layoutDirection === SC.LAYOUT_HORIZONTAL) {
      left = itemViewLayout.left;
      if (dropOperation & SC.DROP_AFTER) { left += itemViewLayout.width; }
      top = ((level + 1) * indent) + 12;
    } else {
      top = itemViewLayout.top;
      if (dropOperation & SC.DROP_AFTER) { top += itemViewLayout.height; }
      left = ((level + 1) * indent) + 12;
    }

    // Put it there.
    insertionPoint.adjust({ top: top, left: left });

    this.appendChild(insertionPoint);
  },

  /** @see SC.CollectionView#hideInsertionPoint */
  hideInsertionPoint: function () {
    // If there was an item that was the target of the drop previously, be
    // sure to clear it.
    if (this._sc_lastDropOnView) {
      this._sc_lastDropOnView.set('isDropTarget', NO);
      this._sc_lastDropOnView = null;
    }

    var view = this._sc_insertionPointView;
    if (view) view.removeFromParent().destroy();
    this._sc_insertionPointView = null;
  },

  /**
    Compute the insertion index for the passed location.  The location is
    a point, relative to the top/left corner of the receiver view.  The return
    value is an index plus a dropOperation, which is computed as such:

      - if outlining is not used and you are within 5px of an edge, DROP_BEFORE
        the item after the edge.
      - if outlining is used and you are within 5px of an edge and the previous
        item has a different outline level then the next item, then DROP_AFTER
        the previous item if you are closer to that outline level.
      - if dropOperation = SC.DROP_ON and you are over the middle of a row, then
        use DROP_ON.

    @see SC.CollectionView.insertionIndexForLocation
  */
  insertionIndexForLocation: function (loc, dropOperation) {
    var locRect = { x: loc.x, y: loc.y, width: 1, height: 1 },
      indexes = this.contentIndexesInRect(locRect),
      index   = indexes.get('min'),
      len     = this.get('length'),
      min, max, diff, clevel, cindent, plevel, pindent, itemView;

    // if there are no indexes in the rect, then we need to either insert
    // before the top item or after the last item.  Figure that out by
    // computing both.
    if (SC.none(index) || index < 0) {
      if ((len === 0) || (loc.y <= this.rowOffsetForContentIndex(0))) index = 0;
      else if (loc.y >= this.rowOffsetForContentIndex(len)) index = len;
    }

    // figure the range of the row the location must be within.
    min = this.rowOffsetForContentIndex(index);
    max = min + this.rowSizeForContentIndex(index);

    // now we know which index we are in.  if dropOperation is DROP_ON, figure
    // if we can drop on or not.
    if (dropOperation === SC.DROP_ON) {
      // editable size - reduce height by a bit to handle dropping
      if (this.get('isEditable')) diff = Math.min(Math.floor((max - min) * 0.2), 5);
      else diff = 0;

      // if we're inside the range, then DROP_ON
      if (loc.y >= (min + diff) || loc.y <= (max + diff)) {
        return [index, SC.DROP_ON];
      }
    }

    // finally, let's decide if we want to actually insert before/after.  Only
    // matters if we are using outlining.
    if (index > 0) {

      itemView = this.itemViewForContentIndex(index - 1);
      pindent  = (itemView ? itemView.get('outlineIndent') : 0) || 0;
      plevel   = itemView ? itemView.get('outlineLevel') : 0;

      if (index < len) {
        itemView = this.itemViewForContentIndex(index);
        clevel   = itemView ? itemView.get('outlineLevel') : 0;
        cindent  = (itemView ? itemView.get('outlineIndent') : 0) || 0;
        cindent  *= clevel;
      } else {
        clevel = itemView.get('isGroupView') ? 1 : 0; // special case...
        cindent = pindent * clevel;
      }

      pindent *= plevel;

      // if indent levels are different, then try to figure out which level
      // it should be on.
      if ((clevel !== plevel) && (cindent !== pindent)) {

        // use most inner indent as boundary
        if (pindent > cindent) {
          index--;
          dropOperation = SC.DROP_AFTER;
        }
      }
    }

    // we do not support dropping before a group item.  If dropping before
    // a group item, always try to instead drop after the previous item.  If
    // the previous item is also a group then, well, dropping is just not
    // allowed.  Note also that dropping at 0, first item must not be group
    // and dropping at length, last item must not be a group
    //
    if (dropOperation === SC.DROP_BEFORE) {
      itemView = (index < len) ? this.itemViewForContentIndex(index) : null;
      if (!itemView || itemView.get('isGroupView')) {
        if (index > 0) {
          itemView = this.itemViewForContentIndex(index - 1);

          // don't allow a drop if the previous item is a group view and we're
          // insert before the end.  For the end, allow the drop if the
          // previous item is a group view but OPEN.
          if (!itemView.get('isGroupView') || (itemView.get('disclosureState') === SC.BRANCH_OPEN)) {
            index = index - 1;
            dropOperation = SC.DROP_AFTER;
          } else index = -1;

        } else index = -1;
      }

      if (index < 0) dropOperation = SC.DRAG_NONE;
    }

    // return whatever we came up with
    return [index, dropOperation];
  }

});
