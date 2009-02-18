// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('system/browser');
require('system/core_query');
require('system/event');

require('mixins/responder') ;
require('mixins/string') ;

SC.viewKey = SC.guidKey + "_view" ;

/** @private */
SC.DISPLAY_LOCATION_QUEUE = 'updateDisplayLocationIfNeeded';
// SC.VIEW_HIERARCHY_QUEUE = 'updateViewHierarchyIfNeeded'; // <-- How about using this name? -E

/** @private */
SC.UPDATE_CHILD_LAYOUT_QUEUE   = 'updateChildLayoutIfNeeded';

/** @private */
SC.DISPLAY_LAYOUT_QUEUE   = 'updateDisplayLayoutIfNeeded';
// SC.APPLY_LAYOUT_QUEUE   = 'applyLayoutIfNeeded'; // <-- How about using this name? -E

/** @private */
SC.DISPLAY_UPDATE_QUEUE   = 'updateDisplayIfNeeded';

/** @private Properties that require the empty element to be recached. */
SC.EMPTY_ELEMENT_PROPERTIES = 'emptyElement tagName styleClass'.w();

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
  
  - *prepareDisplay:* override this method for perform one-time setup on 
    your view's HTML, such as copying in CSS class names and rendering 
    structural HTML based on configuration options.  This method will only 
    be called once when the view is created and the HTML it produces may be 
    saved and reused at runtime, avoiding a call to this method again.
    
  - *updateDisplay:* override this method to update your HTML to reflect 
    any changes to the state of your view.  This method will also be called 
    once on view init unless you set updateContentOnPrepare to NO.
    
  - *init:* override this method for any general object setup (such as 
    observers, starting timers and animations, etc) that you need to happen 
    everytime the view is created, regardless of whether or not its HTML has 
    been cached.
  
  @extends SC.Object
  @extends SC.Responder
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/
SC.View = SC.Object.extend(SC.Responder, SC.DelegateSupport,
/** @scope SC.View.prototype */ {

  concatenatedProperties: 'outlets layerProperties layoutProperties classNames renderMixin didCreateLayerMixin willDestroyLayerMixin'.w(),
  
  /** 
    The current pane. 
    @property {SC.Pane}
  */
  pane: function() {
    var view = this;
    while(view && !view.isPane) view = view.get('parentView');
    return view;
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
    var view = this;
    while(view && !view.isSplitView) view = view.get('parentView');
    return view;
  }.property('parentView').cacheable(),
  
  /**
    If the view is currently inserted into the DOM of a parent view, this
    property will point to the parent of the view.
  */
  parentView: null,

  /** 
    Set to true when the item is enabled. 

    Changing this property by default calls the 
    updateChildViewEnabledStates(), which will simply change the isEnabled 
    property on all child views as well.  You can add your own observer on
    this property to make specific changes to the appearance of your view as 
    well. 
    
    Note that if you apply the SC.Control mixin, changing this property will
    also automatically add or remove a 'disabled' CSS class name as well.
    
    This property is observable and bindable.
    
    @property {Boolean}
  */
  isEnabled: YES,
  isEnabledBindingDefault: SC.Binding.oneWay().bool(),
  
  updateChildViewEnabledStates: function() {
    var isEnabled = this.get('isEnabled');
    this.get('childViews').invoke('set','isEnabled', isEnabled);
  }.observes('isEnabled'),
  
  // ..........................................................
  // IS VISIBLE IN WINDOW SUPPORT
  // 
  
  /**
    Determines if the view is visible on the screen, even if it is in the
    view hierarchy.  This is considered part of the layout and so changing
    it will trigger a layout update.
    
    @property {Boolean}
  */
  isVisible: YES,
  
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
    if (this.willAddChild) this.willAddChild(this, beforeView) ;
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
    view.parentViewDidChange() ;

    // notify views
    if (view.didRemoveFromParent) view.didRemoveFromParent(this) ;
    if (this.didRemoveChild) this.didRemoveChild(view);
    
    return this ;
  },
  
  /**
    Removes all children from the parentView.  
    
    @returns {SC.View} receiver 
  */
  removeAllChildren: function() {
    var childViews = this.get('childViews'), view ;
    while(view = childViews.objectAt(childViews.get('length')-1)) {
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

    var hasLayer = !!this.get('layer'); // do we have a layer?
    if (hasLayer) this.set('layerLocationNeedsUpdate', YES) ;
    if (hasLayer) this.invokeOnce(this.updateLayerLocationIfNeeded);

    return this ;
  }.observes('isVisible'),
  
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
        parent = null;
      }
    }
    return value ;
  }.property('isVisibleInWindow').cacheable(),

  /**
    Returns the DOM element that should be used to hold child views when they
    are added/remove via DOM manipulation.  The default implementation simply
    returns the layer itself.  You can override this to return a DOM element
    within the layer.
  */
  containerLayer: function() {
    return this.get('layer');
  }.property('layer').cacheable(),
  
  /**
    The ID to use when trying to locate the layer in the DOM.  If you do not
    set the layerId explicitly, then the view's GUID will be used instead.
    This ID must be set at the time the view is created.
    
    @property {String}
    @readOnly
  */
  layerId: function() {
    return SC.guidFor(this);
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
    var layerId = this.get('layerId');
    
    // first, let's try the fast path...
    var elem = document.getElementById(layerId);
    if (SC.browser.msie && elem && elem.id !== layerId) elem = null; // IE bug
    
    // if browser supports querySelector use that.
    if (!elem && parentLayer.querySelector) {
      // TODO: make querySelector work on all platforms...
//      elem = parentLayer.querySelector('#' + layerId)[0];
    }
    
    // if no element was found the fast way, search down the parentLayer for
    // the element.  This code should not be invoked very often.  Usually a
    // DOM element will be discovered by the first method above.
    if (!elem) {
      elem = parentLayer.firstChild;
      while(elem && (elem.id !== layerId)) {
        // try to get first child or next sibling if no children
        var next = elem.firstChild || elem.nextSibling ;

        // if no next sibling, then get next sibling of parent.  Walk up 
        // until we find parent with next sibling or find ourselves back at
        // the beginning.
        while(!next && elem && ((elem = elem.parentNode) !== parentLayer)) {
          next = elem.nextSibling ;
        }

        elem = next ;
      }
    }
    
    return elem;
  },

  /**
    This method is invoked whenever a display property changes.  It will
    set the layerNeedsUpdate method to YES.
  */
  displayDidChange: function() {
    this.set('layerNeedsUpdate', YES);
  },
  
  /**
    Setting this property to YES will cause the updateLayerIfNeeded method
    to be invoked at the end of the runloop.  You can also force a view to
    update sooner by calling updateLayerIfNeeded() directly.  The method will
    update the layer only if this property is YES.
    
    @property {Boolean}
  */
  layerNeedsUpdate: NO,
  
  /** @private
    schedules the updateLayerIfNeeded method to run at the end of the runloop
    if layerNeedsUpdate is set to YES.
  */  
  _view_layerNeedsUpdateDidChange: function() {
    if (this.get('layerNeedsUpdate')) {
      this.invokeOnce(this.updateLayerIfNeeded);
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
  */
  updateLayerIfNeeded: function(isVisible) {
    if (!isVisible) isVisible = this.get('isVisibleInWindow');
    if (isVisible && this.get('layerNeedsUpdate')) {
      this.beginPropertyChanges();
      this.set('layerNeedsUpdate', NO);
      this.updateLayer();
      this.endPropertyChanges();
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
    this.prepareContext(context, NO);
    context.update();
    return this;
  },
  
  /**
    Creates a new renderContext with the passed tagName or element.  You
    can override this method to provide further customization to the context
    if needed.  Normally you will not need to call or override this method.
    
    @returns {SC.RenderContext}
  */
  renderContext: function(tagNameOrElement) {
    return SC.RenderContext(tagNameOrElement);
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
    if (this.get('layer')) return this; // nothing to do
    
    var context = this.renderContext(this.get('tagName'));

    // now prepare the contet like normal.
    this.prepareContext(context, YES);
    this.set('layer', context.element());
    
    // now notify the view and its child views..
    this._notifyDidCreateLayer();
    
    return this ;
  },
  
  /** @private - 
    invokes the receivers didCreateLayer() method if it exists and then
    invokes the same on all child views.
  */
  _notifyDidCreateLayer: function() {
    if (this.didCreateLayer) this.didCreateLayer();
    var mixins = this.didCreateLayerMixin, len, idx;
    if (mixins) {
      len = mixins.length;
      for(idx=0;idx<len;idx++) mixins[idx].call(this);
    }
    
    var childViews = this.get('childViews'); len = childViews.length;
    for(idx=0;idx<len;idx++) childViews[idx]._notifyDidCreateLayer();
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
    var layer = this.get('layer');
    if (layer) {
      // now notify the view and its child views..  if will also set the
      // layer property to null.
      this._notifyWillDestroyLayer();

      // do final cleanup
      if (layer.parentNode) layer.parentNode.removeChild(layer);
      layer = null;
    }
    return this ;
  },
  
  /** @private - 
    invokes willDestroyLayer() on view and child views.  Then sets layer to
    null for receiver.
  */
  _notifyWillDestroyLayer: function() {
    if (this.willDestroyLayer) this.willDestroyLayer();
    var mixins = this.willDestroyLayerMixin, len, idx;
    if (mixins) {
      len = mixins.length;
      for(idx=0;idx<len;idx++) mixins[idx].call(this);
    }
    
    var childViews = this.get('childViews'); len = childViews.length;
    for(idx=0;idx<len;idx++) childViews[idx]._notifyWillDestroyLayer();
    
    this.set('layer', null);
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
    var mixins, len, idx, layerId, classArray;
    debugger;
    // do some initial setup only needed at create time.
    if (firstTime) {
      layerId = this.layerId ? this.get('layerId') : SC.guidFor(this);
      classArray = this.get('classNames');
      classArray = classArray.concat(this.styleClass); 
      context.id(layerId).classNames(classArray, YES);
      this.renderLayout(context); 
    }
    
    // do some standard setup...
    if (this.get('isTextSelectable')) context.addClass('text-selectable');
    if (!this.get('isEnabled')) context.addClass('disabled');
    
    this.render(context, firstTime);
    if (mixins = this.renderMixin) {
      len = mixins.length;
      for(idx=0;idx<len;idx++) mixins[idx].call(this, context, firstTime);
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
  */
  renderChildViews: function(context, firstTime) {
    var cv = this.get('childViews'), len = cv.length, idx, view;
    for(idx=0;idx<len;idx++) {
      view = cv[idx];
      context = context.begin(view.get('tagName'));
      view.prepareContext(context, firstTime);
      context = context.end();
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
    if (firstTime) this.renderChildViews(context, firstTime);
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
    Determines if the user can select text within the view.  Normally this is
    set to NO to disable text selection.  You should set this to YES if you
    are creating a view that includes editable text.  Otherwise, settings this
    to YES will probably make your controls harder to use and it is not 
    recommended.

    @property {Boolean}
  */
  isTextSelectable: NO,
  
  /** 
    You can set this array to include any properties that should immediately
    invalidate the display.  The display will be automatically invalidated
    when one of these properties change.
    
    @property {Array}
  */
  displayProperties: [],
  
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
    @returns {Boolean} YES if the location was updated 
  */
  updateLayerLocationIfNeeded: function(force) {
    if (!this.get('layerLocationNeedsUpdate')) return YES;
    this.set('layerLocationNeedsUpdate', NO) ;
    this.updateLayerLocation() ;
    return YES ;
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
    return this;
    var node = this.get('layer') ;
    var parentView = this.get('parentView');
    var parentNode = parentView ? parentView.get('containerLayer') : null;

    // remove node from current parentNode if the node does not match the 
    // new parent node.
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
      if (!node) { this.createLayer();  node = this.get('layer'); }
      
      var siblings = parentView.get('childViews') ;
      var nextView = siblings.objectAt(siblings.indexOf(this)+1);
      var nextNode = (nextView) ? nextView.get('layer') : null ;
    
      // before we add to parent node, make sure that the nextNode exists...
      if (nextView && !nextNode) {
        nextView.updateDisplayLocationIfNeeded();
        nextNode = nextView.get('layer');
      }
      
      // add to parentNode if needed.  If we do add, then also notify view
      // that its parentView has resized since joining a parentView has the
      // same effect.
      if ((node.parentNode!==parentNode) || (node.nextSibling!==nextNode)) {
        parentNode.insertBefore(node, nextNode) ;
        if (this.parentViewDidResize) this.parentViewDidResize();
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
    var parentView, path, root, idx, len, lp, dp;
    
    sc_super();

    SC.View.views[this.get('layerId')] = this; // register for event handling
    
    // setup child views.  be sure to clone the child views array first
    this.childViews = this.childViews ? this.childViews.slice() : [];
    this.createChildViews() ; // setup child Views
    
    // register display property observers ..
    // TODO: Optimize into class setup 
    dp = this.get('displayProperties'); 
    idx = dp.length;
    while(--idx >= 0) {
      this.addObserver(dp[idx], this, this.displayDidChange);
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
    var childViews = this.get('childViews'), len = childViews.length, idx;
    for(idx=0;idx<len;idx++) childViews[idx].awake();
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

    // now save layer and call primitive destroy method.  This will
    // cleanup children but not actually remove the DOM from any view it
    // might be in etc.  This way we only do this once for the top view.
    var layer = this.get('layer') ;
    this._destroy(); // core destroy method

    // if layer still belongs to a parent somewhere, remove it
    if (layer.parentNode) layer.parentNode.removeChild(layer) ;
    
    // unregister for drags
    if (this.get('isDropTarget')) SC.Drag.removeDropTarget(this) ;

    // unregister for autoscroll during drags
    if (this.get('isScrollable')) SC.Drag.removeScrollableView(this) ;
    return this; // done with cleanup
  },
  
  isDestroyed: NO,
  
  _destroy: function() {
    
    // if destroyed, do nothing
    if (this.get('isDestroyed')) return this ;
    
    // first destroy any children.
    var childViews = this.get('childViews'), len = childViews.length, idx ;
    if (len) {
      childViews = childViews.slice() ;
      for(idx=0;idx<len;idx++) childViews[idx]._destroy() ;
    }
    
    // next remove view from global hash
    delete SC.View.views[this.get('layerId')];

    // can cleanup layer (if set)
    this.set('layer', null);
    delete this._CQ; 
    delete this.page;
    
    // mark as destroyed so we don't do this again
    this.set('isDestroyed', YES) ;
    return this ;
  },
  
  /** 
    This method is called when your view is first created to setup any 
    child views that are already defined on your class.  If any are 
    found, it will instantiate them for you.
    
    The default implementation of this method simply steps through your 
    childViews array, which is expects to either be empty or to contain 
    View designs that can be instantiated
    
    Alternatively, you can implement this method yourself in your own 
    subclasses to look for views defined on specific properties and then 
    build a childViews array yourself.
    
    Note that when you implement this method yourself, you should never 
    instantiate views directly.  Instead, you should use 
    this.createChildView() method instead.  This method can be much faster 
    in a production environment than creating views yourself.

    @returns {SC.View} receiver
  */
  createChildViews: function() {
    var childViews = this.get('childViews'), len = childViews.length, idx;
    var views, view ;

    this.beginPropertyChanges() ;

    // swap the array
    for(idx=0;idx<len;idx++) {
      view = childViews[idx] ;
      if (view && view.isClass) {
        view = this.createChildView(view) ; // instantiate if needed
      }
      childViews[idx] = view ;
    }
    
    this.endPropertyChanges();
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
    var layout = SC.clone(this.get('layout')), didChange = NO, cur;
    
    if (key === undefined) return this ; // nothing to do.
    
    // handle string case
    if (SC.typeOf(key) === SC.T_STRING) {
      cur = layout[key];
      if (SC.none(value)) {
        if (cur !== undefined) didChange = YES ;
        delete layout[key];
      } else {
        if (cur !== value) didChange = YES ;
        layout[key] = value ;
      }
      
    // handle hash -- do it this way to avoid creating memory unless needed
    } else {
      var hash = key;
      for(key in hash) {
        if (!hash.hasOwnProperty(key)) continue;
        value = hash[key];
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
  */
  layout: { top: 0, left: 0, bottom: 0, right: 0 },

  /**
    LayoutStyle describes the current styles to be written to your element
    based on the layout you defined.  Both layoutStyle and frame reset when
    you edit the layout property.  Both are read only.
  */
  /** 
    Computes the layout style settings needed for the current anchor.
  */
  layoutStyle: function() {
    var layout = this.get('layout'), ret = {}, pdim = null;

    // X DIRECTION
    
    // handle left aligned and left/right
    if (!SC.none(layout.left)) {
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
    } else if (!SC.none(layout.right)) {
      ret.right = Math.floor(layout.right) ;
      ret.marginLeft = 0 ;

      if (SC.none(layout.width)) {
        ret.left = 0;
        ret.width = null;
      } else {
        ret.left = null ;
        ret.width = Math.floor(layout.width || 0) ;
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
      ret.width = Math.floor(layout.width);
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
        ret.height = Math.floor(layout.height) ;
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
        ret.height = Math.floor(layout.height || 0) ;
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
      ret.height = Math.floor(layout.height || 0);
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
  }.property('layout').cacheable(),
  
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
  */
  layoutDidChange: function() {
    this.beginPropertyChanges() ;
    if (this.frame) this.notifyPropertyChange('frame') ;
    this.notifyPropertyChange('layoutStyle') ;
    this.endPropertyChanges() ;
    
    // notify layoutView...
    var layoutView = this.get('layoutView');
    if (layoutView) layoutView.layoutDidChangeFor(this) ;
    
    return this ;
  }.observes('layout'),
  
  /**
    This this property to YES whenever the view needs to layout its child
    views.  Normally this property is set automatically whenever the layout
    property for a child view changes.
    
    @property {Boolean}
  */
  needsLayout: NO,

  _view_needsLayoutDidChange: function() {
    if (this.get('needsLayout')) this.invokeOnce(layoutView.layoutIfNeeded);
  }.property('needsLayout'),
  
  /**
    Invoked by a child view whenever its layout changes.  The default 
    implementation of this method records the child view in a set for later
    processing and then sets needsLayout to YES to cause layout to be called
    later.
    
    You can override this method to do your own layout and you do not need
    to call sc_super().  However, be sure you set needsLayout to YES if you
    need your layout() method to run at the end of the run loop.
    
    @param {SC.View} childView the view whose layout has changed.
    @returns {void}
  */
  layoutDidChangeFor: function(childView) {
    var set = this._needLayoutViews ;
    if (!set) set = this._needLayoutViews = SC.Set.create();
    set.add(childView);
    this.set('needsLayout', YES);
  },
  
  /**
    Called your layout method if the view currently needs to layout some
    child views.
    
    @param {Boolean} isVisible if true assume view is visible even if it is not.
    @returns {SC.View} receiver
  */
  layoutIfNeeded: function(isVisible) {
    if (!isVisible) isVisible = this.get('isVisibleInWindow');
    if (isVisible && this.get('needsLayout')) {
      this.set('needsLayout', NO);
      this.layoutChildViews();
    }
    return this ;
  },

  /**
    Applies the current layout to the layer.  This method is usually only
    called once per runloop.  You can override this method to provide your 
    own layout updating method if you want, though usually the better option
    is to override the layout method from the parent view.
    
    The default implementation of this method simply calls the applyLayout()
    method on the views that need layout.
    
    @returns {void}
  */
  layoutChildViews: function() {
    var set = this._needLayoutViews, len = set ? set.length : 0, idx;
    var view, context, layer;
    for(idx=0;idx<len;idx++) {
      view = set[idx];
      if(!(layer = view.get('layer'))) continue ; // nothing to do
      
      context = view.renderContext(layer);
      view.renderLayout(context);
      context.update();
    }
    view = context = layer = null ; // cleanup
    set.clear(); // reset & reuse
  },
  
  /**
    Default method called by the layout view to actually apply the current
    layout to the layer.  The default implementation simply assigns the 
    current layoutStyle to the layer.  This method is also called whenever
    the layer is first created.
    
    @param {SC.RenderContext} the render context
    @returns {void}
  */
  renderLayout: function(context) {
    context.addStyle(this.get('layoutStyle'));
  }
    
  
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
      SC.ViewDesigner.didLoadDesign(ret, this, SC.$A(arguments));
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
    if (childViews === this.superclass.prototype.childViews) childViews = [];
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
  
  views: {},
  
  /**
    Called by the runloop at the end of the runloop to update any scheduled
    view queues.  Returns YES if some items were flushed from the queue.
  */
  flushPendingQueues: function() {
    return this.runLoopQueue.flush() ;
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
    
    // flushes all queues in order.  Return YES if any of the queus actually
    // had something to do, so that this will repeat.
    flush: function() {
      var needsFlush = NO, order = this.order, len = order.length, idx;
      for(idx=0;idx<len;idx++) {
        if (this.flushQueue(order[idx])) needsFlush = YES;
      }
      return needsFlush;
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
    
    order: [SC.DISPLAY_LOCATION_QUEUE, SC.UPDATE_CHILD_LAYOUT_QUEUE, SC.DISPLAY_LAYOUT_QUEUE, SC.DISPLAY_UPDATE_QUEUE]
  }
    
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
  }.property().outlet();
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
