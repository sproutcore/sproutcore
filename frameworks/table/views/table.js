// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple, Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/table_header');
sc_require('views/table_cell');


SC.TableView = SC.View.extend({
  
  classNames: ['sc-table-view'],
  
  horizontalScrollOffset: 0,

  /**
    The content object the table view will display. Usually an SC.ArrayController's content
    
    @type SC.Array
  */
  content: null,
  
  /**
    The height of each row in the TableView
    
    @property {Number}
  */
  rowHeight:22,
  
  selection:null,
  
  target:null,
  action:null,
  
  /**
    IF YES, a table header will be rendered. Note that if a table header is not rendered, 
    there will be no way to resize columns, reorder rows or sort from the TableView UI.
    
    @property {Boolean}
  */
  useHeaders: YES,
  
  /**
    The height of the header row
    
    @property {Number}
  */
  headerHeight:38,
  
  /**
    If set to NO the horizontal scroller will be suppressed.
    
    @property {Boolean}
  */
  hasHorizontalScroller:YES,
  
  /**
    An example view that will be used to render cells in the table
    
    @property {SC.View}
  */
  exampleView: SC.ListItemView,
  
  /**
    An example ScrollView that will be used to paint the scrollpane of the tableView. 
    This is useful if your app has custom scrollbars.
    
    @property {SC.ScrollView}
  */
  exampleScrollView: SC.ScrollView,
  
  /**
    An example ListView that will be used to paint the foldered list view of the tableView.
    This is useful to add customization to your listview.
    
    @property {SC.ListView}
  */
  exampleFolderedListView: null,
  
  /**
    Use this method to swap out a column on the columns collection.
    
    @property {SC.TableColumn} column The column object that should be added to the collection.
    @property {Number} idx The index of the column to be replaced.
  */
  replaceColumn: function(column, idx){
    var columns=this.get('columns').copy();
        
    if (idx>=columns.length){
      return;
    }
    
    columns[idx]=column;
    this.set('columns',columns);
    columns=null;
  },
  
  isEditable: YES,
  canEditContent: YES,
  
  /**
     Equivalent of the orderBy property of an SC.ArrayController. It is actually bound to the content orderBy property

     @private
   */
  sortDescriptor: null,
  sortDescriptorBinding: '*content.orderBy',
  
  createChildViews: function() {
    
    var childViews = [], childView=null;
    
     this._tableHeaderView = childView = this.createChildView(SC.ScrollView.design({
      
      isVisibleBinding: SC.Binding.from('.useHeaders', this),
      
      headerHeightBinding: SC.Binding.from('.headerHeight',this),
      headerHeightDidChange: function(){
        var height = this.get('headerHeight'),
            layout = this.get('layout');
        if (height && height!==layout.height){
          layout.height=height;
        }
      }.observes('headerHeight'),

      layout: {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        height: this.get('headerHeight')
      },
      
      hasHorizontalScroller: NO,
      canScrollHorizontal: function() {
        return YES;
      }.property().cacheable(),
      horizontalScrollOffsetBinding: SC.Binding.from('.horizontalScrollOffset',this),
      
      borderStyle: SC.BORDER_NONE,
      contentView: SC.TableHeaderView.extend({
        layout:{top:0,left:0,right:0,bottom:0},
        table: this,
        columnsBinding: SC.Binding.from('.columns',this).oneWay(),
        sortDescriptorBinding: SC.Binding.from('.sortDescriptor',this)
       })
    }));
    
    childViews.push(childView);
    
    if (this.get('exampleFolderedListView'))
    {
      
      this._dataView = childView = this.createChildView(this.get('exampleScrollView').design({
        autohidesVerticalScroller: NO,
        layout: { left: 6, right: 0, top: this.get('headerHeight'), bottom: 0 },
        verticalScrollOffset:0,
        hasHorizontalScrollerBinding: SC.Binding.from('hasHorizontalScroller', this),
        contentView: this.get('exampleFolderedListView').design({
          layout:{top:0,left:0,right:0,bottom:0},
          exampleView: this.get('exampleView'),
          keys: [],
          columnWidths: [],
          rowHeight: this.get('rowHeight'),
          table: this,
          contentBinding: SC.Binding.from('.content.arrangedObjects',this),
          selectionBinding: SC.Binding.from('.selection',this),
          targetBinding: SC.Binding.from('.target',this),
          actionBinding: SC.Binding.from('.action',this),
          contentValueKey: 'name',
          hasContentIcon: this.get('hasContentIcon'),
          contentIconKey: 'icon',
          newTargetBinding: SC.Binding.from('.delegate',this),
          newActionBinding: SC.Binding.from('.newAction',this),
          canReorderContent: YES,
          canEditContent: this.get('canEditContent'),
          canDeleteContent: this.get('canDeleteContent'),
          allowDeselectAll: this.get('allowDeselectAll'),
          delegate: this.get('delegate'),
          beginEditingSelectionBinding: this.get('beginEditingSelectionPath') || SC.binding('.beginEditingSelection',this.get('delegate')),
          folderedListViewDelegate: this.get('delegate'),
          isDropTarget: YES,
          allowActionOnFolder: this.get('allowActionOnFolder'),
          needsContextMenuBinding: SC.Binding.from('.needsContextMenu',this)
        })
      }));
    }
    
    else
    {
      this._dataView = childView = this.createChildView(this.get('exampleScrollView').design({
        isVisible: YES,
        layout: {
          left:   0,
          right:  0,
          bottom: 0,
          top:    this.get('useHeaders')?this.get('headerHeight'):0
        },
        hasHorizontalScrollerBinding: SC.Binding.from('hasHorizontalScroller', this),
        borderStyle: SC.BORDER_NONE,
        contentView: SC.DataView.design({

          classNames: ['sc-table-data-view'],

          table: this,

          rowHeight: this.get('rowHeight'),

          isEditableBinding: SC.Binding.from('.isEditable',this),
          canEditContentBinding: SC.Binding.from('.canEditContent',this),

          targetBinding: SC.Binding.from('.target',this),
          actionBinding: SC.Binding.from('.action',this),
          
          canReorderContentBinding: SC.Binding.from('.canReorderContent',this),

          selectionBinding: SC.Binding.from('.selection',this),

          sortDescriptorBinding: SC.Binding.from('.sortDescriptor',this),
          columnsBinding: SC.Binding.from('.columns',this).oneWay(),
          contentBinding: SC.Binding.from('.content',this),

          exampleView: this.get('exampleView')
        }),


        autohidesVerticalScroller: NO,
        horizontalScrollOffsetBinding: SC.Binding.from('.horizontalScrollOffset',this)
      }));
    }
    
    childViews.push(childView);
    
    this.set('childViews',childViews);
    
    if (this.get('exampleFolderedListView')){
      this._sctv_updateFolderedListViewProperties();
    }
    
    if(!this.columnsBinding)
    {
      this.notifyPropertyChange('columns');
    }
  },

  /** @private */
  _sctv_contentDidChange: function() {
    this._dataView.get('contentView').reload(null);
  }.observes('*content.[]'),
  
  /** @private */
  _sctv_columnsDidChange: function() {
    var columns = this.get('columns');
    if(SC.none(columns) || columns.get('length') < 1 || columns === this._columns)
    {
      return this;
    }
      
    var observer = this._sctv_columnsRangeObserver;
    var func = this._sctv_columnsRangeDidChange;
      
    if(this._columns)
    {
      this._columns.removeRangeObserver(observer);
    }

    observer = columns.addRangeObserver(SC.IndexSet.create(0,columns.length), this, func, null);      
    this._sctv_columnsRangeObserver = observer ;

    this._sctv_resetRules();
    this._columns = columns;
    
    this._dataView.get('contentView').computeLayout();
    
    if (this.get('exampleFolderedListView')){
      this._sctv_updateFolderedListViewProperties();
    }
    
  }.observes('columns'),
  
  /**
     Called when order or size of columns changes

     @private
   */
  _sctv_resetRules: function() {
    this._offsets = [];
    this._widths = [];
    
    var columns = this.get('columns'),
      stylesheet = this._stylesheet,
      left = 6,
      offsets = this._offsets,
      widths = this._widths,
      width;
    
    if(stylesheet)
    {
      stylesheet.destroy();
    }
      
    stylesheet = this._stylesheet = SC.CSSStyleSheet.create();

    columns.forEach(function(column, i) {
      offsets[i] = left;
      stylesheet.insertRule(this._sctv_ruleForColumn(i), i);
      left += widths[i] + 1;
    }, this);
    
    this._dataView.get('contentView').set('calculatedWidth', left);
  },
  
  /**
     Generates a CSS class for the given column

     @private
   */
  _sctv_ruleForColumn: function(column) {
    var columns = this.get('columns'),
      col = columns.objectAt(column),
      width;
      if (!col.get('isFlexible')){
        width = col.get('width') - 1;
        this._widths[column] = width ;
        return ['#'+this.get('layerId')+' div.column-' + column + ' {',
            'width: ' + width + 'px !important;',
            'left: ' + this._offsets[column] + 'px !important;',
          '}'].join("");
      }
      else
      {
        var totalWidth = this.$().width();
        width = totalWidth-this._offsets[column]-2;
        for (var i=column+1;i<columns.length;i++){
          width-=columns.objectAt(i).get('width');
        }
        
        if (width<=0)
        {
           width = col.get('width') - 1;
        }
        this._widths[column] = width ;
        col.set('width', width+4);
        return ['#'+this.get('layerId')+' div.column-' + column + ' {',
            'width: ' + width + 'px !important;',
            'left: ' + this._offsets[column] + 'px !important;',
          '}'].join("");
      }
  },
  
  /** @private */
  _sctv_columnsRangeDidChange: function(columns, object, key, indexes) {
    if(this._ghost)
    {
      return;
    }
      
    columns = this.get('columns');
    
    var  len = columns.get('length');

    if(indexes !== 0)
    {
      indexes = indexes.firstObject();
    }
    
    var diff = columns.objectAt(indexes).get('width') - this._widths[indexes] - 1;
    var css = this._stylesheet;
    
    if (this.get('exampleFolderedListView')){
      this._sctv_updateFolderedListViewProperties();
    }
    
    if(Math.abs(diff) > 0) {
      for(var i = indexes; i < len; i++) {
        css.deleteRule(i);
        if(i > indexes)
        {
          this._offsets[i] += diff;
        }
        css.insertRule(this._sctv_ruleForColumn(i), i);
      }
      
      this._dataView.get('contentView').calculatedWidth += diff;
      this._dataView.get('contentView').adjust(this._dataView.get('contentView').computeLayout());
    }
    
  },
  
  /**
    Changes the sort descriptor based on the column that is passed and the current sort state
  
    @param {SC.TableColumn} column The column to sort by
    @param {String} sortState The desired sort state (ASC|DESC)
  */
  sortByColumn: function(column, sortState) {
    if(sortState !== "ASC")
    {
      sortState = "ASC";
    }
    else
    {
      sortState = "DESC";
    }
    this.set('sortDescriptor', sortState + " " + column.get('key'));
  },
  
  // reordering
  
  /**
    Returns a ghost view for a given column 
    
    @param {SC.TableColumn} column The column to return the ghost view for.
  */
  ghostForColumn: function(column) {
    var columns = this.get('columns'),
      idx = columns.indexOf(column),
      el = this._dataView.get('contentView').ghostForColumn(idx);
      
    this._ghostLeft = this._tableHeaderView.get('contentView').offsetForView(idx) + 1;
    this._ghost = el;
    el.style.left='%@px'.fmt(this._ghostLeft);
    el.style.top='%@px'.fmt(this.get('headerHeight'));
    this.get('layer').appendChild(el);
    
  },

  /**
    Called by the TableHeaderView when a column is being dragged
    
    @param {SC.TableColumn} column the column being dragged
  */
  draggingColumn: function(column) {
    this.$().addClass('reordering-columns');
    this.ghostForColumn(column);
    this._dragging = column;
  },
  
  /** 
    Called by the TableHeaderView when a column is being dragged. Adjusts the offset of the ghost
    
    @param {Number} offset The offset by which the column has been dragged
  */
  columnDragged: function(offset) {
    this._ghostLeft += offset;
    SC.$(this._ghost).css('left', this._ghostLeft + "px !important");
  },
  
  /** 
    Called by the TableHeaderView when a column has stopped dragging.
   */
  endColumnDrag: function() {
    this.$().removeClass('reordering-columns');
    if (!SC.none(this._ghost))
    {
      this.get('layer').removeChild(this._ghost);
    }
    this._ghost = this._blocker = null;
    this._ghostLeft = null;
    this._sctv_resetRules();
    if (this.get('exampleFolderedListView')){
      this._sctv_updateFolderedListViewProperties();
    }
    this._dataView.get('contentView').reload(null);
  },
  
  /** @private */
  _sctv_updateFolderedListViewProperties: function () {
   var dataView = this._dataView.get('contentView');
   if (dataView && dataView.set){
     var columns = this.get('columns'),
         columnKeys = [], columnWidths = [];
         
     for (var i=0;i<columns.length;i++){
       columnKeys.push(columns[i].get('key'));
       columnWidths.push(columns[i].get('width'));
     }
     dataView.set('keys',columnKeys);
     dataView.set('columnWidths',columnWidths);
   }

  }

});
