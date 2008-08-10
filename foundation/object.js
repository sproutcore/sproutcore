// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core') ;
require('foundation/benchmark') ;
require('mixins/observable') ;
require('mixins/array') ;

SC.BENCHMARK_OBJECTS = NO;

/** 
  @class 

  Root Object for the SproutCore Framework
  
  h2. Class at a Glance
  
  Add a one or two paragraph description of the class here.
  
  This is the root object of the SproutCore framework.  All other objects
  inherit from you.  SC.Object among other things implements support for
  class inheritance, observers, and bindings.  You should use SC.Object to
  create your own subclasses as well.

  h2. Overview
  
  Some overview information about the class should go here.
  Please see online documentation for more information about this.

  h2. Subclassing Notes
  
  I should be able to put a long list of things here I suppose.
  
  - Do bullet
  - points
  - work?
  
  {{{
    // Also some sample
    code.goesHere() ;
  }}}
  
  @extends SC.Observable 
  @author Charles Jolley
  @version 1.0
  @since Version 1.0

*/
SC.Object = function(noinit) { 
	if (noinit === SC.Object._noinit_) return this ;
	var ret = SC.Object._init.apply(this,SC.$A(arguments)) ;
  return ret ;
};

SC.mixin(SC.Object, /** @scope SC.Object */ {

	_noinit_: '__noinit__',
	
  /**
    Add properties to a object's class definition.
    
    @params {Hash} props the properties you want to add
    @returns {void}
  */
  mixin: function(props) {
    var ext = SC.$A(arguments) ;
    for(var loc=0;loc<ext.length;loc++) {
      Object.extend(this,ext[loc]);
    }
    return this ;
  },
  
  /**
    Creates a new subclass, add to the receiver any passed properties
    or methods.
    
    @params {Hash} props the methods of properties you want to add
    @returns {Class} A new object class
  */
  extend: function(props) {   
    
    if (SC.BENCHMARK_OBJECTS) SC.Benchmark.start('SC.Object.extend') ;
     
    // build function.  copy class methods on to it.
    var ret = function(noinit) { 
      if (noinit && (typeof(noinit) == 'string') && (noinit == SC.Object._noinit_)) return this ;
      var ret = SC.Object._init.apply(this,SC.$A(arguments)); 
      return ret ;
    };
    for(var prop in this) { ret[prop] = this[prop]; }

    // extend the prototype with passed arguments.
    var base = new this(SC.Object._noinit_) ;

//    var base = SC.Object._extend({},this.prototype) ;
    var extensions = SC.$A(arguments) ;
    for(var loc=0;loc<extensions.length;loc++) {
      base = SC.Object._extend(base, extensions[loc]);
    }
    ret.prototype = base ;
    
    // return new extension
    ret._guid = SC.generateGuid() ; // each time we extend we get a new guid
    ret._type = this ;
     
    if (SC.BENCHMARK_OBJECTS) SC.Benchmark.end('SC.Object.extend') ;
    
    return ret ;
  },

  /**
    Creates a new instance of the class.

    Unlike most frameworks, you do not pass paramters into the init funciton
    for an object.  Instead, you pass a hash of additonal properties you want
    to have assigned to the object when it is first created.  This is
    functionally like creating a anonymous subclass of the receiver and then
    instantiating it, but more efficient.
    
    You can use create() like you would a normal constructor in a class-based
    system, or you can use it to create highly customized singleton objects
    such as controllers or app-level objects.  This is often more efficient
    than creating subclasses and than instantiating them.
    
    @param {Hash} props optional hash of method or properties to add to the instance.
    @returns {SC.Object} new instance of the receiver class.
  */
  create: function(props) {
    var ret = new this(SC.$A(arguments),this) ;
    return ret ;
  },
    
  /**
    Takes an array of hashes and returns newly created instances.
    
    This convenience method will take an array of properties and simply
    instantiates objects from them.
    
    @params {Array} array Array of hashes with properties to assigned to each object.
    @returns {Array} array of instantiated objects.
  */
  createArray: function(array) {
    var obj = this ;
    return array.map(function(props) { return obj.create(props); }) ;
  },

  /**
    Adding this function to the end of a view declaration will define the 
    class as an outlet that can be constructed using the outlet() method 
    (instead of get()).
    
    @returns {Outlet} a specially constructed function that will be used to
     build the outlet later.
  */
  outlet: function() {
    var obj = this ;
    return function() {
      var ret = obj.create() ; ret.owner = this ; return ret ;
    } ;
  },
  
  /**
    Alway YES since this is a class.
  */
  isClass: YES,
  
  /**
    Returns the name of this class.  If the name is not known, triggers
    a search.  This can be expensive the first time it is called.
  */
  objectClassName: function() {
    if (!this._objectClassName) this._findObjectClassNames() ;
    if (this._objectClassName) return this._objectClassName ;
    var ret = this ;
    while(ret && !ret._objectClassName) ret = ret._type; 
    return (ret && ret._objectClassName) ? ret._objectClassName : 'Anonymous' ;
  },

  /** @private
    This is a way of performing brute-force introspection.  This searches 
    through all the top-level properties looking for classes.  When it finds
    one, it saves the class path name.
  */
  _findObjectClassNames: function() {
    
    if (SC._foundObjectClassNames) return ;
    SC._foundObjectClassNames = true ;
    
    var seen = [] ;
    var searchObject = function(root, object, levels) {
      levels-- ;

      // not the fastest, but safe
      if (seen.indexOf(object) >= 0) return ;
      seen.push(object) ;

      for(var key in object) {
        if (key == '__scope__') continue ;
        if (key == '_type') continue ;
        if (!key.match(/^[A-Z0-9]/)) continue ;

        var path = (root) ? [root,key].join('.') : key ;
        var value = object[key] ;


        switch($type(value)) {
        case T_CLASS:
          if (!value._objectClassName) value._objectClassName = path;
          if (levels>=0) searchObject(path, value, levels) ;
          break ;

        case T_OBJECT:
          if (levels>=0) searchObject(path, value, levels) ;
          break ;

        case T_HASH:
          if (((root != null) || (path=='SC')) && (levels>=0)) searchObject(path, value, levels) ;
          break ;

        default:
          break;
        }
      }
    } ;
    
    searchObject(null, window, 2) ;
  },
  
  toString: function() { return this.objectClassName(); },
  
  // ..........................................
  // PROPERTY SUPPORT METHODS
  //
  // get the tuple for a property path (the object and key).
  tupleForPropertyPath: function(path,root) {
    if (path.constructor == Array) return path ;
    
    // * = the rest is a chained property.
    var parts = path.split('*') ; var key = null ;
    if (parts && parts.length > 1) {
      key = parts.pop(); path = parts.join('*') ;
    }
    
    // get object path. property is last part if * was nt found.
    parts = path.split('.') ;
    if (!key) key = parts.pop() ;
    
    // convert path to object.
    var obj = this.objectForPropertyPath(parts,root) ;
    return (obj && key) ? [obj,key] : null ;
  },
  
  objectForPropertyPath: function(path,root) {
    var parts = ($type(path) === T_STRING) ? path.split('.') : path ;
    if (!root) root = window ;
    var loc = 0, max = parts.length, key = null;
    while((loc < max) && (root)) {
      key = parts[loc++];
      if (key) root = (root.get) ? root.get(key) : root[key] ;
    }
    return (loc < max) ? undefined : root ;  
  },
  
  
  // ..........................................
  // INTERNAL SUPPORT METHODS
  //
  _init: function(extensions,type) {
    
    var ret = this ;
    for(var loc=0;loc<extensions.length;loc++) {
      ret = SC.Object._extend(ret,extensions[loc]) ;
    }
    ret._guid = SC.generateGuid() ;
    ret._type = type ;
    ret.init() ;
    
    return ret ;
  },

  // This will extend the base object with the properties passed in the second
  // var, maintaining super's for the functions and concatinating cprops.
  _extend: function(base,ext) { return this._extendAllProps(false, base, ext); },
  
  _extendAllProps: function(allProperties, base,ext) {
    var cprops = base._cprops ; var f = Prototype.emptyFunction ;
    
    // first, save any concat props.
    var concats = {} ;
    if (cprops) for(var cloc=0;cloc<cprops.length;cloc++) {
      var p = cprops[cloc]; var p1 = base[p]; var p2 = ext[p] ;
      p1 = (p1 && p2) ? Array.from(p1).concat(p2) : (p1 || p2) ;
      concats[p] = p1 ;
    }
    
    // deal with observers, bindings, and properties only if they are not 
    // defined already in the ext.  If they are defined in ext, they will be
    // concated using the above code.
    var bindings = (ext._bindings) ? null : (base._bindings || []).slice() ;
    var observers = (ext._observers) ? null : (base._observers || []).slice();
    var properties = (ext._properties) ? null : (base._properties || []).slice() ;
    var outlets = (ext.outlets) ? null : (base.outlets || []).slice() ;
    
    // now copy properties, add superclass to func.
    for(var key in ext) {
      // avoid copying builtin methods
      if (!allProperties && !ext.hasOwnProperty(key)) continue ; 

      // add super to funcs.  Be sure not to set the base of a func to itself
      // to avoid infinite loops.
      var value = (concats.hasOwnProperty(key) ? concats[key] : null) || ext[key] ;
      if (value && (value instanceof Function) && (!value.base)) {
        if (value != base[key]) value.base = base[key] || f;          
      }
      
      // Possibly add to a bindings.
      var keyLen = key.length ;
      if (bindings && (key.slice(keyLen-7,keyLen) == "Binding")) {
        bindings.push(key) ;
        
      // Also add observers, outlets, and properties for functions...
      } else if (value && (value instanceof Function)) {
        if (observers && value.propertyPaths) {
          observers.push(key) ;
        } else if (properties && value.dependentKeys) {
          properties.push(key) ;
        } else if (outlets && value.autoconfiguredOutlet) {
          outlets.push(key) ;
        }
      }

      // copy property
      base[key] = value ;
    }

    // copy bindings, observers, and properties if defined.
    if (bindings) base._bindings = bindings;
    if (observers) base._observers = observers ;
    if (properties) base._properties = properties ;
    if (outlets && outlets.length > 0) base.outlets = outlets ;

    //console.log('bindings: %@ -- observers: %@ -- properties: %@'.format(base._bindings,base._observers,base._properties)) ;
    
    return base ;
  },
  
  // Returns true if the receiver is a subclass of the named class.  If the
  // receiver is the class passed, this will return false.  See kindOf().
  subclassOf: function(scClass) {
    if (this == scClass) return false ;
    var t = this._type ;
    while(t) {
      if (t == scClass) return true ;
      t = t._type ;
    }
    return false ;
  },
  
  // Returns true if the receiver is the passed class or is any subclass.
  kindOf: function(scClass) { 
    if (this == scClass) return true ;
    return this.subclassOf(scClass); 
  }
  
}) ;

