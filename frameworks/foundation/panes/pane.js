// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('views/view');

/** @class
  A Pane is like a regular view except that it does not need to live within a 
  parent view.  You usually use a Pane to form the root of a view hierarchy in 
  your application, such as your main application view or for floating 
  palettes, popups, menus, etc.
  
  Usually you will not work directly with the SC.Pane class, but with one of 
  its subclasses such as SC.MainPane, SC.Panel, or SC.PopupPane.

  h1. Showing a Pane
  
  To make a pane visible, you need to add it to your HTML document.  The 
  simplest way to do this is to call the append() method:
  
  {{{
     myPane = SC.Pane.create();
     myPane.append(); // adds the pane to the document
  }}}
  
  This will insert your pane into the end of your HTML document body, causing 
  it to display on screen.  It will also register your pane with the 
  SC.RootResponder for the document so you can start to receive keyboard, 
  mouse, and touch events.
  
  If you need more specific control for where you pane appears in the 
  document, you can use several other insertion methods such as appendTo(), 
  prependTo(), before() and after().  These methods all take a an element to 
  indicate where in your HTML document you would like you pane to be inserted.
  
  Once a pane is inserted into the document, it will be sized and positioned 
  according to the layout you have specified.  It will then automatically 
  resize with the window if needed, relaying resize notifications to children 
  as well.
  
  h1. Hiding a Pane
  
  When you are finished with a pane, you can hide the pane by calling the 
  remove() method.  This method will actually remove the Pane from the 
  document body, as well as deregistering it from the RootResponder so that it 
  no longer receives events.
  
  The isVisibleInWindow method will also change to NO for the Pane and all of 
  its childViews and the views will no longer have their updateDisplay methods 
  called.  
  
  You can readd a pane to the document again any time in the future by using 
  any of the insertion methods defined in the previous section.
  
  h1. Receiving Events
  
  Your pane and its child views will automatically receive any mouse or touch 
  events as long as it is on the screen.  To receive keyboard events, however, 
  you must focus the keyboard on your pane by calling makeKeyPane() on the 
  pane itself.  This will cause the RootResponder to route keyboard events to 
  your pane.  The pane, in turn, will route those events to its current 
  keyView, if there is any.
  
  Note that all SC.Views (anything that implements SC.ClassicResponder, 
  really) will be notified when it is about or gain or lose keyboard focus.  
  These notifications are sent both when the view is made keyView of a 
  particular pane and when the pane is made keyPane for the entire 
  application.
  
  You can prevent your Pane from becoming key by setting the acceptsKeyPane 
  to NO on the pane.  This is useful when creating palettes and other popups 
  that should not steal keyboard control from another view.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.Pane = SC.View.extend({

  /** 
    Returns YES for easy detection of when you reached the pane. 
    @property {Boolean}
  */
  isPane: YES,
  
  /** 
    Set to the current page when the pane is instantiated from a page object.
    @property {SC.Page}
  */
  page: null,
  
  // .......................................................
  // ROOT RESPONDER SUPPORT
  //

  /**
    The rootResponder for this pane.  Whenever you add a pane to a document, 
    this property will be set to the rootResponder that is now forwarding 
    events to the pane.
    
    @property {SC.Responder}
  */
  rootResponder: null,  
  
  /** Last known window size. */
  currentWindowSize: null,
  
  /** The parent dimensions are always the last known window size. */
  computeParentDimensions: function(frame) {
    var pframe = this.get('currentWindowSize');
    return {
      width: (pframe) ? pframe.width : 1000,
      height: (pframe) ? pframe.height : 1000
    } ;
  },
  
  /** @private Disable caching due to an known bug in SC. */
  frame: function() {
    return this.computeFrameWithParentFrame(null) ;
  }.property(),
  
  /** 
    Invoked by the root responder whenever the window resizes.  This should
    simply begin the process of notifying children that the view size has
    changed, if needed.
  */
  windowSizeDidChange: function(oldSize, newSize) {
    this.set('currentWindowSize', newSize) ;
    this.parentViewDidResize(); // start notifications.
  },
  
  /**
    Attempts to send the event down the responder chain for this pane.  If you 
    pass a target, this method will begin with the target and work up the 
    responder chain.  Otherwise, it will begin with the current firstResponder 
    and walk up the chain looking for any responder that implements a handler 
    for the passed method and returns YES when executed.
    
    @param {String} action
    @param {SC.Event} evt
    @param {Object} target
    @returns {Object} object that handled the event
  */
  sendEvent: function(action, evt, target) {
    var handler ;
    
    // walk up the responder chain looking for a method to handle the event
    if (!target) target = this.get('firstResponder') ;
    while(target && !target.tryToPerform(action, evt)) {

      // even if someone tries to fill in the nextResponder on the pane, stop
      // searching when we hit the pane.
      target = (target === this) ? null : target.get('nextResponder') ;
    }
    
    // if no handler was found in the responder chain, try the default
    if (!target && (target = this.get('defaultResponder'))) {
      target = target.tryToPerform(action, evt) ? target : null ;
    }
        
    return evt.mouseHandler || target ;
  },

  // .......................................................
  // HANDLE FIRST RESPONDER AND KEY RESPONDER STATUS
  //

  /** @property
    The default responder.  Set this to point to a responder object that can 
    respond to events when no other view in the hierarchy handles them.
  */
  defaultResponder: null,
  
  /** @property
    The next responder for the pane is always its defaultResponder.
  */
  nextResponder: function() {
    return this.get('defaultResponder');
  }.property('defaultResponder').cacheable(),
  
  /** @property
    The first responder.  This is the first view that should receive action 
    events.  Whenever you click on a view, it will usually become firstResponder. 
  */
  firstResponder: null,
  
  /** @property
    If YES, this pane can become the key pane.  You may want to set this to NO 
    for certain types of panes.  For example, a palette may never want to 
    become key.  The default value is YES.
  */
  acceptsKeyPane: YES,
  
  /** @property
    This is set to YES when your pane is currently the target of key events. 
  */
  isKeyPane: NO,

  /**
    Make the pane receive key events.  Until you call this method, the 
    keyView set for this pane will not receive key events. 
  
    @returns {SC.Pane} receiver
  */
  becomeKeyPane: function() {
    if (this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(this) ;
    return this ;
  },
  
  /**
    Remove the pane view status from the pane.  This will simply set the 
    keyPane on the rootResponder to null.
    
    @returns {SC.Pane} receiver
  */
  resignKeyPane: function() {
    if (!this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(null);
    return this ;
  },
  
  /**
    Makes the passed view (or any object that implements SC.Responder) into 
    the new firstResponder for this pane.  This will cause the current first
    responder to lose its responder status and possibly keyResponder status as
    well.
    
    @param {SC.View} view
    @returns {SC.Pane} receiver
  */
  makeFirstResponder: function(view) {
    var current=this.get('firstResponder'), isKeyPane=this.get('isKeyPane');
    if (current === view) return this ; // nothing to do
    
    // notify current of firstResponder change
    if (current) current.willLoseFirstResponder();
    
    // if we are currently key pane, then notify key views of change also
    if (isKeyPane) {
      if (current) current.willLoseKeyResponderTo(view) ;
      if (view) view.willBecomeKeyResponderFrom(current) ;
    }
    
    // change setting
    if (current) {
      current.beginPropertyChanges()
        .set('isFirstResponder', NO).set('isKeyResponder', NO)
      .endPropertyChanges();
    }

    this.set('firstResponder', view) ;
    
    if (view) {
      view.beginPropertyChanges()
        .set('isFirstResponder', YES).set('isKeyResponder', isKeyPane)
      .endPropertyChanges();
    }
    
    // and notify again if needed.
    if (isKeyPane) {
      if (view) view.didBecomeKeyResponderFrom(current) ; 
      if (current) current.didLoseKeyResponderTo(view) ;
    }
    
    if (view) view.didBecomeFirstResponder();
    return this ;
  },
  
  /** @private method forwards status changes in a generic way. */
  _forwardKeyChange: function(shouldForward, methodName, pane, isKey) {
    var keyView, responder, newKeyView;
    if (shouldForward && (responder = this.get('firstResponder'))) {
      newKeyView = (pane) ? pane.get('firstResponder') : null ;
      keyView = this.get('firstResponder') ;
      if (keyView) keyView[methodName](newKeyView);
      
      if ((isKey !== undefined) && responder) {
        responder.set('isKeyResponder', isKey);
      }
    } 
  },
  
  /**
    Called just before the pane loses it's keyPane status.  This will notify 
    the current keyView, if there is one, that it is about to lose focus, 
    giving it one last opportunity to save its state. 
    
    @param {SC.Pane} pane
    @returns {SC.Pane} reciever
  */
  willLoseKeyPaneTo: function(pane) {
    this._forwardKeyChange(this.get('isKeyPane'), 'willLoseKeyResponderTo', pane, NO);
    return this ;
  },
  
  /**
    Called just before the pane becomes keyPane.  Notifies the current keyView 
    that it is about to gain focus.  The keyView can use this opportunity to 
    prepare itself, possibly stealing any value it might need to steal from the 
    current key view.
    
    @param {SC.Pane} pane
    @returns {SC.Pane} receiver
  */
  willBecomeKeyPaneFrom: function(pane) {
    this._forwardKeyChange(!this.get('isKeyPane'), 'willBecomeKeyResponderFrom', pane, YES);
    return this ;
  },


  /**
    Called just after the pane has lost its keyPane status.  Notifies the 
    current keyView of the change.  The keyView can use this method to do any 
    final cleanup and changes its own display value if needed.
    
    @param {SC.Pane} pane
    @returns {SC.Pane} reciever
  */
  didLoseKeyPaneTo: function(pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', NO);
    this._forwardKeyChange(isKeyPane, 'didLoseKeyResponderTo', pane);
    return this ;
  },
  
  /**
    Called just after the keyPane focus has changed to the receiver.  Notifies 
    the keyView of its new status.  The keyView should use this method to 
    update its display and actually set focus on itself at the browser level 
    if needed.
    
    @param {SC.Pane} pane
    @returns {SC.Pane} receiver

  */
  didBecomeKeyPaneFrom: function(pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', YES);
    this._forwardKeyChange(!isKeyPane, 'didBecomeKeyResponderFrom', pane, YES);
    return this ;
  },
  
  // .......................................................
  // MAIN PANE SUPPORT
  //
  
  isMainPane: NO,
  
  /**
    Invoked when the view is about to lose its mainPane status.  The default 
    implementation will also remove the pane from the document since you can't 
    have more than one mainPane in the document at a time.
  */
  blurMainTo: function(pane) {
    this.set('isMainPane', NO) ;
  },
  
  /** 
    Invokes when the view is about to become the new mainPane.  The default 
    implementation simply updates the isMainPane property.  In your subclass, 
    you should make sure your pane has been added to the document before 
    trying to make it the mainPane.  See SC.MainPane for more information.
  */
  focusMainFrom: function(pane) {
    this.set('isMainPane', YES);
  },
  
  // .......................................................
  // ADDING/REMOVE PANES TO SCREEN
  //  
  
  /**
    Inserts the pane at the end of the document.  This will also add the pane 
    to the rootResponder.
    
    @param {SC.RootResponder} rootResponder
    @returns {SC.Pane} receiver

  */
  append: function() { 
    return this.appendTo(document.body) ;
  },

  /**
    Removes the pane from the document.  This will remove the
    DOM node and deregister you from the document window.
  */
  remove: function() {
    if (!this.get('isVisibleInWindow')) return this; // nothing to do

    // remove layer...
    var dom = this.get('layer') ;
    if (dom.parentNode) dom.parentNode.removeChild(dom);
    dom = null;
    
    // remove from the RootResponder also
    var responder = this.rootResponder ;
    if (this.get('isKeyPane')) responder.makeKeyPane(null) ; // orders matter, remove keyPane first
    if (this.get('isMainPane')) responder.makeMainPane(null);
    responder.panes.remove(this);
    this.rootResponder = responder = null ;

    // clean up some of my own properties    
    this.set('isPaneAttached', NO) ;
    this.parentViewDidChange() ;
  },

  /** 
    Inserts the pane into the DOM as the last child of the passed DOM element. 
    You can pass in either a CoreQuery object or a selector, which will be 
    converted to a CQ object.  You can optionally pass in the rootResponder 
    to use for this operation.  Normally you will not need to pass this as 
    the default responder is suitable.
    
    @param {DOMElement} elem the element to append to
    @returns {SC.Pane} receiver
  */
  appendTo: function(elem) {
    var layer = this.get('layer');
    if (!layer) layer =this.createLayer().get('layer'); 
    elem.insertBefore(layer, null); // add to DOM
    elem = layer = null ;

    return this.paneDidAttach(); // do the rest of the setup
  },

  /** 
    inserts the pane's rootElement into the top of the passed DOM element.
    
    @param {DOMElement} elem the element to append to
    @returns {SC.Pane} receiver
  */
  prependTo: function(elem) {
    var layer = this.get('layer');
    if (!layer) layer =this.createLayer().get('layer'); 
    elem.insertBefore(layer, elem.firstChild); // add to DOM
    elem = layer = null ;

    return this.paneDidAttach(); // do the rest of the setup
  },

  /** 
    inserts the pane's rootElement into the hierarchy before the passed element.
    
    @param {DOMElement} elem the element to append to
    @returns {SC.Pane} receiver
  */
  before: function(elem) {
    var layer = this.get('layer');
    if (!layer) layer =this.createLayer().get('layer');
    
    var parent = elem.parentNode ; 
    parent.insertBefore(layer, elem); // add to DOM
    parent = elem = layer = null ;

    return this.paneDidAttach(); // do the rest of the setup
  },

  /** 
    inserts the pane's rootElement into the hierarchy after the passed 
    element.
    
    @param {DOMElement} elem the element to append to
    @returns {SC.Pane} receiver
  */
  after: function(elem) {
    var layer = this.get('layer');
    if (!layer) layer =this.createLayer().get('layer'); 
    
    var parent = elem.parentNode ;
    elem.insertBefore(layer, elem.nextSibling); // add to DOM
    parent = elem = layer = null ;

    return this.paneDidAttach(); // do the rest of the setup
  },
  
  /**
    This method has no effect in the pane.  Instead use remove().
  */
  removeFromParent: function() { },
  
  /** @private
    Called when the pane is attached to a DOM element in a window, this will 
    change the view status to be visible in the window and also register 
    with the rootResponder.
  */
  paneDidAttach: function() {

    // hook into root responder
    var responder = (this.rootResponder = SC.RootResponder.responder);
    responder.panes.add(this);
  
    // set currentWindowSize
    this.set('currentWindowSize', responder.computeWindowSize()) ;
    
    // update my own location
    this.set('isPaneAttached', YES) ;
    this.parentViewDidChange() ;
    return this ;
  },
  
  /** @property
    YES when the pane is currently attached to a document DOM.  Read only.
  */
  isPaneAttached: NO,

  /**
    Updates the isVisibleInWindow state on the pane and its childViews if 
    necessary.  This works much like SC.View's default implementation, but it
    does not need a parentView to function.
    
    @param {Boolean} parentViewIsVisible (ignored)
    @returns {SC.Pane} receiver
  */
  recomputeIsVisibleInWindow: function(parentViewIsVisible) {
    var last = this.get('isVisibleInWindow') ;
    var cur = this.get('isPaneAttached') && this.get('isVisible') ;

    // if the state has changed, update it and notify children
    if (last !== cur) {
      this.set('isVisibleInWindow', cur) ;
      
      // if we just became visible, update layer + layout if needed...
      if (cur && this.get('layerNeedsUpdate')) this.updateLayerIfNeeded();
      if (cur && this.get('childViewsNeedLayout')) this.layoutChildViewsIfNeeded();
      
      var childViews = this.get('childViews'), len = childViews.length, idx;
      for(idx=0;idx<len;idx++) {
        childViews[idx].recomputeIsVisibleInWindow(cur);
      }
      
      // if we were firstResponder, resign firstResponder also if no longer
      // visible.
      if (!cur && this.get('isFirstResponder')) this.resignFirstResponder();
    }
    
    return this ;
  },
  
  updateLayerLocation: function() {
    // note: the normal code here to update node location is removed 
    // because we don't need it for panes.
    return this ; 
  },

  init: function() {
    // if a layer was set manually then we will just attach to existing 
    // HTML.
    var hasLayer = !!this.get('layer') ;
    sc_super() ;
    if (hasLayer) this.paneDidAttach();
  },

  classNames: 'sc-pane'.w()
  
}) ;

