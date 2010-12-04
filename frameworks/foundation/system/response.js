// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global ActiveXObject */

/**
  A response represents a single response from a server request.  An instance
  of this class is returned whenever you call SC.Request.send().
  
  TODO: Add more info
  
  @extend SC.Object
  @since SproutCore 1.0
*/
SC.Response = SC.Object.extend(
/** @scope SC.Response.prototype */ {
  
  /**
    Becomes true if there was a failure.  Makes this into an error object.
    
    @property {Boolean}
  */
  isError: NO,
  
  /**
    Always the current response
    
    @property {SC.Response}
  */
  errorValue: function() {
    return this;
  }.property().cacheable(),
  
  /**
    The error object generated when this becomes an error
    
    @property {SC.Error}
  */
  errorObject: null,
  
  /** 
    Request used to generate this response.  This is a copy of the original
    request object as you may have modified the original request object since
    then.
   
    To retrieve the original request object use originalRequest.
    
    @property {SC.Request}
  */
  request: null,
  
  /**
    The request object that originated this request series.  Mostly this is
    useful if you are looking for a reference to the original request.  To
    inspect actual properties you should use request instead.
    
    @property {SC.Request}
  */
  originalRequest: function() {
    var ret = this.get('request');
    while (ret.get('source')) ret = ret.get('source');
    return ret ;
  }.property('request').cacheable(),

  /** 
    Type of request.  Must be an HTTP method.  Based on the request
  
    @property {String}
  */
  type: function() {
    return this.getPath('request.type');
  }.property('request').cacheable(),
  
  /**
    URL of request. 
    
    @property {String}
  */
  address: function() {
    return this.getPath('request.address');
  }.property('request').cacheable(),
  
  /**
    If set then will attempt to automatically parse response as JSON 
    regardless of headers.
    
    @property {Boolean}
  */
  isJSON: function() {
    return this.getPath('request.isJSON') || NO;
  }.property('request').cacheable(),

  /**
    If set, then will attempt to automatically parse response as XML
    regarldess of headers.
    
    @property {Boolean}
  */
  isXML: function() {
    return this.getPath('request.isXML') || NO ;
  }.property('request').cacheable(),
  
  /** 
    Returns the hash of listeners set on the request.
    
    @property {Hash}
  */
  listeners: function() {
    return this.getPath('request.listeners');
  }.property('request').cacheable(),
  
  /**
    The response status code.
    
    @property {Number}
  */
  status: -100, // READY

  /**
    Headers from the response.  Computed on-demand
    
    @property {Hash}
  */
  headers: null,
  
  /**
    Response body. If isJSON was set, will be parsed automatically.
    
    @response {Hash|String|SC.Error} the response body or the parsed JSON.
      Returns a SC.Error instance if there is a JSON parsing error.
  */
  body: function() {
    // TODO: support XML
    var ret = this.get('encodedBody');
    if (ret && this.get('isJSON')) {
      try {
        ret = SC.json.decode(ret);
      } catch(e) {
        return SC.Error.create({
          message: e.name + ': ' + e.message,
          label: 'Response',
          errorValue: this });
      }
    }
    return ret;
  }.property('encodedBody').cacheable(),
  
  /** 
    @private
    @deprecated
  
    Alias for body.  Provides compatibility with older code.
    
    @property {Hash|String}
  */
  response: function() {
    return this.get('body');
  }.property('body').cacheable(),
  
  /**
    Set to YES if response is cancelled
  */
  isCancelled: NO,
  
  /**
    Set to YES if the request timed out.  Set to NO if the request has
    completed before the timeout value.  Set to null if the timeout timer is
    still ticking.
  */
  timedOut: null,
  
  /**
    The timer tracking the timeout
  */
  timeoutTimer: null,
  
  // ..........................................................
  // METHODS
  // 

  /**
    Called by the request manager when its time to actually run.  This will
    invoke any callbacks on the source request then invoke transport() to 
    begin the actual request.
  */
  fire: function() {
    var req = this.get('request'),
        source = req ? req.get('source') : null;
    
    
    // first give the source a chance to fixup the request and response
    // then freeze req so no more changes can happen.
    if (source && source.willSend) source.willSend(req, this);
    req.freeze();

    // if the source did not cancel the request, then invoke the transport
    // to actually trigger the request.  This might receive a response 
    // immediately if it is synchronous.
    if (!this.get('isCancelled')) this.invokeTransport();


    // If the request specified a timeout value, then set a timer for it now.
    var timeout = req.get('timeout');
    if (timeout) {
      var timer = SC.Timer.schedule({
        target:   this, 
        action:   'timeoutReached', 
        interval: timeout,
        repeats:  NO
      });
      this.set('timeoutTimer', timer);
    }


    // if the transport did not cancel the request for some reason, let the
    // source know that the request was sent
    if (!this.get('isCancelled') && source && source.didSend) {
      source.didSend(req, this);
    }
  },

  invokeTransport: function() {
    this.receive(function(proceed) { this.set('status', 200); }, this);
  },
  
  /**
    Invoked by the transport when it receives a response.  The passed-in
    callback will be invoked to actually process the response.  If cancelled
    we will pass NO.  You should clean up instead.
    
    Invokes callbacks on the source request also.
    
    @param {Function} callback the function to receive
    @param {Object} context context to execute the callback in
    @returns {SC.Response} receiver
  */
  receive: function(callback, context) {
    if (!this.get('timedOut')) {
      // If we had a timeout timer scheduled, invalidate it now.
      var timer = this.get('timeoutTimer');
      if (timer) timer.invalidate();
      this.set('timedOut', NO);
    }

    var req = this.get('request');
    var source = req ? req.get('source') : null;

    SC.run(function() {
      // invoke the source, giving a chance to fixup the response or (more
      // likely) cancel the request.
      if (source && source.willReceive) source.willReceive(req, this);

      // invoke the callback.  note if the response was cancelled or not
      callback.call(context, !this.get('isCancelled'));

      // if we weren't cancelled, then give the source first crack at handling
      // the response.  if the source doesn't want listeners to be notified,
      // it will cancel the response.
      if (!this.get('isCancelled') && source && source.didReceive) {
        source.didReceive(req, this);
      }

      // notify listeners if we weren't cancelled.
      if (!this.get('isCancelled')) this.notify();
    }, this);

    // no matter what, remove from inflight queue
    SC.Request.manager.transportDidClose(this) ;
    return this;
  },
  
  /**
    Default method just closes the connection.  It will also mark the request
    as cancelled, which will not call any listeners.
  */
  cancel: function() {
    if (!this.get('isCancelled')) {
      this.set('isCancelled', YES) ;
      this.cancelTransport() ;
      SC.Request.manager.transportDidClose(this) ;
    }
  },
  
  /**
    Default method just closes the connection.
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
        if (!proceed) return;

        // Set our value to an error.
        var error = SC.$error("HTTP Request timed out", "Request", 0) ;
        error.set("errorValue", this) ;
        this.set('isError', YES);
        this.set('errorObject', error);
        this.set('status', 0);
      }, this);

      return YES;
    }

    return NO;
  },
  
  /**
    Override with concrete implementation to actually cancel the transport.
  */
  cancelTransport: function() {},
  
  /** @private
    Will notify each listener.
  */
  _notifyListener: function(listeners, status) {
    var info = listeners[status], params, target, action;
    if (!info) return NO ;
    
    params = (info.params || []).copy();
    params.unshift(this);
    
    target = info.target;
    action = info.action;
    if (SC.typeOf(action) === SC.T_STRING) action = target[action];
    
    return action.apply(target, params);
  },
  
  /**
    Notifies any saved target/action.  Call whenever you cancel, or end.
    
    @returns {SC.Response} receiver
  */
  notify: function() {
    var listeners = this.get('listeners'), 
        status    = this.get('status'),
        baseStat  = Math.floor(status / 100) * 100,
        handled   = NO ;
        
    if (!listeners) return this ; // nothing to do
    
    handled = this._notifyListener(listeners, status);
    if (!handled) handled = this._notifyListener(listeners, baseStat);
    if (!handled) handled = this._notifyListener(listeners, 0);
    
    return this ;
  },
  
  /**
    String representation of the response object
  */
  toString: function() {
    var ret = sc_super();
    return "%@<%@ %@, status=%@".fmt(ret, this.get('type'), this.get('address'), this.get('status'));
  }
  
});

