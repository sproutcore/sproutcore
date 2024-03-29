// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/ready');
sc_require('system/platform');
sc_require('system/touch');

/** Set to NO to leave the backspace key under the control of the browser.*/
SC.CAPTURE_BACKSPACE_KEY = NO ;

/** @class

  The RootResponder captures events coming from a web browser and routes them
  to the correct view in the view hierarchy.  Usually you do not work with a
  RootResponder directly.  Instead you will work with Pane objects, which
  register themselves with the RootResponder as needed to receive events.

  RootResponder and Platforms
  ---

  RootResponder contains core functionality common among the different web
  platforms. You will likely be working with a subclass of RootResponder that
  implements functionality unique to that platform.

  The correct instance of RootResponder is detected at runtime and loaded
  transparently.

  Event Types
  ---

  RootResponders can route four types of events:

   - Direct events, such as mouse and touch events.  These are routed to the
     nearest view managing the target DOM elment. RootResponder also handles
     multitouch events so that they are delegated to the correct views.
   - Keyboard events. These are sent to the keyPane, which will then send the
     event to the current firstResponder and up the responder chain.
   - Resize events. When the viewport resizes, these events will be sent to all
     panes.
   - Keyboard shortcuts. Shortcuts are sent to the keyPane first, which
     will go down its view hierarchy. Then they go to the mainPane, which will
     go down its view hierarchy.
   - Actions. Actions are generic messages that your application can send in
     response to user action or other events. You can either specify an
     explicit target, or allow the action to traverse the hierarchy until a
     view is found that handles it.
*/
SC.RootResponder = SC.Object.extend(
  /** @scope SC.RootResponder.prototype */{

  /**
    Contains a list of all panes currently visible on screen.  Every time a
    pane attaches or detaches, it will update itself in this array.
  */
  panes: null,

  init: function() {
    sc_super();
    this.panes = SC.Set.create();
  },

  // .......................................................
  // MAIN PANE
  //

  /**
    The main pane.  This pane receives shortcuts and actions if the
    focusedPane does not respond to them.  There can be only one main pane.
    You can swap main panes by calling makeMainPane() here.

    Usually you will not need to edit the main pane directly.  Instead, you
    should use a MainPane subclass, which will automatically make itself main
    when you append it to the document.

    @type SC.MainPane
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
    @returns {SC.RootResponder}
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

  // ..........................................................
  // MENU PANE
  //

  /**
    The current menu pane. This pane receives keyboard events before all other
    panes, but tends to be transient, as it is only set when a pane is open.

    @type SC.MenuPane
  */
  menuPane: null,

  /**
    Sets a pane as the menu pane. All key events will be directed to this
    pane, but the current key pane will not lose focus.

    Usually you would not call this method directly, but allow instances of
    SC.MenuPane to manage the menu pane for you. If your pane does need to
    become menu pane, you should relinquish control by calling this method
    with a null parameter. Otherwise, key events will always be delivered to
    that pane.

    @param {SC.MenuPane} pane
    @returns {SC.RootResponder} receiver
  */
  makeMenuPane: function(pane) {
    // Does the specified pane accept being the menu pane?  If not, there's
    // nothing to do.
    if (pane  &&  !pane.get('acceptsMenuPane')) {
      return this;
    } else {
      var currentMenu = this.get('menuPane');
      if (currentMenu === pane) return this; // nothing to do

      this.set('menuPane', pane);
    }

    return this;
  },

  // .......................................................
  // KEY PANE
  //

  /**
    The current key pane. This pane receives keyboard events, shortcuts, and
    actions first, unless a menu is open. This pane is usually the highest
    ordered pane or the mainPane.

    @type SC.Pane
  */
  keyPane: null,

  /** @private
    A stack of previous key panes. Used to allow panes to resign key pane
    status without having to know who had it before them.

    NOTE: This property is not observable.
  */
  previousKeyPanes: [],

  /**
    Makes the passed pane the new key pane.  If you pass null or if the pane
    does not accept key focus, then key focus will transfer to the previous
    key pane (if it is still attached), and so on down the stack.  This will
    notify both the old pane and the new root View that key focus has changed.

    @param {SC.Pane} pane
    @returns {SC.RootResponder} receiver
  */
  makeKeyPane: function(pane) {
    // Quick note about previousKeyPanes: if a pane is destroyed while in the
    // previous panes stack, it will retain a reference to it here, causing a
    // brief leak. The reference will be removed as soon as the panes above it
    // in the stack resign, so it's rarely an issue, and fixing it would require
    // a dedicated method and some extra coordination that's probably not worth
    // it.

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
    } else {
      // No pane was specified?  Then pop the previous key pane off the top of
      // the stack and make it the new key pane, assuming that it's still
      // attached and accepts key pane (its value for acceptsKeyPane might
      // have changed in the meantime).  Otherwise, we'll keep going up the
      // stack.
      previousKeyPane = this.get('keyPane') ;
      previousKeyPanes = this.get('previousKeyPanes') ;

      newKeyPane = null ;
      var candidate;
      while (previousKeyPanes.length > 0) {
        candidate = previousKeyPanes.pop();
        if (candidate.get('isVisibleInWindow') && candidate.get('acceptsKeyPane')) {
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

  // ..........................................................
  // VIEWPORT STATE
  //

  /**
    The last known window size.
    @type Rect
    @isReadOnly
  */
  currentWindowSize: null,

  /**
    Computes the window size from the DOM.

    @returns Rect
  */
  computeWindowSize: function() {
    var size, bod, docElement;
    if(!this._bod || !this._docElement){
      bod = document.body;
      docElement = document.documentElement;
      this._bod=bod;
      this._docElement=docElement;
    }else{
      bod = this._bod;
      docElement = this._docElement;
    }

    if (window.innerHeight) {
      size = {
        width: window.innerWidth,
        height: window.innerHeight
      } ;
    } else if (docElement && docElement.clientHeight) {
      size = {
        width: docElement.clientWidth,
        height: docElement.clientHeight
      };
    } else if (bod) {
      size = {
        width: bod.clientWidth,
        height: bod.clientHeight
      } ;
    }
    return size;
  },

  /**
    On window resize, notifies panes of the change.

    @returns {Boolean}
  */
  resize: function() {
    this._resize();
    this._assignDesignMode();

    return YES; //always allow normal processing to continue.
  },

  /** @private */
  _resize: function() {
    // calculate new window size...
    var newSize = this.computeWindowSize(), oldSize = this.get('currentWindowSize');
    this.set('currentWindowSize', newSize); // update size

    if (!SC.rectsEqual(newSize, oldSize)) {
      SC.run(function() {
        //Notify orientation change. This is faster than waiting for the orientation
        //change event.
        SC.device.windowSizeDidChange(newSize);

        // notify panes
        if (this.panes) {
            if (oldSize !== newSize) {
              this.panes.invoke('windowSizeDidChange', oldSize, newSize);
            }
        }
      }, this);
    }
  },

  /** @private */
  _assignDesignMode: function () {
    var newDesignMode = this.computeDesignMode(),
      oldDesignMode = this.get('currentDesignMode');

    if (oldDesignMode !== newDesignMode) {
      this.set('currentDesignMode', newDesignMode);

      if (this.panes) {
        SC.run(function() {
          this.panes.invoke('updateDesignMode', oldDesignMode, newDesignMode);
        }, this);
      }
    }
  },

  /**
    Indicates whether or not the window currently has focus.  If you need
    to do something based on whether or not the window is in focus, you can
    setup a binding or observer to this property.  Note that the SproutCore
    automatically adds an sc-focus or sc-blur CSS class to the body tag as
    appropriate.  If you only care about changing the appearance of your
    controls, you should use those classes in your CSS rules instead.
  */
  hasFocus: NO,

  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class
    (removing sc-blur).  Also notify panes.
  */
  focus: function(evt) {
    if (!this.get('hasFocus')) {
      SC.$('body').addClass('sc-focus').removeClass('sc-blur');

      SC.run(function () {
      // If the app is getting focus again set the first responder to the first
      // valid firstResponder view in the view's tree
      if(!SC.TABBING_ONLY_INSIDE_DOCUMENT && !SC.browser.isIE8OrLower){
        var keyPane = SC.RootResponder.responder.get('keyPane');
        if (keyPane) {
          var nextValidKeyView = keyPane.get('nextValidKeyView');
          if (nextValidKeyView) keyPane.makeFirstResponder(nextValidKeyView);
        }
      }

        this.set('hasFocus', YES);
      }, this);
    }

    return YES ; // allow default
  },

  /**
    Handle window focus event for IE. Listening to the focus event is not
    reliable as per every focus event you receive you immediately get a blur
    event (Only on IE of course ;)
  */
  focusin: function(evt) {
    if(this._focusTimeout) clearTimeout(this._focusTimeout);
    this.focus(evt);
  },

  /**
    Handle window blur event for IE. Listening to the focus event is not
    reliable as per every focus event you receive you immediately get a blur
    event (Only on IE of course ;)
  */
  focusout: function(evt) {
    var that = this;
    this._focusTimeout = setTimeout(function(){that.blur(evt);}, 300);
  },


  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class (removing
    sc-blur).  Also notify panes.
  */
  blur: function(evt) {
    if (this.get('hasFocus')) {
      SC.$('body').addClass('sc-blur').removeClass('sc-focus');

      SC.run(function() {
        this.set('hasFocus', NO);
      }, this);
    }
    return YES ; // allow default
  },

  dragDidStart: function(drag) {
    this._mouseDownView = drag ;
    this._drag = drag ;
  },

  // ------------------------------------------------------------------------
  // Design Modes
  //

  /** @private */
  currentDesignMode: null,

  /** @private Managed by SC.Application. */
  designModes: function (key, value) {
    if (SC.none(value)) {
      // Clear previous values.
      if (this._designModeNames) {
        delete this._designModeNames;
        delete this._designModeThresholds;
      }

      value = null;
    } else {
      this._prepOrderedArrays(value);
    }

    this._assignDesignMode();

    return value;
  }.property().cacheable(),

  /** @private Determine the design mode based on area and pixel density. */
  computeDesignMode: function () {
    var designMode = null,
      designModeNames = this._designModeNames,
      designModeThresholds = this._designModeThresholds,
      currentWindowSize,
      area;

    // Fast path!
    if (!designModeNames) { return null; }

    currentWindowSize = this.get('currentWindowSize');
    area = (currentWindowSize.width * currentWindowSize.height);
    var i, len;
    for (i = 0, len = designModeThresholds.get('length'); i < len; i++) {
      var layoutWidthThreshold = designModeThresholds.objectAt(i);
      if (area < layoutWidthThreshold) {
        designMode = designModeNames.objectAt(i);
        break;
      }
    }

    // If no smaller designMode was found, use the biggest designMode.
    if (SC.none(designMode) && designModeNames && designModeNames.get('length') > 0) {
      designMode = designModeNames.objectAt(i);
    }

    return SC.device.orientation === SC.PORTRAIT_ORIENTATION ? designMode + '_p' : designMode + '_l';
  },

  /** @private (semi-private)
    Returns the fallback design mode for the given design mode.  This is
    primarily used by SC.View for the case where an adjustment isn't found
    for the current design mode and we want to apply the next best design
    mode as a fallback.
  */
  fallbackDesignMode: function (designMode) {
    var designModeNames = this._designModeNames,
      index,
      ret = null;

    index = designModeNames.indexOf(designMode);
    if (index >= 0) {
      ret = designModeNames[index - 1];
    }

    return ret;
  },

  /** @private Prepares ordered design modes & widths arrays when designModes changes. */
  _prepOrderedArrays: function (designModes) {
    var designModeNames,
      designModeThresholds;

    // Order the design modes for easier access later.
    if (designModes) {
      designModeNames = this._designModeNames = [];
      designModeThresholds = this._designModeThresholds = [];

      var key;

      outer:
        for (key in designModes) {
          var i, value;

          // Assume that the keys will be ordered smallest to largest so run backwards.
          value = designModes[key];
          inner:
            for (i = designModeThresholds.length - 1; i >= 0; i--) {
              if (designModeThresholds[i] < value) {
                // Exit early!
                break inner;
              }
            }

          i += 1;
          designModeNames.splice(i, 0, key);
          designModeThresholds.splice(i, 0, value);
        }
    }
  },

  // .......................................................
  // ACTIONS
  //

  /**
    Set this to a delegate object that can respond to actions as they are sent
    down the responder chain.

    @type SC.Object
  */
  defaultResponder: null,

  /**
    Route an action message to the appropriate responder.  This method will
    walk the responder chain, attempting to find a responder that implements
    the action name you pass to this method.  Set 'target' to null to search
    the responder chain.

    **IMPORTANT**: This method's API and implementation will likely change
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
  sendAction: function( action, target, sender, pane, context, firstResponder) {
    target = this.targetForAction(action, target, sender, pane, firstResponder) ;

    if (target) {
      // HACK: If the target is a ResponderContext, forward the action.
      if (target.isResponderContext) {
        return !!target.sendAction(action, sender, context, firstResponder);
      } else {
        return target.tryToPerform(action, sender, context);
      }
    }
  },

  _responderFor: function (target, methodName, firstResponder) {
    var defaultResponder = target ? target.get('defaultResponder') : null;

    if (target) {
      target = firstResponder || target.get('firstResponder') || target;
      do {
        if (target.respondsTo(methodName)) return target ;
      } while ((target = target.get('nextResponder'))) ;
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
    @param {firstResponder} a first responder to use
    @returns {Object} target object or null if none found
  */
  targetForAction: function(methodName, target, sender, pane, firstResponder) {

    // 1. no action, no target...
    if (!methodName || (SC.typeOf(methodName) !== SC.T_STRING)) {
      return null ;
    }

    // 2. an explicit target was passed...
    if (target) {
      // Normalize String targets to Objects
      if (SC.typeOf(target) === SC.T_STRING) {
        target = SC.objectForPropertyPath(target) ||
                 SC.objectForPropertyPath(target, sender);
      }

      // Ensure that the target responds to the method.
      if (target && !target.isResponderContext) {
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
      target = this._responderFor(pane, methodName, firstResponder);
      if (target) return target;
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
      if (target && !target.isResponderContext) {
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
  targetViewForEvent: function (evt) {
    var ret = null;
    if (evt.target) { ret = SC.viewFor(evt.target); }

    return ret;
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

    SC.run(function send_event() {
      // get the target pane
      if (target) pane = target.get('pane') ;
      else pane = this.get('menuPane') || this.get('keyPane') || this.get('mainPane') ;

      // if we found a valid pane, send the event to it
      ret = (pane) ? pane.sendEvent(action, evt, target) : null ;
    }, this);

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
    on the RootResponder (or receiver) of the same name.

    @param {Array} keyNames
    @param {Element} target
    @param {Object} receiver - optional if you don't want 'this'
    @param {Boolean} useCapture
    @returns {SC.RootResponder} receiver
  */
  listenFor: function(keyNames, target, receiver, useCapture) {
    receiver = receiver ? receiver : this;
    keyNames.forEach( function(keyName) {
      var method = receiver[keyName] ;
      if (method) SC.Event.add(target, keyName, receiver, method, null, useCapture) ;
    },this) ;

    target = null ;

    return receiver ;
  },

  /**
    Called when the document is ready to begin handling events.  Setup event
    listeners in this method that you are interested in observing for your
    particular platform.  Be sure to call sc_super().

    @returns {void}
  */
  setup: function() {
    // handle basic events
    this.listenFor(['touchstart', 'touchmove', 'touchend', 'touchcancel', 'keydown', 'keypress', 'keyup', 'beforedeactivate', 'mousedown', 'mouseup', 'dragenter', 'dragover', 'dragleave', 'drop', 'click', 'dblclick', 'mousemove', 'mouseleave', 'contextmenu'], document)
        .listenFor(['resize'], window);

    if(SC.browser.isIE8OrLower) this.listenFor(['focusin', 'focusout'], document);
    else this.listenFor(['focus', 'blur'], window);

    // Add an array of transition listeners for immediate use (these will be cleaned up when actual testing completes).
    // Because the transition test happens asynchronously and because we don't want to
    // delay the launch of the application in order to a transition test (the app won't
    // load if the browser tab is not visible), we start off by listening to everything
    // and when the test is completed, we remove the extras to avoid double callbacks.
    if (SC.platform.supportsCSSTransitions) {
      var domPrefix = SC.browser.domPrefix,
        lowerDomPrefix = domPrefix.toLowerCase(),
        variation1 = lowerDomPrefix + 'transitionend',
        variation2 = lowerDomPrefix + 'TransitionEnd',
        variation3 = domPrefix + 'TransitionEnd';

      // Ensure that the callback name used maps to our implemented function name.
      this[variation1] = this[variation2] = this[variation3] = this.transitionend;

      // ex. transitionend, webkittransitionend, webkitTransitionEnd, WebkitTransitionEnd
      this.listenFor(['transitionend', variation1, variation2, variation3], document);

      if (SC.platform.supportsCSSAnimations) {
        variation1 = lowerDomPrefix + 'animationstart';
        variation2 = lowerDomPrefix + 'AnimationStart';
        variation3 = domPrefix + 'AnimationStart';

        // Ensure that the callback name used maps to our implemented function name.
        this[variation1] = this[variation2] = this[variation3] = this.animationstart;

        // ex. animationstart, webkitanimationstart, webkitAnimationStart, WebkitAnimationStart
        this.listenFor(['animationstart', variation1, variation2, variation3], document);

        variation1 = lowerDomPrefix + 'animationiteration';
        variation2 = lowerDomPrefix + 'AnimationIteration';
        variation3 = domPrefix + 'AnimationIteration';

        // Ensure that the callback name used maps to our implemented function name.
        this[variation1] = this[variation2] = this[variation3] = this.animationiteration;

        // ex. animationiteration, webkitanimationiteration, webkitAnimationIteration, WebkitAnimationIteration
        this.listenFor(['animationiteration', variation1, variation2, variation3], document);

        variation1 = lowerDomPrefix + 'animationend';
        variation2 = lowerDomPrefix + 'AnimationEnd';
        variation3 = domPrefix + 'AnimationEnd';

        // Ensure that the callback name used maps to our implemented function name.
        this[variation1] = this[variation2] = this[variation3] = this.animationend;

        // ex. animationend, webkitanimationend, webkitAnimationEnd, WebkitAnimationEnd
        this.listenFor(['animationend', variation1, variation2, variation3], document);
      }
    }

    // handle these two events specially in IE
    ['drag', 'selectstart'].forEach(function(keyName) {
      var method = this[keyName] ;
      if (method) {
        if (SC.browser.isIE) {
          var responder = this ;

          document.body['on' + keyName] = function(e) {
            return method.call(responder, SC.Event.normalizeEvent(event || window.event)); // this is IE :(
          };

          // be sure to cleanup memory leaks
           SC.Event.add(window, 'unload', this, function() {
            document.body['on' + keyName] = null;
          });

        } else {
          SC.Event.add(document, keyName, this, method);
        }
      }
    }, this);

    var mousewheel = 'mousewheel';

    // Firefox emits different mousewheel events than other browsers
    if (SC.browser.isMozilla) {
      // For Firefox < 3.5, subscribe to DOMMouseScroll events
      if (SC.browser.compare(SC.browser.engineVersion, '1.9.1') < 0) {
        mousewheel = 'DOMMouseScroll';

      // For Firefox 3.5 and greater, we can listen for MozMousePixelScroll,
      // which supports pixel-precision scrolling devices, like MacBook
      // trackpads.
      } else {
        mousewheel = 'MozMousePixelScroll';
      }
    }
    SC.Event.add(document, mousewheel, this, this.mousewheel);

    // Do some initial set up.
    this.set('currentWindowSize', this.computeWindowSize()) ;

    var f = SC.RunLoop.prototype.endRunLoop,
      patch = function() {
        // Call original endRunLoop implementation.
        if (f) f.apply(this, arguments);

        // This is a workaround for a weird behavior on touch devices.
        // Specifically, if the target of a touchstart event is removed from the DOM,
        // you will not receive future touchmove or touchend events. What we do is, at the
        // end of every runloop, check to see if the target of any touches has been removed
        // from the DOM. If so, we re-append it to the DOM and hide it. We then mark the target
        // as having been moved, and it is de-allocated in the corresponding touchend event.
        var touches = SC.RootResponder.responder._touches;
        if (touches) {
          var touch, elem, target, found = NO;

          // Iterate through the touches we're currently tracking
          for (touch in touches) {
            if (touches[touch]._rescuedElement) continue; // only do once

            target = elem = touches[touch].target;

            // Travel up the hierarchy looking for the document body
            while (elem && (elem = elem.parentNode) && !found) {
              found = (elem === document.body);
            }

            // If we aren't part of the body, move the element back
            // but make sure we hide it from display.
            if (!found && target) {

              // Actually clone this node and replace it in the original
              // layer if needed
              if (target.parentNode && target.cloneNode) {
                var clone = target.cloneNode(true);
                target.parentNode.replaceChild(clone, target);
                target.swapNode = clone; // save for restore later
              }

              // Create a holding pen if needed for these views...
              var pen = SC.touchHoldingPen;
              if (!pen) {
                pen = SC.touchHoldingPen = document.createElement('div');
                pen.style.display = 'none';
                document.body.appendChild(pen);
              }

              // move element back into document...
              pen.appendChild(target);

              // ...and save the element to be garbage collected on touchEnd.
              touches[touch]._rescuedElement = target;
            }
          }
        }
      };
    SC.RunLoop.prototype.endRunLoop = patch;
  },

  /**
    Cleans up the additional transition event listeners.

    NOTE: requires that SC.RootResponser.responder.transitionendEventName
    has been determined.

    @returns {void}
  */
  cleanUpTransitionListeners: function () {
    var actualEventName = SC.platform.transitionendEventName,
      domPrefix = SC.browser.domPrefix,
      lowerDomPrefix = domPrefix.toLowerCase(),
      variation1 = lowerDomPrefix + 'transitionend',
      variation2 = lowerDomPrefix + 'TransitionEnd',
      variation3 = domPrefix + 'TransitionEnd';

    // Once the actual event name is determined, simply remove all the extras.
    // This should prevent any problems with browsers that fire multiple events.
    ['transitionend', variation1, variation2, variation3].forEach(function (keyName) {
      if (keyName !== actualEventName) {
        SC.Event.remove(document, keyName, this, this[keyName]);
        this[keyName] = null;
    }
    }, this);
  },

  /**
    Cleans up the additional animation event listeners.

    NOTE: requires that SC.RootResponser.responder.animationstartEventName,
    SC.RootResponser.responder.animationendEventName and
    SC.RootResponser.responder.animationiterationEventName have been
    determined.

    @returns {void}
  */
  cleanUpAnimationListeners: function () {
    var domPrefix = SC.browser.domPrefix,
      lowerDomPrefix = domPrefix.toLowerCase(),
      actualEventName = SC.platform.animationendEventName,
      variation1 = lowerDomPrefix + 'animationend',
      variation2 = lowerDomPrefix + 'AnimationEnd',
      variation3 = domPrefix + 'AnimationEnd';

    // Once the actual event name is determined, simply remove all the extras.
    // This should prevent any problems with browsers that fire multiple events.
    ['animationend', variation1, variation2, variation3].forEach(function (keyName) {
      if (keyName !== actualEventName) {
        SC.Event.remove(document, keyName, this, this[keyName]);
        this[keyName] = null;
    }
    }, this);

    actualEventName = SC.platform.animationiterationEventName;
    variation1 = lowerDomPrefix + 'animationiteration';
    variation2 = lowerDomPrefix + 'AnimationIteration';
    variation3 = domPrefix + 'AnimationIteration';
    ['animationiteration', variation1, variation2, variation3].forEach(function (keyName) {
      if (keyName !== actualEventName) {
        SC.Event.remove(document, keyName, this, this[keyName]);
        this[keyName] = null;
      }
    }, this);

    actualEventName = SC.platform.animationstartEventName;
    variation1 = lowerDomPrefix + 'animationstart';
    variation2 = lowerDomPrefix + 'AnimationStart';
    variation3 = domPrefix + 'AnimationStart';
    ['animationstart', variation1, variation2, variation3].forEach(function (keyName) {
      if (keyName !== actualEventName) {
        SC.Event.remove(document, keyName, this, this[keyName]);
        this[keyName] = null;
      }
    }, this);
  },

  // ...........................................................................
  // TOUCH SUPPORT
  //

  /**
    @private
    A map from views to internal touch entries.

    Note: the touch entries themselves also reference the views.
  */
  _touchedViews: {},

  /**
    @private
    A map from internal touch ids to the touch entries themselves.

    The touch entry ids currently come from the touch event's identifier.
  */
  _touches: {},

  /**
    Returns the touches that are registered to the specified view or responder; undefined if none.

    When views receive a touch event, they have the option to subscribe to it.
    They are then mapped to touch events and vice-versa. This returns touches mapped to the view.

    This method is also available on SC.Touch objects, and you will usually call it from there.
  */
  touchesForView: function(view) {
    if (this._touchedViews[SC.guidFor(view)]) {
      return this._touchedViews[SC.guidFor(view)].touches;
    }
  },

  /**
    Computes a hash with x, y, and d (distance) properties, containing the average position
    of all touches, and the average distance of all touches from that average. This is useful
    for implementing scaling.

    This method is also available on SC.Touch objects, and you will usually call it from there.

    @param {SC.View} view The view whose touches should be averaged.
    @param {SC.Touch} additionalTouch This method uses touchesForView; if you call it from
        touchStart, that touch will not yet be included in touchesForView. To accommodate this,
        you should pass the view to this method (or pass YES to SC.Touch#averagedTouchesForView's
        `addSelf` argument).
  */
  averagedTouchesForView: function(view, additionalTouch) {
    var t = this.touchesForView(view),
      len, averaged, additionalTouchIsDuplicate;

    // Each view gets its own cached average touches object for performance.
    averaged = view._scrr_averagedTouches || (view._scrr_averagedTouches = {});

    // FAST PATH: no touches to track.
    if ((!t || t.length === 0) && !additionalTouch) {
      averaged.x = 0;
      averaged.y = 0;
      averaged.d = 0;
      averaged.velocityX = 0;
      averaged.velocityY = 0;

    // Otherwise, average the touches.
    } else {
      // Cache the array object used by this method. (Cleared at the end to prevent memory leaks.)
      var touches = this._averagedTouches_touches || (this._averagedTouches_touches = []);

      // copy touches into array
      if (t) {
        var i;
        len = t.length;
        for(i = 0; i < len; i++) {
          touches.push(t[i]);
          if (additionalTouch && t[i] === additionalTouch) additionalTouchIsDuplicate = YES;
        }
      }

      // Add additionalTouch if present and not duplicated.
      if (additionalTouch && !additionalTouchIsDuplicate) touches.push(additionalTouch);

      // Calculate the average.
      SC.Touch.averagedTouch(touches, averaged);

      // Clear the touches array to prevent touch object leaks.
      touches.length = 0;
    }

    return averaged;
  },

  assignTouch: function(touch, view) {
    // sanity-check
    if (touch.hasEnded) throw new Error("Attempt to assign a touch that is already finished.");

    // Fast path, the touch is already assigned to the view.
    if (touch.view === view) return;

    // unassign from old view if necessary
    if (touch.view) {
      this.unassignTouch(touch);
    }

    // create view entry if needed
    if (!this._touchedViews[SC.guidFor(view)]) {
      this._touchedViews[SC.guidFor(view)] = {
        view: view,
        touches: SC.CoreSet.create([]),
        touchCount: 0
      };
      view.set("hasTouch", YES);
    }

    // add touch
    touch.view = view;
    this._touchedViews[SC.guidFor(view)].touches.add(touch);
    this._touchedViews[SC.guidFor(view)].touchCount++;
  },

  unassignTouch: function(touch) {
    // find view entry
    var view, viewEntry;

    // Fast path, the touch is not assigned to a view.
    if (!touch.view) return; // touch.view should===touch.touchResponder eventually :)

    // get view
    view = touch.view;

    // get view entry
    viewEntry = this._touchedViews[SC.guidFor(view)];
    if (viewEntry) {
      viewEntry.touches.remove(touch);
      viewEntry.touchCount--;

      // remove view entry if needed
      if (viewEntry.touchCount < 1) {
        view.set("hasTouch", NO);
        viewEntry.view = null;
        delete this._touchedViews[SC.guidFor(view)];
      }
    }

    // clear view
    touch.view = undefined;
  },

  _flushQueuedTouchResponder: function(){
    if (this._queuedTouchResponder) {
      var queued = this._queuedTouchResponder;
      this._queuedTouchResponder = null;
      this.makeTouchResponder.apply(this, queued);
    }
  },

  /**
    This method attempts to change the responder for a particular touch. The touch's responder is the
    view which will receive touch events for that touch.

    You will usually not call this method directly, instead calling one of the convenience methods on
    the touch itself. See documentation for SC.Touch for more.

    Possible gotchas:

    - Because this method must search for a view which implements touchStart (without returning NO),
      touchStart is called on the new responder before touchCancelled is called on the old one.
    - While a touch exposes its current responder at `touchResponder` and any previous stacked one at
      `nextTouchResponder`, their relationship is ad hoc and arbitrary, and so are not chained by
      `nextResponder` like in a standard responder chain. To query the touch's current responder stack
      (or, though it's not recommended, change it), check touch.touchResponders.

    @param {SC.Touch} touch
    @param {SC.Responder} responder The view to assign to the touch. (It, or if bubbling then an ancestor,
      must implement touchStart.)
    @param {Boolean} shouldStack Whether the new responder should replace the old one, or stack with it.
      Stacked responders are easy to revert via `SC.Touch#restoreLastTouchResponder`.
    @param {Boolean|SC.Responder} bubblesTo If YES, will attempt to find a `touchStart` responder up the
      responder chain. If NO or undefined, will only check the passed responder. If you pass a responder
      for this argument, the attempt will bubble until it reaches the passed responder, allowing you to
      restrict the bubbling to a portion of the responder chain. ((Note that this responder will not be
      given an opportunity to respond to the event.)
    @returns {Boolean} Whether a valid touch responder was found and assigned.
  */
  makeTouchResponder: function(touch, responder, shouldStack, bubblesTo) {
    // In certain cases (SC.Gesture being one), we have to call makeTouchResponder
    // from inside makeTouchResponder so we queue it up here.
    if (this._isMakingTouchResponder) {
      this._queuedTouchResponder = [touch, responder, shouldStack, bubblesTo];
      return YES; // um?
    }
    this._isMakingTouchResponder = YES;

    var stack = touch.touchResponders, touchesForView;

    // find the actual responder (if any, I suppose)
    // note that the pane's sendEvent function is slightly clever:
    // if the target is already touch responder, it will just return it without calling touchStart
    // we must do the same.
    if (touch.touchResponder === responder) {
      this._isMakingTouchResponder = NO;
      this._flushQueuedTouchResponder();
      return YES; // more um
    }

    // send touchStart
    // get the target pane
    var pane;
    if (responder) pane = responder.get('pane') ;
    else pane = this.get('keyPane') || this.get('mainPane') ;

    // if the responder is not already in the stack...
    if (stack.indexOf(responder) < 0) {

      // if we need to go up the view chain, do so via SC.Pane#sendEvent.
      if (bubblesTo) {
        // if we found a valid pane, send the event to it
        try {
          responder = pane ? pane.sendEvent("touchStart", touch, responder, bubblesTo) : null ;
        } catch (e) {
          SC.Logger.error("Error in touchStart: " + e);
          responder = null;
        }
      } else {
        // If the responder doesn't currently have a touch, or it does but it accepts multitouch, test it. Otherwise it's cool.
        if (responder && ((responder.get ? responder.get("acceptsMultitouch") : responder.acceptsMultitouch) || !responder.hasTouch)) {
          // If it doesn't respond to touchStart, it's no good.
          if (!responder.respondsTo("touchStart")) {
            responder = null;
          }
          // If it returns NO from touchStart, it's no good. Otherwise it's cool.
          else if (responder.touchStart(touch) === NO) {
            responder = null;
          }
        }
      }
    }

    // if the item is in the stack, we will go to it (whether shouldStack is true or not)
    // as it is already stacked
    if (!shouldStack || (stack.indexOf(responder) > -1 && stack[stack.length - 1] !== responder)) {
      // first, we should unassign the touch. Note that we only do this IF WE ARE removing
      // the current touch responder. Otherwise we cause all sorts of headaches; why? Because,
      // if we are not (suppose, for instance, that it is stacked), then the touch does not
      // get passed back to the touch responder-- even while it continues to get events because
      // the touchResponder is still set!
      this.unassignTouch(touch);

      // pop all other items
      var idx = stack.length - 1, last = stack[idx];
      while (last && last !== responder) {
        // unassign the touch
        touchesForView = this.touchesForView(last); // won't even exist if there are no touches

        // send touchCancelled (or, don't, if the view doesn't accept multitouch and it is not the last touch)
        if ((last.get ? last.get("acceptsMultitouch") : last.acceptsMultitouch) || !touchesForView) {
          if (last.touchCancelled) last.touchCancelled(touch);
        }

        // go to next (if < 0, it will be undefined, so lovely)
        idx--;
        last = stack[idx];

        // update responders (for consistency)
        stack.pop();

        touch.touchResponder = stack[idx];
        touch.nextTouchResponder = stack[idx - 1];
      }

    }

    // now that we've popped off, we can push on
    if (responder) {
      this.assignTouch(touch, responder);

      // keep in mind, it could be one we popped off _to_ above...
      if (responder !== touch.touchResponder) {
        stack.push(responder);

        // update responder helpers
        touch.touchResponder = responder;
        touch.nextTouchResponder = stack[stack.length - 2];
      }
    }

    // Unflag that this method is running, and flush the queue if any.
    this._isMakingTouchResponder = NO;
    this._flushQueuedTouchResponder(); // this may need to be &&'ed with the responder to give the correct return value...

    return !!responder;
  },

  /**
    Before the touchStart event is sent up the usual responder chain, the views along that same responder chain
    are given the opportunity to capture the touch event, preventing child views (including the target) from
    hearing about it. This of course proceeds in the opposite direction from a usual event bubbling, starting at
    the target's first ancestor and proceeding towards the target. This method implements the capture phase.

    If no view captures the touch, this method will return NO, and makeTouchResponder is then called for the
    target, proceeding with standard target-to-pane event bubbling for `touchStart`.

    For an example of captureTouch in action, see SC.ScrollView's touch handling, which by default captures the
    touch and holds it for 150ms to allow it to determine whether the user is tapping or scrolling.

    You will usually not call this method yourself, and if you do, you should call the corresponding convenience
    method on the touch itself.

    @param {SC.Touch} touch The touch to offer up for capture.
    @param {?SC.Responder} startingPoint The view whose children should be given an opportunity to capture
      the event. (The starting point itself is not asked.)
    @param {Boolean} shouldStack Whether any capturing responder should stack with existing responders.
      Stacked responders are easy to revert via `SC.Touch#restoreLastTouchResponder`.

    @returns {Boolean} Whether or not the touch was captured. If it was not, you should pass it to
      `makeTouchResponder` for standard event bubbling.
  */
  captureTouch: function(touch, startingPoint, shouldStack) {
    if (!startingPoint) startingPoint = this;

    var target = touch.targetView, view = target,
        chain = [], idx, len;

    //@if (debug)
    if (SC.LOG_TOUCH_EVENTS) {
      SC.Logger.info('  -- Received one touch on %@'.fmt(target.toString()));
    }
    //@endif
    // Generate the captureTouch responder chain by working backwards from the target
    // to the starting point. (Don't include the starting point.)
    while (view && (view !== startingPoint)) {
      chain.unshift(view);
      view = view.get('nextResponder');
    }

    // work down the chain
    for (len = chain.length, idx = 0; idx < len; idx++) {
      view = chain[idx];
      //@if (debug)
      if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('  -- Checking %@ for captureTouch response…'.fmt(view.toString()));
      //@endif

      // see if it captured the touch
      if (view.tryToPerform('captureTouch', touch)) {
        //@if (debug)
        if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('   -- Making %@ touch responder because it returns YES to captureTouch'.fmt(view.toString()));
        //@endif

        // if so, make it the touch's responder
        this.makeTouchResponder(touch, view, shouldStack, startingPoint); // (touch, target, should stack, bubbles back to startingPoint, or all the way up.)
        return YES; // and that's all we need
      }
    }

    //@if (debug)
    if (SC.LOG_TOUCH_EVENTS) SC.Logger.info("   -- Didn't find a view that returned YES to captureTouch.");
    //@endif

    return NO;
  },

  //@if(debug)
  /** @private
    Artificially calls endTouch for any touch which is no longer present. This is necessary because
    _sometimes_, WebKit ends up not sending endtouch.
  */
  endMissingTouches: function(presentTouches) {
    var idx, len = presentTouches.length, map = {}, end = [];

    // make a map of what touches _are_ present
    for (idx = 0; idx < len; idx++) {
      map[presentTouches[idx].identifier] = YES;
    }

    // check if any of the touches we have recorded are NOT present
    for (idx in this._touches) {
      var id = this._touches[idx].identifier;
      if (!map[id]) end.push(this._touches[idx]);
    }

    // end said touches
    if (end.length) {
      console.warn('Ending missing touches: ' + end.toString());
    }
    for (idx = 0, len = end.length; idx < len; idx++) {
      this.endTouch(end[idx]);
      this.finishTouch(end[idx]);
    }
  },
  //@endif

  _touchCount: 0,

  /** @private
    Ends a specific touch (for a bit, at least). This does not "finish" a touch; it merely calls
    touchEnd, touchCancelled, etc. A re-dispatch (through recapture or makeTouchResponder) will terminate
    the process; it would have to be restarted separately, through touch.end().
  */
  endTouch: function(touchEntry, action, evt) {
    if (!action) { action = "touchEnd"; }

    var responderIdx, responders, responder, originalResponder;

    // unassign
    this.unassignTouch(touchEntry);

    // call end for all items in chain
    if (touchEntry.touchResponder) {
      originalResponder = touchEntry.touchResponder;

      responders = touchEntry.touchResponders;
      responderIdx = responders.length - 1;
      responder = responders[responderIdx];
      while (responder) {
        if (responder[action]) { responder[action](touchEntry, evt); }

        // check to see if the responder changed, and stop immediately if so.
        if (touchEntry.touchResponder !== originalResponder) { break; }

        // next
        responderIdx--;
        responder = responders[responderIdx];
        action = "touchCancelled"; // any further ones receive cancelled
      }
    }
  },

  /**
    @private
    "Finishes" a touch. That is, it eradicates it from our touch entries and removes all responder, etc. properties.
  */
  finishTouch: function(touch) {
    // ensure the touch is indeed unassigned.
    this.unassignTouch(touch);

    // If we rescued this touch's initial element, we should remove it
    // from the DOM and garbage collect now. See setup() for an
    // explanation of this bug/workaround.
    var elem = touch._rescuedElement;
    if (elem) {
      if (elem.swapNode && elem.swapNode.parentNode) {
        elem.swapNode.parentNode.replaceChild(elem, elem.swapNode);
      } else if (elem.parentNode === SC.touchHoldingPen) {
        SC.touchHoldingPen.removeChild(elem);
      }
      delete touch._rescuedElement;
      elem.swapNode = null;
      elem = null;
    }

    // clear responders (just to be thorough)
    touch.touchResponders = null;
    touch.touchResponder = null;
    touch.nextTouchResponder = null;
    touch.hasEnded = YES;

    // and remove from our set
    if (this._touches[touch.identifier]) delete this._touches[touch.identifier];
  },

  /** @private
    Called when the user touches their finger to the screen. This method
    dispatches the touchstart event to the appropriate view.

    We may receive a touchstart event for each touch, or we may receive a
    single touchstart event with multiple touches, so we may have to dispatch
    events to multiple views.

    @param {Event} evt the event
    @returns {Boolean}
  */
  touchstart: function(evt) {
    // Starting iOS5 touch events are handled by textfields.
    // As a workaround just let the browser to use the default behavior.
    if(this.ignoreTouchHandle(evt)) return YES;

    var hidingTouchIntercept = NO;

    SC.run(function() {
      //@if(debug)
      // When using breakpoints on touch start, we will lose the end touch event.
      this.endMissingTouches(evt.touches);
      //@endif

      // loop through changed touches, calling touchStart, etc.
      var changedTouches = evt.changedTouches,
          len = changedTouches.length,
          idx,
          touch, touchEntry;

      // prepare event for touch mapping.
      evt.touchContext = this;

      // Loop through each touch we received in this event
      for (idx = 0; idx < len; idx++) {
        touch = changedTouches[idx];

        // Create an SC.Touch instance for every touch.
        touchEntry = SC.Touch.create(touch, this);

        // skip the touch if there was no target
        if (!touchEntry.targetView) continue;

        // account for hidden touch intercept (passing through touches, etc.)
        if (touchEntry.hidesTouchIntercept) hidingTouchIntercept = YES;

        // set timestamp
        touchEntry.timeStamp = evt.timeStamp;

        // Store the SC.Touch object. We use the identifier property (provided
        // by the browser) to disambiguate between touches. These will be used
        // later to determine if the touches have changed.
        this._touches[touch.identifier] = touchEntry;

        // set the event (so default action, etc. can be stopped)
        touchEntry.event = evt; // will be unset momentarily

        // First we allow any view in the responder chain to capture the touch, before triggering the standard touchStart
        // handler chain.
        var captured = this.captureTouch(touchEntry, this);
        if (!captured) this.makeTouchResponder(touchEntry, touchEntry.targetView, NO, YES); // (touch, target, shouldn't stack, bubbles all the way)

        // Unset the reference to the original event so we can garbage collect.
        touchEntry.event = null;
      }

      evt.touchContext = null;
    }, this);

    // hack for text fields
    if (hidingTouchIntercept) {
      return YES;
    }

    return evt.hasCustomEventHandling;
  },

  /**
    @private
    used to keep track of when a specific type of touch event was last handled, to see if it needs to be re-handled
  */
  touchmove: function(evt) {
    // Starting iOS5 touch events are handled by textfields.
    // As a workaround just let the browser to use the default behavior.
    if(this.ignoreTouchHandle(evt)) return YES;

    SC.run(function() {
      // pretty much all we gotta do is update touches, and figure out which views need updating.
      var touches = evt.changedTouches, touch, touchEntry,
          idx, len = touches.length, view, changedTouches, viewTouches, firstTouch,
          changedViews = {}, guid, hidingTouchIntercept = NO;

      if (this._drag) {
        touch = SC.Touch.create(evt.changedTouches[0], this);
        this._drag.tryToPerform('mouseDragged', touch);
      }

      // figure out what views had touches changed, and update our internal touch objects
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];

        // get our touch
        touchEntry = this._touches[touch.identifier];

        // we may have no touch entry; this can happen if somehow the touch came to a non-SC area.
        if (!touchEntry) {
          continue;
        }

        if (touchEntry.hidesTouchIntercept) hidingTouchIntercept = YES;

        // update touch velocity (moving average)
        var duration = evt.timeStamp - touchEntry.timeStamp,
          velocityLambda, latestXVelocity, latestYVelocity;
        // Given uneven timing between events, we should give less weight to shorter (less accurate)
        // events, with no consideration at all given zero-time events.
        if (duration !== 0) {
          // Lambda (how heavily we're weighting the latest number)
          velocityLambda = Math.min(1, duration / 80);
          // X
          latestXVelocity = (touch.pageX - touchEntry.pageX) / duration;
          touchEntry.velocityX = (1.0 - velocityLambda) * touchEntry.velocityX + velocityLambda * (latestXVelocity);
          // Y
          latestYVelocity = (touch.pageY - touchEntry.pageY) / duration;
          touchEntry.velocityY = (1.0 - velocityLambda) * touchEntry.velocityY + velocityLambda * (latestYVelocity);
        }

        // update touch position et al.
        touchEntry.pageX = touch.pageX;
        touchEntry.pageY = touch.pageY;
        touchEntry.clientX = touch.clientX;
        touchEntry.clientY = touch.clientY;
        touchEntry.screenX = touch.screenX;
        touchEntry.screenY = touch.screenY;
        touchEntry.timeStamp = evt.timeStamp;
        touchEntry.type = evt.type;
        touchEntry.event = evt;

        // if the touch entry has a view
        if (touchEntry.touchResponder) {
          view = touchEntry.touchResponder;

          guid = SC.guidFor(view);
          // create a view entry
          if (!changedViews[guid]) changedViews[guid] = { "view": view, "touches": [] };

          // add touch
          changedViews[guid].touches.push(touchEntry);
        }
      }

      // HACK: DISABLE OTHER TOUCH DRAGS WHILE MESSING WITH TEXT FIELDS
      if (hidingTouchIntercept) {
        evt.allowDefault();
        return YES;
      }

      // loop through changed views and send events
      for (idx in changedViews) {
        // get info
        view = changedViews[idx].view;
        changedTouches = changedViews[idx].touches;

        // prepare event; note that views often won't use this method anyway (they'll call touchesForView instead)
        evt.viewChangedTouches = changedTouches;

        // the first VIEW touch should be the touch info sent
        viewTouches = this.touchesForView(view);
        firstTouch = viewTouches.firstObject();

        // Load the event up with data from the first touch. THIS IS FOR CONVENIENCE ONLY in cases where the developer
        // only cares about one touch.
        evt.pageX = firstTouch.pageX;
        evt.pageY = firstTouch.pageY;
        evt.clientX = firstTouch.clientX;
        evt.clientY = firstTouch.clientY;
        evt.screenX = firstTouch.screenX;
        evt.screenY = firstTouch.screenY;
        evt.startX = firstTouch.startX;
        evt.startY = firstTouch.startY;
        evt.velocityX = firstTouch.velocityX;
        evt.velocityY = firstTouch.velocityY;
        evt.touchContext = this; // Injects the root responder so it can call e.g. `touchesForView`.

        // Give the view a chance to handle touchesDragged. (Don't bubble; viewTouches is view-specific.)
        view.tryToPerform("touchesDragged", evt, viewTouches);
      }

      // clear references to event
      touches = evt.changedTouches;
      len = touches.length;
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];
        touchEntry = this._touches[touch.identifier];
        if (touchEntry) touchEntry.event = null;
      }
      evt.touchContext = null;
      evt.viewChangedTouches = null;
    }, this);

    return evt.hasCustomEventHandling;
  },

  touchend: function(evt) {
    var hidesTouchIntercept = NO;

    // Starting iOS5 touch events are handled by textfields.
    // As a workaround just let the browser to use the default behavior.
    if(this.ignoreTouchHandle(evt)) return YES;

    SC.run(function() {
      var touches = evt.changedTouches, touch, touchEntry,
          idx, len = touches.length,
          action = evt.isCancel ? "touchCancelled" : "touchEnd";

      for (idx = 0; idx < len; idx++) {
        //get touch+entry
        touch = touches[idx];
        touch.type = 'touchend';
        touchEntry = this._touches[touch.identifier];

        // check if there is an entry
        if (!touchEntry) continue;

        // update touch velocity (moving average)
        var duration = evt.timeStamp - touchEntry.timeStamp,
          velocityLambda, latestXVelocity, latestYVelocity;
        // Given uneven timing between events, we should give less weight to shorter (less accurate)
        // events, with no consideration at all given zero-time events.
        if (duration !== 0) {
          // Lambda (how heavily we're weighting the latest number)
          velocityLambda = Math.min(1, duration / 80);
          // X
          latestXVelocity = (touch.pageX - touchEntry.pageX) / duration;
          touchEntry.velocityX = (1.0 - velocityLambda) * touchEntry.velocityX + velocityLambda * (latestXVelocity);
          // Y
          latestYVelocity = (touch.pageY - touchEntry.pageY) / duration;
          touchEntry.velocityY = (1.0 - velocityLambda) * touchEntry.velocityY + velocityLambda * (latestYVelocity);
        }

        // update touch position et al.
        touchEntry.timeStamp = evt.timeStamp;
        touchEntry.pageX = touch.pageX;
        touchEntry.pageY = touch.pageY;
        touchEntry.clientX = touch.clientX;
        touchEntry.clientY = touch.clientY;
        touchEntry.screenX = touch.screenX;
        touchEntry.screenY = touch.screenY;
        touchEntry.type = 'touchend';
        touchEntry.event = evt;

        //@if (debug)
        if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('-- Received touch end');
        //@endif
        if (touchEntry.hidesTouchIntercept) {
          touchEntry.unhideTouchIntercept();
          hidesTouchIntercept = YES;
        }

        if (this._drag) {
          this._drag.tryToPerform('mouseUp', touch) ;
          this._drag = null ;
        }

        // unassign
        this.endTouch(touchEntry, action, evt);
        this.finishTouch(touchEntry);
      }
    }, this);


    // for text fields
    if (hidesTouchIntercept) {
      return YES;
    }

    return evt.hasCustomEventHandling;
  },

  /** @private
    Handle touch cancel event.  Works just like cancelling a touch for any other reason.
    touchend handles it as a special case (sending cancel instead of end if needed).
  */
  touchcancel: function(evt) {
    evt.isCancel = YES;
    this.touchend(evt);
  },

  /** @private
     Ignore Touch events on textfields and links. starting iOS 5 textfields
     get touch events. Textfields just need to get the default focus action.
  */
  ignoreTouchHandle: function(evt) {
    if(SC.browser.isMobileSafari){
      var tag = evt.target.tagName;
      if(tag==="INPUT" || tag==="TEXTAREA" || tag==="A" || tag==="SELECT"){
        evt.allowDefault();
        return YES;
      }
    }
    return NO;
  },

  // ..........................................................
  // KEYBOARD HANDLING
  //


  /**
    Invoked on a keyDown event that is not handled by any actual value.  This
    will get the key equivalent string and then walk down the keyPane, then
    the focusedPane, then the mainPane, looking for someone to handle it.
    Note that this will walk DOWN the view hierarchy, not up it like most.

    @returns {Object} Object that handled evet or null
  */
  attemptKeyEquivalent: function(evt) {
    var ret = null ;

    // keystring is a method name representing the keys pressed (i.e
    // 'alt_shift_escape')
    var keystring = evt.commandCodes()[0];

    // couldn't build a keystring for this key event, nothing to do
    if (!keystring) return NO;

    var menuPane = this.get('menuPane'),
        keyPane  = this.get('keyPane'),
        mainPane = this.get('mainPane');

    if (menuPane) {
      ret = menuPane.performKeyEquivalent(keystring, evt) ;
      if (ret) return ret;
    }

    // Try the keyPane.  If it's modal, then try the equivalent there but on
    // nobody else.
    if (keyPane) {
      ret = keyPane.performKeyEquivalent(keystring, evt) ;
      if (ret || keyPane.get('isModal')) return ret ;
    }

    // if not, then try the main pane
    if (!ret && mainPane && (mainPane!==keyPane)) {
      ret = mainPane.performKeyEquivalent(keystring, evt);
      if (ret || mainPane.get('isModal')) return ret ;
    }

    return ret ;
  },

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
    if (evt.altKey !== m.alt) {
      m.alt = evt.altKey;
      changed = true;
    }

    if (evt.ctrlKey !== m.ctrl) {
      m.ctrl = evt.ctrlKey;
      changed = true;
    }

    if (evt.shiftKey !== m.shift) {
      m.shift = evt.shiftKey;
      changed = true;
    }
    evt.modifiers = m; // save on event

    return (changed) ? (this.sendEvent('flagsChanged', evt) ? evt.hasCustomEventHandling : YES) : YES ;
  },

  /** @private
    Determines if the keyDown event is a nonprintable or function key. These
    kinds of events are processed as keyboard shortcuts.  If no shortcut
    handles the event, then it will be sent as a regular keyDown event.
    This function is only valid when called with a keydown event.
  */
  _isFunctionOrNonPrintableKey: function(evt) {
    return !!(evt.altKey || evt.ctrlKey || evt.metaKey || SC.FUNCTION_KEYS[evt.which]);
  },

  /** @private
    Determines if the event simply reflects a modifier key change.  These
    events may generate a flagsChanged event, but are otherwise ignored.
  */
  _isModifierKey: function(evt) {
    return !!SC.MODIFIER_KEYS[evt.charCode];
  },

   /**
     @private
     Determines if the key is printable (and therefore should be dispatched from keypress).
     Some browsers send backspace, tab, enter, and escape on keypress, so we want to
     explicitly ignore those here.

     @param {KeyboardEvent} evt keypress event
     @returns {Boolean}
   */
  _isPrintableKey: function (evt) {
    return ((evt.originalEvent.which === undefined || evt.originalEvent.which > 0) &&
      !(evt.which === 8 || evt.which === 9 || evt.which === 13 || evt.which === 27));
  },

  /** @private
    The keydown event occurs whenever the physically depressed key changes.
    This event is used to deliver the flagsChanged event and to with function
    keys and keyboard shortcuts.

    References:
        http://www.quirksmode.org/js/keys.html
        https://developer.mozilla.org/en/DOM/KeyboardEvent
        http://msdn.microsoft.com/library/ff974342.aspx
  */
  keydown: function(evt) {
    if (SC.none(evt)) return YES;
    var keyCode = evt.keyCode;
    // Fix for IME input (japanese, mandarin).
    // If the KeyCode is 229 wait for the keyup and
    // trigger a keyDown if it is is enter onKeyup.
    if (keyCode===229){
      this._IMEInputON = YES;
      return this.sendEvent('keyDown', evt);
    }

    // If user presses the escape key while we are in the middle of a
    // drag operation, cancel the drag operation and handle the event.
    if (keyCode === 27 && this._drag) {
      this._drag.cancelDrag(evt);
      this._drag = null;
      this._mouseDownView = null;
      return YES;
    }

    // Firefox does NOT handle delete here...
    if (SC.browser.isMozilla && (evt.which === 8)) return true ;

    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this
    // is only a modifier change
    var ret = this._handleModifierChanges(evt),
        target = evt.target || evt.srcElement,
        forceBlock = (evt.which === 8) && !SC.allowsBackspaceToPreviousPage && (target === document.body);

    if (this._isModifierKey(evt)) return (forceBlock ? NO : ret);

    // if this is a function or non-printable key, try to use this as a key
    // equivalent.  Otherwise, send as a keyDown event so that the focused
    // responder can do something useful with the event.
    ret = YES ;
    if (this._isFunctionOrNonPrintableKey(evt)) {
      // otherwise, send as keyDown event.  If no one was interested in this
      // keyDown event (probably the case), just let the browser do its own
      // processing.
      ret = this.sendEvent('keyDown', evt) ;

      // attempt key equivalent if key not handled
      if (!ret) {
        SC.run(function () {
        ret = !this.attemptKeyEquivalent(evt) ;
        }, this);
      } else {
        ret = evt.hasCustomEventHandling ;
        if (ret) forceBlock = NO ; // code asked explicitly to let delete go
      }
    }

    return forceBlock ? NO : ret ;
  },

  /** @private
    The keypress event occurs after the user has typed something useful that
    the browser would like to insert.  Unlike keydown, the input codes here
    have been processed to reflect that actual text you might want to insert.

    Normally ignore any function or non-printable key events.  Otherwise, just
    trigger a keyDown.
  */
  keypress: function(evt) {
    // Firefox
    if (this._isFunctionOrNonPrintableKey(evt)) return YES;

    var ret,
        keyCode = evt.keyCode,
        charCode = evt.charCode;

    if ((charCode !== undefined && charCode === 0 && evt.keyCode !== 9)) return YES;
    // we only want to rethrow if this is a printable key so that we don't
    // duplicate the event sent in keydown when a modifier key is pressed.
    if (this._isPrintableKey(evt)) {
      return this.sendEvent('keyDown', evt) ? evt.hasCustomEventHandling : YES;
    }
  },

  keyup: function(evt) {
    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this is only a modifier change
    var ret = this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return ret;
    // Fix for IME input (japanese, mandarin).
    // If the KeyCode is 229 wait for the keyup and
    // trigger a keyDown if it is is enter onKeyup.
    if (this._IMEInputON && evt.keyCode===13){
      evt.isIMEInput = YES;
      this.sendEvent('keyDown', evt);
      this._IMEInputON = NO;
    }
    return this.sendEvent('keyUp', evt) ? evt.hasCustomEventHandling:YES;
  },

  /**
    IE's default behavior to blur textfields and other controls can only be
    blocked by returning NO to this event. However we don't want to block
    its default behavior otherwise textfields won't lose focus by clicking on
    an empty area as it's expected. If you want to block IE from blurring another
    control set blockIEDeactivate to true on the specific view in which you
    want to avoid this. Think of an autocomplete menu, you want to click on
    the menu but don't loose focus.
  */
  beforedeactivate: function(evt) {
    var toElement = evt.toElement;
    if (toElement && toElement.tagName && toElement.tagName!=="IFRAME") {
      var view = SC.viewFor(toElement);
      //The following line is necessary to allow/block text selection for IE,
      // in combination with the selectstart event.
      if (view && view.get('blocksIEDeactivate')) return NO;
    }
    return YES;
  },

  // ..........................................................
  // MOUSE HANDLING
  //

  mousedown: function(evt) {
    // First, save the click count. The click count resets if the mouse down
    // event occurs more than 250 ms later than the mouse up event or more
    // than 8 pixels away from the mouse down event or if the button used is different.
    this._clickCount += 1;

    var view = this.targetViewForEvent(evt);

    view = this._mouseDownView = this.sendEvent('mouseDown', evt, view) ;
    if (view && view.respondsTo('mouseDragged')) this._mouseCanDrag = YES ;

    // Determine if any views took responsibility for the event. If so, save that information so we
    // can prevent the next click event we receive from propagating to the browser.
    var ret = view ? evt.hasCustomEventHandling : YES;
    this._lastMouseDownCustomHandling = ret;

    // If it has been too long since the last click, the handler has changed or the mouse has moved
    // too far, reset the click count.
    if (!this._lastMouseUpAt || this._lastMouseDownView !== this._mouseDownView || ((Date.now() - this._lastMouseUpAt) > 250)) {
      this._clickCount = 1;
    } else {
      var deltaX = this._lastMouseDownX - evt.clientX,
          deltaY = this._lastMouseDownY - evt.clientY,
          distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY) ;

      if (distance > 8.0) this._clickCount = 1;
    }
    evt.clickCount = this._clickCount;

    // Cache the handler and point of the last mouse down in order to determine whether a successive mouse down should
    // still increment the click count.
    this._lastMouseDownView = this._mouseDownView;
    this._lastMouseDownX = evt.clientX;
    this._lastMouseDownY = evt.clientY;

    return ret;
  },

  /**
    mouseUp only gets delivered to the view that handled the mouseDown evt.
    we also handle click and double click notifications through here to
    ensure consistant delivery.  Note that if mouseDownView is not
    implemented, then no mouseUp event will be sent, but a click will be
    sent.
  */
  mouseup: function(evt) {
    var clickOrDoubleClickDidTrigger = NO,
      dragView = this._drag,
      handler = null;

    if (dragView) {
      SC.run(function () {
        dragView.tryToPerform('mouseUp', evt);
      });
    } else {
      var view = this._mouseDownView,
        targetView = this.targetViewForEvent(evt);

      // record click count.
      evt.clickCount = this._clickCount ;

      // attempt the mouseup call only if there's a target.
      // don't want a mouseup going to anyone unless they handled the mousedown...
      if (view) {
        handler = this.sendEvent('mouseUp', evt, view) ;

        // try doubleClick
        if (!handler && this._clickCount === 2) {
          handler = this.sendEvent('doubleClick', evt, view) ;
          clickOrDoubleClickDidTrigger = YES;
        }

        // try single click
        if (!handler) {
          handler = this.sendEvent('click', evt, view) ;
          clickOrDoubleClickDidTrigger = YES;
        }
      }

      // try whoever's under the mouse if we haven't handle the mouse up yet
      if (!handler && !clickOrDoubleClickDidTrigger) {

        // try doubleClick
        if (this._clickCount === 2) {
          handler = this.sendEvent('doubleClick', evt, targetView);
        }

        // try singleClick
        if (!handler) {
          handler = this.sendEvent('click', evt, targetView) ;
        }
      }
    }

    // cleanup
    this._mouseCanDrag = NO;
    this._mouseDownView = this._drag = null;

    // Save timestamp of mouseup at last possible moment.
    // (This is used to calculate double click events)
    this._lastMouseUpAt = Date.now() ;

    // Determine if any views took responsibility for the
    // event. If so, save that information so we can prevent
    // the next click event we receive from propagating to the browser.
    var ret = handler ? evt.hasCustomEventHandling : YES;
    this._lastMouseUpCustomHandling = ret;

    return ret;
  },

  /**
    Certain browsers ignore us overriding mouseup and mousedown events and
    still allow default behavior (such as navigating away when the user clicks
    on a link). To block default behavior, we store whether or not the last
    mouseup or mousedown events resulted in us calling preventDefault() or
    stopPropagation(), in which case we make the same calls on the click event.

    @param {Event} evt the click event
    @returns {Boolean} whether the event should be propagated to the browser
  */
   click: function(evt) {
    if (!this._lastMouseUpCustomHandling || !this._lastMouseDownCustomHandling) {
      var diff = Date.now() - (this._lastMouseUpAt || 0);
      if (diff > 250) { // should be single click event.
        var view = this.targetViewForEvent(evt);
        // single click event, fake mouseDown and mouseUp
        this.sendEvent('mouseDown', evt, view);
        this.sendEvent('mouseUp', evt, view)
      }
      evt.preventDefault();
      evt.stopPropagation();
      return NO;
    }

    return YES;
  },

  dblclick: function(evt){
    if (SC.browser.isIE8OrLower) {
      this._clickCount = 2;
      // this._onmouseup(evt);
      this.mouseup(evt);
    }
  },

  mousewheel: function(evt) {
    var view = this.targetViewForEvent(evt) ,
        handler = this.sendEvent('mouseWheel', evt, view) ;

    return (handler) ? evt.hasCustomEventHandling : YES ;
  },

  _lastHovered: null,

  /**
   This will send mouseEntered, mouseExited, mousedDragged and mouseMoved
   to the views you hover over.  To receive these events, you must implement
   the method. If any subviews implement them and return true, then you won't
   receive any notices.

   If there is a target mouseDown view, then mouse moved events will also
   trigger calls to mouseDragged.
  */
  mousemove: function(evt) {
    // When dragging an element out of the browser window, the event target is set to an
    // instance of Document in Firefox which lead to a crash in the SC#viewFor method.
    // To prevent this, we make sure the event target is an instance of Element.
    if (!(evt.target instanceof Element)) return;

    if (SC.browser.isIE) {
      if (this._lastMoveX === evt.clientX && this._lastMoveY === evt.clientY) return;
    }

    // We'll record the last positions in all browsers, in case a special pane
    // or some such UI absolutely needs this information.
    this._lastMoveX = evt.clientX;
    this._lastMoveY = evt.clientY;

    SC.run(function() {
      var dragView = this._drag;

       // make sure the view gets focus no matter what.  FF is inconsistent
       // about this.
      // this.focus();
       // only do mouse[Moved|Entered|Exited|Dragged] if not in a drag session
       // drags send their own events, e.g. drag[Moved|Entered|Exited]
      if (dragView) {
         //IE triggers mousemove at the same time as mousedown
         if(SC.browser.isIE){
           if (this._lastMouseDownX !== evt.clientX || this._lastMouseDownY !== evt.clientY) {
            dragView.tryToPerform('mouseDragged', evt);
           }
        } else {
          dragView.tryToPerform('mouseDragged', evt);
         }
       } else {
        var lh = this._lastHovered || [], nh = [], loc, len,
             view = this.targetViewForEvent(evt) ;

         // first collect all the responding view starting with the
         // target view from the given mouse move event
         while (view && (view !== this)) {
           nh.push(view);
           view = view.get('nextResponder');
         }
         // next exit views that are no longer part of the
         // responding chain
         for (loc=0, len=lh.length; loc < len; loc++) {
           view = lh[loc] ;
          if (nh.indexOf(view) === -1 && !view.isDestroyed) { // Usually we don't want to have to manually check isDestroyed, but in this case we're explicitly checking an out-of-date cache.
             view.tryToPerform('mouseExited', evt);
           }
         }
         // finally, either perform mouse moved or mouse entered depending on
         // whether a responding view was or was not part of the last
         // hovered views
         for (loc=0, len=nh.length; loc < len; loc++) {
           view = nh[loc];
           if (lh.indexOf(view) !== -1) {
             view.tryToPerform('mouseMoved', evt);
           } else {
             view.tryToPerform('mouseEntered', evt);
           }
         }
         // Keep track of the view that were last hovered
         this._lastHovered = nh;
         // also, if a mouseDownView exists, call the mouseDragged action, if
         // it exists.
         if (this._mouseDownView) {
           if(SC.browser.isIE){
             if (this._lastMouseDownX !== evt.clientX && this._lastMouseDownY !== evt.clientY) {
               this._mouseDownView.tryToPerform('mouseDragged', evt);
             }
           }
           else {
             this._mouseDownView.tryToPerform('mouseDragged', evt);
           }
         }
       }
    }, this);
  },

  /** @private */
  mouseleave: function(evt) {
    var lh = this._lastHovered || [], loc, len;

    for (loc=0, len=lh.length; loc < len; loc++) {
      lh[loc].tryToPerform('mouseExited', evt);
    }

    this._lastHovered = null;
  },

  // These event handlers prevent default file handling, and enable the dataDrag API.
  /** @private The dragenter event comes from the browser when a data-ful drag enters any element. */
  dragenter: function(evt) {
    SC.run(function() { this._dragenter(evt); }, this);
  },

  /** @private */
  _dragenter: function(evt) {
    if (!this._dragCounter) {
      this._dragCounter = 1;
    }
    else this._dragCounter++;
    return this._dragover(evt);
  },

  /** @private The dragleave event comes from the browser when a data-ful drag leaves any element. */
  dragleave: function(evt) {
    SC.run(function() { this._dragleave(evt); }, this);
  },

  /** @private */
  _dragleave: function(evt) {
    this._dragCounter--;
    var ret = this._dragover(evt);
    return ret;
  },
  /** @private
    Dragleave doesn't fire reliably in all browsers, so this method forces it (scheduled below). Note
    that, being scheduled via SC.Timer, this method is already in a run loop.
  */
  _forceDragLeave: function() {
    // Give it another runloop to ensure that we're not in the middle of a drag.
    this.invokeLast(function() {
      if (this._dragCounter === 0) return;
      this._dragCounter = 0;
      var evt = this._lastDraggedEvt;
      this._dragover(evt);
    });
  },

  /** @private This event fires continuously while the dataful drag is over the document. */
  dragover: function(evt) {
    SC.run(function() { this._dragover(evt); }, this);
  },

  /** @private */
  _dragover: function(evt) {
    // If it's a file being dragged, prevent the default (leaving the app and opening the file).
    if (evt.dataTransfer && evt.dataTransfer.types && (evt.dataTransfer.types.contains('Files') || evt.dataTransfer.types.contains('text/uri-list'))) {
      evt.preventDefault();
      evt.stopPropagation();
      // Set the default drag effect to 'none'. Views may reverse this if they wish.
      evt.dataTransfer.dropEffect = 'none';
    }

    // Walk the responder chain, alerting anyone that would like to know.
    var ld = this._lastDraggedOver || [], nd = [], loc, len,
        view = this.targetViewForEvent(evt);

    // Build the responder chain, starting with the view's target and (presumably) moving
    // up through parentViews to the pane.
    while (view && (view !== this)) {
      nd.push(view);
      view = view.get('nextResponder');
    }

    // Invalidate the force-drag-leave timer, if we have one set up.
    if (this._dragLeaveTimer) this._dragLeaveTimer.invalidate();

    // If this is our final drag event then we've left the document and everybody gets a
    // dataDragExited.
    if (this._dragCounter === 0) {
      for (loc = 0, len = nd.length; loc < len; loc++) {
        view = nd[loc];
        view.tryToPerform('dataDragExited', evt);
      }
      this._lastDraggedOver = this._lastDraggedEvt = this._dragLeaveTimer = null;
    }
    // Otherwise, we process the responder chain normally, ignoring dragleaves.
    // (We skip dragleave events because they are sent after the adjacent dragenter event; checking
    // through both stacks would result in views being exited, re-entered and re-exited each time.
    // As a consequence, views are left ignorant of a very small number of dragleave events; those
    // shouldn't end up being the crucial just-before-drop events, though, so they should be of no
    // consequence.)
    else if (evt.type !== 'dragleave') {
      // First, exit views that are no longer part of the responder chain, child to parent.
      for (loc = 0, len = ld.length; loc < len; loc++) {
        view = ld[loc];
        if (nd.indexOf(view) === -1) {
          view.tryToPerform('dataDragExited', evt);
        }
      }
      // Next, enter views that have just joined the responder chain, parent to child.
      for (loc = nd.length - 1; loc >= 0; loc--) {
        view = nd[loc];
        if (ld.indexOf(view) === -1) {
          view.tryToPerform('dataDragEntered', evt);
        }
      }
      // Finally, send hover events to everybody.
      for (loc = 0, len = nd.length; loc < len; loc++) {
        view = nd[loc];
        view.tryToPerform('dataDragHovered', evt);
      }
      this._lastDraggedOver = nd;
      this._lastDraggedEvt = evt;
      // For browsers that don't reliably call a dragleave for every dragenter, we have a timer fallback.
      this._dragLeaveTimer = SC.Timer.schedule({ target: this, action: '_forceDragLeave', interval: 300 });
    }
  },

  /** @private This event is called if the most recent dragover event returned with a non-"none" dropEffect. */
  drop: function(evt) {
    SC.run(function() { this._drop(evt); }, this);
  },

  /** @private */
  _drop: function(evt) {
    // If it's a file being dragged, prevent the default (leaving the app and opening the file).
    if (evt.dataTransfer && evt.dataTransfer.types && (evt.dataTransfer.types.contains('Files') || evt.dataTransfer.types.contains('text/uri-list'))) {
      evt.preventDefault();
      evt.stopPropagation();
      // Set the default drag effect to 'none'. Views may reverse this if they wish.
      evt.dataTransfer.dropEffect = 'none';
    }

    // Bubble up the responder chain until we have a successful responder.
    var ld = this._lastDraggedOver || [], nd = [], loc, len,
        view = this.targetViewForEvent(evt);

    // First collect all the responding view starting with the target view from the given drag event.
    while (view && (view !== this)) {
      nd.push(view);
      view = view.get('nextResponder');
    }
    // Next, exit views that are no longer part of the responding chain. (This avoids the pixel-wide
    // edge case where a drop event fires on a new view without a final dragover event.)
    for (loc = 0, len = ld.length; loc < len; loc++) {
      view = ld[loc];
      if (nd.indexOf(view) === -1) {
        view.tryToPerform('dataDragExited', evt);
      }
    }
    // Next, bubble the drop event itself until we find someone that successfully responds.
    for (loc = 0, len = nd.length; loc < len; loc++) {
      view = nd[loc];
      if (view.tryToPerform('dataDragDropped', evt)) break;
    }
    // Finally, notify all interested views that the drag is dead and gone.
    for (loc = 0, len = nd.length; loc < len; loc++) {
      view = nd[loc];
      view.tryToPerform('dataDragExited', evt);
    }

    // Reset caches and counters.
    this._lastDraggedOver = null;
    this._lastDraggedAt = null;
    this._dragCounter = 0;
    if (this._dragLeaveTimer) this._dragLeaveTimer.invalidate();
    this._dragLeaveTimer = null;
  },


  // these methods are used to prevent unnecessary text-selection in IE,
  // there could be some more work to improve this behavior and make it
  // a bit more useful; right now it's just to prevent bugs when dragging
  // and dropping.

  _mouseCanDrag: YES,

  selectstart: function(evt) {
    var targetView = this.targetViewForEvent(evt),
        result = this.sendEvent('selectStart', evt, targetView);

    // If the target view implements mouseDragged, then we want to ignore the
    // 'selectstart' event.
    if (targetView && targetView.respondsTo('mouseDragged')) {
      return (result !==null ? YES: NO) && !this._mouseCanDrag;
    } else {
      return (result !==null ? YES: NO);
    }
  },

  drag: function() { return false; },

  contextmenu: function(evt) {
    var view = this.targetViewForEvent(evt),
      ret;

    // Determine if any views took responsibility for the event.
    view = this.sendEvent('contextMenu', evt, view);
    ret = view ? evt.hasCustomEventHandling : YES;

    return ret;
  },

  // ..........................................................
  // ANIMATION HANDLING
  //

  /* @private Handler for animationstart events. */
  animationstart: function (evt) {
    var view = this.targetViewForEvent(evt);
    this.sendEvent('animationDidStart', evt, view);

    return view ? evt.hasCustomEventHandling : YES;
  },

  /* @private Handler for animationiteration events. */
  animationiteration: function (evt) {
    var view = this.targetViewForEvent(evt);
    this.sendEvent('animationDidIterate', evt, view);

    return view ? evt.hasCustomEventHandling : YES;
  },

  /* @private Handler for animationend events. */
  animationend: function (evt) {
    var view = this.targetViewForEvent(evt);
    this.sendEvent('animationDidEnd', evt, view);

    return view ? evt.hasCustomEventHandling : YES;
  },

  /* @private Handler for transitionend events. */
  transitionend: function (evt) {
    var view = this.targetViewForEvent(evt);
    this.sendEvent('transitionDidEnd', evt, view);

    return view ? evt.hasCustomEventHandling : YES;
  }

});

/*
  Invoked when the document is ready, but before main is called.  Creates
  an instance and sets up event listeners as needed.
*/
SC.ready(SC.RootResponder, SC.RootResponder.ready = function () {
  var r;

  r = SC.RootResponder.responder = SC.RootResponder.create();
  r.setup();
});
