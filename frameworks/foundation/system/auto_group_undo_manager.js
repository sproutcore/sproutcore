// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('system/undo_manager');

/**
  @class
  
  This extend the undo manager.  Use it if you want to automatically group
  your actions by time.
  
  @extends SC.UndoManager
*/

SC.AutoGroupUndoManager = SC.UndoManager.extend({

  /** 
    Use this property to group your undo events. If the lapse between
    two events is less than the specified value, the both actions will be grouped.
    
    @type Number in milliseconds
    @default 0
  */
  groupLapse: 0,
  
  /**
    This will create a new group only if the last registered undo has occur 
    in less than groupLapse milliseconds before this one.
    
    @param {String|Object} target The action's target (`this`).
    @param {String|Function} action The method on `target` to be called.
    @param {Object} context The context passed to the action when called.
    @param {String} name An optional human-readable name for the undo action.
    @see SC.AutoGroupUndoManager.registerUndo
  */
  registerUndoAction: function(target, action, context, name) {
    if (this.shouldUseCurrentGroup()) {
      this.registerGroupedUndoAction(target, action, context, name);
    }
    else {
      sc_super();
    }
  },

  /**
    Return true if the current group should be used.

    @returns {Boolean}
  */
  shouldUseCurrentGroup: function() {
    var activeGroup = this._activeGroup;
    if (activeGroup && !this.isUndoing) {
      var groupLapse = this.get('groupLapse');
      return (Date.now() - activeGroup.timeStamp.get('milliseconds')) < groupLapse;
    }
    return false;
  }
  
});
