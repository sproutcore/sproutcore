// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

/**
  @namespace Implements Key-Value Observing

  Key-Value Observing is one of the fundamental ways that models, controllers
  and views communicate with each other in a SproutCore application.  Any 
  object that has this module applied to it can be used in KVO-operations.
  
  This module is applied automatically to all objects that inherit from
  SC.Object, which includes most objects bundled with the SproutCore 
  framework.  You will not generally apply this module to classes yourself,
  but you will use the features provided by this module frequently, so it is
  important to understand how to use it.
  
  h2. About Key Value Observing

  Key-Value-Observing (KVO) simply allows one object to observe changes to a 
  property on another object.  This can replace much of the "glue code" that
  you often have to write to make parts of your application work together.
  
  Using KVO is easy.  All you have to do is use the KVO methods to get and set
  properties.  Instead of writing:
  
  {{{
    var aName = contact.firstName ;
    contact.firstName = 'Charles' ;
  }}}
  
  you use:

  {{{
    var aName = contact.get('firstName') ;
    contact.set('firstName', 'Charles') ;
  }}}
  
  get() and set() work just like the normal "dot operators" provided by 
  JavaScript but they provide you with much more power, including not only
  observing but computed properties as well.
  
  INCOMPLETE

*/
SC.Observable = {

  /**  
    Manually add a new binding to an object.  This is the same as doing
    the more familiar propertyBinding: 'property.path' approach.
  */
  bind: function(toKey, fromPropertyPath) {
    
    var r = SC.idt.active ;
    
    var binding ;
    var props = { to: [this, toKey] } ;

    // for strings try to do default relay
    var pathType = $type(fromPropertyPath) ;
    if (pathType == T_STRING || pathType == T_ARRAY) {
      binding = this[toKey + 'BindingDefault'] || SC.Binding.From;
      binding = binding(fromPropertyPath) ;
    } else binding = fromPropertyPath ;

    // check the 'from' value of the relay. if it starts w/
    // '.' || '*' then convert to a local tuple.
    var relayFrom = binding.prototype.from ;
    if ($type(relayFrom) == T_STRING) switch(relayFrom.slice(0,1)) {
      case '*':
      case '.':
        relayFrom = [this,relayFrom.slice(1,relayFrom.length)];
    }        

    if(r) bt = new Date().getTime();

    binding = binding.create(props, { from: relayFrom }) ;
    this.bindings.push(binding) ;

    if (r) SC.idt.b1_t += (new Date().getTime()) - bt ;
    
    return binding ;
  },
  
  /**  
    didChangeFor makes it easy for you to verify that you haven't seen any
    changed values.  You need to use this if your method observes multiple
    properties.  To use this, call it like this:
  
    if (this.didChangeFor('render','height','width')) {
       // DO SOMETHING HERE IF CHANGED.
    }
  */  
  didChangeFor: function(context) {    
    var keys = $A(arguments) ;
    context = keys.shift() ;
    
    var ret = false ;
    if (!this._didChangeCache) this._didChangeCache = {} ;
    if (!this._didChangeRevisionCache) this._didChangeRevisionCache = {};
    
    var seen = this._didChangeCache[context] || {} ;
    var seenRevisions = this._didChangeRevisionCache[context] || {} ;
    var loc = keys.length ;
    var rev = this._kvo().revision ;
    
    while(--loc >= 0) {
      var key = keys[loc] ;
      if (seenRevisions[key] != rev) {
        var val = this.get(key) ;
        if (seen[key] !== val) ret = true ;
        seen[key] = val ;
      }
      seenRevisions[key] = rev ;
    }
    
    this._didChangeCache[context] = seen ;
    this._didChangeRevisionCache[context] = seenRevisions ;
    return ret ;
  },

  // ..........................................
  // PROPERTIES
  // 
  // Use these methods to get/set properties.  This will handle observing
  // notifications as well as allowing you to define functions that can be 
  // used as properties.

  /**  
    Use this to get a property value instead of obj.key.
  */
  get: function(key) {
    var ret = this[key] ;
    if (ret === undefined) {
      return this.unknownProperty(key) ;
    } else if (ret && (ret instanceof Function) && ret.isProperty) {
      return ret.call(this,key) ;
    } else return ret ;
  },

  /**  
    use this to set a property value instead of obj.key = value.
  */
  set: function(key, value) {
    var func = this[key] ;
    var ret = value ;

    this.propertyWillChange(key) ;

    // set the value.
    if (func && (func instanceof Function) && (func.isProperty)) {
      ret = func.call(this,key,value) ;
    } else if (func === undefined) {
      ret = this.unknownProperty(key,value) ;
    } else ret = this[key] = value ;

    // post out notifications.
    this.propertyDidChange(key, ret) ;
    return ret ;
  },  

  /**
    sets the property only if the passed value is different from the
    current value.  Depending on how expensive a get() is on this property,
    this may be more efficient.
  */
  setIfChanged: function(key, value) {
    return (this.get(key) != value) ? this.set(key, value) : value ;
  },
  
  /**  
    use this to automatically navigate a property path.
  */
  getPath: function(path) {
    var tuple = SC.Object.tupleForPropertyPath(path, this) ;
    if (tuple[0] == null) return null ;
    return tuple[0].get(tuple[1]) ;
  },
  
  setPath: function(path, value) {
    var tuple = SC.Object.tupleForPropertyPath(path, this) ;
    if (tuple[0] == null) return null ;
    return tuple[0].set(tuple[1], value) ;
  },

  
  /** 
    Convenience method to get an array of properties.
    
    Pass in multiple property keys or an array of property keys.  This
    method uses getPath() so you can also pass key paths.

    @returns {Array} Values of property keys.
  */
  getEach: function() {
    var keys = $A(arguments).flatten() ;
    var ret = [];
    for(var idx=0; idx<keys.length;idx++) {
      ret[ret.length] = this.getPath(keys[idx]);
    }
    return ret ;
  },
  
  
  /**  
    Increments the value of a property.
  */
  incrementProperty: function(key) { 
    return this.set(key,(this.get(key) || 0)+1); 
  },

  /**  
    decrements a property
  */
  decrementProperty: function(key) {
    return this.set(key,(this.get(key) || 0) - 1 ) ;
  },

  /**  
    inverts a property.  Property should be a bool.
  */
  toggleProperty: function(key,value,alt) { 
    if (value === undefined) value = true ;
    if (alt == undefined) alt = false ;
    value = (this.get(key) == value) ? alt : value ;
    this.set(key,value);
  },

  /**  
  This is a generic property handler.  If you define it, it will be called
  when the named property is not yet set in the object.  The default does
  nothing.
  */
  unknownProperty: function(key,value) {
    if (!(value === undefined)) { this[key] = value; }
    return value ;
  },

  /**  
    Override to receive generic observation notices.
  */
  propertyObserver: function(observer,target,key,value) {},

  /**  
    You can wrap property changes with these methods to cause notifications
    to be delivered only after groups are closed.
  */
  beginPropertyChanges: function() {
    this._kvo().changes++ ;
  },

  endPropertyChanges: function() {
    var kvo = this._kvo() ;  kvo.changes--;
    if (kvo.changes <= 0) this._notifyPropertyObservers() ;
  },

  /**  
    Notify the observer system that a property is about to change.

    Sometimes you need to change a value directly or indirectly without actually
    calling get() or set() on it.  In this case, you can use this method and 
    propertyDidChange() instead.  Calling these two methods together will notify all
    observers that the property has potentially changed value.
    
    Note that you must always call propertyWillChange and propertyDidChange as a pair.
    If you do not, it may get the property change groups out of order and cause
    notifications to be delivered more often than you would like.
    
    @param key {String} The property key that is about to change.
  */
  propertyWillChange: function(key) {
    this._kvo().changes++ ;
  },

  /**  
    Notify the observer system that a property has just changed.

    Sometimes you need to change a value directly or indirectly without actually
    calling get() or set() on it.  In this case, you can use this method and 
    propertyWillChange() instead.  Calling these two methods together will notify all
    observers that the property has potentially changed value.
    
    Note that you must always call propertyWillChange and propertyDidChange as a pair.
    If you do not, it may get the property change groups out of order and cause
    notifications to be delivered more often than you would like.
    
    @param key {String} The property key that has just changed.
    @param value {Object} The new value of the key.  May be null.
  */
  propertyDidChange: function(key,value) {
    this._kvo().changed[key] = value ;
    var kvo = this._kvo() ;  kvo.changes--; kvo.revision++ ;
    if (kvo.changes <= 0) this._notifyPropertyObservers() ;
  },

  /**
    Convenience method to call propertyWillChange/propertyDidChange.
    
    Sometimes you need to notify observers that a property has changed value without
    actually changing this value.  In those cases, you can use this method as a 
    convenience instead of calling propertyWillChange() and propertyDidChange().
    
    @param key {String} The property key that has just changed.
    @param value {Object} The new value of the key.  May be null.
    @returns {void}
  */
  notifyPropertyChange: function(key, value) {
    this.propertyWillChange(key) ;
    this.propertyDidChange(key, value) ;
  },
  
  /**  
    This may be a simpler way to notify of changes if you are making a major
    update or don't know exactly which properties have changed.  This ignores
    property gorups.
  */
  allPropertiesDidChange: function() {
    this._notifyPropertyObservers(true) ;
  },

  /**  
    Add an observer
  */
  addObserver: function(key,func) {
    var kvo = this._kvo() ;

    // if the key contains a '.', then create a chained observer.
    key = key.toString() ;
    var parts = key.split('.') ;
    if (parts.length > 1) {
      var co = SC._ChainObserver.createChain(this,parts,func) ;
      co.masterFunc = func ;
      var chainObservers = kvo.chainObservers[key] || [] ;
      chainObservers.push(co) ;
      kvo.chainObservers[key] = chainObservers ;

    // otherwise, bind as a normal property
    } else {      
      var observers = kvo.observers[key] = (kvo.observers[key] || []) ;
      var found = false; var loc = observers.length;
      while(!found && --loc >= 0) found = (observers[loc] == func) ;
      if (!found) observers.push(func) ;
    }

  },

  addProbe: function(key) { this.addObserver(key,logChange); },
  removeProbe: function(key) { this.removeObserver(key,logChange); },

  /**
    Logs the named properties to the console.
    
    @param propertyNames one or more property names
  */
  logProperty: function() {
    var props = $A(arguments) ;
    for(var idx=0;idx<props.length; idx++) {
      var prop = props[idx] ;
      console.log('%@:%@: '.fmt(this._guid, prop), this.get(prop)) ;
    }
  },
  
  /**  
    This method will listen for the observed value to change one time and 
    then will remove itself.  You can also set an optional timeout that
    will cause the function to be triggered (and the observer removed) after
    a set amount of time even if the value never changes.  The function
    can expect an extra parameter, 'didTimeout', set to true.
  
    The returned value is the function actually set as the observer. You
    can manually remove this observer by calling the cancel() method on it.
  */
  observeOnce: function(key, func, timeout) {
    var timeoutObject = null ;
    var target = this ;
    var handler = function(theTarget,theKey,theValue,didTimeout) {
      func(theTarget,theKey,theValue,didTimeout) ;
      target.removeObserver(key,handler) ;
      if (timeoutObject) { clearTimeout(timeoutObject); }
    } ;

    target.addObserver(key,handler) ;
    if (timeout) timeoutObject = setTimeout(function() {
      handler(target,key,target.get(key),true) ;
    }, timeout) ;

    handler.cancel = function() { target.removeObserver(key,handler); } ;
    return handler ;
  },

  removeObserver: function(key,func) {
    var kvo = this._kvo() ;

    // if the key contains a '.', this is a chained observer.
    key = key.toString() ;
    var parts = key.split('.') ;
    if (parts.length > 1) {
      var chainObservers = kvo.chainObserver[key] || [] ;
      var newObservers = [] ;
      chainObservers.each(function(co) {
        if (co.masterFunc != func) newObservers.push(co) ;
      }) ;
      kvo.chainObservers[key] = newObservers ;

    // otherwise, just like a normal observer.
    } else {
      var observers = kvo.observers[key] || [] ;
      observers = observers.without(func) ;
      kvo.observers[key] = observers ;
    }
  },

  /**
    Use this to indicate that one key changes if other keys it depends on 
    change.
  */  
  registerDependentKey: function(key) {
    var keys = $A(arguments) ;
    var dependent = keys.shift() ;
    var kvo = this._kvo() ;
    for(var loc=0;loc<keys.length;loc++) {
    	var key = keys[loc];
    	if (key instanceof Array) {
    		key.push(dependent) ;
    		this.registerDependentKey.apply(this,key) ;
    	} else {
				var dependents = kvo.dependents[key] || [] ;
				dependents.push(dependent) ;
				kvo.dependents[key] = dependents ;
    	}
    }
  },

  // INTERNAL PROPERTY SUPPORT

  // returns the kvo object.
  _kvo: function() {
    if (!this._kvod) this._kvod = { 
      changes: 0, changed: {}, observers: {}, dependents: {},
      chainObservers: {}, revision: 0
    } ;
    return this._kvod ;
  },

  propertyRevision: 1,
  
  // this is invoked when the properties changed.
  _notifyPropertyObservers: function(allObservers) {
    // locals
    var key ; var observers ; var keys = [] ;
    var loc; var oloc ; var value ;
    var kvo = this._kvo() ;

    SC.Observers.flush() ; // hookup as many observers as possible.

    // increment revision
    this.propertyRevision++;
    
    // find the keys to notify on.
    var keySource = (allObservers) ? kvo.observers : kvo.changed ;
    var allKeys = {} ;
    
    // This private function is used to recursively discover all 
    // dependent keys.
    var _addDependentKeys = function(key) {
      if (allKeys[key] !== undefined) return ;
      allKeys[key] = key ;

      if (allObservers) return ;
      var dependents = kvo.dependents[key] ;
      if (dependents && dependents.length > 0) {
        var loc = dependents.length ;
        while(--loc >= 0) {
          var depKey = dependents[loc] ;
          _addDependentKeys(depKey) ;
        }
      }
    } ;

    // loop throught keys to notify.  find all dependent keys as well.
    // note that this loops recursively.
    for(key in keySource) { 
      if (!keySource.hasOwnProperty(key)) continue ;
      _addDependentKeys(key) ;
    }

    // Convert the found keys into an array
    for(key in allKeys) {
      if (!allKeys.hasOwnProperty(key)) continue ;
      keys.push(key) ;
    }
    var starObservers = kvo.observers['*'] ;

    // clear out changed to avoid recursion.
    var changed = kvo.changed ; kvo.changed = {} ;

    // notify all observers.
    var target = this ; 
    loc = keys.length ;
    
    var notifiedKeys = {} ; // avoid duplicates.
    while(--loc >= 0) {
      key = keys[loc] ; observers = kvo.observers[key] ;
      if (!notifiedKeys[key]) {
        notifiedKeys[key] = key ;
        value = (allObservers || (!changed[key])) ? this.get(key) : changed[key];

        if (starObservers) {
          observers = (observers) ? observers.concat(starObservers) : starObservers ;  
        }

        if (observers) {
          oloc = observers.length ;
          var args = [target, key, value, this.propertyRevision] ;
          while(--oloc >= 0) {
            var observer = observers[oloc] ;
            SC.NotificationQueue.add(null, observer, args) ;
          } // while(oloc)
        } // if (observers) 

        // notify self.
        if (this.propertyObserver != SC.Object.prototype.propertyObserver) {
          SC.NotificationQueue.add(this, this.propertyObserver,
            [null, target, key, value, this.propertyRevision]) ;
        }
      }

    } // while(--loc)

    SC.NotificationQueue.flush() ; 
  }
    
} ;

