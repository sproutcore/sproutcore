// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/list');
sc_require('views/table_row');
sc_require('views/table_head');
sc_require('mixins/table_delegate');

/** @class
  
  A table view renders a two-dimensional grid of data.
  
  TODO: More documentation.
  
  @extends SC.ListView
  @extends SC.TableDelegate
  @since SproutCore 1.1
*/

SC.TableView = SC.ListView.extend(SC.TableDelegate, {
  /** @scope SC.TableView.prototype */  
  
  // ..........................................................
  // PROPERTIES
  // 
  
  classNames: ['sc-table-view'],
  
  childViews: "tableHeadView scrollView".w(),
  
  scrollView: SC.ScrollView.design({
    layout: {
      left:   0,
      right:  0,
      bottom: 0,
      top:    18
    },
    hasHorizontalScroller: NO,
    contentView: SC.View.design({
    }),
    
    // FIXME: Hack.
    _sv_offsetDidChange: function() {
      this.get('parentView')._sctv_scrollOffsetDidChange();
    }.observes('verticalScrollOffset', 'horizontalScrollOffset')
  }),

  hasHorizontalScroller: NO,
  hasVerticalScroller: NO,
  
  selectOnMouseDown: NO,
  
  // FIXME: Charles originally had this as an outlet, but that doesn't work.
  // Figure out why.
  containerView: function() {
    return this.get('scrollView').get('contentView');
  }.property('scrollView'),
  
  layout: { left: 0, right: 0, top: 0, bottom: 0 },
  
  init: function() {
    window.table = this; // DEBUG
    //this._sctv_columnsDidChange();
    return sc_super();
  },
  
  
  canReorderContent: NO,
  
  // ..........................................................
  // COLUMN PROPERTIES
  //
  
  /**
    A collection of `SC.TableColumn` objects. Modify the array to adjust the
    columns.
    
    @property
    @type Array
  */
  columns: [],
  
  /**
    Which column will alter its size so that the columns fill the available
    width of the table. If `null`, the last column will stretch.
    
    @property
    @type SC.TableColumn
  */
  flexibleColumn: null,
  
  /**
    Which column is currently the "active" column for sorting purposes.
    Doesn't say anything about sorting direction; for that, read the
    `sortState` property of the sorted column.
    
    @property
    @type SC.TableColumn
  */
  sortedColumn: null,

  // ..........................................................
  // HEAD PROPERTIES
  // 

  /**
    if YES, the table view will generate a head row at the top of the table
    view.
    
    @property
    @type Boolean
  */
  hasTableHead: YES,
    
  /**
    The view that serves as the head view for the table (if any).
    
    @property
    @type SC.View
  */
  tableHeadView: SC.TableHeadView.design({
    layout: { top: 0, left: 0, right: 0 }
  }),
  
  /**
    The height of the table head in pixels.
    
    @property
    @type Number
  */
  tableHeadHeight: 18,
  

  // ..........................................................
  // ROW PROPERTIES
  //

  /**
    Whether all rows in the table will have the same pixel height. If so, we
    can compute offsets very cheaply.
    
    @property
    @type Boolean
  */
  hasUniformRowHeights: YES,
  
  /**
    How high each row should be, in pixels.
    
    @property
    @type Number
  */
  rowHeight: 18,
  
  /**
    Which view to use for a table row.
    
    @property
    @type SC.View
  */
  exampleView: SC.TableRowView,
  
  
  // ..........................................................
  // OTHER PROPERTIES
  // 
  
  filterKey: null,
  
  
  /**
    Returns the top offset for the specified content index.  This will take
    into account any custom row heights and group views.
    
    @param {Number} idx the content index
    @returns {Number} the row offset in pixels
  */
  
  rowOffsetForContentIndex: function(contentIndex) {
    var top = 0, idx;
    
    if (this.get('hasUniformRowHeights')) {
      return top + (this.get('rowHeight') * contentIndex);
    } else {
      for (idx = 0; idx < contentIndex; i++) {
        top += this.rowHeightForContentIndex(idx);
      }
      return top;
    }    
  },
  
  /**
    Returns the row height for the specified content index.  This will take
    into account custom row heights and group rows.
    
    @param {Number} idx content index
    @returns {Number} the row height in pixels
  */
  rowHeightForContentIndex: function(contentIndex) {
    if (contentIndex > 1000) { debugger; }
    if (this.get('hasUniformRowHeights')) {
      return this.get('rowHeight');
    } else {
      // TODO
    }
  },  
  
  /**  
    Computes the layout for a specific content index by combining the current
    row heights.
    
    @param {Number} index content index
  */
  layoutForContentIndex: function(index) {
    return {
      top:    this.rowOffsetForContentIndex(index),
      height: this.rowHeightForContentIndex(index),
      left:   0,
      right:  0
    };
  },
  
  createItemView: function(exampleClass, idx, attrs) {
    // Add a `tableView` attribute to each created row so it has a way to
    // refer back to this view.
    attrs.tableView = this;
    return exampleClass.create(attrs);
  },
  
  clippingFrame: function() {
    var cv = this.get('containerView'),
        sv = this.get('scrollView'),
        f  = this.get('frame');

    return {
      height: f.height,
      width:  f.width,
      x:      sv.get('horizontalScrollOffset'),
      y:      sv.get('verticalScrollOffset')
    };
    
  }.property('frame', 'content').cacheable(),
   
  _sctv_scrollOffsetDidChange: function() {
    this.notifyPropertyChange('clippingFrame');
  },


  // ..........................................................
  // SUBCLASS IMPLEMENTATIONS
  //
  
  
  computeLayout: function() {
    var layout = sc_super(),
        containerView = this.get('containerView'),
        frame = this.get('frame');
        
    var minHeight = layout.minHeight;
    delete layout.minHeight;
        

    // FIXME: In the middle of initialization, the TableView needs to be
    // reloaded in order to become aware of the proper display state of the
    // table rows. This is currently the best heuristic I can find to decide
    // when to do the reload. But the whole thing is a hack and should be
    // fixed as soon as possible.
    // var currentHeight = containerView.get('layout').height;
    // if (currentHeight !== height) {
    //   this.reload();
    // }
    
    containerView.adjust('minHeight', minHeight);
    containerView.layoutDidChange();

    //containerView.adjust('height', height);
    //containerView.layoutDidChange();
    
    this.notifyPropertyChange('clippingFrame');    
    return layout;
  },
  
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  
  _sctv_columnsDidChange: function() {
    // remove observer []
    // add observer [].
    //this._sctv_columnPropertyDidChange(...);
  }.observes('columns'),
  
  _sctv_columnPropertyDidChange: function() {
    var content = this.get('content'),
        del = this.delegateFor('isTableDelegate', this.delegate,
          content);
          
    width = del.tableShouldResizeColumnTo(this, column, width);
  },
    
  _sctv_adjustColumnWidthsOnResize: function() {
    var width   = this.get('frame').width;
    var content = this.get('content'),
        del = this.delegateFor('isTableDelegate', this.delegate, content);
          
    width = del.tableShouldResizeWidthTo(this, width);
    
    var columns = this.get('columns'), totalColumnWidth = 0, idx;
    
    for (idx = 0; idx < columns.length; idx++) {
      totalColumnWidth += columns.objectAt(idx).get('width');
    }
    
    if (width === 0) width = totalColumnWidth;
    var flexibleColumn = this.get('flexibleColumn') ||
      this.get('columns').objectAt(this.get('columns').length - 1);
    var flexibleWidth = flexibleColumn.get('width') +
     (width - totalColumnWidth);
     
    flexibleColumn.set('width', flexibleWidth);    
  }.observes('frame'),
    
  _sctv_setupHeaderRow: function() {
    if (!this.get('hasTableHead')) return;
    var columns = this.get('columns'),
        tableHeadView = this.get('tableHeadView');    
    if (!tableHeadView) {
      tableHeadView = this.get('exampleHeadView').create({
        tableView: this,
        columns:   columns
      });
      this.set('tableHeadView', tableHeadView);
    }
  },
  
  _sctv_sortedColumnDidChange: function() {
    var columns = this.get('columns'),
        sortedColumn = this.get('sortedColumn'),
        column, idx;
    
    for (idx = 0; idx < columns.get('length'); idx++) {
      column = columns.objectAt(idx);
      if (column !== sortedColumn) {
        column.set('sortState', null);
      }
    }
    
    this.invokeOnce('_sctv_sortContent');
  }.observes('sortedColumn'),
    
  _sctv_sortContent: function() {
    var content = this.get('content'), store = content.get('store'), newContent;
    
    var q = this._sctv_queryForCurrentState();
    
    newContent = store.findAll(this.get('recordType')).findAll(q);
    
    this.set('content', newContent);
    this.updateLayerIfNeeded();
  },
  
  _sctv_queryForCurrentState: function() {
    var obj = {}, sortedColumn = this.get('sortedColumn');
    
    obj.recordType = this.get('recordType');
    
    if (sortedColumn && sortedColumn.get('sortState')) {
      obj.orderBy = "%@ %@".fmt(
        sortedColumn.get('key'),
        sortedColumn.get('sortState') === SC.SORT_ASCENDING ? "ASC" : "DESC"
      );
    }
    
    var columns = this.get('columns'), columnKeys = [], idx;
    var filterKey = this.get('filterKey');    
    if (filterKey !== null && filterKey !== "") {
      var re = new RegExp(filterKey, 'ig');
      for (idx = 0; idx < columns.get('length'); idx++) {
        columnKeys.push("(%@ MATCHES {regexp})".fmt(columns.objectAt(idx).get('key')));
      }
      obj.conditions = columnKeys.join(' OR ');
      obj.parameters = { regexp: re };
    }
    
    return SC.Query.create(obj);
  },
  
  _sctv_filterKeyDidChange: function() {
    this.invokeOnce('_sctv_sortContent');
  }.observes('filterKey')
});
