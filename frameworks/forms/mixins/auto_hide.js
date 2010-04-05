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
SC.FormsAutoHide = {
  
  /**
  Automatically hides the form, row, or whatever when they are considered "Empty".
  */
  autoHide: NO,
  
  /**
  YES if the form/row is empty, as calculated by relayoutFields.
  */
  isEmpty: NO,
  
  /**
  Called by fields when their emptiness changes.

  Always triggers (at end of run loop) a relayout of fields.
  */
  emptinessDidChangeFor: function(child)
  {
    this.invokeOnce("_calculateEmptiness");
  },

  /**
  Reevaluates emptiness
  */
  _calculateEmptiness: function()
  {
    // in short, we get the display fields, if we come across one that is visible and not empty
    // we cannot be empty.
    var views = this.get("childViews"),
    len = views.length;
    
    var empty = YES;
    for (var i = 0; i < len; i++)
    {
      var field = views[i];
      if (!field.get("isEmpty") && field.get("isVisible"))
      {
        empty = NO;
        break;
      }
    }

    this.setIfChanged("isEmpty", empty);
  }.observes("_displayFields"),

  emptinessDidChange: function()
  {
    var parentView = this.get("parentView");
    if (parentView && parentView.emptinessDidChangeFor) parentView.emptinessDidChangeFor(this);
  }.observes("isEmpty"),


  /**
  Called when emptiness changes, to recalculate hiddenness.
  */
  hiddenCouldChange: function()
  {
    var visible = YES;
    if (!this.get("isEditing") && this.get("autoHide") && this.get("isEmpty")) visible = NO;

    if (visible !== this.get("isVisible"))
    {
      this.set("isVisible", visible);
      this.relayoutFields();
    }
  }.observes("autoHide", "isEmpty")
};