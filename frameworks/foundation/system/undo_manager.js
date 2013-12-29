// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  This is a simple undo manager. It manages groups of functions which return
  something to an earlier state. It's your responsibility to make sure that
  these functions successfully undo the action, and register an undo of their
  own (allowing redo).

  ## Using SC.UndoManager

  You should create one SC.UndoManager instance for each thing you want to
  allow undo on. For example, if a controller manages a single record, but
  you have two fields that should each have their own undo stack, you should
  create two separate managers.

  Register undo functions via `SC.UndoManager#registerUndo(func)`. Your undo
  function should simply retain a copy of the previously-set value, usually
  via a closure, and set the value back to it. For example:

  ```
  var value = this._previousValue,
      that = this;
  this.undoManager.registerUndo(function() {
    that.set('value', value);
  });
  this._previousValue = value;
  ```

  ### Simple Example: A single value

  This example attaches an undo manager to a controller and registers an undo
  function each time the value of `value` changes. It also exposes methods to
  trigger undos and redos, triggered via buttons in the included stub view class.

  ```
  // Controller:
  MyApp.myController = SC.ObjectController.create({
    // Content, with `value`.
    content: SC.Object.create({ value: 'Hello, World.' }),

    // Undo manager.
    valueUndoManager: SC.UndoManager.create(),

    // Value observer; tracks `value` and registers undos.
    valueDidChange: function() {
      // Get the values.
      var value = this.get('value'),
          previousValue = this._previousValue,
          that = this;

      // Update previous value.
      this._previousValue = value;

      // GATEKEEP: If the current value is the same as the previous value, there's nothing to do.
      if (previousValue === value) return;

      // GATEKEEP: If there is no previous value, it's probably our initial spinup. We don't want
      // to register an undo-back-to-undefined method, so we should return. (Your situation may be
      // different.)
      if (SC.none(previousValue)) return;

      // Otherwise, register an undo function. (previousValue is accessed via the closure.)
      this.undoManager.registerUndo(function() {
        // This call will trigger the controller's `value` observer, triggering the registration
        // of another undo; the UndoManager will automatically and correctly interpret this as
        // the registration of a redo method.
        that.set('value', previousValue);
      });
    }.observes('value')
  });

  // Stub view:
  MyApp.UndoableValueView = SC.View.extend({
    childViews: ['labelView', 'undoButtonView', 'redoButtonView'],
    labelView: SC.LabelView.extend({
      layout: { height: 24 },
      isEdiable: YES,
      valueBinding: 'MyApp.myController.value'
    }),
    undoButtonView: SC.ButtonView.extend({
      layout: { height: 24, width: 60, bottom: 0 },
      title: 'Undo',
      isEnabledBinding: SC.Binding.oneWay('MyApp.myController.valueUndoManager.canUndo'),
      target: 'MyApp.myController.valueUndoManager',
      action: 'undo'
    }),
    redoButtonView: SC.ButtonView.extend({
      layout: { height: 24, width: 60, bottom: 0, right: 0 },
      title: 'Redo',
      isEnabledBinding: SC.Binding.oneWay('MyApp.myController.valueUndoManager.canRedo'),
      target: 'MyApp.myController.valueUndoManager',
      action: 'redo'
    })
  });
  ```

  ### Advanced: Grouping undos

  Undo events registered by `registerUndo` will undo or redo one at a time. If you wish, you can
  group undo events into groups (for example, if you wish to group all undos which happen within
  a short duration of each other). Groups are fired all at once when `undo` or `redo` is called.

  To start a new undo group, call `beginUndoGroup`; to register undo functions to the currently-
  open group, call `registerGroupedUndo`; finally, to mark the end of a grouped set of undo
  functions, call `endUndoGroup`.

  If `undo` is called while an undo group is open, UndoManager will simply close the group for
  you before executing it. This allows you to safely leave groups open pending possible additional
  undo actions.

  @extends SC.Object
