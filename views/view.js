// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/system/browser');
require('foundation/mixins/delegate_support') ;
require('foundation/mixins/string') ;
require('foundation/system/object') ;
require('foundation/system/core_query');
require('foundation/system/event');

SC.viewKey = SC.guidKey + "_view" ;

/** @private */
SC.DISPLAY_LOCATION_QUEUE = 'updateDisplayLocationIfNeeded';

/** @private */
SC.DISPLAY_LAYOUT_QUEUE   = 'updateDisplayLayoutIfNeeded';

/** @private */
SC.DISPLAY_UPDATE_QUEUE   = 'updateDisplayIfNeeded';

/** 
  @class
  
  var dialog = SC.View.build({
    childViews: [
      SC.ButtonView.build({
        title: "OK",
        frame: { x: 250, y: 300, width: 80, height: 23 },
        anchor: (SC.ANCHOR_BOTTOM | SC.ANCHOR_RIGHT)
      }, [0]),
      
      SC.ButtonView.build({
        title: "Cancel",
        frame: { x: 150, y: 300, width: 80, height: 23 },
        anchor: (SC.ANCHOR_BOTTOM | SC.ANCHOR_RIGHT)
      }), [1]],
      
    frame: { x: 0, y: 0, width: 400, height: 350 },
    anchor: SC.ANCHOR_CENTER
  }) ;
  
  d = dialog.create();
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.View = SC.Object.extend(/** @scope SC.View.prototype */ {

  concatenatedProperties: ['outlets','displayProperties'],
  
  /** @property The current pane. */
  pane: function() {
    var view = this;
    while(view && !view.isPane) view = view.get('parentView');
    return view;
  }.property('parentView'),
    
  /**
    If the view is currently inserted into the DOM of a parent view, this
    property will point to the parent of the view.
  */
  parentView: null,

  /** Child Views */
  childViews: [],
  
  /** Outlets */
  outlets: [],
  
  /**
    Insert the view into the the receiver's childNodes array.
    
    The view will be added to the childNodes array before the beforeView.  If 
    beforeView is null, then the view will be added to the end of the array.  
    This will also add the view's rootElement DOM node to the receivers 
    containerElement DOM node as a child.

    If the specified view already belongs to another parent, it will be 
    removed from that view first.
    
    @param {SC.View} view
    @param {SC.View} beforeView
    @returns {SC.View} the receiver
  */
  insertBefore: function(view, beforeView) { 
    
    view.beginPropertyChanges(); // limit notifications

    // remove view from old parent if needed.  Also notify views.
    if (view.get('parentView')) view.removeFromParent() ;
    if (this.willAddChild) this.willAddChild(this, beforeView) ;
    if (view.willAddToParent) view.willAddToParent(this, beforeView) ;

    // set parentView of child
    view.set('parentView', this);
    
    // add to childView's array.
    var idx, childViews = this.get('childViews') ;
    idx = (beforeView) ? childViews.indexOf(beforeView) : childViews.length;
    if (idx<0) idx = childViews.length ;
    childViews.insertAt(idx, view) ;

    // The DOM will need some fixing up, note this on the view.
    view.displayLocationDidChange() ;
    view.displayLayoutDidChange() ;

    // notify views
    if (this.didAddChild) this.didAddChild(this, beforeView) ;
    if (view.didAddToParent) view.didAddToParent(this, beforeView) ;
    
    view.endPropertyChanges();
    
    return this ;
  },
  
  /**
    Removes the child view from the parent view.  
    
    @param {SC.View} view
    @returns {SC.View} receiver
  */
  removeChild: function(view) {
    if (!view) return this; // nothing to do
    if (view.parentView !== this) {
      throw "%@.removeChild(%@) must belong to parent".fmt(this,view);
    }

    // notify views
    if (view.willRemoveFromParent) view.willRemoveFromParent() ;
    if (this.willRemoveChild) this.willRemoveChild(view) ;

    // update parent node
    view.set('parentView', null) ;
    
    // remove view from childViews array.
    var childViews = this.get('childViews') ;
    var idx = childViews.indexOf(view) ;
    if (idx>=0) childViews.removeAt(idx);

    // The DOM will need some fixing up, note this on the view.
    view.displayLocationDidChange() ;

    // notify views
    if (view.didRemoveFromParent) view.didRemoveFromParent(this) ;
    if (this.didRemoveChild) this.didRemoveChild(view);
    
    return this ;
  },
  
  /** 
    Removes the view from its parentView, if one is found.  Otherwise
    does nothing.
    
    @returns {SC.View} receiver
  */
  removeFromParent: function() {
    var parent = this.get('parentView') ;
    if (parent) parent.removeChild(this) ;
    return this ;
  },

  /**
    Replace the oldView with the specified view in the receivers childNodes 
    array. This will also replace the DOM node of the oldView with the DOM 
    node of the new view in the receivers DOM.

    If the specified view already belongs to another parent, it will be 
    removed from that view first.

    @param view {SC.View} the view to insert in the DOM
    @param view {SC.View} the view to remove from the DOM.
    @returns {SC.View} the receiver
  */
  replaceChild: function(view, oldView) {
    
    // suspend notifications
    view.beginPropertyChanges();
    oldView.beginPropertyChanges();
    this.beginPropertyChanges();
    
    this.insertBefore(view,oldView).removeChild(oldView) ;
    
    // resume notifications
    this.endPropertyChanges();
    oldView.endPropertyChanges();
    view.endPropertyChanges(); 
    
    return this;
  },

  /**
    Appends the specified view to the end of the receivers childViews array.  
    This is equivalent to calling insertBefore(view, null);
    
    @param view {SC.View} the view to insert
    @returns {SC.View} the receiver 
  */
  appendChild: function(view) {
    return this.insertBefore(view, null);
  },
    
  /** 
    This method is called on a view whenever it's location in the display
    hierarchy changes.  It will register the view to update its DOM location
    at the end of the runloop.
  */
  displayLocationDidChange: function() {
    this.set('displayLocationNeedsUpdate', YES) ;
    this._recomputeIsVisibleInWindow() ;
    SC.View.scheduleInRunLoop(SC.DISPLAY_LOCATION_QUEUE, this);
    return this ;
  }.observes('isVisible'),
  
  /**
    This method will update the display location, but only if it needs an 
    update.  
  */
  updateDisplayLocationIfNeeded: function() {
    if (!this.get('displayLocationNeedsUpdate')) return YES;
    this.set('displayLocationNeedsUpdate', NO) ;
    this.updateDisplayLocation() ;
    return YES ;
  },

  /**
    This method is called to actually update a view's DOM element in the 
    display tree to match the current settings on the view.  This method is
    usually only called one time at the end of a run loop and only if the 
    view's location has changed in the view hierarchy.
    
    You will not usually need to override this method, but you can if you 
    need to perform some custom display location work.
    
    @returns {SC.View} receiver
  */
  updateDisplayLocation: function() {
    // collect some useful value
    // if there is no node for some reason, just exit
    var node = this.rootElement ;
    if (!node) return this; // nothing to do
    
    // parents...
    var parentView = this.get('parentView') ;
    var parentNode = (parentView) ? (parentView.get('containerElement') || parentView.rootElement) : null ;
    
    
    // if we should belong to a parent, make sure we are added to the right
    // place in the array.  Note that we assume parentNode is only non-null if
    // parentView is also non-null.
    if (parentNode) {
      var siblings = parentView.get('childViews') ;
      var nextView = siblings.objectAt(siblings.indexOf(this)+1);
      var nextNode = (nextView) ? nextView.rootElement : null ;
    
      // add to parentNode if needed
      if ((node.parentNode!==parentNode) || (node.nextSibling!=nextNode)) {
        parentNode.insertBefore(node, nextNode) ;
      }
      
    // if we do not belong to a parent, then remove if needed
    } else {
      if (node.parentNode) node.parentNode.removeChild(node);
    }
    
    // finally, update visibility of element as needed if we are in a parent
    if (parentView) {
      var $ = this.$(), isVisible = this.get('isVisible') ;
      (isVisible) ? $.show() : $.hide(); 
      if (!isVisible && this.get('isVisibleInWindow')) {
        this._recomputeIsVisibleInWindow();
        // do this only after we have gone offscreen.
      }
    }
    
    parentNode = parentView = node = null ; // avoid memory leaks
    return this ; 
  },
  
  
  /**
    Determines if the view is visible on the screen, even if it is in the
    view hierarchy.  This is considered part of the layout and so changing
    it will trigger a layout update.
  */
  isVisible: YES,
  
  /**
    This property is true only if the view and all of its parent views are
    currently visible in the window.  It updates automatically.
  */
  isVisibleInWindow: NO,
  
  /**
    Internal method called whenever the isVisibleInWindow property might
    have changed.  This will recompute the value for the property and, if 
    necessary, notify all child views as well.
  */
  _recomputeIsVisibleInWindow: function(parentViewIsVisible) {
    var last = this.get('isVisibleInWindow') ;
    var cur = this.get('isVisible'), parentView ;
    if (cur) {
      cur = (parentViewIsVisible === undefined) ? 
       ((parentView=this.get('parentView')) ? 
         parentView.get('isVisibleInWindow') : NO) : parentViewIsVisible ;
    }
    
    // if the state has changed, update it and notify children
    if (last != cur) {
      this.set('isVisibleInWindow', cur) ;
      var childViews = this.get('childViews'), idx = childViews.length;
      while(--idx>=0) childViews[idx]._recomputeIsVisibleInWindow(cur);
    }
  },

  // .......................................................
  // SC.RESPONDER SUPPORT
  //

  /** @property
    The nextResponder is usually the parentView.
  */
  nextResponder: function() {
    this.get('parentView');
  }.property('parentView').cacheable(),

  /**
    Recursively travels down the view hierarchy looking for a view that implements the key equivalent (returning to YES to indicate it handled the event).  You can override this method to handle specific key equivalents yourself.
    
    The keystring is a string description of the key combination pressed.  The evt is the event itself.    If you handle the equivalent, return YES.  Otherwise, you should just return sc_super.
    
    @param {String} keystring
    @param {SC.Event} evt
    @returns {Boolean}
  */
  performKeyEquivalent: function(keystring, evt) {
    var ret = null, childViews = this.get('childViews'), len = childViews.length, idx=-1;
    while(!ret && (++idx<len)) {
      ret = child.performKeyEquivalent(keystring, evt);
    }
    return ret ;
  },

  // .......................................................
  // CORE DISPLAY METHODS
  //

  /** @private 
    Setup a view, but do not finish waking it up. 
    - configure outlets
    - generate DOM + plug in outlets/childViews unless rootElement is defined
    - register the view with the global views hash, which is used for mgmt
  */
  init: function() {
    sc_super();
    SC.View.views[SC.guidFor(this)] = this; // register w/ views
    this.configureChildViews() ;
    if (!this.rootElement) this.prepareDisplay() ;

    // save this guid on the DOM element for reverse lookups.
    if (this.rootElement) this.rootElement[SC.viewKey] = SC.guidFor(this) ;
    
    // register display property observers
    var dp = this.get('displayProperties'), idx = dp.length;
    while(--idx >= 0) {
      this.addObserver(dp[idx], this, this.displayDidChange);
    }
  },
  
  
  /** 
    You must call this method on a view to destroy the view (and all of 
    its child views).  This will remove the view from any parent node, then
    make sure that the DOM element managed by the view can be released by the
    memory manager.
  */
  destroy: function() {
    if (this.get('isDestroyed')) return this; // nothing to do
     
    // remove from parent if found
    this.removeFromParentView() ;

    // now save rootElement and call primitive destroy method.  This will
    // cleanup children but not actually remove the DOM from any view it
    // might be in etc.  This way we only do this once for the top view.
    var rootElement = this.rootElement ;
    this._destroy(); // core destroy method

    // if rootElement still belongs to a parent somewhere, remove it
    if (rootElement.parentNode) {
      rootElement.parentNode.removeChild(rootElement) ;
    } 
    
    return this; // done with cleanup
  },
  
  isDestroyed: NO,
  
  _destroy: function() {
    // if destroyed, do nothing
    if (this.get('isDestroyed')) return this ;
    
    // first destroy any children.
    var childViews = this.get('childViews') ;
    if (childViews.length > 0) {
      childViews = childViews.slice() ;
      var loc = childViews.length;
      while(--loc >= 0) childViews[loc]._destroyWithoutRemovingDom() ;
    }
    
    // next remove view from global hash
    delete SC.View.views[SC.guidFor(this)];

    // can cleanup rootElement and containerElement (if set)
    this.rootElement = this.containerElement = this._CQ = null ;
    
    // mark as destroyed so we don't do this again
    this.set('isDestroyed', YES) ;
    return this ;
  },
  
  /** 
    This method will automatically instantiate any child views & outlets
  */
  configureChildViews: function() {
    var outlets = this.get('outlets'), childViews = this.get('childViews');
    var views, loc, designMode = this.designMode ;

    this.beginPropertyChanges() ;
    
    // outlets
    loc = (outlets) ? outlets.length : 0 ;
    while(--loc >= 0) {
      var key = outlets[loc] ;
      var builder = this.get(key) ;
      if (builder && builder.createChildView) {
        this.set(key, builder.createChildView(this, null, designMode)) ;
      }
    }

    // child views
    // build a new array of child views to replace the old one
    loc = (childViews) ? childViews.length : 0 ;
    views = [] ; // only create if needed to avoid memory
    while(--loc >= 0) {
      var builder = childViews[loc] ;
      if (builder && builder.createChildView) {
        views[loc] = builder.createChildView(this, this, designMode) ;
      }
    }
    if (views) this.set('childViews', views) ;
    
    this.endPropertyChanges();
  },
  
  /**
    This method is called when the view is created without a root element.
    You should override this method to setup the DOM according to the initial
    state of the view.  The resulting DOM will be dumped to a file and 
    reloaded during a production environment so do not depend on this method 
    being called.
    
    If you need to add outlets into the DOM of the parent at any place, you
    should override this method also.
    
    The default implementation will simply create DOM from the emptyElement
    property defined on the view and set it as the rootElement.  It will also
    insert any childViews DOM elements into the rootElement.
  */
  prepareDisplay: function() {
    var root, element ;
    
    // if emptyElement is not overridden by the instance, then use a cached
    // DOM from the class.  Note that we don't use get() in the test below 
    // because we are interested in comparing the actual value of the 
    // property, not the output.
    if (this.emptyElement === this.constructor.prototype.emptyElement) {
      if (!this._cachedEmptyElement || (this._emptyElementCachedForClassGuid !== SC.guidFor(this.constructor))) {
        var html = this.get('emptyElement');
        this.constructor.prototype._cachedEmptyElement = SC.View.generateElement(html) ;
        this.constructor.prototype._emptyElementCachedForClassGuid = SC.guidFor(this.constructor) ;
      }
      root = this._cachedEmptyElement.cloneNode(true);
      
    // otherwise, we can't cache the DOM because it is overridden by instance
    } else {
      var html = this.get('emptyElement');
      root = SC.View.generateElement(html) ;
    }
    this.rootElement = root ;
    
    // save this guid on the DOM element for reverse lookups.
    if (root) root[SC.viewKey] = SC.guidFor(this) ;
    
    // also, update the layout to match the frame
    this.updateDisplayLayout();
    
    // now add DOM for child views if needed.
    // get the containerElement or use rootElement -- append to this
    var container = this.get('containerElement') || this.rootElement ;
    var idx, childViews = this.get('childViews'), max = childViews.length;
    for(idx=0;idx<max;idx++) {
      element = childViews[idx].rootElement;
      if (element) container.appendChild(element) ;
    }
    
    // clear out some local variables that hold DOM to avoid memory leaks
    root = container = element = null; 
  },
  
  /** 
    Returns a CoreQuery object that selects elements starting with the 
    views rootElement.  You can pass a selector to this or pass no parameters
    to get a CQ object the selects the view's rootElement.
    
    @param {String} selector
    @param {Object} context not usually needed
    @returns {SC.CoreQuery} CoreQuery or jQuery object
  */
  $: function(selector, context) {
    if (arguments.length===0) {
      if(!this._CQ) this._CQ = SC.$(this.rootElement);
      return this._CQ;
    } else return SC.$(selector, (context || this.rootElement)) ;
  },
  
  containerElement: null,
  
  emptyElement: '<div class="sc-view"></div>',
  
  /** 
    This method is invoked whenever the display state of the view has changed.
    You should override this method to update your DOM element to match the
    current state of the view.
    
    Unlike prepareDisplay(), this method will be called at least once whenever
    your app is started and thereafter as often as needed.  It will not be
    optimized out during the build process.
    
    The default implementation does nothing.
    
    @returns {SC.View} receiver
  */
  updateDisplay: function() {
    
  },

  /** 
    Call this method whenever the view's state changes in such as way that
    requires the views display to be updated.  This will schedule the view
    for display at the end of the runloop.
  */
  displayDidChange: function() {
    this.set('displayNeedsUpdate', YES) ;
    SC.View.scheduleInRunLoop(SC.DISPLAY_UPDATE_QUEUE, this);
    return this ;
  },
  
  displayNeedsUpdate: NO,
  
  /**
    This method will update the display location, but only if it needs an 
    update.  Returns YES if the method was able to execute, NO if it needs
    to be called again later.
  */
  updateDisplayIfNeeded: function() {
    if (!this.get('displayNeedsUpdate')) return YES;
    if (!this.get('isVisibleInWindow')) return NO ;
    this.set('displayNeedsUpdate', NO) ;
    this.updateDisplay() ;
    return YES;
  },
  
  /** 
    You can set this array to include any properties that should immediately
    invalidate the display.  The display will be automatically invalidated
    when one of these properties change.
  */
  displayProperties: [],
  
  // ...........................................
  // LAYOUT
  //

  /** 
    This convenience method will take the current layout, apply any changes
    you pass and set it again.  It is more convenient than having to do this
    yourself sometimes.
    
    You can pass just a key/value pair or a hash with several pairs.  You can
    also pass a null value to delete a property.
    
    @param {String|Hash} key
    @param {Object} value
    @returns {SC.View} receiver
  */
  adjust: function(key, value) {
    var layout = SC.clone(this.get('layout')) ;
    
    // handle string case
    if (SC.typeOf(key) === SC.T_STRING) {
      if (value == null) {
        delete layout[key];
      } else layout[key] = value ;
      
    // handle hash -- do it this way to avoid creating memory unles needed
    } else {
      var hash = key;
      for(key in hash) {
        if (!hash.hasOwnProperty(key)) continue;
        value = hash[key];
        if (value == null) {
          delete layout[key] ;
        } else layout[key] = value ;
      }
    }
    
    // now set adjusted layout
    this.set('layout', layout) ;
    
    return this ;
  },
  
  /** 
    The layout describes how you want your view to be positions on the 
    screen.  You can also maybe define a transform function.
    
    top/left - bottom/right - centerX/centerY
    
    Layout is designed to maximize reliance on the browser's rendering 
    engine to keep your app up to date.
  */
  layout: { top: 0, left: 0, width: 100, height: 100 },

  /**
    Converts a frame from the receiver's offset to the target offset.  Both
    the receiver and the target must belong to the same pane.  If you pass
    null, the conversion will be to the pane level.
  */
  convertFrameToView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, next, f;

    // walk up this side
    while(next = view.get('parentView')) {
      f = view.get('frame'); myX += f.x; myY += f.y ;
      view = next ; 
    }

    // walk up other size
    if (targetView) {
      view = targetView ;
      while(next = view.get('parentView')) {
        f = view.get('frame'); targetX += f.x; targetY += f.y ;
        view = next ; 
      }
    }
    
    // now we can figure how to translate the origin.
    myX = frame.x + myX - targetX ;
    myY = frame.y + myY - targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height };
  },

  /**
    Converts a frame offset in the coordinates of another view system to 
    the reciever's view.
  */
  convertFrameFromView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, next, f;

    // walk up this side
    while(next = view.get('parentView')) {
      f = view.get('frame'); myX += f.x; myY += f.y ;
      view = next ; 
    }

    // walk up other size
    if (targetView) {
      view = targetView ;
      while(next = view.get('parentView')) {
        f = view.get('frame'); targetX += f.x; targetY += f.y ;
        view = next ; 
      }
    }
    
    // now we can figure how to translate the origin.
    myX = frame.x - myX + targetX ;
    myY = frame.y - myY + targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height };
  },
  
  /**
    Frame describes the current bounding rect for your view.  This is always
    measured from the top-left corner of the parent view.
  */
  frame: function() {
    var layout = this.get('layout') ;
    var f = {}, pdim = null ;

    // handle left aligned and left/right 
    if (layout.left !== undefined) {
      f.x = Math.floor(layout.left) ;
      if (layout.width !== undefined) {
        f.width = Math.floor(layout.width) ;
      } else { // better have layout.right!
        pdim = this.computeParentDimensions(layout);
        f.width = Math.floor(pdim.width - f.x - (layout.right || 0)) ;
      }
      
    // handle right aligned
    } else if (layout.right !== undefined) {
      if (!pdim) pdim = this.computeParentDimensions(layout);
      f.width = Math.floor(layout.width || 0) ;
      f.x = Math.floor(pdim.width - layout.right - f.width) ;

    // handle centered
    } else if (layout.centerX !== undefined) {
      if (!pdim) pdim = this.computeParentDimensions(layout); 
      f.width = Math.floor(layout.width || 0);
      f.x = Math.floor((pdim.width - f.width)/2 + layout.centerX);
    } else {
      f.x = 0 ; // fallback
      if (layout.width === undefined) {
        if (!pdim) pdim = this.computeParentDimensions(layout); 
        f.width = Math.floor(pdim.width) ;
      } else f.width = layout.width;
    }


    // handle top aligned and top/bottom 
    if (layout.top !== undefined) {
      f.y = Math.floor(layout.top) ;
      if (layout.height !== undefined) {
        f.height = Math.floor(layout.height) ;
      } else { // better have layout.bottm!
        pdim = this.computeParentDimensions(layout);
        f.height = Math.floor(pdim.height - f.y - (layout.bottom || 0)) ;
      }
      
    // handle bottom aligned
    } else if (layout.bottom !== undefined) {
      if (!pdim) pdim = this.computeParentDimensions(layout);
      f.height = Math.floor(layout.height || 0) ;
      f.y = Math.floor(pdim.height - layout.bottom - f.height) ;

    // handle centered
    } else if (layout.centerY !== undefined) {
      if (!pdim) pdim = this.computeParentDimensions(layout); 
      f.height = Math.floor(layout.height || 0);
      f.y = Math.floor((pdim.height - f.height)/2 + layout.centerY);

    // fallback
    } else {
      f.y = 0 ; // fallback
      if (layout.height === undefined) {
        if (!pdim) pdim = this.computeParentDimensions(layout); 
        f.height = Math.floor(pdim.height) ;
      } else f.height = layout.height;
    }

    return f;
  }.property().cacheable(),
  
  /**
    The clipping frame returns the visible portion of the view, taking into
    account the current scroll position, etc.  Keep in mind that the 
    clippingFrame is in the context of the view itself, not it's parent view.
    
    - changes on scroll, on parent clipping frame changing, on resize, and
      frame change.  basically all the freaking time

    - if when you scroll off, views are removed anyway, maybe I only need to
      worry about the clippingFrame for the view itself.  I could do that with
      just the visible bounds....
  */
  clippingFrame: function() {
    
  }.property().cacheable(),
  
  /**
    The bounds returns the current offset & size of the view.  This will
    normally be equal in size to the frame unless you have scrollable 
    content.  It can also indicate the current scroll offset.  You change this
    value by scrolling around.  You scroll around by calling the scrollTo()
    methods.
    
    - changes on scroll, and frame change
  */
  bounds: function() {
    
  }.property().cacheable(),
  
  /**
    LayoutStyle describes the current styles to be written to your element
    based on the layout you defined.  Both layoutStyle and frame reset when
    you edit the layout propert.y  Both are read only.
  */
  /** 
    Computes the layout style settings needed for the current anchor.
  */
  layoutStyle: function() {
    var layout = this.get('layout'), ret = {}, pdim = null;
    ret.position = 'absolute' ;

    // X DIRECTION
    
    // handle left aligned and left/right
    if (layout.left !== undefined) {
      ret.left = Math.floor(layout.left);
      if (layout.width !== undefined) {
        ret.width = Math.floor(layout.width) ;
        ret.right = null ;
      } else {
        ret.width = null ;
        ret.right = Math.floor(layout.right || 0) ;
      }
      ret.marginLeft = 0 ;
      
    // handle right aligned
    } else if (layout.right !== undefined) {
      ret.left = null ;
      ret.right = Math.floor(layout.right) ;
      ret.width = Math.floor(layout.width || 0) ;
      ret.marginLeft = 0 ;
      
    // handle centered
    } else if (layout.centerX !== undefined) {
      ret.left = "50%";
      ret.width = Math.floor(layout.width || 0) ;
      ret.marginLeft = Math.floor(layout.centerX - ret.width/2) ;
      ret.right = null ;
    
    // fallback, full width.
    } else {
      ret.left = 0;
      ret.right = 0;
      ret.width = null ;
      ret.marginLeft= 0;
    }

    // Y DIRECTION
    
    // handle left aligned and left/right
    if (layout.top !== undefined) {
      ret.top = Math.floor(layout.top);
      if (layout.height !== undefined) {
        ret.height = Math.floor(layout.height) ;
        ret.bottom = null ;
      } else {
        ret.height = null ;
        ret.bottom = Math.floor(layout.bottom || 0) ;
      }
      ret.marginTop = 0 ;
      
    // handle right aligned
    } else if (layout.bottom !== undefined) {
      ret.top = null ;
      ret.bottom = Math.floor(layout.bottom) ;
      ret.height = Math.floor(layout.height || 0) ;
      ret.marginTop = 0 ;
      
    // handle centered
    } else if (layout.centerY !== undefined) {
      ret.top = "50%";
      ret.height = Math.floor(layout.height || 0) ;
      ret.marginTop = Math.floor(layout.centerY - ret.height/2) ;
      ret.bottom = null ;
    
    // fallback, full width.
    } else {
      ret.top = 0;
      ret.bottom = 0;
      ret.height = null ;
      ret.marginTop= 0;
    }
    
    return ret ;
  }.property().cacheable(),

  
  computeParentDimensions: function(frame) {
    var pv = this.get('parentView'), pframe = (pv) ? pv.get('frame') : null;
    return {
      width: (pframe) ? pframe.width : SC.maxX(frame),
      height: (pframe) ? pframe.height : SC.maxY(frame)
    } ;
  },
  
  /** 
    This method may be called on your view whenever the parent view resizes.

    The default version of this method will reset the frame and then call 
    viewDidResize().  You will not usually override this method, but you may
    override the viewDidResize() method.
  */
  parentViewDidResize: function() {
    var layout = this.get('layout') ;

    // only resizes if the layout does something other than left/top - fixed
    // size.
    var isFixed = (layout.left!==undefined) && (layout.top!==undefined) && (layout.width !== undefined) && (layout.height !== undefined);

    if (!isFixed) {
      this.notifyPropertyChange('frame') ;
      this.viewDidResize();
    }
  },
  
  /**
    This method is invoked on your view when the view resizes due to a layout
    change or due to the parent view resizing.  You can override this method
    to implement your own layout if you like, such as performing a grid 
    layout.
    
    The default implementation simply calls parentViewDidResize on all of
    your children.
  */
  viewDidResize: function() {
    this.get('childViews').invoke('parentViewDidResize') ;
  }.observes('layout'),  

  /** 
    This method is called whenever a property changes that invalidates the 
    layout of the view.  Changing the layout will do this automatically, but 
    you can add others if you want.
  */
  displayLayoutDidChange: function() {

    this.beginPropertyChanges() ;
    this.set('displayLayoutNeedsUpdate', YES);
    this.notifyPropertyChange('frame') ;
    this.notifyPropertyChange('layoutStyle') ;
    this.endPropertyChanges() ;
    
    SC.View.scheduleInRunLoop(SC.DISPLAY_LAYOUT_QUEUE, this);
    return this ;
  }.observes('layout'),
  
  /**
    This method will update the display layout, but only if it needs an 
    update.  
  */
  updateDisplayLayoutIfNeeded: function() {
    if (!this.get('displayLayoutNeedsUpdate')) return YES;
    if (!this.get('isVisibleInWindow')) return NO ;
    this.set('displayLayoutNeedsUpdate', NO) ;
    this.updateDisplayLayout() ;
    return YES ;
  },

  /**
    This method is called whenever the display layout has become invalid and
    the view needs its display updated again.  This will generally only 
    happen once at the end of the run loop.
  */
  updateDisplayLayout: function() {
    var $ = this.$(), layoutStyle = this.get('layoutStyle'); // get style
    $.css(layoutStyle) ; // todo: add animation here.
  }
  
}); 

