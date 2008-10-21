// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core');
require('foundation/object') ;
require('mixins/request_helpers') ;

/** Encoding constant for JSON */
SC.JSON_ENCODING = "text/json" ;
SC.FORM_URL_ENCODING = "application/x-www-form-urlencoded" ;

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
    The HTTP status from the latest response.
    
    @property {Number}
  */
  responseStatus: null,
  
  /**
    YES when this request is either inflight or pending (i.e. waiting on 
    another request to finish before it can begin).
    
    @property {Boolean}
  */
  isPending: NO,
  
  /** 
    YES when this request is inflight.
    
    @property {Boolean}
  */
  isInflight: NO,

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
    The content type to use when encoding body data for the server.  You
    may specify any of the standard encoding types defined in the constants
    section or you can define your own.  If you define your own, you will
    need to subclass SC.Request and override the encodeBody() and decodeBody()
    methods.
    
    Note that the content type is only used when you are sending body content
    to the server.  If you only send query parameters, they will always be
    url encoded.
    
    @property {String}
  */
  contentType: SC.JSON_ENCODING,
  
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
    The request URL.  You can pass a variety of values to this string
    including a complete URL with query parameters, or just the path.  You
    can also pass template options using the URL template standard. (i.e.
    variables are denoted with a {VariableName}).  Template options will be
    merged in just before the URL is issued.
    
    @property {String}
  */
  url: '',

  /**
    Options to merge into the URL template just before a request is issued.
    If you are not using a URL template, you can just leave this null and the
    feature will not be enabled.
    
    Note that you can also set template options using the option() and 
    options() helper.
  */
  templateOptions: null,
  
  /**
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
    The type of data you are expecting back from the server.  If this is null,
    then SproutCore will do its best to guess based on the content type.  You
    will not usually need to change this property.

    This property takes one of the content types specified in the 
    SC.Request.contentTypes hash also.
    
    This property can also be set with with the expectResponseContentType()
    helper.
  */
  responseContentType: null,
  
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
    
    SC.RESERVED_REQUEST = a slot will be reserved for this request.  
    SC.NORMAL_REQUEST = this request will queue with others
    SC.CANCELLABLE_REQUEST = request will queue with others but will be 
      cancelled if a reserved request needs the spot.
    SC.OPTIONAL_REQUEST = request will be cancelled if another request is in
    
    The default is NORMAL_REQUEST, but if possible you should make your 
    requests cancellable.
  */
  requestPriority: SC.NORMAL_REQUEST,
  
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
    return this ;
  },
  
  /** @private 
    invoked by the request helpers to make sure they are working with an
    instance of the request.  See also SC.Request._prepare.
  */
  _prepare: function() { return this; },
  
  /** 
    Creates a new XMLHTTPRequest object.  You can override or replace this
    method if needed.
  */
  xhr: function() {
		return window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
  }
  
});

// Called by request helpers to make sure they are working on an instance
// of the request.  See also SC.Request.prototype._prepare
SC.Request._prepare = function() { return this.create(); } ;
SC.mixin(SC.Request, SC.RequestHelpers) ;
