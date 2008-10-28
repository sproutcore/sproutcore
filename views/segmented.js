// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

/**
  @class
  
  SegmentView shows an array of buttons that can have mutually exclusive
  select states.  You can change the value property to the state you
  want to reflect and a button with the matching name 'xxxButton' will have
  its select state set.

  Also, on configure, if the buttons in the segment view do not have actions
  set, then the button will be configured to change the select state.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.SegmentedView = SC.View.extend(
/** @scope SC.SegmentedView.prototype */ {
  
  /**
    The value of the segmented view.
    
    The SegmentedView's value will always be the value of the currently
    selected button.  Setting this value will change the selected button. 
    If you set this value to something that has no matching button, then
    no buttons will be selected.
    
    @field {Object}
  */
  value: null,

  /**
    Contains an array of buttons after init.
  */
  segments: null, 

  /**
    Set to YES to enabled the segmented view, NO to disabled it.
  */
  isEnabled: true, 

  /**
    If YES, clicking a selected button again will deselect it, setting the
    segmented views value to null.  Defaults to NO.
  */
  allowsEmptySelection: false,  

  /** @private */
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