SC.idt = { count: 0, t: 0.0, keys: 0, observers: 0, bindings: 0, pv: 0, observers_t: 0, bindings_t: 0, pv_t: 0, conf_t: 0, b1_t: 0, b2_t: 0, b3_t: 0, e_count: 0, e_t: 0, v_count: 0, v_t: 0, vc_t: 0 ,active: false } ;

SC.report = function() {
  var c = SC.idt.count ;
  var e = SC.idt.e_count ;
  var v = SC.idt.v_count ;
  var ret = [] ;
  ret.push('CREATED: ' + c + ' (avg time: '+(Math.floor(SC.idt.t * 100 / c) / 100)+' msec)') ;
  ret.push('EXTENDED: ' + e + ' (avg time: '+(Math.floor(SC.idt.e_t * 100 / e) / 100)+' msec)') ;
  ret.push('AVG KEYS: ' + (Math.floor(SC.idt.keys * 100 / c) / 100)) ;
  ret.push('AVG OBSERVERS: ' + (Math.floor(SC.idt.observers * 100 / c) / 100)  + ' ('+ (Math.floor(SC.idt.observers_t * 100 / c) / 100) + ' msec)') ;
  ret.push('AVG BINDINGS: ' + (Math.floor(SC.idt.bindings * 100 / c) / 100)  + ' ('+ (Math.floor(SC.idt.bindings_t * 100 / c) / 100) + ' msec)') ;
  ret.push('AVG PV: ' + (Math.floor(SC.idt.pv * 100 / c) / 100)  + ' ('+ (Math.floor(SC.idt.pv_t * 100 / c) / 100) + ' msec)') ;
  ret.push('AVG CONFIGURE OUTLETS: ' + (Math.floor(SC.idt.conf_t * 100 / c) / 100)  + ' msec') ;
  ret.push('AVG B1: ' + (Math.floor(SC.idt.b1_t * 100 / c) / 100)  + ' msec') ;
  ret.push('EXT: ' + SC.idt.ext_c + ' (avg time: ' + (Math.floor(SC.idt.ext_t * 100 / SC.idt.ext_c) / 100)  + ' msec)') ;
  ret.push('VIEWS: ' + v + ' (avg time: ' + (Math.floor(SC.idt.v_t * 100 / v) / 100)  + ' msec)') ;
  ret.push('VIEW CREATE: ' + (Math.floor(SC.idt.vc_t * 100 / v) / 100)  + ' msec)') ;
  console.log(ret.join("\n")) ;
  return ret.join("\n") ;
} ;