*/
SC.UndoManager = SC.Object.extend(
/** @scope SC.UndoManager.prototype */ {

  /** 
    If name arguments are passed into `registerUndo` or related methods, then this property
    will expose the last undo action's name. You can use this to show the user what type of
    action will be undone (for example "Undo typing" or "Undo delete").

    @field
    @readonly
    @type String
    @default null
  */
  undoActionName: function () { 
    return this.undoStack ? this.undoStack.name : null;
  }.property('undoStack').cacheable(),

  /** 
    Exposes the timestamp of the most recent undo action.

    @field
    @readonly
    @type SC.DateTime
    @default null
  */
  undoActionTimestamp: function() {
    return this.undoStack ? this.undoStack.timeStamp : null;
  }.property('undoStack').cacheable(),

  /** 
    If name arguments are passed into `registerUndo` or related methods, then this property
    will expose the last redo action's name. You can use this to show the user what type of
    action will be redone (for example "Redo typing" or "Redo delete").

    @field
    @readonly
    @type String
    @default null
  */
  redoActionName: function () { 
    return this.redoStack ? this.redoStack.name : null;
  }.property('redoStack').cacheable(),

  /** 
    Exposes the timestamp of the most recent redo action.

    @field
    @readonly
    @type SC.DateTime
    @default null
  */
  redoActionTimestamp: function() {
    return this.redoStack ? this.redoStack.timeStamp : null;
  }.property('redoStack').cacheable(),

  /** 
    True if there is an undo action on the stack.
    
    Use to validate your menu item.
    
    @field
    @readonly
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
    @readonly
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
    The maximum number of undo groups the receiver holds.
    The undo stack is unlimited by default.

    @type Number
    @default 0
  */
  maxStackLength: 0,
  
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
    This is how you save new undo events. These functions will register as redo events
    if you call this method while an undo is in progress (i.e. from your undo method,
    or from observers which it triggers).
    
    @param {Function} func A prebound function to be invoked when the undo executes.
    @param {String} [name] An optional name for the undo.  If you are using 
      groups, this is not necessary.
  */
  registerUndo: function (func, name) {
    // Calls to registerUndo close any open undo groups, open a new one and register to
    // it. This means that a series of calls to registerUndo will simply open and close
    // a series of single-function groups, as intended.

    if (!this.isUndoing && !this.isRedoing) {
      if (this._activeGroup) {
        this.endUndoGroup();
      }
      this.beginUndoGroup(name);
    }
    
    this.registerGroupedUndo(func);
  },

  /**
    Registers an undo function to the current group. If no group is open, opens a new
    one.

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
      this._activeGroup.timeStamp = SC.DateTime.create();
    }

    // If we're not mid-undo or -redo, then we're registering a new undo, and should
    // clear out any redoStack.
    if (!this.isUndoing && !this.isRedoing) {
      this.set('redoStack', null);
    }
  },

  /**
    Begins a new undo group.

    Whenever you start an action that you expect to need to bundle under a single
    undo action in the menu, you should begin an undo group.  This way any
    undo actions registered by other parts of the application will be
    automatically bundled into this one action.

    When you are finished performing the action, balance this with a call to
    `endUndoGroup()`. (You can call `undo` or `redo` with an open group; the group
    will simply be closed and processed as normal.)

    @param {String} name
  */
  beginUndoGroup: function (name) {
    if (this._activeGroup) {
      //@if(debug)
      SC.warn("SC.UndoManager#beginUndoGroup() called while inside group.");
      //@endif
      return;
    }

    var stack = this.isUndoing ? 'redoStack' : 'undoStack';
    this._activeGroup = { name: name, actions: [], prev: this.get(stack), timeStamp: SC.DateTime.create() };
    this.set(stack, this._activeGroup);
  },
 
  /**
    Ends a group of undo functions. All functions in an undo group will be undone or redone
    together when `undo` or `redo` is called.

    @param {String} name
    @see beginUndoGroup()
  */
  endUndoGroup: function (name) {
    var maxStackLength = this.get('maxStackLength'),
      stackName = this.isUndoing ? 'redoStack' : 'undoStack';

    if (!this._activeGroup) {
      //@if(debug)
      SC.warn("endUndoGroup() called outside group.");
      //@endif
    }

    this._activeGroup = null;
    this.propertyDidChange(stackName);

    if (maxStackLength > 0) {
      var stack = this[stackName],
        i = 1;
      while(stack = stack.prev) {
        i++;
        if (i >= maxStackLength) {
          stack.prev = null;
        }
      }
    }
  },

  /**
    Change the name of the current undo group.

    Normally you don't want to do this as it will effect the whole group.
    
    @param {String} name
  */
  setActionName: function (name) {
    if (!this._activeGroup) {
      //@if(debug)
      SC.warn("SC.UndoManager#setActionName() called without an active undo group.");
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

      this.beginUndoGroup(group.name);
      while(action = group.actions.pop()) { 
        action();
      }
      this.endUndoGroup();
    }
    this.set(state, false);
  }
  
});
