// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

/**
  @class

  ProgressView displays a progress bar.  It does this mostly through CSS 
  classes so that you can style them however you want.  A progress bar must 
  have the following structure:

  <div class="outer progress"><div class="inner"></div></div>

  The outer can form the boundary of the bar while the inner will be adjusted 
  to fit the percentage of the progress.

  Style the progress bar with the following CSS classes:

  .progress.indeterminate = to show an indeterminate progress. inner will 
      be set to fill 100%
  .progress.disabled = show as disabled. 

  @extends SC.View
*/
SC.ProgressView = SC.View.extend({
  
  // ........................................
  // PROPERTIES
  //
  
  /**
    The minimum value of the progress.
  */ 
  minimum: 0,

  /**
    The maximum value of the progress bar.
  */
  maximum: 1.0,

  /**
    Bind this to the current value of the progress bar.  Note that by default an
    empty value will disable the progress bar and a multiple value too make it
    indeterminate.
  */
  value: 0.50,
  valueBindingDefault: SC.Binding.SingleNotEmpty,
  
  /** 
    Set to true if the item in progress is indeterminate.  This may be overridden
    by the actual value.
    @returns {Boolean} 
  */
  isIndeterminate: function(key,value) {
    if (value !== undefined) {
      this._isIndeterminate = value ;
    }
    return this._isIndeterminate && (this.value != SC.Binding.EMPTY_PLACEHOLDER) ;
  }.property(),
  
  /**
   Set to false to disable the progress bar.
   @returns {Boolean}
  */
  isEnabled: function(key, value) {
    if (value !== undefined) {
      this._isEnabled = value ;
    }
    return this._isEnabled && (this.value != SC.Binding.MULTIPLE_PLACEHOLDER) ;
  }.property(),
  
  _isIndeterminate: false, _isEnabled: true,
  
  // ........................................
  // STRUCTURE
  //
  
  emptyElement: '<div class="progress outer"><div class="outer-head"></div><div class="inner"><div class="inner-head"></div><div class="inner-tail"></div></div><div class="outer-tail"></div></div>',
  
  outlets: ['innerView'],
  innerView: SC.View.outletFor('.inner?'),
  
  // ........................................
  // INTERNAL SUPPORT
  //
  
  propertyObserver: function(observing,target,key,value) {    
    // collect new settings.
    if (['value','minimum','maximum','isIndeterminate','isEnabled'].include(key)) {
      var isIndeterminate = this.get('isIndeterminate') ;
      var isEnabled = this.get('isEnabled') ;
      
      this.setClassName('indeterminate',isIndeterminate);
      this.setClassName('disabled',!isEnabled);
      
      // compute value for setting the width of the inner progress
      var value ;
      if (!isEnabled) {
        value = 0.0 ;
      } else if (isIndeterminate) {
        value = 1.0;
      }else {
        var minimum = this.get('minimum') || 0.0 ;
        var maximum = this.get('maximum') || 1.0 ;
        value = this.get('value') || 0.0 ;
        value = (value - minimum) / (maximum - minimum) ; 
        if (value > 1.0) value = 1.0 ;
      }
      if(isNaN(value))
        value = 0.0;
      value = value * 100 ;
      if (this.innerView) this.innerView.setStyle({ width: (value + '%') }) ;
    }
  }
}) ;







