// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

require('core');

/**
  @class
  
  This is a simple undo manager.  To use this UndoManager, all you need to
  do is to make sure that you register a function with this manager to undo
  every change you make.  You can then invoke the undo/redo methods to do it.
  
  h4. USING THE UNDOMANAGER
  
  Typically you create an undo manager inside on of your controllers.  Then,
  whenever you are about to perform an action on your model object, all you
  need to do is to register a function with the undo manager that can undo 
  whatever  you just did.
  
  Besure the undo function you register also saves undo functions.  This makes
  redo possible.
  
  More docs TBD.
  
  @extends SC.Object
*/
SC.UndoManager = SC.Object.extend(
/** @scope SC.UndoManager.prototype */
{

  /** 
    (Property) Name of the next undo action name.  
  
    Use this property to build your Undo menu name.
    
  */
  undoActionName: function() { 
    return this.undoStack ? this.undoStack.name : null ;
  }.property('undoStack'),
  
  /** 
    (Property) Name of the next return action name.  
  
    Use this property to build your Redo menu name.
    
  */
  redoActionName: function() { 
    return this.redoStack ? this.redoStack.name : null ;
  }.property('redoStack'),

  /** 
    True if there is an undo action on the stack.
    
    Use to validate your menu item.
  */
  canUndo: function() { 
    return this.undoStack != null; 
  }.property('undoStack'),
  
  /** 
    True if there is an redo action on the stack.
    
    Use to validate your menu item.
  */
  canRedo: function() { 
    return this.redoStack != null; 
  }.property('redoStack'),
  
  /**  
    Tries to undo the last action.  
  
    Returns true if succeeded.  Fails if an undo group is currently open.
  */
  undo: function() { this._undoOrRedo('undoStack','isUndoing'); },
  
  /**  
    Tries to redo the last action.  
  
    Returns true if succeeded.  Fails if an undo group is currently open.
  */
  redo: function() { this._undoOrRedo('redoStack','isRedoing'); },
  
  /**
    True if the manager is currently undoing events. 
  */
  isUndoing: false, 
  
  /**
    True if the manager is currently redoing events.
  */
  isRedoing: false, 
  
  /** @private */
  groupingLevel: 0,
  
  // --------------------------------
  // SIMPLE REGISTRATION
  //
  // These are the core method to register undo/redo events.
  
  /**
    This is how you save new undo events.
    
    @param {Function} func A prebound function to be invoked when the undo executes.
    @param {String} [name] An optional name for the undo.  If you are using 
      groups, this is not necessary.
  */
  registerUndo: function(func, name) {
    this.beginUndoGroup(name) ;
    this._activeGroup.actions.push(func) ;
    this.endUndoGroup(name) ;
  },

  /**
    Begins a new undo groups

    Whenver you start an action that you expect to need to bundle under a single
    undo action in the menu, you should begin an undo group.  This way any
    undo actions registered by other parts of the application will be
    automatically bundled into this one action.
    
    When you are finished performing the action, balance this with a call to
    endUndoGroup().
  */
  beginUndoGroup: function(name) {
    // is a group already active? Just increment the counter.
    if (this._activeGroup) {
      this.groupingLevel++ ;
      
    // otherwise, create a new active group.  
    } else {
      var stack = this.isUndoing ? 'redoStack' : 'undoStack' ;
      this._activeGroup = { name: name, actions: [], prev: this.get(stack) } ;
      this.set(stack, this._activeGroup) ;
      this.groupingLevel = 1 ;
    }
  },
 
  /** end the undo group.  see beginUndoGroup() */
  endUndoGroup: function(name) {
    // if more than one groups are active, just decrement the counter.
    if (!this._activeGroup) raise("endUndoGroup() called outside group.") ;
    if (this.groupingLevel > 1) {
      this.groupingLevel-- ;
      
    // otherwise, close out the current group.
    } else {
      this._activeGroup = null ; this.groupingLevel = 0 ;
    }
    this.propertyDidChange(this.isUndoing ? 'redoStack' : 'undoStack') ;
  },

  /**
    Change the name of the current undo group.  
  
    Normally you don't want to do this as it will effect the whole group.
  */
  setActionName: function(name) {
    if (!this._activeGroup) raise("setActionName() called outside group.") ;
    this._activeGroup.name = name ;
  },
  
  // --------------------------------
  // PRIVATE
  //
  _activeGroup: null, undoStack: null, redoStack: null, 
  _undoOrRedo: function(stack,state) {
    if (this._activeGroup) return false ;
    if (this.get(stack) == null) return true; // noting to do.

    this.set(state, true) ;
    var group = this.get(stack) ;
    this.set(stack, group.prev) ;
    var action ;

    var useGroup = group.actions.length > 1; 
    if (useGroup) this.beginUndoGroup(group.name) ;
    while(action = group.actions.pop()) { action(); }
    if (useGroup) this.endUndoGroup(group.name) ;
    
    this.set(state, false) ;
  }
  
}) ;
