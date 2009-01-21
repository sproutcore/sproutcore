// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('core') ;
require('system/mixins/observable') ;
require('system/mixins/array') ;

/*globals $$sel */

SC.BENCHMARK_OBJECTS = NO;

/** @class

  Root object for the SproutCore framework.  SC.Object is the root class for
  most classes defined by SproutCore.  It builds on top of the native object
  support provided by JavaScript to provide support for class-like 
  inheritance, automatic bindings, properties observers, and more.  
  
  Most of the classes you define in your application should inherit from 
  SC.Object or one of its subclasses.  If you are writing objects of your
  own, you should read this documentation to learn some of the details of 
  how SC.Object's behave and how they differ from other frameworks.
  
  h2. About SproutCore Classes
  
  JavaScript is not a class-based language.  Instead it uses a type of 
  inheritence inspired by self called "prototypical" inheritance. 
  ...

  h2. Using SproutCore objects with other JavaScript object.
  
  You can create a SproutCore object just like any other object...
  obj = new SC.Object() ;
  
  @extends SC.Observable 
  @author Charles Jolley
  @constructor
  @since SproutCore 1.0
*/
SC.Object = function(props) { return this.__init(props); };

SC.mixin(SC.Object, /** @scope SC.Object @static */ {

  /**
    Adds the passed properties to the object's class definition.  You can pass
    as many hashes as you want, including Mixins, and they will be added in
    the order they are passed.
    
    @params {Hash} props the properties you want to add.
    @returns {Object} receiver
  */
  mixin: function(props) {
    var len = arguments.length, loc ;
    for(loc =0;loc<len;loc++) SC.mixin(this, arguments[loc]);
    return this ;
  },
  
  // ..........................................
  // CREATING CLASSES AND INSTANCES
  //
  
  /**
    Creates a new subclass of the receiver, adding any passed properties to
    the instance definition of the new class.  You should use this method
    when you plan to create several objects based on a class with similar 
    properties.
    
    h2. Init
    
    If you define an init() method, it will be called when you create 
    instances of your new class.  Since SproutCore uses the init() method to
    do important setup, you must be sure to always call sc_super() somewhere
    in your init() to allow the normal setup to proceed.
    
    @params {Hash} props the methods of properties you want to add
    @returns {Class} A new object class
  */
  extend: function(props) {   
    var bench = SC.BENCHMARK_OBJECTS ;
    if (bench) SC.Benchmark.start('SC.Object.extend') ;

    // build a new constructor and copy class methods.  Do this before adding
    // any other properties so they are not overwritten by the copy.
    var prop, ret = function(props) { return this.__init(props); } ;
    for(prop in this) {
      if (!this.hasOwnProperty(prop)) continue ;
      ret[prop] = this[prop];
    }
    if (this.hasOwnProperty('toString')) ret.toString = this.toString;

    // now setup superclass, guid
    ret.superclass = this ;
    SC.generateGuid(ret); // setup guid

    // setup new prototype and add properties to ti
    var base = (ret.prototype = SC.beget(this.prototype));
    var idx, len = arguments.length;
    for(idx=0;idx<len;idx++) SC._object_extend(base, arguments[idx]) ;
    base.constructor = ret; // save constructor

    if (bench) SC.Benchmark.end('SC.Object.extend') ;
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
  create: function(props) { var C=this; return new C(arguments); },

  /**
    Takes an array of hashes and returns newly created instances.
    
    This convenience method will take an array of properties and simply
    instantiates objects from them.
    
    @params {Array} array Array of hashes with properties to assigned to each object.
    @returns {Array} instantiated objects.
  */
  createEach: function(array) {
    return array.map(function(props) { return this.create(props); }, this);
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
    }.property().cacheable().outlet() ;
  },
  
  /**
    Always YES since this is a class.
  */
  isClass: YES,
  
  toString: function() { return SC._object_className(this); },
  
  // ..........................................
  // PROPERTY SUPPORT METHODS
  //

  /** 
    Returns YES if the receiver is a subclass of the named class.  If the 
    receiver is the class passed, this will return NO since the class is not
    a subclass of itself.  See also kindOf().
    
    @param {Class} scClass class to compare
    @returns {Boolean} 
  */
  subclassOf: function(scClass) {
    if (this === scClass) return NO ;
    var t = this ;
    while(t = t.superclass) if (t === scClass) return YES ;
    return NO ;
  },

  /**
    Returns YES if the receiver is the passed class or is a subclass of the 
    passed class.  See also subclassOf().
    
    @param {Class} scClass class to compare
    @returns {Boolean} 
  */
  kindOf: function(scClass) { 
    return (this === scClass) || this.subclassOf(scClass) ;
  }
  
}) ;

