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
    
    @param {Function} func A prebound function to be invoked when the undo executes.
    @param {String} [name] An optional name for the undo.  If you are using 
      groups, this is not necessary.
    @see SC.AutoGroupUndoManager.registerUndo
  */
  registerUndo: function(original, func, name) {
    if (this.shouldUseCurrentGroup()) {
      this.registerGroupedUndo(func);
    }
    else {
      original(func, name);
    }
  }.enhance(),

  /**
    Return true if the current group should be used.

    @returns {Boolean}
  */
  shouldUseCurrentGroup: function() {
    var activeGroup = this._activeGroup;
    if (activeGroup && !this.isUndoing) {
      var groupLapse = this.get('groupLapse'); 
      return (Date.now() - activeGroup.timeStamp) < groupLapse;
    }
    return false;
  }
  
});
