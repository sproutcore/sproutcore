// ==========================================================================
// Project:   SC.AppStatechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global SC */
sc_require('system/app_substate');
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

      MyApp.Statechart = SC.Object.extend(SC.AppStatechartManager, {
        rootSubstate: SC.AppSubstate.design({
          initialSubstate: 'stateA',

          stateA: SC.AppSubstate.design({
            // ... can continue to nest further states
          }),

          stateB: SC.AppSubstate.design({
            // ... can continue to nest further states
          })
        })
      });

  Note how in the example above, the root state as an explicit initial substate to enter into. If no
  initial substate is provided, then the statechart will default to the the state's first substate.

  You can also defined states without explicitly defining the root state. To do so, simply create properties
  on your object that represents states. Upon initialization, a root state will be constructed automatically
  by the mixin and make the states on the object substates of the root state. As an example:

      MyApp.Statechart = SC.Object.extend(SC.AppStatechartManager, {
        initialState: 'stateA',

        stateA: SC.AppSubstate.design({
          // ... can continue to nest further states
        }),

        stateB: SC.AppSubstate.design({
          // ... can continue to nest further states
        })
      });

  If you liked to specify a class that should be used as the root state but using the above method to defined
  states, you can set the rootSubstateExample property with a class that extends from SC.AppSubstate. If the
  rootSubstateExample property is not explicitly assigned the then default class used will be SC.AppSubstate.

  To provide your statechart with orthogonality, you use concurrent states. If you use concurrent states,
  then your statechart will have multiple current states. That is because each concurrent state represents an
  independent state structure from other concurrent states. The following example shows how to provide your
  statechart with concurrent states:

      MyApp.Statechart = SC.Object.extend(SC.AppStatechartManager, {
        rootSubstate: SC.AppSubstate.design({
          substatesAreConcurrent: YES,

          stateA: SC.AppSubstate.design({
            // ... can continue to nest further states
          }),

          stateB: SC.AppSubstate.design({
            // ... can continue to nest further states
          })
        })
      });

  Above, to indicate that a state's substates are concurrent, you just have to set the substatesAreConcurrent to
  YES. Once done, then stateA and stateB will be independent of each other and each will manage their
  own current substates. The root state will then have more then one current substate.

  To define concurrent states directly on the object without explicitly defining a root, you can do the
  following:

      MyApp.Statechart = SC.Object.extend(SC.AppStatechartManager, {
        statesAreConcurrent: YES,

        stateA: SC.AppSubstate.design({
          // ... can continue to nest further states
        }),

        stateB: SC.AppSubstate.design({
          // ... can continue to nest further states
        })
      });

  Remember that a startchart can have a mixture of nested and concurrent states in order for you to
  create as complex of statecharts that suite your needs. Here is an example of a mixed state structure:

      MyApp.Statechart = SC.Object.extend(SC.AppStatechartManager, {
        rootSubstate: SC.AppSubstate.design({
          initialSubstate: 'stateA',

          stateA: SC.AppSubstate.design({
            substatesAreConcurrent: YES,

            stateM: SC.AppSubstate.design({ ... })
            stateN: SC.AppSubstate.design({ ... })
            stateO: SC.AppSubstate.design({ ... })
          }),

          stateB: SC.AppSubstate.design({
            initialSubstate: 'stateX',

            stateX: SC.AppSubstate.design({ ... })
            stateY: SC.AppSubstate.design({ ... })
          })
        })
      });

  Depending on your needs, a statechart can have lots of states, which can become hard to manage all within
  one file. To modularize your states and make them easier to manage and maintain, you can plug-in states
  into other states. Let's say we are using the statechart in the last example above, and all the code is
  within one file. We could update the code and split the logic across two or more files like so:

      // state_a.js

      MyApp.StateA = SC.AppSubstate.extend({
        substatesAreConcurrent: YES,

        stateM: SC.AppSubstate.design({ ... })
        stateN: SC.AppSubstate.design({ ... })
        stateO: SC.AppSubstate.design({ ... })
      });

      // state_b.js

      MyApp.StateB = SC.AppSubstate.extend({
        substatesAreConcurrent: YES,

        stateM: SC.AppSubstate.design({ ... })
        stateN: SC.AppSubstate.design({ ... })
        stateO: SC.AppSubstate.design({ ... })
      });

      // statechart.js

      MyApp.Statechart = SC.Object.extend(SC.AppStatechartManager, {
        rootSubstate: SC.AppSubstate.design({
          initialSubstate: 'stateA',
          stateA: SC.AppSubstate.plugin('MyApp.StateA'),
          stateB: SC.AppSubstate.plugin('MyApp.StateB')
        })
      });

  Using state plug-in functionality is optional. If you use the plug-in feature you can break up your statechart
  into as many files as you see fit.

  @author Michael Cohen
