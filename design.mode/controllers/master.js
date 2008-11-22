// ========================================================================
// SproutCore
// copyright 2008 Sprout Systems, Inc.
// ========================================================================

/*global ViewBuilder */
require('design.mode/core');

ViewBuilder.masterController = SC.Object.create({
  
  /** The current view builder selection. */
  selection: [],
  
  /** 
    Updates the selection either by adding the item or by reseting the 
    selection.  Calling this method with no parameters will reset the 
    selection.
  */
  select: function(sel, extend) {
    if (extend) {
      sel = (this.get('selection')||[]).concat(sel||[]).compact().uniq();
    }
    this.set('selection', sel) ;
  },
  
  /**
    Removes the passed items from the current selection.
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
    sel.invoke('setIfChanged', 'isSelected', YES);
    
    // remove the isSelected state for old selection not in new selection.
    oldSel.forEach(function(s){ 
      if (!set.contains(s)) s.setIfChanged('isSelected', NO);
    }, this);
    
  }.observes('selection')
  
}) ;