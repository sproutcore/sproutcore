// ==========================================================================
// Project:   SC.AppStatechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC */

/**
  @class

  Represents a substate within a statechart.

  The statechart actively manages all substates belonging to it. When a substate
  is created, it immediately registers itself with it parent substates.

  You do not create an instance of a substate itself. The statechart manager will
  go through its state heirarchy and create the substates itself.

  For more information on using statecharts, see SC.AppStatechartManager.

  @author Michael Cohen
  @extends SC.Object
*/
SC.AppSubstate = SC.Substate.extend(
  /** @lends SC.AppSubstate.prototype */ {

  // -----------------------------------------------------------------------
  // Properties
  //

  /** @private */
  _sc_ancestorPaneInstance: function () {
    var parentState = this,
      pane;

    // Find the first ancestral pane.
    while ((parentState = parentState.get('parentState')) !== null && SC.none((pane = parentState.get('pane')))) {}

    if (pane) {
      pane = SC.objectForPropertyPath(pane);
    }

    return pane;
  }.property('pane').cacheable(),

  /** @private */
  _sc_paneInstance: function () {
    var pane = this.get('pane');

    if (pane) {
      pane = SC.objectForPropertyPath(pane);
    }

    return pane;
  }.property('pane').cacheable(),

  /**
    A volatile property used to get and set the app's current location.

    This computed property defers to the the statechart's delegate to
    actually update and acquire the app's location.

    Note: Binding for this particular case is discouraged since in most
    cases we need the location value immediately. If we were to use
    bindings then the location value wouldn't be updated until at least
    the end of one run loop. It is also advised that the delegate not
    have its `statechartUpdateLocationForState` and
    `statechartAcquireLocationForState` methods implemented where bindings
    are used since they will inadvertenly stall the location value from
    propogating immediately.

    @type String

    @see SC.StatechartDelegate#statechartUpdateLocationForState
    @see SC.StatechartDelegate#statechartAcquireLocationForState
  */
  location: function (key, value) {
    var sc = this.get('statechart'),
        del = this.get('statechartDelegate');

    if (value !== undefined) {
      del.statechartUpdateLocationForState(sc, value, this);
    }

    return del.statechartAcquireLocationForState(sc, this);
  }.property().idempotent(),

  /**
    @type String
    */
  pane: null,

  /**
    @type Object
    */
  paneConfig: null,

  /**
    @type Object
    */
  paneUnconfig: null,

  /**
    Can optionally assign what route this state is to represent.

    If assigned then this state will be notified to handle the route when triggered
    any time the app's location changes and matches this state's assigned route.
    The handler invoked is this state's {@link #routeTriggered} method.

    The value assigned to this property is dependent on the underlying routing
    mechanism used by the application. The default routing mechanism is to use
    SC.routes.

    @property {String|Hash}

    @see #routeTriggered
    @see #location
    @see SC.StatechartDelegate
  */
  representRoute: null,

  /**
    Returns the statechart's assigned delegate. A statechart delegate is one
    that adheres to the {@link SC.StatechartDelegate} mixin.

    @type SC.Object

    @see SC.StatechartDelegate
  */
  statechartDelegate: function () {
    return this.getPath('statechart.statechartDelegate');
  }.property().cacheable(),

  // -----------------------------------------------------------------------
  // Methods
  //

  /** @private

    Used to bind this state with a route this state is to represent if a route has been assigned.

    When invoked, the method will delegate the actual binding strategy to the statechart delegate
    via the delegate's {@link SC.StatechartDelegate#statechartBindStateToRoute} method.

    Note that a state cannot be bound to a route if this state is a concurrent state.

    @see #representRoute
    @see SC.StatechartDelegate#statechartBindStateToRoute
  */
  _setupRouteHandling: function () {
    var route = this.get('representRoute'),
        sc = this.get('statechart'),
        del = this.get('statechartDelegate');

    if (SC.none(route)) return;

    if (this.get('isConcurrentState')) {
      this.stateLogError("State %@ cannot handle route '%@' since state is concurrent".fmt(this, route));
      return;
    }

    del.statechartBindStateToRoute(sc, this, route, this.routeTriggered);
  },

  /**

  */
  canBeEnteredByRoute: function (routeContext) {
    return true;
  },

  /**
    Constructs a new instance of a state routing context object.

    @param {Hash} attr attributes to apply to the constructed object
    @return {SC.StateRouteContext}

    @see #handleRoute
  */
  createStateRouteHandlerContext: function (attr) {
    return SC.AppSubstateRouteHandlerContext.create(attr);
  },

  /**
    Invoked by this state's {@link #routeTriggered} method if the state is
    actually allowed to handle the triggered route.

    By default the method invokes a state transition to this state.
  */
  handleTriggeredRoute: function (context) {
    this.gotoState(this, context);
  },

  /**
    Used to initialize this state. To only be called by the owning statechart.
  */
  initState: function () {
    // Set up the route handling.
    this._setupRouteHandling();

    sc_super();
  },

  /**
    Main handler that gets triggered whenever the app's location matches this state's assigned
    route.

    When invoked the handler will first refer to the statechart delegate to determine if it
    should actually handle the route via the delegate's
    {@see SC.StatechartDelegate#statechartShouldStateHandleTriggeredRoute} method. If the
    delegate allows the handling of the route then the state will continue on with handling
    the triggered route by calling the state's {@link #handleTriggeredRoute} method, otherwise
    the state will cancel the handling and inform the delegate through the delegate's
    {@see SC.StatechartDelegate#statechartStateCancelledHandlingRoute} method.

    The handler will create a state route context ({@link SC.StateRouteContext}) object
    that packages information about what is being currently handled. This context object gets
    passed along to the delegate's invoked methods as well as the state transition process.

    Note that this method is not intended to be directly called or overridden.

    @see #representRoute
    @see SC.StatechartDelegate#statechartShouldStateHandleRoute
    @see SC.StatechartDelegate#statechartStateCancelledHandlingRoute
    @see #createStateRouteHandlerContext
    @see #handleTriggeredRoute
  */
  routeTriggered: function (params) {
    if (this._isEnteringState) return;

    var sc = this.get('statechart'),
        del = this.get('statechartDelegate'),
        loc = this.get('location');

    var attr = {
      state: this,
      location: loc,
      params: params,
      handler: this.routeTriggered
    };

    var context = this.createStateRouteHandlerContext(attr);

    if (del.statechartShouldStateHandleTriggeredRoute(sc, this, context)) {
      //@if(debug)
      if (this.get('trace') && loc) {
        this.stateLogTrace("will handle route '%@'".fmt(loc), SC.TRACE_STATECHART_STYLE.route);
      }
      //@endif
      this.handleTriggeredRoute(context);
    } else {
      del.statechartStateCancelledHandlingTriggeredRoute(sc, this, context);
    }
  },

  stateWillBecomeEntered: function (context) {
    sc_super();

    var pane = this.get('_sc_paneInstance');

    if (pane) {
      pane.append();
    } else {
      pane = this.get('_sc_ancestorPaneInstance');
    }

    if (pane) {
      var paneConfig = this.get('paneConfig');
      if (paneConfig) {
        pane.set(paneConfig);
      }
    }
  },

  stateDidBecomeExited: function () {
    sc_super();

    var pane = this.get('_sc_paneInstance');

    if (pane) {
      pane.remove();
    } else {
      pane = this.get('_sc_ancestorPaneInstance');
    }

    if (pane) {
      var paneUnconfig = this.get('paneUnconfig');
      if (paneUnconfig) {
        pane.set(paneUnconfig);
      }
    }
  }

});

