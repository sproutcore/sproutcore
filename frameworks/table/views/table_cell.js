SC.TableCellView = SC.ListItemView.extend({
  classNames: ['sc-table-cell'],
  
  render: function(context,firstTime){
    sc_super();
    context.setClass('sc-list-item-view', NO);
  },
  
  commitEditing: function() {
    var ret = sc_super();
    this.displayDidChange();
    return ret;
  }
});
