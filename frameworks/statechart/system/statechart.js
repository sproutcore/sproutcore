// ==========================================================================
// Project:   SC.State - A Statechart Framework for SproutCore
// Copyright: ©2010 Michael Cohen, and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC */

/**
  The startchart manager mixin allows an object to be a statechart. By becoming a statechart, the
  object can then be manage a set of its own states.
  
  This implemention of the statechart manager closely follows the concepts stated in D. Harel's 
  original paper "Statecharts: A Visual Formalism For Complex Systems" 
  (www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.pdf). 
  
  The statechart allows for complex state heircharies by nesting states within states, and 
  allows for state orthogonality based on the use of concurrent states.
  
  At minimum, a statechart must have one state: The root state. All other states in the statechart
  are a decendents (substates) of the root state.
  
  The following example shows how states are nested within a statechart:
  
    {{{
    
      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
      
        rootState: SC.State.design({
      
          initialSubstate: 'stateA',
        
          stateA: SC.State.design({
            // ... can continue to nest further states
          }),
        
          stateB: SC.State.design({
            // ... can continue to nest further states
          })
        })
      
      })
    
    }}}
  
  Note how in the example above, the root state as an explicit initial substate to enter into. If no
  initial substate is provided, then the statechart will default to the the state's first substate.
  
  To provide your statechart with orthogonality, you use concurrent states. If you use concurrent states,
  then your statechart will have multiple current states. That is because each concurrent state represents an
  independent state structure from other concurrent states. The following example shows how to provide your
  statechart with concurrent states:
  
    {{{
    
      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
      
        rootState: SC.State.design({
      
          substatesAreConcurrent: YES,
        
          stateA: SC.State.design({
            // ... can continue to nest further states
          }),
        
          stateB: SC.State.design({
            // ... can continue to nest further states
          })
        })
      
      })
    
    }}}
  
  Above, to indicate that a state's substates are concurrent, you just have to set the substatesAreConcurrent to 
  YES. Once done, then stateA and stateB will be independent of each other and each will manage their
  own current substates. The root state will then have more then one current substate.
  
  Remember that a startchart can have a mixture of nested and concurrent states in order for you to 
  create as complex of statecharts that suite your needs. Here is an example of a mixed state structure:
  
    {{{
    
      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
      
        rootState: SC.State.design({
      
          initialSubstate: 'stateA',
        
          stateA: SC.State.design({
          
            substatesAreConcurrent: YES,
          
            stateM: SC.State.design({ ... })
            stateN: SC.State.design({ ... })
            stateO: SC.State.design({ ... })
          
          }),
        
          stateB: SC.State.design({
          
            initialSubstate: 'stateX',
          
            stateX: SC.State.design({ ... })
            stateY: SC.State.desgin({ ... })
          
          })
        })
      
      })
    
    }}}
  
  Deeping on your needs, a statechart can have lots of states, which can become hard to manage all within
  one file. To modularize your states and make them easier to manage and maintain, you can plug-in states
  into other states. Let's say we are using the statechart in the last example above, and all the code is 
  within one file. We could update the code and split the logic across two or more files like so:
  
    {{{
      ---- state_a.js
  
      MyApp.StateA = SC.State.extend({
    
        substatesAreConcurrent: YES,
    
        stateM: SC.State.design({ ... })
        stateN: SC.State.design({ ... })
        stateO: SC.State.design({ ... })
    
      });
    
      ---- state_b.js
    
      MyApp.StateB = SC.State.extend({
    
        substatesAreConcurrent: YES,
    
        stateM: SC.State.design({ ... })
        stateN: SC.State.design({ ... })
        stateO: SC.State.design({ ... })
    
      });
    
      ---- statechart.js
    
      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
    
        rootState: SC.State.design({
    
          initialSubstate: 'stateA',
      
          stateA: SC.State.plugin('MyApp.stateA'),
      
          stateB: SC.State.plugin('MyApp.stateB')
        
        })
    
      })
  
    }}}
    
  Using state plug-in functionality is optional. If you use the plug-in feature you can break up your statechart
  into as many files as you see fit.

*/

