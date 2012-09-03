// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
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
  
      progressView: SC.ProgressView.design({
        value: 50, 
        minimum: 0, 
        maximum: 100,
        isIndeterminate: NO,
        isEnabled: YES
      })
  
  @extends SC.View
  @extends SC.Control
  @since SproutCore 1.0
*/
SC.ProgressView = SC.View.extend(SC.Control,
/** @scope SC.ProgressView.prototype */{
  
  /**
    @type Array
    @default ['sc-progress-view']
    @see SC.View#classNames
  */
  classNames: ['sc-progress-view'],
  
  /**
    @type Array
    @default 'displayValue ariaValue minimum maximum isRunning isEnabled isIndeterminate animatedBackgroundMatrix offsetRange'.w()
    @see SC.View#displayProperties
  */
  displayProperties: ['displayValue', 'ariaValue', 'minimum', 'maximum', 'isRunning', 'isEnabled', 'isIndeterminate', 'animatedBackgroundMatrix', 'offsetRange'],

  /**
    @type String
    @default 'progressRenderDelegate'
  */
  renderDelegateName: 'progressRenderDelegate',

  // ........................................
  // PROPERTIES
  //

  /**
    Bind this to the current value of the progress bar.  Note that by default 
    an empty value will disable the progress bar and a multiple value will make 
    it indeterminate.
    
    @type Number
    @default 0.50
  */
  value: 0.50,

  /** @private */
  valueBindingDefault: SC.Binding.single().notEmpty(),
  
  /**
    @field
    @type Number
    @observes value
    @observes maximum
    @observes minimum
  */
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
  }.property('value', 'maximum', 'minimum').cacheable(),

  /**
    The WAI-ARIA role for progress view.

    @type String
    @default 'progressbar'
    @readOnly
  */
  ariaRole: 'progressbar',

  /**
    The WAI-ARIA value for the progress view. This value will be passed to any
    rendering code as-is, not converted into percentages, etc. It is computed
    based on the original value property.

    @property
  */
  ariaValue: function() {
    return this.get('value');
  }.property('value').cacheable(),
  
  /**
    The minimum value of the progress.
    
    @type Number
    @default 0
  */ 
  minimum: 0,
  
  /** @private */
  minimumBindingDefault: SC.Binding.single().notEmpty(),

  /**
    Optionally specify the key used to extract the minimum progress value 
    from the content object.  If this is set to null then the minimum value
    will not be derived from the content object.
    
    @type String
    @default null
  */
  contentMinimumKey: null,
  
  /**
    The maximum value of the progress bar.
    
    @type Number
    @default 1.0
  */
  maximum: 1.0,
  
  /** @private */
  maximumBindingDefault: SC.Binding.single().notEmpty(),

  /**
    Deprecated. This is a render setting, and as such, should be adjusted in
    the theme. Investigate your theme's progressRenderDelegate.
    
    @deprecated This should now be changed in themes.
    @type Integer
  */
  offsetRange: undefined,

  /**
    Optionally specify the key used to extract the maximum progress value 
    from the content object.  If this is set to null then the maximum value
    will not be derived from the content object.
    
    @type String
    @default null
  */
  contentMaximumKey: null,

  /** 
    Set to true if the item in progress is indeterminate.  This may be 
    overridden by the actual value.
    
    @type Boolean
    @default NO
  */
  isIndeterminate: NO,
  
  /** @private */
  isIndeterminateBindingDefault: SC.Binding.bool(),

  /**
    Set to YES when the process is currently running.  This will cause the 
    progress bar to animate, especially if it is indeterminate.
    
    @type Boolean
    @default NO
  */
  isRunning: NO,
  
  /** @private */
  isRunningBindingDefault: SC.Binding.bool(),

  /** 
    Set to the matrix used for background image position for animation.
    [1st image y-location, offset, total number of images]
    
    @type Array
    @default null
  */
  animatedBackgroundMatrix: [],
  
  /**
    Optionally specify the key used to extract the isIndeterminate value 
    from the content object.  If this is set to null then the isIndeterminate 
    value will not be derived from the content object.
    
    @type String
    @default null
  */
  contentIsIndeterminateKey: null,

  
  // ........................................
  // INTERNAL SUPPORT
  //

  /** @private */
  _backgroundOffset: 0,
  
  /** @private */
  _currentBackground: 1,
  
  /** @private */
  _nextBackground: 1,

  /** @private */
  init: function() {
    sc_super();
    this.animateProgressBar();
  },
  
  /** @private */
  animateProgressBar: function() {
    if (this.get('isRunning') && this.get('isVisibleInWindow')) {
      this._animateProgressBar(300); // wait to start to avoid probs
    }
  }.observes('isRunning', 'isVisibleInWindow'),

  /** @private */
  _animateProgressBar: function(delay) {
    if (delay===0) delay = 1000/30;
    if (this.get('isRunning') && this.get('isVisibleInWindow')) {
      this.displayDidChange();
      this.invokeLater(this._animateProgressBar, delay, 300);
    }
  },

  /** @private */
  contentPropertyDidChange: function(target, key) {
    var content = this.get('content');
    this.beginPropertyChanges()
      .updatePropertyFromContent('value', key, 'contentValueKey', content)
      .updatePropertyFromContent('minimum', key, 'contentMinimumKey', content)
      .updatePropertyFromContent('maximum', key, 'contentMaximumKey', content)
      .updatePropertyFromContent('isIndeterminate', key, 'contentIsIndeterminateKey', content)
    .endPropertyChanges();
  }

});
