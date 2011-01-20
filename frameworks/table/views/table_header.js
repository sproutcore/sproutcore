// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple, Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/table_header_cell');
SC.TableHeaderView = SC.View.extend(SC.SimpleLayout, {
  
  /** @private */
  classNames: ['sc-table-header'],
  
  /** @private */
  thicknessPath: 'column.width',
  
  /** @private */
  startOffset: 1,
  
  /** @private */
  offsetDelta: -1,
  
  /** @private */
  widthDelta: 1,
  
  /** @private */
  columnsDidChange: function() {
    var columns = this.get('columns');
    if (SC.none(columns) || columns === this._columns) return this; // nothing to do
    this.set('childViews',[]);
    this.set('thicknesses', columns);
    var childViews = columns.map(function(column, idx) {
      return this.createChildView(SC.TableHeaderCellView.extend({
        column: column,
        delegate: this,
        first: idx===0,
        calculatedWidth: column.get('width')
      }));
    }, this);
    
    this.beginPropertyChanges();
    this.destroyLayer().removeAllChildren();
    this.set('childViews', childViews); // quick swap
    this.replaceLayer();
    this.updateLayout();
    this.endPropertyChanges();
  }.observes('columns'),
  
  
  /** @private */
  handleViewPosition: function(v) {
    if(this._dragging === v)
    {
      return NO;
    }
      
    return YES;
  },
  
  
  
  // drag to reorder
  /** @private */
  headerDidBeginDrag: function(view, offset, evt) {
    this._dragging = view;
    this.get('table').draggingColumn(view.get('column'));
    SC.$(view).addClass('dragging');
  },
  
  /** @private */
  headerWasDragged: function(view, offset, evt) {
    this.adjustDrag(view, offset);
    this.get('table').columnDragged(offset);
  },

  /** @private */
  headerDidEndDrag: function(view, evt) {
    this.get('table').endColumnDrag();
    this._dragging = null;
    this._sl_layoutChildViews();
    SC.$(view).removeClass('dragging');
  },
  
  /** @private */
  thumbWasDragged: function(view, offset, evt){
    this._sl_layoutChildViews();
  },
  
  /** @private */
  adjustDrag: function(view, offset) {
    var direction = this.get('layoutDirection');
    var frame = view.get('frame');
    var put = (direction === SC.LAYOUT_HORIZONTAL ? frame['x'] : frame['y']) + offset;
    view.adjust((direction === SC.LAYOUT_HORIZONTAL ? 'left' : 'top') , put);
    
    this.set('_draggingOffset', put);
    
    var childViews = this.get('childViews');
    var idx = childViews.indexOf(view);
    var view2;

    if(offset < 1 && idx > 0)
    {
      var idx2 = idx - 1;
    }
    else 
    {
      if(offset > 1 && idx < childViews.get('length') - 1)
      {
        var idx2 = idx + 1;
      }
    }

    view2 = childViews.objectAt(idx2);
    if(!view2 || view2.spacer)
    {
      return;
    }
      
    var centerPoint = this.offsetForView(idx2, view2) + (this.thicknessForView(idx2, view2) / 2);
    
    if(offset < 1 && (view.get('frame').x > centerPoint))
    {
      return;
    }
    else 
    {
      if(offset > 1 && (view.get('frame').x + view.get('frame').width < centerPoint))
      {
        return;
      }
    }
    
    this.swapViews(view, view2);
  },
  
  /** @private */
  swapViews: function(view1, view2) {
    var childViews = this.get('childViews');
    var columns = this.get('columns');

    var index1 = childViews.indexOf(view1);
    var index2 = childViews.indexOf(view2);
    var column1 = columns.objectAt(index1);
    var column2 = columns.objectAt(index2);

    childViews.beginPropertyChanges();
    childViews.replace(index1, 1, view2);
    childViews.replace(index2, 1, view1);
    childViews.endPropertyChanges();

    columns.beginPropertyChanges();
    columns.replace(index1, 1, column2);
    columns.replace(index2, 1, column1);
    columns.endPropertyChanges();
  }
});