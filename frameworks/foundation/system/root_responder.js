// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
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
  - shortcuts.  Shortcuts are sent to the focusedPane first, which will go 
    down its view hierarchy.  Then they go to the mainPane, which will go down
    its view hierarchy.  Then they go to the mainMenu.  Usually any handler 
    that picks this up will then try to do a sendAction().
  - actions.  Actions are sent down the responder chain.  They go to 
    focusedPane -> mainPane.  Each of these will start at the firstResponder 
    and work their way up the chain.
  
  Differences between Mobile + Desktop RootResponder
  
  The Desktop root responder can deal with the following kinds of events:
   mousedown, mouseup, mouseover, mouseout, mousemoved
*/
SC.RootResponder = SC.Object.extend({
  
  /**
    Contains a list of all panes currently visible on screen.  Everytime a 
    pane attaches or detaches, it will update itself in this array.
  */
  panes: null,
  
  init: function() {
    sc_super();
    this.panes = SC.Set.create();
  },
  
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
    var currentMain = this.get('mainPane') ;
    if (currentMain === pane) return this ; // nothing to do
    
    this.beginPropertyChanges() ;
    
    // change key focus if needed.
    if (this.get('keyPane') === currentMain) this.makeKeyPane(pane) ;
    
    // change setting
    this.set('mainPane', pane) ;
    
    // notify panes.  This will allow them to remove themselves.
    if (currentMain) currentMain.blurMainTo(pane) ;
    if (pane) pane.focusMainFrom(currentMain) ;
    
    this.endPropertyChanges() ;
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
    
  /** @property
    A stack of the previous key panes.
    
    *IMPORTANT: Property is not observable*
  */
  previousKeyPanes: [],
  
  /**
    Makes the passed pane the new key pane.  If you pass nil or if the pane 
    does not accept key focus, then key focus will transfer to the previous
    key pane (if it is still attached), and so on down the stack.  This will
    notify both the old pane and the new root View that key focus has changed.
    
    @param {SC.Pane} pane
    @returns {SC.RootResponder} receiver
  */
  makeKeyPane: function(pane) {
    // Was a pane specified?
    var newKeyPane, previousKeyPane, previousKeyPanes ;
    
    if (pane) {
      // Does the specified pane accept being the key pane?  If not, there's
      // nothing to do.
      if (!pane.get('acceptsKeyPane')) {
        return this ;
      }
      else {
        // It does accept key pane status?  Then push the current keyPane to
        // the top of the stack and make the specified pane the new keyPane.
        // First, though, do a sanity-check to make sure it's not already the
        // key pane, in which case we have nothing to do.
        previousKeyPane = this.get('keyPane') ;
        if (previousKeyPane === pane) {
          return this ;
        }
        else {
          if (previousKeyPane) {
            previousKeyPanes = this.get('previousKeyPanes') ;
            previousKeyPanes.push(previousKeyPane) ;
          }
          
          newKeyPane = pane ;
        }
      }
    }
    else {
      // No pane was specified?  Then pop the previous key pane off the top of
      // the stack and make it the new key pane, assuming that it's still
      // attached and accepts key pane (its value for acceptsKeyPane might
      // have changed in the meantime).  Otherwise, we'll keep going up the
      // stack.
      previousKeyPane = this.get('keyPane') ;
      previousKeyPanes = this.get('previousKeyPanes') ;
  
      newKeyPane = null ;
      while (previousKeyPanes.length > 0) {
        var candidate = previousKeyPanes.pop();
        if (candidate.get('isPaneAttached')  &&  candidate.get('acceptsKeyPane')) {
          newKeyPane = candidate ;
          break ;
        }
      }
    }
    
    
    // If we found an appropriate candidate, make it the new key pane.
    // Otherwise, make the main pane the key pane (if it accepts it).
    if (!newKeyPane) {
      var mainPane = this.get('mainPane') ;
      if (mainPane && mainPane.get('acceptsKeyPane')) newKeyPane = mainPane ;
    }
    
    // now notify old and new key views of change after edit    
    if (previousKeyPane) previousKeyPane.willLoseKeyPaneTo(newKeyPane) ;
    if (newKeyPane) newKeyPane.willBecomeKeyPaneFrom(previousKeyPane) ;
    
    this.set('keyPane', newKeyPane) ;
    
    if (newKeyPane) newKeyPane.didBecomeKeyPaneFrom(previousKeyPane) ;
    if (previousKeyPane) previousKeyPane.didLoseKeyPaneTo(newKeyPane) ;
    
    return this ;
  },
  
  /**
    Overridden by subclasses to return the window size.  The default simply
    returns 640 x 480.
    
    @returns {Size} the size of the window in pixels
  */
  computeWindowSize: function() { 
    return { width: 640, height: 480 } ;
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
    the action name you pass to this method.  Set 'tagret' to null to search 
    the responder chain.
    
    IMPORTANT: This method's API and implementation will likely change 
    significantly after SproutCore 1.0 to match the version found in 
    SC.ResponderContext.
    
    You generally should not call or override this method in your own 
    applications.
    
    @param {String} action The action to perform - this is a method name.
    @param {SC.Responder} target object to set method to (can be null)
    @param {Object} sender The sender of the action
    @param {SC.Pane} pane optional pane to start search with
    @param {Object} context optional. only passed to ResponderContexts
    @returns {Boolean} YES if action was performed, NO otherwise
    @test in targetForAction
  */
  sendAction: function( action, target, sender, pane, context) {
    target = this.targetForAction(action, target, sender, pane) ;
    
    // HACK: If the target is a ResponderContext, forward the action.
    if (target && target.isResponderContext) {
      return !!target.sendAction(action, sender, context);
    } else return target && target.tryToPerform(action, sender);
  },
  
  _responderFor: function(target, methodName) {
    var defaultResponder = target ? target.get('defaultResponder') : null;

    if (target) {
      target = target.get('firstResponder') || target;
      do {
        if (target.respondsTo(methodName)) return target ;
      } while (target = target.get('nextResponder')) ;
    }

    // HACK: Eventually we need to normalize the sendAction() method between
    // this and the ResponderContext, but for the moment just look for a 
    // ResponderContext as the defaultResponder and return it if present.
    if (typeof defaultResponder === SC.T_STRING) {
      defaultResponder = SC.objectForPropertyPath(defaultResponder);
    }

    if (!defaultResponder) return null;
    else if (defaultResponder.isResponderContext) return defaultResponder;
    else if (defaultResponder.respondsTo(methodName)) return defaultResponder;
    else return null;
  },
  
  /**
    Attempts to determine the initial target for a given action/target/sender 
    tuple.  This is the method used by sendAction() to try to determine the 
    correct target starting point for an action before trickling up the 
    responder chain.
    
    You send actions for user interface events and for menu actions.
    
    This method returns an object if a starting target was found or null if no
    object could be found that responds to the target action.
    
    Passing an explicit target or pane constrains the target lookup to just
    them; the defaultResponder and other panes are *not* searched.
    
    @param {Object|String} target or null if no target is specified
    @param {String} method name for target
    @param {Object} sender optional sender
    @param {SC.Pane} optional pane
    @returns {Object} target object or null if none found
  */
  targetForAction: function(methodName, target, sender, pane) {
    
    // 1. no action, no target...
    if (!methodName || (SC.typeOf(methodName) !== SC.T_STRING)) {
      return null ;
    }
    
    // 2. an explicit target was passed...
    if (target) {
      if (SC.typeOf(target) === SC.T_STRING) {
        target = SC.objectForPropertyPath(target) ;
      }
      
      if (target) {
        if (target.respondsTo && !target.respondsTo(methodName)) {
          target = null ;
        } else if (SC.typeOf(target[methodName]) !== SC.T_FUNCTION) {
          target = null ;
        }
      }
      
      return target ;
    }
    
    // 3. an explicit pane was passed...
    if (pane) {
      return this._responderFor(pane, methodName) ;
    }
    
    // 4. no target or pane passed... try to find target in the active panes
    // and the defaultResponder
    var keyPane = this.get('keyPane'), mainPane = this.get('mainPane') ;
    
    // ...check key and main panes first
    if (keyPane && (keyPane !== pane)) {
      target = this._responderFor(keyPane, methodName) ;
    }
    if (!target && mainPane && (mainPane !== keyPane)) {
      target = this._responderFor(mainPane, methodName) ;
    }
    
    // ...still no target? check the defaultResponder...
    if (!target && (target = this.get('defaultResponder'))) {
      if (SC.typeOf(target) === SC.T_STRING) {
        target = SC.objectForPropertyPath(target) ;
        if (target) this.set('defaultResponder', target) ; // cache if found
      }
      if (target) {
        if (target.respondsTo && !target.respondsTo(methodName)) {
          target = null ;
        } else if (SC.typeOf(target[methodName]) !== SC.T_FUNCTION) {
          target = null ;
        }
      }
    }
    
    return target ;
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
    var pane, ret ;
     
    SC.RunLoop.begin() ;
    
    // get the target pane
    if (target) pane = target.get('pane') ;
    else pane = this.get('keyPane') || this.get('mainPane') ;
    
    // if we found a valid pane, send the event to it
    ret = (pane) ? pane.sendEvent(action, evt, target) : null ;
    
    SC.RunLoop.end() ;
    
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
    keyNames.forEach( function(keyName) {
      var method = this[keyName] ;
      if (method) SC.Event.add(target, keyName, this, method) ;
    },this) ;
    target = null ;
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
  var r;
  r = SC.RootResponder.responder = SC.RootResponder.create() ;
  r.setup() ;
});