/**
  Concrete implementation of SC.Response that implements support for using 
  XHR requests.
  
  @extends SC.Response
  @since SproutCore 1.0
*/
SC.XHRResponse = SC.Response.extend({

  /**
    Implement transport-specific support for fetching all headers
  */
  headers: function() {
    var xhr = this.get('rawRequest'),
        str = xhr ? xhr.getAllResponseHeaders() : null,
        ret = {};
        
    if (!str) return ret;
    
    str.split("\n").forEach(function(header) {
      var idx = header.indexOf(':'),
          key, value;
      if (idx>=0) {
        key = header.slice(0,idx);
        value = header.slice(idx+1).trim();
        ret[key] = value ;
      }
    }, this);
    
    return ret ;
  }.property('status').cacheable(),
  
  // returns a header value if found...
  header: function(key) {
    var xhr = this.get('rawRequest');
    return xhr ? xhr.getResponseHeader(key) : null;    
  },
  
  /**
    Implement transport-specific support for fetching tasks
  */
  encodedBody: function() {
    var xhr = this.get('rawRequest'), ret ;
    if (!xhr) ret = null;
    else if (this.get('isXML')) ret = xhr.responseXML;
    else ret = xhr.responseText;
    return ret ;
  }.property('status').cacheable(),
  

  cancelTransport: function() {
    var rawRequest = this.get('rawRequest');
    if (rawRequest) rawRequest.abort();
    this.set('rawRequest', null);
  },

  invokeTransport: function() {
    var rawRequest, transport, handleReadyStateChange, async, headers;
    
    rawRequest = this.createRequest();

    // save it 
    this.set('rawRequest', rawRequest);
    
    // configure async callback - differs per browser...
    async = !!this.getPath('request.isAsynchronous') ;
    if (async) {
      if (!SC.browser.msie && !SC.browser.opera ) {
        SC.Event.add(rawRequest, 'readystatechange', this, 
                     this.finishRequest, rawRequest) ;
      } else {
        transport=this;
        handleReadyStateChange = function() {
          if (!transport) return null ;
          var ret = transport.finishRequest();
          if (ret) transport = null ; // cleanup memory
          return ret ;
        };
        rawRequest.onreadystatechange = handleReadyStateChange;
      }
    }
    
    // initiate request.  
    rawRequest.open(this.get('type'), this.get('address'), async ) ;
    
    // headers need to be set *after* the open call.
    headers = this.getPath('request.headers') ;
    for (var headerKey in headers) {
      rawRequest.setRequestHeader(headerKey, headers[headerKey]) ;
    }

    // now send the actual request body - for sync requests browser will
    // block here
    rawRequest.send(this.getPath('request.encodedBody')) ;
    if (!async) this.finishRequest() ; // not async
    
    return rawRequest ;
  },
  
  /**
    Creates the correct XMLHttpRequest object for this browser.

    You can override this if you need to, for example, create an XHR on a
    different domain name from an iframe.

    @returns {XMLHttpRequest|ActiveXObject}
  */
  createRequest: function() {
    // Get an XHR object
    function tryThese() {
      for (var i=0; i < arguments.length; i++) {
        try {
          var item = arguments[i]() ;
          return item ;
        } catch (e) {}
      }
      return NO;
    }

    return tryThese(
      function() { return new XMLHttpRequest(); },
      function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
      function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
    );
  },

  /**  @private
  
    Called by the XHR when it responds with some final results.
    
    @param {XMLHttpRequest} rawRequest the actual request
    @returns {SC.XHRRequestTransport} receiver
  */
  finishRequest: function(evt) {
    var rawRequest = this.get('rawRequest'),
        readyState = rawRequest.readyState,
        error, status, msg;

    if (readyState === 4 && !this.get('timedOut')) {
      this.receive(function(proceed) {
        if (!proceed) return ; // skip receiving...
      
        // collect the status and decide if we're in an error state or not
        status = -1 ;
        try {
          status = rawRequest.status || 0;
        } catch (e) {}

        // if there was an error - setup error and save it
        if ((status < 200) || (status >= 300)) {
          
          try {
            msg = rawRequest.statusText || '';
          } catch(e2) {
            msg = '';
          }
          
          error = SC.$error(msg || "HTTP Request failed", "Request", status) ;
          error.set("errorValue", this) ;
          this.set('isError', YES);
          this.set('errorObject', error);
        }

        // set the status - this will trigger changes on relatedp properties
        this.set('status', status);
      
      }, this);

      // Avoid memory leaks
      if (!SC.browser.msie && !SC.browser.opera) {
        SC.Event.remove(rawRequest, 'readystatechange', this, this.finishRequest);	  
      } else {
        rawRequest.onreadystatechange = null;
      }

      return YES;
    }
    return NO; 
  }

  
});
