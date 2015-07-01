// ==========================================================================
// Project:   SC.WebSocket
// Copyright: ©2013 Nicolas BADIA and contributors
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/websocket_delegate');

/**
  @class

  Implements SproutCore run loop aware event handling for WebSocket. Using SC.WebSocket ensures
  that the run loop runs on each WebSocket event and provides a useful skeleton for handling
  WebSocket events.

  Example Usage:

      // Create a WebSocket connection.
      var ws = SC.WebSocket.create({
        server: 'ws://server',
      });

      // Assign target and methods for events.
      ws.notify('onopen', this, 'wsOpened');
      ws.notify('onmessage', this, 'wsReceivedMessage');
      ws.notify('onclose', this, 'wsClosed');
      ws.connect();

      // Send a message through the WebSocket.
      ws.send('hello server');

  @since SproutCore 1.11
  @extends SC.Object
  @extends SC.DelegateSupport
  @author Nicolas BADIA
*/
SC.WebSocket = SC.Object.extend(SC.DelegateSupport, SC.WebSocketDelegate,
  /** @scope SC.WebSocket.prototype */ {

  /**
    The URL of the WebSocket server.

    @type String
    @default null
  */
  server: null,

  /**
    Whether the connection is open or not.

    @type Boolean
    @readOnly
  */
  isConnected: false,

  /**
    In order to handle authentication, set `isAuth` to `false` in the
    `webSocketDidOpen` delegate method just after sending a request to
    authenticate the connection. This way, any futher messages will be put in the
    queue until the server tells you that the connection is authenticated. Once it
    is, you should set `isAuth` to `true` to resume the queue.

    If you don't need authentication, leave `isAuth` as `null`.

    @type Boolean
    @default null
  */
  isAuth: null,

  /**
    Processes the messages as JSON if possible.

    @type Boolean
    @default true
  */
  isJSON: true,

  /**
    A WebSocket delegate.

    @see SC.WebSocketDelegate
    @type SC.WebSocketDelegate
    @default null
  */
  delegate: null,

  /**
    Whether to attempt to reconnect automatically if the connection is closed or not.

    @type SC.WebSocketDelegate
    @default true
  */
  autoReconnect: true,

  /**
    The interval in milliseconds to wait before trying to reconnect.

    @type SC.WebSocketDelegate
    @default null
  */
  reconnectInterval: 10000, // 10 seconds

  // ..........................................................
  // PUBLIC METHODS
  //

  /**
    Open the WebSocket connection.

    @returns {SC.WebSocket} The SC.WebSocket object.
  */
  connect: function() {
    // If not supported or already connected, return.
    if (!SC.platform.supportsWebSocket || this.socket) return this;

    // Connect.
    try {
      var socket = this.socket = new WebSocket(this.get('server')),
          self = this;

      socket.onopen = function (open) {
        SC.run(function () {
          self.onOpen(open);
        });
      };

      socket.onmessage = function (message) {
        SC.run(function () {
          self.onMessage(message);
        });
      };

      socket.onclose = function (close) {
        SC.run(function () {
          self.onClose(close);
        });
      };

      socket.onerror = function (error) {
        SC.run(function () {
          self.onError(error);
        });
      };
    } catch (e) {
      SC.error('An error has occurred while connnecting to the websocket server: ' + e);
    }

    return this;
  },

  /**
    Close the connection.

    @param {Number} code A numeric value indicating the status code explaining why the connection is being closed. If this parameter is not specified, a default value of 1000 (indicating a normal "transaction complete" closure) is assumed.
    @param {String} reason A human-readable string explaining why the connection is closing. This string must be no longer than 123 bytes of UTF-8 text (not characters).
    @returns {SC.WebSocket} The SC.WebSocket object.
  */
  close: function(code, reason) {
    var socket = this.socket;

    if (socket && socket.readyState === SC.WebSocket.OPEN) {
      this.socket.close(code, reason);
    }

    return this;
  },

  /**
    Configures a callback to execute when an event happens. You must pass at least a target and
    method to this and optionally an event name.

    You may also pass additional arguments which will then be passed along to your callback.

    Example:

        var websocket = SC.WebSocket.create({ server: 'ws://server' }).connect();

        webSocket.notify('onopen', this, 'wsWasOpened');
        webSocket.notify('onmessage', this, 'wsReceivedMessage');
        webSocket.notify('onclose', this, 'wsWasClose');
        webSocket.notify('onerror', this, 'wsDidError');

    ## Callback Format

    Your notification callback should expect to receive the WebSocket object as
    the first parameter and the event or message; plus any additional parameters that you pass. If your callback handles the notification and to prevent further handling, it
    should return YES.

    @param {String} target String Event name.
    @param {Object} target The target object for the callback action.
    @param {String|Function} action The method name or function to call on the target.
    @returns {SC.WebSocket} The SC.WebSocket object.
  */
  notify: function(event, target, action) {
    var args,
      i, len;

    if (SC.typeOf(event) !== SC.T_STRING) {
      // Fast arguments access.
      // Accessing `arguments.length` is just a Number and doesn't materialize the `arguments` object, which is costly.
      args = new Array(Math.max(0, arguments.length - 2)); //  SC.A(arguments).slice(2)
      for (i = 0, len = args.length; i < len; i++) { args[i] = arguments[i + 2]; }

      // Shift the arguments
      action = target;
      target = event;
      event = 'onmessage';
    } else {
      // Fast arguments access.
      // Accessing `arguments.length` is just a Number and doesn't materialize the `arguments` object, which is costly.
      args = new Array(Math.max(0, arguments.length - 3)); //  SC.A(arguments).slice(3)
      for (i = 0, len = args.length; i < len; i++) { args[i] = arguments[i + 3]; }
    }

    var listeners = this.get('listeners');
    if (!listeners) { this.set('listeners', listeners = {}); }
    if(!listeners[event]) { listeners[event] = []; }

    //@if(debug)
    for (i = listeners[event].length - 1; i >= 0; i--) {
      var listener = listeners[event][i];
      if (listener.event === event && listener.target === target && listener.action === action) {
        SC.warn("Developer Warning: This listener is already defined.");
      }
    }
    //@endif

    // Add another listener for the given event name.
    listeners[event].push({target: target, action: action, args: args});

    return this;
  },

  /**
    Send the message on the WebSocket. If the connection is not yet open or authenticated (as
    necessary), the message will be put in the queue.

    If `isJSON` is true (the default for SC.WebSocket), the message will be stringified JSON.

    @param {String|Object} message The message to send.
    @returns {SC.WebSocket}
  */
  send: function(message) {
    if (this.isConnected === true && this.isAuth !== false) {
      if (this.isJSON) {
        message = JSON.stringify(message);
      }

      this.socket.send(message);
    } else {
      this.addToQueue(message);
    }
    return this;
  },

  // ..........................................................
  // PRIVATE METHODS
  //

  /**
     @private
  */
  onOpen: function(event) {
    var del = this.get('objectDelegate');

    this.set('isConnected', true);

    var ret = del.webSocketDidOpen(this, event);
    if (ret !== true) this._notifyListeners('onopen', event);

    this.fireQueue();
  },

  /**
     @private
  */
  onMessage: function(messageEvent) {
    if (messageEvent) {
      var del = this.get('objectDelegate'),
        message,
        data,
        ret;

      message = data = messageEvent.data;
      ret = del.webSocketDidReceiveMessage(this, data);

      if (ret !== true) {
        if (this.isJSON) {
          message = JSON.parse(data);
        }
        this._notifyListeners('onmessage', message);
      }
    }

    // If there is message in the queue, we fire them
    this.fireQueue();
  },

  /**
     @private
  */
  onClose: function(closeEvent) {
    var del = this.get('objectDelegate');

    this.set('isConnected', false);
    this.set('isAuth', null);
    this.socket = null;

    var ret = del.webSocketDidClose(this, closeEvent);

    if (ret !== true) {
      this._notifyListeners('onclose', closeEvent);
      this.tryReconnect();
    }
  },

  /**
     @private
  */
  onError: function(event) {
    var del = this.get('objectDelegate'),
      ret = del.webSocketDidError(this, event);

    if (ret !== true) this._notifyListeners('onerror', event);
  },

  /**
     @private

     Add the message to the queue
  */
  addToQueue: function(message) {
    var queue = this.queue;
    if (!queue) { this.queue = queue = []; }

    queue.push(message);
  },

  /**
     @private

     Send the messages from the queue.
  */
  fireQueue: function() {
    var queue = this.queue;
    if (!queue || queue.length === 0) return;

    queue = SC.A(queue);
    this.queue = null;

    for (var i = 0, len = queue.length; i < len; i++) {
      var message = queue[i];
      this.send(message);
    }
  },

  /**
    @private
  */
  tryReconnect: function() {
    if (!this.get('autoReconnect')) return;

    var that = this;
    setTimeout(function() { that.connect(); }, this.get('reconnectInterval'));
  },

  /**
    @private

    Will notify each listener. Returns true if any of the listeners handle.
  */
  _notifyListeners: function(event, message) {
    var listeners = (this.listeners || {})[event], notifier, target, action, args;
    if (!listeners) { return NO; }

    var handled = NO,
      len = listeners.length;

    for (var i = 0; i < len; i++) {
      notifier = listeners[i];
      args = (notifier.args || []).copy();
      args.unshift(message);
      args.unshift(this);

      target = notifier.target;
      action = notifier.action;
      if (SC.typeOf(action) === SC.T_STRING) { action = target[action]; }

      handled = action.apply(target, args);
      if (handled === true) return handled;
    }

    return handled;
  },

  /**
    @private
  */
  objectDelegate: function () {
    var del = this.get('delegate');
    return this.delegateFor('isWebSocketDelegate', del, this);
  }.property('delegate').cacheable(),

  // ..........................................................
  // PRIVATE PROPERTIES
  //

  /**
    @private

    @type WebSocket
    @default null
  */
  socket: null,

  /**
    @private

    @type Object
    @default null
  */
  listeners: null,

  /**
    @private

    Messages that needs to be send once the connection is open.

    @type Array
    @default null
  */
  queue: null,

});

// Class Methods
SC.WebSocket.mixin( /** @scope SC.WebSocket */ {

  // ..........................................................
  // CONSTANTS
  //

  /**
    The connection is not yet open.

    @static
    @constant
    @type Number
    @default 0
  */
  CONNECTING: 0,

  /**
    The connection is open and ready to communicate.

    @static
    @constant
    @type Number
    @default 1
  */
  OPEN: 1,

  /**
    The connection is in the process of closing.

    @static
    @constant
    @type Number
    @default 2
  */
  CLOSING: 2,

  /**
    The connection is closed or couldn't be opened.

    @static
    @constant
    @type Number
    @default 3
  */
  CLOSED: 3,

});
