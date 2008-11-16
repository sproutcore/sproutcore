// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/system/ready');
require('foundation/application/input_manager');

/** Set to NO to leave the backspace key under the control of the browser.*/
SC.CAPTURE_BACKSPACE_KEY = NO ;

/** @class

  The RootResponder captures events coming from a web browser and routes them to the correct view in the view hierarchy.  One RootResponder instance  exists for each DOMWindow/DOMDocument you deal with.  (Only one unless you are trying to open multiple windows.)
  
  Usually you do not work with a RootResponder directly.  Instead you will work with Pane objects,w hich register themselves with the RootResponder as needed to receive events.

  h1. RootResponder and Platforms
  
  RootResponder is implemented differently on the desktop and mobile platforms using a technique called a "class cluster".  That is, although you get a RootResponder instance at some point, you will likely be working with a subclass of RootResponder that implements functionality unique to that platform.
  
  h1. Event Types 
    
  RootResponders can route four types of events:
  
  - Direct events.  Such as mouse and touch events.  These are routed to the nearest view managing the target DOM elment.
  - Keyboard events.  These are sent to the keyPane, which will send it 
    to the current keyView.
  - resize. This event is sent to all panes.
  - shortcuts.  Shortcuts are sent to the focusedPane first, which will go down its view hierarchy.  Then they go to the mainPane, which will go down its view hierarchy.  Then they go to the mainMenu.  Usually any handler that picks this up will then try to do a sendAction().
  - actions.  Actions are sent down the responder chain.  They go to focusedPane -> mainPane.  Each of these will start at the firstResponder and work their way up the chain.
  
  Differences between Mobile + Desktop RootResponder
  
  The Desktop root responder can deal with the following kinds of events:
   mousedown, mouseup, mouseover, mouseout, mousemoved
  
*/
SC.RootResponder = SC.Object.extend({

  // .......................................................
  // MAIN Pane
  //

  /** @property
    The main pane.  This pane receives shortcuts and actions if the focusedPane does not respond to them.  There can be only one main pane.  You can swap main panes by calling makeMainPane() here.
    
    Usually you will not need to edit the main pane directly.  Instead, you should use a MainPane subclass, which will automatically make itself main when you append it to the document.
  */
  mainPane: null,

  /** 
    Swaps the main pane.  If the current main pane is also the key pane, then the new main pane will also be made key view automatically.  In addition to simply updating the mainPane property, this method will also notify the panes themselves that they will lose/gain their mainView status.
    
    Note that this method does not actually change the Pane's place in the document body.  That will be handled by the Pane itself.
    
    @param {SC.Pane} pane
    @returns {SC.RootResponder} receiver
  */
  makeMainPane: function(pane) {
    var currentMain = this.get('mainPane');
    if (currentMain === pane) return this; // nothing to do
    
    this.beginPropertyChanges();

    // change key focus if needed.
    if (this.get('keyPane') === currentMain) this.makeKeyPane(pane);
        
    // change setting
    this.set('mainPane', pane) ;

    // notify panes.  This will allow them to remove themselves.    
    if (currentMain) currentMain.blurMainTo(pane);
    if (pane) pane.focusMainFrom(currentMain) ;
    
    this.endPropertyChanges();
    return this ;
  }, 

  // .......................................................
  // KEY ROOT VIEW
  //

  /** @property
    The current key view.  This view receives keyboard events, shortcuts, and actions.  This view is usually the highest ordered pane or the mainPane.
  */
  keyPane: null,

  /**
    Makes the passed pane the new key pane.  If you pass nil or if the pane does not accept key focus, then key focus will transfer to the mainPane.  This will notify both the old pane and the new root View that key focus has changed.
    
    @param {SC.Pane} pane
    @returns {SC.RootResponder} Receiver
  */
  makeKeyPane: function(pane) {
    if (!pane.get('acceptsKeyFocus')) pane = null ;
    if (!pane) {
      pane = this.get('mainPane') ;
      if (!pane.get('acceptsKeyFocus')) pane = null ;
    }

    // now notify old and new key views of change after edit    
    var currentKey = this.get('keyPane') ;
    if (currentKey !== pane) {
      if (currentKey) currentKey.willBlurKeyTo(pane) ;
      if (pane) pane.willFocusKeyFrom(currentKey);
      this.set('keyPane', pane) ;
      if (pane) pane.didFocusKeyFrom(currentKey);
      if (currentKey) currentKey.didBlurKeyTo(pane);
    }
    return this ;
  },
    
  // .......................................................
  // ROOT VIEW ORDER
  //

  /** @property
    A set of all panes currently managed by the RootResponder.  To put a view under management, just add it to this set.
  */
  panes: null,

  /**
    Called by a pane whenever the pane is added to the document.  This will add the pane to
    the set.
  */
  addPane: function(pane) { this.panes.add(pane); },
  
  /**
    Called by a pane whenever the pane is removed from a document.  This will remove the pane
    from the set.
  */
  removePane: function(pane) { this.panes.remove(pane); },
  
  /** @property
    The current focused view.  This will receive actions sent down the chain.  This only needs to be set for platforms that support multiple, layered panes.
  */
  focusedPane: null,

  // .......................................................
  // ACTIONS
  //
  
  /** @property
    Set this to a delegate object that can respond to actions as they are sent down the responder chain. 
  */
  defaultResponder: null,

  /**
    Route an action message to the appropriate responder
    @param {String} action The action to perform - this is a method name.
    @param {SC.ClassicResponder} target The object to perform the action upon. Set to null to search the Responder chain for a receiver.
    @param {Object} sender The sender of the action
    @returns YES if action was performed, NO otherwise
  */
  sendAction: function( action, target, sender ) {
    var target = this.targetForAction(action, target, sender);
    return target && target.tryToPerform(action, sender) ;
  },
  
  _responderFor: function(target, methodName) {
    if (target) {
      target = target.get('firstResponder') || target.get('defaultResponder') || target ;
      do {
        if (target.respondsTo(methodName)) return target ;
      } while (target = target.get('nextResponder')) ;
    }
    return null ;
  },
  
  /**
    Attempts to determine the initial target for a given action/target/sender 
    tuple.  This is the method used by sendAction() to try to determine the 
    correct target starting point for an action before trickling up the 
    responder chain.
    
    You send actions for user interface events and for menu actions.
    
    This method returns an object if a starting target was found or null if no 
    object could be found that responds to the target action.
    
    @param {Object|String} target or null if no target is specified
    @param {String} method name for target
    @param {Object} sender optional sender
    @returns {Object} target object or null if none found
  */
  targetForAction: function(methodName, target, sender) {

    // no action, no target...
    if (!method || (SC.typeOf(method) != SC.T_STRING)) return null;

    // an explicit target was passed...
    if (target) {
      if (SC.typeOf(target) === SC.T_STRING) {
        target = SC.objectForPropertyPath(target) ;
      }
      return target.respondsTo(action) ? target : null ;
    }

    // ok, no target was passed... try to find one in the responder chain
    var focusedPane = this.get('focusedPane'), keyPane = this.get('keyPane'), mainPane = this.get('mainPane');
    
    if (keyPane) target = this._responderFor(keyPane, methodName);
    if (!target && focusedPane && (focusedPane !== keyPane)) {
      target = this._responderFor(focusedPane, methodName) ;
    }
    if (!target && mainPane && (mainPane !== keyPane) && (mainPane !== focusedPane)) {
      target = this._responderFor(mainPane, methodName) ;
    }

    // last stop, this defaultResponder
    target = this.get('defaultResponder');
    if (target.respondsTo(action)) return target;

    return null;
  },

  /**
    Finds the view that appears to be targeted by the passed event.  This only
    works on events with a valid target property.
    
    @param {SC.Event} evt
    @returns {SC.View} view instance or null
  */
  targetViewForEvent: function(evt) {
    return (evt.target) ? SC.$(evt.target).view()[0] : null ;
  },
  
  /**
    Attempts to send a targeted event.  This is the handler you should use for mouse and touch events.  This will send the event to the target method or it will send it to the firstResponder. Returns YES if the browser should be allowe to handle the event using its normal process, NO otherwise.
    
    @param {String} eventType
    @param {SC.Event} evt
    @param {Object} target
    @returns {Object} object that handled the event or null if not handled
  */
  sendEvent: function(action, evt, target) {
    var handler, pane ;

    SC.runLoop.beginRunLoop();
    
    // special case -- if an explicit target is passed, just try to perform on 
    // it.
    if (target) {
      handler = (target.tryToPerform(action, evt)) ? target : null ;
      
    } else if (pane = this.get('focusedPane') || this.get('mainPane')) {
      
      // try to determine the target.  Go to the keyPane keyView or 
      // defaultResponder.
      if (pane) {
        target = pane.get('firstResponder')||pane.get('defaultResponder')||pane; 
      }

      // walk up responder chain until we find someone who will handle it
      while(!handler && target) {
        handler = (target.tryToPerform(action, evt)) ? target : null;
        target = target.get('nextResponder');
      } ;

      if (!handler && (target = this.get('defaultResponder'))) {
        handler = (target.tryToPerform(action, evt)) ? target : null ;
      }
    }

    SC.runLoop.endRunLoop() ;
    
    return handler;
  },    

  /**
    Attempts to send a key-like event.  The event will be sent to the named 
    target object or the responder will attempt to send to the keyPane's 
    keyView.  Returns YES if the browser should be allowe to handle the event 
    using its normal process, NO otherwise.
    
    @param {String} eventType
    @param {SC.Event} evt
    @param {Object} target
    @returns {Object} the object that handled the event
  */
  sendKeyEvent: function(action, evt, target)
  {
    var handler, pane;

    SC.runLoop.beginRunLoop();
    
    // special case -- if an explicit target is passed, just try to perform on 
    // it.
    if (target) {
      handler = (target.tryToPerform(action, evt)) ? target : null;

    // otherwise, try to find the right target
    } else if (pane = this.get('keyPane')) {
      
      // try to determine the target.  Go to the keyPane keyView or 
      // defaultResponder.
      target = pane.get('keyView') || pane.get('defaultResponder') || pane; 

      // walk up responder chain until we find someone who will handle it
      while(!handler && target) {
        handler = target.tryToPerform(action, evt) ? target : null;
        target = target.get('nextResponder');
      } ;

      // unhandled keyDown event...
      if (!handler && action === 'keyDown') {
        handler = this.attemptKeyEquivalent(evt) ;
      }

      if (!handler && (target = this.get('defaultResponder'))) {
        handled = target.tryToPerform(action, evt) ? target : null;
      }
    }

    SC.runLoop.endRunLoop();
    
    // if we have a keyPane and a keyView but we still did not handle the event, 
    // then return NO to stop the browser from doing its own thing.
    return handler;
  },

  /**
    Invoked on a keyDown event that is not handled by any actual value.  This 
    will get the key equivalent string and then walk down the keyPane, then the 
    focusedPane, then the mainPane, looking for someone to handle it.  Note that 
    this will walk DOWN the view hierarchy, not up it like most.
    
    @returns {Object} Object that handled evet or null
  */ 
  attemptKeyEquivalent: function(evt) {
    var ret = null ;
    
    // keystring is a method name representing the keys pressed (i.e 
    // 'alt_shift_escape')
    var keystring = this.inputManager.codesForEvent(evt)[0];
    
    // inputManager couldn't build a keystring for this key event, nothing to do
    if (!keystring) return NO;
    
    var focusedPane = this.get('focusedPane'), keyPane  = this.get('keyPane'), 
        mainPane = this.get('mainPane'), mainMenu = this.get('mainMenu');
    
    if (keyPane) ret = keyPane.performKeyEquivalent(keystring, evt) ;
    
    if (!ret && focusedPane && (focusedPane !== keyPane)) {
      ret = focusedPane.performKeyEquivalent(keystring, evt) ;
    }
     
    if (!ret && mainPane && (mainPane!==keyPane) && (mainPane!==focusedPane)) {
      ret = mainPane.performKeyEquivalent(keystring, evt);
    }
    
    if (!ret && mainMenu) {
      ret = mainMenu.performKeyEquivalent(keystring, evt);
    }
    
    return ret ;
  },
  
  // .......................................................
  // EVENT LISTENER SETUP
  //

  /**
    Default method to add an event listener for the named event.  If you simply need to add listeners for a type of event, you can use this method as shorthand.  Pass an array of event types to listen for and the element to listen in.  A listener will only be added if a handler is actually installed on the RootResponder of the same name.
    
    @param {Array} keyNames
    @param {Element} target
    @returns {SC.RootResponder} receiver
  */
  listenFor: function(keyNames, target) {
    keyNames.forEach(function(keyName) {
      var method = this[keyName];
      if (method) SC.Event.add(target, keyName, this, method);
    },this);
    target = null;
    return this ;
  },
  
  /** 
    Called when the document is ready to begin handling events.  Setup event listeners in this method that you are interested in observing for your particular platform.  The default method configures listeners for keyboard events only.  Be sure to call sc_super().
    
    @returns {void}
  */
  setup: function() {
    this.listenFor('keydown keyup'.w(), document);

    // handle special case for keypress- you can't use normal listener to block the backspace key on Mozilla
    if (this.keypress) {
      if (SC.CAPTURE_BACKSPACE_KEY && SC.browser.mozilla) {
        var responder = this ;
        document.onkeypress = function(e) { return method.call(responder, SC.Event.normalizeEvent(e)); };
        SC.Event.add(window, 'unload', this, function() { document.onkeypress = null; }); // be sure to cleanup memory leaks
  
      // Otherwise, just add a normal event handler. 
      } else SC.Event.add(document, 'keypress', this, this.keypress);
    }
  },
  
  init: function() {
    sc_super();
    this.panes = SC.Set.create();
    this.inputManager = SC.InputManager.create();
  },
  
  // .......................................................
  // KEYBOARD HANDLING
  //

  _lastModifiers: null,

  /** @private
    Modifier key changes are notified with a keydown event in most browsers.  We turn this into a 
    flagsChanged keyboard event.
  */  
  _handleModifierChanges: function(evt) {
    // if the modifier keys have changed, then notify the first responder.
    var m = this._lastModifiers = this._lastModifiers || { alt: false, ctrl: false, shift: false };

    var changed = false;
    if (evt.altKey != m.alt) { m.alt = evt.altKey; changed=true; }
    if (evt.ctrlKey != m.ctrl) { m.ctrl = evt.ctrlKey; changed=true; }
    if (evt.shiftKey != m.shift) { m.shift = evt.shiftKey; changed=true;}
    evt.modifiers = m; // save on event

    return (changed) ? (this.sendKeyEvent('flagsChanged', evt) ? evt.hasCustomEventHandling : YES) : YES ;
  },

  // util code factored out of keypress and keydown handlers
  _isFunctionOrNonPrintableKey: function(evt) {
    return !!(evt.altKey || evt.ctrlKey || SC.FUNCTION_KEYS[evt.keyCode]);
  },

  _isModifierKey: function(evt) {
    return !!SC.MODIFIER_KEYS[evt.keyCode];
  },

  keydown: function(evt) {
    // Firefox does NOT handle delete here...
    if (SC.browser.mozilla > 0 && (evt.which === 8)) return true ;
    
    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this is only a modifier change
    var ret = this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return ret;
    
    // let normal browser processing do its thing.
    if (this._isFunctionOrNonPrintableKey(evt)) {
      return this.sendKeyEvent('keyDown', evt) ? evt.hasCustomEventHandling:YES;
    }
    return YES; // allow normal processing...
  },
  
  keypress: function(evt) {
    // delete is handled in keydown() for most browsers
    if (SC.browser.mozilla > 0 && (evt.which === 8)) {
      return this.sendKeyEvent('keyDown', evt) ? evt.hasCustomEventHandling:YES;

    // normal processing.  send keyDown for printable keys...
    } else {
      if (this._isFunctionOrNonPrintableKey(evt)) return YES; 
      if (evt.charCode != undefined && evt.charCode == 0) return YES;
      return this.sendKeyEvent('keyDown', evt) ? evt.hasCustomEventHandling:YES;
    }
  },
  
  keyup: function(evt) {
    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this is only a modifier change
    var ret = this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return ret;
    return this.sendKeyEvent('keyUp', evt) ? evt.hasCustomEventHandling:YES;
  }
    
});

/* 
  Invoked when the document is ready, but before main is called.  Creates an instances and sets up event listeners as needed.
*/
SC.ready(SC.RootResponder, SC.RootResponder.ready = function() {
  (SC.RootResponder.responder = SC.RootResponder.create()).setup();
});
