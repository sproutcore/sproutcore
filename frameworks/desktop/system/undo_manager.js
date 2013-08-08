// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*
  TODO More docs for this class
*/

/**
  @class
  
  This is a simple undo manager.  To use this UndoManager, all you need to
  do is to make sure that you register a function with this manager to undo
  every change you make.  You can then invoke the undo/redo methods to do it.
  
  ## Using SC.UndoManager
  
  Typically you create an undo manager inside on of your controllers.  Then,
  whenever you are about to perform an action on your model object, all you
  need to do is to register a function with the undo manager that can undo 
  whatever  you just did.
  
  Besure the undo function you register also saves undo functions.  This makes
  redo possible.
  
  @extends SC.Object
*/
SC.UndoManager = SC.Object.extend(
/** @scope SC.UndoManager.prototype */ {

  /** 
    Use this property to build your Undo menu name.
    
    @field
    @type String
    @default null
  */
  undoActionName: function () { 
    return this.undoStack ? this.undoStack.name : null;
  }.property('undoStack').cacheable(),
  
  /** 
    Use this property to build your Redo menu name.
    
    @field
    @type String
    @default null
  */
  redoActionName: function () { 
    return this.redoStack ? this.redoStack.name : null;
  }.property('redoStack').cacheable(),

  /** 
    True if there is an undo action on the stack.
    
    Use to validate your menu item.
    
    @field
    @type Boolean
    @default NO
  */
  canUndo: function () { 
    // instead of this.undoStack !== null && this.undoStack !== undefined
    return this.undoStack != null;
  }.property('undoStack').cacheable(),
  
  /** 
    True if there is an redo action on the stack. Use to validate your menu item.
    
    @field
    @type Boolean
    @default NO
  */
  canRedo: function () { 
    // instead of this.redoStack !== null && this.redoStack !== undefined
    return this.redoStack != null; 
  }.property('redoStack').cacheable(),
  
  /**
    Tries to undo the last action. Fails if an undo group is currently open.
    
    @returns {Boolean} YES if succeeded, NO otherwise.
  */
  undo: function () {
    this._undoOrRedo('undoStack','isUndoing');
  },
  
  /**
    Tries to redo the last action. Fails if a redo group is currently open.
    
    @returns {Boolean} YES if succeeded, NO otherwise.
  */
  redo: function () {
    this._undoOrRedo('redoStack','isRedoing');
  },

  /**
    Resets the undo and redo stacks.
  */
  reset: function () {
    this._activeGroup = null;
    this.set('undoStack', null);
    this.set('redoStack', null);
  },
  
  /**
    @type Boolean
    @default NO
  */
  isUndoing: NO,
  
  /**
    @type Boolean
    @default NO
  */
  isRedoing: NO, 
  
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
  registerUndo: function (func, name) {
    if (this._activeGroup) {
      this.endUndoGroup();
    }
    this.beginUndoGroup(name);
    this.registerGroupedUndo(func);
  },


  /**
    This is how you add new undo events to the current stack. 
    
    @param {Function} func A prebound function to be invoked when the undo executes.
    @param {String} name An optional name for the undo.  If a group is already 
      created, this is not necessary.
  */
  registerGroupedUndo: function (func, name) {
    if (!this._activeGroup) {
      this.registerUndo(func, name);
    }
    else {
      this._activeGroup.actions.push(func);
      this._activeGroup.timeStamp = Date.now();
    }
  },

  /**
    Begins a new undo groups

    Whenever you start an action that you expect to need to bundle under a single
    undo action in the menu, you should begin an undo group.  This way any
    undo actions registered by other parts of the application will be
    automatically bundled into this one action.
    
    When you are finished performing the action, balance this with a call to
    `endUndoGroup()`.
    
    @param {String} name
  */
  beginUndoGroup: function (name) {
    if (this._activeGroup) {
      //@if(debug)
      SC.warn("beginUndoGroup() called inside group.");
      //@endif
      return;
    }

    var stack = this.isUndoing ? 'redoStack' : 'undoStack';
    this._activeGroup = { name: name, actions: [], prev: this.get(stack), timeStamp: Date.now() };
    this.set(stack, this._activeGroup);
  },
 
  /**
    @throws {Error} If there is no active group
    
    @param {String} name
    @see beginUndoGroup()
  */
  endUndoGroup: function (name) {
    if (!this._activeGroup) {
      //@if(debug)
      SC.warn("endUndoGroup() called outside group.");
      //@endif
    }

    this._activeGroup = null;
    this.propertyDidChange(this.isUndoing ? 'redoStack' : 'undoStack');
  },

  /**
    Change the name of the current undo group.
    
    Normally you don't want to do this as it will effect the whole group.
    
    @param {String} name
    
    @throws {Error} If there is no active group
  */
  setActionName: function (name) {
    if (!this._activeGroup) {
      //@if(debug)
      SC.warn("setActionName() called outside group.");
      //@endif
      return;
    }
    this._activeGroup.name = name;
  },
  
  // --------------------------------
  // PRIVATE
  //
  
  /** @private */
  _activeGroup: null,
  
  /** @private */
  undoStack: null,
  
  /** @private */
  redoStack: null, 
  
  /** @private */
  _undoOrRedo: function (stack, state) {
    if (this._activeGroup) this.endUndoGroup();

    this.set(state, true);
    var group = this.get(stack),
      action;

    if (group) {
      this.set(stack, group.prev);

      while(action = group.actions.pop()) { 
        action();
        this.registerGroupedUndo(action, group.name);
      }
      
      this.set(state, false);
    }
  }
  
});