SC.View.mixin(/** @scope SC.View @static */ {

  views: {},
  
  /**
    Called by the runloop at the end of the runloop to update any scheduled
    view queues.  Returns YES if some items were flushed from the queue.
  */
  flushPendingQueues: function() {
    this.runLoopQueue.flush() ;
    return this;
  },
  
  /**
    Called by view instances to add them to a queue with the specified named.
  */
  scheduleInRunLoop: function(queueName, view) {
    this.runLoopQueue.add(queueName, view);
  },
  
  /** @private
  Manages the queue of views that need to have some method executed. */
  runLoopQueue: {
    add: function(queueName, view) {
      var queue = this[queueName] ;
      if (!queue) queue = this[queueName] = SC.Set.create();
      queue.add(view) ;
    },
    
    // flushes all queues in order.  This method will loop until no queues
    // are left to flush
    flush: function() {
      var needsFlush = YES, order = this.order, len = order.length, idx;
      while(needsFlush) {
        needsFlush = NO;
        for(idx=0;idx<len;idx++) {
          if (this.flushQueue(order[idx])) needsFlush = YES;
        }
      }
    },

    // flush a single queue.  Any views that cannot execute will be put 
    // back into the queue.
    flushQueue: function(queueName) {
      var didExec = NO, queue = this[queueName], view ;
      if (!queue) return NO ;
      
      delete this[queueName] ;// reset queue
      while(view = queue.pop()) {
        if (view[queueName]()) {
          didExec = YES ;
        } else this.add(queueName, view);
      }
      return didExec;
    },
    
    order: [SC.DISPLAY_LOCATION_QUEUE, SC.DISPLAY_LAYOUT_QUEUE, SC.DISPLAY_UPDATE_QUEUE]
  }
    
}) ;

