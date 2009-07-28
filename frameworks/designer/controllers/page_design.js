// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/** @class
  An instance of this controller is created for every page where designers 
  are involved.  The Designer's themselves will register with the 
  controller so that you can hook to the controller to manage the views and
  their editors.
  
  Among other things, this controller implements global selection support for
  the designers.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.PageDesignController = SC.Object.extend({
  
  /** The current view builder selection. */
  selection: null,
  
  /** 
    Updates the selection either by adding the item or by reseting the 
    selection.  Calling this method with no parameters will reset the 
    selection.
    
    The passed selection must be a Designer object.
  */
  select: function(sel, extend) {
    var base = (extend ? this.get('selection') : []) || [];
    sel = base.concat(sel||[]).compact().uniq();
    this.set('selection', sel) ;
  },
  
  /**
    Removes the passed items from the current selection.
    
    The passed selection must be a Designer object.
  */
  deselect: function(sel) {
    
    // build new selection without passed elements
    var newSel = [], cur = this.get('selection')||[];
    if (!sel) sel = []; 
    cur.forEach(function(s) {
      if (sel.indexOf(s)<0) newSel.push(s)
    },this);
    
    this.set('selection', newSel) ;
  },
  
  /**
    Invoked whenever the selection changes.  Updates the selection states 
    on the old and new views.
  */
  selectionDidChange: function() {
    // get new and old selection. step through both and update states
    var sel = this.get('selection')||[], oldSel = this._selection||[];
    var set = SC.Set.create(sel);

    // save old selection for next time
    this._selection = sel ;
    
    // set the isSelected state on new selection.
    sel.invoke('set', 'designIsSelected', YES);
    
    // remove the isSelected state for old selection not in new selection.
    oldSel.forEach(function(s){ 
      if (!set.contains(s)) s.set('designIsSelected', NO);
    }, this);
    
  }.observes('selection'),
  
  
  // ..........................................................
  // DESIGNERS
  // 
  
  /** All of the designers on the current page. */
  designers: null,

  /**  
    Called by each designer when it is created to register itself with the
    controller.  You can use this to know which designers are currently in 
    the document to delete them as needed.
  */
  registerDesigner: function(designer) {
    this.get('designers').add(designer);
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  init: function() {
    this.designers = SC.Set.create();
    this.sel = [];
    sc_super();
  }
  
}) ;