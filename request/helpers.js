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

  /** @private Called by query() and option(). */
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
  query: function(key, value) {
    return this._updateHashProperty('queryParams', key, value);
  },

  /**
    Resets the query parameters so that new parameters you pass will replace
    the once already set on the request.
    
    @returns {SC.Request}
  */
  resetQuery: function() {
    return this._prepare().set('queryParams', null);
  },
  
  /**
    Sets a URL variable to be interpolated into the URL template.  You can
    also pass a hash and they will all be set.
  */
  template: function(key, value) {
    return this._updateHashProperty('templateParams', key, value) ;
  },
  
  /**
    Parses the passed URL and sets the path and queryParams.
  */
  url: function(url) {
    var ret = this._prepare() ;
    ret.beginPropertyChanges();
    
    // is there a queryString portion.
    var len, loc = url.indexOf('?') ;
    
    // set the path
    ret.set('path', (loc >= 0) ? url.slice(loc) : url) ;
    
    // now set query
    var query = url.split(/\?|=|&/) ; // break down URL
    len = query.length; // ignore path at front
    for(loc=1;loc<len;loc = loc+2) {
      var key = query[loc], value = query[loc+1] ;
      if (value && value.length>0) ret.query(key, value) ;
    }
    
    ret.endPropertyChanges();
    return ret ;
  },
  
  /**
    Set the url and optional params to the passed value and the method to GET.
  */
  getUrl: function(url, params) {
    return this._prepare().set('method', 'GET').url(url).query(params);
  },

  /**
    Sets the url and optional params and the method to JSONP
  */
  jsonp: function(url, params) {
    return this._prepare().set('method', 'JSONP').url(url).query(params);
  },
  
  /**
    Set the url and optional params to the passed value and the method to 
    POST.
  */
  postUrl: function(url, params) {
    return this._prepare().set('method', 'POST').url(url).query(params);
  },

  /**
    Set the url and optional params to the passed value and the method to PUT.
  */
  putUrl: function(url, params) {
    return this._prepare().set('method', 'PUT').url(url).query(params);
  },

  /**
    Set the url and optional params to the passed value and the method to 
    DELETE.
  */
  deleteUrl: function(url, params) {
    return this._prepare().set('method', 'DELETE').url(url).query(params);
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
    Set the format to use when sending data to the server and, optionally, the
    expected response format.  The requestFormat will be set as the 
    contentType for the request while the responseFormat will be used to set
    the accepts header.
    
    If you do not name a response format, then SproutCore will auto-detect
    the response based on the response content type.
    
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
