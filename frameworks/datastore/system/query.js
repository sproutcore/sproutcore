// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('core') ;
/**
  @class

  Description

  @extends SC.Object
  @extends SC.SparseArray
  @static
  @since SproutCore 1.0
*/

SC.Query = SC.SparseArray.extend(
/** @scope SC.Query.prototype */ {

  queryString: '',
  truthFunction: null,
  conditions: null,
  store: null,
  // delegate: null,  
  recordType: null,
  needRecord: false,
  
  length: 0,
  
  createTruthFunction: function(queryString) {
    this.set('queryString', queryString);
    
    /* Need parsing here from Thomas.. curently hacked. */
    var hackComponents = [queryString.split('=')[0]];
    
    var components = queryString.split('=');
    
    var needRecord = this.willNeedRecord(hackComponents);
    this.set('needRecord', needRecord);

    if(needRecord) {
      this.truthFunction = function(rec, conditions) {
          if(!rec) return NO;
          return (rec.get(components[0]) == conditions[0]);
      };
    } else {
      this.truthFunction = function(rec, conditions) {
          if(!rec) return NO;
          return (rec[components[0]] == conditions[0]);
      };
    }
  },
  
  willNeedRecord: function(components) {
    
    var rec = this.get('delegate').createCompRecord(this.get('recordType'));
    var needRecord = NO;
    for(var i=0, iLen=components.length; i<iLen; i++) {
      if(rec[components[i]]) {
        needRecord = YES;
      }
    }
    console.log('needRecord: ' + needRecord);
    return needRecord;
  },

  
  parse: function(recordType, queryString, conditions) {
    this.set('recordType', recordType);
    this.createTruthFunction(queryString);
    this.loadConditions(conditions);
  },
  
  loadConditions: function(conditions) {
    if(!conditions) {
      conditions = null;
    }
    this.set('conditions', conditions);
  },
  
  performQuery: function() {
    var store = this.get('delegate');

    if(!store) return null;
    
    this.beginPropertyChanges();
    
    this._storeKeysForQuery = store.performQuery(this);
    this.set('length', this._storeKeysForQuery.length);

  //  this.enumerableContentDidChange() ;
    this.endPropertyChanges();
    return this;
  },

  recordsDidChange: function() {
    this.invokeOnce(this.performQuery);
  },
  
  objectAt: function(idx)
  {
    if (idx < 0) return undefined ;
    if (idx >= this.get('length')) return undefined;
    return this.fetchContentAtIndex(idx);
  },

  fetchContentAtIndex: function(idx) {
    var store = this.get('delegate') ;
    var storeKey = this._storeKeysForQuery[idx];
    var ret = null; 
    if(store && storeKey) {
      ret = store.materializeRecord(storeKey);
    }
    return ret;
  },
    
  _storeKeysForQuery: null,
  
  init: function() {
    sc_super();
    this._storeKeysForQuery = [];
  }
  

}) ;
