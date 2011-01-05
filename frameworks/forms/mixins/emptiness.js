// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace 
  A view is empty if all of its children are empty. A view is automatically counted as empty if it is not visible and not empty if it is being edited.
  All fields must mix this in for it to work properly.
*/
SC.CalculatesEmptiness = {
  
  hasCalculatesEmptiness: YES,
  
  /**
  Whether this view should be considered a value. If it is not it will be ignored for calculating emptiness.
   */
  isValue: YES,
  
  /**
  YES if the value of the field is empty. Defaults to yes so if you don't override this, it will only consider child fields in emptiness calculation (this is the desired behavior for forms).
  */
  isValueEmpty: YES,
  
  /**
  Defaults to YES so that a field with no children will act properly.
   */
  _SCCE_childrenAreEmpty: YES,
  
  isEditingAffectsIsEmpty: YES,
  
  _SCCE_isEditingDidChange: function() {
    if(this.get('isEditingAffectsIsEmpty')) this.propertyDidChange('isEmpty');
  }.observes('isEditing'),
  
  /**
  YES if the field itself is empty. Even if the value is non-empty, the field can be empty due to isVisible.
   */
  isEmpty: function() {
    // if it's not visible, it counts as empty
    // if it's editing, it can't be empty
    return !this.get('isValue') || !this.get('isVisible') || ((!this.get('isEditingAffectsIsEmpty') || !this.get('isEditing')) && this.get('isValueEmpty') && this.get('_SCCE_childrenAreEmpty'));
  }.property('isValueEmpty', 'isVisible', '_SCCE_childrenAreEmpty').cacheable(),
  
  /**
  When emptiness changes tell the parent to re-check its emptiness.
  */
  _SCCE_isEmptyDidChange: function() {
    var parentView = this.get('parentView');
    
    if (parentView && parentView._SCCE_emptinessDidChangeFor) parentView._SCCE_emptinessDidChangeFor(this);
  }.observes('isEmpty'),
  
  initMixin: function() {
    this._SCCE_emptinessDidChangeFor();
  },
  
  /**
  Called by fields when their emptiness changes.

  Always triggers (at end of run loop) a relayout of fields.
  */
  _SCCE_emptinessDidChangeFor: function(child)
  {
    this.invokeOnce('_SCCE_recalculateChildrensEmptiness');
  },

  /**
  By default, a view will check all of its fields to determine if it is empty. It is only empty if all of its value fields are.
  */
  _SCCE_recalculateChildrensEmptiness: function()
  {
    // in short, we get the value fields, if we come across one that is visible and not empty
    // we cannot be empty.
    var views = this.get('childViews');
    
    var empty = YES,
    len = views.length,
    field;
    
    for (var i = 0; i < len; i++)
    {
      field = views[i];
      
      if (!field.get('isEmpty')) {
        empty = NO;
        break;
      }
    }
    
    this.setIfChanged('_SCCE_childrenAreEmpty', empty);
  }
};
