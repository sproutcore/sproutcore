// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/path_module') ;

/**
  @class SC.Page
  
  The Page object is used to store a set of views that can be lazily 
  configured on page load.  Page assumes that all of its properties are
  basically outlets and will try to configure them as such.

  @extends SC.Object
*/
SC.Page = SC.Object.extend(
  /** @scope SC.Page.prototype */
  {
  
  get: function(key) {
    var value = this[key] ;
    if (value && (value instanceof Function) && (value.isOutlet)) {
      var ret = this.outlet(key) ;
      if (SC.window && !ret.parentNode) {
        SC.window._insertBefore(ret, null, false) ;
        SC.window._rebuildChildNodes();
      }
      ret.awake() ;
      return ret ;
    } else return sc_super() ;
  },
  
  // in addition to activating bindings, calling awake on the page object
  // will cause any outlet properties to be loaded.
  awake: function() {
    arguments.callee.base.call(this) ;
    for(var key in this) {
      if (this.hasOwnProperty(key) && this[key] && this[key].isOutlet) {
        this.get(key) ; // convert to outlet.
      } 
    }
  },
  
  init: function() {
    sc_super() ;
    var el = this.rootElement = $('resources') ;
    SC.callOnLoad(function() {
      if (el && el.parentNode) el.parentNode.removeChild(el) ;
			el = null;
    }) ;
  },
  
  // returns the property, but only if it is already configured.
  getIfConfigured: function(key) {
    var value = this[key] ;
    if (value && (value instanceof Function) && (value.isOutlet)) {
      return null ;
    } else return value ;
  },
  
  _insertBefore: function() {},
  _rebuildChildNodes: function() {}
  
}) ;

Object.extend(SC.Page.prototype, SC.PathModule) ;