// ..........................................
// DEFAULT OBJECT INSTANCE
// 
SC.Object.prototype = {
  
  /** @private
    This is the first method invoked on a new instance.  It will first apply
    any added properties to the new instance and then calls the real init()
    method.
    
    @param {Array} extensions an array-like object with hashes to apply.
    @returns {Object} receiver
  */
  __init: function(extensions) {
    // apply any new properties
    var idx, len = (extensions) ? extensions.length : 0;
    for(idx=0;idx<len;idx++) SC._object_extend(this, extensions[idx]) ;
    SC.generateGuid(this) ; // add guid
    this.init() ; // call real init

    // Call 'initMixin' methods to automatically setup modules.
    var inits = this.initMixin; len = (inits) ? inits.length : 0 ;
    for(idx=0;idx < len; idx++) inits[idx].call(this);

    return this ; // done!
  },

  /** 
    You can call this method on an object to mixin one or more hashes of 
    properties on the receiver object.  In addition to simply copying 
    properties, this method will also prepare the properties for use in 
    bindings, computed properties, etc.
    
    If you plan to use this method, you should call it before you call
    the inherited init method from SC.Object or else your instance may not 
    function properly.  
    
    @param {Hash} ext a hash to copy.  Only one.
    @returns {Object} receiver
  */
  mixin: function() {
    var idx, len = arguments.length;
    for(idx=0;idx<len;idx++) SC.mixin(this, arguments[idx]) ;
    
    // call initMixin
    for(idx=0;idx<len;idx++) {
      var init = arguments[idx].initMixin ;
      if (init) init.call(this) ;
    }
    return this ;
  },

  /**
    This method is invoked automatically whenever a new object is 
    instantiated.  You can override this method as you like to setup your
    new object.  
    
    Within your object, be sure to call sc_super() to ensure that the built-in
    init method is also called or your observers and computed properties may
    not be configured.
    
    Although the default init() method returns the receiver, the return value
    is ignored.
    
    @returns {Object} reciever
  */
  init: function() {
    this.initObservable();
    return this ;
  },

  /**
    Set to NO once this object has been destroyed. 
  */
  isDestroyed: NO,
  
  /**
    Call this method when you are finished with an object to teardown its
    contents.  Because JavaScript is garbage collected, you do not usually 
    need to call this method.  However, you may choose to do so for certain
    objects, especially views, in order to let them reclaim memory they 
    consume immediately.
    
    @returns {SC.Object} receiver
  */
  destroy: function() {
    if (this.get('isDestroyed')) return this; // nothing to do
    this.set('isDestroyed', YES);

    // destroy any mixins
    var idx, inits = this.destroyMixin, len = (inits) ? inits.length : 0 ;
    for(idx=0;idx < len; idx++) inits[idx].call(this);
    
    return this ;
  },

  /**
    Always YES since this is an object and not a class.
  */
  isObject: true,
  
  /**
    Returns YES if the named value is an executable function.
    
    @param methodName {String} the property name to check
    @returns {Boolean}
  */
  respondsTo: function( methodName ) {
    return !!(SC.typeOf(this[methodName]) === SC.T_FUNCTION);
  },
  
  /**
    Attemps to invoked the named method, passing the included two arguments.  
    Returns NO if the method is either not implemented or if the handler returns 
    NO (indicating that it did not handle the event).  This method is invoked to 
    deliver actions from menu items and to deliver events.  You can override 
    this method to provide additional handling if you prefer.
    
    @param {String} methodName
    @param {Object} arg1
    @param {Object} arg2
    @returns {Boolean} YES if handled, NO if not handled
  */
  tryToPerform: function(methodName, arg1, arg2) {
    return this.respondsTo(methodName) && this[methodName](arg1, arg2);
  },
  
  /**  
    EXPERIMENTAL: You can use this to call super in any method.  
    
    This currently does not work in some Safari 2 or earlier.  Instead you
    should use:
    
    sc_super();
    
    @params args {*args} any arguments you want to pass along.
    @returns {Object} return value from super
  */
  superclass: function(args) {
    var caller = arguments.callee.caller; 
    if (!caller) throw "superclass cannot determine the caller method" ;
    return caller.superclass ? caller.superclass.apply(this, arguments) : null;
  },
  
  /**
    Returns all the keys defined on this object, excluding any defined in
    parent classes unless you pass all.
    
    @param {Boolean} all OPTIONAL: if YES return all keys, NO return only keys belonging to object itself.  Defaults to NO.
    @returns {Array} keys
  */
  keys: function(all) {
    var ret = []; 
    for(var key in this) { 
      if (all || ret.hasOwnProperty(key)) ret.push(key); 
    } 
    return ret ;  
  },

  /**  
    returns YES if the receiver is an instance of the named class.  See also
    kindOf().
    
    @param {Class} scClass the class
    @returns {Boolean}
  */
  instanceOf: function(scClass) {
    return this.constructor === scClass ;  
  },
  
  /**  
    Returns true if the receiver is an instance of the named class or any 
    subclass of the named class.  See also instanceOf().
    
    @param scClass {Class} the class
    @returns {Boolean}
  */
  kindOf: function(scClass) { return this.constructor.kindOf(scClass); },

  /** @private */
  toString: function() {
    if (!this.__toString) {
      this.__toString = "%@:%@".fmt(SC._object_className(this.constructor), SC.guidFor(this));
    } 
    return this.__toString ;
  },
  
  // ..........................................
  // OUTLETS
  // 

  /**  
    Activates any outlet connections in object and syncs any bindings.  This
    method is called automatically for view classes but may be used for any
    object.
    
    @returns {void}
  */
  awake: function(key) { 
    this.outlets.forEach(function(key) { this.get(key); },this) ;
    this.bindings.invoke('sync'); 
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
      var args =SC.$A(arguments).slice(2);
      args.unshift(this);
      if (SC.$type(f) === SC.T_STRING) f = this[methodName] ;
      // f = f.bind.apply(f, args) ;
      var that = this, func = f ;
      f = function() { return func.apply(that, args.slice(1)); } ;
    }
    return SC.Timer.schedule({ target: this, action: f, interval: interval });
  },

  /**
    Invokes the passed method or method name one time during the runloop.
    
    @param {Funciton} method
    @returns {SC.Object} receiver
  */
  invokeOnce: function(method) {
    SC.runLoop.invokeOnce(this, method);
    return this ;
  },
  
  /**
    Lookup the named property path and then invoke the passed function, 
    passing the resulting value to the function.
    
    This method is a useful way to handle deferred loading of properties.  
    If you want to defer loading a property, you can override this method.
    When the method is called, passing a deferred property, you can load the
    property before invoking the callback method.
    
    You can even swap out the receiver object.  
    
    The callback method should have the signature:
    
    function callback(objectAtPath, sourceObject) { ... }
    
    You may pass either a function itself or a target/method pair.
    
    @param {String} pathName
    @param {Object} target or method
    @param {Function} method
    @returns {SC.Object} receiver
  */
  invokeWith: function(pathName, target, method) {
    // normalize target/method
    if (method === undefined) {
      method = target; target = this;
    }
    if (!target) target = this ;
    if (SC.typeOf(method) === SC.T_STRING) method = target[method];
    
    // get value
    var v = this.getPath(pathName);
    
    // invoke method
    method.call(target, v, this);
    return this ;
  },
  
  /**
    The properties named in this array will be concatenated in subclasses
    instead of replaced.  This allows you to name special properties that
    should contain any values you specify plus values specified by parents.
    It is used by SproutCore and is available for your use, though you should
    limit the number of properties you include in this list as it adds a 
    slight overhead to new class and instance creation.
    
    @property
  */
  concatenatedProperties: ['concatenatedProperties', 'initMixin', 'destroyMixin']  

} ;

