// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/list') ;

/** @class

  A grid view renders a collection of items in a grid of rows and columns.

  ## Dropping on an Item

  When the grid view is configured to accept drags and drops onto its items, it
  will set the isDropTarget property on the target item accordingly.  This
  allows you to modify the appearance of the drop target grid item accordingly
  (@see SC.ListItemView#isDropTarget).

  @extends SC.ListView
  @author Charles Jolley
  @version 1.0
*/
SC.GridView = SC.ListView.extend(
/** @scope SC.GridView.prototype */ {

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
  layout: { left:0, right:0, top:0, bottom:0 },

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
    Possible values:

      - SC.HORIZONTAL_ORIENTATION
      - SC.VERTICAL_ORIENTATION

    @type String
    @default SC.HORIZONTAL_ORIENTATION
  */
  insertionOrientation: SC.HORIZONTAL_ORIENTATION,

  /** @private */
  itemsPerRow: function() {
    var f = this.get('frame'),
        columnWidth = this.get('columnWidth') || 0 ;

    return (columnWidth <= 0) ? 1 : Math.floor(f.width / columnWidth) ;
  }.property('clippingFrame', 'columnWidth').cacheable(),

  /** @private
    Find the contentIndexes to display in the passed rect. Note that we
    ignore the width of the rect passed since we need to have a single
    contiguous range.
  */
  contentIndexesInRect: function(rect) {
    var rowHeight = this.get('rowHeight') || 48 ,
        itemsPerRow = this.get('itemsPerRow'),
        min = Math.floor(SC.minY(rect) / rowHeight) * itemsPerRow,
        max = Math.ceil(SC.maxY(rect) / rowHeight) * itemsPerRow ;
    return SC.IndexSet.create(min, max-min);
  },

  /** @private */
  layoutForContentIndex: function(contentIndex) {
    var rowHeight = this.get('rowHeight') || 48,
        frameWidth = this.get('clippingFrame').width,
        itemsPerRow = this.get('itemsPerRow'),
        columnWidth = Math.floor(frameWidth/itemsPerRow),
        row = Math.floor(contentIndex / itemsPerRow),
        col = contentIndex - (itemsPerRow*row) ;
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
  computeLayout: function() {
    var content = this.get('content'),
        count = (content) ? content.get('length') : 0,
        rowHeight = this.get('rowHeight') || 48,
        itemsPerRow = this.get('itemsPerRow'),
        rows = Math.ceil(count / itemsPerRow) ;

    // use this cached layout hash to avoid allocing memory...
    var ret = this._cachedLayoutHash ;
    if (!ret) ret = this._cachedLayoutHash = {};

    // set minHeight
    ret.minHeight = rows * rowHeight ;
    this.calculatedHeight = ret.minHeight;
    return ret;
  },

  /**
    @type SC.View
  */
  insertionPointClass: SC.View.extend({
    classNames: ['grid-insertion-point'],

    render: function(context, firstTime) {
      if (firstTime) context.push('<span class="anchor"></span>') ;
    }
  }),

  /** @private */
  showInsertionPoint: function(itemView, dropOperation) {
    if (!itemView) return;

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
        this._lastDropOnView = null ;
      }

      if (!this._insertionPointView) {
        this._insertionPointView = this.insertionPointClass.create() ;
      }

      var insertionPoint = this._insertionPointView ;
      var itemViewFrame = itemView.get('frame') ;
      var f = { height: itemViewFrame.height - 6,
            x: itemViewFrame.x,
            y: itemViewFrame.y + 6,
            width: 0
          };

      if (!SC.rectsEqual(insertionPoint.get('frame'), f)) {
        insertionPoint.set('frame', f) ;
      }

      if (insertionPoint.parentNode !== itemView.parentNode) {
        itemView.parentNode.appendChild(insertionPoint) ;
      }
    }

  },

  /** @see SC.CollectionView#hideInsertionPoint */
  hideInsertionPoint: function() {
    // If there was an item that was the target of the drop previously, be
    // sure to clear it.
    if (this._lastDropOnView) {
      this._lastDropOnView.set('isDropTarget', NO);
      this._lastDropOnView = null;
    }

    var view = this._insertionPointView ;
    if (view) view.removeFromParent().destroy();
    this._insertionPointView = null;
  },

  /** @private */
  insertionIndexForLocation: function(loc, dropOperation) {
    var f = this.get('frame'),
        sf = this.get('clippingFrame'),
        itemsPerRow = this.get('itemsPerRow'),
        columnWidth = Math.floor(f.width / itemsPerRow),
        row = Math.floor((loc.y - f.y - sf.y) / this.get('rowHeight')) ;

    var retOp = SC.DROP_BEFORE,
        offset = (loc.x - f.x - sf.x),
        col = Math.floor(offset / columnWidth),
        percentage = (offset / columnWidth) - col ;

    // if the dropOperation is SC.DROP_ON and we are in the center 60%
    // then return the current item.
    if (dropOperation === SC.DROP_ON) {
      if (percentage > 0.80) col++ ;
      if ((percentage >= 0.20) && (percentage <= 0.80)) {
        retOp = SC.DROP_ON;
      }
    } else {
      if (percentage > 0.45) col++ ;
    }

    // convert to index
    var ret= (row*itemsPerRow) + col ;
    return [ret, retOp] ;
  },

  /** @private
    Since GridView lays out items evenly from left to right, if the width of the
    clipping frame changes, all of the item views on screen are potentially in
    the wrong position.

    Update all of their layouts if necessary.
  */
  _gv_clippingFrameDidChange: function() {
    var clippingFrame = this.get('clippingFrame'),
      width;

    // Changes to the width of the clippingFrame is the only variable that
    // alters the layout of item views.
    width = clippingFrame.width;
    if (this._lastFrameWidth && width !== this._lastFrameWidth) {
      this.notifyPropertyChange('itemsPerRow');

      var idx,
        itemView,
        nowShowing = this.get('nowShowing');

      // Only loop through the now showing indexes, if the content is sparsely
      // loaded we could inadvertently trigger reloading unneeded content.
      nowShowing.forEach(function(idx) {
        itemView = this.itemViewForContentIndex(idx);
        itemView.adjust(this.layoutForContentIndex(idx));
      }, this);
    }

    // Cache the last width in order to check for differences.
    this._lastFrameWidth = width;
  }.observes('clippingFrame')
}) ;
