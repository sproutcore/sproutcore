// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/enumerable') ;
sc_require('mixins/array') ;
sc_require('mixins/observable') ;
sc_require('mixins/delegate_support') ;

/**
  @class

  A dynamically filled array.  A SparseArray makes it easy for you to create 
  very large arrays of data but then to defer actually populating that array
  until it is actually needed.  This is often much faster than generating an
  array up front and paying the cost to load your data then.
  
  Although technically all arrays in JavaScript are "sparse" (in the sense 
  that you can read and write properties are arbitrary indexes), this array
  keeps track of which elements in the array have been populated already 
  and which ones have not.  If you try to get a value at an index that has 
  not yet been populated, the SparseArray will notify a delegate object first
  giving the delegate a chance to populate the component.
  
  Most of the time, you will use a SparseArray to incrementally load data 
  from the server.  For example, if you have a contact list with 3,000
  contacts in it, you may create a SparseArray with a length of 3,000 and set
  that as the content for a ListView.  As the ListView tries to display the
  visible contacts, it will request them from the SparseArray, which will in
  turn notify your delegate, giving you a chance to load the contact data from
  the server.
  
  @extends SC.Enumerable
  @extends SC.Array
  @extends SC.Observable
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/
SC.SparseArray = function(length) {
  this.length = length || 0 ;
  this.initObservable() ;
  return this ;
} ;

SC.SparseArray.prototype = SC.merge(SC.Observable, SC.Enumerable, SC.Array, SC.DelegateSupport, {
  
  indexOf: function(obj) {
    var content = this._sa_content ;
    if (!content) content = this._sa_content = [] ;
    return content.indexOf(obj) ;
  },
  
  clone: function() {
    var clone = new SC.SparseArray(this.length) ;
    clone._sa_content = SC.A$(this._sa_content) ;
    return clone ;
  },

  /**
    Use this method to update the content at a specified index.  This will 
    note that the array content has changed without notifying the delegate
    again of a change.
    
    @param {Number} index the index to alter
    @param {Object} obj the object to insert
    @returns {SC.SparseArray} reciever
  */
  provideContentAtIndex: function(index, obj) {
    var content = this._sa_content ;
    if (!content) content = this._sa_content = [] ;
    content[index] = obj;
    this.enumerableContentDidChange() ;
    return this ;
  },
  
  // delegate methods
  sparseArrayDidReplace: function(sary, idx, amt, objects) {},
  sparseArrayDidRequestIndex: function(sary, idx) {},
  sparseArrayDidFlush: function(sary) {},
  
  /** @private */
  replace: function(idx, amt, objects) {
    var objects = objects || [] ;
    var content = this._sa_content ;
    if (!content) content = this._sa_content = [] ;
    
    // replace content
    content.replace(idx, amt, objects) ;
    
    // update length
    var len = this.length ;
    if (idx > len) this.length = len + objects.get('length') ;
    else if ((idx+amt) > len)  this.length = idx + objects.get('length') ;
    else this.length = (len - amt) + objects.get('length') ;
    
    // notify delegate, observers
    this.invokeDelegateMethod(this.delegate, 'sparseArrayDidReplace', this, idx, amt, objects) ;
    this.enumerableContentDidChange() ;
    return this ;
  },

  /** @private */
  objectAt: function(idx) {
    var content = this._sa_content, ret ;
    if (!content) content = this._sa_content = [] ;
    ret= content[idx] ;
    if (ret === undefined) { 
      this.invokeDelegateMethod(this.delegate, 'sparseArrayDidRequestIndex', this, idx) ;
    }
    ret = content[idx];
    return ret ;
  },

  // removes content array
  flush: function() {
    this._sa_content = null ;
    this.enumerableContentDidChange() ;
    this.invokeDelegateMethod(this.delegate, 'sparseArrayDidFlush', this);
    return this ;
  },
    
  /** TODO: explain */
  delegate: null,

  _sa_content: null
    
}) ;

SC.SparseArray.create = function(len) { return new SC.SparseArray(len); };