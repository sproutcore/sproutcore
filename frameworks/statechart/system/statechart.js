// ==========================================================================
// Project:   SC.Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global SC */

sc_require('system/state');
sc_require('mixins/statechart_delegate');

/**
  @class

  The startchart manager mixin allows an object to be a statechart. By becoming a statechart, the
  object can then be manage a set of its own states.

  This implementation of the statechart manager closely follows the concepts stated in D. Harel's
  original paper "Statecharts: A Visual Formalism For Complex Systems"
  (www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.pdf).

  The statechart allows for complex state heircharies by nesting states within states, and
  allows for state orthogonality based on the use of concurrent states.

  At minimum, a statechart must have one state: The root state. All other states in the statechart
  are a decendents (substates) of the root state.

  The following example shows how states are nested within a statechart:

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
      });

  Note how in the example above, the root state as an explicit initial substate to enter into. If no
  initial substate is provided, then the statechart will default to the the state's first substate.

  You can also defined states without explicitly defining the root state. To do so, simply create properties
  on your object that represents states. Upon initialization, a root state will be constructed automatically
  by the mixin and make the states on the object substates of the root state. As an example:

      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
        initialState: 'stateA',

        stateA: SC.State.design({
          // ... can continue to nest further states
        }),

        stateB: SC.State.design({
          // ... can continue to nest further states
        })
      });

  If you liked to specify a class that should be used as the root state but using the above method to defined
  states, you can set the rootStateExample property with a class that extends from SC.State. If the
  rootStateExample property is not explicitly assigned the then default class used will be SC.State.

  To provide your statechart with orthogonality, you use concurrent states. If you use concurrent states,
  then your statechart will have multiple current states. That is because each concurrent state represents an
  independent state structure from other concurrent states. The following example shows how to provide your
  statechart with concurrent states:

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
      });

  Above, to indicate that a state's substates are concurrent, you just have to set the substatesAreConcurrent to
  YES. Once done, then stateA and stateB will be independent of each other and each will manage their
  own current substates. The root state will then have more then one current substate.

  To define concurrent states directly on the object without explicitly defining a root, you can do the
  following:

      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
        statesAreConcurrent: YES,

        stateA: SC.State.design({
          // ... can continue to nest further states
        }),

        stateB: SC.State.design({
          // ... can continue to nest further states
        })
      });

  Remember that a startchart can have a mixture of nested and concurrent states in order for you to
  create as complex of statecharts that suite your needs. Here is an example of a mixed state structure:

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
            stateY: SC.State.design({ ... })
          })
        })
      });

  Depending on your needs, a statechart can have lots of states, which can become hard to manage all within
  one file. To modularize your states and make them easier to manage and maintain, you can plug-in states
  into other states. Let's say we are using the statechart in the last example above, and all the code is
  within one file. We could update the code and split the logic across two or more files like so:

      // state_a.js

      MyApp.StateA = SC.State.extend({
        substatesAreConcurrent: YES,

        stateM: SC.State.design({ ... })
        stateN: SC.State.design({ ... })
        stateO: SC.State.design({ ... })
      });

      // state_b.js

      MyApp.StateB = SC.State.extend({
        substatesAreConcurrent: YES,

        stateM: SC.State.design({ ... })
        stateN: SC.State.design({ ... })
        stateO: SC.State.design({ ... })
      });

      // statechart.js

      MyApp.Statechart = SC.Object.extend(SC.StatechartManager, {
        rootState: SC.State.design({
          initialSubstate: 'stateA',
          stateA: SC.State.plugin('MyApp.StateA'),
          stateB: SC.State.plugin('MyApp.StateB')
        })
      });

  Using state plug-in functionality is optional. If you use the plug-in feature you can break up your statechart
  into as many files as you see fit.

  @author Michael Cohen
*/
SC.StatechartManager = SC.clone(SC.CoreStatechartManager);