*/
SC.AppStatechartManager = SC.clone(SC.StatechartManager);

SC.mixin(SC.AppStatechartManager,
  /** @scope SC.AppStatechartManager.prototype */ {

  /**
    A statechart delegate used by the statechart and the states that the statechart
    manages. The value assigned must adhere to the {@link SC.AppStatechartDelegate} mixin.

    @type SC.Object

    @see SC.AppStatechartDelegate
  */
  delegate: null,

  /**
    Represents the class used to construct a class that will be the root state for
    this statechart. The class assigned must derive from SC.AppSubstate.

    This property will only be used if the rootSubstate property is not assigned.

    @see #rootSubstate

    @property {SC.AppSubstate}
  */
  rootSubstateExample: SC.AppSubstate,

  /**
    Computed property that returns an objects that adheres to the
    {@link SC.AppStatechartDelegate} mixin. If the {@link #delegate} is not
    assigned then this object is the default value returned.

    @see SC.AppStatechartDelegate
    @see #delegate
  */
  statechartDelegate: function () {
    var del = this.get('delegate');
    return this.delegateFor('isStatechartDelegate', del);
  }.property('delegate'),

  canRouteToState: function (state, routeContext) {
    var isBlocked = false,
      substates, substate,
      isRecoverable,
      ret;

    // Test each substate for direct route-ability.
    state = this.getState(state);
    substates = this._createStateChain(state);
    for (var i = substates.length - 1; i >= 0; i--) {
      substate = substates[i];

      ret = substate.canBeEnteredByRoute(routeContext);
      // console.log('(%@).canBeEnteredByRoute(): %@'.fmt(substate, ret));

      // Stop as soon as we can't enter any one substate.
      if (!ret) {
        isBlocked = true;
        isRecoverable = false;
        break;

      // Stop as soon as we're paused at any one substate.
      } else if (ret === 'maybe') {
        isBlocked = true;
        isRecoverable = true;
        break;

      }
    }

    return { isBlocked: isBlocked, blockedSubstate: substate, isRecoverable: isRecoverable };
  },

  handleBlockedSubstate: function (blockedSubstate, isRecoverable, routeContext) {
    var substates;

    substates = this._createStateChain(blockedSubstate);
    for (var i = 0, len = substates.length; i < len; i++) {
      var substate = substates[i];

      if (substate.canHandleBlockedSubstate) {
        var ret = substate.canHandleBlockedSubstate(blockedSubstate, isRecoverable, routeContext);
        // console.log(' → (%@).canHandleBlockedSubstate(%@): %@'.fmt(substate, blockedSubstate, ret));
        if (ret) {
          break;
        }
      }
    }
  },

  /**
    What will actually invoke a state's enterState method.

    Called during the state transition process whenever the gotoState method is
    invoked.

    In the case that the context being supplied is a state context object
    ({@link SC.AppSubstateRouteHandlerContext}), an optional `enterStateByRoute` method can be invoked
    on this state if the state has implemented the method. If `enterStateByRoute` is
    not part of this state then the `enterState` method will be invoked by default. The
    `enterStateByRoute` is simply a convenience method that helps removes checks to
    determine if the context provide is a state route context object.

    @param state {SC.AppSubstate} the state whose enterState method is to be invoked
    @param context {Hash} a context hash object to provide the enterState method
  */
  enterState: function (state, context) {
    if (state.enterStateByRoute && SC.kindOf(context, SC.AppSubstateRouteHandlerContext)) {
      return state.enterStateByRoute(context);
    } else {
      return state.enterState(context);
    }
  }

});

SC.mixin(SC.AppStatechartManager, SC.AppStatechartDelegate, SC.DelegateSupport);

/**
  A Statechart class.
*/
SC.AppStatechart = SC.Object.extend(SC.AppStatechartManager, {
  autoInitStatechart: NO
});

SC.AppStatechart.design = SC.AppStatechart.extend;
