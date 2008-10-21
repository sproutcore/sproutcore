// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('request/request') ;

/** @private
  This object will actually perform an XHR request to the server, based on 
  the current settings of an SC.Request object passed into the constructor.
  
  This is a private class that implements a requestor interface expected by 
  the manager.
*/
SC.Request.requestors.xhr = function(req) {
  // collect relevant information from the request.  we may not get another
  // chance.
  this.request = req ;
  this.method = req.get('method').toUpperCase() ;
  this.username = req.get('username') ;
  this.url = req.get('computedUrl') ;
  this.async = req.get('async') ;
  this.password = (this.username) ? req.get('password') : null ;
  this.headers = req.get('computedHeaders') ;
  this.timeout = req.get('timeout') ;
  this.body = (SC.Request._bodyMethods.indexOf(this.method)>=0) ? req._encodeRequestBody() : null;
  
  this.notifyTarget = req._notifyTarget; 
  this.notifyMethod = req._notifyMethod;
  return this ;
} ;

SC.Request.requestors.xhr.prototype = {

  /** @private Actually send the request to the server. */
  send: function() {
    
  },
  
  /** @private Cancel an inflight request, updating the request object. */
  cancel: function() {
    
  },
  
  /** @private Cleanup the object to avoid memory leaks. */
  destroy: function() {
    this._xhr = this.request = null ;
  },
  
  /** @private sends an XHR request */
  _sendXhr: function() {

    this.incrementProperty('pendingRequests') ;
    
    // build an XHR object to send.  May be saved in a queue.
    var xhr = this.xhr() ;
    var method = (this.get('method') || 'GET').toUpperCase() ;
    var username = this.get('username'), url = this.get('computedUrl');
    var async = this.get('async') ;
    if (username) {
      xhr.open(method, url, async, username, this.get('password')) ;
    } else xhr.open(method, url, async) ;
    
    // configure the headers
    var headers = this.get('computedHeaders') || {};
    try {
      for(var key in headers) xhr.setRequestHeader(key, headers[key]) ;
    } catch(e){}
    
    // get the data and encode it, if needed.
    var body = (SC.Request._bodyMethods.indexOf(method) >= 0) ? this._encodeRequestBody() : null ;

    
    // now, if no more requests are pending, initiate this one
    var timeout = this.get('timeout');
    if (pending <= 0) {
      this._performXhrRequest(xhr, body, timeout, async) ;
      
    // otherwise, add to pending queue
    } else {
      this._pendingQueue = this._pendingQueue || [] ;
      this._pendingQueue.push('_performXhrRequest', xhr, body, timeout, async) ;
    }
    
    return this ;
    
  },
  
  /** @private 
    actually performs the XHR request. May be called from queue. 
    Note that this method should never be called while another xhr is 
    outstanding.
  */
  _performXhrRequest: function(xhr, body, timeout, async) {
    if (this._xhr) {
      throw("_performXhrRequest was called with outstanding xhr");
    }
    
    this._xhr = xhr ; // save xhr.
    
    // notify delegate that we are about to send this request
    // this will give the delegate one last chance to update the xhr.
    this.invokeDelegateMethod(this.delegate, 'requestWillSend', this, xhr) ;
    
    // reset the request state
    this.beginPropertyChanges()
      .set('response', null).set('responseStatus', null)  
      .set('responseStatusText', null).set('isPending', YES)
    .endPropertyChanges() ;
    
    // if this is an async method, setup timer to periodically check the 
    // request and possible timeout timer.
    if (async) {
      
      // don't attach a handler to the XHR.  Just poll it instead.
      this._timer = SC.Timer.schedule({
        interval: 13, 
        repeats: YES,
        target: this, 
        action: this._pollXhrRequest
      }) ;

      // check the timeout also.
      if (timeout) this._timeoutTimer = SC.Timer.schedule({
        interval: timeout,
        target: this,
        action: this._xhrRequestDidTimeout
      }) ;
    }
    
    try {
      xhr.send(data) ;
    } catch(e) {} 
    
    // notify delegate
    this.invokeDelegateMethod(this.delegate, 'requestDidSend', this, xhr) ;
    
    // if not async, go ahead and update from the xhr.
    if (!async) this._pollXhrRequest() ;
  },
  
  /** @private 
    invoked periodically to check the status of an outstanding xhr
  */
  _pollXhrRequest: function(isTimeout) {
    // if no more xhr, then cancel polling
    var xhr = this._xhr ;
    var isDone = (!xhr || (isTimeout === "timeout") || xhr.readyState===4) ;
    
    // we are done, kill the timers.
    if (this._timer) this._timer.invalidate() ;
    if (this._timeoutTimer) this._timeoutTimer.invalidate() ;
    this._timer = this._timeoutTimer = this._xhr = null ;

    // now determine the new response value.
    
  },
  
  _xhrRequestDidTimeout: function() { this._pollXhrRequest("timeout"); },
  
  _sendJsonp: function() {
    return this ;
  },
  
  /** 
    Creates a new XMLHTTPRequest object.  You can override or replace this
    method if needed.
  */
  xhr: function() {
		return window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
  },

  /** @private 
    Generates a jsonp callback function and saves it before a send.
  */
  _prepareJsonpCallback: function() {
    var key = 'SC_handleJsonpResponse_%@'.fmt(SC.Request._callbackid++) ;
    var request = this ;
    
    // generate handler function
    window[key] = function(tmp) {
      request._handleJsonpResponse(key, tmp) ;
      
      // remove script tag
      var func = window[key] ;
      if (func.head) {
        func.head.removeChild(func.scriptTag) ;
        delete func.head;  delete func.scriptTag ;
      }
      
      // garbage collect
      window[key] = undefined; 
      try { delete window[key]; } catch(e) {} ;
      
      func = null ;
    } ;
    this._jsonpCallback = key ;
    return key ;
  },
  
  /** @private
    Invoked by jsonp response to handle the callback.  If the specified 
    request is still in flight, then do something.  Otherwise, drop on floor.
  */
  _handleJsonpResponse: function(callbackName, data) {
    if (this._jsonpCallback !== callbackName) return; // nothing to do.
    
    // else, handle executing on data.
  }
  
  
} ;
