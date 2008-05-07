// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/button/button') ;

// A filter button sets a filter property to whatever you specifiy.  It 
// also binds to the same property and updates its isSelected state based
// on that.
SC.FilterButtonView = SC.ButtonView.extend({
  
  filterValue: null, // relay to this property.

  filterOn: null, // when this filter toggle on, it will go to this.
  filterOff: null, // when this filter toggles off, it goes to this.
  
  action: function() {
    var val = this.get('filterValue') ;
    val = (val == this.get('filterOn')) ? this.get('filterOff') : this.get('filterOn') ;
    this.set('filterValue',val) ;  
  },
  
  filterValueObserver: function() {
    var sel = this.get('filterValue') == this.get('filterOn') ;
    if (sel != this.get('isSelected')) this.set('isSelected',sel) ;
  }.observes('filterValue')
  
});                                                                              