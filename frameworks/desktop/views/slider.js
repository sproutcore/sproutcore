// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  A SliderView shows a horizontal slider control that you can use to set 
  variable values.

  You can use a slider view much like you would any other control.  Simply
  set the value or content/contentValueKey to whatever value you want to 
  display.  You can also set the maximumValue and minValue properties to 
  determine the mapping of the control to its children.
  
  @extends SC.View
  @extends SC.Control
  @since SproutCore 1.0
  @test in progress
*/
SC.SliderView = SC.View.extend(SC.Control,
/** @scope SC.SliderView.prototype */ {
  
  classNames: 'sc-slider-view',
  
  /** 
    The DOM element that displays the handle.  This element will have its
    top-left corner updated to reflect the current state of the slider.  Use
    margin-offsets to properly position your handle over this location.
  */
  handleSelector: 'img.sc-handle',
  
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
    Optionally set to the minimum step size allowed.
    
    All values will be rounded to this step size when displayed.
  */
  step: 0.1,

  // ..........................................................
  // INTERNAL PROPERTIES
  // 
  
  displayProperties: 'value minimum maximum'.w(),
  
  render: function(context, firstTime) {
    sc_super();
    
    var min = this.get('minimum');
    var max = this.get('maximum');
    var value = this.get('value');

    // determine the constrained value.  Must fit within min & max
    value = Math.min(Math.max(value, min), max);

    // limit to step value
    var step = this.get('step');
    if (!SC.none(step) && step !== 0) {
      value = Math.round(value / step) * step;
    }
    
    // determine the percent across
    value = Math.floor((value - min) / (max - min) * 100);
    
    if(firstTime) {
      var blankImage = SC.BLANK_IMAGE_URL;
      context.push('<span class="sc-inner">');
      context.push('<span class="sc-leftcap"></span>');
      context.push('<span class="sc-rightcap"></span>');
      context.push('<img src="', blankImage, '" class="sc-handle" style="left: ', value, '%" />');
      context.push('</span>');
    }
    else {
      this.$(this.get('handleSelector')).css('left', value + "%");
    }
    
  },
  
  _isMouseDown: NO,
  
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES; // nothing to do...
    this.set('isActive', YES);
    this._isMouseDown = YES ;
    return this._triggerHandle(evt);
  },
  
  // mouseDragged uses same technique as mouseDown.
  mouseDragged: function(evt) { 
    return this._isMouseDown ? this._triggerHandle(evt) : YES; 
  },
  
  // remove active class
  mouseUp: function(evt) {
    if (this._isMouseDown) this.set('isActive', NO);
    var ret = this._isMouseDown ? this._triggerHandle(evt) : YES ;
    this._isMouseDown = NO;
    return ret ;
  },
  
  /** @private
    Updates the handle based on the mouse location of the handle in the
    event.
  */
  _triggerHandle: function(evt) {
    var loc = this.convertFrameFromView({ x: evt.pageX }).x ;
    var width = this.get('frame').width ;

    // constrain loc to 8px on either side (left to allow knob overhang)
    loc = Math.max(Math.min(loc,width-8), 8) - 8;
    width -= 16 ; // reduce by margin
    
    // convert to percentage
    loc = loc / width ;
    
    var min = this.get('minimum'),max=this.get('maximum');  
    var step = this.get('step'), v=this.get('value');

    // convert to value using minimum/maximum then constrain to steps
    loc = min + ((max-min)*loc);
    if (step !== 0) loc = Math.round(loc / step) * step ;

    // if changes by more than a rounding amount, set v.
    if (Math.abs(v-loc)>=0.01) this.set('value', loc); // adjust 
    return YES ;
  },
  
  /** tied to the isEnabled state */
  acceptsFirstResponder: function() {
    if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
    else return NO;
  }.property('isEnabled'),
  
  willBecomeKeyResponderFrom: function(keyView) {
    // focus the text field.
    if (!this._isFocused) {
      this._isFocused = YES ;
      this.becomeFirstResponder();
      if (this.get('isVisibleInWindow')) {
        this.$()[0].focus();
      }
    }
  },
  
  willLoseKeyResponderTo: function(responder) {
    if (this._isFocused) this._isFocused = NO ;
  },
  
  keyDown: function(evt) {

     // handle tab key
     if (evt.which === 9) {
       var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
       if(view) view.becomeFirstResponder();
       else evt.allowDefault(); 
       return YES ; // handled
     }
     
     if (evt.which === 37 || evt.which === 38 || evt.which === 39 || evt.which === 40){
       var min = this.get('minimum'),max=this.get('maximum');  
       var step = this.get('step');
       var size = max-min, val=0, calculateStep;
     
       if (evt.which === 37 || evt.which === 38 ){
         if(step === 0){
           if(size<100){
             val = this.get('value')-1;
           }else{
             calculateStep = Math.abs(size/100);
             if(calculateStep<2) calculateStep =2;
             val = this.get('value')-Math.abs(size/100);
           }
         }else{
           val = this.get('value')-step;
         }
       }
       if (evt.which === 39 || evt.which === 40 ){
           if(step === 0){
              if(size<100){
                val = this.get('value') + 2;
              }else{
                calculateStep = Math.abs(size/100);
                if(calculateStep<2) calculateStep =2;
                val = this.get('value')+calculateStep;
              }
            }else{
              val = this.get('value')+step;
            }       
       }
       if(val>=min && val<=max) this.set('value', val);
     }
     //handle arrows

     // validate keyDown...
     // if (this.performValidateKeyDown(evt)) {
     //    this._isKeyDown = YES ;
     //    evt.allowDefault(); 
     //  } else {
     //    evt.stop();
     //  }
     SC.RunLoop.begin().end();
     return YES; 
   },

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