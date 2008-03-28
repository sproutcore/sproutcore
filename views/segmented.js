// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

// SegmentView shows an array of buttons that can have mutually exclusive
// select states.  You can change the value property to the state you
// want to reflect and a button with the matching name 'xxxButton' will have
// its select state set.
//
// Also, on configure, if the buttons in the segment view do not have actions
// set, then the button will be configured to change the select state.
SC.SegmentedView = SC.View.extend({
  
  value: null, // set to the currently value button.

  segments: null, // contains the array of buttons after init.
  
  // changes all buttons to enabled/disabled.  You can also change buttons
  // individually.
  isEnabled: true, 
  
  // if true, clicking on a button again will deselect it (using the
  // standard action)
  allowsEmptySelection: false,  

  init: function() {
    arguments.callee.base.call(this) ;
    
    // find all segment outlets.  If they don't have any action already, set 
    // them up.
    if (!this.segments) this.segments = this.outlets.slice() ;
    var view = this ;
    this.segments.each(function(key) {
      var seg = view[key] ;
      var selectKey = key.slice(0,-6) ;
      if (seg && (seg.action == SC.ButtonView.prototype.action)) seg.action = function() {
        if (this.owner.get('allowsEmptySelection')) {
          newKey = (this.owner.get('value') == selectKey) ? null : selectKey;
        } else newKey = selectKey;
        this.owner.set('value',newKey) ;
      } ;
    }) ;
    
    this._enabledObserver() ;
    this._valueObserver() ;
  },
  
  // OBSERVERS
  _valueObserver: function() {
    var value = this.get('value') ;
    if (value != this._lastSelected) {
      this._lastSelected = value ;
      var view = this ;
      this.segments.each(function(key) {
        var isSelected = (value) ? (key.slice(0,-6) == value) : false;
        var button = view[key] ;
        if (button) button.set('isSelected',isSelected) ;
      }) ;
    }
  }.observes('value'),
  
  _enabledObserver: function() {
    var isEnabled = this.get('isEnabled') ;
    if (isEnabled != this._lastEnabled) {
      var view = this ;
      this.segments.each(function(key) {
        view[key].set('isEnabled',isEnabled) ;
      }) ;
    }
  }.observes('isEnabled')
  
}) ;





