// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('controllers/collection') ;
require('views/button/button') ;

/**

  @class

  A pagination view renders a widget for showing the total number of pages and
  for switching between them.  It includes a forward arrow, back arrow, and
  a popup.
  
  @extends SC.View
*/
SC.PaginationView = SC.View.extend({

  // ......................................
  // PROPERTIES
  
  // Bind these to the controller properties to support pagination.
  pageSize: 0,
  pageCount: 0,
  currentPage: 0,

  // This is the format string used for the page count.  Will be localized.
  currentPageString: "_%@-%@ of %@",
  
  // This is the format string used for the page popup.
  pageOptionString: "_Page %@: %@-%@",

  hasPreviousPage: function() {
    return this.get('currentPage') > 0 ;
  }.property(),
  
  hasNextPage: function() {
    return this.get('currentPage') < this.get('pageCount') ;
  }.property(),
   
  // ......................................
  // STRUCTURE

  // This is the generated element.
  emptyElement: '<div class="pagination">\
    <button class="prev">«</button>\
    <button class="page"></button>\
    <button class="next">»</button>\
  </div>',

  outlets: ['prevButton','nextButton','pageButton'],
  
  prevButton: SC.ButtonView.extend({
    action: function() { this.owner.decrementProperty('currentPage'); },
    isEnabledBinding: "*owner.hasPreviousPage"
  })
  
}) ;

