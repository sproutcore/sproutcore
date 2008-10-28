// ==========================================================================
// SC.SliderView
// ==========================================================================

require('views/view');
require('mixins/control');

/** @class

  A SliderView shows a horizontal slider control that you can use to set 
  variable values.

  You can use a slider view much like you would any other control.  Simply
  set the value or content/contentValueKey to whatever value you want to 
  display.  You can also set the maximumValue and minValue properties to determine
  the mapping of the control to its children.
  
  @extends SC.View
  @extends SC.Control
  
  @author    Charles Jolley  
  @version 1.0
*/
SC.SliderView = SC.View.extend(SC.Control,
/** @scope SC.SliderView.prototype */ {

  emptyElement: '<span class="sc-slider-view"><span class="inner"><img src="%@" class="sc-handle" /></span></span>'.fmt(static_url('blank')),

  /** @private */
  outlets: ['handleElement'],

  /** 
    The DOM element that displays the handle.
  */
  handleElement: '.sc-handle?',
  
  /**
    The minimum value of the slider.
  */ 
  minimum: 0,

  /**
    The maximum value of the slider.
  */
  maximum: 1.0,
  
  /**
    Optionally set to the minimum step size allowed.
    
    All values will be rounded to this step size when displayed.
  */
  step: 0.1,

  /**
    The value of the slider.  Set this property or the content property.
  */
  value: 0.50,
  
  /** @private */
  valueBindingDefault: SC.Binding.SingleNotEmpty,
  
  _valueDidChangeObserver: function() {
    if (!this.didChangeFor('value', 'value', 'minimum', 'maximum')) return;

    
    var min = this.get('minimum') ;
    var max = this.get('maximum') ;
    var value = this.get('value') ;

    // constrain value.  If value did not match, set it back.
    var constrained = Math.min(Math.max(value, min), max) ;
    
    var step = this.get('step') ;
    if (step && step !== 0) {
      constrained = Math.round(constrained / step) * step ;
    }
    
    if (Math.abs(value - constrained) > 0.01) this.set('value', constrained) ;
    value = constrained ;

    // determine the percent across
    value = (value - min) / (max - min) ;

    
    // convert to a value within the width of the receiver's innerFrame.
    var f = this.get('innerFrame') ;
    value = Math.round((f.width-18) * value) ;
    
    // set handle.  This assumes the handle is centered over its origin.
    // adjust by 48px since this lives inside the inner div. Also the 
    // divider is shown shifted by 8 so account for that also.
    value -= (39) ;
    Element.setStyle(this.handleElement, { left: '%@px'.fmt(value) }) ;
    
  }.observes('value', 'minimum', 'maximum'),
  
  mouseDown: function(evt) {
    
    this.recacheFrames() ;
     
    if (!this.get('isEnabled')) return true ; // nothing to do
    
    // add active class
    this.addClassName('active') ;
    
    // find new location -- adjust from left edge of display.
    var loc = this.convertFrameFromView(Event.pointerLocation(evt), null).x ;
    var f = this.get('innerFrame') ;
    loc -= (f.x + 9) ; 

    // find percent across
    var value = loc / (f.width - 18) ;
    
    // convert to value and constrain
    var min = this.get('minimum') ;
    var max = this.get('maximum') ;
    value = (value * (max - min)) + min ;
    value = Math.min(Math.max(value, min), max) ;
    
    this.setIfChanged('value', value) ;
    
    return true;
  },
  
  // mouseDragged uses same technique as mouseDown.
  mouseDragged: function(evt) { return this.mouseDown(evt); },
  
  // remove active class
  mouseUp: function(evt) {
    this.removeClassName('active') ;
  }
  
  
}) ;