// ..........................................
// DEFAULT OBJECT INSTANCE
// 
SC.Object.prototype = {
  
  /**
    Always YES since this is an object and not a class.
  */
  isObject: true,
  
  /**
    Returns YES if the named value is an executable function.
    
    @param methodName {String} the property name to check
    @returns {Boolean}
  */
  respondsTo: function( methodName )
  {
    return !!(methodName && this[methodName] && ($type(this[methodName]) == T_FUNCTION));
  },
  
  /**
    If the passed property is a method, then it will be executed with the
    passed arguments.  Otherwise, returns NO.
    
    @param methodName {String} the method name to try to perform.
    @param args {*arguments} arbitrary arguments to pass along to the method.
    @returns {Object} NO if method could not be performed or method result.
  */
  tryToPerform: function( methodName, args )
  {
    if ( !methodName ) return false;
    
    var args = SC.$A(arguments);
    var name = args.shift();
    if (this.respondsTo(name))
    {
      return this[name].apply(this,args);
    }
    return false;
  },
  
  /**
   this function is called automatically when a new object instance is
   created.  You can use this to configure your child elements if you want.
   Be sure to invoke the base method.
  */
  init: function() {
    
    // This keySource is used to fix a bug in FF that will not iterate through
    // keys you add to an HTMLElement.  The key values are still accessible, 
    // they just aren't visible to the for...in loop.  viewType is the hash
    // of values that was applied to the HTMLElement, so its a 1:1 substitute.
    var keySource = this.viewType || this ; 
    var loc ; var keys ; var key ; var value ; 
    
    var r = SC.idt.active ; var idtStart ; var idtSt ;
    if (r) {
      SC.idt.count++;
      idtStart = new Date().getTime() ;
    } ;
    
    // Add Observers
    if (keys = keySource._observers) for(loc=0;loc<keys.length;loc++) {
      key = keys[loc] ; value = this[key] ;

      if (r) {
        SC.idt.keys++ ;
        SC.idt.observers++ ;
        idtSt = new Date().getTime() ;
      }
      
      var propertyPaths = null ;
      if ((value instanceof Function) && value.propertyPaths) {
        propertyPaths = value.propertyPaths ;
        value = value.bind(this) ;
      } else if (typeof(value) == "string") {
        propertyPaths = [value] ;
        value = this.propertyObserver.bind(this,key.slice(0,-8)) ;
      }
      
      // a property path string was found.  Convert this to an object/path
      // and observe.
      if (propertyPaths) for(var ploc=0;ploc<propertyPaths.length;ploc++) { 
        var propertyPath = propertyPaths[ploc] ;
        var object = null;  
        
        // most common case. refers to local property.
        if (propertyPath.indexOf('.') == -1) {
          this.addObserver(propertyPath, value) ;
          
        // deal with more exotic cases
        } else switch(propertyPath.slice(0,1)) {
          // start with a . or * means this is a chained local path.
          case '*':
          case '.':
            propertyPath = propertyPath.slice(1,propertyPath.length) ;
            this.addObserver(propertyPath, value) ;
            break ;
            
          // this is an absolute path. so hook 'er up.
          default:
            SC.Observers.addObserver(propertyPath, value) ;
        }
      }
      
      if (r) SC.idt.observers_t += (new Date().getTime()) - idtSt ;
    }

    // Add Bindings
    this.bindings = [] ;
    if (keys = keySource._bindings) for(loc=0;loc<keys.length;loc++) {
      key = keys[loc] ; value = this[key] ;

      if (r) {
        SC.idt.keys++ ;
        SC.idt.bindings++ ;
        idtSt = new Date().getTime() ;
      }
        
      // get propertyKey
      var propertyKey = key.slice(0,-7) ; // contentBinding => content
      this[key] = this.bind(propertyKey, value) ;
      if (r) SC.idt.bindings_t += (new Date().getTime()) - idtSt ;      
    }

    // Add Properties
    if (keys = keySource._properties) for(loc=0;loc<keys.length;loc++) {
      key = keys[loc] ; value = this[key] ;
      if (value && value.dependentKeys && (value.dependentKeys.length > 0)) {
        args = value.dependentKeys.slice() ;
        args.unshift(key) ;
        this.registerDependentKey.apply(this,args) ;
      }
    }

    // Call 'initMixin' methods to automatically setup modules.
    if (this.initMixin) {
      var inc = Array.from(this.initMixin) ;
      for(var idx=0; idx < inc.length; idx++) inc[idx].call(this);
    }
    
    if (r) { SC.idt.t += ((new Date().getTime()) - idtStart); }
  },
  
  /**  
    EXPERIMENTAL: You can use this to call super in any method.  
    
    This currently does not work in some versions of Safari.  Instead you
    should use:
    
    argments.callee.base.apply(this, arguments); to call super.
    
    @params args {*args} any arguments you want to pass along.
    @returns {void}
  */
  $super: function(args) {
    var caller = SC.Object.prototype.$super.caller; 
    if (!caller) throw "$super cannot determine the caller method" ;
    if (caller.base) caller.base.apply(this, arguments) ;
  },
  
  /**  
    Add passed properties to the object's class.
    
    @param props {Hash} properties to append.
    @returns {void}
  */
  mixin: function() { return SC.Object.mixin.apply(this,arguments) ; },

  /**
    Returns all the keys defined on this object, excluding any defined in
    parent classes unless you pass all.
    
    @param {Boolean} all OPTIONAL: if YES return all keys, NO return only keys belonging to object itself.  Defaults to NO.
  */
  keys: function(all) {
    var ret = []; for(var key in this) { 
      if (all || ret.hasOwnProperty(key)) ret.push(key); 
    }; return ret ;  
  },

  /**  
    returns true if the receiver is an instance of the named class.  See also
    kindOf().
    
    @param {Class} scClass the class
    @returns {Boolean}
  */
  instanceOf: function(scClass) {
    return this._type == scClass ;  
  },
  
  /**  
    Returns true if the receiver is an instance of the named class or any 
    subclass of the named class.  See also instanceOf().
    
    @param scClass {Class} the class
    @returns {Boolean}
  */
  kindOf: function(scClass) {
    var t = this._type ;
    while(t) { 
      if (t == scClass) return true ;
      t = t._type ;
    }  
    return false ;
  },

  /** @private */
  toString: function() {
    if (!this.__toString) {
      this.__toString = "%@:%@".fmt(this._type.objectClassName(), this._guid);
    } 
    return this.__toString ;
  },
  
  // ..........................................
  // OUTLETS
  // 

  /**  
    Activates any outlet connections in the the object.  This is called 
    automatically for views typically.
    
    A view may contain outlets.  Outlets are a way to find and connect to
    elements within the view.
    
    @param key {String} optional single key to awake.
    @returns {void}
  */
  awake: function(key) { 
    // if a key is passed, convert that from an outlet and awake it. otherwise
    // awake self.
    if (key !== undefined) {
      var obj = this.outlet(key) ;
      if (obj) obj.awake() ;
      return ;
    }

    if (this._awake) return ;
    this._awake = true ;
    
    // it would be cool to do this in a recursive way, but sadly we cannot
    // without a stack overflow problem. Just loop through outlets and collect
    // items to awake.
    this.bindings.invoke('relay') ; 
    
    if (this.outlets && this.outlets.length) {
      var stack = [] ;
      var working = [this, this.outlets.slice()] ;
      while(working) {
        // find the next item to work on.
        var next = working[1].pop() ;
        var obj = working[0] ;
        
        // an item was found in the array. Process it.
        if (next) {
          next = obj[next] ;
          if (next) {
            // awake these bindings.
            if (next.bindings) next.bindings.invoke('relay') ;
            
            // next has outlets itself. Start a new context and process them.
            if (next.outlets && next.outlets.length > 0) {
              stack.push(working) ;
              working = [next,next.outlets.slice()] ;
            }
          }
          
        // no more items found in the current array. pop the stack.
        } else working = stack.pop() ;
      }
    }
    
  },
  
  /**  
    Array of outlets to awake automatically.
    
    If you have outlets defined on a class, add this array with their
    property names to have them awake automatically.  This array is merged
    with the parent class outlet's array automatically when you call extend().
    
    @type {Array}
    @field
  */
  outlets: [],

  /**
    Just like get() except it will also create an outlet-packaged view if that 
    is the value of the property.
    
    This method works just like get() except if the value of the property
    is an outlet-packaged View, the view will be created first.  You can use
    this to create lazy outlets.
    
    @param {String} key The key to read as an outlet.
    @returns {Object} the value of the key, possibly an awakened outlet.
  */        
  outlet: function(key) {
    var value = this[key] ; // get the current value.

    // if its an outlet, then configure it first.
    if (value && (value instanceof Function) && value.isOutlet == true) {
      if (!this._originalOutlets) this._originalOutlets = {} ;
      this._originalOutlets[key] = value ;

      // create the outlet by calling the outlet function.  this should be the owner view.
      value = value.call(this) ;
      this.set(key, value) ;
    } else if (typeof(value) == "string") {
      if (!this._originalOutlets) this._originalOutlets = {} ;
      this._originalOutlets[key] = value ;

      value = (this.$$sel) ? this.$$sel(value) : $$sel(value) ;
      if (value) value = (value.length > 0) ? ((value.length == 1) ? value[0] : value) : null ;
      this.set(key, value) ;
    }

    return value ;
  },

  /**
    Invokes the named method after the specified period of time.
    
    This is a convenience method that will create a single run timer to
    invoke a method after a period of time.  The method should have the
    signature:
    
    {{{
      methodName: function(timer)
    }}}
    
    If you would prefer to pass your own parameters instead, you can instead
    call invokeLater() directly on the function object itself.
    
    @param interval {Number} period from current time to schedule.
    @param methodName {String} method name to perform.
    @returns {SC.Timer} scheduled timer.
  */
  invokeLater: function(methodName, interval) {
    if (interval === undefined) interval = 1 ;
    var f = methodName ;
    if (arguments.length > 2) {
      var args =SC.$A(arguments).slice(2,arguments.length);
      args.unshift(this);
      if ($type(f) === T_STRING) f = this[methodName] ;
      f = f.bind.apply(f, args) ;
    }
    return SC.Timer.schedule({ target: this, action: f, interval: interval });
  },
  
  _cprops: ['_cprops','outlets','_bindings','_observers','_properties', 'initMixin']  

} ;

