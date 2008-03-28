// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

/**
  Apply this mixin to any view class to automatically inherit most of the
  basic properties you need to support to act as an item view in a collection.
  
  In addition to this module, make sure that your view class knows how to
  render the object set on the 'content' property.
  
  This module provides both the properties and reasonable default observers.
  You can override them in your own class as well.
  
  @namespace
*/
SC.CollectionItem = {
  
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
  }.observes('isEnabled')
  
};
