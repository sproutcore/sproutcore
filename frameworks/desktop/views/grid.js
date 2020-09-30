// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/list');


/** @class

  A grid view renders a collection of items in a grid of rows and columns.

  ## Dropping on an Item

  When the grid view is configured to accept drags and drops onto its items, it
  will set the isDropTarget property on the target item accordingly.  This
  allows you to modify the appearance of the drop target grid item accordingly
  (@see SC.ListItemView#isDropTarget).


  ## Advanced usage examples

  ### Fixed item count per column and row

    itemsPerColumn: null,
    itemsPerColumnBinding: SC.Binding.oneWay('...itemsPerColumn'),

    itemsPerRow: null,
    itemsPerRowBinding: SC.Binding.oneWay('...itemsPerRow'),

    rowHeight: function () {
      var frameHeight = this.get('clippingFrame').height,
        itemsPerColumn = this.get('itemsPerColumn'),
        rowHeight = frameHeight / itemsPerColumn;

      return rowHeight;
    }.property('itemsPerColumn', '_frameHeight').cacheable(),

    columnWidth: function () {
      var frameWidth = this.get('clippingFrame').width,
        itemsPerRow = this.get('itemsPerRow'),
        columnWidth = frameWidth / itemsPerRow;

      return columnWidth;
    }.property('itemsPerRow', '_frameWidth').cacheable(),


  ### Fixed row height and column width

    rowHeightBinding: SC.Binding.oneWay('...cellSize'),

    columnWidthBinding: SC.Binding.oneWay('...cellSize')

    stretchedRowHeight: function() {
      return this.get('rowHeight');
    }.property('rowHeight').cacheable(),,

    stretchedColumnWidth: function() {
      return this.get('columnWidth');
    }.property('columnWidth').cacheable(),


  @extends SC.ListView
  @author Charles Jolley
  @version 1.0
*/
SC.GridView = SC.ListView.extend(
/** @scope SC.GridView.prototype */ {

  /** @private */
  _lastFrameWidth: null,

  /**
    @type Array
    @default ['sc-grid-view']
    @see SC.View#classNames
  */
  classNames: ['sc-grid-view'],

  /**
    @type Hash
    @default { left:0, right:0, top:0, bottom:0 }
    @see SC.View#layout
  */
  layout: { left: 0, right: 0, top: 0, bottom: 0 },

  /**
    The common row height for grid items.

    The value should be an integer expressed in pixels.

    @type Number
    @default 48
  */
  rowHeight: 48,

  /**
    The minimum column width for grid items.  Items will actually
    be laid out as needed to completely fill the space, but the minimum
    width of each item will be this value.

    @type Number
    @default 64
  */
  columnWidth: 64,

  /**
    The default example item view will render text-based items.

    You can override this as you wish.

    @type SC.View
    @default SC.LabelView
  */
  exampleView: SC.LabelView,

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
    Possible values:

      - SC.HORIZONTAL_ORIENTATION
      - SC.VERTICAL_ORIENTATION

    @type String
    @default SC.HORIZONTAL_ORIENTATION
  */
  insertionOrientation: SC.HORIZONTAL_ORIENTATION,

  /** @private */
  itemsPerRow: function () {
    var frameWidth = this.get('clippingFrame').width,
      columnWidth = this.get('columnWidth') || 48,
      itemsPerRow = Math.floor(frameWidth / columnWidth);

    return itemsPerRow ? itemsPerRow : 1;
  }.property('columnWidth', '_frameWidth').cacheable(),

  /** @private */
  rowCount: function () {
    var length = this.get('length'),
      itemsPerRow = this.get('itemsPerRow') ;

    return Math.ceil(length / itemsPerRow);
  }.property('itemsPerRow', 'length').cacheable(),

  /** @private */
  itemsPerColumn: function() {
    var frameHeight = this.get('clippingFrame').height,
      rowHeight = this.get('rowHeight') || 64,
      itemsPerColumn = Math.floor(frameHeight / rowHeight);

    return itemsPerColumn ? itemsPerColumn : 1;
  }.property('rowHeight', '_frameHeight').cacheable(),

  /** @private */
  columnCount: function () {
    var length = this.get('length') || 0,
      itemsPerColumn = this.get('itemsPerColumn');

    return Math.ceil(length / itemsPerColumn);
  }.property('itemsPerColumn', 'length').cacheable(),




  /** @private */
  stretchedColumnWidth: function() {
    var frame = this.get('clippingFrame'),
      frameWidth = frame.width,
      itemsPerRow = this.get('itemsPerRow');

    return (frameWidth / itemsPerRow) || 64;
  }.property('_frameWidth', 'itemsPerRow').cacheable(),

  /** @private */
  stretchedRowHeight: function() {
    var frame = this.get('clippingFrame'),
      frameHeight = frame.height,
      itemsPerColumn = this.get('itemsPerColumn');

    return (frameHeight / itemsPerColumn) || 48;
  }.property('_frameHeight', 'itemsPerColumn').cacheable(),

  /** @private
    Find the contentIndexes to display in the passed rect. Note that we
    ignore the width of the rect passed since we need to have a single
    contiguous range.
  */
  contentIndexesInRect: function (rect) {
    var layoutDirection = this.get('layoutDirection'),
      itemsPerRow = this.get('itemsPerRow'),
      itemsPerColumn = this.get('itemsPerColumn'),
      rowHeight, columnWidth,
      min, max;

    if (layoutDirection === SC.LAYOUT_HORIZONTAL) {
      columnWidth = this.get('columnWidth') || 64;
      min = Math.floor(SC.minX(rect) / columnWidth) * itemsPerColumn;
      max = Math.ceil(SC.maxX(rect) / columnWidth) * itemsPerColumn;
    }
    else {
      rowHeight = this.get('rowHeight') || 48;
      min = Math.floor(SC.minY(rect) / rowHeight) * itemsPerRow;
      max = Math.ceil(SC.maxY(rect) / rowHeight) * itemsPerRow;
    }

    return SC.IndexSet.create(min, max - min);
  },

  /** @private */
  layoutForContentIndex: function (contentIndex) {
    var layoutDirection = this.get('layoutDirection'),
      itemsPerRow = this.get('itemsPerRow'),
      itemsPerColumn = this.get('itemsPerColumn'),
      rowHeight = this.get('rowHeight') || 48,
      columnWidth = this.get('columnWidth') || 64,
      row, col;

    // If the frame is not ready, then just return an empty layout.
    // Otherwise, NaN will be entered into layout values.
    if (this.get('clippingFrame').width === 0) {
      return {};
    }

    if (layoutDirection === SC.LAYOUT_HORIZONTAL) {
      rowHeight = this.get('stretchedRowHeight');
      col = Math.floor(contentIndex / itemsPerColumn);
      row = contentIndex - (itemsPerColumn * col);
    }
    else {
      columnWidth = this.get('stretchedColumnWidth');
      row = Math.floor(contentIndex / itemsPerRow);
      col = contentIndex - (itemsPerRow * row);
    }

    return {
      left: col * columnWidth,
      top: row * rowHeight,
      height: rowHeight,
      width: columnWidth
    };
  },

  /** @private
    Overrides default CollectionView method to compute the minimum height
    of the list view.
  */
  computeLayout: function () {
    var layoutDirection = this.get('layoutDirection');

    // use this cached layout hash to avoid allocing memory...
    var ret = this._cachedLayoutHash;
    if (!ret) ret = this._cachedLayoutHash = {};

    // Support both vertical and horizontal grids.
    if (layoutDirection === SC.LAYOUT_HORIZONTAL) {
      var columnWidth = this.get('columnWidth') || 64,
        columnCount = this.get('columnCount');

      ret.width = columnCount * columnWidth;
      //this.set('calculatedWidth', ret.width);
    } else {
      var rowHeight = this.get('rowHeight') || 48,
        rowCount = this.get('rowCount');

      ret.height = rowCount * rowHeight;
      //this.set('calculatedHeight', ret.height);
    }
    return ret;
  },

  /**
    Default view class used to draw an insertion point, which uses CSS
    styling to show a horizontal line.

    This view's position (top & left) will be automatically adjusted to the
    point of insertion.

    @field
    @type SC.View
  */
  insertionPointClass: SC.View.extend({
    classNames: ['sc-grid-insertion-point'],

    layout: { width: 2 },

    render: function (context, firstTime) {
      if (firstTime) context.push('<div class="anchor"></div>');
    }
  }),

  /** @private */
  showInsertionPoint: function (itemView, dropOperation) {
    // If no itemView, it means we drag at the end
    if (!itemView) {
      itemView = this.itemViewForContentObject(this.getPath('content.lastObject'));
      dropOperation = SC.DROP_AFTER;
    }

    // if drop on, then just add a class...
    if (dropOperation & SC.DROP_ON) {
      if (itemView !== this._lastDropOnView) {
        this.hideInsertionPoint();

        // If the drag is supposed to drop onto an item, notify the item that it
        // is the current target of the drop.
        itemView.set('isDropTarget', YES);

        // Track the item so that we can clear isDropTarget when the drag changes;
        // versus having to clear it from all items.
        this._lastDropOnView = itemView;
      }

    } else {
      if (this._lastDropOnView) {
        // If there was an item that was the target of the drop previously, be
        // sure to clear it.
        this._lastDropOnView.set('isDropTarget', NO);
        this._lastDropOnView = null;
      }

      var insertionPoint = this._insertionPointView,
        layout = itemView.get('layout'),
        top, left;

      if (!insertionPoint) {
        insertionPoint = this._insertionPointView = this.insertionPointClass.create();
      }

      // Adjust the position of the insertion point.
      top = layout.top;
      left = layout.left;
      if (dropOperation & SC.DROP_AFTER) left += layout.width - 2;
      var height = layout.height;

      // Adjust the position of the insertion point.
      insertionPoint.adjust({ top: top, left: left, height: height });
      this.appendChild(insertionPoint);
    }
  },

  /** @see SC.CollectionView#hideInsertionPoint */
  hideInsertionPoint: function () {
    // If there was an item that was the target of the drop previously, be
    // sure to clear it.
    if (this._lastDropOnView) {
      this._lastDropOnView.set('isDropTarget', NO);
      this._lastDropOnView = null;
    }

    var view = this._insertionPointView;
    if (view) view.removeFromParent().destroy();
    this._insertionPointView = null;
  },

  /** @private */
  insertionIndexForLocation: function (loc, dropOperation) {
    var f = this.get('frame'),
        sf = this.get('clippingFrame'),
        itemsPerRow = this.get('itemsPerRow'),
        columnWidth = this.get('stretchedColumnWidth'),
        row = Math.floor((loc.y - f.y - sf.y) / this.get('rowHeight'));

    var retOp = SC.DROP_BEFORE,
        offset = (loc.x - f.x - sf.x),
        col = Math.floor(offset / columnWidth),
        percentage = (offset / columnWidth) - col;

    // if the dropOperation is SC.DROP_ON and we are in the center 60%
    // then return the current item.
    if (dropOperation === SC.DROP_ON) {
      if (percentage > 0.80) col++;
      if ((percentage >= 0.20) && (percentage <= 0.80)) {
        retOp = SC.DROP_ON;
      }
    } else {
      if (percentage > 0.45) col++;
    }

    // convert to index
    var ret = (row * itemsPerRow) + col;
    return [ret, retOp];
  },

  /** @private
    Since GridView lays out items evenly from left to right, if the width of the
    frame changes, all of the item views on screen are potentially in
    the wrong position.

    Update all of their layouts if necessary.
  */
  viewDidResize: function () {
    sc_super();

    var frame = this.get('clippingFrame'),
      lastFrameWidth = this._lastFrameWidth,
      width = frame.width,
      lastFrameHeight = this._lastFrameHeight,
      height = frame.height,
      frameDidChange = true;

    // A change to the width of the frame is the only variable that
    // alters the layout of item views and our computed layout.
    if (!SC.none(lastFrameWidth) && width !== lastFrameWidth) {
      // Internal property used to indicate a possible itemsPerRow change.  This
      // is better than having itemsPerRow dependent on frame which changes frequently.
      this.set('_frameWidth', width);
      frameDidChange = true;
    }
    this._lastFrameWidth = width;

    // A change to the height of the frame is the only variable that
    // alters the layout of item views and our computed layout.
    if (!SC.none(lastFrameHeight) && height !== lastFrameHeight) {
      // Internal property used to indicate a possible itemsPerColumn change.  This
      // is better than having itemsPerColumn dependent on frame which changes frequently.
      this.set('_frameHeight', height);
      frameDidChange = true;
    }
    this._lastFrameHeight = height;

    if (frameDidChange) {
      this.adjustChildLayouts();
      this.invokeOnce('adjustLayout');
    }
  },

  /** @private */
  adjustChildLayouts: function () {
    var nowShowing = this.get('nowShowing');

    // Only loop through the now showing indexes, if the content is sparsely
    // loaded we could inadvertently trigger reloading unneeded content.
    nowShowing.forEach(function(idx) {
      var itemView = this.itemViewForContentIndex(idx);
      itemView.adjust(this.layoutForContentIndex(idx));
    }, this);
  },

});
