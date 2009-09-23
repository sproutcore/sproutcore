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
  escapeHTMLBinding: SC.Binding.oneWay('.column.escapeHTML'),
  formatter: SC.Binding.oneWay('.column.formatter'),
  
  displayValue: function() {
    var value = this.get('content') ;
    
    // 1. apply the formatter
    var formatter = this.get('column').get('formatter');
    if (formatter) {
      var formattedValue = (SC.typeOf(formatter) === SC.T_FUNCTION) ? formatter(value, this) : formatter.fieldValueForObject(value, this) ;
      if (!SC.none(formattedValue)) value = formattedValue ;
    }
    
    // 2. If the returned value is an array, convert items to strings and 
    // join with commas.
    if (SC.typeOf(value) === SC.T_ARRAY) {
      var ary = [];
      for(var idx=0;idx<value.get('length');idx++) {
        var x = value.objectAt(idx) ;
        if (!SC.none(x) && x.toString) x = x.toString() ;
        ary.push(x) ;
      }
      value = ary.join(',') ;
    }
    
    // 3. If value is not a string, convert to string. (handles 0)
    if (!SC.none(value) && value.toString) value = value.toString() ;
    
    // 5. escapeHTML if needed
    if (this.get('escapeHTML')) value = SC.RenderContext.escapeHTML(value);
    
    return value ;
  }.property('content', 'escapeHTML', 'formatter').cacheable(),
  
  render: function(context, firstTime) {
    context.push(this.get('displayValue'));
  },
  
  init: function() {
    var column = this.get('column');
    
    column.addObserver('width',    this, '_sctcv_layoutDidChange');
    column.addObserver('maxWidth', this, '_sctcv_layoutDidChange');
    column.addObserver('minWidth', this, '_sctcv_layoutDidChange');
    
    // debugger;
    // this.bind('escapeHTML', SC.Binding.from('.column.escapeHTML').oneWay());
    // this.bind('formatter', SC.Binding.from('.column.formatter').oneWay());
    
    // column.addObserver('escapeHTML', this, '_sctcv_columnPropChanged');
    // column.addObserver('formatter', this, '_sctcv_columnPropChanged');
  },
  
  // _sctcv_columnPropChanged: function(sender, key, value, rev) {
  //   
  //   var column = this.get('column');
  //   this.set('escapeHTML', column.get('escapeHTML'));
  //   
  // },
  
  _sctcv_layoutDidChange: function(sender, key, value, rev) {
    var pv = this.get('parentView');
    SC.run( function() { pv.layoutChildViews(); });
  }
});
