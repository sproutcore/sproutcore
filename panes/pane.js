// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view');

/** @class
  A Pane is like a regular view except that it does not need to live within a 
  parent view.  You usually use a Pane to form the root of a view hierarchy in 
  your application, such as your main application view or for floating palettes, 
  popups, menus, etc.
  
  Usually you will not work directly with the SC.Pane class, but with one of its 
  subclasses such as SC.MainPane, SC.DialogPane, or SC.PopupPane.

  h1. Showing a Pane
  
  To make a pane visible, you need to add it to your HTML document.  The 
  simplest way to do this is to call the append() method:
  
  {{{
     myPane = SC.Pane.create();
     myPane.append(); // adds the pane to the document
  }}}
  
  This will insert your pane into the end of your HTML document body, causing it 
  to display on screen.  It will also register your pane with the 
  SC.RootResponder for the document so you can start to receive keyboard, mouse, 
  and touch events.
  
  If you need more specific control for where you pane appears in the document, 
  you can use several other insertion methods such as appendTo(), prependTo(), 
  before() and after().  These methods all take a CoreQuery object or a selector 
  to indicate where in your HTML document you would like you pane to be 
  inserted.
  
  Once a pane is inserted into the document, it will be sized and positioned 
  according to the layout you have specified.  It will then automatically resize 
  with the window if needed, relaying resize notifications to children as well.
  
  h1. Hiding a Pane
  
  When you are finished with a pane, you can hide the pane by calling the 
  remove() method.  This method will actually remove the Pane from the document 
  body, as well as deregistering it from the RootResponder so that it no longer 
  receives events.
  
  The isVisibleInWindow method will also change to NO for the Pane and all of 
  its childViews and the views will no longer have their updateDisplay methods 
  called.  
  
  You can readd a pane to the document again any time in the future by using any 
  of the insertion methods defined in the previous section.
  
  h1. Receiving Events
  
  Your pane and its child views will automatically receive any mouse or touch 
  events as long as it is on the screen.  To receive keyboard events, however, 
  you must focus the keyboard on your pane by calling makeKeyPane() on the pane 
  itself.  This will cause the RootResponder to route keyboard events to your 
  pane.  The pane, in turn, will route those events to its current keyView, if 
  there is any.
  
  Note that all SC.Views (anything that implements SC.ClassicResponder, really) 
  will be notified when it is about or gain or lose keyboard focus.  These 
  notifications are sent both when the view is made keyView of a particular pane 
  and when the pane is made keyPane for the entire application.
  
  You can prevent your Pane from becoming key by setting the acceptsKeyFocus to 
  NO on the pane.  This is useful when creating palettes and other popups that 
  should not steal keyboard control from another view.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.Pane = SC.View.extend({

  /** Returns YES for easy detection of when you reached the pane. */
  isPane: YES,
  
  // .......................................................
  // ROOT RESPONDER SUPPORT
  //

  /**
    The rootResponder for this pane.  Whenever you add a pane to a document, this property will be set to the rootResponder that is now forwarding events to the pane.
  */
  rootResponder: null,  
  
  /** @property
    The default responder.  Set this to point to a responder object that can respond to events when no other view in the hierarchy handles them.
  */
  defaultResponder: null,
  
  /** @property
    The first responder.  This is the first view that should receive action events.  Whenever you click on a view, it will usually become firstResponder.  It may optionally also choose to become key view.
  */
  firstResponder: null,
  
  /** Last known window size. */
  currentWindowSize: null,
  
  /** The parent dimensions are always the last known window size. */
  computeParentDimensions: function(frame) {
    var pframe = this.get('currentWindowSize');
    return {
      width: (pframe) ? pframe.width : SC.maxX(frame),
      height: (pframe) ? pframe.height : SC.maxY(frame)
    } ;
  },

  /** 
    Invoked by the root responder whenever the window resizes.  This should
    simply begin the process of notifying children that the view size has
    changed, if needed.
  */
  windowSizeDidChange: function(oldSize, newSize) {
    this.set('currentWindowSize', newSize) ;
    this.parentViewDidResize(); // start notifications.
  },

  // .......................................................
  // HANDLE KEY VIEW AND KEYBOARD EVENTS
  //

  /** @property
    If YES, this pane can become the key pane.  You may want to set this to NO for certain types of panes.  For example, a palette may never want to become key.  The default value is YES
  */
  acceptsKeyFocus: YES,
  
  /** @property
    This is set to YES when your pane is currently the target of key events. 
  */
  isKeyPane: NO,

  /** Make the pane receive key events.  Until you call this method, the keyView set for this pane will not receive key events. 
  
    @returns {SC.Pane} receiver
  */
  focusKeyPane: function() {
    if (this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(this) ;
    return this ;
  },
  
  /**
    Remove the pane view status from the pane.  This will simply set the keyPane on the rootResponder to null.
    
    @returns {SC.Pane} receiver
  */
  blurKeyPane: function() {
    if (!this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(null);
    return this ;
  },
  
  /**
    The key view.  This is the view that will receive keyboard events first, before sending the event up the responder chain via the firstResponder.
  */
  keyView: null,

  /**
    Makes the passed view the new key view for this pane.  Note that this view must exist in the responder chain for this pane to work properly.  This will notify the current keyView that it is about to lose it's key view status.
    
    @param {SC.View} view
    @returns {SC.Pane} receiver
  */
  makeKeyView: function(view) {
    var currentKey = this.get('keyView'), isKeyPane = this.get('isKeyPane');
    if (currentKey === view) return this; // nothing to do

    // if we are currently key pane, then notify key views of change.
    if (isKeyPane) {
      if (currentKey) currentKey.willBlurKeyTo(view) ;
      if (view) view.willFocusKeyFrom(currentKey) ;
    }
    
    // change setting
    this.set('keyView', view) ;
    
    // and notify again if needed.
    if (isKeyPane) {
      if (view) view.didFocusKeyFrom(currentKey) ;
      if (currentKey) currentKey.didBlurKeyTo(view) ; 
    }
    return this ;
  },
  
  /** @private method forwards status changes in a generic way. */
  _forwardKeyChange: function(shouldForward, methodName, pane) {
    var keyView;
    if (shouldForward && (keyView = this.get('keyView'))) {
      var newKeyView = (pane) ? pane.get('keyView') : null ;
      kewView[methodName](newKeyView);
    } 
  },
  
  /**
    Called just before the pane loses it's keyPane status.  This will notify the current keyView, if there is one, that it is about to lose focus, giving it one last opportunity to save its state. 
    
    @param {SC.Pane} pane
    @returns {SC.Pane} reciever
  */
  willBlurKeyTo: function(pane) {
    this._forwardKeyChange(this.get('isKeyPane'), 'willBlurKeyTo', pane);
    return this ;
  },
  
  /**
    Called just before the pane becomes keyPane.  Notifies the current keyView that it is about to gain focus.  The keyView can use this opportunity to prepare itself, possibly stealing any value it might need to steal from the current key view.
    
    @param {SC.Pane} pane
    @returns {SC.Pane} receiver
  */
  willFocusKeyFrom: function(pane) {
    this._forwardKeyChange(!this.get('isKeyPane'), 'willFocusKeyFrom', pane);
    return this ;
  },


  /**
    Called just after the pane has lost its keyPane status.  Notifies the current keyView of the change.  The keyView can use this method to do any final cleanup and changes its own display value if needed.
    
    @param {SC.Pane} pane
    @returns {SC.Pane} reciever
  */
  didBlurKeyTo: function(pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', NO);
    this._forwardKeyChange(isKeyPane, 'didBlurKeyTo', pane);
    return this ;
  },
  
  /**
    Called just after the keyPane focus has changed to the receiver.  Notifies the keyView of its new status.  The keyView should use this method to update its display and actually set focus on itself at the browser level if needed.
    
    @param {SC.Pane} pane
    @returns {SC.Pane} receiver

  */
  didFocusKeyFrom: function(pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', YES);
    this._forwardKeyChange(!isKeyPane, 'didFocusKeyFrom', pane);
    return this ;
  },
  
  // .......................................................
  // MAIN PANE SUPPORT
  //
  
  isMainPane: NO,
  
  /**
    Invoked when the view is about to lose its mainPane status.  The default implementation will also remove the pane from the document since you can't have more than one mainPane in the document at a time.
  */
  blurMainTo: function(pane) {
    this.set('isMainPane', NO) ;
    this.remove() ;
  },
  
  /** 
    Invokes when the view is about to become the new mainPane.  The default implementation simply updates the isMainPane property.  In your subclass, you should make sure your pane has been added to the document before trying to make it the mainPane.  See SC.MainPane for more information.
  */
  focusMainFrom: function(pane) {
    this.set('isMainPane', YES);
  },
  
  // .......................................................
  // ADDING/REMOVE PANES TO SCREEN
  //  
  
  /**
    Inserts the pane at the end of the document.  This will also add the pane to the rootResponder.
    
    @param {SC.RootResponder} rootResponder
    @returns {SC.Pane} receiver

  */
  append: function() { 
    return this.appendTo('body') ;
  },

  /**
    Removes the pane from the dsocument.  This will remove the
    DOM node and deregister you from the document window.
  */
  remove: function() {
    if (!this.get('isVisibleInWindow')) return this; // nothing to do

    // add to the DOM
    var dom = this.rootElement ;
    if (dom.parentNode) dom.parentNode.removeChild(el);
    dom = null ;
    
    // remove from the RootResponder also
    var responder = this.rootResponder ;
    if (this.get('isMainPane')) responder.makeMainPane(null);
    if (this.get('isKeyPane')) responder.makeKeyPane(null) ;
    responder.panes.remove(this) ;
    this.rootResponder = responder = null ;

    // clean up some of my own properties    
    this.set('isVisibleInWindow', NO) ;
    this.displayLocationDidChange() ;
  },

  /** 
    Inserts the pane into the DOM as the last child of the passed DOM element.  You can pass in either a CoreQuery object or a selector, which will be converted to a CQ object.  You can optionally pass in the rootResponder to use for this operation.  Normally you will not need to pass this as the default responder is suitable.
    
    @param {String|CoreQuery} sel
    @returns {SC.Pane} receiver
  */
  appendTo: function(sel) {
    SC.$(sel).append(this.$()) ; // add to DOM
    return this.paneDidAttach(); // do the rest of the setup
  },

  /** 
    inserts the pane's rootElement into the top of the passed DOM element
  */
  prependTo: function(sel) {
    SC.$(sel).prepend(this.$()) ; // add to DOM
    return this.paneDidAttach(); // do the rest of the setup
  },

  /** 
    inserts the pane's rootElement into the hierarchy before the passed element.
  */
  before: function(sel) {
    this.$().before(SC.$(sel));
    return this.paneDidAttach(); // do the rest of the setup
  },

  /** 
    inserts the pane's rootElement into the hierarchy after the passed 
    element.
  */
  after: function(sel) {
    this.$().after(SC.$(sel));
    return this.paneDidAttach(); // do the rest of the setup
  },
  
  /**
    This method has no effect in the pane.  Instead use remove().
  */
  removeFromParent: function() { },
  
  /** @private
    Called when the pane is attached to a DOM element in a window, this will change the view status to be visible in the window and also register with the rootResponder.
  */
  paneDidAttach: function() {

    // hook into root responder
    var responder = this.rootResponder = SC.RootResponder.responder;
    responder.panes.add(this);
    if (this.get('isKeyPane')) responder.makeKeyPane(this);
    
    // update my own location
    this.set('isVisibleInWindow', YES) ;
    this.displayLocationDidChange() ;
    return this ;
  },

  // behaves a little differently in pane b/c it does not have a parent
  _recomputeIsVisibleInWindow: function(parentViewIsVisible) {
    var last = this.get('isVisibleInWindow') ;
    var cur = this.get('isVisible') ;
    
    // if the state has changed, update it and notify children
    if (last != cur) {
      this.set('isVisibleInWindow', cur) ;
      var childViews = this.get('childViews'), idx = childViews.length;
      while(--idx>=0) childViews[idx]._recomputeIsVisibleInWindow(cur);
    }
  },
  
  updateDisplayLocation: function() {
    // note: the normal code here to update node location is removed 
    // because we don't need it for panes.
    
    // update visibility of element as needed
    var $ = this.$(), isVisible = this.get('isVisible') ;
    (isVisible) ? $.show() : $.hide(); 
    if (!isVisible && this.get('isVisibleInWindow')) {
      this._recomputeIsVisibleInWindow();
      // do this only after we have gone offscreen.
    }
    
    return this ; 
  },

  init: function() {
    var hasRootElement = !!this.rootElement ;
    sc_super() ;
    if (hasRootElement) this.paneDidAttach() ;
  },
  
  emptyElement: '<div class="sc-pane"></div>'
  
}) ;

