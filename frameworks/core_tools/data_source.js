// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals CoreTools */

/**
  This DataSource connects to the SproutCore sc-server to retrieve targets
  and tests.  Currently this DataSource is read only.
*/
CoreTools.DevDataSource = SC.DataSource.extend({

  /**
    Fetch a group of records from the data source.  Knows how to fetch 
    a list of targets and tests.
  */
  fetch: function(store, fetchKey, params) {
    var ret = null;
    if (fetchKey === CoreTools.Target) ret = this.fetchTargets(store);
    else if (fetchKey === CoreTools.Test) {
      ret = this.fetchTests(store, params.url);
    }
    
    return ret;
  },
  
  // ..........................................................
  // FETCHING TARGETS
  // 
  
  fetchTargets: function(store) {
    var ret = this._targets; // get loaded items
    if (ret) return ret ;

    ret = this._targets = [];
    ret.set('state', SC.Record.BUSY_LOADING);
    SC.Request.getUrl('/sc/targets.json')
      .set('isJSON', YES)
      .notify(this, 'fetchTargetsDidComplete', { ret: ret, store: store })
      .send();
    return ret ;
  },
  
  fetchTargetsDidComplete: function(request, opts) {
    var response = request.get('response'),
        ret      = opts.ret,
        storeKeys;
        
    if (!SC.$ok(response)) {
      console.error("TODO: Add handler when fetching targets fails");
    } else {
      storeKeys = opts.store.loadRecords(CoreTools.Target, response);
      ret.replace(0, ret.get('length'), storeKeys);
    }

    ret.set('state', SC.Record.READY);
  },
  
  // ..........................................................
  // FETCHING TESTS
  // 
  
  fetchTests: function(store, url) {
    var tests = this._tests, ret ;
    if (!tests) tests = this._tests = {};
    if (ret = tests[url]) return ret;
    
    ret = tests[url] = [];
    ret.set('state', SC.Record.BUSY_LOADING);
    SC.Request.getUrl(url)
      .set('isJSON', YES)
      .notify(this, 'fetchTestsDidComplete', { ret: ret, store: store })
      .send();
    return ret ;
  },
  
  fetchTestsDidComplete: function(request, opts) {
    var response = request.get('response'),
        ret      = opts.ret,
        storeKeys;
        
    if (!SC.$ok(response)) {
      console.error("TODO: Add handler when fetching tests fails");
    } else {
      storeKeys = opts.store.loadRecords(CoreTools.Test, response);
      ret       = opts.ret;
      ret.replace(0, ret.get('length'), storeKeys);
    }

    console.log('fetchTestsDidComplete');
    ret.set('state', SC.Record.READY);
  }
  
});