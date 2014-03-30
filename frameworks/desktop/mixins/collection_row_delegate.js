// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  @namespace

  `CollectionRowDelegate`s are consulted by collection views, such as `SC.ListView`
  that lay out items in vertical or horizontal rows, in order to determine the
  height or width of each row.
*/
SC.CollectionRowDelegate = {

  /**
    Walk like a duck.

    @type Boolean
    @default true
  */
  isCollectionRowDelegate: true,

  /** @deprecated Version 1.11. Please use the `rowSize` property instead.
    Size of an item without spacing or padding.
    Unless you implement custom row height or widths upport, this row height will be used for all items.

    @type Number
    @default 24
  */
  itemHeight: null,

  /**
    The height or width of a row before padding depending on whether the
    collection is laid out vertically or horizontally.

    Unless you implement custom row size support, this value will be used for
    all rows.

    @type Number
    @default 24
  */
  // This is a computed property in order to provide backwards compatibility for itemHeight.
  // When itemHeight is removed completely, this can become a simple `24` value.
  rowSize: function (key, value) {
    var itemHeight = this.get('itemHeight'),
      ret = 24;

    // Backwards compatibility support
    if (!SC.none(itemHeight)) {
      //@if(debug)
      SC.warn('Developer Warning: The itemHeight property of SC.CollectionRowDelegate has been renamed to rowSize.');
      //@endif

      return itemHeight;
    }

    if (!SC.none(value)) { ret = value; }

    return ret;
  }.property('itemHeight').cacheable(),

  /**
    The amount of space to leave between each row.

    This is useful when you need to leave space for borders.

    @type Number
    @default 0
  */
  rowSpacing: 0,

  /**
    Padding space added to the top and bottom of each row when laid out vertically,
    or to the left and right when laid out horizontally.

    This is useful if you are using a custom item view that needs to be padded.

    @type Number
    @default 0
  */
  rowPadding: 0,

  /** @deprecated Version 1.11. Please use a combination of rowSize and rowPadding to specify the total height or width of each row.
    Total row size used for calculation. Equal to `rowSize + (2 * rowPadding)`.

    @type Number
  */
  rowHeight: function (key, value) {
    var rowPadding = this.get('rowPadding'),
      rowSize = this.get('rowSize');

    if (value !== undefined) {
      this.set('rowSize', value - rowPadding * 2);
      return value;
    }

    return rowSize + rowPadding * 2;
  }.property('rowSize', 'rowPadding'),

  /** @private - Returns the total row size based on rowSize and rowPadding for convenience. */
  _sc_totalRowSize: function () {
    // Backwards compatibility in case the rowHeight property is set directly.
    return this.get('rowHeight');
  }.property('rowHeight'),

  /** @deprecated Version 1.11. Please use the `customRowSizeIndexes` property instead.
    Index set of rows that should have a custom row height. If you need
    certain rows to have a custom row height, then set this property to a
    non-null value.  Otherwise leave it blank to disable custom row heights.

    @type SC.IndexSet
  */
  customRowHeightIndexes: null,

  /**
    Index set of rows that should have a custom row height. If you need
    certain rows to have a custom row height, then set this property to a
    non-null value.  Otherwise leave it blank to disable custom row heights.

    @type SC.IndexSet
  */
  // This is a computed property in order to provide backwards compatibility for customRowHeightIndexes.
  // When customRowHeightIndexes is removed completely, this can become a simple `null` value.
  customRowSizeIndexes: function (key, value) {
    var customRowHeightIndexes = this.get('customRowHeightIndexes'),
      ret = null;

    // Backwards compatibility support.
    if (!SC.none(customRowHeightIndexes)) {
      //@if(debug)
      SC.warn('Developer Warning: The customRowHeightIndexes property of SC.CollectionRowDelegate has been renamed to customRowSizeIndexes.');
      //@endif

      return customRowHeightIndexes;
    }

    if (!SC.none(value)) { ret = value; }

    return ret;
  }.property('customRowHeightIndexes').cacheable(),

  /** @deprecated Version 1.11. Please use the `contentIndexRowSize()` function instead.
    Called for each index in the `customRowSizeIndexes` set to get the
    actual row height for the index.  This method should return the default
    rowSize if you don't want the row to have a custom height.

    The default implementation just returns the default rowSize.

    @param {SC.CollectionView} view the calling view
    @param {Object} content the content array
    @param {Number} contentIndex the index
    @returns {Number} row height
  */
  contentIndexRowHeight: function (view, content, contentIndex) {
    return this.get('_sc_totalRowSize');
  },

  /**
    Called for each index in the `customRowSizeIndexes` set to get the
    actual row size for the index.  This method should return the default
    rowSize if you don't want the row to have a custom size.

    The default implementation just returns the default rowSize plus rowPadding.

    @param {SC.CollectionView} view the calling view
    @param {Object} content the content array
    @param {Number} contentIndex the index
    @returns {Number} row size
  */
  contentIndexRowSize: function (view, content, contentIndex) {
    // Backwards compatibility in case the contentIndexRowHeight function is overridden.
    return this.contentIndexRowHeight(view, content, contentIndex);
  }

};
