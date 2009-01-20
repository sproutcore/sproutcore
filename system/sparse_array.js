// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('system/mixins/enumerable') ;
require('system/mixins/array') ;
require('system/mixins/observable') ;
require('system/mixins/delegate') ;

/**
  @class

  Description goes here

  array = SC.SparseArray.create(100000) ;
  
  @extends SC.Enumerable
  @extends SC.Array
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
    clone._sa_content = this._sa_content.clone() ;
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
    if (idx > len) this.length = len + +objects.get('length') ;
    else if ((idx+amt) > len)  this.length = idx + +objects.get('length') ;
    else this.length = (len - amt) + +objects.get('length') ;
    
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