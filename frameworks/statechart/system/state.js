// ==========================================================================
// Project:   SC.Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC */

//@if(debug)
SC.TRACE_STATECHART_STYLE = {
  init: 'font-style: italic; font-weight: bold;', // Initialization
  action: 'color: #5922ab; font-style: italic; font-weight: bold;', // Actions and events
  actionInfo: 'color: #5922ab; font-style: italic;', // Actions and events
  route: 'color: #a67000; font-style: italic;', // Routing
  gotoState: 'color: #479a48; font-style: italic; font-weight: bold;', // Goto state
  gotoStateInfo: 'color: #479a48; font-style: italic;', // Goto state
  enter: 'color: #479a48; font-style: italic; font-weight: bold;', // Entering
  exit: 'color: #479a48; font-style: italic; font-weight: bold;' // Exiting
};
//@endif

/**
  @class

  Represents a substate within a statechart.

  The statechart actively manages all substates belonging to it. When a substate
  is created, it immediately registers itself with it parent substates.

  You do not create an instance of a substate itself. The statechart manager will
  go through its state heirarchy and create the substates itself.

  For more information on using statecharts, see SC.StatechartManager.

  @author Michael Cohen
  @extends SC.Object
*/
SC.State = SC.CoreState.extend(
  /** @lends SC.State.prototype */ {

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

  init: function () {
    sc_super();

    // Monitor the owner for changes.
    // Setting up observes this way is faster then using .observes,
    // which adds a noticable increase in initialization time.
    var sc = this.get('statechart'),
        ownerKey = sc ? sc.get('statechartOwnerKey') : null;

    if (sc) {
      sc.addObserver(ownerKey, this, '_statechartOwnerDidChange');

      //@if(debug)
      var traceKey = sc ? sc.get('statechartTraceKey') : null;
      sc.addObserver(traceKey, this, '_statechartTraceDidChange');
      //@endif
    }

    // Initiliaze internal state variables.
    this._registeredEventHandlers = {};
    this._registeredStringEventHandlers = {};
    this._registeredRegExpEventHandlers = [];
    this._registeredStateObserveHandlers = {};
    this._isEnteringState = NO;
    this._isExitingState = NO;
  },

  destroy: function () {
    var sc = this.get('statechart'),
        ownerKey = sc ? sc.get('statechartOwnerKey') : null;

    // Clean up monitoring on the owner for changes.
    if (sc) {
      sc.removeObserver(ownerKey, this, '_statechartOwnerDidChange');

      //@if(debug)
      var traceKey = sc ? sc.get('statechartTraceKey') : null;
      sc.removeObserver(traceKey, this, '_statechartTraceDidChange');
      //@endif
    }
    this.notifyPropertyChange('owner');

    // Clean up all state observers.
    this._teardownAllStateObserveHandlers();

    // Clean up internal caches.
    this._registeredEventHandlers = null;
    this._registeredStateObserveHandlers = null;
    this._registeredStringEventHandlers = null;
    this._registeredRegExpEventHandlers = null;

    sc_super();
  },

  /**
    Used to initialize this state. To only be called by the owning statechart.
  */
  initState: function () {
    var key, value,
      valueIsFunc;

    // Turn on route handling.
    this._setupRouteHandling();

    // Initialize helper extensions. Do this before calling
    // superclass method so that all statePlugins are applied.
    for (key in this) {
      value = this[key];
      valueIsFunc = SC.typeOf(value) === SC.T_FUNCTION;

      if (valueIsFunc && value.isEventHandler) {
        this._registerEventHandler(key, value);
        continue;
      }

      if (valueIsFunc && value.isStateObserveHandler) {
        this._registerStateObserveHandler(key, value);
        continue;
      }

      if (valueIsFunc && value.statePlugin) {
        this[key] = value.apply(this);
      }
    }

    sc_super();
  },

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

  /**
    Constructs a new instance of a state routing context object.

    @param {Hash} attr attributes to apply to the constructed object
    @return {SC.StateRouteContext}

    @see #handleRoute
  */
  createStateRouteHandlerContext: function (attr) {
    return SC.StateRouteHandlerContext.create(attr);
  },

  /**
    Invoked by this state's {@link #routeTriggered} method if the state is
    actually allowed to handle the triggered route.

    By default the method invokes a state transition to this state.
  */
  handleTriggeredRoute: function (context) {
    this.gotoState(this, context);
  },

  /** @private

    Registers event handlers with this state. Event handlers are special
    functions on the state that are intended to handle more than one event. This
    compared to basic functions that only respond to a single event that reflects
    the name of the method.
  */
  _registerEventHandler: function (name, handler) {
    var events = handler.events,
        event = null,
        len = events.length,
        i = 0;

    this._registeredEventHandlers[name] = handler;

    for (; i < len; i += 1) {
      event = events[i];

      if (SC.typeOf(event) === SC.T_STRING) {
        this._registeredStringEventHandlers[event] = {
          name: name,
          handler: handler
        };
        continue;
      }

      if (event instanceof RegExp) {
        this._registeredRegExpEventHandlers.push({
          name: name,
          handler: handler,
          regexp: event
        });
        continue;
      }

      this.stateLogError("Invalid event %@ for event handler %@ in state %@".fmt(event, name, this));
    }
  },

  /** @private

    Registers state observe handlers with this state. State observe handlers behave just like
    when you apply observes() on a method but will only be active when the state is currently
    entered, otherwise the handlers are inactive until the next time the state is entered
  */
  _registerStateObserveHandler: function (name, handler) {
    var i = 0,
        args = handler.args,
        len = args.length,
        arg, validHandlers = YES;

    for (; i < len; i += 1) {
      arg = args[i];
      if (SC.typeOf(arg) !== SC.T_STRING || SC.empty(arg)) {
        this.stateLogError("Invalid argument %@ for state observe handler %@ in state %@".fmt(arg, name, this));
        validHandlers = NO;
      }
    }

    if (!validHandlers) return;

    this._registeredStateObserveHandlers[name] = handler.args;
  },

  /**
    Used to get a substate of this state that matches a given value.

    If the value is a state object, then the value will be returned if it is indeed
    a substate of this state, otherwise null is returned.

    If the given value is a string, then the string is assumed to be a path expression
    to a substate. The value is then parsed to find the closest match. For path expression
    syntax, refer to the {@link SC.StatePathMatcher} class.

    If there is no match then null is returned. If there is more than one match then null
    is return and an error is generated indicating ambiguity of the given value.

    An optional callback can be provided to handle the scenario when either no
    substate is found or there is more than one match. The callback is then given
    the opportunity to further handle the outcome and return a result which the
    getSubstate method will then return. The callback should have the following
    signature:

      function (state, value, paths)

    - state: The state getState was invoked on
    - value: The value supplied to getState
    - paths: An array of substate paths that matched the given value

    If there were no matches then `paths` is not provided to the callback.

    You can also optionally provide a target that the callback is invoked on. If no
    target is provided then this state is used as the target.

    @param value {State|String} used to identify a substate of this state
    @param [callback] {Function} the callback
    @param [target] {Object} the target
  */
  getSubstate: function (value, callback, target) {
    // Fast path.
    if (!value) return null;

    var valueType = SC.typeOf(value);

    // If the value is an object then just check if the value is
    // a registered substate of this state, and if so return it.
    if (valueType === SC.T_OBJECT) {
      return this._registeredSubstates.indexOf(value) > -1 ? value : null;
    }

    //@if(debug)
    if (valueType !== SC.T_STRING) {
      this.stateLogError("Developer Error: Can not find matching subtype. value must be a string: %@".fmt(value));
      return null;
    }
    //@endif

    // Attempt to pattern match the value.
    var matcher = SC.StatePathMatcher.create({ state: this, expression: value }),
        matches = [], key;

    if (matcher.get('tokens').length === 0) return null;

    var paths = this._registeredSubstatePaths[matcher.get('lastPart')];
    if (!paths) return this._notifySubstateNotFound(callback, target, value);

    for (key in paths) {
      if (matcher.match(key)) {
        matches.push(paths[key]);
      }
    }

    if (matches.length === 1) return matches[0];

    if (matches.length > 1) {
      var keys = [];
      for (key in paths) { keys.push(key); }

      if (callback) return this._notifySubstateNotFound(callback, target, value, keys);

      var msg = "Can not find substate matching '%@' in state %@. Ambiguous with the following: %@";
      this.stateLogError(msg.fmt(value, this.get('fullPath'), keys.join(', ')));
    }

    return this._notifySubstateNotFound(callback, target, value);
  },

  /** @private */
  _notifySubstateNotFound: function (callback, target, value, keys) {
    return callback ? callback.call(target || this, this, value, keys) : null;
  },

  /**
    Will attempt to get a state relative to this state.

    A state is returned based on the following:

    1. First check this state's substates for a match; and
    2. If no matching substate then attempt to get the state from
       this state's parent state.

    Therefore states are recursively traversed up to the root state
    to identify a match, and if found is ultimately returned, otherwise
    null is returned. In the case that the value supplied is ambiguous
    an error message is returned.

    The value provided can either be a state object or a state path expression.
    For path expression syntax, refer to the {@link SC.StatePathMatcher} class.
  */
  getState: function (value) {
    if (value === this.get('name')) return this;
    if (SC.kindOf(value, SC.State)) return value;
    return this.getSubstate(value, this._handleSubstateNotFound);
  },

  /** @private */
  _handleSubstateNotFound: function (state, value, keys) {
    var parentState = this.get('parentState');

    if (parentState) return parentState.getState(value);

    if (keys) {
      var msg = "Can not find state matching '%@'. Ambiguous with the following: %@";
      this.stateLogError(msg.fmt(value, keys.join(', ')));
    }

    return null;
  },

  /**
    Resumes an active goto state transition process that has been suspended.
  */
  resumeGotoState: function () {
    this.get('statechart').resumeGotoState();
  },

  /**
    Indicates if this state is the root state of the statechart.

    @type Boolean
  */
  isRootState: function () {
    return this.getPath('statechart.rootState') === this;
  }.property(),

  /**
    Indicates if this state has any current substates
  */
  hasCurrentSubstates: function () {
    var current = this.get('currentSubstates');
    return !!current && current.get('length') > 0;
  }.property('currentSubstates').cacheable(),

  /**
    Indicates if this state has any currently entered substates
  */
  hasEnteredSubstates: function () {
    var entered = this.get('enteredSubstates');
    return !!entered  && entered.get('length') > 0;
  }.property('enteredSubstates').cacheable(),

  /** @override SC.CoreState
    Called by the statechart to allow a state to try and handle the given event. If the
    event is handled by the state then YES is returned, otherwise NO.

    There is a particular order in how an event is handled by a state:

     1. Basic function whose name matches the event
     2. Registered event handler that is associated with an event represented as a string
     3. Registered event handler that is associated with events matching a regular expression
     4. The unknownEvent function

    Use of event handlers that are associated with events matching a regular expression may
    incur a performance hit, so they should be used sparingly.

    The unknownEvent function is only invoked if the state has it, otherwise it is skipped. Note that
    you should be careful when using unknownEvent since it can be either abused or cause unexpected
    behavior.

    Example of a state using all four event handling techniques:

        SC.State.extend({

          // Basic function handling event 'foo'
          foo: function (arg1, arg2) { ... },

          // event handler that handles 'frozen' and 'canuck'
          eventHandlerA: function (event, arg1, arg2) {
            ...
          }.handleEvent('frozen', 'canuck'),

          // event handler that handles events matching the regular expression /num\d/
          //   ex. num1, num2
          eventHandlerB: function (event, arg1, arg2) {
            ...
          }.handleEvent(/num\d/),

          // Handle any event that was not handled by some other
          // method on the state
          unknownEvent: function (event, arg1, arg2) {

          }

        });
  */
  tryToHandleEvent: function (event, arg1, arg2) {
    //@if(debug)
    var trace = this.get('trace');
    //@endif

    // First check if the name of the event is the same as a registered event handler. If so,
    // then do not handle the event.
    if (this._registeredEventHandlers[event]) {
      this.stateLogWarning("state %@ can not handle event '%@' since it is a registered event handler".fmt(this, event));
      return NO;
    }

    if (this._registeredStateObserveHandlers[event]) {
      this.stateLogWarning("state %@ can not handle event '%@' since it is a registered state observe handler".fmt(this, event));
      return NO;
    }

    var sc = this.get('statechart'),
        ret;

    // Now begin by trying a basic method on the state to respond to the event
    if (SC.typeOf(this[event]) === SC.T_FUNCTION) {
      //@if(debug)
      if (trace) this.stateLogTrace("will handle event '%@'".fmt(event), SC.TRACE_STATECHART_STYLE.actionInfo);
      //@endif
      sc.stateWillTryToHandleEvent(this, event, event);
      ret = (this[event](arg1, arg2) !== NO);
      sc.stateDidTryToHandleEvent(this, event, event, ret);
      return ret;
    }

    // Try an event handler that is associated with an event represented as a string
    var handler = this._registeredStringEventHandlers[event];
    if (handler) {
      //@if(debug)
      if (trace) this.stateLogTrace("%@ will handle event '%@'".fmt(handler.name, event), SC.TRACE_STATECHART_STYLE.actionInfo);
      //@endif
      sc.stateWillTryToHandleEvent(this, event, handler.name);
      ret = (handler.handler.call(this, event, arg1, arg2) !== NO);
      sc.stateDidTryToHandleEvent(this, event, handler.name, ret);
      return ret;
    }

    // Try an event handler that is associated with events matching a regular expression

    var len = this._registeredRegExpEventHandlers.length,
        i = 0;

    for (; i < len; i += 1) {
      handler = this._registeredRegExpEventHandlers[i];
      if (event.match(handler.regexp)) {
        //@if(debug)
        if (trace) this.stateLogTrace("%@ will handle event '%@'".fmt(handler.name, event), SC.TRACE_STATECHART_STYLE.actionInfo);
        //@endif
        sc.stateWillTryToHandleEvent(this, event, handler.name);
        ret = (handler.handler.call(this, event, arg1, arg2) !== NO);
        sc.stateDidTryToHandleEvent(this, event, handler.name, ret);
        return ret;
      }
    }

    // Final attempt. If the state has an unknownEvent function then invoke it to
    // handle the event
    if (SC.typeOf(this.unknownEvent) === SC.T_FUNCTION) {
      //@if(debug)
      if (trace) this.stateLogTrace("unknownEvent will handle event '%@'".fmt(event), SC.TRACE_STATECHART_STYLE.actionInfo);
      //@endif
      sc.stateWillTryToHandleEvent(this, event, 'unknownEvent');
      ret = (this.unknownEvent(event, arg1, arg2) !== NO);
      sc.stateDidTryToHandleEvent(this, event, 'unknownEvent', ret);
      return ret;
    }

    // Nothing was able to handle the given event for this state
    return NO;
  },

  /**
    Notification called just before enterState is invoked.

    Note: This is intended to be used by the owning statechart but it can be overridden if
    you need to do something special.

    @param {Hash} [context] value if one was supplied to gotoState when invoked
    @see #enterState
  */
  stateWillBecomeEntered: function (context) {
    this._isEnteringState = YES;
  },

  /**
    Notification called just after enterState is invoked.

    Note: This is intended to be used by the owning statechart but it can be overridden if
    you need to do something special.

    @param context {Hash} Optional value if one was supplied to gotoState when invoked
    @see #enterState
  */
  stateDidBecomeEntered: function (context) {
    this._setupAllStateObserveHandlers();
    this._isEnteringState = NO;
  },

  /**
    Notification called just before exitState is invoked.

    Note: This is intended to be used by the owning statechart but it can be overridden
    if you need to do something special.

    @param context {Hash} Optional value if one was supplied to gotoState when invoked
    @see #exitState
  */
  stateWillBecomeExited: function (context) {
    this._isExitingState = YES;
    this._teardownAllStateObserveHandlers();
  },

  /**
    Notification called just after exitState is invoked.

    Note: This is intended to be used by the owning statechart but it can be overridden
    if you need to do something special.

    @param context {Hash} Optional value if one was supplied to gotoState when invoked
    @see #exitState
  */
  stateDidBecomeExited: function (context) {
    this._isExitingState = NO;
  },

  /** @private

    Used to setup all the state observer handlers. Should be done when
    the state has been entered.
  */
  _setupAllStateObserveHandlers: function () {
    this._configureAllStateObserveHandlers('addObserver');
  },

  /** @private

    Used to teardown all the state observer handlers. Should be done when
    the state is being exited.
  */
  _teardownAllStateObserveHandlers: function () {
    this._configureAllStateObserveHandlers('removeObserver');
  },

  /** @private

    Primary method used to either add or remove this state as an observer
    based on all the state observe handlers that have been registered with
    this state.

    Note: The code to add and remove the state as an observer has been
    taken from the observerable mixin and made slightly more generic. However,
    having this code in two different places is not ideal, but for now this
    will have to do. In the future the code should be refactored so that
    there is one common function that both the observerable mixin and the
    statechart framework use.
  */
  _configureAllStateObserveHandlers: function (action) {
    var key, values, dotIndex, path, observer, i, root;

    for (key in this._registeredStateObserveHandlers) {
      values = this._registeredStateObserveHandlers[key];
      for (i = 0; i < values.length; i += 1) {
        path = values[i];
        observer = key;

        // Use the dot index in the path to determine how the state
        // should add itself as an observer.

        dotIndex = path.indexOf('.');

        if (dotIndex < 0) {
          this[action](path, this, observer);
        } else if (path.indexOf('*') === 0) {
          this[action](path.slice(1), this, observer);
        } else {
          root = null;

          if (dotIndex === 0) {
            root = this;
            path = path.slice(1);
          } else if (dotIndex === 4 && path.slice(0, 5) === 'this.') {
            root = this;
            path = path.slice(5);
          } else if (dotIndex < 0 && path.length === 4 && path === 'this') {
            root = this;
            path = '';
          }

          SC.Observers[action](path, this, observer, root);
        }
      }
    }
  },

  /**
    Call when an asynchronous action need to be performed when either entering or exiting
    a state.

    @see enterState
    @see exitState
  */
  performAsync: function (func, arg1, arg2) {
    return SC.Async.perform(func, arg1, arg2);
  },

  /** SC.CoreState @override

    Returns YES if this state can respond to the given event, otherwise
    NO is returned

    @param event {String} the value to check
    @returns {Boolean}
  */
  respondsToEvent: function (event) {
    if (this._registeredEventHandlers[event]) return false;
    if (SC.typeOf(this[event]) === SC.T_FUNCTION) return true;
    if (this._registeredStringEventHandlers[event]) return true;
    if (this._registeredStateObserveHandlers[event]) return false;

    var len = this._registeredRegExpEventHandlers.length,
        i = 0,
        handler;

    for (; i < len; i += 1) {
      handler = this._registeredRegExpEventHandlers[i];
      if (event.match(handler.regexp)) return true;
    }

    return SC.typeOf(this.unknownEvent) === SC.T_FUNCTION;
  },

  /** @private */
  _enteredSubstatesDidChange: function () {
    this.notifyPropertyChange('enteredSubstates');
  }.observes('*enteredSubstates.[]'),

  /** @private */
  _currentSubstatesDidChange: function () {
    this.notifyPropertyChange('currentSubstates');
  }.observes('*currentSubstates.[]'),

  /** @private */
  _statechartOwnerDidChange: function () {
    this.notifyPropertyChange('owner');
  },

  /**
    Used to log a state warning message
  */
  stateLogWarning: function (msg) {
    var sc = this.get('statechart');
    sc.statechartLogWarning(msg);
  },

  /**
    Used to log a state error message
  */
  stateLogError: function (msg) {
    var sc = this.get('statechart');
    sc.statechartLogError(msg);
  }

});

