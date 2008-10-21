// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core');
require('foundation/object') ;
require('request/helpers') ;
require('foundation/error') ;

/** SC.Request priority.  See SC.Request.priority  */
SC.NORMAL_REQUEST = 10;

/** SC.Request priority.  See SC.Request.priority  */
SC.CANCELLABLE_REQUEST = 20 ;

/** SC.Request priority.  See SC.Request.priority  */
SC.OPTIONAL_REQUEST = 1000 ;

/**
  The ajax library provides low-level support for making requests to the a
  remove server using Ajax (and maybe JSONp?).  
  
  This part of the library uses code gratefully borrowed from the jQuery team.
  
  var response = SC.request.jsonp("/contact/1") ;
  
  var request = SC.request.get('/contact/1').complete(target, method)
  
  var r = SC.Request.get('/contact/1').notify(target, method);
  
  SC.Request.getUrl('/contact/1')
    .header('alpha', 'beta')
    .body(someData)
    .params(someParams)
    .notify(target, method)
    .set('async', NO)
    .send() ;
    
  Twitter.refreshController = SC.Object.create({

    request: SC.Request.getUrl('/twitter/{Username}.json'),
    
    refresh: function() {
      this.request.send('Username', 'okito');
    },
    
    responseDidChange: function() {
      // handle refrest
    }.observes('.request.response')
    
  }) ;
  
  
  @extends SC.Object
  @extends SC.RequestHelpers
  @extends SC.RequestDelegate 
  @extends SC.DelegateSupport
*/
SC.Request = SC.Object.extend(SC.RequestHelpers, SC.RequestDelegate, SC.DelegateSupport,
/** @scope SC.Request.prototype */ {

  /** 
    The current value of the most recently issued request.  While a request
    is in-flight, this property will have a null value.  Once the request
    has completed, it will contain the resulting value or an Error object.
    
    The code value of the error object will represent the return status 
    code from the server.
    
    @property {Object}
  */
  response: null,
  
  /**
    The headers from the latest request response.  This will be null while the
    request is inflight.
    
    @property {Hash}
  */
  responseHeaders: null,
  
  /**
    YES when this request is either inflight or pending (i.e. waiting on 
    another request to finish before it can begin).
    
    @property {Boolean}
  */
  isPending: NO,
  
  /** 
    If YES, browser will be allowed to cache responses when possible.
    
    @property {Boolean}
  */
  canCacheResponse: YES,
  
  /** 
    If NO, request will be sent async.
    
    @property {Boolean}
  */
  async: YES,
  
  /**
    The format to use when sending a request to the server.  This will be 
    used only for requests that include content in the body such as a post
    or put.  Note that the type you name here must have a matching entry 
    in the SC.Request.formats hash.  If you want to add support for your own
    format, consider writing an encoder for this hash.
    
    @property {String}
  */
  requestFormat: SC.JSON_FORMAT,

  /**
    The expected format to use when receiving a response for the server.  This
    will be used to build an accepts header for the request.  If you also
    set alwaysUseResponseFormat to YES, then SproutCore will assume your 
    response has the format you name here, even if the contentType is 
    different.
    
    If the value is null or an empty string, then the request will 
    auto-detect the format of the response.
  */
  responseFormat: null,
  
  /**
    If set to YES, then the content type in the response will be ignored and
    the response body will be interpreted according to the responseFormat you
    specify.  You will not usually need to set this option, but it is useful
    when working with badly behaved servers.
  */
  alwaysUseResponseFormat: NO,
  
  /**
    Data to be included in the body of the request.  This is only used if 
    the request method is a POST or PUT.  If query string options see 
    the queryParams option.
    
    @property {Object}
  */
  requestBody: null,
  
  /**
    Query string parameters to be appended to the URL.  Any hash you include
    here will be normalized with query strings embedded in the URL itself as
    well as any additional parameters needed by jsonp.
    
    @property {Hash}
  */
  queryParams: null,
  
  /**
    This is the path portion of the URL, which may include the hostname and
    protocol for cross-domain requests but no query parameters.  Note that 
    if you use the url() or other helper methods to pass a URL, you can
    pass query parameters and they will be parsed out for you.
    
    @property {String}
  */
  path: '',

  /**
    Template parameters to merge into the final URL.  This implementation 
    follows the OpenSearch specification described at:
    
http://www.opensearch.org/Specifications/OpenSearch/1.1#OpenSearch_URL_template_syntax
    
  */
  templateParams: null,
  
  /**o
    The request method.  This can be any standard HTTP method plus 'jsonp',
    which will allow you issue a cross-domain request using the JSON-P
    protocol.  The method name may be lower or upppercase.  Both will be
    treated the same.
  */
  method: 'get',
  
  /**
    Additional headers you want included in the request.
  */
  headers: null,
  
  /**
    Specifies a maximum time to wait for the request to timeout.  0 or null
    means no timeout.
  */
  timeout: null,
  
  /**
    Username to pass for an authenticated HTTP request. 
  */
  username: null,
  
  /**
    Password to pass for an authenticated HTTP request
  */
  password: null,
    
  /**
    For jsonp or script-style requests, this will determine the charset used
    to process the returned script.  Only needed for charset differences 
    between the remote and local content.
  */
  scriptCharset: null,
  
  /**
    Specify the name of the parameter to use when adding a callback function
    for JSONp requests.  This will override the default 'callback'.  This only
    matters if you set the requestContentType to SC.JSONP_ENCODING.
    
    This property cannot be set with a helper.
  */
  jsonpCallbackName: 'callback',
  
  /**
    Normally data passed into the requestData property will be converted to
    the target content type before sending.  If you do not want this to
    happen, you can set this value to NO.
  */
  shouldProcessData: YES,
  
  /**
    The xhr request for the currently inflight request. 
  */
  xhr: null,
  
  /**
    The overlapping request policy.  What happens if you ask to send the 
    same request again before the previous one completes.  Options are:
    
    SC.RESET_REQUEST = cancels the inflight request and issues a new one
    SC.CANCEL_REQUEST = cancels the new request
    SC.WAIT_FOR_REQUEST = waits for the previous request to complete
  */
  overlappingRequestPolicy: SC.WAIT_FOR_REQUEST,
  
  /**
    Number of repeats of this request pending.
  */
  pendingRequests: 0,
  
  /**
    Priority of this request vs other requests in the system.  Options are:
    
    - *SC.NORMAL_REQUEST* indicates a request should be sent when possible and cannot be cancelled to make room for other requests.  This is the most common and default priority.
    - *SC.CANCELLABLE_REQUEST* indicates that a request should be queued and sent when space is available but it may also be cancelled if a higher-priority request needs to be sent at the same time.  This priority actually gives the manager the most flexibility to optimize your requests while ensuring they are delivered eventually.  However, this priority should not be used if your server cannot recover from a cancelled request.
    - *SC.OPTIONAL_REQUEST* indicates that the request is optional and may not be issued at all of other requests are consuming available connections.  Note that unlike cancellable requests, optional requests will simply be cancelled if the maximum number of concurrent requests are currently in use.  This is most useful for background polling or other requests that need to occur regularly but that should take a back-seat to other foreground requests.
    
    The default is SC.NORMAL_REQUEST, but if possible you should make your 
    requests cancellable.
  */
  priority: SC.NORMAL_REQUEST,
  
  /**
    This is the delegate to notify about changes to the request status.
  */
  delegate: null,
  
  /**
    This method will send a new request to the server using the currently 
    configured properties.  If a request managed by the receiver is currently
    inflight, then the request will following the overlappingRequestPolicy
    you have configured.
    
    This method will also cause the response values to reset and will invoke
    the appropriate calls on your delegate if you have configured one.
    
    @returns {SC.Request}
  */
  send: function() {

    // check for pending requests.  Cancel if policy so dictates.
    // otherwise increase count
    var pending = this.get('pendingRequests') ;
    var policy = this.get('overlappingRequestPolicy') ;

    // if there are pending requests, implement the appropriate policy.
    if (pending > 0) {
      
      // cancel_request priority, just don't do anything.
      if (policy === SC.CANCEL_REQUEST) return this ;
      
      // reset_request, cancel inflight request so we can send the new one.
      if (policy === SC.RESET_REQUEST) {
        while(--pending >= 0) this.cancel() ;
      }
    }

    // increment the pending count so other methods will do the right thing
    this.incrementProperty('pendingRequests') ;
    this.setIfChanged('isPending', YES) ;

    // create a new requestor for this request.
    var requestor = new (SC.Request.requestors[SC._requestorType()])(this) ;

    // queue the requestor or execute it now.
    if (pending > 0) {
      var queue = this._pendingQueue ;
      if (!queue) queue = this._pendingQueue = [] ;
      queue.push(requestor) ;
    } else {
      this._requestor = requestor ;
      SC.Request.manager.schedule(requestor) ;
    }
    
    return this ;
  },
  
  /**
    Call this method to cancel the current inflight request.
  */
  cancel: function() {
    var requestor = this._requestor ;
    // ask the manager the cancel the request.  This will remove the request
    // from any queue and then call cancel on the requestor, which should 
    // in turn notify the receive that it has completed execution.
    if (requestor) SC.Request.manager.cancel(requestor) ;
  },
  
  /** @private
    This method is called by the SC.Request.manager when a requestor the
    receiver has scheduled is finished, regardless of whether the requestor
    finished or was cancelled.
  */
  requestorDidComplete: function(requestor) {

    // allow the requestor to cleanup any possibly memory leaks.
    requestor.destroy();

    // if this was the active requestor, get the next one and call it.
    var queue = this._pendingQueue ;
    if (this._requestor === requestor) {
      this._requestor = null ;
      if (queue && (requestor = queue.shift())) {
        this._requestor = requestor ;
        SC.Request.manager.schedule(requestor) ;
      }
    
    // otherwise, just remove the requestor from the queue.
    } else if (queue) {
      this._pendingQueue = queue.without(requestor) ;
    }

    // recalculate the number of pending requests.  This is safer than just
    // decrementing.
    var pending = (this._requestor ? 1 : 0) + this._pendingQueue.length;
    this.setIfChanged('pendingRequests', pending) ;
    this.setIfChanges('isPending', pending > 0) ;
  },
  
  /** Inspects the request to determine the requestor type. */
  _requestorType: function() {
    return (this.get('method').toUpperCase() === 'JSONP') ? 'jsonp' : 'xhr' ;
  },
  
  _encodeRequestBody: function() {
    var body = this.get('requestBody') ;
    var format = this.get('requestFormat') || SC.JSON_FORMAT ;
    var encoder = SC.Request.formats[format] ;
    if (!encoder) throw "Could not encode format %@".fmt(format) ;
    return encoder.encode(this, body) ;
  },
  
  /** @private 
    invoked by the request helpers to make sure they are working with an
    instance of the request.  See also SC.Request._prepare.
  */
  _prepare: function() { return this; },
  
  /**
    Returns the computed URL based on the current request settings.  The URL
    will be computed in the following way:
    
    1. Any query paramters will be added to the URL path
    2. If templateParameters are specified, they will be merged in.
    
    Note that this implementation does not enforce any namespace or required
    argument requirements for templateParameters.  It will simply do its best 
    to apply any parameters you specify.
    
    @property {String}
  */
  computedUrl: function() {
    
    var ret = this.get('path') ;
    var opts = this.get('templateParams') ;
    var query = this.get('queryParams') ;
    var useJsonp = this.get('method').toLowerCase() === 'jsonp' ;
    var canCache = this.get('canCacheResponse') ;

    if (useJsonp || !canCache) query = (query) ? SC.clone(query) : {} ;

    // if caching is disabled, uniq the query string also
    if (!canCache) query['_'] = Date.now() ;
    
    // now build the query string if there is one
    if (query) {
      var key, value, parts = [] ;
      for(key in query) if (value = query[key]) parts.push([key,value]) ;
      query = parts.invoke('join','=').join('&') ;
      ret = ret + '?' + query ;
    }
    
    // next, substitute any template options, if needed.
    if (opts) {
      ret = ret.replace(/\{(.*?)\??\}/g, function(x, key) {
        return opts[key]||opts[key.toLowerCase()]||opts[key.toUpperCase()];
      }) ;
    }
    
    return ret ;
    
  }.property('path', 'templateParams', 'queryParams', 'method', 'canCacheResponse', 'jsonpCallbackName'),
  
  /**
    Returns the headers to use for the requests, based on any custom headers
    plus a few standards.
  */
  computedHeaders: function() {
    var headers = this.get('headers') ;

    // If custom headers are found, normalize the keys first.
    if (headers) {
      var newHeaders = {} ;
      for(var key in headers) {
        var value = headers[key] ;
        key = key.toLowerCase().titleize().replace(' ','-') ;
        if (key.match(/^Http-/)) key = key.slice(5) ;
        newHeaders[key] = value ;
      }
      headers = newHeaders ;
    } else headers = {} ;
    
    // add Accepts header based on responseFormat.
    if (!headers['Accept']) {
      var format = this.get('responseFormat') ;
      if (format = (SC.Request.formats[format] || {}).accepts) {
        format = format + ',*/*' ;
      } else format = '*/*';
      headers['Accept'] = format ;
    }
    
    // add the X-Request-With
    if (!headers['X-Requested-With']) {
      headers['X-Requested-With'] = 'XMLHTTPRequest' ;
    }
    
    // add SproutCore header
    if (!headers['X-Sproutcore-Version']) {
      headers['X-Sproutcore-Version'] = '1.0' ;
    }
    
    // add Content-Type header
    if (!headers['Content-Type']) {
      var method = this.get('method').toUpperCase() ;
      var format = this.get('requestFormat') ;
      if (method && format && SC.Request._bodyMethods.indexOf(method) >= 0) {
        headers['Content-Type'] = format ;
      }
    }
    
    return headers ;
  }.property('headers', 'requestFormat', 'responseFormat', 'method')
  
});

