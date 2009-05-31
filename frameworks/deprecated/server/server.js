// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('core') ;

SC.URL_ENCODED_FORMAT = 'url-encoded' ;
SC.JSON_FORMAT = 'json';

// The Server object knows how to send requests to the server and how to
// get things back from the server.  It automatically handles situations
// such as 304 caching and queuing requests to send to the server later if
// the computer becomes disconnected from the internet.

// The Server object is designed to work with a resource oriented application.
// That is, you do someting like this:
//
// Server.request('resource','verb',{ parameters })
// or
// Server.create('resource',{ parameters })
// Server.refresh('resource',{ parameters })
// Server.update('resource',{ parameters })
// Server.destroy('resource',{ parameters })
//
// parameters include:
// onSuccess -- passes back returned text
// onFailure --
//
//
// SC.Record.refresh
// SC.Record.commit --> create/update
// SC.Record.destroy
SC.Server = SC.Object.extend({
  
  // Set this to the prefix for your app.  Server will use this to convert
  // record_type properties into recordTypes.
  prefix: null,
  
  // Set this string to the format to be used to set your resource and verb.
  urlFormat: '/%@/%@',
  
  // Set this string to either rails or json to set the post transport protocol
  postFormat: SC.URL_ENCODED_FORMAT,
  
  // Set this string to true when escaping the JSON string is necessary
  escapeJSON: true,
  
  // call this in your main to preload any data sent from the server with the
  // initial page load.
  preload: function(clientData) {
    if ((!clientData) || (clientData.size == 0)) return ;
    this.refreshRecordsWithData(clientData,SC.Record,null,false);
  },
  
  // This is the root method for accessing a server resource.  Pass in the
  // resource URL, verb name, and any parameters.  There are several special-
  // purpose parameters used also:
  //
  // onSuccess -- function invoked when request completes. Expects the format
  //              didSucceed(status,ajaxRequest,cacheCode,context)
  // onFailure -- function invoked when request fails. Same format.
  // requestContext -- simply passed back.
  // cacheCode -- String indicating the time of the last refresh.
  // url -- override the default url building with this url.
  //
  request: function(resource, action, ids, params, method) {
    
    // Get Settings and Options
    if (!params) params = {} ;
    var opts = {} ;
    var onSuccess = params.onSuccess; delete params.onSuccess;
    var onNotModified = params.onNotModified; delete params.onNotModified ;
    var onFailure = params.onFailure ; delete params.onFailure ;
    var context = params.requestContext ; delete params.requestContext ;
    var accept = params.accept ; delete params.accept ;
    var cacheCode = params.cacheCode; delete params.cacheCode ;
    // enable JSON for every operation
    var records = params.records ;
    if ((this.get('postFormat') == SC.JSON_FORMAT) && records) {
      params.records = (this.get('escapeJSON')) ? escape(records.toJSONString()) : records.toJSONString() ;
    }
    var url = params.url; delete params.url;
    
    opts.requestHeaders = {'Accept': 'application/json, text/javascript, application/xml, text/xml, text/html, */*'} ;
    if (accept) opts.requestHeaders['Accept'] = accept ;
    if (cacheCode) opts.requestHeaders['Sproutit-Cache'] = cacheCode ;
    opts.method = method || 'get' ;
    
    if (!url) url = this.urlFor(resource, action, ids, params, opts.method) ;
    
    // handle ids
    if (ids && ids.length > 1) {
      params.ids = [ids].flatten().join(',') ;
    }    
    
    // adds a custom HTTP header for remote requests
    opts.requestHeaders = {'X-SproutCore-Version' : '1.0'} ;
    
    // convert parameters.
    var parameters = this._toQueryString(params) ;
    if (parameters && parameters.length > 0) opts.parameters = parameters ;
    
    var request ; // save for later
    
    // Save callback functions.
    opts.onSuccess = function(request) {
      // var cacheCode = request.getHeader('Last-Modified') ;
      // if ((transport.status == '200') && (transport.responseText == '304 Not Modified')) {
      //   if (onNotModified) onNotModified(transport.status, transport, cacheCode,context);
      // } else {
        if (onSuccess) onSuccess(request.status, request, cacheCode,context);
      // }
    } ;
    
    opts.onFailure = function(request) {
      // var cacheCode = request.getHeader('Last-Modified') ;
      if (onFailure) onFailure(request.status, request, cacheCode,context);
    } ; 
    
    console.log('REQUEST: %@ %@'.fmt(opts.method, url)) ;
    
    var that = this ;
    var processRequestChange = function() {
      if (request.readyState == 4) {
          if (request.status == 200) opts.onSuccess.apply(that, [request]) ;
          else opts.onFailure.apply(that, [request]) ;
      }
    };
    
    var ajaxRequest = function(url, opts) {
      var opts = opts || {} ;
      request = false;
      
      if (window.XMLHttpRequest && !(window.ActiveXObject)) {
        try {
          request = new XMLHttpRequest();
        } catch(e) {
          request = false;
        }
      // branch for IE/Windows ActiveX version
      } else if (window.ActiveXObject) {
        try {
          request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch(e) {
          try {
            request = new ActiveXObject("Microsoft.XMLHTTP");
          } catch(e) {
            request = false;
          }
        }
      }
      
      if (request) {
        request.onreadystatechange = processRequestChange ;
        request.open(opts.method, url, true) ;
        request.send(opts.parameters || '') ;
      }
    }
    
    ajaxRequest(url, opts) ;
  },

  /**
    Generates the URL that is going to be called by this server. Note that you
    should only return relative URLs. You can only call resources that are on
    the same domain as where this script was downloaded from.

    @param {String} resource  the URL where the collection of the resource can be queried
    @param {String} action    the action that should be performed on the resource
    @param {Array} ids        array of identifiers of your model instances
    @param {Array} params     parameters that were passed to the SC.Server#request method
    @param {String} method    the HTTP method that will be used
    @returns {String} the URL to use in the request to the backend server
  **/
  urlFor: function(resource, action, ids, params, method) {
    var idPart = (ids && ids.length == 1) ? ids[0] : '';
    return this.urlFormat.format(resource, action) + idPart;
  },

  // RECORD METHODS
  // These methods do the basic record changes.

  
  // ..........................................
  // LIST
  // This is the method called by a collection to get an updated list of
  // records.
  listFor: function(opts) {
    var recordType = opts.recordType ;
    var resource = recordType.resourceURL() ;

    if (!resource) return false ;
    
    var order = opts.order || 'id' ;
    if (!(order instanceof Array)) order = [order] ;
    order = order.map(function(str){
      return str.decamelize() ; //rubyify
    }).join(',') ;

    params = {} ;
    if (opts.conditions) {
      var conditions = this._decamelizeData(opts.conditions) ;
      for(var key in conditions) {
        params[key] = conditions[key] ;
      }
    }
    
    params.requestContext = opts ;
    params.onSuccess = this._listSuccess.bind(this) ;
    params.onNotModified = this._listNotModified.bind(this) ;
    params.onFailure = this._listFailure.bind(this) ;
    if (opts.cacheCode) params.cacheCode = opts.cacheCode ;
    if (opts.offset) params.offset = opts.offset;
    if (opts.limit) params.limit = opts.limit ;
    if (order) params.order = order ;
    this.request(resource, this._listForAction, null, params, this._listMethod) ;
  },
  
  _listForAction: 'list',
  _listMethod: 'get',
  
  _listSuccess: function(status, transport, cacheCode, context) {
    var json = eval('json='+transport.responseText) ;
    if (!json) { console.log('invalid json!'); return; }
    
    // first, build any records passed back
    if (json.records) {
      this.refreshRecordsWithData(json.records,context.recordType,cacheCode,false);
    }
    
    // next, convert the list of ids into records.
    var recs = (json.ids) ? json.ids.map(function(guid) {
      return SC.Store.getRecordFor(guid,context.recordType) ;
    }) : [] ;
    
    // now invoke callback
    if (context.callback) context.callback(recs,json.count,cacheCode) ;
  },
  
  _listNotModified: function(status, transport, cacheCode, context) {
    if (context.callback) context.callback(null,null,null) ;
  },
  
  _listFailure: function(status, transport, cacheCode, records) {
    console.log('listFailed!') ;
  },
  
    
  // ..........................................
  // CREATE
  
  // send the records back to create them. added a special parameter to
  // the hash for each record, _guid, which will be used onSuccess.
  createRecords: function(records) { 
    if (!records || records.length == 0) return ;

    records = this._recordsByResource(records) ; // sort by resource.
    for(var resource in records) {
      if (resource == '*') continue ;
      
      var curRecords = records[resource] ;

      // collect data for records
      var server = this ; var context = {} ;
      var data = curRecords.map(function(rec) {
        var recData = server._decamelizeData(rec.getPropertyData()) ;
        recData._guid = SC.guidFor(rec) ;
        context[SC.guidFor(rec)] = rec ;
        return recData ;
      }) ;

      // issue request
      this.request(resource, this._createAction, null, {
        requestContext: context, 
        onSuccess: this._createSuccess.bind(this),
        onFailure: this._createFailure.bind(this),
        records: data
      }, this._createMethod) ;
    }
  },
  
  _createAction: 'create',
  _createMethod: 'post',

  // This method is called when a create is successful.  It first goes through
  // and assigns the primaryKey to each record.
  _createSuccess: function(status, transport, cacheCode, context) {
    var json = eval('json='+transport.responseText) ;
    if (!(json instanceof Array)) json = [json] ;
    
    // first go through and assign the primaryKey to each record.
    if (!context) context = {} ;
    json.forEach(function(data) {
      var guid = SC.guidFor(data) ;
      var rec = (guid) ? context[guid] : null ;
      if (rec) {
        var pk = rec.get('primaryKey') ;
        var dataKey = (pk == 'guid') ? 'id' : pk.decamelize().toLowerCase().replace(/\-/g,'_') ;
        rec.set(pk,data[dataKey]) ;
        rec.set('newRecord',false) ;
      }
    }) ;
    
    // now this method will work so go do it.
    this.refreshRecordsWithData(json,context._recordType,cacheCode,true) ;
  },
  
  _createFailure: function(status, transport, cacheCode, records) {
    console.log('createFailed!') ;
  },
  

  // ..........................................
  // REFRESH
  
  refreshRecords: function(records) {
    if (!records || records.length == 0) return ;

    records = this._recordsByResource(records) ; // sort by resource.
    for(var resource in records) {
      if (resource == '*') continue ;
      
      var curRecords = records[resource] ;
      
      // collect resource ids, sort records into hash, and get cacheCode.
      var cacheCode = null ; var ids = [] ; var context = {} ;
      var primaryKey = curRecords[0].get('primaryKey') ; // assumes all the same
      curRecords.forEach(function(r) {
        cacheCode = cacheCode || r._cacheCode ;
        var key = r.get(primaryKey);
        if (key) { ids.push(key); context[key] = r; }
      });
      context._recordType = this._instantiateRecordType(curRecords[0].get('type'), this.prefix, null) ; // default rec type.
      
      params = {
        requestContext: context, 
        cacheCode: ((cacheCode=='') ? null : cacheCode),
        onSuccess: this._refreshSuccess.bind(this),
        onFailure: this._refreshFailure.bind(this)
      };
      
      if (ids.length == 1 && curRecords[0].refreshURL) params['url'] = curRecords[0].refreshURL;
      
      // issue request
      this.request(resource, this._refreshAction, ids, params, this._refreshMethod) ;
    }
  },
  
  _refreshAction: 'show',
  _refreshMethod: 'get',
  
  // This method is called when a refresh is successful.  It expects an array
  // of hashes, which it will convert to records.
  _refreshSuccess: function(status, transport, cacheCode, context) {
    var json = eval('json='+transport.responseText) ;
    if (!(json instanceof Array)) json = [json] ;
    this.refreshRecordsWithData(json,context._recordType,cacheCode,true) ;
  },
  
  _refreshFailure: function(status, transport, cacheCode, records) {
    console.log('refreshFailed!') ;
  },
  
  // ..........................................
  // COMMIT
  
  commitRecords: function(records) {
    if (!records || records.length == 0) return ;

    records = this._recordsByResource(records) ; // sort by resource.
    for(var resource in records) {
      if (resource == '*') continue ;
      
      var curRecords = records[resource] ;

      // collect data for records
      var server = this ;

      // start format differences
      var data = null;
      switch(this.get('postFormat')){
        case SC.URL_ENCODED_FORMAT:     				
          data = curRecords.map(function(rec) {
            return server._decamelizeData(rec.getPropertyData()) ;
          }) ;
          break;
        case SC.JSON_FORMAT:
          // get all records and put them into an array
          var objects = [];
          for(rec in curRecords){
            if (!curRecords.hasOwnProperty(rec)) continue ;
            objects.push(curRecords[rec].get('attributes') || {});
          }
          
          // convert to JSON and escape if this.escapeJSON is true
          if(this.get('escapeJSON')){
            data = escape(objects.toJSONString());
          } else {
            data = objects.toJSONString();
          }
          break;
        default: 
          break;
      }
      // end format differences

      if (data) {
        var ids = [];
        if (curRecords.length == 1) {
          var primaryKey = curRecords[0].get('primaryKey') ;
          var key = curRecords[0].get(primaryKey);
          if (key) ids.push(key);
        }

        params = {
          requestContext: records,
          onSuccess: this._commitSuccess.bind(this),
          onFailure: this._commitFailure.bind(this),
          records: data
        };

        if (ids.length == 1 && curRecords[0].updateURL) params['url'] = curRecords[0].updateURL;

        // issue request
        this.request(resource, this._commitAction, ids, params, this._commitMethod) ;
      }
    }
  },
  
  _commitAction: 'update',
  _commitMethod: 'post',
    
  // This method is called when a refresh is successful.  It expects an array
  // of hashes, which it will convert to records.
  _commitSuccess: function(status, transport, cacheCode, context) {
    var json = eval('json='+transport.responseText) ;
    if (!(json instanceof Array)) json = [json] ;
    this.refreshRecordsWithData(json,context._recordType,cacheCode,true) ;
  },
  
  _commitFailure: function(status, transport, cacheCode, records) {
    console.log('commitFailed!') ;
  },
  
  // ..........................................
  // DESTROY
  
  destroyRecords: function(records) {
    if (!records || records.length == 0) return ;

    records = this._recordsByResource(records) ; // sort by resource.
    for(var resource in records) {
      var curRecords = records[resource] ;

      if (resource == '*') {
        curRecords.forEach(function(rec){
          rec.set('isDeleted',true) ;
          SC.Store.removeRecord(rec) ;
        });
        continue ;
      }

      // collect resource ids, sort records into hash, and get cacheCode.
      var ids = [] ; var key ;
      var primaryKey = curRecords[0].get('primaryKey') ;

      curRecords.forEach(function(rec) {
        if ((key = rec.get(primaryKey)) && (!rec.get('newRecord'))) {
          ids.push(key) ; 
        }
        rec.set('isDeleted',true) ;
        SC.Store.removeRecord(rec) ;        
      }) ;

      // issue request -- we may not have ids to send tho (for ex, if all
      // records were newRecords.)
      if (ids && ids.length > 0) {
        params = {
          requestContext: records,
          onSuccess: this._destroySuccess.bind(this),
          onFailure: this._destroyFailure.bind(this)
        };

        if (ids.length == 1 && curRecords[0].destroyURL) params['url'] = curRecords[0].destroyURL;

        this.request(resource, this._destroyAction, ids, params, this._destroyMethod) ;
      }
    }
  },
  
  _destroyAction: 'destroy',
  _destroyMethod: 'post',

  _destroySuccess: function(status, transport, cacheCode, records) {
    console.log('destroySuccess!') ;
  },

  _destroyFailure: function(status, transport, cacheCode, records) {
    console.log('destroyFailed!') ;
  },

  // ..........................................
  // SUPPORT

  // This method is called by the various handlers once they have extracted
  // their data.
  refreshRecordsWithData: function(dataAry,recordType,cacheCode,loaded) {
    var server = this ;
    
    // Loop through the data Array and prepare each element
    var prepedDataAry = [];
    for (var idx = 0; idx < dataAry.length; idx++)
    {
      var currElem = server._prepareDataForRecords(dataAry[idx], server, recordType);
      if (currElem !== null) prepedDataAry.push(currElem);
    }
    
    // now update.
    SC.Store.updateRecords(prepedDataAry,server,recordType,loaded) ;
  },

  // ................................
  // PRIVATE METHODS
  
  _prepareDataForRecords: function(data, server, defaultType) {
    if (data === null) {
        return null;
    } else if (SC.typeOf(data) == SC.T_ARRAY) {
      var that = this;
      return data.map( function(d) {
        return that._prepareDataForRecords(d, server, defaultType) ;
      }) ;
    } else if (SC.typeOf(data) == SC.T_HASH) { 
      data = server._camelizeData(data) ; // camelize the keys received back.
      if (data.id) {
        // convert the 'id' property to 'guid'
        data.guid = data.id;
        delete data.id;
      }
      data.recordType = server._instantiateRecordType(data.type, server.prefix, defaultType);
      if (data.recordType) {
        return data;
      } else {
        console.log("Data RecordType could not be instantiated!: "+data.type) ;
        return null; // could not process.
      }
    } else {
      console.log("Unknown data type in SC.Server#_prepareDataForRecords. Should be array or hash.") ;
      return null; // could not process.
    }
  },
  
  _instantiateRecordType: function(recordType, prefix, defaultType) {
    if (recordType) {
      var recordName = recordType.capitalize() ;
      if (prefix) {
        for (var prefixLoc = 0; prefixLoc < prefix.length; prefixLoc++) {
          var prefixParts = prefix[prefixLoc].split('.');
          var namespace = window;
          for (var prefixPartsLoc = 0; prefixPartsLoc < prefixParts.length; prefixPartsLoc++) {
            var namespace = namespace[prefixParts[prefixPartsLoc]] ;
          }
          if (namespace !== window) return namespace[recordName] ;
        }
      } else return window[recordName] ;
    } else return defaultType; 
  },
  
  // places records from array into hash, sorted by resourceURL.
  _recordsByResource: function(records) {
    var ret = {} ;
    records.forEach(function(rec) {
      var recs = ret[rec.resourceURL || '*'] || [] ;
      recs.push(rec)  ;
      ret[rec.resourceURL || '*'] = recs ;
    }) ;
    return ret ;
  },
  
  _camelizeData: function(data) {
    if (data == null) return data ;
    
    // handle array
    var that = this ;
    if (data instanceof Array) return data.map(function(d){
      return that._camelizeData(d) ;
    }) ;

    // handle other objects
    if (typeof(data) == "object") {      
      var ret = {} ;
      for(var key in data) {
        var value = that._camelizeData(data[key]) ;
        if (key == 'id') key = 'guid' ; 
        ret[key.replace(/_/g,'-').camelize()] = value ;
      }
      return ret ;    
    }
    
    // otherwise just return value
    return data ;
  },
  
  _decamelizeData: function(data) {
    if (data == null) return data ;
    
    // handle array
    var that = this ;
    if (data instanceof Array) return data.map(function(d){
      return that._decamelizeData(d) ;
    }) ;

    // handle other objects
    if (typeof(data) == "object") {      
      var ret = {} ;
      for(var key in data) {
        var value = that._decamelizeData(data[key]) ;
        if (key == 'guid') key = 'id' ; 
        ret[key.decamelize()] = value ;
      }
      return ret ;    
    }
    
    // otherwise just return value
    return data ;
  },
  
  // converts a string, array, or hash into a query string.  root is the 
  // root string applied to each element key.  Used for nesting.
  _toQueryString: function(params,rootKey) {

    // handle nulls
    if (params == null) {
      return rootKey + '=';
      
    // handle arrays
    } else if (params instanceof Array) {
      var ret = [] ;
      for(var loc=0;loc<params.length;loc++) {
        var key = (rootKey) ? (rootKey + '['+loc+']') : loc ;
        ret.push(this._toQueryString(params[loc],key)) ;
      }
      return ret.join('&') ;
      
    // handle objects
    } else if (typeof(params) == "object") {
      var ret = [];
      for(var cur in params) {
        var key = (rootKey) ? (rootKey + '['+cur+']') : cur ;
        ret.push(this._toQueryString(params[cur],key)) ;
      }
      return ret.join('&') ;
      
    // handle other values
    } else return [rootKey,params].join('=') ;
  },
  
  init: function() {
    sc_super();
    SC.Server.addServer(this);
  }
    
}) ;

SC.Server.servers = [];

SC.Server.addServer = function(server) {
  var ary = SC.Server.servers;
  ary.push(server);
  SC.Server.servers = ary;
};