// ........................................................................
// FUNCTION ENHANCEMENTS
//
// Enhance function.
Object.extend(Function.prototype,{
  
  // Declare a function as a property.  This makes it something that can be
  // accessed via get/set.
  property: function() {
    this.dependentKeys = $A(arguments) ; 
    this.isProperty = true; return this; 
  },
  
  // Declare that a function should observe an object at the named path.  Note
  // that the path is used only to construct the observation one time.
  observes: function(propertyPaths) { 
    this.propertyPaths = $A(arguments); 
    return this;
  },
  
  typeConverter: function() {
    this.isTypeConverter = true; return this ;
  }
  
}) ;

// ........................................................................
// OBSERVER QUEUE
//
// This queue is used to hold observers when the object you tried to observe
// does not exist yet.  This queue is flushed just before any property 
// notification is sent.
SC.Observers = {
  queue: {},
  
  addObserver: function(propertyPath, func) {
    // try to get the tuple for this.
    if (typeof(propertyPath) == "string") {
      var tuple = SC.Object.tupleForPropertyPath(propertyPath) ;
    } else {
      var tuple = propertyPath; 
    }
    
    if (tuple) {
      tuple[0].addObserver(tuple[1],func) ;
    } else {
      var ary = this.queue[propertyPath] || [] ;
      ary.push(func) ;
      this.queue[propertyPath] = ary ;
    }
  },
  
  removeObserver: function(propertyPath, func) {
    var tuple = SC.Object.tupleForPropertyPath(propertyPath) ;
    if (tuple) {
      tuple[0].removeObserver(tuple[1],func) ;
    }
    
    var ary = this.queue[propertyPath] ;
    if (ary) {
      ary = ary.without(func) ;
      this.queue[propertyPath] = ary ;
    }
  },
  
  flush: function() {
    var newQueue = {} ;
    for(var path in this.queue) {
      var funcs = this.queue[path] ;
      var tuple = SC.Object.tupleForPropertyPath(path) ;
      if (tuple) {
        var loc = funcs.length ;
        while(--loc >= 0) {
          var func = funcs[loc] ;
          tuple[0].addObserver(tuple[1],func) ;
        }
      } else newQueue[path] = funcs ;
    }
    
    // set queue to remaining items
    this.queue = newQueue ; 
  }
} ;

// ........................................................................
// NOTIFCATION QUEUE
//
// Property notifications are placed into this queue first and then processed
// to keep the stack size down.
SC.NotificationQueue = {
  queue: [],
  maxFlush: 5000, // max time you can spend flushing before we reschedule.
  _flushing: false,
  add: function(target, func, args) { this.queue.push([target, func, args]);},
  flush: function(force) {
    if (this._flushing && !force) return ;
    this._flushing = true ;
    
    var start = new Date().getTime() ;
    var now = start ;
    var n = null ;
    while(((now - start) < this.maxFlush) && (n = this.queue.pop())) { 
      try {
        var t = n[0] || n[1] ;
        n[1].apply(t,n[2]) ;
      }
      catch(e) {
        console.log("Exception while notify("+n[2]+"): " + e) ;
      } // catch  
      now = Date.now() ;
    }
    this._flushing = false ;
    
    if (this.queue.length > 0) { 
      setTimeout(this._reflush,1); 
    }
  },
  
  _reflush: function() { SC.NotificationQueue.flush(); }
} ;
