// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

// RadioGroupView manages a collection of buttons as a single value.  To 
// use this view, just assign your buttons as outlets. This will use the
// toggleOnValue you have already set.
SC.RadioGroupView = SC.View.extend({
   
   // this is the current value or values of the radio group view.  The
   // items in the radio group will be selected based on this value.
   value: null,
   
   // enable/disable the views in this group view.
   isEnabled: true,

   // PRIVATE METHODS
   init: function() {
     sc_super() ;
     
     // find the list of buttons to update and set them up.
     var loc = this.outlets.length ;
     var ret = [] ;
     var valuePropertyPath = [this,'value'];
     while(--loc >= 0) {
       var key = this.outlets[loc] ;
       var button = this[key] ;
       if (button && (button.toggleOnValue !== undefined)) {
         button.bind('value', valuePropertyPath) ;
         ret.push(button);
       }
     }
     this._radioButtons = ret ;
   },

   // forward changes to the isEnabled property to children.
   _isEnabledObserver: function() {
     var newFlag = this.get('isEnabled') ;
     if (!this.didChangeFor('_isEnabled','isEnabled')) return ;
     if (this._radioButtons) {
       this._radioButtons.invoke('set','isEnabled',newFlag) ;
     }
   }.observes('isEnabled')   
   
}) ; 