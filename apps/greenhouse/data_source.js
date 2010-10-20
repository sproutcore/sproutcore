// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010-2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/**
  This DataSource connects to the SproutCore sc-server to retrieve files
*/
Greenhouse.DataSource = SC.DataSource.extend({

  /**
    Fetch a group of records from the data source.  
  */
  fetch: function(store, query) {
    var ret = NO, rt = query.get('recordType');
    if(rt === Greenhouse.File || rt === Greenhouse.Dir){
      ret = this.listFiles(store, query);
    }   
    else if(rt === Greenhouse.Target){
      ret = this.fetchTargets(store, query);
    }
    else if(rt === Greenhouse.ViewConfig){
      ret = this.fetchViewConfigs(store,query);
    }
    return ret;
  },
  
  // ..........................................................
  // Get file list
  // 
  listFiles: function(store, query){
    SC.Request.create({type: 'GET', isJSON: YES, address: '/sproutcore/fs/apps%@/?action=list'.fmt(query.get('urlPath'))})
      .notify(this,this.listFilesDidComplete, {query: query, store: store})
      .send();
  },
  
  listFilesDidComplete: function(request, options){
    var response = request.get('response'),
        query    = options.query,
        store    = options.store,
        storeKeys, recordTypes;
    
    if (!SC.$ok(response)) {
      console.error("Couldn't request files");
    } 
    else {
      recordTypes = response.map(function(item){
        return item.type === 'File' ? Greenhouse.File : Greenhouse.Dir;
      });
      storeKeys = store.loadRecords(recordTypes, response);
      store.loadQueryResults(query, storeKeys);
      Greenhouse.sendAction('fileListCallDidComplete');
    }   
  },
  
  // ..........................................................
  // FETCHING TARGETS
  // 
  
  /**
    Fetch the actual targets.  Only understands how to handle a remote query.
  */
  fetchTargets: function(store, query) {
    
    if (!query.get('isRemote')) return NO ; 
    
    SC.Request.getUrl('/sc/targets.json')
      .set('isJSON', YES)
      .notify(this, 'fetchTargetsDidComplete', { query: query, store: store })
      .send();
    return YES ;
  },
  
  fetchTargetsDidComplete: function(request, opts) {
    var response = request.get('response'),
        query    = opts.query,
        store    = opts.store,
        storeKeys;
        
    if (!SC.$ok(response)) {
      console.error("TODO: Add handler when fetching targets fails");
    } else {
      storeKeys = store.loadRecords(Greenhouse.Target, response);
      store.loadQueryResults(query, storeKeys);
      Greenhouse.sendAction('fetchTargetsDidComplete');
    }
  },
  
  // ..........................................................
  // FETCHING VIEW CONFIGS
  // 
  fetchViewConfigs: function(store, query){
    if (!query.get('isRemote')) return NO ; 
    
    SC.Request.getUrl('/sc/greenhouse-config.json?app=%@'.fmt(query.get('app')))
      .set('isJSON', YES)
      .notify(this, 'fetchViewConfigsDidComplete', { query: query, store: store })
      .send();
    return YES ;
  },
  fetchViewConfigsDidComplete: function(request, opts){
    var response = request.get('response'),
        query    = opts.query,
        store    = opts.store,
        storeKeys;
    if (!SC.$ok(response)) {
      console.error("TODO: Add handler when fetching view configs fails");
    } else {
      storeKeys = store.loadRecords(Greenhouse.ViewConfig, response);
      store.loadQueryResults(query, storeKeys);
    }
  },
  
  // ..........................................................
  // Single File Actions
  // 
  /**
    updates a single record
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  updateRecord: function(store, storeKey, params) {
    var file = store.materializeRecord(storeKey);
    var request = SC.Request.create({type: 'POST', address: "/sproutcore/fs/%@?action=overwrite".fmt(file.get('path')),
         body: file.get('body')})
        .notify(this,this.updateRecordDidComplete, {file: file, storeKey: storeKey, store: store})
        .send();
    return YES ;
  },  
  updateRecordDidComplete: function(response, params){
    var file = params.file, results = response.get('body'), store = params.store;
    if(SC.ok(response)){
      //HACK: for some reason the records are always 514 ready dirty not refreshing dirty...
      status = store.readStatus(params.storeKey);
      store.writeStatus(params.storeKey, SC.Record.BUSY_COMMITTING);
      //end HACK
      params.store.dataSourceDidComplete(params.storeKey);
    }
    else{
      console.error("Couldn't update file!");
    }
  },

  /**
    Called from retrieveRecords() to retrieve a single record.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to retrieve
    @param {String} id the id to retrieve
    @returns {Boolean} YES if handled
  */
  retrieveRecord: function(store, storeKey, params) {
    var file = store.materializeRecord(storeKey), request;
    if(file.kindOf(Greenhouse.File)){
      request = SC.Request.create({type: 'GET', address: "/sproutcore/fs/%@".fmt(file.get('path'))})
          .notify(this, this.retrieveRecordDidComplete, {file: file, storeKey: storeKey, store: store})
          .send();
      return YES;
    }
    return NO;
  },  
  retrieveRecordDidComplete: function(response, params){
    var file = params.file, store = params.store, attributes, status;
    if(SC.ok(response)){
      attributes = file.get('attributes');//SC.clone(file.get('attributes'));
      attributes.body = response.get('body');
      //HACK: for some reason the records are always 514 ready dirty not refreshing dirty...
      status = store.readStatus(params.storeKey);
      store.writeStatus(params.storeKey, SC.Record.BUSY_REFRESH | (status & 0x03)) ;
      //end HACK
      store.dataSourceDidComplete(params.storeKey, attributes);
    }
    else{
      console.error("Couldn't request file");
    }
  },
  /**
    Called from createdRecords() to created a single record.  This is the 
    most basic primitive to can implement to support creating a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  createRecord: function(store, storeKey, params) {
    var file = store.materializeRecord(storeKey);
    var request = SC.Request.create({type: 'POST', address: "/sproutcore/fs/%@?action=touch".fmt(file.get('path')),
         body: file.get('body')})
        .notify(this,this.createRecordDidComplete, {file: file, storeKey: storeKey, store: store})
        .send();
    return YES ;
  },  
  createRecordDidComplete: function(response, params){
    var file = params.file, results = response.get('body'), store = params.store;
    if(SC.ok(response)){
      //HACK: for some reason the records are always 514 ready dirty not refreshing dirty...
      status = store.readStatus(params.storeKey);
      store.writeStatus(params.storeKey, SC.Record.BUSY_COMMITTING);
      //end HACK
      params.store.dataSourceDidComplete(params.storeKey);
    }
    else{
      console.error("Couldn't create file!");
    }
  },

  /**
    Called from destroyRecords() to destroy a single record.  This is the 
    most basic primitive to can implement to support destroying a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  destroyRecord: function(store, storeKey, params) {
    var request = SC.Request.create({type: 'POST'}), file = store.materializeRecord(storeKey);
    
    request.set('address', "/sproutcore/fs/%@?action=remove".fmt(file.get('path')));
    
    request.notify(this,this.destroyRecordDidComplete,{file: file, storeKey: storeKey, store: store}).send();
    
    return YES;
  },
  
  destroyRecordDidComplete: function(response, params){
    var status, store = params.store;
    //HACK: for some reason the records are always 514 ready dirty not refreshing dirty...
    status = store.readStatus(params.storeKey);
    store.writeStatus(params.storeKey, SC.Record.BUSY_DESTROYING);
    //end HACK
    params.store.dataSourceDidDestroy(params.storeKey);
  }
  
  
});
