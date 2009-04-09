// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('system/browser');
require('system/event');
require('system/cursor');

require('mixins/responder') ;
require('mixins/string') ;

SC.viewKey = SC.guidKey + "_view" ;

/** Select a horizontal layout for various views.*/
SC.LAYOUT_HORIZONTAL = 'sc-layout-horizontal';

/** Select a vertical layout for various views.*/
SC.LAYOUT_VERTICAL = 'sc-layout-vertical';

/** @private */
SC._VIEW_DEFAULT_DIMS = 'marginTop marginLeft'.w();

/**
  Layout properties needed to anchor a view to the top.
*/
SC.ANCHOR_TOP = { top: 0 };

/**
  Layout properties needed to anchor a view to the left.
*/
SC.ANCHOR_LEFT = { left: 0 };

/*
  Layout properties to anchor a view to the top left 
*/
SC.ANCHOR_TOP_LEFT = { top: 0, left: 0 };

/**
  Layout properties to anchoe view to the bottom.
*/
SC.ANCHOR_BOTTOM = { bottom: 0 };

/**
  Layout properties to anchor a view to the right.
*/
SC.ANCHOR_RIGHT = { right: 0 } ;

/**
  Layout properties to anchor a view to the bottom right.
*/
SC.ANCHOR_BOTTOM_RIGHT = { bottom: 0, right: 0 };

/**
  Layout properties to take up the full width of a parent view.
*/
SC.FULL_WIDTH = { left: 0, right: 0 };

/**
  Layout properties to take up the full height of a parent view.
*/
SC.FULL_HEIGHT = { top: 0, bottom: 0 };

/**
  Layout properties to center.  Note that you must also specify a width and
  height for this to work.
*/
SC.ANCHOR_CENTER = { centerX: 0, centerY: 0 };

/**
  Layout property for width, height
*/

SC.LAYOUT_AUTO = 'auto';

/** @private - custom array used for child views */
SC.EMPTY_CHILD_VIEWS_ARRAY = [];
SC.EMPTY_CHILD_VIEWS_ARRAY.needsClone = YES;

