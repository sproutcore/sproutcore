// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core') ;
require('server') ;

/**
  @class
  
  couchdbServer gives the ability to use couchdb as a backend for sproutcore
  
  Working so far:
   -  listFor: will make a temp view to get all documents of the type ie. "Contacts.Contact"
   -  createRecords: uses the bulk_docs options to make 1 or more documents on the server.
  
  Todo:
   -  listFor: to take an optional argument/setting to uses a named view that will already
      be on couchdb
   -  listFor: take an order option (if possible)
   -  refreshRecords: to use cacheing (when usings a predefined view), to enable less traffic.
   -  commitRecords: 
   -  destroyRecords: 
   -  requestRecords: clean-up to code that is not used by couchdb
   -  All: enable use of, limit and offset, so that pagenaion will work
   -  All: probably merge all common code into 1 function.

  @extends SC.RestServer
  @author Geoffrey Donaldson
  @copyright 2006-2008, Sprout Systems, Inc. and contributors.
  @since SproutCore 1.0
*/
SC.CouchdbServer = SC.Server.extend({
  
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
    var url = params.url; delete params.url;
    
    // If params.body is a string, then add it, else JSONfy it
    if (typeof(params.body) == "string"){
      opts.postBody = params.body ;
    }else if(typeof(params.body) == "object"){
      opts.postBody = Object.toJSONString(params.body) ;
    } ; delete params.body ;

    opts.requestHeaders = params.requestHeaders ; delete params.requestHeaders ;
    if (!opts.requestHeaders) opts.requestHeaders = {} ;
    opts.requestHeaders['Accept'] = 'application/json, */*' ;
    opts.requestHeaders['X-SproutCore-Version'] = SC.VERSION ;
    if (accept) opts.requestHeaders['Accept'] = accept ;
    if (cacheCode) opts.requestHeaders['Sproutit-Cache'] = cacheCode ;
    opts.method = method || 'get' ;
    opts.contentType = "application/json" // this is needed to make couchdb accept our request.

    // ids are handeled by the calling methods

    // convert remainging parameters into query string.
    var parameters = this._toQueryString(params) ;
    if (parameters && parameters.length > 0) opts.parameters = parameters ;
    
    var server = this ;
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
    
    console.log('REQUEST: %@ %@'.fmt(opts.method, url)) ;
    
    request = new Ajax.Request(url,opts) ;
  },

  // I don't think that we need urlFor, as the models will need to specify where to look.
  
  // ..........................................
  // LIST
  // This is the method called by a collection to get an updated list of
  // records.
  listFor: function(opts) {
    var recordType = opts.recordType ;
    var resource = recordType.resourceURL() ; if (!resource) return false ;
    
    // TODO: check if the user has given a path to a view.
    // if so, call that view (with Method: GET)
    var url = resource + "/_temp_view"
    var content = {}

    var context = {
      recordType: recordType
    }

    // TODO: CouchDB will have to deal with these a little different i think
    params = {} ;
    if (opts.conditions) {
      var conditions = this._decamelizeData(opts.conditions) ;
      for(var key in conditions) {
        params[key] = conditions[key] ;
      }
    }

    // Here is the couchdb temp view code.
    content.map = "function(doc) { " +
      "if (doc.type == \'"+ recordType +"\' ){ "+
        "emit(doc._id, doc)"+
    "}}" ;
    // TODO: check if the user has given a path to a view.
    // if so, call that view (with Method: GET)

    params.requestContext = context ;
    params.url = url ;
    params.body = content ;
    params.onSuccess = this._listSuccess.bind(this) ;
    params.onNotModified = this._listNotModified.bind(this) ;
    params.onFailure = this._listFailure.bind(this) ;
    this.request(resource, this._listForAction, null, params, this._listForMethod) ;
  },

  _listForAction: 'list', // We don't acually use this with couchdb
  _listForMethod: 'post', // This is post because we are using _temp_views

  _listSuccess: function(status, transport, cacheCode, context) {
    var json = eval('json='+transport.responseText) ;
    if (!json) { console.log('invalid json!'); return; }

    // Due to the way that couchdb returns data, we need to make our own list of id's,
    // and build the records from the "value" key of each row.
    ids = []
    records = json.rows.map(function(row) {
      ids.push(row.id) ;
      console.log("Got Data - "+Object.toJSONString(row.value))
      return row.value ;
    }) ;

    // then, build any records passed back
    if (records.length > 0) {
      this.refreshRecordsWithData(records,context.recordType,cacheCode,false);
    }

    // next, convert the list of ids into records.
    var recs = (ids) ? ids.map(function(guid) {
      return SC.Store.getRecordFor(guid,context.recordType) ;
    }) : [] ;

    // now invoke callback
    if (context.callback) context.callback(recs,json.count,cacheCode) ;
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
      // TODO: possibly change this to work differently with 1 record.
      // but this works with 
      var create_url = resource + "/_bulk_docs" ;

      // collect data for records
      var server = this ; var content = {} ;
      var objects = []; var recs = [] ;

      for (rec in curRecords){
        if (!curRecords.hasOwnProperty(rec)) continue ;
        if (curRecords[rec].get('attributes')){
          atts = curRecords[rec].get('attributes');
          atts.type = curRecords[rec]._type._objectClassName ;
          //atts._id = curRecords[rec]._guid ; // we don't want to send an id to start with
          delete atts.guid ;
          delete atts.idDirty ; // Not sure what this is or where it comes from
          recs.push(curRecords[rec]) ;
        }else{
          atts = {} ;
        }
        objects.push(atts);
      }
      content.docs = objects ;// request() will call toJSONString() on this. ;
      
      var context = {
        records: recs
      } ;
      
      var params = {
        requestContext: context,
        onSuccess: this._createSuccess.bind(this),
        onFailure: this._createFailure.bind(this),
        body: content,
        url: create_url
      };

      // issue request
      this.request(resource, this._createAction, null, params, this._createMethod) ;
    }
  },

  _createAction: 'create',
  _createMethod: 'post', 
  
  // This method is called when a create is successful.  It first goes through
  // and assigns the primaryKey to each record.
  _createSuccess: function(status, transport, cacheCode, context) {
    var json = eval('json='+transport.responseText) ;
    if (!json) { console.log('invalid json!'); return; }
    
    // first go through and assign the primaryKey to each record.
    if (json.new_revs) {
      // CouchDB will return the documents in the same order you sent them
      // so here we walk through the returned id's
      for(i=0; i < json.new_revs.length; i++ ) {
        data = json.new_revs[i] ;
        var rec = context.records[i] ;
        if (rec) {
          var pk = rec.get('primaryKey') ;
          var dataKey = (pk == 'guid') ? 'id' : pk.decamelize().toLowerCase().replace(/\-/g,'_') ;
          rec.set(pk,data[dataKey]) ;
          rec.set("_id", data.id) ;   // Set couchDB specific 
          rec.set("_rev", data.rev) ;
          rec.set('newRecord',false) ;
        }
        context.records[i] = rec ;
      }

      // now this method will work so go do it.
      this.refreshRecordsWithData(context.records, context.recordType, cacheCode, true) ;
    }

    if (context.onSuccess) context.onSuccess(transport, cacheCode) ;
  },

  _refreshAction: 'refresh',
  _refreshMethod: 'get',

  // ..........................................
  // COMMIT
  // This is mostly just a copy of createRecords, as the process is the same
  // in couchDB

  commitRecords: function(records) { 
    if (!records || records.length == 0) return ;

    records = this._recordsByResource(records) ; // sort by resource.
    for(var resource in records) {
      if (resource == '*') continue ;
      
      var curRecords = records[resource] ;
      // TODO: possibly change this to work differently with 1 record.
      // but this works with 
      var create_url = resource + "/_bulk_docs" ;

      // collect data for records
      var server = this ; var content = {} ;
      var objects = []; var recs = [] ;

      for (rec in curRecords){
        if (!curRecords.hasOwnProperty(rec)) continue ;
        if (curRecords[rec].get('attributes')){
          atts = curRecords[rec].get('attributes');
          atts._id = curRecords[rec].get('guid') ;
          recs.push(curRecords[rec]) ;
        }else{
          atts = {} ;
        }
        objects.push(atts);
      }
      content.docs = objects ;// request() will call toJSONString() on this. ;
      
      if (content.docs.length > 0) {
        var context = {
          records: recs
        } ;

        var params = {
          requestContext: context,
          onSuccess: this._commitSuccess.bind(this),
          onFailure: this._commitFailure.bind(this),
          body: content,
          url: create_url
        };

        // issue request
        this.request(resource, this._createAction, null, params, this._createMethod) ;
      }
    }
  },

  _commitAction: 'save',
  _commitMethod: 'post', // again, this will use couchDB's bulk_docs call, which is post
  
  // This method is called when a refresh is successful.  It expects an array
  // of hashes, which it will convert to records.
  _commitSuccess: function(status, transport, cacheCode, context) {
    var json = eval('json='+transport.responseText) ;
    if (!json) { console.log('invalid json!'); return; }
    
    // first go through and assign the primaryKey to each record.
    if (json.new_revs) {
      // CouchDB will return the documents in the same order you sent them
      // so here we walk through the returned id's
      for(i=0; i < json.new_revs.length; i++ ) {
        var data = json.new_revs[i] ;
        var rec = context.records[i] ;
        if (rec) {
          var pk = rec.get('primaryKey') ;
          var dataKey = (pk == 'guid') ? 'id' : pk.decamelize().toLowerCase().replace(/\-/g,'_') ;
          rec.set(pk,data[dataKey]) ;
          rec.set("_id", data.id) ;   // Set couchDB specific 
          rec.set("_rev", data.rev) ;
          rec.set('newRecord',false) ;
        }
        context.records[i] = rec ;
      }

      // now this method will work so go do it.
      this.refreshRecordsWithData(context.records, context.recordType, cacheCode, true) ;
    }

    if (context.onSuccess) context.onSuccess(transport, cacheCode) ;
  },

  // ..........................................
  // DESTROY
  // And once again, this is almost a copy of commit 
  // ... I wonder if there is a way to make this cleaner

  destroyRecords: function(records) { 
    if (!records || records.length == 0) return ;

    records = this._recordsByResource(records) ; // sort by resource.
    for(var resource in records) {
      if (resource == '*') continue ;
      
      var curRecords = records[resource] ;
      // TODO: possibly change this to work differently with 1 record.
      // but this works with 
      var create_url = resource + "/_bulk_docs" ;

      // collect data for records
      var server = this ; 
      var objects = []; var content = {} ;

      for (rec in curRecords){
        if (!curRecords.hasOwnProperty(rec)) continue ;
        if (curRecords[rec].get('attributes')){
          atts = curRecords[rec].get('attributes');
          atts._id = curRecords[rec].get('guid') ;
          atts._deleted = true ;
        }else{
          atts = {} ;
        }
        objects.push(atts);
      }
      content.docs = objects ;// request() will call toJSONString() on this. ;
      
      if (content.docs.length > 0) {
        var context = {
          records: curRecords
        } ;

        var params = {
          requestContext: context,
          onSuccess: this._destroySuccess.bind(this),
          onFailure: this._destroyFailure.bind(this),
          body: content,
          url: create_url
        };

        // issue request
        this.request(resource, this._createAction, null, params, this._createMethod) ;
      }
    }
  },

  _destroyAction: 'destroy',
  _destroyMethod: 'post', // We are using post to couchdb's _bulk_doc page.
  
  _destroySuccess: function(status, transport, cacheCode, context) {
    SC.Store.destroyRecords(context.records);
    console.log('destroySuccess!') ;
  },

  refreshRecordsWithData: function(dataAry,recordType,cacheCode,loaded) {
    var server = this ;

    // first, prepare each data item in the Ary.
    dataAry = dataAry.map(function(data) {

      // camelize the keys received back.
      //data = server._camelizeData(data) ;
      console.log('Processing Data: '+Object.toJSONString(data)) ;
      // ** Changed **
      // convert the '_id' property to 'guid' to keep the id's that couchdb has given
      if (data._id) { 
        data.guid = data._id; delete data._id; 
      }else if (data.id) {
        data.guid = data.id; delete data.id;
      }
      if (data.rev) {
        data._rev = data.rev; delete data.rev ;
      }

      // find the recordType
      if (data.type) {
        var recordName = data.type.split(".").last().capitalize() ;
        if (server.prefix) {
          for (var prefixLoc = 0; prefixLoc < server.prefix.length; prefixLoc++) {
            var prefixParts = server.prefix[prefixLoc].split('.');
            var namespace = window;
            for (var prefixPartsLoc = 0; prefixPartsLoc < prefixParts.length; prefixPartsLoc++) {
              var namespace = namespace[prefixParts[prefixPartsLoc]] ;
            }
            if (namespace != window) data.recordType = namespace[recordName] ;
            if (data.recordType) break ;
          }
        } else data.recordType = window[recordName] ;

        if (!data.recordType) console.log('skipping undefined recordType:'+recordName) ;
      } else data.recordType = recordType ;

      if (!data.recordType) return null; // could not process.
      else return data ;
    }).compact() ;

    // now update.
    SC.Store.updateRecords(dataAry,server,recordType,loaded) ;
  }
  
}) ;