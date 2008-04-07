// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

/**
  A Control is a view that also implements some basic state functionality.
  Apply this mixin to any view that you want to have standard control
  functionality including showing a selected state, enabled state, focus
  state, etc.
  
  @namespace
*/
SC.Control = {
  
  /** Set to true when the item is selected. */
  isSelected: false,
  
  /** By default, adds the 'sel' CSS class if selected. */
  isSelectedObserver: function() {
    this.setClassName('sel', this.get('isSelected')) ;
  }.observes('isSelected'),
  
  /** Set to true when the item is enabled. */
  isEnabled: true,
  
  /** By default, adds the disabled CSS class if disabled. */
  isEnabledObserver: function() {
    this.setClassName('disabled', !this.get('isEnabled'));
  }.observes('isEnabled'),
  
  /** Add a focus CSS class whenever the view has first responder status. */
  isFocusedObserver: function() {
    this.setClassName('focus', this.get('isFirstResponder')) ;
  }.observes('isFirstResponder')
  
};