/**
  Use this when you want to plug-in a state into a statechart. This is beneficial
  in cases where you split your statechart's states up into multiple files and
  don't want to fuss with the sc_require construct.

  Example:

      MyApp.statechart = SC.Statechart.create({
        rootState: SC.State.design({
          initialSubstate: 'a',
          a: SC.State.plugin('path.to.a.state.class'),
          b: SC.State.plugin('path.to.another.state.class')
        })
      });

  You can also supply hashes the plugin feature in order to enhance a state or
  implement required functionality:

      SomeMixin = { ... };

      stateA: SC.State.plugin('path.to.state', SomeMixin, { ... })

  @param value {String} property path to a state class
  @param args {Hash,...} Optional. Hash objects to be added to the created state
*/
SC.State.plugin = function (value) {
  var args = SC.A(arguments);

  args.shift();
  var func = function () {
    var klass = SC.objectForPropertyPath(value);
    if (!klass) {
      console.error('SC.State.plugin: Unable to determine path %@'.fmt(value));
      return undefined;
    }
    if (!klass.isClass || !klass.kindOf(SC.State)) {
      console.error('SC.State.plugin: Unable to extend. %@ must be a class extending from SC.State'.fmt(value));
      return undefined;
    }
    return klass.extend.apply(klass, args);
  };
  func.statePlugin = YES;
  return func;
};

SC.State.design = SC.State.extend;