/** 
  @class
  
  Base class for managing a view.  View's provide two functions:
  
  1. They translate state and events into drawing instructions for the 
     web browser and
  
  2. They act as first responders for incoming keyboard, mouse, and 
     touch events.
  
  h2. View Initialization
  
  When a view is setup, there are several methods you can override that 
  will be called at different times depending on how your view is created.
  Here is a guide to which method you want to override and when:
  
  - *init:* override this method for any general object setup (such as 
    observers, starting timers and animations, etc) that you need to happen 
    everytime the view is created, regardless of whether or not its layer 
    exists yet.
    
  - *render:* override this method to generate or update your HTML to reflect
    the current state of your view.  This method is called both when your view
    is first created and later anytime it needs to be updated.

  - *didCreateLayer:* the render() method is used to generate new HTML.  
    Override this method to perform any additional setup on the DOM you might
    need to do after creating the view.  For example, if you need to listen
    for events.
    
  - *willDestroyLayer:* if you implement didCreateLayer() to setup event 
    listeners, you should implement this method as well to remove the same 
    just before the DOM for your view is destroyed.
    
  - *updateLayer:* Normally, when a view needs to update its content, it will
    re-render the view using the render() method.  If you would like to 
    override this behavior with your own custom updating code, you can 
    replace updateLayer() with your own implementation instead.
  
  @extends SC.Object
  @extends SC.Responder
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/
SC.View = SC.Object.extend(SC.Responder, SC.DelegateSupport,
/** @scope SC.View.prototype */ {
  
  concatenatedProperties: 'outlets displayProperties layoutProperties classNames renderMixin didCreateLayerMixin willDestroyLayerMixin'.w(),
  
  /** 
    The current pane. 
    @property {SC.Pane}
  */
  pane: function() {
    var view = this ;
    while (view && !view.isPane) view = view.get('parentView') ;
    return view ;
  }.property('parentView').cacheable(),
  
  /**
    The page this view was instantiated from.  This is set by the page object
    during instantiation.
    
    @property {SC.Page}
  */
  page: null,
    
  /** 
    The current split view this view is embedded in (may be null). 
    @property {SC.SplitView}
  */
  splitView: function() {
    var view = this ;
    while (view && !view.isSplitView) view = view.get('parentView') ;
    return view ;
  }.property('parentView').cacheable(),
  
  /**
    If the view is currently inserted into the DOM of a parent view, this
    property will point to the parent of the view.
  */
  parentView: null,
  
  /**
    Optional background color.  Will be applied to the view's element if 
    set.  This property is intended for one-off views that need a background
    element.  If you plan to create many view instances it is probably better
    to use CSS.
  
    @property {String}
  */
  backgroundColor: null,
  
  // ..........................................................
  // IS ENABLED SUPPORT
  // 
  
  /** 
    Set to true when the item is enabled.   Note that changing this value
    will also alter the isVisibleInWindow property for this view and any
    child views.
    
    Note that if you apply the SC.Control mixin, changing this property will
    also automatically add or remove a 'disabled' CSS class name as well.
    
    This property is observable and bindable.
    
    @property {Boolean}
  */
  isEnabled: YES,
  isEnabledBindingDefault: SC.Binding.oneWay().bool(),
  
  /**
    Computed property returns YES if the view and all of its parent views
    are enabled in the pane.  You should use this property when deciding 
    whether to respond to an incoming event or not.
    
    This property is not observable.
    
    @property {Boolean}
  */
  isEnabledInPane: function() {
    var ret = this.get('isEnabled'), pv ;
    if (ret && (pv = this.get('parentView'))) ret = pv.get('isEnabledInPane');
    return ret ;
  }.property('parentView', 'isEnabled'),
  
  // ..........................................................
  // IS VISIBLE IN WINDOW SUPPORT
  // 
  
  /**
    The isVisible property determines if the view is shown in the view 
    hierarchy it is a part of. A view can have isVisible == YES and still have
    isVisibleInWindow == NO. This occurs, for instance, when a parent view has
    isVisible == NO. Default is YES.
    
    The isVisible property is considered part of the layout and so changing it
    will trigger a layout update.
    
    @property {Boolean}
  */
  isVisible: YES,
  isVisibleBindingDefault: SC.Binding.bool(),
  
  /**
    YES only if the view and all of its parent views are currently visible
    in the window.  This property is used to optimize certain behaviors in
    the view.  For example, updates to the view layer are not performed 
    if the view until the view becomes visible in the window.
  */
  isVisibleInWindow: NO,
  
  /**
    Recomputes the isVisibleInWindow property based on the visibility of the 
    view and its parent.  If the recomputed value differs from the current 
    isVisibleInWindow state, this method will also call 
    recomputIsVisibleInWindow() on its child views as well.  As an optional 
    optimization, you can pass the isVisibleInWindow state of the parentView 
    if you already know it.
    
    You will not generally need to call or override this method yourself. It 
    is used by the SC.View hierarchy to relay window visibility changes up 
    and down the chain.
    
    @property {Boolean} parentViewIsVisible
    @returns {SC.View} receiver 
  */
  recomputeIsVisibleInWindow: function(parentViewIsVisible) {
    var last = this.get('isVisibleInWindow') ;
    var cur = this.get('isVisible'), parentView ;
    // isVisibleInWindow = isVisible && parentView.isVisibleInWindow
    // this approach only goes up to the parentView if necessary.
    if (cur) {
      cur = (parentViewIsVisible === undefined) ? 
       ((parentView=this.get('parentView')) ? 
         parentView.get('isVisibleInWindow') : NO) : parentViewIsVisible ;
    }
    
    // if the state has changed, update it and notify children
    if (last !== cur) {
      this.set('isVisibleInWindow', cur) ;
      
      var childViews = this.get('childViews'), len = childViews.length, idx;
      for(idx=0;idx<len;idx++) {
        childViews[idx].recomputeIsVisibleInWindow(cur);
      }

      // if we just became visible, update layer + layout if needed...
      if (cur && this.parentViewDidResize) this.parentViewDidResize();
      
      // if we were firstResponder, resign firstResponder also if no longer
      // visible.
      if (!cur && this.get('isFirstResponder')) this.resignFirstResponder();
      
    }
    
    return this ;
  },
  
  // ..........................................................
  // CHILD VIEW SUPPORT
  // 
  
  /** 
    Array of child views.  You should never edit this array directly unless
    you are implementing createChildViews().  Most of the time, you should
    use the accessor methods such as appendChild(), insertBefore() and 
    removeChild().
    
    @property {Array} 
  */
  childViews: SC.EMPTY_CHILD_VIEWS_ARRAY,
  
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
    if (this.willAddChild) this.willAddChild(view, beforeView) ;
    if (view.willAddToParent) view.willAddToParent(this, beforeView) ;
    
    // set parentView of child
    view.set('parentView', this);
    
    // add to childView's array.
    var idx, childViews = this.get('childViews') ;
    if (childViews.needsClone) this.set(childViews = []);
    idx = (beforeView) ? childViews.indexOf(beforeView) : childViews.length;
    if (idx<0) idx = childViews.length ;
    childViews.insertAt(idx, view) ;
    
    // The DOM will need some fixing up, note this on the view.
    view.parentViewDidChange() ;
    view.layoutDidChange() ;
    
    // notify views
    if (this.didAddChild) this.didAddChild(view, beforeView) ;
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
    view.parentViewDidChange() ;
    
    // notify views
    if (this.didRemoveChild) this.didRemoveChild(view);
    if (view.didRemoveFromParent) view.didRemoveFromParent(this) ;
    
    return this ;
  },
  
  /**
    Removes all children from the parentView.
    
    @returns {SC.View} receiver 
  */
  removeAllChildren: function() {
    var childViews = this.get('childViews'), view ;
    while (view = childViews.objectAt(childViews.get('length')-1)) {
      this.removeChild(view) ;
    }
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
    This method is called whenever the receiver's parentView has changed.  
    The default implementation of this method marks the view's display 
    location as dirty so that it will update at the end of the run loop.
    
    You will not usually need to override or call this method yourself, though
    if you manually patch the parentView hierarchy for some reason, you should
    call this method to notify the view that it's parentView has changed.
    
    @returns {SC.View} receiver
  */
  parentViewDidChange: function() {    
    this.recomputeIsVisibleInWindow() ;
    
    this.set('layerLocationNeedsUpdate', YES) ;
    this.invokeOnce(this.updateLayerLocationIfNeeded) ;
    
    return this ;
  },
  
  
  // ..........................................................
  // LAYER SUPPORT
  // 
  
  /**
    Returns the current layer for the view.  The layer for a view is only 
    generated when the view first becomes visible in the window and even 
    then it will not be computed until you request this layer property.
    
    If the layer is not actually set on the view itself, then the layer will
    be found by calling this.findLayerInParentLayer().
    
    You can also set the layer by calling set on this property.
    
    @property {DOMElement} the layer
  */
  layer: function(key, value) {
    if (value !== undefined) {
      this._view_layer = value ;
      
    // no layer...attempt to discover it...  
    } else {
      value = this._view_layer;
      if (!value) {
        var parent = this.get('parentView');
        if (parent) parent = parent.get('layer');
        if (parent) {
          this._view_layer = value = this.findLayerInParentLayer(parent);
        }
        parent = null ; // avoid memory leak
      }
    }
    return value ;
  }.property('isVisibleInWindow').cacheable(),
  
  /**
    Get a CoreQuery object for this view's layer, or pass in a selector string
    to get a CoreQuery object for a DOM node nested within this layer.
    
    @param {String} sel a CoreQuery-compatible selector string
    @returns {SC.CoreQuery} the CoreQuery object for the DOM node
  */
  $: function(sel) {
    var ret, layer = this.get('layer') ;
    // note: SC.$([]) returns an empty CoreQuery object.  SC.$() would 
    // return an object selecting hte document.
    ret = !layer ? SC.$([]) : (sel === undefined) ? SC.$(layer) : SC.$(sel, layer) ;
    layer = null ; // avoid memory leak
    return ret ;
  },
  
  /**
    Returns the DOM element that should be used to hold child views when they
    are added/remove via DOM manipulation.  The default implementation simply
    returns the layer itself.  You can override this to return a DOM element
    within the layer.
    
    @property {DOMElement} the container layer
  */
  containerLayer: function() {
    return this.get('layer') ;
  }.property('layer').cacheable(),
  
  /**
    The ID to use when trying to locate the layer in the DOM.  If you do not
    set the layerId explicitly, then the view's GUID will be used instead.
    This ID must be set at the time the view is created.
    
    @property {String}
    @readOnly
  */
  layerId: function() {
    return SC.guidFor(this) ;
  }.property().cacheable(),
  
  /**
    Attempts to discover the layer in the parent layer.  The default 
    implementation looks for an element with an ID of layerId (or the view's
    guid if layerId is null).  You can override this method to provide your
    own form of lookup.  For example, if you want to discover your layer using
    a CSS class name instead of an ID.
    
    @param {DOMElement} parentLayer the parent's DOM layer
    @returns {DOMElement} the discovered layer
  */
  findLayerInParentLayer: function(parentLayer) {
    var layerId = this.get('layerId') ;
    
    // first, let's try the fast path...
    var elem = document.getElementById(layerId) ;
    
    // TODO: use code generation to only really do this check on IE
    if (SC.browser.msie && elem && elem.id !== layerId) elem = null ;
    
    // if browser supports querySelector use that.
    if (!elem && parentLayer.querySelector) {
      // TODO: make querySelector work on all platforms...
      // elem = parentLayer.querySelector('#' + layerId)[0];
    }
    
    // if no element was found the fast way, search down the parentLayer for
    // the element.  This code should not be invoked very often.  Usually a
    // DOM element will be discovered by the first method above.
    if (!elem) {
      elem = parentLayer.firstChild ;
      while (elem && (elem.id !== layerId)) {
        // try to get first child or next sibling if no children
        var next = elem.firstChild || elem.nextSibling ;
        
        // if no next sibling, then get next sibling of parent.  Walk up 
        // until we find parent with next sibling or find ourselves back at
        // the beginning.
        while (!next && elem && ((elem = elem.parentNode) !== parentLayer)) {
          next = elem.nextSibling ;
        }
        
        elem = next ;
      }
    }
    
    return elem;
  },
  
  /**
    This method is invoked whenever a display property changes.  It will set 
    the layerNeedsUpdate method to YES.
  */
  displayDidChange: function() {
    this.set('layerNeedsUpdate', YES) ;
  },
  
  /**
    Setting this property to YES will cause the updateLayerIfNeeded method to 
    be invoked at the end of the runloop.  You can also force a view to update
    sooner by calling updateLayerIfNeeded() directly.  The method will update 
    the layer only if this property is YES.
    
    @property {Boolean}
    @test in updateLayer
  */
  layerNeedsUpdate: NO,
  
  /** @private
    Schedules the updateLayerIfNeeded method to run at the end of the runloop
    if layerNeedsUpdate is set to YES.
  */  
  _view_layerNeedsUpdateDidChange: function() {
    if (this.get('layerNeedsUpdate')) {
      this.invokeOnce(this.updateLayerIfNeeded) ;
    } 
  }.observes('layerNeedsUpdate'),
  
  /**
    Updates the layer only if the view is visible onscreen and if 
    layerNeedsUpdate is set to YES.  Normally you will not invoke this method
    directly.  Instead you set the layerNeedsUpdate property to YES and this
    method will be called once at the end of the runloop.
    
    If you need to update view's layer sooner than the end of the runloop, you
    can call this method directly.  If your view is not visible in the window
    but you want it to update anyway, then call this method, passing YES for
    the 'force' parameter.
    
    You should not override this method.  Instead override updateLayer() or
    render().
    
    @param {Boolean} isVisible if true assume view is visible even if it is not.
    @returns {SC.View} receiver
    @test in updateLayer
  */
  updateLayerIfNeeded: function(isVisible) {
    if (!isVisible) isVisible = this.get('isVisibleInWindow') ;
    if (isVisible && this.get('layerNeedsUpdate')) {
      this.beginPropertyChanges() ;
      this.set('layerNeedsUpdate', NO) ;
      this.updateLayer() ;
      this.endPropertyChanges() ;
    }
    return this ;
  },
  
  /**
    This is the core method invoked to update a view layer whenever it has 
    changed.  This method simply creates a render context focused on the 
    layer element and then calls your render() method.
    
    You will not usually call or override this method directly.  Instead you
    should set the layerNeedsUpdate property to YES to cause this method to
    run at the end of the run loop, or you can call updateLayerIfNeeded()
    to force the layer to update immediately.  
    
    Instead of overriding this method, consider overidding the render() method
    instead, which is called both when creating and updating a layer.  If you
    do not want your render() method called when updating a layer, then you
    should override this method instead.
    
    @returns {SC.View} receiver 
  */
  updateLayer: function() {
    var context = this.renderContext(this.get('layer')) ;
    this.prepareContext(context, NO) ;
    context.update() ;
    return this ;
  },
  
  /**
    Creates a new renderContext with the passed tagName or element.  You
    can override this method to provide further customization to the context
    if needed.  Normally you will not need to call or override this method.
    
    @returns {SC.RenderContext}
  */
  renderContext: function(tagNameOrElement) {
    return SC.RenderContext(tagNameOrElement) ;
  },
  
  /**
    Creates the layer by creating a renderContext and invoking the view's
    render() method.  This will only create the layer if the layer does not
    already exist.
    
    When you create a layer, it is expected that your render() method will
    also render the HTML for all child views as well.  This method will 
    notify the view along with any of its childViews that its layer has been
    created.
    
    @returns {SC.View} receiver
  */
  createLayer: function() {
    if (this.get('layer')) return this ; // nothing to do
    
    var context = this.renderContext(this.get('tagName')) ;
    
    // now prepare the contet like normal.
    this.prepareContext(context, YES) ;
    this.set('layer', context.element()) ;
    
    // now notify the view and its child views..
    this._notifyDidCreateLayer() ;
    
    return this ;
  },
  
  /** @private - 
    Invokes the receivers didCreateLayer() method if it exists and then
    invokes the same on all child views.
  */
  _notifyDidCreateLayer: function() {
    if (this.didCreateLayer) this.didCreateLayer() ;
    var mixins = this.didCreateLayerMixin, len, idx ;
    if (mixins) {
      len = mixins.length ;
      for (idx=0; idx<len; ++idx) mixins[idx].call(this) ;
    }
    
    var childViews = this.get('childViews') ;
    len = childViews.length ;
    for (idx=0; idx<len; ++idx) childViews[idx]._notifyDidCreateLayer() ;
  },
  
  /**
    Destroys any existing layer along with the layer for any child views as 
    well.  If the view does not currently have a layer, then this method will
    do nothing.
    
    If you implement willDestroyLayer() on your view or if any mixins 
    implement willDestroLayerMixin(), then this method will be invoked on your
    view before your layer is destroyed to give you a chance to clean up any
    event handlers, etc.
    
    If you write a willDestroyLayer() handler, you can assume that your 
    didCreateLayer() handler was called earlier for the same layer.
    
    Normally you will not call or override this method yourself, but you may
    want to implement the above callbacks when it is run.
    
    @returns {SC.View} receiver
  */
  destroyLayer: function() {
    var layer = this.get('layer') ;
    if (layer) {
      // Now notify the view and its child views.  It will also set the
      // layer property to null.
      this._notifyWillDestroyLayer() ;
      
      // do final cleanup
      if (layer.parentNode) layer.parentNode.removeChild(layer) ;
      layer = null ;
    }
    return this ;
  },
  
  /** @private - 
    Invokes willDestroyLayer() on view and child views.  Then sets layer to
    null for receiver.
  */
  _notifyWillDestroyLayer: function() {
    if (this.willDestroyLayer) this.willDestroyLayer() ;
    var mixins = this.willDestroyLayerMixin, len, idx ;
    if (mixins) {
      len = mixins.length ;
      for (idx=0; idx<len; ++idx) mixins[idx].call(this) ;
    }
    
    var childViews = this.get('childViews') ;
    len = childViews.length ;
    for (idx=0; idx<len; ++idx) childViews[idx]._notifyWillDestroyLayer() ;
    
    this.set('layer', null) ;
  },
  
  /**
    Invoked by createLayer() and updateLayer() to actually render a context.
    This method calls the render() method on your view along with any 
    renderMixin() methods supplied by mixins you might have added.
    
    You should not override this method directly.  However, you might call
    this method if you choose to override updateLayer() or createLayer().
    
    @param {SC.RenderContext} context the render context
    @param {Boolean} firstTime YES if this is creating a layer
    @returns {void}
  */
  prepareContext: function(context, firstTime) {
    var mixins, len, idx, layerId, bgcolor, cursor ;
    // do some initial setup only needed at create time.
    if (firstTime) {
      // TODO: seems like things will break later if SC.guidFor(this) is used
      
      layerId = this.layerId ? this.get('layerId') : SC.guidFor(this) ;
      context.id(layerId).classNames(this.get('classNames'), YES) ;
      this.renderLayout(context, firstTime) ;
    }else{
      context.resetClassNames();
      context.classNames(this.get('classNames'), YES);  
    }
    
    // do some standard setup...
    if (this.get('isTextSelectable')) context.addClass('allow-select') ;
    if (!this.get('isEnabled')) context.addClass('disabled') ;
    if (!this.get('isVisible')) context.addClass('hidden') ;
    
    bgcolor = this.get('backgroundColor');
    if (bgcolor) context.addStyle('backgroundColor', bgcolor);
    
    cursor = this.get('cursor') ;
    if (cursor) context.addClass(cursor.get('className')) ;
    
    this.render(context, firstTime) ;
    if (mixins = this.renderMixin) {
      len = mixins.length;
      for(idx=0; idx<len; ++idx) mixins[idx].call(this, context, firstTime) ;
    }
  },
  
  /**
    Your render method should invoke this method to render any child views,
    especially if this is the first time the view will be rendered.  This will
    walk down the childView chain, rendering all of the children in a nested
    way.
    
    @param {SC.RenderContext} context the context
    @param {Boolean} firstName true if the layer is being created
    @returns {SC.RenderContext} the render context
    @test in render
  */
  renderChildViews: function(context, firstTime) {
    var cv = this.get('childViews'), len = cv.length, idx, view ;
    for (idx=0; idx<len; ++idx) {
      view = cv[idx] ;
      context = context.begin(view.get('tagName')) ;
      view.prepareContext(context, firstTime) ;
      context = context.end() ;
    }
    return context ;  
  },
  
  /**
    Invoked whenever your view needs to be rendered, including when the view's
    layer is first created and any time in the future when it needs to be 
    updated.
    
    You will normally override this method in your subclassed views to 
    provide whatever drawing functionality you will need in order to 
    render your content.
    
    You can use the passed firstTime property to determine whether or not 
    you need to completely re-render the view or only update the surrounding
    HTML.  
    
    The default implementation of this method simply calls renderChildViews()
    if this is the first time you are rendering, or null otherwise.
    
    @param {SC.RenderContext} context the render context
    @param {Boolean} firstTime YES if this is creating a layer
    @returns {void}
  */
  render: function(context, firstTime) {
    if (firstTime) this.renderChildViews(context, firstTime) ;
  },
  
  // ..........................................................
  // STANDARD RENDER PROPERTIES
  // 
  
  /** 
    Tag name for the view's outer element.  The tag name is only used when
    a layer is first created.  If you change the tagName for an element, you
    must destroy and recreate the view layer.
    
    @property {String}
  */
  tagName: 'div',
  
  /**
    Standard CSS class names to apply to the view's outer element.  This 
    property automatically inherits any class names defined by the view's
    superclasses as well.  
    
    @property {Array}
  */
  classNames: ['sc-view'],
  
  /**
    Tool tip property that will be set to the title attribute on the HTML 
    rendered element.
    
    @property {String}
  */
  toolTip: null,

  /**
    Determines if the user can select text within the view.  Normally this is
    set to NO to disable text selection.  You should set this to YES if you
    are creating a view that includes editable text.  Otherwise, settings this
    to YES will probably make your controls harder to use and it is not 
    recommended.
    
    @property {Boolean}
    @readOnly
  */
  isTextSelectable: NO,
  
  /** 
    You can set this array to include any properties that should immediately
    invalidate the display.  The display will be automatically invalidated
    when one of these properties change.
    
    @property {Array}
    @readOnly
  */
  displayProperties: ['isVisible'],
  
  /**
    You can set this to an SC.Cursor instance; it's className will 
    automatically be added to the layer's classNames. The cursor is only used 
    when a layer is first created.  If you change the cursor for an element, 
    you must destroy and recreate the view layer.
    
    @property {SC.Cursor}
  */
  cursor: null,
  
  // ..........................................................
  // LAYER LOCATION
  // 
  
  /**
    Set to YES when the view's layer location is dirty.  You can call 
    updateLayerLocationIfNeeded() to clear this flag if it is set.
    
    @property {Boolean}
  */
  layerLocationNeedsUpdate: NO,
  
  /**
    Calls updateLayerLocation(), but only if the view's layer location
    currently needs to be updated.  This method is called automatically at 
    the end of a run loop if you have called parentViewDidChange() at some
    point.
    
    @property {Boolean} force This property is ignored.
    @returns {SC.View} receiver 
    @test in updateLayerLocation
  */
  updateLayerLocationIfNeeded: function(force) {
    if (this.get('layerLocationNeedsUpdate')) {
      this.set('layerLocationNeedsUpdate', NO) ;
      this.updateLayerLocation() ;
    }
    return this ;
  },
  
  /**
    This method is called when a view changes its location in the view 
    hierarchy.  This method will update the underlying DOM-location of the 
    layer so that it reflects the new location.
    
    @returns {SC.View} receiver
  */
  updateLayerLocation: function() {
    // collect some useful value
    // if there is no node for some reason, just exit
    var node = this.get('layer') ;
    var parentView = this.get('parentView') ;
    var parentNode = parentView ? parentView.get('containerLayer') : null ;
    
    // remove node from current parentNode if the node does not match the new 
    // parent node.
    if (node && node.parentNode && node.parentNode !== parentNode) {
      node.parentNode.removeChild(node);
    }
    
    // CASE 1: no new parentView.  just remove from parent (above).
    if (!parentView) {
      if (node && node.parentNode) node.parentNode.removeChild(node);
      
    // CASE 2: parentView has no layer, view has layer.  destroy layer
    // CASE 3: parentView has no layer, view has no layer, nothing to do
    } else if (!parentNode) {
      if (node) {
        if (node.parentNode) node.parentNode.removeChild(node);
        this.destroyLayer();
      }
      
    // CASE 4: parentView has layer, view has no layer.  create layer & add
    // CASE 5: parentView has layer, view has layer.  move layer
    } else {
      if (!node) {
        this.createLayer() ;
        node = this.get('layer') ;
      }
      
      var siblings = parentView.get('childViews') ;
      var nextView = siblings.objectAt(siblings.indexOf(this)+1) ;
      var nextNode = (nextView) ? nextView.get('layer') : null ;
      
      // before we add to parent node, make sure that the nextNode exists...
      if (nextView && !nextNode) {
        nextView.updateLayerLocationIfNeeded() ;
        nextNode = nextView.get('layer') ;
      }
      
      // add to parentNode if needed.  If we do add, then also notify view
      // that its parentView has resized since joining a parentView has the
      // same effect.
      if ((node.parentNode!==parentNode) || (node.nextSibling!==nextNode)) {
        parentNode.insertBefore(node, nextNode) ;
        if (this.parentViewDidResize) this.parentViewDidResize() ;
      }
    }
    
    parentNode = parentView = node = null ; // avoid memory leaks
    return this ; 
  },
  
  // .......................................................
  // SC.RESPONDER SUPPORT
  //
  
  /** @property
    The nextResponder is usually the parentView.
  */
  nextResponder: function() {
    return this.get('parentView');
  }.property('parentView').cacheable(),
  
  /**
    Recursively travels down the view hierarchy looking for a view that 
    implements the key equivalent (returning to YES to indicate it handled 
    the event).  You can override this method to handle specific key 
    equivalents yourself.
    
    The keystring is a string description of the key combination pressed.
    The evt is the event itself. If you handle the equivalent, return YES.
    Otherwise, you should just return sc_super.
    
    @param {String} keystring
    @param {SC.Event} evt
    @returns {Boolean}
  */
  performKeyEquivalent: function(keystring, evt) {
    var ret = null, childViews = this.get('childViews'), len = childViews.length, idx=-1;
    while(!ret && (++idx<len)) {
      ret = childViews[idx].performKeyEquivalent(keystring, evt);
    }
    return ret ;
  },
  
  // .......................................................
  // CORE DISPLAY METHODS
  //
  
  /** @private 
    Setup a view, but do not finish waking it up. 
    - configure childViews
    - generate DOM + plug in outlets/childViews unless rootElement is defined
    - register the view with the global views hash, which is used for mgmt
  */
  init: function() {
    var parentView, path, root, idx, len, lp, dp ;
    
    sc_super() ;
    
    // register for event handling now if we're not a materialized view
    // (materialized views register themselves as needed)
    if (!this.get('isMaterialized')) {
      SC.View.views[this.get('layerId')] = this ;
    }
    
    // setup child views.  be sure to clone the child views array first
    this.childViews = this.childViews ? this.childViews.slice() : [] ;
    this.createChildViews() ; // setup child Views
    
    // register display property observers ..
    // TODO: Optimize into class setup 
    dp = this.get('displayProperties') ; 
    idx = dp.length ;
    while(--idx >= 0) {
      this.addObserver(dp[idx], this, this.displayDidChange) ;
    }
    
    // register for drags
    if (this.get('isDropTarget')) SC.Drag.addDropTarget(this) ;
    
    // register scroll views for autoscroll during drags
    if (this.get('isScrollable')) SC.Drag.addScrollableView(this) ;
  },
  
  /**
    Wakes up the view. The default implementation immediately syncs any 
    bindings, which may cause the view to need its display updated. You 
    can override this method to perform any additional setup. Be sure to 
    call sc_super to setup bindings and to call awake on childViews.
    
    It is best to awake a view before you add it to the DOM.  This way when
    the DOM is generated, it will have the correct initial values and will
    not require any additional setup.
    
    @returns {void}
  */
  awake: function() {
    sc_super();
    var childViews = this.get('childViews'), len = childViews.length, idx ;
    for (idx=0; idx<len; ++idx) childViews[idx].awake() ;
  },
    
  /** 
    You must call this method on a view to destroy the view (and all of its 
    child views). This will remove the view from any parent node, then make 
    sure that the DOM element managed by the view can be released by the 
    memory manager.
  */
  destroy: function() {
    if (this.get('isDestroyed')) return this; // nothing to do
     
    sc_super();
    
    // remove from parent if found
    this.removeFromParent() ;
    this._destroy(); // core destroy method
    
    // unregister for drags
    if (this.get('isDropTarget')) SC.Drag.removeDropTarget(this) ;
    
    // unregister for autoscroll during drags
    if (this.get('isScrollable')) SC.Drag.removeScrollableView(this) ;
    return this; // done with cleanup
  },
  
  _destroy: function() {
    if (this.get('isDestroyed')) return this ; // nothing to do
    
    // destroy the layer -- this will avoid each child view destroying 
    // the layer over and over again...
    this.destroyLayer() ; 
    
    // first destroy any children.
    var childViews = this.get('childViews'), len = childViews.length, idx ;
    if (len) {
      childViews = childViews.slice() ;
      for (idx=0; idx<len; ++idx) childViews[idx]._destroy() ;
    }
    
    // next remove view from global hash
    delete SC.View.views[this.get('layerId')] ;
    delete this._CQ ; 
    delete this.page ;
    
    // mark as destroyed so we don't do this again
    this.set('isDestroyed', YES) ;
    return this ;
  },
  
  /** 
    This method is called when your view is first created to setup any  child 
    views that are already defined on your class.  If any are found, it will 
    instantiate them for you.
    
    The default implementation of this method simply steps through your 
    childViews array, which is expects to either be empty or to contain View 
    designs that can be instantiated
    
    Alternatively, you can implement this method yourself in your own 
    subclasses to look for views defined on specific properties and then build
     a childViews array yourself.
    
    Note that when you implement this method yourself, you should never 
    instantiate views directly.  Instead, you should use 
    this.createChildView() method instead.  This method can be much faster in 
    a production environment than creating views yourself.
    
    @returns {SC.View} receiver
  */
  createChildViews: function() {
    var childViews = this.get('childViews'), 
        len        = childViews.length, 
        idx, key, views, view ;
    
    this.beginPropertyChanges() ;
    
    // swap the array
    for (idx=0; idx<len; ++idx) {
      if (key = (view = childViews[idx])) {

        // is this is a key name, lookup view class
        if (typeof key === SC.T_STRING) {
          view = this[key];
        } else key = null ;
        
        if (view.isClass) {
          view = this.createChildView(view) ; // instantiate if needed
          if (key) this[key] = view ; // save on key name if passed
        } 
      }
      childViews[idx] = view;
    }
    
    this.endPropertyChanges() ;
    return this ;
  },
  
  /**
    Instantiates a view to be added to the childViews array during view 
    initialization. You generally will not call this method directly unless 
    you are overriding createChildViews(). Note that this method will 
    automatically configure the correct settings on the new view instance to 
    act as a child of the parent.
    
    @param {Class} viewClass
    @param {Hash} attrs optional attributes to add
    @returns {SC.View} new instance
    @test in createChildViews
  */
  createChildView: function(view, attrs) {
    // attrs should always exist...
    if (!attrs) attrs = {} ;
    attrs.owner = attrs.parentView = this ;
    if (!attrs.page) attrs.page = this.page ;
    
    // Now add this to the attributes and create.
    view = view.create(attrs) ;
    return view ;
  },
  
  // ...........................................
  // LAYOUT
  //
  
  /** 
    This convenience method will take the current layout, apply any changes
    you pass and set it again.  It is more convenient than having to do this
    yourself sometimes.
    
    You can pass just a key/value pair or a hash with several pairs.  You can
    also pass a null value to delete a property.
    
    This method will avoid actually setting the layout if the value you pass
    does not edit the layout.
    
    @param {String|Hash} key
    @param {Object} value
    @returns {SC.View} receiver
  */
  adjust: function(key, value) {
    var layout = SC.clone(this.get('layout')), didChange = NO, cur ;
    
    if (key === undefined) return this ; // nothing to do.
    
    // handle string case
    if (SC.typeOf(key) === SC.T_STRING) {
      cur = layout[key] ;
      if (SC.none(value)) {
        if (cur !== undefined) didChange = YES ;
        delete layout[key] ;
      } else {
        if (cur !== value) didChange = YES ;
        layout[key] = value ;
      }
      
    // handle hash -- do it this way to avoid creating memory unless needed
    } else {
      var hash = key;
      for(key in hash) {
        if (!hash.hasOwnProperty(key)) continue;
        value = hash[key] ;
        cur = layout[key] ;
        
        if (value === null) {
          if (cur !== undefined) didChange = YES ;
          delete layout[key] ;
        } else if (value !== undefined) {
          if (cur !== value) didChange = YES ;
          layout[key] = value ;
        }
      }
    }
    
    // if (didChange) {
    //   console.log('did change layout') ;
    //   console.log(layout) ;
    // }
    
    // now set adjusted layout
    if (didChange) this.set('layout', layout) ;
    
    return this ;
  },
  
  /** 
    The layout describes how you want your view to be positions on the 
    screen.  You can define the following properties:
    
    - left: the left edge
    - top: the top edge
    - right: the right edge
    - bottom: the bottom edge
    - height: the height
    - width: the width
    - centerX: an offset from center X 
    - centerY: an offset from center Y
    - minWidth: a minimum width
    - minHeight: a minimum height
    - maxWidth: a maximum width
    - maxHeight: a maximum height
    
    Note that you can only use certain combinations to set layout.  For 
    example, you may set left/right or left/width, but not left/width/right,
    since that combination doesn't make sense.
    
    Likewise, you may set a minWidth/minHeight, or maxWidth/maxHeight, but
    if you also set the width/height explicitly, then those constraints won't
    matter as much.
    
    Layout is designed to maximize reliance on the browser's rendering 
    engine to keep your app up to date.
    
    @test in layoutStyle
  */
  layout: { top: 0, left: 0, bottom: 0, right: 0 },
  
  /**
    Converts a frame from the receiver's offset to the target offset.  Both
    the receiver and the target must belong to the same pane.  If you pass
    null, the conversion will be to the pane level.
    
    Note that the context of a view's frame is the view's parent frame.  In
    other words, if you want to convert the frame of your view to the global
    frame, then you should do:
    
    {{{
      var pv = this.get('parentView'), frame = this.get('frame');
      var newFrame = pv ? pv.convertFrameToView(frame, null) : frame;
    }}}
    
    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
    @test in converFrames
  */
  convertFrameToView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, f ;
    
    // walk up this side
    while (view) {
      f = view.get('frame'); myX += f.x; myY += f.y ;
      view = view.get('layoutView') ; 
    }
    
    // walk up other size
    if (targetView) {
      view = targetView ;
      while (view) {
        f = view.get('frame'); targetX += f.x; targetY += f.y ;
        view = view.get('layoutView') ; 
      }
    }
    
    // now we can figure how to translate the origin.
    myX = frame.x + myX - targetX ;
    myY = frame.y + myY - targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height } ;
  },
  
  /**
    Converts a frame offset in the coordinates of another view system to the 
    reciever's view.
    
    Note that the convext of a view's frame is relative to the view's 
    parentFrame.  For example, if you want to convert the frame of view that
    belongs to another view to the receiver's frame you would do:
    
    {{{
      var frame = view.get('frame');
      var newFrame = this.convertFrameFromView(frame, view.get('parentView'));
    }}}
    
    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
    @test in converFrames
  */
  convertFrameFromView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, next, f ;
    
    // walk up this side
    while (view) {
      f = view.get('frame'); myX += f.x; myY += f.y ;
      view = view.get('parentView') ; 
    }
    
    // walk up other size
    if (targetView) {
      view = targetView ;
      while(view) {
        f = view.get('frame'); targetX += f.x; targetY += f.y ;
        view = view.get('parentView') ; 
      }
    }
    
    // now we can figure how to translate the origin.
    myX = frame.x - myX + targetX ;
    myY = frame.y - myY + targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height } ;
  },
  
  /**
    Frame describes the current bounding rect for your view.  This is always
    measured from the top-left corner of the parent view.
    
    @property {Rect}
    @test in layoutStyle
  */
  frame: function() {
    return this.computeFrameWithParentFrame(null) ;
  }.property().cacheable(),
  
  /**
    Computes what the frame of this view would be if the parent were resized
    to the passed dimensions.  You can use this method to project the size of
    a frame based on the resize behavior of the parent.
    
    This method is used especially by the scroll view to automatically 
    calculate when scrollviews should be visible.
  
    Passing null for the parent dimensions will use the actual current 
    parent dimensions.  This is the same method used to calculate the current
    frame when it changes.
    
    @param {Rect} pdim the projected parent dimensions
    @returns {Rect} the computed frame
  */
  computeFrameWithParentFrame: function(pdim) {
    var layout = this.get('layout') ;
    var f = {} , error;
    var stLayout = this.get('useStaticLayout');
    
    if(layout.width !== undefined && layout.width === SC.LAYOUT_AUTO && stLayout!==undefined && !stLayout){
     error= SC.Error.desc("%@.layout() you cannot use width:auto if staticLayout is disabled".fmt(this),"%@".fmt(this),-1);
     console.error(error);
     throw error;
    }

    if(layout.height !== undefined && layout.height === SC.LAYOUT_AUTO && stLayout!==undefined && !stLayout){
      error= SC.Error.desc("%@.layout() you cannot use height:auto if staticLayout is disabled".fmt(this),"%@".fmt(this),-1);  
      console.error(error);
      throw error;
    }
    
    // handle left aligned and left/right 
    if (!SC.none(layout.left)) {
      f.x = Math.floor(layout.left) ;
      if (layout.width !== undefined) {
        if(layout.width === SC.LAYOUT_AUTO) f.width = SC.LAYOUT_AUTO ;
        else f.width = Math.floor(layout.width) ;
      } else { // better have layout.right!
        if (!pdim) pdim = this.computeParentDimensions(layout) ;
        f.width = Math.floor(pdim.width - f.x - (layout.right || 0)) ;
      }
      
    // handle right aligned
    } else if (!SC.none(layout.right)) {
      if (!pdim) pdim = this.computeParentDimensions(layout) ;
      if (SC.none(layout.width)) {
        f.width = pdim.width - layout.right ;
        f.x = 0 ;
      } else {
        if(layout.width === SC.LAYOUT_AUTO) f.width = SC.LAYOUT_AUTO ;
        else f.width = Math.floor(layout.width || 0) ;
        f.x = Math.floor(pdim.width - layout.right - f.width) ;
      }
      
    // handle centered
    } else if (!SC.none(layout.centerX)) {
      if (!pdim) pdim = this.computeParentDimensions(layout) ; 
      if(layout.width === SC.LAYOUT_AUTO) f.width = SC.LAYOUT_AUTO ;
      else f.width = Math.floor(layout.width || 0) ;
      f.x = Math.floor((pdim.width - f.width)/2 + layout.centerX) ;
    } else {
      f.x = 0 ; // fallback
      if (SC.none(layout.width)) {
        if (!pdim) pdim = this.computeParentDimensions(layout) ;
        f.width = Math.floor(pdim.width) ;
      } else {
        if(layout.width === SC.LAYOUT_AUTO) f.width = SC.LAYOUT_AUTO ;
        else f.width = Math.floor(layout.width || 0) ;
      }
    }
    
    // handle top aligned and top/bottom 
    if (!SC.none(layout.top)) {
      f.y = Math.floor(layout.top) ;
      if (layout.height !== undefined) {
        if(layout.height === SC.LAYOUT_AUTO) f.height = SC.LAYOUT_AUTO ;
        else f.height = Math.floor(layout.height) ;
      } else { // better have layout.bottm!
        if (!pdim) pdim = this.computeParentDimensions(layout) ;
        f.height = Math.floor(pdim.height - f.y - (layout.bottom || 0)) ;
      }
      
    // handle bottom aligned
    } else if (!SC.none(layout.bottom)) {
      if (!pdim) pdim = this.computeParentDimensions(layout) ;
      if (SC.none(layout.height)) {
        f.height = pdim.height - layout.bottom ;
        f.y = 0 ;
      } else {
        if(layout.height === SC.LAYOUT_AUTO) f.height = SC.LAYOUT_AUTO ;
        else f.height = Math.floor(layout.height || 0) ;
        f.y = Math.floor(pdim.height - layout.bottom - f.height) ;
      }
      
    // handle centered
    } else if (!SC.none(layout.centerY)) {
      if (!pdim) pdim = this.computeParentDimensions(layout) ; 
      if(layout.height === SC.LAYOUT_AUTO) f.height = SC.LAYOUT_AUTO ;
      else f.height = Math.floor(layout.height || 0) ;
      f.y = Math.floor((pdim.height - f.height)/2 + layout.centerY) ;
      
    // fallback
    } else {
      f.y = 0 ; // fallback
      if (SC.none(layout.height)) {
        if (!pdim) pdim = this.computeParentDimensions(layout) ; 
        f.height = Math.floor(pdim.height) ;
      } else {
        if(layout.height === SC.LAYOUT_AUTO) f.height = SC.LAYOUT_AUTO ;
        else f.height = Math.floor(layout.height || 0) ;
      }
    }
    
    // make sure the width/height fix min/max...
    if (!SC.none(layout.maxHeight) && (f.height > layout.maxHeight)) {
      f.height = layout.maxHeight ;
    }

    if (!SC.none(layout.minHeight) && (f.height < layout.minHeight)) {
      f.height = layout.minHeight ;
    }

    if (!SC.none(layout.maxWidth) && (f.width > layout.maxWidth)) {
      f.width = layout.maxWidth ;
    }
    
    if (!SC.none(layout.minWidth) && (f.width < layout.minWidth)) {
      f.width = layout.minWidth ;
    }
    
    // make sure width/height are never < 0
    if (f.height < 0) f.height = 0 ;
    if (f.width < 0) f.width = 0 ;
    
    return f;
  },
  
  computeParentDimensions: function(frame) {
    var ret, pv = this.get('parentView'), pf = (pv) ? pv.get('frame') : null ;
    
    if (pf) {
      ret = { width: pf.width, height: pf.height };
    } else {
      var f = frame ;
      ret = {
        width: (f.left || 0) + (f.width || 0) + (f.right || 0),
        height: (f.top || 0) + (f.height || 0) + (f.bottom || 0)
      };
    }
    return ret ;
  },
  
  /**
    The clipping frame returns the visible portion of the view, taking into
    account the clippingFrame of the parent view.  Keep in mind that the 
    clippingFrame is in the context of the view itself, not it's parent view.
    
    Normally this will be calculate based on the intersection of your own 
    clippingFrame and your parentView's clippingFrame.  
    
    @property {Rect}
  */
  clippingFrame: function() {
    var pv= this.get('parentView'), f = this.get('frame'), ret = f ;
    if (pv) {
     pv = pv.get('clippingFrame') ;
     ret = SC.intersectRects(pv, f) ;
    }
    ret.x -= f.x ;
    ret.y -= f.y ;
    return ret ;
  }.property('parentView', 'frame').cacheable(),
  
  /** @private
    Whenever the clippingFrame changes, this observer will fire, notifying
    child views that their frames have also changed.
  */
  _sc_view_clippingFrameDidChange: function() {
    var cvs = this.get('childViews'), len = cvs.length, idx, cv ;
    for (idx=0; idx<len; ++idx) {
      cv = cvs[idx] ;
      if (!cv.hasStaticLayout) cv.notifyPropertyChange('clippingFrame') ;
    }
  }.observes('clippingFrame'),
    
  /** 
    This method may be called on your view whenever the parent view resizes.
    
    The default version of this method will reset the frame and then call 
    viewDidResize().  You will not usually override this method, but you may
    override the viewDidResize() method.
    
    @returns {void}
    @test in viewDidResize
  */
  parentViewDidResize: function() {
    var layout = this.get('layout') ;
    
    // only resizes if the layout does something other than left/top - fixed
    // size.
    var isFixed = (
      (layout.left !== undefined) && (layout.top !== undefined) &&
      (layout.width !== undefined) && (layout.height !== undefined)
    );
    
    if (!isFixed) {
      this.notifyPropertyChange('frame') ;
      this.viewDidResize() ;
    }
  },
  
  /**
    This method is invoked on your view when the view resizes due to a layout
    change or due to the parent view resizing.  You can override this method
    to implement your own layout if you like, such as performing a grid 
    layout.
    
    The default implementation simply calls parentViewDidResize on all of
    your children.
    
    @returns {void}
  */
  viewDidResize: function() {
    var cv = this.childViews, len = cv.length, idx, view ;
    for (idx=0; idx<len; ++idx) {
      view = cv[idx] ;
      if (view.parentViewDidResize) view.parentViewDidResize() ;
    }
  }.observes('layout'),
  
  // Implementation note: As a general rule, paired method calls, such as 
  // beginLiveResize/endLiveResize that are called recursively on the tree
  // should reverse the order when doing the final half of the call. This 
  // ensures that the calls are propertly nested for any cleanup routines.
  //
  // -> View A.beginXXX()
  //   -> View B.beginXXX()
  //     -> View C.begitXXX()
  //   -> View D.beginXXX()
  //
  // ...later on, endXXX methods are called in reverse order of beginXXX...
  //
  //   <- View D.endXXX()
  //     <- View C.endXXX()
  //   <- View B.endXXX()
  // <- View A.endXXX()
  //
  // See the two methods below for an example implementation.
  
  /**
    Call this method when you plan to begin a live resize.  This will 
    notify the receiver view and any of its children that are interested
    that the resize is about to begin.
    
    @returns {SC.View} receiver
    @test in viewDidResize
  */
  beginLiveResize: function() {
    // call before children have been notified...
    if (this.willBeginLiveResize) this.willBeginLiveResize() ;
    
    // notify children in order
    var ary = this.get('childViews'), len = ary.length, idx, view ;
    for (idx=0; idx<len; ++idx) {
      view = ary[idx] ;
      if (view.beginLiveResize) view.beginLiveResize();
    }
    return this ;
  },
  
  /**
    Call this method when you are finished with a live resize.  This will
    notify the receiver view and any of its children that are interested
    that the live resize has ended.
    
    @returns {SC.View} receiver
    @test in viewDidResize
  */
  endLiveResize: function() {
    // notify children in *reverse* order
    var ary = this.get('childViews'), len = ary.length, idx, view ;
    for (idx=len-1; idx>=0; --idx) { // loop backwards
      view = ary[idx] ;
      if (view.endLiveResize) view.endLiveResize() ;
    }
    
    // call *after* all children have been notified...
    if (this.didEndLiveResize) this.didEndLiveResize() ;
    return this ;
  },
  
  /** 
    layoutStyle describes the current styles to be written to your element
    based on the layout you defined.  Both layoutStyle and frame reset when
    you edit the layout property.  Both are read only.
    
    Computes the layout style settings needed for the current anchor.
    
    @property {Hash}
    @readOnly
  */
  layoutStyle: function() {
    var layout = this.get('layout'), ret = {}, pdim = null, error;
    var stLayout = this.get('useStaticLayout');
    
    if(layout.width !== undefined && layout.width === SC.LAYOUT_AUTO && stLayout!==undefined && !stLayout){
     error= SC.Error.desc("%@.layout() you cannot use width:auto if staticLayout is disabled".fmt(this),"%@".fmt(this),-1);
     console.error(error);
     throw error;
    }

    if(layout.height !== undefined && layout.height === SC.LAYOUT_AUTO && stLayout!==undefined && !stLayout){
      error= SC.Error.desc("%@.layout() you cannot use height:auto if staticLayout is disabled".fmt(this),"%@".fmt(this),-1);  
      console.error(error);
      throw error;
    }


    // X DIRECTION
    
    // handle left aligned and left/right
    if (!SC.none(layout.left)) {
      ret.left = Math.floor(layout.left);
      if (layout.width !== undefined) {
        if(layout.width === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else ret.width = Math.floor(layout.width) ;
        ret.right = null ;
      } else {
        ret.width = null ;
        ret.right = Math.floor(layout.right || 0) ;
      }
      ret.marginLeft = 0 ;
      
    // handle right aligned
    } else if (!SC.none(layout.right)) {
      ret.right = Math.floor(layout.right) ;
      ret.marginLeft = 0 ;
      
      if (SC.none(layout.width)) {
        ret.left = 0;
        ret.width = null;
      } else {
        ret.left = null ;
        if(layout.width === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else ret.width = Math.floor(layout.width || 0) ;
      }
      
    // handle centered
    } else if (!SC.none(layout.centerX)) {
      ret.left = "50%";
      ret.width = Math.floor(layout.width || 0) ;
      ret.marginLeft = Math.floor(layout.centerX - ret.width/2) ;
      ret.right = null ;
    
    // if width defined, assume top/left of zero
    } else if (!SC.none(layout.width)) {
      ret.left =  0;
      ret.right = null;
      if(layout.width === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
      else ret.width = Math.floor(layout.width);
      ret.marginLeft = 0;
      
    // fallback, full width.
    } else {
      ret.left = 0;
      ret.right = 0;
      ret.width = null ;
      ret.marginLeft= 0;
    }
    
    
    // handle min/max
    ret.minWidth = (layout.minWidth === undefined) ? null : layout.minWidth;
    ret.maxWidth = (layout.maxWidth === undefined) ? null : layout.maxWidth;
    
    // Y DIRECTION
    
    // handle left aligned and left/right
    if (!SC.none(layout.top)) {
      ret.top = Math.floor(layout.top);
      if (layout.height !== undefined) {
        if(layout.height === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else ret.height = Math.floor(layout.height) ;
        ret.bottom = null ;
      } else {
        ret.height = null ;
        ret.bottom = Math.floor(layout.bottom || 0) ;
      }
      ret.marginTop = 0 ;
      
    // handle right aligned
    } else if (!SC.none(layout.bottom)) {
      ret.marginTop = 0 ;
      ret.bottom = Math.floor(layout.bottom) ;
      if (SC.none(layout.height)) {
        ret.top = 0;
        ret.height = null ;
      } else {
        ret.top = null ;
        if(layout.height === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else ret.height = Math.floor(layout.height || 0) ;
      }
      
    // handle centered
    } else if (!SC.none(layout.centerY)) {
      ret.top = "50%";
      ret.height = Math.floor(layout.height || 0) ;
      ret.marginTop = Math.floor(layout.centerY - ret.height/2) ;
      ret.bottom = null ;
    
    } else if (!SC.none(layout.height)) {
      ret.top = 0;
      ret.bottom = null;
      if(layout.height === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
      else ret.height = Math.floor(layout.height || 0) ;
      ret.marginTop = 0;
      
    // fallback, full width.
    } else {
      ret.top = 0;
      ret.bottom = 0;
      ret.height = null ;
      ret.marginTop= 0;
    }
    
      
    // handle min/max
    ret.minHeight = (layout.minHeight === undefined) ? null : layout.minHeight;
    ret.maxHeight = (layout.maxHeight === undefined) ? null : layout.maxHeight;
    
    // if zIndex is set, use it.  otherwise let default shine through
    ret.zIndex = SC.none(layout.zIndex) ? null : layout.zIndex.toString();

    // if backgroundPosition is set, use it.  otherwise let default shine through
    ret.backgroundPosition = SC.none(layout.backgroundPosition) ? null : layout.backgroundPosition.toString();
    
    // set default values to null to allow built-in CSS to shine through
    // currently applies only to marginLeft & marginTop
    var dims = SC._VIEW_DEFAULT_DIMS, loc = dims.length, x;
    while(--loc >=0) {
      x = dims[loc];
      if (ret[x]===0) ret[x]=null;
    }
    
    // convert any numbers into a number + "px".
    for(var key in ret) {
      var value = ret[key];
      if (typeof value === SC.T_NUMBER) ret[key] = (value + "px");
    }
    return ret ;
  }.property().cacheable(),
  
  /**
    The view responsible for laying out this view.  The default version 
    returns the current parent view.
  */
  layoutView: function() {
    return this.get('parentView') ;
  }.property('parentView').cacheable(),
  
  /** 
    This method is called whenever a property changes that invalidates the 
    layout of the view.  Changing the layout will do this automatically, but 
    you can add others if you want.
    
    @returns {SC.View} receiver
  */
  layoutDidChange: function() {
    // console.log('%@.layoutDidChange()'.fmt(this));
    this.beginPropertyChanges() ;
    if (this.frame) this.notifyPropertyChange('frame') ;
    this.notifyPropertyChange('layoutStyle') ;
    this.endPropertyChanges() ;
    
    // notify layoutView...
    var layoutView = this.get('layoutView');
    if (layoutView) {
      layoutView.set('childViewsNeedLayout', YES);
      layoutView.layoutDidChangeFor(this) ;
      if (layoutView.get('childViewsNeedLayout')) {
        layoutView.invokeOnce(layoutView.layoutChildViewsIfNeeded);
      }
     }
    
    return this ;
  }.observes('layout'),
  
  /**
    This this property to YES whenever the view needs to layout its child
    views.  Normally this property is set automatically whenever the layout
    property for a child view changes.
    
    @property {Boolean}
  */
  childViewsNeedLayout: NO,

  /**
    One of two methods that are invoked whenever one of your childViews 
    layout changes.  This method is invoked everytime a child view's layout
    changes to give you a chance to record the information about the view.
      
    Since this method may be called many times during a single run loop, you
    should keep this method pretty short.  The other method called when layout
    changes, layoutChildViews(), is invoked only once at the end of 
    the run loop.  You should do any expensive operations (including changing
    a childView's actual layer) in this other method.
    
    Note that if as a result of running this method you decide that you do not
    need your layoutChildViews() method run later, you can set the 
    childViewsNeedsLayout property to NO from this method and the layout 
    method will not be called layer.
     
    @param {SC.View} childView the view whose layout has changed.
    @returns {void}
  */
  layoutDidChangeFor: function(childView) {
    var set = this._needLayoutViews ;
    if (!set) set = this._needLayoutViews = SC.Set.create();
    set.add(childView);
  },
  
  /**
    Called your layout method if the view currently needs to layout some
    child views.
    
    @param {Boolean} isVisible if true assume view is visible even if it is not.
    @returns {SC.View} receiver
    @test in layoutChildViews
  */
  layoutChildViewsIfNeeded: function(isVisible) {
    if (!isVisible) isVisible = this.get('isVisibleInWindow');
    if (isVisible && this.get('childViewsNeedLayout')) {
      this.set('childViewsNeedLayout', NO);
      this.layoutChildViews();
    }
    return this ;
  },

  /**
    Applies the current layout to the layer.  This method is usually only
    called once per runloop.  You can override this method to provide your 
    own layout updating method if you want, though usually the better option
    is to override the layout method from the parent view.
    
    The default implementation of this method simply calls the renderLayout()
    method on the views that need layout.
    
    @returns {void}
  */
  layoutChildViews: function() {
    var set = this._needLayoutViews, len = set ? set.length : 0, idx;
    var view, context, layer;
    for(idx=0;idx<len;idx++) {
      view = set[idx];
      view.updateLayout();
    }
    view = context = layer = null ; // cleanup
    set.clear(); // reset & reuse
  },
  
  /**
    Invoked by the layoutChildViews method to update the layout on a 
    particular view.  This method creates a render context and calls the 
    renderLayout() method, which is probably what you want to override instead 
    of this.
    
    You will not usually override this method, but you may call it if you 
    implement layoutChildViews() in a view yourself.
    
    @returns {SC.View} receiver
    @test in layoutChildViews
  */
  updateLayout: function() {
    var layer = this.get('layer'), context;
    if (layer) {
      context = this.renderContext(layer);
      this.renderLayout(context);
      context.update();
    }
    layer = null ;
    return this ;
  },
  
  /**
    Default method called by the layout view to actually apply the current
    layout to the layer.  The default implementation simply assigns the 
    current layoutStyle to the layer.  This method is also called whenever
    the layer is first created.
    
    @param {SC.RenderContext} the render context
    @returns {void}
    @test in layoutChildViews
  */
  renderLayout: function(context, firstTime) {
    context.addStyle(this.get('layoutStyle'));
  },
  
  /** walk like a duck */
  isView: YES
  
});

SC.View.mixin(/** @scope SC.View @static */ {

  /** @private walk like a duck -- used by SC.Page */
  isViewClass: YES,
  
  /** 
    This method works just like extend() except that it will also preserve
    the passed attributes in case you want to use a view builder later, if 
    needed.
    
    @param {Hash} attrs Attributes to add to view
    @returns {Class} SC.View subclass to create
    @function
  */ 
  design: function() {
    if (this.isDesign) return this; // only run design one time
    var ret = this.extend.apply(this, arguments);
    ret.isDesign = YES ;
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didLoadDesign(ret, this, SC.A(arguments));
    }
    return ret ;
  },

  /**
    Helper applies the layout to the prototype. 
  */
  layout: function(layout) {
    this.prototype.layout = layout ;
    return this ;
  },
  
  /**
    Helper applies the classNames to the prototype
  */
  classNames: function(sc) {
    sc = (this.prototype.classNames || []).concat(sc);
    this.prototype.classNames = sc;
    return this ;
  },
  
  /**
    Help applies the tagName
  */
  tagName: function(tg) {
    this.prototype.tagName = tg;
    return this ;
  },
  
  /**
    Helper adds the childView
  */
  childView: function(cv) {
    var childViews = this.prototype.childViews || [];
    if (childViews === this.superclass.prototype.childViews) childViews = childViews.slice();
    childViews.push(cv) ;
    this.prototype.childViews = childViews;
    return this ;
  },
  
  /**
    Helper adds a binding to a design
  */
  bind: function(keyName, path) {
    var p = this.prototype, s = this.superclass.prototype;
    var bindings = p._bindings ;
    if (!bindings || bindings === s._bindings) {
      bindings = p._bindings = (bindings || []).slice() ;
    }  
    
    keyName = keyName + "Binding";
    p[keyName] = path ;
    bindings.push(keyName);
    
    return this ;
  },

  /**
    Helper sets a generic property on a design.
  */
  prop: function(keyName, value) {
    this.prototype[keyName] = value;
    return this ;
  },
  
  /**
    Used to construct a localization for a view.  The default implementation
    will simply return the passed attributes.
  */
  localization: function(attrs, rootElement) { 
    // add rootElement
    if (rootElement) attrs.rootElement = SC.$(rootElement).get(0);
    return attrs; 
  },
  
  /**
    Creates a view instance, first finding the DOM element you name and then
    using that as the root element.  You should not use this method very 
    often, but it is sometimes useful if you want to attach to already 
    existing HTML.
    
    @param {String|Element} element
    @param {Hash} attrs
    @returns {SC.View} instance
  */
  viewFor: function(element, attrs) {
    var args = SC.$A(arguments); // prepare to edit
    if (SC.none(element)) {
      args.shift(); // remove if no element passed
    } else args[0] = { rootElement: SC.$(element).get(0) } ;
    var ret = this.create.apply(this, arguments) ;
    args = args[0] = null;
    return ret ;
  },
    
  /**
    Create a new view with the passed attributes hash.  If you have the 
    Designer module loaded, this will also create a peer designer if needed.
  */
  create: function() {
    var C=this, ret = new C(arguments); 
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didCreateView(ret, SC.$A(arguments));
    }
    return ret ; 
  },
  
  /**
    Applies the passed localization hash to the component views.  Call this
    method before you call create().  Returns the receiver.  Typically you
    will do something like this:
    
    view = SC.View.design({...}).loc(localizationHash).create();
    
    @param {Hash} loc 
    @param rootElement {String} optional rootElement with prepped HTML
    @returns {SC.View} receiver
  */
  loc: function(loc) {
    var childLocs = loc.childViews;
    delete loc.childViews; // clear out child views before applying to attrs
    
    this.applyLocalizedAttributes(loc) ;
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didLoadLocalization(this, SC.$A(arguments));
    }
    
    // apply localization recursively to childViews
    var childViews = this.prototype.childViews, idx = childViews.length;
    while(--idx>=0) {
      var viewClass = childViews[idx];
      loc = childLocs[idx];
      if (loc && viewClass && viewClass.loc) viewClass.loc(loc) ;
    }
    
    return this; // done!
  },
  
  /**
    Internal method actually updates the localizated attributes on the view
    class.  This is overloaded in design mode to also save the attributes.
  */
  applyLocalizedAttributes: function(loc) {
    SC.mixin(this.prototype, loc) ;
  },
  
  views: {}
    
}) ;

// .......................................................
// OUTLET BUILDER
//

/** 
  Generates a computed property that will look up the passed property path
  the first time you try to get the value.  Use this whenever you want to 
  define an outlet that points to another view or object.  The root object
  used for the path will be the receiver.
*/
SC.outlet = function(path) {
  return function(key) {
    return (this[key] = SC.objectForPropertyPath(path, this)) ;
  }.property();
};

/** @private on unload clear cached divs. */
SC.View.unload = function() {
  
  // delete view items this way to ensure the views are cleared.  The hash
  // itself may be owned by multiple view subclasses.
  var views = SC.View.views;
  if (views) {
    for(var key in views) {
      if (!views.hasOwnProperty(key)) continue ;
      delete views[key];
    }
  }
  
} ;

SC.Event.add(window, 'unload', SC.View, SC.View.unload) ;
