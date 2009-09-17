// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*global ActiveXObject */

/**
  Description to come.
  
  @since SproutCore 1.0
*/

SC.Request = SC.Object.extend({
  
  isAsynchronous: true,
  rawResponse: null,
  error: null,
  transportClass: null,
  isJSON: false,
  
  /**
    Sets up the request object
  */
  init: function(){
    sc_super() ;  
    this._headers = {};
  },
  
  /**
    To set headers on the request object
    
    @param {String} key
    @param {String} value
    @returns {SC.Request} receiver
  */
  header: function(key, value) {
    if (typeof key == 'object' && !value) {
      for (var headerKey in key) {
        this.header(headerKey,key[headerKey]) ;
      }
      return this;
    }
    
    if (typeof key == 'string' && !value) {
      return this._headers[key] ;
    }
    
    this.propertyWillChange('headers') ;
    
    //set value for key
    this._headers[key] = value ;
    
    this.propertyDidChange('headers') ;
    return this ;
  },
  
  /**
    Will fire the actual request.
    
    @param {String} body (optional)
    @returns {SC.Request} receiver
  */  
  send: function(body) {
    var request = this ; 
    
    var isJSON = request.get('isJSON');
    
    // Set the content-type to JSON (many browsers will otherwise default it
    // to XML).
    if (isJSON) request.header('Content-Type', 'application/json');
    
    if (body) {
      if (isJSON) {
        body=SC.json.encode(body);
        if(body===undefined) console.error('There was an error encoding to JSON');
      }
      request.set('body', body) ;
    }
    SC.Request.manager.sendRequest(request) ;
    return request ;
  },

  /**
    Set up notifications.
    
    @param {Object} target
    @param {String|function} action
    @param {Hash} params
    @returns {SC.Request} receiver
  */
  notify: function(target, action, params) {
    if (SC.typeOf(action) === SC.T_STRING) action = target[action];
    this.set('notifyTarget', target)
    .set('notifyAction', action)
    .set('notifyParams', params);
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
  var req = SC.Request.create() ;
  req.set('address', address) ;
  req.set('type', 'GET') ;
  
  return req ;
};

/**
  Helper method for quickly setting up a POST request.
  
  @param {String} address url of request
  @param {String} body
  @returns {SC.Request} receiver
*/
SC.Request.postUrl = function(address, body) {
  var req = SC.Request.create() ;
  req.set('address',address) ;
  if(body) req.set('body', body) ;
  req.set('type', 'POST') ;
  
  return req ;
};

/**
  Helper method for quickly setting up a DELETE request.
  
  @param {String} address url of request
  @returns {SC.Request} receiver
*/
SC.Request.deleteUrl = function(address) {
  var req = SC.Request.create() ;
  req.set('address',address) ;
  req.set('type', 'DELETE') ;
  
  return req ;
};

/**
  Helper method for quickly setting up a PUT request.
  
  @param {String} address url of request
  @param {String} body
  @returns {SC.Request} receiver
*/
SC.Request.putUrl = function(address, body) {
  var req = SC.Request.create() ;
  req.set('address',address) ;
  if(body) req.set('body', body) ;
  req.set('type', 'PUT') ;
  
  return req ;
};

/**
  The request manager.
  More description to come.
*/
SC.Request.manager = SC.Object.create( SC.DelegateSupport, {
  maxRequests: 2,
  
  currentRequests: [],
  queue: [],
  
  canLoadAnotherRequest: function() {
    return (this.get('numberOfCurrentRequests') < this.get('maxRequests')) ;
  }.property('numberOfCurrentRequests', 'maxRequests'),
  
  numberOfCurrentRequests: function() {
    return this.get('currentRequests').length ;
  }.property('currentRequests'),
  
  numberOfRequests: function() {
    return this.get('queue').length ;
  }.property('queue'),
  
  sendRequest: function(request) {
    if(!request) return;
    
    request = { 
      request: request, 
      action:  request.get('notifyAction'),
      target:  request.get('notifyTarget'),
      params:  request.get('notifyParams') };
    
    this.propertyWillChange("queue");
    this.get('queue').pushObject(request);
    this.propertyDidChange("queue");
    
    this.fireRequestIfNeeded();
  },
  
  removeRequest: function(request) {
    this.get('queue').removeObject(request);
    return YES;
  },  
  
  cancelAllRequests: function() {
    var r, xhrRequest;
    this.set('queue', []);
    var activeRequests=this.get('currentRequests');
    while(r=activeRequests.shiftObject()){
      xhrRequest = r.get('request');
      xhrRequest.abort();
    }
    return YES;
  },
  
  fireRequestIfNeeded: function() {
    if (this.canLoadAnotherRequest()) {
      this.propertyWillChange('queue') ;
      var item = this.get('queue').shiftObject() ;
      this.propertyDidChange('queue') ;
      
      if (item) {
        var transportClass = item.request.get('transportClass') ;
        if (!transportClass) transportClass = this.get('transportClass') ;
        
        if (transportClass) {
          var transport = this.transportClass.create(item) ;
          if (transport) {
            item.request.set('transport', transport) ;
            this._transportDidOpen(transport) ;
          }
        }
      }
    }
  }.observes('currentRequests'),
  
  _transportDidOpen: function(transport) {
    this.propertyWillChange('currentRequests') ;
    this.get('currentRequests').pushObject(transport) ;
    this.propertyDidChange('currentRequests') ;
    transport.fire() ;
  },
  
  transportDidClose: function(request) {
    this.propertyWillChange('currentRequests') ;
    this.get('currentRequests').removeObject(request) ;
    this.propertyDidChange('currentRequests') ;
  }
  
});

// abstract superclass, creates no-op objects
SC.RequestTransport = SC.Object.extend({
  
  fire: function() {
    SC.Request.manager.transportDidClose(this) ;
  }
  
});

SC.XHRRequestTransport = SC.RequestTransport.extend({
  
  fire: function() {
    
    var tryThese = function() {
      for (var i=0; i < arguments.length; i++) {
        try {
          var item = arguments[i]() ;
          return item ;
        } catch (e) {}
      }
      return NO;
    };
    
    var rawRequest = tryThese(
      function() { return new XMLHttpRequest(); },
      function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
      function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
    );
    
    var request = this.get('request') ;
    
    rawRequest.source = request;
    
    
    //Part of the fix for IE
    var transport=this;
    var handleReadyStateChange = function() {
      return transport.finishRequest(rawRequest) ;
    };
    //End of the fix for IE
    
    var async = (request.get('isAsynchronous') ? YES : NO) ;
    if (async) {
      if (!SC.browser.msie) {
        SC.Event.add(rawRequest, 'readystatechange', this, handleReadyStateChange, rawRequest) ;
      } else rawRequest.onreadystatechange = handleReadyStateChange;
    }
    
    
    
    rawRequest.open( request.get('type'), request.get('address'), async ) ;
    
    // headers need to be set *After* the open call.
    var headers = request._headers ;
    for (var headerKey in headers) {
      rawRequest.setRequestHeader(headerKey, headers[headerKey]) ;
    }
    
    rawRequest.send(request.get('body')) ;
    
    if (!async) this.finishRequest(rawRequest) ;
    
    return rawRequest ;
  },
  
  didSucceed: function(request) {
    var status = null ;
    try {
        status = request.status || 0;
    } catch (e) {}
    return !status || (status >= 200 && status < 300) ;      
  },
  
  finishRequest: function(request) {
    
    var readyState = request.readyState ;
    var didSucceed = !request ? NO : this.didSucceed(request) ;
    
    if (readyState == 4) {
      request._complete = YES ;
      
      if (didSucceed) {
        var response = request ;
        request.source.set('rawResponse', response) ; 
      } else {
        var error = SC.$error("HTTP Request failed", "Fail", -1) ;
        error.set("request",request) ;
        request.source.set('rawResponse', error) ;
      }
      if (this.target && this.action) {
        SC.RunLoop.begin();
        this.action.call(this.target, request.source, this.params);
        SC.RunLoop.end();
      }
      
      SC.Request.manager.transportDidClose(this) ;
     }
     
     if (readyState == 4) {
       // avoid memory leak in MSIE: clean up
       request.onreadystatechange = function() {} ;
     }
  }

  
});

SC.Request.manager.set('transportClass', SC.XHRRequestTransport) ;
