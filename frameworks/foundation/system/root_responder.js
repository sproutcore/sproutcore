// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('system/ready');

/** Set to NO to leave the backspace key under the control of the browser.*/
SC.CAPTURE_BACKSPACE_KEY = NO ;

/** @class

  The RootResponder captures events coming from a web browser and routes them 
  to the correct view in the view hierarchy.  One RootResponder instance  exists 
  for each DOMWindow/DOMDocument you deal with.  (Only one unless you are trying 
  to open multiple windows.)
  
  Usually you do not work with a RootResponder directly.  Instead you will work 
  with Pane objects, which register themselves with the RootResponder as needed 
  to receive events.

  h1. RootResponder and Platforms
  
  RootResponder is implemented differently on the desktop and mobile platforms 
  using a technique called a "class cluster".  That is, although you get a 
  RootResponder instance at some point, you will likely be working with a 
  subclass of RootResponder that implements functionality unique to that platform.
  
  h1. Event Types 
    
  RootResponders can route four types of events:
  
  - Direct events.  Such as mouse and touch events.  These are routed to the 
    nearest view managing the target DOM elment.
  - Keyboard events.  These are sent to the keyPane, which will send it 
    to the current firstResponder.
  - resize. This event is sent to all panes.
  - shortcuts.  Shortcuts are sent to the focusedPane first, which will go down 
    its view hierarchy.  Then they go to the mainPane, which will go down its 
    view hierarchy.  Then they go to the mainMenu.  Usually any handler that 
    picks this up will then try to do a sendAction().
  - actions.  Actions are sent down the responder chain.  They go to 
    focusedPane -> mainPane.  Each of these will start at the firstResponder and 
    work their way up the chain.
  
  Differences between Mobile + Desktop RootResponder
  
  The Desktop root responder can deal with the following kinds of events:
   mousedown, mouseup, mouseover, mouseout, mousemoved
  
*/
SC.RootResponder = SC.Object.extend({

  // .......................................................
  // MAIN Pane
  //

  /** @property
    The main pane.  This pane receives shortcuts and actions if the focusedPane 
    does not respond to them.  There can be only one main pane.  You can swap 
    main panes by calling makeMainPane() here.
    
    Usually you will not need to edit the main pane directly.  Instead, you 
    should use a MainPane subclass, which will automatically make itself main 
    when you append it to the document.
  */
  mainPane: null,

  /** 
    Swaps the main pane.  If the current main pane is also the key pane, then the 
    new main pane will also be made key view automatically.  In addition to simply 
    updating the mainPane property, this method will also notify the panes 
    themselves that they will lose/gain their mainView status.
    
    Note that this method does not actually change the Pane's place in the 
    document body.  That will be handled by the Pane itself.
    
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
    The current key pane.  This pane receives keyboard events, shortcuts, and 
    actions first.  This pane is usually the highest ordered pane or the mainPane.
  */
  keyPane: null,

  /**
    Makes the passed pane the new key pane.  If you pass nil or if the pane does 
    not accept key focus, then key focus will transfer to the mainPane.  This 
    will notify both the old pane and the new root View that key focus has changed.
    
    @param {SC.Pane} pane
    @returns {SC.RootResponder} Receiver
  */
  makeKeyPane: function(pane) {
    if (pane && !pane.get('acceptsKeyFocus')) return this ;

    // if null was passed, try to make mainPane key instead.
    if (!pane) {
      pane = this.get('mainPane') ;
      if (!pane.get('acceptsKeyFocus')) pane = null ;
    }

    var current = this.get('keyPane') ;
    if (current === pane) return this; // nothing to do

    // now notify old and new key views of change after edit    
    if (current) current.willLoseKeyPaneTo(pane) ;
    if (pane) pane.willBecomeKeyPaneFrom(current);

    this.set('keyPane', pane) ;
    
    if (pane) pane.didBecomeKeyPaneFrom(current);
    if (current) current.didLoseKeyPaneTo(pane);

    return this ;
  },
  
  // .......................................................
  // ROOT VIEW ORDER
  //

  /** @property
    A set of all panes currently managed by the RootResponder.  To put a view 
    under management, just add it to this set.
  */
  panes: null,

  /**
    Called by a pane whenever the pane is added to the document.  This will 
    add the pane to the set.
  */
  addPane: function(pane) { this.panes.add(pane); },
  
  /**
    Called by a pane whenever the pane is removed from a document.  This will 
    remove the pane from the set.
  */
  removePane: function(pane) { this.panes.remove(pane); },
  
  /** @property
    The current focused view.  This will receive actions sent down the chain.  
    This only needs to be set for platforms that support multiple, layered panes.
  */
  focusedPane: null,

  // .......................................................
  // ACTIONS
  //
  
  /** @property
    Set this to a delegate object that can respond to actions as they are sent 
    down the responder chain. 
  */
  defaultResponder: null,

  /**
    Route an action message to the appropriate responder
    @param {String} action The action to perform - this is a method name.
    @param {SC.Responder} target The object to perform the action upon. Set to null to search the Responder chain for a receiver.
    @param {Object} sender The sender of the action
    @param {SC.Pane} pane
    @returns YES if action was performed, NO otherwise
  */
  sendAction: function( action, target, sender, pane) {
    target = this.targetForAction(action, target, sender, pane);
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
    @param {SC.Pane} optional pane
    @returns {Object} target object or null if none found
  */
  targetForAction: function(methodName, target, sender, pane) {

    // no action, no target...
    if (!methodName || (SC.typeOf(methodName) !== SC.T_STRING)) return null;

    // an explicit target was passed...
    if (target) {
      if (SC.typeOf(target) === SC.T_STRING) {
        target = SC.objectForPropertyPath(target) ;
      }
      return target.respondsTo(methodName) ? target : null ;
    }

    // ok, no target was passed... try to find one in the responder chain
    var focusedPane = this.get('focusedPane'), keyPane = this.get('keyPane'), mainPane = this.get('mainPane');
    
    if (pane) target = this._responderFor(pane, methodName);
    if (!target && keyPane && (keyPane !== pane)) target = this._responderFor(keyPane, methodName);
    if (!target && focusedPane && (focusedPane !== keyPane)) {
      target = this._responderFor(focusedPane, methodName) ;
    }
    if (!target && mainPane && (mainPane !== keyPane) && (mainPane !== focusedPane)) {
      target = this._responderFor(mainPane, methodName) ;
    }

    // last stop, this defaultResponder
    target = this.get('defaultResponder');
    if (target && target.respondsTo(methodName)) return target;

    return null;
  },

  /**
    Finds the view that appears to be targeted by the passed event.  This only
    works on events with a valid target property.
    
    @param {SC.Event} evt
    @returns {SC.View} view instance or null
  */
  targetViewForEvent: function(evt) {
    return evt.target ? SC.$(evt.target).view()[0] : null ;
  },
  
  /**
    Attempts to send an event down the responder chain.  This method will invoke 
    the sendEvent() method on either the keyPane or on the pane owning the target 
    view you pass in.
    
    @param {String} action
    @param {SC.Event} evt
    @param {Object} target
    @returns {Object} object that handled the event or null if not handled
  */
  sendEvent: function(action, evt, target) {
    SC.RunLoop.begin();
    var pane = (target) ? target.get('pane') : (this.get('keyPane') || this.get('mainPane'));
    var ret = (pane) ? pane.sendEvent(action, evt, target) : null ;
    SC.RunLoop.end();
    return ret ;
  },
  

  // do nothing in generic implementation.  Used in desktop platform.
  attemptKeyEquivalent: function(evt) { return null; }, 
  
  // .......................................................
  // EVENT LISTENER SETUP
  //

  /**
    Default method to add an event listener for the named event.  If you simply 
    need to add listeners for a type of event, you can use this method as 
    shorthand.  Pass an array of event types to listen for and the element to 
    listen in.  A listener will only be added if a handler is actually installed 
    on the RootResponder of the same name.
    
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
    Called when the document is ready to begin handling events.  Setup event 
    listeners in this method that you are interested in observing for your 
    particular platform.  The default method configures listeners for keyboard 
    events only.  Be sure to call sc_super().
    
    @returns {void}
  */
  setup: function() {
    this.listenFor('keydown keyup'.w(), document);

    // handle special case for keypress- you can't use normal listener to block the backspace key on Mozilla
    if (this.keypress) {
      if (SC.CAPTURE_BACKSPACE_KEY && SC.browser.mozilla) {
        var responder = this ;
        document.onkeypress = function(e) { 
          e = SC.Event.normalizeEvent(e);
          return responder.keypress.call(responder, e); 
        };
        
        SC.Event.add(window, 'unload', this, function() { document.onkeypress = null; }); // be sure to cleanup memory leaks
  
      // Otherwise, just add a normal event handler. 
      } else SC.Event.add(document, 'keypress', this, this.keypress);
    }
  },
  
  init: function() {
    sc_super();
    this.panes = SC.Set.create();
  },
  
  // .......................................................
  // KEYBOARD HANDLING
  //

  _lastModifiers: null,

  /** @private
    Modifier key changes are notified with a keydown event in most browsers.  
    We turn this into a flagsChanged keyboard event.  Normally this does not
    stop the normal browser behavior.
  */  
  _handleModifierChanges: function(evt) {
    // if the modifier keys have changed, then notify the first responder.
    var m;
    m = this._lastModifiers = (this._lastModifiers || { alt: false, ctrl: false, shift: false });

    var changed = false;
    if (evt.altKey !== m.alt) { m.alt = evt.altKey; changed=true; }
    if (evt.ctrlKey !== m.ctrl) { m.ctrl = evt.ctrlKey; changed=true; }
    if (evt.shiftKey !== m.shift) { m.shift = evt.shiftKey; changed=true;}
    evt.modifiers = m; // save on event

    return (changed) ? (this.sendEvent('flagsChanged', evt) ? evt.hasCustomEventHandling : YES) : YES ;
  },

  /** @private
    Determines if the keyDown event is a nonprintable or function key. These
    kinds of events are processed as keyboard shortcuts.  If no shortcut
    handles the event, then it will be sent as a regular keyDown event.
  */
  _isFunctionOrNonPrintableKey: function(evt) {
    return !!(evt.altKey || evt.ctrlKey || evt.metaKey || ((evt.charCode !== evt.which) && SC.FUNCTION_KEYS[evt.which]));
  },

  /** @private 
    Determines if the event simply reflects a modifier key change.  These 
    events may generate a flagsChanged event, but are otherwise ignored.
  */
  _isModifierKey: function(evt) {
    return !!SC.MODIFIER_KEYS[evt.charCode];
  },

  /** @private
    The keydown event occurs whenever the physically depressed key changes.
    This event is used to deliver the flagsChanged event and to with function
    keys and keyboard shortcuts.
    
    All actions that might cause an actual insertion of text are handled in
    the keypress event.
  */
  keydown: function(evt) {
    // Firefox does NOT handle delete here...
    if (SC.browser.mozilla > 0 && (evt.which === 8)) return true ;
    
    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this 
    // is only a modifier change
    var ret = this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return ret;

    // if this is a function or non-printable key, try to use this as a key
    // equivalent.  Otherwise, send as a keyDown event so that the focused
    // responder can do something useful with the event.
    if (this._isFunctionOrNonPrintableKey(evt)) {
      // otherwise, send as keyDown event.  If no one was interested in this
      // keyDown event (probably the case), just let the browser do its own
      // processing.
      ret = this.sendEvent('keyDown', evt) ;

      // attempt key equivalent if key not handled
      if (!ret) {
        ret = this.attemptKeyEquivalent(evt) ;
        return !ret ;
      } else {
        return evt.hasCustomEventHandling ;
      }
    }
    return YES; // allow normal processing...
  },
  
  /** @private
    The keypress event occurs after the user has typed something useful that
    the browser would like to insert.  Unlike keydown, the input codes here 
    have been processed to reflect that actual text you might want to insert.
    
    Normally ignore any function or non-printable key events.  Otherwise, just
    trigger a keyDown.
  */
  keypress: function(evt) {
    // delete is handled in keydown() for most browsers
    if (SC.browser.mozilla > 0 && (evt.which === 8)) {
      return this.sendEvent('keyDown', evt) ? evt.hasCustomEventHandling:YES;

    // normal processing.  send keyDown for printable keys...
    } else {
      if (this._isFunctionOrNonPrintableKey(evt)) return YES; 
      if (evt.charCode !== undefined && evt.charCode === 0) return YES;
      return this.sendEvent('keyDown', evt) ? evt.hasCustomEventHandling:YES;
    }
  },
  
  keyup: function(evt) {
    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this is only a modifier change
    var ret = this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return ret;
    return this.sendEvent('keyUp', evt) ? evt.hasCustomEventHandling:YES;
  }
    
});

/* 
  Invoked when the document is ready, but before main is called.  Creates 
  an instance and sets up event listeners as needed.
*/
SC.ready(SC.RootResponder, SC.RootResponder.ready = function() {
  console.log('SC.RootResponder.ready called');
  var r = SC.RootResponder.create();
  SC.RootResponder.responder = r; r.setup();
});