SC.StatechartManager = {
  
  // Walk like a duck
  isResponderContext: YES,
  
  // Walk like a duck
  isStatechart: YES,
  
  /**
    Indicates if this statechart has been initialized

    @property {Boolean}
  */
  statechartIsInitialized: NO,
  
  /**
    The root state of this statechart. All statecharts must have a root state.
    
    @property {SC.State}
  */
  rootState: null,
  
  /** 
    Indicates whether to use a monitor to monitor that statechart's activities. If true then
    the monitor will be active, otherwise the monitor will not be used. Useful for debugging
    purposes.
    
    @property {Boolean}
  */
  monitorIsActive: NO,
  
  /**
    A statechart monitor that can be used to monitor this statechart. Useful for debugging purposes.
    A monitor will only be used if monitorIsActive is true.
    
    @property {StatechartMonitor}
  */
  monitor: null,
  
  /**
    Indicates whether to trace the statecharts activities. If true then the statechart will output
    its activites to the browser's JS console. Useful for debugging purposes.
  */
  trace: NO,
  
  initMixin: function() {
    this._gotoStateLocked = NO;
    this._sendEventLocked = NO;
    this._pendingStateTransitions = [];
    this._pendingSentEvents = [];
    
    this.sendAction = this.sendEvent;
    
    if (this.get('monitorIsActive')) {
      this.set('monitor', SC.StatechartMonitor.create());
    }
  },
  
  /**
    Initializes the statechart. By initializing the statechart, it will create all the states and register
    them with the statechart. Once complete, the statechart can be used to go to states and send events to.
  */
  initStatechart: function() {
    if (this.get('statechartIsInitialized')) return;
    
    var trace = this.get('trace'),
        rootState = this.get('rootState');
    
    if (trace) SC.Logger.debugGroup("initialize statechart");
    
    if (SC.typeOf(rootState) === SC.T_FUNCTION && rootState.statePlugin) {
      rootState = rootState.apply(this);
    }
    
    if (!(SC.kindOf(rootState, SC.State) && rootState.isClass)) {
      throw "Unable to initialize statechart. Root state must be a state class";
    }
    
    rootState = this.createRootState(rootState, { statechart: this, name: SC.ROOT_STATE_NAME });
    this.set('rootState', rootState);
    rootState.initState();
    this.set('statechartIsInitialized', YES);
    this.gotoState(rootState);
    
    if (trace) SC.Logger.debugGroupEnd("initialize statechart");
  },
  
  /**
    Will create a root state for the statechart
  */
  createRootState: function(state, attrs) {
    if (!attrs) attrs = {};
    state = state.create(attrs);
    return state;
  },
  
  /**
    Returns an array of all the current states for this statechart
    
    @returns {Array} the current states
  */
  currentStates: function() {
    return this.getPath('rootState.currentSubstates');
  }.property(),
  
  /**
    Returns the count of the current states for this statechart
    
    @returns {Number} the count 
  */
  currentStateCount: function() {
    return this.getPath('currentStates.length');
  }.property('currentStates'),
  
  /**
    Checks if a given state is a current state of this statechart. 
    
    @param state {State} the state to check
    @returns {Boolean} true if the state is a current state, otherwise fals is returned
  */
  stateIsCurrentState: function(state) {
    return this.get('rootState').stateIsCurrentSubstate(state);
  },
  
  /**
    Checks if the given value represents a state is this statechart
    
    @param value {State|String} either a state object or the name of a state
    @returns {Boolean} true if the state does belong ot the statechart, otherwise false is returned
  */
  doesContainState: function(value) {
    return !SC.none(this.getState(value));
  },
  
  /**
    Gets a state from the statechart that matches the given value
    
    @param value {State|String} either a state object of the name of a state
    @returns {State} if a match then the matching state is returned, otherwise null is returned 
  */
  getState: function(value) {
    return this.get('rootState').getSubstate(value);
  },
  
  /**
    When called, the statechart will proceed with making state transitions in the statechart starting from 
    a current state that meet the statechart conditions. When complete, some or all of the statechart's 
    current states will be changed, and all states that were part of the transition process will either 
    be exited or entered in a specific order.
    
    The state that is given to go to will not necessarily be a current state when the state transition process
    is complete. The final state or states are dependent on factors such an initial substates, concurrent 
    states, and history states.
    
    Because the statechart can have one or more current states, it may be necessary to indicate what current state
    to start from. If no current state to start from is provided, then the statechart will default to using
    the first current state that it has; depending of the make up of the statechart (no concurrent state vs.
    with concurrent states), the outcome may be unexpected. For a statechart with concurrent states, it is best
    to provide a current state in which to start from.
    
    When using history states, the statechart will first make transitions to the given state and then use that
    state's history state and recursively follow each history state's history state until there are no 
    more history states to follow. If the given state does not have a history state, then the statechart
    will continue following state transition procedures.
    
    @param state {SC.State|String} the state to go to (may not be the final state in the transition process)
    @param fromCurrentState {SC.State|String} Optional. The current state to start the transition process from.
    @param context Any value that you want to be supplied to states that will be entered. Can be null.
    @param useHistory {Boolean} Optional. Indicates whether to include using history states in the transition process
  */
  gotoState: function(state, fromCurrentState, context, useHistory) {
    
    if (!this.get('statechartIsInitialized')) {
      SC.Logger.error("Cannot go to state %@. statechart has not yet been initialized", state);
      return;
    }
    
    var pivotState = null,
        exitStates = [],
        enterStates = [],
        trace = this.get('trace'),
        rootState = this.get('rootState'),
        paramState = state,
        paramFromCurrentState = fromCurrentState;
    
    state = rootState.getSubstate(state);
    
    if (SC.none(state)) {
      SC.Logger.error("Cannot goto state %@. Not a recognized state in statechart", paramState);
      return;
    }
    
    if (this._gotoStateLocked) {
      // There is a state transition currently happening. Add this requested state
      // transition to the queue of pending state transitions. The request will
      // be invoked after the current state transition is finished.
      this._pendingStateTransitions.push({
        state: state,
        fromCurrentState: fromCurrentState,
        context: context,
        useHistory: useHistory
      });
      
      return;
    }
    
    // Lock the current state transition so that no other requested state transition 
    // interferes. 
    this._gotoStateLocked = YES;
    
    if (!SC.none(fromCurrentState)) {
      // Check to make sure the current state given is actually a current state of this statechart
      fromCurrentState = rootState.getSubstate(fromCurrentState);
      if (SC.none(fromCurrentState) || !fromCurrentState.get('isCurrentState')) {
        SC.Logger.error("Cannot goto state %@. %@ is not a recognized current state in statechart", paramState, paramFromCurrentState);
        this._gotoStateLocked = NO;
        return;
      }
    } 
    else if (this.getPath('currentStates.length') > 0) {
      // No explicit current state to start from; therefore, just use the first current state as 
      // a default, if there is a current state.
      fromCurrentState = this.get('currentStates')[0];
    }
        
    if (trace) {
      SC.Logger.debugGroup("gotoState: %@", state);
      SC.Logger.debug("starting from current state: %@", fromCurrentState);
      SC.Logger.debug("current states before: %@", this.get('currentStates'));
    }

    // If there is a current state to start the transition process from, then determine what
    // states are to be exited
    if (!SC.none(fromCurrentState)) {
      exitStates = this._createStateChain(fromCurrentState);
    }
    
    // Now determine the initial states to be entered
    enterStates = this._createStateChain(state);
    
    // Get the pivot state to indicate when to go from exiting states to entering states
    pivotState = this._findPivotState(exitStates, enterStates);

    if (pivotState) {
      if (trace) SC.Logger.debug("pivot state = %@", pivotState);
      if (pivotState.get('substatesAreConcurrent')) {
        SC.Logger.error("Cannot go to state %@. Pivot state %@ has concurrent substates.", state, pivotState);
        this._gotoStateLocked = NO;
        return;
      }
    }
    
    // Collect what actions to perform for the state transition process
    var gotoStateActions = [];
    
    // Go ahead and find states that are to be exited
    this._traverseStatesToExit(exitStates.shift(), exitStates, pivotState, gotoStateActions);
    
    // Now go find states that are to entered
    if (pivotState !== state) {
      this._traverseStatesToEnter(enterStates.pop(), enterStates, pivotState, useHistory, gotoStateActions);
    } else {
      this._traverseStatesToExit(pivotState, [], null, gotoStateActions);
      this._traverseStatesToEnter(pivotState, null, null, useHistory, gotoStateActions);
    }
    
    // Collected all the state transition actions to be performed. Now execute them.
    this._executeGotoStateActions(state, gotoStateActions, context);
  },
  
  /**
    Indicates if the statechart is in an active goto state process
  */
  gotoStateActive: function() {
    return this._gotoStateLocked;
  }.property(),
  
  /**
    Indicates if the statechart is in an active goto state process
    that has been suspended
  */
  gotoStateSuspended: function() {
    return this._gotoStateLocked && !!this._gotoStateSuspendedPoint;
  }.property(),
  
  /**
    Resumes an active goto state transition process that has been suspended.
  */
  resumeGotoState: function() {
    if (!this.get('gotoStateSuspended')) {
      SC.Logger.error("Cannot resume goto state since it has not been suspended");
      return;
    }
    
    var point = this._gotoStateSuspendedPoint;
    this._executeGotoStateActions(point.gotoState, point.actions, point.context, point.marker);
  },
  
  /** @private */
  _executeGotoStateActions: function(gotoState, actions, context, marker) {
    var action = null,
        len = actions.length,
        actionResult = null;
      
    marker = SC.none(marker) ? 0 : marker;
    
    for (; marker < len; marker += 1) {
      action = actions[marker];
      switch (action.action) {
        case SC.EXIT_STATE:
          actionResult = this._exitState(action.state);
          break;
          
        case SC.ENTER_STATE:
          actionResult = this._enterState(action.state, action.currentState, context);
          break;
      }
      
      //
      // Check if the state wants to perform an asynchronous action during
      // the state transition process. If so, then we need to first
      // suspend the state transition process and then invoke the 
      // asynchronous action. Once called, it is then up to the state or something 
      // else to resume this statechart's state transition process by calling the
      // statechart's resumeGotoState method.
      //
      if (SC.kindOf(actionResult, SC.Async)) {
        this._gotoStateSuspendedPoint = {
          gotoState: gotoState,
          actions: actions,
          context: context,
          marker: marker + 1
        }; 
        
        actionResult.tryToPerform(action.state);
        return;
      }
    }
    
    this.notifyPropertyChange('currentStates');
    
    if (this.get('trace')) {
      SC.Logger.debug("current states after: %@", this.get('currentStates'));
      SC.Logger.debugGroupEnd("gotoState: %@", gotoState);
    }
    
    // Okay. We're done with the current state transition. Make sure to unlock the
    // gotoState and let other pending state transitions execute.
    this._gotoStateSuspendedPoint = null;
    this._gotoStateLocked = NO;
    this._flushPendingStateTransition();
  },
  
  /** @private */
  _exitState: function(state) {
    if (state.get('currentSubstates').indexOf(state) >= 0) {  
      var parentState = state.get('parentState');
      while (parentState) {
        parentState.get('currentSubstates').removeObject(state);
        parentState = parentState.get('parentState');
      }
    }
      
    if (this.get('trace')) SC.Logger.debug("exiting state: %@", state);
    
    state.set('currentSubstates', []);
    state.notifyPropertyChange('isCurrentState');
    var result = this.exitState(state);
    
    if (this.get('monitorIsActive')) this.get('monitor').pushExitedState(state);
    
    state._traverseStatesToExit_skipState = NO;
    
    return result;
  },
  
  exitState: function(state) {
    return state.exitState();
  },
  
  /** @private */
  _enterState: function(state, current, context) {
    var parentState = state.get('parentState');
    if (parentState && !state.get('isConcurrentState')) parentState.set('historyState', state);
    
    if (current) {
      parentState = state;
      while (parentState) {
        parentState.get('currentSubstates').push(state);
        parentState = parentState.get('parentState');
      }
    }
    
    if (this.get('trace')) SC.Logger.debug("entering state: %@", state);
    
    state.notifyPropertyChange('isCurrentState');
    var result = this.enterState(state, context);
    
    if (this.get('monitorIsActive')) this.get('monitor').pushEnteredState(state);
    
    return result;
  },
  
  enterState: function(state, context) {
    return state.enterState(context);
  },
  
  /**
    When called, the statechart will proceed to make transitions to the given state then follow that
    state's history state. 
    
    You can either go to a given state's history recursively or non-recursively. To go to a state's history
    recursively means to following each history state's history state until no more history states can be
    followed. Non-recursively means to just to the given state's history state but do not recusively follow
    history states. If the given state does not have a history state, then the statechart will just follow
    normal procedures when making state transitions.
    
    Because a statechart can have one or more current states, depending on if the statechart has any concurrent
    states, it is optional to provided current state in which to start the state transition process from. If no
    current state is provided, then the statechart will default to the first current state that it has; which, 
    depending on the make up of that statechart, can lead to unexpected outcomes. For a statechart with concurrent
    states, it is best to explicitly supply a current state.
    
    @param state {SC.State|String} the state to go to and follow it's history state
    @param fromCurrentState {SC.State|String} Optional. the current state to start the state transition process from
    @param context any value to pass along to states that will be entered. can be null
    @param recursive {Boolean} Optional. whether to follow history states recursively.
  */
  gotoHistoryState: function(state, fromCurrentState, context, recursive) {
    if (!this.get('statechartIsInitialized')) {
      SC.Logger.error("Cannot go to state %@'s history state. Statechart has not yet been initialized", state);
      return;
    }
    
    state = this.getState(state);
  
    if (!state) {
      SC.Logger.error("Cannot to goto state %@'s history state. Not a recognized state in statechart", state);
      return;
    }
    
    var historyState = state.get('historyState');
    
    if (!recursive) { 
      if (historyState) {
        this.gotoState(historyState, fromCurrentState, context);
      } else {
        this.gotoState(state, fromCurrentState, context);
      }
    } else {
      this.gotoState(state, fromCurrentState, context, YES);
    }
  },
  
  /**
    Sends a given event to all the statechart's current states.
    
    If a current state does can not respond to the sent event, then the current state's parent state
    will be tried. This process is recursively done until no more parent state can be tried.
    
    @param event {String} name of the event
    @param sender {Object} Optional. object sending the event
    @param context {Object} Optional. additional information to pass along
    @returns {SC.Responder} the responder that handled it or null
  */
  sendEvent: function(event, sender, context) {
    var eventHandled = NO,
        currentStates = this.get('currentStates').slice(),
        len = 0,
        i = 0,
        responder = null;
    
    if (this._sendEventLocked || this._goStateLocked) {
      // Want to prevent any actions from being processed by the states until 
      // they have had a chance to handle the most immediate action or completed 
      // a state transition
      this._pendingSentEvents.push({
        event: event,
        sender: sender,
        context: context
      });

      return;
    }
    
    this._sendEventLocked = YES;
    
    len = currentStates.get('length');
    for (; i < len; i += 1) {
      eventHandled = NO;
      responder = currentStates[i];
      if (!responder.get('isCurrentState')) continue;
      while (!eventHandled && responder) {
        if (responder.tryToPerform) {
          eventHandled = responder.tryToHandleEvent(event, sender, context);
        }
        if (!eventHandled) responder = responder.get('parentState');
      }
    }
    
    // Now that all the states have had a chance to process the 
    // first event, we can go ahead and flush any pending sent events.
    this._sendEventLocked = NO;
    this._flushPendingSentEvents();
    
    return responder ;
  },

  /** @private
  
    Creates a chain of states from the given state to the greatest ancestor state (the root state). Used
    when perform state transitions.
  */
  _createStateChain: function(state) {
    var chain = [];
    
    while (state) {
      chain.push(state);
      state = state.get('parentState');
    }
    
    return chain;
  },
  
  /** @private
  
    Finds a pivot state from two given state chains. The pivot state is the state indicating when states
    go from being exited to states being entered during the state transition process. The value 
    returned is the fist matching state between the two given state chains. 
  */
  _findPivotState: function(stateChain1, stateChain2) {
    if (stateChain1.length === 0 || stateChain2.length === 0) return null;
    
    var pivot = stateChain1.find(function(state, index) {
      if (stateChain2.indexOf(state) >= 0) return YES;
    });
    
    return pivot;
  },
  
  /** @private
    
    Recursively follow states that are to be exited during a state transition process. The exit
    process is to start from the given state and work its way up to when either all exit
    states have been reached based on a given exit path or when a stop state has been reached.
    
    @param state {State} the state to be exited
    @param exitStatePath {Array} an array representing a path of states that are to be exited
    @param stopState {State} an explicit state in which to stop the exiting process
  */
  _traverseStatesToExit: function(state, exitStatePath, stopState, gotoStateActions) {    
    if (!state || state === stopState) return;
    
    var trace = this.get('trace');
    
    // This state has concurrent substates. Therefore we have to make sure we
    // exit them up to this state before we can go any further up the exit chain.
    if (state.get('substatesAreConcurrent')) {
      var i = 0,
          currentSubstates = state.get('currentSubstates'),
          len = currentSubstates.length,
          currentState = null;
      
      for (; i < len; i += 1) {
        currentState = currentSubstates[i];
        if (currentState._traverseStatesToExit_skipState === YES) continue;
        var chain = this._createStateChain(currentState);
        this._traverseStatesToExit(chain.shift(), chain, state, gotoStateActions);
      }
    }
    
    gotoStateActions.push({ action: SC.EXIT_STATE, state: state });
    if (state.get('isCurrentState')) state._traverseStatesToExit_skipState = YES;
    this._traverseStatesToExit(exitStatePath.shift(), exitStatePath, stopState, gotoStateActions);
  },
  
  /** @private
  
    Recursively follow states that are to be entred during the state transition process. The
    enter process is to start from the given state and work its way down a given enter path. When
    the end of enter path has been reached, then continue entering states based on whether 
    an initial substate is defined, there are concurrent substates or history states are to be
    followed; when none of those condition are met then the enter process is done.
    
    @param state {State} the sate to be entered
    @param enterStatePath {Array} an array representing an initial path of states that are to be entered
    @param pivotState {State} The state pivoting when to go from exiting states to entering states
    @param useHistory {Boolean} indicates whether to recursively follow history states 
  */
  _traverseStatesToEnter: function(state, enterStatePath, pivotState, useHistory, gotoStateActions) {
    if (!state) return;
    
    var trace = this.get('trace');
    
    // We do not want to enter states in the enter path until the pivot state has been reached. After
    // the pivot state has been reached, then we can go ahead and actually enter states.
    if (pivotState) {
      if (state !== pivotState) {
        this._traverseStatesToEnter(enterStatePath.pop(), enterStatePath, pivotState, useHistory, gotoStateActions);
      } else {
        this._traverseStatesToEnter(enterStatePath.pop(), enterStatePath, null, useHistory, gotoStateActions);
      }
    }
    
    // If no more explicit enter path instructions, then default to enter states based on 
    // other criteria
    else if (!enterStatePath || enterStatePath.length === 0) {
      var gotoStateAction = { action: SC.ENTER_STATE, state: state, currentState: NO };
      gotoStateActions.push(gotoStateAction);
      
      var initialSubstate = state.get('initialSubstate'),
          historyState = state.get('historyState');
      
      // State has concurrent substates. Need to enter all of the substates
      if (state.get('substatesAreConcurrent')) {
        this._traverseConcurrentStatesToEnter(state.get('substates'), null, useHistory, gotoStateActions);
      }
      
      // State has substates and we are instructed to recursively follow the state's
      // history state if it has one.
      else if (state.get('hasSubstates') && historyState && useHistory) {
        this._traverseStatesToEnter(historyState, null, null, useHistory, gotoStateActions);
      }
      
      // State has an initial substate to enter
      else if (initialSubstate) {
        this._traverseStatesToEnter(initialSubstate, null, null, useHistory, gotoStateActions);  
      } 
      
      // Looks like we hit the end of the road. Therefore the state has now become
      // a current state of the statechart.
      else {
        gotoStateAction.currentState = YES;
      }
    }
    
    // Still have an explicit enter path to follow, so keep moving through the path.
    else if (enterStatePath.length > 0) {
      gotoStateActions.push({ action: SC.ENTER_STATE, state: state });
      var nextState = enterStatePath.pop();
      this._traverseStatesToEnter(nextState, enterStatePath, null, useHistory, gotoStateActions); 
      
      // We hit a state that has concurrent substates. Must go through each of the substates
      // and enter them
      if (state.get('substatesAreConcurrent')) {
        this._traverseConcurrentStatesToEnter(state.get('substates'), nextState, useHistory, gotoStateActions);
      }
    }
  },
  
  /** @private
  
    Iterate over all the given concurrent states and enter them
  */
  _traverseConcurrentStatesToEnter: function(states, exclude, useHistory, gotoStateActions) {
    var i = 0,
        len = states.length,
        state = null;
    
    for (; i < len; i += 1) {
      state = states[i];
      if (state !== exclude) this._traverseStatesToEnter(state, null, null, useHistory, gotoStateActions);
    }
  },
  
  /** @private
  
    Called by gotoState to flush a pending state transition at the front of the 
    pending queue.
  */
  _flushPendingStateTransition: function() {
    var pending = this._pendingStateTransitions.shift();
    if (!pending) return;
    this.gotoState(pending.state, pending.fromCurrentState, pending.context, pending.useHistory);
  },
  
  /** @private

     Called by sendEvent to flush a pending actions at the front of the pending
     queue
   */
  _flushPendingSentEvents: function() {
    var pending = this._pendingSentEvents.shift();
    if (!pending) return;
    this.sendEvent(pending.event, pending.sender, pending.context);
  },
  
  _monitorIsActiveDidChange: function() {
    if (this.get('monitorIsActive') && SC.none(this.get('monitor'))) {
      this.set('monitor', SC.StatechartMonitor.create());
    }
  }.observes('monitorIsActive')
  
};

