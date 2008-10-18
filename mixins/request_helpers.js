// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/**
  This mixin is applied to the SC.Request object to implement common helper
  methods for working with the request.  You will not usually need to 
  apply this mixin yourself, but you will often use these methods when working
  with a request.

  Most request options can be configured using set().  These helpers provide
  some additional support for common options.
  
  @since SproutCore 1.0
*/
SC.RequestHelpers = {
  
  /**
    Sets the body data with optional contentType encoding.
  */
  body: function(data, contentType) {
    var ret = this._prepare().set('requestBody', data) ;
    if (contentType) ret.set('contentType', contentType);
    return ret ;
  },

  /** @private Called by param() and option(). */
  _updateHashProperty: function(property, key, value) {
    
    // if no key/value is passed, just return this
    if (key === undefined) return this; 
    
    var ret = this._prepare() ;
    var hash = ret.get(property) || {};

    // update with hash if passed
    if ((value == undefined) && (SC.typeOf(key) === T_HASH)) {
      var data = key ;
      for(key in data) hash[key] = data[key] ;
    } else if (value == null) {
      delete hash[key] ;
    } else hash[key] = value ;
    
    ret.set(property, hash) ;
    return ret ;
  },
  
  /**
    Sets one or more query string values.  If you pass just one key/value
    pair, that pair will be added to the current set of query options.  If
    you pass a hash, all of them will be added.
  */
  param: function(key, value) {
    return this._updateHashProperty('queryParams', key, value);
  },

  /**
    Sets a URL variable to be interpolated into the URL template.  You can
    also pass a hash and they will all be set.
  */
  option: function(key, value) {
    return this._updateHashProperty('templateOptions', key, value) ;
  },
  
  /**
    Set the url and optional params to the passed value and the method to GET.
  */
  getUrl: function(url, params) {
    return this._prepare().set('method', 'GET')
      .set('url', url).param(params);
  },

  /**
    Sets the url and optional params and the method to JSONP
  */
  jsonp: function(url, params) {
    return this._prepare().set('method', 'JSONP')
      .set('url', url).param(params);
  },
  
  /**
    Set the url and optional params to the passed value and the method to 
    POST.
  */
  postUrl: function(url, options) {
    return this._prepare().set('method', 'POST')
      .set('url', url).param(params);
  },

  /**
    Set the url and optional params to the passed value and the method to PUT.
  */
  putUrl: function(url, options) {
    return this._prepare().set('method', 'PUT')
      .set('url', url).param(params);
  },

  /**
    Set the url and optional params to the passed value and the method to 
    DELETE.
  */
  deleteUrl: function(url, options) {
    return this._prepare().set('method', 'DELETE')
      .set('url', url).param(params);
  },

  /**
    Set a request header to the named key/value pair or to the hash if passed.
  */
  header: function(key, value) {
    this._updateHashProperty('headers', key, value) ;
  },
  
  /**
    Either adds the passed target/method as an observer to the response 
    property or sets the named target as the delegate if no method
    is provided.
  */
  notify: function(target, method) {
    if (target === undefined) return this ;

    var ret = this._prepare() ;
    if (method === undefined) {
      ret.set('delegate', target) ;
    } else ret.addObserver('response', target, method) ;
    return ret ;
  },
  
  /**
    Sets the data format for both sending and receiving data.  Usually you
    will only pass one format, which will be used in both direction, though
    you can pass a separate response format if you need.
    
    @param requestFormat {String} the request format, also used for response
    @param responseFormat {String} optional separate response format
    @returns {SC.Request}
  */
  format: function(requestFormat, responseFormat) {
    return this._prepare()
      .set('contentType', requestFormat)
      .set('responseContentType', responseFormat) ;
  }
  
} ;
