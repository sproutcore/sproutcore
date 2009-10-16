// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('core') ;
sc_require('mixins/observable') ;
sc_require('mixins/array') ;
sc_require('system/set');

/*globals $$sel */

SC.BENCHMARK_OBJECTS = NO;

// ..........................................................
// PRIVATE HELPER METHODS
// 
// Private helper methods.  These are not kept as part of the class
// definition because SC.Object is copied frequently and we want to keep the
// number of class methods to a minimum.

/** @private
  Augments a base object by copying the properties from the extended hash.
  In addition to simply copying properties, this method also performs a 
  number of optimizations that can make init'ing a new object much faster
  including:
  
  - concating concatenatedProperties
  - prepping a list of bindings, observers, and dependent keys
  - caching local observers so they don't need to be manually constructed.

  @param {Hash} base hash
  @param {Hash} extension
  @returns {Hash} base hash
*/
SC._object_extend = function _object_extend(base, ext) {
  if (!ext) throw "SC.Object.extend expects a non-null value.  Did you forget to 'sc_require' something?  Or were you passing a Protocol to extend() as if it were a mixin?";

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
    outlets = (outlets || SC.EMPTY_ARRAY).concat(ext.outlets);
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
        bindings = (bindings || SC.EMPTY_ARRAY).slice() ;
        clonedBindings = YES ;
      }

      if (bindings === null) bindings = (base._bindings || SC.EMPTY_ARRAY).slice();
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
          observers = (observers || SC.EMPTY_ARRAY).slice() ;
          clonedObservers = YES ;
        }
        observers[observers.length] = key ;

      // handle local properties
      } else if (paths = value.localPropertyPaths) {
        pathLoc = paths.length;
        while(--pathLoc >= 0) {
          local = base._kvo_for(SC.keyFor('_kvo_local', paths[pathLoc]), SC.Set);
          local.add(key);
          base._kvo_for('_kvo_observed_keys', SC.CoreSet).add(paths[pathLoc]);
        }

      // handle computed properties
      } else if (value.dependentKeys) {
        if (!clonedProperties) {
          properties = (properties || SC.EMPTY_ARRAY).slice() ;
          clonedProperties = YES ;
        }
        properties[properties.length] = key ;

      // handle outlets
      } else if (value.autoconfiguredOutlet) {
        if (!clonedOutlets) {
          outlets = (outlets || SC.EMPTY_ARRAY).slice();
          clonedOutlets = YES ;
        }
        outlets[outlets.length] = key ;          
      }
    }

    // copy property
    base[key] = value ;
  }
  
  // Manually set base on toString() because some JS engines (such as IE8) do
  // not enumerate it
  if (ext.hasOwnProperty('toString')) {
    key = 'toString';
    // get the value.  use concats if defined
    value = (concats.hasOwnProperty(key) ? concats[key] : null) || ext[key] ;
    if (!value.superclass && (value !== (cur=base[key]))) {
      value.superclass = value.base = cur || K ;
    }
    // copy property
    base[key] = value ;
  }


  // copy bindings, observers, and properties 
  base._bindings = bindings || [];
  base._observers = observers || [] ;
  base._properties = properties || [] ;
  base.outlets = outlets || [];

  return base ;
} ;

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
  @since SproutCore 1.0
*/
SC.Object = function(props) { return this._object_init(props); };