/** 
  The default name given to a statechart's root state
*/
SC.ROOT_STATE_NAME = "__ROOT_STATE__";

/**
  Constants used during the state transition process
*/
SC.EXIT_STATE = 0;
SC.ENTER_STATE = 1;

/**
  A Startchart class. 
*/
SC.Statechart = SC.Object.extend(SC.StatechartManager);

/**
  Represents a call that is intended to be asynchronous. This is
  used during a state transition process when either entering or
  exiting a state.
*/
SC.Async = SC.Object.extend({
  
  func: null,
  
  arg1: null,
  
  arg2: null,
  
  /** @private
    Called by the statechart
  */
  tryToPerform: function(state) {
    var func = this.get('func'),
        arg1 = this.get('arg1'),
        arg2 = this.get('arg2'),
        funcType = SC.typeOf(func);
      
    if (funcType === SC.T_STRING) {
      state.tryToPerform(func, arg1, arg2);
    } 
    else if (funcType === SC.T_FUNCTION) {
      func.apply(state, [arg1, arg2]);
    }
  }
  
});

/**
  Singleton
*/
SC.Async.mixin({
  
  /**
    Call in either a state's enterState or exitState method when you
    want a state to perform an asynchronous action, such as an animation.
    
    Examples:
    
    {{
    
      SC.State.extend({
    
        enterState: function() {
          return SC.Async.perform('foo');
        },
      
        exitState: function() {
          return SC.Async.perform('bar', 100);
        }
      
        foo: function() { ... },
      
        bar: function(arg) { ... }
    
      });
    
    }}
    
    @param func {String|Function} the functio to be invoked on a state
    @param arg1 Optional. An argument to pass to the given function
    @param arg2 Optional. An argument to pass to the given function
    @return {SC.Async} a new instance of a SC.Async
  */
  perform: function(func, arg1, arg2) {
    return SC.Async.create({ func: func, arg1: arg1, arg2: arg2 });
  }
  
});