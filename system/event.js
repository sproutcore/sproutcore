// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core');

/** 
  The event module provides a simple cross-platform library for capturing and
  delivering events on DOM elements and other objects.  While this library
  is based on code from both jQuery and Prototype.js, it includes a number of
  additional features including support for handler objects and event 
  delegation.

  @namespace
*/
SC.event = {

  // the code below was borrowed from jQuery, Dean Edwards, and Prototype.js
  
  /**
    Bind an event to an element.

    This method will cause the passed handler to be executed whenever a
    relevant event occurs on the named element.  The SproutCore version of
    this method supports a wide variety of handler types, depending on the
    paramters that you pass:
    
    h2. Simple Function Handlers
    
      SC.event.add(anElement, "click", myClickHandler) ;
      
    The most basic type of handler you can pass is a function.  This function
    will be executed everytime an event of the type you specify occurs on the
    named element.  You can optionally pass an additional context object which
    will be included on the event in the event.data property.
    
    When your handler function is called the, the function's "this" property
    will point to the element the event occurred on.
    
    The click handler for this method must have a method signature like:
    
      function(event) { return YES|NO; }
      
    h2. Method Invocations
    
      SC.event.add(anElement, "click", myObject, myObject.aMethod) ;
      
    Optionally you can specify a target object and a method on the object to 
    be invoked when the event occurs.  This will invoke the method function
    with the target object you pass as "this".  The method should have a 
    signature like:
    
      function(event, targetElement) { return YES|NO; }
      
    Like function handlers, you can pass an additional context data paramater
    that will be included on the event in the event.data property.
      
    h2. SC.Responder Object
    
      SC.event.add(anElement, responderObject) ;
      
    Finally, instead of adding events for individual event handlers, you can
    pass an object that implements the SC.Responder mixin (including one or
    more of the optional methods documented in the SC.Responder module 
    description.)
    
    This will cause the responder to be invoked whenever an event occurs on
    the target element and you have implemented a method to respond to it.
    
    SC.Responder is a much faster way to bind to and listen for events because
    it does not require you to register for each individual event on the 
    element.  In fact, most of the time registering a responder object will
    involve little more than storing the responder in a data cache.
    
    h2. Handler Return Values
    
    Both handler functions and method invocations are expected to return a 
    boolean value to indicate whether you handled the event or not.  If your
    method returns NO, then the event will continue to bubble up the DOM.
    
    Responder objects are implemented differently since responders implement
    their own responder chain that may not correspond directly to the DOM
    hierarchy of the DOM.  Events typically will bubble up the DOM until a 
    responder is found.  Once that responder is found, it will be asked to 
    handle the event and then it will not continue to bubble.

    h2. Event Delegation
    
    The SproutCore event's system implements something called event
    delegation that will not usually impact how you write your code, but may
    impact how SproutCore event's interact with handlers you register using
    another library.
    
    Event delegation means that instead of registering event listeners with
    the browser on every element you add a handler for, SproutCore will often
    register an event listener on the root document element only.  This will
    allow it to receive notification of all events on the page.  SproutCore
    will then route the event to the proper handler itself.
    
    Event delegation is much faster than typical event handling because it
    means adding a new event listener has a much lower overhead.  It also 
    means that SproutCore can provide a gauranteed order of execution for 
    handlers and responders.
    
    The impact of event delegation, however, is that if you also use a 3rd
    party library to add event listeners, those event listeners may be called
    and will even bubble up the DOM chain before any listeners registered 
    through SproutCore are called.
    
    The best way to avoid this problem is to stick to using the SproutCore
    event listener library only.
    
    @param elem {Element} a DOM element, window, or document object
    @param types {String} the type or types (as array or separated by spaces) of events to respond to.  You can optionally pass a responder object instead.
    @param target {Object} The target object for a method call.  Or a function.
    @param method {Object} optional name of method
    @param data {Object} optional data to pass to the handler as event.data
    @returns {SC.event}
  */
  add: function(elem, types, target, method, data) {
    
    // cannot register events on text nodes, etc.
    if ( elem.nodeType == 3 || elem.nodeType == 8 ) return SC.event;

    // NORMALIZE PARAMETERS
    // For whatever reason, IE has trouble passing the window object
    // around, causing it to be cloned in the process
    if (SC.browser.msie && elem.setInterval) elem = window;

    // types can be a string or array.  Normalize to array
    if (SC.typeOf(types) === SC.T_STRING) types = types.split(/\s+/) ;

    // if target is a function, treat it as the method, with optional data
    var type = SC.typeOf(target) ;
    if (type === SC.T_FUNCTION) {
      data = method ; method = target; target = null ;
      
    // handle case where passed method is a key on the target.
    } else if (target && SC.typeOf(method) === SC.T_STRING) {
      method = target[method] ;
    }

    // PROCESS EVENT
    // event cache
    var events = SC.data(elem, "events") || SC.data(elem, "events", {}) ;

    // Build handler array to save.  The array has the format:
    // target, method, data, event subtype
    var handler = [target, method, data, null] ;
    
    // Now add event handlers for each type
    var type, currentHandler, handlers ;
    var len = types.length, idx = len ;
    while(--idx >= 0) {
      type = types[idx] ;

      // use the shared handler array unless we have a namespaced handler
      currentHandler = handler ;
      if (type.indexOf('.') >= 0) {
        var parts = type.split(".");
        type = parts[0];
        if (max > 1) currentHandler = handler.slice() ;
        currentHandler[3] = parts[1] ; // save subtype
      }

      // Get the event handler queue.  If the queue does not exist, also
      // add an event listener to the element.
      if (!(handlers = events[type])) {
        handlers = events[type] = {};
        this._addEventListener(elem, type) ;
      }
      
      // save the handler array, based on the method's hash.
      handlers[SC.hashFor(method)] = handler;

      // Keep track of which events have been used, for global triggering
      SC.event._global[type] = YES;
    }

    // Nullify elem to prevent memory leaks in IE
    elem = handler = null ;
    return this ;
  },

  /**
    Removes a handler for a specific type of event or events on an element.
    
    You must pass in the same handler function to this method as you passed
    into the SC.event.add() method.  You can also pass one or more types as 
    an array or string separated by spaces.
    
    If you omit the handler, all handlers for the type will be removed. If you
    omit both the handler and the types, all handlers for the element will be
    removed.
    
    @param elem {Element} a DOM element, window, or document object
    @param types {String} the type or types (as array or separated by spaces) of events to respond to.  You can optionally pass a responder object instead.
    @param target {Object} The target object for a method call.  Or a function.
    @param method {Object} optional name of method
    @returns {SC.event}
  */
  remove: function(elem, types, target, method) {
    
    // don't do events on text and comment nodes
    if ( elem.nodeType == 3 || elem.nodeType == 8 ) return SC.event;

    // For whatever reason, IE has trouble passing the window object
    // around, causing it to be cloned in the process
    if (SC.browser.msie && elem.setInterval) elem = window;

    var events = SC.data(elem, "events"), ret, index;
    if (!events) return this ; // nothing to do if no events are registered

    // special case
    // if types is undefined or begins with a ., then unregister all events. 
    var type = SC.typeOf(types) ;
    if (types == undefined || ((type === SC.T_STRING) && (type.charAt(0) === '.'))) {
      for(var type in events) this.remove(elem, type + (types || "")) ;
      return this; // done!
    }
    
    // NORMALIZE PARAMETERS

    // types can be a string, array, or event.  Normalize to array
    if (type === SC.T_STRING) {
      types = types.split(/\s+/) ;
      
    // handle event case
    } else if (types && types.type) {
      types = types.type; target = null; method = types.handler ;
    }
    
    // if target is a function, treat it as the method, with optional data
    if (SC.typeOf(target) === SC.T_FUNCTION) {
      method = target; target = null ;
      
    // handle case where passed method is a key on the target.
    } else if (target && SC.typeOf(method) === T_STRING) {
      method = target[method] ;
    }

    // PROCESS EVENT
    var type, handlerType, handlers, handler, key ;
    var len = types.length, idx = len ;
    while(--idx >= 0) {
      var type = types[idx] ;

      // get namespaced event handler
      var handlerType ;
      if (type.indexOf('.') >= 0) {
        var parts = type.split(".");
        type = parts[0];
        handlerType = parts[1];
      } else handlerType = null ;

      if (handlers = events[type]) {
        
        // if a method was provided, look for that method to remove it
        if (method) {
          delete events[SC.guidFor(method)];
          
        // otherwise, remove all handlers for the given type
        } else {
          for(key in handlers) {
            handler = handlers[handlerKey] ;
            if (!handlerType || !handler || (handler.type === handlerType)) {
              delete handlers[handlerKey] ;
            }
          }
        }
        
        // remove the generic listener and handler hash if no more handlers
        // are registered
        key = null ;
        for(key in handlers) break ;
        if (!key) {
          this._removeEventListener(elem, type) ;
          delete events[type] ;
        } // if (!key)
      } // if (handlers = events[type])
    } // while

    // if events are no longer used on this element, then make sure to clean
    // up the generic listener as well.
    key = null ;
    for(key in events) break;
    if(!key) {
      SC.removeData(elem, "events") ;
      delete this._elements[SC.guidFor(elem)]; // important to avoid leaks
    }
    
    elem = null ; // avoid memory leaks
    return this ;
  },

  /**
    Trigger an event execution immediately.  You can use this method to 
    simulate arbitrary events on arbitary elements.
    
    You can trigger all events by omitting the elem parameter.
    
    @param type {String} the event type
    @param data {Object} custom data
    @param elem {Element} the target element
    @param donative ??
    @param extra ??
    @returns {Boolean} Result of trigger
  */
  trigger: function(type, data, elem, donative, extra) {

    // Clone the incoming data, if any
    data = SC.$A(data).slice();

    var exclusive = type.indexOf("!") >= 0 ;
    if (exclusive) type = type.slice(0,-1) ;

    // Handle a global trigger.  Trigger all event handlers for the
    // specified type.
    if (!elem) {
      
      // Only trigger if we've ever bound an event for it
      if (this.global[type]) {
        throw "Not Yet Implemented" ;
        //jQuery("*").add([window, document]).trigger(type, data);
      }

    // Handle triggering a single element
    } else {
      
      // don't do events on text and comment nodes
      if ( elem.nodeType == 3 || elem.nodeType == 8 ) return undefined;

      var val, ret, fn = SC.typeOf(elem[type] || null) === T_FUNCTION,
      needsEvent = !data[0] || !data[0].preventDefault;

      // If event is not provided in parameter array, add a fake one.
      if (needsEvent) data.unshift({
        type: type,
        target: elem,
        preventDefault: function(){},
        stopPropagation: function(){},
        timeStamp: Date.now(),
        normalized: YES
      });

      // Enforce the right trigger type
      data[0].type = type;
      if ( exclusive ) data[0].exclusive = YES;

      // Trigger the event
      val = SC.event.handle.apply(this, data) ;

      // Handle triggering native .onfoo handlers (and on links since we don't call .click() for links)
      // if ( (!fn || (SC.nodeName(elem, 'a') && type == "click")) && elem["on"+type] && elem["on"+type].apply( elem, data ) === NO ) {
      //   val = NO;
      // }

      // Extra functions don't get the custom event object
      if ( event ) data.shift();

      // Handle triggering of extra function
      if (extra && (SC.typeOf(extra) === SC.T_FUNCTION)) {
        // call the extra function and tack the current return value on the 
        // end for possible inspection
        ret = extra.apply( elem, (val == null) ? data : data.concat( val ) );

        // if anything is returned, give it precedence and have it overwrite 
        // the previous value
        if (ret !== undefined) val = ret;
      }

      // Trigger the native events (except for clicks on links)
      // if ( fn && donative !== NO && val !== NO && !(SC.nodeName(elem, 'a') && type == "click") ) {
      //   this.triggered = YES;
      //   try {
      //     elem[ type ]();
      //   // prevent IE from throwing an error for some hidden elements
      //   } catch (e) {}
      // }
      // 
      // this.triggered = NO;
    }

    return val;
  },

  /**
    This method will handle the passed event, finding any registered listeners
    and executing them.
  */
  handle: function(event) {

    // ignore events triggered after window is unloaded or if double-called
    // from within a trigger.
    if ((typeof SC === "undefined") || SC.event.triggered) return YES ;
    
    // returned undefined or NO
    var val, ret, namespace, all, handlers;

    // normalize event across browsers.  The new event will actually wrap the
    // real event with a normalized API.
    event = arguments[0] = SC.event._normalizeEvent(event || window.event) ;

    // handle namespace if needed
    namespace = event.type ;
    if (namespace.indexOf('.') >= 0) {
      namespace = event.type.split(".");
      event.type = namespace[0];
      namespace = namespace[1];
    } else namespace = null ;
    
    // Cache this now, all = YES means, any handler
    all = !namespace && !event.exclusive;

    // get the handlers for this event type
    handlers = (SC.data(this, "events") || {})[event.type];
    if (handlers) return NO ; // nothing to do

    for (var key in handlers ) {
      var handler = handlers[key];
      var method = handler[1] ;

      // Filter the functions by class
      if ( all || handler[3] === namespace ) {

        // Pass in a reference to the handler function itself
        // So that we can later remove it
        event.handler = method;
        event.data = handler[2];

        var target = handler[0] || this ;
        ret = method.apply( target, arguments );
        if (val !== NO) val = ret;

        // if method returned NO, do not continue.  Stop propogation and
        // return default.  Note that we test explicitly for NO since 
        // if the handler returns no specific value, we do not want to stop.
        if ( ret === NO ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }

    return val;
  },

  /**
    This method is called just before the window unloads to unhook all 
    registered events.
  */
  unload: function() {
    var key, elements = this._elements ;
    for(key in elements) this.remove(elements[key]) ;
    
    // just in case some book-keeping was screwed up.  avoid memory leaks
    for(key in elements) delete elements[key] ;
    delete this._elements ; 
  },
  
  /**
    This hash contains handlers for special or custom events.  You can add
    your own handlers for custom events here by simply naming the event and
    including a hash with the following properties:
    
     - setup: this function should setup the handler or return NO
     - teardown: this function should remove the event listener
     
  */
  special: {
    
    ready: {
      setup: function() {
        // Make sure the ready event is setup
        SC._bindReady() ;
        return;
      },

      teardown: function() { return; }

    },

    /** @private
        Implement support for mouseenter on browsers other than IE */
    mouseenter: {
      setup: function() {
        if ( SC.browser.msie ) return NO;
        SC.event.add(this, 'mouseover', SC.event.special.mouseover.handler);
        return YES;
      },

      teardown: function() {
        if ( jQuery.browser.msie ) return NO;
        SC.event.remove(this, 'mouseover', SC.event.special.mouseover.handler);
        return YES;
      },

      handler: function(event) {
        // If we actually just moused on to a sub-element, ignore it
        if ( SC.event._withinElement(event, this) ) return YES;
        // Execute the right handlers by setting the event type to mouseenter
        event.type = "mouseenter";
        return SC.event.handle.apply(this, arguments);
      }
    },

    /** @private
        Implement support for mouseleave on browsers other than IE */
    mouseleave: {
      setup: function() {
        if ( SC.browser.msie ) return NO;
        SC.event.add(this, "mouseout", SC.event.special.mouseleave.handler);
        return YES;
      },

      teardown: function() {
        if ( SC.browser.msie ) return NO;
        SC.event.remove(this, "mouseout", SC.event.special.mouseleave.handler);
        return YES;
      },

      handler: function(event) {
        // If we actually just moused on to a sub-element, ignore it
        if ( SC.event._withinElement(event, this) ) return YES;
        // Execute the right handlers by setting the event type to mouseleave
        event.type = "mouseleave";
        return SC.event.handle.apply(this, arguments);
      }
    }
  },
  
  _withinElement: function(event, elem) {
    // Check if mouse(over|out) are still within the same parent element
    var parent = event.relatedTarget;
    
    // Traverse up the tree
    while ( parent && parent != elem ) {
      try { parent = parent.parentNode; } catch(error) { parent = elem; }
    }

    // Return YES if we actually just moused on to a sub-element
    return parent === elem;
  },
  
  /** @private
    Adds the primary event listener for the named type on the element.
    
    If the event type has a special handler defined in SC.event.special, 
    then that handler will be used.  Otherwise the normal browser method will
    be used.
  */
  _addEventListener: function(elem, type) {
    var listener, special = this.special ;

    // Check for a special event handler
    // Only use addEventListener/attachEvent if the special
    // events handler returns NO
    if ( !special[type] || special[type].setup.call(elem)===NO) {
      
      // Save element in cache.  This must be removed later to avoid 
      // memory leaks.
      var guid = SC.guidFor(elem) ;
      this._elements[guid] = elem;
      
      var listener = SC.data(elem, "listener") || SC.data(elem, "listener", 
       function() {
         return SC.event.handle.apply(SC.event._elements[guid], arguments); 
      }) ;
      
      // Bind the global event handler to the element
      if (elem.addEventListener) {
        elem.addEventListener(type, listener, NO);
      } else if (elem.attachEvent) {
        elem.attachEvent("on" + type, listener);
      }
    }
    
    elem = special = listener = null ; // avoid memory leak
  },

  /** @private
    Removes the primary event listener for the named type on the element.
    
    If the event type has a special handler defined in SC.event.special, 
    then that handler will be used.  Otherwise the normal browser method will
    be used.
  */
  _removeEventListener: function(elem, type) {
    var listener, special = SC.event.special[type] ;
    if (!special || (special.teardown.call(elem)===NO)) {
      listener = SC.data(elem, "listener") ;
      if (listener) if (elem.removeEventListener) {
        elem.removeEventListener(type, listener, NO);
      } else if (elem.detachEvent) {
        elem.detachEvent("on" + type, listener);
      }
    }
    
    elem = special = listener = null ;
  },

  _elements: {},
  
  /** @private properties to copy on the event */
  _props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target timeStamp toElement type view wheelDelta which".split(" "),

  // Custom event prototype
  _eventPrototype: {

    preventDefault: function() {
      var evt = this.originalEvent ;
      if (evt.preventDefault) evt.preventDefault() ;
      evt.returnValue = NO ; // IE
    },

    // implement stopPropogation in a cross platform way
    stopPropagation: function() {
      var evt = this.originalEvent ;
      if (evt.stopPropogation) evt.stopPropagation() ;
      evt.cancelBubble = YES ; // IE
    },
    
    normalized: YES
  },
  
  // implement preventDefault() in a cross platform way
  
  /** @private Take an incoming event and convert it to a normalized event. */
  _normalizeEvent: function(event) {
    if (event.normalized) return event ;

    // store a copy of the original event object
    // and "clone" to set read-only properties
    var originalEvent = event;
    event = SC.beget(this._eventPrototype) ;
    event.originalEvent = originalEvent ;

    var props = SC.event._props, len = props.length, idx = len ;
    while(--idx >= 0) {
      var key = props[idx] ;
      event[key] = originalEvent[key] ;
    }

    // Fix timeStamp
    event.timeStamp = event.timeStamp || Date.now();

    // Fix target property, if necessary
    // Fixes #1925 where srcElement might not be defined either
    if (!event.target) event.target = event.srcElement || document; 

    // check if target is a textnode (safari)
    if ( event.target.nodeType == 3 ) {
      event.target = event.target.parentNode;
    }

    // Add relatedTarget, if necessary
    if (!event.relatedTarget && event.fromElement) {
      event.relatedTarget = (event.fromElement === event.target) ? event.toElement : event.fromElement;
    }

    // Calculate pageX/Y if missing and clientX/Y available
    if ( event.pageX == null && event.clientX != null ) {
      var doc = document.documentElement, body = document.body;
      event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
      event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
    }

    // Add which for key events
    if (!event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode)) {
      event.which = event.charCode || event.keyCode;
    }

    // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
    if (!event.metaKey && event.ctrlKey) event.metaKey = event.ctrlKey;

    // Add which for click: 1 == left; 2 == middle; 3 == right
    // Note: button is not normalized, so don't use it
    if (!event.which && event.button) {
      event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
    }

    return event;
  },
  
  _global: {}
  
};

// Register unload handler to eliminate any registered handlers
// This avoids leaks in IE and issues with mouseout or other handlers on 
// other browsers.
SC.event.add(window, 'unload', SC.event, SC.event.unload) ;
