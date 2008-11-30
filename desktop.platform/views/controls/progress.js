// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('mixins/control');

/**
  @class

  Displays a progress bar.  You can display both a defined and an 
  indeterminate progressbar.  The progress bar itself is designed to be styled
  using CSS classes. with the following structure:
  
  <div class="sc-progress-view"><div class="inner"></div></div>
  
  The outer can form the boundary of the bar while the inner will be adjusted 
  to fit the percentage of the progress.

  @extends SC.View
  @extends SC.Control
  @since SproutCore 1.0
*/
SC.ProgressView = SC.View.extend(SC.Control, {
  
  // ........................................
  // PROPERTIES
  //

  /**
    Bind this to the current value of the progress bar.  Note that by default 
    an empty value will disable the progress bar and a multiple value too make 
    it indeterminate.
  */
  value: 0.50,
  valueBindingDefault: SC.Binding.single().notEmpty(),
  
  
  /**
    The minimum value of the progress.
  */ 
  minimum: 0,
  minimumBindingDefault: SC.Binding.single().notEmpty(),

  /**
    Optionally specify the key used to extract the minimum progress value 
    from the content object.  If this is set to null then the minimum value
    will not be derived from the content object.
    
    @property {String}
  */
  contentMinimumKey: null,
  
  /**
    The maximum value of the progress bar.
  */
  maximum: 1.0,
  maximumBindingDefault: SC.Binding.single().notEmpty(),

  /**
    Optionally specify the key used to extract the maximum progress value 
    from the content object.  If this is set to null then the maximum value
    will not be derived from the content object.
    
    @property {String}
  */
  contentMaximumKey: null,

  /** 
    Set to true if the item in progress is indeterminate.  This may be 
    overridden by the actual value.
    @returns {Boolean} 
  */
  isIndeterminate: NO,
  isIndeterminateBindingDefault: SC.Binding.bool(),

  /**
    Set to YES when the process is currently running.  This will cause the 
    progress bar to animate, especially if it is indeterminate.  
  */
  isRunning: NO,
  isRunningBindingDefault: SC.Binding.bool(),
  
  /**
    Optionally specify the key used to extract the isIndeterminate value 
    from the content object.  If this is set to null then the isIndeterminate 
    value will not be derived from the content object.
    
    @property {String}
  */
  contentIsIndeterminateKey: null,

  // ........................................
  // STRUCTURE
  //
  
  emptyElement: '<%@1><div class="sc-outer-head"></div><div class="sc-inner"><div class="sc-inner-head"></div><div class="sc-inner-tail"></div></div><div class="sc-outer-tail"></div></%@1>',

  styleClass: 'sc-progress-view',
  
  // ........................................
  // INTERNAL SUPPORT
  //

  _backgroundOffset: 0,
  
  // start animating at the end of the init() method.  note that we call this
  // here because we want this to make sure this function is called anytime 
  // the progress view is instantiated.
  init: function() {
    sc_super();
    this.animateProgressBar(); // start animating...  
  },
  
  // start/stop running animation based on isRunning state.
  animateProgressBar: function() {
    if (this.get('isRunning') && this.get('isVisibleInWindow')) {
      this.displayDidChange();
      this.animateProgressBar.invokeLater(this, 1000/60);
    }
  }.observes('isRunning', 'isVisibleInWindow'),
  
  displayProperties: 'value minimum maximum isIndeterminate'.w(),
  
  updateDisplay: function() {
    var ret = sc_super() ;
    
    var isIndeterminate = this.get('isIndeterminate') ;
    var isRunning = this.get('isRunning');
    var isEnabled = this.get('isEnabled');
    
    
    var offset = (isIndeterminate && isRunning) ? (-16+Math.floor(Date.now()/100)%16) : 0;
    
    // compute value for setting the width of the inner progress
    var value ;
    if (!isEnabled) {
      value = "0%" ;
    } else if (isIndeterminate) {
      value = "120%";
    }else {
      var minimum = this.get('minimum') || 0.0 ;
      var maximum = this.get('maximum') || 1.0 ;
      value = this.get('value') || 0.0 ;
      value = (value - minimum) / (maximum - minimum) ; 
      if (value > 1.0) value = 1.0 ;

      if(isNaN(value)) value = 0.0;
      value = (value * 100) + "%" ;
    }
    
    this.$().setClass({
      'sc-indeterminate': isIndeterminate,
      'sc-empty': (value <= 0),
      'sc-complete': (value >= 100)
    }).find('.sc-inner').css('width', value).css('left',offset);
    
    return ret ;
  },
  
  contentPropertyDidChange: function(target, key) {
    var all = key === '*';
    var content = this.get('content');
    var valueKey = this.get('contentValueKey'),
      minimumKey = this.get('contentMinimumKey'),
      maximumKey = this.get('contentMaximumKey'),
      isIndeterminateKey = this.get('contentIsIndeterminateKey');
    var v ;
      
    this.beginPropertyChanges()
      .updatePropertyFromContent('value', key, 'contentValueKey', content)
      .updatePropertyFromContent('minimum', key, 'contentMinimumKey', content)
      .updatePropertyFromContent('maximum', key, 'contentMaximumKey', content)
      .updatePropertyFromContent('isIndeterminate', key, 'contentIsIndeterminateKey', content)
    .endPropertyChanges();
  }  
  
}) ;
