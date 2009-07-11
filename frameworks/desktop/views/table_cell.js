// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/table_row');

SC.TableCellView = SC.View.extend({
  
  classNames: ['sc-table-cell'],
  
  column: null,
  
  render: function(context, firstTime) {
    context.push(this.get('content'));
  },
  
  init: function() {
    var column = this.get('column');
    column.addObserver('width',    this, '_sctcv_layoutDidChange');
    column.addObserver('maxWidth', this, '_sctcv_layoutDidChange');
    column.addObserver('minWidth', this, '_sctcv_layoutDidChange');
  },
  
  _sctcv_layoutDidChange: function(sender, key, value, rev) {
    var pv = this.get('parentView');
    SC.run( function() { pv.layoutChildViews(); });
  }
});