Object.extend(SC.Object.prototype, SC.Observable) ;


function logChange(target,key,value) {
  console.log("CHANGE: " + target + "["+key+"]=" + value) ;
}


// ........................................................................
// CHAIN OBSERVER
//

// ChainObservers are used to automatically monitor a property several 
// layers deep.
// org.plan.name = SC._ChainObserver.create({
//    target: this, property: 'org',
//    next: SC._ChainObserver.create({
//      property: 'plan',
//      next: SC._ChainObserver.create({
//        property: 'name', func: myFunc
//      })
//    })
//  })
//
SC._ChainObserver = SC.Object.extend({
  
  isChainObserver: true,
  
  // the object this link in the chain is observing.
  target: null,
    
  // the property on the object this link is observing
  property: null,
    
  // if not null, the next link in the chain.  The target property
  // of this next link will be set to the value of this link.
  next: null,
    
  // if not null, the function to be called when the property value changes.
  func: null,
    
  propertyObserver: function(observing,target,key,value) {
    if ((key == 'target') && (value != this._target)) {
      var func = this.boundObserver() ;
      if (this._target && this._target.removeObserver) {
        this._target.removeObserver(this.property,func);
      } 
      this._target = value ;
      if (this._target && this._target.addObserver) {
        this._target.addObserver(this.property,func) ;
      }
      
      // the target property has probably changed since the target has
      // changed. notify myself of this.
      if (!(observing == 'init')) this.targetPropertyObserver() ;
    }
  },
  
  boundObserver: function() {
    if (!this._boundObserver) {
      this._boundObserver = this.targetPropertyObserver.bind(this) ;
    }
    return this._boundObserver ;
  },
  
  // invoked when the target property changes.  act based 
  targetPropertyObserver: function() {
    
    // get the new target property value.  if the target or property is 
    // not valid, just use null.
    var value = (this.target && this.target.get && this.property) ? this.target.get(this.property) : null ;

    if (value !== this._lastTargetProperty) {
      this._lastTargetProperty = value ;
      // if we have another item in the chain, just forward the change.
      if (this.next) {
        this.next.set('target',value) ;
        
      // otherwise, invoke the function.
      } else if (this.func) this.func(this.target,this.property,value) ;
    }
    
  },
  
  // hookup observer.
  init: function() {
    arguments.callee.base.call(this) ;
    this.propertyObserver('init',this,'target',this.get('target')) ;
  }
    
}) ;

// Class Methods.
SC._ChainObserver.mixin({
  createChain: function(target,keys,func) {
    var property = keys.shift() ;
    var nextTarget = (target && property && target.get) ? target.get(property) : null ;
    var next = (keys && keys.length>0) ? this.createChain(nextTarget,keys,func) : null ;
    
    return this.create({
      target: target, property: property,
      next: next, func: ((next) ? null : func)        
    }) ;
  }
}) ;
