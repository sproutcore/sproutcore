// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace 
  Handles auto-hiding of views based on emptiness.
  
  A view is empty if all of its children are not visible or are empty. The response to being 
  empty is to become invisible.
  
  Note: as a special case, this also checks isEditing to see if hiding is enabled, since if it
  is editing, it can't really be hidden, can it?
*/
SC.AutoHide = {
  
  /**
  Automatically hides the form, row, or whatever when they are considered "Empty".
  */
  autoHide: YES,
  
  /**
  Tell the parent autohiding view to treat this view as always hidden (for example the labels in a row). Automatically sets self to be not visible when parent becomes hidden.
   */
  ignoreVisibility: NO,
  
  /**
  YES if the form/row is empty
  */
  isEmpty: NO,
  
  /**
  If you are not in a flowed layout you need to make an observer to handle this yourself (such as by setting isVisible).
   */
  isHidden: NO,
  
  initMixin: function() {
    // if we are a non-value field, base our visibility on our parent so we hide properly
    if(this.get('ignoreVisibility')) {
      SC.Binding.from('isHidden', this.parentView)
      .oneWay()
      .not()
      .to('isVisible', this)
      .connect();
    }
  },
  
  /**
  Called by fields when their emptiness changes.

  Always triggers (at end of run loop) a relayout of fields.
  */
  visibilityDidChangeFor: function(child)
  {
    this.invokeOnce("_calculateEmptiness");
  },

  /**
  By default, a view will check all of its children to determine if it is empty. It is only empty if all of its children are.
  */
  _calculateEmptiness: function()
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
      
      if (!field.get('ignoreVisibility') && !field.get("isEmpty") && field.get("isVisible") && !field.get('isHidden')) {
        empty = NO;
        break;
      }
    }
    
    this.setIfChanged("isEmpty", empty);
  },

  visibilityDidChange: function()
  {
    var parentView = this.get("parentView");
    if (parentView && parentView.visibilityDidChangeFor) parentView.visibilityDidChangeFor(this);
  }.observes('isHidden'),


  /**
  Called when emptiness changes, to recalculate hiddenness.
  */
  shouldDetermineVisibility: function() {
    // if it's not visible, it's obviously hidden
    // otherwise, check if it should be hidden
    this.setIfChanged('isHidden', !this.get('isVisible') || !this.get("isEditing") && this.get("autoHide") && this.get("isEmpty"));
  }.observes('autoHide', 'isEmpty', 'isVisible')
};