// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/collection');

/**
  @class

  A StackedView is a CollectionView that expects its content to use static
  layout to stack vertically.  This type of collection view is not designed
  for use with large size collections, but it can be very useful for
  collections with complex displays and variable heights such as comments or
  small notification queues.

  ## Static Layout

  This view makes no attempt to size or position your child views.  It assumes
  you are using StaticLayout for your child views.  If you don't enable static
  layout your views will probably overlay on top of each other and will look
  incorrect.

  @extends SC.CollectionView
  @since SproutCore 0.9
*/
SC.StackedView = SC.CollectionView.extend(
/** @scope SC.StackedView.prototype */ {

  /**
    @type Array
    @default ['sc-stacked-view']
    @see SC.View#classNames
  */
  classNames: ['sc-stacked-view'],

  /**
    Default layout for a stacked view will fill the parent view but auto-
    adjust the height or width of the view.

    @type Hash
    @default `{ top: 0, left: 0 }`
    @see SC.View#layout
  */
  layout: { top: 0, left: 0, right: 0, height: 1 },

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
    Return full range of its indexes for nowShowing

    @param {Rect} rect
    @returns {SC.IndexSet} full range of indexes
  */
  computeNowShowing: function () {
    return this.get('allContentIndexes');
  },

  /**
    Updates the size of the stacked view to reflect the current content of
    the view.  This is called automatically whenever an item view is reloaded.
    You can also call this method directly if the size of one of your views
    has changed.

    The size will be recomputed based on the actual location and dimensions
    of the last child view.

    Note that normally this method will defer actually updating the size
    of the view until the end of the run loop.  You can force an immediate
    update by passing YES to the "immediately" parameter.

    @param {Boolean} immediately YES to update immediately
    @returns {SC.StackedView} receiver
  */
  updateSize: function (immediately) {
    if (immediately) this._updateSize();
    else this.invokeLast(this._updateSize);
    // ^ use invokeLast() here because we need to wait until all rendering has
    //   completed.

    return this;
  },

  /** @private */
  _updateSize: function () {

    var layoutDirection = this.get('layoutDirection'),
      sizeKey = layoutDirection === SC.LAYOUT_VERTICAL ? 'Height' : 'Width',
      offsetKey = layoutDirection === SC.LAYOUT_VERTICAL ? 'Top' : 'Left',
      childViews = this.get('childViews'),
      len = childViews.get('length'),
      view, layer, size;

    if (len === 0) {
      size = 1;
    } else {
      view = childViews.objectAt(len - 1);
      layer = view ? view.get('layer') : null;
      size = layer ? (layer['offset'+offsetKey] + layer['offset'+sizeKey]) : 1;
      layer = null; // avoid memory leaks
    }
    this.adjust('min'+sizeKey, size);
    this.set('calculated'+sizeKey, size);
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private
    Whenever the collection view reloads some views, reset the cache on the
    frame as well so that it will recalculate.
  */
  reloadIfNeeded: function () {
    sc_super();

    return this.updateSize();
  },

  /** @private
    When layer is first created, make sure we update the size using the
    newly calculated value.
  */
  didCreateLayer: function () { return this.updateSize(); }

});
