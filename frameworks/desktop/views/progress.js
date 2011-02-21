// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  Displays a progress bar.  You can display both a defined and an 
  indeterminate progressbar.  The progress bar itself is designed to be styled
  using CSS classes with the following structure:
  
  <div class="sc-progress-view"><div class="inner"></div></div>
  
  The outer can form the boundary of the bar while the inner will be adjusted 
  to fit the percentage of the progress.
  
  Creating a ProgressView accepts a number of properties, for example:
  {
    value: 50, 
    minimum: 0, 
    maximum: 100,
    isIndeterminate: NO,
    isEnabled: YES
  }
  
  Default isEnabled value is YES.

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
    an empty value will disable the progress bar and a multiple value will make 
    it indeterminate.
  */
  value: 0.50,

  /**
    The WAI-ARIA role for progress view. This property's value should not be
    changed.

    @property {String}
  */
  ariaRole: 'progressbar',

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
    Deprecated. This is a render setting, and as such, should be adjusted in
    the theme. Investigate your theme's progressRenderDelegate.
    
    @deprecated This should now be changed in themes.
    @type Integer
    @deprecated
  */
  offsetRange: undefined,

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
    Set to the matrix used for background image position for animation.
    [1st image y-location, offset, total number of images]
    @property {Array}
  */
  animatedBackgroundMatrix: undefined,
  
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

  classNames: 'sc-progress-view',
  
  // ........................................
  // INTERNAL SUPPORT
  //

  _backgroundOffset: 0,
  _currentBackground: 1,
  _nextBackground: 1,
  
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
      this._animateProgressBar(500); // wait to start to avoid probs
    }
  }.observes('isRunning', 'isVisibleInWindow'),

  _animateProgressBar: function(delay) {  
    if (delay===0) delay = 1000/30;
    if (this.get('isRunning') && this.get('isVisibleInWindow')) {
      this.displayDidChange();
      this.invokeLater(this._animateProgressBar, delay, 600);
    }
  },
  
  displayProperties: 'displayValue minimum maximum isRunning isEnabled isIndeterminate animatedBackgroundMatrix offsetRange'.w(),
  
  renderDelegateName: 'progressRenderDelegate',
  
  contentPropertyDidChange: function(target, key) {
    var content = this.get('content');
    this.beginPropertyChanges()
      .updatePropertyFromContent('value', key, 'contentValueKey', content)
      .updatePropertyFromContent('minimum', key, 'contentMinimumKey', content)
      .updatePropertyFromContent('maximum', key, 'contentMaximumKey', content)
      .updatePropertyFromContent('isIndeterminate', key, 'contentIsIndeterminateKey', content)
    .endPropertyChanges();
  },
  
  displayValue: function(){
    var minimum = this.get('minimum') || 0.0,
        maximum = this.get('maximum') || 1.0,
        value = this.get('value') || 0.0;
    value = (value - minimum) / (maximum - minimum);
    if (value > 1.0) value = 1.0;

    if(isNaN(value)) value = 0.0;
    // cannot be smaller then minimum
    if(value<minimum) value = 0.0;
    // cannot be larger then maximum
    if(value>maximum) value = 1.0;
    
    return value;
  }.property('value', 'maximum', 'minimum').cacheable()

  
}) ;
