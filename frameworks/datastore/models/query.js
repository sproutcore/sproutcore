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

SC.Query = SC.Object.extend( SC.SparseArray,
/** @scope SC.Query.prototype */ {

  queryString: '',
  truthFunction: null,
  conditions: null,
  store: null,
  delegate: null,
  isDirty: NO,
  shouldUpdateAutomatically: NO, 
  
  
  parseQueryString: function(queryString) {
    this.set('queryString', queryString);
    var components = queryString.split('=');
    this.truthFunction = function(dataHash, conditions) {
        if(!dataHash) return NO;
        // console.log(dataHash[components[0]]);
        // console.log(components[0]);
        // console.log(conditions[0]);
        // console.log((dataHash[components[0]] == conditions[0]));

        return (dataHash[components[0]] == conditions[0]);
    };
  },
  
  prepareQuery: function(queryString, conditions) {
    this.parseQueryString(queryString);
    this.loadConditions(conditions);
    this.set('isDirty', YES);
  },
  
  loadConditions: function(conditions) {
    if(!conditions) {
      conditions = null;
    }
    this.set('conditions', conditions);
  },
  
  performQuery: function(delegate) {
    if(delegate) {
      this.set('delegate', delegate);
    }
    var store = (this.get('delegate')) ? this.get('delegate') : this.get('store');

    if(!store) return null;
    
    this.beginPropertyChanges();
    
    this._storeKeysForQuery = store.performQuery(this);

    this.set('isDirty', NO);
    this.endPropertyChanges();
 //   this._contentDidChange();
  },

  isDirtyObserver: function() {
    if(this.get('shouldUpdateAutomatically')) {
      this.invokeOnce(this.performQuery);
    }
  }.observes('isDirty'),
  
  objectAt: function(idx)
  {
    if (idx < 0) return undefined ;
    if (idx >= this.get('length')) return undefined;
    return this.fetchContentAtIndex(idx);
  },

  fetchContentAtIndex: function(idx) {
    var store = (this.get('delegate')) ? this.get('delegate') : this.get('store');
    var storeKey = this._storeKeysForQuery[idx];
    var ret = null; 
    if(store && storeKey) {
      ret = store._materializeRecord(storeKey);
      this.provideContentAtIndex(idx, ret); 
    }
    return ret;
  },
  
  length: function( key, value ) {
    var ret = this._storeKeysForQuery ;
    return (ret && ret.get) ? (ret.length || 0) : 0 ;
  }.property(),
  
  _storeKeysForQuery: null,
  
  init: function() {
    sc_super();
    this._storeKeysForQuery = [];
  }
  

}) ;
