// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('system/ready');

/** @class

  The RootResponder captures events coming from a web browser and routes them 
  to the correct view in the view hierarchy.  Usually you do not work with a 
  RootResponder directly.  Instead you will work with Pane objects, which 
  register themselves with the RootResponder as needed to receive events.

  h1. RootResponder and Platforms
  
  RootResponder is implemented differently on the desktop and mobile platforms 
  using a technique called a "class cluster".  That is, although you get a 
  RootResponder instance at some point, you will likely be working with a 
  subclass of RootResponder that implements functionality unique to that 
  platform.
  
  The RootResponder you use depends on the active platform you have set and
  the framework you have loaded.
  
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
    The main pane.  This pane receives shortcuts and actions if the 
    focusedPane does not respond to them.  There can be only one main pane.  
    You can swap main panes by calling makeMainPane() here.
    
    Usually you will not need to edit the main pane directly.  Instead, you 
    should use a MainPane subclass, which will automatically make itself main 
    when you append it to the document.
  */
  mainPane: null,

  /** 
    Swaps the main pane.  If the current main pane is also the key pane, then 
    the new main pane will also be made key view automatically.  In addition 
    to simply updating the mainPane property, this method will also notify the 
    panes themselves that they will lose/gain their mainView status.
    
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
    actions first.  This pane is usually the highest ordered pane or the 
    mainPane.
  */
  keyPane: null,

  /**
    Makes the passed pane the new key pane.  If you pass nil or if the pane 
    does not accept key focus, then key focus will transfer to the mainPane.  
    This will notify both the old pane and the new root View that key focus 
    has changed.
    
    @param {SC.Pane} pane
    @returns {SC.RootResponder} Receiver
  */
  makeKeyPane: function(pane) {
    if (pane && !pane.get('acceptsKeyPane')) return this ;

    // if null was passed, try to make mainPane key instead.
    if (!pane) {
      pane = this.get('mainPane') ;
      if (!pane.get('acceptsKeyPane')) pane = null ;
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
  
  /** 
    Overridden by subclasses to return the window size.  The default simply
    returns 640 x 480
  */
  computeWindowSize: function() { 
    return { width: 640, height: 480 };
  },

  // .......................................................
  // ACTIONS
  //
  
  /** @property
    Set this to a delegate object that can respond to actions as they are sent 
    down the responder chain. 
  */
  defaultResponder: null,

  /**
    Route an action message to the appropriate responder.  This method will 
    walk the responder chain, attempting to find a responder that implements 
    the action name you pass to this method.  
    
    @param {String} action The action to perform - this is a method name.
    @param {SC.Responder} target object to set method to.  set to null to search responder chain
    @param {Object} sender The sender of the action
    @param {SC.Pane} pane optional pane to start search
    @returns {Boolean} YES if action was performed, NO otherwise
    @test in targetForAction
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
      return target && (target.respondsTo ? target.respondsTo(methodName) : (SC.typeOf(target[methodName]) === SC.T_FUNCTION)) ? target : null ;
    }

    // ok, no target was passed... try to find one in the responder chain
    var keyPane = this.get('keyPane'), mainPane = this.get('mainPane');

    // search explicit pane if passed
    if (pane) {
      target = this._responderFor(pane, methodName);
      
    // if no explicit pane is passed, look on keyPane or mainPane
    } else {
      if (keyPane && (keyPane !== pane)) {
        target = this._responderFor(keyPane, methodName);
      }
      if (!target && mainPane && (mainPane !== keyPane)) {
        target = this._responderFor(mainPane, methodName) ;
      }
    }

    // last stop, this defaultResponder
    if (!target) {
      target = this.get('defaultResponder');
      if (target && !target.respondsTo(methodName)) target = null ;
    }

    return target;
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
    Attempts to send an event down the responder chain.  This method will 
    invoke the sendEvent() method on either the keyPane or on the pane owning 
    the target view you pass in.  It will also automatically begin and end 
    a new run loop.
    
    If you want to trap additional events, you should use this method to 
    send the event down the responder chain.
    
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
    particular platform.  Be sure to call sc_super().
    
    @returns {void}
  */
  setup: function() {}
    
});

/* 
  Invoked when the document is ready, but before main is called.  Creates 
  an instance and sets up event listeners as needed.
*/
SC.ready(SC.RootResponder, SC.RootResponder.ready = function() {
  var r = SC.RootResponder.create();
  SC.RootResponder.responder = r; r.setup();
});