SC.Request.mixin(SC.RequestHelpers, {

  /** @private
    Private objects that can actually perform requests using different 
    methods such as XHR and JSONP.
  */
  requestors: {},
  
  /**
    This hash is used to store helpers needed to support various file formats
    when working with XHR requests.
  */
  formats: {},

  /** 
    Add a format handler for one or more formats.  Pass in the handler 
    along with the contentTypes the handler should be used for.  If you do 
    not pass in any contentTypes, the handler will be registered for any
    type named in the accepts property.
    
    The handler you pass in must be a hash with the following format:
    
    {{{
      format = {
        // array of accepted content types for this response
        accepts: ['text/json', 'application/json'],
        
        // Encodes the passed data into a string to send.  The paramters 
        // include the request object and data to encode.
        encode: function(request, data) { ... },
        
        // Decodes contents of the XHR request or string into a response 
        // value.  Paramters include the request object and a string or XHR.
        // If an XHR is available, no data will be passed.
        decode: function(request, data, xhr) { ... }
      }
    }}}

    @param hander {Hash} the hash of handler functions
    @param contentType {String} one or more content types.
    @returns {Object} the receiver
  */
  registerFormat: function(handler, contentType) {
    var types, len, idx, min;
    if (contentType === undefined) {
      types = handler.accepts; min = 0 ;
      if (SC.typeOf(types) === SC.T_STRING) types = [types]; // force to array
    } else {
      types = arguments; min = 0 ;
    }
    len = idx = types.length ;
    while(--idx >= min) this[types[idx]] = handler ;
    return this ;
  },
  
  _prepare: function() { return this.create(); },
  _callbackid: 1,
  _bodyMethods: ['POST', 'PUT']
  
});
