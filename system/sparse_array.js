// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2008, Sprout Systems, Inc. and contributors.
// ==========================================================================

require('mixins/enumerable') ;
require('mixins/array') ;
require('mixins/observable') ;
require('mixins/delegate') ;

/**
  @class

  Description goes here

  array = SC.SparseArray.create(100000) ;
  
  @extends SC.Enumerable
  @extends SC.Array
  @since SproutCore 1.0
*/
SC.SparseArray = function(length) {
  this.length = length ;
  this.initObservable() ;
  return this ;
} ;

SC.SparseArray.prototype = {
  
  /** @private */
    replace: function(idx, amt, objects) {
      var content = this._content ;
      if (!content) content = this._content = [] ;
      content.replace(idx, amt, objects) ;
      this.invokeDelegateMethod(this.delegate, 'sparseArrayDidReplace', this, idx. amt, objects) ;
      this.enumerableContentDidChange() ;
      return this ;
    },

  /** @private */
    objectAt: function(idx) {
      var content = this._content ;
      if (!content) content = this._content = [] ;
      var ret= content[idx] ;
      if (ret === undefined) { 
        // call method to load this object.
        this.invokeDelegateMethod(this.delegate, 'sparseArrayDidRequestIndex', this, idx) ;
      }
      var ret= content[idx] ;
      return ret ;
    },

    // removes content array
    flush: function() {
      this_content = null ;
      this.enumerableContentDidChange() ;
      // call sparseArrayDidFlush(this) ;
      return this ;
    },
    
    /** TODO: explain */
    delegate: null,
    
    _content: null
    
    
} ;

SC.mixin(SC.SparseArray.prototype, SC.Observable, SC.Enumerable, SC.Array, SC.Delegate) ;

SC.SparseArray.create = function(len) { return new SC.SparseArray(len); };