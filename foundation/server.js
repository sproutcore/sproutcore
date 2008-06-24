// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core') ;

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
  //
  request: function(resource, verb, ids, params, method) {

    // Get Settings and Options
    if (!params) params = {} ;
    var opts = {} ;
    var onSuccess = params.onSuccess; delete params.onSuccess;
    var onNotModified = params.onNotModified; delete params.onNotModified ;
    var onFailure = params.onFailure ; delete params.onFailure ;
    var context = params.requestContext ; delete params.requestContext ;
    var cacheCode = params.cacheCode; delete params.cacheCode ;

    // handle ids
    var idPart = '' ;
    if (ids) if (ids.length > 1) {
      params.ids = [ids].flatten().join(',') ;
    } else if (ids.length == 1) {
      idPart = '/' + ids[0] ;
    }
    
    // convert parameters.
    var parameters = this._toQueryString(params) ;
    if (parameters && parameters.length > 0) opts.parameters = parameters ;
    
    // prepare request headers and options
    if (cacheCode) opts.requestHeaders = ['Sproutit-Cache',cacheCode] ;
    opts.method = method || 'get' ;
    var url = this.urlFormat.format(resource,verb) + idPart;
    var request = null ; //will container the ajax request
    
    // Save callback functions.
    opts.onSuccess = function(transport) {
      var cacheCode = request.getHeader('Last-Modified') ;
      if ((transport.status == '200') && (transport.responseText == '304 Not Modified')) {
        if (onNotModified) onNotModified(transport.status, transport, cacheCode,context);
      } else {
        if (onSuccess) onSuccess(transport.status, transport, cacheCode,context);
      }
    } ;
    
    opts.onFailure = function(transport) {
      var cacheCode = request.getHeader('Last-Modified') ;
      if (onFailure) onFailure(transport.status, transport, cacheCode,context);
    } ; 
    
    console.log('REQUEST: %@'.fmt(url)) ;
    request = new Ajax.Request(url,opts) ;
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
    
    this.request(resource,'list',null,params) ;
  },
  
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
        recData._guid = rec._guid ;
        context[rec._guid] = rec ;
        rec.set('newRecord',false) ;
        return recData ;
      }) ;

      // issue request
      this.request(resource,'create',null,{
        requestContext: context, 
        onSuccess: this._createSuccess.bind(this),
        onFailure: this._createFailure.bind(this),
        records: data
      },'post') ;
    }
  },

  // This method is called when a create is successful.  It first goes through
  // and assigns the primaryKey to each record.
  _createSuccess: function(status, transport, cacheCode, context) {
    var json = eval('json='+transport.responseText) ;
    if (!(json instanceof Array)) json = [json] ;
    
    // first go through and assign the primaryKey to each record.
    if (!context) context = {} ;
    json.each(function(data) {
      var guid = data._guid ;
      var rec = (guid) ? context[guid] : null ;
      if (rec) {
        var pk = rec.get('primaryKey') ;
        var dataKey = (pk == 'guid') ? 'id' : pk.decamelize().toLowerCase().replace(/\-/g,'_') ;
        rec.set(pk,data[dataKey]) ;
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
      curRecords.each(function(r) {
        cacheCode = cacheCode || r._cacheCode ;
        var key = r.get(primaryKey);
        if (key) { ids.push(key); context[key] = r; }
      });
      context._recordType = curRecords[0].recordType ; // default rec type.
      
      // issue request
      this.request(resource,'show',ids,{
        requestContext: context, 
        cacheCode: ((cacheCode=='') ? null : cacheCode),
        onSuccess: this._refreshSuccess.bind(this),
        onFailure: this._refreshFailure.bind(this)
      }) ;
    }
  },
  
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
      var data = curRecords.map(function(rec) {
        return server._decamelizeData(rec.getPropertyData()) ;
      }) ;

      // issue request
      this.request(resource,'update',null,{
        requestContext: records, 
        onSuccess: this._commitSuccess.bind(this),
        onFailure: this._commitFailure.bind(this),
        records: data
      },'post') ;
    }
  },
  
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
        curRecords.each(function(rec){
          rec.set('isDeleted',true) ;
          SC.Store.removeRecord(rec) ;
        });
        continue ;
      }

      // collect resource ids, sort records into hash, and get cacheCode.
      var ids = [] ; var key ;
      var primaryKey = curRecords[0].get('primaryKey') ;

      curRecords.each(function(rec) {
        if ((key = rec.get(primaryKey)) && (!rec.get('newRecord'))) {
          ids.push(key) ; 
        }
        rec.set('isDeleted',true) ;
        SC.Store.removeRecord(rec) ;        
      }) ;

      // issue request -- we may not have ids to send tho (for ex, if all
      // records were newRecords.)
      if (ids && ids.length > 0) this.request(resource,'destroy',ids,{
        requestContext: records,
        onSuccess: this._destroySuccess.bind(this),
        onFailure: this._destroyFailure.bind(this)
      },'post') ;
    }
  },

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
    // first, prepare each data item in the Ary.
    dataAry = dataAry.map(function(data) {
      
      // camelize the keys received back.
      data = server._camelizeData(data) ;

      // convert the 'id' property to 'guid'
      if (data.id) { data.guid = data.id; delete data.id; }

      // find the recordType
      if (data.type) {
        var recordName = data.type.capitalize() ;
        if (server.prefix) for(var prefixLoc=0;prefixLoc < server.prefix.length; prefixLoc++) {
          var namespace = window[server.prefix[prefixLoc]] ;
          if (namespace) data.recordType = namespace[recordName] ;
          if (data.recordType) break ;
        } else data.recordType = window[recordName] ;
        if (!data.recordType) console.log('skipping undefined recordType:'+recordName) ;
      } else data.recordType = recordType ;
      if (!data.recordType) return null; // could not process.

      return data ;
    }).compact() ;
    
    // now update.
    SC.Store.updateRecords(dataAry,server,recordType,loaded) ;
  },

  // ................................
  // PRIVATE METHODS
  
  // places records from array into hash, sorted by resourceURL.
  _recordsByResource: function(records) {
    var ret = {} ;
    records.each(function(rec) {
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
  }
    
}) ;
