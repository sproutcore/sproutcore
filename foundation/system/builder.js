// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/**
  This is a generic builder.  You can use the create() or createFor() methods
  to actually create your own builder.

  SC.Menu.build = SC.builder({
    
  });
  
  @param {Hash} helpers one or more hashes of helper properties
  @returns {Function} a builder function.
*/
SC.builder = function(helpers) {
  
  // create the constructor for a new builder and copy on helpers
  var construct = function(defaultClass, content, props) {
    
    // save default class used for builder
    if (!this.defaultClass) this.defaultClass = defaultClass ;
    
    // if first parameter after default class was an instance of the class,
    // then set that as content.  Otherwise, create a new instance of the 
    // class.
    if (props === undefined && (content instanceof this.defaultClass)) {
      props = content ; content = null ;
    }
    
    // set content
    this.makeContent(content || this.create());
    
    // if props were passed, set them
    for(var key in props) {
      if (!props.hasOwnProperty(key)) continue ;
      this.set(key, props[key]);
    }
    
    return this ;
  } ;
  
  // Clone the builder prototype and add any props
  var fn = SC.beget(SC.builder.fn) ;
  var idx, len = arguments.length;
  for(idx=start;idx<len;idx++) SC.mixin(fn, arguments[idx]) ;
  fn.defaultClass = defaultClass ;
  
  // Now set as prototype for constructor and create builder function.
  construct.prototype = construct.fn = fn;
  
  var ret = function(content, props) { return new construct(content, props); } ;
  
  return ret ;
} ; 

SC.builder.fn = {

  create: function() { 
    return (this.defaultClass) ? this.defaultClass.create() : null ; 
  },

  makeContent: function(newContent) { this.content = newContent; },
  
  // returns the current parent or sets the parent and returns the receiver.
  parent: function(newParent) {
    if (newParent !== undefined) {
      this._parent = newParent; 
      return this;
    } else return this._parent ;
  },

  // returns the current parent or the content.
  done: function() { return this._parent || this.content; },
  
  // sets the named property on the content
  set: function(key, value) {
    var content = this.content;
    (content.set) ? content.set(key, value) : content[key] = value ;
    return this ;
  },
  
  // gets the named property on the content
  get: function(key) {
    var content = this.content ;
    return (content.get) ? content.get(key) : content[key] ;
  },
  
  // toString describes the builder
  toString: function() { return "builder(%@)".fmt(this.content.toString()); } 
  
};