// bootstrap the constructor for SC.Object.
SC.Object.prototype.constructor = SC.Object;

// Add observable to mixin
SC.mixin(SC.Object.prototype, SC.Observable) ;

/* 
  Private helper methods.  These are not kept as part of the class
  definition because SC.Object is copied frequently and we want to keep the
  number of class methods to a minimum.
*/
SC.mixin({

  /** @private
    Augments the base object with the added property hashes.  This will also
    register observers and computed properties.
  */
  _object_extend: function(base, ext) {
    if (!ext) return base; // nothing to do
    
    // set _kvo_cloned for later use
    base._kvo_cloned = null;
    
    // get some common vars
    var key, idx, len, cur, cprops = base.concatenatedProperties, K = SC.K ;
    var p1,p2;
    
    // first, save any concat props.  use old or new array or concat
    idx = (cprops) ? cprops.length : 0 ;
    var concats = (idx>0) ? {} : null;
    while(--idx>=0) {
      key = cprops[idx]; p1 = base[key]; p2 = ext[key];

      if (p1) {
        if (!(p1 instanceof Array)) p1 = SC.$A(p1);
        concats[key] = (p2) ? p1.concat(p2) : p2 ;
      } else {
        if (!(p2 instanceof Array)) p2 = SC.$A(p2);
        concats[key] = p2 ;
      }
    }

    // setup arrays for bindings, observers, and properties.  Normally, just
    // save the arrays from the base.  If these need to be changed during 
    // processing, then they will be cloned first.
    var bindings = base._bindings, clonedBindings = NO;
    var observers = base._observers, clonedObservers = NO;
    var properties = base._properties, clonedProperties = NO;
    var paths, pathLoc, local ;

    // outlets are treated a little differently because you can manually 
    // name outlets in the passed in hash. If this is the case, then clone
    // the array first.
    var outlets = base.outlets, clonedOutlets = NO ;
    if (ext.outlets) { 
      outlets = (outlets || SC.A).concat(ext.outlets);
      clonedOutlets = YES ;
    }
    
    // now copy properties, add superclass to func.
    for(key in ext) {

      if (key === '_kvo_cloned') continue; // do not copy
      
      // avoid copying builtin methods
      if (!ext.hasOwnProperty(key)) continue ; 

      // get the value.  use concats if defined
      var value = (concats.hasOwnProperty(key) ? concats[key] : null) || ext[key] ;

      // Possibly add to a bindings.
      if (key.slice(-7) === "Binding") {
        if (!clonedBindings) {
          bindings = (bindings || SC.A).slice() ;
          clonedBindings = YES ;
        }

        if (bindings === null) bindings = (base._bindings || SC.A).slice();
        bindings[bindings.length] = key ;
        
      // Also add observers, outlets, and properties for functions...
      } else if (value && (value instanceof Function)) {

        // add super to funcs.  Be sure not to set the base of a func to 
        // itself to avoid infinite loops.
        if (!value.superclass && (value !== (cur=base[key]))) {
          value.superclass = value.base = cur || K;
        }

        // handle regular observers
        if (value.propertyPaths) {
          if (!clonedObservers) {
            observers = (observers || SC.A).slice() ;
            clonedObservers = YES ;
          }
          observers[observers.length] = key ;

        // handle local properties
        } else if (paths = value.localPropertyPaths) {
          pathLoc = paths.length;
          while(--pathLoc >= 0) {
            local = base._kvo_for(SC.keyFor('_kvo_local', paths[pathLoc]), SC.Set);
            local.add(key);
          }
          
        // handle computed properties
        } else if (value.dependentKeys) {
          if (!clonedProperties) {
            properties = (properties || SC.A).slice() ;
            clonedProperties = YES ;
          }
          properties[properties.length] = key ;
          
        // handle outlets
        } else if (value.autoconfiguredOutlet) {
          if (!clonedOutlets) {
            outlets = (outlets || SC.A).slice();
            clonedOutlets = YES ;
          }
          outlets[outlets.length] = key ;          
        }
      }

      // copy property
      base[key] = value ;
    }

    // copy bindings, observers, and properties 
    base._bindings = bindings || [];
    base._observers = observers || [] ;
    base._properties = properties || [] ;
    base.outlets = outlets || [];

    // toString is usually skipped.  Don't do that!
    if (ext.hasOwnProperty('toString')) base.toString = ext.toString;
    
    return base ;
  },

  /** @private
    Returns the name of this class.  If the name is not known, triggers
    a search.  This can be expensive the first time it is called.
  */
  _object_className: function(obj) {
    if (!SC.isReady) return ''; // class names are not available until ready
    if (!obj.__className) SC._object_findClassNames() ;
    if (obj.__className) return obj.__className ;

    // if no direct classname was found, walk up class chain looking for a 
    // match.
    var ret = obj ;
    while(ret && !ret.__className) ret = ret.superclass; 
    return (ret && ret.__className) ? ret.__className : 'Anonymous';
  },

  /** @private
    This is a way of performing brute-force introspection.  This searches 
    through all the top-level properties looking for classes.  When it finds
    one, it saves the class path name.
  */
  _object_findClassNames: function() {
    
    if (SC._object_foundObjectClassNames) return ;
    SC._object_foundObjectClassNames = true ;
    
    var seen = [] ;
    var searchObject = function(root, object, levels) {
      levels-- ;

      // not the fastest, but safe
      if (seen.indexOf(object) >= 0) return ;
      seen.push(object) ;

      for(var key in object) {
        if (key == '__scope__') continue ;
        if (key == 'superclass') continue ;
        if (!key.match(/^[A-Z0-9]/)) continue ;

        var path = (root) ? [root,key].join('.') : key ;
        var value = object[key] ;


        switch(SC.$type(value)) {
        case SC.T_CLASS:
          if (!value.__className) value.__className = path;
          if (levels>=0) searchObject(path, value, levels) ;
          break ;

        case SC.T_OBJECT:
          if (levels>=0) searchObject(path, value, levels) ;
          break ;

        case SC.T_HASH:
          if (((root) || (path==='SC')) && (levels>=0)) searchObject(path, value, levels) ;
          break ;

        default:
          break;
        }
      }
    } ;
    
    searchObject(null, window, 2) ;
    
    // Internet Explorer doesn's loop over global variables...
    if ( SC.browser.isIE ) {
      searchObject('SC', SC, 2) ; // get names for the SC classes
      
      // get names for the model classes, including nested namespaces (untested)
      for ( var i = 0; i < SC.Server.servers.length; i++ ) {
        var server = SC.Server.servers[i];
        if (server.prefix) {
          for (var prefixLoc = 0; prefixLoc < server.prefix.length; prefixLoc++) {
            var prefixParts = server.prefix[prefixLoc].split('.');
            var namespace = window;
            var namespaceName;
            for (var prefixPartsLoc = 0; prefixPartsLoc < prefixParts.length; prefixPartsLoc++) {
              namespace = namespace[prefixParts[prefixPartsLoc]] ;
              namespaceName = prefixParts[prefixPartsLoc];
            }
            searchObject(namespaceName, namespace, 2) ;
          }
        }
      }
    }
  }
    
}) ;

function logChange(target,key,value) {
  console.log("CHANGE: %@[%@] = %@".fmt(target, key, target.get(key)));
}


