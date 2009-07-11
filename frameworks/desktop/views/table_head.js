// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/table');
sc_require('views/table_header');

/** @class

  The head of a `SC.TableView`. It's a special row of the table that holds
  the column header cells.
  
  @extends SC.View
  @since SproutCore 1.1
*/
SC.TableHeadView = SC.View.extend({  
/** @scope SC.TableHeadView.prototype */
  
  layout: { height: 18, left: 0, right: 0, top: 0 },

  classNames: ['sc-table-head'],

  cells: [],
  
  acceptsFirstResponder: YES,
  
  init: function() {
    // TODO: Figure out why the `columns` observer doesn't work
    this._scthv_handleChildren();
  },
  
  columns: function() {
    return this.get('parentView').get('columns');
  }.property(),  
  
  renderChildViews: function(context, firstTime) {
    var cells = this.get('cells'), cell, idx;
    for (idx = 0; idx < cells.get('length'); idx++) {
      cell = cells.objectAt(idx);
      context = context.begin(cell.get('tagName'));
      cell.prepareContext(context, firstTime);
      context = context.end();
    }
    return context;
  },
  
  layoutChildViews: function() {
    var cells = this.get('cells'), cell, idx;
    for (idx = 0; idx < cells.get('length'); idx++) {
      cell = cells.objectAt(idx);
      cell.adjust(this._scthv_layoutForHeaderAtColumnIndex(idx));
      cell.updateLayout();
    }
  },

  
  // ..........................................................
  // INTERNAL SUPPORT
  //
  
  _scthv_layoutForHeaderAtColumnIndex: function(index) {
    var columns = this.get('columns'),
        rowHeight = this.get('parentView').get('rowHeight'),
        layout = {},
        left = 0, idx;
        
    for (idx = 0; idx < index; idx++) {
      left += columns.objectAt(idx).get('width');
    }
    
    return {
      left:   left,
      width:  columns.objectAt(index).get('width'),
      height: rowHeight
    };
  },
  
  _scthv_handleChildren: function() {
    this.removeAllChildren();
    var columns = this.get('columns');
    
    var column, key, value, cells = [], cell, idx;
    for (idx = 0; idx < columns.get('length'); idx++) {
      column = columns.objectAt(idx);
      key    = column.get('key');
      value  = column.get('label');
      cell   = this._scthv_createTableHeader(column, value);
      cells.push(cell);
      this.appendChild(cell);
    }
    
    this.set('cells', cells);
  },
  
  _scthv_createTableHeader: function(column, value) {
    var tableView = this.get('parentView');
    var cell = SC.TableHeaderView.create({
      column:  column,
      content: value,
      tableView: tableView
    });
    return cell;
  }
});

