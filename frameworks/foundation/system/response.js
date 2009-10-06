// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
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
    Original request
    
    @property {SC.Request}
  */
  request: null,

  /** 
    Type of request.  Must be an HTTP method.
  
    @property {String}
  */
  type:    '',
  
  /**
    URL of request. 
    
    @property {String}
  */
  address: '',
  
  /** @private
    Request headers.  Deleted as soon as request is sent
    
    @property {Hash}
  */
  requestHeaders: null,
  
  /** @private
    Request body.  Deleted as soon as request is sent.
    
    @property {String}
  */
  requestBody: null,

  /**
    If set then will attempt to automatically parse response as JSON 
    regardless of headers.
    
    @property {Boolean}
  */
  isJSON: NO,

  /**
    If set, then will attempt to automatically parse response as XML
    regarldess of headers.
    
    @property {Boolean}
  */
  isXML: NO,
  
  /**
    Hash of listeners configured for this request/response
  
    @property {Hash}
  */
  listeners: {},
  
  /**
    The response status code.  
  */
  status: 0,

  /**
    Headers from the response.  Computed on-demand
    
    @property {Hash}
  */
  headers: null,
  
  /**
    Response body.  If isJSON was set, will be parsed automatically.
    
    @property {Hash|String}
  */
  body: null,
  
  /** 
    @private
    @deprecated
  
    Alias for body.  Provides compatibility with older code.
    
    @property {Hash|String}
  */
  response: function() {
    return this.get('body');
  }.property('body').cacheable(),
  
  // ..........................................................
  // METHODS
  // 

  /**
    Default method just closes the connection.
  */
  fire: function() {
    this.notify();
    SC.Request.manager.transportDidClose(this) ;
  },

  /**
    Default method just closes the connection.
  */
  cancel: function() {
    this.notify();
    SC.Request.manager.transportDidClose(this) ;
  },
  
  /**
    Even once you send a request you can continue to configure listeners to
    fire when the request responds.  This won't have an effect if the 
    request was synchronous.
    
    @borrows SC.Request.prototype.notify
  */
  notify: function(status, target, action) {
    
    // normalize status
    var hasStatus = YES ;
    if (SC.typeOf(status) !== SC.T_NUMBER) {
      action = target;
      target = status;
      status = 0 ;
      hasStatus = NO ;
    }
    
    // normalize target/action
    var params = SC.A(arguments).slice(hasStatus ? 3 : 2);

    var listeners = this.get('listeners');
    if (!listeners) this.set('listeners', listeners = {});
    listeners[status] = { target: target, action: action, params: params };

    return this;
  },
    
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
  notifyListeners: function() {
    var listeners = this.get('listeners'), 
        status    = this.get('status'),
        baseStat  = Math.floor(status / 100) * 100,
        handled   = NO ;
        
    if (!listeners) return this ; // nothing to do
    
    SC.RunLoop.begin();
    handled = this._notifyListener(listeners, status);
    if (!handled) handled = this._notifyListener(listeners, baseStat);
    if (!handled) handled = this._notifyListener(listeners, 0);
    SC.RunLoop.end();
    
    return this ;
  },
  
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
  body: function() {
    var xhr = this.get('rawRequest'), ret ;
    if (!xhr) ret = null;
    else if (this.get('isJSON')) ret = SC.json.decode(xhr.responseText);
    else if (this.get('isXML')) ret = xhr.responseXML;
    else ret = xhr.responseText ;

    return ret ;
  }.property('status').cacheable(),
  
  
  fire: function() {
    
    var rawRequest, transport, handleReadyStateChange, async, headers;
    
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
    
    rawRequest = tryThese(
      function() { return new XMLHttpRequest(); },
      function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
      function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
    );
    
    // save it 
    this.set('rawRequest', rawRequest);
    
    // configure async callback - differs per browser...
    async = !!this.get('isAsynchronous') ;
    if (async) {
      if (!SC.browser.msie) {
        SC.Event.add(rawRequest, 'readystatechange', this, 
                     this.finishRequest, rawRequest) ;
      } else {
        transport=this;
        handleReadyStateChange = function() {
          if (!transport) return null ;
          var ret = transport.finishRequest();
          transport = null ; // cleanup memory
          return ret ;
        };
        rawRequest.onreadystatechange = handleReadyStateChange;
      }
    }
    
    // initiate request.  
    rawRequest.open(this.get('type'), this.get('address'), async ) ;
    
    // headers need to be set *after* the open call.
    headers = this.get('requestHeaders') ;
    for (var headerKey in headers) {
      rawRequest.setRequestHeader(headerKey, headers[headerKey]) ;
    }

    // now send the actual request body - for sync requests browser will
    // block here
    rawRequest.send(this.get('requestBody')) ;
    if (!async) this.finishRequest() ; // not async

    // allow cleanup.
    this.set('requestBody', null).set('requestHeaders', null);
    
    return rawRequest ;
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

    if (readyState === 4) {

      // collect the status and decide if we're in an error state or not
      status = -1 ;
      try {
        status = rawRequest.status || 0;
      } catch (e) {}

      // if there was an error - setup error and save it
      if ((status < 200) || (status >= 300)) {
        msg = rawRequest.statusText;
        error = SC.$error(msg || "HTTP Request failed", "Request", status) ;
        error.set("errorValue", this) ;
        this.set('isError', YES);
        this.set('errorObject', error);
      }

      // set the status - this will trigger changes on relatedp properties
      this.set('status', status);
      
      // notify target/action if set.
      this.notifyListeners();
      
      SC.Request.manager.transportDidClose(this) ;
     }
     
     if (readyState === 4) {
       // avoid memory leak in MSIE: clean up
       rawRequest.onreadystatechange = function() {} ;
     }
  }

  
});
