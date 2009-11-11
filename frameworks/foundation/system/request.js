// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/response');

/**
  @class
  
  Implements support for Ajax requests using XHR, JSON-P and other prototcols.
  
  SC.Request is much like an inverted version of the request/response objects
  you receive when implement HTTP servers.  
  
  To send a request, you just need to create your request object, configure
  your options, and call send() to initiate the request.
  
  @extends SC.Object
  @extends SC.Copyable
  @extends SC.Freezable
  @since SproutCore 1.0
*/

SC.Request = SC.Object.extend(SC.Copyable, SC.Freezable,
  /** @scope SC.Request.prototype */ {
  
  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    Sends the request asynchronously instead of blocking the browser.  You
    should almost always make requests asynchronous.  You can change this 
    options with the async() helper option (or simply set it directly).
    
    Defaults to YES. 
    
    @property {Boolean}
  */
  isAsynchronous: YES,

  /**
    Processes the request and response as JSON if possible.  You can change
    this option with the json() helper method.

    Defaults to NO 
    
    @property {Boolean}
  */
  isJSON: NO,

  /**
    Process the request and response as XML if possible.  You can change this
    option with the xml() helper method.
    
    Defaults to NO
  
    @property {Boolean}
  */
  isXML: NO,
  
  /**
    Current set of headers for the request
  */
  headers: function() {
    var ret = this._headers ;
    if (!ret) ret = this._headers = {} ;
    return ret ;  
  }.property().cacheable(),

  /**
    Underlying response class to actually handle this request.  Currently the
    only supported option is SC.XHRResponse which uses a traditional
    XHR transport.
    
    @property {SC.Response}
  */
  responseClass: SC.XHRResponse,

  /**
    The original request for copied requests.
    
    @property {SC.Request}
  */
  source: null,
  
  /**
    The URL this request to go to.
    
    @param {String}
  */
  address: null,
  
  /**
    The HTTP method to use.
    
    @param {String}
  */
  type: 'GET',
  
  /**
    The body of the request.  May be an object is isJSON or isXML is set,
    otherwise should be a string.
  */
  body: null,
  
  /**
    The body, encoded as JSON or XML if needed.
  */
  encodedBody: function() {
    // TODO: support XML
    var ret = this.get('body');
    if (ret && this.get('isJSON')) ret = SC.json.encode(ret);
    return ret ;
  }.property('isJSON', 'isXML', 'body').cacheable(),

  // ..........................................................
  // CALLBACKS
  // 
  
  /**
    Invoked on the original request object just before a copied request is 
    frozen and then sent to the server.  This gives you one last change to 
    fixup the request; possibly adding headers and other options.
    
    If you do not want the request to actually send, call cancel().
    
    @param {SC.Request} request a copy of the request, not frozen
    @returns {void}
  */
  willSend: function(request, response) {},
  
  /**
    Invoked on the original request object just after the request is sent to
    the server.  You might use this callback to update some state in your 
    application.
    
    The passed request is a frozen copy of the request, indicating the 
    options set at the time of the request.
    
    @param {SC.Request} request a copy of the request, frozen
    @param {SC.Response} response the object that will carry the response
    @returns {void}
  */
  didSend: function(request, response) {},
  
  /**
    Invoked when a response has been received but not yet processed.  This is
    your chance to fixup the response based on the results.  If you don't want
    to continue processing the response call response.cancel().
    
    @param {SC.Response} response the response
    @returns {void}
  */
  willReceive: function(request, response) {},
  
  /**
    Invoked after a response has been processed but before any listeners are
    notified.  You can do any standard processing on the request at this 
    point.  If you don't want to allow notifications to continue, call
    response.cancel()
    
    @param {SC.Response} response reponse
    @returns {void}
  */
  didReceive: function(request, response) {},
  
  // ..........................................................
  // HELPER METHODS
  // 

  COPY_KEYS: 'isAsynchronous isJSON isXML address type body responseClass willSend didSend willReceive didReceive'.w(),
  
  /**
    Returns a copy of the current request.  This will only copy certain
    properties so if you want to add additional properties to the copy you
    will need to override copy() in a subclass.
    
    @returns {SC.Request} new request
  */
  copy: function() {
    var ret = {},
        keys = this.COPY_KEYS,
        loc  = keys.length, 
        key, listeners, headers;
        
    while(--loc>=0) {
      key = keys[loc];
      if (this.hasOwnProperty(key)) ret[key] = this.get(key);
    }
    
    if (this.hasOwnProperty('listeners')) {
      ret.listeners = SC.copy(this.get('listeners'));
    }
    
    if (this.hasOwnProperty('_headers')) {
      ret._headers = SC.copy(this._headers);
    }
    
    ret.source = this.get('source') || this ;
    
    return this.constructor.create(ret);
  },
  
  /**
    To set headers on the request object.  Pass either a single key/value 
    pair or a hash of key/value pairs.  If you pass only a header name, this
    will return the current value of the header.
    
    @param {String|Hash} key
    @param {String} value
    @returns {SC.Request|Object} receiver
  */
  header: function(key, value) {
    var headers;
    
    if (SC.typeOf(key) === SC.T_STRING) {
      headers = this._headers ;
      if (arguments.length===1) {
        return headers ? headers[key] : null;
      } else {
        this.propertyWillChange('headers');
        if (!headers) headers = this._headers = {};
        headers[key] = value;
        this.propertyDidChange('headers');
        return this;
      }
    
    // handle parsing hash of parameters
    } else if (value === undefined) {
      headers = key;
      this.beginPropertyChanges();
      for(key in headers) {
        if (!headers.hasOwnProperty(key)) continue ;
        this.header(key, headers[key]);
      }
      this.endPropertyChanges();
      return this;
    }

    return this ;
  },
  
  /**
    Converts the current request to use JSON.
    
    @property {Boolean} flag YES to make JSON, NO or undefined
    @returns {SC.Request} receiver
  */
  json: function(flag) {
    if (flag === undefined) flag = YES;
    if (flag) this.set('isXML', NO);
    return this.set('isJSON', flag);
  },
  
  /**
    Converts the current request to use XML.
    
    @property {Boolean} flag YES to make XML, NO or undefined
    @returns {SC.Request} recevier
  */
  xml: function(flag) {
    if (flag === undefined) flag = YES ;
    if (flag) this.set('isJSON', NO);
    return this.set('isXML', flag);
  },
  
  /** 
    Called just before a request is enqueued.  This will encode the body 
    into JSON if it is not already encoded.
  */
  _prep: function() {
    var hasContentType = !!this.header('Content-Type');
    if (this.get('isJSON') && !hasContentType) {
      this.header('Content-Type', 'application/json');
    } else if (this.get('isXML') && !hasContentType) {
      this.header('Content-Type', 'text/xml');
    }
    return this ;
  },
  
  /**
    Will fire the actual request.  If you have set the request to use JSON 
    mode then you can pass any object that can be converted to JSON as the 
    body.  Otherwise you should pass a string body.
    
    @param {String|Object} body (optional)
    @returns {SC.Response} new response object
  */  
  send: function(body) {
    if (body) this.set('body', body);
    return SC.Request.manager.sendRequest(this.copy()._prep());
  },

  /**
    Resends the current request.  This is more efficient than calling send()
    for requests that have already been used in a send.  Otherwise acts just
    like send().  Does not take a body argument.
    
    @returns {SC.Response} new response object
  */
  resend: function() {
    var req = this.get('source') ? this : this.copy()._prep();
    return SC.Request.manager.sendRequest(req);
  },
  
  /**
    Configures a callback to execute when a request completes.  You must pass
    at least a target and action/method to this and optionally a status code.
    You may also pass additional parameters which will be passed along to your
    callback.
    
    h2. Scoping With Status Codes
    
    If you pass a status code as the first option to this method, then your 
    notification callback will only be called if the response status matches
    the code.  For example, if you pass 201 (or SC.Request.CREATED) then 
    your method will only be called if the response status from the server
    is 201.
    
    You can also pass "generic" status codes such as 200, 300, or 400, which
    will be invoked anytime the status code is the range if a more specific 
    notifier was not registered first and returned YES.  
    
    Finally, passing a status code of 0 or no status at all will cause your
    method to be executed no matter what the resulting status is unless a 
    more specific notifier was registered and returned YES.
    
    h2. Callback Format
    
    Your notification callback should expect to receive the Response object
    as the first parameter plus any additional parameters that you pass.  
    
    @param {Number} status
    @param {Object} target
    @param {String|function} action
    @param {Hash} params
    @returns {SC.Request} receiver
  */
  notify: function(status, target, action, params) {
    
    // normalize status
    var hasStatus = YES, params ;
    if (SC.typeOf(status) !== SC.T_NUMBER) {
      params = SC.A(arguments).slice(2);
      action = target;
      target = status;
      status = 0 ;
      hasStatus = NO ;
    } else params = SC.A(arguments).slice(3);
    
    var listeners = this.get('listeners');
    if (!listeners) this.set('listeners', listeners = {});
    listeners[status] = { target: target, action: action, params: params };

    return this;
  }
    
});

