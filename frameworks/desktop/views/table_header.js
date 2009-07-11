// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/table');

/** @class
  The views that make up the column header cells in a typical `SC.TableView`.

  @extends SC.View
  @since SproutCore 1.1
*/
SC.TableHeaderView = SC.View.extend({
  
  classNames: ['sc-table-header'],
  
  displayProperties: ['sortState'],
  
  acceptsFirstResponder: YES,

  /**
    The SC.TableColumn object this header cell is bound to.
  */
  column:  null,
  
  render: function(context, firstTime) {
    var column = this.get('column'), icon = column.get('icon'), html;
    if (icon) {
      html = '<img src="%@" class="icon" />'.fmt(icon);
      context.push(html);
    } else {
      context.push(this.get('content'));    
    }
  },
    
  init: function() {
    var column = this.get('column');
    column.addObserver('width',     this, '_scthv_layoutDidChange');
    column.addObserver('maxWidth',  this, '_scthv_layoutDidChange');
    column.addObserver('minWidth',  this, '_scthv_layoutDidChange');
    
    column.addObserver('sortState', this, '_scthv_sortStateDidChange');
    return sc_super();
  },
  
  /**
    The sortState of the header view's column.
  */
  sortState: function() {
    return this.get('column').get('sortState');
  }.property(),
  
  mouseDown: function(evt) {
    sc_super();
    return YES;
  },
  
  mouseUp: function(evt) {
    // Change the sort state of the associated column.
    var tableView = this.get('tableView');
    tableView.set('sortedColumn', this.get('column'));

    var column = this.get('column'), sortState = column.get('sortState');
    var newSortState = sortState === SC.SORT_ASCENDING ?
     SC.SORT_DESCENDING : SC.SORT_ASCENDING;
     
    column.set('sortState', newSortState);
  },
  
  _scthv_layoutDidChange: function(sender, key, value, rev) {
    var pv = this.get('parentView');
    pv.invokeOnce(pv.layoutChildViews);
  },
  
  _scthv_sortStateDidChange: function() {
    SC.RunLoop.begin();
    var sortState  = this.get('column').get('sortState');
    var classNames = this.get('classNames');
    
    classNames.removeObject('sc-table-header-sort-asc');
    classNames.removeObject('sc-table-header-sort-desc');
    classNames.removeObject('sc-table-header-sort-active');
    
    if (sortState !== null) {
      classNames.push('sc-table-header-sort-active');
    }
    
    if (sortState === SC.SORT_ASCENDING) {
      classNames.push('sc-table-header-sort-asc');
    }
    
    if (sortState === SC.SORT_DESCENDING) {
      classNames.push('sc-table-header-sort-desc');
    }
    
    // TODO: Figure out why it's not enough to simply call
    // `displayDidChange` here.
    this.displayDidChange();
    this.invokeOnce('updateLayer');
    SC.RunLoop.end();
  }
});