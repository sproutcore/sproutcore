// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A response represents a single response from a server request and handles the communication to
  the server.  An instance of this class is returned whenever you call `SC.Request.send()`.

  SproutCore only defines one concrete subclass of `SC.Response`,`SC.XHRResponse`. In order to
  use `SC.Request` with a non-XHR request type you should create a custom class that extends
  `SC.Response` and set your custom class as the value of `responseClass` on all requests.

  For example,

      var request = SC.Request.getUrl(resourceAddress)
                              .set('responseClass', MyApp.CustomProtocolResponse)
                              .send();

  To extend `SC.Response`, please look at the property and methods listed below. For more examples,
  please look at the code in `SC.XHRResponse`.

  @extend SC.Object
  @since SproutCore 1.0
*/
SC.Response = SC.Object.extend(
/** @scope SC.Response.prototype */ {

  /**
    Walk like a duck

    @type Boolean
  */
  isResponse: YES,

  /**
    Becomes true if there was a failure.  Makes this into an error object.

    @type Boolean
    @default NO
  */
  isError: NO,

  /**
    Always the current response

    @field
    @type SC.Response
    @default `this`
  */
  errorValue: function() {
    return this.get('isError') ? SC.val(this.get('errorObject')) : null;
  }.property().cacheable(),

  /**
    The error object generated when this becomes an error

    @type SC.Error
    @default null
  */
  errorObject: null,

  /**
    Request used to generate this response.  This is a copy of the original
    request object as you may have modified the original request object since
    then.

    To retrieve the original request object use originalRequest.

    @type SC.Request
    @default null
  */
  request: null,

  /**
    The request object that originated this request series.  Mostly this is
    useful if you are looking for a reference to the original request.  To
    inspect actual properties you should use request instead.

    @field
    @type SC.Request
    @observes request
  */
  originalRequest: function() {
    var ret = this.get('request');
    while (ret.get('source')) { ret = ret.get('source'); }
    return ret;
  }.property('request').cacheable(),

  /**
    Type of request. Must be an HTTP method. Based on the request.

    @field
    @type String
    @observes request
  */
  type: function() {
    return this.getPath('request.type');
  }.property('request').cacheable(),

  /**
    URL of request.

    @field
    @type String
    @observes request
  */
  address: function() {
    return this.getPath('request.address');
  }.property('request').cacheable(),

  /**
    If set then will attempt to automatically parse response as JSON
    regardless of headers.

    @field
    @type Boolean
    @default NO
    @observes request
  */
  isJSON: function() {
    return this.getPath('request.isJSON') || NO;
  }.property('request').cacheable(),

  /**
    If set, then will attempt to automatically parse response as XML
    regardless of headers.

    @field
    @type Boolean
    @default NO
    @observes request
  */
  isXML: function() {
    return this.getPath('request.isXML') || NO;
  }.property('request').cacheable(),

  /**
    Returns the hash of listeners set on the request.

    @field
    @type Hash
    @observes request
  */
  listeners: function() {
    return this.getPath('request.listeners');
  }.property('request').cacheable(),

  /**
    The response status code.

    @type Number
    @default -100
  */
  status: -100, // READY

  /**
    Headers from the response. Computed on-demand

    @type Hash
    @default null
  */
  headers: null,

  /**
    The response body or the parsed JSON. Can also be an SC.Error instance
    if there is a JSON parsing error. If isJSON was set, will be parsed
    automatically.

    @field
    @type {Hash|String|SC.Error}
    @default null
  */
  body: null,

  /**
    @private
    @deprecated Use body instead.

    Alias for body.

    @type Hash|String
    @see #body
  */
  response: function() {
    return this.get('body');
  }.property('body').cacheable(),

  /**
    Set to YES if response is cancelled

    @type Boolean
    @default NO
  */
  isCancelled: NO,

  /**
    Set to YES if the request timed out. Set to NO if the request has
    completed before the timeout value. Set to null if the timeout timer is
    still ticking.

    @type Boolean
    @default null
  */
  timedOut: null,

  /**
    The timer tracking the timeout

    @type Number
    @default null
  */
  timeoutTimer: null,


  // ..........................................................
  // METHODS
  //

  /**
    Called by the request manager when its time to actually run. This will
    invoke any callbacks on the source request then invoke transport() to
    begin the actual request.
  */
  fire: function() {
    var req = this.get('request'),
        source = req ? req.get('source') : null;

    // first give the source a chance to fixup the request and response
    // then freeze req so no more changes can happen.
    if (source && source.willSend) { source.willSend(req, this); }

    req.set('requestTime', Date.now());
    req.freeze();

    // if the source did not cancel the request, then invoke the transport
    // to actually trigger the request.  This might receive a response
    // immediately if it is synchronous.
    if (!this.get('isCancelled')) { this.invokeTransport(); }

    // If the request specified a timeout value, then set a timer for it now.
    var timeout = req.get('timeout');
    if (timeout) {
      var timer = SC.Timer.schedule({
        target: this,
        action: 'timeoutReached',
        interval: timeout,
        repeats: NO
      });
      this.set('timeoutTimer', timer);
    }

    // if the transport did not cancel the request for some reason, let the
    // source know that the request was sent
    if (!this.get('isCancelled') && source && source.didSend) {
      source.didSend(req, this);
    }
  },

  /**
    Called by `SC.Response#fire()`. Starts the transport by invoking the
    `SC.Response#receive()` function.
  */
  invokeTransport: function() {
    this.receive(function(proceed) { this.set('status', 200); }, this);
  },

  /**
    Invoked by the transport when it receives a response. The passed-in
    callback will be invoked to actually process the response. If cancelled
    we will pass NO. You should clean up instead.

    Invokes callbacks on the source request also.

    @param {Function} callback the function to receive
    @param {Object} context context to execute the callback in
    @returns {SC.Response} receiver
  */
  receive: function(callback, context) {
    if (!this.get('timedOut')) {
      // If we had a timeout timer scheduled, invalidate it now.
      var timer = this.get('timeoutTimer');
      if (timer) { timer.invalidate(); }
      this.set('timedOut', NO);
    }

    var req = this.get('request');
    var source = req ? req.get('source') : null;

    SC.run(function() {
      // invoke the source, giving a chance to fixup the response or (more
      // likely) cancel the request.
      if (source && source.willReceive) { source.willReceive(req, this); }

      // invoke the callback.  note if the response was cancelled or not
      if (callback) callback.call(context, !this.get('isCancelled'));

      // if we weren't cancelled, then give the source first crack at handling
      // the response.  if the source doesn't want listeners to be notified,
      // it will cancel the response.
      if (!this.get('isCancelled') && source && source.didReceive) {
        source.didReceive(req, this);
      }

      // notify listeners if we weren't cancelled.
      if (!this.get('isCancelled')) { this.notify(); }
    }, this);

    // no matter what, remove from inflight queue
    SC.Request.manager.transportDidClose(this);
    return this;
  },

  /**
    Default method just closes the connection. It will also mark the request
    as cancelled, which will not call any listeners.
  */
  cancel: function() {
    if (!this.get('isCancelled')) {
      this.set('isCancelled', YES);
      this.cancelTransport();
      SC.Request.manager.transportDidClose(this);
    }
  },

  /**
    Default method just closes the connection.

    @returns {Boolean} YES if this response has not timed out yet, NO otherwise
  */
  timeoutReached: function() {
    // If we already received a response yet the timer still fired for some
    // reason, do nothing.
    if (this.get('timedOut') === null) {
      this.set('timedOut', YES);
      this.cancelTransport();

      // Invokes any relevant callbacks and notifies registered listeners, if
      // any. In the event of a timeout, we set the status to 0 since we
      // didn't actually get a response from the server.
      this.receive(function(proceed) {
        if (!proceed) { return; }

        this.set('status', 0);
        this.set('isError', YES);
        this.set('errorObject', SC.$error("HTTP Request timed out", "Request", 0));
      }, this);

      return YES;
    }

    return NO;
  },

  /**
    Override with concrete implementation to actually cancel the transport.
  */
  cancelTransport: function() {},

  /**
    @private

    Will notify each listener. Returns true if any of the listeners handle.
  */
  _notifyListeners: function(listeners, status) {
    var notifiers = listeners[status], args, target, action;
    if (!notifiers) { return NO; }

    var handled = NO;
    var len = notifiers.length;

    for (var i = 0; i < len; i++) {
      var notifier = notifiers[i];
      args = (notifier.args || []).copy();
      args.unshift(this);

      target = notifier.target;
      action = notifier.action;
      if (SC.typeOf(action) === SC.T_STRING) { action = target[action]; }

      handled = action.apply(target, args);
    }

    return handled;
  },

  /**
    Notifies any saved target/action. Call whenever you cancel, or end.

    @returns {SC.Response} receiver
  */
  notify: function() {
    var listeners = this.get('listeners'),
        status = this.get('status'),
        baseStat = Math.floor(status / 100) * 100,
        handled = NO;

    if (!listeners) { return this; }

    handled = this._notifyListeners(listeners, status);
    if (!handled && baseStat !== status) { handled = this._notifyListeners(listeners, baseStat); }
    if (!handled && status !== 0) { handled = this._notifyListeners(listeners, 0); }

    return this;
  },

  /**
    String representation of the response object

    @returns {String}
  */
  toString: function() {
    var ret = sc_super();
    return "%@<%@ %@, status=%@".fmt(ret, this.get('type'), this.get('address'), this.get('status'));
  }

});