SC.mixin(SC.Object, /** @scope SC.Object */ {

  /**
    Adds the passed properties to the object's class definition.  You can 
    pass as many hashes as you want, including Mixins, and they will be 
    added in the order they are passed.

    This is a shorthand for calling SC.mixin(MyClass, props...);
    
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
    Points to the superclass for this class.  You can use this to trace a
    class hierarchy.
    
    @property {SC.Object}
  */
  superclass: null,
  
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

    // build a new constructor and copy class methods.  Do this before 
    // adding any other properties so they are not overwritten by the copy.
    var prop, ret = function(props) { return this._object_init(props); } ;
    for(prop in this) {
      if (!this.hasOwnProperty(prop)) continue ;
      ret[prop] = this[prop];
    }
    
    // manually copy toString() because some JS engines do not enumerate it
    if (this.hasOwnProperty('toString')) ret.toString = this.toString;

    // now setup superclass, guid
    ret.superclass = this ;
    SC.generateGuid(ret); // setup guid

    ret.subclasses = SC.Set.create();
    this.subclasses.add(ret); // now we can walk a class hierarchy

    // setup new prototype and add properties to it
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
    for an object.  Instead, you pass a hash of additonal properties you 
    want to have assigned to the object when it is first created.  This is
    functionally like creating a anonymous subclass of the receiver and then
    instantiating it, but more efficient.

    You can use create() like you would a normal constructor in a 
    class-based system, or you can use it to create highly customized 
    singleton objects such as controllers or app-level objects.  This is 
    often more efficient than creating subclasses and than instantiating 
    them.

    You can pass any hash of properties to this method, including mixins.
    
    @param {Hash} props 
      optional hash of method or properties to add to the instance.
      
    @returns {SC.Object} new instance of the receiver class.
  */
  create: function(props) { var C=this; return new C(arguments); },

  /**
    Walk like a duck.  You can use this to quickly test classes.
    
    @property {Boolean}
  */
  isClass: YES,

  /**
    Set of subclasses that extend from this class.  You can observe this 
    array if you want to be notified when the object is extended.
    
    @property {SC.Set}
  */
  subclasses: SC.Set.create(),
  
  /** @private */
  toString: function() { return SC._object_className(this); },

  // ..........................................
  // PROPERTY SUPPORT METHODS
  //

  /** 
    Returns YES if the receiver is a subclass of the named class.  If the 
    receiver is the class passed, this will return NO since the class is not
    a subclass of itself.  See also kindOf().

    h2. Example
    
    {{{
      ClassA = SC.Object.extend();
      ClassB = ClassA.extend();

      ClassB.subclassOf(ClassA) => YES
      ClassA.subclassOf(ClassA) => NO
    }}}
    
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
    Returns YES if the passed object is a subclass of the receiver.  This is 
    the inverse of subclassOf() which you call on the class you want to test.
    
    @param {Class} scClass class to compare
    @returns {Boolean}
  */
  hasSubclass: function(scClass) {
    return (scClass && scClass.subclassOf) ? scClass.subclassOf(this) : NO;
  },

  /**
    Returns YES if the receiver is the passed class or is a subclass of the 
    passed class.  Unlike subclassOf(), this method will return YES if you
    pass the receiver itself, since class is a kind of itself.  See also 
    subclassOf().

    h2. Example

    {{{
      ClassA = SC.Object.extend();
      ClassB = ClassA.extend();

      ClassB.kindOf(ClassA) => YES
      ClassA.kindOf(ClassA) => YES
    }}}
    
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
  
  _kvo_enabled: YES,
  
  /** @private
    This is the first method invoked on a new instance.  It will first apply
    any added properties to the new instance and then calls the real init()
    method.
    
    @param {Array} extensions an array-like object with hashes to apply.
    @returns {Object} receiver
  */
  _object_init: function(extensions) {
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
    
    h2. Example
    
    {{{
      // dynamically apply a mixin specified in an object property
      var MyClass = SC.Object.extend({
         extraMixin: null,
         
         init: function() {
           this.mixin(this.extraMixin);
           sc_super();
         }
      });
      
      var ExampleMixin = { foo: "bar" };
      
      var instance = MyClass.create({ extraMixin: ExampleMixin }) ;
      
      instance.get('foo') => "bar"
    }}}

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

    Within your object, be sure to call sc_super() to ensure that the 
    built-in init method is also called or your observers and computed 
    properties may not be configured.

    Although the default init() method returns the receiver, the return 
    value is ignored.

    @returns {void}
  */
  init: function() {
    this.initObservable();
    return this ;
  },

  /**
    Set to NO once this object has been destroyed. 
    
    @property {Boolean}
  */
  isDestroyed: NO,

  /**
    Call this method when you are finished with an object to teardown its
    contents.  Because JavaScript is garbage collected, you do not usually 
    need to call this method.  However, you may choose to do so for certain
    objects, especially views, in order to let them reclaim memory they 
    consume immediately.

    If you would like to perform additional cleanup when an object is
    finished, you may override this method.  Be sure to call sc_super().
    
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
    Walk like a duck. Always YES since this is an object and not a class.
    
    @property {Boolean}
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
    Returns NO if the method is either not implemented or if the handler 
    returns NO (indicating that it did not handle the event).  This method 
    is invoked to deliver actions from menu items and to deliver events.  
    You can override this method to provide additional handling if you 
    prefer.

    @param {String} methodName
    @param {Object} arg1
    @param {Object} arg2
    @returns {Boolean} YES if handled, NO if not handled
  */
  tryToPerform: function(methodName, arg1, arg2) {
    return this.respondsTo(methodName) && (this[methodName](arg1, arg2) !== NO);
  },

  /**  
    EXPERIMENTAL:  You can use this to invoke a superclass implementation in
    any method.  This does not work in Safari 2 or earlier.  If you need to
    target these methods, you should use one of the alternatives below:

    - *With Build Tools:* sc_super();
    - *Without Build Tools:* arguments.callee.base.apply(this, arguments);
    
    h2. Example
    
    All of the following methods will call the superclass implementation of
    your method:
    
    {{{
      SC.Object.create({
        
        // DOES NOT WORK IN SAFARI 2 OR EARLIER
        method1: function() {
          this.superclass();
        },
        
        // REQUIRES SC-BUILD TOOLS
        method2: function() {
          sc_super();
        },
        
        // WORKS ANYTIME
        method3: function() {
          arguments.callee.base.apply(this, arguments);
        }
      });
    }}}

    @params args {*args} any arguments you want to pass along.
    @returns {Object} return value from super
  */
  superclass: function(args) {
    var caller = arguments.callee.caller; 
    if (!caller) throw "superclass cannot determine the caller method" ;
    return caller.superclass ? caller.superclass.apply(this, arguments) : null;
  },

  /**  
    returns YES if the receiver is an instance of the named class.  See also
    kindOf().

    h2. Example
    
    {{{
      var ClassA = SC.Object.extend();
      var ClassB = SC.Object.extend();
      
      var instA = ClassA.create();
      var instB = ClassB.create();
      
      instA.instanceOf(ClassA) => YES
      instB.instanceOf(ClassA) => NO
    }}}
    
    @param {Class} scClass the class
    @returns {Boolean}
  */
  instanceOf: function(scClass) {
    return this.constructor === scClass ;  
  },

  /**  
    Returns true if the receiver is an instance of the named class or any 
    subclass of the named class.  See also instanceOf().

    h2. Example
    
    {{{
      var ClassA = SC.Object.extend();
      var ClassB = SC.Object.extend();
      
      var instA = ClassA.create();
      var instB = ClassB.create();
      
      instA.kindOf(ClassA) => YES
      instB.kindOf(ClassA) => YES
    }}}

    @param scClass {Class} the class
    @returns {Boolean}
  */
  kindOf: function(scClass) { return this.constructor.kindOf(scClass); },

  /** @private */
  toString: function() {
    if (!this._object_toString) {
      // only cache the string if the klass name is available
      var klassName = SC._object_className(this.constructor) ;
      var string = "%@:%@".fmt(klassName, SC.guidFor(this));
      if (klassName) this._object_toString = string ;
      else return string ;
    } 
    return this._object_toString ;
  },

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
    Invokes the passed method or method name one time during the runloop.  You
    can use this method to schedule methods that need to execute but may be 
    too expensive to execute more than once, such as methods that update the
    DOM.
    
    @param {Funciton|String} method method or method name
    @returns {SC.Object} receiver
  */
  invokeOnce: function(method) {
    SC.RunLoop.currentRunLoop.invokeOnce(this, method) ;
    return this ;
  },
  
  /**
    Invokes the passed method once at the beginning of the next runloop, 
    before any other methods (including events) are processed. This is useful
    for situations where you know you need to update something, but due to
    the way the run loop works, you can't actually do the update until the
    run loop has completed.
    
    A simple example is setting the selection on a collection controller to a 
    newly created object. Because the collection controller won't have its
    content collection updated until later in the run loop, setting the 
    selection immediately will have no affect. In this situation, you could do
    this instead:
    
    {{{
      // Creates a new MyRecord object and sets the selection of the
      // myRecord collection controller to the new object.
      createObjectAction: function(sender, evt) {
        // create a new record and add it to the store
        var obj = MyRecord.newRecord() ;
        
        // update the collection controller's selection
        MyApp.myRecordCollectionController.invokeLast( function() {
          this.set('selection', [obj]) ;
        });
      }
    }}}
    
    You can call invokeLast as many times as you like and the method will
    only be invoked once.
    
    @param {Funciton|String} method method or method name
    @returns {SC.Object} receiver
  */
  invokeLast: function(method) {
    SC.RunLoop.currentRunLoop.invokeLast(this, method) ;
    return this ;
  },
  
  /**
    The properties named in this array will be concatenated in subclasses
    instead of replaced.  This allows you to name special properties that
    should contain any values you specify plus values specified by parents.

    It is used by SproutCore and is available for your use, though you 
    should limit the number of properties you include in this list as it 
    adds a slight overhead to new class and instance creation.

    @property {Array}
  */
  concatenatedProperties: ['concatenatedProperties', 'initMixin', 'destroyMixin']  

} ;

// bootstrap the constructor for SC.Object.
SC.Object.prototype.constructor = SC.Object;

// Add observable to mixin
SC.mixin(SC.Object.prototype, SC.Observable) ;

// ..........................................................
// CLASS NAME SUPPORT
// 

/** @private
  This is a way of performing brute-force introspection.  This searches 
  through all the top-level properties looking for classes.  When it finds
  one, it saves the class path name.
*/
function findClassNames() {

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


      switch(SC.typeOf(value)) {
      case SC.T_CLASS:
        if (!value._object_className) value._object_className = path;
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
  /*if ( SC.browser.isIE ) {
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
  }*/
}

/**  
  Same as the instance method, but lets you check instanceOf without
  having to first check if instanceOf exists as a method.
  
  @param {Object} scObject the object to check instance of
  @param {Class} scClass the class
  @returns {Boolean} if object1 is instance of class
*/
SC.instanceOf = function(scObject, scClass) {
  return !!(scObject && scObject.constructor === scClass) ;  
} ; 

/**
  Same as the instance method, but lets you check kindOf without having to 
  first check if kindOf exists as a method.
  
  @param {Object} scObject object to check kind of
  @param {Class} scClass the class to check
  @returns {Boolean} if object is an instance of class or subclass
*/
SC.kindOf = function(scObject, scClass) {
  if (scObject && !scObject.isClass) scObject = scObject.constructor;
  return !!(scObject && scObject.kindOf(scClass));
};

/** @private
  Returns the name of this class.  If the name is not known, triggers
  a search.  This can be expensive the first time it is called.
  
  This method is used to allow classes to determine their own name.
*/
SC._object_className = function(obj) {
  if (!SC.isReady) return ''; // class names are not available until ready
  if (!obj._object_className) findClassNames() ;
  if (obj._object_className) return obj._object_className ;

  // if no direct classname was found, walk up class chain looking for a 
  // match.
  var ret = obj ;
  while(ret && !ret._object_className) ret = ret.superclass; 
  return (ret && ret._object_className) ? ret._object_className : 'Anonymous';
} ;

