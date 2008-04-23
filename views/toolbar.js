// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

// A menu is not a view exactly, but you can use it to bundle together 
// buttons and then validate them as a whole.
SC.Toolbar = SC.View.extend({
  
  // override with an array of outlet functions.
  buttons: [],
  
  // to to false an all the buttons will be disabled also.
  isEnabled: true,
  
  init: function() {
    arguments.callee.base.call(this) ;
    var toolbar = this ;
    this.buttons = this.buttons.map(function(button) {
      return button(toolbar) ; // get outlet.
    }) ;
  },
  
  isEnabledObserver: function() {
    var e = this.get('isEnabled') ;
    this.get('buttons').each(function(button) { button.set('isEnabled',e); }) ;
  }.observes('isEnabled')
  
}) ;