SC.View.build = SC.Builder.create({
  
  isViewBuilder: YES, // walk like a duck

  init: function(attrs, path) {
    this.attrs = attrs;
    this.rootElementPath = path ;
    return this ;
  },
  
  /** 
    Creates a new instance of the view based on the currently loaded config.
    This will create a new DOM element.  Add any last minute attrs here.
  */
  create: function(attrs) {
    if (attrs) SC.mixin(this.attrs, attrs) ;
    return this.defaultClass.create(this.attrs) ;
  },
  
  /**
    Creates a new instance of the view with the passed view as the parent
    view.  If the parentView has a DOM element, then follow the path to
    find the matching DOM.
    
    This is called internally by views.
  */
  createChildView: function(owner, parentView, designMode) { 
    
    // try to find a matching DOM element by tracing the path
    var root = owner.rootElement ;
    var path = this.rootElementPath, idx=0, len = (path) ? path.length : 0;
    while((idx<len) && root) root = root.childNodes[path[idx++]];
    
    // Now add this to the attributes and create.
    var attrs = this.attrs || {} ;

    if (designMode) {
      attrs.designAttributes = SC.clone(attrs) ; // save attributes
      attrs.designMode = YES;
    }

    attrs.rootElement = root ;
    attrs.owner = owner ;
    attrs.parentView = parentView;

    return this.defaultClass.create(attrs) ;
  },
  
  /**
    Creates a new instance of the view in design mode.  This will cause any
    outlets created by the view to be setup in design mode also.
  */
  design: function() {
    var attrs = this.attrs || {} ;
    attrs.designAttributes = SC.clone(attrs) ;
    attrs.designMode = YES ;
    return this.viewClass.create(attrs) ;  
  }
  
}) ;

SC.mixin(SC.View.prototype, {
  
  designHtml: function() {
    var ret, el = document.createElement('div') ;
    el.appendChild(this.rootElement.cloneNode(true));
    ret = el.innerHTML ;
    delete el ;
    return ret ;
  }
  
}) ;

// .......................................................
// DOM GENERATION
// Generates new DOM elements from the passed HTML.  This uses a cached div
// that must be cleaned up on page unload.

/** generates the DOM element for some HTML */
SC.View.generateElement = function(html) {
  if (!this._domFactory) this._domFactory = document.createElement('div');
  if (!this._domCache) this._domCache = document.createElement('div') ;
  this._domFactory.innerHTML = html ;
  var ret = this._domFactory.firstChild ;
  this._domCache.appendChild(ret) ; // keep around for memory mgmt
  return ret ;
};

/** @private on unload clear cached divs. */
SC.View.unload = function() {
  SC.View._domFactory = SC.View._domCache = null; // cleanup memory
} ;
SC.Event.add(window, 'unload', SC.View, SC.View.unload) ;