SC.Request.mixin(/** @scope SC.Request */ {
  
  /**
    Helper method for quickly setting up a GET request.

    @param {String} address url of request
    @returns {SC.Request} receiver
  */
  getUrl: function(address) {
    return this.create().set('address', address).set('type', 'GET');
  },

  /**
    Helper method for quickly setting up a POST request.

    @param {String} address url of request
    @param {String} body
    @returns {SC.Request} receiver
  */
  postUrl: function(address, body) {
    var req = this.create().set('address', address).set('type', 'POST');
    if(body) req.set('body', body) ;
    return req ;
  },

  /**
    Helper method for quickly setting up a DELETE request.

    @param {String} address url of request
    @returns {SC.Request} receiver
  */
  deleteUrl: function(address) {
    return this.create().set('address', address).set('type', 'DELETE');
  },

  /**
    Helper method for quickly setting up a PUT request.

    @param {String} address url of request
    @param {String} body
    @returns {SC.Request} receiver
  */
  putUrl: function(address, body) {
    var req = this.create().set('address', address).set('type', 'PUT');
    if(body) req.set('body', body) ;
    return req ;
  }
  
});



/**
  The request manager coordinates all of the active XHR requests.  It will
  only allow a certain number of requests to be active at a time; queuing 
  any others.  This allows you more precise control over which requests load
  in which order.
*/
SC.Request.manager = SC.Object.create( SC.DelegateSupport, {

  /**
    Maximum number of concurrent requests allowed.  6 for all browsers.
    
    @property {Number}
  */
  maxRequests: 6,

  /**
    Current requests that are inflight.
    
    @property {Array}
  */
  inflight: [],
  
  /**
    Requests that are pending and have not been started yet.
  
    @property {Array}
  */
  pending: [],

  // ..........................................................
  // METHODS
  // 
  
  /**
    Invoked by the send() method on a request.  This will create a new low-
    level transport object and queue it if needed.
    
    @param {SC.Request} request the request to send
    @returns {SC.Object} response object
  */
  sendRequest: function(request) {
    if (!request) return null ;
    
    // create low-level transport.  copy all critical data for request over
    // so that if the request has been reconfigured the transport will still
    // work.
    var response = request.get('responseClass').create({ request: request });

    // add to pending queue
    this.get('pending').pushObject(response);
    this.fireRequestIfNeeded();
    
    return response ;
  },

  /** 
    Cancels a specific request.  If the request is pending it will simply
    be removed.  Otherwise it will actually be cancelled.
    
    @param {Object} response a response object
    @returns {Boolean} YES if cancelled
  */
  cancel: function(response) {

    var pending = this.get('pending'),
        inflight = this.get('inflight'),
        idx ;

    if (pending.indexOf(response) >= 0) {
      this.propertyWillChange('pending');
      pending.removeObject(response);
      this.propertyDidChange('pending');
      return YES;
      
    } else if (inflight.indexOf(response) >= 0) {
      
      response.cancel();
      
      inflight.removeObject(response);
      this.fireRequestIfNeeded();
      return YES;

    } else return NO ;
  },  

  /**
    Cancels all inflight and pending requests.  
    
    @returns {Boolean} YES if any items were cancelled.
  */
  cancelAll: function() {
    if (this.get('pending').length || this.get('inflight').length) {
      this.set('pending', []);
      this.get('inflight').forEach(function(r) { r.cancel(); });
      this.set('inflight', []);
      return YES;
      
    } else return NO ;
  },
  
  /**
    Checks the inflight queue.  If there is an open slot, this will move a 
    request from pending to inflight.
    
    @returns {Object} receiver
  */
  fireRequestIfNeeded: function() {
    var pending = this.get('pending'), 
        inflight = this.get('inflight'),
        max = this.get('maxRequests'),
        next ;
        
    if ((pending.length>0) && (inflight.length<max)) {
      next = pending.shiftObject();
      inflight.pushObject(next);
      next.fire();
    }
  },

  /**
    Called by a response/transport object when finishes running.  Removes 
    the transport from the queue and kicks off the next one.
  */
  transportDidClose: function(response) {
    this.get('inflight').removeObject(response);
    this.fireRequestIfNeeded();
  }
  
});
