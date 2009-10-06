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
  @since SproutCore 1.0
*/

SC.Request = SC.Object.extend(
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
  
  rawResponse: null,
  error: null,

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
  
  // ..........................................................
  // HELPER METHODS
  // 

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
    Will fire the actual request.  If you have set the request to use JSON 
    mode then you can pass any object that can be converted to JSON as the 
    body.  Otherwise you should pass a string body.
    
    @param {String|Object} body (optional)
    @returns {SC.Response} new response object
  */  
  send: function(body) {
    var isJSON = this.get('isJSON');

    if (!body) this.set('body', body);
    else body = this.get('body');
    
    // Set the content-type to JSON (many browsers will otherwise default it
    // to XML).
    if (isJSON && !this.header('Content-Type')) {
      this.header('Content-Type', 'application/json');
    }

    if (body && isJSON) {
      body = SC.json.encode(body);

      if (body===undefined) {
        console.error('There was an error encoding to JSON');
      }

      this.set('body', body) ;
    }
    
    return SC.Request.manager.sendRequest(this) ;
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
    
    @param {Object} target
    @param {String|function} action
    @param {Hash} params
    @returns {SC.Request} receiver
  */
  notify: function(status, target, action) {
    
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
  },
  
  /**
    Response method
    
    @returns {Object} response
  */
  response: function() {
    var response = this.get("rawResponse") ;
    if (!response || !SC.$ok(response) || response.responseText.trim()==='') {
        return response ;
    }
    
    if (this.get("isJSON")) {
      var source = response.responseText ;
      try{
        var json = SC.json.decode(source) ;
      }catch(e){
        json = response.responseText ;
      }
      //TODO cache this value?
      return json ;
    }
    
    if(response.responseXML) return response.responseXML ;
    return response.responseText ;
  }.property('rawResponse').cacheable()
  
});

/**
  Helper method for quickly setting up a GET request.
  
  @param {String} address url of request
  @returns {SC.Request} receiver
*/
SC.Request.getUrl = function(address) {
  return SC.Request.create().set('address', address).set('type', 'GET');
};

/**
  Helper method for quickly setting up a POST request.
  
  @param {String} address url of request
  @param {String} body
  @returns {SC.Request} receiver
*/
SC.Request.postUrl = function(address, body) {
  var req = SC.Request.create().set('address', address).set('type', 'POST');
  if(body) req.set('body', body) ;
  return req ;
};

/**
  Helper method for quickly setting up a DELETE request.
  
  @param {String} address url of request
  @returns {SC.Request} receiver
*/
SC.Request.deleteUrl = function(address) {
  return SC.Request.create().set('address', address).set('type', 'DELETE');
};

/**
  Helper method for quickly setting up a PUT request.
  
  @param {String} address url of request
  @param {String} body
  @returns {SC.Request} receiver
*/
SC.Request.putUrl = function(address, body) {
  var req = SC.Request.create().set('address', address).set('type', 'PUT');
  if(body) req.set('body', body) ;
  return req ;
};

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
    var response = request.get('responseClass').create({
      request: request,

      type:    request.get('type'),
      address: request.get('address'),
      requestHeaders: SC.copy(request.headers()),
      requestBosy:    request.get('body'),
      isAsynchronous: request.get('isAsynchronous'),
      
      listeners:  SC.copy(request.get('listeners') || {}),
      isJSON:  request.get('isJSON'),
      isXML:   request.get('isXML')
    });

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
