// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view');

/**
  A RootView works just like a regular view except that it does not need to 
  belong to a parent view to be visible.  Instead, you can add the view 
  directly to a document.  Then you can add regular views the root view.
  
  In addition, a root view can have a keyView and a firstResponder, which is
  used for routing events.
  
  h1. Adding a RootView to a view.
  
  SC.RootView.create(domElement)
  
  or 
  
  SC.RootView.create().appendTo('document#selector')

  @extends SC.View
  @since SproutCore 1.0
*/
SC.RootView = SC.View.extend({

  /** The current window the rootView belongs to. */
  window: null,
  
  /** Returns YES for easy detection of when you reached the rootView. */
  isRootView: YES,
  
  /**
    The current first responder.  We try to perform actions on the responder
    first before sending it down the responder chain.  Use 
    becomeFirstResponder()/resignFirstResponder() on the view itself.
  */
  firstResponder: null,

  /**
    If YES, then making this the focusedRootView will also order the view to
    the front.  In short, the zIndex of the view will be set to one larger 
    than the previous current root view.  If you leave this as NO, then 
    becoming the focusedRootView will not change the order.
  */
  shouldRedorderOnFocus: NO,
  
  /**
    If YES then this rootView will also become the key view when you focus it.
    You can always force the rootView to become key view, but not when you
    focus it.  For example, palettes should have this set to NO.
  */
  shouldBecomeKeyOnFocus: NO,

  /**
    Insert's the root view ad the end of the main body.  If you pass a window,
    the rootView will be inserted into the body of that window's document.
    Otherwise, the main window will be used.  
    
    If you need more specific control over where in your DOM your rootView
    is inserted, see the appendTo(), prependTo(), before() and after() methods
    below.
  */
  append: function(win) { return this.appendTo('body', win); },

  /**
    Removes the rootView from the document.  This will remove the
    DOM node and deregister you from the document window.
  */
  remove: function() {
    if (!this.get('isVisibleInWindow')) return this; // nothing to do
    var el = this.rootElement ;
    if (el.parentNode) el.parentNode.removeChild(el);
    el = null ;
    this.set('isVisibleInWindow', NO) ;
    this.displayLocationDidChange() ;
  },

  
  /** 
    inserts the RootView's rootElement into the end of the passed dom
    element or an element matching the selector.
    
    Optionally, pass a window object to insert this into.  Otherwise the 
    default window will be used.
  */
  appendTo: function(sel, win) {
    // either find the selector in the passed window
    var cq = (sel && sel.nodeType) ? SC.$(sel) : SC.$window(win).$(sel);
    cq.append(this.$());
    this.rootViewDidAttach();
    return this ;
  },

  /** 
    inserts the RootViews rootElement into the top of the passed DOM element
  */
  prependTo: function(selector, win) {
    var cq = (sel && sel.nodeType) ? SC.$(sel) : SC.$window(win).$(sel);
    cq.prepend(this.$());
    this.rootViewDidAttach();
    return this ;
  },

  /** 
    inserts the RootViews rootElement into the hierarchy before the passed 
    element.
  */
  before: function(selector, win) {
    var cq = (sel && sel.nodeType) ? SC.$(sel) : SC.$window(win).$(sel);
    this.$().before(cq);
    this.rootViewDidAttach();
    return this ;
  },

  /** 
    inserts the RootViews rootElement into the hierarchy after the passed 
    element.
  */
  after: function(selector, win) {
    var cq = (sel && sel.nodeType) ? SC.$(sel) : SC.$window(win).$(sel);
    this.$().after(cq);
    this.rootViewDidAttach();
    return this ;
  },
  
  /**
    This method has no effect in the root view.  Instead use remove().
  */
  removeFromParent: function() { },
  
  /** @private
    Called when the view is attached to a DOM element in a window, this will
    change the view status to be visible in the window and also find a
    matching SC.window object to start receiving event notifications.
  */
  rootViewDidAttach: function() {
    this.set('isVisibleInWindow', YES) ;
    this.displayLocationDidChange() ;
    SC.RootResponder.responderFor(SC.$()).addRootView(this) ;
  },

  // behaves a little differently in rootView b/c it does not have a parent
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
    // because we don't need it for root views.
    
    // update visibility of element as needed
    var $ = this.$(), isVisible = this.get('isVisible') ;
    (isVisible) ? $.show() : $.hide(); 
    if (!isVisible && this.get('isVisibleInWindow')) {
      this._recomputeIsVisibleInWindow();
      // do this only after we have gone offscreen.
    }
    
    return this ; 
  },

  // in the root view case, the parent dimensions are the dimensiosn of 
  // the window we live in.
  computeParentDimensions: function(frame) {
    var $ = SC.$(window);
    var ret = { width: $.width(), height: $.height() };
    delete $;
    return ret ;
  },
  
  init: function() {
    var hasRootElement = !!this.rootElement ;
    sc_super() ;
    if (hasRootElement) this.rootViewDidAttach() ;
  },
  
  emptyElement: '<div class="sc-root-view"></div>'
  
}) ;