SC.mixin(SC.StatechartManager,
  /** @scope SC.StatechartManager.prototype */ {

  /**
    A statechart delegate used by the statechart and the states that the statechart
    manages. The value assigned must adhere to the {@link SC.StatechartDelegate} mixin.

    @type SC.Object

    @see SC.StatechartDelegate
  */
  delegate: null,

  /**
    Represents the class used to construct a class that will be the root state for
    this statechart. The class assigned must derive from SC.State.

    This property will only be used if the rootState property is not assigned.

    @see #rootState

    @property {SC.CoreState}
  */
  rootStateExample: SC.State,

  /**
    Computed property that returns an objects that adheres to the
    {@link SC.StatechartDelegate} mixin. If the {@link #delegate} is not
    assigned then this object is the default value returned.

    @see SC.StatechartDelegate
    @see #delegate
  */
  statechartDelegate: function () {
    var del = this.get('delegate');
    return this.delegateFor('isStatechartDelegate', del);
  }.property('delegate'),

  /**
    Returns the count of the current states for this statechart

    @returns {Number} the count
  */
  currentStateCount: function () {
    return this.getPath('currentStates.length');
  }.property('currentStates').cacheable(),

  /**
    Checks if a given state is a current state of this statechart.

    @param state {State|String} the state to check
    @returns {Boolean} true if the state is a current state, otherwise fals is returned
  */
  stateIsCurrentState: function (state) {
    return this.get('rootState').stateIsCurrentSubstate(state);
  },

  /**
    Returns an array of all the states that are currently entered for
    this statechart.

    @returns {Array} the currently entered states
  */
  enteredStates: function () {
    return this.getPath('rootState.enteredSubstates');
  }.property().cacheable(),

  /**
    Checks if a given state is a currently entered state of this statechart.

    @param state {State|String} the state to check
    @returns {Boolean} true if the state is a currently entered state, otherwise false is returned
  */
  stateIsEntered: function (state) {
    return this.get('rootState').stateIsEnteredSubstate(state);
  },

  /**
    Checks if the given value represents a state is this statechart

    @param value {State|String} either a state object or the name of a state
    @returns {Boolean} true if the state does belong ot the statechart, otherwise false is returned
  */
  doesContainState: function (value) {
    return !SC.none(this.getState(value));
  },

  /**
    Indicates if the statechart is in an active goto state process
  */
  gotoStateActive: function () {
    return this._gotoStateLocked;
  }.property(),

  /**
    Indicates if the statechart is in an active goto state process
    that has been suspended
  */
  gotoStateSuspended: function () {
    return this._gotoStateLocked && !!this._gotoStateSuspendedPoint;
  }.property(),

  /**
    Resumes an active goto state transition process that has been suspended.
  */
  resumeGotoState: function () {
    if (!this.get('gotoStateSuspended')) {
      this.statechartLogError("Can not resume goto state since it has not been suspended");
      return;
    }

    var point = this._gotoStateSuspendedPoint;
    this._executeGotoStateActions(point.gotoState, point.actions, point.marker, point.context);
  },

  /** @private */
  _executeGotoStateActions: function (gotoState, actions, marker, context) {
    var action = null,
        len = actions.length,
        actionResult = null;

    marker = SC.none(marker) ? 0 : marker;

    for (; marker < len; marker += 1) {
      this._currentGotoStateAction = action = actions[marker];
      switch (action.action) {
      case SC.EXIT_STATE:
        actionResult = this._exitState(action.state, context);
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
          marker: marker + 1,
          context: context
        };

        actionResult.tryToPerform(action.state);
        return;
      }
    }

    this.beginPropertyChanges();
    this.notifyPropertyChange('currentStates');
    this.notifyPropertyChange('enteredStates');
    this.endPropertyChanges();

    //@if(debug)
    if (this.get('allowStatechartTracing')) {
      if (this.getPath('currentStates.length') > 2) {
        this.statechartLogTrace("  current states after:\n%@".fmt(this.get('currentStates').getEach('fullPath').join('  \n')), SC.TRACE_STATECHART_STYLE.gotoStateInfo);
      } else {
        this.statechartLogTrace("  current states after: %@".fmt(this.get('currentStates').getEach('fullPath').join(', ')), SC.TRACE_STATECHART_STYLE.gotoStateInfo);
    }
      this.statechartLogTrace("END gotoState: %@".fmt(gotoState), SC.TRACE_STATECHART_STYLE.gotoState);
    }
    //@endif

    this._cleanupStateTransition();
  },

  /** @private */
  _cleanupStateTransition: function () {
    this._currentGotoStateAction = null;
    this._gotoStateSuspendedPoint = null;
    this._gotoStateActions = null;
    this._gotoStateLocked = NO;
    this._flushPendingStateTransition();
    // Check the flags so we only flush if the events will actually get sent.
    if (!this._sendEventLocked && !this._gotoStateLocked) { this._flushPendingSentEvents(); }
  },

  /**
    What will actually invoke a state's enterState method.

    Called during the state transition process whenever the gotoState method is
    invoked.

    If the context provided is a state route context object
    ({@link SC.StateRouteContext}), then if the given state has a enterStateByRoute
    method, that method will be invoked, otherwise the state's enterState method
    will be invoked by default. The state route context object will be supplied to
    both enter methods in either case.

    @param state {SC.State} the state whose enterState method is to be invoked
    @param context {Hash} a context hash object to provide the enterState method
  */
  enterState: function (state, context) {
    if (state.enterStateByRoute && SC.kindOf(context, SC.StateRouteHandlerContext)) {
      return state.enterStateByRoute(context);
    } else {
      return state.enterState(context);
    }
  }

});

SC.mixin(SC.StatechartManager, SC.StatechartDelegate, SC.DelegateSupport);

/**
  A Statechart class.
*/
SC.Statechart = SC.Object.extend(SC.StatechartManager, {
  autoInitStatechart: NO
});

SC.Statechart.design = SC.Statechart.extend;
